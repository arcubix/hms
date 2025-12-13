<?php
/**
 * Verify Users Module
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
    
    echo "Verifying Users Module...\n\n";
    
    $result = $conn->query("SELECT * FROM modules WHERE module_id = 'users'");
    
    if ($result->num_rows > 0) {
        $module = $result->fetch_assoc();
        echo "✓ Users module found:\n";
        echo "  Module ID: {$module['module_id']}\n";
        echo "  Label: {$module['label']}\n";
        echo "  Description: {$module['description']}\n";
        echo "  Category: {$module['category']}\n";
        echo "  Icon: {$module['icon_name']}\n";
        echo "  Colors: {$module['color_from']} -> {$module['color_to']}\n";
        echo "  Display Order: {$module['display_order']}\n";
        echo "\n✓ Module is properly configured!\n";
    } else {
        echo "✗ Users module NOT found in database\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

