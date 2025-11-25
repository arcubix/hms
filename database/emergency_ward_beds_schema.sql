-- Emergency Ward Beds Management System Database Schema
-- This schema manages beds within emergency wards (different from emergency_beds which are ER treatment beds)

-- ============================================
-- EMERGENCY WARD BEDS TABLE
-- Beds within emergency wards for admitted patients
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_ward_beds` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ward_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_wards.id',
  `bed_number` VARCHAR(50) NOT NULL COMMENT 'Bed number within ward (e.g., EA-01, EA-02)',
  `bed_type` ENUM('Regular', 'ICU', 'Isolation', 'Resuscitation', 'Trauma') NOT NULL DEFAULT 'Regular',
  `status` ENUM('Available', 'Occupied', 'Under Cleaning', 'Maintenance', 'Reserved') NOT NULL DEFAULT 'Available',
  `current_visit_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to emergency_visits.id if occupied',
  `last_cleaned_at` DATETIME DEFAULT NULL COMMENT 'Last cleaning timestamp',
  `maintenance_notes` TEXT DEFAULT NULL COMMENT 'Maintenance notes if status is Maintenance',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ward_bed` (`ward_id`, `bed_number`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_bed_type` (`bed_type`),
  INDEX `idx_current_visit` (`current_visit_id`),
  INDEX `idx_bed_number` (`bed_number`),
  FOREIGN KEY (`ward_id`) REFERENCES `emergency_wards`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`current_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
