-- Pharmacy POS System Database Schema
-- This file extends the existing HMS schema with comprehensive pharmacy management functionality
-- Includes: Stock Management, Sales, Purchases, Refunds, Suppliers, Reorder Management

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `supplier_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique supplier code (e.g., SUP001)',
  `name` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `contact_person` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `alternate_phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'Pakistan',
  `zip_code` VARCHAR(20) DEFAULT NULL,
  `tax_id` VARCHAR(50) DEFAULT NULL COMMENT 'NTN or Tax Registration Number',
  `payment_terms` VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Net 30, COD, Advance',
  `credit_limit` DECIMAL(12,2) DEFAULT 0.00,
  `outstanding_balance` DECIMAL(12,2) DEFAULT 0.00,
  `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Rating out of 5.00',
  `status` ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_supplier_code` (`supplier_code`),
  INDEX `idx_name` (`name`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEDICINE STOCK TABLE (Batch-based Inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS `medicine_stock` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_id` INT(11) NOT NULL,
  `batch_number` VARCHAR(100) NOT NULL,
  `manufacture_date` DATE DEFAULT NULL,
  `expiry_date` DATE NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 0 COMMENT 'Available quantity',
  `reserved_quantity` INT(11) NOT NULL DEFAULT 0 COMMENT 'Reserved for pending sales',
  `cost_price` DECIMAL(10,2) NOT NULL COMMENT 'Per unit cost price',
  `selling_price` DECIMAL(10,2) NOT NULL COMMENT 'Per unit selling price',
  `location` VARCHAR(100) DEFAULT NULL COMMENT 'Shelf/Location identifier',
  `supplier_id` INT(11) DEFAULT NULL COMMENT 'Supplier from whom stock was purchased',
  `purchase_order_id` INT(11) DEFAULT NULL COMMENT 'Related purchase order',
  `stock_receipt_id` INT(11) DEFAULT NULL COMMENT 'Related stock receipt',
  `status` ENUM('Active', 'Expired', 'Damaged', 'Sold Out') NOT NULL DEFAULT 'Active',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_batch_number` (`batch_number`),
  INDEX `idx_expiry_date` (`expiry_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_supplier_id` (`supplier_id`),
  INDEX `idx_medicine_expiry` (`medicine_id`, `expiry_date`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_quantity_non_negative` CHECK (`quantity` >= 0),
  CONSTRAINT `chk_reserved_quantity` CHECK (`reserved_quantity` >= 0 AND `reserved_quantity` <= `quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BARCODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `barcodes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_id` INT(11) NOT NULL,
  `barcode` VARCHAR(100) NOT NULL UNIQUE,
  `barcode_type` VARCHAR(50) DEFAULT 'EAN-13' COMMENT 'EAN-13, UPC, Code128, etc.',
  `is_primary` TINYINT(1) DEFAULT 0 COMMENT 'Primary barcode for this medicine',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_barcode` (`barcode`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_barcode` (`barcode`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REORDER LEVELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `reorder_levels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_id` INT(11) NOT NULL,
  `minimum_stock` INT(11) NOT NULL DEFAULT 0 COMMENT 'Minimum stock level before reorder',
  `reorder_quantity` INT(11) NOT NULL DEFAULT 0 COMMENT 'Suggested reorder quantity',
  `maximum_stock` INT(11) DEFAULT NULL COMMENT 'Maximum stock level',
  `preferred_supplier_id` INT(11) DEFAULT NULL,
  `auto_reorder` TINYINT(1) DEFAULT 0 COMMENT 'Enable auto-reorder',
  `last_reorder_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_medicine_reorder` (`medicine_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_preferred_supplier` (`preferred_supplier_id`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`preferred_supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `po_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique PO number (e.g., PO-20240115-001)',
  `supplier_id` INT(11) NOT NULL,
  `order_date` DATE NOT NULL,
  `expected_delivery_date` DATE DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax_rate` DECIMAL(5,2) DEFAULT 14.00 COMMENT 'Tax percentage',
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `shipping_cost` DECIMAL(10,2) DEFAULT 0.00,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Draft', 'Pending', 'Approved', 'Partially Received', 'Received', 'Cancelled') NOT NULL DEFAULT 'Draft',
  `approved_by` INT(11) DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_po_number` (`po_number`),
  INDEX `idx_supplier_id` (`supplier_id`),
  INDEX `idx_order_date` (`order_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PURCHASE ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` INT(11) NOT NULL,
  `medicine_id` INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL,
  `unit_cost` DECIMAL(10,2) NOT NULL,
  `total_cost` DECIMAL(12,2) NOT NULL,
  `received_quantity` INT(11) DEFAULT 0 COMMENT 'Quantity received so far',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_purchase_order_id` (`purchase_order_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_po_item_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_received_quantity` CHECK (`received_quantity` >= 0 AND `received_quantity` <= `quantity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_receipts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique receipt number (e.g., REC-20240115-001)',
  `purchase_order_id` INT(11) DEFAULT NULL COMMENT 'Related purchase order (if any)',
  `supplier_id` INT(11) NOT NULL,
  `receipt_date` DATE NOT NULL,
  `received_by` INT(11) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_receipt_number` (`receipt_number`),
  INDEX `idx_purchase_order_id` (`purchase_order_id`),
  INDEX `idx_supplier_id` (`supplier_id`),
  INDEX `idx_receipt_date` (`receipt_date`),
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`received_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK RECEIPT ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_receipt_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `stock_receipt_id` INT(11) NOT NULL,
  `medicine_id` INT(11) NOT NULL,
  `batch_number` VARCHAR(100) NOT NULL,
  `manufacture_date` DATE DEFAULT NULL,
  `expiry_date` DATE NOT NULL,
  `quantity` INT(11) NOT NULL,
  `cost_price` DECIMAL(10,2) NOT NULL,
  `selling_price` DECIMAL(10,2) NOT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `purchase_order_item_id` INT(11) DEFAULT NULL COMMENT 'Related PO item',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_stock_receipt_id` (`stock_receipt_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_batch_number` (`batch_number`),
  FOREIGN KEY (`stock_receipt_id`) REFERENCES `stock_receipts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_receipt_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CUSTOMERS TABLE (Extended for Pharmacy)
-- ============================================
CREATE TABLE IF NOT EXISTS `pharmacy_customers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `customer_code` VARCHAR(50) DEFAULT NULL COMMENT 'Unique customer code',
  `patient_id` INT(11) DEFAULT NULL COMMENT 'Link to patients table if registered',
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `alternate_phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `zip_code` VARCHAR(20) DEFAULT NULL,
  `customer_type` ENUM('Patient', 'Walk-in', 'Insurance') NOT NULL DEFAULT 'Walk-in',
  `total_purchases` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Lifetime purchase amount',
  `last_purchase_date` DATE DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_code` (`customer_code`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_email` (`email`),
  INDEX `idx_customer_type` (`customer_type`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique invoice number (e.g., INV-20240115-001)',
  `customer_id` INT(11) DEFAULT NULL COMMENT 'Link to pharmacy_customers',
  `patient_id` INT(11) DEFAULT NULL COMMENT 'Link to patients table (if registered patient)',
  `prescription_id` INT(11) DEFAULT NULL COMMENT 'Link to prescription if applicable',
  `customer_name` VARCHAR(255) NOT NULL COMMENT 'Customer name (for walk-in or quick reference)',
  `customer_phone` VARCHAR(20) DEFAULT NULL,
  `customer_email` VARCHAR(100) DEFAULT NULL,
  `customer_address` TEXT DEFAULT NULL,
  `sale_date` DATETIME NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) DEFAULT 0.00,
  `discount_percentage` DECIMAL(5,2) DEFAULT 0.00,
  `tax_rate` DECIMAL(5,2) DEFAULT 14.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('Cash', 'Card', 'Insurance', 'Credit', 'Wallet') NOT NULL DEFAULT 'Cash',
  `amount_received` DECIMAL(12,2) DEFAULT NULL COMMENT 'Amount received (for cash payments)',
  `change_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('Completed', 'Pending', 'Cancelled', 'Refunded') NOT NULL DEFAULT 'Completed',
  `cashier_id` INT(11) DEFAULT NULL COMMENT 'User who processed the sale',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invoice_number` (`invoice_number`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_prescription_id` (`prescription_id`),
  INDEX `idx_sale_date` (`sale_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_cashier_id` (`cashier_id`),
  INDEX `idx_invoice_number` (`invoice_number`),
  FOREIGN KEY (`customer_id`) REFERENCES `pharmacy_customers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sale_id` INT(11) NOT NULL,
  `medicine_id` INT(11) NOT NULL,
  `stock_id` INT(11) NOT NULL COMMENT 'Link to medicine_stock (batch)',
  `medicine_name` VARCHAR(255) NOT NULL COMMENT 'Medicine name at time of sale',
  `batch_number` VARCHAR(100) NOT NULL,
  `quantity` INT(11) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `discount_percentage` DECIMAL(5,2) DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sale_id` (`sale_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_stock_id` (`stock_id`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`stock_id`) REFERENCES `medicine_stock`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_sale_item_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REFUNDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `refunds` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `refund_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique refund number (e.g., REF-20240115-001)',
  `sale_id` INT(11) NOT NULL COMMENT 'Original sale being refunded',
  `refund_date` DATETIME NOT NULL,
  `refund_type` ENUM('Full', 'Partial') NOT NULL DEFAULT 'Full',
  `refund_reason` VARCHAR(255) DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('Cash', 'Card', 'Original') NOT NULL DEFAULT 'Cash',
  `status` ENUM('Pending', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `processed_by` INT(11) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_refund_number` (`refund_number`),
  INDEX `idx_sale_id` (`sale_id`),
  INDEX `idx_refund_date` (`refund_date`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_refund_amount` CHECK (`total_amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REFUND ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `refund_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `refund_id` INT(11) NOT NULL,
  `sale_item_id` INT(11) NOT NULL COMMENT 'Original sale item',
  `medicine_id` INT(11) NOT NULL,
  `stock_id` INT(11) DEFAULT NULL COMMENT 'Stock returned (if returned to inventory)',
  `quantity` INT(11) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `return_to_stock` TINYINT(1) DEFAULT 0 COMMENT 'Whether item is returned to stock',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_refund_id` (`refund_id`),
  INDEX `idx_sale_item_id` (`sale_item_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  FOREIGN KEY (`refund_id`) REFERENCES `refunds`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sale_item_id`) REFERENCES `sale_items`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`stock_id`) REFERENCES `medicine_stock`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_refund_item_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK MOVEMENTS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_id` INT(11) NOT NULL,
  `stock_id` INT(11) DEFAULT NULL COMMENT 'Specific stock batch (if applicable)',
  `movement_type` ENUM('Purchase', 'Sale', 'Refund', 'Adjustment', 'Transfer', 'Expiry', 'Damage') NOT NULL,
  `reference_id` INT(11) DEFAULT NULL COMMENT 'ID of related transaction (sale_id, purchase_order_id, etc.)',
  `reference_type` VARCHAR(50) DEFAULT NULL COMMENT 'Type of reference (sale, purchase_order, adjustment, etc.)',
  `quantity` INT(11) NOT NULL COMMENT 'Positive for additions, negative for deductions',
  `stock_before` INT(11) NOT NULL COMMENT 'Stock quantity before movement',
  `stock_after` INT(11) NOT NULL COMMENT 'Stock quantity after movement',
  `cost_price` DECIMAL(10,2) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_stock_id` (`stock_id`),
  INDEX `idx_movement_type` (`movement_type`),
  INDEX `idx_reference` (`reference_type`, `reference_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`stock_id`) REFERENCES `medicine_stock`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK ADJUSTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `adjustment_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique adjustment number',
  `medicine_id` INT(11) NOT NULL,
  `stock_id` INT(11) DEFAULT NULL COMMENT 'Specific stock batch (if applicable)',
  `adjustment_type` ENUM('Increase', 'Decrease', 'Expiry Write-off', 'Damage Write-off', 'Theft', 'Correction') NOT NULL,
  `quantity` INT(11) NOT NULL COMMENT 'Absolute quantity (always positive)',
  `reason` VARCHAR(255) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
  `requested_by` INT(11) DEFAULT NULL,
  `approved_by` INT(11) DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_adjustment_number` (`adjustment_number`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_stock_id` (`stock_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_adjustment_type` (`adjustment_type`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`stock_id`) REFERENCES `medicine_stock`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_adjustment_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEDICINE ALTERNATIVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `medicine_alternatives` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_id` INT(11) NOT NULL COMMENT 'Original medicine',
  `alternative_medicine_id` INT(11) NOT NULL COMMENT 'Alternative medicine',
  `similarity_score` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Similarity score (0-100)',
  `match_criteria` VARCHAR(255) DEFAULT NULL COMMENT 'Why this is an alternative (generic match, therapeutic class, etc.)',
  `therapeutic_class_match` TINYINT(1) DEFAULT 0,
  `generic_name_match` TINYINT(1) DEFAULT 0,
  `indication_match` TINYINT(1) DEFAULT 0,
  `strength_compatible` TINYINT(1) DEFAULT 0,
  `prescription_required` TINYINT(1) DEFAULT 0 COMMENT 'Whether alternative requires prescription',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_medicine_alternative` (`medicine_id`, `alternative_medicine_id`),
  INDEX `idx_medicine_id` (`medicine_id`),
  INDEX `idx_alternative_medicine_id` (`alternative_medicine_id`),
  INDEX `idx_similarity_score` (`similarity_score`),
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`alternative_medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEDICINE DATABASE CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `medicine_database` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `medicine_name` VARCHAR(255) NOT NULL,
  `generic_name` VARCHAR(255) DEFAULT NULL,
  `brand_name` VARCHAR(255) DEFAULT NULL,
  `manufacturer` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `therapeutic_class` VARCHAR(100) DEFAULT NULL,
  `indication` TEXT DEFAULT NULL,
  `strength` VARCHAR(100) DEFAULT NULL,
  `form` VARCHAR(50) DEFAULT NULL,
  `unit` VARCHAR(50) DEFAULT NULL,
  `requires_prescription` TINYINT(1) DEFAULT 0,
  `drap_number` VARCHAR(50) DEFAULT NULL COMMENT 'DRAP registration number',
  `source` VARCHAR(100) DEFAULT NULL COMMENT 'Source of data (DRAP, PharmaGuide, etc.)',
  `last_synced_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_medicine_name` (`medicine_name`),
  INDEX `idx_generic_name` (`generic_name`),
  INDEX `idx_brand_name` (`brand_name`),
  INDEX `idx_category` (`category`),
  INDEX `idx_therapeutic_class` (`therapeutic_class`),
  INDEX `idx_drap_number` (`drap_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPDATE MEDICINES TABLE (Add missing fields)
-- ============================================
ALTER TABLE `medicines` 
  ADD COLUMN IF NOT EXISTS `barcode` VARCHAR(100) DEFAULT NULL AFTER `strength`,
  ADD COLUMN IF NOT EXISTS `requires_prescription` TINYINT(1) DEFAULT 0 AFTER `status`,
  ADD COLUMN IF NOT EXISTS `therapeutic_class` VARCHAR(100) DEFAULT NULL AFTER `category`,
  ADD COLUMN IF NOT EXISTS `indication` TEXT DEFAULT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `drap_number` VARCHAR(50) DEFAULT NULL COMMENT 'DRAP registration number' AFTER `requires_prescription`;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS `idx_barcode` ON `medicines`(`barcode`);
CREATE INDEX IF NOT EXISTS `idx_therapeutic_class` ON `medicines`(`therapeutic_class`);
CREATE INDEX IF NOT EXISTS `idx_requires_prescription` ON `medicines`(`requires_prescription`);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Medicine Stock Summary
CREATE OR REPLACE VIEW `v_medicine_stock_summary` AS
SELECT 
  m.id as medicine_id,
  m.medicine_code,
  m.name,
  m.generic_name,
  m.category,
  COALESCE(SUM(ms.quantity), 0) as total_stock,
  COALESCE(SUM(ms.reserved_quantity), 0) as total_reserved,
  COALESCE(SUM(ms.quantity) - SUM(ms.reserved_quantity), 0) as available_stock,
  COUNT(DISTINCT ms.id) as batch_count,
  MIN(ms.expiry_date) as earliest_expiry,
  COALESCE(MAX(ms.selling_price), 0) as max_selling_price,
  COALESCE(MIN(ms.cost_price), 0) as min_cost_price
FROM medicines m
LEFT JOIN medicine_stock ms ON m.id = ms.medicine_id AND ms.status = 'Active'
WHERE m.status = 'Active'
GROUP BY m.id, m.medicine_code, m.name, m.generic_name, m.category;

-- View: Low Stock Alerts
CREATE OR REPLACE VIEW `v_low_stock_alerts` AS
SELECT 
  m.id as medicine_id,
  m.medicine_code,
  m.name,
  m.generic_name,
  COALESCE(SUM(ms.quantity) - SUM(ms.reserved_quantity), 0) as available_stock,
  COALESCE(rl.minimum_stock, 0) as minimum_stock,
  COALESCE(rl.reorder_quantity, 0) as reorder_quantity,
  rl.preferred_supplier_id,
  s.name as preferred_supplier_name
FROM medicines m
LEFT JOIN medicine_stock ms ON m.id = ms.medicine_id AND ms.status = 'Active'
LEFT JOIN reorder_levels rl ON m.id = rl.medicine_id
LEFT JOIN suppliers s ON rl.preferred_supplier_id = s.id
WHERE m.status = 'Active'
GROUP BY m.id, m.medicine_code, m.name, m.generic_name, rl.minimum_stock, rl.reorder_quantity, rl.preferred_supplier_id, s.name
HAVING available_stock < COALESCE(minimum_stock, 0) OR available_stock = 0;

-- View: Expiring Stock Alerts
CREATE OR REPLACE VIEW `v_expiring_stock_alerts` AS
SELECT 
  ms.id as stock_id,
  m.id as medicine_id,
  m.medicine_code,
  m.name,
  ms.batch_number,
  ms.expiry_date,
  ms.quantity,
  DATEDIFF(ms.expiry_date, CURDATE()) as days_until_expiry
FROM medicine_stock ms
JOIN medicines m ON ms.medicine_id = m.id
WHERE ms.status = 'Active' 
  AND ms.quantity > 0
  AND ms.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
ORDER BY ms.expiry_date ASC;

-- View: Sales Summary (Daily)
CREATE OR REPLACE VIEW `v_sales_summary_daily` AS
SELECT 
  DATE(s.sale_date) as sale_date,
  COUNT(DISTINCT s.id) as total_sales,
  COUNT(DISTINCT s.customer_id) as total_customers,
  SUM(s.subtotal) as total_subtotal,
  SUM(s.discount_amount) as total_discount,
  SUM(s.tax_amount) as total_tax,
  SUM(s.total_amount) as total_revenue,
  SUM(CASE WHEN s.payment_method = 'Cash' THEN s.total_amount ELSE 0 END) as cash_sales,
  SUM(CASE WHEN s.payment_method = 'Card' THEN s.total_amount ELSE 0 END) as card_sales,
  SUM(CASE WHEN s.payment_method = 'Insurance' THEN s.total_amount ELSE 0 END) as insurance_sales
FROM sales s
WHERE s.status = 'Completed'
GROUP BY DATE(s.sale_date);

-- ============================================
-- INITIAL DATA / DEFAULTS
-- ============================================

-- Insert default reorder levels for existing medicines (if any)
INSERT INTO reorder_levels (medicine_id, minimum_stock, reorder_quantity, auto_reorder)
SELECT id, 10, 50, 0 FROM medicines WHERE status = 'Active'
ON DUPLICATE KEY UPDATE medicine_id = medicine_id;

