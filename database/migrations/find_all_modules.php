<?php
/**
 * Find all module IDs referenced in code and compare with database
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
    echo "Finding All Modules Referenced in Code\n";
    echo "========================================\n\n";
    
    // Module IDs found in AdminDashboard.tsx case statements and navigation
    $modules_in_code = [
        // Core modules
        'dashboard' => ['label' => 'Dashboard', 'icon' => 'BarChart3', 'category' => 'Core', 'description' => 'Main dashboard overview'],
        'patients' => ['label' => 'Patients', 'icon' => 'Users', 'category' => 'Core', 'description' => 'Patient management'],
        'doctors' => ['label' => 'Doctors', 'icon' => 'Stethoscope', 'category' => 'Core', 'description' => 'Doctor management'],
        'users' => ['label' => 'User Management', 'icon' => 'UserCog', 'category' => 'Administration', 'description' => 'Manage system users, roles, and permissions'],
        'appointments' => ['label' => 'Appointments', 'icon' => 'Calendar', 'category' => 'Core', 'description' => 'Appointment scheduling'],
        'opd' => ['label' => 'OPD', 'icon' => 'Activity', 'category' => 'Clinical', 'description' => 'Outpatient department'],
        'ipd' => ['label' => 'IPD Management', 'icon' => 'Hospital', 'category' => 'Clinical', 'description' => 'Inpatient department management'],
        'beds' => ['label' => 'Bed Management', 'icon' => 'Bed', 'category' => 'Clinical', 'description' => 'Bed allocation and management'],
        'healthrecords' => ['label' => 'Health Records', 'icon' => 'FileText', 'category' => 'Clinical', 'description' => 'Patient health records'],
        'emergency' => ['label' => 'Emergency', 'icon' => 'Ambulance', 'category' => 'Clinical', 'description' => 'Emergency department'],
        'analytics' => ['label' => 'Analytics', 'icon' => 'TrendingUp', 'category' => 'Reports', 'description' => 'System analytics and reports'],
        'role-permissions' => ['label' => 'Role & Permissions', 'icon' => 'UserCheck', 'category' => 'Administration', 'description' => 'Manage roles and permissions'],
        'software-billing' => ['label' => 'Software Billing', 'icon' => 'DollarSign', 'category' => 'Financial', 'description' => 'Multi-tenant billing and invoicing'],
        'settings' => ['label' => 'Settings', 'icon' => 'Settings', 'category' => 'Administration', 'description' => 'System settings'],
        
        // Pharmacy group
        'pharmacy' => ['label' => 'Pharmacy', 'icon' => 'Pill', 'category' => 'Pharmacy', 'description' => 'Pharmacy management'],
        'pos' => ['label' => 'POS System', 'icon' => 'CreditCard', 'category' => 'Pharmacy', 'description' => 'Point of sale system'],
        'shifts' => ['label' => 'Shift Management', 'icon' => 'Clock', 'category' => 'Pharmacy', 'description' => 'Pharmacy shift management'],
        'prescriptions' => ['label' => 'Prescriptions', 'icon' => 'ShoppingCart', 'category' => 'Pharmacy', 'description' => 'Prescription management'],
        'inventory' => ['label' => 'Inventory', 'icon' => 'Package', 'category' => 'Pharmacy', 'description' => 'Inventory management'],
        'transactions' => ['label' => 'Transactions', 'icon' => 'Receipt', 'category' => 'Pharmacy', 'description' => 'Transaction history'],
        'orders' => ['label' => 'Orders', 'icon' => 'CheckCircle', 'category' => 'Pharmacy', 'description' => 'Purchase orders'],
        'pos-reports' => ['label' => 'POS Reports', 'icon' => 'BarChart3', 'category' => 'Pharmacy', 'description' => 'POS reports'],
        'pharmacy-settings' => ['label' => 'Pharmacy Settings', 'icon' => 'Settings', 'category' => 'Pharmacy', 'description' => 'Pharmacy configuration'],
        
        // Lab group
        'lab' => ['label' => 'Laboratory', 'icon' => 'FlaskConical', 'category' => 'Laboratory', 'description' => 'Laboratory management'],
        'laboratory' => ['label' => 'Laboratory', 'icon' => 'FlaskConical', 'category' => 'Laboratory', 'description' => 'Laboratory management'],
        'collection' => ['label' => 'Sample Collection', 'icon' => 'TestTube', 'category' => 'Laboratory', 'description' => 'Sample collection'],
        'processing' => ['label' => 'Test Processing', 'icon' => 'Microscope', 'category' => 'Laboratory', 'description' => 'Test processing'],
        'results' => ['label' => 'Results Upload', 'icon' => 'FileText', 'category' => 'Laboratory', 'description' => 'Upload test results'],
        'pending' => ['label' => 'Pending Tests', 'icon' => 'Clock', 'category' => 'Laboratory', 'description' => 'Pending lab tests'],
        'completed' => ['label' => 'Completed Tests', 'icon' => 'CheckCircle', 'category' => 'Laboratory', 'description' => 'Completed lab tests'],
        
        // Finance group
        'billing' => ['label' => 'Billing', 'icon' => 'DollarSign', 'category' => 'Financial', 'description' => 'Billing management'],
        'patient-billing' => ['label' => 'Patient Billing', 'icon' => 'Receipt', 'category' => 'Financial', 'description' => 'Patient billing'],
        'insurance' => ['label' => 'Insurance Claims', 'icon' => 'CreditCard', 'category' => 'Financial', 'description' => 'Insurance claims'],
        'revenue-analytics' => ['label' => 'Revenue Analytics', 'icon' => 'TrendingUp', 'category' => 'Financial', 'description' => 'Revenue analytics'],
        'outstanding' => ['label' => 'Outstanding Bills', 'icon' => 'AlertCircle', 'category' => 'Financial', 'description' => 'Outstanding bills'],
        
        // Radiology
        'radiology' => ['label' => 'Radiology', 'icon' => 'Scan', 'category' => 'Clinical', 'description' => 'Radiology management'],
        
        // Other
        'schedule' => ['label' => 'Schedule', 'icon' => 'Calendar', 'category' => 'Clinical', 'description' => 'Doctor schedule'],
        'telemedicine' => ['label' => 'Telemedicine', 'icon' => 'Video', 'category' => 'Clinical', 'description' => 'Telemedicine'],
        'records' => ['label' => 'Patient Records', 'icon' => 'FileText', 'category' => 'Clinical', 'description' => 'Patient records'],
        'ward' => ['label' => 'Ward Management', 'icon' => 'Building', 'category' => 'Clinical', 'description' => 'Ward management'],
        'monitoring' => ['label' => 'Patient Monitoring', 'icon' => 'Activity', 'category' => 'Clinical', 'description' => 'Patient monitoring'],
        'medication' => ['label' => 'Medication', 'icon' => 'Pill', 'category' => 'Clinical', 'description' => 'Medication management'],
        'nurse-schedule' => ['label' => 'Nurse Schedule', 'icon' => 'Clock', 'category' => 'Clinical', 'description' => 'Nurse shift schedule'],
        'alerts' => ['label' => 'Alerts', 'icon' => 'AlertCircle', 'category' => 'Clinical', 'description' => 'System alerts'],
        'profile' => ['label' => 'My Profile', 'icon' => 'User', 'category' => 'Personal', 'description' => 'User profile'],
        'reports' => ['label' => 'Reports', 'icon' => 'FileText', 'category' => 'Reports', 'description' => 'System reports'],
    ];
    
    // Get existing modules from database
    $existing_modules = [];
    $result = $conn->query("SELECT module_id, label FROM modules");
    while ($row = $result->fetch_assoc()) {
        $existing_modules[$row['module_id']] = $row['label'];
    }
    
    echo "Modules in Code: " . count($modules_in_code) . "\n";
    echo "Modules in Database: " . count($existing_modules) . "\n\n";
    
    // Find missing modules
    $missing_modules = [];
    foreach ($modules_in_code as $module_id => $module_data) {
        if (!isset($existing_modules[$module_id])) {
            $missing_modules[$module_id] = $module_data;
        }
    }
    
    echo "========================================\n";
    echo "Missing Modules (" . count($missing_modules) . "):\n";
    echo "========================================\n\n";
    
    foreach ($missing_modules as $module_id => $module_data) {
        echo "Module ID: $module_id\n";
        echo "  Label: {$module_data['label']}\n";
        echo "  Icon: {$module_data['icon']}\n";
        echo "  Category: {$module_data['category']}\n";
        echo "  Description: {$module_data['description']}\n\n";
    }
    
    // Also check for priority-modules module
    echo "========================================\n";
    echo "Checking Priority Modules Access:\n";
    echo "========================================\n";
    
    $priority_check = $conn->query("SELECT * FROM modules WHERE module_id = 'priority-modules'");
    if ($priority_check->num_rows > 0) {
        echo "✓ Priority Modules module exists\n";
    } else {
        echo "✗ Priority Modules module NOT found\n";
        echo "  (This is accessed via Settings menu, not as a standalone module)\n";
    }
    
    $conn->close();
    
    // Return missing modules for use in next script
    return $missing_modules;
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

