-- Donation Donors Database Schema
-- Stores information about individual and corporate donors

CREATE TABLE IF NOT EXISTS `donation_donors` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `donor_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique donor identifier (e.g., DN001)',
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('individual', 'corporate') NOT NULL DEFAULT 'individual',
  `cnic` VARCHAR(20) DEFAULT NULL COMMENT 'CNIC/National ID for individual donors',
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'Pakistan',
  `total_donated` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Total amount donated',
  `last_donation` DATE DEFAULT NULL COMMENT 'Date of last donation',
  `frequency` ENUM('one-time', 'monthly', 'yearly') NOT NULL DEFAULT 'one-time',
  `tax_exempt` TINYINT(1) DEFAULT 0 COMMENT 'Tax exempt status',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_donor_id` (`donor_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

