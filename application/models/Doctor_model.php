<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Doctor_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all doctors with optional filters
     */
    public function get_all($filters = array()) {
        $this->db->select('d.id, d.doctor_id, d.name, d.specialty, d.phone, d.email, d.experience, d.qualification, d.status, d.schedule_start, d.schedule_end, d.avatar, d.created_at');
        
        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $this->db->escape_like_str($filters['search']);
            $this->db->group_start();
            $this->db->like('d.name', $search);
            $this->db->or_like('d.specialty', $search);
            $this->db->or_like('d.doctor_id', $search);
            $this->db->group_end();
        }
        
        // Apply status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            // Status values in DB are: 'Available', 'Busy', 'Off Duty'
            $this->db->where('d.status', $filters['status']);
        }
        
        // Apply specialty filter
        if (!empty($filters['specialty'])) {
            $this->db->where('d.specialty', $filters['specialty']);
        }
        
        $this->db->order_by('d.created_at', 'DESC');
        $query = $this->db->get('doctors d');
        $doctors = $query->result_array();
        
        // Add statistics for each doctor
        foreach ($doctors as &$doctor) {
            $doctor['patients'] = $this->get_patient_count($doctor['id']);
            $doctor['rating'] = $this->get_average_rating($doctor['id']);
        }
        
        return $doctors;
    }

    /**
     * Get doctor by ID
     */
    public function get_by_id($id) {
        $query = $this->db->get_where('doctors', array('id' => $id));
        $doctor = $query->row_array();
        
        if ($doctor) {
            // Add statistics
            $doctor['patients'] = $this->get_patient_count($id);
            $doctor['rating'] = $this->get_average_rating($id);
            $doctor['total_appointments'] = $this->get_appointment_count($id);
        }
        
        return $doctor;
    }

    /**
     * Get doctor by doctor_id
     */
    public function get_by_doctor_id($doctor_id) {
        $query = $this->db->get_where('doctors', array('doctor_id' => $doctor_id));
        return $query->row_array();
    }

    /**
     * Create doctor
     */
    public function create($data) {
        $insert_data = array(
            'doctor_id' => $data['doctor_id'],
            'name' => $data['name'],
            'specialty' => $data['specialty'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'experience' => $data['experience'] ?? 0,
            'qualification' => $data['qualification'] ?? null,
            'status' => $data['status'] ?? 'Available',
            'schedule_start' => $data['schedule_start'] ?? '09:00:00',
            'schedule_end' => $data['schedule_end'] ?? '17:00:00',
            'avatar' => $data['avatar'] ?? null,
            'created_by' => $data['created_by'] ?? null
        );

        if ($this->db->insert('doctors', $insert_data)) {
            return $this->db->insert_id();
        }
        return false;
    }

    /**
     * Update doctor
     */
    public function update($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('doctors', $data);
    }

    /**
     * Delete doctor
     */
    public function delete($id) {
        $this->db->where('id', $id);
        return $this->db->delete('doctors');
    }

    /**
     * Generate unique doctor ID
     */
    public function generate_doctor_id() {
        // Get the last doctor ID
        $this->db->select('doctor_id');
        $this->db->order_by('id', 'DESC');
        $this->db->limit(1);
        $query = $this->db->get('doctors');
        $last_doctor = $query->row_array();

        if ($last_doctor && preg_match('/D(\d+)/', $last_doctor['doctor_id'], $matches)) {
            $next_number = intval($matches[1]) + 1;
        } else {
            $next_number = 1;
        }

        return 'D' . str_pad($next_number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Get doctor schedule
     */
    public function get_schedule($doctor_id) {
        $this->db->where('doctor_id', $doctor_id);
        $this->db->order_by('FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")');
        $query = $this->db->get('doctor_schedules');
        return $query->result_array();
    }

    /**
     * Update doctor schedule
     */
    public function update_schedule($doctor_id, $schedule_data) {
        // Start transaction
        $this->db->trans_start();
        
        // Delete existing schedule
        $this->db->where('doctor_id', $doctor_id);
        $this->db->delete('doctor_schedules');
        
        // Insert new schedule
        if (!empty($schedule_data) && is_array($schedule_data)) {
            foreach ($schedule_data as $schedule) {
                // Ensure time format is HH:MM:SS for MySQL
                $start_time = $schedule['start_time'];
                $end_time = $schedule['end_time'];
                
                // Convert HH:MM to HH:MM:SS if needed
                if (strlen($start_time) == 5) {
                    $start_time .= ':00';
                }
                if (strlen($end_time) == 5) {
                    $end_time .= ':00';
                }
                
                $insert_data = array(
                    'doctor_id' => $doctor_id,
                    'day_of_week' => $schedule['day_of_week'],
                    'start_time' => $start_time,
                    'end_time' => $end_time,
                    'is_available' => isset($schedule['is_available']) ? (int)$schedule['is_available'] : 1
                );
                
                $this->db->insert('doctor_schedules', $insert_data);
            }
        }
        
        // Complete transaction
        $this->db->trans_complete();
        
        if ($this->db->trans_status() === FALSE) {
            log_message('error', 'Failed to update schedule for doctor_id: ' . $doctor_id);
            return false;
        }
        
        return true;
    }

    /**
     * Get patient count for doctor
     */
    public function get_patient_count($doctor_id) {
        $this->db->select('COUNT(DISTINCT patient_id) as count');
        $this->db->where('doctor_id', $doctor_id);
        $query = $this->db->get('appointments');
        $result = $query->row_array();
        return $result ? (int)$result['count'] : 0;
    }

    /**
     * Get average rating for doctor
     */
    public function get_average_rating($doctor_id) {
        $this->db->select_avg('rating', 'avg_rating');
        $this->db->where('doctor_id', $doctor_id);
        $query = $this->db->get('doctor_ratings');
        $result = $query->row_array();
        return $result && $result['avg_rating'] ? round((float)$result['avg_rating'], 1) : 0.0;
    }

    /**
     * Get appointment count for doctor
     */
    public function get_appointment_count($doctor_id) {
        $this->db->where('doctor_id', $doctor_id);
        return $this->db->count_all_results('appointments');
    }

    /**
     * Get all specialties (distinct)
     */
    public function get_specialties() {
        $this->db->distinct();
        $this->db->select('specialty');
        $this->db->order_by('specialty', 'ASC');
        $query = $this->db->get('doctors');
        $results = $query->result_array();
        return array_column($results, 'specialty');
    }
}

