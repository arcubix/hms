/**
 * Preference Settings Module
 * 
 * Complete hospital configuration and settings management:
 * - Forms Configuration
 * - Doctor's Timings
 * - Departments Management
 * - Insurance Companies
 * - Corporate Organizations
 * - Donation Donors
 * - Message Settings
 * - Referral Hospitals
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { InsurancePDFPreview } from './InsurancePDFPreview';
import { DonationPayments } from './DonationPayments';
import { MessageRecipientsConfig } from './MessageRecipientsConfig';
import { AddMessageTemplatePage } from './AddMessageTemplatePage';
import { AddReferralHospital } from './AddReferralHospital';
import { ReferredPatientsList } from './ReferredPatientsList';
import { MessageTemplatesList } from './MessageTemplatesList';
import {
  Settings,
  FileText,
  Clock,
  Building2,
  Shield,
  Heart,
  MessageSquare,
  Hospital,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Users,
  Calendar,
  Phone,
  Briefcase,
  Mail,
  MapPin,
  Globe,
  DollarSign,
  CreditCard,
  User,
  Tag,
  Hash,
  Type,
  ToggleLeft,
  List,
  Send,
  Bell,
  Smartphone,
  ChevronRight,
  Eye,
  RefreshCw,
  Copy,
  ExternalLink,
  FileCheck,
  Stethoscope,
  Ambulance,
  TrendingUp,
  Target,
  FlaskConical,
  Pill,
  BarChart3,
  Percent,
  Receipt,
  Layers,
  ClipboardList,
  FileSpreadsheet,
  MessageCircle,
  Star,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

interface FormTemplate {
  id: string;
  name: string;
  category: string;
  fields: number;
  status: 'active' | 'inactive';
  lastModified: string;
}

interface DoctorTiming {
  id: string;
  doctorName: string;
  department: string;
  day: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  consultationFee: number;
  status: 'active' | 'inactive';
}

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  beds: number;
  staff: number;
  phone: string;
  status: 'active' | 'inactive';
}

interface Insurance {
  id: string;
  name: string;
  type: 'insurance' | 'organization';
  policyPrefix: string;
  contactPerson: string;
  phone: string;
  email: string;
  discountRate: number;
  status: 'active' | 'inactive';
}

interface ProcedurePrice {
  id: string;
  name: string;
  price: number;
  active: boolean;
  category: 'procedures' | 'laboratory' | 'radiology' | 'pharmacy';
}

interface Donor {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  cnic?: string; // For individual donors
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  totalDonated: number;
  lastDonation: string;
  frequency: 'one-time' | 'monthly' | 'yearly';
  taxExempt?: boolean;
  notes?: string;
}

interface DonationPayment {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'cheque' | 'online';
  transactionId?: string;
  chequeNumber?: string;
  bankName?: string;
  purpose: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp';
  trigger: string;
  content: string;
  status: 'active' | 'inactive';
}

interface ReferralHospital {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  specialties: string[];
  status: 'active' | 'inactive';
}

// ============= MOCK DATA =============

const mockForms: FormTemplate[] = [
  {
    id: 'F001',
    name: 'Patient Admission Form',
    category: 'IPD',
    fields: 25,
    status: 'active',
    lastModified: '2024-11-10'
  },
  {
    id: 'F002',
    name: 'Consent Form - Surgery',
    category: 'Surgery',
    fields: 15,
    status: 'active',
    lastModified: '2024-11-08'
  },
  {
    id: 'F003',
    name: 'Discharge Summary',
    category: 'IPD',
    fields: 20,
    status: 'active',
    lastModified: '2024-11-05'
  }
];

const mockTimings: DoctorTiming[] = [
  {
    id: 'T001',
    doctorName: 'Dr. Sarah Mitchell',
    department: 'Cardiology',
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    maxPatients: 30,
    consultationFee: 500,
    status: 'active'
  },
  {
    id: 'T002',
    doctorName: 'Dr. James Wilson',
    department: 'Neurology',
    day: 'Monday',
    startTime: '10:00',
    endTime: '18:00',
    maxPatients: 25,
    consultationFee: 600,
    status: 'active'
  },
  {
    id: 'T003',
    doctorName: 'Dr. Emily Davis',
    department: 'Pediatrics',
    day: 'Tuesday',
    startTime: '08:00',
    endTime: '16:00',
    maxPatients: 40,
    consultationFee: 400,
    status: 'active'
  }
];

const mockDepartments: Department[] = [
  {
    id: 'D001',
    name: 'Cardiology',
    code: 'CARD',
    head: 'Dr. Sarah Mitchell',
    beds: 25,
    staff: 45,
    phone: '+1-555-0201',
    status: 'active'
  },
  {
    id: 'D002',
    name: 'Neurology',
    code: 'NEUR',
    head: 'Dr. James Wilson',
    beds: 20,
    staff: 35,
    phone: '+1-555-0202',
    status: 'active'
  },
  {
    id: 'D003',
    name: 'Pediatrics',
    code: 'PED',
    head: 'Dr. Emily Davis',
    beds: 30,
    staff: 50,
    phone: '+1-555-0203',
    status: 'active'
  },
  {
    id: 'D004',
    name: 'Emergency',
    code: 'ER',
    head: 'Dr. Michael Brown',
    beds: 15,
    staff: 60,
    phone: '+1-555-0204',
    status: 'active'
  }
];

const mockInsurances: Insurance[] = [
  {
    id: 'I001',
    name: 'Blue Cross Blue Shield',
    type: 'insurance',
    policyPrefix: 'BCBS',
    contactPerson: 'John Anderson',
    phone: '+1-555-0301',
    email: 'contact@bcbs.com',
    discountRate: 20,
    status: 'active'
  },
  {
    id: 'I002',
    name: 'United Healthcare',
    type: 'insurance',
    policyPrefix: 'UHC',
    contactPerson: 'Sarah Johnson',
    phone: '+1-555-0302',
    email: 'info@uhc.com',
    discountRate: 15,
    status: 'active'
  },
  {
    id: 'I003',
    name: 'Aetna Insurance',
    type: 'insurance',
    policyPrefix: 'AETNA',
    contactPerson: 'David Miller',
    phone: '+1-555-0304',
    email: 'support@aetna.com',
    discountRate: 18,
    status: 'active'
  },
  {
    id: 'I004',
    name: 'Cigna Health',
    type: 'insurance',
    policyPrefix: 'CIGNA',
    contactPerson: 'Emily Brown',
    phone: '+1-555-0305',
    email: 'contact@cigna.com',
    discountRate: 22,
    status: 'active'
  },
  {
    id: 'O001',
    name: 'Tech Corp',
    type: 'organization',
    policyPrefix: 'TECH',
    contactPerson: 'Mike Roberts',
    phone: '+1-555-0303',
    email: 'hr@techcorp.com',
    discountRate: 25,
    status: 'active'
  },
  {
    id: 'O002',
    name: 'Global Manufacturing Inc.',
    type: 'organization',
    policyPrefix: 'GMI',
    contactPerson: 'Jennifer Wilson',
    phone: '+1-555-0306',
    email: 'benefits@globalmfg.com',
    discountRate: 30,
    status: 'active'
  },
  {
    id: 'O003',
    name: 'City Bank Corporation',
    type: 'organization',
    policyPrefix: 'CITYBANK',
    contactPerson: 'Robert Chen',
    phone: '+1-555-0307',
    email: 'hr@citybank.com',
    discountRate: 20,
    status: 'active'
  },
  {
    id: 'O004',
    name: 'State University',
    type: 'organization',
    policyPrefix: 'UNIV',
    contactPerson: 'Dr. Patricia Lee',
    phone: '+1-555-0308',
    email: 'health@stateuniv.edu',
    discountRate: 15,
    status: 'active'
  }
];

const mockDonors: Donor[] = [
  {
    id: 'DN001',
    name: 'Robert Thompson',
    type: 'individual',
    cnic: '12345-6789012-3',
    phone: '+1-555-0401',
    email: 'robert.t@email.com',
    address: '123 Main Street',
    city: 'New York',
    country: 'USA',
    totalDonated: 50000,
    lastDonation: '2024-10-15',
    frequency: 'monthly',
    taxExempt: true,
    notes: 'Regular monthly donor'
  },
  {
    id: 'DN002',
    name: 'Smith Foundation',
    type: 'corporate',
    phone: '+1-555-0402',
    email: 'contact@smithfoundation.org',
    address: '456 Corporate Blvd',
    city: 'Los Angeles',
    country: 'USA',
    totalDonated: 500000,
    lastDonation: '2024-11-01',
    frequency: 'yearly',
    taxExempt: true,
    notes: 'Annual charity gala sponsor'
  },
  {
    id: 'DN003',
    name: 'Maria Garcia',
    type: 'individual',
    cnic: '98765-4321098-7',
    phone: '+1-555-0403',
    email: 'maria.g@email.com',
    address: '789 Oak Avenue',
    city: 'Chicago',
    country: 'USA',
    totalDonated: 25000,
    lastDonation: '2024-09-20',
    frequency: 'one-time',
    taxExempt: false,
    notes: 'In memory donation'
  }
];

const mockDonationPayments: DonationPayment[] = [
  {
    id: 'PAY001',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    amount: 5000,
    date: '2024-11-15',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN987654321',
    bankName: 'Chase Bank',
    purpose: 'Monthly Donation - November 2024',
    receiptNumber: 'RCP-2024-1115-001',
    status: 'completed',
    notes: 'Regular monthly contribution'
  },
  {
    id: 'PAY002',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    amount: 5000,
    date: '2024-10-15',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN987654320',
    bankName: 'Chase Bank',
    purpose: 'Monthly Donation - October 2024',
    receiptNumber: 'RCP-2024-1015-001',
    status: 'completed'
  },
  {
    id: 'PAY003',
    donorId: 'DN002',
    donorName: 'Smith Foundation',
    amount: 500000,
    date: '2024-11-01',
    paymentMethod: 'cheque',
    chequeNumber: 'CHQ-789456',
    bankName: 'Bank of America',
    purpose: 'Annual Charity Gala Sponsorship 2024',
    receiptNumber: 'RCP-2024-1101-001',
    status: 'completed',
    notes: 'Corporate sponsorship for annual event'
  },
  {
    id: 'PAY004',
    donorId: 'DN003',
    donorName: 'Maria Garcia',
    amount: 25000,
    date: '2024-09-20',
    paymentMethod: 'card',
    transactionId: 'CARD-456789123',
    purpose: 'In Memory of John Garcia',
    receiptNumber: 'RCP-2024-0920-001',
    status: 'completed',
    notes: 'Memorial donation'
  },
  {
    id: 'PAY005',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    amount: 5000,
    date: '2024-09-15',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN987654319',
    bankName: 'Chase Bank',
    purpose: 'Monthly Donation - September 2024',
    receiptNumber: 'RCP-2024-0915-001',
    status: 'completed'
  }
];

const mockMessages: MessageTemplate[] = [
  {
    id: 'M001',
    name: 'Appointment Confirmation',
    type: 'sms',
    trigger: 'Appointment Booked',
    content: 'Dear {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Thank you!',
    status: 'active'
  },
  {
    id: 'M002',
    name: 'Appointment Reminder',
    type: 'whatsapp',
    trigger: '1 Day Before',
    content: 'Hello {patient_name}, this is a reminder for your appointment tomorrow at {time} with {doctor_name}.',
    status: 'active'
  },
  {
    id: 'M003',
    name: 'Lab Results Ready',
    type: 'email',
    trigger: 'Lab Results Completed',
    content: 'Dear {patient_name}, your lab results are ready. Please visit the hospital to collect your reports.',
    status: 'active'
  }
];

const mockReferrals: ReferralHospital[] = [
  {
    id: 'R001',
    name: 'City General Hospital',
    type: 'Multi-Specialty',
    address: '123 Main Street, Downtown',
    phone: '+1-555-0501',
    email: 'info@citygeneral.com',
    contactPerson: 'Dr. William Parker',
    specialties: ['Cardiology', 'Neurosurgery', 'Oncology'],
    status: 'active'
  },
  {
    id: 'R002',
    name: 'Advanced Cancer Center',
    type: 'Specialty',
    address: '456 Medical Plaza, Healthcare District',
    phone: '+1-555-0502',
    email: 'referrals@cancercenter.com',
    contactPerson: 'Dr. Lisa Chen',
    specialties: ['Oncology', 'Radiation Therapy', 'Chemotherapy'],
    status: 'active'
  },
  {
    id: 'R003',
    name: 'Trauma & Emergency Hospital',
    type: 'Emergency',
    address: '789 Emergency Lane, Medical Zone',
    phone: '+1-555-0503',
    email: 'emergency@traumacenter.com',
    contactPerson: 'Dr. Mark Davis',
    specialties: ['Trauma Surgery', 'Critical Care', 'Burn Unit'],
    status: 'active'
  }
];

// Mock patients covered by insurance
interface InsurancePatient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  policyNumber: string;
  insuranceCompany: string;
  insuranceId: string;
  policyStartDate: string;
  policyEndDate: string;
  coverageAmount: number;
  status: 'active' | 'expired' | 'pending';
  lastVisit: string;
  totalClaims: number;
  claimedAmount: number;
}

const mockInsurancePatients: InsurancePatient[] = [
  {
    id: 'IP001',
    uhid: 'UH001234',
    name: 'John Anderson',
    age: 45,
    gender: 'Male',
    phone: '+1-555-1001',
    email: 'john.anderson@email.com',
    policyNumber: 'BCBS-2024-001234',
    insuranceCompany: 'Blue Cross Blue Shield',
    insuranceId: 'INS001',
    policyStartDate: '2024-01-15',
    policyEndDate: '2025-01-14',
    coverageAmount: 500000,
    status: 'active',
    lastVisit: '2024-11-15',
    totalClaims: 5,
    claimedAmount: 45000
  },
  {
    id: 'IP002',
    uhid: 'UH001567',
    name: 'Sarah Mitchell',
    age: 32,
    gender: 'Female',
    phone: '+1-555-1002',
    email: 'sarah.mitchell@email.com',
    policyNumber: 'BCBS-2024-002456',
    insuranceCompany: 'Blue Cross Blue Shield',
    insuranceId: 'INS001',
    policyStartDate: '2024-03-10',
    policyEndDate: '2025-03-09',
    coverageAmount: 750000,
    status: 'active',
    lastVisit: '2024-11-18',
    totalClaims: 3,
    claimedAmount: 28500
  },
  {
    id: 'IP003',
    uhid: 'UH001890',
    name: 'Michael Chen',
    age: 58,
    gender: 'Male',
    phone: '+1-555-1003',
    email: 'michael.chen@email.com',
    policyNumber: 'BCBS-2024-003789',
    insuranceCompany: 'Blue Cross Blue Shield',
    insuranceId: 'INS001',
    policyStartDate: '2024-02-20',
    policyEndDate: '2025-02-19',
    coverageAmount: 1000000,
    status: 'active',
    lastVisit: '2024-11-10',
    totalClaims: 8,
    claimedAmount: 125000
  },
  {
    id: 'IP004',
    uhid: 'UH002123',
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'Female',
    phone: '+1-555-1004',
    email: 'emily.rodriguez@email.com',
    policyNumber: 'BCBS-2023-009876',
    insuranceCompany: 'Blue Cross Blue Shield',
    insuranceId: 'INS001',
    policyStartDate: '2023-12-01',
    policyEndDate: '2024-11-30',
    coverageAmount: 500000,
    status: 'expired',
    lastVisit: '2024-10-25',
    totalClaims: 2,
    claimedAmount: 15000
  },
  {
    id: 'IP005',
    uhid: 'UH002456',
    name: 'David Thompson',
    age: 41,
    gender: 'Male',
    phone: '+1-555-1005',
    email: 'david.thompson@email.com',
    policyNumber: 'BCBS-2024-004567',
    insuranceCompany: 'Blue Cross Blue Shield',
    insuranceId: 'INS001',
    policyStartDate: '2024-06-15',
    policyEndDate: '2025-06-14',
    coverageAmount: 600000,
    status: 'active',
    lastVisit: '2024-11-19',
    totalClaims: 4,
    claimedAmount: 38000
  },
  {
    id: 'IP006',
    uhid: 'UH002789',
    name: 'Jennifer Parker',
    age: 35,
    gender: 'Female',
    phone: '+1-555-1006',
    email: 'jennifer.parker@email.com',
    policyNumber: 'UHC-2024-001122',
    insuranceCompany: 'United Healthcare',
    insuranceId: 'INS002',
    policyStartDate: '2024-04-01',
    policyEndDate: '2025-03-31',
    coverageAmount: 800000,
    status: 'active',
    lastVisit: '2024-11-12',
    totalClaims: 6,
    claimedAmount: 72000
  },
  {
    id: 'IP007',
    uhid: 'UH003012',
    name: 'Robert Williams',
    age: 52,
    gender: 'Male',
    phone: '+1-555-1007',
    email: 'robert.williams@email.com',
    policyNumber: 'UHC-2024-002233',
    insuranceCompany: 'United Healthcare',
    insuranceId: 'INS002',
    policyStartDate: '2024-05-20',
    policyEndDate: '2025-05-19',
    coverageAmount: 1200000,
    status: 'active',
    lastVisit: '2024-11-17',
    totalClaims: 7,
    claimedAmount: 98000
  },
  {
    id: 'IP008',
    uhid: 'UH003345',
    name: 'Lisa Martinez',
    age: 39,
    gender: 'Female',
    phone: '+1-555-1008',
    email: 'lisa.martinez@email.com',
    policyNumber: 'BCBS-2024-005678',
    insuranceCompany: 'Blue Cross Blue Shield',
    insuranceId: 'INS001',
    policyStartDate: '2024-07-10',
    policyEndDate: '2025-07-09',
    coverageAmount: 650000,
    status: 'active',
    lastVisit: '2024-11-14',
    totalClaims: 3,
    claimedAmount: 24500
  }
];

// ============= MAIN COMPONENT =============

export function PreferenceSettings() {
  const [activeSection, setActiveSection] = useState('forms');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddDeptDialogOpen, setIsAddDeptDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [isAddInsuranceDialogOpen, setIsAddInsuranceDialogOpen] = useState(false);
  const [insuranceName, setInsuranceName] = useState('');
  const [insuranceType, setInsuranceType] = useState('insurance');
  const [creditAllowance, setCreditAllowance] = useState('');
  const [activePricingTab, setActivePricingTab] = useState('procedures');
  const [showAddInsuranceForm, setShowAddInsuranceForm] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showPatientsList, setShowPatientsList] = useState(false);
  const [selectedInsuranceForPDF, setSelectedInsuranceForPDF] = useState<any>(null);
  const [selectedInsuranceForPatients, setSelectedInsuranceForPatients] = useState<any>(null);
  
  // Additional insurance form fields
  const [policyPrefix, setPolicyPrefix] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [insurancePhone, setInsurancePhone] = useState('');
  const [insuranceEmail, setInsuranceEmail] = useState('');
  const [insuranceWebsite, setInsuranceWebsite] = useState('');
  const [insuranceAddress, setInsuranceAddress] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState('active');
  const [contractDate, setContractDate] = useState('');

  // Donor form fields
  const [isAddDonorDialogOpen, setIsAddDonorDialogOpen] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorType, setDonorType] = useState<'individual' | 'corporate'>('individual');
  const [donorCNIC, setDonorCNIC] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorCity, setDonorCity] = useState('');
  const [donorCountry, setDonorCountry] = useState('');
  const [donorTotalDonated, setDonorTotalDonated] = useState('');
  const [donorLastDonation, setDonorLastDonation] = useState('');
  const [donorFrequency, setDonorFrequency] = useState<'one-time' | 'monthly' | 'yearly'>('one-time');
  const [donorTaxExempt, setDonorTaxExempt] = useState(false);
  const [donorNotes, setDonorNotes] = useState('');

  // Payment dialog states
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isViewPaymentsDialogOpen, setIsViewPaymentsDialogOpen] = useState(false);
  const [showPaymentsPage, setShowPaymentsPage] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  // Message template page state
  const [showAddTemplatePage, setShowAddTemplatePage] = useState(false);
  
  // Referral hospital page states
  const [showAddHospitalPage, setShowAddHospitalPage] = useState(false);
  const [showReferredPatientsPage, setShowReferredPatientsPage] = useState(false);
  const [selectedHospitalForPatients, setSelectedHospitalForPatients] = useState<string | undefined>(undefined);
  
  // Message templates list page state
  const [showTemplatesListPage, setShowTemplatesListPage] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'cheque' | 'online'>('cash');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paymentChequeNumber, setPaymentChequeNumber] = useState('');
  const [paymentBankName, setPaymentBankName] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Add Charge dialog states
  const [isAddChargeDialogOpen, setIsAddChargeDialogOpen] = useState(false);
  const [chargeName, setChargeName] = useState('');
  const [chargeCategory, setChargeCategory] = useState('');
  const [chargeBaseAmount, setChargeBaseAmount] = useState('');
  const [chargeTaxRate, setChargeTaxRate] = useState('');
  const [chargeDepartment, setChargeDepartment] = useState('');
  const [chargeServiceType, setChargeServiceType] = useState('');
  const [chargeDescription, setChargeDescription] = useState('');
  const [chargeStatus, setChargeStatus] = useState('active');
  const [chargeApplicableTo, setChargeApplicableTo] = useState<string[]>([]);
  const [chargeBillingFrequency, setChargeBillingFrequency] = useState('one-time');
  const [chargeCode, setChargeCode] = useState('');
  const [chargeMinAmount, setChargeMinAmount] = useState('');
  const [chargeMaxAmount, setChargeMaxAmount] = useState('');
  const [chargeIsEmergency, setChargeIsEmergency] = useState(false);
  const [chargeRequiresApproval, setChargeRequiresApproval] = useState(false);

  // Standard hospital departments with codes
  const standardDepartments = [
    { name: 'Cardiology', code: 'CARD' },
    { name: 'Neurology', code: 'NEUR' },
    { name: 'Pediatrics', code: 'PED' },
    { name: 'Orthopedics', code: 'ORTH' },
    { name: 'Emergency', code: 'ER' },
    { name: 'Intensive Care Unit (ICU)', code: 'ICU' },
    { name: 'Obstetrics & Gynecology', code: 'OBGYN' },
    { name: 'General Surgery', code: 'SURG' },
    { name: 'Internal Medicine', code: 'IM' },
    { name: 'Oncology', code: 'ONCO' },
    { name: 'Radiology', code: 'RAD' },
    { name: 'Pathology & Laboratory', code: 'LAB' },
    { name: 'Pharmacy', code: 'PHARM' },
    { name: 'Psychiatry', code: 'PSYCH' },
    { name: 'Dermatology', code: 'DERM' },
    { name: 'Ophthalmology', code: 'OPHT' },
    { name: 'ENT (Otolaryngology)', code: 'ENT' },
    { name: 'Urology', code: 'URO' },
    { name: 'Nephrology', code: 'NEPH' },
    { name: 'Gastroenterology', code: 'GASTRO' },
    { name: 'Pulmonology', code: 'PULM' },
    { name: 'Endocrinology', code: 'ENDO' },
    { name: 'Rheumatology', code: 'RHEUM' },
    { name: 'Hematology', code: 'HEM' },
    { name: 'Anesthesiology', code: 'ANES' },
    { name: 'Physical Therapy', code: 'PT' },
    { name: 'Dental', code: 'DENT' },
    { name: 'Nutrition & Dietetics', code: 'NUTR' },
    { name: 'Blood Bank', code: 'BB' },
    { name: 'Medical Records', code: 'MR' }
  ];

  // Mock procedure prices for insurance
  const mockProcedurePrices: ProcedurePrice[] = [
    { id: 'P001', name: 'Dr Darmood Safdar -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P002', name: 'Dr Kairyasin -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P003', name: 'dr ahmad shamanwat -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P004', name: 'DR Aaim Gul -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P005', name: 'Dr Amina basheer -Consultation fee', price: 1000, active: true, category: 'procedures' },
    { id: 'P006', name: 'Dr Rakha neem -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P007', name: 'Dr Kirkan pulwar -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P008', name: 'Dr lighrameer -Consultation fee', price: 1000, active: true, category: 'procedures' },
    { id: 'P009', name: 'Dr M Irzan Malik -Consultation Fee', price: 1000, active: true, category: 'procedures' },
    { id: 'P010', name: 'Dr Amina basheer -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P011', name: 'pain Consultation Fee', price: 4000, active: true, category: 'procedures' },
    { id: 'P012', name: 'Dr Sohoeb gulwar -Consultation fee', price: 1000, active: true, category: 'procedures' },
    { id: 'P013', name: 'Dr hahrynudo Ulegir -Consultation fee', price: 1000, active: true, category: 'procedures' },
    { id: 'P014', name: 'Dr seema -Visit Charges', price: 0, active: true, category: 'procedures' },
    { id: 'P015', name: 'dr ahmad shamanwat Consultation fee', price: 500, active: true, category: 'procedures' },
    { id: 'P016', name: 'Dr naseen ulBasoa -Consultation fee', price: 1000, active: true, category: 'procedures' },
    { id: 'L001', name: 'Complete Blood Count (CBC)', price: 800, active: true, category: 'laboratory' },
    { id: 'L002', name: 'Lipid Profile', price: 1200, active: true, category: 'laboratory' },
    { id: 'L003', name: 'Liver Function Test', price: 1500, active: true, category: 'laboratory' },
    { id: 'L004', name: 'Kidney Function Test', price: 1400, active: true, category: 'laboratory' },
    { id: 'R001', name: 'X-Ray Chest', price: 1000, active: true, category: 'radiology' },
    { id: 'R002', name: 'CT Scan Brain', price: 5000, active: true, category: 'radiology' },
    { id: 'R003', name: 'MRI Spine', price: 8000, active: true, category: 'radiology' },
    { id: 'PH001', name: 'Paracetamol 500mg', price: 50, active: true, category: 'pharmacy' },
    { id: 'PH002', name: 'Amoxicillin 500mg', price: 150, active: true, category: 'pharmacy' },
  ];

  const [procedurePrices, setProcedurePrices] = useState(mockProcedurePrices);

  // Handle department selection
  const handleDepartmentSelect = (value: string) => {
    setSelectedDepartment(value);
    const dept = standardDepartments.find(d => d.name === value);
    if (dept) {
      setDepartmentCode(dept.code);
    }
  }

  // Handle procedure price change
  const handlePriceChange = (id: string, newPrice: number) => {
    setProcedurePrices(prev => 
      prev.map(proc => proc.id === id ? { ...proc, price: newPrice } : proc)
    );
  };

  // Handle procedure active toggle
  const handleActiveToggle = (id: string) => {
    setProcedurePrices(prev => 
      prev.map(proc => proc.id === id ? { ...proc, active: !proc.active } : proc)
    );
  };

  // Generate PDF preview
  const handlePreviewPDF = () => {
    setShowPDFPreview(true);
  };

  // Check if department already exists
  const isDepartmentExists = (deptName: string) => {
    return mockDepartments.some(dept => 
      dept.name.toLowerCase() === deptName.toLowerCase()
    );
  };

  // Get count of available departments
  const availableDepartments = standardDepartments.filter(dept => !isDepartmentExists(dept.name));
  const existingDepartmentsCount = standardDepartments.length - availableDepartments.length;

  // ============= SIDEBAR MENU =============

  const menuItems = [
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'timings', label: "Doctor's Timings", icon: Clock },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'insurances', label: 'Insurance', icon: Shield },
    { id: 'organizations', label: 'Organizations', icon: Briefcase },
    { id: 'donors', label: 'Donation Donors', icon: Heart },
    { id: 'discount', label: 'Discount', icon: Percent },
    { id: 'charges', label: 'Charges List', icon: Receipt },
    { id: 'expenses', label: 'Expense Categories', icon: Layers },
    { id: 'message-templates', label: 'Message Templates', icon: MessageCircle },
    { id: 'lab-trackings', label: 'Lab Trackings', icon: FlaskConical },
    { id: 'templates', label: 'Templates', icon: FileSpreadsheet },
    { id: 'patient-feedback', label: 'Patient Feedback', icon: Star },
    { id: 'messages', label: 'Message Settings', icon: MessageSquare },
    { id: 'referrals', label: 'Referral Hospitals', icon: Hospital }
  ];

  // ============= RENDER FORMS =============

  const renderForms = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Forms Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">Manage hospital forms and templates</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Form Template</DialogTitle>
              <DialogDescription>Add a new form template to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Form Name *</Label>
                <Input placeholder="Enter form name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ipd">IPD</SelectItem>
                      <SelectItem value="opd">OPD</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Form description..." rows={3} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Form
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search forms..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form ID</TableHead>
                <TableHead>Form Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-mono text-sm">{form.id}</TableCell>
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{form.category}</Badge>
                  </TableCell>
                  <TableCell>{form.fields} fields</TableCell>
                  <TableCell className="text-sm text-gray-600">{form.lastModified}</TableCell>
                  <TableCell>
                    <Badge className={form.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {form.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
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

  // ============= RENDER DOCTOR'S TIMINGS =============

  const renderTimings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Doctor's Timings</h2>
          <p className="text-sm text-gray-600 mt-1">Manage doctor schedules and availability</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Max Patients</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimings.map((timing) => (
                <TableRow key={timing.id}>
                  <TableCell className="font-medium">{timing.doctorName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{timing.department}</Badge>
                  </TableCell>
                  <TableCell>{timing.day}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {timing.startTime} - {timing.endTime}
                  </TableCell>
                  <TableCell>{timing.maxPatients}</TableCell>
                  <TableCell className="font-semibold">${timing.consultationFee}</TableCell>
                  <TableCell>
                    <Badge className={timing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {timing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
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

  // ============= RENDER DEPARTMENTS =============

  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Departments</h2>
          <p className="text-sm text-gray-600 mt-1">Manage hospital departments and resources</p>
        </div>
        <Dialog open={isAddDeptDialogOpen} onOpenChange={setIsAddDeptDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>Add a new department to the hospital</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Department Stats Alert */}
              <Alert className="bg-blue-50 border-blue-200">
                <Building2 className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-semibold">{availableDepartments.length}</span> departments available to add
                    </span>
                    <span className="text-xs">
                      <span className="font-semibold">{existingDepartmentsCount}</span> already created
                    </span>
                  </div>
                </AlertDescription>
              </Alert>

              <div>
                <Label>Department Name *</Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {standardDepartments.map((dept) => {
                      const alreadyExists = isDepartmentExists(dept.name);
                      return (
                        <SelectItem 
                          key={dept.code} 
                          value={dept.name}
                          disabled={alreadyExists}
                          className={alreadyExists ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{dept.name}</span>
                            {alreadyExists && (
                              <Badge className="bg-gray-200 text-gray-600 text-xs">
                                Already Added
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">Select from standard hospital departments</p>
                  <p className="text-xs text-blue-600 font-medium">
                    {availableDepartments.length} available • {existingDepartmentsCount} added
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department Code *</Label>
                  <Input 
                    placeholder="Auto-generated" 
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled based on department</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Head of Department</Label>
                <Input placeholder="Enter head of department name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Beds</Label>
                  <Input placeholder="Enter number of beds" type="number" />
                </div>
                <div>
                  <Label>Number of Staff</Label>
                  <Input placeholder="Enter number of staff" type="number" />
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input placeholder="Enter department phone number" />
              </div>
              
              {selectedDepartment && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-800">
                    Creating <span className="font-semibold">{selectedDepartment}</span> department with code <span className="font-mono font-semibold">{departmentCode}</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Show already added departments */}
              {existingDepartmentsCount > 0 && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gray-200 text-gray-700">
                      {existingDepartmentsCount} Already Added
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mockDepartments.map((dept) => (
                      <Badge key={dept.id} variant="outline" className="bg-white text-xs">
                        {dept.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Department
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAddDeptDialogOpen(false);
                  setSelectedDepartment('');
                  setDepartmentCode('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockDepartments.map((dept) => (
          <Card key={dept.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={dept.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {dept.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">{dept.name}</h3>
              <p className="text-xs text-gray-600 font-mono mb-3">{dept.code}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{dept.head}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{dept.beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{dept.staff} Staff</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{dept.phone}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============= RENDER INSURANCES =============

  const renderInsurances = () => {
    const insuranceData = mockInsurances.filter(ins => ins.type === 'insurance');
    
    // Show add insurance form
    if (showAddInsuranceForm) {
      return (
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddInsuranceForm(false)}
              className="flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to List
            </Button>
            <div>
              <h2 className="text-xl font-semibold">Add New Insurance Company</h2>
              <p className="text-sm text-gray-600 mt-1">Complete all required information to add a new insurance company</p>
            </div>
          </div>

          {/* Main Form Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Insurance Company Name *</Label>
                    <Input 
                      placeholder="Enter company name" 
                      value={insuranceName}
                      onChange={(e) => setInsuranceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Policy Prefix *</Label>
                    <Input 
                      placeholder="e.g., BCBS, UHC" 
                      value={policyPrefix}
                      onChange={(e) => setPolicyPrefix(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Person *</Label>
                    <Input 
                      placeholder="Enter contact person name" 
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input 
                      placeholder="+1-555-0000" 
                      value={insurancePhone}
                      onChange={(e) => setInsurancePhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input 
                      type="email" 
                      placeholder="contact@insurance.com" 
                      value={insuranceEmail}
                      onChange={(e) => setInsuranceEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input 
                      type="url" 
                      placeholder="https://www.insurance.com" 
                      value={insuranceWebsite}
                      onChange={(e) => setInsuranceWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Credit Allowance Limit</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount" 
                      value={creditAllowance}
                      onChange={(e) => setCreditAllowance(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Discount Rate (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="0-100" 
                      value={discountRate}
                      onChange={(e) => setDiscountRate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Textarea 
                      placeholder="Complete address..." 
                      rows={2} 
                      value={insuranceAddress}
                      onChange={(e) => setInsuranceAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={insuranceStatus}
                      onValueChange={setInsuranceStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Contract Start Date</Label>
                    <Input 
                      type="date" 
                      value={contractDate}
                      onChange={(e) => setContractDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pricing Configuration Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Pricing Configuration
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePreviewPDF}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview PDF
                  </Button>
                </div>

                {/* Warning Alert */}
                <Alert className="mb-4 bg-amber-50 border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800">
                    Configure pricing for all departments. Inactive items will not be available for this insurance company.
                  </AlertDescription>
                </Alert>

                {/* Pricing Tabs */}
                <Tabs value={activePricingTab} onValueChange={setActivePricingTab}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="procedures" className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Procedures
                    </TabsTrigger>
                    <TabsTrigger value="laboratory" className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      Laboratory
                    </TabsTrigger>
                    <TabsTrigger value="radiology" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Radiology
                    </TabsTrigger>
                    <TabsTrigger value="pharmacy" className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Pharmacy
                    </TabsTrigger>
                  </TabsList>

                  {/* Procedures Tab */}
                  <TabsContent value="procedures" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead className="w-12">Active</TableHead>
                                <TableHead>Procedure Name</TableHead>
                                <TableHead className="w-32">Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {procedurePrices.filter(p => p.category === 'procedures').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value))}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Laboratory Tab */}
                  <TabsContent value="laboratory" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead className="w-12">Active</TableHead>
                                <TableHead>Test Name</TableHead>
                                <TableHead className="w-32">Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {procedurePrices.filter(p => p.category === 'laboratory').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value))}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Radiology Tab */}
                  <TabsContent value="radiology" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead className="w-12">Active</TableHead>
                                <TableHead>Scan/Imaging Name</TableHead>
                                <TableHead className="w-32">Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {procedurePrices.filter(p => p.category === 'radiology').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value))}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pharmacy Tab */}
                  <TabsContent value="pharmacy" className="mt-4">
                    <Card>
                      <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead className="w-12">Active</TableHead>
                                <TableHead>Medicine Name</TableHead>
                                <TableHead className="w-32">Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {procedurePrices.filter(p => p.category === 'pharmacy').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value))}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setShowAddInsuranceForm(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePreviewPDF}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    toast.success('Insurance company added successfully');
                    setShowAddInsuranceForm(false);
                    setInsuranceName('');
                    setCreditAllowance('');
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Insurance Company
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show insurance list
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Insurance Companies</h2>
            <p className="text-sm text-gray-600 mt-1">Manage insurance companies and policies</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setInsuranceType('insurance');
              setShowAddInsuranceForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Insurance Company
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Policy Prefix</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insuranceData.map((ins) => (
                  <TableRow key={ins.id}>
                    <TableCell className="font-medium">{ins.name}</TableCell>
                    <TableCell className="font-mono text-sm">{ins.policyPrefix}</TableCell>
                    <TableCell>{ins.contactPerson}</TableCell>
                    <TableCell className="text-sm">{ins.phone}</TableCell>
                    <TableCell className="text-sm">{ins.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {ins.discountRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={ins.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {ins.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedInsuranceForPDF(ins);
                            setShowPDFPreview(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedInsuranceForPatients(ins);
                            setShowPatientsList(true);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Patients
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
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

  // ============= RENDER ORGANIZATIONS =============

  const renderOrganizations = () => {
    const organizationData = mockInsurances.filter(ins => ins.type === 'organization');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Corporate Organizations</h2>
            <p className="text-sm text-gray-600 mt-1">Manage corporate partners and organizational accounts</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setInsuranceType('organization');
              setIsAddInsuranceDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account Prefix</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizationData.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="font-mono text-sm">{org.policyPrefix}</TableCell>
                    <TableCell>{org.contactPerson}</TableCell>
                    <TableCell className="text-sm">{org.phone}</TableCell>
                    <TableCell className="text-sm">{org.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {org.discountRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
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

  // ============= RENDER DONORS =============

  const renderDonors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Donation Donors</h2>
          <p className="text-sm text-gray-600 mt-1">Manage hospital donors and donations</p>
        </div>
        <Dialog open={isAddDonorDialogOpen} onOpenChange={setIsAddDonorDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Donor</DialogTitle>
              <DialogDescription>
                Add a new individual or corporate donor to the system
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Donor Type Selection */}
              <div>
                <Label>Donor Type *</Label>
                <Select value={donorType} onValueChange={(value: 'individual' | 'corporate') => setDonorType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select donor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>{donorType === 'individual' ? 'Full Name' : 'Organization Name'} *</Label>
                    <Input 
                      placeholder={donorType === 'individual' ? 'Enter donor name' : 'Enter organization name'} 
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>

                  {donorType === 'individual' && (
                    <div className="col-span-2">
                      <Label>CNIC / National ID</Label>
                      <Input 
                        placeholder="12345-6789012-3" 
                        value={donorCNIC}
                        onChange={(e) => setDonorCNIC(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Phone Number *</Label>
                    <Input 
                      placeholder="+1-555-0000" 
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Email Address *</Label>
                    <Input 
                      type="email" 
                      placeholder="donor@email.com" 
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Address Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Street Address</Label>
                    <Input 
                      placeholder="Enter street address" 
                      value={donorAddress}
                      onChange={(e) => setDonorAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <Input 
                      placeholder="Enter city" 
                      value={donorCity}
                      onChange={(e) => setDonorCity(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Input 
                      placeholder="Enter country" 
                      value={donorCountry}
                      onChange={(e) => setDonorCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Donation Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Donation Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Donated ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={donorTotalDonated}
                      onChange={(e) => setDonorTotalDonated(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Last Donation Date</Label>
                    <Input 
                      type="date" 
                      value={donorLastDonation}
                      onChange={(e) => setDonorLastDonation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Donation Frequency *</Label>
                    <Select value={donorFrequency} onValueChange={(value: 'one-time' | 'monthly' | 'yearly') => setDonorFrequency(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch 
                      checked={donorTaxExempt}
                      onCheckedChange={setDonorTaxExempt}
                    />
                    <Label>Tax Exempt</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Notes */}
              <div>
                <Label>Notes / Comments</Label>
                <Textarea 
                  placeholder="Add any additional notes about this donor..." 
                  rows={3}
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    toast.success('Donor added successfully!');
                    setIsAddDonorDialogOpen(false);
                    // Reset form
                    setDonorName('');
                    setDonorType('individual');
                    setDonorCNIC('');
                    setDonorPhone('');
                    setDonorEmail('');
                    setDonorAddress('');
                    setDonorCity('');
                    setDonorCountry('');
                    setDonorTotalDonated('');
                    setDonorLastDonation('');
                    setDonorFrequency('one-time');
                    setDonorTaxExempt(false);
                    setDonorNotes('');
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Donor
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddDonorDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mockDonors.map((donor) => (
          <Card key={donor.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
                  {donor.type === 'individual' ? (
                    <User className="w-6 h-6 text-red-600" />
                  ) : (
                    <Building2 className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <Badge variant="outline" className={donor.type === 'individual' ? 'bg-blue-50' : 'bg-purple-50'}>
                  {donor.type}
                </Badge>
              </div>

              <h3 className="font-semibold text-lg mb-1">{donor.name}</h3>
              <p className="text-xs text-gray-600 mb-4">Donor ID: {donor.id}</p>

              <div className="space-y-2 mb-4">
                {donor.cnic && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-mono text-xs">{donor.cnic}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{donor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 text-xs">{donor.email}</span>
                </div>
                {donor.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-700 text-xs">
                      {donor.address}{donor.city ? `, ${donor.city}` : ''}{donor.country ? `, ${donor.country}` : ''}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Donated</span>
                  <span className="font-bold text-green-600">${donor.totalDonated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Donation</span>
                  <span className="text-sm font-medium">{donor.lastDonation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Frequency</span>
                  <Badge className="bg-blue-100 text-blue-800 capitalize">
                    {donor.frequency}
                  </Badge>
                </div>
                {donor.taxExempt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      Tax Exempt
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 mt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedDonor(donor);
                      setIsAddPaymentDialogOpen(true);
                    }}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Add Amount
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedDonor(donor);
                      setShowPaymentsPage(true);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Payments
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Donation Payment</DialogTitle>
            <DialogDescription>
              Record a new donation payment from {selectedDonor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Donor Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
                    {selectedDonor?.type === 'individual' ? (
                      <User className="w-6 h-6 text-red-600" />
                    ) : (
                      <Building2 className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedDonor?.name}</h4>
                    <p className="text-sm text-gray-600">Donor ID: {selectedDonor?.id}</p>
                    <p className="text-xs text-gray-500">Total Donated: ${selectedDonor?.totalDonated.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">Payment Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount ($) *</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Payment Date *</Label>
                  <Input 
                    type="date" 
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(paymentMethod === 'bank-transfer' || paymentMethod === 'card' || paymentMethod === 'online') && (
                  <div className="col-span-2">
                    <Label>Transaction ID</Label>
                    <Input 
                      placeholder="Enter transaction ID" 
                      value={paymentTransactionId}
                      onChange={(e) => setPaymentTransactionId(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === 'cheque' && (
                  <>
                    <div>
                      <Label>Cheque Number</Label>
                      <Input 
                        placeholder="Enter cheque number" 
                        value={paymentChequeNumber}
                        onChange={(e) => setPaymentChequeNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Bank Name</Label>
                      <Input 
                        placeholder="Enter bank name" 
                        value={paymentBankName}
                        onChange={(e) => setPaymentBankName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(paymentMethod === 'bank-transfer' && paymentMethod !== 'cheque') && (
                  <div className="col-span-2">
                    <Label>Bank Name</Label>
                    <Input 
                      placeholder="Enter bank name" 
                      value={paymentBankName}
                      onChange={(e) => setPaymentBankName(e.target.value)}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <Label>Purpose / Description *</Label>
                  <Input 
                    placeholder="e.g., Monthly Donation, Event Sponsorship" 
                    value={paymentPurpose}
                    onChange={(e) => setPaymentPurpose(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Add any additional notes..." 
                    rows={2}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  toast.success(`Payment of $${paymentAmount} recorded successfully!`);
                  setIsAddPaymentDialogOpen(false);
                  // Reset form
                  setPaymentAmount('');
                  setPaymentDate('');
                  setPaymentMethod('cash');
                  setPaymentTransactionId('');
                  setPaymentChequeNumber('');
                  setPaymentBankName('');
                  setPaymentPurpose('');
                  setPaymentNotes('');
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Payment
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAddPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Payments Dialog */}
      <Dialog open={isViewPaymentsDialogOpen} onOpenChange={setIsViewPaymentsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              All donation payments from {selectedDonor?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Donor Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Donor Name</p>
                    <p className="font-semibold mt-1">{selectedDonor?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Donated</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      ${selectedDonor?.totalDonated.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Donation</p>
                    <p className="font-semibold mt-1">{selectedDonor?.lastDonation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <Badge className="bg-blue-100 text-blue-800 capitalize mt-1">
                      {selectedDonor?.frequency}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Payments</p>
                      <p className="text-xl font-bold text-green-600">
                        {mockDonationPayments.filter(p => p.donorId === selectedDonor?.id).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Average Payment</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${selectedDonor && mockDonationPayments.filter(p => p.donorId === selectedDonor.id).length > 0 
                          ? (mockDonationPayments.filter(p => p.donorId === selectedDonor.id).reduce((sum, p) => sum + p.amount, 0) / mockDonationPayments.filter(p => p.donorId === selectedDonor.id).length).toLocaleString(undefined, {maximumFractionDigits: 0})
                          : '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Last Payment</p>
                      <p className="text-xl font-bold text-purple-600">
                        ${mockDonationPayments.filter(p => p.donorId === selectedDonor?.id)[0]?.amount.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Payment Records</CardTitle>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDonationPayments
                      .filter(payment => payment.donorId === selectedDonor?.id)
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">{payment.receiptNumber}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.paymentMethod.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="truncate text-sm">{payment.purpose}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Printer className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {mockDonationPayments.filter(p => p.donorId === selectedDonor?.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No payment records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ============= RENDER MESSAGE SETTINGS =============

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Message Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure automated message templates for SMS, Email, and WhatsApp</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddTemplatePage(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Platform Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <Switch defaultChecked />
            </div>
            <h3 className="font-semibold text-lg mb-1">SMS Messages</h3>
            <p className="text-sm text-gray-600 mb-3">Send automated SMS notifications</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Templates:</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sent Today:</span>
                <span className="font-semibold text-green-600">247</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Settings className="w-3 h-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <Switch defaultChecked />
            </div>
            <h3 className="font-semibold text-lg mb-1">Email Messages</h3>
            <p className="text-sm text-gray-600 mb-3">Send automated email notifications</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Templates:</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sent Today:</span>
                <span className="font-semibold text-blue-600">189</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Settings className="w-3 h-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <Switch defaultChecked />
            </div>
            <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
            <p className="text-sm text-gray-600 mb-3">Send automated WhatsApp messages</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Templates:</span>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sent Today:</span>
                <span className="font-semibold text-purple-600">156</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Settings className="w-3 h-3 mr-2" />
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Message Templates with Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Message Templates</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-3 h-3 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockMessages.map((msg) => (
                <div key={msg.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        msg.type === 'sms' ? 'bg-green-100' :
                        msg.type === 'email' ? 'bg-blue-100' :
                        'bg-purple-100'
                      }`}>
                        {msg.type === 'sms' && <Smartphone className="w-5 h-5 text-green-600" />}
                        {msg.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                        {msg.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{msg.name}</h4>
                        <p className="text-xs text-gray-600">Trigger: {msg.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={msg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {msg.status}
                      </Badge>
                      <Badge variant="outline" className={
                        msg.type === 'sms' ? 'bg-green-50 text-green-700' :
                        msg.type === 'email' ? 'bg-blue-50 text-blue-700' :
                        'bg-purple-50 text-purple-700'
                      }>
                        {msg.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{msg.content}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="w-3 h-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 ml-auto">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Message Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">WhatsApp Preview</CardTitle>
              <CardDescription>See how your message will appear</CardDescription>
            </CardHeader>
            <CardContent>
              {/* WhatsApp-style Preview */}
              <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="bg-white rounded-lg p-3 shadow-sm mb-2">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Hospital className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">City Hospital</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Incoming message */}
                    <div className="bg-white border rounded-lg rounded-tl-none p-3 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Hello {'{patient_name}'}, this is a reminder for your appointment tomorrow at {'{time}'} with {'{doctor_name}'}.
                      </p>
                      <p className="text-xs text-gray-400 mt-2 text-right">12:53 PM</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <p className="text-xs text-gray-600">🔒 End-to-end encrypted</p>
                </div>
              </div>

              {/* SMS Preview */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-sm">SMS Preview</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-500 mb-2">From: HOSPITAL</p>
                  <p className="text-sm text-gray-700">
                    Dear {'{patient_name}'}, your appointment with {'{doctor_name}'} is confirmed for {'{date}'} at {'{time}'}. Thank you!
                  </p>
                </div>
              </div>

              {/* Email Preview */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-sm">Email Preview</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-500 mb-1">Subject: Lab Results Ready</p>
                  <Separator className="my-2" />
                  <p className="text-sm text-gray-700">
                    Dear {'{patient_name}'}, your lab results are ready. Please visit the hospital to collect your reports.
                  </p>
                </div>
              </div>

              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Send Test Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variables and Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Available Variables
            </CardTitle>
            <CardDescription>Use these variables in your message templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { var: '{patient_name}', desc: 'Patient full name' },
                { var: '{doctor_name}', desc: 'Doctor name' },
                { var: '{date}', desc: 'Appointment date' },
                { var: '{time}', desc: 'Appointment time' },
                { var: '{hospital_name}', desc: 'Hospital name' },
                { var: '{department}', desc: 'Department name' },
                { var: '{bill_amount}', desc: 'Bill amount' },
                { var: '{appointment_id}', desc: 'Appointment ID' },
                { var: '{patient_id}', desc: 'Patient ID/UHID' },
                { var: '{contact}', desc: 'Patient contact' },
                { var: '{doctor_dept}', desc: 'Doctor department' },
                { var: '{room_number}', desc: 'Room/Bed number' }
              ].map((item) => (
                <div key={item.var} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                  <p className="font-mono text-xs text-blue-600 mb-1">{item.var}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-600" />
                  Message Triggers
                </CardTitle>
                <CardDescription>Automated message triggers</CardDescription>
              </div>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setShowTemplatesListPage(true)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View All Templates
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Appointment Booked', count: 3, icon: Calendar },
                { name: 'Appointment Reminder (1 day)', count: 2, icon: Clock },
                { name: 'Appointment Reminder (2 hours)', count: 1, icon: AlertCircle },
                { name: 'Lab Results Ready', count: 1, icon: FlaskConical },
                { name: 'Prescription Ready', count: 1, icon: Pill },
                { name: 'Bill Generated', count: 2, icon: DollarSign },
                { name: 'Discharge Summary', count: 1, icon: FileText },
                { name: 'Follow-up Reminder', count: 1, icon: Calendar }
              ].map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <div key={trigger.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{trigger.name}</span>
                    </div>
                    <Badge variant="outline">{trigger.count} template{trigger.count > 1 ? 's' : ''}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            Messaging Statistics (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Smartphone className="w-6 h-6 text-green-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">1,247</p>
              <p className="text-sm text-gray-600">SMS Sent</p>
              <p className="text-xs text-green-600 mt-1">+12% from last week</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Mail className="w-6 h-6 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">892</p>
              <p className="text-sm text-gray-600">Emails Sent</p>
              <p className="text-xs text-blue-600 mt-1">+8% from last week</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">634</p>
              <p className="text-sm text-gray-600">WhatsApp Sent</p>
              <p className="text-xs text-purple-600 mt-1">+15% from last week</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-800">98%</Badge>
              </div>
              <p className="text-2xl font-bold text-orange-900">2,712</p>
              <p className="text-sm text-gray-600">Delivery Rate</p>
              <p className="text-xs text-orange-600 mt-1">Total messages delivered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Recipients Configuration */}
      <MessageRecipientsConfig />
    </div>
  );

  // ============= RENDER REFERRAL HOSPITALS =============

  const renderReferrals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Referral Hospitals</h2>
          <p className="text-sm text-gray-600 mt-1">Manage referral and partner hospitals</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowReferredPatientsPage(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            List of Patients
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddHospitalPage(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hospital
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockReferrals.map((hospital) => (
          <Card key={hospital.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                  <Hospital className="w-8 h-8 text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{hospital.name}</h3>
                      <p className="text-sm text-gray-600">{hospital.type}</p>
                    </div>
                    <Badge className={hospital.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {hospital.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{hospital.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{hospital.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{hospital.contactPerson}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedHospitalForPatients(hospital.id);
                        setShowReferredPatientsPage(true);
                      }}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      List of Patients
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 ml-auto">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============= RENDER DISCOUNT =============

  const renderDiscount = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Discount Management</h2>
          <p className="text-sm text-gray-600 mt-1">Configure discount rules and policies</p>
        </div>
        <Button className="bg-[#2F80ED] hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Discount Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            name: 'Senior Citizen Discount', 
            type: 'Percentage', 
            value: '10%', 
            category: 'Patient Category',
            status: 'active',
            color: 'green'
          },
          { 
            name: 'Emergency Discount', 
            type: 'Percentage', 
            value: '5%', 
            category: 'Service Type',
            status: 'active',
            color: 'blue'
          },
          { 
            name: 'Staff Discount', 
            type: 'Percentage', 
            value: '20%', 
            category: 'User Type',
            status: 'active',
            color: 'purple'
          },
          { 
            name: 'Bulk Lab Test Discount', 
            type: 'Fixed Amount', 
            value: 'PKR 500', 
            category: 'Laboratory',
            status: 'active',
            color: 'orange'
          },
          { 
            name: 'Insurance Co-pay', 
            type: 'Percentage', 
            value: '15%', 
            category: 'Insurance',
            status: 'inactive',
            color: 'gray'
          },
          { 
            name: 'Pharmacy Discount', 
            type: 'Percentage', 
            value: '8%', 
            category: 'Pharmacy',
            status: 'active',
            color: 'teal'
          }
        ].map((discount, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${discount.color}-50`}>
                  <Percent className={`w-6 h-6 text-${discount.color}-600`} />
                </div>
                <Badge variant={discount.status === 'active' ? 'default' : 'secondary'} className={discount.status === 'active' ? 'bg-[#27AE60] hover:bg-green-700' : ''}>
                  {discount.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{discount.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{discount.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold text-[#2F80ED]">{discount.value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{discount.category}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============= RENDER CHARGES LIST =============

  const renderCharges = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Charges List</h2>
          <p className="text-sm text-gray-600 mt-1">Manage hospital service charges and fees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#2F80ED] hover:bg-blue-600" onClick={() => setIsAddChargeDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Charge
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Service Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Base Charge</TableHead>
                    <TableHead className="font-semibold">Tax</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Consultation Fee', category: 'OPD', base: 'PKR 1,500', tax: '5%', total: 'PKR 1,575', status: 'active' },
                    { name: 'Emergency Visit', category: 'Emergency', base: 'PKR 3,000', tax: '5%', total: 'PKR 3,150', status: 'active' },
                    { name: 'ICU Per Day', category: 'IPD', base: 'PKR 15,000', tax: '5%', total: 'PKR 15,750', status: 'active' },
                    { name: 'Private Room', category: 'IPD', base: 'PKR 5,000', tax: '5%', total: 'PKR 5,250', status: 'active' },
                    { name: 'Operation Theatre', category: 'Surgery', base: 'PKR 25,000', tax: '8%', total: 'PKR 27,000', status: 'active' },
                    { name: 'Ambulance Service', category: 'Transport', base: 'PKR 2,000', tax: '5%', total: 'PKR 2,100', status: 'active' }
                  ].map((charge, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{charge.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{charge.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">{charge.base}</TableCell>
                      <TableCell>{charge.tax}</TableCell>
                      <TableCell className="font-semibold text-[#2F80ED]">{charge.total}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#27AE60] hover:bg-green-700">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============= RENDER EXPENSE CATEGORIES =============

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Expense Categories</h2>
          <p className="text-sm text-gray-600 mt-1">Organize and manage hospital expense categories</p>
        </div>
        <Button className="bg-[#2F80ED] hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Salaries & Wages', icon: Users, count: 245, budget: 'PKR 5,000,000', spent: 'PKR 4,200,000', percentage: 84, color: 'blue' },
          { name: 'Medical Supplies', icon: Pill, count: 89, budget: 'PKR 2,000,000', spent: 'PKR 1,650,000', percentage: 82.5, color: 'green' },
          { name: 'Equipment Maintenance', icon: Settings, count: 34, budget: 'PKR 800,000', spent: 'PKR 520,000', percentage: 65, color: 'purple' },
          { name: 'Utilities', icon: DollarSign, count: 12, budget: 'PKR 500,000', spent: 'PKR 410,000', percentage: 82, color: 'orange' },
          { name: 'Laboratory Supplies', icon: FlaskConical, count: 67, budget: 'PKR 1,200,000', spent: 'PKR 980,000', percentage: 81.6, color: 'teal' },
          { name: 'Administrative', icon: Briefcase, count: 156, budget: 'PKR 600,000', spent: 'PKR 450,000', percentage: 75, color: 'indigo' }
        ].map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${category.color}-50`}>
                    <Icon className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                  <Badge variant="secondary">{category.count} items</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold text-gray-900">{category.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold text-[#2F80ED]">{category.spent}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Utilization</span>
                      <span className="font-semibold text-gray-900">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${category.percentage > 90 ? 'bg-red-500' : category.percentage > 80 ? 'bg-yellow-500' : 'bg-[#27AE60]'}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ============= RENDER MESSAGE TEMPLATES =============

  const renderMessageTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Message Templates</h2>
          <p className="text-sm text-gray-600 mt-1">Pre-defined templates for patient communication</p>
        </div>
        <Button className="bg-[#2F80ED] hover:bg-blue-600" onClick={() => setShowAddTemplatePage(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4">
        {[
          { 
            name: 'Appointment Confirmation', 
            type: 'SMS', 
            category: 'Appointments',
            message: 'Dear [Patient Name], your appointment is confirmed for [Date] at [Time] with Dr. [Doctor Name].',
            usage: 1245,
            lastUsed: '2 hours ago'
          },
          { 
            name: 'Lab Results Ready', 
            type: 'Email', 
            category: 'Laboratory',
            message: 'Hello [Patient Name], your lab results are ready. Please visit the hospital or log in to view them online.',
            usage: 892,
            lastUsed: '5 hours ago'
          },
          { 
            name: 'Payment Receipt', 
            type: 'SMS', 
            category: 'Billing',
            message: 'Thank you for your payment of PKR [Amount]. Receipt #[Receipt No]. For queries, call [Phone].',
            usage: 2156,
            lastUsed: '1 hour ago'
          },
          { 
            name: 'Prescription Reminder', 
            type: 'WhatsApp', 
            category: 'Pharmacy',
            message: 'Hi [Patient Name], this is a reminder to take your medication [Medicine Name] as prescribed.',
            usage: 654,
            lastUsed: '3 hours ago'
          }
        ].map((template, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <Badge variant="outline" className="text-[#2F80ED] border-[#2F80ED]">{template.type}</Badge>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 max-w-3xl">{template.message}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>{template.usage} sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last used: {template.lastUsed}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============= RENDER LAB TRACKINGS =============

  const renderLabTrackings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Lab Trackings</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and track laboratory test workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-[#2F80ED] hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Tracking
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {[
          { 
            trackingId: 'LAB-2024-001', 
            patientName: 'Ahmed Khan',
            testName: 'Complete Blood Count (CBC)',
            status: 'Sample Collected',
            priority: 'Normal',
            requestedBy: 'Dr. Sarah Ahmed',
            requestedAt: '10:30 AM',
            estimatedTime: '2 hours',
            stage: 2
          },
          { 
            trackingId: 'LAB-2024-002', 
            patientName: 'Fatima Ali',
            testName: 'Lipid Profile',
            status: 'In Progress',
            priority: 'Urgent',
            requestedBy: 'Dr. Hassan Ali',
            requestedAt: '09:15 AM',
            estimatedTime: '1 hour',
            stage: 3
          },
          { 
            trackingId: 'LAB-2024-003', 
            patientName: 'Usman Tariq',
            testName: 'HbA1c Test',
            status: 'Results Ready',
            priority: 'Normal',
            requestedBy: 'Dr. Maria Khan',
            requestedAt: '08:00 AM',
            estimatedTime: 'Completed',
            stage: 5
          }
        ].map((tracking, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{tracking.trackingId}</h3>
                    <Badge className={tracking.priority === 'Urgent' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500'}>
                      {tracking.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[#2F80ED] border-[#2F80ED]">
                      {tracking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Patient: </span>
                      <span className="font-medium text-gray-900">{tracking.patientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Test: </span>
                      <span className="font-medium text-gray-900">{tracking.testName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Requested By: </span>
                      <span className="font-medium text-gray-900">{tracking.requestedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time: </span>
                      <span className="font-medium text-gray-900">{tracking.requestedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{tracking.estimatedTime}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((stage) => (
                    <div 
                      key={stage}
                      className={`h-2 flex-1 rounded-full ${stage <= tracking.stage ? 'bg-[#27AE60]' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Requested</span>
                  <span>Collected</span>
                  <span>Processing</span>
                  <span>Analyzed</span>
                  <span>Ready</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" variant="outline">
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Update Status
                </Button>
                <Button size="sm" variant="outline">
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============= RENDER TEMPLATES =============

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Document Templates</h2>
          <p className="text-sm text-gray-600 mt-1">Manage hospital document and form templates</p>
        </div>
        <Button className="bg-[#2F80ED] hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Discharge Summary', icon: FileCheck, category: 'IPD', count: 324, color: 'blue' },
          { name: 'Prescription Form', icon: FileText, category: 'OPD', count: 1256, color: 'green' },
          { name: 'Lab Report', icon: FlaskConical, category: 'Laboratory', count: 892, color: 'purple' },
          { name: 'Consent Form', icon: FileSpreadsheet, category: 'Legal', count: 445, color: 'orange' },
          { name: 'Medical Certificate', icon: FileCheck, category: 'OPD', count: 678, color: 'teal' },
          { name: 'Referral Letter', icon: ExternalLink, category: 'OPD', count: 234, color: 'indigo' }
        ].map((template, index) => {
          const Icon = template.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${template.color}-50`}>
                    <Icon className={`w-6 h-6 text-${template.color}-600`} />
                  </div>
                  <Badge variant="secondary">{template.count} used</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Category: {template.category}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ============= RENDER PATIENT FEEDBACK =============

  const renderPatientFeedback = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Patient Feedback</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor patient satisfaction and feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">4.6</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">1,247</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive</p>
                <p className="text-3xl font-bold text-[#27AE60] mt-1">92%</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">78%</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest patient reviews and comments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                patient: 'Ahmed Khan', 
                department: 'Cardiology',
                rating: 5,
                comment: 'Excellent service! Dr. Sarah was very professional and caring.',
                date: '2 hours ago',
                sentiment: 'positive'
              },
              { 
                patient: 'Fatima Ali', 
                department: 'Laboratory',
                rating: 4,
                comment: 'Quick service but waiting area could be improved.',
                date: '5 hours ago',
                sentiment: 'positive'
              },
              { 
                patient: 'Usman Tariq', 
                department: 'Emergency',
                rating: 5,
                comment: 'Staff was incredibly helpful during my emergency visit.',
                date: '1 day ago',
                sentiment: 'positive'
              },
              { 
                patient: 'Ayesha Hassan', 
                department: 'Pharmacy',
                rating: 3,
                comment: 'Long waiting times at the pharmacy counter.',
                date: '2 days ago',
                sentiment: 'neutral'
              }
            ].map((feedback, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{feedback.patient}</h4>
                      <Badge variant="outline">{feedback.department}</Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{feedback.comment}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">{feedback.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= MAIN RENDER =============

  const renderContent = () => {
    switch (activeSection) {
      case 'forms':
        return renderForms();
      case 'timings':
        return renderTimings();
      case 'departments':
        return renderDepartments();
      case 'insurances':
        return renderInsurances();
      case 'organizations':
        return renderOrganizations();
      case 'donors':
        return renderDonors();
      case 'discount':
        return renderDiscount();
      case 'charges':
        return renderCharges();
      case 'expenses':
        return renderExpenses();
      case 'message-templates':
        return renderMessageTemplates();
      case 'lab-trackings':
        return renderLabTrackings();
      case 'templates':
        return renderTemplates();
      case 'patient-feedback':
        return renderPatientFeedback();
      case 'messages':
        return renderMessages();
      case 'referrals':
        return renderReferrals();
      default:
        return renderForms();
    }
  };

  // Show Payments Page if requested
  if (showPaymentsPage) {
    return (
      <DonationPayments 
        onBack={() => {
          setShowPaymentsPage(false);
          setSelectedDonor(null);
        }}
        selectedDonorId={selectedDonor?.id}
      />
    );
  }

  // Show Add Message Template Page if requested
  if (showAddTemplatePage) {
    return (
      <AddMessageTemplatePage 
        onBack={() => setShowAddTemplatePage(false)}
      />
    );
  }

  // Show Add Referral Hospital Page if requested
  if (showAddHospitalPage) {
    return (
      <AddReferralHospital 
        onBack={() => setShowAddHospitalPage(false)}
      />
    );
  }

  // Show Referred Patients List if requested
  if (showReferredPatientsPage) {
    return (
      <ReferredPatientsList 
        onBack={() => {
          setShowReferredPatientsPage(false);
          setSelectedHospitalForPatients(undefined);
        }}
        selectedHospitalId={selectedHospitalForPatients}
      />
    );
  }

  // Show Message Templates List if requested
  if (showTemplatesListPage) {
    return (
      <MessageTemplatesList 
        onBack={() => setShowTemplatesListPage(false)}
        onAddTemplate={() => {
          setShowTemplatesListPage(false);
          setShowAddTemplatePage(true);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            Preferences
          </h1>
          <p className="text-sm text-gray-600 mt-1">Hospital settings & configuration</p>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Add Charge Dialog */}
      <Dialog open={isAddChargeDialogOpen} onOpenChange={setIsAddChargeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50">
                <Receipt className="w-6 h-6 text-[#2F80ED]" />
              </div>
              Add New Charge
            </DialogTitle>
            <DialogDescription>
              Create a new service charge for hospital billing system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Info className="w-4 h-4 text-[#2F80ED]" />
                <h3 className="font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="charge-name">Service Name *</Label>
                  <Input 
                    id="charge-name"
                    value={chargeName}
                    onChange={(e) => setChargeName(e.target.value)}
                    placeholder="e.g., Consultation Fee"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="charge-code">Service Code *</Label>
                  <Input 
                    id="charge-code"
                    value={chargeCode}
                    onChange={(e) => setChargeCode(e.target.value)}
                    placeholder="e.g., SVC-001"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="charge-category">Category *</Label>
                  <Select value={chargeCategory} onValueChange={setChargeCategory}>
                    <SelectTrigger id="charge-category" className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opd">OPD (Outpatient Department)</SelectItem>
                      <SelectItem value="ipd">IPD (Inpatient Department)</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="charge-department">Department</Label>
                  <Select value={chargeDepartment} onValueChange={setChargeDepartment}>
                    <SelectTrigger id="charge-department" className="mt-2">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="obgyn">Obstetrics & Gynecology</SelectItem>
                      <SelectItem value="surgery">General Surgery</SelectItem>
                      <SelectItem value="internal">Internal Medicine</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="charge-description">Description</Label>
                <Textarea 
                  id="charge-description"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  placeholder="Brief description of the service..."
                  className="mt-2 min-h-[80px]"
                />
              </div>
            </div>

            {/* Pricing Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <DollarSign className="w-4 h-4 text-[#27AE60]" />
                <h3 className="font-semibold text-gray-900">Pricing Information</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="charge-base">Base Amount (PKR) *</Label>
                  <Input 
                    id="charge-base"
                    type="number"
                    value={chargeBaseAmount}
                    onChange={(e) => setChargeBaseAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="charge-tax">Tax Rate (%)</Label>
                  <Input 
                    id="charge-tax"
                    type="number"
                    value={chargeTaxRate}
                    onChange={(e) => setChargeTaxRate(e.target.value)}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Total Amount (PKR)</Label>
                  <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span className="font-semibold text-[#2F80ED]">
                      {chargeBaseAmount && chargeTaxRate 
                        ? (parseFloat(chargeBaseAmount) + (parseFloat(chargeBaseAmount) * parseFloat(chargeTaxRate) / 100)).toFixed(2)
                        : chargeBaseAmount || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="charge-min">Minimum Amount (PKR)</Label>
                  <Input 
                    id="charge-min"
                    type="number"
                    value={chargeMinAmount}
                    onChange={(e) => setChargeMinAmount(e.target.value)}
                    placeholder="Optional"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">For variable pricing</p>
                </div>
                <div>
                  <Label htmlFor="charge-max">Maximum Amount (PKR)</Label>
                  <Input 
                    id="charge-max"
                    type="number"
                    value={chargeMaxAmount}
                    onChange={(e) => setChargeMaxAmount(e.target.value)}
                    placeholder="Optional"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">For variable pricing</p>
                </div>
              </div>
            </div>

            {/* Service Configuration Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Settings className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Service Configuration</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select value={chargeServiceType} onValueChange={setChargeServiceType}>
                    <SelectTrigger id="service-type" className="mt-2">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical Service</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
                      <SelectItem value="procedure">Medical Procedure</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="room">Room Charge</SelectItem>
                      <SelectItem value="equipment">Equipment Usage</SelectItem>
                      <SelectItem value="consumable">Consumable Item</SelectItem>
                      <SelectItem value="administrative">Administrative Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billing-frequency">Billing Frequency</Label>
                  <Select value={chargeBillingFrequency} onValueChange={setChargeBillingFrequency}>
                    <SelectTrigger id="billing-frequency" className="mt-2">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One Time</SelectItem>
                      <SelectItem value="per-day">Per Day</SelectItem>
                      <SelectItem value="per-visit">Per Visit</SelectItem>
                      <SelectItem value="per-hour">Per Hour</SelectItem>
                      <SelectItem value="per-session">Per Session</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Applicable To</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {['OPD Patients', 'IPD Patients', 'Emergency Patients', 'Insurance Patients', 'Corporate Patients', 'Walk-in Patients'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`applicable-${option}`}
                        checked={chargeApplicableTo.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setChargeApplicableTo([...chargeApplicableTo, option]);
                          } else {
                            setChargeApplicableTo(chargeApplicableTo.filter(item => item !== option));
                          }
                        }}
                        className="w-4 h-4 text-[#2F80ED] rounded border-gray-300 focus:ring-[#2F80ED]"
                      />
                      <label htmlFor={`applicable-${option}`} className="text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Options Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ToggleLeft className="w-4 h-4 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Additional Options</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Active Status</h4>
                    <p className="text-sm text-gray-600 mt-1">Enable this charge for billing</p>
                  </div>
                  <Switch 
                    checked={chargeStatus === 'active'}
                    onCheckedChange={(checked) => setChargeStatus(checked ? 'active' : 'inactive')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Emergency Service</h4>
                    <p className="text-sm text-gray-600 mt-1">Mark as emergency/urgent service</p>
                  </div>
                  <Switch 
                    checked={chargeIsEmergency}
                    onCheckedChange={setChargeIsEmergency}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Requires Approval</h4>
                    <p className="text-sm text-gray-600 mt-1">Service requires admin/doctor approval before billing</p>
                  </div>
                  <Switch 
                    checked={chargeRequiresApproval}
                    onCheckedChange={setChargeRequiresApproval}
                  />
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <Card className="border-2 border-[#2F80ED] bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                  Charge Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-900">{chargeName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-medium text-gray-900">{chargeCode || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{chargeCategory || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-semibold text-gray-900">PKR {chargeBaseAmount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium text-gray-900">{chargeTaxRate || '0'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-[#2F80ED]">
                      PKR {chargeBaseAmount && chargeTaxRate 
                        ? (parseFloat(chargeBaseAmount) + (parseFloat(chargeBaseAmount) * parseFloat(chargeTaxRate) / 100)).toFixed(2)
                        : chargeBaseAmount || '0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddChargeDialogOpen(false);
                // Reset form
                setChargeName('');
                setChargeCode('');
                setChargeCategory('');
                setChargeDepartment('');
                setChargeBaseAmount('');
                setChargeTaxRate('');
                setChargeDescription('');
                setChargeServiceType('');
                setChargeBillingFrequency('one-time');
                setChargeApplicableTo([]);
                setChargeMinAmount('');
                setChargeMaxAmount('');
                setChargeIsEmergency(false);
                setChargeRequiresApproval(false);
                setChargeStatus('active');
              }}
              className="w-32"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  toast.success('Charge saved as draft');
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                className="bg-[#27AE60] hover:bg-green-700"
                onClick={() => {
                  if (!chargeName || !chargeCode || !chargeCategory || !chargeBaseAmount) {
                    toast.error('Please fill all required fields');
                    return;
                  }
                  toast.success('Charge added successfully!');
                  setIsAddChargeDialogOpen(false);
                  // Reset form
                  setChargeName('');
                  setChargeCode('');
                  setChargeCategory('');
                  setChargeDepartment('');
                  setChargeBaseAmount('');
                  setChargeTaxRate('');
                  setChargeDescription('');
                  setChargeServiceType('');
                  setChargeBillingFrequency('one-time');
                  setChargeApplicableTo([]);
                  setChargeMinAmount('');
                  setChargeMaxAmount('');
                  setChargeIsEmergency(false);
                  setChargeRequiresApproval(false);
                  setChargeStatus('active');
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Insurance/Organization Dialog */}
      <Dialog open={isAddInsuranceDialogOpen} onOpenChange={setIsAddInsuranceDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Insurance/Organization</DialogTitle>
            <DialogDescription>
              Configure pricing for procedures, laboratory tests, radiology, and pharmacy items for this {insuranceType === 'insurance' ? 'insurance company' : 'organization'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Name</Label>
                <Input 
                  value={insuranceName}
                  onChange={(e) => setInsuranceName(e.target.value)}
                  placeholder="EFU"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={insuranceType} onValueChange={setInsuranceType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Credit Allowance</Label>
                <Input 
                  type="number"
                  value={creditAllowance}
                  onChange={(e) => setCreditAllowance(e.target.value)}
                  placeholder="10000"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Pricing Tabs */}
            <Tabs value={activePricingTab} onValueChange={setActivePricingTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="procedures">📋 Procedures</TabsTrigger>
                <TabsTrigger value="laboratory">🧪 Laboratory</TabsTrigger>
                <TabsTrigger value="radiology">🏥 Radiology</TabsTrigger>
                <TabsTrigger value="pharmacy">💊 Pharmacy</TabsTrigger>
              </TabsList>

              {/* Warning Message */}
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  To reflect all the prices in Invoice, Please try switching all tabs, i.e. Laboratory, Radiology, Pharmacy and then click Add.
                </AlertDescription>
              </Alert>

              {/* Procedures Tab */}
              <TabsContent value="procedures" className="mt-4">
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-12 gap-4">
                    <div className="col-span-7 font-medium text-sm">PROCEDURE NAME</div>
                    <div className="col-span-3 font-medium text-sm">PRICE</div>
                    <div className="col-span-2 font-medium text-sm text-right">ACTION</div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {procedurePrices.filter(p => p.category === 'procedures').map((proc) => (
                      <div key={proc.id} className="px-4 py-3 border-b grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                        <div className="col-span-7 text-sm">{proc.name}</div>
                        <div className="col-span-3">
                          <Input 
                            type="number"
                            value={proc.price}
                            onChange={(e) => handlePriceChange(proc.id, parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Switch 
                            checked={proc.active}
                            onCheckedChange={() => handleActiveToggle(proc.id)}
                          />
                          <span className="text-xs text-gray-600">{proc.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Laboratory Tab */}
              <TabsContent value="laboratory" className="mt-4">
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-12 gap-4">
                    <div className="col-span-7 font-medium text-sm">TEST NAME</div>
                    <div className="col-span-3 font-medium text-sm">PRICE</div>
                    <div className="col-span-2 font-medium text-sm text-right">ACTION</div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {procedurePrices.filter(p => p.category === 'laboratory').map((proc) => (
                      <div key={proc.id} className="px-4 py-3 border-b grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                        <div className="col-span-7 text-sm">{proc.name}</div>
                        <div className="col-span-3">
                          <Input 
                            type="number"
                            value={proc.price}
                            onChange={(e) => handlePriceChange(proc.id, parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Switch 
                            checked={proc.active}
                            onCheckedChange={() => handleActiveToggle(proc.id)}
                          />
                          <span className="text-xs text-gray-600">{proc.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Radiology Tab */}
              <TabsContent value="radiology" className="mt-4">
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-12 gap-4">
                    <div className="col-span-7 font-medium text-sm">IMAGING NAME</div>
                    <div className="col-span-3 font-medium text-sm">PRICE</div>
                    <div className="col-span-2 font-medium text-sm text-right">ACTION</div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {procedurePrices.filter(p => p.category === 'radiology').map((proc) => (
                      <div key={proc.id} className="px-4 py-3 border-b grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                        <div className="col-span-7 text-sm">{proc.name}</div>
                        <div className="col-span-3">
                          <Input 
                            type="number"
                            value={proc.price}
                            onChange={(e) => handlePriceChange(proc.id, parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Switch 
                            checked={proc.active}
                            onCheckedChange={() => handleActiveToggle(proc.id)}
                          />
                          <span className="text-xs text-gray-600">{proc.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Pharmacy Tab */}
              <TabsContent value="pharmacy" className="mt-4">
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-12 gap-4">
                    <div className="col-span-7 font-medium text-sm">MEDICINE NAME</div>
                    <div className="col-span-3 font-medium text-sm">PRICE</div>
                    <div className="col-span-2 font-medium text-sm text-right">ACTION</div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {procedurePrices.filter(p => p.category === 'pharmacy').map((proc) => (
                      <div key={proc.id} className="px-4 py-3 border-b grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                        <div className="col-span-7 text-sm">{proc.name}</div>
                        <div className="col-span-3">
                          <Input 
                            type="number"
                            value={proc.price}
                            onChange={(e) => handlePriceChange(proc.id, parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Switch 
                            checked={proc.active}
                            onCheckedChange={() => handleActiveToggle(proc.id)}
                          />
                          <span className="text-xs text-gray-600">{proc.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline"
                onClick={handlePreviewPDF}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Preview PDF
              </Button>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setIsAddInsuranceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Add {insuranceType === 'insurance' ? 'Insurance' : 'Organization'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview */}
      {showPDFPreview && (
        <InsurancePDFPreview
          insuranceName={selectedInsuranceForPDF ? selectedInsuranceForPDF.name : insuranceName}
          policyPrefix={selectedInsuranceForPDF ? selectedInsuranceForPDF.policyPrefix : policyPrefix}
          contactPerson={selectedInsuranceForPDF ? selectedInsuranceForPDF.contactPerson : contactPerson}
          phone={selectedInsuranceForPDF ? selectedInsuranceForPDF.phone : insurancePhone}
          email={selectedInsuranceForPDF ? selectedInsuranceForPDF.email : insuranceEmail}
          website={selectedInsuranceForPDF ? (selectedInsuranceForPDF.website || '') : insuranceWebsite}
          address={selectedInsuranceForPDF ? (selectedInsuranceForPDF.address || '') : insuranceAddress}
          creditAllowance={selectedInsuranceForPDF ? (selectedInsuranceForPDF.creditAllowance ? selectedInsuranceForPDF.creditAllowance.toString() : '100000') : creditAllowance}
          discountRate={selectedInsuranceForPDF ? (selectedInsuranceForPDF.discountRate ? selectedInsuranceForPDF.discountRate.toString() : '0') : discountRate}
          status={selectedInsuranceForPDF ? selectedInsuranceForPDF.status : insuranceStatus}
          contractDate={selectedInsuranceForPDF ? (selectedInsuranceForPDF.contractDate || new Date().toISOString().split('T')[0]) : contractDate}
          procedurePrices={procedurePrices}
          onClose={() => {
            setShowPDFPreview(false);
            setSelectedInsuranceForPDF(null);
          }}
        />
      )}

      {/* Patients List Dialog */}
      <Dialog open={showPatientsList} onOpenChange={setShowPatientsList}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div>Patients Covered by {selectedInsuranceForPatients?.name}</div>
                <p className="text-sm font-normal text-gray-600 mt-1">
                  View all patients enrolled under this insurance plan
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Complete list of patients covered under this insurance policy with detailed information
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {(() => {
              const filteredPatients = mockInsurancePatients.filter(
                p => p.insuranceId === selectedInsuranceForPatients?.id
              );

              const activePatients = filteredPatients.filter(p => p.status === 'active').length;
              const expiredPatients = filteredPatients.filter(p => p.status === 'expired').length;
              const totalClaimed = filteredPatients.reduce((sum, p) => sum + p.claimedAmount, 0);

              return (
                <div className="space-y-4 h-full flex flex-col">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="border-0 shadow-sm bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Patients</p>
                            <p className="text-2xl font-bold text-blue-700">{filteredPatients.length}</p>
                          </div>
                          <Users className="w-8 h-8 text-blue-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Active Policies</p>
                            <p className="text-2xl font-bold text-green-700">{activePatients}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Expired</p>
                            <p className="text-2xl font-bold text-orange-700">{expiredPatients}</p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-orange-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Claims</p>
                            <p className="text-2xl font-bold text-purple-700">${totalClaimed.toLocaleString()}</p>
                          </div>
                          <DollarSign className="w-8 h-8 text-purple-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Patients Table */}
                  <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                      <ScrollArea className="flex-1">
                        <Table>
                          <TableHeader className="sticky top-0 bg-gray-50 z-10">
                            <TableRow>
                              <TableHead>UHID</TableHead>
                              <TableHead>Patient Name</TableHead>
                              <TableHead>Age/Gender</TableHead>
                              <TableHead>Policy Number</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Coverage</TableHead>
                              <TableHead>Claims</TableHead>
                              <TableHead>Last Visit</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPatients.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                  <div className="flex flex-col items-center gap-2">
                                    <Users className="w-12 h-12 text-gray-300" />
                                    <p>No patients found for this insurance company</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredPatients.map((patient) => (
                                <TableRow key={patient.id} className="hover:bg-gray-50">
                                  <TableCell className="font-mono text-sm font-medium">
                                    {patient.uhid}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{patient.name}</p>
                                        <p className="text-xs text-gray-500">{patient.email}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {patient.age} yrs / {patient.gender}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {patient.policyNumber}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {patient.phone}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-semibold text-green-700">
                                        ${patient.coverageAmount.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Until {new Date(patient.policyEndDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-semibold">{patient.totalClaims} claims</p>
                                      <p className="text-xs text-blue-600">
                                        ${patient.claimedAmount.toLocaleString()}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {new Date(patient.lastVisit).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        patient.status === 'active'
                                          ? 'bg-green-100 text-green-800'
                                          : patient.status === 'expired'
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }
                                    >
                                      {patient.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowPatientsList(false);
                setSelectedInsuranceForPatients(null);
              }}
            >
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Patient List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}