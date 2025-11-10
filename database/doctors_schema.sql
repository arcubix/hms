-- Doctor Management System Database Schema
-- This file extends the existing HMS schema with doctor-specific tables

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique doctor identifier (e.g., D001)',
  `name` VARCHAR(100) NOT NULL,
  `specialty` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `experience` INT(3) NOT NULL DEFAULT 0 COMMENT 'Years of experience',
  `qualification` TEXT DEFAULT NULL COMMENT 'Medical qualifications, degrees',
  `status` ENUM('Available', 'Busy', 'Off Duty') NOT NULL DEFAULT 'Available',
  `schedule_start` TIME DEFAULT '09:00:00' COMMENT 'Default daily start time',
  `schedule_end` TIME DEFAULT '17:00:00' COMMENT 'Default daily end time',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT 'Profile picture path',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_id` (`doctor_id`),
  INDEX `idx_specialty` (`specialty`),
  INDEX `idx_status` (`status`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOCTOR SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `doctor_schedules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` INT(11) NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_day` (`doctor_id`, `day_of_week`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_day_of_week` (`day_of_week`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOCTOR RATINGS TABLE (Optional - for future use)
-- ============================================
CREATE TABLE IF NOT EXISTS `doctor_ratings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` INT(11) NOT NULL,
  `patient_id` INT(11) DEFAULT NULL,
  `rating` DECIMAL(2,1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_rating` (`rating`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPDATE APPOINTMENTS TABLE (if needed)
-- Ensure doctor_id references doctors table
-- ============================================
-- Note: The appointments table already exists in schema.sql
-- We just need to ensure it references doctors via users table
-- or we can add a direct reference if needed

-- ============================================
-- SAMPLE DOCTOR DATA (Optional - for testing)
-- ============================================
INSERT INTO `doctors` (`doctor_id`, `name`, `specialty`, `phone`, `email`, `experience`, `qualification`, `status`, `schedule_start`, `schedule_end`, `created_by`) VALUES
('D001', 'Dr. Michael Chen', 'Cardiology', '+1 234-567-1001', 'michael.chen@hospital.com', 15, 'MD, PhD in Cardiology', 'Available', '09:00:00', '17:00:00', 1),
('D002', 'Dr. Sarah Williams', 'Pediatrics', '+1 234-567-1002', 'sarah.williams@hospital.com', 12, 'MD, Board Certified Pediatrician', 'Busy', '08:00:00', '16:00:00', 1),
('D003', 'Dr. Robert Johnson', 'Orthopedics', '+1 234-567-1003', 'robert.johnson@hospital.com', 20, 'MD, Orthopedic Surgeon', 'Available', '10:00:00', '18:00:00', 1),
('D004', 'Dr. Emily Davis', 'Dermatology', '+1 234-567-1004', 'emily.davis@hospital.com', 8, 'MD, Dermatology Specialist', 'Off Duty', '09:00:00', '15:00:00', 1),
('D005', 'Dr. James Wilson', 'Neurology', '+1 234-567-1005', 'james.wilson@hospital.com', 18, 'MD, PhD in Neurology', 'Available', '08:00:00', '17:00:00', 1)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================
-- SAMPLE SCHEDULE DATA (Optional - for testing)
-- ============================================
-- Insert default schedules for sample doctors (Monday to Friday, 9 AM - 5 PM)
INSERT INTO `doctor_schedules` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `is_available`) 
SELECT d.id, 'Monday', '09:00:00', '17:00:00', 1 FROM `doctors` d WHERE d.doctor_id = 'D001'
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`), `end_time` = VALUES(`end_time`);

INSERT INTO `doctor_schedules` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `is_available`) 
SELECT d.id, 'Tuesday', '09:00:00', '17:00:00', 1 FROM `doctors` d WHERE d.doctor_id = 'D001'
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`), `end_time` = VALUES(`end_time`);

INSERT INTO `doctor_schedules` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `is_available`) 
SELECT d.id, 'Wednesday', '09:00:00', '17:00:00', 1 FROM `doctors` d WHERE d.doctor_id = 'D001'
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`), `end_time` = VALUES(`end_time`);

INSERT INTO `doctor_schedules` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `is_available`) 
SELECT d.id, 'Thursday', '09:00:00', '17:00:00', 1 FROM `doctors` d WHERE d.doctor_id = 'D001'
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`), `end_time` = VALUES(`end_time`);

INSERT INTO `doctor_schedules` (`doctor_id`, `day_of_week`, `start_time`, `end_time`, `is_available`) 
SELECT d.id, 'Friday', '09:00:00', '17:00:00', 1 FROM `doctors` d WHERE d.doctor_id = 'D001'
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`), `end_time` = VALUES(`end_time`);

-- ============================================
-- VIEWS FOR EASIER QUERIES
-- ============================================

-- View: Doctor Summary with Statistics
CREATE OR REPLACE VIEW `v_doctor_summary` AS
SELECT 
  d.id,
  d.doctor_id,
  d.name,
  d.specialty,
  d.phone,
  d.email,
  d.experience,
  d.status,
  d.schedule_start,
  d.schedule_end,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT a.patient_id) as total_patients,
  COALESCE(AVG(dr.rating), 0) as average_rating,
  COUNT(DISTINCT dr.id) as total_ratings,
  d.created_at
FROM `doctors` d
LEFT JOIN `appointments` a ON d.id = a.doctor_id
LEFT JOIN `doctor_ratings` dr ON d.id = dr.doctor_id
GROUP BY d.id;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS `idx_doctor_status_specialty` ON `doctors`(`status`, `specialty`);
CREATE INDEX IF NOT EXISTS `idx_schedule_doctor_available` ON `doctor_schedules`(`doctor_id`, `is_available`);

