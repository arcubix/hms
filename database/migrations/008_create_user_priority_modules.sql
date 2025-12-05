-- Migration: Create user_priority_modules table
-- This table stores user-specific priority module selections

CREATE TABLE IF NOT EXISTS `user_priority_modules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL COMMENT 'Foreign key to users table',
  `module_id` VARCHAR(50) NOT NULL COMMENT 'Foreign key to modules table',
  `position` INT(2) NOT NULL COMMENT 'Position in priority list (1-7)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_module` (`user_id`, `module_id`),
  UNIQUE KEY `unique_user_position` (`user_id`, `position`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_module_id` (`module_id`),
  INDEX `idx_position` (`position`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`module_id`) REFERENCES `modules`(`module_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

