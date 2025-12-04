<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Pharmacy_sales extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Sale_model');
        $this->load->model('Medicine_model');
        $this->load->model('Patient_model');
        $this->load->model('Voided_sale_model');
        
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
            
            if ($this->input->get('shift_id')) {
                $filters['shift_id'] = (int)$this->input->get('shift_id');
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
                
                // Log sale creation
                $this->load->library('audit_log');
                $invoice_num = $sale['invoice_number'] ?? $result['invoice_number'] ?? 'N/A';
                $this->audit_log->logCreate('Pharmacy', 'Sale', $result['sale_id'], "Created sale: Invoice {$invoice_num}");
                
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
     * GET /api/pharmacy/sales/:invoice_number - Get sale by invoice number
     * GET /api/pharmacy/sales/search/:query - Search sales by partial invoice number
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Sale ID required', 400);
            return;
        }
        
        // URL decode the ID in case it's an invoice number with special characters
        $id = urldecode($id);
        
        // Check if it's a search query (contains search parameter)
        if ($this->input->get('search') === 'true' || strlen($id) < 10) {
            // If it's a short string or search flag, try partial matching
            $results = $this->Sale_model->search_by_invoice_number($id, 10);
            if (count($results) === 1) {
                // If only one result, return it directly
                $sale = $this->Sale_model->get_by_id($results[0]['id']);
                if ($sale) {
                    $this->success($sale);
                    return;
                }
            } elseif (count($results) > 1) {
                // Multiple results - return list
                $this->success($results);
                return;
            }
        }
        
        // Try exact match first
        // Check if it's an invoice number (starts with INV- or contains INV)
        if (strpos($id, 'INV-') === 0 || strpos($id, 'INV') !== false) {
            $sale = $this->Sale_model->get_by_invoice_number($id);
            if ($sale) {
                $this->success($sale);
                return;
            }
            // If exact match fails, try partial search
            $results = $this->Sale_model->search_by_invoice_number($id, 10);
            if (count($results) === 1) {
                $sale = $this->Sale_model->get_by_id($results[0]['id']);
                if ($sale) {
                    $this->success($sale);
                    return;
                }
            } elseif (count($results) > 1) {
                $this->success($results);
                return;
            }
        } else {
            // Try as numeric ID first
            if (is_numeric($id)) {
                $sale = $this->Sale_model->get_by_id($id);
                if ($sale) {
                    $this->success($sale);
                    return;
                }
            }
            // If not numeric, try as invoice number (exact then partial)
            $sale = $this->Sale_model->get_by_invoice_number($id);
            if ($sale) {
                $this->success($sale);
                return;
            }
            // Try partial search
            $results = $this->Sale_model->search_by_invoice_number($id, 10);
            if (count($results) === 1) {
                $sale = $this->Sale_model->get_by_id($results[0]['id']);
                if ($sale) {
                    $this->success($sale);
                    return;
                }
            } elseif (count($results) > 1) {
                $this->success($results);
                return;
            }
        }
        
        $this->error('Sale not found', 404);
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

    /**
     * POST /api/pharmacy/sales/:id/void - Void a sale
     */
    public function void($id = null) {
        if (!$id) {
            $this->error('Sale ID required', 400);
            return;
        }
        
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['void_reason'])) {
                $this->error('Void reason is required', 400);
                return;
            }
            
            // Set voided_by from current user
            if ($this->user) {
                $data['voided_by'] = $this->user['id'];
            } else {
                $this->error('User not authenticated', 401);
                return;
            }
            
            // Check if manager authorization is required (can be configured)
            $require_authorization = $data['require_authorization'] ?? true;
            if ($require_authorization && empty($data['authorized_by'])) {
                // Create pending void request (if you implement approval workflow)
                // For now, we'll allow void with manager role check
                if (!isset($this->user['role']) || $this->user['role'] !== 'manager') {
                    $this->error('Manager authorization required to void sale', 403);
                    return;
                }
                $data['authorized_by'] = $this->user['id'];
            }
            
            // Restore stock by default
            $data['restore_stock'] = $data['restore_stock'] ?? true;
            
            // Get sale info before voiding for audit log
            $sale = $this->Sale_model->get_by_id($id);
            
            $result = $this->Voided_sale_model->void_sale($id, $data);
            
            if ($result['success']) {
                // Log sale void
                $this->load->library('audit_log');
                $invoice_num = $sale['invoice_number'] ?? 'N/A';
                $this->audit_log->logUpdate('Pharmacy', 'Sale', $id, "Voided sale: Invoice {$invoice_num} - Reason: {$data['void_reason']}");
                
                $this->success($result, 'Sale voided successfully');
            } else {
                $this->error($result['message'] ?? 'Failed to void sale', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Void sale error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/sales/voided - Get voided sales
     */
    public function voided() {
        $filters = array();
        
        if ($this->input->get('start_date')) {
            $filters['start_date'] = $this->input->get('start_date');
        }
        
        if ($this->input->get('end_date')) {
            $filters['end_date'] = $this->input->get('end_date');
        }
        
        if ($this->input->get('voided_by')) {
            $filters['voided_by'] = $this->input->get('voided_by');
        }
        
        if ($this->input->get('limit')) {
            $filters['limit'] = (int)$this->input->get('limit');
        }
        
        if ($this->input->get('offset')) {
            $filters['offset'] = (int)$this->input->get('offset');
        }
        
        $voided_sales = $this->Voided_sale_model->get_all($filters);
        $this->success($voided_sales);
    }
}

