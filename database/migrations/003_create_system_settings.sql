-- Migration: Create system_settings table for global system configuration
-- This table stores system-wide settings including room management mode

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique setting identifier',
  `setting_value` JSON NOT NULL COMMENT 'Setting value stored as JSON for flexibility',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT 'Settings category (general, opd, etc.)',
  `description` TEXT DEFAULT NULL COMMENT 'Description of what this setting does',
  `updated_by` INT(11) DEFAULT NULL COMMENT 'User who last updated this setting',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`),
  INDEX `idx_category` (`category`),
  INDEX `idx_updated_by` (`updated_by`),
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `category`, `description`) VALUES
('room_management_mode', '"Fixed"', 'opd', 'Room management mode: Fixed or Dynamic'),
('token_reset_daily', 'true', 'opd', 'Reset token numbers daily'),
('token_prefix_format', '"F{floor}-{reception}"', 'opd', 'Token prefix format: F{floor}-{reception}, {reception}, or {floor}')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

