-- Migration: Create doctor_slot_rooms table for Dynamic Room Mode
-- This table stores room assignments per slot per date for doctors

CREATE TABLE IF NOT EXISTS `doctor_slot_rooms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` INT(11) NOT NULL COMMENT 'Foreign key to doctors.id',
  `schedule_id` INT(11) NOT NULL COMMENT 'Reference to doctor_schedules.id',
  `room_id` INT(11) NOT NULL COMMENT 'Foreign key to rooms.id',
  `assignment_date` DATE NOT NULL COMMENT 'Date for this room assignment',
  `reception_id` INT(11) NOT NULL COMMENT 'Reception that generates tokens for this assignment',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this assignment is currently active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_slot_date` (`doctor_id`, `schedule_id`, `assignment_date`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_schedule_id` (`schedule_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_assignment_date` (`assignment_date`),
  INDEX `idx_reception_id` (`reception_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_doctor_date` (`doctor_id`, `assignment_date`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`schedule_id`) REFERENCES `doctor_schedules`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

