<?php
/**
 * Add All Missing Modules to Database
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
    
    echo "========================================\n";
    echo "Adding All Missing Modules\n";
    echo "========================================\n\n";
    
    // Missing modules with their configurations
    $missing_modules = [
        ['module_id' => 'role-permissions', 'label' => 'Role & Permissions', 'icon' => 'UserCheck', 'category' => 'Administration', 'description' => 'Manage roles and permissions', 'color_from' => 'purple-500', 'color_to' => 'purple-600'],
        ['module_id' => 'pos', 'label' => 'POS System', 'icon' => 'CreditCard', 'category' => 'Pharmacy', 'description' => 'Point of sale system', 'color_from' => 'green-500', 'color_to' => 'green-600'],
        ['module_id' => 'shifts', 'label' => 'Shift Management', 'icon' => 'Clock', 'category' => 'Pharmacy', 'description' => 'Pharmacy shift management', 'color_from' => 'blue-500', 'color_to' => 'blue-600'],
        ['module_id' => 'prescriptions', 'label' => 'Prescriptions', 'icon' => 'ShoppingCart', 'category' => 'Pharmacy', 'description' => 'Prescription management', 'color_from' => 'teal-500', 'color_to' => 'teal-600'],
        ['module_id' => 'inventory', 'label' => 'Inventory', 'icon' => 'Package', 'category' => 'Pharmacy', 'description' => 'Inventory management', 'color_from' => 'orange-500', 'color_to' => 'orange-600'],
        ['module_id' => 'transactions', 'label' => 'Transactions', 'icon' => 'Receipt', 'category' => 'Pharmacy', 'description' => 'Transaction history', 'color_from' => 'indigo-500', 'color_to' => 'indigo-600'],
        ['module_id' => 'orders', 'label' => 'Orders', 'icon' => 'CheckCircle', 'category' => 'Pharmacy', 'description' => 'Purchase orders', 'color_from' => 'cyan-500', 'color_to' => 'cyan-600'],
        ['module_id' => 'pos-reports', 'label' => 'POS Reports', 'icon' => 'BarChart3', 'category' => 'Pharmacy', 'description' => 'POS reports', 'color_from' => 'pink-500', 'color_to' => 'pink-600'],
        ['module_id' => 'pharmacy-settings', 'label' => 'Pharmacy Settings', 'icon' => 'Settings', 'category' => 'Pharmacy', 'description' => 'Pharmacy configuration', 'color_from' => 'gray-500', 'color_to' => 'gray-600'],
        ['module_id' => 'lab', 'label' => 'Laboratory', 'icon' => 'FlaskConical', 'category' => 'Laboratory', 'description' => 'Laboratory management', 'color_from' => 'teal-500', 'color_to' => 'teal-600'],
        ['module_id' => 'collection', 'label' => 'Sample Collection', 'icon' => 'TestTube', 'category' => 'Laboratory', 'description' => 'Sample collection', 'color_from' => 'blue-500', 'color_to' => 'blue-600'],
        ['module_id' => 'processing', 'label' => 'Test Processing', 'icon' => 'Microscope', 'category' => 'Laboratory', 'description' => 'Test processing', 'color_from' => 'purple-500', 'color_to' => 'purple-600'],
        ['module_id' => 'results', 'label' => 'Results Upload', 'icon' => 'FileText', 'category' => 'Laboratory', 'description' => 'Upload test results', 'color_from' => 'green-500', 'color_to' => 'green-600'],
        ['module_id' => 'pending', 'label' => 'Pending Tests', 'icon' => 'Clock', 'category' => 'Laboratory', 'description' => 'Pending lab tests', 'color_from' => 'yellow-500', 'color_to' => 'yellow-600'],
        ['module_id' => 'completed', 'label' => 'Completed Tests', 'icon' => 'CheckCircle', 'category' => 'Laboratory', 'description' => 'Completed lab tests', 'color_from' => 'green-500', 'color_to' => 'green-600'],
        ['module_id' => 'patient-billing', 'label' => 'Patient Billing', 'icon' => 'Receipt', 'category' => 'Financial', 'description' => 'Patient billing', 'color_from' => 'green-500', 'color_to' => 'green-600'],
        ['module_id' => 'insurance', 'label' => 'Insurance Claims', 'icon' => 'CreditCard', 'category' => 'Financial', 'description' => 'Insurance claims', 'color_from' => 'blue-500', 'color_to' => 'blue-600'],
        ['module_id' => 'revenue-analytics', 'label' => 'Revenue Analytics', 'icon' => 'TrendingUp', 'category' => 'Financial', 'description' => 'Revenue analytics', 'color_from' => 'purple-500', 'color_to' => 'purple-600'],
        ['module_id' => 'outstanding', 'label' => 'Outstanding Bills', 'icon' => 'AlertCircle', 'category' => 'Financial', 'description' => 'Outstanding bills', 'color_from' => 'red-500', 'color_to' => 'red-600'],
        ['module_id' => 'schedule', 'label' => 'Schedule', 'icon' => 'Calendar', 'category' => 'Clinical', 'description' => 'Doctor schedule', 'color_from' => 'blue-500', 'color_to' => 'blue-600'],
        ['module_id' => 'telemedicine', 'label' => 'Telemedicine', 'icon' => 'Video', 'category' => 'Clinical', 'description' => 'Telemedicine', 'color_from' => 'purple-500', 'color_to' => 'purple-600'],
        ['module_id' => 'records', 'label' => 'Patient Records', 'icon' => 'FileText', 'category' => 'Clinical', 'description' => 'Patient records', 'color_from' => 'indigo-500', 'color_to' => 'indigo-600'],
        ['module_id' => 'ward', 'label' => 'Ward Management', 'icon' => 'Building', 'category' => 'Clinical', 'description' => 'Ward management', 'color_from' => 'teal-500', 'color_to' => 'teal-600'],
        ['module_id' => 'monitoring', 'label' => 'Patient Monitoring', 'icon' => 'Activity', 'category' => 'Clinical', 'description' => 'Patient monitoring', 'color_from' => 'red-500', 'color_to' => 'red-600'],
        ['module_id' => 'medication', 'label' => 'Medication', 'icon' => 'Pill', 'category' => 'Clinical', 'description' => 'Medication management', 'color_from' => 'green-500', 'color_to' => 'green-600'],
        ['module_id' => 'nurse-schedule', 'label' => 'Nurse Schedule', 'icon' => 'Clock', 'category' => 'Clinical', 'description' => 'Nurse shift schedule', 'color_from' => 'blue-500', 'color_to' => 'blue-600'],
        ['module_id' => 'alerts', 'label' => 'Alerts', 'icon' => 'AlertCircle', 'category' => 'Clinical', 'description' => 'System alerts', 'color_from' => 'red-500', 'color_to' => 'red-600'],
        ['module_id' => 'profile', 'label' => 'My Profile', 'icon' => 'User', 'category' => 'Personal', 'description' => 'User profile', 'color_from' => 'blue-500', 'color_to' => 'blue-600'],
        ['module_id' => 'priority-modules', 'label' => 'Priority Modules', 'icon' => 'ClipboardList', 'category' => 'Administration', 'description' => 'Manage priority modules', 'color_from' => 'purple-500', 'color_to' => 'purple-600'],
    ];
    
    // Get max display_order
    $max_order_result = $conn->query("SELECT MAX(display_order) as max_order FROM modules");
    $max_order = 0;
    if ($max_order_result && $row = $max_order_result->fetch_assoc()) {
        $max_order = $row['max_order'] ? $row['max_order'] : 0;
    }
    
    $added = 0;
    $skipped = 0;
    $errors = 0;
    
    foreach ($missing_modules as $index => $module) {
        // Check if module already exists
        $check = $conn->query("SELECT module_id FROM modules WHERE module_id = '{$module['module_id']}'");
        if ($check->num_rows > 0) {
            echo "  ⏭ Skipping {$module['module_id']} (already exists)\n";
            $skipped++;
            continue;
        }
        
        $display_order = $max_order + $index + 1;
        
        $sql = "INSERT INTO `modules` (
            `module_id`, 
            `label`, 
            `description`, 
            `category`, 
            `icon_name`, 
            `color_from`, 
            `color_to`, 
            `display_order`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssi", 
            $module['module_id'],
            $module['label'],
            $module['description'],
            $module['category'],
            $module['icon'],
            $module['color_from'],
            $module['color_to'],
            $display_order
        );
        
        if ($stmt->execute()) {
            echo "  ✓ Added {$module['module_id']} - {$module['label']}\n";
            $added++;
        } else {
            echo "  ✗ Error adding {$module['module_id']}: " . $stmt->error . "\n";
            $errors++;
        }
        
        $stmt->close();
    }
    
    echo "\n========================================\n";
    echo "Summary:\n";
    echo "  Added: $added modules\n";
    echo "  Skipped: $skipped modules\n";
    echo "  Errors: $errors modules\n";
    echo "========================================\n";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

