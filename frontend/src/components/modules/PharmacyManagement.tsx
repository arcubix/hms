import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Pill,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Truck,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  Printer,
  Clock,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Receipt,
  Barcode,
  Tag,
  Archive,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AdvancedPOS } from '../pharmacy/AdvancedPOS';
import { AddSupplier } from '../pharmacy/AddSupplier';
import { StockAdjustments } from '../pharmacy/StockAdjustments';
import { BarcodeManagement } from '../pharmacy/BarcodeManagement';
import { StockMovements } from '../pharmacy/StockMovements';
import { StockManagement } from '../pharmacy/StockManagement';
import { PurchaseOrders } from '../pharmacy/PurchaseOrders';
import { SalesHistory } from '../pharmacy/SalesHistory';
import { RefundProcessing } from '../pharmacy/RefundProcessing';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  form: string;
  strength: string;
  unitPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  barcode: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Batch {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  manufacturer: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  status: 'active' | 'expiring-soon' | 'expired';
}

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  creditLimit: number;
  outstanding: number;
  status: 'active' | 'inactive';
  rating: number;
  brands?: string[];
  totalTargets?: number;
  linkedDoctors?: number;
  commission?: number;
  totalOrders?: number;
}

interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  status: 'completed' | 'pending' | 'refunded';
}

interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: 'paid' | 'pending';
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
}

interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'Analgesics',
    manufacturer: 'PharmaCorp',
    form: 'Tablet',
    strength: '500mg',
    unitPrice: 2.5,
    sellingPrice: 5.0,
    stock: 500,
    minStock: 100,
    maxStock: 1000,
    location: 'Shelf A-1',
    supplier: 'MedSupply Co',
    barcode: '8901234567890',
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    manufacturer: 'BioMed',
    form: 'Capsule',
    strength: '250mg',
    unitPrice: 8.0,
    sellingPrice: 15.0,
    stock: 45,
    minStock: 50,
    maxStock: 500,
    location: 'Shelf B-2',
    supplier: 'Global Pharma',
    barcode: '8901234567891',
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    category: 'Diabetes',
    manufacturer: 'DiabetCare',
    form: 'Injection',
    strength: '100IU/ml',
    unitPrice: 45.0,
    sellingPrice: 85.0,
    stock: 0,
    minStock: 20,
    maxStock: 100,
    location: 'Refrigerator-1',
    supplier: 'HealthMed Inc',
    barcode: '8901234567892',
    status: 'out-of-stock'
  }
];

const mockBatches: Batch[] = [
  {
    id: '1',
    medicineId: '1',
    medicineName: 'Paracetamol 500mg',
    batchNumber: 'BAT001-2024',
    manufacturer: 'PharmaCorp',
    manufactureDate: '2024-01-15',
    expiryDate: '2026-01-15',
    quantity: 500,
    costPrice: 2.5,
    sellingPrice: 5.0,
    supplier: 'MedSupply Co',
    status: 'active'
  },
  {
    id: '2',
    medicineId: '2',
    medicineName: 'Amoxicillin 250mg',
    batchNumber: 'BAT002-2024',
    manufacturer: 'BioMed',
    manufactureDate: '2024-06-20',
    expiryDate: '2025-12-20',
    quantity: 45,
    costPrice: 8.0,
    sellingPrice: 15.0,
    supplier: 'Global Pharma',
    status: 'expiring-soon'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'John Anderson',
    company: 'MedSupply Co',
    email: 'john@medsupply.com',
    phone: '+92-300-1234567',
    address: '123 Medical Street',
    city: 'Karachi',
    country: 'Pakistan',
    taxId: 'TAX-12345',
    creditLimit: 500000,
    outstanding: 125000,
    status: 'active',
    rating: 4.5,
    brands: ['PharmaCorp International', 'HealthPlus Generic'],
    totalTargets: 5,
    linkedDoctors: 12,
    commission: 7.5,
    totalOrders: 248
  },
  {
    id: '2',
    name: 'Sarah Williams',
    company: 'Global Pharma',
    email: 'sarah@globalpharma.com',
    phone: '+92-321-9876543',
    address: '456 Health Avenue',
    city: 'Lahore',
    country: 'Pakistan',
    taxId: 'TAX-67890',
    creditLimit: 750000,
    outstanding: 250000,
    status: 'active',
    rating: 4.8,
    brands: ['BioMed Solutions', 'CarePlus Pharma'],
    totalTargets: 8,
    linkedDoctors: 18,
    commission: 8.5,
    totalOrders: 352
  }
];

