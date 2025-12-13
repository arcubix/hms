/**
 * IPD Patient Profile Component
 * Complete patient profile with all medical information and management options
 * Based on EmergencyPatientProfile structure, adapted for IPD admissions
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
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
  UserCircle,
  Loader2,
  Stethoscope,
  Pill,
  FlaskConical
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../services/api';
import type { 
  IPDAdmission,
  IPDVitalSign,
  IPDTreatmentOrder,
  IPDNursingNote,
  IPDBilling
} from '../../services/api';

interface IPDPatientProfileProps {
  patient: {
    id: string;
    ipdNumber: string;
    uhid: string;
    patientName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    contactNumber?: string;
    emergencyContact?: string;
    address?: string;
    admissionDate: string;
    admissionTime: string;
    admittedBy: string;
    consultingDoctor: string;
    department: string;
    wardName: string;
    bedNumber: string;
    diagnosis: string;
    admissionType: string;
    status: string;
  };
  onClose: () => void;
}

export function IPDPatientProfile({ patient, onClose }: IPDPatientProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [admissionDetails, setAdmissionDetails] = useState<IPDAdmission | null>(null);
  const [vitals, setVitals] = useState<IPDVitalSign[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [radiologyOrders, setRadiologyOrders] = useState<any[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [intakeOutput, setIntakeOutput] = useState<any[]>([]);
  const [healthPhysical, setHealthPhysical] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [billing, setBilling] = useState<IPDBilling | null>(null);
  
  // Loading states per tab
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [loadingLabOrders, setLoadingLabOrders] = useState(false);
  const [loadingRadiology, setLoadingRadiology] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingIO, setLoadingIO] = useState(false);
  const [loadingHP, setLoadingHP] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Dialog states
  const [showVitalsDialog, setShowVitalsDialog] = useState(false);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showLabOrderDialog, setShowLabOrderDialog] = useState(false);
  const [showRadiologyDialog, setShowRadiologyDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showIODialog, setShowIODialog] = useState(false);
  const [showHPDialog, setShowHPDialog] = useState(false);

  const admissionId = patient.id ? parseInt(patient.id) : null;

  // Load all data when component mounts
  useEffect(() => {
    if (admissionId) {
      loadAllData();
    }
  }, [admissionId]);

  const loadAllData = async () => {
    if (!admissionId) return;
    
    setLoading(true);
    try {
      // Load admission details
      const admission = await api.getIPDAdmission(admissionId);
      setAdmissionDetails(admission);
      
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
    if (!admissionId) return;

    switch (tab) {
      case 'overview':
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
    if (admissionId && !loading) {
      loadTabData(activeTab);
    }
  }, [activeTab, admissionId]);

  const loadVitals = async () => {
    if (!admissionId) return;
    setLoadingVitals(true);
    try {
      const data = await api.getIPDVitals(admissionId);
      const vitalsArray = Array.isArray(data) ? data : [];
      setVitals(vitalsArray);
    } catch (error: any) {
      console.error('Error loading vitals:', error);
      setVitals([]);
      toast.error('Failed to load vitals: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingVitals(false);
    }
  };

  const loadMedications = async () => {
    if (!admissionId) return;
    setLoadingMedications(true);
    try {
      const data = await api.getIPDMedications(admissionId);
      setMedications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load medications: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingMedications(false);
    }
  };

  const loadLabOrders = async () => {
    if (!admissionId) return;
    setLoadingLabOrders(true);
    try {
      const data = await api.getIPDLabOrders(admissionId);
      setLabOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load lab orders: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingLabOrders(false);
    }
  };

  const loadRadiology = async () => {
    if (!admissionId) return;
    setLoadingRadiology(true);
    try {
      const data = await api.getIPDRadiologyOrders(admissionId);
      setRadiologyOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load radiology orders: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingRadiology(false);
    }
  };

  const loadNotes = async () => {
    if (!admissionId) return;
    setLoadingNotes(true);
    try {
      const data = await api.getIPDDoctorNotes(admissionId);
      setDoctorNotes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load notes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadFiles = async () => {
    if (!admissionId) return;
    setLoadingFiles(true);
    try {
      const data = await api.getIPDPatientFiles(admissionId);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load files: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadIntakeOutput = async () => {
    if (!admissionId) return;
    setLoadingIO(true);
    try {
      const data = await api.getIPDIntakeOutput(admissionId);
      setIntakeOutput(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load I/O records: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingIO(false);
    }
  };

  const loadHealthPhysical = async () => {
    if (!admissionId) return;
    setLoadingHP(true);
    try {
      const data = await api.getIPDHealthPhysicalHabits(admissionId);
      setHealthPhysical(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load H&P records: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingHP(false);
    }
  };

  const loadTimeline = async () => {
    if (!admissionId) return;
    setLoadingTimeline(true);
    try {
      // Load transfers as timeline events
      const data = await api.getIPDTransfers(admissionId);
      setTransfers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Failed to load timeline: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingTimeline(false);
    }
  };

  const loadBilling = async () => {
    if (!admissionId) return;
    try {
      const data = await api.getIPDBilling(admissionId);
      setBilling(data);
    } catch (error: any) {
      console.error('Failed to load billing:', error);
    }
  };

  // Load billing on mount
  useEffect(() => {
    if (admissionId) {
      loadBilling();
    }
  }, [admissionId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'stable':
      case 'discharged':
        return 'bg-green-100 text-green-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'under-treatment':
      case 'admitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get latest vital signs
  const latestVital = vitals.length > 0 
    ? [...vitals].sort((a, b) => {
        const dateA = new Date(a.recorded_at || a.created_at || 0).getTime();
        const dateB = new Date(b.recorded_at || b.created_at || 0).getTime();
        return dateB - dateA;
      })[0]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading patient profile...</p>
        </div>
      </div>
    );
  }

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
                    {patient.patientName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{patient.patientName}</h1>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>UHID: {patient.uhid}</span>
                    <span>•</span>
                    <span>IPD: {patient.ipdNumber}</span>
                    <span>•</span>
                    <span>{patient.age}Y / {patient.gender}</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(patient.status)}>
                {patient.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                // Export functionality can be added here
                toast.info('Export functionality coming soon');
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Ward</p>
              <p className="font-bold text-blue-700">{patient.wardName || 'N/A'}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Bed</p>
              <p className="font-bold text-purple-700">{patient.bedNumber || 'N/A'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Doctor</p>
              <p className="text-sm font-bold text-green-700">{patient.consultingDoctor || 'N/A'}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Admission</p>
              <p className="text-sm font-bold text-orange-700">{patient.admissionDate || 'N/A'}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Department</p>
              <p className="text-sm font-bold text-red-700">{patient.department || 'N/A'}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium">Type</p>
              <p className="text-sm font-bold text-indigo-700">{patient.admissionType || 'N/A'}</p>
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
                    <span className="font-medium">{patient.patientName}</span>
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
                  {patient.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">{patient.contactNumber}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{patient.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Admission */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <CardTitle className="text-base">Current Admission</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Diagnosis</p>
                    <p className="font-medium text-red-700">{patient.diagnosis || 'N/A'}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ward:</span>
                    <span className="font-medium">{patient.wardName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bed:</span>
                    <span className="font-medium">{patient.bedNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Attending Doctor:</span>
                    <span className="font-medium text-xs">{patient.consultingDoctor || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admission Date:</span>
                    <span className="font-medium">{patient.admissionDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admission Time:</span>
                    <span className="font-medium">{patient.admissionTime || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Vital Signs */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="text-base">Current Vital Signs</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {latestVital ? (
                    <>
                      {latestVital.blood_pressure_systolic && latestVital.blood_pressure_diastolic && (
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm text-gray-600">Blood Pressure</span>
                          <span className="font-bold text-red-700">
                            {latestVital.blood_pressure_systolic}/{latestVital.blood_pressure_diastolic}
                          </span>
                        </div>
                      )}
                      {latestVital.heart_rate && (
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm text-gray-600">Heart Rate</span>
                          <span className="font-bold text-blue-700">{latestVital.heart_rate} bpm</span>
                        </div>
                      )}
                      {latestVital.temperature && (
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm text-gray-600">Temperature</span>
                          <span className="font-bold text-orange-700">{latestVital.temperature}°C</span>
                        </div>
                      )}
                      {latestVital.oxygen_saturation && (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm text-gray-600">SpO2</span>
                          <span className="font-bold text-green-700">{latestVital.oxygen_saturation}%</span>
                        </div>
                      )}
                      {latestVital.respiratory_rate && (
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <span className="text-sm text-gray-600">Respiratory Rate</span>
                          <span className="font-bold text-purple-700">{latestVital.respiratory_rate} /min</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">No vital signs recorded yet</div>
                  )}
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
                  <p className="text-2xl font-bold text-red-700">0</p>
                  <p className="text-sm text-red-600">Blood Requests</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6 mt-6">
            {loadingVitals ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading vitals...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Patient Vital Signs</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowVitalsDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vital Signs
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Signs History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      {vitals.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-600">No vital signs recorded yet</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>BP</TableHead>
                              <TableHead>HR</TableHead>
                              <TableHead>Temp</TableHead>
                              <TableHead>SpO2</TableHead>
                              <TableHead>RR</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vitals.map((vital) => (
                              <TableRow key={vital.id}>
                                <TableCell>{new Date(vital.recorded_at || vital.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(vital.recorded_at || vital.created_at).toLocaleTimeString()}</TableCell>
                                <TableCell>
                                  {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                                    ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                                    : 'N/A'}
                                </TableCell>
                                <TableCell>{vital.heart_rate || 'N/A'}</TableCell>
                                <TableCell>{vital.temperature ? `${vital.temperature}°C` : 'N/A'}</TableCell>
                                <TableCell>{vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : 'N/A'}</TableCell>
                                <TableCell>{vital.respiratory_rate || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6 mt-6">
            {loadingMedications ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading medications...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Medications</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowMedicationDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Medication Orders</CardTitle>
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
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medications.map((med: any) => (
                            <TableRow key={med.id}>
                              <TableCell>{med.medication_name || med.name || 'N/A'}</TableCell>
                              <TableCell>{med.dosage || 'N/A'}</TableCell>
                              <TableCell>{med.frequency || 'N/A'}</TableCell>
                              <TableCell>{med.route || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge>{med.status || 'Active'}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="labresults" className="space-y-6 mt-6">
            {loadingLabOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading lab results...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Lab Results</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowLabOrderDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lab Order
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Lab Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {labOrders.filter((o: any) => o.status === 'completed' || o.status === 'result_available').length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No lab results available</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Ordered Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {labOrders.filter((o: any) => o.status === 'completed' || o.status === 'result_available').map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.test_name || order.name || 'N/A'}</TableCell>
                              <TableCell>{new Date(order.ordered_at || order.created_at).toLocaleString()}</TableCell>
                              <TableCell><Badge>{order.status || 'N/A'}</Badge></TableCell>
                              <TableCell>{order.result_value || order.result || 'Pending'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Radiology Tab */}
          <TabsContent value="radiology" className="space-y-6 mt-6">
            {loadingRadiology ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading radiology orders...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Radiology Orders</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowRadiologyDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Radiology Order
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Radiology Investigations</CardTitle>
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
                            <TableHead>Test Name</TableHead>
                            <TableHead>Ordered Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {radiologyOrders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.test_name || order.name || 'N/A'}</TableCell>
                              <TableCell>{new Date(order.ordered_at || order.created_at).toLocaleString()}</TableCell>
                              <TableCell><Badge>{order.status || 'N/A'}</Badge></TableCell>
                              <TableCell>{order.result_value || order.result || 'Pending'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Doctor's Notes Tab */}
          <TabsContent value="doctornotes" className="space-y-6 mt-6">
            {loadingNotes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading notes...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Doctor's Notes</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowNoteDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                <div className="space-y-3">
                  {doctorNotes.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-gray-600">No doctor notes recorded yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    doctorNotes.map((note: any) => (
                      <Card key={note.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Doctor Note</Badge>
                              <span className="text-sm text-gray-500">{note.created_by_name || note.doctor_name || 'Unknown'}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(note.created_at || note.recorded_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.note_text || note.notes || note.content || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            {loadingTimeline ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading timeline...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Patient Timeline</h2>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <span className="font-medium">Admission</span>
                          <span className="text-gray-500 ml-2">on {patient.admissionDate} at {patient.admissionTime}</span>
                        </div>
                        <div className="text-gray-500">
                          {patient.admittedBy}
                        </div>
                      </div>
                      {transfers.map((transfer: any) => (
                        <div key={transfer.id} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="flex-1">
                            <span className="font-medium">Transfer</span>
                            <span className="text-gray-500 ml-2">
                              {transfer.from_ward_name || 'N/A'} → {transfer.to_ward_name || 'N/A'}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            {new Date(transfer.transfer_date || transfer.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Health & Physical Tab */}
          <TabsContent value="hp" className="space-y-6 mt-6">
            {loadingHP ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading H&P records...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Health & Physical Assessment</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowHPDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add H&P Record
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Health & Physical Records</CardTitle>
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
                            <TableHead>Date</TableHead>
                            <TableHead>Height</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>BMI</TableHead>
                            <TableHead>Assessment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {healthPhysical.map((hp: any) => (
                            <TableRow key={hp.id}>
                              <TableCell>{new Date(hp.assessment_date || hp.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{hp.height ? `${hp.height} cm` : 'N/A'}</TableCell>
                              <TableCell>{hp.weight ? `${hp.weight} kg` : 'N/A'}</TableCell>
                              <TableCell>{hp.bmi || 'N/A'}</TableCell>
                              <TableCell>{hp.assessment_notes || hp.notes || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Lab Orders Tab */}
          <TabsContent value="lab" className="space-y-6 mt-6">
            {loadingLabOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading lab orders...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Lab Orders</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowLabOrderDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lab Order
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>All Lab Orders</CardTitle>
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
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {labOrders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.test_name || order.name || 'N/A'}</TableCell>
                              <TableCell>{new Date(order.ordered_at || order.created_at).toLocaleString()}</TableCell>
                              <TableCell><Badge>{order.priority || 'Normal'}</Badge></TableCell>
                              <TableCell><Badge>{order.status || 'Pending'}</Badge></TableCell>
                              <TableCell>{order.result_value || order.result || 'Pending'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6 mt-6">
            {loadingFiles ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading files...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Patient Files</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowFileDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {files.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No files uploaded yet</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {files.map((file: any) => (
                            <TableRow key={file.id}>
                              <TableCell>{file.file_name || file.name || 'N/A'}</TableCell>
                              <TableCell>{file.file_category || file.category || 'N/A'}</TableCell>
                              <TableCell>{new Date(file.created_at || file.upload_date).toLocaleDateString()}</TableCell>
                              <TableCell>{file.file_size || file.size || 'N/A'}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Intake & Output Tab */}
          <TabsContent value="io" className="space-y-6 mt-6">
            {loadingIO ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading I/O records...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Intake & Output</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowIODialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add I/O Record
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>I/O Records</CardTitle>
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
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Intake (ml)</TableHead>
                            <TableHead>Output (ml)</TableHead>
                            <TableHead>Balance (ml)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {intakeOutput.map((io: any) => (
                            <TableRow key={io.id}>
                              <TableCell>{new Date(io.date || io.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{io.time || new Date(io.created_at).toLocaleTimeString()}</TableCell>
                              <TableCell>{io.intake_amount || io.intake || 0}</TableCell>
                              <TableCell>{io.output_amount || io.output || 0}</TableCell>
                              <TableCell>{io.balance || (io.intake_amount - io.output_amount) || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Blood Bank Tab */}
          <TabsContent value="blood" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Blood Bank</h2>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Blood Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-gray-600">Blood bank functionality coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {showVitalsDialog && (
        <VitalsDialog
          open={showVitalsDialog}
          onOpenChange={setShowVitalsDialog}
          patient={patient}
          onSuccess={() => {
            setShowVitalsDialog(false);
            loadVitals();
          }}
        />
      )}

      {showMedicationDialog && (
        <MedicationDialog
          open={showMedicationDialog}
          onOpenChange={setShowMedicationDialog}
          patient={patient}
          onSuccess={() => {
            setShowMedicationDialog(false);
            loadMedications();
          }}
        />
      )}

      {showLabOrderDialog && (
        <LabOrderDialog
          open={showLabOrderDialog}
          onOpenChange={setShowLabOrderDialog}
          patient={patient}
          onSuccess={() => {
            setShowLabOrderDialog(false);
            loadLabOrders();
          }}
        />
      )}

      {showRadiologyDialog && (
        <RadiologyOrderDialog
          open={showRadiologyDialog}
          onOpenChange={setShowRadiologyDialog}
          patient={patient}
          onSuccess={() => {
            setShowRadiologyDialog(false);
            loadRadiology();
          }}
        />
      )}

      {showNoteDialog && (
        <DoctorNoteDialog
          open={showNoteDialog}
          onOpenChange={setShowNoteDialog}
          patient={patient}
          onSuccess={() => {
            setShowNoteDialog(false);
            loadNotes();
          }}
        />
      )}

      {showIODialog && (
        <IntakeOutputDialog
          open={showIODialog}
          onOpenChange={setShowIODialog}
          patient={patient}
          onSuccess={() => {
            setShowIODialog(false);
            loadIntakeOutput();
          }}
        />
      )}

      {showHPDialog && (
        <HealthPhysicalDialog
          open={showHPDialog}
          onOpenChange={setShowHPDialog}
          patient={patient}
          onSuccess={() => {
            setShowHPDialog(false);
            loadHealthPhysical();
          }}
        />
      )}

      {showFileDialog && (
        <FileUploadDialog
          open={showFileDialog}
          onOpenChange={setShowFileDialog}
          patient={patient}
          onSuccess={() => {
            setShowFileDialog(false);
            loadFiles();
          }}
        />
      )}
    </div>
  );
}

// ============= DIALOG COMPONENTS =============

function VitalsDialog({ 
  open, 
  onOpenChange, 
  patient,
  onSuccess
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [temperature, setTemperature] = useState<string>('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [respiratoryRate, setRespiratoryRate] = useState<string>('');
  const [oxygenSaturation, setOxygenSaturation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!open) {
      setTemperature('');
      setBloodPressureSystolic('');
      setBloodPressureDiastolic('');
      setHeartRate('');
      setRespiratoryRate('');
      setOxygenSaturation('');
      setNotes('');
    }
  }, [open]);
  
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
        recorded_date: new Date().toISOString().split('T')[0],
        recorded_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      if (temperature) vitalData.temperature = parseFloat(temperature);
      if (bloodPressureSystolic) vitalData.blood_pressure_systolic = parseInt(bloodPressureSystolic);
      if (bloodPressureDiastolic) vitalData.blood_pressure_diastolic = parseInt(bloodPressureDiastolic);
      if (heartRate) vitalData.heart_rate = parseInt(heartRate);
      if (respiratoryRate) vitalData.respiratory_rate = parseInt(respiratoryRate);
      if (oxygenSaturation) vitalData.oxygen_saturation = parseFloat(oxygenSaturation);
      if (notes) vitalData.notes = notes;
      
      await api.recordIPDVitals(admissionId, vitalData);
      toast.success('Vital signs recorded successfully!');
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to record vital signs: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!patient) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Vital Signs</DialogTitle>
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
            <Label>Blood Pressure</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={bloodPressureSystolic}
                onChange={(e) => setBloodPressureSystolic(e.target.value)}
                placeholder="Systolic" 
              />
              <Input 
                type="number" 
                value={bloodPressureDiastolic}
                onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                placeholder="Diastolic" 
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
          <div className="space-y-2 col-span-2">
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
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MedicationDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [medicationName, setMedicationName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [route, setRoute] = useState<string>('Oral');
  const [startDate, setStartDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMedicationName('');
      setDosage('');
      setFrequency('');
      setRoute('Oral');
      setStartDate('');
      setInstructions('');
    }
  }, [open]);

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
      if (instructions) medicationData.instructions = instructions;

      await api.createIPDMedication(admissionId, medicationData);
      toast.success('Medication added successfully!');
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
          <DialogTitle>Add Medication</DialogTitle>
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
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
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

function LabOrderDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [testName, setTestName] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setTestName('');
      setTestType('');
      setPriority('routine');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !testName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const orderData: any = {
        test_name: testName,
        priority: priority,
        status: 'ordered'
      };
      if (testType) orderData.test_type = testType;
      if (notes) orderData.notes = notes;

      await api.createIPDLabOrder(admissionId, orderData);
      toast.success('Lab order created successfully!');
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
          <DialogTitle>New Lab Order</DialogTitle>
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

function RadiologyOrderDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [testName, setTestName] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [priority, setPriority] = useState<string>('routine');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setTestName('');
      setTestType('');
      setPriority('routine');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !testName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const orderData: any = {
        test_name: testName,
        priority: priority,
        status: 'ordered'
      };
      if (testType) orderData.test_type = testType;
      if (notes) orderData.notes = notes;

      await api.createIPDRadiologyOrder(admissionId, orderData);
      toast.success('Radiology order created successfully!');
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
          <DialogTitle>New Radiology Order</DialogTitle>
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
                </SelectContent>
              </Select>
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

function DoctorNoteDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [noteType, setNoteType] = useState<string>('Progress');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setNoteType('Progress');
      setNote('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const noteData: any = {
        note_type: noteType,
        note: note,
        note_date: new Date().toISOString().split('T')[0],
        note_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };

      await api.createIPDDoctorNote(admissionId, noteData);
      toast.success('Note added successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save note: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Doctor Note</DialogTitle>
          <DialogDescription>Record a note for the patient</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Note Type *</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Progress">Progress Note</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Discharge">Discharge Summary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Note *</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note details..."
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

function IntakeOutputDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [intakeAmount, setIntakeAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
      setIntakeAmount('');
      setOutputAmount('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || (!intakeAmount && !outputAmount)) {
      toast.error('Please enter at least intake or output amount');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const ioData: any = {
        date: date,
        time: time,
        intake_amount: intakeAmount ? parseFloat(intakeAmount) : 0,
        output_amount: outputAmount ? parseFloat(outputAmount) : 0,
      };
      if (notes) ioData.notes = notes;

      await api.createIPDIntakeOutput(admissionId, ioData);
      toast.success('I/O record added successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save I/O record: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Intake & Output Record</DialogTitle>
          <DialogDescription>Record patient intake and output</DialogDescription>
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
              <Label>Time *</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Intake Amount (ml)</Label>
              <Input
                type="number"
                value={intakeAmount}
                onChange={(e) => setIntakeAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Output Amount (ml)</Label>
              <Input
                type="number"
                value={outputAmount}
                onChange={(e) => setOutputAmount(e.target.value)}
                placeholder="0"
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

function HealthPhysicalDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bmi, setBmi] = useState<string>('');
  const [assessmentNotes, setAssessmentNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setAssessmentDate(new Date().toISOString().split('T')[0]);
      setHeight('');
      setWeight('');
      setBmi('');
      setAssessmentNotes('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error('No patient selected');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const hpData: any = {
        assessment_date: assessmentDate,
      };
      if (height) hpData.height = parseFloat(height);
      if (weight) hpData.weight = parseFloat(weight);
      if (bmi) hpData.bmi = parseFloat(bmi);
      if (assessmentNotes) hpData.assessment_notes = assessmentNotes;

      await api.createIPDHealthPhysicalHabit(admissionId, hpData);
      toast.success('H&P record added successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save H&P record: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Health & Physical Assessment</DialogTitle>
          <DialogDescription>Record patient health and physical assessment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Assessment Date *</Label>
            <Input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>BMI</Label>
              <Input
                type="number"
                step="0.1"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assessment Notes</Label>
            <Textarea
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              placeholder="Assessment details..."
              rows={5}
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

function FileUploadDialog({
  open,
  onOpenChange,
  patient,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  onSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setFileCategory('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!patient?.id || !file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setSubmitting(true);
      const admissionId = parseInt(patient.id);
      const formData = new FormData();
      formData.append('file', file);
      if (fileCategory) formData.append('file_category', fileCategory);

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
          <DialogTitle>Upload Patient File</DialogTitle>
          <DialogDescription>Upload a file for the patient</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>File *</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <Label>File Category</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lab Report">Lab Report</SelectItem>
                <SelectItem value="Radiology">Radiology</SelectItem>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Upload File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

