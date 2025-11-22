<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Token Service
 * Handles token generation and management
 */
class Token_service {

    private $CI;
    private $token_model;
    private $room_assignment_service;
    private $system_settings_model;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->model('Token_model');
        $this->CI->load->model('System_settings_model');
        $this->CI->load->library('Room_assignment_service');
        
        $this->token_model = $this->CI->Token_model;
        $this->system_settings_model = $this->CI->System_settings_model;
        $this->room_assignment_service = $this->CI->room_assignment_service;
    }

    /**
     * Generate token for an appointment
     * 
     * @param int $appointment_id Appointment ID
     * @param int $doctor_id Doctor ID
     * @param string $appointment_date Appointment date/time
     * @param int|null $schedule_id Schedule ID (required in Dynamic mode)
     * @return array|false Token data (token_id, token_number) or false on failure
     */
    public function generate_token($appointment_id, $doctor_id, $appointment_date, $schedule_id = null) {
        // Get room assignment
        $room_assignment = $this->room_assignment_service->get_room_for_appointment(
            $doctor_id, 
            $appointment_date, 
            $schedule_id
        );
        
        if (!$room_assignment) {
            log_message('error', 'Failed to get room assignment for appointment: ' . $appointment_id);
            return false;
        }
        
        // Generate token
        $token_result = $this->token_model->generate_token(
            $appointment_id,
            $room_assignment['reception_id'],
            $room_assignment['floor_id']
        );
        
        if (!$token_result) {
            log_message('error', 'Failed to generate token for appointment: ' . $appointment_id);
            return false;
        }
        
        return array(
            'token_id' => $token_result['token_id'],
            'token_number' => $token_result['token_number'],
            'room_id' => $room_assignment['room_id'],
            'reception_id' => $room_assignment['reception_id'],
            'floor_id' => $room_assignment['floor_id'],
            'room_number' => $room_assignment['room_number'],
            'room_name' => $room_assignment['room_name'],
            'reception_code' => $room_assignment['reception_code'],
            'reception_name' => $room_assignment['reception_name'],
            'floor_number' => $room_assignment['floor_number'],
            'floor_name' => $room_assignment['floor_name']
        );
    }

    /**
     * Get token queue for reception
     * 
     * @param int $reception_id Reception ID
     * @param string|null $date Date (Y-m-d), defaults to today
     * @return array List of tokens
     */
    public function get_queue($reception_id, $date = null) {
        if (!$date) {
            $date = date('Y-m-d');
        }
        
        return $this->token_model->get_queue($reception_id, $date);
    }

    /**
     * Update token status
     * 
     * @param int $token_id Token ID
     * @param string $status New status
     * @return bool Success
     */
    public function update_token_status($token_id, $status) {
        $valid_statuses = array('Waiting', 'In Progress', 'Completed', 'Cancelled', 'No Show');
        
        if (!in_array($status, $valid_statuses)) {
            log_message('error', 'Invalid token status: ' . $status);
            return false;
        }
        
        return $this->token_model->update_status($token_id, $status);
    }

    /**
     * Get tokens by reception
     * 
     * @param int $reception_id Reception ID
     * @param string|null $date Date (Y-m-d)
     * @param string|null $status Status filter
     * @return array List of tokens
     */
    public function get_tokens_by_reception($reception_id, $date = null, $status = null) {
        return $this->token_model->get_tokens_by_reception($reception_id, $date, $status);
    }

    /**
     * Get tokens by floor
     * 
     * @param int $floor_id Floor ID
     * @param string|null $date Date (Y-m-d)
     * @param string|null $status Status filter
     * @return array List of tokens
     */
    public function get_tokens_by_floor($floor_id, $date = null, $status = null) {
        return $this->token_model->get_tokens_by_floor($floor_id, $date, $status);
    }

    /**
     * Get tokens by doctor
     * 
     * @param int $doctor_id Doctor ID
     * @param string|null $date Date (Y-m-d)
     * @param string|null $status Status filter
     * @return array List of tokens
     */
    public function get_tokens_by_doctor($doctor_id, $date = null, $status = null) {
        return $this->token_model->get_tokens_by_doctor($doctor_id, $date, $status);
    }
}

