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
        // First, get current values to compare
        $current = $this->get_by_id($id);
        if (!$current) {
            log_message('error', 'Emergency_model->update: Visit with id ' . $id . ' not found');
            return false;
        }
        
        log_message('debug', 'Emergency_model->update current values for id ' . $id . ': ' . json_encode(array(
            'chief_complaint' => $current['chief_complaint'] ?? null,
            'triage_level' => $current['triage_level'] ?? null,
            'bed_number' => $current['bed_number'] ?? null,
            'current_status' => $current['current_status'] ?? null
        )));
        
        // Handle JSON fields
        if (isset($data['investigations'])) {
            $data['investigations'] = is_array($data['investigations']) ? json_encode($data['investigations']) : $data['investigations'];
        }
        if (isset($data['medications'])) {
            $data['medications'] = is_array($data['medications']) ? json_encode($data['medications']) : $data['medications'];
        }
        
        // Ensure data types match database schema
        if (isset($data['triage_level'])) {
            $data['triage_level'] = (int)$data['triage_level'];
        }
        
        // Log the update data for debugging
        log_message('debug', 'Emergency_model->update called with id: ' . $id . ', data: ' . json_encode($data));
        
        // Set WHERE clause and update
        $this->db->where('id', (int)$id); // Ensure ID is integer
        $result = $this->db->update('emergency_visits', $data);
        
        // Get the last query for debugging
        $last_query = $this->db->last_query();
        log_message('debug', 'Emergency_model->update last_query: ' . $last_query);
        
        // Check if update actually affected any rows
        $affected_rows = $this->db->affected_rows();
        log_message('debug', 'Emergency_model->update affected_rows: ' . $affected_rows);
        
        // Check for database errors
        $db_error = $this->db->error();
        if ($db_error['code'] != 0) {
            log_message('error', 'Emergency_model->update database error: ' . json_encode($db_error));
            return false;
        }
        
        // If affected_rows is 0, check if values are actually different
        if ($affected_rows === 0) {
            $has_changes = false;
            foreach ($data as $key => $value) {
                $current_value = $current[$key] ?? null;
                // Compare values (handle type differences)
                if ($key === 'triage_level') {
                    if ((int)$current_value !== (int)$value) {
                        $has_changes = true;
                        break;
                    }
                } else {
                    if ((string)$current_value !== (string)$value) {
                        $has_changes = true;
                        break;
                    }
                }
            }
            
            if ($has_changes) {
                log_message('warning', 'Emergency_model->update: Values are different but affected_rows is 0. This may indicate a WHERE clause issue.');
            } else {
                log_message('debug', 'Emergency_model->update: No rows affected - values are unchanged');
            }
        }
        
        return $result !== false; // Return true if query executed successfully
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
            log_message('error', 'emergency_vital_signs table does not exist');
            return array('success' => false, 'message' => 'emergency_vital_signs table does not exist. Please run the database migration.');
        }

        // Validate visit exists
        $visit = $this->get_by_id($visit_id);
        if (!$visit) {
            log_message('error', 'Emergency visit ' . $visit_id . ' not found');
            return array('success' => false, 'message' => 'Emergency visit ' . $visit_id . ' not found');
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'recorded_at' => isset($data['recorded_at']) ? $data['recorded_at'] : date('Y-m-d H:i:s'),
            'recorded_by' => (isset($data['recorded_by']) && !empty($data['recorded_by'])) ? intval($data['recorded_by']) : null,
            'bp' => isset($data['bp']) && !empty($data['bp']) ? $data['bp'] : null,
            'pulse' => isset($data['pulse']) && !empty($data['pulse']) ? intval($data['pulse']) : null,
            'temp' => isset($data['temp']) && !empty($data['temp']) ? floatval($data['temp']) : null,
            'spo2' => isset($data['spo2']) && !empty($data['spo2']) ? intval($data['spo2']) : null,
            'resp' => isset($data['resp']) && !empty($data['resp']) ? intval($data['resp']) : null,
            'pain_score' => isset($data['pain_score']) && !empty($data['pain_score']) ? intval($data['pain_score']) : null,
            'consciousness_level' => isset($data['consciousness_level']) ? $data['consciousness_level'] : null,
            'notes' => isset($data['notes']) ? $data['notes'] : null
        );

        // Log insert data for debugging
        log_message('debug', 'Inserting vital signs: ' . json_encode($insert_data));
        log_message('debug', 'Visit ID: ' . $visit_id);
        log_message('debug', 'Table exists: ' . ($this->db->table_exists('emergency_vital_signs') ? 'YES' : 'NO'));

        // Try the insert using direct SQL to capture actual MySQL error
        // Build SQL with proper escaping
        $sql = "INSERT INTO `emergency_vital_signs` (
            `emergency_visit_id`, 
            `recorded_at`, 
            `recorded_by`, 
            `bp`, 
            `pulse`, 
            `temp`, 
            `spo2`, 
            `resp`, 
            `pain_score`, 
            `consciousness_level`, 
            `notes`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = array(
            intval($visit_id),
            $insert_data['recorded_at'],
            $insert_data['recorded_by'],
            $insert_data['bp'],
            $insert_data['pulse'],
            $insert_data['temp'],
            $insert_data['spo2'],
            $insert_data['resp'],
            $insert_data['pain_score'],
            $insert_data['consciousness_level'],
            $insert_data['notes']
        );
        
        // Execute query and capture errors immediately
        $query = $this->db->query($sql, $params);
        
        // Get error immediately after query
        $error = $this->db->error();
        $insert_id = $this->db->insert_id();
        $affected_rows = $this->db->affected_rows();
        $last_query = $this->db->last_query();
        
        // Get actual MySQL error directly from connection
        $mysql_error = '';
        $mysql_errno = 0;
        $conn = $this->db->conn_id;
        
        if ($conn) {
            if (is_resource($conn)) {
                // mysqli resource
                $mysql_errno = mysqli_errno($conn);
                $mysql_error = mysqli_error($conn);
            } elseif (is_object($conn)) {
                // mysqli object
                if (property_exists($conn, 'errno')) {
                    $mysql_errno = $conn->errno;
                    $mysql_error = $conn->error;
                }
            }
        }
        
        log_message('debug', 'Query result: ' . ($query ? 'true' : 'false'));
        log_message('debug', 'Insert ID: ' . $insert_id);
        log_message('debug', 'Affected rows: ' . $affected_rows);
        log_message('debug', 'CodeIgniter error: ' . json_encode($error));
        log_message('debug', 'MySQL error code: ' . $mysql_errno);
        log_message('debug', 'MySQL error message: ' . $mysql_error);
        
        // Check if insert was successful
        $insert_result = ($query !== false && $insert_id > 0 && $affected_rows > 0);
        
        // If no insert ID or affected rows, it failed
        if (!$insert_result) {
            // Use MySQL error if CodeIgniter error is empty
            if ((empty($error['message']) || $error['code'] == 0) && !empty($mysql_error)) {
                $error['code'] = $mysql_errno;
                $error['message'] = $mysql_error;
                log_message('error', 'Captured MySQL error directly: ' . $mysql_errno . ' - ' . $mysql_error);
            } elseif (empty($error['message']) && $mysql_errno == 0) {
                // No error but insert failed - might be a constraint or trigger issue
                log_message('error', 'Insert failed with no error reported. This might indicate a constraint violation or trigger issue.');
            }
        }
        
        if ($insert_result) {
            // Save insert_id BEFORE doing any other queries (update resets insert_id)
            $saved_insert_id = $insert_id;
            
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
            
            // Return the saved insert_id (not $this->db->insert_id() which gets reset after update)
            log_message('debug', 'Returning insert_id: ' . $saved_insert_id);
            return $saved_insert_id;
        } else {
            $error = $this->db->error();
            $last_query = $this->db->last_query();
            
            log_message('error', '=== VITAL SIGNS INSERT FAILED ===');
            log_message('error', 'Insert data: ' . json_encode($insert_data));
            log_message('error', 'Visit ID: ' . $visit_id);
            log_message('error', 'Last query: ' . $last_query);
            log_message('error', 'CodeIgniter error: ' . json_encode($error));
            log_message('error', 'MySQL error code: ' . $mysql_errno);
            log_message('error', 'MySQL error message: ' . $mysql_error);
            log_message('error', 'Affected rows: ' . $affected_rows);
            log_message('error', 'Insert ID: ' . $insert_id);
            log_message('error', 'Insert success (bool): ' . ($insert_success ? 'true' : 'false'));
            
            // Use MySQL error if available
            if (!empty($mysql_error)) {
                $error['code'] = $mysql_errno;
                $error['message'] = $mysql_error;
            }
            
            $error_message = 'Failed to record vital signs';
            
            // Get detailed error information
            if (isset($error['code']) && $error['code'] != 0) {
                // Common MySQL error codes with user-friendly messages
                switch ($error['code']) {
                    case 1452:
                        // Foreign key constraint failed
                        $error_detail = isset($error['message']) ? $error['message'] : '';
                        if (strpos($error_detail, 'emergency_visit_id') !== false || strpos($error_detail, 'emergency_visits') !== false) {
                            $error_message = 'Foreign key constraint failed: Emergency visit ID ' . $visit_id . ' does not exist in emergency_visits table.';
                        } elseif (strpos($error_detail, 'recorded_by') !== false || strpos($error_detail, 'users') !== false) {
                            $user_id = $insert_data['recorded_by'] ?? 'null';
                            $error_message = 'Foreign key constraint failed: User ID ' . $user_id . ' does not exist in users table.';
                        } else {
                            $error_message = 'Foreign key constraint failed. ' . ($error_detail ?: 'Please check if visit ID and user ID exist.');
                        }
                        break;
                    case 1062:
                        $error_message = 'Duplicate entry. This vital sign record may already exist.';
                        break;
                    case 1054:
                        $error_message = 'Unknown column. The emergency_vital_signs table structure may be incorrect. Please check the table schema.';
                        break;
                    case 1146:
                        $error_message = 'Table does not exist. Please run the database migration to create emergency_vital_signs table.';
                        break;
                    default:
                        $error_message = 'Database error code: ' . $error['code'];
                        if (isset($error['message']) && !empty($error['message'])) {
                            $error_message .= ' - ' . $error['message'];
                        }
                }
            } elseif (isset($error['message']) && !empty($error['message'])) {
                $error_message = $error['message'];
            } else {
                // Check if it's a silent failure (no error but no insert)
                if ($this->db->affected_rows() == 0 && $this->db->insert_id() == 0) {
                    $error_message = 'Insert failed silently. No rows affected. Please check database constraints and table structure.';
                } else {
                    $error_message = 'Unknown database error occurred. Check logs for details.';
                }
            }
            
            // Return error message as array for better error handling
            return array('success' => false, 'message' => $error_message, 'error' => $error, 'query' => $last_query);
        }
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
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert treatment note: ' . json_encode($error));
            return false;
        }
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

        // Get visit to get patient_id
        $visit = $this->get_by_id($visit_id);
        if (!$visit) {
            return false;
        }

        $this->db->trans_start();

        // Insert into emergency_investigation_orders
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

        if (!$this->db->insert('emergency_investigation_orders', $insert_data)) {
            $this->db->trans_rollback();
            $error = $this->db->error();
            log_message('error', 'Failed to insert investigation order: ' . json_encode($error));
            return false;
        }
        
        $investigation_order_id = $this->db->insert_id();

        // Create unified lab order if investigation type is 'lab'
        if (isset($data['investigation_type']) && $data['investigation_type'] === 'lab') {
            $this->load->model('Lab_order_model');
            $this->load->model('Lab_test_model');
            
            // Map priority
            $priority_map = array(
                'normal' => 'routine',
                'urgent' => 'urgent',
                'stat' => 'stat'
            );
            $lab_priority = isset($priority_map[$insert_data['priority']]) ? $priority_map[$insert_data['priority']] : 'stat'; // Default to stat for emergency
            
            // Get test price
            $test_price = 0.00;
            $test_code = $insert_data['test_code'];
            if (!empty($insert_data['lab_test_id'])) {
                $lab_test = $this->Lab_test_model->get_by_id($insert_data['lab_test_id']);
                if ($lab_test) {
                    $test_price = isset($lab_test['price']) ? $lab_test['price'] : 0.00;
                    $test_code = $lab_test['test_code'];
                }
            }
            
            $order_data = array(
                'patient_id' => $visit['patient_id'],
                'order_type' => 'Emergency',
                'order_source_id' => $visit_id,
                'ordered_by_user_id' => $insert_data['ordered_by'],
                'priority' => $lab_priority,
                'notes' => 'Created from emergency visit: ' . ($visit['er_number'] ?? ''),
                'tests' => array(array(
                    'lab_test_id' => $insert_data['lab_test_id'],
                    'test_name' => $insert_data['test_name'],
                    'test_code' => $test_code,
                    'price' => $test_price,
                    'priority' => $lab_priority,
                    'instructions' => $insert_data['notes']
                ))
            );
            
            $lab_order_id = $this->Lab_order_model->create($order_data);
            if (!$lab_order_id) {
                log_message('error', 'Failed to create unified lab order for emergency investigation');
                // Don't rollback - emergency_investigation_orders is more important
            }
        }

        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }

        return $investigation_order_id;
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
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert medication: ' . json_encode($error));
            return false;
        }
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
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert charge: ' . json_encode($error));
            return false;
        }
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
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert status history: ' . json_encode($error));
            return false;
        }
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

    // ============================================
    // NEW METHODS FOR EMERGENCY MODULE
    // ============================================

    /**
     * Get admitted patients (disposition = 'admit-ward' or 'admit-private')
     */
    public function get_admitted_patients($filters = []) {
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
            n.name as nurse_name,
            ew.name as assigned_ward_name,
            ewb.bed_number as assigned_bed_number
        ');
        $this->db->from('emergency_visits ev');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->join('users d', 'd.id = ev.assigned_doctor_id', 'left');
        $this->db->join('users n', 'n.id = ev.assigned_nurse_id', 'left');
        $this->db->join('emergency_wards ew', 'ew.id = ev.assigned_ward_id', 'left');
        $this->db->join('emergency_ward_beds ewb', 'ewb.id = ev.assigned_ward_bed_id', 'left');
        
        // Filter for admitted patients - show patients who:
        // 1. Have a ward/bed assigned (assigned_ward_id or assigned_ward_bed_id is not null), OR
        // 2. Have disposition set to admit-ward or admit-private, OR
        // 3. Are currently in treatment (not discharged/transferred/deceased)
        $this->db->group_start();
        $this->db->where('ev.assigned_ward_id IS NOT NULL');
        $this->db->or_where('ev.assigned_ward_bed_id IS NOT NULL');
        $this->db->or_where_in('ev.disposition', ['admit-ward', 'admit-private']);
        $this->db->or_where_in('ev.current_status', ['registered', 'in-treatment', 'awaiting-disposition', 'admitted', 'in-ward']);
        $this->db->group_end();
        
        // Exclude discharged/transferred/deceased patients (only if disposition is set)
        $this->db->group_start();
        $this->db->where('ev.disposition IS NULL');
        $this->db->or_where_not_in('ev.disposition', ['discharged', 'transferred', 'deceased']);
        $this->db->group_end();
        
        // Apply additional filters
        if (!empty($filters['status'])) {
            $this->db->where('ev.current_status', $filters['status']);
        }
        
        if (!empty($filters['triage_level'])) {
            $this->db->where('ev.triage_level', $filters['triage_level']);
        }
        
        if (!empty($filters['ward_id'])) {
            $this->db->where('ev.assigned_ward_id', $filters['ward_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ev.er_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('p.patient_id', $search);
            $this->db->or_like('ew.name', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('ev.arrival_time >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('ev.arrival_time <=', $filters['date_to']);
        }
        
        $this->db->order_by('ev.arrival_time', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get patient history (completed visits)
     */
    public function get_patient_history($filters = []) {
        $this->db->select('
            ev.*,
            p.id as patient_db_id,
            p.patient_id as patient_uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            d.name as doctor_name,
            n.name as nurse_name
        ');
        $this->db->from('emergency_visits ev');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->join('users d', 'd.id = ev.assigned_doctor_id', 'left');
        $this->db->join('users n', 'n.id = ev.assigned_nurse_id', 'left');
        
        // Filter for completed visits
        $this->db->where('ev.current_status', 'completed');
        
        // Apply additional filters
        if (!empty($filters['patient_id'])) {
            $this->db->where('ev.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ev.er_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('p.patient_id', $search);
            $this->db->or_like('ev.chief_complaint', $search);
            $this->db->or_like('ev.primary_diagnosis', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('ev.arrival_time >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('ev.arrival_time <=', $filters['date_to']);
        }
        
        if (!empty($filters['disposition'])) {
            $this->db->where('ev.disposition', $filters['disposition']);
        }
        
        $this->db->order_by('ev.arrival_time', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update ward assignment for emergency visit
     */
    public function update_ward_assignment($visit_id, $ward_id, $bed_id) {
        $visit = $this->get_by_id($visit_id);
        if (!$visit) {
            return ['success' => false, 'message' => 'Emergency visit not found'];
        }
        
        $update_data = [];
        
        if ($ward_id !== null) {
            $update_data['assigned_ward_id'] = $ward_id;
        }
        
        if ($bed_id !== null) {
            $update_data['assigned_ward_bed_id'] = $bed_id;
            
            // Update bed status if bed_id is provided
            if ($this->db->table_exists('emergency_ward_beds')) {
                $this->load->model('Emergency_ward_bed_model');
                $this->Emergency_ward_bed_model->assign_patient($bed_id, $visit_id);
            }
        }
        
        if (!empty($update_data)) {
            $this->db->where('id', $visit_id);
            $this->db->update('emergency_visits', $update_data);
        }
        
        return ['success' => true, 'message' => 'Ward assignment updated'];
    }

    /**
     * Transfer patient (creates transfer record and updates assignments)
     */
    public function transfer_patient($visit_id, $transfer_data) {
        // Validate visit exists
        $visit = $this->get_by_id($visit_id);
        if (!$visit) {
            log_message('error', 'Transfer failed: Emergency visit ' . $visit_id . ' not found');
            return ['success' => false, 'message' => 'Emergency visit not found'];
        }
        
        // Ensure emergency_visit_id is set in transfer_data
        $transfer_data['emergency_visit_id'] = intval($visit_id);
        
        // Create transfer record
        $this->load->model('Emergency_transfer_model');
        $transfer_id = $this->Emergency_transfer_model->create($transfer_data);
        
        if (!$transfer_id) {
            $error = $this->db->error();
            log_message('error', 'Failed to create transfer record: ' . json_encode($error));
            return ['success' => false, 'message' => 'Failed to create transfer record. Please check database table exists and required fields are provided.'];
        }
        
        // Update visit with new ward/bed assignment if internal transfer
        if (isset($transfer_data['transfer_type']) && $transfer_data['transfer_type'] === 'internal' && isset($transfer_data['to_ward_id'])) {
            $this->update_ward_assignment(
                $visit_id,
                $transfer_data['to_ward_id'],
                $transfer_data['to_bed_id'] ?? null
            );
        }
        
        log_message('info', 'Patient transfer created successfully: Visit ID ' . $visit_id . ', Transfer ID ' . $transfer_id);
        return ['success' => true, 'transfer_id' => $transfer_id, 'message' => 'Patient transferred successfully'];
    }

    // ============================================
    // PATIENT FILES METHODS
    // ============================================

    /**
     * Get all patient files for an emergency visit
     */
    public function get_patient_files($visit_id) {
        if (!$this->db->table_exists('emergency_patient_files')) {
            return array();
        }

        $this->db->select('epf.*, u.name as uploaded_by_name');
        $this->db->from('emergency_patient_files epf');
        $this->db->join('users u', 'u.id = epf.uploaded_by', 'left');
        $this->db->where('epf.emergency_visit_id', $visit_id);
        $this->db->order_by('epf.uploaded_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Upload a patient file
     */
    public function upload_patient_file($visit_id, $file_data) {
        if (!$this->db->table_exists('emergency_patient_files')) {
            return false;
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'file_name' => $file_data['file_name'],
            'file_type' => $file_data['file_type'] ?? null,
            'file_path' => $file_data['file_path'],
            'file_size' => isset($file_data['file_size']) ? intval($file_data['file_size']) : null,
            'category' => $file_data['category'] ?? 'Other',
            'description' => $file_data['description'] ?? null,
            'uploaded_by' => isset($file_data['uploaded_by']) ? intval($file_data['uploaded_by']) : null,
            'uploaded_at' => date('Y-m-d H:i:s')
        );

        if ($this->db->insert('emergency_patient_files', $insert_data)) {
            return $this->db->insert_id();
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert patient file: ' . json_encode($error));
            return false;
        }
    }

    /**
     * Delete a patient file
     */
    public function delete_patient_file($file_id) {
        if (!$this->db->table_exists('emergency_patient_files')) {
            return false;
        }

        $this->db->where('id', $file_id);
        return $this->db->delete('emergency_patient_files');
    }

    // ============================================
    // INTAKE & OUTPUT METHODS
    // ============================================

    /**
     * Get intake/output records for an emergency visit
     */
    public function get_intake_output($visit_id, $filters = array()) {
        if (!$this->db->table_exists('emergency_intake_output')) {
            return array();
        }

        $this->db->select('eio.*, u.name as recorded_by_name');
        $this->db->from('emergency_intake_output eio');
        $this->db->join('users u', 'u.id = eio.recorded_by', 'left');
        $this->db->where('eio.emergency_visit_id', $visit_id);

        if (!empty($filters['date_from'])) {
            $this->db->where('eio.record_time >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('eio.record_time <=', $filters['date_to']);
        }

        $this->db->order_by('eio.record_time', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Add intake/output record
     */
    public function add_intake_output($visit_id, $data) {
        if (!$this->db->table_exists('emergency_intake_output')) {
            return false;
        }

        $intake_amount = isset($data['intake_amount_ml']) ? floatval($data['intake_amount_ml']) : 0.00;
        $output_amount = isset($data['output_amount_ml']) ? floatval($data['output_amount_ml']) : 0.00;
        $balance = $intake_amount - $output_amount;

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'record_time' => isset($data['record_time']) ? $data['record_time'] : date('Y-m-d H:i:s'),
            'intake_type' => $data['intake_type'] ?? null,
            'intake_amount_ml' => $intake_amount,
            'output_type' => $data['output_type'] ?? null,
            'output_amount_ml' => $output_amount,
            'balance_ml' => $balance,
            'recorded_by' => isset($data['recorded_by']) ? intval($data['recorded_by']) : null,
            'notes' => $data['notes'] ?? null
        );

        if ($this->db->insert('emergency_intake_output', $insert_data)) {
            return $this->db->insert_id();
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert intake/output: ' . json_encode($error));
            return false;
        }
    }

    // ============================================
    // BLOOD BANK METHODS
    // ============================================

    /**
     * Get blood bank requests for an emergency visit
     */
    public function get_blood_bank_requests($visit_id) {
        if (!$this->db->table_exists('emergency_blood_bank_requests')) {
            return array();
        }

        $this->db->select('ebbr.*, u1.name as requested_by_name, u2.name as issued_by_name');
        $this->db->from('emergency_blood_bank_requests ebbr');
        $this->db->join('users u1', 'u1.id = ebbr.requested_by', 'left');
        $this->db->join('users u2', 'u2.id = ebbr.issued_by', 'left');
        $this->db->where('ebbr.emergency_visit_id', $visit_id);
        $this->db->order_by('ebbr.request_date', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create blood bank request
     */
    public function create_blood_bank_request($visit_id, $data) {
        if (!$this->db->table_exists('emergency_blood_bank_requests')) {
            return false;
        }

        // Generate request number if not provided
        if (empty($data['request_number'])) {
            $year = date('Y');
            $this->db->select('request_number');
            $this->db->like('request_number', 'BB-' . $year . '-', 'after');
            $this->db->order_by('id', 'DESC');
            $this->db->limit(1);
            $query = $this->db->get('emergency_blood_bank_requests');
            $last_request = $query->row_array();
            
            if ($last_request && preg_match('/BB-' . $year . '-(\d+)/', $last_request['request_number'], $matches)) {
                $next_number = intval($matches[1]) + 1;
            } else {
                $next_number = 1;
            }
            $data['request_number'] = 'BB-' . $year . '-' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'request_number' => $data['request_number'],
            'product_type' => $data['product_type'],
            'units' => isset($data['units']) ? intval($data['units']) : 1,
            'request_date' => isset($data['request_date']) ? $data['request_date'] : date('Y-m-d H:i:s'),
            'urgency' => $data['urgency'] ?? 'Routine',
            'status' => $data['status'] ?? 'Requested',
            'requested_by' => isset($data['requested_by']) ? intval($data['requested_by']) : null,
            'cross_match_status' => $data['cross_match_status'] ?? 'Pending',
            'notes' => $data['notes'] ?? null
        );

        if ($this->db->insert('emergency_blood_bank_requests', $insert_data)) {
            return $this->db->insert_id();
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert blood bank request: ' . json_encode($error));
            return false;
        }
    }

    /**
     * Update blood bank request status
     */
    public function update_blood_request_status($request_id, $status, $additional_data = array()) {
        if (!$this->db->table_exists('emergency_blood_bank_requests')) {
            return false;
        }

        $update_data = array('status' => $status);
        
        if ($status === 'Issued' && !isset($additional_data['issued_at'])) {
            $update_data['issued_at'] = date('Y-m-d H:i:s');
        }
        if (isset($additional_data['issued_by'])) {
            $update_data['issued_by'] = intval($additional_data['issued_by']);
        }
        if (isset($additional_data['transfusion_date'])) {
            $update_data['transfusion_date'] = $additional_data['transfusion_date'];
        }
        if (isset($additional_data['transfusion_start_time'])) {
            $update_data['transfusion_start_time'] = $additional_data['transfusion_start_time'];
        }
        if (isset($additional_data['transfusion_end_time'])) {
            $update_data['transfusion_end_time'] = $additional_data['transfusion_end_time'];
        }
        if (isset($additional_data['reaction_notes'])) {
            $update_data['reaction_notes'] = $additional_data['reaction_notes'];
        }
        if (isset($additional_data['notes'])) {
            $update_data['notes'] = $additional_data['notes'];
        }

        $this->db->where('id', $request_id);
        return $this->db->update('emergency_blood_bank_requests', $update_data);
    }

    // ============================================
    // HEALTH & PHYSICAL METHODS
    // ============================================

    /**
     * Get health & physical records for an emergency visit
     */
    public function get_health_physical($visit_id) {
        if (!$this->db->table_exists('emergency_health_physical')) {
            return array();
        }

        $this->db->select('ehp.*, u.name as provider_name');
        $this->db->from('emergency_health_physical ehp');
        $this->db->join('users u', 'u.id = ehp.provider_id', 'left');
        $this->db->where('ehp.emergency_visit_id', $visit_id);
        $this->db->order_by('ehp.examination_date', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create health & physical record
     */
    public function create_health_physical($visit_id, $data) {
        if (!$this->db->table_exists('emergency_health_physical')) {
            return false;
        }

        // Get provider name if provider_id is provided
        $provider_name = null;
        if (!empty($data['provider_id'])) {
            $this->db->select('name');
            $this->db->where('id', $data['provider_id']);
            $query = $this->db->get('users');
            $user = $query->row_array();
            if ($user) {
                $provider_name = $user['name'];
            }
        }

        $insert_data = array(
            'emergency_visit_id' => intval($visit_id),
            'examination_date' => isset($data['examination_date']) ? $data['examination_date'] : date('Y-m-d H:i:s'),
            'chief_complaint' => $data['chief_complaint'] ?? null,
            'history_of_present_illness' => $data['history_of_present_illness'] ?? null,
            'past_medical_history' => $data['past_medical_history'] ?? null,
            'allergies' => $data['allergies'] ?? null,
            'medications' => $data['medications'] ?? null,
            'social_history' => $data['social_history'] ?? null,
            'family_history' => $data['family_history'] ?? null,
            'review_of_systems' => $data['review_of_systems'] ?? null,
            'physical_examination' => $data['physical_examination'] ?? '',
            'assessment' => $data['assessment'] ?? null,
            'plan' => $data['plan'] ?? null,
            'provider_id' => isset($data['provider_id']) ? intval($data['provider_id']) : null,
            'provider_name' => $provider_name
        );

        if ($this->db->insert('emergency_health_physical', $insert_data)) {
            return $this->db->insert_id();
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert health & physical: ' . json_encode($error));
            return false;
        }
    }
}
