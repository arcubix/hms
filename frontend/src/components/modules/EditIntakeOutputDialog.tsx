/**
 * Edit Intake & Output Dialog Component
 * Modal for editing I/O records
 * Note: Update API may need to be implemented on backend
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Droplets,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { EmergencyIntakeOutput } from '../../services/api';

interface EditIntakeOutputDialogProps {
  io: EmergencyIntakeOutput;
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function EditIntakeOutputDialog({ io, patient, visitId, onClose, onSave }: EditIntakeOutputDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    intake_type: io.intake_type || '',
    intake_amount_ml: io.intake_amount_ml?.toString() || '0',
    output_type: io.output_type || '',
    output_amount_ml: io.output_amount_ml?.toString() || '0',
    record_time: io.record_time ? new Date(io.record_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Update functionality is not yet available. Please contact the administrator.');
    onClose();
  };

  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 99998
        }}
      />
      {/* Dialog */}
      <div 
        className="pointer-events-none"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '42rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Droplets className="w-6 h-6 text-blue-600" />
                Edit I/O Record
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Patient: {patient.name} • UHID: {patient.uhid}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intake_type">Intake Type</Label>
                  <Select value={formData.intake_type} onValueChange={(value) => setFormData({ ...formData, intake_type: value })} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intake type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IV Fluids">IV Fluids</SelectItem>
                      <SelectItem value="Oral (Water)">Oral (Water)</SelectItem>
                      <SelectItem value="Oral (Food)">Oral (Food)</SelectItem>
                      <SelectItem value="NG Tube">NG Tube</SelectItem>
                      <SelectItem value="PEG Tube">PEG Tube</SelectItem>
                      <SelectItem value="TPN">TPN</SelectItem>
                      <SelectItem value="Blood Products">Blood Products</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="intake_amount_ml">Intake Amount (ml)</Label>
                  <Input
                    id="intake_amount_ml"
                    type="number"
                    value={formData.intake_amount_ml}
                    onChange={(e) => setFormData({ ...formData, intake_amount_ml: e.target.value })}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="output_type">Output Type</Label>
                  <Select value={formData.output_type} onValueChange={(value) => setFormData({ ...formData, output_type: value })} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select output type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urine">Urine</SelectItem>
                      <SelectItem value="Drainage">Drainage</SelectItem>
                      <SelectItem value="NG Aspirate">NG Aspirate</SelectItem>
                      <SelectItem value="Vomitus">Vomitus</SelectItem>
                      <SelectItem value="Stool">Stool</SelectItem>
                      <SelectItem value="Blood Loss">Blood Loss</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="output_amount_ml">Output Amount (ml)</Label>
                  <Input
                    id="output_amount_ml"
                    type="number"
                    value={formData.output_amount_ml}
                    onChange={(e) => setFormData({ ...formData, output_amount_ml: e.target.value })}
                    disabled
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
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

