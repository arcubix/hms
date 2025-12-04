<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Birth_certificate_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique certificate number
     * Format: BC-YYYY-XXXXXX (e.g., BC-2025-000001)
     */
    public function generate_certificate_no() {
        $year = date('Y');
        $prefix = 'BC-' . $year . '-';
        
        // Get the last certificate number for this year
        $this->db->select('certificate_no');
        $this->db->like('certificate_no', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('birth_certificates');
        $last_cert = $query->row_array();
        
        if ($last_cert && preg_match('/BC-' . $year . '-(\d+)/', $last_cert['certificate_no'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all birth certificates with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            bc.*,
            u.name as created_by_name,
            d.name as doctor_name,
            p.name as mother_patient_name,
            p.patient_id as mother_patient_mrn
        ');
        $this->db->from('birth_certificates bc');
        $this->db->join('users u', 'u.id = bc.created_by', 'left');
        $this->db->join('users d', 'd.id = bc.doctor_id', 'left');
        $this->db->join('patients p', 'p.id = bc.mother_patient_id', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('bc.status', $filters['status']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('bc.registration_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('bc.registration_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('bc.certificate_no', $search);
            $this->db->or_like('bc.baby_name', $search);
            $this->db->or_like('bc.mother_name', $search);
            $this->db->or_like('bc.father_name', $search);
            $this->db->or_like('bc.mother_mrn', $search);
            $this->db->or_like('bc.mother_nic', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('bc.created_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get birth certificate by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            bc.*,
            u.name as created_by_name,
            d.name as doctor_name,
            p.name as mother_patient_name,
            p.patient_id as mother_patient_mrn
        ');
        $this->db->from('birth_certificates bc');
        $this->db->join('users u', 'u.id = bc.created_by', 'left');
        $this->db->join('users d', 'd.id = bc.doctor_id', 'left');
        $this->db->join('patients p', 'p.id = bc.mother_patient_id', 'left');
        $this->db->where('bc.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new birth certificate
     */
    public function create($data) {
        $certificate_no = $this->generate_certificate_no();
        
        $insert_data = [
            'certificate_no' => $certificate_no,
            'baby_name' => $data['baby_name'],
            'baby_gender' => $data['baby_gender'],
            'date_of_birth' => $data['date_of_birth'],
            'time_of_birth' => $data['time_of_birth'] ?? '00:00:00',
            'weight' => $data['weight'] ?? null,
            'height' => $data['height'] ?? null,
            'head_circumference' => $data['head_circumference'] ?? null,
            'mother_name' => $data['mother_name'],
            'mother_mrn' => $data['mother_mrn'] ?? null,
            'mother_nic' => $data['mother_nic'] ?? null,
            'mother_patient_id' => $data['mother_patient_id'] ?? null,
            'father_name' => $data['father_name'],
            'father_cnic' => $data['father_cnic'] ?? null,
            'delivery_no' => $data['delivery_no'] ?? null,
            'mode_of_delivery' => $data['mode_of_delivery'] ?? null,
            'birthmark' => $data['birthmark'] ?? null,
            'doctor_id' => $data['doctor_id'] ?? null,
            'doctor_name' => $data['doctor_name'] ?? null,
            'phone_number' => $data['phone_number'] ?? null,
            'address' => $data['address'] ?? null,
            'status' => $data['status'] ?? 'Pending',
            'remarks' => $data['remarks'] ?? null,
            'registration_date' => $data['registration_date'] ?? date('Y-m-d'),
            'created_by' => $data['created_by'] ?? null
        ];
        
        $this->db->insert('birth_certificates', $insert_data);
        return $this->db->insert_id();
    }

    /**
     * Update birth certificate
     */
    public function update($id, $data) {
        $update_data = [];
        
        $allowed_fields = [
            'baby_name', 'baby_gender', 'date_of_birth', 'time_of_birth',
            'weight', 'height', 'head_circumference', 'mother_name',
            'mother_mrn', 'mother_nic', 'mother_patient_id', 'father_name',
            'father_cnic', 'delivery_no', 'mode_of_delivery', 'birthmark',
            'doctor_id', 'doctor_name', 'phone_number', 'address',
            'status', 'remarks', 'registration_date'
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
        $this->db->update('birth_certificates', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Delete birth certificate
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('birth_certificates');
    }

    /**
     * Get statistics
     */
    public function get_statistics() {
        $stats = [];
        
        // Total certificates
        $stats['total'] = $this->db->count_all_results('birth_certificates');
        
        // By status
        $this->db->select('status, COUNT(*) as count');
        $this->db->from('birth_certificates');
        $this->db->group_by('status');
        $query = $this->db->get();
        $status_counts = $query->result_array();
        
        foreach ($status_counts as $row) {
            $stats[$row['status']] = $row['count'];
        }
        
        return $stats;
    }
}

