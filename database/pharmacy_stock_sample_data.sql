-- Pharmacy Stock Sample Data
-- This script adds sample stock data for medicines to appear in the POS system
-- Run this after the pharmacy_pos_schema.sql has been executed
-- This script uses dynamic medicine IDs based on medicine names/codes

-- First, ensure we have at least one supplier
INSERT IGNORE INTO `suppliers` (
    `id`, `supplier_code`, `name`, `company_name`, `phone`, `email`, 
    `address`, `city`, `status`, `created_at`
) VALUES
(1, 'SUP001', 'MediSupply Co.', 'MediSupply Pharmaceuticals Ltd.', '0300-1234567', 'contact@medisupply.com', 
 '123 Industrial Area, Karachi', 'Karachi', 'Active', NOW()),
(2, 'SUP002', 'HealthCare Distributors', 'HealthCare Distributors Pvt Ltd.', '0300-2345678', 'info@healthcare.pk', 
 '456 Business District, Lahore', 'Lahore', 'Active', NOW()),
(3, 'SUP003', 'PharmaDirect', 'PharmaDirect Solutions', '0300-3456789', 'sales@pharmadirect.pk', 
 '789 Medical Zone, Islamabad', 'Islamabad', 'Active', NOW());

-- Insert stock data using subqueries to get medicine IDs by name or code
-- This way it works regardless of what medicine IDs exist in your database

-- Stock for Panadol (Paracetamol)
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'PCM-2024-001', '2024-01-15', '2026-01-15', 500, 0, 1.50, 2.50, 'A1-S1', 1, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Panadol%' OR generic_name LIKE '%Paracetamol%') AND status = 'Active' LIMIT 1;

INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'PCM-2024-002', '2024-02-01', '2026-02-01', 300, 0, 1.55, 2.50, 'A1-S2', 1, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Panadol%' OR generic_name LIKE '%Paracetamol%') AND status = 'Active' LIMIT 1;

-- Stock for Brufen (Ibuprofen)
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'IBU-2024-001', '2024-01-10', '2026-01-10', 350, 0, 2.00, 3.20, 'A1-S3', 1, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Brufen%' OR generic_name LIKE '%Ibuprofen%') AND status = 'Active' LIMIT 1;

INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'IBU-2024-002', '2024-02-15', '2026-02-15', 250, 0, 2.05, 3.20, 'A1-S4', 1, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Brufen%' OR generic_name LIKE '%Ibuprofen%') AND status = 'Active' LIMIT 1;

-- Stock for Diclofenac
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'DIC-2024-001', '2024-01-05', '2025-08-20', 280, 0, 1.20, 1.80, 'A1-S5', 1, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Diclofenac%' OR generic_name LIKE '%Diclofenac%') AND status = 'Active' LIMIT 1;

-- Stock for Augmentin (Amoxicillin + Clavulanic Acid)
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'AUG-2024-001', '2024-01-20', '2025-06-30', 200, 0, 3.50, 5.00, 'B1-S1', 2, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Augmentin%' OR generic_name LIKE '%Amoxicillin%Clavulanic%') AND status = 'Active' LIMIT 1;

INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'AUG-2024-002', '2024-02-10', '2025-07-30', 180, 0, 3.55, 5.00, 'B1-S2', 2, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Augmentin%' OR generic_name LIKE '%Amoxicillin%Clavulanic%') AND status = 'Active' LIMIT 1;

-- Stock for Azithromycin
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'AZI-2024-001', '2024-01-12', '2025-10-12', 150, 0, 9.00, 12.50, 'B1-S3', 2, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Azithromycin%' OR generic_name LIKE '%Azithromycin%') AND status = 'Active' LIMIT 1;

INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'AZI-2024-002', '2024-02-20', '2025-11-12', 120, 0, 9.20, 12.50, 'B1-S4', 2, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Azithromycin%' OR generic_name LIKE '%Azithromycin%') AND status = 'Active' LIMIT 1;

-- Stock for Ciprofloxacin
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'CIP-2024-001', '2024-01-08', '2025-07-18', 150, 0, 6.00, 8.75, 'B1-S5', 2, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Ciprofloxacin%' OR generic_name LIKE '%Ciprofloxacin%') AND status = 'Active' LIMIT 1;

-- Stock for Amoxicillin
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'AMX-2024-001', '2024-01-18', '2025-09-15', 200, 0, 2.50, 4.00, 'B1-S6', 2, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Amoxicillin%' AND name NOT LIKE '%Augmentin%') AND status = 'Active' LIMIT 1;

-- Stock for Omeprazole
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'OME-2024-001', '2024-01-18', '2025-09-15', 150, 0, 5.50, 8.00, 'C1-S1', 3, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Omeprazole%' OR generic_name LIKE '%Omeprazole%') AND status = 'Active' LIMIT 1;

INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT id, 'OME-2024-002', '2024-02-05', '2025-10-15', 130, 0, 5.60, 8.00, 'C1-S2', 3, 'Active', NOW()
FROM medicines WHERE (name LIKE '%Omeprazole%' OR generic_name LIKE '%Omeprazole%') AND status = 'Active' LIMIT 1;

-- Add stock for ALL active medicines that don't have stock yet
-- This ensures every medicine in the database has at least some stock
INSERT INTO `medicine_stock` (
    `medicine_id`, `batch_number`, `manufacture_date`, `expiry_date`, 
    `quantity`, `reserved_quantity`, `cost_price`, `selling_price`, 
    `location`, `supplier_id`, `status`, `created_at`
)
SELECT 
    m.id,
    CONCAT('BATCH-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(m.id, 4, '0')) as batch_number,
    DATE_SUB(NOW(), INTERVAL 30 DAY) as manufacture_date,
    DATE_ADD(NOW(), INTERVAL 365 DAY) as expiry_date,
    100 as quantity,
    0 as reserved_quantity,
    5.00 as cost_price,
    10.00 as selling_price,
    CONCAT('SHELF-', LPAD(m.id % 10, 2, '0')) as location,
    1 as supplier_id,
    'Active' as status,
    NOW() as created_at
FROM medicines m
WHERE m.status = 'Active'
AND m.id NOT IN (SELECT DISTINCT medicine_id FROM medicine_stock WHERE status = 'Active')
LIMIT 50;

-- Add reorder levels for medicines that have stock
INSERT IGNORE INTO `reorder_levels` (
    `medicine_id`, `minimum_stock`, `reorder_quantity`, `maximum_stock`, 
    `preferred_supplier_id`, `auto_reorder`, `created_at`
)
SELECT 
    ms.medicine_id,
    20 as minimum_stock,
    100 as reorder_quantity,
    500 as maximum_stock,
    1 as preferred_supplier_id,
    1 as auto_reorder,
    NOW() as created_at
FROM (
    SELECT DISTINCT medicine_id 
    FROM medicine_stock 
    WHERE status = 'Active'
) ms
WHERE ms.medicine_id NOT IN (SELECT medicine_id FROM reorder_levels);

