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

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

export function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  // Mock invoice data
  const invoice = {
    id: 'INV-2024-001234',
    patientId: 'P001',
    patientName: 'John Smith',
    dateIssued: '2024-01-15',
    dateDue: '2024-02-15',
    status: 'Paid',
    paymentMethod: 'Credit Card',
    paymentDate: '2024-01-16',
    billTo: {
      name: 'John Smith',
      address: '123 Main Street',
      city: 'New York, NY 10001',
      phone: '+1 234-567-8901',
      email: 'john.smith@email.com'
    },
    hospital: {
      name: 'City General Hospital',
      address: '456 Hospital Ave',
      city: 'New York, NY 10002',
      phone: '+1 234-567-9000',
      email: 'billing@cityhospital.com',
      taxId: 'TAX123456789'
    },
    items: [
      {
        description: 'Consultation - Dr. Michael Chen',
        department: 'Cardiology',
        date: '2024-01-15',
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00
      },
      {
        description: 'ECG Test',
        department: 'Cardiology',
        date: '2024-01-15',
        quantity: 1,
        unitPrice: 75.00,
        total: 75.00
      },
      {
        description: 'Complete Blood Count',
        department: 'Laboratory',
        date: '2024-01-15',
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00
      },
      {
        description: 'Lipid Panel',
        department: 'Laboratory',
        date: '2024-01-15',
        quantity: 1,
        unitPrice: 60.00,
        total: 60.00
      },
      {
        description: 'Lisinopril 10mg (30 tablets)',
        department: 'Pharmacy',
        date: '2024-01-15',
        quantity: 1,
        unitPrice: 25.00,
        total: 25.00
      },
      {
        description: 'Metformin 500mg (60 tablets)',
        department: 'Pharmacy',
        date: '2024-01-15',
        quantity: 1,
        unitPrice: 35.00,
        total: 35.00
      }
    ],
    payments: [
      {
        date: '2024-01-16',
        method: 'Credit Card',
        reference: 'CC-2024-5678',
        amount: 425.00
      }
    ]
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const amountPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = total - amountPaid;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Partially Paid':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl text-gray-900">Invoice Details</h1>
            <p className="text-sm text-gray-600">{invoice.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Status Card */}
      <Card className="border-0 shadow-sm border-l-4 border-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center">
                {getStatusIcon(invoice.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice Status</p>
                <Badge className={`${getStatusColor(invoice.status)} text-base px-3 py-1`}>
                  {invoice.status}
                </Badge>
                {invoice.status === 'Paid' && invoice.paymentDate && (
                  <p className="text-xs text-gray-600 mt-1">
                    Paid on {new Date(invoice.paymentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl text-gray-900">${total.toFixed(2)}</p>
              {balance > 0 && (
                <p className="text-sm text-red-600 mt-1">Balance: ${balance.toFixed(2)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="w-5 h-5 text-blue-600" />
              From
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-900">{invoice.hospital.name}</p>
            <p className="text-sm text-gray-600">{invoice.hospital.address}</p>
            <p className="text-sm text-gray-600">{invoice.hospital.city}</p>
            <p className="text-sm text-gray-600">Phone: {invoice.hospital.phone}</p>
            <p className="text-sm text-gray-600">Email: {invoice.hospital.email}</p>
            <p className="text-sm text-gray-600">Tax ID: {invoice.hospital.taxId}</p>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-green-600" />
              Bill To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-900">{invoice.billTo.name}</p>
            <p className="text-sm text-gray-600">Patient ID: {invoice.patientId}</p>
            <p className="text-sm text-gray-600">{invoice.billTo.address}</p>
            <p className="text-sm text-gray-600">{invoice.billTo.city}</p>
            <p className="text-sm text-gray-600">Phone: {invoice.billTo.phone}</p>
            <p className="text-sm text-gray-600">Email: {invoice.billTo.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Dates */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Invoice Number</p>
                <p className="text-sm text-gray-900">{invoice.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Date Issued</p>
                <p className="text-sm text-gray-900">{new Date(invoice.dateIssued).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Due Date</p>
                <p className="text-sm text-gray-900">{new Date(invoice.dateDue).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.department}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (8%):</span>
              <span className="text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
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
          {invoice.payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        {payment.method}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{payment.reference}</TableCell>
                    <TableCell className="text-right text-green-600">${payment.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-gray-900">
                    Total Paid:
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    ${amountPaid.toFixed(2)}
                  </TableCell>
                </TableRow>
                {balance > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right text-gray-900">
                      Balance Due:
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ${balance.toFixed(2)}
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

      {/* Invoice Actions */}
      {balance > 0 && (
        <Card className="border-0 shadow-sm bg-blue-50 border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900 mb-1">Outstanding Balance</p>
                <p className="text-2xl text-blue-600">${balance.toFixed(2)}</p>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Thank you for choosing City General Hospital. For any billing inquiries, please contact our billing department at billing@cityhospital.com or call +1 234-567-9000.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Payment is due within 30 days of the invoice date. Late payments may be subject to additional fees.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
