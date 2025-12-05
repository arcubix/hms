-- Add Missing Permissions to Database
-- This script adds permissions that are used in the codebase but missing from permission_definitions table
-- Uses ON DUPLICATE KEY UPDATE to safely add permissions without errors if they already exist

-- ============================================
-- INSERT MISSING PERMISSION DEFINITIONS
-- ============================================

INSERT INTO `permission_definitions` (`permission_key`, `permission_name`, `description`, `category`) VALUES
-- Admin Permissions
('admin.view_users', 'View Users', 'View user list, details, and system information', 'admin'),
('admin.view_billing', 'View Billing', 'View billing and sales information', 'admin'),

-- Doctor Management Permissions
('view_doctors', 'View Doctors', 'View doctor list and details', 'doctors'),
('create_doctors', 'Create Doctors', 'Create new doctor records', 'doctors'),
('edit_doctors', 'Edit Doctors', 'Edit doctor information', 'doctors'),
('delete_doctors', 'Delete Doctors', 'Delete doctor records', 'doctors')

ON DUPLICATE KEY UPDATE 
    `permission_name` = VALUES(`permission_name`),
    `description` = VALUES(`description`),
    `category` = VALUES(`category`);

-- ============================================
-- OPTIONAL: Assign to Admin Role
-- ============================================
-- Uncomment the following section if you want these permissions assigned to admin role by default

/*
INSERT INTO `role_permissions` (`role`, `permission_id`) 
SELECT 'admin', `id` FROM `permission_definitions` 
WHERE `permission_key` IN (
    'admin.view_users',
    'admin.view_billing',
    'view_doctors',
    'create_doctors',
    'edit_doctors',
    'delete_doctors'
)
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);
*/

