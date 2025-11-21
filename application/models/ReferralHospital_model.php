<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ReferralHospital_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all referral hospitals with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('rh.*, u.name as created_by_name');
        $this->db->from('referral_hospitals rh');
        $this->db->join('users u', 'rh.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('rh.hospital_name', $search);
            $this->db->or_like('rh.address', $search);
            $this->db->or_like('rh.email', $search);
            $this->db->or_like('rh.associated_doctor', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('rh.status', $filters['status']);
        }
        
        // Apply specialty type filter
        if (!empty($filters['specialty_type'])) {
            $this->db->where('rh.specialty_type', $filters['specialty_type']);
        }
        
        $this->db->order_by('rh.hospital_name', 'ASC');
        $query = $this->db->get();
        $results = $query->result_array();
        
        // Decode JSON specialties for each result
        foreach ($results as &$result) {
            if (!empty($result['specialties'])) {
                $result['specialties'] = json_decode($result['specialties'], true);
            } else {
                $result['specialties'] = array();
            }
        }
        
        return $results;
    }

    /**
     * Get referral hospital by ID
     */
    public function get_by_id($id) {
        $this->db->select('rh.*, u.name as created_by_name');
        $this->db->from('referral_hospitals rh');
        $this->db->join('users u', 'rh.created_by = u.id', 'left');
        $this->db->where('rh.id', $id);
        $query = $this->db->get();
        $result = $query->row_array();
        
        // Decode JSON specialties
        if ($result && !empty($result['specialties'])) {
            $result['specialties'] = json_decode($result['specialties'], true);
        } elseif ($result) {
            $result['specialties'] = array();
        }
        
        return $result;
    }

    /**
     * Create referral hospital
     */
    public function create($data) {
        $insert_data = array(
            'hospital_name' => $data['hospital_name'],
            'specialty_type' => isset($data['specialty_type']) ? $data['specialty_type'] : 'Multi-Specialty',
            'address' => isset($data['address']) ? $data['address'] : null,
            'email' => isset($data['email']) ? $data['email'] : null,
            'phone' => isset($data['phone']) ? $data['phone'] : null,
            'associated_doctor' => isset($data['associated_doctor']) ? $data['associated_doctor'] : null,
            'specialties' => isset($data['specialties']) && is_array($data['specialties']) ? json_encode($data['specialties']) : null,
            'status' => isset($data['status']) ? $data['status'] : 'Active',
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('referral_hospitals', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update referral hospital
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['hospital_name'])) {
            $update_data['hospital_name'] = $data['hospital_name'];
        }
        if (isset($data['specialty_type'])) {
            $update_data['specialty_type'] = $data['specialty_type'];
        }
        if (isset($data['address'])) {
            $update_data['address'] = $data['address'];
        }
        if (isset($data['email'])) {
            $update_data['email'] = $data['email'];
        }
        if (isset($data['phone'])) {
            $update_data['phone'] = $data['phone'];
        }
        if (isset($data['associated_doctor'])) {
            $update_data['associated_doctor'] = $data['associated_doctor'];
        }
        if (isset($data['specialties'])) {
            if (is_array($data['specialties'])) {
                $update_data['specialties'] = json_encode($data['specialties']);
            } else {
                $update_data['specialties'] = $data['specialties'];
            }
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }

        $this->db->where('id', $id);
        return $this->db->update('referral_hospitals', $update_data);
    }

    /**
     * Delete referral hospital
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('referral_hospitals');
    }

    /**
     * Get all specialty types (distinct)
     */
    public function get_specialty_types() {
        $this->db->distinct();
        $this->db->select('specialty_type');
        $this->db->order_by('specialty_type', 'ASC');
        $query = $this->db->get('referral_hospitals');
        $results = $query->result_array();
        return array_column($results, 'specialty_type');
    }
}

