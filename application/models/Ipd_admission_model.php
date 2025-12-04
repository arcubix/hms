<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_admission_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique IPD number
     * Format: IPD-YYYY-NNNNNN (e.g., IPD-2024-001234)
     */
    public function generate_ipd_number() {
        $year = date('Y');
        $prefix = 'IPD-' . $year . '-';
        
        // Get the last IPD number for this year
        $this->db->select('ipd_number');
        $this->db->like('ipd_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('ipd_admissions');
        $last_admission = $query->row_array();
        
        if ($last_admission && preg_match('/IPD-' . $year . '-(\d+)/', $last_admission['ipd_number'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all admissions with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            ia.*,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            p.phone as patient_phone,
            p.address as patient_address,
            p.emergency_contact_name,
            p.emergency_contact_phone,
            d.name as consulting_doctor_name,
            d.specialty as consulting_doctor_specialty,
            iw.name as ward_name,
            ib.bed_number,
            ir.room_number,
            u.name as admitted_by_name
        ');
        $this->db->from('ipd_admissions ia');
        $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
        $this->db->join('doctors d', 'd.id = ia.consulting_doctor_id', 'left');
        $this->db->join('ipd_wards iw', 'iw.id = ia.ward_id', 'left');
        $this->db->join('ipd_beds ib', 'ib.id = ia.bed_id', 'left');
        $this->db->join('ipd_rooms ir', 'ir.id = ia.room_id', 'left');
        $this->db->join('users u', 'u.id = ia.admitted_by_user_id', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('ia.status', $filters['status']);
        }
        
        if (!empty($filters['ward_id'])) {
            $this->db->where('ia.ward_id', $filters['ward_id']);
        }
        
        if (!empty($filters['department'])) {
            $this->db->where('ia.department', $filters['department']);
        }
        
        if (!empty($filters['admission_type'])) {
            $this->db->where('ia.admission_type', $filters['admission_type']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('ia.admission_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('ia.admission_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ia.ipd_number', $search);
            $this->db->or_like('ia.uhid', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('p.phone', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ia.admission_date', 'DESC');
        $this->db->order_by('ia.admission_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get admission by ID with all related data
     */
    public function get_by_id($id) {
        $this->db->select('
            ia.*,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            p.phone as patient_phone,
            p.email as patient_email,
            p.address as patient_address,
            p.city as patient_city,
            p.state as patient_state,
            p.zip_code as patient_zip_code,
            p.blood_group,
            p.emergency_contact_name,
            p.emergency_contact_phone,
            d.name as consulting_doctor_name,
            d.specialty as consulting_doctor_specialty,
            d.phone as consulting_doctor_phone,
            iw.name as ward_name,
            iw.type as ward_type,
            ib.bed_number,
            ib.bed_type,
            ir.room_number,
            ir.room_type,
            u.name as admitted_by_name
        ');
        $this->db->from('ipd_admissions ia');
        $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
        $this->db->join('doctors d', 'd.id = ia.consulting_doctor_id', 'left');
        $this->db->join('ipd_wards iw', 'iw.id = ia.ward_id', 'left');
        $this->db->join('ipd_beds ib', 'ib.id = ia.bed_id', 'left');
        $this->db->join('ipd_rooms ir', 'ir.id = ia.room_id', 'left');
        $this->db->join('users u', 'u.id = ia.admitted_by_user_id', 'left');
        $this->db->where('ia.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get admission by IPD number
     */
    public function get_by_ipd_number($ipd_number) {
        $this->db->where('ipd_number', $ipd_number);
        $query = $this->db->get('ipd_admissions');
        return $query->row_array();
    }

    /**
     * Create new admission
     */
    public function create($data) {
        // Generate IPD number if not provided
        if (empty($data['ipd_number'])) {
            $data['ipd_number'] = $this->generate_ipd_number();
        }
        
        // Get patient UHID if not provided
        if (empty($data['uhid']) && !empty($data['patient_id'])) {
            $this->load->model('Patient_model');
            $patient = $this->Patient_model->get_by_id($data['patient_id']);
            if ($patient) {
                $data['uhid'] = $patient['patient_id'] ?? null;
            }
        }
        
        // Calculate actual duration if discharge date exists
        if (!empty($data['discharge_date']) && !empty($data['admission_date'])) {
            $admission = new DateTime($data['admission_date']);
            $discharge = new DateTime($data['discharge_date']);
            $data['actual_duration'] = $admission->diff($discharge)->days;
        } else if (!empty($data['admission_date'])) {
            // Calculate from admission date to today
            $admission = new DateTime($data['admission_date']);
            $today = new DateTime();
            $data['actual_duration'] = $admission->diff($today)->days;
        }
        
        $admission_data = array(
            'ipd_number' => $data['ipd_number'],
            'patient_id' => $data['patient_id'],
            'uhid' => $data['uhid'] ?? null,
            'admission_date' => $data['admission_date'],
            'admission_time' => $data['admission_time'] ?? date('H:i:s'),
            'admission_type' => $data['admission_type'] ?? 'Planned',
            'department' => $data['department'] ?? null,
            'consulting_doctor_id' => $data['consulting_doctor_id'] ?? null,
            'admitted_by_user_id' => $data['admitted_by_user_id'] ?? null,
            'ward_id' => $data['ward_id'] ?? null,
            'bed_id' => $data['bed_id'] ?? null,
            'room_id' => $data['room_id'] ?? null,
            'diagnosis' => $data['diagnosis'] ?? null,
            'estimated_duration' => $data['estimated_duration'] ?? null,
            'actual_duration' => $data['actual_duration'] ?? null,
            'status' => $data['status'] ?? 'admitted',
            'insurance_provider' => $data['insurance_provider'] ?? null,
            'insurance_policy_number' => $data['insurance_policy_number'] ?? null,
            'insurance_coverage_amount' => $data['insurance_coverage_amount'] ?? 0.00,
            'insurance_approval_number' => $data['insurance_approval_number'] ?? null,
            'advance_payment' => $data['advance_payment'] ?? 0.00,
            'payment_mode' => $data['payment_mode'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('ipd_admissions', $admission_data);
        $admission_id = $this->db->insert_id();
        
        // Update bed/room status if assigned
        if (!empty($data['bed_id'])) {
            $this->load->model('Ipd_bed_model');
            $this->Ipd_bed_model->assign($data['bed_id'], $admission_id);
        }
        
        if (!empty($data['room_id'])) {
            $this->load->model('Ipd_room_model');
            $this->Ipd_room_model->assign($data['room_id'], $admission_id);
        }
        
        return $admission_id;
    }

    /**
     * Update admission
     */
    public function update($id, $data) {
        // Calculate actual duration if dates changed
        if (isset($data['discharge_date']) || isset($data['admission_date'])) {
            $admission = $this->get_by_id($id);
            if ($admission) {
                $admission_date = $data['admission_date'] ?? $admission['admission_date'];
                $discharge_date = $data['discharge_date'] ?? $admission['discharge_date'];
                
                if ($discharge_date) {
                    $admission_dt = new DateTime($admission_date);
                    $discharge_dt = new DateTime($discharge_date);
                    $data['actual_duration'] = $admission_dt->diff($discharge_dt)->days;
                } else if ($admission_date) {
                    $admission_dt = new DateTime($admission_date);
                    $today = new DateTime();
                    $data['actual_duration'] = $admission_dt->diff($today)->days;
                }
            }
        }
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_admissions', $data);
    }

    /**
     * Delete admission (soft delete by changing status)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('ipd_admissions', array('status' => 'discharged'));
    }

    /**
     * Get dashboard statistics
     */
    public function get_dashboard_stats() {
        $stats = array();
        
        // Current IPD patients
        $this->db->where('status !=', 'discharged');
        $this->db->where('status !=', 'absconded');
        $stats['current_patients'] = $this->db->count_all_results('ipd_admissions');
        
        // Critical patients
        $this->db->where('status', 'critical');
        $stats['critical_patients'] = $this->db->count_all_results('ipd_admissions');
        
        // Today's admissions
        $this->db->where('admission_date', date('Y-m-d'));
        $stats['today_admissions'] = $this->db->count_all_results('ipd_admissions');
        
        // Pending discharges
        $this->db->where('status', 'under-treatment');
        $this->db->where('discharge_date IS NOT NULL');
        $stats['pending_discharges'] = $this->db->count_all_results('ipd_admissions');
        
        // Total beds and available beds
        $this->db->select('
            COUNT(*) as total_beds,
            SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available_beds
        ');
        $this->db->from('ipd_beds');
        $bed_stats = $this->db->get()->row_array();
        $stats['total_beds'] = $bed_stats['total_beds'] ?? 0;
        $stats['available_beds'] = $bed_stats['available_beds'] ?? 0;
        
        // Total rooms and available rooms
        $this->db->select('
            COUNT(*) as total_rooms,
            SUM(CASE WHEN status = "available" THEN 1 ELSE 0 END) as available_rooms
        ');
        $this->db->from('ipd_rooms');
        $room_stats = $this->db->get()->row_array();
        $stats['total_rooms'] = $room_stats['total_rooms'] ?? 0;
        $stats['available_rooms'] = $room_stats['available_rooms'] ?? 0;
        
        return $stats;
    }

    /**
     * Get admission trend (for charts)
     */
    public function get_admission_trend($days = 7) {
        $this->db->select('
            DATE(admission_date) as date,
            COUNT(*) as admissions
        ');
        $this->db->from('ipd_admissions');
        $this->db->where('admission_date >=', date('Y-m-d', strtotime("-{$days} days")));
        $this->db->group_by('DATE(admission_date)');
        $this->db->order_by('date', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get discharge trend (for charts)
     */
    public function get_discharge_trend($days = 7) {
        $this->db->select('
            DATE(discharge_date) as date,
            COUNT(*) as discharges
        ');
        $this->db->from('ipd_admissions');
        $this->db->where('discharge_date >=', date('Y-m-d', strtotime("-{$days} days")));
        $this->db->where('discharge_date IS NOT NULL');
        $this->db->group_by('DATE(discharge_date)');
        $this->db->order_by('date', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get department-wise distribution
     */
    public function get_department_distribution() {
        $this->db->select('
            department,
            COUNT(*) as patient_count
        ');
        $this->db->from('ipd_admissions');
        $this->db->where('status !=', 'discharged');
        $this->db->where('department IS NOT NULL');
        $this->db->group_by('department');
        $this->db->order_by('patient_count', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }
}

