<?php
/**
 * Create Laboratory Tables Only
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
    
    $sql_file = __DIR__ . '/create_laboratory_tables.sql';
    $sql = file_get_contents($sql_file);
    
    // Extract only CREATE TABLE statements
    preg_match_all('/CREATE TABLE IF NOT EXISTS[^;]+;/is', $sql, $matches);
    
    foreach ($matches[0] as $statement) {
        try {
            if ($conn->query($statement)) {
                if (preg_match('/CREATE TABLE.*?`(\w+)`/i', $statement, $m)) {
                    echo "✓ Created table: {$m[1]}\n";
                }
            }
        } catch (mysqli_sql_exception $e) {
            if (strpos($e->getMessage(), 'already exists') === false) {
                echo "✗ Error: " . $e->getMessage() . "\n";
            }
        }
    }
    
    $conn->close();
    echo "\nDone!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

