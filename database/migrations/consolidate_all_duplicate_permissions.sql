-- Migration: Consolidate ALL Duplicate Permissions
-- This script consolidates all role-prefixed permissions into single permissions
-- Following the pattern from permissions_normalized.sql

-- ============================================
-- STEP 1: Create consolidated permissions if they don't exist
-- ============================================
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`)
VALUES 
-- Patient Management
('view_patient_profiles', 'View Patient Profiles', 'View patient profile information', 'patient'),
('view_all_patients', 'View All Patients', 'View all patients in the system', 'patient'),
('search_patients', 'Search Patients', 'Search for patients in the system', 'patient'),
('search_view_patients', 'Search and View Patients', 'Search and view patient records', 'patient'),
('add_patient', 'Add Patient', 'Add new patients to the system', 'patient'),
('edit_patient', 'Edit Patient', 'Edit patient information', 'patient'),
('delete_patient', 'Delete Patient', 'Delete patient records', 'patient'),

-- Invoice Management
('create_invoice', 'Create Invoice', 'Create new invoices', 'invoice'),
('edit_invoice', 'Edit Invoice', 'Edit invoice details', 'invoice'),
('edit_payment_invoice_date', 'Edit Payment/Invoice Date', 'Edit payment and invoice dates', 'invoice'),

-- Health Records
('create_health_records', 'Create Health Records', 'Create new health records', 'health_record'),
('edit_health_records', 'Edit Health Records', 'Edit existing health records', 'health_record'),
('view_health_record', 'View Health Record', 'View patient health records', 'health_record'),

-- Appointments (already consolidated, but ensuring they exist)
('add_appointment', 'Add Appointment', 'Add new appointments', 'appointment'),
('delete_token_appointment', 'Delete Token or Appointment', 'Delete tokens and appointments', 'appointment'),
('edit_doctor_timings', 'Edit Doctor Timings', 'Edit doctor schedule and timings', 'appointment'),

-- Treatment & Plans
('edit_treatment_plan', 'Edit Treatment Plan', 'Edit patient treatment plans', 'treatment'),

-- Communication
('send_sms', 'Send SMS', 'Send SMS notifications to patients', 'communication'),

-- Reports
('view_reports', 'View Reports', 'View various system reports', 'reports'),
('view_patients_report', 'View Patients Report', 'View patient reports', 'reports'),

-- Modules Access
('view_opd', 'View OPD', 'View OPD module', 'modules'),
('view_patient_module', 'View Patient Module', 'View patient management module', 'modules'),

-- Inventory
('view_inventory_purchase_requisition', 'View Inventory Purchase Requisition', 'View inventory purchase requisitions', 'inventory'),

-- Leads
('edit_leads', 'Edit Leads', 'Edit lead information', 'leads'),

-- Discharge
('modify_discharge_date_time', 'Modify Discharge Date/Time', 'Modify patient discharge date and time', 'discharge'),

-- Emergency
('emergency_consultant', 'Emergency Consultant', 'Access to emergency consultation features', 'emergency')

ON DUPLICATE KEY UPDATE 
    `permission_name` = VALUES(`permission_name`),
    `description` = VALUES(`description`),
    `category` = VALUES(`category`);

-- ============================================
-- STEP 2: Get permission IDs for consolidated permissions
-- ============================================
SET @view_patient_profiles_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_patient_profiles');
SET @view_all_patients_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_all_patients');
SET @search_patients_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'search_patients');
SET @search_view_patients_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'search_view_patients');
SET @add_patient_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'add_patient');
SET @edit_patient_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_patient');
SET @delete_patient_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'delete_patient');
SET @create_invoice_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'create_invoice');
SET @edit_invoice_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_invoice');
SET @edit_payment_invoice_date_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_payment_invoice_date');
SET @create_health_records_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'create_health_records');
SET @edit_health_records_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_health_records');
SET @view_health_record_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_health_record');
SET @add_appointment_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'add_appointment');
SET @delete_token_appointment_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'delete_token_appointment');
SET @edit_doctor_timings_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_doctor_timings');
SET @edit_treatment_plan_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_treatment_plan');
SET @send_sms_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'send_sms');
SET @view_reports_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_reports');
SET @view_patients_report_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_patients_report');
SET @view_opd_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_opd');
SET @view_patient_module_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_patient_module');
SET @view_inventory_purchase_requisition_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'view_inventory_purchase_requisition');
SET @edit_leads_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'edit_leads');
SET @modify_discharge_date_time_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'modify_discharge_date_time');
SET @emergency_consultant_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'emergency_consultant');

-- ============================================
-- STEP 3: Migrate role permissions - Patient Management
-- ============================================

-- view_patient_profiles: doctor.view_patient_profiles + staff.view_patient_profiles -> view_patient_profiles
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_patient_profiles_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.view_patient_profiles', 'staff.view_patient_profiles')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_patient_profiles'
  );

-- view_all_patients: doctor.view_all_patients -> view_all_patients
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_all_patients_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'doctor.view_all_patients'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_all_patients'
  );

-- search_patients: staff.search_patients -> search_patients
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @search_patients_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.search_patients'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'search_patients'
  );

-- search_view_patients: doctor.search_view_patients -> search_view_patients
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @search_view_patients_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'doctor.search_view_patients'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'search_view_patients'
  );

-- add_patient: staff.add_patient + nurse.add_patient -> add_patient
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @add_patient_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('staff.add_patient', 'nurse.add_patient')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'add_patient'
  );

-- edit_patient: staff.edit_patient + nurse.edit_patient -> edit_patient
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_patient_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('staff.edit_patient', 'nurse.edit_patient')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_patient'
  );

-- delete_patient: doctor.delete_patient + admin.delete_patient -> delete_patient
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @delete_patient_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.delete_patient', 'admin.delete_patient')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'delete_patient'
  );

-- ============================================
-- STEP 4: Migrate role permissions - Invoice Management
-- ============================================

-- create_invoice: doctor.create_invoice + staff.create_invoice + nurse.add_invoice -> create_invoice
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @create_invoice_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.create_invoice', 'staff.create_invoice', 'nurse.add_invoice')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'create_invoice'
  );

-- edit_invoice: doctor.edit_invoices + staff.edit_invoices + accountant.edit_invoice -> edit_invoice
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_invoice_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.edit_invoices', 'staff.edit_invoices', 'accountant.edit_invoice')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_invoice'
  );

-- edit_payment_invoice_date: doctor.edit_payment_invoice_date + staff.edit_payment_invoice_date + admin.edit_payment_invoice_date -> edit_payment_invoice_date
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_payment_invoice_date_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.edit_payment_invoice_date', 'staff.edit_payment_invoice_date', 'admin.edit_payment_invoice_date')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_payment_invoice_date'
  );

-- ============================================
-- STEP 5: Migrate role permissions - Health Records
-- ============================================

-- create_health_records: doctor.create_health_records + staff.create_health_records -> create_health_records
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @create_health_records_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.create_health_records', 'staff.create_health_records')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'create_health_records'
  );

-- edit_health_records: doctor.edit_health_records + staff.edit_health_records -> edit_health_records
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_health_records_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.edit_health_records', 'staff.edit_health_records')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_health_records'
  );

-- view_health_record: staff.view_health_record -> view_health_record
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_health_record_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.view_health_record'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_health_record'
  );

-- ============================================
-- STEP 6: Migrate role permissions - Appointments (already done, but ensuring)
-- ============================================

-- add_appointment: doctor.add_appointment + staff.add_appointment -> add_appointment
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @add_appointment_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.add_appointment', 'staff.add_appointment')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'add_appointment'
  );

-- delete_token_appointment: doctor.delete_token_appointment + staff.delete_token_appointment -> delete_token_appointment
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @delete_token_appointment_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('doctor.delete_token_appointment', 'staff.delete_token_appointment')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'delete_token_appointment'
  );

-- edit_doctor_timings: staff.edit_doctor_timings -> edit_doctor_timings
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_doctor_timings_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.edit_doctor_timings'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_doctor_timings'
  );

-- ============================================
-- STEP 7: Migrate role permissions - Other
-- ============================================

-- edit_treatment_plan: staff.edit_treatment_plan -> edit_treatment_plan
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_treatment_plan_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.edit_treatment_plan'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_treatment_plan'
  );

-- send_sms: staff.send_sms -> send_sms
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @send_sms_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.send_sms'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'send_sms'
  );

-- view_reports: staff.view_reports -> view_reports
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_reports_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.view_reports'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_reports'
  );

-- view_patients_report: doctor.view_patients_report -> view_patients_report
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_patients_report_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'doctor.view_patients_report'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_patients_report'
  );

-- view_opd: staff.view_opd -> view_opd
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_opd_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.view_opd'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_opd'
  );

-- view_patient_module: staff.view_patient_module -> view_patient_module
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_patient_module_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'staff.view_patient_module'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_patient_module'
  );

-- view_inventory_purchase_requisition: Multiple roles -> view_inventory_purchase_requisition
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @view_inventory_purchase_requisition_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key LIKE '%view_inventory_purchase_requisition%' 
   OR pd.permission_key LIKE '%view_inventory_requisition%'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'view_inventory_purchase_requisition'
  );

-- edit_leads: staff.edit_leads + admin.edit_leads + nurse.edit_leads -> edit_leads
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @edit_leads_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('staff.edit_leads', 'admin.edit_leads', 'nurse.edit_leads')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'edit_leads'
  );

-- modify_discharge_date_time: staff.modify_discharge_date_time + nurse.modify_discharge_date_time -> modify_discharge_date_time
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @modify_discharge_date_time_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key IN ('staff.modify_discharge_date_time', 'nurse.modify_discharge_date_time')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'modify_discharge_date_time'
  );

-- emergency_consultant: doctor.emergency_consultant -> emergency_consultant
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT rp.role, @emergency_consultant_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE pd.permission_key = 'doctor.emergency_consultant'
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = rp.role AND pd2.permission_key = 'emergency_consultant'
  );

-- ============================================
-- STEP 8: Migrate user custom permissions
-- ============================================

-- Update user custom permissions to use consolidated permission keys
-- This is a simplified version - you may need to handle each permission individually

UPDATE `user_custom_permissions` ucp
JOIN `permission_definitions` pd_old ON ucp.permission_id = pd_old.id
JOIN `permission_definitions` pd_new ON pd_new.permission_key = CASE
  WHEN pd_old.permission_key IN ('doctor.view_patient_profiles', 'staff.view_patient_profiles') THEN 'view_patient_profiles'
  WHEN pd_old.permission_key = 'doctor.view_all_patients' THEN 'view_all_patients'
  WHEN pd_old.permission_key = 'staff.search_patients' THEN 'search_patients'
  WHEN pd_old.permission_key = 'doctor.search_view_patients' THEN 'search_view_patients'
  WHEN pd_old.permission_key IN ('staff.add_patient', 'nurse.add_patient') THEN 'add_patient'
  WHEN pd_old.permission_key IN ('staff.edit_patient', 'nurse.edit_patient') THEN 'edit_patient'
  WHEN pd_old.permission_key IN ('doctor.delete_patient', 'admin.delete_patient') THEN 'delete_patient'
  WHEN pd_old.permission_key IN ('doctor.create_invoice', 'staff.create_invoice', 'nurse.add_invoice') THEN 'create_invoice'
  WHEN pd_old.permission_key IN ('doctor.edit_invoices', 'staff.edit_invoices', 'accountant.edit_invoice') THEN 'edit_invoice'
  WHEN pd_old.permission_key IN ('doctor.edit_payment_invoice_date', 'staff.edit_payment_invoice_date', 'admin.edit_payment_invoice_date') THEN 'edit_payment_invoice_date'
  WHEN pd_old.permission_key IN ('doctor.create_health_records', 'staff.create_health_records') THEN 'create_health_records'
  WHEN pd_old.permission_key IN ('doctor.edit_health_records', 'staff.edit_health_records') THEN 'edit_health_records'
  WHEN pd_old.permission_key = 'staff.view_health_record' THEN 'view_health_record'
  WHEN pd_old.permission_key IN ('doctor.add_appointment', 'staff.add_appointment') THEN 'add_appointment'
  WHEN pd_old.permission_key IN ('doctor.delete_token_appointment', 'staff.delete_token_appointment') THEN 'delete_token_appointment'
  WHEN pd_old.permission_key = 'staff.edit_doctor_timings' THEN 'edit_doctor_timings'
  WHEN pd_old.permission_key = 'staff.edit_treatment_plan' THEN 'edit_treatment_plan'
  WHEN pd_old.permission_key = 'staff.send_sms' THEN 'send_sms'
  WHEN pd_old.permission_key = 'staff.view_reports' THEN 'view_reports'
  WHEN pd_old.permission_key = 'doctor.view_patients_report' THEN 'view_patients_report'
  WHEN pd_old.permission_key = 'staff.view_opd' THEN 'view_opd'
  WHEN pd_old.permission_key = 'staff.view_patient_module' THEN 'view_patient_module'
  WHEN pd_old.permission_key LIKE '%view_inventory_purchase_requisition%' OR pd_old.permission_key LIKE '%view_inventory_requisition%' THEN 'view_inventory_purchase_requisition'
  WHEN pd_old.permission_key IN ('staff.edit_leads', 'admin.edit_leads', 'nurse.edit_leads') THEN 'edit_leads'
  WHEN pd_old.permission_key IN ('staff.modify_discharge_date_time', 'nurse.modify_discharge_date_time') THEN 'modify_discharge_date_time'
  WHEN pd_old.permission_key = 'doctor.emergency_consultant' THEN 'emergency_consultant'
  ELSE NULL
END
SET ucp.permission_id = pd_new.id
WHERE pd_new.id IS NOT NULL
  AND ucp.status = 'granted'
  AND NOT EXISTS (
    SELECT 1 FROM `user_custom_permissions` ucp2 
    WHERE ucp2.user_id = ucp.user_id 
      AND ucp2.permission_id = pd_new.id
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migration:
-- SELECT `permission_key`, COUNT(*) as role_count FROM `role_permissions` rp JOIN `permission_definitions` pd ON rp.permission_id = pd.id WHERE pd.permission_key IN ('view_patient_profiles', 'add_patient', 'edit_patient', 'delete_patient', 'create_invoice', 'edit_invoice', 'add_appointment', 'delete_token_appointment') GROUP BY `permission_key`;
-- SELECT COUNT(*) as old_permissions_count FROM `role_permissions` rp JOIN `permission_definitions` pd ON rp.permission_id = pd.id WHERE pd.permission_key LIKE 'doctor.%' OR pd.permission_key LIKE 'staff.%' OR pd.permission_key LIKE 'admin.%' OR pd.permission_key LIKE 'nurse.%';

