/**
 * Emergency Patient Profile Component
 * Complete patient profile with all medical information and management options
 */

import { useState } from 'react';
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
  UserCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { UpdateVitalsDialog } from './UpdateVitalsDialog';

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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Ward</p>
              <p className="font-bold text-blue-700">{patient.assignedWard}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Bed</p>
              <p className="font-bold text-purple-700">{patient.bedNumber}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Doctor</p>
              <p className="text-sm font-bold text-green-700">{patient.attendingDoctor}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Admission</p>
              <p className="text-sm font-bold text-orange-700">{patient.admissionDate}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Triage</p>
              <p className="font-bold text-red-700">ESI {patient.triageLevel}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium">Type</p>
              <p className="text-sm font-bold text-indigo-700">{patient.admissionType}</p>
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
                    <span className="font-medium">+1-555-0199</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-xs">patient@email.com</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">123 Main St, City, State</span>
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
                    <p className="text-gray-600 text-xs mb-1">Diagnosis</p>
                    <p className="font-medium text-red-700">{patient.diagnosis}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ward:</span>
                    <span className="font-medium">{patient.assignedWard}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bed:</span>
                    <span className="font-medium">{patient.bedNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Attending Doctor:</span>
                    <span className="font-medium text-xs">{patient.attendingDoctor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admission Date:</span>
                    <span className="font-medium">{patient.admissionDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admission Time:</span>
                    <span className="font-medium">{patient.admissionTime}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Vital Signs */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="text-base">Current Vital Signs</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-gray-600">Blood Pressure</span>
                    <span className="font-bold text-red-700">{patient.vitalSigns.bp}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">Pulse Rate</span>
                    <span className="font-bold text-blue-700">{patient.vitalSigns.pulse} bpm</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <span className="font-bold text-orange-700">{patient.vitalSigns.temp}°F</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-600">SpO2</span>
                    <span className="font-bold text-green-700">{patient.vitalSigns.spo2}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <TestTube className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-700">3</p>
                  <p className="text-sm text-blue-600">Lab Orders</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Scan className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-700">2</p>
                  <p className="text-sm text-purple-600">Radiology Orders</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-700">8</p>
                  <p className="text-sm text-green-600">Patient Files</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6 text-center">
                  <Droplet className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700">1</p>
                  <p className="text-sm text-red-600">Blood Requests</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6 mt-6">
            <VitalsTabContent patient={patient} />
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6 mt-6">
            <MedicationsTab patient={patient} />
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="labresults" className="space-y-6 mt-6">
            <LabResultsTab patient={patient} />
          </TabsContent>

          {/* Radiology Tab */}
          <TabsContent value="radiology" className="space-y-6 mt-6">
            <RadiologyOrdersTab patient={patient} />
          </TabsContent>

          {/* Doctor's Notes Tab */}
          <TabsContent value="doctornotes" className="space-y-6 mt-6">
            <DoctorNotesTab patient={patient} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            <TimelineTab patient={patient} />
          </TabsContent>

          {/* Health & Physical Tab */}
          <TabsContent value="hp" className="space-y-6 mt-6">
            <HealthPhysicalTab patient={patient} />
          </TabsContent>

          {/* Lab Orders Tab */}
          <TabsContent value="lab" className="space-y-6 mt-6">
            <LabOrdersTab patient={patient} />
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6 mt-6">
            <FilesTab patient={patient} />
          </TabsContent>

          {/* Intake & Output Tab */}
          <TabsContent value="io" className="space-y-6 mt-6">
            <IntakeOutputTab patient={patient} />
          </TabsContent>

          {/* Blood Bank Tab */}
          <TabsContent value="blood" className="space-y-6 mt-6">
            <BloodBankTab patient={patient} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Vitals Dialog */}
      {showUpdateVitals && (
        <UpdateVitalsDialog
          patient={patient}
          onClose={() => setShowUpdateVitals(false)}
          onSave={() => {
            setShowUpdateVitals(false);
          }}
        />
      )}
    </div>
  );
}

