-- Insurance/Organization Pricing Database Schema
-- Stores pricing overrides for insurance companies and organizations
-- Allows different pricing for procedures, lab tests, radiology tests, and medicines

CREATE TABLE IF NOT EXISTS `insurance_pricing` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `insurance_organization_id` INT(11) NOT NULL COMMENT 'FK to insurance_organizations',
  `item_type` ENUM('procedure', 'laboratory', 'radiology', 'pharmacy') NOT NULL,
  `item_id` INT(11) NOT NULL COMMENT 'ID from respective table (doctors, lab_tests, radiology_tests, medicines)',
  `item_name` VARCHAR(255) NOT NULL COMMENT 'Name of the item for reference',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this pricing is active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pricing` (`insurance_organization_id`, `item_type`, `item_id`),
  INDEX `idx_insurance_org` (`insurance_organization_id`),
  INDEX `idx_item_type` (`item_type`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_active` (`active`),
  FOREIGN KEY (`insurance_organization_id`) REFERENCES `insurance_organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

