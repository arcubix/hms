<?php
/**
 * Run Billing Schema Migration
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
    
    echo "Creating billing tables...\n";
    
    $sql_file = __DIR__ . '/../software_billing_schema.sql';
    $sql_content = file_get_contents($sql_file);
    
    if ($sql_content === false) {
        die("Error: Could not read software_billing_schema.sql\n");
    }
    
    // Remove comments and split by semicolon
    $statements = array_filter(
        array_map('trim', explode(';', $sql_content)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt) && !preg_match('/^\/\*/', $stmt);
        }
    );
    
    $executed = 0;
    $errors = 0;
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        // Skip comment blocks
        if (preg_match('/^--/', $statement) || preg_match('/^\/\*/', $statement)) {
            continue;
        }
        
        if ($conn->query($statement)) {
            $executed++;
        } else {
            // Ignore "already exists" errors
            if (strpos($conn->error, 'already exists') === false && 
                strpos($conn->error, 'Duplicate') === false) {
                echo "  Error: " . $conn->error . "\n";
                echo "  Statement: " . substr($statement, 0, 100) . "...\n";
                $errors++;
            }
        }
    }
    
    echo "  ✓ Executed $executed statements\n";
    if ($errors > 0) {
        echo "  ⚠ $errors errors (non-critical)\n";
    }
    
    $conn->close();
    echo "Billing schema migration completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

