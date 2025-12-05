<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Stock_adjustments extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Stock_adjustment_model');
        $this->load->model('Medicine_model');
        $this->load->model('Medicine_stock_model');
        
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/stock-adjustments - Get all adjustments
     * POST /api/pharmacy/stock-adjustments - Create adjustment
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing stock adjustments
            if (!$this->requirePermission('admin.view_users')) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('medicine_id')) {
                $filters['medicine_id'] = $this->input->get('medicine_id');
            }
            
            if ($this->input->get('adjustment_type')) {
                $filters['adjustment_type'] = $this->input->get('adjustment_type');
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
            
            $adjustments = $this->Stock_adjustment_model->get_all($filters);
            $this->success($adjustments);
            
        } elseif ($method === 'POST') {
            // Check permission for creating stock adjustments
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create stock adjustment
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['medicine_id'])) {
                $this->error('Medicine ID is required', 400);
                return;
            }
            
            if (empty($data['adjustment_type'])) {
                $this->error('Adjustment type is required', 400);
                return;
            }
            
            if (empty($data['quantity']) || $data['quantity'] <= 0) {
                $this->error('Valid quantity is required', 400);
                return;
            }
            
            if (empty($data['reason'])) {
                $this->error('Reason is required', 400);
                return;
            }
            
            // Validate medicine exists
            $medicine = $this->Medicine_model->get_by_id($data['medicine_id']);
            if (!$medicine) {
                $this->error('Medicine not found', 404);
                return;
            }
            
            // Validate stock_id if provided
            if (!empty($data['stock_id'])) {
                $stock = $this->Medicine_stock_model->get_by_id($data['stock_id']);
                if (!$stock || $stock['medicine_id'] != $data['medicine_id']) {
                    $this->error('Invalid stock batch', 400);
                    return;
                }
            }
            
            // Set requested_by
            if ($this->user) {
                $data['requested_by'] = $this->user['id'];
            }
            
            $adjustment_id = $this->Stock_adjustment_model->create($data);
            
            if ($adjustment_id) {
                $adjustment = $this->Stock_adjustment_model->get_by_id($adjustment_id);
                
                // Log stock adjustment creation
                $this->load->library('audit_log');
                $adjustment_type = $data['adjustment_type'] ?? 'Unknown';
                $quantity = $data['quantity'] ?? 0;
                $reason = $data['reason'] ?? 'No reason provided';
                $this->audit_log->logCreate('Pharmacy', 'Stock Adjustment', $adjustment_id, "Created stock adjustment: {$adjustment_type} for Medicine ID: {$data['medicine_id']}, Quantity: {$quantity}, Reason: {$reason}");
                
                $this->success($adjustment, 'Stock adjustment created successfully', 201);
            } else {
                $this->error('Failed to create adjustment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock adjustment create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/stock-adjustments/:id - Get single adjustment
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Adjustment ID required', 400);
            return;
        }
        
        $adjustment = $this->Stock_adjustment_model->get_by_id($id);
        
        if ($adjustment) {
            $this->success($adjustment);
        } else {
            $this->error('Adjustment not found', 404);
        }
    }

    /**
     * POST /api/pharmacy/stock-adjustments/:id/approve - Approve adjustment
     */
    public function approve($id = null) {
        if (!$id) {
            $this->error('Adjustment ID required', 400);
            return;
        }
        
        if (!$this->user) {
            $this->error('Unauthorized', 401);
            return;
        }
        
        try {
            $old_adjustment = $this->Stock_adjustment_model->get_by_id($id);
            if ($this->Stock_adjustment_model->approve($id, $this->user['id'])) {
                $adjustment = $this->Stock_adjustment_model->get_by_id($id);
                
                // Log stock adjustment approval
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Stock Adjustment', $id, "Approved stock adjustment ID: {$id}", $old_adjustment, $adjustment);
                
                $this->success($adjustment, 'Adjustment approved and stock updated');
            } else {
                $this->error('Failed to approve adjustment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock adjustment approve error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/pharmacy/stock-adjustments/:id/reject - Reject adjustment
     */
    public function reject($id = null) {
        if (!$id) {
            $this->error('Adjustment ID required', 400);
            return;
        }
        
        if (!$this->user) {
            $this->error('Unauthorized', 401);
            return;
        }
        
        try {
            $old_adjustment = $this->Stock_adjustment_model->get_by_id($id);
            if ($this->Stock_adjustment_model->reject($id, $this->user['id'])) {
                $adjustment = $this->Stock_adjustment_model->get_by_id($id);
                
                // Log stock adjustment rejection
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Stock Adjustment', $id, "Rejected stock adjustment ID: {$id}", $old_adjustment, $adjustment);
                
                $this->success($adjustment, 'Adjustment rejected');
            } else {
                $this->error('Failed to reject adjustment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock adjustment reject error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/stock-adjustments/pending - Get pending adjustments count
     */
    public function pending() {
        $count = $this->Stock_adjustment_model->get_pending_count();
        $this->success(array('count' => $count));
    }
}

