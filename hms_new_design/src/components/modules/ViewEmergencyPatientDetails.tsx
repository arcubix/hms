/**
 * View Emergency Patient Details Component
 * Comprehensive patient information viewer
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Pill,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  Clock,
  Bed,
  FileText,
  Users,
  Shield,
  Download,
  Printer,
  Edit,
  Building2,
  UserCircle,
  History,
  TestTube,
  Syringe,
  Ambulance
} from 'lucide-react';
import { toast } from 'sonner';

interface ViewEmergencyPatientDetailsProps {
  patient: any;
  onClose: () => void;
  onEdit?: () => void;
}

export function ViewEmergencyPatientDetails({ patient, onClose, onEdit }: ViewEmergencyPatientDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');

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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Patient Details</h1>
                  <p className="text-sm text-gray-600">{patient.name} • {patient.uhid}</p>
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
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success('Downloading patient details...')}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {onEdit && (
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Age</p>
              <p className="text-xl font-bold text-blue-700">{patient.age}Y</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Gender</p>
              <p className="text-xl font-bold text-purple-700">{patient.gender}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Triage</p>
              <p className="text-xl font-bold text-red-700">ESI {patient.triageLevel}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Ward</p>
              <p className="text-sm font-bold text-green-700">{patient.assignedWard}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Bed</p>
              <p className="text-xl font-bold text-orange-700">{patient.bedNumber}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-medium">ER Number</p>
              <p className="text-sm font-bold text-indigo-700">{patient.erNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl bg-blue-600 text-white">
                      {patient.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.uhid}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{patient.age} Years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Ward:</span>
                    <span className="font-medium">{patient.assignedWard}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Bed:</span>
                    <span className="font-medium">{patient.bedNumber}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600 text-xs mb-2">Admission Details</p>
                  <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                    <p className="text-sm"><span className="font-medium">Date:</span> {patient.admissionDate}</p>
                    <p className="text-sm"><span className="font-medium">Time:</span> {patient.admissionTime}</p>
                    <p className="text-sm"><span className="font-medium">Type:</span> {patient.admissionType}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-gray-600 text-xs mb-2">Attending Physician</p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-sm">{patient.attendingDoctor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Current Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Blood Pressure</span>
                    </div>
                    <span className="font-bold text-red-700">{patient.vitalSigns.bp}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Pulse Rate</span>
                    </div>
                    <span className="font-bold text-blue-700">{patient.vitalSigns.pulse} bpm</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="font-bold text-orange-700">{patient.vitalSigns.temp}°F</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-green-600" />
                      <span className="text-sm">SpO2</span>
                    </div>
                    <span className="font-bold text-green-700">{patient.vitalSigns.spo2}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Primary Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-gray-900">{patient.diagnosis}</p>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Admission Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">ER Number</TableCell>
                          <TableCell>{patient.erNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">UHID</TableCell>
                          <TableCell>{patient.uhid}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Admission Date</TableCell>
                          <TableCell>{patient.admissionDate} at {patient.admissionTime}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Admission Type</TableCell>
                          <TableCell>{patient.admissionType}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Triage Level</TableCell>
                          <TableCell>
                            <Badge className={
                              patient.triageLevel <= 2 ? 'bg-red-100 text-red-800' :
                              patient.triageLevel === 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              ESI Level {patient.triageLevel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Current Status</TableCell>
                          <TableCell>
                            <Badge className={
                              patient.status === 'Critical' ? 'bg-red-100 text-red-800' :
                              patient.status === 'Stable' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {patient.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treatment" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Current Treatment Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-medium mb-2">Immediate Interventions</p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                          <li>Continuous cardiac monitoring</li>
                          <li>IV line established</li>
                          <li>Oxygen therapy as needed</li>
                          <li>Pain management protocol</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="font-medium mb-2">Medications</p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                          <li>Aspirin 325mg - Administered</li>
                          <li>Nitroglycerin as needed</li>
                          <li>Beta-blockers initiated</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="font-medium mb-2">Pending Investigations</p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                          <li>Cardiac catheterization scheduled</li>
                          <li>Serial ECG monitoring</li>
                          <li>Cardiac markers q8h</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Treatment Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{patient.admissionTime}</p>
                          <p className="text-sm text-gray-600">Patient arrived at Emergency Department</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">5 mins after arrival</p>
                          <p className="text-sm text-gray-600">Initial assessment by {patient.attendingDoctor}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <TestTube className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">15 mins after arrival</p>
                          <p className="text-sm text-gray-600">Blood samples drawn, ECG performed</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Pill className="w-5 h-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">30 mins after arrival</p>
                          <p className="text-sm text-gray-600">Medications administered, patient stable</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Clinical Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Initial Assessment</p>
                          <p className="text-sm text-gray-600">{patient.admissionDate}</p>
                        </div>
                        <p className="text-sm text-gray-700">
                          Patient presented with chief complaint of {patient.diagnosis.toLowerCase()}. 
                          Vital signs taken, triage level {patient.triageLevel} assigned. 
                          Immediate treatment initiated by {patient.attendingDoctor}.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Progress Note</p>
                          <p className="text-sm text-gray-600">1 hour ago</p>
                        </div>
                        <p className="text-sm text-gray-700">
                          Patient showing improvement. Vital signs stable. 
                          Continue current treatment plan and monitoring.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
