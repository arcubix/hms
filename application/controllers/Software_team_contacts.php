<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Software Team Contacts API Controller
 * Handles CRUD operations for software team contacts
 */
class Software_team_contacts extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Software_team_contacts_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }


    /**
     * Get all contacts or create new contact
     * GET /api/software-team-contacts
     * POST /api/software-team-contacts
     */
    public function index($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single contact
                    $contact = $this->Software_team_contacts_model->get_contact($id);
                    if ($contact) {
                        $this->success($contact);
                    } else {
                        $this->error('Contact not found', 404);
                    }
                } else {
                    // Get all contacts with filters
                    $filters = [
                        'search' => $this->input->get('search'),
                        'department' => $this->input->get('department'),
                        'status' => $this->input->get('status')
                    ];
                    
                    // Remove empty filters
                    $filters = array_filter($filters, function($value) {
                        return $value !== null && $value !== '';
                    });
                    
                    $contacts = $this->Software_team_contacts_model->get_contacts($filters);
                    $departments = $this->Software_team_contacts_model->get_departments();
                    
                    $this->success([
                        'contacts' => $contacts,
                        'departments' => $departments
                    ]);
                }
            } elseif ($method === 'POST') {
                // Check permission for creating contacts
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                
                $this->create_contact();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating contacts
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                
                if (!$id) {
                    $this->error('Contact ID is required', 400);
                    return;
                }
                
                $this->update_contact($id);
            } elseif ($method === 'DELETE') {
                // Check permission for deleting contacts
                if (!$this->requirePermission('admin.delete_users')) {
                    return;
                }
                
                if (!$id) {
                    $this->error('Contact ID is required', 400);
                    return;
                }
                
                $this->delete_contact($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Software team contacts error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new contact
     * POST /api/software-team-contacts
     */
    private function create_contact() {
        try {
            $data = $this->get_request_data();
            
            // Validation
            $errors = [];
            
            if (empty($data['name'])) {
                $errors[] = 'Name is required';
            }
            
            if (empty($data['role'])) {
                $errors[] = 'Role is required';
            }
            
            if (empty($data['department'])) {
                $errors[] = 'Department is required';
            }
            
            if (empty($data['email'])) {
                $errors[] = 'Email is required';
            } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'Invalid email format';
            } elseif ($this->Software_team_contacts_model->email_exists($data['email'])) {
                $errors[] = 'Email already exists';
            }
            
            if (empty($data['phone'])) {
                $errors[] = 'Phone is required';
            }
            
            if (empty($data['availability'])) {
                $errors[] = 'Availability is required';
            }
            
            if (!empty($errors)) {
                $this->error(implode(', ', $errors), 400);
                return;
            }
            
            // Get user ID
            $user_id = null;
            if ($this->user) {
                $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
            }
            
            $data['created_by'] = $user_id;
            
            // Create contact
            $contact_id = $this->Software_team_contacts_model->create_contact($data);
            
            if ($contact_id) {
                $contact = $this->Software_team_contacts_model->get_contact($contact_id);
                
                // Log contact creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Software Team Contacts', 'Contact', $contact_id, "Created contact: {$contact['name']} ({$contact['email']})");
                
                $this->success($contact, 'Contact created successfully');
            } else {
                $this->error('Failed to create contact', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Create contact error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update contact
     * PUT /api/software-team-contacts/:id
     */
    private function update_contact($id) {
        try {
            // Check if contact exists
            $existing = $this->Software_team_contacts_model->get_contact($id);
            if (!$existing) {
                $this->error('Contact not found', 404);
                return;
            }
            
            $old_contact = $existing; // Store old data for audit log
            $data = $this->get_request_data();
            
            // Validation
            $errors = [];
            
            if (isset($data['email'])) {
                if (empty($data['email'])) {
                    $errors[] = 'Email cannot be empty';
                } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    $errors[] = 'Invalid email format';
                } elseif ($this->Software_team_contacts_model->email_exists($data['email'], $id)) {
                    $errors[] = 'Email already exists';
                }
            }
            
            if (!empty($errors)) {
                $this->error(implode(', ', $errors), 400);
                return;
            }
            
            // Update contact
            $result = $this->Software_team_contacts_model->update_contact($id, $data);
            
            if ($result) {
                $contact = $this->Software_team_contacts_model->get_contact($id);
                
                // Log contact update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Software Team Contacts', 'Contact', $id, "Updated contact: {$contact['name']}", $old_contact, $contact);
                
                $this->success($contact, 'Contact updated successfully');
            } else {
                $this->error('Failed to update contact', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Update contact error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete contact (soft delete)
     * DELETE /api/software-team-contacts/:id
     */
    private function delete_contact($id) {
        try {
            // Check if contact exists
            $existing = $this->Software_team_contacts_model->get_contact($id);
            if (!$existing) {
                $this->error('Contact not found', 404);
                return;
            }
            
            // Soft delete
            $contact = $this->Software_team_contacts_model->get_contact($id);
            $result = $this->Software_team_contacts_model->delete_contact($id);
            
            if ($result) {
                // Log contact deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Software Team Contacts', 'Contact', $id, "Deleted contact: {$contact['name']} ({$contact['email']})");
                
                $this->success(null, 'Contact deleted successfully');
            } else {
                $this->error('Failed to delete contact', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Delete contact error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get departments list
     * GET /api/software-team-contacts/departments
     */
    public function departments() {
        try {
            $departments = $this->Software_team_contacts_model->get_departments();
            $this->success($departments);
        } catch (Exception $e) {
            log_message('error', 'Get departments error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

