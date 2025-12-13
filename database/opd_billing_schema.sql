-- OPD Billing Database Schema
-- Manages billing for OPD consultations and services

-- ============================================
-- OPD BILLS TABLE
-- Stores OPD bills/invoices
-- ============================================
CREATE TABLE IF NOT EXISTS `opd_bills` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bill_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique bill number (e.g., OPD-2024-00001)',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `appointment_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to appointments.id (if applicable)',
  `consultation_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to consultations.id (if applicable)',
  `bill_date` DATE NOT NULL COMMENT 'Bill date',
  `consultation_fee` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Consultation fee',
  `procedure_fees` JSON DEFAULT NULL COMMENT 'Procedure fees breakdown (procedure name, amount)',
  `lab_charges` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total laboratory test charges',
  `radiology_charges` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total radiology/imaging charges',
  `medication_charges` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Medication charges (if applicable)',
  `other_charges` JSON DEFAULT NULL COMMENT 'Other charges (description, amount)',
  `subtotal` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Subtotal before discount and tax',
  `discount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Discount amount',
  `discount_percentage` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Discount percentage',
  `tax_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Tax rate percentage',
  `tax_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Tax amount',
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total amount after discount and tax',
  `advance_applied` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Advance payment applied',
  `insurance_covered` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Amount covered by insurance',
  `paid_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Amount paid so far',
  `due_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Due amount',
  `payment_status` ENUM('pending', 'partial', 'paid', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Payment status',
  `notes` TEXT DEFAULT NULL COMMENT 'Bill notes',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the bill',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bill_number` (`bill_number`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_appointment_id` (`appointment_id`),
  INDEX `idx_consultation_id` (`consultation_id`),
  INDEX `idx_bill_date` (`bill_date`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- OPD BILL ITEMS TABLE
-- Detailed line items for OPD bills
-- ============================================
CREATE TABLE IF NOT EXISTS `opd_bill_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bill_id` INT(11) NOT NULL COMMENT 'Foreign key to opd_bills.id',
  `item_type` ENUM('consultation', 'procedure', 'lab_test', 'radiology_test', 'medication', 'other') NOT NULL COMMENT 'Type of item',
  `item_name` VARCHAR(255) NOT NULL COMMENT 'Item name/description',
  `item_id` INT(11) DEFAULT NULL COMMENT 'Reference ID (procedure_id, test_id, etc.)',
  `quantity` INT(11) DEFAULT 1 COMMENT 'Quantity',
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT 'Unit price',
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT 'Total amount (quantity * unit_price)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_bill_id` (`bill_id`),
  INDEX `idx_item_type` (`item_type`),
  FOREIGN KEY (`bill_id`) REFERENCES `opd_bills`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

