<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Death Certificates API Controller
 */
class Death_certificates extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Death_certificate_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all death certificates or create new certificate
     * GET /api/death-certificates
     * POST /api/death-certificates
     */
    public function index($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing death certificates
                if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                    return;
                }
                
                if ($id) {
                    // Get single certificate
                    $certificate = $this->Death_certificate_model->get_by_id($id);
                    if ($certificate) {
                        $this->success($certificate);
                    } else {
                        $this->error('Death certificate not found', 404);
                    }
                } else {
                    // Get all certificates with filters
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to')
                    );
                    
                    $certificates = $this->Death_certificate_model->get_all($filters);
                    $stats = $this->Death_certificate_model->get_statistics();
                    
                    $this->success(array(
                        'certificates' => $certificates,
                        'stats' => $stats
                    ));
                }
            } elseif ($method === 'POST') {
                // Check permission for creating death certificates
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create_certificate();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating death certificates
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                if (!$id) {
                    $this->error('Certificate ID is required', 400);
                    return;
                }
                $this->update_certificate($id);
            } elseif ($method === 'DELETE') {
                // Check permission for deleting death certificates
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                if (!$id) {
                    $this->error('Certificate ID is required', 400);
                    return;
                }
                $this->delete_certificate($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Death certificates error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new death certificate
     */
    private function create_certificate() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['patient_name'])) {
            $this->error('Patient name is required', 400);
            return;
        }
        
        if (empty($data['date_of_birth'])) {
            $this->error('Date of birth is required', 400);
            return;
        }
        
        if (empty($data['date_of_death'])) {
            $this->error('Date of death is required', 400);
            return;
        }
        
        if (empty($data['patient_gender'])) {
            $this->error('Patient gender is required', 400);
            return;
        }
        
        if (empty($data['cause_of_death'])) {
            $this->error('Cause of death is required', 400);
            return;
        }
        
        // Validate dates
        if (isset($data['date_of_birth']) && isset($data['date_of_death'])) {
            $birth_date = strtotime($data['date_of_birth']);
            $death_date = strtotime($data['date_of_death']);
            
            if ($birth_date >= $death_date) {
                $this->error('Date of death must be after date of birth', 400);
                return;
            }
        }
        
        // Get current user ID
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        // Format dates if needed
        if (isset($data['date_of_birth']) && strpos($data['date_of_birth'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_birth']);
            if (count($date_parts) === 3) {
                $data['date_of_birth'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        if (isset($data['date_of_death']) && strpos($data['date_of_death'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_death']);
            if (count($date_parts) === 3) {
                $data['date_of_death'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        if (isset($data['date_of_admission']) && !empty($data['date_of_admission']) && strpos($data['date_of_admission'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_admission']);
            if (count($date_parts) === 3) {
                $data['date_of_admission'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        $certificate_id = $this->Death_certificate_model->create($data);
        if ($certificate_id) {
            $certificate = $this->Death_certificate_model->get_by_id($certificate_id);
            
            // Log death certificate creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('Death Certificates', 'Death Certificate', $certificate_id, "Created death certificate for: {$data['patient_name']}");
            
            $this->success($certificate, 'Death certificate created successfully');
        } else {
            $this->error('Failed to create death certificate', 400);
        }
    }

    /**
     * Update death certificate
     */
    private function update_certificate($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->put();
        }
        
        // Validate dates if both are provided
        if (isset($data['date_of_birth']) && isset($data['date_of_death'])) {
            $birth_date = strtotime($data['date_of_birth']);
            $death_date = strtotime($data['date_of_death']);
            
            if ($birth_date >= $death_date) {
                $this->error('Date of death must be after date of birth', 400);
                return;
            }
        }
        
        // Format dates if needed
        if (isset($data['date_of_birth']) && strpos($data['date_of_birth'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_birth']);
            if (count($date_parts) === 3) {
                $data['date_of_birth'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        if (isset($data['date_of_death']) && strpos($data['date_of_death'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_death']);
            if (count($date_parts) === 3) {
                $data['date_of_death'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        if (isset($data['date_of_admission']) && !empty($data['date_of_admission']) && strpos($data['date_of_admission'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_admission']);
            if (count($date_parts) === 3) {
                $data['date_of_admission'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        $old_certificate = $this->Death_certificate_model->get_by_id($id);
        
        if ($this->Death_certificate_model->update($id, $data)) {
            $certificate = $this->Death_certificate_model->get_by_id($id);
            
            // Log death certificate update
            $this->load->library('audit_log');
            $patient_name = $certificate['patient_name'] ?? 'Unknown';
            $this->audit_log->logUpdate('Death Certificates', 'Death Certificate', $id, "Updated death certificate for: {$patient_name}", $old_certificate, $certificate);
            
            $this->success($certificate, 'Death certificate updated successfully');
        } else {
            $this->error('Failed to update death certificate', 400);
        }
    }

    /**
     * Delete death certificate
     */
    private function delete_certificate($id) {
        $certificate = $this->Death_certificate_model->get_by_id($id);
        
        if ($this->Death_certificate_model->delete($id)) {
            // Log death certificate deletion
            $this->load->library('audit_log');
            $patient_name = $certificate['patient_name'] ?? 'Unknown';
            $this->audit_log->logDelete('Death Certificates', 'Death Certificate', $id, "Deleted death certificate for: {$patient_name}");
            
            $this->success(null, 'Death certificate deleted successfully');
        } else {
            $this->error('Failed to delete death certificate', 400);
        }
    }
}

