<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Refund_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Medicine_stock_model');
        $this->load->model('Stock_movement_model');
    }

    /**
     * Generate unique refund number
     */
    public function generate_refund_number() {
        $prefix = 'REF-' . date('Ymd') . '-';
        $this->db->select('refund_number');
        $this->db->from('refunds');
        $this->db->like('refund_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->refund_number;
            $last_part = substr($last_number, strlen($prefix));
            $last_num = intval($last_part);
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all refunds
     */
    public function get_all($filters = array()) {
        $this->db->select('r.*, s.invoice_number, s.customer_name, u.name as processed_by_name');
        $this->db->from('refunds r');
        $this->db->join('sales s', 'r.sale_id = s.id', 'left');
        $this->db->join('users u', 'r.processed_by = u.id', 'left');
        
        if (!empty($filters['sale_id'])) {
            $this->db->where('r.sale_id', $filters['sale_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('r.status', $filters['status']);
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(r.refund_date) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(r.refund_date) <=', $filters['end_date']);
        }
        
        $this->db->order_by('r.refund_date', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get refund by ID with items
     */
    public function get_by_id($id) {
        $this->db->select('r.*, s.invoice_number, s.sale_date, s.customer_name, s.customer_phone');
        $this->db->from('refunds r');
        $this->db->join('sales s', 'r.sale_id = s.id', 'left');
        $this->db->where('r.id', $id);
        $query = $this->db->get();
        $refund = $query->row_array();
        
        if ($refund) {
            // Get refund items
            $this->db->select('ri.*, si.medicine_name, si.batch_number, m.name as current_medicine_name');
            $this->db->from('refund_items ri');
            $this->db->join('sale_items si', 'ri.sale_item_id = si.id', 'left');
            $this->db->join('medicines m', 'ri.medicine_id = m.id', 'left');
            $this->db->where('ri.refund_id', $id);
            $items_query = $this->db->get();
            $refund['items'] = $items_query->result_array();
        }
        
        return $refund;
    }

    /**
     * Create refund and return stock (if applicable)
     */
    public function create($data) {
        $this->db->trans_start();
        
        // Validate sale exists
        $this->db->where('id', $data['sale_id']);
        $sale = $this->db->get('sales')->row_array();
        
        if (!$sale) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'Sale not found');
        }
        
        // Check if sale is already fully refunded
        $this->db->select_sum('total_amount');
        $this->db->from('refunds');
        $this->db->where('sale_id', $data['sale_id']);
        $this->db->where('status', 'Completed');
        $existing_refunds = $this->db->get()->row()->total_amount ?? 0;
        
        if ($existing_refunds >= $sale['total_amount']) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'Sale already fully refunded');
        }
        
        // Generate refund number if not provided
        if (empty($data['refund_number'])) {
            $data['refund_number'] = $this->generate_refund_number();
        }
        
        // Calculate totals if items provided
        if (!empty($data['items']) && is_array($data['items'])) {
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $subtotal += $item['subtotal'];
            }
            
            $data['subtotal'] = $subtotal;
            $tax_rate = $sale['tax_rate'] ?? 14.00;
            $data['tax_amount'] = ($subtotal * $tax_rate) / (100 + $tax_rate); // Reverse tax calculation
            $data['total_amount'] = $subtotal;
        }
        
        // Set refund date if not provided
        if (empty($data['refund_date'])) {
            $data['refund_date'] = date('Y-m-d H:i:s');
        }
        
        // Insert refund
        if ($this->db->insert('refunds', $data)) {
            $refund_id = $this->db->insert_id();
            
            // Process items and return stock if applicable
            if (!empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    // Get original sale item
                    $this->db->where('id', $item['sale_item_id']);
                    $sale_item = $this->db->get('sale_items')->row_array();
                    
                    if (!$sale_item) {
                        continue;
                    }
                    
                    // Insert refund item
                    $refund_item = array(
                        'refund_id' => $refund_id,
                        'sale_item_id' => $item['sale_item_id'],
                        'medicine_id' => $item['medicine_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $item['subtotal'],
                        'return_to_stock' => $item['return_to_stock'] ?? 0
                    );
                    
                    // Return stock if requested and not expired
                    if (!empty($item['return_to_stock']) && $item['return_to_stock'] == 1) {
                        // Check if original stock batch still exists and not expired
                        $this->db->where('id', $sale_item['stock_id']);
                        $stock = $this->db->get('medicine_stock')->row_array();
                        
                        if ($stock && $stock['status'] === 'Active') {
                            // Check expiry
                            $expiry_date = new DateTime($stock['expiry_date']);
                            $today = new DateTime();
                            
                            if ($expiry_date > $today) {
                                // Return stock
                                $this->db->where('id', $sale_item['stock_id']);
                                $this->db->set('quantity', 'quantity + ' . (int)$item['quantity'], false);
                                $this->db->update('medicine_stock');
                                
                                $refund_item['stock_id'] = $sale_item['stock_id'];
                                
                                // Record stock movement
                                $this->Stock_movement_model->create(array(
                                    'medicine_id' => $item['medicine_id'],
                                    'stock_id' => $sale_item['stock_id'],
                                    'movement_type' => 'Refund',
                                    'reference_id' => $refund_id,
                                    'reference_type' => 'refund',
                                    'quantity' => $item['quantity'],
                                    'stock_before' => $stock['quantity'],
                                    'stock_after' => $stock['quantity'] + $item['quantity'],
                                    'cost_price' => $stock['cost_price'],
                                    'notes' => 'Stock returned via refund ' . $data['refund_number'],
                                    'created_by' => $data['processed_by'] ?? null
                                ));
                            }
                        }
                    }
                    
                    $this->db->insert('refund_items', $refund_item);
                }
            }
            
            // Update sale status if fully refunded
            $total_refunded = $existing_refunds + $data['total_amount'];
            if ($total_refunded >= $sale['total_amount']) {
                $this->db->where('id', $data['sale_id']);
                $this->db->update('sales', array('status' => 'Refunded'));
            }
            
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return array('success' => false, 'message' => 'Transaction failed');
            }
            
            return array('success' => true, 'refund_id' => $refund_id, 'refund_number' => $data['refund_number']);
        }
        
        $this->db->trans_rollback();
        return array('success' => false, 'message' => 'Failed to create refund');
    }

    /**
     * Complete refund (change status from Pending to Completed)
     */
    public function complete($id) {
        $this->db->where('id', $id);
        return $this->db->update('refunds', array('status' => 'Completed'));
    }
}

