import { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PurchaseOrder {
  id: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  paymentTerms: string;
  deliveryTime: string;
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO001',
    supplierName: 'PharmaCorp Ltd',
    orderDate: '2024-01-15',
    expectedDelivery: '2024-01-20',
    totalAmount: 15400.00,
    status: 'approved',
    items: 25,
    priority: 'high'
  },
  {
    id: 'PO002',
    supplierName: 'MediSupply Inc',
    orderDate: '2024-01-14',
    expectedDelivery: '2024-01-18',
    totalAmount: 8750.00,
    status: 'shipped',
    items: 18,
    priority: 'medium'
  },
  {
    id: 'PO003',
    supplierName: 'BioMed Labs',
    orderDate: '2024-01-12',
    expectedDelivery: '2024-01-16',
    totalAmount: 22100.00,
    status: 'delivered',
    items: 12,
    priority: 'urgent'
  },
  {
    id: 'PO004',
    supplierName: 'GenericMed Co',
    orderDate: '2024-01-10',
    expectedDelivery: '2024-01-17',
    totalAmount: 5600.00,
    status: 'pending',
    items: 8,
    priority: 'low'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: 'S001',
    name: 'PharmaCorp Ltd',
    contactPerson: 'Sarah Johnson',
    phone: '(555) 123-4567',
    email: 'sarah@pharmacorp.com',
    address: '123 Medical District, City, State 12345',
    rating: 4.8,
    paymentTerms: 'Net 30',
    deliveryTime: '3-5 days'
  },
  {
    id: 'S002',
    name: 'MediSupply Inc',
    contactPerson: 'Mike Chen',
    phone: '(555) 234-5678',
    email: 'mike@medisupply.com',
    address: '456 Pharma Avenue, City, State 12346',
    rating: 4.5,
    paymentTerms: 'Net 15',
    deliveryTime: '2-4 days'
  },
  {
    id: 'S003',
    name: 'BioMed Labs',
    contactPerson: 'Dr. Lisa Davis',
    phone: '(555) 345-6789',
    email: 'lisa@biomedlabs.com',
    address: '789 Research Park, City, State 12347',
    rating: 4.9,
    paymentTerms: 'Net 45',
    deliveryTime: '1-3 days'
  }
];

export function PurchaseOrders() {
  const [selectedTab, setSelectedTab] = useState('orders');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
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
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered': return <Package className="w-4 h-4 text-green-600" />;
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
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSuppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expected Delivery Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Add any special instructions..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateOrderOpen(false)}>
                    Create Order
                  </Button>
                </div>
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
                  {mockPurchaseOrders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Orders</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-purple-600 mb-2">
                  {mockPurchaseOrders.filter(o => o.status === 'shipped').length}
                </div>
                <div className="text-sm text-gray-600">In Transit</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-green-600 mb-2">
                  {mockPurchaseOrders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-blue-600 mb-2">
                  ${mockPurchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Purchase Orders ({mockPurchaseOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm text-gray-900">{order.id}</TableCell>
                      <TableCell className="text-sm text-gray-900">{order.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.expectedDelivery).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{order.items}</TableCell>
                      <TableCell className="text-sm text-gray-900">${order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </TableCell>
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
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSuppliers.map((supplier) => (
              <Card key={supplier.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Contact: {supplier.contactPerson}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(supplier.rating)}
                      <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {supplier.email}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600">Payment Terms</p>
                      <p className="text-sm text-gray-900">{supplier.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Delivery Time</p>
                      <p className="text-sm text-gray-900">{supplier.deliveryTime}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600">
                      <Plus className="w-3 h-3 mr-1" />
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Supplier Button */}
          <Card className="border-0 shadow-sm border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">Add New Supplier</h3>
              <p className="text-gray-600 mb-4">Expand your supplier network to ensure better inventory management.</p>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}