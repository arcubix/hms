/**
 * Emergency Patient List & Registration
 * 
 * Features:
 * - Comprehensive patient list with all ER patients
 * - Advanced search and filtering
 * - ESI triage level indicators
 * - Real-time status tracking
 * - Registration dialog for new emergency patients
 * - Quick triage assessment
 * - Vital signs capture
 * - Patient demographics
 * - Chief complaint documentation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import {
  Ambulance,
  Activity,
  Heart,
  AlertCircle,
  Clock,
  Users,
  User,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Printer,
  Send,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Thermometer,
  Droplet,
  Wind,
  Gauge,
  Timer,
  ClipboardList,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  HeartPulse,
  PersonStanding,
  Baby,
  Wheelchair,
  Siren,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

type ESILevel = 1 | 2 | 3 | 4 | 5;

interface EmergencyPatient {
  id: string;
  erNumber: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  uhid?: string;
  
  // Triage Info
  esiLevel: ESILevel;
  chiefComplaint: string;
  arrivalTime: string;
  arrivalDate: string;
  arrivalMode: 'walk-in' | 'ambulance' | 'police' | 'referral';
  
  // Vitals
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    painLevel: number; // 0-10
    gcs?: number; // Glasgow Coma Scale
  };
  
  // Status
  status: 'waiting' | 'in-treatment' | 'awaiting-results' | 'critical' | 'admitted' | 'discharged';
  location: string; // ER-1, Trauma Bay 1, etc.
  assignedDoctor?: string;
  assignedNurse?: string;
  
  // Timing
  waitTime: number; // minutes
  treatmentTime?: number; // minutes
  
  // Contact
  contactNumber: string;
  emergencyContact?: string;
  
  // Additional
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  isTrauma: boolean;
  isCode?: boolean; // Emergency code active
}

// ============= MOCK DATA =============

const mockEmergencyPatients: EmergencyPatient[] = [
  {
    id: 'EP001',
    erNumber: 'ER-2024-001842',
    name: 'John Martinez',
    age: 45,
    gender: 'male',
    uhid: 'UHID-892401',
    esiLevel: 1,
    chiefComplaint: 'Chest pain with shortness of breath, radiating to left arm',
    arrivalTime: '14:23',
    arrivalDate: '2024-11-11',
    arrivalMode: 'ambulance',
    vitals: {
      bloodPressure: '180/110',
      heartRate: 125,
      temperature: 98.6,
      respiratoryRate: 28,
      oxygenSaturation: 89,
      painLevel: 9,
      gcs: 15
    },
    status: 'critical',
    location: 'Resuscitation Room 1',
    assignedDoctor: 'Dr. Sarah Mitchell',
    assignedNurse: 'Nurse Jennifer Adams',
    waitTime: 2,
    treatmentTime: 45,
    contactNumber: '+1-555-0145',
    emergencyContact: '+1-555-0146 (Spouse)',
    allergies: ['Penicillin'],
    medications: ['Aspirin', 'Metoprolol'],
    medicalHistory: 'Hypertension, Previous MI 2 years ago',
    isTrauma: false,
    isCode: true
  },
  {
    id: 'EP002',
    erNumber: 'ER-2024-001843',
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'female',
    esiLevel: 2,
    chiefComplaint: 'Severe abdominal pain, nausea and vomiting',
    arrivalTime: '15:10',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '135/85',
      heartRate: 98,
      temperature: 101.2,
      respiratoryRate: 20,
      oxygenSaturation: 98,
      painLevel: 8
    },
    status: 'in-treatment',
    location: 'ER Bay 3',
    assignedDoctor: 'Dr. Michael Chen',
    assignedNurse: 'Nurse Maria Garcia',
    waitTime: 15,
    treatmentTime: 30,
    contactNumber: '+1-555-0147',
    emergencyContact: '+1-555-0148 (Mother)',
    allergies: ['Latex'],
    medications: [],
    medicalHistory: 'Appendectomy 5 years ago',
    isTrauma: false
  },
  {
    id: 'EP003',
    erNumber: 'ER-2024-001844',
    name: 'Robert Thompson',
    age: 62,
    gender: 'male',
    uhid: 'UHID-892402',
    esiLevel: 2,
    chiefComplaint: 'Motor vehicle accident - multiple trauma',
    arrivalTime: '15:45',
    arrivalDate: '2024-11-11',
    arrivalMode: 'ambulance',
    vitals: {
      bloodPressure: '95/60',
      heartRate: 115,
      temperature: 98.1,
      respiratoryRate: 24,
      oxygenSaturation: 94,
      painLevel: 7,
      gcs: 14
    },
    status: 'in-treatment',
    location: 'Trauma Bay 1',
    assignedDoctor: 'Dr. David Wilson',
    assignedNurse: 'Nurse Lisa Anderson',
    waitTime: 3,
    treatmentTime: 60,
    contactNumber: '+1-555-0149',
    emergencyContact: '+1-555-0150 (Daughter)',
    allergies: [],
    medications: ['Warfarin', 'Atorvastatin'],
    medicalHistory: 'Atrial fibrillation, Coronary artery disease',
    isTrauma: true
  },
  {
    id: 'EP004',
    erNumber: 'ER-2024-001845',
    name: 'Sarah Johnson',
    age: 35,
    gender: 'female',
    esiLevel: 3,
    chiefComplaint: 'Migraine headache with visual disturbances',
    arrivalTime: '16:00',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '125/80',
      heartRate: 78,
      temperature: 98.4,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      painLevel: 6
    },
    status: 'waiting',
    location: 'Waiting Area',
    waitTime: 45,
    contactNumber: '+1-555-0151',
    allergies: [],
    medications: ['Sumatriptan PRN'],
    medicalHistory: 'Chronic migraines',
    isTrauma: false
  },
  {
    id: 'EP005',
    erNumber: 'ER-2024-001846',
    name: 'Michael Davis',
    age: 8,
    gender: 'male',
    esiLevel: 3,
    chiefComplaint: 'Fever and difficulty breathing',
    arrivalTime: '16:15',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '95/60',
      heartRate: 125,
      temperature: 103.2,
      respiratoryRate: 32,
      oxygenSaturation: 95,
      painLevel: 3
    },
    status: 'in-treatment',
    location: 'Pediatric ER Bay 2',
    assignedDoctor: 'Dr. Jennifer Lee',
    assignedNurse: 'Nurse Emma Wilson',
    waitTime: 20,
    treatmentTime: 25,
    contactNumber: '+1-555-0152',
    emergencyContact: '+1-555-0152 (Parent)',
    allergies: ['Eggs'],
    medications: [],
    medicalHistory: 'Asthma',
    isTrauma: false
  },
  {
    id: 'EP006',
    erNumber: 'ER-2024-001847',
    name: 'Linda Brown',
    age: 55,
    gender: 'female',
    uhid: 'UHID-892403',
    esiLevel: 3,
    chiefComplaint: 'Fall with suspected wrist fracture',
    arrivalTime: '16:30',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '140/90',
      heartRate: 88,
      temperature: 98.6,
      respiratoryRate: 18,
      oxygenSaturation: 98,
      painLevel: 7
    },
    status: 'awaiting-results',
    location: 'ER Bay 5',
    assignedDoctor: 'Dr. Robert Anderson',
    assignedNurse: 'Nurse Rachel Smith',
    waitTime: 30,
    treatmentTime: 40,
    contactNumber: '+1-555-0153',
    allergies: ['Codeine'],
    medications: ['Amlodipine', 'Metformin'],
    medicalHistory: 'Type 2 Diabetes, Hypertension',
    isTrauma: false
  },
  {
    id: 'EP007',
    erNumber: 'ER-2024-001848',
    name: 'James Wilson',
    age: 42,
    gender: 'male',
    esiLevel: 4,
    chiefComplaint: 'Laceration to right hand - needs sutures',
    arrivalTime: '17:00',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '128/82',
      heartRate: 76,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      painLevel: 4
    },
    status: 'waiting',
    location: 'Fast Track',
    waitTime: 60,
    contactNumber: '+1-555-0154',
    allergies: [],
    medications: [],
    medicalHistory: 'None',
    isTrauma: false
  },
  {
    id: 'EP008',
    erNumber: 'ER-2024-001849',
    name: 'Amanda Garcia',
    age: 29,
    gender: 'female',
    esiLevel: 4,
    chiefComplaint: 'Urinary tract infection symptoms',
    arrivalTime: '17:15',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '118/75',
      heartRate: 82,
      temperature: 99.8,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      painLevel: 5
    },
    status: 'waiting',
    location: 'Fast Track',
    waitTime: 75,
    contactNumber: '+1-555-0155',
    allergies: [],
    medications: [],
    medicalHistory: 'Recurrent UTIs',
    isTrauma: false
  },
  {
    id: 'EP009',
    erNumber: 'ER-2024-001850',
    name: 'David Martinez',
    age: 25,
    gender: 'male',
    esiLevel: 5,
    chiefComplaint: 'Minor ankle sprain - ice and elevation needed',
    arrivalTime: '17:30',
    arrivalDate: '2024-11-11',
    arrivalMode: 'walk-in',
    vitals: {
      bloodPressure: '120/78',
      heartRate: 72,
      temperature: 98.6,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      painLevel: 3
    },
    status: 'waiting',
    location: 'Fast Track',
    waitTime: 90,
    contactNumber: '+1-555-0156',
    allergies: [],
    medications: [],
    medicalHistory: 'None',
    isTrauma: false
  }
];

// ============= MAIN COMPONENT =============

interface EmergencyPatientListProps {
  onBack?: () => void;
}

export function EmergencyPatientList({ onBack }: EmergencyPatientListProps) {
  const [patients] = useState<EmergencyPatient[]>(mockEmergencyPatients);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterESI, setFilterESI] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Apply filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === '' ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.erNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.uhid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesESI = filterESI === 'all' || patient.esiLevel.toString() === filterESI;
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesESI && matchesStatus;
  });

  const getESIColor = (level: ESILevel) => {
    switch (level) {
      case 1: return 'bg-red-600 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      case 4: return 'bg-green-500 text-white';
      case 5: return 'bg-blue-500 text-white';
    }
  };

  const getESIBadgeColor = (level: ESILevel) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-green-100 text-green-800 border-green-200';
      case 5: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-treatment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'awaiting-results': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admitted': return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getESIDescription = (level: ESILevel) => {
    switch (level) {
      case 1: return 'Immediate - Resuscitation';
      case 2: return 'Emergent - High Risk';
      case 3: return 'Urgent - Stable';
      case 4: return 'Less Urgent';
      case 5: return 'Non-Urgent';
    }
  };

  const handleViewDetails = (patient: EmergencyPatient) => {
    setSelectedPatient(patient);
    setIsDetailsDialogOpen(true);
  };

  // Statistics
  const stats = {
    total: patients.length,
    critical: patients.filter(p => p.esiLevel <= 2 || p.status === 'critical').length,
    waiting: patients.filter(p => p.status === 'waiting').length,
    inTreatment: patients.filter(p => p.status === 'in-treatment').length,
    avgWaitTime: Math.round(patients.reduce((sum, p) => sum + p.waitTime, 0) / patients.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Emergency Patients</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time patient tracking and registration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setIsRegisterDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register Patient
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <Badge variant="outline">{stats.total}</Badge>
            </div>
            <p className="text-xs text-gray-600">Total Patients</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Siren className="w-5 h-5 text-red-600" />
              <Badge className="bg-red-100 text-red-700">{stats.critical}</Badge>
            </div>
            <p className="text-xs text-gray-600">Critical/Urgent</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">{stats.waiting}</Badge>
            </div>
            <p className="text-xs text-gray-600">Waiting</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700">{stats.inTreatment}</Badge>
            </div>
            <p className="text-xs text-gray-600">In Treatment</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">{stats.avgWaitTime}m</Badge>
            </div>
            <p className="text-xs text-gray-600">Avg Wait Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by ER number, name, UHID, or complaint..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* ESI Filter */}
            <Select value={filterESI} onValueChange={setFilterESI}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ESI Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ESI Levels</SelectItem>
                <SelectItem value="1">ESI 1 - Critical</SelectItem>
                <SelectItem value="2">ESI 2 - Emergent</SelectItem>
                <SelectItem value="3">ESI 3 - Urgent</SelectItem>
                <SelectItem value="4">ESI 4 - Less Urgent</SelectItem>
                <SelectItem value="5">ESI 5 - Non-Urgent</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in-treatment">In Treatment</SelectItem>
                <SelectItem value="awaiting-results">Awaiting Results</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient List - Table View */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ER Number</TableHead>
                  <TableHead>Patient Info</TableHead>
                  <TableHead>ESI</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Vitals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Assigned Staff</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow 
                    key={patient.id}
                    className={`cursor-pointer hover:bg-gray-50 ${patient.isCode ? 'bg-red-50' : ''}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{patient.erNumber}</p>
                        <p className="text-xs text-gray-500">{patient.arrivalTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{patient.name}</p>
                        <p className="text-xs text-gray-500">
                          {patient.age}Y / {patient.gender}
                          {patient.uhid && ` • ${patient.uhid}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getESIBadgeColor(patient.esiLevel)}>
                        ESI {patient.esiLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[200px] truncate" title={patient.chiefComplaint}>
                        {patient.chiefComplaint}
                      </p>
                      {patient.isTrauma && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Trauma
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <p>BP: {patient.vitals.bloodPressure}</p>
                        <p>HR: {patient.vitals.heartRate} bpm</p>
                        <p>SpO2: {patient.vitals.oxygenSaturation}%</p>
                        <p>Pain: {patient.vitals.painLevel}/10</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                      {patient.isCode && (
                        <Badge className="mt-1 bg-red-600 text-white">
                          <Siren className="w-3 h-3 mr-1" />
                          CODE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{patient.location}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className={`text-sm ${patient.waitTime > 60 ? 'text-red-600' : ''}`}>
                          {patient.waitTime}m
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {patient.assignedDoctor && (
                          <p className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            {patient.assignedDoctor.replace('Dr. ', '')}
                          </p>
                        )}
                        {patient.assignedNurse && (
                          <p className="flex items-center gap-1 text-gray-500">
                            <User className="w-3 h-3" />
                            {patient.assignedNurse.replace('Nurse ', '')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(patient)}
                      >
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

      {/* Register Patient Dialog */}
      <RegisterPatientDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
      />

      {/* Patient Details Dialog */}
      <PatientDetailsDialog
        patient={selectedPatient}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
}

// ============= REGISTER PATIENT DIALOG =============

function RegisterPatientDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [isNewPatient, setIsNewPatient] = useState(true);

  const handleSubmit = () => {
    toast.success('Emergency patient registered successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Register Emergency Patient
          </DialogTitle>
          <DialogDescription>
            Quick registration and triage assessment
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="patient" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patient">Patient Info</TabsTrigger>
            <TabsTrigger value="triage">Triage</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
          </TabsList>

          {/* Tab 1: Patient Info */}
          <TabsContent value="patient" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Label>Patient Type:</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isNewPatient}
                  onCheckedChange={setIsNewPatient}
                />
                <span className="text-sm">
                  {isNewPatient ? 'New Patient' : 'Existing Patient'}
                </span>
              </div>
            </div>

            {!isNewPatient && (
              <div className="space-y-2">
                <Label>Search Existing Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Enter UHID or Patient Name" className="pl-10" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Patient full name" />
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
                <Input type="tel" placeholder="+1-555-0000" />
              </div>
              <div className="space-y-2">
                <Label>Arrival Mode *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="How did patient arrive?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-In</SelectItem>
                    <SelectItem value="ambulance">Ambulance</SelectItem>
                    <SelectItem value="police">Police</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input type="tel" placeholder="Emergency contact number" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea placeholder="Patient address" rows={2} />
            </div>
          </TabsContent>

          {/* Tab 2: Triage */}
          <TabsContent value="triage" className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                ESI Triage is critical for proper patient prioritization
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Chief Complaint *</Label>
              <Textarea 
                placeholder="Primary reason for emergency visit..." 
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>ESI Triage Level *</Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Card 
                    key={level}
                    className="cursor-pointer hover:shadow-md transition-all border-2"
                  >
                    <CardContent className="p-4 text-center">
                      <Badge className={`mb-2 ${
                        level === 1 ? 'bg-red-600' :
                        level === 2 ? 'bg-orange-500' :
                        level === 3 ? 'bg-yellow-500' :
                        level === 4 ? 'bg-green-500' :
                        'bg-blue-500'
                      } text-white`}>
                        ESI {level}
                      </Badge>
                      <p className="text-xs">
                        {level === 1 ? 'Critical' :
                         level === 2 ? 'Emergent' :
                         level === 3 ? 'Urgent' :
                         level === 4 ? 'Less Urgent' :
                         'Non-Urgent'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Is this a trauma case?</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch />
                  <Label>Emergency code active?</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Presenting Symptoms</Label>
              <Textarea 
                placeholder="Detailed symptoms and observations..." 
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Tab 3: Vitals */}
          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Pressure *</Label>
                <Input placeholder="120/80" />
              </div>
              <div className="space-y-2">
                <Label>Heart Rate (bpm) *</Label>
                <Input type="number" placeholder="75" />
              </div>
              <div className="space-y-2">
                <Label>Temperature (°F) *</Label>
                <Input type="number" step="0.1" placeholder="98.6" />
              </div>
              <div className="space-y-2">
                <Label>Respiratory Rate *</Label>
                <Input type="number" placeholder="16" />
              </div>
              <div className="space-y-2">
                <Label>Oxygen Saturation (%) *</Label>
                <Input type="number" placeholder="98" min="0" max="100" />
              </div>
              <div className="space-y-2">
                <Label>Pain Level (0-10) *</Label>
                <Input type="number" placeholder="5" min="0" max="10" />
              </div>
              <div className="space-y-2">
                <Label>Glasgow Coma Scale (GCS)</Label>
                <Input type="number" placeholder="15" min="3" max="15" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" placeholder="70" />
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Medical History */}
          <TabsContent value="medical" className="space-y-4">
            <div className="space-y-2">
              <Label>Known Allergies</Label>
              <Input placeholder="e.g., Penicillin, Latex, Nuts (comma separated)" />
            </div>

            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea 
                placeholder="List all current medications..." 
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Medical History</Label>
              <Textarea 
                placeholder="Chronic conditions, previous surgeries, etc..." 
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Last Meal</Label>
              <Input type="datetime-local" />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea 
                placeholder="Any additional information relevant to emergency care..." 
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register & Start Triage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= PATIENT DETAILS DIALOG =============

function PatientDetailsDialog({ 
  patient, 
  open, 
  onOpenChange 
}: { 
  patient: EmergencyPatient | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-6 h-6" />
            {patient.name} - {patient.erNumber}
          </DialogTitle>
          <DialogDescription>
            Emergency patient details and treatment status
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">ER Number</Label>
                  <p className="font-mono">{patient.erNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Patient Name</Label>
                  <p>{patient.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Age / Gender</Label>
                  <p>{patient.age} Years / {patient.gender}</p>
                </div>
                {patient.uhid && (
                  <div>
                    <Label className="text-xs text-gray-500">UHID</Label>
                    <p className="font-mono">{patient.uhid}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">ESI Triage Level</Label>
                  <Badge className={`${
                    patient.esiLevel === 1 ? 'bg-red-600' :
                    patient.esiLevel === 2 ? 'bg-orange-500' :
                    patient.esiLevel === 3 ? 'bg-yellow-500' :
                    patient.esiLevel === 4 ? 'bg-green-500' :
                    'bg-blue-500'
                  } text-white`}>
                    ESI Level {patient.esiLevel}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Arrival Time</Label>
                  <p>{patient.arrivalDate} at {patient.arrivalTime}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Arrival Mode</Label>
                  <Badge variant="outline">{patient.arrivalMode}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Current Status</Label>
                  <Badge className={patient.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                    {patient.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Location</Label>
                  <p>{patient.location}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Wait Time</Label>
                  <p>{patient.waitTime} minutes</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Chief Complaint</Label>
              <p className="p-3 bg-gray-50 rounded-lg">{patient.chiefComplaint}</p>
            </div>

            {patient.assignedDoctor && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Assigned Doctor</Label>
                  <p>{patient.assignedDoctor}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Assigned Nurse</Label>
                  <p>{patient.assignedNurse}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Blood Pressure</p>
                      <p className="text-2xl">{patient.vitals.bloodPressure}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Heart Rate</p>
                      <p className="text-2xl">{patient.vitals.heartRate} bpm</p>
                    </div>
                    <HeartPulse className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="text-2xl">{patient.vitals.temperature}°F</p>
                    </div>
                    <Thermometer className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Oxygen Saturation</p>
                      <p className="text-2xl">{patient.vitals.oxygenSaturation}%</p>
                    </div>
                    <Wind className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Respiratory Rate</p>
                      <p className="text-2xl">{patient.vitals.respiratoryRate} /min</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Pain Level</p>
                      <p className="text-2xl">{patient.vitals.painLevel}/10</p>
                    </div>
                    <Gauge className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treatment">
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Treatment timeline not available</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {patient.allergies && patient.allergies.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.medications && patient.medications.length > 0 && (
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Current Medications</Label>
                <div className="flex flex-wrap gap-2">
                  {patient.medications.map((med, index) => (
                    <Badge key={index} variant="outline">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.medicalHistory && (
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Medical History</Label>
                <p className="p-3 bg-gray-50 rounded-lg">{patient.medicalHistory}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
