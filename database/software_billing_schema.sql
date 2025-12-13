-- Software Billing & Invoices Multi-Tenant System Database Schema
-- This schema creates tables for multi-tenant organization management and billing

-- ============================================
-- ORGANIZATIONS TABLE (Tenant Master Table)
-- ============================================
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `organization_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique organization code (e.g., ORG001)',
  `name` VARCHAR(255) NOT NULL COMMENT 'Organization/hospital name',
  `legal_name` VARCHAR(255) DEFAULT NULL COMMENT 'Legal business name',
  `organization_type` ENUM('Hospital', 'Clinic', 'Medical Center', 'Pharmacy', 'Laboratory', 'Other') NOT NULL DEFAULT 'Hospital',
  `registration_number` VARCHAR(100) DEFAULT NULL COMMENT 'Business registration number',
  `tax_id` VARCHAR(100) DEFAULT NULL COMMENT 'Tax ID / NTN',
  `contact_person` VARCHAR(255) DEFAULT NULL COMMENT 'Primary contact person',
  `email` VARCHAR(100) NOT NULL COMMENT 'Primary email address',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Primary phone number',
  `alternate_phone` VARCHAR(20) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL COMMENT 'Street address',
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'Pakistan',
  `zip_code` VARCHAR(20) DEFAULT NULL,
  `billing_email` VARCHAR(100) DEFAULT NULL COMMENT 'Email for billing notifications',
  `billing_address` TEXT DEFAULT NULL COMMENT 'Billing address (if different)',
  `currency` VARCHAR(3) DEFAULT 'PKR' COMMENT 'Currency code (PKR, USD, etc.)',
  `timezone` VARCHAR(50) DEFAULT 'Asia/Karachi' COMMENT 'Timezone',
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Logo file path',
  `subscription_status` ENUM('active', 'trial', 'suspended', 'cancelled', 'expired') NOT NULL DEFAULT 'trial',
  `trial_ends_at` DATE DEFAULT NULL COMMENT 'Trial expiration date',
  `max_users` INT(11) DEFAULT 5 COMMENT 'Maximum users allowed',
  `max_modules` INT(11) DEFAULT NULL COMMENT 'Maximum modules allowed (NULL = unlimited)',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `notes` TEXT DEFAULT NULL COMMENT 'Internal notes',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the organization',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_organization_code` (`organization_code`),
  UNIQUE KEY `unique_email` (`email`),
  INDEX `idx_name` (`name`),
  INDEX `idx_status` (`status`),
  INDEX `idx_subscription_status` (`subscription_status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `plan_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique plan code (e.g., BASIC, PRO, ENTERPRISE)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Plan name',
  `description` TEXT DEFAULT NULL COMMENT 'Plan description',
  `plan_type` ENUM('basic', 'professional', 'enterprise', 'custom') NOT NULL DEFAULT 'basic',
  `billing_cycle` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `base_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Base subscription price',
  `yearly_discount` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Discount percentage for yearly billing',
  `included_modules` JSON DEFAULT NULL COMMENT 'Array of module IDs included in plan',
  `max_users` INT(11) DEFAULT 5 COMMENT 'Maximum users included',
  `max_patients` INT(11) DEFAULT NULL COMMENT 'Maximum patients (NULL = unlimited)',
  `max_storage_gb` INT(11) DEFAULT 10 COMMENT 'Storage in GB',
  `features` JSON DEFAULT NULL COMMENT 'Additional features (JSON array)',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'Whether plan is active for new subscriptions',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Display order',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_plan_code` (`plan_code`),
  INDEX `idx_plan_type` (`plan_type`),
  INDEX `idx_billing_cycle` (`billing_cycle`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORGANIZATION SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `organization_subscriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `organization_id` INT(11) NOT NULL COMMENT 'Foreign key to organizations.id',
  `subscription_plan_id` INT(11) NOT NULL COMMENT 'Foreign key to subscription_plans.id',
  `subscription_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique subscription number',
  `start_date` DATE NOT NULL COMMENT 'Subscription start date',
  `end_date` DATE NOT NULL COMMENT 'Subscription end date',
  `next_billing_date` DATE NOT NULL COMMENT 'Next billing/renewal date',
  `billing_cycle` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `status` ENUM('active', 'expired', 'cancelled', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `auto_renew` TINYINT(1) DEFAULT 1 COMMENT 'Auto-renewal enabled',
  `cancelled_at` DATE DEFAULT NULL COMMENT 'Cancellation date',
  `cancellation_reason` TEXT DEFAULT NULL COMMENT 'Reason for cancellation',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the subscription',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_subscription_number` (`subscription_number`),
  INDEX `idx_organization_id` (`organization_id`),
  INDEX `idx_subscription_plan_id` (`subscription_plan_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_next_billing_date` (`next_billing_date`),
  INDEX `idx_end_date` (`end_date`),
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUBSCRIPTION ADD-ONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `subscription_addons` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `organization_id` INT(11) NOT NULL COMMENT 'Foreign key to organizations.id',
  `addon_type` ENUM('module', 'user', 'storage', 'feature') NOT NULL COMMENT 'Type of add-on',
  `addon_key` VARCHAR(100) NOT NULL COMMENT 'Add-on identifier (module_id, user, storage_gb, etc.)',
  `addon_name` VARCHAR(255) NOT NULL COMMENT 'Display name',
  `quantity` INT(11) NOT NULL DEFAULT 1 COMMENT 'Quantity (e.g., number of users, GB storage)',
  `unit_price` DECIMAL(10,2) NOT NULL COMMENT 'Price per unit',
  `total_price` DECIMAL(10,2) NOT NULL COMMENT 'Total price (quantity * unit_price)',
  `billing_cycle` ENUM('monthly', 'yearly', 'one-time') NOT NULL DEFAULT 'monthly',
  `status` ENUM('active', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  `start_date` DATE NOT NULL COMMENT 'Add-on start date',
  `end_date` DATE DEFAULT NULL COMMENT 'Add-on end date (NULL for ongoing)',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_organization_id` (`organization_id`),
  INDEX `idx_addon_type` (`addon_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_addon_key` (`addon_key`),
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique invoice number (e.g., INV-ORG001-2024-001)',
  `organization_id` INT(11) NOT NULL COMMENT 'Foreign key to organizations.id',
  `subscription_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organization_subscriptions.id',
  `invoice_date` DATE NOT NULL COMMENT 'Invoice date',
  `due_date` DATE NOT NULL COMMENT 'Due date',
  `billing_period_start` DATE DEFAULT NULL COMMENT 'Billing period start',
  `billing_period_end` DATE DEFAULT NULL COMMENT 'Billing period end',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Subtotal before tax and discount',
  `discount` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Discount amount',
  `discount_percentage` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Discount percentage',
  `tax_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Tax rate percentage',
  `tax_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tax amount',
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total amount after tax and discount',
  `paid_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Amount paid so far',
  `due_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount due',
  `currency` VARCHAR(3) DEFAULT 'PKR' COMMENT 'Currency code',
  `payment_status` ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft',
  `invoice_type` ENUM('subscription', 'addon', 'adjustment', 'manual') NOT NULL DEFAULT 'subscription',
  `notes` TEXT DEFAULT NULL COMMENT 'Invoice notes',
  `terms` TEXT DEFAULT NULL COMMENT 'Payment terms',
  `pdf_path` VARCHAR(255) DEFAULT NULL COMMENT 'Generated PDF file path',
  `sent_at` DATETIME DEFAULT NULL COMMENT 'When invoice was sent',
  `paid_at` DATETIME DEFAULT NULL COMMENT 'When invoice was fully paid',
  `created_by` INT(11) DEFAULT NULL COMMENT 'User ID who created the invoice',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invoice_number` (`invoice_number`),
  INDEX `idx_organization_id` (`organization_id`),
  INDEX `idx_subscription_id` (`subscription_id`),
  INDEX `idx_invoice_date` (`invoice_date`),
  INDEX `idx_due_date` (`due_date`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_invoice_type` (`invoice_type`),
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_id`) REFERENCES `organization_subscriptions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` INT(11) NOT NULL COMMENT 'Foreign key to invoices.id',
  `item_type` ENUM('subscription', 'module_addon', 'user_addon', 'storage_addon', 'adjustment', 'other') NOT NULL DEFAULT 'subscription',
  `item_code` VARCHAR(100) DEFAULT NULL COMMENT 'Item code/identifier',
  `description` VARCHAR(255) NOT NULL COMMENT 'Item description',
  `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1.00 COMMENT 'Quantity',
  `unit_price` DECIMAL(10,2) NOT NULL COMMENT 'Unit price',
  `discount` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Discount amount for this item',
  `total` DECIMAL(10,2) NOT NULL COMMENT 'Total (quantity * unit_price - discount)',
  `notes` TEXT DEFAULT NULL COMMENT 'Item notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_invoice_id` (`invoice_id`),
  INDEX `idx_item_type` (`item_type`),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `payment_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique payment number',
  `invoice_id` INT(11) NOT NULL COMMENT 'Foreign key to invoices.id',
  `organization_id` INT(11) NOT NULL COMMENT 'Foreign key to organizations.id',
  `payment_date` DATE NOT NULL COMMENT 'Payment date',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Payment amount',
  `payment_method` ENUM('cash', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'online', 'other') NOT NULL DEFAULT 'bank_transfer',
  `transaction_id` VARCHAR(100) DEFAULT NULL COMMENT 'Transaction reference number',
  `bank_name` VARCHAR(100) DEFAULT NULL COMMENT 'Bank name (if applicable)',
  `cheque_number` VARCHAR(50) DEFAULT NULL COMMENT 'Cheque number (if applicable)',
  `payment_status` ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'completed',
  `notes` TEXT DEFAULT NULL COMMENT 'Payment notes',
  `receipt_path` VARCHAR(255) DEFAULT NULL COMMENT 'Receipt file path',
  `processed_by` INT(11) DEFAULT NULL COMMENT 'User ID who processed the payment',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payment_number` (`payment_number`),
  INDEX `idx_invoice_id` (`invoice_id`),
  INDEX `idx_organization_id` (`organization_id`),
  INDEX `idx_payment_date` (`payment_date`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_payment_method` (`payment_method`),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BILLING SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `billing_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `organization_id` INT(11) NOT NULL COMMENT 'Foreign key to organizations.id',
  `invoice_prefix` VARCHAR(20) DEFAULT 'INV' COMMENT 'Invoice number prefix',
  `invoice_number_format` VARCHAR(50) DEFAULT '{PREFIX}-{ORG}-{YEAR}-{NUM}' COMMENT 'Invoice number format',
  `next_invoice_number` INT(11) DEFAULT 1 COMMENT 'Next invoice number',
  `payment_prefix` VARCHAR(20) DEFAULT 'PAY' COMMENT 'Payment number prefix',
  `payment_number_format` VARCHAR(50) DEFAULT '{PREFIX}-{ORG}-{YEAR}-{NUM}' COMMENT 'Payment number format',
  `next_payment_number` INT(11) DEFAULT 1 COMMENT 'Next payment number',
  `tax_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Default tax rate percentage',
  `tax_name` VARCHAR(50) DEFAULT 'Sales Tax' COMMENT 'Tax name (e.g., GST, VAT)',
  `payment_terms_days` INT(11) DEFAULT 30 COMMENT 'Default payment terms in days',
  `currency` VARCHAR(3) DEFAULT 'PKR' COMMENT 'Currency code',
  `currency_symbol` VARCHAR(10) DEFAULT 'Rs.' COMMENT 'Currency symbol',
  `invoice_footer` TEXT DEFAULT NULL COMMENT 'Invoice footer text',
  `invoice_notes` TEXT DEFAULT NULL COMMENT 'Default invoice notes',
  `email_invoice` TINYINT(1) DEFAULT 1 COMMENT 'Send invoice via email',
  `email_template` TEXT DEFAULT NULL COMMENT 'Email template for invoices',
  `auto_generate_invoice` TINYINT(1) DEFAULT 1 COMMENT 'Auto-generate invoices on renewal',
  `reminder_days_before_due` INT(11) DEFAULT 7 COMMENT 'Days before due date to send reminder',
  `overdue_reminder_interval` INT(11) DEFAULT 7 COMMENT 'Days between overdue reminders',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_organization_id` (`organization_id`),
  FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- ============================================
INSERT INTO `subscription_plans` (`plan_code`, `name`, `description`, `plan_type`, `billing_cycle`, `base_price`, `yearly_discount`, `included_modules`, `max_users`, `max_patients`, `max_storage_gb`, `features`, `is_active`, `display_order`) VALUES
('BASIC', 'Basic Plan', 'Essential features for small clinics', 'basic', 'monthly', 5000.00, 10.00, '["dashboard", "patients", "appointments", "doctors"]', 3, 500, 5, '["Basic Support", "Email Support"]', 1, 1),
('BASIC_YEARLY', 'Basic Plan (Yearly)', 'Essential features for small clinics - Yearly billing', 'basic', 'yearly', 54000.00, 10.00, '["dashboard", "patients", "appointments", "doctors"]', 3, 500, 5, '["Basic Support", "Email Support"]', 1, 2),
('PROFESSIONAL', 'Professional Plan', 'Advanced features for medium hospitals', 'professional', 'monthly', 15000.00, 15.00, '["dashboard", "patients", "appointments", "doctors", "opd", "ipd", "pharmacy", "laboratory", "radiology"]', 10, 2000, 20, '["Priority Support", "Email & Phone Support", "Custom Reports"]', 1, 3),
('PROFESSIONAL_YEARLY', 'Professional Plan (Yearly)', 'Advanced features for medium hospitals - Yearly billing', 'professional', 'yearly', 153000.00, 15.00, '["dashboard", "patients", "appointments", "doctors", "opd", "ipd", "pharmacy", "laboratory", "radiology"]', 10, 2000, 20, '["Priority Support", "Email & Phone Support", "Custom Reports"]', 1, 4),
('ENTERPRISE', 'Enterprise Plan', 'Full features for large hospitals', 'enterprise', 'monthly', 50000.00, 20.00, NULL, 50, NULL, 100, '["24/7 Support", "Dedicated Account Manager", "Custom Integrations", "Advanced Analytics"]', 1, 5),
('ENTERPRISE_YEARLY', 'Enterprise Plan (Yearly)', 'Full features for large hospitals - Yearly billing', 'enterprise', 'yearly', 480000.00, 20.00, NULL, 50, NULL, 100, '["24/7 Support", "Dedicated Account Manager", "Custom Integrations", "Advanced Analytics"]', 1, 6)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

