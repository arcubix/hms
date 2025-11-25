/**
 * Add Duty Roster Dialog Component
 * Modal for adding a new duty roster entry
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  X,
  Calendar,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddDutyDialogProps {
  onClose: () => void;
  onSave?: () => void;
  defaultDate?: string;
}

export function AddDutyDialog({ onClose, onSave, defaultDate }: AddDutyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    shift_type: 'Morning',
    shift_start_time: '06:00',
    shift_end_time: '14:00',
    specialization: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        // Get all doctors (no status filter, or use 'Available' if needed)
        const doctorsData = await api.getDoctors();
        console.log('Loaded doctors data:', doctorsData);
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error('Error loading doctors:', error);
        toast.error('Failed to load doctors list');
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Update shift times when shift type changes
  useEffect(() => {
    switch (formData.shift_type) {
      case 'Morning':
        setFormData(prev => ({ ...prev, shift_start_time: '06:00', shift_end_time: '14:00' }));
        break;
      case 'Evening':
        setFormData(prev => ({ ...prev, shift_start_time: '14:00', shift_end_time: '22:00' }));
        break;
      case 'Night':
        setFormData(prev => ({ ...prev, shift_start_time: '22:00', shift_end_time: '06:00' }));
        break;
    }
  }, [formData.shift_type]);

  // Auto-fill specialization when doctor is selected
  useEffect(() => {
    if (formData.user_id) {
      const selectedDoctor = doctors.find(d => d.id.toString() === formData.user_id);
      if (selectedDoctor && selectedDoctor.specialty) {
        setFormData(prev => ({ ...prev, specialization: selectedDoctor.specialty }));
      }
    }
  }, [formData.user_id, doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.date) {
      toast.error('Doctor and date are required');
      return;
    }

    if (!formData.shift_start_time || !formData.shift_end_time) {
      toast.error('Shift start and end times are required');
      return;
    }

    setLoading(true);
    try {
      const rosterData = {
        user_id: parseInt(formData.user_id),
        date: formData.date,
        shift_type: formData.shift_type,
        shift_start_time: formData.shift_start_time + ':00',
        shift_end_time: formData.shift_end_time + ':00',
        specialization: formData.specialization || null,
        status: formData.status,
        notes: formData.notes || null
      };

      await api.createEmergencyDutyRoster(rosterData);
      toast.success('Duty roster entry added successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding duty roster:', error);
      toast.error('Failed to add duty roster: ' + (error.message || 'Unknown error'));
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
              <Calendar className="w-6 h-6 text-blue-600" />
              Add Duty Roster Entry
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Schedule a staff member for emergency duty
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
              {/* Doctor/Staff */}
              <div className="space-y-2">
                <Label>Doctor/Staff *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">Loading doctors...</div>
                    ) : doctors.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No doctors available</div>
                    ) : (
                      doctors
                        .filter((doctor) => doctor.id != null && doctor.id !== '' && doctor.id !== 0)
                        .map((doctor) => {
                          const doctorId = doctor.id?.toString() || '';
                          if (!doctorId || doctorId === '0') {
                            return null;
                          }
                          return (
                            <SelectItem key={doctor.id} value={doctorId}>
                              {doctor.name || 'Unknown'} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                            </SelectItem>
                          );
                        })
                        .filter(Boolean)
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  required
                />
              </div>

              {/* Shift Type */}
              <div className="space-y-2">
                <Label>Shift Type *</Label>
                <Select
                  value={formData.shift_type}
                  onValueChange={(value) => setFormData({ ...formData, shift_type: value as 'Morning' | 'Evening' | 'Night' })}
                >
                  <SelectTrigger onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning (06:00 - 14:00)</SelectItem>
                    <SelectItem value="Evening">Evening (14:00 - 22:00)</SelectItem>
                    <SelectItem value="Night">Night (22:00 - 06:00)</SelectItem>
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
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="On Duty">On Duty</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shift Start Time */}
              <div className="space-y-2">
                <Label>Shift Start Time *</Label>
                <Input
                  type="time"
                  value={formData.shift_start_time}
                  onChange={(e) => setFormData({ ...formData, shift_start_time: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  required
                />
              </div>

              {/* Shift End Time */}
              <div className="space-y-2">
                <Label>Shift End Time *</Label>
                <Input
                  type="time"
                  value={formData.shift_end_time}
                  onChange={(e) => setFormData({ ...formData, shift_end_time: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  required
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input
                placeholder="e.g., Emergency Medicine, Trauma Surgery"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                rows={3}
              />
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
                Add Duty
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

