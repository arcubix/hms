import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Loader2, Search, UserPlus, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { api, Doctor, AvailableSlot, Patient, CreateAppointmentData, CreatePatientData } from '../../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

interface BookAppointmentPageProps {
  doctor: Doctor;
  slot: AvailableSlot;
  date: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export function BookAppointmentPage({ doctor, slot, date, onBack, onSuccess }: BookAppointmentPageProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'add'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // New patient form
  const [newPatientForm, setNewPatientForm] = useState<Partial<CreatePatientData>>({
    name: '',
    phone: '',
    age: 0,
    gender: 'Male',
    email: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Appointment form
  const [appointmentType, setAppointmentType] = useState<CreateAppointmentData['appointment_type']>('Consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Search patients
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await api.getPatients({ phone: searchQuery.trim() });
      setSearchResults(results);
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  // Create new patient
  const handleCreatePatient = async () => {
    if (!newPatientForm.name || !newPatientForm.phone || !newPatientForm.age) {
      setCreateError('Name, Phone, and Age are required');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const patient = await api.createPatient({
        name: newPatientForm.name,
        phone: newPatientForm.phone,
        age: newPatientForm.age,
        gender: newPatientForm.gender || 'Male',
        email: newPatientForm.email || undefined,
      });

      setSelectedPatient(patient);
      
      // Reset form
      setNewPatientForm({
        name: '',
        phone: '',
        age: 0,
        gender: 'Male',
        email: '',
      });
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create patient');
    } finally {
      setCreateLoading(false);
    }
  };

  // Create appointment
  const handleCreateAppointment = async () => {
    if (!selectedPatient) {
      setError('Please select or add a patient first');
      return;
    }

    if (!doctor || !doctor.id) {
      setError('Doctor information is missing');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const appointmentData: CreateAppointmentData = {
        patient_id: selectedPatient.id,
        doctor_doctor_id: doctor.id,
        appointment_date: slot.datetime,
        appointment_type: appointmentType,
        reason: reason || undefined,
        notes: notes || undefined,
        status: 'Scheduled',
      };

      // Validate that doctor_doctor_id is a valid number
      if (!appointmentData.doctor_doctor_id || isNaN(appointmentData.doctor_doctor_id)) {
        setError('Invalid doctor ID');
        setCreating(false);
        return;
      }

      console.log('Creating appointment with data:', appointmentData);
      await api.createAppointment(appointmentData);

      if (onSuccess) {
        onSuccess();
      } else {
        onBack();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment');
      console.error('Error creating appointment:', err);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Book Appointment</h1>
            <p className="text-muted-foreground">
              Select a patient and fill in appointment details
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Summary Card */}
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
                <div className="font-semibold text-gray-900">{doctor.name}</div>
                <div className="text-xs text-gray-500">{doctor.specialty}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Date</div>
                <div className="font-semibold text-gray-900">{formatDate(date)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 mt-0.5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-600">Time</div>
                <div className="font-semibold text-gray-900">{formatTime(slot.time)}</div>
                {slot.slot_name && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {slot.slot_name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Patient Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{selectedPatient.name}</div>
                    <div className="text-sm text-gray-600">
                      {selectedPatient.phone} • {selectedPatient.patient_id}
                    </div>
                    {selectedPatient.email && (
                      <div className="text-xs text-gray-500">{selectedPatient.email}</div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'add')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Search Patient
                </TabsTrigger>
                <TabsTrigger value="add">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Quick Patient
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-search">Search by Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone-search"
                      placeholder="Enter mobile number"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    <Button onClick={handleSearch} disabled={searchLoading}>
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <Label>Search Results</Label>
                    {searchResults.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.phone} • {patient.patient_id}
                        </div>
                        {patient.email && (
                          <div className="text-xs text-muted-foreground">{patient.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.trim() && !searchLoading && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No patients found with this mobile number</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="add" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter patient name"
                      value={newPatientForm.name || ''}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter mobile number"
                      value={newPatientForm.phone || ''}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={newPatientForm.age || ''}
                        onChange={(e) =>
                          setNewPatientForm({
                            ...newPatientForm,
                            age: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={newPatientForm.gender}
                        onValueChange={(value) =>
                          setNewPatientForm({ ...newPatientForm, gender: value as any })
                        }
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={newPatientForm.email || ''}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, email: e.target.value })
                      }
                    />
                  </div>

                  {createError && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {createError}
                    </div>
                  )}

                  <Button
                    onClick={handleCreatePatient}
                    disabled={createLoading}
                    className="w-full"
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Patient
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Appointment Form Section */}
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
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={onBack} disabled={creating} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleCreateAppointment}
                disabled={!selectedPatient || creating}
                className="flex-1"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Appointment...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

