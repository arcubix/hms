-- Add missing fields to ipd_rooms table for private room management
-- Run this migration to add new fields

ALTER TABLE `ipd_rooms` 
ADD COLUMN IF NOT EXISTS `attendant_bed` TINYINT(1) DEFAULT 0 COMMENT 'Include attendant bed (0 = No, 1 = Yes)',
ADD COLUMN IF NOT EXISTS `remarks` TEXT DEFAULT NULL COMMENT 'Additional notes about this room';

-- Note: `capacity` field already exists and represents number of beds
-- Note: `status` field already exists and represents initial status

