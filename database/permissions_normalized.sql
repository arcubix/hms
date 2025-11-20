-- Normalized Permissions System
-- This file contains unique permission definitions (no duplicates)
-- Permissions are stored once and referenced by ID in role_permissions

-- ============================================
-- CLEAR EXISTING DATA
-- ============================================
DELETE FROM `role_permissions`;
DELETE FROM `user_custom_permissions`;
DELETE FROM `permission_definitions`;

-- ============================================
-- INSERT UNIQUE PERMISSION DEFINITIONS
-- ============================================
-- All permissions are unique, no role prefixes

INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
-- Patient Management
('view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'patient'),
('search_patients', 'Search Patients', 'Search for patients in the system', 'patient'),
('add_patient', 'Add Patient', 'Add new patients to the system', 'patient'),
('edit_patient', 'Edit Patient', 'Edit patient information', 'patient'),
('delete_patient', 'Delete Patient', 'Delete patient records', 'patient'),
('hide_patient_profile', 'Hide Patient Profile', 'Hide patient profile information', 'patient'),

-- Invoice Management
('create_invoice', 'Create Invoice', 'Create new invoices', 'invoice'),
('edit_invoice', 'Edit Invoice', 'Edit invoice details', 'invoice'),
('delete_invoice', 'Delete Invoice', 'Delete invoices', 'invoice'),
('edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'invoice'),
('only_allow_invoice_payment', 'Only Allow Invoice Payment', 'Only allow invoice payment without editing', 'invoice'),
('edit_price_description', 'Edit Price & Description', 'Edit price and description on invoices', 'invoice'),
('give_discounts', 'Give Discounts', 'Apply discounts to invoices', 'invoice'),
('disabled_discount_in_invoice', 'Disabled Discount In Invoice', 'Disable discount option in invoice', 'invoice'),
('enable_discount_entry_in_invoice', 'Enable Discount Entry in Invoice', 'Enable discount entry in invoices', 'invoice'),
('restrict_edit_discount_quantity', 'Restrict Edit Discount and Quantity', 'Restrict editing of discount and quantity', 'invoice'),
('view_invoice_history', 'View Invoice History (Patient Profile)', 'View invoice history in patient profile', 'invoice'),
('enable_refund_payment', 'Enable Refund Payment', 'Enable refund payment functionality', 'invoice'),
('refund_payment', 'Refund Payment', 'Process refund payments', 'invoice'),
('invoice_return', 'Invoice Return', 'Process invoice returns', 'invoice'),
('open_sale_return', 'Open Sale Return', 'Open sale return transactions', 'invoice'),
('edit_invoice_retail_price', 'Edit Invoice Retail Price', 'Edit retail prices on invoices', 'invoice'),

-- Health Records
('create_health_records', 'Create Health Records', 'Create new health records', 'health_record'),
('edit_health_records', 'Edit Health Records', 'Edit existing health records', 'health_record'),
('view_health_record', 'View Health Record', 'View patient health records', 'health_record'),
('view_indoor_health_record', 'View Indoor Health Record', 'View indoor patient health records', 'health_record'),

-- Appointments & Scheduling
('add_appointment', 'Add Appointment', 'Add new appointments', 'appointment'),
('delete_token_appointment', 'Delete Token or Appointment', 'Delete tokens and appointments', 'appointment'),
('edit_doctor_timings', 'Edit Doctor Timings', 'Edit doctor schedule and timings', 'appointment'),

-- Treatment & Plans
('edit_treatment_plan', 'Edit Treatment Plan', 'Edit patient treatment plans', 'treatment'),

-- Communication
('send_sms', 'Send SMS', 'Send SMS notifications to patients', 'communication'),

-- Reports & Analytics
('show_doctors_share_report', 'Show Doctors Share Report', 'View doctors share reports', 'reports'),
('view_reports', 'View Reports', 'View various system reports', 'reports'),
('view_opd_referrals_report', 'View OPD Referrals Report', 'View OPD referrals reports', 'reports'),
('view_all_staff_reports', 'View All Staff Reports', 'View all staff-related reports', 'reports'),
('view_financial_reports', 'View Financial Reports', 'View financial reports and analytics', 'reports'),
('view_pharmacy_reports', 'View Pharmacy Reports', 'View pharmacy-related reports', 'reports'),
('view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'reports'),
('view_laboratory_reports', 'View Laboratory Reports', 'View laboratory test reports', 'reports'),
('view_ipd_reports', 'View IPD Reports', 'View IPD (Indoor Patient Department) reports', 'reports'),
('view_inventory_reports', 'View Inventory Reports', 'View inventory reports', 'reports'),
('view_pharmacy_transaction_reports', 'View Pharmacy Transaction Reports', 'View pharmacy transaction reports', 'reports'),
('view_shift_wise_revenue_only', 'View Shift Wise Revenue Only', 'View shift-wise revenue reports only', 'reports'),
('view_total_collection_dashboard', 'View Total Collection Dashboard', 'View total collection dashboard', 'reports'),
('restrict_date_filter_7_days', 'Restrict Date Filter To 7 Days Only', 'Restrict date filter to 7 days only', 'reports'),

-- Modules Access
('view_opd', 'View OPD', 'View OPD module', 'modules'),
('view_patient_module', 'View Patient Module', 'View patient management module', 'modules'),
('view_lab_tracking', 'View Lab Tracking', 'View laboratory tracking information', 'modules'),

-- Inventory Management
('add_inventory_purchase_requisition', 'Add Inventory Purchase Requisition', 'Add inventory purchase requisitions', 'inventory'),
('view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'inventory'),
('add_inventory_purchase_order', 'Add Inventory Purchase Order', 'Add inventory purchase orders', 'inventory'),
('add_stock', 'Add Stock', 'Add stock to inventory', 'inventory'),
('edit_stock', 'Edit Stock', 'Edit stock information', 'inventory'),
('delete_stock', 'Delete Stock', 'Delete stock records', 'inventory'),
('consume_stock', 'Consume Stock', 'Consume stock from inventory', 'inventory'),
('edit_consumption', 'Edit Consumption', 'Edit consumption records', 'inventory'),
('edit_item', 'Edit Item', 'Edit inventory item information', 'inventory'),
('add_item', 'Add Item', 'Add new items to inventory', 'inventory'),
('delete_item', 'Delete Item', 'Delete items from inventory', 'inventory'),
('make_stock_adjustment', 'Make Stock Adjustment', 'Make stock adjustments', 'inventory'),
('issue_stock_against_request', 'Issue Stock Against Request', 'Issue stock against requisition requests', 'inventory'),
('collect_stock_against_return', 'Collect Stock Against Return Request', 'Collect stock against return requests', 'inventory'),
('create_purchase_order', 'Create Purchase Order', 'Create purchase orders', 'inventory'),
('gate_pass', 'Gate Pass', 'Manage gate passes', 'inventory'),
('issue_inward_gate_pass', 'Issue Inward Gate Pass', 'Issue inward gate passes', 'inventory'),
('issue_outward_gate_pass', 'Issue Outward Gate Pass', 'Issue outward gate passes', 'inventory'),
('receive_items_against_inward', 'Receive Items Against Inward Gate Pass', 'Receive items against inward gate passes', 'inventory'),
('send_items_against_outward', 'Send Items Against Outward Gate Pass', 'Send items against outward gate passes', 'inventory'),
('print_gate_pass', 'Print Gate Pass', 'Print gate passes', 'inventory'),
('transfer_stock', 'Transfer Stock', 'Transfer stock between locations', 'inventory'),
('deactivate_items', 'Deactivate Items', 'Deactivate pharmacy items', 'inventory'),

-- Expenses
('add_expenses', 'Add Expenses', 'Add expense records', 'expenses'),
('edit_expenses', 'Edit Expenses', 'Edit expense records', 'expenses'),
('view_all_expenses', 'View All Expenses', 'View all expense records', 'expenses'),

-- Share & Consumption
('add_view_share_consumption', 'Add/View Share and Consumption', 'Add and view share and consumption data', 'shares'),

-- Leads
('edit_leads', 'Edit Leads', 'Edit lead information', 'leads'),

-- Discharge & Transfer
('modify_discharge_date_time', 'Modify Discharge Date/Time', 'Modify patient discharge date and time', 'discharge'),
('discharge_patients', 'Discharge Patients', 'Discharge patients from hospital', 'discharge'),
('transfer_patient', 'Transfer Patient', 'Transfer patients between wards/beds', 'discharge'),

-- Blood Bank
('add_donor', 'Add Donor', 'Add new blood donors', 'blood_bank'),
('edit_donor', 'Edit Donor', 'Edit donor information', 'blood_bank'),
('add_blood_donation', 'Add Blood Donation', 'Add blood donation records', 'blood_bank'),
('add_blood_consumption', 'Add Blood Consumption', 'Add blood consumption records', 'blood_bank'),

-- Nursing
('assign_beds', 'Assign Beds', 'Assign beds to patients', 'nursing'),
('add_edit_beds', 'Add/Edit Beds', 'Add and edit bed information', 'nursing'),
('add_edit_wards', 'Add/Edit Wards', 'Add and edit ward information', 'nursing'),
('view_edit_indoor_invoices', 'View & Edit Indoor Invoices', 'View and edit indoor patient invoices', 'nursing'),
('view_birth_death_certificates', 'View Birth and Death Certificates', 'View birth and death certificates', 'nursing'),
('view_dispositions', 'View Dispositions', 'View patient dispositions', 'nursing'),
('view_indoor_duty_roster', 'View Indoor Duty Roster', 'View indoor duty roster', 'nursing'),
('delete_admitted_patients', 'Delete Admitted Patients', 'Delete admitted patient records', 'nursing'),
('edit_nursing_notes', 'Edit Nursing Notes', 'Edit nursing notes for patients', 'nursing'),
('approve_medications', 'Approve Medications', 'Approve patient medications', 'nursing'),

-- Laboratory
('create_laboratory_invoice', 'Create Laboratory Invoice', 'Create laboratory invoices', 'laboratory'),
('edit_lab_reports', 'Edit Lab Reports', 'Edit laboratory test reports', 'laboratory'),
('delete_laboratory_reports', 'Delete Laboratory Reports', 'Delete laboratory reports', 'laboratory'),
('edit_lab_templates', 'Edit Lab Templates', 'Edit laboratory test templates', 'laboratory'),
('delete_lab_templates', 'Delete Lab Templates', 'Delete laboratory test templates', 'laboratory'),
('edit_outsourced_labs', 'Edit Outsourced Labs in Templates', 'Edit outsourced laboratory information in templates', 'laboratory'),
('revert_completed_reports', 'Revert Completed Reports', 'Revert completed laboratory reports', 'laboratory'),
('create_lab_reports', 'Create Lab Reports', 'Create laboratory test reports', 'laboratory'),
('edit_procedure_rates_on_invoice', 'Edit Procedure Rates on Invoice', 'Edit procedure rates on invoices', 'laboratory'),
('edit_lab_number', 'Edit Lab#', 'Edit laboratory test numbers', 'laboratory'),
('collect_sample', 'Collect Sample', 'Collect patient samples', 'laboratory'),
('enter_results', 'Enter Results', 'Enter test results', 'laboratory'),
('validate_tests', 'Validate Tests', 'Validate laboratory tests', 'laboratory'),
('lab_tracking', 'Lab Tracking', 'Track laboratory samples', 'laboratory'),
('lab_templates', 'Lab Templates', 'Access laboratory templates', 'laboratory'),
('view_completed_reports', 'View Completed Reports', 'View completed laboratory reports', 'laboratory'),

-- Radiology
('radiology_procedures', 'Radiology Procedures', 'Access radiology procedures', 'radiology'),
('create_radiology_procedures', 'Create Radiology Procedures', 'Create new radiology procedures', 'radiology'),
('edit_radiology_procedures', 'Edit Radiology Procedures', 'Edit radiology procedures', 'radiology'),
('delete_radiology_procedures', 'Delete Radiology Procedures', 'Delete radiology procedures', 'radiology'),
('create_radiology_invoice', 'Create Radiology Invoice', 'Create radiology invoices', 'radiology'),
('radiology_invoice', 'Radiology Invoice', 'Create radiology invoices', 'radiology'),
('add_radiology_reports', 'Add Radiology Reports', 'Add new radiology reports', 'radiology'),
('edit_radiology_report', 'Edit Radiology Report', 'Edit radiology reports', 'radiology'),
('delete_radiology_report', 'Delete Radiology Report', 'Delete radiology reports', 'radiology'),
('radiology_referrals', 'Radiology Referrals', 'Manage radiology referrals', 'radiology'),
('revert_completed_tests', 'Revert Completed Tests', 'Revert completed radiology tests', 'radiology'),

-- Pharmacy
('view_patient_profile', 'View Patient Profile', 'View patient profile information', 'pharmacy'),

-- Charges
('edit_charges_list', 'Edit Charges List', 'Edit charges list', 'charges'),

-- User Management
('create_users', 'Create Users', 'Create new user accounts', 'users'),
('edit_users', 'Edit Users', 'Edit user accounts', 'users')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- ============================================
-- INSERT ROLE PERMISSIONS (Using Permission IDs)
-- ============================================
-- Note: This uses subqueries to get permission IDs based on permission_key

-- Staff Role Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Staff', `id` FROM `permission_definitions` WHERE `permission_key` IN (
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
);

-- Blood Bank Manager Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Blood Bank Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'add_donor', 'edit_donor', 'add_blood_donation', 'add_blood_consumption', 'view_inventory_purchase_requisition'
);

-- Nurse Role Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Nurse', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'assign_beds', 'discharge_patients', 'transfer_patient', 'create_invoice', 'add_edit_beds', 'add_edit_wards',
  'view_edit_indoor_invoices', 'view_indoor_health_record', 'view_birth_death_certificates', 'view_dispositions',
  'view_indoor_duty_roster', 'add_patient', 'edit_patient', 'delete_admitted_patients', 'view_inventory_purchase_requisition',
  'edit_nursing_notes', 'edit_leads', 'modify_discharge_date_time', 'approve_medications'
);

-- Inventory Manager Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Inventory Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'add_stock', 'edit_stock', 'consume_stock', 'edit_consumption', 'edit_item', 'add_item', 'delete_item',
  'make_stock_adjustment', 'view_inventory_reports', 'issue_stock_against_request', 'collect_stock_against_return',
  'create_purchase_order', 'gate_pass', 'issue_inward_gate_pass', 'issue_outward_gate_pass',
  'receive_items_against_inward', 'send_items_against_outward', 'print_gate_pass', 'create_users', 'edit_users',
  'hide_patient_profile'
);

