-- ============================================
-- ADD CHARGES COLUMN TO USER_SHARE_PROCEDURES TABLE
-- ============================================
-- This migration adds a charges field to store the actual charge/price for each procedure

ALTER TABLE `user_share_procedures` 
  ADD COLUMN IF NOT EXISTS `charges` DECIMAL(10,2) DEFAULT NULL COMMENT 'The actual charge/price for the procedure in Rs' AFTER `procedure_name`;

