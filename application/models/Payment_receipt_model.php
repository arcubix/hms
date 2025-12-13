<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Payment_receipt_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get receipt by ID
     */
    public function get_by_id($id) {
        $this->db->select('pr.*, pp.payment_number, pp.amount, pp.payment_date, pp.payment_method, p.name as patient_name, p.patient_code, u.name as generated_by_name');
        $this->db->from('payment_receipts pr');
        $this->db->join('patient_payments pp', 'pr.payment_id = pp.id', 'inner');
        $this->db->join('patients p', 'pr.patient_id = p.id', 'inner');
        $this->db->join('users u', 'pr.generated_by = u.id', 'left');
        $this->db->where('pr.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get receipt by receipt number
     */
    public function get_by_receipt_number($receipt_number) {
        $this->db->select('pr.*, pp.payment_number, pp.amount, pp.payment_date, pp.payment_method, p.name as patient_name, p.patient_code');
        $this->db->from('payment_receipts pr');
        $this->db->join('patient_payments pp', 'pr.payment_id = pp.id', 'inner');
        $this->db->join('patients p', 'pr.patient_id = p.id', 'inner');
        $this->db->where('pr.receipt_number', $receipt_number);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get receipt by payment ID
     */
    public function get_by_payment_id($payment_id) {
        $this->db->where('payment_id', $payment_id);
        $query = $this->db->get('payment_receipts');
        return $query->row_array();
    }

    /**
     * Get receipts for a patient
     */
    public function get_by_patient($patient_id, $filters = array()) {
        $this->db->select('pr.*, pp.payment_number, pp.amount, pp.payment_date, pp.payment_method');
        $this->db->from('payment_receipts pr');
        $this->db->join('patient_payments pp', 'pr.payment_id = pp.id', 'inner');
        $this->db->where('pr.patient_id', $patient_id);
        
        if (!empty($filters['date_from'])) {
            $this->db->where('pr.receipt_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('pr.receipt_date <=', $filters['date_to']);
        }
        
        $this->db->order_by('pr.receipt_date', 'DESC');
        $this->db->order_by('pr.id', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create receipt
     */
    public function create($data) {
        // Generate receipt number if not provided
        if (empty($data['receipt_number'])) {
            $data['receipt_number'] = $this->generate_receipt_number();
        }
        
        $insert_data = array(
            'receipt_number' => $data['receipt_number'],
            'payment_id' => $data['payment_id'],
            'patient_id' => $data['patient_id'],
            'receipt_date' => $data['receipt_date'] ?? date('Y-m-d'),
            'receipt_path' => $data['receipt_path'] ?? null,
            'receipt_url' => $data['receipt_url'] ?? null,
            'template_type' => $data['template_type'] ?? 'standard',
            'generated_by' => $data['generated_by'] ?? null,
            'is_emailed' => $data['is_emailed'] ?? 0,
            'is_sms_sent' => $data['is_sms_sent'] ?? 0,
            'email_sent_at' => $data['email_sent_at'] ?? null,
            'sms_sent_at' => $data['sms_sent_at'] ?? null
        );
        
        if ($this->db->insert('payment_receipts', $insert_data)) {
            $receipt_id = $this->db->insert_id();
            
            // Update payment record with receipt number and path
            $this->load->model('Patient_payment_model');
            $this->Patient_payment_model->update($data['payment_id'], array(
                'receipt_number' => $data['receipt_number'],
                'receipt_path' => $data['receipt_path'] ?? null
            ));
            
            return $receipt_id;
        }
        return false;
    }

    /**
     * Update receipt
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'receipt_path', 'receipt_url', 'template_type', 'is_emailed', 
            'is_sms_sent', 'email_sent_at', 'sms_sent_at'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_data[$field] = $data[$field];
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('payment_receipts', $update_data);
    }

    /**
     * Mark receipt as emailed
     */
    public function mark_as_emailed($id) {
        $this->db->where('id', $id);
        return $this->db->update('payment_receipts', array(
            'is_emailed' => 1,
            'email_sent_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Mark receipt as SMS sent
     */
    public function mark_as_sms_sent($id) {
        $this->db->where('id', $id);
        return $this->db->update('payment_receipts', array(
            'is_sms_sent' => 1,
            'sms_sent_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Generate receipt number
     */
    private function generate_receipt_number() {
        $year = date('Y');
        
        // Get the last receipt number for this year
        $this->db->select('receipt_number');
        $this->db->from('payment_receipts');
        $this->db->like('receipt_number', 'RCPT-' . $year, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        $last_receipt = $query->row_array();
        
        if ($last_receipt) {
            // Extract number from last receipt
            $parts = explode('-', $last_receipt['receipt_number']);
            $last_num = isset($parts[2]) ? intval($parts[2]) : 0;
            $num = $last_num + 1;
        } else {
            $num = 1;
        }
        
        return 'RCPT-' . $year . '-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get all receipts with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('pr.*, pp.payment_number, pp.amount, pp.payment_date, pp.payment_method, p.name as patient_name, p.patient_code, u.name as generated_by_name');
        $this->db->from('payment_receipts pr');
        $this->db->join('patient_payments pp', 'pr.payment_id = pp.id', 'inner');
        $this->db->join('patients p', 'pr.patient_id = p.id', 'inner');
        $this->db->join('users u', 'pr.generated_by = u.id', 'left');
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('pr.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('pr.receipt_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('pr.receipt_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('pr.receipt_number', $search);
            $this->db->or_like('pp.payment_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('pr.receipt_date', 'DESC');
        $this->db->order_by('pr.id', 'DESC');
        
        if (isset($filters['limit'])) {
            $offset = isset($filters['offset']) ? $filters['offset'] : 0;
            $this->db->limit($filters['limit'], $offset);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }
}

