-- ============================================
-- SURGERY MANAGEMENT MODULE - COMPLETE MIGRATION
-- Run this script to create all required tables for OT Surgery Management
-- ============================================

-- ============================================
-- 1. OPERATION THEATRES MASTER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `operation_theatres` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'OT 1, OT 2, etc.',
  `ot_name` VARCHAR(255) DEFAULT NULL COMMENT 'OT 1 (General Surgery)',
  `specialty` VARCHAR(100) DEFAULT NULL COMMENT 'General Surgery, Orthopedics, Cardiothoracic, Neurosurgery, ENT, Obstetrics',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Building, Floor, Room number',
  `capacity` INT(11) DEFAULT 1 COMMENT 'Number of simultaneous surgeries (usually 1)',
  `hourly_rate` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'OT charge per hour',
  `minimum_charge_hours` DECIMAL(3, 1) DEFAULT 2.0 COMMENT 'Minimum chargeable hours',
  `equipment` JSON DEFAULT NULL COMMENT 'Available equipment list',
  `status` ENUM('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ot_number` (`ot_number`),
  INDEX `idx_specialty` (`specialty`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default OT data
INSERT INTO `operation_theatres` (`ot_number`, `ot_name`, `specialty`, `hourly_rate`, `minimum_charge_hours`, `status`) VALUES
('OT 1', 'OT 1 (General Surgery)', 'General Surgery', 5000.00, 2.0, 'active'),
('OT 2', 'OT 2 (Orthopedics)', 'Orthopedics', 5000.00, 2.0, 'active'),
('OT 3', 'OT 3 (Cardiothoracic)', 'Cardiothoracic', 8000.00, 3.0, 'active'),
('OT 4', 'OT 4 (Neurosurgery)', 'Neurosurgery', 8000.00, 3.0, 'active'),
('OT 5', 'OT 5 (ENT & Ophthalmology)', 'ENT', 4000.00, 1.5, 'active'),
('OT 6', 'OT 6 (Obstetrics & Gynecology)', 'Obstetrics', 5000.00, 2.0, 'active')
ON DUPLICATE KEY UPDATE `ot_name` = VALUES(`ot_name`);

-- ============================================
-- 2. IPD OT SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_ot_schedules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `procedure_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_procedures.id',
  `ot_number` VARCHAR(50) NOT NULL COMMENT 'OT number/name (e.g., OT 1, OT 2)',
  `scheduled_date` DATE NOT NULL,
  `scheduled_time` TIME NOT NULL,
  `procedure_name` VARCHAR(255) NOT NULL,
  `procedure_type` VARCHAR(100) DEFAULT NULL,
  `surgeon_user_id` INT(11) DEFAULT NULL COMMENT 'Primary surgeon',
  `surgeon_name` VARCHAR(255) DEFAULT NULL,
  `assistant_surgeon_user_id` INT(11) DEFAULT NULL,
  `assistant_surgeon_name` VARCHAR(255) DEFAULT NULL,
  `anesthetist_user_id` INT(11) DEFAULT NULL,
  `anesthetist_name` VARCHAR(255) DEFAULT NULL,
  `anesthesia_type` VARCHAR(100) DEFAULT NULL COMMENT 'General, Spinal, Epidural, Local, Regional',
  `estimated_duration_minutes` INT(4) DEFAULT NULL,
  `actual_duration_minutes` INT(4) DEFAULT NULL,
  `status` ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed') NOT NULL DEFAULT 'Scheduled',
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `complications` TEXT DEFAULT NULL,
  `asa_score` INT(1) DEFAULT NULL COMMENT 'ASA physical status classification (1-5)',
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_procedure_id` (`procedure_id`),
  INDEX `idx_ot_number` (`ot_number`),
  INDEX `idx_scheduled_date` (`scheduled_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_surgeon_user_id` (`surgeon_user_id`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. IPD PRE-OPERATIVE CHECKLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_pre_op_checklist` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `admission_id` INT(11) NOT NULL,
  `patient_id` INT(11) NOT NULL,
  
  -- Patient Preparation
  `npo_status` BOOLEAN DEFAULT FALSE COMMENT 'Nothing Per Oral',
  `pre_op_medications_given` BOOLEAN DEFAULT FALSE,
  `blood_work_completed` BOOLEAN DEFAULT FALSE,
  `imaging_completed` BOOLEAN DEFAULT FALSE,
  `consent_signed` BOOLEAN DEFAULT FALSE,
  `patient_identified` BOOLEAN DEFAULT FALSE,
  
  -- Equipment Preparation
  `instruments_ready` BOOLEAN DEFAULT FALSE,
  `consumables_available` BOOLEAN DEFAULT FALSE,
  `equipment_tested` BOOLEAN DEFAULT FALSE,
  `implants_available` BOOLEAN DEFAULT FALSE,
  
  -- Team Preparation
  `team_briefed` BOOLEAN DEFAULT FALSE,
  `anesthesia_ready` BOOLEAN DEFAULT FALSE,
  
  -- Status
  `checklist_completed` BOOLEAN DEFAULT FALSE,
  `completed_by_user_id` INT(11) DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. IPD SURGERY CHARGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_surgery_charges` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_ot_schedules.id',
  `procedure_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_procedures.id',
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `billing_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_billing.id',
  
  -- Surgeon Fees
  `surgeon_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `assistant_surgeon_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `surgeon_share_percentage` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Surgeon share % if applicable',
  `surgeon_share_amount` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- OT Charges
  `ot_room_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_equipment_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_duration_hours` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Actual OT usage in hours',
  `ot_rate_per_hour` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_minimum_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_overtime_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Anesthesia Charges
  `anesthetist_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `anesthesia_type_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `anesthesia_duration_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Consumables
  `consumables_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `implants_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `consumables_details` JSON DEFAULT NULL COMMENT 'Breakdown of consumables used',
  
  -- Procedure Charges
  `procedure_base_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `procedure_complexity_multiplier` DECIMAL(3, 2) DEFAULT 1.00,
  `procedure_final_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Totals
  `subtotal` DECIMAL(10, 2) DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `tax` DECIMAL(10, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Payment Status
  `advance_paid` DECIMAL(10, 2) DEFAULT 0.00,
  `paid_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `due_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `payment_status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_procedure_id` (`procedure_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_billing_id` (`billing_id`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. IPD SURGERY CONSUMABLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_surgery_consumables` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `surgery_charges_id` INT(11) DEFAULT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_type` ENUM('instrument', 'disposable', 'implant', 'equipment', 'other') NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL COMMENT 'For implants',
  `batch_number` VARCHAR(100) DEFAULT NULL COMMENT 'For consumables',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_surgery_charges_id` (`surgery_charges_id`),
  FOREIGN KEY (`ot_schedule_id`) REFERENCES `ipd_ot_schedules`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`surgery_charges_id`) REFERENCES `ipd_surgery_charges`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
-- 1. operation_theatres
-- 2. ipd_ot_schedules
-- 3. ipd_pre_op_checklist
-- 4. ipd_surgery_charges
-- 5. ipd_surgery_consumables
-- ============================================

