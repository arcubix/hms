-- Prescription Radiology Tests Schema
-- This file creates separate tables for radiology tests (similar to lab tests)

-- ============================================
-- RADIOLOGY TESTS TABLE (Available Tests)
-- ============================================
CREATE TABLE IF NOT EXISTS `radiology_tests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `test_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique test code (e.g., RAD001)',
  `test_name` VARCHAR(255) NOT NULL,
  `test_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., X-Ray, CT Scan, MRI, Ultrasound, ECG, Mammography',
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Imaging, Diagnostic, Screening',
  `description` TEXT DEFAULT NULL,
  `preparation_instructions` TEXT DEFAULT NULL COMMENT 'e.g., Fasting required, No preparation needed',
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
-- PRESCRIPTION RADIOLOGY TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `prescription_radiology_tests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `prescription_id` INT(11) NOT NULL,
  `radiology_test_id` INT(11) DEFAULT NULL COMMENT 'Reference to radiology_tests table',
  `test_name` VARCHAR(255) NOT NULL COMMENT 'Test name (can be custom or from radiology_tests table)',
  `test_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., X-Ray, CT Scan, MRI',
  `body_part` VARCHAR(255) DEFAULT NULL COMMENT 'Body part/region for radiology',
  `indication` TEXT DEFAULT NULL COMMENT 'Clinical indication for radiology',
  `instructions` TEXT DEFAULT NULL COMMENT 'Special instructions for the test',
  `priority` ENUM('Normal', 'Urgent', 'Emergency') NOT NULL DEFAULT 'Normal',
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prescription_id` (`prescription_id`),
  INDEX `idx_radiology_test_id` (`radiology_test_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`),
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`radiology_test_id`) REFERENCES `radiology_tests`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Radiology Tests
-- ============================================
INSERT INTO `radiology_tests` (`test_code`, `test_name`, `test_type`, `category`, `status`) VALUES
('RAD001', 'X-Ray', 'X-Ray', 'Imaging', 'Active'),
('RAD002', 'CT Scan', 'CT Scan', 'Imaging', 'Active'),
('RAD003', 'MRI', 'MRI', 'Imaging', 'Active'),
('RAD004', 'Ultrasound', 'Ultrasound', 'Imaging', 'Active'),
('RAD005', 'ECG', 'ECG', 'Diagnostic', 'Active'),
('RAD006', 'Mammography', 'Mammography', 'Screening', 'Active')
ON DUPLICATE KEY UPDATE `test_name` = VALUES(`test_name`);

-- ============================================
-- Remove old radiology columns from prescriptions table (if they exist)
-- ============================================
ALTER TABLE `prescriptions` 
DROP COLUMN IF EXISTS `radiology_tests`,
DROP COLUMN IF EXISTS `radiology_body_part`,
DROP COLUMN IF EXISTS `radiology_indication`;

