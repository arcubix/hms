-- Death Certificates Management System Database Schema
-- This schema manages death certificate registration and tracking

-- ============================================
-- DEATH CERTIFICATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `death_certificates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `certificate_no` VARCHAR(50) NOT NULL COMMENT 'Auto-generated certificate number (DC-YYYY-XXXXXX)',
  
  -- Patient Information
  `patient_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to patients.id (optional link)',
  `patient_name` VARCHAR(255) NOT NULL COMMENT 'Deceased patient full name',
  `patient_nic` VARCHAR(20) DEFAULT NULL COMMENT 'Patient NIC number',
  `patient_gender` ENUM('Male', 'Female') NOT NULL COMMENT 'Patient gender',
  `date_of_birth` DATE NOT NULL COMMENT 'Date of birth',
  
  -- Age Breakdown
  `age_years` INT(11) DEFAULT NULL COMMENT 'Age in years',
  `age_months` INT(11) DEFAULT NULL COMMENT 'Age in months',
  `age_days` INT(11) DEFAULT NULL COMMENT 'Age in days',
  
  -- Family Information
  `father_name` VARCHAR(255) DEFAULT NULL COMMENT 'Father name',
  `address` TEXT DEFAULT NULL COMMENT 'Patient address',
  
  -- Admission Details
  `admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_admissions.id (optional link)',
  `date_of_admission` DATE DEFAULT NULL COMMENT 'Date of admission',
  
  -- Guardian/Attendant Information
  `guardian_name` VARCHAR(255) DEFAULT NULL COMMENT 'Guardian/Next of kin name',
  `guardian_nic` VARCHAR(20) DEFAULT NULL COMMENT 'Guardian NIC number',
  `phone_number` VARCHAR(20) DEFAULT NULL COMMENT 'Guardian contact phone number',
  
  -- Death Details
  `date_of_death` DATE NOT NULL COMMENT 'Date of death',
  `cause_of_death` TEXT NOT NULL COMMENT 'Cause of death',
  
  -- Doctor Information
  `doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor on duty)',
  `doctor_name` VARCHAR(255) DEFAULT NULL COMMENT 'Doctor name',
  
  -- Status and Notes
  `status` ENUM('Pending', 'Issued', 'Verified') NOT NULL DEFAULT 'Pending' COMMENT 'Certificate status',
  `registration_date` DATE NOT NULL COMMENT 'Registration date',
  
  -- Audit Fields
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the certificate',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_certificate_no` (`certificate_no`),
  INDEX `idx_certificate_no` (`certificate_no`),
  INDEX `idx_patient_name` (`patient_name`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_date_of_death` (`date_of_death`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_registration_date` (`registration_date`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

