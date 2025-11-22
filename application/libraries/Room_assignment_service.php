<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Room Assignment Service
 * Handles room assignment logic for both Fixed and Dynamic modes
 */
class Room_assignment_service {

    private $CI;
    private $doctor_room_model;
    private $doctor_slot_room_model;
    private $system_settings_model;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->model('Doctor_room_model');
        $this->CI->load->model('Doctor_slot_room_model');
        $this->CI->load->model('System_settings_model');
        $this->CI->load->model('Room_model');
        $this->CI->load->model('Reception_model');
        $this->CI->load->model('Floor_model');
        
        $this->doctor_room_model = $this->CI->Doctor_room_model;
        $this->doctor_slot_room_model = $this->CI->Doctor_slot_room_model;
        $this->system_settings_model = $this->CI->System_settings_model;
    }

    /**
     * Get room assignment for an appointment
     * 
     * @param int $doctor_id Doctor ID
     * @param string $appointment_date Appointment date/time (Y-m-d H:i:s)
     * @param int|null $schedule_id Schedule ID (required in Dynamic mode)
     * @return array|false Room assignment data (room_id, reception_id, floor_id) or false on failure
     */
    public function get_room_for_appointment($doctor_id, $appointment_date, $schedule_id = null) {
        // Get room management mode
        $room_mode = $this->system_settings_model->get_room_mode();
        
        if ($room_mode === 'Fixed') {
            return $this->get_room_fixed_mode($doctor_id);
        } elseif ($room_mode === 'Dynamic') {
            if (!$schedule_id) {
                log_message('error', 'Schedule ID is required in Dynamic mode');
                return false;
            }
            $date = date('Y-m-d', strtotime($appointment_date));
            return $this->get_room_dynamic_mode($doctor_id, $schedule_id, $date);
        }
        
        log_message('error', 'Invalid room management mode: ' . $room_mode);
        return false;
    }

    /**
     * Get room assignment in Fixed mode
     * 
     * @param int $doctor_id Doctor ID
     * @return array|false Room assignment data or false
     */
    private function get_room_fixed_mode($doctor_id) {
        $assignment = $this->doctor_room_model->get_by_doctor($doctor_id);
        
        if (!$assignment || !$assignment['is_active']) {
            log_message('error', 'No active room assignment found for doctor ID: ' . $doctor_id);
            return false;
        }
        
        // Get room details to extract floor_id
        $room = $this->CI->Room_model->get_by_id($assignment['room_id']);
        if (!$room) {
            log_message('error', 'Room not found: ' . $assignment['room_id']);
            return false;
        }
        
        return array(
            'room_id' => $assignment['room_id'],
            'reception_id' => $assignment['reception_id'],
            'floor_id' => $room['floor_id'],
            'room_number' => $room['room_number'],
            'room_name' => $room['room_name'],
            'reception_code' => $assignment['reception_code'],
            'reception_name' => $assignment['reception_name'],
            'floor_number' => $room['floor_number'],
            'floor_name' => $room['floor_name']
        );
    }

    /**
     * Get room assignment in Dynamic mode
     * 
     * @param int $doctor_id Doctor ID
     * @param int $schedule_id Schedule ID
     * @param string $date Date (Y-m-d)
     * @return array|false Room assignment data or false
     */
    private function get_room_dynamic_mode($doctor_id, $schedule_id, $date) {
        $assignment = $this->doctor_slot_room_model->get_by_slot_date($schedule_id, $date);
        
        if (!$assignment || !$assignment['is_active']) {
            log_message('error', 'No active slot-room assignment found for doctor ID: ' . $doctor_id . ', schedule: ' . $schedule_id . ', date: ' . $date);
            return false;
        }
        
        // Verify doctor matches
        if ($assignment['doctor_id'] != $doctor_id) {
            log_message('error', 'Schedule does not belong to doctor ID: ' . $doctor_id);
            return false;
        }
        
        return array(
            'room_id' => $assignment['room_id'],
            'reception_id' => $assignment['reception_id'],
            'floor_id' => $assignment['floor_id'],
            'room_number' => $assignment['room_number'],
            'room_name' => $assignment['room_name'],
            'reception_code' => $assignment['reception_code'],
            'reception_name' => $assignment['reception_name'],
            'floor_number' => $assignment['floor_number'],
            'floor_name' => $assignment['floor_name'],
            'schedule_id' => $schedule_id,
            'slot_start_time' => $assignment['slot_start_time'],
            'slot_end_time' => $assignment['slot_end_time']
        );
    }

    /**
     * Validate room availability
     * 
     * @param int $room_id Room ID
     * @param string $date Date (Y-m-d)
     * @param string $time Time (H:i:s)
     * @param int $duration Duration in minutes
     * @return array Validation result with 'available' and 'message' keys
     */
    public function validate_room_availability($room_id, $date, $time, $duration = 30) {
        // Get room details
        $room = $this->CI->Room_model->get_by_id($room_id);
        
        if (!$room) {
            return array('available' => false, 'message' => 'Room not found');
        }
        
        // Check room status
        if ($room['status'] !== 'Active') {
            return array('available' => false, 'message' => 'Room is ' . $room['status']);
        }
        
        // Check if room is under maintenance
        if ($room['status'] === 'Under Maintenance') {
            return array('available' => false, 'message' => 'Room is under maintenance');
        }
        
        // Check room capacity - allow multiple appointments per room (2-3 per slot)
        // For appointment scheduling, we use a minimum of 3 appointments per slot
        // The room's capacity field is for physical capacity (people), not appointment slots
        // We allow multiple appointments (2-3) in the same room at the same time slot
        $min_appointment_capacity = 3; // Minimum appointments allowed per time slot
        
        // Check for existing appointments at the same time
        $this->CI->load->model('Appointment_model');
        $datetime = $date . ' ' . $time;
        
        // Count appointments in the same time slot (exact time match for same slot)
        // This allows multiple appointments (2-3) in the same room at the same time
        $this->CI->db->where('room_id', $room_id);
        $this->CI->db->where('DATE(appointment_date)', $date);
        $this->CI->db->where('TIME(appointment_date)', $time);
        $this->CI->db->where_in('status', array('Scheduled', 'Confirmed', 'In Progress'));
        
        $existing_count = $this->CI->db->count_all_results('appointments');
        
        // Allow up to min_appointment_capacity appointments in the same time slot
        if ($existing_count >= $min_appointment_capacity) {
            return array('available' => false, 'message' => 'Room slot is full (' . $existing_count . '/' . $min_appointment_capacity . ' appointments)');
        }
        
        return array('available' => true, 'message' => 'Room is available');
    }

    /**
     * Get available rooms for a doctor in Dynamic mode
     * 
     * @param int $doctor_id Doctor ID
     * @param int $schedule_id Schedule ID
     * @param string $date Date (Y-m-d)
     * @return array List of available rooms
     */
    public function get_available_rooms_for_slot($doctor_id, $schedule_id, $date) {
        return $this->doctor_slot_room_model->get_available_rooms($schedule_id, $date, $doctor_id);
    }
}

