import { useState, useEffect } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  CreditCard,
  RefreshCw,
  Receipt,
  RotateCcw,
  Plus,
  Edit,
  Upload,
  FileText,
  ShoppingBag,
  Settings,
  Percent,
  BarChart3
} from 'lucide-react';
import { User } from '../../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AdvancedPOS } from '../pharmacy/AdvancedPOS';
import { PurchaseOrders } from '../pharmacy/PurchaseOrders';
import { StockManagement } from '../pharmacy/StockManagement';
import { Transactions } from '../pharmacy/Transactions';
import { ShiftManagement } from '../pharmacy/ShiftManagement';
import { POSSettings } from '../pharmacy/POSSettings';
import { GSTRatesManagement } from '../pharmacy/GSTRatesManagement';
import { POSReports } from '../pharmacy/POSReports';
import { api, SalesSummary, LowStockAlert, PurchaseOrder, ExpiringStock } from '../../services/api';
import { toast } from 'sonner';

interface PharmacyDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <Pill className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'POS System', id: 'pos' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Shift Management', id: 'shifts' },
  { icon: <ShoppingCart className="w-5 h-5" />, label: 'Prescriptions', id: 'prescriptions', badge: '8' },
  { icon: <Package className="w-5 h-5" />, label: 'Inventory', id: 'inventory' },
  { icon: <Receipt className="w-5 h-5" />, label: 'Transactions', id: 'transactions' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'POS Reports', id: 'reports' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Orders', id: 'orders' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', id: 'settings' }
];

const pendingPrescriptions = [
  {
    id: 'RX001',
    patientName: 'John Smith',
    patientId: 'P001',
    doctorName: 'Dr. Michael Chen',
    medication: 'Lisinopril 10mg',
    quantity: '30 tablets',
    refills: 2,
    orderDate: '2024-01-15',
    status: 'pending',
    priority: 'routine'
  },
  {
    id: 'RX002',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    doctorName: 'Dr. Sarah Williams',
    medication: 'Insulin Glargine',
    quantity: '1 vial',
    refills: 5,
    orderDate: '2024-01-15',
    status: 'ready',
    priority: 'urgent'
  },
  {
    id: 'RX003',
    patientName: 'Michael Brown',
    patientId: 'P003',
    doctorName: 'Dr. Robert Johnson',
    medication: 'Morphine 10mg',
    quantity: '20 tablets',
    refills: 0,
    orderDate: '2024-01-15',
    status: 'dispensed',
    priority: 'stat'
  }
];

interface InventoryItem {
  id: string | number;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  expiryDate: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock';
  medicine_id?: number;
  batch_number?: string;
}

