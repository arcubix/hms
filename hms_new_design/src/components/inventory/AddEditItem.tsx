import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft,
  Save,
  Package,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface AddEditItemProps {
  mode: 'add' | 'edit';
  itemId?: string | null;
  onBack: () => void;
  onSave: () => void;
}

export function AddEditItem({ mode, itemId, onBack, onSave }: AddEditItemProps) {
  const [formData, setFormData] = useState({
    name: mode === 'edit' ? 'Paracetamol 500mg' : '',
    sku: mode === 'edit' ? 'MED-001' : '',
    category: mode === 'edit' ? 'Medicines' : '',
    description: mode === 'edit' ? 'Pain reliever and fever reducer. Used to treat mild to moderate pain and to reduce fever.' : '',
    manufacturer: mode === 'edit' ? 'PharmaCorp Ltd.' : '',
    unit: mode === 'edit' ? 'Tablets' : '',
    unitPrice: mode === 'edit' ? '2.50' : '',
    reorderLevel: mode === 'edit' ? '1000' : '',
    maxStockLevel: mode === 'edit' ? '5000' : '',
    location: mode === 'edit' ? 'Pharmacy - Shelf A1' : '',
    batchNumber: mode === 'edit' ? 'PAR-2024-001' : '',
    expiryDate: mode === 'edit' ? '2025-06-15' : '',
    initialStock: mode === 'edit' ? '2500' : '',
    vendor: mode === 'edit' ? 'MediSupply Co.' : '',
    vendorContact: mode === 'edit' ? '+91 98765 43210' : '',
    vendorEmail: mode === 'edit' ? 'sales@medisupply.com' : '',
    hsn: mode === 'edit' ? '3004' : '',
    gst: mode === 'edit' ? '12' : '',
    notes: mode === 'edit' ? 'Store in cool, dry place' : ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.sku || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success(mode === 'add' ? 'Item added successfully!' : 'Item updated successfully!');
    onSave();
  };

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
                  <Package className="w-6 h-6" />
                  {mode === 'add' ? 'Add New Item' : 'Edit Item'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'add' ? 'Add a new item to inventory' : 'Update item information'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Required fields are marked with *</p>
                <p className="text-xs text-blue-700 mt-1">Please ensure all mandatory information is filled correctly</p>
              </div>
            </div>

            {/* Basic Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Paracetamol 500mg"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU / Item Code *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      placeholder="e.g., MED-001"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medicines">Medicines</SelectItem>
                        <SelectItem value="Equipment">Medical Equipment</SelectItem>
                        <SelectItem value="Disposables">Disposables</SelectItem>
                        <SelectItem value="Lab Supplies">Lab Supplies</SelectItem>
                        <SelectItem value="Consumables">Consumables</SelectItem>
                        <SelectItem value="Surgical Items">Surgical Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Enter item description"
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => handleChange('manufacturer', e.target.value)}
                      placeholder="e.g., PharmaCorp Ltd."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unit of Measurement *</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tablets">Tablets</SelectItem>
                        <SelectItem value="Capsules">Capsules</SelectItem>
                        <SelectItem value="Vials">Vials</SelectItem>
                        <SelectItem value="Bottles">Bottles</SelectItem>
                        <SelectItem value="Pieces">Pieces</SelectItem>
                        <SelectItem value="Boxes">Boxes</SelectItem>
                        <SelectItem value="Packs">Packs</SelectItem>
                        <SelectItem value="Sets">Sets</SelectItem>
                        <SelectItem value="Tubes">Tubes</SelectItem>
                        <SelectItem value="Pairs">Pairs</SelectItem>
                        <SelectItem value="Liters">Liters</SelectItem>
                        <SelectItem value="Milliliters">Milliliters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Stock Levels */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Pricing & Stock Levels</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => handleChange('unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="initialStock">Initial Stock Quantity *</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      value={formData.initialStock}
                      onChange={(e) => handleChange('initialStock', e.target.value)}
                      placeholder="0"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reorderLevel">Reorder Level *</Label>
                    <Input
                      id="reorderLevel"
                      type="number"
                      value={formData.reorderLevel}
                      onChange={(e) => handleChange('reorderLevel', e.target.value)}
                      placeholder="e.g., 1000"
                      className="mt-2"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
                  </div>

                  <div>
                    <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      value={formData.maxStockLevel}
                      onChange={(e) => handleChange('maxStockLevel', e.target.value)}
                      placeholder="e.g., 5000"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hsn">HSN Code</Label>
                    <Input
                      id="hsn"
                      value={formData.hsn}
                      onChange={(e) => handleChange('hsn', e.target.value)}
                      placeholder="e.g., 3004"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gst">GST Rate (%)</Label>
                    <Select value={formData.gst} onValueChange={(value) => handleChange('gst', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select GST rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch & Expiry Details */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Batch & Expiry Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => handleChange('batchNumber', e.target.value)}
                      placeholder="e.g., PAR-2024-001"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleChange('expiryDate', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Information */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="vendor">Vendor Name</Label>
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) => handleChange('vendor', e.target.value)}
                      placeholder="e.g., MediSupply Co."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vendorContact">Vendor Contact</Label>
                    <Input
                      id="vendorContact"
                      value={formData.vendorContact}
                      onChange={(e) => handleChange('vendorContact', e.target.value)}
                      placeholder="e.g., +91 98765 43210"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="vendorEmail">Vendor Email</Label>
                    <Input
                      id="vendorEmail"
                      type="email"
                      value={formData.vendorEmail}
                      onChange={(e) => handleChange('vendorEmail', e.target.value)}
                      placeholder="e.g., sales@medisupply.com"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Location */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Storage Location</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label htmlFor="location">Location / Department *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g., Pharmacy - Shelf A1"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Any special storage instructions or notes"
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 sticky bottom-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Add Item' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
