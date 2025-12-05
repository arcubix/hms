<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Permission Mapping Configuration
 * Maps API endpoints (controller/method) to required permission keys
 * 
 * Structure:
 * - 'controller_name' => [
 *     'method_name' => ['permission_key1', 'permission_key2'], // require ANY
 *     'method_name' => ['permission_key1', 'permission_key2', 'require_all' => true], // require ALL
 *   ]
 * 
 * Note: If a method is not listed, it may not require specific permissions
 * or permissions are checked manually in the controller.
 */

$config['permissions'] = array(
    
    // Users Controller
    'Users' => array(
        'index' => ['admin.view_users', 'admin.edit_users'], // List users
        'get' => ['admin.view_users'], // View user details
        'create' => ['admin.create_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.delete_users'],
        'permissions' => ['admin.edit_users'], // View/update user permissions
        'settings' => ['admin.edit_users'], // View/update user settings
        'roles' => ['admin.view_users'], // Get available roles
        'permission_definitions' => ['admin.view_users'], // Get permission definitions
        'role_mappings' => ['admin.view_users'], // Get role-permission mappings
        'role_permissions' => ['admin.edit_users'], // Get/update role permissions
    ),
    
    // Patients Controller
    'Patients' => array(
        'index' => ['view_all_patients', 'search_view_patients'],
        'get' => ['view_patient_profiles', 'view_all_patients'],
        'create' => ['view_all_patients'], // Create patient
        'update' => ['view_all_patients'], // Update patient
        'delete' => ['delete_patient'],
    ),
    
    // Lab Tests Controller
    'Lab_tests' => array(
        'index' => ['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports'],
        'get' => ['lab_manager.view_lab_reports', 'lab_technician.view_lab_reports'],
        'create' => ['lab_technician.create_lab_reports', 'lab_manager.create_lab_invoice'],
        'update' => ['lab_technician.edit_lab_reports', 'lab_manager.edit_lab_reports'],
        'delete' => ['lab_technician.delete_lab_reports', 'lab_manager.delete_lab_reports'],
        'validate' => ['lab_technician.validate_tests'],
        'revert' => ['lab_manager.revert_completed_reports'],
    ),
    
    // Radiology Tests Controller
    'Radiology_tests' => array(
        'index' => ['radiology_manager.view_radiology_reports', 'radiology_technician.view_radiology_reports'],
        'get' => ['radiology_manager.view_radiology_reports', 'radiology_technician.view_radiology_reports'],
        'create' => ['radiology_technician.add_radiology_reports'],
        'update' => ['radiology_manager.edit_radiology_report', 'radiology_technician.edit_radiology_procedures'],
        'delete' => ['radiology_manager.delete_radiology_report'],
        'validate' => ['radiology_technician.validate_tests'],
        'revert' => ['radiology_manager.revert_completed_tests'],
    ),
    
    // Pharmacy Sales Controller
    'Pharmacy_sales' => array(
        'index' => ['admin.view_billing'], // View sales
        'get' => ['admin.view_billing'],
        'create' => ['admin.view_billing'], // Create sale
        'update' => ['admin.view_billing'],
        'delete' => ['admin.view_billing'],
    ),
    
    // IPD Controller
    'Ipd' => array(
        'index' => ['view_all_patients'], // View IPD patients
        'get' => ['view_all_patients'],
        'create' => ['view_all_patients'], // Admit patient
        'update' => ['view_all_patients'], // Update IPD record
        'discharge' => ['view_all_patients'], // Discharge patient
    ),
    
    // Appointments Controller
    'Appointments' => array(
        'index' => ['add_appointment'],
        'get' => ['add_appointment'],
        'create' => ['add_appointment'],
        'update' => ['add_appointment'],
        'delete' => ['delete_token_appointment'],
    ),
    
    // Prescriptions Controller
    'Prescriptions' => array(
        'index' => ['view_patient_profiles'],
        'get' => ['view_patient_profiles'],
        'create' => ['view_patient_profiles'], // Create prescription
        'update' => ['view_patient_profiles'],
        'delete' => ['view_patient_profiles'],
    ),
    
    // Audit Logs Controller
    'Audit_logs' => array(
        'index' => ['admin.view_users'], // Admin only
        'get' => ['admin.view_users'],
        'export' => ['admin.view_users'],
    ),
    
    // System Settings Controller
    'System_settings' => array(
        'index' => ['admin.view_users'], // Admin only
        'update' => ['admin.view_users'],
        'get_category' => ['admin.view_users'],
        'update_bulk' => ['admin.view_users'],
    ),
    
    // GST Rates Controller
    'Gst_rates' => array(
        'index' => ['admin.view_users', 'admin.edit_users'], // Admin or pharmacy
        'get' => ['admin.view_users', 'admin.edit_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Support Tickets Controller
    'Support_tickets' => array(
        'index' => ['admin.view_users'], // Admin or ticket creator
        'get' => ['admin.view_users'],
        'create' => ['admin.view_users'], // Anyone authenticated
        'update' => ['admin.view_users'],
        'delete' => ['admin.view_users'],
    ),
    
    // Dashboard Controller
    'Dashboard' => array(
        'index' => [], // Everyone can access dashboard
        'stats' => ['admin.view_financial_reports', 'admin.view_other_reports'],
    ),
    
    // Emergency Controller
    'Emergency' => array(
        'index' => ['emergency_consultant'],
        'get' => ['emergency_consultant'],
        'create' => ['emergency_consultant'],
        'update' => ['emergency_consultant'],
    ),
    
    // Doctors Controller
    'Doctors' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.create_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.delete_users'],
    ),
    
    // Departments Controller
    'Departments' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Rooms Controller
    'Rooms' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Medicines Controller
    'Medicines' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Insurance Organizations Controller
    'InsuranceOrganizations' => array(
        'index' => ['admin.view_users', 'admin.edit_users'],
        'get' => ['admin.view_users', 'admin.edit_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Pharmacy Stock Controller
    'Pharmacy_stock' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Purchase Orders Controller
    'Purchase_orders' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Stock Adjustments Controller
    'Stock_adjustments' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Stock Movements Controller
    'Stock_movements' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
    ),
    
    // Suppliers Controller
    'Suppliers' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Shifts Controller
    'Shifts' => array(
        'index' => ['admin.view_users', 'admin.edit_users'],
        'get' => ['admin.view_users', 'admin.edit_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Cash Drawers Controller
    'Cash_drawers' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
    ),
    
    // POS Settings Controller
    'Pos_settings' => array(
        'index' => ['admin.view_users', 'admin.edit_users'],
        'update' => ['admin.edit_users'],
    ),
    
    // Barcodes Controller
    'Barcodes' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Birth Certificates Controller
    'Birth_certificates' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Death Certificates Controller
    'Death_certificates' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Doctor Rooms Controller
    'Doctor_rooms' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Doctor Slot Rooms Controller
    'Doctor_slot_rooms' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Floors Controller
    'Floors' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Message Platforms Controller
    'Message_platforms' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Message Recipients Controller
    'Message_recipients' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Message Statistics Controller
    'Message_statistics' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
    ),
    
    // Message Templates Controller
    'Message_templates' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Price Overrides Controller
    'Price_overrides' => array(
        'index' => ['admin.view_users', 'admin.edit_users'],
        'get' => ['admin.view_users', 'admin.edit_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Refunds Controller
    'Refunds' => array(
        'index' => ['admin.view_users', 'admin.edit_users'],
        'get' => ['admin.view_users', 'admin.edit_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
    ),
    
    // Reorder Controller
    'Reorder' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
    ),
    
    // Pharmacy Reports Controller
    'Pharmacy_reports' => array(
        'index' => ['admin.view_financial_reports', 'admin.view_other_reports'],
        'get' => ['admin.view_financial_reports', 'admin.view_other_reports'],
        'export' => ['admin.view_financial_reports', 'admin.view_other_reports'],
    ),
    
    // IPD Reports Controller
    'Ipd_reports' => array(
        'index' => ['admin.view_financial_reports', 'admin.view_other_reports', 'view_patients_report'],
        'get' => ['admin.view_financial_reports', 'admin.view_other_reports', 'view_patients_report'],
        'export' => ['admin.view_financial_reports', 'admin.view_other_reports', 'view_patients_report'],
    ),
    
    // Receptions Controller
    'Receptions' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Referral Hospitals Controller
    'ReferralHospitals' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Donation Donors Controller
    'DonationDonors' => array(
        'index' => ['admin.view_users'],
        'get' => ['admin.view_users'],
        'create' => ['admin.edit_users'],
        'update' => ['admin.edit_users'],
        'delete' => ['admin.edit_users'],
    ),
    
    // Tokens Controller
    'Tokens' => array(
        'index' => ['add_appointment'],
        'get' => ['add_appointment'],
        'create' => ['add_appointment'],
        'update' => ['add_appointment'],
        'delete' => ['delete_token_appointment'],
    ),
);

/* End of file permissions.php */
/* Location: ./application/config/permissions.php */

