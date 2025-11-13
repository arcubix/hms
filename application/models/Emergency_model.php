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
    public function update_status($id, $status, $changed_by = null, $notes = null) {
        $valid_statuses = array('registered', 'triaged', 'in-treatment', 'awaiting-disposition', 'completed');
        if (!in_array($status, $valid_statuses)) {
            return false;
        }
        
        // Get current status
        $visit = $this->get_by_id($id);
        $from_status = $visit['current_status'] ?? null;
        
        // Prepare update data
        $update_data = array('current_status' => $status);
        
        // Update timestamps based on status
        if ($status === 'in-treatment' && empty($visit['treatment_started_at'])) {
            $update_data['treatment_started_at'] = date('Y-m-d H:i:s');
        }
        
        if ($status === 'awaiting-disposition' && empty($visit['treatment_completed_at'])) {
            $update_data['treatment_completed_at'] = date('Y-m-d H:i:s');
        }
        
        $result = $this->update($id, $update_data);
        
        // Record status change in history
        if ($result) {
            $this->record_status_change($id, $from_status, $status, $changed_by, $notes);
        }
        
        return $result;
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

    // ============================================
    // WORKFLOW METHODS - Vital Signs
    // ============================================

    /**
     * Record vital signs for emergency visit
     */
    public function record_vital_signs($visit_id, $data) {
        if (!$this->db->table_exists('emergency_vital_signs')) {
            return false;
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'recorded_at' => isset($data['recorded_at']) ? $data['recorded_at'] : date('Y-m-d H:i:s'),
            'recorded_by' => isset($data['recorded_by']) ? intval($data['recorded_by']) : null,
            'bp' => isset($data['bp']) && !empty($data['bp']) ? $data['bp'] : null,
            'pulse' => isset($data['pulse']) && !empty($data['pulse']) ? intval($data['pulse']) : null,
            'temp' => isset($data['temp']) && !empty($data['temp']) ? floatval($data['temp']) : null,
            'spo2' => isset($data['spo2']) && !empty($data['spo2']) ? intval($data['spo2']) : null,
            'resp' => isset($data['resp']) && !empty($data['resp']) ? intval($data['resp']) : null,
            'pain_score' => isset($data['pain_score']) && !empty($data['pain_score']) ? intval($data['pain_score']) : null,
            'consciousness_level' => isset($data['consciousness_level']) ? $data['consciousness_level'] : null,
            'notes' => isset($data['notes']) ? $data['notes'] : null
        );

        if ($this->db->insert('emergency_vital_signs', $insert_data)) {
            // Update latest vitals in emergency_visits table
            $this->db->where('id', $visit_id);
            $update_vitals = array();
            if (isset($data['bp'])) $update_vitals['vitals_bp'] = $data['bp'];
            if (isset($data['pulse'])) $update_vitals['vitals_pulse'] = intval($data['pulse']);
            if (isset($data['temp'])) $update_vitals['vitals_temp'] = floatval($data['temp']);
            if (isset($data['spo2'])) $update_vitals['vitals_spo2'] = intval($data['spo2']);
            if (isset($data['resp'])) $update_vitals['vitals_resp'] = intval($data['resp']);
            
            if (!empty($update_vitals)) {
                $this->db->update('emergency_visits', $update_vitals);
            }
            
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get vital signs history for emergency visit
     */
    public function get_vital_signs_history($visit_id) {
        if (!$this->db->table_exists('emergency_vital_signs')) {
            return array();
        }

        $this->db->select('evs.*, u.name as recorded_by_name');
        $this->db->from('emergency_vital_signs evs');
        $this->db->join('users u', 'u.id = evs.recorded_by', 'left');
        $this->db->where('evs.emergency_visit_id', $visit_id);
        $this->db->order_by('evs.recorded_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    // ============================================
    // WORKFLOW METHODS - Treatment Notes
    // ============================================

    /**
     * Add treatment note
     */
    public function add_treatment_note($visit_id, $data) {
        if (!$this->db->table_exists('emergency_treatment_notes')) {
            return false;
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'note_type' => isset($data['note_type']) ? $data['note_type'] : 'observation',
            'note_text' => $data['note_text'],
            'recorded_by' => isset($data['recorded_by']) ? intval($data['recorded_by']) : null,
            'recorded_at' => isset($data['recorded_at']) ? $data['recorded_at'] : date('Y-m-d H:i:s'),
            'attachments' => isset($data['attachments']) && is_array($data['attachments']) ? json_encode($data['attachments']) : null
        );

        if ($this->db->insert('emergency_treatment_notes', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get treatment notes for emergency visit
     */
    public function get_treatment_notes($visit_id, $filters = array()) {
        if (!$this->db->table_exists('emergency_treatment_notes')) {
            return array();
        }

        $this->db->select('etn.*, u.name as recorded_by_name, u.role as recorded_by_role');
        $this->db->from('emergency_treatment_notes etn');
        $this->db->join('users u', 'u.id = etn.recorded_by', 'left');
        $this->db->where('etn.emergency_visit_id', $visit_id);

        if (!empty($filters['note_type'])) {
            $this->db->where('etn.note_type', $filters['note_type']);
        }

        if (!empty($filters['date_from'])) {
            $this->db->where('etn.recorded_at >=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $this->db->where('etn.recorded_at <=', $filters['date_to']);
        }

        $this->db->order_by('etn.recorded_at', 'DESC');
        $query = $this->db->get();
        $notes = $query->result_array();

        // Parse attachments JSON
        foreach ($notes as &$note) {
            if (!empty($note['attachments'])) {
                $note['attachments'] = json_decode($note['attachments'], true);
            } else {
                $note['attachments'] = array();
            }
        }

        return $notes;
    }

    // ============================================
    // WORKFLOW METHODS - Investigation Orders
    // ============================================

    /**
     * Order investigation
     */
    public function order_investigation($visit_id, $data) {
        if (!$this->db->table_exists('emergency_investigation_orders')) {
            return false;
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'investigation_type' => isset($data['investigation_type']) ? $data['investigation_type'] : 'lab',
            'test_name' => $data['test_name'],
            'test_code' => isset($data['test_code']) ? $data['test_code'] : null,
            'lab_test_id' => isset($data['lab_test_id']) && !empty($data['lab_test_id']) ? intval($data['lab_test_id']) : null,
            'priority' => isset($data['priority']) ? $data['priority'] : 'normal',
            'ordered_by' => isset($data['ordered_by']) ? intval($data['ordered_by']) : null,
            'ordered_at' => isset($data['ordered_at']) ? $data['ordered_at'] : date('Y-m-d H:i:s'),
            'status' => 'ordered',
            'notes' => isset($data['notes']) ? $data['notes'] : null
        );

        if ($this->db->insert('emergency_investigation_orders', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get investigation orders for emergency visit
     */
    public function get_investigation_orders($visit_id) {
        if (!$this->db->table_exists('emergency_investigation_orders')) {
            return array();
        }

        $this->db->select('eio.*, u.name as ordered_by_name, lt.test_name as lab_test_name');
        $this->db->from('emergency_investigation_orders eio');
        $this->db->join('users u', 'u.id = eio.ordered_by', 'left');
        $this->db->join('lab_tests lt', 'lt.id = eio.lab_test_id', 'left');
        $this->db->where('eio.emergency_visit_id', $visit_id);
        $this->db->order_by('eio.ordered_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update investigation order status
     */
    public function update_investigation_status($order_id, $status, $result_data = null) {
        if (!$this->db->table_exists('emergency_investigation_orders')) {
            return false;
        }

        $update_data = array('status' => $status);
        
        if (isset($result_data['result_id'])) {
            $update_data['result_id'] = intval($result_data['result_id']);
        }
        
        if (isset($result_data['result_value'])) {
            $update_data['result_value'] = $result_data['result_value'];
        }

        $this->db->where('id', $order_id);
        return $this->db->update('emergency_investigation_orders', $update_data);
    }

    // ============================================
    // WORKFLOW METHODS - Medication Administration
    // ============================================

    /**
     * Administer medication
     */
    public function administer_medication($visit_id, $data) {
        if (!$this->db->table_exists('emergency_medication_administration')) {
            return false;
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'medication_name' => $data['medication_name'],
            'dosage' => $data['dosage'],
            'route' => isset($data['route']) ? $data['route'] : 'PO',
            'frequency' => isset($data['frequency']) ? $data['frequency'] : null,
            'administered_by' => isset($data['administered_by']) ? intval($data['administered_by']) : null,
            'administered_at' => isset($data['administered_at']) ? $data['administered_at'] : date('Y-m-d H:i:s'),
            'status' => isset($data['status']) ? $data['status'] : 'given',
            'notes' => isset($data['notes']) ? $data['notes'] : null
        );

        if ($this->db->insert('emergency_medication_administration', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get medication history for emergency visit
     */
    public function get_medication_history($visit_id) {
        if (!$this->db->table_exists('emergency_medication_administration')) {
            return array();
        }

        $this->db->select('ema.*, u.name as administered_by_name');
        $this->db->from('emergency_medication_administration ema');
        $this->db->join('users u', 'u.id = ema.administered_by', 'left');
        $this->db->where('ema.emergency_visit_id', $visit_id);
        $this->db->order_by('ema.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update medication status
     */
    public function update_medication_status($medication_id, $status, $data = array()) {
        if (!$this->db->table_exists('emergency_medication_administration')) {
            return false;
        }

        $update_data = array('status' => $status);
        
        if ($status === 'given' && empty($data['administered_at'])) {
            $update_data['administered_at'] = date('Y-m-d H:i:s');
        }
        
        if (isset($data['administered_by'])) {
            $update_data['administered_by'] = intval($data['administered_by']);
        }
        
        if (isset($data['notes'])) {
            $update_data['notes'] = $data['notes'];
        }

        $this->db->where('id', $medication_id);
        return $this->db->update('emergency_medication_administration', $update_data);
    }

    // ============================================
    // WORKFLOW METHODS - Charges/Billing
    // ============================================

    /**
     * Add charge item
     */
    public function add_charge($visit_id, $data) {
        if (!$this->db->table_exists('emergency_charges')) {
            return false;
        }

        $quantity = isset($data['quantity']) ? floatval($data['quantity']) : 1.00;
        $unit_price = floatval($data['unit_price']);
        $total_amount = $quantity * $unit_price;

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'charge_type' => $data['charge_type'],
            'item_name' => $data['item_name'],
            'quantity' => $quantity,
            'unit_price' => $unit_price,
            'total_amount' => $total_amount,
            'charged_by' => isset($data['charged_by']) ? intval($data['charged_by']) : null,
            'charged_at' => isset($data['charged_at']) ? $data['charged_at'] : date('Y-m-d H:i:s'),
            'notes' => isset($data['notes']) ? $data['notes'] : null
        );

        if ($this->db->insert('emergency_charges', $insert_data)) {
            // Update total charges in emergency_visits
            $this->calculate_total_charges($visit_id);
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get charges for emergency visit
     */
    public function get_charges($visit_id) {
        if (!$this->db->table_exists('emergency_charges')) {
            return array();
        }

        $this->db->select('ec.*, u.name as charged_by_name');
        $this->db->from('emergency_charges ec');
        $this->db->join('users u', 'u.id = ec.charged_by', 'left');
        $this->db->where('ec.emergency_visit_id', $visit_id);
        $this->db->order_by('ec.charged_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Calculate and update total charges
     */
    public function calculate_total_charges($visit_id) {
        if (!$this->db->table_exists('emergency_charges')) {
            return 0;
        }

        $this->db->select_sum('total_amount');
        $this->db->where('emergency_visit_id', $visit_id);
        $query = $this->db->get('emergency_charges');
        $result = $query->row_array();
        $total = floatval($result['total_amount'] ?? 0);

        // Update emergency_visits table
        $this->db->where('id', $visit_id);
        $this->db->update('emergency_visits', array('total_charges' => $total));

        return $total;
    }

    /**
     * Delete charge item
     */
    public function delete_charge($charge_id, $visit_id) {
        if (!$this->db->table_exists('emergency_charges')) {
            return false;
        }

        $this->db->where('id', $charge_id);
        $this->db->where('emergency_visit_id', $visit_id);
        $result = $this->db->delete('emergency_charges');

        if ($result) {
            $this->calculate_total_charges($visit_id);
        }

        return $result;
    }

    // ============================================
    // WORKFLOW METHODS - Status History
    // ============================================

    /**
     * Record status change
     */
    public function record_status_change($visit_id, $from_status, $to_status, $changed_by = null, $notes = null) {
        if (!$this->db->table_exists('emergency_status_history')) {
            return false;
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'from_status' => $from_status,
            'to_status' => $to_status,
            'changed_by' => $changed_by ? intval($changed_by) : null,
            'changed_at' => date('Y-m-d H:i:s'),
            'notes' => $notes
        );

        if ($this->db->insert('emergency_status_history', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get status history for emergency visit
     */
    public function get_status_history($visit_id) {
        if (!$this->db->table_exists('emergency_status_history')) {
            return array();
        }

        $this->db->select('esh.*, u.name as changed_by_name');
        $this->db->from('emergency_status_history esh');
        $this->db->join('users u', 'u.id = esh.changed_by', 'left');
        $this->db->where('esh.emergency_visit_id', $visit_id);
        $this->db->order_by('esh.changed_at', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    // ============================================
    // WORKFLOW METHODS - IPD Integration
    // ============================================

    /**
     * Create IPD admission from ER visit
     */
    public function create_ipd_admission($visit_id, $data) {
        // Check if IPD admissions table exists
        if (!$this->db->table_exists('ipd_admissions')) {
            // If IPD table doesn't exist, just create the link record
            if ($this->db->table_exists('emergency_ipd_admissions')) {
                $link_data = array(
                    'emergency_visit_id' => intval($visit_id),
                    'admission_type' => $data['admission_type'],
                    'admitted_by' => isset($data['admitted_by']) ? intval($data['admitted_by']) : null,
                    'notes' => isset($data['notes']) ? $data['notes'] : null
                );
                $this->db->insert('emergency_ipd_admissions', $link_data);
            }
            return array('success' => false, 'message' => 'IPD admissions table does not exist');
        }

        // Get emergency visit details
        $visit = $this->get_by_id($visit_id);
        if (!$visit) {
            return array('success' => false, 'message' => 'Emergency visit not found');
        }

        // Create IPD admission record
        $this->load->model('IPD_model');
        if (!class_exists('IPD_model')) {
            // If IPD_model doesn't exist, create basic admission
            $ipd_data = array(
                'patient_id' => $visit['patient_db_id'],
                'admission_type' => $data['admission_type'] === 'ward' ? 'Emergency' : 'Planned',
                'ward_id' => isset($data['ward_id']) ? intval($data['ward_id']) : null,
                'bed_id' => isset($data['bed_id']) ? intval($data['bed_id']) : null,
                'consulting_doctor_id' => $visit['assigned_doctor_id'] ?? null,
                'primary_diagnosis' => $visit['chief_complaint'] ?? '',
                'admitted_by' => isset($data['admitted_by']) ? intval($data['admitted_by']) : null
            );

            // Try to insert into ipd_admissions if table exists
            if ($this->db->table_exists('ipd_admissions')) {
                $ipd_data['admission_date'] = date('Y-m-d H:i:s');
                if ($this->db->insert('ipd_admissions', $ipd_data)) {
                    $ipd_admission_id = $this->db->insert_id();
                } else {
                    return array('success' => false, 'message' => 'Failed to create IPD admission');
                }
            } else {
                return array('success' => false, 'message' => 'IPD admissions table does not exist');
            }
        } else {
            // Use IPD_model if available
            $ipd_result = $this->IPD_model->create_admission_from_er($visit, $data);
            if (!$ipd_result['success']) {
                return $ipd_result;
            }
            $ipd_admission_id = $ipd_result['id'];
        }

        // Link ER visit to IPD admission
        if ($this->db->table_exists('emergency_ipd_admissions')) {
            $link_data = array(
                'emergency_visit_id' => intval($visit_id),
                'ipd_admission_id' => $ipd_admission_id,
                'admission_type' => $data['admission_type'],
                'admitted_by' => isset($data['admitted_by']) ? intval($data['admitted_by']) : null,
                'notes' => isset($data['notes']) ? $data['notes'] : null
            );
            $this->db->insert('emergency_ipd_admissions', $link_data);
        }

        // Update emergency_visits table
        $this->db->where('id', $visit_id);
        $this->db->update('emergency_visits', array(
            'ipd_admission_id' => $ipd_admission_id,
            'disposition' => $data['admission_type'] === 'ward' ? 'admit-ward' : 'admit-private',
            'disposition_time' => date('Y-m-d H:i:s')
        ));

        return array('success' => true, 'id' => $ipd_admission_id);
    }

    /**
     * Get IPD admission link for ER visit
     */
    public function get_ipd_admission_link($visit_id) {
        if (!$this->db->table_exists('emergency_ipd_admissions')) {
            return null;
        }

        $this->db->where('emergency_visit_id', $visit_id);
        $query = $this->db->get('emergency_ipd_admissions');
        return $query->row_array();
    }
}
