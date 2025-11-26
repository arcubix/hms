<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class DonationDonor_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all donation donors with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('dd.*, u.name as created_by_name');
        $this->db->from('donation_donors dd');
        $this->db->join('users u', 'dd.created_by = u.id', 'left');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('dd.donor_id', $search);
            $this->db->or_like('dd.name', $search);
            $this->db->or_like('dd.email', $search);
            $this->db->or_like('dd.phone', $search);
            $this->db->or_like('dd.cnic', $search);
            $this->db->group_end();
        }
        
        // Apply type filter
        if (!empty($filters['type']) && in_array($filters['type'], array('individual', 'corporate'))) {
            $this->db->where('dd.type', $filters['type']);
        }
        
        $this->db->order_by('dd.donor_id', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get donation donor by ID
     */
    public function get_by_id($id) {
        $this->db->select('dd.*, u.name as created_by_name');
        $this->db->from('donation_donors dd');
        $this->db->join('users u', 'dd.created_by = u.id', 'left');
        $this->db->where('dd.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get donation donor by donor_id
     */
    public function get_by_donor_id($donor_id) {
        $this->db->where('donor_id', $donor_id);
        $query = $this->db->get('donation_donors');
        return $query->row_array();
    }

    /**
     * Generate unique donor ID
     */
    private function generate_donor_id() {
        $prefix = 'DN';
        $this->db->select_max('donor_id');
        $this->db->like('donor_id', $prefix, 'after');
        $query = $this->db->get('donation_donors');
        $result = $query->row();
        
        if ($result && $result->donor_id) {
            $last_number = intval(substr($result->donor_id, strlen($prefix)));
            $new_number = $last_number + 1;
        } else {
            $new_number = 1;
        }
        
        return $prefix . str_pad($new_number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create donation donor
     */
    public function create($data) {
        // Generate donor_id if not provided
        if (empty($data['donor_id'])) {
            $data['donor_id'] = $this->generate_donor_id();
        }
        
        $insert_data = array(
            'donor_id' => $data['donor_id'],
            'name' => $data['name'],
            'type' => isset($data['type']) ? $data['type'] : 'individual',
            'cnic' => isset($data['cnic']) ? $data['cnic'] : null,
            'phone' => isset($data['phone']) ? $data['phone'] : null,
            'email' => isset($data['email']) ? $data['email'] : null,
            'address' => isset($data['address']) ? $data['address'] : null,
            'city' => isset($data['city']) ? $data['city'] : null,
            'country' => isset($data['country']) ? $data['country'] : 'Pakistan',
            'total_donated' => isset($data['total_donated']) ? $data['total_donated'] : 0.00,
            'last_donation' => isset($data['last_donation']) ? $data['last_donation'] : null,
            'frequency' => isset($data['frequency']) ? $data['frequency'] : 'one-time',
            'tax_exempt' => isset($data['tax_exempt']) ? ($data['tax_exempt'] ? 1 : 0) : 0,
            'notes' => isset($data['notes']) ? $data['notes'] : null,
            'created_by' => isset($data['created_by']) ? $data['created_by'] : null
        );

        if ($this->db->insert('donation_donors', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update donation donor
     */
    public function update($id, $data) {
        $update_data = array();
        
        if (isset($data['name'])) {
            $update_data['name'] = $data['name'];
        }
        if (isset($data['type'])) {
            $update_data['type'] = $data['type'];
        }
        if (isset($data['cnic'])) {
            $update_data['cnic'] = $data['cnic'];
        }
        if (isset($data['phone'])) {
            $update_data['phone'] = $data['phone'];
        }
        if (isset($data['email'])) {
            $update_data['email'] = $data['email'];
        }
        if (isset($data['address'])) {
            $update_data['address'] = $data['address'];
        }
        if (isset($data['city'])) {
            $update_data['city'] = $data['city'];
        }
        if (isset($data['country'])) {
            $update_data['country'] = $data['country'];
        }
        if (isset($data['total_donated'])) {
            $update_data['total_donated'] = $data['total_donated'];
        }
        if (isset($data['last_donation'])) {
            $update_data['last_donation'] = $data['last_donation'];
        }
        if (isset($data['frequency'])) {
            $update_data['frequency'] = $data['frequency'];
        }
        if (isset($data['tax_exempt'])) {
            $update_data['tax_exempt'] = $data['tax_exempt'] ? 1 : 0;
        }
        if (isset($data['notes'])) {
            $update_data['notes'] = $data['notes'];
        }

        $this->db->where('id', $id);
        return $this->db->update('donation_donors', $update_data);
    }

    /**
     * Delete donation donor
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('donation_donors');
    }

    /**
     * Get payment history for a donor
     */
    public function get_payments($donor_id) {
        $this->db->select('dp.*, u.name as processed_by_name');
        $this->db->from('donation_payments dp');
        $this->db->join('users u', 'dp.processed_by = u.id', 'left');
        $this->db->where('dp.donor_id', $donor_id);
        $this->db->order_by('dp.payment_date', 'DESC');
        $this->db->order_by('dp.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Add payment for a donor
     */
    public function add_payment($donor_id, $payment_data) {
        // Generate receipt number if not provided
        if (empty($payment_data['receipt_number'])) {
            $payment_data['receipt_number'] = $this->generate_receipt_number();
        }
        
        $insert_data = array(
            'donor_id' => $donor_id,
            'amount' => $payment_data['amount'],
            'payment_date' => $payment_data['payment_date'],
            'payment_method' => isset($payment_data['payment_method']) ? $payment_data['payment_method'] : 'cash',
            'transaction_id' => isset($payment_data['transaction_id']) ? $payment_data['transaction_id'] : null,
            'cheque_number' => isset($payment_data['cheque_number']) ? $payment_data['cheque_number'] : null,
            'bank_name' => isset($payment_data['bank_name']) ? $payment_data['bank_name'] : null,
            'purpose' => isset($payment_data['purpose']) ? $payment_data['purpose'] : null,
            'receipt_number' => $payment_data['receipt_number'],
            'status' => isset($payment_data['status']) ? $payment_data['status'] : 'completed',
            'notes' => isset($payment_data['notes']) ? $payment_data['notes'] : null,
            'processed_by' => isset($payment_data['processed_by']) ? $payment_data['processed_by'] : null
        );

        if ($this->db->insert('donation_payments', $insert_data)) {
            $payment_id = $this->db->insert_id();
            
            // Update donor's total_donated and last_donation
            $this->db->set('total_donated', 'total_donated + ' . floatval($payment_data['amount']), FALSE);
            $this->db->set('last_donation', $payment_data['payment_date']);
            $this->db->where('id', $donor_id);
            $this->db->update('donation_donors');
            
            return $payment_id;
        }
        return false;
    }

    /**
     * Generate unique receipt number
     */
    private function generate_receipt_number() {
        $prefix = 'RCP';
        $date = date('Ymd');
        $this->db->select_max('receipt_number');
        $this->db->like('receipt_number', $prefix . $date, 'after');
        $query = $this->db->get('donation_payments');
        $result = $query->row();
        
        if ($result && $result->receipt_number) {
            $last_number = intval(substr($result->receipt_number, strlen($prefix . $date)));
            $new_number = $last_number + 1;
        } else {
            $new_number = 1;
        }
        
        return $prefix . $date . str_pad($new_number, 4, '0', STR_PAD_LEFT);
    }
}

