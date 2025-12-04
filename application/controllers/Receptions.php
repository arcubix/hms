<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Receptions API Controller
 * Handles reception management operations
 */
class Receptions extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Reception_model');
        $this->load->model('Floor_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all receptions or create new reception
     * GET /api/receptions
     * POST /api/receptions
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'floor_id' => $this->input->get('floor_id'),
                    'department_id' => $this->input->get('department_id')
                );
                
                $receptions = $this->Reception_model->get_all($filters);
                $this->success($receptions);
            } elseif ($method === 'POST') {
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Receptions index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single reception, update, or delete
     * GET /api/receptions/:id
     * PUT /api/receptions/:id
     * DELETE /api/receptions/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Reception ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $reception = $this->Reception_model->get_by_id($id);
                
                if (!$reception) {
                    $this->error('Reception not found', 404);
                    return;
                }

                $this->success($reception);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update($id);
            } elseif ($method === 'DELETE') {
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Receptions get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create reception
     * POST /api/receptions
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('reception_name', 'floor_id');
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

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive', 'Under Maintenance'))) {
                $errors['status'] = "Invalid status value.";
            }

            if (!empty($errors)) {
                $this->error('Validation failed', 422, $errors);
                return;
            }

            // Check if reception code already exists (if provided)
            if (!empty($data['reception_code'])) {
                $this->db->where('reception_code', $data['reception_code']);
                $existing_reception = $this->db->get('receptions')->row_array();
                if ($existing_reception) {
                    $this->error('Reception code already exists', 422, array('reception_code' => 'Reception code must be unique.'));
                    return;
                }
            }

            $data['created_by'] = $this->user['id'];
            $reception_id = $this->Reception_model->create($data);

            if ($reception_id) {
                $reception = $this->Reception_model->get_by_id($reception_id);
                
                // Log reception creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Master Data', 'Reception', $reception_id, "Created reception: {$data['reception_name']}");
                
                $this->success($reception, 'Reception created successfully', 201);
            } else {
                $this->error('Failed to create reception', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Receptions create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update reception
     * PUT /api/receptions/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $reception = $this->Reception_model->get_by_id($id);
            
            if (!$reception) {
                $this->error('Reception not found', 404);
                return;
            }

            $old_reception = $reception; // Store old data for audit log

            // Validate floor exists if provided
            if (isset($data['floor_id'])) {
                $floor = $this->Floor_model->get_by_id($data['floor_id']);
                if (!$floor) {
                    $this->error('Invalid floor selected', 422, array('floor_id' => 'Invalid floor selected.'));
                    return;
                }
            }

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive', 'Under Maintenance'))) {
                $this->error('Invalid status value', 422, array('status' => 'Invalid status value.'));
                return;
            }

            // Check if reception code already exists (for another reception)
            if (isset($data['reception_code']) && $data['reception_code'] !== $reception['reception_code']) {
                $this->db->where('reception_code', $data['reception_code']);
                $this->db->where('id !=', $id);
                $existing_reception = $this->db->get('receptions')->row_array();
                if ($existing_reception) {
                    $this->error('Reception code already exists', 422, array('reception_code' => 'Reception code must be unique.'));
                    return;
                }
            }

            // Remove fields that shouldn't be updated
            unset($data['id']);
            unset($data['created_by']);
            unset($data['created_at']);

            $result = $this->Reception_model->update($id, $data);

            if ($result) {
                $reception = $this->Reception_model->get_by_id($id);
                
                // Log reception update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Master Data', 'Reception', $id, "Updated reception: {$reception['reception_name']}", $old_reception, $reception);
                
                $this->success($reception, 'Reception updated successfully');
            } else {
                $this->error('Failed to update reception', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Receptions update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete reception
     * DELETE /api/receptions/:id
     */
    private function delete($id) {
        try {
            $reception = $this->Reception_model->get_by_id($id);
            
            if (!$reception) {
                $this->error('Reception not found', 404);
                return;
            }

            $result = $this->Reception_model->delete($id);

            if ($result) {
                // Log reception deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Master Data', 'Reception', $id, "Deleted reception: {$reception['reception_name']}");
                
                $this->success(null, 'Reception deleted successfully');
            } else {
                $this->error('Cannot delete reception. It may be assigned to doctors.', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Receptions delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

