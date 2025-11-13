/**
 * Complete Doctor Profile Management
 * 
 * Features:
 * - Comprehensive doctor information
 * - Patient list and management
 * - Appointment/Process tracking
 * - Payment and revenue reports
 * - Performance analytics
 * - Schedule management
 * - Document management
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Stethoscope,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Printer,
  Eye,
  Edit,
  Star,
  BarChart3,
  PieChart,
  Building2,
  Briefcase,
  Shield,
  Heart,
  Brain,
  Target,
  Zap,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  RefreshCw,
  CalendarCheck,
  ClipboardList,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  History,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  Globe,
  Languages,
  Certificate,
  BookOpen,
  Video,
  Pill,
  Syringe,
  Microscope,
  Scan,
  Bed,
  Ambulance
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

// ============= INTERFACES =============

interface DoctorProfileData {
  id: string;
  employeeId: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  
  // Contact Information
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Professional Information
  designation: string;
  department: string;
  specialization: string[];
  subSpecialization?: string[];
  experience: number; // years
  
  // Qualifications
  degree: string[];
  medicalLicenseNumber: string;
  licenseExpiry: string;
  registrationNumber: string;
  registrationCouncil: string;
  
  // Employment Details
  joiningDate: string;
  employmentType: 'full-time' | 'part-time' | 'visiting' | 'consultant';
  shift?: string;
  
  // Consultation Details
  consultationFee: number;
  opdDays: string[];
  opdTimings: string;
  maxPatientsPerDay: number;
  consultationDuration: number; // minutes
  
  // Additional Info
  languages: string[];
  expertise: string[];
  awards?: string[];
  publications?: number;
  
  // Status
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: string;
  
  // Statistics
  totalPatients: number;
  activePatients: number;
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
}

interface PatientRecord {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  diagnosis: string;
  status: 'active' | 'recovered' | 'under-treatment' | 'referred';
  nextAppointment?: string;
  totalPaid: number;
}

interface AppointmentRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'procedure' | 'surgery' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'in-progress';
  department: string;
  complaint?: string;
  diagnosis?: string;
  prescription?: boolean;
  fee: number;
  paid: boolean;
  duration?: number;
}

interface PaymentRecord {
  id: string;
  transactionId: string;
  date: string;
  patientName: string;
  patientId: string;
  service: string;
  serviceType: 'consultation' | 'procedure' | 'surgery' | 'other';
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance';
  status: 'completed' | 'pending' | 'refunded';
  receiptNumber: string;
}

// ============= MOCK DATA =============

const mockDoctorData: DoctorProfileData = {
  id: 'DOC001',
  employeeId: 'EMP-2024-0156',
  
  firstName: 'Sarah',
  lastName: 'Mitchell',
  fullName: 'Dr. Sarah Mitchell',
  dateOfBirth: '1982-05-15',
  age: 42,
  gender: 'female',
  bloodGroup: 'A+',
  
  email: 'dr.sarah.mitchell@hospital.com',
  phone: '+1-555-0123',
  alternatePhone: '+1-555-0124',
  address: '456 Medical Plaza, Suite 300',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA',
  
  designation: 'Senior Consultant & Head of Department',
  department: 'Cardiology',
  specialization: ['Interventional Cardiology', 'Preventive Cardiology'],
  subSpecialization: ['Coronary Angioplasty', 'Pacemaker Implantation', 'Heart Failure Management'],
  experience: 18,
  
  degree: ['MBBS', 'MD (Internal Medicine)', 'DM (Cardiology)', 'FACC'],
  medicalLicenseNumber: 'MLC-NY-45678',
  licenseExpiry: '2026-12-31',
  registrationNumber: 'REG-2006-12345',
  registrationCouncil: 'New York State Medical Board',
  
  joiningDate: '2015-03-01',
  employmentType: 'full-time',
  shift: 'Morning',
  
  consultationFee: 150,
  opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
  opdTimings: '09:00 AM - 02:00 PM',
  maxPatientsPerDay: 25,
  consultationDuration: 15,
  
  languages: ['English', 'Spanish', 'French'],
  expertise: [
    'Coronary Artery Disease',
    'Heart Failure',
    'Arrhythmias',
    'Hypertension',
    'Dyslipidemia',
    'Preventive Cardiology'
  ],
  awards: [
    'Best Cardiologist Award 2023',
    'Excellence in Patient Care 2022',
    'Research Excellence Award 2021'
  ],
  publications: 45,
  
  status: 'active',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  
  totalPatients: 1247,
  activePatients: 342,
  totalAppointments: 3456,
  completedAppointments: 3198,
  totalRevenue: 518700,
  rating: 4.8,
  reviewCount: 892
};

const mockPatients: PatientRecord[] = [
  {
    id: 'PT001',
    uhid: 'UHID-892401',
    name: 'Robert Thompson',
    age: 62,
    gender: 'male',
    contact: '+1-555-1001',
    firstVisit: '2023-05-15',
    lastVisit: '2024-11-08',
    totalVisits: 12,
    diagnosis: 'Coronary Artery Disease, Hypertension',
    status: 'under-treatment',
    nextAppointment: '2024-11-25',
    totalPaid: 2850
  },
  {
    id: 'PT002',
    uhid: 'UHID-892402',
    name: 'Maria Garcia',
    age: 58,
    gender: 'female',
    contact: '+1-555-1002',
    firstVisit: '2024-01-10',
    lastVisit: '2024-11-10',
    totalVisits: 8,
    diagnosis: 'Heart Failure, Diabetes',
    status: 'active',
    nextAppointment: '2024-11-18',
    totalPaid: 1950
  },
  {
    id: 'PT003',
    uhid: 'UHID-892403',
    name: 'James Anderson',
    age: 45,
    gender: 'male',
    contact: '+1-555-1003',
    firstVisit: '2024-08-20',
    lastVisit: '2024-10-30',
    totalVisits: 4,
    diagnosis: 'Hypertension',
    status: 'recovered',
    totalPaid: 650
  },
  {
    id: 'PT004',
    uhid: 'UHID-892404',
    name: 'Linda Martinez',
    age: 52,
    gender: 'female',
    contact: '+1-555-1004',
    firstVisit: '2023-11-05',
    lastVisit: '2024-11-11',
    totalVisits: 15,
    diagnosis: 'Atrial Fibrillation',
    status: 'under-treatment',
    nextAppointment: '2024-12-05',
    totalPaid: 3200
  },
  {
    id: 'PT005',
    uhid: 'UHID-892405',
    name: 'Michael Chen',
    age: 67,
    gender: 'male',
    contact: '+1-555-1005',
    firstVisit: '2024-06-12',
    lastVisit: '2024-11-09',
    totalVisits: 6,
    diagnosis: 'Angina Pectoris',
    status: 'under-treatment',
    nextAppointment: '2024-11-20',
    totalPaid: 1450
  }
];

const mockAppointments: AppointmentRecord[] = [
  {
    id: 'APT001',
    appointmentId: 'APT-2024-5678',
    patientName: 'Robert Thompson',
    patientId: 'PT001',
    date: '2024-11-11',
    time: '09:30 AM',
    type: 'follow-up',
    status: 'completed',
    department: 'Cardiology OPD',
    complaint: 'Chest pain, shortness of breath',
    diagnosis: 'Stable Angina',
    prescription: true,
    fee: 150,
    paid: true,
    duration: 20
  },
  {
    id: 'APT002',
    appointmentId: 'APT-2024-5679',
    patientName: 'Maria Garcia',
    patientId: 'PT002',
    date: '2024-11-11',
    time: '10:00 AM',
    type: 'consultation',
    status: 'completed',
    department: 'Cardiology OPD',
    complaint: 'Irregular heartbeat',
    diagnosis: 'Atrial Flutter',
    prescription: true,
    fee: 150,
    paid: true,
    duration: 15
  },
  {
    id: 'APT003',
    appointmentId: 'APT-2024-5680',
    patientName: 'David Wilson',
    patientId: 'PT006',
    date: '2024-11-11',
    time: '11:00 AM',
    type: 'consultation',
    status: 'in-progress',
    department: 'Cardiology OPD',
    complaint: 'High blood pressure',
    fee: 150,
    paid: false
  },
  {
    id: 'APT004',
    appointmentId: 'APT-2024-5681',
    patientName: 'Jennifer Lee',
    patientId: 'PT007',
    date: '2024-11-11',
    time: '11:30 AM',
    type: 'follow-up',
    status: 'scheduled',
    department: 'Cardiology OPD',
    fee: 150,
    paid: false
  },
  {
    id: 'APT005',
    appointmentId: 'APT-2024-5682',
    patientName: 'Thomas Brown',
    patientId: 'PT008',
    date: '2024-11-11',
    time: '12:00 PM',
    type: 'procedure',
    status: 'scheduled',
    department: 'Cath Lab',
    complaint: 'Scheduled Angioplasty',
    fee: 5000,
    paid: true
  },
  {
    id: 'APT006',
    appointmentId: 'APT-2024-5683',
    patientName: 'Patricia White',
    patientId: 'PT009',
    date: '2024-11-10',
    time: '02:00 PM',
    type: 'consultation',
    status: 'no-show',
    department: 'Cardiology OPD',
    fee: 150,
    paid: false
  }
];

const mockPayments: PaymentRecord[] = [
  {
    id: 'PAY001',
    transactionId: 'TXN-2024-89012',
    date: '2024-11-11',
    patientName: 'Robert Thompson',
    patientId: 'PT001',
    service: 'Follow-up Consultation',
    serviceType: 'consultation',
    amount: 150,
    paymentMethod: 'card',
    status: 'completed',
    receiptNumber: 'REC-2024-1245'
  },
  {
    id: 'PAY002',
    transactionId: 'TXN-2024-89013',
    date: '2024-11-11',
    patientName: 'Maria Garcia',
    patientId: 'PT002',
    service: 'Cardiology Consultation',
    serviceType: 'consultation',
    amount: 150,
    paymentMethod: 'cash',
    status: 'completed',
    receiptNumber: 'REC-2024-1246'
  },
  {
    id: 'PAY003',
    transactionId: 'TXN-2024-89014',
    date: '2024-11-10',
    patientName: 'Linda Martinez',
    patientId: 'PT004',
    service: 'ECG & Consultation',
    serviceType: 'consultation',
    amount: 250,
    paymentMethod: 'upi',
    status: 'completed',
    receiptNumber: 'REC-2024-1244'
  },
  {
    id: 'PAY004',
    transactionId: 'TXN-2024-89015',
    date: '2024-11-09',
    patientName: 'Thomas Brown',
    patientId: 'PT008',
    service: 'Coronary Angioplasty',
    serviceType: 'procedure',
    amount: 5000,
    paymentMethod: 'insurance',
    status: 'completed',
    receiptNumber: 'REC-2024-1243'
  },
  {
    id: 'PAY005',
    transactionId: 'TXN-2024-89016',
    date: '2024-11-08',
    patientName: 'Michael Chen',
    patientId: 'PT005',
    service: 'Cardiac Stress Test',
    serviceType: 'procedure',
    amount: 450,
    paymentMethod: 'card',
    status: 'completed',
    receiptNumber: 'REC-2024-1242'
  }
];

// Chart data
const revenueData = [
  { month: 'Jan', revenue: 42000, patients: 280 },
  { month: 'Feb', revenue: 45000, patients: 300 },
  { month: 'Mar', revenue: 38000, patients: 253 },
  { month: 'Apr', revenue: 51000, patients: 340 },
  { month: 'May', revenue: 48000, patients: 320 },
  { month: 'Jun', revenue: 53000, patients: 353 },
  { month: 'Jul', revenue: 49000, patients: 327 },
  { month: 'Aug', revenue: 52000, patients: 347 },
  { month: 'Sep', revenue: 47000, patients: 313 },
  { month: 'Oct', revenue: 54000, patients: 360 },
  { month: 'Nov', revenue: 39500, patients: 263 }
];

const appointmentTypeData = [
  { name: 'Consultation', value: 65, count: 2080 },
  { name: 'Follow-up', value: 25, count: 800 },
  { name: 'Procedure', value: 8, count: 256 },
  { name: 'Emergency', value: 2, count: 64 }
];

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757'];

// ============= MAIN COMPONENT =============

interface DoctorProfileProps {
  doctorId: string;
  onBack: () => void;
}

export function DoctorProfile({ doctorId, onBack }: DoctorProfileProps) {
  const [doctor] = useState<DoctorProfileData>(mockDoctorData);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients] = useState<PatientRecord[]>(mockPatients);
  const [appointments] = useState<AppointmentRecord[]>(mockAppointments);
  const [payments] = useState<PaymentRecord[]>(mockPayments);
  
  // Filters
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('all');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState('all');
  const [paymentDateFilter, setPaymentDateFilter] = useState('all');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patientSearchQuery === '' ||
      patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      patient.uhid.toLowerCase().includes(patientSearchQuery.toLowerCase());
    
    const matchesStatus = patientStatusFilter === 'all' || patient.status === patientStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under-treatment':
      case 'in-progress':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recovered':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'referred':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'no-show':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Doctors
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Profile
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-blue-100">
                <AvatarImage src={doctor.avatar} alt={doctor.fullName} />
                <AvatarFallback className="text-2xl bg-blue-600 text-white">
                  {doctor.firstName[0]}{doctor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl text-gray-900">{doctor.fullName}</h1>
                  <p className="text-lg text-gray-600">{doctor.designation}</p>
                  <p className="text-sm text-gray-500">{doctor.department}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    {doctor.employmentType.toUpperCase()}
                  </Badge>
                  <Badge className={
                    doctor.status === 'active' ? 'bg-green-100 text-green-800' :
                    doctor.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {doctor.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    <Award className="w-3 h-3 mr-1" />
                    {doctor.experience} Years Experience
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{doctor.rating}</span>
                    <span className="text-xs text-gray-500">({doctor.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {doctor.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {doctor.city}, {doctor.state}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Employee ID: {doctor.employeeId}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 lg:ml-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl text-blue-900">{doctor.totalPatients}</p>
                  <p className="text-xs text-gray-600">Total Patients</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CalendarCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-green-900">{doctor.completedAppointments}</p>
                  <p className="text-xs text-gray-600">Appointments</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl text-purple-900">${doctor.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl text-orange-900">{doctor.activePatients}</p>
                  <p className="text-xs text-gray-600">Active Patients</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">OPD Schedule</p>
                    <p className="text-sm">{doctor.opdDays.join(', ')}</p>
                    <p className="text-sm text-gray-600">{doctor.opdTimings}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-xl text-blue-900">${doctor.consultationFee}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Professional Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Specialization</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctor.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Sub-Specialization</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctor.subSpecialization?.map((spec, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-gray-500">Educational Qualifications</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {doctor.degree.map((deg, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {deg}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Medical License</Label>
                    <p className="text-sm font-mono">{doctor.medicalLicenseNumber}</p>
                    <p className="text-xs text-gray-500">Expires: {doctor.licenseExpiry}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Registration Number</Label>
                    <p className="text-sm font-mono">{doctor.registrationNumber}</p>
                    <p className="text-xs text-gray-500">{doctor.registrationCouncil}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-gray-500">Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctor.expertise.map((exp, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50">
                        <Target className="w-3 h-3 mr-1" />
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-gray-500">Languages</Label>
                  <div className="flex gap-2 mt-1">
                    {doctor.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        <Languages className="w-3 h-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Awards & Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Awards & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.awards?.map((award, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm">{award}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Research Publications</span>
                  </div>
                  <p className="text-2xl text-blue-900">{doctor.publications}</p>
                  <p className="text-xs text-gray-600">Published Papers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Employment Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Primary Email</Label>
                    <p>{doctor.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Primary Phone</Label>
                    <p>{doctor.phone}</p>
                  </div>
                  {doctor.alternatePhone && (
                    <div>
                      <Label className="text-xs text-gray-500">Alternate Phone</Label>
                      <p>{doctor.alternatePhone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-gray-500">Blood Group</Label>
                    <p>{doctor.bloodGroup}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-gray-500">Address</Label>
                  <p className="text-sm">{doctor.address}</p>
                  <p className="text-sm">{doctor.city}, {doctor.state} {doctor.zipCode}</p>
                  <p className="text-sm">{doctor.country}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Employee ID</Label>
                    <p className="font-mono">{doctor.employeeId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Joining Date</Label>
                    <p>{doctor.joiningDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Employment Type</Label>
                    <Badge>{doctor.employmentType}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Department</Label>
                    <p>{doctor.department}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Shift</Label>
                    <p>{doctor.shift || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Experience</Label>
                    <p>{doctor.experience} Years</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Max Patients/Day</Label>
                    <p>{doctor.maxPatientsPerDay}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Consultation Duration</Label>
                    <p>{doctor.consultationDuration} minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by patient name or UHID..."
                      className="pl-10"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Select value={patientStatusFilter} onValueChange={setPatientStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under-treatment">Under Treatment</SelectItem>
                    <SelectItem value="recovered">Recovered</SelectItem>
                    <SelectItem value="referred">Referred</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Info</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>First Visit</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Total Visits</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Appointment</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p>{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.uhid}</p>
                            <p className="text-xs text-gray-500">
                              {patient.age}Y / {patient.gender}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{patient.contact}</TableCell>
                        <TableCell className="text-sm">{patient.firstVisit}</TableCell>
                        <TableCell className="text-sm">{patient.lastVisit}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.totalVisits}</Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px]">
                          {patient.diagnosis}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {patient.nextAppointment || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          ${patient.totalPaid.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appointment ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{apt.appointmentId}</TableCell>
                        <TableCell>
                          <div>
                            <p>{apt.patientName}</p>
                            <p className="text-xs text-gray-500">{apt.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{apt.date}</p>
                            <p className="text-xs text-gray-500">{apt.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{apt.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{apt.department}</TableCell>
                        <TableCell className="text-sm max-w-[200px]">
                          {apt.complaint || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">${apt.fee}</TableCell>
                        <TableCell>
                          {apt.paid ? (
                            <Badge className="bg-green-100 text-green-800">Paid</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl text-green-900">$5,750</p>
                <p className="text-xs text-gray-600">Total This Month</p>
                <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Receipt className="w-8 h-8 text-blue-600" />
                  <Badge>{payments.length}</Badge>
                </div>
                <p className="text-2xl text-blue-900">{payments.length}</p>
                <p className="text-xs text-gray-600">Transactions</p>
                <p className="text-xs text-blue-600 mt-1">Last 7 days</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                  <span className="text-xs text-gray-500">Avg</span>
                </div>
                <p className="text-2xl text-purple-900">$1,150</p>
                <p className="text-xs text-gray-600">Average Transaction</p>
                <p className="text-xs text-purple-600 mt-1">Per consultation</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-8 h-8 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-800">98%</Badge>
                </div>
                <p className="text-2xl text-orange-900">$5,635</p>
                <p className="text-xs text-gray-600">Collected Amount</p>
                <p className="text-xs text-orange-600 mt-1">$115 pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                        <TableCell className="text-sm">{payment.date}</TableCell>
                        <TableCell>
                          <div>
                            <p>{payment.patientName}</p>
                            <p className="text-xs text-gray-500">{payment.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{payment.service}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.serviceType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{payment.receiptNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Revenue & Patient Trends
              </CardTitle>
              <CardDescription>Monthly performance over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.3} name="Revenue ($)" />
                  <Area yAxisId="right" type="monotone" dataKey="patients" stroke="#27AE60" fill="#27AE60" fillOpacity={0.3} name="Patients" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Appointment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={appointmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {appointmentTypeData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.count} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Patient Satisfaction</span>
                    <span className="text-sm">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Appointment Completion Rate</span>
                    <span className="text-sm">92.5%</span>
                  </div>
                  <Progress value={92.5} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">On-Time Performance</span>
                    <span className="text-sm">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Follow-up Compliance</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl text-green-900">4.8</p>
                    <p className="text-xs text-gray-600">Average Rating</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl text-blue-900">892</p>
                    <p className="text-xs text-gray-600">Total Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for labels
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm ${className}`}>{children}</label>;
}
