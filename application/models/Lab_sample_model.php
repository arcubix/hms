<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lab_sample_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique sample ID
     * Format: SMP-YYYY-XXXXX
     */
    public function generate_sample_id() {
        $year = date('Y');
        $prefix = 'SMP-' . $year . '-';
        
        $this->db->select('sample_id');
        $this->db->like('sample_id', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('lab_samples');
        
        if ($query->num_rows() > 0) {
            $last_sample = $query->row()->sample_id;
            if (preg_match('/SMP-' . $year . '-(\d+)/', $last_sample, $matches)) {
                $next_number = intval($matches[1]) + 1;
            } else {
                $next_number = 1;
            }
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Generate barcode
     */
    public function generate_barcode() {
        // Simple barcode generation - can be enhanced with barcode library
        return 'BC' . date('Ymd') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }

    /**
     * Create sample
     */
    public function create($data) {
        // Generate sample ID if not provided
        if (empty($data['sample_id'])) {
            $data['sample_id'] = $this->generate_sample_id();
        }
        
        // Generate barcode if not provided
        if (empty($data['barcode'])) {
            $data['barcode'] = $this->generate_barcode();
        }
        
        // Set defaults
        if (empty($data['status'])) {
            $data['status'] = 'pending';
        }
        
        if ($this->db->insert('lab_samples', $data)) {
            $sample_id = $this->db->insert_id();
            
            // Update order test status
            if (!empty($data['order_test_id'])) {
                $this->db->where('id', $data['order_test_id']);
                $this->db->update('lab_order_tests', array('status' => 'sample-collected'));
            }
            
            return $sample_id;
        }
        
        return false;
    }

    /**
     * Get sample by ID
     */
    public function get_by_id($id) {
        $this->db->select('ls.*, p.name as patient_name, lt.test_name, lo.order_number');
        $this->db->from('lab_samples ls');
        $this->db->join('patients p', 'p.id = ls.patient_id', 'left');
        $this->db->join('lab_tests lt', 'lt.id = ls.test_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = ls.order_id', 'left');
        $this->db->where('ls.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get sample by barcode
     */
    public function get_by_barcode($barcode) {
        $this->db->select('ls.*, p.name as patient_name, lt.test_name, lo.order_number');
        $this->db->from('lab_samples ls');
        $this->db->join('patients p', 'p.id = ls.patient_id', 'left');
        $this->db->join('lab_tests lt', 'lt.id = ls.test_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = ls.order_id', 'left');
        $this->db->where('ls.barcode', $barcode);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get samples by order
     */
    public function get_by_order($order_id) {
        $this->db->select('ls.*, p.name as patient_name, lt.test_name');
        $this->db->from('lab_samples ls');
        $this->db->join('patients p', 'p.id = ls.patient_id', 'left');
        $this->db->join('lab_tests lt', 'lt.id = ls.test_id', 'left');
        $this->db->where('ls.order_id', $order_id);
        $this->db->order_by('ls.collection_date', 'DESC');
        $this->db->order_by('ls.collection_time', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get all samples with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('ls.*, p.name as patient_name, lt.test_name, lo.order_number');
        $this->db->from('lab_samples ls');
        $this->db->join('patients p', 'p.id = ls.patient_id', 'left');
        $this->db->join('lab_tests lt', 'lt.id = ls.test_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = ls.order_id', 'left');
        
        if (!empty($filters['status'])) {
            $this->db->where('ls.status', $filters['status']);
        }
        
        if (!empty($filters['order_id'])) {
            $this->db->where('ls.order_id', $filters['order_id']);
        }
        
        if (!empty($filters['collection_date'])) {
            $this->db->where('ls.collection_date', $filters['collection_date']);
        }
        
        if (!empty($filters['organization_id'])) {
            $this->db->where('ls.organization_id', $filters['organization_id']);
        }
        
        $this->db->order_by('ls.collection_date', 'DESC');
        $this->db->order_by('ls.collection_time', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update sample status
     */
    public function update_status($id, $status) {
        $this->db->where('id', $id);
        return $this->db->update('lab_samples', array(
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Update sample
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('lab_samples', $data);
    }
}

