import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Loader2, Search, User, Calendar, Clock, MapPin, Printer, CheckCircle2, X } from 'lucide-react';
import { api, Patient, Doctor, Appointment, RoomMode, DoctorSchedule, CreateAppointmentData } from '../../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReceptionTokenCreationProps {
  onSuccess?: () => void;
}

export function ReceptionTokenCreation({ onSuccess }: ReceptionTokenCreationProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomMode, setRoomMode] = useState<'Fixed' | 'Dynamic'>('Fixed');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [doctorRoom, setDoctorRoom] = useState<any>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [reason, setReason] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [createdToken, setCreatedToken] = useState<any>(null);

  useEffect(() => {
    loadRoomMode();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      if (roomMode === 'Fixed') {
        loadDoctorRoom();
      } else {
        loadDoctorSchedules();
      }
    }
  }, [selectedDoctor, roomMode]);

  useEffect(() => {
    if (selectedDoctor && appointmentDate && roomMode === 'Dynamic') {
      loadAvailableSlots();
    }
  }, [selectedDoctor, appointmentDate, roomMode]);

  useEffect(() => {
    if (patientSearch.length >= 2) {
      const timer = setTimeout(() => {
        searchPatients();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPatients([]);
    }
  }, [patientSearch]);

  const loadRoomMode = async () => {
    try {
      const modeData = await api.getRoomMode();
      setRoomMode(modeData.mode);
    } catch (error: any) {
      console.error('Error loading room mode:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadDoctorRoom = async () => {
    if (!selectedDoctor) return;
    
    try {
      const room = await api.getDoctorRoom(selectedDoctor);
      setDoctorRoom(room);
    } catch (error: any) {
      console.error('Error loading doctor room:', error);
      setDoctorRoom(null);
    }
  };

  const loadDoctorSchedules = async () => {
    if (!selectedDoctor) return;
    
    try {
      const doctor = await api.getDoctor(selectedDoctor);
      if (doctor && doctor.schedule) {
        setDoctorSchedules(doctor.schedule);
      } else {
        setDoctorSchedules([]);
      }
    } catch (error: any) {
      console.error('Error loading doctor schedules:', error);
      setDoctorSchedules([]);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !appointmentDate) return;
    
    try {
      const slots = await api.getAvailableSlots(selectedDoctor, appointmentDate);
      setAvailableSlots(slots);
    } catch (error: any) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    }
  };

  const searchPatients = async () => {
    try {
      setLoading(true);
      const results = await api.getPatients({ search: patientSearch });
      setPatients(results);
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    setAppointmentTime(slot.time);
  };

  const handleCreateToken = async () => {
    if (!selectedPatient || !selectedDoctor) {
      toast.error('Please select patient and doctor');
      return;
    }

    if (roomMode === 'Dynamic' && !selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error('Please select appointment date and time');
      return;
    }

    try {
      setSaving(true);
      
      const appointmentDateTime = `${appointmentDate} ${appointmentTime}:00`;
      
      const appointmentData: CreateAppointmentData = {
        patient_id: selectedPatient.id,
        doctor_doctor_id: selectedDoctor,
        appointment_date: appointmentDateTime,
        appointment_type: appointmentType as any,
        reason: reason || undefined,
        status: 'Scheduled'
      };

      if (roomMode === 'Dynamic' && selectedSlot) {
        // Find the schedule_id for the selected slot
        const schedule = doctorSchedules.find(s => {
          const slotTime = appointmentTime;
          const scheduleStart = s.start_time?.substring(0, 5);
          const scheduleEnd = s.end_time?.substring(0, 5);
          return slotTime >= scheduleStart && slotTime < scheduleEnd;
        });
        
        if (schedule && schedule.id) {
          (appointmentData as any).schedule_id = schedule.id;
        }
      }

      const appointment = await api.createAppointment(appointmentData);
      
      if (appointment.token_number) {
        setCreatedToken({
          token_number: appointment.token_number,
          room_number: appointment.room_number,
          room_name: appointment.room_name,
          floor_number: appointment.floor_number,
          reception_name: appointment.reception_name,
          patient_name: selectedPatient.name,
          doctor_name: doctors.find(d => d.id === selectedDoctor)?.name,
          appointment_date: appointmentDateTime
        });
        setShowPreview(true);
        toast.success('Token created successfully');
        onSuccess?.();
      } else {
        toast.error('Token creation failed');
      }
    } catch (error: any) {
      console.error('Error creating token:', error);
      toast.error(error.message || 'Failed to create token');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setPatientSearch('');
    setAppointmentDate(format(new Date(), 'yyyy-MM-dd'));
    setAppointmentTime('');
    setSelectedSlot(null);
    setReason('');
    setShowPreview(false);
    setCreatedToken(null);
    setDoctorRoom(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Token</h2>
        <p className="text-sm text-gray-600 mt-1">
          {roomMode === 'Fixed' 
            ? 'Select patient and doctor to create a token (room auto-assigned)'
            : 'Select patient, doctor, and time slot to create a token'}
        </p>
      </div>

      {showPreview && createdToken ? (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Token Created Successfully</span>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-4xl font-bold text-blue-700 mb-2">
                {createdToken.token_number}
              </div>
              <div className="text-sm text-blue-600">Token Number</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Patient</Label>
                <div className="font-medium">{createdToken.patient_name}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Doctor</Label>
                <div className="font-medium">{createdToken.doctor_name}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Room</Label>
                <div className="font-medium">{createdToken.room_number} - {createdToken.room_name}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Floor</Label>
                <div className="font-medium">Floor {createdToken.floor_number}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Reception</Label>
                <div className="font-medium">{createdToken.reception_name}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Appointment Time</Label>
                <div className="font-medium">{format(new Date(createdToken.appointment_date), 'MMM dd, yyyy hh:mm a')}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print Token
              </Button>
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Patient Search */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search patient by name or MR#..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              )}

              {!selectedPatient && patients.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {patients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientSearch('');
                        setPatients([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 flex items-center gap-3"
                    >
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">MR# {patient.patient_id || patient.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{selectedPatient.name}</div>
                      <div className="text-sm text-gray-600">MR# {selectedPatient.patient_id || selectedPatient.id}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Doctor *</Label>
                <Select
                  value={selectedDoctor?.toString() || ''}
                  onValueChange={(value) => setSelectedDoctor(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {roomMode === 'Fixed' && selectedDoctor && doctorRoom && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <MapPin className="w-4 h-4" />
                    Room Assignment
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Room:</span> {doctorRoom.room_number} - {doctorRoom.room_name}
                    </div>
                    <div>
                      <span className="text-gray-600">Floor:</span> Floor {doctorRoom.floor_number}
                    </div>
                    <div>
                      <span className="text-gray-600">Reception:</span> {doctorRoom.reception_name}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Appointment Date *</Label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>

                {roomMode === 'Fixed' ? (
                  <div className="space-y-2">
                    <Label>Appointment Time *</Label>
                    <Input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Time Slot *</Label>
                    {availableSlots.length > 0 ? (
                      <Select
                        value={selectedSlot?.time || ''}
                        onValueChange={(value) => {
                          const slot = availableSlots.find(s => s.time === value);
                          handleSlotSelect(slot);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map(slot => (
                            <SelectItem 
                              key={slot.time} 
                              value={slot.time}
                              disabled={!slot.is_available}
                            >
                              {slot.time} {slot.is_available ? '' : '(Full)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-gray-500">No available slots for selected date</div>
                    )}
                  </div>
                )}
              </div>

              {roomMode === 'Dynamic' && selectedSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <MapPin className="w-4 h-4" />
                    Slot Room Assignment
                  </div>
                  <div className="text-sm text-gray-600">
                    Room information will be displayed after slot selection
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Check-up">Check-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Input
                  placeholder="Enter reason for visit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleCreateToken}
              disabled={saving || !selectedPatient || !selectedDoctor || !appointmentDate || !appointmentTime}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Token...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Token
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

