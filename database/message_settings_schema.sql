-- Message Settings Database Schema
-- This file creates tables for message templates, platform settings, recipients, and logs

-- ============================================
-- MESSAGE TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `message_templates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Template name',
  `type` ENUM('sms', 'email', 'whatsapp') NOT NULL COMMENT 'Message type',
  `trigger_event` VARCHAR(100) NOT NULL COMMENT 'Event that triggers this template (e.g., appointment_booked)',
  `category` VARCHAR(50) DEFAULT NULL COMMENT 'Template category (appointments, billing, reports, etc.)',
  `content` TEXT NOT NULL COMMENT 'Message content with variables',
  `subject` VARCHAR(255) DEFAULT NULL COMMENT 'Email subject (only for email type)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Active/Inactive status',
  `sent_count` INT(11) DEFAULT 0 COMMENT 'Total messages sent using this template',
  `delivery_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Delivery success rate percentage',
  `last_used_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Last time this template was used',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User who created this template',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_trigger_event` (`trigger_event`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGE PLATFORM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `message_platform_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `platform` ENUM('sms', 'email', 'whatsapp') NOT NULL UNIQUE COMMENT 'Platform type',
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Enable/disable platform',
  `provider_name` VARCHAR(100) DEFAULT NULL COMMENT 'Service provider name (e.g., Twilio, SendGrid)',
  `api_key` VARCHAR(255) DEFAULT NULL COMMENT 'API key or username',
  `api_secret` VARCHAR(255) DEFAULT NULL COMMENT 'API secret or password',
  `api_url` VARCHAR(255) DEFAULT NULL COMMENT 'API endpoint URL',
  `sender_id` VARCHAR(50) DEFAULT NULL COMMENT 'Sender ID or phone number',
  `sender_email` VARCHAR(100) DEFAULT NULL COMMENT 'Sender email address',
  `settings` JSON DEFAULT NULL COMMENT 'Additional platform-specific settings',
  `updated_by` INT(11) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_platform` (`platform`),
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default platform settings
INSERT INTO `message_platform_settings` (`platform`, `is_enabled`, `provider_name`) VALUES
('sms', 1, 'Default SMS Provider'),
('email', 1, 'Default Email Provider'),
('whatsapp', 1, 'Default WhatsApp Provider')
ON DUPLICATE KEY UPDATE `platform` = `platform`;

-- ============================================
-- MESSAGE RECIPIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `message_recipients` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL COMMENT 'User ID from users table',
  `user_type` ENUM('doctor', 'staff', 'admin') NOT NULL COMMENT 'Type of user',
  `appointment_sms` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive appointment SMS',
  `opd_sms` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive OPD SMS',
  `appointment_email` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive appointment emails',
  `schedule_sms` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive schedule SMS',
  `schedule_email` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive schedule emails',
  `courtesy_message` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive courtesy messages',
  `day_end_report` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Receive day-end reports (admin only)',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_recipient` (`user_id`, `user_type`),
  INDEX `idx_user_type` (`user_type`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `message_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `template_id` INT(11) DEFAULT NULL COMMENT 'Template used for this message',
  `recipient_id` INT(11) DEFAULT NULL COMMENT 'Recipient user ID',
  `recipient_type` ENUM('patient', 'doctor', 'staff', 'admin') DEFAULT NULL,
  `recipient_contact` VARCHAR(255) NOT NULL COMMENT 'Phone number or email address',
  `message_type` ENUM('sms', 'email', 'whatsapp') NOT NULL,
  `content` TEXT NOT NULL COMMENT 'Actual message content sent',
  `subject` VARCHAR(255) DEFAULT NULL COMMENT 'Email subject if applicable',
  `status` ENUM('pending', 'sent', 'delivered', 'failed') NOT NULL DEFAULT 'pending',
  `provider_response` TEXT DEFAULT NULL COMMENT 'Response from message provider',
  `error_message` TEXT DEFAULT NULL COMMENT 'Error message if failed',
  `sent_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'When message was sent',
  `delivered_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'When message was delivered',
  `metadata` JSON DEFAULT NULL COMMENT 'Additional metadata (variables used, etc.)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_recipient_id` (`recipient_id`),
  INDEX `idx_message_type` (`message_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sent_at` (`sent_at`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`template_id`) REFERENCES `message_templates`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGE STATISTICS VIEW (Optional - for easier querying)
-- ============================================
CREATE OR REPLACE VIEW `message_statistics_view` AS
SELECT 
  DATE(created_at) as date,
  message_type,
  COUNT(*) as total_sent,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as delivery_rate
FROM message_logs
WHERE status IN ('sent', 'delivered', 'failed')
GROUP BY DATE(created_at), message_type;

