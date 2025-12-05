<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Permission Library
 * Provides methods for checking user permissions
 */
class Permission {
    
    protected $CI;
    protected $permissions = array();
    protected $permissions_loaded = false;
    
    public function __construct() {
        $this->CI =& get_instance();
    }
    
    /**
     * Load user permissions from database
     * @param int $user_id User ID
     * @return array Array of permission keys
     */
    public function load_permissions($user_id) {
        if ($this->permissions_loaded) {
            return $this->permissions;
        }
        
        $this->CI->load->model('User_model');
        $permissions = $this->CI->User_model->get_user_permissions($user_id);
        
        // Convert to associative array for faster lookups
        $this->permissions = array();
        foreach ($permissions as $perm) {
            $this->permissions[$perm] = true;
        }
        
        $this->permissions_loaded = true;
        return $this->permissions;
    }
    
    /**
     * Set permissions directly (for testing or caching)
     * @param array $permissions Array of permission keys
     */
    public function set_permissions($permissions) {
        $this->permissions = array();
        foreach ($permissions as $perm) {
            if (is_string($perm)) {
                $this->permissions[$perm] = true;
            }
        }
        $this->permissions_loaded = true;
    }
    
    /**
     * Check if user has a specific permission
     * @param string $permission_key Permission key to check
     * @return bool True if user has permission, false otherwise
     */
    public function hasPermission($permission_key) {
        if (!$this->permissions_loaded) {
            return false;
        }
        
        return isset($this->permissions[$permission_key]) && $this->permissions[$permission_key] === true;
    }
    
    /**
     * Check if user has any of the specified permissions
     * @param array $permission_keys Array of permission keys
     * @return bool True if user has at least one permission, false otherwise
     */
    public function hasAnyPermission($permission_keys) {
        if (!$this->permissions_loaded || empty($permission_keys)) {
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
     * Check if user has all of the specified permissions
     * @param array $permission_keys Array of permission keys
     * @return bool True if user has all permissions, false otherwise
     */
    public function hasAllPermissions($permission_keys) {
        if (!$this->permissions_loaded || empty($permission_keys)) {
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
     * Require a specific permission (throws error if missing)
     * @param string $permission_key Permission key required
     * @param string $error_message Custom error message
     * @return bool True if permission exists, otherwise sends error response and returns false
     */
    public function requirePermission($permission_key, $error_message = null) {
        if ($this->hasPermission($permission_key)) {
            return true;
        }
        
        $message = $error_message ?: "Access denied. Required permission: {$permission_key}";
        
        // Try to get controller instance to send error response
        if (isset($this->CI) && method_exists($this->CI, 'error')) {
            $this->CI->error($message, 403);
        } else {
            // Fallback: throw exception if controller not available
            show_error($message, 403);
        }
        
        return false;
    }
    
    /**
     * Require any of the specified permissions
     * @param array $permission_keys Array of permission keys
     * @param string $error_message Custom error message
     * @return bool True if user has at least one permission, otherwise sends error response
     */
    public function requireAnyPermission($permission_keys, $error_message = null) {
        if ($this->hasAnyPermission($permission_keys)) {
            return true;
        }
        
        $perms_list = implode(', ', $permission_keys);
        $message = $error_message ?: "Access denied. Required permission (any): {$perms_list}";
        
        if (isset($this->CI) && method_exists($this->CI, 'error')) {
            $this->CI->error($message, 403);
        } else {
            show_error($message, 403);
        }
        
        return false;
    }
    
    /**
     * Require all of the specified permissions
     * @param array $permission_keys Array of permission keys
     * @param string $error_message Custom error message
     * @return bool True if user has all permissions, otherwise sends error response
     */
    public function requireAllPermissions($permission_keys, $error_message = null) {
        if ($this->hasAllPermissions($permission_keys)) {
            return true;
        }
        
        $perms_list = implode(', ', $permission_keys);
        $message = $error_message ?: "Access denied. Required permissions (all): {$perms_list}";
        
        if (isset($this->CI) && method_exists($this->CI, 'error')) {
            $this->CI->error($message, 403);
        } else {
            show_error($message, 403);
        }
        
        return false;
    }
    
    /**
     * Get all user permissions
     * @return array Array of permission keys
     */
    public function getPermissions() {
        return array_keys($this->permissions);
    }
    
    /**
     * Reset permissions (useful for testing)
     */
    public function reset() {
        $this->permissions = array();
        $this->permissions_loaded = false;
    }
}

