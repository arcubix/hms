-- ============================================
-- IPD PRE-OPERATIVE CHECKLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_pre_op_checklist` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `admission_id` INT(11) NOT NULL,
  `patient_id` INT(11) NOT NULL,
  
  -- Patient Preparation
  `npo_status` BOOLEAN DEFAULT FALSE COMMENT 'Nothing Per Oral',
  `pre_op_medications_given` BOOLEAN DEFAULT FALSE,
  `blood_work_completed` BOOLEAN DEFAULT FALSE,
  `imaging_completed` BOOLEAN DEFAULT FALSE,
  `consent_signed` BOOLEAN DEFAULT FALSE,
  `patient_identified` BOOLEAN DEFAULT FALSE,
  
  -- Equipment Preparation
  `instruments_ready` BOOLEAN DEFAULT FALSE,
  `consumables_available` BOOLEAN DEFAULT FALSE,
  `equipment_tested` BOOLEAN DEFAULT FALSE,
  `implants_available` BOOLEAN DEFAULT FALSE,
  
  -- Team Preparation
  `team_briefed` BOOLEAN DEFAULT FALSE,
  `anesthesia_ready` BOOLEAN DEFAULT FALSE,
  
  -- Status
  `checklist_completed` BOOLEAN DEFAULT FALSE,
  `completed_by_user_id` INT(11) DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

