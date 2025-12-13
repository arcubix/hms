<?php
/**
 * Laboratory Module Migration Script
 * Safely creates/enhances tables with proper error handling
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
    
    echo "========================================\n";
    echo "Laboratory Module Migration\n";
    echo "========================================\n\n";
    
    // Set to ignore errors for duplicate columns/indexes
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    
    // Read the SQL file
    $sql_file = __DIR__ . '/create_laboratory_tables.sql';
    $sql = file_get_contents($sql_file);
    
    // Split by semicolons but preserve CREATE TABLE statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );
    
    $success_count = 0;
    $error_count = 0;
    
    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;
        
        // Handle ALTER TABLE statements separately with error handling
        if (preg_match('/^ALTER TABLE/i', $statement)) {
            // Check if columns exist before adding
            if (preg_match('/ADD COLUMN\s+`(\w+)`/i', $statement, $matches)) {
                $column_name = $matches[1];
                $table_match = [];
                if (preg_match('/ALTER TABLE\s+`(\w+)`/i', $statement, $table_match)) {
                    $table_name = $table_match[1];
                    
                    // Check if column exists
                    $check_result = $conn->query("SHOW COLUMNS FROM `$table_name` LIKE '$column_name'");
                    if ($check_result->num_rows > 0) {
                        echo "⏭ Column `$column_name` already exists in `$table_name`, skipping...\n";
                        continue;
                    }
                }
            }
            
            // Check if index exists before adding
            if (preg_match('/ADD INDEX\s+`(\w+)`/i', $statement, $matches)) {
                $index_name = $matches[1];
                $table_match = [];
                if (preg_match('/ALTER TABLE\s+`(\w+)`/i', $statement, $table_match)) {
                    $table_name = $table_match[1];
                    
                    // Check if index exists
                    $check_result = $conn->query("SHOW INDEX FROM `$table_name` WHERE Key_name = '$index_name'");
                    if ($check_result->num_rows > 0) {
                        echo "⏭ Index `$index_name` already exists in `$table_name`, skipping...\n";
                        continue;
                    }
                }
            }
        }
        
        try {
            if ($conn->query($statement)) {
                $success_count++;
                if (preg_match('/CREATE TABLE/i', $statement)) {
                    $table_match = [];
                    if (preg_match('/CREATE TABLE.*?`(\w+)`/i', $statement, $table_match)) {
                        echo "✓ Created table: {$table_match[1]}\n";
                    }
                } elseif (preg_match('/ALTER TABLE/i', $statement)) {
                    $table_match = [];
                    if (preg_match('/ALTER TABLE\s+`(\w+)`/i', $statement, $table_match)) {
                        echo "✓ Enhanced table: {$table_match[1]}\n";
                    }
                }
            }
        } catch (mysqli_sql_exception $e) {
            // Ignore duplicate column/index errors
            if (strpos($e->getMessage(), 'Duplicate column') !== false || 
                strpos($e->getMessage(), 'Duplicate key name') !== false ||
                strpos($e->getMessage(), 'already exists') !== false) {
                echo "⏭ Skipped (already exists): " . substr($e->getMessage(), 0, 80) . "...\n";
            } else {
                $error_count++;
                echo "✗ Error: " . $e->getMessage() . "\n";
                echo "   Statement: " . substr($statement, 0, 100) . "...\n";
            }
        }
    }
    
    echo "\n========================================\n";
    echo "Migration Summary\n";
    echo "========================================\n";
    echo "Successful operations: $success_count\n";
    echo "Errors: $error_count\n";
    
    if ($error_count == 0) {
        echo "\n✓ Migration completed successfully!\n";
    } else {
        echo "\n⚠ Migration completed with some errors. Please review above.\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
    exit(1);
}

