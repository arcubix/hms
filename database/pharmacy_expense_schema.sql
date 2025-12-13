-- Pharmacy Expense Management Database Schema
-- This file extends the existing HMS schema with pharmacy expense management functionality

-- ============================================
-- EXPENSE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `pharmacy_expense_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL COMMENT 'Color code for UI display',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT 'Icon name for UI display',
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_name` (`name`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default expense categories
INSERT INTO `pharmacy_expense_categories` (`name`, `description`, `color`, `icon`, `status`) VALUES
('Utilities', 'Electricity, water, gas bills', 'blue', 'Zap', 'Active'),
('Salaries', 'Staff salaries and wages', 'green', 'Users', 'Active'),
('Rent', 'Office and facility rent', 'purple', 'Building', 'Active'),
('Maintenance', 'Equipment and facility maintenance', 'orange', 'Wrench', 'Active'),
('Office Supplies', 'Stationery and office materials', 'pink', 'FileText', 'Active'),
('Marketing', 'Advertising and promotional expenses', 'cyan', 'Megaphone', 'Active'),
('Transport', 'Transportation and fuel costs', 'yellow', 'Truck', 'Active'),
('Other', 'Miscellaneous expenses', 'gray', 'MoreHorizontal', 'Active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ============================================
-- PHARMACY EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `pharmacy_expenses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `expense_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique expense number (e.g., EXP-2024-001)',
  `category_id` INT(11) NOT NULL,
  `expense_date` DATE NOT NULL,
  `description` TEXT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'Debit Card', 'Other') NOT NULL DEFAULT 'Cash',
  `reference_number` VARCHAR(100) DEFAULT NULL COMMENT 'Transaction reference, cheque number, etc.',
  `receipt_file` VARCHAR(255) DEFAULT NULL COMMENT 'Path to uploaded receipt/invoice file',
  `status` ENUM('Paid', 'Pending') NOT NULL DEFAULT 'Paid',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_expense_number` (`expense_number`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_expense_date` (`expense_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_method` (`payment_method`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`category_id`) REFERENCES `pharmacy_expense_categories`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

