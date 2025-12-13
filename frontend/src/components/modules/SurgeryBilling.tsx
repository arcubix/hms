/**
 * Surgery Billing Component
 * Manages surgery charges, consumables, and billing for OT schedules
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { api, OTSchedule } from '../../services/api';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calculator,
  Package,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SurgeryBillingProps {
  otScheduleId: number;
  otSchedule?: OTSchedule;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface SurgeryCharges {
  id?: number;
  ot_schedule_id: number;
  surgeon_fee: number;
  assistant_surgeon_fee: number;
  ot_room_charge: number;
  ot_equipment_charge: number;
  ot_duration_hours: number;
  ot_rate_per_hour: number;
  ot_minimum_charge: number;
  ot_overtime_charge: number;
  anesthetist_fee: number;
  anesthesia_type_charge: number;
  anesthesia_duration_charge: number;
  consumables_charge: number;
  implants_charge: number;
  procedure_base_charge: number;
  procedure_complexity_multiplier: number;
  procedure_final_charge: number;
  discount: number;
  tax: number;
  subtotal: number;
  total_amount: number;
  advance_paid: number;
  paid_amount: number;
  due_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  consumables?: SurgeryConsumable[];
}

interface SurgeryConsumable {
  id?: number;
  item_name: string;
  item_type: 'instrument' | 'disposable' | 'implant' | 'equipment' | 'other';
  quantity: number;
  unit_price: number;
  total_price: number;
  serial_number?: string;
  batch_number?: string;
  notes?: string;
}

export function SurgeryBilling({ otScheduleId, otSchedule, onClose, onSuccess }: SurgeryBillingProps) {
  const [charges, setCharges] = useState<SurgeryCharges | null>(null);
  const [consumables, setConsumables] = useState<SurgeryConsumable[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isConsumableDialogOpen, setIsConsumableDialogOpen] = useState(false);
  const [editingConsumable, setEditingConsumable] = useState<SurgeryConsumable | null>(null);
  
  // Consumable form state
  const [consumableName, setConsumableName] = useState('');
  const [consumableType, setConsumableType] = useState<'instrument' | 'disposable' | 'implant' | 'equipment' | 'other'>('other');
  const [consumableQuantity, setConsumableQuantity] = useState('1');
  const [consumableUnitPrice, setConsumableUnitPrice] = useState('');
  const [consumableSerialNumber, setConsumableSerialNumber] = useState('');
  const [consumableBatchNumber, setConsumableBatchNumber] = useState('');
  const [consumableNotes, setConsumableNotes] = useState('');

  useEffect(() => {
    loadCharges();
    loadConsumables();
  }, [otScheduleId]);

  const loadCharges = async () => {
    try {
      setLoading(true);
      const data = await api.getSurgeryCharges(otScheduleId);
      if (data) {
        setCharges(data);
        if (data.consumables) {
          setConsumables(data.consumables);
        }
      }
    } catch (error: any) {
      // Charges might not exist yet, that's okay
      console.log('No charges found yet');
    } finally {
      setLoading(false);
    }
  };

  const loadConsumables = async () => {
    try {
      const data = await api.getSurgeryConsumables(otScheduleId);
      setConsumables(data || []);
    } catch (error: any) {
      console.error('Failed to load consumables:', error);
    }
  };

  const handleSaveCharges = async () => {
    if (!charges) return;

    try {
      setSaving(true);
      
      const chargesData = {
        surgeon_fee: charges.surgeon_fee || 0,
        assistant_surgeon_fee: charges.assistant_surgeon_fee || 0,
        ot_room_charge: charges.ot_room_charge || 0,
        ot_equipment_charge: charges.ot_equipment_charge || 0,
        ot_duration_hours: charges.ot_duration_hours || 0,
        ot_rate_per_hour: charges.ot_rate_per_hour || 0,
        ot_minimum_charge: charges.ot_minimum_charge || 0,
        ot_overtime_charge: charges.ot_overtime_charge || 0,
        anesthetist_fee: charges.anesthetist_fee || 0,
        anesthesia_type_charge: charges.anesthesia_type_charge || 0,
        anesthesia_duration_charge: charges.anesthesia_duration_charge || 0,
        consumables_charge: charges.consumables_charge || 0,
        implants_charge: charges.implants_charge || 0,
        procedure_base_charge: charges.procedure_base_charge || 0,
        procedure_complexity_multiplier: charges.procedure_complexity_multiplier || 1.0,
        procedure_final_charge: charges.procedure_final_charge || 0,
        discount: charges.discount || 0,
        tax: charges.tax || 0,
        advance_paid: charges.advance_paid || 0,
        paid_amount: charges.paid_amount || 0,
      };

      if (charges.id) {
        await api.updateSurgeryCharges(otScheduleId, chargesData);
        toast.success('Surgery charges updated successfully');
      } else {
        await api.createSurgeryCharges(otScheduleId, chargesData);
        toast.success('Surgery charges created successfully');
      }

      await loadCharges();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save charges: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddConsumable = () => {
    setEditingConsumable(null);
    setConsumableName('');
    setConsumableType('other');
    setConsumableQuantity('1');
    setConsumableUnitPrice('');
    setConsumableSerialNumber('');
    setConsumableBatchNumber('');
    setConsumableNotes('');
    setIsConsumableDialogOpen(true);
  };

  const handleEditConsumable = (consumable: SurgeryConsumable) => {
    setEditingConsumable(consumable);
    setConsumableName(consumable.item_name);
    setConsumableType(consumable.item_type);
    setConsumableQuantity(consumable.quantity.toString());
    setConsumableUnitPrice(consumable.unit_price.toString());
    setConsumableSerialNumber(consumable.serial_number || '');
    setConsumableBatchNumber(consumable.batch_number || '');
    setConsumableNotes(consumable.notes || '');
    setIsConsumableDialogOpen(true);
  };

  const handleSaveConsumable = async () => {
    if (!consumableName || !consumableUnitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const consumableData = {
        item_name: consumableName,
        item_type: consumableType,
        quantity: parseInt(consumableQuantity) || 1,
        unit_price: parseFloat(consumableUnitPrice),
        serial_number: consumableSerialNumber || undefined,
        batch_number: consumableBatchNumber || undefined,
        notes: consumableNotes || undefined,
      };

      if (editingConsumable?.id) {
        await api.updateSurgeryConsumable(otScheduleId, editingConsumable.id, consumableData);
        toast.success('Consumable updated successfully');
      } else {
        await api.addSurgeryConsumable(otScheduleId, consumableData);
        toast.success('Consumable added successfully');
      }

      setIsConsumableDialogOpen(false);
      await loadConsumables();
      await loadCharges(); // Reload charges to update consumables total
    } catch (error: any) {
      toast.error('Failed to save consumable: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteConsumable = async (consumableId: number) => {
    if (!confirm('Are you sure you want to delete this consumable?')) return;

    try {
      await api.deleteSurgeryConsumable(otScheduleId, consumableId);
      toast.success('Consumable deleted successfully');
      await loadConsumables();
      await loadCharges();
    } catch (error: any) {
      toast.error('Failed to delete consumable: ' + (error.message || 'Unknown error'));
    }
  };

  const updateChargeField = (field: keyof SurgeryCharges, value: number) => {
    if (!charges) {
      // Initialize charges if not exists
      setCharges({
        ot_schedule_id: otScheduleId,
        surgeon_fee: 0,
        assistant_surgeon_fee: 0,
        ot_room_charge: 0,
        ot_equipment_charge: 0,
        ot_duration_hours: 0,
        ot_rate_per_hour: 0,
        ot_minimum_charge: 0,
        ot_overtime_charge: 0,
        anesthetist_fee: 0,
        anesthesia_type_charge: 0,
        anesthesia_duration_charge: 0,
        consumables_charge: 0,
        implants_charge: 0,
        procedure_base_charge: 0,
        procedure_complexity_multiplier: 1.0,
        procedure_final_charge: 0,
        discount: 0,
        tax: 0,
        subtotal: 0,
        total_amount: 0,
        advance_paid: 0,
        paid_amount: 0,
        due_amount: 0,
        payment_status: 'pending',
        [field]: value,
      } as SurgeryCharges);
      return;
    }

    setCharges({
      ...charges,
      [field]: value,
    });
  };

  const calculateTotals = () => {
    if (!charges) return { subtotal: 0, total: 0, due: 0 };

    // Ensure all values are numbers
    const parseNumber = (val: any): number => {
      if (val === null || val === undefined || val === '') return 0;
      const num = typeof val === 'string' ? parseFloat(val) : Number(val);
      return isNaN(num) ? 0 : num;
    };

    const subtotal =
      parseNumber(charges.surgeon_fee) +
      parseNumber(charges.assistant_surgeon_fee) +
      parseNumber(charges.ot_room_charge) +
      parseNumber(charges.ot_equipment_charge) +
      parseNumber(charges.ot_overtime_charge) +
      parseNumber(charges.anesthetist_fee) +
      parseNumber(charges.anesthesia_type_charge) +
      parseNumber(charges.anesthesia_duration_charge) +
      parseNumber(charges.consumables_charge) +
      parseNumber(charges.implants_charge) +
      parseNumber(charges.procedure_final_charge);

    const discount = parseNumber(charges.discount);
    const tax = parseNumber(charges.tax);
    const total = subtotal - discount + tax;
    const due = total - parseNumber(charges.advance_paid) - parseNumber(charges.paid_amount);

    return { subtotal, total, due };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Surgery Billing</CardTitle>
          <CardDescription>
            {otSchedule?.procedure_name} - {otSchedule?.ot_number} on {otSchedule?.scheduled_date}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Surgeon Fees */}
            <div className="space-y-2">
              <Label>Surgeon Fee</Label>
              <Input
                type="number"
                value={charges?.surgeon_fee || 0}
                onChange={(e) => updateChargeField('surgeon_fee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Assistant Surgeon Fee</Label>
              <Input
                type="number"
                value={charges?.assistant_surgeon_fee || 0}
                onChange={(e) => updateChargeField('assistant_surgeon_fee', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* OT Charges */}
            <div className="space-y-2">
              <Label>OT Room Charge</Label>
              <Input
                type="number"
                value={charges?.ot_room_charge || 0}
                onChange={(e) => updateChargeField('ot_room_charge', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>OT Equipment Charge</Label>
              <Input
                type="number"
                value={charges?.ot_equipment_charge || 0}
                onChange={(e) => updateChargeField('ot_equipment_charge', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>OT Overtime Charge</Label>
              <Input
                type="number"
                value={charges?.ot_overtime_charge || 0}
                onChange={(e) => updateChargeField('ot_overtime_charge', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Anesthesia Charges */}
            <div className="space-y-2">
              <Label>Anesthetist Fee</Label>
              <Input
                type="number"
                value={charges?.anesthetist_fee || 0}
                onChange={(e) => updateChargeField('anesthetist_fee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Anesthesia Type Charge</Label>
              <Input
                type="number"
                value={charges?.anesthesia_type_charge || 0}
                onChange={(e) => updateChargeField('anesthesia_type_charge', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Anesthesia Duration Charge</Label>
              <Input
                type="number"
                value={charges?.anesthesia_duration_charge || 0}
                onChange={(e) => updateChargeField('anesthesia_duration_charge', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Procedure Charges */}
            <div className="space-y-2">
              <Label>Procedure Base Charge</Label>
              <Input
                type="number"
                value={charges?.procedure_base_charge || 0}
                onChange={(e) => updateChargeField('procedure_base_charge', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Complexity Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                value={charges?.procedure_complexity_multiplier || 1.0}
                onChange={(e) => {
                  const multiplier = parseFloat(e.target.value) || 1.0;
                  updateChargeField('procedure_complexity_multiplier', multiplier);
                  if (charges?.procedure_base_charge) {
                    updateChargeField('procedure_final_charge', charges.procedure_base_charge * multiplier);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Procedure Final Charge</Label>
              <Input
                type="number"
                value={charges?.procedure_final_charge || 0}
                onChange={(e) => updateChargeField('procedure_final_charge', parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Payment Fields */}
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input
                type="number"
                value={charges?.discount || 0}
                onChange={(e) => updateChargeField('discount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax</Label>
              <Input
                type="number"
                value={charges?.tax || 0}
                onChange={(e) => updateChargeField('tax', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Advance Paid</Label>
              <Input
                type="number"
                value={charges?.advance_paid || 0}
                onChange={(e) => updateChargeField('advance_paid', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Paid Amount</Label>
              <Input
                type="number"
                value={charges?.paid_amount || 0}
                onChange={(e) => updateChargeField('paid_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Discount:</span>
              <span className="text-red-600">-₹{(Number(charges?.discount) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax:</span>
              <span className="text-green-600">+₹{(Number(charges?.tax) || 0).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold">₹{totals.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Advance Paid:</span>
              <span>₹{(Number(charges?.advance_paid) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>₹{(Number(charges?.paid_amount) || 0).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Due Amount:</span>
              <span className={totals.due > 0 ? 'text-red-600' : 'text-green-600'}>
                ₹{totals.due.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveCharges} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Charges'}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consumables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consumables</CardTitle>
              <CardDescription>Items used during surgery</CardDescription>
            </div>
            <Button onClick={handleAddConsumable}>
              <Plus className="w-4 h-4 mr-2" />
              Add Consumable
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {consumables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No consumables added</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumables.map((consumable) => (
                  <TableRow key={consumable.id}>
                    <TableCell>{consumable.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{consumable.item_type}</Badge>
                    </TableCell>
                    <TableCell>{consumable.quantity}</TableCell>
                    <TableCell>₹{(Number(consumable.unit_price) || 0).toFixed(2)}</TableCell>
                    <TableCell>₹{(Number(consumable.total_price) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditConsumable(consumable)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => consumable.id && handleDeleteConsumable(consumable.id)}
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

      {/* Consumable Dialog */}
      <Dialog open={isConsumableDialogOpen} onOpenChange={setIsConsumableDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingConsumable ? 'Edit Consumable' : 'Add Consumable'}</DialogTitle>
            <DialogDescription>Add an item used during surgery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name *</Label>
              <Input
                value={consumableName}
                onChange={(e) => setConsumableName(e.target.value)}
                placeholder="e.g., Surgical Gloves"
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={consumableType} onValueChange={(value: any) => setConsumableType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instrument">Instrument</SelectItem>
                  <SelectItem value="disposable">Disposable</SelectItem>
                  <SelectItem value="implant">Implant</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={consumableQuantity}
                  onChange={(e) => setConsumableQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label>Unit Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={consumableUnitPrice}
                  onChange={(e) => setConsumableUnitPrice(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Serial Number (for implants)</Label>
              <Input
                value={consumableSerialNumber}
                onChange={(e) => setConsumableSerialNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Batch Number</Label>
              <Input
                value={consumableBatchNumber}
                onChange={(e) => setConsumableBatchNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={consumableNotes}
                onChange={(e) => setConsumableNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsumableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConsumable}>
              {editingConsumable ? 'Update' : 'Add'} Consumable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

