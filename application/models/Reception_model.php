<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reception_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all receptions with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('r.*, f.floor_number, f.floor_name, f.building_name, d.department_name, u.name as created_by_name');
        $this->db->from('receptions r');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->join('departments d', 'r.department_id = d.id', 'left');
        $this->db->join('users u', 'r.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('r.reception_code', $search);
            $this->db->or_like('r.reception_name', $search);
            $this->db->or_like('r.location', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('r.status', $filters['status']);
        }
        
        // Apply floor filter
        if (!empty($filters['floor_id'])) {
            $this->db->where('r.floor_id', $filters['floor_id']);
        }
        
        // Apply department filter
        if (!empty($filters['department_id'])) {
            $this->db->where('r.department_id', $filters['department_id']);
        }
        
        $this->db->order_by('f.building_name', 'ASC');
        $this->db->order_by('f.floor_number', 'ASC');
        $this->db->order_by('r.reception_code', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get reception by ID
     */
    public function get_by_id($id) {
        $this->db->select('r.*, f.floor_number, f.floor_name, f.building_name, d.department_name, u.name as created_by_name');
        $this->db->from('receptions r');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->join('departments d', 'r.department_id = d.id', 'left');
        $this->db->join('users u', 'r.created_by = u.id', 'left');
        $this->db->where('r.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create reception
     */
    public function create($data) {
        // Generate reception code if not provided
        if (empty($data['reception_code'])) {
            $data['reception_code'] = $this->generate_reception_code();
        }
        
        $insert_data = array(
            'reception_code' => $data['reception_code'],
            'reception_name' => $data['reception_name'],
            'floor_id' => $data['floor_id'],
            'department_id' => isset($data['department_id']) ? $data['department_id'] : null,
            'location' => isset($data['location']) ? $data['location'] : null,
            'description' => isset($data['description']) ? $data['description'] : null,
            'status' => isset($data['status']) ? $data['status'] : 'Active',
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('receptions', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update reception
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['reception_code'])) {
            $update_data['reception_code'] = $data['reception_code'];
        }
        if (isset($data['reception_name'])) {
            $update_data['reception_name'] = $data['reception_name'];
        }
        if (isset($data['floor_id'])) {
            $update_data['floor_id'] = $data['floor_id'];
        }
        if (isset($data['department_id'])) {
            $update_data['department_id'] = $data['department_id'];
        }
        if (isset($data['location'])) {
            $update_data['location'] = $data['location'];
        }
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }

        $this->db->where('id', $id);
        return $this->db->update('receptions', $update_data);
    }

    /**
     * Delete reception
     */
    public function delete($id) {
        // Check if reception is assigned to doctors
        $this->db->where('reception_id', $id);
        $assignments_count = $this->db->count_all_results('doctor_room_assignments');
        
        if ($assignments_count > 0) {
            return false; // Cannot delete reception with doctor assignments
        }
        
        $this->db->where('id', $id);
        return $this->db->delete('receptions');
    }

    /**
     * Generate unique reception code
     */
    public function generate_reception_code() {
        // Get the last reception code
        $this->db->select('reception_code');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('receptions');
        $last_reception = $query->row_array();

        if ($last_reception && preg_match('/REC-(\d+)/', $last_reception['reception_code'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }

        return 'REC-' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    }
}

