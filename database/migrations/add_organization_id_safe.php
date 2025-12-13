<?php
/**
 * Safe Migration: Add organization_id to all tables
 * This script safely adds organization_id columns without foreign key errors
 */

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'hms_db';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    $conn->set_charset("utf8mb4");
    
    echo "Adding organization_id columns safely...\n\n";
    
    // List of tables to update
    $tables = [
        'users', 'patients', 'doctors', 'appointments', 'patient_medical_records',
        'ipd_wards', 'ipd_rooms', 'ipd_beds', 'ipd_admissions', 'ipd_billing',
        'ipd_vital_signs', 'ipd_treatment_orders', 'ipd_nursing_notes',
        'ipd_discharge_summaries', 'ipd_transfers', 'ipd_admission_requests',
        'ipd_rehabilitation_requests', 'floors', 'departments', 'rooms', 'receptions',
        'doctor_room_assignments', 'doctor_slot_rooms', 'tokens',
        'emergency_wards', 'emergency_ward_beds', 'emergency_patient_files',
        'emergency_vital_signs', 'emergency_intake_output', 'emergency_health_physical',
        'emergency_ambulance', 'emergency_transfers', 'emergency_blood_bank_requests',
        'emergency_duty_roster', 'medicines', 'medicine_stock', 'pharmacy_sales',
        'pharmacy_sale_items', 'sale_payments', 'suppliers', 'purchase_orders',
        'stock_movements', 'stock_adjustments', 'reorder_levels', 'barcodes', 'refunds',
        'lab_tests', 'radiology_tests', 'prescriptions', 'prescription_vitals',
        'prescription_radiology_tests', 'prescription_radiology_investigation',
        'insurance_organizations', 'insurance_pricing', 'referral_hospitals',
        'donation_donors', 'donation_payments', 'birth_certificates', 'death_certificates',
        'support_tickets', 'audit_logs', 'system_settings', 'pos_settings',
        'gst_rates', 'shifts', 'message_templates', 'message_platforms'
    ];
    
    // Optional tables
    $optional_tables = ['ipd_infections', 'ipd_ot_schedules'];
    
    $all_tables = array_merge($tables, $optional_tables);
    $updated = 0;
    $skipped = 0;
    $errors = 0;
    
    foreach ($all_tables as $table) {
        // Check if table exists
        $check = $conn->query("SHOW TABLES LIKE '$table'");
        if ($check->num_rows == 0) {
            echo "  ⏭ Skipping $table (table does not exist)\n";
            $skipped++;
            continue;
        }
        
        // Check if column already exists
        $check_col = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'organization_id'");
        if ($check_col->num_rows > 0) {
            echo "  ✓ $table already has organization_id\n";
            $skipped++;
            continue;
        }
        
        // Add column
        $sql = "ALTER TABLE `$table` ADD COLUMN `organization_id` INT(11) DEFAULT NULL COMMENT 'Foreign key to organizations.id' AFTER `id`";
        if ($conn->query($sql)) {
            echo "  ✓ Added organization_id to $table\n";
            $updated++;
            
            // Add index
            $conn->query("CREATE INDEX idx_organization_id ON `$table`(`organization_id`)");
            
            // Add foreign key only if organizations table exists
            $check_org = $conn->query("SHOW TABLES LIKE 'organizations'");
            if ($check_org->num_rows > 0) {
                // Check if foreign key already exists
                $fk_check = $conn->query("
                    SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = '$database'
                    AND TABLE_NAME = '$table'
                    AND COLUMN_NAME = 'organization_id'
                    AND REFERENCED_TABLE_NAME = 'organizations'
                ");
                $fk_exists = $fk_check->fetch_assoc()['cnt'] > 0;
                
                if (!$fk_exists) {
                    $fk_sql = "ALTER TABLE `$table` ADD FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT";
                    if ($conn->query($fk_sql)) {
                        echo "    ✓ Added foreign key constraint\n";
                    } else {
                        echo "    ⚠ Could not add foreign key: " . $conn->error . "\n";
                    }
                }
            }
        } else {
            echo "  ✗ Error adding to $table: " . $conn->error . "\n";
            $errors++;
        }
    }
    
    echo "\n========================================\n";
    echo "Summary:\n";
    echo "  Updated: $updated tables\n";
    echo "  Skipped: $skipped tables\n";
    echo "  Errors: $errors tables\n";
    echo "========================================\n";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

