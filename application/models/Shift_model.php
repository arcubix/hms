<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Shift_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique shift number
     */
    public function generate_shift_number() {
        $prefix = 'SHIFT-' . date('Ymd') . '-';
        $this->db->select('shift_number');
        $this->db->from('shifts');
        $this->db->like('shift_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->shift_number;
            $last_part = substr($last_number, strlen($prefix));
            $last_num = intval($last_part);
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get shift by ID
     */
    public function get_by_id($id) {
        $this->db->select('s.*, cd.drawer_number, cd.location, u.name as cashier_name');
        $this->db->from('shifts s');
        $this->db->join('cash_drawers cd', 's.drawer_id = cd.id', 'left');
        $this->db->join('users u', 's.cashier_id = u.id', 'left');
        $this->db->where('s.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get all shifts
     */
    public function get_all($filters = array()) {
        $this->db->select('s.*, cd.drawer_number, cd.location, u.name as cashier_name');
        $this->db->from('shifts s');
        $this->db->join('cash_drawers cd', 's.drawer_id = cd.id', 'left');
        $this->db->join('users u', 's.cashier_id = u.id', 'left');
        
        if (!empty($filters['cashier_id'])) {
            $this->db->where('s.cashier_id', $filters['cashier_id']);
        }
        
        if (!empty($filters['drawer_id'])) {
            $this->db->where('s.drawer_id', $filters['drawer_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('s.status', $filters['status']);
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(s.start_time) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(s.start_time) <=', $filters['end_date']);
        }
        
        $this->db->order_by('s.start_time', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get current open shift for cashier
     */
    public function get_current_shift($cashier_id, $drawer_id = null) {
        try {
            $this->db->where('cashier_id', $cashier_id);
            $this->db->where('status', 'Open');
            // If drawer_id is provided, filter by it; otherwise get any open shift
            if ($drawer_id !== null) {
                $this->db->where('drawer_id', $drawer_id);
            }
            $this->db->order_by('start_time', 'DESC');
            $this->db->limit(1);
            $query = $this->db->get('shifts');
            return $query->row_array();
        } catch (Exception $e) {
            log_message('error', 'Get current shift error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Open shift
     */
    public function open($data) {
        // Check if cashier has open shift for today
        $open_shift = $this->get_current_shift($data['cashier_id'], $data['drawer_id'] ?? null);
        if ($open_shift) {
            // Check if the open shift is for today
            $shift_date = date('Y-m-d', strtotime($open_shift['start_time']));
            $today = date('Y-m-d');
            if ($shift_date === $today) {
                return array('success' => false, 'message' => 'Cashier already has an open shift for today');
            }
        }
        
        // If drawer_id is provided, check if drawer is open
        if (!empty($data['drawer_id'])) {
            $this->load->model('Cash_drawer_model');
            $drawer = $this->Cash_drawer_model->get_by_id($data['drawer_id']);
            if (!$drawer || $drawer['status'] !== 'Open') {
                return array('success' => false, 'message' => 'Drawer is not open');
            }
            $opening_cash = $data['opening_cash'] ?? $drawer['opening_balance'];
        } else {
            // No drawer - use provided opening cash or default to 0
            $opening_cash = $data['opening_cash'] ?? 0;
        }
        
        $shift_data = array(
            'shift_number' => $this->generate_shift_number(),
            'drawer_id' => $data['drawer_id'] ?? null,
            'cashier_id' => $data['cashier_id'],
            'start_time' => date('Y-m-d H:i:s'),
            'opening_cash' => $opening_cash,
            'status' => 'Open'
        );
        
        if ($this->db->insert('shifts', $shift_data)) {
            return array('success' => true, 'shift_id' => $this->db->insert_id(), 'shift_number' => $shift_data['shift_number']);
        }
        
        return array('success' => false, 'message' => 'Failed to open shift');
    }

    /**
     * Close shift
     */
    public function close($shift_id, $data) {
        $this->db->trans_start();
        
        // Get shift
        $shift = $this->get_by_id($shift_id);
        if (!$shift) {
            return array('success' => false, 'message' => 'Shift not found');
        }
        
        if ($shift['status'] === 'Closed') {
            return array('success' => false, 'message' => 'Shift is already closed');
        }
        
        // Calculate sales summary
        $this->db->select('
            COUNT(*) as total_sales,
            SUM(total_amount) as total_revenue,
            SUM(CASE WHEN payment_method = "Cash" THEN total_amount ELSE 0 END) as cash_sales,
            SUM(CASE WHEN payment_method = "Card" THEN total_amount ELSE 0 END) as card_sales,
            SUM(CASE WHEN payment_method NOT IN ("Cash", "Card") THEN total_amount ELSE 0 END) as other_sales
        ');
        $this->db->where('shift_id', $shift_id);
        $this->db->where('status', 'Completed');
        $sales_query = $this->db->get('sales');
        $sales_summary = $sales_query->row_array();
        
        // Calculate expected cash
        $expected_cash = (float)$shift['opening_cash'] + (float)($sales_summary['cash_sales'] ?? 0);
        
        $actual_cash = (float)($data['actual_cash'] ?? $expected_cash);
        $difference = $actual_cash - $expected_cash;
        
        // Update shift
        $update_data = array(
            'end_time' => date('Y-m-d H:i:s'),
            'closing_cash' => $actual_cash,
            'expected_cash' => $expected_cash,
            'actual_cash' => $actual_cash,
            'difference' => $difference,
            'total_sales' => $sales_summary['total_sales'] ?? 0,
            'total_revenue' => $sales_summary['total_revenue'] ?? 0.00,
            'cash_sales' => $sales_summary['cash_sales'] ?? 0.00,
            'card_sales' => $sales_summary['card_sales'] ?? 0.00,
            'other_sales' => $sales_summary['other_sales'] ?? 0.00,
            'status' => 'Closed',
            'handover_notes' => $data['handover_notes'] ?? null
        );
        
        $this->db->where('id', $shift_id);
        if ($this->db->update('shifts', $update_data)) {
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return array('success' => false, 'message' => 'Transaction failed');
            }
            
            return array('success' => true, 'difference' => $difference);
        }
        
        $this->db->trans_rollback();
        return array('success' => false, 'message' => 'Failed to close shift');
    }
}

