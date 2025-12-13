# Due Amount Calculation - Complete Guide

## Overview

The **Due Amount** represents the outstanding balance that a patient needs to pay after accounting for all charges, advance payments, insurance coverage, and payments made.

## Formula

```
Due Amount = Total Amount - Advance Paid - Insurance Covered - Total Payments Made
```

## Detailed Calculation Flow

### Step 1: Calculate Total Amount

The total amount is calculated from various charges:

```php
Total Amount = Subtotal - Discount + Tax
```

Where **Subtotal** includes:
- Room Charges (bed/room daily rate × number of days)
- Consultation Charges
- Medication Charges
- Lab Test Charges
- Imaging/Radiology Charges
- Procedure Charges
- Other Charges

**Tax** is typically calculated as:
```php
Tax = Subtotal × Tax Rate (e.g., 18% GST)
```

**Discount** is any discount applied to the bill.

### Step 2: Get Advance Paid

Advance payments made before or during the stay:
- From `ipd_billing.advance_paid` field
- Or from `ipd_admissions.advance_payment` field

### Step 3: Get Insurance Covered

Amount covered by insurance:
- From `ipd_billing.insurance_covered` field
- Or from `ipd_admissions.insurance_coverage_amount` field

### Step 4: Get Total Payments Made

Sum of all completed payments from `patient_payments` table:

```php
Total Paid = SUM(amount) 
WHERE bill_type = 'ipd' 
  AND bill_id = {billing_id} 
  AND payment_status = 'completed'
```

This is calculated by `Patient_payment_model::get_total_paid('ipd', $bill_id)`.

### Step 5: Calculate Due Amount

```php
Due Amount = Total Amount - Advance Paid - Insurance Covered - Total Paid
```

**Important**: The result is clamped to a minimum of 0 (cannot be negative):
```php
Due Amount = max(0, Due Amount)
```

## Implementation Locations

### 1. Initial Calculation (Bill Creation)

**File**: `application/models/Ipd_billing_model.php`
**Method**: `calculate_billing($admission_id)`

```php
// Line 139-143
$total_amount = $subtotal - $discount + $tax;
$advance_paid = $admission['advance_payment'] ?? 0;
$insurance_covered = $admission['insurance_coverage_amount'] ?? 0;
$due_amount = $total_amount - $advance_paid - $insurance_covered;
```

**Note**: At bill creation, no payments have been made yet, so `total_paid = 0`.

### 2. Payment Recording (After Payment)

**File**: `application/libraries/PaymentProcessor.php`
**Method**: `update_ipd_billing_status($bill_id)`

```php
// Line 243-249
$total_paid = $this->CI->Patient_payment_model->get_total_paid('ipd', $bill_id);
$total_amount = $billing['total_amount'] ?? 0.00;
$advance_paid = $billing['advance_paid'] ?? 0.00;
$insurance_covered = $billing['insurance_covered'] ?? 0.00;
$due_amount = $total_amount - $advance_paid - $insurance_covered - $total_paid;
```

### 3. Payment Status Update

After each payment is recorded, the billing status is updated:

**File**: `application/libraries/PaymentProcessor.php`
**Method**: `update_bill_status($bill_type, $bill_id)`

```php
// Determines payment status based on due amount:
if ($due_amount <= 0) {
    $payment_status = 'paid';
} else if ($total_paid > 0 || $advance_paid > 0) {
    $payment_status = 'partial';
} else {
    $payment_status = 'pending';
}
```

## Example Calculation

### Scenario: IPD Patient Admission

**Initial Bill Creation:**
- Room Charges: ₹5,000 (₹1,000/day × 5 days)
- Medication Charges: ₹2,000
- Lab Charges: ₹1,500
- Consultation Charges: ₹1,000
- **Subtotal**: ₹9,500
- **Discount**: ₹500
- **Tax (18%)**: ₹1,620 (on ₹9,000 after discount)
- **Total Amount**: ₹10,120

**Advance Payment Made:**
- Advance Paid: ₹3,000

**Insurance Coverage:**
- Insurance Covered: ₹2,000

**Initial Due Amount:**
```
Due Amount = ₹10,120 - ₹3,000 - ₹2,000 - ₹0
Due Amount = ₹5,120
```

**After First Payment (₹2,000):**
```
Total Paid = ₹2,000
Due Amount = ₹10,120 - ₹3,000 - ₹2,000 - ₹2,000
Due Amount = ₹3,120
```

**After Second Payment (₹3,120):**
```
Total Paid = ₹2,000 + ₹3,120 = ₹5,120
Due Amount = ₹10,120 - ₹3,000 - ₹2,000 - ₹5,120
Due Amount = ₹0
Status: 'paid'
```

## Database Fields

