-- User Permissions System Database Schema (Normalized)
-- This file creates tables for role-based permission management
-- Permissions are stored uniquely and referenced by ID

-- ============================================
-- PERMISSION DEFINITIONS TABLE
-- ============================================
-- Master list of all available permissions in the system (unique, no role prefixes)
CREATE TABLE IF NOT EXISTS `permission_definitions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `permission_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique permission identifier (e.g., edit_lab_reports)',
  `permission_name` VARCHAR(255) NOT NULL COMMENT 'Human-readable permission name',
  `description` TEXT DEFAULT NULL COMMENT 'Permission description',
  `category` VARCHAR(50) DEFAULT NULL COMMENT 'Permission category for grouping (patient, invoice, lab, etc.)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_permission_key` (`permission_key`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLE PERMISSIONS TABLE
-- ============================================
-- Default permissions for each role (using permission_id instead of permission_key)
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `role` VARCHAR(50) NOT NULL COMMENT 'Role name',
  `permission_id` INT(11) NOT NULL COMMENT 'Permission ID from permission_definitions',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role`, `permission_id`),
  INDEX `idx_role` (`role`),
  INDEX `idx_permission_id` (`permission_id`),
  FOREIGN KEY (`permission_id`) REFERENCES `permission_definitions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER CUSTOM PERMISSIONS TABLE
-- ============================================
-- Custom permission overrides for specific users (using permission_id)
CREATE TABLE IF NOT EXISTS `user_custom_permissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `permission_id` INT(11) NOT NULL COMMENT 'Permission ID from permission_definitions',
  `granted` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = granted, 0 = denied',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_permission` (`user_id`, `permission_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_permission_id` (`permission_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permission_definitions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

