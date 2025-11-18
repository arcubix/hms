-- User Management System Database Schema
-- This file extends the existing HMS schema with comprehensive user management tables

-- ============================================
-- EXTEND USERS TABLE
-- ============================================
-- Add additional fields to support multi-tab user form
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `gender` ENUM('Male', 'Female', 'Other') DEFAULT NULL AFTER `name`,
  ADD COLUMN IF NOT EXISTS `professional_statement` TEXT DEFAULT NULL COMMENT 'Professional statement/bio',
  ADD COLUMN IF NOT EXISTS `awards` TEXT DEFAULT NULL COMMENT 'Awards and achievements',
  ADD COLUMN IF NOT EXISTS `expertise` TEXT DEFAULT NULL COMMENT 'Areas of expertise',
  ADD COLUMN IF NOT EXISTS `registrations` TEXT DEFAULT NULL COMMENT 'Professional registrations',
  ADD COLUMN IF NOT EXISTS `professional_memberships` TEXT DEFAULT NULL COMMENT 'Professional memberships',
  ADD COLUMN IF NOT EXISTS `languages` VARCHAR(255) DEFAULT NULL COMMENT 'Languages spoken (comma-separated)',
  ADD COLUMN IF NOT EXISTS `experience` VARCHAR(100) DEFAULT NULL COMMENT 'Years of experience',
  ADD COLUMN IF NOT EXISTS `degree_completion_date` DATE DEFAULT NULL COMMENT 'Degree completion date',
  ADD COLUMN IF NOT EXISTS `summary` TEXT DEFAULT NULL COMMENT 'Professional summary',
  ADD COLUMN IF NOT EXISTS `pmdc` VARCHAR(100) DEFAULT NULL COMMENT 'PMDC registration number',
  ADD COLUMN IF NOT EXISTS `shift_id` INT(11) DEFAULT NULL COMMENT 'Assigned shift',
  ADD COLUMN IF NOT EXISTS `opd_access` TINYINT(1) DEFAULT 0 COMMENT 'OPD access flag',
  ADD COLUMN IF NOT EXISTS `ipd_access` TINYINT(1) DEFAULT 0 COMMENT 'IPD access flag',
  ADD COLUMN IF NOT EXISTS `booking_type` ENUM('Token', 'Appointment') DEFAULT 'Appointment' COMMENT 'Booking preference',
  ADD COLUMN IF NOT EXISTS `consultation_fee` DECIMAL(10,2) DEFAULT NULL COMMENT 'Consultation fee in Rs',
  ADD COLUMN IF NOT EXISTS `follow_up_charges` DECIMAL(10,2) DEFAULT NULL COMMENT 'Follow up charges',
  ADD COLUMN IF NOT EXISTS `follow_up_share_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Follow up share price',
  ADD COLUMN IF NOT EXISTS `share_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'Share price in Rs',
  ADD COLUMN IF NOT EXISTS `share_type` ENUM('Rupees', 'Percentage') DEFAULT 'Rupees' COMMENT 'Share type',
  ADD COLUMN IF NOT EXISTS `lab_share_value` DECIMAL(10,2) DEFAULT NULL COMMENT 'Lab share value',
  ADD COLUMN IF NOT EXISTS `lab_share_type` ENUM('percentage', 'rupees') DEFAULT 'percentage' COMMENT 'Lab share type',
  ADD COLUMN IF NOT EXISTS `radiology_share_value` DECIMAL(10,2) DEFAULT NULL COMMENT 'Radiology share value',
  ADD COLUMN IF NOT EXISTS `radiology_share_type` ENUM('percentage', 'rupees') DEFAULT 'percentage' COMMENT 'Radiology share type',
  ADD COLUMN IF NOT EXISTS `instant_booking` TINYINT(1) DEFAULT 0 COMMENT 'Instant booking enabled',
  ADD COLUMN IF NOT EXISTS `visit_charges` TINYINT(1) DEFAULT 0 COMMENT 'Visit charges enabled',
  ADD COLUMN IF NOT EXISTS `invoice_edit_count` INT(11) DEFAULT 0 COMMENT 'Invoice edit limit',
  ADD INDEX IF NOT EXISTS `idx_gender` (`gender`),
  ADD INDEX IF NOT EXISTS `idx_shift_id` (`shift_id`);

-- ============================================
-- USER ROLES JUNCTION TABLE
-- ============================================
-- Support multiple roles per user
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `role` VARCHAR(50) NOT NULL COMMENT 'Role name (doctor, admin, lab_manager, etc.)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`, `role`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role` (`role`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER DEPARTMENTS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `department` VARCHAR(100) NOT NULL COMMENT 'Department name',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_department` (`user_id`, `department`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_department` (`department`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER QUALIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_qualifications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `qualification` VARCHAR(255) NOT NULL COMMENT 'Qualification name',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `service` VARCHAR(255) NOT NULL COMMENT 'Service name',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER TIMINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_timings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `day_of_week` ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `duration` INT(3) DEFAULT 30 COMMENT 'Appointment duration in minutes',
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_day_of_week` (`day_of_week`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER FAQS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_faqs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `order` INT(3) DEFAULT 0 COMMENT 'Display order',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER SHARE PROCEDURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_share_procedures` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `procedure_name` VARCHAR(255) NOT NULL COMMENT 'Procedure or service name',
  `share_type` ENUM('percentage', 'rupees') NOT NULL DEFAULT 'percentage',
  `share_value` DECIMAL(10,2) NOT NULL COMMENT 'Share value',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FOLLOW UP SHARE TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `user_follow_up_share_types` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `share_type` VARCHAR(100) NOT NULL COMMENT 'Follow up share type name',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_share_type` (`user_id`, `share_type`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

