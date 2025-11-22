-- Migration: Create tokens table for token tracking and management
-- This table stores floor-based token information separate from appointments

CREATE TABLE IF NOT EXISTS `tokens` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `token_number` VARCHAR(20) NOT NULL COMMENT 'Token number (e.g., F1-REC001-001)',
  `appointment_id` INT(11) NOT NULL COMMENT 'Foreign key to appointments.id',
  `reception_id` INT(11) NOT NULL COMMENT 'Foreign key to receptions.id',
  `floor_id` INT(11) NOT NULL COMMENT 'Foreign key to floors.id',
  `room_id` INT(11) NOT NULL COMMENT 'Foreign key to rooms.id',
  `doctor_id` INT(11) NOT NULL COMMENT 'Foreign key to doctors.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `token_date` DATE NOT NULL COMMENT 'Date for which token was generated',
  `status` ENUM('Waiting', 'In Progress', 'Completed', 'Cancelled', 'No Show') NOT NULL DEFAULT 'Waiting',
  `called_at` DATETIME DEFAULT NULL COMMENT 'When token was called',
  `completed_at` DATETIME DEFAULT NULL COMMENT 'When token was completed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token_reception_date` (`token_number`, `reception_id`, `token_date`),
  INDEX `idx_appointment_id` (`appointment_id`),
  INDEX `idx_reception_id` (`reception_id`),
  INDEX `idx_floor_id` (`floor_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_token_date` (`token_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_reception_date_status` (`reception_id`, `token_date`, `status`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

