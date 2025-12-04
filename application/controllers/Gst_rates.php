<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Gst_rates extends Api {

    public function __construct() {
        parent::__construct();
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
        
        // Check if user has permission (admin or pharmacy manager)
        // User is set by verify_token() in parent constructor
        if (isset($this->user) && $this->user) {
            $user_role = is_object($this->user) ? $this->user->role : (is_array($this->user) ? $this->user['role'] : null);
            if ($user_role && !in_array($user_role, array('admin', 'pharmacy'))) {
                $this->error('Access denied. Admin or Pharmacy role required.', 403);
                return;
            }
        }
        
        // Load model after authentication checks
        try {
            $this->load->model('Gst_rate_model');
        } catch (Exception $e) {
            log_message('error', 'Failed to load Gst_rate_model: ' . $e->getMessage());
            $this->error('Failed to initialize GST rates service', 500);
            return;
        }
    }

    /**
     * GET /api/pharmacy/gst-rates - Get all GST rates
     * POST /api/pharmacy/gst-rates - Create new GST rate
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            try {
                $filters = array();
                
                if ($this->input->get('active_only')) {
                    $filters['active_only'] = true;
                }
                
                if ($this->input->get('search')) {
                    $filters['search'] = $this->input->get('search');
                }
                
                $rates = $this->Gst_rate_model->get_all($filters);
                $this->success($rates);
            } catch (Exception $e) {
                log_message('error', 'Error in Gst_rates->index (GET): ' . $e->getMessage());
                $this->error('Failed to retrieve GST rates: ' . $e->getMessage(), 500);
            }
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * GET /api/pharmacy/gst-rates/active - Get active GST rates only
     */
    public function active() {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        $rates = $this->Gst_rate_model->get_active();
        $this->success($rates);
    }

    /**
     * GET /api/pharmacy/gst-rates/default - Get default GST rate
     */
    public function default_rate() {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        $rate = $this->Gst_rate_model->get_default();
        
        if ($rate) {
            $this->success($rate);
        } else {
            $this->error('No default GST rate found', 404);
        }
    }

    /**
     * GET /api/pharmacy/gst-rates/:id - Get specific GST rate
     */
    public function get($id = null) {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        if (!$id) {
            $this->error('GST rate ID is required', 400);
            return;
        }
        
        $rate = $this->Gst_rate_model->get_by_id($id);
        
        if ($rate) {
            $this->success($rate);
        } else {
            $this->error('GST rate not found', 404);
        }
    }

    /**
     * POST /api/pharmacy/gst-rates - Create new GST rate
     */
    public function create() {
        if ($this->input->server('REQUEST_METHOD') !== 'POST') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['rate_name'])) {
                $this->error('Rate name is required', 400);
                return;
            }
            
            if (!isset($data['rate_percentage']) || $data['rate_percentage'] < 0 || $data['rate_percentage'] > 100) {
                $this->error('Valid rate percentage (0-100) is required', 400);
                return;
            }
            
            // Get user ID from protected property
            $user_id = null;
            if (isset($this->user) && $this->user) {
                if (is_object($this->user) && isset($this->user->id)) {
                    $user_id = $this->user->id;
                } elseif (is_array($this->user) && isset($this->user['id'])) {
                    $user_id = $this->user['id'];
                }
            }
            
            $data['created_by'] = $user_id;
            
            $id = $this->Gst_rate_model->create($data);
            
            if ($id) {
                $rate = $this->Gst_rate_model->get_by_id($id);
                
                // Log GST rate creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Master Data', 'GST Rate', $id, "Created GST rate: {$data['rate_name']} ({$data['rate_percentage']}%)");
                
                $this->success($rate, 'GST rate created successfully', 201);
            } else {
                $this->error('Failed to create GST rate', 500);
            }
            
        } catch (Exception $e) {
            $this->error('Failed to create GST rate: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/pharmacy/gst-rates/:id - Update GST rate
     */
    public function update($id = null) {
        if ($this->input->server('REQUEST_METHOD') !== 'PUT') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        if (!$id) {
            $this->error('GST rate ID is required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Validate rate percentage if provided
            if (isset($data['rate_percentage']) && ($data['rate_percentage'] < 0 || $data['rate_percentage'] > 100)) {
                $this->error('Valid rate percentage (0-100) is required', 400);
                return;
            }
            
            $old_rate = $this->Gst_rate_model->get_by_id($id);
            $updated = $this->Gst_rate_model->update($id, $data);
            
            if ($updated) {
                $rate = $this->Gst_rate_model->get_by_id($id);
                
                // Log GST rate update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Master Data', 'GST Rate', $id, "Updated GST rate: {$rate['rate_name']}", $old_rate, $rate);
                
                $this->success($rate, 'GST rate updated successfully');
            } else {
                $this->error('GST rate not found or could not be updated', 404);
            }
            
        } catch (Exception $e) {
            $this->error('Failed to update GST rate: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /api/pharmacy/gst-rates/:id - Delete GST rate
     */
    public function delete($id = null) {
        if ($this->input->server('REQUEST_METHOD') !== 'DELETE') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        if (!$id) {
            $this->error('GST rate ID is required', 400);
            return;
        }
        
        try {
            $rate = $this->Gst_rate_model->get_by_id($id);
            $deleted = $this->Gst_rate_model->delete($id);
            
            if ($deleted) {
                // Log GST rate deletion
                $this->load->library('audit_log');
                $rate_name = $rate ? $rate['rate_name'] : 'Unknown';
                $this->audit_log->logDelete('Master Data', 'GST Rate', $id, "Deleted GST rate: {$rate_name}");
                
                $this->success(array('id' => $id), 'GST rate deleted successfully');
            } else {
                $this->error('Cannot delete default GST rate or rate not found', 400);
            }
            
        } catch (Exception $e) {
            $this->error('Failed to delete GST rate: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /api/pharmacy/gst-rates/:id/set-default - Set GST rate as default
     */
    public function set_default($id = null) {
        if ($this->input->server('REQUEST_METHOD') !== 'PUT') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        if (!$id) {
            $this->error('GST rate ID is required', 400);
            return;
        }
        
        try {
            $updated = $this->Gst_rate_model->set_default($id);
            
            if ($updated) {
                $rate = $this->Gst_rate_model->get_by_id($id);
                $this->success($rate, 'GST rate set as default successfully');
            } else {
                $this->error('GST rate not found or could not be set as default', 404);
            }
            
        } catch (Exception $e) {
            $this->error('Failed to set default GST rate: ' . $e->getMessage(), 500);
        }
    }
}

