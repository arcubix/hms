<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class System_settings_model extends CI_Model {

    private $cache = array();

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all settings grouped by category
     */
    public function get_settings() {
        $this->db->select('*');
        $this->db->from('system_settings');
        $this->db->order_by('category', 'ASC');
        $this->db->order_by('setting_key', 'ASC');
        $query = $this->db->get();
        
        $settings = array();
        if ($query->num_rows() > 0) {
            foreach ($query->result() as $row) {
                $category = $row->category;
                if (!isset($settings[$category])) {
                    $settings[$category] = array();
                }
                
                // Decode JSON value
                $value = json_decode($row->setting_value, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    // If JSON decode fails, use raw value
                    $value = $row->setting_value;
                }
                
                $settings[$category][$row->setting_key] = array(
                    'key' => $row->setting_key,
                    'value' => $value,
                    'category' => $row->category,
                    'description' => $row->description,
                    'updated_by' => $row->updated_by,
                    'updated_at' => $row->updated_at
                );
            }
        }
        
        return $settings;
    }

    /**
     * Get settings by category
     */
    public function get_settings_by_category($category) {
        $this->db->select('*');
        $this->db->from('system_settings');
        $this->db->where('category', $category);
        $this->db->order_by('setting_key', 'ASC');
        $query = $this->db->get();
        
        $settings = array();
        if ($query->num_rows() > 0) {
            foreach ($query->result() as $row) {
                $value = json_decode($row->setting_value, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $value = $row->setting_value;
                }
                
                $settings[$row->setting_key] = $value;
            }
        }
        
        return $settings;
    }

    /**
     * Get specific setting by key (with caching)
     */
    public function get_setting($key) {
        // Check cache first
        if (isset($this->cache[$key])) {
            return $this->cache[$key];
        }
        
        $this->db->select('*');
        $this->db->from('system_settings');
        $this->db->where('setting_key', $key);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $row = $query->row();
            $value = json_decode($row->setting_value, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $value = $row->setting_value;
            }
            
            $result = array(
                'key' => $row->setting_key,
                'value' => $value,
                'category' => $row->category,
                'description' => $row->description,
                'updated_by' => $row->updated_by,
                'updated_at' => $row->updated_at
            );
            
            // Cache the result
            $this->cache[$key] = $result;
            
            return $result;
        }
        
        return null;
    }

    /**
     * Get setting value only (with caching)
     */
    public function get_setting_value($key, $default = null) {
        $setting = $this->get_setting($key);
        return $setting ? $setting['value'] : $default;
    }

    /**
     * Update setting
     */
    public function update_setting($key, $value, $user_id = null) {
        // Encode value as JSON
        $json_value = json_encode($value);
        
        $data = array(
            'setting_value' => $json_value,
            'updated_by' => $user_id,
            'updated_at' => date('Y-m-d H:i:s')
        );
        
        // Check if setting exists
        $existing = $this->get_setting($key);
        
        if ($existing) {
            // Update existing
            $this->db->where('setting_key', $key);
            $this->db->update('system_settings', $data);
        } else {
            // Create new
            $data['setting_key'] = $key;
            $data['category'] = 'general';
            $this->db->insert('system_settings', $data);
        }
        
        // Clear cache
        if (isset($this->cache[$key])) {
            unset($this->cache[$key]);
        }
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Bulk update settings
     */
    public function update_settings($settings, $user_id = null) {
        $updated = 0;
        
        foreach ($settings as $key => $value) {
            if ($this->update_setting($key, $value, $user_id)) {
                $updated++;
            }
        }
        
        return $updated;
    }

    /**
     * Get room management mode
     */
    public function get_room_mode() {
        $mode = $this->get_setting_value('room_management_mode', 'Fixed');
        // Remove quotes if present (from JSON string)
        if (is_string($mode) && (substr($mode, 0, 1) === '"' && substr($mode, -1) === '"')) {
            $mode = substr($mode, 1, -1);
        }
        return $mode;
    }

    /**
     * Set room management mode
     */
    public function set_room_mode($mode, $user_id = null) {
        // Validate mode
        if (!in_array($mode, array('Fixed', 'Dynamic'))) {
            return false;
        }
        
        return $this->update_setting('room_management_mode', $mode, $user_id);
    }

    /**
     * Clear cache
     */
    public function clear_cache() {
        $this->cache = array();
    }
}

