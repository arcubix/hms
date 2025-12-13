<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * Laboratory Billing API Controller
 */
class Lab_billing extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Lab_billing_model');
        $this->load->model('Lab_order_model');
        $this->load->library('PaymentProcessor');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get billing by ID
     * GET /api/laboratory/billing/:id
     */
    public function get($id) {
        try {
            if (!$this->requireAnyPermission(['billing_staff.view_billing', 'lab_manager.view_lab_billing'])) {
                return;
            }
            
            $billing = $this->Lab_billing_model->get_by_id($id);
            
            if ($billing) {
                $this->success($billing);
            } else {
                $this->error('Billing not found', 404);
            }
        } catch (Exception $e) {
            log_message('error', 'Lab billing get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create billing for order
     * POST /api/laboratory/orders/:id/billing
     */
    public function create_billing($order_id) {
        try {
            if (!$this->requireAnyPermission(['billing_staff.create_billing', 'lab_manager.create_lab_billing'])) {
                return;
            }
            
            // Check if billing already exists
            $existing = $this->Lab_billing_model->get_by_order($order_id);
            if ($existing) {
                $this->success($existing, 'Billing already exists');
                return;
            }
            
            // Get order
            $order = $this->Lab_order_model->get_by_id($order_id);
            if (!$order) {
                $this->error('Order not found', 404);
                return;
            }
            
            $data = $this->get_request_data();
            $data['order_id'] = $order_id;
            $data['patient_id'] = $order['patient_id'];
            
            // Set organization_id
            if ($this->user && isset($this->user['organization_id'])) {
                $data['organization_id'] = $this->user['organization_id'];
            }
            
            // Link to OPD/IPD billing if applicable
            if ($order['order_type'] === 'OPD' && !empty($data['opd_bill_id'])) {
                $data['opd_bill_id'] = $data['opd_bill_id'];
            } elseif ($order['order_type'] === 'IPD' && !empty($data['ipd_billing_id'])) {
                $data['ipd_billing_id'] = $data['ipd_billing_id'];
            }
            
            $billing_id = $this->Lab_billing_model->create($data);
            
            if ($billing_id) {
                $billing = $this->Lab_billing_model->get_by_id($billing_id);
                
                // Log creation
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Laboratory', 'Lab Billing', $billing_id, "Created billing for order: {$order['order_number']}");
                
                $this->success($billing, 'Billing created successfully', 201);
            } else {
                $this->error('Failed to create billing', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Lab billing create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Record payment
     * POST /api/laboratory/billing/:id/payment
     */
    public function payment($id) {
        try {
            if (!$this->requireAnyPermission(['billing_staff.collect_payment', 'lab_manager.collect_payment'])) {
                return;
            }
            
            $data = $this->get_request_data();
            
            if (empty($data['amount']) || $data['amount'] <= 0) {
                $this->error('Payment amount is required and must be greater than 0', 400);
                return;
            }
            
            $billing = $this->Lab_billing_model->get_by_id($id);
            if (!$billing) {
                $this->error('Billing not found', 404);
                return;
            }
            
            // Record payment
            if ($this->Lab_billing_model->record_payment($id, $data['amount'])) {
                $billing = $this->Lab_billing_model->get_by_id($id);
                
                // Process payment using PaymentProcessor
                $payment_data = array(
                    'billing_id' => $id,
                    'patient_id' => $billing['patient_id'],
                    'amount' => $data['amount'],
                    'payment_method' => isset($data['payment_method']) ? $data['payment_method'] : 'cash',
                    'payment_date' => date('Y-m-d H:i:s'),
                    'created_by' => $this->user && isset($this->user['id']) ? $this->user['id'] : null
                );
                
                // Log payment
                $this->load->library('audit_log');
                $this->audit_log->logCreate('Laboratory', 'Lab Payment', $id, "Payment of {$data['amount']} recorded");
                
                $this->success($billing, 'Payment recorded successfully');
            } else {
                $this->error('Failed to record payment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Lab billing payment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

