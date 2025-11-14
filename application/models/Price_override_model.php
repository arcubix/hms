<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Price_override_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get override by ID
     */
    public function get_by_id($id) {
        $this->db->select('po.*, u1.name as requested_by_name, u2.name as authorized_by_name, m.name as medicine_name');
        $this->db->from('price_overrides po');
        $this->db->join('users u1', 'po.requested_by = u1.id', 'left');
        $this->db->join('users u2', 'po.authorized_by = u2.id', 'left');
        $this->db->join('medicines m', 'po.medicine_id = m.id', 'left');
        $this->db->where('po.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get all overrides
     */
    public function get_all($filters = array()) {
        $this->db->select('po.*, u1.name as requested_by_name, u2.name as authorized_by_name, m.name as medicine_name');
        $this->db->from('price_overrides po');
        $this->db->join('users u1', 'po.requested_by = u1.id', 'left');
        $this->db->join('users u2', 'po.authorized_by = u2.id', 'left');
        $this->db->join('medicines m', 'po.medicine_id = m.id', 'left');
        
        if (!empty($filters['status'])) {
            $this->db->where('po.status', $filters['status']);
        }
        
        if (!empty($filters['sale_id'])) {
            $this->db->where('po.sale_id', $filters['sale_id']);
        }
        
        $this->db->order_by('po.created_at', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get pending overrides
     */
    public function get_pending() {
        $this->db->where('status', 'Pending');
        $this->db->order_by('created_at', 'ASC');
        $query = $this->db->get('price_overrides');
        return $query->result_array();
    }

    /**
     * Create price override request
     */
    public function create($data) {
        $override_data = array(
            'sale_id' => $data['sale_id'] ?? null,
            'sale_item_id' => $data['sale_item_id'] ?? null,
            'medicine_id' => $data['medicine_id'],
            'original_price' => $data['original_price'],
            'override_price' => $data['override_price'],
            'override_reason' => $data['override_reason'],
            'requested_by' => $data['requested_by'],
            'status' => 'Pending',
            'notes' => $data['notes'] ?? null
        );
        
        if ($this->db->insert('price_overrides', $override_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Approve price override
     */
    public function approve($id, $authorized_by) {
        $this->db->where('id', $id);
        $this->db->where('status', 'Pending');
        $update_data = array(
            'status' => 'Approved',
            'authorized_by' => $authorized_by,
            'authorized_at' => date('Y-m-d H:i:s')
        );
        
        if ($this->db->update('price_overrides', $update_data)) {
            return true;
        }
        return false;
    }

    /**
     * Reject price override
     */
    public function reject($id, $authorized_by) {
        $this->db->where('id', $id);
        $this->db->where('status', 'Pending');
        $update_data = array(
            'status' => 'Rejected',
            'authorized_by' => $authorized_by,
            'authorized_at' => date('Y-m-d H:i:s')
        );
        
        if ($this->db->update('price_overrides', $update_data)) {
            return true;
        }
        return false;
    }
}

