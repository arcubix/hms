import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Plus, 
  Search, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { api, StockAdjustment, CreateStockAdjustmentData, Medicine, PharmacyStock } from '../../services/api';

export function StockAdjustments() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stocks, setStocks] = useState<PharmacyStock[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<CreateStockAdjustmentData>({
    medicine_id: 0,
    stock_id: undefined,
    adjustment_type: 'Increase',
    quantity: 0,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadAdjustments();
    loadMedicines();
  }, [statusFilter, typeFilter]);

  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'All') filters.status = statusFilter;
      if (typeFilter !== 'All') filters.adjustment_type = typeFilter;
      
      const data = await api.getStockAdjustments(filters);
      setAdjustments(data);
    } catch (error: any) {
      console.error('Failed to load adjustments:', error);
      toast.error('Failed to load stock adjustments');
    } finally {
      setLoading(false);
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

  const loadStocks = async (medicineId: number) => {
    try {
      const data = await api.getStockByMedicine(medicineId, false);
      setStocks(data);
    } catch (error: any) {
      console.error('Failed to load stocks:', error);
    }
  };

  const handleMedicineChange = (medicineId: string) => {
    const id = parseInt(medicineId);
    setFormData({ ...formData, medicine_id: id, stock_id: undefined });
    if (id) {
      loadStocks(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicine_id || formData.quantity <= 0 || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.createStockAdjustment(formData);
      toast.success('Stock adjustment created successfully');
      setIsDialogOpen(false);
      setFormData({
        medicine_id: 0,
        stock_id: undefined,
        adjustment_type: 'Increase',
        quantity: 0,
        reason: '',
        notes: ''
      });
      loadAdjustments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create adjustment');
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this adjustment? This will update the stock.')) {
      return;
    }

    try {
      await api.approveStockAdjustment(id);
      toast.success('Adjustment approved and stock updated');
      loadAdjustments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve adjustment');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this adjustment?')) {
      return;
    }

    try {
      await api.rejectStockAdjustment(id);
      toast.success('Adjustment rejected');
      loadAdjustments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject adjustment');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Increase')) return <TrendingUp className="w-4 h-4" />;
    if (type.includes('Decrease') || type.includes('Write-off') || type === 'Theft') return <TrendingDown className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const filteredAdjustments = adjustments.filter(adj => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        adj.adjustment_number.toLowerCase().includes(query) ||
        adj.medicine_name?.toLowerCase().includes(query) ||
        adj.reason.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600 mt-1">Manage stock corrections, write-offs, and adjustments</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Adjustment
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
              <DialogDescription>Record a stock correction or adjustment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Medicine *</Label>
                <Select
                  value={formData.medicine_id.toString()}
                  onValueChange={handleMedicineChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map(med => (
                      <SelectItem key={med.id} value={med.id.toString()}>
                        {med.name} {med.generic_name && `(${med.generic_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.medicine_id > 0 && stocks.length > 0 && (
                <div>
                  <Label>Stock Batch (Optional)</Label>
                  <Select
                    value={formData.stock_id?.toString() || ''}
                    onValueChange={(value) => setFormData({ ...formData, stock_id: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All batches</SelectItem>
                      {stocks.map(stock => (
                        <SelectItem key={stock.id} value={stock.id.toString()}>
                          {stock.batch_number} - Exp: {new Date(stock.expiry_date).toLocaleDateString()} (Qty: {stock.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Adjustment Type *</Label>
                <Select
                  value={formData.adjustment_type}
                  onValueChange={(value: any) => setFormData({ ...formData, adjustment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Increase">Increase</SelectItem>
                    <SelectItem value="Decrease">Decrease</SelectItem>
                    <SelectItem value="Expiry Write-off">Expiry Write-off</SelectItem>
                    <SelectItem value="Damage Write-off">Damage Write-off</SelectItem>
                    <SelectItem value="Theft">Theft</SelectItem>
                    <SelectItem value="Correction">Correction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label>Reason *</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Physical count discrepancy"
                  required
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Create Adjustment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by adjustment number, medicine, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Increase">Increase</SelectItem>
                  <SelectItem value="Decrease">Decrease</SelectItem>
                  <SelectItem value="Expiry Write-off">Expiry Write-off</SelectItem>
                  <SelectItem value="Damage Write-off">Damage Write-off</SelectItem>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadAdjustments}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Adjustments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustments ({filteredAdjustments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredAdjustments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No adjustments found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adjustment #</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell className="font-medium">{adj.adjustment_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{adj.medicine_name}</div>
                        {adj.batch_number && (
                          <div className="text-xs text-gray-500">Batch: {adj.batch_number}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(adj.adjustment_type)}
                        <span>{adj.adjustment_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{adj.quantity}</TableCell>
                    <TableCell className="max-w-xs truncate">{adj.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(adj.status)}>
                        {adj.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{adj.requested_by_name || 'N/A'}</TableCell>
                    <TableCell>{new Date(adj.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {adj.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(adj.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(adj.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {adj.status === 'Approved' && adj.approved_by_name && (
                        <div className="text-xs text-gray-500">
                          Approved by {adj.approved_by_name}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

