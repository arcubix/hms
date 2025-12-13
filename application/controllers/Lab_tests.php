<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Lab_tests extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Lab_test_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/lab-tests - Get all lab tests
     * POST /api/lab-tests - Create lab test
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing lab tests
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports'])) {
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
            
            if ($this->input->get('sample_type')) {
                $filters['sample_type'] = $this->input->get('sample_type');
            }
            
            if ($this->input->get('min_price')) {
                $filters['min_price'] = $this->input->get('min_price');
            }
            
            if ($this->input->get('max_price')) {
                $filters['max_price'] = $this->input->get('max_price');
            }
            
            if ($this->user && isset($this->user['organization_id'])) {
                $filters['organization_id'] = $this->user['organization_id'];
            }
            
            $tests = $this->Lab_test_model->get_all($filters);
            $this->success($tests);
            
        } elseif ($method === 'POST') {
            // Check permission for creating lab tests
            if (!$this->requireAnyPermission(['lab_technician.create_lab_reports', 'lab_manager.create_lab_invoice'])) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create lab test
     * POST /api/lab-tests
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['test_name'])) {
                $this->error('Test name is required', 400);
                return;
            }

            $test_id = $this->Lab_test_model->create($data);
            
            if ($test_id) {
                $test = $this->Lab_test_model->get_by_id($test_id);
                
                // Log lab test creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Laboratory', 'Lab Test', $test_id, "Created lab test: {$data['test_name']}");
                
                $this->success($test, 'Lab test created successfully', 201);
            } else {
                $this->error('Failed to create lab test', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Lab test create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/lab-tests/:id - Get single lab test
     * PUT /api/lab-tests/:id - Update lab test
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Lab test ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing lab test details
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports'])) {
                return;
            }
            
            $test = $this->Lab_test_model->get_by_id($id);
            
            if ($test) {
                $this->success($test);
            } else {
                $this->error('Lab test not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            // Check permission for updating lab tests
            if (!$this->requireAnyPermission(['lab_technician.edit_lab_reports', 'lab_manager.edit_lab_reports'])) {
                return;
            }
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update lab test
     * PUT /api/lab-tests/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            $old_test = $this->Lab_test_model->get_by_id($id);
            
            if ($this->Lab_test_model->update($id, $data)) {
                $test = $this->Lab_test_model->get_by_id($id);
                
                // Log lab test update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Laboratory', 'Lab Test', $id, "Updated lab test: {$test['test_name']}", $old_test, $test);
                
                $this->success($test, 'Lab test updated successfully');
            } else {
                $this->error('Failed to update lab test', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Lab test update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get test categories
     * GET /api/lab-tests/categories
     */
    public function categories() {
        try {
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                return;
            }
            
            $categories = $this->Lab_test_model->get_categories();
            $this->success($categories);
        } catch (Exception $e) {
            log_message('error', 'Lab test categories error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get test types
     * GET /api/lab-tests/types
     */
    public function types() {
        try {
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                return;
            }
            
            $types = $this->Lab_test_model->get_test_types();
            $this->success($types);
        } catch (Exception $e) {
            log_message('error', 'Lab test types error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get sample types
     * GET /api/lab-tests/sample-types
     */
    public function sample_types() {
        try {
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                return;
            }
            
            $sample_types = $this->Lab_test_model->get_sample_types();
            $this->success($sample_types);
        } catch (Exception $e) {
            log_message('error', 'Lab test sample_types error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

