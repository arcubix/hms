-- Emergency Module Dummy Data
-- Insert sample data for testing the emergency module
-- Run this AFTER creating all the tables

-- ============================================
-- EMERGENCY WARDS - Sample Data
-- ============================================
INSERT INTO `emergency_wards` (`name`, `type`, `building`, `floor_id`, `total_beds`, `incharge_user_id`, `contact`, `email`, `facilities`, `description`, `status`, `established_date`, `last_inspection_date`) VALUES
('Emergency Ward A', 'Emergency', 'Main Building', 1, 20, NULL, '+1-555-0101', 'warda@hospital.com', '["Central Oxygen Supply", "Cardiac Monitors", "Ventilators"]', 'General emergency ward for adult patients', 'Active', '2020-01-15', '2024-10-15'),
('Emergency Ward B', 'Emergency', 'Main Building', 1, 15, NULL, '+1-555-0102', 'wardb@hospital.com', '["Central Oxygen Supply", "Cardiac Monitors"]', 'Secondary emergency ward', 'Active', '2020-01-15', '2024-09-20'),
('Emergency ICU', 'ICU', 'Main Building', 2, 8, NULL, '+1-555-0103', 'icu@hospital.com', '["Ventilators", "Cardiac Monitors", "Dialysis Machines", "ECMO"]', 'Intensive care unit for critical patients', 'Active', '2019-06-01', '2024-11-01'),
('Pediatric Emergency Ward', 'Pediatric', 'Main Building', 1, 12, NULL, '+1-555-0104', 'pediatric@hospital.com', '["Pediatric Monitors", "Incubators"]', 'Specialized ward for pediatric emergency cases', 'Active', '2021-03-10', '2024-10-25'),
('Trauma Ward', 'Trauma', 'Main Building', 1, 10, NULL, '+1-555-0105', 'trauma@hospital.com', '["Trauma Bays", "Surgical Equipment", "X-Ray"]', 'Dedicated trauma and surgical emergency ward', 'Active', '2020-08-20', '2024-11-05'),
('Isolation Ward', 'Isolation', 'Annex Building', 1, 6, NULL, '+1-555-0106', 'isolation@hospital.com', '["Negative Pressure", "Isolation Equipment"]', 'Isolation ward for infectious disease cases', 'Active', '2021-01-10', '2024-10-30');

-- ============================================
-- EMERGENCY WARD BEDS - Sample Data
-- ============================================

