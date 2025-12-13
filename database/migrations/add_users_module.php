<?php
/**
 * Add Users Module to modules table
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
    
    echo "Adding users module...\n";
    
    // Check if it already exists
    $check = $conn->query("SELECT * FROM modules WHERE module_id = 'users'");
    if ($check->num_rows > 0) {
        echo "  ⏭ Users module already exists\n";
        $row = $check->fetch_assoc();
        echo "    ID: {$row['id']}\n";
        echo "    Label: {$row['label']}\n";
        echo "    Display Order: {$row['display_order']}\n";
    } else {
        // Get max display_order
        $max_order_result = $conn->query("SELECT MAX(display_order) as max_order FROM modules");
        $max_order = 0;
        if ($max_order_result && $row = $max_order_result->fetch_assoc()) {
            $max_order = $row['max_order'] ? $row['max_order'] + 1 : 1;
        }
        
        $sql = "INSERT INTO `modules` (
            `module_id`, 
            `label`, 
            `description`, 
            `category`, 
            `icon_name`, 
            `color_from`, 
            `color_to`, 
            `display_order`
        ) VALUES (
            'users',
            'User Management',
            'Manage system users, roles, and permissions',
            'Administration',
            'UserCog',
            'blue-500',
            'blue-600',
            ?
        )";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $max_order);
        
        if ($stmt->execute()) {
            echo "  ✓ Users module added successfully\n";
            echo "    Display Order: $max_order\n";
        } else {
            echo "  ✗ Error: " . $stmt->error . "\n";
        }
        
        $stmt->close();
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

