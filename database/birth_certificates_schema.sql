-- Birth Certificates Management System Database Schema
-- This schema manages birth certificate registration and tracking

-- ============================================
-- BIRTH CERTIFICATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `birth_certificates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `certificate_no` VARCHAR(50) NOT NULL COMMENT 'Auto-generated certificate number (BC-YYYY-XXXXXX)',
  `baby_name` VARCHAR(255) NOT NULL COMMENT 'Baby full name',
  `baby_gender` ENUM('Male', 'Female') NOT NULL COMMENT 'Baby gender',
  `date_of_birth` DATE NOT NULL COMMENT 'Date of birth',
  `time_of_birth` TIME NOT NULL COMMENT 'Time of birth',
  `weight` VARCHAR(50) DEFAULT NULL COMMENT 'Birth weight (e.g., 3.2 kg)',
  `height` VARCHAR(50) DEFAULT NULL COMMENT 'Birth height (e.g., 50 cm)',
  `head_circumference` VARCHAR(50) DEFAULT NULL COMMENT 'Head circumference (e.g., 34 cm)',
  
  -- Mother Information
  `mother_name` VARCHAR(255) NOT NULL COMMENT 'Mother full name',
  `mother_mrn` VARCHAR(50) DEFAULT NULL COMMENT 'Mother Medical Record Number',
  `mother_nic` VARCHAR(20) DEFAULT NULL COMMENT 'Mother NIC number',
  `mother_patient_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to patients.id (optional link)',
  
  -- Father Information
  `father_name` VARCHAR(255) NOT NULL COMMENT 'Father full name',
  `father_cnic` VARCHAR(20) DEFAULT NULL COMMENT 'Father CNIC number',
  
  -- Delivery Details
  `delivery_no` VARCHAR(50) DEFAULT NULL COMMENT 'Delivery number',
  `mode_of_delivery` VARCHAR(100) DEFAULT NULL COMMENT 'Mode of delivery (Normal, C-Section, etc.)',
  `birthmark` TEXT DEFAULT NULL COMMENT 'Birthmark description',
  
  -- Doctor Information
  `doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `doctor_name` VARCHAR(255) DEFAULT NULL COMMENT 'Doctor name',
  
  -- Contact Information
  `phone_number` VARCHAR(20) DEFAULT NULL COMMENT 'Contact phone number',
  `address` TEXT DEFAULT NULL COMMENT 'Contact address',
  
  -- Status and Notes
  `status` ENUM('Pending', 'Issued', 'Verified') NOT NULL DEFAULT 'Pending' COMMENT 'Certificate status',
  `remarks` TEXT DEFAULT NULL COMMENT 'Additional remarks/notes',
  `registration_date` DATE NOT NULL COMMENT 'Registration date',
  
  -- Audit Fields
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the certificate',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_certificate_no` (`certificate_no`),
  INDEX `idx_certificate_no` (`certificate_no`),
  INDEX `idx_baby_name` (`baby_name`),
  INDEX `idx_date_of_birth` (`date_of_birth`),
  INDEX `idx_mother_patient_id` (`mother_patient_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_registration_date` (`registration_date`),
  FOREIGN KEY (`mother_patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

