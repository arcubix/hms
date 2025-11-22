-- Migration: Create doctor_rooms table for Fixed Room Mode
-- This table stores permanent room assignments for doctors

CREATE TABLE IF NOT EXISTS `doctor_rooms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` INT(11) NOT NULL COMMENT 'Foreign key to doctors.id',
  `room_id` INT(11) NOT NULL COMMENT 'Foreign key to rooms.id',
  `reception_id` INT(11) NOT NULL COMMENT 'Reception that generates tokens for this doctor',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this assignment is currently active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_room` (`doctor_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_reception_id` (`reception_id`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

