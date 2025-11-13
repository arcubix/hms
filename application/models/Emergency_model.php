<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Emergency_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique ER number in format ER-YYYY-NNNN
     */
    public function generate_er_number() {
        // Check if table exists first
        if (!$this->db->table_exists('emergency_visits')) {
            // Return a default number if table doesn't exist yet
            $year = date('Y');
            return 'ER-' . $year . '-0001';
        }
        
        $year = date('Y');
        $prefix = 'ER-' . $year . '-';
        
        // Get the last ER number for this year
        $this->db->select('er_number');
        $this->db->like('er_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('emergency_visits');
        $last_visit = $query->row_array();
        
        if ($last_visit && preg_match('/ER-' . $year . '-(\d+)/', $last_visit['er_number'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all emergency visits with patient information
     */
    public function get_all($filters = []) {
        $this->db->select('
            ev.*,
            p.id as patient_db_id,
            p.patient_id as patient_uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            p.phone as patient_phone,
            p.email as patient_email,
            p.blood_group as patient_blood_group,
            d.name as doctor_name,
            n.name as nurse_name
        ');
        $this->db->from('emergency_visits ev');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->join('users d', 'd.id = ev.assigned_doctor_id', 'left');
        $this->db->join('users n', 'n.id = ev.assigned_nurse_id', 'left');
        
        // Apply status filter
        if (!empty($filters['status'])) {
            $this->db->where('ev.current_status', $filters['status']);
        }
        
        // Apply search filter (ER number, patient name, UHID)
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ev.er_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('p.patient_id', $search);
            $this->db->or_like('ev.chief_complaint', $search);
            $this->db->group_end();
        }
        
        // Apply date filter
        if (!empty($filters['date_from'])) {
            $this->db->where('ev.arrival_time >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('ev.arrival_time <=', $filters['date_to']);
        }
        
        // Apply triage level filter
        if (!empty($filters['triage_level'])) {
            $this->db->where('ev.triage_level', $filters['triage_level']);
        }
        
        $this->db->order_by('ev.arrival_time', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get emergency visit by ID with full patient details
     */
    public function get_by_id($id) {
        $this->db->select('
            ev.*,
            p.id as patient_db_id,
            p.patient_id as patient_uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            p.phone as patient_phone,
            p.email as patient_email,
            p.blood_group as patient_blood_group,
            p.address as patient_address,
            p.city as patient_city,
            p.state as patient_state,
            d.name as doctor_name,
            n.name as nurse_name
        ');
        $this->db->from('emergency_visits ev');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->join('users d', 'd.id = ev.assigned_doctor_id', 'left');
        $this->db->join('users n', 'n.id = ev.assigned_nurse_id', 'left');
        $this->db->where('ev.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get emergency visit by ER number
     */
    public function get_by_er_number($er_number) {
        $this->db->select('
            ev.*,
            p.id as patient_db_id,
            p.patient_id as patient_uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('emergency_visits ev');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->where('ev.er_number', $er_number);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new emergency visit
     */
    public function create($data) {
        // Check if table exists
        if (!$this->db->table_exists('emergency_visits')) {
            log_message('error', 'emergency_visits table does not exist');
            return array('success' => false, 'message' => 'Database table emergency_visits does not exist. Please run the schema migration.');
        }
        
        // Generate ER number if not provided
        if (empty($data['er_number'])) {
            $data['er_number'] = $this->generate_er_number();
        }
        
        // Ensure patient_id exists
        if (empty($data['patient_id'])) {
            return array('success' => false, 'message' => 'Patient ID is required');
        }
        
        // Get patient's patient_id (UHID) for reference
        try {
            $this->load->model('Patient_model');
            $patient = $this->Patient_model->get_by_id($data['patient_id']);
            if ($patient && isset($patient['patient_id'])) {
                $data['uhid'] = $patient['patient_id'];
            }
        } catch (Exception $e) {
            // If Patient_model fails, continue without uhid
            log_message('error', 'Failed to load patient for UHID: ' . $e->getMessage());
            $data['uhid'] = null;
        }
        
        // Prepare insert data
        $insert_data = array(
            'er_number' => $data['er_number'],
            'patient_id' => intval($data['patient_id']),
            'uhid' => isset($data['uhid']) ? $data['uhid'] : null,
            'arrival_time' => isset($data['arrival_time']) ? $data['arrival_time'] : date('Y-m-d H:i:s'),
            'arrival_mode' => isset($data['arrival_mode']) ? $data['arrival_mode'] : 'walk-in',
            'triage_level' => intval($data['triage_level']),
            'chief_complaint' => $data['chief_complaint'],
            'vitals_bp' => isset($data['vitals_bp']) && !empty($data['vitals_bp']) ? $data['vitals_bp'] : null,
            'vitals_pulse' => isset($data['vitals_pulse']) && !empty($data['vitals_pulse']) ? intval($data['vitals_pulse']) : null,
            'vitals_temp' => isset($data['vitals_temp']) && !empty($data['vitals_temp']) ? floatval($data['vitals_temp']) : null,
            'vitals_spo2' => isset($data['vitals_spo2']) && !empty($data['vitals_spo2']) ? intval($data['vitals_spo2']) : null,
            'vitals_resp' => isset($data['vitals_resp']) && !empty($data['vitals_resp']) ? intval($data['vitals_resp']) : null,
            'current_status' => isset($data['current_status']) ? $data['current_status'] : 'registered',
            'assigned_doctor_id' => isset($data['assigned_doctor_id']) && !empty($data['assigned_doctor_id']) ? intval($data['assigned_doctor_id']) : null,
            'assigned_nurse_id' => isset($data['assigned_nurse_id']) && !empty($data['assigned_nurse_id']) ? intval($data['assigned_nurse_id']) : null,
            'bed_number' => isset($data['bed_number']) && !empty($data['bed_number']) ? $data['bed_number'] : null,
            'investigations' => !empty($data['investigations']) && is_array($data['investigations']) ? json_encode($data['investigations']) : null,
            'medications' => !empty($data['medications']) && is_array($data['medications']) ? json_encode($data['medications']) : null,
            'total_charges' => isset($data['total_charges']) ? floatval($data['total_charges']) : 0.00,
            'created_by' => isset($data['created_by']) ? intval($data['created_by']) : null
        );
        
        // Ensure required fields are present
        if (empty($insert_data['er_number']) || empty($insert_data['patient_id']) || empty($insert_data['triage_level']) || empty($insert_data['chief_complaint'])) {
            return array('success' => false, 'message' => 'Missing required fields');
        }
        
        // Verify patient exists before inserting
        if (!$this->db->table_exists('patients')) {
            return array('success' => false, 'message' => 'Patients table does not exist');
        }
        
        $this->db->where('id', $insert_data['patient_id']);
        $patient_check = $this->db->get('patients');
        if ($patient_check->num_rows() === 0) {
            return array('success' => false, 'message' => 'Patient with ID ' . $insert_data['patient_id'] . ' does not exist');
        }
        
        // Log the insert data for debugging
        log_message('debug', 'Inserting emergency visit: ' . json_encode($insert_data));
        
        if ($this->db->insert('emergency_visits', $insert_data)) {
            $visit_id = $this->db->insert_id();
            
            // Update bed status if bed is assigned
            if (!empty($data['bed_number'])) {
                $this->update_bed_status($data['bed_number'], 'occupied', $visit_id);
            }
            
            return array('success' => true, 'id' => $visit_id, 'er_number' => $data['er_number']);
        } else {
            $error = $this->db->error();
            log_message('error', 'Database insert error: ' . json_encode($error));
            log_message('error', 'Insert data was: ' . json_encode($insert_data));
            $error_message = 'Database error';
            if (isset($error['message'])) {
                $error_message = $error['message'];
            } elseif (isset($error['code'])) {
                $error_message = 'Error code: ' . $error['code'];
            }
            return array('success' => false, 'message' => $error_message);
        }
    }

    /**
     * Update emergency visit
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        
        // Handle JSON fields
        if (isset($data['investigations'])) {
            $data['investigations'] = is_array($data['investigations']) ? json_encode($data['investigations']) : $data['investigations'];
        }
        if (isset($data['medications'])) {
            $data['medications'] = is_array($data['medications']) ? json_encode($data['medications']) : $data['medications'];
        }
        
        return $this->db->update('emergency_visits', $data);
    }

    /**
     * Update triage information
     */
    public function update_triage($id, $triage_data) {
        $update_data = array(
            'triage_level' => $triage_data['triage_level'],
            'chief_complaint' => $triage_data['chief_complaint'] ?? null,
            'vitals_bp' => $triage_data['vitals_bp'] ?? null,
            'vitals_pulse' => $triage_data['vitals_pulse'] ?? null,
            'vitals_temp' => $triage_data['vitals_temp'] ?? null,
            'vitals_spo2' => $triage_data['vitals_spo2'] ?? null,
            'vitals_resp' => $triage_data['vitals_resp'] ?? null,
            'current_status' => 'triaged'
        );
        
        return $this->update($id, $update_data);
    }

    /**
     * Update disposition
     */
    public function update_disposition($id, $disposition_data) {
        $update_data = array(
            'disposition' => $disposition_data['disposition'],
            'disposition_details' => $disposition_data['disposition_details'] ?? null,
            'disposition_time' => date('Y-m-d H:i:s'),
            'follow_up_required' => $disposition_data['follow_up_required'] ?? 0,
            'follow_up_date' => $disposition_data['follow_up_date'] ?? null,
            'medications_prescribed' => $disposition_data['medications_prescribed'] ?? null,
            'current_status' => 'completed'
        );
        
        // Release bed if patient is being discharged/transferred
        $visit = $this->get_by_id($id);
        if ($visit && !empty($visit['bed_number'])) {
            $this->update_bed_status($visit['bed_number'], 'available', null);
        }
        
        return $this->update($id, $update_data);
    }

    /**
     * Update visit status
     */
    public function update_status($id, $status) {
        $valid_statuses = array('registered', 'triaged', 'in-treatment', 'awaiting-disposition', 'completed');
        if (!in_array($status, $valid_statuses)) {
            return false;
        }
        
        return $this->update($id, array('current_status' => $status));
    }

    /**
     * Get dashboard statistics
     */
    public function get_stats() {
        $stats = array();
        
        // Total visits
        $stats['total'] = $this->db->count_all_results('emergency_visits');
        
        // Count by status
        $statuses = array('registered', 'triaged', 'in-treatment', 'awaiting-disposition', 'completed');
        foreach ($statuses as $status) {
            $this->db->where('current_status', $status);
            $stats[$status] = $this->db->count_all_results('emergency_visits');
        }
        
        // Count by disposition
        $dispositions = array('discharge', 'admit-ward', 'admit-private', 'transfer');
        foreach ($dispositions as $disposition) {
            $this->db->where('disposition', $disposition);
            $stats[$disposition] = $this->db->count_all_results('emergency_visits');
        }
        
        // Calculate average wait time (in minutes)
        $this->db->select('AVG(TIMESTAMPDIFF(MINUTE, arrival_time, NOW())) as avg_wait');
        $this->db->where('current_status !=', 'completed');
        $query = $this->db->get('emergency_visits');
        $result = $query->row_array();
        $stats['avg_wait_time'] = round($result['avg_wait'] ?? 0);
        
        // Triage distribution
        $this->db->select('triage_level, COUNT(*) as count');
        $this->db->group_by('triage_level');
        $query = $this->db->get('emergency_visits');
        $triage_results = $query->result_array();
        
        $stats['triage_distribution'] = array(1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0);
        foreach ($triage_results as $row) {
            $stats['triage_distribution'][$row['triage_level']] = intval($row['count']);
        }
        
        return $stats;
    }

    /**
     * Get available ER beds
     */
    public function get_available_beds() {
        // Check if emergency_beds table exists
        if (!$this->db->table_exists('emergency_beds')) {
            // Return empty array if table doesn't exist
            return array();
        }
        
        $this->db->where('status', 'available');
        $this->db->or_where('status', 'reserved');
        $query = $this->db->get('emergency_beds');
        return $query->result_array();
    }

    /**
     * Update bed status
     */
    private function update_bed_status($bed_number, $status, $visit_id = null) {
        if (!$this->db->table_exists('emergency_beds')) {
            return false;
        }
        
        $update_data = array(
            'status' => $status,
            'current_visit_id' => $visit_id
        );
        
        $this->db->where('bed_number', $bed_number);
        return $this->db->update('emergency_beds', $update_data);
    }
}
