-- Emergency Duty Roster Management System Database Schema
-- This schema manages staff scheduling for emergency department

-- ============================================
-- EMERGENCY DUTY ROSTER TABLE
-- Staff scheduling for emergency department
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_duty_roster` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL COMMENT 'Foreign key to users.id (doctor/nurse)',
  `date` DATE NOT NULL COMMENT 'Date of duty',
  `shift_type` ENUM('Morning', 'Evening', 'Night') NOT NULL DEFAULT 'Morning',
  `shift_start_time` TIME NOT NULL COMMENT 'Shift start time (e.g., 06:00:00)',
  `shift_end_time` TIME NOT NULL COMMENT 'Shift end time (e.g., 14:00:00)',
  `specialization` VARCHAR(100) DEFAULT NULL COMMENT 'Doctor specialization (if applicable)',
  `status` ENUM('Scheduled', 'On Duty', 'Completed', 'Absent') NOT NULL DEFAULT 'Scheduled',
  `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the roster entry',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_shift_type` (`shift_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_user_date` (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
