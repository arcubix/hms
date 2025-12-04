<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * DonationDonors API Controller
 * Handles donation donor management operations
 */
class DonationDonors extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('DonationDonor_model');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get all donation donors or create new
     * GET /api/donation-donors
     * POST /api/donation-donors
     */
    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get query parameters for filtering
                $filters = array(
                    'search' => $this->input->get('search'),
                    'type' => $this->input->get('type')
                );
                
                $donors = $this->DonationDonor_model->get_all($filters);
                $this->success($donors);
            } elseif ($method === 'POST') {
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single donation donor, update, or delete
     * GET /api/donation-donors/:id
     * PUT /api/donation-donors/:id
     * DELETE /api/donation-donors/:id
     */
    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Donation donor ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $donor = $this->DonationDonor_model->get_by_id($id);
                
                if (!$donor) {
                    $this->error('Donation donor not found', 404);
                    return;
                }

                $this->success($donor);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $this->update($id);
            } elseif ($method === 'DELETE') {
                $this->delete($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get payment history for a donor
     * GET /api/donation-donors/:id/payments
     * POST /api/donation-donors/:id/payments
     */
    public function payments($id = null) {
        try {
            if (!$id) {
                $this->error('Donation donor ID is required', 400);
                return;
            }

            $donor = $this->DonationDonor_model->get_by_id($id);
            
            if (!$donor) {
                $this->error('Donation donor not found', 404);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $payments = $this->DonationDonor_model->get_payments($id);
                $this->success($payments);
            } elseif ($method === 'POST') {
                $this->add_payment($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors payments error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new donation donor
     */
    private function create() {
        try {
            $data = $this->get_request_data();

            // Validation
            if (empty($data['name'])) {
                $this->error('Name is required', 400);
                return;
            }

            // Validate type
            if (isset($data['type']) && !in_array($data['type'], array('individual', 'corporate'))) {
                $this->error('Invalid type. Must be "individual" or "corporate"', 422);
                return;
            }

            // Validate frequency
            if (isset($data['frequency']) && !in_array($data['frequency'], array('one-time', 'monthly', 'yearly'))) {
                $this->error('Invalid frequency value', 422);
                return;
            }

            // Set created_by from authenticated user
            $data['created_by'] = $this->user['id'];

            $id = $this->DonationDonor_model->create($data);
            
            if ($id) {
                $donor = $this->DonationDonor_model->get_by_id($id);
                
                // Log donation donor creation
                $this->load->library('audit_log');
                $donor_name = $data['name'] ?? 'Unknown';
                $this->audit_log->logCreate('Donations', 'Donor', $id, "Created donation donor: {$donor_name}");
                
                $this->success($donor, 'Donation donor created successfully', 201);
            } else {
                $this->error('Failed to create donation donor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update donation donor
     */
    private function update($id) {
        try {
            $donor = $this->DonationDonor_model->get_by_id($id);
            
            if (!$donor) {
                $this->error('Donation donor not found', 404);
                return;
            }

            $data = $this->get_request_data();

            // Validate type if provided
            if (isset($data['type']) && !in_array($data['type'], array('individual', 'corporate'))) {
                $this->error('Invalid type. Must be "individual" or "corporate"', 422);
                return;
            }

            // Validate frequency if provided
            if (isset($data['frequency']) && !in_array($data['frequency'], array('one-time', 'monthly', 'yearly'))) {
                $this->error('Invalid frequency value', 422);
                return;
            }

            // Don't allow updating created_by or donor_id
            unset($data['created_by']);
            unset($data['donor_id']);

            $result = $this->DonationDonor_model->update($id, $data);
            
            $old_donor = $donor;
            if ($result) {
                $updated_donor = $this->DonationDonor_model->get_by_id($id);
                
                // Log donation donor update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Donations', 'Donor', $id, "Updated donation donor ID: {$id}", $old_donor, $updated_donor);
                
                $this->success($updated_donor, 'Donation donor updated successfully');
            } else {
                $this->error('Failed to update donation donor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Add payment for a donor
     */
    private function add_payment($donor_id) {
        try {
            $data = $this->get_request_data();

            // Validation
            if (empty($data['amount']) || floatval($data['amount']) <= 0) {
                $this->error('Valid amount is required', 400);
                return;
            }

            if (empty($data['payment_date'])) {
                $this->error('Payment date is required', 400);
                return;
            }

            // Validate payment method
            if (isset($data['payment_method']) && !in_array($data['payment_method'], array('cash', 'card', 'bank-transfer', 'cheque', 'online'))) {
                $this->error('Invalid payment method', 422);
                return;
            }

            // Validate status
            if (isset($data['status']) && !in_array($data['status'], array('completed', 'pending', 'failed'))) {
                $this->error('Invalid status value', 422);
                return;
            }

            // Set processed_by from authenticated user
            $data['processed_by'] = $this->user['id'];

            $payment_id = $this->DonationDonor_model->add_payment($donor_id, $data);
            
            if ($payment_id) {
                $payments = $this->DonationDonor_model->get_payments($donor_id);
                
                // Log donation payment addition
                $this->load->library('audit_log');
                $amount = $data['amount'] ?? 0;
                $this->audit_log->logCreate('Donations', 'Donation Payment', $payment_id, "Added payment: {$amount} for Donor ID: {$donor_id}");
                
                $this->success($payments, 'Payment added successfully', 201);
            } else {
                $this->error('Failed to add payment', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors add_payment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete donation donor
     */
    private function delete($id) {
        try {
            $donor = $this->DonationDonor_model->get_by_id($id);
            
            if (!$donor) {
                $this->error('Donation donor not found', 404);
                return;
            }

            $result = $this->DonationDonor_model->delete($id);
            
            if ($result) {
                // Log donation donor deletion
                $this->load->library('audit_log');
                $this->audit_log->logDelete('Donations', 'Donor', $id, "Deleted donation donor ID: {$id}");
                
                $this->success(null, 'Donation donor deleted successfully');
            } else {
                $this->error('Failed to delete donation donor', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'DonationDonors delete error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

