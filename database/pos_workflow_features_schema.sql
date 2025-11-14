-- POS Workflow Features Database Schema
-- This file adds tables for split payments, void transactions, cash drawer management, and shift management

-- ============================================
-- SALE PAYMENTS TABLE (For Split Payments)
-- ============================================
CREATE TABLE IF NOT EXISTS `sale_payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sale_id` INT(11) NOT NULL,
  `payment_method` ENUM('Cash', 'Card', 'Insurance', 'Credit', 'Wallet') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `reference_number` VARCHAR(100) DEFAULT NULL COMMENT 'Transaction reference, card number, etc.',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sale_id` (`sale_id`),
  INDEX `idx_payment_method` (`payment_method`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_payment_amount` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VOIDED SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `voided_sales` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sale_id` INT(11) NOT NULL,
  `void_reason` VARCHAR(255) NOT NULL,
  `void_type` ENUM('Error', 'Customer Request', 'System Error', 'Fraud', 'Other') NOT NULL DEFAULT 'Other',
  `voided_by` INT(11) NOT NULL COMMENT 'User who voided the sale',
  `authorized_by` INT(11) DEFAULT NULL COMMENT 'Manager who authorized the void',
  `stock_restored` TINYINT(1) DEFAULT 0 COMMENT 'Whether stock was restored',
  `notes` TEXT DEFAULT NULL,
  `voided_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sale_id` (`sale_id`),
  INDEX `idx_voided_by` (`voided_by`),
  INDEX `idx_authorized_by` (`authorized_by`),
  INDEX `idx_voided_at` (`voided_at`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`voided_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`authorized_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CASH DRAWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `cash_drawers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `drawer_number` VARCHAR(50) NOT NULL COMMENT 'Drawer identifier (e.g., DRAWER-01)',
  `location` VARCHAR(100) DEFAULT NULL COMMENT 'Physical location',
  `opening_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `closing_balance` DECIMAL(12,2) DEFAULT NULL,
  `expected_cash` DECIMAL(12,2) DEFAULT NULL COMMENT 'Expected cash based on transactions',
  `actual_cash` DECIMAL(12,2) DEFAULT NULL COMMENT 'Actual cash counted',
  `difference` DECIMAL(12,2) DEFAULT NULL COMMENT 'Difference between expected and actual',
  `status` ENUM('Open', 'Closed') NOT NULL DEFAULT 'Closed',
  `opened_by` INT(11) DEFAULT NULL,
  `closed_by` INT(11) DEFAULT NULL,
  `opened_at` DATETIME DEFAULT NULL,
  `closed_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_drawer_number` (`drawer_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_opened_at` (`opened_at`),
  INDEX `idx_closed_at` (`closed_at`),
  FOREIGN KEY (`opened_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`closed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CASH DROPS TABLE (Cash Drop/Pickup Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS `cash_drops` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `drawer_id` INT(11) NOT NULL,
  `drop_type` ENUM('Drop', 'Pickup') NOT NULL COMMENT 'Drop = remove cash, Pickup = add cash',
  `amount` DECIMAL(12,2) NOT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `processed_by` INT(11) NOT NULL,
  `authorized_by` INT(11) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_drawer_id` (`drawer_id`),
  INDEX `idx_drop_type` (`drop_type`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`drawer_id`) REFERENCES `cash_drawers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`authorized_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_drop_amount` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SHIFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `shift_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique shift identifier',
  `drawer_id` INT(11) DEFAULT NULL COMMENT 'Optional drawer reference',
  `cashier_id` INT(11) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `opening_cash` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `closing_cash` DECIMAL(12,2) DEFAULT NULL,
  `expected_cash` DECIMAL(12,2) DEFAULT NULL,
  `actual_cash` DECIMAL(12,2) DEFAULT NULL,
  `difference` DECIMAL(12,2) DEFAULT NULL,
  `total_sales` INT(11) DEFAULT 0 COMMENT 'Number of sales',
  `total_revenue` DECIMAL(12,2) DEFAULT 0.00,
  `cash_sales` DECIMAL(12,2) DEFAULT 0.00,
  `card_sales` DECIMAL(12,2) DEFAULT 0.00,
  `other_sales` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
  `handover_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_shift_number` (`shift_number`),
  INDEX `idx_drawer_id` (`drawer_id`),
  INDEX `idx_cashier_id` (`cashier_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_time` (`start_time`),
  INDEX `idx_end_time` (`end_time`),
  FOREIGN KEY (`drawer_id`) REFERENCES `cash_drawers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRICE OVERRIDES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `price_overrides` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sale_id` INT(11) DEFAULT NULL COMMENT 'Sale where override was applied',
  `sale_item_id` INT(11) DEFAULT NULL COMMENT 'Sale item where override was applied',
  `medicine_id` INT(11) NOT NULL,
  `original_price` DECIMAL(10,2) NOT NULL,
  `override_price` DECIMAL(10,2) NOT NULL,
  `override_reason` VARCHAR(255) NOT NULL,
  `requested_by` INT(11) NOT NULL,
  `authorized_by` INT(11) DEFAULT NULL,
  `authorized_at` DATETIME DEFAULT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sale_id` (`sale_id`),
  INDEX `idx_sale_item_id` (`sale_item_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_requested_by` (`requested_by`),
  INDEX `idx_authorized_by` (`authorized_by`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`sale_item_id`) REFERENCES `sale_items`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`authorized_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_override_price` CHECK (`override_price` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPDATE SALES TABLE (Add void status)
-- ============================================
ALTER TABLE `sales` 
  MODIFY COLUMN `status` ENUM('Completed', 'Pending', 'Cancelled', 'Refunded', 'Voided') NOT NULL DEFAULT 'Completed';

-- ============================================
-- UPDATE SALES TABLE (Add shift_id and drawer_id)
-- ============================================
ALTER TABLE `sales` 
  ADD COLUMN IF NOT EXISTS `shift_id` INT(11) DEFAULT NULL AFTER `cashier_id`,
  ADD COLUMN IF NOT EXISTS `drawer_id` INT(11) DEFAULT NULL AFTER `shift_id`,
  ADD INDEX `idx_shift_id` (`shift_id`),
  ADD INDEX `idx_drawer_id` (`drawer_id`),
  ADD FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE SET NULL,
  ADD FOREIGN KEY (`drawer_id`) REFERENCES `cash_drawers`(`id`) ON DELETE SET NULL;

