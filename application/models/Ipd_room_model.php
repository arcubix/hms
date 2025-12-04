<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_room_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all rooms with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            ir.*,
            f.floor_number,
            f.floor_name,
            f.building_name,
            ia.ipd_number,
            ia.uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('ipd_rooms ir');
        $this->db->join('floors f', 'f.id = ir.floor_id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.room_id = ir.id AND ia.status != "discharged"', 'left');
        $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
        
        // Apply filters
        if (!empty($filters['room_type'])) {
            $this->db->where('ir.room_type', $filters['room_type']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('ir.status', $filters['status']);
        }
        
        if (!empty($filters['floor_id'])) {
            $this->db->where('ir.floor_id', $filters['floor_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ir.room_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ir.room_number', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get room by ID with patient info
     */
    public function get_by_id($id) {
        $this->db->select('
            ir.*,
            f.floor_number,
            f.floor_name,
            f.building_name,
            ia.id as admission_id,
            ia.ipd_number,
            ia.uhid,
            p.id as patient_id,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('ipd_rooms ir');
        $this->db->join('floors f', 'f.id = ir.floor_id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.room_id = ir.id AND ia.status != "discharged"', 'left');
        $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
        $this->db->where('ir.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get available rooms
     */
    public function get_available($filters = []) {
        $filters['status'] = 'available';
        return $this->get_all($filters);
    }

    /**
     * Create new room
     */
    public function create($data) {
        $room_data = array(
            'room_number' => $data['room_number'],
            'room_type' => $data['room_type'] ?? 'Private',
            'floor_id' => $data['floor_id'] ?? null,
            'building' => $data['building'] ?? null,
            'status' => $data['status'] ?? 'available',
            'daily_rate' => $data['daily_rate'] ?? 0.00,
            'facilities' => isset($data['facilities']) ? json_encode($data['facilities']) : null,
            'amenities' => isset($data['amenities']) ? json_encode($data['amenities']) : null,
            'capacity' => $data['capacity'] ?? 1,
            'description' => $data['description'] ?? null,
            'attendant_bed' => isset($data['attendant_bed']) ? ($data['attendant_bed'] ? 1 : 0) : 0,
            'remarks' => $data['remarks'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('ipd_rooms', $room_data);
        return $this->db->insert_id();
    }

    /**
     * Update room
     */
    public function update($id, $data) {
        if (isset($data['facilities']) && is_array($data['facilities'])) {
            $data['facilities'] = json_encode($data['facilities']);
        }
        
        if (isset($data['amenities']) && is_array($data['amenities'])) {
            $data['amenities'] = json_encode($data['amenities']);
        }
        
        // Handle attendant_bed boolean conversion
        if (isset($data['attendant_bed'])) {
            $data['attendant_bed'] = $data['attendant_bed'] ? 1 : 0;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_rooms', $data);
    }

    /**
     * Delete room
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_rooms');
    }

    /**
     * Assign room to admission
     */
    public function assign($room_id, $admission_id) {
        $this->db->where('id', $room_id);
        return $this->db->update('ipd_rooms', array(
            'status' => 'occupied',
            'current_admission_id' => $admission_id
        ));
    }

    /**
     * Release room from admission
     */
    public function release($room_id) {
        $this->db->where('id', $room_id);
        return $this->db->update('ipd_rooms', array(
            'status' => 'available',
            'current_admission_id' => null
        ));
    }
}

