-- Migration: Set default priority modules for existing users
-- This script assigns default priority modules to all existing users who don't have any

-- Default priority modules (in order)
SET @default_modules = 'dashboard,opd,emergency,patients,appointments,laboratory,pharmacy';

-- Insert default priority modules for users who don't have any
INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT 
  u.`id` AS `user_id`,
  CASE 
    WHEN FIND_IN_SET('dashboard', @default_modules) > 0 THEN 'dashboard'
    WHEN FIND_IN_SET('opd', @default_modules) > 0 THEN 'opd'
    WHEN FIND_IN_SET('emergency', @default_modules) > 0 THEN 'emergency'
    WHEN FIND_IN_SET('patients', @default_modules) > 0 THEN 'patients'
    WHEN FIND_IN_SET('appointments', @default_modules) > 0 THEN 'appointments'
    WHEN FIND_IN_SET('laboratory', @default_modules) > 0 THEN 'laboratory'
    WHEN FIND_IN_SET('pharmacy', @default_modules) > 0 THEN 'pharmacy'
  END AS `module_id`,
  CASE 
    WHEN FIND_IN_SET('dashboard', @default_modules) > 0 THEN 1
    WHEN FIND_IN_SET('opd', @default_modules) > 0 THEN 2
    WHEN FIND_IN_SET('emergency', @default_modules) > 0 THEN 3
    WHEN FIND_IN_SET('patients', @default_modules) > 0 THEN 4
    WHEN FIND_IN_SET('appointments', @default_modules) > 0 THEN 5
    WHEN FIND_IN_SET('laboratory', @default_modules) > 0 THEN 6
    WHEN FIND_IN_SET('pharmacy', @default_modules) > 0 THEN 7
  END AS `position`
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id`
)
AND u.`id` IS NOT NULL
LIMIT 0;

-- Better approach: Insert each module separately
INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'dashboard', 1
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'dashboard'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'opd', 2
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'opd'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'emergency', 3
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'emergency'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'patients', 4
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'patients'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'appointments', 5
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'appointments'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'laboratory', 6
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'laboratory'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

INSERT INTO `user_priority_modules` (`user_id`, `module_id`, `position`)
SELECT u.`id`, 'pharmacy', 7
FROM `users` u
WHERE NOT EXISTS (
  SELECT 1 FROM `user_priority_modules` upm WHERE upm.`user_id` = u.`id` AND upm.`module_id` = 'pharmacy'
)
ON DUPLICATE KEY UPDATE `position` = VALUES(`position`);

