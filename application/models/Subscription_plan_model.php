<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Subscription_plan_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all subscription plans
     */
    public function get_all($filters = array()) {
        $this->db->select('*');
        $this->db->from('subscription_plans');
        
        // Apply plan type filter
        if (!empty($filters['plan_type']) && $filters['plan_type'] !== 'all') {
            $this->db->where('plan_type', $filters['plan_type']);
        }
        
        // Apply billing cycle filter
        if (!empty($filters['billing_cycle']) && $filters['billing_cycle'] !== 'all') {
            $this->db->where('billing_cycle', $filters['billing_cycle']);
        }
        
        // Apply active filter
        if (isset($filters['is_active'])) {
            $this->db->where('is_active', $filters['is_active']);
        }
        
        $this->db->order_by('display_order', 'ASC');
        $this->db->order_by('base_price', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get subscription plan by ID
     */
    public function get_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('subscription_plans');
        return $query->row_array();
    }

    /**
     * Get subscription plan by code
     */
    public function get_by_code($code) {
        $this->db->where('plan_code', $code);
        $query = $this->db->get('subscription_plans');
        return $query->row_array();
    }

    /**
     * Create subscription plan
     */
    public function create($data) {
        $insert_data = array(
            'plan_code' => $data['plan_code'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'plan_type' => $data['plan_type'] ?? 'basic',
            'billing_cycle' => $data['billing_cycle'] ?? 'monthly',
            'base_price' => $data['base_price'] ?? 0.00,
            'yearly_discount' => $data['yearly_discount'] ?? 0.00,
            'included_modules' => isset($data['included_modules']) && is_array($data['included_modules']) 
                ? json_encode($data['included_modules']) 
                : null,
            'max_users' => $data['max_users'] ?? 5,
            'max_patients' => $data['max_patients'] ?? null,
            'max_storage_gb' => $data['max_storage_gb'] ?? 10,
            'features' => isset($data['features']) && is_array($data['features']) 
                ? json_encode($data['features']) 
                : null,
            'is_active' => $data['is_active'] ?? 1,
            'display_order' => $data['display_order'] ?? 0
        );
        
        if ($this->db->insert('subscription_plans', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update subscription plan
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'name', 'description', 'plan_type', 'billing_cycle', 'base_price',
            'yearly_discount', 'max_users', 'max_patients', 'max_storage_gb',
            'is_active', 'display_order'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // Handle JSON fields
        if (isset($data['included_modules']) && is_array($data['included_modules'])) {
            $update_data['included_modules'] = json_encode($data['included_modules']);
        }
        
        if (isset($data['features']) && is_array($data['features'])) {
            $update_data['features'] = json_encode($data['features']);
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('subscription_plans', $update_data);
    }

    /**
     * Delete subscription plan
     */
    public function delete($id) {
        // Check if plan is in use
        $this->db->where('subscription_plan_id', $id);
        $count = $this->db->count_all_results('organization_subscriptions');
        
        if ($count > 0) {
            return false; // Cannot delete plan that is in use
        }
        
        $this->db->where('id', $id);
        return $this->db->delete('subscription_plans');
    }

    /**
     * Get active plans only
     */
    public function get_active_plans($billing_cycle = null) {
        $this->db->where('is_active', 1);
        
        if ($billing_cycle) {
            $this->db->where('billing_cycle', $billing_cycle);
        }
        
        $this->db->order_by('display_order', 'ASC');
        $query = $this->db->get('subscription_plans');
        return $query->result_array();
    }

    /**
     * Calculate plan price with discount
     */
    public function calculate_price($plan_id, $billing_cycle = 'monthly') {
        $plan = $this->get_by_id($plan_id);
        if (!$plan) {
            return 0.00;
        }
        
        $price = $plan['base_price'];
        
        if ($billing_cycle === 'yearly' && $plan['yearly_discount'] > 0) {
            $discount = ($price * $plan['yearly_discount']) / 100;
            $price = $price - $discount;
        }
        
        return $price;
    }
}

