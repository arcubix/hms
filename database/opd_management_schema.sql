-- OPD Management System Database Schema
-- This schema extends the existing HMS database with OPD room, floor, department, and reception management
-- Used for organizing OPD structure and future token generation based on room assignments

-- ============================================
-- FLOORS TABLE
-- Stores building floor information
-- ============================================
CREATE TABLE IF NOT EXISTS `floors` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `floor_number` INT(3) NOT NULL COMMENT 'Floor number (e.g., 1, 2, 3, -1 for basement)',
  `floor_name` VARCHAR(100) DEFAULT NULL COMMENT 'Optional floor name (e.g., "Ground Floor", "First Floor")',
  `building_name` VARCHAR(100) DEFAULT NULL COMMENT 'Building name if multiple buildings',
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Under Maintenance') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_floor_building` (`floor_number`, `building_name`),
  INDEX `idx_floor_number` (`floor_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DEPARTMENTS TABLE
-- Stores OPD department information
-- ============================================
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique department code (e.g., OPD-001, CARDIOLOGY-001)',
  `department_name` VARCHAR(100) NOT NULL,
  `short_name` VARCHAR(50) DEFAULT NULL COMMENT 'Short name or abbreviation',
  `description` TEXT DEFAULT NULL,
  `department_type` ENUM('OPD', 'Emergency', 'IPD', 'Diagnostic', 'Other') NOT NULL DEFAULT 'OPD',
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_department_code` (`department_code`),
  INDEX `idx_department_name` (`department_name`),
  INDEX `idx_department_type` (`department_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROOMS TABLE
-- Stores room information within floors/departments
-- ============================================
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `room_number` VARCHAR(50) NOT NULL COMMENT 'Room number (e.g., 101, 201-A)',
  `room_name` VARCHAR(100) DEFAULT NULL COMMENT 'Optional room name (e.g., "Consultation Room 1")',
  `floor_id` INT(11) NOT NULL COMMENT 'Foreign key to floors.id',
  `department_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to departments.id (optional - room can belong to department)',
  `room_type` ENUM('Consultation', 'Examination', 'Procedure', 'Waiting', 'Storage', 'Other') NOT NULL DEFAULT 'Consultation',
  `capacity` INT(3) DEFAULT 1 COMMENT 'Number of people/patients the room can accommodate',
  `equipment` TEXT DEFAULT NULL COMMENT 'Available equipment in room (JSON or comma-separated)',
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Under Maintenance', 'Reserved') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_floor` (`room_number`, `floor_id`),
  INDEX `idx_room_number` (`room_number`),
  INDEX `idx_floor_id` (`floor_id`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_room_type` (`room_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RECEPTIONS TABLE
-- Stores reception counter/desk information
-- ============================================
CREATE TABLE IF NOT EXISTS `receptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `reception_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique reception code (e.g., REC-001)',
  `reception_name` VARCHAR(100) NOT NULL COMMENT 'Reception name (e.g., "Main Reception", "OPD Reception 1")',
  `floor_id` INT(11) NOT NULL COMMENT 'Foreign key to floors.id',
  `department_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to departments.id (optional - reception can serve specific department)',
  `location` VARCHAR(200) DEFAULT NULL COMMENT 'Physical location description',
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Under Maintenance') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reception_code` (`reception_code`),
  INDEX `idx_reception_name` (`reception_name`),
  INDEX `idx_floor_id` (`floor_id`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOCTOR ROOM ASSIGNMENTS TABLE
-- Links doctors to rooms, departments, and receptions for token generation
-- ============================================
CREATE TABLE IF NOT EXISTS `doctor_room_assignments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` INT(11) NOT NULL COMMENT 'Foreign key to doctors.id',
  `room_id` INT(11) NOT NULL COMMENT 'Foreign key to rooms.id',
  `department_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to departments.id',
  `reception_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to receptions.id (reception that generates tokens for this assignment)',
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL COMMENT 'Start time for this assignment',
  `end_time` TIME NOT NULL COMMENT 'End time for this assignment',
  `token_prefix` VARCHAR(10) DEFAULT NULL COMMENT 'Token prefix (e.g., "OPD", "CARD", "GEN") - auto-generated if NULL',
  `max_tokens_per_day` INT(5) DEFAULT 50 COMMENT 'Maximum tokens that can be generated per day for this assignment',
  `token_start_number` INT(5) DEFAULT 1 COMMENT 'Starting token number for the day',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this assignment is currently active',
  `status` ENUM('Active', 'Inactive', 'Temporary') NOT NULL DEFAULT 'Active',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_room_day_time` (`doctor_id`, `room_id`, `day_of_week`, `start_time`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_reception_id` (`reception_id`),
  INDEX `idx_day_of_week` (`day_of_week`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample floors
INSERT INTO `floors` (`floor_number`, `floor_name`, `building_name`, `description`, `status`, `created_by`) VALUES
(0, 'Ground Floor', 'Main Building', 'Ground floor with main entrance and reception', 'Active', 1),
(1, 'First Floor', 'Main Building', 'First floor with OPD departments', 'Active', 1),
(2, 'Second Floor', 'Main Building', 'Second floor with specialized departments', 'Active', 1)
ON DUPLICATE KEY UPDATE `floor_name` = VALUES(`floor_name`);

-- Insert sample departments
INSERT INTO `departments` (`department_code`, `department_name`, `short_name`, `description`, `department_type`, `status`, `created_by`) VALUES
('OPD-001', 'General Medicine', 'GEN', 'General Medicine OPD', 'OPD', 'Active', 1),
('OPD-002', 'Cardiology', 'CARD', 'Cardiology Department', 'OPD', 'Active', 1),
('OPD-003', 'Pediatrics', 'PED', 'Pediatrics Department', 'OPD', 'Active', 1),
('OPD-004', 'Orthopedics', 'ORTHO', 'Orthopedics Department', 'OPD', 'Active', 1),
('OPD-005', 'Dermatology', 'DERM', 'Dermatology Department', 'OPD', 'Active', 1)
ON DUPLICATE KEY UPDATE `department_name` = VALUES(`department_name`);

-- Insert sample rooms (assuming floor IDs 1, 2, 3 from above)
INSERT INTO `rooms` (`room_number`, `room_name`, `floor_id`, `department_id`, `room_type`, `capacity`, `status`, `created_by`) 
SELECT 
  '101', 'Consultation Room 1', f.id, d.id, 'Consultation', 1, 'Active', 1
FROM `floors` f, `departments` d 
WHERE f.floor_number = 1 AND d.department_code = 'OPD-001'
LIMIT 1
ON DUPLICATE KEY UPDATE `room_name` = VALUES(`room_name`);

INSERT INTO `rooms` (`room_number`, `room_name`, `floor_id`, `department_id`, `room_type`, `capacity`, `status`, `created_by`) 
SELECT 
  '102', 'Consultation Room 2', f.id, d.id, 'Consultation', 1, 'Active', 1
FROM `floors` f, `departments` d 
WHERE f.floor_number = 1 AND d.department_code = 'OPD-001'
LIMIT 1
ON DUPLICATE KEY UPDATE `room_name` = VALUES(`room_name`);

INSERT INTO `rooms` (`room_number`, `room_name`, `floor_id`, `department_id`, `room_type`, `capacity`, `status`, `created_by`) 
SELECT 
  '201', 'Cardiology Consultation', f.id, d.id, 'Consultation', 1, 'Active', 1
FROM `floors` f, `departments` d 
WHERE f.floor_number = 2 AND d.department_code = 'OPD-002'
LIMIT 1
ON DUPLICATE KEY UPDATE `room_name` = VALUES(`room_name`);

-- Insert sample receptions
INSERT INTO `receptions` (`reception_code`, `reception_name`, `floor_id`, `department_id`, `location`, `status`, `created_by`) 
SELECT 
  'REC-001', 'Main OPD Reception', f.id, NULL, 'Ground Floor - Main Entrance', 'Active', 1
FROM `floors` f 
WHERE f.floor_number = 0
LIMIT 1
ON DUPLICATE KEY UPDATE `reception_name` = VALUES(`reception_name`);

INSERT INTO `receptions` (`reception_code`, `reception_name`, `floor_id`, `department_id`, `location`, `status`, `created_by`) 
SELECT 
  'REC-002', 'Cardiology Reception', f.id, d.id, 'First Floor - Near Cardiology', 'Active', 1
FROM `floors` f, `departments` d 
WHERE f.floor_number = 1 AND d.department_code = 'OPD-002'
LIMIT 1
ON DUPLICATE KEY UPDATE `reception_name` = VALUES(`reception_name`);

-- ============================================
-- REFERRAL HOSPITALS TABLE
-- Stores referral hospital information
-- ============================================
CREATE TABLE IF NOT EXISTS `referral_hospitals` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `hospital_name` VARCHAR(200) NOT NULL COMMENT 'Name of the referral hospital',
  `specialty_type` ENUM('Multi-Specialty', 'Single-Specialty', 'General', 'Specialized') NOT NULL DEFAULT 'Multi-Specialty',
  `address` VARCHAR(500) DEFAULT NULL COMMENT 'Full address of the hospital',
  `email` VARCHAR(100) DEFAULT NULL COMMENT 'Contact email address',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Contact phone number',
  `associated_doctor` VARCHAR(200) DEFAULT NULL COMMENT 'Name of associated doctor or contact person',
  `specialties` TEXT DEFAULT NULL COMMENT 'JSON array of specialties (e.g., ["Cardiology", "Neurosurgery", "Oncology"])',
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_hospital_name` (`hospital_name`),
  INDEX `idx_specialty_type` (`specialty_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS `idx_room_floor_department` ON `rooms`(`floor_id`, `department_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_reception_floor_department` ON `receptions`(`floor_id`, `department_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_doctor_assignment_active` ON `doctor_room_assignments`(`doctor_id`, `is_active`, `status`, `day_of_week`);
CREATE INDEX IF NOT EXISTS `idx_doctor_assignment_room` ON `doctor_room_assignments`(`room_id`, `day_of_week`, `is_active`);