-- Emergency Ward A Beds (20 beds)
INSERT INTO `emergency_ward_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `last_cleaned_at`) VALUES
(1, 'EA-01', 'Regular', 'Available', '2024-11-21 06:00:00'),
(1, 'EA-02', 'Regular', 'Occupied', '2024-11-20 14:00:00'),
(1, 'EA-03', 'Regular', 'Available', '2024-11-21 08:00:00'),
(1, 'EA-04', 'Regular', 'Occupied', '2024-11-20 16:00:00'),
(1, 'EA-05', 'Regular', 'Available', '2024-11-21 07:00:00'),
(1, 'EA-06', 'Regular', 'Occupied', '2024-11-20 18:00:00'),
(1, 'EA-07', 'Regular', 'Available', '2024-11-21 09:00:00'),
(1, 'EA-08', 'Regular', 'Under Cleaning', '2024-11-21 10:00:00'),
(1, 'EA-09', 'Regular', 'Available', '2024-11-21 05:00:00'),
(1, 'EA-10', 'Regular', 'Occupied', '2024-11-20 20:00:00'),
(1, 'EA-11', 'Regular', 'Available', '2024-11-21 06:30:00'),
(1, 'EA-12', 'Regular', 'Occupied', '2024-11-20 22:00:00'),
(1, 'EA-13', 'Regular', 'Available', '2024-11-21 07:30:00'),
(1, 'EA-14', 'Regular', 'Maintenance', NULL),
(1, 'EA-15', 'Regular', 'Available', '2024-11-21 08:30:00'),
(1, 'EA-16', 'Regular', 'Occupied', '2024-11-20 12:00:00'),
(1, 'EA-17', 'Regular', 'Available', '2024-11-21 09:30:00'),
(1, 'EA-18', 'Regular', 'Available', '2024-11-21 10:30:00'),
(1, 'EA-19', 'Regular', 'Occupied', '2024-11-20 10:00:00'),
(1, 'EA-20', 'Regular', 'Available', '2024-11-21 11:00:00');

-- Emergency Ward B Beds (15 beds)
INSERT INTO `emergency_ward_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `last_cleaned_at`) VALUES
(2, 'EB-01', 'Regular', 'Available', '2024-11-21 06:00:00'),
(2, 'EB-02', 'Regular', 'Occupied', '2024-11-20 15:00:00'),
(2, 'EB-03', 'Regular', 'Available', '2024-11-21 07:00:00'),
(2, 'EB-04', 'Regular', 'Occupied', '2024-11-20 17:00:00'),
(2, 'EB-05', 'Regular', 'Available', '2024-11-21 08:00:00'),
(2, 'EB-06', 'Regular', 'Occupied', '2024-11-20 19:00:00'),
(2, 'EB-07', 'Regular', 'Available', '2024-11-21 09:00:00'),
(2, 'EB-08', 'Regular', 'Available', '2024-11-21 10:00:00'),
(2, 'EB-09', 'Regular', 'Occupied', '2024-11-20 21:00:00'),
(2, 'EB-10', 'Regular', 'Available', '2024-11-21 11:00:00'),
(2, 'EB-11', 'Regular', 'Available', '2024-11-21 12:00:00'),
(2, 'EB-12', 'Regular', 'Occupied', '2024-11-20 13:00:00'),
(2, 'EB-13', 'Regular', 'Available', '2024-11-21 13:00:00'),
(2, 'EB-14', 'Regular', 'Under Cleaning', '2024-11-21 14:00:00'),
(2, 'EB-15', 'Regular', 'Available', '2024-11-21 15:00:00');

-- Emergency ICU Beds (8 beds)
INSERT INTO `emergency_ward_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `last_cleaned_at`) VALUES
(3, 'ICU-01', 'ICU', 'Occupied', '2024-11-20 08:00:00'),
(3, 'ICU-02', 'ICU', 'Occupied', '2024-11-20 10:00:00'),
(3, 'ICU-03', 'ICU', 'Available', '2024-11-21 06:00:00'),
(3, 'ICU-04', 'ICU', 'Occupied', '2024-11-20 12:00:00'),
(3, 'ICU-05', 'ICU', 'Available', '2024-11-21 08:00:00'),
(3, 'ICU-06', 'ICU', 'Occupied', '2024-11-20 14:00:00'),
(3, 'ICU-07', 'ICU', 'Available', '2024-11-21 10:00:00'),
(3, 'ICU-08', 'ICU', 'Occupied', '2024-11-20 16:00:00');

-- Pediatric Emergency Ward Beds (12 beds)
INSERT INTO `emergency_ward_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `last_cleaned_at`) VALUES
(4, 'PED-01', 'Regular', 'Available', '2024-11-21 06:00:00'),
(4, 'PED-02', 'Regular', 'Occupied', '2024-11-20 14:00:00'),
(4, 'PED-03', 'Regular', 'Available', '2024-11-21 07:00:00'),
(4, 'PED-04', 'Regular', 'Occupied', '2024-11-20 16:00:00'),
(4, 'PED-05', 'Regular', 'Available', '2024-11-21 08:00:00'),
(4, 'PED-06', 'Regular', 'Available', '2024-11-21 09:00:00'),
(4, 'PED-07', 'Regular', 'Occupied', '2024-11-20 18:00:00'),
(4, 'PED-08', 'Regular', 'Available', '2024-11-21 10:00:00'),
(4, 'PED-09', 'Regular', 'Available', '2024-11-21 11:00:00'),
(4, 'PED-10', 'Regular', 'Occupied', '2024-11-20 20:00:00'),
(4, 'PED-11', 'Regular', 'Available', '2024-11-21 12:00:00'),
(4, 'PED-12', 'Regular', 'Available', '2024-11-21 13:00:00');

