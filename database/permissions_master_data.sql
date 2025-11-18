-- Permissions Master Data
-- This file populates the permission_definitions and role_permissions tables

-- ============================================
-- INSERT PERMISSION DEFINITIONS
-- ============================================

-- Doctor Role Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('doctor.emergency_consultant', 'Emergency Consultant', 'Access to emergency consultation features', 'doctor'),
('doctor.view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'doctor'),
('doctor.edit_invoices', 'Edit Invoices', 'Edit invoice details', 'doctor'),
('doctor.view_all_patients', 'View All Patient', 'View all patients in the system', 'doctor'),
('doctor.view_patients_report', 'View Patients Report', 'View patient reports', 'doctor'),
('doctor.search_view_patients', 'Search and view patients', 'Search and view patient records', 'doctor'),
('doctor.create_health_records', 'Create Health Records', 'Create new health records', 'doctor'),
('doctor.add_appointment', 'Add Appointment', 'Add new appointments', 'doctor'),
('doctor.create_invoice', 'Create Invoice', 'Create new invoices', 'doctor'),
('doctor.edit_health_records', 'Edit Health Records', 'Edit existing health records', 'doctor'),
('doctor.delete_token_appointment', 'Delete Token/Appointment', 'Delete tokens and appointments', 'doctor'),
('doctor.edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'doctor'),
('doctor.delete_patient', 'Delete Patient', 'Delete patient records', 'doctor')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`);

-- Admin Role Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('admin.create_users', 'Create Users', 'Create new user accounts', 'admin'),
('admin.view_financial_reports', 'View Financial Reports', 'View financial reports and analytics', 'admin'),
('admin.edit_leads', 'Edit Leads', 'Edit lead information', 'admin'),
('admin.edit_users', 'Edit Users', 'Edit user accounts', 'admin'),
('admin.view_other_reports', 'View Other Reports', 'View various system reports', 'admin'),
('admin.delete_users', 'Delete Users', 'Delete user accounts', 'admin'),
('admin.delete_patient', 'Delete Patient', 'Delete patient records', 'admin'),
('admin.edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'admin'),
('admin.edit_expenses', 'Edit Expenses', 'Edit expense records', 'admin')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`);

-- Laboratory Manager Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('lab_manager.create_lab_invoice', 'Create Laboratory Invoice', 'Create laboratory invoices', 'lab_manager'),
('lab_manager.view_lab_reports', 'View Laboratory Reports', 'View laboratory test reports', 'lab_manager'),
('lab_manager.create_users', 'Create Users', 'Create new user accounts', 'lab_manager'),
('lab_manager.edit_lab_reports', 'Edit Lab Reports', 'Edit laboratory test reports', 'lab_manager'),
('lab_manager.delete_lab_reports', 'Delete Laboratory Reports', 'Delete laboratory reports', 'lab_manager'),
('lab_manager.edit_users', 'Edit Users', 'Edit user accounts', 'lab_manager'),
('lab_manager.edit_lab_templates', 'Edit Lab Templates', 'Edit laboratory test templates', 'lab_manager'),
('lab_manager.edit_outsourced_labs', 'Edit outsourced labs in templates', 'Edit outsourced laboratory information', 'lab_manager'),
('lab_manager.view_inventory_requisition', 'View Inventory Purchase requisition', 'View inventory purchase requisitions', 'lab_manager'),
('lab_manager.delete_lab_templates', 'Delete Lab Templates', 'Delete laboratory test templates', 'lab_manager'),
('lab_manager.revert_completed_reports', 'Revert Completed Reports', 'Revert completed laboratory reports', 'lab_manager')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`);

-- Laboratory Technician Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('lab_technician.create_lab_invoice', 'Create Laboratory Invoice', 'Create laboratory invoices', 'lab_technician'),
('lab_technician.edit_lab_templates', 'Edit Lab Templates', 'Edit laboratory test templates', 'lab_technician'),
('lab_technician.edit_lab_number', 'Edit Lab#', 'Edit laboratory test numbers', 'lab_technician'),
('lab_technician.validate_tests', 'Validate Tests', 'Validate laboratory tests', 'lab_technician'),
('lab_technician.edit_procedure_rates', 'Edit Procedure Rates on Invoice', 'Edit procedure rates on invoices', 'lab_technician'),
('lab_technician.delete_lab_templates', 'Delete Lab Templates', 'Delete laboratory test templates', 'lab_technician'),
('lab_technician.collect_sample', 'Collect Sample', 'Collect patient samples', 'lab_technician'),
('lab_technician.lab_tracking', 'Lab Tracking', 'Track laboratory samples', 'lab_technician'),
('lab_technician.create_lab_reports', 'Create Lab Reports', 'Create laboratory test reports', 'lab_technician'),
('lab_technician.view_lab_reports', 'View Laboratory Reports', 'View laboratory test reports', 'lab_technician'),
('lab_technician.enter_results', 'Enter Results', 'Enter test results', 'lab_technician'),
('lab_technician.lab_templates', 'Lab Templates', 'Access laboratory templates', 'lab_technician'),
('lab_technician.edit_lab_reports', 'Edit Lab Reports', 'Edit laboratory test reports', 'lab_technician'),
('lab_technician.delete_lab_reports', 'Delete Lab Reports', 'Delete laboratory reports', 'lab_technician'),
('lab_technician.view_completed_reports', 'View Completed Reports', 'View completed laboratory reports', 'lab_technician'),
('lab_technician.view_inventory_requisition', 'View Inventory Purchase requisition', 'View inventory purchase requisitions', 'lab_technician')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`);

