<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * ReferralHospitals API Controller
 * Handles referral hospital management operations
 */
class ReferralHospitals extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('ReferralHospital_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all referral hospitals or create new referral hospital
     * GET /api/referral-hospitals
     * POST /api/referral-hospitals
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'specialty_type' => $this->input->get('specialty_type')
                );
                
                $hospitals = $this->ReferralHospital_model->get_all($filters);
                $this->success($hospitals);
            } elseif ($method === 'POST') {
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'ReferralHospitals index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single referral hospital, update, or delete
     * GET /api/referral-hospitals/:id
     * PUT /api/referral-hospitals/:id
     * DELETE /api/referral-hospitals/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Referral hospital ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $hospital = $this->ReferralHospital_model->get_by_id($id);
                
                if (!$hospital) {
                    $this->error('Referral hospital not found', 404);
                    return;
                }

                $this->success($hospital);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update($id);
            } elseif ($method === 'DELETE') {
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'ReferralHospitals get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all specialty types
     * GET /api/referral-hospitals/types
     */
    public function types() {
        try {
            $types = $this->ReferralHospital_model->get_specialty_types();
            $this->success($types);
        } catch (Exception $e) {
            log_message('error', 'ReferralHospitals types error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new referral hospital
     */
    private function create() {
        try {
            $data = $this->get_request_data();

            // Validation
            if (empty($data['hospital_name'])) {
                $this->error('Hospital name is required', 400);
                return;
            }

            // Validate specialty type
            if (isset($data['specialty_type']) && !in_array($data['specialty_type'], array('Multi-Specialty', 'Single-Specialty', 'General', 'Specialized'))) {
                $this->error('Invalid specialty type', 422);
                return;
            }

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive'))) {
                $this->error('Invalid status value', 422);
                return;
            }

            // Set created_by from authenticated user
            $data['created_by'] = $this->user['id'];

            $id = $this->ReferralHospital_model->create($data);
            
            if ($id) {
                $hospital = $this->ReferralHospital_model->get_by_id($id);
                $this->success($hospital, 'Referral hospital created successfully', 201);
            } else {
                $this->error('Failed to create referral hospital', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'ReferralHospitals create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update referral hospital
     */
    private function update($id) {
        try {
            $hospital = $this->ReferralHospital_model->get_by_id($id);
            
            if (!$hospital) {
                $this->error('Referral hospital not found', 404);
                return;
            }

            $data = $this->get_request_data();

            // Validate specialty type if provided
            if (isset($data['specialty_type']) && !in_array($data['specialty_type'], array('Multi-Specialty', 'Single-Specialty', 'General', 'Specialized'))) {
                $this->error('Invalid specialty type', 422);
                return;
            }

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], array('Active', 'Inactive'))) {
                $this->error('Invalid status value', 422);
                return;
            }

            // Don't allow updating created_by
            unset($data['created_by']);

            $result = $this->ReferralHospital_model->update($id, $data);
            
            if ($result) {
                $updated_hospital = $this->ReferralHospital_model->get_by_id($id);
                $this->success($updated_hospital, 'Referral hospital updated successfully');
            } else {
                $this->error('Failed to update referral hospital', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'ReferralHospitals update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete referral hospital
     */
    private function delete($id) {
        try {
            $hospital = $this->ReferralHospital_model->get_by_id($id);
            
            if (!$hospital) {
                $this->error('Referral hospital not found', 404);
                return;
            }

            $result = $this->ReferralHospital_model->delete($id);
            
            if ($result) {
                $this->success(null, 'Referral hospital deleted successfully');
            } else {
                $this->error('Failed to delete referral hospital', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'ReferralHospitals delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

