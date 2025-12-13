<?php
/**
 * Script to remove landline number rows from Excel file
 * Keeps only mobile number rows
 * 
 * Usage: php process_excel_remove_landlines.php
 */

// Increase memory limit
ini_set('memory_limit', '2048M');
ini_set('max_execution_time', '600');

require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Configuration
$inputFile = __DIR__ . '/ikram work report.xlsx';
$outputFile = __DIR__ . '/ikram work report_cleaned.xlsx';

// Function to check if a phone number is a mobile number
function isMobileNumber($phone) {
    if (empty($phone)) {
        return false;
    }
    
    // Convert to string
    $phoneStr = (string)$phone;
    
    // Check for +92 3xxxx format (mobile numbers)
    // Pattern: +92 followed by space and then 3 followed by digits
    if (preg_match('/\+92\s*3[0-9]/', $phoneStr)) {
        return true;
    }
    
    // Check for (92) 3xxxx or 92 3xxxx format
    if (preg_match('/\(?92\)?\s*3[0-9]/', $phoneStr)) {
        return true;
    }
    
    // Remove all non-digit characters for further checking
    $phone = preg_replace('/[^0-9]/', '', $phoneStr);
    
    // If empty after cleaning, it's not a valid phone number
    if (empty($phone)) {
        return false;
    }
    
    // Check for 92 followed by 3 (country code + mobile indicator)
    // Mobile: 923xxxxxxxxx (12 digits starting with 923)
    if (preg_match('/^923[0-9]{9}$/', $phone)) {
        return true;
    }
    
    // Check for 11-digit numbers starting with 03 (mobile with leading zero)
    if (preg_match('/^03[0-9]{9}$/', $phone)) {
        return true;
    }
    
    // Check for 10-digit numbers starting with 3 (mobile without country code)
    if (preg_match('/^3[0-9]{9}$/', $phone)) {
        return true;
    }
    
    // If it's 12 digits starting with 92, check if third digit is 3 (mobile)
    if (strlen($phone) == 12 && substr($phone, 0, 2) == '92' && substr($phone, 2, 1) == '3') {
        return true;
    }
    
    // If it's 11 digits starting with 0, check if second digit is 3 (mobile)
    if (strlen($phone) == 11 && substr($phone, 0, 1) == '0' && substr($phone, 1, 1) == '3') {
        return true;
    }
    
    return false;
}