-- Laboratory Manager Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Lab Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'create_laboratory_invoice', 'edit_lab_reports', 'edit_lab_templates', 'delete_lab_templates',
  'view_laboratory_reports', 'delete_laboratory_reports', 'edit_outsourced_labs', 'revert_completed_reports',
  'create_users', 'edit_users', 'view_inventory_purchase_requisition'
);

-- Accountant Role Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Accountant', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'edit_invoice', 'refund_payment', 'delete_invoice', 'view_financial_reports', 'edit_expenses',
  'view_pharmacy_reports', 'edit_charges_list', 'view_radiology_reports', 'view_laboratory_reports',
  'view_ipd_reports', 'view_inventory_reports', 'view_inventory_purchase_requisition'
);

-- Laboratory Technician Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Lab Technician', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'create_laboratory_invoice', 'edit_procedure_rates_on_invoice', 'create_lab_reports', 'edit_lab_reports',
  'edit_lab_templates', 'delete_lab_templates', 'view_laboratory_reports', 'delete_laboratory_reports',
  'edit_lab_number', 'collect_sample', 'enter_results', 'validate_tests', 'lab_tracking', 'lab_templates',
  'view_completed_reports', 'view_inventory_purchase_requisition'
);

-- Radiology Technician Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Radiology Technician', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'radiology_procedures', 'create_radiology_procedures', 'edit_radiology_procedures', 'delete_radiology_procedures',
  'add_radiology_reports', 'view_radiology_reports', 'enter_results', 'validate_tests', 'view_completed_reports',
  'radiology_referrals', 'radiology_invoice', 'view_inventory_purchase_requisition'
);

