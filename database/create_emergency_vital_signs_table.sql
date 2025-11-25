-- Create Emergency Vital Signs Table
-- Run this SQL script in your database to create the emergency_vital_signs table

CREATE TABLE IF NOT EXISTS `emergency_vital_signs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL,
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `recorded_by` INT(11) DEFAULT NULL COMMENT 'User ID who recorded (nurse/doctor)',
  `bp` VARCHAR(20) DEFAULT NULL COMMENT 'Blood Pressure (e.g., 120/80)',
  `pulse` INT(3) DEFAULT NULL COMMENT 'Pulse rate (bpm)',
  `temp` DECIMAL(4,1) DEFAULT NULL COMMENT 'Temperature (°F)',
  `spo2` INT(3) DEFAULT NULL COMMENT 'SpO2 (%)',
  `resp` INT(3) DEFAULT NULL COMMENT 'Respiratory Rate',
  `pain_score` INT(2) DEFAULT NULL COMMENT 'Pain score 0-10',
  `consciousness_level` ENUM('Alert', 'Drowsy', 'Confused', 'Unconscious') DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_recorded_at` (`recorded_at`),
  INDEX `idx_recorded_by` (`recorded_by`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

