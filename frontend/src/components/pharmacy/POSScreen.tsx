import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { 
  Search, 
  Trash2,
  Scan,
  User,
  ShoppingBag,
  Pill,
  Heart,
  Activity,
  Stethoscope,
  Syringe,
  Thermometer,
  UserCheck,
  Clock,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Printer
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  batch: string;
  expiry: string;
  unit: string;
  rate: number;
  barcode: string;
}

interface CartItem extends Medicine {
  quantity: number;
  discount: number;
  total: number;
}

const categoryButtons = [
  { name: 'Pain Relief', icon: Heart, color: 'bg-orange-500' },
  { name: 'Antibiotic', icon: Pill, color: 'bg-blue-500' },
  { name: 'Gastric', icon: Activity, color: 'bg-green-500' },
  { name: 'Diabetes', icon: Syringe, color: 'bg-purple-500' },
  { name: 'Cardiovascular', icon: Stethoscope, color: 'bg-red-500' },
  { name: 'Respiratory', icon: Thermometer, color: 'bg-cyan-500' },
  { name: 'Allergy', icon: UserCheck, color: 'bg-yellow-500' },
  { name: 'All Products', icon: ShoppingBag, color: 'bg-gray-500' }
];

export function POSScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [customerDiscount, setCustomerDiscount] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedShop, setSelectedShop] = useState('main-pharmacy');
  const [printInvoice, setPrintInvoice] = useState(true);
  const [cashReceived, setCashReceived] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  // Load medicines from API
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await api.getMedicines({ status: 'Active' });
      // Transform API data to match component interface
      const transformed: Medicine[] = data.map((m: any) => ({
        id: m.id?.toString() || '',
        name: m.name || '',
        category: m.category || 'Other',
        stock: parseInt(m.current_stock || 0),
        batch: '', // Will need to get from stock batches
        expiry: '', // Will need to get from stock batches
        unit: m.unit || '',
        rate: parseFloat(m.selling_price || 0),
        barcode: m.barcode || ''
      }));
      setMedicines(transformed);
    } catch (error: any) {
      console.error('Failed to load medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Products' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      updateQuantity(medicine.id, existingItem.quantity + productQuantity);
    } else {
      const cartItem: CartItem = {
        ...medicine,
        quantity: productQuantity,
        discount: 0,
        total: medicine.rate * productQuantity
      };
      setCart([...cart, cartItem]);
    }
    setProductQuantity(1);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: item.rate * newQuantity * (1 - item.discount / 100) }
        : item
    ));
  };

  const updateItemDiscount = (id: string, discountPercent: number) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, discount: discountPercent, total: item.rate * item.quantity * (1 - discountPercent / 100) }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getGrossTotal = () => {
    return cart.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  };

  const getCustomerDiscountAmount = () => {
    return getGrossTotal() * (customerDiscount / 100);
  };

  const getInvoiceDiscountAmount = () => {
    return (getGrossTotal() - getCustomerDiscountAmount()) * (invoiceDiscount / 100);
  };

  const getNetGrossTotal = () => {
    return getGrossTotal() - getCustomerDiscountAmount() - getInvoiceDiscountAmount();
  };

  const getVAT = () => {
    return getNetGrossTotal() * 0.1; // 10% VAT
  };

  const getNetTotal = () => {
    return getNetGrossTotal() + getVAT() + adjustment;
  };

  const getBalance = () => {
    return cashReceived - getNetTotal();
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    if (paymentMethod === 'cash' && cashReceived < getNetTotal()) {
      alert('Insufficient cash received!');
      return;
    }
    
    alert('Sale completed successfully!');
    setCart([]);
    setCustomerDiscount(0);
    setInvoiceDiscount(0);
    setAdjustment(0);
    setCashReceived(0);
    setSelectedCustomer('');
  };

  const handleHold = () => {
    if (cart.length === 0) return;
    alert('Sale held for later processing');
  };

  const handleCancel = () => {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to cancel this sale?')) {
      setCart([]);
      setCustomerDiscount(0);
      setInvoiceDiscount(0);
      setAdjustment(0);
      setCashReceived(0);
    }
  };

  return (
    <div className="p-4 h-full bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Top Category Buttons */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        {categoryButtons.map((category, index) => (
          <Button
            key={index}
            onClick={() => setSelectedCategory(category.name)}
            className={`h-16 flex flex-col gap-1 transition-all ${
              selectedCategory === category.name 
                ? category.color + ' text-white shadow-lg scale-105' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <category.icon className="w-5 h-5" />
            <span className="text-xs">{category.name}</span>
          </Button>
        ))}
      </div>

      <div className="flex gap-4 h-[calc(100%-88px)]">
        {/* Left Panel - Sale & Return */}
        <div className="flex-1 flex flex-col gap-3">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="text-base">Sale And Return</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {/* Quick Category Buttons */}
              <div className="grid grid-cols-8 gap-2">
                {['Bread', 'Cake', 'Cat-3', 'Main', 'T.E.A', 'Medicine', 'Return'].map((cat, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-10 bg-orange-400 hover:bg-orange-500 text-white border-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Customer Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                      <SelectItem value="C001">M Mahmood</SelectItem>
                      <SelectItem value="C002">John Smith</SelectItem>
                      <SelectItem value="C003">Sarah Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Credit Limit</Label>
                  <Input className="h-8 text-sm" value="Recordable" readOnly />
                </div>
              </div>

              {/* Product Search */}
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-1">
                  <Label className="text-xs text-gray-600">Qty</Label>
                  <Input 
                    type="number" 
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-sm text-center"
                    min="1"
                  />
                </div>
                <div className="col-span-9">
                  <Label className="text-xs text-gray-600">Product Search</Label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search product by name or barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 pl-8 text-sm"
                    />
                  </div>
                </div>
                <div className="col-span-2 flex gap-1">
                  <Button variant="outline" size="sm" className="h-8 flex-1">
                    <Scan className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 flex-1 bg-blue-500 text-white hover:bg-blue-600">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Table */}
          <Card className="border-0 shadow-md bg-white flex-1 flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-12">S #</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="w-16">Unit</TableHead>
                      <TableHead className="w-20">Rate</TableHead>
                      <TableHead className="w-16">Qty</TableHead>
                      <TableHead className="w-20">Disc %</TableHead>
                      <TableHead className="w-24">Total</TableHead>
                      <TableHead className="w-16">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                          No items in cart
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item, index) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="text-xs">{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-xs">{item.unit}</TableCell>
                          <TableCell>{item.rate.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="h-7 w-14 text-xs text-center"
                              min="1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                              className="h-7 w-16 text-xs text-center"
                              min="0"
                              max="100"
                            />
                          </TableCell>
                          <TableCell>{item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bottom Controls */}
              <div className="border-t p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Payment Mode</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="text-sm cursor-pointer">Cash</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="text-sm cursor-pointer">Credit/Credit Card</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="debit" id="debit" />
                          <Label htmlFor="debit" className="text-sm cursor-pointer">Debit Card</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleHold}
                      disabled={cart.length === 0}
                      className="h-9"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Hold
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={cart.length === 0}
                      className="h-9 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Products */}
          <Card className="border-0 shadow-md bg-white max-h-40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Available Products ({filteredMedicines.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-6 gap-2 max-h-20 overflow-y-auto">
                {filteredMedicines.map((medicine) => (
                  <Button
                    key={medicine.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addToCart(medicine)}
                    className="h-8 text-xs hover:bg-blue-50"
                  >
                    {medicine.name.substring(0, 15)}...
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Billing Summary */}
        <div className="w-80 flex flex-col gap-3">
          {/* Shop Selection */}
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-3">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Select Shop</Label>
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main-pharmacy">POS | Garden Town Shop</SelectItem>
                    <SelectItem value="branch-1">POS | Downtown Branch</SelectItem>
                    <SelectItem value="branch-2">POS | City Center Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Billing Calculation */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 flex-1">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Gross Total</span>
                <span className="text-gray-900">{getGrossTotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-700">Customer Discount</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={customerDiscount}
                    onChange={(e) => setCustomerDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="h-6 w-12 text-xs text-right p-1"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs">%</span>
                  <span className="text-gray-900 w-16 text-right">{getCustomerDiscountAmount().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-700">Invoice Disc</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={invoiceDiscount}
                    onChange={(e) => setInvoiceDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="h-6 w-12 text-xs text-right p-1"
                    min="0"
                    max="100"
                  />
                  <span className="text-xs">%</span>
                  <span className="text-gray-900 w-16 text-right">{getInvoiceDiscountAmount().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Net Gross Total</span>
                <span className="text-gray-900">{getNetGrossTotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-700">Adjustment</span>
                <Input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                  className="h-6 w-20 text-xs text-right p-1"
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">VAT</span>
                <span className="text-gray-900">{getVAT().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Cut Price Disc</span>
                <span className="text-gray-900">0.00</span>
              </div>

              <div className="border-t-2 border-gray-300 pt-2 mt-2">
                <div className="text-right mb-1">
                  <span className="text-sm text-gray-700">Net Total</span>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 text-center border-2 border-blue-300">
                  <span className="text-4xl text-gray-900">{getNetTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">Invoice</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Cash</span>
                    <Input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      className="h-8 w-28 text-sm text-right"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">Balance</Label>
                  <div className="bg-white rounded px-3 py-1.5 min-w-28 text-right border">
                    <span className="text-sm text-gray-900">{getBalance().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox 
                  id="print-invoice" 
                  checked={printInvoice}
                  onCheckedChange={(checked) => setPrintInvoice(checked as boolean)}
                />
                <Label htmlFor="print-invoice" className="text-sm cursor-pointer">Print Invoice</Label>
              </div>

              <div className="pt-2 space-y-2">
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-10"
                  onClick={handleCompleteSale}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Sale
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-9"
                  disabled={cart.length === 0}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
