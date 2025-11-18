<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Gst_rate_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        
        // Check if table exists on first load
        if (!$this->db->table_exists('gst_rates')) {
            log_message('error', 'GST rates table does not exist. Please run database/pos_settings_schema.sql');
        }
    }

    /**
     * Get all GST rates
     */
    public function get_all($filters = array()) {
        try {
            // Check if table exists
            if (!$this->db->table_exists('gst_rates')) {
                log_message('error', 'GST rates table does not exist');
                throw new Exception('GST rates table does not exist. Please run the database migration.');
            }
            
            $this->db->select('*');
            $this->db->from('gst_rates');
            
            if (!empty($filters['active_only'])) {
                $this->db->where('is_active', 1);
            }
            
            if (!empty($filters['search'])) {
                $search = $this->db->escape_like_str($filters['search']);
                $this->db->group_start();
                $this->db->like('rate_name', $search);
                $this->db->or_like('description', $search);
                $this->db->or_like('category', $search);
                $this->db->group_end();
            }
            
            $this->db->order_by('is_default', 'DESC');
            $this->db->order_by('rate_name', 'ASC');
            
            $query = $this->db->get();
            
            // Check for database errors
            $db_error = $this->db->error();
            if (!empty($db_error['code'])) {
                log_message('error', 'Database error in get_all: ' . $db_error['message']);
                throw new Exception('Database error: ' . $db_error['message']);
            }
            
            if ($query->num_rows() > 0) {
                return $query->result_array();
            }
            
            return array();
        } catch (Exception $e) {
            log_message('error', 'Error in Gst_rate_model->get_all: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get only active GST rates
     */
    public function get_active() {
        $this->db->select('*');
        $this->db->from('gst_rates');
        $this->db->where('is_active', 1);
        $this->db->order_by('is_default', 'DESC');
        $this->db->order_by('rate_name', 'ASC');
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            return $query->result_array();
        }
        
        return array();
    }

    /**
     * Get default GST rate
     */
    public function get_default() {
        $this->db->select('*');
        $this->db->from('gst_rates');
        $this->db->where('is_default', 1);
        $this->db->where('is_active', 1);
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            return $query->row_array();
        }
        
        return null;
    }

    /**
     * Get GST rate by ID
     */
    public function get_by_id($id) {
        $this->db->select('*');
        $this->db->from('gst_rates');
        $this->db->where('id', $id);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            return $query->row_array();
        }
        
        return null;
    }

    /**
     * Get GST rate by category
     */
    public function get_by_category($category) {
        $this->db->select('*');
        $this->db->from('gst_rates');
        $this->db->where('category', $category);
        $this->db->where('is_active', 1);
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            return $query->row_array();
        }
        
        // If no category match, return default
        return $this->get_default();
    }

    /**
     * Create new GST rate
     */
    public function create($data) {
        $insert_data = array(
            'rate_name' => $data['rate_name'],
            'rate_percentage' => $data['rate_percentage'],
            'category' => isset($data['category']) ? $data['category'] : null,
            'description' => isset($data['description']) ? $data['description'] : null,
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            'is_default' => isset($data['is_default']) ? (int)$data['is_default'] : 0,
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        );
        
        // If setting as default, unset other defaults
        if (isset($data['is_default']) && $data['is_default'] == 1) {
            $this->db->update('gst_rates', array('is_default' => 0));
        }
        
        $this->db->insert('gst_rates', $insert_data);
        
        if ($this->db->affected_rows() > 0) {
            return $this->db->insert_id();
        }
        
        return false;
    }

    /**
     * Update GST rate
     */
    public function update($id, $data) {
        $update_data = array(
            'updated_at' => date('Y-m-d H:i:s')
        );
        
        if (isset($data['rate_name'])) {
            $update_data['rate_name'] = $data['rate_name'];
        }
        if (isset($data['rate_percentage'])) {
            $update_data['rate_percentage'] = $data['rate_percentage'];
        }
        if (isset($data['category'])) {
            $update_data['category'] = $data['category'];
        }
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
        }
        if (isset($data['is_active'])) {
            $update_data['is_active'] = (int)$data['is_active'];
        }
        if (isset($data['is_default'])) {
            $update_data['is_default'] = (int)$data['is_default'];
            
            // If setting as default, unset other defaults
            if ($data['is_default'] == 1) {
                $this->db->where('id !=', $id);
                $this->db->update('gst_rates', array('is_default' => 0));
            }
        }
        
        $this->db->where('id', $id);
        $this->db->update('gst_rates', $update_data);
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Delete GST rate (soft delete by setting is_active = 0)
     */
    public function delete($id) {
        // Don't allow deleting default rate
        $rate = $this->get_by_id($id);
        if ($rate && $rate['is_default'] == 1) {
            return false;
        }
        
        $this->db->where('id', $id);
        $this->db->update('gst_rates', array(
            'is_active' => 0,
            'updated_at' => date('Y-m-d H:i:s')
        ));
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Set a GST rate as default
     */
    public function set_default($id) {
        // Unset all other defaults
        $this->db->update('gst_rates', array('is_default' => 0));
        
        // Set this one as default
        $this->db->where('id', $id);
        $this->db->where('is_active', 1);
        $this->db->update('gst_rates', array(
            'is_default' => 1,
            'updated_at' => date('Y-m-d H:i:s')
        ));
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Get GST rate for a medicine (by category or default)
     */
    public function get_rate_for_medicine($medicine_category = null) {
        if ($medicine_category) {
            $rate = $this->get_by_category($medicine_category);
            if ($rate) {
                return $rate;
            }
        }
        
        // Return default rate
        return $this->get_default();
    }
}

