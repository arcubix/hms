<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Medicine_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique medicine code
     */
    public function generate_medicine_code() {
        $prefix = 'MED';
        $this->db->select('medicine_code');
        $this->db->from('medicines');
        $this->db->like('medicine_code', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_code = $query->row()->medicine_code;
            $last_num = intval(substr($last_code, strlen($prefix)));
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all medicines with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('*');
        $this->db->from('medicines');
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('name', $search);
            $this->db->or_like('generic_name', $search);
            $this->db->or_like('medicine_code', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['category'])) {
            $this->db->where('category', $filters['category']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('status', $filters['status']);
        } else {
            // Default to active medicines
            $this->db->where('status', 'Active');
        }
        
        $this->db->order_by('name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get medicine by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('medicines', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Create medicine
     */
    public function create($data) {
        // Generate medicine code if not provided
        if (empty($data['medicine_code'])) {
            $data['medicine_code'] = $this->generate_medicine_code();
        }
        
        if ($this->db->insert('medicines', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update medicine
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('medicines', $data);
    }

    /**
     * Delete medicine (soft delete by setting status)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('medicines', array('status' => 'Inactive'));
    }
}

