<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * PaymentProcessor Library
 * Handles payment processing logic, billing status updates, and advance payment handling
 */
class PaymentProcessor {

    private $CI;

    public function __construct() {
        $this->CI =& get_instance();
        $this->CI->load->database();
        $this->CI->load->model('Patient_payment_model');
        $this->CI->load->model('Ipd_billing_model');
        $this->CI->load->model('Opd_billing_model');
    }

    /**
     * Process payment
     * @param array $payment_data Payment data
     * @return array Result with payment_id and status
     */
    public function process_payment($payment_data) {
        try {
            // Validate payment data
            $validation = $this->validate_payment($payment_data);
            if (!$validation['valid']) {
                return array(
                    'success' => false,
                    'error' => $validation['error']
                );
            }

            // Determine payment type if not specified
            if (empty($payment_data['payment_type'])) {
                $payment_data['payment_type'] = $this->determine_payment_type($payment_data);
            }

            // Create payment record
            $payment_id = $this->CI->Patient_payment_model->create($payment_data);
            
            if (!$payment_id) {
                return array(
                    'success' => false,
                    'error' => 'Failed to create payment record'
                );
            }

            // Update billing status based on bill type
            $billing_update = $this->update_billing_status(
                $payment_data['bill_type'],
                $payment_data['bill_id'] ?? null,
                $payment_data['patient_id']
            );

            // If advance payment, update advance balance
            if ($payment_data['bill_type'] === 'advance' || $payment_data['payment_type'] === 'advance') {
                $this->CI->Patient_payment_model->update_advance_balance(
                    $payment_data['patient_id'],
                    $payment_data['amount'],
                    'add'
                );
            }

            return array(
                'success' => true,
                'payment_id' => $payment_id,
                'billing_updated' => $billing_update
            );

        } catch (Exception $e) {
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }

    /**
     * Process payment against a bill
     * @param string $bill_type Type of bill (ipd, opd, emergency, lab, radiology)
     * @param int $bill_id Bill ID
     * @param array $payment_data Payment data
     * @return array Result
     */
    public function process_bill_payment($bill_type, $bill_id, $payment_data) {
        try {
            // Get bill details
            $bill = $this->get_bill($bill_type, $bill_id);
            
            if (!$bill) {
                log_message('error', 'PaymentProcessor->process_bill_payment: Bill not found. bill_type=' . $bill_type . ', bill_id=' . $bill_id);
                return array(
                    'success' => false,
                    'error' => 'Bill not found for ' . $bill_type . ' ID: ' . $bill_id
                );
            }

            // For IPD, use the actual billing ID (not admission_id) for payment lookup
            $payment_bill_id = ($bill_type === 'ipd' && isset($bill['id'])) ? $bill['id'] : $bill_id;
            
            // Get total already paid - try both billing ID and original bill_id (admission_id) for IPD
            // This handles cases where payments were recorded with admission_id before billing record existed
            $total_paid = $this->CI->Patient_payment_model->get_total_paid($bill_type, $payment_bill_id);
            
            // If no payments found with billing ID, check with original bill_id (for IPD, this might be admission_id)
            if ($total_paid == 0 && $bill_type === 'ipd' && $payment_bill_id != $bill_id) {
                $total_paid_alt = $this->CI->Patient_payment_model->get_total_paid($bill_type, $bill_id);
                if ($total_paid_alt > 0) {
                    log_message('debug', 'PaymentProcessor->process_bill_payment: Found payments with admission_id=' . $bill_id . ', total=' . $total_paid_alt);
                    $total_paid = $total_paid_alt;
                    // Use the original bill_id for this payment to maintain consistency
                    $payment_bill_id = $bill_id;
                }
            }
            
            // Debug: Get all payments for this bill to see what's being counted
            $all_payments = $this->CI->Patient_payment_model->get_by_bill($bill_type, $payment_bill_id);
            log_message('debug', 'PaymentProcessor->process_bill_payment: Found ' . count($all_payments) . ' payment(s) for bill_id=' . $payment_bill_id . ' (original=' . $bill_id . '), bill_type=' . $bill_type);
            if (!empty($all_payments)) {
                log_message('debug', 'PaymentProcessor->process_bill_payment: Payment records: ' . json_encode($all_payments));
            }
            
            // Get bill amounts
            // For IPD, use advance_paid; for OPD, use advance_applied
            $total_amount = floatval($bill['total_amount'] ?? 0.00);
            $advance_applied = floatval($bill['advance_applied'] ?? $bill['advance_paid'] ?? 0.00);
            $insurance_covered = floatval($bill['insurance_covered'] ?? 0.00);
            $paid_amount = floatval($bill['paid_amount'] ?? 0.00);
            $bill_due_amount = isset($bill['due_amount']) ? floatval($bill['due_amount']) : null;
            
            // Calculate due amount: total - advance - insurance - total_paid
            // Use total_paid (from payment records) instead of paid_amount (from bill) for accuracy
            $calculated_due_amount = $total_amount - $advance_applied - $insurance_covered - $total_paid;
            
            // Determine final due amount
            // Always use calculated_due_amount as it's based on actual payment records (total_paid)
            // The bill's due_amount might be outdated if payments were made but billing wasn't updated
            $due_amount = $calculated_due_amount;
            
            // However, if bill_due_amount exists and no payments have been made, trust the bill's value
            if ($bill_due_amount !== null && $bill_due_amount >= 0 && $total_paid == 0) {
                $due_amount = $bill_due_amount;
            }
            
            // Ensure due_amount is not negative
            $due_amount = max(0, $due_amount);
            
            // Log for debugging
            log_message('debug', 'PaymentProcessor->process_bill_payment: Bill ID=' . $bill_id . ', Type=' . $bill_type);
            log_message('debug', 'PaymentProcessor->process_bill_payment: total_amount=' . $total_amount . ', advance_applied=' . $advance_applied . ', insurance_covered=' . $insurance_covered);
            log_message('debug', 'PaymentProcessor->process_bill_payment: paid_amount=' . $paid_amount . ', total_paid=' . $total_paid);
            log_message('debug', 'PaymentProcessor->process_bill_payment: bill_due_amount=' . ($bill_due_amount !== null ? $bill_due_amount : 'N/A') . ', calculated_due_amount=' . $calculated_due_amount . ', final due_amount=' . $due_amount);
            log_message('debug', 'PaymentProcessor->process_bill_payment: payment_amount=' . $payment_data['amount']);
            log_message('debug', 'PaymentProcessor->process_bill_payment: bill consultation_fee=' . (isset($bill['consultation_fee']) ? $bill['consultation_fee'] : 'N/A'));

            // Validate payment amount
            if (floatval($payment_data['amount']) > $due_amount) {
                return array(
                    'success' => false,
                    'error' => 'Payment amount (' . number_format($payment_data['amount'], 2) . ') exceeds due amount (' . number_format($due_amount, 2) . '). Bill total: ' . number_format($total_amount, 2) . ', Already paid: ' . number_format($total_paid, 2) . ', Consultation fee: ' . (isset($bill['consultation_fee']) ? number_format($bill['consultation_fee'], 2) : 'N/A')
                );
            }

            // Set bill reference in payment data
            $payment_data['bill_type'] = $bill_type;
            // For IPD, use the payment_bill_id we determined above (which may be admission_id if that's where existing payments are)
            // This ensures consistency - if previous payments used admission_id, we continue using it
            $payment_data['bill_id'] = $payment_bill_id;
            $payment_data['patient_id'] = $bill['patient_id'];

            // Determine payment type
            $remaining_due = $due_amount - $payment_data['amount'];
            if ($remaining_due <= 0) {
                $payment_data['payment_type'] = 'full';
            } else {
                $payment_data['payment_type'] = 'partial';
            }

            // Process payment
            return $this->process_payment($payment_data);
        } catch (Exception $e) {
            log_message('error', 'PaymentProcessor->process_bill_payment: Exception: ' . $e->getMessage());
            log_message('error', 'PaymentProcessor->process_bill_payment: Stack trace: ' . $e->getTraceAsString());
            return array(
                'success' => false,
                'error' => 'Payment processing error: ' . $e->getMessage()
            );
        }
    }

    /**
     * Process advance payment
     * @param int $patient_id Patient ID
     * @param array $payment_data Payment data
     * @return array Result
     */
    public function process_advance_payment($patient_id, $payment_data) {
        $payment_data['patient_id'] = $patient_id;
        $payment_data['bill_type'] = 'advance';
        $payment_data['payment_type'] = 'advance';

        return $this->process_payment($payment_data);
    }

    /**
     * Apply advance balance to a bill
     * @param string $bill_type Bill type
     * @param int $bill_id Bill ID
     * @param float $amount Amount to apply
     * @return array Result
     */
    public function apply_advance_balance($bill_type, $bill_id, $amount) {
        // Get bill
        $bill = $this->get_bill($bill_type, $bill_id);
        
        if (!$bill) {
            return array(
                'success' => false,
                'error' => 'Bill not found'
            );
        }

        // Check advance balance
        $advance_balance = $this->CI->Patient_payment_model->get_advance_balance($bill['patient_id']);
        
        if ($advance_balance < $amount) {
            return array(
                'success' => false,
                'error' => 'Insufficient advance balance'
            );
        }

        // Use advance balance
        $used = $this->CI->Patient_payment_model->use_advance_balance($bill['patient_id'], $amount);
        
        if (!$used) {
            return array(
                'success' => false,
                'error' => 'Failed to apply advance balance'
            );
        }

        // Update bill advance_applied
        $this->update_bill_advance($bill_type, $bill_id, $amount);

        // Update billing status
        $this->update_billing_status($bill_type, $bill_id, $bill['patient_id']);

        return array(
            'success' => true,
            'advance_applied' => $amount
        );
    }

    /**
     * Update billing status based on payments
     * @param string $bill_type Bill type
     * @param int $bill_id Bill ID
     * @param int $patient_id Patient ID
     * @return bool Success
     */
    public function update_billing_status($bill_type, $bill_id, $patient_id) {
        if (!$bill_id) {
            return true; // Advance payment, no bill to update
        }

        switch ($bill_type) {
            case 'ipd':
                return $this->update_ipd_billing_status($bill_id);
            
            case 'opd':
                return $this->CI->Opd_billing_model->update_payment_status($bill_id);
            
            case 'emergency':
                // Emergency billing update logic here
                return true;
            
            case 'lab':
            case 'radiology':
                // Lab/Radiology billing update logic here
                return true;
            
            default:
                return false;
        }
    }

    /**
     * Update IPD billing status
     * @param int $bill_id IPD billing ID
     * @return bool Success
     */
    private function update_ipd_billing_status($bill_id) {
        try {
            $billing = $this->CI->Ipd_billing_model->get_by_id($bill_id);
            
            if (!$billing) {
                log_message('error', 'PaymentProcessor->update_ipd_billing_status: Billing not found for bill_id=' . $bill_id);
                return false;
            }

            // Get total paid from payment records
            $total_paid = $this->CI->Patient_payment_model->get_total_paid('ipd', $bill_id);
            
            // Calculate due amount
            // Note: advance_paid should NOT be updated - it's the advance payment made before/during admission
            // total_paid is the sum of all payments made against the bill
            $total_amount = floatval($billing['total_amount'] ?? 0.00);
            $advance_paid = floatval($billing['advance_paid'] ?? 0.00);
            $insurance_covered = floatval($billing['insurance_covered'] ?? 0.00);
            $due_amount = $total_amount - $advance_paid - $insurance_covered - $total_paid;

            // Ensure due_amount is not negative
            $due_amount = max(0, $due_amount);

            // Determine payment status
            $payment_status = 'pending';
            if ($due_amount <= 0) {
                $payment_status = 'paid';
            } else if ($total_paid > 0 || $advance_paid > 0) {
                $payment_status = 'partial';
            }

            // Update billing (don't modify advance_paid - it's separate from payments)
            $this->CI->db->where('id', $bill_id);
            $result = $this->CI->db->update('ipd_billing', array(
                'due_amount' => $due_amount,
                'payment_status' => $payment_status
            ));
            
            if (!$result) {
                log_message('error', 'PaymentProcessor->update_ipd_billing_status: Failed to update billing. DB Error: ' . $this->CI->db->error()['message']);
            }
            
            return $result;
        } catch (Exception $e) {
            log_message('error', 'PaymentProcessor->update_ipd_billing_status: Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update bill advance applied amount
     * @param string $bill_type Bill type
     * @param int $bill_id Bill ID
     * @param float $amount Amount to add
     * @return bool Success
     */
    private function update_bill_advance($bill_type, $bill_id, $amount) {
        switch ($bill_type) {
            case 'ipd':
                $billing = $this->CI->Ipd_billing_model->get_by_id($bill_id);
                if ($billing) {
                    $new_advance = ($billing['advance_paid'] ?? 0) + $amount;
                    $this->CI->db->where('id', $bill_id);
                    return $this->CI->db->update('ipd_billing', array(
                        'advance_paid' => $new_advance
                    ));
                }
                break;
            
            case 'opd':
                $bill = $this->CI->Opd_billing_model->get_by_id($bill_id);
                if ($bill) {
                    $new_advance = ($bill['advance_applied'] ?? 0) + $amount;
                    $this->CI->db->where('id', $bill_id);
                    return $this->CI->db->update('opd_bills', array(
                        'advance_applied' => $new_advance
                    ));
                }
                break;
        }
        
        return false;
    }

    /**
     * Get bill by type and ID
     * @param string $bill_type Bill type
     * @param int $bill_id Bill ID (or admission_id for IPD if billing doesn't exist)
     * @return array|false Bill data
     */
    private function get_bill($bill_type, $bill_id) {
        switch ($bill_type) {
            case 'ipd':
                // Try to get billing by ID first
                $billing = $this->CI->Ipd_billing_model->get_by_id($bill_id);
                
                // If not found, try to get by admission_id (bill_id might be admission_id)
                if (!$billing) {
                    $billing = $this->CI->Ipd_billing_model->get_by_admission($bill_id);
                    
                    // If still not found, create billing record from admission
                    if (!$billing) {
                        $this->CI->load->model('Ipd_admission_model');
                        $admission = $this->CI->Ipd_admission_model->get_by_id($bill_id);
                        
                        if ($admission) {
                            // Calculate billing
                            $billing_data = $this->CI->Ipd_billing_model->calculate_billing($bill_id);
                            if ($billing_data) {
                                $billing_data['patient_id'] = $admission['patient_id'];
                                // Try to get user ID from various sources
                                $user_id = null;
                                if (isset($this->CI->user) && isset($this->CI->user['id'])) {
                                    $user_id = $this->CI->user['id'];
                                } elseif ($this->CI->session && $this->CI->session->userdata('user_id')) {
                                    $user_id = $this->CI->session->userdata('user_id');
                                }
                                $billing_data['created_by'] = $user_id;
                                $billing_id = $this->CI->Ipd_billing_model->create_or_update($bill_id, $billing_data);
                                $billing = $this->CI->Ipd_billing_model->get_by_id($billing_id);
                            }
                        }
                    }
                }
                
                return $billing;
            
            case 'opd':
                return $this->CI->Opd_billing_model->get_by_id($bill_id);
            
            case 'emergency':
                // Get emergency bill logic here
                return false;
            
            case 'lab':
            case 'radiology':
                // Get lab/radiology bill logic here
                return false;
            
            default:
                return false;
        }
    }

    /**
     * Validate payment data
     * @param array $payment_data Payment data
     * @return array Validation result
     */
    private function validate_payment($payment_data) {
        // Required fields
        if (empty($payment_data['patient_id'])) {
            return array('valid' => false, 'error' => 'Patient ID is required');
        }

        if (empty($payment_data['amount']) || $payment_data['amount'] <= 0) {
            return array('valid' => false, 'error' => 'Valid payment amount is required');
        }

        if (empty($payment_data['payment_method'])) {
            return array('valid' => false, 'error' => 'Payment method is required');
        }

        // Validate payment method
        $valid_methods = array('cash', 'card', 'bank_transfer', 'cheque');
        if (!in_array($payment_data['payment_method'], $valid_methods)) {
            return array('valid' => false, 'error' => 'Invalid payment method');
        }

        // Validate cheque details if cheque payment
        if ($payment_data['payment_method'] === 'cheque') {
            if (empty($payment_data['cheque_number'])) {
                return array('valid' => false, 'error' => 'Cheque number is required for cheque payments');
            }
            if (empty($payment_data['bank_name'])) {
                return array('valid' => false, 'error' => 'Bank name is required for cheque payments');
            }
        }

        // Validate transaction ID for card/bank transfer
        if (in_array($payment_data['payment_method'], array('card', 'bank_transfer'))) {
            if (empty($payment_data['transaction_id'])) {
                return array('valid' => false, 'error' => 'Transaction ID is required for ' . $payment_data['payment_method'] . ' payments');
            }
        }

        return array('valid' => true);
    }

    /**
     * Determine payment type based on bill and amount
     * @param array $payment_data Payment data
     * @return string Payment type
     */
    private function determine_payment_type($payment_data) {
        if ($payment_data['bill_type'] === 'advance') {
            return 'advance';
        }

        if (empty($payment_data['bill_id'])) {
            return 'advance';
        }

        // Get bill and calculate
        $bill = $this->get_bill($payment_data['bill_type'], $payment_data['bill_id']);
        
        if (!$bill) {
            return 'partial';
        }

        $total_paid = $this->CI->Patient_payment_model->get_total_paid(
            $payment_data['bill_type'],
            $payment_data['bill_id']
        );

        $total_amount = $bill['total_amount'] ?? 0.00;
        $advance_applied = $bill['advance_applied'] ?? $bill['advance_paid'] ?? 0.00;
        $insurance_covered = $bill['insurance_covered'] ?? 0.00;
        $due_amount = $total_amount - $advance_applied - $insurance_covered - $total_paid;

        $remaining_due = $due_amount - $payment_data['amount'];

        if ($remaining_due <= 0) {
            return 'full';
        } else {
            return 'partial';
        }
    }

    /**
     * Refund payment
     * @param int $payment_id Payment ID
     * @param float $refund_amount Refund amount (null for full refund)
     * @param string $reason Refund reason
     * @return array Result
     */
    public function refund_payment($payment_id, $refund_amount = null, $reason = '') {
        $payment = $this->CI->Patient_payment_model->get_by_id($payment_id);
        
        if (!$payment) {
            return array(
                'success' => false,
                'error' => 'Payment not found'
            );
        }

        if ($payment['payment_status'] === 'refunded') {
            return array(
                'success' => false,
                'error' => 'Payment already refunded'
            );
        }

        $refund_amount = $refund_amount ?? $payment['amount'];

        if ($refund_amount > $payment['amount']) {
            return array(
                'success' => false,
                'error' => 'Refund amount cannot exceed payment amount'
            );
        }

        // Create refund payment record
        $refund_data = array(
            'patient_id' => $payment['patient_id'],
            'bill_type' => $payment['bill_type'],
            'bill_id' => $payment['bill_id'],
            'payment_type' => 'refund',
            'payment_method' => $payment['payment_method'],
            'amount' => $refund_amount,
            'payment_date' => date('Y-m-d'),
            'payment_time' => date('H:i:s'),
            'payment_status' => 'refunded',
            'notes' => 'Refund: ' . $reason
        );

        $refund_id = $this->CI->Patient_payment_model->create($refund_data);

        if ($refund_id) {
            // Update original payment status
            $this->CI->Patient_payment_model->update($payment_id, array(
                'payment_status' => 'refunded'
            ));

            // Reverse advance balance if it was an advance payment
            if ($payment['bill_type'] === 'advance' || $payment['payment_type'] === 'advance') {
                $this->CI->Patient_payment_model->update_advance_balance(
                    $payment['patient_id'],
                    $refund_amount,
                    'subtract'
                );
            }

            // Update billing status
            if ($payment['bill_id']) {
                $this->update_billing_status(
                    $payment['bill_type'],
                    $payment['bill_id'],
                    $payment['patient_id']
                );
            }

            return array(
                'success' => true,
                'refund_id' => $refund_id
            );
        }

        return array(
            'success' => false,
            'error' => 'Failed to process refund'
        );
    }
}

