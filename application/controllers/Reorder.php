<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Reorder extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Reorder_model');
        $this->load->model('Medicine_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/reorder - Get reorder levels
     * GET /api/pharmacy/reorder/alerts - Get low stock alerts
     */
    public function index() {
        // Check permission for viewing reorder levels
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        $filters = array();
        
        if ($this->input->get('auto_reorder')) {
            $filters['auto_reorder'] = $this->input->get('auto_reorder') === 'true';
        }
        
        $reorder_levels = $this->Reorder_model->get_all($filters);
        $this->success($reorder_levels);
    }

    /**
     * GET /api/pharmacy/reorder/alerts - Get low stock alerts
     */
    public function alerts() {
        // Check permission for viewing reorder alerts
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        $auto_reorder_only = $this->input->get('auto_reorder_only') === 'true';
        $alerts = $this->Reorder_model->get_low_stock_alerts($auto_reorder_only);
        $this->success($alerts);
    }

    /**
     * GET /api/pharmacy/reorder/medicine/:medicine_id - Get reorder level for medicine
     * POST /api/pharmacy/reorder/medicine/:medicine_id - Set reorder level
     */
    public function medicine($medicine_id = null) {
        if (!$medicine_id) {
            $this->error('Medicine ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing reorder levels
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $reorder_level = $this->Reorder_model->get_by_medicine_id($medicine_id);
            
            if ($reorder_level) {
                $this->success($reorder_level);
            } else {
                $this->success(null, 'No reorder level set for this medicine');
            }
            
        } elseif ($method === 'POST' || $method === 'PUT') {
            // Check permission for setting reorder levels
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->set_reorder_level($medicine_id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Set reorder level for medicine
     * POST /api/pharmacy/reorder/medicine/:medicine_id
     */
    public function set_reorder_level($medicine_id) {
        try {
            $data = $this->get_request_data();
            
            // Validate medicine exists
            $medicine = $this->Medicine_model->get_by_id($medicine_id);
            if (!$medicine) {
                $this->error('Medicine not found', 404);
                return;
            }
            
            // Validate required fields
            if (!isset($data['minimum_stock']) || $data['minimum_stock'] < 0) {
                $this->error('Valid minimum stock is required', 400);
                return;
            }
            
            if (!isset($data['reorder_quantity']) || $data['reorder_quantity'] <= 0) {
                $this->error('Valid reorder quantity is required', 400);
                return;
            }
            
            $result = $this->Reorder_model->set_reorder_level($medicine_id, $data);
            
            if ($result) {
                $reorder_level = $this->Reorder_model->get_by_medicine_id($medicine_id);
                
                // Log reorder level setting
                $this->load->library('audit_log');
                $minimum_stock = $data['minimum_stock'] ?? 0;
                $reorder_quantity = $data['reorder_quantity'] ?? 0;
                $this->audit_log->logUpdate('Pharmacy', 'Reorder Level', $result, "Set reorder level for Medicine ID: {$medicine_id}, Minimum: {$minimum_stock}, Reorder Qty: {$reorder_quantity}");
                
                $this->success($reorder_level, 'Reorder level set successfully');
            } else {
                $this->error('Failed to set reorder level', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Reorder level set error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/pharmacy/reorder/generate-pos - Generate auto-reorder purchase orders
     */
    public function generate_pos() {
        try {
            $pos_generated = $this->Reorder_model->generate_auto_reorder_pos();
            
            $count = count($pos_generated);
            
            // Log auto-reorder PO generation
            $this->load->library('audit_log');
            $this->audit_log->log('Pharmacy', 'Auto-Reorder', null, "Generated {$count} auto-reorder purchase orders");
            
            $this->success(array(
                'pos_generated' => $pos_generated,
                'count' => $count
            ), 'Generated ' . $count . ' purchase order(s)');
        } catch (Exception $e) {
            log_message('error', 'Auto-reorder PO generation error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

