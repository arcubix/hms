<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Medicines extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Medicine_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/medicines - Get all medicines
     * POST /api/medicines - Create medicine
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('category')) {
                $filters['category'] = $this->input->get('category');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            $medicines = $this->Medicine_model->get_all($filters);
            $this->success($medicines);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create medicine
     * POST /api/medicines
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['name'])) {
                $this->error('Medicine name is required', 400);
                return;
            }

            $medicine_id = $this->Medicine_model->create($data);
            
            if ($medicine_id) {
                $medicine = $this->Medicine_model->get_by_id($medicine_id);
                
                // Log medicine creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Pharmacy', 'Medicine', $medicine_id, "Created medicine: {$data['name']}");
                
                $this->success($medicine, 'Medicine created successfully', 201);
            } else {
                $this->error('Failed to create medicine', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Medicine create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/medicines/:id - Get single medicine
     * PUT /api/medicines/:id - Update medicine
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Medicine ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $medicine = $this->Medicine_model->get_by_id($id);
            
            if ($medicine) {
                $this->success($medicine);
            } else {
                $this->error('Medicine not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update medicine
     * PUT /api/medicines/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            if ($this->Medicine_model->update($id, $data)) {
                $medicine = $this->Medicine_model->get_by_id($id);
                $this->success($medicine, 'Medicine updated successfully');
            } else {
                $this->error('Failed to update medicine', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Medicine update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/medicines/search-with-stock - Search medicines with stock information
     */
    public function search_with_stock() {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }

        try {
            $search_term = $this->input->get('search') ?? '';
            $include_out_of_stock = $this->input->get('include_out_of_stock') === 'true';
            
            $this->load->model('Medicine_model');
            $medicines = $this->Medicine_model->search_with_stock($search_term, $include_out_of_stock);
            
            $this->success($medicines);
        } catch (Exception $e) {
            log_message('error', 'Search medicines with stock error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

