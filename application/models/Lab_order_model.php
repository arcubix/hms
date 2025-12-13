<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lab_order_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique order number
     * Format: LAB-YYYY-XXXXX
     */
    public function generate_order_number() {
        $year = date('Y');
        $prefix = 'LAB-' . $year . '-';
        
        $this->db->select('order_number');
        $this->db->like('order_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('lab_orders');
        
        if ($query->num_rows() > 0) {
            $last_order = $query->row()->order_number;
            if (preg_match('/LAB-' . $year . '-(\d+)/', $last_order, $matches)) {
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
     * Create lab order
     */
    public function create($data) {
        // Generate order number if not provided
        if (empty($data['order_number'])) {
            $data['order_number'] = $this->generate_order_number();
        }
        
        // Set defaults
        if (empty($data['order_date'])) {
            $data['order_date'] = date('Y-m-d');
        }
        if (empty($data['order_time'])) {
            $data['order_time'] = date('H:i:s');
        }
        if (empty($data['status'])) {
            $data['status'] = 'ordered';
        }
        if (empty($data['payment_status'])) {
            $data['payment_status'] = 'pending';
        }
        
        $this->db->trans_start();
        
        // Insert order
        if (!$this->db->insert('lab_orders', $data)) {
            $this->db->trans_rollback();
            return false;
        }
        
        $order_id = $this->db->insert_id();
        
        // Insert order tests if provided
        if (!empty($data['tests']) && is_array($data['tests'])) {
            foreach ($data['tests'] as $test) {
                $test_data = array(
                    'order_id' => $order_id,
                    'lab_test_id' => isset($test['lab_test_id']) ? $test['lab_test_id'] : null,
                    'test_name' => $test['test_name'],
                    'test_code' => isset($test['test_code']) ? $test['test_code'] : null,
                    'price' => isset($test['price']) ? $test['price'] : 0.00,
                    'status' => 'ordered',
                    'priority' => isset($test['priority']) ? $test['priority'] : $data['priority'],
                    'instructions' => isset($test['instructions']) ? $test['instructions'] : null,
                    'organization_id' => isset($data['organization_id']) ? $data['organization_id'] : null
                );
                
                if (!$this->db->insert('lab_order_tests', $test_data)) {
                    $this->db->trans_rollback();
                    return false;
                }
            }
            
            // Calculate total amount
            $this->calculate_total($order_id);
        }
        
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return $order_id;
    }

    /**
     * Get order by ID with related data
     */
    public function get_by_id($id) {
        $this->db->select('lo.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender, u.name as ordered_by_name');
        $this->db->from('lab_orders lo');
        $this->db->join('patients p', 'p.id = lo.patient_id', 'left');
        $this->db->join('users u', 'u.id = lo.ordered_by_user_id', 'left');
        $this->db->where('lo.id', $id);
        $query = $this->db->get();
        
        $order = $query->row_array();
        
        if ($order) {
            // Get order tests
            $this->db->select('lot.*, lt.test_name as lab_test_name, lt.test_code as lab_test_code');
            $this->db->from('lab_order_tests lot');
            $this->db->join('lab_tests lt', 'lt.id = lot.lab_test_id', 'left');
            $this->db->where('lot.order_id', $id);
            $this->db->order_by('lot.id', 'ASC');
            $query = $this->db->get();
            $order['tests'] = $query->result_array();
        }
        
        return $order;
    }

    /**
     * Get all orders with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('lo.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender');
        $this->db->from('lab_orders lo');
        $this->db->join('patients p', 'p.id = lo.patient_id', 'left');
        
        if (!empty($filters['status'])) {
            $this->db->where('lo.status', $filters['status']);
        }
        
        if (!empty($filters['order_type'])) {
            $this->db->where('lo.order_type', $filters['order_type']);
        }
        
        if (!empty($filters['priority'])) {
            $this->db->where('lo.priority', $filters['priority']);
        }
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('lo.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('lo.order_date >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('lo.order_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('lo.order_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['organization_id'])) {
            $this->db->where('lo.organization_id', $filters['organization_id']);
        }
        
        $this->db->order_by('lo.order_date', 'DESC');
        $this->db->order_by('lo.order_time', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], isset($filters['offset']) ? $filters['offset'] : 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get orders by patient
     */
    public function get_by_patient($patient_id, $limit = null) {
        $filters = array('patient_id' => $patient_id);
        if ($limit) {
            $filters['limit'] = $limit;
        }
        return $this->get_all($filters);
    }

    /**
     * Get orders by status
     */
    public function get_by_status($status, $organization_id = null) {
        $filters = array('status' => $status);
        if ($organization_id) {
            $filters['organization_id'] = $organization_id;
        }
        return $this->get_all($filters);
    }

    /**
     * Update order status
     */
    public function update_status($order_id, $status) {
        $this->db->where('id', $order_id);
        return $this->db->update('lab_orders', array(
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Calculate total amount for order
     */
    public function calculate_total($order_id) {
        $this->db->select_sum('price', 'total');
        $this->db->from('lab_order_tests');
        $this->db->where('order_id', $order_id);
        $query = $this->db->get();
        $total = $query->row()->total ?: 0.00;
        
        // Get discount and tax from order
        $order = $this->get_by_id($order_id);
        $discount = isset($order['discount']) ? $order['discount'] : 0.00;
        $tax = isset($order['tax']) ? $order['tax'] : 0.00;
        
        $final_total = $total - $discount + $tax;
        
        $this->db->where('id', $order_id);
        return $this->db->update('lab_orders', array(
            'total_amount' => $final_total,
            'updated_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Update order
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('lab_orders', $data);
    }
}

