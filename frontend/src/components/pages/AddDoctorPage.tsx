import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { api, CreateDoctorData, DoctorSchedule } from '../../services/api';
import { DoctorScheduleContent } from '../modules/DoctorScheduleContent';

interface AddDoctorPageProps {
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

export function AddDoctorPage({ onBack, onSuccess }: AddDoctorPageProps) {
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
  const [error, setError] = useState('');

  const applyDefaultSchedule = () => {
    setSchedule(prev => prev.map(s => ({
      ...s,
      start_time: formData.schedule_start,
      end_time: formData.schedule_end
    })));
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

      // Create doctor with schedule data
      // Backend will automatically create the schedule
      const doctorData: any = {
        ...formData,
        schedule: formattedSchedule
      };
      
      await api.createDoctor(doctorData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add New Doctor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Detailed Weekly Schedule</h3>
              <p className="text-sm text-gray-600">
                Configure multiple time slots per day. You can add morning, afternoon, evening slots as needed.
              </p>
              <DoctorScheduleContent
                schedule={schedule}
                setSchedule={setSchedule}
                defaultStartTime={formData.schedule_start}
                defaultEndTime={formData.schedule_end}
                loading={loading}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Doctor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
