<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Expense_category_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all expense categories
     */
    public function get_all($filters = array()) {
        $this->db->select('ec.*, u.name as created_by_name');
        $this->db->from('pharmacy_expense_categories ec');
        $this->db->join('users u', 'ec.created_by = u.id', 'left');
        
        if (!empty($filters['status'])) {
            $this->db->where('ec.status', $filters['status']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ec.name', $search);
            $this->db->or_like('ec.description', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ec.name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get category by ID
     */
    public function get_by_id($id) {
        $this->db->select('ec.*, u.name as created_by_name');
        $this->db->from('pharmacy_expense_categories ec');
        $this->db->join('users u', 'ec.created_by = u.id', 'left');
        $this->db->where('ec.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create expense category
     */
    public function create($data) {
        $allowed_fields = array('name', 'description', 'color', 'icon', 'status', 'created_by');
        $filtered_data = array();
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $filtered_data[$field] = $data[$field];
            }
        }
        
        if (empty($filtered_data['status'])) {
            $filtered_data['status'] = 'Active';
        }
        
        if ($this->db->insert('pharmacy_expense_categories', $filtered_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update expense category
     */
    public function update($id, $data) {
        $allowed_fields = array('name', 'description', 'color', 'icon', 'status');
        $filtered_data = array();
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $filtered_data[$field] = $data[$field];
            }
        }
        
        $this->db->where('id', $id);
        return $this->db->update('pharmacy_expense_categories', $filtered_data);
    }

    /**
     * Delete expense category (soft delete by setting status to Inactive)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('pharmacy_expense_categories', array('status' => 'Inactive'));
    }

    /**
     * Check if category is used in expenses
     */
    public function is_used($id) {
        $this->db->where('category_id', $id);
        $this->db->from('pharmacy_expenses');
        return $this->db->count_all_results() > 0;
    }
}

