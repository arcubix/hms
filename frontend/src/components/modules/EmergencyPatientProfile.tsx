/**
 * Emergency Patient Profile Component
 * Complete patient profile with all medical information and management options
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import {
  ArrowLeft,
  User,
  Heart,
  Activity,
  FileText,
  TestTube,
  Scan,
  FolderOpen,
  Droplets,
  Droplet,
  Plus,
  Edit,
  Download,
  Printer,
  Eye,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  LineChart,
  Save,
  Upload,
  Search,
  Filter,
  Trash2,
  Send,
  FileCheck,
  ClipboardList,
  Syringe,
  Thermometer,
  Stethoscope,
  Building2,
  UserCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { UpdateVitalsDialog } from './UpdateVitalsDialog';
import { AddMedicationDialog } from './AddMedicationDialog';
import { AddLabOrderDialog } from './AddLabOrderDialog';
import { AddRadiologyOrderDialog } from './AddRadiologyOrderDialog';
import { AddNoteDialog } from './AddNoteDialog';
import { AddHealthPhysicalDialog } from './AddHealthPhysicalDialog';
import { AddIntakeOutputDialog } from './AddIntakeOutputDialog';
import { AddBloodRequestDialog } from './AddBloodRequestDialog';
import { UploadFileDialog } from './UploadFileDialog';
import { AddTimelineEventDialog } from './AddTimelineEventDialog';
import { ViewVitalDialog } from './ViewVitalDialog';
import { ViewLabResultDialog } from './ViewLabResultDialog';
import { ViewRadiologyResultDialog } from './ViewRadiologyResultDialog';
import { ViewHealthPhysicalDialog } from './ViewHealthPhysicalDialog';
import { ViewTimelineEventDialog } from './ViewTimelineEventDialog';
import { ViewBloodRequestDialog } from './ViewBloodRequestDialog';
import { EditMedicationDialog } from './EditMedicationDialog';
import { EditNoteDialog } from './EditNoteDialog';
import { EditHealthPhysicalDialog } from './EditHealthPhysicalDialog';
import { EditIntakeOutputDialog } from './EditIntakeOutputDialog';
import { api } from '../../services/api';
import type { 
  EmergencyVisit, 
  EmergencyVitalSign, 
  EmergencyMedication, 
  EmergencyInvestigationOrder,
  EmergencyTreatmentNote,
  EmergencyStatusHistory,
  EmergencyPatientFile,
  EmergencyIntakeOutput,
  EmergencyBloodBankRequest,
  EmergencyHealthPhysical,
  Patient
} from '../../services/api';

interface EmergencyPatientProfileProps {
  patient: any;
  onClose: () => void;
}

export function EmergencyPatientProfile({ patient, onClose }: EmergencyPatientProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddHP, setShowAddHP] = useState(false);
  const [showAddLabOrder, setShowAddLabOrder] = useState(false);
  const [showAddRadOrder, setShowAddRadOrder] = useState(false);
  const [showUpdateVitals, setShowUpdateVitals] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddIO, setShowAddIO] = useState(false);
  const [showAddBloodRequest, setShowAddBloodRequest] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showAddTimelineEvent, setShowAddTimelineEvent] = useState(false);
  
  // View/Edit dialog states
  const [viewVital, setViewVital] = useState<EmergencyVitalSign | null>(null);
  const [viewLabResult, setViewLabResult] = useState<EmergencyInvestigationOrder | null>(null);
  const [viewRadiologyResult, setViewRadiologyResult] = useState<EmergencyInvestigationOrder | null>(null);
  const [viewHP, setViewHP] = useState<EmergencyHealthPhysical | null>(null);
  const [viewTimelineEvent, setViewTimelineEvent] = useState<EmergencyStatusHistory | null>(null);
  const [viewBloodRequest, setViewBloodRequest] = useState<EmergencyBloodBankRequest | null>(null);
  const [editMedication, setEditMedication] = useState<EmergencyMedication | null>(null);
  const [editNote, setEditNote] = useState<EmergencyTreatmentNote | null>(null);
  const [editHP, setEditHP] = useState<EmergencyHealthPhysical | null>(null);
  const [editIO, setEditIO] = useState<EmergencyIntakeOutput | null>(null);
  
  // State for all data
  const [visitDetails, setVisitDetails] = useState<EmergencyVisit | null>(null);
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<EmergencyVitalSign[]>([]);
  const [medications, setMedications] = useState<EmergencyMedication[]>([]);
  const [labOrders, setLabOrders] = useState<EmergencyInvestigationOrder[]>([]);
  const [radiologyOrders, setRadiologyOrders] = useState<EmergencyInvestigationOrder[]>([]);
  const [notes, setNotes] = useState<EmergencyTreatmentNote[]>([]);
  const [files, setFiles] = useState<EmergencyPatientFile[]>([]);
  const [intakeOutput, setIntakeOutput] = useState<EmergencyIntakeOutput[]>([]);
  const [bloodRequests, setBloodRequests] = useState<EmergencyBloodBankRequest[]>([]);
  const [healthPhysical, setHealthPhysical] = useState<EmergencyHealthPhysical[]>([]);
  const [statusHistory, setStatusHistory] = useState<EmergencyStatusHistory[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [loadingLabOrders, setLoadingLabOrders] = useState(false);
  const [loadingRadiology, setLoadingRadiology] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingIO, setLoadingIO] = useState(false);
  const [loadingBlood, setLoadingBlood] = useState(false);
  const [loadingHP, setLoadingHP] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Get visit ID from patient prop - check multiple possible fields
  // The patient.id from EmergencyManagement is the emergency_visit_id (may be string or number)
  const visitId = patient?.id ? (typeof patient.id === 'string' ? parseInt(patient.id, 10) : patient.id) : null;

  // Load all data when component mounts or visitId changes
  useEffect(() => {
    if (visitId) {
      loadAllData();
    }
  }, [visitId]);

  const loadAllData = async () => {
    if (!visitId) return;
    
    setLoading(true);
    try {
      // Load visit details and patient info
      const visit = await api.getEmergencyVisit(visitId);
      setVisitDetails(visit);
      
      // Get patient_id from visit - check different possible field names
      const patientId = (visit as any).patient_id || (visit as any).patientId;
      if (patientId) {
        try {
          const patientData = await api.getPatient(patientId.toString());
          setPatientDetails(patientData);
        } catch (error) {
          console.error('Failed to load patient details:', error);
        }
      }
      
      // Always load vitals on initial load since Overview tab shows Current Vital Signs
      await loadVitals();
      
      // Load tab-specific data based on active tab
      loadTabData(activeTab);
    } catch (error: any) {
      toast.error('Failed to load patient profile: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: string) => {
    if (!visitId) return;

    switch (tab) {
      case 'overview':
        // Load vitals for Overview tab since it shows Current Vital Signs
        await loadVitals();
        break;
      case 'vitals':
        await loadVitals();
        break;
      case 'medications':
        await loadMedications();
        break;
      case 'labresults':
      case 'lab':
        await loadLabOrders();
        break;
      case 'radiology':
        await loadRadiology();
        break;
      case 'doctornotes':
        await loadNotes();
        break;
      case 'files':
        await loadFiles();
        break;
      case 'io':
        await loadIntakeOutput();
        break;
      case 'blood':
        await loadBloodRequests();
        break;
      case 'hp':
        await loadHealthPhysical();
        break;
      case 'timeline':
        await loadTimeline();
        break;
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (visitId && !loading) {
      loadTabData(activeTab);
    }
  }, [activeTab, visitId]);

  const loadVitals = async () => {
    if (!visitId) return;
    setLoadingVitals(true);
    try {
      const data = await api.getEmergencyVitals(visitId);
      // Ensure we set an empty array if no data, not undefined
      const vitalsArray = Array.isArray(data) ? data : [];
      setVitals(vitalsArray);
    } catch (error: any) {
      console.error('Error loading vitals:', error);
      // Set empty array on error to ensure no fallback to mock data
      setVitals([]);
      toast.error('Failed to load vitals: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingVitals(false);
    }
  };

  const loadMedications = async () => {
    if (!visitId) return;
    setLoadingMedications(true);
    try {
      const data = await api.getEmergencyMedications(visitId);
      setMedications(data);
    } catch (error: any) {
      toast.error('Failed to load medications: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingMedications(false);
    }
  };

  const loadLabOrders = async () => {
    if (!visitId) return;
    setLoadingLabOrders(true);
    try {
      const data = await api.getEmergencyInvestigations(visitId);
      const labData = data.filter((inv: EmergencyInvestigationOrder) => inv.investigation_type === 'lab');
      setLabOrders(labData);
    } catch (error: any) {
      toast.error('Failed to load lab orders: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingLabOrders(false);
    }
  };

  const loadRadiology = async () => {
    if (!visitId) return;
    setLoadingRadiology(true);
    try {
      const data = await api.getEmergencyInvestigations(visitId);
      const radData = data.filter((inv: EmergencyInvestigationOrder) => inv.investigation_type === 'radiology');
      setRadiologyOrders(radData);
    } catch (error: any) {
      toast.error('Failed to load radiology orders: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingRadiology(false);
    }
  };

  const loadNotes = async () => {
    if (!visitId) return;
    setLoadingNotes(true);
    try {
      const data = await api.getEmergencyNotes(visitId, { note_type: 'doctor' });
      setNotes(data);
    } catch (error: any) {
      toast.error('Failed to load notes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadFiles = async () => {
    if (!visitId) return;
    setLoadingFiles(true);
    try {
      const data = await api.getEmergencyPatientFiles(visitId);
      setFiles(data);
    } catch (error: any) {
      toast.error('Failed to load files: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadIntakeOutput = async () => {
    if (!visitId) return;
    setLoadingIO(true);
    try {
      const data = await api.getEmergencyIntakeOutput(visitId);
      setIntakeOutput(data);
    } catch (error: any) {
      toast.error('Failed to load I/O records: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingIO(false);
    }
  };

  const loadBloodRequests = async () => {
    if (!visitId) return;
    setLoadingBlood(true);
    try {
      const data = await api.getEmergencyBloodBankRequests(visitId);
      setBloodRequests(data);
    } catch (error: any) {
      toast.error('Failed to load blood requests: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingBlood(false);
    }
  };

  const loadHealthPhysical = async () => {
    if (!visitId) return;
    setLoadingHP(true);
    try {
      const data = await api.getEmergencyHealthPhysical(visitId);
      setHealthPhysical(data);
    } catch (error: any) {
      toast.error('Failed to load H&P records: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingHP(false);
    }
  };

  const loadTimeline = async () => {
    if (!visitId) return;
    setLoadingTimeline(true);
    try {
      const data = await api.getEmergencyTimeline(visitId);
      setStatusHistory(data);
    } catch (error: any) {
      toast.error('Failed to load timeline: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    try {
      const exportData = {
        patient: {
          name: patient.name,
          uhid: patient.uhid,
          age: patient.age,
          gender: patient.gender,
          erNumber: patient.erNumber || visitDetails?.erNumber,
          status: patient.status
        },
        visit: visitDetails,
        vitals: vitals,
        medications: medications,
        labOrders: labOrders,
        radiologyOrders: radiologyOrders,
        notes: notes,
        files: files,
        intakeOutput: intakeOutput,
        bloodRequests: bloodRequests,
        healthPhysical: healthPhysical,
        timeline: statusHistory
      };

      // Create CSV content
      const csvRows: string[] = [];
      csvRows.push('Emergency Patient Profile Export');
      csvRows.push(`Generated: ${new Date().toLocaleString()}`);
      csvRows.push('');
      csvRows.push('PATIENT INFORMATION');
      csvRows.push(`Name,${exportData.patient.name}`);
      csvRows.push(`UHID,${exportData.patient.uhid}`);
      csvRows.push(`ER Number,${exportData.patient.erNumber}`);
      csvRows.push(`Age,${exportData.patient.age}`);
      csvRows.push(`Gender,${exportData.patient.gender}`);
      csvRows.push(`Status,${exportData.patient.status}`);
      csvRows.push('');
      csvRows.push('VITAL SIGNS');
      csvRows.push('Date,Time,BP,Pulse,Temp,SpO2,Respiratory Rate');
      vitals.forEach(v => {
        const date = new Date(v.recorded_at);
        csvRows.push(`${date.toLocaleDateString()},${date.toLocaleTimeString()},${v.bp || ''},${v.pulse || ''},${v.temp || ''},${v.spo2 || ''},${v.resp || ''}`);
      });
      csvRows.push('');
      csvRows.push('MEDICATIONS');
      csvRows.push('Medication,Dosage,Route,Frequency,Status,Administered At');
      medications.forEach(m => {
        csvRows.push(`${m.medication_name},${m.dosage},${m.route},${m.frequency || ''},${m.status},${m.administered_at || ''}`);
      });
      csvRows.push('');
      csvRows.push('LAB ORDERS');
      csvRows.push('Test Name,Ordered Date,Status,Priority,Result');
      labOrders.forEach(o => {
        csvRows.push(`${o.test_name},${new Date(o.ordered_at).toLocaleString()},${o.status},${o.priority},${o.result_value || ''}`);
      });
      csvRows.push('');
      csvRows.push('NOTES');
      csvRows.push('Date,Time,Note,Provider');
      notes.forEach(n => {
        const date = new Date(n.recorded_at || '');
        csvRows.push(`${date.toLocaleDateString()},${date.toLocaleTimeString()},"${n.note_text.replace(/"/g, '""')}",${n.recorded_by_name || ''}`);
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Emergency_Profile_${patient.uhid}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Patient profile exported successfully!');
    } catch (error: any) {
      console.error('Error exporting:', error);
      toast.error('Failed to export: ' + (error.message || 'Unknown error'));
    }
  };

  // Download handlers
  const handleDownloadLabResult = (order: EmergencyInvestigationOrder) => {
    if (order.result_value) {
      // Create a text file with the result
      const blob = new Blob([order.result_value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lab_Result_${order.test_name}_${order.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Lab result downloaded');
    } else {
      toast.error('No result available to download');
    }
  };

  const handleDownloadRadiologyResult = (order: EmergencyInvestigationOrder) => {
    if (order.result_value) {
      // Create a text file with the result
      const blob = new Blob([order.result_value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Radiology_Report_${order.test_name}_${order.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Radiology report downloaded');
    } else {
      toast.error('No report available to download');
    }
  };

  // Blood bank issue handler
  const handleIssueBlood = async (request: EmergencyBloodBankRequest) => {
    if (!visitId) return;
    
    try {
      await api.updateEmergencyBloodBankRequest(visitId, request.id, {
        status: 'Issued'
      });
      toast.success('Blood product issued successfully!');
      loadBloodRequests();
    } catch (error: any) {
      toast.error('Failed to issue blood product: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {patient.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>UHID: {patient.uhid}</span>
                    <span>•</span>
                    <span>ER: {patient.erNumber}</span>
                    <span>•</span>
                    <span>{patient.age}Y / {patient.gender}</span>
                  </div>
                </div>
              </div>
              <Badge className={
                patient.status === 'Critical' ? 'bg-red-100 text-red-800' :
                patient.status === 'Stable' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {patient.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white" 
                size="sm"
                onClick={() => setShowUpdateVitals(true)}
              >
                <Activity className="w-4 h-4 mr-2" />
                Update Vitals
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport()}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Ward</p>
              <p className="font-bold text-blue-700">{visitDetails?.disposition === 'admit-ward' ? 'Ward' : visitDetails?.disposition === 'admit-private' ? 'Private' : visitDetails?.bedNumber ? 'ER' : patient.assignedWard || 'N/A'}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Bed</p>
              <p className="font-bold text-purple-700">{visitDetails?.bedNumber || patient.bedNumber || 'N/A'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Doctor</p>
              <p className="text-sm font-bold text-green-700">{visitDetails?.assignedDoctor || patient.attendingDoctor || 'N/A'}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Arrival</p>
              <p className="text-sm font-bold text-orange-700">{visitDetails?.arrivalTime ? new Date(visitDetails.arrivalTime).toLocaleDateString() : patient.admissionDate || 'N/A'}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Triage</p>
              <p className="font-bold text-red-700">ESI {visitDetails?.triageLevel || patient.triageLevel || 'N/A'}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium">Status</p>
              <p className="text-sm font-bold text-indigo-700">{visitDetails?.currentStatus || patient.status || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-12 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="labresults">Lab Results</TabsTrigger>
            <TabsTrigger value="radiology">Radiology</TabsTrigger>
            <TabsTrigger value="doctornotes">Doctor's Notes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="hp">H&P</TabsTrigger>
            <TabsTrigger value="lab">Lab Orders</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="io">I/O</TabsTrigger>
            <TabsTrigger value="blood">Blood Bank</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Demographics */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-base">Patient Demographics</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{patient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{patient.age} Years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{patientDetails?.phone || visitDetails?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-xs">{patientDetails?.email || visitDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{patientDetails?.address ? `${patientDetails.address}${patientDetails.city ? ', ' + patientDetails.city : ''}${patientDetails.state ? ', ' + patientDetails.state : ''}` : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Admission */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <CardTitle className="text-base">Current Admission</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Chief Complaint</p>
                    <p className="font-medium text-red-700">{visitDetails?.chiefComplaint || patient.diagnosis || 'N/A'}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bed:</span>
                    <span className="font-medium">{visitDetails?.bedNumber || patient.bedNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Attending Doctor:</span>
                    <span className="font-medium text-xs">{visitDetails?.assignedDoctor || patient.attendingDoctor || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nurse:</span>
                    <span className="font-medium text-xs">{visitDetails?.assignedNurse || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Arrival Date:</span>
                    <span className="font-medium">{visitDetails?.arrivalTime ? new Date(visitDetails.arrivalTime).toLocaleDateString() : patient.admissionDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Arrival Time:</span>
                    <span className="font-medium">{visitDetails?.arrivalTime ? new Date(visitDetails.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : patient.admissionTime || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Vital Signs */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="text-base">Current Vital Signs</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {(() => {
                    // Get the latest vital sign record - sort by recorded_at descending to get most recent
                    // Only use data from the vitals array (from API), no fallback to mock data
                    // Ensure vitals is an array
                    const vitalsArray = Array.isArray(vitals) ? vitals : [];
                    
                    const sortedVitals = [...vitalsArray].sort((a, b) => {
                      const dateA = new Date(a.recorded_at || a.created_at || 0).getTime();
                      const dateB = new Date(b.recorded_at || b.created_at || 0).getTime();
                      return dateB - dateA; // Descending order (newest first)
                    });
                    const latestVital = sortedVitals.length > 0 ? sortedVitals[0] : null;
                    
                    return (
                      <>
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm text-gray-600">Blood Pressure</span>
                          <span className="font-bold text-red-700">{latestVital?.bp || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm text-gray-600">Pulse Rate</span>
                          <span className="font-bold text-blue-700">{latestVital?.pulse !== undefined && latestVital.pulse !== null ? `${latestVital.pulse} bpm` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm text-gray-600">Temperature</span>
                          <span className="font-bold text-orange-700">{latestVital?.temp !== undefined && latestVital.temp !== null ? `${latestVital.temp}°F` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-gray-600">SpO2</span>
                          <span className="font-bold text-green-700">{latestVital?.spo2 !== undefined && latestVital.spo2 !== null ? `${latestVital.spo2}%` : 'N/A'}</span>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <TestTube className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">{labOrders.length}</p>
                  <p className="text-sm text-blue-600">Lab Orders</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Scan className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-700">{radiologyOrders.length}</p>
                  <p className="text-sm text-purple-600">Radiology Orders</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-700">{files.length}</p>
                  <p className="text-sm text-green-600">Patient Files</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6 text-center">
                  <Droplet className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700">{bloodRequests.length}</p>
                  <p className="text-sm text-red-600">Blood Requests</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6 mt-6">
            <VitalsTabContent 
              patient={patient} 
              vitals={vitals} 
              loading={loadingVitals} 
              onRefresh={loadVitals}
              visitId={visitId}
              onAddVitals={() => setShowUpdateVitals(true)}
              onView={(vital) => setViewVital(vital)}
            />
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6 mt-6">
            <MedicationsTab 
              patient={patient} 
              medications={medications} 
              loading={loadingMedications}
              visitId={visitId}
              onAdd={() => setShowAddMedication(true)}
              onRefresh={loadMedications}
              onEdit={(med) => setEditMedication(med)}
            />
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="labresults" className="space-y-6 mt-6">
            <LabResultsTab 
              patient={patient} 
              labOrders={labOrders.filter(o => o.status === 'completed')} 
              loading={loadingLabOrders}
              visitId={visitId}
              onAdd={() => setShowAddLabOrder(true)}
              onRefresh={loadLabOrders}
              onView={(order) => setViewLabResult(order)}
              onDownload={(order) => handleDownloadLabResult(order)}
            />
          </TabsContent>

          {/* Radiology Tab */}
          <TabsContent value="radiology" className="space-y-6 mt-6">
            <RadiologyOrdersTab 
              patient={patient} 
              radiologyOrders={radiologyOrders} 
              loading={loadingRadiology}
              visitId={visitId}
              onAdd={() => setShowAddRadOrder(true)}
              onRefresh={loadRadiology}
            />
          </TabsContent>

          {/* Doctor's Notes Tab */}
          <TabsContent value="doctornotes" className="space-y-6 mt-6">
            <DoctorNotesTab 
              patient={patient} 
              notes={notes} 
              loading={loadingNotes}
              visitId={visitId}
              onAdd={() => setShowAddNote(true)}
              onRefresh={loadNotes}
              onEdit={(note) => setEditNote(note)}
            />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            <TimelineTab 
              patient={patient} 
              statusHistory={statusHistory}
              vitals={vitals}
              medications={medications}
              labOrders={labOrders}
              radiologyOrders={radiologyOrders}
              notes={notes}
              healthPhysical={healthPhysical}
              intakeOutput={intakeOutput}
              bloodRequests={bloodRequests}
              files={files}
              loading={loadingTimeline || loadingVitals || loadingMedications || loadingLabOrders || loadingRadiology || loadingNotes || loadingHP || loadingIO || loadingBlood || loadingFiles}
              visitId={visitId}
              currentStatus={visitDetails?.currentStatus}
              onAdd={() => setShowAddTimelineEvent(true)}
              onRefresh={loadTimeline}
              onView={(event) => setViewTimelineEvent(event)}
            />
          </TabsContent>

          {/* Health & Physical Tab */}
          <TabsContent value="hp" className="space-y-6 mt-6">
            <HealthPhysicalTab 
              patient={patient} 
              healthPhysical={healthPhysical} 
              loading={loadingHP}
              visitId={visitId}
              onAdd={() => setShowAddHP(true)}
              onRefresh={loadHealthPhysical}
              onView={(hp) => setViewHP(hp)}
              onEdit={(hp) => setEditHP(hp)}
            />
          </TabsContent>

          {/* Lab Orders Tab */}
          <TabsContent value="lab" className="space-y-6 mt-6">
            <LabOrdersTab 
              patient={patient} 
              labOrders={labOrders} 
              loading={loadingLabOrders}
              visitId={visitId}
              onAdd={() => setShowAddLabOrder(true)}
              onRefresh={loadLabOrders}
              onView={(order) => setViewLabResult(order)}
              onDownload={(order) => handleDownloadLabResult(order)}
            />
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6 mt-6">
            <FilesTab 
              patient={patient} 
              files={files} 
              loading={loadingFiles} 
              visitId={visitId} 
              onRefresh={loadFiles}
              onUpload={() => setShowUploadFile(true)}
            />
          </TabsContent>

          {/* Intake & Output Tab */}
          <TabsContent value="io" className="space-y-6 mt-6">
            <IntakeOutputTab 
              patient={patient} 
              intakeOutput={intakeOutput} 
              loading={loadingIO} 
              visitId={visitId}
              onAdd={() => setShowAddIO(true)}
              onRefresh={loadIntakeOutput}
              onEdit={(io) => setEditIO(io)}
            />
          </TabsContent>

          {/* Blood Bank Tab */}
          <TabsContent value="blood" className="space-y-6 mt-6">
            <BloodBankTab 
              patient={patient} 
              bloodRequests={bloodRequests} 
              patientBloodGroup={patientDetails?.blood_group || visitDetails?.bloodGroup} 
              loading={loadingBlood} 
              visitId={visitId} 
              onRefresh={loadBloodRequests}
              onAdd={() => setShowAddBloodRequest(true)}
              onView={(request) => setViewBloodRequest(request)}
              onIssue={(request) => handleIssueBlood(request)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Vitals Dialog */}
      {showUpdateVitals && visitId && (
        <UpdateVitalsDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowUpdateVitals(false)}
          onSave={async () => {
            setShowUpdateVitals(false);
            // Wait a bit for the database to be updated, then reload vitals
            setTimeout(async () => {
              await loadVitals();
            }, 500);
          }}
        />
      )}

      {/* Add Medication Dialog */}
      {showAddMedication && visitId && (
        <AddMedicationDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddMedication(false)}
          onSave={() => {
            setShowAddMedication(false);
            loadMedications();
          }}
        />
      )}

      {/* Add Lab Order Dialog */}
      {showAddLabOrder && visitId && (
        <AddLabOrderDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddLabOrder(false)}
          onSave={() => {
            setShowAddLabOrder(false);
            loadLabOrders();
          }}
        />
      )}

      {/* Add Radiology Order Dialog */}
      {showAddRadOrder && visitId && (
        <AddRadiologyOrderDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddRadOrder(false)}
          onSave={() => {
            setShowAddRadOrder(false);
            loadRadiology();
          }}
        />
      )}

      {/* Add Note Dialog */}
      {showAddNote && visitId && (
        <AddNoteDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddNote(false)}
          onSave={() => {
            setShowAddNote(false);
            loadNotes();
          }}
        />
      )}

      {/* Add Health & Physical Dialog */}
      {showAddHP && visitId && (
        <AddHealthPhysicalDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddHP(false)}
          onSave={() => {
            setShowAddHP(false);
            loadHealthPhysical();
          }}
        />
      )}

      {/* Add Intake Output Dialog */}
      {showAddIO && visitId && (
        <AddIntakeOutputDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowAddIO(false)}
          onSave={() => {
            setShowAddIO(false);
            loadIntakeOutput();
          }}
        />
      )}

      {/* Add Blood Request Dialog */}
      {showAddBloodRequest && visitId && (
        <AddBloodRequestDialog
          patient={patient}
          visitId={visitId}
          patientBloodGroup={patientDetails?.blood_group || visitDetails?.bloodGroup}
          onClose={() => setShowAddBloodRequest(false)}
          onSave={() => {
            setShowAddBloodRequest(false);
            loadBloodRequests();
          }}
        />
      )}

      {/* Upload File Dialog */}
      {showUploadFile && visitId && (
        <UploadFileDialog
          patient={patient}
          visitId={visitId}
          onClose={() => setShowUploadFile(false)}
          onSave={() => {
            setShowUploadFile(false);
            loadFiles();
          }}
        />
      )}

      {/* Add Timeline Event Dialog */}
      {showAddTimelineEvent && visitId && (
        <AddTimelineEventDialog
          patient={patient}
          visitId={visitId}
          currentStatus={visitDetails?.currentStatus}
          onClose={() => setShowAddTimelineEvent(false)}
          onSave={() => {
            setShowAddTimelineEvent(false);
            loadTimeline();
            loadAllData(); // Refresh visit details to get updated status
          }}
        />
      )}

      {/* View Dialogs */}
      {viewVital && (
        <ViewVitalDialog
          vital={viewVital}
          patient={patient}
          onClose={() => setViewVital(null)}
        />
      )}

      {viewLabResult && (
        <ViewLabResultDialog
          order={viewLabResult}
          patient={patient}
          onClose={() => setViewLabResult(null)}
          onDownload={() => handleDownloadLabResult(viewLabResult)}
        />
      )}

      {viewRadiologyResult && (
        <ViewRadiologyResultDialog
          order={viewRadiologyResult}
          patient={patient}
          onClose={() => setViewRadiologyResult(null)}
          onDownload={() => handleDownloadRadiologyResult(viewRadiologyResult)}
        />
      )}

      {viewHP && (
        <ViewHealthPhysicalDialog
          hp={viewHP}
          patient={patient}
          onClose={() => setViewHP(null)}
        />
      )}

      {viewTimelineEvent && (
        <ViewTimelineEventDialog
          event={viewTimelineEvent}
          patient={patient}
          onClose={() => setViewTimelineEvent(null)}
        />
      )}

      {viewBloodRequest && (
        <ViewBloodRequestDialog
          request={viewBloodRequest}
          patient={patient}
          onClose={() => setViewBloodRequest(null)}
        />
      )}

      {/* Edit Dialogs */}
      {editMedication && visitId && (
        <EditMedicationDialog
          medication={editMedication}
          patient={patient}
          visitId={visitId}
          onClose={() => setEditMedication(null)}
          onSave={() => {
            setEditMedication(null);
            loadMedications();
          }}
        />
      )}

      {editNote && visitId && (
        <EditNoteDialog
          note={editNote}
          patient={patient}
          visitId={visitId}
          onClose={() => setEditNote(null)}
          onSave={() => {
            setEditNote(null);
            loadNotes();
          }}
        />
      )}

      {editHP && visitId && (
        <EditHealthPhysicalDialog
          hp={editHP}
          patient={patient}
          visitId={visitId}
          onClose={() => setEditHP(null)}
          onSave={() => {
            setEditHP(null);
            loadHealthPhysical();
          }}
        />
      )}

      {editIO && visitId && (
        <EditIntakeOutputDialog
          io={editIO}
          patient={patient}
          visitId={visitId}
          onClose={() => setEditIO(null)}
          onSave={() => {
            setEditIO(null);
            loadIntakeOutput();
          }}
        />
      )}
    </div>
  );
}

// ============= VITALS TAB COMPONENT =============
function VitalsTabContent({ patient, vitals, loading, onRefresh, visitId, onAddVitals, onView }: { 
  patient: any; 
  vitals: EmergencyVitalSign[]; 
  loading: boolean;
  onRefresh: () => void;
  visitId?: number | null;
  onAddVitals?: () => void;
  onView?: (vital: EmergencyVitalSign) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading vitals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patient Vital Signs</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAddVitals || onRefresh}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vital Signs
        </Button>
      </div>

      {/* Two Divs: Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-600" />
                Vital Signs Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Blood Pressure Chart */}
              <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border-2 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-red-900">Blood Pressure Trend</p>
                  <Badge className="bg-red-600 text-white">24h</Badge>
                </div>
                <div className="h-32 flex items-end justify-around gap-2">
                  {(() => {
                    // Get last 7 BP readings, parse systolic (first number) from BP string
                    const bpReadings = vitals
                      .filter(v => v.bp)
                      .slice(-7)
                      .map(v => {
                        const bpMatch = v.bp?.match(/(\d+)/);
                        return bpMatch ? parseInt(bpMatch[1], 10) : 0;
                      });
                    const maxBp = Math.max(...bpReadings, 150);
                    return bpReadings.length > 0 ? bpReadings.map((val, idx) => (
                      <div key={idx} className="flex-1 bg-red-400 rounded-t" style={{ height: `${(val / maxBp) * 100}%` }}></div>
                    )) : (
                      <div className="w-full text-center text-sm text-gray-500">No BP data available</div>
                    );
                  })()}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Last {Math.min(vitals.filter(v => v.bp).length, 7)} readings</p>
              </div>

              {/* Heart Rate Chart */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-blue-900">Heart Rate Trend</p>
                  <Badge className="bg-blue-600 text-white">24h</Badge>
                </div>
                <div className="h-32 flex items-end justify-around gap-2">
                  {(() => {
                    const pulseReadings = vitals
                      .filter(v => v.pulse !== undefined && v.pulse !== null)
                      .slice(-7)
                      .map(v => v.pulse || 0);
                    const maxPulse = Math.max(...pulseReadings, 100);
                    return pulseReadings.length > 0 ? pulseReadings.map((val, idx) => (
                      <div key={idx} className="flex-1 bg-blue-400 rounded-t" style={{ height: `${(val / maxPulse) * 100}%` }}></div>
                    )) : (
                      <div className="w-full text-center text-sm text-gray-500">No pulse data available</div>
                    );
                  })()}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Last {Math.min(vitals.filter(v => v.pulse !== undefined && v.pulse !== null).length, 7)} readings</p>
              </div>

              {/* SpO2 Chart */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-green-900">SpO2 Trend</p>
                  <Badge className="bg-green-600 text-white">24h</Badge>
                </div>
                <div className="h-32 flex items-end justify-around gap-2">
                  {(() => {
                    const spo2Readings = vitals
                      .filter(v => v.spo2 !== undefined && v.spo2 !== null)
                      .slice(-7)
                      .map(v => v.spo2 || 0);
                    const maxSpo2 = Math.max(...spo2Readings, 100);
                    return spo2Readings.length > 0 ? spo2Readings.map((val, idx) => (
                      <div key={idx} className="flex-1 bg-green-400 rounded-t" style={{ height: `${(val / maxSpo2) * 100}%` }}></div>
                    )) : (
                      <div className="w-full text-center text-sm text-gray-500">No SpO2 data available</div>
                    );
                  })()}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Last {Math.min(vitals.filter(v => v.spo2 !== undefined && v.spo2 !== null).length, 7)} readings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Vital Signs History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ScrollArea className="h-[600px] pr-4">
                {vitals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No vital signs recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vitals.map((vital) => {
                      const recordDate = new Date(vital.recorded_at);
                      return (
                        <div key={vital.id} className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {recordDate.toLocaleDateString()} - {recordDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-gray-600">Recorded by: {vital.recorded_by_name || 'Unknown'}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => onView?.(vital)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {vital.bp && (
                              <div className="p-2 bg-red-50 rounded">
                                <p className="text-xs text-gray-600">Blood Pressure</p>
                                <p className="font-bold text-red-700">{vital.bp}</p>
                              </div>
                            )}
                            {vital.pulse !== undefined && vital.pulse !== null && (
                              <div className="p-2 bg-blue-50 rounded">
                                <p className="text-xs text-gray-600">Pulse</p>
                                <p className="font-bold text-blue-700">{vital.pulse} bpm</p>
                              </div>
                            )}
                            {vital.temp !== undefined && vital.temp !== null && (
                              <div className="p-2 bg-orange-50 rounded">
                                <p className="text-xs text-gray-600">Temperature</p>
                                <p className="font-bold text-orange-700">{vital.temp}°F</p>
                              </div>
                            )}
                            {vital.spo2 !== undefined && vital.spo2 !== null && (
                              <div className="p-2 bg-green-50 rounded">
                                <p className="text-xs text-gray-600">SpO2</p>
                                <p className="font-bold text-green-700">{vital.spo2}%</p>
                              </div>
                            )}
                          </div>
                          {vital.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600">Notes:</p>
                              <p className="text-sm mt-1">{vital.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============= MEDICATIONS TAB COMPONENT =============
function MedicationsTab({ patient, medications, loading, visitId, onAdd, onRefresh, onEdit }: { 
  patient: any; 
  medications: EmergencyMedication[];
  loading: boolean;
  visitId?: number | null;
  onAdd?: () => void;
  onRefresh?: () => void;
  onEdit?: (med: EmergencyMedication) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading medications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Medications</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medication Orders</CardTitle>
          <CardDescription>Current and past medication orders</CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No medications recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Administered At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Administered By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => {
                  const adminDate = med.administered_at ? new Date(med.administered_at) : null;
                  return (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.medication_name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.route}</TableCell>
                      <TableCell>{med.frequency || 'N/A'}</TableCell>
                      <TableCell>
                        {adminDate ? adminDate.toLocaleString() : 'Not administered'}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          med.status === 'given' ? 'bg-green-100 text-green-800' :
                          med.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          med.status === 'missed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {med.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{med.administered_by_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit?.(med)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= LAB RESULTS TAB COMPONENT =============
function LabResultsTab({ patient, labOrders, loading, visitId, onAdd, onRefresh, onView, onDownload }: { 
  patient: any; 
  labOrders: EmergencyInvestigationOrder[];
  loading: boolean;
  visitId?: number | null;
  onAdd?: () => void;
  onRefresh?: () => void;
  onView?: (order: EmergencyInvestigationOrder) => void;
  onDownload?: (order: EmergencyInvestigationOrder) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading lab results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lab Results</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lab Result
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          {labOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No completed lab results yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Ordered Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Ordered By</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labOrders.map((order) => {
                  const orderDate = new Date(order.ordered_at);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.test_name}</TableCell>
                      <TableCell>{orderDate.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          order.priority === 'stat' ? 'bg-red-100 text-red-800' :
                          order.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.ordered_by_name || 'N/A'}</TableCell>
                      <TableCell>{order.result_value || 'Pending'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onView?.(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => onDownload?.(order)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= HEALTH & PHYSICAL TAB =============
function HealthPhysicalTab({ patient, healthPhysical, loading, visitId, onAdd, onRefresh, onView, onEdit }: { 
  patient: any; 
  healthPhysical: EmergencyHealthPhysical[];
  loading: boolean;
  visitId?: number | null;
  onAdd?: () => void;
  onRefresh?: () => void;
  onView?: (hp: EmergencyHealthPhysical) => void;
  onEdit?: (hp: EmergencyHealthPhysical) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading H&P records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Health & Physical (H&P)</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add H&P Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>H&P Records</CardTitle>
          <CardDescription>Complete history and physical examination records</CardDescription>
        </CardHeader>
        <CardContent>
          {healthPhysical.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No H&P records yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Physical Exam</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthPhysical.map((hp) => {
                  const examDate = new Date(hp.examination_date);
                  return (
                    <TableRow key={hp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{examDate.toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{examDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </TableCell>
                      <TableCell>{hp.chief_complaint || 'N/A'}</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">{hp.physical_examination || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">{hp.assessment || 'N/A'}</p>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{hp.plan || 'N/A'}</TableCell>
                      <TableCell>{hp.provider_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onView?.(hp)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onEdit?.(hp)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= LAB ORDERS TAB =============
function LabOrdersTab({ patient, labOrders, loading, visitId, onAdd, onRefresh, onView, onDownload }: { 
  patient: any; 
  labOrders: EmergencyInvestigationOrder[];
  loading: boolean;
  visitId?: number | null;
  onAdd?: () => void;
  onRefresh?: () => void;
  onView?: (order: EmergencyInvestigationOrder) => void;
  onDownload?: (order: EmergencyInvestigationOrder) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading lab orders...</span>
      </div>
    );
  }

  const pendingCount = labOrders.filter(o => o.status === 'ordered').length;
  const completedCount = labOrders.filter(o => o.status === 'completed').length;
  const inProgressCount = labOrders.filter(o => o.status === 'in-progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Laboratory Orders</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          New Lab Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-700">{pendingCount}</p>
            <p className="text-sm text-blue-600 mt-1">Pending Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-700">{completedCount}</p>
            <p className="text-sm text-green-600 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-700">{inProgressCount}</p>
            <p className="text-sm text-orange-600 mt-1">In Progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {labOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No lab orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Ordered Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Ordered By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labOrders.map((order) => {
                  const orderDate = new Date(order.ordered_at);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.test_name}</TableCell>
                      <TableCell>{orderDate.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          order.priority === 'stat' ? 'bg-red-100 text-red-800' :
                          order.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.ordered_by_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onView?.(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => onDownload?.(order)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= RADIOLOGY ORDERS TAB =============
function RadiologyOrdersTab({ patient, radiologyOrders, loading, visitId, onAdd, onRefresh, onView, onDownload }: { 
  patient: any; 
  radiologyOrders: EmergencyInvestigationOrder[];
  loading: boolean;
  visitId?: number | null;
  onAdd?: () => void;
  onRefresh?: () => void;
  onView?: (order: EmergencyInvestigationOrder) => void;
  onDownload?: (order: EmergencyInvestigationOrder) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading radiology orders...</span>
      </div>
    );
  }

  const pendingCount = radiologyOrders.filter(o => o.status === 'ordered').length;
  const completedCount = radiologyOrders.filter(o => o.status === 'completed').length;
  const inProgressCount = radiologyOrders.filter(o => o.status === 'in-progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Radiology Orders</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          New Radiology Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-purple-700">{pendingCount}</p>
            <p className="text-sm text-purple-600 mt-1">Pending Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-700">{completedCount}</p>
            <p className="text-sm text-green-600 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-700">{inProgressCount}</p>
            <p className="text-sm text-orange-600 mt-1">In Progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Radiology Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {radiologyOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No radiology orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Ordered Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Ordered By</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {radiologyOrders.map((order) => {
                  const orderDate = new Date(order.ordered_at);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.test_name}</TableCell>
                      <TableCell>{orderDate.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          order.priority === 'stat' ? 'bg-red-100 text-red-800' :
                          order.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.ordered_by_name || 'N/A'}</TableCell>
                      <TableCell>{order.result_value || 'Pending'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onView?.(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => onDownload?.(order)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= DOCTOR'S NOTES TAB =============
function DoctorNotesTab({ patient, notes, loading, visitId, onAdd, onRefresh, onEdit }: { 
  patient: any; 
  notes: EmergencyTreatmentNote[];
  loading: boolean;
  visitId?: number | null;
  onAdd?: () => void;
  onRefresh?: () => void;
  onEdit?: (note: EmergencyTreatmentNote) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Doctor's Notes</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No doctor's notes recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => {
                  const noteDate = note.recorded_at ? new Date(note.recorded_at) : new Date();
                  return (
                    <TableRow key={note.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{noteDate.toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{noteDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{note.note_text}</p>
                      </TableCell>
                      <TableCell>{note.recorded_by_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit?.(note)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= TIMELINE TAB =============
function TimelineTab({ 
  patient, 
  statusHistory, 
  vitals,
  medications,
  labOrders,
  radiologyOrders,
  notes,
  healthPhysical,
  intakeOutput,
  bloodRequests,
  files,
  loading, 
  visitId, 
  currentStatus, 
  onAdd, 
  onRefresh, 
  onView 
}: { 
  patient: any; 
  statusHistory: EmergencyStatusHistory[];
  vitals: EmergencyVitalSign[];
  medications: EmergencyMedication[];
  labOrders: EmergencyInvestigationOrder[];
  radiologyOrders: EmergencyInvestigationOrder[];
  notes: EmergencyTreatmentNote[];
  healthPhysical: EmergencyHealthPhysical[];
  intakeOutput: EmergencyIntakeOutput[];
  bloodRequests: EmergencyBloodBankRequest[];
  files: EmergencyPatientFile[];
  loading: boolean;
  visitId?: number | null;
  currentStatus?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  onView?: (event: EmergencyStatusHistory) => void;
}) {
  // Combine all events into a unified timeline
  const timelineEvents: Array<{
    id: string;
    type: string;
    timestamp: Date;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    by?: string;
    data?: any;
  }> = [];

  // Add status history events
  statusHistory.forEach((event) => {
    const statusChange = event.from_status 
      ? `Status changed from ${event.from_status} to ${event.to_status}`
      : `Status set to ${event.to_status}`;
    timelineEvents.push({
      id: `status-${event.id}`,
      type: 'status',
      timestamp: new Date(event.changed_at),
      title: 'Status Change',
      description: statusChange,
      icon: <Activity className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-700',
      by: event.changed_by_name || 'Unknown',
      data: event
    });
  });

  // Add vital signs events
  vitals.forEach((vital) => {
    const vitalDesc = [
      vital.bp && `BP: ${vital.bp}`,
      vital.pulse !== null && vital.pulse !== undefined && `Pulse: ${vital.pulse} bpm`,
      vital.temp !== null && vital.temp !== undefined && `Temp: ${vital.temp}°F`,
      vital.spo2 !== null && vital.spo2 !== undefined && `SpO2: ${vital.spo2}%`,
      vital.resp !== null && vital.resp !== undefined && `Resp: ${vital.resp}`,
    ].filter(Boolean).join(', ');
    
    timelineEvents.push({
      id: `vital-${vital.id}`,
      type: 'vital',
      timestamp: new Date(vital.recorded_at || vital.created_at),
      title: 'Vital Signs Recorded',
      description: vitalDesc || 'Vital signs recorded',
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-red-100 text-red-700',
      by: (vital as any).recorded_by_name || 'Nurse/Doctor',
      data: vital
    });
  });

  // Add medication events
  medications.forEach((med) => {
    timelineEvents.push({
      id: `med-${med.id}`,
      type: 'medication',
      timestamp: new Date(med.administered_at || med.created_at),
      title: 'Medication Administered',
      description: `${med.medication_name} ${med.dosage ? `(${med.dosage})` : ''} - ${med.route || 'Route not specified'}`,
      icon: <Syringe className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-700',
      by: (med as any).administered_by_name || 'Nurse/Doctor',
      data: med
    });
  });

  // Add lab order events
  labOrders.forEach((order) => {
    const statusText = order.status === 'completed' ? 'completed' : order.status === 'ordered' ? 'ordered' : order.status;
    timelineEvents.push({
      id: `lab-${order.id}`,
      type: 'lab',
      timestamp: new Date(order.ordered_at || order.created_at),
      title: `Lab Order ${statusText === 'completed' ? 'Completed' : 'Placed'}`,
      description: `${order.test_name || 'Lab Test'}${order.status === 'completed' && order.result_value ? ' - Result available' : ''}`,
      icon: <TestTube className="w-4 h-4" />,
      color: order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
      by: order.ordered_by_name || 'Doctor',
      data: order
    });
  });

  // Add radiology order events
  radiologyOrders.forEach((order) => {
    const statusText = order.status === 'completed' ? 'completed' : order.status === 'ordered' ? 'ordered' : order.status;
    timelineEvents.push({
      id: `rad-${order.id}`,
      type: 'radiology',
      timestamp: new Date(order.ordered_at || order.created_at),
      title: `Radiology Order ${statusText === 'completed' ? 'Completed' : 'Placed'}`,
      description: `${order.test_name || 'Radiology Test'}${order.status === 'completed' && order.result_value ? ' - Result available' : ''}`,
      icon: <Scan className="w-4 h-4" />,
      color: order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
      by: order.ordered_by_name || 'Doctor',
      data: order
    });
  });

  // Add notes events
  notes.forEach((note) => {
    timelineEvents.push({
      id: `note-${note.id}`,
      type: 'note',
      timestamp: new Date(note.recorded_at || note.created_at),
      title: 'Doctor\'s Note Added',
      description: note.note_text ? (note.note_text.length > 100 ? note.note_text.substring(0, 100) + '...' : note.note_text) : 'Note added',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-indigo-100 text-indigo-700',
      by: note.recorded_by_name || 'Doctor',
      data: note
    });
  });

  // Add health & physical events
  healthPhysical.forEach((hp) => {
    timelineEvents.push({
      id: `hp-${hp.id}`,
      type: 'health_physical',
      timestamp: new Date(hp.examination_date || hp.created_at),
      title: 'Health & Physical Exam',
      description: 'Physical examination performed',
      icon: <Stethoscope className="w-4 h-4" />,
      color: 'bg-teal-100 text-teal-700',
      by: hp.provider_name || 'Doctor',
      data: hp
    });
  });

  // Add intake/output events
  intakeOutput.forEach((io) => {
    const hasIntake = io.intake_amount_ml > 0;
    const hasOutput = io.output_amount_ml > 0;
    let type = '';
    let desc = '';
    
    if (hasIntake && hasOutput) {
      type = 'Intake & Output';
      desc = `Intake: ${io.intake_type || 'Fluid'} - ${io.intake_amount_ml}ml | Output: ${io.output_type || 'Output'} - ${io.output_amount_ml}ml`;
    } else if (hasIntake) {
      type = 'Intake';
      desc = `Intake: ${io.intake_type || 'Fluid'} - ${io.intake_amount_ml}ml`;
    } else if (hasOutput) {
      type = 'Output';
      desc = `Output: ${io.output_type || 'Output'} - ${io.output_amount_ml}ml`;
    } else {
      type = 'I/O Record';
      desc = 'Intake/Output recorded';
    }
    
    timelineEvents.push({
      id: `io-${io.id}`,
      type: 'intake_output',
      timestamp: new Date(io.record_time || io.created_at),
      title: `${type} Recorded`,
      description: desc,
      icon: <Droplet className="w-4 h-4" />,
      color: hasIntake && !hasOutput ? 'bg-cyan-100 text-cyan-700' : hasOutput && !hasIntake ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700',
      by: io.recorded_by_name || 'Nurse',
      data: io
    });
  });

  // Add blood request events
  bloodRequests.forEach((request) => {
    const statusText = request.status === 'Issued' ? 'Issued' : request.status === 'Requested' ? 'Placed' : request.status;
    timelineEvents.push({
      id: `blood-${request.id}`,
      type: 'blood_request',
      timestamp: new Date(request.request_date || request.created_at),
      title: `Blood Request ${statusText}`,
      description: `${request.product_type || 'Blood'} - ${request.units || 0} units`,
      icon: <Droplets className="w-4 h-4" />,
      color: request.status === 'Issued' || request.status === 'Transfused' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700',
      by: request.requested_by_name || 'Doctor',
      data: request
    });
  });

  // Add file upload events
  files.forEach((file) => {
    timelineEvents.push({
      id: `file-${file.id}`,
      type: 'file',
      timestamp: new Date(file.uploaded_at || file.created_at),
      title: 'File Uploaded',
      description: file.file_name || 'Document uploaded',
      icon: <Upload className="w-4 h-4" />,
      color: 'bg-gray-100 text-gray-700',
      by: (file as any).uploaded_by_name || 'Staff',
      data: file
    });
  });

  // Sort all events by timestamp (newest first)
  timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Visit Timeline</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>Complete history of this emergency visit</CardDescription>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No timeline events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineEvents.map((event) => {
                const eventDate = event.timestamp;
                const isToday = eventDate.toDateString() === new Date().toDateString();
                const dateStr = isToday 
                  ? 'Today' 
                  : eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: eventDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
                const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${event.color} flex items-center justify-center`}>
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{event.title}</h4>
                            <Badge variant="outline" className={`text-xs ${event.color}`}>
                              {event.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                          {event.by && (
                            <p className="text-xs text-gray-500">By: {event.by}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium">{dateStr}</p>
                          <p className="text-xs text-gray-500">{timeStr}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= FILES TAB =============
function FilesTab({ patient, files, loading, visitId, onRefresh, onUpload }: { 
  patient: any; 
  files: EmergencyPatientFile[];
  loading: boolean;
  visitId?: number;
  onRefresh: () => void;
  onUpload?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading files...</span>
      </div>
    );
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Lab Results': 'blue',
      'Radiology': 'purple',
      'Forms': 'green',
      'Consent': 'orange',
      'ECG': 'red',
      'Medical History': 'indigo',
      'Other': 'gray'
    };
    return colors[category] || 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patient Files & Documents</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onUpload}>
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const uploadDate = new Date(file.uploaded_at);
                const color = getCategoryColor(file.category);
                const colorClasses: Record<string, string> = {
                  blue: 'border-blue-200 hover:border-blue-400 text-blue-600',
                  purple: 'border-purple-200 hover:border-purple-400 text-purple-600',
                  green: 'border-green-200 hover:border-green-400 text-green-600',
                  orange: 'border-orange-200 hover:border-orange-400 text-orange-600',
                  red: 'border-red-200 hover:border-red-400 text-red-600',
                  indigo: 'border-indigo-200 hover:border-indigo-400 text-indigo-600',
                  gray: 'border-gray-200 hover:border-gray-400 text-gray-600'
                };
                return (
                  <div key={file.id} className={`p-4 border-2 rounded-lg transition-colors ${colorClasses[color]}`}>
                    <div className="flex items-start justify-between mb-3">
                      <FolderOpen className={`w-8 h-8 text-${color}-600`} />
                      <Button size="sm" variant="ghost" onClick={() => window.open(file.file_path, '_blank')}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-semibold">{file.file_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{uploadDate.toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {file.file_type || 'Unknown type'} • {formatFileSize(file.file_size)}
                    </p>
                    {file.description && (
                      <p className="text-xs text-gray-500 mt-1">{file.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= INTAKE & OUTPUT TAB =============
function IntakeOutputTab({ patient, intakeOutput, loading, visitId, onAdd, onRefresh, onEdit }: { 
  patient: any; 
  intakeOutput: EmergencyIntakeOutput[];
  loading: boolean;
  visitId?: number;
  onAdd?: () => void;
  onRefresh?: () => void;
  onEdit?: (io: EmergencyIntakeOutput) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading I/O records...</span>
      </div>
    );
  }

  // Calculate 24h totals
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last24h = intakeOutput.filter(io => new Date(io.record_time) >= yesterday);
  
  const totalIntake = last24h.reduce((sum, io) => sum + (io.intake_amount_ml || 0), 0);
  const totalOutput = last24h.reduce((sum, io) => sum + (io.output_amount_ml || 0), 0);
  const balance = totalIntake - totalOutput;
  const status = balance > 0 ? 'Positive' : balance < 0 ? 'Negative' : 'Balanced';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Intake & Output Monitoring</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add I/O Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <Droplets className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-700">{totalIntake.toFixed(0)} ml</p>
            <p className="text-sm text-blue-600">Total Intake (24h)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <Droplets className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-700">{totalOutput.toFixed(0)} ml</p>
            <p className="text-sm text-purple-600">Total Output (24h)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-700">{balance >= 0 ? '+' : ''}{balance.toFixed(0)} ml</p>
            <p className="text-sm text-green-600">Balance</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <CheckCircle className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-700">{status}</p>
            <p className="text-sm text-orange-600">Status</p>
          </CardContent>
        </Card>
      </div>

      {/* I/O Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Intake & Output Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {intakeOutput.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No I/O records yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Intake Type</TableHead>
                  <TableHead>Intake Amount (ml)</TableHead>
                  <TableHead>Output Type</TableHead>
                  <TableHead>Output Amount (ml)</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intakeOutput.map((io) => {
                  const recordTime = new Date(io.record_time);
                  const balanceColor = io.balance_ml > 0 ? 'text-green-700' : io.balance_ml < 0 ? 'text-red-700' : 'text-gray-700';
                  return (
                    <TableRow key={io.id}>
                      <TableCell className="font-medium">{recordTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{io.intake_type || 'N/A'}</TableCell>
                      <TableCell className="text-blue-700 font-bold">{io.intake_amount_ml.toFixed(0)}</TableCell>
                      <TableCell>{io.output_type || 'N/A'}</TableCell>
                      <TableCell className="text-purple-700 font-bold">{io.output_amount_ml.toFixed(0)}</TableCell>
                      <TableCell className={`${balanceColor} font-bold`}>
                        {io.balance_ml >= 0 ? '+' : ''}{io.balance_ml.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-sm">{io.recorded_by_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit?.(io)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= BLOOD BANK TAB =============
function BloodBankTab({ patient, bloodRequests, patientBloodGroup, loading, visitId, onRefresh, onAdd, onView, onIssue }: { 
  patient: any; 
  bloodRequests: EmergencyBloodBankRequest[];
  patientBloodGroup?: string;
  loading: boolean;
  visitId?: number;
  onRefresh: () => void;
  onAdd?: () => void;
  onView?: (request: EmergencyBloodBankRequest) => void;
  onIssue?: (request: EmergencyBloodBankRequest) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading blood requests...</span>
      </div>
    );
  }

  const transfusedRequests = bloodRequests.filter(r => r.status === 'Transfused');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blood Bank Management</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Request Blood Products
        </Button>
      </div>

      {/* Blood Type Card */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center">
              <Droplet className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient Blood Type</p>
              <p className="text-4xl font-bold text-red-700 mt-1">{patientBloodGroup || 'Unknown'}</p>
              <p className="text-sm text-gray-600 mt-2">Last tested: {patientBloodGroup ? 'Available' : 'Not tested'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-600">Cross-match Status</p>
              <Badge className="bg-green-600 text-white mt-2">Compatible</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Product Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {bloodRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No blood requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Number</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodRequests.map((request) => {
                  const requestDate = new Date(request.request_date);
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number || `BB-${request.id}`}</TableCell>
                      <TableCell>{request.product_type}</TableCell>
                      <TableCell className="font-bold">{request.units} Units</TableCell>
                      <TableCell>{requestDate.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={
                          request.status === 'Ready' || request.status === 'Transfused' ? 'bg-green-100 text-green-800' :
                          request.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'Requested' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          request.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {request.urgency.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.requested_by_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === 'Ready' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onIssue?.(request)}>
                              Issue
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => onView?.(request)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transfusion History */}
      {transfusedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transfusion History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transfusedRequests.map((request) => {
                const transfusionDate = request.transfusion_date ? new Date(request.transfusion_date) : null;
                return (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">
                        Transfusion - {transfusionDate ? transfusionDate.toLocaleDateString() : 'Date unknown'}
                      </p>
                      <Badge className="bg-green-100 text-green-800">
                        {request.reaction_notes ? 'With Notes' : 'Successful'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Product:</p>
                        <p className="font-medium">{request.product_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Units:</p>
                        <p className="font-medium">{request.units} Units</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reaction:</p>
                        <p className={`font-medium ${request.reaction_notes ? 'text-red-700' : 'text-green-700'}`}>
                          {request.reaction_notes || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}