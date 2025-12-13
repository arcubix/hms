import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { api, type CreatePatientPaymentData } from '../../services/api';
import { Loader2, IndianRupee, CreditCard, Wallet, Building2, CheckCircle } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  billType?: 'ipd' | 'opd' | 'emergency' | 'lab' | 'radiology' | 'advance';
  billId?: number;
  appointmentId?: number; // For OPD payments against appointments
  consultationFee?: number; // Consultation fee for appointment payments
  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  advanceBalance?: number;
  onSuccess?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  patientId,
  billType = 'advance',
  billId,
  appointmentId,
  consultationFee,
  totalAmount = 0,
  paidAmount = 0,
  dueAmount = 0,
  advanceBalance = 0,
  onSuccess,
}: PaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [chequeDate, setChequeDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [useAdvance, setUseAdvance] = useState(false);
  const [advanceToUse, setAdvanceToUse] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (billType === 'advance') {
        setPaymentAmount('');
      } else {
        setPaymentAmount(dueAmount > 0 ? dueAmount.toString() : '');
      }
      setPaymentMethod('');
      setTransactionId('');
      setBankName('');
      setChequeNumber('');
      setChequeDate('');
      setNotes('');
      setUseAdvance(false);
      setAdvanceToUse('');
      
      // Show warning if consultation fee is missing for appointment payments
      // Only show warning if we don't have a bill yet AND consultation fee is 0 or missing
      if (appointmentId && billType === 'opd' && !billId && (!consultationFee || consultationFee === 0) && dueAmount === 0) {
        toast.warning('Consultation fee is not set for this doctor. Bill will be created with ₹0. Please set consultation fee in User Settings.', {
          duration: 5000
        });
      }
    }
  }, [open, dueAmount, billType, appointmentId, consultationFee, billId]);

  const handleSubmit = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate payment method specific fields
    if (paymentMethod === 'cheque') {
      if (!chequeNumber || !bankName) {
        toast.error('Cheque number and bank name are required for cheque payments');
        return;
      }
    }

    if (paymentMethod === 'card' || paymentMethod === 'bank_transfer') {
      if (!transactionId) {
        toast.error('Transaction ID is required for ' + (paymentMethod === 'card' ? 'card' : 'bank transfer') + ' payments');
        return;
      }
    }

    // Validate amount doesn't exceed due amount (for bill payments)
    if (billType !== 'advance' && parseFloat(paymentAmount) > dueAmount) {
      toast.error('Payment amount cannot exceed due amount');
      return;
    }

    try {
      setSubmitting(true);

      const paymentData: CreatePatientPaymentData = {
        patient_id: patientId,
        bill_type: billType,
        bill_id: billId,
        payment_method: paymentMethod as 'cash' | 'card' | 'bank_transfer' | 'cheque',
        amount: parseFloat(paymentAmount),
        payment_date: new Date().toISOString().split('T')[0],
        payment_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        transaction_id: transactionId || undefined,
        bank_name: bankName || undefined,
        cheque_number: chequeNumber || undefined,
        cheque_date: chequeDate || undefined,
        notes: notes || undefined,
      };

      let result;
      if (billType === 'advance') {
        result = await api.recordAdvancePayment(patientId, paymentData);
      } else if (appointmentId && billType === 'opd') {
        // Payment against appointment - will create bill automatically if needed
        // Include consultation fee in payment data if provided
        const appointmentPaymentData = {
          ...paymentData,
          ...(consultationFee !== undefined && consultationFee > 0 ? { consultation_fee: consultationFee } : {})
        };
        result = await api.collectAppointmentPayment(appointmentId, appointmentPaymentData);
      } else if (billId) {
        result = await api.recordBillPayment(billType, billId, paymentData);
      } else {
        result = await api.recordPatientPayment(paymentData);
      }

      // Apply advance balance if requested
      if (useAdvance && billType !== 'advance' && billId && parseFloat(advanceToUse) > 0) {
        try {
          await api.applyAdvanceBalance(billType, billId, parseFloat(advanceToUse));
        } catch (error: any) {
          console.error('Failed to apply advance balance:', error);
          // Don't fail the payment if advance application fails
        }
      }

      toast.success('Payment recorded successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to record payment: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const showAdvanceOption = billType !== 'advance' && advanceBalance > 0 && billId;
  const maxPaymentAmount = billType === 'advance' ? undefined : dueAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[90vw] sm:w-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {billType === 'advance' ? 'Collect Advance Payment' : 'Collect Payment'}
          </DialogTitle>
          <DialogDescription>
            {billType === 'advance'
              ? 'Record advance payment for patient'
              : `Record payment for ${billType.toUpperCase()} bill`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bill Summary (if not advance payment) */}
          {billType !== 'advance' && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid Amount</span>
                    <span className="text-green-600">₹{paidAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Due Amount</span>
                    <span className="font-bold text-red-600">₹{dueAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advance Balance Option */}
          {showAdvanceOption && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Available Advance Balance</p>
                    <p className="text-lg font-bold text-blue-600">₹{advanceBalance.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useAdvance}
                      onChange={(e) => setUseAdvance(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label>Use Advance</Label>
                  </div>
                </div>
                {useAdvance && (
                  <div className="mt-3">
                    <Input
                      type="number"
                      placeholder="Amount to use from advance"
                      value={advanceToUse}
                      onChange={(e) => setAdvanceToUse(e.target.value)}
                      max={Math.min(advanceBalance, dueAmount)}
                      min={0}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: ₹{Math.min(advanceBalance, dueAmount).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label>Payment Amount *</Label>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0"
              max={maxPaymentAmount}
              min={0}
              step="0.01"
            />
            {maxPaymentAmount && (
              <p className="text-xs text-gray-500">Maximum: ₹{maxPaymentAmount.toLocaleString()}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Card
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
                <SelectItem value="cheque">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Cheque
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction ID (for Card/Bank Transfer) */}
          {(paymentMethod === 'card' || paymentMethod === 'bank_transfer') && (
            <div className="space-y-2">
              <Label>Transaction ID *</Label>
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction reference number"
              />
            </div>
          )}

          {/* Bank Name (for Bank Transfer/Cheque) */}
          {(paymentMethod === 'bank_transfer' || paymentMethod === 'cheque') && (
            <div className="space-y-2">
              <Label>Bank Name {paymentMethod === 'cheque' ? '*' : ''}</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                required={paymentMethod === 'cheque'}
              />
            </div>
          )}

          {/* Cheque Details */}
          {paymentMethod === 'cheque' && (
            <>
              <div className="space-y-2">
                <Label>Cheque Number *</Label>
                <Input
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                  placeholder="Enter cheque number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Cheque Date</Label>
                <Input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={submitting || !paymentAmount || !paymentMethod}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <IndianRupee className="w-4 h-4 mr-2" />
                Record Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

