<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get user by email
     */
    public function get_user_by_email($email) {
        $query = $this->db->get_where('users', array('email' => $email));
        return $query->row_array();
    }

    /**
     * Get user by ID
     */
    public function get_user_by_id($id) {
        $query = $this->db->get_where('users', array('id' => $id));
        return $query->row_array();
    }

    /**
     * Get user by token
     */
    public function get_user_by_token($token) {
        // Decode token
        $token_data = json_decode(base64_decode($token), true);
        
        if (!$token_data || !isset($token_data['user_id'])) {
            return null;
        }

        // Check if token exists in sessions table
        $this->db->where('token', $token);
        $this->db->where('expires_at >', date('Y-m-d H:i:s'));
        $session = $this->db->get('sessions')->row_array();

        if (!$session) {
            return null;
        }

        // Get user
        return $this->get_user_by_id($token_data['user_id']);
    }

    /**
     * Save token to sessions table
     */
    public function save_token($user_id, $token) {
        $data = array(
            'user_id' => $user_id,
            'token' => $token,
            'ip_address' => $this->input->ip_address(),
            'user_agent' => $this->input->user_agent(),
            'expires_at' => date('Y-m-d H:i:s', strtotime('+24 hours'))
        );

        // Delete old tokens for this user
        $this->db->where('user_id', $user_id);
        $this->db->delete('sessions');

        // Insert new token
        return $this->db->insert('sessions', $data);
    }

    /**
     * Delete token
     */
    public function delete_token($token) {
        $this->db->where('token', $token);
        return $this->db->delete('sessions');
    }

    /**
     * Get all users with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('u.*');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('u.name', $search);
            $this->db->or_like('u.email', $search);
            $this->db->or_like('u.phone', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $this->db->where('u.status', $filters['status']);
        }
        
        // Apply role filter
        if (!empty($filters['role'])) {
            $this->db->join('user_roles ur', 'u.id = ur.user_id', 'left');
            $this->db->where('ur.role', $filters['role']);
            $this->db->group_by('u.id');
        }
        
        $this->db->order_by('u.created_at', 'DESC');
        $query = $this->db->get('users u');
        $users = $query->result_array();
        
        // Load related data for each user
        foreach ($users as &$user) {
            $user['roles'] = $this->get_user_roles($user['id']);
            $user['departments'] = $this->get_user_departments($user['id']);
        }
        
        return $users;
    }

    /**
     * Get user with all details
     */
    public function get_user_with_details($id) {
        $user = $this->get_user_by_id($id);
        
        if (!$user) {
            return null;
        }
        
        // Load all related data
        $user['roles'] = $this->get_user_roles($id);
        $user['departments'] = $this->get_user_departments($id);
        $user['qualifications'] = $this->get_user_qualifications($id);
        $user['services'] = $this->get_user_services($id);
        $user['timings'] = $this->get_user_timings($id);
        $user['faqs'] = $this->get_user_faqs($id);
        $user['share_procedures'] = $this->get_user_share_procedures($id);
        $user['follow_up_share_types'] = $this->get_user_follow_up_share_types($id);
        $user['permissions'] = $this->get_user_permissions($id);
        $user['settings'] = $this->get_user_settings($id);
        
        return $user;
    }

    /**
     * Create user with all related data
     */
    public function create_user($data) {
        // Start transaction
        $this->db->trans_start();
        
        // Prepare user data
        $user_data = array(
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => isset($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : password_hash('user123', PASSWORD_BCRYPT),
            'phone' => $data['phone'] ?? null,
            'gender' => $data['gender'] ?? null,
            'status' => $data['status'] ?? 'active',
            'role' => $data['role'] ?? 'admin', // Default role for backward compatibility
            'professional_statement' => $data['professional_statement'] ?? null,
            'awards' => $data['awards'] ?? null,
            'expertise' => $data['expertise'] ?? null,
            'registrations' => $data['registrations'] ?? null,
            'professional_memberships' => $data['professional_memberships'] ?? null,
            'languages' => $data['languages'] ?? null,
            'experience' => $data['experience'] ?? null,
            'degree_completion_date' => $data['degree_completion_date'] ?? null,
            'summary' => $data['summary'] ?? null,
            'pmdc' => $data['pmdc'] ?? null,
            'shift_id' => $data['shift_id'] ?? null,
            'opd_access' => isset($data['opd_access']) ? (int)$data['opd_access'] : 0,
            'ipd_access' => isset($data['ipd_access']) ? (int)$data['ipd_access'] : 0,
            'booking_type' => $data['booking_type'] ?? 'Appointment',
            'consultation_fee' => $data['consultation_fee'] ?? null,
            'follow_up_charges' => $data['follow_up_charges'] ?? null,
            'follow_up_share_price' => $data['follow_up_share_price'] ?? null,
            'share_price' => $data['share_price'] ?? null,
            'share_type' => $data['share_type'] ?? 'Rupees',
            'lab_share_value' => $data['lab_share_value'] ?? null,
            'lab_share_type' => $data['lab_share_type'] ?? 'percentage',
            'radiology_share_value' => $data['radiology_share_value'] ?? null,
            'radiology_share_type' => $data['radiology_share_type'] ?? 'percentage',
            'instant_booking' => isset($data['instant_booking']) ? (int)$data['instant_booking'] : 0,
            'visit_charges' => isset($data['visit_charges']) ? (int)$data['visit_charges'] : 0,
            'invoice_edit_count' => $data['invoice_edit_count'] ?? 0
        );
        
        // Insert user
        if (!$this->db->insert('users', $user_data)) {
            $this->db->trans_rollback();
            return false;
        }
        
        $user_id = $this->db->insert_id();
        
        // Insert roles
        if (!empty($data['roles']) && is_array($data['roles'])) {
            foreach ($data['roles'] as $role) {
                $this->db->insert('user_roles', array(
                    'user_id' => $user_id,
                    'role' => $role
                ));
            }
        }
        
        // Insert departments
        if (!empty($data['departments']) && is_array($data['departments'])) {
            foreach ($data['departments'] as $department) {
                $this->db->insert('user_departments', array(
                    'user_id' => $user_id,
                    'department' => $department
                ));
            }
        }
        
        // Insert qualifications
        if (!empty($data['qualifications']) && is_array($data['qualifications'])) {
            foreach ($data['qualifications'] as $qualification) {
                if (!empty($qualification)) {
                    $this->db->insert('user_qualifications', array(
                        'user_id' => $user_id,
                        'qualification' => $qualification
                    ));
                }
            }
        }
        
        // Insert services
        if (!empty($data['services']) && is_array($data['services'])) {
            foreach ($data['services'] as $service) {
                if (!empty($service)) {
                    $this->db->insert('user_services', array(
                        'user_id' => $user_id,
                        'service' => $service
                    ));
                }
            }
        }
        
        // Insert timings
        if (!empty($data['timings']) && is_array($data['timings'])) {
            foreach ($data['timings'] as $timing) {
                $start_time = $timing['start_time'];
                $end_time = $timing['end_time'];
                
                // Convert HH:MM to HH:MM:SS if needed
                if (strlen($start_time) == 5) {
                    $start_time .= ':00';
                }
                if (strlen($end_time) == 5) {
                    $end_time .= ':00';
                }
                
                $this->db->insert('user_timings', array(
                    'user_id' => $user_id,
                    'day_of_week' => $timing['day_of_week'],
                    'start_time' => $start_time,
                    'end_time' => $end_time,
                    'duration' => $timing['duration'] ?? 30,
                    'is_available' => isset($timing['is_available']) ? (int)$timing['is_available'] : 1
                ));
            }
        }
        
        // Insert FAQs
        if (!empty($data['faqs']) && is_array($data['faqs'])) {
            foreach ($data['faqs'] as $index => $faq) {
                if (!empty($faq['question']) && !empty($faq['answer'])) {
                    $this->db->insert('user_faqs', array(
                        'user_id' => $user_id,
                        'question' => $faq['question'],
                        'answer' => $faq['answer'],
                        'order' => $index
                    ));
                }
            }
        }
        
        // Insert share procedures
        if (!empty($data['share_procedures']) && is_array($data['share_procedures'])) {
            foreach ($data['share_procedures'] as $procedure) {
                if (!empty($procedure['procedure_name'])) {
                    $this->db->insert('user_share_procedures', array(
                        'user_id' => $user_id,
                        'procedure_name' => $procedure['procedure_name'],
                        'share_type' => $procedure['share_type'] ?? 'percentage',
                        'share_value' => $procedure['share_value']
                    ));
                }
            }
        }
        
        // Insert follow up share types
        if (!empty($data['follow_up_share_types']) && is_array($data['follow_up_share_types'])) {
            foreach ($data['follow_up_share_types'] as $share_type) {
                if (!empty($share_type)) {
                    $this->db->insert('user_follow_up_share_types', array(
                        'user_id' => $user_id,
                        'share_type' => $share_type
                    ));
                }
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return $user_id;
    }

    /**
     * Update user with all related data
     */
    public function update_user($id, $data) {
        // Start transaction
        $this->db->trans_start();
        
        // Prepare user data (exclude relationships)
        $user_data = array();
        $allowed_fields = array(
            'name', 'email', 'phone', 'gender', 'status', 'role',
            'professional_statement', 'awards', 'expertise', 'registrations',
            'professional_memberships', 'languages', 'experience',
            'degree_completion_date', 'summary', 'pmdc', 'shift_id',
            'opd_access', 'ipd_access', 'booking_type',
            'consultation_fee', 'follow_up_charges', 'follow_up_share_price',
            'share_price', 'share_type', 'lab_share_value', 'lab_share_type',
            'radiology_share_value', 'radiology_share_type',
            'instant_booking', 'visit_charges', 'invoice_edit_count'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                if (in_array($field, array('opd_access', 'ipd_access', 'instant_booking', 'visit_charges'))) {
                    $user_data[$field] = (int)$data[$field];
                } else {
                    $user_data[$field] = $data[$field];
                }
            }
        }
        
        // Update password if provided
        if (!empty($data['password'])) {
            $user_data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        
        // Update user
        if (!empty($user_data)) {
            $this->db->where('id', $id);
            if (!$this->db->update('users', $user_data)) {
                $this->db->trans_rollback();
                return false;
            }
        }
        
        // Update roles
        if (isset($data['roles']) && is_array($data['roles'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_roles');
            
            foreach ($data['roles'] as $role) {
                $this->db->insert('user_roles', array(
                    'user_id' => $id,
                    'role' => $role
                ));
            }
        }
        
        // Update departments
        if (isset($data['departments']) && is_array($data['departments'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_departments');
            
            foreach ($data['departments'] as $department) {
                $this->db->insert('user_departments', array(
                    'user_id' => $id,
                    'department' => $department
                ));
            }
        }
        
        // Update qualifications
        if (isset($data['qualifications']) && is_array($data['qualifications'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_qualifications');
            
            foreach ($data['qualifications'] as $qualification) {
                if (!empty($qualification)) {
                    $this->db->insert('user_qualifications', array(
                        'user_id' => $id,
                        'qualification' => $qualification
                    ));
                }
            }
        }
        
        // Update services
        if (isset($data['services']) && is_array($data['services'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_services');
            
            foreach ($data['services'] as $service) {
                if (!empty($service)) {
                    $this->db->insert('user_services', array(
                        'user_id' => $id,
                        'service' => $service
                    ));
                }
            }
        }
        
        // Update timings
        if (isset($data['timings']) && is_array($data['timings'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_timings');
            
            foreach ($data['timings'] as $timing) {
                $start_time = $timing['start_time'];
                $end_time = $timing['end_time'];
                
                if (strlen($start_time) == 5) {
                    $start_time .= ':00';
                }
                if (strlen($end_time) == 5) {
                    $end_time .= ':00';
                }
                
                $this->db->insert('user_timings', array(
                    'user_id' => $id,
                    'day_of_week' => $timing['day_of_week'],
                    'start_time' => $start_time,
                    'end_time' => $end_time,
                    'duration' => $timing['duration'] ?? 30,
                    'is_available' => isset($timing['is_available']) ? (int)$timing['is_available'] : 1
                ));
            }
        }
        
        // Update FAQs
        if (isset($data['faqs']) && is_array($data['faqs'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_faqs');
            
            foreach ($data['faqs'] as $index => $faq) {
                if (!empty($faq['question']) && !empty($faq['answer'])) {
                    $this->db->insert('user_faqs', array(
                        'user_id' => $id,
                        'question' => $faq['question'],
                        'answer' => $faq['answer'],
                        'order' => $index
                    ));
                }
            }
        }
        
        // Update share procedures
        if (isset($data['share_procedures']) && is_array($data['share_procedures'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_share_procedures');
            
            foreach ($data['share_procedures'] as $procedure) {
                if (!empty($procedure['procedure_name'])) {
                    $this->db->insert('user_share_procedures', array(
                        'user_id' => $id,
                        'procedure_name' => $procedure['procedure_name'],
                        'share_type' => $procedure['share_type'] ?? 'percentage',
                        'share_value' => $procedure['share_value']
                    ));
                }
            }
        }
        
        // Update follow up share types
        if (isset($data['follow_up_share_types']) && is_array($data['follow_up_share_types'])) {
            $this->db->where('user_id', $id);
            $this->db->delete('user_follow_up_share_types');
            
            foreach ($data['follow_up_share_types'] as $share_type) {
                if (!empty($share_type)) {
                    $this->db->insert('user_follow_up_share_types', array(
                        'user_id' => $id,
                        'share_type' => $share_type
                    ));
                }
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return true;
    }

    /**
     * Delete user
     */
    public function delete_user($id) {
        // Cascade delete will handle related records
        $this->db->where('id', $id);
        return $this->db->delete('users');
    }

    /**
     * Get user roles
     */
    public function get_user_roles($user_id) {
        $this->db->select('role');
        $this->db->where('user_id', $user_id);
        $query = $this->db->get('user_roles');
        $roles = $query->result_array();
        return array_column($roles, 'role');
    }

    /**
     * Get user departments
     */
    public function get_user_departments($user_id) {
        $this->db->select('department');
        $this->db->where('user_id', $user_id);
        $query = $this->db->get('user_departments');
        $departments = $query->result_array();
        return array_column($departments, 'department');
    }

    /**
     * Get user qualifications
     */
    public function get_user_qualifications($user_id) {
        $this->db->select('qualification');
        $this->db->where('user_id', $user_id);
        $query = $this->db->get('user_qualifications');
        $qualifications = $query->result_array();
        return array_column($qualifications, 'qualification');
    }

    /**
     * Get user services
     */
    public function get_user_services($user_id) {
        $this->db->select('service');
        $this->db->where('user_id', $user_id);
        $query = $this->db->get('user_services');
        $services = $query->result_array();
        return array_column($services, 'service');
    }

    /**
     * Get user timings
     */
    public function get_user_timings($user_id) {
        $this->db->where('user_id', $user_id);
        $this->db->order_by('FIELD(day_of_week, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")');
        $query = $this->db->get('user_timings');
        return $query->result_array();
    }

    /**
     * Get user FAQs
     */
    public function get_user_faqs($user_id) {
        $this->db->where('user_id', $user_id);
        $this->db->order_by('order', 'ASC');
        $query = $this->db->get('user_faqs');
        return $query->result_array();
    }

    /**
     * Get user share procedures
     */
    public function get_user_share_procedures($user_id) {
        $this->db->where('user_id', $user_id);
        $query = $this->db->get('user_share_procedures');
        return $query->result_array();
    }

    /**
     * Get user follow up share types
     */
    public function get_user_follow_up_share_types($user_id) {
        $this->db->select('share_type');
        $this->db->where('user_id', $user_id);
        $query = $this->db->get('user_follow_up_share_types');
        $types = $query->result_array();
        return array_column($types, 'share_type');
    }

    /**
     * Get user permissions (effective permissions from roles + custom)
     * Returns permission keys for backward compatibility
     */
    public function get_user_permissions($user_id) {
        $user = $this->get_user_by_id($user_id);
        if (!$user) {
            return array();
        }
        
        $permissions = array();
        
        // Get roles
        $roles = $this->get_user_roles($user_id);
        
        // Get permissions from roles (using permission_id with join to get permission_key)
        if (!empty($roles)) {
            $this->db->select('pd.permission_key');
            $this->db->from('role_permissions rp');
            $this->db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
            $this->db->where_in('rp.role', $roles);
            $query = $this->db->get();
            $role_permissions = $query->result_array();
            foreach ($role_permissions as $rp) {
                $permissions[$rp['permission_key']] = true;
            }
        }
        
        // Override with custom permissions (using permission_id with join to get permission_key)
        $this->db->select('pd.permission_key, ucp.granted');
        $this->db->from('user_custom_permissions ucp');
        $this->db->join('permission_definitions pd', 'ucp.permission_id = pd.id', 'inner');
        $this->db->where('ucp.user_id', $user_id);
        $query = $this->db->get();
        $custom_permissions = $query->result_array();
        foreach ($custom_permissions as $cp) {
            if ($cp['granted']) {
                $permissions[$cp['permission_key']] = true;
            } else {
                unset($permissions[$cp['permission_key']]);
            }
        }
        
        return array_keys($permissions);
    }

    /**
     * Update user permissions
     * Accepts permission_key from frontend and converts to permission_id for storage
     */
    public function update_user_permissions($user_id, $permissions) {
        // Delete existing custom permissions
        $this->db->where('user_id', $user_id);
        $this->db->delete('user_custom_permissions');
        
        // Insert new custom permissions
        if (!empty($permissions) && is_array($permissions)) {
            foreach ($permissions as $permission_key => $granted) {
                // Get permission_id from permission_key
                $this->db->select('id');
                $this->db->where('permission_key', $permission_key);
                $query = $this->db->get('permission_definitions');
                $perm = $query->row_array();
                
                if ($perm) {
                    $this->db->insert('user_custom_permissions', array(
                        'user_id' => $user_id,
                        'permission_id' => $perm['id'],
                        'granted' => $granted ? 1 : 0
                    ));
                }
            }
        }
        
        return true;
    }

    /**
     * Get user settings
     */
    public function get_user_settings($user_id) {
        $user = $this->get_user_by_id($user_id);
        if (!$user) {
            return null;
        }
        
        return array(
            'consultation_fee' => $user['consultation_fee'],
            'follow_up_charges' => $user['follow_up_charges'],
            'follow_up_share_price' => $user['follow_up_share_price'],
            'share_price' => $user['share_price'],
            'share_type' => $user['share_type'],
            'follow_up_share_types' => $this->get_user_follow_up_share_types($user_id),
            'lab_share_value' => $user['lab_share_value'],
            'lab_share_type' => $user['lab_share_type'],
            'radiology_share_value' => $user['radiology_share_value'],
            'radiology_share_type' => $user['radiology_share_type'],
            'instant_booking' => (bool)$user['instant_booking'],
            'visit_charges' => (bool)$user['visit_charges'],
            'invoice_edit_count' => (int)$user['invoice_edit_count']
        );
    }

    /**
     * Update user settings
     */
    public function update_user_settings($user_id, $settings) {
        $user_data = array();
        $allowed_fields = array(
            'consultation_fee', 'follow_up_charges', 'follow_up_share_price',
            'share_price', 'share_type', 'lab_share_value', 'lab_share_type',
            'radiology_share_value', 'radiology_share_type',
            'instant_booking', 'visit_charges', 'invoice_edit_count'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($settings[$field])) {
                if (in_array($field, array('instant_booking', 'visit_charges'))) {
                    $user_data[$field] = (int)$settings[$field];
                } else {
                    $user_data[$field] = $settings[$field];
                }
            }
        }
        
        if (!empty($user_data)) {
            $this->db->where('id', $user_id);
            $this->db->update('users', $user_data);
        }
        
        // Update follow up share types
        if (isset($settings['follow_up_share_types']) && is_array($settings['follow_up_share_types'])) {
            $this->db->where('user_id', $user_id);
            $this->db->delete('user_follow_up_share_types');
            
            foreach ($settings['follow_up_share_types'] as $share_type) {
                if (!empty($share_type)) {
                    $this->db->insert('user_follow_up_share_types', array(
                        'user_id' => $user_id,
                        'share_type' => $share_type
                    ));
                }
            }
        }
        
        return true;
    }

    /**
     * Get all available roles
     */
    public function get_available_roles() {
        return array(
            'Admin' => 'Complete system access with full administrative privileges',
            'Doctor' => 'Access to appointments and reports of patients specific to the doctor only',
            'Staff' => 'General staff access with comprehensive permissions for patient management, invoicing, and reporting',
            'Blood Bank Manager' => 'Access to blood bank management, donor management, and blood inventory',
            'Nurse' => 'Access to nursing functions, patient care, and medical records',
            'Inventory Manager' => 'Access to inventory management, stock control, and procurement',
            'Lab Manager' => 'Access to Laboratory Module, can Validate Lab Tests',
            'Accountant' => 'Access to financial reports, invoices, expenses, and accounting functions',
            'Lab Technician' => 'Access to Laboratory Module, cannot view other modules',
            'Radiology Technician' => 'Access to Radiology Module only, cannot access other modules',
            'Radiology Manager' => 'Access to Radiology Module with management capabilities',
            'Pharmacist' => 'Access to Pharmacy Module, medication dispensing, and inventory management',
            'Lab Receptionist' => 'Access to Laboratory reception, patient registration, and sample collection',
            'Emergency Manager' => 'Access to Emergency Department management and operations',
            'Emergency Nurse' => 'Access to Emergency Department nursing functions and patient care',
            'Emergency Receptionist' => 'Access to Emergency Department reception and patient registration',
            'Quality Control Manager' => 'Access to quality control, compliance, and audit functions',
            'Radiology Receptionist' => 'Access to Radiology reception, patient registration, and appointment scheduling',
            'Receptionist' => 'Access to general reception, patient registration, and appointment scheduling'
        );
    }

    /**
     * Get all permission definitions
     */
    public function get_permission_definitions($category = null) {
        $this->db->select('*');
        if ($category) {
            $this->db->where('category', $category);
        }
        $this->db->order_by('category', 'ASC');
        $this->db->order_by('permission_name', 'ASC');
        $query = $this->db->get('permission_definitions');
        return $query->result_array();
    }

    /**
     * Get permissions for a specific role
     * Returns array of permission keys
     */
    public function get_role_permissions($role) {
        // Trim whitespace and ensure exact match
        $role = trim($role);
        
        $this->db->select('pd.permission_key');
        $this->db->from('role_permissions rp');
        $this->db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
        $this->db->where('rp.role', $role);
        $query = $this->db->get();
        $result = $query->result_array();
        return array_column($result, 'permission_key');
    }

    /**
     * Get all role-permission mappings
     * Returns array with role as key and array of permission keys as value
     */
    public function get_all_role_permissions() {
        $this->db->select('rp.role, pd.permission_key');
        $this->db->from('role_permissions rp');
        $this->db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
        $query = $this->db->get();
        $result = $query->result_array();
        
        $mappings = array();
        foreach ($result as $row) {
            // Trim role name to ensure consistency
            $role = trim($row['role']);
            if (!isset($mappings[$role])) {
                $mappings[$role] = array();
            }
            $mappings[$role][] = $row['permission_key'];
        }
        
        return $mappings;
    }

    /**
     * Update permissions for a specific role
     * @param string $role Role name
     * @param array $permission_keys Array of permission keys to assign to the role
     * @return bool Success status
     */
    public function update_role_permissions($role, $permission_keys) {
        // Delete existing permissions for this role
        $this->db->where('role', $role);
        $this->db->delete('role_permissions');
        
        // Insert new permissions
        if (!empty($permission_keys) && is_array($permission_keys)) {
            foreach ($permission_keys as $permission_key) {
                // Get permission_id from permission_key
                $this->db->select('id');
                $this->db->where('permission_key', $permission_key);
                $query = $this->db->get('permission_definitions');
                $perm = $query->row_array();
                
                if ($perm) {
                    $this->db->insert('role_permissions', array(
                        'role' => $role,
                        'permission_id' => $perm['id']
                    ));
                }
            }
        }
        
        return true;
    }

    /**
     * Get user's priority modules with full module details
     * Returns modules joined with modules table, ordered by position
     */
    public function get_user_priority_modules($user_id) {
        $this->db->select('m.*, upm.position');
        $this->db->from('user_priority_modules upm');
        $this->db->join('modules m', 'upm.module_id = m.module_id', 'inner');
        $this->db->where('upm.user_id', $user_id);
        $this->db->order_by('upm.position', 'ASC');
        $query = $this->db->get();
        
        return $query->result_array();
    }

    /**
     * Get user's priority module IDs only (ordered by position)
     */
    public function get_user_priority_module_ids($user_id) {
        $this->db->select('module_id');
        $this->db->from('user_priority_modules');
        $this->db->where('user_id', $user_id);
        $this->db->order_by('position', 'ASC');
        $query = $this->db->get();
        
        $module_ids = array();
        foreach ($query->result_array() as $row) {
            $module_ids[] = $row['module_id'];
        }
        
        return $module_ids;
    }

    /**
     * Save/update user's priority modules
     * Replaces all existing priority modules for the user
     * 
     * @param int $user_id User ID
     * @param array $module_ids Array of module IDs (max 7)
     * @return bool Success status
     */
    public function save_user_priority_modules($user_id, $module_ids) {
        // Validate module IDs exist
        $this->load->model('Modules_model');
        $valid_module_ids = $this->Modules_model->validate_module_ids($module_ids);
        
        if (count($valid_module_ids) !== count($module_ids)) {
            // Some module IDs are invalid
            return false;
        }
        
        // Validate maximum 7 modules
        if (count($module_ids) > 7) {
            return false;
        }
        
        // Start transaction
        $this->db->trans_start();
        
        // Delete existing priority modules for this user
        $this->db->where('user_id', $user_id);
        $this->db->delete('user_priority_modules');
        
        // Insert new priority modules
        $position = 1;
        foreach ($module_ids as $module_id) {
            $data = array(
                'user_id' => $user_id,
                'module_id' => $module_id,
                'position' => $position
            );
            $this->db->insert('user_priority_modules', $data);
            $position++;
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        return $this->db->trans_status() !== false;
    }

    /**
     * Delete a specific priority module for a user
     */
    public function delete_user_priority_modules($user_id, $module_id) {
        $this->db->where('user_id', $user_id);
        $this->db->where('module_id', $module_id);
        $this->db->delete('user_priority_modules');
        
        // Reorder remaining modules
        $remaining = $this->get_user_priority_module_ids($user_id);
        if (!empty($remaining)) {
            $this->save_user_priority_modules($user_id, $remaining);
        }
        
        return $this->db->affected_rows() > 0;
    }
}

