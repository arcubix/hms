<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * OPD Billing API Controller
 * Handles OPD billing operations
 */
class OpdBilling extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Opd_billing_model');
        $this->load->model('Patient_payment_model');
        $this->load->library('PaymentProcessor');
        
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all bills or create new bill
     * GET /api/opd-billing
     * POST /api/opd-billing
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->get_bills();
            } elseif ($method === 'POST') {
                $this->create_bill();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'OpdBilling index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get bills with filters
     */
    private function get_bills() {
        $filters = array(
            'patient_id' => $this->input->get('patient_id'),
            'payment_status' => $this->input->get('payment_status'),
            'date_from' => $this->input->get('date_from'),
            'date_to' => $this->input->get('date_to'),
            'search' => $this->input->get('search'),
            'limit' => $this->input->get('limit'),
            'offset' => $this->input->get('offset')
        );
        
        $bills = $this->Opd_billing_model->get_all($filters);
        
        // Add payment info for each bill
        foreach ($bills as &$bill) {
            $bill['total_paid'] = $this->Patient_payment_model->get_total_paid('opd', $bill['id']);
            $bill['payments'] = $this->Patient_payment_model->get_by_bill('opd', $bill['id']);
        }
        
        $this->success($bills);
    }

    /**
     * Create new bill
     */
    private function create_bill() {
        $data = $this->get_request_data();
        
        // Validate required fields
        if (empty($data['patient_id'])) {
            $this->error('Patient ID is required', 400);
            return;
        }

        // Set created_by if user is logged in
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }

        // Create bill
        $bill_id = $this->Opd_billing_model->create($data);
        
        if ($bill_id) {
            $bill = $this->Opd_billing_model->get_by_id($bill_id);
            $bill['items'] = $this->Opd_billing_model->get_bill_items($bill_id);
            $this->success($bill, 'Bill created successfully', 201);
        } else {
            $this->error('Failed to create bill', 500);
        }
    }

    /**
     * Get bill by ID or update/delete
     * GET /api/opd-billing/{id}
     * PUT /api/opd-billing/{id}
     * DELETE /api/opd-billing/{id}
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Bill ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $bill = $this->Opd_billing_model->get_by_id($id);
                if ($bill) {
                    $bill['items'] = $this->Opd_billing_model->get_bill_items($id);
                    $bill['total_paid'] = $this->Patient_payment_model->get_total_paid('opd', $id);
                    $bill['payments'] = $this->Patient_payment_model->get_by_bill('opd', $id);
                    $this->success($bill);
                } else {
                    $this->error('Bill not found', 404);
                }
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update_bill($id);
            } elseif ($method === 'DELETE') {
                $this->delete_bill($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'OpdBilling get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update bill
     */
    private function update_bill($id) {
        $data = $this->get_request_data();
        
        $result = $this->Opd_billing_model->update($id, $data);
        
        if ($result) {
            $bill = $this->Opd_billing_model->get_by_id($id);
            $bill['items'] = $this->Opd_billing_model->get_bill_items($id);
            $this->success($bill, 'Bill updated successfully');
        } else {
            $this->error('Failed to update bill', 500);
        }
    }

    /**
     * Delete bill
     */
    private function delete_bill($id) {
        $result = $this->Opd_billing_model->delete($id);
        
        if ($result) {
            $this->success(null, 'Bill deleted successfully');
        } else {
            $this->error('Failed to delete bill', 500);
        }
    }

    /**
     * Get bill by bill number
     * GET /api/opd-billing/bill-number/{bill_number}
     */
    public function bill_number($bill_number = null) {
        try {
            if (!$bill_number) {
                $bill_number = $this->input->get('bill_number');
            }
            
            if (!$bill_number) {
                $this->error('Bill number is required', 400);
                return;
            }

            $bill = $this->Opd_billing_model->get_by_bill_number($bill_number);
            
            if ($bill) {
                $bill['items'] = $this->Opd_billing_model->get_bill_items($bill['id']);
                $bill['total_paid'] = $this->Patient_payment_model->get_total_paid('opd', $bill['id']);
                $bill['payments'] = $this->Patient_payment_model->get_by_bill('opd', $bill['id']);
                $this->success($bill);
            } else {
                $this->error('Bill not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'OpdBilling bill_number error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get bills for a patient
     * GET /api/opd-billing/patient/{patient_id}
     */
    public function patient($patient_id = null) {
        try {
            if (!$patient_id) {
                $patient_id = $this->input->get('patient_id');
            }
            
            if (!$patient_id) {
                $this->error('Patient ID is required', 400);
                return;
            }

            $filters = array(
                'payment_status' => $this->input->get('payment_status'),
                'date_from' => $this->input->get('date_from'),
                'date_to' => $this->input->get('date_to')
            );

            $bills = $this->Opd_billing_model->get_by_patient($patient_id, $filters);
            
            // Add payment info
            foreach ($bills as &$bill) {
                $bill['total_paid'] = $this->Patient_payment_model->get_total_paid('opd', $bill['id']);
            }
            
            $this->success($bills);
        } catch (Exception $e) {
            log_message('error', 'OpdBilling patient error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get bill by appointment
     * GET /api/opd-billing/appointment/{appointment_id}
     */
    public function appointment($appointment_id = null) {
        try {
            if (!$appointment_id) {
                $appointment_id = $this->input->get('appointment_id');
            }
            
            if (!$appointment_id) {
                $this->error('Appointment ID is required', 400);
                return;
            }

            $bill = $this->Opd_billing_model->get_by_appointment($appointment_id);
            
            if ($bill) {
                $bill['items'] = $this->Opd_billing_model->get_bill_items($bill['id']);
                $bill['total_paid'] = $this->Patient_payment_model->get_total_paid('opd', $bill['id']);
                $bill['payments'] = $this->Patient_payment_model->get_by_bill('opd', $bill['id']);
                $this->success($bill);
            } else {
                // Return null instead of 404 error - frontend handles this case
                $this->success(null, 'No bill found for this appointment');
            }
        } catch (Exception $e) {
            log_message('error', 'OpdBilling appointment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Collect payment for a bill
     * POST /api/opd-billing/payment/{bill_id}
     */
    public function payment($bill_id = null) {
        try {
            if (!$bill_id) {
                $bill_id = $this->input->post('bill_id');
            }
            
            if (!$bill_id) {
                $this->error('Bill ID is required', 400);
                return;
            }

            $data = $this->get_request_data();
            
            if (empty($data['amount'])) {
                $this->error('Payment amount is required', 400);
                return;
            }

            // Set processed_by
            if ($this->user && isset($this->user['id'])) {
                $data['processed_by'] = $this->user['id'];
            }

            // Process payment
            $result = $this->PaymentProcessor->process_bill_payment('opd', $bill_id, $data);
            
            if ($result['success']) {
                $payment = $this->Patient_payment_model->get_by_id($result['payment_id']);
                $bill = $this->Opd_billing_model->get_by_id($bill_id);
                $this->success(array(
                    'payment' => $payment,
                    'bill' => $bill
                ), 'Payment collected successfully', 201);
            } else {
                $this->error($result['error'] ?? 'Failed to collect payment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'OpdBilling payment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update payment status
     * POST /api/opd-billing/update-status/{bill_id}
     */
    public function update_status($bill_id = null) {
        try {
            if (!$bill_id) {
                $bill_id = $this->input->post('bill_id');
            }
            
            if (!$bill_id) {
                $this->error('Bill ID is required', 400);
                return;
            }

            $result = $this->Opd_billing_model->update_payment_status($bill_id);
            
            if ($result) {
                $bill = $this->Opd_billing_model->get_by_id($bill_id);
                $this->success($bill, 'Payment status updated successfully');
            } else {
                $this->error('Failed to update payment status', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'OpdBilling update_status error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

