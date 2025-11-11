-- Multiple Time Slots Per Day - Schema Update
-- This allows doctors to have multiple working periods per day
-- Example: Morning 9:00-12:00 and Afternoon 14:00-17:00

-- ============================================
-- UPDATE DOCTOR_SCHEDULES TABLE
-- Remove unique constraint to allow multiple slots per day
-- ============================================

-- Drop the unique constraint that prevents multiple slots per day
ALTER TABLE `doctor_schedules` 
  DROP INDEX `unique_doctor_day`;

-- Add a new index for better query performance (without uniqueness)
CREATE INDEX `idx_doctor_day` ON `doctor_schedules`(`doctor_id`, `day_of_week`);

-- Add optional fields for better slot management
ALTER TABLE `doctor_schedules`
  ADD COLUMN IF NOT EXISTS `slot_name` VARCHAR(50) DEFAULT NULL COMMENT 'Optional name for the slot (e.g., "Morning", "Afternoon", "Evening")',
  ADD COLUMN IF NOT EXISTS `max_appointments_per_slot` INT(3) DEFAULT 1 COMMENT 'Maximum patients per time slot',
  ADD COLUMN IF NOT EXISTS `appointment_duration` INT(3) DEFAULT 30 COMMENT 'Default appointment duration in minutes for this slot',
  ADD COLUMN IF NOT EXISTS `break_start` TIME DEFAULT NULL COMMENT 'Break start time within this slot',
  ADD COLUMN IF NOT EXISTS `break_end` TIME DEFAULT NULL COMMENT 'Break end time within this slot',
  ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT 'Additional notes for this slot';

-- Add ordering field to maintain slot order within a day
ALTER TABLE `doctor_schedules`
  ADD COLUMN IF NOT EXISTS `slot_order` INT(2) DEFAULT 0 COMMENT 'Order of slot within the day (0, 1, 2, etc.)';

-- Update existing records to have slot_order = 0
UPDATE `doctor_schedules` SET `slot_order` = 0 WHERE `slot_order` IS NULL;

-- Add index for ordering
CREATE INDEX IF NOT EXISTS `idx_doctor_day_order` ON `doctor_schedules`(`doctor_id`, `day_of_week`, `slot_order`);

