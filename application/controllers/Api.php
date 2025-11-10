<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Base API Controller
 * Handles common API functionality and CORS
 */
class Api extends CI_Controller {

    protected $user = null;

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

        // Try to get token from Authorization header
        $auth_header = $this->input->server('HTTP_AUTHORIZATION');
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

        if (!$token) {
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
        return true;
    }
}

