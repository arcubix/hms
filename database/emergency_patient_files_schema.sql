-- Emergency Patient Files Management System Database Schema
-- This schema manages patient documents and file attachments for emergency visits

-- ============================================
-- EMERGENCY PATIENT FILES TABLE
-- Patient documents and file attachments
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_patient_files` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_visits.id',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'Original file name',
  `file_type` VARCHAR(100) DEFAULT NULL COMMENT 'File MIME type (e.g., application/pdf, image/jpeg)',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'Server file path',
  `file_size` INT(11) DEFAULT NULL COMMENT 'File size in bytes',
  `category` ENUM('Lab Results', 'Radiology', 'Forms', 'Consent', 'ECG', 'Medical History', 'Other') NOT NULL DEFAULT 'Other',
  `description` TEXT DEFAULT NULL COMMENT 'File description',
  `uploaded_by` INT(11) DEFAULT NULL COMMENT 'User ID who uploaded the file',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_uploaded_at` (`uploaded_at`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

