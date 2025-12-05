<?php
/**
 * Migration Script: Consolidate All Duplicate Permissions
 * 
 * This script consolidates all role-prefixed permissions into single permissions
 * Run this script from command line: php run_consolidate_permissions.php
 * Or access via browser: http://your-domain/hms/database/migrations/run_consolidate_permissions.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get the base path
$base_path = dirname(dirname(dirname(__FILE__)));

// Load CodeIgniter bootstrap
require_once $base_path . '/index.php';

// Get CodeIgniter instance
$CI =& get_instance();
$CI->load->database();

// Start output buffering for clean output
ob_start();

echo "========================================\n";
echo "Permission Consolidation Migration\n";
echo "========================================\n\n";

try {
    $db = $CI->db;
    
    // Track statistics
    $stats = array(
        'permissions_created' => 0,
        'role_permissions_migrated' => 0,
        'user_permissions_migrated' => 0,
        'errors' => array()
    );
    
    echo "Step 1: Creating consolidated permissions...\n";
    
    // Step 1: Create consolidated permissions
    $consolidated_permissions = array(
        // Patient Management
        array('view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'patient'),
        array('view_all_patients', 'View All Patients', 'View all patients in the system', 'patient'),
        array('search_patients', 'Search Patients', 'Search for patients in the system', 'patient'),
        array('search_view_patients', 'Search and View Patients', 'Search and view patient records', 'patient'),
        array('add_patient', 'Add Patient', 'Add new patients to the system', 'patient'),
        array('edit_patient', 'Edit Patient', 'Edit patient information', 'patient'),
        array('delete_patient', 'Delete Patient', 'Delete patient records', 'patient'),
        
        // Invoice Management
        array('create_invoice', 'Create Invoice', 'Create new invoices', 'invoice'),
        array('edit_invoice', 'Edit Invoice', 'Edit invoice details', 'invoice'),
        array('edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'invoice'),
        
        // Health Records
        array('create_health_records', 'Create Health Records', 'Create new health records', 'health_record'),
        array('edit_health_records', 'Edit Health Records', 'Edit existing health records', 'health_record'),
        array('view_health_record', 'View Health Record', 'View patient health records', 'health_record'),
        
        // Appointments
        array('add_appointment', 'Add Appointment', 'Add new appointments', 'appointment'),
        array('delete_token_appointment', 'Delete Token or Appointment', 'Delete tokens and appointments', 'appointment'),
        array('edit_doctor_timings', 'Edit Doctor Timings', 'Edit doctor schedule and timings', 'appointment'),
        
        // Treatment & Plans
        array('edit_treatment_plan', 'Edit Treatment Plan', 'Edit patient treatment plans', 'treatment'),
        
        // Communication
        array('send_sms', 'Send SMS', 'Send SMS notifications to patients', 'communication'),
        
        // Reports
        array('view_reports', 'View Reports', 'View various system reports', 'reports'),
        array('view_patients_report', 'View Patients Report', 'View patient reports', 'reports'),
        
        // Modules Access
        array('view_opd', 'View OPD', 'View OPD module', 'modules'),
        array('view_patient_module', 'View Patient Module', 'View patient management module', 'modules'),
        
        // Inventory
        array('view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'inventory'),
        
        // Leads
        array('edit_leads', 'Edit Leads', 'Edit lead information', 'leads'),
        
        // Discharge
        array('modify_discharge_date_time', 'Modify Discharge Date/Time', 'Modify patient discharge date and time', 'discharge'),
        
        // Emergency
        array('emergency_consultant', 'Emergency Consultant', 'Access to emergency consultation features', 'emergency')
    );
    
    $permission_ids = array();
    
    foreach ($consolidated_permissions as $perm) {
        // Check if permission already exists
        $query = $db->get_where('permission_definitions', array('permission_key' => $perm[0]));
        $existing = $query->row();
        
        if ($existing) {
            // Update existing permission
            $db->where('permission_key', $perm[0]);
            $db->update('permission_definitions', array(
                'permission_name' => $perm[1],
                'description' => $perm[2],
                'category' => $perm[3]
            ));
            echo "  Updated: {$perm[0]}\n";
            $permission_ids[$perm[0]] = $existing->id;
        } else {
            // Insert new permission
            $db->insert('permission_definitions', array(
                'permission_key' => $perm[0],
                'permission_name' => $perm[1],
                'description' => $perm[2],
                'category' => $perm[3]
            ));
            
            if ($db->affected_rows() > 0) {
                $stats['permissions_created']++;
                echo "  Created: {$perm[0]}\n";
            }
            
            // Get the ID
            $query = $db->get_where('permission_definitions', array('permission_key' => $perm[0]));
            $result = $query->row();
            if ($result) {
                $permission_ids[$perm[0]] = $result->id;
            }
        }
    }
    
    echo "\nStep 2: Migrating role permissions...\n";
    
    // Step 2: Migrate role permissions
    $migration_mappings = array(
        'view_patient_profiles' => array('doctor.view_patient_profiles', 'staff.view_patient_profiles'),
        'view_all_patients' => array('doctor.view_all_patients'),
        'search_patients' => array('staff.search_patients'),
        'search_view_patients' => array('doctor.search_view_patients'),
        'add_patient' => array('staff.add_patient', 'nurse.add_patient'),
        'edit_patient' => array('staff.edit_patient', 'nurse.edit_patient'),
        'delete_patient' => array('doctor.delete_patient', 'admin.delete_patient'),
        'create_invoice' => array('doctor.create_invoice', 'staff.create_invoice', 'nurse.add_invoice'),
        'edit_invoice' => array('doctor.edit_invoices', 'staff.edit_invoices', 'accountant.edit_invoice'),
        'edit_payment_invoice_date' => array('doctor.edit_payment_invoice_date', 'staff.edit_payment_invoice_date', 'admin.edit_payment_invoice_date'),
        'create_health_records' => array('doctor.create_health_records', 'staff.create_health_records'),
        'edit_health_records' => array('doctor.edit_health_records', 'staff.edit_health_records'),
        'view_health_record' => array('staff.view_health_record'),
        'add_appointment' => array('doctor.add_appointment', 'staff.add_appointment'),
        'delete_token_appointment' => array('doctor.delete_token_appointment', 'staff.delete_token_appointment'),
        'edit_doctor_timings' => array('staff.edit_doctor_timings'),
        'edit_treatment_plan' => array('staff.edit_treatment_plan'),
        'send_sms' => array('staff.send_sms'),
        'view_reports' => array('staff.view_reports'),
        'view_patients_report' => array('doctor.view_patients_report'),
        'view_opd' => array('staff.view_opd'),
        'view_patient_module' => array('staff.view_patient_module'),
        'view_inventory_purchase_requisition' => array('staff.view_inventory_purchase_requisition', 'lab_manager.view_inventory_purchase_requisition', 'lab_manager.view_inventory_requisition', 'nurse.view_inventory_purchase_requisition', 'blood_bank_manager.view_inventory_purchase_requisition', 'accountant.view_inventory_purchase_requisition', 'lab_technician.view_inventory_purchase_requisition', 'radiology_technician.view_inventory_requisition', 'radiology_manager.view_inventory_requisition'),
        'edit_leads' => array('staff.edit_leads', 'admin.edit_leads', 'nurse.edit_leads'),
        'modify_discharge_date_time' => array('staff.modify_discharge_date_time', 'nurse.modify_discharge_date_time'),
        'emergency_consultant' => array('doctor.emergency_consultant')
    );
    
    foreach ($migration_mappings as $new_key => $old_keys) {
        if (!isset($permission_ids[$new_key])) {
            echo "  Warning: Permission '{$new_key}' not found, skipping...\n";
            continue;
        }
        
        $new_permission_id = $permission_ids[$new_key];
        
        // Get all roles that have any of the old permissions
        $db->distinct();
        $db->select('rp.role');
        $db->from('role_permissions rp');
        $db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
        $db->where_in('pd.permission_key', $old_keys);
        $query = $db->get();
        $roles = $query->result();
        
        foreach ($roles as $role) {
            $role_name = $role->role;
            
            // Check if role already has the new permission
            $db->select('rp.id');
            $db->from('role_permissions rp');
            $db->join('permission_definitions pd', 'rp.permission_id = pd.id', 'inner');
            $db->where('rp.role', $role_name);
            $db->where('pd.permission_key', $new_key);
            $check_query = $db->get();
            
            if ($check_query->num_rows() == 0) {
                // Add the new permission
                $db->insert('role_permissions', array(
                    'role' => $role_name,
                    'permission_id' => $new_permission_id
                ));
                
                if ($db->affected_rows() > 0) {
                    $stats['role_permissions_migrated']++;
                    echo "  Migrated: {$role_name} -> {$new_key}\n";
                }
            }
        }
    }
    
    echo "\nStep 3: Migrating user custom permissions...\n";
    
    // Step 3: Migrate user custom permissions
    $user_permission_mappings = array(
        'view_patient_profiles' => array('doctor.view_patient_profiles', 'staff.view_patient_profiles'),
        'view_all_patients' => array('doctor.view_all_patients'),
        'search_patients' => array('staff.search_patients'),
        'search_view_patients' => array('doctor.search_view_patients'),
        'add_patient' => array('staff.add_patient', 'nurse.add_patient'),
        'edit_patient' => array('staff.edit_patient', 'nurse.edit_patient'),
        'delete_patient' => array('doctor.delete_patient', 'admin.delete_patient'),
        'create_invoice' => array('doctor.create_invoice', 'staff.create_invoice', 'nurse.add_invoice'),
        'edit_invoice' => array('doctor.edit_invoices', 'staff.edit_invoices', 'accountant.edit_invoice'),
        'edit_payment_invoice_date' => array('doctor.edit_payment_invoice_date', 'staff.edit_payment_invoice_date', 'admin.edit_payment_invoice_date'),
        'create_health_records' => array('doctor.create_health_records', 'staff.create_health_records'),
        'edit_health_records' => array('doctor.edit_health_records', 'staff.edit_health_records'),
        'view_health_record' => array('staff.view_health_record'),
        'add_appointment' => array('doctor.add_appointment', 'staff.add_appointment'),
        'delete_token_appointment' => array('doctor.delete_token_appointment', 'staff.delete_token_appointment'),
        'edit_doctor_timings' => array('staff.edit_doctor_timings'),
        'edit_treatment_plan' => array('staff.edit_treatment_plan'),
        'send_sms' => array('staff.send_sms'),
        'view_reports' => array('staff.view_reports'),
        'view_patients_report' => array('doctor.view_patients_report'),
        'view_opd' => array('staff.view_opd'),
        'view_patient_module' => array('staff.view_patient_module'),
        'view_inventory_purchase_requisition' => array('staff.view_inventory_purchase_requisition', 'lab_manager.view_inventory_purchase_requisition', 'lab_manager.view_inventory_requisition', 'nurse.view_inventory_purchase_requisition', 'blood_bank_manager.view_inventory_purchase_requisition', 'accountant.view_inventory_purchase_requisition', 'lab_technician.view_inventory_purchase_requisition', 'radiology_technician.view_inventory_requisition', 'radiology_manager.view_inventory_requisition'),
        'edit_leads' => array('staff.edit_leads', 'admin.edit_leads', 'nurse.edit_leads'),
        'modify_discharge_date_time' => array('staff.modify_discharge_date_time', 'nurse.modify_discharge_date_time'),
        'emergency_consultant' => array('doctor.emergency_consultant')
    );
    
    foreach ($user_permission_mappings as $new_key => $old_keys) {
        if (!isset($permission_ids[$new_key])) {
            continue;
        }
        
        $new_permission_id = $permission_ids[$new_key];
        
        // Get all user custom permissions with old permission keys
        $db->select('ucp.id, ucp.user_id, ucp.granted');
        $db->from('user_custom_permissions ucp');
        $db->join('permission_definitions pd', 'ucp.permission_id = pd.id', 'inner');
        $db->where_in('pd.permission_key', $old_keys);
        $db->where('ucp.granted', 1);
        $query = $db->get();
        $user_perms = $query->result();
        
        foreach ($user_perms as $user_perm) {
            // Check if user already has the new permission
            $db->select('ucp.id');
            $db->from('user_custom_permissions ucp');
            $db->where('ucp.user_id', $user_perm->user_id);
            $db->where('ucp.permission_id', $new_permission_id);
            $check_query = $db->get();
            
            if ($check_query->num_rows() == 0) {
                // Update to new permission
                $db->where('id', $user_perm->id);
                $db->update('user_custom_permissions', array(
                    'permission_id' => $new_permission_id
                ));
                
                if ($db->affected_rows() > 0) {
                    $stats['user_permissions_migrated']++;
                }
            } else {
                // User already has new permission, delete old one
                $db->where('id', $user_perm->id);
                $db->delete('user_custom_permissions');
            }
        }
    }
    
    echo "\n========================================\n";
    echo "Migration Completed Successfully!\n";
    echo "========================================\n\n";
    echo "Statistics:\n";
    echo "  - Permissions created: {$stats['permissions_created']}\n";
    echo "  - Role permissions migrated: {$stats['role_permissions_migrated']}\n";
    echo "  - User permissions migrated: {$stats['user_permissions_migrated']}\n";
    
    if (!empty($stats['errors'])) {
        echo "\nErrors encountered:\n";
        foreach ($stats['errors'] as $error) {
            echo "  - {$error}\n";
        }
    }
    
    echo "\nVerification:\n";
    echo "Run these queries to verify:\n";
    echo "SELECT permission_key, COUNT(*) as role_count FROM role_permissions rp JOIN permission_definitions pd ON rp.permission_id = pd.id WHERE pd.permission_key IN ('view_patient_profiles', 'add_patient', 'edit_patient', 'delete_patient', 'create_invoice', 'edit_invoice', 'add_appointment', 'delete_token_appointment') GROUP BY permission_key;\n";
    
} catch (Exception $e) {
    echo "\n========================================\n";
    echo "ERROR: Migration Failed!\n";
    echo "========================================\n\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack Trace:\n" . $e->getTraceAsString() . "\n";
    
    // Rollback if needed (optional)
    // $db->trans_rollback();
    
    exit(1);
}

// Flush output
ob_end_flush();

