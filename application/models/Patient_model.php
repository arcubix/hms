<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Patient_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all patients with optional filters
     */
    public function get_all($filters = []) {
        $this->db->select('id, patient_id, name, email, phone, age, gender, date_of_birth, address, city, state, zip_code, blood_group, status, created_at');
        
        // Apply search filter (phone, name, or patient_id)
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('phone', $search);
            $this->db->or_like('name', $search);
            $this->db->or_like('patient_id', $search);
            $this->db->group_end();
        }
        
        // Apply phone filter (exact or partial match)
        if (!empty($filters['phone'])) {
            $phone = $this->db->escape_like_str($filters['phone']);
            $this->db->like('phone', $phone);
        }
        
        $this->db->order_by('created_at', 'DESC');
        $query = $this->db->get('patients');
        return $query->result_array();
    }

    /**
     * Get patient by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('patients', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Get patient by patient_id
     */
    public function get_by_patient_id($patient_id) {
        $query = $this->db->get_where('patients', array('patient_id' => $patient_id));
        return $query->row_array();
    }

    /**
     * Create patient
     */
    public function create($data) {
        // Prepare data
        $insert_data = array(
            'patient_id' => $data['patient_id'],
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'],
            'age' => $data['age'],
            'gender' => $data['gender'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'zip_code' => $data['zip_code'] ?? null,
            'blood_group' => $data['blood_group'] ?? null,
            'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            'status' => $data['status'] ?? 'Active',
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );

        if ($this->db->insert('patients', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update patient
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('patients', $data);
    }

    /**
     * Delete patient
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('patients');
    }

    /**
     * Generate unique patient ID
     */
    public function generate_patient_id() {
        // Get the last patient ID
        $this->db->select('patient_id');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('patients');
        $last_patient = $query->row_array();

        if ($last_patient && preg_match('/P(\d+)/', $last_patient['patient_id'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }

        return 'P' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    }
}

