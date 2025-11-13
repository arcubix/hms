<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Sale_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
        $this->load->model('Medicine_stock_model');
        $this->load->model('Stock_movement_model');
    }

    /**
     * Generate unique invoice number
     */
    public function generate_invoice_number() {
        $prefix = 'INV-' . date('Ymd') . '-';
        $this->db->select('invoice_number');
        $this->db->from('sales');
        $this->db->like('invoice_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->invoice_number;
            $last_part = substr($last_number, strlen($prefix));
            $last_num = intval($last_part);
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get all sales with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('s.*, pc.name as customer_name_display, p.name as patient_name, u.name as cashier_name');
        $this->db->from('sales s');
        $this->db->join('pharmacy_customers pc', 's.customer_id = pc.id', 'left');
        $this->db->join('patients p', 's.patient_id = p.id', 'left');
        $this->db->join('users u', 's.cashier_id = u.id', 'left');
        
        if (!empty($filters['customer_id'])) {
            $this->db->where('s.customer_id', $filters['customer_id']);
        }
        
        if (!empty($filters['patient_id'])) {
            $this->db->where('s.patient_id', $filters['patient_id']);
        }
        
        if (!empty($filters['status'])) {
            $this->db->where('s.status', $filters['status']);
        }
        
        if (!empty($filters['payment_method'])) {
            $this->db->where('s.payment_method', $filters['payment_method']);
        }
        
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('s.invoice_number', $search);
            $this->db->or_like('s.customer_name', $search);
            $this->db->or_like('s.customer_phone', $search);
            $this->db->group_end();
        }
        
        if (!empty($filters['start_date'])) {
            $this->db->where('DATE(s.sale_date) >=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $this->db->where('DATE(s.sale_date) <=', $filters['end_date']);
        }
        
        $this->db->order_by('s.sale_date', 'DESC');
        $this->db->order_by('s.id', 'DESC');
        
        if (!empty($filters['limit'])) {
            $this->db->limit($filters['limit'], $filters['offset'] ?? 0);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get sale by ID with items
     */
    public function get_by_id($id) {
        $this->db->select('s.id, s.invoice_number, s.customer_id, s.patient_id, s.prescription_id, s.customer_name, s.customer_phone, s.customer_email, s.customer_address, s.sale_date, s.subtotal, s.discount_amount, s.discount_percentage, s.tax_rate, s.tax_amount, s.total_amount, s.payment_method, s.amount_received, s.change_amount, s.status, s.notes, s.cashier_id, pc.*, p.name as patient_name, p.patient_id as patient_code, u.name as cashier_name');
        $this->db->from('sales s');
        $this->db->join('pharmacy_customers pc', 's.customer_id = pc.id', 'left');
        $this->db->join('patients p', 's.patient_id = p.id', 'left');
        $this->db->join('users u', 's.cashier_id = u.id', 'left');
        $this->db->where('s.id', $id);
        $query = $this->db->get();
        $sale = $query->row_array();
        
        if ($sale) {
            // Get sale items
            $this->db->select('si.*, m.name as medicine_name, m.medicine_code, m.generic_name, ms.batch_number, ms.expiry_date');
            $this->db->from('sale_items si');
            $this->db->join('medicines m', 'si.medicine_id = m.id', 'left');
            $this->db->join('medicine_stock ms', 'si.stock_id = ms.id', 'left');
            $this->db->where('si.sale_id', $id);
            $items_query = $this->db->get();
            $sale['items'] = $items_query->result_array();
        }
        
        return $sale;
    }

    /**
     * Get sale by invoice number
     */
    public function get_by_invoice_number($invoice_number) {
        $this->db->where('invoice_number', $invoice_number);
        $query = $this->db->get('sales');
        $sale = $query->row_array();
        
        if ($sale) {
            return $this->get_by_id($sale['id']);
        }
        
        return null;
    }

    /**
     * Create sale with items and deduct stock
     */
    public function create($data) {
        $this->db->trans_start();
        
        // Generate invoice number if not provided
        if (empty($data['invoice_number'])) {
            $data['invoice_number'] = $this->generate_invoice_number();
        }
        
        // Calculate totals if items provided
        if (!empty($data['items']) && is_array($data['items'])) {
            $subtotal = 0;
            $total_discount = 0;
            
            foreach ($data['items'] as $item) {
                $item_subtotal = ($item['quantity'] * $item['unit_price']);
                $item_discount = ($item_subtotal * ($item['discount_percentage'] ?? 0)) / 100;
                $subtotal += ($item_subtotal - $item_discount);
                $total_discount += $item_discount;
            }
            
            $data['subtotal'] = $subtotal;
            $global_discount = ($data['discount_percentage'] ?? 0);
            $discount_amount = ($subtotal * $global_discount) / 100;
            $data['discount_amount'] = $total_discount + $discount_amount;
            $data['discount_percentage'] = $global_discount;
            
            $taxable_amount = $subtotal - $discount_amount;
            $tax_rate = $data['tax_rate'] ?? 14.00;
            $data['tax_amount'] = ($taxable_amount * $tax_rate) / 100;
            $data['total_amount'] = $taxable_amount + $data['tax_amount'];
            
            // Calculate change for cash payments
            if ($data['payment_method'] === 'Cash' && !empty($data['amount_received'])) {
                $data['change_amount'] = max(0, $data['amount_received'] - $data['total_amount']);
            }
        }
        
        // Set sale date if not provided
        if (empty($data['sale_date'])) {
            $data['sale_date'] = date('Y-m-d H:i:s');
        }
        
        // Remove items from data before inserting (items are stored in sale_items table)
        $items = $data['items'] ?? null;
        unset($data['items']);
        
        // Insert sale
        if ($this->db->insert('sales', $data)) {
            $sale_id = $this->db->insert_id();
            
            // Process items, deduct stock, and record movements
            if (!empty($items) && is_array($items)) {
                foreach ($items as $item) {
                    // Allocate and deduct stock
                    $allocation = $this->Medicine_stock_model->allocate_stock($item['medicine_id'], $item['quantity']);
                    
                    if (!$allocation['success']) {
                        $this->db->trans_rollback();
                        return array('success' => false, 'message' => 'Insufficient stock for ' . $item['medicine_name'], 'allocation' => $allocation);
                    }
                    
                    // Deduct stock for each allocated batch
                    foreach ($allocation['allocated'] as $allocated) {
                        $this->Medicine_stock_model->deduct_stock($allocated['stock_id'], $allocated['quantity']);
                        
                        // Record stock movement
                        $this->Stock_movement_model->create(array(
                            'medicine_id' => $item['medicine_id'],
                            'stock_id' => $allocated['stock_id'],
                            'movement_type' => 'Sale',
                            'reference_id' => $sale_id,
                            'reference_type' => 'sale',
                            'quantity' => -$allocated['quantity'],
                            'stock_before' => $allocated['quantity'] + ($this->db->select('quantity')->from('medicine_stock')->where('id', $allocated['stock_id'])->get()->row()->quantity ?? 0),
                            'stock_after' => ($this->db->select('quantity')->from('medicine_stock')->where('id', $allocated['stock_id'])->get()->row()->quantity ?? 0),
                            'cost_price' => $allocated['cost_price'],
                            'notes' => 'Sale via invoice ' . $data['invoice_number'],
                            'created_by' => $data['cashier_id'] ?? null
                        ));
                        
                        // Insert sale item
                        $sale_item = array(
                            'sale_id' => $sale_id,
                            'medicine_id' => $item['medicine_id'],
                            'stock_id' => $allocated['stock_id'],
                            'medicine_name' => $item['medicine_name'],
                            'batch_number' => $allocated['batch_number'],
                            'quantity' => $allocated['quantity'],
                            'unit_price' => $item['unit_price'],
                            'discount_percentage' => $item['discount_percentage'] ?? 0,
                            'discount_amount' => ($allocated['quantity'] * $item['unit_price'] * ($item['discount_percentage'] ?? 0)) / 100,
                            'subtotal' => ($allocated['quantity'] * $item['unit_price']) * (1 - ($item['discount_percentage'] ?? 0) / 100)
                        );
                        $this->db->insert('sale_items', $sale_item);
                    }
                }
            }
            
            // Update customer total purchases if customer exists
            if (!empty($data['customer_id'])) {
                $this->db->where('id', $data['customer_id']);
                $this->db->set('total_purchases', 'total_purchases + ' . (float)$data['total_amount'], false);
                $this->db->set('last_purchase_date', date('Y-m-d'), false);
                $this->db->update('pharmacy_customers');
            }
            
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                return array('success' => false, 'message' => 'Transaction failed');
            }
            
            return array('success' => true, 'sale_id' => $sale_id, 'invoice_number' => $data['invoice_number']);
        }
        
        $this->db->trans_rollback();
        return array('success' => false, 'message' => 'Failed to create sale');
    }

    /**
     * Get sales summary for date range
     */
    public function get_sales_summary($start_date = null, $end_date = null) {
        $this->db->select('
            COUNT(*) as total_sales,
            COUNT(DISTINCT customer_id) as total_customers,
            SUM(subtotal) as total_subtotal,
            SUM(discount_amount) as total_discount,
            SUM(tax_amount) as total_tax,
            SUM(total_amount) as total_revenue,
            SUM(CASE WHEN payment_method = "Cash" THEN total_amount ELSE 0 END) as cash_sales,
            SUM(CASE WHEN payment_method = "Card" THEN total_amount ELSE 0 END) as card_sales,
            SUM(CASE WHEN payment_method = "Insurance" THEN total_amount ELSE 0 END) as insurance_sales
        ');
        $this->db->from('sales');
        $this->db->where('status', 'Completed');
        
        if ($start_date) {
            $this->db->where('DATE(sale_date) >=', $start_date);
        }
        
        if ($end_date) {
            $this->db->where('DATE(sale_date) <=', $end_date);
        }
        
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get top selling medicines
     */
    public function get_top_selling_medicines($limit = 10, $start_date = null, $end_date = null) {
        $this->db->select('
            m.id as medicine_id,
            m.name,
            m.generic_name,
            SUM(si.quantity) as total_quantity_sold,
            SUM(si.subtotal) as total_revenue
        ');
        $this->db->from('sale_items si');
        $this->db->join('sales s', 'si.sale_id = s.id', 'left');
        $this->db->join('medicines m', 'si.medicine_id = m.id', 'left');
        $this->db->where('s.status', 'Completed');
        
        if ($start_date) {
            $this->db->where('DATE(s.sale_date) >=', $start_date);
        }
        
        if ($end_date) {
            $this->db->where('DATE(s.sale_date) <=', $end_date);
        }
        
        $this->db->group_by('m.id, m.name, m.generic_name');
        $this->db->order_by('total_quantity_sold', 'DESC');
        $this->db->limit($limit);
        
        $query = $this->db->get();
        return $query->result_array();
    }
}

