<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Patients API Controller
 */
class Patients extends Api {

    public function __construct() {
        parent::__construct();
        
        // OPTIONS requests are already handled in parent::__construct() and exit there
        // So if we reach here, it's not an OPTIONS request
        
        $this->load->model('Patient_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all patients
     * GET /api/patients
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check if model is loaded
                if (!isset($this->Patient_model)) {
                    log_message('error', 'Patient_model not loaded');
                    $this->error('Model not loaded', 500);
                    return;
                }
                
                // Get filters from query parameters
                $filters = array();
                
                if ($this->input->get('search')) {
                    $filters['search'] = $this->input->get('search');
                }
                
                if ($this->input->get('phone')) {
                    $filters['phone'] = $this->input->get('phone');
                }
                
                $patients = $this->Patient_model->get_all($filters);
                
                if ($patients === false) {
                    log_message('error', 'Patient_model->get_all() returned false');
                    $this->error('Failed to retrieve patients', 500);
                    return;
                }
                
                $this->success($patients);
            } elseif ($method === 'POST') {
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Patients index error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            $this->error('Server error: ' . $e->getMessage(), 500);
        } catch (Error $e) {
            log_message('error', 'Patients index fatal error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            $this->error('Fatal error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single patient, update, or delete
     * GET /api/patients/:id
     * PUT /api/patients/:id
     * DELETE /api/patients/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Patient ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check if ID is numeric (database ID) or string (patient_id like P001)
                $patient = null;
                if (is_numeric($id)) {
                    // Numeric ID - use get_by_id
                    $patient = $this->Patient_model->get_by_id($id);
                } else {
                    // String ID (like P001) - use get_by_patient_id
                    $patient = $this->Patient_model->get_by_patient_id($id);
                }
                
                if (!$patient) {
                    $this->error('Patient not found', 404);
                    return;
                }

                $this->success($patient);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update($id);
            } elseif ($method === 'DELETE') {
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Patients get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create patient
     * POST /api/patients
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('name', 'phone', 'age', 'gender');
            $errors = array();

            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "The {$field} field is required.";
                }
            }

            if (!empty($errors)) {
                $this->error('Validation failed', 422, $errors);
                return;
            }

            // Generate patient ID
            $data['patient_id'] = $this->Patient_model->generate_patient_id();
            $data['created_by'] = $this->user['id'];
            $data['status'] = $data['status'] ?? 'Active';

            $patient_id = $this->Patient_model->create($data);

            if ($patient_id) {
                $patient = $this->Patient_model->get_by_id($patient_id);
                $this->success($patient, 'Patient created successfully', 201);
            } else {
                $this->error('Failed to create patient', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Patients create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update patient
     * PUT /api/patients/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $patient = $this->Patient_model->get_by_id($id);
            
            if (!$patient) {
                $this->error('Patient not found', 404);
                return;
            }

            // Remove patient_id from update data (should not be changed)
            unset($data['patient_id']);
            unset($data['id']);

            $result = $this->Patient_model->update($id, $data);

            if ($result) {
                $patient = $this->Patient_model->get_by_id($id);
                $this->success($patient, 'Patient updated successfully');
            } else {
                $this->error('Failed to update patient', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Patients update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete patient
     * DELETE /api/patients/:id
     */
    private function delete($id) {
        try {
            $patient = $this->Patient_model->get_by_id($id);
            
            if (!$patient) {
                $this->error('Patient not found', 404);
                return;
            }

            $result = $this->Patient_model->delete($id);

            if ($result) {
                $this->success(null, 'Patient deleted successfully');
            } else {
                $this->error('Failed to delete patient', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Patients delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

