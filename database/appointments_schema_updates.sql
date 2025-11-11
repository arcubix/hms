-- Appointment Management System - Database Schema Updates
-- Supports multiple time slots per day and capacity management

-- ============================================
-- UPDATE APPOINTMENTS TABLE
-- ============================================

-- Add direct reference to doctors table
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `doctor_doctor_id` INT(11) DEFAULT NULL COMMENT 'Direct reference to doctors.id',
  ADD INDEX IF NOT EXISTS `idx_doctor_doctor_id` (`doctor_doctor_id`);

-- Add missing fields for appointment management
ALTER TABLE `appointments`
  ADD COLUMN IF NOT EXISTS `appointment_duration` INT(3) DEFAULT 30 COMMENT 'Duration in minutes',
  ADD COLUMN IF NOT EXISTS `appointment_end_time` DATETIME DEFAULT NULL COMMENT 'Calculated end time',
  ADD COLUMN IF NOT EXISTS `appointment_number` VARCHAR(20) DEFAULT NULL COMMENT 'Unique appointment identifier';

-- Add unique constraint for appointment_number
ALTER TABLE `appointments`
  ADD UNIQUE KEY IF NOT EXISTS `unique_appointment_number` (`appointment_number`);

-- Update appointment_type enum to include Surgery
ALTER TABLE `appointments` 
  MODIFY COLUMN `appointment_type` ENUM('Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Surgery') NOT NULL DEFAULT 'Consultation';

-- ============================================
-- UPDATE EXISTING DATA (if needed)
-- ============================================

-- Set default appointment_duration for existing appointments
UPDATE `appointments` 
SET `appointment_duration` = 30 
WHERE `appointment_duration` IS NULL;

-- Calculate appointment_end_time for existing appointments
UPDATE `appointments` 
SET `appointment_end_time` = DATE_ADD(`appointment_date`, INTERVAL COALESCE(`appointment_duration`, 30) MINUTE)
WHERE `appointment_end_time` IS NULL;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for querying appointments by doctor and date
CREATE INDEX IF NOT EXISTS `idx_appointments_doctor_date` ON `appointments`(`doctor_doctor_id`, `appointment_date`);

-- Index for querying appointments by patient
CREATE INDEX IF NOT EXISTS `idx_appointments_patient_date` ON `appointments`(`patient_id`, `appointment_date`);

-- Index for querying appointments by status and date
CREATE INDEX IF NOT EXISTS `idx_appointments_status_date` ON `appointments`(`status`, `appointment_date`);

-- Index for slot capacity queries (grouping by time)
CREATE INDEX IF NOT EXISTS `idx_appointments_doctor_datetime` ON `appointments`(`doctor_doctor_id`, `appointment_date`);

