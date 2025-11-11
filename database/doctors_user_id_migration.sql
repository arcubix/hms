-- Migration: Add user_id field to doctors table
-- This links doctors to the users table for authentication

-- Add user_id column to doctors table
ALTER TABLE `doctors` 
ADD COLUMN `user_id` INT(11) DEFAULT NULL AFTER `id`,
ADD INDEX `idx_user_id` (`user_id`),
ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Update existing doctors to have user accounts (optional - for existing data)
-- This will create user accounts for existing doctors if they don't have one
-- Note: You may need to set passwords manually for existing doctors

