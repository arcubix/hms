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
import IndoorDutyRoster from './IndoorDutyRoster';
import IpdReportsListing from '../IpdReportsListing';
import IpdAnalytics from '../IpdAnalytics';
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
  CheckCircle2,
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
  PersonStanding,
  IndianRupee,
  Baby,
  FileDown,
  Clipboard
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner@2.0.3';
import BirthCertificates from './BirthCertificates';
import DeathCertificates from './DeathCertificates';

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
  uhid: string;
  ipdNumber: string;
  age: number;
  gender: string;
  contact: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate: string;
  dischargeTime: string;
  lengthOfStay: number;
  consultingDoctor: string;
  admittingDiagnosis: string;
  finalDiagnosis: string;
  treatmentGiven: string;
  proceduresPerformed: string[];
  dischargeStatus: 'Improved' | 'Stable' | 'Critical' | 'Expired' | 'LAMA' | 'Referred';
  dischargeType: 'Normal' | 'LAMA' | 'Absconded' | 'Death' | 'Referred';
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
  dischargedBy: string;
  membershipType?: string;
  totalBill: number;
  pendingAmount: number;
  billCleared: boolean;
}

interface PrivateRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: 'Deluxe' | 'Super Deluxe' | 'Suite' | 'VIP Suite';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientId?: string;
  patientName?: string;
  patientContact?: string;
  admissionDate?: string;
  consultingDoctor?: string;
  dailyRate: number;
  facilities: string[];
  bedCount: number;
  hasAttendantBed: boolean;
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

const mockBeds: BedDetails[] = [
  // General Ward A - Beds
  { id: 'B001', bedNumber: 'GWA-101', wardId: 'W001', wardName: 'General Ward A', type: 'General', status: 'occupied', patientId: 'IPD010', patientName: 'John Smith', admissionDate: '2024-11-20', dailyRate: 2000, facilities: ['AC', 'TV'] },
  { id: 'B002', bedNumber: 'GWA-102', wardId: 'W001', wardName: 'General Ward A', type: 'General', status: 'occupied', patientId: 'IPD011', patientName: 'Emma Wilson', admissionDate: '2024-11-22', dailyRate: 2000, facilities: ['AC', 'TV'] },
  { id: 'B003', bedNumber: 'GWA-103', wardId: 'W001', wardName: 'General Ward A', type: 'General', status: 'available', dailyRate: 2000, facilities: ['AC', 'TV'] },
  { id: 'B004', bedNumber: 'GWA-104', wardId: 'W001', wardName: 'General Ward A', type: 'General', status: 'occupied', patientId: 'IPD012', patientName: 'James Brown', admissionDate: '2024-11-21', dailyRate: 2000, facilities: ['AC', 'TV'] },
  { id: 'B005', bedNumber: 'GWA-105', wardId: 'W001', wardName: 'General Ward A', type: 'General', status: 'available', dailyRate: 2000, facilities: ['AC', 'TV'] },
  { id: 'B006', bedNumber: 'GWA-106', wardId: 'W001', wardName: 'General Ward A', type: 'General', status: 'occupied', patientId: 'IPD013', patientName: 'Sophia Davis', admissionDate: '2024-11-19', dailyRate: 2000, facilities: ['AC', 'TV'] },
  // ICU - Beds
  { id: 'B009', bedNumber: 'ICU-01', wardId: 'W002', wardName: 'ICU - Intensive Care Unit', type: 'ICU', status: 'occupied', patientId: 'IPD001', patientName: 'Robert Johnson', admissionDate: '2024-11-08', dailyRate: 15000, facilities: ['Ventilator', 'Monitor'] },
  { id: 'B010', bedNumber: 'ICU-02', wardId: 'W002', wardName: 'ICU - Intensive Care Unit', type: 'ICU', status: 'occupied', patientId: 'IPD015', patientName: 'Linda Martinez', admissionDate: '2024-11-24', dailyRate: 15000, facilities: ['Ventilator', 'Monitor'] },
  { id: 'B011', bedNumber: 'ICU-03', wardId: 'W002', wardName: 'ICU - Intensive Care Unit', type: 'ICU', status: 'occupied', patientId: 'IPD016', patientName: 'David Anderson', admissionDate: '2024-11-22', dailyRate: 15000, facilities: ['Ventilator', 'Monitor'] },
  { id: 'B012', bedNumber: 'ICU-04', wardId: 'W002', wardName: 'ICU - Intensive Care Unit', type: 'ICU', status: 'available', dailyRate: 15000, facilities: ['Ventilator', 'Monitor'] },
  { id: 'B013', bedNumber: 'ICU-05', wardId: 'W002', wardName: 'ICU - Intensive Care Unit', type: 'ICU', status: 'maintenance', dailyRate: 15000, facilities: ['Ventilator', 'Monitor'] },
  // Private Ward - Beds
  { id: 'B015', bedNumber: 'PVT-101', wardId: 'W003', wardName: 'Private Ward', type: 'Private', status: 'occupied', patientId: 'IPD002', patientName: 'Maria Garcia', admissionDate: '2024-11-09', dailyRate: 5000, facilities: ['AC', 'TV', 'WiFi'] },
  { id: 'B016', bedNumber: 'PVT-102', wardId: 'W003', wardName: 'Private Ward', type: 'Private', status: 'available', dailyRate: 5000, facilities: ['AC', 'TV', 'WiFi'] },
  { id: 'B017', bedNumber: 'PVT-103', wardId: 'W003', wardName: 'Private Ward', type: 'Private', status: 'occupied', patientId: 'IPD018', patientName: 'Richard Lee', admissionDate: '2024-11-23', dailyRate: 5000, facilities: ['AC', 'TV', 'WiFi'] },
  { id: 'B018', bedNumber: 'PVT-104', wardId: 'W003', wardName: 'Private Ward', type: 'Private', status: 'reserved', dailyRate: 5000, facilities: ['AC', 'TV', 'WiFi'] },
  // CCU - Beds
  { id: 'B021', bedNumber: 'CCU-01', wardId: 'W004', wardName: 'Cardiac Care Unit (CCU)', type: 'ICU', status: 'occupied', patientId: 'IPD003', patientName: 'Thomas Miller', admissionDate: '2024-11-10', dailyRate: 12000, facilities: ['Cardiac Monitor'] },
  { id: 'B022', bedNumber: 'CCU-02', wardId: 'W004', wardName: 'Cardiac Care Unit (CCU)', type: 'ICU', status: 'occupied', patientId: 'IPD020', patientName: 'Nancy White', admissionDate: '2024-11-24', dailyRate: 12000, facilities: ['Cardiac Monitor'] },
  { id: 'B023', bedNumber: 'CCU-03', wardId: 'W004', wardName: 'Cardiac Care Unit (CCU)', type: 'ICU', status: 'available', dailyRate: 12000, facilities: ['Cardiac Monitor'] },
  // NICU - Beds
  { id: 'B025', bedNumber: 'NICU-01', wardId: 'W005', wardName: 'NICU - Neonatal ICU', type: 'ICU', status: 'occupied', patientId: 'IPD022', patientName: 'Baby of Sarah Johnson', admissionDate: '2024-11-25', dailyRate: 10000, facilities: ['Incubator'] },
  { id: 'B026', bedNumber: 'NICU-02', wardId: 'W005', wardName: 'NICU - Neonatal ICU', type: 'ICU', status: 'occupied', patientId: 'IPD023', patientName: 'Baby of Maria Rodriguez', admissionDate: '2024-11-24', dailyRate: 10000, facilities: ['Incubator'] },
  { id: 'B027', bedNumber: 'NICU-03', wardId: 'W005', wardName: 'NICU - Neonatal ICU', type: 'ICU', status: 'available', dailyRate: 10000, facilities: ['Incubator'] },
  // Isolation Ward - Beds
  { id: 'B028', bedNumber: 'ISO-01', wardId: 'W006', wardName: 'Isolation Ward', type: 'Isolation', status: 'occupied', patientId: 'IPD024', patientName: 'Kevin Martinez', admissionDate: '2024-11-23', dailyRate: 8000, facilities: ['Negative Pressure'] },
  { id: 'B029', bedNumber: 'ISO-02', wardId: 'W006', wardName: 'Isolation Ward', type: 'Isolation', status: 'available', dailyRate: 8000, facilities: ['Negative Pressure'] },
  { id: 'B030', bedNumber: 'ISO-03', wardId: 'W006', wardName: 'Isolation Ward', type: 'Isolation', status: 'available', dailyRate: 8000, facilities: ['Negative Pressure'] },
];

