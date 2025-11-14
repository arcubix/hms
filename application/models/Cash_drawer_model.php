<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cash_drawer_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get drawer by ID
     */
    public function get_by_id($id) {
        $this->db->select('cd.*, u1.name as opened_by_name, u2.name as closed_by_name');
        $this->db->from('cash_drawers cd');
        $this->db->join('users u1', 'cd.opened_by = u1.id', 'left');
        $this->db->join('users u2', 'cd.closed_by = u2.id', 'left');
        $this->db->where('cd.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get drawer by drawer number
     */
    public function get_by_drawer_number($drawer_number) {
        $this->db->where('drawer_number', $drawer_number);
        $query = $this->db->get('cash_drawers');
        return $query->row_array();
    }

    /**
     * Get all drawers
     */
    public function get_all($filters = array()) {
        $this->db->select('cd.*, u1.name as opened_by_name, u2.name as closed_by_name');
        $this->db->from('cash_drawers cd');
        $this->db->join('users u1', 'cd.opened_by = u1.id', 'left');
        $this->db->join('users u2', 'cd.closed_by = u2.id', 'left');
        
        if (!empty($filters['status'])) {
            $this->db->where('cd.status', $filters['status']);
        }
        
        $this->db->order_by('cd.created_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get open drawer
     */
    public function get_open_drawer($drawer_number = null) {
        if ($drawer_number) {
            $this->db->where('drawer_number', $drawer_number);
        }
        $this->db->where('status', 'Open');
        $this->db->order_by('opened_at', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('cash_drawers');
        return $query->row_array();
    }

    /**
     * Open drawer
     */
    public function open($data) {
        // Check if drawer is already open
        $open_drawer = $this->get_open_drawer($data['drawer_number']);
        if ($open_drawer) {
            return array('success' => false, 'message' => 'Drawer is already open');
        }
        
        $drawer_data = array(
            'drawer_number' => $data['drawer_number'],
            'location' => $data['location'] ?? null,
            'opening_balance' => $data['opening_balance'] ?? 0.00,
            'status' => 'Open',
            'opened_by' => $data['opened_by'],
            'opened_at' => date('Y-m-d H:i:s')
        );
        
        if ($this->db->insert('cash_drawers', $drawer_data)) {
            return array('success' => true, 'drawer_id' => $this->db->insert_id());
        }
        
        return array('success' => false, 'message' => 'Failed to open drawer');
    }

    /**
     * Close drawer
     */
    public function close($drawer_id, $data) {
        $this->db->trans_start();
        
        // Get drawer
        $drawer = $this->get_by_id($drawer_id);
        if (!$drawer) {
            return array('success' => false, 'message' => 'Drawer not found');
        }
        
        if ($drawer['status'] === 'Closed') {
            return array('success' => false, 'message' => 'Drawer is already closed');
        }
        
        // Calculate expected cash from sales
        $this->db->select_sum('total_amount');
        $this->db->where('drawer_id', $drawer_id);
        $this->db->where('payment_method', 'Cash');
        $this->db->where('status', 'Completed');
        $sales_query = $this->db->get('sales');
        $cash_sales = $sales_query->row()->total_amount ?? 0.00;
        
        $expected_cash = (float)$drawer['opening_balance'] + (float)$cash_sales;
        
        // Get cash drops/pickups
        $this->db->select('SUM(CASE WHEN drop_type = "Drop" THEN -amount ELSE amount END) as net_drops');
        $this->db->where('drawer_id', $drawer_id);
        $drops_query = $this->db->get('cash_drops');
        $net_drops = $drops_query->row()->net_drops ?? 0.00;
        
        $expected_cash += (float)$net_drops;
        
        $actual_cash = (float)($data['actual_cash'] ?? $expected_cash);
        $difference = $actual_cash - $expected_cash;
        
        // Update drawer
        $update_data = array(
            'closing_balance' => $actual_cash,
            'expected_cash' => $expected_cash,
            'actual_cash' => $actual_cash,
            'difference' => $difference,
            'status' => 'Closed',
            'closed_by' => $data['closed_by'],
            'closed_at' => date('Y-m-d H:i:s'),
            'notes' => $data['notes'] ?? null
        );
        
        $this->db->where('id', $drawer_id);
        if ($this->db->update('cash_drawers', $update_data)) {
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return array('success' => false, 'message' => 'Transaction failed');
            }
            
            return array('success' => true, 'difference' => $difference);
        }
        
        $this->db->trans_rollback();
        return array('success' => false, 'message' => 'Failed to close drawer');
    }

    /**
     * Record cash drop/pickup
     */
    public function record_drop($data) {
        if ($this->db->insert('cash_drops', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get cash drops for drawer
     */
    public function get_drops($drawer_id) {
        $this->db->select('cd.*, u1.name as processed_by_name, u2.name as authorized_by_name');
        $this->db->from('cash_drops cd');
        $this->db->join('users u1', 'cd.processed_by = u1.id', 'left');
        $this->db->join('users u2', 'cd.authorized_by = u2.id', 'left');
        $this->db->where('cd.drawer_id', $drawer_id);
        $this->db->order_by('cd.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }
}

