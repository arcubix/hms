/**
 * Suppliers Management Component
 * Features: Supplier CRUD, payment terms, credit limits, and performance tracking
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
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Supplier, CreateSupplierData } from '../../services/api';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<CreateSupplierData>({
    name: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Pakistan',
    zip_code: '',
    tax_id: '',
    payment_terms: '',
    credit_limit: 0,
    notes: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      const data = await api.getSuppliers(filters);
      setSuppliers(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.phone) {
        toast.error('Name and phone are required');
        return;
      }
      await api.createSupplier(formData);
      toast.success('Supplier created successfully');
      setShowAddDialog(false);
      resetForm();
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create supplier');
    }
  };

  const handleUpdate = async () => {
    if (!selectedSupplier) return;
    try {
      await api.updateSupplier(selectedSupplier.id, formData);
      toast.success('Supplier updated successfully');
      setShowEditDialog(false);
      setSelectedSupplier(null);
      resetForm();
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      alternate_phone: '',
      address: '',
      city: '',
      state: '',
      country: 'Pakistan',
      zip_code: '',
      tax_id: '',
      payment_terms: '',
      credit_limit: 0,
      notes: ''
    });
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      company_name: supplier.company_name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone,
      alternate_phone: supplier.alternate_phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      country: supplier.country,
      zip_code: supplier.zip_code || '',
      tax_id: supplier.tax_id || '',
      payment_terms: supplier.payment_terms || '',
      credit_limit: supplier.credit_limit,
      notes: supplier.notes || ''
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-gray-600">Manage supplier information and performance</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier List</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSuppliers()}
                className="w-64"
              />
              <Button variant="outline" size="icon" onClick={loadSuppliers}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No suppliers found
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        {supplier.company_name && (
                          <div className="text-sm text-gray-500">{supplier.company_name}</div>
                        )}
                        {supplier.supplier_code && (
                          <div className="text-xs text-gray-400">{supplier.supplier_code}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.city && (
                        <div className="text-sm">
                          {supplier.city}
                          {supplier.state && `, ${supplier.state}`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>Rs. {supplier.credit_limit.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={supplier.outstanding_balance > 0 ? 'text-orange-600 font-medium' : ''}>
                        Rs. {supplier.outstanding_balance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'Active' ? 'default' : 'secondary'}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(supplier)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setSelectedSupplier(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
            <DialogDescription>
              {showEditDialog ? 'Update supplier information' : 'Add a new supplier to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Supplier name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                placeholder="Contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Phone number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Alternate Phone</Label>
              <Input
                value={formData.alternate_phone}
                onChange={(e) => setFormData({...formData, alternate_phone: e.target.value})}
                placeholder="Alternate phone"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="State/Province"
              />
            </div>
            <div className="space-y-2">
              <Label>Zip Code</Label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                placeholder="Zip code"
              />
            </div>
            <div className="space-y-2">
              <Label>Tax ID / NTN</Label>
              <Input
                value={formData.tax_id}
                onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                placeholder="Tax registration number"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Input
                value={formData.payment_terms}
                onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                placeholder="e.g., Net 30, COD"
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Limit</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={showEditDialog ? handleUpdate : handleCreate}>
              {showEditDialog ? 'Update' : 'Create'} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

