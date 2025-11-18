/**
 * POS Reports Component
 * Features: 6 basic POS reports for sales analysis
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Download,
  Calendar,
  RefreshCw,
  Users,
  ShoppingBag,
  CreditCard,
  Clock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  api, 
  SalesSummary, 
  TopSellingMedicine,
  DailySalesReport,
  PaymentMethodBreakdown,
  CashierPerformance,
  ShiftSummary
} from '../../services/api';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Helper function to safely convert to number and format
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value) || 0;
  return num.toFixed(2);
};

const formatNumber = (value: any): number => {
  return typeof value === 'string' ? parseFloat(value) : Number(value) || 0;
};

export function POSReports() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);

  // Report data states
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesReport[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodBreakdown[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingMedicine[]>([]);
  const [cashierPerformance, setCashierPerformance] = useState<CashierPerformance[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary[]>([]);

  useEffect(() => {
    loadReportData(activeTab);
  }, [startDate, endDate, activeTab]);

  const loadReportData = async (tab: string) => {
    try {
      setLoading(true);
      switch (tab) {
        case 'summary':
          const summary = await api.getSalesSummary(startDate, endDate);
          setSalesSummary(summary);
          break;
        case 'daily':
          const daily = await api.getDailySalesReport(startDate, endDate);
          setDailySales(daily);
          break;
        case 'payment':
          const payment = await api.getPaymentMethodReport(startDate, endDate);
          setPaymentMethods(payment);
          break;
        case 'top-selling':
          const top = await api.getTopSellingMedicines(20, startDate, endDate);
          setTopSelling(top);
          break;
        case 'cashier':
          const cashier = await api.getCashierPerformanceReport(startDate, endDate);
          setCashierPerformance(cashier);
          break;
        case 'shift':
          const shift = await api.getShiftSummaryReport(startDate, endDate);
          setShiftSummary(shift);
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const renderSalesSummary = () => (
    <div className="space-y-6">
      {salesSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesSummary.total_sales}</div>
                <p className="text-xs text-gray-500 mt-1">transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Rs. {formatCurrency(salesSummary.total_revenue)}</div>
                <p className="text-xs text-gray-500 mt-1">in period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesSummary.total_customers}</div>
                <p className="text-xs text-gray-500 mt-1">unique customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs. {formatCurrency(formatNumber(salesSummary.total_revenue) / (formatNumber(salesSummary.total_sales) || 1))}
                </div>
                <p className="text-xs text-gray-500 mt-1">per transaction</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Cash</span>
                    <span className="font-medium">Rs. {formatCurrency(salesSummary.cash_sales)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Card</span>
                    <span className="font-medium">Rs. {formatCurrency(salesSummary.card_sales)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Insurance</span>
                    <span className="font-medium">Rs. {formatCurrency(salesSummary.insurance_sales)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs. {formatCurrency(salesSummary.total_subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">Rs. {formatCurrency(salesSummary.total_discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">Rs. {formatCurrency(salesSummary.total_tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total Revenue:</span>
                    <span className="font-bold text-green-600">Rs. {formatCurrency(salesSummary.total_revenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  const renderDailySales = () => (
    <div className="space-y-6">
      {dailySales.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sale_day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="daily_revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (Rs.)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Avg. Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySales.map((day, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(day.sale_day).toLocaleDateString()}</TableCell>
                      <TableCell>{day.transaction_count}</TableCell>
                      <TableCell className="font-medium">Rs. {formatCurrency(day.daily_revenue)}</TableCell>
                      <TableCell>Rs. {formatCurrency(day.daily_subtotal)}</TableCell>
                      <TableCell>Rs. {formatCurrency(day.daily_discount)}</TableCell>
                      <TableCell>Rs. {formatCurrency(day.daily_tax)}</TableCell>
                      <TableCell>Rs. {formatCurrency(day.avg_transaction_value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No sales data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-6">
      {paymentMethods.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_amount"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{method.payment_method}</span>
                        <span className="text-sm text-gray-600">{method.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${method.percentage}%`,
                            backgroundColor: COLORS[idx % COLORS.length]
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{method.transaction_count} transactions</span>
                        <span className="font-medium">Rs. {formatCurrency(method.total_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Average Amount</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((method, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{method.payment_method}</TableCell>
                      <TableCell>{method.transaction_count}</TableCell>
                      <TableCell className="font-medium">Rs. {formatCurrency(method.total_amount)}</TableCell>
                      <TableCell>Rs. {formatCurrency(method.avg_amount)}</TableCell>
                      <TableCell>{method.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No payment method data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTopSelling = () => (
    <div className="space-y-6">
      {topSelling.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSelling.slice(0, 10).map(item => ({
                  name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
                  quantity: item.total_quantity_sold,
                  revenue: item.total_revenue
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue (Rs.)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSelling.map((item, idx) => (
                    <TableRow key={item.medicine_id}>
                      <TableCell className="font-medium">#{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-gray-600">{item.generic_name || 'N/A'}</TableCell>
                      <TableCell>{item.total_quantity_sold}</TableCell>
                      <TableCell className="font-medium">Rs. {formatCurrency(item.total_revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No product sales data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCashierPerformance = () => (
    <div className="space-y-6">
      {cashierPerformance.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Cashiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cashierPerformance.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cashierPerformance.reduce((sum, c) => sum + c.sales_count, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Rs. {formatCurrency(cashierPerformance.reduce((sum, c) => sum + formatNumber(c.total_revenue), 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cashier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier Name</TableHead>
                    <TableHead>Sales Count</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Avg. Transaction</TableHead>
                    <TableHead>Min Transaction</TableHead>
                    <TableHead>Max Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashierPerformance.map((cashier, idx) => (
                    <TableRow key={cashier.cashier_id}>
                      <TableCell className="font-medium">{cashier.cashier_name || 'Unknown'}</TableCell>
                      <TableCell>{cashier.sales_count}</TableCell>
                      <TableCell className="font-medium">Rs. {formatCurrency(cashier.total_revenue)}</TableCell>
                      <TableCell>Rs. {formatCurrency(cashier.avg_transaction_value)}</TableCell>
                      <TableCell>Rs. {formatCurrency(cashier.min_transaction)}</TableCell>
                      <TableCell>Rs. {formatCurrency(cashier.max_transaction)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No cashier performance data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderShiftSummary = () => (
    <div className="space-y-6">
      {shiftSummary.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shiftSummary.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shiftSummary.reduce((sum, s) => sum + (s.total_sales || 0), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Rs. {formatCurrency(shiftSummary.reduce((sum, s) => sum + formatNumber(s.total_revenue || 0), 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Closed Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shiftSummary.filter(s => s.status === 'Closed').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Shift Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift Number</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Cash Sales</TableHead>
                    <TableHead>Card Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftSummary.map((shift) => (
                    <TableRow key={shift.shift_id}>
                      <TableCell className="font-medium">{shift.shift_number}</TableCell>
                      <TableCell>{shift.cashier_name || 'N/A'}</TableCell>
                      <TableCell>{new Date(shift.start_time).toLocaleString()}</TableCell>
                      <TableCell>{shift.end_time ? new Date(shift.end_time).toLocaleString() : 'Open'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          shift.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {shift.status}
                        </span>
                      </TableCell>
                      <TableCell>{shift.total_sales || 0}</TableCell>
                      <TableCell className="font-medium">Rs. {formatCurrency(shift.total_revenue || 0)}</TableCell>
                      <TableCell>Rs. {formatCurrency(shift.cash_sales || 0)}</TableCell>
                      <TableCell>Rs. {formatCurrency(shift.card_sales || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No shift data available for the selected period
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">POS Reports</h2>
          <p className="text-gray-600">Sales analysis and performance reports</p>
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
          <Button variant="outline" onClick={() => loadReportData(activeTab)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">
            <FileText className="w-4 h-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="daily">
            <Calendar className="w-4 h-4 mr-2" />
            Daily Sales
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="top-selling">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Top Products
          </TabsTrigger>
          <TabsTrigger value="cashier">
            <Users className="w-4 h-4 mr-2" />
            Cashiers
          </TabsTrigger>
          <TabsTrigger value="shift">
            <Clock className="w-4 h-4 mr-2" />
            Shifts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => salesSummary && exportToCSV([salesSummary], 'sales_summary')}
              disabled={!salesSummary}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {renderSalesSummary()}
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => exportToCSV(dailySales, 'daily_sales')}
              disabled={dailySales.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {renderDailySales()}
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => exportToCSV(paymentMethods, 'payment_methods')}
              disabled={paymentMethods.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {renderPaymentMethod()}
        </TabsContent>

        <TabsContent value="top-selling" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => exportToCSV(topSelling, 'top_selling_products')}
              disabled={topSelling.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {renderTopSelling()}
        </TabsContent>

        <TabsContent value="cashier" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => exportToCSV(cashierPerformance, 'cashier_performance')}
              disabled={cashierPerformance.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {renderCashierPerformance()}
        </TabsContent>

        <TabsContent value="shift" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => exportToCSV(shiftSummary, 'shift_summary')}
              disabled={shiftSummary.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          {renderShiftSummary()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

