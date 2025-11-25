-- Emergency Patient Transfers Management System Database Schema
-- This schema tracks patient transfers (internal/external)

-- ============================================
-- EMERGENCY PATIENT TRANSFERS TABLE
-- Track patient transfers (internal/external)
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_patient_transfers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_visits.id',
  `transfer_type` ENUM('internal', 'external') NOT NULL DEFAULT 'internal',
  
  -- Internal Transfer Fields
  `from_ward_id` INT(11) DEFAULT NULL COMMENT 'Source ward (FK to emergency_wards.id)',
  `from_bed_id` INT(11) DEFAULT NULL COMMENT 'Source bed (FK to emergency_ward_beds.id)',
  `to_ward_id` INT(11) DEFAULT NULL COMMENT 'Target ward (FK to emergency_wards.id)',
  `to_bed_id` INT(11) DEFAULT NULL COMMENT 'Target bed (FK to emergency_ward_beds.id)',
  
  -- External Transfer Fields
  `external_facility_name` VARCHAR(200) DEFAULT NULL COMMENT 'Receiving facility name',
  `external_facility_address` TEXT DEFAULT NULL COMMENT 'Receiving facility address',
  `external_facility_contact` VARCHAR(50) DEFAULT NULL COMMENT 'Receiving facility contact',
  `transport_mode` ENUM('Basic Ambulance', 'ALS Ambulance', 'Air Ambulance', 'Patient Transport Vehicle') DEFAULT NULL,
  
  -- Common Fields
  `reason` TEXT NOT NULL COMMENT 'Reason for transfer',
  `doctor_notes` TEXT DEFAULT NULL COMMENT 'Doctor''s notes or special instructions',
  `transfer_date` DATE NOT NULL,
  `transfer_time` TIME NOT NULL,
  `transferred_by` INT(11) DEFAULT NULL COMMENT 'User ID who processed transfer',
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_transfer_type` (`transfer_type`),
  INDEX `idx_from_ward` (`from_ward_id`),
  INDEX `idx_to_ward` (`to_ward_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_transfer_date` (`transfer_date`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_ward_id`) REFERENCES `emergency_wards`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`from_bed_id`) REFERENCES `emergency_ward_beds`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`to_ward_id`) REFERENCES `emergency_wards`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`to_bed_id`) REFERENCES `emergency_ward_beds`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`transferred_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
