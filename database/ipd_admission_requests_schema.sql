-- IPD Admission Requests Table (Requests from doctors for patient admission)
CREATE TABLE IF NOT EXISTS `ipd_admission_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` varchar(50) NOT NULL COMMENT 'Auto-generated request ID (e.g., REQ-001)',
  `patient_id` int(11) NOT NULL,
  `requested_by_doctor_id` int(11) NOT NULL,
  `department` varchar(100) NOT NULL,
  `priority` enum('normal','urgent','emergency') DEFAULT 'normal',
  `ward_preference` varchar(100) DEFAULT NULL,
  `room_preference` varchar(100) DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `reason` text DEFAULT NULL COMMENT 'Reason for admission request',
  `estimated_duration` int(11) DEFAULT NULL COMMENT 'Estimated stay in days',
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL COMMENT 'User ID who approved/rejected',
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `admission_id` int(11) DEFAULT NULL COMMENT 'Linked admission ID if approved',
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_request_id` (`request_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_doctor_id` (`requested_by_doctor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_admission_id` (`admission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;











