-- Patient Payments Database Schema
-- Unified payment transaction table for all patient care flows (IPD, OPD, Emergency, Lab, Radiology)

-- ============================================
-- PATIENT PAYMENTS TABLE
-- Stores all patient payment transactions
-- ============================================
CREATE TABLE IF NOT EXISTS `patient_payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `payment_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique payment number (e.g., PAY-2024-00001)',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `bill_type` ENUM('ipd', 'opd', 'emergency', 'lab', 'radiology', 'advance') NOT NULL COMMENT 'Type of bill/invoice this payment is for',
  `bill_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to respective billing table (ipd_billing.id, opd_bills.id, etc.)',
  `payment_type` ENUM('advance', 'partial', 'full', 'refund') NOT NULL DEFAULT 'partial' COMMENT 'Type of payment',
  `payment_method` ENUM('cash', 'card', 'bank_transfer', 'cheque') NOT NULL DEFAULT 'cash' COMMENT 'Payment method',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Payment amount',
  `payment_date` DATE NOT NULL COMMENT 'Payment date',
  `payment_time` TIME DEFAULT NULL COMMENT 'Payment time',
  `transaction_id` VARCHAR(100) DEFAULT NULL COMMENT 'Transaction reference number (for card/bank transfer)',
  `bank_name` VARCHAR(100) DEFAULT NULL COMMENT 'Bank name (for bank transfer/cheque)',
  `cheque_number` VARCHAR(50) DEFAULT NULL COMMENT 'Cheque number (for cheque payments)',
  `cheque_date` DATE DEFAULT NULL COMMENT 'Cheque date (for cheque payments)',
  `receipt_number` VARCHAR(50) DEFAULT NULL COMMENT 'Receipt number (auto-generated)',
  `receipt_path` VARCHAR(255) DEFAULT NULL COMMENT 'PDF receipt file path',
  `payment_status` ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'completed' COMMENT 'Payment status',
  `notes` TEXT DEFAULT NULL COMMENT 'Payment notes',
  `processed_by` INT(11) DEFAULT NULL COMMENT 'User ID who processed the payment',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payment_number` (`payment_number`),
  UNIQUE KEY `unique_receipt_number` (`receipt_number`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_bill_type` (`bill_type`),
  INDEX `idx_bill_id` (`bill_id`),
  INDEX `idx_payment_date` (`payment_date`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_payment_method` (`payment_method`),
  INDEX `idx_payment_type` (`payment_type`),
  INDEX `idx_processed_by` (`processed_by`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PATIENT ADVANCE BALANCE TABLE
-- Tracks advance payments balance per patient
-- ============================================
CREATE TABLE IF NOT EXISTS `patient_advance_balance` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `patient_id` INT(11) NOT NULL UNIQUE COMMENT 'Foreign key to patients.id',
  `total_advance_paid` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total advance payments made',
  `total_advance_used` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total advance used against bills',
  `current_balance` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Current available advance balance',
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_patient_id` (`patient_id`),
  INDEX `idx_current_balance` (`current_balance`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

