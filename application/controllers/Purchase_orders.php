<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Purchase_orders extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Purchase_order_model');
        $this->load->model('Stock_receipt_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/purchase-orders - Get all purchase orders
     * POST /api/pharmacy/purchase-orders - Create purchase order
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('supplier_id')) {
                $filters['supplier_id'] = $this->input->get('supplier_id');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('start_date')) {
                $filters['start_date'] = $this->input->get('start_date');
            }
            
            if ($this->input->get('end_date')) {
                $filters['end_date'] = $this->input->get('end_date');
            }
            
            if ($this->input->get('limit')) {
                $filters['limit'] = (int)$this->input->get('limit');
            }
            
            if ($this->input->get('offset')) {
                $filters['offset'] = (int)$this->input->get('offset');
            }
            
            $pos = $this->Purchase_order_model->get_all($filters);
            $this->success($pos);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create purchase order
     * POST /api/pharmacy/purchase-orders
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['supplier_id'])) {
                $this->error('Supplier ID is required', 400);
                return;
            }
            
            if (empty($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
                $this->error('At least one item is required', 400);
                return;
            }
            
            // Validate items
            foreach ($data['items'] as $item) {
                if (empty($item['medicine_id']) || empty($item['quantity']) || empty($item['unit_cost'])) {
                    $this->error('Each item must have medicine_id, quantity, and unit_cost', 400);
                    return;
                }
            }
            
            // Set created_by
            if ($this->user) {
                $data['created_by'] = $this->user['id'];
            }
            
            // Set order_date if not provided
            if (empty($data['order_date'])) {
                $data['order_date'] = date('Y-m-d');
            }
            
            $po_id = $this->Purchase_order_model->create($data);
            
            if ($po_id) {
                $po = $this->Purchase_order_model->get_by_id($po_id);
                
                // Log purchase order creation
                $this->load->library('audit_log');
                $supplier_id = $data['supplier_id'] ?? 'Unknown';
                $item_count = count($data['items'] ?? []);
                $this->audit_log->logCreate('Pharmacy', 'Purchase Order', $po_id, "Created purchase order for Supplier ID: {$supplier_id} with {$item_count} item(s)");
                
                $this->success($po, 'Purchase order created successfully', 201);
            } else {
                $this->error('Failed to create purchase order', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'PO create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/purchase-orders/:id - Get PO by ID
     * PUT /api/pharmacy/purchase-orders/:id - Update PO
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Purchase order ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $po = $this->Purchase_order_model->get_by_id($id);
            
            if ($po) {
                $this->success($po);
            } else {
                $this->error('Purchase order not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update purchase order
     * PUT /api/pharmacy/purchase-orders/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            $old_po = $this->Purchase_order_model->get_by_id($id);
            $result = $this->Purchase_order_model->update($id, $data);
            
            if ($result) {
                $po = $this->Purchase_order_model->get_by_id($id);
                
                // Log purchase order update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Purchase Order', $id, "Updated purchase order ID: {$id}", $old_po, $po);
                
                $this->success($po, 'Purchase order updated successfully');
            } else {
                $this->error('Failed to update purchase order', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'PO update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/pharmacy/purchase-orders/:id/approve - Approve purchase order
     */
    public function approve($id = null) {
        if (!$id) {
            $this->error('Purchase order ID required', 400);
            return;
        }
        
        if (!$this->user) {
            $this->error('User not authenticated', 401);
            return;
        }
        
        $old_po = $this->Purchase_order_model->get_by_id($id);
        $result = $this->Purchase_order_model->approve($id, $this->user['id']);
        
        if ($result) {
            $po = $this->Purchase_order_model->get_by_id($id);
            
            // Log purchase order approval
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('Pharmacy', 'Purchase Order', $id, "Approved purchase order ID: {$id}", $old_po, $po);
            
            $this->success($po, 'Purchase order approved successfully');
        } else {
            $this->error('Failed to approve purchase order', 400);
        }
    }

    /**
     * POST /api/pharmacy/purchase-orders/:id/cancel - Cancel purchase order
     */
    public function cancel($id = null) {
        if (!$id) {
            $this->error('Purchase order ID required', 400);
            return;
        }
        
        $data = $this->get_request_data();
        $reason = $data['reason'] ?? null;
        
        $old_po = $this->Purchase_order_model->get_by_id($id);
        $result = $this->Purchase_order_model->cancel($id, $reason);
        
        if ($result) {
            $po = $this->Purchase_order_model->get_by_id($id);
            
            // Log purchase order cancellation
            $this->load->library('audit_log');
            $reason_text = $reason ? " Reason: {$reason}" : "";
            $this->audit_log->logUpdate('Pharmacy', 'Purchase Order', $id, "Cancelled purchase order ID: {$id}{$reason_text}", $old_po, $po);
            
            $this->success($po, 'Purchase order cancelled successfully');
        } else {
            $this->error('Failed to cancel purchase order', 400);
        }
    }

    /**
     * POST /api/pharmacy/purchase-orders/:id/receive - Receive stock from purchase order
     */
    public function receive($id = null) {
        if (!$id) {
            $this->error('Purchase order ID required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Get PO
            $po = $this->Purchase_order_model->get_by_id($id);
            if (!$po) {
                $this->error('Purchase order not found', 404);
                return;
            }
            
            if ($po['status'] === 'Cancelled') {
                $this->error('Cannot receive stock from cancelled purchase order', 400);
                return;
            }
            
            // Validate items
            if (empty($data['items']) || !is_array($data['items'])) {
                $this->error('Receipt items are required', 400);
                return;
            }
            
            // Prepare receipt data
            $receipt_data = array(
                'purchase_order_id' => $id,
                'supplier_id' => $po['supplier_id'],
                'receipt_date' => $data['receipt_date'] ?? date('Y-m-d'),
                'received_by' => $this->user['id'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $this->user['id'] ?? null,
                'items' => array()
            );
            
            // Process items
            foreach ($data['items'] as $item) {
                if (empty($item['medicine_id']) || empty($item['batch_number']) || empty($item['expiry_date']) || empty($item['quantity'])) {
                    continue; // Skip invalid items
                }
                
                // Find corresponding PO item
                $po_item_id = null;
                foreach ($po['items'] as $po_item) {
                    if ($po_item['medicine_id'] == $item['medicine_id']) {
                        $po_item_id = $po_item['id'];
                        break;
                    }
                }
                
                $receipt_data['items'][] = array(
                    'medicine_id' => $item['medicine_id'],
                    'batch_number' => $item['batch_number'],
                    'manufacture_date' => $item['manufacture_date'] ?? null,
                    'expiry_date' => $item['expiry_date'],
                    'quantity' => (int)$item['quantity'],
                    'cost_price' => (float)$item['cost_price'],
                    'selling_price' => (float)$item['selling_price'],
                    'location' => $item['location'] ?? null,
                    'purchase_order_item_id' => $po_item_id
                );
            }
            
            if (empty($receipt_data['items'])) {
                $this->error('No valid items to receive', 400);
                return;
            }
            
            $receipt_id = $this->Stock_receipt_model->create($receipt_data);
            
            if ($receipt_id) {
                $receipt = $this->Stock_receipt_model->get_by_id($receipt_id);
                
                // Log purchase order receipt
                $this->load->library('audit_log');
                $item_count = count($receipt_data['items']);
                $this->audit_log->logUpdate('Pharmacy', 'Purchase Order', $id, "Received stock from purchase order ID: {$id} ({$item_count} items)", $po, $po);
                
                $this->success($receipt, 'Stock received successfully', 201);
            } else {
                $this->error('Failed to receive stock', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock receive error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

