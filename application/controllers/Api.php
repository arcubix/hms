<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Base API Controller
 * Handles common API functionality and CORS
 */
class Api extends CI_Controller {

    protected $user = null;
    protected $user_permissions = array();

    public function __construct() {
        // CORS is now handled by CodeIgniter hooks (application/hooks/Cors_hook.php)
        // The hook runs at pre_controller and post_controller_constructor
        // So OPTIONS requests are handled before we reach here
        
        parent::__construct();
        
        // Load database (with error handling)
        try {
            $this->load->database();
        } catch (Exception $e) {
            $this->error('Database connection failed: ' . $e->getMessage(), 500);
            return;
        }
        
        // Set JSON response header
        $this->output->set_content_type('application/json');
    }

    /**
     * Handle CORS headers
     * Note: CORS is now handled by CodeIgniter hooks (application/hooks/Cors_hook.php)
     * This method is kept for backward compatibility but is no longer needed
     */
    protected function handle_cors() {
        // CORS is handled by hooks - no action needed here
    }

    /**
     * Send JSON response
     */
    protected function json_response($data, $status_code = 200) {
        // CORS headers are already set in index.php before CodeIgniter loads
        // Don't set them again to avoid duplicates
        
        // Set status and content type
        $this->output->set_status_header($status_code);
        $this->output->set_content_type('application/json');
        
        // Encode and set output
        $json = json_encode($data, JSON_UNESCAPED_UNICODE);
        $this->output->set_output($json);
        
        // Force output immediately (CodeIgniter normally outputs at end of request)
        $this->output->_display();
        exit;
    }

    /**
     * Send success response
     */
    protected function success($data = null, $message = 'Success', $status_code = 200) {
        $response = array(
            'success' => true,
            'message' => $message
        );
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        $this->json_response($response, $status_code);
    }

    /**
     * Send error response
     */
    protected function error($message = 'Error', $status_code = 400, $errors = null) {
        $response = array(
            'success' => false,
            'message' => $message
        );
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        $this->json_response($response, $status_code);
    }

