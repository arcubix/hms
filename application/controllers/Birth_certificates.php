<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Birth Certificates API Controller
 */
class Birth_certificates extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Birth_certificate_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all birth certificates or create new certificate
     * GET /api/birth-certificates
     * POST /api/birth-certificates
     */
    public function index($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single certificate
                    $certificate = $this->Birth_certificate_model->get_by_id($id);
                    if ($certificate) {
                        $this->success($certificate);
                    } else {
                        $this->error('Birth certificate not found', 404);
                    }
                } else {
                    // Get all certificates with filters
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to')
                    );
                    
                    $certificates = $this->Birth_certificate_model->get_all($filters);
                    $stats = $this->Birth_certificate_model->get_statistics();
                    
                    $this->success(array(
                        'certificates' => $certificates,
                        'stats' => $stats
                    ));
                }
            } elseif ($method === 'POST') {
                $this->create_certificate();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$id) {
                    $this->error('Certificate ID is required', 400);
                    return;
                }
                $this->update_certificate($id);
            } elseif ($method === 'DELETE') {
                if (!$id) {
                    $this->error('Certificate ID is required', 400);
                    return;
                }
                $this->delete_certificate($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Birth certificates error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new birth certificate
     */
    private function create_certificate() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['baby_name'])) {
            $this->error('Baby name is required', 400);
            return;
        }
        
        if (empty($data['mother_name'])) {
            $this->error('Mother name is required', 400);
            return;
        }
        
        if (empty($data['father_name'])) {
            $this->error('Father name is required', 400);
            return;
        }
        
        if (empty($data['date_of_birth'])) {
            $this->error('Date of birth is required', 400);
            return;
        }
        
        if (empty($data['baby_gender'])) {
            $this->error('Baby gender is required', 400);
            return;
        }
        
        // Get current user ID
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        // Format date if needed
        if (isset($data['date_of_birth']) && strpos($data['date_of_birth'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_birth']);
            if (count($date_parts) === 3) {
                $data['date_of_birth'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        // Format time if needed
        if (isset($data['time_of_birth']) && !empty($data['time_of_birth'])) {
            // Convert 12-hour format to 24-hour format if needed
            $time = $data['time_of_birth'];
            if (preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $time, $matches)) {
                $hour = intval($matches[1]);
                $minute = $matches[2];
                $ampm = strtoupper($matches[3]);
                
                if ($ampm === 'PM' && $hour < 12) {
                    $hour += 12;
                } elseif ($ampm === 'AM' && $hour === 12) {
                    $hour = 0;
                }
                
                $data['time_of_birth'] = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':' . $minute . ':00';
            }
        }
        
        $certificate_id = $this->Birth_certificate_model->create($data);
        if ($certificate_id) {
            $certificate = $this->Birth_certificate_model->get_by_id($certificate_id);
            
            // Log birth certificate creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('Birth Certificates', 'Birth Certificate', $certificate_id, "Created birth certificate for: {$data['baby_name']}");
            
            $this->success($certificate, 'Birth certificate created successfully');
        } else {
            $this->error('Failed to create birth certificate', 400);
        }
    }

    /**
     * Update birth certificate
     */
    private function update_certificate($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->put();
        }
        
        // Format date if needed
        if (isset($data['date_of_birth']) && strpos($data['date_of_birth'], '-') === false) {
            // Convert DD-MM-YYYY to YYYY-MM-DD
            $date_parts = explode('-', $data['date_of_birth']);
            if (count($date_parts) === 3) {
                $data['date_of_birth'] = $date_parts[2] . '-' . $date_parts[1] . '-' . $date_parts[0];
            }
        }
        
        // Format time if needed
        if (isset($data['time_of_birth']) && !empty($data['time_of_birth'])) {
            // Convert 12-hour format to 24-hour format if needed
            $time = $data['time_of_birth'];
            if (preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $time, $matches)) {
                $hour = intval($matches[1]);
                $minute = $matches[2];
                $ampm = strtoupper($matches[3]);
                
                if ($ampm === 'PM' && $hour < 12) {
                    $hour += 12;
                } elseif ($ampm === 'AM' && $hour === 12) {
                    $hour = 0;
                }
                
                $data['time_of_birth'] = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':' . $minute . ':00';
            }
        }
        
        $old_certificate = $this->Birth_certificate_model->get_by_id($id);
        
        if ($this->Birth_certificate_model->update($id, $data)) {
            $certificate = $this->Birth_certificate_model->get_by_id($id);
            
            // Log birth certificate update
            $this->load->library('audit_log');
            $baby_name = $certificate['baby_name'] ?? 'Unknown';
            $this->audit_log->logUpdate('Birth Certificates', 'Birth Certificate', $id, "Updated birth certificate for: {$baby_name}", $old_certificate, $certificate);
            
            $this->success($certificate, 'Birth certificate updated successfully');
        } else {
            $this->error('Failed to update birth certificate', 400);
        }
    }

    /**
     * Delete birth certificate
     */
    private function delete_certificate($id) {
        $certificate = $this->Birth_certificate_model->get_by_id($id);
        
        if ($this->Birth_certificate_model->delete($id)) {
            // Log birth certificate deletion
            $this->load->library('audit_log');
            $baby_name = $certificate['baby_name'] ?? 'Unknown';
            $this->audit_log->logDelete('Birth Certificates', 'Birth Certificate', $id, "Deleted birth certificate for: {$baby_name}");
            
            $this->success(null, 'Birth certificate deleted successfully');
        } else {
            $this->error('Failed to delete birth certificate', 400);
        }
    }
}

