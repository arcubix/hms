<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Organization_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all organizations with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('o.*, u.name as created_by_name');
        $this->db->from('organizations o');
        $this->db->join('users u', 'o.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('o.name', $search);
            $this->db->or_like('o.organization_code', $search);
            $this->db->or_like('o.email', $search);
            $this->db->or_like('o.phone', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('o.status', $filters['status']);
        }
        
        // Apply subscription status filter
        if (!empty($filters['subscription_status']) && $filters['subscription_status'] !== 'all') {
            $this->db->where('o.subscription_status', $filters['subscription_status']);
        }
        
        // Apply organization type filter
        if (!empty($filters['organization_type']) && $filters['organization_type'] !== 'all') {
            $this->db->where('o.organization_type', $filters['organization_type']);
        }
        
        $this->db->order_by('o.name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get organization by ID
     */
    public function get_by_id($id) {
        $this->db->select('o.*, u.name as created_by_name');
        $this->db->from('organizations o');
        $this->db->join('users u', 'o.created_by = u.id', 'left');
        $this->db->where('o.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get organization by code
     */
    public function get_by_code($code) {
        $this->db->where('organization_code', $code);
        $query = $this->db->get('organizations');
        return $query->row_array();
    }

    /**
     * Get organization by email
     */
    public function get_by_email($email) {
        $this->db->where('email', $email);
        $query = $this->db->get('organizations');
        return $query->row_array();
    }

    /**
     * Create new organization
     */
    public function create($data) {
        // Start transaction
        $this->db->trans_start();
        
        $insert_data = array(
            'organization_code' => $data['organization_code'] ?? $this->generate_organization_code(),
            'name' => $data['name'],
            'legal_name' => $data['legal_name'] ?? null,
            'organization_type' => $data['organization_type'] ?? 'Hospital',
            'registration_number' => $data['registration_number'] ?? null,
            'tax_id' => $data['tax_id'] ?? null,
            'contact_person' => $data['contact_person'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'],
            'alternate_phone' => $data['alternate_phone'] ?? null,
            'website' => $data['website'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['country'] ?? 'Pakistan',
            'zip_code' => $data['zip_code'] ?? null,
            'billing_email' => $data['billing_email'] ?? $data['email'],
            'billing_address' => $data['billing_address'] ?? null,
            'currency' => $data['currency'] ?? 'PKR',
            'timezone' => $data['timezone'] ?? 'Asia/Karachi',
            'logo' => $data['logo'] ?? null,
            'subscription_status' => $data['subscription_status'] ?? 'trial',
            'trial_ends_at' => $data['trial_ends_at'] ?? null,
            'max_users' => $data['max_users'] ?? 5,
            'max_modules' => $data['max_modules'] ?? null,
            'status' => $data['status'] ?? 'active',
            'notes' => $data['notes'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );
        
        if (!$this->db->insert('organizations', $insert_data)) {
            $this->db->trans_rollback();
            return false;
        }
        
        $organization_id = $this->db->insert_id();
        
        // Create default billing settings
        $this->create_default_billing_settings($organization_id);
        
        // Create default admin user if admin user data is provided
        if (!empty($data['admin_user'])) {
            $this->load->model('User_model');
            
            $admin_user_data = $data['admin_user'];
            $admin_user_data['organization_id'] = $organization_id;
            $admin_user_data['role'] = 'admin';
            $admin_user_data['status'] = 'active';
            
            // Check if email already exists
            $existing_user = $this->User_model->get_user_by_email($admin_user_data['email']);
            if ($existing_user) {
                $this->db->trans_rollback();
                return false; // Email already exists
            }
            
            $user_id = $this->User_model->create_user($admin_user_data);
            if (!$user_id) {
                $this->db->trans_rollback();
                return false; // User creation failed
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return $organization_id;
    }

    /**
     * Update organization
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'name', 'legal_name', 'organization_type', 'registration_number', 'tax_id',
            'contact_person', 'email', 'phone', 'alternate_phone', 'website',
            'address', 'city', 'state', 'country', 'zip_code',
            'billing_email', 'billing_address', 'currency', 'timezone', 'logo',
            'subscription_status', 'trial_ends_at', 'max_users', 'max_modules',
            'status', 'notes'
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
        return $this->db->update('organizations', $update_data);
    }

    /**
     * Delete organization (soft delete by setting status to inactive)
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->update('organizations', array('status' => 'inactive'));
    }

    /**
     * Generate unique organization code
     */
    private function generate_organization_code() {
        $prefix = 'ORG';
        $this->db->select_max('id');
        $query = $this->db->get('organizations');
        $result = $query->row();
        $next_id = ($result && $result->id) ? $result->id + 1 : 1;
        return $prefix . str_pad($next_id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create default billing settings for organization
     */
    private function create_default_billing_settings($organization_id) {
        $this->load->model('Billing_settings_model');
        $default_settings = array(
            'organization_id' => $organization_id,
            'invoice_prefix' => 'INV',
            'payment_prefix' => 'PAY',
            'next_invoice_number' => 1,
            'next_payment_number' => 1,
            'tax_rate' => 0.00,
            'payment_terms_days' => 30,
            'currency' => 'PKR',
            'currency_symbol' => 'Rs.'
        );
        $this->Billing_settings_model->create_or_update($organization_id, $default_settings);
    }

    /**
     * Get organization statistics
     */
    public function get_statistics($organization_id) {
        $stats = array();
        
        // Count users
        $this->db->where('organization_id', $organization_id);
        $stats['total_users'] = $this->db->count_all_results('users');
        
        // Count active users
        $this->db->where('organization_id', $organization_id);
        $this->db->where('status', 'active');
        $stats['active_users'] = $this->db->count_all_results('users');
        
        // Count patients
        $this->db->where('organization_id', $organization_id);
        $stats['total_patients'] = $this->db->count_all_results('patients');
        
        // Count active subscription
        $this->db->where('organization_id', $organization_id);
        $this->db->where('status', 'active');
        $stats['active_subscription'] = $this->db->count_all_results('organization_subscriptions') > 0;
        
        return $stats;
    }

    /**
     * Check if organization can add more users
     */
    public function can_add_user($organization_id) {
        $org = $this->get_by_id($organization_id);
        if (!$org) {
            return false;
        }
        
        $this->db->where('organization_id', $organization_id);
        $current_users = $this->db->count_all_results('users');
        
        return $current_users < $org['max_users'];
    }

    /**
     * Get active subscription for organization
     */
    public function get_active_subscription($organization_id) {
        $this->db->select('os.*, sp.name as plan_name, sp.plan_code, sp.base_price');
        $this->db->from('organization_subscriptions os');
        $this->db->join('subscription_plans sp', 'os.subscription_plan_id = sp.id', 'inner');
        $this->db->where('os.organization_id', $organization_id);
        $this->db->where('os.status', 'active');
        $this->db->order_by('os.start_date', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }
}

