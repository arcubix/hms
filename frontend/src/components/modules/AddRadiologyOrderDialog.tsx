/**
 * Add Radiology Order Dialog Component
 * Modal for ordering radiology investigations
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
  Scan,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddRadiologyOrderDialogProps {
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function AddRadiologyOrderDialog({ patient, visitId, onClose, onSave }: AddRadiologyOrderDialogProps) {
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
    test_name: '',
    investigation_type: 'radiology' as 'lab' | 'radiology',
    priority: 'routine' as 'routine' | 'urgent' | 'stat',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    if (!formData.test_name) {
      toast.error('Procedure name is required');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        test_name: formData.test_name,
        investigation_type: formData.investigation_type,
        priority: formData.priority,
        notes: formData.notes || null
      };

      await api.orderEmergencyInvestigation(visitId, orderData);
      toast.success('Radiology order created successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating radiology order:', error);
      toast.error('Failed to create radiology order: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Scan className="w-6 h-6 text-purple-600" />
              New Radiology Order
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient.name} • UHID: {patient.uhid}
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
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-base">Radiology Procedure Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Procedure Name */}
                <div className="space-y-2">
                  <Label>Procedure Name *</Label>
                  <Input
                    placeholder="e.g., Chest X-Ray, CT Head, Ultrasound Abdomen"
                    value={formData.test_name}
                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                    required
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'routine' | 'urgent' | 'stat') => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT (Immediate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Clinical Notes</Label>
                  <Textarea
                    placeholder="Clinical indication or special instructions..."
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
            className="bg-purple-600 hover:bg-purple-700"
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
                Create Radiology Order
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

