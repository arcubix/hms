import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Patient, Doctor, AvailableSlot, CreateAppointmentData } from '../../services/api';
import { Calendar, Clock, User, Stethoscope } from 'lucide-react';

interface AppointmentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  doctor: Doctor;
  slot: AvailableSlot;
  date: string;
  onConfirm: (data: CreateAppointmentData) => void;
  loading?: boolean;
}

export function AppointmentConfirmationDialog({
  open,
  onOpenChange,
  patient,
  doctor,
  slot,
  date,
  onConfirm,
  loading = false,
}: AppointmentConfirmationDialogProps) {
  const [appointmentType, setAppointmentType] = useState<CreateAppointmentData['appointment_type']>('Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleConfirm = () => {
    const appointmentData: CreateAppointmentData = {
      patient_id: patient.id,
      doctor_doctor_id: doctor.id,
      appointment_date: slot.datetime,
      appointment_type: appointmentType,
      reason: reason || undefined,
      notes: notes || undefined,
      status: 'Scheduled',
    };

    onConfirm(appointmentData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Review the appointment details and fill in additional information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Summary */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Patient</div>
                <div className="text-sm text-muted-foreground">
                  {patient.name} ({patient.patient_id})
                </div>
                <div className="text-xs text-muted-foreground">{patient.phone}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Stethoscope className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Doctor</div>
                <div className="text-sm text-muted-foreground">
                  {doctor.name} - {doctor.specialty}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div className="text-sm text-muted-foreground">{formatDate(date)}</div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {formatTime(slot.time)}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-type">Appointment Type *</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input
                id="reason"
                placeholder="Enter reason for visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Creating...' : 'Confirm Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

