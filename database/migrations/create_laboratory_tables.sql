-- ============================================
-- LABORATORY MODULE - COMPLETE MIGRATION
-- Run this script to create all required tables for Laboratory Management
-- ============================================

-- ============================================
-- 1. ENHANCE lab_tests TABLE
-- ============================================
-- Note: Run these ALTER statements only if columns don't exist
-- Check manually or use a migration script wrapper

-- Enhance lab_tests table (columns will be checked before adding by migration script)
-- Note: Run migrate_laboratory_tables.php to safely execute this migration

ALTER TABLE `lab_tests`
ADD COLUMN `price` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Test price';

ALTER TABLE `lab_tests`
ADD COLUMN `tat_hours` INT(11) DEFAULT NULL COMMENT 'Turnaround time in hours';

ALTER TABLE `lab_tests`
ADD COLUMN `sample_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Whole Blood, Serum, Urine, Stool';

ALTER TABLE `lab_tests`
ADD COLUMN `sample_volume` VARCHAR(50) DEFAULT NULL COMMENT 'e.g., 2-3 ml, 10 ml';

ALTER TABLE `lab_tests`
ADD COLUMN `container_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., EDTA Tube, Red Top Tube, Sterile Container';

ALTER TABLE `lab_tests`
ADD COLUMN `methodology` VARCHAR(255) DEFAULT NULL COMMENT 'e.g., Automated Cell Counter, Enzymatic Method, HPLC';

ALTER TABLE `lab_tests`
ADD COLUMN `critical_range_low` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Critical value lower limit';

ALTER TABLE `lab_tests`
ADD COLUMN `critical_range_high` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Critical value upper limit';

-- Add indexes for new fields
ALTER TABLE `lab_tests`
ADD INDEX `idx_price` (`price`);

ALTER TABLE `lab_tests`
ADD INDEX `idx_sample_type` (`sample_type`);

