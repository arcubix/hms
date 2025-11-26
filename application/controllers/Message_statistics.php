<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH . 'controllers/Api.php';

/**
 * Message Statistics API Controller
 * Handles message statistics and analytics
 */
class Message_statistics extends Api {

    public function __construct() {
        parent::__construct();
        
        // Verify token for all requests
        if (!$this->verify_token()) {
            return;
        }
    }

    /**
     * GET /api/message-statistics - Get overall statistics
     */
    public function index() {
        try {
            $period = $this->input->get('period') ?: 'weekly'; // daily, weekly, monthly
            
            $stats = array(
                'sms' => $this->get_platform_stats('sms', $period),
                'email' => $this->get_platform_stats('email', $period),
                'whatsapp' => $this->get_platform_stats('whatsapp', $period),
                'overall' => $this->get_overall_stats($period)
            );
            
            $this->success($stats);
            
        } catch (Exception $e) {
            log_message('error', 'Message_statistics index error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get platform-specific statistics
     */
    private function get_platform_stats($type, $period) {
        // Get active templates count
        $this->db->where('type', $type);
        $this->db->where('is_active', 1);
        $active_templates = $this->db->count_all_results('message_templates');
        
        // Get sent today
        $today_start = date('Y-m-d 00:00:00');
        $this->db->where('message_type', $type);
        $this->db->where('created_at >=', $today_start);
        $sent_today = $this->db->count_all_results('message_logs');
        
        // Get sent in period
        $period_start = $this->get_period_start($period);
        $this->db->where('message_type', $type);
        $this->db->where('created_at >=', $period_start);
        $sent_period = $this->db->count_all_results('message_logs');
        
        // Get delivery rate for period
        $this->db->where('message_type', $type);
        $this->db->where('created_at >=', $period_start);
        $this->db->where_in('status', ['sent', 'delivered', 'failed']);
        $total_sent = $this->db->count_all_results('message_logs');
        
        $this->db->where('message_type', $type);
        $this->db->where('created_at >=', $period_start);
        $this->db->where('status', 'delivered');
        $delivered = $this->db->count_all_results('message_logs');
        
        $delivery_rate = $total_sent > 0 ? round(($delivered / $total_sent) * 100, 2) : 0;
        
        return array(
            'active_templates' => $active_templates,
            'sent_today' => $sent_today,
            'sent_period' => $sent_period,
            'delivery_rate' => $delivery_rate
        );
    }

    /**
     * Get overall statistics
     */
    private function get_overall_stats($period) {
        $period_start = $this->get_period_start($period);
        
        // Total sent
        $this->db->where('created_at >=', $period_start);
        $this->db->where_in('status', ['sent', 'delivered', 'failed']);
        $total_sent = $this->db->count_all_results('message_logs');
        
        // Total delivered
        $this->db->where('created_at >=', $period_start);
        $this->db->where('status', 'delivered');
        $total_delivered = $this->db->count_all_results('message_logs');
        
        $delivery_rate = $total_sent > 0 ? round(($total_delivered / $total_sent) * 100, 2) : 0;
        
        return array(
            'total_sent' => $total_sent,
            'total_delivered' => $total_delivered,
            'delivery_rate' => $delivery_rate
        );
    }

    /**
     * Get period start date
     */
    private function get_period_start($period) {
        switch ($period) {
            case 'daily':
                return date('Y-m-d 00:00:00');
            case 'weekly':
                return date('Y-m-d 00:00:00', strtotime('-7 days'));
            case 'monthly':
                return date('Y-m-d 00:00:00', strtotime('-30 days'));
            default:
                return date('Y-m-d 00:00:00', strtotime('-7 days'));
        }
    }

    /**
     * GET /api/message-statistics/daily - Daily statistics
     */
    public function daily() {
        try {
            $stats = array(
                'sms' => $this->get_platform_stats('sms', 'daily'),
                'email' => $this->get_platform_stats('email', 'daily'),
                'whatsapp' => $this->get_platform_stats('whatsapp', 'daily'),
                'overall' => $this->get_overall_stats('daily')
            );
            
            $this->success($stats);
            
        } catch (Exception $e) {
            log_message('error', 'Message_statistics daily error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/message-statistics/weekly - Weekly statistics
     */
    public function weekly() {
        try {
            $stats = array(
                'sms' => $this->get_platform_stats('sms', 'weekly'),
                'email' => $this->get_platform_stats('email', 'weekly'),
                'whatsapp' => $this->get_platform_stats('whatsapp', 'weekly'),
                'overall' => $this->get_overall_stats('weekly')
            );
            
            $this->success($stats);
            
        } catch (Exception $e) {
            log_message('error', 'Message_statistics weekly error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/message-statistics/by-platform - Statistics by platform
     */
    public function by_platform() {
        try {
            $platform = $this->input->get('platform'); // sms, email, whatsapp
            $period = $this->input->get('period') ?: 'weekly';
            
            if ($platform && in_array($platform, ['sms', 'email', 'whatsapp'])) {
                $stats = $this->get_platform_stats($platform, $period);
                $this->success($stats);
            } else {
                $this->error('Valid platform (sms, email, whatsapp) is required', 400);
            }
            
        } catch (Exception $e) {
            log_message('error', 'Message_statistics by_platform error: ' . $e->getMessage());
            $this->error('Server error: ' . $e->getMessage(), 500);
        }
    }
}

