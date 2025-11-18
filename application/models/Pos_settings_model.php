<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Pos_settings_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all settings grouped by category
     */
    public function get_settings() {
        $this->db->select('*');
        $this->db->from('pos_settings');
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
        $this->db->from('pos_settings');
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
     * Get specific setting by key
     */
    public function get_setting($key) {
        $this->db->select('*');
        $this->db->from('pos_settings');
        $this->db->where('setting_key', $key);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $row = $query->row();
            $value = json_decode($row->setting_value, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $value = $row->setting_value;
            }
            
            return array(
                'key' => $row->setting_key,
                'value' => $value,
                'category' => $row->category,
                'description' => $row->description,
                'updated_by' => $row->updated_by,
                'updated_at' => $row->updated_at
            );
        }
        
        return null;
    }

    /**
     * Update single setting
     */
    public function update_setting($key, $value, $user_id = null) {
        // Encode value as JSON
        $json_value = json_encode($value);
        
        $data = array(
            'setting_value' => $json_value,
            'updated_by' => $user_id,
            'updated_at' => date('Y-m-d H:i:s')
        );
        
        $this->db->where('setting_key', $key);
        $this->db->update('pos_settings', $data);
        
        return $this->db->affected_rows() > 0;
    }

    /**
     * Bulk update settings
     */
    public function update_settings($settings, $user_id = null) {
        log_message('debug', 'update_settings called with ' . count($settings) . ' settings, user_id: ' . ($user_id ?: 'null'));
        $updated = 0;
        
        // Check if table exists
        if (!$this->db->table_exists('pos_settings')) {
            log_message('error', 'Table pos_settings does not exist');
            throw new Exception('POS settings table does not exist. Please run the database migration.');
        }
        
        log_message('debug', 'Table pos_settings exists, proceeding with updates');
        
        foreach ($settings as $key => $value) {
            try {
                log_message('debug', "Processing setting key: {$key}, value: " . print_r($value, true));
                
                // Check if setting exists
                $this->db->select('id');
                $this->db->from('pos_settings');
                $this->db->where('setting_key', $key);
                $query = $this->db->get();
                
                // Check for database errors
                $db_error = $this->db->error();
                if (!empty($db_error['code'])) {
                    log_message('error', 'Database error checking setting: ' . $db_error['message']);
                    throw new Exception('Database error: ' . $db_error['message']);
                }
                
                log_message('debug', "Setting key '{$key}' query returned {$query->num_rows()} rows");
                
                if ($query->num_rows() == 0) {
                    // Setting doesn't exist, skip it
                    log_message('debug', "Setting key '{$key}' not found in database, skipping update");
                    continue;
                }
                
                // Encode value as JSON
                $json_value = json_encode($value, JSON_UNESCAPED_UNICODE);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    log_message('error', "JSON encode error for key '{$key}': " . json_last_error_msg());
                    continue;
                }
                
                $data = array(
                    'setting_value' => $json_value,
                    'updated_by' => $user_id,
                    'updated_at' => date('Y-m-d H:i:s')
                );
                
                $this->db->where('setting_key', $key);
                $this->db->update('pos_settings', $data);
                
                // Check for database errors after update
                $db_error = $this->db->error();
                if (!empty($db_error['code'])) {
                    log_message('error', 'Database error updating setting ' . $key . ': ' . $db_error['message']);
                    throw new Exception('Database error updating setting: ' . $db_error['message']);
                }
                
                $affected_rows = $this->db->affected_rows();
                log_message('debug', "Update query for '{$key}' affected {$affected_rows} rows");
                
                if ($affected_rows > 0) {
                    $updated++;
                    log_message('debug', "Successfully updated setting '{$key}'. Total updated so far: {$updated}");
                } else {
                    log_message('debug', "No rows affected for setting key '{$key}' - value may be unchanged");
                }
                
            } catch (Exception $e) {
                log_message('error', "Error updating setting '{$key}': " . $e->getMessage());
                // Re-throw if it's a critical error
                if (strpos($e->getMessage(), 'Database error') !== false || strpos($e->getMessage(), 'does not exist') !== false) {
                    throw $e;
                }
                // Continue with other settings for non-critical errors
                continue;
            }
        }
        
        return $updated;
    }

    /**
     * Get default settings (for reset functionality)
     */
    public function get_default_settings() {
        return array(
            'general' => array(
                'company_name' => 'Hospital Pharmacy',
                'company_address' => '123 Medical Street, City',
                'company_phone' => '+92-XXX-XXXXXXX',
                'company_email' => 'pharmacy@hospital.com',
                'currency_symbol' => 'PKR',
                'currency_code' => 'PKR',
                'date_format' => 'YYYY-MM-DD',
                'time_format' => 'HH:mm'
            ),
            'tax' => array(
                'default_tax_rate' => 14.00,
                'tax_calculation_method' => 'exclusive',
                'tax_rounding' => 'round'
            ),
            'receipt' => array(
                'invoice_prefix' => 'INV-',
                'invoice_number_format' => 'INV-{YYYY}{MM}{DD}-{####}',
                'receipt_footer' => 'Thank you for your purchase!',
                'paper_size' => '80mm',
                'auto_print' => true,
                'show_stock_on_receipt' => false,
                'show_expiry_on_receipt' => false
            ),
            'payment' => array(
                'payment_methods_cash' => true,
                'payment_methods_card' => true,
                'payment_methods_insurance' => true,
                'payment_methods_credit' => false,
                'payment_methods_wallet' => false,
                'default_payment_method' => 'cash',
                'split_payment_allowed' => true,
                'cash_rounding' => 'none',
                'min_card_amount' => 0.00
            ),
            'stock' => array(
                'stock_allocation_method' => 'FIFO',
                'low_stock_threshold' => 10,
                'auto_reserve_stock' => true,
                'stock_reservation_timeout' => 30,
                'expiry_alert_days' => 30
            ),
            'discount' => array(
                'max_item_discount' => 50,
                'max_global_discount' => 30,
                'discount_approval_threshold' => 20,
                'price_override_require_approval' => true,
                'max_price_override' => 25
            ),
            'shift' => array(
                'auto_open_shift' => false,
                'require_shift_closing' => true,
                'cash_drawer_auto_open' => false,
                'default_opening_cash' => 0.00,
                'cash_drop_require_auth' => true
            ),
            'barcode' => array(
                'barcode_auto_focus' => true,
                'barcode_beep_sound' => true,
                'barcode_validation' => true,
                'barcode_auto_add' => true
            ),
            'ui' => array(
                'default_view_mode' => 'grid',
                'items_per_page' => 20,
                'show_stock_availability' => true,
                'show_expiry_dates' => true,
                'keyboard_shortcuts_enabled' => true
            ),
            'customer' => array(
                'auto_create_walkin' => true,
                'require_phone' => false,
                'require_email' => false
            ),
            'prescription' => array(
                'require_prescription_validation' => false,
                'check_prescription_expiry' => true,
                'enforce_prescription_quantity' => true,
                'prescription_refill_tracking' => true
            ),
            'printer' => array(
                'printer_name' => '',
                'paper_width' => 80,
                'print_quality' => 'normal',
                'auto_cut' => false,
                'print_duplicate' => false
            ),
            'notifications' => array(
                'low_stock_alert_method' => 'in-app',
                'expiry_alert_method' => 'in-app',
                'sound_notifications' => true,
                'toast_duration' => 3000
            )
        );
    }

    /**
     * Reset settings to defaults
     */
    public function reset_to_defaults($user_id = null) {
        $defaults = $this->get_default_settings();
        $updated = 0;
        
        foreach ($defaults as $category => $settings) {
            foreach ($settings as $key => $value) {
                $json_value = json_encode($value);
                
                $data = array(
                    'setting_value' => $json_value,
                    'updated_by' => $user_id,
                    'updated_at' => date('Y-m-d H:i:s')
                );
                
                $this->db->where('setting_key', $key);
                $this->db->update('pos_settings', $data);
                
                if ($this->db->affected_rows() > 0) {
                    $updated++;
                }
            }
        }
        
        return $updated;
    }
}

