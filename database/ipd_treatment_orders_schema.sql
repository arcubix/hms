-- IPD Treatment Orders Management System Database Schema
-- This schema manages treatment orders for IPD patients

-- ============================================
-- IPD TREATMENT ORDERS TABLE
-- Doctor's orders and prescriptions for IPD patients
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_treatment_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `order_date` DATE NOT NULL COMMENT 'Date when order was placed',
  `order_time` TIME NOT NULL COMMENT 'Time when order was placed',
  `ordered_by_doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to doctors.id',
  `order_type` ENUM('Medication', 'Procedure', 'Lab Test', 'Imaging', 'Diet', 'Physiotherapy', 'Consultation') NOT NULL,
  `order_details` TEXT NOT NULL COMMENT 'Detailed order instructions',
  `frequency` VARCHAR(100) DEFAULT NULL COMMENT 'Frequency (e.g., Once daily, Twice daily)',
  `duration` VARCHAR(100) DEFAULT NULL COMMENT 'Duration (e.g., 7 days, 2 weeks)',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `status` ENUM('pending', 'in-progress', 'completed', 'cancelled', 'on-hold') NOT NULL DEFAULT 'pending',
  `start_date` DATE DEFAULT NULL COMMENT 'Order start date',
  `end_date` DATE DEFAULT NULL COMMENT 'Order end date',
  `administered_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (who administered)',
  `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_order_date` (`order_date`),
  INDEX `idx_ordered_by` (`ordered_by_doctor_id`),
  INDEX `idx_order_type` (`order_type`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

