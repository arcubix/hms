<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Users API Controller
 * Handles user management operations
 */
class Users extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('User_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all users or create new user
     * GET /api/users
     * POST /api/users
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'status' => $this->input->get('status'),
                    'role' => $this->input->get('role')
                );
                
                $users = $this->User_model->get_all($filters);
                $this->success($users);
            } elseif ($method === 'POST') {
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Users index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single user, update, or delete
     * GET /api/users/:id
     * PUT /api/users/:id
     * DELETE /api/users/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('User ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $user = $this->User_model->get_user_with_details($id);
                
                if (!$user) {
                    $this->error('User not found', 404);
                    return;
                }

                $this->success($user);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update($id);
            } elseif ($method === 'DELETE') {
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Users get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get or update user permissions
     * GET /api/users/:id/permissions
     * PUT /api/users/:id/permissions
     */
    public function permissions($id = null) {
        try {
            if (!$id) {
                $this->error('User ID is required', 400);
                return;
            }

            // Verify user exists
            $user = $this->User_model->get_user_by_id($id);
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $permissions = $this->User_model->get_user_permissions($id);
                $this->success($permissions);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $data = $this->get_request_data();
                
                if (!isset($data['permissions']) || !is_array($data['permissions'])) {
                    $this->error('Permissions data is required', 400);
                    return;
                }

                $result = $this->User_model->update_user_permissions($id, $data['permissions']);
                
                if ($result) {
                    $permissions = $this->User_model->get_user_permissions($id);
                    $this->success($permissions, 'Permissions updated successfully');
                } else {
                    $this->error('Failed to update permissions', 500);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Users permissions error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get or update user settings
     * GET /api/users/:id/settings
     * PUT /api/users/:id/settings
     */
    public function settings($id = null) {
        try {
            if (!$id) {
                $this->error('User ID is required', 400);
                return;
            }

            // Verify user exists
            $user = $this->User_model->get_user_by_id($id);
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $settings = $this->User_model->get_user_settings($id);
                $this->success($settings);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $data = $this->get_request_data();
                
                $result = $this->User_model->update_user_settings($id, $data);
                
                if ($result) {
                    $settings = $this->User_model->get_user_settings($id);
                    $this->success($settings, 'Settings updated successfully');
                } else {
                    $this->error('Failed to update settings', 500);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Users settings error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available roles
     * GET /api/users/roles
     */
    public function roles() {
        try {
            $roles = $this->User_model->get_available_roles();
            $this->success($roles);
        } catch (Exception $e) {
            log_message('error', 'Users roles error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get permission definitions
     * GET /api/users/permissions/definitions
     */
    public function permission_definitions() {
        try {
            $category = $this->input->get('category');
            $definitions = $this->User_model->get_permission_definitions($category);
            $this->success($definitions);
        } catch (Exception $e) {
            log_message('error', 'Users permission_definitions error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get role-permission mappings
     * GET /api/users/permissions/role-mappings
     */
    public function role_mappings() {
        try {
            $mappings = $this->User_model->get_all_role_permissions();
            $this->success($mappings);
        } catch (Exception $e) {
            log_message('error', 'Users role_mappings error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get or update permissions for a specific role
     * GET /api/users/roles/:role/permissions
     * PUT /api/users/roles/:role/permissions
     */
    public function role_permissions($role = null) {
        try {
            if (!$role) {
                $this->error('Role name is required', 400);
                return;
            }

            // Decode URL-encoded role name (handles spaces like "Radiology Receptionist")
            $role = urldecode($role);

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $permissions = $this->User_model->get_role_permissions($role);
                $this->success($permissions);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $data = $this->get_request_data();
                
                if (!isset($data['permissions']) || !is_array($data['permissions'])) {
                    $this->error('Permissions array is required', 400);
                    return;
                }

                // Decode URL-encoded role name (handles spaces like "Radiology Receptionist")
                $role = urldecode($role);
                
                $result = $this->User_model->update_role_permissions($role, $data['permissions']);
                
                if ($result) {
                    $permissions = $this->User_model->get_role_permissions($role);
                    $this->success($permissions, 'Role permissions updated successfully');
                } else {
                    $this->error('Failed to update role permissions', 500);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Users role_permissions error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create user
     * POST /api/users
     */
    private function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            $required = array('name', 'email', 'phone');
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

            // Check if email already exists
            $existing_user = $this->db->get_where('users', array('email' => $data['email']))->row_array();
            if ($existing_user) {
                $this->error('Email already exists', 422, array('email' => 'This email is already registered.'));
                return;
            }

            $user_id = $this->User_model->create_user($data);

            if ($user_id) {
                $user = $this->User_model->get_user_with_details($user_id);
                $this->success($user, 'User created successfully', 201);
            } else {
                $this->error('Failed to create user', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Users create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update user
     * PUT /api/users/:id
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $user = $this->User_model->get_user_by_id($id);
            
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }

            // Validate email if provided
            if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $this->error('Invalid email format', 422, array('email' => 'Invalid email format.'));
                return;
            }

            // Check if email already exists (for another user)
            if (!empty($data['email']) && $data['email'] !== $user['email']) {
                $existing = $this->db->get_where('users', array('email' => $data['email']))->row_array();
                if ($existing && $existing['id'] != $id) {
                    $this->error('Email already exists', 422, array('email' => 'This email is already registered.'));
                    return;
                }
            }

            // Remove fields that shouldn't be updated
            unset($data['id']);
            unset($data['created_at']);

            $result = $this->User_model->update_user($id, $data);

            if ($result) {
                $user = $this->User_model->get_user_with_details($id);
                $this->success($user, 'User updated successfully');
            } else {
                $this->error('Failed to update user', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Users update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/users/:id
     */
    private function delete($id) {
        try {
            $user = $this->User_model->get_user_by_id($id);
            
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }

            $result = $this->User_model->delete_user($id);

            if ($result) {
                $this->success(null, 'User deleted successfully');
            } else {
                $this->error('Failed to delete user', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Users delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

