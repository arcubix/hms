-- IPD Beds Management System Database Schema
-- This schema manages beds within IPD wards

-- ============================================
-- IPD BEDS TABLE
-- Beds within IPD wards for admitted patients
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_beds` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ward_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_wards.id',
  `bed_number` VARCHAR(50) NOT NULL COMMENT 'Bed number within ward (e.g., GEN-A-01, ICU-07)',
  `bed_type` ENUM('General', 'ICU', 'Private', 'Deluxe', 'Isolation') NOT NULL DEFAULT 'General',
  `status` ENUM('available', 'occupied', 'reserved', 'maintenance', 'cleaning') NOT NULL DEFAULT 'available',
  `current_admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_admissions.id if occupied',
  `daily_rate` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Daily bed charge rate',
  `facilities` JSON DEFAULT NULL COMMENT 'Array of bed-specific facilities',
  `last_cleaned_at` DATETIME DEFAULT NULL COMMENT 'Last cleaning timestamp',
  `maintenance_notes` TEXT DEFAULT NULL COMMENT 'Maintenance notes if status is maintenance',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ward_bed` (`ward_id`, `bed_number`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_bed_type` (`bed_type`),
  INDEX `idx_current_admission` (`current_admission_id`),
  INDEX `idx_bed_number` (`bed_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

