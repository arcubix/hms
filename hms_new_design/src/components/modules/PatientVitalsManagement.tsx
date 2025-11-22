/**
 * Patient Vitals Management Component
 * Complete vitals monitoring and recording system
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Wind,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  X,
  Save,
  Download,
  Printer,
  Calendar,
  Clock,
  User,
  LineChart,
  BarChart3,
  CheckCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PatientVitalsManagementProps {
  patient: any;
  onClose: () => void;
}

interface VitalRecord {
  id: string;
  date: string;
  time: string;
  bp: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painLevel?: number;
  consciousness: string;
  recordedBy: string;
  notes?: string;
}

export function PatientVitalsManagement({ patient, onClose }: PatientVitalsManagementProps) {
  const [showAddVital, setShowAddVital] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  
  // Mock vitals history
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>([
    {
      id: '1',
      date: '2024-01-20',
      time: '14:30',
      bp: '120/80',
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      temperature: 98.6,
      spo2: 98,
      respiratoryRate: 16,
      weight: 70,
      height: 170,
      bmi: 24.2,
      painLevel: 2,
      consciousness: 'Alert',
      recordedBy: 'Nurse Sarah Johnson',
      notes: 'Patient stable, no complaints'
    },
    {
      id: '2',
      date: '2024-01-20',
      time: '10:15',
      bp: '118/78',
      systolic: 118,
      diastolic: 78,
      pulse: 75,
      temperature: 98.4,
      spo2: 97,
      respiratoryRate: 18,
      consciousness: 'Alert',
      recordedBy: 'Nurse Michael Chen',
      notes: 'Routine check'
    },
    {
      id: '3',
      date: '2024-01-20',
      time: '06:00',
      bp: '122/82',
      systolic: 122,
      diastolic: 82,
      pulse: 70,
      temperature: 98.7,
      spo2: 96,
      respiratoryRate: 17,
      consciousness: 'Alert',
      recordedBy: 'Nurse Emily Davis',
      notes: 'Morning vitals check'
    }
  ]);

  const currentVitals = vitalsHistory[0];

  const getVitalStatus = (type: string, value: number) => {
    const ranges: any = {
      systolic: { low: 90, high: 140, critical: 180 },
      diastolic: { low: 60, high: 90, critical: 110 },
      pulse: { low: 60, high: 100, critical: 120 },
      temperature: { low: 97, high: 99, critical: 102 },
      spo2: { low: 95, critical: 90 },
      respiratoryRate: { low: 12, high: 20, critical: 24 }
    };

    const range = ranges[type];
    if (!range) return 'normal';

    if (type === 'spo2') {
      if (value < range.critical) return 'critical';
      if (value < range.low) return 'warning';
      return 'normal';
    }

    if (value >= range.critical || value < range.low) return 'critical';
    if (value > range.high) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Vitals Monitor</h1>
                  <p className="text-sm text-gray-600">{patient.name} • {patient.uhid}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                size="sm"
                onClick={() => setShowAddVital(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vital Signs
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('systolic', currentVitals.systolic))}`}>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4" />
                <p className="text-xs font-medium">Blood Pressure</p>
              </div>
              <p className="text-xl font-bold">{currentVitals.bp}</p>
              <p className="text-xs">mmHg</p>
            </div>
            <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('pulse', currentVitals.pulse))}`}>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4" />
                <p className="text-xs font-medium">Pulse</p>
              </div>
              <p className="text-xl font-bold">{currentVitals.pulse}</p>
              <p className="text-xs">bpm</p>
            </div>
            <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('temperature', currentVitals.temperature))}`}>
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="w-4 h-4" />
                <p className="text-xs font-medium">Temperature</p>
              </div>
              <p className="text-xl font-bold">{currentVitals.temperature}</p>
              <p className="text-xs">°F</p>
            </div>
            <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('spo2', currentVitals.spo2))}`}>
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4" />
                <p className="text-xs font-medium">SpO2</p>
              </div>
              <p className="text-xl font-bold">{currentVitals.spo2}</p>
              <p className="text-xs">%</p>
            </div>
            <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('respiratoryRate', currentVitals.respiratoryRate))}`}>
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4" />
                <p className="text-xs font-medium">Resp. Rate</p>
              </div>
              <p className="text-xl font-bold">{currentVitals.respiratoryRate}</p>
              <p className="text-xs">breaths/min</p>
            </div>
            <div className="rounded-lg p-3 border-2 bg-purple-100 text-purple-800 border-purple-300">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4" />
                <p className="text-xs font-medium">Pain Level</p>
              </div>
              <p className="text-xl font-bold">{currentVitals.painLevel || 0}/10</p>
              <p className="text-xs">Scale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="current">Current Status</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="trends">Trends & Charts</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Warnings</TabsTrigger>
          </TabsList>

          {/* Current Status Tab */}
          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Vitals Detail */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Latest Vital Signs
                  </CardTitle>
                  <CardDescription>
                    Recorded on {currentVitals.date} at {currentVitals.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="text-2xl font-bold text-red-700">{currentVitals.bp}</p>
                        <p className="text-xs text-gray-500">Systolic: {currentVitals.systolic} / Diastolic: {currentVitals.diastolic}</p>
                      </div>
                      <Activity className="w-8 h-8 text-red-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="text-sm text-gray-600">Pulse Rate</p>
                        <p className="text-2xl font-bold text-blue-700">{currentVitals.pulse} bpm</p>
                        <p className="text-xs text-gray-500">Normal range: 60-100 bpm</p>
                      </div>
                      <Heart className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="text-2xl font-bold text-orange-700">{currentVitals.temperature}°F</p>
                        <p className="text-xs text-gray-500">Normal range: 97-99°F</p>
                      </div>
                      <Thermometer className="w-8 h-8 text-orange-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm text-gray-600">Oxygen Saturation</p>
                        <p className="text-2xl font-bold text-green-700">{currentVitals.spo2}%</p>
                        <p className="text-xs text-gray-500">Normal range: 95-100%</p>
                      </div>
                      <Droplet className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="text-sm text-gray-600">Respiratory Rate</p>
                        <p className="text-2xl font-bold text-purple-700">{currentVitals.respiratoryRate} /min</p>
                        <p className="text-xs text-gray-500">Normal range: 12-20 breaths/min</p>
                      </div>
                      <Wind className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  {currentVitals.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Clinical Notes</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{currentVitals.notes}</p>
                      </div>
                    </>
                  )}

                  <Separator />
                  <div className="text-xs text-gray-500">
                    <p>Recorded by: <span className="font-medium">{currentVitals.recordedBy}</span></p>
                    <p>Consciousness Level: <Badge variant="outline">{currentVitals.consciousness}</Badge></p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Metrics */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-green-600" />
                    Additional Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {currentVitals.weight && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="text-2xl font-bold text-blue-700">{currentVitals.weight} kg</p>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  )}

                  {currentVitals.height && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Height</p>
                        <p className="text-2xl font-bold text-green-700">{currentVitals.height} cm</p>
                      </div>
                    </div>
                  )}

                  {currentVitals.bmi && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">BMI (Body Mass Index)</p>
                        <p className="text-2xl font-bold text-purple-700">{currentVitals.bmi}</p>
                      </div>
                      <p className="text-xs text-gray-500">Normal range: 18.5-24.9</p>
                      <Progress value={currentVitals.bmi > 25 ? 80 : 60} className="h-2 mt-2" />
                    </div>
                  )}

                  {currentVitals.painLevel !== undefined && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Pain Level</p>
                        <p className="text-2xl font-bold text-red-700">{currentVitals.painLevel}/10</p>
                      </div>
                      <Progress value={currentVitals.painLevel * 10} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {currentVitals.painLevel === 0 && 'No pain'}
                        {currentVitals.painLevel > 0 && currentVitals.painLevel <= 3 && 'Mild pain'}
                        {currentVitals.painLevel > 3 && currentVitals.painLevel <= 6 && 'Moderate pain'}
                        {currentVitals.painLevel > 6 && 'Severe pain'}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Consciousness Level</span>
                      <Badge className="bg-green-600 text-white">{currentVitals.consciousness}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs History</CardTitle>
                <CardDescription>Complete record of all vital signs measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>BP</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>SpO2</TableHead>
                      <TableHead>RR</TableHead>
                      <TableHead>Pain</TableHead>
                      <TableHead>Recorded By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vitalsHistory.map((vital) => (
                      <TableRow key={vital.id}>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{vital.date}</p>
                            <p className="text-gray-600">{vital.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getVitalStatus('systolic', vital.systolic))}>
                            {vital.bp}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getVitalStatus('pulse', vital.pulse))}>
                            {vital.pulse}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getVitalStatus('temperature', vital.temperature))}>
                            {vital.temperature}°F
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getVitalStatus('spo2', vital.spo2))}>
                            {vital.spo2}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getVitalStatus('respiratoryRate', vital.respiratoryRate))}>
                            {vital.respiratoryRate}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{vital.painLevel || '-'}/10</span>
                        </TableCell>
                        <TableCell className="text-sm">{vital.recordedBy}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  Vital Signs Trends
                </CardTitle>
                <CardDescription>Visual representation of vital signs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Placeholder for charts - in production, use recharts */}
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <p className="text-center text-gray-600">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                      Blood Pressure Trend Chart
                    </p>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border-2 border-red-200">
                    <p className="text-center text-gray-600">
                      <LineChart className="w-12 h-12 mx-auto mb-2 text-red-600" />
                      Heart Rate Trend Chart
                    </p>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                    <p className="text-center text-gray-600">
                      <LineChart className="w-12 h-12 mx-auto mb-2 text-green-600" />
                      SpO2 Trend Chart
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Alerts & Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">All vitals within normal range</p>
                      <p className="text-sm text-green-700">Patient's vital signs are stable and healthy</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Regular monitoring recommended</p>
                      <p className="text-sm text-blue-700">Continue vitals check every 4 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Vital Signs Modal */}
      {showAddVital && (
        <AddVitalSignsDialog
          patient={patient}
          onClose={() => setShowAddVital(false)}
          onSave={(newVital: VitalRecord) => {
            setVitalsHistory([newVital, ...vitalsHistory]);
            setShowAddVital(false);
            toast.success('Vital signs recorded successfully!');
          }}
        />
      )}
    </div>
  );
}

