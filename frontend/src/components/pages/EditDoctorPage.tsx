import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save, Clock, Copy } from 'lucide-react';
import { api, Doctor, CreateDoctorData, DoctorSchedule } from '../../services/api';

interface EditDoctorPageProps {
  doctorId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

const SPECIALTIES = [
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Oncology',
  'Gynecology',
  'Psychiatry',
  'General Medicine',
  'Emergency Medicine',
  'Radiology',
  'Anesthesiology',
  'Pathology',
  'Urology',
  'Ophthalmology',
  'ENT',
  'Pulmonology',
  'Gastroenterology',
  'Endocrinology',
  'Rheumatology'
];

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

export function EditDoctorPage({ doctorId, onBack, onSuccess }: EditDoctorPageProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<CreateDoctorData>({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    experience: 0,
    qualification: '',
    status: 'Available',
    schedule_start: '09:00',
    schedule_end: '17:00'
  });
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [error, setError] = useState('');
  const [copyFromDay, setCopyFromDay] = useState<string | null>(null);

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      setLoadingDoctor(true);
      setLoadingSchedule(true);
      const data = await api.getDoctor(doctorId);
      setDoctor(data);
      setFormData({
        name: data.name || '',
        specialty: data.specialty || '',
        phone: data.phone || '',
        email: data.email || '',
        experience: data.experience || 0,
        qualification: data.qualification || '',
        status: data.status || 'Available',
        schedule_start: data.schedule_start ? data.schedule_start.substring(0, 5) : '09:00',
        schedule_end: data.schedule_end ? data.schedule_end.substring(0, 5) : '17:00'
      });

      // Load schedule
      try {
        const scheduleData = await api.getDoctorSchedule(doctorId);
        const daysMap = new Map(scheduleData.map(s => [s.day_of_week, s]));
        const defaultStart = data.schedule_start ? data.schedule_start.substring(0, 5) : '09:00';
        const defaultEnd = data.schedule_end ? data.schedule_end.substring(0, 5) : '17:00';
        
        const fullSchedule = DAYS_OF_WEEK.map(day => {
          const existing = daysMap.get(day);
          if (existing) {
            // Format existing schedule entry - ensure is_available is boolean and times are formatted
            return {
              ...existing,
              start_time: existing.start_time ? existing.start_time.substring(0, 5) : defaultStart,
              end_time: existing.end_time ? existing.end_time.substring(0, 5) : defaultEnd,
              break_start: existing.break_start ? existing.break_start.substring(0, 5) : '',
              break_end: existing.break_end ? existing.break_end.substring(0, 5) : '',
              is_available: existing.is_available === true || existing.is_available === 1 || String(existing.is_available) === '1'
            };
          } else {
            // No existing entry for this day
            return {
              day_of_week: day,
              start_time: defaultStart,
              end_time: defaultEnd,
              break_start: '',
              break_end: '',
              max_appointments: null,
              appointment_duration: 30,
              notes: '',
              is_available: false
            };
          }
        });
        setSchedule(fullSchedule);
      } catch (scheduleErr) {
        // If schedule doesn't exist, create default
        const defaultStart = data.schedule_start ? data.schedule_start.substring(0, 5) : '09:00';
        const defaultEnd = data.schedule_end ? data.schedule_end.substring(0, 5) : '17:00';
        setSchedule(DAYS_OF_WEEK.map(day => ({
          day_of_week: day,
          start_time: defaultStart,
          end_time: defaultEnd,
          is_available: WEEKDAYS.includes(day)
        })));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor');
    } finally {
      setLoadingDoctor(false);
      setLoadingSchedule(false);
    }
  };

  const updateDaySchedule = (day: DoctorSchedule['day_of_week'], field: keyof DoctorSchedule, value: any) => {
    setSchedule(prev => prev.map(s => 
      s.day_of_week === day ? { ...s, [field]: value } : s
    ));
  };

  const applyDefaultSchedule = () => {
    setSchedule(DAYS_OF_WEEK.map(day => ({
      day_of_week: day,
      start_time: formData.schedule_start || '09:00',
      end_time: formData.schedule_end || '17:00',
      is_available: WEEKDAYS.includes(day)
    })));
  };

  const copyDaySchedule = (fromDay: string, toDays: string[]) => {
    const sourceDay = schedule.find(s => s.day_of_week === fromDay);
    if (!sourceDay) return;
    
    setSchedule(prev => prev.map(s => {
      if (toDays.includes(s.day_of_week)) {
        return {
          ...s,
          start_time: sourceDay.start_time,
          end_time: sourceDay.end_time,
          is_available: sourceDay.is_available
        };
      }
      return s;
    }));
    setCopyFromDay(null);
  };

  const handleCopyClick = (day: string) => {
    if (copyFromDay === day) {
      setCopyFromDay(null);
    } else if (copyFromDay) {
      copyDaySchedule(copyFromDay, [day]);
    } else {
      setCopyFromDay(day);
    }
  };

