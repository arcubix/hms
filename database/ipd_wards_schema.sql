-- IPD Wards Management System Database Schema
-- This schema manages IPD (In-Patient Department) wards

-- ============================================
-- IPD WARDS TABLE
-- Manages IPD wards (General Ward A, ICU, CCU, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_wards` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g., General Ward A, ICU - Intensive Care Unit',
  `type` ENUM('General', 'ICU', 'NICU', 'PICU', 'CCU', 'HDU', 'Isolation', 'Private', 'Deluxe') NOT NULL DEFAULT 'General',
  `building` VARCHAR(100) DEFAULT NULL COMMENT 'Building name',
  `floor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to floors.id',
  `total_beds` INT(11) NOT NULL DEFAULT 0 COMMENT 'Total number of beds in ward',
  `incharge_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (ward incharge/nurse)',
  `contact` VARCHAR(20) DEFAULT NULL COMMENT 'Contact number',
  `email` VARCHAR(100) DEFAULT NULL COMMENT 'Email address',
  `facilities` JSON DEFAULT NULL COMMENT 'Array of facilities (e.g., ["AC", "TV", "Washroom", "Nurse Call"])',
  `description` TEXT DEFAULT NULL COMMENT 'Ward description',
  `status` ENUM('active', 'maintenance', 'closed') NOT NULL DEFAULT 'active',
  `established_date` DATE DEFAULT NULL COMMENT 'Date ward was established',
  `last_inspection_date` DATE DEFAULT NULL COMMENT 'Last inspection date',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ward_name` (`name`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_floor_id` (`floor_id`),
  INDEX `idx_incharge` (`incharge_user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

