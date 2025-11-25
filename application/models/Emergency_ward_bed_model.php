<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Emergency_ward_bed_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all ward beds with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            ewb.*,
            ew.name as ward_name,
            ew.type as ward_type,
            ev.er_number,
            ev.uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('emergency_ward_beds ewb');
        $this->db->join('emergency_wards ew', 'ew.id = ewb.ward_id', 'left');
        $this->db->join('emergency_visits ev', 'ev.assigned_ward_bed_id = ewb.id', 'left');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        
        // Apply filters
        if (!empty($filters['ward_id'])) {
            $this->db->where('ewb.ward_id', $filters['ward_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('ewb.status', $filters['status']);
        }
        
        if (!empty($filters['bed_type'])) {
            $this->db->where('ewb.bed_type', $filters['bed_type']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ewb.bed_number', $search);
            $this->db->or_like('ew.name', $search);
            $this->db->or_like('p.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ew.name', 'ASC');
        $this->db->order_by('ewb.bed_number', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get beds by ward
     */
    public function get_by_ward($ward_id) {
        return $this->get_all(array('ward_id' => $ward_id));
    }

    /**
     * Get bed by ID with patient info
     */
    public function get_by_id($id) {
        $this->db->select('
            ewb.*,
            ew.name as ward_name,
            ew.type as ward_type,
            ev.id as visit_id,
            ev.er_number,
            ev.uhid,
            p.id as patient_id,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('emergency_ward_beds ewb');
        $this->db->join('emergency_wards ew', 'ew.id = ewb.ward_id', 'left');
        $this->db->join('emergency_visits ev', 'ev.assigned_ward_bed_id = ewb.id', 'left');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->where('ewb.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new bed
     */
    public function create($data) {
        $bed_data = array(
            'ward_id' => $data['ward_id'],
            'bed_number' => $data['bed_number'],
            'bed_type' => $data['bed_type'] ?? 'Regular',
            'status' => $data['status'] ?? 'Available',
            'maintenance_notes' => $data['maintenance_notes'] ?? null
        );
        
        $this->db->insert('emergency_ward_beds', $bed_data);
        return $this->db->insert_id();
    }

    /**
     * Update bed
     */
    public function update($id, $data) {
        $bed_data = array();
        
        if (isset($data['bed_number'])) $bed_data['bed_number'] = $data['bed_number'];
        if (isset($data['bed_type'])) $bed_data['bed_type'] = $data['bed_type'];
        if (isset($data['status'])) $bed_data['status'] = $data['status'];
        if (isset($data['maintenance_notes'])) $bed_data['maintenance_notes'] = $data['maintenance_notes'];
        
        if (!empty($bed_data)) {
            $this->db->where('id', $id);
            $this->db->update('emergency_ward_beds', $bed_data);
            return $this->db->affected_rows() > 0;
        }
        
        return false;
    }

    /**
     * Assign bed to patient
     */
    public function assign_patient($bed_id, $visit_id) {
        // First, release the bed if it's currently occupied
        $bed = $this->get_by_id($bed_id);
        if ($bed && $bed['current_visit_id']) {
            $this->release_bed($bed_id);
        }
        
        // Update bed status
        $this->db->where('id', $bed_id);
        $this->db->update('emergency_ward_beds', array(
            'status' => 'Occupied',
            'current_visit_id' => $visit_id
        ));
        
        // Update emergency visit with bed assignment
        $this->load->model('Emergency_model');
        $bed_info = $this->get_by_id($bed_id);
        if ($bed_info) {
            $this->db->where('id', $visit_id);
            $this->db->update('emergency_visits', array(
                'assigned_ward_id' => $bed_info['ward_id'],
                'assigned_ward_bed_id' => $bed_id
            ));
        }
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Release bed
     */
    public function release_bed($bed_id) {
        $bed = $this->get_by_id($bed_id);
        
        if ($bed && $bed['current_visit_id']) {
            // Update emergency visit to remove bed assignment
            $this->db->where('id', $bed['current_visit_id']);
            $this->db->update('emergency_visits', array(
                'assigned_ward_bed_id' => null
            ));
        }
        
        // Update bed status
        $this->db->where('id', $bed_id);
        $this->db->update('emergency_ward_beds', array(
            'status' => 'Available',
            'current_visit_id' => null,
            'last_cleaned_at' => date('Y-m-d H:i:s')
        ));
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Update bed status
     */
    public function update_status($bed_id, $status) {
        $this->db->where('id', $bed_id);
        $this->db->update('emergency_ward_beds', array('status' => $status));
        return $this->db->affected_rows() > 0;
    }

    /**
     * Get available beds in ward
     */
    public function get_available_beds($ward_id) {
        $this->db->select('ewb.*, ew.name as ward_name');
        $this->db->from('emergency_ward_beds ewb');
        $this->db->join('emergency_wards ew', 'ew.id = ewb.ward_id', 'left');
        $this->db->where('ewb.ward_id', $ward_id);
        $this->db->where('ewb.status', 'Available');
        $this->db->order_by('ewb.bed_number', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }
}
