/**
 * Add Medication Dialog Component
 * Modal for adding medication to emergency patient
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
import { api } from '../../services/api';

interface AddMedicationDialogProps {
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function AddMedicationDialog({ patient, visitId, onClose, onSave }: AddMedicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    route: 'PO' as 'IV' | 'IM' | 'PO' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Other',
    frequency: '',
    status: 'pending' as 'pending' | 'given' | 'missed' | 'refused',
    notes: ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load medicines on mount
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setLoadingMedicines(true);
        const medicinesData = await api.getMedicines({ status: 'Active' });
        setMedicines(medicinesData || []);
      } catch (error) {
        console.error('Error loading medicines:', error);
        toast.error('Failed to load medicines list');
      } finally {
        setLoadingMedicines(false);
      }
    };
    loadMedicines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    if (!formData.medication_name || !formData.dosage) {
      toast.error('Medication name and dosage are required');
      return;
    }

    setLoading(true);
    try {
      const medicationData = {
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        route: formData.route,
        frequency: formData.frequency || null,
        status: formData.status,
        notes: formData.notes || null
      };

      await api.administerEmergencyMedication(visitId, medicationData);
      toast.success('Medication added successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!document.body) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
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
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
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
          padding: '1rem',
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            width: '100%',
            maxWidth: '42rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-blue-600" />
              Add Medication
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
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base">Medication Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Medication Name */}
                <div className="space-y-2">
                  <Label>Medication Name *</Label>
                  <Select
                    value={formData.medication_name}
                    onValueChange={(value) => setFormData({ ...formData, medication_name: value })}
                    disabled={loadingMedicines}
                  >
                    <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <SelectValue placeholder={loadingMedicines ? "Loading medicines..." : "Select medication"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingMedicines ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">Loading medicines...</div>
                      ) : medicines.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No medicines available</div>
                      ) : (
                        medicines.map((medicine) => (
                          <SelectItem 
                            key={medicine.id} 
                            value={medicine.name}
                          >
                            {medicine.name}
                            {medicine.strength && ` (${medicine.strength})`}
                            {medicine.generic_name && ` - ${medicine.generic_name}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                  <Label>Dosage *</Label>
                  <Input
                    placeholder="e.g., 500mg, 10ml"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    required
                  />
                </div>

                {/* Route */}
                <div className="space-y-2">
                  <Label>Route *</Label>
                  <Select
                    value={formData.route}
                    onValueChange={(value) => setFormData({ ...formData, route: value })}
                  >
                    <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PO">PO (Oral)</SelectItem>
                      <SelectItem value="IV">IV (Intravenous)</SelectItem>
                      <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                      <SelectItem value="Sublingual">Sublingual</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Inhalation">Inhalation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    placeholder="e.g., Every 6 hours, Twice daily"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="given">Given</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="refused">Refused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes or instructions..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add Medication
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

