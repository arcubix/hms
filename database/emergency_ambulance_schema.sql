-- Emergency Ambulance Requests Management System Database Schema
-- This schema manages ambulance service requests

-- ============================================
-- EMERGENCY AMBULANCE REQUESTS TABLE
-- Ambulance service requests
-- ============================================
CREATE TABLE IF NOT EXISTS `emergency_ambulance_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `emergency_visit_id` INT(11) NOT NULL COMMENT 'Foreign key to emergency_visits.id',
  `service_type` ENUM('BLS', 'ALS', 'Critical Care', 'Air', 'Neonatal') NOT NULL DEFAULT 'BLS' COMMENT 'Basic Life Support, Advanced Life Support, etc.',
  `priority` ENUM('Emergency', 'Urgent', 'Scheduled') NOT NULL DEFAULT 'Emergency',
  `destination` ENUM('Home', 'City General Hospital', 'Metro Medical Center', 'Cardiac Specialty Center', 'Regional Trauma Center', 'Rehabilitation Facility', 'Other') NOT NULL,
  `destination_address` TEXT DEFAULT NULL COMMENT 'Custom destination address if destination is Other',
  `pickup_date` DATE NOT NULL,
  `pickup_time` TIME NOT NULL,
  `medical_requirements` JSON DEFAULT NULL COMMENT 'Array of requirements (e.g., ["Oxygen Support", "IV Medications", "Cardiac Monitoring"])',
  `contact_person` VARCHAR(200) DEFAULT NULL COMMENT 'Emergency contact person name and number',
  `additional_notes` TEXT DEFAULT NULL COMMENT 'Additional notes or special instructions',
  `status` ENUM('Requested', 'Dispatched', 'In Transit', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Requested',
  `requested_by` INT(11) DEFAULT NULL COMMENT 'User ID who requested ambulance',
  `dispatched_at` DATETIME DEFAULT NULL COMMENT 'When ambulance was dispatched',
  `completed_at` DATETIME DEFAULT NULL COMMENT 'When transfer was completed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
  INDEX `idx_service_type` (`service_type`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_status` (`status`),
  INDEX `idx_pickup_date` (`pickup_date`),
  INDEX `idx_requested_by` (`requested_by`),
  FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
