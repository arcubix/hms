/**
 * Edit Duty Roster Dialog Component
 * Modal for editing an existing duty roster entry
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
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface EditDutyDialogProps {
  duty: any;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

export function EditDutyDialog({ duty, onClose, onSave, onDelete }: EditDutyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    shift_type: 'Morning',
    shift_start_time: '06:00',
    shift_end_time: '14:00',
    specialization: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const initializeForm = async () => {
      const loadDoctors = async () => {
        try {
          setLoadingDoctors(true);
          // Get all doctors (no status filter)
          const doctorsData = await api.getDoctors();
          console.log('Loaded doctors data:', doctorsData);
          setDoctors(doctorsData || []);
          return doctorsData || [];
        } catch (error) {
          console.error('Error loading doctors:', error);
          setDoctors([]);
          return [];
        } finally {
          setLoadingDoctors(false);
        }
      };
      
      const doctorsData = await loadDoctors();
      
      // Initialize form with duty data after doctors are loaded
      if (duty) {
        // Extract time from shiftTime string if needed
        let startTime = '06:00';
        let endTime = '14:00';
        
        if (duty.shift_start_time) {
          // If we have shift_start_time directly, use it
          startTime = duty.shift_start_time.substring(0, 5);
        } else if (duty.shiftTime) {
          const timeMatch = duty.shiftTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
          if (timeMatch) {
            // Convert 12-hour to 24-hour format
            const startHour = parseInt(timeMatch[1]);
            const startMin = timeMatch[2];
            const startPeriod = timeMatch[3];
            const endHour = parseInt(timeMatch[4]);
            const endMin = timeMatch[5];
            const endPeriod = timeMatch[6];
            
            let startHour24 = startPeriod === 'PM' && startHour !== 12 ? startHour + 12 : startHour;
            if (startPeriod === 'AM' && startHour === 12) startHour24 = 0;
            let endHour24 = endPeriod === 'PM' && endHour !== 12 ? endHour + 12 : endHour;
            if (endPeriod === 'AM' && endHour === 12) endHour24 = 0;
            
            startTime = `${startHour24.toString().padStart(2, '0')}:${startMin}`;
            endTime = `${endHour24.toString().padStart(2, '0')}:${endMin}`;
          }
        }

        if (duty.shift_end_time) {
          endTime = duty.shift_end_time.substring(0, 5);
        }

        // Try to get user_id from duty object
        let userId = duty.userId || duty.user_id || '';
        if (!userId && duty.doctorName && doctorsData.length > 0) {
          const foundDoctor = doctorsData.find((d: any) => d.name === duty.doctorName);
          if (foundDoctor) {
            userId = foundDoctor.id.toString();
          }
        }

        setFormData({
          user_id: userId,
          date: duty.date || new Date().toISOString().split('T')[0],
          shift_type: duty.shiftType || duty.shift_type || 'Morning',
          shift_start_time: startTime,
          shift_end_time: endTime,
          specialization: duty.specialization || '',
          status: duty.status || 'Scheduled',
          notes: duty.notes || ''
        });
      }
    };
    
    initializeForm();
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [duty]);

  // Update shift times when shift type changes
  useEffect(() => {
    switch (formData.shift_type) {
      case 'Morning':
        if (!duty || !duty.shift_start_time) {
          setFormData(prev => ({ ...prev, shift_start_time: '06:00', shift_end_time: '14:00' }));
        }
        break;
      case 'Evening':
        if (!duty || !duty.shift_start_time) {
          setFormData(prev => ({ ...prev, shift_start_time: '14:00', shift_end_time: '22:00' }));
        }
        break;
      case 'Night':
        if (!duty || !duty.shift_start_time) {
          setFormData(prev => ({ ...prev, shift_start_time: '22:00', shift_end_time: '06:00' }));
        }
        break;
    }
  }, [formData.shift_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.date) {
      toast.error('Doctor and date are required');
      return;
    }

    if (!duty || !duty.id) {
      toast.error('Duty ID is required');
      return;
    }

    setLoading(true);
    try {
      const rosterData: any = {
        user_id: parseInt(formData.user_id),
        date: formData.date,
        shift_type: formData.shift_type,
        shift_start_time: formData.shift_start_time + ':00',
        shift_end_time: formData.shift_end_time + ':00',
        status: formData.status
      };

      if (formData.specialization) {
        rosterData.specialization = formData.specialization;
      }

      if (formData.notes) {
        rosterData.notes = formData.notes;
      }

      const dutyId = typeof duty.id === 'string' ? parseInt(duty.id) : duty.id;
      await api.updateEmergencyDutyRoster(dutyId, rosterData);
      toast.success('Duty roster entry updated successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating duty roster:', error);
      toast.error('Failed to update duty roster: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!duty || !duty.id) {
      toast.error('Duty ID is required');
      return;
    }

    if (!confirm('Are you sure you want to delete this duty roster entry?')) {
      return;
    }

    setDeleting(true);
    try {
      const dutyId = typeof duty.id === 'string' ? parseInt(duty.id) : duty.id;
      await api.deleteEmergencyDutyRoster(dutyId);
      toast.success('Duty roster entry deleted successfully!');
      onDelete?.();
      onClose();
    } catch (error: any) {
      console.error('Error deleting duty roster:', error);
      toast.error('Failed to delete duty roster: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  if (!document.body || !duty) return null;

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
              Edit Duty Roster Entry
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update duty schedule: {duty.doctorName || duty.user_name}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading || deleting}>
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
                  value={formData.user_id.toString()}
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
          className="flex items-center justify-between gap-3 p-6 border-t bg-gray-50"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading || deleting}
            type="button"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={loading || deleting}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={loading || deleting}
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
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}

