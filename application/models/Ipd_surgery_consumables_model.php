<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ipd_surgery_consumables_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get consumable by ID
     */
    public function get_by_id($id) {
        $this->db->where('id', $id);
        $query = $this->db->get('ipd_surgery_consumables');
        return $query->row_array();
    }

    /**
     * Get consumables by OT schedule ID
     */
    public function get_by_ot_schedule($ot_schedule_id) {
        $this->db->where('ot_schedule_id', $ot_schedule_id);
        $this->db->order_by('created_at', 'ASC');
        $query = $this->db->get('ipd_surgery_consumables');
        return $query->result_array();
    }

    /**
     * Get consumables by surgery charges ID
     */
    public function get_by_surgery_charges($surgery_charges_id) {
        $this->db->where('surgery_charges_id', $surgery_charges_id);
        $this->db->order_by('created_at', 'ASC');
        $query = $this->db->get('ipd_surgery_consumables');
        return $query->result_array();
    }

    /**
     * Create consumable
     */
    public function create($data) {
        try {
            // Validate required fields
            if (empty($data['ot_schedule_id']) || empty($data['item_name']) || !isset($data['unit_price'])) {
                log_message('error', 'Ipd_surgery_consumables_model->create(): Required fields missing');
                return false;
            }
            
            $quantity = intval($data['quantity'] ?? 1);
            $unit_price = floatval($data['unit_price']);
            $total_price = $quantity * $unit_price;
            
            $insert_data = array(
                'ot_schedule_id' => intval($data['ot_schedule_id']),
                'surgery_charges_id' => isset($data['surgery_charges_id']) ? intval($data['surgery_charges_id']) : null,
                'item_name' => $data['item_name'],
                'item_type' => $data['item_type'] ?? 'other',
                'quantity' => $quantity,
                'unit_price' => $unit_price,
                'total_price' => $total_price,
                'serial_number' => isset($data['serial_number']) ? $data['serial_number'] : null,
                'batch_number' => isset($data['batch_number']) ? $data['batch_number'] : null,
                'notes' => isset($data['notes']) ? $data['notes'] : null
            );
            
            if ($this->db->insert('ipd_surgery_consumables', $insert_data)) {
                $consumable_id = $this->db->insert_id();
                
                // Update surgery charges consumables total if surgery_charges_id provided
                if (!empty($data['surgery_charges_id'])) {
                    $this->update_surgery_charges_consumables($data['surgery_charges_id']);
                }
                
                return $consumable_id;
            }
            
            return false;
        } catch (Exception $e) {
            log_message('error', 'Ipd_surgery_consumables_model->create() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update consumable
     */
    public function update($id, $data) {
        try {
            $update_data = array();
            $allowed_fields = array('surgery_charges_id', 'item_name', 'item_type', 'quantity', 
                'unit_price', 'serial_number', 'batch_number', 'notes');
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    if (in_array($field, array('quantity'))) {
                        $update_data[$field] = intval($data[$field]);
                    } elseif (in_array($field, array('unit_price'))) {
                        $update_data[$field] = floatval($data[$field]);
                    } else {
                        $update_data[$field] = $data[$field];
                    }
                }
            }
            
            if (empty($update_data)) {
                return false;
            }
            
            // Recalculate total_price if quantity or unit_price changed
            if (isset($update_data['quantity']) || isset($update_data['unit_price'])) {
                $current = $this->get_by_id($id);
                if (!$current) {
                    return false;
                }
                
                $quantity = isset($update_data['quantity']) ? $update_data['quantity'] : $current['quantity'];
                $unit_price = isset($update_data['unit_price']) ? $update_data['unit_price'] : $current['unit_price'];
                $update_data['total_price'] = $quantity * $unit_price;
            }
            
            $this->db->where('id', $id);
            $result = $this->db->update('ipd_surgery_consumables', $update_data);
            
            // Update surgery charges consumables total if surgery_charges_id changed or exists
            if ($result && (isset($update_data['surgery_charges_id']) || isset($data['surgery_charges_id']))) {
                $surgery_charges_id = isset($update_data['surgery_charges_id']) ? $update_data['surgery_charges_id'] : $data['surgery_charges_id'];
                if ($surgery_charges_id) {
                    $this->update_surgery_charges_consumables($surgery_charges_id);
                }
            }
            
            return $result;
        } catch (Exception $e) {
            log_message('error', 'Ipd_surgery_consumables_model->update() Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete consumable
     */
    public function delete($id) {
        // Get consumable to find surgery_charges_id before deleting
        $consumable = $this->get_by_id($id);
        
        $this->db->where('id', $id);
        $result = $this->db->delete('ipd_surgery_consumables');
        
        // Update surgery charges consumables total if surgery_charges_id exists
        if ($result && !empty($consumable['surgery_charges_id'])) {
            $this->update_surgery_charges_consumables($consumable['surgery_charges_id']);
        }
        
        return $result;
    }

    /**
     * Update surgery charges consumables total
     */
    private function update_surgery_charges_consumables($surgery_charges_id) {
        $this->load->model('Ipd_surgery_charges_model');
        
        $consumables = $this->get_by_surgery_charges($surgery_charges_id);
        $total_consumables = 0;
        $total_implants = 0;
        $consumables_details = array();
        
        foreach ($consumables as $consumable) {
            $total_consumables += floatval($consumable['total_price']);
            
            if ($consumable['item_type'] === 'implant') {
                $total_implants += floatval($consumable['total_price']);
            }
            
            $consumables_details[] = array(
                'item_name' => $consumable['item_name'],
                'item_type' => $consumable['item_type'],
                'quantity' => $consumable['quantity'],
                'unit_price' => $consumable['unit_price'],
                'total_price' => $consumable['total_price'],
                'serial_number' => $consumable['serial_number'],
                'batch_number' => $consumable['batch_number']
            );
        }
        
        // Update surgery charges
        $this->Ipd_surgery_charges_model->update($surgery_charges_id, array(
            'consumables_charge' => $total_consumables - $total_implants,
            'implants_charge' => $total_implants,
            'consumables_details' => $consumables_details
        ));
    }
}

