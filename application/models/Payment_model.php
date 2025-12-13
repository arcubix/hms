<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Payment_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all payments with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('p.*, i.invoice_number, o.name as organization_name, o.organization_code, u.name as processed_by_name');
        $this->db->from('payments p');
        $this->db->join('invoices i', 'p.invoice_id = i.id', 'inner');
        $this->db->join('organizations o', 'p.organization_id = o.id', 'inner');
        $this->db->join('users u', 'p.processed_by = u.id', 'left');
        
        // Apply organization filter
        if (!empty($filters['organization_id'])) {
            $this->db->where('p.organization_id', $filters['organization_id']);
        }
        
        // Apply invoice filter
        if (!empty($filters['invoice_id'])) {
            $this->db->where('p.invoice_id', $filters['invoice_id']);
        }
        
        // Apply status filter
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $this->db->where('p.payment_status', $filters['payment_status']);
        }
        
        // Apply payment method filter
        if (!empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $this->db->where('p.payment_method', $filters['payment_method']);
        }
        
        // Apply date range filter
        if (!empty($filters['date_from'])) {
            $this->db->where('p.payment_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('p.payment_date <=', $filters['date_to']);
        }
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('p.payment_number', $search);
            $this->db->or_like('i.invoice_number', $search);
            $this->db->or_like('p.transaction_id', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('p.payment_date', 'DESC');
        $this->db->order_by('p.id', 'DESC');
        
        // Apply pagination
        if (isset($filters['limit'])) {
            $offset = isset($filters['offset']) ? $filters['offset'] : 0;
            $this->db->limit($filters['limit'], $offset);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get payment by ID
     */
    public function get_by_id($id) {
        $this->db->select('p.*, i.invoice_number, i.total_amount as invoice_total, i.due_amount as invoice_due, o.name as organization_name, o.organization_code, u.name as processed_by_name');
        $this->db->from('payments p');
        $this->db->join('invoices i', 'p.invoice_id = i.id', 'inner');
        $this->db->join('organizations o', 'p.organization_id = o.id', 'inner');
        $this->db->join('users u', 'p.processed_by = u.id', 'left');
        $this->db->where('p.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get payment by payment number
     */
    public function get_by_payment_number($payment_number) {
        $this->db->where('payment_number', $payment_number);
        $query = $this->db->get('payments');
        return $query->row_array();
    }

    /**
     * Create payment
     */
    public function create($data) {
        // Generate payment number
        $payment_number = $this->generate_payment_number($data['organization_id']);
        
        $insert_data = array(
            'payment_number' => $payment_number,
            'invoice_id' => $data['invoice_id'],
            'organization_id' => $data['organization_id'],
            'payment_date' => $data['payment_date'] ?? date('Y-m-d'),
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? 'bank_transfer',
            'transaction_id' => $data['transaction_id'] ?? null,
            'bank_name' => $data['bank_name'] ?? null,
            'cheque_number' => $data['cheque_number'] ?? null,
            'payment_status' => $data['payment_status'] ?? 'completed',
            'notes' => $data['notes'] ?? null,
            'receipt_path' => $data['receipt_path'] ?? null,
            'processed_by' => $data['processed_by'] ?? null
        );
        
        if ($this->db->insert('payments', $insert_data)) {
            $payment_id = $this->db->insert_id();
            
            // Update invoice payment status
            $this->load->model('Invoice_model');
            $this->Invoice_model->update_payment_status($data['invoice_id']);
            
            return $payment_id;
        }
        return false;
    }

    /**
     * Update payment
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'payment_date', 'amount', 'payment_method', 'transaction_id',
            'bank_name', 'cheque_number', 'payment_status', 'notes', 'receipt_path'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        $result = $this->db->update('payments', $update_data);
        
        if ($result) {
            // Update invoice payment status
            $payment = $this->get_by_id($id);
            if ($payment) {
                $this->load->model('Invoice_model');
                $this->Invoice_model->update_payment_status($payment['invoice_id']);
            }
        }
        
        return $result;
    }

    /**
     * Delete payment
     */
    public function delete($id) {
        $payment = $this->get_by_id($id);
        if (!$payment) {
            return false;
        }
        
        $invoice_id = $payment['invoice_id'];
        
        $this->db->where('id', $id);
        $result = $this->db->delete('payments');
        
        if ($result) {
            // Update invoice payment status
            $this->load->model('Invoice_model');
            $this->Invoice_model->update_payment_status($invoice_id);
        }
        
        return $result;
    }

    /**
     * Generate payment number
     */
    private function generate_payment_number($organization_id) {
        $this->load->model('Billing_settings_model');
        $settings = $this->Billing_settings_model->get_by_organization($organization_id);
        
        if (!$settings) {
            // Default format
            $prefix = 'PAY';
            $year = date('Y');
            $num = 1;
        } else {
            $prefix = $settings['payment_prefix'] ?? 'PAY';
            $year = date('Y');
            $num = $settings['next_payment_number'] ?? 1;
            
            // Update next payment number
            $this->Billing_settings_model->increment_payment_number($organization_id);
        }
        
        $this->load->model('Organization_model');
        $org = $this->Organization_model->get_by_id($organization_id);
        $org_code = $org ? substr($org['organization_code'], 0, 6) : 'ORG';
        
        $payment_number = str_replace(
            array('{PREFIX}', '{ORG}', '{YEAR}', '{NUM}'),
            array($prefix, $org_code, $year, str_pad($num, 5, '0', STR_PAD_LEFT)),
            $settings['payment_number_format'] ?? '{PREFIX}-{ORG}-{YEAR}-{NUM}'
        );
        
        return $payment_number;
    }

    /**
     * Get payments for invoice
     */
    public function get_by_invoice($invoice_id) {
        $this->db->where('invoice_id', $invoice_id);
        $this->db->order_by('payment_date', 'DESC');
        $query = $this->db->get('payments');
        return $query->result_array();
    }

    /**
     * Get total payments for invoice
     */
    public function get_total_paid($invoice_id) {
        $this->db->select_sum('amount');
        $this->db->where('invoice_id', $invoice_id);
        $this->db->where('payment_status', 'completed');
        $query = $this->db->get('payments');
        $result = $query->row();
        return $result->amount ?? 0.00;
    }

    /**
     * Get payment statistics
     */
    public function get_statistics($organization_id = null, $date_from = null, $date_to = null) {
        $this->db->select_sum('amount');
        $this->db->where('payment_status', 'completed');
        
        if ($organization_id) {
            $this->db->where('organization_id', $organization_id);
        }
        
        if ($date_from) {
            $this->db->where('payment_date >=', $date_from);
        }
        if ($date_to) {
            $this->db->where('payment_date <=', $date_to);
        }
        
        $query = $this->db->get('payments');
        $result = $query->row();
        
        return array(
            'total_paid' => $result->amount ?? 0.00,
            'total_payments' => $this->db->count_all_results('payments')
        );
    }
}

