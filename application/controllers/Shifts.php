<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Shifts extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Shift_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/shifts - Get all shifts
     * POST /api/pharmacy/shifts - Open shift
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing shifts
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('cashier_id')) {
                $filters['cashier_id'] = $this->input->get('cashier_id');
            }
            
            if ($this->input->get('drawer_id')) {
                $filters['drawer_id'] = $this->input->get('drawer_id');
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
            
            $shifts = $this->Shift_model->get_all($filters);
            $this->success($shifts);
            
        } elseif ($method === 'POST') {
            // Check permission for opening shifts
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->open();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * POST /api/pharmacy/shifts - Open shift
     */
    public function open() {
        try {
            $data = $this->get_request_data();
            
            // Set cashier_id from current user
            if ($this->user) {
                $data['cashier_id'] = $this->user['id'];
            } else {
                $this->error('User not authenticated', 401);
                return;
            }
            
            // drawer_id is now optional - can be null
            if (empty($data['drawer_id'])) {
                $data['drawer_id'] = null;
            }
            
            $result = $this->Shift_model->open($data);
            
            if ($result['success']) {
                $shift = $this->Shift_model->get_by_id($result['shift_id']);
                
                // Log shift opening
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Pharmacy', 'Shift', $result['shift_id'], "Opened shift ID: {$result['shift_id']}");
                
                $this->success($shift, 'Shift opened successfully', 201);
            } else {
                $this->error($result['message'] ?? 'Failed to open shift', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Open shift error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/shifts/:id - Get shift by ID
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Shift ID required', 400);
            return;
        }
        
        $shift = $this->Shift_model->get_by_id($id);
        
        if ($shift) {
            $this->success($shift);
        } else {
            $this->error('Shift not found', 404);
        }
    }

    /**
     * POST /api/pharmacy/shifts/:id/close - Close shift
     */
    public function close($id = null) {
        if (!$id) {
            $this->error('Shift ID required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            $result = $this->Shift_model->close($id, $data);
            
            if ($result['success']) {
                $shift = $this->Shift_model->get_by_id($id);
                
                // Log shift closing
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Shift', $id, "Closed shift ID: {$id}");
                
                $this->success($shift, 'Shift closed successfully');
            } else {
                $this->error($result['message'] ?? 'Failed to close shift', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Close shift error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/shifts/current - Get current shift for cashier
     */
    public function current() {
        try {
            if (!$this->user) {
                $this->error('User not authenticated', 401);
                return;
            }
            
            $drawer_id = $this->input->get('drawer_id');
            // If drawer_id is not provided, pass null explicitly
            if (empty($drawer_id)) {
                $drawer_id = null;
            }
            
            $shift = $this->Shift_model->get_current_shift($this->user['id'], $drawer_id);
            
            if ($shift) {
                $this->success($shift);
            } else {
                $this->error('No open shift found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'Get current shift error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

