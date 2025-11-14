<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Sale_payment_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all payments for a sale
     */
    public function get_by_sale($sale_id) {
        $this->db->where('sale_id', $sale_id);
        $this->db->order_by('created_at', 'ASC');
        $query = $this->db->get('sale_payments');
        return $query->result_array();
    }

    /**
     * Create payment record
     */
    public function create($data) {
        if ($this->db->insert('sale_payments', $data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Create multiple payment records
     */
    public function create_multiple($payments) {
        if (!empty($payments) && is_array($payments)) {
            return $this->db->insert_batch('sale_payments', $payments);
        }
        return false;
    }

    /**
     * Delete payments for a sale
     */
    public function delete_by_sale($sale_id) {
        $this->db->where('sale_id', $sale_id);
        return $this->db->delete('sale_payments');
    }

    /**
     * Get total amount paid for a sale
     */
    public function get_total_paid($sale_id) {
        $this->db->select_sum('amount');
        $this->db->where('sale_id', $sale_id);
        $query = $this->db->get('sale_payments');
        $result = $query->row();
        return $result ? (float)$result->amount : 0.00;
    }
}