-- Radiology Manager Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Radiology Manager', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'create_radiology_invoice', 'edit_radiology_report', 'delete_radiology_report', 'edit_radiology_procedures',
  'delete_radiology_procedures', 'view_radiology_reports', 'revert_completed_tests', 'create_users', 'edit_users',
  'view_inventory_purchase_requisition'
);

-- Pharmacist Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Pharmacist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'add_stock', 'edit_stock', 'edit_invoice', 'edit_item', 'add_item', 'delete_item', 'edit_invoice_retail_price',
  'give_discounts', 'view_pharmacy_reports', 'transfer_stock', 'view_health_record', 'view_patient_profile',
  'delete_stock', 'deactivate_items', 'view_pharmacy_transaction_reports', 'view_inventory_purchase_requisition',
  'add_patient', 'invoice_return', 'open_sale_return'
);

-- Lab Receptionist Permissions
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'Lab Receptionist', `id` FROM `permission_definitions` WHERE `permission_key` IN (
  'view_patient_profiles', 'search_patients', 'create_invoice', 'edit_payment_invoice_date', 'edit_price_description',
  'enable_discount_entry_in_invoice', 'view_completed_reports', 'view_inventory_purchase_requisition',
  'only_allow_invoice_payment', 'add_view_share_consumption', 'edit_leads'
);

