import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Plus,
  Search,
  Folder,
  Package,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface CategoryListProps {
  onBack: () => void;
  onViewCategory: (id: string) => void;
  onAddCategory: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  totalValue: number;
  lowStockItems: number;
  status: 'active' | 'inactive';
  createdDate: string;
  lastUpdated: string;
  icon: string;
  color: string;
}

const mockCategories: Category[] = [
  {
    id: 'CAT-001',
    name: 'Medicines',
    description: 'Pharmaceutical drugs and medications',
    itemCount: 1247,
    totalValue: 2850000,
    lowStockItems: 8,
    status: 'active',
    createdDate: '2024-01-15',
    lastUpdated: '2024-11-20',
    icon: '💊',
    color: 'blue'
  },
  {
    id: 'CAT-002',
    name: 'Medical Equipment',
    description: 'Diagnostic and therapeutic medical equipment',
    itemCount: 342,
    totalValue: 5200000,
    lowStockItems: 3,
    status: 'active',
    createdDate: '2024-01-15',
    lastUpdated: '2024-11-22',
    icon: '🩺',
    color: 'purple'
  },
  {
    id: 'CAT-003',
    name: 'Disposables',
    description: 'Single-use medical supplies and consumables',
    itemCount: 856,
    totalValue: 980000,
    lowStockItems: 12,
    status: 'active',
    createdDate: '2024-01-15',
    lastUpdated: '2024-11-23',
    icon: '💉',
    color: 'green'
  },
  {
    id: 'CAT-004',
    name: 'Lab Supplies',
    description: 'Laboratory testing equipment and reagents',
    itemCount: 234,
    totalValue: 1450000,
    lowStockItems: 5,
    status: 'active',
    createdDate: '2024-01-20',
    lastUpdated: '2024-11-21',
    icon: '🧪',
    color: 'orange'
  },
  {
    id: 'CAT-005',
    name: 'Surgical Items',
    description: 'Surgical instruments and supplies',
    itemCount: 178,
    totalValue: 3100000,
    lowStockItems: 2,
    status: 'active',
    createdDate: '2024-02-01',
    lastUpdated: '2024-11-19',
    icon: '🔬',
    color: 'red'
  },
  {
    id: 'CAT-006',
    name: 'Consumables',
    description: 'General hospital consumable items',
    itemCount: 456,
    totalValue: 720000,
    lowStockItems: 6,
    status: 'active',
    createdDate: '2024-02-10',
    lastUpdated: '2024-11-24',
    icon: '💧',
    color: 'teal'
  },
  {
    id: 'CAT-007',
    name: 'PPE & Safety',
    description: 'Personal protective equipment and safety gear',
    itemCount: 523,
    totalValue: 560000,
    lowStockItems: 15,
    status: 'active',
    createdDate: '2024-03-01',
    lastUpdated: '2024-11-24',
    icon: '🦺',
    color: 'yellow'
  },
  {
    id: 'CAT-008',
    name: 'IV Fluids & Solutions',
    description: 'Intravenous fluids and medical solutions',
    itemCount: 189,
    totalValue: 890000,
    lowStockItems: 4,
    status: 'active',
    createdDate: '2024-03-15',
    lastUpdated: '2024-11-23',
    icon: '🩸',
    color: 'pink'
  }
];

export function CategoryList({ onBack, onViewCategory, onAddCategory }: CategoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCategories = mockCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || category.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalCategories: mockCategories.length,
    activeCategories: mockCategories.filter(c => c.status === 'active').length,
    totalItems: mockCategories.reduce((sum, c) => sum + c.itemCount, 0),
    totalValue: mockCategories.reduce((sum, c) => sum + c.totalValue, 0),
    lowStockAlerts: mockCategories.reduce((sum, c) => sum + c.lowStockItems, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  Category Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage inventory categories and classifications</p>
              </div>
            </div>
            <Button onClick={onAddCategory} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700 mb-1">Total Categories</p>
              <p className="text-2xl text-blue-900">{stats.totalCategories}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-sm text-green-700 mb-1">Active</p>
              <p className="text-2xl text-green-900">{stats.activeCategories}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <p className="text-sm text-purple-700 mb-1">Total Items</p>
              <p className="text-2xl text-purple-900">{stats.totalItems.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <p className="text-sm text-orange-700 mb-1">Total Value</p>
              <p className="text-2xl text-orange-900">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
              <p className="text-sm text-red-700 mb-1">Low Stock Alerts</p>
              <p className="text-2xl text-red-900">{stats.lowStockAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6">
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search categories..."
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
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                  className={filterStatus === 'active' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                  className={filterStatus === 'inactive' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="border-0 shadow-md hover:shadow-xl transition-all group cursor-pointer">
              <CardContent className="p-6">
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${category.color}-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{category.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewCategory(category.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items
                    </span>
                    <span className="font-medium text-gray-900">{category.itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Total Value
                    </span>
                    <span className="font-medium text-gray-900">₹{(category.totalValue / 100000).toFixed(1)}L</span>
                  </div>
                  {category.lowStockItems > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Low Stock
                      </span>
                      <Badge className="bg-red-100 text-red-700">{category.lowStockItems}</Badge>
                    </div>
                  )}
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Badge className={category.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {category.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewCategory(category.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </Button>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-gray-400 mt-3">Updated: {category.lastUpdated}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first category'}
              </p>
              {!searchQuery && (
                <Button onClick={onAddCategory} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
