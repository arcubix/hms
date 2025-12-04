<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Support_tickets_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique ticket number
     * Format: TKT-YYYY-XXXXXX (e.g., TKT-2025-000001)
     * @return string
     */
    public function generate_ticket_number() {
        $year = date('Y');
        $prefix = "TKT-{$year}-";
        
        // Get the last ticket number for this year
        $this->db->like('ticket_number', $prefix, 'after');
        $this->db->order_by('ticket_number', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('support_tickets');
        
        if ($query->num_rows() > 0) {
            $last_ticket = $query->row();
            $last_number = str_replace($prefix, '', $last_ticket->ticket_number);
            $next_number = intval($last_number) + 1;
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get all tickets with optional filters
     * @param array $filters - Optional filters (search, status, priority, module, created_by, assigned_to)
     * @return array
     */
    public function get_tickets($filters = []) {
        $this->db->select('st.*, 
            creator.name as created_by_name, 
            creator.role as created_by_role,
            assignee.name as assigned_to_name,
            assignee.role as assigned_to_role');
        $this->db->from('support_tickets st');
        $this->db->join('users creator', 'creator.id = st.created_by_user_id', 'left');
        $this->db->join('users assignee', 'assignee.id = st.assigned_to_user_id', 'left');
        $this->db->where('st.is_active', 1);
        
        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $this->db->group_start();
            $this->db->like('st.ticket_number', $search);
            $this->db->or_like('st.subject', $search);
            $this->db->or_like('st.description', $search);
            $this->db->or_like('st.module', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('st.status', $filters['status']);
        }
        
        if (!empty($filters['priority'])) {
            $this->db->where('st.priority', $filters['priority']);
        }
        
        if (!empty($filters['module'])) {
            $this->db->where('st.module', $filters['module']);
        }
        
        if (!empty($filters['created_by'])) {
            $this->db->where('st.created_by_user_id', $filters['created_by']);
        }
        
        if (!empty($filters['assigned_to'])) {
            $this->db->where('st.assigned_to_user_id', $filters['assigned_to']);
        }
        
        $this->db->order_by('st.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get single ticket by ID with comments and attachments
     * @param int $id
     * @return array|null
     */
    public function get_ticket($id) {
        $this->db->select('st.*, 
            creator.name as created_by_name, 
            creator.role as created_by_role,
            assignee.name as assigned_to_name,
            assignee.role as assigned_to_role');
        $this->db->from('support_tickets st');
        $this->db->join('users creator', 'creator.id = st.created_by_user_id', 'left');
        $this->db->join('users assignee', 'assignee.id = st.assigned_to_user_id', 'left');
        $this->db->where('st.id', $id);
        $this->db->where('st.is_active', 1);
        $query = $this->db->get();
        $ticket = $query->row_array();
        
        if ($ticket) {
            // Load comments
            $ticket['comments'] = $this->get_ticket_comments($id);
            
            // Load attachments
            $ticket['attachments'] = $this->get_ticket_attachments($id);
        }
        
        return $ticket;
    }

    /**
     * Get comments for a ticket
     * @param int $ticket_id
     * @return array
     */
    public function get_ticket_comments($ticket_id) {
        $this->db->select('*');
        $this->db->from('support_ticket_comments');
        $this->db->where('ticket_id', $ticket_id);
        $this->db->where('is_active', 1);
        $this->db->order_by('created_at', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get attachments for a ticket
     * @param int $ticket_id
     * @return array
     */
    public function get_ticket_attachments($ticket_id) {
        $this->db->select('*');
        $this->db->from('support_ticket_attachments');
        $this->db->where('ticket_id', $ticket_id);
        $this->db->where('is_active', 1);
        $this->db->order_by('created_at', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create new ticket
     * @param array $data
     * @return int|false - Ticket ID on success, false on failure
     */
    public function create_ticket($data) {
        // Generate ticket number
        $ticket_number = $this->generate_ticket_number();
        
        $ticket_data = [
            'ticket_number' => $ticket_number,
            'practice_id' => $data['practice_id'] ?? null,
            'subject' => $data['subject'] ?? $this->generate_subject_from_description($data['description'] ?? ''),
            'module' => $data['module'],
            'description' => $data['description'],
            'status' => $data['status'] ?? 'open',
            'priority' => $data['priority'] ?? 'medium',
            'contact_number' => $data['contact_number'],
            'assigned_to_user_id' => $data['assigned_to_user_id'] ?? null,
            'created_by_user_id' => $data['created_by_user_id']
        ];
        
        if ($this->db->insert('support_tickets', $ticket_data)) {
            return $this->db->insert_id();
        }
        
        return false;
    }

    /**
     * Generate subject from description (first 50 chars)
     * @param string $description
     * @return string
     */
    private function generate_subject_from_description($description) {
        $subject = strip_tags($description);
        $subject = trim($subject);
        if (strlen($subject) > 50) {
            $subject = substr($subject, 0, 47) . '...';
        }
        return $subject ?: 'Support Ticket';
    }

    /**
     * Update ticket
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update_ticket($id, $data) {
        $update_data = [];
        $allowed_fields = [
            'subject', 'module', 'description', 'status', 'priority', 
            'contact_number', 'assigned_to_user_id'
        ];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        // Handle status changes - set resolved_at or closed_at timestamps
        if (isset($data['status'])) {
            if ($data['status'] === 'resolved' && empty($update_data['resolved_at'])) {
                $update_data['resolved_at'] = date('Y-m-d H:i:s');
            } elseif ($data['status'] === 'closed' && empty($update_data['closed_at'])) {
                $update_data['closed_at'] = date('Y-m-d H:i:s');
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        $this->db->where('is_active', 1);
        return $this->db->update('support_tickets', $update_data);
    }

    /**
     * Delete ticket (soft delete)
     * @param int $id
     * @return bool
     */
    public function delete_ticket($id) {
        $this->db->where('id', $id);
        return $this->db->update('support_tickets', ['is_active' => 0]);
    }

    /**
     * Add comment to ticket
     * @param int $ticket_id
     * @param array $data
     * @return int|false - Comment ID on success, false on failure
     */
    public function add_comment($ticket_id, $data) {
        // Get user info for caching
        $user = $this->db->get_where('users', ['id' => $data['author_user_id']])->row_array();
        
        $comment_data = [
            'ticket_id' => $ticket_id,
            'author_user_id' => $data['author_user_id'],
            'author_name' => $user['name'] ?? 'Unknown User',
            'author_role' => $user['role'] ?? null,
            'content' => $data['content'],
            'type' => $data['type'] ?? 'user'
        ];
        
        if ($this->db->insert('support_ticket_comments', $comment_data)) {
            return $this->db->insert_id();
        }
        
        return false;
    }

    /**
     * Update comment
     * @param int $comment_id
     * @param array $data
     * @return bool
     */
    public function update_comment($comment_id, $data) {
        $update_data = [];
        if (isset($data['content'])) {
            $update_data['content'] = $data['content'];
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $comment_id);
        $this->db->where('is_active', 1);
        return $this->db->update('support_ticket_comments', $update_data);
    }

    /**
     * Delete comment (soft delete)
     * @param int $comment_id
     * @return bool
     */
    public function delete_comment($comment_id) {
        $this->db->where('id', $comment_id);
        return $this->db->update('support_ticket_comments', ['is_active' => 0]);
    }

    /**
     * Upload attachment
     * @param int $ticket_id
     * @param array $file_data
     * @return int|false - Attachment ID on success, false on failure
     */
    public function upload_attachment($ticket_id, $file_data) {
        $attachment_data = [
            'ticket_id' => $ticket_id,
            'file_name' => $file_data['file_name'],
            'file_path' => $file_data['file_path'],
            'file_type' => $file_data['file_type'] ?? null,
            'file_size' => $file_data['file_size'] ?? null,
            'uploaded_by_user_id' => $file_data['uploaded_by_user_id']
        ];
        
        if ($this->db->insert('support_ticket_attachments', $attachment_data)) {
            return $this->db->insert_id();
        }
        
        return false;
    }

    /**
     * Delete attachment (soft delete)
     * @param int $attachment_id
     * @return bool
     */
    public function delete_attachment($attachment_id) {
        $this->db->where('id', $attachment_id);
        return $this->db->update('support_ticket_attachments', ['is_active' => 0]);
    }

    /**
     * Get ticket statistics
     * @return array
     */
    public function get_statistics() {
        $this->db->select('status, COUNT(*) as count');
        $this->db->from('support_tickets');
        $this->db->where('is_active', 1);
        $this->db->group_by('status');
        $query = $this->db->get();
        $status_counts = $query->result_array();
        
        $stats = [
            'open' => 0,
            'in-progress' => 0,
            'resolved' => 0,
            'closed' => 0,
            'total' => 0
        ];
        
        foreach ($status_counts as $row) {
            $stats[$row['status']] = intval($row['count']);
            $stats['total'] += intval($row['count']);
        }
        
        return $stats;
    }

    /**
     * Get attachment by ID
     * @param int $attachment_id
     * @return array|null
     */
    public function get_attachment($attachment_id) {
        $query = $this->db->get_where('support_ticket_attachments', [
            'id' => $attachment_id,
            'is_active' => 1
        ]);
        return $query->row_array();
    }
}

