<?php
/**
 * Rebuild Permissions: Truncate and Rebuild with Consolidated Permissions Only
 * 
 * This script will:
 * 1. Clear all existing permissions
 * 2. Insert consolidated permissions (no role prefixes)
 * 3. Assign permissions to roles based on normalized structure
 * 
 * WARNING: This will delete all existing permissions and role assignments!
 */

$base_path = dirname(dirname(dirname(__FILE__)));
require_once $base_path . '/index.php';

$CI =& get_instance();
$CI->load->database();
$db = $CI->db;

// Start output buffering
ob_start();

echo "========================================\n";
echo "Rebuild Consolidated Permissions\n";
echo "========================================\n\n";
echo "WARNING: This will delete ALL existing permissions!\n";
echo "Press Ctrl+C to cancel, or wait 3 seconds to continue...\n\n";
sleep(3);

try {
    $db->trans_start();
    
    echo "Step 1: Clearing existing permissions...\n";
    
    // Disable foreign key checks temporarily
    $db->query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear all existing data (in correct order due to foreign keys)
    $db->truncate('user_custom_permissions');
    echo "  - Cleared user_custom_permissions\n";
    
    $db->truncate('role_permissions');
    echo "  - Cleared role_permissions\n";
    
    $db->truncate('permission_definitions');
    echo "  - Cleared permission_definitions\n";
    
    // Re-enable foreign key checks
    $db->query('SET FOREIGN_KEY_CHECKS = 1');
    
    echo "\nStep 2: Inserting consolidated permissions...\n";
    
    // All consolidated permissions (from permissions_normalized.sql)
    $permissions = array(
        // Patient Management
        array('view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'patient'),
        array('search_patients', 'Search Patients', 'Search for patients in the system', 'patient'),
        array('add_patient', 'Add Patient', 'Add new patients to the system', 'patient'),
        array('edit_patient', 'Edit Patient', 'Edit patient information', 'patient'),
        array('delete_patient', 'Delete Patient', 'Delete patient records', 'patient'),
        array('hide_patient_profile', 'Hide Patient Profile', 'Hide patient profile information', 'patient'),
        array('view_all_patients', 'View All Patients', 'View all patients in the system', 'patient'),
        array('search_view_patients', 'Search and View Patients', 'Search and view patient records', 'patient'),
        
        // Invoice Management
        array('create_invoice', 'Create Invoice', 'Create new invoices', 'invoice'),
        array('edit_invoice', 'Edit Invoice', 'Edit invoice details', 'invoice'),
        array('delete_invoice', 'Delete Invoice', 'Delete invoices', 'invoice'),
        array('edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'invoice'),
        array('only_allow_invoice_payment', 'Only Allow Invoice Payment', 'Only allow invoice payment without editing', 'invoice'),
        array('edit_price_description', 'Edit Price & Description', 'Edit price and description on invoices', 'invoice'),
        array('give_discounts', 'Give Discounts', 'Apply discounts to invoices', 'invoice'),
        array('disabled_discount_in_invoice', 'Disabled Discount In Invoice', 'Disable discount option in invoice', 'invoice'),
        array('enable_discount_entry_in_invoice', 'Enable Discount Entry in Invoice', 'Enable discount entry in invoices', 'invoice'),
        array('restrict_edit_discount_quantity', 'Restrict Edit Discount and Quantity', 'Restrict editing of discount and quantity', 'invoice'),
        array('view_invoice_history', 'View Invoice History (Patient Profile)', 'View invoice history in patient profile', 'invoice'),
        array('enable_refund_payment', 'Enable Refund Payment', 'Enable refund payment functionality', 'invoice'),
        array('refund_payment', 'Refund Payment', 'Process refund payments', 'invoice'),
        array('invoice_return', 'Invoice Return', 'Process invoice returns', 'invoice'),
        array('open_sale_return', 'Open Sale Return', 'Open sale return transactions', 'invoice'),
        array('edit_invoice_retail_price', 'Edit Invoice Retail Price', 'Edit retail prices on invoices', 'invoice'),
        
        // Health Records
        array('create_health_records', 'Create Health Records', 'Create new health records', 'health_record'),
        array('edit_health_records', 'Edit Health Records', 'Edit existing health records', 'health_record'),
        array('view_health_record', 'View Health Record', 'View patient health records', 'health_record'),
        array('view_indoor_health_record', 'View Indoor Health Record', 'View indoor patient health records', 'health_record'),
        
        // Appointments & Scheduling
        array('add_appointment', 'Add Appointment', 'Add new appointments', 'appointment'),
        array('delete_token_appointment', 'Delete Token or Appointment', 'Delete tokens and appointments', 'appointment'),
        array('edit_doctor_timings', 'Edit Doctor Timings', 'Edit doctor schedule and timings', 'appointment'),
        
        // Treatment & Plans
        array('edit_treatment_plan', 'Edit Treatment Plan', 'Edit patient treatment plans', 'treatment'),
        
        // Communication
        array('send_sms', 'Send SMS', 'Send SMS notifications to patients', 'communication'),
        
        // Reports & Analytics
        array('show_doctors_share_report', 'Show Doctors Share Report', 'View doctors share reports', 'reports'),
        array('view_reports', 'View Reports', 'View various system reports', 'reports'),
        array('view_opd_referrals_report', 'View OPD Referrals Report', 'View OPD referrals reports', 'reports'),
        array('view_all_staff_reports', 'View All Staff Reports', 'View all staff-related reports', 'reports'),
        array('view_financial_reports', 'View Financial Reports', 'View financial reports and analytics', 'reports'),
        array('view_pharmacy_reports', 'View Pharmacy Reports', 'View pharmacy-related reports', 'reports'),
        array('view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'reports'),
        array('view_laboratory_reports', 'View Laboratory Reports', 'View laboratory test reports', 'reports'),
        array('view_ipd_reports', 'View IPD Reports', 'View IPD (Indoor Patient Department) reports', 'reports'),
        array('view_inventory_reports', 'View Inventory Reports', 'View inventory reports', 'reports'),
        array('view_pharmacy_transaction_reports', 'View Pharmacy Transaction Reports', 'View pharmacy transaction reports', 'reports'),
        array('view_shift_wise_revenue_only', 'View Shift Wise Revenue Only', 'View shift-wise revenue reports only', 'reports'),
        array('view_total_collection_dashboard', 'View Total Collection Dashboard', 'View total collection dashboard', 'reports'),
        array('restrict_date_filter_7_days', 'Restrict Date Filter To 7 Days Only', 'Restrict date filter to 7 days only', 'reports'),
        array('view_patients_report', 'View Patients Report', 'View patient reports', 'reports'),
        
        // Modules Access
        array('view_opd', 'View OPD', 'View OPD module', 'modules'),
        array('view_patient_module', 'View Patient Module', 'View patient management module', 'modules'),
        array('view_lab_tracking', 'View Lab Tracking', 'View laboratory tracking information', 'modules'),
        
        // Inventory Management
        array('add_inventory_purchase_requisition', 'Add Inventory Purchase Requisition', 'Add inventory purchase requisitions', 'inventory'),
        array('view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'inventory'),
        array('add_inventory_purchase_order', 'Add Inventory Purchase Order', 'Add inventory purchase orders', 'inventory'),
        array('add_stock', 'Add Stock', 'Add stock to inventory', 'inventory'),
        array('edit_stock', 'Edit Stock', 'Edit stock information', 'inventory'),
        array('delete_stock', 'Delete Stock', 'Delete stock records', 'inventory'),
        array('consume_stock', 'Consume Stock', 'Consume stock from inventory', 'inventory'),
        array('edit_consumption', 'Edit Consumption', 'Edit consumption records', 'inventory'),
        array('edit_item', 'Edit Item', 'Edit inventory item information', 'inventory'),
        array('add_item', 'Add Item', 'Add new items to inventory', 'inventory'),
        array('delete_item', 'Delete Item', 'Delete items from inventory', 'inventory'),
        array('make_stock_adjustment', 'Make Stock Adjustment', 'Make stock adjustments', 'inventory'),
        array('issue_stock_against_request', 'Issue Stock Against Request', 'Issue stock against requisition requests', 'inventory'),
        array('collect_stock_against_return', 'Collect Stock Against Return Request', 'Collect stock against return requests', 'inventory'),
        array('create_purchase_order', 'Create Purchase Order', 'Create purchase orders', 'inventory'),
        array('gate_pass', 'Gate Pass', 'Manage gate passes', 'inventory'),
        array('issue_inward_gate_pass', 'Issue Inward Gate Pass', 'Issue inward gate passes', 'inventory'),
        array('issue_outward_gate_pass', 'Issue Outward Gate Pass', 'Issue outward gate passes', 'inventory'),
        array('receive_items_against_inward', 'Receive Items Against Inward Gate Pass', 'Receive items against inward gate passes', 'inventory'),
        array('send_items_against_outward', 'Send Items Against Outward Gate Pass', 'Send items against outward gate passes', 'inventory'),
        array('print_gate_pass', 'Print Gate Pass', 'Print gate passes', 'inventory'),
        array('transfer_stock', 'Transfer Stock', 'Transfer stock between locations', 'inventory'),
        array('deactivate_items', 'Deactivate Items', 'Deactivate pharmacy items', 'inventory'),
        
        // Expenses
        array('add_expenses', 'Add Expenses', 'Add expense records', 'expenses'),
        array('edit_expenses', 'Edit Expenses', 'Edit expense records', 'expenses'),
        array('view_all_expenses', 'View All Expenses', 'View all expense records', 'expenses'),
        
        // Share & Consumption
        array('add_view_share_consumption', 'Add/View Share and Consumption', 'Add and view share and consumption data', 'shares'),
        
        // Leads
        array('edit_leads', 'Edit Leads', 'Edit lead information', 'leads'),
        
        // Discharge & Transfer
        array('modify_discharge_date_time', 'Modify Discharge Date/Time', 'Modify patient discharge date and time', 'discharge'),
        array('discharge_patients', 'Discharge Patients', 'Discharge patients from hospital', 'discharge'),
        array('transfer_patient', 'Transfer Patient', 'Transfer patients between wards/beds', 'discharge'),
        
        // Blood Bank
        array('add_donor', 'Add Donor', 'Add new blood donors', 'blood_bank'),
        array('edit_donor', 'Edit Donor', 'Edit donor information', 'blood_bank'),
        array('add_blood_donation', 'Add Blood Donation', 'Add blood donation records', 'blood_bank'),
        array('add_blood_consumption', 'Add Blood Consumption', 'Add blood consumption records', 'blood_bank'),
        
        // Nursing
        array('assign_beds', 'Assign Beds', 'Assign beds to patients', 'nursing'),
        array('add_edit_beds', 'Add/Edit Beds', 'Add and edit bed information', 'nursing'),
        array('add_edit_wards', 'Add/Edit Wards', 'Add and edit ward information', 'nursing'),
        array('view_edit_indoor_invoices', 'View & Edit Indoor Invoices', 'View and edit indoor patient invoices', 'nursing'),
        array('view_birth_death_certificates', 'View Birth and Death Certificates', 'View birth and death certificates', 'nursing'),
        array('view_dispositions', 'View Dispositions', 'View patient dispositions', 'nursing'),
        array('view_indoor_duty_roster', 'View Indoor Duty Roster', 'View indoor duty roster', 'nursing'),
        array('delete_admitted_patients', 'Delete Admitted Patients', 'Delete admitted patient records', 'nursing'),
        array('edit_nursing_notes', 'Edit Nursing Notes', 'Edit nursing notes for patients', 'nursing'),
        array('approve_medications', 'Approve Medications', 'Approve patient medications', 'nursing'),
        
        // Laboratory
        array('create_laboratory_invoice', 'Create Laboratory Invoice', 'Create laboratory invoices', 'laboratory'),
        array('edit_lab_reports', 'Edit Lab Reports', 'Edit laboratory test reports', 'laboratory'),
        array('delete_laboratory_reports', 'Delete Laboratory Reports', 'Delete laboratory reports', 'laboratory'),
        array('edit_lab_templates', 'Edit Lab Templates', 'Edit laboratory test templates', 'laboratory'),
        array('delete_lab_templates', 'Delete Lab Templates', 'Delete laboratory test templates', 'laboratory'),
        array('edit_outsourced_labs', 'Edit Outsourced Labs in Templates', 'Edit outsourced laboratory information in templates', 'laboratory'),
        array('revert_completed_reports', 'Revert Completed Reports', 'Revert completed laboratory reports', 'laboratory'),
        array('create_lab_reports', 'Create Lab Reports', 'Create laboratory test reports', 'laboratory'),
        array('edit_procedure_rates_on_invoice', 'Edit Procedure Rates on Invoice', 'Edit procedure rates on invoices', 'laboratory'),
        array('edit_lab_number', 'Edit Lab#', 'Edit laboratory test numbers', 'laboratory'),
        array('collect_sample', 'Collect Sample', 'Collect patient samples', 'laboratory'),
        array('enter_results', 'Enter Results', 'Enter test results', 'laboratory'),
        array('validate_tests', 'Validate Tests', 'Validate laboratory tests', 'laboratory'),
        array('lab_tracking', 'Lab Tracking', 'Track laboratory samples', 'laboratory'),
        array('lab_templates', 'Lab Templates', 'Access laboratory templates', 'laboratory'),
        array('view_completed_reports', 'View Completed Reports', 'View completed laboratory reports', 'laboratory'),
        
        // Radiology
        array('radiology_procedures', 'Radiology Procedures', 'Access radiology procedures', 'radiology'),
        array('create_radiology_procedures', 'Create Radiology Procedures', 'Create new radiology procedures', 'radiology'),
        array('edit_radiology_procedures', 'Edit Radiology Procedures', 'Edit radiology procedures', 'radiology'),
        array('delete_radiology_procedures', 'Delete Radiology Procedures', 'Delete radiology procedures', 'radiology'),
        array('create_radiology_invoice', 'Create Radiology Invoice', 'Create radiology invoices', 'radiology'),
        array('radiology_invoice', 'Radiology Invoice', 'Create radiology invoices', 'radiology'),
        array('add_radiology_reports', 'Add Radiology Reports', 'Add new radiology reports', 'radiology'),
        array('edit_radiology_report', 'Edit Radiology Report', 'Edit radiology reports', 'radiology'),
        array('delete_radiology_report', 'Delete Radiology Report', 'Delete radiology reports', 'radiology'),
        array('radiology_referrals', 'Radiology Referrals', 'Manage radiology referrals', 'radiology'),
        array('revert_completed_tests', 'Revert Completed Tests', 'Revert completed radiology tests', 'radiology'),
        
        // Pharmacy
        array('view_patient_profile', 'View Patient Profile', 'View patient profile information', 'pharmacy'),
        
        // Charges
        array('edit_charges_list', 'Edit Charges List', 'Edit charges list', 'charges'),
        
        // User Management
        array('create_users', 'Create Users', 'Create new user accounts', 'users'),
        array('edit_users', 'Edit Users', 'Edit user accounts', 'users'),
        array('view_users', 'View Users', 'View user list and details', 'users'),
        array('delete_users', 'Delete Users', 'Delete user accounts', 'users'),
        
        // Admin specific (keep admin prefix for admin-only permissions)
        array('admin.view_users', 'View Users', 'View user list, details, and system information', 'admin'),
        array('admin.view_billing', 'View Billing', 'View billing and sales information', 'admin'),
        array('admin.view_financial_reports', 'View Financial Reports', 'View financial reports and analytics', 'admin'),
        array('admin.view_other_reports', 'View Other Reports', 'View various system reports', 'admin'),
        
        // Emergency
        array('emergency_consultant', 'Emergency Consultant', 'Access to emergency consultation features', 'emergency')
    );
    
    $permission_ids = array();
    $inserted = 0;
    
    foreach ($permissions as $perm) {
        $db->insert('permission_definitions', array(
            'permission_key' => $perm[0],
            'permission_name' => $perm[1],
            'description' => $perm[2],
            'category' => $perm[3]
        ));
        
        if ($db->affected_rows() > 0) {
            $inserted++;
            $permission_ids[$perm[0]] = $db->insert_id();
            echo "  Created: {$perm[0]}\n";
        }
    }
    
    echo "\n  Total permissions inserted: {$inserted}\n";
    
    echo "\nStep 3: Assigning permissions to roles...\n";
    
    // Role-permission mappings (from permissions_normalized.sql)
    $role_permissions = array(
        'Staff' => array(
            'view_patient_profiles', 'search_patients', 'create_invoice', 'edit_payment_invoice_date', 'edit_invoice',
            'only_allow_invoice_payment', 'create_health_records', 'edit_health_records', 'send_sms', 'edit_price_description',
            'delete_token_appointment', 'show_doctors_share_report', 'give_discounts', 'add_appointment', 'add_patient',
            'edit_patient', 'edit_treatment_plan', 'edit_doctor_timings', 'add_inventory_purchase_requisition',
            'add_inventory_purchase_order', 'add_expenses', 'view_invoice_history', 'disabled_discount_in_invoice',
            'enable_refund_payment', 'view_opd_referrals_report', 'view_all_staff_reports', 'view_opd', 'view_patient_module',
            'view_health_record', 'view_lab_tracking', 'view_reports', 'view_inventory_purchase_requisition',
            'view_all_expenses', 'view_shift_wise_revenue_only', 'add_view_share_consumption', 'edit_leads',
            'modify_discharge_date_time', 'view_total_collection_dashboard', 'restrict_date_filter_7_days',
            'restrict_edit_discount_quantity'
        ),
        'Blood Bank Manager' => array(
            'add_donor', 'edit_donor', 'add_blood_donation', 'add_blood_consumption', 'view_inventory_purchase_requisition'
        ),
        'Nurse' => array(
            'assign_beds', 'discharge_patients', 'transfer_patient', 'create_invoice', 'add_edit_beds', 'add_edit_wards',
            'view_edit_indoor_invoices', 'view_indoor_health_record', 'view_birth_death_certificates', 'view_dispositions',
            'view_indoor_duty_roster', 'add_patient', 'edit_patient', 'delete_admitted_patients', 'view_inventory_purchase_requisition',
            'edit_nursing_notes', 'edit_leads', 'modify_discharge_date_time', 'approve_medications'
        ),
        'Inventory Manager' => array(
            'add_stock', 'edit_stock', 'consume_stock', 'edit_consumption', 'edit_item', 'add_item', 'delete_item',
            'make_stock_adjustment', 'view_inventory_reports', 'issue_stock_against_request', 'collect_stock_against_return',
            'create_purchase_order', 'gate_pass', 'issue_inward_gate_pass', 'issue_outward_gate_pass',
            'receive_items_against_inward', 'send_items_against_outward', 'print_gate_pass', 'create_users', 'edit_users',
            'hide_patient_profile'
        ),
        'Lab Manager' => array(
            'create_laboratory_invoice', 'edit_lab_reports', 'edit_lab_templates', 'delete_lab_templates',
            'view_laboratory_reports', 'delete_laboratory_reports', 'edit_outsourced_labs', 'revert_completed_reports',
            'create_users', 'edit_users', 'view_inventory_purchase_requisition'
        ),
        'Accountant' => array(
            'edit_invoice', 'refund_payment', 'delete_invoice', 'view_financial_reports', 'edit_expenses',
            'view_pharmacy_reports', 'edit_charges_list', 'view_radiology_reports', 'view_laboratory_reports',
            'view_ipd_reports', 'view_inventory_reports', 'view_inventory_purchase_requisition'
        ),
        'Lab Technician' => array(
            'create_laboratory_invoice', 'edit_procedure_rates_on_invoice', 'create_lab_reports', 'edit_lab_reports',
            'edit_lab_templates', 'delete_lab_templates', 'view_laboratory_reports', 'delete_laboratory_reports',
            'edit_lab_number', 'collect_sample', 'enter_results', 'validate_tests', 'lab_tracking', 'lab_templates',
            'view_completed_reports', 'view_inventory_purchase_requisition'
        ),
        'Radiology Technician' => array(
            'radiology_procedures', 'create_radiology_procedures', 'edit_radiology_procedures', 'delete_radiology_procedures',
            'add_radiology_reports', 'view_radiology_reports', 'enter_results', 'validate_tests', 'view_completed_reports',
            'radiology_referrals', 'radiology_invoice', 'view_inventory_purchase_requisition'
        ),
        'Radiology Manager' => array(
            'create_radiology_invoice', 'edit_radiology_report', 'delete_radiology_report', 'edit_radiology_procedures',
            'delete_radiology_procedures', 'view_radiology_reports', 'revert_completed_tests', 'create_users', 'edit_users',
            'view_inventory_purchase_requisition'
        ),
        'Pharmacist' => array(
            'add_stock', 'edit_stock', 'edit_invoice', 'edit_item', 'add_item', 'delete_item', 'edit_invoice_retail_price',
            'give_discounts', 'view_pharmacy_reports', 'transfer_stock', 'view_health_record', 'view_patient_profile',
            'delete_stock', 'deactivate_items', 'view_pharmacy_transaction_reports', 'view_inventory_purchase_requisition',
            'add_patient', 'invoice_return', 'open_sale_return'
        ),
        'Lab Receptionist' => array(
            'view_patient_profiles', 'search_patients', 'create_invoice', 'edit_payment_invoice_date', 'edit_price_description',
            'enable_discount_entry_in_invoice', 'view_completed_reports', 'view_inventory_purchase_requisition',
            'only_allow_invoice_payment', 'add_view_share_consumption', 'edit_leads'
        ),
        'Doctor' => array(
            'view_patient_profiles', 'view_all_patients', 'search_view_patients', 'create_health_records', 
            'edit_health_records', 'view_health_record', 'add_appointment', 'edit_doctor_timings',
            'edit_treatment_plan', 'view_reports', 'view_patients_report', 'view_patient_module', 'view_opd',
            'create_invoice', 'edit_invoice', 'edit_payment_invoice_date', 'delete_patient', 'emergency_consultant'
        ),
        'Admin' => array(
            'admin.view_users', 'admin.view_billing', 'admin.view_financial_reports', 'admin.view_other_reports',
            'create_users', 'edit_users', 'delete_users', 'view_users', 'delete_patient', 'edit_payment_invoice_date',
            'edit_expenses', 'view_patient_profiles', 'view_all_patients', 'view_reports', 'view_financial_reports'
        )
    );
    
    $role_perms_inserted = 0;
    
    foreach ($role_permissions as $role => $perm_keys) {
        foreach ($perm_keys as $perm_key) {
            if (isset($permission_ids[$perm_key])) {
                $db->insert('role_permissions', array(
                    'role' => $role,
                    'permission_id' => $permission_ids[$perm_key]
                ));
                
                if ($db->affected_rows() > 0) {
                    $role_perms_inserted++;
                }
            }
        }
        echo "  Assigned permissions to: {$role}\n";
    }
    
    echo "\n  Total role-permission assignments: {$role_perms_inserted}\n";
    
    $db->trans_complete();
    
    if ($db->trans_status() === FALSE) {
        throw new Exception('Transaction failed!');
    }
    
    echo "\n========================================\n";
    echo "Rebuild Completed Successfully!\n";
    echo "========================================\n\n";
    echo "Summary:\n";
    echo "  - Permissions created: {$inserted}\n";
    echo "  - Role-permission assignments: {$role_perms_inserted}\n";
    echo "  - Roles configured: " . count($role_permissions) . "\n";
    
} catch (Exception $e) {
    $db->trans_rollback();
    echo "\n========================================\n";
    echo "ERROR: Rebuild Failed!\n";
    echo "========================================\n\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    exit(1);
}

ob_end_flush();

