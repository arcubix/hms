<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class System_settings extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('System_settings_model');
    }
    
    /**
     * Check authentication and authorization
     */
    private function checkAuth() {
        // Verify token for all requests
        if (!$this->verify_token()) {
            return false;
        }
        
        // Check if user has admin permission
        if (isset($this->user) && $this->user) {
            $user_role = is_object($this->user) ? $this->user->role : (is_array($this->user) ? $this->user['role'] : null);
            if ($user_role && $user_role !== 'admin') {
                $this->error('Access denied. Admin role required.', 403);
                return false;
            }
        }
        
        return true;
    }

    /**
     * GET /api/system-settings - Get all settings
     * PUT /api/system-settings - Update settings (bulk)
     */
    public function index() {
        if (!$this->checkAuth()) {
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Get all settings grouped by category
            $settings = $this->System_settings_model->get_settings();
            $this->success($settings);
        } elseif ($method === 'PUT') {
            // Handle bulk update
            $this->update_bulk();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * GET /api/system-settings/category/:category - Get settings by category
     */
    public function category($category = null) {
        // Allow category endpoint without admin check for reading
        if (!$this->verify_token()) {
            return;
        }
        
        if (!$category) {
            $this->error('Category is required', 400);
            return;
        }
        
        $settings = $this->System_settings_model->get_settings_by_category($category);
        $this->success($settings);
    }

    /**
     * GET /api/system-settings/:key - Get specific setting
     * PUT /api/system-settings/:key - Update specific setting
     */
    public function get($key = null) {
        if (!$key) {
            $this->error('Setting key is required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Allow reading without admin check
            if (!$this->verify_token()) {
                return;
            }
            
            $setting = $this->System_settings_model->get_setting($key);
            
            if ($setting) {
                $this->success($setting);
            } else {
                $this->error('Setting not found', 404);
            }
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            if (!$this->checkAuth()) {
                return;
            }
            $this->update_setting($key);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * GET /api/system-settings/room-mode - Get room management mode
     * PUT /api/system-settings/room-mode - Update room management mode
     */
    public function room_mode() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Allow reading without admin check
            if (!$this->verify_token()) {
                return;
            }
            
            $mode = $this->System_settings_model->get_room_mode();
            $this->success(array('mode' => $mode));
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            if (!$this->checkAuth()) {
                return;
            }
            $data = json_decode($this->input->raw_input_stream, true);
            
            if (empty($data)) {
                $data = $this->input->post();
            }
            
            if (empty($data['mode'])) {
                $this->error('Mode is required', 400);
                return;
            }
            
            $mode = $data['mode'];
            if (!in_array($mode, array('Fixed', 'Dynamic'))) {
                $this->error('Invalid mode. Must be "Fixed" or "Dynamic"', 400);
                return;
            }
            
            $user_id = isset($this->user) ? (is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null)) : null;
            
            // Validate mode switch (non-blocking, returns warnings)
            $validation = $this->validate_mode_switch($mode);
            
            if ($this->System_settings_model->set_room_mode($mode, $user_id)) {
                $response = array('mode' => $mode);
                if (!empty($validation['warnings'])) {
                    $response['warnings'] = $validation['warnings'];
                    $response['warning_message'] = $validation['message'];
                }
                $this->success($response, !empty($validation['warnings']) ? $validation['message'] : 'Room mode updated successfully');
            } else {
                $this->error('Failed to update room mode', 500);
            }
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update specific setting
     */
    private function update_setting($key) {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (!isset($data['value'])) {
            $this->error('Value is required', 400);
            return;
        }
        
        $user_id = isset($this->user) ? (is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null)) : null;
        
        if ($this->System_settings_model->update_setting($key, $data['value'], $user_id)) {
            $setting = $this->System_settings_model->get_setting($key);
            $this->success($setting, 'Setting updated successfully');
        } else {
            $this->error('Failed to update setting', 500);
        }
    }

    /**
     * Bulk update settings
     */
    private function update_bulk() {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (empty($data['settings']) || !is_array($data['settings'])) {
            $this->error('Settings array is required', 400);
            return;
        }
        
        $user_id = isset($this->user) ? (is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null)) : null;
        
        // Special handling for room_mode
        if (isset($data['settings']['room_management_mode'])) {
            $mode = $data['settings']['room_management_mode'];
            if (is_string($mode) && (substr($mode, 0, 1) === '"' && substr($mode, -1) === '"')) {
                $mode = substr($mode, 1, -1);
            }
            
            // Validate mode switch (non-blocking, returns warnings)
            $validation = $this->validate_mode_switch($mode);
            // Note: We allow the switch even with warnings
        }
        
        $updated = $this->System_settings_model->update_settings($data['settings'], $user_id);
        
        if ($updated > 0) {
            $settings = $this->System_settings_model->get_settings();
            $this->success($settings, 'Settings updated successfully');
        } else {
            $this->error('Failed to update settings', 500);
        }
    }

    /**
     * Validate mode switch
     * Returns warnings but allows the switch (non-blocking validation)
     */
    private function validate_mode_switch($new_mode) {
        $current_mode = $this->System_settings_model->get_room_mode();
        
        if ($current_mode === $new_mode) {
            return array('valid' => true, 'message' => '', 'warnings' => array());
        }
        
        $warnings = array();
        
        if ($new_mode === 'Dynamic') {
            // Check if doctors have slot-room assignments for upcoming dates (warning only, not blocking)
            $this->load->model('Doctor_slot_room_model');
            $this->load->model('Doctor_model');
            
            try {
                $doctors = $this->Doctor_model->get_all();
                $upcoming_date = date('Y-m-d', strtotime('+1 day'));
                
                foreach ($doctors as $doctor) {
                    $assignments = $this->Doctor_slot_room_model->get_by_doctor_date($doctor['id'], $upcoming_date);
                    if (empty($assignments)) {
                        $warnings[] = $doctor['name'] . ' has no room assignments for ' . $upcoming_date;
                    }
                }
            } catch (Exception $e) {
                // If models don't exist yet, that's okay - allow the switch
                log_message('info', 'Could not validate Dynamic mode assignments: ' . $e->getMessage());
            }
        } elseif ($new_mode === 'Fixed') {
            // Check if doctors have fixed room assignments (warning only, not blocking)
            $this->load->model('Doctor_room_model');
            $this->load->model('Doctor_model');
            
            try {
                $doctors = $this->Doctor_model->get_all();
                
                foreach ($doctors as $doctor) {
                    $assignment = $this->Doctor_room_model->get_by_doctor($doctor['id']);
                    if (!$assignment || !$assignment['is_active']) {
                        $warnings[] = $doctor['name'] . ' has no fixed room assignment';
                    }
                }
            } catch (Exception $e) {
                // If models don't exist yet, that's okay - allow the switch
                log_message('info', 'Could not validate Fixed mode assignments: ' . $e->getMessage());
            }
        }
        
        // Always allow the switch, but return warnings if any
        return array(
            'valid' => true, 
            'message' => !empty($warnings) ? 'Mode switched successfully. Note: ' . implode(', ', array_slice($warnings, 0, 3)) : '',
            'warnings' => $warnings
        );
    }
}

