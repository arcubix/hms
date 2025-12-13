<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lab_report_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique report ID
     * Format: RPT-YYYY-XXXXX
     */
    public function generate_report_id() {
        $year = date('Y');
        $prefix = 'RPT-' . $year . '-';
        
        $this->db->select('report_id');
        $this->db->like('report_id', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('lab_reports');
        
        if ($query->num_rows() > 0) {
            $last_report = $query->row()->report_id;
            if (preg_match('/RPT-' . $year . '-(\d+)/', $last_report, $matches)) {
                $next_number = intval($matches[1]) + 1;
            } else {
                $next_number = 1;
            }
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Generate report number for display
     * Format: LAB-RPT-YYYY-XXXXX
     */
    public function generate_report_number() {
        $year = date('Y');
        $prefix = 'LAB-RPT-' . $year . '-';
        
        $this->db->select('report_number');
        $this->db->like('report_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('lab_reports');
        
        if ($query->num_rows() > 0) {
            $last_report = $query->row()->report_number;
            if (preg_match('/LAB-RPT-' . $year . '-(\d+)/', $last_report, $matches)) {
                $next_number = intval($matches[1]) + 1;
            } else {
                $next_number = 1;
            }
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Generate report
     */
    public function generate($order_id, $user_id) {
        // Check if report already exists
        $existing = $this->get_by_order($order_id);
        if ($existing) {
            return $existing['id'];
        }
        
        // Get order details
        $this->load->model('Lab_order_model');
        $order = $this->Lab_order_model->get_by_id($order_id);
        
        if (!$order) {
            return false;
        }
        
        // Create report
        $report_data = array(
            'report_id' => $this->generate_report_id(),
            'report_number' => $this->generate_report_number(),
            'order_id' => $order_id,
            'patient_id' => $order['patient_id'],
            'generated_date' => date('Y-m-d'),
            'generated_by_user_id' => $user_id,
            'status' => 'final',
            'organization_id' => isset($order['organization_id']) ? $order['organization_id'] : null
        );
        
        if ($this->db->insert('lab_reports', $report_data)) {
            $report_id = $this->db->insert_id();
            
            // Update order status
            $this->Lab_order_model->update_status($order_id, 'reported');
            
            return $report_id;
        }
        
        return false;
    }

    /**
     * Get report by ID
     */
    public function get_by_id($id) {
        $this->db->select('lr.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender, lo.order_number, u.name as generated_by_name');
        $this->db->from('lab_reports lr');
        $this->db->join('patients p', 'p.id = lr.patient_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = lr.order_id', 'left');
        $this->db->join('users u', 'u.id = lr.generated_by_user_id', 'left');
        $this->db->where('lr.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get report by order
     */
    public function get_by_order($order_id) {
        $this->db->select('*');
        $this->db->from('lab_reports');
        $this->db->where('order_id', $order_id);
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get reports by patient
     */
    public function get_by_patient($patient_id, $limit = null) {
        $this->db->select('lr.*, lo.order_number, lo.order_date');
        $this->db->from('lab_reports lr');
        $this->db->join('lab_orders lo', 'lo.id = lr.order_id', 'left');
        $this->db->where('lr.patient_id', $patient_id);
        $this->db->order_by('lr.generated_date', 'DESC');
        
        if ($limit) {
            $this->db->limit($limit);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Generate PDF (placeholder - implement PDF generation library)
     */
    public function generate_pdf($report_id) {
        $report = $this->get_by_id($report_id);
        if (!$report) {
            return false;
        }
        
        // Get order and results
        $this->load->model('Lab_order_model');
        $this->load->model('Lab_result_model');
        
        $order = $this->Lab_order_model->get_by_id($report['order_id']);
        $results = $this->Lab_result_model->get_by_order($report['order_id']);
        
        // TODO: Implement PDF generation using library like TCPDF or mPDF
        // For now, return report data
        $report['order'] = $order;
        $report['results'] = $results;
        
        return $report;
    }

    /**
     * Update report
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('lab_reports', $data);
    }
}

