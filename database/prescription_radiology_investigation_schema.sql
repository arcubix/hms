-- Prescription Radiology and Investigation Schema
-- This file extends the prescriptions table with radiology and investigation support

-- ============================================
-- Add Radiology and Investigation Fields to Prescriptions Table
-- ============================================
ALTER TABLE `prescriptions` 
ADD COLUMN IF NOT EXISTS `radiology_tests` TEXT DEFAULT NULL COMMENT 'Selected radiology tests (JSON array)' AFTER `vitals_body_surface_area`,
ADD COLUMN IF NOT EXISTS `radiology_body_part` VARCHAR(255) DEFAULT NULL COMMENT 'Body part/region for radiology' AFTER `radiology_tests`,
ADD COLUMN IF NOT EXISTS `radiology_indication` TEXT DEFAULT NULL COMMENT 'Clinical indication for radiology' AFTER `radiology_body_part`,
ADD COLUMN IF NOT EXISTS `investigation` TEXT DEFAULT NULL COMMENT 'Additional investigation details' AFTER `radiology_indication`;

