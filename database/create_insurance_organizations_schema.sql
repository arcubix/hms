-- Insurance Companies & Organizations Database Schema
-- This table stores both insurance companies and corporate organizations

CREATE TABLE IF NOT EXISTS `insurance_organizations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('insurance', 'organization') NOT NULL DEFAULT 'insurance',
  `policy_prefix` VARCHAR(50) DEFAULT NULL COMMENT 'For insurance companies (e.g., BCBS, UHC)',
  `account_prefix` VARCHAR(50) DEFAULT NULL COMMENT 'For organizations (e.g., TECH, GMI)',
  `contact_person` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `credit_allowance` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Credit limit for the insurance/organization',
  `discount_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Discount percentage (0-100)',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `contract_date` DATE DEFAULT NULL COMMENT 'Contract start date',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_policy_prefix` (`policy_prefix`),
  INDEX `idx_account_prefix` (`account_prefix`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

