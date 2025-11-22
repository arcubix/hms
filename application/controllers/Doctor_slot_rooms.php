<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Doctor_slot_rooms extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Doctor_slot_room_model');
        $this->load->model('Room_model');
        $this->load->model('Reception_model');
        $this->load->model('Doctor_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/doctor-slot-rooms - Get all assignments with filters
     * POST /api/doctor-slot-rooms - Create slot-room assignment
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('doctor_id')) {
                $filters['doctor_id'] = $this->input->get('doctor_id');
            }
            
            if ($this->input->get('schedule_id')) {
                $filters['schedule_id'] = $this->input->get('schedule_id');
            }
            
            if ($this->input->get('room_id')) {
                $filters['room_id'] = $this->input->get('room_id');
            }
            
            if ($this->input->get('reception_id')) {
                $filters['reception_id'] = $this->input->get('reception_id');
            }
            
            if ($this->input->get('assignment_date')) {
                $filters['assignment_date'] = $this->input->get('assignment_date');
            }
            
            if ($this->input->get('date_from')) {
                $filters['date_from'] = $this->input->get('date_from');
            }
            
            if ($this->input->get('date_to')) {
                $filters['date_to'] = $this->input->get('date_to');
            }
            
            if ($this->input->get('is_active') !== null) {
                $filters['is_active'] = $this->input->get('is_active');
            }
            
            $assignments = $this->Doctor_slot_room_model->get_all($filters);
            $this->success($assignments);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * GET /api/doctor-slot-rooms/doctor/:doctor_id/date/:date - Get doctor's rooms for date
     */
    public function doctor($doctor_id = null, $date = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID is required', 400);
            return;
        }
        
        if (!$date) {
            $date = date('Y-m-d');
        }
        
        $assignments = $this->Doctor_slot_room_model->get_by_doctor_date($doctor_id, $date);
        $this->success($assignments);
    }

    /**
     * POST /api/doctor-slot-rooms/bulk - Bulk create assignments for date range
     */
    public function bulk() {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['doctor_id']) || empty($data['schedule_id']) || 
            empty($data['room_id']) || empty($data['reception_id']) ||
            empty($data['date_from']) || empty($data['date_to'])) {
            $this->error('Missing required fields: doctor_id, schedule_id, room_id, reception_id, date_from, date_to', 400);
            return;
        }
        
        // Validate dates
        if (strtotime($data['date_from']) > strtotime($data['date_to'])) {
            $this->error('date_from must be before or equal to date_to', 400);
            return;
        }
        
        // Validate room and reception
        $room = $this->Room_model->get_by_id($data['room_id']);
        if (!$room) {
            $this->error('Room not found', 404);
            return;
        }
        
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
        
        $inserted = $this->Doctor_slot_room_model->bulk_create($data);
        
        if ($inserted !== false) {
            $this->success(array('inserted' => $inserted), 'Bulk assignments created successfully');
        } else {
            $this->error('Failed to create bulk assignments', 500);
        }
    }

    /**
     * GET /api/doctor-slot-rooms/:id - Get single assignment
     * PUT /api/doctor-slot-rooms/:id - Update assignment
     * DELETE /api/doctor-slot-rooms/:id - Delete assignment
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Assignment ID is required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $assignment = $this->Doctor_slot_room_model->get_by_id($id);
            
            if ($assignment) {
                $this->success($assignment);
            } else {
                $this->error('Assignment not found', 404);
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
     * Create slot-room assignment
     */
    private function create() {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['doctor_id']) || empty($data['schedule_id']) || 
            empty($data['room_id']) || empty($data['assignment_date']) || 
            empty($data['reception_id'])) {
            $this->error('Missing required fields: doctor_id, schedule_id, room_id, assignment_date, reception_id', 400);
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
        
        $id = $this->Doctor_slot_room_model->create($data);
        
        if ($id) {
            $assignment = $this->Doctor_slot_room_model->get_by_id($id);
            $this->success($assignment, 'Slot-room assignment created successfully');
        } else {
            $this->error('Failed to create slot-room assignment', 500);
        }
    }

    /**
     * Update slot-room assignment
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
                $existing = $this->Doctor_slot_room_model->get_by_id($id);
                if ($existing) {
                    $room = $this->Room_model->get_by_id($existing['room_id']);
                    if ($reception['floor_id'] != $room['floor_id']) {
                        $this->error('Reception must be on the same floor as the room', 400);
                        return;
                    }
                }
            }
        }
        
        if ($this->Doctor_slot_room_model->update($id, $data)) {
            $assignment = $this->Doctor_slot_room_model->get_by_id($id);
            $this->success($assignment, 'Slot-room assignment updated successfully');
        } else {
            $this->error('Failed to update slot-room assignment', 500);
        }
    }

    /**
     * Delete slot-room assignment
     */
    private function delete($id) {
        if ($this->Doctor_slot_room_model->delete($id)) {
            $this->success(null, 'Slot-room assignment deleted successfully');
        } else {
            $this->error('Failed to delete slot-room assignment', 500);
        }
    }
}

