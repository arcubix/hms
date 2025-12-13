<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * Payments API Controller
 */
class Payments extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Payment_model');
        $this->load->model('Invoice_model');
        
        if (!$this->verify_token()) {
            return;
        }
    }

    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $filters = array(
                    'organization_id' => $this->isAdmin() ? $this->input->get('organization_id') : $this->get_organization_id(),
                    'invoice_id' => $this->input->get('invoice_id'),
                    'payment_status' => $this->input->get('payment_status'),
                    'payment_method' => $this->input->get('payment_method'),
                    'date_from' => $this->input->get('date_from'),
                    'date_to' => $this->input->get('date_to'),
                    'search' => $this->input->get('search'),
                    'limit' => $this->input->get('limit'),
                    'offset' => $this->input->get('offset')
                );
                
                $payments = $this->Payment_model->get_all($filters);
                $this->success($payments);
            } elseif ($method === 'POST') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Payments index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Payment ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $payment = $this->Payment_model->get_by_id($id);
                if (!$payment) {
                    $this->error('Payment not found', 404);
                    return;
                }
                
                // Check access
                if (!$this->isAdmin() && $payment['organization_id'] != $this->get_organization_id()) {
                    $this->error('Access denied', 403);
                    return;
                }
                
                $this->success($payment);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($id);
            } elseif ($method === 'DELETE') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Payments get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    private function create() {
        $data = $this->get_request_data();
        
        if (empty($data['invoice_id']) || empty($data['amount'])) {
            $this->error('Invoice ID and amount are required', 400);
            return;
        }
        
        // Get invoice to get organization_id
        $invoice = $this->Invoice_model->get_by_id($data['invoice_id']);
        if (!$invoice) {
            $this->error('Invoice not found', 404);
            return;
        }
        
        $data['organization_id'] = $invoice['organization_id'];
        
        if ($this->user && isset($this->user['id'])) {
            $data['processed_by'] = $this->user['id'];
        }
        
        $id = $this->Payment_model->create($data);
        if ($id) {
            $payment = $this->Payment_model->get_by_id($id);
            $this->success($payment, 'Payment recorded successfully', 201);
        } else {
            $this->error('Failed to record payment', 500);
        }
    }

    private function update($id) {
        $data = $this->get_request_data();
        $result = $this->Payment_model->update($id, $data);
        
        if ($result) {
            $payment = $this->Payment_model->get_by_id($id);
            $this->success($payment, 'Payment updated successfully');
        } else {
            $this->error('Failed to update payment', 500);
        }
    }

    private function delete($id) {
        $result = $this->Payment_model->delete($id);
        
        if ($result) {
            $this->success(null, 'Payment deleted successfully');
        } else {
            $this->error('Failed to delete payment', 500);
        }
    }

    /**
     * Get payments for invoice
     * GET /api/payments/invoice/:invoice_id
     */
    public function invoice($invoice_id) {
        try {
            $payments = $this->Payment_model->get_by_invoice($invoice_id);
            $this->success($payments);
        } catch (Exception $e) {
            log_message('error', 'Payments invoice error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

