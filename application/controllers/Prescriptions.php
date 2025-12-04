<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Prescriptions extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Prescription_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/prescriptions - Get all prescriptions
     * POST /api/prescriptions - Create prescription
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('patient_id')) {
                $filters['patient_id'] = $this->input->get('patient_id');
            }
            
            if ($this->input->get('doctor_id')) {
                $filters['doctor_id'] = $this->input->get('doctor_id');
            }
            
            if ($this->input->get('appointment_id')) {
                $filters['appointment_id'] = $this->input->get('appointment_id');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            $prescriptions = $this->Prescription_model->get_all($filters);
            $this->success($prescriptions);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create prescription
     * POST /api/prescriptions
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['patient_id']) || empty($data['doctor_id'])) {
                $this->error('Patient ID and Doctor ID are required', 400);
                return;
            }

            // Add created_by from authenticated user
            $data['created_by'] = $this->user['id'];

            $result = $this->Prescription_model->create($data);
            
            if ($result['success']) {
                $prescription = $this->Prescription_model->get_by_id($result['id']);
                
                // Log prescription creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Prescriptions', 'Prescription', $result['id'], "Created prescription for patient ID: {$data['patient_id']}");
                
                $this->success($prescription, 'Prescription created successfully', 201);
            } else {
                $this->error($result['message'] ?? 'Failed to create prescription', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Prescription create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/prescriptions/:id - Get single prescription
     * PUT /api/prescriptions/:id - Update prescription
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Prescription ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $prescription = $this->Prescription_model->get_by_id($id);
            
            if ($prescription) {
                $this->success($prescription);
            } else {
                $this->error('Prescription not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update prescription
     * PUT /api/prescriptions/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            $old_prescription = $this->Prescription_model->get_by_id($id);
            $result = $this->Prescription_model->update($id, $data);
            
            if ($result['success']) {
                $prescription = $this->Prescription_model->get_by_id($id);
                
                // Log prescription update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Prescriptions', 'Prescription', $id, "Updated prescription ID: {$id}", $old_prescription, $prescription);
                
                $this->success($prescription, 'Prescription updated successfully');
            } else {
                $this->error($result['message'] ?? 'Failed to update prescription', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Prescription update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

