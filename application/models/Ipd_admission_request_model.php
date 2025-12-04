<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_admission_request_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique request ID
     * Format: REQ-YYYY-NNNNNN (e.g., REQ-2024-001234)
     */
    public function generate_request_id() {
        $year = date('Y');
        $prefix = 'REQ-' . $year . '-';
        
        // Get the last request ID for this year
        $this->db->select('request_id');
        $this->db->like('request_id', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('ipd_admission_requests');
        $last_request = $query->row_array();
        
        if ($last_request && preg_match('/REQ-' . $year . '-(\d+)/', $last_request['request_id'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all admission requests with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            iar.*,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            p.phone as patient_phone,
            d.name as doctor_name,
            d.specialty as doctor_specialty,
            u.name as approved_by_name
        ');
        $this->db->from('ipd_admission_requests iar');
        $this->db->join('patients p', 'p.id = iar.patient_id', 'left');
        $this->db->join('doctors d', 'd.id = iar.requested_by_doctor_id', 'left');
        $this->db->join('users u', 'u.id = iar.approved_by', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('iar.status', $filters['status']);
        }
        
        if (!empty($filters['priority'])) {
            $this->db->where('iar.priority', $filters['priority']);
        }
        
        if (!empty($filters['department'])) {
            $this->db->where('iar.department', $filters['department']);
        }
        
        if (!empty($filters['doctor_id'])) {
            $this->db->where('iar.requested_by_doctor_id', $filters['doctor_id']);
        }
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('iar.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('iar.request_id', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('d.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('iar.priority', 'DESC'); // Urgent first
        $this->db->order_by('iar.requested_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get admission request by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            iar.*,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            p.phone as patient_phone,
            d.name as doctor_name,
            d.specialty as doctor_specialty,
            u.name as approved_by_name
        ');
        $this->db->from('ipd_admission_requests iar');
        $this->db->join('patients p', 'p.id = iar.patient_id', 'left');
        $this->db->join('doctors d', 'd.id = iar.requested_by_doctor_id', 'left');
        $this->db->join('users u', 'u.id = iar.approved_by', 'left');
        $this->db->where('iar.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get statistics for admission requests
     */
    public function get_stats() {
        $stats = [];
        
        // Pending requests
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_admission_requests');
        $this->db->where('status', 'pending');
        $query = $this->db->get();
        $stats['pending'] = (int)$query->row()->count;
        
        // Approved today
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_admission_requests');
        $this->db->where('status', 'approved');
        $this->db->where('DATE(approved_at)', date('Y-m-d'));
        $query = $this->db->get();
        $stats['approvedToday'] = (int)$query->row()->count;
        
        // Rejected
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_admission_requests');
        $this->db->where('status', 'rejected');
        $query = $this->db->get();
        $stats['rejected'] = (int)$query->row()->count;
        
        // Urgent requests
        $this->db->select('COUNT(*) as count');
        $this->db->from('ipd_admission_requests');
        $this->db->where('status', 'pending');
        $this->db->where('priority', 'urgent');
        $query = $this->db->get();
        $stats['urgent'] = (int)$query->row()->count;
        
        return $stats;
    }

    /**
     * Create new admission request
     */
    public function create($data) {
        $request_id = $this->generate_request_id();
        
        $insert_data = [
            'request_id' => $request_id,
            'patient_id' => $data['patient_id'] ?? null,
            'requested_by_doctor_id' => $data['requested_by_doctor_id'] ?? null,
            'department' => $data['department'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'ward_preference' => $data['ward_preference'] ?? null,
            'room_preference' => $data['room_preference'] ?? null,
            'diagnosis' => $data['diagnosis'] ?? null,
            'reason' => $data['reason'] ?? null,
            'estimated_duration' => $data['estimated_duration'] ?? null,
            'status' => 'pending'
        ];
        
        $this->db->insert('ipd_admission_requests', $insert_data);
        return $this->db->insert_id();
    }

    /**
     * Update admission request
     */
    public function update($id, $data) {
        $update_data = [];
        
        $allowed_fields = [
            'patient_id', 'requested_by_doctor_id', 'department', 'priority',
            'ward_preference', 'room_preference', 'diagnosis', 'reason',
            'estimated_duration', 'status', 'approved_by', 'approved_at',
            'rejection_reason', 'admission_id'
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
        $this->db->update('ipd_admission_requests', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Approve admission request
     */
    public function approve($id, $admission_id = null, $approved_by = null) {
        $update_data = [
            'status' => 'approved',
            'approved_by' => $approved_by,
            'approved_at' => date('Y-m-d H:i:s')
        ];
        
        if ($admission_id) {
            $update_data['admission_id'] = $admission_id;
        }
        
        $this->db->where('id', $id);
        $this->db->update('ipd_admission_requests', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Reject admission request
     */
    public function reject($id, $rejection_reason = null, $rejected_by = null) {
        $update_data = [
            'status' => 'rejected',
            'approved_by' => $rejected_by,
            'approved_at' => date('Y-m-d H:i:s'),
            'rejection_reason' => $rejection_reason
        ];
        
        $this->db->where('id', $id);
        $this->db->update('ipd_admission_requests', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Delete admission request
     */
    public function delete($id) {
        $this->db->where('id', $id);
        $this->db->delete('ipd_admission_requests');
        return $this->db->affected_rows() > 0;
    }
}










