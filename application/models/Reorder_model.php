<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reorder_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Medicine_stock_model');
    }

    /**
     * Get reorder level by medicine ID
     */
    public function get_by_medicine_id($medicine_id) {
        $this->db->select('rl.*, s.name as preferred_supplier_name');
        $this->db->from('reorder_levels rl');
        $this->db->join('suppliers s', 'rl.preferred_supplier_id = s.id', 'left');
        $this->db->where('rl.medicine_id', $medicine_id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get all reorder levels
     */
    public function get_all($filters = array()) {
        $this->db->select('rl.*, m.name as medicine_name, m.medicine_code, m.generic_name, s.name as preferred_supplier_name');
        $this->db->from('reorder_levels rl');
        $this->db->join('medicines m', 'rl.medicine_id = m.id', 'left');
        $this->db->join('suppliers s', 'rl.preferred_supplier_id = s.id', 'left');
        
        if (!empty($filters['auto_reorder'])) {
            $this->db->where('rl.auto_reorder', 1);
        }
        
        $this->db->order_by('m.name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create or update reorder level
     */
    public function set_reorder_level($medicine_id, $data) {
        // Check if exists
        $existing = $this->get_by_medicine_id($medicine_id);
        
        if ($existing) {
            // Update
            $this->db->where('medicine_id', $medicine_id);
            return $this->db->update('reorder_levels', $data);
        } else {
            // Create
            $data['medicine_id'] = $medicine_id;
            return $this->db->insert('reorder_levels', $data);
        }
    }

    /**
     * Get low stock alerts (medicines below minimum stock)
     */
    public function get_low_stock_alerts($auto_reorder_only = false) {
        $this->db->select('
            m.id as medicine_id,
            m.medicine_code,
            m.name,
            m.generic_name,
            m.category,
            COALESCE(SUM(ms.quantity) - SUM(ms.reserved_quantity), 0) as available_stock,
            COALESCE(rl.minimum_stock, 0) as minimum_stock,
            COALESCE(rl.reorder_quantity, 0) as reorder_quantity,
            rl.preferred_supplier_id,
            rl.auto_reorder,
            s.name as preferred_supplier_name,
            s.supplier_code
        ');
        $this->db->from('medicines m');
        $this->db->join('medicine_stock ms', 'm.id = ms.medicine_id AND ms.status = "Active"', 'left');
        $this->db->join('reorder_levels rl', 'm.id = rl.medicine_id', 'left');
        $this->db->join('suppliers s', 'rl.preferred_supplier_id = s.id', 'left');
        $this->db->where('m.status', 'Active');
        
        if ($auto_reorder_only) {
            $this->db->where('rl.auto_reorder', 1);
        }
        
        $this->db->group_by('m.id, m.medicine_code, m.name, m.generic_name, m.category, rl.minimum_stock, rl.reorder_quantity, rl.preferred_supplier_id, rl.auto_reorder, s.name, s.supplier_code');
        $this->db->having('available_stock < minimum_stock OR (available_stock = 0 AND minimum_stock > 0)');
        $this->db->order_by('available_stock', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Check and generate auto-reorder purchase orders
     */
    public function generate_auto_reorder_pos() {
        $alerts = $this->get_low_stock_alerts(true);
        $pos_generated = array();
        
        // Group by supplier
        $supplier_items = array();
        foreach ($alerts as $alert) {
            if (empty($alert['preferred_supplier_id'])) {
                continue; // Skip if no preferred supplier
            }
            
            $supplier_id = $alert['preferred_supplier_id'];
            if (!isset($supplier_items[$supplier_id])) {
                $supplier_items[$supplier_id] = array();
            }
            
            $supplier_items[$supplier_id][] = $alert;
        }
        
        // Generate PO for each supplier
        $this->load->model('Purchase_order_model');
        
        foreach ($supplier_items as $supplier_id => $items) {
            $po_items = array();
            $total_amount = 0;
            
            foreach ($items as $item) {
                $reorder_qty = max($item['reorder_quantity'], $item['minimum_stock'] - $item['available_stock']);
                
                // Get average cost price for this medicine
                $stock_summary = $this->Medicine_stock_model->get_stock_summary($item['medicine_id']);
                $avg_cost = $stock_summary['min_cost'] ?? 0;
                
                if ($avg_cost > 0) {
                    $po_items[] = array(
                        'medicine_id' => $item['medicine_id'],
                        'quantity' => $reorder_qty,
                        'unit_cost' => $avg_cost
                    );
                    $total_amount += ($reorder_qty * $avg_cost);
                }
            }
            
            if (!empty($po_items)) {
                $po_data = array(
                    'supplier_id' => $supplier_id,
                    'order_date' => date('Y-m-d'),
                    'expected_delivery_date' => date('Y-m-d', strtotime('+7 days')),
                    'items' => $po_items,
                    'status' => 'Draft',
                    'notes' => 'Auto-generated reorder PO'
                );
                
                $po_id = $this->Purchase_order_model->create($po_data);
                
                if ($po_id) {
                    $pos_generated[] = array(
                        'po_id' => $po_id,
                        'supplier_id' => $supplier_id,
                        'items_count' => count($po_items),
                        'total_amount' => $total_amount
                    );
                    
                    // Update last reorder date
                    foreach ($items as $item) {
                        $this->db->where('medicine_id', $item['medicine_id']);
                        $this->db->update('reorder_levels', array('last_reorder_date' => date('Y-m-d')));
                    }
                }
            }
        }
        
        return $pos_generated;
    }

    /**
     * Update last reorder date
     */
    public function update_last_reorder_date($medicine_id) {
        $this->db->where('medicine_id', $medicine_id);
        return $this->db->update('reorder_levels', array('last_reorder_date' => date('Y-m-d')));
    }
}

