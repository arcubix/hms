-- ============================================
-- AUDIT LOGS SYSTEM DATABASE SCHEMA
-- ============================================
-- This script creates the audit_logs table for tracking all user activities across the HMS system

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id - User who performed action',
  `user_name` VARCHAR(255) DEFAULT NULL COMMENT 'Cached user name for display',
  `user_role` VARCHAR(100) DEFAULT NULL COMMENT 'Cached user role',
  `action_type` ENUM('create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'settings', 'error') NOT NULL COMMENT 'Type of action performed',
  `action` VARCHAR(255) NOT NULL COMMENT 'Human-readable action description',
  `module` VARCHAR(100) NOT NULL COMMENT 'Module/system area (User Management, Patient Management, etc.)',
  `entity_type` VARCHAR(100) DEFAULT NULL COMMENT 'Type of entity affected (User, Patient, Ticket, etc.)',
  `entity_id` INT(11) DEFAULT NULL COMMENT 'ID of affected entity',
  `details` TEXT DEFAULT NULL COMMENT 'Detailed description of the action',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP address of the user',
  `user_agent` TEXT DEFAULT NULL COMMENT 'Browser/user agent information',
  `request_method` VARCHAR(10) DEFAULT NULL COMMENT 'HTTP method (GET, POST, PUT, DELETE)',
  `request_url` VARCHAR(500) DEFAULT NULL COMMENT 'API endpoint accessed',
  `status` ENUM('success', 'failed', 'warning') DEFAULT 'success' COMMENT 'Status of the action',
  `error_message` TEXT DEFAULT NULL COMMENT 'Error details if status is failed',
  `metadata` JSON DEFAULT NULL COMMENT 'Additional context data (before/after values, etc.)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action occurred',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_module` (`module`),
  INDEX `idx_entity_type` (`entity_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_user_created` (`user_id`, `created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

