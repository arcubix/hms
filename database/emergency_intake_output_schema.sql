-- Emergency Intake & Output Monitoring System Database Schema
-- This schema tracks patient fluid intake and output during emergency visits

-- ============================================
-- EMERGENCY INTAKE & OUTPUT TABLE
-- Intake and output monitoring records
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_intake_output` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_visits.id',
  `record_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time when I/O was recorded',
  `intake_type` ENUM('IV Fluids', 'Oral (Water)', 'Oral (Food)', 'NG Tube', 'PEG Tube', 'TPN', 'Blood Products', 'Other') DEFAULT NULL,
  `intake_amount_ml` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Intake amount in milliliters',
  `output_type` ENUM('Urine', 'Drainage', 'NG Aspirate', 'Vomitus', 'Stool', 'Blood Loss', 'Other') DEFAULT NULL,
  `output_amount_ml` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Output amount in milliliters',
  `balance_ml` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Net balance (intake - output)',
  `recorded_by` INT(11) DEFAULT NULL COMMENT 'User ID who recorded (nurse/doctor)',
  `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_record_time` (`record_time`),
  INDEX `idx_recorded_by` (`recorded_by`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

