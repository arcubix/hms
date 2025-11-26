import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  ArrowLeft,
  Save,
  X,
  Folder,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

interface AddEditCategoryProps {
  mode: 'add' | 'edit';
  categoryId?: string | null;
  onBack: () => void;
  onSave: () => void;
}

const iconOptions = [
  { value: '💊', label: 'Medicine (💊)' },
  { value: '🩺', label: 'Medical Equipment (🩺)' },
  { value: '💉', label: 'Syringe (💉)' },
  { value: '🧪', label: 'Lab Supplies (🧪)' },
  { value: '🔬', label: 'Microscope (🔬)' },
  { value: '🦺', label: 'Safety Equipment (🦺)' },
  { value: '💧', label: 'Fluids (💧)' },
  { value: '🩸', label: 'Blood (🩸)' },
  { value: '📦', label: 'Package (📦)' },
  { value: '🏥', label: 'Hospital (🏥)' },
  { value: '⚕️', label: 'Medical Symbol (⚕️)' },
  { value: '🩹', label: 'Bandage (🩹)' }
];

const colorOptions = [
  { value: 'blue', label: 'Blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  { value: 'green', label: 'Green', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  { value: 'orange', label: 'Orange', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
  { value: 'red', label: 'Red', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  { value: 'teal', label: 'Teal', bgClass: 'bg-teal-100', textClass: 'text-teal-700' },
  { value: 'pink', label: 'Pink', bgClass: 'bg-pink-100', textClass: 'text-pink-700' },
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' }
];

export function AddEditCategory({ mode, categoryId, onBack, onSave }: AddEditCategoryProps) {
  const [formData, setFormData] = useState({
    name: mode === 'edit' ? 'Medicines' : '',
    description: mode === 'edit' ? 'Pharmaceutical drugs and medications including tablets, capsules, syrups, and injections' : '',
    icon: mode === 'edit' ? '💊' : '📦',
    color: mode === 'edit' ? 'blue' : 'blue',
    reorderLevel: mode === 'edit' ? '50' : '100',
    autoReorder: mode === 'edit' ? true : false,
    supplier: mode === 'edit' ? 'Primary Medical Supplies Inc.' : '',
    notes: mode === 'edit' ? 'Critical category requiring strict inventory control and expiry monitoring' : '',
    status: mode === 'edit' ? 'active' : 'active',
    trackExpiry: mode === 'edit' ? true : true,
    requireBatch: mode === 'edit' ? true : false,
    allowNegativeStock: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.reorderLevel || parseInt(formData.reorderLevel) <= 0) {
      newErrors.reorderLevel = 'Reorder level must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowSuccess(true);
      setTimeout(() => {
        onSave();
      }, 1500);
    }
  };

  const selectedColor = colorOptions.find(c => c.value === formData.color);

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
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  {mode === 'add' ? 'Add New Category' : 'Edit Category'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'add' ? 'Create a new inventory category' : `Editing: ${formData.name}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <Card className="border-0 shadow-lg bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-900 font-medium">
                Category {mode === 'add' ? 'created' : 'updated'} successfully!
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Preview Card */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">Preview</p>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${selectedColor?.bgClass} rounded-xl flex items-center justify-center text-3xl`}>
                  {formData.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-gray-900 mb-1">{formData.name || 'Category Name'}</h3>
                  <p className="text-sm text-gray-600">{formData.description || 'Category description will appear here'}</p>
                </div>
                <Badge className={`${selectedColor?.bgClass} ${selectedColor?.textClass}`}>
                  {formData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Category Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Medicines, Medical Equipment"
                    className={errors.name ? 'border-red-300' : ''}
                  />
                  {errors.name && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe this category and what items it contains..."
                  rows={3}
                  className={errors.description ? 'border-red-300' : ''}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => handleChange('icon', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color Theme</Label>
                  <Select value={formData.color} onValueChange={(value) => handleChange('color', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${option.bgClass}`}></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">
                    Default Reorder Level <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => handleChange('reorderLevel', e.target.value)}
                    placeholder="100"
                    className={errors.reorderLevel ? 'border-red-300' : ''}
                  />
                  {errors.reorderLevel && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.reorderLevel}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Primary Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                    placeholder="Supplier name or code"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reorder</Label>
                    <p className="text-sm text-gray-500">Automatically create purchase requests when stock is low</p>
                  </div>
                  <Switch
                    checked={formData.autoReorder}
                    onCheckedChange={(checked) => handleChange('autoReorder', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Expiry Dates</Label>
                    <p className="text-sm text-gray-500">Monitor and alert on expiring items in this category</p>
                  </div>
                  <Switch
                    checked={formData.trackExpiry}
                    onCheckedChange={(checked) => handleChange('trackExpiry', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Batch Numbers</Label>
                    <p className="text-sm text-gray-500">Mandatory batch/lot numbers for items in this category</p>
                  </div>
                  <Switch
                    checked={formData.requireBatch}
                    onCheckedChange={(checked) => handleChange('requireBatch', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Negative Stock</Label>
                    <p className="text-sm text-gray-500">Permit stock levels to go below zero</p>
                  </div>
                  <Switch
                    checked={formData.allowNegativeStock}
                    onCheckedChange={(checked) => handleChange('allowNegativeStock', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes or instructions for this category..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onBack}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {mode === 'add' ? 'Create Category' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
