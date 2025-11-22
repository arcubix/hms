<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Doctor_room_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all doctor room assignments with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('dr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty, 
                          r.room_number, r.room_name, r.room_type, 
                          rec.reception_code, rec.reception_name,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_rooms dr');
        $this->db->join('doctors d', 'dr.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 'dr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        
        // Apply filters
        if (!empty($filters['doctor_id'])) {
            $this->db->where('dr.doctor_id', $filters['doctor_id']);
        }
        
        if (!empty($filters['room_id'])) {
            $this->db->where('dr.room_id', $filters['room_id']);
        }
        
        if (!empty($filters['reception_id'])) {
            $this->db->where('dr.reception_id', $filters['reception_id']);
        }
        
        if (isset($filters['is_active'])) {
            $this->db->where('dr.is_active', $filters['is_active']);
        }
        
        $this->db->order_by('d.name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get doctor room assignment by ID
     */
    public function get_by_id($id) {
        $this->db->select('dr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty, 
                          r.room_number, r.room_name, r.room_type, r.floor_id,
                          rec.reception_code, rec.reception_name, rec.floor_id as reception_floor_id,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_rooms dr');
        $this->db->join('doctors d', 'dr.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 'dr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->where('dr.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get room assignment for a specific doctor
     */
    public function get_by_doctor($doctor_id) {
        $this->db->select('dr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty, 
                          r.room_number, r.room_name, r.room_type, r.floor_id,
                          rec.reception_code, rec.reception_name, rec.floor_id as reception_floor_id,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_rooms dr');
        $this->db->join('doctors d', 'dr.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 'dr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->where('dr.doctor_id', $doctor_id);
        $this->db->where('dr.is_active', 1);
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get doctor's room (alias for get_by_doctor)
     */
    public function get_doctor_room($doctor_id) {
        return $this->get_by_doctor($doctor_id);
    }

    /**
     * Create doctor room assignment
     */
    public function create($data) {
        // Check if doctor already has an active assignment
        $existing = $this->get_by_doctor($data['doctor_id']);
        if ($existing) {
            // Deactivate existing assignment
            $this->db->where('doctor_id', $data['doctor_id']);
            $this->db->update('doctor_rooms', array('is_active' => 0));
        }
        
        $insert_data = array(
            'doctor_id' => $data['doctor_id'],
            'room_id' => $data['room_id'],
            'reception_id' => $data['reception_id'],
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        );
        
        if ($this->db->insert('doctor_rooms', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update doctor room assignment
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['room_id'])) {
            $update_data['room_id'] = $data['room_id'];
        }
        
        if (isset($data['reception_id'])) {
            $update_data['reception_id'] = $data['reception_id'];
        }
        
        if (isset($data['is_active'])) {
            $update_data['is_active'] = (int)$data['is_active'];
        }
        
        $this->db->where('id', $id);
        return $this->db->update('doctor_rooms', $update_data);
    }

    /**
     * Delete doctor room assignment
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('doctor_rooms');
    }

    /**
     * Deactivate doctor room assignment
     */
    public function deactivate($doctor_id) {
        $this->db->where('doctor_id', $doctor_id);
        return $this->db->update('doctor_rooms', array('is_active' => 0));
    }
}

