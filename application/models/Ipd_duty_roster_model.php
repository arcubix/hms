<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_duty_roster_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all roster entries with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            idr.*,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            u.role as user_role,
            d.name as doctor_name,
            d.specialty as doctor_specialty,
            w.name as ward_name,
            dept.department_name
        ');
        $this->db->from('ipd_duty_roster idr');
        $this->db->join('users u', 'u.id = idr.user_id', 'left');
        $this->db->join('doctors d', 'd.user_id = u.id', 'left');
        $this->db->join('ipd_wards w', 'w.id = idr.ward_id', 'left');
        $this->db->join('departments dept', 'dept.id = idr.department_id', 'left');
        
        // Apply filters
        if (!empty($filters['date_from'])) {
            $this->db->where('idr.date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('idr.date <=', $filters['date_to']);
        }
        
        if (!empty($filters['date'])) {
            $this->db->where('idr.date', $filters['date']);
        }
        
        if (!empty($filters['user_id'])) {
            $this->db->where('idr.user_id', $filters['user_id']);
        }
        
        if (!empty($filters['shift_type'])) {
            $this->db->where('idr.shift_type', $filters['shift_type']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('idr.status', $filters['status']);
        }
        
        if (!empty($filters['ward_id'])) {
            $this->db->where('idr.ward_id', $filters['ward_id']);
        }
        
        if (!empty($filters['department_id'])) {
            $this->db->where('idr.department_id', $filters['department_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('d.name', $search);
            $this->db->or_like('u.name', $search);
            $this->db->or_like('idr.specialization', $search);
            $this->db->or_like('w.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('idr.date', 'ASC');
        $this->db->order_by('idr.shift_start_time', 'ASC');
        $this->db->order_by('d.name', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get roster entry by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            idr.*,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            u.role as user_role,
            d.name as doctor_name,
            d.specialty as doctor_specialty,
            w.name as ward_name,
            dept.department_name
        ');
        $this->db->from('ipd_duty_roster idr');
        $this->db->join('users u', 'u.id = idr.user_id', 'left');
        $this->db->join('doctors d', 'd.user_id = u.id', 'left');
        $this->db->join('ipd_wards w', 'w.id = idr.ward_id', 'left');
        $this->db->join('departments dept', 'dept.id = idr.department_id', 'left');
        $this->db->where('idr.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create roster entry
     */
    public function create($data) {
        $roster_data = array(
            'user_id' => $data['user_id'],
            'date' => $data['date'],
            'shift_type' => $data['shift_type'] ?? 'Morning',
            'shift_start_time' => $data['shift_start_time'],
            'shift_end_time' => $data['shift_end_time'],
            'ward_id' => $data['ward_id'] ?? null,
            'department_id' => $data['department_id'] ?? null,
            'specialization' => $data['specialization'] ?? null,
            'status' => $data['status'] ?? 'Scheduled',
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('ipd_duty_roster', $roster_data);
        return $this->db->insert_id();
    }

    /**
     * Update roster entry
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('ipd_duty_roster', $data);
    }

    /**
     * Delete roster entry
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_duty_roster');
    }
}

