<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Doctor_slot_room_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all doctor slot room assignments with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('dsr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty,
                          ds.day_of_week, ds.start_time as slot_start_time, ds.end_time as slot_end_time,
                          r.room_number, r.room_name, r.room_type,
                          rec.reception_code, rec.reception_name,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_slot_rooms dsr');
        $this->db->join('doctors d', 'dsr.doctor_id = d.id', 'left');
        $this->db->join('doctor_schedules ds', 'dsr.schedule_id = ds.id', 'left');
        $this->db->join('rooms r', 'dsr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dsr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        
        // Apply filters
        if (!empty($filters['doctor_id'])) {
            $this->db->where('dsr.doctor_id', $filters['doctor_id']);
        }
        
        if (!empty($filters['schedule_id'])) {
            $this->db->where('dsr.schedule_id', $filters['schedule_id']);
        }
        
        if (!empty($filters['room_id'])) {
            $this->db->where('dsr.room_id', $filters['room_id']);
        }
        
        if (!empty($filters['reception_id'])) {
            $this->db->where('dsr.reception_id', $filters['reception_id']);
        }
        
        if (!empty($filters['assignment_date'])) {
            $this->db->where('dsr.assignment_date', $filters['assignment_date']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('dsr.assignment_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('dsr.assignment_date <=', $filters['date_to']);
        }
        
        if (isset($filters['is_active'])) {
            $this->db->where('dsr.is_active', $filters['is_active']);
        }
        
        $this->db->order_by('dsr.assignment_date', 'ASC');
        $this->db->order_by('ds.start_time', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get doctor slot room assignment by ID
     */
    public function get_by_id($id) {
        $this->db->select('dsr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty,
                          ds.day_of_week, ds.start_time as slot_start_time, ds.end_time as slot_end_time,
                          r.room_number, r.room_name, r.room_type, r.floor_id,
                          rec.reception_code, rec.reception_name, rec.floor_id as reception_floor_id,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_slot_rooms dsr');
        $this->db->join('doctors d', 'dsr.doctor_id = d.id', 'left');
        $this->db->join('doctor_schedules ds', 'dsr.schedule_id = ds.id', 'left');
        $this->db->join('rooms r', 'dsr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dsr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->where('dsr.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get room assignments for a doctor on a specific date
     */
    public function get_by_doctor_date($doctor_id, $date) {
        $this->db->select('dsr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty,
                          ds.day_of_week, ds.start_time as slot_start_time, ds.end_time as slot_end_time,
                          r.room_number, r.room_name, r.room_type, r.floor_id,
                          rec.reception_code, rec.reception_name, rec.floor_id as reception_floor_id,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_slot_rooms dsr');
        $this->db->join('doctors d', 'dsr.doctor_id = d.id', 'left');
        $this->db->join('doctor_schedules ds', 'dsr.schedule_id = ds.id', 'left');
        $this->db->join('rooms r', 'dsr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dsr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->where('dsr.doctor_id', $doctor_id);
        $this->db->where('dsr.assignment_date', $date);
        $this->db->where('dsr.is_active', 1);
        $this->db->order_by('ds.start_time', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get room assignment for a specific slot and date
     */
    public function get_by_slot_date($schedule_id, $date) {
        $this->db->select('dsr.*, d.name as doctor_name, d.doctor_id as doctor_doctor_id, d.specialty,
                          ds.day_of_week, ds.start_time as slot_start_time, ds.end_time as slot_end_time,
                          r.room_number, r.room_name, r.room_type, r.floor_id,
                          rec.reception_code, rec.reception_name, rec.floor_id as reception_floor_id,
                          f.floor_number, f.floor_name');
        $this->db->from('doctor_slot_rooms dsr');
        $this->db->join('doctors d', 'dsr.doctor_id = d.id', 'left');
        $this->db->join('doctor_schedules ds', 'dsr.schedule_id = ds.id', 'left');
        $this->db->join('rooms r', 'dsr.room_id = r.id', 'left');
        $this->db->join('receptions rec', 'dsr.reception_id = rec.id', 'left');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->where('dsr.schedule_id', $schedule_id);
        $this->db->where('dsr.assignment_date', $date);
        $this->db->where('dsr.is_active', 1);
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get available rooms for a slot (rooms not assigned to other doctors on same date/time)
     */
    public function get_available_rooms($schedule_id, $date, $exclude_doctor_id = null) {
        // Get the schedule details
        $this->db->select('doctor_id, day_of_week, start_time, end_time');
        $this->db->where('id', $schedule_id);
        $schedule = $this->db->get('doctor_schedules')->row_array();
        
        if (!$schedule) {
            return array();
        }
        
        // Get rooms already assigned for this date and overlapping time slots
        $this->db->select('DISTINCT dsr.room_id');
        $this->db->from('doctor_slot_rooms dsr');
        $this->db->join('doctor_schedules ds', 'dsr.schedule_id = ds.id', 'left');
        $this->db->where('dsr.assignment_date', $date);
        $this->db->where('dsr.is_active', 1);
        $this->db->where('ds.day_of_week', $schedule['day_of_week']);
        // Check for time overlap
        $this->db->where('(ds.start_time <', $schedule['end_time'], false);
        $this->db->where('ds.end_time >', $schedule['start_time'], false);
        $this->db->where(')', null, false);
        
        if ($exclude_doctor_id) {
            $this->db->where('dsr.doctor_id !=', $exclude_doctor_id);
        }
        
        $assigned_rooms = $this->db->get()->result_array();
        $assigned_room_ids = array_column($assigned_rooms, 'room_id');
        
        // Get all active rooms
        $this->db->select('r.*, f.floor_number, f.floor_name');
        $this->db->from('rooms r');
        $this->db->join('floors f', 'r.floor_id = f.id', 'left');
        $this->db->where('r.status', 'Active');
        $this->db->where('r.room_type', 'Consultation');
        
        if (!empty($assigned_room_ids)) {
            $this->db->where_not_in('r.id', $assigned_room_ids);
        }
        
        $this->db->order_by('f.floor_number', 'ASC');
        $this->db->order_by('r.room_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create doctor slot room assignment
     */
    public function create($data) {
        // Check if assignment already exists
        $existing = $this->get_by_slot_date($data['schedule_id'], $data['assignment_date']);
        if ($existing) {
            // Update existing instead of creating duplicate
            return $this->update($existing['id'], $data);
        }
        
        $insert_data = array(
            'doctor_id' => $data['doctor_id'],
            'schedule_id' => $data['schedule_id'],
            'room_id' => $data['room_id'],
            'assignment_date' => $data['assignment_date'],
            'reception_id' => $data['reception_id'],
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        );
        
        if ($this->db->insert('doctor_slot_rooms', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Bulk create assignments for date range
     */
    public function bulk_create($data) {
        $this->db->trans_start();
        
        $doctor_id = $data['doctor_id'];
        $schedule_id = $data['schedule_id'];
        $room_id = $data['room_id'];
        $reception_id = $data['reception_id'];
        $date_from = $data['date_from'];
        $date_to = $data['date_to'];
        
        $current_date = $date_from;
        $inserted = 0;
        
        while ($current_date <= $date_to) {
            $insert_data = array(
                'doctor_id' => $doctor_id,
                'schedule_id' => $schedule_id,
                'room_id' => $room_id,
                'assignment_date' => $current_date,
                'reception_id' => $reception_id,
                'is_active' => 1
            );
            
            // Check if exists
            $existing = $this->get_by_slot_date($schedule_id, $current_date);
            if (!$existing) {
                $this->db->insert('doctor_slot_rooms', $insert_data);
                $inserted++;
            }
            
            // Move to next day
            $current_date = date('Y-m-d', strtotime($current_date . ' +1 day'));
        }
        
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return $inserted;
    }

    /**
     * Update doctor slot room assignment
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['room_id'])) {
            $update_data['room_id'] = $data['room_id'];
        }
        
        if (isset($data['reception_id'])) {
            $update_data['reception_id'] = $data['reception_id'];
        }
        
        if (isset($data['assignment_date'])) {
            $update_data['assignment_date'] = $data['assignment_date'];
        }
        
        if (isset($data['is_active'])) {
            $update_data['is_active'] = (int)$data['is_active'];
        }
        
        $this->db->where('id', $id);
        return $this->db->update('doctor_slot_rooms', $update_data);
    }

    /**
     * Delete doctor slot room assignment
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('doctor_slot_rooms');
    }
}

