-- Donation Payments Database Schema
-- Stores payment records for donations

CREATE TABLE IF NOT EXISTS `donation_payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `donor_id` INT(11) NOT NULL COMMENT 'FK to donation_donors',
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` ENUM('cash', 'card', 'bank-transfer', 'cheque', 'online') NOT NULL DEFAULT 'cash',
  `transaction_id` VARCHAR(100) DEFAULT NULL COMMENT 'Transaction ID for card/bank/online payments',
  `cheque_number` VARCHAR(50) DEFAULT NULL COMMENT 'Cheque number for cheque payments',
  `bank_name` VARCHAR(255) DEFAULT NULL COMMENT 'Bank name for cheque/bank transfer',
  `purpose` VARCHAR(255) DEFAULT NULL COMMENT 'Purpose of donation',
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique receipt number',
  `status` ENUM('completed', 'pending', 'failed') NOT NULL DEFAULT 'completed',
  `notes` TEXT DEFAULT NULL,
  `processed_by` INT(11) DEFAULT NULL COMMENT 'User ID who processed the payment',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_receipt_number` (`receipt_number`),
  INDEX `idx_donor` (`donor_id`),
  INDEX `idx_payment_date` (`payment_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_receipt_number` (`receipt_number`),
  FOREIGN KEY (`donor_id`) REFERENCES `donation_donors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

