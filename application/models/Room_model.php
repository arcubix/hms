<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Room_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all rooms with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('r.*, f.floor_number, f.floor_name, f.building_name, d.department_name, u.name as created_by_name');
        $this->db->from('rooms r');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->join('departments d', 'r.department_id = d.id', 'left');
        $this->db->join('users u', 'r.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('r.room_number', $search);
            $this->db->or_like('r.room_name', $search);
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
        
        // Apply room type filter
        if (!empty($filters['room_type'])) {
            $this->db->where('r.room_type', $filters['room_type']);
        }
        
        $this->db->order_by('f.building_name', 'ASC');
        $this->db->order_by('f.floor_number', 'ASC');
        $this->db->order_by('r.room_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get room by ID
     */
    public function get_by_id($id) {
        $this->db->select('r.*, f.floor_number, f.floor_name, f.building_name, d.department_name, u.name as created_by_name');
        $this->db->from('rooms r');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->join('departments d', 'r.department_id = d.id', 'left');
        $this->db->join('users u', 'r.created_by = u.id', 'left');
        $this->db->where('r.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create room
     */
    public function create($data) {
        $insert_data = array(
            'room_number' => $data['room_number'],
            'room_name' => isset($data['room_name']) ? $data['room_name'] : null,
            'floor_id' => $data['floor_id'],
            'department_id' => isset($data['department_id']) ? $data['department_id'] : null,
            'room_type' => isset($data['room_type']) ? $data['room_type'] : 'Consultation',
            'capacity' => isset($data['capacity']) ? (int)$data['capacity'] : 1,
            'equipment' => isset($data['equipment']) ? $data['equipment'] : null,
            'description' => isset($data['description']) ? $data['description'] : null,
            'status' => isset($data['status']) ? $data['status'] : 'Active',
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('rooms', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update room
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['room_number'])) {
            $update_data['room_number'] = $data['room_number'];
        }
        if (isset($data['room_name'])) {
            $update_data['room_name'] = $data['room_name'];
        }
        if (isset($data['floor_id'])) {
            $update_data['floor_id'] = $data['floor_id'];
        }
        if (isset($data['department_id'])) {
            $update_data['department_id'] = $data['department_id'];
        }
        if (isset($data['room_type'])) {
            $update_data['room_type'] = $data['room_type'];
        }
        if (isset($data['capacity'])) {
            $update_data['capacity'] = (int)$data['capacity'];
        }
        if (isset($data['equipment'])) {
            $update_data['equipment'] = $data['equipment'];
        }
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }

        $this->db->where('id', $id);
        return $this->db->update('rooms', $update_data);
    }

    /**
     * Delete room
     */
    public function delete($id) {
        // Check if room is assigned to doctors
        $this->db->where('room_id', $id);
        $assignments_count = $this->db->count_all_results('doctor_room_assignments');
        
        if ($assignments_count > 0) {
            return false; // Cannot delete room with doctor assignments
        }
        
        $this->db->where('id', $id);
        return $this->db->delete('rooms');
    }

    /**
     * Get all room types (distinct)
     */
    public function get_room_types() {
        $this->db->distinct();
        $this->db->select('room_type');
        $this->db->order_by('room_type', 'ASC');
        $query = $this->db->get('rooms');
        $results = $query->result_array();
        return array_column($results, 'room_type');
    }
}

