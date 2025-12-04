-- Fix IPD Table Names
-- Run this script to create/rename tables to match controller expectations

-- Rename ipd_health_physical_habit to ipd_health_physical_habits (if exists)
RENAME TABLE `ipd_health_physical_habit` TO `ipd_health_physical_habits`;

-- Rename ipd_files to ipd_patient_files (if exists)
RENAME TABLE `ipd_files` TO `ipd_patient_files`;

-- Rename ipd_doctor_consultation_requests to ipd_doctor_consultations (if exists)
RENAME TABLE `ipd_doctor_consultation_requests` TO `ipd_doctor_consultations`;

-- Or create the tables if they don't exist:

-- Create ipd_health_physical_habits table
CREATE TABLE IF NOT EXISTS `ipd_health_physical_habits` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `assessment_date` DATE NOT NULL COMMENT 'Assessment date',
  `height` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Height in cm',
  `weight` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Weight in kg',
  `bmi` DECIMAL(4, 2) DEFAULT NULL COMMENT 'Body Mass Index',
  `smoking_status` ENUM('Never', 'Former', 'Current') DEFAULT NULL,
  `alcohol_consumption` ENUM('None', 'Occasional', 'Regular', 'Heavy') DEFAULT NULL,
  `exercise_habit` VARCHAR(100) DEFAULT NULL COMMENT 'Exercise habits',
  `dietary_restrictions` TEXT DEFAULT NULL COMMENT 'Dietary restrictions',
  `allergies` TEXT DEFAULT NULL COMMENT 'Known allergies',
  `chronic_conditions` TEXT DEFAULT NULL COMMENT 'Chronic conditions',
  `family_history` TEXT DEFAULT NULL COMMENT 'Family medical history',
  `social_history` TEXT DEFAULT NULL COMMENT 'Social history',
  `assessed_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_assessment_date` (`assessment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ipd_patient_files table
CREATE TABLE IF NOT EXISTS `ipd_patient_files` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'File name',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'File path',
  `file_type` VARCHAR(50) DEFAULT NULL COMMENT 'File type (PDF, Image, etc.)',
  `file_category` ENUM('Report', 'Image', 'Document', 'Consent Form', 'Other') NOT NULL DEFAULT 'Document',
  `description` TEXT DEFAULT NULL COMMENT 'File description',
  `uploaded_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `file_size` INT(11) DEFAULT NULL COMMENT 'File size in bytes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_file_category` (`file_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ipd_doctor_consultations table
CREATE TABLE IF NOT EXISTS `ipd_doctor_consultations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `request_date` DATE NOT NULL COMMENT 'Request date',
  `request_time` TIME NOT NULL COMMENT 'Request time',
  `requested_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (requesting doctor)',
  `consultant_doctor_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to doctors.id (consultant)',
  `department` VARCHAR(100) DEFAULT NULL COMMENT 'Department for consultation',
  `reason` TEXT NOT NULL COMMENT 'Reason for consultation',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `status` ENUM('pending', 'accepted', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `consultation_date` DATE DEFAULT NULL COMMENT 'Consultation date',
  `consultation_notes` TEXT DEFAULT NULL COMMENT 'Consultation notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_request_date` (`request_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

