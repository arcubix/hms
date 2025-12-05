<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Rooms API Controller
 * Handles room management operations
 */
class Rooms extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Room_model');
        $this->load->model('Floor_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all rooms or create new room
     * GET /api/rooms
     * POST /api/rooms
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing rooms
                if (!$this->requirePermission('admin.view_users')) {
                    return;
                }
                
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'floor_id' => $this->input->get('floor_id'),
                    'department_id' => $this->input->get('department_id'),
                    'room_type' => $this->input->get('room_type')
                );
                
                $rooms = $this->Room_model->get_all($filters);
                $this->success($rooms);
            } elseif ($method === 'POST') {
                // Check permission for creating rooms
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Rooms index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single room, update, or delete
     * GET /api/rooms/:id
     * PUT /api/rooms/:id
     * DELETE /api/rooms/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Room ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing room details
                if (!$this->requirePermission('admin.view_users')) {
                    return;
                }
                
                $room = $this->Room_model->get_by_id($id);
                
                if (!$room) {
                    $this->error('Room not found', 404);
                    return;
                }

                $this->success($room);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating rooms
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                // Check permission for deleting rooms
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Rooms get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all room types
     * GET /api/rooms/types
     */
    public function types() {
        try {
            $types = $this->Room_model->get_room_types();
            $this->success($types);
        } catch (Exception $e) {
            log_message('error', 'Rooms types error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create room
     * POST /api/rooms
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('room_number', 'floor_id');
            $errors = array();

            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "The {$field} field is required.";
                }
            }

            // Validate floor exists
            if (!empty($data['floor_id'])) {
                $floor = $this->Floor_model->get_by_id($data['floor_id']);
                if (!$floor) {
                    $errors['floor_id'] = "Invalid floor selected.";
                }
            }

            // Validate room type
            if (isset($data['room_type']) && !in_array($data['room_type'], array('Consultation', 'Examination', 'Procedure', 'Waiting', 'Storage', 'Other'))) {
                $errors['room_type'] = "Invalid room type.";
            }

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive', 'Under Maintenance', 'Reserved'))) {
                $errors['status'] = "Invalid status value.";
            }

            // Validate capacity
            if (isset($data['capacity']) && (!is_numeric($data['capacity']) || $data['capacity'] < 1)) {
                $errors['capacity'] = "Capacity must be a positive number.";
            }

            if (!empty($errors)) {
                $this->error('Validation failed', 422, $errors);
                return;
            }

            // Check if room with same number and floor already exists
            $this->db->where('room_number', $data['room_number']);
            $this->db->where('floor_id', $data['floor_id']);
            $existing_room = $this->db->get('rooms')->row_array();
            if ($existing_room) {
                $this->error('Room with this number already exists on this floor', 422, array('room_number' => 'Room number must be unique per floor.'));
                return;
            }

            $data['created_by'] = $this->user['id'];
            $room_id = $this->Room_model->create($data);

            if ($room_id) {
                $room = $this->Room_model->get_by_id($room_id);
                
                // Log room creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Master Data', 'Room', $room_id, "Created room: {$data['room_number']}");
                
                $this->success($room, 'Room created successfully', 201);
            } else {
                $this->error('Failed to create room', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Rooms create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update room
     * PUT /api/rooms/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $room = $this->Room_model->get_by_id($id);
            
            if (!$room) {
                $this->error('Room not found', 404);
                return;
            }

            $old_room = $room; // Store old data for audit log

            // Validate floor exists if provided
            if (isset($data['floor_id'])) {
                $floor = $this->Floor_model->get_by_id($data['floor_id']);
                if (!$floor) {
                    $this->error('Invalid floor selected', 422, array('floor_id' => 'Invalid floor selected.'));
                    return;
                }
            }

            // Validate room type if provided
            if (isset($data['room_type']) && !in_array($data['room_type'], array('Consultation', 'Examination', 'Procedure', 'Waiting', 'Storage', 'Other'))) {
                $this->error('Invalid room type', 422, array('room_type' => 'Invalid room type.'));
                return;
            }

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive', 'Under Maintenance', 'Reserved'))) {
                $this->error('Invalid status value', 422, array('status' => 'Invalid status value.'));
                return;
            }

            // Validate capacity if provided
            if (isset($data['capacity']) && (!is_numeric($data['capacity']) || $data['capacity'] < 1)) {
                $this->error('Capacity must be a positive number', 422, array('capacity' => 'Capacity must be a positive number.'));
                return;
            }

            // Check if room with same number and floor already exists (for another room)
            if (isset($data['room_number'])) {
                $floor_id = isset($data['floor_id']) ? $data['floor_id'] : $room['floor_id'];
                $this->db->where('room_number', $data['room_number']);
                $this->db->where('floor_id', $floor_id);
                $this->db->where('id !=', $id);
                $existing_room = $this->db->get('rooms')->row_array();
                if ($existing_room) {
                    $this->error('Room with this number already exists on this floor', 422, array('room_number' => 'Room number must be unique per floor.'));
                    return;
                }
            }

            // Remove fields that shouldn't be updated
            unset($data['id']);
            unset($data['created_by']);
            unset($data['created_at']);

            $result = $this->Room_model->update($id, $data);

            if ($result) {
                $room = $this->Room_model->get_by_id($id);
                
                // Log room update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Master Data', 'Room', $id, "Updated room: {$room['room_number']}", $old_room, $room);
                
                $this->success($room, 'Room updated successfully');
            } else {
                $this->error('Failed to update room', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Rooms update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete room
     * DELETE /api/rooms/:id
     */
    private function delete($id) {
        try {
            $room = $this->Room_model->get_by_id($id);
            
            if (!$room) {
                $this->error('Room not found', 404);
                return;
            }

            $result = $this->Room_model->delete($id);

            if ($result) {
                // Log room deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Master Data', 'Room', $id, "Deleted room: {$room['room_number']}");
                
                $this->success(null, 'Room deleted successfully');
            } else {
                $this->error('Cannot delete room. It may be assigned to doctors.', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Rooms delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

