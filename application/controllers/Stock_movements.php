<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Stock_movements extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Stock_movement_model');
        
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/stock-movements - Get all stock movements
     */
    public function index() {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        $filters = array();
        
        if ($this->input->get('medicine_id')) {
            $filters['medicine_id'] = $this->input->get('medicine_id');
        }
        
        if ($this->input->get('movement_type')) {
            $filters['movement_type'] = $this->input->get('movement_type');
        }
        
        if ($this->input->get('reference_type')) {
            $filters['reference_type'] = $this->input->get('reference_type');
        }
        
        if ($this->input->get('reference_id')) {
            $filters['reference_id'] = $this->input->get('reference_id');
        }
        
        if ($this->input->get('start_date')) {
            $filters['start_date'] = $this->input->get('start_date');
        }
        
        if ($this->input->get('end_date')) {
            $filters['end_date'] = $this->input->get('end_date');
        }
        
        if ($this->input->get('limit')) {
            $filters['limit'] = (int)$this->input->get('limit');
        }
        
        if ($this->input->get('offset')) {
            $filters['offset'] = (int)$this->input->get('offset');
        }
        
        $movements = $this->Stock_movement_model->get_all($filters);
        $this->success($movements);
    }

    /**
     * GET /api/pharmacy/stock-movements/summary - Get movement summary
     */
    public function summary() {
        if ($this->input->server('REQUEST_METHOD') !== 'GET') {
            $this->error('Method not allowed', 405);
            return;
        }
        
        $medicine_id = $this->input->get('medicine_id');
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $summary = $this->Stock_movement_model->get_summary_by_type($medicine_id, $start_date, $end_date);
        $this->success($summary);
    }

    /**
     * GET /api/pharmacy/stock-movements/medicine/:id - Get audit trail for medicine
     */
    public function medicine($medicine_id = null) {
        if (!$medicine_id) {
            $this->error('Medicine ID required', 400);
            return;
        }
        
        $limit = $this->input->get('limit') ? (int)$this->input->get('limit') : 100;
        $audit_trail = $this->Stock_movement_model->get_audit_trail($medicine_id, $limit);
        $this->success($audit_trail);
    }
}

