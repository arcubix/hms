<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Emergency_ward_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all emergency wards with statistics
     */
    public function get_all($filters = []) {
        $this->db->select('
            ew.*,
            f.floor_number,
            f.floor_name,
            f.building_name,
            u.name as incharge_name,
            u.email as incharge_email,
            u.phone as incharge_phone,
            COUNT(DISTINCT ewb.id) as total_beds,
            COUNT(DISTINCT CASE WHEN ewb.status = "Occupied" THEN ewb.id END) as occupied_beds,
            COUNT(DISTINCT CASE WHEN ewb.status = "Available" THEN ewb.id END) as available_beds
        ');
        $this->db->from('emergency_wards ew');
        $this->db->join('floors f', 'f.id = ew.floor_id', 'left');
        $this->db->join('users u', 'u.id = ew.incharge_user_id', 'left');
        $this->db->join('emergency_ward_beds ewb', 'ewb.ward_id = ew.id', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('ew.status', $filters['status']);
        }
        
        if (!empty($filters['type'])) {
            $this->db->where('ew.type', $filters['type']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ew.name', $search);
            $this->db->or_like('ew.description', $search);
            $this->db->group_end();
        }
        
        $this->db->group_by('ew.id');
        $this->db->order_by('ew.name', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get ward by ID with bed details
     */
    public function get_by_id($id) {
        $this->db->select('
            ew.*,
            f.floor_number,
            f.floor_name,
            f.building_name,
            u.name as incharge_name,
            u.email as incharge_email,
            u.phone as incharge_phone
        ');
        $this->db->from('emergency_wards ew');
        $this->db->join('floors f', 'f.id = ew.floor_id', 'left');
        $this->db->join('users u', 'u.id = ew.incharge_user_id', 'left');
        $this->db->where('ew.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new ward
     */
    public function create($data) {
        $ward_data = array(
            'name' => $data['name'],
            'type' => $data['type'] ?? 'Emergency',
            'building' => $data['building'] ?? null,
            'floor_id' => $data['floor_id'] ?? null,
            'total_beds' => $data['total_beds'] ?? 0,
            'incharge_user_id' => $data['incharge_user_id'] ?? null,
            'contact' => $data['contact'] ?? null,
            'email' => $data['email'] ?? null,
            'facilities' => isset($data['facilities']) ? json_encode($data['facilities']) : null,
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'Active',
            'established_date' => $data['established_date'] ?? null,
            'last_inspection_date' => $data['last_inspection_date'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('emergency_wards', $ward_data);
        return $this->db->insert_id();
    }

    /**
     * Update ward
     */
    public function update($id, $data) {
        $ward_data = array();
        
        if (isset($data['name'])) $ward_data['name'] = $data['name'];
        if (isset($data['type'])) $ward_data['type'] = $data['type'];
        if (isset($data['building'])) $ward_data['building'] = $data['building'];
        if (isset($data['floor_id'])) $ward_data['floor_id'] = $data['floor_id'];
        if (isset($data['total_beds'])) $ward_data['total_beds'] = $data['total_beds'];
        if (isset($data['incharge_user_id'])) $ward_data['incharge_user_id'] = $data['incharge_user_id'];
        if (isset($data['contact'])) $ward_data['contact'] = $data['contact'];
        if (isset($data['email'])) $ward_data['email'] = $data['email'];
        if (isset($data['facilities'])) $ward_data['facilities'] = json_encode($data['facilities']);
        if (isset($data['description'])) $ward_data['description'] = $data['description'];
        if (isset($data['status'])) $ward_data['status'] = $data['status'];
        if (isset($data['established_date'])) $ward_data['established_date'] = $data['established_date'];
        if (isset($data['last_inspection_date'])) $ward_data['last_inspection_date'] = $data['last_inspection_date'];
        
        if (!empty($ward_data)) {
            $this->db->where('id', $id);
            $this->db->update('emergency_wards', $ward_data);
            return $this->db->affected_rows() > 0;
        }
        
        return false;
    }

    /**
     * Soft delete ward (set status to Inactive)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        $this->db->update('emergency_wards', array('status' => 'Inactive'));
        return $this->db->affected_rows() > 0;
    }

    /**
     * Get ward statistics
     */
    public function get_ward_stats($ward_id) {
        $this->db->select('
            COUNT(DISTINCT ewb.id) as total_beds,
            COUNT(DISTINCT CASE WHEN ewb.status = "Occupied" THEN ewb.id END) as occupied_beds,
            COUNT(DISTINCT CASE WHEN ewb.status = "Available" THEN ewb.id END) as available_beds,
            COUNT(DISTINCT CASE WHEN ewb.status = "Under Cleaning" THEN ewb.id END) as cleaning_beds,
            COUNT(DISTINCT CASE WHEN ewb.status = "Maintenance" THEN ewb.id END) as maintenance_beds,
            COUNT(DISTINCT ev.id) as current_patients
        ');
        $this->db->from('emergency_wards ew');
        $this->db->join('emergency_ward_beds ewb', 'ewb.ward_id = ew.id', 'left');
        $this->db->join('emergency_visits ev', 'ev.assigned_ward_id = ew.id AND ev.current_status != "completed"', 'left');
        $this->db->where('ew.id', $ward_id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get beds in ward
     */
    public function get_ward_beds($ward_id, $filters = []) {
        $this->db->select('
            ewb.*,
            ev.er_number,
            ev.uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('emergency_ward_beds ewb');
        $this->db->join('emergency_visits ev', 'ev.assigned_ward_bed_id = ewb.id', 'left');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->where('ewb.ward_id', $ward_id);
        
        if (!empty($filters['status'])) {
            $this->db->where('ewb.status', $filters['status']);
        }
        
        $this->db->order_by('ewb.bed_number', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }
}
