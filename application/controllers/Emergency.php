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
        
        // Don't allow updating patient_id or er_number
        unset($data['patient_id']);
        unset($data['er_number']);
        
        $result = $this->Emergency_model->update($id, $data);
        
        if ($result) {
            $visit = $this->Emergency_model->get_by_id($id);
            $this->success($this->format_visit($visit), 'Emergency visit updated successfully');
        } else {
            $this->error('Failed to update emergency visit', 400);
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
        
        $result = $this->Emergency_model->update_status($id, $data['status']);
        
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
            'phone' => $visit['patient_phone'] ?? '',
            'email' => $visit['patient_email'] ?? '',
            'bloodGroup' => $visit['patient_blood_group'] ?? '',
            'arrivalTime' => $arrival_time,
            'arrivalMode' => $visit['arrival_mode'],
            'triageLevel' => intval($visit['triage_level']),
            'chiefComplaint' => $visit['chief_complaint'],
            'vitals' => array(
                'bp' => $visit['vitals_bp'] ?? '',
                'pulse' => $visit['vitals_pulse'] ?? 0,
                'temp' => $visit['vitals_temp'] ?? 0,
                'spo2' => $visit['vitals_spo2'] ?? 0,
                'resp' => $visit['vitals_resp'] ?? 0
            ),
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
}
