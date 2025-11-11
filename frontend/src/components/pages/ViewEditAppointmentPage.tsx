import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Loader2, Calendar, Clock, User, Stethoscope, Save } from 'lucide-react';
import { api, Appointment, Doctor, Patient, CreateAppointmentData } from '../../services/api';
import { Badge } from '../ui/badge';

interface ViewEditAppointmentPageProps {
  appointmentId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export function ViewEditAppointmentPage({ appointmentId, onBack, onSuccess }: ViewEditAppointmentPageProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [appointmentType, setAppointmentType] = useState<CreateAppointmentData['appointment_type']>('Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Appointment['status']>('Scheduled');

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAppointment(appointmentId);
      setAppointment(data);
      
      // Set form values
      setAppointmentType(data.appointment_type);
      setReason(data.reason || '');
      setNotes(data.notes || '');
      setStatus(data.status);

      // Load doctor if available
      if (data.doctor_doctor_id) {
        try {
          const doctorData = await api.getDoctor(data.doctor_doctor_id.toString());
          setDoctor(doctorData);
        } catch (err) {
          console.error('Error loading doctor:', err);
        }
      }

      // Load patient
      try {
        const patientData = await api.getPatient(data.patient_id.toString());
        setPatient(patientData);
      } catch (err) {
        console.error('Error loading patient:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment');
      console.error('Error loading appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!appointment) return;

    try {
      setSaving(true);
      setError('');

      const updateData: Partial<CreateAppointmentData> = {
        appointment_type: appointmentType,
        reason: reason || undefined,
        notes: notes || undefined,
        status: status,
      };

      await api.updateAppointment(appointmentId, updateData);

      setIsEditing(false);
      await loadAppointment(); // Reload to get updated data

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment');
      console.error('Error updating appointment:', err);
    } finally {
      setSaving(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No Show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (!appointment) {
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
            <p className="text-muted-foreground">{error || 'Appointment not found'}</p>
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
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Appointment' : 'View Appointment'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update appointment details' : 'View appointment information'}
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Appointment
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Appointment Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Stethoscope className="h-5 w-5 mt-0.5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Doctor</div>
                <div className="font-semibold text-gray-900">
                  {appointment.doctor_name || 'Unknown Doctor'}
                </div>
                {appointment.specialty && (
                  <div className="text-xs text-gray-500">{appointment.specialty}</div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(appointment.appointment_date)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 mt-0.5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Time</div>
                <div className="font-semibold text-gray-900">
                  {formatTime(appointment.appointment_date)}
                </div>
                {appointment.appointment_number && (
                  <div className="text-xs text-gray-500 mt-1">
                    #{appointment.appointment_number}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-500">Patient Name</Label>
              <p className="font-medium">{appointment.patient_name || `Patient #${appointment.patient_id}`}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Patient ID</Label>
                <p className="text-sm">{appointment.patient_id_string || `P${appointment.patient_id}`}</p>
              </div>
              {appointment.patient_phone && (
                <div>
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <p className="text-sm">{appointment.patient_phone}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select value={status} onValueChange={(value) => setStatus(value as Appointment['status'])}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(status)}>{status}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-type">Appointment Type</Label>
              {isEditing ? (
                <Select
                  value={appointmentType}
                  onValueChange={(value) => setAppointmentType(value as any)}
                >
                  <SelectTrigger id="appointment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Check-up">Check-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p>{appointment.appointment_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              {isEditing ? (
                <Input
                  id="reason"
                  placeholder="Enter reason for visit"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600">{appointment.reason || 'No reason provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {appointment.notes || 'No notes'}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

