<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Department_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all departments with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('d.*, u.name as created_by_name');
        $this->db->from('departments d');
        $this->db->join('users u', 'd.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('d.department_code', $search);
            $this->db->or_like('d.department_name', $search);
            $this->db->or_like('d.short_name', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('d.status', $filters['status']);
        }
        
        // Apply department type filter
        if (!empty($filters['department_type'])) {
            $this->db->where('d.department_type', $filters['department_type']);
        }
        
        $this->db->order_by('d.department_name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get department by ID
     */
    public function get_by_id($id) {
        $this->db->select('d.*, u.name as created_by_name');
        $this->db->from('departments d');
        $this->db->join('users u', 'd.created_by = u.id', 'left');
        $this->db->where('d.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get department by code
     */
    public function get_by_code($code) {
        $query = $this->db->get_where('departments', array('department_code' => $code));
        return $query->row_array();
    }

    /**
     * Create department
     */
    public function create($data) {
        // Generate department code if not provided
        if (empty($data['department_code'])) {
            $data['department_code'] = $this->generate_department_code($data['department_name']);
        }
        
        $insert_data = array(
            'department_code' => $data['department_code'],
            'department_name' => $data['department_name'],
            'short_name' => isset($data['short_name']) ? $data['short_name'] : null,
            'description' => isset($data['description']) ? $data['description'] : null,
            'department_type' => isset($data['department_type']) ? $data['department_type'] : 'OPD',
            'status' => isset($data['status']) ? $data['status'] : 'Active',
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('departments', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update department
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['department_code'])) {
            $update_data['department_code'] = $data['department_code'];
        }
        if (isset($data['department_name'])) {
            $update_data['department_name'] = $data['department_name'];
        }
        if (isset($data['short_name'])) {
            $update_data['short_name'] = $data['short_name'];
        }
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
        }
        if (isset($data['department_type'])) {
            $update_data['department_type'] = $data['department_type'];
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }

        $this->db->where('id', $id);
        return $this->db->update('departments', $update_data);
    }

    /**
     * Delete department
     */
    public function delete($id) {
        // Check if department has rooms or receptions assigned
        $this->db->where('department_id', $id);
        $rooms_count = $this->db->count_all_results('rooms');
        
        $this->db->where('department_id', $id);
        $receptions_count = $this->db->count_all_results('receptions');
        
        if ($rooms_count > 0 || $receptions_count > 0) {
            return false; // Cannot delete department with rooms or receptions
        }
        
        $this->db->where('id', $id);
        return $this->db->delete('departments');
    }

    /**
     * Generate unique department code
     */
    public function generate_department_code($department_name) {
        // Get the last department code
        $this->db->select('department_code');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('departments');
        $last_department = $query->row_array();

        // Extract prefix from department name (first 3-4 uppercase letters)
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $department_name), 0, 4));
        if (empty($prefix)) {
            $prefix = 'DEPT';
        }

        // Find next number
        if ($last_department && preg_match('/' . $prefix . '-(\d+)/', $last_department['department_code'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            // Check for any code with this prefix
            $this->db->like('department_code', $prefix . '-', 'after');
            $this->db->order_by('id', 'DESC');
            $this->db->limit(1);
            $query = $this->db->get('departments');
            $last_with_prefix = $query->row_array();
            
            if ($last_with_prefix && preg_match('/' . $prefix . '-(\d+)/', $last_with_prefix['department_code'], $matches)) {
                $next_number = intval($matches[1]) + 1;
            } else {
                $next_number = 1;
            }
        }

        return $prefix . '-' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Get all department types (distinct)
     */
    public function get_department_types() {
        $this->db->distinct();
        $this->db->select('department_type');
        $this->db->order_by('department_type', 'ASC');
        $query = $this->db->get('departments');
        $results = $query->result_array();
        return array_column($results, 'department_type');
    }
}

