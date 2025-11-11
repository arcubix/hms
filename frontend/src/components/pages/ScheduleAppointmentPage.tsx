import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api, Doctor, AvailableSlot, Appointment } from '../../services/api';
import { BookingCalendar } from '../modules/BookingCalendar';
import { BookAppointmentPage } from './BookAppointmentPage';

interface ScheduleAppointmentPageProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function ScheduleAppointmentPage({ onBack, onSuccess }: ScheduleAppointmentPageProps) {
  const [view, setView] = useState<'schedule' | 'book'>('schedule');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Load appointments when doctor or date changes
  useEffect(() => {
    if (selectedDoctor) {
      loadAppointments();
    } else {
      setAppointments([]);
    }
  }, [selectedDoctor, currentDate]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async () => {
    if (!selectedDoctor) return;

    try {
      setLoadingDates(true);
      const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const data = await api.getDoctorAvailableDates(selectedDoctor.id.toString(), monthStr);
      setAvailableDates(data.available_dates || []);
    } catch (err: any) {
      console.error('Error loading available dates:', err);
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
    }
  };

  const loadAppointments = async () => {
    if (!selectedDoctor) return;

    try {
      setLoadingSlots(true);
      
      // Get start and end of week (Sunday to Saturday)
      const weekStart = new Date(currentDate);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day;
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Load appointments for the week
      const weekAppointments = await api.getAppointments({
        doctor_id: selectedDoctor.id,
        date_from: weekStart.toISOString().split('T')[0],
        date_to: weekEnd.toISOString().split('T')[0],
      });
      
      setAppointments(weekAppointments);
    } catch (err: any) {
      console.error('Error loading appointments:', err);
      setAppointments([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id.toString() === doctorId);
    setSelectedDoctor(doctor || null);
    setSelectedSlot(null);
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    if (!slot.is_available || !selectedDoctor) return;
    setSelectedSlot(slot);
    setView('book');
  };

  const handleBackToSchedule = () => {
    setView('schedule');
    setSelectedSlot(null);
  };

  const handleBookingSuccess = async () => {
    // Refresh appointments
    if (selectedDoctor) {
      await loadAppointments();
    }
    
    // Go back to schedule view
    setView('schedule');
    setSelectedSlot(null);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  // If booking view, show the booking page
  if (view === 'book' && selectedDoctor && selectedSlot) {
    return (
      <BookAppointmentPage
        doctor={selectedDoctor}
        slot={selectedSlot}
        date={selectedSlot.datetime.split(' ')[0]}
        onBack={handleBackToSchedule}
        onSuccess={handleBookingSuccess}
      />
    );
  }

  // Otherwise show the schedule view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Schedule Appointment</h1>
            <p className="text-muted-foreground">
              Select a doctor, date, and time slot to schedule an appointment
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Doctor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={selectedDoctor?.id.toString() || ''}
              onValueChange={handleDoctorChange}
              disabled={loading}
            >
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedDoctor && (
        <BookingCalendar
          doctor={selectedDoctor}
          appointments={appointments}
          onSlotSelect={handleSlotSelect}
          onAppointmentClick={(apt) => {
            // Handle appointment click - could open a view/edit dialog
            console.log('Appointment clicked:', apt);
          }}
          selectedDate={currentDate}
          onDateChange={handleDateChange}
          loading={loadingSlots}
        />
      )}
    </div>
  );
}

