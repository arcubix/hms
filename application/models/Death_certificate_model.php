<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Death_certificate_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique certificate number
     * Format: DC-YYYY-XXXXXX (e.g., DC-2025-000001)
     */
    public function generate_certificate_no() {
        $year = date('Y');
        $prefix = 'DC-' . $year . '-';
        
        // Get the last certificate number for this year
        $this->db->select('certificate_no');
        $this->db->like('certificate_no', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('death_certificates');
        $last_cert = $query->row_array();
        
        if ($last_cert && preg_match('/DC-' . $year . '-(\d+)/', $last_cert['certificate_no'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate age from date of birth and date of death
     */
    public function calculate_age($date_of_birth, $date_of_death) {
        $birth = new DateTime($date_of_birth);
        $death = new DateTime($date_of_death);
        $interval = $birth->diff($death);
        
        return [
            'years' => $interval->y,
            'months' => $interval->m,
            'days' => $interval->d
        ];
    }

    /**
     * Get all death certificates with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            dc.*,
            u.name as created_by_name,
            d.name as doctor_name,
            p.name as patient_name,
            p.patient_id as patient_patient_id,
            ia.ipd_number,
            ia.uhid
        ');
        $this->db->from('death_certificates dc');
        $this->db->join('users u', 'u.id = dc.created_by', 'left');
        $this->db->join('users d', 'd.id = dc.doctor_id', 'left');
        $this->db->join('patients p', 'p.id = dc.patient_id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.id = dc.admission_id', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('dc.status', $filters['status']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('dc.registration_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('dc.registration_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('dc.certificate_no', $search);
            $this->db->or_like('dc.patient_name', $search);
            $this->db->or_like('dc.patient_nic', $search);
            $this->db->or_like('dc.father_name', $search);
            $this->db->or_like('dc.guardian_name', $search);
            $this->db->or_like('p.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('dc.created_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get death certificate by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            dc.*,
            u.name as created_by_name,
            d.name as doctor_name,
            p.name as patient_name,
            p.patient_id as patient_patient_id,
            ia.ipd_number,
            ia.uhid
        ');
        $this->db->from('death_certificates dc');
        $this->db->join('users u', 'u.id = dc.created_by', 'left');
        $this->db->join('users d', 'd.id = dc.doctor_id', 'left');
        $this->db->join('patients p', 'p.id = dc.patient_id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.id = dc.admission_id', 'left');
        $this->db->where('dc.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new death certificate
     */
    public function create($data) {
        $certificate_no = $this->generate_certificate_no();
        
        // Calculate age if date_of_birth and date_of_death are provided
        $age = null;
        if (!empty($data['date_of_birth']) && !empty($data['date_of_death'])) {
            $age = $this->calculate_age($data['date_of_birth'], $data['date_of_death']);
        }
        
        $insert_data = [
            'certificate_no' => $certificate_no,
            'patient_id' => $data['patient_id'] ?? null,
            'patient_name' => $data['patient_name'],
            'patient_nic' => $data['patient_nic'] ?? null,
            'patient_gender' => $data['patient_gender'],
            'date_of_birth' => $data['date_of_birth'],
            'age_years' => $age ? $age['years'] : ($data['age_years'] ?? null),
            'age_months' => $age ? $age['months'] : ($data['age_months'] ?? null),
            'age_days' => $age ? $age['days'] : ($data['age_days'] ?? null),
            'father_name' => $data['father_name'] ?? null,
            'address' => $data['address'] ?? null,
            'admission_id' => $data['admission_id'] ?? null,
            'date_of_admission' => $data['date_of_admission'] ?? null,
            'guardian_name' => $data['guardian_name'] ?? null,
            'guardian_nic' => $data['guardian_nic'] ?? null,
            'phone_number' => $data['phone_number'] ?? null,
            'date_of_death' => $data['date_of_death'],
            'cause_of_death' => $data['cause_of_death'],
            'doctor_id' => $data['doctor_id'] ?? null,
            'doctor_name' => $data['doctor_name'] ?? null,
            'status' => $data['status'] ?? 'Pending',
            'registration_date' => $data['registration_date'] ?? date('Y-m-d'),
            'created_by' => $data['created_by'] ?? null
        ];
        
        $this->db->insert('death_certificates', $insert_data);
        return $this->db->insert_id();
    }

    /**
     * Update death certificate
     */
    public function update($id, $data) {
        $update_data = [];
        
        // Recalculate age if date_of_birth or date_of_death changed
        if ((isset($data['date_of_birth']) || isset($data['date_of_death'])) && 
            !empty($data['date_of_birth']) && !empty($data['date_of_death'])) {
            $age = $this->calculate_age($data['date_of_birth'], $data['date_of_death']);
            $data['age_years'] = $age['years'];
            $data['age_months'] = $age['months'];
            $data['age_days'] = $age['days'];
        }
        
        $allowed_fields = [
            'patient_id', 'patient_name', 'patient_nic', 'patient_gender',
            'date_of_birth', 'age_years', 'age_months', 'age_days',
            'father_name', 'address', 'admission_id', 'date_of_admission',
            'guardian_name', 'guardian_nic', 'phone_number', 'date_of_death',
            'cause_of_death', 'doctor_id', 'doctor_name', 'status',
            'registration_date'
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
        $this->db->update('death_certificates', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Delete death certificate
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('death_certificates');
    }

    /**
     * Get statistics
     */
    public function get_statistics() {
        $stats = [];
        
        // Total certificates
        $stats['total'] = $this->db->count_all_results('death_certificates');
        
        // By status
        $this->db->select('status, COUNT(*) as count');
        $this->db->from('death_certificates');
        $this->db->group_by('status');
        $query = $this->db->get();
        $status_counts = $query->result_array();
        
        foreach ($status_counts as $row) {
            $stats[$row['status']] = $row['count'];
        }
        
        return $stats;
    }
}