-- Trauma Ward Beds (10 beds)
INSERT INTO `emergency_ward_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `last_cleaned_at`) VALUES
(5, 'TR-01', 'Trauma', 'Occupied', '2024-11-20 08:00:00'),
(5, 'TR-02', 'Trauma', 'Available', '2024-11-21 06:00:00'),
(5, 'TR-03', 'Trauma', 'Occupied', '2024-11-20 10:00:00'),
(5, 'TR-04', 'Trauma', 'Available', '2024-11-21 07:00:00'),
(5, 'TR-05', 'Trauma', 'Occupied', '2024-11-20 12:00:00'),
(5, 'TR-06', 'Trauma', 'Available', '2024-11-21 08:00:00'),
(5, 'TR-07', 'Trauma', 'Available', '2024-11-21 09:00:00'),
(5, 'TR-08', 'Trauma', 'Occupied', '2024-11-20 14:00:00'),
(5, 'TR-09', 'Trauma', 'Available', '2024-11-21 10:00:00'),
(5, 'TR-10', 'Trauma', 'Available', '2024-11-21 11:00:00');

-- Isolation Ward Beds (6 beds)
INSERT INTO `emergency_ward_beds` (`ward_id`, `bed_number`, `bed_type`, `status`, `last_cleaned_at`) VALUES
(6, 'ISO-01', 'Isolation', 'Available', '2024-11-21 06:00:00'),
(6, 'ISO-02', 'Isolation', 'Occupied', '2024-11-20 14:00:00'),
(6, 'ISO-03', 'Isolation', 'Available', '2024-11-21 07:00:00'),
(6, 'ISO-04', 'Isolation', 'Available', '2024-11-21 08:00:00'),
(6, 'ISO-05', 'Isolation', 'Occupied', '2024-11-20 16:00:00'),
(6, 'ISO-06', 'Isolation', 'Available', '2024-11-21 09:00:00');

-- ============================================
-- EMERGENCY DUTY ROSTER - Sample Data
-- ============================================
-- Note: This uses actual user IDs from the users table
-- If you don't have enough users, create some first or modify the user_id values

-- Get first available doctors (role = 'doctor')
INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Morning', 
  '06:00:00', 
  '14:00:00', 
  'Emergency Medicine', 
  'On Duty', 
  'Senior Emergency Physician'
FROM `users` 
WHERE `role` = 'doctor' 
LIMIT 1;

INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Morning', 
  '06:00:00', 
  '14:00:00', 
  'Trauma Surgery', 
  'On Duty', 
  'Trauma Specialist'
FROM `users` 
WHERE `role` = 'doctor' 
LIMIT 1 OFFSET 1;

INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Evening', 
  '14:00:00', 
  '22:00:00', 
  'Emergency Medicine', 
  'Scheduled', 
  'Evening Coverage'
FROM `users` 
WHERE `role` = 'doctor' 
LIMIT 1 OFFSET 2;

INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Night', 
  '22:00:00', 
  '06:00:00', 
  'Emergency Medicine', 
  'Scheduled', 
  'Night Coverage'
FROM `users` 
WHERE `role` = 'doctor' 
LIMIT 1 OFFSET 3;

-- Get nurses (role = 'nurse')
INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Morning', 
  '06:00:00', 
  '14:00:00', 
  NULL, 
  'On Duty', 
  'Emergency Nurse'
FROM `users` 
WHERE `role` = 'nurse' 
LIMIT 2;

INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Evening', 
  '14:00:00', 
  '22:00:00', 
  NULL, 
  'Scheduled', 
  'Emergency Nurse'
FROM `users` 
WHERE `role` = 'nurse' 
LIMIT 2 OFFSET 2;

INSERT INTO `emergency_duty_roster` (`user_id`, `date`, `shift_type`, `shift_start_time`, `shift_end_time`, `specialization`, `status`, `notes`)
SELECT 
  id, 
  '2024-11-21', 
  'Night', 
  '22:00:00', 
  '06:00:00', 
  NULL, 
  'Scheduled', 
  'Emergency Nurse'
FROM `users` 
WHERE `role` = 'nurse' 
LIMIT 2 OFFSET 4;

-- ============================================
-- UPDATE EMERGENCY VISITS - Assign Some Patients to Wards/Beds
-- ============================================
-- This assumes you already have some emergency_visits records
-- Update a few visits to have ward and bed assignments

-- Example: Assign some visits to wards and beds
-- Replace the visit IDs with actual IDs from your emergency_visits table
-- Uncomment and modify these after you have emergency visits:

/*
UPDATE `emergency_visits` ev
INNER JOIN `emergency_ward_beds` ewb ON ewb.status = 'Occupied' AND ewb.current_visit_id IS NULL
SET 
  ev.assigned_ward_id = ewb.ward_id,
  ev.assigned_ward_bed_id = ewb.id,
  ev.admission_type = CASE 
    WHEN ewb.bed_type = 'ICU' THEN 'ICU'
    WHEN ewb.bed_type = 'Isolation' THEN 'Ward'
    ELSE 'Ward'
  END,
  ev.disposition = 'admit-ward',
  ewb.current_visit_id = ev.id
WHERE ev.current_status IN ('in-treatment', 'awaiting-disposition')
  AND ev.disposition IS NULL
LIMIT 10;
*/

-- ============================================
-- SAMPLE EMERGENCY PATIENT TRANSFERS (Optional)
-- ============================================
-- Uncomment and modify these after you have emergency visits with ward assignments:

/*
INSERT INTO `emergency_patient_transfers` 
(`emergency_visit_id`, `transfer_type`, `from_ward_id`, `from_bed_id`, `to_ward_id`, `to_bed_id`, `reason`, `doctor_notes`, `transfer_date`, `transfer_time`, `status`) 
VALUES
(1, 'internal', 1, 2, 3, 3, 'Patient condition deteriorated, requires ICU care', 'Transfer to ICU for closer monitoring', '2024-11-20', '14:30:00', 'Completed'),
(2, 'internal', 2, 4, 1, 5, 'Ward capacity management', 'Moving to Ward A for better resource allocation', '2024-11-20', '16:00:00', 'Completed');
*/

-- ============================================
-- SAMPLE AMBULANCE REQUESTS (Optional)
-- ============================================
-- Uncomment and modify these after you have emergency visits:

/*
INSERT INTO `emergency_ambulance_requests` 
(`emergency_visit_id`, `service_type`, `priority`, `destination`, `pickup_date`, `pickup_time`, `medical_requirements`, `contact_person`, `status`) 
VALUES
(1, 'ALS', 'Emergency', 'City General Hospital', '2024-11-21', '10:00:00', '["Oxygen Support", "IV Medications", "Cardiac Monitoring"]', 'John Doe - +1-555-1234', 'Requested'),
(2, 'BLS', 'Urgent', 'Home', '2024-11-21', '14:00:00', '["Oxygen Support"]', 'Jane Smith - +1-555-5678', 'Dispatched');
*/

-- ============================================
-- NOTES:
-- ============================================
-- 1. Replace user_id values in duty_roster with actual user IDs from your users table
-- 2. The UPDATE statements for emergency_visits are commented out - uncomment and run after you have visit records
-- 3. The transfer and ambulance request inserts are optional and commented out
-- 4. Adjust dates and times as needed for your testing
-- 5. Make sure to run this AFTER creating all the tables and running the migrations

