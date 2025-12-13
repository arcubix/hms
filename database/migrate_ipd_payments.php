<?php
/**
 * Migration Script: Migrate IPD advance_paid data to patient_payments table
 * 
 * This script migrates existing IPD billing advance_paid amounts to the new
 * patient_payments table structure for better payment tracking and history.
 * 
 * Usage: Run this script once after creating the patient_payments table
 */

// Load CodeIgniter
require_once(__DIR__ . '/../application/config/database.php');
require_once(__DIR__ . '/../index.php');

// Get CodeIgniter instance
$CI =& get_instance();
$CI->load->database();
$CI->load->model('Patient_payment_model');
$CI->load->model('Ipd_billing_model');

echo "Starting IPD Payment Migration...\n\n";

try {
    // Get all IPD billing records with advance_paid > 0
    $CI->db->select('id, admission_id, patient_id, advance_paid, billing_date, created_at');
    $CI->db->from('ipd_billing');
    $CI->db->where('advance_paid >', 0);
    $query = $CI->db->get();
    $billings = $query->result_array();

    $migrated = 0;
    $skipped = 0;
    $errors = 0;

    foreach ($billings as $billing) {
        // Check if payment already exists for this billing
        $existing_payments = $CI->Patient_payment_model->get_by_bill('ipd', $billing['id']);
        
        if (!empty($existing_payments)) {
            echo "Skipping billing ID {$billing['id']} - payments already exist\n";
            $skipped++;
            continue;
        }

        // Create advance payment record
        $payment_data = array(
            'patient_id' => $billing['patient_id'],
            'bill_type' => 'ipd',
            'bill_id' => $billing['id'],
            'payment_type' => 'advance',
            'payment_method' => 'cash', // Default to cash for migrated payments
            'amount' => $billing['advance_paid'],
            'payment_date' => $billing['billing_date'] ?: $billing['created_at'],
            'payment_status' => 'completed',
            'notes' => 'Migrated from ipd_billing.advance_paid'
        );

        $payment_id = $CI->Patient_payment_model->create($payment_data);

        if ($payment_id) {
            // Update advance balance
            $CI->Patient_payment_model->update_advance_balance(
                $billing['patient_id'],
                $billing['advance_paid'],
                'add'
            );

            echo "Migrated billing ID {$billing['id']} - Payment ID: {$payment_id}, Amount: {$billing['advance_paid']}\n";
            $migrated++;
        } else {
            echo "ERROR: Failed to migrate billing ID {$billing['id']}\n";
            $errors++;
        }
    }

    echo "\n";
    echo "Migration Complete!\n";
    echo "Migrated: {$migrated}\n";
    echo "Skipped: {$skipped}\n";
    echo "Errors: {$errors}\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

