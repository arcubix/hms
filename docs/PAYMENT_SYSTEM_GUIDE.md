# Patient Payment System - Complete Processing Guide

## Overview

The Patient Payment System is a unified payment processing solution that handles payments across all patient care modules (IPD, OPD, Emergency, Lab, Radiology) with support for both advance payments and post-billing payments.

## Table of Contents

1. [Payment Flow Overview](#payment-flow-overview)
2. [Payment Types](#payment-types)
3. [Payment Methods](#payment-methods)
4. [Module-Specific Payment Processes](#module-specific-payment-processes)
5. [Advance Payment System](#advance-payment-system)
6. [Payment Workflows](#payment-workflows)
7. [Receipt Generation](#receipt-generation)
8. [Payment History & Reports](#payment-history--reports)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Troubleshooting](#troubleshooting)

---

## Payment Flow Overview

### High-Level Payment Flow

```
┌─────────────────┐
│  Service Rendered │
│  (IPD/OPD/Emergency) │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│  Bill Generated  │
│  (Total Amount)  │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Advance Applied │◄─────│ Advance Balance  │
│  (if available)  │      │   (if exists)    │
└────────┬──────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Calculate Due  │
│  (Total - Advance) │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│  Collect Payment │
│  (Cash/Card/etc) │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│  Update Status  │
│  (Pending/Partial/Paid) │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│ Generate Receipt │
└─────────────────┘
```

---

## Payment Types

### 1. Advance Payment
- **When**: Before services are rendered
- **Purpose**: Pre-payment for future services
- **Storage**: Stored in `patient_advance_balance` table
- **Application**: Automatically applied to bills when generated
- **Use Case**: Patient wants to deposit money in advance

**Process:**
1. Patient/Staff initiates advance payment
2. Select payment method (Cash/Card/Bank Transfer/Cheque)
3. Enter amount
4. Payment recorded in `patient_payments` with `bill_type='advance'`
5. Advance balance updated in `patient_advance_balance`
6. Receipt generated

### 2. Partial Payment
- **When**: After bill generation, paying less than full amount
- **Purpose**: Paying in installments
- **Status**: Bill status changes to 'partial'
- **Use Case**: Patient cannot pay full amount immediately

**Process:**
1. Bill generated with total amount
2. Patient pays partial amount
3. Payment recorded with `payment_type='partial'`
4. Bill status updated to 'partial'
5. Remaining due amount tracked
6. Receipt generated

### 3. Full Payment
- **When**: After bill generation, paying complete amount
- **Purpose**: Complete settlement
- **Status**: Bill status changes to 'paid'
- **Use Case**: Patient pays entire bill at once

**Process:**
1. Bill generated
2. Patient pays full due amount
3. Payment recorded with `payment_type='full'`
4. Bill status updated to 'paid'
5. Receipt generated

### 4. Refund Payment
- **When**: Need to refund a previous payment
- **Purpose**: Reverse a payment transaction
- **Status**: Original payment marked as 'refunded'
- **Use Case**: Service cancelled, overpayment, error correction

**Process:**
1. Identify payment to refund
2. Create refund payment record
3. Reverse advance balance if applicable
4. Update billing status
5. Generate refund receipt

---

## Payment Methods

### 1. Cash Payment
- **Required Fields**: Amount only
- **Process**: 
  - Enter payment amount
  - Select "Cash" as payment method
  - Record payment
  - Generate receipt

### 2. Card Payment
- **Required Fields**: Amount, Transaction ID
- **Process**:
  - Enter payment amount
  - Select "Card" as payment method
  - Enter transaction reference number
  - Record payment
  - Generate receipt

### 3. Bank Transfer
- **Required Fields**: Amount, Transaction ID, Bank Name
- **Process**:
  - Enter payment amount
  - Select "Bank Transfer" as payment method
  - Enter transaction reference number
  - Enter bank name
  - Record payment
  - Generate receipt

### 4. Cheque Payment
- **Required Fields**: Amount, Cheque Number, Bank Name
- **Optional Fields**: Cheque Date
- **Process**:
  - Enter payment amount
  - Select "Cheque" as payment method
  - Enter cheque number
  - Enter bank name
  - Enter cheque date (optional)
  - Record payment
  - Generate receipt

---

## Module-Specific Payment Processes

### IPD (In-Patient Department) Payments

#### Payment Flow:
1. **Admission**: Patient admitted to IPD
2. **Services Rendered**: Room charges, consultations, medications, lab tests, procedures
3. **Billing Generated**: `ipd_billing` record created with all charges
4. **Payment Collection**:
   - Can collect advance payments anytime during stay
   - Can collect payments after billing
   - Advance balance can be applied automatically
5. **Status Update**: Payment status updated (pending → partial → paid)

#### Key Points:
- Payments linked to `ipd_billing.id` via `bill_id`
- Multiple payments allowed (partial payments)
- Advance payments can be made before discharge
- Final settlement at discharge

#### API Endpoint:
```
POST /api/ipd/admissions/{admission_id}/billing/payment
```

#### Example Payment Data:
```json
{
  "amount": 5000,
  "payment_method": "cash",
  "payment_date": "2024-01-15",
  "payment_time": "14:30",
  "notes": "Partial payment"
}
```

---

### OPD (Out-Patient Department) Payments

#### Payment Flow:
1. **Appointment/Consultation**: Patient visits OPD
2. **Services Rendered**: Consultation, procedures, lab tests, radiology
3. **Bill Generation**: `opd_bills` record created
4. **Payment Collection**:
   - Payment collected immediately after consultation
   - Can collect advance before consultation
   - Advance balance can be applied
5. **Status Update**: Payment status updated

#### Key Points:
- Bills linked to appointments/consultations
- Usually single payment per bill
- Can create bill with multiple line items
- Payment can be collected at billing counter

#### API Endpoint:
```
POST /api/opd-billing/payment/{bill_id}
```

#### Example Payment Data:
```json
{
  "amount": 1500,
  "payment_method": "card",
  "transaction_id": "TXN123456",
  "notes": "OPD consultation payment"
}
```

---

### Emergency Department Payments

#### Payment Flow:
1. **Emergency Visit**: Patient arrives at emergency
2. **Charges Added**: Charges added to `emergency_charges` table
3. **Payment Collection**:
   - Can collect advance payment
   - Can collect payment after charges
   - Payment linked to visit ID
4. **Status Update**: Total charges vs paid tracked

#### Key Points:
- Payments linked to `emergency_visits.id` via `bill_id`
- Charges accumulated during visit
- Payment can be collected anytime during/after visit
- Multiple payments allowed

#### API Endpoint:
```
POST /api/emergency/visits/{visit_id}/payment
```

#### Example Payment Data:
```json
{
  "amount": 3000,
  "payment_method": "bank_transfer",
  "transaction_id": "BANK789012",
  "bank_name": "ABC Bank",
  "notes": "Emergency treatment payment"
}
```

---

### Lab Test Payments

#### Payment Flow:
1. **Lab Test Ordered**: Test ordered by doctor
2. **Bill Generated**: Lab charges added to bill
3. **Payment Collection**:
   - Can pay advance before test
   - Can pay after test completion
   - Payment linked to lab test order
4. **Status Update**: Payment status tracked

#### Key Points:
- Payments linked via `bill_type='lab'` and `bill_id` (test order ID)
- Usually single payment per test
- Can be part of OPD/IPD bill or standalone

#### API Endpoint:
```
POST /api/patient-payments/bill-payment
```

#### Example Payment Data:
```json
{
  "bill_type": "lab",
  "bill_id": 123,
  "amount": 500,
  "payment_method": "cash"
}
```

---

### Radiology Payments

#### Payment Flow:
1. **Imaging Ordered**: Radiology test ordered
2. **Bill Generated**: Imaging charges added
3. **Payment Collection**:
   - Can pay advance before imaging
   - Can pay after imaging
   - Payment linked to imaging order
4. **Status Update**: Payment status tracked

#### Key Points:
- Payments linked via `bill_type='radiology'` and `bill_id` (imaging order ID)
- Usually single payment per test
- Can be part of OPD/IPD bill or standalone

#### API Endpoint:
```
POST /api/patient-payments/bill-payment
```

#### Example Payment Data:
```json
{
  "bill_type": "radiology",
  "bill_id": 456,
  "amount": 2000,
  "payment_method": "card",
  "transaction_id": "CARD345678"
}
```

---

## Advance Payment System

### How Advance Payments Work

1. **Collection**:
   - Patient pays advance amount
   - Stored in `patient_payments` with `bill_type='advance'`
   - Balance updated in `patient_advance_balance` table

2. **Application**:
   - When bill is generated, system checks for advance balance
   - User can choose to apply advance balance
   - Advance amount deducted from bill
   - Remaining amount becomes due

3. **Tracking**:
   - Total advance paid: Sum of all advance payments
   - Total advance used: Sum applied to bills
   - Current balance: Total paid - Total used

### Advance Payment Workflow

```
┌──────────────────┐
│ Advance Payment  │
│   Collected      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update Balance   │
│ (Add to balance) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Bill Generated   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Apply Advance?  │
│ (Yes/No)         │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Deduct  │ │ Full    │
│ Advance │ │ Payment │
│ Amount  │ │ Required│
└─────────┘ └─────────┘
```

### API Endpoints for Advance Payments

#### Record Advance Payment:
```
POST /api/patient-payments/advance
```

#### Get Advance Balance:
```
GET /api/patient-payments/advance-balance/{patient_id}
```

#### Apply Advance to Bill:
```
POST /api/patient-payments/apply-advance
```

---

## Payment Workflows

### Workflow 1: Advance Payment → Service → Bill Settlement

**Scenario**: Patient pays advance, receives services, advance applied to bill

1. **Step 1 - Advance Payment**:
   ```
   - Patient pays ₹10,000 advance
   - Payment recorded: bill_type='advance', amount=10000
   - Advance balance: ₹10,000
   ```

2. **Step 2 - Service Rendered**:
   ```
   - Patient receives IPD services
   - Bill generated: Total = ₹15,000
   ```

3. **Step 3 - Apply Advance**:
   ```
   - System applies ₹10,000 advance
   - Due amount: ₹5,000
   - Advance balance: ₹0
   ```

4. **Step 4 - Final Payment**:
   ```
   - Patient pays remaining ₹5,000
   - Bill status: 'paid'
   ```

### Workflow 2: Service → Bill → Multiple Partial Payments

**Scenario**: Patient receives services, pays in installments

1. **Step 1 - Service & Bill**:
   ```
   - Services rendered
   - Bill generated: Total = ₹20,000
   - Status: 'pending'
   ```

2. **Step 2 - First Payment**:
   ```
   - Patient pays ₹8,000
   - Payment recorded: payment_type='partial'
   - Bill status: 'partial'
   - Due: ₹12,000
   ```

3. **Step 3 - Second Payment**:
   ```
   - Patient pays ₹7,000
   - Payment recorded: payment_type='partial'
   - Bill status: 'partial'
   - Due: ₹5,000
   ```

4. **Step 4 - Final Payment**:
   ```
   - Patient pays ₹5,000
   - Payment recorded: payment_type='full'
   - Bill status: 'paid'
   ```

### Workflow 3: OPD Consultation Payment

**Scenario**: Patient visits OPD, consultation, immediate payment

1. **Step 1 - Consultation**:
   ```
   - Patient visits OPD
   - Doctor consultation completed
   ```

2. **Step 2 - Bill Generation**:
   ```
   - OPD bill created
   - Consultation fee: ₹500
   - Lab tests: ₹1,000
   - Total: ₹1,500
   ```

3. **Step 3 - Payment**:
   ```
   - Patient pays ₹1,500 at counter
   - Payment method: Card
   - Transaction ID recorded
   - Bill status: 'paid'
   ```

4. **Step 4 - Receipt**:
   ```
   - Receipt generated automatically
   - Receipt number: RCPT-2024-00001
   - Receipt printed/emailed
   ```

### Workflow 4: Emergency Payment with Advance Application

**Scenario**: Patient has advance balance, uses it for emergency charges

1. **Step 1 - Advance Balance**:
   ```
   - Patient has advance balance: ₹5,000
   ```

2. **Step 2 - Emergency Visit**:
   ```
   - Patient arrives at emergency
   - Charges accumulated: ₹8,000
   ```

3. **Step 3 - Apply Advance**:
   ```
   - System applies ₹5,000 advance
   - Due amount: ₹3,000
   ```

4. **Step 4 - Payment**:
   ```
   - Patient pays remaining ₹3,000
   - Payment method: Cash
   - Status: 'paid'
   ```

---

## Receipt Generation

### Receipt Generation Process

1. **Automatic Generation**:
   - Receipt number auto-generated (RCPT-YYYY-NNNNN)
   - Receipt record created in `payment_receipts` table
   - Linked to payment record

2. **Receipt Content**:
   - Receipt number
   - Payment number
   - Patient details
   - Payment date and time
   - Payment method
   - Amount paid
   - Transaction details (if applicable)
   - Bill reference

3. **Receipt Actions**:
   - **Print**: Print receipt directly
   - **Download PDF**: Download PDF version
   - **Email**: Email receipt to patient
   - **SMS**: Send receipt via SMS

### API Endpoints for Receipts

#### Generate Receipt:
```
POST /api/patient-payments/generate-receipt/{payment_id}
```

#### Get Receipt:
```
GET /api/patient-payments/receipt/{receipt_number}
```

---

## Payment History & Reports

### Payment History Features

1. **View All Payments**:
   - Filter by patient
   - Filter by bill type (IPD/OPD/Emergency/Lab/Radiology)
   - Filter by payment method
   - Filter by date range
   - Search by payment number, receipt number

2. **Payment Details**:
   - Payment number
   - Payment date and time
   - Amount
   - Payment method
   - Bill reference
   - Status
   - Receipt link

3. **Advance Balance Tracking**:
   - Current advance balance
   - Total advance paid
   - Total advance used
   - Transaction history

### Reports Available

1. **Daily Collection Report**:
   - Total collections per day
   - Payment method breakdown
   - Module-wise collections

2. **Outstanding Payments Report**:
   - Pending bills
   - Partial payments
   - Overdue amounts

3. **Payment Method Report**:
   - Collections by payment method
   - Cash vs Card vs Bank Transfer vs Cheque

4. **Patient Payment History**:
   - All payments for a patient
   - Advance balance
   - Payment trends

---

## API Endpoints Reference

### Patient Payments

#### Create Payment
```
POST /api/patient-payments
Body: {
  "patient_id": 123,
  "bill_type": "ipd",
  "bill_id": 456,
  "amount": 5000,
  "payment_method": "cash",
  "payment_date": "2024-01-15",
  "payment_time": "14:30",
  "transaction_id": null,
  "bank_name": null,
  "cheque_number": null,
  "notes": "Payment notes"
}
```

#### Get Payments
```
GET /api/patient-payments?patient_id=123&bill_type=ipd&date_from=2024-01-01&date_to=2024-01-31
```

#### Get Payment by ID
```
GET /api/patient-payments/{payment_id}
```

#### Record Bill Payment
```
POST /api/patient-payments/bill-payment
Body: {
  "bill_type": "ipd",
  "bill_id": 456,
  "amount": 5000,
  "payment_method": "cash"
}
```

#### Record Advance Payment
```
POST /api/patient-payments/advance
Body: {
  "patient_id": 123,
  "amount": 10000,
  "payment_method": "bank_transfer",
  "transaction_id": "TXN123456",
  "bank_name": "ABC Bank"
}
```

#### Get Patient Payment History
```
GET /api/patient-payments/history/{patient_id}?date_from=2024-01-01&date_to=2024-01-31
```

#### Get Bill Payments
```
GET /api/patient-payments/bill/{bill_type}/{bill_id}
```

#### Get Advance Balance
```
GET /api/patient-payments/advance-balance/{patient_id}
```

#### Apply Advance Balance
```
POST /api/patient-payments/apply-advance
Body: {
  "bill_type": "ipd",
  "bill_id": 456,
  "amount": 5000
}
```

#### Refund Payment
```
POST /api/patient-payments/refund/{payment_id}
Body: {
  "refund_amount": 1000,
  "reason": "Service cancelled"
}
```

#### Generate Receipt
```
POST /api/patient-payments/generate-receipt/{payment_id}
```

#### Get Receipt
```
GET /api/patient-payments/receipt/{receipt_number}
```

### OPD Billing

#### Create OPD Bill
```
POST /api/opd-billing
Body: {
  "patient_id": 123,
  "appointment_id": 789,
  "consultation_fee": 500,
  "lab_charges": 1000,
  "radiology_charges": 2000,
  "discount": 0,
  "tax_rate": 0
}
```

#### Get OPD Bills
```
GET /api/opd-billing?patient_id=123&payment_status=pending
```

#### Get OPD Bill
```
GET /api/opd-billing/{bill_id}
```

#### Collect OPD Payment
```
POST /api/opd-billing/payment/{bill_id}
Body: {
  "amount": 3500,
  "payment_method": "card",
  "transaction_id": "TXN789012"
}
```

---

## Step-by-Step Payment Processing Guide

### For IPD Patients

#### Step 1: Admission
- Patient admitted to IPD
- Admission record created

#### Step 2: Services During Stay
- Room charges accumulate daily
- Consultations charged
- Medications, lab tests, procedures charged
- Charges tracked in `ipd_billing`

#### Step 3: Payment Collection Options

**Option A: Advance Payment**
1. Go to IPD Management → Select Patient → Payment
2. Select "Advance Payment"
3. Enter amount
4. Select payment method
5. Enter payment details
6. Submit payment
7. Advance balance updated

**Option B: Payment Against Bill**
1. Bill generated (manually or automatically)
2. Go to IPD Management → Select Patient → Payment
3. View bill summary (Total, Paid, Due)
4. Enter payment amount
5. Select payment method
6. Enter payment details
7. Optionally apply advance balance
8. Submit payment
9. Bill status updated

#### Step 4: Receipt Generation
1. Payment recorded successfully
2. Receipt auto-generated
3. Receipt number assigned
4. Print/download receipt

#### Step 5: Discharge
1. Check payment status
2. If fully paid → Proceed with discharge
3. If partial/unpaid → Collect remaining payment or allow credit

---

### For OPD Patients

#### Step 1: Consultation
- Patient visits OPD
- Doctor consultation completed

#### Step 2: Bill Generation
1. Go to OPD Billing
2. Select patient
3. Create bill
4. Add items:
   - Consultation fee
   - Procedures
   - Lab tests
   - Radiology tests
   - Medications
5. Calculate total
6. Apply discounts if any
7. Save bill

#### Step 3: Payment Collection
1. View bill details
2. Click "Pay" button
3. Enter payment amount
4. Select payment method
5. Enter payment details
6. Optionally apply advance balance
7. Submit payment
8. Bill status updated to 'paid'

#### Step 4: Receipt
1. Receipt auto-generated
2. Print receipt for patient
3. Patient leaves

---

### For Emergency Patients

#### Step 1: Emergency Visit
- Patient arrives at emergency
- Visit record created

#### Step 2: Charges Accumulation
- Charges added as services provided:
  - Triage charges
  - Consultation charges
  - Procedure charges
  - Medication charges
- Charges tracked in `emergency_charges` table

#### Step 3: Payment Collection
1. Go to Emergency Management → Select Visit → Payment
2. View total charges
3. View amount already paid
4. Calculate due amount
5. Enter payment amount
6. Select payment method
7. Enter payment details
8. Submit payment

#### Step 4: Receipt
1. Receipt generated
2. Print receipt
3. Patient can leave

---

## Payment Status Flow

### Status Transitions

```
┌──────────┐
│ Pending  │ (No payments made)
└────┬─────┘
     │
     │ Partial Payment
     ▼
┌──────────┐
│ Partial  │ (Some payment made, balance remaining)
└────┬─────┘
     │
     │ Full Payment
     ▼
┌──────────┐
│  Paid    │ (Fully paid)
└──────────┘
```

### Payment Status Logic

- **Pending**: `due_amount == total_amount` AND `paid_amount == 0`
- **Partial**: `paid_amount > 0` AND `due_amount > 0`
- **Paid**: `due_amount == 0` OR `paid_amount >= total_amount`

---

## Payment Validation Rules

### Amount Validation
- Payment amount must be > 0
- Payment amount cannot exceed due amount (for bill payments)
- Payment amount can be any amount for advance payments

### Payment Method Validation
- **Cash**: No additional fields required
- **Card**: Transaction ID required
- **Bank Transfer**: Transaction ID and Bank Name required
- **Cheque**: Cheque Number and Bank Name required

### Bill Validation
- Bill must exist before payment
- Bill must not be cancelled
- Patient ID must match bill patient ID

---

## Error Handling

### Common Errors and Solutions

1. **"Payment amount exceeds due amount"**
   - **Cause**: Trying to pay more than what's due
   - **Solution**: Check due amount, enter correct payment amount

2. **"Insufficient advance balance"**
   - **Cause**: Trying to apply more advance than available
   - **Solution**: Check advance balance, apply correct amount

3. **"Transaction ID required"**
   - **Cause**: Card/Bank Transfer selected but no transaction ID
   - **Solution**: Enter transaction reference number

4. **"Cheque number required"**
   - **Cause**: Cheque selected but no cheque number
   - **Solution**: Enter cheque number and bank name

5. **"Bill not found"**
   - **Cause**: Invalid bill ID or bill doesn't exist
   - **Solution**: Verify bill ID, ensure bill is created

---

## Best Practices

### Payment Collection
1. **Always verify patient identity** before collecting payment
2. **Double-check payment amount** before recording
3. **Enter transaction IDs accurately** for card/bank payments
4. **Generate receipt immediately** after payment
5. **Keep payment records** for audit purposes

### Advance Payments
1. **Track advance balances** regularly
2. **Apply advance automatically** when possible
3. **Inform patients** about their advance balance
4. **Refund advance** if services not used

### Payment Methods
1. **Cash**: Count cash carefully, verify amount
2. **Card**: Verify transaction success before recording
3. **Bank Transfer**: Wait for confirmation before recording
4. **Cheque**: Verify cheque details, check validity

### Receipts
1. **Generate receipt** for every payment
2. **Print receipt** for patient records
3. **Email receipt** if patient requests
4. **Keep receipt records** for accounting

---

## Integration Points

### With Other Modules

1. **IPD Module**:
   - Payments linked to IPD admissions
   - Billing auto-updated on payment
   - Advance can be applied

2. **OPD Module**:
   - Payments linked to OPD bills
   - Bills created from consultations
   - Immediate payment collection

3. **Emergency Module**:
   - Payments linked to emergency visits
   - Charges accumulated during visit
   - Payment at any time

4. **Lab Module**:
   - Payments linked to lab test orders
   - Can be standalone or part of OPD/IPD bill

5. **Radiology Module**:
   - Payments linked to imaging orders
   - Can be standalone or part of OPD/IPD bill

---

## Database Tables Reference

### Core Tables

1. **patient_payments**: Main payment transactions
2. **patient_advance_balance**: Advance balance tracking
3. **opd_bills**: OPD billing records
4. **opd_bill_items**: OPD bill line items
5. **payment_receipts**: Receipt records
6. **ipd_billing**: IPD billing (existing, integrated)

### Key Relationships

- `patient_payments.patient_id` → `patients.id`
- `patient_payments.bill_id` → `ipd_billing.id` / `opd_bills.id` / etc.
- `patient_advance_balance.patient_id` → `patients.id`
- `payment_receipts.payment_id` → `patient_payments.id`

---

## Security Considerations

1. **Authentication**: All payment endpoints require authentication
2. **Authorization**: Check user permissions for payment operations
3. **Audit Trail**: All payments logged with user ID
4. **Data Validation**: Server-side validation for all inputs
5. **Transaction Safety**: Database transactions for payment operations

---

## Support and Troubleshooting

### Common Issues

1. **Payment not reflecting in bill**
   - Check payment status
   - Verify bill ID matches
   - Check payment processor logs

2. **Advance balance not updating**
   - Verify payment type is 'advance'
   - Check advance balance update logic
   - Review payment records

3. **Receipt not generating**
   - Check payment status (must be 'completed')
   - Verify receipt generation endpoint
   - Check receipt table records

### Contact Support

For technical issues or questions:
- Check application logs: `application/logs/`
- Review API error responses
- Check database for payment records
- Verify CORS configuration

---

## Conclusion

This payment system provides a comprehensive solution for handling payments across all patient care modules. It supports multiple payment methods, advance payments, partial payments, and provides complete audit trails and receipt generation.

For implementation details, refer to the API documentation and source code in:
- Backend: `application/controllers/PatientPayments.php`
- Frontend: `frontend/src/components/payments/`
- Models: `application/models/Patient_payment_model.php`

