import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Package,
  AlertTriangle,
  Calendar,
  FileText,
  TrendingUp,
  Box,
  ShoppingCart,
  BarChart3,
  Plus,
  ArrowRight,
  Pill,
  Syringe,
  TestTube,
  Stethoscope,
  Droplet,
  Heart,
  Activity,
  Folder
} from 'lucide-react';

import { InventoryList } from './InventoryList';
import { ItemDetail } from './ItemDetail';
import { AddEditItem } from './AddEditItem';
import { StockMovement } from './StockMovement';
import { PurchaseRequests } from './PurchaseRequests';
import { InventoryReports } from './InventoryReports';
import { CategoryList } from './CategoryList';
import { CategoryDetail } from './CategoryDetail';
import { AddEditCategory } from './AddEditCategory';

interface InventoryManagementProps {
  onClose?: () => void;
}

export function InventoryManagement({ onClose }: InventoryManagementProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'detail' | 'add' | 'edit' | 'stockin' | 'stockout' | 'purchase' | 'reports' | 'categorylist' | 'categorydetail' | 'addeditcategory'>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Mock data for dashboard
  const stats = [
    {
      title: 'Total Items',
      value: '2,847',
      change: '+12%',
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: 'up'
    },
    {
      title: 'Low Stock Alerts',
      value: '23',
      change: '+5 today',
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: 'alert'
    },
    {
      title: 'Expiring Soon',
      value: '18',
      change: 'Next 30 days',
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: 'warning'
    },
    {
      title: 'Purchase Requests',
      value: '12',
      change: '4 pending',
      icon: FileText,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: 'neutral'
    },
    {
      title: 'Total Value',
      value: '₹48.5L',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: 'up'
    }
  ];

  const categories = [
    { id: 'medicines', label: 'Medicines', count: 1247, icon: Pill, color: 'blue' },
    { id: 'equipment', label: 'Medical Equipment', count: 342, icon: Stethoscope, color: 'purple' },
    { id: 'disposables', label: 'Disposables', count: 856, icon: Syringe, color: 'green' },
    { id: 'lab', label: 'Lab Supplies', count: 234, icon: TestTube, color: 'orange' },
    { id: 'consumables', label: 'Consumables', count: 456, icon: Droplet, color: 'teal' },
    { id: 'surgical', label: 'Surgical Items', count: 178, icon: Activity, color: 'red' }
  ];

  const recentActivity = [
    { id: 1, action: 'Stock In', item: 'Paracetamol 500mg', quantity: '+500', time: '10 mins ago', user: 'John Doe', type: 'in' },
    { id: 2, action: 'Stock Out', item: 'Surgical Gloves (M)', quantity: '-100', time: '25 mins ago', user: 'Sarah Smith', type: 'out' },
    { id: 3, action: 'Purchase Request', item: 'IV Fluid Set', quantity: '200', time: '1 hour ago', user: 'Mike Johnson', type: 'request' },
    { id: 4, action: 'Stock In', item: 'Blood Collection Tubes', quantity: '+1000', time: '2 hours ago', user: 'Emily Davis', type: 'in' },
    { id: 5, action: 'Low Stock Alert', item: 'N95 Masks', quantity: '15 left', time: '3 hours ago', user: 'System', type: 'alert' }
  ];

  const lowStockItems = [
    { id: 1, name: 'N95 Masks', current: 15, reorder: 100, category: 'Disposables', urgency: 'critical' },
    { id: 2, name: 'Insulin Injection', current: 24, reorder: 50, category: 'Medicines', urgency: 'high' },
    { id: 3, name: 'Sterile Gauze', current: 35, reorder: 100, category: 'Disposables', urgency: 'medium' },
    { id: 4, name: 'Blood Bags', current: 42, reorder: 100, category: 'Lab Supplies', urgency: 'medium' }
  ];

  const expiringItems = [
    { id: 1, name: 'Aspirin 75mg', batch: 'ASP-2024-001', expiry: '2024-12-15', days: 21, quantity: 500 },
    { id: 2, name: 'Antibiotic Cream', batch: 'ABC-2024-045', expiry: '2024-12-20', days: 26, quantity: 80 },
    { id: 3, name: 'IV Solutions', batch: 'IV-2024-112', expiry: '2024-12-25', days: 31, quantity: 150 },
    { id: 4, name: 'Vitamin B Complex', batch: 'VIT-2024-089', expiry: '2025-01-10', days: 47, quantity: 200 }
  ];

  if (activeView === 'list') {
    return <InventoryList onBack={() => setActiveView('dashboard')} onViewItem={(id) => { setSelectedItemId(id); setActiveView('detail'); }} onAddItem={() => setActiveView('add')} />;
  }

  if (activeView === 'detail' && selectedItemId) {
    return <ItemDetail itemId={selectedItemId} onBack={() => setActiveView('list')} onEdit={() => setActiveView('edit')} />;
  }

  if (activeView === 'add' || activeView === 'edit') {
    return <AddEditItem mode={activeView} itemId={selectedItemId} onBack={() => setActiveView('list')} onSave={() => setActiveView('list')} />;
  }

  if (activeView === 'stockin' || activeView === 'stockout') {
    return <StockMovement type={activeView === 'stockin' ? 'in' : 'out'} onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'purchase') {
    return <PurchaseRequests onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'reports') {
    return <InventoryReports onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'categorylist') {
    return <CategoryList onBack={() => setActiveView('dashboard')} onViewCategory={(id) => { setSelectedCategoryId(id); setActiveView('categorydetail'); }} onAddCategory={() => setActiveView('addeditcategory')} />;
  }

  if (activeView === 'categorydetail' && selectedCategoryId) {
    return <CategoryDetail categoryId={selectedCategoryId} onBack={() => setActiveView('categorylist')} onEdit={() => setActiveView('addeditcategory')} />;
  }

  if (activeView === 'addeditcategory') {
    return <AddEditCategory mode={activeView} categoryId={selectedCategoryId} onBack={() => setActiveView('categorylist')} onSave={() => setActiveView('categorylist')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                Inventory Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Track and manage hospital inventory, stock levels, and purchases</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActiveView('categorylist')}>
                <Folder className="w-4 h-4 mr-2" />
                Categories
              </Button>
              <Button variant="outline" onClick={() => setActiveView('reports')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline" onClick={() => setActiveView('purchase')}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase Requests
              </Button>
              <Button onClick={() => setActiveView('add')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl text-gray-900 mb-2">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'alert' ? 'text-red-600' : 'text-gray-600'}`}>
                          {stat.change}
                        </span>
                      </div>
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

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => setActiveView('stockin')}>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span>Stock In</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => setActiveView('stockout')}>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                </div>
                <span>Stock Out</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => setActiveView('list')}>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Box className="w-5 h-5 text-blue-600" />
                </div>
                <span>View All Items</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2" onClick={() => setActiveView('purchase')}>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <span>New Request</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Inventory Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    onClick={() => setActiveView('list')}
                  >
                    <div className={`w-12 h-12 bg-${category.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${category.color}-600`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{category.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{category.count} items</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Low Stock Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveView('list')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <Badge className={`
                        ${item.urgency === 'critical' ? 'bg-red-100 text-red-700' : ''}
                        ${item.urgency === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                        ${item.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                      `}>
                        {item.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-red-600">Current: {item.current}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">Reorder: {item.reorder}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.urgency === 'critical' ? 'bg-red-500' : item.urgency === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                        style={{ width: `${(item.current / item.reorder) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Expiring Soon
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveView('list')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {expiringItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Batch: {item.batch}</p>
                      </div>
                      <Badge className={`
                        ${item.days <= 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                      `}>
                        {item.days} days
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Expires: {item.expiry}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'in' ? 'bg-green-50' : 
                      activity.type === 'out' ? 'bg-red-50' : 
                      activity.type === 'request' ? 'bg-purple-50' : 
                      'bg-orange-50'
                    }`}>
                      {activity.type === 'in' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {activity.type === 'out' && <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />}
                      {activity.type === 'request' && <ShoppingCart className="w-5 h-5 text-purple-600" />}
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
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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