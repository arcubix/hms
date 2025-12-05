<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Floors API Controller
 * Handles floor management operations
 */
class Floors extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Floor_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all floors or create new floor
     * GET /api/floors
     * POST /api/floors
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing floors
                if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                    return;
                }
                
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'building_name' => $this->input->get('building_name')
                );
                
                $floors = $this->Floor_model->get_all($filters);
                $this->success($floors);
            } elseif ($method === 'POST') {
                // Check permission for creating floors
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Floors index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single floor, update, or delete
     * GET /api/floors/:id
     * PUT /api/floors/:id
     * DELETE /api/floors/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Floor ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing floors
                if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                    return;
                }
                
                $floor = $this->Floor_model->get_by_id($id);
                
                if (!$floor) {
                    $this->error('Floor not found', 404);
                    return;
                }

                $this->success($floor);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating floors
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                // Check permission for deleting floors
                if (!$this->requirePermission('admin.delete_users')) {
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Floors get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all buildings
     * GET /api/floors/buildings
     */
    public function buildings() {
        try {
            // Check permission for viewing buildings
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $buildings = $this->Floor_model->get_buildings();
            $this->success($buildings);
        } catch (Exception $e) {
            log_message('error', 'Floors buildings error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create floor
     * POST /api/floors
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('floor_number');
            $errors = array();

            foreach ($required as $field) {
                if (!isset($data[$field]) || $data[$field] === '') {
                    $errors[$field] = "The {$field} field is required.";
                }
            }

            // Validate floor_number is numeric
            if (isset($data['floor_number']) && !is_numeric($data['floor_number'])) {
                $errors['floor_number'] = "Floor number must be numeric.";
            }

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive', 'Under Maintenance'))) {
                $errors['status'] = "Invalid status value.";
            }

            if (!empty($errors)) {
                $this->error('Validation failed', 422, $errors);
                return;
            }

            // Check if floor with same number and building already exists
            $this->db->where('floor_number', $data['floor_number']);
            if (!empty($data['building_name'])) {
                $this->db->where('building_name', $data['building_name']);
            } else {
                $this->db->where('building_name IS NULL');
            }
            $existing_floor = $this->db->get('floors')->row_array();
            if ($existing_floor) {
                $this->error('Floor with this number already exists in this building', 422, array('floor_number' => 'Floor number must be unique per building.'));
                return;
            }

            $data['created_by'] = $this->user['id'];
            $floor_id = $this->Floor_model->create($data);

            if ($floor_id) {
                $floor = $this->Floor_model->get_by_id($floor_id);
                
                // Log floor creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Master Data', 'Floor', $floor_id, "Created floor: {$data['floor_number']}");
                
                $this->success($floor, 'Floor created successfully', 201);
            } else {
                $this->error('Failed to create floor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Floors create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update floor
     * PUT /api/floors/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $floor = $this->Floor_model->get_by_id($id);
            
            if (!$floor) {
                $this->error('Floor not found', 404);
                return;
            }

            $old_floor = $floor; // Store old data for audit log

            // Validate floor_number is numeric if provided
            if (isset($data['floor_number']) && !is_numeric($data['floor_number'])) {
                $this->error('Floor number must be numeric', 422, array('floor_number' => 'Floor number must be numeric.'));
                return;
            }

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive', 'Under Maintenance'))) {
                $this->error('Invalid status value', 422, array('status' => 'Invalid status value.'));
                return;
            }

            // Check if floor with same number and building already exists (for another floor)
            if (isset($data['floor_number'])) {
                $this->db->where('floor_number', $data['floor_number']);
                $building_name = isset($data['building_name']) ? $data['building_name'] : $floor['building_name'];
                if (!empty($building_name)) {
                    $this->db->where('building_name', $building_name);
                } else {
                    $this->db->where('building_name IS NULL');
                }
                $this->db->where('id !=', $id);
                $existing_floor = $this->db->get('floors')->row_array();
                if ($existing_floor) {
                    $this->error('Floor with this number already exists in this building', 422, array('floor_number' => 'Floor number must be unique per building.'));
                    return;
                }
            }

            // Remove fields that shouldn't be updated
            unset($data['id']);
            unset($data['created_by']);
            unset($data['created_at']);

            $result = $this->Floor_model->update($id, $data);

            if ($result) {
                $floor = $this->Floor_model->get_by_id($id);
                
                // Log floor update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Master Data', 'Floor', $id, "Updated floor: {$floor['floor_number']}", $old_floor, $floor);
                
                $this->success($floor, 'Floor updated successfully');
            } else {
                $this->error('Failed to update floor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Floors update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete floor
     * DELETE /api/floors/:id
     */
    private function delete($id) {
        try {
            $floor = $this->Floor_model->get_by_id($id);
            
            if (!$floor) {
                $this->error('Floor not found', 404);
                return;
            }

            $result = $this->Floor_model->delete($id);

            if ($result) {
                // Log floor deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Master Data', 'Floor', $id, "Deleted floor: {$floor['floor_number']}");
                
                $this->success(null, 'Floor deleted successfully');
            } else {
                $this->error('Cannot delete floor. It may have rooms or receptions assigned to it.', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Floors delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

