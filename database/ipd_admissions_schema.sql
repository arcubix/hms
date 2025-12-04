-- IPD Admissions Management System Database Schema
-- This schema manages IPD patient admissions

-- ============================================
-- IPD ADMISSIONS TABLE
-- Central table linking patients to IPD stays
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_admissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ipd_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique IPD number (e.g., IPD-2024-001234)',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `uhid` VARCHAR(50) DEFAULT NULL COMMENT 'Unique Health ID (from patients table)',
  `admission_date` DATE NOT NULL COMMENT 'Date of admission',
  `admission_time` TIME NOT NULL COMMENT 'Time of admission',
  `admission_type` ENUM('Emergency', 'Planned', 'Transfer', 'Referral') NOT NULL DEFAULT 'Planned',
  `department` VARCHAR(100) DEFAULT NULL COMMENT 'Department (e.g., Cardiology, Orthopedics)',
  `consulting_doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to doctors.id',
  `admitted_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (who admitted)',
  `ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id',
  `bed_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_beds.id',
  `room_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_rooms.id (for private rooms)',
  `diagnosis` TEXT DEFAULT NULL COMMENT 'Primary diagnosis',
  `estimated_duration` INT(3) DEFAULT NULL COMMENT 'Estimated stay duration in days',
  `actual_duration` INT(3) DEFAULT NULL COMMENT 'Actual stay duration in days (calculated)',
  `status` ENUM('admitted', 'under-treatment', 'critical', 'stable', 'discharged', 'absconded') NOT NULL DEFAULT 'admitted',
  `insurance_provider` VARCHAR(100) DEFAULT NULL COMMENT 'Insurance provider name',
  `insurance_policy_number` VARCHAR(100) DEFAULT NULL COMMENT 'Insurance policy number',
  `insurance_coverage_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Insurance coverage amount',
  `insurance_approval_number` VARCHAR(100) DEFAULT NULL COMMENT 'TPA approval number',
  `advance_payment` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Advance payment received',
  `payment_mode` ENUM('Cash', 'Card', 'UPI', 'Insurance', 'Cheque') DEFAULT NULL COMMENT 'Payment mode for advance',
  `discharge_date` DATE DEFAULT NULL COMMENT 'Date of discharge',
  `discharge_time` TIME DEFAULT NULL COMMENT 'Time of discharge',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ipd_number` (`ipd_number`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_uhid` (`uhid`),
  INDEX `idx_admission_date` (`admission_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_consulting_doctor` (`consulting_doctor_id`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_bed_id` (`bed_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_department` (`department`),
  INDEX `idx_admission_type` (`admission_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

