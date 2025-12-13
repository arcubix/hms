<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Expense_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique expense number
     */
    public function generate_expense_number() {
        $prefix = 'EXP-' . date('Y') . '-';
        $this->db->select('expense_number');
        $this->db->from('pharmacy_expenses');
        $this->db->like('expense_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->expense_number;
            $last_part = substr($last_number, strlen($prefix));
            $last_num = intval($last_part);
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all expenses with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('e.*, ec.name as category_name, ec.color as category_color, u.name as created_by_name');
        $this->db->from('pharmacy_expenses e');
        $this->db->join('pharmacy_expense_categories ec', 'e.category_id = ec.id', 'left');
        $this->db->join('users u', 'e.created_by = u.id', 'left');
        
        if (!empty($filters['category_id'])) {
            $this->db->where('e.category_id', $filters['category_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('e.status', $filters['status']);
        }
        
        if (!empty($filters['payment_method'])) {
            $this->db->where('e.payment_method', $filters['payment_method']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('e.expense_number', $search);
            $this->db->or_like('e.description', $search);
            $this->db->or_like('e.reference_number', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(e.expense_date) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(e.expense_date) <=', $filters['end_date']);
        }
        
        $this->db->order_by('e.expense_date', 'DESC');
        $this->db->order_by('e.id', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit']);
            if (!empty($filters['offset'])) {
                $this->db->offset($filters['offset']);
            }
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get expense by ID
     */
    public function get_by_id($id) {
        $this->db->select('e.*, ec.name as category_name, ec.color as category_color, u.name as created_by_name');
        $this->db->from('pharmacy_expenses e');
        $this->db->join('pharmacy_expense_categories ec', 'e.category_id = ec.id', 'left');
        $this->db->join('users u', 'e.created_by = u.id', 'left');
        $this->db->where('e.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create expense
     */
    public function create($data) {
        // Generate expense number if not provided
        if (empty($data['expense_number'])) {
            $data['expense_number'] = $this->generate_expense_number();
        }
        
        $allowed_fields = array(
            'expense_number', 'category_id', 'expense_date', 'description', 
            'amount', 'payment_method', 'reference_number', 'receipt_file', 
            'status', 'notes', 'created_by'
        );
        
        $filtered_data = array();
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $filtered_data[$field] = $data[$field];
            }
        }
        
        if (empty($filtered_data['status'])) {
            $filtered_data['status'] = 'Paid';
        }
        
        if (empty($filtered_data['payment_method'])) {
            $filtered_data['payment_method'] = 'Cash';
        }
        
        if ($this->db->insert('pharmacy_expenses', $filtered_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update expense
     */
    public function update($id, $data) {
        $allowed_fields = array(
            'category_id', 'expense_date', 'description', 'amount', 
            'payment_method', 'reference_number', 'receipt_file', 'status', 'notes'
        );
        
        $filtered_data = array();
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $filtered_data[$field] = $data[$field];
            }
        }
        
        $this->db->where('id', $id);
        return $this->db->update('pharmacy_expenses', $filtered_data);
    }

    /**
     * Delete expense
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('pharmacy_expenses');
    }

    /**
     * Get expense summary by category
     */
    public function get_summary_by_category($start_date = null, $end_date = null) {
        $this->db->select('ec.id, ec.name as category_name, ec.color, COUNT(e.id) as expense_count, SUM(e.amount) as total_amount');
        $this->db->from('pharmacy_expense_categories ec');
        $this->db->join('pharmacy_expenses e', 'ec.id = e.category_id', 'left');
        $this->db->where('ec.status', 'Active');
        
        if ($start_date) {
            $this->db->where('DATE(e.expense_date) >=', $start_date);
        }
        
        if ($end_date) {
            $this->db->where('DATE(e.expense_date) <=', $end_date);
        }
        
        $this->db->group_by('ec.id');
        $this->db->order_by('total_amount', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get total expenses for a date range
     */
    public function get_total_expenses($start_date = null, $end_date = null) {
        $this->db->select_sum('amount');
        $this->db->from('pharmacy_expenses');
        
        if ($start_date) {
            $this->db->where('DATE(expense_date) >=', $start_date);
        }
        
        if ($end_date) {
            $this->db->where('DATE(expense_date) <=', $end_date);
        }
        
        $query = $this->db->get();
        $result = $query->row();
        return $result ? floatval($result->amount) : 0.00;
    }
}

