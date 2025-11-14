<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Voided_sale_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Sale_model');
        $this->load->model('Medicine_stock_model');
        $this->load->model('Stock_movement_model');
    }

    /**
     * Get voided sale by ID
     */
    public function get_by_id($id) {
        $this->db->select('vs.*, u1.name as voided_by_name, u2.name as authorized_by_name');
        $this->db->from('voided_sales vs');
        $this->db->join('users u1', 'vs.voided_by = u1.id', 'left');
        $this->db->join('users u2', 'vs.authorized_by = u2.id', 'left');
        $this->db->where('vs.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get voided sale by sale_id
     */
    public function get_by_sale_id($sale_id) {
        $this->db->select('vs.*, u1.name as voided_by_name, u2.name as authorized_by_name');
        $this->db->from('voided_sales vs');
        $this->db->join('users u1', 'vs.voided_by = u1.id', 'left');
        $this->db->join('users u2', 'vs.authorized_by = u2.id', 'left');
        $this->db->where('vs.sale_id', $sale_id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get all voided sales
     */
    public function get_all($filters = array()) {
        $this->db->select('vs.*, s.invoice_number, s.total_amount, u1.name as voided_by_name, u2.name as authorized_by_name');
        $this->db->from('voided_sales vs');
        $this->db->join('sales s', 'vs.sale_id = s.id', 'left');
        $this->db->join('users u1', 'vs.voided_by = u1.id', 'left');
        $this->db->join('users u2', 'vs.authorized_by = u2.id', 'left');
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(vs.voided_at) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(vs.voided_at) <=', $filters['end_date']);
        }
        
        if (!empty($filters['voided_by'])) {
            $this->db->where('vs.voided_by', $filters['voided_by']);
        }
        
        $this->db->order_by('vs.voided_at', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Void a sale
     */
    public function void_sale($sale_id, $data) {
        $this->db->trans_start();
        
        // Get sale details
        $sale = $this->Sale_model->get_by_id($sale_id);
        if (!$sale) {
            return array('success' => false, 'message' => 'Sale not found');
        }
        
        // Check if already voided
        $existing_void = $this->get_by_sale_id($sale_id);
        if ($existing_void) {
            return array('success' => false, 'message' => 'Sale already voided');
        }
        
        // Create void record
        $void_data = array(
            'sale_id' => $sale_id,
            'void_reason' => $data['void_reason'],
            'void_type' => $data['void_type'] ?? 'Other',
            'voided_by' => $data['voided_by'],
            'authorized_by' => $data['authorized_by'] ?? null,
            'notes' => $data['notes'] ?? null
        );
        
        if ($this->db->insert('voided_sales', $void_data)) {
            $void_id = $this->db->insert_id();
            
            // Update sale status
            $this->db->where('id', $sale_id);
            $this->db->update('sales', array('status' => 'Voided'));
            
            // Restore stock if requested
            if (!empty($data['restore_stock']) && $data['restore_stock']) {
                if (!empty($sale['items'])) {
                    foreach ($sale['items'] as $item) {
                        // Restore stock - increment quantity for the specific stock batch
                        $this->db->where('id', $item['stock_id']);
                        $this->db->set('quantity', 'quantity + ' . (int)$item['quantity'], false);
                        $this->db->update('medicine_stock');
                        
                        // Record stock movement
                        $this->Stock_movement_model->create(array(
                            'medicine_id' => $item['medicine_id'],
                            'stock_id' => $item['stock_id'],
                            'movement_type' => 'Refund',
                            'reference_id' => $sale_id,
                            'reference_type' => 'void',
                            'quantity' => $item['quantity'],
                            'stock_before' => $this->db->select('quantity')->from('medicine_stock')->where('id', $item['stock_id'])->get()->row()->quantity ?? 0,
                            'stock_after' => ($this->db->select('quantity')->from('medicine_stock')->where('id', $item['stock_id'])->get()->row()->quantity ?? 0) + $item['quantity'],
                            'cost_price' => $item['unit_price'] ?? null,
                            'notes' => 'Stock restored from voided sale ' . $sale['invoice_number'],
                            'created_by' => $data['voided_by']
                        ));
                    }
                }
                
                // Update void record
                $this->db->where('id', $void_id);
                $this->db->update('voided_sales', array('stock_restored' => 1));
            }
            
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return array('success' => false, 'message' => 'Transaction failed');
            }
            
            return array('success' => true, 'void_id' => $void_id);
        }
        
        $this->db->trans_rollback();
        return array('success' => false, 'message' => 'Failed to void sale');
    }
}

