<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Emergency_ambulance_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Create ambulance request
     */
    public function create_request($data) {
        $request_data = array(
            'emergency_visit_id' => $data['emergency_visit_id'],
            'service_type' => $data['service_type'] ?? 'BLS',
            'priority' => $data['priority'] ?? 'Emergency',
            'destination' => $data['destination'],
            'destination_address' => $data['destination_address'] ?? null,
            'pickup_date' => $data['pickup_date'] ?? date('Y-m-d'),
            'pickup_time' => $data['pickup_time'] ?? date('H:i:s'),
            'medical_requirements' => isset($data['medical_requirements']) ? json_encode($data['medical_requirements']) : null,
            'contact_person' => $data['contact_person'] ?? null,
            'additional_notes' => $data['additional_notes'] ?? null,
            'status' => $data['status'] ?? 'Requested',
            'requested_by' => $data['requested_by'] ?? null
        );
        
        $this->db->insert('emergency_ambulance_requests', $request_data);
        return $this->db->insert_id();
    }

    /**
     * Get all requests with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            ear.*,
            ev.er_number,
            ev.uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender,
            u.name as requested_by_name
        ');
        $this->db->from('emergency_ambulance_requests ear');
        $this->db->join('emergency_visits ev', 'ev.id = ear.emergency_visit_id', 'left');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->join('users u', 'u.id = ear.requested_by', 'left');
        
        // Apply filters
        if (!empty($filters['status'])) {
            $this->db->where('ear.status', $filters['status']);
        }
        
        if (!empty($filters['service_type'])) {
            $this->db->where('ear.service_type', $filters['service_type']);
        }
        
        if (!empty($filters['priority'])) {
            $this->db->where('ear.priority', $filters['priority']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('ear.pickup_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('ear.pickup_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ev.er_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('ear.destination', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ear.pickup_date', 'DESC');
        $this->db->order_by('ear.pickup_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get requests for a visit
     */
    public function get_by_visit($visit_id) {
        $this->db->select('
            ear.*,
            u.name as requested_by_name
        ');
        $this->db->from('emergency_ambulance_requests ear');
        $this->db->join('users u', 'u.id = ear.requested_by', 'left');
        $this->db->where('ear.emergency_visit_id', $visit_id);
        $this->db->order_by('ear.created_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update request status
     */
    public function update_status($id, $status) {
        $update_data = array('status' => $status);
        
        if ($status === 'Dispatched') {
            $update_data['dispatched_at'] = date('Y-m-d H:i:s');
        } elseif ($status === 'Completed') {
            $update_data['completed_at'] = date('Y-m-d H:i:s');
        }
        
        $this->db->where('id', $id);
        $this->db->update('emergency_ambulance_requests', $update_data);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Get available ambulances (mock - can be extended with actual ambulance tracking)
     */
    public function get_available_ambulances() {
        // This is a placeholder - in a real system, this would check actual ambulance availability
        // For now, return mock data or integrate with ambulance tracking system
        
        $available = array(
            array(
                'id' => 1,
                'ambulance_number' => 'AMB-001',
                'service_type' => 'BLS',
                'status' => 'Available',
                'location' => 'Hospital Grounds'
            ),
            array(
                'id' => 2,
                'ambulance_number' => 'AMB-002',
                'service_type' => 'ALS',
                'status' => 'Available',
                'location' => 'Hospital Grounds'
            ),
            array(
                'id' => 3,
                'ambulance_number' => 'AMB-003',
                'service_type' => 'Critical Care',
                'status' => 'Available',
                'location' => 'Hospital Grounds'
            )
        );
        
        return $available;
    }
}
