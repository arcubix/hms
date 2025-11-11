import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { DoctorSchedule } from '../../services/api';
import { Plus, X } from 'lucide-react';

interface DoctorScheduleContentProps {
  schedule: DoctorSchedule[];
  setSchedule: React.Dispatch<React.SetStateAction<DoctorSchedule[]>>;
  defaultStartTime?: string;
  defaultEndTime?: string;
  loading?: boolean;
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

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

export function DoctorScheduleContent({ 
  schedule, 
  setSchedule, 
  defaultStartTime = '09:00',
  defaultEndTime = '17:00',
  loading = false
}: DoctorScheduleContentProps) {
  const [copyFromDay, setCopyFromDay] = useState<string | null>(null);

  const addSlot = (day: DoctorSchedule['day_of_week']) => {
    const daySlots = schedule.filter(s => s.day_of_week === day);
    const maxOrder = daySlots.length > 0 
      ? Math.max(...daySlots.map(s => s.slot_order || 0))
      : -1;
    
    const newSlot: DoctorSchedule = {
      day_of_week: day,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
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
      setSchedule(prev => prev.filter(s => s.id !== slotId));
    } else {
      setSchedule(prev => prev.filter(s => 
        !(s.day_of_week === day && (s.slot_order || 0) === slotOrder)
      ));
    }
  };

  const updateSlot = (
    slotId: number | undefined, 
    day: DoctorSchedule['day_of_week'], 
    slotOrder: number, 
    field: keyof DoctorSchedule, 
    value: any
  ) => {
    setSchedule(prev => prev.map(s => {
      if (slotId && s.id === slotId) {
        return { ...s, [field]: value };
      } else if (!slotId && s.day_of_week === day && (s.slot_order || 0) === slotOrder) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const copySlot = (fromSlot: DoctorSchedule, toDay: DoctorSchedule['day_of_week']) => {
    const daySlots = schedule.filter(s => s.day_of_week === toDay);
    const maxOrder = daySlots.length > 0 
      ? Math.max(...daySlots.map(s => s.slot_order || 0))
      : -1;
    
    const newSlot: DoctorSchedule = {
      ...fromSlot,
      day_of_week: toDay,
      slot_order: maxOrder + 1,
      id: undefined // New slot, no ID
    };
    
    setSchedule(prev => [...prev, newSlot]);
    setCopyFromDay(null);
  };

  const groupedSchedule = groupSlotsByDay(schedule);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Configure multiple time slots per day. Add morning, afternoon, evening slots as needed.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              // Add default slot to all weekdays
              WEEKDAYS.forEach(day => {
                const daySlots = schedule.filter(s => s.day_of_week === day);
                if (daySlots.length === 0) {
                  addSlot(day);
                }
              });
            }}
            disabled={loading}
          >
            Add to All Weekdays
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = groupedSchedule[day] || [];
          const hasSlots = daySlots.length > 0;
          
          return (
            <div
              key={day}
              className={`p-4 border rounded-lg ${hasSlots ? 'bg-white' : 'bg-gray-50'}`}
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
                  disabled={loading}
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
                        className="p-3 bg-gray-50 border rounded-md space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={slot.is_available}
                              onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'is_available', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              disabled={loading}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Slot {index + 1}
                              {slot.slot_name && ` - ${slot.slot_name}`}
                            </span>
                            {slot.is_available && (
                              <span className="text-xs text-green-600 font-medium">Available</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {copyFromDay === slotKey ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCopyFromDay(null)}
                                className="text-xs"
                              >
                                Cancel Copy
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCopyFromDay(slotKey)}
                                className="text-xs text-blue-600"
                                title="Copy this slot to another day"
                              >
                                Copy
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSlot(slot.id, day, slot.slot_order || 0)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {slot.is_available && (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Slot Name (Optional)</Label>
                                <Input
                                  type="text"
                                  placeholder="e.g., Morning"
                                  value={slot.slot_name || ''}
                                  onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'slot_name', e.target.value)}
                                  className="text-sm"
                                  disabled={loading}
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
                                  disabled={loading}
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
                                  disabled={loading}
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
                                  disabled={loading}
                                />
                              </div>
                            </div>

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
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Break Start</Label>
                                <Input
                                  type="time"
                                  value={slot.break_start || ''}
                                  onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'break_start', e.target.value || null)}
                                  className="text-sm"
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Break End</Label>
                                <Input
                                  type="time"
                                  value={slot.break_end || ''}
                                  onChange={(e) => updateSlot(slot.id, day, slot.slot_order || 0, 'break_end', e.target.value || null)}
                                  className="text-sm"
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          </>
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

              {/* Copy to this day */}
              {copyFromDay && copyFromDay !== `${day}-slot` && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sourceSlot = schedule.find(s => 
                        (s.id && `slot-${s.id}` === copyFromDay) || 
                        (!s.id && `new-${s.day_of_week}-${s.slot_order}` === copyFromDay)
                      );
                      if (sourceSlot) {
                        copySlot(sourceSlot, day);
                      }
                    }}
                    className="w-full text-xs"
                  >
                    Copy Slot to {day}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

