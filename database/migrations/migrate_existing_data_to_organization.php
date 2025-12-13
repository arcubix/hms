<?php
/**
 * Migration Script: Migrate Existing Data to Default Organization
 * 
 * This script:
 * 1. Creates a default organization for existing data
 * 2. Migrates all existing records to the default organization
 * 3. Maps support_tickets.practice_id to organization_id
 * 
 * Run this AFTER running add_organization_id_to_all_tables.sql
 */

// Database connection (adjust as needed)
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'hms_db';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "Starting data migration to default organization...\n";
    
    // Step 1: Create default organization
    echo "Step 1: Creating default organization...\n";
    $default_org_code = 'ORG001';
    $default_org_name = 'Default Hospital';
    $default_email = 'default@hospital.com';
    
    // Check if default organization already exists
    $check_sql = "SELECT id FROM organizations WHERE organization_code = ?";
    $stmt = $conn->prepare($check_sql);
    $stmt->bind_param("s", $default_org_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $default_org_id = $row['id'];
        echo "Default organization already exists with ID: $default_org_id\n";
    } else {
        // Create default organization
        $insert_sql = "INSERT INTO organizations (
            organization_code, name, email, phone, organization_type, 
            subscription_status, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $phone = '+1234567890';
        $org_type = 'Hospital';
        $sub_status = 'active';
        $status = 'active';
        
        $stmt = $conn->prepare($insert_sql);
        $stmt->bind_param("sssssss", 
            $default_org_code, 
            $default_org_name, 
            $default_email, 
            $phone, 
            $org_type, 
            $sub_status, 
            $status
        );
        
        if ($stmt->execute()) {
            $default_org_id = $conn->insert_id;
            echo "Created default organization with ID: $default_org_id\n";
        } else {
            die("Error creating default organization: " . $stmt->error . "\n");
        }
    }
    $stmt->close();
    
    // Step 2: Update all tables with NULL organization_id to default_org_id
    echo "\nStep 2: Migrating existing data to default organization...\n";
    
    $tables = [
        'users',
        'patients',
        'doctors',
        'appointments',
        'patient_medical_records',
        'ipd_wards',
        'ipd_rooms',
        'ipd_beds',
        'ipd_admissions',
        'ipd_billing',
        'ipd_vital_signs',
        'ipd_treatment_orders',
        'ipd_nursing_notes',
        'ipd_discharge_summaries',
        'ipd_transfers',
        'ipd_admission_requests',
        'ipd_rehabilitation_requests',
        'floors',
        'departments',
        'rooms',
        'receptions',
        'doctor_room_assignments',
        'doctor_slot_rooms',
        'tokens',
        'emergency_wards',
        'emergency_ward_beds',
        'emergency_patient_files',
        'emergency_vital_signs',
        'emergency_intake_output',
        'emergency_health_physical',
        'emergency_ambulance',
        'emergency_transfers',
        'emergency_blood_bank_requests',
        'emergency_duty_roster',
        'medicines',
        'medicine_stock',
        'pharmacy_sales',
        'pharmacy_sale_items',
        'sale_payments',
        'suppliers',
        'purchase_orders',
        'stock_movements',
        'stock_adjustments',
        'reorder_levels',
        'barcodes',
        'refunds',
        'lab_tests',
        'radiology_tests',
        'prescriptions',
        'prescription_vitals',
        'prescription_radiology_tests',
        'prescription_radiology_investigation',
        'insurance_organizations',
        'insurance_pricing',
        'referral_hospitals',
        'donation_donors',
        'donation_payments',
        'birth_certificates',
        'death_certificates',
        'audit_logs',
        'system_settings',
        'pos_settings',
        'gst_rates',
        'shifts',
        'message_templates',
        'message_platforms'
    ];
    
    // Optional tables that may not exist
    $optional_tables = [
        'ipd_infections',
        'ipd_ot_schedules'
    ];
    
    foreach ($tables as $table) {
        // Check if table exists
        $check_table = "SHOW TABLES LIKE '$table'";
        $result = $conn->query($check_table);
        
        if ($result && $result->num_rows > 0) {
            // Check if organization_id column exists
            $check_col = "SHOW COLUMNS FROM `$table` LIKE 'organization_id'";
            $col_result = $conn->query($check_col);
            
            if ($col_result && $col_result->num_rows > 0) {
                $update_sql = "UPDATE `$table` SET organization_id = ? WHERE organization_id IS NULL";
                $stmt = $conn->prepare($update_sql);
                $stmt->bind_param("i", $default_org_id);
                
                if ($stmt->execute()) {
                    $affected = $conn->affected_rows;
                    if ($affected > 0) {
                        echo "  Updated $table: $affected rows\n";
                    }
                } else {
                    echo "  Error updating $table: " . $stmt->error . "\n";
                }
                $stmt->close();
            } else {
                echo "  Skipping $table: organization_id column not found\n";
            }
        } else {
            echo "  Skipping $table: table does not exist\n";
        }
    }
    
    // Step 3: Map support_tickets.practice_id to organization_id
    echo "\nStep 3: Mapping support_tickets.practice_id to organization_id...\n";
    
    $check_table = "SHOW TABLES LIKE 'support_tickets'";
    $result = $conn->query($check_table);
    
    if ($result && $result->num_rows > 0) {
        // Check if both columns exist
        $check_cols = "SHOW COLUMNS FROM support_tickets LIKE 'practice_id'";
        $col_result = $conn->query($check_cols);
        
        if ($col_result && $col_result->num_rows > 0) {
            // For now, set all support_tickets with practice_id to default organization
            // In the future, you can create organizations based on practice_id values
            $update_sql = "UPDATE support_tickets 
                          SET organization_id = ? 
                          WHERE organization_id IS NULL AND practice_id IS NOT NULL";
            $stmt = $conn->prepare($update_sql);
            $stmt->bind_param("i", $default_org_id);
            
            if ($stmt->execute()) {
                $affected = $conn->affected_rows;
                echo "  Updated support_tickets: $affected rows\n";
            } else {
                echo "  Error updating support_tickets: " . $stmt->error . "\n";
            }
            $stmt->close();
        }
    }
    
    // Step 4: Create default billing settings for the organization
    echo "\nStep 4: Creating default billing settings...\n";
    
    $check_billing = "SELECT id FROM billing_settings WHERE organization_id = ?";
    $stmt = $conn->prepare($check_billing);
    $stmt->bind_param("i", $default_org_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        $insert_billing = "INSERT INTO billing_settings (
            organization_id, invoice_prefix, payment_prefix, 
            next_invoice_number, next_payment_number, 
            tax_rate, payment_terms_days, currency, currency_symbol
        ) VALUES (?, 'INV', 'PAY', 1, 1, 0.00, 30, 'PKR', 'Rs.')";
        
        $stmt = $conn->prepare($insert_billing);
        $stmt->bind_param("i", $default_org_id);
        
        if ($stmt->execute()) {
            echo "  Created default billing settings\n";
        } else {
            echo "  Error creating billing settings: " . $stmt->error . "\n";
        }
    } else {
        echo "  Billing settings already exist\n";
    }
    $stmt->close();
    
    echo "\nMigration completed successfully!\n";
    echo "Default Organization ID: $default_org_id\n";
    echo "Organization Code: $default_org_code\n";
    echo "Organization Name: $default_org_name\n";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