const mockPrivateRooms: PrivateRoom[] = [
  {
    id: 'PR001',
    roomNumber: 'DLX-401',
    floor: 4,
    roomType: 'Deluxe',
    status: 'occupied',
    patientId: 'IPD002',
    patientName: 'Maria Garcia',
    patientContact: '+1-555-2003',
    admissionDate: '2024-11-09',
    consultingDoctor: 'Dr. David Wilson',
    dailyRate: 5000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR002',
    roomNumber: 'DLX-402',
    floor: 4,
    roomType: 'Deluxe',
    status: 'available',
    dailyRate: 5000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR003',
    roomNumber: 'DLX-403',
    floor: 4,
    roomType: 'Deluxe',
    status: 'occupied',
    patientId: 'IPD018',
    patientName: 'Richard Lee',
    patientContact: '+1-555-2011',
    admissionDate: '2024-11-23',
    consultingDoctor: 'Dr. Sarah Mitchell',
    dailyRate: 5000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR004',
    roomNumber: 'DLX-404',
    floor: 4,
    roomType: 'Deluxe',
    status: 'maintenance',
    dailyRate: 5000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR005',
    roomNumber: 'SDLX-501',
    floor: 5,
    roomType: 'Super Deluxe',
    status: 'occupied',
    patientId: 'IPD025',
    patientName: 'Patricia Johnson',
    patientContact: '+1-555-2015',
    admissionDate: '2024-11-20',
    consultingDoctor: 'Dr. Michael Stevens',
    dailyRate: 7500,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR006',
    roomNumber: 'SDLX-502',
    floor: 5,
    roomType: 'Super Deluxe',
    status: 'available',
    dailyRate: 7500,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR007',
    roomNumber: 'SDLX-503',
    floor: 5,
    roomType: 'Super Deluxe',
    status: 'reserved',
    dailyRate: 7500,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table'],
    bedCount: 1,
    hasAttendantBed: true
  },
  {
    id: 'PR008',
    roomNumber: 'STE-601',
    floor: 6,
    roomType: 'Suite',
    status: 'occupied',
    patientId: 'IPD026',
    patientName: 'William Anderson',
    patientContact: '+1-555-2018',
    admissionDate: '2024-11-18',
    consultingDoctor: 'Dr. Jennifer Adams',
    dailyRate: 12000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table', 'Pantry', 'Work Desk'],
    bedCount: 2,
    hasAttendantBed: true
  },
  {
    id: 'PR009',
    roomNumber: 'STE-602',
    floor: 6,
    roomType: 'Suite',
    status: 'available',
    dailyRate: 12000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table', 'Pantry', 'Work Desk'],
    bedCount: 2,
    hasAttendantBed: true
  },
  {
    id: 'PR010',
    roomNumber: 'VIP-701',
    floor: 7,
    roomType: 'VIP Suite',
    status: 'occupied',
    patientId: 'IPD027',
    patientName: 'Elizabeth Taylor',
    patientContact: '+1-555-2020',
    admissionDate: '2024-11-15',
    consultingDoctor: 'Dr. Robert Anderson',
    dailyRate: 20000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table', 'Pantry', 'Work Desk', 'Meeting Room', 'Butler Service'],
    bedCount: 2,
    hasAttendantBed: true
  },
  {
    id: 'PR011',
    roomNumber: 'VIP-702',
    floor: 7,
    roomType: 'VIP Suite',
    status: 'available',
    dailyRate: 20000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 'Sofa', 'Dining Table', 'Pantry', 'Work Desk', 'Meeting Room', 'Butler Service'],
    bedCount: 2,
    hasAttendantBed: true
  },
  {
    id: 'PR012',
    roomNumber: 'DLX-405',
    floor: 4,
    roomType: 'Deluxe',
    status: 'available',
    dailyRate: 5000,
    facilities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator'],
    bedCount: 1,
    hasAttendantBed: true
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

const mockDischargeRecords: DischargeSummary[] = [
  {
    id: 'DS001',
    patientId: 'IPD012',
    patientName: 'Dr Rajesh YADAV',
    uhid: 'UHID-219992',
    ipdNumber: 'IPD-2024-001245',
    age: 45,
    gender: 'male',
    contact: '+91-98765-43210',
    admissionDate: '2024-11-15',
    admissionTime: '09:30',
    dischargeDate: '2024-11-22',
    dischargeTime: '14:45',
    lengthOfStay: 7,
    consultingDoctor: 'Dr. Amar',
    admittingDiagnosis: 'Acute Coronary Syndrome',
    finalDiagnosis: 'NSTEMI - Treated with PCI',
    treatmentGiven: 'Percutaneous Coronary Intervention, Medical Management',
    proceduresPerformed: ['Coronary Angiography', 'PCI with Stenting'],
    dischargeStatus: 'Improved',
    dischargeType: 'Normal',
    dischargeAdvice: 'Regular follow-up, medication compliance, lifestyle modifications',
    medications: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once Daily', duration: 'Lifelong' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once Daily', duration: '6 months' },
      { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice Daily', duration: '3 months' }
    ],
    followUpDate: '2024-12-06',
    followUpDoctor: 'Dr. Amar',
    dietaryAdvice: 'Low salt, low fat diet',
    activityRestrictions: 'Avoid heavy lifting for 2 weeks',
    dischargingDoctor: 'Dr. Amar',
    dischargedBy: 'Admin Asyn Medical Complex',
    membershipType: undefined,
    totalBill: 285000,
    pendingAmount: 0,
    billCleared: true
  },
  {
    id: 'DS002',
    patientId: 'IPD008',
    patientName: 'Sarah Williams',
    uhid: 'UHID-445667',
    ipdNumber: 'IPD-2024-001239',
    age: 32,
    gender: 'female',
    contact: '+1-555-7788',
    admissionDate: '2024-11-18',
    admissionTime: '16:20',
    dischargeDate: '2024-11-21',
    dischargeTime: '11:30',
    lengthOfStay: 3,
    consultingDoctor: 'Dr. Jennifer Adams',
    admittingDiagnosis: 'Normal Vaginal Delivery',
    finalDiagnosis: 'Post Partum - Mother and Baby Healthy',
    treatmentGiven: 'Normal delivery care, postpartum monitoring',
    proceduresPerformed: ['Normal Vaginal Delivery'],
    dischargeStatus: 'Stable',
    dischargeType: 'Normal',
    dischargeAdvice: 'Breastfeeding guidance, follow-up for baby immunization',
    medications: [
      { name: 'Iron Supplements', dosage: '200mg', frequency: 'Once Daily', duration: '3 months' },
      { name: 'Calcium', dosage: '500mg', frequency: 'Twice Daily', duration: '2 months' }
    ],
    followUpDate: '2024-12-05',
    followUpDoctor: 'Dr. Jennifer Adams',
    dietaryAdvice: 'High protein, iron-rich diet',
    dischargingDoctor: 'Dr. Jennifer Adams',
    dischargedBy: 'Nurse Lisa Thompson',
    membershipType: 'Premium',
    totalBill: 85000,
    pendingAmount: 0,
    billCleared: true
  },
  {
    id: 'DS003',
    patientId: 'IPD005',
    patientName: 'Michael Brown',
    uhid: 'UHID-334455',
    ipdNumber: 'IPD-2024-001236',
    age: 67,
    gender: 'male',
    contact: '+1-555-4455',
    admissionDate: '2024-11-10',
    admissionTime: '22:15',
    dischargeDate: '2024-11-25',
    dischargeTime: '10:00',
    lengthOfStay: 15,
    consultingDoctor: 'Dr. Robert Anderson',
    admittingDiagnosis: 'Pneumonia with Respiratory Distress',
    finalDiagnosis: 'Severe Community Acquired Pneumonia',
    treatmentGiven: 'IV Antibiotics, Oxygen Support, ICU Care',
    proceduresPerformed: ['Chest X-Ray', 'CT Scan Chest', 'Blood Culture'],
    dischargeStatus: 'Improved',
    dischargeType: 'Normal',
    dischargeAdvice: 'Complete antibiotic course, pulmonary rehabilitation',
    medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Thrice Daily', duration: '7 days' },
      { name: 'Bronchodilator', dosage: '2 puffs', frequency: 'As needed', duration: '1 month' }
    ],
    followUpDate: '2024-12-10',
    followUpDoctor: 'Dr. Robert Anderson',
    dietaryAdvice: 'High calorie, high protein diet',
    activityRestrictions: 'Gradual increase in activity',
    dischargingDoctor: 'Dr. Robert Anderson',
    dischargedBy: 'Dr. Robert Anderson',
    membershipType: 'Senior Citizen',
    totalBill: 425000,
    pendingAmount: 25000,
    billCleared: false
  },
  {
    id: 'DS004',
    patientId: 'IPD019',
    patientName: 'Emma Davis',
    uhid: 'UHID-556677',
    ipdNumber: 'IPD-2024-001250',
    age: 28,
    gender: 'female',
    contact: '+1-555-8899',
    admissionDate: '2024-11-20',
    admissionTime: '14:00',
    dischargeDate: '2024-11-23',
    dischargeTime: '16:30',
    lengthOfStay: 3,
    consultingDoctor: 'Dr. David Wilson',
    admittingDiagnosis: 'Appendicitis',
    finalDiagnosis: 'Acute Appendicitis - Post Appendectomy',
    treatmentGiven: 'Laparoscopic Appendectomy',
    proceduresPerformed: ['Laparoscopic Appendectomy', 'Ultrasound Abdomen'],
    dischargeStatus: 'Improved',
    dischargeType: 'Normal',
    dischargeAdvice: 'Wound care, avoid heavy activities',
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '5 days' },
      { name: 'Antibiotic', dosage: '500mg', frequency: 'Twice Daily', duration: '5 days' }
    ],
    followUpDate: '2024-11-30',
    followUpDoctor: 'Dr. David Wilson',
    dietaryAdvice: 'Light diet, increase fiber gradually',
    activityRestrictions: 'No heavy lifting for 2 weeks',
    dischargingDoctor: 'Dr. David Wilson',
    dischargedBy: 'Admin John Smith',
    membershipType: undefined,
    totalBill: 95000,
    pendingAmount: 0,
    billCleared: true
  },
  {
    id: 'DS005',
    patientId: 'IPD014',
    patientName: 'James Wilson',
    uhid: 'UHID-667788',
    ipdNumber: 'IPD-2024-001246',
    age: 55,
    gender: 'male',
    contact: '+1-555-9900',
    admissionDate: '2024-11-12',
    admissionTime: '08:45',
    dischargeDate: '2024-11-24',
    dischargeTime: '12:00',
    lengthOfStay: 12,
    consultingDoctor: 'Dr. Michael Stevens',
    admittingDiagnosis: 'Diabetic Ketoacidosis',
    finalDiagnosis: 'DKA - Controlled, Type 2 Diabetes Mellitus',
    treatmentGiven: 'Insulin Therapy, Fluid Replacement, Electrolyte Correction',
    proceduresPerformed: ['Blood Sugar Monitoring', 'Electrolyte Panel'],
    dischargeStatus: 'Stable',
    dischargeType: 'Normal',
    dischargeAdvice: 'Diabetes management, regular monitoring',
    medications: [
      { name: 'Insulin', dosage: 'As per sliding scale', frequency: 'Before meals', duration: 'Ongoing' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', duration: 'Ongoing' }
    ],
    followUpDate: '2024-12-01',
    followUpDoctor: 'Dr. Michael Stevens',
    dietaryAdvice: 'Diabetic diet, carbohydrate counting',
    dischargingDoctor: 'Dr. Michael Stevens',
    dischargedBy: 'Nurse Maria Garcia',
    membershipType: 'Gold',
    totalBill: 185000,
    pendingAmount: 0,
    billCleared: true
  },
  {
    id: 'DS006',
    patientName: 'Patricia Moore',
    uhid: 'UHID-778899',
    ipdNumber: 'IPD-2024-001251',
    patientId: 'IPD021',
    age: 72,
    gender: 'female',
    contact: '+1-555-1122',
    admissionDate: '2024-11-14',
    admissionTime: '19:30',
    dischargeDate: '2024-11-17',
    dischargeTime: '09:00',
    lengthOfStay: 3,
    consultingDoctor: 'Dr. Sarah Mitchell',
    admittingDiagnosis: 'Hip Fracture',
    finalDiagnosis: 'Left Hip Fracture - Post ORIF',
    treatmentGiven: 'Open Reduction Internal Fixation',
    proceduresPerformed: ['ORIF Left Hip', 'X-Ray Hip'],
    dischargeStatus: 'Stable',
    dischargeType: 'Normal',
    dischargeAdvice: 'Physiotherapy, gradual mobilization',
    medications: [
      { name: 'Pain Relief', dosage: '500mg', frequency: 'Thrice Daily', duration: '2 weeks' },
      { name: 'Calcium', dosage: '500mg', frequency: 'Once Daily', duration: '3 months' }
    ],
    followUpDate: '2024-12-01',
    followUpDoctor: 'Dr. Sarah Mitchell',
    activityRestrictions: 'Weight bearing as tolerated, use walker',
    dischargingDoctor: 'Dr. Sarah Mitchell',
    dischargedBy: 'Admin Support Team',
    membershipType: 'Senior Citizen',
    totalBill: 225000,
    pendingAmount: 45000,
    billCleared: false
  },
  {
    id: 'DS007',
    patientName: 'Kevin Taylor',
    uhid: 'UHID-889900',
    ipdNumber: 'IPD-2024-001252',
    patientId: 'IPD024',
    age: 38,
    gender: 'male',
    contact: '+1-555-2233',
    admissionDate: '2024-11-19',
    admissionTime: '11:00',
    dischargeDate: '2024-11-26',
    dischargeTime: '15:00',
    lengthOfStay: 7,
    consultingDoctor: 'Dr. Emily Brown',
    admittingDiagnosis: 'Severe COVID-19 Pneumonia',
    finalDiagnosis: 'COVID-19 Pneumonia - Recovered',
    treatmentGiven: 'Oxygen Support, Antiviral Therapy, Steroids',
    proceduresPerformed: ['RT-PCR Test', 'Chest CT', 'Blood Tests'],
    dischargeStatus: 'Improved',
    dischargeType: 'Normal',
    dischargeAdvice: 'Home isolation for 7 days, monitoring for symptoms',
    medications: [
      { name: 'Vitamin C', dosage: '500mg', frequency: 'Once Daily', duration: '1 month' },
      { name: 'Vitamin D', dosage: '1000IU', frequency: 'Once Daily', duration: '2 months' }
    ],
    followUpDate: '2024-12-10',
    followUpDoctor: 'Dr. Emily Brown',
    dietaryAdvice: 'High protein, immunity boosting diet',
    dischargingDoctor: 'Dr. Emily Brown',
    dischargedBy: 'Dr. Emily Brown',
    membershipType: undefined,
    totalBill: 315000,
    pendingAmount: 0,
    billCleared: true
  },
  {
    id: 'DS008',
    patientName: 'Linda Martinez',
    uhid: 'UHID-990011',
    ipdNumber: 'IPD-2024-001253',
    patientId: 'IPD015',
    age: 41,
    gender: 'female',
    contact: '+1-555-3344',
    admissionDate: '2024-11-16',
    admissionTime: '23:45',
    dischargeDate: '2024-11-19',
    dischargeTime: '11:15',
    lengthOfStay: 3,
    consultingDoctor: 'Dr. Jennifer Adams',
    admittingDiagnosis: 'Acute Gastroenteritis',
    finalDiagnosis: 'Viral Gastroenteritis - Resolved',
    treatmentGiven: 'IV Fluids, Anti-emetics, Symptomatic Treatment',
    proceduresPerformed: ['Stool Analysis', 'Blood Tests'],
    dischargeStatus: 'Improved',
    dischargeType: 'Normal',
    dischargeAdvice: 'Maintain hydration, bland diet',
    medications: [
      { name: 'Oral Rehydration Solution', dosage: 'As needed', frequency: 'Frequent sips', duration: '5 days' },
      { name: 'Probiotics', dosage: '1 sachet', frequency: 'Twice Daily', duration: '1 week' }
    ],
    followUpDate: '2024-11-26',
    followUpDoctor: 'Dr. Jennifer Adams',
    dietaryAdvice: 'BRAT diet initially, then gradual normal diet',
    dischargingDoctor: 'Dr. Jennifer Adams',
    dischargedBy: 'Nurse Robert Johnson',
    membershipType: 'Standard',
    totalBill: 45000,
    pendingAmount: 0,
    billCleared: true
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
  const [isAddWardDialogOpen, setIsAddWardDialogOpen] = useState(false);
  
  // Bed Management States
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [bedSearchQuery, setBedSearchQuery] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [isAllocateBedDialogOpen, setIsAllocateBedDialogOpen] = useState(false);
  const [isCreateBedDialogOpen, setIsCreateBedDialogOpen] = useState(false);
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState<BedDetails | null>(null);
  
  // Private Room Management States
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);
  
  // Settings Dialog State
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  // Disposition States
  const [activeDispositionTab, setActiveDispositionTab] = useState('pending');
  const [dispositionType, setDispositionType] = useState('all');
  const [dispositionSearchQuery, setDispositionSearchQuery] = useState('');
  
  // Patient Profile Navigation States
  const [activePatientTab, setActivePatientTab] = useState('daily-patient-care-order');
  const [activePatientSubTab, setActivePatientSubTab] = useState('details');

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
        {/* Modern Dashboard Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">IPD Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time overview of in-patient department</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-[#2F80ED] hover:bg-blue-600" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
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
              <h3 className="text-4xl font-bold mb-1">80</h3>
              <p className="text-sm text-blue-100">Current IPD Patients</p>
              <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                +12.5% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-green-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bed className="w-7 h-7" />
                </div>
                <Badge className="bg-white/20 text-white backdrop-blur-sm">84.2%</Badge>
              </div>
              <h3 className="text-4xl font-bold mb-1">80/95</h3>
              <p className="text-sm text-green-100">Bed Occupancy</p>
              <p className="text-xs text-green-200 mt-2">15 beds available</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-600 to-orange-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <Badge className="bg-red-500/80 text-white backdrop-blur-sm animate-pulse">Critical</Badge>
              </div>
              <h3 className="text-4xl font-bold mb-1">12</h3>
              <p className="text-sm text-orange-100">Critical Patients</p>
              <p className="text-xs text-orange-200 mt-2">Requires monitoring</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <DollarSign className="w-7 h-7" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-200" />
              </div>
              <h3 className="text-4xl font-bold mb-1">$245K</h3>
              <p className="text-sm text-purple-100">IPD Revenue (Today)</p>
              <p className="text-xs text-purple-200 mt-2 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                +8.2% from yesterday
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

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('bed-management')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bed className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Bed Management</h3>
                  <p className="text-sm text-gray-600">View all bed allocations</p>
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
                {mockIPDPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="text-blue-600">{patient.ipdNumber}</p>
                        <p className="text-xs text-gray-500">MRN: MRN-{patient.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">UHID: {patient.uhid}</p>
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
                {selectedPatient.ipdNumber} • MRN: MRN-{selectedPatient.id.slice(0, 8)} • {selectedPatient.uhid}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-[#2F80ED] hover:bg-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Daily Visit
            </Button>
            <Button variant="outline">
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
            {activePatientTab === 'daily-patient-care-order' && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Patient Care Order</CardTitle>
                  <CardDescription>Manage daily care orders for the patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ClipboardList className="w-16 h-16 mb-4" />
                    <p>No daily care orders recorded yet</p>
                    <Button className="mt-4 bg-[#2F80ED] hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Care Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activePatientTab === 'ip-vitals' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>IP Vitals</CardTitle>
                      <CardDescription>In-patient vital signs monitoring</CardDescription>
                    </div>
                    <Button onClick={() => setIsVitalsDialogOpen(true)} className="bg-[#2F80ED] hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Record Vitals
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-red-600" />
                          <p className="text-xs text-gray-600">Blood Pressure</p>
                        </div>
                        <p className="text-xl">120/80</p>
                        <p className="text-xs text-gray-500">mmHg</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-gray-600">Heart Rate</p>
                        </div>
                        <p className="text-xl">72</p>
                        <p className="text-xs text-gray-500">bpm</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-4 h-4 text-orange-600" />
                          <p className="text-xs text-gray-600">Temperature</p>
                        </div>
                        <p className="text-xl">98.6</p>
                        <p className="text-xs text-gray-500">°F</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-4 h-4 text-purple-600" />
                          <p className="text-xs text-gray-600">Resp. Rate</p>
                        </div>
                        <p className="text-xl">16</p>
                        <p className="text-xs text-gray-500">per min</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {activePatientTab === 'admission-form' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admission Form</CardTitle>
                  <CardDescription>Patient admission details and information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Patient Name</Label>
                        <p>{selectedPatient.patientName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Age / Gender</Label>
                        <p>{selectedPatient.age} Years / {selectedPatient.gender}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Contact Number</Label>
                        <p>{selectedPatient.contactNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Emergency Contact</Label>
                        <p>{selectedPatient.emergencyContact}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Admission Date</Label>
                        <p>{selectedPatient.admissionDate}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Ward/Bed</Label>
                        <p>{selectedPatient.wardName} - {selectedPatient.bedNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Doctor</Label>
                        <p>{selectedPatient.consultingDoctor}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Diagnosis</Label>
                        <p>{selectedPatient.diagnosis}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activePatientTab === 'medication' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Medication</CardTitle>
                      <CardDescription>Active medications and prescriptions</CardDescription>
                    </div>
                    <Button className="bg-[#2F80ED] hover:bg-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Pill className="w-16 h-16 mb-4" />
                    <p>No medications prescribed yet</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Default content for other tabs */}
            {!['daily-patient-care-order', 'ip-vitals', 'admission-form', 'medication'].includes(activePatientTab) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {patientTabs.find(tab => tab.id === activePatientTab)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FileText className="w-16 h-16 mb-4" />
                    <p>No records available for this section</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Charts & Analytics</CardTitle>
                <CardDescription>Visual representation of patient data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <BarChart3 className="w-16 h-16 mb-4" />
                  <p>Chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keep old overview tab for reference - hidden */}
          <div style={{ display: 'none' }}>
          <TabsContent value="overview-old" className="space-y-6">
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
          </div>
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
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddWardDialogOpen(true)}
          >
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

  // ============= RENDER BED MANAGEMENT =============
  const renderBedManagement = () => {
    const filteredBeds = mockBeds.filter(bed => {
      const matchesWard = selectedWardFilter === 'all' || bed.wardId === selectedWardFilter;
      const matchesStatus = selectedStatusFilter === 'all' || bed.status === selectedStatusFilter;
      const matchesSearch = 
        bed.bedNumber.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
        bed.wardName.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
        (bed.patientName && bed.patientName.toLowerCase().includes(bedSearchQuery.toLowerCase()));
      
      return matchesWard && matchesStatus && matchesSearch;
    });

    const totalBeds = mockBeds.length;
    const occupiedBeds = mockBeds.filter(b => b.status === 'occupied').length;
    const availableBeds = mockBeds.filter(b => b.status === 'available').length;
    const maintenanceBeds = mockBeds.filter(b => b.status === 'maintenance').length;
    const reservedBeds = mockBeds.filter(b => b.status === 'reserved').length;
    const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl text-gray-900">Bed Management</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">View all beds, allocations, and patient details</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-[#2F80ED] hover:bg-blue-600" 
              size="sm"
              onClick={() => setIsAllocateBedDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Allocate Bed
            </Button>
            <Button 
              className="bg-[#27AE60] hover:bg-green-600" 
              size="sm"
              onClick={() => setIsCreateBedDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Bed
            </Button>
          </div>
        </div>

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
                  {mockWards.map(ward => (
                    <option key={ward.id} value={ward.id}>{ward.name}</option>
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
                    filteredBeds.map((bed) => (
                      <TableRow key={bed.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Bed className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-xs md:text-sm">{bed.bedNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm">{bed.wardName}</span>
                            <span className="text-xs text-gray-500 hidden sm:block">{bed.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              bed.type === 'ICU' ? 'border-red-200 bg-red-50 text-red-700' :
                              bed.type === 'Private' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                              bed.type === 'Deluxe' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                              'border-gray-200 bg-gray-50 text-gray-700'
                            }`}
                          >
                            {bed.type}
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
                          {bed.status === 'occupied' && bed.patientName ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-xs md:text-sm">{bed.patientName}</span>
                              <span className="text-xs text-gray-500">ID: {bed.patientId}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs md:text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {bed.admissionDate ? (
                            <span className="text-sm">{new Date(bed.admissionDate).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="font-medium text-sm">₹{bed.dailyRate.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {bed.facilities.slice(0, 2).map((facility, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {facility}
                              </Badge>
                            ))}
                            {bed.facilities.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{bed.facilities.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            {bed.status === 'occupied' ? (
                              <>
                                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto">
                                  <Eye className="w-3 h-3 md:mr-1" />
                                  <span className="hidden md:inline">View</span>
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto hidden sm:flex">
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
                              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto">
                                <Edit className="w-3 h-3 md:mr-1" />
                                <span className="hidden md:inline">Edit</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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

        {/* Allocate Bed Dialog */}
        <Dialog open={isAllocateBedDialogOpen} onOpenChange={setIsAllocateBedDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Allocate Bed to Patient</DialogTitle>
              <DialogDescription>
                {selectedBedForAllocation 
                  ? `Allocate ${selectedBedForAllocation.bedNumber} in ${selectedBedForAllocation.wardName}`
                  : 'Select a patient to allocate to a bed'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedBedForAllocation && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">Bed Number</Label>
                        <p className="font-medium">{selectedBedForAllocation.bedNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Ward</Label>
                        <p className="font-medium">{selectedBedForAllocation.wardName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Type</Label>
                        <p className="font-medium">{selectedBedForAllocation.type}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Daily Rate</Label>
                        <p className="font-medium">₹{selectedBedForAllocation.dailyRate.toLocaleString()}</p>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Or Select from Recent Admissions</Label>
                <ScrollArea className="h-[300px] border rounded-lg">
                  {mockIPDPatients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        toast.success(`Bed allocated to ${patient.patientName}`);
                        setIsAllocateBedDialogOpen(false);
                        setSelectedBedForAllocation(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{patient.patientName}</p>
                            <Badge variant="outline" className="text-xs">
                              {patient.uhid}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>{patient.age}Y / {patient.gender}</span>
                            <span>{patient.contactNumber}</span>
                            <span>{patient.department}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{patient.diagnosis}</p>
                        </div>
                        <Button size="sm" className="bg-[#27AE60] hover:bg-green-600">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Allocate
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAllocateBedDialogOpen(false);
                setSelectedBedForAllocation(null);
              }}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Bed Dialog */}
        <Dialog open={isCreateBedDialogOpen} onOpenChange={setIsCreateBedDialogOpen}>
          <DialogContent className="max-w-2xl">
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
                  <Input placeholder="e.g., GWA-107" />
                  <p className="text-xs text-gray-500">Unique bed identifier</p>
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
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bed Type *</Label>
                  <Select>
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
                  <Input type="number" placeholder="e.g., 2000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initial Status *</Label>
                <Select defaultValue="available">
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
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">AC</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">TV</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Washroom</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">WiFi</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Nurse Call</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Ventilator</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Monitor</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Oxygen</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Remarks (Optional)</Label>
                <Textarea 
                  placeholder="Additional notes about this bed..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateBedDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#27AE60] hover:bg-green-600"
                onClick={() => {
                  toast.success('Bed created successfully!');
                  setIsCreateBedDialogOpen(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Bed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= RENDER PRIVATE ROOM MANAGEMENT =============
  const renderPrivateRoomManagement = () => {
    const totalRooms = mockPrivateRooms.length;
    const occupiedRooms = mockPrivateRooms.filter(r => r.status === 'occupied').length;
    const availableRooms = mockPrivateRooms.filter(r => r.status === 'available').length;
    const maintenanceRooms = mockPrivateRooms.filter(r => r.status === 'maintenance').length;
    const reservedRooms = mockPrivateRooms.filter(r => r.status === 'reserved').length;
    const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

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

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-gray-900">Private Room Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage private rooms, suites, and VIP accommodations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-[#27AE60] hover:bg-green-600" 
              size="sm"
              onClick={() => setIsCreateRoomDialogOpen(true)}
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
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Super Deluxe">Super Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="VIP Suite">VIP Suite</option>
                </select>
                <select 
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {mockPrivateRooms.map((room) => (
            <Card 
              key={room.id} 
              className={`border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${getRoomStatusColor(room.status)}`}
            >
              <CardContent className="p-5">
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getRoomTypeIcon(room.roomType)}</span>
                      <h3 className="font-semibold text-lg">{room.roomNumber}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{room.roomType}</p>
                    <p className="text-xs text-gray-500">Floor {room.floor}</p>
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
                {room.status === 'occupied' && room.patientName ? (
                  <div className="space-y-3 mb-4">
                    <div>
                      <Label className="text-xs text-gray-500">Patient</Label>
                      <p className="font-medium text-sm">{room.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Contact</Label>
                      <p className="text-sm">{room.patientContact}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Admission</Label>
                        <p className="text-xs">{room.admissionDate ? new Date(room.admissionDate).toLocaleDateString() : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Doctor</Label>
                        <p className="text-xs truncate">{room.consultingDoctor}</p>
                      </div>
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
                    <span className="font-semibold text-blue-600">₹{room.dailyRate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Beds</span>
                    <span className="font-medium">{room.bedCount} + {room.hasAttendantBed ? '1 Attendant' : 'No Attendant'}</span>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-4">
                  <Label className="text-xs text-gray-500 mb-2 block">Facilities</Label>
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.slice(0, 3).map((facility, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {room.facilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.facilities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

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
                    <Button className="w-full bg-[#27AE60] hover:bg-green-600 text-xs" size="sm">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Allocate Room
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Room Dialog */}
        <Dialog open={isCreateRoomDialogOpen} onOpenChange={setIsCreateRoomDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Private Room</DialogTitle>
              <DialogDescription>
                Add a new private room to the hospital's inventory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number *</Label>
                  <Input placeholder="e.g., DLX-406" />
                  <p className="text-xs text-gray-500">Unique room identifier</p>
                </div>
                <div className="space-y-2">
                  <Label>Floor *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4th Floor</SelectItem>
                      <SelectItem value="5">5th Floor</SelectItem>
                      <SelectItem value="6">6th Floor</SelectItem>
                      <SelectItem value="7">7th Floor</SelectItem>
                      <SelectItem value="8">8th Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deluxe">🛏️ Deluxe</SelectItem>
                      <SelectItem value="Super Deluxe">⭐ Super Deluxe</SelectItem>
                      <SelectItem value="Suite">🏆 Suite</SelectItem>
                      <SelectItem value="VIP Suite">👑 VIP Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Daily Rate (₹) *</Label>
                  <Input type="number" placeholder="e.g., 5000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Beds *</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bed</SelectItem>
                      <SelectItem value="2">2 Beds</SelectItem>
                      <SelectItem value="3">3 Beds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Attendant Bed</Label>
                  <div className="flex items-center h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch defaultChecked />
                      <span className="text-sm">Include attendant bed</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initial Status *</Label>
                <Select defaultValue="available">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Facilities</Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">AC</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">TV</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">WiFi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Attached Bathroom</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Refrigerator</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Sofa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Dining Table</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Pantry</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Work Desk</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Meeting Room</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Butler Service</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Remarks (Optional)</Label>
                <Textarea 
                  placeholder="Additional notes about this room..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateRoomDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#27AE60] hover:bg-green-600"
                onClick={() => {
                  toast.success('Private room created successfully!');
                  setIsCreateRoomDialogOpen(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= RENDER DISCHARGE MANAGEMENT =============
  const renderDischargeManagement = () => {
    const totalDischarges = mockDischargeRecords.length;
    const pendingBills = mockDischargeRecords.filter(d => !d.billCleared).length;
    const completedDischarges = mockDischargeRecords.filter(d => d.billCleared).length;
    const totalPendingAmount = mockDischargeRecords.reduce((sum, d) => sum + d.pendingAmount, 0);

    const getDischargeStatusColor = (status: string) => {
      switch (status) {
        case 'Improved':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Stable':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Critical':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'LAMA':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Referred':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl text-gray-900">Discharge Management</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage patient discharge records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-[#2F80ED] hover:bg-blue-600" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Discharges</p>
                  <h3 className="text-2xl">{totalDischarges}</h3>
                  <p className="text-xs text-green-600 mt-1">This Month</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Completed</p>
                  <h3 className="text-2xl">{completedDischarges}</h3>
                  <p className="text-xs text-green-600 mt-1">Bills Cleared</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pending Bills</p>
                  <h3 className="text-2xl">{pendingBills}</h3>
                  <p className="text-xs text-orange-600 mt-1">Awaiting Payment</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pending Amount</p>
                  <h3 className="text-xl">₹{totalPendingAmount.toLocaleString()}</h3>
                  <p className="text-xs text-red-600 mt-1">Outstanding</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by UHID, Patient Name, IPD Number, Doctor..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Status</option>
                  <option value="Improved">Improved</option>
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                  <option value="LAMA">LAMA</option>
                  <option value="Referred">Referred</option>
                </select>
                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Bills</option>
                  <option value="cleared">Cleared</option>
                  <option value="pending">Pending</option>
                </select>
                <input 
                  type="date" 
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discharge Records Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      UHID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Consultant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Membership
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Admission Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Discharge Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Discharge Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Discharged By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockDischargeRecords.map((discharge) => (
                    <tr key={discharge.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{discharge.uhid}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{discharge.consultingDoctor}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{discharge.dischargingDoctor}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {discharge.membershipType ? (
                          <Badge variant="outline" className="text-xs">
                            {discharge.membershipType}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={discharge.finalDiagnosis}>
                          {discharge.finalDiagnosis}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{discharge.patientName}</div>
                        <div className="text-xs text-gray-500">{discharge.age}Y, {discharge.gender === 'male' ? 'M' : 'F'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(discharge.admissionDate).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-xs text-gray-500">{discharge.admissionTime}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(discharge.dischargeDate).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-xs text-gray-500">{discharge.dischargeTime}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className={getDischargeStatusColor(discharge.dischargeStatus)}>
                          {discharge.dischargeStatus}
                        </Badge>
                        {!discharge.billCleared && (
                          <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Bill Pending
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={discharge.dischargedBy}>
                          {discharge.dischargedBy}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toast.success('Viewing discharge summary...')}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toast.success('Downloading discharge summary...')}
                          >
                            <Download className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toast.success('Printing discharge summary...')}
                          >
                            <Printer className="w-4 h-4 text-gray-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Footer */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Quick Actions</p>
                  <p className="text-xs text-gray-600">Generate bulk reports and summaries</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Monthly Report
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Discharge Summary
                </Button>
                <Button className="bg-[#27AE60] hover:bg-green-600" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= RENDER DUTY ROSTER =============
  const renderDutyRoster = () => {
    return <IndoorDutyRoster />;
  };

  // ============= RENDER IPD REPORTS =============
  const renderReports = () => {
    return <IpdReportsListing />;
  };

  // ============= RENDER IPD ANALYTICS =============
  const renderAnalytics = () => {
    return <IpdAnalytics />;
  };

  // ============= RENDER BIRTH CERTIFICATES =============
  const renderBirthCertificates = () => {
    return <BirthCertificates />;
  };

  // ============= RENDER DEATH CERTIFICATES =============
  const renderDeathCertificates = () => {
    return <DeathCertificates />;
  };

  // ============= RENDER DISPOSITIONS =============
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
              <Button className="bg-[#2F80ED] hover:bg-blue-600">
                <FileDown className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline">
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

  // ============= RENDER REHABILITATION =============
  const renderRehabilitation = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Rehabilitation Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Manage physiotherapy and rehabilitation services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-[#2F80ED] hover:bg-blue-600">
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
                  <p className="text-3xl font-bold text-blue-600 mt-1">18</p>
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
                  <p className="text-3xl font-bold text-orange-600 mt-1">5</p>
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
                  <p className="text-3xl font-bold text-green-600 mt-1">12</p>
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
                  <p className="text-3xl font-bold text-purple-600 mt-1">45</p>
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
                {[
                  { patient: 'Ali Ahmed', service: 'Physiotherapy', doctor: 'Dr. Sarah Ahmed', frequency: 'Daily', status: 'Active', nextSession: 'Nov 26, 2025 2:00 PM' },
                  { patient: 'Fatima Hassan', service: 'Occupational Therapy', doctor: 'Dr. Usman Tariq', frequency: 'Twice Weekly', status: 'Pending', nextSession: 'Nov 27, 2025' },
                  { patient: 'Usman Khan', service: 'Speech Therapy', doctor: 'Dr. Maria Ali', frequency: 'Weekly', status: 'Active', nextSession: 'Nov 28, 2025' },
                ].map((request, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{request.patient}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.service}</Badge>
                    </TableCell>
                    <TableCell>{request.doctor}</TableCell>
                    <TableCell className="text-sm text-gray-600">{request.frequency}</TableCell>
                    <TableCell>
                      <Badge className={request.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{request.nextSession}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
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
  };

  // ============= RENDER TRANSFER HISTORY =============
  const renderTransferHistory = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Bed/Room Transfer History</h2>
            <p className="text-sm text-gray-600 mt-1">Track all patient bed and room transfers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Transfers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">6</p>
                </div>
                <RotateCcw className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">28</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ICU Transfers</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">12</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ward Transfers</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">16</p>
                </div>
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>IPD No.</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Authorized By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { patient: 'Ahmed Ali', ipdNo: 'IPD-001', from: 'General Ward A - B12', to: 'ICU - ICU-05', dateTime: 'Nov 26, 2025 10:30 AM', reason: 'Critical Condition', doctor: 'Dr. Sarah Ahmed' },
                  { patient: 'Fatima Khan', ipdNo: 'IPD-002', from: 'ICU - ICU-03', to: 'General Ward B - B08', dateTime: 'Nov 26, 2025 09:15 AM', reason: 'Condition Improved', doctor: 'Dr. Ali Hassan' },
                  { patient: 'Usman Tariq', ipdNo: 'IPD-003', from: 'Private Ward - P05', to: 'Private Ward - P12', dateTime: 'Nov 26, 2025 08:00 AM', reason: 'Patient Request', doctor: 'Dr. Maria Khan' },
                ].map((transfer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{transfer.patient}</TableCell>
                    <TableCell>{transfer.ipdNo}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Badge variant="outline" className="text-xs">{transfer.from}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">{transfer.to}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{transfer.dateTime}</TableCell>
                    <TableCell className="text-sm text-gray-600">{transfer.reason}</TableCell>
                    <TableCell className="text-sm">{transfer.doctor}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
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
  };

  // ============= RENDER ADMISSION REQUESTS =============
  const renderAdmissionRequests = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gray-900">Doctor Admission Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Review and approve patient admission requests from doctors</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
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
                  <p className="text-3xl font-bold text-orange-600 mt-1">5</p>
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
                  <p className="text-3xl font-bold text-green-600 mt-1">12</p>
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
                  <p className="text-3xl font-bold text-red-600 mt-1">1</p>
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
                  <p className="text-3xl font-bold text-red-600 mt-1">2</p>
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
                {[
                  { reqId: 'REQ-001', patient: 'Ahmed Ali', doctor: 'Dr. Sarah Ahmed', department: 'Cardiology', priority: 'Urgent', wardPref: 'ICU', time: '10 mins ago' },
                  { reqId: 'REQ-002', patient: 'Fatima Khan', doctor: 'Dr. Ali Hassan', department: 'Neurology', priority: 'Normal', wardPref: 'General Ward', time: '25 mins ago' },
                  { reqId: 'REQ-003', patient: 'Usman Tariq', doctor: 'Dr. Maria Khan', department: 'Orthopedics', priority: 'Normal', wardPref: 'Private Ward', time: '1 hour ago' },
                  { reqId: 'REQ-004', patient: 'Ayesha Hassan', doctor: 'Dr. Usman Ali', department: 'Oncology', priority: 'Urgent', wardPref: 'Private Ward', time: '2 hours ago' },
                  { reqId: 'REQ-005', patient: 'Ali Raza', doctor: 'Dr. Fatima Shah', department: 'Pediatrics', priority: 'Normal', wardPref: 'Pediatric Ward', time: '3 hours ago' },
                ].map((request, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{request.reqId}</TableCell>
                    <TableCell>{request.patient}</TableCell>
                    <TableCell>{request.doctor}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={request.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{request.wardPref}</TableCell>
                    <TableCell className="text-sm text-gray-600">{request.time}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-[#27AE60] hover:bg-green-700" onClick={() => toast.success('Admission request approved')}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.error('Admission request rejected')}>
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
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
      case 'bed-management':
        return renderBedManagement();
      case 'private-rooms':
        return renderPrivateRoomManagement();
      case 'discharges':
        return renderDischargeManagement();
      case 'ward-beds':
        return selectedWard ? (
          <WardBedView 
            ward={selectedWard} 
            onBack={() => setActiveSection('wards')} 
          />
        ) : renderWardManagement();
      case 'duty-roster':
        return renderDutyRoster();
      case 'reports':
        return renderReports();
      case 'analytics':
        return renderAnalytics();
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
      case 'admission-requests':
        return renderAdmissionRequests();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Hospital className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">IPD Management System</h1>
                <p className="text-sm text-blue-100 mt-0.5 flex items-center gap-2">
                  <span>In-Patient Department</span>
                  <span className="text-blue-300">•</span>
                  <span className="text-blue-200">80 Active Patients</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              >
                <Bell className="w-4 h-4 mr-2" />
                Alerts
                <Badge className="bg-red-500 text-white ml-2 animate-pulse">12</Badge>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsSettingsDialogOpen(true)}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="px-6 py-3 bg-white/10 backdrop-blur-sm border-t border-white/10">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Bed className="w-5 h-5 text-green-200" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Available Beds</p>
                <p className="text-lg font-bold">18/120</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-200" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Critical Patients</p>
                <p className="text-lg font-bold">12</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Today's Admissions</p>
                <p className="text-lg font-bold">8</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-200" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Pending Discharges</p>
                <p className="text-lg font-bold">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Modern Sidebar */}
        <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 min-h-[calc(100vh-168px)] p-4 shadow-2xl border-r border-slate-700">
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    activeSection === 'dashboard' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/50' 
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                  {activeSection === 'dashboard' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
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
                  onClick={() => setActiveSection('bed-management')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'bed-management' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Bed className="w-5 h-5" />
                  <span>Bed Management</span>
                </button>
                <button
                  onClick={() => setActiveSection('private-rooms')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'private-rooms' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Hospital className="w-5 h-5" />
                  <span>Private Room Management</span>
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

            <Separator className="bg-slate-700" />

            {/* Additional Services */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 uppercase">Services</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('duty-roster')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    activeSection === 'duty-roster' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/50' 
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Indoor Duty Roster</span>
                  {activeSection === 'duty-roster' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => setActiveSection('dispositions')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'dispositions' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Dispositions</span>
                </button>
                <button
                  onClick={() => setActiveSection('rehabilitation')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'rehabilitation' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Rehabilitation Request</span>
                </button>
                <button
                  onClick={() => setActiveSection('birth-certificates')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'birth-certificates' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Birth Certificates</span>
                </button>
                <button
                  onClick={() => setActiveSection('death-certificates')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'death-certificates' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Death Certificates</span>
                </button>
                <button
                  onClick={() => setActiveSection('transfer-history')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'transfer-history' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Bed/Room Transfer History</span>
                </button>
                <button
                  onClick={() => setActiveSection('admission-requests')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'admission-requests' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Doctor Admission Requests</span>
                  <Badge className="ml-auto bg-blue-500">5</Badge>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {/* Main Content */}
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 overflow-auto">
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

      {/* Add Ward Dialog */}
      <AddWardDialog 
        open={isAddWardDialogOpen}
        onOpenChange={setIsAddWardDialogOpen}
      />

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              IPD Management Settings
            </DialogTitle>
            <DialogDescription>
              Configure and manage IPD system preferences and quick access modules
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick Access Modules */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Access Modules</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setActiveSection('duty-roster');
                    setIsSettingsDialogOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Indoor Duty Roster</h4>
                      <p className="text-xs text-gray-600">Doctor scheduling & shifts</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('bed-management');
                    setIsSettingsDialogOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                      <Bed className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Bed Management</h4>
                      <p className="text-xs text-gray-600">View & allocate beds</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('wards');
                    setIsSettingsDialogOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Ward Management</h4>
                      <p className="text-xs text-gray-600">Configure wards</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('discharges');
                    setIsSettingsDialogOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                      <Home className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Discharge Management</h4>
                      <p className="text-xs text-gray-600">Process discharges</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('birth-certificates');
                    setIsSettingsDialogOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <Baby className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Birth Certificates</h4>
                      <p className="text-xs text-gray-600">Register & manage births</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('death-certificates');
                    setIsSettingsDialogOpen(false);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Death Certificates</h4>
                      <p className="text-xs text-gray-600">Register & manage deaths</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <Separator />

            {/* System Preferences */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">System Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-assign beds</p>
                    <p className="text-xs text-gray-600">Automatically assign available beds during admission</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Real-time notifications</p>
                    <p className="text-xs text-gray-600">Get alerts for critical patient updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Duty roster auto-reminders</p>
                    <p className="text-xs text-gray-600">Send reminders to doctors before their shifts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Discharge checklist enforcement</p>
                    <p className="text-xs text-gray-600">Require all checklist items before discharge</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <Separator />

            {/* System Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">System Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Wards</p>
                  <p className="text-lg font-semibold text-gray-900">8</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total Beds</p>
                  <p className="text-lg font-semibold text-gray-900">120</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Current Occupancy</p>
                  <p className="text-lg font-semibold text-gray-900">85%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">IPD Staff</p>
                  <p className="text-lg font-semibold text-gray-900">45</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-[#2F80ED] hover:bg-blue-600">
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

// ============= ADD WARD DIALOG =============
function AddWardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const facilities = [
    'Oxygen Supply', 'Cardiac Monitor', 'Ventilator Support', 'Nurse Call System',
    'Attached Bathroom', 'TV', 'AC', 'WiFi', 'Patient Monitor', 'Suction Machine',
    'Infusion Pump', 'Medical Gas Pipeline', 'Emergency Call Button', 'Refrigerator'
  ];

  const equipment = [
    'ECG Machine', 'Defibrillator', 'Patient Beds', 'Bedside Tables', 
    'IV Stands', 'Blood Pressure Monitor', 'Pulse Oximeter', 'Nebulizer',
    'Glucometer', 'Thermometer', 'Wheelchair', 'Crash Cart'
  ];

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev => 
      prev.includes(item) 
        ? prev.filter(e => e !== item)
        : [...prev, item]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 w-[95vw] sm:w-full">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <span className="truncate">Add New Ward</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Create a new ward with comprehensive details including facilities, equipment, and staffing
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1 bg-gray-100 p-1 mb-4">
              <TabsTrigger value="basic-info" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Basic Info</TabsTrigger>
              <TabsTrigger value="capacity" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Capacity</TabsTrigger>
              <TabsTrigger value="facilities" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Facilities</TabsTrigger>
              <TabsTrigger value="staff" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">Staff</TabsTrigger>
              <TabsTrigger value="charges" className="text-xs sm:text-sm px-2 py-2 col-span-2 sm:col-span-1 data-[state=active]:bg-white">Charges</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic-info" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                  Provide basic information about the ward including name, type, and location
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="wardName" className="text-sm font-semibold">
                    Ward Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="wardName" 
                    placeholder="e.g., General Ward A, ICU 1, Private Wing" 
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Enter a unique and descriptive ward name</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wardCode" className="text-sm font-semibold">
                    Ward Code <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="wardCode" 
                    placeholder="e.g., GWA-01, ICU-1" 
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Unique identifier for the ward</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wardType" className="text-sm font-semibold">
                    Ward Type <span className="text-red-500">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="wardType" className="h-11">
                      <SelectValue placeholder="Select ward type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Ward</SelectItem>
                      <SelectItem value="icu">ICU (Intensive Care Unit)</SelectItem>
                      <SelectItem value="nicu">NICU (Neonatal ICU)</SelectItem>
                      <SelectItem value="picu">PICU (Pediatric ICU)</SelectItem>
                      <SelectItem value="ccu">CCU (Cardiac Care Unit)</SelectItem>
                      <SelectItem value="hdu">HDU (High Dependency Unit)</SelectItem>
                      <SelectItem value="isolation">Isolation Ward</SelectItem>
                      <SelectItem value="private">Private Ward</SelectItem>
                      <SelectItem value="deluxe">Deluxe Ward</SelectItem>
                      <SelectItem value="maternity">Maternity Ward</SelectItem>
                      <SelectItem value="pediatric">Pediatric Ward</SelectItem>
                      <SelectItem value="surgical">Surgical Ward</SelectItem>
                      <SelectItem value="medical">Medical Ward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="department" className="h-11">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="obstetrics">Obstetrics & Gynecology</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor" className="text-sm font-semibold">
                    Floor Number <span className="text-red-500">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="floor" className="h-11">
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ground">Ground Floor</SelectItem>
                      <SelectItem value="1">1st Floor</SelectItem>
                      <SelectItem value="2">2nd Floor</SelectItem>
                      <SelectItem value="3">3rd Floor</SelectItem>
                      <SelectItem value="4">4th Floor</SelectItem>
                      <SelectItem value="5">5th Floor</SelectItem>
                      <SelectItem value="6">6th Floor</SelectItem>
                      <SelectItem value="7">7th Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building" className="text-sm font-semibold">
                    Building/Block
                  </Label>
                  <Input 
                    id="building" 
                    placeholder="e.g., Main Building, Block A" 
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Ward Description
                </Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter detailed description of the ward, its purpose, and special features..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            {/* Capacity & Beds Tab */}
            <TabsContent value="capacity" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs sm:text-sm">
                  Configure bed capacity and room layout for the ward
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalBeds" className="text-sm font-semibold">
                    Total Beds <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="totalBeds" 
                    type="number" 
                    placeholder="0" 
                    className="h-11"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupiedBeds" className="text-sm font-semibold">
                    Currently Occupied
                  </Label>
                  <Input 
                    id="occupiedBeds" 
                    type="number" 
                    placeholder="0" 
                    className="h-11"
                    defaultValue="0"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableBeds" className="text-sm font-semibold">
                    Available Beds
                  </Label>
                  <Input 
                    id="availableBeds" 
                    type="number" 
                    placeholder="0" 
                    className="h-11"
                    defaultValue="0"
                    readOnly
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Bed Configuration</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedType" className="text-sm font-semibold">
                      Default Bed Type
                    </Label>
                    <Select>
                      <SelectTrigger id="bedType" className="h-11">
                        <SelectValue placeholder="Select bed type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Bed</SelectItem>
                        <SelectItem value="icu">ICU Bed</SelectItem>
                        <SelectItem value="electric">Electric Bed</SelectItem>
                        <SelectItem value="fowler">Fowler Bed</SelectItem>
                        <SelectItem value="semi-fowler">Semi-Fowler Bed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="text-sm font-semibold">
                      Room Configuration
                    </Label>
                    <Select>
                      <SelectTrigger id="roomType" className="h-11">
                        <SelectValue placeholder="Select configuration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Occupancy</SelectItem>
                        <SelectItem value="double">Double Occupancy</SelectItem>
                        <SelectItem value="shared">Shared Ward (4+ beds)</SelectItem>
                        <SelectItem value="suite">Suite Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalRooms" className="text-sm font-semibold">
                      Number of Rooms
                    </Label>
                    <Input 
                      id="totalRooms" 
                      type="number" 
                      placeholder="0" 
                      className="h-11"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaSize" className="text-sm font-semibold">
                      Total Area (sq. ft)
                    </Label>
                    <Input 
                      id="areaSize" 
                      type="number" 
                      placeholder="0" 
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Bed numbering will be automatically generated based on ward code and total beds
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Facilities Tab */}
            <TabsContent value="facilities" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 text-xs sm:text-sm">
                  Select all available facilities and equipment for this ward
                </AlertDescription>
              </Alert>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Ward Facilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {facilities.map((facility) => (
                      <div
                        key={facility}
                        onClick={() => toggleFacility(facility)}
                        className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${ 
                          selectedFacilities.includes(facility)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedFacilities.includes(facility)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedFacilities.includes(facility) && (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-medium">{facility}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Medical Equipment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {equipment.map((item) => (
                      <div
                        key={item}
                        onClick={() => toggleEquipment(item)}
                        className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedEquipment.includes(item)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedEquipment.includes(item)
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedEquipment.includes(item) && (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalFacilities" className="text-sm font-semibold">
                    Additional Facilities/Notes
                  </Label>
                  <Textarea 
                    id="additionalFacilities" 
                    placeholder="Enter any additional facilities or special notes..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Staff Assignment Tab */}
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
                    <Label htmlFor="nurseInCharge" className="text-sm font-semibold">
                      Nurse In-Charge <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger id="nurseInCharge" className="h-11">
                        <SelectValue placeholder="Select nurse in-charge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse1">Nurse Sarah Martinez - ID: N001</SelectItem>
                        <SelectItem value="nurse2">Nurse Emily Johnson - ID: N002</SelectItem>
                        <SelectItem value="nurse3">Nurse Maria Garcia - ID: N003</SelectItem>
                        <SelectItem value="nurse4">Nurse Lisa Anderson - ID: N004</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-sm font-semibold">
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="contactNumber" 
                      type="tel" 
                      placeholder="+92-300-1234567" 
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredNurses" className="text-sm font-semibold">
                      Required Nurses per Shift
                    </Label>
                    <Input 
                      id="requiredNurses" 
                      type="number" 
                      placeholder="0" 
                      className="h-11"
                      min="1"
                      defaultValue="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredDoctors" className="text-sm font-semibold">
                      Required Doctors per Shift
                    </Label>
                    <Input 
                      id="requiredDoctors" 
                      type="number" 
                      placeholder="0" 
                      className="h-11"
                      min="1"
                      defaultValue="1"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Assigned Doctors</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-11 border-dashed">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Doctor
                    </Button>
                    
                    {/* Sample assigned doctors */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Dr. Sarah Ahmed</p>
                            <p className="text-xs text-gray-500">Cardiologist - ID: D001</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Assigned Nurses</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-11 border-dashed">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Nurse
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Charges & Billing Tab */}
            <TabsContent value="charges" className="space-y-4 sm:space-y-6 mt-0">
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-xs sm:text-sm">
                  Configure billing rates and charges for this ward
                </AlertDescription>
              </Alert>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate" className="text-sm font-semibold">
                      Daily Bed Charges (PKR) <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="dailyRate" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-11"
                      min="0"
                      step="100"
                    />
                    <p className="text-xs text-gray-500">Per bed per day charge</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admissionFee" className="text-sm font-semibold">
                      One-time Admission Fee (PKR)
                    </Label>
                    <Input 
                      id="admissionFee" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-11"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nursingCharges" className="text-sm font-semibold">
                      Nursing Charges per Day (PKR)
                    </Label>
                    <Input 
                      id="nursingCharges" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-11"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctorVisitFee" className="text-sm font-semibold">
                      Doctor Visit Fee (PKR)
                    </Label>
                    <Input 
                      id="doctorVisitFee" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-11"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Additional Charges</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="acCharges" className="text-sm font-semibold">
                        AC Charges per Day (PKR)
                      </Label>
                      <Input 
                        id="acCharges" 
                        type="number" 
                        placeholder="0.00" 
                        className="h-11"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tvCharges" className="text-sm font-semibold">
                        TV Charges per Day (PKR)
                      </Label>
                      <Input 
                        id="tvCharges" 
                        type="number" 
                        placeholder="0.00" 
                        className="h-11"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attendantCharges" className="text-sm font-semibold">
                        Attendant Charges per Day (PKR)
                      </Label>
                      <Input 
                        id="attendantCharges" 
                        type="number" 
                        placeholder="0.00" 
                        className="h-11"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietCharges" className="text-sm font-semibold">
                        Diet Charges per Day (PKR)
                      </Label>
                      <Input 
                        id="dietCharges" 
                        type="number" 
                        placeholder="0.00" 
                        className="h-11"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Estimated Daily Total</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bed Charges:</span>
                      <span className="font-medium">PKR 0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nursing Charges:</span>
                      <span className="font-medium">PKR 0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Additional Services:</span>
                      <span className="font-medium">PKR 0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total per Day:</span>
                      <span className="text-green-600">PKR 0.00</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingNotes" className="text-sm font-semibold">
                    Billing Notes
                  </Label>
                  <Textarea 
                    id="billingNotes" 
                    placeholder="Enter any special billing instructions or notes..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0 flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Eye className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">Preview</span>
          </Button>
          <Button 
            className="bg-[#2F80ED] hover:bg-blue-600 w-full sm:w-auto"
            onClick={() => {
              toast.success('Ward created successfully!');
              onOpenChange(false);
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Create Ward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