### `ipd_billing` Table

| Field | Description | Used In Calculation |
|-------|-------------|---------------------|
| `total_amount` | Total bill amount | Yes (Total Amount) |
| `advance_paid` | Advance payments made | Yes (Advance Paid) |
| `insurance_covered` | Insurance coverage | Yes (Insurance Covered) |
| `due_amount` | Calculated due amount | Result |
| `payment_status` | pending/partial/paid | Based on due_amount |

### `patient_payments` Table

| Field | Description | Used In Calculation |
|-------|-------------|---------------------|
| `bill_type` | Type of bill (ipd/opd/etc) | Filter |
| `bill_id` | Reference to billing record | Filter |
| `amount` | Payment amount | Summed |
| `payment_status` | Payment status | Filter (only 'completed') |

## Key Methods

### 1. Get Total Paid Amount

**File**: `application/models/Patient_payment_model.php`
**Method**: `get_total_paid($bill_type, $bill_id)`

```php
public function get_total_paid($bill_type, $bill_id) {
    $this->db->select_sum('amount');
    $this->db->where('bill_type', $bill_type);
    $this->db->where('bill_id', $bill_id);
    $this->db->where('payment_status', 'completed');
    $query = $this->db->get('patient_payments');
    $result = $query->row();
    return $result->amount ?? 0.00;
}
```

### 2. Update IPD Billing Status

**File**: `application/libraries/PaymentProcessor.php`
**Method**: `update_ipd_billing_status($bill_id)`

This method:
1. Gets current billing record
2. Calculates total paid from `patient_payments` table
3. Recalculates due amount
4. Updates payment status
5. Updates `ipd_billing` table

## Important Notes

### 1. Advance Paid vs Total Paid

- **Advance Paid**: Stored in `ipd_billing.advance_paid` - represents advance payments made at admission
- **Total Paid**: Calculated from `patient_payments` table - represents all payments made (including advance payments recorded in the new system)

**Note**: There's a potential issue here - if advance payments are recorded in `patient_payments` table, they might be double-counted. The system should ensure:
- Either advance payments are NOT recorded in `patient_payments` (only in `advance_paid`)
- OR advance payments in `patient_payments` are excluded from `total_paid` calculation

### 2. Payment Status Logic

```php
if ($due_amount <= 0) {
    $payment_status = 'paid';  // Fully paid
} else if ($total_paid > 0 || $advance_paid > 0) {
    $payment_status = 'partial';  // Some payment made
} else {
    $payment_status = 'pending';  // No payment made
}
```

### 3. Negative Due Amount Prevention

The system ensures due amount never goes negative:
```php
$due_amount = max(0, $due_amount);
```

This prevents overpayment issues.

### 4. Real-time Updates

The due amount is recalculated:
- When a payment is recorded
- When billing status is updated
- When viewing patient details (frontend fetches latest billing data)

## Frontend Display

In the frontend (`IPDManagement.tsx`), the due amount is displayed from:
- `selectedPatient.dueAmount` - comes from API response
- `billing.due_amount` - from billing data

The frontend displays:
- **Total Charges**: `totalCharges`
- **Paid Amount**: `paidAmount`
- **Due Amount**: `dueAmount`

## Potential Issues & Recommendations

### Issue 1: Double Counting Advance Payments

**Problem**: If advance payments are recorded in both `ipd_billing.advance_paid` and `patient_payments` table, they might be counted twice.

**Solution**: 
- Option A: Don't record advance payments in `patient_payments` for IPD (only use `advance_paid`)
- Option B: Exclude advance payments from `get_total_paid()` calculation
- Option C: Use only `patient_payments` table and remove `advance_paid` field

### Issue 2: Payment Status Update Timing

**Problem**: Payment status might not update immediately after payment.

**Solution**: Ensure `update_bill_status()` is called after every payment recording.

### Issue 3: Multiple Payment Sources

**Problem**: Payments can come from different sources (old system vs new system).

**Solution**: Ensure all payment sources update the same calculation method.

## Summary

The due amount calculation follows this formula:

```
Due Amount = Total Amount - Advance Paid - Insurance Covered - Total Payments Made
```

Where:
- **Total Amount**: Sum of all charges (room, medication, lab, etc.) minus discount plus tax
- **Advance Paid**: Advance payments stored in billing record
- **Insurance Covered**: Insurance coverage amount
- **Total Payments Made**: Sum of all completed payments from `patient_payments` table

The calculation is performed in:
1. `Ipd_billing_model::calculate_billing()` - Initial calculation
2. `PaymentProcessor::update_ipd_billing_status()` - After payments
3. `Patient_payment_model::get_total_paid()` - Gets total paid amount

The result is always clamped to a minimum of 0 (cannot be negative).

