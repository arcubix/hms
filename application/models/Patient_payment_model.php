<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Patient_payment_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all payments with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('pp.*, p.name as patient_name, p.patient_id as patient_code, u.name as processed_by_name');
        $this->db->from('patient_payments pp');
        $this->db->join('patients p', 'pp.patient_id = p.id', 'inner');
        $this->db->join('users u', 'pp.processed_by = u.id', 'left');
        
        // Apply patient filter
        if (!empty($filters['patient_id'])) {
            $this->db->where('pp.patient_id', $filters['patient_id']);
        }
        
        // Apply bill type filter
        if (!empty($filters['bill_type']) && $filters['bill_type'] !== 'all') {
            $this->db->where('pp.bill_type', $filters['bill_type']);
        }
        
        // Apply bill ID filter
        if (!empty($filters['bill_id'])) {
            $this->db->where('pp.bill_id', $filters['bill_id']);
        }
        
        // Apply payment type filter
        if (!empty($filters['payment_type']) && $filters['payment_type'] !== 'all') {
            $this->db->where('pp.payment_type', $filters['payment_type']);
        }
        
        // Apply status filter
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $this->db->where('pp.payment_status', $filters['payment_status']);
        }
        
        // Apply payment method filter
        if (!empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $this->db->where('pp.payment_method', $filters['payment_method']);
        }
        
        // Apply date range filter
        if (!empty($filters['date_from'])) {
            $this->db->where('pp.payment_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('pp.payment_date <=', $filters['date_to']);
        }
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('pp.payment_number', $search);
            $this->db->or_like('pp.receipt_number', $search);
            $this->db->or_like('pp.transaction_id', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('p.patient_id', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('pp.payment_date', 'DESC');
        $this->db->order_by('pp.id', 'DESC');
        
        // Apply pagination
        if (isset($filters['limit'])) {
            $offset = isset($filters['offset']) ? $filters['offset'] : 0;
            $this->db->limit($filters['limit'], $offset);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get payment by ID
     */
    public function get_by_id($id) {
        $this->db->select('pp.*, p.name as patient_name, p.patient_id as patient_code, p.phone, p.email, u.name as processed_by_name');
        $this->db->from('patient_payments pp');
        $this->db->join('patients p', 'pp.patient_id = p.id', 'inner');
        $this->db->join('users u', 'pp.processed_by = u.id', 'left');
        $this->db->where('pp.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get payment by payment number
     */
    public function get_by_payment_number($payment_number) {
        $this->db->where('payment_number', $payment_number);
        $query = $this->db->get('patient_payments');
        return $query->row_array();
    }

    /**
     * Get payment by receipt number
     */
    public function get_by_receipt_number($receipt_number) {
        $this->db->where('receipt_number', $receipt_number);
        $query = $this->db->get('patient_payments');
        return $query->row_array();
    }

    /**
     * Create payment
     */
    public function create($data) {
        try {
            // Validate required fields
            if (empty($data['patient_id'])) {
                log_message('error', 'Patient_payment_model->create(): patient_id is required');
                return false;
            }
            
            if (empty($data['amount']) || floatval($data['amount']) <= 0) {
                log_message('error', 'Patient_payment_model->create(): Valid amount is required');
                return false;
            }
            
            // Generate payment number
            $payment_number = $this->generate_payment_number();
            
            // Generate receipt number
            $receipt_number = $this->generate_receipt_number();
            
            $insert_data = array(
                'payment_number' => $payment_number,
                'receipt_number' => $receipt_number,
                'patient_id' => intval($data['patient_id']),
                'bill_type' => $data['bill_type'] ?? 'advance',
                'bill_id' => isset($data['bill_id']) ? intval($data['bill_id']) : null,
                'payment_type' => $data['payment_type'] ?? 'partial',
                'payment_method' => $data['payment_method'] ?? 'cash',
                'amount' => floatval($data['amount']),
                'payment_date' => $data['payment_date'] ?? date('Y-m-d'),
                'payment_time' => $data['payment_time'] ?? date('H:i:s'),
                'transaction_id' => $data['transaction_id'] ?? null,
                'bank_name' => $data['bank_name'] ?? null,
                'cheque_number' => $data['cheque_number'] ?? null,
                'cheque_date' => $data['cheque_date'] ?? null,
                'payment_status' => $data['payment_status'] ?? 'completed',
                'notes' => $data['notes'] ?? null,
                'receipt_path' => $data['receipt_path'] ?? null,
                'processed_by' => isset($data['processed_by']) ? intval($data['processed_by']) : null
            );
        
            if ($this->db->insert('patient_payments', $insert_data)) {
                $payment_id = $this->db->insert_id();
                
                if (!$payment_id) {
                    log_message('error', 'Patient_payment_model->create(): Failed to get insert_id after successful insert');
                    return false;
                }
                
                // Update advance balance if it's an advance payment
                if ($data['bill_type'] === 'advance' || $data['payment_type'] === 'advance') {
                    $this->update_advance_balance($data['patient_id'], $data['amount'], 'add');
                }
                
                return $payment_id;
            } else {
                $db_error = $this->db->error();
                log_message('error', 'Patient_payment_model->create(): Database insert failed. Error: ' . json_encode($db_error));
                log_message('error', 'Patient_payment_model->create(): Insert data: ' . json_encode($insert_data));
            }
            return false;
        } catch (Exception $e) {
            log_message('error', 'Patient_payment_model->create(): Exception: ' . $e->getMessage());
            log_message('error', 'Patient_payment_model->create(): Trace: ' . $e->getTraceAsString());
            log_message('error', 'Patient_payment_model->create(): Input data: ' . json_encode($data));
            return false;
        }
    }

    /**
     * Update payment
     */
    public function update($id, $data) {
        $update_data = array();
        
        $allowed_fields = array(
            'payment_date', 'payment_time', 'amount', 'payment_method', 
            'transaction_id', 'bank_name', 'cheque_number', 'cheque_date',
            'payment_status', 'notes', 'receipt_path'
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
        return $this->db->update('patient_payments', $update_data);
    }

    /**
     * Delete payment
     */
    public function delete($id) {
        $payment = $this->get_by_id($id);
        if (!$payment) {
            return false;
        }
        
        // If it's an advance payment, reverse the advance balance
        if ($payment['bill_type'] === 'advance' || $payment['payment_type'] === 'advance') {
            $this->update_advance_balance($payment['patient_id'], $payment['amount'], 'subtract');
        }
        
        $this->db->where('id', $id);
        return $this->db->delete('patient_payments');
    }

    /**
     * Generate payment number
     */
    private function generate_payment_number() {
        $year = date('Y');
        
        // Get the last payment number for this year
        $this->db->select('payment_number');
        $this->db->from('patient_payments');
        $this->db->like('payment_number', 'PAY-' . $year, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        $last_payment = $query->row_array();
        
        if ($last_payment) {
            // Extract number from last payment
            $parts = explode('-', $last_payment['payment_number']);
            $last_num = isset($parts[2]) ? intval($parts[2]) : 0;
            $num = $last_num + 1;
        } else {
            $num = 1;
        }
        
        return 'PAY-' . $year . '-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Generate receipt number
     */
    private function generate_receipt_number() {
        $year = date('Y');
        
        // Get the last receipt number for this year
        $this->db->select('receipt_number');
        $this->db->from('patient_payments');
        $this->db->where('receipt_number IS NOT NULL');
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
     * Get payments for a specific bill
     */
    public function get_by_bill($bill_type, $bill_id) {
        $this->db->where('bill_type', $bill_type);
        $this->db->where('bill_id', $bill_id);
        $this->db->where('payment_status', 'completed');
        $this->db->order_by('payment_date', 'DESC');
        $query = $this->db->get('patient_payments');
        return $query->result_array();
    }

    /**
     * Get total paid amount for a bill
     */
    public function get_total_paid($bill_type, $bill_id) {
        // Ensure bill_id is integer for proper matching
        $bill_id = intval($bill_id);
        
        $this->db->select_sum('amount');
        $this->db->where('bill_type', $bill_type);
        $this->db->where('bill_id', $bill_id);
        $this->db->where('payment_status', 'completed');
        $query = $this->db->get('patient_payments');
        $result = $query->row();
        $total = floatval($result->amount ?? 0.00);
        
        // Debug logging
        log_message('debug', 'Patient_payment_model->get_total_paid: bill_type=' . $bill_type . ', bill_id=' . $bill_id . ', total_paid=' . $total);
        
        return $total;
    }

    /**
     * Get payments for a patient
     */
    public function get_by_patient($patient_id, $filters = array()) {
        $this->db->where('patient_id', $patient_id);
        
        if (!empty($filters['bill_type']) && $filters['bill_type'] !== 'all') {
            $this->db->where('bill_type', $filters['bill_type']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('payment_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('payment_date <=', $filters['date_to']);
        }
        
        $this->db->order_by('payment_date', 'DESC');
        $this->db->order_by('id', 'DESC');
        
        $query = $this->db->get('patient_payments');
        return $query->result_array();
    }

    /**
     * Update patient advance balance
     */
    public function update_advance_balance($patient_id, $amount, $operation = 'add') {
        // Check if record exists
        $this->db->where('patient_id', $patient_id);
        $query = $this->db->get('patient_advance_balance');
        $balance = $query->row_array();
        
        if ($balance) {
            if ($operation === 'add') {
                $new_total_paid = $balance['total_advance_paid'] + $amount;
                $new_balance = $balance['current_balance'] + $amount;
            } else {
                $new_total_paid = max(0, $balance['total_advance_paid'] - $amount);
                $new_balance = max(0, $balance['current_balance'] - $amount);
            }
            
            $this->db->where('patient_id', $patient_id);
            $this->db->update('patient_advance_balance', array(
                'total_advance_paid' => $new_total_paid,
                'current_balance' => $new_balance
            ));
        } else {
            // Create new record
            if ($operation === 'add') {
                $this->db->insert('patient_advance_balance', array(
                    'patient_id' => $patient_id,
                    'total_advance_paid' => $amount,
                    'total_advance_used' => 0.00,
                    'current_balance' => $amount
                ));
            }
        }
    }

    /**
     * Use advance balance against a bill
     */
    public function use_advance_balance($patient_id, $amount) {
        $this->db->where('patient_id', $patient_id);
        $query = $this->db->get('patient_advance_balance');
        $balance = $query->row_array();
        
        if ($balance && $balance['current_balance'] >= $amount) {
            $new_balance = $balance['current_balance'] - $amount;
            $new_used = $balance['total_advance_used'] + $amount;
            
            $this->db->where('patient_id', $patient_id);
            $this->db->update('patient_advance_balance', array(
                'current_balance' => $new_balance,
                'total_advance_used' => $new_used
            ));
            
            return true;
        }
        
        return false;
    }

    /**
     * Get patient advance balance
     */
    public function get_advance_balance($patient_id) {
        $this->db->where('patient_id', $patient_id);
        $query = $this->db->get('patient_advance_balance');
        $balance = $query->row_array();
        
        if ($balance) {
            return $balance['current_balance'];
        }
        
        return 0.00;
    }

    /**
     * Get payment statistics
     */
    public function get_statistics($filters = array()) {
        $this->db->select_sum('amount');
        $this->db->where('payment_status', 'completed');
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['bill_type']) && $filters['bill_type'] !== 'all') {
            $this->db->where('bill_type', $filters['bill_type']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('payment_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('payment_date <=', $filters['date_to']);
        }
        
        $query = $this->db->get('patient_payments');
        $result = $query->row();
        
        return array(
            'total_paid' => $result->amount ?? 0.00,
            'total_payments' => $this->db->count_all_results('patient_payments')
        );
    }
}

