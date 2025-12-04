<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * Audit Logs API Controller
 * Handles retrieval and export of audit logs
 */
class Audit_logs extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Audit_log_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
        
        // Check admin permission for audit logs (only admins can view)
        if (!$this->checkAdminPermission()) {
            $this->error('Access denied. Admin role required.', 403);
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
        return $user_role === 'admin' || $user_role === 'Admin';
    }

    /**
     * Get all audit logs or single log
     * GET /api/audit-logs
     * GET /api/audit-logs/:id
     */
    public function index($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single log
                    $log = $this->Audit_log_model->get_log($id);
                    if ($log) {
                        $this->success($log);
                    } else {
                        $this->error('Audit log not found', 404);
                    }
                } else {
                    // Get all logs with filters
                    $filters = [
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to'),
                        'user_id' => $this->input->get('user_id'),
                        'action_type' => $this->input->get('action_type') ?: 'all',
                        'module' => $this->input->get('module'),
                        'status' => $this->input->get('status'),
                        'search' => $this->input->get('search'),
                        'limit' => $this->input->get('limit') ?: 15,
                        'offset' => $this->input->get('offset') ?: 0
                    ];
                    
                    // Remove empty filters
                    $filters = array_filter($filters, function($value) {
                        return $value !== null && $value !== '';
                    });
                    
                    $logs = $this->Audit_log_model->get_logs($filters);
                    $total = $this->Audit_log_model->count_logs($filters);
                    
                    $this->success([
                        'logs' => $logs,
                        'total' => $total,
                        'page' => isset($filters['offset']) ? ($filters['offset'] / ($filters['limit'] ?? 15)) + 1 : 1,
                        'limit' => $filters['limit'] ?? 15
                    ]);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Audit logs error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get statistics
     * GET /api/audit-logs/statistics
     */
    public function statistics() {
        try {
            $filters = [
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to'),
                'user_id' => $this->input->get('user_id')
            ];
            
            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });
            
            $stats = $this->Audit_log_model->get_statistics($filters);
            $this->success($stats);
        } catch (Exception $e) {
            log_message('error', 'Audit logs statistics error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user activity
     * GET /api/audit-logs/users/:userId
     */
    public function users($user_id = null) {
        try {
            if (!$user_id) {
                $this->error('User ID is required', 400);
                return;
            }
            
            $filters = [
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to'),
                'action_type' => $this->input->get('action_type') ?: 'all',
                'module' => $this->input->get('module'),
                'limit' => $this->input->get('limit') ?: 15,
                'offset' => $this->input->get('offset') ?: 0
            ];
            
            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });
            
            $logs = $this->Audit_log_model->get_user_activity($user_id, $filters);
            $total = $this->Audit_log_model->count_logs(array_merge($filters, ['user_id' => $user_id]));
            
            $this->success([
                'logs' => $logs,
                'total' => $total
            ]);
        } catch (Exception $e) {
            log_message('error', 'Audit logs user activity error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export logs
     * GET /api/audit-logs/export
     */
    public function export() {
        try {
            $filters = [
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to'),
                'user_id' => $this->input->get('user_id'),
                'action_type' => $this->input->get('action_type') ?: 'all',
                'module' => $this->input->get('module'),
                'status' => $this->input->get('status'),
                'search' => $this->input->get('search')
            ];
            
            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });
            
            $logs = $this->Audit_log_model->export_logs($filters);
            
            // Format for CSV export
            $csv_data = [];
            $csv_data[] = ['Date', 'User', 'Role', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Details', 'Status', 'IP Address'];
            
            foreach ($logs as $log) {
                $csv_data[] = [
                    date('Y-m-d H:i:s', strtotime($log['created_at'])),
                    $log['user_name'] ?? 'System',
                    $log['user_role'] ?? 'System',
                    $log['action'],
                    $log['module'],
                    $log['entity_type'] ?? '',
                    $log['entity_id'] ?? '',
                    $log['details'] ?? '',
                    $log['status'],
                    $log['ip_address'] ?? ''
                ];
            }
            
            // Set headers for CSV download
            $filename = 'audit_logs_' . date('Y-m-d_His') . '.csv';
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Pragma: no-cache');
            header('Expires: 0');
            
            $output = fopen('php://output', 'w');
            foreach ($csv_data as $row) {
                fputcsv($output, $row);
            }
            fclose($output);
            exit;
        } catch (Exception $e) {
            log_message('error', 'Audit logs export error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get modules list
     * GET /api/audit-logs/modules
     */
    public function modules() {
        try {
            $modules = $this->Audit_log_model->get_modules();
            $this->success($modules);
        } catch (Exception $e) {
            log_message('error', 'Audit logs modules error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get users list
     * GET /api/audit-logs/users-list
     */
    public function users_list() {
        try {
            $users = $this->Audit_log_model->get_users();
            $this->success($users);
        } catch (Exception $e) {
            log_message('error', 'Audit logs users list error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