// ============= VITALS TAB COMPONENT =============
function VitalsTabContent({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patient Vital Signs</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
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
                  {[120, 125, 118, 130, 122, 120, 124].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-red-400 rounded-t" style={{ height: `${(val / 150) * 100}%` }}></div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Last 7 readings</p>
              </div>

              {/* Heart Rate Chart */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-blue-900">Heart Rate Trend</p>
                  <Badge className="bg-blue-600 text-white">24h</Badge>
                </div>
                <div className="h-32 flex items-end justify-around gap-2">
                  {[72, 75, 70, 78, 74, 72, 76].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-blue-400 rounded-t" style={{ height: `${(val / 100) * 100}%` }}></div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Last 7 readings</p>
              </div>

              {/* SpO2 Chart */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-green-900">SpO2 Trend</p>
                  <Badge className="bg-green-600 text-white">24h</Badge>
                </div>
                <div className="h-32 flex items-end justify-around gap-2">
                  {[98, 97, 98, 96, 98, 97, 98].map((val, idx) => (
                    <div key={idx} className="flex-1 bg-green-400 rounded-t" style={{ height: `${(val / 100) * 100}%` }}></div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Last 7 readings</p>
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
                <div className="space-y-4">
                  {/* Vital Sign Record 1 */}
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Nov 21, 2024 - 14:30</p>
                        <p className="text-xs text-gray-600">Recorded by: Nurse Sarah Johnson</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-red-50 rounded">
                        <p className="text-xs text-gray-600">Blood Pressure</p>
                        <p className="font-bold text-red-700">120/80</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Pulse</p>
                        <p className="font-bold text-blue-700">72 bpm</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <p className="text-xs text-gray-600">Temperature</p>
                        <p className="font-bold text-orange-700">98.6°F</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">SpO2</p>
                        <p className="font-bold text-green-700">98%</p>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Notes:</p>
                      <p className="text-sm mt-1">Patient stable, no complaints</p>
                    </div>
                  </div>

                  {/* Vital Sign Record 2 */}
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Nov 21, 2024 - 10:15</p>
                        <p className="text-xs text-gray-600">Recorded by: Nurse Michael Chen</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-red-50 rounded">
                        <p className="text-xs text-gray-600">Blood Pressure</p>
                        <p className="font-bold text-red-700">118/78</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Pulse</p>
                        <p className="font-bold text-blue-700">75 bpm</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <p className="text-xs text-gray-600">Temperature</p>
                        <p className="font-bold text-orange-700">98.4°F</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">SpO2</p>
                        <p className="font-bold text-green-700">97%</p>
                      </div>
                    </div>
                  </div>

                  {/* Vital Sign Record 3 */}
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Nov 21, 2024 - 06:00</p>
                        <p className="text-xs text-gray-600">Recorded by: Nurse Emily Davis</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-red-50 rounded">
                        <p className="text-xs text-gray-600">Blood Pressure</p>
                        <p className="font-bold text-red-700">122/82</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Pulse</p>
                        <p className="font-bold text-blue-700">70 bpm</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <p className="text-xs text-gray-600">Temperature</p>
                        <p className="font-bold text-orange-700">98.7°F</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">SpO2</p>
                        <p className="font-bold text-green-700">96%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============= MEDICATIONS TAB COMPONENT =============
function MedicationsTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Medications</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">MED-2024-156</TableCell>
                <TableCell>Aspirin</TableCell>
                <TableCell>325 mg</TableCell>
                <TableCell>Oral</TableCell>
                <TableCell>Every 8 hours</TableCell>
                <TableCell>Nov 21, 2024 08:45 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">MED-2024-157</TableCell>
                <TableCell>Metoprolol</TableCell>
                <TableCell>50 mg</TableCell>
                <TableCell>Oral</TableCell>
                <TableCell>Twice daily</TableCell>
                <TableCell>Nov 21, 2024 09:00 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= LAB RESULTS TAB COMPONENT =============
function LabResultsTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lab Results</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Lab Result
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Ordered Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Ordered By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">LAB-2024-156</TableCell>
                <TableCell>Complete Blood Count (CBC)</TableCell>
                <TableCell>Nov 21, 2024 08:45 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">STAT</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LAB-2024-157</TableCell>
                <TableCell>Cardiac Enzymes (Troponin)</TableCell>
                <TableCell>Nov 21, 2024 09:00 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">STAT</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LAB-2024-158</TableCell>
                <TableCell>Electrolyte Panel</TableCell>
                <TableCell>Nov 21, 2024 09:15 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800">Routine</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= HEALTH & PHYSICAL TAB =============
function HealthPhysicalTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Health & Physical (H&P)</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
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
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Nov 21, 2024</p>
                    <p className="text-sm text-gray-600">08:30 AM</p>
                  </div>
                </TableCell>
                <TableCell>{patient.diagnosis}</TableCell>
                <TableCell>
                  <p className="text-sm">General: Alert, oriented</p>
                  <p className="text-sm">CV: Regular rhythm</p>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">Critical</Badge>
                </TableCell>
                <TableCell className="text-sm">ICU admission, cardiac monitoring</TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= LAB ORDERS TAB =============
function LabOrdersTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Laboratory Orders</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Lab Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-700">3</p>
            <p className="text-sm text-blue-600 mt-1">Pending Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-700">5</p>
            <p className="text-sm text-green-600 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-700">1</p>
            <p className="text-sm text-orange-600 mt-1">In Progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Ordered Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Ordered By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">LAB-2024-156</TableCell>
                <TableCell>Complete Blood Count (CBC)</TableCell>
                <TableCell>Nov 21, 2024 08:45 AM</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">STAT</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LAB-2024-157</TableCell>
                <TableCell>Cardiac Enzymes (Troponin)</TableCell>
                <TableCell>Nov 21, 2024 09:00 AM</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">STAT</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LAB-2024-158</TableCell>
                <TableCell>Electrolyte Panel</TableCell>
                <TableCell>Nov 21, 2024 09:15 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800">Routine</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= RADIOLOGY ORDERS TAB =============
function RadiologyOrdersTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Radiology Orders</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Radiology Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-purple-700">2</p>
            <p className="text-sm text-purple-600 mt-1">Pending Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-700">3</p>
            <p className="text-sm text-green-600 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-orange-700">1</p>
            <p className="text-sm text-orange-600 mt-1">In Progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Radiology Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Modality</TableHead>
                <TableHead>Ordered Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Radiologist</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">RAD-2024-089</TableCell>
                <TableCell>Chest X-Ray (PA & Lateral)</TableCell>
                <TableCell>X-Ray</TableCell>
                <TableCell>Nov 21, 2024 08:50 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">STAT</Badge>
                </TableCell>
                <TableCell>Dr. Robert Chen</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">RAD-2024-090</TableCell>
                <TableCell>CT Scan - Head (Non-Contrast)</TableCell>
                <TableCell>CT</TableCell>
                <TableCell>Nov 21, 2024 10:00 AM</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">STAT</Badge>
                </TableCell>
                <TableCell>Dr. Lisa Wang</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= DOCTOR'S NOTES TAB =============
function DoctorNotesTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Doctor's Notes</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Nov 21, 2024</p>
                    <p className="text-sm text-gray-600">08:30 AM</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">Patient is stable, no complaints.</p>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Nov 20, 2024</p>
                    <p className="text-sm text-gray-600">10:00 AM</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">Patient is alert and oriented.</p>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= TIMELINE TAB =============
function TimelineTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Nov 21, 2024</p>
                    <p className="text-sm text-gray-600">08:30 AM</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">Patient is stable, no complaints.</p>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Nov 20, 2024</p>
                    <p className="text-sm text-gray-600">10:00 AM</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">Patient is alert and oriented.</p>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= FILES TAB =============
function FilesTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patient Files & Documents</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* File Card 1 */}
            <div className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-blue-600" />
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-semibold">Lab Results - CBC</p>
              <p className="text-sm text-gray-600 mt-1">Nov 21, 2024</p>
              <p className="text-xs text-gray-500 mt-2">PDF • 245 KB</p>
            </div>

            {/* File Card 2 */}
            <div className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-purple-600" />
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-semibold">Chest X-Ray</p>
              <p className="text-sm text-gray-600 mt-1">Nov 21, 2024</p>
              <p className="text-xs text-gray-500 mt-2">DICOM • 2.1 MB</p>
            </div>

            {/* File Card 3 */}
            <div className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-green-600" />
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-semibold">Admission Form</p>
              <p className="text-sm text-gray-600 mt-1">Nov 21, 2024</p>
              <p className="text-xs text-gray-500 mt-2">PDF • 156 KB</p>
            </div>

            {/* File Card 4 */}
            <div className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-orange-600" />
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-semibold">Consent Forms</p>
              <p className="text-sm text-gray-600 mt-1">Nov 21, 2024</p>
              <p className="text-xs text-gray-500 mt-2">PDF • 189 KB</p>
            </div>

            {/* File Card 5 */}
            <div className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-red-600" />
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-semibold">ECG Report</p>
              <p className="text-sm text-gray-600 mt-1">Nov 21, 2024</p>
              <p className="text-xs text-gray-500 mt-2">PDF • 312 KB</p>
            </div>

            {/* File Card 6 */}
            <div className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <FolderOpen className="w-8 h-8 text-indigo-600" />
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-semibold">Medical History</p>
              <p className="text-sm text-gray-600 mt-1">Nov 21, 2024</p>
              <p className="text-xs text-gray-500 mt-2">PDF • 421 KB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= INTAKE & OUTPUT TAB =============
function IntakeOutputTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Intake & Output Monitoring</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add I/O Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <Droplets className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-700">2,450 ml</p>
            <p className="text-sm text-blue-600">Total Intake (24h)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <Droplets className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-700">2,100 ml</p>
            <p className="text-sm text-purple-600">Total Output (24h)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-700">+350 ml</p>
            <p className="text-sm text-green-600">Balance</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <CheckCircle className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-700">Normal</p>
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
              <TableRow>
                <TableCell className="font-medium">14:00</TableCell>
                <TableCell>IV Fluids</TableCell>
                <TableCell className="text-blue-700 font-bold">500</TableCell>
                <TableCell>Urine</TableCell>
                <TableCell className="text-purple-700 font-bold">450</TableCell>
                <TableCell className="text-green-700 font-bold">+50</TableCell>
                <TableCell className="text-sm">Nurse Sarah</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">10:00</TableCell>
                <TableCell>Oral (Water)</TableCell>
                <TableCell className="text-blue-700 font-bold">250</TableCell>
                <TableCell>Urine</TableCell>
                <TableCell className="text-purple-700 font-bold">300</TableCell>
                <TableCell className="text-red-700 font-bold">-50</TableCell>
                <TableCell className="text-sm">Nurse Michael</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">06:00</TableCell>
                <TableCell>IV Fluids</TableCell>
                <TableCell className="text-blue-700 font-bold">500</TableCell>
                <TableCell>Urine</TableCell>
                <TableCell className="text-purple-700 font-bold">400</TableCell>
                <TableCell className="text-green-700 font-bold">+100</TableCell>
                <TableCell className="text-sm">Nurse Emily</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= BLOOD BANK TAB =============
function BloodBankTab({ patient }: { patient: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blood Bank Management</h2>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
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
              <p className="text-4xl font-bold text-red-700 mt-1">O+</p>
              <p className="text-sm text-gray-600 mt-2">Last tested: Nov 15, 2024</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
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
              <TableRow>
                <TableCell className="font-medium">BB-2024-089</TableCell>
                <TableCell>Packed Red Blood Cells</TableCell>
                <TableCell className="font-bold">2 Units</TableCell>
                <TableCell>Nov 21, 2024 09:30 AM</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Issue
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BB-2024-090</TableCell>
                <TableCell>Fresh Frozen Plasma</TableCell>
                <TableCell className="font-bold">1 Unit</TableCell>
                <TableCell>Nov 21, 2024 10:00 AM</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800">Routine</Badge>
                </TableCell>
                <TableCell>{patient.attendingDoctor}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transfusion History */}
      <Card>
        <CardHeader>
          <CardTitle>Transfusion History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Previous Transfusion - Sept 10, 2024</p>
                <Badge className="bg-green-100 text-green-800">Successful</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Product:</p>
                  <p className="font-medium">Packed RBCs</p>
                </div>
                <div>
                  <p className="text-gray-600">Units:</p>
                  <p className="font-medium">2 Units</p>
                </div>
                <div>
                  <p className="text-gray-600">Reaction:</p>
                  <p className="font-medium text-green-700">None</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}