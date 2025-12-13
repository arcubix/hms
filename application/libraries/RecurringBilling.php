<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * RecurringBilling Library
 * Handles automated recurring billing and invoice generation
 */
class RecurringBilling {

    private $CI;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->database();
        $this->CI->load->model('Organization_subscription_model');
        $this->CI->load->model('Invoice_model');
        $this->CI->load->model('Billing_settings_model');
        $this->CI->load->library('BillingCalculator');
        $this->CI->load->library('InvoiceGenerator');
    }

    /**
     * Process recurring billing for subscriptions due today
     * This should be called by a cron job daily
     */
    public function process_recurring_billing() {
        $today = date('Y-m-d');
        
        // Get subscriptions with next_billing_date = today and auto_renew = 1
        $this->CI->db->select('os.*');
        $this->CI->db->from('organization_subscriptions os');
        $this->CI->db->where('os.next_billing_date', $today);
        $this->CI->db->where('os.auto_renew', 1);
        $this->CI->db->where('os.status', 'active');
        $query = $this->CI->db->get();
        $subscriptions = $query->result_array();
        
        $processed = 0;
        $errors = array();
        
        foreach ($subscriptions as $subscription) {
            try {
                // Calculate invoice amount
                $calculation = $this->CI->billingcalculator->calculate_subscription_invoice($subscription['id']);
                if (!$calculation) {
                    $errors[] = "Failed to calculate invoice for subscription #{$subscription['subscription_number']}";
                    continue;
                }
                
                // Create invoice items
                $items = $this->CI->billingcalculator->create_subscription_items($subscription['id']);
                
                // Get billing settings
                $settings = $this->CI->Billing_settings_model->get_by_organization($subscription['organization_id']);
                
                // Create invoice
                $invoice_data = array(
                    'organization_id' => $subscription['organization_id'],
                    'subscription_id' => $subscription['id'],
                    'invoice_date' => $today,
                    'due_date' => $this->CI->billingcalculator->calculate_due_date($subscription['organization_id'], $today),
                    'billing_period_start' => $subscription['start_date'],
                    'billing_period_end' => $subscription['end_date'],
                    'subtotal' => $calculation['subtotal'],
                    'discount' => $calculation['discount'],
                    'discount_percentage' => $calculation['discount_percentage'],
                    'tax_rate' => $calculation['tax_rate'],
                    'tax_amount' => $calculation['tax_amount'],
                    'total_amount' => $calculation['total_amount'],
                    'currency' => $settings ? $settings['currency'] : 'PKR',
                    'payment_status' => 'draft',
                    'invoice_type' => 'subscription',
                    'items' => $items
                );
                
                $invoice_id = $this->CI->Invoice_model->create($invoice_data);
                
                if ($invoice_id) {
                    // Renew subscription
                    $this->CI->Organization_subscription_model->renew($subscription['id']);
                    
                    // Auto-send invoice if enabled
                    if ($settings && $settings['auto_generate_invoice'] && $settings['email_invoice']) {
                        $this->CI->invoicegenerator->send_email($invoice_id);
                    }
                    
                    $processed++;
                } else {
                    $errors[] = "Failed to create invoice for subscription #{$subscription['subscription_number']}";
                }
            } catch (Exception $e) {
                $errors[] = "Error processing subscription #{$subscription['subscription_number']}: " . $e->getMessage();
                log_message('error', 'RecurringBilling error: ' . $e->getMessage());
            }
        }
        
        return array(
            'processed' => $processed,
            'errors' => $errors
        );
    }

    /**
     * Check and mark expired subscriptions
     */
    public function check_expired_subscriptions() {
        $today = date('Y-m-d');
        
        $expired = $this->CI->Organization_subscription_model->get_expired();
        
        foreach ($expired as $subscription) {
            // Update subscription status to expired
            $this->CI->Organization_subscription_model->update($subscription['id'], array(
                'status' => 'expired'
            ));
            
            // Update organization subscription status
            $this->CI->load->model('Organization_model');
            $this->CI->Organization_model->update($subscription['organization_id'], array(
                'subscription_status' => 'expired'
            ));
        }
        
        return count($expired);
    }

    /**
     * Send overdue invoice reminders
     */
    public function send_overdue_reminders() {
        $settings = $this->CI->Billing_settings_model->get_all();
        $reminders_sent = 0;
        
        foreach ($settings as $setting) {
            if (!$setting['overdue_reminder_interval']) {
                continue;
            }
            
            $overdue_invoices = $this->CI->Invoice_model->get_overdue($setting['organization_id']);
            
            foreach ($overdue_invoices as $invoice) {
                // Check if reminder was sent recently
                $days_overdue = (strtotime(date('Y-m-d')) - strtotime($invoice['due_date'])) / 86400;
                
                // Send reminder if overdue by reminder interval days
                if ($days_overdue >= $setting['overdue_reminder_interval'] && 
                    ($days_overdue % $setting['overdue_reminder_interval'] == 0)) {
                    
                    if ($this->CI->invoicegenerator->send_email($invoice['id'])) {
                        $reminders_sent++;
                    }
                }
            }
        }
        
        return $reminders_sent;
    }
}

