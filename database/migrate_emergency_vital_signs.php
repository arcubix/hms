<?php
/**
 * Emergency Vital Signs Table Migration Script
 * Run this file to create the emergency_vital_signs table
 * 
 * Usage:
 * 1. Via browser: http://localhost/hms/database/migrate_emergency_vital_signs.php
 * 2. Via CLI: php migrate_emergency_vital_signs.php
 */

// Database configuration - reads from CodeIgniter config
$config_file = __DIR__ . '/../application/config/database.php';
if (file_exists($config_file)) {
    // Read CodeIgniter database config
    $db = array(); // Initialize to avoid undefined variable
    include($config_file);
    if (isset($db['default'])) {
        $db_config = $db['default'];
        $db_host = $db_config['hostname'];
        $db_user = $db_config['username'];
        $db_pass = $db_config['password'];
        $db_name = $db_config['database'];
    } else {
        // Fallback configuration
        $db_host = 'localhost';
        $db_user = 'root';
        $db_pass = '';
        $db_name = 'hms_db';
    }
} else {
    // Fallback configuration
    $db_host = 'localhost';
    $db_user = 'root';
    $db_pass = '';
    $db_name = 'hms_db';
}

// Connect to database
try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "<h2>Emergency Vital Signs Table Migration</h2>";
    echo "<pre>";
    
    // Check if table already exists
    $check_table = $conn->query("SHOW TABLES LIKE 'emergency_vital_signs'");
    if ($check_table->num_rows > 0) {
        echo "✓ Table 'emergency_vital_signs' already exists.\n";
        echo "\nChecking table structure...\n";
        
        // Check table structure
        $result = $conn->query("DESCRIBE emergency_vital_signs");
        $columns = [];
        while ($row = $result->fetch_assoc()) {
            $columns[] = $row['Field'];
        }
        
        $required_columns = ['id', 'emergency_visit_id', 'recorded_at', 'recorded_by', 'bp', 'pulse', 'temp', 'spo2', 'resp', 'pain_score', 'consciousness_level', 'notes', 'created_at'];
        $missing_columns = array_diff($required_columns, $columns);
        
        if (empty($missing_columns)) {
            echo "✓ All required columns exist.\n";
        } else {
            echo "⚠ Missing columns: " . implode(', ', $missing_columns) . "\n";
            echo "Please check the table structure.\n";
        }
        
        // Check if updated_at exists, add if missing
        if (!in_array('updated_at', $columns)) {
            echo "\nAdding 'updated_at' column...\n";
            $alter_sql = "ALTER TABLE `emergency_vital_signs` 
                         ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
                         AFTER `created_at`";
            if ($conn->query($alter_sql)) {
                echo "✓ Added 'updated_at' column.\n";
            } else {
                echo "✗ Error adding 'updated_at' column: " . $conn->error . "\n";
            }
        } else {
            echo "✓ 'updated_at' column exists.\n";
        }
        
    } else {
        echo "Table 'emergency_vital_signs' does not exist. Creating...\n\n";
        
        // Create the table
        $create_table_sql = "
        CREATE TABLE IF NOT EXISTS `emergency_vital_signs` (
          `id` INT(11) NOT NULL AUTO_INCREMENT,
          `emergency_visit_id` INT(11) NOT NULL,
          `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `recorded_by` INT(11) DEFAULT NULL COMMENT 'User ID who recorded (nurse/doctor)',
          `bp` VARCHAR(20) DEFAULT NULL COMMENT 'Blood Pressure (e.g., 120/80)',
          `pulse` INT(3) DEFAULT NULL COMMENT 'Pulse rate (bpm)',
          `temp` DECIMAL(4,1) DEFAULT NULL COMMENT 'Temperature (°F)',
          `spo2` INT(3) DEFAULT NULL COMMENT 'SpO2 (%)',
          `resp` INT(3) DEFAULT NULL COMMENT 'Respiratory Rate',
          `pain_score` INT(2) DEFAULT NULL COMMENT 'Pain score 0-10',
          `consciousness_level` ENUM('Alert', 'Drowsy', 'Confused', 'Unconscious') DEFAULT NULL,
          `notes` TEXT DEFAULT NULL,
          `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          INDEX `idx_emergency_visit_id` (`emergency_visit_id`),
          INDEX `idx_recorded_at` (`recorded_at`),
          INDEX `idx_recorded_by` (`recorded_by`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // Check if emergency_visits table exists before adding foreign key
        $check_visits = $conn->query("SHOW TABLES LIKE 'emergency_visits'");
        $check_users = $conn->query("SHOW TABLES LIKE 'users'");
        
        if ($check_visits->num_rows > 0 && $check_users->num_rows > 0) {
            // Add foreign keys
            $create_table_sql = str_replace(
                "INDEX `idx_recorded_by` (`recorded_by`)",
                "INDEX `idx_recorded_by` (`recorded_by`),
          FOREIGN KEY (`emergency_visit_id`) REFERENCES `emergency_visits`(`id`) ON DELETE CASCADE,
          FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL",
                $create_table_sql
            );
        } else {
            echo "⚠ Warning: 'emergency_visits' or 'users' table not found. Creating table without foreign keys.\n";
        }
        
        if ($conn->query($create_table_sql)) {
            echo "✓ Table 'emergency_vital_signs' created successfully!\n";
        } else {
            echo "✗ Error creating table: " . $conn->error . "\n";
            exit(1);
        }
    }
    
    // Verify the table structure
    echo "\n=== Table Structure ===\n";
    $result = $conn->query("DESCRIBE emergency_vital_signs");
    echo sprintf("%-25s %-15s %-5s %-5s %-10s %-10s\n", "Field", "Type", "Null", "Key", "Default", "Extra");
    echo str_repeat("-", 80) . "\n";
    while ($row = $result->fetch_assoc()) {
        echo sprintf("%-25s %-15s %-5s %-5s %-10s %-10s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key'], 
            $row['Default'] ?? 'NULL',
            $row['Extra']
        );
    }
    
    // Check foreign keys
    echo "\n=== Foreign Keys ===\n";
    $fk_result = $conn->query("
        SELECT 
            CONSTRAINT_NAME,
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '$db_name'
        AND TABLE_NAME = 'emergency_vital_signs'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    if ($fk_result->num_rows > 0) {
        while ($row = $fk_result->fetch_assoc()) {
            echo "✓ {$row['COLUMN_NAME']} -> {$row['REFERENCED_TABLE_NAME']}.{$row['REFERENCED_COLUMN_NAME']}\n";
        }
    } else {
        echo "⚠ No foreign keys found (this is okay if referenced tables don't exist yet)\n";
    }
    
    // Test insert (optional - can be commented out)
    echo "\n=== Testing Insert ===\n";
    $test_visit_check = $conn->query("SELECT id FROM emergency_visits LIMIT 1");
    if ($test_visit_check->num_rows > 0) {
        $test_visit = $test_visit_check->fetch_assoc();
        $test_visit_id = $test_visit['id'];
        
        // Check if a test record already exists
        $test_check = $conn->query("SELECT id FROM emergency_vital_signs WHERE emergency_visit_id = $test_visit_id LIMIT 1");
        if ($test_check->num_rows == 0) {
            $test_sql = "INSERT INTO emergency_vital_signs (emergency_visit_id, bp, pulse, temp, spo2, resp, notes) 
                        VALUES ($test_visit_id, '120/80', 72, 98.6, 98, 16, 'Test record - can be deleted')";
            if ($conn->query($test_sql)) {
                echo "✓ Test insert successful! (ID: " . $conn->insert_id . ")\n";
                echo "  You can delete this test record if needed.\n";
            } else {
                echo "✗ Test insert failed: " . $conn->error . "\n";
                echo "  This might indicate a foreign key constraint issue.\n";
            }
        } else {
            echo "⚠ Test record already exists, skipping test insert.\n";
        }
    } else {
        echo "⚠ No emergency visits found. Cannot test insert.\n";
    }
    
    echo "\n=== Migration Complete ===\n";
    echo "✓ The emergency_vital_signs table is ready to use!\n";
    
    echo "</pre>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "<pre>";
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "</pre>";
}

