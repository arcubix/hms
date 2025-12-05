<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_rehabilitation_request_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all rehabilitation requests with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            irr.*,
            ia.ipd_number,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            d.name as doctor_name,
            d.specialty as doctor_specialty
        ');
        $this->db->from('ipd_rehabilitation_requests irr');
        $this->db->join('ipd_admissions ia', 'ia.id = irr.admission_id', 'left');
        $this->db->join('patients p', 'p.id = irr.patient_id', 'left');
        $this->db->join('doctors d', 'd.id = irr.requested_by_doctor_id', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('irr.status', $filters['status']);
        }
        
        if (!empty($filters['admission_id'])) {
            $this->db->where('irr.admission_id', $filters['admission_id']);
        }
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('irr.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['service_type'])) {
            $this->db->where('irr.service_type', $filters['service_type']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('p.name', $search);
            $this->db->or_like('ia.ipd_number', $search);
            $this->db->or_like('irr.service_type', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('irr.created_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get rehabilitation request by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            irr.*,
            ia.ipd_number,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            d.name as doctor_name,
            d.specialty as doctor_specialty
        ');
        $this->db->from('ipd_rehabilitation_requests irr');
        $this->db->join('ipd_admissions ia', 'ia.id = irr.admission_id', 'left');
        $this->db->join('patients p', 'p.id = irr.patient_id', 'left');
        $this->db->join('doctors d', 'd.id = irr.requested_by_doctor_id', 'left');
        $this->db->where('irr.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get statistics for rehabilitation requests
     */
    public function get_stats() {
        $stats = [];
        
        // Active patients (patients with active rehabilitation requests)
        $this->db->select('COUNT(DISTINCT patient_id) as count');
        $this->db->from('ipd_rehabilitation_requests');
        $this->db->where('status', 'active');
        $query = $this->db->get();
        $stats['activePatients'] = (int)$query->row()->count;
        
        // Pending requests
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_rehabilitation_requests');
        $this->db->where('status', 'pending');
        $query = $this->db->get();
        $stats['pendingRequests'] = (int)$query->row()->count;
        
        // Today's sessions
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_rehabilitation_requests');
        $this->db->where('status', 'active');
        $this->db->where('next_session_date', date('Y-m-d'));
        $query = $this->db->get();
        $stats['todaysSessions'] = (int)$query->row()->count;
        
        // Completed
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_rehabilitation_requests');
        $this->db->where('status', 'completed');
        $query = $this->db->get();
        $stats['completed'] = (int)$query->row()->count;
        
        return $stats;
    }

    /**
     * Create new rehabilitation request
     */
    public function create($data) {
        $insert_data = [
            'admission_id' => $data['admission_id'] ?? null,
            'patient_id' => $data['patient_id'] ?? null,
            'service_type' => $data['service_type'] ?? null,
            'requested_by_doctor_id' => $data['requested_by_doctor_id'] ?? null,
            'requested_by_name' => $data['requested_by_name'] ?? null,
            'frequency' => $data['frequency'] ?? null,
            'duration' => $data['duration'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'next_session_date' => $data['next_session_date'] ?? null,
            'next_session_time' => $data['next_session_time'] ?? null,
            'total_sessions' => $data['total_sessions'] ?? 0,
            'completed_sessions' => $data['completed_sessions'] ?? 0,
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        ];
        
        $this->db->insert('ipd_rehabilitation_requests', $insert_data);
        return $this->db->insert_id();
    }

    /**
     * Update rehabilitation request
     */
    public function update($id, $data) {
        $update_data = [];
        
        $allowed_fields = [
            'service_type', 'requested_by_doctor_id', 'requested_by_name',
            'frequency', 'duration', 'status', 'start_date', 'end_date',
            'next_session_date', 'next_session_time', 'total_sessions',
            'completed_sessions', 'notes'
        ];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        $this->db->update('ipd_rehabilitation_requests', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Delete rehabilitation request
     */
    public function delete($id) {
        $this->db->where('id', $id);
        $this->db->delete('ipd_rehabilitation_requests');
        return $this->db->affected_rows() > 0;
    }
}











