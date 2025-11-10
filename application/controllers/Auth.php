<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Authentication API Controller
 */
class Auth extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('User_model');
    }

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    public function login() {
        try {
            $data = $this->get_request_data();
            
            // Validate input
            if (empty($data['email']) || empty($data['password'])) {
                $this->error('Email and password are required', 422);
                return;
            }

            $email = $data['email'];
            $password = $data['password'];

            // Get user by email
            $user = $this->User_model->get_user_by_email($email);

            if (!$user) {
                log_message('debug', 'Login failed: User not found - ' . $email);
                $this->error('Invalid email or password', 401);
                return;
            }

            // Verify password
            $password_verified = password_verify($password, $user['password']);
            
            if (!$password_verified) {
                log_message('debug', 'Login failed: Password mismatch for user - ' . $email);
                log_message('debug', 'Stored hash: ' . substr($user['password'], 0, 20) . '...');
                $this->error('Invalid email or password', 401);
                return;
            }

            // Check if user is active
            if ($user['status'] !== 'active') {
                $this->error('Account is inactive', 403);
                return;
            }

            // Generate token (simple token for now, use JWT library in production)
            $token = $this->generate_token($user['id']);

            // Save token to session table
            $this->User_model->save_token($user['id'], $token);

            // Remove password from response
            unset($user['password']);

            $this->success(array(
                'token' => $token,
                'user' => $user
            ), 'Login successful');
        } catch (Exception $e) {
            log_message('error', 'Login error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    public function logout() {
        if (!$this->verify_token()) {
            return;
        }

        $headers = $this->input->request_headers();
        $token = null;

        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
                $token = $matches[1];
            }
        }

        if ($token) {
            $this->User_model->delete_token($token);
        }

        $this->success(null, 'Logged out successfully');
    }

    /**
     * Generate simple token (use JWT in production)
     */
    private function generate_token($user_id) {
        $data = array(
            'user_id' => $user_id,
            'timestamp' => time(),
            'random' => bin2hex(random_bytes(16))
        );
        
        return base64_encode(json_encode($data));
    }
}

