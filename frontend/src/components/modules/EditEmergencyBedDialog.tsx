/**
 * Edit Emergency Bed Dialog Component
 * Modal for editing an existing bed in emergency ward
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Bed,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface EditEmergencyBedDialogProps {
  bed: any;
  onClose: () => void;
  onSave?: () => void;
}

export function EditEmergencyBedDialog({ bed, onClose, onSave }: EditEmergencyBedDialogProps) {
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    bed_number: '',
    ward_id: '',
    floor: '',
    bed_type: 'Regular',
    status: 'Available'
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const loadWards = async () => {
      try {
        const wardsData = await api.getEmergencyWards();
        setWards(wardsData || []);
      } catch (error) {
        console.error('Error loading wards:', error);
      }
    };
    const initializeForm = async () => {
      await loadWards();
      
      // Initialize form with bed data after wards are loaded
      if (bed) {
        // Try to find ward_id from ward name if not directly available
        let wardId = bed.wardId || bed.ward_id || '';
        if (!wardId && bed.ward) {
          const wardsData = await api.getEmergencyWards();
          const foundWard = wardsData.find((w: any) => w.name === bed.ward);
          if (foundWard) {
            wardId = foundWard.id.toString();
          }
        }

        setFormData({
          bed_number: bed.bedNumber || bed.bed_number || '',
          ward_id: wardId,
          floor: bed.floor || bed.floor_name || '',
          bed_type: bed.type || bed.bed_type || 'Regular',
          status: bed.status || 'Available'
        });
      }
    };
    
    initializeForm();
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [bed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bed_number || !formData.ward_id) {
      toast.error('Bed number and ward are required');
      return;
    }

    if (!bed || !bed.id) {
      toast.error('Bed ID is required');
      return;
    }

    setLoading(true);
    try {
      const bedData: any = {
        bed_number: formData.bed_number,
        ward_id: parseInt(formData.ward_id),
        bed_type: formData.bed_type,
        status: formData.status
      };

      if (formData.floor) {
        bedData.floor = formData.floor;
      }

      const bedId = typeof bed.id === 'string' ? parseInt(bed.id) : bed.id;
      await api.updateEmergencyWardBed(bedId, bedData);
      toast.success('Bed updated successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating bed:', error);
      toast.error('Failed to update bed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!document.body || !bed) return null;

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
              <Bed className="w-6 h-6 text-blue-600" />
              Edit Emergency Bed
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update bed information: {bed.bedNumber || bed.bed_number}
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
            <div className="grid grid-cols-2 gap-4">
              {/* Bed Number */}
              <div className="space-y-2">
                <Label>Bed Number *</Label>
                <Input
                  placeholder="e.g., EA-01, EICU-01"
                  value={formData.bed_number}
                  onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  required
                />
              </div>

              {/* Ward */}
              <div className="space-y-2">
                <Label>Ward *</Label>
                <Select
                  value={formData.ward_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, ward_id: value })}
                >
                  <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id.toString()}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Floor */}
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input
                  placeholder="e.g., Ground Floor, First Floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>

              {/* Bed Type */}
              <div className="space-y-2">
                <Label>Bed Type *</Label>
                <Select
                  value={formData.bed_type}
                  onValueChange={(value) => setFormData({ ...formData, bed_type: value })}
                >
                  <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Isolation">Isolation</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Under Cleaning">Under Cleaning</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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

