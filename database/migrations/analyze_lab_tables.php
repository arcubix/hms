<?php
/**
 * Analyze Laboratory Database Structure
 * Checks for existing lab-related tables and their structure
 * to avoid creating duplicate tables
 */

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'hms_db';

// Lab-related table names to check
$lab_tables_to_check = [
    'lab_tests',
    'lab_orders',
    'lab_order_tests',
    'lab_samples',
    'lab_results',
    'lab_result_values',
    'lab_reports',
    'lab_quality_control',
    'lab_instruments',
    'lab_billing',
    'prescription_lab_tests',
    'ipd_lab_orders',
    'ipd_radiology_orders'
];

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "========================================\n";
    echo "Laboratory Database Structure Analysis\n";
    echo "========================================\n\n";
    
    // Get all tables in database
    $all_tables_result = $conn->query("SHOW TABLES");
    $all_tables = [];
    while ($row = $all_tables_result->fetch_array()) {
        $all_tables[] = $row[0];
    }
    
    echo "Total tables in database: " . count($all_tables) . "\n\n";
    
    // Check lab-related tables
    echo "========================================\n";
    echo "Lab-Related Tables Analysis\n";
    echo "========================================\n\n";
    
    $existing_tables = [];
    $missing_tables = [];
    $table_details = [];
    
    foreach ($lab_tables_to_check as $table_name) {
        if (in_array($table_name, $all_tables)) {
            $existing_tables[] = $table_name;
            
            // Get table structure
            $structure_result = $conn->query("DESCRIBE `$table_name`");
            $columns = [];
            $primary_key = null;
            $foreign_keys = [];
            
            while ($col = $structure_result->fetch_assoc()) {
                $columns[] = $col;
                if ($col['Key'] === 'PRI') {
                    $primary_key = $col['Field'];
                }
            }
            
            // Get row count
            $count_result = $conn->query("SELECT COUNT(*) as cnt FROM `$table_name`");
            $row_count = $count_result->fetch_assoc()['cnt'];
            
            // Get foreign keys
            $fk_result = $conn->query("
                SELECT 
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = '$database'
                AND TABLE_NAME = '$table_name'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");
            
            while ($fk = $fk_result->fetch_assoc()) {
                $foreign_keys[] = [
                    'column' => $fk['COLUMN_NAME'],
                    'references_table' => $fk['REFERENCED_TABLE_NAME'],
                    'references_column' => $fk['REFERENCED_COLUMN_NAME']
                ];
            }
            
            $table_details[$table_name] = [
                'exists' => true,
                'columns' => $columns,
                'primary_key' => $primary_key,
                'foreign_keys' => $foreign_keys,
                'row_count' => $row_count
            ];
            
        } else {
            $missing_tables[] = $table_name;
            $table_details[$table_name] = [
                'exists' => false
            ];
        }
    }
    
    // Display existing tables
    echo "EXISTING TABLES (" . count($existing_tables) . "):\n";
    echo "----------------------------------------\n";
    foreach ($existing_tables as $table) {
        $details = $table_details[$table];
        echo "\n✓ $table\n";
        echo "  Rows: " . $details['row_count'] . "\n";
        echo "  Primary Key: " . ($details['primary_key'] ?: 'None') . "\n";
        echo "  Columns (" . count($details['columns']) . "):\n";
        
        // Show first 10 columns
        $cols_to_show = array_slice($details['columns'], 0, 10);
        foreach ($cols_to_show as $col) {
            $null = $col['Null'] === 'YES' ? 'NULL' : 'NOT NULL';
            $key = $col['Key'] ? " [{$col['Key']}]" : '';
            echo "    - {$col['Field']}: {$col['Type']} $null$key\n";
        }
        if (count($details['columns']) > 10) {
            echo "    ... and " . (count($details['columns']) - 10) . " more columns\n";
        }
        
        if (!empty($details['foreign_keys'])) {
            echo "  Foreign Keys:\n";
            foreach ($details['foreign_keys'] as $fk) {
                echo "    - {$fk['column']} → {$fk['references_table']}.{$fk['references_column']}\n";
            }
        }
    }
    
    // Display missing tables
    echo "\n\nMISSING TABLES (" . count($missing_tables) . "):\n";
    echo "----------------------------------------\n";
    foreach ($missing_tables as $table) {
        echo "✗ $table\n";
    }
    
    // Check for tables with similar names
    echo "\n\n========================================\n";
    echo "Similar Table Names Check\n";
    echo "========================================\n\n";
    
    $similar_patterns = ['lab', 'sample', 'result', 'test', 'order'];
    foreach ($similar_patterns as $pattern) {
        $similar = array_filter($all_tables, function($table) use ($pattern) {
            return stripos($table, $pattern) !== false;
        });
        
        if (!empty($similar)) {
            echo "Tables containing '$pattern':\n";
            foreach ($similar as $table) {
                if (!in_array($table, $lab_tables_to_check)) {
                    echo "  - $table (not in check list)\n";
                }
            }
            echo "\n";
        }
    }
    
    // Analyze lab_tests table structure
    if (in_array('lab_tests', $existing_tables)) {
        echo "\n========================================\n";
        echo "lab_tests Table Detailed Analysis\n";
        echo "========================================\n\n";
        
        $details = $table_details['lab_tests'];
        echo "Current columns:\n";
        foreach ($details['columns'] as $col) {
            $null = $col['Null'] === 'YES' ? 'NULL' : 'NOT NULL';
            $default = $col['Default'] !== null ? " DEFAULT '{$col['Default']}'" : '';
            $key = $col['Key'] ? " [{$col['Key']}]" : '';
            echo "  {$col['Field']}: {$col['Type']} $null$default$key\n";
        }
        
        // Check for missing fields that we need
        $required_fields = [
            'price' => 'DECIMAL(10,2)',
            'tat_hours' => 'INT(11)',
            'sample_type' => 'VARCHAR(100)',
            'sample_volume' => 'VARCHAR(50)',
            'container_type' => 'VARCHAR(100)',
            'methodology' => 'VARCHAR(255)',
            'critical_range_low' => 'DECIMAL(10,2)',
            'critical_range_high' => 'DECIMAL(10,2)',
            'organization_id' => 'INT(11)'
        ];
        
        $existing_fields = array_column($details['columns'], 'Field');
        $missing_fields = [];
        
        foreach ($required_fields as $field => $type) {
            if (!in_array($field, $existing_fields)) {
                $missing_fields[$field] = $type;
            }
        }
        
        if (!empty($missing_fields)) {
            echo "\nMissing fields that need to be added:\n";
            foreach ($missing_fields as $field => $type) {
                echo "  - $field ($type)\n";
            }
        } else {
            echo "\n✓ All required fields exist\n";
        }
    }
    
    // Check for duplicate functionality
    echo "\n\n========================================\n";
    echo "Duplicate Functionality Check\n";
    echo "========================================\n\n";
    
    // Check if ipd_lab_orders and lab_orders both exist or overlap
    if (in_array('ipd_lab_orders', $existing_tables) && in_array('lab_orders', $existing_tables)) {
        echo "⚠ WARNING: Both ipd_lab_orders and lab_orders exist\n";
        echo "  Consider consolidating into single lab_orders table\n";
    } elseif (in_array('ipd_lab_orders', $existing_tables)) {
        echo "ℹ ipd_lab_orders exists - may need to migrate to unified lab_orders\n";
        
        // Show structure of ipd_lab_orders
        $ipd_details = $table_details['ipd_lab_orders'];
        echo "  Columns in ipd_lab_orders:\n";
        foreach ($ipd_details['columns'] as $col) {
            echo "    - {$col['Field']}: {$col['Type']}\n";
        }
    }
    
    // Check prescription_lab_tests vs lab_order_tests
    if (in_array('prescription_lab_tests', $existing_tables) && in_array('lab_order_tests', $existing_tables)) {
        echo "\n⚠ WARNING: Both prescription_lab_tests and lab_order_tests exist\n";
        echo "  Consider consolidating into single lab_order_tests table\n";
    } elseif (in_array('prescription_lab_tests', $existing_tables)) {
        echo "\nℹ prescription_lab_tests exists - may need to migrate to unified lab_order_tests\n";
    }
    
    // Generate recommendations
    echo "\n\n========================================\n";
    echo "Recommendations\n";
    echo "========================================\n\n";
    
    $recommendations = [];
    
    if (in_array('ipd_lab_orders', $existing_tables) && !in_array('lab_orders', $existing_tables)) {
        $recommendations[] = "Create unified lab_orders table and migrate ipd_lab_orders data";
    }
    
    if (in_array('prescription_lab_tests', $existing_tables) && !in_array('lab_order_tests', $existing_tables)) {
        $recommendations[] = "Create unified lab_order_tests table and link prescription_lab_tests";
    }
    
    if (in_array('lab_tests', $existing_tables)) {
        $details = $table_details['lab_tests'];
        $existing_fields = array_column($details['columns'], 'Field');
        if (!in_array('price', $existing_fields)) {
            $recommendations[] = "Add pricing fields to lab_tests table";
        }
        if (!in_array('organization_id', $existing_fields)) {
            $recommendations[] = "Add organization_id to lab_tests table";
        }
    }
    
    if (empty($recommendations)) {
        echo "✓ No major issues found. Database structure looks good.\n";
    } else {
        foreach ($recommendations as $i => $rec) {
            echo ($i + 1) . ". $rec\n";
        }
    }
    
    // Generate summary report
    echo "\n\n========================================\n";
    echo "Summary Report\n";
    echo "========================================\n\n";
    
    echo "Existing Lab Tables: " . count($existing_tables) . "\n";
    echo "Missing Lab Tables: " . count($missing_tables) . "\n";
    echo "\nTables to Create:\n";
    foreach ($missing_tables as $table) {
        echo "  - $table\n";
    }
    
    echo "\nTables to Enhance:\n";
    if (in_array('lab_tests', $existing_tables)) {
        $details = $table_details['lab_tests'];
        $existing_fields = array_column($details['columns'], 'Field');
        $needs_enhancement = false;
        foreach (['price', 'tat_hours', 'organization_id'] as $field) {
            if (!in_array($field, $existing_fields)) {
                $needs_enhancement = true;
                break;
            }
        }
        if ($needs_enhancement) {
            echo "  - lab_tests (add pricing, TAT, organization_id)\n";
        }
    }
    
    // Save report to file
    $report_file = __DIR__ . '/lab_structure_analysis_report.txt';
    ob_start();
    echo "Laboratory Database Structure Analysis Report\n";
    echo "Generated: " . date('Y-m-d H:i:s') . "\n\n";
    echo "Existing Tables: " . implode(', ', $existing_tables) . "\n";
    echo "Missing Tables: " . implode(', ', $missing_tables) . "\n";
    ob_end_flush();
    
    $conn->close();
    
    echo "\n\nAnalysis complete!\n";
    echo "Report saved to: $report_file\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

