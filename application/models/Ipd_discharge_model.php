<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_discharge_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get discharge summary by admission ID
     */
    public function get_by_admission($admission_id) {
        $this->db->select('
            ids.*,
            d1.name as discharging_doctor_name,
            d2.name as follow_up_doctor_name,
            u.name as created_by_name
        ');
        $this->db->from('ipd_discharge_summaries ids');
        $this->db->join('doctors d1', 'd1.id = ids.discharging_doctor_id', 'left');
        $this->db->join('doctors d2', 'd2.id = ids.follow_up_doctor_id', 'left');
        $this->db->join('users u', 'u.id = ids.created_by', 'left');
        $this->db->where('ids.admission_id', $admission_id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get discharge summary by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            ids.*,
            d1.name as discharging_doctor_name,
            d2.name as follow_up_doctor_name,
            u.name as created_by_name
        ');
        $this->db->from('ipd_discharge_summaries ids');
        $this->db->join('doctors d1', 'd1.id = ids.discharging_doctor_id', 'left');
        $this->db->join('doctors d2', 'd2.id = ids.follow_up_doctor_id', 'left');
        $this->db->join('users u', 'u.id = ids.created_by', 'left');
        $this->db->where('ids.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create discharge summary
     */
    public function create($data) {
        $discharge_data = array(
            'admission_id' => $data['admission_id'],
            'patient_id' => $data['patient_id'],
            'discharge_date' => $data['discharge_date'] ?? date('Y-m-d'),
            'discharge_time' => $data['discharge_time'] ?? date('H:i:s'),
            'admitting_diagnosis' => $data['admitting_diagnosis'] ?? null,
            'final_diagnosis' => $data['final_diagnosis'],
            'treatment_given' => $data['treatment_given'],
            'procedures_performed' => isset($data['procedures_performed']) ? json_encode($data['procedures_performed']) : null,
            'condition_at_discharge' => $data['condition_at_discharge'],
            'discharge_advice' => $data['discharge_advice'],
            'medications' => isset($data['medications']) ? json_encode($data['medications']) : null,
            'follow_up_date' => $data['follow_up_date'] ?? null,
            'follow_up_doctor_id' => $data['follow_up_doctor_id'] ?? null,
            'dietary_advice' => $data['dietary_advice'] ?? null,
            'activity_restrictions' => $data['activity_restrictions'] ?? null,
            'discharging_doctor_id' => $data['discharging_doctor_id'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('ipd_discharge_summaries', $discharge_data);
        $discharge_id = $this->db->insert_id();
        
        // Update admission status and discharge date
        if ($discharge_id) {
            $this->load->model('Ipd_admission_model');
            $this->Ipd_admission_model->update($data['admission_id'], array(
                'status' => 'discharged',
                'discharge_date' => $data['discharge_date'] ?? date('Y-m-d'),
                'discharge_time' => $data['discharge_time'] ?? date('H:i:s')
            ));
            
            // Release bed/room
            $admission = $this->Ipd_admission_model->get_by_id($data['admission_id']);
            if ($admission) {
                if ($admission['bed_id']) {
                    $this->load->model('Ipd_bed_model');
                    $this->Ipd_bed_model->release($admission['bed_id']);
                }
                if ($admission['room_id']) {
                    $this->load->model('Ipd_room_model');
                    $this->Ipd_room_model->release($admission['room_id']);
                }
            }
        }
        
        return $discharge_id;
    }

    /**
     * Update discharge summary
     */
    public function update($id, $data) {
        if (isset($data['procedures_performed']) && is_array($data['procedures_performed'])) {
            $data['procedures_performed'] = json_encode($data['procedures_performed']);
        }
        
        if (isset($data['medications']) && is_array($data['medications'])) {
            $data['medications'] = json_encode($data['medications']);
        }
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_discharge_summaries', $data);
    }

    /**
     * Delete discharge summary
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_discharge_summaries');
    }
}

