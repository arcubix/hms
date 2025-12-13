<?php
/**
 * Verify All Modules
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
    echo "Module Summary\n";
    echo "========================================\n\n";
    
    $result = $conn->query("SELECT COUNT(*) as cnt FROM modules");
    $row = $result->fetch_assoc();
    echo "Total modules in database: {$row['cnt']}\n\n";
    
    $result = $conn->query("SELECT module_id, label, category FROM modules ORDER BY category, display_order");
    
    $categories = [];
    while ($module = $result->fetch_assoc()) {
        $cat = $module['category'];
        if (!isset($categories[$cat])) {
            $categories[$cat] = [];
        }
        $categories[$cat][] = $module;
    }
    
    foreach ($categories as $category => $modules) {
        echo "$category (" . count($modules) . "):\n";
        foreach ($modules as $module) {
            echo "  - {$module['module_id']}: {$module['label']}\n";
        }
        echo "\n";
    }
    
    // Check for priority-modules
    $check = $conn->query("SELECT * FROM modules WHERE module_id = 'priority-modules'");
    if ($check->num_rows > 0) {
        echo "✓ Priority Modules module is available\n";
    } else {
        echo "✗ Priority Modules module NOT found\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

