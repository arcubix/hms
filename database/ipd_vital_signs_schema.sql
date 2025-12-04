-- IPD Vital Signs Management System Database Schema
-- This schema manages vital signs recording for IPD patients

-- ============================================
-- IPD VITAL SIGNS TABLE
-- Records vital signs for IPD patients
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_vital_signs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `recorded_date` DATE NOT NULL COMMENT 'Date when vital signs were recorded',
  `recorded_time` TIME NOT NULL COMMENT 'Time when vital signs were recorded',
  `recorded_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (nurse/doctor)',
  `temperature` DECIMAL(4, 1) DEFAULT NULL COMMENT 'Temperature in Celsius',
  `blood_pressure_systolic` INT(3) DEFAULT NULL COMMENT 'Systolic blood pressure',
  `blood_pressure_diastolic` INT(3) DEFAULT NULL COMMENT 'Diastolic blood pressure',
  `heart_rate` INT(3) DEFAULT NULL COMMENT 'Heart rate in bpm',
  `respiratory_rate` INT(3) DEFAULT NULL COMMENT 'Respiratory rate per minute',
  `oxygen_saturation` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Oxygen saturation percentage',
  `blood_sugar` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Blood sugar in mg/dL',
  `pain_score` INT(1) DEFAULT NULL COMMENT 'Pain score 0-10',
  `consciousness_level` ENUM('Alert', 'Drowsy', 'Confused', 'Unconscious') DEFAULT 'Alert',
  `notes` TEXT DEFAULT NULL COMMENT 'Clinical notes or observations',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_recorded_date` (`recorded_date`),
  INDEX `idx_recorded_by` (`recorded_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

