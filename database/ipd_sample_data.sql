-- IPD Module Sample Data
-- This file contains sample data for testing the IPD Management System
-- Execute this after creating all IPD schema tables

USE hms_db;

-- ============================================
-- IPD WARDS SAMPLE DATA
-- ============================================
INSERT INTO `ipd_wards` (`name`, `type`, `building`, `floor_id`, `total_beds`, `incharge_user_id`, `contact`, `email`, `facilities`, `description`, `status`, `established_date`, `created_by`) VALUES
('General Ward A', 'General', 'Main Building', 1, 30, NULL, '+1234567890', 'ward-a@hospital.com', '["AC", "TV", "Washroom", "Nurse Call"]', 'General ward for medical patients', 'active', '2020-01-15', 1),
('General Ward B', 'General', 'Main Building', 1, 25, NULL, '+1234567891', 'ward-b@hospital.com', '["AC", "TV", "Washroom", "Nurse Call"]', 'General ward for surgical patients', 'active', '2020-01-15', 1),
('ICU - Intensive Care Unit', 'ICU', 'Main Building', 2, 12, NULL, '+1234567892', 'icu@hospital.com', '["Ventilator", "Monitor", "AC", "Isolation"]', 'Intensive care unit for critical patients', 'active', '2019-06-01', 1),
('CCU - Cardiac Care Unit', 'CCU', 'Main Building', 2, 10, NULL, '+1234567893', 'ccu@hospital.com', '["Cardiac Monitor", "Defibrillator", "AC", "Isolation"]', 'Cardiac care unit for heart patients', 'active', '2019-08-10', 1),
('NICU - Neonatal ICU', 'NICU', 'Pediatric Wing', 3, 8, NULL, '+1234567894', 'nicu@hospital.com', '["Incubator", "Monitor", "AC", "Isolation"]', 'Neonatal intensive care unit', 'active', '2020-03-20', 1),
('HDU - High Dependency Unit', 'HDU', 'Main Building', 2, 15, NULL, '+1234567895', 'hdu@hospital.com', '["Monitor", "Oxygen", "AC", "Nurse Call"]', 'High dependency unit for post-operative care', 'active', '2020-05-12', 1),
('Isolation Ward', 'Isolation', 'Isolation Building', 1, 6, NULL, '+1234567896', 'isolation@hospital.com', '["Isolation", "AC", "Negative Pressure"]', 'Isolation ward for infectious diseases', 'active', '2021-01-10', 1)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================
-- IPD BEDS SAMPLE DATA
-- ============================================
-- Get ward IDs (assuming they exist)
SET @ward_gen_a = (SELECT id FROM ipd_wards WHERE name = 'General Ward A' LIMIT 1);
SET @ward_gen_b = (SELECT id FROM ipd_wards WHERE name = 'General Ward B' LIMIT 1);
SET @ward_icu = (SELECT id FROM ipd_wards WHERE name = 'ICU - Intensive Care Unit' LIMIT 1);
SET @ward_ccu = (SELECT id FROM ipd_wards WHERE name = 'CCU - Cardiac Care Unit' LIMIT 1);
SET @ward_nicu = (SELECT id FROM ipd_wards WHERE name = 'NICU - Neonatal ICU' LIMIT 1);
SET @ward_hdu = (SELECT id FROM ipd_wards WHERE name = 'HDU - High Dependency Unit' LIMIT 1);
SET @ward_iso = (SELECT id FROM ipd_wards WHERE name = 'Isolation Ward' LIMIT 1);

-- General Ward A beds (30 beds)
INSERT INTO `ipd_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `daily_rate`, `facilities`, `created_by`) VALUES
(@ward_gen_a, 'GEN-A-01', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-02', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-03', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-04', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-05', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-06', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-07', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-08', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-09', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-10', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-11', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-12', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-13', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-14', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-15', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-16', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-17', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-18', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-19', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-20', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-21', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-22', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-23', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-24', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-25', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-26', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-27', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-28', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-29', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_a, 'GEN-A-30', 'General', 'available', 500.00, '["AC", "TV"]', 1)
ON DUPLICATE KEY UPDATE `bed_number` = `bed_number`;

-- General Ward B beds (25 beds)
INSERT INTO `ipd_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `daily_rate`, `facilities`, `created_by`) VALUES
(@ward_gen_b, 'GEN-B-01', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-02', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-03', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-04', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-05', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-06', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-07', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-08', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-09', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-10', 'General', 'occupied', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-11', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-12', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-13', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-14', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-15', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-16', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-17', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-18', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-19', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-20', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-21', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-22', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-23', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-24', 'General', 'available', 500.00, '["AC", "TV"]', 1),
(@ward_gen_b, 'GEN-B-25', 'General', 'available', 500.00, '["AC", "TV"]', 1)
ON DUPLICATE KEY UPDATE `bed_number` = `bed_number`;

-- ICU beds (12 beds)
INSERT INTO `ipd_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `daily_rate`, `facilities`, `created_by`) VALUES
(@ward_icu, 'ICU-01', 'ICU', 'occupied', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-02', 'ICU', 'occupied', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-03', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-04', 'ICU', 'occupied', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-05', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-06', 'ICU', 'occupied', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-07', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-08', 'ICU', 'occupied', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-09', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-10', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-11', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1),
(@ward_icu, 'ICU-12', 'ICU', 'available', 2000.00, '["Ventilator", "Monitor", "AC"]', 1)
ON DUPLICATE KEY UPDATE `bed_number` = `bed_number`;

-- CCU beds (10 beds)
INSERT INTO `ipd_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `daily_rate`, `facilities`, `created_by`) VALUES
(@ward_ccu, 'CCU-01', 'ICU', 'occupied', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-02', 'ICU', 'occupied', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-03', 'ICU', 'available', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-04', 'ICU', 'occupied', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-05', 'ICU', 'available', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-06', 'ICU', 'available', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-07', 'ICU', 'occupied', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-08', 'ICU', 'available', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-09', 'ICU', 'available', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1),
(@ward_ccu, 'CCU-10', 'ICU', 'available', 1800.00, '["Cardiac Monitor", "Defibrillator", "AC"]', 1)
ON DUPLICATE KEY UPDATE `bed_number` = `bed_number`;

