<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get user by email
     */
    public function get_user_by_email($email) {
        $query = $this->db->get_where('users', array('email' => $email));
        return $query->row_array();
    }

    /**
     * Get user by ID
     */
    public function get_user_by_id($id) {
        $query = $this->db->get_where('users', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Get user by token
     */
    public function get_user_by_token($token) {
        // Decode token
        $token_data = json_decode(base64_decode($token), true);
        
        if (!$token_data || !isset($token_data['user_id'])) {
            return null;
        }

        // Check if token exists in sessions table
        $this->db->where('token', $token);
        $this->db->where('expires_at >', date('Y-m-d H:i:s'));
        $session = $this->db->get('sessions')->row_array();

        if (!$session) {
            return null;
        }

        // Get user
        return $this->get_user_by_id($token_data['user_id']);
    }

    /**
     * Save token to sessions table
     */
    public function save_token($user_id, $token) {
        $data = array(
            'user_id' => $user_id,
            'token' => $token,
            'ip_address' => $this->input->ip_address(),
            'user_agent' => $this->input->user_agent(),
            'expires_at' => date('Y-m-d H:i:s', strtotime('+24 hours'))
        );

        // Delete old tokens for this user
        $this->db->where('user_id', $user_id);
        $this->db->delete('sessions');

        // Insert new token
        return $this->db->insert('sessions', $data);
    }

    /**
     * Delete token
     */
    public function delete_token($token) {
        $this->db->where('token', $token);
        return $this->db->delete('sessions');
    }
}

