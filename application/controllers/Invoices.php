<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * Invoices API Controller
 */
class Invoices extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Invoice_model');
        $this->load->model('Organization_model');
        $this->load->model('InsuranceOrganization_model');
        
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
                    'payment_status' => $this->input->get('payment_status'),
                    'invoice_type' => $this->input->get('invoice_type'),
                    'date_from' => $this->input->get('date_from'),
                    'date_to' => $this->input->get('date_to'),
                    'search' => $this->input->get('search'),
                    'limit' => $this->input->get('limit'),
                    'offset' => $this->input->get('offset')
                );
                
                $invoices = $this->Invoice_model->get_all($filters);
                
                // Add items to each invoice
                foreach ($invoices as &$invoice) {
                    $invoice['items'] = $this->Invoice_model->get_items($invoice['id']);
                }
                
                $this->success($invoices);
            } elseif ($method === 'POST') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Invoices index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Invoice ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $invoice = $this->Invoice_model->get_by_id($id);
                if (!$invoice) {
                    $this->error('Invoice not found', 404);
                    return;
                }
                
                // Check access
                if (!$this->isAdmin() && $invoice['organization_id'] != $this->get_organization_id()) {
                    $this->error('Access denied', 403);
                    return;
                }
                
                $invoice['items'] = $this->Invoice_model->get_items($id);
                $this->success($invoice);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'Invoices get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    private function create() {
        $data = $this->get_request_data();
        
        if (empty($data['organization_id'])) {
            $this->error('Organization ID is required', 400);
            return;
        }
        
        // Check if organization_id exists in insurance_organizations table
        // If it does, we need to handle the foreign key constraint issue
        $this->load->model('InsuranceOrganization_model');
        $insurance_org = $this->InsuranceOrganization_model->get_by_id($data['organization_id']);
        
        if ($insurance_org && $insurance_org['type'] === 'organization') {
            // Organization is from insurance_organizations table
            // Check if it exists in organizations table, if not, we need to sync it
            $org_exists = $this->Organization_model->get_by_id($data['organization_id']);
            
            if (!$org_exists) {
                // Create a corresponding entry in organizations table for foreign key constraint
                $org_data = array(
                    'id' => $data['organization_id'], // Use same ID
                    'organization_code' => $insurance_org['account_prefix'] ?? 'ORG' . $data['organization_id'],
                    'name' => $insurance_org['name'],
                    'email' => $insurance_org['email'],
                    'phone' => $insurance_org['phone'],
                    'address' => $insurance_org['address'] ?? null,
                    'organization_type' => 'Other',
                    'country' => 'Pakistan',
                    'currency' => 'PKR',
                    'subscription_status' => 'active',
                    'status' => $insurance_org['status'] === 'active' ? 'active' : 'inactive',
                    'max_users' => 0
                );
                
                // Temporarily disable foreign key checks to insert with specific ID
                $this->db->query('SET FOREIGN_KEY_CHECKS=0');
                $this->db->insert('organizations', $org_data);
                $this->db->query('SET FOREIGN_KEY_CHECKS=1');
            }
        } else {
            // Verify organization exists in organizations table
            $org_exists = $this->Organization_model->get_by_id($data['organization_id']);
            if (!$org_exists) {
                $this->error('Organization not found', 404);
                return;
            }
        }
        
        // Calculate totals from items if not provided
        if (!empty($data['items']) && is_array($data['items'])) {
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $item_total = ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
                $subtotal += $item_total;
            }
            
            // Only calculate if totals not already provided
            if (!isset($data['subtotal']) || $data['subtotal'] == 0) {
                $data['subtotal'] = $subtotal;
            }
            
            // Get tax rate from billing settings if not provided
            if (!isset($data['tax_rate']) || $data['tax_rate'] == 0) {
                $this->load->model('Billing_settings_model');
                $settings = $this->Billing_settings_model->get_by_organization($data['organization_id']);
                if ($settings) {
                    $data['tax_rate'] = $settings['tax_rate'] ?? 0;
                } else {
                    $data['tax_rate'] = 0;
                }
            }
            
            // Calculate tax and total if not provided
            if (!isset($data['tax_amount']) || $data['tax_amount'] == 0) {
                $discount = $data['discount'] ?? 0;
                $taxable_amount = $data['subtotal'] - $discount;
                $data['tax_amount'] = ($taxable_amount * ($data['tax_rate'] ?? 0)) / 100;
            }
            
            if (!isset($data['total_amount']) || $data['total_amount'] == 0) {
                $discount = $data['discount'] ?? 0;
                $data['total_amount'] = $data['subtotal'] - $discount + ($data['tax_amount'] ?? 0);
            }
        }
        
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        $id = $this->Invoice_model->create($data);
        if ($id) {
            $invoice = $this->Invoice_model->get_by_id($id);
            $invoice['items'] = $this->Invoice_model->get_items($id);
            $this->success($invoice, 'Invoice created successfully', 201);
        } else {
            $this->error('Failed to create invoice', 500);
        }
    }

    private function update($id) {
        $data = $this->get_request_data();
        $result = $this->Invoice_model->update($id, $data);
        
        if ($result) {
            $invoice = $this->Invoice_model->get_by_id($id);
            $invoice['items'] = $this->Invoice_model->get_items($id);
            $this->success($invoice, 'Invoice updated successfully');
        } else {
            $this->error('Failed to update invoice', 500);
        }
    }

    /**
     * Mark invoice as sent
     * POST /api/invoices/:id/send
     */
    public function send($id) {
        try {
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            
            $result = $this->Invoice_model->mark_as_sent($id);
            if ($result) {
                $invoice = $this->Invoice_model->get_by_id($id);
                $this->success($invoice, 'Invoice marked as sent');
            } else {
                $this->error('Failed to mark invoice as sent', 500);
            }
        } catch (Exception $e) {
            log_message('error', 'Invoices send error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get overdue invoices
     * GET /api/invoices/overdue
     */
    public function overdue() {
        try {
            $organization_id = $this->isAdmin() ? $this->input->get('organization_id') : $this->get_organization_id();
            $invoices = $this->Invoice_model->get_overdue($organization_id);
            $this->success($invoices);
        } catch (Exception $e) {
            log_message('error', 'Invoices overdue error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

