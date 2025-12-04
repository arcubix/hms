-- ============================================
-- SUPPORT TICKETS SYSTEM DATABASE SCHEMA
-- ============================================
-- This script creates tables for managing support tickets, comments, and attachments

-- ============================================
-- SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Format: TKT-YYYY-XXXXXX',
  `practice_id` VARCHAR(100) DEFAULT NULL COMMENT 'Practice/hospital identifier',
  `subject` VARCHAR(500) NOT NULL COMMENT 'Ticket subject/title',
  `module` VARCHAR(100) NOT NULL COMMENT 'Module where issue occurs',
  `description` TEXT NOT NULL COMMENT 'Detailed description of the issue',
  `status` ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `contact_number` VARCHAR(50) NOT NULL COMMENT 'Contact number of ticket creator',
  `assigned_to_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id - assigned support staff',
  `created_by_user_id` INT(11) NOT NULL COMMENT 'Foreign key to users.id - ticket creator',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when ticket was resolved',
  `closed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when ticket was closed',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Soft delete flag',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ticket_number` (`ticket_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_module` (`module`),
  INDEX `idx_assigned_to` (`assigned_to_user_id`),
  INDEX `idx_created_by` (`created_by_user_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUPPORT TICKET COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `support_ticket_comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) NOT NULL COMMENT 'Foreign key to support_tickets.id',
  `author_user_id` INT(11) NOT NULL COMMENT 'Foreign key to users.id - comment author',
  `author_name` VARCHAR(255) NOT NULL COMMENT 'Cached author name for display',
  `author_role` VARCHAR(100) DEFAULT NULL COMMENT 'Cached author role for display',
  `content` TEXT NOT NULL COMMENT 'Comment content',
  `type` ENUM('user', 'support') DEFAULT 'user' COMMENT 'Comment type: user or support team',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Soft delete flag',
  PRIMARY KEY (`id`),
  INDEX `idx_ticket_id` (`ticket_id`),
  INDEX `idx_author_user_id` (`author_user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUPPORT TICKET ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `support_ticket_attachments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) NOT NULL COMMENT 'Foreign key to support_tickets.id',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'Original file name',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'Server file path relative to base',
  `file_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME type (e.g., image/png, application/pdf)',
  `file_size` INT(11) DEFAULT NULL COMMENT 'File size in bytes',
  `uploaded_by_user_id` INT(11) NOT NULL COMMENT 'Foreign key to users.id - who uploaded the file',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Soft delete flag',
  PRIMARY KEY (`id`),
  INDEX `idx_ticket_id` (`ticket_id`),
  INDEX `idx_uploaded_by` (`uploaded_by_user_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

