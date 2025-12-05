<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

/**
 * Message Platforms API Controller
 * Handles platform settings (SMS, Email, WhatsApp)
 */
class Message_platforms extends Api {

    public function __construct() {
        parent::__construct();
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/message-platforms - Get all platform settings
     */
    public function index() {
        try {
            // Check permission for viewing message platform settings
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $this->db->select('*');
            $this->db->from('message_platform_settings');
            $this->db->order_by('platform', 'ASC');
            $query = $this->db->get();
            
            $platforms = $query->result_array();
            
            // Format response - hide sensitive data
            foreach ($platforms as &$platform) {
                if (!empty($platform['api_secret'])) {
                    $platform['api_secret'] = '***hidden***';
                }
                if (!empty($platform['api_key']) && strlen($platform['api_key']) > 10) {
                    $platform['api_key'] = substr($platform['api_key'], 0, 4) . '***' . substr($platform['api_key'], -4);
                }
                if (!empty($platform['settings'])) {
                    $platform['settings'] = json_decode($platform['settings'], true);
                }
            }
            
            $this->success($platforms);
            
        } catch (Exception $e) {
            log_message('error', 'Message_platforms index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/message-platforms/:type - Get specific platform
     * PUT /api/message-platforms/:type - Update platform settings
     */
    public function get($type = null) {
        try {
            if (!$type || !in_array($type, ['sms', 'email', 'whatsapp'])) {
                $this->error('Valid platform type (sms, email, whatsapp) is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing message platform settings
                if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                    return;
                }
                
                $platform = $this->get_platform_by_type($type);
                if ($platform) {
                    // Hide sensitive data
                    if (!empty($platform['api_secret'])) {
                        $platform['api_secret'] = '***hidden***';
                    }
                    if (!empty($platform['api_key']) && strlen($platform['api_key']) > 10) {
                        $platform['api_key'] = substr($platform['api_key'], 0, 4) . '***' . substr($platform['api_key'], -4);
                    }
                    if (!empty($platform['settings'])) {
                        $platform['settings'] = json_decode($platform['settings'], true);
                    }
                    $this->success($platform);
                } else {
                    $this->error('Platform not found', 404);
                }
            } elseif ($method === 'PUT') {
                // Check permission for updating message platform settings
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($type);
            } else {
                $this->error('Method not allowed', 405);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_platforms get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update platform settings
     */
    private function update($type) {
        try {
            $platform = $this->get_platform_by_type($type);
            if (!$platform) {
                // Create if doesn't exist
                $this->db->insert('message_platform_settings', array(
                    'platform' => $type,
                    'is_enabled' => 1
                ));
                $platform = $this->get_platform_by_type($type);
            }
            
            $data = $this->get_request_data();
            
            $update_data = array();
            
            if (isset($data['is_enabled'])) {
                $update_data['is_enabled'] = $data['is_enabled'] ? 1 : 0;
            }
            
            if (isset($data['provider_name'])) {
                $update_data['provider_name'] = $data['provider_name'];
            }
            
            if (isset($data['api_key'])) {
                $update_data['api_key'] = $data['api_key'];
            }
            
            if (isset($data['api_secret'])) {
                // Only update if not the hidden placeholder
                if ($data['api_secret'] !== '***hidden***') {
                    $update_data['api_secret'] = $data['api_secret'];
                }
            }
            
            if (isset($data['api_url'])) {
                $update_data['api_url'] = $data['api_url'];
            }
            
            if (isset($data['sender_id'])) {
                $update_data['sender_id'] = $data['sender_id'];
            }
            
            if (isset($data['sender_email'])) {
                $update_data['sender_email'] = $data['sender_email'];
            }
            
            if (isset($data['settings'])) {
                // If settings is already an array, encode it; otherwise use as is
                if (is_array($data['settings'])) {
                    $update_data['settings'] = json_encode($data['settings']);
                } else {
                    $update_data['settings'] = $data['settings'];
                }
            }
            
            $update_data['updated_by'] = $this->user['id'] ?? null;
            
            if (empty($update_data)) {
                $this->error('No data provided for update', 400);
                return;
            }
            
            $old_platform = $platform;
            $this->db->where('platform', $type);
            $this->db->update('message_platform_settings', $update_data);
            
            $platform = $this->get_platform_by_type($type);
            
            // Log platform settings update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('Message Management', 'Platform Settings', $platform['id'] ?? null, "Updated {$type} platform settings", $old_platform, $platform);
            
            // Hide sensitive data in response
            if (!empty($platform['api_secret'])) {
                $platform['api_secret'] = '***hidden***';
            }
            if (!empty($platform['api_key']) && strlen($platform['api_key']) > 10) {
                $platform['api_key'] = substr($platform['api_key'], 0, 4) . '***' . substr($platform['api_key'], -4);
            }
            if (!empty($platform['settings'])) {
                $platform['settings'] = json_decode($platform['settings'], true);
            }
            
            $this->success($platform, 'Platform settings updated successfully');
            
        } catch (Exception $e) {
            log_message('error', 'Message_platforms update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get platform by type
     */
    private function get_platform_by_type($type) {
        $this->db->where('platform', $type);
        $query = $this->db->get('message_platform_settings');
        
        if ($query->num_rows() > 0) {
            return $query->row_array();
        }
        
        return null;
    }
}

