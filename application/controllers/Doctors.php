<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Doctors API Controller
 */
class Doctors extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Doctor_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all doctors or create new doctor
     * GET /api/doctors
     * POST /api/doctors
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Allow admin role by default, or check permission for viewing doctors
                if (!$this->isAdmin() && !$this->hasPermission('view_doctors') && !$this->hasPermission('admin.view_users')) {
                    $this->error('Access denied. Admin role or view_doctors permission required.', 403);
                    return;
                }
                
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'specialty' => $this->input->get('specialty')
                );
                
                $doctors = $this->Doctor_model->get_all($filters);
                $this->success($doctors);
            } elseif ($method === 'POST') {
                // Allow admin role by default, or check permission for creating doctors
                if (!$this->isAdmin() && !$this->hasPermission('create_doctors') && !$this->hasPermission('admin.create_users')) {
                    $this->error('Access denied. Admin role or create_doctors permission required.', 403);
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Doctors index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single doctor, update, or delete
     * GET /api/doctors/:id
     * PUT /api/doctors/:id
     * DELETE /api/doctors/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Doctor ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Allow admin role by default, or check permission for viewing doctor details
                if (!$this->isAdmin() && !$this->hasPermission('view_doctors') && !$this->hasPermission('admin.view_users')) {
                    $this->error('Access denied. Admin role or view_doctors permission required.', 403);
                    return;
                }
                
                $doctor = $this->Doctor_model->get_by_id($id);
                
                if (!$doctor) {
                    $this->error('Doctor not found', 404);
                    return;
                }

                $this->success($doctor);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Allow admin role by default, or check permission for updating doctors
                if (!$this->isAdmin() && !$this->hasPermission('edit_doctors') && !$this->hasPermission('admin.edit_users')) {
                    $this->error('Access denied. Admin role or edit_doctors permission required.', 403);
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                // Allow admin role by default, or check permission for deleting doctors
                if (!$this->isAdmin() && !$this->hasPermission('delete_doctors') && !$this->hasPermission('admin.delete_users')) {
                    $this->error('Access denied. Admin role or delete_doctors permission required.', 403);
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Doctors get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get or update doctor schedule
     * GET /api/doctors/:id/schedule
     * PUT /api/doctors/:id/schedule
     */
    public function schedule($id = null) {
        try {
            if (!$id) {
                $this->error('Doctor ID is required', 400);
                return;
            }

            // Verify doctor exists
            $doctor = $this->Doctor_model->get_by_id($id);
            if (!$doctor) {
                $this->error('Doctor not found', 404);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $schedule = $this->Doctor_model->get_schedule($id);
                $this->success($schedule);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $data = $this->get_request_data();
                
                if (!isset($data['schedule']) || !is_array($data['schedule'])) {
                    $this->error('Schedule data is required', 400);
                    return;
                }

                $result = $this->Doctor_model->update_schedule($id, $data['schedule']);
                
                if ($result) {
                    $schedule = $this->Doctor_model->get_schedule($id);
                    $this->success($schedule, 'Schedule updated successfully');
                } else {
                    $this->error('Failed to update schedule', 500);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Doctors schedule error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create doctor
     * POST /api/doctors
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('name', 'specialty', 'phone', 'email');
            $errors = array();

            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "The {$field} field is required.";
                }
            }

            // Validate email format
            if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = "Invalid email format.";
            }

            // Validate phone format (basic)
            if (!empty($data['phone']) && !preg_match('/^[\d\s\-\+\(\)]+$/', $data['phone'])) {
                $errors['phone'] = "Invalid phone format.";
            }

            if (!empty($errors)) {
                $this->error('Validation failed', 422, $errors);
                return;
            }

            // Check if email already exists in doctors table
            $existing_doctor = $this->db->get_where('doctors', array('email' => $data['email']))->row_array();
            if ($existing_doctor) {
                $this->error('Email already exists', 422, array('email' => 'This email is already registered as a doctor.'));
                return;
            }
            
            // Check if email already exists in users table (but allow if it's a doctor role)
            $existing_user = $this->db->get_where('users', array('email' => $data['email']))->row_array();
            if ($existing_user && $existing_user['role'] !== 'doctor') {
                $this->error('Email already exists', 422, array('email' => 'This email is already registered with a different role.'));
                return;
            }

            // Generate doctor ID
            $data['doctor_id'] = $this->Doctor_model->generate_doctor_id();
            $data['created_by'] = $this->user['id'];
            $data['status'] = $data['status'] ?? 'Available';
            $data['experience'] = isset($data['experience']) ? (int)$data['experience'] : 0;
            
            // Handle password if provided (hash it)
            if (isset($data['password']) && !empty($data['password'])) {
                $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
            }

            // Extract schedule data if provided
            $schedule_data = isset($data['schedule']) ? $data['schedule'] : null;
            unset($data['schedule']);

            $doctor_id = $this->Doctor_model->create($data);

            if ($doctor_id) {
                // Create schedule if provided
                if ($schedule_data && is_array($schedule_data)) {
                    $schedule_result = $this->Doctor_model->update_schedule($doctor_id, $schedule_data);
                    if (!$schedule_result) {
                        log_message('error', 'Failed to create schedule for doctor_id: ' . $doctor_id);
                        // Continue anyway - doctor was created successfully
                    }
                }
                
                $doctor = $this->Doctor_model->get_by_id($doctor_id);
                
                // Log doctor creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Master Data', 'Doctor', $doctor_id, "Created doctor: {$data['name']} ({$data['doctor_id']})");
                
                $this->success($doctor, 'Doctor created successfully', 201);
            } else {
                $this->error('Failed to create doctor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Doctors create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update doctor
     * PUT /api/doctors/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $doctor = $this->Doctor_model->get_by_id($id);
            
            if (!$doctor) {
                $this->error('Doctor not found', 404);
                return;
            }

            $old_doctor = $doctor; // Store old data for audit log

            // Validate email if provided
            if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $this->error('Invalid email format', 422, array('email' => 'Invalid email format.'));
                return;
            }

            // Check if email already exists (for another doctor)
            if (!empty($data['email']) && $data['email'] !== $doctor['email']) {
                $existing = $this->db->get_where('doctors', array('email' => $data['email']))->row_array();
                if ($existing && $existing['id'] != $id) {
                    $this->error('Email already exists', 422, array('email' => 'This email is already registered.'));
                    return;
                }
            }

            // Extract schedule data if provided
            $schedule_data = isset($data['schedule']) ? $data['schedule'] : null;
            unset($data['schedule']);

            // Remove fields that shouldn't be updated
            unset($data['doctor_id']);
            unset($data['id']);
            unset($data['created_by']);
            unset($data['created_at']);

            // Convert experience to int if provided
            if (isset($data['experience'])) {
                $data['experience'] = (int)$data['experience'];
            }

            $result = $this->Doctor_model->update($id, $data);

            if ($result) {
                // Update schedule if provided
                if ($schedule_data && is_array($schedule_data)) {
                    $schedule_result = $this->Doctor_model->update_schedule($id, $schedule_data);
                    if (!$schedule_result) {
                        log_message('error', 'Failed to update schedule for doctor_id: ' . $id);
                        // Continue anyway - doctor was updated successfully
                    }
                }
                
                $doctor = $this->Doctor_model->get_by_id($id);
                
                // Log doctor update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Master Data', 'Doctor', $id, "Updated doctor: {$doctor['name']} ({$doctor['doctor_id']})", $old_doctor, $doctor);
                
                $this->success($doctor, 'Doctor updated successfully');
            } else {
                $this->error('Failed to update doctor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Doctors update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete doctor
     * DELETE /api/doctors/:id
     */
    private function delete($id) {
        try {
            $doctor = $this->Doctor_model->get_by_id($id);
            
            if (!$doctor) {
                $this->error('Doctor not found', 404);
                return;
            }

            $result = $this->Doctor_model->delete($id);

            if ($result) {
                // Log doctor deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Master Data', 'Doctor', $id, "Deleted doctor: {$doctor['name']} ({$doctor['doctor_id']})");
                
                $this->success(null, 'Doctor deleted successfully');
            } else {
                $this->error('Failed to delete doctor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Doctors delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

