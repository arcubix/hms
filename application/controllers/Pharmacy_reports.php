<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Pharmacy_reports extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Sale_model');
        $this->load->model('Shift_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/reports/sales-summary - Get sales summary report
     */
    public function sales_summary() {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $summary = $this->Sale_model->get_sales_summary($start_date, $end_date);
        $this->success($summary);
    }

    /**
     * GET /api/pharmacy/reports/daily-sales - Get daily sales report
     */
    public function daily_sales() {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $report = $this->Sale_model->get_daily_sales_report($start_date, $end_date);
        $this->success($report);
    }

    /**
     * GET /api/pharmacy/reports/payment-method - Get payment method breakdown
     */
    public function payment_method() {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $report = $this->Sale_model->get_payment_method_breakdown($start_date, $end_date);
        $this->success($report);
    }

    /**
     * GET /api/pharmacy/reports/top-selling - Get top selling products
     */
    public function top_selling() {
        $limit = (int)($this->input->get('limit') ?? 10);
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $medicines = $this->Sale_model->get_top_selling_medicines($limit, $start_date, $end_date);
        $this->success($medicines);
    }

    /**
     * GET /api/pharmacy/reports/cashier-performance - Get cashier performance report
     */
    public function cashier_performance() {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        $cashier_id = $this->input->get('cashier_id') ? (int)$this->input->get('cashier_id') : null;
        
        $report = $this->Sale_model->get_cashier_performance($start_date, $end_date, $cashier_id);
        $this->success($report);
    }

    /**
     * GET /api/pharmacy/reports/shift-summary - Get shift summary report
     */
    public function shift_summary() {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        $shift_id = $this->input->get('shift_id') ? (int)$this->input->get('shift_id') : null;
        
        $report = $this->Shift_model->get_shift_sales_summary($start_date, $end_date, $shift_id);
        $this->success($report);
    }
}

