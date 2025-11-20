-- Assign Random Permissions to Each Role
-- This script assigns a random selection of permissions to each role
-- so you can see the role user rights sections working in the UI

-- Clear existing role permissions (optional - comment out if you want to keep existing)
DELETE FROM `role_permissions`;

-- ============================================
-- ADMIN ROLE - Assign many permissions (Admin should have broad access)
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Admin', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients', 'add_patient', 'edit_patient', 'delete_patient',
  'create_invoice', 'edit_invoice', 'delete_invoice', 'edit_payment_invoice_date',
  'create_health_records', 'edit_health_records', 'view_health_record',
  'add_appointment', 'delete_token_appointment',
  'send_sms', 'view_reports', 'view_financial_reports',
  'create_users', 'edit_users',
  'add_stock', 'edit_stock', 'add_item', 'edit_item',
  'create_laboratory_invoice', 'edit_lab_reports', 'validate_tests',
  'create_radiology_invoice', 'edit_radiology_report',
  'view_opd', 'view_patient_module'
);

-- ============================================
-- DOCTOR ROLE - Assign doctor-specific permissions
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Doctor', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients',
  'create_health_records', 'edit_health_records', 'view_health_record',
  'add_appointment', 'edit_doctor_timings',
  'edit_treatment_plan', 'view_reports',
  'view_patient_module', 'view_opd'
);

-- ============================================
-- STAFF ROLE - Assign staff permissions
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Staff', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients', 'add_patient', 'edit_patient',
  'create_invoice', 'edit_invoice', 'edit_payment_invoice_date',
  'create_health_records', 'edit_health_records',
  'add_appointment', 'delete_token_appointment',
  'send_sms', 'give_discounts', 'view_reports'
);

-- ============================================
-- BLOOD BANK MANAGER ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Blood Bank Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'add_donor', 'edit_donor', 'add_blood_donation', 'add_blood_consumption',
  'view_patient_profiles', 'view_reports'
);

-- ============================================
-- NURSE ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Nurse', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'assign_beds', 'add_edit_beds', 'add_edit_wards',
  'view_edit_indoor_invoices', 'view_indoor_health_record',
  'view_birth_death_certificates', 'view_dispositions',
  'edit_nursing_notes', 'approve_medications',
  'discharge_patients', 'transfer_patient'
);

-- ============================================
-- INVENTORY MANAGER ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Inventory Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'add_stock', 'edit_stock', 'delete_stock', 'consume_stock',
  'add_item', 'edit_item', 'delete_item',
  'make_stock_adjustment', 'transfer_stock',
  'create_purchase_order', 'gate_pass',
  'view_inventory_reports'
);

-- ============================================
-- LAB MANAGER ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Lab Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'create_laboratory_invoice', 'edit_lab_reports', 'delete_laboratory_reports',
  'edit_lab_templates', 'delete_lab_templates',
  'validate_tests', 'revert_completed_reports',
  'view_laboratory_reports', 'view_completed_reports'
);

-- ============================================
-- ACCOUNTANT ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Accountant', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_financial_reports', 'edit_invoice', 'delete_invoice',
  'refund_payment', 'edit_expenses', 'view_all_expenses',
  'view_pharmacy_reports', 'view_radiology_reports',
  'view_laboratory_reports', 'view_ipd_reports',
  'view_inventory_reports'
);

-- ============================================
-- LAB TECHNICIAN ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Lab Technician', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'create_laboratory_invoice', 'create_lab_reports', 'edit_lab_reports',
  'edit_lab_number', 'collect_sample', 'enter_results',
  'validate_tests', 'lab_tracking', 'lab_templates',
  'view_completed_reports'
);

-- ============================================
-- RADIOLOGY TECHNICIAN ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Radiology Technician', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'radiology_procedures', 'create_radiology_procedures', 'edit_radiology_procedures',
  'create_radiology_invoice', 'add_radiology_reports', 'edit_radiology_report',
  'enter_results', 'validate_tests', 'view_completed_reports',
  'radiology_referrals'
);

-- ============================================
-- RADIOLOGY MANAGER ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Radiology Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'create_radiology_invoice', 'edit_radiology_report', 'delete_radiology_report',
  'edit_radiology_procedures', 'delete_radiology_procedures',
  'view_radiology_reports', 'revert_completed_tests',
  'radiology_referrals', 'create_users', 'edit_users'
);

-- ============================================
-- PHARMACIST ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Pharmacist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'add_stock', 'edit_stock', 'delete_stock', 'edit_item', 'add_item', 'delete_item',
  'edit_invoice', 'edit_invoice_retail_price', 'give_discounts',
  'transfer_stock', 'deactivate_items',
  'view_pharmacy_reports', 'view_pharmacy_transaction_reports',
  'view_patient_profile', 'view_health_record',
  'invoice_return', 'open_sale_return'
);

-- ============================================
-- LAB RECEPTIONIST ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Lab Receptionist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients',
  'create_invoice', 'edit_payment_invoice_date', 'edit_price_description',
  'only_allow_invoice_payment', 'enable_discount_entry_in_invoice',
  'view_completed_reports', 'add_view_share_consumption'
);

-- ============================================
-- EMERGENCY MANAGER ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Emergency Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'add_patient', 'edit_patient',
  'create_invoice', 'create_health_records', 'view_health_record',
  'add_appointment', 'view_reports',
  'create_users', 'edit_users'
);

-- ============================================
-- EMERGENCY NURSE ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Emergency Nurse', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'assign_beds',
  'view_edit_indoor_invoices', 'view_indoor_health_record',
  'edit_nursing_notes', 'approve_medications',
  'view_birth_death_certificates', 'view_dispositions'
);

-- ============================================
-- EMERGENCY RECEPTIONIST ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Emergency Receptionist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients', 'add_patient',
  'create_invoice', 'add_appointment',
  'only_allow_invoice_payment', 'send_sms'
);

-- ============================================
-- QUALITY CONTROL MANAGER ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Quality Control Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_reports', 'view_financial_reports', 'view_laboratory_reports',
  'view_radiology_reports', 'view_pharmacy_reports',
  'view_completed_reports', 'validate_tests',
  'edit_lab_reports', 'edit_radiology_report'
);

-- ============================================
-- RADIOLOGY RECEPTIONIST ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Radiology Receptionist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients',
  'create_radiology_invoice', 'radiology_referrals',
  'only_allow_invoice_payment', 'add_appointment'
);

-- ============================================
-- RECEPTIONIST ROLE
-- ============================================
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Receptionist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients', 'add_patient',
  'create_invoice', 'add_appointment', 'delete_token_appointment',
  'only_allow_invoice_payment', 'send_sms',
  'edit_payment_invoice_date'
);

