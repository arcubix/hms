<?php
/**
 * Run Billing Schema Migration - Version 2
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
    
    echo "Creating billing tables...\n\n";
    
    $sql_file = __DIR__ . '/../software_billing_schema.sql';
    $sql_content = file_get_contents($sql_file);
    
    if ($sql_content === false) {
        die("Error: Could not read software_billing_schema.sql\n");
    }
    
    // Use multi_query for better handling
    if ($conn->multi_query($sql_content)) {
        do {
            // Store first result set
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->next_result());
        
        echo "  ✓ Billing tables created successfully\n";
    } else {
        // If multi_query fails, try executing statement by statement
        echo "  Multi-query failed, trying statement by statement...\n";
        
        // Remove MySQL comments
        $sql_content = preg_replace('/--.*$/m', '', $sql_content);
        $sql_content = preg_replace('/\/\*.*?\*\//s', '', $sql_content);
        
        // Split by semicolon but preserve CREATE TABLE statements
        $statements = [];
        $current = '';
        $in_create = false;
        
        $lines = explode("\n", $sql_content);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            $current .= $line . "\n";
            
            if (preg_match('/CREATE TABLE/i', $line)) {
                $in_create = true;
            }
            
            if ($in_create && preg_match('/ENGINE=/i', $line)) {
                $statements[] = trim($current);
                $current = '';
                $in_create = false;
            } elseif (!$in_create && preg_match('/;$/', $line)) {
                $statements[] = trim($current);
                $current = '';
            }
        }
        
        if (!empty($current)) {
            $statements[] = trim($current);
        }
        
        $executed = 0;
        foreach ($statements as $statement) {
            if (empty($statement)) continue;
            
            if ($conn->query($statement)) {
                $executed++;
            } else {
                // Only show non-ignorable errors
                if (strpos($conn->error, 'already exists') === false && 
                    strpos($conn->error, 'Duplicate') === false &&
                    strpos($conn->error, 'Unknown table') === false) {
                    echo "  Error: " . $conn->error . "\n";
                    echo "  Statement preview: " . substr($statement, 0, 150) . "...\n\n";
                }
            }
        }
        
        echo "  ✓ Executed $executed statements\n";
    }
    
    // Verify tables were created
    $tables_to_check = ['organizations', 'subscription_plans', 'organization_subscriptions', 
                        'invoices', 'invoice_items', 'payments', 'billing_settings'];
    
    echo "\nVerifying tables...\n";
    foreach ($tables_to_check as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "  ✓ Table '$table' exists\n";
        } else {
            echo "  ✗ Table '$table' does NOT exist\n";
        }
    }
    
    $conn->close();
    echo "\nBilling schema migration completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

