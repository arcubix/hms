-- POS Settings and GST Rates Database Schema
-- This file adds tables for POS configuration and GST rate management

-- ============================================
-- POS SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `pos_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique setting identifier',
  `setting_value` JSON NOT NULL COMMENT 'Setting value stored as JSON for flexibility',
  `category` VARCHAR(50) NOT NULL COMMENT 'Settings category (general, tax, receipt, payment, etc.)',
  `description` TEXT DEFAULT NULL COMMENT 'Description of what this setting does',
  `updated_by` INT(11) DEFAULT NULL COMMENT 'User who last updated this setting',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`),
  INDEX `idx_category` (`category`),
  INDEX `idx_updated_by` (`updated_by`),
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GST RATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `gst_rates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `rate_name` VARCHAR(100) NOT NULL COMMENT 'GST rate name (e.g., "Standard", "Zero Rated", "Exempt")',
  `rate_percentage` DECIMAL(5,2) NOT NULL COMMENT 'GST rate percentage (0.00 to 100.00)',
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'Optional: Link to medicine category for automatic application',
  `description` TEXT DEFAULT NULL COMMENT 'Description of this GST rate',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this rate is active',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether this is the default GST rate',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_rate_name` (`rate_name`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_is_default` (`is_default`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Rate percentage validation (0-100) is handled in application logic (Gst_rate_model)
-- Note: Single default rate enforcement is handled in application logic (Gst_rate_model)
-- The model ensures only one rate can be set as default at a time

-- Insert default GST rate (14% - Standard rate in Pakistan)
INSERT INTO `gst_rates` (`rate_name`, `rate_percentage`, `description`, `is_active`, `is_default`, `created_at`) 
VALUES ('Standard', 14.00, 'Standard GST rate for most medicines', 1, 1, NOW())
ON DUPLICATE KEY UPDATE `rate_name` = `rate_name`;

-- Insert default POS settings
INSERT INTO `pos_settings` (`setting_key`, `setting_value`, `category`, `description`) VALUES
('company_name', '"Hospital Pharmacy"', 'general', 'Company/Pharmacy name'),
('company_address', '"123 Medical Street, City"', 'general', 'Company address'),
('company_phone', '"+92-XXX-XXXXXXX"', 'general', 'Company phone number'),
('company_email', '"pharmacy@hospital.com"', 'general', 'Company email address'),
('currency_symbol', '"PKR"', 'general', 'Currency symbol'),
('currency_code', '"PKR"', 'general', 'Currency code'),
('date_format', '"YYYY-MM-DD"', 'general', 'Date format'),
('time_format', '"HH:mm"', 'general', 'Time format'),

('default_tax_rate', '14.00', 'tax', 'Default tax/GST rate percentage'),
('tax_calculation_method', '"exclusive"', 'tax', 'Tax calculation method: inclusive or exclusive'),
('tax_rounding', '"round"', 'tax', 'Tax rounding method: round, floor, ceil'),

('invoice_prefix', '"INV-"', 'receipt', 'Invoice number prefix'),
('invoice_number_format', '"INV-{YYYY}{MM}{DD}-{####}"', 'receipt', 'Invoice number format'),
('receipt_footer', '"Thank you for your purchase!"', 'receipt', 'Receipt footer text'),
('paper_size', '"80mm"', 'receipt', 'Receipt paper size: 80mm, A4'),
('auto_print', 'true', 'receipt', 'Auto-print receipt after payment'),
('show_stock_on_receipt', 'false', 'receipt', 'Show stock information on receipt'),
('show_expiry_on_receipt', 'false', 'receipt', 'Show expiry dates on receipt'),

('payment_methods_cash', 'true', 'payment', 'Enable Cash payment method'),
('payment_methods_card', 'true', 'payment', 'Enable Card payment method'),
('payment_methods_insurance', 'true', 'payment', 'Enable Insurance payment method'),
('payment_methods_credit', 'false', 'payment', 'Enable Credit payment method'),
('payment_methods_wallet', 'false', 'payment', 'Enable Wallet payment method'),
('default_payment_method', '"cash"', 'payment', 'Default payment method'),
('split_payment_allowed', 'true', 'payment', 'Allow split payments'),
('cash_rounding', '"none"', 'payment', 'Cash rounding: none, round, floor, ceil'),
('min_card_amount', '0.00', 'payment', 'Minimum card payment amount'),

('stock_allocation_method', '"FIFO"', 'stock', 'Stock allocation method: FIFO or LIFO'),
('low_stock_threshold', '10', 'stock', 'Low stock threshold percentage'),
('auto_reserve_stock', 'true', 'stock', 'Auto-reserve stock when added to cart'),
('stock_reservation_timeout', '30', 'stock', 'Stock reservation timeout in minutes'),
('expiry_alert_days', '30', 'stock', 'Days before expiry to show alert'),

('max_item_discount', '50', 'discount', 'Maximum discount percentage for individual items'),
('max_global_discount', '30', 'discount', 'Maximum global discount percentage'),
('discount_approval_threshold', '20', 'discount', 'Discount percentage requiring approval'),
('price_override_require_approval', 'true', 'discount', 'Require approval for price overrides'),
('max_price_override', '25', 'discount', 'Maximum price override percentage'),

('auto_open_shift', 'false', 'shift', 'Auto-open shift on login'),
('require_shift_closing', 'true', 'shift', 'Require shift closing before logout'),
('cash_drawer_auto_open', 'false', 'shift', 'Auto-open cash drawer on sale'),
('default_opening_cash', '0.00', 'shift', 'Default opening cash amount'),
('cash_drop_require_auth', 'true', 'shift', 'Require authorization for cash drops'),

('barcode_auto_focus', 'true', 'barcode', 'Auto-focus barcode scanner input'),
('barcode_beep_sound', 'true', 'barcode', 'Play beep sound on barcode scan'),
('barcode_validation', 'true', 'barcode', 'Validate barcode format'),
('barcode_auto_add', 'true', 'barcode', 'Auto-add to cart on barcode scan'),

('default_view_mode', '"grid"', 'ui', 'Default view mode: grid or list'),
('items_per_page', '20', 'ui', 'Items per page'),
('show_stock_availability', 'true', 'ui', 'Show stock availability'),
('show_expiry_dates', 'true', 'ui', 'Show expiry dates'),
('keyboard_shortcuts_enabled', 'true', 'ui', 'Enable keyboard shortcuts'),

('auto_create_walkin', 'true', 'customer', 'Auto-create walk-in customers'),
('require_phone', 'false', 'customer', 'Require phone number for customers'),
('require_email', 'false', 'customer', 'Require email for customers'),

('require_prescription_validation', 'false', 'prescription', 'Require prescription validation'),
('check_prescription_expiry', 'true', 'prescription', 'Check prescription expiry date'),
('enforce_prescription_quantity', 'true', 'prescription', 'Enforce prescription quantity limits'),
('prescription_refill_tracking', 'true', 'prescription', 'Track prescription refills'),

('printer_name', '""', 'printer', 'Printer device name'),
('paper_width', '80', 'printer', 'Paper width in mm'),
('print_quality', '"normal"', 'printer', 'Print quality: draft, normal, high'),
('auto_cut', 'false', 'printer', 'Auto-cut paper after print'),
('print_duplicate', 'false', 'printer', 'Print duplicate receipts'),

('low_stock_alert_method', '"in-app"', 'notifications', 'Low stock alert method: email, sms, in-app'),
('expiry_alert_method', '"in-app"', 'notifications', 'Expiry alert method: email, sms, in-app'),
('sound_notifications', 'true', 'notifications', 'Enable sound notifications'),
('toast_duration', '3000', 'notifications', 'Toast notification duration in milliseconds')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;

