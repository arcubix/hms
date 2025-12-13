<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Invoice_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all invoices with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('i.*, o.name as organization_name, o.organization_code');
        $this->db->from('invoices i');
        $this->db->join('organizations o', 'i.organization_id = o.id', 'inner');
        
        // Apply organization filter
        if (!empty($filters['organization_id'])) {
            $this->db->where('i.organization_id', $filters['organization_id']);
        }
        
        // Apply status filter
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $this->db->where('i.payment_status', $filters['payment_status']);
        }
        
        // Apply invoice type filter
        if (!empty($filters['invoice_type']) && $filters['invoice_type'] !== 'all') {
            $this->db->where('i.invoice_type', $filters['invoice_type']);
        }
        
        // Apply date range filter
        if (!empty($filters['date_from'])) {
            $this->db->where('i.invoice_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('i.invoice_date <=', $filters['date_to']);
        }
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('i.invoice_number', $search);
            $this->db->or_like('o.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('i.invoice_date', 'DESC');
        $this->db->order_by('i.id', 'DESC');
        
        // Apply pagination
        if (isset($filters['limit'])) {
            $offset = isset($filters['offset']) ? $filters['offset'] : 0;
            $this->db->limit($filters['limit'], $offset);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get invoice by ID
     */
    public function get_by_id($id) {
        $this->db->select('i.*, o.name as organization_name, o.organization_code, o.email as organization_email, o.address as organization_address, o.phone as organization_phone');
        $this->db->from('invoices i');
        $this->db->join('organizations o', 'i.organization_id = o.id', 'inner');
        $this->db->where('i.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get invoice by invoice number
     */
    public function get_by_invoice_number($invoice_number) {
        $this->db->where('invoice_number', $invoice_number);
        $query = $this->db->get('invoices');
        return $query->row_array();
    }

    /**
     * Create invoice
     */
    public function create($data) {
        // Generate invoice number
        $invoice_number = $this->generate_invoice_number($data['organization_id']);
        
        $insert_data = array(
            'invoice_number' => $invoice_number,
            'organization_id' => $data['organization_id'],
            'subscription_id' => $data['subscription_id'] ?? null,
            'invoice_date' => $data['invoice_date'] ?? date('Y-m-d'),
            'due_date' => $data['due_date'] ?? date('Y-m-d', strtotime('+30 days')),
            'billing_period_start' => $data['billing_period_start'] ?? null,
            'billing_period_end' => $data['billing_period_end'] ?? null,
            'subtotal' => $data['subtotal'] ?? 0.00,
            'discount' => $data['discount'] ?? 0.00,
            'discount_percentage' => $data['discount_percentage'] ?? 0.00,
            'tax_rate' => $data['tax_rate'] ?? 0.00,
            'tax_amount' => $data['tax_amount'] ?? 0.00,
            'total_amount' => $data['total_amount'] ?? 0.00,
            'paid_amount' => 0.00,
            'due_amount' => $data['total_amount'] ?? 0.00,
            'currency' => $data['currency'] ?? 'PKR',
            'payment_status' => $data['payment_status'] ?? 'draft',
            'invoice_type' => $data['invoice_type'] ?? 'subscription',
            'notes' => $data['notes'] ?? null,
            'terms' => $data['terms'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        if ($this->db->insert('invoices', $insert_data)) {
            $invoice_id = $this->db->insert_id();
            
            // Insert invoice items
            if (!empty($data['items']) && is_array($data['items'])) {
                $this->add_items($invoice_id, $data['items']);
            }
            
            return $invoice_id;
        }
        return false;
    }

    /**
     * Update invoice
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'invoice_date', 'due_date', 'billing_period_start', 'billing_period_end',
            'subtotal', 'discount', 'discount_percentage', 'tax_rate', 'tax_amount',
            'total_amount', 'currency', 'payment_status', 'notes', 'terms'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // Recalculate due amount
        if (isset($update_data['total_amount'])) {
            $invoice = $this->get_by_id($id);
            $update_data['due_amount'] = $update_data['total_amount'] - ($invoice['paid_amount'] ?? 0);
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('invoices', $update_data);
    }

    /**
     * Add items to invoice
     */
    public function add_items($invoice_id, $items) {
        foreach ($items as $item) {
            $item_data = array(
                'invoice_id' => $invoice_id,
                'item_type' => $item['item_type'] ?? 'other',
                'item_code' => $item['item_code'] ?? null,
                'description' => $item['description'],
                'quantity' => $item['quantity'] ?? 1.00,
                'unit_price' => $item['unit_price'] ?? 0.00,
                'discount' => $item['discount'] ?? 0.00,
                'total' => ($item['quantity'] ?? 1.00) * ($item['unit_price'] ?? 0.00) - ($item['discount'] ?? 0.00),
                'notes' => $item['notes'] ?? null
            );
            $this->db->insert('invoice_items', $item_data);
        }
    }

    /**
     * Get invoice items
     */
    public function get_items($invoice_id) {
        $this->db->where('invoice_id', $invoice_id);
        $this->db->order_by('id', 'ASC');
        $query = $this->db->get('invoice_items');
        return $query->result_array();
    }

    /**
     * Update payment status
     */
    public function update_payment_status($invoice_id) {
        $invoice = $this->get_by_id($invoice_id);
        if (!$invoice) {
            return false;
        }
        
        // Calculate total payments
        $this->db->select_sum('amount');
        $this->db->where('invoice_id', $invoice_id);
        $this->db->where('payment_status', 'completed');
        $query = $this->db->get('payments');
        $result = $query->row();
        $paid_amount = $result->amount ?? 0.00;
        
        $due_amount = $invoice['total_amount'] - $paid_amount;
        
        // Determine payment status
        $payment_status = 'draft';
        if ($paid_amount > 0) {
            if ($due_amount <= 0) {
                $payment_status = 'paid';
            } else {
                $payment_status = 'partial';
            }
        }
        
        // Check if overdue
        if ($payment_status !== 'paid' && $due_amount > 0 && strtotime($invoice['due_date']) < strtotime(date('Y-m-d'))) {
            $payment_status = 'overdue';
        }
        
        $update_data = array(
            'paid_amount' => $paid_amount,
            'due_amount' => max(0, $due_amount),
            'payment_status' => $payment_status
        );
        
        if ($payment_status === 'paid') {
            $update_data['paid_at'] = date('Y-m-d H:i:s');
        }
        
        $this->db->where('id', $invoice_id);
        return $this->db->update('invoices', $update_data);
    }

    /**
     * Generate invoice number
     */
    private function generate_invoice_number($organization_id) {
        $this->load->model('Billing_settings_model');
        $settings = $this->Billing_settings_model->get_by_organization($organization_id);
        
        if (!$settings) {
            // Default format
            $prefix = 'INV';
            $year = date('Y');
            $num = 1;
        } else {
            $prefix = $settings['invoice_prefix'] ?? 'INV';
            $year = date('Y');
            $num = $settings['next_invoice_number'] ?? 1;
            
            // Update next invoice number
            $this->Billing_settings_model->increment_invoice_number($organization_id);
        }
        
        $this->load->model('Organization_model');
        $org = $this->Organization_model->get_by_id($organization_id);
        $org_code = $org ? substr($org['organization_code'], 0, 6) : 'ORG';
        
        $invoice_number = str_replace(
            array('{PREFIX}', '{ORG}', '{YEAR}', '{NUM}'),
            array($prefix, $org_code, $year, str_pad($num, 5, '0', STR_PAD_LEFT)),
            $settings['invoice_number_format'] ?? '{PREFIX}-{ORG}-{YEAR}-{NUM}'
        );
        
        return $invoice_number;
    }

    /**
     * Mark invoice as sent
     */
    public function mark_as_sent($invoice_id) {
        $this->db->where('id', $invoice_id);
        return $this->db->update('invoices', array(
            'payment_status' => 'sent',
            'sent_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Get overdue invoices
     */
    public function get_overdue($organization_id = null) {
        $this->db->select('i.*, o.name as organization_name, o.email as organization_email');
        $this->db->from('invoices i');
        $this->db->join('organizations o', 'i.organization_id = o.id', 'inner');
        $this->db->where('i.payment_status !=', 'paid');
        $this->db->where('i.due_date <', date('Y-m-d'));
        $this->db->where('i.due_amount >', 0);
        
        if ($organization_id) {
            $this->db->where('i.organization_id', $organization_id);
        }
        
        $this->db->order_by('i.due_date', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get invoices due soon
     */
    public function get_due_soon($days = 7, $organization_id = null) {
        $date = date('Y-m-d', strtotime("+$days days"));
        
        $this->db->select('i.*, o.name as organization_name, o.email as organization_email');
        $this->db->from('invoices i');
        $this->db->join('organizations o', 'i.organization_id = o.id', 'inner');
        $this->db->where('i.payment_status !=', 'paid');
        $this->db->where('i.due_date <=', $date);
        $this->db->where('i.due_date >=', date('Y-m-d'));
        $this->db->where('i.due_amount >', 0);
        
        if ($organization_id) {
            $this->db->where('i.organization_id', $organization_id);
        }
        
        $this->db->order_by('i.due_date', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
}

