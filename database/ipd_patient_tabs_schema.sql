-- IPD Patient Tabs Database Schema
-- This schema creates tables for all IPD patient detail tabs

-- ============================================
-- DAILY PATIENT CARE ORDER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_daily_care_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `order_date` DATE NOT NULL COMMENT 'Date of care order',
  `order_time` TIME NOT NULL COMMENT 'Time of care order',
  `ordered_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor/nurse)',
  `order_type` ENUM('Medication', 'Diet', 'Activity', 'Monitoring', 'Procedure', 'Other') NOT NULL DEFAULT 'Other',
  `order_description` TEXT NOT NULL COMMENT 'Description of care order',
  `frequency` VARCHAR(50) DEFAULT NULL COMMENT 'Frequency (e.g., QID, TID, BD, OD)',
  `start_date` DATE DEFAULT NULL COMMENT 'Start date',
  `end_date` DATE DEFAULT NULL COMMENT 'End date',
  `status` ENUM('active', 'completed', 'cancelled', 'on-hold') NOT NULL DEFAULT 'active',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `notes` TEXT DEFAULT NULL COMMENT 'Additional notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_order_date` (`order_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD MEDICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_medications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `medication_name` VARCHAR(255) NOT NULL COMMENT 'Name of medication',
  `dosage` VARCHAR(100) NOT NULL COMMENT 'Dosage (e.g., 500mg, 10ml)',
  `frequency` VARCHAR(50) NOT NULL COMMENT 'Frequency (e.g., QID, TID, BD, OD)',
  `route` ENUM('Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Other') NOT NULL DEFAULT 'Oral',
  `start_date` DATE NOT NULL COMMENT 'Start date',
  `end_date` DATE DEFAULT NULL COMMENT 'End date',
  `duration` INT(3) DEFAULT NULL COMMENT 'Duration in days',
  `prescribed_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `status` ENUM('active', 'completed', 'stopped', 'cancelled') NOT NULL DEFAULT 'active',
  `instructions` TEXT DEFAULT NULL COMMENT 'Special instructions',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_date` (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD LAB ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_lab_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `order_date` DATE NOT NULL COMMENT 'Order date',
  `order_time` TIME NOT NULL COMMENT 'Order time',
  `ordered_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `test_name` VARCHAR(255) NOT NULL COMMENT 'Name of lab test',
  `test_type` VARCHAR(100) DEFAULT NULL COMMENT 'Type of test',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `status` ENUM('ordered', 'sample-collected', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'ordered',
  `sample_collected_date` DATE DEFAULT NULL COMMENT 'Sample collection date',
  `sample_collected_time` TIME DEFAULT NULL COMMENT 'Sample collection time',
  `results` TEXT DEFAULT NULL COMMENT 'Test results',
  `result_date` DATE DEFAULT NULL COMMENT 'Result date',
  `notes` TEXT DEFAULT NULL COMMENT 'Notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_date` (`order_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD RADIOLOGY ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_radiology_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `order_date` DATE NOT NULL COMMENT 'Order date',
  `order_time` TIME NOT NULL COMMENT 'Order time',
  `ordered_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `test_name` VARCHAR(255) NOT NULL COMMENT 'Name of radiology test',
  `test_type` VARCHAR(100) DEFAULT NULL COMMENT 'Type of test (X-Ray, CT, MRI, Ultrasound, etc.)',
  `body_part` VARCHAR(100) DEFAULT NULL COMMENT 'Body part to be examined',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `status` ENUM('ordered', 'scheduled', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'ordered',
  `scheduled_date` DATE DEFAULT NULL COMMENT 'Scheduled date',
  `scheduled_time` TIME DEFAULT NULL COMMENT 'Scheduled time',
  `report` TEXT DEFAULT NULL COMMENT 'Radiology report',
  `report_date` DATE DEFAULT NULL COMMENT 'Report date',
  `notes` TEXT DEFAULT NULL COMMENT 'Notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_date` (`order_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD DOCTOR NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_doctor_notes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `note_date` DATE NOT NULL COMMENT 'Note date',
  `note_time` TIME NOT NULL COMMENT 'Note time',
  `doctor_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `note_type` ENUM('Progress', 'Consultation', 'Procedure', 'Discharge', 'Other') NOT NULL DEFAULT 'Progress',
  `note` TEXT NOT NULL COMMENT 'Doctor note content',
  `assessment` TEXT DEFAULT NULL COMMENT 'Clinical assessment',
  `plan` TEXT DEFAULT NULL COMMENT 'Treatment plan',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_note_date` (`note_date`),
  INDEX `idx_doctor` (`doctor_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD PHARMACIST NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_pharmacist_notes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `note_date` DATE NOT NULL COMMENT 'Note date',
  `note_time` TIME NOT NULL COMMENT 'Note time',
  `pharmacist_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (pharmacist)',
  `note_type` ENUM('Medication Review', 'Drug Interaction', 'Dosage Adjustment', 'Allergy Alert', 'Other') NOT NULL DEFAULT 'Medication Review',
  `note` TEXT NOT NULL COMMENT 'Pharmacist note content',
  `medication_id` INT(11) DEFAULT NULL COMMENT 'Related medication if applicable',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_note_date` (`note_date`),
  INDEX `idx_pharmacist` (`pharmacist_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD PROCEDURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_procedures` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `procedure_date` DATE NOT NULL COMMENT 'Procedure date',
  `procedure_time` TIME NOT NULL COMMENT 'Procedure time',
  `procedure_name` VARCHAR(255) NOT NULL COMMENT 'Name of procedure',
  `procedure_type` VARCHAR(100) DEFAULT NULL COMMENT 'Type of procedure',
  `performed_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `assistant_user_id` INT(11) DEFAULT NULL COMMENT 'Assistant user ID',
  `anesthesia_type` VARCHAR(100) DEFAULT NULL COMMENT 'Type of anesthesia',
  `procedure_notes` TEXT DEFAULT NULL COMMENT 'Procedure notes',
  `complications` TEXT DEFAULT NULL COMMENT 'Complications if any',
  `status` ENUM('scheduled', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_procedure_date` (`procedure_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD NUTRITION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_nutrition` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `date` DATE NOT NULL COMMENT 'Date',
  `meal_type` ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other') NOT NULL DEFAULT 'Breakfast',
  `diet_type` VARCHAR(100) DEFAULT NULL COMMENT 'Diet type (e.g., Diabetic, Soft, Liquid)',
  `items` TEXT DEFAULT NULL COMMENT 'Food items',
  `calories` DECIMAL(6, 2) DEFAULT NULL COMMENT 'Calories consumed',
  `protein` DECIMAL(6, 2) DEFAULT NULL COMMENT 'Protein in grams',
  `carbohydrates` DECIMAL(6, 2) DEFAULT NULL COMMENT 'Carbohydrates in grams',
  `fats` DECIMAL(6, 2) DEFAULT NULL COMMENT 'Fats in grams',
  `notes` TEXT DEFAULT NULL COMMENT 'Notes',
  `recorded_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD INTAKE & OUTPUT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_intake_output` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `date` DATE NOT NULL COMMENT 'Date',
  `time` TIME NOT NULL COMMENT 'Time',
  `intake_type` ENUM('Oral', 'IV', 'NG', 'Other') DEFAULT NULL COMMENT 'Intake type',
  `intake_amount` DECIMAL(8, 2) DEFAULT NULL COMMENT 'Intake amount in ml',
  `output_type` ENUM('Urine', 'Stool', 'Vomit', 'Drainage', 'Other') DEFAULT NULL COMMENT 'Output type',
  `output_amount` DECIMAL(8, 2) DEFAULT NULL COMMENT 'Output amount in ml',
  `balance` DECIMAL(8, 2) DEFAULT NULL COMMENT 'Balance (intake - output)',
  `notes` TEXT DEFAULT NULL COMMENT 'Notes',
  `recorded_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD FILES TABLE
-- ============================================
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
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_file_category` (`file_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD HEALTH & PHYSICAL HABIT TABLE
-- ============================================
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

-- ============================================
-- IPD FORMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_forms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `form_name` VARCHAR(255) NOT NULL COMMENT 'Form name',
  `form_type` VARCHAR(100) DEFAULT NULL COMMENT 'Form type',
  `form_data` JSON DEFAULT NULL COMMENT 'Form data in JSON format',
  `status` ENUM('draft', 'completed', 'signed') NOT NULL DEFAULT 'draft',
  `signed_by_user_id` INT(11) DEFAULT NULL COMMENT 'User who signed',
  `signed_date` DATE DEFAULT NULL COMMENT 'Signed date',
  `created_by_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_form_type` (`form_type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD DOCTOR RECOMMENDATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_doctor_recommendations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `recommendation_date` DATE NOT NULL COMMENT 'Recommendation date',
  `recommendation_time` TIME NOT NULL COMMENT 'Recommendation time',
  `doctor_user_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to users.id (doctor)',
  `recommendation_type` ENUM('Treatment', 'Investigation', 'Consultation', 'Discharge', 'Transfer', 'Other') NOT NULL DEFAULT 'Treatment',
  `recommendation` TEXT NOT NULL COMMENT 'Recommendation content',
  `priority` ENUM('routine', 'urgent', 'stat') NOT NULL DEFAULT 'routine',
  `status` ENUM('pending', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_recommendation_date` (`recommendation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD DOCTOR CONSULTATION REQUEST TABLE
-- ============================================
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

