<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// Load the base Api controller
require_once(APPPATH . 'controllers/Api.php');

/**
 * IPD Management API Controller
 */
class Ipd extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Ipd_admission_model');
        $this->load->model('Ipd_ward_model');
        $this->load->model('Ipd_bed_model');
        $this->load->model('Ipd_room_model');
        $this->load->model('Ipd_vital_sign_model');
        $this->load->model('Ipd_treatment_order_model');
        $this->load->model('Ipd_nursing_note_model');
        $this->load->model('Ipd_billing_model');
        $this->load->model('Ipd_discharge_model');
        $this->load->model('Ipd_transfer_model');
        $this->load->model('Ipd_rehabilitation_request_model');
        $this->load->model('Ipd_admission_request_model');
        $this->load->model('Ipd_duty_roster_model');
        $this->load->model('Ipd_ot_schedule_model');
        $this->load->model('Ipd_surgery_charges_model');
        $this->load->model('Ipd_surgery_consumables_model');
        $this->load->model('Ipd_pre_op_checklist_model');
        $this->load->library('PaymentProcessor');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Dashboard statistics
     * GET /api/ipd/dashboard
     */
    public function dashboard() {
        try {
            $stats = $this->Ipd_admission_model->get_dashboard_stats();
            
            // Get admission and discharge trends
            $admission_trend = $this->Ipd_admission_model->get_admission_trend(7);
            $discharge_trend = $this->Ipd_admission_model->get_discharge_trend(7);
            
            // Get department distribution
            $department_dist = $this->Ipd_admission_model->get_department_distribution();
            
            // Get ward occupancy
            $wards = $this->Ipd_ward_model->get_all();
            
            $this->success(array(
                'stats' => $stats,
                'admission_trend' => $admission_trend,
                'discharge_trend' => $discharge_trend,
                'department_distribution' => $department_dist,
                'wards' => $wards
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD dashboard error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all admissions or create new admission
     * GET /api/ipd/admissions
     * POST /api/ipd/admissions
     */
    public function admissions($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing IPD admissions
                if (!$this->requirePermission('doctor.view_all_patients')) {
                    return;
                }
                
                if ($id) {
                    // Get single admission
                    $admission = $this->Ipd_admission_model->get_by_id($id);
                    if ($admission) {
                        // Get related data
                        $admission['vital_signs'] = $this->Ipd_vital_sign_model->get_by_admission($id);
                        $admission['treatment_orders'] = $this->Ipd_treatment_order_model->get_by_admission($id);
                        $admission['nursing_notes'] = $this->Ipd_nursing_note_model->get_by_admission($id);
                        $admission['billing'] = $this->Ipd_billing_model->get_by_admission($id);
                        $admission['discharge'] = $this->Ipd_discharge_model->get_by_admission($id);
                        $admission['transfers'] = $this->Ipd_transfer_model->get_by_admission($id);
                        
                        $this->success($admission);
                    } else {
                        $this->error('Admission not found', 404);
                    }
                } else {
                    // Get all admissions with filters
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'ward_id' => $this->input->get('ward_id'),
                        'department' => $this->input->get('department'),
                        'admission_type' => $this->input->get('admission_type'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to')
                    );
                    
                    $admissions = $this->Ipd_admission_model->get_all($filters);
                    $this->success($admissions);
                }
            } elseif ($method === 'POST') {
                // Check permission for creating IPD admissions
                if (!$this->requirePermission('doctor.view_all_patients')) {
                    return;
                }
                $this->create_admission();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                // Check permission for updating IPD admissions
                if (!$this->requirePermission('doctor.view_all_patients')) {
                    return;
                }
                
                if (!$id) {
                    $this->error('Admission ID is required', 400);
                    return;
                }
                $this->update_admission($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD admissions error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new admission
     */
    private function create_admission() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['patient_id'])) {
            $this->error('Patient ID is required', 400);
            return;
        }
        
        if (empty($data['admission_date'])) {
            $this->error('Admission date is required', 400);
            return;
        }
        
        // Get current user ID
        if ($this->user && isset($this->user['id'])) {
            $data['admitted_by_user_id'] = $this->user['id'];
            $data['created_by'] = $this->user['id'];
        }
        
        $admission_id = $this->Ipd_admission_model->create($data);
        
        if ($admission_id) {
            $admission = $this->Ipd_admission_model->get_by_id($admission_id);
            
            // Log admission creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('IPD Management', 'Admission', $admission_id, "Created IPD admission for patient ID: {$data['patient_id']}");
            
            $this->success($admission, 'Patient admitted successfully');
        } else {
            $this->error('Failed to create admission', 400);
        }
    }

    /**
     * Update admission
     */
    private function update_admission($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_admission = $this->Ipd_admission_model->get_by_id($id);
        $result = $this->Ipd_admission_model->update($id, $data);
        
        if ($result) {
            $admission = $this->Ipd_admission_model->get_by_id($id);
            
            // Log admission update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('IPD Management', 'Admission', $id, "Updated IPD admission ID: {$id}", $old_admission, $admission);
            
            $this->success($admission, 'Admission updated successfully');
        } else {
            $this->error('Failed to update admission', 400);
        }
    }

    /**
     * Get all wards
     * GET /api/ipd/wards
     */
    public function wards($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    $ward = $this->Ipd_ward_model->get_by_id($id);
                    if ($ward) {
                        $ward['stats'] = $this->Ipd_ward_model->get_statistics($id);
                        $ward['beds'] = $this->Ipd_bed_model->get_by_ward($id);
                        $this->success($ward);
                    } else {
                        $this->error('Ward not found', 404);
                    }
                } else {
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'type' => $this->input->get('type')
                    );
                    
                    $wards = $this->Ipd_ward_model->get_all($filters);
                    $this->success($wards);
                }
            } elseif ($method === 'POST') {
                $this->create_ward();
            } elseif (($method === 'PUT' || $method === 'PATCH') && $id) {
                $this->update_ward($id);
            } elseif ($method === 'DELETE' && $id) {
                $this->delete_ward($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD wards error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get beds in ward
     * GET /api/ipd/wards/:id/beds
     */
    public function ward_beds($ward_id) {
        try {
            if (!$ward_id) {
                $this->error('Ward ID is required', 400);
                return;
            }
            
            $beds = $this->Ipd_bed_model->get_by_ward($ward_id);
            $this->success($beds);
        } catch (Exception $e) {
            log_message('error', 'IPD ward beds error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all beds
     * GET /api/ipd/beds
     */
    public function beds($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    $bed = $this->Ipd_bed_model->get_by_id($id);
                    if ($bed) {
                        $this->success($bed);
                    } else {
                        $this->error('Bed not found', 404);
                    }
                } else {
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'ward_id' => $this->input->get('ward_id'),
                        'bed_type' => $this->input->get('bed_type')
                    );
                    
                    $beds = $this->Ipd_bed_model->get_all($filters);
                    $this->success($beds);
                }
            } elseif ($method === 'POST') {
                $this->create_bed();
            } elseif (($method === 'PUT' || $method === 'PATCH') && $id) {
                $this->update_bed($id);
            } elseif ($method === 'DELETE' && $id) {
                $this->delete_bed($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD beds error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available beds
     * GET /api/ipd/beds/available
     */
    public function available_beds() {
        try {
            $filters = array(
                'ward_id' => $this->input->get('ward_id'),
                'bed_type' => $this->input->get('bed_type')
            );
            
            $beds = $this->Ipd_bed_model->get_available($filters);
            $this->success($beds);
        } catch (Exception $e) {
            log_message('error', 'IPD available beds error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all rooms
     * GET /api/ipd/rooms
     */
    public function rooms($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    $room = $this->Ipd_room_model->get_by_id($id);
                    if ($room) {
                        $this->success($room);
                    } else {
                        $this->error('Room not found', 404);
                    }
                } else {
                    $filters = array(
                        'search' => $this->input->get('search'),
                        'status' => $this->input->get('status'),
                        'room_type' => $this->input->get('room_type'),
                        'floor_id' => $this->input->get('floor_id')
                    );
                    
                    $rooms = $this->Ipd_room_model->get_all($filters);
                    $this->success($rooms);
                }
            } elseif ($method === 'POST') {
                $this->create_room();
            } elseif (($method === 'PUT' || $method === 'PATCH') && $id) {
                $this->update_room($id);
            } elseif ($method === 'DELETE' && $id) {
                $this->delete_room($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD rooms error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available rooms
     * GET /api/ipd/rooms/available
     */
    public function available_rooms() {
        try {
            $filters = array(
                'room_type' => $this->input->get('room_type'),
                'floor_id' => $this->input->get('floor_id')
            );
            
            $rooms = $this->Ipd_room_model->get_available($filters);
            $this->success($rooms);
        } catch (Exception $e) {
            log_message('error', 'IPD available rooms error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Duty Roster Management
     * GET /api/ipd/duty-roster
     * POST /api/ipd/duty-roster
     * PUT /api/ipd/duty-roster/:id
     * DELETE /api/ipd/duty-roster/:id
     */
    public function duty_roster($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single roster entry
                    $roster = $this->Ipd_duty_roster_model->get_by_id($id);
                    if ($roster) {
                        $this->success($roster);
                    } else {
                        $this->error('Roster entry not found', 404);
                    }
                } else {
                    // Get all roster entries with filters
                    $filters = array(
                        'user_id' => $this->input->get('user_id'),
                        'date' => $this->input->get('date'),
                        'date_from' => $this->input->get('date_from'),
                        'date_to' => $this->input->get('date_to'),
                        'shift_type' => $this->input->get('shift_type'),
                        'status' => $this->input->get('status'),
                        'ward_id' => $this->input->get('ward_id'),
                        'department_id' => $this->input->get('department_id'),
                        'search' => $this->input->get('search')
                    );
                    
                    $roster = $this->Ipd_duty_roster_model->get_all($filters);
                    $this->success($roster);
                }
            } elseif ($method === 'POST') {
                // Create roster entry
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['created_by'] = $this->user['id'];
                }
                
                $roster_id = $this->Ipd_duty_roster_model->create($data);
                if ($roster_id) {
                    $roster = $this->Ipd_duty_roster_model->get_by_id($roster_id);
                    
                    // Log duty roster creation
                    $this->load->library('audit_log');
                    $user_id = $data['user_id'] ?? 'Unknown';
                    $this->audit_log->logCreate('IPD Management', 'Duty Roster', $roster_id, "Created duty roster entry for User ID: {$user_id}");
                    
                    $this->success($roster, 'Roster entry created successfully');
                } else {
                    $this->error('Failed to create roster entry', 400);
                }
            } elseif (($method === 'PUT' || $method === 'PATCH') && $id) {
                // Update roster entry
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->put();
                }
                
                $old_roster = $this->Ipd_duty_roster_model->get_by_id($id);
                if ($this->Ipd_duty_roster_model->update($id, $data)) {
                    $roster = $this->Ipd_duty_roster_model->get_by_id($id);
                    
                    // Log duty roster update
                    $this->load->library('audit_log');
                    $this->audit_log->logUpdate('IPD Management', 'Duty Roster', $id, "Updated duty roster entry ID: {$id}", $old_roster, $roster);
                    
                    $this->success($roster, 'Roster entry updated successfully');
                } else {
                    $this->error('Failed to update roster entry', 400);
                }
            } elseif ($method === 'DELETE' && $id) {
                // Delete roster entry
                $roster = $this->Ipd_duty_roster_model->get_by_id($id);
                if ($this->Ipd_duty_roster_model->delete($id)) {
                    // Log duty roster deletion
                    $this->load->library('audit_log');
                    $this->audit_log->logDelete('IPD Management', 'Duty Roster', $id, "Deleted duty roster entry ID: {$id}");
                    
                    $this->success(null, 'Roster entry deleted successfully');
                } else {
                    $this->error('Failed to delete roster entry', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD duty roster error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Record vital signs
     * POST /api/ipd/admissions/:id/vitals
     * GET /api/ipd/admissions/:id/vitals
     */
    public function vitals($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $vitals = $this->Ipd_vital_sign_model->get_by_admission($admission_id);
                $this->success($vitals);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Get admission to get patient_id
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                
                if ($this->user && isset($this->user['id'])) {
                    $data['recorded_by_user_id'] = $this->user['id'];
                }
                
                $vital_id = $this->Ipd_vital_sign_model->create($data);
                if ($vital_id) {
                    $vital = $this->Ipd_vital_sign_model->get_by_id($vital_id);
                    
                    // Log vital signs recording
                    $this->load->library('audit_log');
                    $vital_details = array();
                    if (isset($data['temperature'])) $vital_details[] = "Temp: {$data['temperature']}";
                    if (isset($data['blood_pressure_systolic']) && isset($data['blood_pressure_diastolic'])) {
                        $vital_details[] = "BP: {$data['blood_pressure_systolic']}/{$data['blood_pressure_diastolic']}";
                    }
                    if (isset($data['heart_rate'])) $vital_details[] = "HR: {$data['heart_rate']}";
                    if (isset($data['respiratory_rate'])) $vital_details[] = "RR: {$data['respiratory_rate']}";
                    if (isset($data['oxygen_saturation'])) $vital_details[] = "SpO2: {$data['oxygen_saturation']}";
                    $details_str = !empty($vital_details) ? implode(', ', $vital_details) : 'Vital signs recorded';
                    $this->audit_log->logCreate('IPD Management', 'Vital Signs', $vital_id, "Recorded vital signs for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id}) - {$details_str}");
                    
                    $this->success($vital, 'Vital signs recorded successfully');
                } else {
                    $this->error('Failed to record vital signs', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD vitals error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Treatment orders
     * POST /api/ipd/admissions/:id/orders
     * GET /api/ipd/admissions/:id/orders
     */
    public function orders($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $orders = $this->Ipd_treatment_order_model->get_by_admission($admission_id);
                $this->success($orders);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Get admission to get patient_id
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                
                if ($this->user && isset($this->user['id']) && !empty($data['ordered_by_doctor_id'])) {
                    // If doctor_id not provided, try to get from user
                    // This assumes user can be linked to doctor
                }
                
                $order_id = $this->Ipd_treatment_order_model->create($data);
                if ($order_id) {
                    $order = $this->Ipd_treatment_order_model->get_by_id($order_id);
                    
                    // Log treatment order creation
                    $this->load->library('audit_log');
                    $order_type = $order['order_type'] ?? 'Treatment';
                    $this->audit_log->logCreate('IPD Management', 'Treatment Order', $order_id, "Created treatment order: {$order_type} for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id})");
                    
                    $this->success($order, 'Treatment order created successfully');
                } else {
                    $this->error('Failed to create treatment order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD orders error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Nursing notes
     * POST /api/ipd/admissions/:id/nursing-notes
     * GET /api/ipd/admissions/:id/nursing-notes
     */
    public function nursing_notes($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $notes = $this->Ipd_nursing_note_model->get_by_admission($admission_id);
                $this->success($notes);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Get admission to get patient_id
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                
                if ($this->user && isset($this->user['id'])) {
                    $data['nurse_user_id'] = $this->user['id'];
                }
                
                $note_id = $this->Ipd_nursing_note_model->create($data);
                if ($note_id) {
                    $note = $this->Ipd_nursing_note_model->get_by_id($note_id);
                    
                    // Log nursing note creation
                    $this->load->library('audit_log');
                    $note_preview = isset($data['note']) ? substr($data['note'], 0, 50) : 'Nursing note';
                    $this->audit_log->logCreate('IPD Management', 'Nursing Note', $note_id, "Added nursing note for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id}) - {$note_preview}...");
                    
                    $this->success($note, 'Nursing note added successfully');
                } else {
                    $this->error('Failed to add nursing note', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD nursing notes error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Billing
     * GET /api/ipd/admissions/:id/billing
     */
    public function billing($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $billing = $this->Ipd_billing_model->get_by_admission($admission_id);
                if (!$billing) {
                    // Calculate billing if not exists
                    $billing_data = $this->Ipd_billing_model->calculate_billing($admission_id);
                    if ($billing_data) {
                        $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                        $billing_data['patient_id'] = $admission['patient_id'];
                        if ($this->user && isset($this->user['id'])) {
                            $billing_data['created_by'] = $this->user['id'];
                        }
                        $billing_id = $this->Ipd_billing_model->create_or_update($admission_id, $billing_data);
                        $billing = $this->Ipd_billing_model->get_by_id($billing_id);
                    }
                }
                $this->success($billing);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD billing error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Record payment
     * POST /api/ipd/admissions/:id/billing/payment
     */
    public function billing_payment($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                if (empty($data['payment_amount'])) {
                    $this->error('Payment amount is required', 400);
                    return;
                }
                
                $result = $this->Ipd_billing_model->record_payment(
                    $admission_id,
                    $data['payment_amount'],
                    $data['payment_mode'] ?? 'Cash'
                );
                
                if ($result) {
                    // Get admission info
                    $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                    $patient_id = $admission ? $admission['patient_id'] : 'Unknown';
                    $payment_amount = $data['payment_amount'];
                    $payment_mode = $data['payment_mode'] ?? 'Cash';
                    
                    // Log payment
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('IPD Management', 'Payment', $result, "Recorded payment: {$payment_amount} ({$payment_mode}) for patient ID: {$patient_id} (Admission ID: {$admission_id})");
                    
                    $billing = $this->Ipd_billing_model->get_by_admission($admission_id);
                    $this->success($billing, 'Payment recorded successfully');
                } else {
                    $this->error('Failed to record payment', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD billing payment error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Discharge
     * POST /api/ipd/admissions/:id/discharge
     * GET /api/ipd/admissions/:id/discharge
     */
    public function discharge($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $discharge = $this->Ipd_discharge_model->get_by_admission($admission_id);
                $this->success($discharge);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Validate required fields
                if (empty($data['final_diagnosis'])) {
                    $this->error('Final diagnosis is required', 400);
                    return;
                }
                
                if (empty($data['treatment_given'])) {
                    $this->error('Treatment given is required', 400);
                    return;
                }
                
                if (empty($data['condition_at_discharge'])) {
                    $this->error('Condition at discharge is required', 400);
                    return;
                }
                
                if (empty($data['discharge_advice'])) {
                    $this->error('Discharge advice is required', 400);
                    return;
                }
                
                // Get admission to get patient_id
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['admitting_diagnosis'] = $admission['diagnosis'];
                
                if ($this->user && isset($this->user['id'])) {
                    $data['created_by'] = $this->user['id'];
                }
                
                $discharge_id = $this->Ipd_discharge_model->create($data);
                if ($discharge_id) {
                    $discharge = $this->Ipd_discharge_model->get_by_id($discharge_id);
                    
                    // Get admission info
                    $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                    $patient_id = $admission ? $admission['patient_id'] : 'Unknown';
                    
                    // Log discharge
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('IPD Management', 'Discharge', $discharge_id, "Discharged patient ID: {$patient_id} (Admission ID: {$admission_id})");
                    
                    $this->success($discharge, 'Patient discharged successfully');
                } else {
                    $this->error('Failed to create discharge summary', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD discharge error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all discharges
     * GET /api/ipd/discharges
     */
    public function discharges() {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Check permission for viewing IPD discharges
                if (!$this->requirePermission('doctor.view_all_patients')) {
                    return;
                }
                
                $filters = array(
                    'search' => $this->input->get('search'),
                    'date_from' => $this->input->get('date_from'),
                    'date_to' => $this->input->get('date_to')
                );
                
                $discharges = $this->Ipd_discharge_model->get_all($filters);
                $this->success($discharges);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD discharges list error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Transfer patient
     * POST /api/ipd/admissions/:id/transfer
     * GET /api/ipd/admissions/:id/transfers
     */
    public function transfer($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $transfers = $this->Ipd_transfer_model->get_by_admission($admission_id);
                $this->success($transfers);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                // Get admission to get current bed/room and patient_id
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                // Set from locations
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['from_ward_id'] = $admission['ward_id'];
                $data['from_bed_id'] = $admission['bed_id'];
                $data['from_room_id'] = $admission['room_id'];
                
                // Validate to locations
                if (empty($data['to_ward_id']) && empty($data['to_room_id'])) {
                    $this->error('Destination ward or room is required', 400);
                    return;
                }
                
                if ($this->user && isset($this->user['id'])) {
                    $data['transferred_by_user_id'] = $this->user['id'];
                }
                
                $transfer_id = $this->Ipd_transfer_model->create($data);
                if ($transfer_id) {
                    $transfer = $this->Ipd_transfer_model->get_by_id($transfer_id);
                    
                    // Get admission info
                    $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                    $patient_id = $admission ? $admission['patient_id'] : 'Unknown';
                    $from_ward = isset($data['from_ward_id']) ? "Ward {$data['from_ward_id']}" : 'Unknown';
                    $to_ward = isset($data['to_ward_id']) ? "Ward {$data['to_ward_id']}" : 'Unknown';
                    
                    // Log transfer
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('IPD Management', 'Transfer', $transfer_id, "Transferred patient ID: {$patient_id} (Admission ID: {$admission_id}) from {$from_ward} to {$to_ward}");
                    
                    $this->success($transfer, 'Patient transferred successfully');
                } else {
                    $this->error('Failed to transfer patient', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD transfer error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Stats endpoint
     * GET /api/ipd/stats
     */
    public function stats() {
        try {
            $stats = $this->Ipd_admission_model->get_dashboard_stats();
            $this->success($stats);
        } catch (Exception $e) {
            log_message('error', 'IPD stats error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============= PRIVATE HELPER METHODS =============

    private function create_ward() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        $ward_id = $this->Ipd_ward_model->create($data);
        if ($ward_id) {
            $ward = $this->Ipd_ward_model->get_by_id($ward_id);
            
            // Log ward creation
            $this->load->library('audit_log');
            $ward_name = $ward['ward_name'] ?? 'Unknown';
            $this->audit_log->logCreate('IPD Management', 'Ward', $ward_id, "Created ward: {$ward_name}");
            
            $this->success($ward, 'Ward created successfully');
        } else {
            $this->error('Failed to create ward', 400);
        }
    }

    private function update_ward($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_ward = $this->Ipd_ward_model->get_by_id($id);
        $result = $this->Ipd_ward_model->update($id, $data);
        if ($result) {
            $ward = $this->Ipd_ward_model->get_by_id($id);
            
            // Log ward update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('IPD Management', 'Ward', $id, "Updated ward ID: {$id}", $old_ward, $ward);
            
            $this->success($ward, 'Ward updated successfully');
        } else {
            $this->error('Failed to update ward', 400);
        }
    }

    private function delete_ward($id) {
        $ward = $this->Ipd_ward_model->get_by_id($id);
        $result = $this->Ipd_ward_model->delete($id);
        if ($result) {
            // Log ward deletion
            $this->load->library('audit_log');
            $ward_name = $ward ? ($ward['ward_name'] ?? 'Unknown') : 'Unknown';
            $this->audit_log->logDelete('IPD Management', 'Ward', $id, "Deleted ward: {$ward_name}");
            
            $this->success(null, 'Ward deleted successfully');
        } else {
            $this->error('Failed to delete ward', 400);
        }
    }

    private function create_bed() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        $bed_id = $this->Ipd_bed_model->create($data);
        if ($bed_id) {
            $bed = $this->Ipd_bed_model->get_by_id($bed_id);
            
            // Log bed creation
            $this->load->library('audit_log');
            $bed_number = $bed['bed_number'] ?? 'Unknown';
            $ward_id = $bed['ward_id'] ?? 'Unknown';
            $this->audit_log->logCreate('IPD Management', 'Bed', $bed_id, "Created bed: {$bed_number} in Ward {$ward_id}");
            
            $this->success($bed, 'Bed created successfully');
        } else {
            $this->error('Failed to create bed', 400);
        }
    }

    private function update_bed($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_bed = $this->Ipd_bed_model->get_by_id($id);
        $result = $this->Ipd_bed_model->update($id, $data);
        if ($result) {
            $bed = $this->Ipd_bed_model->get_by_id($id);
            
            // Log bed update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('IPD Management', 'Bed', $id, "Updated bed ID: {$id}", $old_bed, $bed);
            
            $this->success($bed, 'Bed updated successfully');
        } else {
            $this->error('Failed to update bed', 400);
        }
    }

    private function delete_bed($id) {
        $bed = $this->Ipd_bed_model->get_by_id($id);
        $result = $this->Ipd_bed_model->delete($id);
        if ($result) {
            // Log bed deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('IPD Management', 'Bed', $id, "Deleted bed ID: {$id}");
            
            $this->success(null, 'Bed deleted successfully');
        } else {
            $this->error('Failed to delete bed', 400);
        }
    }

    private function create_room() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        $room_id = $this->Ipd_room_model->create($data);
        if ($room_id) {
            $room = $this->Ipd_room_model->get_by_id($room_id);
            
            // Log room creation
            $this->load->library('audit_log');
            $room_number = $room['room_number'] ?? 'Unknown';
            $this->audit_log->logCreate('IPD Management', 'Room', $room_id, "Created room: {$room_number}");
            
            $this->success($room, 'Room created successfully');
        } else {
            $this->error('Failed to create room', 400);
        }
    }

    private function update_room($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_room = $this->Ipd_room_model->get_by_id($id);
        $result = $this->Ipd_room_model->update($id, $data);
        if ($result) {
            $room = $this->Ipd_room_model->get_by_id($id);
            
            // Log room update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('IPD Management', 'Room', $id, "Updated room ID: {$id}", $old_room, $room);
            
            $this->success($room, 'Room updated successfully');
        } else {
            $this->error('Failed to update room', 400);
        }
    }

    private function delete_room($id) {
        $room = $this->Ipd_room_model->get_by_id($id);
        $result = $this->Ipd_room_model->delete($id);
        if ($result) {
            // Log room deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('IPD Management', 'Room', $id, "Deleted room ID: {$id}");
            
            $this->success(null, 'Room deleted successfully');
        } else {
            $this->error('Failed to delete room', 400);
        }
    }

    /**
     * Rehabilitation Requests
     * GET /api/ipd/rehabilitation-requests
     * POST /api/ipd/rehabilitation-requests
     */
    public function rehabilitation_requests($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single request
                    $request = $this->Ipd_rehabilitation_request_model->get_by_id($id);
                    if ($request) {
                        $this->success($request);
                    } else {
                        $this->error('Rehabilitation request not found', 404);
                    }
                } else {
                    // Get all requests with filters
                    $filters = array(
                        'status' => $this->input->get('status'),
                        'admission_id' => $this->input->get('admission_id'),
                        'patient_id' => $this->input->get('patient_id'),
                        'service_type' => $this->input->get('service_type'),
                        'search' => $this->input->get('search')
                    );
                    
                    $requests = $this->Ipd_rehabilitation_request_model->get_all($filters);
                    $stats = $this->Ipd_rehabilitation_request_model->get_stats();
                    
                    $this->success(array(
                        'requests' => $requests,
                        'stats' => $stats
                    ));
                }
            } elseif ($method === 'POST') {
                $this->create_rehabilitation_request();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$id) {
                    $this->error('Request ID is required', 400);
                    return;
                }
                $this->update_rehabilitation_request($id);
            } elseif ($method === 'DELETE') {
                if (!$id) {
                    $this->error('Request ID is required', 400);
                    return;
                }
                $this->delete_rehabilitation_request($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD rehabilitation requests error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    private function create_rehabilitation_request() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (empty($data['patient_id'])) {
            $this->error('Patient ID is required', 400);
            return;
        }
        
        if (empty($data['service_type'])) {
            $this->error('Service type is required', 400);
            return;
        }
        
        if ($this->user && isset($this->user['id'])) {
            $data['created_by'] = $this->user['id'];
        }
        
        $request_id = $this->Ipd_rehabilitation_request_model->create($data);
        if ($request_id) {
            $request = $this->Ipd_rehabilitation_request_model->get_by_id($request_id);
            
            // Log rehabilitation request creation
            $this->load->library('audit_log');
            $service_type = $data['service_type'] ?? 'Unknown';
            $admission_id = $data['admission_id'] ?? 'N/A';
            $this->audit_log->logCreate('IPD Management', 'Rehabilitation Request', $request_id, "Created rehabilitation request: {$service_type} for patient ID: {$data['patient_id']}" . ($admission_id !== 'N/A' ? " (Admission ID: {$admission_id})" : ""));
            
            $this->success($request, 'Rehabilitation request created successfully');
        } else {
            $this->error('Failed to create rehabilitation request', 400);
        }
    }

    private function update_rehabilitation_request($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_request = $this->Ipd_rehabilitation_request_model->get_by_id($id);
        $result = $this->Ipd_rehabilitation_request_model->update($id, $data);
        if ($result) {
            $request = $this->Ipd_rehabilitation_request_model->get_by_id($id);
            
            // Log rehabilitation request update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('IPD Management', 'Rehabilitation Request', $id, "Updated rehabilitation request ID: {$id}", $old_request, $request);
            
            $this->success($request, 'Rehabilitation request updated successfully');
        } else {
            $this->error('Failed to update rehabilitation request', 400);
        }
    }

    private function delete_rehabilitation_request($id) {
        $request = $this->Ipd_rehabilitation_request_model->get_by_id($id);
        $result = $this->Ipd_rehabilitation_request_model->delete($id);
        if ($result) {
            // Log rehabilitation request deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('IPD Management', 'Rehabilitation Request', $id, "Deleted rehabilitation request ID: {$id}");
            
            $this->success(null, 'Rehabilitation request deleted successfully');
        } else {
            $this->error('Failed to delete rehabilitation request', 400);
        }
    }

    /**
     * Admission Requests (from doctors)
     * GET /api/ipd/admission-requests
     * POST /api/ipd/admission-requests
     */
    public function admission_requests($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single request
                    $request = $this->Ipd_admission_request_model->get_by_id($id);
                    if ($request) {
                        $this->success($request);
                    } else {
                        $this->error('Admission request not found', 404);
                    }
                } else {
                    // Get all requests with filters
                    $filters = array(
                        'status' => $this->input->get('status'),
                        'priority' => $this->input->get('priority'),
                        'department' => $this->input->get('department'),
                        'doctor_id' => $this->input->get('doctor_id'),
                        'patient_id' => $this->input->get('patient_id'),
                        'search' => $this->input->get('search')
                    );
                    
                    $requests = $this->Ipd_admission_request_model->get_all($filters);
                    $stats = $this->Ipd_admission_request_model->get_stats();
                    
                    $this->success(array(
                        'requests' => $requests,
                        'stats' => $stats
                    ));
                }
            } elseif ($method === 'POST') {
                $this->create_admission_request();
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                if (!$id) {
                    $this->error('Request ID is required', 400);
                    return;
                }
                $this->update_admission_request($id);
            } elseif ($method === 'DELETE') {
                if (!$id) {
                    $this->error('Request ID is required', 400);
                    return;
                }
                $this->delete_admission_request($id);
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD admission requests error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Approve admission request
     * POST /api/ipd/admission-requests/:id/approve
     */
    public function approve_admission_request($id) {
        try {
            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->post();
            }
            
            $request = $this->Ipd_admission_request_model->get_by_id($id);
            if (!$request) {
                $this->error('Admission request not found', 404);
                return;
            }
            
            if ($request['status'] !== 'pending') {
                $this->error('Request is not pending', 400);
                return;
            }
            
            $approved_by = null;
            if ($this->user && isset($this->user['id'])) {
                $approved_by = $this->user['id'];
            }
            
            $admission_id = isset($data['admission_id']) ? $data['admission_id'] : null;
            
            $old_request = $request;
            $result = $this->Ipd_admission_request_model->approve($id, $admission_id, $approved_by);
            if ($result) {
                $updated_request = $this->Ipd_admission_request_model->get_by_id($id);
                
                // Log admission request approval
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('IPD Management', 'Admission Request', $id, "Approved admission request ID: {$id}" . ($admission_id ? " (Admission ID: {$admission_id})" : ""), $old_request, $updated_request);
                
                $this->success($updated_request, 'Admission request approved successfully');
            } else {
                $this->error('Failed to approve admission request', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD approve admission request error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Reject admission request
     * POST /api/ipd/admission-requests/:id/reject
     */
    public function reject_admission_request($id) {
        try {
            $data = json_decode($this->input->raw_input_stream, true);
            if (empty($data)) {
                $data = $this->input->post();
            }
            
            $request = $this->Ipd_admission_request_model->get_by_id($id);
            if (!$request) {
                $this->error('Admission request not found', 404);
                return;
            }
            
            if ($request['status'] !== 'pending') {
                $this->error('Request is not pending', 400);
                return;
            }
            
            $rejected_by = null;
            if ($this->user && isset($this->user['id'])) {
                $rejected_by = $this->user['id'];
            }
            
            $rejection_reason = isset($data['rejection_reason']) ? $data['rejection_reason'] : null;
            
            $old_request = $request;
            $result = $this->Ipd_admission_request_model->reject($id, $rejection_reason, $rejected_by);
            if ($result) {
                $updated_request = $this->Ipd_admission_request_model->get_by_id($id);
                
                // Log admission request rejection
                $this->load->library('audit_log');
                $this->audit_log->logUpdate('IPD Management', 'Admission Request', $id, "Rejected admission request ID: {$id}", $old_request, $updated_request);
                
                $this->success($updated_request, 'Admission request rejected successfully');
            } else {
                $this->error('Failed to reject admission request', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD reject admission request error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    private function create_admission_request() {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (empty($data['patient_id'])) {
            $this->error('Patient ID is required', 400);
            return;
        }
        
        if (empty($data['requested_by_doctor_id'])) {
            $this->error('Doctor ID is required', 400);
            return;
        }
        
        if (empty($data['department'])) {
            $this->error('Department is required', 400);
            return;
        }
        
        $request_id = $this->Ipd_admission_request_model->create($data);
        if ($request_id) {
            $request = $this->Ipd_admission_request_model->get_by_id($request_id);
            
            // Log admission request creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('IPD Management', 'Admission Request', $request_id, "Created admission request for patient ID: {$data['patient_id']}, Department: {$data['department']}");
            
            $this->success($request, 'Admission request created successfully');
        } else {
            $this->error('Failed to create admission request', 400);
        }
    }

    private function update_admission_request($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_request = $this->Ipd_admission_request_model->get_by_id($id);
        $result = $this->Ipd_admission_request_model->update($id, $data);
        if ($result) {
            $request = $this->Ipd_admission_request_model->get_by_id($id);
            
            // Log admission request update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('IPD Management', 'Admission Request', $id, "Updated admission request ID: {$id}", $old_request, $request);
            
            $this->success($request, 'Admission request updated successfully');
        } else {
            $this->error('Failed to update admission request', 400);
        }
    }

    private function delete_admission_request($id) {
        $request = $this->Ipd_admission_request_model->get_by_id($id);
        $result = $this->Ipd_admission_request_model->delete($id);
        if ($result) {
            // Log admission request deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('IPD Management', 'Admission Request', $id, "Deleted admission request ID: {$id}");
            
            $this->success(null, 'Admission request deleted successfully');
        } else {
            $this->error('Failed to delete admission request', 400);
        }
    }

    // ============= NEW IPD PATIENT DETAIL TABS METHODS =============

    /**
     * Update/Delete vital signs
     * PUT /api/ipd/vitals/:id
     * DELETE /api/ipd/vitals/:id
     */
    public function vitals_update($id) {
        try {
            if (!$id) {
                $this->error('Vital ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $old_vital = $this->Ipd_vital_sign_model->get_by_id($id);
                
                $result = $this->Ipd_vital_sign_model->update($id, $data);
                if ($result) {
                    $vital = $this->Ipd_vital_sign_model->get_by_id($id);
                    
                    // Log vital signs update
                    $this->load->library('audit_log');
                    $patient_id = $vital ? $vital['patient_id'] : 'Unknown';
                    $admission_id = $vital ? $vital['admission_id'] : 'Unknown';
                    $this->audit_log->logUpdate('IPD Management', 'Vital Signs', $id, "Updated vital signs for patient ID: {$patient_id} (Admission ID: {$admission_id})", $old_vital, $vital);
                    
                    $this->success($vital, 'Vital signs updated successfully');
                } else {
                    $this->error('Failed to update vital signs', 400);
                }
            } elseif ($method === 'DELETE') {
                $vital = $this->Ipd_vital_sign_model->get_by_id($id);
                
                $result = $this->Ipd_vital_sign_model->delete($id);
                if ($result) {
                    // Log vital signs deletion
                    $this->load->library('audit_log');
                    $patient_id = $vital ? $vital['patient_id'] : 'Unknown';
                    $admission_id = $vital ? $vital['admission_id'] : 'Unknown';
                    $this->audit_log->logDelete('IPD Management', 'Vital Signs', $id, "Deleted vital signs for patient ID: {$patient_id} (Admission ID: {$admission_id})");
                    
                    $this->success(null, 'Vital sign deleted successfully');
                } else {
                    $this->error('Failed to delete vital sign', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD vitals update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Daily Care Orders
     * GET /api/ipd/admissions/:id/daily-care-orders
     * POST /api/ipd/admissions/:id/daily-care-orders
     */
    public function daily_care_orders($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('order_date', 'DESC');
                $this->db->order_by('order_time', 'DESC');
                $query = $this->db->get('ipd_daily_care_orders');
                $orders = $query->result_array();
                $this->success($orders);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_daily_care_orders', $data)) {
                    $order_id = $this->db->insert_id();
                    $order = $this->db->get_where('ipd_daily_care_orders', array('id' => $order_id))->row_array();
                    $this->success($order, 'Care order created successfully');
                } else {
                    $this->error('Failed to create care order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD daily care orders error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete daily care order
     * PUT /api/ipd/daily-care-orders/:id
     * DELETE /api/ipd/daily-care-orders/:id
     */
    public function daily_care_orders_update($id) {
        try {
            if (!$id) {
                $this->error('Order ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_daily_care_orders', $data)) {
                    $order = $this->db->get_where('ipd_daily_care_orders', array('id' => $id))->row_array();
                    $this->success($order, 'Care order updated successfully');
                } else {
                    $this->error('Failed to update care order', 400);
                }
            } elseif ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_daily_care_orders')) {
                    $this->success(null, 'Care order deleted successfully');
                } else {
                    $this->error('Failed to delete care order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD daily care orders update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Medications
     * GET /api/ipd/admissions/:id/medications
     * POST /api/ipd/admissions/:id/medications
     */
    public function medications($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('start_date', 'DESC');
                $query = $this->db->get('ipd_medications');
                $medications = $query->result_array();
                $this->success($medications);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_medications', $data)) {
                    $medication_id = $this->db->insert_id();
                    $medication = $this->db->get_where('ipd_medications', array('id' => $medication_id))->row_array();
                    $this->success($medication, 'Medication added successfully');
                } else {
                    $this->error('Failed to add medication', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD medications error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete medication
     * PUT /api/ipd/medications/:id
     * DELETE /api/ipd/medications/:id
     */
    public function medications_update($id) {
        try {
            if (!$id) {
                $this->error('Medication ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_medications', $data)) {
                    $medication = $this->db->get_where('ipd_medications', array('id' => $id))->row_array();
                    $this->success($medication, 'Medication updated successfully');
                } else {
                    $this->error('Failed to update medication', 400);
                }
            } elseif ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_medications')) {
                    $this->success(null, 'Medication deleted successfully');
                } else {
                    $this->error('Failed to delete medication', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD medications update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Lab Orders
     * GET /api/ipd/admissions/:id/lab-orders
     * POST /api/ipd/admissions/:id/lab-orders
     */
    public function lab_orders($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get from unified lab_orders table
                $this->load->model('Lab_order_model');
                $orders = $this->Lab_order_model->get_all(array(
                    'order_type' => 'IPD',
                    'order_source_id' => $admission_id
                ));
                
                // Also get from legacy ipd_lab_orders for backward compatibility
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('order_date', 'DESC');
                $this->db->order_by('order_time', 'DESC');
                $query = $this->db->get('ipd_lab_orders');
                $legacy_orders = $query->result_array();
                
                // Merge results (prefer unified orders)
                $this->success($orders);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                // Create unified lab order
                $this->load->model('Lab_order_model');
                $this->load->model('Lab_test_model');
                
                // Prepare lab order data
                $order_data = array(
                    'patient_id' => $admission['patient_id'],
                    'order_type' => 'IPD',
                    'order_source_id' => $admission_id,
                    'ordered_by_user_id' => $this->user && isset($this->user['id']) ? $this->user['id'] : null,
                    'priority' => isset($data['priority']) ? $data['priority'] : 'routine',
                    'notes' => isset($data['notes']) ? $data['notes'] : null,
                    'organization_id' => $this->user && isset($this->user['organization_id']) ? $this->user['organization_id'] : null
                );
                
                // Prepare tests array
                $test_name = isset($data['test_name']) ? $data['test_name'] : 'Lab Test';
                $test_type = isset($data['test_type']) ? $data['test_type'] : null;
                
                // Get test price if lab_test_id provided
                $test_price = 0.00;
                $test_code = null;
                if (!empty($data['lab_test_id'])) {
                    $lab_test = $this->Lab_test_model->get_by_id($data['lab_test_id']);
                    if ($lab_test) {
                        $test_price = isset($lab_test['price']) ? $lab_test['price'] : 0.00;
                        $test_code = $lab_test['test_code'];
                    }
                }
                
                $order_data['tests'] = array(array(
                    'lab_test_id' => isset($data['lab_test_id']) ? $data['lab_test_id'] : null,
                    'test_name' => $test_name,
                    'test_code' => $test_code,
                    'price' => $test_price,
                    'priority' => $order_data['priority'],
                    'instructions' => isset($data['instructions']) ? $data['instructions'] : null
                ));
                
                // Create unified lab order
                $lab_order_id = $this->Lab_order_model->create($order_data);
                
                if ($lab_order_id) {
                    // Also create in ipd_lab_orders for backward compatibility
                    $ipd_order_data = array(
                        'admission_id' => $admission_id,
                        'patient_id' => $admission['patient_id'],
                        'order_date' => date('Y-m-d'),
                        'order_time' => date('H:i:s'),
                        'ordered_by_user_id' => $order_data['ordered_by_user_id'],
                        'test_name' => $test_name,
                        'test_type' => $test_type,
                        'priority' => $order_data['priority'],
                        'status' => 'ordered',
                        'notes' => $order_data['notes']
                    );
                    
                    $this->db->insert('ipd_lab_orders', $ipd_order_data);
                    
                    // Return unified order
                    $order = $this->Lab_order_model->get_by_id($lab_order_id);
                    $this->success($order, 'Lab order created successfully');
                } else {
                    $this->error('Failed to create lab order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD lab orders error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete lab order
     * PUT /api/ipd/lab-orders/:id
     * DELETE /api/ipd/lab-orders/:id
     */
    public function lab_orders_update($id) {
        try {
            if (!$id) {
                $this->error('Order ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_lab_orders', $data)) {
                    $order = $this->db->get_where('ipd_lab_orders', array('id' => $id))->row_array();
                    $this->success($order, 'Lab order updated successfully');
                } else {
                    $this->error('Failed to update lab order', 400);
                }
            } elseif ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_lab_orders')) {
                    $this->success(null, 'Lab order deleted successfully');
                } else {
                    $this->error('Failed to delete lab order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD lab orders update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Radiology Orders
     * GET /api/ipd/admissions/:id/radiology-orders
     * POST /api/ipd/admissions/:id/radiology-orders
     */
    public function radiology_orders($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('order_date', 'DESC');
                $this->db->order_by('order_time', 'DESC');
                $query = $this->db->get('ipd_radiology_orders');
                $orders = $query->result_array();
                $this->success($orders);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_radiology_orders', $data)) {
                    $order_id = $this->db->insert_id();
                    $order = $this->db->get_where('ipd_radiology_orders', array('id' => $order_id))->row_array();
                    $this->success($order, 'Radiology order created successfully');
                } else {
                    $this->error('Failed to create radiology order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD radiology orders error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete radiology order
     * PUT /api/ipd/radiology-orders/:id
     * DELETE /api/ipd/radiology-orders/:id
     */
    public function radiology_orders_update($id) {
        try {
            if (!$id) {
                $this->error('Order ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_radiology_orders', $data)) {
                    $order = $this->db->get_where('ipd_radiology_orders', array('id' => $id))->row_array();
                    $this->success($order, 'Radiology order updated successfully');
                } else {
                    $this->error('Failed to update radiology order', 400);
                }
            } elseif ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_radiology_orders')) {
                    $this->success(null, 'Radiology order deleted successfully');
                } else {
                    $this->error('Failed to delete radiology order', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD radiology orders update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Doctor Notes
     * GET /api/ipd/admissions/:id/doctor-notes
     * POST /api/ipd/admissions/:id/doctor-notes
     */
    public function doctor_notes($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('note_date', 'DESC');
                $this->db->order_by('note_time', 'DESC');
                $query = $this->db->get('ipd_doctor_notes');
                $notes = $query->result_array();
                $this->success($notes);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_doctor_notes', $data)) {
                    $note_id = $this->db->insert_id();
                    $note = $this->db->get_where('ipd_doctor_notes', array('id' => $note_id))->row_array();
                    $this->success($note, 'Doctor note saved successfully');
                } else {
                    $this->error('Failed to save doctor note', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD doctor notes error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete doctor note
     * PUT /api/ipd/doctor-notes/:id
     * DELETE /api/ipd/doctor-notes/:id
     */
    public function doctor_notes_update($id) {
        try {
            if (!$id) {
                $this->error('Note ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_doctor_notes', $data)) {
                    $note = $this->db->get_where('ipd_doctor_notes', array('id' => $id))->row_array();
                    $this->success($note, 'Doctor note updated successfully');
                } else {
                    $this->error('Failed to update doctor note', 400);
                }
            } elseif ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_doctor_notes')) {
                    $this->success(null, 'Doctor note deleted successfully');
                } else {
                    $this->error('Failed to delete doctor note', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD doctor notes update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Pharmacist Notes
     * GET /api/ipd/admissions/:id/pharmacist-notes
     * POST /api/ipd/admissions/:id/pharmacist-notes
     */
    public function pharmacist_notes($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('note_date', 'DESC');
                $this->db->order_by('note_time', 'DESC');
                $query = $this->db->get('ipd_pharmacist_notes');
                $notes = $query->result_array();
                $this->success($notes);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_pharmacist_notes', $data)) {
                    $note_id = $this->db->insert_id();
                    $note = $this->db->get_where('ipd_pharmacist_notes', array('id' => $note_id))->row_array();
                    
                    // Log pharmacist note creation
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('IPD Management', 'Pharmacist Note', $note_id, "Added pharmacist note for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id})");
                    
                    $this->success($note, 'Pharmacist note saved successfully');
                } else {
                    $this->error('Failed to save pharmacist note', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD pharmacist notes error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete pharmacist note
     * PUT /api/ipd/pharmacist-notes/:id
     * DELETE /api/ipd/pharmacist-notes/:id
     */
    public function pharmacist_notes_update($id) {
        try {
            if (!$id) {
                $this->error('Note ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $old_note = $this->db->get_where('ipd_pharmacist_notes', array('id' => $id))->row_array();
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_pharmacist_notes', $data)) {
                    $note = $this->db->get_where('ipd_pharmacist_notes', array('id' => $id))->row_array();
                    
                    // Log pharmacist note update
                    $this->load->library('audit_log');
                    $this->audit_log->logUpdate('IPD Management', 'Pharmacist Note', $id, "Updated pharmacist note ID: {$id}", $old_note, $note);
                    
                    $this->success($note, 'Pharmacist note updated successfully');
                } else {
                    $this->error('Failed to update pharmacist note', 400);
                }
            } elseif ($method === 'DELETE') {
                $note = $this->db->get_where('ipd_pharmacist_notes', array('id' => $id))->row_array();
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_pharmacist_notes')) {
                    // Log pharmacist note deletion
                    $this->load->library('audit_log');
                    $this->audit_log->logDelete('IPD Management', 'Pharmacist Note', $id, "Deleted pharmacist note ID: {$id}");
                    
                    $this->success(null, 'Pharmacist note deleted successfully');
                } else {
                    $this->error('Failed to delete pharmacist note', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD pharmacist notes update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Procedures
     * GET /api/ipd/admissions/:id/procedures
     * POST /api/ipd/admissions/:id/procedures
     */
    public function procedures($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('procedure_date', 'DESC');
                $this->db->order_by('procedure_time', 'DESC');
                $query = $this->db->get('ipd_procedures');
                $procedures = $query->result_array();
                $this->success($procedures);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_procedures', $data)) {
                    $procedure_id = $this->db->insert_id();
                    $procedure = $this->db->get_where('ipd_procedures', array('id' => $procedure_id))->row_array();
                    
                    // Log procedure creation
                    $this->load->library('audit_log');
                    $procedure_name = $data['procedure_name'] ?? 'Unknown';
                    $this->audit_log->logCreate('IPD Management', 'Procedure', $procedure_id, "Scheduled procedure: {$procedure_name} for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id})");
                    
                    $this->success($procedure, 'Procedure scheduled successfully');
                } else {
                    $this->error('Failed to schedule procedure', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD procedures error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete procedure
     * PUT /api/ipd/procedures/:id
     * DELETE /api/ipd/procedures/:id
     */
    public function procedures_update($id) {
        try {
            if (!$id) {
                $this->error('Procedure ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $old_procedure = $this->db->get_where('ipd_procedures', array('id' => $id))->row_array();
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_procedures', $data)) {
                    $procedure = $this->db->get_where('ipd_procedures', array('id' => $id))->row_array();
                    
                    // Log procedure update
                    $this->load->library('audit_log');
                    $this->audit_log->logUpdate('IPD Management', 'Procedure', $id, "Updated procedure ID: {$id}", $old_procedure, $procedure);
                    
                    $this->success($procedure, 'Procedure updated successfully');
                } else {
                    $this->error('Failed to update procedure', 400);
                }
            } elseif ($method === 'DELETE') {
                $procedure = $this->db->get_where('ipd_procedures', array('id' => $id))->row_array();
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_procedures')) {
                    // Log procedure deletion
                    $this->load->library('audit_log');
                    $this->audit_log->logDelete('IPD Management', 'Procedure', $id, "Deleted procedure ID: {$id}");
                    
                    $this->success(null, 'Procedure deleted successfully');
                } else {
                    $this->error('Failed to delete procedure', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD procedures update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Nutrition
     * GET /api/ipd/admissions/:id/nutrition
     * POST /api/ipd/admissions/:id/nutrition
     */
    public function nutrition($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('date', 'DESC');
                $query = $this->db->get('ipd_nutrition');
                $nutrition = $query->result_array();
                $this->success($nutrition);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_nutrition', $data)) {
                    $nutrition_id = $this->db->insert_id();
                    $nutrition = $this->db->get_where('ipd_nutrition', array('id' => $nutrition_id))->row_array();
                    
                    // Log nutrition record creation
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('IPD Management', 'Nutrition', $nutrition_id, "Recorded nutrition for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id})");
                    
                    $this->success($nutrition, 'Nutrition record saved successfully');
                } else {
                    $this->error('Failed to save nutrition record', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD nutrition error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete nutrition record
     * PUT /api/ipd/nutrition/:id
     * DELETE /api/ipd/nutrition/:id
     */
    public function nutrition_update($id) {
        try {
            if (!$id) {
                $this->error('Nutrition ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $old_nutrition = $this->db->get_where('ipd_nutrition', array('id' => $id))->row_array();
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_nutrition', $data)) {
                    $nutrition = $this->db->get_where('ipd_nutrition', array('id' => $id))->row_array();
                    
                    // Log nutrition record update
                    $this->load->library('audit_log');
                    $this->audit_log->logUpdate('IPD Management', 'Nutrition', $id, "Updated nutrition record ID: {$id}", $old_nutrition, $nutrition);
                    
                    $this->success($nutrition, 'Nutrition record updated successfully');
                } else {
                    $this->error('Failed to update nutrition record', 400);
                }
            } elseif ($method === 'DELETE') {
                $nutrition = $this->db->get_where('ipd_nutrition', array('id' => $id))->row_array();
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_nutrition')) {
                    // Log nutrition record deletion
                    $this->load->library('audit_log');
                    $this->audit_log->logDelete('IPD Management', 'Nutrition', $id, "Deleted nutrition record ID: {$id}");
                    
                    $this->success(null, 'Nutrition record deleted successfully');
                } else {
                    $this->error('Failed to delete nutrition record', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD nutrition update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Intake & Output
     * GET /api/ipd/admissions/:id/intake-output
     * POST /api/ipd/admissions/:id/intake-output
     */
    public function intake_output($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('date', 'DESC');
                $this->db->order_by('time', 'DESC');
                $query = $this->db->get('ipd_intake_output');
                $records = $query->result_array();
                $this->success($records);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_intake_output', $data)) {
                    $record_id = $this->db->insert_id();
                    $record = $this->db->get_where('ipd_intake_output', array('id' => $record_id))->row_array();
                    
                    // Log intake/output record creation
                    $this->load->library('audit_log');
                    $this->audit_log->logCreate('IPD Management', 'Intake/Output', $record_id, "Recorded intake/output for patient ID: {$admission['patient_id']} (Admission ID: {$admission_id})");
                    
                    $this->success($record, 'Record saved successfully');
                } else {
                    $this->error('Failed to save record', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD intake output error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update/Delete intake & output record
     * PUT /api/ipd/intake-output/:id
     * DELETE /api/ipd/intake-output/:id
     */
    public function intake_output_update($id) {
        try {
            if (!$id) {
                $this->error('Record ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'PUT' || $method === 'PATCH') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $old_record = $this->db->get_where('ipd_intake_output', array('id' => $id))->row_array();
                $data['updated_at'] = date('Y-m-d H:i:s');
                $this->db->where('id', $id);
                if ($this->db->update('ipd_intake_output', $data)) {
                    $record = $this->db->get_where('ipd_intake_output', array('id' => $id))->row_array();
                    
                    // Log intake/output record update
                    $this->load->library('audit_log');
                    $this->audit_log->logUpdate('IPD Management', 'Intake/Output', $id, "Updated intake/output record ID: {$id}", $old_record, $record);
                    
                    $this->success($record, 'Record updated successfully');
                } else {
                    $this->error('Failed to update record', 400);
                }
            } elseif ($method === 'DELETE') {
                $record = $this->db->get_where('ipd_intake_output', array('id' => $id))->row_array();
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_intake_output')) {
                    // Log intake/output record deletion
                    $this->load->library('audit_log');
                    $this->audit_log->logDelete('IPD Management', 'Intake/Output', $id, "Deleted intake/output record ID: {$id}");
                    
                    $this->success(null, 'Record deleted successfully');
                } else {
                    $this->error('Failed to delete record', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD intake output update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Health & Physical Habits
     * GET /api/ipd/admissions/:id/health-physical-habits
     * POST /api/ipd/admissions/:id/health-physical-habits
     */
    public function health_physical_habits($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('assessment_date', 'DESC');
                $query = $this->db->get('ipd_health_physical_habits');
                $assessments = $query->result_array();
                $this->success($assessments);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_health_physical_habits', $data)) {
                    $assessment_id = $this->db->insert_id();
                    $assessment = $this->db->get_where('ipd_health_physical_habits', array('id' => $assessment_id))->row_array();
                    $this->success($assessment, 'Health assessment saved successfully');
                } else {
                    $this->error('Failed to save health assessment', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD health physical habits error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete health & physical habit assessment
     * DELETE /api/ipd/health-physical-habits/:id
     */
    public function health_physical_habits_update($id) {
        try {
            if (!$id) {
                $this->error('Assessment ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_health_physical_habits')) {
                    $this->success(null, 'Assessment deleted successfully');
                } else {
                    $this->error('Failed to delete assessment', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD health physical habits update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Forms
     * GET /api/ipd/admissions/:id/forms
     * POST /api/ipd/admissions/:id/forms
     */
    public function forms($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('created_at', 'DESC');
                $query = $this->db->get('ipd_forms');
                $forms = $query->result_array();
                $this->success($forms);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                if (isset($data['form_data']) && is_array($data['form_data'])) {
                    $data['form_data'] = json_encode($data['form_data']);
                }
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_forms', $data)) {
                    $form_id = $this->db->insert_id();
                    $form = $this->db->get_where('ipd_forms', array('id' => $form_id))->row_array();
                    if (isset($form['form_data'])) {
                        $form['form_data'] = json_decode($form['form_data'], true);
                    }
                    $this->success($form, 'Form saved successfully');
                } else {
                    $this->error('Failed to save form', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD forms error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete form
     * DELETE /api/ipd/forms/:id
     */
    public function forms_update($id) {
        try {
            if (!$id) {
                $this->error('Form ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_forms')) {
                    $this->success(null, 'Form deleted successfully');
                } else {
                    $this->error('Failed to delete form', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD forms update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Doctor Recommendations
     * GET /api/ipd/admissions/:id/doctor-recommendations
     * POST /api/ipd/admissions/:id/doctor-recommendations
     */
    public function doctor_recommendations($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('recommendation_date', 'DESC');
                $this->db->order_by('recommendation_time', 'DESC');
                $query = $this->db->get('ipd_doctor_recommendations');
                $recommendations = $query->result_array();
                $this->success($recommendations);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_doctor_recommendations', $data)) {
                    $recommendation_id = $this->db->insert_id();
                    $recommendation = $this->db->get_where('ipd_doctor_recommendations', array('id' => $recommendation_id))->row_array();
                    $this->success($recommendation, 'Recommendation saved successfully');
                } else {
                    $this->error('Failed to save recommendation', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD doctor recommendations error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete doctor recommendation
     * DELETE /api/ipd/doctor-recommendations/:id
     */
    public function doctor_recommendations_update($id) {
        try {
            if (!$id) {
                $this->error('Recommendation ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_doctor_recommendations')) {
                    $this->success(null, 'Recommendation deleted successfully');
                } else {
                    $this->error('Failed to delete recommendation', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD doctor recommendations update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Doctor Consultations
     * GET /api/ipd/admissions/:id/doctor-consultations
     * POST /api/ipd/admissions/:id/doctor-consultations
     */
    public function doctor_consultations($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('request_date', 'DESC');
                $this->db->order_by('request_time', 'DESC');
                $query = $this->db->get('ipd_doctor_consultations');
                $consultations = $query->result_array();
                $this->success($consultations);
            } elseif ($method === 'POST') {
                $data = json_decode($this->input->raw_input_stream, true);
                if (empty($data)) {
                    $data = $this->input->post();
                }
                
                $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['admission_id'] = $admission_id;
                $data['patient_id'] = $admission['patient_id'];
                $data['created_at'] = date('Y-m-d H:i:s');
                $data['updated_at'] = date('Y-m-d H:i:s');
                
                if ($this->db->insert('ipd_doctor_consultations', $data)) {
                    $consultation_id = $this->db->insert_id();
                    $consultation = $this->db->get_where('ipd_doctor_consultations', array('id' => $consultation_id))->row_array();
                    $this->success($consultation, 'Consultation request created successfully');
                } else {
                    $this->error('Failed to create consultation request', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD doctor consultations error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete doctor consultation
     * DELETE /api/ipd/doctor-consultations/:id
     */
    public function doctor_consultations_update($id) {
        try {
            if (!$id) {
                $this->error('Consultation ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'DELETE') {
                $this->db->where('id', $id);
                if ($this->db->delete('ipd_doctor_consultations')) {
                    $this->success(null, 'Consultation request deleted successfully');
                } else {
                    $this->error('Failed to delete consultation request', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD doctor consultations update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Patient Files
     * GET /api/ipd/admissions/:id/files
     * POST /api/ipd/admissions/:id/files
     */
    public function files($admission_id) {
        try {
            if (!$admission_id) {
                $this->error('Admission ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                $this->db->where('admission_id', $admission_id);
                $this->db->order_by('created_at', 'DESC');
                $query = $this->db->get('ipd_patient_files');
                $files = $query->result_array();
                $this->success($files);
            } elseif ($method === 'POST') {
                // Handle file upload
                $config['upload_path'] = './uploads/ipd_files/';
                $config['allowed_types'] = '*';
                $config['max_size'] = 10240; // 10MB
                $config['encrypt_name'] = TRUE;
                
                // Create directory if it doesn't exist
                if (!is_dir($config['upload_path'])) {
                    mkdir($config['upload_path'], 0755, true);
                }
                
                $this->load->library('upload', $config);
                
                if ($this->upload->do_upload('file')) {
                    $upload_data = $this->upload->data();
                    
                    $admission = $this->Ipd_admission_model->get_by_id($admission_id);
                    if (!$admission) {
                        // Delete uploaded file if admission not found
                        unlink($upload_data['full_path']);
                        $this->error('Admission not found', 404);
                        return;
                    }
                    
                    $data = array(
                        'admission_id' => $admission_id,
                        'patient_id' => $admission['patient_id'],
                        'file_name' => $this->input->post('file_name') ?: $upload_data['orig_name'],
                        'file_path' => 'uploads/ipd_files/' . $upload_data['file_name'],
                        'file_category' => $this->input->post('file_category') ?: 'Document',
                        'description' => $this->input->post('description'),
                        'file_size' => $upload_data['file_size'],
                        'file_type' => $upload_data['file_type'],
                        'created_at' => date('Y-m-d H:i:s')
                    );
                    
                    if ($this->db->insert('ipd_patient_files', $data)) {
                        $file_id = $this->db->insert_id();
                        $file = $this->db->get_where('ipd_patient_files', array('id' => $file_id))->row_array();
                        $this->success($file, 'File uploaded successfully');
                    } else {
                        unlink($upload_data['full_path']);
                        $this->error('Failed to save file record', 400);
                    }
                } else {
                    $error = $this->upload->display_errors('', '');
                    $this->error('File upload failed: ' . $error, 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD files error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete file
     * DELETE /api/ipd/files/:id
     */
    public function files_update($id) {
        try {
            if (!$id) {
                $this->error('File ID is required', 400);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'DELETE') {
                // Get file info before deleting
                $file = $this->db->get_where('ipd_patient_files', array('id' => $id))->row_array();
                
                if ($file) {
                    // Delete physical file
                    $file_path = './' . $file['file_path'];
                    if (file_exists($file_path)) {
                        unlink($file_path);
                    }
                    
                    // Delete database record
                    $this->db->where('id', $id);
                    if ($this->db->delete('ipd_patient_files')) {
                        $this->success(null, 'File deleted successfully');
                    } else {
                        $this->error('Failed to delete file record', 400);
                    }
                } else {
                    $this->error('File not found', 404);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD files update error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * OT Schedules
     * GET /api/ipd/ot-schedules
     * POST /api/ipd/ot-schedules
     */
    public function ot_schedules($id = null) {
        try {
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($id) {
                    // Get single OT schedule
                    $schedule = $this->Ipd_ot_schedule_model->get_by_id($id);
                    if ($schedule) {
                        $this->success($schedule);
                    } else {
                        $this->error('OT schedule not found', 404);
                    }
                } else {
                    // Get all OT schedules with filters
                    $filters = array();
                    if ($this->input->get('date')) $filters['date'] = $this->input->get('date');
                    if ($this->input->get('ot_number')) $filters['ot_number'] = $this->input->get('ot_number');
                    if ($this->input->get('status')) $filters['status'] = $this->input->get('status');
                    if ($this->input->get('surgeon_id')) $filters['surgeon_id'] = $this->input->get('surgeon_id');
                    if ($this->input->get('patient_id')) $filters['patient_id'] = $this->input->get('patient_id');
                    if ($this->input->get('admission_id')) $filters['admission_id'] = $this->input->get('admission_id');
                    
                    $schedules = $this->Ipd_ot_schedule_model->get_all($filters);
                    $this->success($schedules);
                }
            } elseif ($method === 'POST') {
                // Create new OT schedule
                $data = $this->get_request_data();
                
                // Get admission to get patient_id
                $admission = $this->Ipd_admission_model->get_by_id($data['admission_id']);
                if (!$admission) {
                    $this->error('Admission not found', 404);
                    return;
                }
                
                $data['patient_id'] = $admission['patient_id'];
                $data['created_by_user_id'] = $this->user ? $this->user['id'] : null;
                
                // Get surgeon/assistant/anesthetist names if user_ids provided
                if (!empty($data['surgeon_user_id'])) {
                    $surgeon = $this->db->get_where('users', array('id' => $data['surgeon_user_id']))->row_array();
                    if ($surgeon) $data['surgeon_name'] = $surgeon['name'];
                }
                if (!empty($data['assistant_surgeon_user_id'])) {
                    $assistant = $this->db->get_where('users', array('id' => $data['assistant_surgeon_user_id']))->row_array();
                    if ($assistant) $data['assistant_surgeon_name'] = $assistant['name'];
                }
                if (!empty($data['anesthetist_user_id'])) {
                    $anesthetist = $this->db->get_where('users', array('id' => $data['anesthetist_user_id']))->row_array();
                    if ($anesthetist) $data['anesthetist_name'] = $anesthetist['name'];
                }
                
                $schedule_id = $this->Ipd_ot_schedule_model->create($data);
                if ($schedule_id) {
                    $schedule = $this->Ipd_ot_schedule_model->get_by_id($schedule_id);
                    $this->success($schedule, 'OT schedule created successfully');
                } else {
                    $this->error('Failed to create OT schedule', 400);
                }
            } elseif ($method === 'PUT') {
                // Update OT schedule
                if (!$id) {
                    $this->error('Schedule ID is required', 400);
                    return;
                }
                
                $data = $this->get_request_data();
                
                // Get surgeon/assistant/anesthetist names if user_ids provided
                if (!empty($data['surgeon_user_id'])) {
                    $surgeon = $this->db->get_where('users', array('id' => $data['surgeon_user_id']))->row_array();
                    if ($surgeon) $data['surgeon_name'] = $surgeon['name'];
                }
                if (!empty($data['assistant_surgeon_user_id'])) {
                    $assistant = $this->db->get_where('users', array('id' => $data['assistant_surgeon_user_id']))->row_array();
                    if ($assistant) $data['assistant_surgeon_name'] = $assistant['name'];
                }
                if (!empty($data['anesthetist_user_id'])) {
                    $anesthetist = $this->db->get_where('users', array('id' => $data['anesthetist_user_id']))->row_array();
                    if ($anesthetist) $data['anesthetist_name'] = $anesthetist['name'];
                }
                
                if ($this->Ipd_ot_schedule_model->update($id, $data)) {
                    $schedule = $this->Ipd_ot_schedule_model->get_by_id($id);
                    $this->success($schedule, 'OT schedule updated successfully');
                } else {
                    $this->error('Failed to update OT schedule', 400);
                }
            } elseif ($method === 'DELETE') {
                // Delete OT schedule
                if (!$id) {
                    $this->error('Schedule ID is required', 400);
                    return;
                }
                
                if ($this->Ipd_ot_schedule_model->delete($id)) {
                    $this->success(null, 'OT schedule deleted successfully');
                } else {
                    $this->error('Failed to delete OT schedule', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD OT schedules error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check OT Availability
     * GET /api/ipd/ot-availability
     */
    public function ot_availability() {
        try {
            $ot_number = $this->input->get('ot_number');
            $date = $this->input->get('date');
            $start_time = $this->input->get('start_time');
            $duration_minutes = $this->input->get('duration_minutes');
            
            if (!$ot_number || !$date || !$start_time || !$duration_minutes) {
                $this->error('Missing required parameters: ot_number, date, start_time, duration_minutes', 400);
                return;
            }
            
            $availability = $this->Ipd_ot_schedule_model->check_availability(
                $ot_number,
                $date,
                $start_time,
                intval($duration_minutes)
            );
            
            // Generate alternative slots if not available
            $alternative_slots = array();
            if (!$availability['available']) {
                // Suggest next available slots (simplified - can be enhanced)
                $current_time = strtotime($date . ' ' . $start_time);
                for ($i = 1; $i <= 5; $i++) {
                    $next_time = $current_time + ($i * 3600); // Add hours
                    $alternative_slots[] = array(
                        'date' => date('Y-m-d', $next_time),
                        'time' => date('H:i:s', $next_time),
                        'ot_number' => $ot_number
                    );
                }
            }
            
            $this->success(array(
                'available' => $availability['available'],
                'conflicts' => $availability['conflicts'],
                'alternative_slots' => $alternative_slots
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD OT availability check error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Start Surgery
     * POST /api/ipd/ot-schedules/{id}/start
     */
    public function ot_schedule_start($id) {
        try {
            if (!$id) {
                $this->error('Schedule ID is required', 400);
                return;
            }
            
            $data = $this->get_request_data();
            $start_time = isset($data['start_time']) ? $data['start_time'] : null;
            
            if ($this->Ipd_ot_schedule_model->start_surgery($id, $start_time)) {
                $schedule = $this->Ipd_ot_schedule_model->get_by_id($id);
                $this->success($schedule, 'Surgery started successfully');
            } else {
                $this->error('Failed to start surgery', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD start surgery error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Complete Surgery
     * POST /api/ipd/ot-schedules/{id}/complete
     */
    public function ot_schedule_complete($id) {
        try {
            if (!$id) {
                $this->error('Schedule ID is required', 400);
                return;
            }
            
            $data = $this->get_request_data();
            $end_time = isset($data['end_time']) ? $data['end_time'] : null;
            $actual_duration_minutes = isset($data['actual_duration_minutes']) ? intval($data['actual_duration_minutes']) : null;
            $complications = isset($data['complications']) ? $data['complications'] : null;
            
            // Update complications if provided
            if ($complications !== null) {
                $this->Ipd_ot_schedule_model->update($id, array('complications' => $complications));
            }
            
            if ($this->Ipd_ot_schedule_model->complete_surgery($id, $end_time, $actual_duration_minutes)) {
                $schedule = $this->Ipd_ot_schedule_model->get_by_id($id);
                $this->success($schedule, 'Surgery completed successfully');
            } else {
                $this->error('Failed to complete surgery', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD complete surgery error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel/Postpone Surgery
     * POST /api/ipd/ot-schedules/{id}/cancel
     */
    public function ot_schedule_cancel($id) {
        try {
            if (!$id) {
                $this->error('Schedule ID is required', 400);
                return;
            }
            
            $data = $this->get_request_data();
            $reason = isset($data['reason']) ? $data['reason'] : 'Cancelled';
            $reschedule_date = isset($data['reschedule_date']) ? $data['reschedule_date'] : null;
            $reschedule_time = isset($data['reschedule_time']) ? $data['reschedule_time'] : null;
            
            $update_data = array(
                'status' => $reschedule_date ? 'Postponed' : 'Cancelled',
                'notes' => ($reason ? $reason . '. ' : '') . ($reschedule_date ? 'Rescheduled to ' . $reschedule_date . ' ' . $reschedule_time : '')
            );
            
            // If rescheduling, update date and time
            if ($reschedule_date) {
                $update_data['scheduled_date'] = $reschedule_date;
                if ($reschedule_time) {
                    $update_data['scheduled_time'] = $reschedule_time;
                }
            }
            
            if ($this->Ipd_ot_schedule_model->update($id, $update_data)) {
                $schedule = $this->Ipd_ot_schedule_model->get_by_id($id);
                $this->success($schedule, 'Surgery ' . ($reschedule_date ? 'postponed' : 'cancelled') . ' successfully');
            } else {
                $this->error('Failed to cancel surgery', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD cancel surgery error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Operation Theatres
     * GET /api/ipd/operation-theatres
     */
    public function operation_theatres() {
        try {
            $theatres = $this->Ipd_ot_schedule_model->get_operation_theatres();
            $this->success($theatres);
        } catch (Exception $e) {
            log_message('error', 'IPD operation theatres error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Surgery Charges
     * GET /api/ipd/surgeries/{ot_schedule_id}/charges
     * POST /api/ipd/surgeries/{ot_schedule_id}/charges
     * PUT /api/ipd/surgeries/{ot_schedule_id}/charges
     */
    public function surgery_charges($ot_schedule_id) {
        try {
            if (!$ot_schedule_id) {
                $this->error('OT schedule ID is required', 400);
                return;
            }
            
            // Verify OT schedule exists
            $ot_schedule = $this->Ipd_ot_schedule_model->get_by_id($ot_schedule_id);
            if (!$ot_schedule) {
                $this->error('OT schedule not found', 404);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get surgery charges
                $charges = $this->Ipd_surgery_charges_model->get_by_ot_schedule($ot_schedule_id);
                if ($charges) {
                    // Get consumables
                    $charges['consumables'] = $this->Ipd_surgery_consumables_model->get_by_surgery_charges($charges['id']);
                    $this->success($charges);
                } else {
                    $this->success(null, 'No charges found');
                }
            } elseif ($method === 'POST') {
                // Create surgery charges
                $data = $this->get_request_data();
                $data['ot_schedule_id'] = $ot_schedule_id;
                $data['admission_id'] = $ot_schedule['admission_id'];
                $data['patient_id'] = $ot_schedule['patient_id'];
                $data['created_by'] = $this->user ? $this->user['id'] : null;
                
                // Calculate OT charges based on actual duration if available
                if (empty($data['ot_room_charge']) && $ot_schedule['actual_duration_minutes']) {
                    // Get OT details
                    $ot = $this->db->get_where('operation_theatres', array('ot_number' => $ot_schedule['ot_number']))->row_array();
                    if ($ot) {
                        $duration_hours = $ot_schedule['actual_duration_minutes'] / 60.0;
                        $data['ot_duration_hours'] = $duration_hours;
                        $data['ot_rate_per_hour'] = $ot['hourly_rate'];
                        $data['ot_minimum_charge'] = $ot['minimum_charge_hours'] * $ot['hourly_rate'];
                        
                        // Calculate OT room charge
                        $min_charge_hours = floatval($ot['minimum_charge_hours']);
                        $charge_hours = max($duration_hours, $min_charge_hours);
                        $data['ot_room_charge'] = $charge_hours * $ot['hourly_rate'];
                        
                        // Calculate overtime if exceeds estimated duration
                        if ($ot_schedule['estimated_duration_minutes'] && 
                            $ot_schedule['actual_duration_minutes'] > $ot_schedule['estimated_duration_minutes']) {
                            $overtime_minutes = $ot_schedule['actual_duration_minutes'] - $ot_schedule['estimated_duration_minutes'];
                            $overtime_hours = $overtime_minutes / 60.0;
                            $data['ot_overtime_charge'] = $overtime_hours * $ot['hourly_rate'];
                        }
                    }
                }
                
                $charges_id = $this->Ipd_surgery_charges_model->create($data);
                if ($charges_id) {
                    $charges = $this->Ipd_surgery_charges_model->get_by_id($charges_id);
                    $this->success($charges, 'Surgery charges created successfully');
                } else {
                    $this->error('Failed to create surgery charges', 400);
                }
            } elseif ($method === 'PUT') {
                // Update surgery charges
                $charges = $this->Ipd_surgery_charges_model->get_by_ot_schedule($ot_schedule_id);
                if (!$charges) {
                    $this->error('Surgery charges not found', 404);
                    return;
                }
                
                $data = $this->get_request_data();
                
                if ($this->Ipd_surgery_charges_model->update($charges['id'], $data)) {
                    $updated_charges = $this->Ipd_surgery_charges_model->get_by_id($charges['id']);
                    $this->success($updated_charges, 'Surgery charges updated successfully');
                } else {
                    $this->error('Failed to update surgery charges', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD surgery charges error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Surgery Consumables
     * GET /api/ipd/surgeries/{ot_schedule_id}/consumables
     * POST /api/ipd/surgeries/{ot_schedule_id}/consumables
     */
    public function surgery_consumables($ot_schedule_id, $consumable_id = null) {
        try {
            if (!$ot_schedule_id) {
                $this->error('OT schedule ID is required', 400);
                return;
            }
            
            // Verify OT schedule exists
            $ot_schedule = $this->Ipd_ot_schedule_model->get_by_id($ot_schedule_id);
            if (!$ot_schedule) {
                $this->error('OT schedule not found', 404);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                if ($consumable_id) {
                    // Get single consumable
                    $consumable = $this->Ipd_surgery_consumables_model->get_by_id($consumable_id);
                    if ($consumable && $consumable['ot_schedule_id'] == $ot_schedule_id) {
                        $this->success($consumable);
                    } else {
                        $this->error('Consumable not found', 404);
                    }
                } else {
                    // Get all consumables for this OT schedule
                    $consumables = $this->Ipd_surgery_consumables_model->get_by_ot_schedule($ot_schedule_id);
                    $this->success($consumables);
                }
            } elseif ($method === 'POST') {
                // Create consumable
                $data = $this->get_request_data();
                $data['ot_schedule_id'] = $ot_schedule_id;
                
                // Link to surgery charges if exists
                $charges = $this->Ipd_surgery_charges_model->get_by_ot_schedule($ot_schedule_id);
                if ($charges) {
                    $data['surgery_charges_id'] = $charges['id'];
                }
                
                $consumable_id = $this->Ipd_surgery_consumables_model->create($data);
                if ($consumable_id) {
                    $consumable = $this->Ipd_surgery_consumables_model->get_by_id($consumable_id);
                    $this->success($consumable, 'Consumable added successfully');
                } else {
                    $this->error('Failed to add consumable', 400);
                }
            } elseif ($method === 'PUT') {
                // Update consumable
                if (!$consumable_id) {
                    $this->error('Consumable ID is required', 400);
                    return;
                }
                
                $data = $this->get_request_data();
                
                if ($this->Ipd_surgery_consumables_model->update($consumable_id, $data)) {
                    $consumable = $this->Ipd_surgery_consumables_model->get_by_id($consumable_id);
                    $this->success($consumable, 'Consumable updated successfully');
                } else {
                    $this->error('Failed to update consumable', 400);
                }
            } elseif ($method === 'DELETE') {
                // Delete consumable
                if (!$consumable_id) {
                    $this->error('Consumable ID is required', 400);
                    return;
                }
                
                if ($this->Ipd_surgery_consumables_model->delete($consumable_id)) {
                    $this->success(null, 'Consumable deleted successfully');
                } else {
                    $this->error('Failed to delete consumable', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD surgery consumables error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Pre-Operative Checklist
     * GET /api/ipd/ot-schedules/{id}/pre-op-checklist
     * PUT /api/ipd/ot-schedules/{id}/pre-op-checklist
     */
    public function pre_op_checklist($ot_schedule_id) {
        try {
            if (!$ot_schedule_id) {
                $this->error('OT schedule ID is required', 400);
                return;
            }
            
            // Verify OT schedule exists
            $ot_schedule = $this->Ipd_ot_schedule_model->get_by_id($ot_schedule_id);
            if (!$ot_schedule) {
                $this->error('OT schedule not found', 404);
                return;
            }
            
            $method = $this->input->server('REQUEST_METHOD');
            
            if ($method === 'GET') {
                // Get pre-op checklist
                $checklist = $this->Ipd_pre_op_checklist_model->get_by_ot_schedule($ot_schedule_id);
                if ($checklist) {
                    $this->success($checklist);
                } else {
                    // Return empty checklist structure
                    $this->success(array(
                        'ot_schedule_id' => $ot_schedule_id,
                        'admission_id' => $ot_schedule['admission_id'],
                        'patient_id' => $ot_schedule['patient_id'],
                        'npo_status' => false,
                        'pre_op_medications_given' => false,
                        'blood_work_completed' => false,
                        'imaging_completed' => false,
                        'consent_signed' => false,
                        'patient_identified' => false,
                        'instruments_ready' => false,
                        'consumables_available' => false,
                        'equipment_tested' => false,
                        'implants_available' => false,
                        'team_briefed' => false,
                        'anesthesia_ready' => false,
                        'checklist_completed' => false,
                        'notes' => null
                    ));
                }
            } elseif ($method === 'PUT') {
                // Update pre-op checklist
                $data = $this->get_request_data();
                $data['ot_schedule_id'] = $ot_schedule_id;
                $data['admission_id'] = $ot_schedule['admission_id'];
                $data['patient_id'] = $ot_schedule['patient_id'];
                
                if (isset($data['checklist_completed']) && $data['checklist_completed']) {
                    $data['completed_by_user_id'] = $this->user ? $this->user['id'] : null;
                }
                
                $result = $this->Ipd_pre_op_checklist_model->create_or_update($ot_schedule_id, $data);
                if ($result) {
                    $checklist = $this->Ipd_pre_op_checklist_model->get_by_ot_schedule($ot_schedule_id);
                    $this->success($checklist, 'Pre-op checklist updated successfully');
                } else {
                    $this->error('Failed to update pre-op checklist', 400);
                }
            } else {
                $this->error('Method not allowed', 405);
            }
        } catch (Exception $e) {
            log_message('error', 'IPD pre-op checklist error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