  const copyToAllWeekdays = (fromDay: string) => {
    copyDaySchedule(fromDay, WEEKDAYS);
  };

  const toggleAllDays = (isAvailable: boolean) => {
    setSchedule(prev => prev.map(s => ({ ...s, is_available: isAvailable })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format schedule data for backend - ensure times are in HH:MM format and remove extra fields
      const formattedSchedule = schedule.map(s => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time.length === 5 ? s.start_time : s.start_time.substring(0, 5),
        end_time: s.end_time.length === 5 ? s.end_time : s.end_time.substring(0, 5),
        is_available: s.is_available || false
      }));

      // Update doctor with schedule data
      // Backend will automatically update the schedule
      const doctorData: any = {
        ...formData,
        schedule: formattedSchedule
      };
      
      await api.updateDoctor(doctorId, doctorData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">Loading doctor data...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          Doctor not found
        </div>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Doctor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information - {doctor.doctor_id}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="+1 234-567-8901"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="doctor@hospital.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience || ''}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    disabled={loading}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'Available' | 'Busy' | 'Off Duty') =>
                      setFormData({ ...formData, status: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                      <SelectItem value="Off Duty">Off Duty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    disabled={loading}
                    placeholder="MD, PhD, Board Certified"
                  />
                </div>
              </div>
            </div>

            {/* Default Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Default Schedule Times</h3>
              <p className="text-sm text-gray-600">Set default times that will be used when creating the detailed schedule below.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule_start">Default Start Time</Label>
                  <Input
                    id="schedule_start"
                    type="time"
                    value={formData.schedule_start}
                    onChange={(e) => {
                      setFormData({ ...formData, schedule_start: e.target.value });
                      // Update all available days with new default time
                      setSchedule(prev => prev.map(s => 
                        s.is_available ? { ...s, start_time: e.target.value } : s
                      ));
                    }}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="schedule_end">Default End Time</Label>
                  <Input
                    id="schedule_end"
                    type="time"
                    value={formData.schedule_end}
                    onChange={(e) => {
                      setFormData({ ...formData, schedule_end: e.target.value });
                      // Update all available days with new default time
                      setSchedule(prev => prev.map(s => 
                        s.is_available ? { ...s, end_time: e.target.value } : s
                      ));
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyDefaultSchedule}
                disabled={loading}
              >
                Apply Default Times to All Days
              </Button>
            </div>

            {/* Detailed Weekly Schedule */}
            {loadingSchedule ? (
              <div className="text-center py-4 text-gray-500">Loading schedule...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Detailed Weekly Schedule</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllDays(true)}
                      disabled={loading}
                    >
                      Set All Available
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllDays(false)}
                      disabled={loading}
                    >
                      Set All Unavailable
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Configure availability and times for each day of the week. You can set different times for each day.
                </p>

                {copyFromDay && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Click on a day to copy schedule from <strong>{copyFromDay}</strong>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCopyFromDay(null)}
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {schedule.map((daySchedule) => (
                    <div
                      key={daySchedule.day_of_week}
                      className={`p-4 border rounded-lg transition-colors ${
                        daySchedule.is_available 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      } ${copyFromDay === daySchedule.day_of_week ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={daySchedule.is_available}
                            onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'is_available', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            disabled={loading}
                          />
                          <Label className="text-base font-medium text-gray-900">
                            {daySchedule.day_of_week}
                          </Label>
                          {daySchedule.is_available && (
                            <span className="text-xs text-green-600 font-medium">Available</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyClick(daySchedule.day_of_week)}
                            className={copyFromDay === daySchedule.day_of_week ? 'bg-blue-100' : ''}
                            title={copyFromDay === daySchedule.day_of_week ? 'Click another day to copy' : 'Copy this day'}
                            disabled={loading}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {daySchedule.is_available && WEEKDAYS.includes(daySchedule.day_of_week) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToAllWeekdays(daySchedule.day_of_week)}
                              title="Copy to all weekdays"
                              disabled={loading}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              All Weekdays
                            </Button>
                          )}
                        </div>
                      </div>

                      {daySchedule.is_available && (
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="space-y-2">
                            <Label htmlFor={`start-${daySchedule.day_of_week}`} className="text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Start Time
                            </Label>
                            <Input
                              id={`start-${daySchedule.day_of_week}`}
                              type="time"
                              value={daySchedule.start_time}
                              onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'start_time', e.target.value)}
                              required={daySchedule.is_available}
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-${daySchedule.day_of_week}`} className="text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              End Time
                            </Label>
                            <Input
                              id={`end-${daySchedule.day_of_week}`}
                              type="time"
                              value={daySchedule.end_time}
                              onChange={(e) => updateDaySchedule(daySchedule.day_of_week, 'end_time', e.target.value)}
                              required={daySchedule.is_available}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Doctor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
