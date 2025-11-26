<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class InsurancePricing_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get pricing by insurance organization ID
     */
    public function get_by_insurance($insurance_organization_id, $item_type = null) {
        $this->db->where('insurance_organization_id', $insurance_organization_id);
        
        if ($item_type) {
            $this->db->where('item_type', $item_type);
        }
        
        $this->db->order_by('item_type', 'ASC');
        $this->db->order_by('item_name', 'ASC');
        $query = $this->db->get('insurance_pricing');
        return $query->result_array();
    }

    /**
     * Update pricing for an insurance organization
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

    /**
     * Bulk update pricing (for multiple items)
     */
    public function bulk_update_pricing($insurance_organization_id, $item_type, $pricing_items) {
        // Start transaction
        $this->db->trans_start();
        
        // Delete existing pricing for this insurance organization and item type
        $this->db->where('insurance_organization_id', $insurance_organization_id);
        $this->db->where('item_type', $item_type);
        $this->db->delete('insurance_pricing');
        
        // Insert new pricing data
        if (!empty($pricing_items)) {
            foreach ($pricing_items as $item) {
                $insert_data = array(
                    'insurance_organization_id' => $insurance_organization_id,
                    'item_type' => $item_type,
                    'item_id' => $item['item_id'],
                    'item_name' => $item['item_name'],
                    'price' => $item['price'],
                    'active' => isset($item['active']) ? ($item['active'] ? 1 : 0) : 1
                );
                $this->db->insert('insurance_pricing', $insert_data);
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        return $this->db->trans_status();
    }

    /**
     * Get pricing for a specific item
     */
    public function get_pricing_for_item($insurance_organization_id, $item_type, $item_id) {
        $this->db->where('insurance_organization_id', $insurance_organization_id);
        $this->db->where('item_type', $item_type);
        $this->db->where('item_id', $item_id);
        $this->db->where('active', 1);
        $query = $this->db->get('insurance_pricing');
        return $query->row_array();
    }
}

