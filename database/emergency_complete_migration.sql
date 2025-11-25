-- Emergency Module Complete Migration Script
-- Run this script AFTER creating all the new tables
-- This script adds foreign key constraints that reference the new tables

-- ============================================
-- IMPORTANT: Run these scripts in order:
-- 1. emergency_wards_schema.sql
-- 2. emergency_ward_beds_schema.sql
-- 3. emergency_duty_roster_schema.sql
-- 4. emergency_transfers_schema.sql
-- 5. emergency_ambulance_schema.sql
-- 6. emergency_visits_migration.sql (adds columns only)
-- 7. This file (adds foreign keys)
-- ============================================

SET @dbname = DATABASE();
SET @tablename = 'emergency_visits';

-- Add foreign key for assigned_ward_id (only if emergency_wards table exists)
SET @constraintname = 'fk_emergency_visits_ward';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = @constraintname)
  ) > 0 OR
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'emergency_wards')
  ) = 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (`assigned_ward_id`) REFERENCES `emergency_wards`(`id`) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key for assigned_ward_bed_id (only if emergency_ward_beds table exists)
SET @constraintname = 'fk_emergency_visits_ward_bed';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = @constraintname)
  ) > 0 OR
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = 'emergency_ward_beds')
  ) = 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (`assigned_ward_bed_id`) REFERENCES `emergency_ward_beds`(`id`) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

