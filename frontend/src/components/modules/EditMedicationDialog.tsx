/**
 * Edit Medication Dialog Component
 * Modal for editing medication records
 * Note: Update API may need to be implemented on backend
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
  Pill,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { EmergencyMedication } from '../../services/api';

interface EditMedicationDialogProps {
  medication: EmergencyMedication;
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function EditMedicationDialog({ medication, patient, visitId, onClose, onSave }: EditMedicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: medication.medication_name || '',
    dosage: medication.dosage || '',
    route: medication.route || 'PO' as 'IV' | 'IM' | 'PO' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Other',
    frequency: medication.frequency || '',
    status: medication.status || 'pending' as 'pending' | 'given' | 'missed' | 'refused',
    notes: medication.notes || ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, show a message that update API is not yet implemented
    toast.info('Update functionality is not yet available. Please contact the administrator.');
    onClose();
    
    // TODO: Implement update API call when backend supports it
    // setLoading(true);
    // try {
    //   await api.updateEmergencyMedication(visitId, medication.id, formData);
    //   toast.success('Medication updated successfully!');
    //   onSave?.();
    //   onClose();
    // } catch (error: any) {
    //   toast.error('Failed to update medication: ' + (error.message || 'Unknown error'));
    // } finally {
    //   setLoading(false);
    // }
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Pill className="w-6 h-6 text-blue-600" />
                Edit Medication
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Patient: {patient.name} • UHID: {patient.uhid}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="medication_name">Medication Name *</Label>
                <Input
                  id="medication_name"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  required
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route">Route</Label>
                  <Select value={formData.route} onValueChange={(value: any) => setFormData({ ...formData, route: value })} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IV">IV</SelectItem>
                      <SelectItem value="IM">IM</SelectItem>
                      <SelectItem value="PO">PO</SelectItem>
                      <SelectItem value="Sublingual">Sublingual</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Inhalation">Inhalation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="given">Given</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="refused">Refused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="e.g., Every 6 hours"
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  disabled
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
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

