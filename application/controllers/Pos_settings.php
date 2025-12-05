<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Pos_settings extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Pos_settings_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
        
        // Permission checks will be done in individual methods
    }

    /**
     * GET /api/pharmacy/pos-settings - Get all settings
     * PUT /api/pharmacy/pos-settings - Update settings (bulk)
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing POS settings
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $category = $this->uri->segment(4);
            
            if ($category && $category !== 'category') {
                // Get specific category
                $settings = $this->Pos_settings_model->get_settings_by_category($category);
                $this->success($settings);
            } else {
                // Get all settings grouped by category
                $settings = $this->Pos_settings_model->get_settings();
                $this->success($settings);
            }
        } elseif ($method === 'PUT') {
            // Check permission for updating POS settings
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            // Handle bulk update
            $this->update();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * GET /api/pharmacy/pos-settings/category/:category - Get settings by category
     */
    public function category($category = null) {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        if (!$category) {
            $this->error('Category is required', 400);
            return;
        }
        
        $settings = $this->Pos_settings_model->get_settings_by_category($category);
        $this->success($settings);
    }

    /**
     * PUT /api/pharmacy/pos-settings - Update settings (bulk)
     */
    public function update() {
        try {
            // Get request data
            $data = $this->get_request_data();
            
            // Debug: Log what we received
            log_message('debug', 'PUT request data received: ' . print_r($data, true));
            log_message('debug', 'Request method: ' . $this->input->server('REQUEST_METHOD'));
            log_message('debug', 'Content type: ' . $this->input->server('CONTENT_TYPE'));
            
            if (empty($data) || !is_array($data)) {
                // Try alternative method to get data
                $raw_input = file_get_contents('php://input');
                log_message('debug', 'Raw input: ' . $raw_input);
                $data = json_decode($raw_input, true);
                
                if (empty($data) || !is_array($data)) {
                    $this->error('Settings data is required and must be a valid JSON array', 400);
                    return;
                }
            }
            
            // Get user from protected property (set by verify_token)
            $user_id = null;
            if (isset($this->user) && $this->user) {
                // User can be object or array depending on User_model return type
                if (is_object($this->user) && isset($this->user->id)) {
                    $user_id = $this->user->id;
                } elseif (is_array($this->user) && isset($this->user['id'])) {
                    $user_id = $this->user['id'];
                }
            }
            
            // Log for debugging
            log_message('debug', 'Updating POS settings. Count: ' . count($data) . ', User ID: ' . ($user_id ?: 'null'));
            log_message('debug', 'Calling update_settings method...');
            
            try {
                $updated = $this->Pos_settings_model->update_settings($data, $user_id);
                log_message('debug', 'update_settings returned: ' . $updated);
                
                if ($updated > 0) {
                    // Log POS settings bulk update
                    $this->load->library('audit_log');
                    $this->audit_log->log('Pharmacy', 'POS Settings', null, "Bulk updated {$updated} POS settings");
                    
                    log_message('debug', 'Sending success response');
                    $this->success(array(
                        'message' => 'Settings updated successfully',
                        'updated_count' => $updated
                    ));
                } else {
                    log_message('debug', 'No settings updated, sending error response');
                    $this->error('No settings were updated. Please check if setting keys exist in database.', 400);
                }
            } catch (Exception $e) {
                log_message('error', 'Exception in update_settings call: ' . $e->getMessage());
                throw $e; // Re-throw to be caught by outer catch
            }
            
        } catch (Exception $e) {
            $error_msg = 'Failed to update settings: ' . $e->getMessage();
            log_message('error', 'POS Settings update error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            
            // Include file and line for debugging
            $error_msg .= ' (File: ' . $e->getFile() . ', Line: ' . $e->getLine() . ')';
            
            $this->error($error_msg, 500);
        } catch (Error $e) {
            $error_msg = 'Fatal error updating settings: ' . $e->getMessage();
            log_message('error', 'POS Settings fatal error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            
            // Include file and line for debugging
            $error_msg .= ' (File: ' . $e->getFile() . ', Line: ' . $e->getLine() . ')';
            
            $this->error($error_msg, 500);
        }
    }

    /**
     * PUT /api/pharmacy/pos-settings/:key - Update single setting
     */
    public function update_setting($key = null) {
        if ($this->input->server('REQUEST_METHOD') !== 'PUT') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        if (!$key) {
            $this->error('Setting key is required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            if (!isset($data['value'])) {
                $this->error('Setting value is required', 400);
                return;
            }
            
            // Get user ID from protected property
            $user_id = null;
            if (isset($this->user) && $this->user) {
                if (is_object($this->user) && isset($this->user->id)) {
                    $user_id = $this->user->id;
                } elseif (is_array($this->user) && isset($this->user['id'])) {
                    $user_id = $this->user['id'];
                }
            }
            
            $updated = $this->Pos_settings_model->update_setting($key, $data['value'], $user_id);
            
            if ($updated) {
                $setting = $this->Pos_settings_model->get_setting($key);
                $this->success(array(
                    'message' => 'Setting updated successfully',
                    'setting' => $setting
                ));
            } else {
                $this->error('Setting not found or could not be updated', 404);
            }
            
        } catch (Exception $e) {
            $this->error('Failed to update setting: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/pharmacy/pos-settings/reset - Reset to defaults
     */
    public function reset() {
        if ($this->input->server('REQUEST_METHOD') !== 'POST') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        try {
            // Get user ID from protected property
            $user_id = null;
            if (isset($this->user) && $this->user) {
                if (is_object($this->user) && isset($this->user->id)) {
                    $user_id = $this->user->id;
                } elseif (is_array($this->user) && isset($this->user['id'])) {
                    $user_id = $this->user['id'];
                }
            }
            
            $updated = $this->Pos_settings_model->reset_to_defaults($user_id);
            
            $this->success(array(
                'message' => 'Settings reset to defaults successfully',
                'updated_count' => $updated
            ));
            
        } catch (Exception $e) {
            $this->error('Failed to reset settings: ' . $e->getMessage(), 500);
        }
    }
}

