<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Support Tickets API Controller
 * Handles CRUD operations for support tickets, comments, and attachments
 */
class Support_tickets extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Support_tickets_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Check if user has admin permission
     * @return bool
     */
    private function checkAdminPermission() {
        if (!$this->user) {
            return false;
        }
        
        $user_role = is_object($this->user) ? $this->user->role : (is_array($this->user) ? $this->user['role'] : null);
        return $user_role === 'admin';
    }

    /**
     * Check if user can access ticket (created by them or admin)
     * @param int $ticket_id
     * @return bool
     */
    private function canAccessTicket($ticket_id) {
        if ($this->checkAdminPermission()) {
            return true;
        }
        
        if (!$this->user) {
            return false;
        }
        
        $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
        $ticket = $this->Support_tickets_model->get_ticket($ticket_id);
        
        return $ticket && isset($ticket['created_by_user_id']) && $ticket['created_by_user_id'] == $user_id;
    }

    /**
     * Get all tickets or create new ticket
     * GET /api/support-tickets
     * POST /api/support-tickets
     */
    public function index($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single ticket
                    if (!$this->canAccessTicket($id)) {
                        $this->error('Access denied', 403);
                        return;
                    }
                    
                    $ticket = $this->Support_tickets_model->get_ticket($id);
                    if ($ticket) {
                        $this->success($ticket);
                    } else {
                        $this->error('Ticket not found', 404);
                    }
                } else {
                    // Get all tickets with filters
                    $filters = [
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'priority' => $this->input->get('priority'),
                        'module' => $this->input->get('module')
                    ];
                    
                    // If not admin, only show own tickets
                    if (!$this->checkAdminPermission() && $this->user) {
                        $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
                        $filters['created_by'] = $user_id;
                    }
                    
                    // Remove empty filters
                    $filters = array_filter($filters, function($value) {
                        return $value !== null && $value !== '';
                    });
                    
                    $tickets = $this->Support_tickets_model->get_tickets($filters);
                    $stats = $this->Support_tickets_model->get_statistics();
                    
                    $this->success([
                        'tickets' => $tickets,
                        'stats' => $stats
                    ]);
                }
            } elseif ($method === 'POST') {
                // Create new ticket (all users can create)
                $this->create_ticket();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Update ticket
                if (!$id) {
                    $this->error('Ticket ID is required', 400);
                    return;
                }
                
                if (!$this->canAccessTicket($id)) {
                    $this->error('Access denied', 403);
                    return;
                }
                
                $this->update_ticket($id);
            } elseif ($method === 'DELETE') {
                // Delete ticket (admin only)
                if (!$this->checkAdminPermission()) {
                    $this->error('Access denied. Admin role required.', 403);
                    return;
                }
                
                if (!$id) {
                    $this->error('Ticket ID is required', 400);
                    return;
                }
                
                $this->delete_ticket($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Support tickets error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new ticket
     * POST /api/support-tickets
     */
    private function create_ticket() {
        try {
            $data = $this->get_request_data();
            
            // Validation
            $errors = [];
            
            if (empty($data['module'])) {
                $errors[] = 'Module is required';
            }
            
            if (empty($data['description'])) {
                $errors[] = 'Description is required';
            }
            
            if (empty($data['contact_number'])) {
                $errors[] = 'Contact number is required';
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
            
            if (!$user_id) {
                $this->error('User authentication required', 401);
                return;
            }
            
            $ticket_data = [
                'practice_id' => $data['practice_id'] ?? null,
                'module' => $data['module'],
                'description' => $data['description'],
                'subject' => $data['subject'] ?? null,
                'priority' => $data['priority'] ?? 'medium',
                'contact_number' => $data['contact_number'],
                'created_by_user_id' => $user_id
            ];
            
            $ticket_id = $this->Support_tickets_model->create_ticket($ticket_data);
            
            if ($ticket_id) {
                $ticket = $this->Support_tickets_model->get_ticket($ticket_id);
                
                // Log ticket creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Support Tickets', 'Ticket', $ticket_id, "Created ticket: {$ticket['ticket_number']} - {$ticket['subject']}");
                
                $this->success($ticket, 'Ticket created successfully', 201);
            } else {
                $this->error('Failed to create ticket', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Create ticket error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update ticket
     * PUT /api/support-tickets/:id
     */
    private function update_ticket($id) {
        try {
            // Check if ticket exists
            $existing = $this->Support_tickets_model->get_ticket($id);
            if (!$existing) {
                $this->error('Ticket not found', 404);
                return;
            }
            
            $old_ticket = $existing; // Store old data for audit log
            $data = $this->get_request_data();
            
            // Only admins can update status, priority, and assignment
            if (!$this->checkAdminPermission()) {
                // Regular users can only update description
                unset($data['status']);
                unset($data['priority']);
                unset($data['assigned_to_user_id']);
            }
            
            // Update ticket
            $result = $this->Support_tickets_model->update_ticket($id, $data);
            
            if ($result) {
                $ticket = $this->Support_tickets_model->get_ticket($id);
                
                // Log ticket update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Support Tickets', 'Ticket', $id, "Updated ticket: {$ticket['ticket_number']}", $old_ticket, $ticket);
                
                $this->success($ticket, 'Ticket updated successfully');
            } else {
                $this->error('Failed to update ticket', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Update ticket error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete ticket (soft delete, admin only)
     * DELETE /api/support-tickets/:id
     */
    private function delete_ticket($id) {
        try {
            // Check if ticket exists
            $existing = $this->Support_tickets_model->get_ticket($id);
            if (!$existing) {
                $this->error('Ticket not found', 404);
                return;
            }
            
            // Soft delete
            $ticket = $this->Support_tickets_model->get_ticket($id);
            $result = $this->Support_tickets_model->delete_ticket($id);
            
            if ($result) {
                // Log ticket deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Support Tickets', 'Ticket', $id, "Deleted ticket: {$ticket['ticket_number']} - {$ticket['subject']}");
                
                $this->success(null, 'Ticket deleted successfully');
            } else {
                $this->error('Failed to delete ticket', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Delete ticket error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle comments for a ticket
     * GET /api/support-tickets/:id/comments
     * POST /api/support-tickets/:id/comments
     */
    public function comments($ticket_id, $comment_id = null) {
        try {
            if (!$this->canAccessTicket($ticket_id)) {
                $this->error('Access denied', 403);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $comments = $this->Support_tickets_model->get_ticket_comments($ticket_id);
                $this->success($comments);
            } elseif ($method === 'POST') {
                $this->add_comment($ticket_id);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$comment_id) {
                    $this->error('Comment ID is required', 400);
                    return;
                }
                $this->update_comment($ticket_id, $comment_id);
            } elseif ($method === 'DELETE') {
                if (!$comment_id) {
                    $this->error('Comment ID is required', 400);
                    return;
                }
                $this->delete_comment($ticket_id, $comment_id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Support ticket comments error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Add comment to ticket
     */
    private function add_comment($ticket_id) {
        try {
            $data = $this->get_request_data();
            
            if (empty($data['content'])) {
                $this->error('Comment content is required', 400);
                return;
            }
            
            // Get user ID
            $user_id = null;
            if ($this->user) {
                $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
            }
            
            if (!$user_id) {
                $this->error('User authentication required', 401);
                return;
            }
            
            // Determine comment type (support team or user)
            $is_admin = $this->checkAdminPermission();
            $comment_type = $is_admin ? 'support' : 'user';
            
            $comment_data = [
                'author_user_id' => $user_id,
                'content' => $data['content'],
                'type' => $comment_type
            ];
            
            $comment_id = $this->Support_tickets_model->add_comment($ticket_id, $comment_data);
            
            if ($comment_id) {
                $comment = $this->db->get_where('support_ticket_comments', ['id' => $comment_id])->row_array();
                
                // Log comment creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Support Tickets', 'Comment', $comment_id, "Added comment to ticket: {$ticket_id}");
                
                $this->success($comment, 'Comment added successfully');
            } else {
                $this->error('Failed to add comment', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Add comment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update comment
     */
    private function update_comment($ticket_id, $comment_id) {
        try {
            $comment = $this->db->get_where('support_ticket_comments', [
                'id' => $comment_id,
                'ticket_id' => $ticket_id,
                'is_active' => 1
            ])->row_array();
            
            if (!$comment) {
                $this->error('Comment not found', 404);
                return;
            }
            
            // Check permission: user can only update their own comments, admin can update any
            $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
            if (!$this->checkAdminPermission() && $comment['author_user_id'] != $user_id) {
                $this->error('Access denied', 403);
                return;
            }
            
            $data = $this->get_request_data();
            
            $old_comment = $comment; // Store old data for audit log
            $result = $this->Support_tickets_model->update_comment($comment_id, $data);
            
            if ($result) {
                $updated_comment = $this->db->get_where('support_ticket_comments', ['id' => $comment_id])->row_array();
                
                // Log comment update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Support Tickets', 'Comment', $comment_id, "Updated comment on ticket: {$ticket_id}", $old_comment, $updated_comment);
                
                $this->success($updated_comment, 'Comment updated successfully');
            } else {
                $this->error('Failed to update comment', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Update comment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete comment (admin only or own comment)
     */
    private function delete_comment($ticket_id, $comment_id) {
        try {
            $comment = $this->db->get_where('support_ticket_comments', [
                'id' => $comment_id,
                'ticket_id' => $ticket_id,
                'is_active' => 1
            ])->row_array();
            
            if (!$comment) {
                $this->error('Comment not found', 404);
                return;
            }
            
            // Check permission: admin can delete any, users can delete their own
            $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
            if (!$this->checkAdminPermission() && $comment['author_user_id'] != $user_id) {
                $this->error('Access denied', 403);
                return;
            }
            
            $result = $this->Support_tickets_model->delete_comment($comment_id);
            
            if ($result) {
                // Log comment deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Support Tickets', 'Comment', $comment_id, "Deleted comment from ticket: {$ticket_id}");
                
                $this->success(null, 'Comment deleted successfully');
            } else {
                $this->error('Failed to delete comment', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Delete comment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle attachments for a ticket
     * GET /api/support-tickets/:id/attachments
     * POST /api/support-tickets/:id/attachments
     * DELETE /api/support-tickets/:id/attachments/:attachmentId
     */
    public function attachments($ticket_id, $attachment_id = null) {
        try {
            if (!$this->canAccessTicket($ticket_id)) {
                $this->error('Access denied', 403);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $attachments = $this->Support_tickets_model->get_ticket_attachments($ticket_id);
                $this->success($attachments);
            } elseif ($method === 'POST') {
                $this->upload_attachment($ticket_id);
            } elseif ($method === 'DELETE') {
                if (!$attachment_id) {
                    $this->error('Attachment ID is required', 400);
                    return;
                }
                $this->delete_attachment($ticket_id, $attachment_id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Support ticket attachments error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Upload attachment
     */
    private function upload_attachment($ticket_id) {
        try {
            // Check if ticket exists
            $ticket = $this->Support_tickets_model->get_ticket($ticket_id);
            if (!$ticket) {
                $this->error('Ticket not found', 404);
                return;
            }
            
            // Configure file upload
            $config['upload_path'] = './uploads/support_tickets/';
            $config['allowed_types'] = '*'; // Allow all file types
            $config['max_size'] = 10240; // 10MB
            $config['encrypt_name'] = TRUE;
            
            // Create directory if it doesn't exist
            if (!is_dir($config['upload_path'])) {
                mkdir($config['upload_path'], 0755, true);
            }
            
            $this->load->library('upload', $config);
            
            if ($this->upload->do_upload('file')) {
                $upload_data = $this->upload->data();
                
                // Get user ID
                $user_id = null;
                if ($this->user) {
                    $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
                }
                
                $file_data = [
                    'file_name' => $upload_data['orig_name'],
                    'file_path' => 'uploads/support_tickets/' . $upload_data['file_name'],
                    'file_type' => $upload_data['file_type'],
                    'file_size' => $upload_data['file_size'],
                    'uploaded_by_user_id' => $user_id
                ];
                
                $attachment_id = $this->Support_tickets_model->upload_attachment($ticket_id, $file_data);
                
                if ($attachment_id) {
                    $attachment = $this->Support_tickets_model->get_attachment($attachment_id);
                    
                    // Log attachment upload
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('Support Tickets', 'Attachment', $attachment_id, "Uploaded attachment '{$upload_data['orig_name']}' to ticket: {$ticket_id}");
                    
                    $this->success($attachment, 'File uploaded successfully');
                } else {
                    // Delete uploaded file if database insert failed
                    unlink($upload_data['full_path']);
                    $this->error('Failed to save file record', 500);
                }
            } else {
                $error = $this->upload->display_errors('', '');
                $this->error('File upload failed: ' . $error, 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Upload attachment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete attachment
     */
    private function delete_attachment($ticket_id, $attachment_id) {
        try {
            $attachment = $this->Support_tickets_model->get_attachment($attachment_id);
            
            if (!$attachment || $attachment['ticket_id'] != $ticket_id) {
                $this->error('Attachment not found', 404);
                return;
            }
            
            // Check permission: admin can delete any, users can delete their own
            $user_id = is_object($this->user) ? $this->user->id : (is_array($this->user) ? $this->user['id'] : null);
            if (!$this->checkAdminPermission() && $attachment['uploaded_by_user_id'] != $user_id) {
                $this->error('Access denied', 403);
                return;
            }
            
            // Delete file from filesystem
            $file_path = FCPATH . $attachment['file_path'];
            if (file_exists($file_path)) {
                unlink($file_path);
            }
            
            // Soft delete from database
            $result = $this->Support_tickets_model->delete_attachment($attachment_id);
            
            if ($result) {
                // Log attachment deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Support Tickets', 'Attachment', $attachment_id, "Deleted attachment '{$attachment['file_name']}' from ticket: {$ticket_id}");
                
                $this->success(null, 'Attachment deleted successfully');
            } else {
                $this->error('Failed to delete attachment', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Delete attachment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get ticket statistics
     * GET /api/support-tickets/stats
     */
    public function stats() {
        try {
            $stats = $this->Support_tickets_model->get_statistics();
            $this->success($stats);
        } catch (Exception $e) {
            log_message('error', 'Get stats error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