    /**
     * Get request data (JSON or form data)
     */
    protected function get_request_data() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $data = $this->input->post();
        }
        
        return $data ?: array();
    }

    /**
     * Verify JWT token and get user
     */
    protected function verify_token() {
        // CORS headers are already set in index.php and parent constructor
        // So error responses will also have CORS headers
        
        $token = null;

        // Try multiple methods to get Authorization header (Apache compatibility)
        // Method 1: Direct HTTP_AUTHORIZATION
        $auth_header = $this->input->server('HTTP_AUTHORIZATION');
        
        // Method 2: REDIRECT_HTTP_AUTHORIZATION (Apache sometimes uses this)
        if (!$auth_header) {
            $auth_header = $this->input->server('REDIRECT_HTTP_AUTHORIZATION');
        }
        
        // Method 3: From $_SERVER directly
        if (!$auth_header && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
        }
        
        // Method 4: From $_SERVER REDIRECT
        if (!$auth_header && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        
        // Extract token from header
        if ($auth_header && preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            $token = $matches[1];
        }

        // Fallback: try request headers
        if (!$token) {
            $headers = $this->input->request_headers();
            if (isset($headers['Authorization'])) {
                $auth_header = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                    $token = $matches[1];
                }
            }
        }
        
        // Final fallback: check $_SERVER for Authorization
        if (!$token && isset($_SERVER['Authorization'])) {
            $auth_header = $_SERVER['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            // Log for debugging (remove in production)
            log_message('debug', 'No token found. Headers: ' . print_r($this->input->request_headers(), true));
            log_message('debug', 'SERVER vars: ' . print_r(array(
                'HTTP_AUTHORIZATION' => isset($_SERVER['HTTP_AUTHORIZATION']) ? 'SET' : 'NOT SET',
                'REDIRECT_HTTP_AUTHORIZATION' => isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? 'SET' : 'NOT SET',
            ), true));
            $this->error('Token not provided', 401);
            return false;
        }

        // Simple token verification (you can use JWT library later)
        $this->load->model('User_model');
        $user = $this->User_model->get_user_by_token($token);
        
        if (!$user) {
            $this->error('Invalid token', 401);
            return false;
        }

        $this->user = $user;
        
        // Load user permissions after authentication
        $this->load_user_permissions();
        
        return true;
    }

    /**
     * Load user permissions from database
     * Caches permissions for the duration of the request
     */
    protected function load_user_permissions() {
        if (!$this->user) {
            $this->user_permissions = array();
            return;
        }
        
        $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
        
        if ($user_id) {
            $this->load->model('User_model');
            $permissions = $this->User_model->get_user_permissions($user_id);
            
            // Convert to associative array for faster lookups
            $this->user_permissions = array();
            foreach ($permissions as $perm) {
                $this->user_permissions[$perm] = true;
            }
        }
    }

    /**
     * Check if current user has admin role
     * @return bool True if user has admin role, false otherwise
     */
    protected function isAdmin() {
        if (!$this->user) {
            return false;
        }
        
        $user_role = is_object($this->user) ? $this->user->role : (is_array($this->user) ? $this->user['role'] : null);
        
        // Check for admin role (case-insensitive)
        return $user_role === 'admin' || $user_role === 'Admin' || strtolower($user_role) === 'admin';
    }

    /**
     * Check if current user has a specific permission
     * @param string $permission_key Permission key to check
     * @return bool True if user has permission, false otherwise
     */
    protected function hasPermission($permission_key) {
        return isset($this->user_permissions[$permission_key]) && $this->user_permissions[$permission_key] === true;
    }

    /**
     * Check if current user has any of the specified permissions
     * @param array $permission_keys Array of permission keys
     * @return bool True if user has at least one permission, false otherwise
     */
    protected function hasAnyPermission($permission_keys) {
        if (empty($permission_keys)) {
            return false;
        }
        
        foreach ($permission_keys as $perm) {
            if ($this->hasPermission($perm)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if current user has all of the specified permissions
     * @param array $permission_keys Array of permission keys
     * @return bool True if user has all permissions, false otherwise
     */
    protected function hasAllPermissions($permission_keys) {
        if (empty($permission_keys)) {
            return false;
        }
        
        foreach ($permission_keys as $perm) {
            if (!$this->hasPermission($perm)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Require a specific permission (sends error response if missing)
     * Admin role is allowed by default
     * @param string $permission_key Permission key required
     * @param string $error_message Custom error message
     * @return bool True if permission exists or user is admin, otherwise sends error response and returns false
     */
    protected function requirePermission($permission_key, $error_message = null) {
        // Allow admin role by default
        if ($this->isAdmin()) {
            return true;
        }
        
        if ($this->hasPermission($permission_key)) {
            return true;
        }
        
        $message = $error_message ?: "Access denied. Required permission: {$permission_key}";
        $this->error($message, 403);
        return false;
    }

    /**
     * Require any of the specified permissions
     * Admin role is allowed by default
     * @param array $permission_keys Array of permission keys
     * @param string $error_message Custom error message
     * @return bool True if user has at least one permission or is admin, otherwise sends error response
     */
    protected function requireAnyPermission($permission_keys, $error_message = null) {
        // Allow admin role by default
        if ($this->isAdmin()) {
            return true;
        }
        
        if ($this->hasAnyPermission($permission_keys)) {
            return true;
        }
        
        $perms_list = implode(', ', $permission_keys);
        $message = $error_message ?: "Access denied. Required permission (any): {$perms_list}";
        $this->error($message, 403);
        return false;
    }

    /**
     * Require all of the specified permissions
     * Admin role is allowed by default
     * @param array $permission_keys Array of permission keys
     * @param string $error_message Custom error message
     * @return bool True if user has all permissions or is admin, otherwise sends error response
     */
    protected function requireAllPermissions($permission_keys, $error_message = null) {
        // Allow admin role by default
        if ($this->isAdmin()) {
            return true;
        }
        
        if ($this->hasAllPermissions($permission_keys)) {
            return true;
        }
        
        $perms_list = implode(', ', $permission_keys);
        $message = $error_message ?: "Access denied. Required permissions (all): {$perms_list}";
        $this->error($message, 403);
        return false;
    }

    /**
     * Get current user's permissions array
     * @return array Array of permission keys
     */
    protected function getPermissions() {
        return array_keys($this->user_permissions);
    }

    /**
     * Get current user (for libraries to access)
     * @return mixed|null
     */
    public function get_current_user() {
        return $this->user;
    }
}