-- Radiology Technician Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('radiology_technician.radiology_procedures', 'Radiology Procedures', 'Access radiology procedures', 'radiology_technician'),
('radiology_technician.add_radiology_reports', 'Add Radiology Reports', 'Add new radiology reports', 'radiology_technician'),
('radiology_technician.view_completed_reports', 'View Completed Reports', 'View completed radiology reports', 'radiology_technician'),
('radiology_technician.create_radiology_procedures', 'Create Radiology Procedures', 'Create new radiology procedures', 'radiology_technician'),
('radiology_technician.view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'radiology_technician'),
('radiology_technician.radiology_referrals', 'Radiology Referrals', 'Manage radiology referrals', 'radiology_technician'),
('radiology_technician.edit_radiology_procedures', 'Edit Radiology Procedures', 'Edit radiology procedures', 'radiology_technician'),
('radiology_technician.enter_results', 'Enter Results', 'Enter radiology test results', 'radiology_technician'),
('radiology_technician.radiology_invoice', 'Radiology Invoice', 'Create radiology invoices', 'radiology_technician'),
('radiology_technician.delete_radiology_procedures', 'Delete Radiology Procedures', 'Delete radiology procedures', 'radiology_technician'),
('radiology_technician.validate_tests', 'Validate Tests', 'Validate radiology tests', 'radiology_technician'),
('radiology_technician.view_inventory_requisition', 'View Inventory Purchase requisition', 'View inventory purchase requisitions', 'radiology_technician')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`);

-- Radiology Manager Permissions
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
('radiology_manager.create_radiology_invoice', 'Create Radiology Invoice', 'Create radiology invoices', 'radiology_manager'),
('radiology_manager.edit_radiology_procedure', 'Edit Radiology Procedure', 'Edit radiology procedures', 'radiology_manager'),
('radiology_manager.delete_radiology_procedure', 'Delete Radiology Procedure', 'Delete radiology procedures', 'radiology_manager'),
('radiology_manager.edit_users', 'Edit Users', 'Edit user accounts', 'radiology_manager'),
('radiology_manager.edit_radiology_report', 'Edit Radiology Report', 'Edit radiology reports', 'radiology_manager'),
('radiology_manager.view_radiology_reports', 'View Radiology Reports', 'View radiology reports', 'radiology_manager'),
('radiology_manager.view_inventory_requisition', 'View Inventory Purchase requisition', 'View inventory purchase requisitions', 'radiology_manager'),
('radiology_manager.delete_radiology_report', 'Delete Radiology Report', 'Delete radiology reports', 'radiology_manager'),
('radiology_manager.revert_completed_tests', 'Revert Completed Tests', 'Revert completed radiology tests', 'radiology_manager'),
('radiology_manager.create_users', 'Create Users', 'Create new user accounts', 'radiology_manager')
ON DUPLICATE KEY UPDATE `permission_name` = VALUES(`permission_name`);

-- ============================================
-- INSERT DEFAULT ROLE PERMISSIONS
-- ============================================

-- Doctor Role Default Permissions
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('doctor', 'doctor.view_patient_profiles'),
('doctor', 'doctor.edit_invoices'),
('doctor', 'doctor.view_all_patients'),
('doctor', 'doctor.view_patients_report'),
('doctor', 'doctor.search_view_patients'),
('doctor', 'doctor.create_health_records'),
('doctor', 'doctor.add_appointment'),
('doctor', 'doctor.create_invoice'),
('doctor', 'doctor.edit_health_records'),
('doctor', 'doctor.delete_token_appointment'),
('doctor', 'doctor.edit_payment_invoice_date'),
('doctor', 'doctor.delete_patient')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Admin Role Default Permissions
-- Note: Edit Leads is not selected by default per image
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('admin', 'admin.create_users'),
('admin', 'admin.view_financial_reports'),
('admin', 'admin.edit_users'),
('admin', 'admin.view_other_reports'),
('admin', 'admin.delete_users'),
('admin', 'admin.delete_patient'),
('admin', 'admin.edit_payment_invoice_date'),
('admin', 'admin.edit_expenses')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Laboratory Manager Default Permissions
-- Note: Create Users, Delete Laboratory Reports, Edit Users, Revert Completed Reports are not selected by default per image
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('lab_manager', 'lab_manager.create_lab_invoice'),
('lab_manager', 'lab_manager.view_lab_reports'),
('lab_manager', 'lab_manager.edit_lab_reports'),
('lab_manager', 'lab_manager.edit_lab_templates'),
('lab_manager', 'lab_manager.edit_outsourced_labs'),
('lab_manager', 'lab_manager.view_inventory_requisition'),
('lab_manager', 'lab_manager.delete_lab_templates')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Laboratory Technician Default Permissions
-- Note: Edit Lab Reports and Delete Lab Reports are not selected by default per image
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('lab_technician', 'lab_technician.create_lab_invoice'),
('lab_technician', 'lab_technician.edit_lab_templates'),
('lab_technician', 'lab_technician.edit_lab_number'),
('lab_technician', 'lab_technician.validate_tests'),
('lab_technician', 'lab_technician.edit_procedure_rates'),
('lab_technician', 'lab_technician.delete_lab_templates'),
('lab_technician', 'lab_technician.collect_sample'),
('lab_technician', 'lab_technician.lab_tracking'),
('lab_technician', 'lab_technician.create_lab_reports'),
('lab_technician', 'lab_technician.view_lab_reports'),
('lab_technician', 'lab_technician.enter_results'),
('lab_technician', 'lab_technician.lab_templates'),
('lab_technician', 'lab_technician.view_completed_reports'),
('lab_technician', 'lab_technician.view_inventory_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Radiology Technician Default Permissions
-- Note: Delete Radiology Procedures is not selected by default per image
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('radiology_technician', 'radiology_technician.radiology_procedures'),
('radiology_technician', 'radiology_technician.add_radiology_reports'),
('radiology_technician', 'radiology_technician.view_completed_reports'),
('radiology_technician', 'radiology_technician.create_radiology_procedures'),
('radiology_technician', 'radiology_technician.view_radiology_reports'),
('radiology_technician', 'radiology_technician.radiology_referrals'),
('radiology_technician', 'radiology_technician.edit_radiology_procedures'),
('radiology_technician', 'radiology_technician.enter_results'),
('radiology_technician', 'radiology_technician.radiology_invoice'),
('radiology_technician', 'radiology_technician.validate_tests'),
('radiology_technician', 'radiology_technician.view_inventory_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Radiology Manager Default Permissions
-- Note: Create Radiology Invoice, Delete Radiology Report, Revert Completed Tests, Edit Radiology Procedure, Create Users are not selected by default per image
INSERT INTO `role_permissions` (`role`, `permission_key`) VALUES
('radiology_manager', 'radiology_manager.edit_radiology_procedure'),
('radiology_manager', 'radiology_manager.delete_radiology_procedure'),
('radiology_manager', 'radiology_manager.edit_users'),
('radiology_manager', 'radiology_manager.edit_radiology_report'),
('radiology_manager', 'radiology_manager.view_radiology_reports'),
('radiology_manager', 'radiology_manager.view_inventory_requisition')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

