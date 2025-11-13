/**
 * Pharmacy Reports Component
 * Features: Sales reports, profit analysis, and revenue tracking
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { api, SalesSummary, TopSellingMedicine } from '../../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PharmacyReports() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topSelling, setTopSelling] = useState<TopSellingMedicine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [summaryData, topSellingData] = await Promise.all([
        api.getSalesSummary(startDate, endDate),
        api.getTopSellingMedicines(10, startDate, endDate)
      ]);
      setSummary(summaryData);
      setTopSelling(topSellingData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const chartData = topSelling.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    quantity: item.total_quantity_sold,
    revenue: item.total_revenue
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pharmacy Reports</h2>
          <p className="text-gray-600">Sales analysis and revenue reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <span className="text-gray-600">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_sales}</div>
              <p className="text-xs text-gray-500 mt-1">transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rs. {summary.total_revenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">in period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_customers}</div>
              <p className="text-xs text-gray-500 mt-1">unique customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {(summary.total_revenue / (summary.total_sales || 1)).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">per transaction</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Cash</span>
                  <span className="font-medium">Rs. {summary.cash_sales.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Card</span>
                  <span className="font-medium">Rs. {summary.card_sales.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Insurance</span>
                  <span className="font-medium">Rs. {summary.insurance_sales.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSelling.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.total_quantity_sold} units</div>
                  </div>
                  <div className="font-medium">Rs. {item.total_revenue.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Medicines Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (Rs.)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

