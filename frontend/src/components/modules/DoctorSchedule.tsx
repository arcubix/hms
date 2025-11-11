import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Doctor, DoctorSchedule, api } from '../../services/api';
import { Loader2, Calendar, Plus, X, Clock } from 'lucide-react';

interface DoctorScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor;
  onSuccess: () => void;
}

const DAYS_OF_WEEK: DoctorSchedule['day_of_week'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Group slots by day
const groupSlotsByDay = (slots: DoctorSchedule[]): { [day: string]: DoctorSchedule[] } => {
  const grouped: { [day: string]: DoctorSchedule[] } = {};
  DAYS_OF_WEEK.forEach(day => {
    grouped[day] = slots
      .filter(s => s.day_of_week === day)
      .sort((a, b) => (a.slot_order || 0) - (b.slot_order || 0) || 
                      (a.start_time || '').localeCompare(b.start_time || ''));
  });
  return grouped;
};

export function DoctorSchedule({ open, onOpenChange, doctor, onSuccess }: DoctorScheduleProps) {
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);

  useEffect(() => {
    if (open && doctor) {
      loadSchedule();
    }
  }, [open, doctor]);

  const loadSchedule = async () => {
    try {
      setLoadingSchedule(true);
      setError(null);
      const data = await api.getDoctorSchedule(doctor.id.toString());
      
      // Data now contains all slots (multiple per day possible)
      // Format times and ensure all fields are present
      const formattedSchedule = data.map(slot => ({
        ...slot,
        start_time: slot.start_time ? slot.start_time.substring(0, 5) : '09:00',
        end_time: slot.end_time ? slot.end_time.substring(0, 5) : '17:00',
        break_start: slot.break_start ? slot.break_start.substring(0, 5) : '',
        break_end: slot.break_end ? slot.break_end.substring(0, 5) : '',
        slot_order: slot.slot_order ?? 0,
        slot_name: slot.slot_name || '',
        max_appointments_per_slot: slot.max_appointments_per_slot ?? 1,
        appointment_duration: slot.appointment_duration ?? 30,
        is_available: slot.is_available === true || slot.is_available === 1 || slot.is_available === '1'
      }));
      
      setSchedule(formattedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
      console.error('Error loading schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format schedule data before sending
      const formattedSchedule = schedule.map(slot => ({
        ...slot,
        start_time: slot.start_time.length === 5 ? slot.start_time : slot.start_time.substring(0, 5),
        end_time: slot.end_time.length === 5 ? slot.end_time : slot.end_time.substring(0, 5),
        break_start: slot.break_start && slot.break_start.length > 0 ? slot.break_start.substring(0, 5) : null,
        break_end: slot.break_end && slot.break_end.length > 0 ? slot.break_end.substring(0, 5) : null,
        slot_name: slot.slot_name && slot.slot_name.trim() ? slot.slot_name.trim() : null,
        notes: slot.notes && slot.notes.trim() ? slot.notes.trim() : null
      }));

      await api.updateDoctorSchedule(doctor.id.toString(), formattedSchedule);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (day: DoctorSchedule['day_of_week']) => {
    const daySlots = schedule.filter(s => s.day_of_week === day);
    const maxOrder = daySlots.length > 0 
      ? Math.max(...daySlots.map(s => s.slot_order || 0))
      : -1;
    
    const defaultStart = doctor.schedule_start ? doctor.schedule_start.substring(0, 5) : '09:00';
    const defaultEnd = doctor.schedule_end ? doctor.schedule_end.substring(0, 5) : '17:00';
    
    const newSlot: DoctorSchedule = {
      day_of_week: day,
      start_time: defaultStart,
      end_time: defaultEnd,
      is_available: true,
      slot_order: maxOrder + 1,
      slot_name: '',
      max_appointments_per_slot: 1,
      appointment_duration: 30,
      break_start: null,
      break_end: null,
      notes: null
    };
    
    setSchedule(prev => [...prev, newSlot]);
  };

  const removeSlot = (slotId: number | undefined, day: DoctorSchedule['day_of_week'], slotOrder: number) => {
    if (slotId) {
      // Remove by ID if it exists
      setSchedule(prev => prev.filter(s => s.id !== slotId));
    } else {
      // Remove by day and order if no ID (new slot)
      setSchedule(prev => prev.filter(s => 
        !(s.day_of_week === day && (s.slot_order || 0) === slotOrder)
      ));
    }
  };

  const updateSlot = (slotId: number | undefined, day: DoctorSchedule['day_of_week'], slotOrder: number, field: keyof DoctorSchedule, value: any) => {
    setSchedule(prev => prev.map(s => {
      if (slotId && s.id === slotId) {
        return { ...s, [field]: value };
      } else if (!slotId && s.day_of_week === day && (s.slot_order || 0) === slotOrder) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const groupedSchedule = groupSlotsByDay(schedule);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Schedule - {doctor.name}</DialogTitle>
          <DialogDescription>
            Configure multiple time slots per day. You can add multiple working periods (e.g., Morning and Afternoon).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loadingSchedule ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = groupedSchedule[day] || [];
                const hasSlots = daySlots.length > 0;
                
                return (
                  <div
                    key={day}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold text-gray-900">
                        {day}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSlot(day)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time Slot
                      </Button>
                    </div>

                    {hasSlots ? (
                      <div className="space-y-3">
                        {daySlots.map((slot, index) => {
                          const slotKey = slot.id || `new-${day}-${slot.slot_order}`;
                          return (
                            <div
                              key={slotKey}
                              className="p-3 bg-white border rounded-md space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={slot.is_available}
                                    onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'is_available', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    Slot {index + 1}
                                    {slot.slot_name && ` - ${slot.slot_name}`}
                                  </span>
                                  {slot.is_available && (
                                    <span className="text-xs text-green-600 font-medium">Available</span>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSlot(slot.id, day, slot.slot_order || 0)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              {slot.is_available && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Slot Name (Optional)</Label>
                                    <Input
                                      type="text"
                                      placeholder="e.g., Morning"
                                      value={slot.slot_name || ''}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'slot_name', e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Start Time *</Label>
                                    <Input
                                      type="time"
                                      value={slot.start_time}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'start_time', e.target.value)}
                                      required
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">End Time *</Label>
                                    <Input
                                      type="time"
                                      value={slot.end_time}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'end_time', e.target.value)}
                                      required
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Capacity</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="20"
                                      value={slot.max_appointments_per_slot || 1}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'max_appointments_per_slot', parseInt(e.target.value) || 1)}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              )}

                              {slot.is_available && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Duration (min)</Label>
                                    <Input
                                      type="number"
                                      min="15"
                                      max="120"
                                      step="15"
                                      value={slot.appointment_duration || 30}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'appointment_duration', parseInt(e.target.value) || 30)}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Break Start</Label>
                                    <Input
                                      type="time"
                                      value={slot.break_start || ''}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'break_start', e.target.value || null)}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Break End</Label>
                                    <Input
                                      type="time"
                                      value={slot.break_end || ''}
                                      onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'break_end', e.target.value || null)}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No time slots configured. Click "Add Time Slot" to add one.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || loadingSchedule}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingSchedule}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Calendar className="w-4 h-4 mr-2" />
              Save Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
