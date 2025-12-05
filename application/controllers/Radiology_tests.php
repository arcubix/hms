<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Radiology_tests extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Radiology_test_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/radiology-tests - Get all radiology tests
     * POST /api/radiology-tests - Create radiology test
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing radiology tests
            if (!$this->requireAnyPermission(['radiology_manager.view_radiology_reports', 'radiology_technician.view_radiology_reports'])) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('test_type')) {
                $filters['test_type'] = $this->input->get('test_type');
            }
            
            if ($this->input->get('category')) {
                $filters['category'] = $this->input->get('category');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            $tests = $this->Radiology_test_model->get_all($filters);
            $this->success($tests);
            
        } elseif ($method === 'POST') {
            // Check permission for creating radiology tests
            if (!$this->requirePermission('radiology_technician.add_radiology_reports')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create radiology test
     * POST /api/radiology-tests
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['test_name'])) {
                $this->error('Test name is required', 400);
                return;
            }

            $test_id = $this->Radiology_test_model->create($data);
            
            if ($test_id) {
                $test = $this->Radiology_test_model->get_by_id($test_id);
                
                // Log radiology test creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Radiology', 'Radiology Test', $test_id, "Created radiology test: {$data['test_name']}");
                
                $this->success($test, 'Radiology test created successfully', 201);
            } else {
                $this->error('Failed to create radiology test', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Radiology test create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/radiology-tests/:id - Get single radiology test
     * PUT /api/radiology-tests/:id - Update radiology test
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Radiology test ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing radiology test details
            if (!$this->requireAnyPermission(['radiology_manager.view_radiology_reports', 'radiology_technician.view_radiology_reports'])) {
                return;
            }
            
            $test = $this->Radiology_test_model->get_by_id($id);
            
            if ($test) {
                $this->success($test);
            } else {
                $this->error('Radiology test not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            // Check permission for updating radiology tests
            if (!$this->requireAnyPermission(['radiology_manager.edit_radiology_report', 'radiology_technician.edit_radiology_procedures'])) {
                return;
            }
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update radiology test
     * PUT /api/radiology-tests/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            $old_test = $this->Radiology_test_model->get_by_id($id);
            
            if ($this->Radiology_test_model->update($id, $data)) {
                $test = $this->Radiology_test_model->get_by_id($id);
                
                // Log radiology test update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Radiology', 'Radiology Test', $id, "Updated radiology test: {$test['test_name']}", $old_test, $test);
                
                $this->success($test, 'Radiology test updated successfully');
            } else {
                $this->error('Failed to update radiology test', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Radiology test update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

