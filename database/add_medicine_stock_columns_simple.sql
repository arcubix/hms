-- Add min_stock and max_stock columns to medicines table
-- Run this script in your MySQL database to add the missing columns

-- Add min_stock column
ALTER TABLE `medicines` 
  ADD COLUMN `min_stock` INT(11) DEFAULT 0 COMMENT 'Minimum stock level for reorder alerts' AFTER `status`;

-- Add max_stock column  
ALTER TABLE `medicines` 
  ADD COLUMN `max_stock` INT(11) DEFAULT 1000 COMMENT 'Maximum stock level' AFTER `min_stock`;

-- Add index for min_stock
CREATE INDEX `idx_min_stock` ON `medicines`(`min_stock`);

