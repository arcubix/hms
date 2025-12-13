<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Expense_categories extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Expense_category_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/expense-categories - Get all expense categories
     * POST /api/pharmacy/expense-categories - Create expense category
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing expense categories
            if (!$this->requirePermission('admin.view_users')) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            $categories = $this->Expense_category_model->get_all($filters);
            $this->success($categories);
            
        } elseif ($method === 'POST') {
            // Check permission for creating expense categories
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create expense category
     * POST /api/pharmacy/expense-categories
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['name'])) {
                $this->error('Category name is required', 400);
                return;
            }
            
            // Check if category name already exists
            $existing = $this->Expense_category_model->get_all(array('search' => $data['name']));
            foreach ($existing as $cat) {
                if (strtolower($cat['name']) === strtolower($data['name'])) {
                    $this->error('Category name already exists', 400);
                    return;
                }
            }
            
            // Set created_by from token
            $user = $this->get_user_from_token();
            if ($user) {
                $data['created_by'] = $user['id'];
            }
            
            $category_id = $this->Expense_category_model->create($data);
            
            if ($category_id) {
                $category = $this->Expense_category_model->get_by_id($category_id);
                
                // Log category creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Pharmacy', 'Expense Category', $category_id, "Created expense category: {$data['name']}");
                
                $this->success($category, 'Expense category created successfully', 201);
            } else {
                $this->error('Failed to create expense category', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Expense category create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/expense-categories/:id - Get single expense category
     * PUT /api/pharmacy/expense-categories/:id - Update expense category
     * DELETE /api/pharmacy/expense-categories/:id - Delete expense category
     */
    public function id($id = null) {
        if (!$id) {
            $this->error('Category ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing expense categories
            if (!$this->requirePermission('admin.view_users')) {
                return;
            }
            
            $category = $this->Expense_category_model->get_by_id($id);
            
            if ($category) {
                $this->success($category);
            } else {
                $this->error('Expense category not found', 404);
            }
            
        } elseif ($method === 'PUT') {
            // Check permission for updating expense categories
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->update($id);
            
        } elseif ($method === 'DELETE') {
            // Check permission for deleting expense categories
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->delete($id);
            
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update expense category
     * PUT /api/pharmacy/expense-categories/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            // Check if category exists
            $category = $this->Expense_category_model->get_by_id($id);
            if (!$category) {
                $this->error('Expense category not found', 404);
                return;
            }
            
            // Check if name is being changed and if new name already exists
            if (!empty($data['name']) && $data['name'] !== $category['name']) {
                $existing = $this->Expense_category_model->get_all(array('search' => $data['name']));
                foreach ($existing as $cat) {
                    if ($cat['id'] != $id && strtolower($cat['name']) === strtolower($data['name'])) {
                        $this->error('Category name already exists', 400);
                        return;
                    }
                }
            }
            
            $result = $this->Expense_category_model->update($id, $data);
            
            if ($result) {
                $updated_category = $this->Expense_category_model->get_by_id($id);
                
                // Log category update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Expense Category', $id, "Updated expense category");
                
                $this->success($updated_category, 'Expense category updated successfully');
            } else {
                $this->error('Failed to update expense category', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Expense category update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete expense category
     * DELETE /api/pharmacy/expense-categories/:id
     */
    private function delete($id) {
        try {
            // Check if category exists
            $category = $this->Expense_category_model->get_by_id($id);
            if (!$category) {
                $this->error('Expense category not found', 404);
                return;
            }
            
            // Check if category is used in expenses
            if ($this->Expense_category_model->is_used($id)) {
                $this->error('Cannot delete category that is used in expenses. Please deactivate it instead.', 400);
                return;
            }
            
            $result = $this->Expense_category_model->delete($id);
            
            if ($result) {
                // Log category deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Pharmacy', 'Expense Category', $id, "Deleted expense category: {$category['name']}");
                
                $this->success(null, 'Expense category deleted successfully');
            } else {
                $this->error('Failed to delete expense category', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Expense category delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

