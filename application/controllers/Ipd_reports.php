<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

/**
 * IPD Reports API Controller
 * Provides report endpoints for IPD module
 */
class Ipd_reports extends Api {

    public function __construct() {
        parent::__construct();
        
        $this->load->model('Ipd_admission_model');
        $this->load->model('Ipd_ward_model');
        $this->load->model('Ipd_bed_model');
        $this->load->model('Ipd_room_model');
        $this->load->model('Ipd_billing_model');
        $this->load->model('Ipd_discharge_model');
        $this->load->model('Ipd_transfer_model');
        $this->load->model('Ipd_vital_sign_model');
        $this->load->model('Ipd_nursing_note_model');
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * Helper method to check report permissions
     */
    private function check_report_permission() {
        return $this->requireAnyPermission([
            'admin.view_financial_reports', 
            'admin.view_other_reports', 
            'doctor.view_patients_report'
        ]);
    }

    /**
     * Helper method to get common filters from request
     */
    private function get_filters() {
        return array(
            'date_from' => $this->input->get('date_from'),
            'date_to' => $this->input->get('date_to'),
            'ward_id' => $this->input->get('ward_id') ? (int)$this->input->get('ward_id') : null,
            'department' => $this->input->get('department'),
            'consultant_id' => $this->input->get('consultant_id') ? (int)$this->input->get('consultant_id') : null,
            'panel_id' => $this->input->get('panel_id'),
            'admission_type' => $this->input->get('admission_type'),
            'status' => $this->input->get('status')
        );
    }

    // ============================================
    // ADMISSION & DISCHARGE REPORTS
    // ============================================

    /**
     * GET /api/ipd/reports/daily-admissions
     * Daily Admissions Report
     */
    public function daily_admissions() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                DATE(ia.admission_date) as date,
                COUNT(*) as total_admissions,
                SUM(CASE WHEN ia.admission_type = "Emergency" THEN 1 ELSE 0 END) as emergency,
                SUM(CASE WHEN ia.admission_type = "Planned" THEN 1 ELSE 0 END) as planned,
                SUM(CASE WHEN ia.admission_type = "Transfer" THEN 1 ELSE 0 END) as transfers,
                COUNT(DISTINCT CASE WHEN ia.status != "discharged" AND ia.status != "absconded" THEN ia.id END) as current_patients
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            if ($filters['admission_type']) {
                $this->db->where('ia.admission_type', $filters['admission_type']);
            }
            
            $this->db->group_by('DATE(ia.admission_date)');
            $this->db->order_by('date', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Calculate bed occupancy percentage (simplified)
            foreach ($data as &$row) {
                $this->db->select('
                    COUNT(DISTINCT ib.id) as total_beds,
                    COUNT(DISTINCT CASE WHEN ib.status = "occupied" THEN ib.id END) as occupied_beds
                ');
                $this->db->from('ipd_beds ib');
                if ($filters['ward_id']) {
                    $this->db->where('ib.ward_id', $filters['ward_id']);
                }
                $bed_stats = $this->db->get()->row_array();
                $row['bed_occupancy'] = $bed_stats['total_beds'] > 0 
                    ? round(($bed_stats['occupied_beds'] / $bed_stats['total_beds']) * 100, 1) 
                    : 0;
                $row['value'] = $row['total_admissions'];
            }
            
            // Calculate summary
            $summary = array(
                'total_admissions' => array_sum(array_column($data, 'total_admissions')),
                'emergency_admissions' => array_sum(array_column($data, 'emergency')),
                'planned_admissions' => array_sum(array_column($data, 'planned')),
                'transfers' => array_sum(array_column($data, 'transfers')),
                'avg_occupancy' => count($data) > 0 ? round(array_sum(array_column($data, 'bed_occupancy')) / count($data), 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD daily admissions report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/daily-discharges
     * Daily Discharges Report
     */
    public function daily_discharges() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                DATE(ia.discharge_date) as date,
                COUNT(*) as total_discharges,
                SUM(CASE WHEN ids.condition_at_discharge = "Improved" OR ids.condition_at_discharge = "Cured" THEN 1 ELSE 0 END) as regular,
                SUM(CASE WHEN ia.status = "absconded" THEN 1 ELSE 0 END) as dama,
                SUM(CASE WHEN ids.condition_at_discharge = "Referred" THEN 1 ELSE 0 END) as referred,
                SUM(CASE WHEN ids.condition_at_discharge = "Expired" OR ids.condition_at_discharge = "Death" THEN 1 ELSE 0 END) as deaths,
                AVG(DATEDIFF(ia.discharge_date, ia.admission_date)) as avg_los
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->join('ipd_discharge_summaries ids', 'ids.admission_id = ia.id', 'left');
            $this->db->where('ia.discharge_date >=', $date_from);
            $this->db->where('ia.discharge_date <=', $date_to);
            $this->db->where('ia.discharge_date IS NOT NULL');
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->group_by('DATE(ia.discharge_date)');
            $this->db->order_by('date', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['regular'] = (int)$row['regular'];
                $row['dama'] = (int)$row['dama'];
                $row['referred'] = (int)$row['referred'];
                $row['deaths'] = (int)$row['deaths'];
                $row['avgLOS'] = round($row['avg_los'], 1);
                $row['avgLOSDays'] = $row['avgLOS'];
                $row['value'] = $row['total_discharges'];
            }
            
            // Calculate summary
            $summary = array(
                'total_discharges' => array_sum(array_column($data, 'total_discharges')),
                'regular_discharge' => array_sum(array_column($data, 'regular')),
                'DAMA' => array_sum(array_column($data, 'dama')),
                'referred' => array_sum(array_column($data, 'referred')),
                'deaths' => array_sum(array_column($data, 'deaths')),
                'avgLOS' => count($data) > 0 ? round(array_sum(array_column($data, 'avgLOS')) / count($data), 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD daily discharges report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/alos
     * Average Length of Stay (ALOS) Report
     */
    public function alos() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-90 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            $group_by = $this->input->get('group_by') ?: 'department'; // department or ward
            
            $this->db->select('
                ' . ($group_by === 'ward' ? 'iw.name as name, iw.name as department' : 'ia.department as name, ia.department as department') . ',
                COUNT(*) as total_patients,
                AVG(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as avg_los,
                MIN(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as min_los,
                MAX(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as max_los
            ');
            $this->db->from('ipd_admissions ia');
            if ($group_by === 'ward') {
                $this->db->join('ipd_wards iw', 'iw.id = ia.ward_id', 'left');
            }
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            if ($group_by === 'ward') {
                $this->db->group_by('ia.ward_id', 'iw.name');
            } else {
                $this->db->group_by('ia.department');
            }
            $this->db->order_by('avg_los', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['totalPatients'] = (int)$row['total_patients'];
                $row['avgLOS'] = round($row['avg_los'], 1);
                $row['avgLOSDays'] = $row['avgLOS'];
                $row['minLOS'] = (int)$row['min_los'];
                $row['maxLOS'] = (int)$row['max_los'];
                $row['benchmark'] = round($row['avg_los'] * 1.1, 1); // 10% above average as benchmark
                $row['value'] = $row['avgLOS'];
            }
            
            // Calculate summary
            $total_patients = array_sum(array_column($data, 'totalPatients'));
            $overall_alos = $total_patients > 0 
                ? round(array_sum(array_map(function($r) { return $r['avgLOS'] * $r['totalPatients']; }, $data)) / $total_patients, 1)
                : 0;
            
            $summary = array(
                'overallALOS' => $overall_alos,
                'departments' => count($data),
                'totalPatients' => $total_patients,
                'benchmarkALOS' => round($overall_alos * 1.1, 1)
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD ALOS report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/transfers
     * Transfers In/Out Report
     */
    public function transfers() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                it.transfer_date as date,
                CONCAT(it.transfer_time) as time,
                p.name as patient_name,
                ia.ipd_number,
                iw1.name as from_ward_name,
                iw2.name as to_ward_name,
                ib1.bed_number as from_bed_number,
                ib2.bed_number as to_bed_number,
                it.transfer_reason as reason,
                u.name as authorized_by,
                CONCAT(it.transfer_date, " ", it.transfer_time) as transfer_datetime
            ');
            $this->db->from('ipd_transfers it');
            $this->db->join('ipd_admissions ia', 'ia.id = it.admission_id', 'left');
            $this->db->join('patients p', 'p.id = it.patient_id', 'left');
            $this->db->join('ipd_wards iw1', 'iw1.id = it.from_ward_id', 'left');
            $this->db->join('ipd_wards iw2', 'iw2.id = it.to_ward_id', 'left');
            $this->db->join('ipd_beds ib1', 'ib1.id = it.from_bed_id', 'left');
            $this->db->join('ipd_beds ib2', 'ib2.id = it.to_bed_id', 'left');
            $this->db->join('users u', 'u.id = it.transferred_by_user_id', 'left');
            $this->db->where('it.transfer_date >=', $date_from);
            $this->db->where('it.transfer_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('(it.from_ward_id = ' . (int)$filters['ward_id'] . ' OR it.to_ward_id = ' . (int)$filters['ward_id'] . ')');
            }
            
            $this->db->order_by('it.transfer_date', 'DESC');
            $this->db->order_by('it.transfer_time', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['patient'] = $row['patient_name'] . ' (' . $row['ipd_number'] . ')';
                $row['fromWard'] = $row['from_ward_name'] . ($row['from_bed_number'] ? ' - Bed ' . $row['from_bed_number'] : '');
                $row['toWard'] = $row['to_ward_name'] . ($row['to_bed_number'] ? ' - Bed ' . $row['to_bed_number'] : '');
                $row['authorizedBy'] = $row['authorized_by'];
                $row['Time'] = $row['time'];
            }
            
            // Calculate summary
            $summary = array(
                'totalTransfers' => count($data),
                'emergencyUpgrade' => count(array_filter($data, function($r) { return stripos($r['reason'], 'emergency') !== false; })),
                'clinicalImprovement' => count(array_filter($data, function($r) { return stripos($r['reason'], 'improvement') !== false; })),
                'others' => count($data) - count(array_filter($data, function($r) { 
                    return stripos($r['reason'], 'emergency') !== false || stripos($r['reason'], 'improvement') !== false; 
                }))
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD transfers report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/bed-occupancy
     * Bed Occupancy Report
     */
    public function bed_occupancy() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            $filters = $this->get_filters();
            
            $this->db->select('
                iw.id as ward_id,
                iw.name as ward_name,
                COUNT(DISTINCT ib.id) as total_beds,
                COUNT(DISTINCT CASE WHEN ib.status = "occupied" THEN ib.id END) as occupied,
                COUNT(DISTINCT CASE WHEN ib.status = "available" THEN ib.id END) as available,
                COUNT(DISTINCT CASE WHEN ib.status = "maintenance" THEN ib.id END) as under_maintenance
            ');
            $this->db->from('ipd_wards iw');
            $this->db->join('ipd_beds ib', 'ib.ward_id = iw.id', 'left');
            
            if ($filters['ward_id']) {
                $this->db->where('iw.id', $filters['ward_id']);
            }
            
            $this->db->group_by('iw.id', 'iw.name');
            $this->db->order_by('iw.name', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data and calculate occupancy percentage
            foreach ($data as &$row) {
                $row['totalBeds'] = (int)$row['total_beds'];
                $row['occupied'] = (int)$row['occupied'];
                $row['available'] = (int)$row['available'];
                $row['underMaintenance'] = (int)$row['under_maintenance'];
                $row['occupancyPercent'] = $row['totalBeds'] > 0 
                    ? round(($row['occupied'] / $row['totalBeds']) * 100, 1) 
                    : 0;
            }
            
            // Calculate summary
            $total_beds = array_sum(array_column($data, 'totalBeds'));
            $occupied_beds = array_sum(array_column($data, 'occupied'));
            $available_beds = array_sum(array_column($data, 'available'));
            $maintenance = array_sum(array_column($data, 'underMaintenance'));
            
            $summary = array(
                'totalBeds' => $total_beds,
                'occupiedBeds' => $occupied_beds,
                'availableBeds' => $available_beds,
                'maintenance' => $maintenance,
                'occupancyRate' => $total_beds > 0 ? round(($occupied_beds / $total_beds) * 100, 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD bed occupancy report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/bed-turnover
     * Bed Turnover Rate Report
     */
    public function bed_turnover() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            // Get bed turnover data
            $this->db->select('
                iw.id as ward_id,
                iw.name as ward_name,
                COUNT(DISTINCT ib.id) as total_beds,
                COUNT(DISTINCT ia.id) as total_admissions,
                COUNT(DISTINCT CASE WHEN ia.discharge_date IS NOT NULL THEN ia.id END) as total_discharges,
                AVG(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as avg_los
            ');
            $this->db->from('ipd_wards iw');
            $this->db->join('ipd_beds ib', 'ib.ward_id = iw.id', 'left');
            $this->db->join('ipd_admissions ia', 'ia.bed_id = ib.id AND ia.admission_date >= "' . $date_from . '" AND ia.admission_date <= "' . $date_to . '"', 'left');
            
            if ($filters['ward_id']) {
                $this->db->where('iw.id', $filters['ward_id']);
            }
            
            $this->db->group_by('iw.id', 'iw.name');
            $this->db->order_by('iw.name', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Calculate turnover rate
            $days_period = (strtotime($date_to) - strtotime($date_from)) / 86400 + 1;
            
            foreach ($data as &$row) {
                $row['totalBeds'] = (int)$row['total_beds'];
                $row['totalAdmissions'] = (int)$row['total_admissions'];
                $row['totalDischarges'] = (int)$row['total_discharges'];
                $row['avgLOS'] = round($row['avg_los'], 1);
                
                // Turnover rate = (Total discharges / Total beds) / (Days in period / 30)
                $row['turnoverRate'] = $row['totalBeds'] > 0 && $days_period > 0
                    ? round(($row['totalDischarges'] / $row['totalBeds']) / ($days_period / 30), 2)
                    : 0;
            }
            
            // Calculate summary
            $summary = array(
                'totalBeds' => array_sum(array_column($data, 'totalBeds')),
                'totalAdmissions' => array_sum(array_column($data, 'totalAdmissions')),
                'totalDischarges' => array_sum(array_column($data, 'totalDischarges')),
                'avgTurnoverRate' => count($data) > 0 ? round(array_sum(array_column($data, 'turnoverRate')) / count($data), 2) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD bed turnover report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/census
     * Patient Census Report (Ward-Wise / Consultant-Wise)
     */
    public function census() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $group_by = $this->input->get('group_by') ?: 'ward'; // ward or consultant
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            if ($group_by === 'ward') {
                $this->db->select('
                    DATE(ia.admission_date) as date,
                    iw.name as ward_name,
                    COUNT(DISTINCT CASE WHEN DATE(ia.admission_date) <= DATE("' . $date_to . '") AND (ia.discharge_date IS NULL OR DATE(ia.discharge_date) > DATE("' . $date_to . '")) THEN ia.id END) as midnight_census,
                    COUNT(DISTINCT CASE WHEN DATE(ia.admission_date) = DATE("' . $date_to . '") THEN ia.id END) as admissions,
                    COUNT(DISTINCT CASE WHEN DATE(ia.discharge_date) = DATE("' . $date_to . '") THEN ia.id END) as discharges,
                    COUNT(DISTINCT CASE WHEN DATE(it.transfer_date) = DATE("' . $date_to . '") AND it.to_ward_id = iw.id THEN it.id END) as transfers_in,
                    COUNT(DISTINCT CASE WHEN DATE(it.transfer_date) = DATE("' . $date_to . '") AND it.from_ward_id = iw.id THEN it.id END) as transfers_out
                ');
                $this->db->from('ipd_wards iw');
                $this->db->join('ipd_admissions ia', 'ia.ward_id = iw.id', 'left');
                $this->db->join('ipd_transfers it', 'it.admission_id = ia.id', 'left');
                
                if ($filters['ward_id']) {
                    $this->db->where('iw.id', $filters['ward_id']);
                }
                
                $this->db->group_by('DATE("' . $date_to . '")', 'iw.id', 'iw.name');
            } else {
                // Consultant-wise
                $this->db->select('
                    DATE(ia.admission_date) as date,
                    d.name as consultant_name,
                    COUNT(DISTINCT CASE WHEN DATE(ia.admission_date) <= DATE("' . $date_to . '") AND (ia.discharge_date IS NULL OR DATE(ia.discharge_date) > DATE("' . $date_to . '")) THEN ia.id END) as midnight_census,
                    COUNT(DISTINCT CASE WHEN DATE(ia.admission_date) = DATE("' . $date_to . '") THEN ia.id END) as admissions,
                    COUNT(DISTINCT CASE WHEN DATE(ia.discharge_date) = DATE("' . $date_to . '") THEN ia.id END) as discharges
                ');
                $this->db->from('ipd_admissions ia');
                $this->db->join('doctors d', 'd.id = ia.consulting_doctor_id', 'left');
                
                if ($filters['consultant_id']) {
                    $this->db->where('ia.consulting_doctor_id', $filters['consultant_id']);
                }
                
                $this->db->group_by('DATE("' . $date_to . '")', 'd.id', 'd.name');
            }
            
            $this->db->order_by('date', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['midnightCensus'] = (int)$row['midnight_census'];
                $row['admissions'] = (int)$row['admissions'];
                $row['discharges'] = (int)$row['discharges'];
                $row['transfersIn'] = isset($row['transfers_in']) ? (int)$row['transfers_in'] : 0;
                $row['transfersOut'] = isset($row['transfers_out']) ? (int)$row['transfers_out'] : 0;
                $row['value'] = $row['midnightCensus'];
            }
            
            // Calculate summary
            $current_census = count($data) > 0 ? $data[0]['midnightCensus'] : 0;
            $this->db->select('COUNT(DISTINCT ib.id) as total_beds');
            $this->db->from('ipd_beds ib');
            if ($filters['ward_id']) {
                $this->db->where('ib.ward_id', $filters['ward_id']);
            }
            $bed_count = $this->db->get()->row_array();
            $total_capacity = (int)($bed_count['total_beds'] ?? 0);
            
            $summary = array(
                'averageCensus' => count($data) > 0 ? round(array_sum(array_column($data, 'midnightCensus')) / count($data), 0) : 0,
                'currentCensus' => $current_census,
                'totalCapacity' => $total_capacity,
                'occupancyRate' => $total_capacity > 0 ? round(($current_census / $total_capacity) * 100, 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD census report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============================================
    // BILLING & FINANCE REPORTS
    // ============================================

    /**
     * GET /api/ipd/reports/revenue
     * IPD Revenue Summary Report
     */
    public function revenue() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            $group_by = $this->input->get('group_by') ?: 'department'; // department or ward
            
            $this->db->select('
                ' . ($group_by === 'ward' ? 'iw.name as department' : 'ia.department') . ',
                COUNT(DISTINCT ib.id) as total_patients,
                SUM(ib.total_amount) as total_revenue,
                SUM(COALESCE(JSON_EXTRACT(ib.room_charges, "$.total"), 0)) as bed_charges,
                SUM(ib.medication_charges) as pharmacy,
                SUM(ib.lab_charges + ib.imaging_charges) as lab_radiology,
                SUM(ib.total_amount - ib.medication_charges - ib.lab_charges - ib.imaging_charges - COALESCE(JSON_EXTRACT(ib.room_charges, "$.total"), 0)) as services
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            if ($group_by === 'ward') {
                $this->db->join('ipd_wards iw', 'iw.id = ia.ward_id', 'left');
            }
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            if ($group_by === 'ward') {
                $this->db->group_by('ia.ward_id', 'iw.name');
            } else {
                $this->db->group_by('ia.department');
            }
            $this->db->order_by('total_revenue', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['department'] = $row['department'] ?: 'Unknown';
                $row['totalRevenue'] = (float)$row['total_revenue'];
                $row['bedCharges'] = (float)$row['bed_charges'];
                $row['services'] = (float)$row['services'];
                $row['pharmacy'] = (float)$row['pharmacy'];
                $row['labRadiology'] = (float)$row['lab_radiology'];
                $row['growthPercent'] = 0; // Would need historical comparison
                $row['value'] = $row['totalRevenue'];
            }
            
            // Calculate summary
            $total_revenue = array_sum(array_column($data, 'totalRevenue'));
            $total_patients = array_sum(array_column($data, 'total_patients'));
            
            $summary = array(
                'totalRevenue' => $total_revenue,
                'avgPerPatient' => $total_patients > 0 ? round($total_revenue / $total_patients, 2) : 0,
                'monthlyGrowth' => 0, // Would need historical comparison
                'departments' => count($data)
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD revenue report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/consultant-revenue
     * Consultant Wise Revenue Report
     */
    public function consultant_revenue() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                d.id as consultant_id,
                d.name as consultant_name,
                d.specialty,
                COUNT(DISTINCT ib.id) as total_patients,
                SUM(ib.total_amount) as total_revenue,
                AVG(ib.total_amount) as avg_revenue_per_patient
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->join('doctors d', 'd.id = ia.consulting_doctor_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            
            if ($filters['consultant_id']) {
                $this->db->where('ia.consulting_doctor_id', $filters['consultant_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->group_by('d.id', 'd.name', 'd.specialty');
            $this->db->order_by('total_revenue', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['consultantName'] = $row['consultant_name'] ?: 'Unknown';
                $row['specialty'] = $row['specialty'] ?: 'N/A';
                $row['totalPatients'] = (int)$row['total_patients'];
                $row['totalRevenue'] = (float)$row['total_revenue'];
                $row['avgRevenuePerPatient'] = round((float)$row['avg_revenue_per_patient'], 2);
                $row['value'] = $row['totalRevenue'];
            }
            
            // Calculate summary
            $summary = array(
                'totalConsultants' => count($data),
                'totalRevenue' => array_sum(array_column($data, 'totalRevenue')),
                'totalPatients' => array_sum(array_column($data, 'totalPatients')),
                'avgRevenuePerConsultant' => count($data) > 0 ? round(array_sum(array_column($data, 'totalRevenue')) / count($data), 2) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD consultant revenue report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/billing-summary
     * Department Wise Billing Summary
     */
    public function billing_summary() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                ia.ipd_number,
                p.name as patient_name,
                ia.admission_date,
                DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date) as los,
                ib.total_amount as total_bill,
                ib.advance_paid as paid,
                ib.due_amount as outstanding,
                ib.payment_status as status
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            if ($filters['consultant_id']) {
                $this->db->where('ia.consulting_doctor_id', $filters['consultant_id']);
            }
            
            $this->db->order_by('ib.billing_date', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['patientId'] = $row['ipd_number'];
                $row['name'] = $row['patient_name'];
                $row['admissionDate'] = $row['admission_date'];
                $row['LOS'] = (int)$row['los'];
                $row['totalBill'] = (float)$row['total_bill'];
                $row['paid'] = (float)$row['paid'];
                $row['outstanding'] = (float)$row['outstanding'];
                $row['status'] = ucfirst($row['status']);
            }
            
            // Calculate summary
            $summary = array(
                'totalPatients' => count($data),
                'billAmount' => array_sum(array_column($data, 'totalBill')),
                'amountPaid' => array_sum(array_column($data, 'paid')),
                'outstanding' => array_sum(array_column($data, 'outstanding'))
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD billing summary report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/advance-received
     * Advance Received Report
     */
    public function advance_received() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                DATE(ib.billing_date) as date,
                SUM(ib.advance_paid) as total_advance,
                COUNT(DISTINCT ib.id) as total_patients
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            $this->db->where('ib.advance_paid >', 0);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->group_by('DATE(ib.billing_date)');
            $this->db->order_by('date', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['totalAdvance'] = (float)$row['total_advance'];
                $row['totalPatients'] = (int)$row['total_patients'];
                $row['value'] = $row['totalAdvance'];
            }
            
            // Calculate summary
            $summary = array(
                'totalAdvance' => array_sum(array_column($data, 'totalAdvance')),
                'totalPatients' => array_sum(array_column($data, 'totalPatients')),
                'avgAdvancePerPatient' => array_sum(array_column($data, 'totalPatients')) > 0 
                    ? round(array_sum(array_column($data, 'totalAdvance')) / array_sum(array_column($data, 'totalPatients')), 2)
                    : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD advance received report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/pending-bills
     * Pending Bills / Outstanding Dues Report
     */
    public function pending_bills() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            
            $this->db->select('
                p.name as patient_name,
                ia.ipd_number,
                ib.billing_date,
                ib.total_amount,
                ib.advance_paid,
                ib.due_amount,
                DATEDIFF(CURDATE(), ib.billing_date) as days_overdue,
                p.phone as contact,
                ib.payment_status
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->where('ib.due_amount >', 0);
            $this->db->where_in('ib.payment_status', array('pending', 'partial'));
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->order_by('ib.due_amount', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['patient'] = $row['patient_name'] . ' (' . $row['ipd_number'] . ')';
                $row['billDate'] = $row['billing_date'];
                $row['totalAmount'] = (float)$row['total_amount'];
                $row['paid'] = (float)$row['advance_paid'];
                $row['outstanding'] = (float)$row['due_amount'];
                $row['daysOverdue'] = (int)$row['days_overdue'];
                $row['contact'] = $row['contact'];
                $row['status'] = ucfirst($row['payment_status']);
            }
            
            // Calculate summary
            $total_outstanding = array_sum(array_column($data, 'outstanding'));
            $over_30_days = count(array_filter($data, function($r) { return $r['daysOverdue'] > 30; }));
            $over_60_days = count(array_filter($data, function($r) { return $r['daysOverdue'] > 60; }));
            
            $summary = array(
                'totalOutstanding' => $total_outstanding,
                'patients' => count($data),
                'over30days' => $over_30_days,
                'over60days' => $over_60_days
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD pending bills report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/bill-comparison
     * Final Bill vs Estimate Comparison
     */
    public function bill_comparison() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                ia.ipd_number,
                p.name as patient_name,
                ia.admission_date,
                ia.estimated_duration,
                DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date) as actual_duration,
                ib.total_amount as final_bill,
                (ia.estimated_duration * COALESCE(ib.total_amount / NULLIF(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date), 0), 0)) as estimated_bill
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            $this->db->where('ia.estimated_duration IS NOT NULL');
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data and calculate variance
            foreach ($data as &$row) {
                $estimated = (float)$row['estimated_bill'];
                $final = (float)$row['final_bill'];
                $variance = $final - $estimated;
                $variance_percent = $estimated > 0 ? round(($variance / $estimated) * 100, 1) : 0;
                
                $row['patient'] = $row['patient_name'];
                $row['estimatedBill'] = round($estimated, 2);
                $row['finalBill'] = round($final, 2);
                $row['variance'] = round($variance, 2);
                $row['variancePercent'] = $variance_percent;
                $row['status'] = abs($variance_percent) <= 10 ? 'Within Range' : ($variance_percent > 10 ? 'Exceeded' : 'Under');
            }
            
            // Calculate summary
            $summary = array(
                'totalCases' => count($data),
                'avgVariance' => count($data) > 0 ? round(array_sum(array_column($data, 'variancePercent')) / count($data), 1) : 0,
                'exceedances' => count(array_filter($data, function($r) { return $r['variancePercent'] > 10; })),
                'underUtilization' => count(array_filter($data, function($r) { return $r['variancePercent'] < -10; }))
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD bill comparison report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/panel-billing
     * Panel / Insurance Billing Summary
     */
    public function panel_billing() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                COALESCE(ia.insurance_provider, "Cash") as panel_name,
                COUNT(DISTINCT ib.id) as total_billing,
                SUM(ib.total_amount) as total_billing_amount,
                SUM(ib.insurance_covered) as insurance_covered,
                SUM(ib.due_amount) as due_amount
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            
            if ($filters['panel_id']) {
                $this->db->where('ia.insurance_provider', $filters['panel_id']);
            }
            
            $this->db->group_by('ia.insurance_provider');
            $this->db->order_by('total_billing_amount', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['panelName'] = $row['panel_name'];
                $row['totalBilling'] = (float)$row['total_billing_amount'];
                $row['insuranceCovered'] = (float)$row['insurance_covered'];
                $row['dueAmount'] = (float)$row['due_amount'];
                $row['collectionPercent'] = $row['totalBilling'] > 0 
                    ? round((($row['totalBilling'] - $row['dueAmount']) / $row['totalBilling']) * 100, 1)
                    : 0;
                $row['value'] = $row['totalBilling'];
            }
            
            // Calculate summary
            $summary = array(
                'totalPanels' => count($data),
                'totalBilling' => array_sum(array_column($data, 'totalBilling')),
                'totalInsuranceCovered' => array_sum(array_column($data, 'insuranceCovered')),
                'totalDue' => array_sum(array_column($data, 'dueAmount'))
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD panel billing report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============================================
    // CLINICAL & MEDICAL REPORTS
    // ============================================

    /**
     * GET /api/ipd/reports/diagnosis-wise
     * Diagnosis Wise Report
     */
    public function diagnosis_wise() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-90 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                COALESCE(ids.final_diagnosis, ia.diagnosis) as diagnosis,
                COUNT(DISTINCT ia.id) as patient_count,
                AVG(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as avg_los
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->join('ipd_discharge_summaries ids', 'ids.admission_id = ia.id', 'left');
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            $this->db->where('(ia.diagnosis IS NOT NULL OR ids.final_diagnosis IS NOT NULL)');
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->group_by('diagnosis');
            $this->db->order_by('patient_count', 'DESC');
            $this->db->limit(50);
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['diagnosis'] = $row['diagnosis'] ?: 'Unknown';
                $row['patientCount'] = (int)$row['patient_count'];
                $row['avgLOS'] = round($row['avg_los'], 1);
                $row['value'] = $row['patientCount'];
            }
            
            $summary = array(
                'totalDiagnoses' => count($data),
                'totalPatients' => array_sum(array_column($data, 'patientCount')),
                'avgLOS' => count($data) > 0 ? round(array_sum(array_column($data, 'avgLOS')) / count($data), 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD diagnosis wise report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/procedure-wise
     * Procedure Wise Report
     */
    public function procedure_wise() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-90 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            // Get procedures from discharge summaries (stored as JSON)
            $this->db->select('
                ids.procedures_performed,
                ia.id as admission_id,
                ia.admission_date,
                ia.discharge_date
            ');
            $this->db->from('ipd_discharge_summaries ids');
            $this->db->join('ipd_admissions ia', 'ia.id = ids.admission_id', 'left');
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            $this->db->where('ids.procedures_performed IS NOT NULL');
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $query = $this->db->get();
            $raw_data = $query->result_array();
            
            // Parse JSON and aggregate procedures
            $procedures = array();
            foreach ($raw_data as $row) {
                $proc_data = json_decode($row['procedures_performed'], true);
                if (is_array($proc_data)) {
                    foreach ($proc_data as $proc) {
                        $proc_name = is_array($proc) ? ($proc['name'] ?? $proc['procedure'] ?? 'Unknown') : $proc;
                        if (!isset($procedures[$proc_name])) {
                            $procedures[$proc_name] = array('count' => 0, 'admissions' => array());
                        }
                        $procedures[$proc_name]['count']++;
                        $procedures[$proc_name]['admissions'][] = $row['admission_id'];
                    }
                }
            }
            
            // Format data
            $data = array();
            foreach ($procedures as $name => $info) {
                $data[] = array(
                    'procedure' => $name,
                    'frequency' => $info['count'],
                    'value' => $info['count']
                );
            }
            
            usort($data, function($a, $b) { return $b['frequency'] - $a['frequency']; });
            
            $summary = array(
                'totalProcedures' => count($data),
                'totalPerformed' => array_sum(array_column($data, 'frequency'))
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD procedure wise report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/doctor-patient-load
     * Doctor Wise Patient Load
     */
    public function doctor_patient_load() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                d.id as doctor_id,
                d.name as doctor_name,
                d.specialty,
                COUNT(DISTINCT ia.id) as total_patients,
                COUNT(DISTINCT CASE WHEN ia.status != "discharged" AND ia.status != "absconded" THEN ia.id END) as active_patients,
                AVG(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as avg_los
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->join('doctors d', 'd.id = ia.consulting_doctor_id', 'left');
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            
            if ($filters['consultant_id']) {
                $this->db->where('ia.consulting_doctor_id', $filters['consultant_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->group_by('d.id', 'd.name', 'd.specialty');
            $this->db->order_by('total_patients', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['doctorName'] = $row['doctor_name'] ?: 'Unknown';
                $row['specialty'] = $row['specialty'] ?: 'N/A';
                $row['totalPatients'] = (int)$row['total_patients'];
                $row['activePatients'] = (int)$row['active_patients'];
                $row['avgLOS'] = round($row['avg_los'], 1);
                $row['value'] = $row['totalPatients'];
            }
            
            $summary = array(
                'totalDoctors' => count($data),
                'totalPatients' => array_sum(array_column($data, 'totalPatients')),
                'activePatients' => array_sum(array_column($data, 'activePatients')),
                'avgPatientsPerDoctor' => count($data) > 0 ? round(array_sum(array_column($data, 'totalPatients')) / count($data), 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD doctor patient load report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/vital-monitoring
     * Vital Monitoring Summary
     */
    public function vital_monitoring() {
        try {
            // Check permission for viewing IPD reports
            if (!$this->check_report_permission()) {
                return;
            }
            
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-7 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                DATE(ivs.recorded_date) as date,
                COUNT(DISTINCT ivs.id) as total_recordings,
                COUNT(DISTINCT ivs.admission_id) as patients_monitored,
                AVG(ivs.temperature) as avg_temperature,
                AVG(ivs.blood_pressure_systolic) as avg_bp_systolic,
                AVG(ivs.blood_pressure_diastolic) as avg_bp_diastolic,
                AVG(ivs.heart_rate) as avg_heart_rate,
                AVG(ivs.respiratory_rate) as avg_respiratory_rate,
                AVG(ivs.oxygen_saturation) as avg_spo2
            ');
            $this->db->from('ipd_vital_signs ivs');
            $this->db->join('ipd_admissions ia', 'ia.id = ivs.admission_id', 'left');
            $this->db->where('ivs.recorded_date >=', $date_from);
            $this->db->where('ivs.recorded_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->group_by('DATE(ivs.recorded_date)');
            $this->db->order_by('date', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['totalRecordings'] = (int)$row['total_recordings'];
                $row['patientsMonitored'] = (int)$row['patients_monitored'];
                $row['avgTemperature'] = round($row['avg_temperature'], 1);
                $row['avgBPSystolic'] = round($row['avg_bp_systolic'], 0);
                $row['avgBPDiastolic'] = round($row['avg_bp_diastolic'], 0);
                $row['avgHeartRate'] = round($row['avg_heart_rate'], 0);
                $row['avgRespiratoryRate'] = round($row['avg_respiratory_rate'], 0);
                $row['avgSpO2'] = round($row['avg_spo2'], 1);
                $row['value'] = $row['totalRecordings'];
            }
            
            $summary = array(
                'totalRecordings' => array_sum(array_column($data, 'totalRecordings')),
                'totalPatientsMonitored' => count($data) > 0 ? max(array_column($data, 'patientsMonitored')) : 0,
                'avgTemperature' => count($data) > 0 ? round(array_sum(array_column($data, 'avgTemperature')) / count($data), 1) : 0,
                'avgHeartRate' => count($data) > 0 ? round(array_sum(array_column($data, 'avgHeartRate')) / count($data), 0) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD vital monitoring report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============================================
    // BED & ROOM MANAGEMENT REPORTS
    // ============================================

    /**
     * GET /api/ipd/reports/realtime-occupancy
     * Real-Time Bed Occupancy Report
     */
    public function realtime_occupancy() {
        // Same as bed_occupancy but with current timestamp
        return $this->bed_occupancy();
    }

    /**
     * GET /api/ipd/reports/ward-saturation
     * Ward Saturation Report
     */
    public function ward_saturation() {
        try {
            $filters = $this->get_filters();
            
            $this->db->select('
                iw.id as ward_id,
                iw.name as ward_name,
                COUNT(DISTINCT ib.id) as capacity,
                COUNT(DISTINCT CASE WHEN ib.status = "occupied" THEN ib.id END) as current_patients,
                COUNT(DISTINCT CASE WHEN ia.status != "discharged" AND ia.status != "absconded" THEN ia.id END) as active_patients
            ');
            $this->db->from('ipd_wards iw');
            $this->db->join('ipd_beds ib', 'ib.ward_id = iw.id', 'left');
            $this->db->join('ipd_admissions ia', 'ia.ward_id = iw.id', 'left');
            
            if ($filters['ward_id']) {
                $this->db->where('iw.id', $filters['ward_id']);
            }
            
            $this->db->group_by('iw.id', 'iw.name');
            $this->db->order_by('iw.name', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data and calculate saturation
            foreach ($data as &$row) {
                $row['ward'] = $row['ward_name'];
                $row['capacity'] = (int)$row['capacity'];
                $row['currentPatients'] = (int)$row['current_patients'];
                $row['saturationPercent'] = $row['capacity'] > 0 
                    ? round(($row['currentPatients'] / $row['capacity']) * 100, 1) 
                    : 0;
                $row['avgDailyOccupancy'] = $row['saturationPercent']; // Simplified
                $row['peakTime'] = 'N/A'; // Would need historical data
                $row['value'] = $row['saturationPercent'];
            }
            
            // Calculate summary
            $avg_saturation = count($data) > 0 
                ? round(array_sum(array_column($data, 'saturationPercent')) / count($data), 1) 
                : 0;
            $highest = count($data) > 0 ? max(array_column($data, 'saturationPercent')) : 0;
            $lowest = count($data) > 0 ? min(array_column($data, 'saturationPercent')) : 0;
            
            $summary = array(
                'avgSaturation' => $avg_saturation,
                'highestWard' => $highest . '%',
                'lowestWard' => $lowest . '%'
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD ward saturation report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/room-type-usage
     * Room Type Usage Report
     */
    public function room_type_usage() {
        try {
            $filters = $this->get_filters();
            
            $this->db->select('
                ir.room_type,
                COUNT(DISTINCT ir.id) as total_rooms,
                COUNT(DISTINCT CASE WHEN ir.status = "occupied" THEN ir.id END) as occupied,
                COUNT(DISTINCT CASE WHEN ir.status = "available" THEN ir.id END) as available,
                AVG(ir.daily_rate) as avg_daily_rate,
                COUNT(DISTINCT ia.id) as total_admissions
            ');
            $this->db->from('ipd_rooms ir');
            $this->db->join('ipd_admissions ia', 'ia.room_id = ir.id', 'left');
            
            if ($filters['ward_id']) {
                $this->db->where('ir.ward_id', $filters['ward_id']);
            }
            
            $this->db->group_by('ir.room_type');
            $this->db->order_by('ir.room_type', 'ASC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['roomType'] = $row['room_type'] ?: 'Unknown';
                $row['totalRooms'] = (int)$row['total_rooms'];
                $row['occupied'] = (int)$row['occupied'];
                $row['available'] = (int)$row['available'];
                $row['avgLOS'] = 0; // Would need calculation
                $row['revenue'] = (float)$row['avg_daily_rate'] * $row['occupied'] * 1; // Simplified
                $row['occupancyPercent'] = $row['totalRooms'] > 0 
                    ? round(($row['occupied'] / $row['totalRooms']) * 100, 1) 
                    : 0;
                $row['value'] = $row['occupancyPercent'];
            }
            
            // Calculate summary
            $summary = array(
                'roomTypes' => count($data),
                'totalRooms' => array_sum(array_column($data, 'totalRooms')),
                'occupiedRooms' => array_sum(array_column($data, 'occupied')),
                'avgOccupancy' => count($data) > 0 
                    ? round(array_sum(array_column($data, 'occupancyPercent')) / count($data), 1) 
                    : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD room type usage report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/bed-allocation
     * Bed Allocation History
     */
    public function bed_allocation() {
        try {
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                ia.admission_date as date,
                p.name as patient_name,
                ia.ipd_number,
                iw.name as ward_name,
                ib.bed_number,
                u.name as allocated_by,
                DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date) as duration,
                ia.status,
                ia.diagnosis as notes
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->join('ipd_wards iw', 'iw.id = ia.ward_id', 'left');
            $this->db->join('ipd_beds ib', 'ib.id = ia.bed_id', 'left');
            $this->db->join('users u', 'u.id = ia.admitted_by_user_id', 'left');
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->order_by('ia.admission_date', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['patient'] = $row['patient_name'] . ' (' . $row['ipd_number'] . ')';
                $row['ward'] = $row['ward_name'];
                $row['bedNo'] = $row['bed_number'];
                $row['allocatedBy'] = $row['allocated_by'] ?: 'System';
                $row['duration'] = (int)$row['duration'];
                $row['status'] = ucfirst($row['status']);
                $row['notes'] = $row['notes'] ?: 'N/A';
            }
            
            // Calculate summary
            $summary = array(
                'totalAllocations' => count($data),
                'activeAllocations' => count(array_filter($data, function($r) { 
                    return !in_array($r['status'], array('Discharged', 'Absconded')); 
                })),
                'discharged' => count(array_filter($data, function($r) { return $r['status'] === 'Discharged'; })),
                'transferred' => count(array_filter($data, function($r) { return stripos($r['notes'], 'transfer') !== false; })),
                'avgDuration' => count($data) > 0 ? round(array_sum(array_column($data, 'duration')) / count($data), 1) : 0
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD bed allocation report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/bed-blocking
     * Bed Blocking Report
     */
    public function bed_blocking() {
        try {
            $filters = $this->get_filters();
            
            // Find patients with delayed discharges
            $this->db->select('
                p.name as patient_name,
                ia.ipd_number,
                iw.name as ward_name,
                ib.bed_number,
                ia.estimated_duration,
                DATEDIFF(CURDATE(), ia.admission_date) as actual_duration,
                DATE_ADD(ia.admission_date, INTERVAL COALESCE(ia.estimated_duration, 7) DAY) as expected_discharge,
                DATEDIFF(CURDATE(), DATE_ADD(ia.admission_date, INTERVAL COALESCE(ia.estimated_duration, 7) DAY)) as days_delayed,
                ia.status,
                ia.diagnosis as reason
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->join('ipd_wards iw', 'iw.id = ia.ward_id', 'left');
            $this->db->join('ipd_beds ib', 'ib.id = ia.bed_id', 'left');
            $this->db->where('ia.status !=', 'discharged');
            $this->db->where('ia.status !=', 'absconded');
            $this->db->having('days_delayed >', 0);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            if ($filters['department']) {
                $this->db->where('ia.department', $filters['department']);
            }
            
            $this->db->order_by('days_delayed', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['patient'] = $row['patient_name'] . ' (' . $row['ipd_number'] . ')';
                $row['ward'] = $row['ward_name'];
                $row['bed'] = $row['bed_number'];
                $row['expectedDischarge'] = $row['expected_discharge'];
                $row['actualStatus'] = ucfirst($row['status']);
                $row['daysDelayed'] = (int)$row['days_delayed'];
                $row['reason'] = $row['reason'] ?: 'Clinical reasons';
                $row['impact'] = 'Bed occupied';
            }
            
            // Calculate summary
            $blocked_beds = count($data);
            $avg_delay = count($data) > 0 ? round(array_sum(array_column($data, 'daysDelayed')) / count($data), 1) : 0;
            $total_delayed_days = array_sum(array_column($data, 'daysDelayed'));
            $estimated_lost_revenue = $total_delayed_days * 5000; // Simplified calculation
            
            $summary = array(
                'blockedBeds' => $blocked_beds,
                'avgDelayDays' => $avg_delay,
                'totalDelayedDays' => $total_delayed_days,
                'estimatedLostRevenue' => $estimated_lost_revenue
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD bed blocking report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============================================
    // PANEL / INSURANCE REPORTS
    // ============================================

    /**
     * GET /api/ipd/reports/panel-admissions
     * Panel Wise Admissions Report
     */
    public function panel_admissions() {
        try {
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                COALESCE(ia.insurance_provider, "Cash") as panel_name,
                COUNT(DISTINCT ia.id) as total_admissions,
                SUM(CASE WHEN ia.admission_type = "Emergency" THEN 1 ELSE 0 END) as emergency,
                SUM(CASE WHEN ia.admission_type = "Planned" THEN 1 ELSE 0 END) as planned,
                AVG(DATEDIFF(COALESCE(ia.discharge_date, CURDATE()), ia.admission_date)) as avg_los,
                COUNT(DISTINCT CASE WHEN ia.status != "discharged" AND ia.status != "absconded" THEN ia.id END) as active_patients
            ');
            $this->db->from('ipd_admissions ia');
            $this->db->where('ia.admission_date >=', $date_from);
            $this->db->where('ia.admission_date <=', $date_to);
            
            if ($filters['panel_id']) {
                $this->db->where('ia.insurance_provider', $filters['panel_id']);
            }
            
            $this->db->group_by('ia.insurance_provider');
            $this->db->order_by('total_admissions', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['panelName'] = $row['panel_name'];
                $row['totalAdmissions'] = (int)$row['total_admissions'];
                $row['emergency'] = (int)$row['emergency'];
                $row['planned'] = (int)$row['planned'];
                $row['avgLOS'] = round($row['avg_los'], 1);
                $row['activePatients'] = (int)$row['active_patients'];
                $row['value'] = $row['totalAdmissions'];
            }
            
            // Calculate summary
            $cash_patients = 0;
            $insurance_patients = 0;
            foreach ($data as $row) {
                if ($row['panelName'] === 'Cash') {
                    $cash_patients = $row['totalAdmissions'];
                } else {
                    $insurance_patients += $row['totalAdmissions'];
                }
            }
            
            $summary = array(
                'totalPanels' => count($data),
                'totalAdmissions' => array_sum(array_column($data, 'totalAdmissions')),
                'cashPatients' => $cash_patients,
                'insurancePatients' => $insurance_patients
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD panel admissions report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/panel-billing-summary
     * Panel Wise Billing Summary (same as panel_billing)
     */
    public function panel_billing_summary() {
        return $this->panel_billing();
    }

    /**
     * GET /api/ipd/reports/claim-status
     * Claim Status Report
     */
    public function claim_status() {
        try {
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-90 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                CONCAT("CLAIM-", ia.id) as claim_id,
                p.name as patient_name,
                ia.ipd_number,
                ia.insurance_provider as panel,
                ib.total_amount as claim_amount,
                ib.insurance_covered as approved_amount,
                CASE 
                    WHEN ib.insurance_covered > 0 AND ib.due_amount = 0 THEN "Approved"
                    WHEN ib.insurance_covered > 0 AND ib.due_amount > 0 THEN "Partial"
                    WHEN ib.insurance_covered = 0 AND ib.due_amount > 0 THEN "Pending"
                    ELSE "Rejected"
                END as status,
                ib.billing_date as submission_date,
                DATEDIFF(CURDATE(), ib.billing_date) as days_pending
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            $this->db->where('ia.insurance_provider IS NOT NULL');
            
            if ($filters['panel_id']) {
                $this->db->where('ia.insurance_provider', $filters['panel_id']);
            }
            
            $this->db->order_by('ib.billing_date', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['claimId'] = $row['claim_id'];
                $row['patient'] = $row['patient_name'] . ' (' . $row['ipd_number'] . ')';
                $row['panel'] = $row['panel'];
                $row['claimAmount'] = (float)$row['claim_amount'];
                $row['approvedAmount'] = (float)$row['approved_amount'];
                $row['status'] = $row['status'];
                $row['submissionDate'] = $row['submission_date'];
                $row['TAT'] = (int)$row['days_pending'];
            }
            
            // Calculate summary
            $total_claims = count($data);
            $approved = count(array_filter($data, function($r) { return $r['status'] === 'Approved'; }));
            $pending = count(array_filter($data, function($r) { return $r['status'] === 'Pending' || $r['status'] === 'Partial'; }));
            $rejected = count(array_filter($data, function($r) { return $r['status'] === 'Rejected'; }));
            $claim_amount = array_sum(array_column($data, 'claimAmount'));
            $approved_amount = array_sum(array_column($data, 'approvedAmount'));
            $avg_tat = count($data) > 0 ? round(array_sum(array_column($data, 'TAT')) / count($data), 0) : 0;
            
            $summary = array(
                'totalClaims' => $total_claims,
                'approved' => $approved,
                'pending' => $pending,
                'rejected' => $rejected,
                'claimAmount' => $claim_amount,
                'approvedAmount' => $approved_amount,
                'avgTAT' => $avg_tat
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD claim status report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/pre-auth-comparison
     * Pre-Authorization vs Final Bill Comparison
     */
    public function pre_auth_comparison() {
        try {
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            $this->db->select('
                p.name as patient_name,
                ia.ipd_number,
                ia.insurance_provider as panel,
                ia.insurance_coverage_amount as pre_auth_amount,
                ib.total_amount as final_bill,
                (ib.total_amount - ia.insurance_coverage_amount) as variance,
                CASE 
                    WHEN ib.total_amount > ia.insurance_coverage_amount THEN "Exceeded"
                    WHEN ib.total_amount < ia.insurance_coverage_amount THEN "Under"
                    ELSE "Match"
                END as status,
                ia.diagnosis as reason
            ');
            $this->db->from('ipd_billing ib');
            $this->db->join('ipd_admissions ia', 'ia.id = ib.admission_id', 'left');
            $this->db->join('patients p', 'p.id = ia.patient_id', 'left');
            $this->db->where('ib.billing_date >=', $date_from);
            $this->db->where('ib.billing_date <=', $date_to);
            $this->db->where('ia.insurance_coverage_amount >', 0);
            
            if ($filters['panel_id']) {
                $this->db->where('ia.insurance_provider', $filters['panel_id']);
            }
            
            $this->db->order_by('variance', 'DESC');
            
            $query = $this->db->get();
            $data = $query->result_array();
            
            // Format data
            foreach ($data as &$row) {
                $row['patient'] = $row['patient_name'] . ' (' . $row['ipd_number'] . ')';
                $row['panel'] = $row['panel'];
                $row['preAuthAmount'] = (float)$row['pre_auth_amount'];
                $row['finalBill'] = (float)$row['final_bill'];
                $row['variance'] = (float)$row['variance'];
                $row['variancePercent'] = $row['preAuthAmount'] > 0 
                    ? round(($row['variance'] / $row['preAuthAmount']) * 100, 1) 
                    : 0;
                $row['status'] = $row['status'];
                $row['reason'] = $row['reason'] ?: 'N/A';
            }
            
            // Calculate summary
            $total_cases = count($data);
            $avg_variance = count($data) > 0 ? round(array_sum(array_column($data, 'variancePercent')) / count($data), 1) : 0;
            $exceedances = count(array_filter($data, function($r) { return $r['status'] === 'Exceeded'; }));
            $under_utilization = count(array_filter($data, function($r) { return $r['status'] === 'Under'; }));
            
            $summary = array(
                'totalCases' => $total_cases,
                'avgVariance' => $avg_variance,
                'exceedances' => $exceedances,
                'underUtilization' => $under_utilization
            );
            
            $this->success(array(
                'data' => $data,
                'summary' => $summary
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD pre-auth comparison report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    // ============================================
    // PARTIAL IMPLEMENTATIONS
    // ============================================

    /**
     * GET /api/ipd/reports/medication-chart
     * Medication Chart Report (Partial - needs medication table verification)
     */
    public function medication_chart() {
        try {
            // This would need ipd_medications table structure verification
            // For now, return empty data with message
            $this->success(array(
                'data' => array(),
                'summary' => array('message' => 'Medication data table needs verification'),
                'note' => 'This report requires ipd_medications table structure verification'
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD medication chart report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/nursing-care
     * Nursing Care Summary (Partial - needs aggregation logic)
     */
    public function nursing_care() {
        try {
            $filters = $this->get_filters();
            $date_from = $filters['date_from'] ?: date('Y-m-d', strtotime('-30 days'));
            $date_to = $filters['date_to'] ?: date('Y-m-d');
            
            // Basic implementation - would need more detailed aggregation
            $this->db->select('
                COUNT(DISTINCT inn.id) as total_notes,
                COUNT(DISTINCT inn.admission_id) as patients_with_notes,
                AVG(LENGTH(inn.note)) as avg_note_length
            ');
            $this->db->from('ipd_nursing_notes inn');
            $this->db->join('ipd_admissions ia', 'ia.id = inn.admission_id', 'left');
            $this->db->where('DATE(inn.recorded_date) >=', $date_from);
            $this->db->where('DATE(inn.recorded_date) <=', $date_to);
            
            if ($filters['ward_id']) {
                $this->db->where('ia.ward_id', $filters['ward_id']);
            }
            
            $query = $this->db->get();
            $summary_data = $query->row_array();
            
            $this->success(array(
                'data' => array(),
                'summary' => array(
                    'totalNotes' => (int)($summary_data['total_notes'] ?? 0),
                    'patientsWithNotes' => (int)($summary_data['patients_with_notes'] ?? 0),
                    'avgNoteLength' => round((float)($summary_data['avg_note_length'] ?? 0), 0),
                    'note' => 'Detailed nursing care report requires additional aggregation logic'
                )
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD nursing care report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/medication-consumption
     * Medication Consumption Report (Partial - needs medication table)
     */
    public function medication_consumption() {
        return $this->medication_chart(); // Same limitation
    }

    /**
     * GET /api/ipd/reports/lab-utilization
     * Lab Test Utilization Summary (Partial - needs lab_orders table verification)
     */
    public function lab_utilization() {
        try {
            // This would need ipd_lab_orders table structure verification
            $this->success(array(
                'data' => array(),
                'summary' => array('message' => 'Lab orders table needs verification'),
                'note' => 'This report requires ipd_lab_orders table structure verification'
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD lab utilization report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/ipd/reports/delayed-lab-reports
     * Delayed Lab Reports (Partial)
     */
    public function delayed_lab_reports() {
        return $this->lab_utilization(); // Same limitation
    }

    /**
     * GET /api/ipd/reports/critical-lab-results
     * Critical Lab Results Summary (Partial)
     */
    public function critical_lab_results() {
        return $this->lab_utilization(); // Same limitation
    }

    /**
     * GET /api/ipd/reports/radiology-usage
     * Radiology Usage Report (Partial - needs radiology_orders table)
     */
    public function radiology_usage() {
        try {
            // This would need ipd_radiology_orders table structure verification
            $this->success(array(
                'data' => array(),
                'summary' => array('message' => 'Radiology orders table needs verification'),
                'note' => 'This report requires ipd_radiology_orders table structure verification'
            ));
        } catch (Exception $e) {
            log_message('error', 'IPD radiology usage report error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
}

