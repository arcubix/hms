<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_bed_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all beds with filters
     */
    public function get_all($filters = []) {
        $this->db->select('
            ib.*,
            iw.name as ward_name,
            iw.type as ward_type,
            ia.ipd_number,
            ia.uhid,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('ipd_beds ib');
        $this->db->join('ipd_wards iw', 'iw.id = ib.ward_id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.bed_id = ib.id AND ia.status != "discharged"', 'left');
        $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
        
        // Apply filters
        if (!empty($filters['ward_id'])) {
            $this->db->where('ib.ward_id', $filters['ward_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('ib.status', $filters['status']);
        }
        
        if (!empty($filters['bed_type'])) {
            $this->db->where('ib.bed_type', $filters['bed_type']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ib.bed_number', $search);
            $this->db->or_like('iw.name', $search);
            $this->db->or_like('p.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('iw.name', 'ASC');
        $this->db->order_by('ib.bed_number', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get beds by ward
     */
    public function get_by_ward($ward_id) {
        return $this->get_all(array('ward_id' => $ward_id));
    }

    /**
     * Get bed by ID with patient info
     */
    public function get_by_id($id) {
        $this->db->select('
            ib.*,
            iw.name as ward_name,
            iw.type as ward_type,
            ia.id as admission_id,
            ia.ipd_number,
            ia.uhid,
            p.id as patient_id,
            p.name as patient_name,
            p.age as patient_age,
            p.gender as patient_gender
        ');
        $this->db->from('ipd_beds ib');
        $this->db->join('ipd_wards iw', 'iw.id = ib.ward_id', 'left');
        $this->db->join('ipd_admissions ia', 'ia.bed_id = ib.id AND ia.status != "discharged"', 'left');
        $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
        $this->db->where('ib.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get available beds
     */
    public function get_available($filters = []) {
        $filters['status'] = 'available';
        return $this->get_all($filters);
    }

    /**
     * Create new bed
     */
    public function create($data) {
        $bed_data = array(
            'ward_id' => $data['ward_id'],
            'bed_number' => $data['bed_number'],
            'bed_type' => $data['bed_type'] ?? 'General',
            'status' => $data['status'] ?? 'available',
            'daily_rate' => $data['daily_rate'] ?? 0.00,
            'facilities' => isset($data['facilities']) ? json_encode($data['facilities']) : null,
            'maintenance_notes' => $data['maintenance_notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        $this->db->insert('ipd_beds', $bed_data);
        return $this->db->insert_id();
    }

    /**
     * Update bed
     */
    public function update($id, $data) {
        if (isset($data['facilities']) && is_array($data['facilities'])) {
            $data['facilities'] = json_encode($data['facilities']);
        }
        
        $this->db->where('id', $id);
        return $this->db->update('ipd_beds', $data);
    }

    /**
     * Delete bed
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_beds');
    }

    /**
     * Assign bed to admission
     */
    public function assign($bed_id, $admission_id) {
        $this->db->where('id', $bed_id);
        return $this->db->update('ipd_beds', array(
            'status' => 'occupied',
            'current_admission_id' => $admission_id
        ));
    }

    /**
     * Release bed from admission
     */
    public function release($bed_id) {
        $this->db->where('id', $bed_id);
        return $this->db->update('ipd_beds', array(
            'status' => 'available',
            'current_admission_id' => null,
            'last_cleaned_at' => date('Y-m-d H:i:s')
        ));
    }
}

