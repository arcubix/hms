<?php
/**
 * Verify All Billing & Organization Migrations
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
    echo "Verifying Billing & Organization Migrations\n";
    echo "========================================\n\n";
    
    // Check billing tables
    echo "1. Checking Billing Tables:\n";
    $billing_tables = [
        'organizations',
        'subscription_plans',
        'organization_subscriptions',
        'invoices',
        'invoice_items',
        'payments',
        'billing_settings'
    ];
    
    $all_tables_exist = true;
    foreach ($billing_tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            // Count rows
            $count_result = $conn->query("SELECT COUNT(*) as cnt FROM `$table`");
            $count = $count_result->fetch_assoc()['cnt'];
            echo "  ✓ $table exists ($count rows)\n";
        } else {
            echo "  ✗ $table does NOT exist\n";
            $all_tables_exist = false;
        }
    }
    
    // Check default organization
    echo "\n2. Checking Default Organization:\n";
    $org_result = $conn->query("SELECT id, organization_code, name, subscription_status FROM organizations WHERE organization_code = 'ORG001'");
    if ($org_result->num_rows > 0) {
        $org = $org_result->fetch_assoc();
        echo "  ✓ Default organization found:\n";
        echo "    ID: {$org['id']}\n";
        echo "    Code: {$org['organization_code']}\n";
        echo "    Name: {$org['name']}\n";
        echo "    Status: {$org['subscription_status']}\n";
    } else {
        echo "  ✗ Default organization not found\n";
    }
    
    // Check organization_id columns
    echo "\n3. Checking organization_id Columns:\n";
    $tables_to_check = [
        'users', 'patients', 'doctors', 'appointments', 'ipd_admissions',
        'medicines', 'lab_tests', 'radiology_tests', 'support_tickets'
    ];
    
    $all_columns_exist = true;
    foreach ($tables_to_check as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            $col_result = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'organization_id'");
            if ($col_result->num_rows > 0) {
                // Check for NULL values
                $null_result = $conn->query("SELECT COUNT(*) as cnt FROM `$table` WHERE organization_id IS NULL");
                $null_count = $null_result->fetch_assoc()['cnt'];
                if ($null_count > 0) {
                    echo "  ⚠ $table has organization_id column ($null_count NULL values)\n";
                } else {
                    echo "  ✓ $table has organization_id column (all rows assigned)\n";
                }
            } else {
                echo "  ✗ $table missing organization_id column\n";
                $all_columns_exist = false;
            }
        } else {
            echo "  ⏭ $table does not exist (skipping)\n";
        }
    }
    
    // Check billing settings
    echo "\n4. Checking Billing Settings:\n";
    $billing_result = $conn->query("SELECT * FROM billing_settings LIMIT 1");
    if ($billing_result->num_rows > 0) {
        $settings = $billing_result->fetch_assoc();
        echo "  ✓ Billing settings exist:\n";
        echo "    Invoice Prefix: {$settings['invoice_prefix']}\n";
        echo "    Payment Prefix: {$settings['payment_prefix']}\n";
        echo "    Next Invoice #: {$settings['next_invoice_number']}\n";
        echo "    Currency: {$settings['currency']} ({$settings['currency_symbol']})\n";
    } else {
        echo "  ✗ No billing settings found\n";
    }
    
    // Check software-billing module
    echo "\n5. Checking Software-Billing Module:\n";
    $module_result = $conn->query("SELECT * FROM modules WHERE module_id = 'software-billing'");
    if ($module_result->num_rows > 0) {
        $module = $module_result->fetch_assoc();
        echo "  ✓ Software-billing module exists:\n";
        echo "    Label: {$module['label']}\n";
        echo "    Category: {$module['category']}\n";
    } else {
        echo "  ✗ Software-billing module not found\n";
    }
    
    // Summary
    echo "\n========================================\n";
    echo "Verification Summary:\n";
    echo "========================================\n";
    
    if ($all_tables_exist && $all_columns_exist) {
        echo "✓ All migrations completed successfully!\n";
        echo "\nNext Steps:\n";
        echo "1. Update user accounts to assign organization_id\n";
        echo "2. Create subscription plans\n";
        echo "3. Assign organizations to subscription plans\n";
        echo "4. Test the billing system\n";
    } else {
        echo "⚠ Some migrations may be incomplete. Please review the errors above.\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

