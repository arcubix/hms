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
  Trash2,
  Edit,
  Barcode as BarcodeIcon,
  Package,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Barcode, CreateBarcodeData, Medicine } from '../../services/api';

export function BarcodeManagement() {
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<Barcode | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineFilter, setMedicineFilter] = useState<string>('All');
  
  // Form data
  const [formData, setFormData] = useState<CreateBarcodeData>({
    medicine_id: 0,
    barcode: '',
    barcode_type: 'EAN-13',
    is_primary: false
  });

  useEffect(() => {
    loadBarcodes();
    loadMedicines();
  }, [medicineFilter]);

  const loadBarcodes = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (medicineFilter !== 'All') {
        filters.medicine_id = parseInt(medicineFilter);
      }
      
      const data = await api.getBarcodes(filters);
      setBarcodes(data);
    } catch (error: any) {
      console.error('Failed to load barcodes:', error);
      toast.error('Failed to load barcodes');
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

  const handleGenerate = async (medicineId: number, isPrimary = false) => {
    try {
      await api.generateBarcode(medicineId, isPrimary);
      toast.success('Barcode generated successfully');
      loadBarcodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate barcode');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicine_id || !formData.barcode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (isEditMode && selectedBarcode) {
        await api.updateBarcode(selectedBarcode.id, formData);
        toast.success('Barcode updated successfully');
      } else {
        await api.createBarcode(formData);
        toast.success('Barcode created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      loadBarcodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save barcode');
    }
  };

  const handleEdit = (barcode: Barcode) => {
    setSelectedBarcode(barcode);
    setFormData({
      medicine_id: barcode.medicine_id,
      barcode: barcode.barcode,
      barcode_type: barcode.barcode_type,
      is_primary: barcode.is_primary
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this barcode?')) {
      return;
    }

    try {
      await api.deleteBarcode(id);
      toast.success('Barcode deleted successfully');
      loadBarcodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete barcode');
    }
  };

  const resetForm = () => {
    setFormData({
      medicine_id: 0,
      barcode: '',
      barcode_type: 'EAN-13',
      is_primary: false
    });
    setIsEditMode(false);
    setSelectedBarcode(null);
  };

  const filteredBarcodes = barcodes.filter(bc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        bc.barcode.toLowerCase().includes(query) ||
        bc.medicine_name?.toLowerCase().includes(query) ||
        bc.medicine_code?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Barcode Management</h1>
          <p className="text-gray-600 mt-1">Manage barcodes for medicines</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Barcode
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Barcode' : 'Create Barcode'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update barcode information' : 'Add a new barcode for a medicine'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Medicine *</Label>
                <Select
                  value={formData.medicine_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, medicine_id: parseInt(value) })}
                  disabled={isEditMode}
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
                {!isEditMode && formData.medicine_id > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleGenerate(formData.medicine_id, formData.is_primary)}
                  >
                    <BarcodeIcon className="w-4 h-4 mr-2" />
                    Generate EAN-13 Barcode
                  </Button>
                )}
              </div>

              <div>
                <Label>Barcode *</Label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter or scan barcode"
                  required
                />
              </div>

              <div>
                <Label>Barcode Type</Label>
                <Select
                  value={formData.barcode_type}
                  onValueChange={(value) => setFormData({ ...formData, barcode_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EAN-13">EAN-13</SelectItem>
                    <SelectItem value="UPC">UPC</SelectItem>
                    <SelectItem value="Code128">Code128</SelectItem>
                    <SelectItem value="Code39">Code39</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_primary" className="cursor-pointer">
                  Set as primary barcode
                </Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {isEditMode ? 'Update' : 'Create'} Barcode
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
                  placeholder="Search by barcode, medicine name, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-64">
              <Label>Medicine</Label>
              <Select value={medicineFilter} onValueChange={setMedicineFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Medicines</SelectItem>
                  {medicines.map(med => (
                    <SelectItem key={med.id} value={med.id.toString()}>
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadBarcodes}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Barcodes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Barcodes ({filteredBarcodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBarcodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No barcodes found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBarcodes.map((bc) => (
                  <TableRow key={bc.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bc.medicine_name}</div>
                        {bc.medicine_code && (
                          <div className="text-xs text-gray-500">{bc.medicine_code}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BarcodeIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-mono">{bc.barcode}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{bc.barcode_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {bc.is_primary ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(bc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(bc)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(bc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

