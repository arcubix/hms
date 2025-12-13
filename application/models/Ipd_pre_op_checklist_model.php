<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_pre_op_checklist_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get pre-op checklist by ID
     */
    public function get_by_id($id) {
        $this->db->select('c.*, 
            u.name as completed_by_name');
        $this->db->from('ipd_pre_op_checklist c');
        $this->db->join('users u', 'c.completed_by_user_id = u.id', 'left');
        $this->db->where('c.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get pre-op checklist by OT schedule ID
     */
    public function get_by_ot_schedule($ot_schedule_id) {
        $this->db->select('c.*, 
            u.name as completed_by_name');
        $this->db->from('ipd_pre_op_checklist c');
        $this->db->join('users u', 'c.completed_by_user_id = u.id', 'left');
        $this->db->where('c.ot_schedule_id', $ot_schedule_id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create pre-op checklist
     */
    public function create($data) {
        try {
            // Validate required fields
            if (empty($data['ot_schedule_id']) || empty($data['admission_id']) || empty($data['patient_id'])) {
                log_message('error', 'Ipd_pre_op_checklist_model->create(): Required fields missing');
                return false;
            }
            
            $insert_data = array(
                'ot_schedule_id' => intval($data['ot_schedule_id']),
                'admission_id' => intval($data['admission_id']),
                'patient_id' => intval($data['patient_id']),
                
                // Patient Preparation
                'npo_status' => isset($data['npo_status']) ? (bool)$data['npo_status'] : false,
                'pre_op_medications_given' => isset($data['pre_op_medications_given']) ? (bool)$data['pre_op_medications_given'] : false,
                'blood_work_completed' => isset($data['blood_work_completed']) ? (bool)$data['blood_work_completed'] : false,
                'imaging_completed' => isset($data['imaging_completed']) ? (bool)$data['imaging_completed'] : false,
                'consent_signed' => isset($data['consent_signed']) ? (bool)$data['consent_signed'] : false,
                'patient_identified' => isset($data['patient_identified']) ? (bool)$data['patient_identified'] : false,
                
                // Equipment Preparation
                'instruments_ready' => isset($data['instruments_ready']) ? (bool)$data['instruments_ready'] : false,
                'consumables_available' => isset($data['consumables_available']) ? (bool)$data['consumables_available'] : false,
                'equipment_tested' => isset($data['equipment_tested']) ? (bool)$data['equipment_tested'] : false,
                'implants_available' => isset($data['implants_available']) ? (bool)$data['implants_available'] : false,
                
                // Team Preparation
                'team_briefed' => isset($data['team_briefed']) ? (bool)$data['team_briefed'] : false,
                'anesthesia_ready' => isset($data['anesthesia_ready']) ? (bool)$data['anesthesia_ready'] : false,
                
                // Status
                'checklist_completed' => isset($data['checklist_completed']) ? (bool)$data['checklist_completed'] : false,
                'completed_by_user_id' => isset($data['completed_by_user_id']) ? intval($data['completed_by_user_id']) : null,
                'completed_at' => isset($data['checklist_completed']) && $data['checklist_completed'] ? date('Y-m-d H:i:s') : null,
                'notes' => isset($data['notes']) ? $data['notes'] : null
            );
            
            if ($this->db->insert('ipd_pre_op_checklist', $insert_data)) {
                return $this->db->insert_id();
            }
            
            return false;
        } catch (Exception $e) {
            log_message('error', 'Ipd_pre_op_checklist_model->create() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update pre-op checklist
     */
    public function update($id, $data) {
        try {
            $update_data = array();
            $allowed_fields = array(
                'npo_status', 'pre_op_medications_given', 'blood_work_completed', 'imaging_completed',
                'consent_signed', 'patient_identified',
                'instruments_ready', 'consumables_available', 'equipment_tested', 'implants_available',
                'team_briefed', 'anesthesia_ready',
                'checklist_completed', 'completed_by_user_id', 'notes'
            );
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    if (in_array($field, array('npo_status', 'pre_op_medications_given', 'blood_work_completed',
                        'imaging_completed', 'consent_signed', 'patient_identified', 'instruments_ready',
                        'consumables_available', 'equipment_tested', 'implants_available', 'team_briefed',
                        'anesthesia_ready', 'checklist_completed'))) {
                        $update_data[$field] = (bool)$data[$field];
                    } elseif ($field === 'completed_by_user_id') {
                        $update_data[$field] = intval($data[$field]);
                    } else {
                        $update_data[$field] = $data[$field];
                    }
                }
            }
            
            // Set completed_at timestamp if checklist_completed is being set to true
            if (isset($update_data['checklist_completed']) && $update_data['checklist_completed']) {
                $update_data['completed_at'] = date('Y-m-d H:i:s');
                if (!isset($update_data['completed_by_user_id'])) {
                    // Get current user from session if available
                    $user_id = $this->session->userdata('user_id');
                    if ($user_id) {
                        $update_data['completed_by_user_id'] = $user_id;
                    }
                }
            } elseif (isset($update_data['checklist_completed']) && !$update_data['checklist_completed']) {
                $update_data['completed_at'] = null;
                $update_data['completed_by_user_id'] = null;
            }
            
            if (empty($update_data)) {
                return false;
            }
            
            $this->db->where('id', $id);
            return $this->db->update('ipd_pre_op_checklist', $update_data);
        } catch (Exception $e) {
            log_message('error', 'Ipd_pre_op_checklist_model->update() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create or update pre-op checklist
     */
    public function create_or_update($ot_schedule_id, $data) {
        $existing = $this->get_by_ot_schedule($ot_schedule_id);
        
        if ($existing) {
            return $this->update($existing['id'], $data);
        } else {
            $data['ot_schedule_id'] = $ot_schedule_id;
            return $this->create($data);
        }
    }

    /**
     * Delete pre-op checklist
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_pre_op_checklist');
    }
}

