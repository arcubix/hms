<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Appointments extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Appointment_model');
    }

    /**
     * GET /api/appointments - Get all appointments
     * POST /api/appointments - Create appointment
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('doctor_id')) {
                $filters['doctor_id'] = $this->input->get('doctor_id');
            }
            
            if ($this->input->get('patient_id')) {
                $filters['patient_id'] = $this->input->get('patient_id');
            }
            
            if ($this->input->get('date')) {
                $filters['date'] = $this->input->get('date');
            }
            
            if ($this->input->get('date_from')) {
                $filters['date_from'] = $this->input->get('date_from');
            }
            
            if ($this->input->get('date_to')) {
                $filters['date_to'] = $this->input->get('date_to');
            }
            
            $appointments = $this->Appointment_model->get_all($filters);
            $this->success($appointments);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create appointment
     */
    public function create() {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['patient_id']) || empty($data['doctor_doctor_id']) || empty($data['appointment_date'])) {
            $this->error('Missing required fields: patient_id, doctor_doctor_id, appointment_date', 400);
            return;
        }
        
        $result = $this->Appointment_model->create($data);
        
        if ($result['success']) {
            $appointment = $this->Appointment_model->get_by_id($result['id']);
            $this->success($appointment, 'Appointment created successfully');
        } else {
            $this->error($result['message'] ?? 'Failed to create appointment', 400);
        }
    }

    /**
     * GET /api/appointments/:id - Get single appointment
     * PUT /api/appointments/:id - Update appointment
     * DELETE /api/appointments/:id - Delete appointment
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Appointment ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $appointment = $this->Appointment_model->get_by_id($id);
            
            if ($appointment) {
                $this->success($appointment);
            } else {
                $this->error('Appointment not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
            
        } elseif ($method === 'DELETE') {
            $this->delete($id);
            
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update appointment
     */
    public function update($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $result = $this->Appointment_model->update($id, $data);
        
        if ($result['success']) {
            $appointment = $this->Appointment_model->get_by_id($id);
            $this->success($appointment, 'Appointment updated successfully');
        } else {
            $this->error($result['message'] ?? 'Failed to update appointment', 400);
        }
    }

    /**
     * Delete appointment
     */
    public function delete($id) {
        if ($this->Appointment_model->delete($id)) {
            $this->success(null, 'Appointment deleted successfully');
        } else {
            $this->error('Failed to delete appointment', 500);
        }
    }

    /**
     * PUT /api/appointments/:id/status - Update appointment status
     */
    public function update_status($id = null) {
        if (!$id) {
            $this->error('Appointment ID required', 400);
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
        
        $result = $this->Appointment_model->update($id, array('status' => $data['status']));
        
        if ($result['success']) {
            $appointment = $this->Appointment_model->get_by_id($id);
            $this->success($appointment, 'Appointment status updated successfully');
        } else {
            $this->error($result['message'] ?? 'Failed to update status', 400);
        }
    }

    /**
     * GET /api/appointments/doctor/:id/slots?date=YYYY-MM-DD&duration=30
     * Get available slots for doctor on a specific date
     */
    public function get_available_slots($doctor_id = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $duration = $this->input->get('duration') ? (int)$this->input->get('duration') : 30;
        
        if (!$date) {
            $this->error('Date parameter required (format: YYYY-MM-DD)', 400);
            return;
        }
        
        $slots = $this->Appointment_model->get_available_slots($doctor_id, $date, $duration);
        $this->success($slots);
    }

    /**
     * GET /api/appointments/doctor/:id/available-dates?month=YYYY-MM
     * Get available dates for doctor in a month
     */
    public function get_available_dates($doctor_id = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID required', 400);
            return;
        }
        
        $month = $this->input->get('month');
        
        if (!$month) {
            // Default to current month
            $month = date('Y-m');
        }
        
        // Validate month format
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            $this->error('Invalid month format. Use YYYY-MM', 400);
            return;
        }
        
        $result = $this->Appointment_model->get_available_dates($doctor_id, $month);
        $this->success($result);
    }

    /**
     * GET /api/appointments/doctor/:id - Get appointments by doctor
     */
    public function get_by_doctor($doctor_id = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $appointments = $this->Appointment_model->get_by_doctor($doctor_id, $date);
        $this->success($appointments);
    }

    /**
     * GET /api/appointments/patient/:id - Get appointments by patient
     */
    public function get_by_patient($patient_id = null) {
        if (!$patient_id) {
            $this->error('Patient ID required', 400);
            return;
        }
        
        $appointments = $this->Appointment_model->get_by_patient($patient_id);
        $this->success($appointments);
    }
}

