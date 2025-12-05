-- Migration: Consolidate appointment permissions
-- This script consolidates role-prefixed appointment permissions into single permissions
-- Changes: doctor.add_appointment + staff.add_appointment -> add_appointment
--         doctor.delete_token_appointment + staff.delete_token_appointment -> delete_token_appointment

-- ============================================
-- STEP 1: Create consolidated permissions if they don't exist
-- ============================================
INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`)
VALUES 
('add_appointment', 'Add Appointment', 'Add new appointments', 'appointment'),
('delete_token_appointment', 'Delete Token or Appointment', 'Delete tokens and appointments', 'appointment')
ON DUPLICATE KEY UPDATE 
    `permission_name` = VALUES(`permission_name`),
    `description` = VALUES(`description`),
    `category` = VALUES(`category`);

-- ============================================
-- STEP 2: Get permission IDs
-- ============================================
SET @add_appointment_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'add_appointment');
SET @delete_token_appointment_id = (SELECT `id` FROM `permission_definitions` WHERE `permission_key` = 'delete_token_appointment');

-- ============================================
-- STEP 3: Migrate role permissions
-- Assign consolidated permissions to roles that had the old permissions
-- ============================================

-- Doctor role: Add add_appointment if they had doctor.add_appointment
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT 'Doctor', @add_appointment_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE rp.role = 'Doctor' 
  AND pd.permission_key IN ('doctor.add_appointment')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = 'Doctor' AND pd2.permission_key = 'add_appointment'
  );

-- Doctor role: Add delete_token_appointment if they had doctor.delete_token_appointment
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT 'Doctor', @delete_token_appointment_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE rp.role = 'Doctor' 
  AND pd.permission_key IN ('doctor.delete_token_appointment')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = 'Doctor' AND pd2.permission_key = 'delete_token_appointment'
  );

-- Staff role: Add add_appointment if they had staff.add_appointment
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT 'Staff', @add_appointment_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE rp.role = 'Staff' 
  AND pd.permission_key IN ('staff.add_appointment')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = 'Staff' AND pd2.permission_key = 'add_appointment'
  );

-- Staff role: Add delete_token_appointment if they had staff.delete_token_appointment
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT DISTINCT 'Staff', @delete_token_appointment_id
FROM `role_permissions` rp
JOIN `permission_definitions` pd ON rp.permission_id = pd.id
WHERE rp.role = 'Staff' 
  AND pd.permission_key IN ('staff.delete_token_appointment')
  AND NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp2 
    JOIN `permission_definitions` pd2 ON rp2.permission_id = pd2.id
    WHERE rp2.role = 'Staff' AND pd2.permission_key = 'delete_token_appointment'
  );

-- ============================================
-- STEP 4: Migrate user custom permissions
-- Update user_custom_permissions to use new permission IDs
-- ============================================

-- Update user custom permissions for add_appointment
UPDATE `user_custom_permissions` ucp
JOIN `permission_definitions` pd_old ON ucp.permission_id = pd_old.id
SET ucp.permission_id = @add_appointment_id
WHERE pd_old.permission_key IN ('doctor.add_appointment', 'staff.add_appointment')
  AND ucp.status = 'granted'
  AND NOT EXISTS (
    SELECT 1 FROM `user_custom_permissions` ucp2 
    WHERE ucp2.user_id = ucp.user_id 
      AND ucp2.permission_id = @add_appointment_id
  );

-- Update user custom permissions for delete_token_appointment
UPDATE `user_custom_permissions` ucp
JOIN `permission_definitions` pd_old ON ucp.permission_id = pd_old.id
SET ucp.permission_id = @delete_token_appointment_id
WHERE pd_old.permission_key IN ('doctor.delete_token_appointment', 'staff.delete_token_appointment')
  AND ucp.status = 'granted'
  AND NOT EXISTS (
    SELECT 1 FROM `user_custom_permissions` ucp2 
    WHERE ucp2.user_id = ucp.user_id 
      AND ucp2.permission_id = @delete_token_appointment_id
  );

-- Remove duplicate denied permissions (if user had both doctor and staff versions denied)
DELETE ucp1 FROM `user_custom_permissions` ucp1
INNER JOIN `user_custom_permissions` ucp2 
INNER JOIN `permission_definitions` pd1 ON ucp1.permission_id = pd1.id
INNER JOIN `permission_definitions` pd2 ON ucp2.permission_id = pd2.id
WHERE ucp1.id > ucp2.id 
  AND ucp1.user_id = ucp2.user_id
  AND ucp1.status = ucp2.status
  AND (
    (pd1.permission_key = 'doctor.add_appointment' AND pd2.permission_key = 'staff.add_appointment')
    OR (pd1.permission_key = 'staff.add_appointment' AND pd2.permission_key = 'doctor.add_appointment')
    OR (pd1.permission_key = 'doctor.delete_token_appointment' AND pd2.permission_key = 'staff.delete_token_appointment')
    OR (pd1.permission_key = 'staff.delete_token_appointment' AND pd2.permission_key = 'doctor.delete_token_appointment')
  );

-- ============================================
-- STEP 5: Remove old role-prefixed permissions from role_permissions
-- (Optional - comment out if you want to keep them for reference)
-- ============================================
-- DELETE rp FROM `role_permissions` rp
-- JOIN `permission_definitions` pd ON rp.permission_id = pd.id
-- WHERE pd.permission_key IN ('doctor.add_appointment', 'staff.add_appointment', 'doctor.delete_token_appointment', 'staff.delete_token_appointment');

-- ============================================
-- STEP 6: Remove old permission definitions
-- (Optional - comment out if you want to keep them for reference)
-- ============================================
-- DELETE FROM `permission_definitions` 
-- WHERE `permission_key` IN ('doctor.add_appointment', 'staff.add_appointment', 'doctor.delete_token_appointment', 'staff.delete_token_appointment');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migration:
-- SELECT * FROM `permission_definitions` WHERE `permission_key` IN ('add_appointment', 'delete_token_appointment');
-- SELECT rp.role, pd.permission_key FROM `role_permissions` rp JOIN `permission_definitions` pd ON rp.permission_id = pd.id WHERE pd.permission_key IN ('add_appointment', 'delete_token_appointment') ORDER BY rp.role, pd.permission_key;
-- SELECT COUNT(*) as old_permissions_count FROM `role_permissions` rp JOIN `permission_definitions` pd ON rp.permission_id = pd.id WHERE pd.permission_key IN ('doctor.add_appointment', 'staff.add_appointment', 'doctor.delete_token_appointment', 'staff.delete_token_appointment');

