<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Departments API Controller
 * Handles department management operations
 */
class Departments extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Department_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all departments or create new department
     * GET /api/departments
     * POST /api/departments
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing departments
                if (!$this->requirePermission('admin.view_users')) {
                    return;
                }
                
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'department_type' => $this->input->get('department_type')
                );
                
                $departments = $this->Department_model->get_all($filters);
                $this->success($departments);
            } elseif ($method === 'POST') {
                // Check permission for creating departments
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Departments index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single department, update, or delete
     * GET /api/departments/:id
     * PUT /api/departments/:id
     * DELETE /api/departments/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Department ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing department details
                if (!$this->requirePermission('admin.view_users')) {
                    return;
                }
                
                $department = $this->Department_model->get_by_id($id);
                
                if (!$department) {
                    $this->error('Department not found', 404);
                    return;
                }

                $this->success($department);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating departments
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                // Check permission for deleting departments
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Departments get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all department types
     * GET /api/departments/types
     */
    public function types() {
        try {
            $types = $this->Department_model->get_department_types();
            $this->success($types);
        } catch (Exception $e) {
            log_message('error', 'Departments types error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create department
     * POST /api/departments
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('department_name');
            $errors = array();

            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "The {$field} field is required.";
                }
            }

            // Validate department type
            if (isset($data['department_type']) && !in_array($data['department_type'], array('OPD', 'Emergency', 'IPD', 'Diagnostic', 'Other'))) {
                $errors['department_type'] = "Invalid department type.";
            }

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive'))) {
                $errors['status'] = "Invalid status value.";
            }

            if (!empty($errors)) {
                $this->error('Validation failed', 422, $errors);
                return;
            }

            // Check if department code already exists (if provided)
            if (!empty($data['department_code'])) {
                $existing_department = $this->Department_model->get_by_code($data['department_code']);
                if ($existing_department) {
                    $this->error('Department code already exists', 422, array('department_code' => 'Department code must be unique.'));
                    return;
                }
            }

            $data['created_by'] = $this->user['id'];
            $department_id = $this->Department_model->create($data);

            if ($department_id) {
                $department = $this->Department_model->get_by_id($department_id);
                
                // Log department creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Master Data', 'Department', $department_id, "Created department: {$data['department_name']}");
                
                $this->success($department, 'Department created successfully', 201);
            } else {
                $this->error('Failed to create department', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Departments create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update department
     * PUT /api/departments/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $department = $this->Department_model->get_by_id($id);
            
            if (!$department) {
                $this->error('Department not found', 404);
                return;
            }

            // Validate department type if provided
            if (isset($data['department_type']) && !in_array($data['department_type'], array('OPD', 'Emergency', 'IPD', 'Diagnostic', 'Other'))) {
                $this->error('Invalid department type', 422, array('department_type' => 'Invalid department type.'));
                return;
            }

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive'))) {
                $this->error('Invalid status value', 422, array('status' => 'Invalid status value.'));
                return;
            }

            // Check if department code already exists (for another department)
            if (isset($data['department_code']) && $data['department_code'] !== $department['department_code']) {
                $existing = $this->Department_model->get_by_code($data['department_code']);
                if ($existing && $existing['id'] != $id) {
                    $this->error('Department code already exists', 422, array('department_code' => 'Department code must be unique.'));
                    return;
                }
            }

            // Remove fields that shouldn't be updated
            unset($data['id']);
            unset($data['created_by']);
            unset($data['created_at']);

            $old_department = $department; // Store old data for audit log
            $result = $this->Department_model->update($id, $data);

            if ($result) {
                $department = $this->Department_model->get_by_id($id);
                
                // Log department update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Master Data', 'Department', $id, "Updated department: {$department['department_name']}", $old_department, $department);
                
                $this->success($department, 'Department updated successfully');
            } else {
                $this->error('Failed to update department', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Departments update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete department
     * DELETE /api/departments/:id
     */
    private function delete($id) {
        try {
            $department = $this->Department_model->get_by_id($id);
            
            if (!$department) {
                $this->error('Department not found', 404);
                return;
            }

            $result = $this->Department_model->delete($id);

            if ($result) {
                // Log department deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Master Data', 'Department', $id, "Deleted department: {$department['department_name']}");
                
                $this->success(null, 'Department deleted successfully');
            } else {
                $this->error('Cannot delete department. It may have rooms or receptions assigned to it.', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Departments delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

