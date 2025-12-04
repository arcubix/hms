-- IPD Module Complete Database Schema
-- This file creates all IPD tables in the correct order
-- Run this file to set up the complete IPD module database structure

-- ============================================
-- IMPORT ORDER (run these files in sequence):
-- ============================================
-- 1. ipd_wards_schema.sql
-- 2. ipd_beds_schema.sql
-- 3. ipd_rooms_schema.sql
-- 4. ipd_admissions_schema.sql
-- 5. ipd_vital_signs_schema.sql
-- 6. ipd_treatment_orders_schema.sql
-- 7. ipd_nursing_notes_schema.sql
-- 8. ipd_billing_schema.sql
-- 9. ipd_discharge_summaries_schema.sql
-- 10. ipd_transfers_schema.sql
-- 11. Run the ALTER TABLE statements below to add foreign key constraints

-- ============================================
-- NOTE: Foreign key constraints have been removed
-- All relationships are maintained through application logic
-- ============================================

