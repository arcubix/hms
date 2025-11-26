import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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

interface InventoryReportsProps {
  onBack: () => void;
}

export function InventoryReports({ onBack }: InventoryReportsProps) {
  const [reportType, setReportType] = useState('stock-levels');
  const [timeRange, setTimeRange] = useState('month');

  // Mock data for charts
  const stockLevelData = [
    { category: 'Medicines', inStock: 1247, lowStock: 23, outOfStock: 5 },
    { category: 'Equipment', inStock: 342, lowStock: 8, outOfStock: 2 },
    { category: 'Disposables', inStock: 856, lowStock: 15, outOfStock: 3 },
    { category: 'Lab Supplies', inStock: 234, lowStock: 4, outOfStock: 1 },
    { category: 'Consumables', inStock: 456, lowStock: 12, outOfStock: 4 }
  ];

  const consumptionData = [
    { month: 'May', medicines: 12500, disposables: 8400, labSupplies: 5200 },
    { month: 'Jun', medicines: 13200, disposables: 9100, labSupplies: 5800 },
    { month: 'Jul', medicines: 11800, disposables: 8800, labSupplies: 5400 },
    { month: 'Aug', medicines: 14100, disposables: 9600, labSupplies: 6200 },
    { month: 'Sep', medicines: 13500, disposables: 9200, labSupplies: 5900 },
    { month: 'Oct', medicines: 12900, disposables: 8700, labSupplies: 5600 },
    { month: 'Nov', medicines: 13800, disposables: 9400, labSupplies: 6100 }
  ];

  const categoryDistribution = [
    { name: 'Medicines', value: 1247, color: '#2F80ED' },
    { name: 'Equipment', value: 342, color: '#27AE60' },
    { name: 'Disposables', value: 856, color: '#F2994A' },
    { name: 'Lab Supplies', value: 234, color: '#9B51E0' },
    { name: 'Consumables', value: 456, color: '#EB5757' }
  ];

  const valueData = [
    { month: 'May', value: 4250000 },
    { month: 'Jun', value: 4580000 },
    { month: 'Jul', value: 4320000 },
    { month: 'Aug', value: 4890000 },
    { month: 'Sep', value: 4650000 },
    { month: 'Oct', value: 4420000 },
    { month: 'Nov', value: 4850000 }
  ];

  const expiringItems = [
    { name: 'Aspirin 75mg', batch: 'ASP-2024-001', expiry: '2024-12-15', days: 21, value: 750, category: 'Medicines' },
    { name: 'Antibiotic Cream', batch: 'ABC-2024-045', expiry: '2024-12-20', days: 26, value: 1200, category: 'Medicines' },
    { name: 'IV Solutions', batch: 'IV-2024-112', expiry: '2024-12-25', days: 31, value: 6750, category: 'Consumables' },
    { name: 'Vitamin B Complex', batch: 'VIT-2024-089', expiry: '2025-01-10', days: 47, value: 800, category: 'Medicines' },
    { name: 'Surgical Masks', batch: 'MSK-2024-078', expiry: '2025-01-20', days: 57, value: 2400, category: 'Disposables' }
  ];

  const purchaseHistory = [
    { date: '2024-11-24', vendor: 'MediSupply Co.', items: 5, amount: 42500, status: 'completed' },
    { date: '2024-11-20', vendor: 'HealthCare Distributors', items: 3, amount: 28900, status: 'completed' },
    { date: '2024-11-18', vendor: 'PharmaCorp Ltd.', items: 8, amount: 65400, status: 'completed' },
    { date: '2024-11-15', vendor: 'MediSupply Co.', items: 4, amount: 31200, status: 'completed' },
    { date: '2024-11-10', vendor: 'Global Medical Supplies', items: 6, amount: 48700, status: 'completed' }
  ];

  const topConsumingItems = [
    { name: 'Paracetamol 500mg', consumed: 15200, value: 38000, category: 'Medicines' },
    { name: 'Surgical Gloves (M)', consumed: 12400, value: 105400, category: 'Disposables' },
    { name: 'Blood Collection Tubes', consumed: 8900, value: 44500, category: 'Lab Supplies' },
    { name: 'IV Fluid Set', consumed: 3200, value: 144000, category: 'Consumables' },
    { name: 'N95 Masks', consumed: 6800, value: 170000, category: 'Disposables' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl text-gray-900 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  Inventory Reports & Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-1">Comprehensive inventory insights and trends</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stock-levels">Stock Level Analysis</SelectItem>
              <SelectItem value="consumption">Consumption Trends</SelectItem>
              <SelectItem value="expiry">Expiry Reports</SelectItem>
              <SelectItem value="purchase">Purchase History</SelectItem>
              <SelectItem value="value">Inventory Valuation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Stock Value</p>
                  <p className="text-2xl text-gray-900">₹48.5L</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8.2% vs last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Items in Stock</p>
                  <p className="text-2xl text-gray-900">2,847</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +142 this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                  <p className="text-2xl text-red-600">23</p>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +5 today
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expiring Soon</p>
                  <p className="text-2xl text-orange-600">18</p>
                  <p className="text-xs text-gray-600 mt-1">Next 30 days</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Level Analysis */}
        {reportType === 'stock-levels' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg">Stock Status by Category</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stockLevelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="category" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inStock" fill="#27AE60" name="In Stock" />
                      <Bar dataKey="lowStock" fill="#F2994A" name="Low Stock" />
                      <Bar dataKey="outOfStock" fill="#EB5757" name="Out of Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Consumption Trends */}
        {reportType === 'consumption' && (
          <>
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Monthly Consumption Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={consumptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="medicines" stroke="#2F80ED" strokeWidth={2} name="Medicines" />
                    <Line type="monotone" dataKey="disposables" stroke="#27AE60" strokeWidth={2} name="Disposables" />
                    <Line type="monotone" dataKey="labSupplies" stroke="#F2994A" strokeWidth={2} name="Lab Supplies" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Top Consuming Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {topConsumingItems.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.consumed.toLocaleString()} units</p>
                        <p className="text-sm text-gray-600 mt-1">₹{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Expiry Report */}
        {reportType === 'expiry' && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Items Expiring in Next 60 Days</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {expiringItems.map((item, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Batch: {item.batch} • <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </p>
                      </div>
                      <Badge className={`${item.days <= 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.days} days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expiry Date: {item.expiry}</span>
                      <span className="text-gray-900 font-medium">Value: ₹{item.value.toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.days <= 30 ? 'bg-red-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.max(10, 100 - (item.days / 60 * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase History */}
        {reportType === 'purchase' && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Recent Purchase History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {purchaseHistory.map((purchase, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{purchase.vendor}</p>
                        <p className="text-sm text-gray-600 mt-1">{purchase.date} • {purchase.items} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{purchase.amount.toLocaleString()}</p>
                      <Badge className="mt-1 bg-green-100 text-green-700 text-xs">
                        {purchase.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Valuation */}
        {reportType === 'value' && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Inventory Value Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={valueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value: any) => `₹${(value / 100000).toFixed(2)}L`} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2F80ED" 
                    strokeWidth={3} 
                    dot={{ fill: '#2F80ED', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
