<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * BillingCalculator Library
 * Calculates subscription and add-on billing amounts
 */
class BillingCalculator {

    private $CI;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->database();
        $this->CI->load->model('Subscription_plan_model');
        $this->CI->load->model('Organization_subscription_model');
        $this->CI->load->model('Billing_settings_model');
    }

    /**
     * Calculate subscription invoice amount
     * @param int $subscription_id Subscription ID
     * @return array Invoice calculation data
     */
    public function calculate_subscription_invoice($subscription_id) {
        $subscription = $this->CI->Organization_subscription_model->get_by_id($subscription_id);
        if (!$subscription) {
            return false;
        }
        
        $organization_id = $subscription['organization_id'];
        $plan = $this->CI->Subscription_plan_model->get_by_id($subscription['subscription_plan_id']);
        if (!$plan) {
            return false;
        }
        
        // Get billing settings for tax
        $settings = $this->CI->Billing_settings_model->get_by_organization($organization_id);
        $tax_rate = $settings ? $settings['tax_rate'] : 0.00;
        
        // Calculate base price
        $subtotal = $this->CI->Subscription_plan_model->calculate_price($plan['id'], $subscription['billing_cycle']);
        
        // Calculate add-ons
        $addons_total = $this->calculate_addons_total($organization_id, $subscription['billing_cycle']);
        
        $subtotal += $addons_total;
        
        // Calculate discount (if any)
        $discount = 0.00;
        $discount_percentage = 0.00;
        
        // Calculate tax
        $tax_amount = ($subtotal - $discount) * ($tax_rate / 100);
        
        // Calculate total
        $total_amount = $subtotal - $discount + $tax_amount;
        
        return array(
            'subtotal' => $subtotal,
            'discount' => $discount,
            'discount_percentage' => $discount_percentage,
            'tax_rate' => $tax_rate,
            'tax_amount' => $tax_amount,
            'total_amount' => $total_amount,
            'billing_period_start' => $subscription['start_date'],
            'billing_period_end' => $subscription['end_date']
        );
    }

    /**
     * Calculate total for add-ons
     * @param int $organization_id Organization ID
     * @param string $billing_cycle Billing cycle
     * @return float Total add-ons amount
     */
    private function calculate_addons_total($organization_id, $billing_cycle) {
        $this->CI->db->select_sum('total_price');
        $this->CI->db->where('organization_id', $organization_id);
        $this->CI->db->where('status', 'active');
        $this->CI->db->where('billing_cycle', $billing_cycle);
        $this->CI->db->where('(end_date IS NULL OR end_date >= CURDATE())');
        $query = $this->CI->db->get('subscription_addons');
        $result = $query->row();
        return $result->total_price ?? 0.00;
    }

    /**
     * Create invoice items from subscription
     * @param int $subscription_id Subscription ID
     * @return array Invoice items
     */
    public function create_subscription_items($subscription_id) {
        $subscription = $this->CI->Organization_subscription_model->get_by_id($subscription_id);
        if (!$subscription) {
            return array();
        }
        
        $plan = $this->CI->Subscription_plan_model->get_by_id($subscription['subscription_plan_id']);
        if (!$plan) {
            return array();
        }
        
        $items = array();
        
        // Add subscription item
        $price = $this->CI->Subscription_plan_model->calculate_price($plan['id'], $subscription['billing_cycle']);
        $items[] = array(
            'item_type' => 'subscription',
            'item_code' => $plan['plan_code'],
            'description' => $plan['name'] . ' (' . ucfirst($subscription['billing_cycle']) . ')',
            'quantity' => 1,
            'unit_price' => $price,
            'total' => $price
        );
        
        // Add add-on items
        $this->CI->db->where('organization_id', $subscription['organization_id']);
        $this->CI->db->where('status', 'active');
        $this->CI->db->where('billing_cycle', $subscription['billing_cycle']);
        $this->CI->db->where('(end_date IS NULL OR end_date >= CURDATE())');
        $addons = $this->CI->db->get('subscription_addons')->result_array();
        
        foreach ($addons as $addon) {
            $items[] = array(
                'item_type' => $addon['addon_type'] . '_addon',
                'item_code' => $addon['addon_key'],
                'description' => $addon['addon_name'] . ' (x' . $addon['quantity'] . ')',
                'quantity' => $addon['quantity'],
                'unit_price' => $addon['unit_price'],
                'total' => $addon['total_price']
            );
        }
        
        return $items;
    }

    /**
     * Calculate due date based on payment terms
     * @param int $organization_id Organization ID
     * @param string $invoice_date Invoice date
     * @return string Due date
     */
    public function calculate_due_date($organization_id, $invoice_date = null) {
        if (!$invoice_date) {
            $invoice_date = date('Y-m-d');
        }
        
        $settings = $this->CI->Billing_settings_model->get_by_organization($organization_id);
        $days = $settings ? $settings['payment_terms_days'] : 30;
        
        return date('Y-m-d', strtotime($invoice_date . " +$days days"));
    }
}

