-- Emergency Blood Bank Requests Management System Database Schema
-- This schema manages blood product requests and transfusion history for emergency patients

-- ============================================
-- EMERGENCY BLOOD BANK REQUESTS TABLE
-- Blood product requests and transfusion records
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_blood_bank_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_visits.id',
  `request_number` VARCHAR(50) DEFAULT NULL COMMENT 'Unique request number (e.g., BB-2024-001)',
  `product_type` ENUM('Packed Red Blood Cells', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate', 'Whole Blood', 'Albumin', 'Other') NOT NULL,
  `units` INT(3) NOT NULL DEFAULT 1 COMMENT 'Number of units requested',
  `request_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `urgency` ENUM('Routine', 'Urgent', 'Emergency') NOT NULL DEFAULT 'Routine',
  `status` ENUM('Requested', 'Processing', 'Ready', 'Issued', 'Transfused', 'Cancelled') NOT NULL DEFAULT 'Requested',
  `requested_by` INT(11) DEFAULT NULL COMMENT 'User ID who requested (doctor)',
  `issued_at` DATETIME DEFAULT NULL COMMENT 'When blood product was issued',
  `issued_by` INT(11) DEFAULT NULL COMMENT 'User ID who issued the product',
  `transfusion_date` DATETIME DEFAULT NULL COMMENT 'When transfusion was completed',
  `transfusion_start_time` TIME DEFAULT NULL COMMENT 'Transfusion start time',
  `transfusion_end_time` TIME DEFAULT NULL COMMENT 'Transfusion end time',
  `reaction_notes` TEXT DEFAULT NULL COMMENT 'Any adverse reactions during transfusion',
  `cross_match_status` ENUM('Pending', 'Compatible', 'Incompatible', 'Not Required') DEFAULT 'Pending',
  `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_request_number` (`request_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_urgency` (`urgency`),
  INDEX `idx_request_date` (`request_date`),
  INDEX `idx_requested_by` (`requested_by`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

