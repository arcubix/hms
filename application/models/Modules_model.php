<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Modules_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all active modules
     */
    public function get_all_modules() {
        $this->db->select('*');
        $this->db->from('modules');
        $this->db->where('is_active', 1);
        $this->db->order_by('display_order', 'ASC');
        $this->db->order_by('label', 'ASC');
        $query = $this->db->get();
        
        return $query->result_array();
    }

    /**
     * Get all modules (including inactive)
     */
    public function get_all_modules_include_inactive() {
        $this->db->select('*');
        $this->db->from('modules');
        $this->db->order_by('display_order', 'ASC');
        $this->db->order_by('label', 'ASC');
        $query = $this->db->get();
        
        return $query->result_array();
    }

    /**
     * Get module by module_id
     */
    public function get_module_by_id($module_id) {
        $this->db->select('*');
        $this->db->from('modules');
        $this->db->where('module_id', $module_id);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            return $query->row_array();
        }
        
        return null;
    }

    /**
     * Get multiple modules by IDs
     */
    public function get_modules_by_ids($module_ids) {
        if (empty($module_ids)) {
            return array();
        }
        
        $this->db->select('*');
        $this->db->from('modules');
        $this->db->where_in('module_id', $module_ids);
        $this->db->order_by('display_order', 'ASC');
        $query = $this->db->get();
        
        return $query->result_array();
    }

    /**
     * Validate that module IDs exist
     */
    public function validate_module_ids($module_ids) {
        if (empty($module_ids)) {
            return array();
        }
        
        $this->db->select('module_id');
        $this->db->from('modules');
        $this->db->where_in('module_id', $module_ids);
        $this->db->where('is_active', 1);
        $query = $this->db->get();
        
        $valid_ids = array();
        foreach ($query->result_array() as $row) {
            $valid_ids[] = $row['module_id'];
        }
        
        return $valid_ids;
    }

    /**
     * Get modules by category
     */
    public function get_modules_by_category($category) {
        $this->db->select('*');
        $this->db->from('modules');
        $this->db->where('category', $category);
        $this->db->where('is_active', 1);
        $this->db->order_by('display_order', 'ASC');
        $query = $this->db->get();
        
        return $query->result_array();
    }

    /**
     * Get all categories
     */
    public function get_categories() {
        $this->db->select('DISTINCT category');
        $this->db->from('modules');
        $this->db->where('is_active', 1);
        $this->db->order_by('category', 'ASC');
        $query = $this->db->get();
        
        $categories = array();
        foreach ($query->result_array() as $row) {
            $categories[] = $row['category'];
        }
        
        return $categories;
    }
}

