import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  Search,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface CategoryDetailProps {
  categoryId: string;
  onBack: () => void;
  onEdit: () => void;
}

// Mock category data
const mockCategory = {
  id: 'CAT-001',
  name: 'Medicines',
  description: 'Pharmaceutical drugs and medications including tablets, capsules, syrups, and injections',
  itemCount: 1247,
  totalValue: 2850000,
  lowStockItems: 8,
  expiringItems: 12,
  status: 'active',
  createdDate: '2024-01-15',
  createdBy: 'Admin User',
  lastUpdated: '2024-11-20',
  updatedBy: 'John Doe',
  icon: '💊',
  color: 'blue',
  reorderLevel: 50,
  autoReorder: true,
  supplier: 'Primary Medical Supplies Inc.',
  notes: 'Critical category requiring strict inventory control and expiry monitoring'
};

// Mock items in this category
const mockItems = [
  {
    id: 'ITM-001',
    name: 'Paracetamol 500mg',
    sku: 'MED-PAR-500',
    quantity: 5000,
    unit: 'Tablets',
    reorderLevel: 1000,
    price: 2.50,
    totalValue: 12500,
    status: 'in-stock',
    lastRestocked: '2024-11-15',
    expiryDate: '2025-06-30'
  },
  {
    id: 'ITM-002',
    name: 'Amoxicillin 250mg',
    sku: 'MED-AMO-250',
    quantity: 150,
    unit: 'Capsules',
    reorderLevel: 500,
    price: 8.75,
    totalValue: 1312.50,
    status: 'low-stock',
    lastRestocked: '2024-11-10',
    expiryDate: '2025-03-15'
  },
  {
    id: 'ITM-003',
    name: 'Insulin Injection',
    sku: 'MED-INS-100',
    quantity: 24,
    unit: 'Vials',
    reorderLevel: 50,
    price: 450.00,
    totalValue: 10800,
    status: 'critical',
    lastRestocked: '2024-11-01',
    expiryDate: '2024-12-20'
  },
  {
    id: 'ITM-004',
    name: 'Aspirin 75mg',
    sku: 'MED-ASP-75',
    quantity: 3200,
    unit: 'Tablets',
    reorderLevel: 800,
    price: 1.50,
    totalValue: 4800,
    status: 'in-stock',
    lastRestocked: '2024-11-18',
    expiryDate: '2025-08-30'
  },
  {
    id: 'ITM-005',
    name: 'Ibuprofen 400mg',
    sku: 'MED-IBU-400',
    quantity: 2800,
    unit: 'Tablets',
    reorderLevel: 1000,
    price: 3.20,
    totalValue: 8960,
    status: 'in-stock',
    lastRestocked: '2024-11-20',
    expiryDate: '2025-09-15'
  }
];

// Mock activity data
const mockActivity = [
  { id: 1, action: 'Stock In', item: 'Paracetamol 500mg', quantity: '+500', date: '2024-11-20', user: 'John Doe', type: 'in' },
  { id: 2, action: 'Stock Out', item: 'Amoxicillin 250mg', quantity: '-100', date: '2024-11-19', user: 'Sarah Smith', type: 'out' },
  { id: 3, action: 'Low Stock Alert', item: 'Insulin Injection', quantity: '24', date: '2024-11-18', user: 'System', type: 'alert' },
  { id: 4, action: 'Stock In', item: 'Ibuprofen 400mg', quantity: '+800', date: '2024-11-17', user: 'Mike Johnson', type: 'in' },
  { id: 5, action: 'Stock Out', item: 'Aspirin 75mg', quantity: '-200', date: '2024-11-16', user: 'Emily Davis', type: 'out' }
];

export function CategoryDetail({ categoryId, onBack, onEdit }: CategoryDetailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'critical'>('all');

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: 'Total Items',
      value: mockCategory.itemCount.toString(),
      change: '+12 this month',
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Value',
      value: `₹${(mockCategory.totalValue / 100000).toFixed(1)}L`,
      change: '+8.2% from last month',
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Low Stock Items',
      value: mockCategory.lowStockItems.toString(),
      change: '5 need immediate action',
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Expiring Soon',
      value: mockCategory.expiringItems.toString(),
      change: 'Next 30 days',
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
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
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-${mockCategory.color}-50 rounded-xl flex items-center justify-center text-2xl`}>
                  {mockCategory.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl text-gray-900">{mockCategory.name}</h1>
                    <Badge className={mockCategory.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {mockCategory.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{mockCategory.description}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl text-gray-900 mb-2">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category Information */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Category Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Category ID</p>
                <p className="font-medium text-gray-900">{mockCategory.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created Date</p>
                <p className="font-medium text-gray-900">{mockCategory.createdDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created By</p>
                <p className="font-medium text-gray-900">{mockCategory.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900">{mockCategory.lastUpdated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Updated By</p>
                <p className="font-medium text-gray-900">{mockCategory.updatedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reorder Level</p>
                <p className="font-medium text-gray-900">{mockCategory.reorderLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Auto Reorder</p>
                <Badge className={mockCategory.autoReorder ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {mockCategory.autoReorder ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Primary Supplier</p>
                <p className="font-medium text-gray-900">{mockCategory.supplier}</p>
              </div>
            </div>
            {mockCategory.notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-sm text-gray-700">{mockCategory.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items in Category */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Items in Category</CardTitle>
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'in-stock' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('in-stock')}
                  className={filterStatus === 'in-stock' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  In Stock
                </Button>
                <Button
                  variant={filterStatus === 'low-stock' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('low-stock')}
                  className={filterStatus === 'low-stock' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Low Stock
                </Button>
                <Button
                  variant={filterStatus === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('critical')}
                  className={filterStatus === 'critical' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Critical
                </Button>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Total Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Expiry Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{item.quantity} {item.unit}</p>
                        <p className="text-xs text-gray-500">Reorder: {item.reorderLevel}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{item.totalValue.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`
                          ${item.status === 'in-stock' ? 'bg-green-100 text-green-700' : ''}
                          ${item.status === 'low-stock' ? 'bg-orange-100 text-orange-700' : ''}
                          ${item.status === 'critical' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.expiryDate}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {mockActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'in' ? 'bg-green-50' :
                      activity.type === 'out' ? 'bg-red-50' :
                      'bg-orange-50'
                    }`}>
                      {activity.type === 'in' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {activity.type === 'out' && <TrendingDown className="w-5 h-5 text-red-600" />}
                      {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      activity.type === 'in' ? 'text-green-600' :
                      activity.type === 'out' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {activity.quantity}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    <p className="text-xs text-gray-400">by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
