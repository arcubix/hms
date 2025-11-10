-- Hospital Management System Database Schema
-- Focus: Admin Login and Patient Management

-- ============================================
-- USERS TABLE (Admin/Staff)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'doctor', 'nurse', 'lab', 'pharmacy', 'finance') NOT NULL DEFAULT 'admin',
  `phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `patients` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `patient_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique patient identifier (e.g., P001)',
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `age` INT(3) NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(50) DEFAULT NULL,
  `state` VARCHAR(50) DEFAULT NULL,
  `zip_code` VARCHAR(10) DEFAULT NULL,
  `blood_group` VARCHAR(5) DEFAULT NULL,
  `emergency_contact_name` VARCHAR(100) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Critical') NOT NULL DEFAULT 'Active',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the record',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_patient_id` (`patient_id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PATIENT MEDICAL RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `patient_medical_records` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `patient_id` INT(11) NOT NULL,
  `record_type` ENUM('Visit', 'Diagnosis', 'Treatment', 'Prescription', 'Lab_Result', 'Other') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `treatment` TEXT DEFAULT NULL,
  `medications` TEXT DEFAULT NULL,
  `doctor_id` INT(11) DEFAULT NULL COMMENT 'Assigned doctor',
  `visit_date` DATETIME NOT NULL,
  `next_followup_date` DATE DEFAULT NULL,
  `attachments` JSON DEFAULT NULL COMMENT 'File paths or URLs',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_visit_date` (`visit_date`),
  INDEX `idx_record_type` (`record_type`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `patient_id` INT(11) NOT NULL,
  `doctor_id` INT(11) DEFAULT NULL,
  `appointment_date` DATETIME NOT NULL,
  `appointment_type` ENUM('Consultation', 'Follow-up', 'Check-up', 'Emergency') NOT NULL DEFAULT 'Consultation',
  `status` ENUM('Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show') NOT NULL DEFAULT 'Scheduled',
  `reason` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_doctor_id` (`doctor_id`),
  INDEX `idx_appointment_date` (`appointment_date`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SESSIONS TABLE (For JWT token management)
-- ============================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_token` (`token`(255)),
  INDEX `idx_expires_at` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
-- Password: admin123 (hashed with password_hash PHP function)
-- To generate: password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO `users` (`name`, `email`, `password`, `role`, `phone`, `status`) VALUES
('System Administrator', 'admin@hospital.com', '$2y$10$o8lhHSu0xlzJ9MuhssC0PuxOct.AhFEP7VfIipvYgfVV5ELJB8V1G', 'admin', '+1234567890', 'active')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================
-- SAMPLE PATIENT DATA (Optional - for testing)
-- ============================================
INSERT INTO `patients` (`patient_id`, `name`, `email`, `phone`, `age`, `gender`, `address`, `city`, `state`, `status`, `created_by`) VALUES
('P001', 'John Smith', 'john.smith@email.com', '+1 234-567-8901', 45, 'Male', '123 Main St', 'New York', 'NY', 'Active', 1),
('P002', 'Emily Johnson', 'emily.johnson@email.com', '+1 234-567-8902', 32, 'Female', '456 Oak Ave', 'Los Angeles', 'CA', 'Active', 1),
('P003', 'Michael Brown', 'michael.brown@email.com', '+1 234-567-8903', 67, 'Male', '789 Pine Rd', 'Chicago', 'IL', 'Critical', 1)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================
-- VIEWS (Optional - for easier queries)
-- ============================================

-- View: Patient Summary
CREATE OR REPLACE VIEW `v_patient_summary` AS
SELECT 
  p.id,
  p.patient_id,
  p.name,
  p.email,
  p.phone,
  p.age,
  p.gender,
  p.status,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT pmr.id) as total_records,
  MAX(a.appointment_date) as last_appointment,
  p.created_at
FROM `patients` p
LEFT JOIN `appointments` a ON p.id = a.patient_id
LEFT JOIN `patient_medical_records` pmr ON p.id = pmr.patient_id
GROUP BY p.id;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Additional composite indexes for common queries
CREATE INDEX `idx_patient_status_created` ON `patients`(`status`, `created_at`);
CREATE INDEX `idx_appointment_date_status` ON `appointments`(`appointment_date`, `status`);

