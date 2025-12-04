<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_transfer_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all transfers for an admission
     */
    public function get_by_admission($admission_id) {
        $this->db->select('
            it.*,
            iw1.name as from_ward_name,
            iw2.name as to_ward_name,
            ib1.bed_number as from_bed_number,
            ib2.bed_number as to_bed_number,
            ir1.room_number as from_room_number,
            ir2.room_number as to_room_number,
            u.name as transferred_by_name
        ');
        $this->db->from('ipd_transfers it');
        $this->db->join('ipd_wards iw1', 'iw1.id = it.from_ward_id', 'left');
        $this->db->join('ipd_wards iw2', 'iw2.id = it.to_ward_id', 'left');
        $this->db->join('ipd_beds ib1', 'ib1.id = it.from_bed_id', 'left');
        $this->db->join('ipd_beds ib2', 'ib2.id = it.to_bed_id', 'left');
        $this->db->join('ipd_rooms ir1', 'ir1.id = it.from_room_id', 'left');
        $this->db->join('ipd_rooms ir2', 'ir2.id = it.to_room_id', 'left');
        $this->db->join('users u', 'u.id = it.transferred_by_user_id', 'left');
        $this->db->where('it.admission_id', $admission_id);
        $this->db->order_by('it.transfer_date', 'DESC');
        $this->db->order_by('it.transfer_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get transfer by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            it.*,
            iw1.name as from_ward_name,
            iw2.name as to_ward_name,
            ib1.bed_number as from_bed_number,
            ib2.bed_number as to_bed_number,
            ir1.room_number as from_room_number,
            ir2.room_number as to_room_number,
            u.name as transferred_by_name
        ');
        $this->db->from('ipd_transfers it');
        $this->db->join('ipd_wards iw1', 'iw1.id = it.from_ward_id', 'left');
        $this->db->join('ipd_wards iw2', 'iw2.id = it.to_ward_id', 'left');
        $this->db->join('ipd_beds ib1', 'ib1.id = it.from_bed_id', 'left');
        $this->db->join('ipd_beds ib2', 'ib2.id = it.to_bed_id', 'left');
        $this->db->join('ipd_rooms ir1', 'ir1.id = it.from_room_id', 'left');
        $this->db->join('ipd_rooms ir2', 'ir2.id = it.to_room_id', 'left');
        $this->db->join('users u', 'u.id = it.transferred_by_user_id', 'left');
        $this->db->where('it.id', $id);
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create transfer record
     */
    public function create($data) {
        $transfer_data = array(
            'admission_id' => $data['admission_id'],
            'patient_id' => $data['patient_id'],
            'transfer_date' => $data['transfer_date'] ?? date('Y-m-d'),
            'transfer_time' => $data['transfer_time'] ?? date('H:i:s'),
            'from_ward_id' => $data['from_ward_id'] ?? null,
            'from_bed_id' => $data['from_bed_id'] ?? null,
            'from_room_id' => $data['from_room_id'] ?? null,
            'to_ward_id' => $data['to_ward_id'] ?? null,
            'to_bed_id' => $data['to_bed_id'] ?? null,
            'to_room_id' => $data['to_room_id'] ?? null,
            'transfer_reason' => $data['transfer_reason'] ?? null,
            'transferred_by_user_id' => $data['transferred_by_user_id'] ?? null,
            'notes' => $data['notes'] ?? null
        );
        
        $this->db->insert('ipd_transfers', $transfer_data);
        $transfer_id = $this->db->insert_id();
        
        // Update admission with new bed/room assignment
        if ($transfer_id) {
            $this->load->model('Ipd_admission_model');
            $update_data = array();
            
            if (!empty($data['to_ward_id'])) {
                $update_data['ward_id'] = $data['to_ward_id'];
            }
            if (!empty($data['to_bed_id'])) {
                $update_data['bed_id'] = $data['to_bed_id'];
                // Release old bed
                if (!empty($data['from_bed_id'])) {
                    $this->load->model('Ipd_bed_model');
                    $this->Ipd_bed_model->release($data['from_bed_id']);
                }
                // Assign new bed
                $this->load->model('Ipd_bed_model');
                $this->Ipd_bed_model->assign($data['to_bed_id'], $data['admission_id']);
            }
            if (!empty($data['to_room_id'])) {
                $update_data['room_id'] = $data['to_room_id'];
                // Release old room
                if (!empty($data['from_room_id'])) {
                    $this->load->model('Ipd_room_model');
                    $this->Ipd_room_model->release($data['from_room_id']);
                }
                // Assign new room
                $this->load->model('Ipd_room_model');
                $this->Ipd_room_model->assign($data['to_room_id'], $data['admission_id']);
            }
            
            if (!empty($update_data)) {
                $this->Ipd_admission_model->update($data['admission_id'], $update_data);
            }
        }
        
        return $transfer_id;
    }

    /**
     * Delete transfer
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_transfers');
    }
}

