<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Barcodes extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Medicine_model');
        $this->load->database();
        
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/pharmacy/barcodes - Get all barcodes
     * POST /api/pharmacy/barcodes - Create barcode
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing barcodes
            if (!$this->requireAnyPermission(['admin.view_users', 'admin.edit_users'])) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('medicine_id')) {
                $filters['medicine_id'] = $this->input->get('medicine_id');
            }
            
            if ($this->input->get('barcode')) {
                $filters['barcode'] = $this->input->get('barcode');
            }
            
            $this->db->select('b.*, m.name as medicine_name, m.medicine_code, m.generic_name');
            $this->db->from('barcodes b');
            $this->db->join('medicines m', 'b.medicine_id = m.id', 'left');
            
            if (!empty($filters['medicine_id'])) {
                $this->db->where('b.medicine_id', $filters['medicine_id']);
            }
            
            if (!empty($filters['barcode'])) {
                $this->db->where('b.barcode', $filters['barcode']);
            }
            
            $this->db->order_by('b.is_primary', 'DESC');
            $this->db->order_by('b.created_at', 'DESC');
            
            $query = $this->db->get();
            $barcodes = $query->result_array();
            $this->success($barcodes);
            
        } elseif ($method === 'POST') {
            // Check permission for creating barcodes
            if (!$this->requirePermission('admin.edit_users')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create barcode
     */
    public function create() {
        try {
            $data = $this->get_request_data();
            
            // Validate required fields
            if (empty($data['medicine_id'])) {
                $this->error('Medicine ID is required', 400);
                return;
            }
            
            if (empty($data['barcode'])) {
                $this->error('Barcode is required', 400);
                return;
            }
            
            // Validate medicine exists
            $medicine = $this->Medicine_model->get_by_id($data['medicine_id']);
            if (!$medicine) {
                $this->error('Medicine not found', 404);
                return;
            }
            
            // Check if barcode already exists
            $existing = $this->db->get_where('barcodes', array('barcode' => $data['barcode']))->row_array();
            if ($existing) {
                $this->error('Barcode already exists', 400);
                return;
            }
            
            // If this is set as primary, unset other primary barcodes for this medicine
            if (!empty($data['is_primary']) && $data['is_primary']) {
                $this->db->where('medicine_id', $data['medicine_id']);
                $this->db->update('barcodes', array('is_primary' => 0));
            }
            
            if ($this->db->insert('barcodes', $data)) {
                $barcode_id = $this->db->insert_id();
                $barcode = $this->db->select('b.*, m.name as medicine_name, m.medicine_code')
                    ->from('barcodes b')
                    ->join('medicines m', 'b.medicine_id = m.id')
                    ->where('b.id', $barcode_id)
                    ->get()
                    ->row_array();
                
                // Log barcode creation
                $this->load->library('audit_log');
                $barcode_value = $data['barcode'] ?? 'Unknown';
                $this->audit_log->logCreate('Pharmacy', 'Barcode', $barcode_id, "Created barcode: {$barcode_value} for Medicine ID: {$data['medicine_id']}");
                
                $this->success($barcode, 'Barcode created successfully', 201);
            } else {
                $this->error('Failed to create barcode', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Barcode create error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/pharmacy/barcodes/:id - Get single barcode
     * PUT /api/pharmacy/barcodes/:id - Update barcode
     * DELETE /api/pharmacy/barcodes/:id - Delete barcode
     */
    public function id($id = null) {
        if (!$id) {
            $this->error('Barcode ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            $barcode = $this->db->select('b.*, m.name as medicine_name, m.medicine_code')
                ->from('barcodes b')
                ->join('medicines m', 'b.medicine_id = m.id')
                ->where('b.id', $id)
                ->get()
                ->row_array();
            
            if ($barcode) {
                $this->success($barcode);
            } else {
                $this->error('Barcode not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $this->update($id);
            
        } elseif ($method === 'DELETE') {
            $this->delete($id);
            
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update barcode
     */
    private function update($id) {
        try {
            $data = $this->get_request_data();
            
            $barcode = $this->db->get_where('barcodes', array('id' => $id))->row_array();
            if (!$barcode) {
                $this->error('Barcode not found', 404);
                return;
            }
            
            // If setting as primary, unset other primary barcodes
            if (!empty($data['is_primary']) && $data['is_primary']) {
                $this->db->where('medicine_id', $barcode['medicine_id']);
                $this->db->where('id !=', $id);
                $this->db->update('barcodes', array('is_primary' => 0));
            }
            
            // Check barcode uniqueness if changing barcode
            if (!empty($data['barcode']) && $data['barcode'] !== $barcode['barcode']) {
                $existing = $this->db->get_where('barcodes', array('barcode' => $data['barcode']))->row_array();
                if ($existing) {
                    $this->error('Barcode already exists', 400);
                    return;
                }
            }
            
            $old_barcode = $barcode;
            $this->db->where('id', $id);
            if ($this->db->update('barcodes', $data)) {
                $updated = $this->db->select('b.*, m.name as medicine_name, m.medicine_code')
                    ->from('barcodes b')
                    ->join('medicines m', 'b.medicine_id = m.id')
                    ->where('b.id', $id)
                    ->get()
                    ->row_array();
                
                // Log barcode update
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('Pharmacy', 'Barcode', $id, "Updated barcode ID: {$id}", $old_barcode, $updated);
                
                $this->success($updated, 'Barcode updated successfully');
            } else {
                $this->error('Failed to update barcode', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Barcode update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete barcode
     */
    private function delete($id) {
        $barcode = $this->db->get_where('barcodes', array('id' => $id))->row_array();
        if (!$barcode) {
            $this->error('Barcode not found', 404);
            return;
        }
        
        $this->db->where('id', $id);
        if ($this->db->delete('barcodes')) {
            // Log barcode deletion
            $this->load->library('audit_log');
            $barcode_value = $barcode['barcode'] ?? 'Unknown';
            $this->audit_log->logDelete('Pharmacy', 'Barcode', $id, "Deleted barcode: {$barcode_value}");
            
            $this->success(null, 'Barcode deleted successfully');
        } else {
            $this->error('Failed to delete barcode', 400);
        }
    }

    /**
     * POST /api/pharmacy/barcodes/generate - Generate barcode for medicine
     */
    public function generate() {
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
            
            $medicine = $this->Medicine_model->get_by_id($data['medicine_id']);
            if (!$medicine) {
                $this->error('Medicine not found', 404);
                return;
            }
            
            // Generate EAN-13 barcode (13 digits)
            // Format: 2 (country code) + 5 (company) + 5 (product) + 1 (check digit)
            $base = '20000' . str_pad($medicine['id'], 5, '0', STR_PAD_LEFT);
            
            // Calculate check digit (EAN-13 algorithm)
            $sum = 0;
            for ($i = 0; $i < 12; $i++) {
                $digit = (int)$base[$i];
                $sum += ($i % 2 === 0) ? $digit : $digit * 3;
            }
            $check_digit = (10 - ($sum % 10)) % 10;
            $barcode = $base . $check_digit;
            
            // Check if barcode already exists
            $existing = $this->db->get_where('barcodes', array('barcode' => $barcode))->row_array();
            if ($existing) {
                // If exists, append medicine ID and recalculate
                $barcode = '20000' . str_pad($medicine['id'], 5, '0', STR_PAD_LEFT) . str_pad(rand(0, 9), 1, '0', STR_PAD_LEFT);
                $sum = 0;
                for ($i = 0; $i < 12; $i++) {
                    $digit = (int)$barcode[$i];
                    $sum += ($i % 2 === 0) ? $digit : $digit * 3;
                }
                $check_digit = (10 - ($sum % 10)) % 10;
                $barcode = substr($barcode, 0, 12) . $check_digit;
            }
            
            $barcode_data = array(
                'medicine_id' => $data['medicine_id'],
                'barcode' => $barcode,
                'barcode_type' => 'EAN-13',
                'is_primary' => empty($data['is_primary']) ? 0 : 1
            );
            
            // If setting as primary, unset other primary barcodes
            if (!empty($barcode_data['is_primary']) && $barcode_data['is_primary']) {
                $this->db->where('medicine_id', $data['medicine_id']);
                $this->db->update('barcodes', array('is_primary' => 0));
            }
            
            if ($this->db->insert('barcodes', $barcode_data)) {
                $barcode_id = $this->db->insert_id();
                $created = $this->db->select('b.*, m.name as medicine_name, m.medicine_code')
                    ->from('barcodes b')
                    ->join('medicines m', 'b.medicine_id = m.id')
                    ->where('b.id', $barcode_id)
                    ->get()
                    ->row_array();
                $this->success($created, 'Barcode generated successfully', 201);
            } else {
                $this->error('Failed to generate barcode', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Barcode generate error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

