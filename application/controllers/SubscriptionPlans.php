<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH . 'controllers/Api.php');

/**
 * SubscriptionPlans API Controller
 */
class SubscriptionPlans extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Subscription_plan_model');
        
        if (!$this->verify_token()) {
            return;
        }
    }

    public function index() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if (!$this->requirePermission('admin.view_users')) {
                    return;
                }
                
                $filters = array(
                    'plan_type' => $this->input->get('plan_type'),
                    'billing_cycle' => $this->input->get('billing_cycle'),
                    'is_active' => $this->input->get('is_active')
                );
                
                $plans = $this->Subscription_plan_model->get_all($filters);
                $this->success($plans);
            } elseif ($method === 'POST') {
                if (!$this->requirePermission('admin.edit_users')) {
                    return;
                }
                $this->create();
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'SubscriptionPlans index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    public function get($id = null) {
        try {
            if (!$id) {
                $this->error('Plan ID is required', 400);
                return;
            }

            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $plan = $this->Subscription_plan_model->get_by_id($id);
                if (!$plan) {
                    $this->error('Plan not found', 404);
                    return;
                }
                $this->success($plan);
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
            log_message('error', 'SubscriptionPlans get error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    private function create() {
        $data = $this->get_request_data();
        
        if (empty($data['plan_code']) || empty($data['name'])) {
            $this->error('Plan code and name are required', 400);
            return;
        }
        
        $existing = $this->Subscription_plan_model->get_by_code($data['plan_code']);
        if ($existing) {
            $this->error('Plan code already exists', 409);
            return;
        }
        
        $id = $this->Subscription_plan_model->create($data);
        if ($id) {
            $plan = $this->Subscription_plan_model->get_by_id($id);
            $this->success($plan, 'Subscription plan created successfully', 201);
        } else {
            $this->error('Failed to create subscription plan', 500);
        }
    }

    private function update($id) {
        $data = $this->get_request_data();
        $result = $this->Subscription_plan_model->update($id, $data);
        
        if ($result) {
            $plan = $this->Subscription_plan_model->get_by_id($id);
            $this->success($plan, 'Subscription plan updated successfully');
        } else {
            $this->error('Failed to update subscription plan', 500);
        }
    }

    private function delete($id) {
        $result = $this->Subscription_plan_model->delete($id);
        
        if ($result) {
            $this->success(null, 'Subscription plan deleted successfully');
        } else {
            $this->error('Failed to delete subscription plan. Plan may be in use.', 400);
        }
    }
}

