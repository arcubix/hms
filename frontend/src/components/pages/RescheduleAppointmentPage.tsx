import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Clock, User, Stethoscope } from 'lucide-react';
import { api, Appointment, Doctor, AvailableSlot } from '../../services/api';
import { BookingCalendar } from '../modules/BookingCalendar';
import { Badge } from '../ui/badge';

interface RescheduleAppointmentPageProps {
  appointmentId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export function RescheduleAppointmentPage({ appointmentId, onBack, onSuccess }: RescheduleAppointmentPageProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAppointment(appointmentId);
      setAppointment(data);

      // Load doctor
      if (data.doctor_doctor_id) {
        try {
          const doctorData = await api.getDoctor(data.doctor_doctor_id.toString());
          setDoctor(doctorData);
          
          // Set current date to appointment date
          const appointmentDate = new Date(data.appointment_date);
          setCurrentDate(appointmentDate);
        } catch (err) {
          console.error('Error loading doctor:', err);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment');
      console.error('Error loading appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    if (!slot.is_available) return;
    setSelectedSlot(slot);
  };

  const handleReschedule = async () => {
    if (!appointment || !selectedSlot) {
      setError('Please select a new time slot');
      return;
    }

    try {
      setRescheduling(true);
      setError('');

      await api.updateAppointment(appointmentId, {
        appointment_date: selectedSlot.datetime,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule appointment');
      console.error('Error rescheduling appointment:', err);
    } finally {
      setRescheduling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Loading Appointment...</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading appointment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment || !doctor) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Appointment Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{error || 'Appointment or doctor information not found'}</p>
            <Button onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reschedule Appointment</h1>
            <p className="text-muted-foreground">
              Select a new date and time slot for this appointment
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

      {/* Current Appointment Summary */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg">Current Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 mt-0.5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Patient</div>
                <div className="font-semibold text-gray-900">
                  {appointment.patient_name || `Patient #${appointment.patient_id}`}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Stethoscope className="h-5 w-5 mt-0.5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Doctor</div>
                <div className="font-semibold text-gray-900">{doctor.name}</div>
                <div className="text-xs text-gray-500">{doctor.specialty}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 mt-0.5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Current Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(appointment.appointment_date)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 mt-0.5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Current Time</div>
                <div className="font-semibold text-gray-900">
                  {formatTime(appointment.appointment_date)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Slot Selection */}
      {selectedSlot && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">New Appointment Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 mt-0.5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-600">New Date</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(selectedSlot.datetime)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-600">New Time</div>
                  <div className="font-semibold text-gray-900">
                    {formatTime(selectedSlot.datetime)}
                  </div>
                  {selectedSlot.slot_name && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {selectedSlot.slot_name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Calendar */}
      <BookingCalendar
        doctor={doctor}
        appointments={[]}
        onSlotSelect={handleSlotSelect}
        selectedDate={currentDate}
        onDateChange={setCurrentDate}
        loading={false}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} disabled={rescheduling} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleReschedule}
          disabled={!selectedSlot || rescheduling}
          className="flex-1"
        >
          {rescheduling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rescheduling...
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Confirm Reschedule
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

