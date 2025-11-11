-- Prescription Management System Database Schema
-- This file extends the existing HMS schema with prescription-related tables

-- ============================================
-- MEDICINES TABLE (Inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS `medicines` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique medicine code (e.g., MED001)',
  `name` VARCHAR(255) NOT NULL,
  `generic_name` VARCHAR(255) DEFAULT NULL,
  `manufacturer` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Antibiotic, Painkiller, Vitamin',
  `unit` VARCHAR(50) DEFAULT NULL COMMENT 'e.g., Tablet, Capsule, Syrup, Injection',
  `strength` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., 500mg, 10ml',
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Discontinued') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_medicine_code` (`medicine_code`),
  INDEX `idx_name` (`name`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LAB TESTS TABLE (Available Tests)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_tests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `test_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique test code (e.g., LAB001)',
  `test_name` VARCHAR(255) NOT NULL,
  `test_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Blood Test, Urine Test, X-Ray, CT Scan',
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Hematology, Biochemistry, Radiology',
  `description` TEXT DEFAULT NULL,
  `preparation_instructions` TEXT DEFAULT NULL COMMENT 'e.g., Fasting required, Morning sample',
  `normal_range` VARCHAR(255) DEFAULT NULL,
  `duration` VARCHAR(100) DEFAULT NULL COMMENT 'Expected time to complete',
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_test_code` (`test_code`),
  INDEX `idx_test_name` (`test_name`),
  INDEX `idx_test_type` (`test_type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `prescription_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique prescription identifier (e.g., RX001)',
  `appointment_id` INT(11) DEFAULT NULL COMMENT 'Associated appointment',
  `patient_id` INT(11) NOT NULL,
  `doctor_id` INT(11) NOT NULL COMMENT 'Doctor who created the prescription',
  `diagnosis` TEXT DEFAULT NULL COMMENT 'Primary diagnosis',
  `chief_complaint` TEXT DEFAULT NULL COMMENT 'Patient chief complaint',
  `clinical_notes` TEXT DEFAULT NULL COMMENT 'Clinical examination notes',
  `advice` TEXT DEFAULT NULL COMMENT 'Doctor advice to patient',
  `follow_up_date` DATE DEFAULT NULL COMMENT 'Recommended follow-up date',
  `status` ENUM('Draft', 'Active', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_prescription_number` (`prescription_number`),
  INDEX `idx_appointment_id` (`appointment_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRESCRIPTION MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `prescription_medicines` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `prescription_id` INT(11) NOT NULL,
  `medicine_id` INT(11) DEFAULT NULL COMMENT 'Reference to medicines table',
  `medicine_name` VARCHAR(255) NOT NULL COMMENT 'Medicine name (can be custom or from medicines table)',
  `dosage` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., 500mg, 10ml',
  `frequency` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Twice daily, Three times daily',
  `duration` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., 7 days, 2 weeks',
  `quantity` INT(11) DEFAULT NULL COMMENT 'Number of units',
  `instructions` TEXT DEFAULT NULL COMMENT 'Special instructions for taking medicine',
  `timing` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Before meals, After meals, With food',
  `status` ENUM('Pending', 'Dispensed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prescription_id` (`prescription_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRESCRIPTION LAB TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `prescription_lab_tests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `prescription_id` INT(11) NOT NULL,
  `lab_test_id` INT(11) DEFAULT NULL COMMENT 'Reference to lab_tests table',
  `test_name` VARCHAR(255) NOT NULL COMMENT 'Test name (can be custom or from lab_tests table)',
  `test_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Blood Test, Urine Test, X-Ray',
  `instructions` TEXT DEFAULT NULL COMMENT 'Special instructions for the test',
  `priority` ENUM('Normal', 'Urgent', 'Emergency') NOT NULL DEFAULT 'Normal',
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `lab_result_id` INT(11) DEFAULT NULL COMMENT 'Link to lab results when available',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prescription_id` (`prescription_id`),
  INDEX `idx_lab_test_id` (`lab_test_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`),
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRESCRIPTION STATUS TRACKING TABLE (for nurse, lab, pharmacy workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS `prescription_status_tracking` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `prescription_id` INT(11) NOT NULL,
  `department` ENUM('Nurse', 'Lab', 'Pharmacy') NOT NULL,
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `assigned_to` INT(11) DEFAULT NULL COMMENT 'User ID assigned to handle this',
  `notes` TEXT DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prescription_id` (`prescription_id`),
  INDEX `idx_department` (`department`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

