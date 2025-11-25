-- Emergency Health & Physical Examination Management System Database Schema
-- This schema manages Health & Physical (H&P) examination records for emergency patients

-- ============================================
-- EMERGENCY HEALTH & PHYSICAL TABLE
-- Health & Physical examination records
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_health_physical` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_visits.id',
  `examination_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `chief_complaint` TEXT DEFAULT NULL COMMENT 'Chief complaint',
  `history_of_present_illness` TEXT DEFAULT NULL COMMENT 'HPI - History of present illness',
  `past_medical_history` TEXT DEFAULT NULL COMMENT 'Past medical history',
  `allergies` TEXT DEFAULT NULL COMMENT 'Known allergies',
  `medications` TEXT DEFAULT NULL COMMENT 'Current medications',
  `social_history` TEXT DEFAULT NULL COMMENT 'Social history',
  `family_history` TEXT DEFAULT NULL COMMENT 'Family history',
  `review_of_systems` TEXT DEFAULT NULL COMMENT 'Review of systems',
  `physical_examination` TEXT NOT NULL COMMENT 'Physical examination findings',
  `assessment` TEXT DEFAULT NULL COMMENT 'Assessment/Diagnosis',
  `plan` TEXT DEFAULT NULL COMMENT 'Treatment plan',
  `provider_id` INT(11) DEFAULT NULL COMMENT 'User ID of provider (doctor)',
  `provider_name` VARCHAR(255) DEFAULT NULL COMMENT 'Provider name (denormalized for quick access)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_examination_date` (`examination_date`),
  INDEX `idx_provider_id` (`provider_id`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

