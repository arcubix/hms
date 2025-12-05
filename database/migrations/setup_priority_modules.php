<?php
/**
 * Priority Modules Database Setup Script
 * 
 * This script creates the modules and user_priority_modules tables
 * and populates them with default data.
 * 
 * Usage: 
 *   php database/migrations/setup_priority_modules.php
 * Or run from browser: 
 *   http://localhost/hms/database/migrations/setup_priority_modules.php
 */

// Get database config from CodeIgniter config
$config_path = __DIR__ . '/../../application/config/database.php';
if (file_exists($config_path)) {
    // Read config file and extract database settings without triggering CodeIgniter security
    $config_content = file_get_contents($config_path);
    
    // Extract database settings using regex
    preg_match("/'hostname'\s*=>\s*'([^']+)'/", $config_content, $hostname_match);
    preg_match("/'username'\s*=>\s*'([^']+)'/", $config_content, $username_match);
    preg_match("/'password'\s*=>\s*'([^']*)'/", $config_content, $password_match);
    preg_match("/'database'\s*=>\s*'([^']+)'/", $config_content, $database_match);
    
    $hostname = isset($hostname_match[1]) ? $hostname_match[1] : 'localhost';
    $username = isset($username_match[1]) ? $username_match[1] : 'root';
    $password = isset($password_match[1]) ? $password_match[1] : '';
    $database = isset($database_match[1]) ? $database_match[1] : 'hms';
} else {
    // Fallback: use environment variables or defaults
    $hostname = getenv('DB_HOST') ?: 'localhost';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASS') ?: '';
    $database = getenv('DB_NAME') ?: 'hms';
}

try {
    // Connect to database
    $conn = new mysqli($hostname, $username, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    echo "<pre>";
    echo "=== Priority Modules Database Setup ===\n\n";
    echo "Connected to database: $database\n\n";
    
    // Read and execute SQL files
    $sql_files = [
        __DIR__ . '/007_create_modules_table.sql',
        __DIR__ . '/008_create_user_priority_modules.sql',
        __DIR__ . '/009_migrate_default_priority_modules.sql'
    ];
    
    foreach ($sql_files as $sql_file) {
        if (!file_exists($sql_file)) {
            echo "Warning: File not found: $sql_file\n";
            continue;
        }
        
        echo "Executing: " . basename($sql_file) . "\n";
        echo str_repeat("-", 50) . "\n";
        
        $sql = file_get_contents($sql_file);
        
        // Remove comments and split by semicolon
        $sql = preg_replace('/--.*$/m', '', $sql); // Remove single-line comments
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Remove multi-line comments
        
        // Split by semicolon but keep CREATE TABLE statements together
        $statements = [];
        $current_statement = '';
        $in_create = false;
        
        $lines = explode("\n", $sql);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            $current_statement .= $line . "\n";
            
            if (preg_match('/CREATE TABLE/i', $line)) {
                $in_create = true;
            }
            
            if ($in_create && preg_match('/ENGINE=/i', $line)) {
                $in_create = false;
            }
            
            if (!$in_create && substr(rtrim($line), -1) === ';') {
                $statements[] = trim($current_statement);
                $current_statement = '';
            }
        }
        
        if (!empty(trim($current_statement))) {
            $statements[] = trim($current_statement);
        }
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (empty($statement)) continue;
            
            if ($conn->query($statement)) {
                // Success
            } else {
                // Check if error is acceptable (table already exists, duplicate key, etc.)
                $error = $conn->error;
                if (strpos($error, 'already exists') !== false || 
                    strpos($error, 'Duplicate key') !== false ||
                    strpos($error, 'Duplicate entry') !== false ||
                    strpos($error, 'already exist') !== false) {
                    // These are acceptable errors
                } else {
                    echo "Error: $error\n";
                    echo "Statement: " . substr($statement, 0, 200) . "...\n\n";
                }
            }
        }
        
        echo "Completed: " . basename($sql_file) . "\n\n";
    }
    
    // Verify tables were created
    echo "=== Verification ===\n\n";
    
    $tables = ['modules', 'user_priority_modules'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result && $result->num_rows > 0) {
            echo "✓ Table '$table' exists\n";
            
            // Count records
            $count_result = $conn->query("SELECT COUNT(*) as count FROM `$table`");
            if ($count_result) {
                $row = $count_result->fetch_assoc();
                echo "  Records: " . $row['count'] . "\n";
            }
        } else {
            echo "✗ Table '$table' NOT found\n";
        }
    }
    
    // Verify modules were inserted
    echo "\n=== Modules List ===\n";
    $modules_result = $conn->query("SELECT COUNT(*) as count FROM `modules`");
    if ($modules_result) {
        $row = $modules_result->fetch_assoc();
        echo "Total modules: " . $row['count'] . "\n\n";
        
        if ($row['count'] > 0) {
            $modules_list = $conn->query("SELECT `module_id`, `label`, `category`, `icon_name` FROM `modules` ORDER BY `display_order`");
            echo "Module Details:\n";
            while ($module = $modules_list->fetch_assoc()) {
                echo "  - {$module['module_id']}: {$module['label']} ({$module['category']}) [Icon: {$module['icon_name']}]\n";
            }
        }
    }
    
    // Verify user priority modules
    echo "\n=== User Priority Modules ===\n";
    $users_result = $conn->query("SELECT COUNT(DISTINCT `user_id`) as count FROM `user_priority_modules`");
    if ($users_result) {
        $row = $users_result->fetch_assoc();
        echo "Users with priority modules: " . $row['count'] . "\n";
        
        if ($row['count'] > 0) {
            $priority_result = $conn->query("
                SELECT u.`id`, u.`name`, COUNT(upm.`module_id`) as module_count
                FROM `users` u
                INNER JOIN `user_priority_modules` upm ON u.`id` = upm.`user_id`
                GROUP BY u.`id`, u.`name`
                LIMIT 5
            ");
            echo "\nSample users with priority modules:\n";
            while ($user = $priority_result->fetch_assoc()) {
                echo "  - {$user['name']} (ID: {$user['id']}): {$user['module_count']} modules\n";
            }
        }
    }
    
    $conn->close();
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "✓ Database setup completed successfully!\n";
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<pre>";
    echo "Error: " . $e->getMessage() . "\n";
    echo "</pre>";
    exit(1);
}
