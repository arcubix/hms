<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Doctor_rooms extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Doctor_room_model');
        $this->load->model('Room_model');
        $this->load->model('Reception_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/doctor-rooms - Get all doctor room assignments
     * POST /api/doctor-rooms - Create doctor room assignment
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing doctor room assignments
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('doctor_id')) {
                $filters['doctor_id'] = $this->input->get('doctor_id');
            }
            
            if ($this->input->get('room_id')) {
                $filters['room_id'] = $this->input->get('room_id');
            }
            
            if ($this->input->get('reception_id')) {
                $filters['reception_id'] = $this->input->get('reception_id');
            }
            
            if ($this->input->get('is_active') !== null) {
                $filters['is_active'] = $this->input->get('is_active');
            }
            
            $assignments = $this->Doctor_room_model->get_all($filters);
            $this->success($assignments);
            
        } elseif ($method === 'POST') {
            // Check permission for creating doctor room assignments
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * GET /api/doctor-rooms/doctor/:doctor_id - Get doctor's room assignment
     */
    public function doctor($doctor_id = null) {
        // Check permission for viewing doctor room assignments
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        if (!$doctor_id) {
            $this->error('Doctor ID is required', 400);
            return;
        }
        
        $assignment = $this->Doctor_room_model->get_by_doctor($doctor_id);
        
        if ($assignment) {
            $this->success($assignment);
        } else {
            $this->error('No room assignment found for this doctor', 404);
        }
    }

    /**
     * GET /api/doctor-rooms/:id - Get single assignment
     * PUT /api/doctor-rooms/:id - Update assignment
     * DELETE /api/doctor-rooms/:id - Delete assignment
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Assignment ID is required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing doctor room assignments
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $assignment = $this->Doctor_room_model->get_by_id($id);
            
            if ($assignment) {
                $this->success($assignment);
            } else {
                $this->error('Assignment not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            // Check permission for updating doctor room assignments
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->update($id);
            
        } elseif ($method === 'DELETE') {
            // Check permission for deleting doctor room assignments
            if (!$this->requirePermission('admin.delete_users')) {
                return;
            }
            $this->delete($id);
            
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create doctor room assignment
     */
    private function create() {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['doctor_id']) || empty($data['room_id']) || empty($data['reception_id'])) {
            $this->error('Missing required fields: doctor_id, room_id, reception_id', 400);
            return;
        }
        
        // Validate room exists
        $room = $this->Room_model->get_by_id($data['room_id']);
        if (!$room) {
            $this->error('Room not found', 404);
            return;
        }
        
        // Validate reception exists
        $reception = $this->Reception_model->get_by_id($data['reception_id']);
        if (!$reception) {
            $this->error('Reception not found', 404);
            return;
        }
        
        // Verify reception is on same floor as room
        if ($reception['floor_id'] != $room['floor_id']) {
            $this->error('Reception must be on the same floor as the room', 400);
            return;
        }
        
        $id = $this->Doctor_room_model->create($data);
        
        if ($id) {
            $assignment = $this->Doctor_room_model->get_by_id($id);
            
            // Log room assignment creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('OPD Management', 'Doctor Room Assignment', $id, "Assigned doctor {$data['doctor_id']} to room {$data['room_id']}");
            
            $this->success($assignment, 'Room assignment created successfully');
        } else {
            $this->error('Failed to create room assignment', 500);
        }
    }

    /**
     * Update doctor room assignment
     */
    private function update($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate room if provided
        if (isset($data['room_id'])) {
            $room = $this->Room_model->get_by_id($data['room_id']);
            if (!$room) {
                $this->error('Room not found', 404);
                return;
            }
        }
        
        // Validate reception if provided
        if (isset($data['reception_id'])) {
            $reception = $this->Reception_model->get_by_id($data['reception_id']);
            if (!$reception) {
                $this->error('Reception not found', 404);
                return;
            }
            
            // If room_id is also provided, verify they're on same floor
            if (isset($data['room_id'])) {
                $room = $this->Room_model->get_by_id($data['room_id']);
                if ($reception['floor_id'] != $room['floor_id']) {
                    $this->error('Reception must be on the same floor as the room', 400);
                    return;
                }
            } else {
                // Get existing assignment to check room
                $existing = $this->Doctor_room_model->get_by_id($id);
                if ($existing) {
                    $room = $this->Room_model->get_by_id($existing['room_id']);
                    if ($reception['floor_id'] != $room['floor_id']) {
                        $this->error('Reception must be on the same floor as the room', 400);
                        return;
                    }
                }
            }
        }
        
        $old_assignment = $this->Doctor_room_model->get_by_id($id);
        
        if ($this->Doctor_room_model->update($id, $data)) {
            $assignment = $this->Doctor_room_model->get_by_id($id);
            
            // Log room assignment update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('OPD Management', 'Doctor Room Assignment', $id, "Updated room assignment ID: {$id}", $old_assignment, $assignment);
            
            $this->success($assignment, 'Room assignment updated successfully');
        } else {
            $this->error('Failed to update room assignment', 500);
        }
    }

    /**
     * Delete doctor room assignment
     */
    private function delete($id) {
        $assignment = $this->Doctor_room_model->get_by_id($id);
        
        if ($this->Doctor_room_model->delete($id)) {
            // Log room assignment deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('OPD Management', 'Doctor Room Assignment', $id, "Deleted room assignment ID: {$id}");
            
            $this->success(null, 'Room assignment deleted successfully');
        } else {
            $this->error('Failed to delete room assignment', 500);
        }
    }
}

