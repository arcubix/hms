<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * Laboratory Management API Controller
 */
class Laboratory extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Laboratory_model');
        $this->load->model('Lab_order_model');
        $this->load->model('Lab_sample_model');
        $this->load->model('Lab_result_model');
        $this->load->model('Lab_report_model');
        $this->load->model('Lab_test_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Dashboard statistics
     * GET /api/laboratory/dashboard
     */
    public function dashboard() {
        try {
            $organization_id = $this->user && isset($this->user['organization_id']) ? $this->user['organization_id'] : null;
            $stats = $this->Laboratory_model->get_dashboard_stats($organization_id);
            
            $this->success($stats);
        } catch (Exception $e) {
            log_message('error', 'Laboratory dashboard error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all orders or create new order
     * GET /api/laboratory/orders
     * POST /api/laboratory/orders
     */
    public function orders() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission
                if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                    return;
                }
                
                $filters = array();
                
                if ($this->input->get('status')) {
                    $filters['status'] = $this->input->get('status');
                }
                
                if ($this->input->get('order_type')) {
                    $filters['order_type'] = $this->input->get('order_type');
                }
                
                if ($this->input->get('priority')) {
                    $filters['priority'] = $this->input->get('priority');
                }
                
                if ($this->input->get('patient_id')) {
                    $filters['patient_id'] = $this->input->get('patient_id');
                }
                
                if ($this->input->get('date_from')) {
                    $filters['date_from'] = $this->input->get('date_from');
                }
                
                if ($this->input->get('date_to')) {
                    $filters['date_to'] = $this->input->get('date_to');
                }
                
                if ($this->input->get('search')) {
                    $filters['search'] = $this->input->get('search');
                }
                
                if ($this->user && isset($this->user['organization_id'])) {
                    $filters['organization_id'] = $this->user['organization_id'];
                }
                
                $orders = $this->Lab_order_model->get_all($filters);
                $this->success($orders);
                
            } elseif ($method === 'POST') {
                // Check permission
                if (!$this->requireAnyPermission(['lab_manager.create_lab_invoice', 'doctor.create_lab_orders'])) {
                    return;
                }
                
                $data = $this->get_request_data();
                
                // Validate required fields
                if (empty($data['patient_id'])) {
                    $this->error('Patient ID is required', 400);
                    return;
                }
                
                if (empty($data['tests']) || !is_array($data['tests']) || count($data['tests']) == 0) {
                    $this->error('At least one test is required', 400);
                    return;
                }
                
                // Set organization_id from user
                if ($this->user && isset($this->user['organization_id'])) {
                    $data['organization_id'] = $this->user['organization_id'];
                }
                
                // Set ordered_by_user_id
                if ($this->user && isset($this->user['id'])) {
                    $data['ordered_by_user_id'] = $this->user['id'];
                }
                
                $order_id = $this->Laboratory_model->create_order($data);
                
                if ($order_id) {
                    $order = $this->Lab_order_model->get_by_id($order_id);
                    
                    // Log creation
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('Laboratory', 'Lab Order', $order_id, "Created lab order: {$order['order_number']}");
                    
                    $this->success($order, 'Lab order created successfully', 201);
                } else {
                    $this->error('Failed to create lab order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory orders error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get order by ID
     * GET /api/laboratory/orders/:id
     */
    public function get_order($id) {
        try {
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                return;
            }
            
            $order = $this->Lab_order_model->get_by_id($id);
            
            if ($order) {
                // Get samples
                $order['samples'] = $this->Lab_sample_model->get_by_order($id);
                
                // Get results
                $order['results'] = $this->Lab_result_model->get_by_order($id);
                
                $this->success($order);
            } else {
                $this->error('Order not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory get_order error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update order status
     * PUT /api/laboratory/orders/:id/status
     */
    public function update_order_status($id) {
        try {
            if (!$this->requireAnyPermission(['lab_manager.edit_lab_reports', 'lab_technician.edit_lab_reports'])) {
                return;
            }
            
            $data = $this->get_request_data();
            
            if (empty($data['status'])) {
                $this->error('Status is required', 400);
                return;
            }
            
            if ($this->Laboratory_model->update_order_status($id, $data['status'])) {
                $order = $this->Lab_order_model->get_by_id($id);
                
                // Log update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Laboratory', 'Lab Order', $id, "Updated order status to: {$data['status']}");
                
                $this->success($order, 'Order status updated successfully');
            } else {
                $this->error('Failed to update order status', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory update_order_status error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all samples or create new sample
     * GET /api/laboratory/samples
     * POST /api/laboratory/samples
     */
    public function samples() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports'])) {
                    return;
                }
                
                $filters = array();
                
                if ($this->input->get('status')) {
                    $filters['status'] = $this->input->get('status');
                }
                
                if ($this->input->get('order_id')) {
                    $filters['order_id'] = $this->input->get('order_id');
                }
                
                if ($this->input->get('collection_date')) {
                    $filters['collection_date'] = $this->input->get('collection_date');
                }
                
                if ($this->user && isset($this->user['organization_id'])) {
                    $filters['organization_id'] = $this->user['organization_id'];
                }
                
                $samples = $this->Lab_sample_model->get_all($filters);
                $this->success($samples);
                
            } elseif ($method === 'POST') {
                if (!$this->requireAnyPermission(['lab_technician.create_lab_reports', 'nurse.collect_samples'])) {
                    return;
                }
                
                $data = $this->get_request_data();
                
                if (empty($data['order_id']) || empty($data['order_test_id'])) {
                    $this->error('Order ID and Order Test ID are required', 400);
                    return;
                }
                
                // Set collected_by_user_id
                if ($this->user && isset($this->user['id'])) {
                    $data['collected_by_user_id'] = $this->user['id'];
                }
                
                // Set collection date/time if not provided
                if (empty($data['collection_date'])) {
                    $data['collection_date'] = date('Y-m-d');
                }
                if (empty($data['collection_time'])) {
                    $data['collection_time'] = date('H:i:s');
                }
                
                // Set organization_id
                if ($this->user && isset($this->user['organization_id'])) {
                    $data['organization_id'] = $this->user['organization_id'];
                }
                
                $sample_id = $this->Laboratory_model->create_sample($data);
                
                if ($sample_id) {
                    $sample = $this->Lab_sample_model->get_by_id($sample_id);
                    $this->success($sample, 'Sample registered successfully', 201);
                } else {
                    $this->error('Failed to register sample', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory samples error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get sample by barcode
     * GET /api/laboratory/samples/:barcode
     */
    public function get_sample($barcode) {
        try {
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports'])) {
                return;
            }
            
            $sample = $this->Lab_sample_model->get_by_barcode($barcode);
            
            if ($sample) {
                $this->success($sample);
            } else {
                $this->error('Sample not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory get_sample error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all results or create new result
     * GET /api/laboratory/results
     * POST /api/laboratory/results
     */
    public function results() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                    return;
                }
                
                $filters = array();
                
                if ($this->input->get('status')) {
                    $filters['status'] = $this->input->get('status');
                }
                
                if ($this->input->get('is_critical')) {
                    $filters['is_critical'] = $this->input->get('is_critical');
                }
                
                if ($this->input->get('is_abnormal')) {
                    $filters['is_abnormal'] = $this->input->get('is_abnormal');
                }
                
                if ($this->user && isset($this->user['organization_id'])) {
                    $filters['organization_id'] = $this->user['organization_id'];
                }
                
                $results = $this->Lab_result_model->get_all($filters);
                $this->success($results);
                
            } elseif ($method === 'POST') {
                if (!$this->requireAnyPermission(['lab_technician.create_lab_reports'])) {
                    return;
                }
                
                $data = $this->get_request_data();
                
                if (empty($data['order_id']) || empty($data['order_test_id'])) {
                    $this->error('Order ID and Order Test ID are required', 400);
                    return;
                }
                
                // Set entered_by_user_id
                if ($this->user && isset($this->user['id'])) {
                    $data['entered_by_user_id'] = $this->user['id'];
                }
                
                // Set organization_id
                if ($this->user && isset($this->user['organization_id'])) {
                    $data['organization_id'] = $this->user['organization_id'];
                }
                
                $result_id = $this->Laboratory_model->create_result($data);
                
                if ($result_id) {
                    $result = $this->Lab_result_model->get_by_id($result_id);
                    $this->success($result, 'Result entered successfully', 201);
                } else {
                    $this->error('Failed to enter result', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory results error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get result by ID
     * GET /api/laboratory/results/:id
     */
    public function get_result($id) {
        try {
            if (!$this->requireAnyPermission(['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports', 'doctor.view_lab_reports'])) {
                return;
            }
            
            $result = $this->Lab_result_model->get_by_id($id);
            
            if ($result) {
                $this->success($result);
            } else {
                $this->error('Result not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory get_result error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Verify result
     * PUT /api/laboratory/results/:id/verify
     */
    public function verify_result($id) {
        try {
            if (!$this->requireAnyPermission(['lab_supervisor.verify_lab_reports', 'lab_technician.verify_lab_reports'])) {
                return;
            }
            
            $user_id = $this->user && isset($this->user['id']) ? $this->user['id'] : null;
            
            if (!$user_id) {
                $this->error('User ID not found', 400);
                return;
            }
            
            if ($this->Laboratory_model->verify_result($id, $user_id)) {
                $result = $this->Lab_result_model->get_by_id($id);
                
                // Log verification
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Laboratory', 'Lab Result', $id, 'Result verified');
                
                $this->success($result, 'Result verified successfully');
            } else {
                $this->error('Failed to verify result', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory verify_result error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Approve result
     * PUT /api/laboratory/results/:id/approve
     */
    public function approve_result($id) {
        try {
            if (!$this->requireAnyPermission(['pathologist.approve_lab_reports', 'lab_supervisor.approve_lab_reports'])) {
                return;
            }
            
            $user_id = $this->user && isset($this->user['id']) ? $this->user['id'] : null;
            
            if (!$user_id) {
                $this->error('User ID not found', 400);
                return;
            }
            
            if ($this->Laboratory_model->approve_result($id, $user_id)) {
                $result = $this->Lab_result_model->get_by_id($id);
                
                // Log approval
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Laboratory', 'Lab Result', $id, 'Result approved');
                
                $this->success($result, 'Result approved successfully');
            } else {
                $this->error('Failed to approve result', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory approve_result error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate report
     * GET /api/laboratory/reports/:order_id
     */
    public function generate_report($order_id) {
        try {
            if (!$this->requireAnyPermission(['lab_manager.generate_lab_reports', 'lab_technician.generate_lab_reports'])) {
                return;
            }
            
            $user_id = $this->user && isset($this->user['id']) ? $this->user['id'] : null;
            
            if (!$user_id) {
                $this->error('User ID not found', 400);
                return;
            }
            
            $report_id = $this->Laboratory_model->generate_report($order_id, $user_id);
            
            if ($report_id) {
                $report = $this->Lab_report_model->get_by_id($report_id);
                $this->success($report, 'Report generated successfully');
            } else {
                $this->error('Failed to generate report', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Laboratory generate_report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

