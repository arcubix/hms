-- IPD Rooms Management System Database Schema
-- This schema manages private rooms for IPD patients (separate from wards)

-- ============================================
-- IPD ROOMS TABLE
-- Private rooms for IPD patients
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_rooms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `room_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Room number (e.g., PRV-101, DLX-205)',
  `room_type` ENUM('Private', 'Deluxe', 'Suite') NOT NULL DEFAULT 'Private',
  `floor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to floors.id',
  `building` VARCHAR(100) DEFAULT NULL COMMENT 'Building name',
  `status` ENUM('available', 'occupied', 'maintenance', 'cleaning') NOT NULL DEFAULT 'available',
  `current_admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_admissions.id if occupied',
  `daily_rate` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Daily room charge rate',
  `facilities` JSON DEFAULT NULL COMMENT 'Array of facilities (e.g., ["AC", "TV", "Attached Bathroom", "WiFi"])',
  `amenities` JSON DEFAULT NULL COMMENT 'Array of amenities (e.g., ["Refrigerator", "Microwave", "Sofa"])',
  `capacity` INT(2) DEFAULT 1 COMMENT 'Number of patients the room can accommodate',
  `description` TEXT DEFAULT NULL COMMENT 'Room description',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_number` (`room_number`),
  INDEX `idx_room_type` (`room_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_floor_id` (`floor_id`),
  INDEX `idx_current_admission` (`current_admission_id`),
  INDEX `idx_room_number` (`room_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

