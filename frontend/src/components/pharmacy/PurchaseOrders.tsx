import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  RefreshCw,
  X
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { api, PurchaseOrder, Supplier, CreatePurchaseOrderData, Medicine } from '../../services/api';

export function PurchaseOrders() {
  const [selectedTab, setSelectedTab] = useState('orders');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplier_id: 0,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    tax_rate: 14,
    shipping_cost: 0,
    discount: 0,
    notes: '',
    items: []
  });

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadMedicines();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getPurchaseOrders({});
      setPurchaseOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
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

  const loadMedicines = async () => {
    try {
      const data = await api.getMedicines({ status: 'Active' });
      setMedicines(data);
    } catch (error: any) {
      console.error('Failed to load medicines:', error);
    }
  };

  const handleCreatePO = async () => {
    try {
      if (!formData.supplier_id || formData.items.length === 0) {
        toast.error('Please select supplier and add items');
        return;
      }
      await api.createPurchaseOrder(formData);
      toast.success('Purchase order created successfully');
      setIsCreateOrderOpen(false);
      resetForm();
      loadPurchaseOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purchase order');
    }
  };

  const handleApprovePO = async (id: number) => {
    try {
      await api.approvePurchaseOrder(id);
      toast.success('Purchase order approved');
      loadPurchaseOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve purchase order');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: 0,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      tax_rate: 14,
      shipping_cost: 0,
      discount: 0,
      notes: '',
      items: []
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine_id: 0, quantity: 1, unit_cost: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'partially received': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'partially received': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'received': return <Package className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Helper function to safely format numbers
  const formatNumber = (value: number | string | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00';
    return num.toFixed(decimals);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">Purchase Orders & Suppliers</h1>
        <div className="flex gap-2">
          <Button 
            variant={selectedTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('orders')}
          >
            Purchase Orders
          </Button>
          <Button 
            variant={selectedTab === 'suppliers' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('suppliers')}
          >
            Suppliers
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => setIsCreateOrderOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier *</Label>
                    <Select 
                      value={formData.supplier_id.toString()} 
                      onValueChange={(v) => setFormData({...formData, supplier_id: parseInt(v)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Date</Label>
                    <Input 
                      type="date" 
                      value={formData.order_date}
                      onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Delivery Date</Label>
                    <Input 
                      type="date" 
                      value={formData.expected_delivery_date}
                      onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input 
                      type="number"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 14})}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Items *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Select 
                              value={item.medicine_id.toString()} 
                              onValueChange={(v) => updateItem(idx, 'medicine_id', parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select medicine" />
                              </SelectTrigger>
                              <SelectContent>
                                {medicines.map(med => (
                                  <SelectItem key={med.id} value={med.id.toString()}>
                                    {med.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              step="0.01"
                              value={item.unit_cost}
                              onChange={(e) => updateItem(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>Rs. {(item.quantity * item.unit_cost).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Add any special instructions..." 
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsCreateOrderOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePO}>
                    Create Order
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedTab === 'orders' ? (
        <>
          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-yellow-600 mb-2">
                  {purchaseOrders.filter(o => o.status === 'Pending' || o.status === 'Draft').length}
                </div>
                <div className="text-sm text-gray-600">Pending Orders</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-purple-600 mb-2">
                  {purchaseOrders.filter(o => o.status === 'Partially Received').length}
                </div>
                <div className="text-sm text-gray-600">Partially Received</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-green-600 mb-2">
                  {purchaseOrders.filter(o => o.status === 'Received').length}
                </div>
                <div className="text-sm text-gray-600">Received</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-blue-600 mb-2">
                  Rs. {purchaseOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                  Purchase Orders ({purchaseOrders.length})
              </CardTitle>
                <Button variant="outline" size="icon" onClick={loadPurchaseOrders}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : purchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No purchase orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="text-sm text-gray-900 font-medium">{order.po_number}</TableCell>
                        <TableCell className="text-sm text-gray-900">{order.supplier_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                            {new Date(order.order_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                          {order.expected_delivery_date ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                              {new Date(order.expected_delivery_date).toLocaleDateString()}
                        </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                      </TableCell>
                        <TableCell className="text-sm text-gray-600">{order.items?.length || order.items_count || 0}</TableCell>
                        <TableCell className="text-sm text-gray-900 font-medium">Rs. {formatNumber(order.total_amount, 2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => setSelectedPO(order)}
                            >
                            <Eye className="w-4 h-4" />
                          </Button>
                            {order.status === 'Draft' || order.status === 'Pending' ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-2"
                                onClick={() => handleApprovePO(order.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                          </Button>
                            ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      {supplier.contact_person && (
                        <p className="text-sm text-gray-600 mt-1">Contact: {supplier.contact_person}</p>
                      )}
                    </div>
                    {supplier.rating && (
                    <div className="flex items-center gap-1">
                      {renderStars(Number(supplier.rating) || 0)}
                        <span className="text-sm text-gray-600 ml-1">{formatNumber(supplier.rating, 1)}</span>
                    </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {supplier.phone}
                    </div>
                    )}
                    {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {supplier.email}
                    </div>
                    )}
                    {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{supplier.address}</span>
                    </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600">Payment Terms</p>
                      <p className="text-sm text-gray-900">{supplier.payment_terms || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Credit Limit</p>
                      <p className="text-sm text-gray-900">Rs. {formatNumber(supplier.credit_limit, 2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        setFormData({...formData, supplier_id: supplier.id});
                        setSelectedTab('orders');
                        setIsCreateOrderOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Create PO
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {suppliers.length === 0 && (
          <Card className="border-0 shadow-sm border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg text-gray-900 mb-2">No Suppliers Found</h3>
                <p className="text-gray-600 mb-4">Add suppliers to start creating purchase orders.</p>
            </CardContent>
          </Card>
          )}
        </>
      )}
    </div>
  );
}