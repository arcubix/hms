<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Stock_receipt_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Medicine_stock_model');
        $this->load->model('Stock_movement_model');
    }

    /**
     * Generate unique receipt number
     */
    public function generate_receipt_number() {
        $prefix = 'REC-' . date('Ymd') . '-';
        $this->db->select('receipt_number');
        $this->db->from('stock_receipts');
        $this->db->like('receipt_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->receipt_number;
            $last_part = substr($last_number, strlen($prefix));
            $last_num = intval($last_part);
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all stock receipts
     */
    public function get_all($filters = array()) {
        $this->db->select('sr.*, s.name as supplier_name, s.supplier_code, po.po_number, u.name as received_by_name');
        $this->db->from('stock_receipts sr');
        $this->db->join('suppliers s', 'sr.supplier_id = s.id', 'left');
        $this->db->join('purchase_orders po', 'sr.purchase_order_id = po.id', 'left');
        $this->db->join('users u', 'sr.received_by = u.id', 'left');
        
        if (!empty($filters['supplier_id'])) {
            $this->db->where('sr.supplier_id', $filters['supplier_id']);
        }
        
        if (!empty($filters['purchase_order_id'])) {
            $this->db->where('sr.purchase_order_id', $filters['purchase_order_id']);
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('sr.receipt_date >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('sr.receipt_date <=', $filters['end_date']);
        }
        
        $this->db->order_by('sr.receipt_date', 'DESC');
        $this->db->order_by('sr.id', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get receipt by ID with items
     */
    public function get_by_id($id) {
        $this->db->select('sr.*, s.name as supplier_name, s.supplier_code, po.po_number');
        $this->db->from('stock_receipts sr');
        $this->db->join('suppliers s', 'sr.supplier_id = s.id', 'left');
        $this->db->join('purchase_orders po', 'sr.purchase_order_id = po.id', 'left');
        $this->db->where('sr.id', $id);
        $query = $this->db->get();
        $receipt = $query->row_array();
        
        if ($receipt) {
            // Get receipt items
            $this->db->select('sri.*, m.name as medicine_name, m.medicine_code, m.generic_name');
            $this->db->from('stock_receipt_items sri');
            $this->db->join('medicines m', 'sri.medicine_id = m.id', 'left');
            $this->db->where('sri.stock_receipt_id', $id);
            $items_query = $this->db->get();
            $receipt['items'] = $items_query->result_array();
        }
        
        return $receipt;
    }

    /**
     * Create stock receipt and add stock
     */
    public function create($data) {
        $this->db->trans_start();
        
        // Generate receipt number if not provided
        if (empty($data['receipt_number'])) {
            $data['receipt_number'] = $this->generate_receipt_number();
        }
        
        // Insert receipt
        if ($this->db->insert('stock_receipts', $data)) {
            $receipt_id = $this->db->insert_id();
            
            // Process items and add to stock
            if (!empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    // Insert receipt item
                    $receipt_item = array(
                        'stock_receipt_id' => $receipt_id,
                        'medicine_id' => $item['medicine_id'],
                        'batch_number' => $item['batch_number'],
                        'manufacture_date' => $item['manufacture_date'] ?? null,
                        'expiry_date' => $item['expiry_date'],
                        'quantity' => $item['quantity'],
                        'cost_price' => $item['cost_price'],
                        'selling_price' => $item['selling_price'],
                        'location' => $item['location'] ?? null,
                        'purchase_order_item_id' => $item['purchase_order_item_id'] ?? null
                    );
                    $this->db->insert('stock_receipt_items', $receipt_item);
                    $receipt_item_id = $this->db->insert_id();
                    
                    // Add to medicine_stock
                    $stock_data = array(
                        'medicine_id' => $item['medicine_id'],
                        'batch_number' => $item['batch_number'],
                        'manufacture_date' => $item['manufacture_date'] ?? null,
                        'expiry_date' => $item['expiry_date'],
                        'quantity' => $item['quantity'],
                        'cost_price' => $item['cost_price'],
                        'selling_price' => $item['selling_price'],
                        'location' => $item['location'] ?? null,
                        'supplier_id' => $data['supplier_id'],
                        'purchase_order_id' => $data['purchase_order_id'] ?? null,
                        'stock_receipt_id' => $receipt_id,
                        'status' => 'Active'
                    );
                    $stock_id = $this->Medicine_stock_model->add_stock($stock_data);
                    
                    // Record stock movement
                    if ($stock_id) {
                        $this->Stock_movement_model->create(array(
                            'medicine_id' => $item['medicine_id'],
                            'stock_id' => $stock_id,
                            'movement_type' => 'Purchase',
                            'reference_id' => $receipt_id,
                            'reference_type' => 'stock_receipt',
                            'quantity' => $item['quantity'],
                            'stock_before' => 0,
                            'stock_after' => $item['quantity'],
                            'cost_price' => $item['cost_price'],
                            'notes' => 'Stock received via receipt ' . $data['receipt_number'],
                            'created_by' => $data['created_by'] ?? null
                        ));
                    }
                    
                    // Update PO item received quantity if linked
                    if (!empty($item['purchase_order_item_id'])) {
                        $this->load->model('Purchase_order_model');
                        $this->Purchase_order_model->update_received_quantity($item['purchase_order_item_id'], $item['quantity']);
                    }
                }
            }
            
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return false;
            }
            
            return $receipt_id;
        }
        
        $this->db->trans_rollback();
        return false;
    }
}

