<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Opd_billing_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get bill by ID
     */
    public function get_by_id($id) {
        $this->db->select('ob.*, p.name as patient_name, p.patient_id as patient_code, p.phone, p.email, u.name as created_by_name');
        $this->db->from('opd_bills ob');
        $this->db->join('patients p', 'ob.patient_id = p.id', 'inner');
        $this->db->join('users u', 'ob.created_by = u.id', 'left');
        $this->db->where('ob.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get bill by bill number
     */
    public function get_by_bill_number($bill_number) {
        $this->db->where('bill_number', $bill_number);
        $query = $this->db->get('opd_bills');
        return $query->row_array();
    }

    /**
     * Get bills for a patient
     */
    public function get_by_patient($patient_id, $filters = array()) {
        $this->db->where('patient_id', $patient_id);
        
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $this->db->where('payment_status', $filters['payment_status']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('bill_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('bill_date <=', $filters['date_to']);
        }
        
        $this->db->order_by('bill_date', 'DESC');
        $this->db->order_by('id', 'DESC');
        
        $query = $this->db->get('opd_bills');
        return $query->result_array();
    }

    /**
     * Get bill by appointment
     */
    public function get_by_appointment($appointment_id) {
        $this->db->where('appointment_id', $appointment_id);
        $this->db->order_by('bill_date', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('opd_bills');
        return $query->row_array();
    }

    /**
     * Get bill by consultation
     */
    public function get_by_consultation($consultation_id) {
        $this->db->where('consultation_id', $consultation_id);
        $this->db->order_by('bill_date', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('opd_bills');
        return $query->row_array();
    }

    /**
     * Create bill
     */
    public function create($data) {
        try {
            // Validate required fields
            if (empty($data['patient_id'])) {
                log_message('error', 'Opd_billing_model->create(): patient_id is required');
                return false;
            }
            
            // Generate bill number
            $bill_number = $this->generate_bill_number();
            
            // Calculate totals if not provided
            if (!isset($data['subtotal']) || !isset($data['total_amount'])) {
                $calculated = $this->calculate_totals($data);
                if (!$calculated || !is_array($calculated)) {
                    log_message('error', 'Opd_billing_model->create(): calculate_totals() failed or returned invalid data');
                    return false;
                }
                $data = array_merge($data, $calculated);
            }
            
            // Validate that required calculated fields exist
            if (!isset($data['subtotal']) || !isset($data['total_amount'])) {
                log_message('error', 'Opd_billing_model->create(): Missing subtotal or total_amount after calculation. Data: ' . json_encode($data));
                return false;
            }
            
            $insert_data = array(
                'bill_number' => $bill_number,
                'patient_id' => $data['patient_id'],
                'appointment_id' => $data['appointment_id'] ?? null,
                'consultation_id' => $data['consultation_id'] ?? null,
                'bill_date' => $data['bill_date'] ?? date('Y-m-d'),
                'consultation_fee' => isset($data['consultation_fee']) ? floatval($data['consultation_fee']) : 0.00,
                'procedure_fees' => isset($data['procedure_fees']) ? json_encode($data['procedure_fees']) : null,
                'lab_charges' => isset($data['lab_charges']) ? floatval($data['lab_charges']) : 0.00,
                'radiology_charges' => isset($data['radiology_charges']) ? floatval($data['radiology_charges']) : 0.00,
                'medication_charges' => isset($data['medication_charges']) ? floatval($data['medication_charges']) : 0.00,
                'other_charges' => isset($data['other_charges']) ? json_encode($data['other_charges']) : null,
                'subtotal' => floatval($data['subtotal']),
                'discount' => isset($data['discount']) ? floatval($data['discount']) : 0.00,
                'discount_percentage' => isset($data['discount_percentage']) ? floatval($data['discount_percentage']) : 0.00,
                'tax_rate' => isset($data['tax_rate']) ? floatval($data['tax_rate']) : 0.00,
                'tax_amount' => isset($data['tax_amount']) ? floatval($data['tax_amount']) : 0.00,
                'total_amount' => floatval($data['total_amount']),
                'advance_applied' => isset($data['advance_applied']) ? floatval($data['advance_applied']) : 0.00,
                'insurance_covered' => isset($data['insurance_covered']) ? floatval($data['insurance_covered']) : 0.00,
                'paid_amount' => isset($data['paid_amount']) ? floatval($data['paid_amount']) : 0.00,
                'due_amount' => isset($data['due_amount']) ? floatval($data['due_amount']) : floatval($data['total_amount']),
                'payment_status' => $data['payment_status'] ?? 'pending',
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null
            );
            
            // Attempt database insert
            if (!$this->db->insert('opd_bills', $insert_data)) {
                $db_error = $this->db->error();
                log_message('error', 'Opd_billing_model->create(): Database insert failed. Error: ' . json_encode($db_error));
                log_message('error', 'Opd_billing_model->create(): Insert data: ' . json_encode($insert_data));
                return false;
            }
            
            $bill_id = $this->db->insert_id();
            
            if (!$bill_id) {
                log_message('error', 'Opd_billing_model->create(): Failed to get insert_id after successful insert');
                return false;
            }
            
            // Insert bill items if provided
            if (!empty($data['items']) && is_array($data['items'])) {
                $this->insert_bill_items($bill_id, $data['items']);
            }
            
            return $bill_id;
        } catch (Exception $e) {
            log_message('error', 'Opd_billing_model->create(): Exception: ' . $e->getMessage());
            log_message('error', 'Opd_billing_model->create(): Trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Update bill
     */
    public function update($id, $data) {
        // Recalculate totals if amounts changed
        if (isset($data['consultation_fee']) || isset($data['lab_charges']) || 
            isset($data['radiology_charges']) || isset($data['medication_charges'])) {
            $bill = $this->get_by_id($id);
            if ($bill) {
                $calculated = $this->calculate_totals(array_merge($bill, $data));
                $data = array_merge($data, $calculated);
            }
        }
        
        $update_data = array();
        $allowed_fields = array(
            'bill_date', 'consultation_fee', 'procedure_fees', 'lab_charges',
            'radiology_charges', 'medication_charges', 'other_charges',
            'subtotal', 'discount', 'discount_percentage', 'tax_rate', 'tax_amount',
            'total_amount', 'advance_applied', 'insurance_covered', 'paid_amount',
            'due_amount', 'payment_status', 'notes'
        );
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                if ($field === 'procedure_fees' || $field === 'other_charges') {
                    $update_data[$field] = json_encode($data[$field]);
                } else {
                    $update_data[$field] = $data[$field];
                }
            }
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $this->db->where('id', $id);
        return $this->db->update('opd_bills', $update_data);
    }

    /**
     * Delete bill
     */
    public function delete($id) {
        // Delete bill items first
        $this->db->where('bill_id', $id);
        $this->db->delete('opd_bill_items');
        
        // Delete bill
        $this->db->where('id', $id);
        return $this->db->delete('opd_bills');
    }

    /**
     * Calculate totals
     */
    public function calculate_totals($data) {
        try {
            // Validate input
            if (!is_array($data)) {
                log_message('error', 'Opd_billing_model->calculate_totals(): Invalid input - not an array');
                return array(
                    'subtotal' => 0.00,
                    'discount' => 0.00,
                    'tax_amount' => 0.00,
                    'total_amount' => 0.00,
                    'due_amount' => 0.00
                );
            }
            
            $subtotal = 0.00;
            
            // Add consultation fee (ensure it's numeric)
            $consultation_fee = isset($data['consultation_fee']) ? floatval($data['consultation_fee']) : 0.00;
            $subtotal += max(0, $consultation_fee);
            
            // Add procedure fees
            if (!empty($data['procedure_fees'])) {
                $procedure_fees = is_string($data['procedure_fees']) ? json_decode($data['procedure_fees'], true) : $data['procedure_fees'];
                if (is_array($procedure_fees)) {
                    foreach ($procedure_fees as $fee) {
                        if (is_array($fee) && isset($fee['amount'])) {
                            $subtotal += max(0, floatval($fee['amount']));
                        }
                    }
                }
            }
            
            // Add lab charges (ensure it's numeric)
            $lab_charges = isset($data['lab_charges']) ? floatval($data['lab_charges']) : 0.00;
            $subtotal += max(0, $lab_charges);
            
            // Add radiology charges (ensure it's numeric)
            $radiology_charges = isset($data['radiology_charges']) ? floatval($data['radiology_charges']) : 0.00;
            $subtotal += max(0, $radiology_charges);
            
            // Add medication charges (ensure it's numeric)
            $medication_charges = isset($data['medication_charges']) ? floatval($data['medication_charges']) : 0.00;
            $subtotal += max(0, $medication_charges);
            
            // Add other charges
            if (!empty($data['other_charges'])) {
                $other_charges = is_string($data['other_charges']) ? json_decode($data['other_charges'], true) : $data['other_charges'];
                if (is_array($other_charges)) {
                    foreach ($other_charges as $charge) {
                        if (is_array($charge) && isset($charge['amount'])) {
                            $subtotal += max(0, floatval($charge['amount']));
                        }
                    }
                }
            }
            
            // Ensure subtotal is not negative
            $subtotal = max(0, $subtotal);
            
            // Calculate discount
            $discount_percentage = isset($data['discount_percentage']) ? floatval($data['discount_percentage']) : 0.00;
            $discount_percentage = max(0, min(100, $discount_percentage)); // Clamp between 0 and 100
            
            if (isset($data['discount']) && $data['discount'] > 0) {
                $discount = max(0, floatval($data['discount']));
            } else {
                $discount = $subtotal * ($discount_percentage / 100);
            }
            
            // Ensure discount doesn't exceed subtotal
            $discount = min($discount, $subtotal);
            
            // Calculate tax
            $tax_rate = isset($data['tax_rate']) ? floatval($data['tax_rate']) : 0.00;
            $tax_rate = max(0, $tax_rate); // Ensure non-negative
            $tax_amount = ($subtotal - $discount) * ($tax_rate / 100);
            $tax_amount = max(0, $tax_amount); // Ensure non-negative
            
            // Calculate total
            $total_amount = $subtotal - $discount + $tax_amount;
            $total_amount = max(0, $total_amount); // Ensure non-negative
            
            // Calculate due amount
            $advance_applied = isset($data['advance_applied']) ? floatval($data['advance_applied']) : 0.00;
            $advance_applied = max(0, $advance_applied);
            
            $insurance_covered = isset($data['insurance_covered']) ? floatval($data['insurance_covered']) : 0.00;
            $insurance_covered = max(0, $insurance_covered);
            
            $paid_amount = isset($data['paid_amount']) ? floatval($data['paid_amount']) : 0.00;
            $paid_amount = max(0, $paid_amount);
            
            $due_amount = $total_amount - $advance_applied - $insurance_covered - $paid_amount;
            $due_amount = max(0, $due_amount); // Ensure non-negative
            
            return array(
                'subtotal' => round($subtotal, 2),
                'discount' => round($discount, 2),
                'tax_amount' => round($tax_amount, 2),
                'total_amount' => round($total_amount, 2),
                'due_amount' => round($due_amount, 2)
            );
        } catch (Exception $e) {
            log_message('error', 'Opd_billing_model->calculate_totals(): Exception: ' . $e->getMessage());
            log_message('error', 'Opd_billing_model->calculate_totals(): Input data: ' . json_encode($data));
            // Return safe defaults
            return array(
                'subtotal' => 0.00,
                'discount' => 0.00,
                'tax_amount' => 0.00,
                'total_amount' => 0.00,
                'due_amount' => 0.00
            );
        }
    }

    /**
     * Update payment status
     */
    public function update_payment_status($bill_id) {
        $bill = $this->get_by_id($bill_id);
        if (!$bill) {
            return false;
        }
        
        // Get total paid from patient_payments
        $this->load->model('Patient_payment_model');
        $total_paid = $this->Patient_payment_model->get_total_paid('opd', $bill_id);
        
        // Update paid_amount
        $this->db->where('id', $bill_id);
        $this->db->update('opd_bills', array('paid_amount' => $total_paid));
        
        // Determine payment status
        $due_amount = $bill['total_amount'] - ($bill['advance_applied'] ?? 0) - ($bill['insurance_covered'] ?? 0) - $total_paid;
        
        $payment_status = 'pending';
        if ($due_amount <= 0) {
            $payment_status = 'paid';
        } else if ($total_paid > 0) {
            $payment_status = 'partial';
        }
        
        $this->db->where('id', $bill_id);
        return $this->db->update('opd_bills', array(
            'due_amount' => max(0, $due_amount),
            'payment_status' => $payment_status
        ));
    }

    /**
     * Generate bill number
     */
    private function generate_bill_number() {
        $year = date('Y');
        
        // Get the last bill number for this year
        $this->db->select('bill_number');
        $this->db->from('opd_bills');
        $this->db->like('bill_number', 'OPD-' . $year, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        $last_bill = $query->row_array();
        
        if ($last_bill) {
            // Extract number from last bill
            $parts = explode('-', $last_bill['bill_number']);
            $last_num = isset($parts[2]) ? intval($parts[2]) : 0;
            $num = $last_num + 1;
        } else {
            $num = 1;
        }
        
        return 'OPD-' . $year . '-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Insert bill items
     */
    private function insert_bill_items($bill_id, $items) {
        $insert_items = array();
        
        foreach ($items as $item) {
            $insert_items[] = array(
                'bill_id' => $bill_id,
                'item_type' => $item['item_type'] ?? 'other',
                'item_name' => $item['item_name'] ?? '',
                'item_id' => $item['item_id'] ?? null,
                'quantity' => $item['quantity'] ?? 1,
                'unit_price' => $item['unit_price'] ?? 0.00,
                'total_amount' => ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0.00)
            );
        }
        
        if (!empty($insert_items)) {
            return $this->db->insert_batch('opd_bill_items', $insert_items);
        }
        
        return false;
    }

    /**
     * Get bill items
     */
    public function get_bill_items($bill_id) {
        $this->db->where('bill_id', $bill_id);
        $this->db->order_by('id', 'ASC');
        $query = $this->db->get('opd_bill_items');
        return $query->result_array();
    }

    /**
     * Get all bills with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('ob.*, p.name as patient_name, p.patient_id as patient_code, u.name as created_by_name');
        $this->db->from('opd_bills ob');
        $this->db->join('patients p', 'ob.patient_id = p.id', 'inner');
        $this->db->join('users u', 'ob.created_by = u.id', 'left');
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('ob.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $this->db->where('ob.payment_status', $filters['payment_status']);
        }
        
        if (!empty($filters['date_from'])) {
            $this->db->where('ob.bill_date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('ob.bill_date <=', $filters['date_to']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('ob.bill_number', $search);
            $this->db->or_like('p.name', $search);
            $this->db->or_like('p.patient_id', $search);
            $this->db->group_end();
        }
        
        $this->db->order_by('ob.bill_date', 'DESC');
        $this->db->order_by('ob.id', 'DESC');
        
        if (isset($filters['limit'])) {
            $offset = isset($filters['offset']) ? $filters['offset'] : 0;
            $this->db->limit($filters['limit'], $offset);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }
}

