<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Medicine_stock_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get stock by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('medicine_stock', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Get stock by medicine ID with batch details
     */
    public function get_by_medicine_id($medicine_id, $include_expired = false) {
        $this->db->select('ms.*, m.name as medicine_name, m.generic_name, m.category, s.name as supplier_name');
        $this->db->from('medicine_stock ms');
        $this->db->join('medicines m', 'ms.medicine_id = m.id', 'left');
        $this->db->join('suppliers s', 'ms.supplier_id = s.id', 'left');
        $this->db->where('ms.medicine_id', $medicine_id);
        
        if (!$include_expired) {
            $this->db->where('ms.status !=', 'Expired');
        }
        
        $this->db->order_by('ms.expiry_date', 'ASC'); // FIFO - earliest expiry first
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get available stock quantity for a medicine (excluding reserved)
     */
    public function get_available_stock($medicine_id) {
        $this->db->select_sum('quantity');
        $this->db->select_sum('reserved_quantity');
        $this->db->from('medicine_stock');
        $this->db->where('medicine_id', $medicine_id);
        $this->db->where('status', 'Active');
        $query = $this->db->get();
        $result = $query->row_array();
        
        $total_quantity = $result['quantity'] ?? 0;
        $total_reserved = $result['reserved_quantity'] ?? 0;
        
        return max(0, $total_quantity - $total_reserved);
    }

    /**
     * Get stock summary for a medicine
     */
    public function get_stock_summary($medicine_id) {
        $this->db->select('
            COUNT(*) as batch_count,
            SUM(quantity) as total_quantity,
            SUM(reserved_quantity) as total_reserved,
            SUM(quantity) - SUM(reserved_quantity) as available_quantity,
            MIN(expiry_date) as earliest_expiry,
            MAX(selling_price) as max_price,
            MIN(cost_price) as min_cost
        ');
        $this->db->from('medicine_stock');
        $this->db->where('medicine_id', $medicine_id);
        $this->db->where('status', 'Active');
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Allocate stock using FIFO (First In First Out - earliest expiry first)
     */
    public function allocate_stock($medicine_id, $quantity, $reserve = false) {
        $this->db->trans_start();
        
        $remaining = $quantity;
        $allocated = array();
        
        // Get stock batches ordered by expiry date (FIFO)
        $this->db->select('*');
        $this->db->from('medicine_stock');
        $this->db->where('medicine_id', $medicine_id);
        $this->db->where('status', 'Active');
        $this->db->where('(quantity - reserved_quantity) >', 0);
        $this->db->order_by('expiry_date', 'ASC');
        $query = $this->db->get();
        $batches = $query->result_array();
        
        foreach ($batches as $batch) {
            if ($remaining <= 0) break;
            
            $available = $batch['quantity'] - $batch['reserved_quantity'];
            if ($available <= 0) continue;
            
            $allocate = min($remaining, $available);
            
            if ($reserve) {
                // Reserve stock
                $this->db->where('id', $batch['id']);
                $this->db->set('reserved_quantity', 'reserved_quantity + ' . $allocate, false);
                $this->db->update('medicine_stock');
            }
            
            $allocated[] = array(
                'stock_id' => $batch['id'],
                'batch_number' => $batch['batch_number'],
                'quantity' => $allocate,
                'expiry_date' => $batch['expiry_date'],
                'cost_price' => $batch['cost_price'],
                'selling_price' => $batch['selling_price']
            );
            
            $remaining -= $allocate;
        }
        
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return array('success' => false, 'message' => 'Failed to allocate stock', 'allocated' => array());
        }
        
        if ($remaining > 0) {
            return array(
                'success' => false, 
                'message' => 'Insufficient stock. Available: ' . ($quantity - $remaining) . ', Required: ' . $quantity,
                'allocated' => $allocated,
                'shortage' => $remaining
            );
        }
        
        return array('success' => true, 'allocated' => $allocated);
    }

    /**
     * Reserve stock for pending sale
     */
    public function reserve_stock($medicine_id, $quantity) {
        return $this->allocate_stock($medicine_id, $quantity, true);
    }

    /**
     * Release reserved stock
     */
    public function release_reserved_stock($stock_id, $quantity) {
        $this->db->where('id', $stock_id);
        $this->db->set('reserved_quantity', 'GREATEST(0, reserved_quantity - ' . (int)$quantity . ')', false);
        return $this->db->update('medicine_stock');
    }

    /**
     * Deduct stock (for completed sale)
     */
    public function deduct_stock($stock_id, $quantity) {
        $this->db->trans_start();
        
        // Get current stock
        $stock = $this->get_by_id($stock_id);
        if (!$stock) {
            $this->db->trans_rollback();
            return false;
        }
        
        // Check if enough stock available
        if ($stock['quantity'] < $quantity) {
            $this->db->trans_rollback();
            return false;
        }
        
        // Deduct quantity and reserved quantity
        $this->db->where('id', $stock_id);
        $this->db->set('quantity', 'quantity - ' . (int)$quantity, false);
        $this->db->set('reserved_quantity', 'GREATEST(0, reserved_quantity - ' . (int)$quantity . ')', false);
        
        // Update status if stock is zero
        $this->db->set('status', 'IF(quantity - ' . (int)$quantity . ' <= 0, "Sold Out", status)', false);
        
        $result = $this->db->update('medicine_stock');
        
        $this->db->trans_complete();
        return $result && $this->db->trans_status() !== FALSE;
    }

    /**
     * Add stock (for purchase/receipt)
     */
    public function add_stock($data) {
        // Validate required fields
        if (empty($data['medicine_id']) || empty($data['batch_number']) || empty($data['expiry_date'])) {
            return false;
        }
        
        // Set defaults
        $data['quantity'] = $data['quantity'] ?? 0;
        $data['reserved_quantity'] = 0;
        $data['status'] = $data['status'] ?? 'Active';
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['updated_at'] = date('Y-m-d H:i:s');
        
        if ($this->db->insert('medicine_stock', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update stock
     */
    public function update($id, $data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $this->db->where('id', $id);
        return $this->db->update('medicine_stock', $data);
    }

    /**
     * Get expiring stock (within specified days)
     */
    public function get_expiring_stock($days = 90) {
        $this->db->select('ms.*, m.name as medicine_name, m.medicine_code, m.generic_name');
        $this->db->from('medicine_stock ms');
        $this->db->join('medicines m', 'ms.medicine_id = m.id', 'left');
        $this->db->where('ms.status', 'Active');
        $this->db->where('ms.quantity >', 0);
        $this->db->where('ms.expiry_date >=', date('Y-m-d'));
        $this->db->where('ms.expiry_date <=', date('Y-m-d', strtotime("+{$days} days")));
        $this->db->order_by('ms.expiry_date', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get low stock medicines
     */
    public function get_low_stock($medicine_ids = null) {
        $this->db->select('
            m.id as medicine_id,
            m.medicine_code,
            m.name,
            m.generic_name,
            COALESCE(SUM(ms.quantity) - SUM(ms.reserved_quantity), 0) as available_stock,
            COALESCE(rl.minimum_stock, 0) as minimum_stock,
            COALESCE(rl.reorder_quantity, 0) as reorder_quantity
        ');
        $this->db->from('medicines m');
        $this->db->join('medicine_stock ms', 'm.id = ms.medicine_id AND ms.status = "Active"', 'left');
        $this->db->join('reorder_levels rl', 'm.id = rl.medicine_id', 'left');
        $this->db->where('m.status', 'Active');
        
        if ($medicine_ids) {
            $this->db->where_in('m.id', $medicine_ids);
        }
        
        $this->db->group_by('m.id, m.medicine_code, m.name, m.generic_name, rl.minimum_stock, rl.reorder_quantity');
        $this->db->having('available_stock < minimum_stock OR available_stock = 0');
        $this->db->order_by('available_stock', 'ASC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Search stock with filters
     */
    public function search($filters = array()) {
        $this->db->select('ms.*, m.name as medicine_name, m.medicine_code, m.generic_name, m.category, s.name as supplier_name');
        $this->db->from('medicine_stock ms');
        $this->db->join('medicines m', 'ms.medicine_id = m.id', 'left');
        $this->db->join('suppliers s', 'ms.supplier_id = s.id', 'left');
        
        if (!empty($filters['medicine_id'])) {
            $this->db->where('ms.medicine_id', $filters['medicine_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('m.name', $search);
            $this->db->or_like('m.generic_name', $search);
            $this->db->or_like('m.medicine_code', $search);
            $this->db->or_like('ms.batch_number', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['category'])) {
            $this->db->where('m.category', $filters['category']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('ms.status', $filters['status']);
        } else {
            $this->db->where('ms.status', 'Active');
        }
        
        if (!empty($filters['expiring_soon'])) {
            $days = (int)$filters['expiring_soon'];
            $this->db->where('ms.expiry_date >=', date('Y-m-d'));
            $this->db->where('ms.expiry_date <=', date('Y-m-d', strtotime("+{$days} days")));
        }
        
        if (!empty($filters['low_stock'])) {
            // This would need a subquery or join with reorder_levels
            // For now, we'll filter in PHP or use a view
        }
        
        $this->db->order_by('ms.expiry_date', 'ASC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Mark expired stock
     */
    public function mark_expired() {
        $this->db->where('status', 'Active');
        $this->db->where('expiry_date <', date('Y-m-d'));
        $this->db->where('quantity >', 0);
        return $this->db->update('medicine_stock', array('status' => 'Expired'));
    }

    /**
     * Get stock by barcode
     */
    public function get_by_barcode($barcode) {
        $this->db->select('ms.*, m.name as medicine_name, m.medicine_code, m.generic_name, m.category');
        $this->db->from('medicine_stock ms');
        $this->db->join('medicines m', 'ms.medicine_id = m.id', 'left');
        $this->db->join('barcodes b', 'm.id = b.medicine_id', 'left');
        $this->db->where('b.barcode', $barcode);
        $this->db->where('ms.status', 'Active');
        $this->db->where('ms.quantity >', 0);
        $this->db->order_by('ms.expiry_date', 'ASC');
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }
}

