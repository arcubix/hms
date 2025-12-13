<?php
/**
 * Add Software Billing Module
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
    
    echo "Adding software-billing module...\n";
    
    $sql = "INSERT INTO `modules` (`module_id`, `label`, `description`, `category`, `icon_name`, `color_from`, `color_to`, `display_order`) VALUES
('software-billing', 'Software Billing', 'Multi-tenant billing and invoicing system', 'Financial', 'DollarSign', 'emerald-500', 'emerald-600', 18)
ON DUPLICATE KEY UPDATE 
  `label` = VALUES(`label`), 
  `description` = VALUES(`description`),
  `category` = VALUES(`category`),
  `icon_name` = VALUES(`icon_name`),
  `color_from` = VALUES(`color_from`),
  `color_to` = VALUES(`color_to`),
  `display_order` = VALUES(`display_order`)";
    
    if ($conn->query($sql)) {
        echo "  ✓ Software-billing module added/updated\n";
    } else {
        echo "  Error: " . $conn->error . "\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

