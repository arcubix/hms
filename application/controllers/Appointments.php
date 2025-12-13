<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

class Appointments extends Api {

    public function __construct() {
        parent::__construct();
        $this->load->model('Appointment_model');
        $this->load->model('System_settings_model');
        $this->load->model('Opd_billing_model');
        $this->load->model('Patient_payment_model');
        $this->load->library('Room_assignment_service');
        $this->load->library('Token_service');
        
        // Verify token for all requests (except OPTIONS which already exited)
        if (!$this->verify_token()) {
            return;
        }
        
        // Load PaymentProcessor after token verification to ensure it's available
        $this->load->library('PaymentProcessor');
    }

    /**
     * GET /api/appointments - Get all appointments
     * POST /api/appointments - Create appointment
     */
    public function index() {
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing appointments
            if (!$this->requirePermission('add_appointment')) {
                return;
            }
            
            $filters = array();
            
            if ($this->input->get('search')) {
                $filters['search'] = $this->input->get('search');
            }
            
            if ($this->input->get('status')) {
                $filters['status'] = $this->input->get('status');
            }
            
            if ($this->input->get('doctor_id')) {
                $filters['doctor_id'] = $this->input->get('doctor_id');
            }
            
            if ($this->input->get('patient_id')) {
                $filters['patient_id'] = $this->input->get('patient_id');
            }
            
            if ($this->input->get('date')) {
                $filters['date'] = $this->input->get('date');
            }
            
            if ($this->input->get('date_from')) {
                $filters['date_from'] = $this->input->get('date_from');
            }
            
            if ($this->input->get('date_to')) {
                $filters['date_to'] = $this->input->get('date_to');
            }
            
            if ($this->input->get('floor_id')) {
                $filters['floor_id'] = $this->input->get('floor_id');
            }
            
            if ($this->input->get('reception_id')) {
                $filters['reception_id'] = $this->input->get('reception_id');
            }
            
            $appointments = $this->Appointment_model->get_all($filters);
            
            // Include room information if requested
            $include_room = $this->input->get('include_room') !== 'false';
            if ($include_room) {
                $this->load->model('Room_model');
                $this->load->model('Reception_model');
                $this->load->model('Floor_model');
                
                foreach ($appointments as &$apt) {
                    if (!empty($apt['room_id'])) {
                        $room = $this->Room_model->get_by_id($apt['room_id']);
                        if ($room) {
                            $apt['room_number'] = $room['room_number'];
                            $apt['room_name'] = $room['room_name'];
                        }
                    }
                    
                    if (!empty($apt['reception_id'])) {
                        $reception = $this->Reception_model->get_by_id($apt['reception_id']);
                        if ($reception) {
                            $apt['reception_name'] = $reception['reception_name'];
                            $apt['reception_code'] = $reception['reception_code'];
                        }
                    }
                    
                    if (!empty($apt['floor_id'])) {
                        $floor = $this->Floor_model->get_by_id($apt['floor_id']);
                        if ($floor) {
                            $apt['floor_number'] = $floor['floor_number'];
                            $apt['floor_name'] = $floor['floor_name'];
                        }
                    }
                }
            }
            
            $this->success($appointments);
            
        } elseif ($method === 'POST') {
            // Check permission for creating appointments
            if (!$this->requirePermission('add_appointment')) {
                return;
            }
            $this->create();
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Create appointment
     */
    public function create() {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        // Validate required fields
        if (empty($data['patient_id']) || empty($data['doctor_doctor_id']) || empty($data['appointment_date'])) {
            $this->error('Missing required fields: patient_id, doctor_doctor_id, appointment_date', 400);
            return;
        }
        
        // Get room management mode
        $room_mode = $this->System_settings_model->get_room_mode();
        
        // In Dynamic mode, schedule_id is required
        if ($room_mode === 'Dynamic' && empty($data['schedule_id'])) {
            $this->error('schedule_id is required in Dynamic room mode', 400);
            return;
        }
        
        // Get room assignment
        $room_assignment = $this->room_assignment_service->get_room_for_appointment(
            $data['doctor_doctor_id'],
            $data['appointment_date'],
            isset($data['schedule_id']) ? $data['schedule_id'] : null
        );
        
        if (!$room_assignment) {
            $mode_text = $room_mode === 'Dynamic' ? 'No room assigned for this slot on this date' : 'No room assigned to this doctor';
            $this->error($mode_text, 400);
            return;
        }
        
        // Validate room availability
        $date = date('Y-m-d', strtotime($data['appointment_date']));
        $time = date('H:i:s', strtotime($data['appointment_date']));
        $duration = isset($data['appointment_duration']) ? (int)$data['appointment_duration'] : 30;
        
        $availability = $this->room_assignment_service->validate_room_availability(
            $room_assignment['room_id'],
            $date,
            $time,
            $duration
        );
        
        if (!$availability['available']) {
            $this->error($availability['message'], 400);
            return;
        }
        
        // Add room information to appointment data
        $data['room_id'] = $room_assignment['room_id'];
        $data['reception_id'] = $room_assignment['reception_id'];
        $data['floor_id'] = $room_assignment['floor_id'];
        
        // Create appointment
        $result = $this->Appointment_model->create($data);
        
        if ($result['success']) {
            // Generate token
            $token_result = $this->token_service->generate_token(
                $result['id'],
                $data['doctor_doctor_id'],
                $data['appointment_date'],
                isset($data['schedule_id']) ? $data['schedule_id'] : null
            );
            
            // Get appointment with all details
            $appointment = $this->Appointment_model->get_by_id($result['id']);
            
            // Add token information to response
            if ($token_result) {
                $appointment['token_number'] = $token_result['token_number'];
                $appointment['token_id'] = $token_result['token_id'];
            }
            
            // Log appointment creation
            $this->load->library('audit_log');
            $this->audit_log->logCreate('Appointments', 'Appointment', $result['id'], "Created appointment for patient ID: {$data['patient_id']}");
            
            $this->success($appointment, 'Appointment created successfully');
        } else {
            $this->error($result['message'] ?? 'Failed to create appointment', 400);
        }
    }

    /**
     * GET /api/appointments/:id - Get single appointment
     * PUT /api/appointments/:id - Update appointment
     * DELETE /api/appointments/:id - Delete appointment
     */
    public function get($id = null) {
        if (!$id) {
            $this->error('Appointment ID required', 400);
            return;
        }
        
        $method = $this->input->server('REQUEST_METHOD');
        
        if ($method === 'GET') {
            // Check permission for viewing appointment details
            if (!$this->requirePermission('add_appointment')) {
                return;
            }
            
            $appointment = $this->Appointment_model->get_by_id($id);
            
            if ($appointment) {
                $this->success($appointment);
            } else {
                $this->error('Appointment not found', 404);
            }
            
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            // Check permission for updating appointments
            if (!$this->requirePermission('add_appointment')) {
                return;
            }
            $this->update($id);
            
        } elseif ($method === 'DELETE') {
            // Check permission for deleting appointments
            if (!$this->requirePermission('delete_token_appointment')) {
                return;
            }
            $this->delete($id);
            
        } else {
            $this->error('Method not allowed', 405);
        }
    }

    /**
     * Update appointment
     */
    public function update($id) {
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        $old_appointment = $this->Appointment_model->get_by_id($id);
        $result = $this->Appointment_model->update($id, $data);
        
        if ($result['success']) {
            $appointment = $this->Appointment_model->get_by_id($id);
            
            // Log appointment update
            $this->load->library('audit_log');
            $this->audit_log->logUpdate('Appointments', 'Appointment', $id, "Updated appointment ID: {$id}", $old_appointment, $appointment);
            
            $this->success($appointment, 'Appointment updated successfully');
        } else {
            $this->error($result['message'] ?? 'Failed to update appointment', 400);
        }
    }

    /**
     * Delete appointment
     */
    public function delete($id) {
        $appointment = $this->Appointment_model->get_by_id($id);
        
        if ($this->Appointment_model->delete($id)) {
            // Log appointment deletion
            $this->load->library('audit_log');
            $this->audit_log->logDelete('Appointments', 'Appointment', $id, "Deleted appointment ID: {$id}");
            
            $this->success(null, 'Appointment deleted successfully');
        } else {
            $this->error('Failed to delete appointment', 500);
        }
    }

    /**
     * PUT /api/appointments/:id/status - Update appointment status
     */
    public function update_status($id = null) {
        if (!$id) {
            $this->error('Appointment ID required', 400);
            return;
        }
        
        $data = json_decode($this->input->raw_input_stream, true);
        
        if (empty($data)) {
            $data = $this->input->post();
        }
        
        if (empty($data['status'])) {
            $this->error('Status is required', 400);
            return;
        }
        
        $result = $this->Appointment_model->update($id, array('status' => $data['status']));
        
        if ($result['success']) {
            $appointment = $this->Appointment_model->get_by_id($id);
            $this->success($appointment, 'Appointment status updated successfully');
        } else {
            $this->error($result['message'] ?? 'Failed to update status', 400);
        }
    }

    /**
     * GET /api/appointments/doctor/:id/slots?date=YYYY-MM-DD&duration=30
     * Get available slots for doctor on a specific date
     */
    public function get_available_slots($doctor_id = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $duration = $this->input->get('duration') ? (int)$this->input->get('duration') : 30;
        
        if (!$date) {
            $this->error('Date parameter required (format: YYYY-MM-DD)', 400);
            return;
        }
        
        $slots = $this->Appointment_model->get_available_slots($doctor_id, $date, $duration);
        
        // Debug: If no slots, return debug info to help diagnose
        if (empty($slots)) {
            $this->load->model('Doctor_model');
            $day_of_week = date('l', strtotime($date));
            $schedule = $this->Doctor_model->get_schedule($doctor_id);
            $all_days = array_unique(array_column($schedule, 'day_of_week'));
            $available_days = array();
            foreach ($schedule as $s) {
                if ($s['is_available'] == 1) {
                    $available_days[] = $s['day_of_week'];
                }
            }
            $available_days = array_unique($available_days);
            $matching_slots = array_filter($schedule, function($s) use ($day_of_week) {
                return strcasecmp($s['day_of_week'], $day_of_week) === 0;
            });
            
            // Return slots with debug info (only in development)
            if (ENVIRONMENT === 'development' || $this->input->get('debug') === '1') {
                $this->success(array(
                    'slots' => $slots,
                    'debug' => array(
                        'doctor_id' => $doctor_id,
                        'date' => $date,
                        'day_of_week' => $day_of_week,
                        'total_schedule_slots' => count($schedule),
                        'all_days_in_schedule' => array_values($all_days),
                        'available_days' => array_values($available_days),
                        'matching_slots_count' => count($matching_slots),
                        'matching_slots' => array_values($matching_slots)
                    )
                ));
            } else {
                $this->success($slots);
            }
        } else {
            $this->success($slots);
        }
    }

    /**
     * GET /api/appointments/doctor/:id/available-dates?month=YYYY-MM
     * Get available dates for doctor in a month
     */
    public function get_available_dates($doctor_id = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID required', 400);
            return;
        }
        
        $month = $this->input->get('month');
        
        if (!$month) {
            // Default to current month
            $month = date('Y-m');
        }
        
        // Validate month format
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            $this->error('Invalid month format. Use YYYY-MM', 400);
            return;
        }
        
