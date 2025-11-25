<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Emergency Department API Controller
 */
class Emergency extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Emergency_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all emergency visits or create new visit
     * GET /api/emergency/visits
     * POST /api/emergency/visits
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'triage_level' => $this->input->get('triage_level'),
                    'date_from' => $this->input->get('date_from'),
                    'date_to' => $this->input->get('date_to')
                );
                
                $visits = $this->Emergency_model->get_all($filters);
                
                // Format visits for frontend
                $formatted_visits = array();
                foreach ($visits as $visit) {
                    $formatted_visits[] = $this->format_visit($visit);
                }
                
                $this->success($formatted_visits);
                
            } elseif ($method === 'POST') {
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new emergency visit
     */
    public function create() {
        try {
            $data = json_decode($this->input->raw_input_stream, true);
            
            if (empty($data)) {
                $data = $this->input->post();
            }
            
            // Log received data for debugging
            log_message('debug', 'Emergency create - Received data: ' . json_encode($data));
            
            // Validate required fields
            if (empty($data['patient_id'])) {
                $this->error('Patient ID is required', 400);
                return;
            }
            
            if (empty($data['triage_level']) || !in_array(intval($data['triage_level']), [1, 2, 3, 4, 5])) {
                $this->error('Valid triage level (1-5) is required', 400);
                return;
            }
            
            if (empty($data['chief_complaint'])) {
                $this->error('Chief complaint is required', 400);
                return;
            }
            
            // Get current user ID for created_by
            if ($this->user && isset($this->user['id'])) {
                $data['created_by'] = $this->user['id'];
            }
            
            // Set arrival time if not provided
            if (empty($data['arrival_time'])) {
                $data['arrival_time'] = date('Y-m-d H:i:s');
            }
            
            // Ensure patient_id is integer
            $data['patient_id'] = intval($data['patient_id']);
            
            // Ensure triage_level is integer
            $data['triage_level'] = intval($data['triage_level']);
            
            $result = $this->Emergency_model->create($data);
            
            if ($result['success']) {
                $visit = $this->Emergency_model->get_by_id($result['id']);
                if ($visit) {
                    $this->success($this->format_visit($visit), 'Emergency visit registered successfully');
                } else {
                    $this->error('Visit created but could not retrieve details', 500);
                }
            } else {
                log_message('error', 'Emergency create failed: ' . ($result['message'] ?? 'Unknown error'));
                $this->error($result['message'] ?? 'Failed to create emergency visit', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency create exception: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single visit, update, or delete
     * GET /api/emergency/visits/:id
     * PUT /api/emergency/visits/:id
     * DELETE /api/emergency/visits/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Visit ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $visit = $this->Emergency_model->get_by_id($id);
                
                if ($visit) {
                    $this->success($this->format_visit($visit));
                } else {
                    $this->error('Emergency visit not found', 404);
                }
                
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update($id);
                
            } elseif ($method === 'DELETE') {
                $this->delete($id);
                
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update emergency visit
     */
    public function update($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Log the received data for debugging
        log_message('debug', 'Emergency->update called with id: ' . $id . ', data: ' . json_encode($data));
        
        // Don't allow updating patient_id or er_number
        unset($data['patient_id']);
        unset($data['er_number']);
        
        // Filter out empty values to avoid unnecessary updates
        $data = array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
        
        if (empty($data)) {
            $this->error('No data provided to update', 400);
            return;
        }
        
        $result = $this->Emergency_model->update($id, $data);
        
        if ($result !== false) {
            // Get updated visit data
            $visit = $this->Emergency_model->get_by_id($id);
            if ($visit) {
                log_message('debug', 'Emergency->update success, updated visit: ' . json_encode(array(
                    'chief_complaint' => $visit['chief_complaint'] ?? null,
                    'triage_level' => $visit['triage_level'] ?? null,
                    'bed_number' => $visit['bed_number'] ?? null,
                    'current_status' => $visit['current_status'] ?? null
                )));
                $this->success($this->format_visit($visit), 'Emergency visit updated successfully');
            } else {
                $this->error('Visit updated but could not retrieve updated data', 500);
            }
        } else {
            $error_message = 'Failed to update emergency visit';
            log_message('error', 'Emergency->update failed for visit id: ' . $id);
            $this->error($error_message, 400);
        }
    }

    /**
     * Delete emergency visit
     */
    public function delete($id) {
        // Check if visit exists
        $visit = $this->Emergency_model->get_by_id($id);
        if (!$visit) {
            $this->error('Emergency visit not found', 404);
            return;
        }
        
        // Release bed if assigned
        if (!empty($visit['bed_number'])) {
            $this->load->model('Emergency_model');
            // Update bed status to available
            if ($this->db->table_exists('emergency_beds')) {
                $this->db->where('bed_number', $visit['bed_number']);
                $this->db->update('emergency_beds', array('status' => 'available', 'current_visit_id' => null));
            }
        }
        
        $this->db->where('id', $id);
        $result = $this->db->delete('emergency_visits');
        
        if ($result) {
            $this->success(null, 'Emergency visit deleted successfully');
        } else {
            $this->error('Failed to delete emergency visit', 400);
        }
    }

    /**
     * Update triage information
     * PUT /api/emergency/visits/:id/triage
     */
    public function update_triage($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }
        
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate triage level
        if (isset($data['triage_level']) && !in_array($data['triage_level'], [1, 2, 3, 4, 5])) {
            $this->error('Valid triage level (1-5) is required', 400);
            return;
        }
        
        $result = $this->Emergency_model->update_triage($id, $data);
        
        if ($result) {
            $visit = $this->Emergency_model->get_by_id($id);
            $this->success($this->format_visit($visit), 'Triage information updated successfully');
        } else {
            $this->error('Failed to update triage information', 400);
        }
    }

    /**
     * Update disposition
     * PUT /api/emergency/visits/:id/disposition
     */
    public function update_disposition($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }
        
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate disposition
        $valid_dispositions = array('discharge', 'admit-ward', 'admit-private', 'transfer', 'absconded', 'death');
        if (empty($data['disposition']) || !in_array($data['disposition'], $valid_dispositions)) {
            $this->error('Valid disposition is required', 400);
            return;
        }
        
        $result = $this->Emergency_model->update_disposition($id, $data);
        
        if ($result) {
            $visit = $this->Emergency_model->get_by_id($id);
            $this->success($this->format_visit($visit), 'Disposition updated successfully');
        } else {
            $this->error('Failed to update disposition', 400);
        }
    }

    /**
     * Update visit status
     * PUT /api/emergency/visits/:id/status
     */
    public function update_status($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }
        
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (empty($data['status'])) {
            $this->error('Status is required', 400);
            return;
        }
        
        $changed_by = $this->user && isset($this->user['id']) ? $this->user['id'] : null;
        $notes = isset($data['notes']) ? $data['notes'] : null;
        
        $result = $this->Emergency_model->update_status($id, $data['status'], $changed_by, $notes);
        
        if ($result) {
            $visit = $this->Emergency_model->get_by_id($id);
            $this->success($this->format_visit($visit), 'Status updated successfully');
        } else {
            $this->error('Failed to update status', 400);
        }
    }

    /**
     * Get dashboard statistics
     * GET /api/emergency/stats
     */
    public function stats() {
        try {
            $stats = $this->Emergency_model->get_stats();
            $this->success($stats);
        } catch (Exception $e) {
            log_message('error', 'Emergency stats error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available ER beds
     * GET /api/emergency/beds
     */
    public function beds() {
        try {
            $beds = $this->Emergency_model->get_available_beds();
            $this->success($beds);
        } catch (Exception $e) {
            log_message('error', 'Emergency beds error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============================================
    // WORKFLOW API ENDPOINTS
    // ============================================

    /**
     * Record vital signs
     * POST /api/emergency/visits/:id/vitals
     * GET /api/emergency/visits/:id/vitals
     */
    public function vitals($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $vitals = $this->Emergency_model->get_vital_signs_history($id);
                $this->success($vitals);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Log received data for debugging
                log_message('debug', 'Recording vitals for visit ' . $id . ': ' . json_encode($data));
                
                if ($this->user && isset($this->user['id'])) {
                    $data['recorded_by'] = $this->user['id'];
                }
                
                $result = $this->Emergency_model->record_vital_signs($id, $data);
                
                // Check if result is an array with error (from improved error handling)
                if (is_array($result)) {
                    if (isset($result['success']) && !$result['success']) {
                        $error_message = $result['message'] ?? 'Failed to record vital signs';
                        log_message('error', 'Failed to record vital signs: ' . $error_message);
                        if (isset($result['error'])) {
                            log_message('error', 'Database error details: ' . json_encode($result['error']));
                        }
                        $this->error($error_message, 400);
                        return;
                    }
                    // If it's an array with success=true, extract the ID if present
                    if (isset($result['success']) && $result['success'] && isset($result['id'])) {
                        $result = $result['id'];
                    }
                }
                
                // Check if result is a valid ID (successful insert)
                // insert_id() returns an integer > 0 on success, or 0/false on failure
                if ($result && (is_numeric($result) && intval($result) > 0)) {
                    log_message('debug', 'Vital signs recorded successfully with ID: ' . $result);
                    $vitals = $this->Emergency_model->get_vital_signs_history($id);
                    $this->success($vitals, 'Vital signs recorded successfully');
                } else {
                    // Fallback error handling - result is false, 0, or unexpected
                    $error = $this->db->error();
                    log_message('error', 'Failed to record vital signs - result: ' . var_export($result, true));
                    log_message('error', 'Result type: ' . gettype($result));
                    log_message('error', 'Database error: ' . json_encode($error));
                    
                    // Check if visit exists
                    $visit_check = $this->Emergency_model->get_by_id($id);
                    if (!$visit_check) {
                        $this->error('Emergency visit ' . $id . ' not found', 400);
                        return;
                    }
                    
                    // Check if table exists
                    if (!$this->db->table_exists('emergency_vital_signs')) {
                        $this->error('emergency_vital_signs table does not exist. Please run the database migration.', 400);
                        return;
                    }
                    
                    $error_message = 'Failed to record vital signs';
                    if (isset($error['message']) && !empty($error['message'])) {
                        $error_message .= ': ' . $error['message'];
                    } elseif (isset($error['code']) && $error['code'] != 0) {
                        $error_message .= ' (Error code: ' . $error['code'] . ')';
                    } else {
                        $error_message .= '. Insert may have failed silently.';
                    }
                    $this->error($error_message, 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency vitals error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Treatment notes
     * POST /api/emergency/visits/:id/notes
     * GET /api/emergency/visits/:id/notes
     */
    public function notes($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $filters = array(
                    'note_type' => $this->input->get('note_type'),
                    'date_from' => $this->input->get('date_from'),
                    'date_to' => $this->input->get('date_to')
                );
                $notes = $this->Emergency_model->get_treatment_notes($id, $filters);
                $this->success($notes);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if (empty($data['note_text'])) {
                    $this->error('Note text is required', 400);
                    return;
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['recorded_by'] = $this->user['id'];
                }
                
                $result = $this->Emergency_model->add_treatment_note($id, $data);
                
                if ($result) {
                    $notes = $this->Emergency_model->get_treatment_notes($id);
                    $this->success($notes, 'Treatment note added successfully');
                } else {
                    $this->error('Failed to add treatment note', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency notes error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Investigation orders
     * POST /api/emergency/visits/:id/investigations
     * GET /api/emergency/visits/:id/investigations
     */
    public function investigations($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $orders = $this->Emergency_model->get_investigation_orders($id);
                $this->success($orders);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if (empty($data['test_name'])) {
                    $this->error('Test name is required', 400);
                    return;
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['ordered_by'] = $this->user['id'];
                }
                
                $result = $this->Emergency_model->order_investigation($id, $data);
                
                if ($result) {
                    $orders = $this->Emergency_model->get_investigation_orders($id);
                    $this->success($orders, 'Investigation ordered successfully');
                } else {
                    $this->error('Failed to order investigation', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency investigations error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Medication administration
     * POST /api/emergency/visits/:id/medications
     * GET /api/emergency/visits/:id/medications
     */
    public function medications($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $medications = $this->Emergency_model->get_medication_history($id);
                $this->success($medications);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if (empty($data['medication_name']) || empty($data['dosage'])) {
                    $this->error('Medication name and dosage are required', 400);
                    return;
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['administered_by'] = $this->user['id'];
                }
                
                $result = $this->Emergency_model->administer_medication($id, $data);
                
                if ($result) {
                    $medications = $this->Emergency_model->get_medication_history($id);
                    $this->success($medications, 'Medication recorded successfully');
                } else {
                    $this->error('Failed to record medication', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency medications error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Charges/Billing
     * POST /api/emergency/visits/:id/charges
     * GET /api/emergency/visits/:id/charges
     * DELETE /api/emergency/visits/:id/charges/:charge_id
     */
    public function charges($id = null, $charge_id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $charges = $this->Emergency_model->get_charges($id);
                $total = $this->Emergency_model->calculate_total_charges($id);
                $this->success(array(
                    'charges' => $charges,
                    'total' => $total
                ));
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if (empty($data['item_name']) || empty($data['charge_type']) || !isset($data['unit_price'])) {
                    $this->error('Item name, charge type, and unit price are required', 400);
                    return;
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['charged_by'] = $this->user['id'];
                }
                
                $result = $this->Emergency_model->add_charge($id, $data);
                
                if ($result) {
                    $charges = $this->Emergency_model->get_charges($id);
                    $total = $this->Emergency_model->calculate_total_charges($id);
                    $this->success(array(
                        'charges' => $charges,
                        'total' => $total
                    ), 'Charge added successfully');
                } else {
                    $this->error('Failed to add charge', 400);
                }
            } elseif ($method === 'DELETE' && $charge_id) {
                $result = $this->Emergency_model->delete_charge($charge_id, $id);
                
                if ($result) {
                    $charges = $this->Emergency_model->get_charges($id);
                    $total = $this->Emergency_model->calculate_total_charges($id);
                    $this->success(array(
                        'charges' => $charges,
                        'total' => $total
                    ), 'Charge deleted successfully');
                } else {
                    $this->error('Failed to delete charge', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency charges error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Status history
     * GET /api/emergency/visits/:id/history
     */
    public function history($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $history = $this->Emergency_model->get_status_history($id);
            $this->success($history);
        } catch (Exception $e) {
            log_message('error', 'Emergency history error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create IPD admission from ER
     * POST /api/emergency/visits/:id/admit-ipd
     */
    public function admit_ipd($id = null) {
        if (!$id) {
            $this->error('Visit ID is required', 400);
            return;
        }

        try {
            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->post();
            }
            
            if (empty($data['admission_type']) || !in_array($data['admission_type'], array('ward', 'private'))) {
                $this->error('Valid admission type (ward or private) is required', 400);
                return;
            }
            
            if ($this->user && isset($this->user['id'])) {
                $data['admitted_by'] = $this->user['id'];
            }
            
            $result = $this->Emergency_model->create_ipd_admission($id, $data);
            
            if ($result['success']) {
                $visit = $this->Emergency_model->get_by_id($id);
                $this->success($this->format_visit($visit), 'IPD admission created successfully');
            } else {
                $this->error($result['message'] ?? 'Failed to create IPD admission', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency IPD admission error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Format visit data for frontend
     */
    private function format_visit($visit) {
        if (!$visit) {
            return null;
        }
        
        // Parse JSON fields
        $investigations = array();
        if (!empty($visit['investigations'])) {
            $investigations = is_string($visit['investigations']) ? json_decode($visit['investigations'], true) : $visit['investigations'];
            if (!is_array($investigations)) {
                $investigations = array();
            }
        }
        
        $medications = array();
        if (!empty($visit['medications'])) {
            $medications = is_string($visit['medications']) ? json_decode($visit['medications'], true) : $visit['medications'];
            if (!is_array($medications)) {
                $medications = array();
            }
        }
        
        // Calculate wait time in minutes
        $wait_time = 0;
        if (!empty($visit['arrival_time']) && $visit['current_status'] !== 'completed') {
            $arrival = new DateTime($visit['arrival_time']);
            $now = new DateTime();
            $diff = $now->diff($arrival);
            $wait_time = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
        }
        
        // Format arrival time
        $arrival_time = '';
        if (!empty($visit['arrival_time'])) {
            $arrival = new DateTime($visit['arrival_time']);
            $arrival_time = $arrival->format('M d, Y h:i A');
        }
        
        return array(
            'id' => intval($visit['id']),
            'erNumber' => $visit['er_number'],
            'uhid' => $visit['uhid'] ?? $visit['patient_uhid'] ?? '',
            'name' => $visit['patient_name'] ?? '',
            'age' => intval($visit['patient_age'] ?? 0),
            'gender' => $visit['patient_gender'] ?? '',
            'patientId' => intval($visit['patient_db_id'] ?? $visit['patient_id'] ?? 0), // Add patientId for updating patient info
            'phone' => $visit['patient_phone'] ?? '',
            'email' => $visit['patient_email'] ?? '',
            'bloodGroup' => $visit['patient_blood_group'] ?? '',
            'arrivalTime' => $arrival_time,
            'arrivalMode' => $visit['arrival_mode'],
            'triageLevel' => intval($visit['triage_level']),
            'chiefComplaint' => $visit['chief_complaint'],
            // Don't include vitals here - vitals should only come from emergency_vital_signs table via API
            // The vitals_bp, vitals_pulse, etc. columns in emergency_visits are just for quick reference
            // but should not be used as the source of truth for current vitals display
            // 'vitals' => array(
            //     'bp' => $visit['vitals_bp'] ?? '',
            //     'pulse' => $visit['vitals_pulse'] ?? 0,
            //     'temp' => $visit['vitals_temp'] ?? 0,
            //     'spo2' => $visit['vitals_spo2'] ?? 0,
            //     'resp' => $visit['vitals_resp'] ?? 0
            // ),
            'currentStatus' => $visit['current_status'],
            'assignedDoctor' => $visit['doctor_name'] ?? '',
            'assignedNurse' => $visit['nurse_name'] ?? '',
            'bedNumber' => $visit['bed_number'] ?? '',
            'disposition' => $visit['disposition'] ?? '',
            'dispositionDetails' => $visit['disposition_details'] ?? '',
            'followUpRequired' => !empty($visit['follow_up_required']),
            'followUpDate' => $visit['follow_up_date'] ?? '',
            'medicationsPrescribed' => $visit['medications_prescribed'] ?? '',
            'investigations' => $investigations,
            'medications' => $medications,
            'totalCharges' => floatval($visit['total_charges'] ?? 0),
            'waitTime' => $wait_time,
            'createdAt' => $visit['created_at'] ?? ''
        );
    }

    // ============================================
    // NEW ENDPOINTS FOR EMERGENCY MODULE
    // ============================================

    /**
     * Get admitted patients
     * GET /api/emergency/admitted-patients
     */
    public function admitted_patients() {
        try {
            $filters = array(
                'search' => $this->input->get('search'),
                'status' => $this->input->get('status'),
                'triage_level' => $this->input->get('triage_level'),
                'ward_id' => $this->input->get('ward_id'),
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to')
            );
            
            $patients = $this->Emergency_model->get_admitted_patients($filters);
            
            // Format for frontend and include vitals for each patient
            $formatted = array();
            foreach ($patients as $patient) {
                $formattedPatient = $this->format_admitted_patient($patient);
                
                // Load vitals for this patient's visit
                $visitId = intval($patient['id']);
                $vitals = $this->Emergency_model->get_vital_signs_history($visitId);
                $formattedPatient['vitals'] = $vitals ? $vitals : array();
                
                $formatted[] = $formattedPatient;
            }
            
            $this->success($formatted);
        } catch (Exception $e) {
            log_message('error', 'Emergency admitted_patients error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get patient history
     * GET /api/emergency/history
     */
    public function history_list() {
        try {
            $filters = array(
                'search' => $this->input->get('search'),
                'patient_id' => $this->input->get('patient_id'),
                'disposition' => $this->input->get('disposition'),
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to')
            );
            
            $history = $this->Emergency_model->get_patient_history($filters);
            
            // Format for frontend
            $formatted = array();
            foreach ($history as $record) {
                $formatted[] = $this->format_history_record($record);
            }
            
            $this->success($formatted);
        } catch (Exception $e) {
            log_message('error', 'Emergency history_list error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update ward assignment
     * PUT /api/emergency/visits/:id/ward-assignment
     */
    public function ward_assignment($id = null) {
        try {
            if (empty($id)) {
                $this->error('Visit ID is required', 400);
                return;
            }
            
            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->put();
            }
            
            $ward_id = isset($data['ward_id']) ? intval($data['ward_id']) : null;
            $bed_id = isset($data['bed_id']) ? intval($data['bed_id']) : null;
            
            $result = $this->Emergency_model->update_ward_assignment($id, $ward_id, $bed_id);
            
            if ($result['success']) {
                $visit = $this->Emergency_model->get_by_id($id);
                $this->success($this->format_visit($visit), $result['message']);
            } else {
                $this->error($result['message'], 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency ward_assignment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Wards Management
     * GET /api/emergency/wards
     * POST /api/emergency/wards
     */
    public function wards($id = null) {
        try {
            $this->load->model('Emergency_ward_model');
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single ward
                    $ward = $this->Emergency_ward_model->get_by_id($id);
                    if ($ward) {
                        $this->success($ward);
                    } else {
                        $this->error('Ward not found', 404);
                    }
                } else {
                    // Get all wards
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'type' => $this->input->get('type')
                    );
                    $wards = $this->Emergency_ward_model->get_all($filters);
                    $this->success($wards);
                }
            } elseif ($method === 'POST') {
                // Create ward
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['created_by'] = $this->user['id'];
                }
                
                $ward_id = $this->Emergency_ward_model->create($data);
                if ($ward_id) {
                    $ward = $this->Emergency_ward_model->get_by_id($ward_id);
                    $this->success($ward, 'Ward created successfully');
                } else {
                    $this->error('Failed to create ward', 400);
                }
            } elseif ($method === 'PUT') {
                // Update ward
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->put();
                }
                
                if ($this->Emergency_ward_model->update($id, $data)) {
                    $ward = $this->Emergency_ward_model->get_by_id($id);
                    $this->success($ward, 'Ward updated successfully');
                } else {
                    $this->error('Failed to update ward', 400);
                }
            } elseif ($method === 'DELETE') {
                // Delete ward
                if ($this->Emergency_ward_model->delete($id)) {
                    $this->success(null, 'Ward deleted successfully');
                } else {
                    $this->error('Failed to delete ward', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency wards error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get ward statistics
     * GET /api/emergency/wards/:id/stats
     */
    public function ward_stats($id = null) {
        try {
            if (empty($id)) {
                $this->error('Ward ID is required', 400);
                return;
            }
            
            $this->load->model('Emergency_ward_model');
            $stats = $this->Emergency_ward_model->get_ward_stats($id);
            
            if ($stats) {
                $this->success($stats);
            } else {
                $this->error('Ward not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency ward_stats error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get beds in ward
     * GET /api/emergency/wards/:id/beds
     */
    public function ward_beds($id = null) {
        try {
            if (empty($id)) {
                $this->error('Ward ID is required', 400);
                return;
            }
            
            $this->load->model('Emergency_ward_model');
            $filters = array(
                'status' => $this->input->get('status'),
                'bed_type' => $this->input->get('bed_type')
            );
            $beds = $this->Emergency_ward_model->get_ward_beds($id, $filters);
            $this->success($beds);
        } catch (Exception $e) {
            log_message('error', 'Emergency ward_beds error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ward Beds Management
     * GET /api/emergency/ward-beds
     * POST /api/emergency/ward-beds
     */
    public function ward_beds_management($id = null) {
        try {
            $this->load->model('Emergency_ward_bed_model');
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single bed
                    $bed = $this->Emergency_ward_bed_model->get_by_id($id);
                    if ($bed) {
                        $this->success($bed);
                    } else {
                        $this->error('Bed not found', 404);
                    }
                } else {
                    // Get all beds
                    $filters = array(
                        'ward_id' => $this->input->get('ward_id'),
                        'status' => $this->input->get('status'),
                        'bed_type' => $this->input->get('bed_type'),
                        'search' => $this->input->get('search')
                    );
                    $beds = $this->Emergency_ward_bed_model->get_all($filters);
                    $this->success($beds);
                }
            } elseif ($method === 'POST') {
                // Create bed
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $bed_id = $this->Emergency_ward_bed_model->create($data);
                if ($bed_id) {
                    $bed = $this->Emergency_ward_bed_model->get_by_id($bed_id);
                    $this->success($bed, 'Bed created successfully');
                } else {
                    $this->error('Failed to create bed', 400);
                }
            } elseif ($method === 'PUT') {
                // Update bed
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->put();
                }
                
                if ($this->Emergency_ward_bed_model->update($id, $data)) {
                    $bed = $this->Emergency_ward_bed_model->get_by_id($id);
                    $this->success($bed, 'Bed updated successfully');
                } else {
                    $this->error('Failed to update bed', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency ward_beds_management error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Assign bed to patient
     * PUT /api/emergency/ward-beds/:id/assign
     */
    public function assign_bed($id = null) {
        try {
            if (empty($id)) {
                $this->error('Bed ID is required', 400);
                return;
            }
            
            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->put();
            }
            
            if (empty($data['visit_id'])) {
                $this->error('Visit ID is required', 400);
                return;
            }
            
            $this->load->model('Emergency_ward_bed_model');
            $result = $this->Emergency_ward_bed_model->assign_patient($id, $data['visit_id']);
            
            if ($result) {
                $bed = $this->Emergency_ward_bed_model->get_by_id($id);
                $this->success($bed, 'Bed assigned successfully');
            } else {
                $this->error('Failed to assign bed', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency assign_bed error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Release bed
     * PUT /api/emergency/ward-beds/:id/release
     */
    public function release_bed($id = null) {
        try {
            if (empty($id)) {
                $this->error('Bed ID is required', 400);
                return;
            }
            
            $this->load->model('Emergency_ward_bed_model');
            $result = $this->Emergency_ward_bed_model->release_bed($id);
            
            if ($result) {
                $bed = $this->Emergency_ward_bed_model->get_by_id($id);
                $this->success($bed, 'Bed released successfully');
            } else {
                $this->error('Failed to release bed', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency release_bed error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available beds
     * GET /api/emergency/ward-beds/available
     */
    public function available_beds() {
        try {
            $this->load->model('Emergency_ward_bed_model');
            $ward_id = $this->input->get('ward_id');
            
            if ($ward_id) {
                $beds = $this->Emergency_ward_bed_model->get_available_beds($ward_id);
            } else {
                // Get all available beds
                $beds = $this->Emergency_ward_bed_model->get_all(['status' => 'Available']);
            }
            
            $this->success($beds);
        } catch (Exception $e) {
            log_message('error', 'Emergency available_beds error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Duty Roster Management
     * GET /api/emergency/duty-roster
     * POST /api/emergency/duty-roster
     */
    public function duty_roster($id = null) {
        try {
            $this->load->model('Emergency_duty_roster_model');
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single roster entry (if needed)
                    $this->error('Not implemented', 501);
                } else {
                    // Get all roster entries
                    $filters = array(
                        'user_id' => $this->input->get('user_id'),
                        'date' => $this->input->get('date'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to'),
                        'shift_type' => $this->input->get('shift_type'),
                        'status' => $this->input->get('status'),
                        'role' => $this->input->get('role')
                    );
                    $roster = $this->Emergency_duty_roster_model->get_all($filters);
                    $this->success($roster);
                }
            } elseif ($method === 'POST') {
                // Create roster entry
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['created_by'] = $this->user['id'];
                }
                
                $roster_id = $this->Emergency_duty_roster_model->create($data);
                if ($roster_id) {
                    $roster = $this->Emergency_duty_roster_model->get_all(['id' => $roster_id]);
                    $this->success($roster[0] ?? null, 'Roster entry created successfully');
                } else {
                    $this->error('Failed to create roster entry', 400);
                }
            } elseif ($method === 'PUT') {
                // Update roster entry
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->put();
                }
                
                if ($this->Emergency_duty_roster_model->update($id, $data)) {
                    $roster = $this->Emergency_duty_roster_model->get_all(['id' => $id]);
                    $this->success($roster[0] ?? null, 'Roster entry updated successfully');
                } else {
                    $this->error('Failed to update roster entry', 400);
                }
            } elseif ($method === 'DELETE') {
                // Delete roster entry
                if ($this->Emergency_duty_roster_model->delete($id)) {
                    $this->success(null, 'Roster entry deleted successfully');
                } else {
                    $this->error('Failed to delete roster entry', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency duty_roster error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get roster for specific date
     * GET /api/emergency/duty-roster/date/:date
     */
    public function duty_roster_date($date = null) {
        try {
            if (empty($date)) {
                $this->error('Date is required', 400);
                return;
            }
            
            $this->load->model('Emergency_duty_roster_model');
            $roster = $this->Emergency_duty_roster_model->get_by_date($date);
            $this->success($roster);
        } catch (Exception $e) {
            log_message('error', 'Emergency duty_roster_date error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current on-duty staff
     * GET /api/emergency/duty-roster/current
     */
    public function current_duty_staff() {
        try {
            $this->load->model('Emergency_duty_roster_model');
            $staff = $this->Emergency_duty_roster_model->get_current_duty_staff();
            $this->success($staff);
        } catch (Exception $e) {
            log_message('error', 'Emergency current_duty_staff error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Patient Transfers
     * POST /api/emergency/transfers
     * GET /api/emergency/transfers
     */
    public function transfers($visit_id = null) {
        try {
            $this->load->model('Emergency_transfer_model');
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($visit_id) {
                    // Get transfers for a visit
                    $transfers = $this->Emergency_transfer_model->get_by_visit($visit_id);
                    $this->success($transfers);
                } else {
                    // Get all transfers
                    $filters = array(
                        'transfer_type' => $this->input->get('transfer_type'),
                        'status' => $this->input->get('status'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to'),
                        'search' => $this->input->get('search')
                    );
                    $transfers = $this->Emergency_transfer_model->get_all($filters);
                    $this->success($transfers);
                }
            } elseif ($method === 'POST') {
                // Create transfer
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Validate required fields
                if (empty($data['emergency_visit_id'])) {
                    $this->error('Emergency visit ID is required', 400);
                    return;
                }
                
                if (empty($data['reason'])) {
                    $this->error('Transfer reason is required', 400);
                    return;
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['transferred_by'] = $this->user['id'];
                }
                
                // Log the transfer data for debugging
                log_message('debug', 'Creating transfer: ' . json_encode($data));
                
                $result = $this->Emergency_model->transfer_patient($data['emergency_visit_id'], $data);
                
                if ($result['success']) {
                    $transfer = $this->Emergency_transfer_model->get_all(['id' => $result['transfer_id']]);
                    log_message('debug', 'Transfer created successfully with ID: ' . $result['transfer_id']);
                    $this->success($transfer[0] ?? null, $result['message']);
                } else {
                    log_message('error', 'Failed to create transfer: ' . $result['message']);
                    $this->error($result['message'], 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency transfers error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ambulance Requests
     * POST /api/emergency/ambulance-requests
     * GET /api/emergency/ambulance-requests
     */
    public function ambulance_requests($id = null) {
        try {
            $this->load->model('Emergency_ambulance_model');
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single request (if needed)
                    $this->error('Not implemented', 501);
                } else {
                    // Get all requests
                    $filters = array(
                        'status' => $this->input->get('status'),
                        'service_type' => $this->input->get('service_type'),
                        'priority' => $this->input->get('priority'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to'),
                        'search' => $this->input->get('search')
                    );
                    $requests = $this->Emergency_ambulance_model->get_all($filters);
                    $this->success($requests);
                }
            } elseif ($method === 'POST') {
                // Create request
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['requested_by'] = $this->user['id'];
                }
                
                $request_id = $this->Emergency_ambulance_model->create_request($data);
                if ($request_id) {
                    $requests = $this->Emergency_ambulance_model->get_all(['id' => $request_id]);
                    $this->success($requests[0] ?? null, 'Ambulance request created successfully');
                } else {
                    $this->error('Failed to create ambulance request', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency ambulance_requests error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update ambulance request status
     * PUT /api/emergency/ambulance-requests/:id/status
     */
    public function ambulance_request_status($id = null) {
        try {
            if (empty($id)) {
                $this->error('Request ID is required', 400);
                return;
            }
            
            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->put();
            }
            
            if (empty($data['status'])) {
                $this->error('Status is required', 400);
                return;
            }
            
            $this->load->model('Emergency_ambulance_model');
            $result = $this->Emergency_ambulance_model->update_status($id, $data['status']);
            
            if ($result) {
                $requests = $this->Emergency_ambulance_model->get_all(['id' => $id]);
                $this->success($requests[0] ?? null, 'Ambulance request status updated successfully');
            } else {
                $this->error('Failed to update ambulance request status', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency ambulance_request_status error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available ambulances
     * GET /api/emergency/ambulance-requests/available
     */
    public function available_ambulances() {
        try {
            $this->load->model('Emergency_ambulance_model');
            $availability = $this->Emergency_ambulance_model->get_available_ambulances();
            $this->success($availability);
        } catch (Exception $e) {
            log_message('error', 'Emergency available_ambulances error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Format admitted patient for frontend
     */
    private function format_admitted_patient($patient) {
        return array(
            'id' => intval($patient['id']),
            'erNumber' => $patient['er_number'],
            'uhid' => $patient['patient_uhid'] ?? $patient['uhid'] ?? '',
            'name' => $patient['patient_name'] ?? '',
            'age' => intval($patient['patient_age'] ?? 0),
            'gender' => $patient['patient_gender'] ?? '',
            'patientId' => intval($patient['patient_db_id'] ?? $patient['patient_id'] ?? 0), // Add patient_db_id for updating patient info
            'admissionDate' => !empty($patient['arrival_time']) ? date('Y-m-d', strtotime($patient['arrival_time'])) : '',
            'admissionTime' => !empty($patient['arrival_time']) ? date('h:i A', strtotime($patient['arrival_time'])) : '',
            'triageLevel' => intval($patient['triage_level'] ?? 0),
            'diagnosis' => $patient['primary_diagnosis'] ?? $patient['chief_complaint'] ?? '',
            'assignedWard' => $patient['assigned_ward_name'] ?? '',
            'bedNumber' => $patient['assigned_bed_number'] ?? '',
            'attendingDoctor' => $patient['doctor_name'] ?? '',
            'admissionType' => $patient['admission_type'] ?? 'Ward',
            'status' => $this->map_patient_status($patient),
            // Don't include vitalSigns here - vitals should only come from emergency_vital_signs table via API
            // 'vitalSigns' => array(
            //     'bp' => $patient['vitals_bp'] ?? '',
            //     'pulse' => intval($patient['vitals_pulse'] ?? 0),
            //     'temp' => floatval($patient['vitals_temp'] ?? 0),
            //     'spo2' => intval($patient['vitals_spo2'] ?? 0)
            // )
        );
    }

    /**
     * Format history record for frontend
     */
    private function format_history_record($record) {
        $arrival = !empty($record['arrival_time']) ? new DateTime($record['arrival_time']) : null;
        $disposition = !empty($record['disposition_time']) ? new DateTime($record['disposition_time']) : null;
        
        $duration = '';
        if ($arrival && $disposition) {
            $diff = $arrival->diff($disposition);
            $duration = $diff->format('%h:%I');
        }
        
        return array(
            'id' => intval($record['id']),
            'erNumber' => $record['er_number'],
            'uhid' => $record['patient_uhid'] ?? $record['uhid'] ?? '',
            'patientName' => $record['patient_name'] ?? '',
            'visitDate' => $arrival ? $arrival->format('Y-m-d') : '',
            'chiefComplaint' => $record['chief_complaint'] ?? '',
            'diagnosis' => $record['primary_diagnosis'] ?? $record['chief_complaint'] ?? '',
            'treatment' => $record['discharge_summary'] ?? '',
            'disposition' => $record['disposition'] ?? '',
            'doctor' => $record['doctor_name'] ?? '',
            'duration' => $duration
        );
    }

    /**
     * Map patient status based on triage and condition
     */
    private function map_patient_status($patient) {
        $triage = intval($patient['triage_level'] ?? 0);
        $condition = $patient['condition_at_discharge'] ?? '';
        
        if ($triage <= 2 || $condition === 'critical') {
            return 'Critical';
        } elseif ($condition === 'stable' || $triage >= 4) {
            return 'Stable';
        } else {
            return 'Under Observation';
        }
    }

    /**
     * Patient Files Management
     * GET /api/emergency/visits/:id/files
     * POST /api/emergency/visits/:id/files
     */
    public function files($id = null) {
        try {
            if (!$id) {
                $this->error('Visit ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $files = $this->Emergency_model->get_patient_files($id);
                $this->success($files);
                
            } elseif ($method === 'POST') {
                // Handle file upload
                $data = array(
                    'file_name' => $this->input->post('file_name'),
                    'file_type' => $this->input->post('file_type'),
                    'file_path' => $this->input->post('file_path'),
                    'file_size' => $this->input->post('file_size'),
                    'category' => $this->input->post('category') ?? 'Other',
                    'description' => $this->input->post('description'),
                    'uploaded_by' => $this->user['id'] ?? null
                );
                
                $file_id = $this->Emergency_model->upload_patient_file($id, $data);
                if ($file_id) {
                    $this->success(array('id' => $file_id), 'File uploaded successfully');
                } else {
                    $this->error('Failed to upload file', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency files error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete patient file
     * DELETE /api/emergency/visits/:id/files/:fileId
     */
    public function delete_file($id = null, $file_id = null) {
        try {
            if (!$file_id) {
                $this->error('File ID is required', 400);
                return;
            }

            $result = $this->Emergency_model->delete_patient_file($file_id);
            if ($result) {
                $this->success(null, 'File deleted successfully');
            } else {
                $this->error('Failed to delete file', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency delete_file error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Intake & Output Management
     * GET /api/emergency/visits/:id/intake-output
     * POST /api/emergency/visits/:id/intake-output
     */
    public function intake_output($id = null) {
        try {
            if (!$id) {
                $this->error('Visit ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $filters = array(
                    'date_from' => $this->input->get('date_from'),
                    'date_to' => $this->input->get('date_to')
                );
                $records = $this->Emergency_model->get_intake_output($id, $filters);
                $this->success($records);
                
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['recorded_by'] = $this->user['id'] ?? null;
                $record_id = $this->Emergency_model->add_intake_output($id, $data);
                if ($record_id) {
                    $this->success(array('id' => $record_id), 'I/O record added successfully');
                } else {
                    $this->error('Failed to add I/O record', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency intake_output error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Blood Bank Requests Management
     * GET /api/emergency/visits/:id/blood-bank
     * POST /api/emergency/visits/:id/blood-bank
     */
    public function blood_bank($id = null) {
        try {
            if (!$id) {
                $this->error('Visit ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $requests = $this->Emergency_model->get_blood_bank_requests($id);
                $this->success($requests);
                
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['requested_by'] = $this->user['id'] ?? null;
                $request_id = $this->Emergency_model->create_blood_bank_request($id, $data);
                if ($request_id) {
                    $this->success(array('id' => $request_id), 'Blood request created successfully');
                } else {
                    $this->error('Failed to create blood request', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency blood_bank error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update blood bank request status
     * PUT /api/emergency/visits/:id/blood-bank/:requestId
     */
    public function update_blood_request($id = null, $request_id = null) {
        try {
            if (!$request_id) {
                $this->error('Request ID is required', 400);
                return;
            }

            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->post();
            }

            if (isset($data['status']) && $data['status'] === 'Issued' && !isset($data['issued_by'])) {
                $data['issued_by'] = $this->user['id'] ?? null;
            }

            $result = $this->Emergency_model->update_blood_request_status($request_id, $data['status'] ?? 'Requested', $data);
            if ($result) {
                $this->success(null, 'Blood request updated successfully');
            } else {
                $this->error('Failed to update blood request', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency update_blood_request error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Health & Physical Management
     * GET /api/emergency/visits/:id/health-physical
     * POST /api/emergency/visits/:id/health-physical
     */
    public function health_physical($id = null) {
        try {
            if (!$id) {
                $this->error('Visit ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $records = $this->Emergency_model->get_health_physical($id);
                $this->success($records);
                
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['provider_id'] = $this->user['id'] ?? $data['provider_id'] ?? null;
                $record_id = $this->Emergency_model->create_health_physical($id, $data);
                if ($record_id) {
                    $this->success(array('id' => $record_id), 'H&P record created successfully');
                } else {
                    $this->error('Failed to create H&P record', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Emergency health_physical error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Timeline/Status History
     * GET /api/emergency/visits/:id/timeline
     */
    public function timeline($id = null) {
        try {
            if (!$id) {
                $this->error('Visit ID is required', 400);
                return;
            }

            $history = $this->Emergency_model->get_status_history($id);
            $this->success($history);
        } catch (Exception $e) {
            log_message('error', 'Emergency timeline error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}
