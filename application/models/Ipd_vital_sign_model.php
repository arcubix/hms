<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_vital_sign_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all vital signs for an admission
     */
    public function get_by_admission($admission_id) {
        $this->db->select('
            ivs.*,
            u.name as recorded_by_name
        ');
        $this->db->from('ipd_vital_signs ivs');
        $this->db->join('users u', 'u.id = ivs.recorded_by_user_id', 'left');
        $this->db->where('ivs.admission_id', $admission_id);
        $this->db->order_by('ivs.recorded_date', 'DESC');
        $this->db->order_by('ivs.recorded_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get vital signs by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            ivs.*,
            u.name as recorded_by_name
        ');
        $this->db->from('ipd_vital_signs ivs');
        $this->db->join('users u', 'u.id = ivs.recorded_by_user_id', 'left');
        $this->db->where('ivs.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new vital signs record
     */
    public function create($data) {
        $vital_data = array(
            'admission_id' => $data['admission_id'],
            'patient_id' => $data['patient_id'],
            'recorded_date' => $data['recorded_date'] ?? date('Y-m-d'),
            'recorded_time' => $data['recorded_time'] ?? date('H:i:s'),
            'recorded_by_user_id' => $data['recorded_by_user_id'] ?? null,
            'temperature' => $data['temperature'] ?? null,
            'blood_pressure_systolic' => $data['blood_pressure_systolic'] ?? null,
            'blood_pressure_diastolic' => $data['blood_pressure_diastolic'] ?? null,
            'heart_rate' => $data['heart_rate'] ?? null,
            'respiratory_rate' => $data['respiratory_rate'] ?? null,
            'oxygen_saturation' => $data['oxygen_saturation'] ?? null,
            'blood_sugar' => $data['blood_sugar'] ?? null,
            'pain_score' => $data['pain_score'] ?? null,
            'consciousness_level' => $data['consciousness_level'] ?? 'Alert',
            'notes' => $data['notes'] ?? null
        );
        
        $this->db->insert('ipd_vital_signs', $vital_data);
        return $this->db->insert_id();
    }

    /**
     * Update vital signs
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('ipd_vital_signs', $data);
    }

    /**
     * Delete vital signs
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_vital_signs');
    }

    /**
     * Get latest vital signs for admission
     */
    public function get_latest($admission_id) {
        $this->db->where('admission_id', $admission_id);
        $this->db->order_by('recorded_date', 'DESC');
        $this->db->order_by('recorded_time', 'DESC');
        $this->db->limit(1);
        
        $query = $this->db->get('ipd_vital_signs');
        return $query->row_array();
    }
}

