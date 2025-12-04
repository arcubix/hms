-- IPD Rehabilitation Requests Table
CREATE TABLE IF NOT EXISTS `ipd_rehabilitation_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admission_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `service_type` varchar(100) NOT NULL COMMENT 'Physiotherapy, Occupational Therapy, Speech Therapy, etc.',
  `requested_by_doctor_id` int(11) DEFAULT NULL,
  `requested_by_name` varchar(255) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL COMMENT 'Daily, Twice Weekly, Weekly, etc.',
  `duration` varchar(50) DEFAULT NULL COMMENT 'e.g., 2 weeks, 1 month',
  `status` enum('pending','active','completed','cancelled','on-hold') DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `next_session_date` date DEFAULT NULL,
  `next_session_time` time DEFAULT NULL,
  `total_sessions` int(11) DEFAULT 0,
  `completed_sessions` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_admission_id` (`admission_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by_doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;










