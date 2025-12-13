<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Laboratory_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Lab_order_model');
        $this->load->model('Lab_sample_model');
        $this->load->model('Lab_result_model');
        $this->load->model('Lab_report_model');
    }

    /**
     * Get dashboard statistics
     */
    public function get_dashboard_stats($organization_id = null) {
        $where_clause = $organization_id ? "WHERE lo.organization_id = " . (int)$organization_id : "";
        
        $stats = array();
        
        // Pending orders
        $this->db->select('COUNT(*) as count');
        $this->db->from('lab_orders lo');
        $this->db->where_in('lo.status', ['ordered', 'sample-collected', 'sample-received', 'in-progress']);
        if ($organization_id) {
            $this->db->where('lo.organization_id', $organization_id);
        }
        $query = $this->db->get();
        $stats['pending_orders'] = $query->row()->count;
        
        // Samples collected today
        $this->db->select('COUNT(*) as count');
        $this->db->from('lab_samples ls');
        $this->db->where('ls.collection_date', date('Y-m-d'));
        $this->db->where('ls.status', 'collected');
        if ($organization_id) {
            $this->db->where('ls.organization_id', $organization_id);
        }
        $query = $this->db->get();
        $stats['samples_collected_today'] = $query->row()->count;
        
        // Results pending verification
        $this->db->select('COUNT(*) as count');
        $this->db->from('lab_results lr');
        $this->db->where_in('lr.status', ['entered', 'tech-verified']);
        if ($organization_id) {
            $this->db->where('lr.organization_id', $organization_id);
        }
        $query = $this->db->get();
        $stats['results_pending_verification'] = $query->row()->count;
        
        // Critical results
        $this->db->select('COUNT(*) as count');
        $this->db->from('lab_results lr');
        $this->db->where('lr.is_critical', 1);
        $this->db->where('lr.status !=', 'pathologist-signed');
        if ($organization_id) {
            $this->db->where('lr.organization_id', $organization_id);
        }
        $query = $this->db->get();
        $stats['critical_results'] = $query->row()->count;
        
        // Orders today
        $this->db->select('COUNT(*) as count');
        $this->db->from('lab_orders lo');
        $this->db->where('lo.order_date', date('Y-m-d'));
        if ($organization_id) {
            $this->db->where('lo.organization_id', $organization_id);
        }
        $query = $this->db->get();
        $stats['orders_today'] = $query->row()->count;
        
        // Completed today
        $this->db->select('COUNT(*) as count');
        $this->db->from('lab_orders lo');
        $this->db->where('lo.status', 'completed');
        $this->db->where('DATE(lo.updated_at)', date('Y-m-d'));
        if ($organization_id) {
            $this->db->where('lo.organization_id', $organization_id);
        }
        $query = $this->db->get();
        $stats['completed_today'] = $query->row()->count;
        
        return $stats;
    }

    /**
     * Create lab order (delegates to Lab_order_model)
     */
    public function create_order($data) {
        return $this->Lab_order_model->create($data);
    }

    /**
     * Get orders (delegates to Lab_order_model)
     */
    public function get_orders($filters = array()) {
        return $this->Lab_order_model->get_all($filters);
    }

    /**
     * Update order status (delegates to Lab_order_model)
     */
    public function update_order_status($order_id, $status) {
        return $this->Lab_order_model->update_status($order_id, $status);
    }

    /**
     * Create sample (delegates to Lab_sample_model)
     */
    public function create_sample($data) {
        return $this->Lab_sample_model->create($data);
    }

    /**
     * Get samples (delegates to Lab_sample_model)
     */
    public function get_samples($filters = array()) {
        return $this->Lab_sample_model->get_all($filters);
    }

    /**
     * Create result (delegates to Lab_result_model)
     */
    public function create_result($data) {
        return $this->Lab_result_model->create($data);
    }

    /**
     * Get results (delegates to Lab_result_model)
     */
    public function get_results($filters = array()) {
        return $this->Lab_result_model->get_all($filters);
    }

    /**
     * Verify result (delegates to Lab_result_model)
     */
    public function verify_result($result_id, $user_id) {
        return $this->Lab_result_model->verify($result_id, $user_id);
    }

    /**
     * Approve result (delegates to Lab_result_model)
     */
    public function approve_result($result_id, $user_id) {
        return $this->Lab_result_model->approve($result_id, $user_id);
    }

    /**
     * Generate report (delegates to Lab_report_model)
     */
    public function generate_report($order_id, $user_id) {
        return $this->Lab_report_model->generate($order_id, $user_id);
    }
}

