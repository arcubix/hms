<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Audit Log Library
 * Centralized logging system for tracking user activities
 */
class Audit_log {

    private $CI;
    private $user = null;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->database();
        
        // Note: We don't set user here because it might not be available yet
        // User will be retrieved dynamically in get_user_info() when logging
    }

    /**
     * Set user context manually
     * @param mixed $user User object or array
     */
    public function set_user($user) {
        $this->user = $user;
    }

    /**
     * Get user information
     * @return array|null
     */
    private function get_user_info() {
        // Always try to get the current user from the controller
        // This ensures we get the user even if it was set after library initialization
        $current_user = null;
        
        // Method 1: Try to get user via getter method (if controller has it)
        if (method_exists($this->CI, 'get_current_user')) {
            $current_user = $this->CI->get_current_user();
        }
        
        // Method 2: Try to get user from controller property directly
        if (!$current_user && isset($this->CI->user)) {
            $current_user = $this->CI->user;
        }
        
        // Method 3: Fall back to stored user if controller doesn't have it
        if (!$current_user && $this->user) {
            $current_user = $this->user;
        }
        
        if (!$current_user) {
            return null;
        }

        $user_id = null;
        $user_name = 'System';
        $user_role = 'System';

        if (is_object($current_user)) {
            $user_id = isset($current_user->id) ? $current_user->id : null;
            $user_name = isset($current_user->name) ? $current_user->name : 'Unknown';
            $user_role = isset($current_user->role) ? $current_user->role : 'Unknown';
        } elseif (is_array($current_user)) {
            $user_id = isset($current_user['id']) ? $current_user['id'] : null;
            $user_name = isset($current_user['name']) ? $current_user['name'] : 'Unknown';
            $user_role = isset($current_user['role']) ? $current_user['role'] : 'Unknown';
        }

        return [
            'user_id' => $user_id,
            'user_name' => $user_name,
            'user_role' => $user_role
        ];
    }

    /**
     * Get request information
     * @return array
     */
    private function get_request_info() {
        return [
            'ip_address' => $this->CI->input->ip_address(),
            'user_agent' => $this->CI->input->user_agent(),
            'request_method' => $this->CI->input->server('REQUEST_METHOD'),
            'request_url' => $this->CI->input->server('REQUEST_URI')
        ];
    }

    /**
     * Main logging method
     * @param string $action_type create, update, delete, login, logout, view, export, settings, error
     * @param string $action Human-readable action description
     * @param string $module Module/system area
     * @param string $details Detailed description
     * @param array $options Additional options (entity_type, entity_id, status, error_message, metadata)
     * @return int|false Log ID on success, false on failure
     */
    public function log($action_type, $action, $module, $details = '', $options = []) {
        try {
            $user_info = $this->get_user_info();
            $request_info = $this->get_request_info();
            
            // Double-check: if user_id is still null, try to get it via getter method
            if (empty($user_info['user_id'])) {
                $controller_user = null;
                
                // Try getter method first
                if (method_exists($this->CI, 'get_current_user')) {
                    $controller_user = $this->CI->get_current_user();
                }
                // Fallback to direct property access
                elseif (isset($this->CI->user)) {
                    $controller_user = $this->CI->user;
                }
                
                if ($controller_user) {
                    if (is_object($controller_user) && isset($controller_user->id)) {
                        $user_info['user_id'] = $controller_user->id;
                        $user_info['user_name'] = $controller_user->name ?? ($user_info['user_name'] ?? 'Unknown');
                        $user_info['user_role'] = $controller_user->role ?? ($user_info['user_role'] ?? 'Unknown');
                    } elseif (is_array($controller_user) && isset($controller_user['id'])) {
                        $user_info['user_id'] = $controller_user['id'];
                        $user_info['user_name'] = $controller_user['name'] ?? ($user_info['user_name'] ?? 'Unknown');
                        $user_info['user_role'] = $controller_user['role'] ?? ($user_info['user_role'] ?? 'Unknown');
                    }
                }
            }

            $log_data = [
                'user_id' => $user_info['user_id'] ?? null,
                'user_name' => $user_info['user_name'] ?? 'System',
                'user_role' => $user_info['user_role'] ?? 'System',
                'action_type' => $action_type,
                'action' => $action,
                'module' => $module,
                'entity_type' => $options['entity_type'] ?? null,
                'entity_id' => $options['entity_id'] ?? null,
                'details' => $details,
                'ip_address' => $request_info['ip_address'],
                'user_agent' => $request_info['user_agent'],
                'request_method' => $request_info['request_method'],
                'request_url' => $request_info['request_url'],
                'status' => $options['status'] ?? 'success',
                'error_message' => $options['error_message'] ?? null,
                'metadata' => !empty($options['metadata']) ? json_encode($options['metadata']) : null
            ];

            if ($this->CI->db->insert('audit_logs', $log_data)) {
                return $this->CI->db->insert_id();
            }

            return false;
        } catch (Exception $e) {
            // Don't fail the main operation if logging fails
            log_message('error', 'Audit log error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Log creation actions
     * @param string $module
     * @param string $entity_type
     * @param int $entity_id
     * @param string $details
     * @param array $options
     * @return int|false
     */
    public function logCreate($module, $entity_type, $entity_id, $details = '', $options = []) {
        return $this->log('create', "Created {$entity_type}", $module, $details, array_merge($options, [
            'entity_type' => $entity_type,
            'entity_id' => $entity_id
        ]));
    }

    /**
     * Log update actions with before/after comparison
     * @param string $module
     * @param string $entity_type
     * @param int $entity_id
     * @param string $details
     * @param array|null $before_data
     * @param array|null $after_data
     * @param array $options
     * @return int|false
     */
    public function logUpdate($module, $entity_type, $entity_id, $details = '', $before_data = null, $after_data = null, $options = []) {
        $metadata = [];
        
        if ($before_data && $after_data) {
            // Compare and store only changed fields
            $changed_fields = [];
            foreach ($after_data as $key => $value) {
                if (!isset($before_data[$key]) || $before_data[$key] != $value) {
                    // Don't log sensitive fields
                    if (!in_array(strtolower($key), ['password', 'token', 'secret', 'key'])) {
                        $changed_fields[$key] = [
                            'before' => $before_data[$key] ?? null,
                            'after' => $value
                        ];
                    }
                }
            }
            $metadata['changed_fields'] = $changed_fields;
        }

        return $this->log('update', "Updated {$entity_type}", $module, $details, array_merge($options, [
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'metadata' => array_merge($metadata, $options['metadata'] ?? [])
        ]));
    }

    /**
     * Log deletion actions
     * @param string $module
     * @param string $entity_type
     * @param int $entity_id
     * @param string $details
     * @param array $options
     * @return int|false
     */
    public function logDelete($module, $entity_type, $entity_id, $details = '', $options = []) {
        return $this->log('delete', "Deleted {$entity_type}", $module, $details, array_merge($options, [
            'entity_type' => $entity_type,
            'entity_id' => $entity_id
        ]));
    }

    /**
     * Log login attempts
     * @param int|null $user_id
     * @param bool $success
     * @param string|null $error_message
     * @return int|false
     */
    public function logLogin($user_id = null, $success = true, $error_message = null) {
        $action = $success ? 'Login successful' : 'Login failed';
        $status = $success ? 'success' : 'failed';
        
        // Get user name if user_id provided
        $user_name = 'Unknown';
        if ($user_id) {
            $user = $this->CI->db->get_where('users', ['id' => $user_id])->row_array();
            if ($user) {
                $user_name = $user['name'] ?? 'Unknown';
            }
        }

        return $this->log('login', $action, 'Authentication', $action, [
            'entity_type' => 'User',
            'entity_id' => $user_id,
            'status' => $status,
            'error_message' => $error_message,
            'metadata' => ['user_id' => $user_id]
        ]);
    }

    /**
     * Log logout actions
     * @param int $user_id
     * @return int|false
     */
    public function logLogout($user_id) {
        $user = $this->CI->db->get_where('users', ['id' => $user_id])->row_array();
        $user_name = $user['name'] ?? 'Unknown';

        return $this->log('logout', 'User logged out', 'Authentication', "User {$user_name} logged out", [
            'entity_type' => 'User',
            'entity_id' => $user_id
        ]);
    }

    /**
     * Log view actions (optional - can be verbose)
     * @param string $module
     * @param string $entity_type
     * @param int $entity_id
     * @param string $details
     * @param array $options
     * @return int|false
     */
    public function logView($module, $entity_type, $entity_id, $details = '', $options = []) {
        return $this->log('view', "Viewed {$entity_type}", $module, $details, array_merge($options, [
            'entity_type' => $entity_type,
            'entity_id' => $entity_id
        ]));
    }

    /**
     * Log export actions
     * @param string $module
     * @param string $entity_type
     * @param string $details
     * @param array $options
     * @return int|false
     */
    public function logExport($module, $entity_type, $details = '', $options = []) {
        return $this->log('export', "Exported {$entity_type}", $module, $details, array_merge($options, [
            'entity_type' => $entity_type
        ]));
    }

    /**
     * Log errors
     * @param string $module
     * @param string $action
     * @param string $error_message
     * @param array $options
     * @return int|false
     */
    public function logError($module, $action, $error_message, $options = []) {
        return $this->log('error', $action, $module, $error_message, array_merge($options, [
            'status' => 'failed',
            'error_message' => $error_message
        ]));
    }

    /**
     * Log settings changes
     * @param string $module
     * @param string $setting_key
     * @param mixed $old_value
     * @param mixed $new_value
     * @param string $details
     * @return int|false
     */
    public function logSettings($module, $setting_key, $old_value = null, $new_value = null, $details = '') {
        $metadata = [
            'setting_key' => $setting_key,
            'old_value' => $old_value,
            'new_value' => $new_value
        ];

        return $this->log('settings', "Changed setting: {$setting_key}", $module, $details, [
            'entity_type' => 'Setting',
            'metadata' => $metadata
        ]);
    }
}

