-- Emergency Department Management System Database Schema
-- This schema extends the existing HMS database with emergency department functionality

-- ============================================
-- EMERGENCY VISITS TABLE
-- Stores emergency department patient visits
-- References existing patients table (does not create new patients)
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_visits` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `er_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'ER-YYYY-NNNN format',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `uhid` VARCHAR(50) DEFAULT NULL COMMENT 'UHID - stores patients.patient_id for reference',
  
  -- Arrival Information
  `arrival_time` DATETIME NOT NULL,
  `arrival_mode` ENUM('walk-in', 'ambulance', 'police', 'referred') NOT NULL DEFAULT 'walk-in',
  
  -- Triage Information
  `triage_level` TINYINT(1) NOT NULL COMMENT 'ESI 1-5',
  `chief_complaint` TEXT NOT NULL,
  
  -- Vital Signs
  `vitals_bp` VARCHAR(20) DEFAULT NULL COMMENT 'Blood Pressure (e.g., 120/80)',
  `vitals_pulse` INT(3) DEFAULT NULL COMMENT 'Pulse rate (bpm)',
  `vitals_temp` DECIMAL(4,1) DEFAULT NULL COMMENT 'Temperature (°F)',
  `vitals_spo2` INT(3) DEFAULT NULL COMMENT 'SpO2 (%)',
  `vitals_resp` INT(3) DEFAULT NULL COMMENT 'Respiratory Rate',
  
  -- Status Tracking
  `current_status` ENUM('registered', 'triaged', 'in-treatment', 'awaiting-disposition', 'completed') NOT NULL DEFAULT 'registered',
  
  -- Staff Assignment
  `assigned_doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `assigned_nurse_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (nurse)',
  `bed_number` VARCHAR(50) DEFAULT NULL COMMENT 'ER bed assignment',
  
  -- Disposition
  `disposition` ENUM('discharge', 'admit-ward', 'admit-private', 'transfer', 'absconded', 'death') DEFAULT NULL,
  `disposition_details` TEXT DEFAULT NULL,
  `disposition_time` DATETIME DEFAULT NULL,
  `follow_up_required` TINYINT(1) DEFAULT 0,
  `follow_up_date` DATE DEFAULT NULL,
  `medications_prescribed` TEXT DEFAULT NULL COMMENT 'Medications prescribed at discharge',
  
  -- Investigations & Medications (stored as JSON for flexibility)
  `investigations` JSON DEFAULT NULL COMMENT 'Array of investigation names/codes',
  `medications` JSON DEFAULT NULL COMMENT 'Array of medication names',
  
  -- Financial
  `total_charges` DECIMAL(10,2) DEFAULT 0.00,
  
  -- Timestamps
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who registered',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_er_number` (`er_number`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_er_number` (`er_number`),
  INDEX `idx_current_status` (`current_status`),
  INDEX `idx_arrival_time` (`arrival_time`),
  INDEX `idx_triage_level` (`triage_level`),
  INDEX `idx_disposition` (`disposition`),
  INDEX `idx_assigned_doctor` (`assigned_doctor_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`assigned_doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_nurse_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMERGENCY BEDS TABLE (Optional)
-- Manages ER bed availability and assignments
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_beds` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bed_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'ER-BED-01, ER-RESUS-01, etc.',
  `bed_type` ENUM('standard', 'resuscitation', 'trauma', 'isolation') NOT NULL DEFAULT 'standard',
  `status` ENUM('available', 'occupied', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
  `current_visit_id` INT(11) DEFAULT NULL COMMENT 'Current emergency_visits.id if occupied',
  `location` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bed_number` (`bed_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_bed_type` (`bed_type`),
  INDEX `idx_current_visit` (`current_visit_id`),
  FOREIGN KEY (`current_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Note: Only insert sample beds if needed. Emergency visits should be created through the API.

-- INSERT INTO `emergency_beds` (`bed_number`, `bed_type`, `status`, `location`) VALUES
-- ('ER-BED-01', 'standard', 'available', 'ER Ward A'),
-- ('ER-BED-02', 'standard', 'available', 'ER Ward A'),
-- ('ER-BED-03', 'standard', 'available', 'ER Ward B'),
-- ('ER-RESUS-01', 'resuscitation', 'available', 'Resuscitation Bay'),
-- ('ER-TRAUMA-01', 'trauma', 'available', 'Trauma Bay 1');
