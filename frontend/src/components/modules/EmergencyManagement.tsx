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

import { useState, useEffect } from 'react';
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
import { api, EmergencyVisit, Patient, Doctor, EmergencyStats, CreateEmergencyVisitData, CreatePatientData } from '../../services/api';
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
import { EmergencyPatientDetail } from './EmergencyPatientDetail';

// ============= INTERFACES =============
// Using EmergencyVisit from api.ts instead of local interface
const COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6'];

// ============= MAIN COMPONENT =============

export function EmergencyManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [registrationTab, setRegistrationTab] = useState('patient');
  const [patients, setPatients] = useState<EmergencyVisit[]>([]);
  const [stats, setStats] = useState<EmergencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<EmergencyVisit | null>(null);
  const [isDispositionOpen, setIsDispositionOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Patient search for registration
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [selectedPatientForRegistration, setSelectedPatientForRegistration] = useState<Patient | null>(null);
  const [searchingPatients, setSearchingPatients] = useState(false);
  
  // Doctors and nurses for assignment
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Array<{bed_number: string}>>([]);
  
  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    patient_id: '',
    arrival_mode: 'walk-in' as 'walk-in' | 'ambulance' | 'police' | 'referred',
    triage_level: 3 as 1 | 2 | 3 | 4 | 5,
    chief_complaint: '',
    vitals: {
      bp: '',
      pulse: '',
      temp: '',
      spo2: '',
      resp: ''
    },
    assigned_doctor_id: '',
    assigned_nurse_id: '',
    bed_number: '',
    investigations: [] as string[],
    medications: [] as string[]
  });
  
  // Disposition form state
  const [dispositionForm, setDispositionForm] = useState({
    disposition: '' as '' | 'discharge' | 'admit-ward' | 'admit-private' | 'transfer' | 'absconded' | 'death',
    disposition_details: '',
    follow_up_required: false,
    follow_up_date: '',
    medications_prescribed: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  // New patient registration form (in tab)
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    email: '',
    address: ''
  });
  const [creatingPatient, setCreatingPatient] = useState(false);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
    loadDoctors();
    loadBeds();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      const visits = await api.getEmergencyVisits(filters);
      setPatients(visits);
      
      const statsData = await api.getEmergencyStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading emergency data:', error);
      toast.error('Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const doctorsData = await api.getDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadBeds = async () => {
    try {
      const bedsData = await api.getEmergencyBeds();
      setBeds(bedsData.map(b => ({ bed_number: b.bed_number })));
    } catch (error) {
      console.error('Error loading beds:', error);
    }
  };

  const searchPatients = async (query: string) => {
    if (!query || query.length < 2) {
      setPatientSearchResults([]);
      return;
    }
    
    try {
      setSearchingPatients(true);
      const results = await api.getPatients({ search: query });
      setPatientSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setSearchingPatients(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patientSearchQuery) {
        searchPatients(patientSearchQuery);
      } else {
        setPatientSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [patientSearchQuery]);

  // Statistics - use API stats or calculate from patients
  const calculatedStats = stats ? {
    total: stats.total || 0,
    registered: stats.registered || 0,
    triaged: stats.triaged || 0,
    in_treatment: stats['in-treatment'] || stats.in_treatment || 0,
    awaiting_disposition: stats['awaiting-disposition'] || stats.awaiting_disposition || 0,
    completed: stats.completed || 0,
    discharged: stats.discharged || 0,
    admitted_ward: stats['admit-ward'] || stats.admitted_ward || 0,
    admitted_private: stats['admit-private'] || stats.admitted_private || 0,
    transferred: stats.transfer || stats.transferred || 0,
    avg_wait_time: stats.avg_wait_time || 0,
    triage_distribution: stats.triage_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  } : {
    total: patients.length || 0,
    registered: patients.filter(p => p.currentStatus === 'registered').length || 0,
    triaged: patients.filter(p => p.currentStatus === 'triaged').length || 0,
    in_treatment: patients.filter(p => p.currentStatus === 'in-treatment').length || 0,
    awaiting_disposition: patients.filter(p => p.currentStatus === 'awaiting-disposition').length || 0,
    completed: patients.filter(p => p.currentStatus === 'completed').length || 0,
    discharged: patients.filter(p => p.disposition === 'discharge').length || 0,
    admitted_ward: patients.filter(p => p.disposition === 'admit-ward').length || 0,
    admitted_private: patients.filter(p => p.disposition === 'admit-private').length || 0,
    transferred: patients.filter(p => p.disposition === 'transfer').length || 0,
    avg_wait_time: patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.waitTime || 0), 0) / patients.length) : 0,
    triage_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
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
    const matchesSearch = !searchQuery || 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.erNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.chiefComplaint && patient.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || patient.currentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleRegisterPatient = async () => {
    console.log('handleRegisterPatient called', { selectedPatientForRegistration, registrationForm });
    
    if (!selectedPatientForRegistration) {
      toast.error('Please select a patient');
      return;
    }

    if (!registrationForm.chief_complaint || !registrationForm.triage_level) {
      toast.error('Please fill in all required fields (Triage Level and Chief Complaint)');
      return;
    }

    try {
      setSubmitting(true);
      const visitData: CreateEmergencyVisitData = {
        patient_id: selectedPatientForRegistration.id,
        arrival_mode: registrationForm.arrival_mode,
        triage_level: registrationForm.triage_level,
        chief_complaint: registrationForm.chief_complaint,
        vitals_bp: registrationForm.vitals.bp || undefined,
        vitals_pulse: registrationForm.vitals.pulse ? parseInt(registrationForm.vitals.pulse) : undefined,
        vitals_temp: registrationForm.vitals.temp ? parseFloat(registrationForm.vitals.temp) : undefined,
        vitals_spo2: registrationForm.vitals.spo2 ? parseInt(registrationForm.vitals.spo2) : undefined,
        vitals_resp: registrationForm.vitals.resp ? parseInt(registrationForm.vitals.resp) : undefined,
        assigned_doctor_id: registrationForm.assigned_doctor_id ? parseInt(registrationForm.assigned_doctor_id) : undefined,
        bed_number: registrationForm.bed_number || undefined,
        investigations: registrationForm.investigations.length > 0 ? registrationForm.investigations : undefined,
        medications: registrationForm.medications.length > 0 ? registrationForm.medications : undefined
      };

      console.log('Creating emergency visit with data:', visitData);
      await api.createEmergencyVisit(visitData);
      console.log('Emergency visit created successfully');
      toast.success('Emergency visit registered successfully');
      resetRegistrationForm();
      setActiveTab('active');
      loadData();
    } catch (error: any) {
      console.error('Error registering patient:', error);
      toast.error(error.message || 'Failed to register emergency visit');
    } finally {
      setSubmitting(false);
    }
  };

  const resetRegistrationForm = () => {
    setSelectedPatientForRegistration(null);
    setPatientSearchQuery('');
    setRegistrationTab('patient');
    setRegistrationForm({
      patient_id: '',
      arrival_mode: 'walk-in',
      triage_level: 3,
      chief_complaint: '',
      vitals: { bp: '', pulse: '', temp: '', spo2: '', resp: '' },
      assigned_doctor_id: '',
      assigned_nurse_id: '',
      bed_number: '',
      investigations: [],
      medications: []
    });
  };

  const handleDisposition = async () => {
    if (!selectedPatient || !dispositionForm.disposition) {
      toast.error('Please select a disposition type');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateEmergencyDisposition(selectedPatient.id.toString(), {
        disposition: dispositionForm.disposition,
        disposition_details: dispositionForm.disposition_details,
        follow_up_required: dispositionForm.follow_up_required,
        follow_up_date: dispositionForm.follow_up_date || undefined,
        medications_prescribed: dispositionForm.medications_prescribed
      });
      toast.success('Disposition saved successfully');
      setIsDispositionOpen(false);
      setSelectedPatient(null);
      setDispositionForm({
        disposition: '',
        disposition_details: '',
        follow_up_required: false,
        follow_up_date: '',
        medications_prescribed: ''
      });
      loadData();
    } catch (error: any) {
      console.error('Error updating disposition:', error);
      toast.error(error.message || 'Failed to update disposition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewPatient = async () => {
    console.log('handleCreateNewPatient called', newPatientForm);
    
    if (!newPatientForm.name || !newPatientForm.phone || !newPatientForm.age) {
      toast.error('Please fill in all required fields (Name, Phone, Age)');
      return;
    }

    const ageNum = parseInt(newPatientForm.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      toast.error('Please enter a valid age (0-150)');
      return;
    }

    try {
      setCreatingPatient(true);
      const patientData: CreatePatientData = {
        name: newPatientForm.name.trim(),
        phone: newPatientForm.phone.trim(),
        age: ageNum,
        gender: newPatientForm.gender,
        email: newPatientForm.email?.trim() || undefined,
        address: newPatientForm.address?.trim() || undefined
      };

      console.log('Creating patient with data:', patientData);
      const newPatient = await api.createPatient(patientData);
      console.log('Patient created successfully:', newPatient);
      
      toast.success('Patient registered successfully');
      
      // Automatically select the new patient for emergency registration
      setSelectedPatientForRegistration(newPatient);
      
      // Switch to patient selection tab to show the selected patient
      setRegistrationTab('patient');
      
      // Reset form but keep it in the tab for reference
      setNewPatientForm({
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        email: '',
        address: ''
      });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast.error(error.message || 'Failed to register patient');
    } finally {
      setCreatingPatient(false);
    }
  };

  // ============= RENDER OVERVIEW =============
  
  const renderOverview = () => {
    // Ensure calculatedStats is always defined
    if (!calculatedStats) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        </div>
      );
    }
    
    return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Ambulance className="w-8 h-8 text-red-600" />
              <Badge className="bg-red-100 text-red-800">{calculatedStats?.total || 0}</Badge>
            </div>
            <p className="text-2xl font-bold text-red-900">{calculatedStats?.total || 0}</p>
            <p className="text-xs text-gray-600">Total ER Patients</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-800">{calculatedStats?.in_treatment || 0}</Badge>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{calculatedStats?.in_treatment || 0}</p>
            <p className="text-xs text-gray-600">In Treatment</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{calculatedStats?.awaiting_disposition || 0}</p>
            <p className="text-xs text-gray-600">Awaiting Disposition</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">{calculatedStats?.avg_wait_time || 0}m</Badge>
            </div>
            <p className="text-2xl font-bold text-green-900">{calculatedStats?.avg_wait_time || 0} min</p>
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
                { label: 'Registered', count: calculatedStats?.registered || 0, color: 'bg-blue-500', icon: UserPlus },
                { label: 'Triaged', count: calculatedStats?.triaged || 0, color: 'bg-purple-500', icon: ClipboardList },
                { label: 'In Treatment', count: calculatedStats?.in_treatment || 0, color: 'bg-yellow-500', icon: Stethoscope },
                { label: 'Awaiting Disposition', count: calculatedStats?.awaiting_disposition || 0, color: 'bg-orange-500', icon: AlertCircle },
                { label: 'Completed', count: calculatedStats?.completed || 0, color: 'bg-green-500', icon: CheckCircle }
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
                { label: 'Discharged Home', count: calculatedStats?.discharged || 0, color: 'bg-green-500', icon: Home },
                { label: 'Admitted to Ward', count: calculatedStats?.admitted_ward || 0, color: 'bg-blue-500', icon: Bed },
                { label: 'Admitted to Private Room', count: calculatedStats?.admitted_private || 0, color: 'bg-purple-500', icon: Building2 },
                { label: 'Transferred/Referred', count: calculatedStats?.transferred || 0, color: 'bg-orange-500', icon: Send }
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
              const count = calculatedStats?.triage_distribution?.[level] || 0;
              const percentage = (calculatedStats?.total || 0) > 0 ? (count / (calculatedStats?.total || 1) * 100).toFixed(0) : 0;
              
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
  };

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
              <div className="flex gap-2 pt-3 border-t flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 min-w-[120px]"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                
                {/* Status Transition Buttons */}
                {patient.currentStatus === 'registered' && (
                  <Button 
                    size="sm" 
                    className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      try {
                        await api.updateEmergencyStatus(patient.id, 'triaged');
                        toast.success('Status updated to Triaged');
                        loadData();
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to update status');
                      }
                    }}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Start Triage
                  </Button>
                )}
                
                {patient.currentStatus === 'triaged' && (
                  <Button 
                    size="sm" 
                    className="flex-1 min-w-[120px] bg-yellow-600 hover:bg-yellow-700"
                    onClick={async () => {
                      try {
                        await api.updateEmergencyStatus(patient.id, 'in-treatment');
                        toast.success('Status updated to In Treatment');
                        loadData();
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to update status');
                      }
                    }}
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Start Treatment
                  </Button>
                )}
                
                {patient.currentStatus === 'in-treatment' && (
                  <Button 
                    size="sm" 
                    className="flex-1 min-w-[120px] bg-orange-600 hover:bg-orange-700"
                    onClick={async () => {
                      try {
                        await api.updateEmergencyStatus(patient.id, 'awaiting-disposition');
                        toast.success('Status updated to Awaiting Disposition');
                        loadData();
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to update status');
                      }
                    }}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete Treatment
                  </Button>
                )}
                
                {patient.currentStatus === 'awaiting-disposition' && !patient.disposition && (
                  <Button 
                    size="sm" 
                    className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700"
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
          <Tabs value={registrationTab} onValueChange={setRegistrationTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="patient">Patient Selection</TabsTrigger>
              <TabsTrigger value="triage">Triage</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Info</TabsTrigger>
              <TabsTrigger value="new-patient">New Patient</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Search Existing Patient *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, phone, or patient ID..."
                      className="pl-10"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Search Results */}
                  {patientSearchQuery && patientSearchResults.length > 0 && !selectedPatientForRegistration && (
                    <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                      {patientSearchResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatientForRegistration(patient);
                            setPatientSearchQuery('');
                            setPatientSearchResults([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0 flex items-center gap-3"
                        >
                          <User className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              {patient.patient_id} • {patient.age}Y • {patient.gender} • {patient.phone}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Selected Patient */}
                  {selectedPatientForRegistration && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{selectedPatientForRegistration.name}</div>
                          <div className="text-sm text-gray-600">
                            {selectedPatientForRegistration.patient_id} • {selectedPatientForRegistration.age}Y • {selectedPatientForRegistration.gender}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatientForRegistration(null);
                          setPatientSearchQuery('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {!selectedPatientForRegistration && patientSearchQuery && patientSearchResults.length === 0 && !searchingPatients && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Patient not found. Switch to "New Patient" tab to register a new patient.</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Arrival Mode *</Label>
                  <Select
                    value={registrationForm.arrival_mode}
                    onValueChange={(value: any) => setRegistrationForm({ ...registrationForm, arrival_mode: value })}
                  >
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
              </div>
            </TabsContent>

            <TabsContent value="new-patient" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Register a new patient for emergency visit. After creating the patient, they will be automatically selected.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-patient-name">Name *</Label>
                    <Input
                      id="new-patient-name"
                      value={newPatientForm.name}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                      placeholder="Full name"
                      disabled={creatingPatient}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-patient-phone">Phone *</Label>
                    <Input
                      id="new-patient-phone"
                      value={newPatientForm.phone}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                      placeholder="Phone number"
                      disabled={creatingPatient}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-patient-age">Age *</Label>
                    <Input
                      id="new-patient-age"
                      type="number"
                      min="0"
                      max="150"
                      value={newPatientForm.age}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                      placeholder="Age in years"
                      disabled={creatingPatient}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-patient-gender">Gender *</Label>
                    <Select
                      value={newPatientForm.gender}
                      onValueChange={(value: 'Male' | 'Female' | 'Other') =>
                        setNewPatientForm({ ...newPatientForm, gender: value })
                      }
                      disabled={creatingPatient}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-patient-email">Email (Optional)</Label>
                  <Input
                    id="new-patient-email"
                    type="email"
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    placeholder="email@example.com"
                    disabled={creatingPatient}
                  />
                </div>

                <div>
                  <Label htmlFor="new-patient-address">Address (Optional)</Label>
                  <Input
                    id="new-patient-address"
                    value={newPatientForm.address}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                    placeholder="Street address"
                    disabled={creatingPatient}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewPatientForm({
                        name: '',
                        phone: '',
                        age: '',
                        gender: 'Male',
                        email: '',
                        address: ''
                      });
                    }}
                    disabled={creatingPatient}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateNewPatient}
                    disabled={creatingPatient}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {creatingPatient ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Patient & Continue
                      </>
                    )}
                  </Button>
                </div>

                {selectedPatientForRegistration && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Patient Created Successfully!</div>
                        <div className="text-sm">
                          {selectedPatientForRegistration.name} ({selectedPatientForRegistration.patient_id}) is now selected.
                          Continue to Triage tab to complete registration.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="triage" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Triage Level (ESI) *</Label>
                  <Select
                    value={registrationForm.triage_level.toString()}
                    onValueChange={(value) => setRegistrationForm({ ...registrationForm, triage_level: parseInt(value) as 1 | 2 | 3 | 4 | 5 })}
                  >
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
                    value={registrationForm.chief_complaint}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, chief_complaint: e.target.value })}
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
                    <Input 
                      placeholder="120/80" 
                      value={registrationForm.vitals.bp}
                      onChange={(e) => setRegistrationForm({ 
                        ...registrationForm, 
                        vitals: { ...registrationForm.vitals, bp: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <Label>Pulse Rate (bpm)</Label>
                    <Input 
                      type="number" 
                      placeholder="72"
                      value={registrationForm.vitals.pulse}
                      onChange={(e) => setRegistrationForm({ 
                        ...registrationForm, 
                        vitals: { ...registrationForm.vitals, pulse: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <Label>Temperature (°F)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="98.6"
                      value={registrationForm.vitals.temp}
                      onChange={(e) => setRegistrationForm({ 
                        ...registrationForm, 
                        vitals: { ...registrationForm.vitals, temp: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <Label>SpO2 (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="98"
                      value={registrationForm.vitals.spo2}
                      onChange={(e) => setRegistrationForm({ 
                        ...registrationForm, 
                        vitals: { ...registrationForm.vitals, spo2: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <Label>Respiratory Rate</Label>
                    <Input 
                      type="number" 
                      placeholder="16"
                      value={registrationForm.vitals.resp}
                      onChange={(e) => setRegistrationForm({ 
                        ...registrationForm, 
                        vitals: { ...registrationForm.vitals, resp: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Assign Doctor</Label>
                  <Select
                    value={registrationForm.assigned_doctor_id}
                    onValueChange={(value) => setRegistrationForm({ ...registrationForm, assigned_doctor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bed Assignment</Label>
                  <Select
                    value={registrationForm.bed_number}
                    onValueChange={(value) => setRegistrationForm({ ...registrationForm, bed_number: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {beds.map((bed) => (
                        <SelectItem key={bed.bed_number} value={bed.bed_number}>
                          {bed.bed_number}
                        </SelectItem>
                      ))}
                      {beds.length === 0 && (
                        <SelectItem value="" disabled>No beds available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-6 border-t">
            <Button 
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.preventDefault();
                console.log('Register Patient button clicked');
                handleRegisterPatient();
              }}
              disabled={submitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Registering...' : 'Register Patient'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                resetRegistrationForm();
                setActiveTab('overview');
              }}
              disabled={submitting}
            >
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
              <button
                type="button"
                onClick={() => setDispositionForm({ ...dispositionForm, disposition: 'discharge' })}
                className={`p-4 border-2 rounded-lg hover:bg-green-50 cursor-pointer transition-colors text-left ${
                  dispositionForm.disposition === 'discharge' ? 'border-green-500 bg-green-50' : 'border-green-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Discharge Home</h4>
                </div>
                <p className="text-xs text-gray-600">Patient is stable and can go home</p>
              </button>

              <button
                type="button"
                onClick={() => setDispositionForm({ ...dispositionForm, disposition: 'admit-ward' })}
                className={`p-4 border-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors text-left ${
                  dispositionForm.disposition === 'admit-ward' ? 'border-blue-500 bg-blue-50' : 'border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Bed className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Admit to Ward</h4>
                </div>
                <p className="text-xs text-gray-600">Requires further in-patient care</p>
              </button>

              <button
                type="button"
                onClick={() => setDispositionForm({ ...dispositionForm, disposition: 'admit-private' })}
                className={`p-4 border-2 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors text-left ${
                  dispositionForm.disposition === 'admit-private' ? 'border-purple-500 bg-purple-50' : 'border-purple-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Admit to Private Room</h4>
                </div>
                <p className="text-xs text-gray-600">Private room admission</p>
              </button>

              <button
                type="button"
                onClick={() => setDispositionForm({ ...dispositionForm, disposition: 'transfer' })}
                className={`p-4 border-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors text-left ${
                  dispositionForm.disposition === 'transfer' ? 'border-orange-500 bg-orange-50' : 'border-orange-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold">Transfer/Refer</h4>
                </div>
                <p className="text-xs text-gray-600">Transfer to another facility</p>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Disposition Details *</Label>
              <Textarea 
                placeholder="Discharge instructions, admission reason, transfer details, etc..."
                rows={3}
                value={dispositionForm.disposition_details}
                onChange={(e) => setDispositionForm({ ...dispositionForm, disposition_details: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Follow-up Required</Label>
                <Select
                  value={dispositionForm.follow_up_required ? 'yes' : 'no'}
                  onValueChange={(value) => setDispositionForm({ ...dispositionForm, follow_up_required: value === 'yes' })}
                >
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
                <Input 
                  type="date" 
                  value={dispositionForm.follow_up_date}
                  onChange={(e) => setDispositionForm({ ...dispositionForm, follow_up_date: e.target.value })}
                  disabled={!dispositionForm.follow_up_required}
                />
              </div>
            </div>

            <div>
              <Label>Medications Prescribed</Label>
              <Textarea 
                placeholder="List medications and dosages..."
                rows={2}
                value={dispositionForm.medications_prescribed}
                onChange={(e) => setDispositionForm({ ...dispositionForm, medications_prescribed: e.target.value })}
              />
            </div>
          </div>

          {(dispositionForm.disposition === 'admit-ward' || dispositionForm.disposition === 'admit-private') && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                After confirming disposition, you can create IPD admission from the patient detail view.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={async () => {
                try {
                  await handleDisposition();
                  if (dispositionForm.disposition === 'admit-ward' || dispositionForm.disposition === 'admit-private') {
                    toast.info('Disposition set. You can now create IPD admission from the patient detail view.');
                  }
                } catch (error: any) {
                  toast.error(error.message || 'Failed to set disposition');
                }
              }}
              disabled={submitting}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : 'Confirm Disposition'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setIsDispositionOpen(false);
                setSelectedPatient(null);
                setDispositionForm({
                  disposition: 'discharge',
                  disposition_details: '',
                  follow_up_required: false,
                  follow_up_date: '',
                  medications_prescribed: ''
                });
              }}
              disabled={submitting}
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

      {/* Patient Detail View */}
      {selectedPatient && (
        <EmergencyPatientDetail
          visit={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={() => {
            loadData();
            setSelectedPatient(null);
          }}
        />
      )}

    </div>
  );
}
