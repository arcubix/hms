-- ============================================
-- USER SETTINGS MIGRATION SCRIPT
-- ============================================
-- This script ensures all necessary columns and tables exist for User Settings
-- Run this script to add any missing columns/tables

-- ============================================
-- EXTEND USERS TABLE WITH SETTINGS COLUMNS
-- ============================================
ALTER TABLE `users` 
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
  ADD COLUMN IF NOT EXISTS `invoice_edit_count` INT(11) DEFAULT 0 COMMENT 'Invoice edit limit';

-- ============================================
-- CREATE FOLLOW UP SHARE TYPES TABLE
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

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migration was successful:

-- Check if all columns exist in users table
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE() 
--   AND TABLE_NAME = 'users' 
--   AND COLUMN_NAME IN (
--     'consultation_fee', 'follow_up_charges', 'follow_up_share_price',
--     'share_price', 'share_type', 'lab_share_value', 'lab_share_type',
--     'radiology_share_value', 'radiology_share_type',
--     'instant_booking', 'visit_charges', 'invoice_edit_count'
--   );

-- Check if user_follow_up_share_types table exists
-- SELECT TABLE_NAME 
-- FROM INFORMATION_SCHEMA.TABLES 
-- WHERE TABLE_SCHEMA = DATABASE() 
--   AND TABLE_NAME = 'user_follow_up_share_types';

