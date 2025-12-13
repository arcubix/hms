<?php
$conn = new mysqli('localhost', 'root', '', 'hms_db');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}

// Check if column exists
$result = $conn->query("SHOW COLUMNS FROM lab_tests LIKE 'price'");
if ($result->num_rows == 0) {
    $sql = "ALTER TABLE lab_tests ADD COLUMN price DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Test price'";
    if ($conn->query($sql)) {
        echo "✓ Price column added successfully\n";
    } else {
        echo "✗ Error adding price column: " . $conn->error . "\n";
    }
} else {
    echo "✓ Price column already exists\n";
}

// Add index if not exists
$result = $conn->query("SHOW INDEX FROM lab_tests WHERE Key_name = 'idx_price'");
if ($result->num_rows == 0) {
    $sql = "ALTER TABLE lab_tests ADD INDEX idx_price (price)";
    if ($conn->query($sql)) {
        echo "✓ Price index added successfully\n";
    }
}

$conn->close();

