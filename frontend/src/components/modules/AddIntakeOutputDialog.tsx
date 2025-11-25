/**
 * Add Intake & Output Dialog Component
 * Modal for recording I/O measurements
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Droplets,
  Save,
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddIntakeOutputDialogProps {
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function AddIntakeOutputDialog({ patient, visitId, onClose, onSave }: AddIntakeOutputDialogProps) {
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
    intake_type: '',
    intake_amount_ml: '',
    output_type: '',
    output_amount_ml: '',
    record_time: new Date().toISOString().slice(0, 16)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    const intakeAmount = parseFloat(formData.intake_amount_ml) || 0;
    const outputAmount = parseFloat(formData.output_amount_ml) || 0;

    if (intakeAmount === 0 && outputAmount === 0) {
      toast.error('Please enter at least intake or output amount');
      return;
    }

    setLoading(true);
    try {
      const ioData = {
        intake_type: formData.intake_type || null,
        intake_amount_ml: intakeAmount,
        output_type: formData.output_type || null,
        output_amount_ml: outputAmount,
        record_time: formData.record_time
      };

      await api.addEmergencyIntakeOutput(visitId, ioData);
      toast.success('I/O record added successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding I/O record:', error);
      toast.error('Failed to add I/O record: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const intakeTypes = [
    'Oral Fluids',
    'IV Fluids',
    'Blood Products',
    'TPN',
    'Enteral Feeding',
    'Other'
  ];

  const outputTypes = [
    'Urine',
    'Stool',
    'Vomitus',
    'Drainage',
    'NG Tube',
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
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-blue-600" />
              Add Intake & Output Record
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
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="text-base">I/O Measurement</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Record Time */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Record Time *
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.record_time}
                    onChange={(e) => setFormData({ ...formData, record_time: e.target.value })}
                    required
                  />
                </div>

                {/* Intake Section */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900">Intake</h3>
                  
                  <div className="space-y-2">
                    <Label>Intake Type</Label>
                    <Select
                      value={formData.intake_type}
                      onValueChange={(value) => setFormData({ ...formData, intake_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select intake type" />
                      </SelectTrigger>
                      <SelectContent>
                        {intakeTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Intake Amount (ml)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={formData.intake_amount_ml}
                      onChange={(e) => setFormData({ ...formData, intake_amount_ml: e.target.value })}
                    />
                  </div>
                </div>

                {/* Output Section */}
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900">Output</h3>
                  
                  <div className="space-y-2">
                    <Label>Output Type</Label>
                    <Select
                      value={formData.output_type}
                      onValueChange={(value) => setFormData({ ...formData, output_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select output type" />
                      </SelectTrigger>
                      <SelectContent>
                        {outputTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Amount (ml)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={formData.output_amount_ml}
                      onChange={(e) => setFormData({ ...formData, output_amount_ml: e.target.value })}
                    />
                  </div>
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
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add I/O Record
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

