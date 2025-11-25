/**
 * Emergency Department Management System
 * 
 * Navigation Modules:
 * - Admitted Patients: View all admitted emergency patients
 * - Wards: Emergency ward management
 * - Bed Details: Emergency bed tracking and allocation
 * - History: Patient history and records
 * - Emergency Duty Roster: Staff scheduling and duty management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { AdmitEmergencyPatient } from './AdmitEmergencyPatient';
import { AddEmergencyWard } from './AddEmergencyWard';
import { ViewWardDetails } from './ViewWardDetails';
import { ViewEmergencyPatientDetails } from './ViewEmergencyPatientDetails';
import { EditEmergencyPatient } from './EditEmergencyPatient';
import { TransferPatientDialog } from './TransferPatientDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { AmbulanceRequestDialog } from './AmbulanceRequestDialog';
import { PatientMedicalRecords } from './PatientMedicalRecords';
import { PatientVitalsManagement } from './PatientVitalsManagement';
import { EmergencyPatientProfile } from './EmergencyPatientProfile';
import { EmergencyHistoryDetail } from './EmergencyHistoryDetail';
import { UpdateVitalsDialog } from './UpdateVitalsDialog';
import { AddEmergencyBedDialog } from './AddEmergencyBedDialog';
import { EditEmergencyBedDialog } from './EditEmergencyBedDialog';
import { AddDutyDialog } from './AddDutyDialog';
import { EditDutyDialog } from './EditDutyDialog';
import {
  Ambulance,
  Activity,
  Heart,
  AlertCircle,
  Clock,
  Users,
  Bed,
  Stethoscope,
  User,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  ClipboardList,
  FileText,
  Thermometer,
  Droplet,
  Pill,
  Syringe,
  Timer,
  BarChart3,
  Download,
  Printer,
  Eye,
  Edit,
  Plus,
  Search,
  RefreshCw,
  ArrowRight,
  Info,
  Home,
  Hospital,
  Building2,
  DoorOpen,
  UserPlus,
  Gauge,
  HeartPulse,
  Phone,
  MapPin,
  Send,
  X,
  Save,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Target,
  History as HistoryIcon,
  CalendarClock,
  ArrowLeftRight,
  Trash2,
  BedDouble,
  UserCircle,
  FileCheck,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

// ============= INTERFACES =============

interface AdmittedPatient {
  id: string;
  erNumber: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string;
  admissionTime: string;
  triageLevel: number;
  diagnosis: string;
  assignedWard: string;
  bedNumber: string;
  attendingDoctor: string;
  admissionType: 'Ward' | 'Private Room' | 'ICU';
  status: 'Stable' | 'Critical' | 'Under Observation';
  vitalSigns: {
    bp: string;
    pulse: number;
    temp: number;
    spo2: number;
  };
  vitals?: any[]; // Array of vital sign records from emergency_vital_signs table
}

interface Ward {
  id: string;
  name: string;
  type: 'General' | 'Emergency' | 'ICU';
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: 'Active' | 'Maintenance';
  incharge: string;
  contact: string;
}

interface BedDetail {
  id: string;
  bedNumber: string;
  ward: string;
  floor: string;
  type: 'Regular' | 'ICU' | 'Isolation';
  status: 'Occupied' | 'Available' | 'Under Cleaning' | 'Maintenance';
  patientName?: string;
  uhid?: string;
  admissionDate?: string;
  lastCleaned?: string;
}

interface PatientHistory {
  id: string;
  erNumber: string;
  uhid: string;
  patientName: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  disposition: string;
  doctor: string;
  duration: string;
}

interface DutyRoster {
  id: string;
  doctorName: string;
  specialization: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  shiftTime: string;
  date: string;
  status: 'Scheduled' | 'On Duty' | 'Completed' | 'Absent';
  contact: string;
}

// ============= MOCK DATA =============

const admittedPatients: AdmittedPatient[] = [
  {
    id: '1',
    erNumber: 'ER-2024-156',
    uhid: 'UHID-89456',
    name: 'Robert Johnson',
    age: 58,
    gender: 'Male',
    admissionDate: '2024-11-21',
    admissionTime: '08:30 AM',
    triageLevel: 2,
    diagnosis: 'Acute Myocardial Infarction',
    assignedWard: 'Emergency Ward A',
    bedNumber: 'EA-12',
    attendingDoctor: 'Dr. Sarah Mitchell',
    admissionType: 'ICU',
    status: 'Critical',
    vitalSigns: { bp: '140/90', pulse: 88, temp: 98.6, spo2: 94 }
  },
  {
    id: '2',
    erNumber: 'ER-2024-157',
    uhid: 'UHID-89457',
    name: 'Jennifer Williams',
    age: 34,
    gender: 'Female',
    admissionDate: '2024-11-21',
    admissionTime: '09:15 AM',
    triageLevel: 3,
    diagnosis: 'Severe Dehydration',
    assignedWard: 'Emergency Ward B',
    bedNumber: 'EB-05',
    attendingDoctor: 'Dr. Michael Brown',
    admissionType: 'Ward',
    status: 'Stable',
    vitalSigns: { bp: '120/80', pulse: 72, temp: 99.1, spo2: 98 }
  },
  {
    id: '3',
    erNumber: 'ER-2024-158',
    uhid: 'UHID-89458',
    name: 'David Martinez',
    age: 45,
    gender: 'Male',
    admissionDate: '2024-11-21',
    admissionTime: '10:00 AM',
    triageLevel: 2,
    diagnosis: 'Head Trauma - Motor Vehicle Accident',
    assignedWard: 'Emergency ICU',
    bedNumber: 'EICU-03',
    attendingDoctor: 'Dr. Emily Davis',
    admissionType: 'ICU',
    status: 'Under Observation',
    vitalSigns: { bp: '135/85', pulse: 78, temp: 98.4, spo2: 96 }
  },
  {
    id: '4',
    erNumber: 'ER-2024-159',
    uhid: 'UHID-89459',
    name: 'Maria Garcia',
    age: 62,
    gender: 'Female',
    admissionDate: '2024-11-21',
    admissionTime: '11:30 AM',
    triageLevel: 3,
    diagnosis: 'Acute Respiratory Distress',
    assignedWard: 'Emergency Ward A',
    bedNumber: 'EA-08',
    attendingDoctor: 'Dr. James Wilson',
    admissionType: 'Ward',
    status: 'Stable',
    vitalSigns: { bp: '130/82', pulse: 85, temp: 99.8, spo2: 92 }
  }
];

const wards: Ward[] = [
  {
    id: '1',
    name: 'Emergency Ward A',
    type: 'Emergency',
    totalBeds: 20,
    occupiedBeds: 14,
    availableBeds: 6,
    status: 'Active',
    incharge: 'Nurse Alice Thompson',
    contact: '+1-555-0101'
  },
  {
    id: '2',
    name: 'Emergency Ward B',
    type: 'Emergency',
    totalBeds: 20,
    occupiedBeds: 12,
    availableBeds: 8,
    status: 'Active',
    incharge: 'Nurse Brian Cooper',
    contact: '+1-555-0102'
  },
  {
    id: '3',
    name: 'Emergency ICU',
    type: 'ICU',
    totalBeds: 10,
    occupiedBeds: 7,
    availableBeds: 3,
    status: 'Active',
    incharge: 'Nurse Catherine Lee',
    contact: '+1-555-0103'
  },
  {
    id: '4',
    name: 'Emergency Isolation',
    type: 'Emergency',
    totalBeds: 8,
    occupiedBeds: 2,
    availableBeds: 6,
    status: 'Active',
    incharge: 'Nurse Daniel Martinez',
    contact: '+1-555-0104'
  }
];

const bedDetails: BedDetail[] = [
  { id: '1', bedNumber: 'EA-01', ward: 'Emergency Ward A', floor: 'Ground Floor', type: 'Regular', status: 'Available', lastCleaned: '2024-11-21 06:00' },
  { id: '2', bedNumber: 'EA-02', ward: 'Emergency Ward A', floor: 'Ground Floor', type: 'Regular', status: 'Occupied', patientName: 'John Doe', uhid: 'UHID-89401', admissionDate: '2024-11-20' },
  { id: '3', bedNumber: 'EA-03', ward: 'Emergency Ward A', floor: 'Ground Floor', type: 'Regular', status: 'Under Cleaning' },
  { id: '4', bedNumber: 'EA-04', ward: 'Emergency Ward A', floor: 'Ground Floor', type: 'Regular', status: 'Occupied', patientName: 'Jane Smith', uhid: 'UHID-89402', admissionDate: '2024-11-21' },
  { id: '5', bedNumber: 'EA-05', ward: 'Emergency Ward A', floor: 'Ground Floor', type: 'Regular', status: 'Available', lastCleaned: '2024-11-21 07:00' },
  { id: '6', bedNumber: 'EICU-01', ward: 'Emergency ICU', floor: 'First Floor', type: 'ICU', status: 'Occupied', patientName: 'Robert Johnson', uhid: 'UHID-89456', admissionDate: '2024-11-21' },
  { id: '7', bedNumber: 'EICU-02', ward: 'Emergency ICU', floor: 'First Floor', type: 'ICU', status: 'Available', lastCleaned: '2024-11-21 05:30' },
  { id: '8', bedNumber: 'EICU-03', ward: 'Emergency ICU', floor: 'First Floor', type: 'ICU', status: 'Occupied', patientName: 'David Martinez', uhid: 'UHID-89458', admissionDate: '2024-11-21' },
  { id: '9', bedNumber: 'EB-01', ward: 'Emergency Ward B', floor: 'Ground Floor', type: 'Regular', status: 'Maintenance' },
  { id: '10', bedNumber: 'EB-02', ward: 'Emergency Ward B', floor: 'Ground Floor', type: 'Regular', status: 'Available', lastCleaned: '2024-11-21 06:45' }
];

const patientHistory: PatientHistory[] = [
  {
    id: '1',
    erNumber: 'ER-2024-100',
    uhid: 'UHID-89301',
    patientName: 'Sarah Anderson',
    visitDate: '2024-11-15',
    chiefComplaint: 'Severe abdominal pain',
    diagnosis: 'Acute Appendicitis',
    treatment: 'Emergency appendectomy performed',
    disposition: 'Admitted to Surgery Ward',
    doctor: 'Dr. Michael Brown',
    duration: '4h 30m'
  },
  {
    id: '2',
    erNumber: 'ER-2024-101',
    uhid: 'UHID-89302',
    patientName: 'Thomas Wilson',
    visitDate: '2024-11-16',
    chiefComplaint: 'Chest pain and shortness of breath',
    diagnosis: 'Unstable Angina',
    treatment: 'Cardiac monitoring, medications',
    disposition: 'Transferred to Cardiology ICU',
    doctor: 'Dr. Sarah Mitchell',
    duration: '6h 15m'
  },
  {
    id: '3',
    erNumber: 'ER-2024-102',
    uhid: 'UHID-89303',
    patientName: 'Emily Thompson',
    visitDate: '2024-11-17',
    chiefComplaint: 'High fever and severe headache',
    diagnosis: 'Viral Meningitis',
    treatment: 'IV fluids, antibiotics, observation',
    disposition: 'Admitted to Isolation Ward',
    doctor: 'Dr. James Wilson',
    duration: '3h 45m'
  },
  {
    id: '4',
    erNumber: 'ER-2024-103',
    uhid: 'UHID-89304',
    patientName: 'Christopher Lee',
    visitDate: '2024-11-18',
    chiefComplaint: 'Severe laceration from workplace accident',
    diagnosis: 'Deep laceration right forearm',
    treatment: 'Wound cleaning, suturing, tetanus shot',
    disposition: 'Discharged with follow-up',
    doctor: 'Dr. Emily Davis',
    duration: '2h 20m'
  },
  {
    id: '5',
    erNumber: 'ER-2024-104',
    uhid: 'UHID-89305',
    patientName: 'Michelle Rodriguez',
    visitDate: '2024-11-19',
    chiefComplaint: 'Suspected fracture from fall',
    diagnosis: 'Fractured left radius',
    treatment: 'X-ray, casting, pain management',
    disposition: 'Discharged with orthopedic referral',
    doctor: 'Dr. Michael Brown',
    duration: '3h 10m'
  }
];


// ============= HELPER FUNCTIONS =============

const getTriageBadgeColor = (level: number) => {
  switch (level) {
    case 1: return 'bg-red-100 text-red-800 border-red-300';
    case 2: return 'bg-orange-100 text-orange-800 border-orange-300';
    case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 4: return 'bg-green-100 text-green-800 border-green-300';
    case 5: return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Critical': return 'bg-red-100 text-red-800';
    case 'Stable': return 'bg-green-100 text-green-800';
    case 'Under Observation': return 'bg-yellow-100 text-yellow-800';
    case 'Occupied': return 'bg-blue-100 text-blue-800';
    case 'Available': return 'bg-green-100 text-green-800';
    case 'Under Cleaning': return 'bg-yellow-100 text-yellow-800';
    case 'Maintenance': return 'bg-orange-100 text-orange-800';
    case 'On Duty': return 'bg-green-100 text-green-800';
    case 'Scheduled': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-gray-100 text-gray-800';
    case 'Absent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// ============= MAIN COMPONENT =============

export function EmergencyManagement() {
  const [activeModule, setActiveModule] = useState<'admitted' | 'wards' | 'beds' | 'history' | 'roster'>('admitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdmitPatient, setShowAdmitPatient] = useState(false);
  const [showAddWard, setShowAddWard] = useState(false);
  const [showWardDetails, setShowWardDetails] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<AdmittedPatient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAmbulanceDialog, setShowAmbulanceDialog] = useState(false);
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [showVitalsManagement, setShowVitalsManagement] = useState(false);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any>(null);
  const [showUpdateVitals, setShowUpdateVitals] = useState(false);
  const [showAddBedDialog, setShowAddBedDialog] = useState(false);
  const [showEditBedDialog, setShowEditBedDialog] = useState(false);
  const [selectedBed, setSelectedBed] = useState<BedDetail | null>(null);
  const [showAddDutyDialog, setShowAddDutyDialog] = useState(false);
  const [showEditDutyDialog, setShowEditDutyDialog] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<DutyRoster | null>(null);
  const [selectedRosterDate, setSelectedRosterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rosterViewMode, setRosterViewMode] = useState<'day' | 'week'>('day');

  // Data state
  const [admittedPatients, setAdmittedPatients] = useState<AdmittedPatient[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [bedDetails, setBedDetails] = useState<BedDetail[]>([]);
  const [patientHistory, setPatientHistory] = useState<PatientHistory[]>([]);
  const [dutyRoster, setDutyRoster] = useState<DutyRoster[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Handler for transfer button
  const handleTransferClick = (patient: AdmittedPatient) => {
    console.log('handleTransferClick called with patient:', patient);
    setSelectedPatient(patient);
    setShowTransferDialog(true);
    console.log('State set - showTransferDialog should be true, selectedPatient:', patient);
  };

  // Transform API data to component format
  const transformToAdmittedPatient = (apiData: any): AdmittedPatient => ({
    id: apiData.id?.toString() || '',
    erNumber: apiData.erNumber || apiData.er_number || '',
    uhid: apiData.uhid || apiData.patient_uhid || '',
    name: apiData.name || apiData.patient_name || '',
    age: apiData.age || apiData.patient_age || 0,
    gender: (apiData.gender || apiData.patient_gender || 'Other') as 'Male' | 'Female' | 'Other',
    admissionDate: apiData.admissionDate || (apiData.arrival_time ? apiData.arrival_time.split(' ')[0] : ''),
    admissionTime: apiData.admissionTime || (apiData.arrival_time ? new Date(apiData.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''),
    triageLevel: apiData.triageLevel || apiData.triage_level || 0,
    diagnosis: apiData.diagnosis || apiData.primary_diagnosis || apiData.chief_complaint || '',
    assignedWard: apiData.assignedWard || apiData.assigned_ward_name || '',
    bedNumber: apiData.bedNumber || apiData.assigned_bed_number || '',
    attendingDoctor: apiData.attendingDoctor || apiData.doctor_name || '',
    admissionType: (apiData.admissionType || apiData.admission_type || 'Ward') as 'Ward' | 'Private Room' | 'ICU',
    status: (apiData.status || 'Stable') as 'Stable' | 'Critical' | 'Under Observation',
    vitalSigns: {
      bp: apiData.vitalSigns?.bp || apiData.vitals_bp || '',
      pulse: apiData.vitalSigns?.pulse || apiData.vitals_pulse || 0,
      temp: apiData.vitalSigns?.temp || apiData.vitals_temp || 0,
      spo2: apiData.vitalSigns?.spo2 || apiData.vitals_spo2 || 0
    },
    vitals: Array.isArray(apiData.vitals) ? apiData.vitals : [] // Preserve vitals array from API
  });

  const transformToWard = (apiData: any): Ward => ({
    id: apiData.id?.toString() || '',
    name: apiData.name || '',
    type: (apiData.type || 'General') as 'General' | 'Emergency' | 'ICU',
    totalBeds: apiData.total_beds || apiData.totalBeds || 0,
    occupiedBeds: apiData.occupied_beds || apiData.occupiedBeds || 0,
    availableBeds: apiData.available_beds || apiData.availableBeds || 0,
    status: (apiData.status || 'Active') as 'Active' | 'Maintenance',
    incharge: apiData.incharge_name || apiData.incharge || '',
    contact: apiData.contact || ''
  });

  const transformToBedDetail = (apiData: any): BedDetail & { ward_id?: string; wardId?: string } => ({
    id: apiData.id?.toString() || '',
    bedNumber: apiData.bed_number || apiData.bedNumber || '',
    ward: apiData.ward_name || apiData.ward || '',
    floor: apiData.floor_name || apiData.floor || '',
    type: (apiData.bed_type || 'Regular') as 'Regular' | 'ICU' | 'Isolation',
    status: (apiData.status || 'Available') as 'Occupied' | 'Available' | 'Under Cleaning' | 'Maintenance',
    patientName: apiData.patient_name || undefined,
    uhid: apiData.uhid || undefined,
    admissionDate: apiData.admission_date || undefined,
    lastCleaned: apiData.last_cleaned_at || undefined,
    ward_id: apiData.ward_id?.toString() || apiData.wardId?.toString() || undefined,
    wardId: apiData.ward_id?.toString() || apiData.wardId?.toString() || undefined
  });

  const transformToPatientHistory = (apiData: any): PatientHistory => ({
    id: apiData.id?.toString() || '',
    erNumber: apiData.erNumber || apiData.er_number || '',
    uhid: apiData.uhid || apiData.patient_uhid || '',
    patientName: apiData.patientName || apiData.patient_name || '',
    visitDate: apiData.visitDate || (apiData.arrival_time ? apiData.arrival_time.split(' ')[0] : ''),
    chiefComplaint: apiData.chiefComplaint || apiData.chief_complaint || '',
    diagnosis: apiData.diagnosis || apiData.primary_diagnosis || '',
    treatment: apiData.treatment || apiData.discharge_summary || '',
    disposition: apiData.disposition || '',
    doctor: apiData.doctor || apiData.doctor_name || '',
    duration: apiData.duration || ''
  });

  const transformToDutyRoster = (apiData: any): DutyRoster & { userId?: string; user_id?: string; shift_start_time?: string; shift_end_time?: string; notes?: string } => ({
    id: apiData.id?.toString() || '',
    doctorName: apiData.doctor_name || apiData.user_name || apiData.doctorName || '',
    specialization: apiData.doctor_specialty || apiData.specialization || '',
    shiftType: (apiData.shift_type || apiData.shiftType || 'Morning') as 'Morning' | 'Evening' | 'Night',
    shiftTime: apiData.shift_time || `${apiData.shift_start_time || ''} - ${apiData.shift_end_time || ''}`,
    date: apiData.date || '',
    status: (apiData.status || 'Scheduled') as 'Scheduled' | 'On Duty' | 'Completed' | 'Absent',
    contact: apiData.user_phone || apiData.contact || '',
    userId: apiData.user_id?.toString() || apiData.userId?.toString() || undefined,
    user_id: apiData.user_id?.toString() || apiData.userId?.toString() || undefined,
    shift_start_time: apiData.shift_start_time || undefined,
    shift_end_time: apiData.shift_end_time || undefined,
    notes: apiData.notes || undefined
  });

  // Load data functions
  const loadAdmittedPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getAdmittedEmergencyPatients({ search: searchQuery });
      console.log('Admitted patients data:', data); // Debug log
      if (data && Array.isArray(data)) {
        setAdmittedPatients(data.map(transformToAdmittedPatient));
      } else {
        console.warn('Expected array but got:', data);
        setAdmittedPatients([]);
      }
    } catch (error: any) {
      console.error('Error loading admitted patients:', error);
      toast.error('Failed to load admitted patients: ' + (error.message || 'Unknown error'));
      setAdmittedPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async () => {
    try {
      setLoading(true);
      const data = await api.getEmergencyWards();
      setWards(data.map(transformToWard));
    } catch (error: any) {
      toast.error('Failed to load wards: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadBedDetails = async () => {
    try {
      setLoading(true);
      // The API endpoint /api/emergency/ward-beds queries emergency_ward_beds table
      // which only contains beds from emergency_wards, so all returned beds are emergency beds
      const data = await api.getEmergencyWardBeds({ search: searchQuery });
      setBedDetails(data.map(transformToBedDetail));
    } catch (error: any) {
      toast.error('Failed to load bed details: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getEmergencyHistory({ search: searchQuery });
      setPatientHistory(data.map(transformToPatientHistory));
    } catch (error: any) {
      toast.error('Failed to load history: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadDutyRoster = async () => {
    try {
      setLoading(true);
      let data;
      if (rosterViewMode === 'week') {
        // Calculate week start and end dates
        const selectedDate = new Date(selectedRosterDate);
        const dayOfWeek = selectedDate.getDay();
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        data = await api.getEmergencyDutyRoster({ date_from: weekStartStr, date_to: weekEndStr });
      } else {
        data = await api.getEmergencyDutyRoster({ date: selectedRosterDate });
      }
      setDutyRoster(data.map(transformToDutyRoster));
    } catch (error: any) {
      toast.error('Failed to load duty roster: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Load data when module changes
  useEffect(() => {
    switch (activeModule) {
      case 'admitted':
        loadAdmittedPatients();
        break;
      case 'wards':
        loadWards();
        break;
      case 'beds':
        loadBedDetails();
        break;
      case 'history':
        loadHistory();
        break;
        case 'roster':
          loadDutyRoster();
          break;
    }
  }, [activeModule, selectedRosterDate, rosterViewMode]);

  // Reload data when search query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      switch (activeModule) {
        case 'admitted':
          loadAdmittedPatients();
          break;
        case 'beds':
          loadBedDetails();
          break;
        case 'history':
          loadHistory();
          break;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeModule]);

  // Show Admit Patient page if requested
  if (showAdmitPatient) {
    return (
      <AdmitEmergencyPatient 
        onClose={() => setShowAdmitPatient(false)}
        onAdmit={() => {
          setShowAdmitPatient(false);
          toast.success('Patient admitted successfully!');
        }}
      />
    );
  }

  // Show Add Ward page if requested
  if (showAddWard) {
    return (
      <AddEmergencyWard
        onClose={() => setShowAddWard(false)}
        onSave={() => {
          setShowAddWard(false);
          toast.success('Ward added successfully!');
        }}
      />
    );
  }

  // Show Ward Details page if requested
  if (showWardDetails) {
    return (
      <ViewWardDetails
        onClose={() => setShowWardDetails(false)}
        wardId={selectedWardId}
      />
    );
  }

  // Show Patient Details page if requested
  if (showPatientDetails) {
    return (
      <ViewEmergencyPatientDetails
        onClose={() => setShowPatientDetails(false)}
        patient={selectedPatient!}
      />
    );
  }

  // Show Edit Patient page if requested
  if (showEditPatient) {
    return (
      <EditEmergencyPatient
        onClose={() => setShowEditPatient(false)}
        patient={selectedPatient!}
        onSave={() => {
          setShowEditPatient(false);
          // Reload admitted patients to reflect changes
          if (activeModule === 'patients') {
            loadAdmittedPatients();
          }
        }}
      />
    );
  }

  // Dialogs will be rendered conditionally at the end, not as early returns

  // Show Patient Medical Records page if requested
  if (showMedicalRecords) {
    return (
      <PatientMedicalRecords
        onClose={() => setShowMedicalRecords(false)}
        patient={selectedPatient!}
      />
    );
  }

  // Show Patient Vitals Management page if requested
  if (showVitalsManagement) {
    return (
      <PatientVitalsManagement
        onClose={() => setShowVitalsManagement(false)}
        patient={selectedPatient!}
      />
    );
  }

  // Show Patient Profile page if requested
  if (showPatientProfile) {
    return (
      <EmergencyPatientProfile
        onClose={() => setShowPatientProfile(false)}
        patient={selectedPatient!}
      />
    );
  }

  // ============= RENDER ADMITTED PATIENTS =============
  
  const renderAdmittedPatients = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Admitted</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{admittedPatients.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {admittedPatients.filter(p => p.status === 'Critical').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stable</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {admittedPatients.filter(p => p.status === 'Stable').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Observation</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {admittedPatients.filter(p => p.status === 'Under Observation').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, ER number, or UHID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admitted Emergency Patients</CardTitle>
          <CardDescription>Currently admitted patients in emergency department</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ER Number</TableHead>
                <TableHead>UHID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Ward/Bed</TableHead>
                <TableHead>Triage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vital Signs</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading admitted patients...</p>
                  </TableCell>
                </TableRow>
              ) : admittedPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <p className="text-gray-600">No admitted patients found</p>
                    <p className="text-sm text-gray-500 mt-2">Patients will appear here once they are admitted to a ward</p>
                  </TableCell>
                </TableRow>
              ) : (
                admittedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.erNumber}</TableCell>
                  <TableCell>{patient.uhid}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}Y / {patient.gender}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate">{patient.diagnosis}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{patient.assignedWard}</p>
                      <p className="text-gray-600">{patient.bedNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTriageBadgeColor(patient.triageLevel)}>
                      ESI {patient.triageLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <p>BP: {patient.vitalSigns.bp}</p>
                      <p>Pulse: {patient.vitalSigns.pulse}</p>
                      <p>SpO2: {patient.vitalSigns.spo2}%</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{patient.attendingDoctor}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {/* Row 1 */}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-2.5"
                        title="Transfer Patient"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Transfer button mousedown!', patient);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Transfer button clicked!', patient);
                          handleTransferClick(patient);
                        }}
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="View Details"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Edit Patient"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowEditPatient(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Medical Records"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowMedicalRecords(true);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Bed Management"
                        onClick={() => toast.info('Managing bed allocation...')}
                      >
                        <BedDouble className="w-4 h-4" />
                      </Button>
                      
                      {/* Row 2 */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Vitals"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowVitalsManagement(true);
                        }}
                      >
                        <Heart className="w-4 h-4 text-red-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        title="Update Vitals"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowUpdateVitals(true);
                        }}
                      >
                        <Activity className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Delete Patient"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Patient Profile"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientProfile(true);
                        }}
                      >
                        <UserCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Print Records"
                        onClick={() => window.print()}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Ambulance Service"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowAmbulanceDialog(true);
                        }}
                      >
                        <Ambulance className="w-4 h-4" />
                      </Button>
                      
                      {/* Row 3 - Download */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Download Records"
                        onClick={async () => {
                          try {
                            // Generate and download patient records
                            const visitId = patient.id ? (typeof patient.id === 'string' ? parseInt(patient.id, 10) : patient.id) : null;
                            if (visitId) {
                              // This could open the patient profile with export functionality
                              setSelectedPatient(patient);
                              setShowPatientProfile(true);
                              toast.info('Use Export button in Patient Profile to download records');
                            } else {
                              toast.error('Visit ID not found');
                            }
                          } catch (error) {
                            toast.error('Failed to download records');
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER WARDS =============
  
  const renderWards = () => (
    <div className="space-y-6">
      {/* Ward Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Wards</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{wards.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Beds</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {wards.reduce((acc, ward) => acc + ward.totalBeds, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bed className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {wards.reduce((acc, ward) => acc + ward.occupiedBeds, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {wards.reduce((acc, ward) => acc + ward.availableBeds, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Ward Button */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add New Emergency Ward</h3>
                <p className="text-sm text-gray-600 mt-1">Create a new ward with comprehensive details and bed allocation</p>
              </div>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
              size="lg"
              onClick={() => setShowAddWard(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Ward
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wards.map((ward) => (
          <Card key={ward.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {ward.name}
                </CardTitle>
                <Badge className={ward.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  {ward.status}
                </Badge>
              </div>
              <CardDescription>Type: {ward.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bed Occupancy */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Bed Occupancy</span>
                  <span className="font-medium">
                    {ward.occupiedBeds}/{ward.totalBeds} ({((ward.occupiedBeds / ward.totalBeds) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress value={(ward.occupiedBeds / ward.totalBeds) * 100} className="h-2" />
              </div>

              {/* Bed Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-blue-600">{ward.occupiedBeds}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{ward.availableBeds}</p>
                </div>
              </div>

              <Separator />

              {/* Ward Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Incharge:</span>
                  <span className="font-medium">{ward.incharge}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-medium">{ward.contact}</span>
                </div>
              </div>

              <Button className="w-full" variant="outline" onClick={() => {
                setSelectedWardId(ward.id);
                setShowWardDetails(true);
              }}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============= RENDER BED DETAILS =============
  
  const renderBedDetails = () => (
    <div className="space-y-6">
      {/* Bed Statistics */}
      <div className="flex flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Beds</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{bedDetails.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {bedDetails.filter(b => b.status === 'Occupied').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {bedDetails.filter(b => b.status === 'Available').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cleaning</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {bedDetails.filter(b => b.status === 'Under Cleaning').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {bedDetails.filter(b => b.status === 'Maintenance').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bed Details Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex-shrink-0">
              <CardTitle>Emergency Bed Details</CardTitle>
              <CardDescription>Real-time bed status and allocation</CardDescription>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
              onClick={() => setShowAddBedDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bed Number</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Last Cleaned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bedDetails.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell className="font-medium">{bed.bedNumber}</TableCell>
                  <TableCell>{bed.ward}</TableCell>
                  <TableCell>{bed.floor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bed.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(bed.status)}>
                      {bed.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bed.patientName ? (
                      <div className="text-sm">
                        <p className="font-medium">{bed.patientName}</p>
                        <p className="text-gray-600">{bed.uhid}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.admissionDate || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {bed.lastCleaned || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedBed(bed);
                          setShowEditBedDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {bed.status === 'Available' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Assign
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER HISTORY =============
  
  const renderHistory = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, ER number, or diagnosis..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-blue-600" />
            Emergency Patient History
          </CardTitle>
          <CardDescription>Previous emergency department visits and outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ER Number</TableHead>
                <TableHead>UHID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Disposition</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.erNumber}</TableCell>
                  <TableCell>{record.uhid}</TableCell>
                  <TableCell>{record.patientName}</TableCell>
                  <TableCell>{record.visitDate}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate">{record.chiefComplaint}</p>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate">{record.diagnosis}</p>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <p className="truncate text-sm">{record.treatment}</p>
                  </TableCell>
                  <TableCell>{record.disposition}</TableCell>
                  <TableCell>{record.doctor}</TableCell>
                  <TableCell>{record.duration}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedHistoryRecord(record)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER EMERGENCY DUTY ROSTER =============
  
  const renderDutyRoster = () => (
    <div className="space-y-6">
      {/* Roster Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Duty Now</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {dutyRoster.filter(d => d.status === 'On Duty' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {dutyRoster.filter(d => d.status === 'Scheduled' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {dutyRoster.filter(d => rosterViewMode === 'week' || d.date === selectedRosterDate).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shift Coverage</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {(() => {
                    // Calculate shift coverage: (scheduled + on duty) / required slots * 100
                    // Assuming 2 staff per shift minimum
                    const requiredPerShift = 2;
                    const totalRequired = requiredPerShift * 3; // 3 shifts
                    const filteredRoster = rosterViewMode === 'week' 
                      ? dutyRoster 
                      : dutyRoster.filter(d => d.date === selectedRosterDate);
                    const scheduledOrOnDuty = filteredRoster.filter(d => 
                      d.status === 'Scheduled' || d.status === 'On Duty'
                    ).length;
                    const coverage = totalRequired > 0 
                      ? Math.round((scheduledOrOnDuty / totalRequired) * 100) 
                      : 0;
                    return `${Math.min(coverage, 100)}%`;
                  })()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label>Select Date:</Label>
            <Input 
              type="date" 
              className="w-[200px]" 
              value={selectedRosterDate}
              onChange={(e) => {
                setSelectedRosterDate(e.target.value);
                setRosterViewMode('day');
              }}
            />
            <Button 
              variant={rosterViewMode === 'week' ? 'default' : 'outline'}
              onClick={() => {
                setRosterViewMode(rosterViewMode === 'week' ? 'day' : 'week');
              }}
            >
              <CalendarClock className="w-4 h-4 mr-2" />
              {rosterViewMode === 'week' ? 'View Day' : 'View Week'}
            </Button>
            <Button 
              variant="outline" 
              className="ml-auto"
              onClick={() => setShowAddDutyDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Duty
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duty Roster by Shift */}
      <div className="space-y-4">
        {/* Morning Shift */}
        <Card>
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              Morning Shift (06:00 AM - 02:00 PM)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dutyRoster.filter(d => d.shiftType === 'Morning' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No staff scheduled for Morning shift
                    </TableCell>
                  </TableRow>
                ) : (
                  dutyRoster.filter(d => d.shiftType === 'Morning' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell className="font-medium">{duty.doctorName}</TableCell>
                      <TableCell>{duty.specialization}</TableCell>
                      <TableCell>{duty.contact}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(duty.status)}>
                          {duty.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDuty(duty);
                              setShowEditDutyDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (duty.contact) {
                                window.open(`tel:${duty.contact}`, '_self');
                              } else {
                                toast.error('Contact number not available');
                              }
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Evening Shift */}
        <Card>
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              Evening Shift (02:00 PM - 10:00 PM)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dutyRoster.filter(d => d.shiftType === 'Evening' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No staff scheduled for Evening shift
                    </TableCell>
                  </TableRow>
                ) : (
                  dutyRoster.filter(d => d.shiftType === 'Evening' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell className="font-medium">{duty.doctorName}</TableCell>
                      <TableCell>{duty.specialization}</TableCell>
                      <TableCell>{duty.contact}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(duty.status)}>
                          {duty.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDuty(duty);
                              setShowEditDutyDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (duty.contact) {
                                window.open(`tel:${duty.contact}`, '_self');
                              } else {
                                toast.error('Contact number not available');
                              }
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Night Shift */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              Night Shift (10:00 PM - 06:00 AM)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dutyRoster.filter(d => d.shiftType === 'Night' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No staff scheduled for Night shift
                    </TableCell>
                  </TableRow>
                ) : (
                  dutyRoster.filter(d => d.shiftType === 'Night' && (rosterViewMode === 'week' || d.date === selectedRosterDate)).map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell className="font-medium">{duty.doctorName}</TableCell>
                      <TableCell>{duty.specialization}</TableCell>
                      <TableCell>{duty.contact}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(duty.status)}>
                          {duty.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDuty(duty);
                              setShowEditDutyDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (duty.contact) {
                                window.open(`tel:${duty.contact}`, '_self');
                              } else {
                                toast.error('Contact number not available');
                              }
                            }}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============= MAIN RENDER =============

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ambulance className="w-8 h-8 text-red-600" />
            Emergency Department
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete emergency patient management and department operations
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAdmitPatient(true)}
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Admit Patient
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeModule} onValueChange={(value: any) => setActiveModule(value)}>
        <TabsList className="flex w-full">
          <TabsTrigger value="admitted" className="flex items-center gap-2 flex-1">
            <Users className="w-4 h-4" />
            Admitted Patients
          </TabsTrigger>
          <TabsTrigger value="wards" className="flex items-center gap-2 flex-1">
            <Building2 className="w-4 h-4" />
            Wards
          </TabsTrigger>
          <TabsTrigger value="beds" className="flex items-center gap-2 flex-1">
            <Bed className="w-4 h-4" />
            Bed Details
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 flex-1">
            <HistoryIcon className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="roster" className="flex items-center gap-2 flex-1">
            <CalendarClock className="w-4 h-4" />
            Emergency Duty Roster
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admitted" className="mt-6">
          {renderAdmittedPatients()}
        </TabsContent>

        <TabsContent value="wards" className="mt-6">
          {renderWards()}
        </TabsContent>

        <TabsContent value="beds" className="mt-6">
          {renderBedDetails()}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {renderHistory()}
        </TabsContent>

        <TabsContent value="roster" className="mt-6">
          {renderDutyRoster()}
        </TabsContent>
      </Tabs>

      {/* Emergency History Detail Modal */}
      {selectedHistoryRecord && (
        <EmergencyHistoryDetail
          record={selectedHistoryRecord}
          onClose={() => setSelectedHistoryRecord(null)}
        />
      )}

      {/* Update Vitals Dialog */}
      {showUpdateVitals && selectedPatient && (() => {
        // Get visit ID - check multiple possible fields
        const vid = selectedPatient.id || selectedPatient.visitId || selectedPatient.emergency_visit_id;
        const visitId = vid ? (typeof vid === 'string' ? parseInt(vid, 10) : vid) : null;
        
        if (!visitId) {
          toast.error('Visit ID not found. Cannot update vitals.');
          return null;
        }
        
        return (
          <UpdateVitalsDialog
            patient={selectedPatient}
            visitId={visitId}
            onClose={() => setShowUpdateVitals(false)}
            onSave={() => {
              setShowUpdateVitals(false);
              toast.success('Vitals updated successfully!');
              loadAdmittedPatients();
            }}
          />
        );
      })()}

      {/* Transfer Patient Dialog */}
      {showTransferDialog && selectedPatient && (
        <>
          {console.log('Rendering TransferPatientDialog - showTransferDialog:', showTransferDialog, 'selectedPatient:', selectedPatient)}
          <TransferPatientDialog
            onClose={() => {
              setShowTransferDialog(false);
            }}
            patient={selectedPatient}
            onTransfer={() => {
              console.log('Dialog onTransfer called');
              setShowTransferDialog(false);
              toast.success('Patient transferred successfully!');
              loadAdmittedPatients();
            }}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedPatient && (
        <DeleteConfirmationDialog
          onClose={() => setShowDeleteDialog(false)}
          patient={selectedPatient}
          onDelete={() => {
            setShowDeleteDialog(false);
            toast.success('Patient record deleted successfully!');
            loadAdmittedPatients();
          }}
        />
      )}

      {/* Ambulance Request Dialog */}
      {showAmbulanceDialog && selectedPatient && (
        <AmbulanceRequestDialog
          onClose={() => setShowAmbulanceDialog(false)}
          patient={selectedPatient}
          onRequest={() => {
            setShowAmbulanceDialog(false);
            toast.success('Ambulance requested successfully!');
          }}
        />
      )}

      {/* Add Bed Dialog */}
      {showAddBedDialog && (
        <AddEmergencyBedDialog
          onClose={() => setShowAddBedDialog(false)}
          onSave={() => {
            setShowAddBedDialog(false);
            loadBedDetails();
            toast.success('Bed added successfully!');
          }}
        />
      )}

      {/* Edit Bed Dialog */}
      {showEditBedDialog && selectedBed && (
        <EditEmergencyBedDialog
          bed={selectedBed}
          onClose={() => {
            setShowEditBedDialog(false);
            setSelectedBed(null);
          }}
          onSave={() => {
            setShowEditBedDialog(false);
            setSelectedBed(null);
            loadBedDetails();
            toast.success('Bed updated successfully!');
          }}
        />
      )}

      {/* Add Duty Dialog */}
      {showAddDutyDialog && (
        <AddDutyDialog
          onClose={() => setShowAddDutyDialog(false)}
          onSave={() => {
            setShowAddDutyDialog(false);
            loadDutyRoster();
          }}
          defaultDate={selectedRosterDate}
        />
      )}

      {/* Edit Duty Dialog */}
      {showEditDutyDialog && selectedDuty && (
        <EditDutyDialog
          duty={selectedDuty}
          onClose={() => {
            setShowEditDutyDialog(false);
            setSelectedDuty(null);
          }}
          onSave={() => {
            setShowEditDutyDialog(false);
            setSelectedDuty(null);
            loadDutyRoster();
          }}
          onDelete={() => {
            setShowEditDutyDialog(false);
            setSelectedDuty(null);
            loadDutyRoster();
          }}
        />
      )}
    </div>
  );
}