import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { api, type PaymentReceipt, type PatientPayment } from '../../services/api';
import { Printer, Download, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentReceiptProps {
  payment: PatientPayment;
  onClose?: () => void;
}

export function PaymentReceipt({ payment, onClose }: PaymentReceiptProps) {
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (payment.receipt_number) {
      loadReceipt();
    }
  }, [payment.receipt_number]);

  const loadReceipt = async () => {
    if (!payment.receipt_number) return;
    
    try {
      setLoading(true);
      const receiptData = await api.getPaymentReceipt(payment.receipt_number);
      setReceipt(receiptData);
    } catch (error: any) {
      console.error('Failed to load receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async () => {
    try {
      setGenerating(true);
      const receiptData = await api.generatePaymentReceipt(payment.id);
      setReceipt(receiptData);
      toast.success('Receipt generated successfully');
    } catch (error: any) {
      toast.error('Failed to generate receipt: ' + (error.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (receipt?.receipt_path) {
      window.open(receipt.receipt_path, '_blank');
    } else {
      toast.error('Receipt PDF not available');
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cheque':
        return 'Cheque';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading receipt...</p>
        </CardContent>
      </Card>
    );
  }

  if (!receipt && !payment.receipt_number) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="mb-4">Receipt not generated yet</p>
          <Button onClick={generateReceipt} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Receipt'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 print:p-8">
      {/* Action Buttons (hidden when printing) */}
      <div className="flex gap-2 print:hidden">
        {receipt && (
          <>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </>
        )}
        {!receipt && (
          <Button onClick={generateReceipt} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Receipt'
            )}
          </Button>
        )}
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {/* Receipt Content */}
      <Card className="print:border-0 print:shadow-none">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment Receipt</h1>
            <p className="text-gray-600">Receipt Number: {receipt?.receipt_number || payment.receipt_number}</p>
          </div>

          <Separator className="my-6" />

          {/* Payment Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Number</p>
                <p className="font-semibold">{payment.payment_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="font-semibold">
                  {new Date(payment.payment_date).toLocaleDateString()}
                  {payment.payment_time && ` ${payment.payment_time}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-semibold">{payment.patient_name || `Patient #${payment.patient_id}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient Code</p>
                <p className="font-semibold">{payment.patient_code || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bill Type</p>
                <Badge>{payment.bill_type.toUpperCase()}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">{getMethodLabel(payment.payment_method)}</p>
              </div>
            </div>

            {payment.transaction_id && (
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-semibold">{payment.transaction_id}</p>
              </div>
            )}

            {payment.cheque_number && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cheque Number</p>
                  <p className="font-semibold">{payment.cheque_number}</p>
                </div>
                {payment.bank_name && (
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-semibold">{payment.bank_name}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Amount */}
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Amount Paid</p>
            <p className="text-4xl font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
          </div>

          {payment.notes && (
            <>
              <Separator className="my-6" />
              <div>
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-sm">{payment.notes}</p>
              </div>
            </>
          )}

          <Separator className="my-6" />

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>Thank you for your payment!</p>
            <p className="mt-2">This is a computer-generated receipt.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

