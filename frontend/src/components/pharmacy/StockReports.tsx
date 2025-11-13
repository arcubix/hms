/**
 * Stock Reports Component
 * Features: Expiry tracking, stock valuation, and inventory analysis
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Package, 
  AlertTriangle,
  Calendar,
  DollarSign,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { api, PharmacyStock, ExpiringStock } from '../../services/api';

export function StockReports() {
  const [stock, setStock] = useState<PharmacyStock[]>([]);
  const [expiringStock, setExpiringStock] = useState<ExpiringStock[]>([]);
  const [expiringDays, setExpiringDays] = useState(90);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStock();
    loadExpiringStock();
  }, [expiringDays]);

  const loadStock = async () => {
    try {
      setLoading(true);
      const data = await api.getPharmacyStock({ status: 'Active' });
      setStock(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const loadExpiringStock = async () => {
    try {
      const data = await api.getExpiringStock(expiringDays);
      setExpiringStock(data);
    } catch (error: any) {
      console.error('Failed to load expiring stock:', error);
    }
  };

  const calculateStockValue = () => {
    return stock.reduce((total, item) => total + (item.quantity * item.cost_price), 0);
  };

  const calculateSellingValue = () => {
    return stock.reduce((total, item) => total + (item.quantity * item.selling_price), 0);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Reports</h2>
          <p className="text-gray-600">Inventory valuation and expiry tracking</p>
        </div>
        <Button variant="outline" onClick={loadStock}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value (Cost)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Rs. {calculateStockValue().toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">at cost price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value (Selling)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. {calculateSellingValue().toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">at selling price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Potential Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Rs. {(calculateSellingValue() - calculateStockValue()).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">if all stock sold</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Expiring Stock
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={expiringDays}
                onChange={(e) => setExpiringDays(parseInt(e.target.value) || 90)}
                className="w-24"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Until Expiry</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Value at Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No expiring stock found
                  </TableCell>
                </TableRow>
              ) : (
                expiringStock.map((item) => {
                  const days = getDaysUntilExpiry(item.expiry_date);
                  return (
                    <TableRow key={item.stock_id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                      </TableCell>
                      <TableCell>{item.batch_number}</TableCell>
                      <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={days <= 7 ? 'destructive' : days <= 30 ? 'default' : 'secondary'}>
                          {days} days
                        </Badge>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Rs. {(item.quantity * 0).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Summary by Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Batches</TableHead>
                <TableHead>Total Value (Cost)</TableHead>
                <TableHead>Total Value (Selling)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : stock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No stock found
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(
                  stock.reduce((acc, item) => {
                    const key = item.medicine_id;
                    if (!acc[key]) {
                      acc[key] = {
                        medicine_name: item.medicine_name || 'Unknown',
                        total_quantity: 0,
                        batches: 0,
                        total_cost: 0,
                        total_selling: 0
                      };
                    }
                    acc[key].total_quantity += item.quantity;
                    acc[key].batches += 1;
                    acc[key].total_cost += (item.quantity * item.cost_price);
                    acc[key].total_selling += (item.quantity * item.selling_price);
                    return acc;
                  }, {} as Record<number, any>)
                ).map(([medicineId, data]: [string, any]) => (
                  <TableRow key={medicineId}>
                    <TableCell className="font-medium">{data.medicine_name}</TableCell>
                    <TableCell>{data.total_quantity}</TableCell>
                    <TableCell>{data.batches}</TableCell>
                    <TableCell>Rs. {data.total_cost.toFixed(2)}</TableCell>
                    <TableCell>Rs. {data.total_selling.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

