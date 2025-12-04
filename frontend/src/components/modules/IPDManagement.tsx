/**
 * Advanced IPD (In-Patient Department) Management System
 * 
 * Features:
 * - Complete admission & discharge workflow
 * - Multi-ward & bed management
 * - Real-time bed occupancy tracking
 * - Patient care plans & daily rounds
 * - Treatment & medication orders
 * - IPD billing with auto-calculation
 * - Vital signs monitoring
 * - Nursing notes & observations
 * - Doctor consultation tracking
 * - Discharge summary generation
 * - Transfer management
 * - Insurance & TPA integration
 * - Advanced analytics & reporting
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { WardBedView } from './WardBedView';
import IndoorDutyRoster from './IndoorDutyRoster';
import BirthCertificates from './BirthCertificates';
import DeathCertificates from './DeathCertificates';
import IpdReportsListing from '../IpdReportsListing';
import {
  Bed,
  Building2,
  Users,
  Activity,
  Stethoscope,
  Pill,
  FlaskConical,
  Calendar,
  Clock,
  DollarSign,
  IndianRupee,
  FileText,
  Printer,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  BarChart3,
  PieChart,
  Heart,
  Thermometer,
  Droplet,
  Wind,
  Zap,
  Shield,
  ClipboardList,
  Clipboard,
  UserCheck,
  Bell,
  Settings,
  RefreshCw,
  Send,
  Share2,
  Copy,
  CheckCheck,
  AlertCircle,
  CircleCheckBig,
  Info,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,
  TrendingDown as Oxygen,
  Activity as ECG,
  Gauge,
  Hospital,
  Syringe,
  Bandage,
  Ambulance,
  User,
  Archive,
  RotateCcw,
  Home,
  PersonStanding,
  Loader2,
  X,
  UserPlus,
  FileDown
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { api, IPDAdmission, IPDWard, IPDBed, IPDRoom, IPDTransfer, IPDDashboardStats, IPDVitalSign, IPDTreatmentOrder, IPDNursingNote, IPDDischargeSummary, IPDBilling, CreateIPDTransferData, CreateIPDRehabilitationRequestData } from '../../services/api';

// ============= INTERFACES =============

interface Ward {
  id: string;
  name: string;
  floor: number;
  type: 'General' | 'ICU' | 'NICU' | 'PICU' | 'CCU' | 'HDU' | 'Isolation' | 'Private' | 'Deluxe';
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  nurseInCharge: string;
  contactNumber: string;
  facilities: string[];
  status: 'active' | 'maintenance' | 'closed';
}

interface BedDetails {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  type: 'General' | 'ICU' | 'Private' | 'Deluxe' | 'Isolation';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
  patientId?: string;
  patientName?: string;
  admissionDate?: string;
  dailyRate: number;
  facilities: string[];
}

interface IPDPatient {
  id: string;
  ipdNumber: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  emergencyContact: string;
  address: string;
  admissionDate: string;
  admissionTime: string;
  admittedBy: string;
  consultingDoctor: string;
  department: string;
  wardName: string;
  bedNumber: string;
  diagnosis: string;
  admissionType: 'Emergency' | 'Planned' | 'Transfer' | 'Referral';
  status: 'admitted' | 'under-treatment' | 'critical' | 'stable' | 'discharged' | 'absconded';
  insurance?: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    approvalNumber?: string;
  };
  estimatedDuration: number; // days
  actualDuration?: number;
  totalCharges: number;
  paidAmount: number;
  dueAmount: number;
}

interface VitalSigns {
  id: string;
  patientId: string;
  recordedDate: string;
  recordedTime: string;
  recordedBy: string;
  temperature: number; // Celsius
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number; // bpm
  respiratoryRate: number; // per minute
  oxygenSaturation: number; // percentage
  bloodSugar?: number; // mg/dL
  painScore?: number; // 0-10
  consciousness: 'Alert' | 'Drowsy' | 'Confused' | 'Unconscious';
  notes?: string;
}

interface TreatmentOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderDate: string;
  orderTime: string;
  orderedBy: string;
  orderType: 'Medication' | 'Procedure' | 'Lab Test' | 'Imaging' | 'Diet' | 'Physiotherapy' | 'Consultation';
  orderDetails: string;
  frequency?: string;
  duration?: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  startDate?: string;
  endDate?: string;
  administeredBy?: string;
  notes?: string;
}

interface NursingNote {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  shift: 'Morning' | 'Evening' | 'Night';
  nurseName: string;
  category: 'General' | 'Medication' | 'Vital Signs' | 'Procedure' | 'Incident' | 'Assessment';
  note: string;
  severity?: 'low' | 'medium' | 'high';
}

// IPDBilling interface is imported from api.ts

interface DischargeSummary {
  id: string;
  patientId: string;
  patientName: string;
  ipdNumber: string;
  admissionDate: string;
  dischargeDate: string;
  lengthOfStay: number;
  admittingDiagnosis: string;
  finalDiagnosis: string;
  treatmentGiven: string;
  proceduresPerformed: string[];
  conditionAtDischarge: 'Improved' | 'Stable' | 'Critical' | 'Expired' | 'LAMA';
  dischargeAdvice: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  followUpDate?: string;
  followUpDoctor?: string;
  dietaryAdvice?: string;
  activityRestrictions?: string;
  dischargingDoctor: string;
}

// ============= MAIN COMPONENT =============

export function IPDManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<IPDPatient | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [isAdmissionDialogOpen, setIsAdmissionDialogOpen] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState<IPDAdmission | null>(null);
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isNursingNoteDialogOpen, setIsNursingNoteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Ward/Bed/Room Dialog States
  const [isWardDialogOpen, setIsWardDialogOpen] = useState(false);
  const [isBedDialogOpen, setIsBedDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<IPDWard | null>(null);
  const [editingBed, setEditingBed] = useState<IPDBed | null>(null);
  const [editingRoom, setEditingRoom] = useState<IPDRoom | null>(null);
  
  // API Data States
  const [dashboardStats, setDashboardStats] = useState<IPDDashboardStats | null>(null);
  const [admissions, setAdmissions] = useState<IPDAdmission[]>([]);
  const [wards, setWards] = useState<IPDWard[]>([]);
  const [beds, setBeds] = useState<IPDBed[]>([]);
  const [rooms, setRooms] = useState<IPDRoom[]>([]);
  const [transfers, setTransfers] = useState<IPDTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Patient Details Data States
  const [vitalSigns, setVitalSigns] = useState<IPDVitalSign[]>([]);
  const [treatmentOrders, setTreatmentOrders] = useState<IPDTreatmentOrder[]>([]);
  const [nursingNotes, setNursingNotes] = useState<IPDNursingNote[]>([]);
  const [billing, setBilling] = useState<IPDBilling | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IPDBed[]>([]);
  
  // Additional Patient Tab Data States
  const [dailyCareOrders, setDailyCareOrders] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [radiologyOrders, setRadiologyOrders] = useState<any[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<any[]>([]);
  const [pharmacistNotes, setPharmacistNotes] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [nutrition, setNutrition] = useState<any[]>([]);
  const [intakeOutput, setIntakeOutput] = useState<any[]>([]);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [healthPhysicalHabit, setHealthPhysicalHabit] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [doctorRecommendations, setDoctorRecommendations] = useState<any[]>([]);
  const [doctorConsultations, setDoctorConsultations] = useState<any[]>([]);
  
  // Dialog States for Patient Tabs
  const [isDailyCareOrderDialogOpen, setIsDailyCareOrderDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isLabOrderDialogOpen, setIsLabOrderDialogOpen] = useState(false);
  const [isRadiologyOrderDialogOpen, setIsRadiologyOrderDialogOpen] = useState(false);
  const [isDoctorNoteDialogOpen, setIsDoctorNoteDialogOpen] = useState(false);
  const [isPharmacistNoteDialogOpen, setIsPharmacistNoteDialogOpen] = useState(false);
  const [isProcedureDialogOpen, setIsProcedureDialogOpen] = useState(false);
  const [isNutritionDialogOpen, setIsNutritionDialogOpen] = useState(false);
  const [isIntakeOutputDialogOpen, setIsIntakeOutputDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isHealthPhysicalDialogOpen, setIsHealthPhysicalDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDoctorRecommendationDialogOpen, setIsDoctorRecommendationDialogOpen] = useState(false);
  const [isDoctorConsultationDialogOpen, setIsDoctorConsultationDialogOpen] = useState(false);
  
  // Editing States
  const [editingDailyCareOrder, setEditingDailyCareOrder] = useState<any>(null);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [editingLabOrder, setEditingLabOrder] = useState<any>(null);
  const [editingRadiologyOrder, setEditingRadiologyOrder] = useState<any>(null);
  const [editingDoctorNote, setEditingDoctorNote] = useState<any>(null);
  const [editingPharmacistNote, setEditingPharmacistNote] = useState<any>(null);
  const [editingProcedure, setEditingProcedure] = useState<any>(null);
  const [editingNutrition, setEditingNutrition] = useState<any>(null);
  const [editingIntakeOutput, setEditingIntakeOutput] = useState<any>(null);
  const [editingVital, setEditingVital] = useState<any>(null);
  
  // Disposition States
  const [activeDispositionTab, setActiveDispositionTab] = useState('pending');
  const [dispositionType, setDispositionType] = useState('all');
  const [dispositionSearchQuery, setDispositionSearchQuery] = useState('');
  
  // Advanced Filters States
  const [isAdvancedFiltersDialogOpen, setIsAdvancedFiltersDialogOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all',
    department: 'all',
    ward: 'all',
    doctor: 'all',
  });
  
  // Notifications and Settings States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  // Rehabilitation Requests States
  const [rehabilitationRequests, setRehabilitationRequests] = useState<any[]>([]);
  const [rehabilitationStats, setRehabilitationStats] = useState({
    activePatients: 0,
    pendingRequests: 0,
    todaysSessions: 0,
    completed: 0
  });
  const [loadingRehabilitation, setLoadingRehabilitation] = useState(false);
  const [isNewRehabilitationDialogOpen, setIsNewRehabilitationDialogOpen] = useState(false);
  const [isViewRehabilitationDialogOpen, setIsViewRehabilitationDialogOpen] = useState(false);
  const [isEditRehabilitationDialogOpen, setIsEditRehabilitationDialogOpen] = useState(false);
  const [selectedRehabilitationRequest, setSelectedRehabilitationRequest] = useState<any>(null);
  
  // Admission Requests States
  const [admissionRequests, setAdmissionRequests] = useState<any[]>([]);
  const [admissionRequestStats, setAdmissionRequestStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejected: 0,
    urgent: 0
  });
  const [loadingAdmissionRequests, setLoadingAdmissionRequests] = useState(false);
  
  // Bed Management States
  const [bedSearchQuery, setBedSearchQuery] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isAllocateBedDialogOpen, setIsAllocateBedDialogOpen] = useState(false);
  const [isCreateBedDialogOpen, setIsCreateBedDialogOpen] = useState(false);
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState<IPDBed | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedAdmissionForTransfer, setSelectedAdmissionForTransfer] = useState<IPDAdmission | null>(null);
  const [isAllocateRoomDialogOpen, setIsAllocateRoomDialogOpen] = useState(false);
  const [selectedRoomForAllocation, setSelectedRoomForAllocation] = useState<IPDRoom | null>(null);
  
  // Private Room Management States
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>('all');
  
  // Patient Details Navigation States
  const [activePatientTab, setActivePatientTab] = useState<string>('daily-patient-care-order');
  const [activePatientSubTab, setActivePatientSubTab] = useState<string>('details');
  
  // Load dashboard data
  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadDashboardData();
    }
  }, [activeSection]);
  
  // Load admissions data
  useEffect(() => {
    if (activeSection === 'admissions') {
      loadAdmissions();
    }
  }, [activeSection, searchQuery]);
  
  // Load wards data
  useEffect(() => {
    if (activeSection === 'wards' || activeSection === 'ward-beds') {
      loadWards();
    }
  }, [activeSection]);
  
  // Load beds data
  useEffect(() => {
    if (activeSection === 'beds') {
      loadBeds();
    }
  }, [activeSection]);
  
  // Load rooms data
  useEffect(() => {
    if (activeSection === 'private-rooms') {
      loadRooms();
    }
  }, [activeSection]);
  
  // Load transfer history
  useEffect(() => {
    if (activeSection === 'transfer-history') {
      loadTransferHistory();
    }
  }, [activeSection]);
  
  // Load patient details data when patient is selected
  useEffect(() => {
    if (selectedPatient?.id && activeSection === 'patient-details') {
      loadPatientDetailsData();
    }
  }, [selectedPatient?.id, activeSection]); // Only depend on patient ID, not the whole object
  
  // Note: AdmissionDialog now loads its own real-time data
  
  // Filtered admissions - memoized at top level to avoid hooks violation
  const filteredAdmissions = useMemo(() => {
    return admissions.filter(admission => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          admission.patient_name?.toLowerCase().includes(query) ||
          admission.ipd_number?.toLowerCase().includes(query) ||
          admission.uhid?.toLowerCase().includes(query) ||
          admission.patient_contact?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Advanced filters
      if (advancedFilters.status !== 'all' && admission.status !== advancedFilters.status) return false;
      if (advancedFilters.department !== 'all' && admission.department !== advancedFilters.department) return false;
      if (advancedFilters.ward !== 'all') {
        const wardId = wards.find(w => w.name === admission.ward_name)?.id;
        if (String(wardId) !== advancedFilters.ward) return false;
      }
      if (advancedFilters.doctor !== 'all') {
        const doctorId = doctors.find(d => d.name === admission.consulting_doctor_name)?.id;
        if (String(doctorId) !== advancedFilters.doctor) return false;
      }
      if (advancedFilters.dateFrom && admission.admission_date) {
        if (new Date(admission.admission_date) < new Date(advancedFilters.dateFrom)) return false;
      }
      if (advancedFilters.dateTo && admission.admission_date) {
        if (new Date(admission.admission_date) > new Date(advancedFilters.dateTo)) return false;
      }
      
      return true;
    });
  }, [admissions, searchQuery, advancedFilters, wards, doctors]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIPDDashboardStats();
      setDashboardStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadAdmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      const data = await api.getIPDAdmissions(filters);
      setAdmissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load admissions');
      toast.error('Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };
  
  const loadWards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIPDWards();
      setWards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wards');
      toast.error('Failed to load wards');
    } finally {
      setLoading(false);
    }
  };
  
  const loadBeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIPDBeds();
      setBeds(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load beds');
      toast.error('Failed to load beds');
    } finally {
      setLoading(false);
    }
  };
  
  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIPDRooms();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };
  
  const loadTransferHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all admissions and their transfers
      const allAdmissions = await api.getIPDAdmissions();
      const allTransfers: IPDTransfer[] = [];
      for (const admission of allAdmissions) {
        if (admission.id) {
          const admissionTransfers = await api.getIPDTransfers(admission.id);
          allTransfers.push(...admissionTransfers);
        }
      }
      setTransfers(allTransfers);
    } catch (err: any) {
      setError(err.message || 'Failed to load transfer history');
      toast.error('Failed to load transfer history');
    } finally {
      setLoading(false);
    }
  };
  
  const loadPatientDetailsData = async () => {
    if (!selectedPatient?.id) return;
    
    try {
      setLoading(true);
      const admissionId = parseInt(selectedPatient.id);
      
      // Load all patient details in parallel
      const [
        vitals, 
        orders, 
        notes, 
        billingData,
        dailyCareOrders,
        medications,
        labOrders,
        radiologyOrders,
        doctorNotes,
        pharmacistNotes,
        procedures,
        nutrition,
        intakeOutput,
        patientFiles,
        healthPhysicalHabit,
        forms,
        doctorRecommendations,
        doctorConsultations
      ] = await Promise.all([
        api.getIPDVitals(admissionId).catch(() => []),
        api.getIPDTreatmentOrders(admissionId).catch(() => []),
        api.getIPDNursingNotes(admissionId).catch(() => []),
        api.getIPDBilling(admissionId).catch(() => null),
        api.getIPDDailyCareOrders(admissionId).catch(() => []),
        api.getIPDMedications(admissionId).catch(() => []),
        api.getIPDLabOrders(admissionId).catch(() => []),
        api.getIPDRadiologyOrders(admissionId).catch(() => []),
        api.getIPDDoctorNotes(admissionId).catch(() => []),
        api.getIPDPharmacistNotes(admissionId).catch(() => []),
        api.getIPDProcedures(admissionId).catch(() => []),
        api.getIPDNutrition(admissionId).catch(() => []),
        api.getIPDIntakeOutput(admissionId).catch(() => []),
        api.getIPDPatientFiles(admissionId).catch(() => []),
        api.getIPDHealthPhysicalHabits(admissionId).catch(() => []),
        api.getIPDForms(admissionId).catch(() => []),
        api.getIPDDoctorRecommendations(admissionId).catch(() => []),
        api.getIPDDoctorConsultations(admissionId).catch(() => [])
      ]);
      
      setVitalSigns(vitals);
      setTreatmentOrders(orders);
      setNursingNotes(notes);
      setBilling(billingData);
      setDailyCareOrders(dailyCareOrders);
      setMedications(medications);
      setLabOrders(labOrders);
      setRadiologyOrders(radiologyOrders);
      setDoctorNotes(doctorNotes);
      setPharmacistNotes(pharmacistNotes);
      setProcedures(procedures);
      setNutrition(nutrition);
      setIntakeOutput(intakeOutput);
      setPatientFiles(patientFiles);
      setHealthPhysicalHabit(healthPhysicalHabit);
      setForms(forms);
      setDoctorRecommendations(doctorRecommendations);
      setDoctorConsultations(doctorConsultations);
      
      // Update patient billing totals if billing data exists
      // Note: We avoid updating selectedPatient here to prevent infinite loop
      // Billing totals are displayed directly from billingData state
    } catch (err: any) {
      console.error('Failed to load patient details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors({ status: 'Available' });
      setDoctors(data);
    } catch (err: any) {
      console.error('Failed to load doctors:', err);
    }
  };
  
  const loadAvailableBeds = async () => {
    try {
      const data = await api.getAvailableIPDBeds();
      setAvailableBeds(data);
    } catch (err: any) {
      console.error('Failed to load available beds:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
      case 'completed':
      case 'available':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'critical':
      case 'urgent':
      case 'stat':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under-treatment':
      case 'in-progress':
      case 'occupied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admitted':
      case 'pending':
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discharged':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ============= DASHBOARD =============
  const renderDashboard = () => {
    const stats = dashboardStats?.stats || {
      current_patients: 0,
      critical_patients: 0,
      today_admissions: 0,
      pending_discharges: 0,
      total_beds: 0,
      available_beds: 0,
      total_rooms: 0,
      available_rooms: 0
    };
    
    // Combine admission and discharge trends
    const admissionTrend = dashboardStats?.admission_trend?.map((admission, index) => {
      const discharge = dashboardStats?.discharge_trend?.[index];
      return {
        date: admission.date,
        admissions: admission.admissions,
        discharges: discharge?.discharges || 0
      };
    }) || [];

    // Format department data for pie chart
    const departmentData = dashboardStats?.department_distribution?.map(dept => ({
      name: dept.department,
      value: dept.patient_count,
      patients: dept.patient_count
    })) || [];

    const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#9B51E0', '#EB5757', '#6FCF97'];

    // Use wards from dashboard stats or state
    const wardsForOccupancy = dashboardStats?.wards || wards;
    const occupancyData = wardsForOccupancy.map(ward => {
      const occupiedBeds = ward.occupied_beds || 0;
      const totalBeds = ward.total_beds || 0;
      const availableBeds = totalBeds - occupiedBeds;
      return {
        name: ward.name || '',
        occupied: occupiedBeds,
        available: availableBeds,
        occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0'
      };
    });

    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">IPD Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time overview of in-patient department</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  const XLSX = await import('xlsx');
                  const exportData = [
                    { 'Metric': 'Total Admissions', 'Value': dashboardStats?.total_admissions || 0 },
                    { 'Metric': 'Current Patients', 'Value': dashboardStats?.current_patients || 0 },
                    { 'Metric': 'Total Beds', 'Value': dashboardStats?.total_beds || 0 },
                    { 'Metric': 'Occupied Beds', 'Value': dashboardStats?.occupied_beds || 0 },
                    { 'Metric': 'Available Beds', 'Value': dashboardStats?.available_beds || 0 },
                    { 'Metric': 'Occupancy Rate', 'Value': `${dashboardStats?.occupancy_rate || 0}%` },
                    { 'Metric': 'Today Admissions', 'Value': dashboardStats?.today_admissions || 0 },
                    { 'Metric': 'Today Discharges', 'Value': dashboardStats?.today_discharges || 0 },
                  ];
                  
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Stats');
                  
                  const fileName = `IPD_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`;
                  XLSX.writeFile(wb, fileName);
                  toast.success('Dashboard data exported successfully!');
                } catch (error: any) {
                  toast.error('Failed to export: ' + (error.message || 'Unknown error'));
                }
              }}
              disabled={!dashboardStats}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Top Header Bar with Quick Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bed className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Beds</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : `${stats.available_beds}/${stats.total_beds}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Patients</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : stats.critical_patients}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Admissions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : stats.today_admissions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Discharges</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : stats.pending_discharges}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-200" />
              </div>
              <h3 className="text-4xl font-bold mb-1">{loading ? '...' : stats.current_patients}</h3>
              <p className="text-sm text-blue-100">Current IPD Patients</p>
              {!loading && <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Active admissions
              </p>}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-green-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bed className="w-7 h-7" />
                </div>
                {stats.total_beds > 0 && (
                  <Badge className="bg-white/20 text-white backdrop-blur-sm">
                    {((stats.total_beds - stats.available_beds) / stats.total_beds * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <h3 className="text-4xl font-bold mb-1">
                {loading ? '...' : `${stats.total_beds - stats.available_beds}/${stats.total_beds}`}
              </h3>
              <p className="text-sm text-green-100">Bed Occupancy</p>
              <p className="text-xs text-green-200 mt-2">
                {loading ? '...' : `${stats.available_beds} beds available`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-orange-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                {stats.critical_patients > 0 && (
                  <Badge className="bg-red-500/80 text-white backdrop-blur-sm animate-pulse">Critical</Badge>
                )}
              </div>
              <h3 className="text-4xl font-bold mb-1">{loading ? '...' : stats.critical_patients}</h3>
              <p className="text-sm text-orange-100">Critical Patients</p>
              {!loading && <p className="text-xs text-orange-200 mt-2">Requires monitoring</p>}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <IndianRupee className="w-7 h-7" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-200" />
              </div>
              <h3 className="text-4xl font-bold mb-1">{loading ? '...' : 'N/A'}</h3>
              <p className="text-sm text-purple-100">IPD Revenue (Today)</p>
              <p className="text-xs text-purple-200 mt-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Revenue tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admission Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admission & Discharge Trend</CardTitle>
                  <CardDescription>Last 7 days activity</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const XLSX = await import('xlsx');
                      const exportData = admissions.map(admission => ({
                        'IPD Number': admission.ipd_number || '',
                        'Patient Name': admission.patient_name || '',
                        'Age': admission.patient_age || '',
                        'Gender': admission.patient_gender || '',
                        'Contact': admission.patient_contact || '',
                        'Admission Date': admission.admission_date || '',
                        'Admission Time': admission.admission_time || '',
                        'Ward': admission.ward_name || '',
                        'Bed': admission.bed_number || '',
                        'Room': admission.room_number || '',
                        'Doctor': admission.consulting_doctor_name || '',
                        'Department': admission.department || '',
                        'Diagnosis': admission.diagnosis || '',
                        'Status': admission.status || '',
                      }));
                      
                      const ws = XLSX.utils.json_to_sheet(exportData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Admissions');
                      
                      const fileName = `IPD_Admissions_${new Date().toISOString().split('T')[0]}.xlsx`;
                      XLSX.writeFile(wb, fileName);
                      toast.success('Admissions data exported successfully!');
                    } catch (error: any) {
                      toast.error('Failed to export: ' + (error.message || 'Unknown error'));
                    }
                  }}
                  disabled={admissions.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={admissionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="admissions" stackId="1" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="discharges" stackId="2" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Department-wise Distribution</CardTitle>
                  <CardDescription>Current patient distribution</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveSection('admissions')}>
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.patients}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ward Occupancy */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Ward-wise Bed Occupancy</CardTitle>
            <CardDescription>Real-time occupancy status across all wards</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {occupancyData.map((ward, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{ward.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {ward.occupied} / {ward.occupied + ward.available} beds
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {ward.occupancyRate}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={parseFloat(ward.occupancyRate)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsAdmissionDialogOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">New Admission</h3>
                  <p className="text-sm text-gray-600">Admit new patient</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('wards')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Ward Management</h3>
                  <p className="text-sm text-gray-600">Manage wards & beds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('reports')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics & Reports</h3>
                  <p className="text-sm text-gray-600">View detailed reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ============= ADMISSIONS LIST =============
  const renderAdmissions = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">IPD Admissions</h2>
            <p className="text-sm text-gray-600 mt-1">Manage in-patient admissions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAdmissionDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by patient name, IPD number, UHID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-wards">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-wards">All Wards</SelectItem>
                  {wards.map(ward => (
                    <SelectItem key={ward.id} value={ward.id?.toString() || ''}>{ward.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setIsAdvancedFiltersDialogOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card className="border-0 shadow-sm">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IPD No. / MRN / UHID</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Ward/Bed</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Admission</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charges</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">Loading...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-red-500">{error}</TableCell>
                  </TableRow>
                ) : filteredAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">No admissions found</TableCell>
                  </TableRow>
                ) : (
                  filteredAdmissions.map((patient) => {
                    const patientObj: IPDPatient = {
                      id: patient.id?.toString() || '',
                      ipdNumber: patient.ipd_number || '',
                      uhid: patient.uhid || '',
                      patientName: patient.patient_name || '',
                      age: patient.patient_age || 0,
                      gender: (patient.patient_gender as any) || 'other',
                      contactNumber: patient.patient_contact || '',
                      emergencyContact: patient.patient_emergency_contact || '',
                      address: patient.patient_address || '',
                      admissionDate: patient.admission_date || '',
                      admissionTime: patient.admission_time || '',
                      admittedBy: patient.admitted_by_name || '',
                      consultingDoctor: patient.consulting_doctor_name || '',
                      department: patient.department || '',
                      wardName: patient.ward_name || '',
                      bedNumber: patient.bed_number || '',
                      diagnosis: patient.diagnosis || '',
                      admissionType: (patient.admission_type as any) || 'Emergency',
                      status: (patient.status as any) || 'admitted',
                      insurance: patient.insurance_provider ? {
                        provider: patient.insurance_provider,
                        policyNumber: patient.insurance_policy_number || '',
                        coverageAmount: patient.insurance_coverage_amount || 0,
                        approvalNumber: patient.insurance_approval_number || undefined
                      } : undefined,
                      estimatedDuration: patient.estimated_duration || 0,
                      actualDuration: patient.actual_duration || undefined,
                      totalCharges: 0, // Will be loaded from billing
                      paidAmount: 0,
                      dueAmount: 0
                    };
                    
                    return (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="text-blue-600 font-medium">{patientObj.ipdNumber || 'N/A'}</p>
                        <p className="text-xs text-gray-600">MRN: {patient.patient_id || patient.mrn || 'N/A'}</p>
                        <p className="text-xs text-gray-500">UHID: {patientObj.uhid || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{patientObj.patientName}</p>
                        <p className="text-xs text-gray-500">{patientObj.age}Y / {patientObj.gender}</p>
                        <p className="text-xs text-gray-500">{patientObj.contactNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {patientObj.wardName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {patientObj.bedNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{patientObj.consultingDoctor}</p>
                      <p className="text-xs text-gray-500">{patientObj.department}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{patientObj.admissionDate}</p>
                        <p className="text-xs text-gray-500">{patientObj.admissionTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patientObj.actualDuration || 0} days</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(patientObj.status)}>
                        {patientObj.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">₹{patientObj.totalCharges.toLocaleString()}</p>
                        <p className="text-xs text-red-600">Due: ₹{patientObj.dueAmount.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patientObj);
                            setActiveSection('patient-details');
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            // Find the full admission data
                            const admissionData = admissions.find(a => a.id === patient.id);
                            if (admissionData) {
                              setEditingAdmission(admissionData);
                              setIsAdmissionDialogOpen(true);
                            }
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    );
  };

  // ============= HELPER FUNCTION: RENDER TAB CONTENT =============
  const renderTabContent = (
    title: string,
    description: string,
    data: any[],
    isLoading: boolean,
    onAdd: () => void,
    onEdit: (item: any) => void,
    onDelete: (id: number) => void,
    columns: Array<{ header: string; key: string; truncate?: boolean; format?: (item: any) => string }>
  ) => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button onClick={onAdd} className="bg-[#2F80ED] hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No records found</div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.key}>{col.header}</TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.format
                            ? col.format(item)
                            : col.truncate && item[col.key]?.length > 50
                            ? `${item[col.key]?.substring(0, 50)}...`
                            : item[col.key] || 'N/A'}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  };

  // ============= PATIENT DETAILS =============
  const renderPatientDetails = () => {
    if (!selectedPatient) return null;

    const patientTabs = [
      { id: 'daily-patient-care-order', label: 'Daily Patient Care Order', icon: ClipboardList },
      { id: 'ip-vitals', label: 'IP Vitals', icon: Activity },
      { id: 'admission-form', label: 'Admission Form', icon: FileText },
      { id: 'health-physical-habit', label: 'Health and Physical habit', icon: Heart },
      { id: 'forms', label: 'Forms', icon: FileText },
      { id: 'medication', label: 'Medication', icon: Pill },
      { id: 'procedures', label: 'Procedures', icon: Stethoscope },
      { id: 'nutrition', label: 'Nutrition', icon: Plus },
      { id: 'lab-order', label: 'Lab Order', icon: FlaskConical },
      { id: 'radiology-order', label: 'Radiology Order', icon: Activity },
      { id: 'nursing-forms', label: 'Nursing Forms', icon: ClipboardList },
      { id: 'nursing-notes', label: 'Nursing Notes', icon: FileText },
      { id: 'doctor-notes', label: 'Doctor Notes', icon: Stethoscope },
      { id: 'pharmacist-notes', label: 'Pharmacist Notes', icon: Pill },
      { id: 'files', label: 'Files', icon: Upload },
      { id: 'intake-output', label: 'Intake & Output', icon: Activity },
      { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'blood-bank', label: 'Blood Bank', icon: Droplet },
      { id: 'health-records', label: 'Health Records', icon: FileText },
      { id: 'doctor-recommendation', label: 'Doctor Recommendation Report', icon: Stethoscope },
      { id: 'doctor-consultation', label: 'Doctor Consultation Request', icon: UserCheck },
    ];

    return (
      <div className="space-y-4">
        {/* Header with Patient Info and Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('admissions')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-xl text-gray-900">{selectedPatient.patientName}</h2>
              <p className="text-xs text-gray-600">
                {selectedPatient.ipdNumber} • MRN: {selectedPatient.id.slice(0, 8)} • {selectedPatient.uhid}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-[#2F80ED] hover:bg-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Daily Visit
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Visit
            </Button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="flex border-b border-gray-200">
                {patientTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePatientTab(tab.id)}
                      className={`px-4 py-3 text-xs whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                        activePatientTab === tab.id
                          ? 'border-[#2F80ED] text-[#2F80ED] bg-blue-50'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sub Navigation: Details and Charts */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActivePatientSubTab('details')}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activePatientSubTab === 'details'
                ? 'border-[#2F80ED] text-[#2F80ED]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActivePatientSubTab('charts')}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activePatientSubTab === 'charts'
                ? 'border-[#2F80ED] text-[#2F80ED]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Charts
          </button>
        </div>

        {/* Content Area */}
        <Tabs value={activePatientSubTab} className="space-y-6">
          <TabsContent value="details" className="space-y-6 mt-4">

            {/* Dynamic Content Based on Active Tab */}
            {activePatientTab === 'ip-vitals' && renderTabContent(
              'IP Vitals',
              'In-patient vital signs monitoring',
              vitalSigns,
              loading,
              () => {
                setEditingVital(null);
                setIsVitalsDialogOpen(true);
              },
              (item: any) => {
                setEditingVital(item);
                setIsVitalsDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this vital sign record?')) {
                  try {
                    await api.deleteIPDVital(id);
                    await loadPatientDetailsData();
                    toast.success('Vital sign deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete vital sign: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'recorded_date' },
                { header: 'Time', key: 'recorded_time' },
                { header: 'BP', key: 'blood_pressure', format: (v: any) => v?.blood_pressure_systolic && v?.blood_pressure_diastolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : 'N/A' },
                { header: 'HR', key: 'heart_rate' },
                { header: 'Temp', key: 'temperature', format: (v: any) => v?.temperature ? `${v.temperature}°C` : 'N/A' },
                { header: 'RR', key: 'respiratory_rate' },
                { header: 'SpO2', key: 'oxygen_saturation', format: (v: any) => v?.oxygen_saturation ? `${v.oxygen_saturation}%` : 'N/A' },
              ]
            )}

            {activePatientTab === 'nursing-notes' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Nursing Notes</CardTitle>
                      <CardDescription>Daily nursing observations and care notes</CardDescription>
                    </div>
                    <Button onClick={() => setIsNursingNoteDialogOpen(true)} className="bg-[#2F80ED] hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">Loading nursing notes...</div>
                  ) : nursingNotes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No nursing notes found</div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {nursingNotes.map((note) => (
                          <Card key={note.id} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{note.category}</Badge>
                                    <Badge variant="outline">{note.shift}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{note.date} at {note.time}</p>
                                </div>
                              </div>
                              <p className="text-sm mb-2">{note.note}</p>
                              <p className="text-xs text-gray-500">— {note.nurse_name || 'N/A'}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Daily Patient Care Order Tab */}
            {activePatientTab === 'daily-patient-care-order' && renderTabContent(
              'Daily Patient Care Order',
              'Manage daily patient care orders',
              dailyCareOrders,
              loading,
              () => setIsDailyCareOrderDialogOpen(true),
              (item: any) => {
                setEditingDailyCareOrder(item);
                setIsDailyCareOrderDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this care order?')) {
                  try {
                    await api.deleteIPDDailyCareOrder(id);
                    await loadPatientDetailsData();
                    toast.success('Care order deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete care order: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'order_date' },
                { header: 'Time', key: 'order_time' },
                { header: 'Type', key: 'order_type' },
                { header: 'Description', key: 'order_description' },
                { header: 'Frequency', key: 'frequency' },
                { header: 'Status', key: 'status' },
              ]
            )}

            {/* Medication Tab */}
            {activePatientTab === 'medication' && renderTabContent(
              'Medication',
              'Manage patient medications',
              medications,
              loading,
              () => setIsMedicationDialogOpen(true),
              (item: any) => {
                setEditingMedication(item);
                setIsMedicationDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this medication?')) {
                  try {
                    await api.deleteIPDMedication(id);
                    await loadPatientDetailsData();
                    toast.success('Medication deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete medication: ' + error.message);
                  }
                }
              },
              [
                { header: 'Medication', key: 'medication_name' },
                { header: 'Dosage', key: 'dosage' },
                { header: 'Frequency', key: 'frequency' },
                { header: 'Route', key: 'route' },
                { header: 'Start Date', key: 'start_date' },
                { header: 'Status', key: 'status' },
              ]
            )}

            {/* Lab Order Tab */}
            {activePatientTab === 'lab-order' && renderTabContent(
              'Lab Order',
              'Manage laboratory test orders',
              labOrders,
              loading,
              () => setIsLabOrderDialogOpen(true),
              (item: any) => {
                setEditingLabOrder(item);
                setIsLabOrderDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this lab order?')) {
                  try {
                    await api.deleteIPDLabOrder(id);
                    await loadPatientDetailsData();
                    toast.success('Lab order deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete lab order: ' + error.message);
                  }
                }
              },
              [
                { header: 'Test Name', key: 'test_name' },
                { header: 'Order Date', key: 'order_date' },
                { header: 'Priority', key: 'priority' },
                { header: 'Status', key: 'status' },
                { header: 'Result Date', key: 'result_date' },
              ]
            )}

            {/* Radiology Order Tab */}
            {activePatientTab === 'radiology-order' && renderTabContent(
              'Radiology Order',
              'Manage radiology test orders',
              radiologyOrders,
              loading,
              () => setIsRadiologyOrderDialogOpen(true),
              (item: any) => {
                setEditingRadiologyOrder(item);
                setIsRadiologyOrderDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this radiology order?')) {
                  try {
                    await api.deleteIPDRadiologyOrder(id);
                    await loadPatientDetailsData();
                    toast.success('Radiology order deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete radiology order: ' + error.message);
                  }
                }
              },
              [
                { header: 'Test Name', key: 'test_name' },
                { header: 'Type', key: 'test_type' },
                { header: 'Body Part', key: 'body_part' },
                { header: 'Order Date', key: 'order_date' },
                { header: 'Status', key: 'status' },
              ]
            )}

            {/* Doctor Notes Tab */}
            {activePatientTab === 'doctor-notes' && renderTabContent(
              'Doctor Notes',
              'View and manage doctor notes',
              doctorNotes,
              loading,
              () => setIsDoctorNoteDialogOpen(true),
              (item: any) => {
                setEditingDoctorNote(item);
                setIsDoctorNoteDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this doctor note?')) {
                  try {
                    await api.deleteIPDDoctorNote(id);
                    await loadPatientDetailsData();
                    toast.success('Doctor note deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete doctor note: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'note_date' },
                { header: 'Time', key: 'note_time' },
                { header: 'Type', key: 'note_type' },
                { header: 'Note', key: 'note', truncate: true },
              ]
            )}

            {/* Pharmacist Notes Tab */}
            {activePatientTab === 'pharmacist-notes' && renderTabContent(
              'Pharmacist Notes',
              'View and manage pharmacist notes',
              pharmacistNotes,
              loading,
              () => setIsPharmacistNoteDialogOpen(true),
              (item: any) => {
                setEditingPharmacistNote(item);
                setIsPharmacistNoteDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this pharmacist note?')) {
                  try {
                    await api.deleteIPDPharmacistNote(id);
                    await loadPatientDetailsData();
                    toast.success('Pharmacist note deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete pharmacist note: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'note_date' },
                { header: 'Time', key: 'note_time' },
                { header: 'Type', key: 'note_type' },
                { header: 'Note', key: 'note', truncate: true },
              ]
            )}

            {/* Procedures Tab */}
            {activePatientTab === 'procedures' && renderTabContent(
              'Procedures',
              'Manage patient procedures',
              procedures,
              loading,
              () => setIsProcedureDialogOpen(true),
              (item: any) => {
                setEditingProcedure(item);
                setIsProcedureDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this procedure?')) {
                  try {
                    await api.deleteIPDProcedure(id);
                    await loadPatientDetailsData();
                    toast.success('Procedure deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete procedure: ' + error.message);
                  }
                }
              },
              [
                { header: 'Procedure Name', key: 'procedure_name' },
                { header: 'Date', key: 'procedure_date' },
                { header: 'Type', key: 'procedure_type' },
                { header: 'Status', key: 'status' },
              ]
            )}

            {/* Nutrition Tab */}
            {activePatientTab === 'nutrition' && renderTabContent(
              'Nutrition',
              'Manage patient nutrition records',
              nutrition,
              loading,
              () => setIsNutritionDialogOpen(true),
              (item: any) => {
                setEditingNutrition(item);
                setIsNutritionDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this nutrition record?')) {
                  try {
                    await api.deleteIPDNutrition(id);
                    await loadPatientDetailsData();
                    toast.success('Nutrition record deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete nutrition record: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'date' },
                { header: 'Meal Type', key: 'meal_type' },
                { header: 'Diet Type', key: 'diet_type' },
                { header: 'Calories', key: 'calories' },
              ]
            )}

            {/* Intake & Output Tab */}
            {activePatientTab === 'intake-output' && renderTabContent(
              'Intake & Output',
              'Monitor patient fluid intake and output',
              intakeOutput,
              loading,
              () => setIsIntakeOutputDialogOpen(true),
              (item: any) => {
                setEditingIntakeOutput(item);
                setIsIntakeOutputDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this record?')) {
                  try {
                    await api.deleteIPDIntakeOutput(id);
                    await loadPatientDetailsData();
                    toast.success('Record deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete record: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'date' },
                { header: 'Time', key: 'time' },
                { header: 'Intake (ml)', key: 'intake_amount' },
                { header: 'Output (ml)', key: 'output_amount' },
                { header: 'Balance (ml)', key: 'balance' },
              ]
            )}

            {/* Files Tab */}
            {activePatientTab === 'files' && renderTabContent(
              'Files',
              'Manage patient files and documents',
              patientFiles,
              loading,
              () => setIsFileDialogOpen(true),
              (item: any) => {
                // Files are typically view-only, but can be edited
                setIsFileDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this file?')) {
                  try {
                    await api.deleteIPDFile(id);
                    await loadPatientDetailsData();
                    toast.success('File deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete file: ' + error.message);
                  }
                }
              },
              [
                { header: 'File Name', key: 'file_name' },
                { header: 'Category', key: 'file_category' },
                { header: 'Upload Date', key: 'created_at' },
                { header: 'Size', key: 'file_size' },
              ]
            )}

            {/* Health & Physical Habit Tab */}
            {activePatientTab === 'health-physical-habit' && renderTabContent(
              'Health and Physical Habit',
              'Patient health assessment and physical habits',
              healthPhysicalHabit,
              loading,
              () => setIsHealthPhysicalDialogOpen(true),
              (item: any) => {
                // Health physical habit editing - can reuse a state variable
                setIsHealthPhysicalDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this assessment?')) {
                  try {
                    await api.deleteIPDHealthPhysicalHabit(id);
                    await loadPatientDetailsData();
                    toast.success('Assessment deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete assessment: ' + error.message);
                  }
                }
              },
              [
                { header: 'Assessment Date', key: 'assessment_date' },
                { header: 'Height (cm)', key: 'height' },
                { header: 'Weight (kg)', key: 'weight' },
                { header: 'BMI', key: 'bmi' },
              ]
            )}

            {/* Forms Tab */}
            {activePatientTab === 'forms' && renderTabContent(
              'Forms',
              'Manage patient forms and documents',
              forms,
              loading,
              () => setIsFormDialogOpen(true),
              (item: any) => {
                setIsFormDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this form?')) {
                  try {
                    await api.deleteIPDForm(id);
                    await loadPatientDetailsData();
                    toast.success('Form deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete form: ' + error.message);
                  }
                }
              },
              [
                { header: 'Form Name', key: 'form_name' },
                { header: 'Type', key: 'form_type' },
                { header: 'Status', key: 'status' },
                { header: 'Created Date', key: 'created_at' },
              ]
            )}

            {/* Doctor Recommendation Tab */}
            {activePatientTab === 'doctor-recommendation' && renderTabContent(
              'Doctor Recommendation Report',
              'View doctor recommendations',
              doctorRecommendations,
              loading,
              () => setIsDoctorRecommendationDialogOpen(true),
              (item: any) => {
                setEditingDoctorNote(item); // Reuse doctor note editing
                setIsDoctorRecommendationDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this recommendation?')) {
                  try {
                    await api.deleteIPDDoctorRecommendation(id);
                    await loadPatientDetailsData();
                    toast.success('Recommendation deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete recommendation: ' + error.message);
                  }
                }
              },
              [
                { header: 'Date', key: 'recommendation_date' },
                { header: 'Type', key: 'recommendation_type' },
                { header: 'Priority', key: 'priority' },
                { header: 'Status', key: 'status' },
                { header: 'Recommendation', key: 'recommendation', truncate: true },
              ]
            )}

            {/* Doctor Consultation Request Tab */}
            {activePatientTab === 'doctor-consultation' && renderTabContent(
              'Doctor Consultation Request',
              'Manage consultation requests',
              doctorConsultations,
              loading,
              () => setIsDoctorConsultationDialogOpen(true),
              (item: any) => {
                setIsDoctorConsultationDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this consultation request?')) {
                  try {
                    await api.deleteIPDDoctorConsultation(id);
                    await loadPatientDetailsData();
                    toast.success('Consultation request deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete consultation request: ' + error.message);
                  }
                }
              },
              [
                { header: 'Request Date', key: 'request_date' },
                { header: 'Department', key: 'department' },
                { header: 'Priority', key: 'priority' },
                { header: 'Status', key: 'status' },
                { header: 'Reason', key: 'reason', truncate: true },
              ]
            )}

            {/* Admission Form Tab - Show admission details */}
            {activePatientTab === 'admission-form' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admission Form</CardTitle>
                  <CardDescription>Patient admission details</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedPatient ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>IPD Number:</strong> {selectedPatient.ipdNumber}</div>
                      <div><strong>UHID:</strong> {selectedPatient.uhid}</div>
                      <div><strong>Admission Date:</strong> {selectedPatient.admissionDate}</div>
                      <div><strong>Ward:</strong> {selectedPatient.wardName}</div>
                      <div><strong>Bed:</strong> {selectedPatient.bedNumber}</div>
                      <div><strong>Department:</strong> {selectedPatient.department}</div>
                      <div><strong>Consulting Doctor:</strong> {selectedPatient.consultingDoctor}</div>
                      <div><strong>Diagnosis:</strong> {selectedPatient.diagnosis}</div>
                  </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">No admission data available</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activePatientTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Patient settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">Settings options will be available here</div>
                </CardContent>
              </Card>
            )}

            {/* Laboratory Tab - Same as Lab Order */}
            {activePatientTab === 'laboratory' && renderTabContent(
              'Laboratory',
              'Laboratory test results and orders',
              labOrders,
              loading,
              () => setIsLabOrderDialogOpen(true),
              (item: any) => {
                setEditingLabOrder(item);
                setIsLabOrderDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this lab order?')) {
                  try {
                    await api.deleteIPDLabOrder(id);
                    await loadPatientDetailsData();
                    toast.success('Lab order deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete lab order: ' + error.message);
                  }
                }
              },
              [
                { header: 'Test Name', key: 'test_name' },
                { header: 'Order Date', key: 'order_date' },
                { header: 'Status', key: 'status' },
                { header: 'Results', key: 'results', truncate: true },
              ]
            )}

            {/* Blood Bank Tab */}
            {activePatientTab === 'blood-bank' && (
              <Card>
                <CardHeader>
                  <CardTitle>Blood Bank</CardTitle>
                  <CardDescription>Blood bank requests and records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">Blood bank records will be displayed here</div>
                </CardContent>
              </Card>
            )}

            {/* Health Records Tab */}
            {activePatientTab === 'health-records' && (
              <Card>
                <CardHeader>
                  <CardTitle>Health Records</CardTitle>
                  <CardDescription>Complete health records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">Health records will be displayed here</div>
                </CardContent>
              </Card>
            )}

            {/* Nursing Forms Tab */}
            {activePatientTab === 'nursing-forms' && renderTabContent(
              'Nursing Forms',
              'Manage nursing forms',
              forms.filter((f: any) => f.form_type === 'nursing'),
              loading,
              () => setIsFormDialogOpen(true),
              (item: any) => {
                setIsFormDialogOpen(true);
              },
              async (id: number) => {
                if (confirm('Are you sure you want to delete this form?')) {
                  try {
                    await api.deleteIPDForm(id);
                    await loadPatientDetailsData();
                    toast.success('Form deleted successfully');
                  } catch (error: any) {
                    toast.error('Failed to delete form: ' + error.message);
                  }
                }
              },
              [
                { header: 'Form Name', key: 'form_name' },
                { header: 'Status', key: 'status' },
                { header: 'Created Date', key: 'created_at' },
              ]
            )}

          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Charts & Analytics</CardTitle>
                <CardDescription>Visual representation of patient data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <BarChart3 className="w-16 h-16 mb-4" />
                  <p>Charts will be displayed here based on selected tab</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ============= WARD MANAGEMENT =============
  const renderWardManagement = () => {
    if (loading) return <div className="text-center py-12">Loading wards...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Ward Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage wards and bed allocation</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingWard(null);
              setIsWardDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ward
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wards.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No wards found</div>
          ) : (
            wards.map((ward) => {
              const occupiedBeds = ward.occupied_beds || 0;
              const totalBeds = ward.total_beds || 0;
              const availableBeds = totalBeds - occupiedBeds;
              const facilities = typeof ward.facilities === 'string' 
                ? JSON.parse(ward.facilities || '[]') 
                : (ward.facilities || []);
              
              return (
            <Card key={ward.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ward.name}</CardTitle>
                      <p className="text-xs text-gray-500">Floor {ward.floor_id || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(ward.status || 'active')}>
                    {ward.status || 'active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Bed Occupancy */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Bed Occupancy</span>
                      <span className="text-sm">
                        {occupiedBeds}/{totalBeds}
                      </span>
                    </div>
                    <Progress 
                      value={totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {availableBeds} beds available
                      </span>
                      <span className="text-xs text-gray-500">
                        {totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Ward Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <Badge variant="outline">{ward.type || 'General'}</Badge>
                    </div>
                    {ward.incharge_name && (
                      <div className="flex items-start justify-between text-sm">
                        <span className="text-gray-600">Nurse In-Charge</span>
                        <span className="text-right">{ward.incharge_name}</span>
                      </div>
                    )}
                    {ward.contact && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Contact</span>
                        <span className="font-mono text-xs">{ward.contact}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Facilities */}
                  {facilities.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Facilities</p>
                      <div className="flex flex-wrap gap-1">
                        {facilities.map((facility: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const wardObj: Ward = {
                          id: ward.id?.toString() || '',
                          name: ward.name || '',
                          floor: ward.floor_id || 0,
                          type: (ward.type as any) || 'General',
                          totalBeds: totalBeds,
                          occupiedBeds: occupiedBeds,
                          availableBeds: availableBeds,
                          nurseInCharge: ward.incharge_name || '',
                          contactNumber: ward.contact || '',
                          facilities: facilities,
                          status: (ward.status as any) || 'active'
                        };
                        setSelectedWard(wardObj);
                        setActiveSection('ward-beds');
                      }}
                    >
                      <Eye className="w-3 h-3 mr-2" />
                      View Beds
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingWard(ward);
                        setIsWardDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ============= BED MANAGEMENT =============
  const renderBedManagement = () => {
    if (loading) return <div className="text-center py-12">Loading beds...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    
    // Filter beds based on search and filters
    const filteredBeds = beds.filter(bed => {
      const matchesWard = selectedWardFilter === 'all' || bed.ward_id?.toString() === selectedWardFilter;
      const matchesStatus = selectedStatusFilter === 'all' || bed.status === selectedStatusFilter;
      const matchesSearch = 
        bed.bed_number?.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
        bed.ward_name?.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
        (bed.current_patient_name && bed.current_patient_name.toLowerCase().includes(bedSearchQuery.toLowerCase()));
      
      return matchesWard && matchesStatus && matchesSearch;
    });

    // Calculate statistics
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
    const availableBeds = beds.filter(b => b.status === 'available').length;
    const maintenanceBeds = beds.filter(b => b.status === 'maintenance').length;
    const reservedBeds = beds.filter(b => b.status === 'reserved').length;
    const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';
    
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl text-gray-900">Bed Management</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">View all beds, allocations, and patient details</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  const XLSX = await import('xlsx');
                  const exportData = beds.map(bed => ({
                    'Bed Number': bed.bed_number || '',
                    'Ward': bed.ward_name || '',
                    'Type': bed.bed_type || '',
                    'Status': bed.status || '',
                    'Patient Name': bed.current_patient_name || '',
                    'Patient ID': bed.current_patient_id || '',
                    'Admission Date': bed.current_admission_date ? new Date(bed.current_admission_date).toLocaleDateString() : '',
                    'Daily Rate': bed.daily_rate || 0,
                    'Facilities': typeof bed.facilities === 'string' ? bed.facilities : JSON.stringify(bed.facilities || []),
                  }));
                  
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Bed Management');
                  
                  const fileName = `IPD_Bed_Management_${new Date().toISOString().split('T')[0]}.xlsx`;
                  XLSX.writeFile(wb, fileName);
                  toast.success('Bed management data exported successfully!');
                } catch (error: any) {
                  toast.error('Failed to export: ' + (error.message || 'Unknown error'));
                }
              }}
              disabled={beds.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="!bg-[#2F80ED] hover:!bg-blue-600 !text-white" 
              size="sm"
              onClick={() => setIsAllocateBedDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Allocate Bed
            </Button>
            <Button 
              className="!bg-[#27AE60] hover:!bg-green-600 !text-white" 
              size="sm"
              onClick={() => {
                setEditingBed(null);
                setIsCreateBedDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Bed
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bed className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <p className="text-xs text-gray-600">Total Beds</p>
              </div>
              <h3 className="text-xl md:text-2xl">{totalBeds}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                <p className="text-xs text-gray-600">Occupied</p>
              </div>
              <h3 className="text-xl md:text-2xl">{occupiedBeds}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <p className="text-xs text-gray-600">Available</p>
              </div>
              <h3 className="text-xl md:text-2xl">{availableBeds}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <p className="text-xs text-gray-600">Reserved</p>
              </div>
              <h3 className="text-xl md:text-2xl">{reservedBeds}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                <p className="text-xs text-gray-600">Maintenance</p>
              </div>
              <h3 className="text-xl md:text-2xl">{maintenanceBeds}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <p className="text-xs text-gray-600">Occupancy</p>
              </div>
              <h3 className="text-xl md:text-2xl">{occupancyRate}%</h3>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by bed number, ward, or patient name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bedSearchQuery}
                    onChange={(e) => setBedSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                  value={selectedWardFilter}
                  onChange={(e) => setSelectedWardFilter(e.target.value)}
                >
                  <option value="all">All Wards</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id?.toString() || ''}>{ward.name}</option>
                  ))}
                </select>
                <select
                  className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beds Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-xs md:text-sm">Bed Number</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">Ward</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">Type</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">Status</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm">Patient Details</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm hidden md:table-cell">Admission Date</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm hidden lg:table-cell">Daily Rate</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm hidden lg:table-cell">Facilities</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500 text-sm">
                        No beds found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBeds.map((bed) => {
                      const facilities = typeof bed.facilities === 'string' 
                        ? JSON.parse(bed.facilities || '[]') 
                        : (bed.facilities || []);
                      
                      return (
                        <TableRow key={bed.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Bed className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-xs md:text-sm">{bed.bed_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs md:text-sm">{bed.ward_name || 'N/A'}</span>
                              <span className="text-xs text-gray-500 hidden sm:block">{bed.bed_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                bed.bed_type === 'ICU' ? 'border-red-200 bg-red-50 text-red-700' :
                                bed.bed_type === 'Private' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                bed.bed_type === 'Deluxe' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                'border-gray-200 bg-gray-50 text-gray-700'
                              }`}
                            >
                              {bed.bed_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bed.status === 'available' ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Free
                              </Badge>
                            ) : bed.status === 'occupied' ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Occupied
                              </Badge>
                            ) : bed.status === 'reserved' ? (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Reserved
                              </Badge>
                            ) : bed.status === 'maintenance' ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Maintenance
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                Cleaning
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {bed.status === 'occupied' && bed.current_patient_name ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-xs md:text-sm">{bed.current_patient_name}</span>
                                <span className="text-xs text-gray-500">ID: {bed.current_patient_id || 'N/A'}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs md:text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bed.current_admission_date ? (
                              <span className="text-sm">{new Date(bed.current_admission_date).toLocaleDateString()}</span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="font-medium text-sm">₹{bed.daily_rate?.toLocaleString() || '0'}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {facilities.slice(0, 2).map((facility: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                              {facilities.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{facilities.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end flex-wrap">
                              {bed.status === 'occupied' ? (
                                <>
                                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => {
                                    const patient = admissions.find(a => a.id === bed.current_admission_id);
                                    if (patient) {
                                      const patientObj: IPDPatient = {
                                        id: patient.id?.toString() || '',
                                        ipdNumber: patient.ipd_number || '',
                                        uhid: patient.uhid || '',
                                        patientName: patient.patient_name || '',
                                        age: patient.patient_age || 0,
                                        gender: (patient.patient_gender as any) || 'other',
                                        contactNumber: patient.patient_contact || '',
                                        emergencyContact: patient.patient_emergency_contact || '',
                                        address: patient.patient_address || '',
                                        admissionDate: patient.admission_date || '',
                                        admissionTime: patient.admission_time || '',
                                        admittedBy: patient.admitted_by_name || '',
                                        consultingDoctor: patient.consulting_doctor_name || '',
                                        department: patient.department || '',
                                        wardName: patient.ward_name || '',
                                        bedNumber: patient.bed_number || '',
                                        diagnosis: patient.diagnosis || '',
                                        admissionType: (patient.admission_type as any) || 'Emergency',
                                        status: (patient.status as any) || 'admitted',
                                        estimatedDuration: patient.estimated_duration || 0,
                                        actualDuration: patient.actual_duration || undefined,
                                        totalCharges: 0,
                                        paidAmount: 0,
                                        dueAmount: 0
                                      };
                                      setSelectedPatient(patientObj);
                                      setActiveSection('patient-details');
                                    }
                                  }}>
                                    <Eye className="w-3 h-3 md:mr-1" />
                                    <span className="hidden md:inline">View</span>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs px-2 py-1 h-auto hidden sm:flex" 
                                    onClick={() => {
                                      const patient = admissions.find(a => a.id === bed.current_admission_id);
                                      if (patient) {
                                        setSelectedAdmissionForTransfer(patient);
                                        setIsTransferDialogOpen(true);
                                      }
                                    }}
                                  >
                                    <RotateCcw className="w-3 h-3 md:mr-1" />
                                    <span className="hidden md:inline">Transfer</span>
                                  </Button>
                                </>
                              ) : bed.status === 'available' ? (
                                <Button 
                                  className="bg-[#27AE60] hover:bg-green-600 text-xs px-2 py-1 h-auto" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBedForAllocation(bed);
                                    setIsAllocateBedDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="w-3 h-3 md:mr-1" />
                                  <span className="hidden md:inline">Allocate</span>
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto" onClick={() => {
                                  setEditingBed(bed);
                                  setIsCreateBedDialogOpen(true);
                                }}>
                                  <Edit className="w-3 h-3 md:mr-1" />
                                  <span className="hidden md:inline">Edit</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between px-1">
          <p className="text-xs md:text-sm text-gray-600">
            Showing {filteredBeds.length} of {totalBeds} beds
          </p>
        </div>
      </div>
    );
  };

  // ============= PRIVATE ROOMS =============
  const renderPrivateRooms = () => {
    if (loading) return <div className="text-center py-12">Loading rooms...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const reservedRooms = rooms.filter(r => r.status === 'reserved').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';
    
    // Helper functions
    const getRoomStatusColor = (status: string) => {
      switch (status) {
        case 'available':
          return 'bg-green-50 border-green-300 hover:border-green-400';
        case 'occupied':
          return 'bg-blue-50 border-blue-300 hover:border-blue-400';
        case 'maintenance':
          return 'bg-yellow-50 border-yellow-300 hover:border-yellow-400';
        case 'reserved':
          return 'bg-orange-50 border-orange-300 hover:border-orange-400';
        default:
          return 'bg-gray-50 border-gray-300';
      }
    };

    const getRoomTypeIcon = (type: string) => {
      switch (type) {
        case 'VIP Suite':
          return '👑';
        case 'Suite':
          return '🏆';
        case 'Super Deluxe':
          return '⭐';
        default:
          return '🛏️';
      }
    };

    // Filter rooms
    const filteredRooms = rooms.filter(room => {
      const matchesSearch = 
        room.room_number?.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
        room.current_patient_name?.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
        room.current_patient_contact?.toLowerCase().includes(roomSearchQuery.toLowerCase());
      const matchesType = roomTypeFilter === 'all' || room.room_type === roomTypeFilter;
      const matchesStatus = roomStatusFilter === 'all' || room.status === roomStatusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl text-gray-900">Private Room Management</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Manage private rooms, suites, and VIP accommodations</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  const XLSX = await import('xlsx');
                  const exportData = rooms.map(room => ({
                    'Room Number': room.room_number || '',
                    'Type': room.room_type || '',
                    'Status': room.status || '',
                    'Patient Name': room.current_patient_name || '',
                    'Patient ID': room.current_patient_id || '',
                    'Patient Contact': room.current_patient_contact || '',
                    'Admission Date': room.current_admission_date ? new Date(room.current_admission_date).toLocaleDateString() : '',
                    'Daily Rate': room.daily_rate || 0,
                    'Capacity': room.capacity || 1,
                    'Building': room.building || '',
                    'Floor': room.floor_id || '',
                  }));
                  
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Private Rooms');
                  
                  const fileName = `IPD_Private_Rooms_${new Date().toISOString().split('T')[0]}.xlsx`;
                  XLSX.writeFile(wb, fileName);
                  toast.success('Private rooms data exported successfully!');
                } catch (error: any) {
                  toast.error('Failed to export: ' + (error.message || 'Unknown error'));
                }
              }}
              disabled={rooms.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="!bg-[#27AE60] hover:!bg-green-600 !text-white" 
              size="sm"
              onClick={() => {
                setEditingRoom(null);
                setIsRoomDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-gray-600">Total Rooms</p>
              </div>
              <h3 className="text-2xl">{totalRooms}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <p className="text-xs text-gray-600">Occupied</p>
              </div>
              <h3 className="text-2xl">{occupiedRooms}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-xs text-gray-600">Available</p>
              </div>
              <h3 className="text-2xl">{availableRooms}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <p className="text-xs text-gray-600">Reserved</p>
              </div>
              <h3 className="text-2xl">{reservedRooms}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-xs text-gray-600">Maintenance</p>
              </div>
              <h3 className="text-2xl">{maintenanceRooms}</h3>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <p className="text-xs text-gray-600">Occupancy</p>
              </div>
              <h3 className="text-2xl">{occupancyRate}%</h3>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by room number, patient name, or contact..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={roomSearchQuery}
                    onChange={(e) => setRoomSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select 
                  className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Super Deluxe">Super Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="VIP Suite">VIP Suite</option>
                  <option value="Private">Private</option>
                </select>
                <select 
                  className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                  value={roomStatusFilter}
                  onChange={(e) => setRoomStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No rooms found</div>
          ) : (
            filteredRooms.map((room) => (
              <Card 
                key={room.id} 
                className={`border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${getRoomStatusColor(room.status)}`}
              >
                <CardContent className="p-5">
                  {/* Room Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getRoomTypeIcon(room.room_type || 'Private')}</span>
                        <h3 className="font-semibold text-lg">{room.room_number}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{room.room_type}</p>
                      <p className="text-xs text-gray-500">Floor {room.floor_id || 'N/A'}</p>
                    </div>
                    <Badge 
                      className={`${
                        room.status === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'
                      }`}
                    >
                      {room.status}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  {/* Patient Details or Status */}
                  {room.status === 'occupied' && room.current_patient_name ? (
                    <div className="space-y-3 mb-4">
                      <div>
                        <Label className="text-xs text-gray-500">Patient</Label>
                        <p className="font-medium text-sm">{room.current_patient_name}</p>
                      </div>
                      {room.current_patient_contact && (
                        <div>
                          <Label className="text-xs text-gray-500">Contact</Label>
                          <p className="text-sm">{room.current_patient_contact}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {room.current_admission_date && (
                          <div>
                            <Label className="text-xs text-gray-500">Admission</Label>
                            <p className="text-xs">{new Date(room.current_admission_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {room.current_doctor_name && (
                          <div>
                            <Label className="text-xs text-gray-500">Doctor</Label>
                            <p className="text-xs truncate">{room.current_doctor_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : room.status === 'maintenance' ? (
                    <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm font-medium">Under Maintenance</p>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">Room is being serviced</p>
                    </div>
                  ) : room.status === 'reserved' ? (
                    <div className="mb-4 p-3 bg-orange-100 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-medium">Reserved</p>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">Advance booking confirmed</p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-green-100 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="w-4 h-4" />
                        <p className="text-sm font-medium">Available</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">Ready for admission</p>
                    </div>
                  )}

                  {/* Room Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-semibold text-blue-600">₹{room.daily_rate?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Beds</span>
                      <span className="font-medium">{room.capacity || 1} {room.has_attendant_bed ? '+ 1 Attendant' : ''}</span>
                    </div>
                  </div>

                  {/* Facilities */}
                  {(() => {
                    const facilitiesArray = typeof room.facilities === 'string'
                      ? (() => {
                          try {
                            return JSON.parse(room.facilities || '[]');
                          } catch {
                            return [];
                          }
                        })()
                      : (Array.isArray(room.facilities) ? room.facilities : []);
                    
                    return facilitiesArray.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-xs text-gray-500 mb-2 block">Facilities</Label>
                        <div className="flex flex-wrap gap-1">
                          {facilitiesArray.slice(0, 3).map((facility: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {facilitiesArray.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{facilitiesArray.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {room.status === 'occupied' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Transfer
                        </Button>
                      </>
                    ) : room.status === 'available' ? (
                      <Button 
                        className="w-full !bg-[#27AE60] hover:!bg-green-600 !text-white text-xs" 
                        size="sm"
                        onClick={() => {
                          setSelectedRoomForAllocation(room);
                          setIsAllocateRoomDialogOpen(true);
                        }}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Allocate Room
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => {
                          setEditingRoom(room);
                          setIsRoomDialogOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit Status
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============= DISCHARGES =============
  const renderDischarges = () => {
    const dischargedPatients = admissions.filter(a => a.status === 'discharged');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Discharge Management</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage patient discharges</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IPD No.</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Discharge Date</TableHead>
                  <TableHead>Length of Stay</TableHead>
                  <TableHead>Final Diagnosis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dischargedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No discharged patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  dischargedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.ipd_number}</TableCell>
                      <TableCell>{patient.patient_name || 'N/A'}</TableCell>
                      <TableCell>{patient.discharge_date || 'N/A'}</TableCell>
                      <TableCell>{patient.actual_duration || 0} days</TableCell>
                      <TableCell className="max-w-xs truncate">{patient.diagnosis || 'N/A'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => {
                          const dischargePatient = admissions.find(a => a.id === patient.id);
                          if (dischargePatient) {
                            const patientObj: IPDPatient = {
                              id: dischargePatient.id?.toString() || '',
                              ipdNumber: dischargePatient.ipd_number || '',
                              uhid: dischargePatient.uhid || '',
                              patientName: dischargePatient.patient_name || '',
                              age: dischargePatient.patient_age || 0,
                              gender: (dischargePatient.patient_gender as any) || 'other',
                              contactNumber: dischargePatient.patient_contact || '',
                              emergencyContact: dischargePatient.patient_emergency_contact || '',
                              address: dischargePatient.patient_address || '',
                              admissionDate: dischargePatient.admission_date || '',
                              admissionTime: dischargePatient.admission_time || '',
                              admittedBy: dischargePatient.admitted_by_name || '',
                              consultingDoctor: dischargePatient.consulting_doctor_name || '',
                              department: dischargePatient.department || '',
                              wardName: dischargePatient.ward_name || '',
                              bedNumber: dischargePatient.bed_number || '',
                              diagnosis: dischargePatient.diagnosis || '',
                              admissionType: (dischargePatient.admission_type as any) || 'Emergency',
                              status: (dischargePatient.status as any) || 'discharged',
                              estimatedDuration: dischargePatient.estimated_duration || 0,
                              actualDuration: dischargePatient.actual_duration || undefined,
                              totalCharges: 0,
                              paidAmount: 0,
                              dueAmount: 0
                            };
                            setSelectedPatient(patientObj);
                            setActiveSection('patient-details');
                          }
                        }}>
                          <Eye className="w-3 h-3" />
                        </Button>
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
  };

  // ============= TRANSFER HISTORY =============
  const renderTransferHistory = () => {
    if (loading) return <div className="text-center py-12">Loading transfer history...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Bed/Room Transfer History</h2>
            <p className="text-sm text-gray-600 mt-1">Track all patient transfers between beds and rooms</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Transferred By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No transfer history found
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.transfer_date} {transfer.transfer_time}</TableCell>
                      <TableCell>{transfer.patient_name || 'N/A'}</TableCell>
                      <TableCell>
                        {transfer.from_ward_name && <div>{transfer.from_ward_name} / {transfer.from_bed_number || transfer.from_room_number || 'N/A'}</div>}
                      </TableCell>
                      <TableCell>
                        {transfer.to_ward_name && <div>{transfer.to_ward_name} / {transfer.to_bed_number || transfer.to_room_number || 'N/A'}</div>}
                      </TableCell>
                      <TableCell>{transfer.transfer_reason || 'N/A'}</TableCell>
                      <TableCell>{transfer.transferred_by_name || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= REPORTS =============
  const renderReports = () => {
    return <IpdReportsListing />;
  };

  // ============= ANALYTICS =============
  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl text-gray-900">IPD Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Advanced analytics and insights</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">Chart will be displayed here</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">Chart will be displayed here</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ============= DUTY ROSTER =============
  const renderDutyRoster = () => {
    return <IndoorDutyRoster />;
  };

  // ============= DISPOSITIONS =============
  const renderDispositions = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl text-gray-900">Dispositions</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeDispositionTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveDispositionTab('pending')}
            className={activeDispositionTab === 'pending' ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </Button>
          <Button
            variant={activeDispositionTab === 'admitted' ? 'default' : 'outline'}
            onClick={() => setActiveDispositionTab('admitted')}
            className={activeDispositionTab === 'admitted' ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}
          >
            <Bed className="w-4 h-4 mr-2" />
            Admitted
          </Button>
          <Button
            variant={activeDispositionTab === 'transferred' ? 'default' : 'outline'}
            onClick={() => setActiveDispositionTab('transferred')}
            className={activeDispositionTab === 'transferred' ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Transferred
          </Button>
          <Button
            variant={activeDispositionTab === 'discharged' ? 'default' : 'outline'}
            onClick={() => setActiveDispositionTab('discharged')}
            className={activeDispositionTab === 'discharged' ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Discharged
          </Button>
        </div>

        {/* Filters Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Disposition Type Dropdown */}
              <div className="flex-1">
                <Select value={dispositionType} onValueChange={setDispositionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Disposition Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select Disposition Type</SelectItem>
                    <SelectItem value="discharge">Discharge</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="lama">LAMA</SelectItem>
                    <SelectItem value="death">Death</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Input 
                  type="datetime-local" 
                  defaultValue="2025-11-26T10:30"
                  className="w-48"
                />
                <span className="text-gray-500">-</span>
                <Input 
                  type="datetime-local" 
                  defaultValue="2025-11-26T23:59"
                  className="w-48"
                />
              </div>

              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search By Patient Name, MRN# or Phone"
                    value={dispositionSearchQuery}
                    onChange={(e) => setDispositionSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Excel and Print Buttons */}
              <Button 
                className="bg-[#2F80ED] hover:bg-blue-600" 
                onClick={async () => {
                  try {
                    const XLSX = await import('xlsx');
                    const filteredAdmissions = admissions.filter(admission => {
                      if (activeDispositionTab === 'pending') {
                        return admission.status === 'admitted';
                      } else if (activeDispositionTab === 'discharged') {
                        return admission.status === 'discharged';
                      }
                      return true;
                    });
                    
                    const exportData = filteredAdmissions.map(admission => ({
                      'IPD Number': admission.ipd_number || '',
                      'Patient Name': admission.patient_name || '',
                      'Age': admission.patient_age || '',
                      'Gender': admission.patient_gender || '',
                      'Contact': admission.patient_contact || '',
                      'Admission Date': admission.admission_date || '',
                      'Admission Time': admission.admission_time || '',
                      'Discharge Date': admission.discharge_date || '',
                      'Ward': admission.ward_name || '',
                      'Bed': admission.bed_number || '',
                      'Doctor': admission.consulting_doctor_name || '',
                      'Department': admission.department || '',
                      'Diagnosis': admission.diagnosis || '',
                      'Status': admission.status || '',
                      'Disposition Type': admission.disposition || '',
                    }));
                    
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Disposition');
                    
                    const fileName = `IPD_Disposition_${new Date().toISOString().split('T')[0]}.xlsx`;
                    XLSX.writeFile(wb, fileName);
                    toast.success('Disposition data exported successfully!');
                  } catch (error: any) {
                    toast.error('Failed to export: ' + (error.message || 'Unknown error'));
                  }
                }}
                disabled={admissions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">MRN#</TableHead>
                    <TableHead className="text-xs">PATIENT NAME</TableHead>
                    <TableHead className="text-xs">PATIENT PHONE</TableHead>
                    <TableHead className="text-xs">DISPOSITION TYPE</TableHead>
                    <TableHead className="text-xs">SECONDARY ASSIGNED</TableHead>
                    <TableHead className="text-xs">PATIENT CATEGORY</TableHead>
                    <TableHead className="text-xs">DISPOSITION NOTE</TableHead>
                    <TableHead className="text-xs">RECOMMENDED ADMISSION DATE</TableHead>
                    <TableHead className="text-xs">CREATED BY</TableHead>
                    <TableHead className="text-xs">CREATED AT</TableHead>
                    <TableHead className="text-xs">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Empty State */}
                  <TableRow>
                    <TableCell colSpan={11} className="h-80">
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Clipboard className="w-24 h-24 mb-4 text-blue-200" strokeWidth={1} />
                        <p className="text-gray-500">There are no records to show.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= REHABILITATION =============
  // Load rehabilitation data when section is accessed
  useEffect(() => {
    if (activeSection === 'rehabilitation') {
      loadRehabilitationData();
    }
  }, [activeSection]);
  
  const loadRehabilitationData = async () => {
    try {
      setLoadingRehabilitation(true);
      const data = await api.getIPDRehabilitationRequests();
      setRehabilitationRequests(data?.requests || []);
      setRehabilitationStats({
        activePatients: data?.stats?.activePatients || 0,
        pendingRequests: data?.stats?.pendingRequests || 0,
        todaysSessions: data?.stats?.todaysSessions || 0,
        completed: data?.stats?.completed || 0
      });
    } catch (error: any) {
      toast.error('Failed to load rehabilitation data: ' + (error.message || 'Unknown error'));
      setRehabilitationRequests([]);
      setRehabilitationStats({
        activePatients: 0,
        pendingRequests: 0,
        todaysSessions: 0,
        completed: 0
      });
    } finally {
      setLoadingRehabilitation(false);
    }
  };
  
  const renderRehabilitation = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Rehabilitation Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Manage physiotherapy and rehabilitation services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadRehabilitationData} disabled={loadingRehabilitation}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingRehabilitation ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-[#2F80ED] hover:bg-blue-600" onClick={() => {
              setSelectedRehabilitationRequest(null);
              setIsNewRehabilitationDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Patients</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {loadingRehabilitation ? <Loader2 className="w-6 h-6 animate-spin" /> : rehabilitationStats.activePatients}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {loadingRehabilitation ? <Loader2 className="w-6 h-6 animate-spin" /> : rehabilitationStats.pendingRequests}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Sessions</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {loadingRehabilitation ? <Loader2 className="w-6 h-6 animate-spin" /> : rehabilitationStats.todaysSessions}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {loadingRehabilitation ? <Loader2 className="w-6 h-6 animate-spin" /> : rehabilitationStats.completed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rehabilitation Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rehabilitation Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRehabilitation ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading rehabilitation requests...</span>
              </div>
            ) : rehabilitationRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No rehabilitation requests found</p>
                <p className="text-sm mt-1">No rehabilitation requests have been created yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Session</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rehabilitationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.patient_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.service_type}</Badge>
                      </TableCell>
                      <TableCell>{request.doctor_name || request.requested_by_name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{request.frequency}</TableCell>
                      <TableCell>
                        <Badge className={request.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {request.next_session_date ? (
                          `${new Date(request.next_session_date).toLocaleDateString()}${request.next_session_time ? ' ' + request.next_session_time : ''}`
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={async () => {
                              try {
                                const details = await api.getIPDRehabilitationRequest(request.id);
                                setSelectedRehabilitationRequest(details);
                                setIsViewRehabilitationDialogOpen(true);
                              } catch (error: any) {
                                toast.error('Failed to load request details: ' + (error.message || 'Unknown error'));
                              }
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={async () => {
                              try {
                                const details = await api.getIPDRehabilitationRequest(request.id);
                                setSelectedRehabilitationRequest(details);
                                setIsEditRehabilitationDialogOpen(true);
                              } catch (error: any) {
                                toast.error('Failed to load request details: ' + (error.message || 'Unknown error'));
                              }
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= BIRTH CERTIFICATES =============
  const renderBirthCertificates = () => {
    return <BirthCertificates />;
  };

  // ============= DEATH CERTIFICATES =============
  const renderDeathCertificates = () => {
    return <DeathCertificates />;
  };

  // ============= DOCTOR ADMISSION REQUESTS =============
  // Load admission requests data when section is accessed
  useEffect(() => {
    if (activeSection === 'doctor-requests' || activeSection === 'admission-requests') {
      loadAdmissionRequestsData();
    }
  }, [activeSection]);
  
  const loadAdmissionRequestsData = async () => {
    try {
      setLoadingAdmissionRequests(true);
      const data = await api.getIPDAdmissionRequests({ status: 'pending' });
      setAdmissionRequests(data?.requests || []);
      setAdmissionRequestStats({
        pending: data?.stats?.pending || 0,
        approvedToday: data?.stats?.approvedToday || 0,
        rejected: data?.stats?.rejected || 0,
        urgent: data?.stats?.urgent || 0
      });
    } catch (error: any) {
      toast.error('Failed to load admission requests: ' + (error.message || 'Unknown error'));
      setAdmissionRequests([]);
      setAdmissionRequestStats({
        pending: 0,
        approvedToday: 0,
        rejected: 0,
        urgent: 0
      });
    } finally {
      setLoadingAdmissionRequests(false);
    }
  };
  
  const handleApproveAdmissionRequest = async (requestId: string | number) => {
    try {
      await api.approveIPDAdmissionRequest(typeof requestId === 'string' ? parseInt(requestId) : requestId);
      toast.success('Admission request approved');
      loadAdmissionRequestsData();
    } catch (error: any) {
      toast.error('Failed to approve request: ' + (error.message || 'Unknown error'));
    }
  };
  
  const handleRejectAdmissionRequest = async (requestId: string | number) => {
    try {
      await api.rejectIPDAdmissionRequest(typeof requestId === 'string' ? parseInt(requestId) : requestId);
      toast.success('Admission request rejected');
      loadAdmissionRequestsData();
    } catch (error: any) {
      toast.error('Failed to reject request: ' + (error.message || 'Unknown error'));
    }
  };
  
  const renderAdmissionRequests = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Doctor Admission Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Review and approve patient admission requests from doctors</p>
          </div>
          <Button variant="outline" onClick={loadAdmissionRequestsData} disabled={loadingAdmissionRequests}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingAdmissionRequests ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {loadingAdmissionRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : admissionRequestStats.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {loadingAdmissionRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : admissionRequestStats.approvedToday}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {loadingAdmissionRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : admissionRequestStats.rejected}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent Requests</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {loadingAdmissionRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : admissionRequestStats.urgent}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admission Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Admission Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAdmissionRequests ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Loading admission requests...</span>
              </div>
            ) : admissionRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No admission requests found</p>
                <p className="text-sm mt-1">No pending admission requests from doctors.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Ward Preference</TableHead>
                    <TableHead>Request Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissionRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_id}</TableCell>
                      <TableCell>{request.patient_name}</TableCell>
                      <TableCell>{request.doctor_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={request.priority === 'urgent' || request.priority === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{request.ward_preference || '-'}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {request.requested_at ? new Date(request.requested_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-[#27AE60] hover:bg-green-700" 
                            onClick={() => handleApproveAdmissionRequest(request.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRejectAdmissionRequest(request.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= RENDER CONTENT =============
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'admissions':
        return renderAdmissions();
      case 'patient-details':
        return renderPatientDetails();
      case 'wards':
        return renderWardManagement();
      case 'ward-beds':
        return selectedWard ? (
          <WardBedView 
            ward={selectedWard} 
            onBack={() => setActiveSection('wards')} 
          />
        ) : renderWardManagement();
      case 'beds':
        return renderBedManagement();
      case 'private-rooms':
        return renderPrivateRooms();
      case 'discharges':
        return renderDischarges();
      case 'reports':
        return renderReports();
      case 'analytics':
        return renderAnalytics();
      case 'duty-roster':
        return renderDutyRoster();
      case 'dispositions':
        return renderDispositions();
      case 'rehabilitation':
        return renderRehabilitation();
      case 'birth-certificates':
        return renderBirthCertificates();
      case 'death-certificates':
        return renderDeathCertificates();
      case 'transfer-history':
        return renderTransferHistory();
      case 'doctor-requests':
      case 'admission-requests':
        return renderAdmissionRequests();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl">IPD Management System</h1>
              <p className="text-sm text-blue-100">In-Patient Department</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setIsNotificationsOpen(true)}>
              <Bell className="w-4 h-4 mr-2" />
              {dashboardStats && dashboardStats.stats.critical_patients > 0 && (
                <Badge className="bg-red-500 text-white ml-2">{dashboardStats.stats.critical_patients}</Badge>
              )}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsSettingsDialogOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-72px)] p-4" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
          <div className="space-y-6">
            {/* Main Menu */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <BarChart3 className="w-4 h-4" style={{ color: '#ffffff' }} />
                <span className="text-xs uppercase font-semibold" style={{ color: '#ffffff' }}>Main Menu</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Activity className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveSection('admissions')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'admissions' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Users className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>IPD Patients</span>
                  {dashboardStats && (
                    <Badge className="ml-auto bg-orange-500" style={{ color: '#ffffff' }}>{dashboardStats.stats.current_patients}</Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveSection('wards')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'wards' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Building2 className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Ward Management</span>
                </button>
                <button
                  onClick={() => setActiveSection('beds')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'beds' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Bed className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Bed Management</span>
                </button>
                <button
                  onClick={() => setActiveSection('private-rooms')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'private-rooms' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Home className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Private Room Management</span>
                </button>
                <button
                  onClick={() => setActiveSection('discharges')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'discharges' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Home className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Discharge Management</span>
                </button>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Reports & Analytics */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <BarChart3 className="w-4 h-4" style={{ color: '#ffffff' }} />
                <span className="text-xs uppercase font-semibold" style={{ color: '#ffffff' }}>Reports</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'reports' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <FileText className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>IPD Reports</span>
                </button>
                <button
                  onClick={() => setActiveSection('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'analytics' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <BarChart3 className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Analytics</span>
                </button>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Services */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Settings className="w-4 h-4" style={{ color: '#ffffff' }} />
                <span className="text-xs uppercase font-semibold" style={{ color: '#ffffff' }}>Services</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('duty-roster')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'duty-roster' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Calendar className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Indoor Duty Roster</span>
                </button>
                <button
                  onClick={() => setActiveSection('dispositions')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'dispositions' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <FileText className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Dispositions</span>
                </button>
                <button
                  onClick={() => setActiveSection('rehabilitation')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'rehabilitation' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <Heart className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Rehabilitation Request</span>
                </button>
                <button
                  onClick={() => setActiveSection('birth-certificates')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'birth-certificates' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <FileText className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Birth Certificates</span>
                </button>
                <button
                  onClick={() => setActiveSection('death-certificates')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'death-certificates' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <AlertCircle className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Death Certificates</span>
                </button>
                <button
                  onClick={() => setActiveSection('transfer-history')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'transfer-history' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <RotateCcw className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Bed/Room Transfer History</span>
                </button>
                <button
                  onClick={() => setActiveSection('doctor-requests')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'doctor-requests' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  <User className="w-5 h-5" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Doctor Admission Requests</span>
                  {/* TODO: Add API endpoint for doctor requests count */}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      {/* Admission Dialog */}
        <AdmissionDialog 
          open={isAdmissionDialogOpen} 
          onOpenChange={(open) => {
            setIsAdmissionDialogOpen(open);
            if (!open) {
              setEditingAdmission(null);
            }
          }}
          admission={editingAdmission}
          onSuccess={() => {
            setActiveSection('admissions');
            loadAdmissions();
            setEditingAdmission(null);
          }}
        />

      {/* Ward Dialog */}
      <WardDialog
        open={isWardDialogOpen}
        onOpenChange={setIsWardDialogOpen}
        ward={editingWard}
        onSuccess={() => {
          loadWards();
          setEditingWard(null);
        }}
      />

      {/* Allocate Bed Dialog */}
      <AllocateBedDialog
        open={isAllocateBedDialogOpen}
        onOpenChange={setIsAllocateBedDialogOpen}
        bed={selectedBedForAllocation}
        onSuccess={() => {
          loadBeds();
          loadAdmissions();
          setSelectedBedForAllocation(null);
        }}
      />

      {/* Create Bed Dialog */}
      <CreateBedDialog
        open={isCreateBedDialogOpen}
        onOpenChange={setIsCreateBedDialogOpen}
        bed={editingBed}
        onSuccess={() => {
          loadBeds();
          setEditingBed(null);
        }}
      />

      {/* Bed Dialog (for editing) */}
      <BedDialog
        open={isBedDialogOpen}
        onOpenChange={setIsBedDialogOpen}
        bed={editingBed}
        onSuccess={() => {
          loadBeds();
          setEditingBed(null);
        }}
      />

      {/* Transfer Patient Dialog */}
      <TransferPatientDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        admission={selectedAdmissionForTransfer}
        onSuccess={() => {
          loadBeds();
          loadAdmissions();
          setSelectedAdmissionForTransfer(null);
        }}
      />

      {/* Allocate Room Dialog */}
      <AllocateRoomDialog
        open={isAllocateRoomDialogOpen}
        onOpenChange={setIsAllocateRoomDialogOpen}
        room={selectedRoomForAllocation}
        onSuccess={() => {
          loadRooms();
          loadAdmissions();
          setSelectedRoomForAllocation(null);
        }}
      />

      {/* Room Dialog */}
      <RoomDialog
        open={isRoomDialogOpen}
        onOpenChange={setIsRoomDialogOpen}
        room={editingRoom}
        onSuccess={() => {
          loadRooms();
          setEditingRoom(null);
        }}
      />

      {/* Vitals Dialog */}
      <VitalsDialog 
        open={isVitalsDialogOpen}
        onOpenChange={(open) => {
          setIsVitalsDialogOpen(open);
          if (!open) setEditingVital(null);
        }}
        patient={selectedPatient}
        vital={editingVital}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingVital(null);
          }
        }}
      />

      {/* Treatment Order Dialog */}
      <TreatmentOrderDialog 
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Discharge Dialog */}
      <DischargeDialog 
        open={isDischargeDialogOpen}
        onOpenChange={setIsDischargeDialogOpen}
        patient={selectedPatient}
        billing={billing}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            loadAdmissions();
          }
        }}
      />

      {/* Nursing Note Dialog */}
      <NursingNoteDialog 
        open={isNursingNoteDialogOpen}
        onOpenChange={setIsNursingNoteDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Payment Dialog */}
      <PaymentDialog 
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        patient={selectedPatient}
        billing={billing}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Daily Care Order Dialog */}
      <DailyCareOrderDialog
        open={isDailyCareOrderDialogOpen}
        onOpenChange={(open) => {
          setIsDailyCareOrderDialogOpen(open);
          if (!open) setEditingDailyCareOrder(null);
        }}
        patient={selectedPatient}
        careOrder={editingDailyCareOrder}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingDailyCareOrder(null);
          }
        }}
      />

      {/* Medication Dialog */}
      <MedicationDialog
        open={isMedicationDialogOpen}
        onOpenChange={(open) => {
          setIsMedicationDialogOpen(open);
          if (!open) setEditingMedication(null);
        }}
        patient={selectedPatient}
        medication={editingMedication}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingMedication(null);
          }
        }}
      />

      {/* Lab Order Dialog */}
      <LabOrderDialog
        open={isLabOrderDialogOpen}
        onOpenChange={(open) => {
          setIsLabOrderDialogOpen(open);
          if (!open) setEditingLabOrder(null);
        }}
        patient={selectedPatient}
        labOrder={editingLabOrder}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingLabOrder(null);
          }
        }}
      />

      {/* Radiology Order Dialog */}
      <RadiologyOrderDialog
        open={isRadiologyOrderDialogOpen}
        onOpenChange={(open) => {
          setIsRadiologyOrderDialogOpen(open);
          if (!open) setEditingRadiologyOrder(null);
        }}
        patient={selectedPatient}
        radiologyOrder={editingRadiologyOrder}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingRadiologyOrder(null);
          }
        }}
      />

      {/* Doctor Note Dialog */}
      <DoctorNoteDialog
        open={isDoctorNoteDialogOpen}
        onOpenChange={(open) => {
          setIsDoctorNoteDialogOpen(open);
          if (!open) setEditingDoctorNote(null);
        }}
        patient={selectedPatient}
        doctorNote={editingDoctorNote}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingDoctorNote(null);
          }
        }}
      />

      {/* Pharmacist Note Dialog */}
      <PharmacistNoteDialog
        open={isPharmacistNoteDialogOpen}
        onOpenChange={(open) => {
          setIsPharmacistNoteDialogOpen(open);
          if (!open) setEditingPharmacistNote(null);
        }}
        patient={selectedPatient}
        pharmacistNote={editingPharmacistNote}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingPharmacistNote(null);
          }
        }}
      />

      {/* Procedure Dialog */}
      <ProcedureDialog
        open={isProcedureDialogOpen}
        onOpenChange={(open) => {
          setIsProcedureDialogOpen(open);
          if (!open) setEditingProcedure(null);
        }}
        patient={selectedPatient}
        procedure={editingProcedure}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingProcedure(null);
          }
        }}
      />

      {/* Nutrition Dialog */}
      <NutritionDialog
        open={isNutritionDialogOpen}
        onOpenChange={(open) => {
          setIsNutritionDialogOpen(open);
          if (!open) setEditingNutrition(null);
        }}
        patient={selectedPatient}
        nutrition={editingNutrition}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingNutrition(null);
          }
        }}
      />

      {/* Intake & Output Dialog */}
      <IntakeOutputDialog
        open={isIntakeOutputDialogOpen}
        onOpenChange={(open) => {
          setIsIntakeOutputDialogOpen(open);
          if (!open) setEditingIntakeOutput(null);
        }}
        patient={selectedPatient}
        intakeOutput={editingIntakeOutput}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
            setEditingIntakeOutput(null);
          }
        }}
      />

      {/* File Dialog */}
      <FileDialog
        open={isFileDialogOpen}
        onOpenChange={setIsFileDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Health & Physical Habit Dialog */}
      <HealthPhysicalDialog
        open={isHealthPhysicalDialogOpen}
        onOpenChange={setIsHealthPhysicalDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Form Dialog */}
      <FormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Doctor Recommendation Dialog */}
      <DoctorRecommendationDialog
        open={isDoctorRecommendationDialogOpen}
        onOpenChange={setIsDoctorRecommendationDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* Doctor Consultation Dialog */}
      <DoctorConsultationDialog
        open={isDoctorConsultationDialogOpen}
        onOpenChange={setIsDoctorConsultationDialogOpen}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient?.id) {
            loadPatientDetailsData();
          }
        }}
      />

      {/* New Rehabilitation Request Dialog */}
      <NewRehabilitationRequestDialog
        open={isNewRehabilitationDialogOpen}
        onOpenChange={setIsNewRehabilitationDialogOpen}
        onSuccess={() => {
          loadRehabilitationData();
        }}
      />

      {/* View Rehabilitation Request Dialog */}
      <ViewRehabilitationRequestDialog
        open={isViewRehabilitationDialogOpen}
        onOpenChange={setIsViewRehabilitationDialogOpen}
        request={selectedRehabilitationRequest}
      />

      {/* Edit Rehabilitation Request Dialog */}
      <EditRehabilitationRequestDialog
        open={isEditRehabilitationDialogOpen}
        onOpenChange={setIsEditRehabilitationDialogOpen}
        request={selectedRehabilitationRequest}
        onSuccess={() => {
          loadRehabilitationData();
          setSelectedRehabilitationRequest(null);
        }}
      />

      {/* Advanced Filters Dialog */}
      <AdvancedFiltersDialog
        open={isAdvancedFiltersDialogOpen}
        onOpenChange={setIsAdvancedFiltersDialogOpen}
        filters={advancedFilters}
        onApplyFilters={(filters) => {
          setAdvancedFilters(filters);
        }}
        wards={wards}
        doctors={doctors}
        departments={Array.from(new Set(admissions.map(a => a.department).filter(Boolean)))}
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
        dashboardStats={dashboardStats}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />
    </div>
  );
}

// ============= SUB-COMPONENTS =============

function AdmissionDialog({ 
  open, 
  onOpenChange,
  onSuccess,
  admission
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  admission?: IPDAdmission | null;
}) {
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  
  // Real-time data states
  const [wards, setWards] = useState<IPDWard[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IPDBed[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [accommodationType, setAccommodationType] = useState<'ward' | 'room'>('ward');
  
  // Form state
  const [admissionType, setAdmissionType] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [consultingDoctorId, setConsultingDoctorId] = useState<string>('');
  const [admittedBy, setAdmittedBy] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState<string>('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState<string>('');
  const [insuranceCoverageAmount, setInsuranceCoverageAmount] = useState<string>('');
  const [insuranceApprovalNumber, setInsuranceApprovalNumber] = useState<string>('');
  const [advancePayment, setAdvancePayment] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const loadAdmissionData = async () => {
    if (!admission?.id) return;
    
    try {
      setLoadingData(true);
      // Load full admission details
      const admissionData = await api.getIPDAdmission(admission.id);
      
      // Set patient data
      if (admissionData.patient_id) {
        try {
          const patient = await api.getPatient(admissionData.patient_id.toString());
          setSelectedPatient(patient);
          setPatientSearch(patient.name || '');
        } catch (err) {
          // Patient might not exist, use admission data
          setSelectedPatient({
            id: admissionData.patient_id.toString(),
            name: admissionData.patient_name || '',
            uhid: admissionData.uhid || '',
            patient_id: admissionData.patient_id
          });
          setPatientSearch(admissionData.patient_name || '');
        }
      }
      
      // Set accommodation type and IDs
      if (admissionData.ward_id) {
        setAccommodationType('ward');
        setSelectedWardId(admissionData.ward_id.toString());
        if (admissionData.bed_id) {
          setSelectedBedId(admissionData.bed_id.toString());
        }
      } else if (admissionData.room_id) {
        setAccommodationType('room');
        setSelectedRoomId(admissionData.room_id.toString());
      }
      
      // Set form fields
      setAdmissionType(admissionData.admission_type?.toLowerCase() || '');
      setDepartment(admissionData.department || '');
      setConsultingDoctorId(admissionData.consulting_doctor_id?.toString() || '');
      setAdmittedBy(admissionData.admitted_by_name || '');
      setDiagnosis(admissionData.diagnosis || '');
      setEstimatedDuration(admissionData.estimated_duration?.toString() || '');
      
      // Insurance fields
      if (admissionData.insurance_provider) {
        setHasInsurance(true);
        setInsuranceProvider(admissionData.insurance_provider);
        setInsurancePolicyNumber(admissionData.insurance_policy_number || '');
        setInsuranceCoverageAmount(admissionData.insurance_coverage_amount?.toString() || '');
        setInsuranceApprovalNumber(admissionData.insurance_approval_number || '');
      }
      
      // Payment fields
      if (admissionData.advance_payment) {
        setAdvancePayment(admissionData.advance_payment.toString());
      }
      if (admissionData.payment_mode) {
        setPaymentMode(admissionData.payment_mode.toLowerCase());
      }
      
      // Patient contact fields
      setEmergencyContact((admissionData as any).patient_emergency_contact || '');
      setAddress((admissionData as any).patient_address || '');
      
    } catch (error: any) {
      toast.error('Failed to load admission data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingData(false);
    }
  };
  
  // Load real-time data when dialog opens
  useEffect(() => {
    if (open) {
      loadRealTimeData();
      if (admission) {
        // Edit mode - load admission data
        loadAdmissionData();
    }
    }
  }, [open, admission]);
  
  // Load beds when ward is selected
  useEffect(() => {
    if (selectedWardId && accommodationType === 'ward') {
      loadWardBeds(parseInt(selectedWardId));
    }
  }, [selectedWardId, accommodationType]);
  
  const loadRealTimeData = async () => {
    try {
      setLoadingData(true);
      // Load all data in parallel for real-time updates
      const [wardsData, roomsData, doctorsData, bedsData] = await Promise.all([
        api.getIPDWards().catch(() => []),
        api.getIPDRooms({ status: 'available' }).catch(() => []),
        api.getDoctors({ status: 'Available' }).catch(() => []),
        api.getAvailableIPDBeds().catch(() => [])
      ]);
      
      setWards(wardsData || []);
      setRooms(roomsData || []);
      setDoctors(doctorsData || []);
      setAvailableBeds(bedsData || []);
    } catch (error: any) {
      toast.error('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingData(false);
    }
  };
  
  const loadWardBeds = async (wardId: number) => {
    try {
      const beds = await api.getAvailableIPDBeds({ ward_id: wardId });
      setAvailableBeds(beds || []);
    } catch (error: any) {
      toast.error('Failed to load beds: ' + (error.message || 'Unknown error'));
      setAvailableBeds([]);
    }
  };
  
  // Search patients with debounce
  useEffect(() => {
    if (!patientSearch || patientSearch.length < 2) {
      setPatientSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPatients();
    }, 500);

    return () => clearTimeout(timer);
  }, [patientSearch]);
  
  const searchPatients = async () => {
    try {
      setSearchingPatients(true);
      const data = await api.getPatients({ search: patientSearch });
      setPatientSearchResults(data || []);
    } catch (error: any) {
      toast.error('Failed to search patients: ' + (error.message || 'Unknown error'));
      setPatientSearchResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };
  
  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name || '');
    setPatientSearchResults([]);
  };
  
  // Reset form when dialog closes (only if not in edit mode)
  useEffect(() => {
    if (!open && !admission) {
      setPatientSearch('');
      setSelectedPatient(null);
      setPatientSearchResults([]);
      setSelectedWardId('');
      setSelectedBedId('');
      setSelectedRoomId('');
      setAccommodationType('ward');
      setAvailableBeds([]);
      setAdmissionType('');
      setDepartment('');
      setConsultingDoctorId('');
      setAdmittedBy('');
      setDiagnosis('');
      setEstimatedDuration('');
      setHasInsurance(false);
      setInsuranceProvider('');
      setInsurancePolicyNumber('');
      setInsuranceCoverageAmount('');
      setInsuranceApprovalNumber('');
      setAdvancePayment('');
      setPaymentMode('');
      setEmergencyContact('');
      setAddress('');
    }
  }, [open, admission]);
  
  // Update form fields when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      setEmergencyContact(selectedPatient.emergency_contact_phone || '');
      setAddress(selectedPatient.address || '');
    }
  }, [selectedPatient]);
  
  const handleSubmit = async () => {
    if (!selectedPatient || !selectedPatient.id) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!admissionType || !department || !consultingDoctorId || !diagnosis) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (accommodationType === 'ward' && (!selectedWardId || !selectedBedId)) {
      toast.error('Please select a ward and bed');
      return;
    }
    
    if (accommodationType === 'room' && !selectedRoomId) {
      toast.error('Please select a room');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const admissionData: any = {
        patient_id: parseInt(selectedPatient.id),
        uhid: selectedPatient.uhid || selectedPatient.patient_id || '',
        admission_date: new Date().toISOString().split('T')[0],
        admission_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        admission_type: admissionType.charAt(0).toUpperCase() + admissionType.slice(1),
        department: department,
        consulting_doctor_id: parseInt(consultingDoctorId),
        diagnosis: diagnosis,
      };
      
      if (accommodationType === 'ward') {
        admissionData.ward_id = parseInt(selectedWardId);
        admissionData.bed_id = parseInt(selectedBedId);
      } else {
        admissionData.room_id = parseInt(selectedRoomId);
      }
      
      if (estimatedDuration) {
        admissionData.estimated_duration = parseInt(estimatedDuration);
      }
      
      if (hasInsurance) {
        admissionData.insurance_provider = insuranceProvider;
        admissionData.insurance_policy_number = insurancePolicyNumber;
        if (insuranceCoverageAmount) {
          admissionData.insurance_coverage_amount = parseFloat(insuranceCoverageAmount);
        }
        admissionData.insurance_approval_number = insuranceApprovalNumber;
      }
      
      if (advancePayment) {
        admissionData.advance_payment = parseFloat(advancePayment);
      }
      
      if (paymentMode) {
        admissionData.payment_mode = paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1);
      }
      
      if (admission?.id) {
        // Update existing admission
        await api.updateIPDAdmission(admission.id, admissionData);
        toast.success('Admission updated successfully!');
      } else {
        // Create new admission
      await api.createIPDAdmission(admissionData);
      toast.success('Patient admitted successfully!');
      }
      
      onOpenChange(false);
      
      // Redirect to admissions listing page
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error('Failed to admit patient: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{admission ? 'Edit IPD Admission' : 'New IPD Admission'}</DialogTitle>
          <DialogDescription>
            {admission ? 'Update patient admission details' : 'Fill in patient details for admission'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <Tabs defaultValue="patient-info">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
              <TabsTrigger value="admission">Admission Details</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="patient-info" className="space-y-4">
              {/* Patient Search Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <Label className="text-base mb-3 block">Search Patient</Label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by name or UHID..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="pl-10 h-12 text-base border-2 border-blue-300 focus:border-blue-500"
                    />
                    
                    {/* Search Results Dropdown */}
                    {searchingPatients && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">Searching...</span>
                        </div>
                      </div>
                    )}
                    {!searchingPatients && patientSearch && patientSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {patientSearchResults.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{patient.name}</p>
                                <p className="text-xs text-gray-600">
                                  {patient.patient_id || patient.uhid || patient.id} • {patient.age || 0}Y, {patient.gender || ''}
                                </p>
                              </div>
                              {patient.phone && <Badge variant="outline">{patient.phone}</Badge>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!searchingPatients && patientSearch && patientSearchResults.length === 0 && patientSearch.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 p-4 text-center text-sm text-gray-600">
                        No patients found
                      </div>
                    )}
                  </div>

                  <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-blue-600" />
                          Add New Patient
                        </DialogTitle>
                        <DialogDescription>
                          Fill in the patient details to register a new patient in the system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="text-center py-8 text-gray-500">
                        Patient registration form will be implemented here
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Selected Patient Display */}
                {selectedPatient && (
                  <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{selectedPatient.name}</p>
                          <p className="text-sm text-gray-600">
                            {selectedPatient.patient_id || selectedPatient.uhid || selectedPatient.id} • {selectedPatient.age || 0}Y, {selectedPatient.gender || ''} • {selectedPatient.phone || ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(null);
                          setPatientSearch('');
                        }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Patient Details (Auto-filled from selected patient) */}
              {selectedPatient && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient Name *</Label>
                    <Input defaultValue={selectedPatient.name || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Age *</Label>
                    <Input type="number" defaultValue={selectedPatient.age || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Input defaultValue={selectedPatient.gender || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number *</Label>
                    <Input defaultValue={selectedPatient.phone || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input 
                      value={emergencyContact} 
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Emergency contact" 
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Address</Label>
                    <Textarea 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Complete address" 
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="admission" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admission Type *</Label>
                  <Select value={admissionType} onValueChange={setAdmissionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consulting Doctor *</Label>
                  <Select value={consultingDoctorId} onValueChange={setConsultingDoctorId}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingData ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">Loading doctors...</div>
                      ) : doctors.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No doctors available</div>
                      ) : (
                        doctors.filter(doctor => doctor.id).map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id?.toString() || '0'}>
                            {doctor.name} - {doctor.specialty || doctor.specialization || ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Admitted By</Label>
                  <Input 
                    value={admittedBy} 
                    onChange={(e) => setAdmittedBy(e.target.value)}
                    placeholder="Doctor name" 
                  />
                </div>
                
                {/* Accommodation Type Toggle */}
                <div className="col-span-2 space-y-2">
                  <Label>Accommodation Type *</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={accommodationType === 'ward' ? 'default' : 'outline'}
                      onClick={() => {
                        setAccommodationType('ward');
                        setSelectedWardId('');
                        setAvailableBeds([]);
                      }}
                      className="flex-1"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Ward & Bed
                    </Button>
                    <Button
                      type="button"
                      variant={accommodationType === 'room' ? 'default' : 'outline'}
                      onClick={() => {
                        setAccommodationType('room');
                        setSelectedWardId('');
                        setAvailableBeds([]);
                        // Reload rooms when switching to room type
                        if (open) {
                          api.getIPDRooms({ status: 'available' }).then(data => {
                            setRooms(data || []);
                          }).catch(() => {});
                        }
                      }}
                      className="flex-1"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Private Room
                    </Button>
                  </div>
                </div>
                
                {/* Ward & Bed Selection */}
                {accommodationType === 'ward' && (
                  <>
                    <div className="space-y-2">
                      <Label>Ward *</Label>
                      <Select value={selectedWardId} onValueChange={setSelectedWardId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingData ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">Loading wards...</div>
                          ) : wards.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">No wards available</div>
                          ) : (
                            wards.filter(ward => ward.id && ward.status === 'active').map(ward => {
                              const occupiedBeds = ward.occupied_beds || 0;
                              const totalBeds = ward.total_beds || 0;
                              const availableBedsCount = totalBeds - occupiedBeds;
                              return (
                                <SelectItem key={ward.id} value={ward.id?.toString() || '0'}>
                                  {ward.name} ({availableBedsCount} available / {totalBeds} total)
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bed Number *</Label>
                      <Select value={selectedBedId} onValueChange={setSelectedBedId} disabled={!selectedWardId}>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedWardId ? "Select bed" : "Select ward first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {!selectedWardId ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">Please select a ward first</div>
                          ) : availableBeds.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-gray-500">Loading beds...</div>
                          ) : (
                            availableBeds.filter(bed => bed.id && bed.status === 'available').map(bed => (
                              <SelectItem key={bed.id} value={bed.id?.toString() || '0'}>
                                {bed.bed_number} - {bed.ward_name} (${bed.daily_rate || 0}/day)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {/* Room Selection */}
                {accommodationType === 'room' && (
                  <div className="space-y-2">
                    <Label>Private Room *</Label>
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingData ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">Loading rooms...</div>
                        ) : rooms.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-gray-500">No available rooms</div>
                        ) : (
                          rooms.filter(room => room.id && room.status === 'available').map(room => (
                            <SelectItem key={room.id} value={room.id?.toString() || '0'}>
                              {room.room_number} - {room.room_type} (${room.daily_rate || 0}/day)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="col-span-2 space-y-2">
                  <Label>Diagnosis *</Label>
                  <Textarea 
                    value={diagnosis} 
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Primary diagnosis" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Duration (days)</Label>
                  <Input 
                    type="number" 
                    value={estimatedDuration} 
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="7" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <Label>Has Insurance Coverage?</Label>
                <Switch checked={hasInsurance} onCheckedChange={setHasInsurance} />
              </div>
              {hasInsurance && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Provider</Label>
                    <Input 
                      value={insuranceProvider} 
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      placeholder="Provider name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Number</Label>
                    <Input 
                      value={insurancePolicyNumber} 
                      onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                      placeholder="Policy number" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coverage Amount</Label>
                    <Input 
                      type="number" 
                      value={insuranceCoverageAmount} 
                      onChange={(e) => setInsuranceCoverageAmount(e.target.value)}
                      placeholder="0" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TPA Approval Number</Label>
                    <Input 
                      value={insuranceApprovalNumber} 
                      onChange={(e) => setInsuranceApprovalNumber(e.target.value)}
                      placeholder="Approval number" 
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Advance Payment</Label>
                  <Input 
                    type="number" 
                    value={advancePayment} 
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Minimum advance payment required based on ward type and estimated duration.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleSubmit}
            disabled={submitting || !selectedPatient}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {admission ? 'Updating...' : 'Admitting...'}
              </>
            ) : (
              admission ? 'Update Admission' : 'Admit Patient'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= WARD DIALOG =============
function WardDialog({
  open,
  onOpenChange,
  ward,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ward: IPDWard | null;
  onSuccess?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>('basic-info');
  const [name, setName] = useState<string>('');
  const [wardCode, setWardCode] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [totalBeds, setTotalBeds] = useState<string>('');
  const [occupiedBeds, setOccupiedBeds] = useState<string>('0');
  const [availableBeds, setAvailableBeds] = useState<string>('0');
  const [defaultBedType, setDefaultBedType] = useState<string>('');
  const [roomConfiguration, setRoomConfiguration] = useState<string>('');
  const [numberOfRooms, setNumberOfRooms] = useState<string>('');
  const [totalArea, setTotalArea] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState<string>('');
  const [nurseInCharge, setNurseInCharge] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [requiredNursesPerShift, setRequiredNursesPerShift] = useState<string>('2');
  const [requiredDoctorsPerShift, setRequiredDoctorsPerShift] = useState<string>('1');
  const [assignedDoctors, setAssignedDoctors] = useState<Array<{id: number; name: string; specialty: string; doctor_id: string}>>([]);
  const [assignedNurses, setAssignedNurses] = useState<Array<{id: number; name: string; role?: string}>>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [isAssignDoctorDialogOpen, setIsAssignDoctorDialogOpen] = useState(false);
  const [isAssignNurseDialogOpen, setIsAssignNurseDialogOpen] = useState(false);
  const [charges, setCharges] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      if (ward) {
        // Edit mode - populate form
        setName(ward.name || '');
        setWardCode((ward as any).code || '');
        setType(ward.type || '');
        setDepartment((ward as any).department || '');
        setFloorNumber((ward.floor_id || '').toString());
        setBuilding(ward.building || '');
        setDescription(ward.description || '');
        setTotalBeds((ward.total_beds || 0).toString());
        setOccupiedBeds((ward.occupied_beds || 0).toString());
        setAvailableBeds((ward.available_beds || 0).toString());
        setDefaultBedType((ward as any).default_bed_type || '');
        setRoomConfiguration((ward as any).room_configuration || '');
        setNumberOfRooms((ward as any).number_of_rooms?.toString() || '');
        setTotalArea((ward as any).total_area?.toString() || '');
        const facilitiesArray = typeof ward.facilities === 'string' 
          ? JSON.parse(ward.facilities || '[]') 
          : (ward.facilities || []);
        setFacilities(facilitiesArray);
        setNurseInCharge((ward.incharge_user_id || '').toString());
        setContactNumber(ward.contact || '');
        setRequiredNursesPerShift((ward as any).required_nurses_per_shift?.toString() || '2');
        setRequiredDoctorsPerShift((ward as any).required_doctors_per_shift?.toString() || '1');
        setAssignedDoctors((ward as any).assigned_doctors || []);
        setAssignedNurses((ward as any).assigned_nurses || []);
      } else {
        // Add mode - reset form
        setName('');
        setWardCode('');
        setType('');
        setDepartment('');
        setFloorNumber('');
        setBuilding('');
        setDescription('');
        setTotalBeds('');
        setOccupiedBeds('0');
        setAvailableBeds('0');
        setDefaultBedType('');
        setRoomConfiguration('');
        setNumberOfRooms('');
        setTotalArea('');
        setFacilities([]);
        setNurseInCharge('');
        setContactNumber('');
        setRequiredNursesPerShift('2');
        setRequiredDoctorsPerShift('1');
        setAssignedDoctors([]);
        setAssignedNurses([]);
        setCharges('');
      }
      setFacilityInput('');
      setActiveTab('basic-info');
    }
  }, [open, ward]);
  
  // Load doctors and nurses when dialog opens
  useEffect(() => {
    if (open) {
      const loadDoctorsAndNurses = async () => {
        try {
          const [doctorsData, nursesData] = await Promise.all([
            api.getDoctors().catch(() => []),
            api.getUsers({ role: 'nurse', status: 'active' }).catch(() => [])
          ]);
          setDoctors(doctorsData || []);
          setNurses(nursesData || []);
        } catch (error) {
          console.error('Error loading doctors/nurses:', error);
        }
      };
      loadDoctorsAndNurses();
    }
  }, [open]);
  
  // Calculate available beds when total or occupied changes
  useEffect(() => {
    const total = parseInt(totalBeds) || 0;
    const occupied = parseInt(occupiedBeds) || 0;
    const available = Math.max(0, total - occupied);
    setAvailableBeds(available.toString());
  }, [totalBeds, occupiedBeds]);
  
  const handleAddFacility = () => {
    if (facilityInput.trim() && !facilities.includes(facilityInput.trim())) {
      setFacilities([...facilities, facilityInput.trim()]);
      setFacilityInput('');
    }
  };
  
  const handleRemoveFacility = (facility: string) => {
    setFacilities(facilities.filter(f => f !== facility));
  };
  
  const handleAssignDoctor = (doctor: any) => {
    if (!assignedDoctors.find(d => d.id === doctor.id)) {
      setAssignedDoctors([...assignedDoctors, {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty || '',
        doctor_id: doctor.doctor_id || ''
      }]);
    }
    setIsAssignDoctorDialogOpen(false);
  };
  
  const handleRemoveDoctor = (doctorId: number) => {
    setAssignedDoctors(assignedDoctors.filter(d => d.id !== doctorId));
  };
  
  const handleAssignNurse = (nurse: any) => {
    if (!assignedNurses.find(n => n.id === nurse.id)) {
      setAssignedNurses([...assignedNurses, {
        id: nurse.id,
        name: nurse.name || nurse.username || '',
        role: nurse.role || 'nurse'
      }]);
    }
    setIsAssignNurseDialogOpen(false);
  };
  
  const handleRemoveNurse = (nurseId: number) => {
    setAssignedNurses(assignedNurses.filter(n => n.id !== nurseId));
  };
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Ward name is required');
      return;
    }
    if (!wardCode.trim()) {
      toast.error('Ward code is required');
      return;
    }
    if (!type) {
      toast.error('Ward type is required');
      return;
    }
    if (!department) {
      toast.error('Department is required');
      return;
    }
    if (!floorNumber) {
      toast.error('Floor number is required');
      return;
    }
    if (!totalBeds || parseInt(totalBeds) <= 0) {
      toast.error('Total beds must be greater than 0');
      return;
    }
    
    try {
      setSubmitting(true);
      const wardData: any = {
        name: name.trim(),
        code: wardCode.trim(),
        type: type,
        department: department,
        floor_id: parseInt(floorNumber),
        total_beds: parseInt(totalBeds),
        facilities: facilities,
        charges: charges ? parseFloat(charges) : null
      };
      
      if (building) wardData.building = building.trim();
      if (description) wardData.description = description.trim();
      if (occupiedBeds) wardData.occupied_beds = parseInt(occupiedBeds);
      if (availableBeds) wardData.available_beds = parseInt(availableBeds);
      if (defaultBedType) wardData.default_bed_type = defaultBedType;
      if (roomConfiguration) wardData.room_configuration = roomConfiguration;
      if (numberOfRooms) wardData.number_of_rooms = parseInt(numberOfRooms);
      if (totalArea) wardData.total_area = parseFloat(totalArea);
      if (nurseInCharge) wardData.nurse_incharge_user_id = parseInt(nurseInCharge);
      if (contactNumber) wardData.contact_number = contactNumber.trim();
      if (requiredNursesPerShift) wardData.required_nurses_per_shift = parseInt(requiredNursesPerShift);
      if (requiredDoctorsPerShift) wardData.required_doctors_per_shift = parseInt(requiredDoctorsPerShift);
      if (assignedDoctors.length > 0) wardData.assigned_doctors = assignedDoctors;
      if (assignedNurses.length > 0) wardData.assigned_nurses = assignedNurses;
      
      if (ward) {
        // Update existing ward
        await api.updateIPDWard(ward.id!, wardData);
        toast.success('Ward updated successfully');
      } else {
        // Create new ward
        await api.createIPDWard(wardData);
        toast.success('Ward created successfully');
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save ward: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[76.8rem] sm:!max-w-[76.8rem] !h-[90vh] max-h-[90vh] overflow-hidden p-0 gap-0 w-[95vw] sm:!w-[76.8rem]" style={{ display: 'flex', flexDirection: 'column', gridTemplateColumns: 'none', grid: 'none', width: '95vw', maxWidth: '76.8rem', minWidth: 'min(95vw, 76.8rem)', overflowX: 'hidden' }}>
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <span className="truncate">{ward ? 'Edit Ward' : 'Add New Ward'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {ward ? 'Update ward information' : 'Create a new ward with comprehensive details including facilities, equipment, and staffing'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0 overflow-x-hidden" style={{ minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1 bg-gray-100 p-1 mb-4">
              <TabsTrigger value="basic-info" className="text-xs sm:text-sm px-2 py-2">Basic Info</TabsTrigger>
              <TabsTrigger value="capacity" className="text-xs sm:text-sm px-2 py-2">Capacity</TabsTrigger>
              <TabsTrigger value="facilities" className="text-xs sm:text-sm px-2 py-2">Facilities</TabsTrigger>
              <TabsTrigger value="staff" className="text-xs sm:text-sm px-2 py-2">Staff</TabsTrigger>
              <TabsTrigger value="charges" className="text-xs sm:text-sm px-2 py-2 col-span-2 sm:col-span-1">Charges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                  Provide basic information about the ward including name, type, and location
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ward Name <span className="text-red-500">*</span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., General Ward A, ICU 1, Private Wing"
                    className="h-11"
              />
                  <p className="text-xs text-gray-500">Enter a unique and descriptive ward name</p>
            </div>
                
            <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ward Code <span className="text-red-500">*</span></Label>
                  <Input
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value)}
                    placeholder="e.g., GWA-01, ICU-1"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Unique identifier for the ward</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ward Type <span className="text-red-500">*</span></Label>
              <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select ward type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="NICU">NICU</SelectItem>
                  <SelectItem value="PICU">PICU</SelectItem>
                  <SelectItem value="CCU">CCU</SelectItem>
                  <SelectItem value="HDU">HDU</SelectItem>
                  <SelectItem value="Isolation">Isolation</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                </SelectContent>
              </Select>
            </div>
                
            <div className="space-y-2">
                  <Label className="text-sm font-semibold">Department <span className="text-red-500">*</span></Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
            </div>
                
            <div className="space-y-2">
                  <Label className="text-sm font-semibold">Floor Number <span className="text-red-500">*</span></Label>
                  <Select value={floorNumber} onValueChange={setFloorNumber}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(floor => (
                        <SelectItem key={floor} value={floor.toString()}>{floor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </div>
                
            <div className="space-y-2">
                  <Label className="text-sm font-semibold">Building/Block</Label>
              <Input
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                    placeholder="e.g., Main Building, Block A"
                    className="h-11"
              />
            </div>
              </div>
              
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Ward Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description of the ward, its purpose, and special features..."
                  className="min-h-[100px]"
                />
            </div>
            </TabsContent>
            
            <TabsContent value="capacity" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs sm:text-sm">
                  Configure bed capacity and room layout for the ward
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Total Beds <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(e.target.value)}
                    placeholder="0"
                    className="h-11"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Currently Occupied</Label>
                  <Input
                    type="number"
                    value={occupiedBeds}
                    placeholder="0"
                    className="h-11"
                    readOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Available Beds</Label>
                  <Input
                    type="number"
                    value={availableBeds}
                    placeholder="0"
                    className="h-11"
                    readOnly
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Bed Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Default Bed Type</Label>
                    <Select value={defaultBedType} onValueChange={setDefaultBedType}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select bed type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                        <SelectItem value="Isolation">Isolation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Room Configuration</Label>
                    <Select value={roomConfiguration} onValueChange={setRoomConfiguration}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select configuration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Double">Double</SelectItem>
                        <SelectItem value="Multi-bed">Multi-bed</SelectItem>
                        <SelectItem value="Ward">Ward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Number of Rooms</Label>
                    <Input
                      type="number"
                      value={numberOfRooms}
                      onChange={(e) => setNumberOfRooms(e.target.value)}
                      placeholder="0"
                      className="h-11"
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Total Area (sq. ft)</Label>
                    <Input
                      type="number"
                      value={totalArea}
                      onChange={(e) => setTotalArea(e.target.value)}
                      placeholder="0"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Bed numbering will be automatically generated based on ward code and total beds
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="facilities" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                  Add facilities and equipment available in this ward
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Facility Name</Label>
                <Input
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFacility();
                    }
                  }}
                    placeholder="Enter facility name"
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">&nbsp;</Label>
                  <Button type="button" onClick={handleAddFacility} variant="outline" className="h-11 w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Facility
                </Button>
              </div>
              </div>
              
              {facilities.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Added Facilities</Label>
                  <div className="flex flex-wrap gap-2">
                  {facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                      {facility}
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(facility)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="staff" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-orange-50 border-orange-200">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-xs sm:text-sm">
                  Assign nursing staff and doctors to this ward
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nurse In-Charge <span className="text-red-500">*</span></Label>
                    <Select value={nurseInCharge} onValueChange={setNurseInCharge}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select nurse in-charge" />
                      </SelectTrigger>
                      <SelectContent>
                        {nurses.map((nurse) => (
                          <SelectItem key={nurse.id} value={nurse.id.toString()}>
                            {nurse.name || nurse.username || `Nurse ${nurse.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Contact Number <span className="text-red-500">*</span></Label>
                    <Input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+92-300-1234567"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Required Nurses per Shift</Label>
                    <Input
                      type="number"
                      value={requiredNursesPerShift}
                      onChange={(e) => setRequiredNursesPerShift(e.target.value)}
                      placeholder="0"
                      className="h-11"
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Required Doctors per Shift</Label>
                    <Input
                      type="number"
                      value={requiredDoctorsPerShift}
                      onChange={(e) => setRequiredDoctorsPerShift(e.target.value)}
                      placeholder="0"
                      className="h-11"
                      min="1"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Assigned Doctors</h3>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-dashed"
                      onClick={() => setIsAssignDoctorDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Doctor
                    </Button>
                    {assignedDoctors.map((doctor) => (
                      <div key={doctor.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-xs text-gray-500">
                                {doctor.specialty} - ID: {doctor.doctor_id}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDoctor(doctor.id)}
                            className="h-8"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Assigned Nurses</h3>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 border-dashed"
                      onClick={() => setIsAssignNurseDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Nurse
                    </Button>
                    {assignedNurses.map((nurse) => (
                      <div key={nurse.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{nurse.name}</p>
                              <p className="text-xs text-gray-500">
                                {nurse.role || 'Nurse'}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNurse(nurse.id)}
                            className="h-8"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="charges" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                  Set daily charges and pricing for this ward
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Daily Charges</Label>
                  <Input
                    type="number"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                    placeholder="Enter daily charges amount"
                    className="h-11"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">Daily charges per bed in this ward</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0 flex-col-reverse sm:flex-row gap-2 overflow-hidden" style={{ flexShrink: 0, minHeight: 'auto', width: '100%', maxWidth: '100%', display: 'flex', boxSizing: 'border-box', overflowX: 'hidden', overflowY: 'hidden' }}>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="outline" disabled={submitting} className="w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">Preview</span>
          </Button>
          <Button
            className="bg-[#2F80ED] hover:bg-blue-600 w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CircleCheckBig className="w-4 h-4 mr-2" />
                {ward ? 'Update Ward' : 'Create Ward'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Assign Doctor Dialog */}
      <Dialog open={isAssignDoctorDialogOpen} onOpenChange={setIsAssignDoctorDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Doctor</DialogTitle>
            <DialogDescription>Select a doctor to assign to this ward</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {doctors.filter(d => !assignedDoctors.find(ad => ad.id === d.id)).map((doctor) => (
              <div
                key={doctor.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleAssignDoctor(doctor)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-xs text-gray-500">
                      {doctor.specialty || 'General'} - ID: {doctor.doctor_id || doctor.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {doctors.filter(d => !assignedDoctors.find(ad => ad.id === d.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No available doctors to assign
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDoctorDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Nurse Dialog */}
      <Dialog open={isAssignNurseDialogOpen} onOpenChange={setIsAssignNurseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Nurse</DialogTitle>
            <DialogDescription>Select a nurse to assign to this ward</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {nurses.filter(n => !assignedNurses.find(an => an.id === n.id)).map((nurse) => (
              <div
                key={nurse.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleAssignNurse(nurse)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{nurse.name || nurse.username || `Nurse ${nurse.id}`}</p>
                    <p className="text-xs text-gray-500">
                      {nurse.role || 'Nurse'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {nurses.filter(n => !assignedNurses.find(an => an.id === n.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No available nurses to assign
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignNurseDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// ============= BED DIALOG =============
function BedDialog({
  open,
  onOpenChange,
  bed,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bed: IPDBed | null;
  onSuccess?: () => void;
}) {
  const [wardId, setWardId] = useState<string>('');
  const [bedNumber, setBedNumber] = useState<string>('');
  const [bedType, setBedType] = useState<string>('General');
  const [dailyRate, setDailyRate] = useState<string>('');
  const [status, setStatus] = useState<string>('available');
  const [maintenanceNotes, setMaintenanceNotes] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [wards, setWards] = useState<IPDWard[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadWards();
      if (bed) {
        // Edit mode
        setWardId((bed.ward_id || '').toString());
        setBedNumber(bed.bed_number || '');
        setBedType(bed.bed_type || 'General');
        setDailyRate((bed.daily_rate || 0).toString());
        setStatus(bed.status || 'available');
        setMaintenanceNotes(bed.maintenance_notes || '');
        const facilitiesArray = typeof bed.facilities === 'string'
          ? JSON.parse(bed.facilities || '[]')
          : (bed.facilities || []);
        setFacilities(facilitiesArray);
      } else {
        // Add mode
        setWardId('');
        setBedNumber('');
        setBedType('General');
        setDailyRate('');
        setStatus('available');
        setMaintenanceNotes('');
        setFacilities([]);
      }
      setFacilityInput('');
    }
  }, [open, bed]);
  
  const loadWards = async () => {
    try {
      setLoadingWards(true);
      const wardsData = await api.getIPDWards();
      setWards(wardsData || []);
    } catch (error: any) {
      toast.error('Failed to load wards: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingWards(false);
    }
  };
  
  const handleAddFacility = () => {
    if (facilityInput.trim() && !facilities.includes(facilityInput.trim())) {
      setFacilities([...facilities, facilityInput.trim()]);
      setFacilityInput('');
    }
  };
  
  const handleRemoveFacility = (facility: string) => {
    setFacilities(facilities.filter(f => f !== facility));
  };
  
  const handleSubmit = async () => {
    if (!wardId) {
      toast.error('Please select a ward');
      return;
    }
    if (!bedNumber.trim()) {
      toast.error('Bed number is required');
      return;
    }
    if (!dailyRate || parseFloat(dailyRate) < 0) {
      toast.error('Daily rate must be a valid number');
      return;
    }
    
    try {
      setSubmitting(true);
      const bedData: any = {
        ward_id: parseInt(wardId),
        bed_number: bedNumber.trim(),
        bed_type: bedType,
        daily_rate: parseFloat(dailyRate),
        status: status,
        facilities: facilities
      };
      
      if (maintenanceNotes) bedData.maintenance_notes = maintenanceNotes.trim();
      
      if (bed) {
        // Update existing bed
        await api.updateIPDBed(bed.id!, bedData);
        toast.success('Bed updated successfully');
      } else {
        // Create new bed
        await api.createIPDBed(bedData);
        toast.success('Bed created successfully');
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save bed: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bed ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
          <DialogDescription>
            {bed ? 'Update bed information' : 'Create a new bed in the IPD system'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ward *</Label>
              <Select value={wardId} onValueChange={setWardId} disabled={loadingWards}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {loadingWards ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading wards...</div>
                  ) : wards.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No wards available</div>
                  ) : (
                    wards.filter(w => w.id).map((ward) => (
                      <SelectItem key={ward.id} value={ward.id!.toString()}>
                        {ward.name} ({ward.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bed Number *</Label>
              <Input
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="e.g., B-01, Bed 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Bed Type *</Label>
              <Select value={bedType} onValueChange={setBedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Isolation">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Rate *</Label>
              <Input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maintenance Notes</Label>
              <Input
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                placeholder="Notes for maintenance status"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Facilities</Label>
              <div className="flex gap-2">
                <Input
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFacility();
                    }
                  }}
                  placeholder="Add facility (press Enter)"
                />
                <Button type="button" onClick={handleAddFacility} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {facilities.map((facility, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {facility}
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(facility)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              bed ? 'Update Bed' : 'Create Bed'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= ROOM DIALOG =============
function RoomDialog({
  open,
  onOpenChange,
  room,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: IPDRoom | null;
  onSuccess?: () => void;
}) {
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [roomType, setRoomType] = useState<string>('Private');
  const [floorId, setFloorId] = useState<string>('');
  const [dailyRate, setDailyRate] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('1');
  const [status, setStatus] = useState<string>('available');
  const [attendantBed, setAttendantBed] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Available facilities for checkboxes
  const availableFacilities = [
    'AC', 'WiFi', 'Refrigerator', 'Dining Table', 'Work Desk', 'Butler Service',
    'TV', 'Attached Bathroom', 'Sofa', 'Pantry', 'Meeting Room'
  ];
  
  useEffect(() => {
    if (open) {
      loadFloors();
      if (room) {
        // Edit mode
        setRoomNumber(room.room_number || '');
        setRoomType(room.room_type || 'Private');
        setFloorId((room.floor_id || '').toString());
        setDailyRate((room.daily_rate || 0).toString());
        setCapacity((room.capacity || 1).toString());
        setStatus(room.status || 'available');
        setAttendantBed(room.attendant_bed || false);
        setRemarks(room.remarks || '');
        const facilitiesArray = typeof room.facilities === 'string'
          ? JSON.parse(room.facilities || '[]')
          : (room.facilities || []);
        setFacilities(facilitiesArray);
      } else {
        // Add mode
        setRoomNumber('');
        setRoomType('Private');
        setFloorId('');
        setDailyRate('');
        setCapacity('1');
        setStatus('available');
        setAttendantBed(false);
        setRemarks('');
        setFacilities([]);
      }
    }
  }, [open, room]);
  
  const loadFloors = async () => {
    try {
      const data = await api.getFloors({ status: 'Active' });
      setFloors(data);
    } catch (error) {
      console.error('Error loading floors:', error);
    }
  };
  
  const handleFacilityToggle = (facility: string) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter(f => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };
  
  const handleSubmit = async () => {
    if (!roomNumber.trim()) {
      toast.error('Room number is required');
      return;
    }
    if (!floorId) {
      toast.error('Floor is required');
      return;
    }
    if (!dailyRate || parseFloat(dailyRate) < 0) {
      toast.error('Daily rate must be a valid number');
      return;
    }
    if (!capacity || parseInt(capacity) <= 0) {
      toast.error('Number of beds must be greater than 0');
      return;
    }
    
    try {
      setSubmitting(true);
      const roomData: any = {
        room_number: roomNumber.trim(),
        room_type: roomType,
        floor_id: parseInt(floorId),
        daily_rate: parseFloat(dailyRate),
        capacity: parseInt(capacity),
        status: status,
        facilities: facilities,
        attendant_bed: attendantBed,
        remarks: remarks.trim() || undefined
      };
      
      if (room) {
        // Update existing room
        await api.updateIPDRoom(room.id!, roomData);
        toast.success('Room updated successfully');
      } else {
        // Create new room
        await api.createIPDRoom(roomData);
        toast.success('Room created successfully');
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save room: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Private Room' : 'Create New Private Room'}</DialogTitle>
          <DialogDescription>
            {room ? 'Update room information' : 'Add a new private room to the hospital\'s inventory'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Room Details - Two Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label>Room Number <span className="text-red-500">*</span></Label>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., DLX-406"
                />
                <p className="text-xs text-gray-500">Unique room identifier</p>
              </div>
              
              <div className="space-y-2">
                <Label>Room Type <span className="text-red-500">*</span></Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Number of Beds <span className="text-red-500">*</span></Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bed</SelectItem>
                    <SelectItem value="2">2 Beds</SelectItem>
                    <SelectItem value="3">3 Beds</SelectItem>
                    <SelectItem value="4">4 Beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Initial Status <span className="text-red-500">*</span></Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label>Floor <span className="text-red-500">*</span></Label>
                <Select value={floorId} onValueChange={setFloorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id.toString()}>
                        {floor.floor_name || `Floor ${floor.floor_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Daily Rate (₹) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="e.g., 5000"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Attendant Bed</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={attendantBed}
                    onCheckedChange={setAttendantBed}
                  />
                  <span className="text-sm text-gray-600">Include attendant bed</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Facilities Section - Two Column Checkbox Grid */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Facilities</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableFacilities.map((facility) => (
                <div key={facility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`facility-${facility}`}
                    checked={facilities.includes(facility)}
                    onCheckedChange={() => handleFacilityToggle(facility)}
                  />
                  <label
                    htmlFor={`facility-${facility}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {facility}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Remarks Section */}
          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Additional notes about this room..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-[#27AE60] hover:bg-green-600 text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {room ? 'Update Room' : 'Create Room'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= TRANSFER PATIENT DIALOG =============
function TransferPatientDialog({
  open,
  onOpenChange,
  admission,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admission: IPDAdmission | null;
  onSuccess?: () => void;
}) {
  const [toWardId, setToWardId] = useState<string>('');
  const [toBedId, setToBedId] = useState<string>('');
  const [toRoomId, setToRoomId] = useState<string>('');
  const [transferType, setTransferType] = useState<'ward' | 'room'>('ward');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transferTime, setTransferTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [transferReason, setTransferReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [availableWards, setAvailableWards] = useState<IPDWard[]>([]);
  const [availableBeds, setAvailableBeds] = useState<IPDBed[]>([]);
  const [availableRooms, setAvailableRooms] = useState<IPDRoom[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && admission) {
      loadAvailableOptions();
      setTransferDate(new Date().toISOString().split('T')[0]);
      setTransferTime(new Date().toTimeString().slice(0, 5));
      setTransferReason('');
      setNotes('');
      setToWardId('');
      setToBedId('');
      setToRoomId('');
      setTransferType('ward');
    }
  }, [open, admission]);

  useEffect(() => {
    if (toWardId && transferType === 'ward') {
      loadAvailableBeds(parseInt(toWardId));
    }
  }, [toWardId, transferType]);

  const loadAvailableOptions = async () => {
    try {
      setLoading(true);
      const [wardsData, roomsData] = await Promise.all([
        api.getIPDWards({ status: 'active' }),
        api.getIPDRooms({ status: 'available' })
      ]);
      setAvailableWards(wardsData || []);
      setAvailableRooms(roomsData || []);
    } catch (error: any) {
      toast.error('Failed to load options: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBeds = async (wardId: number) => {
    try {
      const beds = await api.getAvailableIPDBeds({ ward_id: wardId });
      setAvailableBeds(beds || []);
    } catch (error: any) {
      toast.error('Failed to load beds: ' + (error.message || 'Unknown error'));
      setAvailableBeds([]);
    }
  };

  const handleSubmit = async () => {
    if (!admission?.id) {
      toast.error('No admission selected');
      return;
    }

    if (transferType === 'ward' && (!toWardId || !toBedId)) {
      toast.error('Please select both ward and bed');
      return;
    }

    if (transferType === 'room' && !toRoomId) {
      toast.error('Please select a room');
      return;
    }

    try {
      setSubmitting(true);
      const transferData: CreateIPDTransferData = {
        transfer_date: transferDate,
        transfer_time: transferTime + ':00',
        transfer_reason: transferReason || undefined,
        notes: notes || undefined,
      };

      if (transferType === 'ward') {
        transferData.to_ward_id = parseInt(toWardId);
        transferData.to_bed_id = parseInt(toBedId);
      } else {
        transferData.to_room_id = parseInt(toRoomId);
      }

      await api.transferIPDPatient(admission.id, transferData);
      toast.success('Patient transferred successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to transfer patient: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!admission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Patient</DialogTitle>
          <DialogDescription>
            Transfer {admission.patient_name} to a different bed/ward or room
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Location */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2">Current Location</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Ward:</span> {admission.ward_name || 'N/A'}
                </div>
                <div>
                  <span className="text-gray-600">Bed:</span> {admission.bed_number || 'N/A'}
                </div>
                {admission.room_number && (
                  <div>
                    <span className="text-gray-600">Room:</span> {admission.room_number}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transfer Type */}
          <div>
            <Label>Transfer Type *</Label>
            <Select value={transferType} onValueChange={(value: 'ward' | 'room') => {
              setTransferType(value);
              setToWardId('');
              setToBedId('');
              setToRoomId('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ward">Transfer to Ward/Bed</SelectItem>
                <SelectItem value="room">Transfer to Private Room</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transfer to Ward/Bed */}
          {transferType === 'ward' && (
            <>
              <div>
                <Label>Select Ward *</Label>
                <Select 
                  value={toWardId} 
                  onValueChange={setToWardId}
                  disabled={loading || availableWards.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading wards..." : "Select ward"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWards.map((ward) => (
                      <SelectItem key={ward.id} value={String(ward.id)}>
                        {ward.name} ({ward.type}) - {ward.available_beds || 0} beds available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Bed *</Label>
                <Select 
                  value={toBedId} 
                  onValueChange={setToBedId}
                  disabled={!toWardId || availableBeds.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!toWardId ? "Select ward first" : availableBeds.length === 0 ? "No beds available" : "Select bed"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map((bed) => (
                      <SelectItem key={bed.id} value={String(bed.id)}>
                        {bed.bed_number} - {bed.bed_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Transfer to Room */}
          {transferType === 'room' && (
            <div>
              <Label>Select Room *</Label>
              <Select 
                value={toRoomId} 
                onValueChange={setToRoomId}
                disabled={loading || availableRooms.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading rooms..." : "Select room"} />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.room_number} - {room.room_type} (₹{room.daily_rate?.toLocaleString() || '0'}/day)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Transfer Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Transfer Date *</Label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Transfer Time *</Label>
              <Input
                type="time"
                value={transferTime}
                onChange={(e) => setTransferTime(e.target.value)}
              />
            </div>
          </div>

          {/* Transfer Reason */}
          <div>
            <Label>Transfer Reason</Label>
            <Select value={transferReason} onValueChange={setTransferReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medical">Medical Reasons</SelectItem>
                <SelectItem value="Patient Request">Patient Request</SelectItem>
                <SelectItem value="Bed Availability">Bed Availability</SelectItem>
                <SelectItem value="Ward Maintenance">Ward Maintenance</SelectItem>
                <SelectItem value="Upgrade">Room/Bed Upgrade</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Additional notes about the transfer..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting || (transferType === 'ward' && (!toWardId || !toBedId)) || (transferType === 'room' && !toRoomId)}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Transfer Patient
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= ALLOCATE ROOM DIALOG =============
function AllocateRoomDialog({
  open,
  onOpenChange,
  room,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: IPDRoom | null;
  onSuccess?: () => void;
}) {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [recentAdmissions, setRecentAdmissions] = useState<IPDAdmission[]>([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadRecentAdmissions();
      setPatientSearch('');
      setPatientSearchResults([]);
    }
  }, [open]);
  
  useEffect(() => {
    if (!patientSearch || patientSearch.length < 2) {
      setPatientSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPatients();
    }, 500);

    return () => clearTimeout(timer);
  }, [patientSearch]);
  
  const searchPatients = async () => {
    try {
      setSearchingPatients(true);
      const data = await api.getPatients({ search: patientSearch });
      setPatientSearchResults(data || []);
    } catch (error: any) {
      toast.error('Failed to search patients: ' + (error.message || 'Unknown error'));
      setPatientSearchResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };
  
  const loadRecentAdmissions = async () => {
    try {
      setLoadingAdmissions(true);
      const data = await api.getIPDAdmissions({ status: 'admitted' });
      setRecentAdmissions(data.slice(0, 5) || []);
    } catch (error: any) {
      console.error('Failed to load recent admissions:', error);
      setRecentAdmissions([]);
    } finally {
      setLoadingAdmissions(false);
    }
  };
  
  const handleAllocateRoom = async (admissionId: number) => {
    if (!room?.id) {
      toast.error('No room selected');
      return;
    }
    
    try {
      await api.updateIPDAdmission(admissionId, {
        room_id: room.id
      });
      
      toast.success(`Room ${room.room_number} allocated successfully!`);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to allocate room: ' + (error.message || 'Unknown error'));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Room to Patient</DialogTitle>
          <DialogDescription>
            {room 
              ? `Allocate ${room.room_number} (${room.room_type}) to a patient`
              : 'Select a patient to allocate to a room'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {room && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Room Number</Label>
                    <p className="font-semibold">{room.room_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Room Type</Label>
                    <p className="font-semibold">{room.room_type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Daily Rate</Label>
                    <p className="font-semibold">₹{room.daily_rate?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Capacity</Label>
                    <p className="font-semibold">{room.capacity || 1} bed(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label>Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, ID, or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchingPatients && (
              <p className="text-xs text-gray-500 mt-1">Searching...</p>
            )}
            {patientSearchResults.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                {patientSearchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={async () => {
                      const existingAdmission = recentAdmissions.find(a => a.patient_id === patient.id);
                      if (existingAdmission) {
                        await handleAllocateRoom(existingAdmission.id!);
                      } else {
                        toast.info('Please create an admission first');
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500">ID: {patient.patient_id || patient.id} | Phone: {patient.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Recent Admissions (Without Room)</Label>
            {loadingAdmissions ? (
              <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
            ) : recentAdmissions.filter(a => !a.room_id).length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">No admissions without room assignment</div>
            ) : (
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {recentAdmissions.filter(a => !a.room_id).map((admission) => (
                  <div
                    key={admission.id}
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAllocateRoom(admission.id!)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{admission.patient_name}</p>
                        <p className="text-xs text-gray-500">
                          IPD: {admission.ipd_number} | Ward: {admission.ward_name || 'N/A'} | Bed: {admission.bed_number || 'N/A'}
                        </p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Allocate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VitalsDialog({ 
  open, 
  onOpenChange, 
  patient,
  vital,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  vital?: any | null;
  onSuccess?: () => void;
}) {
  const [temperature, setTemperature] = useState<string>('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [respiratoryRate, setRespiratoryRate] = useState<string>('');
  const [oxygenSaturation, setOxygenSaturation] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [painScore, setPainScore] = useState<string>('');
  const [consciousnessLevel, setConsciousnessLevel] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (open && vital) {
      // Edit mode - populate form
      setTemperature(vital.temperature?.toString() || '');
      setBloodPressureSystolic(vital.blood_pressure_systolic?.toString() || '');
      setBloodPressureDiastolic(vital.blood_pressure_diastolic?.toString() || '');
      setHeartRate(vital.heart_rate?.toString() || '');
      setRespiratoryRate(vital.respiratory_rate?.toString() || '');
      setOxygenSaturation(vital.oxygen_saturation?.toString() || '');
      setBloodSugar(vital.blood_sugar?.toString() || '');
      setPainScore(vital.pain_score?.toString() || '');
      setConsciousnessLevel(vital.consciousness_level?.toLowerCase() || '');
      setNotes(vital.notes || '');
    } else if (!open) {
      // Reset form when dialog closes
      setTemperature('');
      setBloodPressureSystolic('');
      setBloodPressureDiastolic('');
      setHeartRate('');
      setRespiratoryRate('');
      setOxygenSaturation('');
      setBloodSugar('');
      setPainScore('');
      setConsciousnessLevel('');
      setNotes('');
    }
  }, [open, vital]);
  
  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }
    
    if (!temperature && !bloodPressureSystolic && !heartRate && !respiratoryRate && !oxygenSaturation) {
      toast.error('Please enter at least one vital sign');
      return;
    }
    
    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      
      const vitalData: any = {
        admission_id: admissionId,
        recorded_date: vital?.recorded_date || new Date().toISOString().split('T')[0],
        recorded_time: vital?.recorded_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      if (temperature) vitalData.temperature = parseFloat(temperature);
      if (bloodPressureSystolic) vitalData.blood_pressure_systolic = parseInt(bloodPressureSystolic);
      if (bloodPressureDiastolic) vitalData.blood_pressure_diastolic = parseInt(bloodPressureDiastolic);
      if (heartRate) vitalData.heart_rate = parseInt(heartRate);
      if (respiratoryRate) vitalData.respiratory_rate = parseInt(respiratoryRate);
      if (oxygenSaturation) vitalData.oxygen_saturation = parseFloat(oxygenSaturation);
      if (bloodSugar) vitalData.blood_sugar = parseFloat(bloodSugar);
      if (painScore) vitalData.pain_score = parseInt(painScore);
      if (consciousnessLevel) vitalData.consciousness_level = consciousnessLevel.charAt(0).toUpperCase() + consciousnessLevel.slice(1);
      if (notes) vitalData.notes = notes;
      
      if (vital?.id) {
        // Update existing vital
        await api.updateIPDVital(vital.id, vitalData);
        toast.success('Vital signs updated successfully!');
      } else {
        // Create new vital
      await api.recordIPDVitals(admissionId, vitalData);
      toast.success('Vital signs recorded successfully!');
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to record vital signs: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!patient) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vital ? 'Edit' : 'Record'} Vital Signs</DialogTitle>
          <DialogDescription>Enter patient's vital parameters</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Temperature (°C)</Label>
            <Input 
              type="number" 
              step="0.1" 
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="37.0" 
            />
          </div>
          <div className="space-y-2">
            <Label>Blood Pressure (Systolic/Diastolic)</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={bloodPressureSystolic}
                onChange={(e) => setBloodPressureSystolic(e.target.value)}
                placeholder="120" 
              />
              <Input 
                type="number" 
                value={bloodPressureDiastolic}
                onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                placeholder="80" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Heart Rate (bpm)</Label>
            <Input 
              type="number" 
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="72" 
            />
          </div>
          <div className="space-y-2">
            <Label>Respiratory Rate (/min)</Label>
            <Input 
              type="number" 
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value)}
              placeholder="16" 
            />
          </div>
          <div className="space-y-2">
            <Label>Oxygen Saturation (%)</Label>
            <Input 
              type="number" 
              value={oxygenSaturation}
              onChange={(e) => setOxygenSaturation(e.target.value)}
              placeholder="98" 
            />
          </div>
          <div className="space-y-2">
            <Label>Blood Sugar (mg/dL)</Label>
            <Input 
              type="number" 
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              placeholder="110" 
            />
          </div>
          <div className="space-y-2">
            <Label>Pain Score (0-10)</Label>
            <Input 
              type="number" 
              min="0" 
              max="10" 
              value={painScore}
              onChange={(e) => setPainScore(e.target.value)}
              placeholder="0" 
            />
          </div>
          <div className="space-y-2">
            <Label>Consciousness Level</Label>
            <Select value={consciousnessLevel} onValueChange={setConsciousnessLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="drowsy">Drowsy</SelectItem>
                <SelectItem value="confused">Confused</SelectItem>
                <SelectItem value="unconscious">Unconscious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Clinical Notes</Label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or notes..." 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleSubmit}
            disabled={submitting || !patient}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Vitals'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TreatmentOrderDialog({ 
  open, 
  onOpenChange, 
  patient,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [orderType, setOrderType] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setOrderType('');
      setPriority('');
      setOrderDetails('');
      setFrequency('');
      setDuration('');
      setStartDate('');
      setEndDate('');
      setNotes('');
    }
  }, [open]);
  
  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }
    
    if (!orderType || !priority || !orderDetails) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      
      const orderData: any = {
        order_type: orderType.charAt(0).toUpperCase() + orderType.slice(1),
        priority: priority,
        order_details: orderDetails,
        order_date: new Date().toISOString().split('T')[0],
        order_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      if (frequency) orderData.frequency = frequency;
      if (duration) orderData.duration = duration;
      if (startDate) orderData.start_date = startDate;
      if (endDate) orderData.end_date = endDate;
      if (notes) orderData.notes = notes;
      
      await api.createIPDTreatmentOrder(admissionId, orderData);
      
      toast.success('Treatment order created successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to create treatment order: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!patient) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Treatment Order</DialogTitle>
          <DialogDescription>Create a new order for patient treatment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order Type *</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="lab">Lab Test</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="diet">Diet</SelectItem>
                  <SelectItem value="physio">Physiotherapy</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Order Details *</Label>
            <Textarea 
              value={orderDetails}
              onChange={(e) => setOrderDetails(e.target.value)}
              placeholder="Enter detailed order instructions..." 
              rows={3} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Input 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., Once daily, Twice daily" 
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 7 days, 2 weeks" 
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..." 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleSubmit}
            disabled={submitting || !patient}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DischargeDialog({ 
  open, 
  onOpenChange, 
  patient, 
  billing,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  patient: IPDPatient | null;
  billing: IPDBilling | null;
  onSuccess?: () => void;
}) {
  const [finalDiagnosis, setFinalDiagnosis] = useState<string>('');
  const [treatmentGiven, setTreatmentGiven] = useState<string>('');
  const [proceduresPerformed, setProceduresPerformed] = useState<string>('');
  const [conditionAtDischarge, setConditionAtDischarge] = useState<string>('');
  const [dischargeAdvice, setDischargeAdvice] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [followUpDoctor, setFollowUpDoctor] = useState<string>('');
  const [dietaryAdvice, setDietaryAdvice] = useState<string>('');
  const [activityRestrictions, setActivityRestrictions] = useState<string>('');
  const [medications, setMedications] = useState<Array<{name: string; dosage: string; frequency: string; duration: string}>>([]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (patient && open) {
      setFinalDiagnosis(patient.diagnosis || '');
      setFollowUpDoctor(patient.consultingDoctor || '');
      setPaymentAmount(patient.dueAmount > 0 ? patient.dueAmount.toString() : '');
    }
    if (!open) {
      // Reset form when dialog closes
      setFinalDiagnosis('');
      setTreatmentGiven('');
      setProceduresPerformed('');
      setConditionAtDischarge('');
      setDischargeAdvice('');
      setFollowUpDate('');
      setFollowUpDoctor('');
      setDietaryAdvice('');
      setActivityRestrictions('');
      setMedications([]);
      setPaymentAmount('');
      setPaymentMode('');
    }
  }, [open, patient]);
  
  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }
    
    if (!finalDiagnosis || !treatmentGiven || !conditionAtDischarge || !dischargeAdvice) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      
      const dischargeData: any = {
        discharge_date: new Date().toISOString().split('T')[0],
        discharge_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        admitting_diagnosis: patient.diagnosis,
        final_diagnosis: finalDiagnosis,
        treatment_given: treatmentGiven,
        condition_at_discharge: conditionAtDischarge.charAt(0).toUpperCase() + conditionAtDischarge.slice(1) as 'Improved' | 'Stable' | 'Critical' | 'Expired' | 'LAMA',
        discharge_advice: dischargeAdvice,
      };
      
      if (proceduresPerformed) {
        dischargeData.procedures_performed = proceduresPerformed.split('\n').filter(p => p.trim());
      }
      
      if (medications.length > 0) {
        dischargeData.medications = medications;
      }
      
      if (followUpDate) {
        dischargeData.follow_up_date = followUpDate;
      }
      
      if (followUpDoctor) {
        // Try to find doctor ID from name, or just store name
        dischargeData.follow_up_doctor_name = followUpDoctor;
      }
      
      if (dietaryAdvice) {
        dischargeData.dietary_advice = dietaryAdvice;
      }
      
      if (activityRestrictions) {
        dischargeData.activity_restrictions = activityRestrictions;
      }
      
      await api.createIPDDischarge(admissionId, dischargeData);
      
      // If there's a payment, record it
      if (paymentAmount && parseFloat(paymentAmount) > 0 && paymentMode) {
        try {
          await api.recordIPDPayment(admissionId, {
            payment_amount: parseFloat(paymentAmount),
            payment_mode: paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1) as 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Cheque'
          });
        } catch (paymentError: any) {
          console.error('Failed to record payment:', paymentError);
          // Don't fail the discharge if payment recording fails
        }
      }
      
      toast.success('Patient discharged successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
      window.location.reload(); // Temporary - should use callback or context
    } catch (error: any) {
      toast.error('Failed to discharge patient: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
          <DialogDescription>Complete discharge summary and billing</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              IPD No: {patient.ipdNumber} | Length of Stay: {patient.actualDuration} days
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Discharge Summary</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="billing">Final Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Final Diagnosis *</Label>
                  <Textarea 
                    value={finalDiagnosis}
                    onChange={(e) => setFinalDiagnosis(e.target.value)}
                    placeholder="Enter final diagnosis" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Treatment Given *</Label>
                  <Textarea 
                    value={treatmentGiven}
                    onChange={(e) => setTreatmentGiven(e.target.value)}
                    placeholder="Summary of treatment provided" 
                    rows={3} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Procedures Performed</Label>
                  <Textarea 
                    value={proceduresPerformed}
                    onChange={(e) => setProceduresPerformed(e.target.value)}
                    placeholder="List all procedures performed (one per line)" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condition at Discharge *</Label>
                  <Select value={conditionAtDischarge} onValueChange={setConditionAtDischarge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="improved">Improved</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="lama">LAMA (Left Against Medical Advice)</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discharge Advice *</Label>
                  <Textarea 
                    value={dischargeAdvice}
                    onChange={(e) => setDischargeAdvice(e.target.value)}
                    placeholder="Post-discharge care instructions" 
                    rows={4} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input 
                      type="date" 
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Doctor</Label>
                    <Input 
                      value={followUpDoctor}
                      onChange={(e) => setFollowUpDoctor(e.target.value)}
                      placeholder="Doctor name" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3>Discharge Medications</h3>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No medications added</div>
                ) : (
                  <div className="space-y-3">
                    {medications.map((med, index) => (
                      <div key={index} className="border rounded-lg p-4 grid grid-cols-4 gap-3">
                        <div className="space-y-2">
                          <Label>Medication Name</Label>
                          <Input 
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[index].name = e.target.value;
                              setMedications(updated);
                            }}
                            placeholder="Medicine name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dosage</Label>
                          <Input 
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[index].dosage = e.target.value;
                              setMedications(updated);
                            }}
                            placeholder="e.g., 500mg" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Input 
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...medications];
                              updated[index].frequency = e.target.value;
                              setMedications(updated);
                            }}
                            placeholder="e.g., Twice daily" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <div className="flex gap-2">
                            <Input 
                              value={med.duration}
                              onChange={(e) => {
                                const updated = [...medications];
                                updated[index].duration = e.target.value;
                                setMedications(updated);
                              }}
                              placeholder="e.g., 7 days" 
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMedications(medications.filter((_, i) => i !== index));
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Dietary Advice</Label>
                  <Textarea 
                    value={dietaryAdvice}
                    onChange={(e) => setDietaryAdvice(e.target.value)}
                    placeholder="Special dietary instructions" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Activity Restrictions</Label>
                  <Textarea 
                    value={activityRestrictions}
                    onChange={(e) => setActivityRestrictions(e.target.value)}
                    placeholder="Physical activity limitations" 
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="space-y-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Outstanding Amount: ₹{patient.dueAmount.toLocaleString()}
                  </AlertDescription>
                </Alert>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Charges</span>
                        <span>₹{patient.totalCharges.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Paid Amount</span>
                        <span>₹{patient.paidAmount.toLocaleString()}</span>
                      </div>
                      {billing && billing.insurance_covered > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Insurance Coverage</span>
                          <span>₹{billing.insurance_covered.toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg text-red-600">
                        <span>Due Amount</span>
                        <span>₹{patient.dueAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {patient.dueAmount > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm">Collect Payment</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Payment Amount</Label>
                        <Input 
                          type="number" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="0" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Mode</Label>
                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button variant="outline" disabled={submitting}>
            <Printer className="w-4 h-4 mr-2" />
            Print Summary
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleSubmit}
            disabled={submitting || !patient}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Discharging...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Discharge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NursingNoteDialog({ 
  open, 
  onOpenChange, 
  patient,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [category, setCategory] = useState<string>('General');
  const [shift, setShift] = useState<string>('Morning');
  const [note, setNote] = useState<string>('');
  const [severity, setSeverity] = useState<string>('none');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!open) {
      setCategory('General');
      setShift('Morning');
      setNote('');
      setSeverity('none');
    }
  }, [open]);
  
  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }
    
    if (!note || note.trim().length === 0) {
      toast.error('Please enter a nursing note');
      return;
    }
    
    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      
      const noteData: any = {
        category: category,
        shift: shift,
        note: note.trim(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      if (severity && severity !== 'none') {
        noteData.severity = severity;
      }
      
      await api.addIPDNursingNote(admissionId, noteData);
      
      toast.success('Nursing note added successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to add nursing note: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!patient) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Nursing Note</DialogTitle>
          <DialogDescription>Record nursing observations and care notes</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Vital Signs">Vital Signs</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Incident">Incident</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shift *</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note *</Label>
            <Textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter nursing observation or care note..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleSubmit}
            disabled={submitting || !patient || !note.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Note'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ 
  open, 
  onOpenChange, 
  patient,
  billing,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  billing: IPDBilling | null;
  onSuccess?: () => void;
}) {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (patient && open) {
      setPaymentAmount(patient.dueAmount > 0 ? patient.dueAmount.toString() : '');
    }
    if (!open) {
      setPaymentAmount('');
      setPaymentMode('');
    }
  }, [open, patient]);
  
  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    if (!paymentMode) {
      toast.error('Please select a payment mode');
      return;
    }
    
    if (parseFloat(paymentAmount) > patient.dueAmount) {
      toast.error('Payment amount cannot exceed due amount');
      return;
    }
    
    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      
      const paymentData: any = {
        amount: parseFloat(paymentAmount),
        payment_mode: paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1),
        payment_date: new Date().toISOString().split('T')[0],
        payment_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      await api.recordIPDPayment(admissionId, paymentData);
      
      toast.success('Payment recorded successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to record payment: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!patient || !billing) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>Record payment for IPD admission</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Charges</span>
                  <span className="font-medium">₹{patient.totalCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="text-green-600">₹{patient.paidAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Due Amount</span>
                  <span className="font-bold text-red-600">₹{patient.dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Label>Payment Amount *</Label>
            <Input 
              type="number" 
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0"
              max={patient.dueAmount}
            />
            <p className="text-xs text-gray-500">Maximum: ₹{patient.dueAmount.toLocaleString()}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Payment Mode *</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleSubmit}
            disabled={submitting || !patient || !paymentAmount || !paymentMode}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <IndianRupee className="w-4 h-4 mr-2" />
                Record Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= DAILY CARE ORDER DIALOG =============
function DailyCareOrderDialog({
  open,
  onOpenChange,
  patient,
  careOrder,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  careOrder?: any | null;
  onSuccess?: () => void;
}) {
  const [orderType, setOrderType] = useState<string>('');
  const [orderDescription, setOrderDescription] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && careOrder) {
      setOrderType(careOrder.order_type || '');
      setOrderDescription(careOrder.order_description || '');
      setFrequency(careOrder.frequency || '');
      setStartDate(careOrder.start_date || '');
      setEndDate(careOrder.end_date || '');
      setPriority(careOrder.priority || 'routine');
      setNotes(careOrder.notes || '');
    } else if (!open) {
      setOrderType('');
      setOrderDescription('');
      setFrequency('');
      setStartDate('');
      setEndDate('');
      setPriority('routine');
      setNotes('');
    }
  }, [open, careOrder]);

  const handleSubmit = async () => {
    if (!patient?.id || !orderType || !orderDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const orderData: any = {
        order_date: startDate || new Date().toISOString().split('T')[0],
        order_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        order_type: orderType,
        order_description: orderDescription,
        frequency: frequency,
        priority: priority,
        status: 'active'
      };
      if (startDate) orderData.start_date = startDate;
      if (endDate) orderData.end_date = endDate;
      if (notes) orderData.notes = notes;

      if (careOrder?.id) {
        await api.updateIPDDailyCareOrder(careOrder.id, orderData);
        toast.success('Care order updated successfully!');
      } else {
        await api.createIPDDailyCareOrder(admissionId, orderData);
        toast.success('Care order created successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save care order: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{careOrder ? 'Edit' : 'New'} Daily Care Order</DialogTitle>
          <DialogDescription>Create a daily patient care order</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order Type *</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Diet">Diet</SelectItem>
                  <SelectItem value="Activity">Activity</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">Stat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={orderDescription}
              onChange={(e) => setOrderDescription(e.target.value)}
              placeholder="Describe the care order..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Input
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., QID, TID, BD, OD"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= MEDICATION DIALOG =============
function MedicationDialog({
  open,
  onOpenChange,
  patient,
  medication,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  medication?: any | null;
  onSuccess?: () => void;
}) {
  const [medicationName, setMedicationName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [route, setRoute] = useState<string>('Oral');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && medication) {
      setMedicationName(medication.medication_name || '');
      setDosage(medication.dosage || '');
      setFrequency(medication.frequency || '');
      setRoute(medication.route || 'Oral');
      setStartDate(medication.start_date || '');
      setEndDate(medication.end_date || '');
      setDuration(medication.duration?.toString() || '');
      setInstructions(medication.instructions || '');
    } else if (!open) {
      setMedicationName('');
      setDosage('');
      setFrequency('');
      setRoute('Oral');
      setStartDate('');
      setEndDate('');
      setDuration('');
      setInstructions('');
    }
  }, [open, medication]);

  const handleSubmit = async () => {
    if (!patient?.id || !medicationName || !dosage || !frequency || !startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const medicationData: any = {
        medication_name: medicationName,
        dosage: dosage,
        frequency: frequency,
        route: route,
        start_date: startDate,
        status: 'active'
      };
      if (endDate) medicationData.end_date = endDate;
      if (duration) medicationData.duration = parseInt(duration);
      if (instructions) medicationData.instructions = instructions;

      if (medication?.id) {
        await api.updateIPDMedication(medication.id, medicationData);
        toast.success('Medication updated successfully!');
      } else {
        await api.createIPDMedication(admissionId, medicationData);
        toast.success('Medication added successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save medication: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medication ? 'Edit' : 'Add'} Medication</DialogTitle>
          <DialogDescription>Prescribe medication for patient</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Medication Name *</Label>
              <Input
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="Enter medication name"
              />
            </div>
            <div className="space-y-2">
              <Label>Dosage *</Label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 500mg, 10ml"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <Input
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., QID, TID, BD, OD"
              />
            </div>
            <div className="space-y-2">
              <Label>Route *</Label>
              <Select value={route} onValueChange={setRoute}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="IM">IM</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="Topical">Topical</SelectItem>
                  <SelectItem value="Inhalation">Inhalation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Days"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Special Instructions</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Special instructions..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Medication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= LAB ORDER DIALOG =============
function LabOrderDialog({
  open,
  onOpenChange,
  patient,
  labOrder,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  labOrder?: any | null;
  onSuccess?: () => void;
}) {
  const [testName, setTestName] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && labOrder) {
      setTestName(labOrder.test_name || '');
      setTestType(labOrder.test_type || '');
      setPriority(labOrder.priority || 'routine');
      setNotes(labOrder.notes || '');
    } else if (!open) {
      setTestName('');
      setTestType('');
      setPriority('routine');
      setNotes('');
    }
  }, [open, labOrder]);

  const handleSubmit = async () => {
    if (!patient?.id || !testName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const orderData: any = {
        order_date: new Date().toISOString().split('T')[0],
        order_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        test_name: testName,
        priority: priority,
        status: 'ordered'
      };
      if (testType) orderData.test_type = testType;
      if (notes) orderData.notes = notes;

      if (labOrder?.id) {
        await api.updateIPDLabOrder(labOrder.id, orderData);
        toast.success('Lab order updated successfully!');
      } else {
        await api.createIPDLabOrder(admissionId, orderData);
        toast.success('Lab order created successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save lab order: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{labOrder ? 'Edit' : 'New'} Lab Order</DialogTitle>
          <DialogDescription>Order laboratory test for patient</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
              />
            </div>
            <div className="space-y-2">
              <Label>Test Type</Label>
              <Input
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                placeholder="e.g., Blood Test, Urine Test"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">Stat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= RADIOLOGY ORDER DIALOG =============
function RadiologyOrderDialog({
  open,
  onOpenChange,
  patient,
  radiologyOrder,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  radiologyOrder?: any | null;
  onSuccess?: () => void;
}) {
  const [testName, setTestName] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [bodyPart, setBodyPart] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && radiologyOrder) {
      setTestName(radiologyOrder.test_name || '');
      setTestType(radiologyOrder.test_type || '');
      setBodyPart(radiologyOrder.body_part || '');
      setPriority(radiologyOrder.priority || 'routine');
      setNotes(radiologyOrder.notes || '');
    } else if (!open) {
      setTestName('');
      setTestType('');
      setBodyPart('');
      setPriority('routine');
      setNotes('');
    }
  }, [open, radiologyOrder]);

  const handleSubmit = async () => {
    if (!patient?.id || !testName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const orderData: any = {
        order_date: new Date().toISOString().split('T')[0],
        order_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        test_name: testName,
        priority: priority,
        status: 'ordered'
      };
      if (testType) orderData.test_type = testType;
      if (bodyPart) orderData.body_part = bodyPart;
      if (notes) orderData.notes = notes;

      if (radiologyOrder?.id) {
        await api.updateIPDRadiologyOrder(radiologyOrder.id, orderData);
        toast.success('Radiology order updated successfully!');
      } else {
        await api.createIPDRadiologyOrder(admissionId, orderData);
        toast.success('Radiology order created successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save radiology order: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{radiologyOrder ? 'Edit' : 'New'} Radiology Order</DialogTitle>
          <DialogDescription>Order radiology test for patient</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
              />
            </div>
            <div className="space-y-2">
              <Label>Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="X-Ray">X-Ray</SelectItem>
                  <SelectItem value="CT">CT Scan</SelectItem>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Body Part</Label>
              <Input
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                placeholder="e.g., Chest, Abdomen, Head"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">Stat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= DOCTOR NOTE DIALOG =============
function DoctorNoteDialog({
  open,
  onOpenChange,
  patient,
  doctorNote,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  doctorNote?: any | null;
  onSuccess?: () => void;
}) {
  const [noteType, setNoteType] = useState<string>('Progress');
  const [note, setNote] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && doctorNote) {
      setNoteType(doctorNote.note_type || 'Progress');
      setNote(doctorNote.note || '');
      setAssessment(doctorNote.assessment || '');
      setPlan(doctorNote.plan || '');
    } else if (!open) {
      setNoteType('Progress');
      setNote('');
      setAssessment('');
      setPlan('');
    }
  }, [open, doctorNote]);

  const handleSubmit = async () => {
    if (!patient?.id || !note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const noteData: any = {
        note_date: new Date().toISOString().split('T')[0],
        note_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        note_type: noteType,
        note: note
      };
      if (assessment) noteData.assessment = assessment;
      if (plan) noteData.plan = plan;

      if (doctorNote?.id) {
        await api.updateIPDDoctorNote(doctorNote.id, noteData);
        toast.success('Doctor note updated successfully!');
      } else {
        await api.createIPDDoctorNote(admissionId, noteData);
        toast.success('Doctor note saved successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save doctor note: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doctorNote ? 'Edit' : 'Add'} Doctor Note</DialogTitle>
          <DialogDescription>Record doctor's notes and observations</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Note Type *</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Progress">Progress</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Procedure">Procedure</SelectItem>
                <SelectItem value="Discharge">Discharge</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note *</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter doctor's note..."
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Clinical Assessment</Label>
            <Textarea
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="Clinical assessment..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Treatment Plan</Label>
            <Textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Treatment plan..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= PHARMACIST NOTE DIALOG =============
function PharmacistNoteDialog({
  open,
  onOpenChange,
  patient,
  pharmacistNote,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  pharmacistNote?: any | null;
  onSuccess?: () => void;
}) {
  const [noteType, setNoteType] = useState<string>('Medication Review');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && pharmacistNote) {
      setNoteType(pharmacistNote.note_type || 'Medication Review');
      setNote(pharmacistNote.note || '');
    } else if (!open) {
      setNoteType('Medication Review');
      setNote('');
    }
  }, [open, pharmacistNote]);

  const handleSubmit = async () => {
    if (!patient?.id || !note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const noteData: any = {
        note_date: new Date().toISOString().split('T')[0],
        note_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        note_type: noteType,
        note: note
      };

      if (pharmacistNote?.id) {
        await api.updateIPDPharmacistNote(pharmacistNote.id, noteData);
        toast.success('Pharmacist note updated successfully!');
      } else {
        await api.createIPDPharmacistNote(admissionId, noteData);
        toast.success('Pharmacist note saved successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save pharmacist note: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pharmacistNote ? 'Edit' : 'Add'} Pharmacist Note</DialogTitle>
          <DialogDescription>Record pharmacist's notes and medication reviews</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Note Type *</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medication Review">Medication Review</SelectItem>
                <SelectItem value="Drug Interaction">Drug Interaction</SelectItem>
                <SelectItem value="Dosage Adjustment">Dosage Adjustment</SelectItem>
                <SelectItem value="Allergy Alert">Allergy Alert</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note *</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter pharmacist's note..."
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= PROCEDURE DIALOG =============
function ProcedureDialog({
  open,
  onOpenChange,
  patient,
  procedure,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  procedure?: any | null;
  onSuccess?: () => void;
}) {
  const [procedureName, setProcedureName] = useState<string>('');
  const [procedureType, setProcedureType] = useState<string>('');
  const [procedureDate, setProcedureDate] = useState<string>('');
  const [procedureTime, setProcedureTime] = useState<string>('');
  const [anesthesiaType, setAnesthesiaType] = useState<string>('');
  const [procedureNotes, setProcedureNotes] = useState<string>('');
  const [complications, setComplications] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && procedure) {
      setProcedureName(procedure.procedure_name || '');
      setProcedureType(procedure.procedure_type || '');
      setProcedureDate(procedure.procedure_date || '');
      setProcedureTime(procedure.procedure_time || '');
      setAnesthesiaType(procedure.anesthesia_type || '');
      setProcedureNotes(procedure.procedure_notes || '');
      setComplications(procedure.complications || '');
    } else if (!open) {
      setProcedureName('');
      setProcedureType('');
      setProcedureDate('');
      setProcedureTime('');
      setAnesthesiaType('');
      setProcedureNotes('');
      setComplications('');
    }
  }, [open, procedure]);

  const handleSubmit = async () => {
    if (!patient?.id || !procedureName || !procedureDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const procedureData: any = {
        procedure_name: procedureName,
        procedure_date: procedureDate,
        procedure_time: procedureTime || new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'scheduled'
      };
      if (procedureType) procedureData.procedure_type = procedureType;
      if (anesthesiaType) procedureData.anesthesia_type = anesthesiaType;
      if (procedureNotes) procedureData.procedure_notes = procedureNotes;
      if (complications) procedureData.complications = complications;

      if (procedure?.id) {
        await api.updateIPDProcedure(procedure.id, procedureData);
        toast.success('Procedure updated successfully!');
      } else {
        await api.createIPDProcedure(admissionId, procedureData);
        toast.success('Procedure scheduled successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save procedure: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{procedure ? 'Edit' : 'Schedule'} Procedure</DialogTitle>
          <DialogDescription>Schedule or record a procedure</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Procedure Name *</Label>
              <Input
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)}
                placeholder="Enter procedure name"
              />
            </div>
            <div className="space-y-2">
              <Label>Procedure Type</Label>
              <Input
                value={procedureType}
                onChange={(e) => setProcedureType(e.target.value)}
                placeholder="e.g., Surgical, Diagnostic"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Procedure Date *</Label>
              <Input
                type="date"
                value={procedureDate}
                onChange={(e) => setProcedureDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Procedure Time</Label>
              <Input
                type="time"
                value={procedureTime}
                onChange={(e) => setProcedureTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Anesthesia Type</Label>
            <Input
              value={anesthesiaType}
              onChange={(e) => setAnesthesiaType(e.target.value)}
              placeholder="e.g., General, Local, Regional"
            />
          </div>
          <div className="space-y-2">
            <Label>Procedure Notes</Label>
            <Textarea
              value={procedureNotes}
              onChange={(e) => setProcedureNotes(e.target.value)}
              placeholder="Procedure notes..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Complications</Label>
            <Textarea
              value={complications}
              onChange={(e) => setComplications(e.target.value)}
              placeholder="Any complications..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Procedure'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= NUTRITION DIALOG =============
function NutritionDialog({
  open,
  onOpenChange,
  patient,
  nutrition,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  nutrition?: any | null;
  onSuccess?: () => void;
}) {
  const [date, setDate] = useState<string>('');
  const [mealType, setMealType] = useState<string>('Breakfast');
  const [dietType, setDietType] = useState<string>('');
  const [items, setItems] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbohydrates, setCarbohydrates] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && nutrition) {
      setDate(nutrition.date || '');
      setMealType(nutrition.meal_type || 'Breakfast');
      setDietType(nutrition.diet_type || '');
      setItems(nutrition.items || '');
      setCalories(nutrition.calories?.toString() || '');
      setProtein(nutrition.protein?.toString() || '');
      setCarbohydrates(nutrition.carbohydrates?.toString() || '');
      setFats(nutrition.fats?.toString() || '');
      setNotes(nutrition.notes || '');
    } else if (!open) {
      setDate('');
      setMealType('Breakfast');
      setDietType('');
      setItems('');
      setCalories('');
      setProtein('');
      setCarbohydrates('');
      setFats('');
      setNotes('');
    }
  }, [open, nutrition]);

  const handleSubmit = async () => {
    if (!patient?.id || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const nutritionData: any = {
        date: date,
        meal_type: mealType
      };
      if (dietType) nutritionData.diet_type = dietType;
      if (items) nutritionData.items = items;
      if (calories) nutritionData.calories = parseFloat(calories);
      if (protein) nutritionData.protein = parseFloat(protein);
      if (carbohydrates) nutritionData.carbohydrates = parseFloat(carbohydrates);
      if (fats) nutritionData.fats = parseFloat(fats);
      if (notes) nutritionData.notes = notes;

      if (nutrition?.id) {
        await api.updateIPDNutrition(nutrition.id, nutritionData);
        toast.success('Nutrition record updated successfully!');
      } else {
        await api.createIPDNutrition(admissionId, nutritionData);
        toast.success('Nutrition record saved successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save nutrition record: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{nutrition ? 'Edit' : 'Record'} Nutrition</DialogTitle>
          <DialogDescription>Record patient nutrition information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Meal Type *</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Diet Type</Label>
            <Input
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              placeholder="e.g., Diabetic, Soft, Liquid"
            />
          </div>
          <div className="space-y-2">
            <Label>Food Items</Label>
            <Textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="List food items..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input
                type="number"
                step="0.01"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
              />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input
                type="number"
                step="0.01"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="g"
              />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input
                type="number"
                step="0.01"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
                placeholder="g"
              />
            </div>
            <div className="space-y-2">
              <Label>Fats (g)</Label>
              <Input
                type="number"
                step="0.01"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                placeholder="g"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= INTAKE & OUTPUT DIALOG =============
function IntakeOutputDialog({
  open,
  onOpenChange,
  patient,
  intakeOutput,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  intakeOutput?: any | null;
  onSuccess?: () => void;
}) {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [intakeType, setIntakeType] = useState<string>('');
  const [intakeAmount, setIntakeAmount] = useState<string>('');
  const [outputType, setOutputType] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && intakeOutput) {
      setDate(intakeOutput.date || '');
      setTime(intakeOutput.time || '');
      setIntakeType(intakeOutput.intake_type || '');
      setIntakeAmount(intakeOutput.intake_amount?.toString() || '');
      setOutputType(intakeOutput.output_type || '');
      setOutputAmount(intakeOutput.output_amount?.toString() || '');
      setNotes(intakeOutput.notes || '');
    } else if (!open) {
      setDate('');
      setTime('');
      setIntakeType('');
      setIntakeAmount('');
      setOutputType('');
      setOutputAmount('');
      setNotes('');
    }
  }, [open, intakeOutput]);

  const handleSubmit = async () => {
    if (!patient?.id || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const ioData: any = {
        date: date,
        time: time || new Date().toTimeString().split(' ')[0].substring(0, 5)
      };
      if (intakeType) {
        ioData.intake_type = intakeType;
        if (intakeAmount) ioData.intake_amount = parseFloat(intakeAmount);
      }
      if (outputType) {
        ioData.output_type = outputType;
        if (outputAmount) ioData.output_amount = parseFloat(outputAmount);
      }
      if (intakeAmount && outputAmount) {
        ioData.balance = parseFloat(intakeAmount) - parseFloat(outputAmount);
      }
      if (notes) ioData.notes = notes;

      if (intakeOutput?.id) {
        await api.updateIPDIntakeOutput(intakeOutput.id, ioData);
        toast.success('Record updated successfully!');
      } else {
        await api.createIPDIntakeOutput(admissionId, ioData);
        toast.success('Record saved successfully!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save record: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{intakeOutput ? 'Edit' : 'Record'} Intake & Output</DialogTitle>
          <DialogDescription>Record fluid intake and output</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Intake Type</Label>
              <Select value={intakeType} onValueChange={setIntakeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="IV">IV</SelectItem>
                  <SelectItem value="NG">NG</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intake Amount (ml)</Label>
              <Input
                type="number"
                step="0.01"
                value={intakeAmount}
                onChange={(e) => setIntakeAmount(e.target.value)}
                placeholder="ml"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Output Type</Label>
              <Select value={outputType} onValueChange={setOutputType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urine">Urine</SelectItem>
                  <SelectItem value="Stool">Stool</SelectItem>
                  <SelectItem value="Vomit">Vomit</SelectItem>
                  <SelectItem value="Drainage">Drainage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Output Amount (ml)</Label>
              <Input
                type="number"
                step="0.01"
                value={outputAmount}
                onChange={(e) => setOutputAmount(e.target.value)}
                placeholder="ml"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= FILE DIALOG =============
function FileDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [fileName, setFileName] = useState<string>('');
  const [fileCategory, setFileCategory] = useState<string>('Document');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFileName('');
      setFileCategory('Document');
      setDescription('');
      setFile(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!fileName) {
        setFileName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!patient?.id || !file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_name', fileName);
      formData.append('file_category', fileCategory);
      if (description) formData.append('description', description);

      await api.uploadIPDFile(admissionId, formData);
      toast.success('File uploaded successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to upload file: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload patient files and documents</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>File *</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {file && <p className="text-sm text-gray-600">Selected: {file.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>File Name</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File name (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Report">Report</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Consent Form">Consent Form</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="File description..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !file} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Upload File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= HEALTH & PHYSICAL HABIT DIALOG =============
function HealthPhysicalDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [smokingStatus, setSmokingStatus] = useState<string>('');
  const [alcoholConsumption, setAlcoholConsumption] = useState<string>('');
  const [exerciseHabit, setExerciseHabit] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [chronicConditions, setChronicConditions] = useState<string>('');
  const [familyHistory, setFamilyHistory] = useState<string>('');
  const [socialHistory, setSocialHistory] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setHeight('');
      setWeight('');
      setSmokingStatus('');
      setAlcoholConsumption('');
      setExerciseHabit('');
      setDietaryRestrictions('');
      setAllergies('');
      setChronicConditions('');
      setFamilyHistory('');
      setSocialHistory('');
    }
  }, [open]);

  const calculateBMI = () => {
    if (height && weight) {
      const h = parseFloat(height) / 100; // Convert cm to meters
      const w = parseFloat(weight);
      if (h > 0 && w > 0) {
        return (w / (h * h)).toFixed(2);
      }
    }
    return '';
  };

  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const assessmentData: any = {
        assessment_date: new Date().toISOString().split('T')[0]
      };
      if (height) assessmentData.height = parseFloat(height);
      if (weight) assessmentData.weight = parseFloat(weight);
      const bmi = calculateBMI();
      if (bmi) assessmentData.bmi = parseFloat(bmi);
      if (smokingStatus) assessmentData.smoking_status = smokingStatus;
      if (alcoholConsumption) assessmentData.alcohol_consumption = alcoholConsumption;
      if (exerciseHabit) assessmentData.exercise_habit = exerciseHabit;
      if (dietaryRestrictions) assessmentData.dietary_restrictions = dietaryRestrictions;
      if (allergies) assessmentData.allergies = allergies;
      if (chronicConditions) assessmentData.chronic_conditions = chronicConditions;
      if (familyHistory) assessmentData.family_history = familyHistory;
      if (socialHistory) assessmentData.social_history = socialHistory;

      await api.createIPDHealthPhysicalHabit(admissionId, assessmentData);
      toast.success('Health assessment saved successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save assessment: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Health & Physical Habit Assessment</DialogTitle>
          <DialogDescription>Record patient health and physical habits</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="cm"
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg"
              />
            </div>
            <div className="space-y-2">
              <Label>BMI</Label>
              <Input
                value={calculateBMI()}
                disabled
                placeholder="Auto-calculated"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Smoking Status</Label>
              <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never">Never</SelectItem>
                  <SelectItem value="Former">Former</SelectItem>
                  <SelectItem value="Current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Alcohol Consumption</Label>
              <Select value={alcoholConsumption} onValueChange={setAlcoholConsumption}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Occasional">Occasional</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Exercise Habit</Label>
            <Input
              value={exerciseHabit}
              onChange={(e) => setExerciseHabit(e.target.value)}
              placeholder="e.g., Daily walking, Gym 3x/week"
            />
          </div>
          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <Textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="Dietary restrictions..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Known Allergies</Label>
            <Textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="List allergies..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Chronic Conditions</Label>
            <Textarea
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="Chronic conditions..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Family Medical History</Label>
            <Textarea
              value={familyHistory}
              onChange={(e) => setFamilyHistory(e.target.value)}
              placeholder="Family medical history..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Social History</Label>
            <Textarea
              value={socialHistory}
              onChange={(e) => setSocialHistory(e.target.value)}
              placeholder="Social history..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= FORM DIALOG =============
function FormDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<string>('');
  const [formData, setFormData] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormName('');
      setFormType('');
      setFormData('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !formName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const formDataObj: any = {
        form_name: formName,
        status: 'draft'
      };
      if (formType) formDataObj.form_type = formType;
      if (formData) {
        try {
          formDataObj.form_data = JSON.parse(formData);
        } catch {
          formDataObj.form_data = { content: formData };
        }
      }

      await api.createIPDForm(admissionId, formDataObj);
      toast.success('Form saved successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save form: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Form</DialogTitle>
          <DialogDescription>Create a new form for patient</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Form Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </div>
            <div className="space-y-2">
              <Label>Form Type</Label>
              <Input
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                placeholder="e.g., Consent, Assessment"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Form Data (JSON or Text)</Label>
            <Textarea
              value={formData}
              onChange={(e) => setFormData(e.target.value)}
              placeholder="Enter form data as JSON or plain text..."
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Form'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= DOCTOR RECOMMENDATION DIALOG =============
function DoctorRecommendationDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [recommendationType, setRecommendationType] = useState<string>('Treatment');
  const [recommendation, setRecommendation] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setRecommendationType('Treatment');
      setRecommendation('');
      setPriority('routine');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !recommendation.trim()) {
      toast.error('Please enter a recommendation');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const recommendationData: any = {
        recommendation_date: new Date().toISOString().split('T')[0],
        recommendation_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        recommendation_type: recommendationType,
        recommendation: recommendation,
        priority: priority,
        status: 'pending'
      };

      await api.createIPDDoctorRecommendation(admissionId, recommendationData);
      toast.success('Recommendation saved successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save recommendation: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Doctor Recommendation</DialogTitle>
          <DialogDescription>Record doctor recommendation</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recommendation Type *</Label>
              <Select value={recommendationType} onValueChange={setRecommendationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Treatment">Treatment</SelectItem>
                  <SelectItem value="Investigation">Investigation</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Discharge">Discharge</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">Stat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Recommendation *</Label>
            <Textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Enter recommendation..."
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Recommendation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= DOCTOR CONSULTATION DIALOG =============
function DoctorConsultationDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: IPDPatient | null;
  onSuccess?: () => void;
}) {
  const [department, setDepartment] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setDepartment('');
      setReason('');
      setPriority('routine');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !department || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const consultationData: any = {
        request_date: new Date().toISOString().split('T')[0],
        request_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        department: department,
        reason: reason,
        priority: priority,
        status: 'pending'
      };

      await api.createIPDDoctorConsultation(admissionId, consultationData);
      toast.success('Consultation request created successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to create consultation request: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Doctor Consultation</DialogTitle>
          <DialogDescription>Request consultation from another department</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Cardiology, Neurology"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">Stat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason for Consultation *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for consultation..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Request Consultation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= ALLOCATE BED DIALOG =============
function AllocateBedDialog({
  open,
  onOpenChange,
  bed,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bed: IPDBed | null;
  onSuccess?: () => void;
}) {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [recentAdmissions, setRecentAdmissions] = useState<IPDAdmission[]>([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadRecentAdmissions();
      setPatientSearch('');
      setPatientSearchResults([]);
    }
  }, [open]);
  
  useEffect(() => {
    if (!patientSearch || patientSearch.length < 2) {
      setPatientSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPatients();
    }, 500);

    return () => clearTimeout(timer);
  }, [patientSearch]);
  
  const searchPatients = async () => {
    try {
      setSearchingPatients(true);
      const data = await api.getPatients({ search: patientSearch });
      setPatientSearchResults(data || []);
    } catch (error: any) {
      toast.error('Failed to search patients: ' + (error.message || 'Unknown error'));
      setPatientSearchResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };
  
  const loadRecentAdmissions = async () => {
    try {
      setLoadingAdmissions(true);
      const data = await api.getIPDAdmissions({ status: 'admitted' });
      setRecentAdmissions(data.slice(0, 5) || []);
    } catch (error: any) {
      console.error('Failed to load recent admissions:', error);
      setRecentAdmissions([]);
    } finally {
      setLoadingAdmissions(false);
    }
  };
  
  const handleAllocateBed = async (admissionId: number) => {
    if (!bed?.id) {
      toast.error('No bed selected');
      return;
    }
    
    try {
      await api.updateIPDAdmission(admissionId, {
        bed_id: bed.id
      });
      
      toast.success(`Bed ${bed.bed_number} allocated successfully!`);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to allocate bed: ' + (error.message || 'Unknown error'));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Bed to Patient</DialogTitle>
          <DialogDescription>
            {bed 
              ? `Allocate ${bed.bed_number} in ${bed.ward_name || 'N/A'}`
              : 'Select a patient to allocate to a bed'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {bed && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Bed Number</Label>
                    <p className="font-medium">{bed.bed_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Ward</Label>
                    <p className="font-medium">{bed.ward_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Type</Label>
                    <p className="font-medium">{bed.bed_type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Daily Rate</Label>
                    <p className="font-medium">₹{bed.daily_rate?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by UHID, Name, or Contact Number..."
                className="pl-10"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {searchingPatients && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Searching...</span>
                  </div>
                </div>
              )}
              {!searchingPatients && patientSearch && patientSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {patientSearchResults.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={async () => {
                        try {
                          const admissionData: any = {
                            patient_id: parseInt(patient.id),
                            uhid: patient.uhid || patient.patient_id || '',
                            bed_id: bed?.id,
                            admission_date: new Date().toISOString().split('T')[0],
                            admission_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
                            admission_type: 'Emergency',
                            status: 'admitted'
                          };
                          await api.createIPDAdmission(admissionData);
                          toast.success(`Bed allocated to ${patient.name}`);
                          onOpenChange(false);
                          if (onSuccess) onSuccess();
                        } catch (error: any) {
                          toast.error('Failed to allocate bed: ' + (error.message || 'Unknown error'));
                        }
                      }}
                      className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{patient.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {patient.patient_id || patient.uhid || patient.id}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>{patient.age || 0}Y / {patient.gender || ''}</span>
                            <span>{patient.phone || ''}</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-[#27AE60] hover:bg-green-600">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Allocate
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Or Select from Recent Admissions</Label>
            <ScrollArea className="h-[300px] border rounded-lg">
              {loadingAdmissions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : recentAdmissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No recent admissions found
                </div>
              ) : (
                recentAdmissions.map((admission) => (
                  <div
                    key={admission.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    onClick={() => {
                      if (admission.id) {
                        handleAllocateBed(admission.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{admission.patient_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {admission.uhid || admission.ipd_number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{admission.patient_age || 0}Y / {admission.patient_gender || ''}</span>
                          <span>{admission.patient_contact || ''}</span>
                          <span>{admission.department || ''}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{admission.diagnosis || ''}</p>
                      </div>
                      <Button size="sm" className="bg-[#27AE60] hover:bg-green-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Allocate
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
          }}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= CREATE BED DIALOG =============
function CreateBedDialog({
  open,
  onOpenChange,
  bed,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bed: IPDBed | null;
  onSuccess?: () => void;
}) {
  const [bedNumber, setBedNumber] = useState<string>('');
  const [wardId, setWardId] = useState<string>('');
  const [bedType, setBedType] = useState<string>('General');
  const [dailyRate, setDailyRate] = useState<string>('');
  const [initialStatus, setInitialStatus] = useState<string>('available');
  const [facilities, setFacilities] = useState<Record<string, boolean>>({
    AC: false,
    TV: false,
    Washroom: false,
    WiFi: false,
    'Nurse Call': false,
    Ventilator: false,
    Monitor: false,
    Oxygen: false
  });
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [wards, setWards] = useState<IPDWard[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadWards();
      if (bed) {
        setBedNumber(bed.bed_number || '');
        setWardId((bed.ward_id || '').toString());
        setBedType(bed.bed_type || 'General');
        setDailyRate((bed.daily_rate || 0).toString());
        setInitialStatus(bed.status || 'available');
        setRemarks(bed.maintenance_notes || '');
        const facilitiesArray = typeof bed.facilities === 'string'
          ? JSON.parse(bed.facilities || '[]')
          : (bed.facilities || []);
        const facilitiesObj: Record<string, boolean> = {
          AC: false,
          TV: false,
          Washroom: false,
          WiFi: false,
          'Nurse Call': false,
          Ventilator: false,
          Monitor: false,
          Oxygen: false
        };
        facilitiesArray.forEach((fac: string) => {
          if (facilitiesObj.hasOwnProperty(fac)) {
            facilitiesObj[fac] = true;
          }
        });
        setFacilities(facilitiesObj);
      } else {
        setBedNumber('');
        setWardId('');
        setBedType('General');
        setDailyRate('');
        setInitialStatus('available');
        setRemarks('');
        setFacilities({
          AC: false,
          TV: false,
          Washroom: false,
          WiFi: false,
          'Nurse Call': false,
          Ventilator: false,
          Monitor: false,
          Oxygen: false
        });
      }
    }
  }, [open, bed]);
  
  const loadWards = async () => {
    try {
      setLoadingWards(true);
      const wardsData = await api.getIPDWards();
      setWards(wardsData || []);
    } catch (error: any) {
      toast.error('Failed to load wards: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingWards(false);
    }
  };
  
  const handleFacilityToggle = (facility: string) => {
    setFacilities(prev => ({
      ...prev,
      [facility]: !prev[facility]
    }));
  };
  
  const handleSubmit = async () => {
    if (!wardId) {
      toast.error('Please select a ward');
      return;
    }
    if (!bedNumber.trim()) {
      toast.error('Bed number is required');
      return;
    }
    if (!bedType) {
      toast.error('Bed type is required');
      return;
    }
    if (!dailyRate || parseFloat(dailyRate) < 0) {
      toast.error('Daily rate must be a valid number');
      return;
    }
    
    try {
      setSubmitting(true);
      const selectedFacilities = Object.entries(facilities)
        .filter(([_, checked]) => checked)
        .map(([name, _]) => name);
      
      const bedData: any = {
        ward_id: parseInt(wardId),
        bed_number: bedNumber.trim(),
        bed_type: bedType,
        daily_rate: parseFloat(dailyRate),
        status: initialStatus,
        facilities: selectedFacilities
      };
      
      if (remarks) bedData.maintenance_notes = remarks.trim();
      
      if (bed) {
        await api.updateIPDBed(bed.id!, bedData);
        toast.success('Bed updated successfully!');
      } else {
        await api.createIPDBed(bedData);
        toast.success('Bed created successfully!');
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save bed: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bed</DialogTitle>
          <DialogDescription>
            Add a new bed to the hospital's bed inventory
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bed Number *</Label>
              <Input 
                placeholder="e.g., GWA-107" 
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500">Unique bed identifier</p>
            </div>
            <div className="space-y-2">
              <Label>Ward *</Label>
              <Select value={wardId} onValueChange={setWardId} disabled={loadingWards}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {loadingWards ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading wards...</div>
                  ) : wards.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No wards available</div>
                  ) : (
                    wards.filter(w => w.id).map((ward) => (
                      <SelectItem key={ward.id} value={ward.id!.toString()}>
                        {ward.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bed Type *</Label>
              <Select value={bedType} onValueChange={setBedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Isolation">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Rate (₹) *</Label>
              <Input 
                type="number" 
                placeholder="e.g., 2000" 
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Initial Status *</Label>
            <Select value={initialStatus} onValueChange={setInitialStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="maintenance">Under Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Facilities</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(facilities).map((facility) => (
                <label key={facility} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={facilities[facility]}
                    onChange={() => handleFacilityToggle(facility)}
                  />
                  <span className="text-sm">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Textarea 
              placeholder="Additional notes about this bed..."
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            className="bg-[#27AE60] hover:bg-green-600"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= NEW REHABILITATION REQUEST DIALOG =============
function NewRehabilitationRequestDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [admissionId, setAdmissionId] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Physiotherapy');
  const [requestedByDoctorId, setRequestedByDoctorId] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('Daily');
  const [duration, setDuration] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [totalSessions, setTotalSessions] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [admissions, setAdmissions] = useState<IPDAdmission[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
      setAdmissionId('');
      setPatientId('');
      setServiceType('Physiotherapy');
      setRequestedByDoctorId('');
      setFrequency('Daily');
      setDuration('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setTotalSessions('');
      setNotes('');
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [admissionsData, doctorsData] = await Promise.all([
        api.getIPDAdmissions({ status: 'admitted' }),
        api.getDoctors() // Load all active doctors without status filter first
      ]);
      setAdmissions(admissionsData || []);
      const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
      setDoctors(doctorsList);
      
      if (doctorsList.length === 0) {
        console.warn('No doctors found. API returned:', doctorsData);
      }
    } catch (error: any) {
      console.error('Error loading rehabilitation dialog data:', error);
      toast.error('Failed to load data: ' + (error.message || 'Unknown error'));
      setAdmissions([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!admissionId && !patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!serviceType) {
      toast.error('Please select a service type');
      return;
    }

    try {
      setSubmitting(true);
      const admission = admissions.find(a => String(a.id) === admissionId);
      const requestData: CreateIPDRehabilitationRequestData = {
        admission_id: admissionId ? parseInt(admissionId) : undefined,
        patient_id: admission?.patient_id || parseInt(patientId),
        service_type: serviceType,
        requested_by_doctor_id: requestedByDoctorId ? parseInt(requestedByDoctorId) : undefined,
        frequency: frequency || undefined,
        duration: duration || undefined,
        status: 'pending',
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        total_sessions: totalSessions ? parseInt(totalSessions) : undefined,
        notes: notes || undefined,
      };

      await api.createIPDRehabilitationRequest(requestData);
      toast.success('Rehabilitation request created successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to create request: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Rehabilitation Request</DialogTitle>
          <DialogDescription>
            Create a new rehabilitation/physiotherapy service request for an IPD patient
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Patient *</Label>
              <Select 
                value={admissionId} 
                onValueChange={(value) => {
                  setAdmissionId(value);
                  const admission = admissions.find(a => String(a.id) === value);
                  if (admission) {
                    setPatientId(String(admission.patient_id || ''));
                  }
                }}
                disabled={loading || admissions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {admissions.map((admission) => (
                    <SelectItem key={admission.id} value={String(admission.id)}>
                      {admission.patient_name} - {admission.ipd_number} ({admission.ward_name || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                  <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                  <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                  <SelectItem value="Cardiac Rehabilitation">Cardiac Rehabilitation</SelectItem>
                  <SelectItem value="Respiratory Therapy">Respiratory Therapy</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Requested By Doctor</Label>
              <Select 
                value={requestedByDoctorId} 
                onValueChange={setRequestedByDoctorId}
                disabled={loading || doctors.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading doctors..." : doctors.length === 0 ? "No doctors available" : "Select doctor"} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading doctors...</div>
                  ) : doctors.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No doctors available</div>
                  ) : (
                    doctors
                      .filter(doctor => doctor.id && doctor.id !== 0)
                      .map((doctor) => (
                        <SelectItem key={doctor.id} value={String(doctor.id)}>
                          {doctor.name || 'Unknown'} - {doctor.specialty || doctor.specialization || 'N/A'}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                  <SelectItem value="Every Other Day">Every Other Day</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="As Needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Duration (Optional)</Label>
              <Input
                placeholder="e.g., 30 minutes, 1 hour"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div>
              <Label>Total Sessions (Optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={totalSessions}
                onChange={(e) => setTotalSessions(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Additional instructions or notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting || !admissionId || !serviceType}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= VIEW REHABILITATION REQUEST DIALOG =============
function ViewRehabilitationRequestDialog({
  open,
  onOpenChange,
  request
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rehabilitation Request Details</DialogTitle>
          <DialogDescription>
            View complete details of the rehabilitation request
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-3">Patient Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Patient Name:</span>
                  <p className="font-medium">{request.patient_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">IPD Number:</span>
                  <p className="font-medium">{request.ipd_number || request.admission_id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ward:</span>
                  <p className="font-medium">{request.ward_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bed:</span>
                  <p className="font-medium">{request.bed_number || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Service Type</Label>
              <p className="text-sm font-medium mt-1">{request.service_type || 'N/A'}</p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge className={request.status === 'active' ? 'bg-green-100 text-green-800' : request.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>
                {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'N/A'}
              </Badge>
            </div>
            <div>
              <Label>Requested By</Label>
              <p className="text-sm font-medium mt-1">{request.doctor_name || request.requested_by_name || 'N/A'}</p>
            </div>
            <div>
              <Label>Frequency</Label>
              <p className="text-sm font-medium mt-1">{request.frequency || 'N/A'}</p>
            </div>
            <div>
              <Label>Start Date</Label>
              <p className="text-sm font-medium mt-1">{request.start_date ? new Date(request.start_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <Label>End Date</Label>
              <p className="text-sm font-medium mt-1">{request.end_date ? new Date(request.end_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <Label>Duration</Label>
              <p className="text-sm font-medium mt-1">{request.duration || 'N/A'}</p>
            </div>
            <div>
              <Label>Total Sessions</Label>
              <p className="text-sm font-medium mt-1">{request.total_sessions || 'N/A'}</p>
            </div>
            <div>
              <Label>Completed Sessions</Label>
              <p className="text-sm font-medium mt-1">{request.completed_sessions || 0}</p>
            </div>
            <div>
              <Label>Next Session</Label>
              <p className="text-sm font-medium mt-1">
                {request.next_session_date 
                  ? `${new Date(request.next_session_date).toLocaleDateString()}${request.next_session_time ? ' ' + request.next_session_time : ''}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {request.notes && (
            <div>
              <Label>Notes</Label>
              <p className="text-sm mt-1 p-3 bg-gray-50 rounded border">{request.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= EDIT REHABILITATION REQUEST DIALOG =============
function EditRehabilitationRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onSuccess?: () => void;
}) {
  const [serviceType, setServiceType] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalSessions, setTotalSessions] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [nextSessionDate, setNextSessionDate] = useState<string>('');
  const [nextSessionTime, setNextSessionTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && request) {
      setServiceType(request.service_type || '');
      setFrequency(request.frequency || '');
      setDuration(request.duration || '');
      setStartDate(request.start_date ? request.start_date.split('T')[0] : '');
      setEndDate(request.end_date ? request.end_date.split('T')[0] : '');
      setTotalSessions(request.total_sessions ? String(request.total_sessions) : '');
      setStatus(request.status || 'pending');
      setNextSessionDate(request.next_session_date ? request.next_session_date.split('T')[0] : '');
      setNextSessionTime(request.next_session_time || '');
      setNotes(request.notes || '');
    }
  }, [open, request]);

  const handleSubmit = async () => {
    if (!request?.id) {
      toast.error('No request selected');
      return;
    }
    if (!serviceType) {
      toast.error('Service type is required');
      return;
    }

    try {
      setSubmitting(true);
      const requestData: Partial<CreateIPDRehabilitationRequestData> = {
        service_type: serviceType,
        frequency: frequency || undefined,
        duration: duration || undefined,
        status: status as any,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        total_sessions: totalSessions ? parseInt(totalSessions) : undefined,
        next_session_date: nextSessionDate || undefined,
        next_session_time: nextSessionTime || undefined,
        notes: notes || undefined,
      };

      await api.updateIPDRehabilitationRequest(request.id, requestData);
      toast.success('Rehabilitation request updated successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to update request: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rehabilitation Request</DialogTitle>
          <DialogDescription>
            Update rehabilitation request details for {request.patient_name || 'patient'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2">Patient: {request.patient_name || 'N/A'}</h4>
              <p className="text-xs text-gray-600">IPD: {request.ipd_number || request.admission_id || 'N/A'}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                  <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                  <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                  <SelectItem value="Cardiac Rehabilitation">Cardiac Rehabilitation</SelectItem>
                  <SelectItem value="Respiratory Therapy">Respiratory Therapy</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                  <SelectItem value="Every Other Day">Every Other Day</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="As Needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duration</Label>
              <Input
                placeholder="e.g., 30 minutes, 1 hour"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Total Sessions</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={totalSessions}
                onChange={(e) => setTotalSessions(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <Label>Next Session Date</Label>
              <Input
                type="date"
                value={nextSessionDate}
                onChange={(e) => setNextSessionDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Next Session Time</Label>
              <Input
                type="time"
                value={nextSessionTime}
                onChange={(e) => setNextSessionTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional instructions or notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting || !serviceType}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Update Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= ADVANCED FILTERS DIALOG =============
function AdvancedFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
  wards,
  doctors,
  departments
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: any;
  onApplyFilters: (filters: any) => void;
  wards: IPDWard[];
  doctors: any[];
  departments: string[];
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters({
      dateFrom: '',
      dateTo: '',
      status: 'all',
      department: 'all',
      ward: 'all',
      doctor: 'all',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Apply multiple filters to refine your search results
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={localFilters.status} onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={localFilters.department} onValueChange={(value) => setLocalFilters({ ...localFilters, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ward</Label>
              <Select value={localFilters.ward} onValueChange={(value) => setLocalFilters({ ...localFilters, ward: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={String(ward.id)}>{ward.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor</Label>
              <Select value={localFilters.doctor} onValueChange={(value) => setLocalFilters({ ...localFilters, doctor: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>{doctor.name} - {doctor.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= NOTIFICATIONS PANEL =============
function NotificationsPanel({
  open,
  onOpenChange,
  dashboardStats
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardStats: IPDDashboardStats | null;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifs: any[] = [];
      
      if (dashboardStats?.stats.critical_patients && dashboardStats.stats.critical_patients > 0) {
        notifs.push({
          id: 1,
          type: 'critical',
          title: 'Critical Patients Alert',
          message: `${dashboardStats.stats.critical_patients} patient(s) require immediate attention`,
          time: new Date().toISOString(),
          read: false
        });
      }
      
      if (dashboardStats?.stats.pending_discharges && dashboardStats.stats.pending_discharges > 0) {
        notifs.push({
          id: 2,
          type: 'info',
          title: 'Pending Discharges',
          message: `${dashboardStats.stats.pending_discharges} discharge(s) pending`,
          time: new Date().toISOString(),
          read: false
        });
      }
      
      setNotifications(notifs);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            Important alerts and updates
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Card key={notif.id} className={`border-l-4 ${
                notif.type === 'critical' ? 'border-red-500' : 'border-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notif.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= SETTINGS DIALOG =============
function SettingsDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [viewMode, setViewMode] = useState<string>(localStorage.getItem('ipd_view_mode') || 'default');
  const [dateFormat, setDateFormat] = useState<string>(localStorage.getItem('ipd_date_format') || 'DD/MM/YYYY');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(localStorage.getItem('ipd_auto_refresh') === 'true');
  const [refreshInterval, setRefreshInterval] = useState<string>(localStorage.getItem('ipd_refresh_interval') || '5');

  const handleSave = () => {
    localStorage.setItem('ipd_view_mode', viewMode);
    localStorage.setItem('ipd_date_format', dateFormat);
    localStorage.setItem('ipd_auto_refresh', String(autoRefresh));
    localStorage.setItem('ipd_refresh_interval', refreshInterval);
    toast.success('Settings saved successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your IPD Management preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label>View Mode</Label>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date Format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Refresh</Label>
              <p className="text-xs text-gray-500">Automatically refresh data at intervals</p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          {autoRefresh && (
            <div>
              <Label>Refresh Interval (minutes)</Label>
              <Input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                min="1"
                max="60"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
