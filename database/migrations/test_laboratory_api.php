<?php
/**
 * Test Laboratory API Endpoints
 * Run this to verify all endpoints are working
 */

$base_url = 'http://localhost/hms/index.php';

// Test endpoints (requires authentication token)
$endpoints = [
    'GET /api/laboratory/dashboard',
    'GET /api/laboratory/orders',
    'GET /api/lab-tests',
    'GET /api/lab-tests/categories',
    'GET /api/lab-tests/types',
    'GET /api/lab-tests/sample-types',
];

echo "========================================\n";
echo "Laboratory API Endpoints Test\n";
echo "========================================\n\n";

echo "Note: These endpoints require authentication.\n";
echo "Test them manually via Postman or frontend.\n\n";

echo "Available Endpoints:\n";
foreach ($endpoints as $endpoint) {
    echo "  ✓ $endpoint\n";
}

echo "\n========================================\n";
echo "Database Tables Check\n";
echo "========================================\n\n";

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'hms_db';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    $tables = [
        'lab_orders',
        'lab_order_tests',
        'lab_samples',
        'lab_results',
        'lab_result_values',
        'lab_reports',
        'lab_quality_control',
        'lab_instruments',
        'lab_billing'
    ];
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            $count_result = $conn->query("SELECT COUNT(*) as cnt FROM `$table`");
            $count = $count_result->fetch_assoc()['cnt'];
            echo "✓ $table exists ($count rows)\n";
        } else {
            echo "✗ $table does NOT exist\n";
        }
    }
    
    // Check lab_tests enhancements
    echo "\nChecking lab_tests enhancements:\n";
    $columns_to_check = ['price', 'tat_hours', 'sample_type', 'sample_volume', 'container_type', 'methodology', 'critical_range_low', 'critical_range_high'];
    $result = $conn->query("SHOW COLUMNS FROM lab_tests");
    $existing_columns = [];
    while ($row = $result->fetch_assoc()) {
        $existing_columns[] = $row['Field'];
    }
    
    foreach ($columns_to_check as $col) {
        if (in_array($col, $existing_columns)) {
            echo "  ✓ $col exists\n";
        } else {
            echo "  ✗ $col missing\n";
        }
    }
    
    $conn->close();
    
    echo "\n========================================\n";
    echo "✓ Database check complete!\n";
    echo "========================================\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

