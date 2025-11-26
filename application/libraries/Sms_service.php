<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * SMS Service Library
 * Handles SMS sending using configured platform settings
 */
class Sms_service {

    protected $CI;
    protected $platform_settings = null;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->database();
        $this->load_platform_settings();
    }

    /**
     * Load SMS platform settings from database
     */
    private function load_platform_settings() {
        $this->CI->db->where('platform', 'sms');
        $this->CI->db->where('is_enabled', 1);
        $query = $this->CI->db->get('message_platform_settings');
        
        if ($query->num_rows() > 0) {
            $this->platform_settings = $query->row_array();
            if (!empty($this->platform_settings['settings'])) {
                $this->platform_settings['settings'] = json_decode($this->platform_settings['settings'], true);
            }
        }
    }

    /**
     * Send SMS using FastSMS API
     * 
     * @param string $to Recipient phone number (with country code, e.g., 923214797230)
     * @param string $message Message content
     * @return array Response array with 'success' and 'message' keys
     */
    public function send_sms($to, $message) {
        // Check if platform is enabled and configured
        if (!$this->platform_settings || empty($this->platform_settings['api_url'])) {
            return array(
                'success' => false,
                'message' => 'SMS platform is not configured or enabled'
            );
        }

        // Validate required fields
        if (empty($this->platform_settings['api_key']) || 
            empty($this->platform_settings['api_secret']) || 
            empty($this->platform_settings['sender_id'])) {
            return array(
                'success' => false,
                'message' => 'SMS platform credentials are incomplete'
            );
        }

        // Get settings
        $settings = $this->platform_settings['settings'] ?? array();
        $lang = $settings['lang'] ?? 'english';
        $response_type = $settings['type'] ?? 'json';

        // Build API URL with parameters
        $api_url = $this->platform_settings['api_url'];
        $params = array(
            'id' => $this->platform_settings['api_key'],
            'pass' => $this->platform_settings['api_secret'],
            'mask' => $this->platform_settings['sender_id'],
            'to' => $to,
            'portable' => '', // Empty as per API example
            'lang' => $lang,
            'msg' => $message, // http_build_query will encode this automatically
            'type' => $response_type
        );

        // Build query string (http_build_query automatically URL-encodes all values)
        $query_string = http_build_query($params);
        $full_url = $api_url . '?' . $query_string;

        // Send request using cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $full_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        // Handle cURL errors
        if ($curl_error) {
            log_message('error', 'SMS Service cURL Error: ' . $curl_error);
            return array(
                'success' => false,
                'message' => 'Failed to connect to SMS service: ' . $curl_error
            );
        }

        // Handle HTTP errors
        if ($http_code !== 200) {
            log_message('error', 'SMS Service HTTP Error: ' . $http_code);
            return array(
                'success' => false,
                'message' => 'SMS service returned error code: ' . $http_code
            );
        }

        // Parse response based on type
        $response_data = null;
        if ($response_type === 'json') {
            $response_data = json_decode($response, true);
        } else {
            $response_data = array('raw' => $response);
        }

        // Log the response for debugging
        log_message('info', 'SMS Service Response: ' . json_encode($response_data));

        // Check if response indicates success
        // Adjust this based on actual FastSMS API response format
        $success = false;
        $message = 'SMS sent successfully';
        
        if ($response_type === 'json' && is_array($response_data)) {
            // Check common success indicators in JSON response
            if (isset($response_data['status']) && $response_data['status'] === 'success') {
                $success = true;
            } elseif (isset($response_data['error'])) {
                $success = false;
                $message = $response_data['error'];
            } else {
                // If no error field, assume success
                $success = true;
            }
        } else {
            // For non-JSON responses, assume success if HTTP 200
            $success = true;
        }

        return array(
            'success' => $success,
            'message' => $message,
            'response' => $response_data,
            'http_code' => $http_code
        );
    }

    /**
     * Send SMS and log to message_logs table
     * 
     * @param int $template_id Template ID (optional)
     * @param string $to Recipient phone number
     * @param string $message Message content
     * @param array $metadata Additional metadata (optional)
     * @return array Response array
     */
    public function send_and_log($template_id, $to, $message, $metadata = array()) {
        // Send SMS
        $result = $this->send_sms($to, $message);

        // Log to database
        $log_data = array(
            'template_id' => $template_id ?: null,
            'recipient_contact' => $to,
            'message_type' => 'sms',
            'content' => $message,
            'status' => $result['success'] ? 'sent' : 'failed',
            'sent_at' => date('Y-m-d H:i:s'),
            'provider_response' => json_encode($result['response'] ?? array()),
            'error_message' => $result['success'] ? null : $result['message'],
            'metadata' => json_encode($metadata)
        );

        $this->CI->db->insert('message_logs', $log_data);
        $log_id = $this->CI->db->insert_id();

        // Update template sent count if template_id provided
        if ($template_id && $result['success']) {
            $this->CI->db->where('id', $template_id);
            $this->CI->db->set('sent_count', 'sent_count + 1', false);
            $this->CI->db->set('last_used_at', date('Y-m-d H:i:s'));
            $this->CI->db->update('message_templates');
        }

        return array_merge($result, array('log_id' => $log_id));
    }

    /**
     * Check if SMS platform is configured and enabled
     * 
     * @return bool
     */
    public function is_configured() {
        return $this->platform_settings !== null && 
               !empty($this->platform_settings['api_url']) &&
               !empty($this->platform_settings['api_key']) &&
               !empty($this->platform_settings['api_secret']) &&
               !empty($this->platform_settings['sender_id']);
    }
}

