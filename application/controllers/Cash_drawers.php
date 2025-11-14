<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Cash_drawers extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Cash_drawer_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/cash-drawers - Get all drawers
     * POST /api/pharmacy/cash-drawers - Create/open drawer
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            $drawers = $this->Cash_drawer_model->get_all($filters);
            $this->success($drawers);
            
        } elseif ($method === 'POST') {
            $this->open();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * POST /api/pharmacy/cash-drawers - Open drawer
     */
    public function open() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['drawer_number'])) {
                $this->error('Drawer number is required', 400);
                return;
            }
            
            // Set opened_by from current user
            if ($this->user) {
                $data['opened_by'] = $this->user['id'];
            } else {
                $this->error('User not authenticated', 401);
                return;
            }
            
            $result = $this->Cash_drawer_model->open($data);
            
            if ($result['success']) {
                $drawer = $this->Cash_drawer_model->get_by_id($result['drawer_id']);
                $this->success($drawer, 'Drawer opened successfully', 201);
            } else {
                $this->error($result['message'] ?? 'Failed to open drawer', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Open drawer error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/cash-drawers/:id - Get drawer by ID
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Drawer ID required', 400);
            return;
        }
        
        $drawer = $this->Cash_drawer_model->get_by_id($id);
        
        if ($drawer) {
            // Get cash drops
            $drawer['drops'] = $this->Cash_drawer_model->get_drops($id);
            $this->success($drawer);
        } else {
            $this->error('Drawer not found', 404);
        }
    }

    /**
     * POST /api/pharmacy/cash-drawers/:id/close - Close drawer
     */
    public function close($id = null) {
        if (!$id) {
            $this->error('Drawer ID required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Set closed_by from current user
            if ($this->user) {
                $data['closed_by'] = $this->user['id'];
            } else {
                $this->error('User not authenticated', 401);
                return;
            }
            
            $result = $this->Cash_drawer_model->close($id, $data);
            
            if ($result['success']) {
                $drawer = $this->Cash_drawer_model->get_by_id($id);
                $this->success($drawer, 'Drawer closed successfully');
            } else {
                $this->error($result['message'] ?? 'Failed to close drawer', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Close drawer error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/cash-drawers/open - Get open drawer
     */
    public function open_drawer() {
        $drawer_number = $this->input->get('drawer_number');
        $drawer = $this->Cash_drawer_model->get_open_drawer($drawer_number);
        
        if ($drawer) {
            $this->success($drawer);
        } else {
            $this->error('No open drawer found', 404);
        }
    }

    /**
     * POST /api/pharmacy/cash-drawers/:id/drop - Record cash drop/pickup
     */
    public function drop($id = null) {
        if (!$id) {
            $this->error('Drawer ID required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['drop_type']) || empty($data['amount'])) {
                $this->error('Drop type and amount are required', 400);
                return;
            }
            
            // Set processed_by from current user
            if ($this->user) {
                $data['processed_by'] = $this->user['id'];
                $data['drawer_id'] = $id;
            } else {
                $this->error('User not authenticated', 401);
                return;
            }
            
            $drop_id = $this->Cash_drawer_model->record_drop($data);
            
            if ($drop_id) {
                $drop = $this->Cash_drawer_model->get_drops($id);
                $this->success($drop, 'Cash drop recorded successfully', 201);
            } else {
                $this->error('Failed to record cash drop', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Cash drop error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

