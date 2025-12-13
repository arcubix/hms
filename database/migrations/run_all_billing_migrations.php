<?php
/**
 * Run All Billing & Organization ID Migrations
 * 
 * This script runs all migrations for the billing system and organization_id columns
 * Run: php database/migrations/run_all_billing_migrations.php
 */

// Database connection
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'hms_db';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "========================================\n";
    echo "Running Billing & Organization Migrations\n";
    echo "========================================\n\n";
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Step 1: Create billing tables
    echo "Step 1: Creating billing tables...\n";
    $billing_schema = file_get_contents(__DIR__ . '/../software_billing_schema.sql');
    if ($billing_schema === false) {
        die("Error: Could not read software_billing_schema.sql\n");
    }
    
    // Execute SQL statements one by one
    $statements = explode(';', $billing_schema);
    $executed = 0;
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            if ($conn->multi_query($statement . ';')) {
                do {
                    if ($result = $conn->store_result()) {
                        $result->free();
                    }
                } while ($conn->next_result());
                $executed++;
            } else {
                // Ignore errors for existing tables/constraints
                if (strpos($conn->error, 'already exists') === false && 
                    strpos($conn->error, 'Duplicate key') === false) {
                    echo "  Warning: " . $conn->error . "\n";
                }
            }
        }
    }
    echo "  ✓ Billing tables created/updated\n\n";
    
    // Step 2: Add organization_id to all tables
    echo "Step 2: Adding organization_id to all tables...\n";
    $org_id_migration = file_get_contents(__DIR__ . '/add_organization_id_to_all_tables.sql');
    if ($org_id_migration === false) {
        die("Error: Could not read add_organization_id_to_all_tables.sql\n");
    }
    
    // Split and execute ALTER TABLE statements
    $alter_statements = preg_split('/ALTER TABLE/i', $org_id_migration);
    $tables_updated = 0;
    foreach ($alter_statements as $index => $statement) {
        if ($index === 0) continue; // Skip first empty part
        
        $statement = 'ALTER TABLE' . $statement;
        $statement = trim($statement);
        
        // Remove trailing semicolon if present and split by semicolon
        $statement = rtrim($statement, ';');
        
        if (!empty($statement)) {
            // Execute the ALTER TABLE statement
            if ($conn->query($statement)) {
                $tables_updated++;
            } else {
                // Ignore errors for columns that already exist
                if (strpos($conn->error, 'Duplicate column') === false && 
                    strpos($conn->error, 'already exists') === false) {
                    echo "  Warning for statement: " . substr($statement, 0, 100) . "...\n";
                    echo "    Error: " . $conn->error . "\n";
                }
            }
        }
    }
    echo "  ✓ Updated $tables_updated tables with organization_id\n\n";
    
    // Step 3: Migrate existing data to default organization
    echo "Step 3: Migrating existing data to default organization...\n";
    require_once(__DIR__ . '/migrate_existing_data_to_organization.php');
    echo "  ✓ Data migration completed\n\n";
    
    // Step 4: Add software-billing module
    echo "Step 4: Adding software-billing module...\n";
    $module_sql = file_get_contents(__DIR__ . '/add_software_billing_module.sql');
    if ($module_sql !== false) {
        if ($conn->multi_query($module_sql)) {
            do {
                if ($result = $conn->store_result()) {
                    $result->free();
                }
            } while ($conn->next_result());
        }
        echo "  ✓ Software-billing module added\n\n";
    }
    
    echo "========================================\n";
    echo "All migrations completed successfully!\n";
    echo "========================================\n";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

