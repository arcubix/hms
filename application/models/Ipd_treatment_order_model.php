<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_treatment_order_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all treatment orders for an admission
     */
    public function get_by_admission($admission_id) {
        $this->db->select('
            ito.*,
            d.name as ordered_by_doctor_name,
            d.specialty as ordered_by_doctor_specialty,
            u.name as administered_by_name
        ');
        $this->db->from('ipd_treatment_orders ito');
        $this->db->join('doctors d', 'd.id = ito.ordered_by_doctor_id', 'left');
        $this->db->join('users u', 'u.id = ito.administered_by_user_id', 'left');
        $this->db->where('ito.admission_id', $admission_id);
        $this->db->order_by('ito.order_date', 'DESC');
        $this->db->order_by('ito.order_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get treatment order by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            ito.*,
            d.name as ordered_by_doctor_name,
            d.specialty as ordered_by_doctor_specialty,
            u.name as administered_by_name
        ');
        $this->db->from('ipd_treatment_orders ito');
        $this->db->join('doctors d', 'd.id = ito.ordered_by_doctor_id', 'left');
        $this->db->join('users u', 'u.id = ito.administered_by_user_id', 'left');
        $this->db->where('ito.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create new treatment order
     */
    public function create($data) {
        $order_data = array(
            'admission_id' => $data['admission_id'],
            'patient_id' => $data['patient_id'],
            'order_date' => $data['order_date'] ?? date('Y-m-d'),
            'order_time' => $data['order_time'] ?? date('H:i:s'),
            'ordered_by_doctor_id' => $data['ordered_by_doctor_id'] ?? null,
            'order_type' => $data['order_type'],
            'order_details' => $data['order_details'],
            'frequency' => $data['frequency'] ?? null,
            'duration' => $data['duration'] ?? null,
            'priority' => $data['priority'] ?? 'routine',
            'status' => $data['status'] ?? 'pending',
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'administered_by_user_id' => $data['administered_by_user_id'] ?? null,
            'notes' => $data['notes'] ?? null
        );
        
        $this->db->insert('ipd_treatment_orders', $order_data);
        return $this->db->insert_id();
    }

    /**
     * Update treatment order
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('ipd_treatment_orders', $data);
    }

    /**
     * Delete treatment order
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_treatment_orders');
    }

    /**
     * Update order status
     */
    public function update_status($id, $status, $administered_by = null) {
        $update_data = array('status' => $status);
        if ($administered_by) {
            $update_data['administered_by_user_id'] = $administered_by;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_treatment_orders', $update_data);
    }
}

