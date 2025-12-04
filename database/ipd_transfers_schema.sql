-- IPD Bed/Room Transfer History Management System Database Schema
-- This schema tracks patient transfers between beds and rooms

-- ============================================
-- IPD TRANSFERS TABLE
-- History of bed/room transfers for IPD patients
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_transfers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `transfer_date` DATE NOT NULL COMMENT 'Date of transfer',
  `transfer_time` TIME NOT NULL COMMENT 'Time of transfer',
  `from_ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id (source ward)',
  `from_bed_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_beds.id (source bed)',
  `from_room_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_rooms.id (source room)',
  `to_ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id (destination ward)',
  `to_bed_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_beds.id (destination bed)',
  `to_room_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_rooms.id (destination room)',
  `transfer_reason` TEXT DEFAULT NULL COMMENT 'Reason for transfer',
  `transferred_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (who transferred)',
  `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_transfer_date` (`transfer_date`),
  INDEX `idx_from_ward` (`from_ward_id`),
  INDEX `idx_to_ward` (`to_ward_id`),
  INDEX `idx_from_bed` (`from_bed_id`),
  INDEX `idx_to_bed` (`to_bed_id`),
  INDEX `idx_from_room` (`from_room_id`),
  INDEX `idx_to_room` (`to_room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

