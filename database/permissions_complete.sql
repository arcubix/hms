-- Complete Permissions System
-- This file contains all permission definitions and role-permission mappings
-- Based on the comprehensive role and permission requirements

-- ============================================
-- CLEAR EXISTING DATA (Optional - uncomment if needed)
-- ============================================
DELETE FROM `role_permissions`;
DELETE FROM `permission_definitions`;

-- ============================================
-- INSERT PERMISSION DEFINITIONS
-- ============================================

-- Staff Role Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('staff.view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'staff'),
('staff.search_patients', 'Search Patients', 'Search for patients in the system', 'staff'),
('staff.create_invoice', 'Create Invoice', 'Create new invoices', 'staff'),
('staff.edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'staff'),
('staff.edit_invoices', 'Edit Invoices', 'Edit invoice details', 'staff'),
('staff.only_allow_invoice_payment', 'Only Allow Invoice Payment', 'Only allow invoice payment without editing', 'staff'),
('staff.create_health_records', 'Create Health Records', 'Create new health records', 'staff'),
('staff.edit_health_records', 'Edit Health Records', 'Edit existing health records', 'staff'),
('staff.send_sms', 'Send SMS', 'Send SMS notifications to patients', 'staff'),
('staff.edit_price_description', 'Edit Price & Description', 'Edit price and description on invoices', 'staff'),
('staff.delete_token_appointment', 'Delete Token or Appointment', 'Delete tokens and appointments', 'staff'),
('staff.show_doctors_share_report', 'Show Doctors Share Report', 'View doctors share reports', 'staff'),
('staff.give_discounts', 'Give Discounts', 'Apply discounts to invoices', 'staff'),
('staff.add_appointment', 'Add Appointment', 'Add new appointments', 'staff'),
('staff.add_patient', 'Add Patient', 'Add new patients to the system', 'staff'),
('staff.edit_patient', 'Edit Patient', 'Edit patient information', 'staff'),
('staff.edit_treatment_plan', 'Edit Treatment Plan', 'Edit patient treatment plans', 'staff'),
('staff.edit_doctor_timings', 'Edit Doctor Timings', 'Edit doctor schedule and timings', 'staff'),
('staff.add_inventory_purchase_requisition', 'Add Inventory Purchase Requisition', 'Add inventory purchase requisitions', 'staff'),
('staff.add_inventory_purchase_order', 'Add Inventory Purchase Order', 'Add inventory purchase orders', 'staff'),
('staff.add_expenses', 'Add Expenses', 'Add expense records', 'staff'),
('staff.view_invoice_history', 'View Invoice History (Patient Profile)', 'View invoice history in patient profile', 'staff'),
('staff.disabled_discount_in_invoice', 'Disabled Discount In Invoice', 'Disable discount option in invoice', 'staff'),
('staff.enable_refund_payment', 'Enable Refund Payment', 'Enable refund payment functionality', 'staff'),
('staff.view_opd_referrals_report', 'View OPD Referrals Report', 'View OPD referrals reports', 'staff'),
('staff.view_all_staff_reports', 'View All Staff Reports', 'View all staff-related reports', 'staff'),
('staff.view_opd', 'View OPD', 'View OPD module', 'staff'),
('staff.view_patient_module', 'View Patient Module', 'View patient management module', 'staff'),
('staff.view_health_record', 'View Health Record', 'View patient health records', 'staff'),
('staff.view_lab_tracking', 'View Lab Tracking', 'View laboratory tracking information', 'staff'),
('staff.view_reports', 'View Reports', 'View various system reports', 'staff'),
('staff.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'staff'),
('staff.view_all_expenses', 'View All Expenses', 'View all expense records', 'staff'),
('staff.view_shift_wise_revenue_only', 'View Shift Wise Revenue Only', 'View shift-wise revenue reports only', 'staff'),
('staff.add_view_share_consumption', 'Add/View Share and Consumption', 'Add and view share and consumption data', 'staff'),
('staff.edit_leads', 'Edit Leads', 'Edit lead information', 'staff'),
('staff.modify_discharge_date_time', 'Modify Discharge Date/Time', 'Modify patient discharge date and time', 'staff'),
('staff.view_total_collection_dashboard', 'View Total Collection Dashboard', 'View total collection dashboard', 'staff'),
('staff.restrict_date_filter_7_days', 'Restrict Date Filter To 7 Days Only', 'Restrict date filter to 7 days only', 'staff'),
('staff.restrict_edit_discount_quantity', 'Restrict Edit Discount and Quantity', 'Restrict editing of discount and quantity', 'staff')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Blood Bank Manager Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('blood_bank_manager.add_donor', 'Add Donor', 'Add new blood donors', 'blood_bank_manager'),
('blood_bank_manager.edit_donor', 'Edit Donor', 'Edit donor information', 'blood_bank_manager'),
('blood_bank_manager.add_blood_donation', 'Add Blood Donation', 'Add blood donation records', 'blood_bank_manager'),
('blood_bank_manager.add_blood_consumption', 'Add Blood Consumption', 'Add blood consumption records', 'blood_bank_manager'),
('blood_bank_manager.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'blood_bank_manager')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Nurse Role Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('nurse.assign_beds', 'Assign Beds', 'Assign beds to patients', 'nurse'),
('nurse.discharge_patients', 'Discharge Patients', 'Discharge patients from hospital', 'nurse'),
('nurse.transfer_patient', 'Transfer Patient', 'Transfer patients between wards/beds', 'nurse'),
('nurse.add_invoice', 'Add Invoice', 'Add new invoices', 'nurse'),
('nurse.add_edit_beds', 'Add/Edit Beds', 'Add and edit bed information', 'nurse'),
('nurse.add_edit_wards', 'Add/Edit Wards', 'Add and edit ward information', 'nurse'),
('nurse.view_edit_indoor_invoices', 'View & Edit Indoor Invoices', 'View and edit indoor patient invoices', 'nurse'),
('nurse.view_indoor_health_record', 'View Indoor Health Record', 'View indoor patient health records', 'nurse'),
('nurse.view_birth_death_certificates', 'View Birth and Death Certificates', 'View birth and death certificates', 'nurse'),
('nurse.view_dispositions', 'View Dispositions', 'View patient dispositions', 'nurse'),
('nurse.view_indoor_duty_roster', 'View Indoor Duty Roster', 'View indoor duty roster', 'nurse'),
('nurse.add_patient', 'Add Patient', 'Add new patients to the system', 'nurse'),
('nurse.edit_patient', 'Edit Patient', 'Edit patient information', 'nurse'),
('nurse.delete_admitted_patients', 'Delete Admitted Patients', 'Delete admitted patient records', 'nurse'),
('nurse.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'nurse'),
('nurse.edit_nursing_notes', 'Edit Nursing Notes', 'Edit nursing notes for patients', 'nurse'),
('nurse.edit_leads', 'Edit Leads', 'Edit lead information', 'nurse'),
('nurse.modify_discharge_date_time', 'Modify Discharge Date/Time', 'Modify patient discharge date and time', 'nurse'),
('nurse.approve_medications', 'Approve Medications', 'Approve patient medications', 'nurse')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Inventory Manager Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('inventory_manager.add_stock', 'Add Stock', 'Add stock to inventory', 'inventory_manager'),
('inventory_manager.edit_stock', 'Edit Stock', 'Edit stock information', 'inventory_manager'),
('inventory_manager.consume_stock', 'Consume Stock', 'Consume stock from inventory', 'inventory_manager'),
('inventory_manager.edit_consumption', 'Edit Consumption', 'Edit consumption records', 'inventory_manager'),
('inventory_manager.edit_item', 'Edit Item', 'Edit inventory item information', 'inventory_manager'),
('inventory_manager.add_item', 'Add Item', 'Add new items to inventory', 'inventory_manager'),
('inventory_manager.delete_item', 'Delete Item', 'Delete items from inventory', 'inventory_manager'),
('inventory_manager.make_stock_adjustment', 'Make Stock Adjustment', 'Make stock adjustments', 'inventory_manager'),
('inventory_manager.view_inventory_reports', 'View Inventory Reports', 'View inventory reports', 'inventory_manager'),
('inventory_manager.issue_stock_against_request', 'Issue Stock Against Request', 'Issue stock against requisition requests', 'inventory_manager'),
('inventory_manager.collect_stock_against_return', 'Collect Stock Against Return Request', 'Collect stock against return requests', 'inventory_manager'),
('inventory_manager.create_purchase_order', 'Create Purchase Order', 'Create purchase orders', 'inventory_manager'),
('inventory_manager.gate_pass', 'Gate Pass', 'Manage gate passes', 'inventory_manager'),
('inventory_manager.issue_inward_gate_pass', 'Issue Inward Gate Pass', 'Issue inward gate passes', 'inventory_manager'),
('inventory_manager.issue_outward_gate_pass', 'Issue Outward Gate Pass', 'Issue outward gate passes', 'inventory_manager'),
('inventory_manager.receive_items_against_inward', 'Receive Items Against Inward Gate Pass', 'Receive items against inward gate passes', 'inventory_manager'),
('inventory_manager.send_items_against_outward', 'Send Items Against Outward Gate Pass', 'Send items against outward gate passes', 'inventory_manager'),
('inventory_manager.print_gate_pass', 'Print Gate Pass', 'Print gate passes', 'inventory_manager'),
('inventory_manager.create_users', 'Create Users', 'Create new user accounts', 'inventory_manager'),
('inventory_manager.edit_users', 'Edit Users', 'Edit user accounts', 'inventory_manager'),
('inventory_manager.hide_patient_profile', 'Hide Patient Profile', 'Hide patient profile information', 'inventory_manager')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Laboratory Manager Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('lab_manager.create_laboratory_invoice', 'Create Laboratory Invoice', 'Create laboratory invoices', 'lab_manager'),
('lab_manager.edit_lab_reports', 'Edit Lab Reports', 'Edit laboratory test reports', 'lab_manager'),
('lab_manager.edit_lab_templates', 'Edit Lab Templates', 'Edit laboratory test templates', 'lab_manager'),
('lab_manager.delete_lab_templates', 'Delete Lab Templates', 'Delete laboratory test templates', 'lab_manager'),
('lab_manager.view_laboratory_reports', 'View Laboratory Reports', 'View laboratory test reports', 'lab_manager'),
('lab_manager.delete_laboratory_reports', 'Delete Laboratory Reports', 'Delete laboratory reports', 'lab_manager'),
('lab_manager.edit_outsourced_labs', 'Edit Outsourced Labs in Templates', 'Edit outsourced laboratory information in templates', 'lab_manager'),
('lab_manager.revert_completed_reports', 'Revert Completed Reports', 'Revert completed laboratory reports', 'lab_manager'),
('lab_manager.create_users', 'Create Users', 'Create new user accounts', 'lab_manager'),
('lab_manager.edit_users', 'Edit Users', 'Edit user accounts', 'lab_manager'),
('lab_manager.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'lab_manager')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Accountant Role Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('accountant.edit_invoice', 'Edit Invoice', 'Edit invoice details', 'accountant'),
('accountant.refund_payment', 'Refund Payment', 'Process refund payments', 'accountant'),
('accountant.delete_invoice', 'Delete Invoice', 'Delete invoices', 'accountant'),
('accountant.view_financial_reports', 'View Financial Reports', 'View financial reports and analytics', 'accountant'),
('accountant.edit_expenses', 'Edit Expenses', 'Edit expense records', 'accountant'),
('accountant.view_pharmacy_reports', 'View Pharmacy Reports', 'View pharmacy-related reports', 'accountant'),
('accountant.edit_charges_list', 'Edit Charges List', 'Edit charges list', 'accountant'),
('accountant.view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'accountant'),
('accountant.view_laboratory_reports', 'View Laboratory Reports', 'View laboratory reports', 'accountant'),
('accountant.view_ipd_reports', 'View IPD Reports', 'View IPD (Indoor Patient Department) reports', 'accountant'),
('accountant.view_inventory_reports', 'View Inventory Reports', 'View inventory reports', 'accountant'),
('accountant.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'accountant')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Laboratory Technician Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('lab_technician.create_laboratory_invoice', 'Create Laboratory Invoice', 'Create laboratory invoices', 'lab_technician'),
('lab_technician.edit_procedure_rates_on_invoice', 'Edit Procedure Rates on Invoice', 'Edit procedure rates on invoices', 'lab_technician'),
('lab_technician.create_lab_reports', 'Create Lab Reports', 'Create laboratory test reports', 'lab_technician'),
('lab_technician.edit_lab_reports', 'Edit Lab Reports', 'Edit laboratory test reports', 'lab_technician'),
('lab_technician.edit_lab_templates', 'Edit Lab Templates', 'Edit laboratory test templates', 'lab_technician'),
('lab_technician.delete_lab_templates', 'Delete Lab Templates', 'Delete laboratory test templates', 'lab_technician'),
('lab_technician.view_laboratory_reports', 'View Laboratory Reports', 'View laboratory test reports', 'lab_technician'),
('lab_technician.delete_laboratory_reports', 'Delete Laboratory Reports', 'Delete laboratory reports', 'lab_technician'),
('lab_technician.edit_lab_number', 'Edit Lab#', 'Edit laboratory test numbers', 'lab_technician'),
('lab_technician.collect_sample', 'Collect Sample', 'Collect patient samples', 'lab_technician'),
('lab_technician.enter_results', 'Enter Results', 'Enter test results', 'lab_technician'),
('lab_technician.validate_tests', 'Validate Tests', 'Validate laboratory tests', 'lab_technician'),
('lab_technician.lab_tracking', 'Lab Tracking', 'Track laboratory samples', 'lab_technician'),
('lab_technician.lab_templates', 'Lab Templates', 'Access laboratory templates', 'lab_technician'),
('lab_technician.view_completed_reports', 'View Completed Reports', 'View completed laboratory reports', 'lab_technician'),
('lab_technician.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'lab_technician')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Radiology Technician Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('radiology_technician.radiology_procedures', 'Radiology Procedures', 'Access radiology procedures', 'radiology_technician'),
('radiology_technician.create_radiology_procedures', 'Create Radiology Procedures', 'Create new radiology procedures', 'radiology_technician'),
('radiology_technician.edit_radiology_procedures', 'Edit Radiology Procedures', 'Edit radiology procedures', 'radiology_technician'),
('radiology_technician.delete_radiology_procedures', 'Delete Radiology Procedures', 'Delete radiology procedures', 'radiology_technician'),
('radiology_technician.add_radiology_reports', 'Add Radiology Reports', 'Add new radiology reports', 'radiology_technician'),
('radiology_technician.view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'radiology_technician'),
('radiology_technician.enter_results', 'Enter Results', 'Enter radiology test results', 'radiology_technician'),
('radiology_technician.validate_tests', 'Validate Tests', 'Validate radiology tests', 'radiology_technician'),
('radiology_technician.view_completed_reports', 'View Completed Reports', 'View completed radiology reports', 'radiology_technician'),
('radiology_technician.radiology_referrals', 'Radiology Referrals', 'Manage radiology referrals', 'radiology_technician'),
('radiology_technician.radiology_invoice', 'Radiology Invoice', 'Create radiology invoices', 'radiology_technician'),
('radiology_technician.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'radiology_technician')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Radiology Manager Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('radiology_manager.create_radiology_invoice', 'Create Radiology Invoice', 'Create radiology invoices', 'radiology_manager'),
('radiology_manager.edit_radiology_report', 'Edit Radiology Report', 'Edit radiology reports', 'radiology_manager'),
('radiology_manager.delete_radiology_report', 'Delete Radiology Report', 'Delete radiology reports', 'radiology_manager'),
('radiology_manager.edit_radiology_procedure', 'Edit Radiology Procedure', 'Edit radiology procedures', 'radiology_manager'),
('radiology_manager.delete_radiology_procedure', 'Delete Radiology Procedure', 'Delete radiology procedures', 'radiology_manager'),
('radiology_manager.view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'radiology_manager'),
('radiology_manager.revert_completed_tests', 'Revert Completed Tests', 'Revert completed radiology tests', 'radiology_manager'),
('radiology_manager.create_users', 'Create Users', 'Create new user accounts', 'radiology_manager'),
('radiology_manager.edit_users', 'Edit Users', 'Edit user accounts', 'radiology_manager'),
('radiology_manager.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'radiology_manager')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Pharmacist Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('pharmacist.add_stock', 'Add Stock', 'Add stock to pharmacy inventory', 'pharmacist'),
('pharmacist.edit_stock', 'Edit Stock', 'Edit stock information', 'pharmacist'),
('pharmacist.edit_invoice', 'Edit Invoice', 'Edit invoice details', 'pharmacist'),
('pharmacist.edit_item', 'Edit Item', 'Edit pharmacy item information', 'pharmacist'),
('pharmacist.add_item', 'Add Item', 'Add new items to pharmacy', 'pharmacist'),
('pharmacist.delete_item', 'Delete Item', 'Delete items from pharmacy', 'pharmacist'),
('pharmacist.edit_invoice_retail_price', 'Edit Invoice Retail Price', 'Edit retail prices on invoices', 'pharmacist'),
('pharmacist.give_discounts', 'Give Discounts', 'Apply discounts to invoices', 'pharmacist'),
('pharmacist.view_pharmacy_reports', 'View Pharmacy Reports', 'View pharmacy-related reports', 'pharmacist'),
('pharmacist.transfer_stock', 'Transfer Stock', 'Transfer stock between locations', 'pharmacist'),
('pharmacist.view_health_record', 'View Health Record', 'View patient health records', 'pharmacist'),
('pharmacist.view_patient_profile', 'View Patient Profile', 'View patient profile information', 'pharmacist'),
('pharmacist.delete_stock', 'Delete Stock', 'Delete stock records', 'pharmacist'),
('pharmacist.deactivate_items', 'Deactivate Items', 'Deactivate pharmacy items', 'pharmacist'),
('pharmacist.view_pharmacy_transaction_reports', 'View Pharmacy Transaction Reports', 'View pharmacy transaction reports', 'pharmacist'),
('pharmacist.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'pharmacist'),
('pharmacist.add_patient', 'Add Patient', 'Add new patients to the system', 'pharmacist'),
('pharmacist.invoice_return', 'Invoice Return', 'Process invoice returns', 'pharmacist'),
('pharmacist.open_sale_return', 'Open Sale Return', 'Open sale return transactions', 'pharmacist')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- Lab Receptionist Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('lab_receptionist.view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'lab_receptionist'),
('lab_receptionist.search_patients', 'Search Patients', 'Search for patients in the system', 'lab_receptionist'),
('lab_receptionist.create_invoice', 'Create Invoice', 'Create new invoices', 'lab_receptionist'),
('lab_receptionist.edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'lab_receptionist'),
('lab_receptionist.edit_price_description', 'Edit Price & Description', 'Edit price and description on invoices', 'lab_receptionist'),
('lab_receptionist.enable_discount_entry_in_invoice', 'Enable Discount Entry in Invoice', 'Enable discount entry in invoices', 'lab_receptionist'),
('lab_receptionist.view_completed_reports', 'View Completed Reports', 'View completed laboratory reports', 'lab_receptionist'),
('lab_receptionist.view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'lab_receptionist'),
('lab_receptionist.only_allow_invoice_payment', 'Only Allow Invoice Payment', 'Only allow invoice payment without editing', 'lab_receptionist'),
('lab_receptionist.add_view_share_consumption', 'Add/View Share and Consumption', 'Add and view share and consumption data', 'lab_receptionist'),
('lab_receptionist.edit_leads', 'Edit Leads', 'Edit lead information', 'lab_receptionist')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- ============================================
-- INSERT DEFAULT ROLE PERMISSIONS
-- ============================================

-- Staff Role Default Permissions (All 37 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Staff', 'staff.view_patient_profiles'),
('Staff', 'staff.search_patients'),
('Staff', 'staff.create_invoice'),
('Staff', 'staff.edit_payment_invoice_date'),
('Staff', 'staff.edit_invoices'),
('Staff', 'staff.only_allow_invoice_payment'),
('Staff', 'staff.create_health_records'),
('Staff', 'staff.edit_health_records'),
('Staff', 'staff.send_sms'),
('Staff', 'staff.edit_price_description'),
('Staff', 'staff.delete_token_appointment'),
('Staff', 'staff.show_doctors_share_report'),
('Staff', 'staff.give_discounts'),
('Staff', 'staff.add_appointment'),
('Staff', 'staff.add_patient'),
('Staff', 'staff.edit_patient'),
('Staff', 'staff.edit_treatment_plan'),
('Staff', 'staff.edit_doctor_timings'),
('Staff', 'staff.add_inventory_purchase_requisition'),
('Staff', 'staff.add_inventory_purchase_order'),
('Staff', 'staff.add_expenses'),
('Staff', 'staff.view_invoice_history'),
('Staff', 'staff.disabled_discount_in_invoice'),
('Staff', 'staff.enable_refund_payment'),
('Staff', 'staff.view_opd_referrals_report'),
('Staff', 'staff.view_all_staff_reports'),
('Staff', 'staff.view_opd'),
('Staff', 'staff.view_patient_module'),
('Staff', 'staff.view_health_record'),
('Staff', 'staff.view_lab_tracking'),
('Staff', 'staff.view_reports'),
('Staff', 'staff.view_inventory_purchase_requisition'),
('Staff', 'staff.view_all_expenses'),
('Staff', 'staff.view_shift_wise_revenue_only'),
('Staff', 'staff.add_view_share_consumption'),
('Staff', 'staff.edit_leads'),
('Staff', 'staff.modify_discharge_date_time'),
('Staff', 'staff.view_total_collection_dashboard'),
('Staff', 'staff.restrict_date_filter_7_days'),
('Staff', 'staff.restrict_edit_discount_quantity')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Blood Bank Manager Default Permissions (All 5 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Blood Bank Manager', 'blood_bank_manager.add_donor'),
('Blood Bank Manager', 'blood_bank_manager.edit_donor'),
('Blood Bank Manager', 'blood_bank_manager.add_blood_donation'),
('Blood Bank Manager', 'blood_bank_manager.add_blood_consumption'),
('Blood Bank Manager', 'blood_bank_manager.view_inventory_purchase_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Nurse Role Default Permissions (All 18 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Nurse', 'nurse.assign_beds'),
('Nurse', 'nurse.discharge_patients'),
('Nurse', 'nurse.transfer_patient'),
('Nurse', 'nurse.add_invoice'),
('Nurse', 'nurse.add_edit_beds'),
('Nurse', 'nurse.add_edit_wards'),
('Nurse', 'nurse.view_edit_indoor_invoices'),
('Nurse', 'nurse.view_indoor_health_record'),
('Nurse', 'nurse.view_birth_death_certificates'),
('Nurse', 'nurse.view_dispositions'),
('Nurse', 'nurse.view_indoor_duty_roster'),
('Nurse', 'nurse.add_patient'),
('Nurse', 'nurse.edit_patient'),
('Nurse', 'nurse.delete_admitted_patients'),
('Nurse', 'nurse.view_inventory_purchase_requisition'),
('Nurse', 'nurse.edit_nursing_notes'),
('Nurse', 'nurse.edit_leads'),
('Nurse', 'nurse.modify_discharge_date_time'),
('Nurse', 'nurse.approve_medications')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Inventory Manager Default Permissions (All 17 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Inventory Manager', 'inventory_manager.add_stock'),
('Inventory Manager', 'inventory_manager.edit_stock'),
('Inventory Manager', 'inventory_manager.consume_stock'),
('Inventory Manager', 'inventory_manager.edit_consumption'),
('Inventory Manager', 'inventory_manager.edit_item'),
('Inventory Manager', 'inventory_manager.add_item'),
('Inventory Manager', 'inventory_manager.delete_item'),
('Inventory Manager', 'inventory_manager.make_stock_adjustment'),
('Inventory Manager', 'inventory_manager.view_inventory_reports'),
('Inventory Manager', 'inventory_manager.issue_stock_against_request'),
('Inventory Manager', 'inventory_manager.collect_stock_against_return'),
('Inventory Manager', 'inventory_manager.create_purchase_order'),
('Inventory Manager', 'inventory_manager.gate_pass'),
('Inventory Manager', 'inventory_manager.issue_inward_gate_pass'),
('Inventory Manager', 'inventory_manager.issue_outward_gate_pass'),
('Inventory Manager', 'inventory_manager.receive_items_against_inward'),
('Inventory Manager', 'inventory_manager.send_items_against_outward'),
('Inventory Manager', 'inventory_manager.print_gate_pass'),
('Inventory Manager', 'inventory_manager.create_users'),
('Inventory Manager', 'inventory_manager.edit_users'),
('Inventory Manager', 'inventory_manager.hide_patient_profile')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Laboratory Manager Default Permissions (All 10 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Lab Manager', 'lab_manager.create_laboratory_invoice'),
('Lab Manager', 'lab_manager.edit_lab_reports'),
('Lab Manager', 'lab_manager.edit_lab_templates'),
('Lab Manager', 'lab_manager.delete_lab_templates'),
('Lab Manager', 'lab_manager.view_laboratory_reports'),
('Lab Manager', 'lab_manager.delete_laboratory_reports'),
('Lab Manager', 'lab_manager.edit_outsourced_labs'),
('Lab Manager', 'lab_manager.revert_completed_reports'),
('Lab Manager', 'lab_manager.create_users'),
('Lab Manager', 'lab_manager.edit_users'),
('Lab Manager', 'lab_manager.view_inventory_purchase_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Accountant Role Default Permissions (All 10 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Accountant', 'accountant.edit_invoice'),
('Accountant', 'accountant.refund_payment'),
('Accountant', 'accountant.delete_invoice'),
('Accountant', 'accountant.view_financial_reports'),
('Accountant', 'accountant.edit_expenses'),
('Accountant', 'accountant.view_pharmacy_reports'),
('Accountant', 'accountant.edit_charges_list'),
('Accountant', 'accountant.view_radiology_reports'),
('Accountant', 'accountant.view_laboratory_reports'),
('Accountant', 'accountant.view_ipd_reports'),
('Accountant', 'accountant.view_inventory_reports'),
('Accountant', 'accountant.view_inventory_purchase_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Laboratory Technician Default Permissions (All 16 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Lab Technician', 'lab_technician.create_laboratory_invoice'),
('Lab Technician', 'lab_technician.edit_procedure_rates_on_invoice'),
('Lab Technician', 'lab_technician.create_lab_reports'),
('Lab Technician', 'lab_technician.edit_lab_reports'),
('Lab Technician', 'lab_technician.edit_lab_templates'),
('Lab Technician', 'lab_technician.delete_lab_templates'),
('Lab Technician', 'lab_technician.view_laboratory_reports'),
('Lab Technician', 'lab_technician.delete_laboratory_reports'),
('Lab Technician', 'lab_technician.edit_lab_number'),
('Lab Technician', 'lab_technician.collect_sample'),
('Lab Technician', 'lab_technician.enter_results'),
('Lab Technician', 'lab_technician.validate_tests'),
('Lab Technician', 'lab_technician.lab_tracking'),
('Lab Technician', 'lab_technician.lab_templates'),
('Lab Technician', 'lab_technician.view_completed_reports'),
('Lab Technician', 'lab_technician.view_inventory_purchase_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Radiology Technician Default Permissions (All 12 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Radiology Technician', 'radiology_technician.radiology_procedures'),
('Radiology Technician', 'radiology_technician.create_radiology_procedures'),
('Radiology Technician', 'radiology_technician.edit_radiology_procedures'),
('Radiology Technician', 'radiology_technician.delete_radiology_procedures'),
('Radiology Technician', 'radiology_technician.add_radiology_reports'),
('Radiology Technician', 'radiology_technician.view_radiology_reports'),
('Radiology Technician', 'radiology_technician.enter_results'),
('Radiology Technician', 'radiology_technician.validate_tests'),
('Radiology Technician', 'radiology_technician.view_completed_reports'),
('Radiology Technician', 'radiology_technician.radiology_referrals'),
('Radiology Technician', 'radiology_technician.radiology_invoice'),
('Radiology Technician', 'radiology_technician.view_inventory_purchase_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Radiology Manager Default Permissions (All 9 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Radiology Manager', 'radiology_manager.create_radiology_invoice'),
('Radiology Manager', 'radiology_manager.edit_radiology_report'),
('Radiology Manager', 'radiology_manager.delete_radiology_report'),
('Radiology Manager', 'radiology_manager.edit_radiology_procedure'),
('Radiology Manager', 'radiology_manager.delete_radiology_procedure'),
('Radiology Manager', 'radiology_manager.view_radiology_reports'),
('Radiology Manager', 'radiology_manager.revert_completed_tests'),
('Radiology Manager', 'radiology_manager.create_users'),
('Radiology Manager', 'radiology_manager.edit_users'),
('Radiology Manager', 'radiology_manager.view_inventory_purchase_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Pharmacist Default Permissions (All 16 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Pharmacist', 'pharmacist.add_stock'),
('Pharmacist', 'pharmacist.edit_stock'),
('Pharmacist', 'pharmacist.edit_invoice'),
('Pharmacist', 'pharmacist.edit_item'),
('Pharmacist', 'pharmacist.add_item'),
('Pharmacist', 'pharmacist.delete_item'),
('Pharmacist', 'pharmacist.edit_invoice_retail_price'),
('Pharmacist', 'pharmacist.give_discounts'),
('Pharmacist', 'pharmacist.view_pharmacy_reports'),
('Pharmacist', 'pharmacist.transfer_stock'),
('Pharmacist', 'pharmacist.view_health_record'),
('Pharmacist', 'pharmacist.view_patient_profile'),
('Pharmacist', 'pharmacist.delete_stock'),
('Pharmacist', 'pharmacist.deactivate_items'),
('Pharmacist', 'pharmacist.view_pharmacy_transaction_reports'),
('Pharmacist', 'pharmacist.view_inventory_purchase_requisition'),
('Pharmacist', 'pharmacist.add_patient'),
('Pharmacist', 'pharmacist.invoice_return'),
('Pharmacist', 'pharmacist.open_sale_return')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Lab Receptionist Default Permissions (All 10 permissions)
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('Lab Receptionist', 'lab_receptionist.view_patient_profiles'),
('Lab Receptionist', 'lab_receptionist.search_patients'),
('Lab Receptionist', 'lab_receptionist.create_invoice'),
('Lab Receptionist', 'lab_receptionist.edit_payment_invoice_date'),
('Lab Receptionist', 'lab_receptionist.edit_price_description'),
('Lab Receptionist', 'lab_receptionist.enable_discount_entry_in_invoice'),
('Lab Receptionist', 'lab_receptionist.view_completed_reports'),
('Lab Receptionist', 'lab_receptionist.view_inventory_purchase_requisition'),
('Lab Receptionist', 'lab_receptionist.only_allow_invoice_payment'),
('Lab Receptionist', 'lab_receptionist.add_view_share_consumption'),
('Lab Receptionist', 'lab_receptionist.edit_leads')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

