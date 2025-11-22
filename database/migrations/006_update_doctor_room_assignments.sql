-- Migration: Update doctor_room_assignments table to add mode indicator
-- This is optional and can be used for backward compatibility

ALTER TABLE `doctor_room_assignments`
  ADD COLUMN IF NOT EXISTS `mode` ENUM('Fixed', 'Dynamic') DEFAULT NULL COMMENT 'Assignment mode',
  ADD COLUMN IF NOT EXISTS `is_primary` TINYINT(1) DEFAULT 0 COMMENT 'Primary assignment in fixed mode';

