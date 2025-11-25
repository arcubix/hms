-- Create Emergency Medication Administration Table
-- Run this SQL script in your database to create the emergency_medication_administration table

CREATE TABLE IF NOT EXISTS `emergency_medication_administration` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL COMMENT 'e.g., 500mg, 10ml',
  `route` ENUM('IV', 'IM', 'PO', 'Sublingual', 'Topical', 'Inhalation', 'Other') NOT NULL DEFAULT 'PO',
  `frequency` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Q6H, TID, Once',
  `administered_by` INT(11) DEFAULT NULL COMMENT 'Nurse/Doctor ID who administered',
  `administered_at` DATETIME DEFAULT NULL,
  `status` ENUM('pending', 'given', 'missed', 'refused') NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_administered_at` (`administered_at`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`administered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