export function PharmacyDashboard({ user, onLogout }: PharmacyDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [todaySales, setTodaySales] = useState<SalesSummary | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [expiringItems, setExpiringItems] = useState<ExpiringStock[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showStockOrderDialog, setShowStockOrderDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Form state for Add/Edit Item
  const [itemFormData, setItemFormData] = useState({
    name: '',
    generic_name: '',
    category: '',
    strength: '',
    unit: '',
    min_stock: '',
    max_stock: '',
    requires_prescription: false,
    status: 'Active',
    image_url: ''
  });
  
  // Form state for Stock via Order
  const [stockOrderFormData, setStockOrderFormData] = useState({
    supplier_id: '',
    batch_number: '',
    manufacture_date: '',
    expiry_date: '',
    quantity: '',
    cost_price: '',
    selling_price: '',
    location: '',
    notes: ''
  });

  const loadInventoryData = async () => {
    try {
      setLoadingInventory(true);
      
      // Load medicines and stock data
      const [medicines, stockData] = await Promise.all([
        api.getMedicines({ status: 'Active' }),
        api.getPharmacyStock({ status: 'Active', limit: 1000 })
      ]);

      // Group stock by medicine_id to calculate totals
      const stockMap = new Map<number, {
        totalStock: number;
        availableStock: number;
        minExpiry: string;
        minCost: number;
        batches: any[];
      }>();

      stockData.forEach((stock: any) => {
        const medId = stock.medicine_id;
        const available = (stock.quantity || 0) - (stock.reserved_quantity || 0);
        
        if (stockMap.has(medId)) {
          const existing = stockMap.get(medId)!;
          existing.totalStock += stock.quantity || 0;
          existing.availableStock += available;
          if (!existing.minExpiry || stock.expiry_date < existing.minExpiry) {
            existing.minExpiry = stock.expiry_date;
          }
          const stockCost = parseFloat(stock.cost_price?.toString() || '0') || 0;
          if (!existing.minCost || stockCost < existing.minCost) {
            existing.minCost = stockCost;
          }
          existing.batches.push(stock);
        } else {
          stockMap.set(medId, {
            totalStock: stock.quantity || 0,
            availableStock: available,
            minExpiry: stock.expiry_date,
            minCost: parseFloat(stock.cost_price?.toString() || '0') || 0,
            batches: [stock]
          });
        }
      });

      // Combine medicines with stock data
      // Show all medicines, even if they don't have stock yet
      const inventory: InventoryItem[] = medicines
        .map(med => {
          const stockInfo = stockMap.get(med.id);
          const availableStock = stockInfo ? stockInfo.availableStock : 0;
          const minStock = med.min_stock || 0;
          const maxStock = med.max_stock || 1000;
          
          // Determine status
          let status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock';
          if (availableStock === 0) {
            status = 'out_of_stock';
          } else if (availableStock <= minStock * 0.2) {
            status = 'critical';
          } else if (availableStock <= minStock) {
            status = 'low_stock';
          } else {
            status = 'in_stock';
          }

          return {
            id: med.id,
            name: `${med.name}${med.strength ? ' ' + med.strength : ''}${med.unit ? ' ' + med.unit : ''}`,
            category: med.category || 'Uncategorized',
            currentStock: availableStock,
            minStock: minStock,
            maxStock: maxStock,
            unitCost: stockInfo ? parseFloat(stockInfo.minCost?.toString() || '0') : 0,
            expiryDate: stockInfo?.minExpiry || '',
            supplier: stockInfo?.batches[0]?.supplier_name || 'N/A',
            status: status,
            medicine_id: med.id,
            batch_number: stockInfo?.batches[0]?.batch_number
          };
        })
        .filter(item => {
          // Filter by search term if provided
          if (!searchTerm) return true;
          const search = searchTerm.toLowerCase();
          return (
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.supplier.toLowerCase().includes(search)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setInventoryItems(inventory);
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadDashboardData();
    } else if (activeSection === 'inventory') {
      loadInventoryData();
      loadMedicines();
      loadSuppliers();
    }
  }, [activeSection, searchTerm]);

  const loadMedicines = async () => {
    try {
      const data = await api.getMedicines({ status: 'Active' });
      setMedicines(data);
    } catch (error: any) {
      console.error('Failed to load medicines:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await api.getSuppliers({ status: 'Active' });
      setSuppliers(data);
    } catch (error: any) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const handleAddItem = () => {
    setItemFormData({
      name: '',
      generic_name: '',
      category: '',
      strength: '',
      unit: '',
      min_stock: '',
      max_stock: '',
      requires_prescription: false,
      status: 'Active',
      image_url: ''
    });
    setShowAddItemDialog(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    const medicine = medicines.find(m => m.id === item.medicine_id);
    if (medicine) {
      setItemFormData({
        name: medicine.name || '',
        generic_name: medicine.generic_name || '',
        category: medicine.category || '',
        strength: medicine.strength || '',
        unit: medicine.unit || '',
        min_stock: medicine.min_stock?.toString() || '',
        max_stock: medicine.max_stock?.toString() || '',
        requires_prescription: medicine.requires_prescription || false,
        status: medicine.status || 'Active',
        image_url: (medicine as any).image_url || (medicine as any).image || ''
      });
      setSelectedItem(item);
      setShowEditItemDialog(true);
    }
  };

  const handleSaveItem = async () => {
    try {
      if (!itemFormData.name) {
        toast.error('Medicine name is required');
        return;
      }

      const medicineData: any = {
        name: itemFormData.name,
        generic_name: itemFormData.generic_name,
        category: itemFormData.category,
        strength: itemFormData.strength,
        unit: itemFormData.unit,
        min_stock: itemFormData.min_stock ? parseInt(itemFormData.min_stock) : 0,
        max_stock: itemFormData.max_stock ? parseInt(itemFormData.max_stock) : 1000,
        requires_prescription: itemFormData.requires_prescription ? 1 : 0,
        status: itemFormData.status
      };
      
      // Add image_url if provided
      if (itemFormData.image_url) {
        medicineData.image_url = itemFormData.image_url;
      }

      if (selectedItem) {
        // Update existing medicine
        await api.updateMedicine(selectedItem.medicine_id!.toString(), medicineData);
        toast.success('Medicine updated successfully');
        setShowEditItemDialog(false);
      } else {
        // Create new medicine
        await api.createMedicine(medicineData);
        toast.success('Medicine added successfully');
        setShowAddItemDialog(false);
      }

      setSelectedItem(null);
      await loadInventoryData();
      await loadMedicines();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save medicine');
    }
  };

  const handleImportItems = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        try {
          const medicineData = {
            name: row.name || row.medicine_name || '',
            generic_name: row.generic_name || row.generic || '',
            category: row.category || '',
            strength: row.strength || '',
            unit: row.unit || '',
            min_stock: row.min_stock ? parseInt(row.min_stock) : 0,
            max_stock: row.max_stock ? parseInt(row.max_stock) : 1000,
            requires_prescription: row.requires_prescription === 'true' || row.requires_prescription === '1' ? 1 : 0,
            status: row.status || 'Active'
          };

          if (medicineData.name) {
            await api.createMedicine(medicineData);
            successCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Error importing row ${i + 1}:`, err);
        }
      }

      toast.success(`Imported ${successCount} items successfully${errorCount > 0 ? `, ${errorCount} errors` : ''}`);
      setShowImportDialog(false);
      await loadInventoryData();
      await loadMedicines();
    } catch (error: any) {
      toast.error('Failed to import items: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddStockViaOrder = async () => {
    try {
      if (!selectedItem || !stockOrderFormData.supplier_id || !stockOrderFormData.batch_number || !stockOrderFormData.quantity) {
        toast.error('Please fill in all required fields');
        return;
      }

      const stockData = {
        medicine_id: selectedItem.medicine_id!,
        batch_number: stockOrderFormData.batch_number,
        manufacture_date: stockOrderFormData.manufacture_date || null,
        expiry_date: stockOrderFormData.expiry_date,
        quantity: parseInt(stockOrderFormData.quantity),
        cost_price: parseFloat(stockOrderFormData.cost_price || '0'),
        selling_price: parseFloat(stockOrderFormData.selling_price || '0'),
        location: stockOrderFormData.location || '',
        supplier_id: parseInt(stockOrderFormData.supplier_id),
        notes: stockOrderFormData.notes || ''
      };

      await api.createStock(stockData);
      toast.success('Stock added successfully');
      setShowStockOrderDialog(false);
      setStockOrderFormData({
        supplier_id: '',
        batch_number: '',
        manufacture_date: '',
        expiry_date: '',
        quantity: '',
        cost_price: '',
        selling_price: '',
        location: '',
        notes: ''
      });
      setSelectedItem(null);
      await loadInventoryData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add stock');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [salesData, alertsData, posData, expiringData] = await Promise.all([
        api.getSalesSummary(today, today).catch(() => null),
        api.getLowStockAlerts().catch(() => []),
        api.getPurchaseOrders({ status: 'Pending' }).catch(() => []),
        api.getExpiringStock(30).catch(() => [])
      ]);
      
      setTodaySales(salesData);
      setLowStockAlerts(alertsData);
      setPendingPOs(posData);
      setExpiringItems(expiringData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'dispensed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      case 'routine':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getStockColor = (current: number, min: number) => {
    if (current <= min * 0.2) return 'text-red-600';
    if (current <= min) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
        return <AdvancedPOS />;
      
      case 'shifts':
        return <ShiftManagement />;
      
      case 'orders':
        return <PurchaseOrders />;
      
      case 'transactions':
        return <Transactions />;
      
      case 'reports':
        return <POSReports />;
      
      case 'settings':
        return (
          <div className="p-6 space-y-6">
            <Tabs defaultValue="pos-settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pos-settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  POS Settings
                </TabsTrigger>
                <TabsTrigger value="gst-rates" className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  GST Rates
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pos-settings">
                <POSSettings />
              </TabsContent>
              <TabsContent value="gst-rates">
                <GSTRatesManagement />
              </TabsContent>
            </Tabs>
          </div>
        );
      
      case 'inventory':
        return <StockManagement />;
      
      case 'inventory-old':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl text-gray-900">Inventory Management</h1>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportDialog(true)}
                  className="!bg-white hover:!bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button 
                  onClick={handleAddItem}
                  className="!bg-blue-500 hover:!bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Medicine Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingInventory ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-gray-500">Loading inventory...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : inventoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <span className="text-sm text-gray-500">No inventory items found</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventoryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">ID: {item.id}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{item.category}</TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm ${getStockColor(item.currentStock, item.minStock)}`}>
                                  {item.currentStock}
                                </span>
                                <span className="text-xs text-gray-500">/ {item.maxStock}</span>
                              </div>
                              <Progress 
                                value={getStockPercentage(item.currentStock, item.maxStock)} 
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-900">Rs. {parseFloat(item.unitCost?.toString() || '0').toFixed(2)}</TableCell>
                          <TableCell>
                            {item.expiryDate ? (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                className="!bg-green-500 hover:!bg-green-600"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowStockOrderDialog(true);
                                }}
                              >
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                Add Stock
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Add Item Dialog */}
            <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
              <DialogContent className="!max-w-2xl !w-[90%] sm:!w-[640px]">
                <DialogHeader>
                  <DialogTitle>Add New Medicine</DialogTitle>
                  <DialogDescription>Add a new medicine to the inventory</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  {/* Image Preview/Upload */}
                  <div className="col-span-2 space-y-2">
                    <Label>Medicine Image</Label>
                    <div className="flex items-center gap-4">
                      {itemFormData.image_url ? (
                        <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                          <img 
                            src={itemFormData.image_url} 
                            alt={itemFormData.name || 'Medicine'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = `https://source.unsplash.com/200x200/?medicine,pill&sig=${itemFormData.name?.charCodeAt(0) || 1}`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <Pill className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <Input
                          type="url"
                          value={itemFormData.image_url}
                          onChange={(e) => setItemFormData({...itemFormData, image_url: e.target.value})}
                          placeholder="Enter image URL or leave empty for placeholder"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Generate a random placeholder image from Unsplash
                            const randomId = Math.floor(Math.random() * 1000);
                            setItemFormData({...itemFormData, image_url: `https://source.unsplash.com/400x400/?medicine,pill,pharmaceutical&sig=${randomId}`});
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Use Placeholder Image
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Medicine Name *</Label>
                    <Input
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Generic Name</Label>
                    <Input
                      value={itemFormData.generic_name}
                      onChange={(e) => setItemFormData({...itemFormData, generic_name: e.target.value})}
                      placeholder="e.g., Acetaminophen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={itemFormData.category}
                      onChange={(e) => setItemFormData({...itemFormData, category: e.target.value})}
                      placeholder="e.g., Analgesics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Strength</Label>
                    <Input
                      value={itemFormData.strength}
                      onChange={(e) => setItemFormData({...itemFormData, strength: e.target.value})}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={itemFormData.unit}
                      onChange={(e) => setItemFormData({...itemFormData, unit: e.target.value})}
                      placeholder="e.g., Tablet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={itemFormData.status} onValueChange={(v) => setItemFormData({...itemFormData, status: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Stock</Label>
                    <Input
                      type="number"
                      value={itemFormData.min_stock}
                      onChange={(e) => setItemFormData({...itemFormData, min_stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Stock</Label>
                    <Input
                      type="number"
                      value={itemFormData.max_stock}
                      onChange={(e) => setItemFormData({...itemFormData, max_stock: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requires_prescription"
                        checked={itemFormData.requires_prescription}
                        onChange={(e) => setItemFormData({...itemFormData, requires_prescription: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="requires_prescription">Requires Prescription</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>Cancel</Button>
                  <Button onClick={handleSaveItem} className="!bg-blue-500 hover:!bg-blue-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
              <DialogContent className="!max-w-2xl !w-[90%] sm:!w-[640px]">
                <DialogHeader>
                  <DialogTitle>Edit Medicine</DialogTitle>
                  <DialogDescription>Update medicine information</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  {/* Image Preview/Upload */}
                  <div className="col-span-2 space-y-2">
                    <Label>Medicine Image</Label>
                    <div className="flex items-center gap-4">
                      {itemFormData.image_url ? (
                        <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                          <img 
                            src={itemFormData.image_url} 
                            alt={itemFormData.name || 'Medicine'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = `https://source.unsplash.com/200x200/?medicine,pill&sig=${itemFormData.name?.charCodeAt(0) || 1}`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <Pill className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <Input
                          type="url"
                          value={itemFormData.image_url}
                          onChange={(e) => setItemFormData({...itemFormData, image_url: e.target.value})}
                          placeholder="Enter image URL or leave empty for placeholder"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Generate a random placeholder image from Unsplash
                            const randomId = Math.floor(Math.random() * 1000);
                            setItemFormData({...itemFormData, image_url: `https://source.unsplash.com/400x400/?medicine,pill,pharmaceutical&sig=${randomId}`});
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Use Placeholder Image
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Medicine Name *</Label>
                    <Input
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Generic Name</Label>
                    <Input
                      value={itemFormData.generic_name}
                      onChange={(e) => setItemFormData({...itemFormData, generic_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={itemFormData.category}
                      onChange={(e) => setItemFormData({...itemFormData, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Strength</Label>
                    <Input
                      value={itemFormData.strength}
                      onChange={(e) => setItemFormData({...itemFormData, strength: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={itemFormData.unit}
                      onChange={(e) => setItemFormData({...itemFormData, unit: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={itemFormData.status} onValueChange={(v) => setItemFormData({...itemFormData, status: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Stock</Label>
                    <Input
                      type="number"
                      value={itemFormData.min_stock}
                      onChange={(e) => setItemFormData({...itemFormData, min_stock: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Stock</Label>
                    <Input
                      type="number"
                      value={itemFormData.max_stock}
                      onChange={(e) => setItemFormData({...itemFormData, max_stock: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit_requires_prescription"
                        checked={itemFormData.requires_prescription}
                        onChange={(e) => setItemFormData({...itemFormData, requires_prescription: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="edit_requires_prescription">Requires Prescription</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowEditItemDialog(false);
                    setSelectedItem(null);
                  }}>Cancel</Button>
                  <Button onClick={handleSaveItem} className="!bg-blue-500 hover:!bg-blue-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Medicine
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogContent className="!max-w-md !w-[90%] sm:!w-[448px]">
                <DialogHeader>
                  <DialogTitle>Import Items</DialogTitle>
                  <DialogDescription>Upload a CSV file to import multiple medicines</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <Label htmlFor="import-file" className="cursor-pointer">
                      <span className="text-blue-500 hover:text-blue-600">Click to upload</span> or drag and drop
                    </Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImportItems(file);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      CSV format: name, generic_name, category, strength, unit, min_stock, max_stock, requires_prescription, status
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Stock via Order Dialog */}
            <Dialog open={showStockOrderDialog} onOpenChange={setShowStockOrderDialog}>
              <DialogContent className="!max-w-2xl !w-[90%] sm:!w-[640px]">
                <DialogHeader>
                  <DialogTitle>Add Stock via Supplier Order</DialogTitle>
                  <DialogDescription>
                    {selectedItem ? `Add stock for ${selectedItem.name}` : 'Add new stock batch'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Supplier *</Label>
                    <Select 
                      value={stockOrderFormData.supplier_id} 
                      onValueChange={(v) => setStockOrderFormData({...stockOrderFormData, supplier_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.company_name || supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Batch Number *</Label>
                    <Input
                      value={stockOrderFormData.batch_number}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, batch_number: e.target.value})}
                      placeholder="BATCH001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacture Date</Label>
                    <Input
                      type="date"
                      value={stockOrderFormData.manufacture_date}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, manufacture_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={stockOrderFormData.expiry_date}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, expiry_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={stockOrderFormData.quantity}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, quantity: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stockOrderFormData.cost_price}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, cost_price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stockOrderFormData.selling_price}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, selling_price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={stockOrderFormData.location}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, location: e.target.value})}
                      placeholder="Shelf A-1"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={stockOrderFormData.notes}
                      onChange={(e) => setStockOrderFormData({...stockOrderFormData, notes: e.target.value})}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowStockOrderDialog(false);
                    setSelectedItem(null);
                  }}>Cancel</Button>
                  <Button onClick={handleAddStockViaOrder} className="!bg-green-500 hover:!bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Today's Sales"
                value={todaySales?.total_sales?.toString() || '0'}
                icon={<ShoppingCart className="w-6 h-6" />}
                trend={todaySales ? { value: todaySales.total_revenue, isPositive: true } : undefined}
                color="green"
              />
              <StatsCard
                title="Today's Revenue"
                value={`Rs. ${(Number(todaySales?.total_revenue) || 0).toFixed(2)}`}
                icon={<CreditCard className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Low Stock Items"
                value={lowStockAlerts.length.toString()}
                icon={<AlertTriangle className="w-6 h-6" />}
                color="red"
              />
              <StatsCard
                title="Pending POs"
                value={pendingPOs.length.toString()}
                icon={<Package className="w-6 h-6" />}
                color="yellow"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Prescriptions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Pending Prescriptions
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{prescription.patientName}</p>
                            <p className="text-xs text-gray-600">{prescription.medication}</p>
                            <p className="text-xs text-gray-500">
                              {prescription.quantity} • By {prescription.doctorName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(prescription.priority)}>
                              {prescription.priority}
                            </Badge>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                          {prescription.status === 'pending' ? (
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Fill
                            </Button>
                          ) : prescription.status === 'ready' ? (
                            <Button size="sm" variant="outline">
                              Dispense
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Low Stock Alerts ({lowStockAlerts.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={loadDashboardData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : lowStockAlerts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No low stock alerts</div>
                    ) : (
                      lowStockAlerts.slice(0, 5).map((alert, index) => (
                        <div key={alert.medicine_id || alert.id || `low-stock-${index}`} className="p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-500">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-900 font-medium">{alert.name}</p>
                              {alert.generic_name && (
                                <p className="text-xs text-gray-600">{alert.generic_name}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-red-600 font-medium">
                                  {alert.available_stock} units left
                                </span>
                                <span className="text-xs text-gray-500">Min: {alert.minimum_stock}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="destructive">Low Stock</Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Items */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Expiring Soon ({expiringItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expiringItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No expiring items</div>
                    ) : (
                      expiringItems.slice(0, 5).map((item, index) => {
                        const days = item.days_until_expiry;
                        return (
                          <div key={item.stock_id || item.id || `expiring-${index}`} className={`p-4 rounded-lg border-l-4 ${
                            days <= 7 ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-900 font-medium">{item.name}</p>
                                <p className="text-xs text-gray-600">Batch: {item.batch_number}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-sm font-medium ${
                                    days <= 7 ? 'text-red-600' : 'text-orange-600'
                                  }`}>
                                    {days} days until expiry
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={days <= 7 ? 'destructive' : 'default'}>
                                  {days <= 7 ? 'Urgent' : 'Warning'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Fill Prescription</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Check Inventory</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Reorder Stock</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs">Check Expiry</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Ready for Pickup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-green-600 mb-2 font-bold">
                    {todaySales?.total_sales || 0}
                  </div>
                  <div className="text-sm text-gray-600">Sales Transactions</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-blue-600 mb-2 font-bold">
                    Rs. {(Number(todaySales?.total_revenue) || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Revenue Generated</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-purple-600 mb-2 font-bold">
                    {todaySales?.total_customers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Customers Served</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navigationItems={
        <TopNavigation
          items={navigationItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}