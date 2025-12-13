<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lab_test_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique test code
     */
    public function generate_test_code() {
        $prefix = 'LAB';
        $this->db->select('test_code');
        $this->db->from('lab_tests');
        $this->db->like('test_code', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_code = $query->row()->test_code;
            $last_num = intval(substr($last_code, strlen($prefix)));
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all lab tests with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('*');
        $this->db->from('lab_tests');
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('test_name', $search);
            $this->db->or_like('test_code', $search);
            $this->db->or_like('test_type', $search);
            $this->db->or_like('category', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['test_type'])) {
            $this->db->where('test_type', $filters['test_type']);
        }
        
        if (!empty($filters['category'])) {
            $this->db->where('category', $filters['category']);
        }
        
        if (!empty($filters['sample_type'])) {
            $this->db->where('sample_type', $filters['sample_type']);
        }
        
        if (isset($filters['min_price'])) {
            $this->db->where('price >=', $filters['min_price']);
        }
        
        if (isset($filters['max_price'])) {
            $this->db->where('price <=', $filters['max_price']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('status', $filters['status']);
        } else {
            // Default to active tests
            $this->db->where('status', 'Active');
        }
        
        if (!empty($filters['organization_id'])) {
            $this->db->where('organization_id', $filters['organization_id']);
        }
        
        $this->db->order_by('test_name', 'ASC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], isset($filters['offset']) ? $filters['offset'] : 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }
    
    /**
     * Get test categories
     */
    public function get_categories() {
        $this->db->select('DISTINCT category');
        $this->db->from('lab_tests');
        $this->db->where('category IS NOT NULL');
        $this->db->where('category !=', '');
        $this->db->where('status', 'Active');
        $this->db->order_by('category', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
    
    /**
     * Get test types
     */
    public function get_test_types() {
        $this->db->select('DISTINCT test_type');
        $this->db->from('lab_tests');
        $this->db->where('test_type IS NOT NULL');
        $this->db->where('test_type !=', '');
        $this->db->where('status', 'Active');
        $this->db->order_by('test_type', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
    
    /**
     * Get sample types
     */
    public function get_sample_types() {
        $this->db->select('DISTINCT sample_type');
        $this->db->from('lab_tests');
        $this->db->where('sample_type IS NOT NULL');
        $this->db->where('sample_type !=', '');
        $this->db->where('status', 'Active');
        $this->db->order_by('sample_type', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get lab test by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('lab_tests', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Create lab test
     */
    public function create($data) {
        // Generate test code if not provided
        if (empty($data['test_code'])) {
            $data['test_code'] = $this->generate_test_code();
        }
        
        if ($this->db->insert('lab_tests', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update lab test
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('lab_tests', $data);
    }

    /**
     * Delete lab test (soft delete by setting status)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('lab_tests', array('status' => 'Inactive'));
    }
}

