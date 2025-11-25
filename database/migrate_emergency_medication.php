<?php
/**
 * Migration script to create emergency_medication_administration table
 * Run this script from command line: php migrate_emergency_medication.php
 * 
 * IMPORTANT: Update the database credentials below before running
 */

// Database configuration - UPDATE THESE VALUES
$db_config = [
    'hostname' => 'localhost',
    'username' => 'root',
    'password' => '',
    'database' => 'hms_db'
];

// Create connection
$conn = new mysqli(
    $db_config['hostname'],
    $db_config['username'],
    $db_config['password'],
    $db_config['database']
);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}

echo "Connected to database: " . $db_config['database'] . "\n\n";

// Read SQL file
$sql_file = __DIR__ . '/create_emergency_medication_table.sql';
if (!file_exists($sql_file)) {
    die("SQL file not found: $sql_file\n");
}

$sql = file_get_contents($sql_file);

// Check if table exists
$check_table = "SHOW TABLES LIKE 'emergency_medication_administration'";
$result = $conn->query($check_table);

if ($result->num_rows > 0) {
    echo "Table 'emergency_medication_administration' already exists.\n";
    echo "Do you want to drop and recreate it? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $line = fgets($handle);
    if (trim($line) !== 'y') {
        echo "Migration cancelled.\n";
        $conn->close();
        exit(0);
    }
    echo "Dropping existing table...\n";
    $conn->query("DROP TABLE IF EXISTS `emergency_medication_administration`");
}

// Execute SQL
echo "Creating table 'emergency_medication_administration'...\n";

// Remove comments and split by semicolon
$sql_clean = preg_replace('/--.*$/m', '', $sql); // Remove single-line comments
$sql_clean = preg_replace('/\/\*.*?\*\//s', '', $sql_clean); // Remove multi-line comments
$statements = array_filter(array_map('trim', explode(';', $sql_clean)));

$success = false;
foreach ($statements as $statement) {
    $statement = trim($statement);
    if (!empty($statement)) {
        if ($conn->query($statement) === TRUE) {
            echo "✓ Executed successfully\n";
            $success = true;
        } else {
            echo "✗ Error: " . $conn->error . "\n";
            echo "  Error Code: " . $conn->errno . "\n";
            if (strlen($statement) < 200) {
                echo "  Statement: " . $statement . "\n";
            } else {
                echo "  Statement (first 200 chars): " . substr($statement, 0, 200) . "...\n";
            }
        }
    }
}

// Verify table creation
$verify = "SHOW TABLES LIKE 'emergency_medication_administration'";
$result = $conn->query($verify);

if ($result->num_rows > 0) {
    echo "\n✓ Table 'emergency_medication_administration' created successfully!\n\n";
    
    // Show table structure
    echo "Table structure:\n";
    $structure = $conn->query("DESCRIBE `emergency_medication_administration`");
    while ($row = $structure->fetch_assoc()) {
        echo "  - {$row['Field']} ({$row['Type']})\n";
    }
    
    // Check foreign keys
    echo "\nForeign keys:\n";
    $fks = $conn->query("
        SELECT 
            CONSTRAINT_NAME,
            TABLE_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '{$db_config['database']}'
        AND TABLE_NAME = 'emergency_medication_administration'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    if ($fks->num_rows > 0) {
        while ($fk = $fks->fetch_assoc()) {
            echo "  ✓ {$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
        }
    } else {
        echo "  ⚠ No foreign keys found (this may be normal if tables don't exist yet)\n";
    }
} else {
    echo "\n✗ Failed to create table!\n";
}

$conn->close();
echo "\nMigration completed.\n";