-- HDU beds (15 beds)
INSERT INTO `ipd_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `daily_rate`, `facilities`, `created_by`) VALUES
(@ward_hdu, 'HDU-01', 'General', 'occupied', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-02', 'General', 'occupied', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-03', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-04', 'General', 'occupied', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-05', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-06', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-07', 'General', 'occupied', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-08', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-09', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-10', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-11', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-12', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-13', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-14', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1),
(@ward_hdu, 'HDU-15', 'General', 'available', 1200.00, '["Monitor", "Oxygen", "AC"]', 1)
ON DUPLICATE KEY UPDATE `bed_number` = `bed_number`;

-- ============================================
-- IPD ROOMS SAMPLE DATA
-- ============================================
INSERT INTO `ipd_rooms` (`room_number`, `room_type`, `floor_id`, `building`, `status`, `daily_rate`, `facilities`, `amenities`, `capacity`, `description`, `created_by`) VALUES
('PRV-101', 'Private', 2, 'Private Wing', 'occupied', 3000.00, '["AC", "TV", "Attached Bathroom", "WiFi"]', '["Refrigerator", "Sofa", "Coffee Maker"]', 1, 'Private room with attached bathroom', 1),
('PRV-102', 'Private', 2, 'Private Wing', 'available', 3000.00, '["AC", "TV", "Attached Bathroom", "WiFi"]', '["Refrigerator", "Sofa", "Coffee Maker"]', 1, 'Private room with attached bathroom', 1),
('PRV-103', 'Private', 2, 'Private Wing', 'occupied', 3000.00, '["AC", "TV", "Attached Bathroom", "WiFi"]', '["Refrigerator", "Sofa", "Coffee Maker"]', 1, 'Private room with attached bathroom', 1),
('PRV-104', 'Private', 2, 'Private Wing', 'available', 3000.00, '["AC", "TV", "Attached Bathroom", "WiFi"]', '["Refrigerator", "Sofa", "Coffee Maker"]', 1, 'Private room with attached bathroom', 1),
('PRV-105', 'Private', 2, 'Private Wing', 'available', 3000.00, '["AC", "TV", "Attached Bathroom", "WiFi"]', '["Refrigerator", "Sofa", "Coffee Maker"]', 1, 'Private room with attached bathroom', 1),
('DLX-201', 'Deluxe', 3, 'Private Wing', 'occupied', 5000.00, '["AC", "TV", "Attached Bathroom", "WiFi", "Mini Bar"]', '["Refrigerator", "Sofa", "Coffee Maker", "Microwave", "Dining Table"]', 1, 'Deluxe room with premium amenities', 1),
('DLX-202', 'Deluxe', 3, 'Private Wing', 'available', 5000.00, '["AC", "TV", "Attached Bathroom", "WiFi", "Mini Bar"]', '["Refrigerator", "Sofa", "Coffee Maker", "Microwave", "Dining Table"]', 1, 'Deluxe room with premium amenities', 1),
('DLX-203', 'Deluxe', 3, 'Private Wing', 'available', 5000.00, '["AC", "TV", "Attached Bathroom", "WiFi", "Mini Bar"]', '["Refrigerator", "Sofa", "Coffee Maker", "Microwave", "Dining Table"]', 1, 'Deluxe room with premium amenities', 1),
('SUITE-301', 'Suite', 4, 'Private Wing', 'available', 8000.00, '["AC", "TV", "Attached Bathroom", "WiFi", "Mini Bar", "Living Room"]', '["Refrigerator", "Sofa", "Coffee Maker", "Microwave", "Dining Table", "Work Desk"]', 2, 'Suite with living room and premium amenities', 1),
('SUITE-302', 'Suite', 4, 'Private Wing', 'available', 8000.00, '["AC", "TV", "Attached Bathroom", "WiFi", "Mini Bar", "Living Room"]', '["Refrigerator", "Sofa", "Coffee Maker", "Microwave", "Dining Table", "Work Desk"]', 2, 'Suite with living room and premium amenities', 1)
ON DUPLICATE KEY UPDATE `room_number` = `room_number`;

-- ============================================
-- IPD ADMISSIONS SAMPLE DATA
-- ============================================
-- Get patient IDs (assuming sample patients exist)
SET @patient1 = (SELECT id FROM patients WHERE patient_id = 'P001' LIMIT 1);
SET @patient2 = (SELECT id FROM patients WHERE patient_id = 'P002' LIMIT 1);
SET @patient3 = (SELECT id FROM patients WHERE patient_id = 'P003' LIMIT 1);

-- Get doctor IDs (assuming sample doctors exist)
SET @doctor1 = (SELECT id FROM doctors WHERE doctor_id = 'D001' LIMIT 1);
SET @doctor2 = (SELECT id FROM doctors WHERE doctor_id = 'D002' LIMIT 1);
SET @doctor3 = (SELECT id FROM doctors WHERE doctor_id = 'D003' LIMIT 1);
SET @doctor4 = (SELECT id FROM doctors WHERE doctor_id = 'D005' LIMIT 1);

-- Get bed IDs
SET @bed1 = (SELECT id FROM ipd_beds WHERE bed_number = 'GEN-A-01' LIMIT 1);
SET @bed2 = (SELECT id FROM ipd_beds WHERE bed_number = 'GEN-A-02' LIMIT 1);
SET @bed3 = (SELECT id FROM ipd_beds WHERE bed_number = 'ICU-01' LIMIT 1);
SET @bed4 = (SELECT id FROM ipd_beds WHERE bed_number = 'CCU-01' LIMIT 1);
SET @bed5 = (SELECT id FROM ipd_beds WHERE bed_number = 'GEN-B-01' LIMIT 1);
SET @bed6 = (SELECT id FROM ipd_beds WHERE bed_number = 'HDU-01' LIMIT 1);

-- Get room IDs
SET @room1 = (SELECT id FROM ipd_rooms WHERE room_number = 'PRV-101' LIMIT 1);
SET @room2 = (SELECT id FROM ipd_rooms WHERE room_number = 'DLX-201' LIMIT 1);

-- Get ward IDs for admissions
SET @ward_gen_a_id = (SELECT id FROM ipd_wards WHERE name = 'General Ward A' LIMIT 1);
SET @ward_icu_id = (SELECT id FROM ipd_wards WHERE name = 'ICU - Intensive Care Unit' LIMIT 1);
SET @ward_ccu_id = (SELECT id FROM ipd_wards WHERE name = 'CCU - Cardiac Care Unit' LIMIT 1);
SET @ward_gen_b_id = (SELECT id FROM ipd_wards WHERE name = 'General Ward B' LIMIT 1);
SET @ward_hdu_id = (SELECT id FROM ipd_wards WHERE name = 'HDU - High Dependency Unit' LIMIT 1);

INSERT INTO `ipd_admissions` (
  `ipd_number`, `patient_id`, `uhid`, `admission_date`, `admission_time`, 
  `admission_type`, `department`, `consulting_doctor_id`, `admitted_by_user_id`, 
  `ward_id`, `bed_id`, `room_id`, `diagnosis`, `estimated_duration`, 
  `actual_duration`, `status`, `insurance_provider`, `insurance_policy_number`, 
  `insurance_coverage_amount`, `insurance_approval_number`, `advance_payment`, 
  `payment_mode`, `created_by`
) VALUES
('IPD-2024-0001', @patient1, 'UHID-001', '2024-11-01', '10:30:00', 'Emergency', 'Cardiology', @doctor1, 1, @ward_ccu_id, @bed4, NULL, 'Acute Myocardial Infarction', 7, 5, 'stable', 'Health Insurance Co', 'POL-12345', 50000.00, 'APP-2024-001', 10000.00, 'Insurance', 1),
('IPD-2024-0002', @patient2, 'UHID-002', '2024-11-02', '14:15:00', 'Planned', 'General Medicine', @doctor2, 1, @ward_gen_a_id, @bed1, NULL, 'Pneumonia with complications', 5, 4, 'under-treatment', NULL, NULL, 0.00, NULL, 5000.00, 'Cash', 1),
('IPD-2024-0003', @patient3, 'UHID-003', '2024-11-03', '08:00:00', 'Emergency', 'Neurology', @doctor4, 1, @ward_icu_id, @bed3, NULL, 'Stroke - Ischemic', 10, 8, 'critical', 'Medicare Plus', 'POL-67890', 100000.00, 'APP-2024-002', 20000.00, 'Insurance', 1),
('IPD-2024-0004', @patient1, 'UHID-001', '2024-11-05', '11:20:00', 'Planned', 'Orthopedics', @doctor3, 1, @ward_gen_b_id, @bed5, NULL, 'Hip Replacement Surgery', 7, NULL, 'admitted', NULL, NULL, 0.00, NULL, 15000.00, 'Card', 1),
('IPD-2024-0005', @patient2, 'UHID-002', '2024-11-06', '16:45:00', 'Planned', 'General Medicine', @doctor2, 1, @ward_gen_a_id, @bed2, NULL, 'Diabetes Management', 3, NULL, 'admitted', NULL, NULL, 0.00, NULL, 3000.00, 'UPI', 1),
('IPD-2024-0006', @patient3, 'UHID-003', '2024-11-07', '09:30:00', 'Transfer', 'Cardiology', @doctor1, 1, @ward_hdu_id, @bed6, NULL, 'Post-operative Cardiac Care', 5, NULL, 'admitted', 'Health Insurance Co', 'POL-12345', 30000.00, 'APP-2024-003', 8000.00, 'Insurance', 1),
('IPD-2024-0007', @patient1, 'UHID-001', '2024-10-25', '13:00:00', 'Planned', 'General Medicine', @doctor2, 1, @ward_gen_a_id, NULL, @room1, 'Hypertension Management', 4, 4, 'discharged', NULL, NULL, 0.00, NULL, 8000.00, 'Card', 1),
('IPD-2024-0008', @patient2, 'UHID-002', '2024-10-28', '10:15:00', 'Planned', 'Cardiology', @doctor1, 1, NULL, NULL, @room2, 'Cardiac Evaluation', 3, 3, 'discharged', 'Medicare Plus', 'POL-67890', 20000.00, 'APP-2024-004', 10000.00, 'Insurance', 1)
ON DUPLICATE KEY UPDATE `ipd_number` = `ipd_number`;

-- Update bed status for occupied beds
UPDATE `ipd_beds` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0001' LIMIT 1) WHERE bed_number = 'CCU-01';
UPDATE `ipd_beds` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0002' LIMIT 1) WHERE bed_number = 'GEN-A-01';
UPDATE `ipd_beds` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0003' LIMIT 1) WHERE bed_number = 'ICU-01';
UPDATE `ipd_beds` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0004' LIMIT 1) WHERE bed_number = 'GEN-B-01';
UPDATE `ipd_beds` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0005' LIMIT 1) WHERE bed_number = 'GEN-A-02';
UPDATE `ipd_beds` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0006' LIMIT 1) WHERE bed_number = 'HDU-01';

-- Update room status for occupied rooms
UPDATE `ipd_rooms` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0007' LIMIT 1) WHERE room_number = 'PRV-101';
UPDATE `ipd_rooms` SET `current_admission_id` = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0008' LIMIT 1) WHERE room_number = 'DLX-201';

-- ============================================
-- IPD VITAL SIGNS SAMPLE DATA
-- ============================================
SET @admission1 = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0001' LIMIT 1);
SET @admission2 = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0002' LIMIT 1);
SET @admission3 = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0003' LIMIT 1);
SET @admission4 = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0004' LIMIT 1);
SET @admission5 = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0005' LIMIT 1);
SET @admission6 = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0006' LIMIT 1);

INSERT INTO `ipd_vital_signs` (
  `admission_id`, `patient_id`, `recorded_date`, `recorded_time`, 
  `recorded_by_user_id`, `temperature`, `blood_pressure_systolic`, 
  `blood_pressure_diastolic`, `heart_rate`, `respiratory_rate`, 
  `oxygen_saturation`, `blood_sugar`, `pain_score`, `consciousness_level`, `notes`
) VALUES
-- Admission 1 (Cardiac patient)
(@admission1, @patient1, '2024-11-01', '10:45:00', 1, 37.2, 130, 85, 78, 18, 98.5, 110, 2, 'Alert', 'Patient stable, vitals normal'),
(@admission1, @patient1, '2024-11-01', '14:30:00', 1, 37.0, 125, 80, 72, 16, 99.0, 105, 1, 'Alert', 'Improving condition'),
(@admission1, @patient1, '2024-11-02', '08:00:00', 1, 36.8, 120, 78, 70, 16, 99.2, 100, 0, 'Alert', 'Vitals stable'),
(@admission1, @patient1, '2024-11-02', '14:00:00', 1, 36.9, 118, 75, 68, 15, 99.5, 98, 0, 'Alert', 'Excellent progress'),
(@admission1, @patient1, '2024-11-03', '08:00:00', 1, 36.7, 115, 72, 65, 14, 99.8, 95, 0, 'Alert', 'Patient recovering well'),

-- Admission 2 (Pneumonia)
(@admission2, @patient2, '2024-11-02', '14:30:00', 1, 38.5, 140, 90, 95, 22, 94.0, 120, 5, 'Alert', 'Fever present, monitoring closely'),
(@admission2, @patient2, '2024-11-02', '20:00:00', 1, 38.2, 135, 88, 92, 20, 95.0, 115, 4, 'Alert', 'Fever reducing'),
(@admission2, @patient2, '2024-11-03', '08:00:00', 1, 37.8, 130, 85, 88, 18, 96.5, 110, 3, 'Alert', 'Condition improving'),
(@admission2, @patient2, '2024-11-03', '14:00:00', 1, 37.5, 128, 82, 85, 17, 97.5, 108, 2, 'Alert', 'Good response to treatment'),
(@admission2, @patient2, '2024-11-04', '08:00:00', 1, 37.2, 125, 80, 80, 16, 98.0, 105, 1, 'Alert', 'Recovering well'),

-- Admission 3 (Stroke - Critical)
(@admission3, @patient3, '2024-11-03', '08:15:00', 1, 37.8, 160, 100, 105, 24, 92.0, 140, 8, 'Drowsy', 'Critical condition, monitoring continuously'),
(@admission3, @patient3, '2024-11-03', '12:00:00', 1, 37.6, 155, 95, 100, 22, 93.5, 135, 7, 'Drowsy', 'Slight improvement'),
(@admission3, @patient3, '2024-11-03', '18:00:00', 1, 37.4, 150, 92, 98, 21, 94.5, 130, 6, 'Drowsy', 'Stable but critical'),
(@admission3, @patient3, '2024-11-04', '08:00:00', 1, 37.3, 145, 90, 95, 20, 95.0, 125, 5, 'Drowsy', 'Gradual improvement'),
(@admission3, @patient3, '2024-11-04', '14:00:00', 1, 37.2, 142, 88, 92, 19, 95.5, 120, 4, 'Alert', 'Patient becoming more alert'),
(@admission3, @patient3, '2024-11-05', '08:00:00', 1, 37.1, 140, 85, 90, 18, 96.0, 118, 3, 'Alert', 'Significant improvement'),

-- Admission 4 (Hip Replacement)
(@admission4, @patient1, '2024-11-05', '11:30:00', 1, 37.0, 125, 80, 75, 16, 98.5, 110, 6, 'Alert', 'Post-operative vitals'),
(@admission4, @patient1, '2024-11-05', '16:00:00', 1, 37.2, 128, 82, 78, 17, 98.0, 115, 5, 'Alert', 'Post-op monitoring'),
(@admission4, @patient1, '2024-11-06', '08:00:00', 1, 37.1, 122, 78, 72, 16, 98.8, 108, 4, 'Alert', 'Recovering from surgery'),

-- Admission 5 (Diabetes)
(@admission5, @patient2, '2024-11-06', '17:00:00', 1, 36.8, 130, 85, 82, 18, 97.5, 180, 2, 'Alert', 'Blood sugar elevated, adjusting medication'),
(@admission5, @patient2, '2024-11-07', '08:00:00', 1, 36.9, 128, 83, 80, 17, 98.0, 165, 1, 'Alert', 'Blood sugar improving'),

-- Admission 6 (Post-operative Cardiac)
(@admission6, @patient3, '2024-11-07', '09:45:00', 1, 37.0, 135, 88, 85, 19, 96.5, 125, 3, 'Alert', 'Post-operative cardiac care'),
(@admission6, @patient3, '2024-11-07', '14:00:00', 1, 36.9, 132, 85, 82, 18, 97.0, 120, 2, 'Alert', 'Stable post-op condition')
ON DUPLICATE KEY UPDATE `recorded_date` = `recorded_date`;

-- ============================================
-- IPD TREATMENT ORDERS SAMPLE DATA
-- ============================================
INSERT INTO `ipd_treatment_orders` (
  `admission_id`, `patient_id`, `order_date`, `order_time`, 
  `ordered_by_doctor_id`, `order_type`, `order_details`, 
  `frequency`, `duration`, `priority`, `status`, `start_date`, `end_date`, `notes`
) VALUES
-- Admission 1 orders
(@admission1, @patient1, '2024-11-01', '11:00:00', @doctor1, 'Medication', 'Aspirin 75mg daily', 'Once daily', '7 days', 'routine', 'completed', '2024-11-01', '2024-11-07', 'Cardiac medication'),
(@admission1, @patient1, '2024-11-01', '11:00:00', @doctor1, 'Medication', 'Atorvastatin 40mg daily', 'Once daily', '7 days', 'routine', 'completed', '2024-11-01', '2024-11-07', 'Cholesterol management'),
(@admission1, @patient1, '2024-11-01', '11:00:00', @doctor1, 'Lab Test', 'Complete Blood Count (CBC)', 'Once', '1 day', 'routine', 'completed', '2024-11-01', '2024-11-01', 'Baseline blood work'),
(@admission1, @patient1, '2024-11-01', '11:00:00', @doctor1, 'Lab Test', 'Cardiac Enzymes (Troponin)', 'Once', '1 day', 'urgent', 'completed', '2024-11-01', '2024-11-01', 'Cardiac marker test'),
(@admission1, @patient1, '2024-11-02', '08:00:00', @doctor1, 'Imaging', 'Echocardiogram', 'Once', '1 day', 'routine', 'completed', '2024-11-02', '2024-11-02', 'Cardiac function assessment'),

-- Admission 2 orders
(@admission2, @patient2, '2024-11-02', '14:45:00', @doctor2, 'Medication', 'Amoxicillin 500mg', 'Three times daily', '7 days', 'urgent', 'in-progress', '2024-11-02', '2024-11-08', 'Antibiotic for pneumonia'),
(@admission2, @patient2, '2024-11-02', '14:45:00', @doctor2, 'Medication', 'Paracetamol 500mg', 'Four times daily', '5 days', 'routine', 'in-progress', '2024-11-02', '2024-11-06', 'Fever management'),
(@admission2, @patient2, '2024-11-02', '14:45:00', @doctor2, 'Lab Test', 'Chest X-Ray', 'Once', '1 day', 'urgent', 'completed', '2024-11-02', '2024-11-02', 'Pneumonia confirmation'),
(@admission2, @patient2, '2024-11-02', '14:45:00', @doctor2, 'Lab Test', 'Sputum Culture', 'Once', '1 day', 'routine', 'completed', '2024-11-02', '2024-11-02', 'Bacterial identification'),

-- Admission 3 orders (Critical)
(@admission3, @patient3, '2024-11-03', '08:30:00', @doctor4, 'Medication', 'Aspirin 150mg', 'Once daily', '10 days', 'stat', 'in-progress', '2024-11-03', '2024-11-12', 'Stroke prevention'),
(@admission3, @patient3, '2024-11-03', '08:30:00', @doctor4, 'Medication', 'Clopidogrel 75mg', 'Once daily', '10 days', 'stat', 'in-progress', '2024-11-03', '2024-11-12', 'Antiplatelet therapy'),
(@admission3, @patient3, '2024-11-03', '08:30:00', @doctor4, 'Imaging', 'CT Scan - Brain', 'Once', '1 day', 'stat', 'completed', '2024-11-03', '2024-11-03', 'Stroke assessment'),
(@admission3, @patient3, '2024-11-03', '08:30:00', @doctor4, 'Imaging', 'MRI - Brain', 'Once', '1 day', 'urgent', 'completed', '2024-11-03', '2024-11-03', 'Detailed brain imaging'),
(@admission3, @patient3, '2024-11-03', '08:30:00', @doctor4, 'Lab Test', 'Coagulation Profile', 'Once', '1 day', 'urgent', 'completed', '2024-11-03', '2024-11-03', 'Bleeding risk assessment'),
(@admission3, @patient3, '2024-11-04', '08:00:00', @doctor4, 'Physiotherapy', 'Physical Therapy - Upper Limb', 'Twice daily', '7 days', 'routine', 'pending', '2024-11-04', '2024-11-10', 'Rehabilitation therapy'),

-- Admission 4 orders
(@admission4, @patient1, '2024-11-05', '12:00:00', @doctor3, 'Medication', 'Pain Management - Morphine', 'As needed', '3 days', 'urgent', 'in-progress', '2024-11-05', '2024-11-07', 'Post-operative pain control'),
(@admission4, @patient1, '2024-11-05', '12:00:00', @doctor3, 'Medication', 'Antibiotic - Cefazolin', 'Three times daily', '5 days', 'routine', 'in-progress', '2024-11-05', '2024-11-09', 'Surgical site infection prevention'),
(@admission4, @patient1, '2024-11-05', '12:00:00', @doctor3, 'Physiotherapy', 'Hip Mobilization', 'Once daily', '7 days', 'routine', 'pending', '2024-11-06', '2024-11-12', 'Post-surgery rehabilitation'),

-- Admission 5 orders
(@admission5, @patient2, '2024-11-06', '17:15:00', @doctor2, 'Medication', 'Insulin - Regular', 'Before meals', '5 days', 'urgent', 'in-progress', '2024-11-06', '2024-11-10', 'Blood sugar control'),
(@admission5, @patient2, '2024-11-06', '17:15:00', @doctor2, 'Diet', 'Diabetic Diet - Controlled Carbohydrates', 'Three meals daily', '5 days', 'routine', 'in-progress', '2024-11-06', '2024-11-10', 'Dietary management'),
(@admission5, @patient2, '2024-11-06', '17:15:00', @doctor2, 'Lab Test', 'HbA1c Test', 'Once', '1 day', 'routine', 'completed', '2024-11-06', '2024-11-06', 'Long-term glucose control'),

-- Admission 6 orders
(@admission6, @patient3, '2024-11-07', '10:00:00', @doctor1, 'Medication', 'Beta Blocker - Metoprolol', 'Twice daily', '7 days', 'routine', 'in-progress', '2024-11-07', '2024-11-13', 'Heart rate control'),
(@admission6, @patient3, '2024-11-07', '10:00:00', @doctor1, 'Medication', 'ACE Inhibitor - Lisinopril', 'Once daily', '7 days', 'routine', 'in-progress', '2024-11-07', '2024-11-13', 'Blood pressure management'),
(@admission6, @patient3, '2024-11-07', '10:00:00', @doctor1, 'Lab Test', 'Cardiac Enzymes Follow-up', 'Once', '1 day', 'routine', 'pending', '2024-11-08', '2024-11-08', 'Post-operative cardiac markers')
ON DUPLICATE KEY UPDATE `order_date` = `order_date`;

-- ============================================
-- IPD NURSING NOTES SAMPLE DATA
-- ============================================
INSERT INTO `ipd_nursing_notes` (
  `admission_id`, `patient_id`, `date`, `time`, `shift`, 
  `nurse_user_id`, `category`, `note`, `severity`, `created_at`
) VALUES
-- Admission 1 notes
(@admission1, @patient1, '2024-11-01', '10:45:00', 'Morning', 1, 'Assessment', 'Patient admitted with chest pain. Vitals stable. Started on cardiac medications.', 'medium', '2024-11-01 10:45:00'),
(@admission1, @patient1, '2024-11-01', '14:30:00', 'Evening', 1, 'General', 'Patient resting comfortably. No complaints of chest pain. Family visited.', 'low', '2024-11-01 14:30:00'),
(@admission1, @patient1, '2024-11-02', '08:00:00', 'Morning', 1, 'Vital Signs', 'Morning vitals recorded. Patient stable. Breakfast served.', 'low', '2024-11-02 08:00:00'),
(@admission1, @patient1, '2024-11-02', '20:00:00', 'Night', 1, 'General', 'Patient sleeping well. No distress. Medications given as scheduled.', 'low', '2024-11-02 20:00:00'),

-- Admission 2 notes
(@admission2, @patient2, '2024-11-02', '14:45:00', 'Evening', 1, 'Assessment', 'Patient admitted with fever and cough. Started on antibiotics. Oxygen saturation monitored.', 'high', '2024-11-02 14:45:00'),
(@admission2, @patient2, '2024-11-02', '22:00:00', 'Night', 1, 'Medication', 'Antibiotics administered. Fever reduced from 38.5 to 38.2. Patient comfortable.', 'medium', '2024-11-02 22:00:00'),
(@admission2, @patient2, '2024-11-03', '08:00:00', 'Morning', 1, 'General', 'Patient condition improving. Fever reducing. Appetite returning.', 'low', '2024-11-03 08:00:00'),

-- Admission 3 notes (Critical)
(@admission3, @patient3, '2024-11-03', '08:30:00', 'Morning', 1, 'Assessment', 'Critical patient admitted with stroke. Right side weakness observed. Continuous monitoring initiated.', 'high', '2024-11-03 08:30:00'),
(@admission3, @patient3, '2024-11-03', '12:00:00', 'Evening', 1, 'Vital Signs', 'Vitals monitored every hour. Blood pressure controlled. Patient drowsy but responsive.', 'high', '2024-11-03 12:00:00'),
(@admission3, @patient3, '2024-11-03', '18:00:00', 'Night', 1, 'General', 'Patient stable but critical. Family informed. Neurological checks performed.', 'high', '2024-11-03 18:00:00'),
(@admission3, @patient3, '2024-11-04', '08:00:00', 'Morning', 1, 'Assessment', 'Significant improvement noted. Patient more alert. Right side movement improving.', 'medium', '2024-11-04 08:00:00'),

-- Admission 4 notes
(@admission4, @patient1, '2024-11-05', '12:00:00', 'Evening', 1, 'Procedure', 'Post-operative care initiated. Surgical site clean. Pain management started.', 'medium', '2024-11-05 12:00:00'),
(@admission4, @patient1, '2024-11-05', '20:00:00', 'Night', 1, 'Medication', 'Pain medications administered. Patient comfortable. Wound dressing checked.', 'low', '2024-11-05 20:00:00'),

-- Admission 5 notes
(@admission5, @patient2, '2024-11-06', '17:30:00', 'Evening', 1, 'Assessment', 'Patient admitted for diabetes management. Blood sugar elevated. Insulin started.', 'medium', '2024-11-06 17:30:00'),
(@admission5, @patient2, '2024-11-07', '08:00:00', 'Morning', 1, 'Vital Signs', 'Blood sugar improving with insulin. Patient educated on diabetic diet.', 'low', '2024-11-07 08:00:00'),

-- Admission 6 notes
(@admission6, @patient3, '2024-11-07', '10:00:00', 'Morning', 1, 'Assessment', 'Post-operative cardiac patient. Vitals stable. Cardiac medications started.', 'medium', '2024-11-07 10:00:00')
ON DUPLICATE KEY UPDATE `date` = `date`;

-- ============================================
-- IPD BILLING SAMPLE DATA
-- ============================================
SET @admission1_id = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0001' LIMIT 1);
SET @admission2_id = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0002' LIMIT 1);
SET @admission7_id = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0007' LIMIT 1);
SET @admission8_id = (SELECT id FROM ipd_admissions WHERE ipd_number = 'IPD-2024-0008' LIMIT 1);

INSERT INTO `ipd_billing` (
  `admission_id`, `patient_id`, `billing_date`, 
  `room_charges`, `consultation_charges`, `medication_charges`, 
  `lab_charges`, `imaging_charges`, `procedure_charges`, 
  `other_charges`, `subtotal`, `discount`, `tax`, 
  `total_amount`, `advance_paid`, `insurance_covered`, 
  `due_amount`, `payment_status`, `created_by`
) VALUES
-- Admission 1 billing (5 days stay)
(@admission1_id, @patient1, '2024-11-06', 
  '{"bed_type": "CCU", "days": 5, "rate_per_day": 1800.00, "total": 9000.00}',
  '[{"doctor": "Dr. Michael Chen", "visits": 10, "rate_per_visit": 500.00, "total": 5000.00}]',
  2500.00,  -- Medication charges
  3500.00,  -- Lab charges
  4500.00,  -- Imaging charges
  '[{"procedure_name": "ECG", "date": "2024-11-01", "amount": 500.00}, {"procedure_name": "Echocardiogram", "date": "2024-11-02", "amount": 2000.00}]',
  '[{"description": "ICU Monitoring", "amount": 2000.00}]',
  26500.00,  -- Subtotal
  0.00,      -- Discount
  2650.00,   -- Tax (10%)
  29150.00,  -- Total
  10000.00,  -- Advance paid
  19150.00,  -- Insurance covered
  0.00,      -- Due amount
  'paid', 1),

-- Admission 2 billing (4 days stay)
(@admission2_id, @patient2, '2024-11-06', 
  '{"bed_type": "General", "days": 4, "rate_per_day": 500.00, "total": 2000.00}',
  '[{"doctor": "Dr. Sarah Williams", "visits": 8, "rate_per_visit": 400.00, "total": 3200.00}]',
  1500.00,  -- Medication charges
  2000.00,  -- Lab charges
  1200.00,  -- Imaging charges
  '[{"procedure_name": "Chest X-Ray", "date": "2024-11-02", "amount": 800.00}]',
  NULL,
  9900.00,  -- Subtotal
  0.00,     -- Discount
  990.00,   -- Tax
  10890.00, -- Total
  5000.00,  -- Advance paid
  0.00,     -- Insurance covered
  5890.00,  -- Due amount
  'partial', 1),

-- Admission 7 billing (Discharged - 4 days stay)
(@admission7_id, @patient1, '2024-10-29', 
  '{"room_type": "Private", "days": 4, "rate_per_day": 3000.00, "total": 12000.00}',
  '[{"doctor": "Dr. Sarah Williams", "visits": 6, "rate_per_visit": 400.00, "total": 2400.00}]',
  2000.00,  -- Medication charges
  1500.00,  -- Lab charges
  0.00,     -- Imaging charges
  NULL,
  NULL,
  17900.00, -- Subtotal
  0.00,     -- Discount
  1790.00,  -- Tax
  19690.00, -- Total
  8000.00,  -- Advance paid
  0.00,     -- Insurance covered
  11690.00, -- Due amount
  'partial', 1),

-- Admission 8 billing (Discharged - 3 days stay)
(@admission8_id, @patient2, '2024-10-31', 
  '{"room_type": "Deluxe", "days": 3, "rate_per_day": 5000.00, "total": 15000.00}',
  '[{"doctor": "Dr. Michael Chen", "visits": 5, "rate_per_visit": 500.00, "total": 2500.00}]',
  1800.00,  -- Medication charges
  3000.00,  -- Lab charges
  5000.00,  -- Imaging charges
  '[{"procedure_name": "ECG", "date": "2024-10-28", "amount": 500.00}, {"procedure_name": "Stress Test", "date": "2024-10-29", "amount": 2000.00}]',
  NULL,
  27800.00, -- Subtotal
  0.00,     -- Discount
  2780.00,  -- Tax
  30580.00, -- Total
  10000.00, -- Advance paid
  17800.00, -- Insurance covered
  2780.00,  -- Due amount
  'partial', 1)
ON DUPLICATE KEY UPDATE `billing_date` = `billing_date`;

-- ============================================
-- IPD DISCHARGE SUMMARIES SAMPLE DATA
-- ============================================
INSERT INTO `ipd_discharge_summaries` (
  `admission_id`, `patient_id`, `discharge_date`, `discharge_time`, 
  `admitting_diagnosis`, `final_diagnosis`, `treatment_given`, 
  `procedures_performed`, `condition_at_discharge`, `discharge_advice`, 
  `medications`, `follow_up_date`, `follow_up_doctor_id`, 
  `dietary_advice`, `activity_restrictions`, `discharging_doctor_id`, `created_by`
) VALUES
-- Admission 7 discharge
(@admission7_id, @patient1, '2024-10-29', '14:00:00', 
  'Hypertension', 
  'Hypertension - Controlled', 
  'Patient admitted for hypertension management. Blood pressure monitored and medications adjusted. Lifestyle counseling provided.',
  NULL,
  'Improved',
  'Continue medications as prescribed. Monitor blood pressure daily. Follow low-sodium diet. Regular exercise recommended. Return if BP > 140/90.',
  '[{"name": "Amlodipine 5mg", "dosage": "5mg", "frequency": "Once daily", "duration": "30 days"}, {"name": "Lisinopril 10mg", "dosage": "10mg", "frequency": "Once daily", "duration": "30 days"}]',
  '2024-11-15',
  @doctor2,
  'Low sodium diet. Limit salt intake. Increase fruits and vegetables.',
  'Light exercise allowed. Avoid heavy lifting for 1 week.',
  @doctor2, 1),

-- Admission 8 discharge
(@admission8_id, @patient2, '2024-10-31', '11:30:00',
  'Cardiac Evaluation',
  'Stable Angina - Well Controlled',
  'Patient admitted for cardiac evaluation. ECG and stress test performed. Cardiac function normal. Medications optimized.',
  '["ECG", "Stress Test", "Echocardiogram"]',
  'Stable',
  'Continue cardiac medications. Avoid strenuous activities. Follow cardiac diet. Monitor for chest pain. Return immediately if chest pain occurs.',
  '[{"name": "Aspirin 75mg", "dosage": "75mg", "frequency": "Once daily", "duration": "Lifetime"}, {"name": "Atorvastatin 20mg", "dosage": "20mg", "frequency": "Once daily", "duration": "Lifetime"}, {"name": "Metoprolol 25mg", "dosage": "25mg", "frequency": "Twice daily", "duration": "90 days"}]',
  '2024-11-20',
  @doctor1,
  'Cardiac diet. Low fat, low cholesterol. Limit red meat.',
  'Light activities only. No heavy exercise for 2 weeks. Avoid stress.',
  @doctor1, 1)
ON DUPLICATE KEY UPDATE `discharge_date` = `discharge_date`;

-- ============================================
-- IPD TRANSFERS SAMPLE DATA
-- ============================================
SET @from_ward_gen_a = (SELECT id FROM ipd_wards WHERE name = 'General Ward A' LIMIT 1);
SET @from_ward_icu = (SELECT id FROM ipd_wards WHERE name = 'ICU - Intensive Care Unit' LIMIT 1);
SET @to_ward_hdu = (SELECT id FROM ipd_wards WHERE name = 'HDU - High Dependency Unit' LIMIT 1);
SET @to_ward_gen_a = (SELECT id FROM ipd_wards WHERE name = 'General Ward A' LIMIT 1);

SET @from_bed_icu = (SELECT id FROM ipd_beds WHERE bed_number = 'ICU-01' LIMIT 1);
SET @to_bed_hdu = (SELECT id FROM ipd_beds WHERE bed_number = 'HDU-01' LIMIT 1);
SET @from_bed_hdu = (SELECT id FROM ipd_beds WHERE bed_number = 'HDU-01' LIMIT 1);
SET @to_bed_gen_a = (SELECT id FROM ipd_beds WHERE bed_number = 'GEN-A-04' LIMIT 1);

INSERT INTO `ipd_transfers` (
  `admission_id`, `patient_id`, `transfer_date`, `transfer_time`, 
  `from_ward_id`, `from_bed_id`, `to_ward_id`, `to_bed_id`, 
  `transfer_reason`, `transferred_by_user_id`, `notes`, `created_at`
) VALUES
-- Transfer from ICU to HDU (Admission 3)
(@admission3, @patient3, '2024-11-05', '10:00:00',
  @from_ward_icu, @from_bed_icu,
  @to_ward_hdu, @to_bed_hdu,
  'Patient condition improved, no longer requires ICU level care',
  1,
  'Patient stable enough for step-down to HDU. Continue monitoring.',
  '2024-11-05 10:00:00'),

-- Transfer from HDU to General Ward (Admission 6)
(@admission6, @patient3, '2024-11-08', '14:00:00',
  @to_ward_hdu, @from_bed_hdu,
  @to_ward_gen_a, @to_bed_gen_a,
  'Post-operative recovery progressing well, ready for general ward',
  1,
  'Patient recovering well from cardiac surgery. Ready for general ward care.',
  '2024-11-08 14:00:00')
ON DUPLICATE KEY UPDATE `transfer_date` = `transfer_date`;

-- ============================================
-- SAMPLE DATA SUMMARY
-- ============================================
-- Note: Ward occupied_beds count is calculated dynamically from ipd_beds table
-- Created:
-- - 7 IPD Wards (General A, General B, ICU, CCU, NICU, HDU, Isolation)
-- - 95 IPD Beds across wards (mix of occupied and available)
-- - 10 Private Rooms (Private, Deluxe, Suite)
-- - 8 IPD Admissions (mix of active and discharged)
-- - 20+ Vital Signs records
-- - 20+ Treatment Orders
-- - 15+ Nursing Notes
-- - 4 Billing records
-- - 2 Discharge Summaries
-- - 2 Transfer records

