<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_surgery_charges_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get surgery charges by ID
     */
    public function get_by_id($id) {
        $this->db->select('sc.*, 
            p.name as patient_name, 
            p.patient_id as patient_code,
            ia.ipd_number,
            ots.procedure_name,
            ots.ot_number,
            ots.scheduled_date,
            ots.scheduled_time');
        $this->db->from('ipd_surgery_charges sc');
        $this->db->join('patients p', 'sc.patient_id = p.id', 'inner');
        $this->db->join('ipd_admissions ia', 'sc.admission_id = ia.id', 'inner');
        $this->db->join('ipd_ot_schedules ots', 'sc.ot_schedule_id = ots.id', 'inner');
        $this->db->where('sc.id', $id);
        $query = $this->db->get();
        return $query->row_array();
    }

    /**
     * Get surgery charges by OT schedule ID
     */
    public function get_by_ot_schedule($ot_schedule_id) {
        $this->db->where('ot_schedule_id', $ot_schedule_id);
        $query = $this->db->get('ipd_surgery_charges');
        return $query->row_array();
    }

    /**
     * Get surgery charges by admission ID
     */
    public function get_by_admission($admission_id) {
        $this->db->select('sc.*, 
            ots.procedure_name,
            ots.ot_number,
            ots.scheduled_date');
        $this->db->from('ipd_surgery_charges sc');
        $this->db->join('ipd_ot_schedules ots', 'sc.ot_schedule_id = ots.id', 'inner');
        $this->db->where('sc.admission_id', $admission_id);
        $this->db->order_by('sc.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Create surgery charges
     */
    public function create($data) {
        try {
            // Validate required fields
            if (empty($data['ot_schedule_id']) || empty($data['admission_id']) || empty($data['patient_id'])) {
                log_message('error', 'Ipd_surgery_charges_model->create(): Required fields missing');
                return false;
            }
            
            // Calculate subtotal
            $subtotal = 0;
            $subtotal += floatval($data['surgeon_fee'] ?? 0);
            $subtotal += floatval($data['assistant_surgeon_fee'] ?? 0);
            $subtotal += floatval($data['ot_room_charge'] ?? 0);
            $subtotal += floatval($data['ot_equipment_charge'] ?? 0);
            $subtotal += floatval($data['ot_overtime_charge'] ?? 0);
            $subtotal += floatval($data['anesthetist_fee'] ?? 0);
            $subtotal += floatval($data['anesthesia_type_charge'] ?? 0);
            $subtotal += floatval($data['anesthesia_duration_charge'] ?? 0);
            $subtotal += floatval($data['consumables_charge'] ?? 0);
            $subtotal += floatval($data['implants_charge'] ?? 0);
            $subtotal += floatval($data['procedure_final_charge'] ?? 0);
            
            // Calculate total
            $discount = floatval($data['discount'] ?? 0);
            $tax = floatval($data['tax'] ?? 0);
            $total_amount = $subtotal - $discount + $tax;
            
            // Calculate due amount
            $advance_paid = floatval($data['advance_paid'] ?? 0);
            $paid_amount = floatval($data['paid_amount'] ?? 0);
            $due_amount = $total_amount - $advance_paid - $paid_amount;
            
            // Determine payment status
            $payment_status = 'pending';
            if ($due_amount <= 0) {
                $payment_status = 'paid';
            } elseif ($paid_amount > 0 || $advance_paid > 0) {
                $payment_status = 'partial';
            }
            
            $insert_data = array(
                'ot_schedule_id' => intval($data['ot_schedule_id']),
                'procedure_id' => isset($data['procedure_id']) ? intval($data['procedure_id']) : null,
                'admission_id' => intval($data['admission_id']),
                'patient_id' => intval($data['patient_id']),
                'billing_id' => isset($data['billing_id']) ? intval($data['billing_id']) : null,
                
                // Surgeon Fees
                'surgeon_fee' => floatval($data['surgeon_fee'] ?? 0),
                'assistant_surgeon_fee' => floatval($data['assistant_surgeon_fee'] ?? 0),
                'surgeon_share_percentage' => isset($data['surgeon_share_percentage']) ? floatval($data['surgeon_share_percentage']) : null,
                'surgeon_share_amount' => floatval($data['surgeon_share_amount'] ?? 0),
                
                // OT Charges
                'ot_room_charge' => floatval($data['ot_room_charge'] ?? 0),
                'ot_equipment_charge' => floatval($data['ot_equipment_charge'] ?? 0),
                'ot_duration_hours' => floatval($data['ot_duration_hours'] ?? 0),
                'ot_rate_per_hour' => floatval($data['ot_rate_per_hour'] ?? 0),
                'ot_minimum_charge' => floatval($data['ot_minimum_charge'] ?? 0),
                'ot_overtime_charge' => floatval($data['ot_overtime_charge'] ?? 0),
                
                // Anesthesia Charges
                'anesthetist_fee' => floatval($data['anesthetist_fee'] ?? 0),
                'anesthesia_type_charge' => floatval($data['anesthesia_type_charge'] ?? 0),
                'anesthesia_duration_charge' => floatval($data['anesthesia_duration_charge'] ?? 0),
                
                // Consumables
                'consumables_charge' => floatval($data['consumables_charge'] ?? 0),
                'implants_charge' => floatval($data['implants_charge'] ?? 0),
                'consumables_details' => isset($data['consumables_details']) ? json_encode($data['consumables_details']) : null,
                
                // Procedure Charges
                'procedure_base_charge' => floatval($data['procedure_base_charge'] ?? 0),
                'procedure_complexity_multiplier' => floatval($data['procedure_complexity_multiplier'] ?? 1.00),
                'procedure_final_charge' => floatval($data['procedure_final_charge'] ?? 0),
                
                // Totals
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total_amount' => $total_amount,
                
                // Payment Status
                'advance_paid' => $advance_paid,
                'paid_amount' => $paid_amount,
                'due_amount' => $due_amount,
                'payment_status' => $payment_status,
                
                'created_by' => isset($data['created_by']) ? intval($data['created_by']) : null
            );
            
            if ($this->db->insert('ipd_surgery_charges', $insert_data)) {
                return $this->db->insert_id();
            }
            
            return false;
        } catch (Exception $e) {
            log_message('error', 'Ipd_surgery_charges_model->create() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update surgery charges
     */
    public function update($id, $data) {
        try {
            $update_data = array();
            $allowed_fields = array(
                'billing_id', 'surgeon_fee', 'assistant_surgeon_fee', 'surgeon_share_percentage', 'surgeon_share_amount',
                'ot_room_charge', 'ot_equipment_charge', 'ot_duration_hours', 'ot_rate_per_hour', 
                'ot_minimum_charge', 'ot_overtime_charge',
                'anesthetist_fee', 'anesthesia_type_charge', 'anesthesia_duration_charge',
                'consumables_charge', 'implants_charge', 'consumables_details',
                'procedure_base_charge', 'procedure_complexity_multiplier', 'procedure_final_charge',
                'discount', 'tax', 'advance_paid', 'paid_amount'
            );
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    if ($field === 'consumables_details') {
                        $update_data[$field] = json_encode($data[$field]);
                    } elseif (in_array($field, array('surgeon_share_percentage', 'procedure_complexity_multiplier', 
                        'ot_duration_hours', 'ot_rate_per_hour'))) {
                        $update_data[$field] = floatval($data[$field]);
                    } else {
                        $update_data[$field] = floatval($data[$field]);
                    }
                }
            }
            
            if (empty($update_data)) {
                return false;
            }
            
            // Recalculate totals if any charge fields changed
            $charge_fields = array('surgeon_fee', 'assistant_surgeon_fee', 'ot_room_charge', 'ot_equipment_charge',
                'ot_overtime_charge', 'anesthetist_fee', 'anesthesia_type_charge', 'anesthesia_duration_charge',
                'consumables_charge', 'implants_charge', 'procedure_final_charge', 'discount', 'tax');
            
            $needs_recalc = false;
            foreach ($charge_fields as $field) {
                if (isset($update_data[$field])) {
                    $needs_recalc = true;
                    break;
                }
            }
            
            if ($needs_recalc) {
                // Get current values
                $current = $this->get_by_id($id);
                if (!$current) {
                    return false;
                }
                
                // Merge current with updates
                $merged = array_merge($current, $update_data);
                
                // Recalculate
                $subtotal = 0;
                $subtotal += floatval($merged['surgeon_fee'] ?? 0);
                $subtotal += floatval($merged['assistant_surgeon_fee'] ?? 0);
                $subtotal += floatval($merged['ot_room_charge'] ?? 0);
                $subtotal += floatval($merged['ot_equipment_charge'] ?? 0);
                $subtotal += floatval($merged['ot_overtime_charge'] ?? 0);
                $subtotal += floatval($merged['anesthetist_fee'] ?? 0);
                $subtotal += floatval($merged['anesthesia_type_charge'] ?? 0);
                $subtotal += floatval($merged['anesthesia_duration_charge'] ?? 0);
                $subtotal += floatval($merged['consumables_charge'] ?? 0);
                $subtotal += floatval($merged['implants_charge'] ?? 0);
                $subtotal += floatval($merged['procedure_final_charge'] ?? 0);
                
                $discount = floatval($merged['discount'] ?? 0);
                $tax = floatval($merged['tax'] ?? 0);
                $total_amount = $subtotal - $discount + $tax;
                
                $advance_paid = floatval($merged['advance_paid'] ?? 0);
                $paid_amount = floatval($merged['paid_amount'] ?? 0);
                $due_amount = $total_amount - $advance_paid - $paid_amount;
                
                $payment_status = 'pending';
                if ($due_amount <= 0) {
                    $payment_status = 'paid';
                } elseif ($paid_amount > 0 || $advance_paid > 0) {
                    $payment_status = 'partial';
                }
                
                $update_data['subtotal'] = $subtotal;
                $update_data['total_amount'] = $total_amount;
                $update_data['due_amount'] = $due_amount;
                $update_data['payment_status'] = $payment_status;
            }
            
            $this->db->where('id', $id);
            return $this->db->update('ipd_surgery_charges', $update_data);
        } catch (Exception $e) {
            log_message('error', 'Ipd_surgery_charges_model->update() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete surgery charges
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('ipd_surgery_charges');
    }
}

