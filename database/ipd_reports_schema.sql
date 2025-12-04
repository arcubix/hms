-- IPD Reports Additional Database Schema
-- This schema creates tables needed for comprehensive IPD reporting

-- ============================================
-- IPD INFECTIONS TABLE (Hospital-Acquired Infections)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_infections` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `infection_date` DATE NOT NULL COMMENT 'Date infection was identified',
  `infection_type` VARCHAR(100) NOT NULL COMMENT 'Type: CAUTI, SSI, CLABSI, VAP, UTI, etc.',
  `ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id',
  `ward_name` VARCHAR(255) DEFAULT NULL COMMENT 'Ward name at time of infection',
  `culture_result` TEXT DEFAULT NULL COMMENT 'Culture and sensitivity results',
  `days_to_onset` INT(3) DEFAULT NULL COMMENT 'Days from admission to infection onset',
  `treatment` TEXT DEFAULT NULL COMMENT 'Treatment administered',
  `outcome` ENUM('Resolved', 'Under Treatment', 'Complicated', 'Fatal') DEFAULT 'Under Treatment',
  `reported_by_user_id` INT(11) DEFAULT NULL COMMENT 'User who reported the infection',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_infection_date` (`infection_date`),
  INDEX `idx_infection_type` (`infection_type`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ward_id`) REFERENCES `ipd_wards`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD ADVERSE EVENTS TABLE (Patient Safety Incidents)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_adverse_events` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to patients.id',
  `event_date` DATE NOT NULL,
  `event_time` TIME NOT NULL,
  `event_type` VARCHAR(100) NOT NULL COMMENT 'Medication Error, Patient Fall, Wrong Patient ID, Pressure Ulcer, Equipment Failure, etc.',
  `ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id',
  `ward_name` VARCHAR(255) DEFAULT NULL,
  `severity` ENUM('Minor', 'Major', 'Critical') NOT NULL DEFAULT 'Minor',
  `description` TEXT NOT NULL COMMENT 'Detailed description of the event',
  `root_cause` TEXT DEFAULT NULL COMMENT 'Root cause analysis',
  `action_taken` TEXT DEFAULT NULL COMMENT 'Corrective actions taken',
  `preventability` ENUM('Preventable', 'Potentially Preventable', 'Not Preventable') DEFAULT NULL,
  `status` ENUM('Open', 'Under Investigation', 'Closed', 'In Review') NOT NULL DEFAULT 'Open',
  `reported_by_user_id` INT(11) DEFAULT NULL COMMENT 'User who reported the event',
  `investigated_by_user_id` INT(11) DEFAULT NULL COMMENT 'User investigating the event',
  `resolved_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_event_date` (`event_date`),
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`ward_id`) REFERENCES `ipd_wards`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD CODE BLUE TABLE (Emergency Response)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_code_blue` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to patients.id',
  `code_date` DATE NOT NULL,
  `code_time` TIME NOT NULL,
  `ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id',
  `ward_name` VARCHAR(255) DEFAULT NULL,
  `code_type` VARCHAR(100) NOT NULL COMMENT 'Cardiac Arrest, Respiratory Arrest, Severe Hypotension, Status Epilepticus, Anaphylactic Shock, etc.',
  `response_time_minutes` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Response time in minutes',
  `team_members` TEXT DEFAULT NULL COMMENT 'JSON array of team member names/IDs',
  `interventions` TEXT DEFAULT NULL COMMENT 'Interventions performed',
  `outcome` ENUM('Stabilized', 'ROSC Achieved', 'Transferred to ICU', 'Deceased', 'Ongoing') NOT NULL DEFAULT 'Ongoing',
  `rosc_time` TIME DEFAULT NULL COMMENT 'Return of Spontaneous Circulation time',
  `duration_minutes` INT(4) DEFAULT NULL COMMENT 'Total code duration',
  `initiated_by_user_id` INT(11) DEFAULT NULL COMMENT 'User who initiated code blue',
  `team_leader_user_id` INT(11) DEFAULT NULL COMMENT 'Code team leader',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_code_date` (`code_date`),
  INDEX `idx_code_type` (`code_type`),
  INDEX `idx_outcome` (`outcome`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`ward_id`) REFERENCES `ipd_wards`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD PATIENT COMPLAINTS TABLE (Feedback/Grievances)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_patient_complaints` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to patients.id',
  `complaint_date` DATE NOT NULL,
  `complaint_type` VARCHAR(100) NOT NULL COMMENT 'Service Quality, Staff Behavior, Billing Issue, Facility Issue, Medical Care, etc.',
  `ward_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_wards.id',
  `ward_name` VARCHAR(255) DEFAULT NULL,
  `severity` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `description` TEXT NOT NULL COMMENT 'Complaint description',
  `patient_satisfaction_score` INT(1) DEFAULT NULL COMMENT '1-5 rating',
  `assigned_to_user_id` INT(11) DEFAULT NULL COMMENT 'User assigned to handle complaint',
  `assigned_to_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Open', 'In Progress', 'Resolved', 'Closed', 'Escalated') NOT NULL DEFAULT 'Open',
  `resolution` TEXT DEFAULT NULL COMMENT 'Resolution details',
  `resolution_time_hours` INT(4) DEFAULT NULL COMMENT 'Time to resolution in hours',
  `resolved_date` DATE DEFAULT NULL,
  `resolved_by_user_id` INT(11) DEFAULT NULL,
  `follow_up_required` BOOLEAN DEFAULT FALSE,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_ward_id` (`ward_id`),
  INDEX `idx_complaint_date` (`complaint_date`),
  INDEX `idx_complaint_type` (`complaint_type`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`ward_id`) REFERENCES `ipd_wards`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD CONSENT FORMS TABLE (Consent Documentation)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_consent_forms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `consent_type` VARCHAR(100) NOT NULL COMMENT 'Surgery Consent, Anesthesia Consent, Blood Transfusion, High-Risk Procedure, Research Participation, etc.',
  `procedure_name` VARCHAR(255) DEFAULT NULL COMMENT 'Procedure for which consent is given',
  `obtained_date` DATE NOT NULL,
  `obtained_time` TIME NOT NULL,
  `obtained_by_user_id` INT(11) NOT NULL COMMENT 'User who obtained consent',
  `obtained_by_name` VARCHAR(255) DEFAULT NULL,
  `witness_user_id` INT(11) DEFAULT NULL COMMENT 'Witness user ID',
  `witness_name` VARCHAR(255) DEFAULT NULL,
  `patient_signature` BOOLEAN DEFAULT FALSE COMMENT 'Whether patient signed',
  `witness_signature` BOOLEAN DEFAULT FALSE COMMENT 'Whether witness signed',
  `family_consent` BOOLEAN DEFAULT FALSE COMMENT 'Family consent obtained',
  `family_member_name` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Valid', 'Pending', 'Expired', 'Revoked') NOT NULL DEFAULT 'Valid',
  `expiry_date` DATE DEFAULT NULL COMMENT 'Consent expiry date if applicable',
  `review_date` DATE DEFAULT NULL COMMENT 'Next review date',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_consent_type` (`consent_type`),
  INDEX `idx_obtained_date` (`obtained_date`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD OT SCHEDULES TABLE (Operation Theatre Scheduling)
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_ot_schedules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `procedure_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_procedures.id',
  `ot_number` VARCHAR(50) NOT NULL COMMENT 'OT number/name (e.g., OT 1, OT 2)',
  `scheduled_date` DATE NOT NULL,
  `scheduled_time` TIME NOT NULL,
  `procedure_name` VARCHAR(255) NOT NULL,
  `procedure_type` VARCHAR(100) DEFAULT NULL,
  `surgeon_user_id` INT(11) DEFAULT NULL COMMENT 'Primary surgeon',
  `surgeon_name` VARCHAR(255) DEFAULT NULL,
  `assistant_surgeon_user_id` INT(11) DEFAULT NULL,
  `assistant_surgeon_name` VARCHAR(255) DEFAULT NULL,
  `anesthetist_user_id` INT(11) DEFAULT NULL,
  `anesthetist_name` VARCHAR(255) DEFAULT NULL,
  `anesthesia_type` VARCHAR(100) DEFAULT NULL COMMENT 'General, Spinal, Epidural, Local, Regional',
  `estimated_duration_minutes` INT(4) DEFAULT NULL,
  `actual_duration_minutes` INT(4) DEFAULT NULL,
  `status` ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed') NOT NULL DEFAULT 'Scheduled',
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `complications` TEXT DEFAULT NULL,
  `asa_score` INT(1) DEFAULT NULL COMMENT 'ASA physical status classification (1-5)',
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_procedure_id` (`procedure_id`),
  INDEX `idx_ot_number` (`ot_number`),
  INDEX `idx_scheduled_date` (`scheduled_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_surgeon_user_id` (`surgeon_user_id`),
  FOREIGN KEY (`admission_id`) REFERENCES `ipd_admissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`procedure_id`) REFERENCES `ipd_procedures`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;






