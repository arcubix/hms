-- Emergency Department Workflow System Database Schema
-- This schema extends emergency_visits with complete workflow tracking

-- ============================================
-- EMERGENCY VITAL SIGNS TABLE
-- Tracks vital signs over time during ER visit
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_vital_signs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `recorded_by` INT(11) DEFAULT NULL COMMENT 'User ID who recorded (nurse/doctor)',
  `bp` VARCHAR(20) DEFAULT NULL COMMENT 'Blood Pressure (e.g., 120/80)',
  `pulse` INT(3) DEFAULT NULL COMMENT 'Pulse rate (bpm)',
  `temp` DECIMAL(4,1) DEFAULT NULL COMMENT 'Temperature (°F)',
  `spo2` INT(3) DEFAULT NULL COMMENT 'SpO2 (%)',
  `resp` INT(3) DEFAULT NULL COMMENT 'Respiratory Rate',
  `pain_score` INT(2) DEFAULT NULL COMMENT 'Pain score 0-10',
  `consciousness_level` ENUM('Alert', 'Drowsy', 'Confused', 'Unconscious') DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_recorded_at` (`recorded_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY TREATMENT NOTES TABLE
-- Treatment observations, progress notes, and procedures
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_treatment_notes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `note_type` ENUM('observation', 'progress', 'procedure', 'nursing', 'doctor') NOT NULL DEFAULT 'observation',
  `note_text` TEXT NOT NULL,
  `recorded_by` INT(11) DEFAULT NULL COMMENT 'User ID who recorded',
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `attachments` JSON DEFAULT NULL COMMENT 'Array of file paths/URLs',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_note_type` (`note_type`),
  INDEX `idx_recorded_at` (`recorded_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY INVESTIGATION ORDERS TABLE
-- Lab tests, radiology, and other investigations
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_investigation_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `investigation_type` ENUM('lab', 'radiology', 'other') NOT NULL DEFAULT 'lab',
  `test_name` VARCHAR(255) NOT NULL,
  `test_code` VARCHAR(50) DEFAULT NULL COMMENT 'Reference to lab_tests.test_code if applicable',
  `lab_test_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_tests.id if exists',
  `priority` ENUM('normal', 'urgent', 'stat') NOT NULL DEFAULT 'normal',
  `ordered_by` INT(11) DEFAULT NULL COMMENT 'Doctor ID who ordered',
  `ordered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('ordered', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'ordered',
  `result_id` INT(11) DEFAULT NULL COMMENT 'Link to lab results when available',
  `result_value` TEXT DEFAULT NULL COMMENT 'Quick result summary',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_ordered_at` (`ordered_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ordered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY MEDICATION ADMINISTRATION TABLE
-- Track medication administration during ER visit
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_medication_administration` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL COMMENT 'e.g., 500mg, 10ml',
  `route` ENUM('IV', 'IM', 'PO', 'Sublingual', 'Topical', 'Inhalation', 'Other') NOT NULL DEFAULT 'PO',
  `frequency` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Q6H, TID, Once',
  `administered_by` INT(11) DEFAULT NULL COMMENT 'Nurse/Doctor ID who administered',
  `administered_at` DATETIME DEFAULT NULL,
  `status` ENUM('pending', 'given', 'missed', 'refused') NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_administered_at` (`administered_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`administered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY CHARGES TABLE
-- Itemized billing for ER visit
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_charges` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `charge_type` ENUM('consultation', 'procedure', 'medication', 'investigation', 'bed', 'other') NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10,2) DEFAULT 1.00,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `charged_by` INT(11) DEFAULT NULL COMMENT 'User ID who added charge',
  `charged_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_charge_type` (`charge_type`),
  INDEX `idx_charged_at` (`charged_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`charged_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY STATUS HISTORY TABLE
-- Audit trail of status changes
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_status_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `from_status` ENUM('registered', 'triaged', 'in-treatment', 'awaiting-disposition', 'completed') DEFAULT NULL,
  `to_status` ENUM('registered', 'triaged', 'in-treatment', 'awaiting-disposition', 'completed') NOT NULL,
  `changed_by` INT(11) DEFAULT NULL COMMENT 'User ID who changed status',
  `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_changed_at` (`changed_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY IPD ADMISSIONS TABLE
-- Link ER visits to IPD admissions
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_ipd_admissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `ipd_admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to IPD admissions table',
  `admission_type` ENUM('ward', 'private') NOT NULL,
  `admitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `admitted_by` INT(11) DEFAULT NULL COMMENT 'User ID who processed admission',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_ipd_admission_id` (`ipd_admission_id`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`admitted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MODIFICATIONS TO EMERGENCY_VISITS TABLE
-- Add new columns for complete workflow
-- ============================================
ALTER TABLE `emergency_visits` 
  ADD COLUMN IF NOT EXISTS `treatment_started_at` DATETIME DEFAULT NULL COMMENT 'When treatment phase started',
  ADD COLUMN IF NOT EXISTS `treatment_completed_at` DATETIME DEFAULT NULL COMMENT 'When treatment phase completed',
  ADD COLUMN IF NOT EXISTS `primary_diagnosis` TEXT DEFAULT NULL COMMENT 'Primary diagnosis',
  ADD COLUMN IF NOT EXISTS `secondary_diagnosis` JSON DEFAULT NULL COMMENT 'Array of secondary diagnoses',
  ADD COLUMN IF NOT EXISTS `procedures_performed` JSON DEFAULT NULL COMMENT 'Array of procedure names',
  ADD COLUMN IF NOT EXISTS `condition_at_discharge` ENUM('improved', 'stable', 'critical', 'expired') DEFAULT NULL COMMENT 'Patient condition at discharge',
  ADD COLUMN IF NOT EXISTS `ipd_admission_id` INT(11) DEFAULT NULL COMMENT 'Link to IPD admission if admitted',
  ADD COLUMN IF NOT EXISTS `discharge_summary` TEXT DEFAULT NULL COMMENT 'Discharge summary text';

-- Add index for IPD admission link
ALTER TABLE `emergency_visits`
  ADD INDEX IF NOT EXISTS `idx_ipd_admission_id` (`ipd_admission_id`);

