<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Emergency_transfer_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Create transfer record
     */
    public function create($data) {
        // Check if table exists
        if (!$this->db->table_exists('emergency_patient_transfers')) {
            log_message('error', 'emergency_patient_transfers table does not exist');
            return false;
        }
        
        // Validate required fields
        if (empty($data['emergency_visit_id'])) {
            log_message('error', 'emergency_visit_id is required for transfer');
            return false;
        }
        
        if (empty($data['reason'])) {
            log_message('error', 'reason is required for transfer');
            return false;
        }
        
        $transfer_data = array(
            'emergency_visit_id' => intval($data['emergency_visit_id']),
            'transfer_type' => $data['transfer_type'] ?? 'internal',
            'from_ward_id' => (isset($data['from_ward_id']) && $data['from_ward_id'] !== '' && intval($data['from_ward_id']) > 0) ? intval($data['from_ward_id']) : null,
            'from_bed_id' => (isset($data['from_bed_id']) && $data['from_bed_id'] !== '' && intval($data['from_bed_id']) > 0) ? intval($data['from_bed_id']) : null,
            'to_ward_id' => (isset($data['to_ward_id']) && $data['to_ward_id'] !== '' && intval($data['to_ward_id']) > 0) ? intval($data['to_ward_id']) : null,
            'to_bed_id' => (isset($data['to_bed_id']) && $data['to_bed_id'] !== '' && intval($data['to_bed_id']) > 0) ? intval($data['to_bed_id']) : null,
            'external_facility_name' => isset($data['external_facility_name']) ? $data['external_facility_name'] : null,
            'external_facility_address' => isset($data['external_facility_address']) ? $data['external_facility_address'] : null,
            'external_facility_contact' => isset($data['external_facility_contact']) ? $data['external_facility_contact'] : null,
            'transport_mode' => isset($data['transport_mode']) ? $data['transport_mode'] : null,
            'reason' => $data['reason'],
            'doctor_notes' => isset($data['doctor_notes']) ? $data['doctor_notes'] : null,
            'transfer_date' => isset($data['transfer_date']) ? $data['transfer_date'] : date('Y-m-d'),
            'transfer_time' => isset($data['transfer_time']) ? $data['transfer_time'] : date('H:i:s'),
            'transferred_by' => isset($data['transferred_by']) ? intval($data['transferred_by']) : null,
            'status' => $data['status'] ?? 'Pending'
        );
        
        // Additional validation for internal transfers
        if ($transfer_data['transfer_type'] === 'internal') {
            if (empty($transfer_data['to_ward_id']) || $transfer_data['to_ward_id'] <= 0) {
                log_message('error', 'Internal transfer requires valid to_ward_id');
                return false;
            }
            if (empty($transfer_data['to_bed_id']) || $transfer_data['to_bed_id'] <= 0) {
                log_message('error', 'Internal transfer requires valid to_bed_id');
                return false;
            }
        }
        
        // Log the insert data for debugging
        log_message('debug', 'Inserting transfer record: ' . json_encode($transfer_data));
        
        if ($this->db->insert('emergency_patient_transfers', $transfer_data)) {
            $transfer_id = $this->db->insert_id();
            log_message('debug', 'Transfer record created with ID: ' . $transfer_id);
            
            // If internal transfer, update bed assignments
            if ($transfer_data['transfer_type'] === 'internal' && $transfer_id) {
                if ($this->db->table_exists('emergency_ward_beds')) {
                    $this->load->model('Emergency_ward_bed_model');
                    
                    // Release from bed
                    if ($transfer_data['from_bed_id']) {
                        $this->Emergency_ward_bed_model->release_bed($transfer_data['from_bed_id']);
                    }
                    
                    // Assign to bed
                    if ($transfer_data['to_bed_id'] && $transfer_data['emergency_visit_id']) {
                        $this->Emergency_ward_bed_model->assign_patient($transfer_data['to_bed_id'], $transfer_data['emergency_visit_id']);
                    }
                }
            }
            
            return $transfer_id;
        } else {
            $error = $this->db->error();
            log_message('error', 'Failed to insert transfer record: ' . json_encode($error));
            return false;
        }
    }

    /**
     * Get transfers for a visit
     */
    public function get_by_visit($visit_id) {
        if (!$this->db->table_exists('emergency_patient_transfers')) {
            return array();
        }
        
        $this->db->select('
            ept.*,
            from_ward.name as from_ward_name,
            to_ward.name as to_ward_name,
            from_bed.bed_number as from_bed_number,
            to_bed.bed_number as to_bed_number,
            u.name as transferred_by_name
        ');
        $this->db->from('emergency_patient_transfers ept');
        $this->db->join('emergency_wards from_ward', 'from_ward.id = ept.from_ward_id', 'left');
        $this->db->join('emergency_wards to_ward', 'to_ward.id = ept.to_ward_id', 'left');
        $this->db->join('emergency_ward_beds from_bed', 'from_bed.id = ept.from_bed_id', 'left');
        $this->db->join('emergency_ward_beds to_bed', 'to_bed.id = ept.to_bed_id', 'left');
        $this->db->join('users u', 'u.id = ept.transferred_by', 'left');
        $this->db->where('ept.emergency_visit_id', $visit_id);
        $this->db->order_by('ept.transfer_date', 'DESC');
        $this->db->order_by('ept.transfer_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get all transfers with filters
     */
    public function get_all($filters = []) {
        if (!$this->db->table_exists('emergency_patient_transfers')) {
            return array();
        }
        
        $this->db->select('
            ept.*,
            ev.er_number,
            ev.uhid,
            p.name as patient_name,
            from_ward.name as from_ward_name,
            to_ward.name as to_ward_name,
            from_bed.bed_number as from_bed_number,
            to_bed.bed_number as to_bed_number,
            u.name as transferred_by_name
        ');
        $this->db->from('emergency_patient_transfers ept');
        $this->db->join('emergency_visits ev', 'ev.id = ept.emergency_visit_id', 'left');
        $this->db->join('patients p', 'p.id = ev.patient_id', 'left');
        $this->db->join('emergency_wards from_ward', 'from_ward.id = ept.from_ward_id', 'left');
        $this->db->join('emergency_wards to_ward', 'to_ward.id = ept.to_ward_id', 'left');
        $this->db->join('emergency_ward_beds from_bed', 'from_bed.id = ept.from_bed_id', 'left');
        $this->db->join('emergency_ward_beds to_bed', 'to_bed.id = ept.to_bed_id', 'left');
        $this->db->join('users u', 'u.id = ept.transferred_by', 'left');
        
        // Apply filters
        if (!empty($filters['id'])) {
            $this->db->where('ept.id', $filters['id']);
        }
        
        if (!empty($filters['transfer_type'])) {
            $this->db->where('ept.transfer_type', $filters['transfer_type']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('ept.status', $filters['status']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('ept.transfer_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('ept.transfer_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ev.er_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('from_ward.name', $search);
            $this->db->or_like('to_ward.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ept.transfer_date', 'DESC');
        $this->db->order_by('ept.transfer_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update transfer status
     */
    public function update_status($id, $status) {
        $this->db->where('id', $id);
        $this->db->update('emergency_patient_transfers', array('status' => $status));
        return $this->db->affected_rows() > 0;
    }
}
