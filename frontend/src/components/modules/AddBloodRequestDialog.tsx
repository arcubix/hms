/**
 * Add Blood Request Dialog Component
 * Modal for requesting blood products
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Droplet,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddBloodRequestDialogProps {
  patient: any;
  visitId: number;
  patientBloodGroup?: string;
  onClose: () => void;
  onSave?: () => void;
}

export function AddBloodRequestDialog({ patient, visitId, patientBloodGroup, onClose, onSave }: AddBloodRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [formData, setFormData] = useState({
    product_type: 'Whole Blood',
    units: '1',
    urgency: 'Routine' as 'Routine' | 'Urgent' | 'Emergency',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    const units = parseInt(formData.units);
    if (isNaN(units) || units <= 0) {
      toast.error('Please enter a valid number of units');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        product_type: formData.product_type,
        units: units,
        urgency: formData.urgency,
        notes: formData.notes || null
      };

      await api.createEmergencyBloodBankRequest(visitId, requestData);
      toast.success('Blood request created successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating blood request:', error);
      toast.error('Failed to create blood request: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const productTypes = [
    'Whole Blood',
    'Packed Red Blood Cells',
    'Fresh Frozen Plasma',
    'Platelets',
    'Cryoprecipitate',
    'Albumin',
    'Other'
  ];

  if (!mounted) return null;

  const dialogContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-pink-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Droplet className="w-6 h-6 text-red-600" />
              Request Blood Products
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient.name} • UHID: {patient.uhid}
              {patientBloodGroup && ` • Blood Group: ${patientBloodGroup}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="text-base">Blood Product Request</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Product Type */}
                <div className="space-y-2">
                  <Label>Product Type *</Label>
                  <Select
                    value={formData.product_type}
                    onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Units */}
                <div className="space-y-2">
                  <Label>Number of Units *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    required
                  />
                </div>

                {/* Urgency */}
                <div className="space-y-2">
                  <Label>Urgency *</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value: 'Routine' | 'Urgent' | 'Emergency') => setFormData({ ...formData, urgency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Clinical Notes</Label>
                  <Textarea
                    placeholder="Enter clinical indication or special requirements..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Request Blood Products
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}

