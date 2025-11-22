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
  room_number?: string;
  room_name?: string;
  floor_number?: number;
  floor_name?: string;
  reception_name?: string;
  token_number?: string;
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
  const [selectedPatient, setSelectedPatient] = useState<{name: string; id: number; patient_id?: string} | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentDoctor, setAppointmentDoctor] = useState('');
  const [appointmentTime, setAppointmentTime] = useState<string>(''); // Store selected time slot
  const [checkupType, setCheckupType] = useState('regular');
  const [comment, setComment] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(true);
  const [previewTokenNumber, setPreviewTokenNumber] = useState<string>('');
  const [loadingTokenPreview, setLoadingTokenPreview] = useState(false);
  
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
  const [doctorAvailableSlots, setDoctorAvailableSlots] = useState<Record<string, string[]>>({}); // doctorId -> array of time strings (HH:mm)
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [roomMode, setRoomMode] = useState<'Fixed' | 'Dynamic'>('Fixed');
  const [creatingToken, setCreatingToken] = useState(false);
  
  // Patient search results - use numeric id for API, but display patient_id string
  const searchResults = patientSearchResults.map(p => {
    // Ensure id is always a number
    const numericId = typeof p.id === 'number' ? p.id : (typeof p.id === 'string' ? parseInt(p.id, 10) : null);
    if (!numericId || isNaN(numericId) || numericId <= 0) {
      console.warn('Invalid patient ID in search results:', p);
      return null;
    }
    return {
      name: p.name,
      id: numericId, // Use numeric id for API calls
      patient_id: p.patient_id || p.id.toString() // Display string for UI
    };
  }).filter((p): p is {name: string; id: number; patient_id: string} => p !== null);

  // Generate 24-hour time slots (00:00 to 23:00)
  interface TimeSlot {
    slot: number;
    time: string;
    label: string;
    hour: number;
  }

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        slot: hour + 1,
        time: time24,
        label: time24,
        hour: hour
      });
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

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

  // Get time slot from appointment time (returns hour 0-23)
  const getTimeSlotFromTime = (appointmentTime: string): number => {
    const date = new Date(appointmentTime);
    const hour = date.getHours();
    return hour + 1; // Slot number (1-24)
  };

  // Format time from datetime string in 24-hour format
  const formatTime = (datetime: string): string => {
    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hoursStr}:${minutesStr}`;
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

  // Load available slots for all doctors on selected date
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (doctors.length === 0) return;
      
      try {
        setLoadingSlots(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const slotsMap: Record<string, string[]> = {};
        
        // Load available slots for each doctor
        await Promise.all(
          doctors.map(async (doctor) => {
            try {
              const slots = await api.getAvailableSlots(doctor.id, dateStr);
              
              // Ensure slots is an array
              if (!Array.isArray(slots)) {
                console.warn(`Doctor ${doctor.id}: API returned non-array response:`, slots);
                slotsMap[doctor.id] = [];
                return;
              }
              
              // Extract time strings (HH:mm format) from available slots
              // Only include slots that have availability > 0
              const timeStrings = slots
                .filter(slot => slot && slot.available > 0 && slot.status !== 'full')
                .map(slot => {
                  const date = new Date(slot.datetime);
                  const hours = date.getHours().toString().padStart(2, '0');
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  return `${hours}:${minutes}`;
                });
              slotsMap[doctor.id] = timeStrings;
              
              // Debug log to see what slots are being returned
              if (doctor.id && slots.length > 0) {
                console.log(`Doctor ${doctor.id} (${doctor.name}): Found ${timeStrings.length} available slots on ${dateStr}`, timeStrings.slice(0, 5));
              }
            } catch (error) {
              console.error(`Error loading slots for doctor ${doctor.id}:`, error);
              slotsMap[doctor.id] = [];
            }
          })
        );
        
        setDoctorAvailableSlots(slotsMap);
      } catch (error) {
        console.error('Error loading available slots:', error);
        setDoctorAvailableSlots({});
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate, doctors]);

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
          
          // Debug: Log token_number from API
          if (apt.id) {
            console.log(`Appointment ${apt.id}: token_number from API =`, apt.token_number, 'type:', typeof apt.token_number);
          }
          
          // Extract token_number directly from API - don't modify it, just use it as-is
          // The API returns token_number: "F1-001", "F1-002" etc. - use it directly
          const tokenNumberFromAPI = apt.token_number;
          
          // Debug: Log what we're getting from API
          if (apt.id) {
            console.log(`[APPOINTMENT MAPPING] Appointment ${apt.id}:`, {
              'token_number from API': tokenNumberFromAPI,
              'token_number type': typeof tokenNumberFromAPI,
              'room_number': apt.room_number,
              'floor_number': apt.floor_number
            });
          }
          
          return {
            id: apt.id.toString(),
            patientName: apt.patient_name || 'Unknown',
            patientId: apt.patient_id_string || apt.patient_id.toString(),
            // Use token_number directly from API - no validation, no fallback
            tokenNumber: tokenNumberFromAPI || apt.appointment_number || String(index + 1).padStart(3, '0'),
            room_number: (apt as any).room_number,
            room_name: (apt as any).room_name,
            floor_number: (apt as any).floor_number,
            floor_name: (apt as any).floor_name,
            reception_name: (apt as any).reception_name,
            // Store token_number EXACTLY as it comes from API - no modification
            token_number: tokenNumberFromAPI || undefined,
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

  // Calculate preview token number when doctor and date are selected
  useEffect(() => {
    const calculateTokenPreview = async () => {
      if (!appointmentDoctor || !selectedPatient) {
        setPreviewTokenNumber('');
        return;
      }

      try {
        setLoadingTokenPreview(true);
        
        // Get doctor's room assignment to determine reception
        let receptionId: number | null = null;
        
        if (roomMode === 'Fixed') {
          try {
            const doctorRoom = await api.getDoctorRoom(parseInt(appointmentDoctor));
            if (doctorRoom && doctorRoom.reception_id) {
              receptionId = doctorRoom.reception_id;
            }
          } catch (error) {
            console.error('Error getting doctor room:', error);
          }
        }
        
        if (receptionId) {
          // Get existing tokens to estimate next number
          const dateStr = appointmentDate.toISOString().split('T')[0];
          try {
            const tokens = await api.getTokensByReception(receptionId, dateStr);
            // Estimate next token number (actual logic is in backend)
            const nextNumber = tokens.length + 1;
            setPreviewTokenNumber(`~${nextNumber}`);
          } catch (error) {
            // If no tokens exist yet, show first token
            setPreviewTokenNumber('~1');
          }
        } else {
          setPreviewTokenNumber('Will be generated');
        }
      } catch (error) {
        console.error('Error calculating token preview:', error);
        setPreviewTokenNumber('Will be generated');
      } finally {
        setLoadingTokenPreview(false);
      }
    };

    calculateTokenPreview();
  }, [appointmentDoctor, appointmentDate, appointmentTime, selectedPatient, roomMode]);

  // Handle token creation
  const handleCreateToken = async (print: boolean = false) => {
    if (!selectedPatient || !appointmentDoctor) {
      alert('Please select a patient and doctor');
      return;
    }

    // Debug: Log the selected patient to see its structure
    console.log('Selected patient:', selectedPatient);
    console.log('Patient ID type:', typeof selectedPatient.id, 'Value:', selectedPatient.id);

    // Validate patient_id - handle number, string, undefined, and null
    let patientId: number;
    
    if (selectedPatient.id === undefined || selectedPatient.id === null) {
      console.error('Patient ID is undefined or null:', selectedPatient);
      alert('Invalid patient ID. Please select a valid patient.');
      return;
    }
    
    if (typeof selectedPatient.id === 'number') {
      if (selectedPatient.id <= 0 || isNaN(selectedPatient.id)) {
        console.error('Patient ID is not a valid number:', selectedPatient.id);
        alert('Invalid patient ID. Please select a valid patient.');
        return;
      }
      patientId = selectedPatient.id;
    } else if (typeof selectedPatient.id === 'string') {
      const parsed = parseInt(selectedPatient.id, 10);
      if (isNaN(parsed) || parsed <= 0) {
        console.error('Invalid patient ID string:', selectedPatient.id);
        alert('Invalid patient ID. Please select a valid patient.');
        return;
      }
      patientId = parsed;
    } else {
      console.error('Patient ID is not a valid type:', typeof selectedPatient.id, selectedPatient);
      alert('Invalid patient ID. Please select a valid patient.');
      return;
    }

    console.log('Final patient ID:', patientId);

    try {
      setCreatingToken(true);
      const dateStr = appointmentDate.toISOString().split('T')[0];
      const timeStr = appointmentTime || '09:00';
      const appointmentDateTime = `${dateStr} ${timeStr}:00`;

      // Map checkup type to appointment type
      const appointmentTypeMap: Record<string, string> = {
        'regular': 'Check-up',
        'followup': 'Follow-up',
        'emergency': 'Emergency',
        'consultation': 'Consultation',
        'routine': 'Check-up',
        'specialist': 'Consultation'
      };

      const appointmentData: any = {
        patient_id: patientId,
        doctor_doctor_id: parseInt(appointmentDoctor),
        appointment_date: appointmentDateTime,
        appointment_type: appointmentTypeMap[checkupType] || 'Consultation',
        reason: comment || undefined,
        notes: comment || undefined
      };

      // In Dynamic mode, we would need schedule_id, but for now we'll let backend handle it
      // The backend will auto-assign room based on doctor and time

      const appointment = await api.createAppointment(appointmentData);
      
      // Refresh appointments
      const apiAppointments = await api.getAppointments({ date: dateStr });
      const mappedAppointments: Appointment[] = apiAppointments.map((apt, index) => {
        const timeSlot = getTimeSlotFromTime(apt.appointment_date);
        
        // Debug: Log token_number from API after creation
        if (apt.id) {
          console.log(`Appointment ${apt.id} (after create): token_number =`, apt.token_number, 'full apt:', apt);
        }
        
        // Extract token_number directly from API - don't modify it, just use it as-is
        // The API returns token_number: "F1-001", "F1-002" etc. - use it directly
        const tokenNumberFromAPI = apt.token_number;
        
        // Debug: Log what we're getting from API
        if (apt.id) {
          console.log(`[APPOINTMENT MAPPING - AFTER CREATE] Appointment ${apt.id}:`, {
            'token_number from API': tokenNumberFromAPI,
            'token_number type': typeof tokenNumberFromAPI,
            'room_number': apt.room_number,
            'floor_number': apt.floor_number
          });
        }
        
        return {
          id: apt.id.toString(),
          patientName: apt.patient_name || 'Unknown',
          patientId: apt.patient_id_string || apt.patient_id.toString(),
          // Use token_number directly from API - no validation, no fallback
          tokenNumber: tokenNumberFromAPI || apt.appointment_number || String(index + 1).padStart(3, '0'),
          room_number: (apt as any).room_number,
          room_name: (apt as any).room_name,
          floor_number: (apt as any).floor_number,
          floor_name: (apt as any).floor_name,
          reception_name: (apt as any).reception_name,
          // Store token_number EXACTLY as it comes from API - no modification
          token_number: tokenNumberFromAPI || undefined,
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

      // Close dialog and reset form
      setIsCreateAppointmentOpen(false);
      setSelectedPatient(null);
      setPatientSearch('');
      setAppointmentDoctor('');
      setAppointmentTime('');
      setPreviewTokenNumber('');
      setCheckupType('regular');
      setComment('');

      if (print) {
        // TODO: Implement print functionality
        console.log('Print token:', appointment.token_number);
      }

      alert(`Token created successfully! Token: ${appointment.token_number || 'N/A'}`);
    } catch (error: any) {
      console.error('Error creating token:', error);
      alert(error.message || 'Failed to create token');
    } finally {
      setCreatingToken(false);
    }
  };

  // Get available time slots for filtered doctors
  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (filteredDoctors.length === 0) return allTimeSlots;
    
    // Get all unique available hour slots across filtered doctors
    const availableHours = new Set<number>();
    filteredDoctors.forEach(doctor => {
      const doctorSlots = doctorAvailableSlots[doctor.id] || [];
      doctorSlots.forEach(time => {
        // Extract hour from time string (e.g., "18:30" -> hour 18)
        const hour = parseInt(time.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          availableHours.add(hour);
        }
      });
    });
    
    // If no slots available, show all slots (fallback)
    if (availableHours.size === 0) return allTimeSlots;
    
    // Filter time slots to only show hours that have available slots
    return allTimeSlots.filter(slot => availableHours.has(slot.hour));
  };

  const availableTimeSlots = getAvailableTimeSlots();

  const getAppointmentsForSlot = (doctorId: string, timeSlot: number) => {
    return appointments.filter(apt => apt.doctorId === doctorId && apt.timeSlot === timeSlot);
  };

  // Check if a slot is available for a specific doctor
  const isSlotAvailableForDoctor = (doctorId: string, timeSlot: TimeSlot): boolean => {
    const doctorSlots = doctorAvailableSlots[doctorId] || [];
    if (doctorSlots.length === 0) return false;
    
    // Check if any available slot time falls within this hour
    return doctorSlots.some(slotTime => {
      const [slotHour, slotMinute] = slotTime.split(':').map(Number);
      // Match if the slot time is in the same hour (e.g., 18:00, 18:30, 18:45 all match hour 18)
      return slotHour === timeSlot.hour;
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      scheduled: 'border-blue-500',
      checked: 'border-green-500',
      cancelled: 'border-red-500',
      waiting: 'border-orange-500'
    };
    return colors[status] || 'border-gray-400';
  };
  
  const getStatusBgColor = (status: string) => {
    const colors: any = {
      scheduled: 'bg-blue-500',
      checked: 'bg-green-500',
      cancelled: 'bg-red-500',
      waiting: 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-400';
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
    <div className="flex h-screen bg-gray-50 relative">
      {/* Left Sidebar - Calendar */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto relative z-0 flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="border rounded-lg overflow-hidden flex-shrink-0 bg-white">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md w-full"
          />
        </div>

        {/* Token Queue Display */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <button
              onClick={() => setShowTokenQueue(!showTokenQueue)}
              className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span className="font-medium text-xs">Token Queue Display</span>
              </div>
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">
                {appointments.filter(a => a.status === 'waiting').length}
              </Badge>
            </button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-2">
          <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs text-blue-900 font-medium">Total Appointments</span>
              </div>
              <span className="text-base font-bold text-blue-900">{appointments.length}</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-green-900 font-medium">Checked</span>
              </div>
              <span className="text-base font-bold text-green-900">
                {appointments.filter(a => a.status === 'checked').length}
              </span>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2.5 border border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs text-orange-900 font-medium">Waiting</span>
              </div>
              <span className="text-base font-bold text-orange-900">
                {appointments.filter(a => a.status === 'waiting').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Schedule Grid */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
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
              <Dialog open={isCreateAppointmentOpen} onOpenChange={(open) => {
                setIsCreateAppointmentOpen(open);
                if (!open) {
                  // Reset form when dialog closes
                  setSelectedPatient(null);
                  setPatientSearch('');
                  setAppointmentDoctor('');
                  setAppointmentTime('');
                  setPreviewTokenNumber('');
                  setCheckupType('regular');
                  setComment('');
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Token
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                                    <div className="text-sm text-gray-500">MR# {patient.patient_id || patient.id}</div>
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
                            <span className="text-sm text-gray-600">MR# {selectedPatient.patient_id || selectedPatient.id}</span>
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
                      
                      {/* Date, Time and Token Row */}
                      <div className="grid grid-cols-3 gap-4">
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

                        {/* Time Field */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Time</Label>
                          <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <input
                              type="time"
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="flex-1 outline-none bg-transparent font-medium text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Token Number Display */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Token Number</Label>
                          <div className="border-2 border-gray-200 rounded-xl px-6 py-4 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center min-h-[60px]">
                            {loadingTokenPreview ? (
                              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            ) : previewTokenNumber ? (
                              <span className="text-2xl font-bold text-blue-700">{previewTokenNumber}</span>
                            ) : (
                              <span className="text-lg text-gray-400">Will be generated</span>
                            )}
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
                      <Button 
                        className="bg-green-600 hover:bg-green-700 h-12 px-8 rounded-xl shadow-sm"
                        onClick={() => handleCreateToken(false)}
                        disabled={creatingToken || !selectedPatient || !appointmentDoctor}
                      >
                        {creatingToken ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Create Token
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl shadow-sm"
                        onClick={() => handleCreateToken(true)}
                        disabled={creatingToken || !selectedPatient || !appointmentDoctor}
                      >
                        {creatingToken ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4 mr-2" />
                        )}
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
            <div className="sticky top-0 z-0 bg-white border-b border-gray-200">
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
                      className="flex-1 min-w-[450px] border-r border-gray-200 p-4 bg-gray-50"
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
              {loadingSlots ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Loading available slots...</span>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <span className="text-sm">No available slots for selected doctors on this date</span>
                </div>
              ) : (
                availableTimeSlots.map(timeSlot => (
                  <div key={timeSlot.slot} className="flex hover:bg-gray-50 transition-colors">
                    {/* Time column */}
                    <div className="w-20 flex-shrink-0 border-r border-gray-200 p-3 bg-gray-50">
                      <div className="text-center">
                        <span className="text-xs font-medium text-gray-600">{timeSlot.time}</span>
                        <p className="text-xs text-gray-500 mt-1">{timeSlot.label}</p>
                      </div>
                    </div>

                    {/* Appointment cells */}
                    {filteredDoctors.map(doctor => {
                      const isAvailable = isSlotAvailableForDoctor(doctor.id, timeSlot);
                      const slotAppointments = getAppointmentsForSlot(doctor.id, timeSlot.slot);
                      
                      return (
                        <div 
                          key={doctor.id} 
                          className={`flex-1 min-w-[450px] border-r border-gray-200 p-2 bg-gray-50/30 ${
                            !isAvailable ? 'opacity-40' : ''
                          }`}
                          style={{ minHeight: slotAppointments.length > 0 ? `${Math.max(70, slotAppointments.length * 60 + 50)}px` : '70px' }}
                        >
                          <div className="flex flex-col gap-2 h-full">
                            {/* Appointments List */}
                            {slotAppointments.length > 0 && (
                              <div className="space-y-1.5 flex-1">
                                {slotAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className={`group relative bg-white border-l-4 ${getStatusColor(appointment.status)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden`}
                                  >
                                    <div className="p-2.5 bg-blue-50 rounded-lg">
                                      <div className="flex items-start gap-2 mb-2">
                                        {/* Token Number Circle */}
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                                          {(() => {
                                            const tokenNumber = (appointment as any).token_number || appointment.tokenNumber || '';
                                            const tokenDisplay = tokenNumber.includes('-') ? tokenNumber.split('-').pop() : tokenNumber;
                                            return tokenNumber || '---';
                                          })()}
                                        </div>
                                        
                                        {/* Patient Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between mb-0.5">
                                            <div className="min-w-0 flex-1">
                                              <h4 className="font-semibold text-gray-900 text-xs mb-0.5 truncate">
                                                {appointment.patientName}
                                              </h4>
                                              <p className="text-[10px] text-gray-600 truncate">
                                                {appointment.patientId}
                                              </p>
                                            </div>
                                            {/* Status with Clock Icon */}
                                            <div className="flex items-center gap-0.5 text-[10px] text-gray-600 flex-shrink-0 ml-1">
                                              <Clock className="w-2.5 h-2.5" />
                                              <span className="capitalize whitespace-nowrap">{appointment.status}</span>
                                            </div>
                                          </div>
                                          
                                          {/* Appointment Type/Reason */}
                                          {appointment.reason && (
                                            <p className="text-[10px] text-gray-500 mb-0.5 truncate">
                                              {appointment.reason}
                                            </p>
                                          )}
                                          
                                          {/* Time */}
                                          <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                            <Clock className="w-2.5 h-2.5" />
                                            <span>{appointment.time}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1 pt-1.5 border-t border-blue-100">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 px-1.5 text-[10px] hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
                                          title="View Details"
                                        >
                                          <Eye className="w-2.5 h-2.5 mr-0.5" />
                                          View
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 px-1.5 text-[10px] hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
                                          title="Edit"
                                        >
                                          <Edit className="w-2.5 h-2.5 mr-0.5" />
                                          Edit
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 px-1.5 text-[10px] hover:bg-green-100 hover:text-green-600 text-green-600 rounded transition-colors"
                                          title="Mark as Checked"
                                        >
                                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                          Check
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Status Indicator Bar */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getStatusBgColor(appointment.status)}`} />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Add Button - Always visible if available */}
                            {isAvailable && (
                              <button 
                                className="flex-shrink-0 w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 hover:border-blue-500 transition-all duration-200 flex items-center justify-center group py-2"
                                onClick={() => {
                                  // Auto-select doctor and time when clicking on a slot
                                  setAppointmentDoctor(doctor.id);
                                  setAppointmentDate(selectedDate);
                                  // Set time based on the slot hour
                                  const slotTime = `${timeSlot.hour.toString().padStart(2, '0')}:00`;
                                  setAppointmentTime(slotTime);
                                  setIsCreateAppointmentOpen(true);
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                    <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                  </div>
                                  <span className="text-[10px] text-gray-400 group-hover:text-blue-600 font-medium transition-colors">
                                    Add Appointment
                                  </span>
                                </div>
                              </button>
                            )}
                            
                            {/* Not Available State */}
                            {!isAvailable && slotAppointments.length === 0 && (
                              <div className="flex items-center justify-center h-full min-h-[50px]">
                                <div className="text-center">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-1">
                                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-medium">Not available</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
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
          <DialogContent 
            className="!max-w-lg !w-[450px]"
            style={{ width: '450px', maxWidth: '450px' }}
          >
            <DialogHeader>
              <DialogTitle>Token Queue Display</DialogTitle>
              <DialogDescription>
                Current waiting queue for today's appointments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {appointments
                .filter(a => a.status === 'waiting' || a.status === 'scheduled' || a.status === 'checked')
                .map((appointment) => {
                  // Extract token number (e.g., "F1-001" -> "001")
                  const tokenNumber = (appointment as any).token_number || appointment.tokenNumber || '';
                  const tokenDisplay = tokenNumber.includes('-') ? tokenNumber.split('-').pop() : tokenNumber;
                  
                  // Format time (e.g., "18:00" -> "6:00 PM")
                  const formatTime = (time: string) => {
                    const [hours, minutes] = time.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
                  };
                  
                  const doctorName = doctors.find(d => d.id === appointment.doctorId)?.name || 'Unknown Doctor';
                  const isScheduled = appointment.status === 'scheduled' || appointment.status === 'checked';
                  
                  return (
                    <Card key={appointment.id} className="border-l-4 border-l-blue-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Token Number Circle */}
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {tokenDisplay || '---'}
                            </div>
                            
                            {/* Patient Info */}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.patientName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {appointment.patientId}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Dr. {doctorName} • {formatTime(appointment.time)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <Badge 
                            className={isScheduled 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-orange-100 text-orange-800 border-orange-200'}
                          >
                            {isScheduled ? 'SCHEDULED' : 'WAITING'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
