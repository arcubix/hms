<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Price_overrides extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Price_override_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/price-overrides - Get all price overrides
     * POST /api/pharmacy/price-overrides - Create price override request
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('sale_id')) {
                $filters['sale_id'] = $this->input->get('sale_id');
            }
            
            if ($this->input->get('limit')) {
                $filters['limit'] = (int)$this->input->get('limit');
            }
            
            if ($this->input->get('offset')) {
                $filters['offset'] = (int)$this->input->get('offset');
            }
            
            $overrides = $this->Price_override_model->get_all($filters);
            $this->success($overrides);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * POST /api/pharmacy/price-overrides - Create price override request
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['medicine_id']) || empty($data['original_price']) || empty($data['override_price']) || empty($data['override_reason'])) {
                $this->error('Medicine ID, original price, override price, and reason are required', 400);
                return;
            }
            
            // Set requested_by from current user
            if ($this->user) {
                $data['requested_by'] = $this->user['id'];
            } else {
                $this->error('User not authenticated', 401);
                return;
            }
            
            $override_id = $this->Price_override_model->create($data);
            
            if ($override_id) {
                $override = $this->Price_override_model->get_by_id($override_id);
                $this->success($override, 'Price override request created successfully', 201);
            } else {
                $this->error('Failed to create price override request', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Price override create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/price-overrides/:id - Get override by ID
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Override ID required', 400);
            return;
        }
        
        $override = $this->Price_override_model->get_by_id($id);
        
        if ($override) {
            $this->success($override);
        } else {
            $this->error('Price override not found', 404);
        }
    }

    /**
     * POST /api/pharmacy/price-overrides/:id/approve - Approve price override
     */
    public function approve($id = null) {
        if (!$id) {
            $this->error('Override ID required', 400);
            return;
        }
        
        if (!$this->user) {
            $this->error('User not authenticated', 401);
            return;
        }
        
        // Check if user has manager role (you can customize this)
        if (!isset($this->user['role']) || $this->user['role'] !== 'manager') {
            $this->error('Manager authorization required', 403);
            return;
        }
        
        $result = $this->Price_override_model->approve($id, $this->user['id']);
        
        if ($result) {
            $override = $this->Price_override_model->get_by_id($id);
            $this->success($override, 'Price override approved successfully');
        } else {
            $this->error('Failed to approve price override', 400);
        }
    }

    /**
     * POST /api/pharmacy/price-overrides/:id/reject - Reject price override
     */
    public function reject($id = null) {
        if (!$id) {
            $this->error('Override ID required', 400);
            return;
        }
        
        if (!$this->user) {
            $this->error('User not authenticated', 401);
            return;
        }
        
        // Check if user has manager role
        if (!isset($this->user['role']) || $this->user['role'] !== 'manager') {
            $this->error('Manager authorization required', 403);
            return;
        }
        
        $result = $this->Price_override_model->reject($id, $this->user['id']);
        
        if ($result) {
            $override = $this->Price_override_model->get_by_id($id);
            $this->success($override, 'Price override rejected');
        } else {
            $this->error('Failed to reject price override', 400);
        }
    }

    /**
     * GET /api/pharmacy/price-overrides/pending - Get pending overrides
     */
    public function pending() {
        $overrides = $this->Price_override_model->get_pending();
        $this->success($overrides);
    }
}

