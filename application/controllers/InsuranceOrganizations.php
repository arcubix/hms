<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * InsuranceOrganizations API Controller
 * Handles insurance companies and corporate organizations management operations
 */
class InsuranceOrganizations extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('InsuranceOrganization_model');
        $this->load->model('InsurancePricing_model');
        $this->load->model('Doctor_model');
        $this->load->model('Lab_test_model');
        $this->load->model('Radiology_test_model');
        $this->load->model('Medicine_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all insurance organizations or create new
     * GET /api/insurance-organizations
     * POST /api/insurance-organizations
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing insurance organizations
                if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                    return;
                }
                
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'type' => $this->input->get('type'),
                    'status' => $this->input->get('status')
                );
                
                $organizations = $this->InsuranceOrganization_model->get_all($filters);
                $this->success($organizations);
            } elseif ($method === 'POST') {
                // Check permission for creating insurance organizations
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single insurance organization, update, or delete
     * GET /api/insurance-organizations/:id
     * PUT /api/insurance-organizations/:id
     * DELETE /api/insurance-organizations/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Insurance organization ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing insurance organization details
                if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                    return;
                }
                
                $organization = $this->InsuranceOrganization_model->get_by_id($id);
                
                if (!$organization) {
                    $this->error('Insurance organization not found', 404);
                    return;
                }

                $this->success($organization);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating insurance organizations
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                // Check permission for deleting insurance organizations
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get pricing configuration for an insurance organization
     * GET /api/insurance-organizations/:id/pricing
     */
    public function pricing($id = null) {
        try {
            if (!$id) {
                $this->error('Insurance organization ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $organization = $this->InsuranceOrganization_model->get_by_id($id);
                
                if (!$organization) {
                    $this->error('Insurance organization not found', 404);
                    return;
                }

                $pricing = $this->InsuranceOrganization_model->get_pricing($id);
                
                // Group pricing by item_type
                $grouped_pricing = array(
                    'procedure' => array(),
                    'laboratory' => array(),
                    'radiology' => array(),
                    'pharmacy' => array()
                );
                
                foreach ($pricing as $item) {
                    $grouped_pricing[$item['item_type']][] = $item;
                }
                
                $this->success($grouped_pricing);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update_pricing($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations pricing error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available items for pricing configuration
     * GET /api/insurance-organizations/pricing-items
     */
    public function pricing_items() {
        try {
            $item_type = $this->input->get('type'); // procedure, laboratory, radiology, pharmacy
            
            if (!$item_type) {
                $this->error('Item type is required', 400);
                return;
            }
            
            $items = array();
            
            switch ($item_type) {
                case 'procedure':
                    // Get doctors as procedures (consultation fees)
                    $doctors = $this->Doctor_model->get_all(array('status' => 'all'));
                    foreach ($doctors as $doctor) {
                        $items[] = array(
                            'id' => $doctor['id'],
                            'name' => $doctor['name'] . ' - ' . $doctor['specialty'],
                            'default_price' => 0.00 // Doctors don't have consultation_fee in schema, default to 0
                        );
                    }
                    break;
                    
                case 'laboratory':
                    $lab_tests = $this->Lab_test_model->get_all();
                    foreach ($lab_tests as $test) {
                        $items[] = array(
                            'id' => $test['id'],
                            'name' => $test['test_name'],
                            'default_price' => isset($test['price']) ? floatval($test['price']) : 0.00
                        );
                    }
                    break;
                    
                case 'radiology':
                    $radiology_tests = $this->Radiology_test_model->get_all();
                    foreach ($radiology_tests as $test) {
                        $items[] = array(
                            'id' => $test['id'],
                            'name' => $test['test_name'],
                            'default_price' => isset($test['price']) ? floatval($test['price']) : 0.00
                        );
                    }
                    break;
                    
                case 'pharmacy':
                    $medicines = $this->Medicine_model->get_all();
                    foreach ($medicines as $medicine) {
                        $items[] = array(
                            'id' => $medicine['id'],
                            'name' => $medicine['medicine_name'],
                            'default_price' => isset($medicine['price']) ? floatval($medicine['price']) : 0.00
                        );
                    }
                    break;
                    
                default:
                    $this->error('Invalid item type', 400);
                    return;
            }
            
            $this->success($items);
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations pricing_items error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new insurance organization
     */
    private function create() {
        try {
            $data = $this->get_request_data();

            // Validation
            if (empty($data['name'])) {
                $this->error('Name is required', 400);
                return;
            }

            // Validate type
            if (isset($data['type']) && !in_array($data['type'], array('insurance', 'organization'))) {
                $this->error('Invalid type. Must be "insurance" or "organization"', 422);
                return;
            }

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('active', 'inactive'))) {
                $this->error('Invalid status value', 422);
                return;
            }

            // Set created_by from authenticated user
            $data['created_by'] = $this->user['id'];

            $id = $this->InsuranceOrganization_model->create($data);
            
            if ($id) {
                $organization = $this->InsuranceOrganization_model->get_by_id($id);
                
                // Log insurance organization creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Insurance Management', 'Insurance Organization', $id, "Created insurance organization: {$data['name']}");
                
                $this->success($organization, 'Insurance organization created successfully', 201);
            } else {
                $this->error('Failed to create insurance organization', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update insurance organization
     */
    private function update($id) {
        try {
            $organization = $this->InsuranceOrganization_model->get_by_id($id);
            
            if (!$organization) {
                $this->error('Insurance organization not found', 404);
                return;
            }

            $old_organization = $organization; // Store old data for audit log

            $data = $this->get_request_data();

            // Validate type if provided
            if (isset($data['type']) && !in_array($data['type'], array('insurance', 'organization'))) {
                $this->error('Invalid type. Must be "insurance" or "organization"', 422);
                return;
            }

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], array('active', 'inactive'))) {
                $this->error('Invalid status value', 422);
                return;
            }

            // Don't allow updating created_by
            unset($data['created_by']);

            $result = $this->InsuranceOrganization_model->update($id, $data);
            
            if ($result) {
                $updated_organization = $this->InsuranceOrganization_model->get_by_id($id);
                
                // Log insurance organization update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Insurance Management', 'Insurance Organization', $id, "Updated insurance organization: {$updated_organization['name']}", $old_organization, $updated_organization);
                
                $this->success($updated_organization, 'Insurance organization updated successfully');
            } else {
                $this->error('Failed to update insurance organization', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update pricing configuration
     */
    private function update_pricing($id) {
        try {
            $organization = $this->InsuranceOrganization_model->get_by_id($id);
            
            if (!$organization) {
                $this->error('Insurance organization not found', 404);
                return;
            }

            $data = $this->get_request_data();
            
            if (!isset($data['pricing']) || !is_array($data['pricing'])) {
                $this->error('Pricing data is required', 400);
                return;
            }

            // Flatten pricing array
            $pricing_items = array();
            foreach ($data['pricing'] as $item) {
                if (isset($item['item_type']) && isset($item['item_id']) && isset($item['item_name'])) {
                    $pricing_items[] = array(
                        'item_type' => $item['item_type'],
                        'item_id' => $item['item_id'],
                        'item_name' => $item['item_name'],
                        'price' => isset($item['price']) ? floatval($item['price']) : 0.00,
                        'active' => isset($item['active']) ? ($item['active'] ? 1 : 0) : 1
                    );
                }
            }

            $result = $this->InsuranceOrganization_model->update_pricing($id, $pricing_items);
            
            if ($result) {
                $updated_pricing = $this->InsuranceOrganization_model->get_pricing($id);
                $this->success($updated_pricing, 'Pricing configuration updated successfully');
            } else {
                $this->error('Failed to update pricing configuration', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations update_pricing error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete insurance organization
     */
    private function delete($id) {
        try {
            $organization = $this->InsuranceOrganization_model->get_by_id($id);
            
            if (!$organization) {
                $this->error('Insurance organization not found', 404);
                return;
            }

            $result = $this->InsuranceOrganization_model->delete($id);
            
            if ($result) {
                // Log insurance organization deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Insurance Management', 'Insurance Organization', $id, "Deleted insurance organization: {$organization['name']}");
                
                $this->success(null, 'Insurance organization deleted successfully');
            } else {
                $this->error('Failed to delete insurance organization', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'InsuranceOrganizations delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

