<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_ot_schedule_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get OT schedule by ID
     */
    public function get_by_id($id) {
        $this->db->select('ots.*, 
            p.name as patient_name, 
            p.patient_id as patient_code,
            p.phone as patient_phone,
            p.age as patient_age,
            p.gender as patient_gender,
            ia.ipd_number,
            u1.name as surgeon_name,
            u2.name as assistant_surgeon_name,
            u3.name as anesthetist_name,
            u4.name as created_by_name');
        $this->db->from('ipd_ot_schedules ots');
        $this->db->join('patients p', 'ots.patient_id = p.id', 'inner');
        $this->db->join('ipd_admissions ia', 'ots.admission_id = ia.id', 'inner');
        $this->db->join('users u1', 'ots.surgeon_user_id = u1.id', 'left');
        $this->db->join('users u2', 'ots.assistant_surgeon_user_id = u2.id', 'left');
        $this->db->join('users u3', 'ots.anesthetist_user_id = u3.id', 'left');
        $this->db->join('users u4', 'ots.created_by_user_id = u4.id', 'left');
        $this->db->where('ots.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get all OT schedules with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('ots.*, 
            p.name as patient_name, 
            p.patient_id as patient_code,
            p.phone as patient_phone,
            ia.ipd_number,
            u1.name as surgeon_name,
            u2.name as assistant_surgeon_name,
            u3.name as anesthetist_name');
        $this->db->from('ipd_ot_schedules ots');
        $this->db->join('patients p', 'ots.patient_id = p.id', 'inner');
        $this->db->join('ipd_admissions ia', 'ots.admission_id = ia.id', 'inner');
        $this->db->join('users u1', 'ots.surgeon_user_id = u1.id', 'left');
        $this->db->join('users u2', 'ots.assistant_surgeon_user_id = u2.id', 'left');
        $this->db->join('users u3', 'ots.anesthetist_user_id = u3.id', 'left');
        
        if (!empty($filters['date'])) {
            $this->db->where('ots.scheduled_date', $filters['date']);
        }
        
        if (!empty($filters['ot_number'])) {
            $this->db->where('ots.ot_number', $filters['ot_number']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('ots.status', $filters['status']);
        }
        
        if (!empty($filters['surgeon_id'])) {
            $this->db->where('ots.surgeon_user_id', $filters['surgeon_id']);
        }
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('ots.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['admission_id'])) {
            $this->db->where('ots.admission_id', $filters['admission_id']);
        }
        
        $this->db->order_by('ots.scheduled_date', 'ASC');
        $this->db->order_by('ots.scheduled_time', 'ASC');
        
        if (isset($filters['limit'])) {
            $offset = isset($filters['offset']) ? $filters['offset'] : 0;
            $this->db->limit($filters['limit'], $offset);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get OT schedules by admission ID
     */
    public function get_by_admission($admission_id) {
        $this->db->where('admission_id', $admission_id);
        $this->db->order_by('scheduled_date', 'DESC');
        $this->db->order_by('scheduled_time', 'DESC');
        $query = $this->db->get('ipd_ot_schedules');
        return $query->result_array();
    }

    /**
     * Create OT schedule
     */
    public function create($data) {
        try {
            // Validate required fields
            if (empty($data['admission_id']) || empty($data['patient_id']) || empty($data['ot_number'])) {
                log_message('error', 'Ipd_ot_schedule_model->create(): Required fields missing');
                return false;
            }
            
            $insert_data = array(
                'admission_id' => intval($data['admission_id']),
                'patient_id' => intval($data['patient_id']),
                'procedure_id' => isset($data['procedure_id']) ? intval($data['procedure_id']) : null,
                'ot_number' => $data['ot_number'],
                'scheduled_date' => $data['scheduled_date'],
                'scheduled_time' => $data['scheduled_time'],
                'procedure_name' => $data['procedure_name'],
                'procedure_type' => isset($data['procedure_type']) ? $data['procedure_type'] : null,
                'surgeon_user_id' => isset($data['surgeon_user_id']) ? intval($data['surgeon_user_id']) : null,
                'surgeon_name' => isset($data['surgeon_name']) ? $data['surgeon_name'] : null,
                'assistant_surgeon_user_id' => isset($data['assistant_surgeon_user_id']) ? intval($data['assistant_surgeon_user_id']) : null,
                'assistant_surgeon_name' => isset($data['assistant_surgeon_name']) ? $data['assistant_surgeon_name'] : null,
                'anesthetist_user_id' => isset($data['anesthetist_user_id']) ? intval($data['anesthetist_user_id']) : null,
                'anesthetist_name' => isset($data['anesthetist_name']) ? $data['anesthetist_name'] : null,
                'anesthesia_type' => isset($data['anesthesia_type']) ? $data['anesthesia_type'] : null,
                'estimated_duration_minutes' => isset($data['estimated_duration_minutes']) ? intval($data['estimated_duration_minutes']) : null,
                'asa_score' => isset($data['asa_score']) ? intval($data['asa_score']) : null,
                'notes' => isset($data['notes']) ? $data['notes'] : null,
                'status' => isset($data['status']) ? $data['status'] : 'Scheduled',
                'created_by_user_id' => isset($data['created_by_user_id']) ? intval($data['created_by_user_id']) : null
            );
            
            if ($this->db->insert('ipd_ot_schedules', $insert_data)) {
                return $this->db->insert_id();
            }
            
            return false;
        } catch (Exception $e) {
            log_message('error', 'Ipd_ot_schedule_model->create() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update OT schedule
     */
    public function update($id, $data) {
        try {
            $update_data = array();
            $allowed_fields = array(
                'ot_number', 'scheduled_date', 'scheduled_time', 'procedure_name', 'procedure_type',
                'surgeon_user_id', 'surgeon_name', 'assistant_surgeon_user_id', 'assistant_surgeon_name',
                'anesthetist_user_id', 'anesthetist_name', 'anesthesia_type',
                'estimated_duration_minutes', 'actual_duration_minutes',
                'status', 'start_time', 'end_time', 'complications', 'asa_score', 'notes'
            );
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    if (in_array($field, array('surgeon_user_id', 'assistant_surgeon_user_id', 'anesthetist_user_id', 
                        'estimated_duration_minutes', 'actual_duration_minutes', 'asa_score'))) {
                        $update_data[$field] = intval($data[$field]);
                    } else {
                        $update_data[$field] = $data[$field];
                    }
                }
            }
            
            if (empty($update_data)) {
                return false;
            }
            
            $this->db->where('id', $id);
            return $this->db->update('ipd_ot_schedules', $update_data);
        } catch (Exception $e) {
            log_message('error', 'Ipd_ot_schedule_model->update() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete OT schedule
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_ot_schedules');
    }

    /**
     * Check OT availability
     */
    public function check_availability($ot_number, $date, $start_time, $duration_minutes) {
        // Calculate end time
        $start_datetime = strtotime($date . ' ' . $start_time);
        $end_datetime = $start_datetime + ($duration_minutes * 60);
        $end_time = date('H:i:s', $end_datetime);
        
        $this->db->where('ot_number', $ot_number);
        $this->db->where('scheduled_date', $date);
        $this->db->where('status !=', 'Cancelled');
        $this->db->where('status !=', 'Postponed');
        
        // Check for overlapping schedules
        $this->db->group_start();
        $this->db->where("(
            (scheduled_time <= '" . $this->db->escape_str($start_time) . "' AND 
             ADDTIME(scheduled_time, SEC_TO_TIME(COALESCE(estimated_duration_minutes, 0) * 60)) > '" . $this->db->escape_str($start_time) . "') OR
            (scheduled_time < '" . $this->db->escape_str($end_time) . "' AND 
             ADDTIME(scheduled_time, SEC_TO_TIME(COALESCE(estimated_duration_minutes, 0) * 60)) >= '" . $this->db->escape_str($end_time) . "') OR
            (scheduled_time >= '" . $this->db->escape_str($start_time) . "' AND 
             scheduled_time < '" . $this->db->escape_str($end_time) . "')
        )", NULL, FALSE);
        $this->db->group_end();
        
        $query = $this->db->get('ipd_ot_schedules');
        $conflicts = $query->result_array();
        
        return array(
            'available' => empty($conflicts),
            'conflicts' => $conflicts
        );
    }

    /**
     * Start surgery
     */
    public function start_surgery($id, $start_time = null) {
        $update_data = array(
            'status' => 'In Progress',
            'start_time' => $start_time ? $start_time : date('H:i:s')
        );
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_ot_schedules', $update_data);
    }

    /**
     * Complete surgery
     */
    public function complete_surgery($id, $end_time = null, $actual_duration_minutes = null) {
        $schedule = $this->get_by_id($id);
        if (!$schedule) {
            return false;
        }
        
        $end_time = $end_time ? $end_time : date('H:i:s');
        
        // Calculate actual duration if not provided
        if ($actual_duration_minutes === null && $schedule['start_time']) {
            $start = strtotime($schedule['scheduled_date'] . ' ' . $schedule['start_time']);
            $end = strtotime($schedule['scheduled_date'] . ' ' . $end_time);
            $actual_duration_minutes = round(($end - $start) / 60);
        }
        
        $update_data = array(
            'status' => 'Completed',
            'end_time' => $end_time,
            'actual_duration_minutes' => $actual_duration_minutes
        );
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_ot_schedules', $update_data);
    }

    /**
     * Get operation theatres list
     */
    public function get_operation_theatres() {
        $this->db->where('status', 'active');
        $this->db->order_by('ot_number', 'ASC');
        $query = $this->db->get('operation_theatres');
        return $query->result_array();
    }
}

