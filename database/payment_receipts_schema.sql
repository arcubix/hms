-- Payment Receipts Database Schema
-- Manages payment receipt generation and storage

-- ============================================
-- PAYMENT RECEIPTS TABLE
-- Stores receipt generation metadata and links
-- ============================================
CREATE TABLE IF NOT EXISTS `payment_receipts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique receipt number (e.g., RCPT-2024-00001)',
  `payment_id` INT(11) NOT NULL COMMENT 'Foreign key to patient_payments.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `receipt_date` DATE NOT NULL COMMENT 'Receipt date',
  `receipt_path` VARCHAR(255) DEFAULT NULL COMMENT 'PDF receipt file path',
  `receipt_url` VARCHAR(255) DEFAULT NULL COMMENT 'Receipt URL (if stored externally)',
  `template_type` VARCHAR(50) DEFAULT 'standard' COMMENT 'Receipt template type',
  `generated_by` INT(11) DEFAULT NULL COMMENT 'User ID who generated the receipt',
  `is_emailed` TINYINT(1) DEFAULT 0 COMMENT 'Whether receipt was emailed to patient',
  `is_sms_sent` TINYINT(1) DEFAULT 0 COMMENT 'Whether receipt SMS was sent',
  `email_sent_at` DATETIME DEFAULT NULL COMMENT 'When receipt was emailed',
  `sms_sent_at` DATETIME DEFAULT NULL COMMENT 'When receipt SMS was sent',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_receipt_number` (`receipt_number`),
  INDEX `idx_payment_id` (`payment_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_receipt_date` (`receipt_date`),
  FOREIGN KEY (`payment_id`) REFERENCES `patient_payments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