-- ============================================
-- 2. LAB ORDERS TABLE (Unified for OPD/IPD/Emergency/Walk-in)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'LAB-YYYY-XXXXX',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `order_type` ENUM('OPD', 'IPD', 'Emergency', 'Walk-in') NOT NULL COMMENT 'Source of order',
  `order_source_id` INT(11) DEFAULT NULL COMMENT 'prescription_id, admission_id, or visit_id depending on order_type',
  `ordered_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `order_date` DATE NOT NULL COMMENT 'Order date',
  `order_time` TIME NOT NULL COMMENT 'Order time',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `status` ENUM('ordered', 'sample-collected', 'sample-received', 'in-progress', 'results-entered', 'tech-verified', 'supervisor-approved', 'pathologist-signed', 'reported', 'completed', 'cancelled') NOT NULL DEFAULT 'ordered',
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `tax` DECIMAL(10, 2) DEFAULT 0.00,
  `paid_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `payment_status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`order_number`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_order_type` (`order_type`),
  INDEX `idx_order_source_id` (`order_source_id`),
  INDEX `idx_ordered_by_user_id` (`ordered_by_user_id`),
  INDEX `idx_order_date` (`order_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ordered_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. LAB ORDER TESTS TABLE (Individual tests in an order)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_order_tests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_orders.id',
  `lab_test_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_tests.id',
  `test_name` VARCHAR(255) NOT NULL COMMENT 'Test name (can be custom or from lab_tests)',
  `test_code` VARCHAR(50) DEFAULT NULL COMMENT 'Test code',
  `price` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Test price at time of order',
  `status` ENUM('ordered', 'sample-collected', 'sample-received', 'in-progress', 'results-entered', 'tech-verified', 'supervisor-approved', 'pathologist-signed', 'reported', 'completed', 'cancelled') NOT NULL DEFAULT 'ordered',
  `sample_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_samples.id',
  `result_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_results.id',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `instructions` TEXT DEFAULT NULL COMMENT 'Special instructions',
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_lab_test_id` (`lab_test_id`),
  INDEX `idx_sample_id` (`sample_id`),
  INDEX `idx_result_id` (`result_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`order_id`) REFERENCES `lab_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. LAB SAMPLES TABLE (Sample collection tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_samples` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sample_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SMP-YYYY-XXXXX',
  `barcode` VARCHAR(100) DEFAULT NULL UNIQUE COMMENT 'Barcode for sample tracking',
  `order_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_orders.id',
  `order_test_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_order_tests.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `test_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_tests.id',
  `sample_type` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Whole Blood, Serum, Urine',
  `collection_date` DATE DEFAULT NULL COMMENT 'Sample collection date',
  `collection_time` TIME DEFAULT NULL COMMENT 'Sample collection time',
  `collected_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (nurse/phlebotomist)',
  `status` ENUM('pending', 'collected', 'received', 'processing', 'tested', 'stored', 'disposed') NOT NULL DEFAULT 'pending',
  `condition` ENUM('good', 'hemolyzed', 'clotted', 'insufficient', 'contaminated', 'expired') DEFAULT NULL COMMENT 'Sample condition',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Storage location',
  `remarks` TEXT DEFAULT NULL,
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sample_id` (`sample_id`),
  UNIQUE KEY `uk_barcode` (`barcode`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_order_test_id` (`order_test_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_test_id` (`test_id`),
  INDEX `idx_collected_by_user_id` (`collected_by_user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_collection_date` (`collection_date`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`order_id`) REFERENCES `lab_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_test_id`) REFERENCES `lab_order_tests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`test_id`) REFERENCES `lab_tests`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`collected_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. LAB RESULTS TABLE (Test results with validation workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_results` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `result_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'RES-YYYY-XXXXX',
  `order_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_orders.id',
  `order_test_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_order_tests.id',
  `sample_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_samples.id',
  `test_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_tests.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `result_data` JSON DEFAULT NULL COMMENT 'Structured result data',
  `status` ENUM('pending', 'entered', 'tech-verified', 'supervisor-approved', 'pathologist-signed') NOT NULL DEFAULT 'pending',
  `entered_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (lab technician)',
  `entered_at` TIMESTAMP NULL DEFAULT NULL,
  `verified_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (lab technician/supervisor)',
  `verified_at` TIMESTAMP NULL DEFAULT NULL,
  `approved_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (pathologist/supervisor)',
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  `is_critical` BOOLEAN DEFAULT FALSE COMMENT 'Critical value flag',
  `is_abnormal` BOOLEAN DEFAULT FALSE COMMENT 'Abnormal value flag',
  `comments` TEXT DEFAULT NULL COMMENT 'Result comments/notes',
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_result_id` (`result_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_order_test_id` (`order_test_id`),
  INDEX `idx_sample_id` (`sample_id`),
  INDEX `idx_test_id` (`test_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_entered_by_user_id` (`entered_by_user_id`),
  INDEX `idx_verified_by_user_id` (`verified_by_user_id`),
  INDEX `idx_approved_by_user_id` (`approved_by_user_id`),
  INDEX `idx_is_critical` (`is_critical`),
  INDEX `idx_is_abnormal` (`is_abnormal`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`order_id`) REFERENCES `lab_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_test_id`) REFERENCES `lab_order_tests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sample_id`) REFERENCES `lab_samples`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`test_id`) REFERENCES `lab_tests`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`entered_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. LAB RESULT VALUES TABLE (Individual result parameters)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_result_values` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `result_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_results.id',
  `parameter_name` VARCHAR(255) NOT NULL COMMENT 'e.g., WBC, RBC, Hemoglobin',
  `result_value` VARCHAR(255) NOT NULL COMMENT 'Result value',
  `unit` VARCHAR(50) DEFAULT NULL COMMENT 'e.g., x10^9/L, g/dL, mg/dL',
  `normal_range` VARCHAR(255) DEFAULT NULL COMMENT 'Normal range for this parameter',
  `is_abnormal` BOOLEAN DEFAULT FALSE COMMENT 'Whether value is outside normal range',
  `is_critical` BOOLEAN DEFAULT FALSE COMMENT 'Whether value is critical',
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_result_id` (`result_id`),
  INDEX `idx_parameter_name` (`parameter_name`),
  INDEX `idx_is_abnormal` (`is_abnormal`),
  INDEX `idx_is_critical` (`is_critical`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`result_id`) REFERENCES `lab_results`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. LAB REPORTS TABLE (Generated reports)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_reports` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'RPT-YYYY-XXXXX',
  `order_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_orders.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `report_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Report number for display',
  `generated_date` DATE NOT NULL,
  `generated_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `status` ENUM('draft', 'final', 'printed', 'emailed', 'cancelled') NOT NULL DEFAULT 'draft',
  `file_path` VARCHAR(500) DEFAULT NULL COMMENT 'Path to PDF file',
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_report_id` (`report_id`),
  UNIQUE KEY `uk_report_number` (`report_number`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_generated_by_user_id` (`generated_by_user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_generated_date` (`generated_date`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`order_id`) REFERENCES `lab_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`generated_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. LAB INSTRUMENTS TABLE (Instrument management)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_instruments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `instrument_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'INS-YYYY-XXXXX',
  `name` VARCHAR(255) NOT NULL COMMENT 'Instrument name',
  `model` VARCHAR(255) DEFAULT NULL COMMENT 'Model number',
  `serial_number` VARCHAR(100) DEFAULT NULL UNIQUE COMMENT 'Serial number',
  `department` VARCHAR(100) DEFAULT NULL COMMENT 'Department/lab section',
  `status` ENUM('operational', 'maintenance', 'down', 'calibration') NOT NULL DEFAULT 'operational',
  `last_maintenance` DATE DEFAULT NULL COMMENT 'Last maintenance date',
  `next_maintenance` DATE DEFAULT NULL COMMENT 'Next scheduled maintenance',
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_instrument_id` (`instrument_id`),
  UNIQUE KEY `uk_serial_number` (`serial_number`),
  INDEX `idx_department` (`department`),
  INDEX `idx_status` (`status`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. LAB QUALITY CONTROL TABLE (QC records)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_quality_control` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `qc_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'QC-YYYY-XXXXX',
  `test_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_tests.id',
  `instrument_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to lab_instruments.id',
  `control_level` ENUM('Level 1', 'Level 2', 'Level 3') NOT NULL COMMENT 'QC control level',
  `expected_value` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Expected QC value',
  `observed_value` DECIMAL(10, 2) NOT NULL COMMENT 'Observed QC value',
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `performed_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `status` ENUM('pass', 'fail', 'warning') NOT NULL DEFAULT 'pass',
  `comments` TEXT DEFAULT NULL,
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_qc_id` (`qc_id`),
  INDEX `idx_test_id` (`test_id`),
  INDEX `idx_instrument_id` (`instrument_id`),
  INDEX `idx_performed_by_user_id` (`performed_by_user_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`test_id`) REFERENCES `lab_tests`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`instrument_id`) REFERENCES `lab_instruments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`performed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 10. LAB BILLING TABLE (Lab-specific billing)
-- ============================================
CREATE TABLE IF NOT EXISTS `lab_billing` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `billing_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'LAB-BILL-YYYY-XXXXX',
  `order_id` INT(11) NOT NULL COMMENT 'Foreign key to lab_orders.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `tax` DECIMAL(10, 2) DEFAULT 0.00,
  `paid_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `due_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `payment_status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  `billing_date` DATE NOT NULL,
  `opd_bill_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to opd_bills.id if OPD order',
  `ipd_billing_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_billing.id if IPD order',
  `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_billing_id` (`billing_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_billing_date` (`billing_date`),
  INDEX `idx_opd_bill_id` (`opd_bill_id`),
  INDEX `idx_ipd_billing_id` (`ipd_billing_id`),
  INDEX `idx_organization_id` (`organization_id`),
  FOREIGN KEY (`order_id`) REFERENCES `lab_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created/enhanced:
-- 1. lab_tests (enhanced with pricing, TAT, sample details)
-- 2. lab_orders (unified orders table)
-- 3. lab_order_tests (individual tests in orders)
-- 4. lab_samples (sample collection tracking)
-- 5. lab_results (test results with validation workflow)
-- 6. lab_result_values (individual result parameters)
-- 7. lab_reports (generated reports)
-- 8. lab_quality_control (QC records)
-- 9. lab_instruments (instrument management)
-- 10. lab_billing (lab-specific billing)
-- ============================================

