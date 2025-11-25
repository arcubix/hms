<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Emergency_duty_roster_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all roster entries with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            edr.*,
            d.name as doctor_name,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            u.role as user_role,
            d.specialty as doctor_specialty
        ');
        $this->db->from('emergency_duty_roster edr');
        $this->db->join('users u', 'u.id = edr.user_id', 'left');
        $this->db->join('doctors d', 'd.user_id = u.id', 'left');
        
        // Apply filters
        if (!empty($filters['date_from'])) {
            $this->db->where('edr.date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('edr.date <=', $filters['date_to']);
        }
        
        if (!empty($filters['date'])) {
            $this->db->where('edr.date', $filters['date']);
        }
        
        if (!empty($filters['user_id'])) {
            $this->db->where('edr.user_id', $filters['user_id']);
        }
        
        if (!empty($filters['shift_type'])) {
            $this->db->where('edr.shift_type', $filters['shift_type']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('edr.status', $filters['status']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('d.name', $search);
            $this->db->or_like('u.name', $search);
            $this->db->or_like('edr.specialization', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('edr.date', 'DESC');
        $this->db->order_by('edr.shift_start_time', 'ASC');
        $this->db->order_by('d.name', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get roster for specific date
     */
    public function get_by_date($date) {
        return $this->get_all(array('date' => $date));
    }

    /**
     * Get user's schedule
     */
    public function get_by_user($user_id, $date_from = null, $date_to = null) {
        $filters = array('user_id' => $user_id);
        if ($date_from) $filters['date_from'] = $date_from;
        if ($date_to) $filters['date_to'] = $date_to;
        return $this->get_all($filters);
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
            'specialization' => $data['specialization'] ?? null,
            'status' => $data['status'] ?? 'Scheduled',
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('emergency_duty_roster', $roster_data);
        return $this->db->insert_id();
    }

    /**
     * Update roster entry
     */
    public function update($id, $data) {
        $roster_data = array();
        
        if (isset($data['user_id'])) $roster_data['user_id'] = $data['user_id'];
        if (isset($data['date'])) $roster_data['date'] = $data['date'];
        if (isset($data['shift_type'])) $roster_data['shift_type'] = $data['shift_type'];
        if (isset($data['shift_start_time'])) $roster_data['shift_start_time'] = $data['shift_start_time'];
        if (isset($data['shift_end_time'])) $roster_data['shift_end_time'] = $data['shift_end_time'];
        if (isset($data['specialization'])) $roster_data['specialization'] = $data['specialization'];
        if (isset($data['status'])) $roster_data['status'] = $data['status'];
        if (isset($data['notes'])) $roster_data['notes'] = $data['notes'];
        
        if (!empty($roster_data)) {
            $this->db->where('id', $id);
            $this->db->update('emergency_duty_roster', $roster_data);
            return $this->db->affected_rows() > 0;
        }
        
        return false;
    }

    /**
     * Delete roster entry
     */
    public function delete($id) {
        $this->db->where('id', $id);
        $this->db->delete('emergency_duty_roster');
        return $this->db->affected_rows() > 0;
    }

    /**
     * Get current on-duty staff
     */
    public function get_current_duty_staff() {
        $current_date = date('Y-m-d');
        $current_time = date('H:i:s');
        
        $this->db->select('
            edr.*,
            d.name as doctor_name,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            u.role as user_role,
            d.specialty as doctor_specialty
        ');
        $this->db->from('emergency_duty_roster edr');
        $this->db->join('users u', 'u.id = edr.user_id', 'left');
        $this->db->join('doctors d', 'd.user_id = u.id', 'left');
        $this->db->where('edr.date', $current_date);
        $this->db->where('edr.shift_start_time <=', $current_time);
        $this->db->where('edr.shift_end_time >=', $current_time);
        $this->db->where_in('edr.status', array('Scheduled', 'On Duty'));
        $this->db->order_by('edr.shift_type', 'ASC');
        $this->db->order_by('d.name', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }
}
