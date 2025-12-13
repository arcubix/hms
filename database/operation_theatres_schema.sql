-- Operation Theatres Master Table
-- This table stores information about all Operation Theatres in the hospital

CREATE TABLE IF NOT EXISTS `operation_theatres` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'OT 1, OT 2, etc.',
  `ot_name` VARCHAR(255) DEFAULT NULL COMMENT 'OT 1 (General Surgery)',
  `specialty` VARCHAR(100) DEFAULT NULL COMMENT 'General Surgery, Orthopedics, Cardiothoracic, Neurosurgery, ENT, Obstetrics',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Building, Floor, Room number',
  `capacity` INT(11) DEFAULT 1 COMMENT 'Number of simultaneous surgeries (usually 1)',
  `hourly_rate` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'OT charge per hour',
  `minimum_charge_hours` DECIMAL(3, 1) DEFAULT 2.0 COMMENT 'Minimum chargeable hours',
  `equipment` JSON DEFAULT NULL COMMENT 'Available equipment list',
  `status` ENUM('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ot_number` (`ot_number`),
  INDEX `idx_specialty` (`specialty`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default OT data
INSERT INTO `operation_theatres` (`ot_number`, `ot_name`, `specialty`, `hourly_rate`, `minimum_charge_hours`, `status`) VALUES
('OT 1', 'OT 1 (General Surgery)', 'General Surgery', 5000.00, 2.0, 'active'),
('OT 2', 'OT 2 (Orthopedics)', 'Orthopedics', 5000.00, 2.0, 'active'),
('OT 3', 'OT 3 (Cardiothoracic)', 'Cardiothoracic', 8000.00, 3.0, 'active'),
('OT 4', 'OT 4 (Neurosurgery)', 'Neurosurgery', 8000.00, 3.0, 'active'),
('OT 5', 'OT 5 (ENT & Ophthalmology)', 'ENT', 4000.00, 1.5, 'active'),
('OT 6', 'OT 6 (Obstetrics & Gynecology)', 'Obstetrics', 5000.00, 2.0, 'active')
ON DUPLICATE KEY UPDATE `ot_name` = VALUES(`ot_name`);

