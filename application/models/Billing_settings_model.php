<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Billing_settings_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get billing settings by organization ID
     */
    public function get_by_organization($organization_id) {
        $this->db->where('organization_id', $organization_id);
        $query = $this->db->get('billing_settings');
        return $query->row_array();
    }

    /**
     * Create or update billing settings
     */
    public function create_or_update($organization_id, $data) {
        $existing = $this->get_by_organization($organization_id);
        
        $settings_data = array(
            'organization_id' => $organization_id,
            'invoice_prefix' => $data['invoice_prefix'] ?? 'INV',
            'invoice_number_format' => $data['invoice_number_format'] ?? '{PREFIX}-{ORG}-{YEAR}-{NUM}',
            'next_invoice_number' => $data['next_invoice_number'] ?? 1,
            'payment_prefix' => $data['payment_prefix'] ?? 'PAY',
            'payment_number_format' => $data['payment_number_format'] ?? '{PREFIX}-{ORG}-{YEAR}-{NUM}',
            'next_payment_number' => $data['next_payment_number'] ?? 1,
            'tax_rate' => $data['tax_rate'] ?? 0.00,
            'tax_name' => $data['tax_name'] ?? 'Sales Tax',
            'payment_terms_days' => $data['payment_terms_days'] ?? 30,
            'currency' => $data['currency'] ?? 'PKR',
            'currency_symbol' => $data['currency_symbol'] ?? 'Rs.',
            'invoice_footer' => $data['invoice_footer'] ?? null,
            'invoice_notes' => $data['invoice_notes'] ?? null,
            'email_invoice' => $data['email_invoice'] ?? 1,
            'email_template' => $data['email_template'] ?? null,
            'auto_generate_invoice' => $data['auto_generate_invoice'] ?? 1,
            'reminder_days_before_due' => $data['reminder_days_before_due'] ?? 7,
            'overdue_reminder_interval' => $data['overdue_reminder_interval'] ?? 7
        );
        
        if ($existing) {
            // Update existing
            $this->db->where('organization_id', $organization_id);
            return $this->db->update('billing_settings', $settings_data);
        } else {
            // Create new
            return $this->db->insert('billing_settings', $settings_data);
        }
    }

    /**
     * Update billing settings
     */
    public function update($organization_id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'invoice_prefix', 'invoice_number_format', 'payment_prefix', 'payment_number_format',
            'tax_rate', 'tax_name', 'payment_terms_days', 'currency', 'currency_symbol',
            'invoice_footer', 'invoice_notes', 'email_invoice', 'email_template',
            'auto_generate_invoice', 'reminder_days_before_due', 'overdue_reminder_interval'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('organization_id', $organization_id);
        return $this->db->update('billing_settings', $update_data);
    }

    /**
     * Increment invoice number
     */
    public function increment_invoice_number($organization_id) {
        $this->db->set('next_invoice_number', 'next_invoice_number + 1', false);
        $this->db->where('organization_id', $organization_id);
        return $this->db->update('billing_settings');
    }

    /**
     * Increment payment number
     */
    public function increment_payment_number($organization_id) {
        $this->db->set('next_payment_number', 'next_payment_number + 1', false);
        $this->db->where('organization_id', $organization_id);
        return $this->db->update('billing_settings');
    }

    /**
     * Get next invoice number
     */
    public function get_next_invoice_number($organization_id) {
        $settings = $this->get_by_organization($organization_id);
        return $settings ? $settings['next_invoice_number'] : 1;
    }

    /**
     * Get next payment number
     */
    public function get_next_payment_number($organization_id) {
        $settings = $this->get_by_organization($organization_id);
        return $settings ? $settings['next_payment_number'] : 1;
    }
}