// Add Vital Signs Dialog Component
interface AddVitalSignsDialogProps {
  patient: any;
  onClose: () => void;
  onSave: (vital: VitalRecord) => void;
}

function AddVitalSignsDialog({ patient, onClose, onSave }: AddVitalSignsDialogProps) {
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    temperature: '',
    spo2: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    painLevel: '0',
    consciousness: 'Alert',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.systolic || !formData.diastolic || !formData.pulse) {
      toast.error('Please fill in all required vital signs');
      return;
    }

    const bmi = formData.weight && formData.height 
      ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
      : undefined;

    const newVital: VitalRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      bp: `${formData.systolic}/${formData.diastolic}`,
      systolic: parseInt(formData.systolic),
      diastolic: parseInt(formData.diastolic),
      pulse: parseInt(formData.pulse),
      temperature: parseFloat(formData.temperature),
      spo2: parseInt(formData.spo2),
      respiratoryRate: parseInt(formData.respiratoryRate),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      bmi: bmi ? parseFloat(bmi) : undefined,
      painLevel: parseInt(formData.painLevel),
      consciousness: formData.consciousness,
      recordedBy: 'Current User',
      notes: formData.notes
    };

    onSave(newVital);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Add Vital Signs</CardTitle>
                <CardDescription>Record new vital signs for {patient.name}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Vitals */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Primary Vital Signs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic BP * (mmHg)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={formData.systolic}
                    onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic BP * (mmHg)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pulse">Pulse Rate * (bpm)</Label>
                  <Input
                    id="pulse"
                    type="number"
                    placeholder="72"
                    value={formData.pulse}
                    onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature * (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spo2">SpO2 * (%)</Label>
                  <Input
                    id="spo2"
                    type="number"
                    placeholder="98"
                    value={formData.spo2}
                    onChange={(e) => setFormData({...formData, spo2: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">Respiratory Rate * (per min)</Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    placeholder="16"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Measurements */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-600" />
                Additional Measurements (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pain & Consciousness */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Pain & Consciousness Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                  <Input
                    id="painLevel"
                    type="range"
                    min="0"
                    max="10"
                    value={formData.painLevel}
                    onChange={(e) => setFormData({...formData, painLevel: e.target.value})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>No Pain (0)</span>
                    <span className="font-bold text-lg">{formData.painLevel}</span>
                    <span>Worst Pain (10)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consciousness">Consciousness Level *</Label>
                  <select
                    id="consciousness"
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                    value={formData.consciousness}
                    onChange={(e) => setFormData({...formData, consciousness: e.target.value})}
                    required
                  >
                    <option value="Alert">Alert</option>
                    <option value="Verbal">Responds to Verbal</option>
                    <option value="Pain">Responds to Pain</option>
                    <option value="Unresponsive">Unresponsive</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter any observations or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Vital Signs
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
