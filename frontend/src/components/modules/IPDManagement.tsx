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

import { useState } from 'react';
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
import { Alert, AlertDescription } from '../ui/alert';
import { WardBedView } from './WardBedView';
import {
  Bed,
  Building2,
  UserPlus,
  Users,
  Activity,
  Stethoscope,
  Pill,
  FlaskConical,
  Calendar,
  Clock,
  DollarSign,
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
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  PieChart,
  Heart,
  Thermometer,
  Droplet,
  Wind,
  Zap,
  Shield,
  ClipboardList,
  UserCheck,
  Bell,
  Settings,
  RefreshCw,
  Send,
  Share2,
  Copy,
  CheckCheck,
  AlertCircle,
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
  PersonStanding
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner@2.0.3';

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

interface IPDBilling {
  id: string;
  patientId: string;
  patientName: string;
  ipdNumber: string;
  admissionDate: string;
  dischargeDate?: string;
  lengthOfStay: number;
  roomCharges: {
    bedType: string;
    ratePerDay: number;
    days: number;
    total: number;
  };
  consultationCharges: {
    doctor: string;
    visits: number;
    ratePerVisit: number;
    total: number;
  }[];
  medicationCharges: number;
  labCharges: number;
  imagingCharges: number;
  procedureCharges: {
    procedureName: string;
    date: string;
    amount: number;
  }[];
  otherCharges: {
    description: string;
    amount: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  advancePaid: number;
  insuranceCovered: number;
  dueAmount: number;
}

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

// ============= MOCK DATA =============

const mockWards: Ward[] = [
  {
    id: 'W001',
    name: 'General Ward A',
    floor: 2,
    type: 'General',
    totalBeds: 30,
    occupiedBeds: 24,
    availableBeds: 6,
    nurseInCharge: 'Sister Mary Johnson',
    contactNumber: '+1-555-0101',
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    status: 'active'
  },
  {
    id: 'W002',
    name: 'ICU - Intensive Care Unit',
    floor: 3,
    type: 'ICU',
    totalBeds: 12,
    occupiedBeds: 10,
    availableBeds: 2,
    nurseInCharge: 'Sister Emily Davis',
    contactNumber: '+1-555-0102',
    facilities: ['Ventilator', 'Monitor', 'Oxygen', 'Emergency Equipment'],
    status: 'active'
  },
  {
    id: 'W003',
    name: 'Private Ward',
    floor: 4,
    type: 'Private',
    totalBeds: 20,
    occupiedBeds: 15,
    availableBeds: 5,
    nurseInCharge: 'Sister Sarah Wilson',
    contactNumber: '+1-555-0103',
    facilities: ['AC', 'TV', 'Attached Bathroom', 'WiFi', 'Refrigerator'],
    status: 'active'
  },
  {
    id: 'W004',
    name: 'Cardiac Care Unit (CCU)',
    floor: 3,
    type: 'CCU',
    totalBeds: 8,
    occupiedBeds: 6,
    availableBeds: 2,
    nurseInCharge: 'Sister Lisa Brown',
    contactNumber: '+1-555-0104',
    facilities: ['Cardiac Monitor', 'Defibrillator', 'Oxygen', 'Emergency Cart'],
    status: 'active'
  },
  {
    id: 'W005',
    name: 'NICU - Neonatal ICU',
    floor: 5,
    type: 'NICU',
    totalBeds: 15,
    occupiedBeds: 12,
    availableBeds: 3,
    nurseInCharge: 'Sister Jennifer Taylor',
    contactNumber: '+1-555-0105',
    facilities: ['Incubator', 'Phototherapy', 'Monitor', 'Ventilator'],
    status: 'active'
  },
  {
    id: 'W006',
    name: 'Isolation Ward',
    floor: 1,
    type: 'Isolation',
    totalBeds: 10,
    occupiedBeds: 3,
    availableBeds: 7,
    nurseInCharge: 'Sister Michelle Anderson',
    contactNumber: '+1-555-0106',
    facilities: ['Negative Pressure', 'PPE Station', 'Dedicated Washroom'],
    status: 'active'
  }
];

const mockIPDPatients: IPDPatient[] = [
  {
    id: 'IPD001',
    ipdNumber: 'IPD-2024-001234',
    uhid: 'UHID-892345',
    patientName: 'Robert Johnson',
    age: 58,
    gender: 'male',
    contactNumber: '+1-555-2001',
    emergencyContact: '+1-555-2002',
    address: '123 Oak Street, Medical City, MC 12345',
    admissionDate: '2024-11-08',
    admissionTime: '14:30',
    admittedBy: 'Dr. Sarah Mitchell',
    consultingDoctor: 'Dr. Michael Stevens',
    department: 'Cardiology',
    wardName: 'CCU',
    bedNumber: 'CCU-04',
    diagnosis: 'Acute Myocardial Infarction',
    admissionType: 'Emergency',
    status: 'critical',
    insurance: {
      provider: 'HealthPlus Insurance',
      policyNumber: 'HP-2024-56789',
      coverageAmount: 500000,
      approvalNumber: 'APR-2024-1234'
    },
    estimatedDuration: 7,
    actualDuration: 3,
    totalCharges: 125000,
    paidAmount: 50000,
    dueAmount: 75000
  },
  {
    id: 'IPD002',
    ipdNumber: 'IPD-2024-001235',
    uhid: 'UHID-892346',
    patientName: 'Maria Garcia',
    age: 34,
    gender: 'female',
    contactNumber: '+1-555-2003',
    emergencyContact: '+1-555-2004',
    address: '456 Pine Avenue, Medical City, MC 12346',
    admissionDate: '2024-11-09',
    admissionTime: '10:15',
    admittedBy: 'Dr. Emily Chen',
    consultingDoctor: 'Dr. David Wilson',
    department: 'Orthopedics',
    wardName: 'Private Ward',
    bedNumber: 'PVT-12',
    diagnosis: 'Fracture Femur - Post Surgery',
    admissionType: 'Planned',
    status: 'stable',
    insurance: {
      provider: 'MediCare Plus',
      policyNumber: 'MCP-2024-78901',
      coverageAmount: 300000,
      approvalNumber: 'APR-2024-1235'
    },
    estimatedDuration: 5,
    actualDuration: 2,
    totalCharges: 85000,
    paidAmount: 30000,
    dueAmount: 55000
  },
  {
    id: 'IPD003',
    ipdNumber: 'IPD-2024-001236',
    uhid: 'UHID-892347',
    patientName: 'James Wilson',
    age: 72,
    gender: 'male',
    contactNumber: '+1-555-2005',
    emergencyContact: '+1-555-2006',
    address: '789 Maple Drive, Medical City, MC 12347',
    admissionDate: '2024-11-07',
    admissionTime: '08:45',
    admittedBy: 'Dr. Richard Parker',
    consultingDoctor: 'Dr. Jennifer Adams',
    department: 'General Medicine',
    wardName: 'General Ward A',
    bedNumber: 'GEN-A-15',
    diagnosis: 'Pneumonia with Respiratory Distress',
    admissionType: 'Emergency',
    status: 'under-treatment',
    estimatedDuration: 10,
    actualDuration: 4,
    totalCharges: 45000,
    paidAmount: 20000,
    dueAmount: 25000
  },
  {
    id: 'IPD004',
    ipdNumber: 'IPD-2024-001237',
    uhid: 'UHID-892348',
    patientName: 'Sarah Miller',
    age: 28,
    gender: 'female',
    contactNumber: '+1-555-2007',
    emergencyContact: '+1-555-2008',
    address: '321 Elm Street, Medical City, MC 12348',
    admissionDate: '2024-11-10',
    admissionTime: '16:20',
    admittedBy: 'Dr. Lisa Thompson',
    consultingDoctor: 'Dr. Robert Anderson',
    department: 'Obstetrics',
    wardName: 'Private Ward',
    bedNumber: 'PVT-08',
    diagnosis: 'Normal Delivery - Post Natal Care',
    admissionType: 'Planned',
    status: 'stable',
    estimatedDuration: 3,
    actualDuration: 1,
    totalCharges: 35000,
    paidAmount: 35000,
    dueAmount: 0
  },
  {
    id: 'IPD005',
    ipdNumber: 'IPD-2024-001238',
    uhid: 'UHID-892349',
    patientName: 'Michael Brown',
    age: 45,
    gender: 'male',
    contactNumber: '+1-555-2009',
    emergencyContact: '+1-555-2010',
    address: '654 Cedar Lane, Medical City, MC 12349',
    admissionDate: '2024-11-06',
    admissionTime: '11:00',
    admittedBy: 'Dr. Amanda White',
    consultingDoctor: 'Dr. Christopher Lee',
    department: 'Neurology',
    wardName: 'ICU',
    bedNumber: 'ICU-07',
    diagnosis: 'Stroke - Ischemic',
    admissionType: 'Emergency',
    status: 'critical',
    insurance: {
      provider: 'Star Health Insurance',
      policyNumber: 'SHI-2024-45678',
      coverageAmount: 800000,
      approvalNumber: 'APR-2024-1236'
    },
    estimatedDuration: 14,
    actualDuration: 5,
    totalCharges: 245000,
    paidAmount: 100000,
    dueAmount: 145000
  }
];

const mockVitalSigns: VitalSigns[] = [
  {
    id: 'VS001',
    patientId: 'IPD001',
    recordedDate: '2024-11-11',
    recordedTime: '08:00',
    recordedBy: 'Nurse Emma Wilson',
    temperature: 37.2,
    bloodPressureSystolic: 140,
    bloodPressureDiastolic: 90,
    heartRate: 88,
    respiratoryRate: 18,
    oxygenSaturation: 96,
    bloodSugar: 125,
    painScore: 3,
    consciousness: 'Alert',
    notes: 'Patient stable, responding well to treatment'
  },
  {
    id: 'VS002',
    patientId: 'IPD001',
    recordedDate: '2024-11-11',
    recordedTime: '14:00',
    recordedBy: 'Nurse Emma Wilson',
    temperature: 37.0,
    bloodPressureSystolic: 135,
    bloodPressureDiastolic: 85,
    heartRate: 82,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    bloodSugar: 110,
    painScore: 2,
    consciousness: 'Alert',
    notes: 'Improvement noted'
  }
];

const mockTreatmentOrders: TreatmentOrder[] = [
  {
    id: 'TO001',
    patientId: 'IPD001',
    patientName: 'Robert Johnson',
    orderDate: '2024-11-11',
    orderTime: '09:00',
    orderedBy: 'Dr. Michael Stevens',
    orderType: 'Medication',
    orderDetails: 'Aspirin 75mg - Once Daily',
    frequency: 'Once Daily',
    duration: '7 days',
    priority: 'routine',
    status: 'in-progress',
    startDate: '2024-11-11',
    notes: 'With food'
  },
  {
    id: 'TO002',
    patientId: 'IPD001',
    patientName: 'Robert Johnson',
    orderDate: '2024-11-11',
    orderTime: '09:05',
    orderedBy: 'Dr. Michael Stevens',
    orderType: 'Lab Test',
    orderDetails: 'Cardiac Enzyme Panel',
    priority: 'stat',
    status: 'pending',
    notes: 'Urgent - Monitor cardiac markers'
  },
  {
    id: 'TO003',
    patientId: 'IPD002',
    patientName: 'Maria Garcia',
    orderDate: '2024-11-11',
    orderTime: '10:30',
    orderedBy: 'Dr. David Wilson',
    orderType: 'Physiotherapy',
    orderDetails: 'Post-surgical physiotherapy for lower limb',
    frequency: 'Twice daily',
    duration: '14 days',
    priority: 'routine',
    status: 'in-progress',
    startDate: '2024-11-10'
  }
];

const mockNursingNotes: NursingNote[] = [
  {
    id: 'NN001',
    patientId: 'IPD001',
    patientName: 'Robert Johnson',
    date: '2024-11-11',
    time: '08:30',
    shift: 'Morning',
    nurseName: 'Nurse Emma Wilson',
    category: 'General',
    note: 'Patient had a restful night. Vital signs stable. No complaints of chest pain. Ambulated with assistance.',
    severity: 'low'
  },
  {
    id: 'NN002',
    patientId: 'IPD001',
    patientName: 'Robert Johnson',
    date: '2024-11-11',
    time: '14:45',
    shift: 'Evening',
    nurseName: 'Nurse Sarah Martinez',
    category: 'Medication',
    note: 'All medications administered as per schedule. Patient tolerated well. No adverse reactions observed.',
    severity: 'low'
  }
];

// ============= MAIN COMPONENT =============

export function IPDManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<IPDPatient | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [isAdmissionDialogOpen, setIsAdmissionDialogOpen] = useState(false);
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

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
    const admissionTrend = [
      { date: 'Nov 5', admissions: 12, discharges: 8 },
      { date: 'Nov 6', admissions: 15, discharges: 10 },
      { date: 'Nov 7', admissions: 10, discharges: 12 },
      { date: 'Nov 8', admissions: 18, discharges: 9 },
      { date: 'Nov 9', admissions: 14, discharges: 11 },
      { date: 'Nov 10', admissions: 16, discharges: 13 },
      { date: 'Nov 11', admissions: 13, discharges: 7 }
    ];

    const departmentData = [
      { name: 'General Medicine', value: 35, patients: 28 },
      { name: 'Surgery', value: 25, patients: 20 },
      { name: 'Cardiology', value: 15, patients: 12 },
      { name: 'Orthopedics', value: 12, patients: 10 },
      { name: 'Pediatrics', value: 8, patients: 6 },
      { name: 'Others', value: 5, patients: 4 }
    ];

    const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#9B51E0', '#EB5757', '#6FCF97'];

    const occupancyData = mockWards.map(ward => ({
      name: ward.name,
      occupied: ward.occupiedBeds,
      available: ward.availableBeds,
      occupancyRate: ((ward.occupiedBeds / ward.totalBeds) * 100).toFixed(1)
    }));

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-3xl mb-1">80</h3>
              <p className="text-sm text-gray-600">Current IPD Patients</p>
              <p className="text-xs text-green-600 mt-2">+12.5% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Bed className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-700">84.2%</Badge>
              </div>
              <h3 className="text-3xl mb-1">80/95</h3>
              <p className="text-sm text-gray-600">Bed Occupancy</p>
              <p className="text-xs text-gray-500 mt-2">15 beds available</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-red-100 text-red-700">Critical</Badge>
              </div>
              <h3 className="text-3xl mb-1">12</h3>
              <p className="text-sm text-gray-600">Critical Patients</p>
              <p className="text-xs text-orange-600 mt-2">Requires monitoring</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-3xl mb-1">$245K</h3>
              <p className="text-sm text-gray-600">IPD Revenue (Today)</p>
              <p className="text-xs text-green-600 mt-2">+8.2% from yesterday</p>
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
                <Button variant="outline" size="sm">
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
                <Button variant="outline" size="sm">
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
                  {mockWards.map(ward => (
                    <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
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
                  <TableHead>IPD No.</TableHead>
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
                {mockIPDPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="text-blue-600">{patient.ipdNumber}</p>
                        <p className="text-xs text-gray-500">{patient.uhid}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{patient.patientName}</p>
                        <p className="text-xs text-gray-500">{patient.age}Y / {patient.gender}</p>
                        <p className="text-xs text-gray-500">{patient.contactNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {patient.wardName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          {patient.bedNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{patient.consultingDoctor}</p>
                      <p className="text-xs text-gray-500">{patient.department}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{patient.admissionDate}</p>
                        <p className="text-xs text-gray-500">{patient.admissionTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.actualDuration} days</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">${patient.totalCharges.toLocaleString()}</p>
                        <p className="text-xs text-red-600">Due: ${patient.dueAmount.toLocaleString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveSection('patient-details');
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    );
  };

  // ============= PATIENT DETAILS =============
  const renderPatientDetails = () => {
    if (!selectedPatient) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setActiveSection('admissions')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl text-gray-900">{selectedPatient.patientName}</h2>
              <p className="text-sm text-gray-600">{selectedPatient.ipdNumber} • {selectedPatient.uhid}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsVitalsDialogOpen(true)}>
              <Activity className="w-4 h-4 mr-2" />
              Record Vitals
            </Button>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsDischargeDialogOpen(true)}>
              <Home className="w-4 h-4 mr-2" />
              Discharge
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="orders">Treatment Orders</TabsTrigger>
            <TabsTrigger value="nursing">Nursing Notes</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Information */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Full Name</Label>
                        <p>{selectedPatient.patientName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Age / Gender</Label>
                        <p>{selectedPatient.age} Years / {selectedPatient.gender}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Contact Number</Label>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {selectedPatient.contactNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Emergency Contact</Label>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {selectedPatient.emergencyContact}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Address</Label>
                        <p className="flex items-start gap-2">
                          <MapPin className="w-3 h-3 mt-1" />
                          <span className="text-sm">{selectedPatient.address}</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Admission Date & Time</Label>
                        <p>{selectedPatient.admissionDate} at {selectedPatient.admissionTime}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Admitted By</Label>
                        <p>{selectedPatient.admittedBy}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Consulting Doctor</Label>
                        <p>{selectedPatient.consultingDoctor}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Department</Label>
                        <p>{selectedPatient.department}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Admission Type</Label>
                        <Badge variant="outline">{selectedPatient.admissionType}</Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Current Status</Label>
                        <Badge className={getStatusColor(selectedPatient.status)}>
                          {selectedPatient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Location */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Current Location</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h3>{selectedPatient.wardName}</h3>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Bed className="w-5 h-5 text-blue-600" />
                      <p>Bed: {selectedPatient.bedNumber}</p>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Length of Stay</p>
                      <p className="text-2xl">{selectedPatient.actualDuration} days</p>
                      <p className="text-xs text-gray-500">Est. {selectedPatient.estimatedDuration} days</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Transfer Patient
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Diagnosis & Insurance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle>Diagnosis</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Primary Diagnosis</p>
                    <p>{selectedPatient.diagnosis}</p>
                  </div>
                </CardContent>
              </Card>

              {selectedPatient.insurance && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle>Insurance Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Provider</span>
                        <span>{selectedPatient.insurance.provider}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Policy Number</span>
                        <span className="font-mono text-sm">{selectedPatient.insurance.policyNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Coverage</span>
                        <span>${selectedPatient.insurance.coverageAmount.toLocaleString()}</span>
                      </div>
                      {selectedPatient.insurance.approvalNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Approval No.</span>
                          <Badge variant="outline" className="bg-green-50">
                            {selectedPatient.insurance.approvalNumber}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vital Signs Monitoring</CardTitle>
                    <CardDescription>Track patient's vital parameters</CardDescription>
                  </div>
                  <Button onClick={() => setIsVitalsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Vitals
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {mockVitalSigns.map((vital) => (
                      <Card key={vital.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm">{vital.recordedDate} at {vital.recordedTime}</p>
                              <p className="text-xs text-gray-500">Recorded by {vital.recordedBy}</p>
                            </div>
                            <Badge className={getStatusColor(vital.consciousness.toLowerCase())}>
                              {vital.consciousness}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                              <Thermometer className="w-5 h-5 text-red-600" />
                              <div>
                                <p className="text-xs text-gray-600">Temperature</p>
                                <p className="text-lg">{vital.temperature}°C</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <Heart className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-600">Blood Pressure</p>
                                <p className="text-lg">{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <Activity className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-600">Heart Rate</p>
                                <p className="text-lg">{vital.heartRate} bpm</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Wind className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-600">SpO2</p>
                                <p className="text-lg">{vital.oxygenSaturation}%</p>
                              </div>
                            </div>
                          </div>
                          {vital.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Notes</p>
                              <p className="text-sm">{vital.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Treatment Orders</CardTitle>
                    <CardDescription>Doctor's orders and prescriptions</CardDescription>
                  </div>
                  <Button onClick={() => setIsOrderDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Ordered By</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTreatmentOrders.filter(order => order.patientId === selectedPatient.id).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.orderDate}</p>
                            <p className="text-xs text-gray-500">{order.orderTime}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.orderType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{order.orderDetails}</p>
                            {order.frequency && (
                              <p className="text-xs text-gray-500">Frequency: {order.frequency}</p>
                            )}
                            {order.duration && (
                              <p className="text-xs text-gray-500">Duration: {order.duration}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{order.orderedBy}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nursing Notes Tab */}
          <TabsContent value="nursing" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nursing Notes</CardTitle>
                    <CardDescription>Daily nursing observations and care notes</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {mockNursingNotes.filter(note => note.patientId === selectedPatient.id).map((note) => (
                      <Card key={note.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{note.category}</Badge>
                                <Badge variant="outline">{note.shift}</Badge>
                                {note.severity && (
                                  <Badge className={getStatusColor(note.severity)}>
                                    {note.severity}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{note.date} at {note.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mb-2">{note.note}</p>
                          <p className="text-xs text-gray-500">— {note.nurseName}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>IPD Billing Summary</CardTitle>
                <CardDescription>Detailed billing and payment information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Charges</p>
                        <p className="text-2xl">${selectedPatient.totalCharges.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
                        <p className="text-2xl text-green-600">${selectedPatient.paidAmount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Due Amount</p>
                        <p className="text-2xl text-red-600">${selectedPatient.dueAmount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Breakdown */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="mb-4">Charge Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4 text-gray-400" />
                            <span>Room Charges ({selectedPatient.actualDuration} days)</span>
                          </div>
                          <span>$15,000</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" />
                            <span>Doctor Consultation</span>
                          </div>
                          <span>$5,000</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-gray-400" />
                            <span>Medications</span>
                          </div>
                          <span>$8,500</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-gray-400" />
                            <span>Laboratory Tests</span>
                          </div>
                          <span>$4,200</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span>Procedures</span>
                          </div>
                          <span>$12,300</span>
                        </div>
                        <div className="flex items-center justify-between text-lg">
                          <span>Total</span>
                          <span>${selectedPatient.totalCharges.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button className="flex-1" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Bill
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Bill
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Collect Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle>Medical Documents</CardTitle>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No documents uploaded yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Patient Timeline</CardTitle>
                <CardDescription>Complete admission to discharge timeline</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm mb-1">Patient Admitted</p>
                      <p className="text-xs text-gray-500">{selectedPatient.admissionDate} at {selectedPatient.admissionTime}</p>
                      <p className="text-xs text-gray-600 mt-2">Admitted by {selectedPatient.admittedBy}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm mb-1">Vital Signs Recorded</p>
                      <p className="text-xs text-gray-500">Multiple entries</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-1">Treatment Ongoing</p>
                      <p className="text-xs text-gray-500">Active orders and medications</p>
                    </div>
                  </div>
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Ward Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage wards and bed allocation</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Ward
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWards.map((ward) => (
            <Card key={ward.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ward.name}</CardTitle>
                      <p className="text-xs text-gray-500">Floor {ward.floor}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(ward.status)}>
                    {ward.status}
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
                        {ward.occupiedBeds}/{ward.totalBeds}
                      </span>
                    </div>
                    <Progress 
                      value={(ward.occupiedBeds / ward.totalBeds) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {ward.availableBeds} beds available
                      </span>
                      <span className="text-xs text-gray-500">
                        {((ward.occupiedBeds / ward.totalBeds) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Ward Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <Badge variant="outline">{ward.type}</Badge>
                    </div>
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-gray-600">Nurse In-Charge</span>
                      <span className="text-right">{ward.nurseInCharge}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Contact</span>
                      <span className="font-mono text-xs">{ward.contactNumber}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Facilities */}
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1">
                      {ward.facilities.map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedWard(ward);
                        setActiveSection('ward-beds');
                      }}
                    >
                      <Eye className="w-3 h-3 mr-2" />
                      View Beds
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            <Button variant="secondary" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              <Badge className="bg-red-500 text-white ml-2">12</Badge>
            </Button>
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 min-h-[calc(100vh-72px)] p-4">
          <div className="space-y-6">
            {/* Main Menu */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 uppercase">Main Menu</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveSection('admissions')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'admissions' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>IPD Patients</span>
                  <Badge className="ml-auto bg-orange-500">80</Badge>
                </button>
                <button
                  onClick={() => setActiveSection('wards')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'wards' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Ward Management</span>
                </button>
                <button
                  onClick={() => setActiveSection('discharges')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'discharges' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Discharge Management</span>
                </button>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Reports & Analytics */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 uppercase">Reports</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>IPD Reports</span>
                </button>
                <button
                  onClick={() => setActiveSection('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
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
        onOpenChange={setIsAdmissionDialogOpen}
      />

      {/* Vitals Dialog */}
      <VitalsDialog 
        open={isVitalsDialogOpen}
        onOpenChange={setIsVitalsDialogOpen}
      />

      {/* Treatment Order Dialog */}
      <TreatmentOrderDialog 
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
      />

      {/* Discharge Dialog */}
      <DischargeDialog 
        open={isDischargeDialogOpen}
        onOpenChange={setIsDischargeDialogOpen}
        patient={selectedPatient}
      />
    </div>
  );
}

// ============= SUB-COMPONENTS =============

function AdmissionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New IPD Admission</DialogTitle>
          <DialogDescription>Fill in patient details for admission</DialogDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>UHID / Search Patient</Label>
                  <Input placeholder="Enter UHID or search patient" />
                </div>
                <div className="space-y-2">
                  <Label>Patient Name *</Label>
                  <Input placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input type="number" placeholder="Age" />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact Number *</Label>
                  <Input placeholder="+1-XXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input placeholder="+1-XXX-XXXX" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Textarea placeholder="Complete address" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admission" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admission Type *</Label>
                  <Select>
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consulting Doctor *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr1">Dr. Michael Stevens</SelectItem>
                      <SelectItem value="dr2">Dr. Sarah Mitchell</SelectItem>
                      <SelectItem value="dr3">Dr. David Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Admitted By</Label>
                  <Input placeholder="Doctor name" />
                </div>
                <div className="space-y-2">
                  <Label>Ward *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockWards.map(ward => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name} ({ward.availableBeds} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bed Number *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bed1">Bed 01</SelectItem>
                      <SelectItem value="bed2">Bed 02</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Diagnosis *</Label>
                  <Textarea placeholder="Primary diagnosis" />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Duration (days)</Label>
                  <Input type="number" placeholder="7" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <Label>Has Insurance Coverage?</Label>
                <Switch />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Insurance Provider</Label>
                  <Input placeholder="Provider name" />
                </div>
                <div className="space-y-2">
                  <Label>Policy Number</Label>
                  <Input placeholder="Policy number" />
                </div>
                <div className="space-y-2">
                  <Label>Coverage Amount</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>TPA Approval Number</Label>
                  <Input placeholder="Approval number" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Advance Payment</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            toast.success('Patient admitted successfully!');
            onOpenChange(false);
          }}>
            Admit Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VitalsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Record Vital Signs</DialogTitle>
          <DialogDescription>Enter patient's vital parameters</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Temperature (°C)</Label>
            <Input type="number" step="0.1" placeholder="37.0" />
          </div>
          <div className="space-y-2">
            <Label>Blood Pressure (Systolic/Diastolic)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="120" />
              <Input type="number" placeholder="80" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Heart Rate (bpm)</Label>
            <Input type="number" placeholder="72" />
          </div>
          <div className="space-y-2">
            <Label>Respiratory Rate (/min)</Label>
            <Input type="number" placeholder="16" />
          </div>
          <div className="space-y-2">
            <Label>Oxygen Saturation (%)</Label>
            <Input type="number" placeholder="98" />
          </div>
          <div className="space-y-2">
            <Label>Blood Sugar (mg/dL)</Label>
            <Input type="number" placeholder="110" />
          </div>
          <div className="space-y-2">
            <Label>Pain Score (0-10)</Label>
            <Input type="number" min="0" max="10" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Consciousness Level</Label>
            <Select>
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
            <Textarea placeholder="Any observations or notes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            toast.success('Vital signs recorded successfully!');
            onOpenChange(false);
          }}>
            Save Vitals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TreatmentOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Treatment Order</DialogTitle>
          <DialogDescription>Create a new order for patient treatment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order Type *</Label>
              <Select>
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
              <Select>
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
            <Textarea placeholder="Enter detailed order instructions..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Input placeholder="e.g., Once daily, Twice daily" />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input placeholder="e.g., 7 days, 2 weeks" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea placeholder="Any special instructions..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            toast.success('Treatment order created successfully!');
            onOpenChange(false);
          }}>
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DischargeDialog({ open, onOpenChange, patient }: { open: boolean; onOpenChange: (open: boolean) => void; patient: IPDPatient | null }) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Discharge Patient - {patient.patientName}</DialogTitle>
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
                  <Textarea placeholder="Enter final diagnosis" defaultValue={patient.diagnosis} />
                </div>
                <div className="space-y-2">
                  <Label>Treatment Given *</Label>
                  <Textarea placeholder="Summary of treatment provided" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Procedures Performed</Label>
                  <Textarea placeholder="List all procedures performed" />
                </div>
                <div className="space-y-2">
                  <Label>Condition at Discharge *</Label>
                  <Select>
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
                  <Textarea placeholder="Post-discharge care instructions" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Doctor</Label>
                    <Input placeholder="Doctor name" defaultValue={patient.consultingDoctor} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3>Discharge Medications</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label>Medication Name</Label>
                      <Input placeholder="Medicine name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input placeholder="e.g., 500mg" />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Input placeholder="e.g., Twice daily" />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input placeholder="e.g., 7 days" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dietary Advice</Label>
                  <Textarea placeholder="Special dietary instructions" />
                </div>
                <div className="space-y-2">
                  <Label>Activity Restrictions</Label>
                  <Textarea placeholder="Physical activity limitations" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="space-y-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Outstanding Amount: ${patient.dueAmount.toLocaleString()}
                  </AlertDescription>
                </Alert>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Charges</span>
                        <span>${patient.totalCharges.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Paid Amount</span>
                        <span>${patient.paidAmount.toLocaleString()}</span>
                      </div>
                      {patient.insurance && (
                        <div className="flex justify-between text-blue-600">
                          <span>Insurance Coverage</span>
                          <span>${(patient.totalCharges * 0.7).toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg text-red-600">
                        <span>Due Amount</span>
                        <span>${patient.dueAmount.toLocaleString()}</span>
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
                        <Input type="number" placeholder="0" defaultValue={patient.dueAmount} />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Mode</Label>
                        <Select>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Summary
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
            toast.success('Patient discharged successfully!');
            onOpenChange(false);
          }}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Discharge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
