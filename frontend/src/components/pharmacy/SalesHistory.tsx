/**
 * Sales History Component
 * Features: Sales listing, search, filters, invoice viewing, and reprinting
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Receipt, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  Calendar,
  Download,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Sale, SaleInvoice } from '../../services/api';

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [invoiceData, setInvoiceData] = useState<SaleInvoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  useEffect(() => {
    loadSales();
  }, [statusFilter, paymentMethodFilter, startDate, endDate]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (paymentMethodFilter !== 'all') filters.payment_method = paymentMethodFilter;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      
      const data = await api.getSales(filters);
      setSales(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (sale: Sale) => {
    try {
      const invoice = await api.getSaleInvoice(sale.id);
      setInvoiceData(invoice);
      setSelectedSale(sale);
      setShowInvoiceDialog(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load invoice');
    }
  };

  const handlePrintInvoice = () => {
    if (!invoiceData) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoiceData.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>MediCare Hospital</h1>
              <h2>Pharmacy Invoice</h2>
            </div>
            <div class="invoice-info">
              <p><strong>Invoice Number:</strong> ${invoiceData.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(invoiceData.sale_date).toLocaleString()}</p>
              <p><strong>Customer:</strong> ${invoiceData.customer.name}</p>
              <p><strong>Phone:</strong> ${invoiceData.customer.phone}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items.map(item => `
                  <tr>
                    <td>${item.medicine_name}</td>
                    <td>${item.batch_number}</td>
                    <td>${item.quantity}</td>
                    <td>Rs. ${(Number(item.unit_price) || 0).toFixed(2)}</td>
                    <td>${item.discount_percentage}%</td>
                    <td>Rs. ${(Number(item.subtotal) || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <p>Subtotal: Rs. ${(Number(invoiceData.subtotal) || 0).toFixed(2)}</p>
              <p>Discount: Rs. ${(Number(invoiceData.discount_amount) || 0).toFixed(2)}</p>
              <p>Tax: Rs. ${(Number(invoiceData.tax_amount) || 0).toFixed(2)}</p>
              <p><strong>Total: Rs. ${(Number(invoiceData.total_amount) || 0).toFixed(2)}</strong></p>
              <p>Payment Method: ${invoiceData.payment_method}</p>
              ${invoiceData.amount_received ? `<p>Amount Received: Rs. ${(Number(invoiceData.amount_received) || 0).toFixed(2)}</p>` : ''}
              ${invoiceData.change_amount > 0 ? `<p>Change: Rs. ${(Number(invoiceData.change_amount) || 0).toFixed(2)}</p>` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
          <p className="text-gray-600">View and manage sales transactions</p>
        </div>
        <Button variant="outline" onClick={loadSales}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by invoice, customer, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSales()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="w-40"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              className="w-40"
            />
            <Button onClick={loadSales}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No sales found
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                    <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.customer_name}</div>
                        {sale.customer_phone && (
                          <div className="text-sm text-gray-500">{sale.customer_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sale.items?.length || 0} items</TableCell>
                    <TableCell className="font-medium">Rs. {(Number(sale.total_amount) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.payment_method}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          sale.status === 'Completed' ? 'default' :
                          sale.status === 'Pending' ? 'secondary' :
                          sale.status === 'Cancelled' ? 'destructive' : 'outline'
                        }
                      >
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(sale)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice {invoiceData?.invoice_number}</DialogTitle>
            <DialogDescription>
              {invoiceData && new Date(invoiceData.sale_date).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {invoiceData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {invoiceData.customer.name}</p>
                  <p><strong>Phone:</strong> {invoiceData.customer.phone}</p>
                  <p><strong>Email:</strong> {invoiceData.customer.email}</p>
                  <p><strong>Address:</strong> {invoiceData.customer.address}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <p><strong>Method:</strong> {invoiceData.payment_method}</p>
                  {invoiceData.amount_received && (
                    <p><strong>Amount Received:</strong> Rs. {(Number(invoiceData.amount_received) || 0).toFixed(2)}</p>
                  )}
                  {invoiceData.change_amount > 0 && (
                    <p><strong>Change:</strong> Rs. {(Number(invoiceData.change_amount) || 0).toFixed(2)}</p>
                  )}
                  <p><strong>Cashier:</strong> {invoiceData.cashier}</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.medicine_name}</TableCell>
                      <TableCell>{item.batch_number}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs. {(Number(item.unit_price) || 0).toFixed(2)}</TableCell>
                      <TableCell>{item.discount_percentage}%</TableCell>
                      <TableCell>Rs. {(Number(item.subtotal) || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-4">
                <div className="flex justify-end space-x-4">
                  <div className="text-right">
                    <p>Subtotal: Rs. {(Number(invoiceData.subtotal) || 0).toFixed(2)}</p>
                    <p>Discount: Rs. {(Number(invoiceData.discount_amount) || 0).toFixed(2)}</p>
                    <p>Tax: Rs. {(Number(invoiceData.tax_amount) || 0).toFixed(2)}</p>
                    <p className="text-lg font-bold mt-2">Total: Rs. {(Number(invoiceData.total_amount) || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                  Close
                </Button>
                <Button onClick={handlePrintInvoice}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

