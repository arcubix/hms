import { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data
const salesData = [
  { day: 'Mon', sales: 2450, transactions: 45, customers: 38 },
  { day: 'Tue', sales: 3200, transactions: 52, customers: 43 },
  { day: 'Wed', sales: 2800, transactions: 48, customers: 41 },
  { day: 'Thu', sales: 3800, transactions: 58, customers: 49 },
  { day: 'Fri', sales: 4200, transactions: 65, customers: 55 },
  { day: 'Sat', sales: 5100, transactions: 78, customers: 68 },
  { day: 'Sun', sales: 3600, transactions: 56, customers: 47 }
];

const topSellingMedicines = [
  { name: 'Paracetamol 500mg', quantity: 450, revenue: 900, color: '#2F80ED' },
  { name: 'Amoxicillin 250mg', quantity: 320, revenue: 1440, color: '#27AE60' },
  { name: 'Omeprazole 20mg', quantity: 280, revenue: 2016, color: '#F39C12' },
  { name: 'Cetirizine 10mg', quantity: 240, revenue: 720, color: '#E74C3C' },
  { name: 'Metformin 500mg', quantity: 200, revenue: 600, color: '#9B59B6' }
];

const categoryWiseSales = [
  { category: 'Pain Relief', sales: 8500, percentage: 28 },
  { category: 'Antibiotics', sales: 7200, percentage: 24 },
  { category: 'Gastric', sales: 5400, percentage: 18 },
  { category: 'Diabetes', sales: 4800, percentage: 16 },
  { category: 'Cardiovascular', sales: 4200, percentage: 14 }
];

const recentTransactions = [
  {
    id: 'TXN001',
    time: '14:30',
    customerName: 'John Smith',
    items: 3,
    total: 45.50,
    paymentMethod: 'Card',
    cashier: 'Alice Johnson'
  },
  {
    id: 'TXN002',
    time: '14:15',
    customerName: 'Emily Davis',
    items: 1,
    total: 12.00,
    paymentMethod: 'Cash',
    cashier: 'Bob Wilson'
  },
  {
    id: 'TXN003',
    time: '14:00',
    customerName: 'Michael Brown',
    items: 5,
    total: 78.25,
    paymentMethod: 'Insurance',
    cashier: 'Alice Johnson'
  },
  {
    id: 'TXN004',
    time: '13:45',
    customerName: 'Sarah Wilson',
    items: 2,
    total: 24.80,
    paymentMethod: 'Wallet',
    cashier: 'Carol Davis'
  }
];

export function SalesReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedCashier, setSelectedCashier] = useState('all');

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
                <p className="text-2xl text-gray-900">$25,200</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+12.5%</span>
                  <span className="text-sm text-gray-500">vs last week</span>
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
                <p className="text-2xl text-gray-900">302</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">+8.2%</span>
                  <span className="text-sm text-gray-500">vs last week</span>
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
                <p className="text-2xl text-gray-900">241</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600">+15.3%</span>
                  <span className="text-sm text-gray-500">vs last week</span>
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
                <p className="text-2xl text-gray-900">$83.44</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">+5.1%</span>
                  <span className="text-sm text-gray-500">vs last week</span>
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#2F80ED" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
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
            <div className="space-y-4">
              {topSellingMedicines.map((medicine, index) => (
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
                    <p className="text-sm text-gray-900">${medicine.revenue}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {categoryWiseSales.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900">{category.category}</span>
                    <span className="text-gray-600">${category.sales} ({category.percentage}%)</span>
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
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{transaction.customerName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{transaction.time}</span>
                        <span>•</span>
                        <span>{transaction.items} items</span>
                        <span>•</span>
                        <span>by {transaction.cashier}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">${transaction.total}</p>
                    <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                      {transaction.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-sm text-gray-900">{transaction.id}</TableCell>
                  <TableCell className="text-sm text-gray-600">{transaction.time}</TableCell>
                  <TableCell className="text-sm text-gray-900">{transaction.customerName}</TableCell>
                  <TableCell className="text-sm text-gray-600">{transaction.items}</TableCell>
                  <TableCell className="text-sm text-gray-900">${transaction.total}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentMethodColor(transaction.paymentMethod)}>
                      {transaction.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{transaction.cashier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}