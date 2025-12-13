-- Migration: Add organization_id to all tenant-specific tables
-- This script adds organization_id column to all tables that need multi-tenant data isolation
-- Run this migration after creating the organizations table

-- ============================================
-- CORE ENTITIES
-- ============================================

-- Users table
-- First add column and index
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`;

-- Add index if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'organization_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = 'idx_organization_id')
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX idx_organization_id ON ', @tablename, '(', @columnname, ')')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key if it doesn't exist (check first)
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
      AND (referenced_table_name = 'organizations')
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD FOREIGN KEY (', @columnname, ') REFERENCES organizations(id) ON DELETE RESTRICT')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Patients table
ALTER TABLE `patients` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Update unique constraint for patient_id to include organization_id
ALTER TABLE `patients` 
  DROP INDEX `unique_patient_id`,
  ADD UNIQUE KEY `unique_patient_id_org` (`patient_id`, `organization_id`);

-- Doctors table
ALTER TABLE `doctors` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Update unique constraint for doctor_id to include organization_id
ALTER TABLE `doctors` 
  DROP INDEX `unique_doctor_id`,
  ADD UNIQUE KEY `unique_doctor_id_org` (`doctor_id`, `organization_id`);

-- Appointments table
ALTER TABLE `appointments` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Patient Medical Records table
ALTER TABLE `patient_medical_records` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- ============================================
-- IPD MODULE TABLES
-- ============================================

-- IPD Wards
ALTER TABLE `ipd_wards` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `ipd_wards` 
  DROP INDEX `unique_ward_name`,
  ADD UNIQUE KEY `unique_ward_name_org` (`name`, `organization_id`);

-- IPD Rooms
ALTER TABLE `ipd_rooms` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Beds
ALTER TABLE `ipd_beds` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Admissions
ALTER TABLE `ipd_admissions` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Billing
ALTER TABLE `ipd_billing` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Vital Signs
ALTER TABLE `ipd_vital_signs` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Treatment Orders
ALTER TABLE `ipd_treatment_orders` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Nursing Notes
ALTER TABLE `ipd_nursing_notes` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Discharge Summaries
ALTER TABLE `ipd_discharge_summaries` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Transfers
ALTER TABLE `ipd_transfers` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Admission Requests
ALTER TABLE `ipd_admission_requests` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Rehabilitation Requests
ALTER TABLE `ipd_rehabilitation_requests` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD Infections (if table exists)
ALTER TABLE `ipd_infections` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- IPD OT Schedules (if table exists)
ALTER TABLE `ipd_ot_schedules` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- ============================================
-- OPD MODULE TABLES
-- ============================================

-- Floors
ALTER TABLE `floors` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `floors` 
  DROP INDEX `unique_floor_building`,
  ADD UNIQUE KEY `unique_floor_building_org` (`floor_number`, `building_name`, `organization_id`);

-- Departments
ALTER TABLE `departments` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `departments` 
  DROP INDEX `unique_department_code`,
  ADD UNIQUE KEY `unique_department_code_org` (`department_code`, `organization_id`);

-- Rooms
ALTER TABLE `rooms` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `rooms` 
  DROP INDEX `unique_room_floor`,
  ADD UNIQUE KEY `unique_room_floor_org` (`room_number`, `floor_id`, `organization_id`);

-- Receptions
ALTER TABLE `receptions` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `receptions` 
  DROP INDEX `unique_reception_code`,
  ADD UNIQUE KEY `unique_reception_code_org` (`reception_code`, `organization_id`);

-- Doctor Room Assignments
ALTER TABLE `doctor_room_assignments` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Doctor Slot Rooms
ALTER TABLE `doctor_slot_rooms` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Tokens
ALTER TABLE `tokens` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- ============================================
-- EMERGENCY MODULE TABLES
-- ============================================

-- Emergency Wards
ALTER TABLE `emergency_wards` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Ward Beds
ALTER TABLE `emergency_ward_beds` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Patient Files
ALTER TABLE `emergency_patient_files` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Vital Signs
ALTER TABLE `emergency_vital_signs` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Intake Output
ALTER TABLE `emergency_intake_output` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Health Physical
ALTER TABLE `emergency_health_physical` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Ambulance
ALTER TABLE `emergency_ambulance` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Transfers
ALTER TABLE `emergency_transfers` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Blood Bank Requests
ALTER TABLE `emergency_blood_bank_requests` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Emergency Duty Roster
ALTER TABLE `emergency_duty_roster` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- ============================================
-- PHARMACY MODULE TABLES
-- ============================================

-- Medicines
ALTER TABLE `medicines` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Medicine Stock
ALTER TABLE `medicine_stock` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Pharmacy Sales
ALTER TABLE `pharmacy_sales` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Pharmacy Sale Items
ALTER TABLE `pharmacy_sale_items` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Sale Payments
ALTER TABLE `sale_payments` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Suppliers
ALTER TABLE `suppliers` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `suppliers` 
  DROP INDEX `unique_supplier_code`,
  ADD UNIQUE KEY `unique_supplier_code_org` (`supplier_code`, `organization_id`);

-- Purchase Orders
ALTER TABLE `purchase_orders` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Stock Movements
ALTER TABLE `stock_movements` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Stock Adjustments
ALTER TABLE `stock_adjustments` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Reorder Levels
ALTER TABLE `reorder_levels` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Barcodes
ALTER TABLE `barcodes` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Refunds
ALTER TABLE `refunds` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- ============================================
-- LABORATORY & RADIOLOGY TABLES
-- ============================================

-- Lab Tests
ALTER TABLE `lab_tests` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Radiology Tests
ALTER TABLE `radiology_tests` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Prescriptions
ALTER TABLE `prescriptions` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Prescription Vitals
ALTER TABLE `prescription_vitals` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Prescription Radiology Tests
ALTER TABLE `prescription_radiology_tests` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Prescription Radiology Investigation
ALTER TABLE `prescription_radiology_investigation` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- ============================================
-- OTHER MODULES
-- ============================================

-- Insurance Organizations
ALTER TABLE `insurance_organizations` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Insurance Pricing
ALTER TABLE `insurance_pricing` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Referral Hospitals
ALTER TABLE `referral_hospitals` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Donation Donors
ALTER TABLE `donation_donors` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

ALTER TABLE `donation_donors` 
  DROP INDEX `unique_donor_id`,
  ADD UNIQUE KEY `unique_donor_id_org` (`donor_id`, `organization_id`);

-- Donation Payments
ALTER TABLE `donation_payments` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Birth Certificates
ALTER TABLE `birth_certificates` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Death Certificates
ALTER TABLE `death_certificates` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Support Tickets (map practice_id to organization_id - keep practice_id for backward compatibility)
ALTER TABLE `support_tickets` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Audit Logs (for filtering by organization)
ALTER TABLE `audit_logs` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- System Settings
ALTER TABLE `system_settings` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- POS Settings
ALTER TABLE `pos_settings` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- GST Rates
ALTER TABLE `gst_rates` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Shifts
ALTER TABLE `shifts` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Message Templates
ALTER TABLE `message_templates` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Message Platforms
ALTER TABLE `message_platforms` 
  ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`,
  ADD INDEX `idx_organization_id` (`organization_id`),
  ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT;

-- Note: user_priority_modules and user_permissions don't need organization_id 
-- as they are linked via user_id which already has organization_id

