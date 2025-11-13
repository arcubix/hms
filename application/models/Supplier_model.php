<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Supplier_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique supplier code
     */
    public function generate_supplier_code() {
        $prefix = 'SUP';
        $this->db->select('supplier_code');
        $this->db->from('suppliers');
        $this->db->like('supplier_code', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_code = $query->row()->supplier_code;
            $last_num = intval(substr($last_code, strlen($prefix)));
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all suppliers with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('*');
        $this->db->from('suppliers');
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('name', $search);
            $this->db->or_like('company_name', $search);
            $this->db->or_like('supplier_code', $search);
            $this->db->or_like('phone', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('status', $filters['status']);
        } else {
            $this->db->where('status', 'Active');
        }
        
        $this->db->order_by('name', 'ASC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get supplier by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('suppliers', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Get supplier by code
     */
    public function get_by_code($code) {
        $query = $this->db->get_where('suppliers', array('supplier_code' => $code));
        return $query->row_array();
    }

    /**
     * Create supplier
     */
    public function create($data) {
        // Generate supplier code if not provided
        if (empty($data['supplier_code'])) {
            $data['supplier_code'] = $this->generate_supplier_code();
        }
        
        // Set defaults
        if (empty($data['country'])) {
            $data['country'] = 'Pakistan';
        }
        
        if (empty($data['status'])) {
            $data['status'] = 'Active';
        }
        
        if ($this->db->insert('suppliers', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update supplier
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('suppliers', $data);
    }

    /**
     * Delete supplier (soft delete)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('suppliers', array('status' => 'Inactive'));
    }

    /**
     * Update outstanding balance
     */
    public function update_outstanding_balance($id, $amount) {
        $this->db->where('id', $id);
        $this->db->set('outstanding_balance', 'outstanding_balance + ' . (float)$amount, false);
        return $this->db->update('suppliers');
    }

    /**
     * Get supplier performance stats
     */
    public function get_performance_stats($supplier_id, $start_date = null, $end_date = null) {
        $this->db->select('
            COUNT(DISTINCT po.id) as total_orders,
            SUM(po.total_amount) as total_purchase_amount,
            AVG(po.total_amount) as avg_order_value,
            COUNT(DISTINCT CASE WHEN po.status = "Received" THEN po.id END) as completed_orders,
            COUNT(DISTINCT CASE WHEN po.status = "Pending" THEN po.id END) as pending_orders
        ');
        $this->db->from('purchase_orders po');
        $this->db->where('po.supplier_id', $supplier_id);
        
        if ($start_date) {
            $this->db->where('po.order_date >=', $start_date);
        }
        
        if ($end_date) {
            $this->db->where('po.order_date <=', $end_date);
        }
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get suppliers with low credit availability
     */
    public function get_low_credit_suppliers($threshold_percent = 80) {
        $this->db->select('*');
        $this->db->from('suppliers');
        $this->db->where('status', 'Active');
        $this->db->where('credit_limit >', 0);
        $this->db->where('(outstanding_balance / credit_limit * 100) >=', $threshold_percent);
        $this->db->order_by('(outstanding_balance / credit_limit * 100)', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }
}