// Function to check if a phone number is a landline
function isLandlineNumber($phone) {
    if (empty($phone)) {
        return false;
    }
    
    // Convert to string
    $phoneStr = (string)$phone;
    
    // First check if it's a mobile number - if so, it's not a landline
    if (isMobileNumber($phoneStr)) {
        return false;
    }
    
    // Check for area codes in parentheses: (021), (042), (051), etc.
    // Pattern: (021) 111 786 786 or (042) 35761770-3
    $landlineAreaCodesInParens = ['021', '042', '051', '061', '071', '081', '091', '041', '0213', '0214', '0215'];
    foreach ($landlineAreaCodesInParens as $code) {
        // Check for (021) or (042) etc. at the start
        if (preg_match('/^\s*\(?' . $code . '\)?\s*[0-9]/', $phoneStr)) {
            return true;
        }
        // Check for (021) or (042) etc. anywhere in the string
        if (preg_match('/\(?' . $code . '\)?\s*[0-9]/', $phoneStr)) {
            return true;
        }
    }
    
    // Check for area codes without parentheses: 021-, 042-, 051-, etc.
    foreach ($landlineAreaCodesInParens as $code) {
        if (preg_match('/^\s*' . $code . '[\s\-]/', $phoneStr)) {
            return true;
        }
    }
    
    // Check for +92 followed by area codes (NOT starting with 3)
    // Landline patterns: +92 21xxxx, +92 42xxxx, +92 51xxxx, etc.
    // Pattern: +92 followed by space and then area codes like 21, 42, 51, etc. (NOT 3)
    if (preg_match('/\+92\s*[0-9]{1,3}/', $phoneStr)) {
        // Extract the part after +92
        if (preg_match('/\+92\s*([0-9]+)/', $phoneStr, $matches)) {
            $afterCountryCode = $matches[1];
            // If it starts with 3, it's mobile, not landline
            if (substr($afterCountryCode, 0, 1) == '3') {
                return false;
            }
            // Common landline area codes: 21, 42, 51, 61, 71, 81, 91, 41, 213, etc.
            $landlineAreaCodes = ['21', '42', '51', '61', '71', '81', '91', '41', '213', '214', '215'];
            foreach ($landlineAreaCodes as $code) {
                if (strpos($afterCountryCode, $code) === 0) {
                    return true;
                }
            }
        }
    }
    
    // Check for (92) or 92 followed by area codes
    if (preg_match('/\(?92\)?\s*[0-9]{1,3}/', $phoneStr)) {
        if (preg_match('/\(?92\)?\s*([0-9]+)/', $phoneStr, $matches)) {
            $afterCountryCode = $matches[1];
            // If it starts with 3, it's mobile, not landline
            if (substr($afterCountryCode, 0, 1) == '3') {
                return false;
            }
            // Check for landline area codes
            $landlineAreaCodes = ['21', '42', '51', '61', '71', '81', '91', '41', '213', '214', '215'];
            foreach ($landlineAreaCodes as $code) {
                if (strpos($afterCountryCode, $code) === 0) {
                    return true;
                }
            }
        }
    }
    
    // Remove non-digits for pattern matching
    $phoneDigits = preg_replace('/[^0-9]/', '', $phoneStr);
    
    // Check for common landline area codes (Pakistan examples)
    // Check if the digits contain landline area codes anywhere
    $landlineAreaCodes = ['021', '042', '051', '061', '071', '081', '091', '041', '0213', '0214', '0215'];
    
    foreach ($landlineAreaCodes as $code) {
        // Check if the area code appears in the phone number
        if (strpos($phoneDigits, $code) !== false) {
            // Make sure it's not a mobile number (mobile starts with 03 or 923)
            // If the number starts with 03 or 923, it's mobile
            if (preg_match('/^(03|923)/', $phoneDigits)) {
                continue; // Skip, it's mobile
            }
            // If the area code appears at the start or early in the number, it's likely landline
            if (strpos($phoneDigits, $code) === 0 || strpos($phoneDigits, $code) <= 2) {
                return true;
            }
            // If the number contains the area code and is 10-12 digits, likely landline
            if (strlen($phoneDigits) >= 10 && strlen($phoneDigits) <= 12) {
                // Double check it's not mobile
                if (!preg_match('/^(03|923|3)/', $phoneDigits)) {
                    return true;
                }
            }
        }
    }
    
    // Additional check: if number starts with 0 followed by area code (not 3)
    if (strlen($phoneDigits) >= 10) {
        if (substr($phoneDigits, 0, 1) == '0') {
            $secondPart = substr($phoneDigits, 1, 2);
            // If second part is area code (not 3x), it's landline
            if (in_array($secondPart, ['21', '42', '51', '61', '71', '81', '91', '41'])) {
                return true;
            }
            // Check for 3-digit area codes
            $thirdPart = substr($phoneDigits, 1, 3);
            if (in_array($thirdPart, ['213', '214', '215'])) {
                return true;
            }
        }
    }
    
    // Check for 12 digits starting with 92 (country code)
    if (strlen($phoneDigits) == 12 && substr($phoneDigits, 0, 2) == '92') {
        // If third digit is 3, it's mobile
        if (substr($phoneDigits, 2, 1) == '3') {
            return false;
        }
        // Otherwise, check if it matches landline area codes
        $afterCountryCode = substr($phoneDigits, 2);
        $landlineAreaCodes = ['21', '42', '51', '61', '71', '81', '91', '41', '213', '214', '215'];
        foreach ($landlineAreaCodes as $code) {
            if (strpos($afterCountryCode, $code) === 0) {
                return true;
            }
        }
    }
    
    // Check for very short numbers (likely not mobile)
    if (strlen($phoneDigits) < 10) {
        return true;
    }
    
    // Check for very long numbers (likely not mobile, but could be landline with extensions)
    if (strlen($phoneDigits) > 12) {
        return true;
    }
    
    return false;
}

// Function to find phone number column index
function findPhoneColumn($headers) {
    $phoneKeywords = ['phone', 'mobile', 'contact', 'tel', 'number', 'cell', 'whatsapp'];
    
    foreach ($headers as $index => $header) {
        $headerLower = strtolower(trim($header));
        foreach ($phoneKeywords as $keyword) {
            if (strpos($headerLower, $keyword) !== false) {
                return $index;
            }
        }
    }
    
    return null;
}

