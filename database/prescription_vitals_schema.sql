-- Prescription Vitals Schema
-- This file extends the prescriptions table with vital signs support

-- ============================================
-- Add Vitals Fields to Prescriptions Table
-- ============================================
ALTER TABLE `prescriptions` 
ADD COLUMN `vitals_pulse` INT(3) DEFAULT NULL COMMENT 'Pulse/Heart Rate (bpm)' AFTER `follow_up_date`,
ADD COLUMN `vitals_temperature` DECIMAL(4,1) DEFAULT NULL COMMENT 'Temperature (°F)' AFTER `vitals_pulse`,
ADD COLUMN `vitals_blood_pressure` VARCHAR(20) DEFAULT NULL COMMENT 'Blood Pressure (e.g., 120/80)' AFTER `vitals_temperature`,
ADD COLUMN `vitals_respiratory_rate` INT(3) DEFAULT NULL COMMENT 'Respiratory Rate (breaths/min)' AFTER `vitals_blood_pressure`,
ADD COLUMN `vitals_blood_sugar` VARCHAR(20) DEFAULT NULL COMMENT 'Blood Sugar (mg/dL)' AFTER `vitals_respiratory_rate`,
ADD COLUMN `vitals_weight` VARCHAR(20) DEFAULT NULL COMMENT 'Weight (e.g., 70 kg)' AFTER `vitals_blood_sugar`,
ADD COLUMN `vitals_height` VARCHAR(20) DEFAULT NULL COMMENT 'Height (e.g., 170 cm)' AFTER `vitals_weight`,
ADD COLUMN `vitals_bmi` VARCHAR(20) DEFAULT NULL COMMENT 'BMI' AFTER `vitals_height`,
ADD COLUMN `vitals_oxygen_saturation` INT(3) DEFAULT NULL COMMENT 'SpO2 (%)' AFTER `vitals_bmi`,
ADD COLUMN `vitals_body_surface_area` VARCHAR(20) DEFAULT NULL COMMENT 'Body Surface Area' AFTER `vitals_oxygen_saturation`;

