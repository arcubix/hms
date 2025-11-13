/**
 * Stock Receiving Component
 * Features: Receiving stock from suppliers with batch number entry and expiry date tracking
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  Package, 
  Plus, 
  Truck,
  CheckCircle,
  X,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { api, PurchaseOrder, CreateStockReceiptData, Medicine } from '../../services/api';

export function StockReceiving() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receiptItems, setReceiptItems] = useState<Array<{
    medicine_id: number;
    medicine_name: string;
    batch_number: string;
    manufacture_date: string;
    expiry_date: string;
    quantity: number;
    cost_price: number;
    selling_price: number;
    location: string;
    purchase_order_item_id?: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadPendingPOs();
  }, []);

  const loadPendingPOs = async () => {
    try {
      setLoading(true);
      const data = await api.getPurchaseOrders({ status: 'Approved' });
      setPurchaseOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    // Initialize receipt items from PO items
    const items = po.items?.map(item => ({
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name || '',
      batch_number: '',
      manufacture_date: '',
      expiry_date: '',
      quantity: item.quantity - (item.received_quantity || 0),
      cost_price: item.unit_cost,
      selling_price: item.unit_cost * 1.5, // Default markup
      location: '',
      purchase_order_item_id: item.id
    })) || [];
    setReceiptItems(items);
    setShowDialog(true);
  };

  const updateReceiptItem = (index: number, field: string, value: any) => {
    const newItems = [...receiptItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setReceiptItems(newItems);
  };

  const handleReceiveStock = async () => {
    if (!selectedPO) return;

    // Validate all items have required fields
    for (const item of receiptItems) {
      if (!item.batch_number || !item.expiry_date || !item.quantity || item.quantity <= 0) {
        toast.error('Please fill all required fields for all items');
        return;
      }
    }

    try {
      setProcessing(true);
      const receiptData: CreateStockReceiptData = {
        receipt_date: new Date().toISOString().split('T')[0],
        notes: `Stock received for PO ${selectedPO.po_number}`,
        items: receiptItems.map(item => ({
          medicine_id: item.medicine_id,
          batch_number: item.batch_number,
          manufacture_date: item.manufacture_date || undefined,
          expiry_date: item.expiry_date,
          quantity: item.quantity,
          cost_price: item.cost_price,
          selling_price: item.selling_price,
          location: item.location || undefined,
          purchase_order_item_id: item.purchase_order_item_id
        }))
      };

      await api.receiveStockFromPO(selectedPO.id, receiptData);
      toast.success('Stock received successfully');
      setShowDialog(false);
      setSelectedPO(null);
      setReceiptItems([]);
      loadPendingPOs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to receive stock');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Receiving</h2>
          <p className="text-gray-600">Receive stock from approved purchase orders</p>
        </div>
        <Button variant="outline" onClick={loadPendingPOs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No approved purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.po_number}</TableCell>
                    <TableCell>{po.supplier_name}</TableCell>
                    <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>{po.items?.length || 0}</TableCell>
                    <TableCell>Rs. {po.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleSelectPO(po)}>
                        <Truck className="w-4 h-4 mr-2" />
                        Receive Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Receiving Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receive Stock - {selectedPO?.po_number}</DialogTitle>
            <DialogDescription>
              Enter batch numbers and expiry dates for received items
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch Number *</TableHead>
                    <TableHead>Manufacture Date</TableHead>
                    <TableHead>Expiry Date *</TableHead>
                    <TableHead>Quantity *</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="font-medium">{item.medicine_name}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.batch_number}
                          onChange={(e) => updateReceiptItem(idx, 'batch_number', e.target.value)}
                          placeholder="BATCH001"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.manufacture_date}
                          onChange={(e) => updateReceiptItem(idx, 'manufacture_date', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) => updateReceiptItem(idx, 'expiry_date', e.target.value)}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateReceiptItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.cost_price}
                          onChange={(e) => updateReceiptItem(idx, 'cost_price', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.selling_price}
                          onChange={(e) => updateReceiptItem(idx, 'selling_price', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.location}
                          onChange={(e) => updateReceiptItem(idx, 'location', e.target.value)}
                          placeholder="Shelf A-1"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReceiveStock} disabled={processing}>
                  {processing ? 'Processing...' : 'Receive Stock'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

