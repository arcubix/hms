<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * BillingSettings API Controller
 */
class BillingSettings extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Billing_settings_model');
        
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Get or update billing settings for organization
     * GET /api/billing-settings/:organization_id
     * PUT /api/billing-settings/:organization_id
     */
    public function get($organization_id = null) {
        try {
            if (!$organization_id) {
                // Get current user's organization
                $organization_id = $this->get_organization_id();
                if (!$organization_id) {
                    $this->error('Organization ID is required', 400);
                    return;
                }
            }
            
            // Check access
            if (!$this->require_organization_access($organization_id)) {
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $settings = $this->Billing_settings_model->get_by_organization($organization_id);
                if (!$settings) {
                    // Create default settings
                    $this->load->model('Organization_model');
                    $org = $this->Organization_model->get_by_id($organization_id);
                    if ($org) {
                        $default_settings = array(
                            'organization_id' => $organization_id,
                            'currency' => $org['currency'] ?? 'PKR'
                        );
                        $this->Billing_settings_model->create_or_update($organization_id, $default_settings);
                        $settings = $this->Billing_settings_model->get_by_organization($organization_id);
                    }
                }
                $this->success($settings);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->update($organization_id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'BillingSettings get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    private function update($organization_id) {
        $data = $this->get_request_data();
        $result = $this->Billing_settings_model->update($organization_id, $data);
        
        if ($result) {
            $settings = $this->Billing_settings_model->get_by_organization($organization_id);
            $this->success($settings, 'Billing settings updated successfully');
        } else {
            $this->error('Failed to update billing settings', 500);
        }
    }
}

