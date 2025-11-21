<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Floor_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all floors with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('f.*, u.name as created_by_name');
        $this->db->from('floors f');
        $this->db->join('users u', 'f.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('f.floor_number', $search);
            $this->db->or_like('f.floor_name', $search);
            $this->db->or_like('f.building_name', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('f.status', $filters['status']);
        }
        
        // Apply building filter
        if (!empty($filters['building_name'])) {
            $this->db->where('f.building_name', $filters['building_name']);
        }
        
        $this->db->order_by('f.building_name', 'ASC');
        $this->db->order_by('f.floor_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get floor by ID
     */
    public function get_by_id($id) {
        $this->db->select('f.*, u.name as created_by_name');
        $this->db->from('floors f');
        $this->db->join('users u', 'f.created_by = u.id', 'left');
        $this->db->where('f.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create floor
     */
    public function create($data) {
        $insert_data = array(
            'floor_number' => $data['floor_number'],
            'floor_name' => isset($data['floor_name']) ? $data['floor_name'] : null,
            'building_name' => isset($data['building_name']) ? $data['building_name'] : null,
            'description' => isset($data['description']) ? $data['description'] : null,
            'status' => isset($data['status']) ? $data['status'] : 'Active',
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('floors', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update floor
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['floor_number'])) {
            $update_data['floor_number'] = $data['floor_number'];
        }
        if (isset($data['floor_name'])) {
            $update_data['floor_name'] = $data['floor_name'];
        }
        if (isset($data['building_name'])) {
            $update_data['building_name'] = $data['building_name'];
        }
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }

        $this->db->where('id', $id);
        return $this->db->update('floors', $update_data);
    }

    /**
     * Delete floor
     */
    public function delete($id) {
        // Check if floor has rooms or receptions
        $this->db->where('floor_id', $id);
        $rooms_count = $this->db->count_all_results('rooms');
        
        $this->db->where('floor_id', $id);
        $receptions_count = $this->db->count_all_results('receptions');
        
        if ($rooms_count > 0 || $receptions_count > 0) {
            return false; // Cannot delete floor with rooms or receptions
        }
        
        $this->db->where('id', $id);
        return $this->db->delete('floors');
    }

    /**
     * Get all building names (distinct)
     */
    public function get_buildings() {
        $this->db->distinct();
        $this->db->select('building_name');
        $this->db->where('building_name IS NOT NULL');
        $this->db->where('building_name !=', '');
        $this->db->order_by('building_name', 'ASC');
        $query = $this->db->get('floors');
        $results = $query->result_array();
        return array_column($results, 'building_name');
    }
}

