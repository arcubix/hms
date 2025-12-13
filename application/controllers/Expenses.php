<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Expenses extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Expense_model');
        $this->load->model('Expense_category_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/expenses - Get all expenses
     * POST /api/pharmacy/expenses - Create expense
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing expenses
            if (!$this->requirePermission('admin.view_users')) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('category_id')) {
                $filters['category_id'] = $this->input->get('category_id');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('payment_method')) {
                $filters['payment_method'] = $this->input->get('payment_method');
            }
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
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
            
            $expenses = $this->Expense_model->get_all($filters);
            $this->success($expenses);
            
        } elseif ($method === 'POST') {
            // Check permission for creating expenses
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create expense
     * POST /api/pharmacy/expenses
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['category_id'])) {
                $this->error('Category ID is required', 400);
                return;
            }
            
            if (empty($data['expense_date'])) {
                $this->error('Expense date is required', 400);
                return;
            }
            
            if (empty($data['description'])) {
                $this->error('Description is required', 400);
                return;
            }
            
            if (empty($data['amount']) || $data['amount'] <= 0) {
                $this->error('Valid amount is required', 400);
                return;
            }
            
            // Verify category exists
            $category = $this->Expense_category_model->get_by_id($data['category_id']);
            if (!$category) {
                $this->error('Expense category not found', 404);
                return;
            }
            
            // Set created_by from token
            $user = $this->get_user_from_token();
            if ($user) {
                $data['created_by'] = $user['id'];
            }
            
            $expense_id = $this->Expense_model->create($data);
            
            if ($expense_id) {
                $expense = $this->Expense_model->get_by_id($expense_id);
                
                // Log expense creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Pharmacy', 'Expense', $expense_id, "Created expense: {$expense['expense_number']} - PKR {$data['amount']}");
                
                $this->success($expense, 'Expense created successfully', 201);
            } else {
                $this->error('Failed to create expense', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Expense create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/expenses/:id - Get single expense
     * PUT /api/pharmacy/expenses/:id - Update expense
     * DELETE /api/pharmacy/expenses/:id - Delete expense
     */
    public function id($id = null) {
        if (!$id) {
            $this->error('Expense ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing expenses
            if (!$this->requirePermission('admin.view_users')) {
                return;
            }
            
            $expense = $this->Expense_model->get_by_id($id);
            
            if ($expense) {
                $this->success($expense);
            } else {
                $this->error('Expense not found', 404);
            }
            
        } elseif ($method === 'PUT') {
            // Check permission for updating expenses
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->update($id);
            
        } elseif ($method === 'DELETE') {
            // Check permission for deleting expenses
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->delete($id);
            
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update expense
     * PUT /api/pharmacy/expenses/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            // Check if expense exists
            $expense = $this->Expense_model->get_by_id($id);
            if (!$expense) {
                $this->error('Expense not found', 404);
                return;
            }
            
            // Verify category if being changed
            if (!empty($data['category_id'])) {
                $category = $this->Expense_category_model->get_by_id($data['category_id']);
                if (!$category) {
                    $this->error('Expense category not found', 404);
                    return;
                }
            }
            
            // Validate amount if provided
            if (isset($data['amount']) && $data['amount'] <= 0) {
                $this->error('Valid amount is required', 400);
                return;
            }
            
            $result = $this->Expense_model->update($id, $data);
            
            if ($result) {
                $updated_expense = $this->Expense_model->get_by_id($id);
                
                // Log expense update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Expense', $id, "Updated expense: {$updated_expense['expense_number']}");
                
                $this->success($updated_expense, 'Expense updated successfully');
            } else {
                $this->error('Failed to update expense', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Expense update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete expense
     * DELETE /api/pharmacy/expenses/:id
     */
    private function delete($id) {
        try {
            // Check if expense exists
            $expense = $this->Expense_model->get_by_id($id);
            if (!$expense) {
                $this->error('Expense not found', 404);
                return;
            }
            
            $result = $this->Expense_model->delete($id);
            
            if ($result) {
                // Log expense deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Pharmacy', 'Expense', $id, "Deleted expense: {$expense['expense_number']}");
                
                $this->success(null, 'Expense deleted successfully');
            } else {
                $this->error('Failed to delete expense', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Expense delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/expenses/summary - Get expense summary
     */
    public function summary() {
        // Check permission for viewing expenses
        if (!$this->requirePermission('admin.view_users')) {
            return;
        }
        
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $summary = array(
            'total_expenses' => $this->Expense_model->get_total_expenses($start_date, $end_date),
            'by_category' => $this->Expense_model->get_summary_by_category($start_date, $end_date)
        );
        
        $this->success($summary);
    }
}

