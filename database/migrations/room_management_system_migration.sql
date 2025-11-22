-- ============================================================================
-- ROOM MANAGEMENT SYSTEM MIGRATION
-- ============================================================================
-- This migration creates all tables and updates required for the dual-mode
-- room management system (Fixed and Dynamic modes) with floor-based tokens.
--
-- Migration Date: 2025-01-XX
-- ============================================================================

-- ============================================================================
-- STEP 1: Create doctor_rooms table for Fixed Room Mode
-- ============================================================================
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

-- ============================================================================
-- STEP 2: Create doctor_slot_rooms table for Dynamic Room Mode
-- ============================================================================
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

-- ============================================================================
-- STEP 3: Create system_settings table for global system configuration
-- ============================================================================
-- This table stores system-wide settings including room management mode

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique setting identifier',
  `setting_value` JSON NOT NULL COMMENT 'Setting value stored as JSON for flexibility',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT 'Settings category (general, opd, etc.)',
  `description` TEXT DEFAULT NULL COMMENT 'Description of what this setting does',
  `updated_by` INT(11) DEFAULT NULL COMMENT 'User who last updated this setting',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`),
  INDEX `idx_category` (`category`),
  INDEX `idx_updated_by` (`updated_by`),
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `category`, `description`) VALUES
('room_management_mode', '"Fixed"', 'opd', 'Room management mode: Fixed or Dynamic'),
('token_reset_daily', 'true', 'opd', 'Reset token numbers daily'),
('token_prefix_format', '"F{floor}-{reception}"', 'opd', 'Token prefix format: F{floor}-{reception}, {reception}, or {floor}')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- ============================================================================
-- STEP 4: Create tokens table for token tracking and management
-- ============================================================================
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

-- ============================================================================
-- STEP 5: Update appointments table to include room, reception, floor, and token references
-- ============================================================================
-- This adds support for floor-based token generation and room tracking

-- Check and add room_id column
SET @dbname = DATABASE();
SET @tablename = 'appointments';
SET @columnname = 'room_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT(11) DEFAULT NULL COMMENT ''Room assigned for this appointment''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add reception_id column
SET @columnname = 'reception_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT(11) DEFAULT NULL COMMENT ''Reception that generated token''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add floor_id column
SET @columnname = 'floor_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT(11) DEFAULT NULL COMMENT ''Floor for token generation''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add token_number column
SET @columnname = 'token_number';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20) DEFAULT NULL COMMENT ''Floor-based token number''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes (check if they exist first)
SET @indexname = 'idx_room_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (`room_id`)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_reception_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (`reception_id`)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_floor_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (`floor_id`)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_token_number';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (`token_number`)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key constraints (check if they exist first, then add)
-- Note: MySQL doesn't support IF EXISTS for DROP FOREIGN KEY, so we check first

-- Check and add fk_appointments_room
SET @constraintname = 'fk_appointments_room';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = 'appointments')
      AND (table_schema = @dbname)
      AND (constraint_name = @constraintname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE appointments ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add fk_appointments_reception
SET @constraintname = 'fk_appointments_reception';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = 'appointments')
      AND (table_schema = @dbname)
      AND (constraint_name = @constraintname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE appointments ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add fk_appointments_floor
SET @constraintname = 'fk_appointments_floor';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = 'appointments')
      AND (table_schema = @dbname)
      AND (constraint_name = @constraintname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE appointments ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================================
-- STEP 6: Update doctor_room_assignments table (optional - for backward compatibility)
-- ============================================================================
-- This is optional and can be used for backward compatibility

-- Check and add mode column
SET @tablename = 'doctor_room_assignments';
SET @columnname = 'mode';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(''Fixed'', ''Dynamic'') DEFAULT NULL COMMENT ''Assignment mode''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add is_primary column
SET @columnname = 'is_primary';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) DEFAULT 0 COMMENT ''Primary assignment in fixed mode''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables and updates have been applied successfully.
-- 
-- Next Steps:
-- 1. Verify all tables were created: doctor_rooms, doctor_slot_rooms, system_settings, tokens
-- 2. Verify appointments table has new columns: room_id, reception_id, floor_id, token_number
-- 3. Configure room management mode in System Settings (default: Fixed)
-- 4. Assign rooms to doctors based on selected mode
-- ============================================================================

