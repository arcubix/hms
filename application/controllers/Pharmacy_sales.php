<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Pharmacy_sales extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Sale_model');
        $this->load->model('Medicine_model');
        $this->load->model('Patient_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/sales - Get all sales
     * POST /api/pharmacy/sales - Create sale
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $filters = array();
            
            if ($this->input->get('customer_id')) {
                $filters['customer_id'] = $this->input->get('customer_id');
            }
            
            if ($this->input->get('patient_id')) {
                $filters['patient_id'] = $this->input->get('patient_id');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('payment_method')) {
                $filters['payment_method'] = $this->input->get('payment_method');
            }
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
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
            
            $sales = $this->Sale_model->get_all($filters);
            $this->success($sales);
            
        } elseif ($method === 'POST') {
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create sale
     * POST /api/pharmacy/sales
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
                $this->error('At least one item is required', 400);
                return;
            }
            
            // Validate items
            foreach ($data['items'] as $item) {
                if (empty($item['medicine_id']) || empty($item['quantity']) || empty($item['unit_price'])) {
                    $this->error('Each item must have medicine_id, quantity, and unit_price', 400);
                    return;
                }
            }
            
            // Validate customer information
            if (empty($data['customer_name'])) {
                $data['customer_name'] = 'Walk-in Customer';
            }
            
            // Set cashier
            if ($this->user) {
                $data['cashier_id'] = $this->user['id'];
            }
            
            // Create or find customer
            if (!empty($data['customer_phone']) || !empty($data['customer_email'])) {
                // Try to find existing customer
                $customer = null;
                if (!empty($data['customer_phone'])) {
                    $this->db->where('phone', $data['customer_phone']);
                    $customer = $this->db->get('pharmacy_customers')->row_array();
                }
                
                if (!$customer && !empty($data['customer_email'])) {
                    $this->db->where('email', $data['customer_email']);
                    $customer = $this->db->get('pharmacy_customers')->row_array();
                }
                
                if ($customer) {
                    $data['customer_id'] = $customer['id'];
                } else {
                    // Create new customer
                    $customer_data = array(
                        'name' => $data['customer_name'],
                        'phone' => $data['customer_phone'] ?? null,
                        'email' => $data['customer_email'] ?? null,
                        'address' => $data['customer_address'] ?? null,
                        'city' => $data['customer_city'] ?? null,
                        'customer_type' => !empty($data['patient_id']) ? 'Patient' : 'Walk-in'
                    );
                    
                    if (!empty($data['patient_id'])) {
                        $customer_data['patient_id'] = $data['patient_id'];
                    }
                    
                    $this->db->insert('pharmacy_customers', $customer_data);
                    $data['customer_id'] = $this->db->insert_id();
                }
            }
            
            // Process sale
            $result = $this->Sale_model->create($data);
            
            if ($result['success']) {
                $sale = $this->Sale_model->get_by_id($result['sale_id']);
                
                // Ensure sale_id and invoice_number are present in response
                if ($sale) {
                    $sale['sale_id'] = $result['sale_id']; // Add sale_id explicitly
                    if (empty($sale['id'])) {
                        $sale['id'] = $result['sale_id'];
                    }
                    if (empty($sale['invoice_number']) && !empty($result['invoice_number'])) {
                        $sale['invoice_number'] = $result['invoice_number'];
                    }
                }
                
                $this->success($sale, 'Sale completed successfully', 201);
            } else {
                $this->error($result['message'] ?? 'Failed to create sale', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Sale create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/sales/:id - Get sale by ID
     * GET /api/pharmacy/sales/invoice/:invoice_number - Get sale by invoice number
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Sale ID required', 400);
            return;
        }
        
        // Check if it's an invoice number (starts with INV-)
        if (strpos($id, 'INV-') === 0) {
            $sale = $this->Sale_model->get_by_invoice_number($id);
        } else {
            $sale = $this->Sale_model->get_by_id($id);
        }
        
        if ($sale) {
            $this->success($sale);
        } else {
            $this->error('Sale not found', 404);
        }
    }

    /**
     * GET /api/pharmacy/sales/:id/invoice - Get invoice details for printing
     */
    public function invoice($id = null) {
        if (!$id) {
            $this->error('Sale ID required', 400);
            return;
        }
        
        $sale = $this->Sale_model->get_by_id($id);
        
        if (!$sale) {
            $this->error('Sale not found', 404);
            return;
        }
        
        // Format invoice data for printing
        $invoice = array(
            'invoice_number' => $sale['invoice_number'],
            'sale_date' => $sale['sale_date'],
            'customer' => array(
                'name' => $sale['customer_name'],
                'phone' => $sale['customer_phone'] ?? 'N/A',
                'email' => $sale['customer_email'] ?? 'N/A',
                'address' => $sale['customer_address'] ?? 'N/A'
            ),
            'items' => $sale['items'],
            'subtotal' => $sale['subtotal'],
            'discount_amount' => $sale['discount_amount'],
            'tax_amount' => $sale['tax_amount'],
            'total_amount' => $sale['total_amount'],
            'payment_method' => $sale['payment_method'],
            'amount_received' => $sale['amount_received'],
            'change_amount' => $sale['change_amount'],
            'cashier' => $sale['cashier_name'] ?? 'N/A'
        );
        
        $this->success($invoice);
    }

    /**
     * GET /api/pharmacy/sales/summary - Get sales summary
     */
    public function summary() {
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $summary = $this->Sale_model->get_sales_summary($start_date, $end_date);
        $this->success($summary);
    }

    /**
     * GET /api/pharmacy/sales/top-selling - Get top selling medicines
     */
    public function top_selling() {
        $limit = (int)($this->input->get('limit') ?? 10);
        $start_date = $this->input->get('start_date');
        $end_date = $this->input->get('end_date');
        
        $medicines = $this->Sale_model->get_top_selling_medicines($limit, $start_date, $end_date);
        $this->success($medicines);
    }
}

