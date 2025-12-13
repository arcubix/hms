import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft,
  Download,
  Printer,
  Mail,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Building
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { api } from '../../services/api';
import { toast } from 'sonner@2.0.3';
import type { Invoice, Payment } from '../../types/billing';

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

export function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);
  
  const handleBack = () => {
    // Clear hash and call onBack
    window.location.hash = '';
    if (onBack) {
      onBack();
    }
  };

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      const invoiceResponse = await api.getInvoice(parseInt(invoiceId));
      if (invoiceResponse.success) {
        setInvoice(invoiceResponse.data);
        
        // Load payments for this invoice
        const paymentsResponse = await api.getInvoicePayments(parseInt(invoiceId));
        if (paymentsResponse.success) {
          setPayments(paymentsResponse.data);
        }
      } else {
        toast.error('Failed to load invoice');
        handleBack();
      }
    } catch (error: any) {
      toast.error('Failed to load invoice', { description: error?.message });
      handleBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    try {
      const response = await api.sendInvoice(invoice.id);
      if (response.success) {
        toast.success('Invoice sent successfully');
        loadInvoiceData();
      } else {
        toast.error('Failed to send invoice');
      }
    } catch (error: any) {
      toast.error('Failed to send invoice', { description: error?.message });
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice?.pdf_path) {
      toast.error('PDF not available');
      return;
    }
    // TODO: Implement PDF download
    toast.info('PDF download feature coming soon');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="w-full h-full bg-gray-50 p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Invoice not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = invoice.subtotal;
  const tax = invoice.tax_amount;
  const discount = invoice.discount;
  const total = invoice.total_amount;
  const amountPaid = invoice.paid_amount;
  const balance = invoice.due_amount;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
      case 'partial':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'sent': return 'Sent';
      case 'partial': return 'Partially Paid';
      case 'overdue': return 'Overdue';
      case 'draft': return 'Draft';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Invoice Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {invoice.invoice_number}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSendInvoice} disabled={invoice.payment_status === 'paid'}>
                <Mail className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24 space-y-6">
        {/* Invoice Status Card */}
      <Card className={`border-0 shadow-sm border-l-4 ${
        invoice.payment_status === 'paid' ? 'border-green-500' :
        invoice.payment_status === 'overdue' ? 'border-red-500' :
        'border-yellow-500'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                invoice.payment_status === 'paid' ? 'bg-green-50' :
                invoice.payment_status === 'overdue' ? 'bg-red-50' :
                'bg-yellow-50'
              }`}>
                {getStatusIcon(invoice.payment_status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice Status</p>
                <Badge className={`${getStatusColor(invoice.payment_status)} text-base px-3 py-1`}>
                  {getStatusLabel(invoice.payment_status)}
                </Badge>
                {invoice.paid_at && (
                  <p className="text-xs text-gray-600 mt-1">
                    Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl text-gray-900">Rs. {total.toLocaleString()}</p>
              {balance > 0 && (
                <p className="text-sm text-red-600 mt-1">Balance: Rs. {balance.toLocaleString()}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="w-5 h-5 text-blue-600" />
              Bill To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-900 font-semibold">{invoice.organization_name}</p>
            <p className="text-sm text-gray-600">Code: {invoice.organization_code}</p>
            {/* Note: Organization address would need to be loaded separately if needed */}
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5 text-green-600" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invoice Number:</span>
              <span className="text-sm text-gray-900 font-semibold">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invoice Date:</span>
              <span className="text-sm text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Due Date:</span>
              <span className="text-sm text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>
            {invoice.billing_period_start && invoice.billing_period_end && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Billing Period:</span>
                <span className="text-sm text-gray-900">
                  {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Invoice Type:</span>
              <Badge variant="outline">{invoice.invoice_type}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.items && invoice.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.item_type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">Rs. {item.unit_price.toLocaleString()}</TableCell>
                      <TableCell className="text-right">Rs. {item.discount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">Rs. {item.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount ({invoice.discount_percentage}%):</span>
                    <span className="text-gray-900">- Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({invoice.tax_rate}%):</span>
                    <span className="text-gray-900">Rs. {tax.toLocaleString()}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid:</span>
                  <span className="text-green-600">Rs. {amountPaid.toLocaleString()}</span>
                </div>
                {balance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due:</span>
                    <span className="text-red-600 font-semibold">Rs. {balance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-4">No items found</p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Number</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{payment.payment_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        {payment.payment_method.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{payment.transaction_id || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      Rs. {payment.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right text-gray-900 font-semibold">
                    Total Paid:
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    Rs. {amountPaid.toLocaleString()}
                  </TableCell>
                </TableRow>
                {balance > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-right text-gray-900 font-semibold">
                      Balance Due:
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">
                      Rs. {balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No payments recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {(invoice.notes || invoice.terms) && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.notes && (
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Notes:</p>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-sm font-semibold mb-2">Terms:</p>
                <p className="text-sm text-gray-600">{invoice.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
