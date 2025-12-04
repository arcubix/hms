<?php
/**
 * Run IPD Duty Roster Migration
 * 
 * This script creates the ipd_duty_roster table.
 * Run this once by accessing: http://localhost/hms/run_ipd_duty_roster_migration.php
 * Then delete this file for security.
 */

// Database configuration
$host = 'localhost';
$dbname = 'hms_db';
$username = 'root';
$password = ''; // Change if you have a password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read SQL file
    $sql = file_get_contents(__DIR__ . '/database/ipd_duty_roster_schema.sql');
    
    // Execute SQL
    $pdo->exec($sql);
    
    echo "✅ Migration successful! The 'ipd_duty_roster' table has been created.<br>";
    echo "⚠️ Please delete this file (run_ipd_duty_roster_migration.php) for security.<br>";
    
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'already exists') !== false) {
        echo "ℹ️ Table 'ipd_duty_roster' already exists. No action needed.<br>";
    } else {
        echo "❌ Error: " . $e->getMessage() . "<br>";
    }
}
?>

