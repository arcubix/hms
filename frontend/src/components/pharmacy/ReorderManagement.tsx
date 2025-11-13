/**
 * Reorder Management Component
 * Features: Reorder alerts, minimum stock settings, auto-reorder configuration, and PO generation
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { 
  AlertTriangle, 
  Settings, 
  Plus,
  RefreshCw,
  Package,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api, LowStockAlert, ReorderLevel, CreateReorderLevelData, Supplier, Medicine } from '../../services/api';

export function ReorderManagement() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [reorderLevels, setReorderLevels] = useState<ReorderLevel[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<CreateReorderLevelData>({
    minimum_stock: 10,
    reorder_quantity: 50,
    maximum_stock: 100,
    preferred_supplier_id: undefined,
    auto_reorder: false
  });

  useEffect(() => {
    loadAlerts();
    loadReorderLevels();
    loadMedicines();
    loadSuppliers();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getLowStockAlertsReorder(false);
      setAlerts(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load alerts');
    }
  };

  const loadReorderLevels = async () => {
    try {
      const data = await api.getReorderLevels({});
      setReorderLevels(data);
    } catch (error: any) {
      console.error('Failed to load reorder levels:', error);
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

  const loadSuppliers = async () => {
    try {
      const data = await api.getSuppliers({ status: 'Active' });
      setSuppliers(data);
    } catch (error: any) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const handleSetReorderLevel = async () => {
    if (!selectedMedicine) return;

    try {
      await api.setReorderLevel(selectedMedicine.id, formData);
      toast.success('Reorder level set successfully');
      setShowSettingsDialog(false);
      setSelectedMedicine(null);
      loadAlerts();
      loadReorderLevels();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set reorder level');
    }
  };

  const handleGeneratePOs = async () => {
    try {
      setLoading(true);
      const result = await api.generateAutoReorderPOs();
      toast.success(`Generated ${result.count} purchase order(s)`);
      loadAlerts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const openSettingsDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    // Load existing reorder level if any
    const existing = reorderLevels.find(rl => rl.medicine_id === medicine.id);
    if (existing) {
      setFormData({
        minimum_stock: existing.minimum_stock,
        reorder_quantity: existing.reorder_quantity,
        maximum_stock: existing.maximum_stock || 100,
        preferred_supplier_id: existing.preferred_supplier_id,
        auto_reorder: existing.auto_reorder
      });
    } else {
      setFormData({
        minimum_stock: 10,
        reorder_quantity: 50,
        maximum_stock: 100,
        preferred_supplier_id: undefined,
        auto_reorder: false
      });
    }
    setShowSettingsDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reorder Management</h2>
          <p className="text-gray-600">Manage stock reorder levels and auto-reorder settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAlerts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleGeneratePOs} disabled={loading}>
            <Package className="w-4 h-4 mr-2" />
            Generate Auto-Reorder POs
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Reorder Quantity</TableHead>
                <TableHead>Preferred Supplier</TableHead>
                <TableHead>Auto-Reorder</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No low stock alerts
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.medicine_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.name}</div>
                        {alert.generic_name && (
                          <div className="text-sm text-gray-500">{alert.generic_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{alert.available_stock}</Badge>
                    </TableCell>
                    <TableCell>{alert.minimum_stock}</TableCell>
                    <TableCell>{alert.reorder_quantity}</TableCell>
                    <TableCell>{alert.preferred_supplier_name || '-'}</TableCell>
                    <TableCell>
                      {alert.auto_reorder ? (
                        <Badge variant="default">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const medicine = medicines.find(m => m.id === alert.medicine_id);
                          if (medicine) openSettingsDialog(medicine);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reorder Level Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Reorder Quantity</TableHead>
                <TableHead>Maximum Stock</TableHead>
                <TableHead>Preferred Supplier</TableHead>
                <TableHead>Auto-Reorder</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reorderLevels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{level.medicine_name}</div>
                      {level.generic_name && (
                        <div className="text-sm text-gray-500">{level.generic_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{level.minimum_stock}</TableCell>
                  <TableCell>{level.reorder_quantity}</TableCell>
                  <TableCell>{level.maximum_stock || '-'}</TableCell>
                  <TableCell>{level.preferred_supplier_name || '-'}</TableCell>
                  <TableCell>
                    {level.auto_reorder ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const medicine = medicines.find(m => m.id === level.medicine_id);
                        if (medicine) openSettingsDialog(medicine);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reorder Level Settings</DialogTitle>
            <DialogDescription>
              Configure reorder levels for {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Stock *</Label>
                <Input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({...formData, minimum_stock: parseInt(e.target.value) || 0})}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Quantity *</Label>
                <Input
                  type="number"
                  value={formData.reorder_quantity}
                  onChange={(e) => setFormData({...formData, reorder_quantity: parseInt(e.target.value) || 0})}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Stock</Label>
                <Input
                  type="number"
                  value={formData.maximum_stock}
                  onChange={(e) => setFormData({...formData, maximum_stock: parseInt(e.target.value) || undefined})}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Supplier</Label>
                <Select 
                  value={formData.preferred_supplier_id?.toString() || ''} 
                  onValueChange={(v) => setFormData({...formData, preferred_supplier_id: v ? parseInt(v) : undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Auto-Reorder</Label>
              <Switch
                checked={formData.auto_reorder}
                onCheckedChange={(checked) => setFormData({...formData, auto_reorder: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetReorderLevel}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

