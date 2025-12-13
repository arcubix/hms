<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Lab_result_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique result ID
     * Format: RES-YYYY-XXXXX
     */
    public function generate_result_id() {
        $year = date('Y');
        $prefix = 'RES-' . $year . '-';
        
        $this->db->select('result_id');
        $this->db->like('result_id', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('lab_results');
        
        if ($query->num_rows() > 0) {
            $last_result = $query->row()->result_id;
            if (preg_match('/RES-' . $year . '-(\d+)/', $last_result, $matches)) {
                $next_number = intval($matches[1]) + 1;
            } else {
                $next_number = 1;
            }
        } else {
            $next_number = 1;
        }
        
        return $prefix . str_pad($next_number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Create result
     */
    public function create($data) {
        // Generate result ID if not provided
        if (empty($data['result_id'])) {
            $data['result_id'] = $this->generate_result_id();
        }
        
        // Set defaults
        if (empty($data['status'])) {
            $data['status'] = 'entered';
        }
        if (empty($data['entered_at'])) {
            $data['entered_at'] = date('Y-m-d H:i:s');
        }
        
        $this->db->trans_start();
        
        // Insert result
        if (!$this->db->insert('lab_results', $data)) {
            $this->db->trans_rollback();
            return false;
        }
        
        $result_id = $this->db->insert_id();
        
        // Insert result values if provided
        if (!empty($data['values']) && is_array($data['values'])) {
            foreach ($data['values'] as $value) {
                $value_data = array(
                    'result_id' => $result_id,
                    'parameter_name' => $value['parameter_name'],
                    'result_value' => $value['result_value'],
                    'unit' => isset($value['unit']) ? $value['unit'] : null,
                    'normal_range' => isset($value['normal_range']) ? $value['normal_range'] : null,
                    'is_abnormal' => isset($value['is_abnormal']) ? $value['is_abnormal'] : false,
                    'is_critical' => isset($value['is_critical']) ? $value['is_critical'] : false,
                    'organization_id' => isset($data['organization_id']) ? $data['organization_id'] : null
                );
                
                $this->db->insert('lab_result_values', $value_data);
            }
        }
        
        // Check for critical values
        $this->check_critical_values($result_id);
        
        // Update order test status
        if (!empty($data['order_test_id'])) {
            $this->db->where('id', $data['order_test_id']);
            $this->db->update('lab_order_tests', array('result_id' => $result_id, 'status' => 'results-entered'));
        }
        
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            return false;
        }
        
        return $result_id;
    }

    /**
     * Get result by ID
     */
    public function get_by_id($id) {
        $this->db->select('lr.*, p.name as patient_name, lt.test_name, lo.order_number');
        $this->db->from('lab_results lr');
        $this->db->join('patients p', 'p.id = lr.patient_id', 'left');
        $this->db->join('lab_tests lt', 'lt.id = lr.test_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = lr.order_id', 'left');
        $this->db->where('lr.id', $id);
        $query = $this->db->get();
        $result = $query->row_array();
        
        if ($result) {
            // Get result values
            $this->db->select('*');
            $this->db->from('lab_result_values');
            $this->db->where('result_id', $id);
            $query = $this->db->get();
            $result['values'] = $query->result_array();
        }
        
        return $result;
    }

    /**
     * Get results by order
     */
    public function get_by_order($order_id) {
        $this->db->select('lr.*, lt.test_name, lot.test_name as order_test_name');
        $this->db->from('lab_results lr');
        $this->db->join('lab_tests lt', 'lt.id = lr.test_id', 'left');
        $this->db->join('lab_order_tests lot', 'lot.id = lr.order_test_id', 'left');
        $this->db->where('lr.order_id', $order_id);
        $this->db->order_by('lr.entered_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get results by patient
     */
    public function get_by_patient($patient_id, $limit = null) {
        $this->db->select('lr.*, lt.test_name, lo.order_number, lo.order_date');
        $this->db->from('lab_results lr');
        $this->db->join('lab_tests lt', 'lt.id = lr.test_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = lr.order_id', 'left');
        $this->db->where('lr.patient_id', $patient_id);
        $this->db->where('lr.status', 'pathologist-signed'); // Only show approved results
        $this->db->order_by('lr.approved_at', 'DESC');
        
        if ($limit) {
            $this->db->limit($limit);
        }
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get all results with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('lr.*, p.name as patient_name, lt.test_name, lo.order_number');
        $this->db->from('lab_results lr');
        $this->db->join('patients p', 'p.id = lr.patient_id', 'left');
        $this->db->join('lab_tests lt', 'lt.id = lr.test_id', 'left');
        $this->db->join('lab_orders lo', 'lo.id = lr.order_id', 'left');
        
        if (!empty($filters['status'])) {
            $this->db->where('lr.status', $filters['status']);
        }
        
        if (!empty($filters['is_critical'])) {
            $this->db->where('lr.is_critical', 1);
        }
        
        if (!empty($filters['is_abnormal'])) {
            $this->db->where('lr.is_abnormal', 1);
        }
        
        if (!empty($filters['organization_id'])) {
            $this->db->where('lr.organization_id', $filters['organization_id']);
        }
        
        $this->db->order_by('lr.entered_at', 'DESC');
        
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Verify result
     */
    public function verify($result_id, $user_id) {
        $this->db->where('id', $result_id);
        return $this->db->update('lab_results', array(
            'status' => 'tech-verified',
            'verified_by_user_id' => $user_id,
            'verified_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ));
    }

    /**
     * Approve result
     */
    public function approve($result_id, $user_id) {
        $this->db->where('id', $result_id);
        $updated = $this->db->update('lab_results', array(
            'status' => 'pathologist-signed',
            'approved_by_user_id' => $user_id,
            'approved_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ));
        
        if ($updated) {
            // Update order test status
            $result = $this->get_by_id($result_id);
            if ($result && !empty($result['order_test_id'])) {
                $this->db->where('id', $result['order_test_id']);
                $this->db->update('lab_order_tests', array('status' => 'reported'));
            }
        }
        
        return $updated;
    }

    /**
     * Check critical values
     */
    public function check_critical_values($result_id) {
        $result = $this->get_by_id($result_id);
        if (!$result || empty($result['test_id'])) {
            return false;
        }
        
        // Get test critical ranges
        $this->db->select('critical_range_low, critical_range_high');
        $this->db->from('lab_tests');
        $this->db->where('id', $result['test_id']);
        $query = $this->db->get();
        $test = $query->row_array();
        
        if (!$test || (!$test['critical_range_low'] && !$test['critical_range_high'])) {
            return false;
        }
        
        // Check result values against critical ranges
        $is_critical = false;
        if (!empty($result['values'])) {
            foreach ($result['values'] as $value) {
                $num_value = floatval($value['result_value']);
                if (is_numeric($num_value)) {
                    if (($test['critical_range_low'] && $num_value < $test['critical_range_low']) ||
                        ($test['critical_range_high'] && $num_value > $test['critical_range_high'])) {
                        $is_critical = true;
                        break;
                    }
                }
            }
        }
        
        if ($is_critical) {
            $this->db->where('id', $result_id);
            $this->db->update('lab_results', array('is_critical' => 1));
        }
        
        return $is_critical;
    }

    /**
     * Get abnormal results
     */
    public function get_abnormal_results($organization_id = null) {
        $filters = array('is_abnormal' => 1);
        if ($organization_id) {
            $filters['organization_id'] = $organization_id;
        }
        return $this->get_all($filters);
    }
}

