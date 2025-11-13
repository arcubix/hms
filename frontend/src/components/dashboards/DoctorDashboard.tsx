import { useState, useEffect } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Stethoscope,
  Activity,
  Video,
  Pill,
  FlaskConical,
  CheckCircle,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Printer,
  Phone,
  Mail
} from 'lucide-react';
import { User } from '../../App';
import { api, Appointment } from '../../services/api';
import { PrescriptionPage } from '../pages/PrescriptionPage';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Calendar className="w-5 h-5" />, label: 'My Schedule', id: 'schedule', badge: '8' },
  { icon: <Users className="w-5 h-5" />, label: 'My Patients', id: 'patients' },
  { icon: <Video className="w-5 h-5" />, label: 'Telemedicine', id: 'telemedicine' },
  { icon: <FileText className="w-5 h-5" />, label: 'Patient Records', id: 'records' },
  { icon: <Pill className="w-5 h-5" />, label: 'Prescriptions', id: 'prescriptions' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Results', id: 'lab' }
];

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [scheduleAppointments, setScheduleAppointments] = useState<Appointment[]>([]);
  const [appointmentsWithPrescriptions, setAppointmentsWithPrescriptions] = useState<Set<number>>(new Set());
  const [appointmentPrescriptionMap, setAppointmentPrescriptionMap] = useState<Map<number, number>>(new Map()); // appointment_id -> prescription_id
  const [patientsList, setPatientsList] = useState<Array<{
    id: number;
    patient_id?: string;
    name: string;
    phone?: string;
    email?: string;
    lastAppointment: string;
    totalAppointments: number;
    lastAppointmentType?: string;
    lastAppointmentStatus?: string;
  }>>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingResults: 0,
    prescriptions: 0
  });
  
  // Prescription page state
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Format date from datetime string
  const formatDate = (datetime: string): string => {
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time from datetime string
  const formatTime = (datetime: string): string => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (user?.doctor?.id) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.doctor?.id]);

  // Load schedule appointments when schedule section is active
  useEffect(() => {
    if (activeSection === 'schedule' && user?.doctor?.id && scheduleAppointments.length === 0) {
      loadScheduleAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, user?.doctor?.id]);

  // Load patients when patients section is active
  useEffect(() => {
    if (activeSection === 'patients' && user?.doctor?.id) {
      loadPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, user?.doctor?.id]);

  const loadDashboardData = async () => {
    if (!user?.doctor?.id) return;

    try {
      setLoading(true);
      const doctorId = user.doctor.id;

      // Get today's appointments
      const today = getTodayDate();
      const todayAppts = await api.getAppointments({
        doctor_id: doctorId,
        date: today
      });
      setTodaysAppointments(todayAppts);

      // Get all appointments for stats
      const allAppts = await api.getAppointments({
        doctor_id: doctorId
      });
      setAllAppointments(allAppts);

      // Calculate stats
      const uniquePatients = new Set(allAppts.map(apt => apt.patient_id));
      const todayCount = todayAppts.length;
      const completedToday = todayAppts.filter(apt => apt.status === 'Completed').length;
      
      setStats({
        todayAppointments: todayCount,
        totalPatients: uniquePatients.size,
        pendingResults: 0, // TODO: Implement when lab results are available
        prescriptions: 0 // TODO: Implement when prescriptions are available
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get recent patients from appointments (last 5 unique patients)
  const getRecentPatients = () => {
    const patientMap = new Map<number, { 
      id: number; 
      name: string; 
      lastVisit: string; 
      appointmentType: string;
    }>();

    // Sort appointments by date (most recent first) and get unique patients
    const sortedAppts = [...allAppointments].sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    );

    for (const apt of sortedAppts) {
      if (!patientMap.has(apt.patient_id) && patientMap.size < 5) {
        patientMap.set(apt.patient_id, {
          id: apt.patient_id,
          name: apt.patient_name || `Patient #${apt.patient_id}`,
          lastVisit: apt.appointment_date,
          appointmentType: apt.appointment_type || 'Consultation'
        });
      }
    }

    return Array.from(patientMap.values());
  };

  const loadPatients = async () => {
    if (!user?.doctor?.id) return;

    try {
      setPatientsLoading(true);
      const doctorId = user.doctor.id;

      // Get all appointments for this doctor
      const appointments = await api.getAppointments({
        doctor_id: doctorId
      });

      // Group appointments by patient_id and extract unique patients
      const patientMap = new Map<number, {
        id: number;
        patient_id?: string;
        name: string;
        phone?: string;
        email?: string;
        appointments: Appointment[];
      }>();

      // Process each appointment
      for (const apt of appointments) {
        if (!patientMap.has(apt.patient_id)) {
          // Try to fetch full patient details
          let patientDetails: any = null;
          try {
            // Try by numeric ID first
            patientDetails = await api.getPatient(apt.patient_id.toString());
          } catch (err) {
            // If that fails, try by patient_id string if available
            if (apt.patient_id_string) {
              try {
                patientDetails = await api.getPatient(apt.patient_id_string);
              } catch (e) {
                console.error(`Error fetching patient ${apt.patient_id}:`, e);
              }
            }
          }

          patientMap.set(apt.patient_id, {
            id: apt.patient_id,
            patient_id: patientDetails?.patient_id || apt.patient_id_string,
            name: patientDetails?.name || apt.patient_name || `Patient #${apt.patient_id}`,
            phone: patientDetails?.phone || undefined,
            email: patientDetails?.email || undefined,
            appointments: [apt]
          });
        } else {
          // Add appointment to existing patient
          const patient = patientMap.get(apt.patient_id)!;
          patient.appointments.push(apt);
        }
      }

      // Convert map to array and sort by last appointment date
      const patientsArray = Array.from(patientMap.values()).map(patient => {
        // Sort appointments by date (most recent first)
        const sortedAppts = patient.appointments.sort((a, b) => 
          new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
        );
        const lastAppt = sortedAppts[0];

        return {
          id: patient.id,
          patient_id: patient.patient_id,
          name: patient.name,
          phone: patient.phone,
          email: patient.email,
          lastAppointment: lastAppt.appointment_date,
          totalAppointments: patient.appointments.length,
          lastAppointmentType: lastAppt.appointment_type,
          lastAppointmentStatus: lastAppt.status
        };
      }).sort((a, b) => 
        new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime()
      );

      setPatientsList(patientsArray);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadScheduleAppointments = async () => {
    if (!user?.doctor?.id) return;

    try {
      setScheduleLoading(true);
      const doctorId = user.doctor.id;

      // Get all upcoming and recent appointments, sorted by date
      const allAppts = await api.getAppointments({
        doctor_id: doctorId
      });

      // Sort by appointment_date (nearest first)
      const sorted = allAppts.sort((a, b) => {
        const dateA = new Date(a.appointment_date).getTime();
        const dateB = new Date(b.appointment_date).getTime();
        return dateA - dateB;
      });

      setScheduleAppointments(sorted);

      // Load prescriptions for these appointments to check which have prescriptions
      const appointmentIds = sorted.map(apt => apt.id).filter(id => id);
      const prescriptionsSet = new Set<number>();
      const prescriptionMap = new Map<number, number>(); // appointment_id -> prescription_id
      
      if (appointmentIds.length > 0) {
        // Check prescriptions for each appointment
        const prescriptionChecks = await Promise.all(
          appointmentIds.map(async (aptId) => {
            try {
              const prescriptions = await api.getPrescriptions({ appointment_id: aptId });
              if (prescriptions.length > 0) {
                return { appointmentId: aptId, prescriptionId: prescriptions[0].id };
              }
              return null;
            } catch (err) {
              console.error(`Error checking prescriptions for appointment ${aptId}:`, err);
              return null;
            }
          })
        );
        
        prescriptionChecks.forEach(result => {
          if (result !== null) {
            prescriptionsSet.add(result.appointmentId);
            prescriptionMap.set(result.appointmentId, result.prescriptionId);
          }
        });
      }
      
      setAppointmentsWithPrescriptions(prescriptionsSet);
      setAppointmentPrescriptionMap(prescriptionMap);
    } catch (error) {
      console.error('Error loading schedule appointments:', error);
    } finally {
      setScheduleLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'bg-blue-100 text-blue-800';
      case 'Follow-up':
        return 'bg-purple-100 text-purple-800';
      case 'Check-up':
        return 'bg-green-100 text-green-800';
      case 'Emergency':
        return 'bg-red-100 text-red-800';
      case 'Surgery':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate HTML for prescription printing
  const generatePrescriptionHTML = (prescription: any) => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Prescription - ${prescription.prescription_number}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 15px;
    }
    .section h2 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #000;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table th, table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
    }
    .signature {
      text-align: right;
      border-top: 2px solid #000;
      padding-top: 10px;
      margin-top: 30px;
      width: 200px;
      margin-left: auto;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    .badge-normal { background-color: #dbeafe; color: #1e40af; }
    .badge-urgent { background-color: #fed7aa; color: #9a3412; }
    .badge-emergency { background-color: #fecaca; color: #991b1b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PRESCRIPTION</h1>
    <div class="header-info">
      <div>
        <strong>Prescription No:</strong> ${prescription.prescription_number || 'N/A'}
      </div>
      <div>
        <strong>Date:</strong> ${formatDate(prescription.created_at)}
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Patient Information</h2>
    <div class="info-grid">
      <div><strong>Name:</strong> ${prescription.patient_name || 'N/A'}</div>
      <div><strong>Patient ID:</strong> ${prescription.patient_id_string || prescription.patient_id || 'N/A'}</div>
      ${prescription.patient_phone ? `<div><strong>Phone:</strong> ${prescription.patient_phone}</div>` : ''}
      ${prescription.patient_email ? `<div><strong>Email:</strong> ${prescription.patient_email}</div>` : ''}
    </div>
  </div>

  <div class="section">
    <h2>Prescribed By</h2>
    <div>
      <strong>Dr. ${prescription.doctor_name || 'N/A'}</strong><br>
      ${prescription.specialty ? prescription.specialty : ''}
    </div>
  </div>

  ${prescription.chief_complaint || prescription.diagnosis || prescription.clinical_notes || prescription.advice ? `
  <div class="section">
    <h2>Clinical Information</h2>
    ${prescription.chief_complaint ? `<p><strong>Chief Complaint:</strong> ${prescription.chief_complaint}</p>` : ''}
    ${prescription.diagnosis ? `<p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>` : ''}
    ${prescription.clinical_notes ? `<p><strong>Clinical Notes:</strong> ${prescription.clinical_notes}</p>` : ''}
    ${prescription.advice ? `<p><strong>Advice:</strong> ${prescription.advice}</p>` : ''}
  </div>
  ` : ''}

  ${prescription.medicines && prescription.medicines.length > 0 ? `
  <div class="section">
    <h2>Medications</h2>
    <table>
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${prescription.medicines.map((med: any) => `
          <tr>
            <td>
              ${med.medicine_name}
              ${med.instructions ? `<br><small style="color: #666;">${med.instructions}</small>` : ''}
            </td>
            <td>${med.dosage || '-'}</td>
            <td>${med.frequency || '-'}${med.timing ? ` (${med.timing})` : ''}</td>
            <td>${med.duration || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${prescription.lab_tests && prescription.lab_tests.length > 0 ? `
  <div class="section">
    <h2>Lab Tests / Investigations</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Type</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${prescription.lab_tests.map((test: any) => `
          <tr>
            <td>
              ${test.test_name}
              ${test.instructions ? `<br><small style="color: #666;">${test.instructions}</small>` : ''}
            </td>
            <td>${test.test_type || '-'}</td>
            <td>
              <span class="badge badge-${test.priority?.toLowerCase() || 'normal'}">
                ${test.priority || 'Normal'}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${prescription.follow_up_date ? `
  <div class="section">
    <p><strong>Follow-up Date:</strong> ${formatDate(prescription.follow_up_date)}</p>
  </div>
  ` : ''}

  <div class="footer">
    <div>
      <p style="font-size: 10px; color: #666;">This is a computer-generated prescription.</p>
    </div>
    <div class="signature">
      <strong>Dr. ${prescription.doctor_name || 'N/A'}</strong>
    </div>
  </div>
</body>
</html>`;
  };

  const renderScheduleView = () => {
    if (scheduleLoading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    // Group appointments by date
    const appointmentsByDate = scheduleAppointments.reduce((acc, apt) => {
      const dateKey = formatDate(apt.appointment_date);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(apt);
      return acc;
    }, {} as Record<string, Appointment[]>);

    const dateKeys = Object.keys(appointmentsByDate).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
            <p className="text-gray-600 mt-1">All appointments sorted by nearest time slot</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            {scheduleAppointments.length} {scheduleAppointments.length === 1 ? 'Appointment' : 'Appointments'}
          </Badge>
        </div>

        {scheduleAppointments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">No appointments scheduled</p>
                <p className="text-gray-500 text-sm mt-1">Your schedule is currently empty</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {dateKeys.map((dateKey) => (
              <Card key={dateKey} className="border-0 shadow-sm">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {dateKey}
                    <Badge variant="outline" className="ml-2">
                      {appointmentsByDate[dateKey].length} {appointmentsByDate[dateKey].length === 1 ? 'appointment' : 'appointments'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {appointmentsByDate[dateKey].map((appointment) => {
                      const appointmentDate = new Date(appointment.appointment_date);
                      const now = new Date();
                      const isPast = appointmentDate < now;
                      const isUpcoming = appointmentDate >= now;
                      const todayFormatted = formatDate(now.toISOString());
                      const isToday = dateKey === todayFormatted;

                      return (
                        <div
                          key={appointment.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            isPast ? 'opacity-75' : isUpcoming ? 'bg-blue-50/30 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`flex-shrink-0 w-16 text-center ${isToday ? 'text-blue-600 font-semibold' : isUpcoming ? 'text-blue-600' : 'text-gray-500'}`}>
                                <div className="text-lg font-medium">
                                  {formatTime(appointment.appointment_date)}
                                </div>
                                {appointment.appointment_end_time && (
                                  <div className="text-xs text-gray-400">
                                    - {new Date(appointment.appointment_end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className={isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                                      {(appointment.patient_name || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className={`text-sm font-semibold ${isUpcoming ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {appointment.patient_name || `Patient #${appointment.patient_id}`}
                                    </p>
                                    {appointment.patient_phone && (
                                      <p className="text-xs text-gray-500">{appointment.patient_phone}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                  {isUpcoming && (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                      Upcoming
                                    </Badge>
                                  )}
                                  {isPast && (
                                    <Badge variant="outline" className="text-gray-500 border-gray-300">
                                      Past
                                    </Badge>
                                  )}
                                  <Badge className={getTypeColor(appointment.appointment_type || 'Consultation')}>
                                    {appointment.appointment_type || 'Consultation'}
                                  </Badge>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status}
                                  </Badge>
                                  {appointment.appointment_number && (
                                    <span className="text-xs text-gray-500">
                                      #{appointment.appointment_number}
                                    </span>
                                  )}
                                </div>
                                {appointment.reason && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">Reason:</span> {appointment.reason}
                                  </p>
                                )}
                                {appointment.notes && (
                                  <p className="text-xs text-gray-500 mt-1 italic">
                                    {appointment.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                              {isUpcoming && !appointmentsWithPrescriptions.has(appointment.id) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowPrescription(true);
                                  }}
                                >
                                  <UserIcon className="w-4 h-4 mr-1" />
                                  See Patient
                                </Button>
                              )}
                              {isUpcoming && appointmentsWithPrescriptions.has(appointment.id) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={async () => {
                                    const prescriptionId = appointmentPrescriptionMap.get(appointment.id);
                                    if (prescriptionId) {
                                      try {
                                        const prescription = await api.getPrescription(prescriptionId.toString());
                                        // Open prescription in new window for printing
                                        const printWindow = window.open('', '_blank');
                                        if (printWindow) {
                                          printWindow.document.write(generatePrescriptionHTML(prescription));
                                          printWindow.document.close();
                                          setTimeout(() => {
                                            printWindow.print();
                                          }, 250);
                                        }
                                      } catch (err) {
                                        console.error('Error loading prescription:', err);
                                      }
                                    }
                                  }}
                                  title="Print Prescription"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                              )}
                              {isPast && (
                                <Badge variant="outline" className="text-gray-500 border-gray-300">
                                  Past
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPatientsView = () => {
    if (patientsLoading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
            <p className="text-gray-600 mt-1">
              Patients who have appointments with you ({patientsList.length} total)
            </p>
          </div>
        </div>

        {patientsList.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Yet</h3>
              <p className="text-gray-600">
                Patients will appear here once they have appointments with you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {patientsList.map((patient) => (
              <Card key={patient.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                          {patient.patient_id && (
                            <Badge variant="outline" className="text-xs">
                              {patient.patient_id}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          {patient.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Last Visit: <span className="font-medium text-gray-900">{formatDate(patient.lastAppointment)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(patient.lastAppointmentType || 'Consultation')}>
                              {patient.lastAppointmentType || 'Consultation'}
                            </Badge>
                            <Badge className={getStatusColor(patient.lastAppointmentStatus || 'Pending')}>
                              {patient.lastAppointmentStatus || 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>
                              {patient.totalAppointments} {patient.totalAppointments === 1 ? 'appointment' : 'appointments'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!user?.doctor) {
      return (
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
            <p>Doctor profile not found. Please contact administrator.</p>
          </div>
        </div>
      );
    }

    const recentPatients = getRecentPatients();

    switch (activeSection) {
      case 'schedule':
        return renderScheduleView();
      case 'patients':
        return renderPatientsView();
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Today's Appointments"
                value={stats.todayAppointments.toString()}
                icon={<Calendar className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Total Patients"
                value={stats.totalPatients.toString()}
                icon={<Users className="w-6 h-6" />}
                color="green"
              />
              <StatsCard
                title="Pending Results"
                value={stats.pendingResults.toString()}
                icon={<FlaskConical className="w-6 h-6" />}
                color="yellow"
              />
              <StatsCard
                title="Prescriptions"
                value={stats.prescriptions.toString()}
                icon={<Pill className="w-6 h-6" />}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Today's Schedule
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  {todaysAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todaysAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm text-gray-900 font-medium">
                                {appointment.patient_name || `Patient #${appointment.patient_id}`}
                              </p>
                              <p className="text-xs text-gray-600">
                                {appointment.appointment_type || 'Consultation'}
                                {appointment.reason && ` • ${appointment.reason}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900 font-medium">{formatTime(appointment.appointment_date)}</p>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Recent Patients
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  {recentPatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No patients yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentPatients.map((patient) => {
                        const initials = patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        return (
                          <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm text-gray-900 font-medium">{patient.name}</p>
                                <p className="text-xs text-gray-600">
                                  ID: {patient.id} • {patient.appointmentType}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">
                                Last visit: {formatDate(patient.lastVisit)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">New Consultation</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Pill className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Write Prescription</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <FlaskConical className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs">Order Lab Test</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Patient Notes</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Video className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Start Video Call</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">Schedule Appointment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'lab', message: 'Lab results available for Maria Garcia', time: '5 min ago', urgent: true },
                    { type: 'appointment', message: 'Appointment reminder: John Smith at 2:00 PM', time: '15 min ago', urgent: false },
                    { type: 'prescription', message: 'Prescription refill request from Alice Johnson', time: '1 hour ago', urgent: false },
                    { type: 'message', message: 'New message from Pharmacy regarding stock', time: '2 hours ago', urgent: false }
                  ].map((notification, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${notification.urgent ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'}`}>
                      {notification.urgent ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                      {notification.urgent && (
                        <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Show prescription page if selected
  if (showPrescription && selectedAppointment) {
    return (
      <PrescriptionPage
        appointmentId={selectedAppointment.id.toString()}
        patientId={selectedAppointment.patient_id}
        patientName={selectedAppointment.patient_name || `Patient #${selectedAppointment.patient_id}`}
        patientPhone={selectedAppointment.patient_phone}
        onBack={() => {
          setShowPrescription(false);
          setSelectedAppointment(null);
        }}
        onSuccess={() => {
          setShowPrescription(false);
          setSelectedAppointment(null);
          // Reload schedule appointments to update prescription status
          if (activeSection === 'schedule') {
            loadScheduleAppointments();
          }
          // Reload dashboard data
          loadDashboardData();
        }}
      />
    );
  }

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navigationItems={
        <TopNavigation
          items={navigationItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}