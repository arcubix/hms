<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_nursing_note_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all nursing notes for an admission
     */
    public function get_by_admission($admission_id) {
        $this->db->select('
            inn.*,
            u.name as nurse_name
        ');
        $this->db->from('ipd_nursing_notes inn');
        $this->db->join('users u', 'u.id = inn.nurse_user_id', 'left');
        $this->db->where('inn.admission_id', $admission_id);
        $this->db->order_by('inn.date', 'DESC');
        $this->db->order_by('inn.time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get nursing note by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            inn.*,
            u.name as nurse_name
        ');
        $this->db->from('ipd_nursing_notes inn');
        $this->db->join('users u', 'u.id = inn.nurse_user_id', 'left');
        $this->db->where('inn.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new nursing note
     */
    public function create($data) {
        $note_data = array(
            'admission_id' => $data['admission_id'],
            'patient_id' => $data['patient_id'],
            'date' => $data['date'] ?? date('Y-m-d'),
            'time' => $data['time'] ?? date('H:i:s'),
            'shift' => $data['shift'] ?? 'Morning',
            'nurse_user_id' => $data['nurse_user_id'] ?? null,
            'category' => $data['category'] ?? 'General',
            'note' => $data['note'],
            'severity' => $data['severity'] ?? null
        );
        
        $this->db->insert('ipd_nursing_notes', $note_data);
        return $this->db->insert_id();
    }

    /**
     * Update nursing note
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('ipd_nursing_notes', $data);
    }

    /**
     * Delete nursing note
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_nursing_notes');
    }
}