const mockSales: Sale[] = [
  {
    id: '1',
    invoiceNo: 'INV-2024-001',
    date: '2024-11-10',
    time: '10:30 AM',
    customerName: 'Ahmed Khan',
    customerPhone: '+92-300-1111111',
    items: [
      {
        medicineId: '1',
        medicineName: 'Paracetamol 500mg',
        quantity: 20,
        unitPrice: 5.0,
        discount: 0,
        total: 100
      }
    ],
    subtotal: 100,
    discount: 5,
    tax: 14,
    total: 109,
    paymentMethod: 'cash',
    status: 'completed'
  }
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-11-08',
    category: 'Utilities',
    description: 'Electricity Bill - November',
    amount: 15000,
    paymentMethod: 'Bank Transfer',
    reference: 'REF-001',
    status: 'paid'
  },
  {
    id: '2',
    date: '2024-11-09',
    category: 'Salaries',
    description: 'Staff Salaries - November',
    amount: 250000,
    paymentMethod: 'Bank Transfer',
    reference: 'REF-002',
    status: 'paid'
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplier: 'MedSupply Co',
    orderDate: '2024-11-05',
    expectedDate: '2024-11-15',
    items: [
      {
        medicineId: '1',
        medicineName: 'Paracetamol 500mg',
        quantity: 1000,
        unitPrice: 2.5,
        total: 2500
      }
    ],
    subtotal: 2500,
    tax: 350,
    shipping: 150,
    total: 3000,
    status: 'pending'
  }
];

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757', '#9B51E0'];

