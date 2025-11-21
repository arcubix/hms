import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Clock,
  Monitor,
  Calendar as CalendarIcon,
  Search,
  Filter,
  MoreVertical,
  User,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ChevronUp,
  ChevronDown,
  X,
  Printer,
  Globe,
  Mail,
  Loader2
} from 'lucide-react';
import { api, Doctor as ApiDoctor, Appointment as ApiAppointment, Patient } from '../../services/api';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  tokenNumber: string;
  time: string;
  timeSlot: number;
  doctorId: string;
  status: 'scheduled' | 'checked' | 'cancelled' | 'waiting';
  phoneNumber?: string;
  reason?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  appointmentCount: number;
  color: string;
}

export function OPDSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [showTokenQueue, setShowTokenQueue] = useState(false);
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);
  
  // Add Token Dialog States
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{name: string; id: string} | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentDoctor, setAppointmentDoctor] = useState('');
  const [checkupType, setCheckupType] = useState('regular');
  const [comment, setComment] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(true);
  
  // Add Patient Dialog States
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [mrNumber, setMrNumber] = useState('100005');
  const [patientName, setPatientName] = useState('');
  const [country, setCountry] = useState('Pakistan +92');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [ageDays, setAgeDays] = useState('');
  const [registrationDate, setRegistrationDate] = useState('11-11-2025');
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(true);
  
  // Real data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  
  // Patient search results
  const searchResults = patientSearchResults.map(p => ({
    name: p.name,
    id: p.patient_id || p.id.toString()
  }));

  // Time slots (hourly from 9 AM to 5 PM)
  const timeSlots = [
    { slot: 1, time: '09:00 AM', label: '9 AM', hour: 9 },
    { slot: 2, time: '10:00 AM', label: '10 AM', hour: 10 },
    { slot: 3, time: '11:00 AM', label: '11 AM', hour: 11 },
    { slot: 4, time: '12:00 PM', label: '12 PM', hour: 12 },
    { slot: 5, time: '01:00 PM', label: '1 PM', hour: 13 },
    { slot: 6, time: '02:00 PM', label: '2 PM', hour: 14 },
    { slot: 7, time: '03:00 PM', label: '3 PM', hour: 15 },
    { slot: 8, time: '04:00 PM', label: '4 PM', hour: 16 },
    { slot: 9, time: '05:00 PM', label: '5 PM', hour: 17 }
  ];

  // Map API appointment status to OPDSchedule status
  const mapAppointmentStatus = (status: string): 'scheduled' | 'checked' | 'cancelled' | 'waiting' => {
    switch (status) {
      case 'Completed':
        return 'checked';
      case 'Cancelled':
        return 'cancelled';
      case 'In Progress':
      case 'Confirmed':
        return 'waiting';
      case 'Scheduled':
      default:
        return 'scheduled';
    }
  };

  // Get time slot from appointment time
  const getTimeSlotFromTime = (appointmentTime: string): number => {
    const date = new Date(appointmentTime);
    const hour = date.getHours();
    const slot = timeSlots.find(ts => ts.hour === hour);
    return slot ? slot.slot : 1;
  };

  // Format time from datetime string
  const formatTime = (datetime: string): string => {
    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minutesStr} ${ampm}`;
  };

  // Load doctors from API
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        // Get all doctors without status filter (status values are: 'Available', 'Busy', 'Off Duty')
        const apiDoctors = await api.getDoctors();
        
        // Map API doctors to OPDSchedule format
        const colors = ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'indigo'];
        const mappedDoctors: Doctor[] = apiDoctors.map((doc, index) => ({
          id: doc.id.toString(),
          name: doc.name || 'Unknown',
          specialization: doc.specialty || 'General',
          appointmentCount: 0, // Will be updated when appointments load
          color: colors[index % colors.length]
        }));
        
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  // Load appointments for selected date
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const apiAppointments = await api.getAppointments({
          date: dateStr
        });

        // Map API appointments to OPDSchedule format
        const mappedAppointments: Appointment[] = apiAppointments.map((apt, index) => {
          const timeSlot = getTimeSlotFromTime(apt.appointment_date);
          return {
            id: apt.id.toString(),
            patientName: apt.patient_name || 'Unknown',
            patientId: apt.patient_id_string || apt.patient_id.toString(),
            tokenNumber: apt.appointment_number || String(index + 1).padStart(3, '0'),
            time: formatTime(apt.appointment_date),
            timeSlot: timeSlot,
            doctorId: apt.doctor_doctor_id?.toString() || '',
            status: mapAppointmentStatus(apt.status),
            phoneNumber: apt.patient_phone,
            reason: apt.reason
          };
        });

        setAppointments(mappedAppointments);

        // Update appointment counts for doctors
        setDoctors(prevDoctors => 
          prevDoctors.map(doc => ({
            ...doc,
            appointmentCount: mappedAppointments.filter(apt => apt.doctorId === doc.id).length
          }))
        );
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [selectedDate]);

  // Search patients when patientSearch changes
  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearch.length < 2) {
        setPatientSearchResults([]);
        return;
      }

      try {
        setSearchingPatients(true);
        const results = await api.getPatients({ search: patientSearch });
        setPatientSearchResults(results);
      } catch (error) {
        console.error('Error searching patients:', error);
        setPatientSearchResults([]);
      } finally {
        setSearchingPatients(false);
      }
    };

    const timer = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  const filteredDoctors = selectedDoctor === 'all' 
    ? doctors 
    : doctors.filter(d => d.id === selectedDoctor);

  const getAppointmentForSlot = (doctorId: string, timeSlot: number) => {
    return appointments.find(apt => apt.doctorId === doctorId && apt.timeSlot === timeSlot);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      checked: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      waiting: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      scheduled: <Clock className="w-3 h-3" />,
      checked: <CheckCircle2 className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      waiting: <AlertCircle className="w-3 h-3" />
    };
    return icons[status];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Calendar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="border rounded-lg">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md"
          />
        </div>

        {/* Token Queue Display */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <button
              onClick={() => setShowTokenQueue(!showTokenQueue)}
              className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" />
                <span className="font-medium">Token Queue Display</span>
              </div>
              <Badge className="bg-blue-600 text-white">
                {appointments.filter(a => a.status === 'waiting').length}
              </Badge>
            </button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-900">Total Appointments</span>
              </div>
              <span className="text-lg font-medium text-blue-900">{appointments.length}</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-900">Checked</span>
              </div>
              <span className="text-lg font-medium text-green-900">
                {appointments.filter(a => a.status === 'checked').length}
              </span>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-900">Waiting</span>
              </div>
              <span className="text-lg font-medium text-orange-900">
                {appointments.filter(a => a.status === 'waiting').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Schedule Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Doctor Filter */}
            <div className="flex items-center gap-3">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Doctors (Token)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors (Token)</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Dialog open={isCreateAppointmentOpen} onOpenChange={setIsCreateAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Token
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !z-[10000] [&>div]:!z-[10000]">
                  <DialogHeader className="border-b border-gray-200 pb-4">
                    <DialogTitle className="text-2xl text-gray-900">Create Token</DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm mt-1">
                      Search for an existing patient or add a new one to create a token
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-6">
                    {/* Patient Search Section */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Search Patient</Label>
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              value={patientSearch}
                              onChange={(e) => setPatientSearch(e.target.value)}
                              placeholder="Search by name or MR#..."
                              className="pl-12 h-14 border-gray-300 rounded-xl shadow-sm text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <Button
                            onClick={() => setIsAddPatientOpen(true)}
                            className="h-14 px-6 bg-green-600 hover:bg-green-700 rounded-xl shadow-sm whitespace-nowrap"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Patient
                          </Button>
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {patientSearch && !selectedPatient && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto">
                            {searchingPatients ? (
                              <div className="px-5 py-4 flex items-center justify-center gap-2 text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Searching...</span>
                              </div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map((patient) => (
                                <button
                                  key={patient.id}
                                  onClick={() => {
                                    setSelectedPatient(patient);
                                    setPatientSearch('');
                                  }}
                                  className="w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{patient.name}</div>
                                    <div className="text-sm text-gray-500">MR# {patient.id}</div>
                                  </div>
                                </button>
                              ))
                            ) : patientSearch.length >= 2 ? (
                              <div className="px-5 py-4 text-sm text-gray-500 text-center">
                                No patients found
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Patient Card */}
                    {selectedPatient && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-gray-900">{selectedPatient.name}</span>
                              <Badge className="bg-blue-600 text-white">Selected</Badge>
                            </div>
                            <span className="text-sm text-gray-600">MR# {selectedPatient.id}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="w-8 h-8 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    )}

                    {/* Appointment Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Appointment Details</h3>
                      
                      {/* Date and Token Row */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Date Field */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Appointment Date</Label>
                          <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                            <input
                              type="date"
                              value={appointmentDate.toISOString().split('T')[0]}
                              onChange={(e) => setAppointmentDate(new Date(e.target.value))}
                              className="flex-1 outline-none bg-transparent font-medium text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Token Number Display */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Token Number</Label>
                          <div className="border-2 border-gray-200 rounded-xl px-6 py-4 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-700">Token #2</span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Selection */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Doctor</Label>
                        <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                          <User className="w-5 h-5 text-blue-600" />
                          <Select value={appointmentDoctor} onValueChange={setAppointmentDoctor}>
                            <SelectTrigger className="border-0 shadow-none p-0 h-auto focus:ring-0 font-medium">
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map(doctor => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.name} - {doctor.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Checkup Type */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Checkup Type</Label>
                        <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <Select value={checkupType} onValueChange={setCheckupType}>
                            <SelectTrigger className="border-0 shadow-none p-0 h-auto focus:ring-0 font-medium">
                              <SelectValue placeholder="Select checkup type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular Checkup</SelectItem>
                              <SelectItem value="followup">Follow-up Visit</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="routine">Routine Examination</SelectItem>
                              <SelectItem value="specialist">Specialist Referral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Comment Section */}
                      <Collapsible open={isCommentOpen} onOpenChange={setIsCommentOpen}>
                        <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <span className="font-medium text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Additional Comments
                          </span>
                          {isCommentOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add any additional notes or special instructions..."
                            className="min-h-[100px] mt-3 resize-none border-2 rounded-xl focus:border-blue-300"
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <Button 
                        variant="outline"
                        onClick={() => setIsCreateAppointmentOpen(false)}
                        className="h-12 px-8 rounded-xl border-2"
                      >
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 h-12 px-8 rounded-xl shadow-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create Token
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl shadow-sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Create & Print
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(selectedDate)}
            </span>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="flex-1 overflow-auto bg-white">
          {loadingAppointments || loadingDoctors ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Loading schedule...</p>
              </div>
            </div>
          ) : (
          <div className="min-w-max">
            {/* Doctor Headers */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
              <div className="flex">
                {/* Time column header */}
                <div className="w-20 flex-shrink-0 border-r border-gray-200 p-3">
                  <span className="text-xs font-medium text-gray-500">TIME</span>
                </div>
                
                {/* Doctor columns */}
                {filteredDoctors.length === 0 ? (
                  <div className="flex-1 p-8 text-center text-gray-500">
                    No doctors available
                  </div>
                ) : (
                  filteredDoctors.map(doctor => (
                    <div 
                      key={doctor.id} 
                      className="flex-1 min-w-[300px] border-r border-gray-200 p-4 bg-gray-50"
                    >
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{doctor.specialization}</p>
                        <Badge className="mt-2 bg-blue-100 text-blue-800">
                          {doctor.appointmentCount} APPOINTMENTS
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Time Slots Grid */}
            <div className="divide-y divide-gray-200">
              {timeSlots.map(timeSlot => (
                <div key={timeSlot.slot} className="flex hover:bg-gray-50 transition-colors">
                  {/* Time column */}
                  <div className="w-20 flex-shrink-0 border-r border-gray-200 p-3 bg-gray-50">
                    <div className="text-center">
                      <span className="text-xs font-medium text-gray-600">{timeSlot.slot}</span>
                      <p className="text-xs text-gray-500 mt-1">{timeSlot.label}</p>
                    </div>
                  </div>

                  {/* Appointment cells */}
                  {filteredDoctors.map(doctor => {
                    const appointment = getAppointmentForSlot(doctor.id, timeSlot.slot);
                    
                    return (
                      <div 
                        key={doctor.id} 
                        className="flex-1 min-w-[300px] border-r border-gray-200 p-3 min-h-[80px]"
                      >
                        {appointment ? (
                          <Card className={`border-l-4 ${getStatusColor(appointment.status)} cursor-pointer hover:shadow-md transition-shadow`}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    {appointment.tokenNumber}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {appointment.patientName}
                                    </h4>
                                    <p className="text-xs text-gray-500">{appointment.patientId}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(appointment.status)}
                                  <span className="text-xs capitalize">{appointment.status}</span>
                                </div>
                              </div>
                              
                              {appointment.reason && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                  {appointment.reason}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </div>

                              {/* Quick Actions */}
                              <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Check
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <button 
                            className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center group"
                            onClick={() => setIsCreateAppointmentOpen(true)}
                          >
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Footer Progress Bar */}
        <div className="bg-blue-900 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Onboarding Session of November 2025</p>
              <p className="text-xs text-blue-200 mt-1">Track your monthly appointment progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">07%</p>
                <p className="text-xs text-blue-200">Completed</p>
              </div>
              <div className="w-32 h-2 bg-blue-800 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: '7%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <Button 
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Add Patient"
        >
          <User className="w-5 h-5" />
        </Button>
        <Button 
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        <Button 
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          title="Call"
        >
          <Phone className="w-5 h-5" />
        </Button>
      </div>

      {/* Token Queue Display Dialog */}
      {showTokenQueue && (
        <Dialog open={showTokenQueue} onOpenChange={setShowTokenQueue}>
          <DialogContent className="max-w-2xl !z-[10000] [&>div]:!z-[10000]">
            <DialogHeader>
              <DialogTitle>Token Queue Display</DialogTitle>
              <DialogDescription>
                Current waiting queue for today's appointments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {appointments
                .filter(a => a.status === 'waiting' || a.status === 'scheduled')
                .map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-blue-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {appointment.tokenNumber}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-600">{appointment.patientId}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Dr. {doctors.find(d => d.id === appointment.doctorId)?.name} • {appointment.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !z-[10000] [&>div]:!z-[10000]">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Add New Patient
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-1">
              Fill in the patient information to register them in the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Basic Information Section */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
              <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</div>
                Basic Information
              </h3>
              
              {/* MR# */}
              <div className="space-y-2 mb-5">
                <Label className="text-sm font-medium text-gray-700">Medical Record Number (MR#)</Label>
                <div className="relative">
                  <Input
                    value={mrNumber}
                    onChange={(e) => setMrNumber(e.target.value)}
                    className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium bg-white"
                    placeholder="Auto-generated: 100005"
                  />
                  <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700">
                    Auto
                  </Badge>
                </div>
              </div>

              {/* Name */}
              <div className="mb-5">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="h-14 pl-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                    placeholder="Enter patient's full name"
                  />
                </div>
              </div>

              {/* Country and Phone Row */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Country */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="h-14 pl-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-white">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pakistan +92">🇵🇰 Pakistan +92</SelectItem>
                        <SelectItem value="USA +1">🇺🇸 USA +1</SelectItem>
                        <SelectItem value="UK +44">🇬🇧 UK +44</SelectItem>
                        <SelectItem value="UAE +971">🇦🇪 UAE +971</SelectItem>
                        <SelectItem value="India +91">🇮🇳 India +91</SelectItem>
                        <SelectItem value="Saudi Arabia +966">🇸🇦 Saudi Arabia +966</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-600 font-medium">+92</span>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-14 pl-24 pr-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                      placeholder="3XX XXXXXXX"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <Collapsible open={isAdditionalInfoOpen} onOpenChange={setIsAdditionalInfoOpen}>
              <div className="bg-white rounded-xl border-2 border-gray-200">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-xl">
                  <span className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">2</div>
                    Additional Information
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Optional</span>
                    {isAdditionalInfoOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-5 px-6 pb-6">
                    <Separator />
                    
                    {/* Email */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-14 pl-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="patient@example.com"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Gender</Label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors bg-white">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'male' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            {gender === 'male' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                          </div>
                          <span className="font-medium">Male</span>
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === 'male'}
                            onChange={(e) => setGender(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors bg-white">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'female' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            {gender === 'female' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                          </div>
                          <span className="font-medium">Female</span>
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === 'female'}
                            onChange={(e) => setGender(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors bg-white">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'other' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            {gender === 'other' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                          </div>
                          <span className="font-medium">Other</span>
                          <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={gender === 'other'}
                            onChange={(e) => setGender(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    {/* DOB or Age */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Date of Birth / Age</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type="text"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="h-14 pl-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="DD-MM-YYYY"
                          />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">OR</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-200">
                          <span className="text-sm text-gray-600">Age:</span>
                          <Input
                            value={ageYears}
                            onChange={(e) => setAgeYears(e.target.value)}
                            className="h-12 w-16 text-center border-2 rounded-lg"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-600">Y</span>
                          <Input
                            value={ageMonths}
                            onChange={(e) => setAgeMonths(e.target.value)}
                            className="h-12 w-16 text-center border-2 rounded-lg"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-600">M</span>
                          <Input
                            value={ageDays}
                            onChange={(e) => setAgeDays(e.target.value)}
                            className="h-12 w-16 text-center border-2 rounded-lg"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-600">D</span>
                        </div>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Registration Date</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={registrationDate}
                          onChange={(e) => setRegistrationDate(e.target.value)}
                          className="h-14 pl-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 font-medium"
                          placeholder="DD-MM-YYYY"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline"
                onClick={() => setIsAddPatientOpen(false)}
                className="h-12 px-8 rounded-xl border-2"
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 px-12 text-base rounded-xl shadow-lg shadow-blue-200"
                onClick={() => {
                  // Add patient logic here
                  setIsAddPatientOpen(false);
                  // Optionally add the new patient to the search results
                }}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
