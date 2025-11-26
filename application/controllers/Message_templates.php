<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

/**
 * Message Templates API Controller
 * Handles CRUD operations for message templates
 */
class Message_templates extends Api {

    public function __construct() {
        parent::__construct();
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/message-templates - List all templates
     * POST /api/message-templates - Create template
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $this->list_templates();
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * List all templates with filters
     */
    private function list_templates() {
        try {
            $filters = array();
            
            if ($this->input->get('type')) {
                $filters['type'] = $this->input->get('type');
            }
            
            if ($this->input->get('status')) {
                $filters['is_active'] = $this->input->get('status') === 'active' ? 1 : 0;
            }
            
            if ($this->input->get('trigger')) {
                $filters['trigger_event'] = $this->input->get('trigger');
            }
            
            if ($this->input->get('category')) {
                $filters['category'] = $this->input->get('category');
            }
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            $this->db->select('mt.*, u.name as created_by_name');
            $this->db->from('message_templates mt');
            $this->db->join('users u', 'u.id = mt.created_by', 'left');
            
            if (!empty($filters['type'])) {
                $this->db->where('mt.type', $filters['type']);
            }
            
            if (isset($filters['is_active'])) {
                $this->db->where('mt.is_active', $filters['is_active']);
            }
            
            if (!empty($filters['trigger_event'])) {
                $this->db->where('mt.trigger_event', $filters['trigger_event']);
            }
            
            if (!empty($filters['category'])) {
                $this->db->where('mt.category', $filters['category']);
            }
            
            if (!empty($filters['search'])) {
                $this->db->group_start();
                $this->db->like('mt.name', $filters['search']);
                $this->db->or_like('mt.content', $filters['search']);
                $this->db->group_end();
            }
            
            $this->db->order_by('mt.created_at', 'DESC');
            
            $query = $this->db->get();
            $templates = $query->result_array();
            
            // Format response
            foreach ($templates as &$template) {
                $template['status'] = $template['is_active'] ? 'active' : 'inactive';
                unset($template['is_active']);
            }
            
            $this->success($templates);
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates list error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new template
     * POST /api/message-templates
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['name'])) {
                $this->error('Template name is required', 400);
                return;
            }
            
            if (empty($data['type']) || !in_array($data['type'], ['sms', 'email', 'whatsapp'])) {
                $this->error('Valid message type (sms, email, whatsapp) is required', 400);
                return;
            }
            
            if (empty($data['trigger_event'])) {
                $this->error('Trigger event is required', 400);
                return;
            }
            
            if (empty($data['content'])) {
                $this->error('Message content is required', 400);
                return;
            }
            
            // Email requires subject
            if ($data['type'] === 'email' && empty($data['subject'])) {
                $this->error('Email subject is required for email templates', 400);
                return;
            }
            
            $insert_data = array(
                'name' => $data['name'],
                'type' => $data['type'],
                'trigger_event' => $data['trigger_event'],
                'category' => $data['category'] ?? null,
                'content' => $data['content'],
                'subject' => $data['subject'] ?? null,
                'is_active' => isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
                'created_by' => $this->user['id'] ?? null
            );
            
            $this->db->insert('message_templates', $insert_data);
            $template_id = $this->db->insert_id();
            
            if ($template_id) {
                $template = $this->get_template_by_id($template_id);
                $this->success($template, 'Template created successfully', 201);
            } else {
                $this->error('Failed to create template', 500);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/message-templates/:id - Get single template
     * PUT /api/message-templates/:id - Update template
     * DELETE /api/message-templates/:id - Delete template
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Template ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $template = $this->get_template_by_id($id);
                if ($template) {
                    $this->success($template);
                } else {
                    $this->error('Template not found', 404);
                }
            } elseif ($method === 'PUT') {
                $this->update($id);
            } elseif ($method === 'DELETE') {
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update template
     */
    private function update($id) {
        try {
            $template = $this->get_template_by_id($id);
            if (!$template) {
                $this->error('Template not found', 404);
                return;
            }
            
            $data = $this->get_request_data();
            
            $update_data = array();
            
            if (isset($data['name'])) {
                $update_data['name'] = $data['name'];
            }
            
            if (isset($data['type']) && in_array($data['type'], ['sms', 'email', 'whatsapp'])) {
                $update_data['type'] = $data['type'];
            }
            
            if (isset($data['trigger_event'])) {
                $update_data['trigger_event'] = $data['trigger_event'];
            }
            
            if (isset($data['category'])) {
                $update_data['category'] = $data['category'];
            }
            
            if (isset($data['content'])) {
                $update_data['content'] = $data['content'];
            }
            
            if (isset($data['subject'])) {
                $update_data['subject'] = $data['subject'];
            }
            
            if (isset($data['is_active'])) {
                $update_data['is_active'] = $data['is_active'] ? 1 : 0;
            }
            
            if (empty($update_data)) {
                $this->error('No data provided for update', 400);
                return;
            }
            
            $this->db->where('id', $id);
            $this->db->update('message_templates', $update_data);
            
            $template = $this->get_template_by_id($id);
            $this->success($template, 'Template updated successfully');
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete template
     */
    private function delete($id) {
        try {
            $template = $this->get_template_by_id($id);
            if (!$template) {
                $this->error('Template not found', 404);
                return;
            }
            
            $this->db->where('id', $id);
            $this->db->delete('message_templates');
            
            $this->success(null, 'Template deleted successfully');
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Duplicate template
     * POST /api/message-templates/:id/duplicate
     */
    public function duplicate($id = null) {
        try {
            if (!$id) {
                $this->error('Template ID is required', 400);
                return;
            }
            
            $template = $this->get_template_by_id($id);
            if (!$template) {
                $this->error('Template not found', 404);
                return;
            }
            
            $insert_data = array(
                'name' => $template['name'] . ' (Copy)',
                'type' => $template['type'],
                'trigger_event' => $template['trigger_event'],
                'category' => $template['category'],
                'content' => $template['content'],
                'subject' => $template['subject'],
                'is_active' => 0, // Duplicated templates start as inactive
                'created_by' => $this->user['id'] ?? null
            );
            
            $this->db->insert('message_templates', $insert_data);
            $new_id = $this->db->insert_id();
            
            if ($new_id) {
                $new_template = $this->get_template_by_id($new_id);
                $this->success($new_template, 'Template duplicated successfully');
            } else {
                $this->error('Failed to duplicate template', 500);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates duplicate error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Toggle template status
     * POST /api/message-templates/:id/toggle-status
     */
    public function toggle_status($id = null) {
        try {
            if (!$id) {
                $this->error('Template ID is required', 400);
                return;
            }
            
            $template = $this->get_template_by_id($id);
            if (!$template) {
                $this->error('Template not found', 404);
                return;
            }
            
            $new_status = $template['is_active'] ? 0 : 1;
            
            $this->db->where('id', $id);
            $this->db->update('message_templates', array('is_active' => $new_status));
            
            $template = $this->get_template_by_id($id);
            $this->success($template, 'Template status updated successfully');
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates toggle_status error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Send test message
     * POST /api/message-templates/:id/test
     */
    public function test($id = null) {
        try {
            if (!$id) {
                $this->error('Template ID is required', 400);
                return;
            }
            
            $template = $this->get_template_by_id($id);
            if (!$template) {
                $this->error('Template not found', 404);
                return;
            }
            
            $data = $this->get_request_data();
            
            if (empty($data['recipient'])) {
                $this->error('Recipient contact (phone/email) is required', 400);
                return;
            }
            
            $recipient = $data['recipient'];
            $message_content = $template['content'];
            
            // Replace variables in message (basic replacement for test)
            // In production, you'd get actual data from database
            $message_content = str_replace('{patient_name}', 'Test Patient', $message_content);
            $message_content = str_replace('{doctor_name}', 'Dr. Test', $message_content);
            $message_content = str_replace('{date}', date('Y-m-d'), $message_content);
            $message_content = str_replace('{time}', date('H:i'), $message_content);
            
            $result = null;
            $log_data = array(
                'template_id' => $id,
                'recipient_contact' => $recipient,
                'message_type' => $template['type'],
                'content' => $message_content,
                'subject' => $template['subject'],
                'metadata' => json_encode(array('test' => true))
            );
            
            // Send based on message type
            if ($template['type'] === 'sms') {
                // Use SMS service for SMS messages
                $this->load->library('sms_service');
                $result = $this->sms_service->send_and_log($id, $recipient, $message_content, array('test' => true));
                
                if ($result['success']) {
                    $log_data['status'] = 'sent';
                    $log_data['sent_at'] = date('Y-m-d H:i:s');
                    $this->success(array(
                        'message' => 'Test SMS sent successfully',
                        'template_id' => $id,
                        'recipient' => $recipient,
                        'response' => $result['response'] ?? null
                    ), 'Test message sent');
                } else {
                    $log_data['status'] = 'failed';
                    $log_data['error_message'] = $result['message'];
                    $this->db->insert('message_logs', $log_data);
                    $this->error('Failed to send test SMS: ' . $result['message'], 500);
                }
            } elseif ($template['type'] === 'email') {
                // TODO: Implement email sending service
                $log_data['status'] = 'sent';
                $log_data['sent_at'] = date('Y-m-d H:i:s');
                $this->db->insert('message_logs', $log_data);
                
                $this->success(array(
                    'message' => 'Test email logged (email service not implemented yet)',
                    'template_id' => $id,
                    'recipient' => $recipient
                ), 'Test message logged');
            } elseif ($template['type'] === 'whatsapp') {
                // TODO: Implement WhatsApp sending service
                $log_data['status'] = 'sent';
                $log_data['sent_at'] = date('Y-m-d H:i:s');
                $this->db->insert('message_logs', $log_data);
                
                $this->success(array(
                    'message' => 'Test WhatsApp message logged (WhatsApp service not implemented yet)',
                    'template_id' => $id,
                    'recipient' => $recipient
                ), 'Test message logged');
            } else {
                $this->error('Invalid message type', 400);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_templates test error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get template by ID
     */
    private function get_template_by_id($id) {
        $this->db->select('mt.*, u.name as created_by_name');
        $this->db->from('message_templates mt');
        $this->db->join('users u', 'u.id = mt.created_by', 'left');
        $this->db->where('mt.id', $id);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $template = $query->row_array();
            $template['status'] = $template['is_active'] ? 'active' : 'inactive';
            unset($template['is_active']);
            return $template;
        }
        
        return null;
    }
}

