<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Software_team_contacts_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all contacts with optional filters
     * @param array $filters - Optional filters (search, department, status)
     * @return array
     */
    public function get_contacts($filters = []) {
        $this->db->select('stc.*, u.name as created_by_name');
        $this->db->from('software_team_contacts stc');
        $this->db->join('users u', 'u.id = stc.created_by', 'left');
        $this->db->where('stc.is_active', 1);
        
        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $this->db->group_start();
            $this->db->like('stc.name', $search);
            $this->db->or_like('stc.role', $search);
            $this->db->or_like('stc.department', $search);
            $this->db->or_like('stc.email', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['department'])) {
            $this->db->where('stc.department', $filters['department']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('stc.status', $filters['status']);
        }
        
        $this->db->order_by('stc.name', 'ASC');
        $query = $this->db->get();
        $contacts = $query->result_array();
        
        // Load specializations for each contact
        foreach ($contacts as &$contact) {
            $contact['specialization'] = $this->get_contact_specializations($contact['id']);
        }
        
        return $contacts;
    }

    /**
     * Get single contact by ID
     * @param int $id
     * @return array|null
     */
    public function get_contact($id) {
        $this->db->select('stc.*, u.name as created_by_name');
        $this->db->from('software_team_contacts stc');
        $this->db->join('users u', 'u.id = stc.created_by', 'left');
        $this->db->where('stc.id', $id);
        $this->db->where('stc.is_active', 1);
        $query = $this->db->get();
        $contact = $query->row_array();
        
        if ($contact) {
            $contact['specialization'] = $this->get_contact_specializations($id);
        }
        
        return $contact;
    }

    /**
     * Get specializations for a contact
     * @param int $contact_id
     * @return array
     */
    private function get_contact_specializations($contact_id) {
        $this->db->select('specialization');
        $this->db->from('software_team_contact_specializations');
        $this->db->where('contact_id', $contact_id);
        $query = $this->db->get();
        $result = $query->result_array();
        return array_column($result, 'specialization');
    }

    /**
     * Create new contact
     * @param array $data
     * @return int|false - Contact ID on success, false on failure
     */
    public function create_contact($data) {
        // Start transaction
        $this->db->trans_start();
        
        // Prepare contact data
        $contact_data = [
            'name' => $data['name'],
            'role' => $data['role'],
            'department' => $data['department'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'mobile' => $data['mobile'] ?? null,
            'extension' => $data['extension'] ?? null,
            'availability' => $data['availability'],
            'status' => $data['status'] ?? 'available',
            'avatar' => $data['avatar'] ?? null,
            'location' => $data['location'] ?? null,
            'created_by' => $data['created_by'] ?? null,
            'is_active' => 1
        ];
        
        $this->db->insert('software_team_contacts', $contact_data);
        $contact_id = $this->db->insert_id();
        
        // Insert specializations
        if (!empty($data['specialization']) && is_array($data['specialization'])) {
            foreach ($data['specialization'] as $specialization) {
                if (!empty(trim($specialization))) {
                    $this->db->insert('software_team_contact_specializations', [
                        'contact_id' => $contact_id,
                        'specialization' => trim($specialization)
                    ]);
                }
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return $contact_id;
    }

    /**
     * Update contact
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update_contact($id, $data) {
        // Start transaction
        $this->db->trans_start();
        
        // Prepare update data
        $update_data = [];
        $allowed_fields = [
            'name', 'role', 'department', 'email', 'phone', 'mobile',
            'extension', 'availability', 'status', 'avatar', 'location'
        ];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        if (!empty($update_data)) {
            $this->db->where('id', $id);
            $this->db->where('is_active', 1);
            $this->db->update('software_team_contacts', $update_data);
        }
        
        // Update specializations if provided
        if (isset($data['specialization']) && is_array($data['specialization'])) {
            // Delete existing specializations
            $this->db->where('contact_id', $id);
            $this->db->delete('software_team_contact_specializations');
            
            // Insert new specializations
            foreach ($data['specialization'] as $specialization) {
                if (!empty(trim($specialization))) {
                    $this->db->insert('software_team_contact_specializations', [
                        'contact_id' => $id,
                        'specialization' => trim($specialization)
                    ]);
                }
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        return $this->db->trans_status() !== FALSE;
    }

    /**
     * Delete contact (soft delete)
     * @param int $id
     * @return bool
     */
    public function delete_contact($id) {
        $this->db->where('id', $id);
        $this->db->update('software_team_contacts', ['is_active' => 0]);
        return $this->db->affected_rows() > 0;
    }

    /**
     * Get unique departments
     * @return array
     */
    public function get_departments() {
        $this->db->select('department');
        $this->db->distinct();
        $this->db->from('software_team_contacts');
        $this->db->where('is_active', 1);
        $this->db->order_by('department', 'ASC');
        $query = $this->db->get();
        $result = $query->result_array();
        return array_column($result, 'department');
    }

    /**
     * Check if email exists (for validation)
     * @param string $email
     * @param int|null $exclude_id - Contact ID to exclude from check
     * @return bool
     */
    public function email_exists($email, $exclude_id = null) {
        $this->db->where('email', $email);
        $this->db->where('is_active', 1);
        if ($exclude_id) {
            $this->db->where('id !=', $exclude_id);
        }
        $query = $this->db->get('software_team_contacts');
        return $query->num_rows() > 0;
    }
}

