-- IPD Discharge Summaries Management System Database Schema
-- This schema manages discharge summaries for IPD patients

-- ============================================
-- IPD DISCHARGE SUMMARIES TABLE
-- Complete discharge summary and documentation
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_discharge_summaries` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `discharge_date` DATE NOT NULL COMMENT 'Date of discharge',
  `discharge_time` TIME NOT NULL COMMENT 'Time of discharge',
  `admitting_diagnosis` TEXT DEFAULT NULL COMMENT 'Initial diagnosis at admission',
  `final_diagnosis` TEXT NOT NULL COMMENT 'Final diagnosis at discharge',
  `treatment_given` TEXT NOT NULL COMMENT 'Summary of treatment provided',
  `procedures_performed` JSON DEFAULT NULL COMMENT 'Array of procedures performed',
  `condition_at_discharge` ENUM('Improved', 'Stable', 'Critical', 'Expired', 'LAMA') NOT NULL COMMENT 'Condition at discharge',
  `discharge_advice` TEXT NOT NULL COMMENT 'Post-discharge care instructions',
  `medications` JSON DEFAULT NULL COMMENT 'Discharge medications (name, dosage, frequency, duration)',
  `follow_up_date` DATE DEFAULT NULL COMMENT 'Follow-up appointment date',
  `follow_up_doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to doctors.id (follow-up doctor)',
  `dietary_advice` TEXT DEFAULT NULL COMMENT 'Dietary instructions',
  `activity_restrictions` TEXT DEFAULT NULL COMMENT 'Physical activity limitations',
  `discharging_doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to doctors.id (discharging doctor)',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_admission_discharge` (`admission_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_discharge_date` (`discharge_date`),
  INDEX `idx_discharging_doctor` (`discharging_doctor_id`),
  INDEX `idx_follow_up_doctor` (`follow_up_doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

