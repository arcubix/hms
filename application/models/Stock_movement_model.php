<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stock_movement_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Create stock movement record
     */
    public function create($data) {
        if (empty($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }
        
        return $this->db->insert('stock_movements', $data);
    }

    /**
     * Get stock movements with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('sm.*, m.name as medicine_name, m.medicine_code, m.generic_name, u.name as created_by_name');
        $this->db->from('stock_movements sm');
        $this->db->join('medicines m', 'sm.medicine_id = m.id', 'left');
        $this->db->join('users u', 'sm.created_by = u.id', 'left');
        
        if (!empty($filters['medicine_id'])) {
            $this->db->where('sm.medicine_id', $filters['medicine_id']);
        }
        
        if (!empty($filters['movement_type'])) {
            $this->db->where('sm.movement_type', $filters['movement_type']);
        }
        
        if (!empty($filters['reference_type'])) {
            $this->db->where('sm.reference_type', $filters['reference_type']);
        }
        
        if (!empty($filters['reference_id'])) {
            $this->db->where('sm.reference_id', $filters['reference_id']);
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(sm.created_at) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(sm.created_at) <=', $filters['end_date']);
        }
        
        $this->db->order_by('sm.created_at', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get stock movement summary by type
     */
    public function get_summary_by_type($medicine_id = null, $start_date = null, $end_date = null) {
        $this->db->select('
            movement_type,
            SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as total_in,
            SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END) as total_out,
            COUNT(*) as movement_count
        ');
        $this->db->from('stock_movements');
        
        if ($medicine_id) {
            $this->db->where('medicine_id', $medicine_id);
        }
        
        if ($start_date) {
            $this->db->where('DATE(created_at) >=', $start_date);
        }
        
        if ($end_date) {
            $this->db->where('DATE(created_at) <=', $end_date);
        }
        
        $this->db->group_by('movement_type');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get stock audit trail for a medicine
     */
    public function get_audit_trail($medicine_id, $limit = 100) {
        $this->db->select('sm.*, m.name as medicine_name, u.name as created_by_name');
        $this->db->from('stock_movements sm');
        $this->db->join('medicines m', 'sm.medicine_id = m.id', 'left');
        $this->db->join('users u', 'sm.created_by = u.id', 'left');
        $this->db->where('sm.medicine_id', $medicine_id);
        $this->db->order_by('sm.created_at', 'DESC');
        $this->db->limit($limit);
        $query = $this->db->get();
        return $query->result_array();
    }
}

