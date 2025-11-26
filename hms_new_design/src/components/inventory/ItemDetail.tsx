import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Edit,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  BarChart3,
  Truck,
  History
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function ItemDetail({ itemId, onBack, onEdit }: ItemDetailProps) {
  // Mock item data
  const item = {
    id: itemId,
    name: 'Paracetamol 500mg',
    sku: 'MED-001',
    category: 'Medicines',
    description: 'Pain reliever and fever reducer. Used to treat mild to moderate pain and to reduce fever.',
    manufacturer: 'PharmaCorp Ltd.',
    currentStock: 2500,
    reorderLevel: 1000,
    maxStockLevel: 5000,
    unit: 'Tablets',
    unitPrice: 2.50,
    totalValue: 6250,
    status: 'in-stock',
    location: 'Pharmacy - Shelf A1',
    lastUpdated: '2024-11-20 14:30',
    updatedBy: 'John Doe'
  };

  const batches = [
    { batchNo: 'PAR-2024-001', quantity: 1000, expiryDate: '2025-06-15', receivedDate: '2024-01-15', vendor: 'MediSupply Co.' },
    { batchNo: 'PAR-2024-002', quantity: 800, expiryDate: '2025-08-20', receivedDate: '2024-03-10', vendor: 'HealthCare Distributors' },
    { batchNo: 'PAR-2024-003', quantity: 700, expiryDate: '2025-10-30', receivedDate: '2024-06-05', vendor: 'MediSupply Co.' }
  ];

  const vendors = [
    { name: 'MediSupply Co.', contact: '+91 98765 43210', email: 'sales@medisupply.com', lastOrder: '2024-10-15', totalOrders: 24 },
    { name: 'HealthCare Distributors', contact: '+91 98765 43211', email: 'info@hcdist.com', lastOrder: '2024-09-20', totalOrders: 18 }
  ];

  const stockHistory = [
    { id: 1, date: '2024-11-24', type: 'Stock In', quantity: 500, batch: 'PAR-2024-003', user: 'John Doe', notes: 'Regular stock replenishment' },
    { id: 2, date: '2024-11-22', type: 'Stock Out', quantity: 200, batch: 'PAR-2024-001', user: 'Sarah Smith', notes: 'OPD dispensing' },
    { id: 3, date: '2024-11-20', type: 'Stock Out', quantity: 150, batch: 'PAR-2024-001', user: 'Mike Johnson', notes: 'IPD requirement' },
    { id: 4, date: '2024-11-18', type: 'Stock In', quantity: 1000, batch: 'PAR-2024-003', user: 'John Doe', notes: 'New batch received' },
    { id: 5, date: '2024-11-15', type: 'Stock Out', quantity: 300, batch: 'PAR-2024-001', user: 'Emily Davis', notes: 'Emergency department' }
  ];

  const usageData = [
    { month: 'May', usage: 2800 },
    { month: 'Jun', usage: 3200 },
    { month: 'Jul', usage: 2900 },
    { month: 'Aug', usage: 3400 },
    { month: 'Sep', usage: 3100 },
    { month: 'Oct', usage: 2700 },
    { month: 'Nov', usage: 2500 }
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
                  <Package className="w-6 h-6" />
                  {item.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">SKU: {item.sku} • {item.category}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Print Label
              </Button>
              <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                  <p className="text-2xl text-gray-900">{item.currentStock.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl text-gray-900">₹{item.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+8.5% this month</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reorder Level</p>
                  <p className="text-2xl text-gray-900">{item.reorderLevel.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Safety stock</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Status</p>
                  <Badge className="bg-green-100 text-green-700 mt-1">In Stock</Badge>
                  <p className="text-xs text-gray-500 mt-2">{((item.currentStock / item.maxStockLevel) * 100).toFixed(0)}% capacity</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Item Name</p>
                    <p className="font-medium text-gray-900">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SKU</p>
                    <p className="font-mono text-gray-900">{item.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Manufacturer</p>
                    <p className="text-gray-900">{item.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unit</p>
                    <p className="text-gray-900">{item.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                    <p className="text-gray-900">₹{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{item.description}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{item.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Batch Information (FIFO)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {batches.map((batch, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm text-gray-900">{batch.batchNo}</p>
                          <p className="text-xs text-gray-500 mt-1">Vendor: {batch.vendor}</p>
                        </div>
                        <Badge variant="outline">Qty: {batch.quantity}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Received: {batch.receivedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-600">Expiry: {batch.expiryDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage History Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Usage Trends (Last 7 Months)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Line type="monotone" dataKey="usage" stroke="#2F80ED" strokeWidth={2} dot={{ fill: '#2F80ED' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendors */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Vendors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {vendors.map((vendor, index) => (
                    <div key={index} className="p-4">
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{vendor.contact}</p>
                      <p className="text-xs text-gray-500">{vendor.email}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-500">Last order: {vendor.lastOrder}</span>
                        <Badge variant="outline" className="text-xs">{vendor.totalOrders} orders</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stock Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                  Stock In
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                  Stock Out
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2 text-purple-600" />
                  Create Purchase Request
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                  Set Reorder Alert
                </Button>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card className="border-0 shadow-md bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <History className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-600 mt-1">{item.lastUpdated}</p>
                    <p className="text-xs text-gray-500">by {item.updatedBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stock Movement History */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Stock Movement History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {stockHistory.map((history) => (
                <div key={history.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      history.type === 'Stock In' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {history.type === 'Stock In' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{history.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">Batch: {history.batch}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      history.type === 'Stock In' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {history.type === 'Stock In' ? '+' : '-'}{history.quantity}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{history.date}</p>
                    <p className="text-xs text-gray-400">by {history.user}</p>
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
