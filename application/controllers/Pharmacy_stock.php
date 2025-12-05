<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Pharmacy_stock extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Medicine_stock_model');
        $this->load->model('Medicine_model');
        $this->load->model('Reorder_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/stock - Get all stock with filters
     * POST /api/pharmacy/stock - Add new stock batch
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing pharmacy stock
            if (!$this->requirePermission('admin.view_users')) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('medicine_id')) {
                $filters['medicine_id'] = $this->input->get('medicine_id');
            }
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('category')) {
                $filters['category'] = $this->input->get('category');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('expiring_soon')) {
                $filters['expiring_soon'] = (int)$this->input->get('expiring_soon');
            }
            
            if ($this->input->get('limit')) {
                $filters['limit'] = (int)$this->input->get('limit');
            }
            
            if ($this->input->get('offset')) {
                $filters['offset'] = (int)$this->input->get('offset');
            }
            
            $stock = $this->Medicine_stock_model->search($filters);
            $this->success($stock);
            
        } elseif ($method === 'POST') {
            // Check permission for creating stock
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create new stock batch
     * POST /api/pharmacy/stock
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['medicine_id'])) {
                $this->error('Medicine ID is required', 400);
                return;
            }
            
            if (empty($data['batch_number'])) {
                $this->error('Batch number is required', 400);
                return;
            }
            
            if (empty($data['expiry_date'])) {
                $this->error('Expiry date is required', 400);
                return;
            }
            
            if (empty($data['quantity']) || $data['quantity'] <= 0) {
                $this->error('Valid quantity is required', 400);
                return;
            }
            
            if (empty($data['cost_price']) || $data['cost_price'] < 0) {
                $this->error('Valid cost price is required', 400);
                return;
            }
            
            if (empty($data['selling_price']) || $data['selling_price'] < 0) {
                $this->error('Valid selling price is required', 400);
                return;
            }
            
            // Validate expiry date is in future
            $expiry_date = new DateTime($data['expiry_date']);
            $today = new DateTime();
            if ($expiry_date <= $today) {
                $this->error('Expiry date must be in the future', 400);
                return;
            }
            
            // Validate selling price >= cost price
            if ($data['selling_price'] < $data['cost_price']) {
                $this->error('Selling price cannot be less than cost price', 400);
                return;
            }
            
            // Set created_by
            if ($this->user) {
                $data['created_by'] = $this->user['id'];
            }
            
            $stock_id = $this->Medicine_stock_model->add_stock($data);
            
            if ($stock_id) {
                $stock = $this->Medicine_stock_model->get_by_id($stock_id);
                
                // Log stock creation
                $this->load->library('audit_log');
                $batch_number = $data['batch_number'] ?? 'Unknown';
                $quantity = $data['quantity'] ?? 0;
                $this->audit_log->logCreate('Pharmacy', 'Stock', $stock_id, "Added stock batch: {$batch_number} for Medicine ID: {$data['medicine_id']}, Quantity: {$quantity}");
                
                $this->success($stock, 'Stock added successfully', 201);
            } else {
                $this->error('Failed to add stock', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/stock/:id - Get stock by ID
     * PUT /api/pharmacy/stock/:id - Update stock
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Stock ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $stock = $this->Medicine_stock_model->get_by_id($id);
            
            if ($stock) {
                $this->success($stock);
            } else {
                $this->error('Stock not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update stock
     * PUT /api/pharmacy/stock/:id
     */
    public function update($id) {
        try {
            $data = $this->get_request_data();
            
            // Validate if stock exists
            $stock = $this->Medicine_stock_model->get_by_id($id);
            if (!$stock) {
                $this->error('Stock not found', 404);
                return;
            }
            
            // Validate expiry date if provided
            if (!empty($data['expiry_date'])) {
                $expiry_date = new DateTime($data['expiry_date']);
                $today = new DateTime();
                if ($expiry_date <= $today) {
                    $this->error('Expiry date must be in the future', 400);
                    return;
                }
            }
            
            // Validate prices if provided
            if (isset($data['selling_price']) && isset($data['cost_price'])) {
                if ($data['selling_price'] < $data['cost_price']) {
                    $this->error('Selling price cannot be less than cost price', 400);
                    return;
                }
            }
            
            $old_stock = $stock;
            $result = $this->Medicine_stock_model->update($id, $data);
            
            if ($result) {
                $stock = $this->Medicine_stock_model->get_by_id($id);
                
                // Log stock update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Stock', $id, "Updated stock batch ID: {$id}", $old_stock, $stock);
                
                $this->success($stock, 'Stock updated successfully');
            } else {
                $this->error('Failed to update stock', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/stock/medicine/:medicine_id - Get stock for a medicine
     */
    public function get_by_medicine($medicine_id = null) {
        if (!$medicine_id) {
            $this->error('Medicine ID required', 400);
            return;
        }
        
        $include_expired = $this->input->get('include_expired') === 'true';
        $stock = $this->Medicine_stock_model->get_by_medicine_id($medicine_id, $include_expired);
        $this->success($stock);
    }

    /**
     * GET /api/pharmacy/stock/low-stock - Get low stock alerts
     */
    public function low_stock() {
        $alerts = $this->Medicine_stock_model->get_low_stock();
        $this->success($alerts);
    }

    /**
     * GET /api/pharmacy/stock/expiring - Get expiring stock
     */
    public function expiring() {
        $days = (int)($this->input->get('days') ?? 90);
        $expiring = $this->Medicine_stock_model->get_expiring_stock($days);
        $this->success($expiring);
    }

    /**
     * GET /api/pharmacy/stock/barcode/:barcode - Get stock by barcode
     */
    public function get_by_barcode($barcode = null) {
        if (!$barcode) {
            $this->error('Barcode required', 400);
            return;
        }
        
        $stock = $this->Medicine_stock_model->get_by_barcode($barcode);
        
        if ($stock) {
            $this->success($stock);
        } else {
            $this->error('Stock not found for barcode', 404);
        }
    }

    /**
     * POST /api/pharmacy/stock/import - Bulk import stock from CSV/Excel
     */
    public function import() {
        try {
            if (empty($_FILES['file']['tmp_name'])) {
                $this->error('File is required', 400);
                return;
            }
            
            $file_path = $_FILES['file']['tmp_name'];
            $file_name = $_FILES['file']['name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            if (!in_array($file_ext, array('csv', 'xlsx', 'xls'))) {
                $this->error('Invalid file format. Only CSV and Excel files are allowed', 400);
                return;
            }
            
            // Read file
            $data = array();
            if ($file_ext === 'csv') {
                $handle = fopen($file_path, 'r');
                $headers = fgetcsv($handle); // Skip header row
                
                while (($row = fgetcsv($handle)) !== FALSE) {
                    if (count($row) >= 7) {
                        $data[] = array(
                            'medicine_code' => $row[0],
                            'batch_number' => $row[1],
                            'expiry_date' => $row[2],
                            'quantity' => (int)$row[3],
                            'cost_price' => (float)$row[4],
                            'selling_price' => (float)$row[5],
                            'location' => $row[6] ?? null,
                            'manufacture_date' => !empty($row[7]) ? $row[7] : null
                        );
                    }
                }
                fclose($handle);
            } else {
                // For Excel files, you would need PHPExcel or PhpSpreadsheet library
                $this->error('Excel import not yet implemented. Please use CSV format', 400);
                return;
            }
            
            // Validate and import
            $imported = 0;
            $errors = array();
            $user = $this->get_current_user();
            
            foreach ($data as $index => $row) {
                try {
                    // Find medicine by code
                    $medicine = $this->Medicine_model->get_by_id($row['medicine_code']);
                    if (!$medicine) {
                        // Try by medicine_code field
                        $this->db->where('medicine_code', $row['medicine_code']);
                        $medicine = $this->db->get('medicines')->row_array();
                    }
                    
                    if (!$medicine) {
                        $errors[] = "Row " . ($index + 2) . ": Medicine not found for code " . $row['medicine_code'];
                        continue;
                    }
                    
                    // Validate data
                    if (empty($row['batch_number']) || empty($row['expiry_date']) || empty($row['quantity'])) {
                        $errors[] = "Row " . ($index + 2) . ": Missing required fields";
                        continue;
                    }
                    
                    // Validate expiry date
                    $expiry_date = new DateTime($row['expiry_date']);
                    $today = new DateTime();
                    if ($expiry_date <= $today) {
                        $errors[] = "Row " . ($index + 2) . ": Expiry date must be in the future";
                        continue;
                    }
                    
                    // Prepare stock data
                    $stock_data = array(
                        'medicine_id' => $medicine['id'],
                        'batch_number' => $row['batch_number'],
                        'expiry_date' => $row['expiry_date'],
                        'quantity' => (int)$row['quantity'],
                        'cost_price' => (float)$row['cost_price'],
                        'selling_price' => (float)$row['selling_price'],
                        'location' => $row['location'] ?? null,
                        'manufacture_date' => $row['manufacture_date'] ?? null,
                        'status' => 'Active',
                        'created_by' => $user['id'] ?? null
                    );
                    
                    if ($this->Medicine_stock_model->add_stock($stock_data)) {
                        $imported++;
                    } else {
                        $errors[] = "Row " . ($index + 2) . ": Failed to import";
                    }
                } catch (Exception $e) {
                    $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }
            
            $this->success(array(
                'imported' => $imported,
                'total' => count($data),
                'errors' => $errors
            ), "Imported {$imported} of " . count($data) . " stock entries");
            
        } catch (Exception $e) {
            log_message('error', 'Stock import error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/stock/import-template - Download import template
     */
    public function import_template() {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="stock_import_template.csv"');
        
        $output = fopen('php://output', 'w');
        
        // Header row
        fputcsv($output, array(
            'Medicine Code',
            'Batch Number',
            'Expiry Date (YYYY-MM-DD)',
            'Quantity',
            'Cost Price',
            'Selling Price',
            'Location (Optional)',
            'Manufacture Date (Optional, YYYY-MM-DD)'
        ));
        
        // Sample row
        fputcsv($output, array(
            'MED000001',
            'BATCH001',
            date('Y-m-d', strtotime('+1 year')),
            '100',
            '5.00',
            '10.00',
            'Shelf A-1',
            date('Y-m-d')
        ));
        
        fclose($output);
        exit;
    }

    /**
     * POST /api/pharmacy/stock/reserve - Reserve stock for pending sale
     */
    public function reserve() {
        if ($this->input->server('REQUEST_METHOD') !== 'POST') {
            $this->error('Method not allowed', 405);
            return;
        }

        try {
            $data = $this->get_request_data();
            
            if (empty($data['medicine_id'])) {
                $this->error('Medicine ID is required', 400);
                return;
            }
            
            if (empty($data['quantity']) || $data['quantity'] <= 0) {
                $this->error('Valid quantity is required', 400);
                return;
            }
            
            $result = $this->Medicine_stock_model->reserve_stock($data['medicine_id'], $data['quantity']);
            
            if ($result['success']) {
                $this->success($result, 'Stock reserved successfully');
            } else {
                $this->error($result['message'], 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Stock reserve error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/pharmacy/stock/release - Release reserved stock
     */
    public function release() {
        if ($this->input->server('REQUEST_METHOD') !== 'POST') {
            $this->error('Method not allowed', 405);
            return;
        }

        try {
            $data = $this->get_request_data();
            
            if (empty($data['medicine_id'])) {
                $this->error('Medicine ID is required', 400);
                return;
            }
            
            if (empty($data['quantity']) || $data['quantity'] <= 0) {
                $this->error('Valid quantity is required', 400);
                return;
            }
            
            // Get stock batches and release reservation
            $stocks = $this->Medicine_stock_model->get_by_medicine_id($data['medicine_id'], false);
            $remaining = $data['quantity'];
            
            foreach ($stocks as $stock) {
                if ($remaining <= 0) break;
                if ($stock['reserved_quantity'] <= 0) continue;
                
                $release = min($remaining, $stock['reserved_quantity']);
                $this->Medicine_stock_model->release_reserved_stock($stock['id'], $release);
                $remaining -= $release;
            }
            
            $this->success(null, 'Stock reservation released');
        } catch (Exception $e) {
            log_message('error', 'Stock release error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /api/pharmacy/stock/mark-expired - Mark expired stock
     */
    public function mark_expired() {
        $updated = $this->Medicine_stock_model->mark_expired();
        $this->success(array('updated' => $updated), "Marked {$updated} stock batches as expired");
    }
}

