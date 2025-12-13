<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_billing_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get billing for an admission
     */
    public function get_by_admission($admission_id) {
        $this->db->select('
            ib.*,
            u.name as created_by_name
        ');
        $this->db->from('ipd_billing ib');
        $this->db->join('users u', 'u.id = ib.created_by', 'left');
        $this->db->where('ib.admission_id', $admission_id);
        $this->db->order_by('ib.billing_date', 'DESC');
        $this->db->limit(1);
        
        $query = $this->db->get();
        $billing = $query->row_array();
        
        // Include surgery charges if billing exists
        if ($billing) {
            // Generate bill number if not exists
            if (empty($billing['bill_number'])) {
                $billing['bill_number'] = 'IPD-BILL-' . date('Y') . '-' . str_pad($billing['id'], 6, '0', STR_PAD_LEFT);
            }
            
            // Parse JSON fields for frontend consumption
            if (!empty($billing['room_charges'])) {
                $billing['room_charges'] = is_string($billing['room_charges']) 
                    ? json_decode($billing['room_charges'], true) 
                    : $billing['room_charges'];
            }
            
            if (!empty($billing['consultation_charges'])) {
                $billing['consultation_charges'] = is_string($billing['consultation_charges']) 
                    ? json_decode($billing['consultation_charges'], true) 
                    : $billing['consultation_charges'];
            }
            
            if (!empty($billing['procedure_charges'])) {
                $billing['procedure_charges'] = is_string($billing['procedure_charges']) 
                    ? json_decode($billing['procedure_charges'], true) 
                    : $billing['procedure_charges'];
            }
            
            if (!empty($billing['other_charges'])) {
                $billing['other_charges'] = is_string($billing['other_charges']) 
                    ? json_decode($billing['other_charges'], true) 
                    : $billing['other_charges'];
            }
            
            try {
                $this->load->model('Ipd_surgery_charges_model');
                $surgery_charges = $this->Ipd_surgery_charges_model->get_by_admission($admission_id);
            } catch (Exception $e) {
                log_message('error', 'Ipd_billing_model->get_by_admission: Error loading surgery charges: ' . $e->getMessage());
                $surgery_charges = array(); // Continue without surgery charges if there's an error
            }
            
            // Calculate total surgery charges
            $surgery_total = 0;
            $surgery_procedures = array();
            $existing_surgery_ids = array();
            
            // Get existing procedure charges to check for duplicates
            $existing_procedures = is_array($billing['procedure_charges']) 
                ? $billing['procedure_charges'] 
                : array();
            
            // Extract surgery IDs that are already included
            foreach ($existing_procedures as $proc) {
                if (isset($proc['surgery_id'])) {
                    $existing_surgery_ids[] = $proc['surgery_id'];
                }
            }
            
            // Add only new surgery charges
            foreach ($surgery_charges as $charge) {
                $surgery_id = $charge['id'];
                // Skip if already included
                if (in_array($surgery_id, $existing_surgery_ids)) {
                    continue;
                }
                
                $surgery_amount = floatval($charge['total_amount'] ?? 0);
                $surgery_total += $surgery_amount;
                $surgery_procedures[] = array(
                    'procedure_name' => $charge['procedure_name'] ?? 'Surgery',
                    'date' => $charge['scheduled_date'] ?? date('Y-m-d'),
                    'amount' => $surgery_amount,
                    'surgery_id' => $surgery_id,
                    'ot_number' => $charge['ot_number'] ?? ''
                );
            }
            
            // Add new surgery charges to procedure_charges if any
            if (!empty($surgery_procedures)) {
                $billing['procedure_charges'] = array_merge($existing_procedures, $surgery_procedures);
                
                // Recalculate totals including new surgery charges
                $current_subtotal = floatval($billing['subtotal'] ?? 0);
                $billing['subtotal'] = $current_subtotal + $surgery_total;
                
                // Recalculate tax on new subtotal
                $discount = floatval($billing['discount'] ?? 0);
                $tax = ($billing['subtotal'] - $discount) * 0.18; // 18% GST
                $billing['tax'] = $tax;
                $billing['total_amount'] = $billing['subtotal'] - $discount + $tax;
                
                // Recalculate due amount
                $advance_paid = floatval($billing['advance_paid'] ?? 0);
                $insurance_covered = floatval($billing['insurance_covered'] ?? 0);
                $billing['due_amount'] = $billing['total_amount'] - $advance_paid - $insurance_covered;
                
                // Update payment status
                if ($billing['due_amount'] <= 0) {
                    $billing['payment_status'] = 'paid';
                } else if ($advance_paid > 0) {
                    $billing['payment_status'] = 'partial';
                } else {
                    $billing['payment_status'] = 'pending';
                }
            }
        }
        
        return $billing;
    }

    /**
     * Get billing by ID
     */
    public function get_by_id($id) {
        $this->db->select('
            ib.*,
            u.name as created_by_name
        ');
        $this->db->from('ipd_billing ib');
        $this->db->join('users u', 'u.id = ib.created_by', 'left');
        $this->db->where('ib.id', $id);
        
        $query = $this->db->get();
        $billing = $query->row_array();
        
        if ($billing) {
            // Generate bill number if not exists
            if (empty($billing['bill_number'])) {
                $billing['bill_number'] = 'IPD-BILL-' . date('Y') . '-' . str_pad($billing['id'], 6, '0', STR_PAD_LEFT);
            }
            
            // Parse JSON fields for frontend consumption
            if (!empty($billing['room_charges'])) {
                $billing['room_charges'] = is_string($billing['room_charges']) 
                    ? json_decode($billing['room_charges'], true) 
                    : $billing['room_charges'];
            }
            
            if (!empty($billing['consultation_charges'])) {
                $billing['consultation_charges'] = is_string($billing['consultation_charges']) 
                    ? json_decode($billing['consultation_charges'], true) 
                    : $billing['consultation_charges'];
            }
            
            if (!empty($billing['procedure_charges'])) {
                $billing['procedure_charges'] = is_string($billing['procedure_charges']) 
                    ? json_decode($billing['procedure_charges'], true) 
                    : $billing['procedure_charges'];
            }
            
            if (!empty($billing['other_charges'])) {
                $billing['other_charges'] = is_string($billing['other_charges']) 
                    ? json_decode($billing['other_charges'], true) 
                    : $billing['other_charges'];
            }
        }
        
        return $billing;
    }

    /**
     * Create or update billing
     */
    public function create_or_update($admission_id, $data) {
        // Check if billing exists
        $existing = $this->get_by_admission($admission_id);
        
        // Prepare billing data
        $billing_data = array(
            'admission_id' => $admission_id,
            'patient_id' => $data['patient_id'],
            'billing_date' => $data['billing_date'] ?? date('Y-m-d'),
            'room_charges' => isset($data['room_charges']) ? json_encode($data['room_charges']) : null,
            'consultation_charges' => isset($data['consultation_charges']) ? json_encode($data['consultation_charges']) : null,
            'medication_charges' => $data['medication_charges'] ?? 0.00,
            'lab_charges' => $data['lab_charges'] ?? 0.00,
            'imaging_charges' => $data['imaging_charges'] ?? 0.00,
            'procedure_charges' => isset($data['procedure_charges']) ? json_encode($data['procedure_charges']) : null,
            'other_charges' => isset($data['other_charges']) ? json_encode($data['other_charges']) : null,
            'subtotal' => $data['subtotal'] ?? 0.00,
            'discount' => $data['discount'] ?? 0.00,
            'tax' => $data['tax'] ?? 0.00,
            'total_amount' => $data['total_amount'] ?? 0.00,
            'advance_paid' => $data['advance_paid'] ?? 0.00,
            'insurance_covered' => $data['insurance_covered'] ?? 0.00,
            'due_amount' => $data['due_amount'] ?? 0.00,
            'payment_status' => $data['payment_status'] ?? 'pending',
            'created_by' => $data['created_by'] ?? null
        );
        
        if ($existing) {
            // Update existing billing
            $this->db->where('id', $existing['id']);
            $this->db->update('ipd_billing', $billing_data);
            return $existing['id'];
        } else {
            // Create new billing
            $this->db->insert('ipd_billing', $billing_data);
            return $this->db->insert_id();
        }
    }

    /**
     * Calculate billing from admission
     */
    public function calculate_billing($admission_id) {
        $this->load->model('Ipd_admission_model');
        $admission = $this->Ipd_admission_model->get_by_id($admission_id);
        
        if (!$admission) {
            return false;
        }
        
        // Calculate room charges
        $room_charges = 0;
        $room_charges_data = null;
        if ($admission['bed_id']) {
            $this->load->model('Ipd_bed_model');
            $bed = $this->Ipd_bed_model->get_by_id($admission['bed_id']);
            if ($bed && $bed['daily_rate']) {
                $days = $admission['actual_duration'] ?? 1;
                $room_charges = $bed['daily_rate'] * $days;
                $room_charges_data = array(
                    'bed_type' => $bed['bed_type'],
                    'rate_per_day' => $bed['daily_rate'],
                    'days' => $days,
                    'total' => $room_charges
                );
            }
        } else if ($admission['room_id']) {
            $this->load->model('Ipd_room_model');
            $room = $this->Ipd_room_model->get_by_id($admission['room_id']);
            if ($room && $room['daily_rate']) {
                $days = $admission['actual_duration'] ?? 1;
                $room_charges = $room['daily_rate'] * $days;
                $room_charges_data = array(
                    'room_type' => $room['room_type'],
                    'rate_per_day' => $room['daily_rate'],
                    'days' => $days,
                    'total' => $room_charges
                );
            }
        }
        
        // Get other charges (medication, lab, imaging, procedures)
        // These would typically come from other modules
        $medication_charges = 0;
        $lab_charges = 0;
        $imaging_charges = 0;
        $procedure_charges = array();
        
        // Calculate lab charges from lab_orders
        $this->load->model('Lab_order_model');
        $lab_orders = $this->Lab_order_model->get_all(array(
            'order_type' => 'IPD',
            'order_source_id' => $admission_id
        ));
        
        foreach ($lab_orders as $order) {
            if (isset($order['total_amount'])) {
                $lab_charges += floatval($order['total_amount']);
            }
        }
        
        // Get surgery charges for this admission
        $surgery_charges_total = 0;
        $this->load->model('Ipd_surgery_charges_model');
        $surgery_charges = $this->Ipd_surgery_charges_model->get_by_admission($admission_id);
        foreach ($surgery_charges as $charge) {
            $surgery_total = floatval($charge['total_amount'] ?? 0);
            $surgery_charges_total += $surgery_total;
            $procedure_charges[] = array(
                'procedure_name' => $charge['procedure_name'] ?? 'Surgery',
                'date' => $charge['scheduled_date'] ?? date('Y-m-d'),
                'amount' => $surgery_total,
                'surgery_id' => $charge['id'],
                'ot_number' => $charge['ot_number'] ?? ''
            );
        }
        
        $subtotal = $room_charges + $medication_charges + $lab_charges + $imaging_charges + $surgery_charges_total;
        $discount = 0;
        $tax = $subtotal * 0.18; // 18% GST (adjust as needed)
        $total_amount = $subtotal - $discount + $tax;
        
        $advance_paid = $admission['advance_payment'] ?? 0;
        $insurance_covered = $admission['insurance_coverage_amount'] ?? 0;
        $due_amount = $total_amount - $advance_paid - $insurance_covered;
        
        $payment_status = 'pending';
        if ($due_amount <= 0) {
            $payment_status = 'paid';
        } else if ($advance_paid > 0) {
            $payment_status = 'partial';
        }
        
        return array(
            'room_charges' => $room_charges_data,
            'medication_charges' => $medication_charges,
            'lab_charges' => $lab_charges,
            'imaging_charges' => $imaging_charges,
            'procedure_charges' => $procedure_charges,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total_amount' => $total_amount,
            'advance_paid' => $advance_paid,
            'insurance_covered' => $insurance_covered,
            'due_amount' => $due_amount,
            'payment_status' => $payment_status
        );
    }

    /**
     * Record payment
     */
    public function record_payment($admission_id, $payment_amount, $payment_mode) {
        $billing = $this->get_by_admission($admission_id);
        if (!$billing) {
            return false;
        }
        
        $new_advance = $billing['advance_paid'] + $payment_amount;
        $new_due = $billing['due_amount'] - $payment_amount;
        
        $payment_status = 'pending';
        if ($new_due <= 0) {
            $payment_status = 'paid';
        } else if ($new_advance > 0) {
            $payment_status = 'partial';
        }
        
        $this->db->where('id', $billing['id']);
        return $this->db->update('ipd_billing', array(
            'advance_paid' => $new_advance,
            'due_amount' => max(0, $new_due),
            'payment_status' => $payment_status
        ));
    }
}

