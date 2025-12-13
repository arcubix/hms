<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * Organizations API Controller
 * Handles multi-tenant organization management
 */
class Organizations extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Organization_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all organizations or create new
     * GET /api/organizations
     * POST /api/organizations
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Only admin can view all organizations
                if (!$this->requirePermission('admin.view_users')) {
                    return;
                }
                
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'subscription_status' => $this->input->get('subscription_status'),
                    'organization_type' => $this->input->get('organization_type')
                );
                
                $organizations = $this->Organization_model->get_all($filters);
                
                // Add statistics to each organization
                foreach ($organizations as &$org) {
                    $org['statistics'] = $this->Organization_model->get_statistics($org['id']);
                }
                
                $this->success($organizations);
            } elseif ($method === 'POST') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Organizations index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single organization, update, or delete
     * GET /api/organizations/:id
     * PUT /api/organizations/:id
     * DELETE /api/organizations/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Organization ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check access
                if (!$this->require_organization_access($id)) {
                    return;
                }
                
                $organization = $this->Organization_model->get_by_id($id);
                
                if (!$organization) {
                    $this->error('Organization not found', 404);
                    return;
                }

                // Add statistics and active subscription
                $organization['statistics'] = $this->Organization_model->get_statistics($id);
                $organization['active_subscription'] = $this->Organization_model->get_active_subscription($id);
                
                $this->success($organization);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$this->require_organization_access($id)) {
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Organizations get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new organization
     */
    private function create() {
        $data = $this->get_request_data();
        
        // Validation
        if (empty($data['name'])) {
            $this->error('Organization name is required', 400);
            return;
        }
        
        if (empty($data['email'])) {
            $this->error('Email is required', 400);
            return;
        }
        
        if (empty($data['phone'])) {
            $this->error('Phone is required', 400);
            return;
        }
        
        // Check if organization email already exists
        $existing = $this->Organization_model->get_by_email($data['email']);
        if ($existing) {
            $this->error('Organization with this email already exists', 409);
            return;
        }
        
        // Validate admin user data if provided
        if (!empty($data['admin_name']) || !empty($data['admin_email'])) {
            if (empty($data['admin_name'])) {
                $this->error('Admin user name is required', 400);
                return;
            }
            
            if (empty($data['admin_email'])) {
                $this->error('Admin user email is required', 400);
                return;
            }
            
            if (empty($data['admin_password'])) {
                $this->error('Admin user password is required', 400);
                return;
            }
            
            // Check if admin email already exists
            $this->load->model('User_model');
            $existing_user = $this->User_model->get_user_by_email($data['admin_email']);
            if ($existing_user) {
                $this->error('User with this email already exists', 409);
                return;
            }
            
            // Prepare admin user data
            $data['admin_user'] = array(
                'name' => $data['admin_name'],
                'email' => $data['admin_email'],
                'password' => $data['admin_password'],
                'phone' => $data['admin_phone'] ?? null,
                'role' => 'admin',
                'status' => 'active'
            );
        }
        
        // Set created_by
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        $id = $this->Organization_model->create($data);
        
        if ($id) {
            $organization = $this->Organization_model->get_by_id($id);
            
            // Get created admin user if exists
            $response_data = array('organization' => $organization);
            if (!empty($data['admin_user'])) {
                $this->load->model('User_model');
                $admin_user = $this->User_model->get_user_by_email($data['admin_user']['email']);
                if ($admin_user) {
                    $response_data['admin_user'] = $admin_user;
                }
            }
            
            // Log creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('Billing', 'Organization', $id, "Created organization: {$data['name']}");
            
            $this->success($response_data, 'Organization created successfully', 201);
        } else {
            $this->error('Failed to create organization', 500);
        }
    }

    /**
     * Update organization
     */
    private function update($id) {
        $data = $this->get_request_data();
        
        $organization = $this->Organization_model->get_by_id($id);
        if (!$organization) {
            $this->error('Organization not found', 404);
            return;
        }
        
        // Check email uniqueness if email is being changed
        if (isset($data['email']) && $data['email'] !== $organization['email']) {
            $existing = $this->Organization_model->get_by_email($data['email']);
            if ($existing && $existing['id'] != $id) {
                $this->error('Organization with this email already exists', 409);
                return;
            }
        }
        
        $old_organization = $organization;
        $result = $this->Organization_model->update($id, $data);
        
        if ($result) {
            $updated_organization = $this->Organization_model->get_by_id($id);
            
            // Log update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('Billing', 'Organization', $id, "Updated organization: {$updated_organization['name']}", $old_organization, $updated_organization);
            
            $this->success($updated_organization, 'Organization updated successfully');
        } else {
            $this->error('Failed to update organization', 500);
        }
    }

    /**
     * Delete organization
     */
    private function delete($id) {
        $organization = $this->Organization_model->get_by_id($id);
        if (!$organization) {
            $this->error('Organization not found', 404);
            return;
        }
        
        $result = $this->Organization_model->delete($id);
        
        if ($result) {
            // Log deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('Billing', 'Organization', $id, "Deleted organization: {$organization['name']}");
            
            $this->success(null, 'Organization deleted successfully');
        } else {
            $this->error('Failed to delete organization', 500);
        }
    }

    /**
     * Get current user's organization
     * GET /api/organizations/current
     */
    public function current() {
        try {
            $organization_id = $this->get_organization_id();
            
            if (!$organization_id) {
                $this->error('User is not associated with any organization', 404);
                return;
            }
            
            $organization = $this->Organization_model->get_by_id($organization_id);
            
            if (!$organization) {
                $this->error('Organization not found', 404);
                return;
            }
            
            // Add statistics and active subscription
            $organization['statistics'] = $this->Organization_model->get_statistics($organization_id);
            $organization['active_subscription'] = $this->Organization_model->get_active_subscription($organization_id);
            
            $this->success($organization);
        } catch (Exception $e) {
            log_message('error', 'Organizations current error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

