<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Audit_log_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get audit logs with filters
     * @param array $filters
     * @return array
     */
    public function get_logs($filters = []) {
        $this->db->select('al.*');
        $this->db->from('audit_logs al');
        
        // Apply filters
        if (!empty($filters['date_from'])) {
            $this->db->where('DATE(al.created_at) >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('DATE(al.created_at) <=', $filters['date_to']);
        }
        
        if (!empty($filters['user_id'])) {
            $this->db->where('al.user_id', $filters['user_id']);
        }
        
        if (!empty($filters['action_type']) && $filters['action_type'] !== 'all') {
            $this->db->where('al.action_type', $filters['action_type']);
        }
        
        if (!empty($filters['module'])) {
            $this->db->where('al.module', $filters['module']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('al.status', $filters['status']);
        }
        
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $this->db->group_start();
            $this->db->like('al.action', $search);
            $this->db->or_like('al.details', $search);
            $this->db->or_like('al.module', $search);
            $this->db->or_like('al.user_name', $search);
            $this->db->group_end();
        }
        
        // Order by created_at DESC
        $this->db->order_by('al.created_at', 'DESC');
        
        // Pagination
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 15;
        $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;
        
        if ($limit > 0) {
            $this->db->limit($limit, $offset);
        }
        
        $query = $this->db->get();
        $logs = $query->result_array();
        
        // Parse JSON metadata
        foreach ($logs as &$log) {
            if (!empty($log['metadata'])) {
                $log['metadata'] = json_decode($log['metadata'], true);
            } else {
                $log['metadata'] = null;
            }
        }
        
        return $logs;
    }

    /**
     * Get total count of logs matching filters
     * @param array $filters
     * @return int
     */
    public function count_logs($filters = []) {
        $this->db->from('audit_logs al');
        
        // Apply same filters as get_logs
        if (!empty($filters['date_from'])) {
            $this->db->where('DATE(al.created_at) >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('DATE(al.created_at) <=', $filters['date_to']);
        }
        
        if (!empty($filters['user_id'])) {
            $this->db->where('al.user_id', $filters['user_id']);
        }
        
        if (!empty($filters['action_type']) && $filters['action_type'] !== 'all') {
            $this->db->where('al.action_type', $filters['action_type']);
        }
        
        if (!empty($filters['module'])) {
            $this->db->where('al.module', $filters['module']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('al.status', $filters['status']);
        }
        
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $this->db->group_start();
            $this->db->like('al.action', $search);
            $this->db->or_like('al.details', $search);
            $this->db->or_like('al.module', $search);
            $this->db->or_like('al.user_name', $search);
            $this->db->group_end();
        }
        
        return $this->db->count_all_results();
    }

    /**
     * Get single audit log entry
     * @param int $id
     * @return array|null
     */
    public function get_log($id) {
        $query = $this->db->get_where('audit_logs', ['id' => $id]);
        $log = $query->row_array();
        
        if ($log && !empty($log['metadata'])) {
            $log['metadata'] = json_decode($log['metadata'], true);
        }
        
        return $log;
    }

    /**
     * Get statistics
     * @param array $filters
     * @return array
     */
    public function get_statistics($filters = []) {
        $this->db->select('action_type, status, COUNT(*) as count');
        $this->db->from('audit_logs');
        
        // Apply date filters if provided
        if (!empty($filters['date_from'])) {
            $this->db->where('DATE(created_at) >=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $this->db->where('DATE(created_at) <=', $filters['date_to']);
        }
        
        if (!empty($filters['user_id'])) {
            $this->db->where('user_id', $filters['user_id']);
        }
        
        $this->db->group_by('action_type', 'status');
        $query = $this->db->get();
        $results = $query->result_array();
        
        // Initialize stats
        $stats = [
            'total' => 0,
            'creates' => 0,
            'updates' => 0,
            'deletes' => 0,
            'logins' => 0,
            'logouts' => 0,
            'views' => 0,
            'exports' => 0,
            'settings' => 0,
            'errors' => 0,
            'failed' => 0
        ];
        
        // Calculate totals
        foreach ($results as $row) {
            $action_type = $row['action_type'];
            $status = $row['status'];
            $count = (int)$row['count'];
            
            $stats['total'] += $count;
            
            if (isset($stats[$action_type])) {
                $stats[$action_type] += $count;
            }
            
            if ($status === 'failed') {
                $stats['failed'] += $count;
            }
        }
        
        return $stats;
    }

    /**
     * Get user activity
     * @param int $user_id
     * @param array $filters
     * @return array
     */
    public function get_user_activity($user_id, $filters = []) {
        $filters['user_id'] = $user_id;
        return $this->get_logs($filters);
    }

    /**
     * Export logs to array format (for CSV/Excel)
     * @param array $filters
     * @return array
     */
    public function export_logs($filters = []) {
        // Remove pagination for export
        unset($filters['limit']);
        unset($filters['offset']);
        
        return $this->get_logs($filters);
    }

    /**
     * Get unique modules
     * @return array
     */
    public function get_modules() {
        $this->db->distinct();
        $this->db->select('module');
        $this->db->from('audit_logs');
        $this->db->order_by('module', 'ASC');
        $query = $this->db->get();
        $results = $query->result_array();
        
        return array_column($results, 'module');
    }

    /**
     * Get unique users who have logged activities
     * @return array
     */
    public function get_users() {
        $this->db->distinct();
        $this->db->select('user_id, user_name, user_role');
        $this->db->from('audit_logs');
        $this->db->where('user_id IS NOT NULL');
        $this->db->order_by('user_name', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }
}