export function PharmacyManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines] = useState<Medicine[]>(mockMedicines);
  const [batches] = useState<Batch[]>(mockBatches);
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [sales] = useState<Sale[]>(mockSales);
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [purchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  
  // Dialog states
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => {
    const salesData = [
      { month: 'Jan', sales: 45000, purchases: 30000 },
      { month: 'Feb', sales: 52000, purchases: 35000 },
      { month: 'Mar', sales: 48000, purchases: 32000 },
      { month: 'Apr', sales: 61000, purchases: 40000 },
      { month: 'May', sales: 55000, purchases: 38000 },
      { month: 'Jun', sales: 67000, purchases: 45000 }
    ];

    const categoryData = [
      { name: 'Analgesics', value: 35 },
      { name: 'Antibiotics', value: 25 },
      { name: 'Diabetes', value: 20 },
      { name: 'Cardiovascular', value: 15 },
      { name: 'Others', value: 5 }
    ];

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">PKR 67,000</h3>
              <p className="text-sm text-gray-600">Monthly Sales</p>
              <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-700">{medicines.length}</Badge>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{medicines.reduce((sum, m) => sum + m.stock, 0)}</h3>
              <p className="text-sm text-gray-600">Total Stock Units</p>
              <p className="text-xs text-gray-500 mt-2">{medicines.length} medicine types</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">Alert</Badge>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {medicines.filter(m => m.status === 'low-stock' || m.status === 'out-of-stock').length}
              </h3>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-xs text-yellow-600 mt-2">Action required</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-700">Soon</Badge>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {batches.filter(b => b.status === 'expiring-soon').length}
              </h3>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-xs text-purple-600 mt-2">Within 6 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Sales vs Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="purchases" stackId="2" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Inventory by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Recent Sales
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('sales')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{sale.invoiceNo}</p>
                      <p className="text-sm text-gray-600">{sale.customerName}</p>
                      <p className="text-xs text-gray-500">{sale.date} • {sale.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">PKR {sale.total}</p>
                      <Badge className={sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {sale.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Stock Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('stock-alert')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {medicines.filter(m => m.status === 'low-stock' || m.status === 'out-of-stock').map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.strength} • {medicine.form}</p>
                      <p className="text-xs text-gray-500">Min Stock: {medicine.minStock} units</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${medicine.status === 'out-of-stock' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {medicine.stock}
                      </p>
                      <Badge className={getStockStatusColor(medicine.status)}>
                        {medicine.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderMedicineList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicine List</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your medicine inventory</p>
        </div>
        <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl">Add New Medicine</DialogTitle>
              <DialogDescription>
                Enter the medicine details to add to inventory
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                  <TabsTrigger value="supplier">Supplier Info</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Medicine Name *</Label>
                      <Input placeholder="e.g., Paracetamol" className="mt-2" />
                    </div>
                    <div>
                      <Label>Generic Name</Label>
                      <Input placeholder="e.g., Acetaminophen" className="mt-2" />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analgesics">Analgesics</SelectItem>
                          <SelectItem value="antibiotics">Antibiotics</SelectItem>
                          <SelectItem value="diabetes">Diabetes</SelectItem>
                          <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Manufacturer</Label>
                      <Input placeholder="e.g., PharmaCorp" className="mt-2" />
                    </div>
                    <div>
                      <Label>Form *</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tablet">Tablet</SelectItem>
                          <SelectItem value="capsule">Capsule</SelectItem>
                          <SelectItem value="syrup">Syrup</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                          <SelectItem value="cream">Cream</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Strength</Label>
                      <Input placeholder="e.g., 500mg" className="mt-2" />
                    </div>
                    <div className="col-span-2">
                      <Label>Barcode</Label>
                      <div className="flex gap-2 mt-2">
                        <Input placeholder="Enter or scan barcode" />
                        <Button variant="outline">
                          <Barcode className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit Cost Price (PKR) *</Label>
                      <Input type="number" placeholder="0.00" className="mt-2" />
                    </div>
                    <div>
                      <Label>Selling Price (PKR) *</Label>
                      <Input type="number" placeholder="0.00" className="mt-2" />
                    </div>
                    <div>
                      <Label>Current Stock</Label>
                      <Input type="number" placeholder="0" className="mt-2" />
                    </div>
                    <div>
                      <Label>Minimum Stock Level *</Label>
                      <Input type="number" placeholder="e.g., 100" className="mt-2" />
                    </div>
                    <div>
                      <Label>Maximum Stock Level</Label>
                      <Input type="number" placeholder="e.g., 1000" className="mt-2" />
                    </div>
                    <div>
                      <Label>Storage Location</Label>
                      <Input placeholder="e.g., Shelf A-1" className="mt-2" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="supplier" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Supplier *</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Lead Time (Days)</Label>
                      <Input type="number" placeholder="e.g., 7" className="mt-2" />
                    </div>
                    <div className="col-span-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Additional information about this medicine..." className="mt-2" rows={4} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsAddMedicineOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search medicines by name, category, or barcode..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="analgesics">Analgesics</SelectItem>
                <SelectItem value="antibiotics">Antibiotics</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Form & Strength</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => (
                <TableRow key={medicine.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-xs text-gray-600">{medicine.genericName}</p>
                      <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{medicine.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {medicine.form} • {medicine.strength}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{medicine.stock} units</p>
                      <p className="text-xs text-gray-500">Min: {medicine.minStock}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">PKR {medicine.unitPrice}</TableCell>
                  <TableCell className="text-sm font-medium text-green-600">PKR {medicine.sellingPrice}</TableCell>
                  <TableCell className="text-sm text-gray-600">{medicine.location}</TableCell>
                  <TableCell>
                    <Badge className={getStockStatusColor(medicine.status)}>
                      {medicine.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales History</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all sales transactions</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setActiveSection('add-sale')}>
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input placeholder="Search by invoice, customer..." className="pl-10" />
            </div>
            <Input type="date" className="w-48" />
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Invoice #</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{sale.date}</p>
                      <p className="text-xs text-gray-500">{sale.time}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{sale.customerName}</p>
                      <p className="text-xs text-gray-500">{sale.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{sale.items.length} items</TableCell>
                  <TableCell className="text-sm">PKR {sale.subtotal}</TableCell>
                  <TableCell className="text-sm text-red-600">PKR {sale.discount}</TableCell>
                  <TableCell className="text-sm">PKR {sale.tax}</TableCell>
                  <TableCell className="font-bold text-green-600">PKR {sale.total}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuppliers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicine Suppliers</h2>
          <p className="text-sm text-gray-600 mt-1">Manage supplier relationships, brands, targets & commissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveSection('add-supplier')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Brands</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.reduce((sum, s) => sum + (s.brands?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Linked Doctors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliers.reduce((sum, s) => sum + (s.linkedDoctors || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {supplier.company.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{supplier.company}</CardTitle>
                    <p className="text-sm text-gray-600">{supplier.name}</p>
                  </div>
                </div>
                <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {supplier.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Contact Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{supplier.city}, {supplier.country}</span>
                </div>

                {/* Brands */}
                {supplier.brands && supplier.brands.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2">Brands:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.brands.map((brand, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Targets</p>
                      <p className="text-sm font-bold text-blue-600">{supplier.totalTargets || 0}</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Doctors</p>
                      <p className="text-sm font-bold text-purple-600">{supplier.linkedDoctors || 0}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Commission</p>
                      <p className="text-sm font-bold text-green-600">{supplier.commission || 0}%</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Orders</p>
                      <p className="text-sm font-bold text-orange-600">{supplier.totalOrders || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Credit Limit:</span>
                    <span className="text-sm font-medium">PKR {supplier.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Outstanding:</span>
                    <span className="text-sm font-bold text-red-600">PKR {supplier.outstanding.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setActiveSection('add-supplier')}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBatches = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicine Batches</h2>
          <p className="text-sm text-gray-600 mt-1">Track medicine batches and expiry dates</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Batch
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Batch Number</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Mfg Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                  <TableCell className="text-sm">{batch.medicineName}</TableCell>
                  <TableCell className="text-sm text-gray-600">{batch.manufacturer}</TableCell>
                  <TableCell className="text-sm">{batch.manufactureDate}</TableCell>
                  <TableCell className="text-sm">{batch.expiryDate}</TableCell>
                  <TableCell className="font-medium">{batch.quantity} units</TableCell>
                  <TableCell className="text-sm">PKR {batch.costPrice}</TableCell>
                  <TableCell className="text-sm font-medium text-green-600">PKR {batch.sellingPrice}</TableCell>
                  <TableCell className="text-sm">{batch.supplier}</TableCell>
                  <TableCell>
                    <Badge className={getBatchStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Manage medicine procurement</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setActiveSection('create-po')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell className="text-sm">{po.supplier}</TableCell>
                  <TableCell className="text-sm">{po.orderDate}</TableCell>
                  <TableCell className="text-sm">{po.expectedDate}</TableCell>
                  <TableCell className="text-sm">{po.items.length} items</TableCell>
                  <TableCell className="text-sm">PKR {po.subtotal}</TableCell>
                  <TableCell className="text-sm">PKR {po.tax}</TableCell>
                  <TableCell className="text-sm">PKR {po.shipping}</TableCell>
                  <TableCell className="font-bold text-blue-600">PKR {po.total}</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">{po.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderStockAlert = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Medicine Stock Alerts</h2>
        <p className="text-sm text-gray-600 mt-1">Medicines requiring immediate attention</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-red-600 mb-1">
              {medicines.filter(m => m.status === 'out-of-stock').length}
            </h3>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-yellow-600 mb-1">
              {medicines.filter(m => m.status === 'low-stock').length}
            </h3>
            <p className="text-sm text-gray-600">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-green-600 mb-1">
              {medicines.filter(m => m.status === 'in-stock').length}
            </h3>
            <p className="text-sm text-gray-600">In Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Required Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.filter(m => m.status !== 'in-stock').map((medicine) => (
                <TableRow key={medicine.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-xs text-gray-600">{medicine.form} • {medicine.strength}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{medicine.category}</Badge></TableCell>
                  <TableCell className="font-bold text-red-600">{medicine.stock}</TableCell>
                  <TableCell className="text-sm">{medicine.minStock}</TableCell>
                  <TableCell className="font-bold text-blue-600">{medicine.minStock - medicine.stock}</TableCell>
                  <TableCell>
                    <Badge className={getStockStatusColor(medicine.status)}>
                      {medicine.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Order Now
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpiring = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Expiring Medicines</h2>
        <p className="text-sm text-gray-600 mt-1">Medicines expiring within the next 6 months</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Medicine</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.filter(b => b.status === 'expiring-soon' || b.status === 'expired').map((batch) => {
                const daysRemaining = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.medicineName}</TableCell>
                    <TableCell className="text-sm">{batch.batchNumber}</TableCell>
                    <TableCell className="text-sm font-medium text-red-600">{batch.expiryDate}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${daysRemaining < 30 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {daysRemaining} days
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{batch.quantity} units</TableCell>
                    <TableCell className="text-sm font-medium">PKR {(batch.quantity * batch.sellingPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getBatchStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm">
                          Return
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Dispose
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= EXPENSE MANAGEMENT =============
  
  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track and manage pharmacy expenses</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setActiveSection('add-expense')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-red-600" />
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">PKR {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-600">Total Expenses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <Badge>{expenses.filter(e => e.date === '2024-11-09').length}</Badge>
            </div>
            <p className="text-2xl font-bold text-orange-900">PKR {expenses.filter(e => e.date === '2024-11-09').reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-600">Today's Expenses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">{expenses.filter(e => e.status === 'paid').length}</Badge>
            </div>
            <p className="text-2xl font-bold text-green-900">{expenses.filter(e => e.status === 'paid').length}</p>
            <p className="text-xs text-gray-600">Paid Expenses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800">{expenses.filter(e => e.status === 'pending').length}</Badge>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{expenses.filter(e => e.status === 'pending').length}</p>
            <p className="text-xs text-gray-600">Pending Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm">{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{expense.description}</TableCell>
                  <TableCell className="text-sm font-bold text-red-600">PKR {expense.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{expense.paymentMethod}</TableCell>
                  <TableCell className="text-sm font-mono">{expense.reference}</TableCell>
                  <TableCell>
                    <Badge className={expense.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAddExpense = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Expense</h2>
          <p className="text-sm text-gray-600 mt-1">Record a new pharmacy expense</p>
        </div>
        <Button variant="outline" onClick={() => setActiveSection('expenses')}>
          ← Back to Expenses
        </Button>
      </div>

      <Card className="border-0 shadow-sm max-w-4xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expense Date *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="salaries">Salaries</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="supplies">Office Supplies</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Enter expense description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (PKR) *</Label>
                <Input 
                  type="number"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="debit-card">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input placeholder="REF-XXX" />
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Receipt/Invoice (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                <Input type="file" className="hidden" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Expense
              </Button>
              <Button variant="outline" onClick={() => setActiveSection('expenses')}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpenseCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Categories</h2>
          <p className="text-sm text-gray-600 mt-1">Manage expense categories</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Utilities', count: 1, total: 15000, color: 'bg-blue-500' },
          { name: 'Salaries', count: 1, total: 250000, color: 'bg-green-500' },
          { name: 'Rent', count: 0, total: 0, color: 'bg-purple-500' },
          { name: 'Maintenance', count: 0, total: 0, color: 'bg-orange-500' },
          { name: 'Office Supplies', count: 0, total: 0, color: 'bg-pink-500' },
          { name: 'Marketing', count: 0, total: 0, color: 'bg-cyan-500' },
          { name: 'Transport', count: 0, total: 0, color: 'bg-yellow-500' },
          { name: 'Other', count: 0, total: 0, color: 'bg-gray-500' }
        ].map((category) => (
          <Card key={category.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
              <h3 className="font-semibold mb-2">{category.name}</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expenses</span>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">PKR {category.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pharmacy Reports</h2>
        <p className="text-sm text-gray-600 mt-1">Comprehensive financial and inventory reports</p>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="expense">Expense Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Overall pharmacy financial performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">PKR {sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">PKR {expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-900">
                    PKR {(sales.reduce((sum, sale) => sum + sale.total, 0) - expenses.reduce((sum, exp) => sum + exp.amount, 0)).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Current stock levels and valuation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{medicines.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">In Stock</p>
                  <p className="text-2xl font-bold text-green-900">{medicines.filter(m => m.status === 'in-stock').length}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold text-red-900">{medicines.filter(m => m.status === 'low-stock' || m.status === 'out-of-stock').length}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Sales performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-purple-900">{sales.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{sales.filter(s => s.status === 'completed').length}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{sales.filter(s => s.status === 'pending').length}</p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-cyan-900">PKR {sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Expense analysis by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { category: 'Utilities', amount: 15000, percentage: 5.7 },
                  { category: 'Salaries', amount: 250000, percentage: 94.3 }
                ].map((item) => (
                  <div key={item.category} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{item.category}</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">PKR {item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCreatePurchaseOrder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Purchase Order</h2>
          <p className="text-sm text-gray-600 mt-1">Create a new purchase order for medicines</p>
        </div>
        <Button variant="outline" onClick={() => setActiveSection('purchase-orders')}>
          ← Back to Purchase Orders
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* PO Header */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PO Number *</Label>
                <Input placeholder="Auto-generated" disabled value="PO-2024-002" />
              </div>
              <div className="space-y-2">
                <Label>Order Date *</Label>
                <Input type="date" defaultValue="2024-11-12" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery Date *</Label>
                <Input type="date" />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Order Items</h3>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.map((medicine) => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              {medicine.name} {medicine.strength}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" placeholder="0" className="w-24" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" placeholder="0.00" className="w-24" />
                    </TableCell>
                    <TableCell className="font-semibold">PKR 0.00</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-semibold">PKR 0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax (14%)</span>
                  <span className="font-semibold">PKR 0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <Input type="number" placeholder="0.00" className="w-32 text-right" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-blue-600">PKR 0.00</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Additional notes or instructions for this purchase order..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button variant="outline" onClick={() => setActiveSection('purchase-orders')}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'add-sale':
        return <AdvancedPOS />;
      case 'sales':
        return <SalesHistory />;
      case 'refunds':
        return <RefundProcessing />;
      case 'medicine-list':
        return renderMedicineList();
      case 'suppliers':
        return renderSuppliers();
      case 'add-supplier':
        return <AddSupplier />;
      case 'batches':
        return renderBatches();
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'create-po':
        return renderCreatePurchaseOrder();
      case 'expenses':
        return renderExpenses();
      case 'add-expense':
        return renderAddExpense();
      case 'expense-categories':
        return renderExpenseCategories();
      case 'reports':
        return renderReports();
      case 'stock-alert':
        return <StockManagement defaultTab="low-stock" />;
      case 'expiring':
        return <StockManagement defaultTab="expiring" />;
      case 'stock-adjustments':
        return <StockAdjustments />;
      case 'barcode-management':
        return <BarcodeManagement />;
      case 'stock-movements':
        return <StockMovements />;
      case 'stock-management':
        return <StockManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pharmacy Management System</h1>
              <p className="text-sm text-blue-100">Complete pharmacy control & inventory management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-72 bg-slate-800 text-white min-h-screen p-4">
          <div className="space-y-6">
            {/* Pharmacy Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Pill className="w-5 h-5" />
                <h3 className="font-semibold">Pharmacy</h3>
              </div>
              <nav className="space-y-1">
                <NavItem
                  label="Dashboard"
                  active={activeSection === 'dashboard'}
                  onClick={() => setActiveSection('dashboard')}
                />
                <NavItem
                  label="Sales"
                  active={activeSection === 'sales'}
                  onClick={() => setActiveSection('sales')}
                />
                <NavItem
                  label="Add New Sale"
                  active={activeSection === 'add-sale'}
                  onClick={() => setActiveSection('add-sale')}
                />
                <NavItem
                  label="Returns & Refunds"
                  active={activeSection === 'refunds'}
                  onClick={() => setActiveSection('refunds')}
                />
                <NavItem
                  label="Expense"
                  active={activeSection === 'expenses'}
                  onClick={() => setActiveSection('expenses')}
                />
                <NavItem
                  label="Add Expense"
                  active={activeSection === 'add-expense'}
                  onClick={() => setActiveSection('add-expense')}
                />
                <NavItem
                  label="Expense Categories"
                  active={activeSection === 'expense-categories'}
                  onClick={() => setActiveSection('expense-categories')}
                />
                <NavItem
                  label="Report"
                  active={activeSection === 'reports'}
                  onClick={() => setActiveSection('reports')}
                />
              </nav>
            </div>

            {/* Medicine Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Package className="w-5 h-5" />
                <h3 className="font-semibold">Medicine</h3>
              </div>
              <nav className="space-y-1">
                <NavItem
                  label="Medicine List"
                  active={activeSection === 'medicine-list'}
                  onClick={() => setActiveSection('medicine-list')}
                />
                <NavItem
                  label="Add Medicine"
                  active={activeSection === 'add-medicine'}
                  onClick={() => setActiveSection('add-medicine')}
                />
                <NavItem
                  label="Medicine Category"
                  active={activeSection === 'medicine-category'}
                  onClick={() => setActiveSection('medicine-category')}
                />
                <NavItem
                  label="Add Category"
                  active={activeSection === 'add-category'}
                  onClick={() => setActiveSection('add-category')}
                />
                <NavItem
                  label="Medicine Stock Alert"
                  active={activeSection === 'stock-alert'}
                  onClick={() => setActiveSection('stock-alert')}
                />
                <NavItem
                  label="Medicine Suppliers"
                  active={activeSection === 'suppliers'}
                  onClick={() => setActiveSection('suppliers')}
                />
                <NavItem
                  label="Add Supplier"
                  active={activeSection === 'add-supplier'}
                  onClick={() => setActiveSection('add-supplier')}
                />
                <NavItem
                  label="Purchase Orders"
                  active={activeSection === 'purchase-orders'}
                  onClick={() => setActiveSection('purchase-orders')}
                />
                <NavItem
                  label="Create Purchase Order"
                  active={activeSection === 'create-po'}
                  onClick={() => setActiveSection('create-po')}
                />
                <NavItem
                  label="Medicine Batches"
                  active={activeSection === 'batches'}
                  onClick={() => setActiveSection('batches')}
                />
                <NavItem
                  label="Expiring Medicines"
                  active={activeSection === 'expiring'}
                  onClick={() => setActiveSection('expiring')}
                />
                <NavItem
                  label="Stock Management"
                  active={activeSection === 'stock-management'}
                  onClick={() => setActiveSection('stock-management')}
                />
                <NavItem
                  label="Stock Adjustments"
                  active={activeSection === 'stock-adjustments'}
                  onClick={() => setActiveSection('stock-adjustments')}
                />
                <NavItem
                  label="Barcode Management"
                  active={activeSection === 'barcode-management'}
                  onClick={() => setActiveSection('barcode-management')}
                />
                <NavItem
                  label="Stock Movements"
                  active={activeSection === 'stock-movements'}
                  onClick={() => setActiveSection('stock-movements')}
                />
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-gray-500 border border-gray-400'}`} />
      <span className="text-sm">{label}</span>
    </button>
  );
}
