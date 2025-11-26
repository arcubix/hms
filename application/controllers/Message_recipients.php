<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

/**
 * Message Recipients API Controller
 * Handles recipient notification preferences
 */
class Message_recipients extends Api {

    public function __construct() {
        parent::__construct();
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/message-recipients - Get all recipients
     * POST /api/message-recipients/bulk - Bulk update recipients
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $type = $this->input->get('type'); // doctor, staff, admin
            $this->list_recipients($type);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * List recipients with their preferences
     */
    private function list_recipients($type = null) {
        try {
            // Get users based on type
            $this->db->select('u.id, u.name, u.email, u.phone, u.role');
            $this->db->from('users u');
            
            if ($type === 'doctor') {
                $this->db->where('u.role', 'doctor');
            } elseif ($type === 'staff') {
                $this->db->where_in('u.role', ['nurse', 'lab', 'pharmacy', 'finance']);
            } elseif ($type === 'admin') {
                $this->db->where('u.role', 'admin');
            }
            
            $this->db->where('u.status', 'active');
            $this->db->order_by('u.name', 'ASC');
            
            $users_query = $this->db->get();
            $users = $users_query->result_array();
            
            // Get recipient preferences
            $this->db->select('*');
            $this->db->from('message_recipients');
            if ($type) {
                $this->db->where('user_type', $type);
            }
            $prefs_query = $this->db->get();
            $preferences = $prefs_query->result_array();
            
            // Create a map of user_id => preferences
            $prefs_map = array();
            foreach ($preferences as $pref) {
                $prefs_map[$pref['user_id']] = $pref;
            }
            
            // Merge users with their preferences
            $result = array();
            foreach ($users as $user) {
                $user_type = $this->get_user_type($user['role']);
                
                if ($prefs_map[$user['id']] ?? null) {
                    $pref = $prefs_map[$user['id']];
                    $result[] = array(
                        'id' => $pref['id'],
                        'user_id' => $user['id'],
                        'user_name' => $user['name'],
                        'user_type' => $pref['user_type'],
                        'appointment_sms' => (bool)$pref['appointment_sms'],
                        'opd_sms' => (bool)$pref['opd_sms'],
                        'appointment_email' => (bool)$pref['appointment_email'],
                        'schedule_sms' => (bool)$pref['schedule_sms'],
                        'schedule_email' => (bool)$pref['schedule_email'],
                        'courtesy_message' => (bool)$pref['courtesy_message'],
                        'day_end_report' => (bool)$pref['day_end_report']
                    );
                } else {
                    // User doesn't have preferences yet, return defaults
                    $result[] = array(
                        'id' => null,
                        'user_id' => $user['id'],
                        'user_name' => $user['name'],
                        'user_type' => $user_type,
                        'appointment_sms' => false,
                        'opd_sms' => false,
                        'appointment_email' => false,
                        'schedule_sms' => false,
                        'schedule_email' => false,
                        'courtesy_message' => false,
                        'day_end_report' => false
                    );
                }
            }
            
            $this->success($result);
            
        } catch (Exception $e) {
            log_message('error', 'Message_recipients list error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/message-recipients/doctors - Get doctors
     * GET /api/message-recipients/staff - Get staff
     * GET /api/message-recipients/admins - Get admins
     */
    public function doctors() {
        $this->list_recipients('doctor');
    }

    public function staff() {
        $this->list_recipients('staff');
    }

    public function admins() {
        $this->list_recipients('admin');
    }

    /**
     * PUT /api/message-recipients/:id - Update recipient preferences
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Recipient ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT') {
                $this->update($id);
            } else {
                $this->error('Method not allowed', 405);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_recipients get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update recipient preferences
     */
    private function update($id) {
        try {
            $this->db->where('id', $id);
            $query = $this->db->get('message_recipients');
            
            if ($query->num_rows() === 0) {
                $this->error('Recipient not found', 404);
                return;
            }
            
            $data = $this->get_request_data();
            
            $update_data = array();
            
            if (isset($data['appointment_sms'])) {
                $update_data['appointment_sms'] = $data['appointment_sms'] ? 1 : 0;
            }
            
            if (isset($data['opd_sms'])) {
                $update_data['opd_sms'] = $data['opd_sms'] ? 1 : 0;
            }
            
            if (isset($data['appointment_email'])) {
                $update_data['appointment_email'] = $data['appointment_email'] ? 1 : 0;
            }
            
            if (isset($data['schedule_sms'])) {
                $update_data['schedule_sms'] = $data['schedule_sms'] ? 1 : 0;
            }
            
            if (isset($data['schedule_email'])) {
                $update_data['schedule_email'] = $data['schedule_email'] ? 1 : 0;
            }
            
            if (isset($data['courtesy_message'])) {
                $update_data['courtesy_message'] = $data['courtesy_message'] ? 1 : 0;
            }
            
            if (isset($data['day_end_report'])) {
                $update_data['day_end_report'] = $data['day_end_report'] ? 1 : 0;
            }
            
            if (empty($update_data)) {
                $this->error('No data provided for update', 400);
                return;
            }
            
            $this->db->where('id', $id);
            $this->db->update('message_recipients', $update_data);
            
            $this->success(null, 'Recipient preferences updated successfully');
            
        } catch (Exception $e) {
            log_message('error', 'Message_recipients update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/message-recipients/bulk - Bulk update recipients
     */
    public function bulk() {
        try {
            $data = $this->get_request_data();
            
            if (empty($data['updates']) || !is_array($data['updates'])) {
                $this->error('Updates array is required', 400);
                return;
            }
            
            $updated = 0;
            $created = 0;
            
            foreach ($data['updates'] as $update) {
                if (empty($update['user_id']) || empty($update['user_type'])) {
                    continue;
                }
                
                // Check if recipient exists
                $this->db->where('user_id', $update['user_id']);
                $this->db->where('user_type', $update['user_type']);
                $query = $this->db->get('message_recipients');
                
                $pref_data = array(
                    'appointment_sms' => isset($update['appointment_sms']) ? ($update['appointment_sms'] ? 1 : 0) : 0,
                    'opd_sms' => isset($update['opd_sms']) ? ($update['opd_sms'] ? 1 : 0) : 0,
                    'appointment_email' => isset($update['appointment_email']) ? ($update['appointment_email'] ? 1 : 0) : 0,
                    'schedule_sms' => isset($update['schedule_sms']) ? ($update['schedule_sms'] ? 1 : 0) : 0,
                    'schedule_email' => isset($update['schedule_email']) ? ($update['schedule_email'] ? 1 : 0) : 0,
                    'courtesy_message' => isset($update['courtesy_message']) ? ($update['courtesy_message'] ? 1 : 0) : 0,
                    'day_end_report' => isset($update['day_end_report']) ? ($update['day_end_report'] ? 1 : 0) : 0
                );
                
                if ($query->num_rows() > 0) {
                    // Update existing
                    $this->db->where('user_id', $update['user_id']);
                    $this->db->where('user_type', $update['user_type']);
                    $this->db->update('message_recipients', $pref_data);
                    $updated++;
                } else {
                    // Create new
                    $pref_data['user_id'] = $update['user_id'];
                    $pref_data['user_type'] = $update['user_type'];
                    $this->db->insert('message_recipients', $pref_data);
                    $created++;
                }
            }
            
            $this->success(array(
                'updated' => $updated,
                'created' => $created,
                'total' => $updated + $created
            ), 'Bulk update completed successfully');
            
        } catch (Exception $e) {
            log_message('error', 'Message_recipients bulk error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user type from role
     */
    private function get_user_type($role) {
        if ($role === 'doctor') {
            return 'doctor';
        } elseif ($role === 'admin') {
            return 'admin';
        } else {
            return 'staff';
        }
    }
}

