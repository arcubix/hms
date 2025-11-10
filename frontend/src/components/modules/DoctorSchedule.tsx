import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Doctor, DoctorSchedule, api } from '../../services/api';
import { Loader2, Calendar } from 'lucide-react';

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
      
      // Initialize schedule for all days if not present
      const daysMap = new Map(data.map(s => [s.day_of_week, s]));
      const fullSchedule = DAYS_OF_WEEK.map(day => {
        const existing = daysMap.get(day);
        return existing || {
          day_of_week: day,
          start_time: doctor.schedule_start.substring(0, 5),
          end_time: doctor.schedule_end.substring(0, 5),
          is_available: day !== 'Saturday' && day !== 'Sunday'
        };
      });
      
      setSchedule(fullSchedule);
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
      await api.updateDoctorSchedule(doctor.id.toString(), schedule);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDaySchedule = (day: DoctorSchedule['day_of_week'], field: keyof DoctorSchedule, value: any) => {
    setSchedule(prev => prev.map(s => 
      s.day_of_week === day ? { ...s, [field]: value } : s
    ));
  };

  const toggleAllDays = (isAvailable: boolean) => {
    setSchedule(prev => prev.map(s => ({ ...s, is_available: isAvailable })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Schedule - {doctor.name}</DialogTitle>
          <DialogDescription>
            Set the weekly schedule and availability for {doctor.name}
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
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Set availability for each day of the week</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllDays(true)}
                  >
                    Set All Available
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllDays(false)}
                  >
                    Set All Unavailable
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {schedule.map((daySchedule) => (
                  <div
                    key={daySchedule.day_of_week}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={daySchedule.is_available}
                          onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'is_available', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <Label className="text-base font-medium text-gray-900">
                          {daySchedule.day_of_week}
                        </Label>
                      </div>
                    </div>

                    {daySchedule.is_available && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="space-y-2">
                          <Label htmlFor={`start-${daySchedule.day_of_week}`} className="text-xs">
                            Start Time
                          </Label>
                          <Input
                            id={`start-${daySchedule.day_of_week}`}
                            type="time"
                            value={daySchedule.start_time}
                            onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'start_time', e.target.value)}
                            required={daySchedule.is_available}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`end-${daySchedule.day_of_week}`} className="text-xs">
                            End Time
                          </Label>
                          <Input
                            id={`end-${daySchedule.day_of_week}`}
                            type="time"
                            value={daySchedule.end_time}
                            onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'end_time', e.target.value)}
                            required={daySchedule.is_available}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
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

