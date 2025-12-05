<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Tokens extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Token_model');
        $this->load->library('Token_service');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/tokens/reception/:reception_id - Get tokens for reception
     */
    public function reception($reception_id = null) {
        // Check permission for viewing tokens
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        if (!$reception_id) {
            $this->error('Reception ID is required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $status = $this->input->get('status');
        
        $tokens = $this->token_service->get_tokens_by_reception($reception_id, $date, $status);
        $this->success($tokens);
    }

    /**
     * GET /api/tokens/floor/:floor_id - Get tokens for floor
     */
    public function floor($floor_id = null) {
        // Check permission for viewing tokens
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        if (!$floor_id) {
            $this->error('Floor ID is required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $status = $this->input->get('status');
        
        $tokens = $this->token_service->get_tokens_by_floor($floor_id, $date, $status);
        $this->success($tokens);
    }

    /**
     * GET /api/tokens/doctor/:doctor_id - Get tokens for doctor
     */
    public function doctor($doctor_id = null) {
        // Check permission for viewing tokens
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        if (!$doctor_id) {
            $this->error('Doctor ID is required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $status = $this->input->get('status');
        
        $tokens = $this->token_service->get_tokens_by_doctor($doctor_id, $date, $status);
        $this->success($tokens);
    }

    /**
     * GET /api/tokens/queue/:reception_id - Get waiting queue for reception
     */
    public function queue($reception_id = null) {
        // Check permission for viewing token queue
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        if (!$reception_id) {
            $this->error('Reception ID is required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        
        $queue = $this->token_service->get_queue($reception_id, $date);
        $this->success($queue);
    }

    /**
     * PUT /api/tokens/:id/status - Update token status
     */
    public function update_status($id = null) {
        // Check permission for updating token status
        if (!$this->requirePermission('admin.edit_users')) {
            return;
        }
        
        if (!$id) {
            $this->error('Token ID is required', 400);
            return;
        }
        
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (empty($data['status'])) {
            $this->error('Status is required', 400);
            return;
        }
        
        $old_token = $this->Token_model->get_by_id($id);
        
        if ($this->token_service->update_token_status($id, $data['status'])) {
            $token = $this->Token_model->get_by_id($id);
            
            // Log token status update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('OPD Management', 'Token', $id, "Updated token status to: {$data['status']}", $old_token, $token);
            
            $this->success($token, 'Token status updated successfully');
        } else {
            $this->error('Failed to update token status', 500);
        }
    }

    /**
     * GET /api/tokens/:id - Get single token
     */
    public function get($id = null) {
        // Check permission for viewing tokens
        if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
            return;
        }
        
        if (!$id) {
            $this->error('Token ID is required', 400);
            return;
        }
        
        $token = $this->Token_model->get_by_id($id);
        
        if ($token) {
            $this->success($token);
        } else {
            $this->error('Token not found', 404);
        }
    }
}

