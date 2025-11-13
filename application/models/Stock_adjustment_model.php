<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stock_adjustment_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique adjustment number
     */
    private function generate_adjustment_number() {
        $date = date('Ymd');
        $this->db->select_max('id');
        $this->db->like('adjustment_number', 'ADJ-' . $date);
        $query = $this->db->get('stock_adjustments');
        $result = $query->row_array();
        
        $sequence = 1;
        if ($result && $result['id']) {
            $last_number = $this->db->select('adjustment_number')
                ->where('id', $result['id'])
                ->get('stock_adjustments')
                ->row()->adjustment_number;
            
            if ($last_number) {
                $parts = explode('-', $last_number);
                $sequence = intval(end($parts)) + 1;
            }
        }
        
        return 'ADJ-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create stock adjustment
     */
    public function create($data) {
        if (empty($data['adjustment_number'])) {
            $data['adjustment_number'] = $this->generate_adjustment_number();
        }
        
        if (empty($data['status'])) {
            $data['status'] = 'Pending';
        }
        
        if ($this->db->insert('stock_adjustments', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Get all adjustments with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('sa.*, m.name as medicine_name, m.medicine_code, m.generic_name, 
                          ms.batch_number, ms.expiry_date,
                          u1.name as requested_by_name, u2.name as approved_by_name');
        $this->db->from('stock_adjustments sa');
        $this->db->join('medicines m', 'sa.medicine_id = m.id', 'left');
        $this->db->join('medicine_stock ms', 'sa.stock_id = ms.id', 'left');
        $this->db->join('users u1', 'sa.requested_by = u1.id', 'left');
        $this->db->join('users u2', 'sa.approved_by = u2.id', 'left');
        
        if (!empty($filters['medicine_id'])) {
            $this->db->where('sa.medicine_id', $filters['medicine_id']);
        }
        
        if (!empty($filters['adjustment_type'])) {
            $this->db->where('sa.adjustment_type', $filters['adjustment_type']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('sa.status', $filters['status']);
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(sa.created_at) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(sa.created_at) <=', $filters['end_date']);
        }
        
        $this->db->order_by('sa.created_at', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get adjustment by ID
     */
    public function get_by_id($id) {
        $this->db->select('sa.*, m.name as medicine_name, m.medicine_code, m.generic_name,
                          ms.batch_number, ms.expiry_date,
                          u1.name as requested_by_name, u2.name as approved_by_name');
        $this->db->from('stock_adjustments sa');
        $this->db->join('medicines m', 'sa.medicine_id = m.id', 'left');
        $this->db->join('medicine_stock ms', 'sa.stock_id = ms.id', 'left');
        $this->db->join('users u1', 'sa.requested_by = u1.id', 'left');
        $this->db->join('users u2', 'sa.approved_by = u2.id', 'left');
        $this->db->where('sa.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Update adjustment
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('stock_adjustments', $data);
    }

    /**
     * Approve adjustment
     */
    public function approve($id, $approved_by) {
        $adjustment = $this->get_by_id($id);
        if (!$adjustment) {
            return false;
        }
        
        if ($adjustment['status'] !== 'Pending') {
            return false;
        }
        
        // Update stock
        $this->load->model('Medicine_stock_model');
        $stock = null;
        
        if ($adjustment['stock_id']) {
            $stock = $this->Medicine_stock_model->get_by_id($adjustment['stock_id']);
        }
        
        if ($adjustment['adjustment_type'] === 'Increase') {
            if ($stock) {
                // Increase specific batch
                $this->db->where('id', $adjustment['stock_id']);
                $this->db->set('quantity', 'quantity + ' . $adjustment['quantity'], false);
                $this->db->update('medicine_stock');
            } else {
                // Create new stock entry
                $this->Medicine_stock_model->create(array(
                    'medicine_id' => $adjustment['medicine_id'],
                    'batch_number' => 'ADJ-' . date('Ymd') . '-' . $id,
                    'expiry_date' => date('Y-m-d', strtotime('+1 year')),
                    'quantity' => $adjustment['quantity'],
                    'cost_price' => 0,
                    'selling_price' => 0,
                    'status' => 'Active'
                ));
            }
        } else {
            // Decrease, Expiry Write-off, Damage, Theft, Correction
            if ($stock) {
                $new_quantity = max(0, $stock['quantity'] - $adjustment['quantity']);
                $this->db->where('id', $adjustment['stock_id']);
                $this->db->update('medicine_stock', array('quantity' => $new_quantity));
                
                if ($new_quantity == 0) {
                    $this->db->where('id', $adjustment['stock_id']);
                    $this->db->update('medicine_stock', array('status' => 'Sold Out'));
                }
            }
        }
        
        // Record stock movement
        $this->load->model('Stock_movement_model');
        $movement_data = array(
            'medicine_id' => $adjustment['medicine_id'],
            'stock_id' => $adjustment['stock_id'],
            'movement_type' => 'Adjustment',
            'quantity' => $adjustment['adjustment_type'] === 'Increase' ? $adjustment['quantity'] : -$adjustment['quantity'],
            'reference_type' => 'Stock Adjustment',
            'reference_id' => $id,
            'notes' => $adjustment['reason'] . ' - ' . $adjustment['adjustment_type'],
            'created_by' => $approved_by
        );
        $this->Stock_movement_model->create($movement_data);
        
        // Update adjustment status
        $this->db->where('id', $id);
        return $this->db->update('stock_adjustments', array(
            'status' => 'Approved',
            'approved_by' => $approved_by,
            'approved_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Reject adjustment
     */
    public function reject($id, $rejected_by) {
        $this->db->where('id', $id);
        $this->db->where('status', 'Pending');
        return $this->db->update('stock_adjustments', array(
            'status' => 'Rejected',
            'approved_by' => $rejected_by,
            'approved_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Get pending adjustments count
     */
    public function get_pending_count() {
        $this->db->where('status', 'Pending');
        return $this->db->count_all_results('stock_adjustments');
    }
}

