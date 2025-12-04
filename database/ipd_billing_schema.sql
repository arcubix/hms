-- IPD Billing Management System Database Schema
-- This schema manages billing for IPD patients

-- ============================================
-- IPD BILLING TABLE
-- Detailed billing and payment information
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_billing` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `billing_date` DATE NOT NULL COMMENT 'Billing date',
  `room_charges` JSON DEFAULT NULL COMMENT 'Room charges breakdown (bed/room type, days, rate, total)',
  `consultation_charges` JSON DEFAULT NULL COMMENT 'Consultation charges (doctor, visits, rate, total)',
  `medication_charges` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total medication charges',
  `lab_charges` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total laboratory test charges',
  `imaging_charges` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total imaging/radiology charges',
  `procedure_charges` JSON DEFAULT NULL COMMENT 'Procedure charges (procedure name, date, amount)',
  `other_charges` JSON DEFAULT NULL COMMENT 'Other charges (description, amount)',
  `subtotal` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Subtotal before discount and tax',
  `discount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Discount amount',
  `tax` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Tax amount',
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total amount after discount and tax',
  `advance_paid` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Advance payment already made',
  `insurance_covered` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Amount covered by insurance',
  `due_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Due amount (total - advance - insurance)',
  `payment_status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_billing_date` (`billing_date`),
  INDEX `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

