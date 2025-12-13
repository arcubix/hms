<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * Patient Payments API Controller
 * Handles patient payment operations across all modules
 */
class PatientPayments extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Patient_payment_model');
        $this->load->model('Payment_receipt_model');
        
        // Load PaymentProcessor library
        if (!isset($this->PaymentProcessor)) {
            $this->load->library('PaymentProcessor');
        }
        
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all payments or create new payment
     * GET /api/patient-payments
     * POST /api/patient-payments
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->get_payments();
            } elseif ($method === 'POST') {
                $this->create_payment();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get payments with filters
     */
    private function get_payments() {
        $filters = array(
            'patient_id' => $this->input->get('patient_id'),
            'bill_type' => $this->input->get('bill_type'),
            'bill_id' => $this->input->get('bill_id'),
            'payment_type' => $this->input->get('payment_type'),
            'payment_status' => $this->input->get('payment_status'),
            'payment_method' => $this->input->get('payment_method'),
            'date_from' => $this->input->get('date_from'),
            'date_to' => $this->input->get('date_to'),
            'search' => $this->input->get('search'),
            'limit' => $this->input->get('limit'),
            'offset' => $this->input->get('offset')
        );
        
        $payments = $this->Patient_payment_model->get_all($filters);
        $this->success($payments);
    }

    /**
     * Create new payment
     */
    private function create_payment() {
        $data = $this->get_request_data();
        
        // Validate required fields
        if (empty($data['patient_id']) || empty($data['amount'])) {
            $this->error('Patient ID and amount are required', 400);
            return;
        }

        // Set processed_by if user is logged in
        if ($this->user && isset($this->user['id'])) {
            $data['processed_by'] = $this->user['id'];
        }

        // Process payment
        $result = $this->PaymentProcessor->process_payment($data);
        
        if ($result['success']) {
            $payment = $this->Patient_payment_model->get_by_id($result['payment_id']);
            $this->success($payment, 'Payment recorded successfully', 201);
        } else {
            $this->error($result['error'] ?? 'Failed to process payment', 400);
        }
    }

    /**
     * Get payment by ID or update/delete
     * GET /api/patient-payments/{id}
     * PUT /api/patient-payments/{id}
     * DELETE /api/patient-payments/{id}
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Payment ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $payment = $this->Patient_payment_model->get_by_id($id);
                if ($payment) {
                    $this->success($payment);
                } else {
                    $this->error('Payment not found', 404);
                }
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update_payment($id);
            } elseif ($method === 'DELETE') {
                $this->delete_payment($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update payment
     */
    private function update_payment($id) {
        $data = $this->get_request_data();
        
        $result = $this->Patient_payment_model->update($id, $data);
        
        if ($result) {
            $payment = $this->Patient_payment_model->get_by_id($id);
            $this->success($payment, 'Payment updated successfully');
        } else {
            $this->error('Failed to update payment', 500);
        }
    }

    /**
     * Delete payment
     */
    private function delete_payment($id) {
        $result = $this->Patient_payment_model->delete($id);
        
        if ($result) {
            $this->success(null, 'Payment deleted successfully');
        } else {
            $this->error('Failed to delete payment', 500);
        }
    }

    /**
     * Record payment against a bill
     * POST /api/patient-payments/bill-payment
     */
    public function bill_payment() {
        try {
            $data = $this->get_request_data();
            
            if (empty($data['bill_type']) || empty($data['bill_id']) || empty($data['amount'])) {
                $this->error('Bill type, bill ID, and amount are required', 400);
                return;
            }

            // Set processed_by
            if ($this->user && isset($this->user['id'])) {
                $data['processed_by'] = $this->user['id'];
            }

            // Ensure PaymentProcessor library is loaded (similar to Appointments controller)
            if (!isset($this->PaymentProcessor) || $this->PaymentProcessor === null) {
                // Check if library is already loaded
                if ($this->load->is_loaded('PaymentProcessor')) {
                    // Library is loaded but property not set - try to access it
                    if (class_exists('PaymentProcessor')) {
                        $this->PaymentProcessor = new PaymentProcessor();
                    }
                } else {
                    // Try to load the library
                    try {
                        $this->load->library('PaymentProcessor');
                    } catch (Exception $e) {
                        log_message('error', 'PatientPayments->bill_payment: Exception loading PaymentProcessor: ' . $e->getMessage());
                    }
                }
                
                // Final fallback: instantiate directly if class exists
                if ((!isset($this->PaymentProcessor) || $this->PaymentProcessor === null) && class_exists('PaymentProcessor')) {
                    $this->PaymentProcessor = new PaymentProcessor();
                }
                
                // If still not available, return error
                if (!isset($this->PaymentProcessor) || $this->PaymentProcessor === null) {
                    log_message('error', 'PatientPayments->bill_payment: Failed to load PaymentProcessor library');
                    log_message('error', 'PaymentProcessor class exists: ' . (class_exists('PaymentProcessor') ? 'yes' : 'no'));
                    log_message('error', 'PaymentProcessor is_loaded: ' . ($this->load->is_loaded('PaymentProcessor') ? 'yes' : 'no'));
                    log_message('error', 'PaymentProcessor property exists: ' . (property_exists($this, 'PaymentProcessor') ? 'yes' : 'no'));
                    $this->error('Payment processor not available', 500);
                    return;
                }
            }

            // Process bill payment
            $result = $this->PaymentProcessor->process_bill_payment(
                $data['bill_type'],
                $data['bill_id'],
                $data
            );
            
            if ($result['success']) {
                $payment = $this->Patient_payment_model->get_by_id($result['payment_id']);
                $this->success($payment, 'Payment recorded successfully', 201);
            } else {
                $this->error($result['error'] ?? 'Failed to process payment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments bill_payment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Record advance payment
     * POST /api/patient-payments/advance
     */
    public function advance() {
        try {
            $data = $this->get_request_data();
            
            if (empty($data['patient_id']) || empty($data['amount'])) {
                $this->error('Patient ID and amount are required', 400);
                return;
            }

            // Set processed_by
            if ($this->user && isset($this->user['id'])) {
                $data['processed_by'] = $this->user['id'];
            }

            // Process advance payment
            $result = $this->PaymentProcessor->process_advance_payment(
                $data['patient_id'],
                $data
            );
            
            if ($result['success']) {
                $payment = $this->Patient_payment_model->get_by_id($result['payment_id']);
                $this->success($payment, 'Advance payment recorded successfully', 201);
            } else {
                $this->error($result['error'] ?? 'Failed to process advance payment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments advance error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Apply advance balance to a bill
     * POST /api/patient-payments/apply-advance
     */
    public function apply_advance() {
        try {
            $data = $this->get_request_data();
            
            if (empty($data['bill_type']) || empty($data['bill_id']) || empty($data['amount'])) {
                $this->error('Bill type, bill ID, and amount are required', 400);
                return;
            }

            // Apply advance balance
            $result = $this->PaymentProcessor->apply_advance_balance(
                $data['bill_type'],
                $data['bill_id'],
                $data['amount']
            );
            
            if ($result['success']) {
                $this->success($result, 'Advance balance applied successfully');
            } else {
                $this->error($result['error'] ?? 'Failed to apply advance balance', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments apply_advance error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get patient payment history
     * GET /api/patient-payments/history/{patient_id}
     */
    public function history($patient_id = null) {
        try {
            if (!$patient_id) {
                $patient_id = $this->input->get('patient_id');
            }
            
            if (!$patient_id) {
                $this->error('Patient ID is required', 400);
                return;
            }

            $filters = array(
                'bill_type' => $this->input->get('bill_type'),
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to')
            );

            $payments = $this->Patient_payment_model->get_by_patient($patient_id, $filters);
            
            // Get advance balance
            $advance_balance = $this->Patient_payment_model->get_advance_balance($patient_id);
            
            $this->success(array(
                'payments' => $payments,
                'advance_balance' => $advance_balance
            ));
        } catch (Exception $e) {
            log_message('error', 'PatientPayments history error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get payments for a specific bill
     * GET /api/patient-payments/bill/{bill_type}/{bill_id}
     */
    public function bill($bill_type = null, $bill_id = null) {
        try {
            if (!$bill_type || !$bill_id) {
                $this->error('Bill type and bill ID are required', 400);
                return;
            }

            // For IPD, also check if bill_id might be admission_id and try to find payments with billing ID
            $payments = $this->Patient_payment_model->get_by_bill($bill_type, $bill_id);
            $total_paid = $this->Patient_payment_model->get_total_paid($bill_type, $bill_id);
            
            // If no payments found for IPD, try to find billing record and check with billing ID
            if (empty($payments) && $bill_type === 'ipd') {
                $this->load->model('Ipd_billing_model');
                $billing = $this->Ipd_billing_model->get_by_admission($bill_id);
                
                if ($billing && isset($billing['id']) && $billing['id'] != $bill_id) {
                    // Try with billing ID
                    $billing_payments = $this->Patient_payment_model->get_by_bill($bill_type, $billing['id']);
                    if (!empty($billing_payments)) {
                        $payments = $billing_payments;
                        $total_paid = $this->Patient_payment_model->get_total_paid($bill_type, $billing['id']);
                    }
                }
            }
            
            log_message('debug', 'PatientPayments->bill: bill_type=' . $bill_type . ', bill_id=' . $bill_id . ', payments_found=' . count($payments));
            
            $this->success(array(
                'payments' => $payments ?: array(),
                'total_paid' => $total_paid
            ));
        } catch (Exception $e) {
            log_message('error', 'PatientPayments bill error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get patient advance balance
     * GET /api/patient-payments/advance-balance/{patient_id}
     */
    public function advance_balance($patient_id = null) {
        try {
            if (!$patient_id) {
                $patient_id = $this->input->get('patient_id');
            }
            
            if (!$patient_id) {
                $this->error('Patient ID is required', 400);
                return;
            }

            $balance = $this->Patient_payment_model->get_advance_balance($patient_id);
            
            $this->success(array('advance_balance' => $balance));
        } catch (Exception $e) {
            log_message('error', 'PatientPayments advance_balance error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Refund payment
     * POST /api/patient-payments/refund/{payment_id}
     */
    public function refund($payment_id = null) {
        try {
            if (!$payment_id) {
                $payment_id = $this->input->post('payment_id');
            }
            
            if (!$payment_id) {
                $this->error('Payment ID is required', 400);
                return;
            }

            $data = $this->get_request_data();
            $refund_amount = $data['refund_amount'] ?? null;
            $reason = $data['reason'] ?? '';

            // Process refund
            $result = $this->PaymentProcessor->refund_payment($payment_id, $refund_amount, $reason);
            
            if ($result['success']) {
                $refund = $this->Patient_payment_model->get_by_id($result['refund_id']);
                $this->success($refund, 'Payment refunded successfully', 201);
            } else {
                $this->error($result['error'] ?? 'Failed to process refund', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments refund error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate receipt
     * POST /api/patient-payments/generate-receipt/{payment_id}
     */
    public function generate_receipt($payment_id = null) {
        try {
            if (!$payment_id) {
                $payment_id = $this->input->post('payment_id');
            }
            
            if (!$payment_id) {
                $this->error('Payment ID is required', 400);
                return;
            }

            $payment = $this->Patient_payment_model->get_by_id($payment_id);
            
            if (!$payment) {
                $this->error('Payment not found', 404);
                return;
            }

            // Check if receipt already exists
            $existing_receipt = $this->Payment_receipt_model->get_by_payment_id($payment_id);
            
            if ($existing_receipt) {
                $this->success($existing_receipt, 'Receipt already exists');
                return;
            }

            // Create receipt
            $receipt_data = array(
                'payment_id' => $payment_id,
                'patient_id' => $payment['patient_id'],
                'receipt_date' => date('Y-m-d'),
                'generated_by' => $this->user && isset($this->user['id']) ? $this->user['id'] : null
            );

            $receipt_id = $this->Payment_receipt_model->create($receipt_data);
            
            if ($receipt_id) {
                $receipt = $this->Payment_receipt_model->get_by_id($receipt_id);
                $this->success($receipt, 'Receipt generated successfully', 201);
            } else {
                $this->error('Failed to generate receipt', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments generate_receipt error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get receipt by receipt number
     * GET /api/patient-payments/receipt/{receipt_number}
     */
    public function receipt($receipt_number = null) {
        try {
            if (!$receipt_number) {
                $receipt_number = $this->input->get('receipt_number');
            }
            
            if (!$receipt_number) {
                $this->error('Receipt number is required', 400);
                return;
            }

            $receipt = $this->Payment_receipt_model->get_by_receipt_number($receipt_number);
            
            if ($receipt) {
                $this->success($receipt);
            } else {
                $this->error('Receipt not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'PatientPayments receipt error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get payment statistics
     * GET /api/patient-payments/statistics
     */
    public function statistics() {
        try {
            $filters = array(
                'patient_id' => $this->input->get('patient_id'),
                'bill_type' => $this->input->get('bill_type'),
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to')
            );

            $stats = $this->Patient_payment_model->get_statistics($filters);
            
            $this->success($stats);
        } catch (Exception $e) {
            log_message('error', 'PatientPayments statistics error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

