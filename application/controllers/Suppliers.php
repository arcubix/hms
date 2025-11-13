<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Suppliers extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Supplier_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/suppliers - Get all suppliers
     * POST /api/pharmacy/suppliers - Create supplier
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('limit')) {
                $filters['limit'] = (int)$this->input->get('limit');
            }
            
            if ($this->input->get('offset')) {
                $filters['offset'] = (int)$this->input->get('offset');
            }
            
            $suppliers = $this->Supplier_model->get_all($filters);
            $this->success($suppliers);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create supplier
     * POST /api/pharmacy/suppliers
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['name'])) {
                $this->error('Supplier name is required', 400);
                return;
            }
            
            if (empty($data['phone'])) {
                $this->error('Phone number is required', 400);
                return;
            }
            
            // Set created_by
            if ($this->user) {
                $data['created_by'] = $this->user['id'];
            }
            
            $supplier_id = $this->Supplier_model->create($data);
            
            if ($supplier_id) {
                $supplier = $this->Supplier_model->get_by_id($supplier_id);
                $this->success($supplier, 'Supplier created successfully', 201);
            } else {
                $this->error('Failed to create supplier', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Supplier create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/suppliers/:id - Get supplier by ID
     * PUT /api/pharmacy/suppliers/:id - Update supplier
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Supplier ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $supplier = $this->Supplier_model->get_by_id($id);
            
            if ($supplier) {
                // Get performance stats
                $this->load->model('Supplier_model');
                $stats = $this->Supplier_model->get_performance_stats($id);
                $supplier['performance'] = $stats;
                
                $this->success($supplier);
            } else {
                $this->error('Supplier not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update supplier
     * PUT /api/pharmacy/suppliers/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            $result = $this->Supplier_model->update($id, $data);
            
            if ($result) {
                $supplier = $this->Supplier_model->get_by_id($id);
                $this->success($supplier, 'Supplier updated successfully');
            } else {
                $this->error('Failed to update supplier', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Supplier update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/suppliers/:id/performance - Get supplier performance
     */
    public function performance($id = null) {
        if (!$id) {
            $this->error('Supplier ID required', 400);
            return;
        }
        
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $stats = $this->Supplier_model->get_performance_stats($id, $start_date, $end_date);
        $this->success($stats);
    }

    /**
     * GET /api/pharmacy/suppliers/low-credit - Get suppliers with low credit availability
     */
    public function low_credit() {
        $threshold = (int)($this->input->get('threshold') ?? 80);
        $suppliers = $this->Supplier_model->get_low_credit_suppliers($threshold);
        $this->success($suppliers);
    }
}