        $result = $this->Appointment_model->get_available_dates($doctor_id, $month);
        $this->success($result);
    }

    /**
     * GET /api/appointments/doctor/:id - Get appointments by doctor
     */
    public function get_by_doctor($doctor_id = null) {
        if (!$doctor_id) {
            $this->error('Doctor ID required', 400);
            return;
        }
        
        $date = $this->input->get('date');
        $appointments = $this->Appointment_model->get_by_doctor($doctor_id, $date);
        $this->success($appointments);
    }

    /**
     * GET /api/appointments/patient/:id - Get appointments by patient
     */
    /**
     * Collect payment for an appointment
     * POST /api/appointments/{appointment_id}/payment
     * This will create a bill if it doesn't exist, then collect payment
     */
    public function payment($appointment_id = null) {
        try {
            // Check permission for collecting payment
            // Allow if user has add_appointment permission (for OPD billing) or is admin
            if (!$this->requirePermission('add_appointment')) {
                return;
            }
            
            if (!$appointment_id) {
                $appointment_id = $this->input->post('appointment_id');
            }
            
            if (!$appointment_id) {
                $this->error('Appointment ID is required', 400);
                return;
            }

            // Get appointment details
            $appointment = $this->Appointment_model->get_by_id($appointment_id);
            if (!$appointment) {
                $this->error('Appointment not found', 404);
                return;
            }

            $data = $this->get_request_data();
            
            if (empty($data['amount'])) {
                $this->error('Payment amount is required', 400);
                return;
            }

            // Check if bill exists for this appointment
            $bill = $this->Opd_billing_model->get_by_appointment($appointment_id);
            
            // If no bill exists, create one automatically
            if (!$bill) {
                // Get doctor's consultation fee
                $consultation_fee = 0.00;
                $fee_source = 'none';
                
                // First, try to use consultation fee from payment data (if provided)
                if (isset($data['consultation_fee']) && $data['consultation_fee'] > 0) {
                    $consultation_fee = floatval($data['consultation_fee']);
                    $fee_source = 'payment_data';
                } 
                // Otherwise, fetch from doctor's user settings (from user_share_procedures table)
                else if (!empty($appointment['doctor_doctor_id'])) {
                    $this->load->model('Doctor_model');
                    $doctor = $this->Doctor_model->get_by_id($appointment['doctor_doctor_id']);
                    if ($doctor && !empty($doctor['user_id'])) {
                        $this->load->model('User_model');
                        
                        // Get consultation fee from user_share_procedures where procedure_name = 'Consultation Charges'
                        $consultation_fee_from_procedures = $this->User_model->get_consultation_fee_from_procedures($doctor['user_id']);
                        
                        if ($consultation_fee_from_procedures !== null && $consultation_fee_from_procedures > 0) {
                            $consultation_fee = $consultation_fee_from_procedures;
                            $fee_source = 'doctor_share_procedures';
                        } else {
                            // Fallback to users.consultation_fee if not found in share_procedures
                            $user = $this->User_model->get_user_by_id($doctor['user_id']);
                            if ($user && isset($user['consultation_fee']) && $user['consultation_fee'] > 0) {
                                $consultation_fee = floatval($user['consultation_fee']);
                                $fee_source = 'doctor_settings';
                            } else {
                                $fee_source = 'doctor_settings_empty';
                                log_message('warning', "Doctor ID {$appointment['doctor_doctor_id']} (user_id: {$doctor['user_id']}) has no consultation fee set in share_procedures or users table");
                            }
                        }
                    } else {
                        $fee_source = 'doctor_not_found';
                        log_message('warning', "Doctor ID {$appointment['doctor_doctor_id']} not found or has no user_id");
                    }
                } else {
                    $fee_source = 'no_doctor_id';
                    log_message('warning', "Appointment {$appointment_id} has no doctor_doctor_id");
                }
                
                // Log if consultation fee is 0
                if ($consultation_fee == 0) {
                    log_message('info', "Creating OPD bill for appointment {$appointment_id} with consultation fee ₹0 (source: {$fee_source})");
                }
                
                $final_consultation_fee = $consultation_fee;
                
                // Create bill with consultation fee
                $bill_data = array(
                    'patient_id' => $appointment['patient_id'],
                    'appointment_id' => $appointment_id,
                    'bill_date' => date('Y-m-d'),
                    'consultation_fee' => $final_consultation_fee,
                    'lab_charges' => $data['lab_charges'] ?? 0.00,
                    'radiology_charges' => $data['radiology_charges'] ?? 0.00,
                    'medication_charges' => $data['medication_charges'] ?? 0.00,
                    'discount' => $data['discount'] ?? 0.00,
                    'discount_percentage' => $data['discount_percentage'] ?? 0.00,
                    'tax_rate' => $data['tax_rate'] ?? 0.00,
                    'insurance_covered' => $data['insurance_covered'] ?? 0.00,
                    'notes' => $data['bill_notes'] ?? 'Payment against appointment #' . $appointment_id,
                );

                // Set created_by if user is logged in
                if ($this->user && isset($this->user['id'])) {
                    $bill_data['created_by'] = $this->user['id'];
                }

                try {
                    $bill_id = $this->Opd_billing_model->create($bill_data);
                    
                    if (!$bill_id) {
                        log_message('error', 'Failed to create bill - Opd_billing_model->create returned false');
                        $this->error('Failed to create bill for appointment', 500);
                        return;
                    }
                } catch (Exception $e) {
                    log_message('error', 'Exception creating bill: ' . $e->getMessage());
                    log_message('error', 'Bill data: ' . json_encode($bill_data));
                    $this->error('Failed to create bill: ' . $e->getMessage(), 500);
                    return;
                }
                
                $bill = $this->Opd_billing_model->get_by_id($bill_id);
            } else {
                $bill_id = intval($bill['id']); // Ensure bill_id is integer
            }

            // Ensure bill_id is integer
            $bill_id = intval($bill_id);

            // Set processed_by
            if ($this->user && isset($this->user['id'])) {
                $data['processed_by'] = $this->user['id'];
            }

            // Ensure amount is float
            $data['amount'] = floatval($data['amount']);

            // Ensure PaymentProcessor library is loaded
            if (!isset($this->PaymentProcessor) || $this->PaymentProcessor === null) {
                // Check if library loader knows about it
                if ($this->load->is_loaded('PaymentProcessor')) {
                    // Library is loaded but property not set - manually assign
                    if (class_exists('PaymentProcessor')) {
                        $this->PaymentProcessor = new PaymentProcessor();
                    }
                } else {
                    // Try loading the library
                    $this->load->library('PaymentProcessor');
                }
                
                // If still not set, check if class exists and manually instantiate
                if ((!isset($this->PaymentProcessor) || $this->PaymentProcessor === null) && class_exists('PaymentProcessor')) {
                    $this->PaymentProcessor = new PaymentProcessor();
                }
                
                // Final check
                if (!isset($this->PaymentProcessor) || $this->PaymentProcessor === null) {
                    log_message('error', 'Appointments payment: Failed to load PaymentProcessor library');
                    log_message('error', 'PaymentProcessor class exists: ' . (class_exists('PaymentProcessor') ? 'yes' : 'no'));
                    log_message('error', 'PaymentProcessor is_loaded: ' . ($this->load->is_loaded('PaymentProcessor') ? 'yes' : 'no'));
                    log_message('error', 'PaymentProcessor property exists: ' . (property_exists($this, 'PaymentProcessor') ? 'yes' : 'no'));
                    $this->error('Payment processor not available', 500);
                    return;
                }
            }

            // Process payment against the bill
            try {
                $result = $this->PaymentProcessor->process_bill_payment('opd', $bill_id, $data);
            } catch (Exception $e) {
                log_message('error', 'PaymentProcessor error: ' . $e->getMessage());
                log_message('error', 'PaymentProcessor trace: ' . $e->getTraceAsString());
                log_message('error', 'Payment data: ' . json_encode($data));
                log_message('error', 'Bill ID: ' . $bill_id);
                $this->error('Payment processing failed: ' . $e->getMessage(), 500);
                return;
            }
            
            if ($result['success']) {
                $payment = $this->Patient_payment_model->get_by_id($result['payment_id']);
                $updated_bill = $this->Opd_billing_model->get_by_id($bill_id);
                $updated_bill['items'] = $this->Opd_billing_model->get_bill_items($bill_id);
                $updated_bill['total_paid'] = $this->Patient_payment_model->get_total_paid('opd', $bill_id);
                $updated_bill['payments'] = $this->Patient_payment_model->get_by_bill('opd', $bill_id);
                
                $this->success(array(
                    'payment' => $payment,
                    'bill' => $updated_bill,
                    'appointment' => $appointment
                ), 'Payment collected successfully against appointment', 201);
            } else {
                $this->error($result['error'] ?? 'Failed to collect payment', 400);
            }
        } catch (Exception $e) {
            log_message('error', 'Appointments payment error: ' . $e->getMessage());
            log_message('error', 'Appointments payment error trace: ' . $e->getTraceAsString());
            $this->error('Server error: ' . $e->getMessage() . ' (Line: ' . $e->getLine() . ')', 500);
        }
    }

    public function get_by_patient($patient_id = null) {
        if (!$patient_id) {
            $this->error('Patient ID required', 400);
            return;
        }
        
        $appointments = $this->Appointment_model->get_by_patient($patient_id);
        $this->success($appointments);
    }
}

