<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Token_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('System_settings_model');
    }

    /**
     * Generate token number for an appointment
     */
    public function generate_token($appointment_id, $reception_id, $floor_id) {
        // Get reception and floor details
        $this->db->select('rec.reception_code, f.floor_number');
        $this->db->from('receptions rec');
        $this->db->join('floors f', 'rec.floor_id = f.id', 'left');
        $this->db->where('rec.id', $reception_id);
        $reception = $this->db->get()->row_array();
        
        if (!$reception) {
            return false;
        }
        
        // Get appointment details
        $this->db->select('a.*, d.id as doctor_id, p.id as patient_id');
        $this->db->from('appointments a');
        $this->db->join('doctors d', 'a.doctor_doctor_id = d.id', 'left');
        $this->db->join('patients p', 'a.patient_id = p.id', 'left');
        $this->db->where('a.id', $appointment_id);
        $appointment = $this->db->get()->row_array();
        
        if (!$appointment) {
            return false;
        }
        
        $token_date = date('Y-m-d', strtotime($appointment['appointment_date']));
        
        // Get next token number
        $token_number = $this->get_next_token_number($reception_id, $floor_id, $token_date);
        
        if (!$token_number) {
            return false;
        }
        
        // Create token record
        $token_data = array(
            'token_number' => $token_number,
            'appointment_id' => $appointment_id,
            'reception_id' => $reception_id,
            'floor_id' => $floor_id,
            'room_id' => $appointment['room_id'],
            'doctor_id' => $appointment['doctor_id'],
            'patient_id' => $appointment['patient_id'],
            'token_date' => $token_date,
            'status' => 'Waiting'
        );
        
        if ($this->db->insert('tokens', $token_data)) {
            $token_id = $this->db->insert_id();
            
            // Update appointment with token number
            // Ensure token_number is in correct format (F1-001, F1-002, etc.)
            $this->db->where('id', $appointment_id);
            $update_result = $this->db->update('appointments', array(
                'token_number' => $token_number,
                'reception_id' => $reception_id,
                'floor_id' => $floor_id
            ));
            
            // Log for debugging
            log_message('debug', "Generated token for appointment {$appointment_id}: {$token_number}");
            
            return array(
                'token_id' => $token_id,
                'token_number' => $token_number
            );
        }
        
        log_message('error', "Failed to insert token for appointment: {$appointment_id}");
        return false;
    }

    /**
     * Get next token number for reception/floor/date
     */
    public function get_next_token_number($reception_id, $floor_id, $date) {
        // Start transaction to ensure atomicity
        $this->db->trans_start();
        
        // Get token prefix format from settings
        $prefix_format = $this->System_settings_model->get_setting_value('token_prefix_format', 'F{floor}-{reception}');
        // Remove quotes if present
        if (is_string($prefix_format) && (substr($prefix_format, 0, 1) === '"' && substr($prefix_format, -1) === '"')) {
            $prefix_format = substr($prefix_format, 1, -1);
        }
        
        // Get reception and floor details
        $this->db->select('rec.reception_code, f.floor_number');
        $this->db->from('receptions rec');
        $this->db->join('floors f', 'rec.floor_id = f.id', 'left');
        $this->db->where('rec.id', $reception_id);
        $reception = $this->db->get()->row_array();
        
        if (!$reception) {
            $this->db->trans_complete();
            return false;
        }
        
        // Build prefix based on format
        // Handle different format patterns
        $floor_num = $reception['floor_number'];
        $reception_code = $reception['reception_code'];
        
        // Clean reception code - remove any existing prefixes if it already contains "REC"
        // Extract just the numeric part if reception_code is like "REC-002"
        if (preg_match('/REC-?(\d+)/i', $reception_code, $matches)) {
            $reception_num = $matches[1];
        } else {
            // If reception_code doesn't have REC prefix, use it as is
            $reception_num = preg_replace('/[^0-9]/', '', $reception_code);
            if (empty($reception_num)) {
                $reception_num = '001'; // Default if no number found
            }
        }
        
        // Build prefix based on format
        $prefix = str_replace(
            array('{floor}', '{reception}', '{reception_num}'),
            array($floor_num, $reception_code, $reception_num),
            $prefix_format
        );
        
        // Check if reset daily
        $reset_daily = $this->System_settings_model->get_setting_value('token_reset_daily', true);
        if (is_string($reset_daily) && $reset_daily === 'true') {
            $reset_daily = true;
        } elseif (is_string($reset_daily) && $reset_daily === 'false') {
            $reset_daily = false;
        }
        
        // Get max token number for today atomically using MAX() function
        // This prevents race conditions by getting the highest number in one query
        $this->db->select('MAX(CAST(SUBSTRING_INDEX(token_number, "-", -1) AS UNSIGNED)) as max_number', false);
        $this->db->from('tokens');
        $this->db->where('reception_id', $reception_id);
        if ($reset_daily) {
            $this->db->where('token_date', $date);
        }
        $this->db->like('token_number', 'F' . $floor_num . '-', 'after');
        $query = $this->db->get();
        
        $next_number = 1;
        if ($query->num_rows() > 0 && $query->row()->max_number !== null) {
            $next_number = intval($query->row()->max_number) + 1;
        } else {
            // Fallback: get last token by ID if MAX() returns null
            $this->db->select('token_number');
            $this->db->from('tokens');
            $this->db->where('reception_id', $reception_id);
            if ($reset_daily) {
                $this->db->where('token_date', $date);
            }
            $this->db->like('token_number', 'F' . $floor_num . '-', 'after');
            $this->db->order_by('id', 'DESC');
            $this->db->limit(1);
            $fallback_query = $this->db->get();
            
            if ($fallback_query->num_rows() > 0) {
                $last_token = $fallback_query->row()->token_number;
                // Extract number from token (e.g., F1-001 -> 001)
                if (preg_match('/-(\d+)$/', $last_token, $matches)) {
                    $next_number = intval($matches[1]) + 1;
                } elseif (preg_match('/(\d+)$/', $last_token, $matches)) {
                    $next_number = intval($matches[1]) + 1;
                }
            }
        }
        
        // Format token number - use format: F{floor}-{number} (e.g., F1-001, F1-002)
        // This ensures clean format without duplicate reception codes
        $token_number = 'F' . $floor_num . '-' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
        
        // Log for debugging
        log_message('debug', "Generated token number: {$token_number} for reception {$reception_id}, floor {$floor_id}, date {$date}");
        
        // Complete transaction
        $this->db->trans_complete();
        
        return $token_number;
    }

    /**
     * Get tokens by reception
     */
    public function get_tokens_by_reception($reception_id, $date = null, $status = null) {
        $this->db->select('t.*, a.appointment_date, a.appointment_type, a.status as appointment_status,
                          p.name as patient_name, p.patient_id as patient_id_string,
                          d.name as doctor_name, d.specialty,
                          r.room_number, r.room_name,
                          f.floor_number, f.floor_name,
                          rec.reception_name');
        $this->db->from('tokens t');
        $this->db->join('appointments a', 't.appointment_id = a.id', 'left');
        $this->db->join('patients p', 't.patient_id = p.id', 'left');
        $this->db->join('doctors d', 't.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 't.room_id = r.id', 'left');
        $this->db->join('floors f', 't.floor_id = f.id', 'left');
        $this->db->join('receptions rec', 't.reception_id = rec.id', 'left');
        $this->db->where('t.reception_id', $reception_id);
        
        if ($date) {
            $this->db->where('t.token_date', $date);
        }
        
        if ($status) {
            $this->db->where('t.status', $status);
        }
        
        $this->db->order_by('t.token_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get tokens by floor
     */
    public function get_tokens_by_floor($floor_id, $date = null, $status = null) {
        $this->db->select('t.*, a.appointment_date, a.appointment_type, a.status as appointment_status,
                          p.name as patient_name, p.patient_id as patient_id_string,
                          d.name as doctor_name, d.specialty,
                          r.room_number, r.room_name,
                          f.floor_number, f.floor_name,
                          rec.reception_name, rec.reception_code');
        $this->db->from('tokens t');
        $this->db->join('appointments a', 't.appointment_id = a.id', 'left');
        $this->db->join('patients p', 't.patient_id = p.id', 'left');
        $this->db->join('doctors d', 't.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 't.room_id = r.id', 'left');
        $this->db->join('floors f', 't.floor_id = f.id', 'left');
        $this->db->join('receptions rec', 't.reception_id = rec.id', 'left');
        $this->db->where('t.floor_id', $floor_id);
        
        if ($date) {
            $this->db->where('t.token_date', $date);
        }
        
        if ($status) {
            $this->db->where('t.status', $status);
        }
        
        $this->db->order_by('t.token_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get tokens by doctor
     */
    public function get_tokens_by_doctor($doctor_id, $date = null, $status = null) {
        $this->db->select('t.*, a.appointment_date, a.appointment_type, a.status as appointment_status,
                          p.name as patient_name, p.patient_id as patient_id_string,
                          d.name as doctor_name, d.specialty,
                          r.room_number, r.room_name,
                          f.floor_number, f.floor_name,
                          rec.reception_name, rec.reception_code');
        $this->db->from('tokens t');
        $this->db->join('appointments a', 't.appointment_id = a.id', 'left');
        $this->db->join('patients p', 't.patient_id = p.id', 'left');
        $this->db->join('doctors d', 't.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 't.room_id = r.id', 'left');
        $this->db->join('floors f', 't.floor_id = f.id', 'left');
        $this->db->join('receptions rec', 't.reception_id = rec.id', 'left');
        $this->db->where('t.doctor_id', $doctor_id);
        
        if ($date) {
            $this->db->where('t.token_date', $date);
        }
        
        if ($status) {
            $this->db->where('t.status', $status);
        }
        
        $this->db->order_by('t.token_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get waiting queue for reception
     */
    public function get_queue($reception_id, $date = null) {
        if (!$date) {
            $date = date('Y-m-d');
        }
        
        $this->db->select('t.*, a.appointment_date, a.appointment_type,
                          p.name as patient_name, p.patient_id as patient_id_string,
                          d.name as doctor_name, d.specialty,
                          r.room_number, r.room_name');
        $this->db->from('tokens t');
        $this->db->join('appointments a', 't.appointment_id = a.id', 'left');
        $this->db->join('patients p', 't.patient_id = p.id', 'left');
        $this->db->join('doctors d', 't.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 't.room_id = r.id', 'left');
        $this->db->where('t.reception_id', $reception_id);
        $this->db->where('t.token_date', $date);
        $this->db->where_in('t.status', array('Waiting', 'In Progress'));
        $this->db->order_by('t.token_number', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update token status
     */
    public function update_status($token_id, $status) {
        $update_data = array('status' => $status);
        
        if ($status === 'In Progress') {
            $update_data['called_at'] = date('Y-m-d H:i:s');
        } elseif ($status === 'Completed') {
            $update_data['completed_at'] = date('Y-m-d H:i:s');
        }
        
        $this->db->where('id', $token_id);
        return $this->db->update('tokens', $update_data);
    }

    /**
     * Get token by ID
     */
    public function get_by_id($id) {
        $this->db->select('t.*, a.appointment_date, a.appointment_type, a.status as appointment_status,
                          p.name as patient_name, p.patient_id as patient_id_string,
                          d.name as doctor_name, d.specialty,
                          r.room_number, r.room_name,
                          f.floor_number, f.floor_name,
                          rec.reception_name, rec.reception_code');
        $this->db->from('tokens t');
        $this->db->join('appointments a', 't.appointment_id = a.id', 'left');
        $this->db->join('patients p', 't.patient_id = p.id', 'left');
        $this->db->join('doctors d', 't.doctor_id = d.id', 'left');
        $this->db->join('rooms r', 't.room_id = r.id', 'left');
        $this->db->join('floors f', 't.floor_id = f.id', 'left');
        $this->db->join('receptions rec', 't.reception_id = rec.id', 'left');
        $this->db->where('t.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }
}

