<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Appointment_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }
    
    private function get_doctor_model() {
        if (!isset($this->Doctor_model)) {
            $this->load->model('Doctor_model');
        }
        return $this->Doctor_model;
    }

    /**
     * Get all appointments with filters
     */
    public function get_all($filters = []) {
        $this->db->select('a.*, p.name as patient_name, p.patient_id, p.phone as patient_phone, p.email as patient_email, d.name as doctor_name, d.specialty, d.doctor_id as doctor_doctor_id_string');
        $this->db->from('appointments a');
        $this->db->join('patients p', 'a.patient_id = p.id', 'left');
        $this->db->join('doctors d', 'a.doctor_doctor_id = d.id', 'left');
        
        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $this->db->group_start();
            $this->db->like('p.name', $search);
            $this->db->or_like('d.name', $search);
            $this->db->or_like('a.appointment_number', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('a.status', $filters['status']);
        }
        
        if (!empty($filters['doctor_id'])) {
            $this->db->where('a.doctor_doctor_id', $filters['doctor_id']);
        }
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('a.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['date'])) {
            $this->db->where('DATE(a.appointment_date)', $filters['date']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('DATE(a.appointment_date) >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('DATE(a.appointment_date) <=', $filters['date_to']);
        }
        
        $this->db->order_by('a.appointment_date', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get single appointment with details
     */
    public function get_by_id($id) {
        $this->db->select('a.*, p.name as patient_name, p.patient_id, p.phone as patient_phone, p.email as patient_email, d.name as doctor_name, d.specialty, d.doctor_id as doctor_doctor_id_string');
        $this->db->from('appointments a');
        $this->db->join('patients p', 'a.patient_id = p.id', 'left');
        $this->db->join('doctors d', 'a.doctor_doctor_id = d.id', 'left');
        $this->db->where('a.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create appointment
     */
    public function create($data) {
        // Generate appointment number
        $appointment_number = $this->generate_appointment_number();
        
        // Calculate appointment end time
        $duration = isset($data['appointment_duration']) ? (int)$data['appointment_duration'] : 30;
        $appointment_date = $data['appointment_date'];
        $appointment_end_time = date('Y-m-d H:i:s', strtotime($appointment_date . ' +' . $duration . ' minutes'));
        
        // Validate slot availability
        if (!empty($data['doctor_doctor_id']) && !empty($data['appointment_date'])) {
            $is_available = $this->is_slot_available($data['doctor_doctor_id'], $data['appointment_date'], $duration);
            if (!$is_available['available']) {
                return array('success' => false, 'message' => 'Slot is not available: ' . $is_available['message']);
            }
        }
        
        // Validate and ensure doctor_doctor_id is provided
        if (!isset($data['doctor_doctor_id']) || $data['doctor_doctor_id'] === null || $data['doctor_doctor_id'] === '') {
            return array('success' => false, 'message' => 'Doctor ID (doctor_doctor_id) is required');
        }
        
        $doctor_doctor_id = (int)$data['doctor_doctor_id'];
        if ($doctor_doctor_id <= 0) {
            return array('success' => false, 'message' => 'Invalid doctor ID. Doctor ID must be a positive number');
        }
        
        $insert_data = array(
            'patient_id' => (int)$data['patient_id'],
            'doctor_doctor_id' => $doctor_doctor_id, // Always set this field
            'doctor_id' => isset($data['doctor_id']) ? (int)$data['doctor_id'] : null, // Keep old field for compatibility
            'appointment_date' => $data['appointment_date'],
            'appointment_end_time' => $appointment_end_time,
            'appointment_type' => $data['appointment_type'] ?? 'Consultation',
            'status' => $data['status'] ?? 'Scheduled',
            'reason' => $data['reason'] ?? null,
            'notes' => $data['notes'] ?? null,
            'appointment_duration' => $duration,
            'appointment_number' => $appointment_number,
            'created_by' => isset($data['created_by']) ? (int)$data['created_by'] : null
        );
        
        if ($this->db->insert('appointments', $insert_data)) {
            return array('success' => true, 'id' => $this->db->insert_id());
        }
        return array('success' => false, 'message' => 'Failed to create appointment');
    }

    /**
     * Update appointment
     */
    public function update($id, $data) {
        // If date/time changed, validate slot availability
        if ((isset($data['appointment_date']) || isset($data['doctor_doctor_id'])) && !empty($data['doctor_doctor_id'])) {
            $appointment = $this->get_by_id($id);
            $doctor_id = isset($data['doctor_doctor_id']) ? $data['doctor_doctor_id'] : $appointment['doctor_doctor_id'];
            $appointment_date = isset($data['appointment_date']) ? $data['appointment_date'] : $appointment['appointment_date'];
            $duration = isset($data['appointment_duration']) ? (int)$data['appointment_duration'] : ($appointment['appointment_duration'] ?? 30);
            
            $is_available = $this->is_slot_available($doctor_id, $appointment_date, $duration, $id);
            if (!$is_available['available']) {
                return array('success' => false, 'message' => 'Slot is not available: ' . $is_available['message']);
            }
        }
        
        // Recalculate end time if date or duration changed
        if (isset($data['appointment_date']) || isset($data['appointment_duration'])) {
            $appointment = $this->get_by_id($id);
            $appointment_date = isset($data['appointment_date']) ? $data['appointment_date'] : $appointment['appointment_date'];
            $duration = isset($data['appointment_duration']) ? (int)$data['appointment_duration'] : ($appointment['appointment_duration'] ?? 30);
            $data['appointment_end_time'] = date('Y-m-d H:i:s', strtotime($appointment_date . ' +' . $duration . ' minutes'));
        }
        
        $this->db->where('id', $id);
        if ($this->db->update('appointments', $data)) {
            return array('success' => true);
        }
        return array('success' => false, 'message' => 'Failed to update appointment');
    }

    /**
     * Delete appointment
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('appointments');
    }

    /**
     * Get available dates for doctor in a month
     * Returns dates with availability information
     */
    public function get_available_dates($doctor_id, $month) {
        // Parse month (YYYY-MM)
        $year = substr($month, 0, 4);
        $month_num = substr($month, 5, 2);
        
        // Get first and last day of month
        $first_day = date('Y-m-01', strtotime($year . '-' . $month_num . '-01'));
        $last_day = date('Y-m-t', strtotime($year . '-' . $month_num . '-01'));
        
        // Get doctor schedule
        $schedule = $this->get_doctor_model()->get_schedule($doctor_id);
        
        // Get existing appointments for the month
        $this->db->where('doctor_doctor_id', $doctor_id);
        $this->db->where('DATE(appointment_date) >=', $first_day);
        $this->db->where('DATE(appointment_date) <=', $last_day);
        $this->db->where_in('status', array('Scheduled', 'Confirmed', 'In Progress'));
        $existing_appointments = $this->db->get('appointments')->result_array();
        
        // Group appointments by date and time
        $appointments_by_date_time = array();
        foreach ($existing_appointments as $apt) {
            $date = date('Y-m-d', strtotime($apt['appointment_date']));
            $time = date('H:i', strtotime($apt['appointment_date']));
            if (!isset($appointments_by_date_time[$date])) {
                $appointments_by_date_time[$date] = array();
            }
            if (!isset($appointments_by_date_time[$date][$time])) {
                $appointments_by_date_time[$date][$time] = 0;
            }
            $appointments_by_date_time[$date][$time]++;
        }
        
        // Loop through each day of the month
        $available_dates = array();
        $current_date = $first_day;
        
        while ($current_date <= $last_day) {
            $day_of_week = date('l', strtotime($current_date));
            
            // Get slots for this day
            $day_slots = array_filter($schedule, function($s) use ($day_of_week) {
                return $s['day_of_week'] === $day_of_week && $s['is_available'] == 1;
            });
            
            if (!empty($day_slots)) {
                $total_slots = 0;
                $available_slots = 0;
                
                foreach ($day_slots as $slot_config) {
                    $max_per_slot = isset($slot_config['max_appointments_per_slot']) ? (int)$slot_config['max_appointments_per_slot'] : 1;
                    $schedule_duration = isset($slot_config['appointment_duration']) ? (int)$slot_config['appointment_duration'] : 30;
                    
                    $start_time = strtotime($slot_config['start_time']);
                    $end_time = strtotime($slot_config['end_time']);
                    
                    // Get break times if any
                    $break_start = !empty($slot_config['break_start']) ? strtotime($slot_config['break_start']) : null;
                    $break_end = !empty($slot_config['break_end']) ? strtotime($slot_config['break_end']) : null;
                    
                    // Generate slots within this time period
                    $current_time = $start_time;
                    
                    while ($current_time < $end_time) {
                        $slot_time = date('H:i', $current_time);
                        
                        // Skip if in break time
                        if ($break_start && $break_end && $current_time >= $break_start && $current_time < $break_end) {
                            $current_time = $break_end;
                            continue;
                        }
                        
                        $total_slots++;
                        
                        // Check capacity
                        $current_count = isset($appointments_by_date_time[$current_date][$slot_time]) 
                            ? $appointments_by_date_time[$current_date][$slot_time] 
                            : 0;
                        
                        if ($current_count < $max_per_slot) {
                            $available_slots++;
                        }
                        
                        // Move to next slot
                        $current_time = strtotime('+' . $schedule_duration . ' minutes', $current_time);
                    }
                }
                
                if ($total_slots > 0) {
                    $available_dates[] = array(
                        'date' => $current_date,
                        'available_slots_count' => $available_slots,
                        'total_slots' => $total_slots,
                        'has_availability' => $available_slots > 0
                    );
                }
            }
            
            // Move to next day
            $current_date = date('Y-m-d', strtotime($current_date . ' +1 day'));
        }
        
        return array(
            'month' => $month,
            'available_dates' => $available_dates
        );
    }

    /**
     * Get available slots for doctor on date
     * Handles multiple time slots per day
     */
    public function get_available_slots($doctor_id, $date, $duration = 30) {
        // Get day of week
        $day_of_week = date('l', strtotime($date)); // Monday, Tuesday, etc.
        
        // Get ALL doctor schedule slots for that day (multiple slots possible)
        $schedule = $this->get_doctor_model()->get_schedule($doctor_id);
        $day_slots = array_filter($schedule, function($s) use ($day_of_week) {
            return $s['day_of_week'] === $day_of_week && $s['is_available'] == 1;
        });
        
        if (empty($day_slots)) {
            return array(); // Doctor not available on this day
        }
        
        // Get existing appointments for this doctor on this date
        $this->db->where('doctor_doctor_id', $doctor_id);
        $this->db->where('DATE(appointment_date)', $date);
        $this->db->where_in('status', array('Scheduled', 'Confirmed', 'In Progress'));
        $existing = $this->db->get('appointments')->result_array();
        
        // Group appointments by time slot (same hour:minute)
        $appointments_by_slot = array();
        foreach ($existing as $apt) {
            $slot_time = date('H:i', strtotime($apt['appointment_date']));
            if (!isset($appointments_by_slot[$slot_time])) {
                $appointments_by_slot[$slot_time] = 0;
            }
            $appointments_by_slot[$slot_time]++;
        }
        
        // Generate available slots from ALL time slots for the day
        $all_slots = array();
        
        foreach ($day_slots as $slot_config) {
            $max_per_slot = isset($slot_config['max_appointments_per_slot']) ? (int)$slot_config['max_appointments_per_slot'] : 1;
            $schedule_duration = isset($slot_config['appointment_duration']) ? (int)$slot_config['appointment_duration'] : 30;
            $slot_duration = $duration > 0 ? $duration : $schedule_duration;
            
            $start_time = strtotime($slot_config['start_time']);
            $end_time = strtotime($slot_config['end_time']);
            
            // Get break times if any
            $break_start = !empty($slot_config['break_start']) ? strtotime($slot_config['break_start']) : null;
            $break_end = !empty($slot_config['break_end']) ? strtotime($slot_config['break_end']) : null;
            
            // Generate slots within this time period
            $current_time = $start_time;
            
            while ($current_time < $end_time) {
                $slot_time = date('H:i', $current_time);
                $slot_datetime = $date . ' ' . date('H:i:s', $current_time);
                
                // Skip if in break time
                if ($break_start && $break_end && $current_time >= $break_start && $current_time < $break_end) {
                    $current_time = $break_end;
                    continue;
                }
                
                // Count existing appointments in this slot
                $current_count = isset($appointments_by_slot[$slot_time]) ? $appointments_by_slot[$slot_time] : 0;
                $available = $max_per_slot - $current_count;
                
                // Determine status
                if ($available <= 0) {
                    $status = 'full';
                } elseif ($available < $max_per_slot) {
                    $status = 'limited';
                } else {
                    $status = 'available';
                }
                
                $all_slots[] = array(
                    'time' => $slot_time,
                    'datetime' => $slot_datetime,
                    'available' => max(0, $available),
                    'total' => $max_per_slot,
                    'current' => $current_count,
                    'status' => $status,
                    'is_available' => $available > 0,
                    'slot_name' => isset($slot_config['slot_name']) ? $slot_config['slot_name'] : null
                );
                
                // Move to next slot
                $current_time = strtotime('+' . $slot_duration . ' minutes', $current_time);
            }
        }
        
        // Sort all slots by time
        usort($all_slots, function($a, $b) {
            return strtotime($a['datetime']) - strtotime($b['datetime']);
        });
        
        return $all_slots;
    }

    /**
     * Check if slot is available (with capacity check)
     * Handles multiple slots per day
     */
    public function is_slot_available($doctor_id, $datetime, $duration = 30, $exclude_appointment_id = null) {
        $date = date('Y-m-d', strtotime($datetime));
        $time = date('H:i:s', strtotime($datetime));
        $time_short = date('H:i', strtotime($datetime));
        
        // Get day of week
        $day_of_week = date('l', strtotime($date));
        
        // Get ALL doctor schedule slots for that day
        $schedule = $this->get_doctor_model()->get_schedule($doctor_id);
        $day_slots = array_filter($schedule, function($s) use ($day_of_week) {
            return $s['day_of_week'] === $day_of_week && $s['is_available'] == 1;
        });
        
        if (empty($day_slots)) {
            return array('available' => false, 'message' => 'Doctor is not available on this day');
        }
        
        // Check if time falls within any of the day's slots
        $appointment_time = strtotime($time);
        $found_slot = false;
        $slot_config = null;
        
        foreach ($day_slots as $slot) {
            $schedule_start = strtotime($slot['start_time']);
            $schedule_end = strtotime($slot['end_time']);
            
            if ($appointment_time >= $schedule_start && $appointment_time < $schedule_end) {
                // Check break time
                if (!empty($slot['break_start']) && !empty($slot['break_end'])) {
                    $break_start = strtotime($slot['break_start']);
                    $break_end = strtotime($slot['break_end']);
                    if ($appointment_time >= $break_start && $appointment_time < $break_end) {
                        continue; // In break time, try next slot
                    }
                }
                
                $found_slot = true;
                $slot_config = $slot;
                break;
            }
        }
        
        if (!$found_slot) {
            return array('available' => false, 'message' => 'Time is outside doctor\'s schedule');
        }
        
        // Check capacity
        $max_per_slot = isset($slot_config['max_appointments_per_slot']) ? (int)$slot_config['max_appointments_per_slot'] : 1;
        
        $this->db->where('doctor_doctor_id', $doctor_id);
        $this->db->where('DATE(appointment_date)', $date);
        $this->db->where('TIME(appointment_date)', $time);
        $this->db->where_in('status', array('Scheduled', 'Confirmed', 'In Progress'));
        if ($exclude_appointment_id) {
            $this->db->where('id !=', $exclude_appointment_id);
        }
        $count = $this->db->count_all_results('appointments');
        
        if ($count >= $max_per_slot) {
            return array('available' => false, 'message' => 'Slot is full (' . $count . '/' . $max_per_slot . ' booked)');
        }
        
        return array('available' => true, 'message' => 'Slot is available', 'current' => $count, 'max' => $max_per_slot, 'available_count' => $max_per_slot - $count);
    }

    /**
     * Get slot capacity info
     */
    public function get_slot_capacity($doctor_id, $datetime) {
        $date = date('Y-m-d', strtotime($datetime));
        $time = date('H:i:s', strtotime($datetime));
        
        // Get day of week and schedule
        $day_of_week = date('l', strtotime($date));
        $schedule = $this->Doctor_model->get_schedule($doctor_id);
        $day_slots = array_filter($schedule, function($s) use ($day_of_week) {
            return $s['day_of_week'] === $day_of_week && $s['is_available'] == 1;
        });
        
        // Find the slot that contains this time
        $appointment_time = strtotime($time);
        $slot_config = null;
        
        foreach ($day_slots as $slot) {
            $schedule_start = strtotime($slot['start_time']);
            $schedule_end = strtotime($slot['end_time']);
            if ($appointment_time >= $schedule_start && $appointment_time < $schedule_end) {
                $slot_config = $slot;
                break;
            }
        }
        
        $max = isset($slot_config['max_appointments_per_slot']) ? (int)$slot_config['max_appointments_per_slot'] : 1;
        
        $this->db->where('doctor_doctor_id', $doctor_id);
        $this->db->where('DATE(appointment_date)', $date);
        $this->db->where('TIME(appointment_date)', $time);
        $this->db->where_in('status', array('Scheduled', 'Confirmed', 'In Progress'));
        $current = $this->db->count_all_results('appointments');
        
        return array(
            'current' => $current,
            'max' => $max,
            'available' => max(0, $max - $current),
            'is_full' => $current >= $max
        );
    }

    /**
     * Get appointments by doctor
     */
    public function get_by_doctor($doctor_id, $date = null) {
        $this->db->where('doctor_doctor_id', $doctor_id);
        if ($date) {
            $this->db->where('DATE(appointment_date)', $date);
        }
        $this->db->order_by('appointment_date', 'ASC');
        $query = $this->db->get('appointments');
        return $query->result_array();
    }

    /**
     * Get appointments by patient
     */
    public function get_by_patient($patient_id) {
        $this->db->where('patient_id', $patient_id);
        $this->db->order_by('appointment_date', 'DESC');
        $query = $this->db->get('appointments');
        return $query->result_array();
    }

    /**
     * Generate appointment number
     */
    public function generate_appointment_number() {
        // Get the last appointment number
        $this->db->select('appointment_number');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('appointments');
        $last = $query->row_array();
        
        if ($last && preg_match('/A(\d+)/', $last['appointment_number'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }
        
        return 'A' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    }
}

