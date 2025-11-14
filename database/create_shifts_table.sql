-- Create shifts table (standalone script)
-- Run this if the shifts table doesn't exist

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
  FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for drawer_id only if cash_drawers table exists
-- If cash_drawers table doesn't exist, you can skip this or create cash_drawers first
-- Uncomment the following line if cash_drawers table exists:
-- ALTER TABLE `shifts` ADD FOREIGN KEY (`drawer_id`) REFERENCES `cash_drawers`(`id`) ON DELETE SET NULL;

