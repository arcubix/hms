/**
 * Refund Processing Component
 * Features: Refund interface with original sale lookup, item selection, and stock return
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { 
  RotateCcw, 
  Search, 
  CheckCircle, 
  XCircle,
  Package,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Sale, Refund, CreateRefundData } from '../../services/api';

export function RefundProcessing() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [refundReason, setRefundReason] = useState('');
  const [returnToStock, setReturnToStock] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [refunds, setRefunds] = useState<Refund[]>([]);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      const data = await api.getRefunds({ limit: 50 });
      setRefunds(data);
    } catch (error: any) {
      console.error('Failed to load refunds:', error);
    }
  };

  const handleSearchSale = async () => {
    if (!invoiceNumber.trim()) {
      toast.error('Please enter an invoice number');
      return;
    }

    try {
      setLoading(true);
      const saleData = await api.getSale(invoiceNumber);
      setSale(saleData);
      setSelectedItems(new Set());
    } catch (error: any) {
      toast.error(error.message || 'Sale not found');
      setSale(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const calculateRefundTotal = () => {
    if (!sale || !sale.items) return 0;
    
    let total = 0;
    sale.items.forEach(item => {
      if (selectedItems.has(item.id)) {
        total += item.subtotal;
      }
    });
    return total;
  };

  const handleProcessRefund = async () => {
    if (!sale || selectedItems.size === 0) {
      toast.error('Please select items to refund');
      return;
    }

    if (!refundReason.trim()) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      setProcessing(true);
      const refundItems = sale.items!
        .filter(item => selectedItems.has(item.id))
        .map(item => ({
          sale_item_id: item.id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          return_to_stock: returnToStock
        }));

      const refundData: CreateRefundData = {
        sale_id: sale.id,
        refund_reason: refundReason,
        payment_method: sale.payment_method === 'Cash' ? 'Cash' : 'Original',
        items: refundItems,
        notes: `Refund processed for invoice ${sale.invoice_number}`
      };

      await api.createRefund(refundData);
      toast.success('Refund processed successfully');
      
      // Reset form
      setSale(null);
      setInvoiceNumber('');
      setSelectedItems(new Set());
      setRefundReason('');
      loadRefunds();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Refund Processing</h2>
        <p className="text-gray-600">Process refunds for sales transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter invoice number (e.g., INV-20240115-0001)"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSale()}
              className="flex-1"
            />
            <Button onClick={handleSearchSale} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {sale && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sale Details - {sale.invoice_number}</CardTitle>
              <Badge variant={sale.status === 'Refunded' ? 'destructive' : 'default'}>
                {sale.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer</Label>
                <p className="font-medium">{sale.customer_name}</p>
                {sale.customer_phone && <p className="text-sm text-gray-500">{sale.customer_phone}</p>}
              </div>
              <div>
                <Label>Sale Date</Label>
                <p>{new Date(sale.sale_date).toLocaleString()}</p>
              </div>
              <div>
                <Label>Total Amount</Label>
                <p className="font-medium text-lg">Rs. {sale.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Badge variant="outline">{sale.payment_method}</Badge>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Select Items to Refund</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                      </TableCell>
                      <TableCell>{item.medicine_name}</TableCell>
                      <TableCell>{item.batch_number}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs. {item.unit_price.toFixed(2)}</TableCell>
                      <TableCell>Rs. {item.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedItems.size > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={returnToStock}
                    onCheckedChange={(checked) => setReturnToStock(checked === true)}
                  />
                  <Label>Return items to stock inventory</Label>
                </div>
                <div>
                  <Label>Refund Reason *</Label>
                  <Textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason for refund..."
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Refund Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      Rs. {calculateRefundTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={handleProcessRefund} 
                  disabled={processing || !refundReason.trim()}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Process Refund'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund #</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell className="font-medium">{refund.refund_number}</TableCell>
                  <TableCell>{refund.invoice_number}</TableCell>
                  <TableCell>{new Date(refund.refund_date).toLocaleDateString()}</TableCell>
                  <TableCell>Rs. {refund.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{refund.refund_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={refund.status === 'Completed' ? 'default' : 'secondary'}
                    >
                      {refund.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

