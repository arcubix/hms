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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [returnQuantities, setReturnQuantities] = useState<Map<number, number>>(new Map()); // item_id -> quantity to return
  const [alreadyReturned, setAlreadyReturned] = useState<Map<number, number>>(new Map()); // item_id -> already returned quantity
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
      setShowSearchResults(false);
      
      // Try to get sale - this will return a single sale or a list of matching sales
      const result = await api.getSale(invoiceNumber);
      
      // Check if result is an array (multiple matches) or a single sale object
      if (Array.isArray(result)) {
        // Multiple matches - show selection list
        setSearchResults(result);
        setShowSearchResults(true);
        setSale(null);
      } else if (result && result.id) {
        // Single match - load it directly
        await loadSaleDetails(result);
      } else {
        toast.error('Sale not found');
        setSale(null);
      }
    } catch (error: any) {
      // If error, try using search API
      try {
        const sales = await api.getSales({ search: invoiceNumber, limit: 10 });
        if (sales.length === 1) {
          await loadSaleDetails(sales[0]);
        } else if (sales.length > 1) {
          setSearchResults(sales);
          setShowSearchResults(true);
          setSale(null);
        } else {
          toast.error('Sale not found');
          setSale(null);
        }
      } catch (searchError: any) {
        toast.error(error.message || 'Sale not found');
        setSale(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSaleDetails = async (saleData: any) => {
    // If saleData doesn't have full details, fetch it
    let fullSale = saleData;
    if (!saleData.items) {
      fullSale = await api.getSale(saleData.id || saleData.invoice_number);
    }
    
    setSale(fullSale);
    setSelectedItems(new Set());
    setReturnQuantities(new Map());
    setShowSearchResults(false);
    
    // Load existing refunds to calculate already returned quantities
    if (fullSale && fullSale.id) {
      const alreadyReturnedMap = new Map<number, number>();
      try {
        // Get refunds for this sale using the filter parameter
        const existingRefunds = await api.getRefunds({ sale_id: fullSale.id });
        console.log('Existing refunds for sale:', existingRefunds);
        
        if (fullSale.items) {
          fullSale.items.forEach((item: any) => {
            let totalReturned = 0;
            existingRefunds.forEach((refund: any) => {
              // Count all refunds except cancelled/voided ones
              if (refund.items && refund.status !== 'Cancelled' && refund.status !== 'Voided') {
                refund.items.forEach((refundItem: any) => {
                  // Match by sale_item_id (can be number or string)
                  const refundSaleItemId = typeof refundItem.sale_item_id === 'string' 
                    ? parseInt(refundItem.sale_item_id) 
                    : refundItem.sale_item_id;
                  const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                  
                  if (refundSaleItemId === itemId) {
                    totalReturned += parseFloat(refundItem.quantity?.toString() || '0');
                  }
                });
              }
            });
            console.log(`Item ${item.id} (${item.medicine_name}): Already returned = ${totalReturned}`);
            alreadyReturnedMap.set(item.id, totalReturned);
          });
        }
        setAlreadyReturned(alreadyReturnedMap);
      } catch (error) {
        console.error('Failed to load existing refunds:', error);
      }
    }
  };

  const handleSelectSearchResult = async (sale: any) => {
    await loadSaleDetails(sale);
  };

  const toggleItemSelection = (itemId: number, originalQuantity: number) => {
    const newSelected = new Set(selectedItems);
    const newQuantities = new Map(returnQuantities);
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      newQuantities.delete(itemId);
    } else {
      newSelected.add(itemId);
      // Set default quantity to remaining quantity
      const alreadyReturnedQty = alreadyReturned.get(itemId) || 0;
      const remainingQty = originalQuantity - alreadyReturnedQty;
      newQuantities.set(itemId, remainingQty > 0 ? remainingQty : originalQuantity);
    }
    setSelectedItems(newSelected);
    setReturnQuantities(newQuantities);
  };

  const updateReturnQuantity = (itemId: number, quantity: number, maxQuantity: number) => {
    const newQuantities = new Map(returnQuantities);
    const qty = Math.max(0, Math.min(quantity, maxQuantity));
    newQuantities.set(itemId, qty);
    setReturnQuantities(newQuantities);
  };

  const calculateRefundTotal = () => {
    if (!sale || !sale.items) return 0;
    
    let total = 0;
    sale.items.forEach(item => {
      if (selectedItems.has(item.id)) {
        const returnQty = returnQuantities.get(item.id) || 0;
        const unitPrice = parseFloat(item.unit_price?.toString() || '0');
        total += returnQty * unitPrice;
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
        .map(item => {
          const returnQty = returnQuantities.get(item.id) || 0;
          const unitPrice = parseFloat(item.unit_price?.toString() || '0');
          return {
            sale_item_id: item.id,
            medicine_id: item.medicine_id,
            quantity: returnQty,
            unit_price: unitPrice,
            subtotal: returnQty * unitPrice,
            return_to_stock: returnToStock
          };
        })
        .filter(item => item.quantity > 0); // Only include items with quantity > 0

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
              placeholder="Enter invoice number or partial match (e.g., INV-20240115-0001 or 0001)"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                setShowSearchResults(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSale()}
              className="flex-1"
            />
            <Button onClick={handleSearchSale} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-4 border rounded-lg max-h-60 overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b">
                <p className="text-sm font-medium text-gray-700">
                  Found {searchResults.length} matching invoice{searchResults.length > 1 ? 's' : ''}:
                </p>
              </div>
              <div className="divide-y">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{result.invoice_number}</p>
                        <p className="text-sm text-gray-600">
                          {result.customer_name || 'Walk-in Customer'} • {new Date(result.sale_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">Rs. {parseFloat(result.total_amount?.toString() || '0').toFixed(2)}</p>
                        <Badge variant={result.status === 'Voided' ? 'destructive' : 'default'} className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                <p className="font-medium text-lg">Rs. {parseFloat(sale.total_amount?.toString() || '0').toFixed(2)}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Badge variant="outline">{sale.payment_method}</Badge>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Select Items to Refund</Label>
              {(() => {
                // Filter items to only show those with remaining quantity > 0
                const availableItems = sale.items?.filter((item: any) => {
                  const originalQty = parseFloat(item.quantity?.toString() || '0');
                  const alreadyReturnedQty = alreadyReturned.get(item.id) || 0;
                  const remainingQty = originalQty - alreadyReturnedQty;
                  return remainingQty > 0;
                }) || [];

                if (availableItems.length === 0) {
                  return (
                    <div className="p-8 text-center border rounded-lg bg-gray-50">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">All items have been fully returned</p>
                      <p className="text-sm text-gray-500 mt-1">No items available for refund</p>
                    </div>
                  );
                }

                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Original Qty</TableHead>
                        <TableHead>Already Returned</TableHead>
                        <TableHead>Return Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableItems.map((item: any) => {
                        const originalQty = parseFloat(item.quantity?.toString() || '0');
                        const alreadyReturnedQty = alreadyReturned.get(item.id) || 0;
                        const remainingQty = originalQty - alreadyReturnedQty;
                        const returnQty = returnQuantities.get(item.id) || 0;
                        const unitPrice = parseFloat(item.unit_price?.toString() || '0');
                        const isSelected = selectedItems.has(item.id);
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleItemSelection(item.id, originalQty)}
                              />
                            </TableCell>
                            <TableCell>{item.medicine_name}</TableCell>
                            <TableCell>{item.batch_number}</TableCell>
                            <TableCell>
                              <span className="font-medium">{originalQty}</span>
                            </TableCell>
                            <TableCell>
                              {alreadyReturnedQty > 0 ? (
                                <span className="text-orange-600 font-medium">{alreadyReturnedQty}</span>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isSelected ? (
                                <Input
                                  type="number"
                                  min="1"
                                  max={remainingQty}
                                  value={returnQty}
                                  onChange={(e) => updateReturnQuantity(item.id, parseInt(e.target.value) || 0, remainingQty)}
                                  className="w-20 h-8"
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>Rs. {unitPrice.toFixed(2)}</TableCell>
                            <TableCell>
                              {isSelected ? (
                                <span className="font-medium">
                                  Rs. {(returnQty * unitPrice).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                );
              })()}
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
                      Rs. {parseFloat(calculateRefundTotal().toString() || '0').toFixed(2)}
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
                  <TableCell>Rs. {parseFloat(refund.total_amount?.toString() || '0').toFixed(2)}</TableCell>
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

