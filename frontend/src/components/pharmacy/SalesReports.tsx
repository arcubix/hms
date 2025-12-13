import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  ShoppingBag,
  Users,
  Pill,
  BarChart3,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { api, SalesSummary, DailySalesReport, TopSellingMedicine, Sale } from '../../services/api';
import { toast } from 'sonner';

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757', '#9B51E0'];

export function SalesReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedCashier, setSelectedCashier] = useState('all');
  const [loading, setLoading] = useState(false);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesReport[]>([]);
  const [topSellingMedicines, setTopSellingMedicines] = useState<TopSellingMedicine[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Sale[]>([]);
  const [categoryWiseSales, setCategoryWiseSales] = useState<Array<{category: string; sales: number; percentage: number}>>([]);
  
  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Load all data in parallel
      const [summary, daily, topSelling, sales] = await Promise.all([
        api.getSalesSummary(),
        api.getDailySalesReport(startDateStr, endDateStr),
        api.getTopSellingMedicines(10, startDateStr, endDateStr),
        api.getSales({ limit: 10, start_date: startDateStr, end_date: endDateStr })
      ]);
      
      setSalesSummary(summary);
      setDailySales(daily);
      setTopSellingMedicines(topSelling);
      setRecentTransactions(sales);
      
      // Calculate category-wise sales from sales data
      const categoryMap: { [key: string]: number } = {};
      let totalCategorySales = 0;
      
      sales.forEach(sale => {
        if (sale.items) {
          sale.items.forEach((item: any) => {
            const category = item.medicine_category || 'Other';
            const amount = parseFloat(item.subtotal?.toString() || '0');
            categoryMap[category] = (categoryMap[category] || 0) + amount;
            totalCategorySales += amount;
          });
        }
      });
      
      const categoryData = Object.entries(categoryMap)
        .map(([category, sales]) => ({
          category,
          sales: Math.round(sales),
          percentage: totalCategorySales > 0 ? Math.round((sales / totalCategorySales) * 100) : 0
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      
      setCategoryWiseSales(categoryData);
    } catch (error: any) {
      console.error('Failed to load report data:', error);
      toast.error('Failed to load sales reports');
    } finally {
      setLoading(false);
    }
  };
  
  // Transform daily sales for chart
  const salesData = dailySales.map(d => ({
    day: new Date(d.sale_day).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: parseFloat(d.daily_revenue?.toString() || '0'),
    transactions: d.transaction_count || 0,
    customers: d.transaction_count || 0 // Approximate
  }));
  
  // Transform top selling medicines for display
  const topSellingDisplay = topSellingMedicines.map((med, index) => ({
    name: med.name || 'Unknown',
    quantity: med.total_quantity_sold || 0,
    revenue: parseFloat(med.total_revenue?.toString() || '0'),
    color: COLORS[index % COLORS.length]
  }));

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Card': return 'bg-blue-100 text-blue-800';
      case 'Insurance': return 'bg-purple-100 text-purple-800';
      case 'Wallet': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">Sales Reports & Analytics</h1>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadReportData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl text-gray-900">
                  PKR {salesSummary ? parseFloat(salesSummary.total_revenue?.toString() || '0').toLocaleString() : '0'}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">{salesSummary?.total_sales || 0} transactions</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-2xl text-gray-900">{salesSummary?.total_sales || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-500">Total count</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customers</p>
                <p className="text-2xl text-gray-900">{salesSummary?.total_customers || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-500">Unique customers</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Transaction</p>
                <p className="text-2xl text-gray-900">
                  PKR {salesSummary && salesSummary.total_sales > 0 
                    ? (parseFloat(salesSummary.total_revenue?.toString() || '0') / salesSummary.total_sales).toFixed(2)
                    : '0.00'}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-500">Average value</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Weekly Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : salesData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No sales data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#2F80ED" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Medicines */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Top Selling Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : topSellingDisplay.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No top selling medicines data available
              </div>
            ) : (
              <div className="space-y-4">
                {topSellingDisplay.map((medicine, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: medicine.color }}
                      />
                      <div>
                        <p className="text-sm text-gray-900">{medicine.name}</p>
                        <p className="text-xs text-gray-600">{medicine.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">PKR {medicine.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Sales & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category-wise Sales */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : categoryWiseSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No category sales data available
              </div>
            ) : (
              <div className="space-y-4">
                {categoryWiseSales.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900">{category.category}</span>
                      <span className="text-gray-600">PKR {category.sales.toLocaleString()} ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Recent Transactions
            </CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent transactions found
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{transaction.customer_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{new Date(transaction.sale_date).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>{transaction.items?.length || 0} items</span>
                          {transaction.cashier_name && (
                            <>
                              <span>•</span>
                              <span>by {transaction.cashier_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">PKR {parseFloat(transaction.total_amount?.toString() || '0').toFixed(2)}</p>
                      <Badge className={getPaymentMethodColor(transaction.payment_method)}>
                        {transaction.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sales Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detailed Sales Report</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedCashier} onValueChange={setSelectedCashier}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cashiers</SelectItem>
                <SelectItem value="alice">Alice Johnson</SelectItem>
                <SelectItem value="bob">Bob Wilson</SelectItem>
                <SelectItem value="carol">Carol Davis</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Cashier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-gray-900">{transaction.invoice_number}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(transaction.sale_date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">{transaction.customer_name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{transaction.items?.length || 0}</TableCell>
                    <TableCell className="text-sm text-gray-900">
                      PKR {parseFloat(transaction.total_amount?.toString() || '0').toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentMethodColor(transaction.payment_method)}>
                        {transaction.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{transaction.cashier_name || 'N/A'}</TableCell>
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