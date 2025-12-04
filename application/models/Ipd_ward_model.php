<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_ward_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all IPD wards with statistics
     */
    public function get_all($filters = []) {
        $this->db->select('
            iw.*,
            f.floor_number,
            f.floor_name,
            f.building_name,
            u.name as incharge_name,
            u.email as incharge_email,
            u.phone as incharge_phone,
            COUNT(DISTINCT ib.id) as total_beds,
            COUNT(DISTINCT CASE WHEN ib.status = "occupied" THEN ib.id END) as occupied_beds,
            COUNT(DISTINCT CASE WHEN ib.status = "available" THEN ib.id END) as available_beds
        ');
        $this->db->from('ipd_wards iw');
        $this->db->join('floors f', 'f.id = iw.floor_id', 'left');
        $this->db->join('users u', 'u.id = iw.incharge_user_id', 'left');
        $this->db->join('ipd_beds ib', 'ib.ward_id = iw.id', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('iw.status', $filters['status']);
        }
        
        if (!empty($filters['type'])) {
            $this->db->where('iw.type', $filters['type']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('iw.name', $search);
            $this->db->or_like('iw.description', $search);
            $this->db->group_end();
        }
        
        $this->db->group_by('iw.id');
        $this->db->order_by('iw.name', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get ward by ID with bed details
     */
    public function get_by_id($id) {
        $this->db->select('
            iw.*,
            f.floor_number,
            f.floor_name,
            f.building_name,
            u.name as incharge_name,
            u.email as incharge_email,
            u.phone as incharge_phone
        ');
        $this->db->from('ipd_wards iw');
        $this->db->join('floors f', 'f.id = iw.floor_id', 'left');
        $this->db->join('users u', 'u.id = iw.incharge_user_id', 'left');
        $this->db->where('iw.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new ward
     */
    public function create($data) {
        $ward_data = array(
            'name' => $data['name'],
            'type' => $data['type'] ?? 'General',
            'building' => $data['building'] ?? null,
            'floor_id' => $data['floor_id'] ?? null,
            'total_beds' => $data['total_beds'] ?? 0,
            'incharge_user_id' => $data['incharge_user_id'] ?? null,
            'contact' => $data['contact'] ?? null,
            'email' => $data['email'] ?? null,
            'facilities' => isset($data['facilities']) ? json_encode($data['facilities']) : null,
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'active',
            'established_date' => $data['established_date'] ?? null,
            'last_inspection_date' => $data['last_inspection_date'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('ipd_wards', $ward_data);
        return $this->db->insert_id();
    }

    /**
     * Update ward
     */
    public function update($id, $data) {
        if (isset($data['facilities']) && is_array($data['facilities'])) {
            $data['facilities'] = json_encode($data['facilities']);
        }
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_wards', $data);
    }

    /**
     * Delete ward
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_wards');
    }

    /**
     * Get ward statistics
     */
    public function get_statistics($ward_id) {
        $this->db->select('
            COUNT(DISTINCT ib.id) as total_beds,
            COUNT(DISTINCT CASE WHEN ib.status = "occupied" THEN ib.id END) as occupied_beds,
            COUNT(DISTINCT CASE WHEN ib.status = "available" THEN ib.id END) as available_beds,
            COUNT(DISTINCT CASE WHEN ib.status = "maintenance" THEN ib.id END) as maintenance_beds,
            COUNT(DISTINCT CASE WHEN ib.status = "cleaning" THEN ib.id END) as cleaning_beds,
            COUNT(DISTINCT ia.id) as current_patients
        ');
        $this->db->from('ipd_wards iw');
        $this->db->join('ipd_beds ib', 'ib.ward_id = iw.id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.ward_id = iw.id AND ia.status != "discharged"', 'left');
        $this->db->where('iw.id', $ward_id);
        
        $query = $this->db->get();
        return $query->row_array();
    }
}