try {
    echo "Loading Excel file: $inputFile\n";
    
    // Check if file exists
    if (!file_exists($inputFile)) {
        die("Error: Input file not found: $inputFile\n");
    }
    
    // Load the spreadsheet with read-only mode for better memory usage
    $reader = IOFactory::createReader('Xlsx');
    $reader->setReadDataOnly(true);
    $reader->setReadEmptyCells(false);
    $spreadsheet = $reader->load($inputFile);
    $worksheet = $spreadsheet->getActiveSheet();
    
    // Get the highest row and column with actual data
    $highestRow = $worksheet->getHighestDataRow();
    $highestColumn = $worksheet->getHighestDataColumn();
    $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
    
    echo "Total rows: $highestRow\n";
    echo "Total columns: $highestColumnIndex\n";
    
    // Limit columns to reasonable number to avoid memory issues
    $maxColumns = min($highestColumnIndex, 200);
    echo "Processing first $maxColumns columns to avoid memory issues...\n";
    
    // Read headers (first row)
    $headers = [];
    for ($col = 1; $col <= $maxColumns; $col++) {
        $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . '1';
        $headers[] = $worksheet->getCell($cellAddress)->getValue();
    }
    
    echo "Headers: " . implode(', ', array_slice($headers, 0, 10)) . "...\n";
    
    // Find phone number column
    $phoneColumnIndex = findPhoneColumn($headers);
    
    if ($phoneColumnIndex === null) {
        // Try to auto-detect by checking first few columns
        echo "Phone column not found in headers. Checking first 10 columns...\n";
        $phoneColumnIndex = 0; // Default to first column
    } else {
        $phoneColumnIndex++; // Convert to 1-based index
        echo "Phone column found at column: " . $headers[$phoneColumnIndex - 1] . " (index: $phoneColumnIndex)\n";
    }
    
    // Process rows
    $rowsToKeep = [];
    $rowsRemoved = 0;
    $rowsKept = 0;
    
    // Keep header row
    $rowsToKeep[] = 1;
    
    echo "Processing rows...\n";
    for ($row = 2; $row <= $highestRow; $row++) {
        $phoneValue = null;
        if ($phoneColumnIndex !== null && $phoneColumnIndex <= $maxColumns) {
            $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($phoneColumnIndex) . $row;
            $phoneValue = $worksheet->getCell($cellAddress)->getValue();
        }
        
        // Check all columns if phone column not found or empty
        if (empty($phoneValue)) {
            // Try to find phone number in first 10 columns
            $foundPhone = false;
            for ($col = 1; $col <= min(10, $maxColumns); $col++) {
                $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $row;
                $cellValue = $worksheet->getCell($cellAddress)->getValue();
                if (!empty($cellValue) && (isMobileNumber($cellValue) || isLandlineNumber($cellValue))) {
                    $phoneValue = $cellValue;
                    $foundPhone = true;
                    break;
                }
            }
            
            if (!$foundPhone) {
                // No phone number found, keep the row
                $rowsToKeep[] = $row;
                $rowsKept++;
                if ($row % 500 == 0) {
                    echo "Processed $row rows... (Kept: $rowsKept, Removed: $rowsRemoved)\n";
                }
                continue;
            }
        }
        
        // Check if it's a mobile number
        if (isMobileNumber($phoneValue)) {
            $rowsToKeep[] = $row;
            $rowsKept++;
        } elseif (isLandlineNumber($phoneValue)) {
            $rowsRemoved++;
        } else {
            // Can't determine, keep it to be safe
            $rowsToKeep[] = $row;
            $rowsKept++;
        }
        
        if ($row % 500 == 0) {
            echo "Processed $row rows... (Kept: $rowsKept, Removed: $rowsRemoved)\n";
        }
    }
    
    echo "\nProcessing complete!\n";
    echo "Rows kept: $rowsKept\n";
    echo "Rows removed: $rowsRemoved\n";
    echo "Total processed: " . ($rowsKept + $rowsRemoved) . "\n";
    
    // Create new spreadsheet with filtered rows
    echo "\nCreating cleaned file...\n";
    
    // Reload the file to get formatting (but limit columns)
    $reader2 = IOFactory::createReader('Xlsx');
    $reader2->setReadDataOnly(false);
    $spreadsheet2 = $reader2->load($inputFile);
    $worksheet2 = $spreadsheet2->getActiveSheet();
    
    $newSpreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $newWorksheet = $newSpreadsheet->getActiveSheet();
    
    // Copy headers for limited columns
    for ($col = 1; $col <= $maxColumns; $col++) {
        $oldCellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . '1';
        $newCellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . '1';
        $newWorksheet->setCellValue($newCellAddress, $headers[$col - 1]);
    }
    
    // Copy data rows
    $newRow = 2;
    foreach ($rowsToKeep as $oldRow) {
        for ($col = 1; $col <= $maxColumns; $col++) {
            $oldCellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $oldRow;
            $newCellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $newRow;
            
            $cellValue = $worksheet2->getCell($oldCellAddress)->getValue();
            $newWorksheet->setCellValue($newCellAddress, $cellValue);
        }
        $newRow++;
        
        if ($newRow % 200 == 0) {
            echo "Copied $newRow rows...\n";
        }
    }
    
    // Save the new file
    echo "Saving file...\n";
    $writer = new Xlsx($newSpreadsheet);
    $writer->save($outputFile);
    
    echo "Cleaned file saved to: $outputFile\n";
    echo "Done!\n";
    
    // Free memory
    $spreadsheet->disconnectWorksheets();
    unset($spreadsheet);
    $spreadsheet2->disconnectWorksheets();
    unset($spreadsheet2);
    $newSpreadsheet->disconnectWorksheets();
    unset($newSpreadsheet);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
