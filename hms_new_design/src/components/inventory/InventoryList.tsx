import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Search,
  Filter,
  Download,
  ArrowLeft,
  Plus,
  ChevronDown,
  Package,
  AlertTriangle,
  Calendar,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface InventoryListProps {
  onBack: () => void;
  onViewItem: (itemId: string) => void;
  onAddItem: () => void;
}

export function InventoryList({ onBack, onViewItem, onAddItem }: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock inventory items
  const items = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      sku: 'MED-001',
      category: 'Medicines',
      currentStock: 2500,
      reorderLevel: 1000,
      unit: 'Tablets',
      unitPrice: 2.50,
      totalValue: 6250,
      status: 'in-stock',
      lastUpdated: '2024-11-20',
      expiryDate: '2025-06-15',
      location: 'Pharmacy - Shelf A1'
    },
    {
      id: '2',
      name: 'N95 Masks',
      sku: 'DIS-045',
      category: 'Disposables',
      currentStock: 15,
      reorderLevel: 100,
      unit: 'Pieces',
      unitPrice: 25.00,
      totalValue: 375,
      status: 'low-stock',
      lastUpdated: '2024-11-23',
      expiryDate: '2026-03-20',
      location: 'Store Room - Bin 12'
    },
    {
      id: '3',
      name: 'Surgical Gloves (M)',
      sku: 'DIS-023',
      category: 'Disposables',
      currentStock: 850,
      reorderLevel: 500,
      unit: 'Pairs',
      unitPrice: 8.50,
      totalValue: 7225,
      status: 'in-stock',
      lastUpdated: '2024-11-22',
      expiryDate: '2025-12-31',
      location: 'Store Room - Bin 8'
    },
    {
      id: '4',
      name: 'Blood Collection Tubes',
      sku: 'LAB-112',
      category: 'Lab Supplies',
      currentStock: 3200,
      reorderLevel: 1000,
      unit: 'Tubes',
      unitPrice: 5.00,
      totalValue: 16000,
      status: 'in-stock',
      lastUpdated: '2024-11-24',
      expiryDate: '2025-08-10',
      location: 'Laboratory - Cabinet 3'
    },
    {
      id: '5',
      name: 'Insulin Injection',
      sku: 'MED-078',
      category: 'Medicines',
      currentStock: 24,
      reorderLevel: 50,
      unit: 'Vials',
      unitPrice: 150.00,
      totalValue: 3600,
      status: 'low-stock',
      lastUpdated: '2024-11-23',
      expiryDate: '2025-01-15',
      location: 'Pharmacy - Refrigerator 1'
    },
    {
      id: '6',
      name: 'IV Fluid Set',
      sku: 'CON-089',
      category: 'Consumables',
      currentStock: 456,
      reorderLevel: 200,
      unit: 'Sets',
      unitPrice: 45.00,
      totalValue: 20520,
      status: 'in-stock',
      lastUpdated: '2024-11-21',
      expiryDate: '2025-11-30',
      location: 'ICU - Storage Unit 2'
    },
    {
      id: '7',
      name: 'Aspirin 75mg',
      sku: 'MED-012',
      category: 'Medicines',
      currentStock: 500,
      reorderLevel: 300,
      unit: 'Tablets',
      unitPrice: 1.50,
      totalValue: 750,
      status: 'expiring-soon',
      lastUpdated: '2024-11-19',
      expiryDate: '2024-12-15',
      location: 'Pharmacy - Shelf B3'
    },
    {
      id: '8',
      name: 'Stethoscope',
      sku: 'EQP-034',
      category: 'Equipment',
      currentStock: 45,
      reorderLevel: 20,
      unit: 'Pieces',
      unitPrice: 850.00,
      totalValue: 38250,
      status: 'in-stock',
      lastUpdated: '2024-11-18',
      expiryDate: 'N/A',
      location: 'Equipment Room - Rack 5'
    },
    {
      id: '9',
      name: 'Sterile Gauze',
      sku: 'DIS-067',
      category: 'Disposables',
      currentStock: 35,
      reorderLevel: 100,
      unit: 'Packs',
      unitPrice: 12.00,
      totalValue: 420,
      status: 'low-stock',
      lastUpdated: '2024-11-24',
      expiryDate: '2026-05-20',
      location: 'OT - Cabinet 1'
    },
    {
      id: '10',
      name: 'Blood Pressure Monitor',
      sku: 'EQP-056',
      category: 'Equipment',
      currentStock: 28,
      reorderLevel: 15,
      unit: 'Pieces',
      unitPrice: 1200.00,
      totalValue: 33600,
      status: 'in-stock',
      lastUpdated: '2024-11-22',
      expiryDate: 'N/A',
      location: 'OPD - Equipment Cabinet'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>;
      case 'expiring-soon':
        return <Badge className="bg-orange-100 text-orange-700"><Calendar className="w-3 h-3 mr-1" />Expiring Soon</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-gray-100 text-gray-700"><XCircle className="w-3 h-3 mr-1" />Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
                  Inventory Items
                </h1>
                <p className="text-sm text-gray-500 mt-1">{filteredItems.length} items found</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={onAddItem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Medicines">Medicines</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Disposables">Disposables</SelectItem>
              <SelectItem value="Lab Supplies">Lab Supplies</SelectItem>
              <SelectItem value="Consumables">Consumables</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="stock-low">Stock (Low to High)</SelectItem>
              <SelectItem value="stock-high">Stock (High to Low)</SelectItem>
              <SelectItem value="value">Total Value</SelectItem>
              <SelectItem value="expiry">Expiry Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Item Details</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewItem(item.id)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{item.sku}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          item.currentStock <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {item.currentStock.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {item.reorderLevel.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-gray-900">
                        ₹{item.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900">
                        ₹{item.totalValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{item.location}</span>
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewItem(item.id)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Item</DropdownMenuItem>
                            <DropdownMenuItem>Stock In</DropdownMenuItem>
                            <DropdownMenuItem>Stock Out</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
