-- Emergency Wards Management System Database Schema
-- This schema extends the existing HMS database with emergency ward management functionality

-- ============================================
-- EMERGENCY WARDS TABLE
-- Manages emergency department wards (Emergency Ward A, B, ICU, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_wards` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g., Emergency Ward A, Emergency Ward B',
  `type` ENUM('Emergency', 'ICU', 'Isolation', 'Pediatric', 'Trauma', 'General') NOT NULL DEFAULT 'Emergency',
  `building` VARCHAR(100) DEFAULT NULL COMMENT 'Building name',
  `floor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to floors.id',
  `total_beds` INT(11) NOT NULL DEFAULT 0 COMMENT 'Total number of beds in ward',
  `incharge_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (ward incharge)',
  `contact` VARCHAR(20) DEFAULT NULL COMMENT 'Contact number',
  `email` VARCHAR(100) DEFAULT NULL COMMENT 'Email address',
  `facilities` JSON DEFAULT NULL COMMENT 'Array of facilities (e.g., ["Central Oxygen Supply", "Cardiac Monitors"])',
  `description` TEXT DEFAULT NULL COMMENT 'Ward description',
  `status` ENUM('Active', 'Maintenance', 'Inactive') NOT NULL DEFAULT 'Active',
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
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`incharge_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
