<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Medicine_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique medicine code
     */
    public function generate_medicine_code() {
        $prefix = 'MED';
        $this->db->select('medicine_code');
        $this->db->from('medicines');
        $this->db->like('medicine_code', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_code = $query->row()->medicine_code;
            $last_num = intval(substr($last_code, strlen($prefix)));
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all medicines with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('*');
        $this->db->from('medicines');
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('name', $search);
            $this->db->or_like('generic_name', $search);
            $this->db->or_like('medicine_code', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['category'])) {
            $this->db->where('category', $filters['category']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('status', $filters['status']);
        } else {
            // Default to active medicines
            $this->db->where('status', 'Active');
        }
        
        $this->db->order_by('name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get medicine by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('medicines', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Create medicine
     */
    public function create($data) {
        // Generate medicine code if not provided
        if (empty($data['medicine_code'])) {
            $data['medicine_code'] = $this->generate_medicine_code();
        }
        
        if ($this->db->insert('medicines', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update medicine
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('medicines', $data);
    }

    /**
     * Delete medicine (soft delete by setting status)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('medicines', array('status' => 'Inactive'));
    }

    /**
     * Get medicine with stock quantity
     */
    public function get_with_stock($id) {
        $medicine = $this->get_by_id($id);
        
        if ($medicine) {
            $this->load->model('Medicine_stock_model');
            $stock_summary = $this->Medicine_stock_model->get_stock_summary($id);
            $medicine['stock'] = $stock_summary;
            $medicine['available_stock'] = $stock_summary['available_stock'] ?? 0;
            $medicine['total_stock'] = $stock_summary['total_stock'] ?? 0;
        }
        
        return $medicine;
    }

    /**
     * Get all medicines with stock information
     */
    public function get_all_with_stock($filters = array()) {
        $medicines = $this->get_all($filters);
        $this->load->model('Medicine_stock_model');
        
        foreach ($medicines as &$medicine) {
            $stock_summary = $this->Medicine_stock_model->get_stock_summary($medicine['id']);
            $medicine['stock'] = $stock_summary;
            $medicine['available_stock'] = $stock_summary['available_stock'] ?? 0;
            $medicine['total_stock'] = $stock_summary['total_stock'] ?? 0;
            $medicine['is_low_stock'] = false;
            
            // Check if low stock
            $this->load->model('Reorder_model');
            $reorder_level = $this->Reorder_model->get_by_medicine_id($medicine['id']);
            if ($reorder_level && $medicine['available_stock'] < $reorder_level['minimum_stock']) {
                $medicine['is_low_stock'] = true;
                $medicine['minimum_stock'] = $reorder_level['minimum_stock'];
            }
        }
        
        return $medicines;
    }

    /**
     * Get medicine by barcode
     */
    public function get_by_barcode($barcode) {
        $this->db->select('m.*');
        $this->db->from('medicines m');
        $this->db->join('barcodes b', 'm.id = b.medicine_id', 'left');
        $this->db->where('b.barcode', $barcode);
        $this->db->or_where('m.barcode', $barcode);
        $this->db->where('m.status', 'Active');
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get medicine alternatives
     */
    public function get_alternatives($medicine_id, $limit = 5) {
        $this->db->select('
            ma.*,
            m.id as alternative_id,
            m.name as alternative_name,
            m.generic_name as alternative_generic_name,
            m.medicine_code as alternative_code,
            m.category,
            m.strength,
            m.requires_prescription
        ');
        $this->db->from('medicine_alternatives ma');
        $this->db->join('medicines m', 'ma.alternative_medicine_id = m.id', 'left');
        $this->db->where('ma.medicine_id', $medicine_id);
        $this->db->where('ma.is_active', 1);
        $this->db->where('m.status', 'Active');
        $this->db->order_by('ma.similarity_score', 'DESC');
        $this->db->limit($limit);
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Check if medicine is low stock
     */
    public function is_low_stock($medicine_id) {
        $this->load->model('Medicine_stock_model');
        $this->load->model('Reorder_model');
        
        $available_stock = $this->Medicine_stock_model->get_available_stock($medicine_id);
        $reorder_level = $this->Reorder_model->get_by_medicine_id($medicine_id);
        
        if ($reorder_level && $available_stock < $reorder_level['minimum_stock']) {
            return true;
        }
        
        return false;
    }

    /**
     * Search medicines with stock availability
     */
    public function search_with_stock($search_term, $include_out_of_stock = false) {
        $this->db->select('m.*');
        $this->db->from('medicines m');
        
        $search = $this->db->escape_like_str($search_term);
        $this->db->group_start();
        $this->db->like('m.name', $search);
        $this->db->or_like('m.generic_name', $search);
        $this->db->or_like('m.medicine_code', $search);
        $this->db->group_end();
        
        $this->db->where('m.status', 'Active');
        $this->db->order_by('m.name', 'ASC');
        $query = $this->db->get();
        $medicines = $query->result_array();
        
        $this->load->model('Medicine_stock_model');
        
        $results = array();
        foreach ($medicines as $medicine) {
            $available_stock = $this->Medicine_stock_model->get_available_stock($medicine['id']);
            
            if (!$include_out_of_stock && $available_stock <= 0) {
                continue; // Skip out of stock items
            }
            
            $medicine['available_stock'] = $available_stock;
            $medicine['in_stock'] = $available_stock > 0;
            
            // Get pricing from stock
            $stock_summary = $this->Medicine_stock_model->get_stock_summary($medicine['id']);
            $medicine['selling_price'] = $stock_summary['max_price'] ?? 0;
            $medicine['cost_price'] = $stock_summary['min_cost'] ?? 0;
            
            $results[] = $medicine;
        }
        
        return $results;
    }
}

