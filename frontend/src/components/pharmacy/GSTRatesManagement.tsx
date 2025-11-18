/**
 * GST Rates Management Component
 * Features: CRUD operations for GST rates, set default rate, link to categories
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Percent, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api, GSTRate, CreateGSTRateData } from '../../services/api';

export function GSTRatesManagement() {
  const [gstRates, setGstRates] = useState<GSTRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRate, setSelectedRate] = useState<GSTRate | null>(null);
  const [formData, setFormData] = useState<CreateGSTRateData>({
    rate_name: '',
    rate_percentage: 0,
    category: '',
    description: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    loadGSTRates();
  }, []);

  const loadGSTRates = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      const data = await api.getGSTRates(filters);
      // Ensure rate_percentage is a number
      const normalizedData = data.map(rate => ({
        ...rate,
        rate_percentage: Number(rate.rate_percentage)
      }));
      setGstRates(normalizedData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load GST rates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.rate_name || formData.rate_percentage < 0 || formData.rate_percentage > 100) {
        toast.error('Rate name and valid percentage (0-100) are required');
        return;
      }
      await api.createGSTRate(formData);
      toast.success('GST rate created successfully');
      setShowAddDialog(false);
      resetForm();
      loadGSTRates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create GST rate');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRate) return;
    try {
      if (!formData.rate_name || formData.rate_percentage < 0 || formData.rate_percentage > 100) {
        toast.error('Rate name and valid percentage (0-100) are required');
        return;
      }
      await api.updateGSTRate(selectedRate.id, formData);
      toast.success('GST rate updated successfully');
      setShowEditDialog(false);
      setSelectedRate(null);
      resetForm();
      loadGSTRates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update GST rate');
    }
  };

  const handleDelete = async (rate: GSTRate) => {
    if (!confirm(`Are you sure you want to delete "${rate.rate_name}"?`)) {
      return;
    }
    
    if (rate.is_default) {
      toast.error('Cannot delete default GST rate. Please set another rate as default first.');
      return;
    }

    try {
      await api.deleteGSTRate(rate.id);
      toast.success('GST rate deleted successfully');
      loadGSTRates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete GST rate');
    }
  };

  const handleSetDefault = async (rate: GSTRate) => {
    try {
      await api.setDefaultGSTRate(rate.id);
      toast.success(`"${rate.rate_name}" set as default GST rate`);
      loadGSTRates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default GST rate');
    }
  };

  const handleEdit = (rate: GSTRate) => {
    setSelectedRate(rate);
    setFormData({
      rate_name: rate.rate_name,
      rate_percentage: Number(rate.rate_percentage),
      category: rate.category || '',
      description: rate.description || '',
      is_active: rate.is_active,
      is_default: rate.is_default
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      rate_name: '',
      rate_percentage: 0,
      category: '',
      description: '',
      is_active: true,
      is_default: false
    });
  };

  const filteredRates = gstRates.filter(rate => 
    rate.rate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rate.description && rate.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rate.category && rate.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                GST Rates Management
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage GST rates for different product categories
              </p>
            </div>
            <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add GST Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search GST rates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadGSTRates} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredRates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No GST rates found
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate Name</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">
                        {rate.rate_name}
                        {rate.description && (
                          <p className="text-xs text-gray-500 mt-1">{rate.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {Number(rate.rate_percentage).toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rate.category ? (
                          <Badge variant="secondary">{rate.category}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">All Categories</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rate.is_active ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {rate.is_default ? (
                          <Badge className="bg-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(rate)}
                            className="text-xs"
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(rate)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rate)}
                            disabled={rate.is_default}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add GST Rate</DialogTitle>
            <DialogDescription>
              Create a new GST rate for your pharmacy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rate_name">Rate Name *</Label>
              <Input
                id="rate_name"
                value={formData.rate_name}
                onChange={(e) => setFormData({...formData, rate_name: e.target.value})}
                placeholder="e.g., Standard, Zero Rated, Exempt"
              />
            </div>
            <div>
              <Label htmlFor="rate_percentage">Rate Percentage *</Label>
              <Input
                id="rate_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.rate_percentage}
                onChange={(e) => setFormData({...formData, rate_percentage: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Enter percentage (0-100)</p>
            </div>
            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Medicine, Equipment"
              />
              <p className="text-xs text-gray-500 mt-1">Link this rate to a specific medicine category</p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description of this GST rate"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_default">Set as Default</Label>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
              />
            </div>
            {formData.is_default && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Setting this as default will unset the current default rate.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create GST Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit GST Rate</DialogTitle>
            <DialogDescription>
              Update GST rate information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_rate_name">Rate Name *</Label>
              <Input
                id="edit_rate_name"
                value={formData.rate_name}
                onChange={(e) => setFormData({...formData, rate_name: e.target.value})}
                placeholder="e.g., Standard, Zero Rated, Exempt"
              />
            </div>
            <div>
              <Label htmlFor="edit_rate_percentage">Rate Percentage *</Label>
              <Input
                id="edit_rate_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.rate_percentage}
                onChange={(e) => setFormData({...formData, rate_percentage: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Enter percentage (0-100)</p>
            </div>
            <div>
              <Label htmlFor="edit_category">Category (Optional)</Label>
              <Input
                id="edit_category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Medicine, Equipment"
              />
              <p className="text-xs text-gray-500 mt-1">Link this rate to a specific medicine category</p>
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description of this GST rate"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit_is_active">Active</Label>
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit_is_default">Set as Default</Label>
              <Switch
                id="edit_is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                disabled={selectedRate?.is_default}
              />
            </div>
            {formData.is_default && !selectedRate?.is_default && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Setting this as default will unset the current default rate.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedRate(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update GST Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

