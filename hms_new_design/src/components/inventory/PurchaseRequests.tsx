import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner@2.0.3';

interface PurchaseRequestsProps {
  onBack: () => void;
}

export function PurchaseRequests({ onBack }: PurchaseRequestsProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Mock purchase requests
  const requests = [
    {
      id: 'PR-2024-001',
      date: '2024-11-20',
      requestedBy: 'John Doe',
      department: 'Pharmacy',
      items: [
        { name: 'Paracetamol 500mg', quantity: 5000, unit: 'Tablets', estimatedPrice: 12500 },
        { name: 'Insulin Injection', quantity: 200, unit: 'Vials', estimatedPrice: 30000 }
      ],
      totalAmount: 42500,
      status: 'pending',
      priority: 'high',
      notes: 'Urgent requirement for upcoming week'
    },
    {
      id: 'PR-2024-002',
      date: '2024-11-18',
      requestedBy: 'Sarah Smith',
      department: 'OPD',
      items: [
        { name: 'N95 Masks', quantity: 1000, unit: 'Pieces', estimatedPrice: 25000 },
        { name: 'Surgical Gloves (M)', quantity: 500, unit: 'Pairs', estimatedPrice: 4250 }
      ],
      totalAmount: 29250,
      status: 'approved',
      priority: 'high',
      approvedBy: 'Dr. Admin',
      approvedDate: '2024-11-19',
      notes: 'Stock running low'
    },
    {
      id: 'PR-2024-003',
      date: '2024-11-15',
      requestedBy: 'Mike Johnson',
      department: 'Laboratory',
      items: [
        { name: 'Blood Collection Tubes', quantity: 2000, unit: 'Tubes', estimatedPrice: 10000 }
      ],
      totalAmount: 10000,
      status: 'rejected',
      priority: 'medium',
      rejectedBy: 'Dr. Admin',
      rejectedDate: '2024-11-16',
      rejectionReason: 'Sufficient stock available',
      notes: 'Regular monthly requirement'
    },
    {
      id: 'PR-2024-004',
      date: '2024-11-22',
      requestedBy: 'Emily Davis',
      department: 'Emergency',
      items: [
        { name: 'IV Fluid Set', quantity: 500, unit: 'Sets', estimatedPrice: 22500 },
        { name: 'Sterile Gauze', quantity: 200, unit: 'Packs', estimatedPrice: 2400 }
      ],
      totalAmount: 24900,
      status: 'completed',
      priority: 'medium',
      approvedBy: 'Dr. Admin',
      approvedDate: '2024-11-23',
      completedDate: '2024-11-24',
      notes: 'Emergency stock replenishment'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (activeTab === 'create') {
    return <CreatePurchaseRequest onBack={() => setActiveTab('list')} />;
  }

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
                  <ShoppingCart className="w-6 h-6" />
                  Purchase Requests
                </h1>
                <p className="text-sm text-gray-500 mt-1">{filteredRequests.length} requests found</p>
              </div>
            </div>
            <Button onClick={() => setActiveTab('create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by ID, requester, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl text-gray-900 mt-1">{requests.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl text-yellow-600 mt-1">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl text-green-600 mt-1">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl text-gray-900 mt-1">
                    ₹{(requests.reduce((sum, r) => sum + r.totalAmount, 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm text-blue-600">{request.id}</span>
                      </TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.department}</Badge>
                      </TableCell>
                      <TableCell>{request.items.length} item(s)</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{request.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Purchase Request Details - {request.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {/* Request Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Request Date</p>
                                  <p className="font-medium">{request.date}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Requested By</p>
                                  <p className="font-medium">{request.requestedBy}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Department</p>
                                  <Badge variant="outline">{request.department}</Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Priority</p>
                                  {getPriorityBadge(request.priority)}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Status</p>
                                  {getStatusBadge(request.status)}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Total Amount</p>
                                  <p className="font-medium">₹{request.totalAmount.toLocaleString()}</p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <h4 className="font-medium mb-3">Requested Items</h4>
                                <div className="border rounded-lg divide-y">
                                  {request.items.map((item, index) => (
                                    <div key={index} className="p-3 flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">
                                          Quantity: {item.quantity} {item.unit}
                                        </p>
                                      </div>
                                      <p className="font-medium">₹{item.estimatedPrice.toLocaleString()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Notes */}
                              {request.notes && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{request.notes}</p>
                                </div>
                              )}

                              {/* Approval/Rejection Info */}
                              {request.status === 'approved' && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-600">Approved by {request.approvedBy}</p>
                                  <p className="text-sm text-gray-600">on {request.approvedDate}</p>
                                </div>
                              )}

                              {request.status === 'rejected' && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-600">Rejected by {request.rejectedBy}</p>
                                  <p className="text-sm text-gray-600">on {request.rejectedDate}</p>
                                  <p className="text-sm text-red-700 mt-2">Reason: {request.rejectionReason}</p>
                                </div>
                              )}

                              {/* Actions */}
                              {request.status === 'pending' && (
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreatePurchaseRequest({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    department: '',
    priority: 'medium',
    notes: ''
  });

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'Pieces', estimatedPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    toast.success('Purchase request created successfully!');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl text-gray-900">Create Purchase Request</h1>
              <p className="text-sm text-gray-500 mt-1">Request new items for inventory</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="opd">OPD</SelectItem>
                        <SelectItem value="ipd">IPD</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Items</CardTitle>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium">Item #{index + 1}</h4>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Label>Item Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Enter item name"
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pieces">Pieces</SelectItem>
                            <SelectItem value="Tablets">Tablets</SelectItem>
                            <SelectItem value="Vials">Vials</SelectItem>
                            <SelectItem value="Boxes">Boxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No items added. Click "Add Item" to get started.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes or requirements..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
