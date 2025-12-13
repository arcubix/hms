<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Cron Controller
 * Handles scheduled tasks for billing automation
 * 
 * Setup cron job:
 * 0 0 * * * php /path/to/index.php cron billing
 */
class Cron extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->library('RecurringBilling');
    }

    /**
     * Process recurring billing
     * Run daily via cron: php index.php cron billing
     */
    public function billing() {
        // Verify this is being called from command line or authorized source
        if (!$this->input->is_cli_request() && !$this->is_authorized_cron()) {
            show_404();
            return;
        }
        
        log_message('info', 'Starting recurring billing process');
        
        // Process recurring billing
        $result = $this->recurringbilling->process_recurring_billing();
        
        log_message('info', "Recurring billing processed: {$result['processed']} invoices created");
        
        if (!empty($result['errors'])) {
            log_message('error', 'Recurring billing errors: ' . implode(', ', $result['errors']));
        }
        
        // Check expired subscriptions
        $expired_count = $this->recurringbilling->check_expired_subscriptions();
        log_message('info', "Expired subscriptions checked: $expired_count marked as expired");
        
        // Send overdue reminders
        $reminders_sent = $this->recurringbilling->send_overdue_reminders();
        log_message('info', "Overdue reminders sent: $reminders_sent");
        
        echo "Billing process completed. Processed: {$result['processed']}, Errors: " . count($result['errors']) . "\n";
    }

    /**
     * Check if cron request is authorized
     * Add your own authorization logic here (e.g., IP whitelist, token)
     */
    private function is_authorized_cron() {
        // For now, allow if called from CLI
        // In production, add IP whitelist or token check
        return true;
    }
}

