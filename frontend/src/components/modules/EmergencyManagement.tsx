/**
 * Emergency Department Management System
 * 
 * Complete Emergency Workflow:
 * 1. Patient Arrival & Registration
 * 2. Triage Assessment (ESI 1-5)
 * 3. Treatment & Care
 * 4. Disposition Decision:
 *    - Discharge Home
 *    - Transfer/Refer to Another Hospital
 *    - Admit to Ward
 *    - Admit to Private Room
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
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
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
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

interface EmergencyPatient {
  id: string;
  erNumber: string;
  uhid?: string;
  
  // Personal Info
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  
  // Arrival Info
  arrivalTime: string;
  arrivalMode: 'walk-in' | 'ambulance' | 'police' | 'referred';
  
  // Triage Info
  triageLevel: 1 | 2 | 3 | 4 | 5;
  chiefComplaint: string;
  vitals: {
    bp: string;
    pulse: number;
    temp: number;
    spo2: number;
    resp: number;
  };
  
  // Status
  currentStatus: 'registered' | 'triaged' | 'in-treatment' | 'awaiting-disposition' | 'completed';
  
  // Treatment
  assignedDoctor?: string;
  assignedNurse?: string;
  bedNumber?: string;
  
  // Disposition
  disposition?: 'discharge' | 'admit-ward' | 'admit-private' | 'transfer' | 'absconded' | 'death';
  dispositionDetails?: string;
  dispositionTime?: string;
  
  // Additional
  investigations?: string[];
  medications?: string[];
  totalCharges: number;
  waitTime: number; // minutes
}

// ============= MOCK DATA =============

const mockEmergencyPatients: EmergencyPatient[] = [
  {
    id: 'ER001',
    erNumber: 'ER-2024-001',
    uhid: 'UHID-234567',
    name: 'John Anderson',
    age: 45,
    gender: 'male',
    contact: '+1-555-0101',
    arrivalTime: '2024-11-12 08:30 AM',
    arrivalMode: 'ambulance',
    triageLevel: 2,
    chiefComplaint: 'Chest pain, shortness of breath',
    vitals: {
      bp: '160/95',
      pulse: 110,
      temp: 98.6,
      spo2: 92,
      resp: 22
    },
    currentStatus: 'in-treatment',
    assignedDoctor: 'Dr. Sarah Mitchell',
    assignedNurse: 'Nurse Emily',
    bedNumber: 'ER-BED-03',
    investigations: ['ECG', 'Troponin', 'CBC'],
    medications: ['Aspirin', 'Nitroglycerin'],
    totalCharges: 15000,
    waitTime: 12
  },
  {
    id: 'ER002',
    erNumber: 'ER-2024-002',
    name: 'Maria Garcia',
    age: 32,
    gender: 'female',
    contact: '+1-555-0102',
    arrivalTime: '2024-11-12 09:15 AM',
    arrivalMode: 'walk-in',
    triageLevel: 4,
    chiefComplaint: 'Minor laceration on hand',
    vitals: {
      bp: '120/80',
      pulse: 78,
      temp: 98.4,
      spo2: 98,
      resp: 16
    },
    currentStatus: 'awaiting-disposition',
    assignedDoctor: 'Dr. James Wilson',
    bedNumber: 'ER-BED-08',
    investigations: ['X-Ray Hand'],
    medications: ['Tetanus', 'Antibiotics'],
    totalCharges: 3500,
    waitTime: 45,
    disposition: 'discharge',
    dispositionDetails: 'Wound sutured, follow-up in 7 days'
  },
  {
    id: 'ER003',
    erNumber: 'ER-2024-003',
    uhid: 'UHID-456789',
    name: 'Robert Chen',
    age: 68,
    gender: 'male',
    contact: '+1-555-0103',
    arrivalTime: '2024-11-12 07:45 AM',
    arrivalMode: 'ambulance',
    triageLevel: 1,
    chiefComplaint: 'Stroke symptoms - Left sided weakness',
    vitals: {
      bp: '180/110',
      pulse: 95,
      temp: 98.2,
      spo2: 94,
      resp: 20
    },
    currentStatus: 'completed',
    assignedDoctor: 'Dr. Michael Brown',
    bedNumber: 'ER-RESUS-01',
    investigations: ['CT Brain', 'CBC', 'PT/INR'],
    medications: ['tPA', 'Antiplatelets'],
    totalCharges: 45000,
    waitTime: 5,
    disposition: 'admit-ward',
    dispositionDetails: 'Admitted to Neurology ICU',
    dispositionTime: '2024-11-12 10:30 AM'
  },
  {
    id: 'ER004',
    erNumber: 'ER-2024-004',
    name: 'Lisa Thompson',
    age: 28,
    gender: 'female',
    contact: '+1-555-0104',
    arrivalTime: '2024-11-12 09:45 AM',
    arrivalMode: 'walk-in',
    triageLevel: 3,
    chiefComplaint: 'Severe abdominal pain',
    vitals: {
      bp: '125/82',
      pulse: 88,
      temp: 99.2,
      spo2: 97,
      resp: 18
    },
    currentStatus: 'in-treatment',
    assignedDoctor: 'Dr. Emily Davis',
    bedNumber: 'ER-BED-05',
    investigations: ['Ultrasound Abdomen', 'CBC', 'Urine Analysis'],
    medications: ['Pain relief', 'Anti-spasmodic'],
    totalCharges: 8500,
    waitTime: 30
  },
  {
    id: 'ER005',
    erNumber: 'ER-2024-005',
    name: 'David Martinez',
    age: 55,
    gender: 'male',
    contact: '+1-555-0105',
    arrivalTime: '2024-11-12 10:20 AM',
    arrivalMode: 'referred',
    triageLevel: 2,
    chiefComplaint: 'Road traffic accident - Multiple injuries',
    vitals: {
      bp: '100/65',
      pulse: 115,
      temp: 98.0,
      spo2: 93,
      resp: 24
    },
    currentStatus: 'triaged',
    bedNumber: 'ER-TRAUMA-02',
    totalCharges: 0,
    waitTime: 8
  }
];

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6'];

// ============= MAIN COMPONENT =============

export function EmergencyManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients] = useState<EmergencyPatient[]>(mockEmergencyPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyPatient | null>(null);
  const [isDispositionOpen, setIsDispositionOpen] = useState(false);

  // Statistics
  const stats = {
    total: patients.length,
    registered: patients.filter(p => p.currentStatus === 'registered').length,
    triaged: patients.filter(p => p.currentStatus === 'triaged').length,
    inTreatment: patients.filter(p => p.currentStatus === 'in-treatment').length,
    awaitingDisposition: patients.filter(p => p.currentStatus === 'awaiting-disposition').length,
    completed: patients.filter(p => p.currentStatus === 'completed').length,
    
    discharged: patients.filter(p => p.disposition === 'discharge').length,
    admittedWard: patients.filter(p => p.disposition === 'admit-ward').length,
    admittedPrivate: patients.filter(p => p.disposition === 'admit-private').length,
    transferred: patients.filter(p => p.disposition === 'transfer').length,
    
    avgWaitTime: Math.round(patients.reduce((sum, p) => sum + p.waitTime, 0) / patients.length)
  };

  const getTriageColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-300';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-300';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 4: return 'bg-green-100 text-green-800 border-green-300';
      case 5: return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriageLabel = (level: number) => {
    switch (level) {
      case 1: return 'ESI 1 - Resuscitation';
      case 2: return 'ESI 2 - Emergent';
      case 3: return 'ESI 3 - Urgent';
      case 4: return 'ESI 4 - Less Urgent';
      case 5: return 'ESI 5 - Non-Urgent';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'triaged': return 'bg-purple-100 text-purple-800';
      case 'in-treatment': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting-disposition': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDispositionIcon = (disposition?: string) => {
    switch (disposition) {
      case 'discharge': return <Home className="w-4 h-4" />;
      case 'admit-ward': return <Bed className="w-4 h-4" />;
      case 'admit-private': return <Building2 className="w-4 h-4" />;
      case 'transfer': return <Send className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getDispositionColor = (disposition?: string) => {
    switch (disposition) {
      case 'discharge': return 'bg-green-100 text-green-800';
      case 'admit-ward': return 'bg-blue-100 text-blue-800';
      case 'admit-private': return 'bg-purple-100 text-purple-800';
      case 'transfer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.erNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || patient.currentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // ============= RENDER OVERVIEW =============
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Ambulance className="w-8 h-8 text-red-600" />
              <Badge className="bg-red-100 text-red-800">{stats.total}</Badge>
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total ER Patients</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800">{stats.inTreatment}</Badge>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{stats.inTreatment}</p>
            <p className="text-xs text-gray-600">In Treatment</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{stats.awaitingDisposition}</p>
            <p className="text-xs text-gray-600">Awaiting Disposition</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">{stats.avgWaitTime}m</Badge>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.avgWaitTime} min</p>
            <p className="text-xs text-gray-600">Avg Wait Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Flow Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Patient Flow Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Registered', count: stats.registered, color: 'bg-blue-500', icon: UserPlus },
                { label: 'Triaged', count: stats.triaged, color: 'bg-purple-500', icon: ClipboardList },
                { label: 'In Treatment', count: stats.inTreatment, color: 'bg-yellow-500', icon: Stethoscope },
                { label: 'Awaiting Disposition', count: stats.awaitingDisposition, color: 'bg-orange-500', icon: AlertCircle },
                { label: 'Completed', count: stats.completed, color: 'bg-green-500', icon: CheckCircle }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge variant="outline" className="text-lg">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-green-600" />
              Disposition Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Discharged Home', count: stats.discharged, color: 'bg-green-500', icon: Home },
                { label: 'Admitted to Ward', count: stats.admittedWard, color: 'bg-blue-500', icon: Bed },
                { label: 'Admitted to Private Room', count: stats.admittedPrivate, color: 'bg-purple-500', icon: Building2 },
                { label: 'Transferred/Referred', count: stats.transferred, color: 'bg-orange-500', icon: Send }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge variant="outline" className="text-lg">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-red-600" />
            Triage Level Distribution (ESI)
          </CardTitle>
          <CardDescription>Emergency Severity Index classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((level) => {
              const count = patients.filter(p => p.triageLevel === level).length;
              const percentage = patients.length > 0 ? (count / patients.length * 100).toFixed(0) : 0;
              
              return (
                <div key={level} className={`p-4 rounded-lg border-2 ${getTriageColor(level)}`}>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">{count}</p>
                    <p className="text-xs mb-2">ESI {level}</p>
                    <Badge variant="outline" className="text-xs">{percentage}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER ACTIVE PATIENTS =============
  
  const renderActivePatients = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, ER number, or complaint..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="triaged">Triaged</SelectItem>
                <SelectItem value="in-treatment">In Treatment</SelectItem>
                <SelectItem value="awaiting-disposition">Awaiting Disposition</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.age}Y / {patient.gender}</p>
                    <p className="text-xs text-gray-500 font-mono">{patient.erNumber}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={getTriageColor(patient.triageLevel)} variant="outline">
                    ESI {patient.triageLevel}
                  </Badge>
                  <Badge className={getStatusColor(patient.currentStatus)}>
                    {patient.currentStatus.replace('-', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Arrival Info */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">{patient.arrivalTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Ambulance className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 capitalize">{patient.arrivalMode}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">Wait: {patient.waitTime}m</span>
                </div>
                {patient.bedNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">{patient.bedNumber}</span>
                  </div>
                )}
              </div>

              {/* Chief Complaint */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Chief Complaint:</p>
                <p className="text-sm font-medium text-gray-900">{patient.chiefComplaint}</p>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-xs text-gray-600">BP</p>
                  <p className="text-sm font-semibold">{patient.vitals.bp}</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="text-xs text-gray-600">HR</p>
                  <p className="text-sm font-semibold">{patient.vitals.pulse}</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="text-xs text-gray-600">Temp</p>
                  <p className="text-sm font-semibold">{patient.vitals.temp}°F</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-xs text-gray-600">SpO2</p>
                  <p className="text-sm font-semibold">{patient.vitals.spo2}%</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <p className="text-xs text-gray-600">RR</p>
                  <p className="text-sm font-semibold">{patient.vitals.resp}</p>
                </div>
              </div>

              {/* Assigned Staff */}
              {patient.assignedDoctor && (
                <div className="mb-4 p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium">{patient.assignedDoctor}</span>
                  </div>
                </div>
              )}

              {/* Disposition */}
              {patient.disposition && (
                <div className="mb-4">
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${getDispositionColor(patient.disposition)}`}>
                    {getDispositionIcon(patient.disposition)}
                    <div className="flex-1">
                      <p className="text-sm font-semibold capitalize">{patient.disposition.replace('-', ' ')}</p>
                      {patient.dispositionDetails && (
                        <p className="text-xs mt-1">{patient.dispositionDetails}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                {patient.currentStatus === 'awaiting-disposition' && !patient.disposition && (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsDispositionOpen(true);
                    }}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Disposition
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ============= RENDER REGISTER PATIENT =============
  
  const renderRegisterPatient = () => (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Register New Emergency Patient
          </CardTitle>
          <CardDescription>Complete patient registration and triage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="triage">Triage</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Info</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>ER Number</Label>
                  <Input value="ER-2024-006" disabled className="bg-gray-50" />
                </div>
                <div className="col-span-2">
                  <Label>Patient Name *</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div>
                  <Label>Age *</Label>
                  <Input type="number" placeholder="Age" />
                </div>
                <div>
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
                <div>
                  <Label>Contact Number *</Label>
                  <Input type="tel" placeholder="+1-555-0000" />
                </div>
                <div>
                  <Label>Arrival Mode *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="ambulance">Ambulance</SelectItem>
                      <SelectItem value="police">Police</SelectItem>
                      <SelectItem value="referred">Referred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Existing UHID (if registered patient)</Label>
                  <Input placeholder="UHID-XXXXXX" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="triage" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Triage Level (ESI) *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select triage level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ESI 1 - Resuscitation (Life-threatening)</SelectItem>
                      <SelectItem value="2">ESI 2 - Emergent (High risk)</SelectItem>
                      <SelectItem value="3">ESI 3 - Urgent (Moderate risk)</SelectItem>
                      <SelectItem value="4">ESI 4 - Less Urgent (Low risk)</SelectItem>
                      <SelectItem value="5">ESI 5 - Non-Urgent (Very low risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Chief Complaint *</Label>
                  <Textarea 
                    placeholder="Describe the main complaint..."
                    rows={3}
                  />
                </div>

                <Separator />

                <h4 className="font-semibold flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-600" />
                  Vital Signs
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Blood Pressure (mmHg)</Label>
                    <Input placeholder="120/80" />
                  </div>
                  <div>
                    <Label>Pulse Rate (bpm)</Label>
                    <Input type="number" placeholder="72" />
                  </div>
                  <div>
                    <Label>Temperature (°F)</Label>
                    <Input type="number" step="0.1" placeholder="98.6" />
                  </div>
                  <div>
                    <Label>SpO2 (%)</Label>
                    <Input type="number" placeholder="98" />
                  </div>
                  <div>
                    <Label>Respiratory Rate</Label>
                    <Input type="number" placeholder="16" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Assign Doctor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr1">Dr. Sarah Mitchell - Cardiology</SelectItem>
                      <SelectItem value="dr2">Dr. James Wilson - Emergency</SelectItem>
                      <SelectItem value="dr3">Dr. Emily Davis - General Medicine</SelectItem>
                      <SelectItem value="dr4">Dr. Michael Brown - Neurology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assign Nurse</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nurse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="n1">Nurse Emily</SelectItem>
                      <SelectItem value="n2">Nurse John</SelectItem>
                      <SelectItem value="n3">Nurse Sarah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bed Assignment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="er1">ER-BED-01</SelectItem>
                      <SelectItem value="er2">ER-BED-02</SelectItem>
                      <SelectItem value="er3">ER-BED-03</SelectItem>
                      <SelectItem value="resus">ER-RESUS-01 (Resuscitation)</SelectItem>
                      <SelectItem value="trauma">ER-TRAUMA-01 (Trauma Bay)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Initial Notes</Label>
                  <Textarea 
                    placeholder="Additional clinical notes, allergies, current medications..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-6 border-t">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Register Patient
            </Button>
            <Button variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER DISPOSITION DIALOG =============
  
  const DispositionDialog = () => (
    <Dialog open={isDispositionOpen} onOpenChange={setIsDispositionOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-green-600" />
            Patient Disposition
          </DialogTitle>
          <DialogDescription>
            Decide the next step for {selectedPatient?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Patient has been treated and is ready for disposition decision.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Label>Disposition Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Discharge Home</h4>
                </div>
                <p className="text-xs text-gray-600">Patient is stable and can go home</p>
              </div>

              <div className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Bed className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Admit to Ward</h4>
                </div>
                <p className="text-xs text-gray-600">Requires further in-patient care</p>
              </div>

              <div className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Admit to Private Room</h4>
                </div>
                <p className="text-xs text-gray-600">Private room admission</p>
              </div>

              <div className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Transfer/Refer</h4>
                </div>
                <p className="text-xs text-gray-600">Transfer to another facility</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Disposition Details *</Label>
              <Textarea 
                placeholder="Discharge instructions, admission reason, transfer details, etc..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Follow-up Required</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Follow-up Date</Label>
                <Input type="date" />
              </div>
            </div>

            <div>
              <Label>Medications Prescribed</Label>
              <Textarea 
                placeholder="List medications and dosages..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.success('Disposition saved successfully!');
                setIsDispositionOpen(false);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Disposition
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsDispositionOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
            Complete emergency patient management from arrival to disposition
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setActiveTab('register')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register New Patient
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Patients ({patients.filter(p => p.currentStatus !== 'completed').length})</TabsTrigger>
          <TabsTrigger value="register">Register Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="active">
          {renderActivePatients()}
        </TabsContent>

        <TabsContent value="register">
          {renderRegisterPatient()}
        </TabsContent>
      </Tabs>

      {/* Disposition Dialog */}
      <DispositionDialog />
    </div>
  );
}
