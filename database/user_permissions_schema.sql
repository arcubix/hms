-- User Permissions System Database Schema
-- This file creates tables for role-based permission management

-- ============================================
-- PERMISSION DEFINITIONS TABLE
-- ============================================
-- Master list of all available permissions in the system
CREATE TABLE IF NOT EXISTS `permission_definitions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `permission_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique permission identifier',
  `permission_name` VARCHAR(255) NOT NULL COMMENT 'Human-readable permission name',
  `description` TEXT DEFAULT NULL COMMENT 'Permission description',
  `category` VARCHAR(50) DEFAULT NULL COMMENT 'Permission category (doctor, admin, lab, etc.)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_permission_key` (`permission_key`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLE PERMISSIONS TABLE
-- ============================================
-- Default permissions for each role
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `role` VARCHAR(50) NOT NULL COMMENT 'Role name',
  `permission_key` VARCHAR(100) NOT NULL COMMENT 'Permission key from permission_definitions',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role`, `permission_key`),
  INDEX `idx_role` (`role`),
  INDEX `idx_permission_key` (`permission_key`),
  FOREIGN KEY (`permission_key`) REFERENCES `permission_definitions`(`permission_key`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER CUSTOM PERMISSIONS TABLE
-- ============================================
-- Custom permission overrides for specific users
CREATE TABLE IF NOT EXISTS `user_custom_permissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `permission_key` VARCHAR(100) NOT NULL COMMENT 'Permission key from permission_definitions',
  `granted` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = granted, 0 = denied',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_permission` (`user_id`, `permission_key`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_permission_key` (`permission_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_key`) REFERENCES `permission_definitions`(`permission_key`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

