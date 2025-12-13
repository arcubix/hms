-- ============================================
-- IPD SURGERY CHARGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_surgery_charges` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_ot_schedules.id',
  `procedure_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_procedures.id',
  `admission_id` INT(11) NOT NULL COMMENT 'Foreign key to ipd_admissions.id',
  `patient_id` INT(11) NOT NULL COMMENT 'Foreign key to patients.id',
  `billing_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to ipd_billing.id',
  
  -- Surgeon Fees
  `surgeon_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `assistant_surgeon_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `surgeon_share_percentage` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Surgeon share % if applicable',
  `surgeon_share_amount` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- OT Charges
  `ot_room_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_equipment_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_duration_hours` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Actual OT usage in hours',
  `ot_rate_per_hour` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_minimum_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `ot_overtime_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Anesthesia Charges
  `anesthetist_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `anesthesia_type_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `anesthesia_duration_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Consumables
  `consumables_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `implants_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `consumables_details` JSON DEFAULT NULL COMMENT 'Breakdown of consumables used',
  
  -- Procedure Charges
  `procedure_base_charge` DECIMAL(10, 2) DEFAULT 0.00,
  `procedure_complexity_multiplier` DECIMAL(3, 2) DEFAULT 1.00,
  `procedure_final_charge` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Totals
  `subtotal` DECIMAL(10, 2) DEFAULT 0.00,
  `discount` DECIMAL(10, 2) DEFAULT 0.00,
  `tax` DECIMAL(10, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Payment Status
  `advance_paid` DECIMAL(10, 2) DEFAULT 0.00,
  `paid_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `due_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `payment_status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_procedure_id` (`procedure_id`),
  INDEX `idx_admission_id` (`admission_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_billing_id` (`billing_id`),
  INDEX `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- IPD SURGERY CONSUMABLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `ipd_surgery_consumables` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ot_schedule_id` INT(11) NOT NULL,
  `surgery_charges_id` INT(11) DEFAULT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_type` ENUM('instrument', 'disposable', 'implant', 'equipment', 'other') NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL COMMENT 'For implants',
  `batch_number` VARCHAR(100) DEFAULT NULL COMMENT 'For consumables',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  INDEX `idx_ot_schedule_id` (`ot_schedule_id`),
  INDEX `idx_surgery_charges_id` (`surgery_charges_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

