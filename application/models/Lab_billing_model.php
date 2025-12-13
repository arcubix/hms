<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lab_billing_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique billing ID
     * Format: LAB-BILL-YYYY-XXXXX
     */
    public function generate_billing_id() {
        $year = date('Y');
        $prefix = 'LAB-BILL-' . $year . '-';
        
        $this->db->select('billing_id');
        $this->db->like('billing_id', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('lab_billing');
        
        if ($query->num_rows() > 0) {
            $last_billing = $query->row()->billing_id;
            if (preg_match('/LAB-BILL-' . $year . '-(\d+)/', $last_billing, $matches)) {
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
     * Create billing
     */
    public function create($data) {
        // Generate billing ID if not provided
        if (empty($data['billing_id'])) {
            $data['billing_id'] = $this->generate_billing_id();
        }
        
        // Calculate charges if not provided
        if (empty($data['total_amount']) || $data['total_amount'] == 0) {
            $charges = $this->calculate_charges($data['order_id']);
            $data['total_amount'] = $charges['total'];
            $data['discount'] = isset($charges['discount']) ? $charges['discount'] : 0.00;
            $data['tax'] = isset($charges['tax']) ? $charges['tax'] : 0.00;
        }
        
        // Calculate due amount
        $data['due_amount'] = $data['total_amount'] - (isset($data['paid_amount']) ? $data['paid_amount'] : 0.00);
        
        // Set payment status
        if (empty($data['payment_status'])) {
            if ($data['due_amount'] <= 0) {
                $data['payment_status'] = 'paid';
            } elseif (!empty($data['paid_amount']) && $data['paid_amount'] > 0) {
                $data['payment_status'] = 'partial';
            } else {
                $data['payment_status'] = 'pending';
            }
        }
        
        // Set billing date
        if (empty($data['billing_date'])) {
            $data['billing_date'] = date('Y-m-d');
        }
        
        if ($this->db->insert('lab_billing', $data)) {
            return $this->db->insert_id();
        }
        
        return false;
    }

    /**
     * Get billing by ID
     */
    public function get_by_id($id) {
        $this->db->select('lb.*, p.name as patient_name, lo.order_number');
        $this->db->from('lab_billing lb');
        $this->db->join('patients p', 'p.id = lb.patient_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = lb.order_id', 'left');
        $this->db->where('lb.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get billing by order
     */
    public function get_by_order($order_id) {
        $this->db->select('*');
        $this->db->from('lab_billing');
        $this->db->where('order_id', $order_id);
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Calculate charges for an order
     */
    public function calculate_charges($order_id) {
        // Get order
        $this->load->model('Lab_order_model');
        $order = $this->Lab_order_model->get_by_id($order_id);
        
        if (!$order) {
            return array('total' => 0.00, 'discount' => 0.00, 'tax' => 0.00);
        }
        
        // Calculate total from order tests
        $total = isset($order['total_amount']) ? $order['total_amount'] : 0.00;
        $discount = isset($order['discount']) ? $order['discount'] : 0.00;
        $tax = isset($order['tax']) ? $order['tax'] : 0.00;
        
        return array(
            'total' => $total,
            'discount' => $discount,
            'tax' => $tax,
            'subtotal' => $total - $tax + $discount
        );
    }

    /**
     * Record payment
     */
    public function record_payment($billing_id, $amount) {
        $billing = $this->get_by_id($billing_id);
        if (!$billing) {
            return false;
        }
        
        $new_paid = $billing['paid_amount'] + $amount;
        $due_amount = $billing['total_amount'] - $new_paid;
        
        // Determine payment status
        if ($due_amount <= 0) {
            $payment_status = 'paid';
        } elseif ($new_paid > 0) {
            $payment_status = 'partial';
        } else {
            $payment_status = 'pending';
        }
        
        $this->db->where('id', $billing_id);
        return $this->db->update('lab_billing', array(
            'paid_amount' => $new_paid,
            'due_amount' => $due_amount,
            'payment_status' => $payment_status,
            'updated_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Update billing
     */
    public function update($id, $data) {
        // Recalculate due amount if total or paid amount changed
        if (isset($data['total_amount']) || isset($data['paid_amount'])) {
            $billing = $this->get_by_id($id);
            $total = isset($data['total_amount']) ? $data['total_amount'] : $billing['total_amount'];
            $paid = isset($data['paid_amount']) ? $data['paid_amount'] : $billing['paid_amount'];
            $data['due_amount'] = $total - $paid;
            
            // Update payment status
            if ($data['due_amount'] <= 0) {
                $data['payment_status'] = 'paid';
            } elseif ($paid > 0) {
                $data['payment_status'] = 'partial';
            } else {
                $data['payment_status'] = 'pending';
            }
        }
        
        $this->db->where('id', $id);
        return $this->db->update('lab_billing', $data);
    }
}

