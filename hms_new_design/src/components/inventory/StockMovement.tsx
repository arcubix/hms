import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  ArrowLeft,
  Save,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  X,
  Package
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

interface StockMovementProps {
  type: 'in' | 'out';
  onBack: () => void;
}

export function StockMovement({ type, onBack }: StockMovementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    department: '',
    notes: ''
  });

  // Mock items for search
  const availableItems = [
    { id: '1', name: 'Paracetamol 500mg', sku: 'MED-001', currentStock: 2500, unit: 'Tablets' },
    { id: '2', name: 'N95 Masks', sku: 'DIS-045', currentStock: 15, unit: 'Pieces' },
    { id: '3', name: 'Surgical Gloves (M)', sku: 'DIS-023', currentStock: 850, unit: 'Pairs' },
    { id: '4', name: 'Blood Collection Tubes', sku: 'LAB-112', currentStock: 3200, unit: 'Tubes' },
    { id: '5', name: 'Insulin Injection', sku: 'MED-078', currentStock: 24, unit: 'Vials' }
  ];

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItem = (item: any) => {
    if (!selectedItems.find(si => si.id === item.id)) {
      setSelectedItems([...selectedItems, { 
        ...item, 
        quantity: 1, 
        batchNumber: '',
        expiryDate: type === 'in' ? '' : undefined,
        vendor: type === 'in' ? '' : undefined,
        unitPrice: type === 'in' ? '' : undefined
      }]);
      setSearchQuery('');
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const updateItemField = (itemId: string, field: string, value: string) => {
    setSelectedItems(selectedItems.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    toast.success(`Stock ${type === 'in' ? 'received' : 'issued'} successfully!`);
    onBack();
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
                  <div className={`w-10 h-10 ${type === 'in' ? 'bg-green-50' : 'bg-red-50'} rounded-xl flex items-center justify-center`}>
                    {type === 'in' ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  Stock {type === 'in' ? 'In' : 'Out'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {type === 'in' ? 'Record items received into inventory' : 'Record items issued from inventory'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Transaction Details */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder={type === 'in' ? 'e.g., PO-2024-001' : 'e.g., REQ-2024-001'}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">{type === 'in' ? 'Received By' : 'Department'} *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="opd">OPD</SelectItem>
                        <SelectItem value="ipd">IPD</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="radiology">Radiology</SelectItem>
                        <SelectItem value="ot">Operation Theater</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search & Add Items */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Search & Add Items</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by item name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && filteredItems.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => addItem(item)}
                        >
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {item.sku} • Stock: {item.currentStock} {item.unit}</p>
                          </div>
                          <Plus className="w-5 h-5 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Selected Items</CardTitle>
                    <Badge>{selectedItems.length} item(s)</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {selectedItems.map((item, index) => (
                      <div key={item.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-1">SKU: {item.sku} • Available: {item.currentStock} {item.unit}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                            <Input
                              id={`quantity-${item.id}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="mt-2"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor={`batch-${item.id}`}>Batch Number</Label>
                            <Input
                              id={`batch-${item.id}`}
                              value={item.batchNumber}
                              onChange={(e) => updateItemField(item.id, 'batchNumber', e.target.value)}
                              placeholder="e.g., BAT-001"
                              className="mt-2"
                            />
                          </div>

                          {type === 'in' && (
                            <>
                              <div>
                                <Label htmlFor={`expiry-${item.id}`}>Expiry Date</Label>
                                <Input
                                  id={`expiry-${item.id}`}
                                  type="date"
                                  value={item.expiryDate}
                                  onChange={(e) => updateItemField(item.id, 'expiryDate', e.target.value)}
                                  className="mt-2"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`price-${item.id}`}>Unit Price (₹)</Label>
                                <Input
                                  id={`price-${item.id}`}
                                  type="number"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemField(item.id, 'unitPrice', e.target.value)}
                                  placeholder="0.00"
                                  className="mt-2"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {type === 'in' && (
                          <div className="mt-4">
                            <Label htmlFor={`vendor-${item.id}`}>Vendor</Label>
                            <Input
                              id={`vendor-${item.id}`}
                              value={item.vendor}
                              onChange={(e) => updateItemField(item.id, 'vendor', e.target.value)}
                              placeholder="Vendor name"
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes or remarks..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Summary */}
            {selectedItems.length > 0 && (
              <Card className={`border-0 shadow-md ${type === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Items</p>
                      <p className="text-2xl text-gray-900">{selectedItems.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
                      <p className="text-2xl text-gray-900">
                        {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    {type === 'in' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Estimated Value</p>
                        <p className="text-2xl text-gray-900">
                          ₹{selectedItems.reduce((sum, item) => sum + (item.quantity * (parseFloat(item.unitPrice) || 0)), 0).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 sticky bottom-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                <Save className="w-4 h-4 mr-2" />
                {type === 'in' ? 'Receive Stock' : 'Issue Stock'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
