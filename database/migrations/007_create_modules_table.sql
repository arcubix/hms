-- Migration: Create modules master table
-- This table stores all available modules with their metadata

CREATE TABLE IF NOT EXISTS `modules` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `module_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique module identifier (dashboard, patients, etc.)',
  `label` VARCHAR(100) NOT NULL COMMENT 'Display name',
  `description` TEXT DEFAULT NULL COMMENT 'Module description',
  `category` VARCHAR(50) NOT NULL DEFAULT 'Core' COMMENT 'Module category (Core, Clinical, Operations, Critical, Financial, Analytics, System)',
  `icon_name` VARCHAR(50) DEFAULT NULL COMMENT 'Icon identifier for frontend mapping (e.g., BarChart3, Users)',
  `color_from` VARCHAR(20) DEFAULT NULL COMMENT 'Gradient color start (e.g., blue-500)',
  `color_to` VARCHAR(20) DEFAULT NULL COMMENT 'Gradient color end (e.g., blue-600)',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Whether module is active/enabled',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Default display order',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_module_id` (`module_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default modules
INSERT INTO `modules` (`module_id`, `label`, `description`, `category`, `icon_name`, `color_from`, `color_to`, `display_order`) VALUES
('dashboard', 'Dashboard', 'Overview and analytics', 'Core', 'BarChart3', 'blue-500', 'blue-600', 1),
('analytics', 'Analytics', 'Data insights and trends', 'Core', 'Activity', 'purple-500', 'purple-600', 2),
('emergency', 'Emergency', 'Emergency department', 'Critical', 'Ambulance', 'red-500', 'red-600', 3),
('patients', 'Patients', 'Patient management', 'Core', 'Users', 'green-500', 'green-600', 4),
('doctors', 'Doctors', 'Doctor directory', 'Core', 'Stethoscope', 'teal-500', 'teal-600', 5),
('appointments', 'Appointments', 'Appointment scheduling', 'Operations', 'Calendar', 'orange-500', 'orange-600', 6),
('opd', 'OPD', 'Outpatient department', 'Operations', 'Activity', 'cyan-500', 'cyan-600', 7),
('ipd', 'IPD Management', 'Inpatient department', 'Operations', 'Hospital', 'indigo-500', 'indigo-600', 8),
('beds', 'Bed Management', 'Bed allocation and status', 'Operations', 'Bed', 'pink-500', 'pink-600', 9),
('healthrecords', 'Health Records', 'Medical records', 'Clinical', 'FileText', 'blue-500', 'blue-600', 10),
('laboratory', 'Laboratory', 'Lab tests and results', 'Clinical', 'TestTube', 'green-500', 'green-600', 11),
('pharmacy', 'Pharmacy', 'Medication management', 'Clinical', 'Pill', 'purple-500', 'purple-600', 12),
('billing', 'Billing', 'Financial transactions', 'Financial', 'DollarSign', 'yellow-500', 'yellow-600', 13),
('reports', 'Reports', 'Generate reports', 'Core', 'Newspaper', 'gray-500', 'gray-600', 14),
('radiology', 'Radiology', 'Imaging and scans', 'Clinical', 'Brain', 'rose-500', 'rose-600', 15),
('evaluation', 'Evaluation', 'AI-powered insights', 'Analytics', 'BookOpen', 'violet-500', 'violet-600', 16),
('settings', 'Settings', 'System configuration', 'System', 'Settings', 'slate-500', 'slate-600', 17)
ON DUPLICATE KEY UPDATE 
  `label` = VALUES(`label`), 
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `icon_name` = VALUES(`icon_name`),
  `color_from` = VALUES(`color_from`),
  `color_to` = VALUES(`color_to`),
  `display_order` = VALUES(`display_order`);

