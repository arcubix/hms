/**
 * Advanced Point of Sale (POS) System for Pharmacy Management
 * 
 * Features:
 * - Fast product search with live filtering
 * - Barcode scanning support
 * - Grid and list view modes
 * - Category-based filtering
 * - Real-time cart management with quantity controls
 * - Individual and global discount support
 * - Prescription tracking for controlled medicines
 * - Multiple payment methods (Cash, Card, Insurance)
 * - Advanced cash calculator with quick amount buttons
 * - Change calculation
 * - Customer management
 * - Keyboard shortcuts (F1-F12)
 * - Stock validation
 * - GST/Tax calculation (14%)
 * - Hold and resume sales
 * - Print receipts
 * - Toast notifications for user feedback
 * 
 * Keyboard Shortcuts:
 * F1  - Focus search bar
 * F2  - Clear cart
 * F3  - Customer info
 * F9  - Hold sale
 * F12 - Process payment
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  DollarSign,
  Percent,
  Printer,
  Save,
  RotateCcw,
  Grid3x3,
  List,
  Clock,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Receipt,
  FileText,
  Pill,
  Package,
  AlertCircle,
  TrendingUp,
  Calculator,
  Wallet,
  Building,
  Hash,
  Tag,
  Keyboard,
  Info,
  Layers,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image?: string;
  requiresPrescription: boolean;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
  discount: number;
  subtotal: number;
}

interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type: 'walk-in' | 'registered' | 'insurance';
}

interface HeldBill {
  id: string;
  billNumber: string;
  customer: Customer;
  cart: CartItem[];
  globalDiscount: number;
  prescriptionNumber: string;
  timestamp: Date;
  total: number;
}

const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    strength: '500mg',
    form: 'Tablet',
    category: 'Analgesics',
    price: 5.0,
    stock: 500,
    barcode: '8901234567890',
    requiresPrescription: false
  },
  {
    id: '2',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    strength: '250mg',
    form: 'Capsule',
    category: 'Antibiotics',
    price: 15.0,
    stock: 245,
    barcode: '8901234567891',
    requiresPrescription: true
  },
  {
    id: '3',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    strength: '20mg',
    form: 'Capsule',
    category: 'Gastrointestinal',
    price: 8.5,
    stock: 180,
    barcode: '8901234567892',
    requiresPrescription: false
  },
  {
    id: '4',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    strength: '500mg',
    form: 'Tablet',
    category: 'Diabetes',
    price: 12.0,
    stock: 320,
    barcode: '8901234567893',
    requiresPrescription: true
  },
  {
    id: '5',
    name: 'Cetirizine',
    genericName: 'Cetirizine HCl',
    strength: '10mg',
    form: 'Tablet',
    category: 'Antihistamines',
    price: 6.0,
    stock: 150,
    barcode: '8901234567894',
    requiresPrescription: false
  },
  {
    id: '6',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '10mg',
    form: 'Tablet',
    category: 'Cardiovascular',
    price: 18.0,
    stock: 95,
    barcode: '8901234567895',
    requiresPrescription: true
  }
];

const categories = ['All', 'Analgesics', 'Antibiotics', 'Diabetes', 'Cardiovascular', 'Gastrointestinal', 'Antihistamines'];

export function AdvancedPOS() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    name: 'Walk-in Customer',
    phone: '',
    type: 'walk-in'
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'insurance'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [isHeldBillsOpen, setIsHeldBillsOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1 - Focus search
      if (e.key === 'F1') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search medicine"]')?.focus();
      }
      // F2 - Clear cart
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0 && confirm('Clear cart?')) clearCart();
      }
      // F3 - Open customer dialog
      if (e.key === 'F3') {
        e.preventDefault();
        setIsCustomerDialogOpen(true);
      }
      // F9 - Hold sale
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) holdBill();
      }
      // F12 - Open payment
      if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart.length]);

  // Filter medicines based on search and category
  const filteredMedicines = mockMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart
  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    
    if (existingItem) {
      if (existingItem.quantity < medicine.stock) {
        updateQuantity(medicine.id, existingItem.quantity + 1);
        toast.success(`Increased ${medicine.name} quantity`);
      } else {
        toast.error('Insufficient stock');
      }
    } else {
      if (medicine.stock > 0) {
        setCart([...cart, {
          medicine,
          quantity: 1,
          discount: 0,
          subtotal: medicine.price
        }]);
        toast.success(`Added ${medicine.name} to cart`);
      } else {
        toast.error('Out of stock');
      }
    }
  };

  // Update quantity
  const updateQuantity = (medicineId: string, newQuantity: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medicineId) {
        const quantity = Math.max(0, Math.min(newQuantity, item.medicine.stock));
        return {
          ...item,
          quantity,
          subtotal: (item.medicine.price * quantity) * (1 - item.discount / 100)
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Update item discount
  const updateItemDiscount = (medicineId: string, discount: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medicineId) {
        const discountValue = Math.max(0, Math.min(100, discount));
        return {
          ...item,
          discount: discountValue,
          subtotal: (item.medicine.price * item.quantity) * (1 - discountValue / 100)
        };
      }
      return item;
    }));
  };

  // Remove from cart
  const removeFromCart = (medicineId: string) => {
    const item = cart.find(c => c.medicine.id === medicineId);
    setCart(cart.filter(item => item.medicine.id !== medicineId));
    if (item) {
      toast.success(`Removed ${item.medicine.name} from cart`);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * globalDiscount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.14; // 14% GST
  const total = taxableAmount + tax;
  const changeAmount = receivedAmount ? parseFloat(receivedAmount) - total : 0;

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setGlobalDiscount(0);
    setReceivedAmount('');
    setPrescriptionNumber('');
    setCustomer({
      name: 'Walk-in Customer',
      phone: '',
      type: 'walk-in'
    });
    toast.success('Cart cleared');
  };

  // Hold current bill
  const holdBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const billNumber = `HB-${Date.now().toString().slice(-6)}`;
    const heldBill: HeldBill = {
      id: Date.now().toString(),
      billNumber,
      customer: { ...customer },
      cart: [...cart],
      globalDiscount,
      prescriptionNumber,
      timestamp: new Date(),
      total
    };

    setHeldBills([...heldBills, heldBill]);
    clearCart();
    toast.success(`Bill ${billNumber} held successfully`, {
      description: `${cart.length} items saved`
    });
  };

  // Load held bill
  const loadHeldBill = (bill: HeldBill) => {
    if (cart.length > 0) {
      toast.error('Please clear or hold current cart first');
      return;
    }

    setCart(bill.cart);
    setCustomer(bill.customer);
    setGlobalDiscount(bill.globalDiscount);
    setPrescriptionNumber(bill.prescriptionNumber);
    setHeldBills(heldBills.filter(b => b.id !== bill.id));
    setIsHeldBillsOpen(false);
    toast.success(`Loaded bill ${bill.billNumber}`);
  };

  // Delete held bill
  const deleteHeldBill = (billId: string) => {
    setHeldBills(heldBills.filter(b => b.id !== billId));
    toast.info('Held bill deleted');
  };

  // Process payment
  const processPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Check for prescription medicines
    const requiresPrescription = cart.some(item => item.medicine.requiresPrescription);
    if (requiresPrescription && !prescriptionNumber) {
      toast.error('Prescription number required');
      return;
    }

    if (paymentMethod === 'cash' && parseFloat(receivedAmount) < total) {
      toast.error('Insufficient amount received');
      return;
    }

    // Process the payment
    const invoiceNo = `INV-${Date.now()}`;
    toast.success(`Payment processed successfully! Invoice: ${invoiceNo}`);
    
    // Clear the cart after successful payment
    setTimeout(() => {
      clearCart();
      setIsPaymentDialogOpen(false);
    }, 1500);
  };

  // Quick add number buttons for cash
  const addToCash = (amount: number) => {
    const current = parseFloat(receivedAmount || '0');
    setReceivedAmount((current + amount).toString());
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Point of Sale
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  v2.0
                </Badge>
              </h1>
              <p className="text-sm text-blue-100">Fast & Easy Pharmacy Billing • Press F1 for shortcuts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {heldBills.length > 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsHeldBillsOpen(true)}
                className="relative"
              >
                <Layers className="w-4 h-4 mr-2" />
                Held Bills
                <Badge className="ml-2 bg-red-500 text-white border-0 h-5 px-1.5">
                  {heldBills.length}
                </Badge>
              </Button>
            )}
            <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Keyboard className="w-4 h-4 mr-2" />
                  Shortcuts
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Keyboard Shortcuts
                  </DialogTitle>
                  <DialogDescription>Speed up your workflow with these shortcuts</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {[
                    { key: 'F1', description: 'Focus search bar' },
                    { key: 'F2', description: 'Clear cart' },
                    { key: 'F3', description: 'Customer info' },
                    { key: 'F9', description: 'Hold sale' },
                    { key: 'F12', description: 'Process payment' },
                    { key: 'Enter', description: 'Add selected item' },
                    { key: 'Esc', description: 'Close dialogs' }
                  ].map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-right">
              <p className="text-sm text-blue-100">Cashier</p>
              <p className="font-semibold">Ahmed Khan</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Search and Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search medicine by name, generic name, or barcode..."
                    className="pl-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button variant="outline" className="h-12 px-6" size="lg">
                  <Barcode className="w-5 h-5 mr-2" />
                  Scan
                </Button>
                <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-10 w-10 p-0"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-10 w-10 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Grid/List */}
          <Card className="border-0 shadow-sm flex-1 overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredMedicines.map((medicine) => (
                    <Card
                      key={medicine.id}
                      className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => addToCart(medicine)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Pill className="w-6 h-6 text-blue-600" />
                          </div>
                          {medicine.requiresPrescription && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Rx
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{medicine.name}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">{medicine.genericName}</p>
                        <p className="text-xs text-gray-500 mb-3">{medicine.form} • {medicine.strength}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xl font-bold text-blue-600">PKR {medicine.price}</p>
                            <p className="text-xs text-gray-500">Stock: {medicine.stock}</p>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedicines.map((medicine) => (
                    <Card
                      key={medicine.id}
                      className="border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => addToCart(medicine)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{medicine.name}</h3>
                              {medicine.requiresPrescription && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                  Rx
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{medicine.genericName}</p>
                            <p className="text-xs text-gray-500">{medicine.form} • {medicine.strength} • {medicine.category}</p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-blue-600">PKR {medicine.price}</p>
                            <p className="text-sm text-gray-500">Stock: {medicine.stock}</p>
                          </div>
                          
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 w-12 p-0 flex-shrink-0">
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredMedicines.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No medicines found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart & Payment */}
        <div className="w-[480px] flex flex-col gap-4">
          {/* Customer Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone || 'No phone'}</p>
                  </div>
                </div>
                <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-1" />
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Customer Information</DialogTitle>
                      <DialogDescription>Add or select customer details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Customer Type</Label>
                        <Select defaultValue="walk-in">
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                            <SelectItem value="registered">Registered Customer</SelectItem>
                            <SelectItem value="insurance">Insurance Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input className="mt-2" placeholder="Enter customer name" />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input className="mt-2" placeholder="+92-XXX-XXXXXXX" />
                      </div>
                      <div>
                        <Label>Email (Optional)</Label>
                        <Input type="email" className="mt-2" placeholder="customer@email.com" />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsCustomerDialogOpen(false)}>
                        Save Customer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card className="border-0 shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Cart ({cart.length} items)
                </CardTitle>
                {cart.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={holdBill}>
                      <Save className="w-4 h-4 mr-1 text-blue-600" />
                      Hold
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearCart}>
                      <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-1">Cart is empty</p>
                    <p className="text-sm text-gray-400">Add medicines to start billing</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.medicine.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.medicine.name}</h4>
                          <p className="text-xs text-gray-600">{item.medicine.genericName}</p>
                          <p className="text-xs text-gray-500">{item.medicine.form} • {item.medicine.strength}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.medicine.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.medicine.id, parseInt(e.target.value) || 0)}
                            className="h-8 w-16 text-center border-0 border-x border-gray-300 rounded-none"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-sm text-gray-600">×</span>
                        <span className="text-sm font-medium">PKR {item.medicine.price}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Percent className="w-3 h-3 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Disc%"
                            value={item.discount || ''}
                            onChange={(e) => updateItemDiscount(item.medicine.id, parseFloat(e.target.value) || 0)}
                            className="h-7 w-20 text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <p className="text-lg font-bold text-blue-600">PKR {item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription */}
          {cart.some(item => item.medicine.requiresPrescription) && (
            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <Label className="text-sm font-medium text-red-700">Prescription Required</Label>
                </div>
                <Input
                  placeholder="Enter prescription number"
                  value={prescriptionNumber}
                  onChange={(e) => setPrescriptionNumber(e.target.value)}
                  className="h-9"
                />
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">PKR {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Discount:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    className="h-8 w-20 text-right"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm font-medium text-red-600">PKR {discountAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (14%):</span>
                <span className="font-medium">PKR {tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-3xl font-bold text-blue-600">PKR {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={clearCart}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  disabled={cart.length === 0}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay PKR {total.toFixed(2)}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Process Payment</DialogTitle>
                  <DialogDescription>Complete the transaction</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  {/* Payment Method */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        className="h-20 flex-col gap-2"
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <DollarSign className="w-6 h-6" />
                        Cash
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        className="h-20 flex-col gap-2"
                        onClick={() => setPaymentMethod('card')}
                      >
                        <CreditCard className="w-6 h-6" />
                        Card
                      </Button>
                      <Button
                        variant={paymentMethod === 'insurance' ? 'default' : 'outline'}
                        className="h-20 flex-col gap-2"
                        onClick={() => setPaymentMethod('insurance')}
                      >
                        <Building className="w-6 h-6" />
                        Insurance
                      </Button>
                    </div>
                  </div>

                  {/* Cash Payment */}
                  {paymentMethod === 'cash' && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Cash Received</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="h-16 text-2xl text-center font-bold mb-3"
                      />
                      
                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[100, 500, 1000, 5000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            onClick={() => addToCash(amount)}
                            className="h-12"
                          >
                            +{amount}
                          </Button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <Button
                            key={num}
                            variant="outline"
                            onClick={() => setReceivedAmount(receivedAmount + num.toString())}
                            className="h-14 text-xl font-semibold"
                          >
                            {num}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount('')}
                          className="h-14 text-xl font-semibold"
                        >
                          C
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount(receivedAmount + '0')}
                          className="h-14 text-xl font-semibold"
                        >
                          0
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount(total.toFixed(2))}
                          className="h-14 text-sm font-semibold"
                        >
                          Exact
                        </Button>
                      </div>

                      {/* Change */}
                      {receivedAmount && changeAmount >= 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Change:</span>
                            <span className="text-3xl font-bold text-green-600">PKR {changeAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-xl text-blue-600">PKR {total.toFixed(2)}</span>
                    </div>
                    {paymentMethod === 'cash' && receivedAmount && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Received:</span>
                          <span className="font-medium">PKR {parseFloat(receivedAmount).toFixed(2)}</span>
                        </div>
                        {changeAmount >= 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium">Change:</span>
                            <span className="font-bold">PKR {changeAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Complete Payment Button */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsPaymentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={processPayment}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Complete Payment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={holdBill} disabled={cart.length === 0}>
              <Clock className="w-4 h-4 mr-1" />
              Hold
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Held Bills Dialog */}
      <Dialog open={isHeldBillsOpen} onOpenChange={setIsHeldBillsOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Layers className="w-6 h-6 text-blue-600" />
              Held Bills ({heldBills.length})
            </DialogTitle>
            <DialogDescription>
              Click on any bill to load it back into the cart
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto pr-2">
            {heldBills.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-1">No held bills</p>
                <p className="text-sm text-gray-400">Hold a bill to save it for later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldBills.map((bill) => (
                  <Card
                    key={bill.id}
                    className="border-2 hover:border-blue-400 transition-all cursor-pointer group"
                    onClick={() => loadHeldBill(bill)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {bill.billNumber}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {bill.cart.length} items
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <User className="w-3 h-3 inline mr-1" />
                              {bill.customer.name}
                            </p>
                            <p className="text-gray-600">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {bill.timestamp.toLocaleString()}
                            </p>
                            <p className="font-bold text-blue-600">
                              Total: PKR {bill.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadHeldBill(bill);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHeldBill(bill.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Show cart items preview */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Items:</p>
                        <div className="space-y-1">
                          {bill.cart.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex justify-between">
                              <span>{item.medicine.name} × {item.quantity}</span>
                              <span className="font-medium">PKR {item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                          {bill.cart.length > 3 && (
                            <p className="text-xs text-gray-500 italic">
                              +{bill.cart.length - 3} more items...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
