# Payment System - Quick Reference Guide

## Quick Payment Processing Steps

### IPD Payment
1. Select patient in IPD Management
2. Click "Payment" button
3. View bill summary (Total, Paid, Due)
4. Enter payment amount
5. Select payment method (Cash/Card/Bank Transfer/Cheque)
6. Enter payment details (if required)
7. Optionally apply advance balance
8. Click "Record Payment"
9. Receipt auto-generated

### OPD Payment
1. Create OPD bill for patient
2. Add consultation fees, tests, procedures
3. Click "Pay" on bill
4. Enter payment amount
5. Select payment method
6. Enter payment details
7. Click "Record Payment"
8. Receipt generated

### Emergency Payment
1. Select emergency visit
2. View charges accumulated
3. Click "Payment"
4. Enter payment amount
5. Select payment method
6. Enter payment details
7. Click "Record Payment"
8. Receipt generated

### Advance Payment
1. Go to Patient Management
2. Select patient
3. Click "Advance Payment"
4. Enter amount
5. Select payment method
6. Enter payment details
7. Click "Record Payment"
8. Advance balance updated
9. Receipt generated

## Payment Methods Quick Guide

| Method | Required Fields | Optional Fields |
|--------|----------------|----------------|
| Cash | Amount | Notes |
| Card | Amount, Transaction ID | Notes |
| Bank Transfer | Amount, Transaction ID, Bank Name | Notes |
| Cheque | Amount, Cheque Number, Bank Name | Cheque Date, Notes |

## Payment Status Meanings

- **Pending**: No payment made, full amount due
- **Partial**: Some payment made, balance remaining
- **Paid**: Fully paid, no balance due

## Common API Calls

### Record Payment
```javascript
await api.recordBillPayment('ipd', billId, {
  amount: 5000,
  payment_method: 'cash'
});
```

### Record Advance
```javascript
await api.recordAdvancePayment(patientId, {
  amount: 10000,
  payment_method: 'bank_transfer',
  transaction_id: 'TXN123',
  bank_name: 'ABC Bank'
});
```

### Get Payment History
```javascript
const history = await api.getPatientPaymentHistory(patientId);
```

### Apply Advance Balance
```javascript
await api.applyAdvanceBalance('ipd', billId, 5000);
```

## Payment Flow Summary

```
Service → Bill → Payment → Receipt
   ↓         ↓       ↓         ↓
IPD/OPD  Amount  Method   Print/Email
Emergency  Due    Cash    Download PDF
Lab      Paid    Card
Radiology Status  Bank
                  Cheque
```

## Key Points to Remember

1. **Always generate receipt** after payment
2. **Verify payment amount** before recording
3. **Check advance balance** before collecting payment
4. **Enter transaction IDs** for card/bank payments
5. **Keep payment records** for audit

## Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Payment not showing | Refresh page, check payment status |
| Advance not applying | Verify advance balance, check bill ID |
| Receipt not generating | Check payment status is 'completed' |
| Amount validation error | Verify amount doesn't exceed due amount |

