<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class InsuranceOrganization_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all insurance organizations with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('io.*, u.name as created_by_name');
        $this->db->from('insurance_organizations io');
        $this->db->join('users u', 'io.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('io.name', $search);
            $this->db->or_like('io.contact_person', $search);
            $this->db->or_like('io.email', $search);
            $this->db->or_like('io.phone', $search);
            $this->db->or_like('io.policy_prefix', $search);
            $this->db->or_like('io.account_prefix', $search);
            $this->db->group_end();
        }
        
        // Apply type filter
        if (!empty($filters['type']) && in_array($filters['type'], array('insurance', 'organization'))) {
            $this->db->where('io.type', $filters['type']);
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('io.status', $filters['status']);
        }
        
        $this->db->order_by('io.name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get insurance organization by ID
     */
    public function get_by_id($id) {
        $this->db->select('io.*, u.name as created_by_name');
        $this->db->from('insurance_organizations io');
        $this->db->join('users u', 'io.created_by = u.id', 'left');
        $this->db->where('io.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get insurance organizations by type
     */
    public function get_by_type($type) {
        $this->db->where('type', $type);
        $this->db->where('status', 'active');
        $this->db->order_by('name', 'ASC');
        $query = $this->db->get('insurance_organizations');
        return $query->result_array();
    }

    /**
     * Create insurance organization
     */
    public function create($data) {
        $insert_data = array(
            'name' => $data['name'],
            'type' => isset($data['type']) ? $data['type'] : 'insurance',
            'policy_prefix' => isset($data['policy_prefix']) ? $data['policy_prefix'] : null,
            'account_prefix' => isset($data['account_prefix']) ? $data['account_prefix'] : null,
            'contact_person' => isset($data['contact_person']) ? $data['contact_person'] : null,
            'phone' => isset($data['phone']) ? $data['phone'] : null,
            'email' => isset($data['email']) ? $data['email'] : null,
            'website' => isset($data['website']) ? $data['website'] : null,
            'address' => isset($data['address']) ? $data['address'] : null,
            'credit_allowance' => isset($data['credit_allowance']) ? $data['credit_allowance'] : 0.00,
            'discount_rate' => isset($data['discount_rate']) ? $data['discount_rate'] : 0.00,
            'status' => isset($data['status']) ? $data['status'] : 'active',
            'contract_date' => isset($data['contract_date']) ? $data['contract_date'] : null,
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('insurance_organizations', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update insurance organization
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['name'])) {
            $update_data['name'] = $data['name'];
        }
        if (isset($data['type'])) {
            $update_data['type'] = $data['type'];
        }
        if (isset($data['policy_prefix'])) {
            $update_data['policy_prefix'] = $data['policy_prefix'];
        }
        if (isset($data['account_prefix'])) {
            $update_data['account_prefix'] = $data['account_prefix'];
        }
        if (isset($data['contact_person'])) {
            $update_data['contact_person'] = $data['contact_person'];
        }
        if (isset($data['phone'])) {
            $update_data['phone'] = $data['phone'];
        }
        if (isset($data['email'])) {
            $update_data['email'] = $data['email'];
        }
        if (isset($data['website'])) {
            $update_data['website'] = $data['website'];
        }
        if (isset($data['address'])) {
            $update_data['address'] = $data['address'];
        }
        if (isset($data['credit_allowance'])) {
            $update_data['credit_allowance'] = $data['credit_allowance'];
        }
        if (isset($data['discount_rate'])) {
            $update_data['discount_rate'] = $data['discount_rate'];
        }
        if (isset($data['status'])) {
            $update_data['status'] = $data['status'];
        }
        if (isset($data['contract_date'])) {
            $update_data['contract_date'] = $data['contract_date'];
        }

        $this->db->where('id', $id);
        return $this->db->update('insurance_organizations', $update_data);
    }

    /**
     * Delete insurance organization
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('insurance_organizations');
    }

    /**
     * Get pricing configuration for an insurance organization
     */
    public function get_pricing($insurance_organization_id) {
        $this->db->where('insurance_organization_id', $insurance_organization_id);
        $this->db->order_by('item_type', 'ASC');
        $this->db->order_by('item_name', 'ASC');
        $query = $this->db->get('insurance_pricing');
        return $query->result_array();
    }

    /**
     * Update pricing configuration for an insurance organization
     */
    public function update_pricing($insurance_organization_id, $pricing_data) {
        // Start transaction
        $this->db->trans_start();
        
        // Delete existing pricing for this insurance organization
        $this->db->where('insurance_organization_id', $insurance_organization_id);
        $this->db->delete('insurance_pricing');
        
        // Insert new pricing data
        if (!empty($pricing_data)) {
            foreach ($pricing_data as $pricing) {
                $insert_data = array(
                    'insurance_organization_id' => $insurance_organization_id,
                    'item_type' => $pricing['item_type'],
                    'item_id' => $pricing['item_id'],
                    'item_name' => $pricing['item_name'],
                    'price' => $pricing['price'],
                    'active' => isset($pricing['active']) ? ($pricing['active'] ? 1 : 0) : 1
                );
                $this->db->insert('insurance_pricing', $insert_data);
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        return $this->db->trans_status();
    }
}

