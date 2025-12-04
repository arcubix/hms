-- IPD Nursing Notes Management System Database Schema
-- This schema manages nursing notes for IPD patients

-- ============================================
-- IPD NURSING NOTES TABLE
-- Daily nursing observations and care notes
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_nursing_notes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `date` DATE NOT NULL COMMENT 'Date of note',
  `time` TIME NOT NULL COMMENT 'Time of note',
  `shift` ENUM('Morning', 'Evening', 'Night') NOT NULL DEFAULT 'Morning',
  `nurse_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (nurse)',
  `category` ENUM('General', 'Medication', 'Vital Signs', 'Procedure', 'Incident', 'Assessment') NOT NULL DEFAULT 'General',
  `note` TEXT NOT NULL COMMENT 'Nursing note content',
  `severity` ENUM('low', 'medium', 'high') DEFAULT NULL COMMENT 'Severity level if applicable',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_shift` (`shift`),
  INDEX `idx_nurse` (`nurse_user_id`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

