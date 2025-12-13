<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Prescription_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Generate unique prescription number
     */
    public function generate_prescription_number() {
        $prefix = 'RX';
        $this->db->select('prescription_number');
        $this->db->from('prescriptions');
        $this->db->like('prescription_number', $prefix, 'after');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get();
        
        if ($query->num_rows() > 0) {
            $last_number = $query->row()->prescription_number;
            $last_num = intval(substr($last_number, strlen($prefix)));
            $new_num = $last_num + 1;
        } else {
            $new_num = 1;
        }
        
        return $prefix . str_pad($new_num, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create prescription with medicines and lab tests
     */
    public function create($data) {
        $this->db->trans_start();

        // Generate prescription number
        $prescription_number = $this->generate_prescription_number();

        // Validate required fields
        if (empty($data['patient_id']) || (int)$data['patient_id'] <= 0) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'Invalid patient ID');
        }
        
        if (empty($data['doctor_id']) || (int)$data['doctor_id'] <= 0) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'Invalid doctor ID');
        }

        // Prepare prescription data
        $prescription_data = array(
            'prescription_number' => $prescription_number,
            'appointment_id' => isset($data['appointment_id']) && !empty($data['appointment_id']) ? (int)$data['appointment_id'] : null,
            'patient_id' => (int)$data['patient_id'],
            'doctor_id' => (int)$data['doctor_id'],
            'diagnosis' => $data['diagnosis'] ?? null,
            'chief_complaint' => $data['chief_complaint'] ?? null,
            'clinical_notes' => $data['clinical_notes'] ?? null,
            'advice' => $data['advice'] ?? null,
            'follow_up_date' => !empty($data['follow_up_date']) ? $data['follow_up_date'] : null,
            'status' => $data['status'] ?? 'Active',
            'created_by' => isset($data['created_by']) ? (int)$data['created_by'] : null,
            // Add vitals data
            'vitals_pulse' => isset($data['vitals_pulse']) && $data['vitals_pulse'] !== '' ? (int)$data['vitals_pulse'] : null,
            'vitals_temperature' => isset($data['vitals_temperature']) && $data['vitals_temperature'] !== '' ? (float)$data['vitals_temperature'] : null,
            'vitals_blood_pressure' => $data['vitals_blood_pressure'] ?? null,
            'vitals_respiratory_rate' => isset($data['vitals_respiratory_rate']) && $data['vitals_respiratory_rate'] !== '' ? (int)$data['vitals_respiratory_rate'] : null,
            'vitals_blood_sugar' => $data['vitals_blood_sugar'] ?? null,
            'vitals_weight' => $data['vitals_weight'] ?? null,
            'vitals_height' => $data['vitals_height'] ?? null,
            'vitals_bmi' => $data['vitals_bmi'] ?? null,
            'vitals_oxygen_saturation' => isset($data['vitals_oxygen_saturation']) && $data['vitals_oxygen_saturation'] !== '' ? (int)$data['vitals_oxygen_saturation'] : null,
            'vitals_body_surface_area' => $data['vitals_body_surface_area'] ?? null,
            // Add investigation data
            'investigation' => $data['investigation'] ?? null
        );

        if (!$this->db->insert('prescriptions', $prescription_data)) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'Failed to create prescription');
        }

        $prescription_id = $this->db->insert_id();

        // Add medicines
        if (!empty($data['medicines']) && is_array($data['medicines'])) {
            foreach ($data['medicines'] as $medicine) {
                $medicine_data = array(
                    'prescription_id' => $prescription_id,
                    'medicine_id' => isset($medicine['medicine_id']) && $medicine['medicine_id'] ? (int)$medicine['medicine_id'] : null,
                    'medicine_name' => $medicine['medicine_name'],
                    'dosage' => $medicine['dosage'] ?? null,
                    'frequency' => $medicine['frequency'] ?? null,
                    'duration' => $medicine['duration'] ?? null,
                    'quantity' => isset($medicine['quantity']) ? (int)$medicine['quantity'] : null,
                    'instructions' => $medicine['instructions'] ?? null,
                    'timing' => $medicine['timing'] ?? null,
                    'status' => 'Pending'
                );
                $this->db->insert('prescription_medicines', $medicine_data);
            }
        }

        // Add lab tests and create lab orders
        if (!empty($data['lab_tests']) && is_array($data['lab_tests'])) {
            // Create lab order for this prescription
            $this->load->model('Lab_order_model');
            $this->load->model('Lab_test_model');
            
            // Map priority from prescription format to lab order format
            $priority_map = array(
                'Normal' => 'routine',
                'Urgent' => 'urgent',
                'Emergency' => 'stat'
            );
            
            $lab_order_tests = array();
            foreach ($data['lab_tests'] as $test) {
                // Get test price if lab_test_id is provided
                $test_price = 0.00;
                $test_code = null;
                if (!empty($test['lab_test_id'])) {
                    $lab_test = $this->Lab_test_model->get_by_id($test['lab_test_id']);
                    if ($lab_test) {
                        $test_price = isset($lab_test['price']) ? $lab_test['price'] : 0.00;
                        $test_code = $lab_test['test_code'];
                    }
                }
                
                // Add to prescription_lab_tests
                $test_data = array(
                    'prescription_id' => $prescription_id,
                    'lab_test_id' => isset($test['lab_test_id']) && $test['lab_test_id'] ? (int)$test['lab_test_id'] : null,
                    'test_name' => $test['test_name'],
                    'test_type' => $test['test_type'] ?? null,
                    'instructions' => $test['instructions'] ?? null,
                    'priority' => $test['priority'] ?? 'Normal',
                    'status' => 'Pending'
                );
                $this->db->insert('prescription_lab_tests', $test_data);
                $prescription_test_id = $this->db->insert_id();
                
                // Prepare for lab order
                $lab_order_tests[] = array(
                    'lab_test_id' => isset($test['lab_test_id']) && $test['lab_test_id'] ? (int)$test['lab_test_id'] : null,
                    'test_name' => $test['test_name'],
                    'test_code' => $test_code,
                    'price' => $test_price,
                    'priority' => isset($priority_map[$test['priority'] ?? 'Normal']) ? $priority_map[$test['priority']] : 'routine',
                    'instructions' => $test['instructions'] ?? null
                );
            }
            
            // Create lab order if there are tests
            if (!empty($lab_order_tests)) {
                $order_data = array(
                    'patient_id' => (int)$data['patient_id'],
                    'order_type' => 'OPD',
                    'order_source_id' => $prescription_id,
                    'ordered_by_user_id' => isset($data['created_by']) ? (int)$data['created_by'] : null,
                    'priority' => isset($priority_map[$data['lab_tests'][0]['priority'] ?? 'Normal']) ? $priority_map[$data['lab_tests'][0]['priority']] : 'routine',
                    'tests' => $lab_order_tests,
                    'notes' => 'Created from prescription: ' . $prescription_number,
                    'organization_id' => isset($data['organization_id']) ? $data['organization_id'] : null
                );
                
                $lab_order_id = $this->Lab_order_model->create($order_data);
                
                // Link prescription_lab_tests to lab_order_tests
                if ($lab_order_id) {
                    $order = $this->Lab_order_model->get_by_id($lab_order_id);
                    if ($order && !empty($order['tests'])) {
                        // Update prescription_lab_tests with lab_order_test reference (if needed)
                        // This can be done via a linking table or by storing order_id in prescription_lab_tests
                    }
                }
            }
        }

        // Add radiology tests
        if (!empty($data['radiology_tests']) && is_array($data['radiology_tests'])) {
            foreach ($data['radiology_tests'] as $test) {
                $test_data = array(
                    'prescription_id' => $prescription_id,
                    'radiology_test_id' => isset($test['radiology_test_id']) && $test['radiology_test_id'] ? (int)$test['radiology_test_id'] : null,
                    'test_name' => $test['test_name'],
                    'test_type' => $test['test_type'] ?? null,
                    'body_part' => $test['body_part'] ?? null,
                    'indication' => $test['indication'] ?? null,
                    'instructions' => $test['instructions'] ?? null,
                    'priority' => $test['priority'] ?? 'Normal',
                    'status' => 'Pending'
                );
                $this->db->insert('prescription_radiology_tests', $test_data);
            }
        }

        // Create status tracking entries for future workflow
        $departments = array('Nurse', 'Lab', 'Pharmacy');
        foreach ($departments as $dept) {
            $tracking_data = array(
                'prescription_id' => $prescription_id,
                'department' => $dept,
                'status' => 'Pending'
            );
            $this->db->insert('prescription_status_tracking', $tracking_data);
        }

        // Update appointment status to "Completed" if appointment_id is provided
        if (!empty($prescription_data['appointment_id'])) {
            $this->db->where('id', $prescription_data['appointment_id']);
            $this->db->update('appointments', array('status' => 'Completed'));
        }

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return array('success' => false, 'message' => 'Transaction failed');
        }

        return array('success' => true, 'id' => $prescription_id, 'prescription_number' => $prescription_number);
    }

    /**
     * Get prescription by ID with medicines and lab tests
     */
    public function get_by_id($id) {
        // Get prescription
        $this->db->select('pr.*, p.name as patient_name, p.patient_id as patient_id_string, p.phone as patient_phone, p.email as patient_email, p.age, p.gender, d.name as doctor_name, d.specialty, a.appointment_date, a.appointment_number');
        $this->db->from('prescriptions pr');
        $this->db->join('patients p', 'pr.patient_id = p.id', 'left');
        $this->db->join('doctors d', 'pr.doctor_id = d.id', 'left');
        $this->db->join('appointments a', 'pr.appointment_id = a.id', 'left');
        $this->db->where('pr.id', $id);
        $query = $this->db->get();
        $prescription = $query->row_array();

        if (!$prescription) {
            return null;
        }

        // Get medicines
        $this->db->where('prescription_id', $id);
        $this->db->order_by('id', 'ASC');
        $medicines_query = $this->db->get('prescription_medicines');
        $prescription['medicines'] = $medicines_query->result_array();

        // Get lab tests
        $this->db->where('prescription_id', $id);
        $this->db->order_by('id', 'ASC');
        $tests_query = $this->db->get('prescription_lab_tests');
        $prescription['lab_tests'] = $tests_query->result_array();

        // Get radiology tests
        $this->db->where('prescription_id', $id);
        $this->db->order_by('id', 'ASC');
        $radiology_query = $this->db->get('prescription_radiology_tests');
        $prescription['radiology_tests'] = $radiology_query->result_array();

        return $prescription;
    }

    /**
     * Get all prescriptions with filters
     */
    public function get_all($filters = array()) {
        $this->db->select('pr.*, p.name as patient_name, p.patient_id as patient_id_string, d.name as doctor_name, d.specialty');
        $this->db->from('prescriptions pr');
        $this->db->join('patients p', 'pr.patient_id = p.id', 'left');
        $this->db->join('doctors d', 'pr.doctor_id = d.id', 'left');

        if (!empty($filters['patient_id'])) {
            $this->db->where('pr.patient_id', $filters['patient_id']);
        }

        if (!empty($filters['doctor_id'])) {
            $this->db->where('pr.doctor_id', $filters['doctor_id']);
        }

        if (!empty($filters['appointment_id'])) {
            $this->db->where('pr.appointment_id', $filters['appointment_id']);
        }

        if (!empty($filters['status'])) {
            $this->db->where('pr.status', $filters['status']);
        }

        $this->db->order_by('pr.created_at', 'DESC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Update prescription
     */
    public function update($id, $data) {
        $this->db->trans_start();

        $update_data = array();

        // Basic prescription fields
        if (isset($data['diagnosis'])) $update_data['diagnosis'] = $data['diagnosis'];
        if (isset($data['chief_complaint'])) $update_data['chief_complaint'] = $data['chief_complaint'];
        if (isset($data['clinical_notes'])) $update_data['clinical_notes'] = $data['clinical_notes'];
        if (isset($data['advice'])) $update_data['advice'] = $data['advice'];
        if (isset($data['follow_up_date'])) $update_data['follow_up_date'] = $data['follow_up_date'];
        if (isset($data['status'])) $update_data['status'] = $data['status'];

        // Vitals fields
        if (isset($data['vitals_pulse']) && $data['vitals_pulse'] !== '') $update_data['vitals_pulse'] = (int)$data['vitals_pulse'];
        if (isset($data['vitals_temperature']) && $data['vitals_temperature'] !== '') $update_data['vitals_temperature'] = (float)$data['vitals_temperature'];
        if (isset($data['vitals_blood_pressure'])) $update_data['vitals_blood_pressure'] = $data['vitals_blood_pressure'];
        if (isset($data['vitals_respiratory_rate']) && $data['vitals_respiratory_rate'] !== '') $update_data['vitals_respiratory_rate'] = (int)$data['vitals_respiratory_rate'];
        if (isset($data['vitals_blood_sugar'])) $update_data['vitals_blood_sugar'] = $data['vitals_blood_sugar'];
        if (isset($data['vitals_weight'])) $update_data['vitals_weight'] = $data['vitals_weight'];
        if (isset($data['vitals_height'])) $update_data['vitals_height'] = $data['vitals_height'];
        if (isset($data['vitals_bmi'])) $update_data['vitals_bmi'] = $data['vitals_bmi'];
        if (isset($data['vitals_oxygen_saturation']) && $data['vitals_oxygen_saturation'] !== '') $update_data['vitals_oxygen_saturation'] = (int)$data['vitals_oxygen_saturation'];
        if (isset($data['vitals_body_surface_area'])) $update_data['vitals_body_surface_area'] = $data['vitals_body_surface_area'];

        // Investigation field
        if (isset($data['investigation'])) $update_data['investigation'] = $data['investigation'];

        if (empty($update_data)) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'No data to update');
        }

        $this->db->where('id', $id);
        if (!$this->db->update('prescriptions', $update_data)) {
            $this->db->trans_rollback();
            return array('success' => false, 'message' => 'Failed to update prescription');
        }

        // Update medicines if provided
        if (isset($data['medicines']) && is_array($data['medicines'])) {
            // Delete existing medicines
            $this->db->where('prescription_id', $id);
            $this->db->delete('prescription_medicines');

            // Insert new medicines
            foreach ($data['medicines'] as $medicine) {
                $medicine_data = array(
                    'prescription_id' => $id,
                    'medicine_id' => isset($medicine['medicine_id']) && $medicine['medicine_id'] ? (int)$medicine['medicine_id'] : null,
                    'medicine_name' => $medicine['medicine_name'],
                    'dosage' => $medicine['dosage'] ?? null,
                    'frequency' => $medicine['frequency'] ?? null,
                    'duration' => $medicine['duration'] ?? null,
                    'quantity' => isset($medicine['quantity']) ? (int)$medicine['quantity'] : null,
                    'instructions' => $medicine['instructions'] ?? null,
                    'timing' => $medicine['timing'] ?? null,
                    'status' => 'Pending'
                );
                $this->db->insert('prescription_medicines', $medicine_data);
            }
        }

        // Update lab tests if provided
        if (isset($data['lab_tests']) && is_array($data['lab_tests'])) {
            // Delete existing lab tests
            $this->db->where('prescription_id', $id);
            $this->db->delete('prescription_lab_tests');

            // Insert new lab tests
            foreach ($data['lab_tests'] as $test) {
                $test_data = array(
                    'prescription_id' => $id,
                    'lab_test_id' => isset($test['lab_test_id']) && $test['lab_test_id'] ? (int)$test['lab_test_id'] : null,
                    'test_name' => $test['test_name'],
                    'test_type' => $test['test_type'] ?? null,
                    'instructions' => $test['instructions'] ?? null,
                    'priority' => $test['priority'] ?? 'Normal',
                    'status' => 'Pending'
                );
                $this->db->insert('prescription_lab_tests', $test_data);
            }
        }

        // Update radiology tests if provided
        if (isset($data['radiology_tests']) && is_array($data['radiology_tests'])) {
            // Delete existing radiology tests
            $this->db->where('prescription_id', $id);
            $this->db->delete('prescription_radiology_tests');

            // Insert new radiology tests
            foreach ($data['radiology_tests'] as $test) {
                $test_data = array(
                    'prescription_id' => $id,
                    'radiology_test_id' => isset($test['radiology_test_id']) && $test['radiology_test_id'] ? (int)$test['radiology_test_id'] : null,
                    'test_name' => $test['test_name'],
                    'test_type' => $test['test_type'] ?? null,
                    'body_part' => $test['body_part'] ?? null,
                    'indication' => $test['indication'] ?? null,
                    'instructions' => $test['instructions'] ?? null,
                    'priority' => $test['priority'] ?? 'Normal',
                    'status' => 'Pending'
                );
                $this->db->insert('prescription_radiology_tests', $test_data);
            }
        }

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return array('success' => false, 'message' => 'Failed to update prescription');
        }

        return array('success' => true);
    }
}

