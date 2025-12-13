<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Organization_subscription_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all subscriptions with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('os.*, o.name as organization_name, o.organization_code, sp.name as plan_name, sp.plan_code, sp.base_price');
        $this->db->from('organization_subscriptions os');
        $this->db->join('organizations o', 'os.organization_id = o.id', 'inner');
        $this->db->join('subscription_plans sp', 'os.subscription_plan_id = sp.id', 'inner');
        
        // Apply organization filter
        if (!empty($filters['organization_id'])) {
            $this->db->where('os.organization_id', $filters['organization_id']);
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('os.status', $filters['status']);
        }
        
        // Apply plan filter
        if (!empty($filters['subscription_plan_id'])) {
            $this->db->where('os.subscription_plan_id', $filters['subscription_plan_id']);
        }
        
        $this->db->order_by('os.start_date', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get subscription by ID
     */
    public function get_by_id($id) {
        $this->db->select('os.*, o.name as organization_name, o.organization_code, sp.name as plan_name, sp.plan_code, sp.base_price, sp.included_modules, sp.max_users');
        $this->db->from('organization_subscriptions os');
        $this->db->join('organizations o', 'os.organization_id = o.id', 'inner');
        $this->db->join('subscription_plans sp', 'os.subscription_plan_id = sp.id', 'inner');
        $this->db->where('os.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get active subscription for organization
     */
    public function get_active_subscription($organization_id) {
        $this->db->select('os.*, sp.name as plan_name, sp.plan_code, sp.base_price, sp.included_modules, sp.max_users');
        $this->db->from('organization_subscriptions os');
        $this->db->join('subscription_plans sp', 'os.subscription_plan_id = sp.id', 'inner');
        $this->db->where('os.organization_id', $organization_id);
        $this->db->where('os.status', 'active');
        $this->db->order_by('os.start_date', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Create subscription
     */
    public function create($data) {
        // Calculate dates
        $start_date = $data['start_date'] ?? date('Y-m-d');
        $billing_cycle = $data['billing_cycle'] ?? 'monthly';
        
        // Calculate end date and next billing date
        $end_date = $this->calculate_end_date($start_date, $billing_cycle);
        $next_billing_date = $this->calculate_next_billing_date($start_date, $billing_cycle);
        
        // Generate subscription number
        $subscription_number = $this->generate_subscription_number($data['organization_id']);
        
        $insert_data = array(
            'organization_id' => $data['organization_id'],
            'subscription_plan_id' => $data['subscription_plan_id'],
            'subscription_number' => $subscription_number,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'next_billing_date' => $next_billing_date,
            'billing_cycle' => $billing_cycle,
            'status' => $data['status'] ?? 'active',
            'auto_renew' => $data['auto_renew'] ?? 1,
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        if ($this->db->insert('organization_subscriptions', $insert_data)) {
            $subscription_id = $this->db->insert_id();
            
            // Update organization subscription status
            $this->load->model('Organization_model');
            $this->Organization_model->update($data['organization_id'], array(
                'subscription_status' => 'active'
            ));
            
            return $subscription_id;
        }
        return false;
    }

    /**
     * Update subscription
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array('status', 'auto_renew', 'notes', 'cancellation_reason');
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // Handle cancellation
        if (isset($data['status']) && $data['status'] === 'cancelled') {
            $update_data['cancelled_at'] = date('Y-m-d');
        }
        
        // Recalculate dates if billing cycle changed
        if (isset($data['billing_cycle'])) {
            $subscription = $this->get_by_id($id);
            if ($subscription) {
                $update_data['billing_cycle'] = $data['billing_cycle'];
                $update_data['end_date'] = $this->calculate_end_date($subscription['start_date'], $data['billing_cycle']);
                $update_data['next_billing_date'] = $this->calculate_next_billing_date($subscription['start_date'], $data['billing_cycle']);
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('organization_subscriptions', $update_data);
    }

    /**
     * Cancel subscription
     */
    public function cancel($id, $reason = null) {
        $update_data = array(
            'status' => 'cancelled',
            'cancelled_at' => date('Y-m-d'),
            'cancellation_reason' => $reason
        );
        
        $this->db->where('id', $id);
        if ($this->db->update('organization_subscriptions', $update_data)) {
            // Update organization subscription status
            $subscription = $this->get_by_id($id);
            if ($subscription) {
                $this->load->model('Organization_model');
                $this->Organization_model->update($subscription['organization_id'], array(
                    'subscription_status' => 'cancelled'
                ));
            }
            return true;
        }
        return false;
    }

    /**
     * Renew subscription
     */
    public function renew($id) {
        $subscription = $this->get_by_id($id);
        if (!$subscription) {
            return false;
        }
        
        $new_start_date = date('Y-m-d');
        $end_date = $this->calculate_end_date($new_start_date, $subscription['billing_cycle']);
        $next_billing_date = $this->calculate_next_billing_date($new_start_date, $subscription['billing_cycle']);
        
        $update_data = array(
            'start_date' => $new_start_date,
            'end_date' => $end_date,
            'next_billing_date' => $next_billing_date,
            'status' => 'active',
            'cancelled_at' => null,
            'cancellation_reason' => null
        );
        
        $this->db->where('id', $id);
        return $this->db->update('organization_subscriptions', $update_data);
    }

    /**
     * Calculate end date based on billing cycle
     */
    private function calculate_end_date($start_date, $billing_cycle) {
        if ($billing_cycle === 'yearly') {
            return date('Y-m-d', strtotime($start_date . ' +1 year -1 day'));
        } else {
            return date('Y-m-d', strtotime($start_date . ' +1 month -1 day'));
        }
    }

    /**
     * Calculate next billing date
     */
    private function calculate_next_billing_date($start_date, $billing_cycle) {
        if ($billing_cycle === 'yearly') {
            return date('Y-m-d', strtotime($start_date . ' +1 year'));
        } else {
            return date('Y-m-d', strtotime($start_date . ' +1 month'));
        }
    }

    /**
     * Generate unique subscription number
     */
    private function generate_subscription_number($organization_id) {
        $this->load->model('Organization_model');
        $org = $this->Organization_model->get_by_id($organization_id);
        $prefix = $org ? substr($org['organization_code'], 0, 3) : 'SUB';
        $year = date('Y');
        
        $this->db->select_max('id');
        $query = $this->db->get('organization_subscriptions');
        $result = $query->row();
        $next_id = ($result && $result->id) ? $result->id + 1 : 1;
        
        return $prefix . '-' . $year . '-' . str_pad($next_id, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get subscriptions expiring soon
     */
    public function get_expiring_soon($days = 30) {
        $date = date('Y-m-d', strtotime("+$days days"));
        
        $this->db->select('os.*, o.name as organization_name, o.email, sp.name as plan_name');
        $this->db->from('organization_subscriptions os');
        $this->db->join('organizations o', 'os.organization_id = o.id', 'inner');
        $this->db->join('subscription_plans sp', 'os.subscription_plan_id = sp.id', 'inner');
        $this->db->where('os.status', 'active');
        $this->db->where('os.end_date <=', $date);
        $this->db->where('os.end_date >=', date('Y-m-d'));
        $this->db->order_by('os.end_date', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get expired subscriptions
     */
    public function get_expired() {
        $this->db->select('os.*, o.name as organization_name, o.email, sp.name as plan_name');
        $this->db->from('organization_subscriptions os');
        $this->db->join('organizations o', 'os.organization_id = o.id', 'inner');
        $this->db->join('subscription_plans sp', 'os.subscription_plan_id = sp.id', 'inner');
        $this->db->where('os.status', 'active');
        $this->db->where('os.end_date <', date('Y-m-d'));
        $this->db->order_by('os.end_date', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
}

