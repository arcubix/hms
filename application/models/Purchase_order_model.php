<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Purchase_order_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique PO number
     */
    public function generate_po_number() {
        $prefix = 'PO-' . date('Ymd') . '-';
        $this->db->select('po_number');
        $this->db->from('purchase_orders');
        $this->db->like('po_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->po_number;
            $last_part = substr($last_number, strlen($prefix));
            $last_num = intval($last_part);
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all purchase orders with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('po.*, s.name as supplier_name, s.supplier_code, u.name as created_by_name, a.name as approved_by_name, 
            (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items_count');
        $this->db->from('purchase_orders po');
        $this->db->join('suppliers s', 'po.supplier_id = s.id', 'left');
        $this->db->join('users u', 'po.created_by = u.id', 'left');
        $this->db->join('users a', 'po.approved_by = a.id', 'left');
        
        if (!empty($filters['supplier_id'])) {
            $this->db->where('po.supplier_id', $filters['supplier_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('po.status', $filters['status']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('po.po_number', $search);
            $this->db->or_like('s.name', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('po.order_date >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('po.order_date <=', $filters['end_date']);
        }
        
        $this->db->order_by('po.order_date', 'DESC');
        $this->db->order_by('po.id', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        $pos = $query->result_array();
        
        // Add items array to each PO
        foreach ($pos as &$po) {
            $this->db->select('poi.*, m.name as medicine_name, m.medicine_code, m.generic_name, m.category');
            $this->db->from('purchase_order_items poi');
            $this->db->join('medicines m', 'poi.medicine_id = m.id', 'left');
            $this->db->where('poi.purchase_order_id', $po['id']);
            $items_query = $this->db->get();
            $po['items'] = $items_query->result_array();
        }
        
        return $pos;
    }

    /**
     * Get purchase order by ID with items
     */
    public function get_by_id($id) {
        $this->db->select('po.*, s.name as supplier_name, s.supplier_code, s.phone as supplier_phone, s.email as supplier_email, s.address as supplier_address');
        $this->db->from('purchase_orders po');
        $this->db->join('suppliers s', 'po.supplier_id = s.id', 'left');
        $this->db->where('po.id', $id);
        $query = $this->db->get();
        $po = $query->row_array();
        
        if ($po) {
            // Get PO items
            $this->db->select('poi.*, m.name as medicine_name, m.medicine_code, m.generic_name, m.category');
            $this->db->from('purchase_order_items poi');
            $this->db->join('medicines m', 'poi.medicine_id = m.id', 'left');
            $this->db->where('poi.purchase_order_id', $id);
            $items_query = $this->db->get();
            $po['items'] = $items_query->result_array();
        }
        
        return $po;
    }

    /**
     * Create purchase order with items
     */
    public function create($data) {
        $this->db->trans_start();
        
        // Generate PO number if not provided
        if (empty($data['po_number'])) {
            $data['po_number'] = $this->generate_po_number();
        }
        
        // Store items separately before removing from data
        $items = !empty($data['items']) && is_array($data['items']) ? $data['items'] : array();
        
        // Calculate totals if items provided
        if (!empty($items)) {
            $subtotal = 0;
            foreach ($items as $item) {
                $subtotal += ($item['quantity'] * $item['unit_cost']);
            }
            
            $data['subtotal'] = $subtotal;
            $tax_rate = $data['tax_rate'] ?? 14.00;
            $data['tax_amount'] = ($subtotal * $tax_rate) / 100;
            $data['total_amount'] = $subtotal + $data['tax_amount'] + ($data['shipping_cost'] ?? 0) - ($data['discount'] ?? 0);
        }
        
        // Remove items from data before inserting into purchase_orders table
        unset($data['items']);
        
        // Set default status if not provided
        if (empty($data['status'])) {
            $data['status'] = 'Draft';
        }
        
        // Insert PO
        if ($this->db->insert('purchase_orders', $data)) {
            $po_id = $this->db->insert_id();
            
            // Insert items into purchase_order_items table
            if (!empty($items)) {
                foreach ($items as $item) {
                    $item_data = array(
                        'purchase_order_id' => $po_id,
                        'medicine_id' => $item['medicine_id'],
                        'quantity' => $item['quantity'],
                        'unit_cost' => $item['unit_cost'],
                        'total_cost' => $item['quantity'] * $item['unit_cost']
                    );
                    if (!empty($item['notes'])) {
                        $item_data['notes'] = $item['notes'];
                    }
                    $this->db->insert('purchase_order_items', $item_data);
                }
            }
            
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return false;
            }
            
            return $po_id;
        }
        
        $this->db->trans_rollback();
        return false;
    }

    /**
     * Update purchase order
     */
    public function update($id, $data) {
        $this->db->trans_start();
        
        // If items are being updated, recalculate totals
        if (!empty($data['items']) && is_array($data['items'])) {
            // Delete existing items
            $this->db->where('purchase_order_id', $id);
            $this->db->delete('purchase_order_items');
            
            // Recalculate totals
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $subtotal += ($item['quantity'] * $item['unit_cost']);
            }
            
            $data['subtotal'] = $subtotal;
            $tax_rate = $data['tax_rate'] ?? 14.00;
            $data['tax_amount'] = ($subtotal * $tax_rate) / 100;
            $data['total_amount'] = $subtotal + $data['tax_amount'] + ($data['shipping_cost'] ?? 0) - ($data['discount'] ?? 0);
            
            // Insert new items
            foreach ($data['items'] as $item) {
                $item['purchase_order_id'] = $id;
                $item['total_cost'] = $item['quantity'] * $item['unit_cost'];
                $this->db->insert('purchase_order_items', $item);
            }
            
            unset($data['items']);
        }
        
        $this->db->where('id', $id);
        $result = $this->db->update('purchase_orders', $data);
        
        $this->db->trans_complete();
        return $result && $this->db->trans_status() !== FALSE;
    }

    /**
     * Approve purchase order and add stock
     */
    public function approve($id, $approved_by) {
        $this->db->trans_start();
        
        // Get PO details
        $po = $this->get_by_id($id);
        if (!$po) {
            $this->db->trans_rollback();
            return false;
        }
        
        // Update PO status
        $this->db->where('id', $id);
        $update_result = $this->db->update('purchase_orders', array(
            'status' => 'Approved',
            'approved_by' => $approved_by,
            'approved_at' => date('Y-m-d H:i:s')
        ));
        
        if (!$update_result) {
            $this->db->trans_rollback();
            return false;
        }
        
        // Add stock for each item in the PO
        if (!empty($po['items']) && is_array($po['items'])) {
            $this->load->model('Medicine_stock_model');
            
            foreach ($po['items'] as $item) {
                // Generate batch number
                $batch_number = $po['po_number'] . '-ITEM-' . $item['id'];
                
                // Calculate expiry date (expected_delivery_date + 365 days, or current date + 365 if not set)
                if (!empty($po['expected_delivery_date'])) {
                    $expiry_date = date('Y-m-d', strtotime($po['expected_delivery_date'] . ' +365 days'));
                } else {
                    $expiry_date = date('Y-m-d', strtotime('+365 days'));
                }
                
                // Calculate selling price (20% margin on cost)
                $cost_price = (float)$item['unit_cost'];
                $selling_price = $cost_price * 1.2;
                
                // Prepare stock data
                $stock_data = array(
                    'medicine_id' => $item['medicine_id'],
                    'batch_number' => $batch_number,
                    'expiry_date' => $expiry_date,
                    'quantity' => (int)$item['quantity'],
                    'cost_price' => $cost_price,
                    'selling_price' => $selling_price,
                    'supplier_id' => $po['supplier_id'],
                    'purchase_order_id' => $id,
                    'status' => 'Active',
                    'reserved_quantity' => 0
                );
                
                // Add stock
                $stock_id = $this->Medicine_stock_model->add_stock($stock_data);
                
                if (!$stock_id) {
                    log_message('error', 'Failed to add stock for PO item: ' . $item['id']);
                    // Continue with other items even if one fails
                }
            }
        }
        
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return true;
    }

    /**
     * Update received quantity for PO item
     */
    public function update_received_quantity($po_item_id, $quantity) {
        $this->db->where('id', $po_item_id);
        $this->db->set('received_quantity', 'received_quantity + ' . (int)$quantity, false);
        $result = $this->db->update('purchase_order_items');
        
        // Check if PO is fully received
        $this->db->select('poi.*');
        $this->db->from('purchase_order_items poi');
        $this->db->where('poi.purchase_order_id', 
            $this->db->select('purchase_order_id')->from('purchase_order_items')->where('id', $po_item_id)->get_compiled_select()
        );
        $items = $this->db->get()->result_array();
        
        $all_received = true;
        foreach ($items as $item) {
            if ($item['received_quantity'] < $item['quantity']) {
                $all_received = false;
                break;
            }
        }
        
        if ($all_received) {
            $po_id = $items[0]['purchase_order_id'] ?? null;
            if ($po_id) {
                $this->db->where('id', $po_id);
                $this->db->update('purchase_orders', array('status' => 'Received'));
            }
        } else {
            // Check if partially received
            $any_received = false;
            foreach ($items as $item) {
                if ($item['received_quantity'] > 0) {
                    $any_received = true;
                    break;
                }
            }
            
            if ($any_received) {
                $po_id = $items[0]['purchase_order_id'] ?? null;
                if ($po_id) {
                    $this->db->where('id', $po_id);
                    $this->db->where('status', 'Approved');
                    $this->db->update('purchase_orders', array('status' => 'Partially Received'));
                }
            }
        }
        
        return $result;
    }

    /**
     * Cancel purchase order
     */
    public function cancel($id, $reason = null) {
        $this->db->where('id', $id);
        $data = array('status' => 'Cancelled');
        if ($reason) {
            $data['notes'] = $reason;
        }
        return $this->db->update('purchase_orders', $data);
    }
}

