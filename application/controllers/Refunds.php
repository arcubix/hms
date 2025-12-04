<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Refunds extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Refund_model');
        $this->load->model('Sale_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/refunds - Get all refunds
     * POST /api/pharmacy/refunds - Create refund
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('sale_id')) {
                $filters['sale_id'] = $this->input->get('sale_id');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
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
            
            $refunds = $this->Refund_model->get_all($filters);
            $this->success($refunds);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create refund
     * POST /api/pharmacy/refunds
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['sale_id'])) {
                $this->error('Sale ID is required', 400);
                return;
            }
            
            // Get sale
            $sale = $this->Sale_model->get_by_id($data['sale_id']);
            if (!$sale) {
                $this->error('Sale not found', 404);
                return;
            }
            
            // Validate items
            if (empty($data['items']) || !is_array($data['items'])) {
                $this->error('Refund items are required', 400);
                return;
            }
            
            // Validate refund items and check quantities
            $total_refund = 0;
            foreach ($data['items'] as $item) {
                if (empty($item['sale_item_id']) || empty($item['quantity']) || empty($item['subtotal'])) {
                    $this->error('Each refund item must have sale_item_id, quantity, and subtotal', 400);
                    return;
                }
                
                // Get original sale item to check quantities
                $this->load->database();
                $this->db->select('si.*, m.name as medicine_name');
                $this->db->from('sale_items si');
                $this->db->join('medicines m', 'si.medicine_id = m.id', 'left');
                $this->db->where('si.id', $item['sale_item_id']);
                $this->db->where('si.sale_id', $data['sale_id']); // Ensure it belongs to this sale
                $sale_item = $this->db->get()->row_array();
                
                if (!$sale_item) {
                    $this->error('Sale item not found', 400);
                    return;
                }
                
                // Check how much of this item has already been returned
                // Count all refunds except cancelled/voided ones
                $this->db->select_sum('refund_items.quantity');
                $this->db->from('refund_items');
                $this->db->join('refunds', 'refund_items.refund_id = refunds.id');
                $this->db->where('refund_items.sale_item_id', $item['sale_item_id']);
                $this->db->where('refunds.status !=', 'Cancelled');
                $this->db->where('refunds.status !=', 'Voided');
                $already_returned = $this->db->get()->row()->quantity ?? 0;
                
                // Calculate remaining quantity
                $original_quantity = $sale_item['quantity'];
                $remaining_quantity = $original_quantity - $already_returned;
                
                // Validate quantity
                if ($item['quantity'] > $remaining_quantity) {
                    $medicine_name = $sale_item['medicine_name'] ?? 'item';
                    $this->error("Cannot return {$item['quantity']} units of {$medicine_name}. Only {$remaining_quantity} units remaining.", 400);
                    return;
                }
                
                $total_refund += $item['subtotal'];
            }
            
            // Check existing refunds total amount (excluding cancelled/voided)
            $this->db->select_sum('total_amount');
            $this->db->from('refunds');
            $this->db->where('sale_id', $data['sale_id']);
            $this->db->where('status !=', 'Cancelled');
            $this->db->where('status !=', 'Voided');
            $existing_refunds = $this->db->get()->row()->total_amount ?? 0;
            
            if (($existing_refunds + $total_refund) > $sale['total_amount']) {
                $this->error('Refund amount cannot exceed sale amount. Remaining refundable: ' . ($sale['total_amount'] - $existing_refunds), 400);
                return;
            }
            
            // Set processed_by
            if ($this->user) {
                $data['processed_by'] = $this->user['id'];
            }
            
            // Set refund date if not provided
            if (empty($data['refund_date'])) {
                $data['refund_date'] = date('Y-m-d H:i:s');
            }
            
            // Determine refund type
            if (($existing_refunds + $total_refund) >= $sale['total_amount']) {
                $data['refund_type'] = 'Full';
            } else {
                $data['refund_type'] = 'Partial';
            }
            
            // Process refund
            $result = $this->Refund_model->create($data);
            
            if ($result['success']) {
                $refund = $this->Refund_model->get_by_id($result['refund_id']);
                
                // Log refund creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Pharmacy', 'Refund', $result['refund_id'], "Processed refund for sale ID: {$data['sale_id']}, Amount: {$total_refund}");
                
                $this->success($refund, 'Refund processed successfully', 201);
            } else {
                $this->error($result['message'] ?? 'Failed to process refund', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Refund create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/refunds/:id - Get refund by ID
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Refund ID required', 400);
            return;
        }
        
        $refund = $this->Refund_model->get_by_id($id);
        
        if ($refund) {
            $this->success($refund);
        } else {
            $this->error('Refund not found', 404);
        }
    }

    /**
     * POST /api/pharmacy/refunds/:id/complete - Complete refund
     */
    public function complete($id = null) {
        if (!$id) {
            $this->error('Refund ID required', 400);
            return;
        }
        
        $result = $this->Refund_model->complete($id);
        
        if ($result) {
            $refund = $this->Refund_model->get_by_id($id);
            $this->success($refund, 'Refund completed successfully');
        } else {
            $this->error('Failed to complete refund', 400);
        }
    }

    /**
     * GET /api/pharmacy/refunds/sale/:sale_id - Get refunds for a sale
     */
    public function get_by_sale($sale_id = null) {
        if (!$sale_id) {
            $this->error('Sale ID required', 400);
            return;
        }
        
        $refunds = $this->Refund_model->get_all(array('sale_id' => $sale_id));
        $this->success($refunds);
    }
}

