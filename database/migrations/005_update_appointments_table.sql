-- Migration: Update appointments table to include room, reception, floor, and token references
-- This adds support for floor-based token generation and room tracking

-- Add room and reception references
ALTER TABLE `appointments`
  ADD COLUMN IF NOT EXISTS `room_id` INT(11) DEFAULT NULL COMMENT 'Room assigned for this appointment',
  ADD COLUMN IF NOT EXISTS `reception_id` INT(11) DEFAULT NULL COMMENT 'Reception that generated token',
  ADD COLUMN IF NOT EXISTS `floor_id` INT(11) DEFAULT NULL COMMENT 'Floor for token generation',
  ADD COLUMN IF NOT EXISTS `token_number` VARCHAR(20) DEFAULT NULL COMMENT 'Floor-based token number';

-- Add indexes for performance
ALTER TABLE `appointments`
  ADD INDEX IF NOT EXISTS `idx_room_id` (`room_id`),
  ADD INDEX IF NOT EXISTS `idx_reception_id` (`reception_id`),
  ADD INDEX IF NOT EXISTS `idx_floor_id` (`floor_id`),
  ADD INDEX IF NOT EXISTS `idx_token_number` (`token_number`);

-- Add foreign key constraints
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointments_room` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_appointments_reception` FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_appointments_floor` FOREIGN KEY (`floor_id`) REFERENCES `floors`(`id`) ON DELETE SET NULL;

-- Note: If foreign keys already exist, the above will fail gracefully
-- You may need to drop existing constraints first if they conflict

