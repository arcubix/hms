import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api, Doctor, CreateDoctorData } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface DoctorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor;
  onSuccess: () => void;
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

export function DoctorForm({ open, onOpenChange, doctor, onSuccess }: DoctorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty,
        phone: doctor.phone,
        email: doctor.email,
        experience: doctor.experience,
        qualification: doctor.qualification || '',
        status: doctor.status,
        schedule_start: doctor.schedule_start.substring(0, 5),
        schedule_end: doctor.schedule_end.substring(0, 5)
      });
    } else {
      setFormData({
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
    }
    setError(null);
  }, [doctor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (doctor) {
        await api.updateDoctor(doctor.id.toString(), formData);
      } else {
        await api.createDoctor(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save doctor');
      console.error('Error saving doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateDoctorData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Update doctor information below.' : 'Fill in the form below to add a new doctor to the system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="Dr. John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty *</Label>
              <select
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select specialty</option>
                {SPECIALTIES.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                placeholder="+1 234-567-8901"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="doctor@hospital.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => handleChange('experience', parseInt(e.target.value) || 0)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule_start">Schedule Start</Label>
              <Input
                id="schedule_start"
                type="time"
                value={formData.schedule_start}
                onChange={(e) => handleChange('schedule_start', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule_end">Schedule End</Label>
              <Input
                id="schedule_end"
                type="time"
                value={formData.schedule_end}
                onChange={(e) => handleChange('schedule_end', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) => handleChange('qualification', e.target.value)}
              placeholder="MD, PhD, Board Certified"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {doctor ? 'Update' : 'Create'} Doctor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

