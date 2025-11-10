import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft,
  Plus,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Droplet,
  Stethoscope,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthRecordProps {
  patientId: string;
  patientName: string;
  onBack: () => void;
}

export function HealthRecord({ patientId, patientName, onBack }: HealthRecordProps) {
  const [isAddingVitals, setIsAddingVitals] = useState(false);

  // Mock vital signs history
  const vitalSigns = [
    {
      date: '2024-01-15',
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 78,
      height: 175,
      oxygenSaturation: 98,
      glucose: 95,
      recordedBy: 'Nurse Johnson'
    },
    {
      date: '2023-12-10',
      bloodPressure: '125/82',
      heartRate: 75,
      temperature: 98.4,
      weight: 79,
      height: 175,
      oxygenSaturation: 97,
      glucose: 102,
      recordedBy: 'Nurse Williams'
    },
    {
      date: '2023-11-05',
      bloodPressure: '122/81',
      heartRate: 73,
      temperature: 98.5,
      weight: 79,
      height: 175,
      oxygenSaturation: 98,
      glucose: 98,
      recordedBy: 'Nurse Davis'
    }
  ];

  // Mock clinical notes
  const clinicalNotes = [
    {
      date: '2024-01-15',
      doctor: 'Dr. Michael Chen',
      department: 'Cardiology',
      chiefComplaint: 'Routine checkup',
      assessment: 'Patient appears healthy. Blood pressure slightly elevated but within normal range.',
      plan: 'Continue current medications. Follow-up in 3 months.',
      diagnosis: 'Hypertension - controlled'
    },
    {
      date: '2023-12-10',
      doctor: 'Dr. Sarah Williams',
      department: 'Internal Medicine',
      chiefComplaint: 'Blood sugar monitoring',
      assessment: 'HbA1c at 6.8%. Diabetes management going well.',
      plan: 'Continue Metformin. Recommend dietary consultation.',
      diagnosis: 'Type 2 Diabetes - controlled'
    }
  ];

  // Mock immunization records
  const immunizations = [
    {
      vaccine: 'Influenza',
      date: '2023-10-15',
      nextDue: '2024-10-15',
      administeredBy: 'Nurse Johnson',
      lot: 'FL2023-456'
    },
    {
      vaccine: 'Tetanus',
      date: '2021-03-20',
      nextDue: '2031-03-20',
      administeredBy: 'Nurse Williams',
      lot: 'TT2021-789'
    },
    {
      vaccine: 'Pneumococcal',
      date: '2020-05-12',
      nextDue: '2025-05-12',
      administeredBy: 'Nurse Davis',
      lot: 'PN2020-123'
    }
  ];

  // Data for charts
  const bloodPressureData = [
    { date: 'Nov', systolic: 122, diastolic: 81 },
    { date: 'Dec', systolic: 125, diastolic: 82 },
    { date: 'Jan', systolic: 120, diastolic: 80 }
  ];

  const glucoseData = [
    { date: 'Nov', value: 98 },
    { date: 'Dec', value: 102 },
    { date: 'Jan', value: 95 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-600">{patientName} • ID: {patientId}</p>
          </div>
        </div>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => setIsAddingVitals(!isAddingVitals)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vital Signs
        </Button>
      </div>

      {/* Add Vital Signs Form */}
      {isAddingVitals && (
        <Card className="border-0 shadow-sm border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Record New Vital Signs</span>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingVitals(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Blood Pressure</label>
                <Input placeholder="120/80" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Heart Rate (bpm)</label>
                <Input placeholder="72" type="number" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Temperature (°F)</label>
                <Input placeholder="98.6" type="number" step="0.1" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Weight (kg)</label>
                <Input placeholder="78" type="number" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">O2 Saturation (%)</label>
                <Input placeholder="98" type="number" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Glucose (mg/dL)</label>
                <Input placeholder="95" type="number" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">Notes</label>
                <Input placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="bg-green-500 hover:bg-green-600">
                <Save className="w-4 h-4 mr-2" />
                Save Vitals
              </Button>
              <Button variant="outline" onClick={() => setIsAddingVitals(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Vital Signs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Current Vital Signs
          </CardTitle>
          <p className="text-sm text-gray-600">Last recorded: {new Date(vitalSigns[0].date).toLocaleDateString()}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="text-xs text-gray-600">Blood Pressure</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].bloodPressure}</p>
              <p className="text-xs text-gray-600 mt-1">mmHg</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-gray-600">Heart Rate</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].heartRate}</p>
              <p className="text-xs text-gray-600 mt-1">bpm</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <span className="text-xs text-gray-600">Temperature</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].temperature}</p>
              <p className="text-xs text-gray-600 mt-1">°F</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="w-5 h-5 text-green-600" />
                <span className="text-xs text-gray-600">Weight</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].weight}</p>
              <p className="text-xs text-gray-600 mt-1">kg</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5 text-purple-600" />
                <span className="text-xs text-gray-600">O2 Saturation</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].oxygenSaturation}</p>
              <p className="text-xs text-gray-600 mt-1">%</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5 text-pink-600" />
                <span className="text-xs text-gray-600">Glucose</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].glucose}</p>
              <p className="text-xs text-gray-600 mt-1">mg/dL</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-600">Height</span>
              </div>
              <p className="text-2xl text-gray-900">{vitalSigns[0].height}</p>
              <p className="text-xs text-gray-600 mt-1">cm</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-yellow-600" />
                <span className="text-xs text-gray-600">BMI</span>
              </div>
              <p className="text-2xl text-gray-900">25.5</p>
              <p className="text-xs text-gray-600 mt-1">Normal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Blood Pressure Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-purple-600" />
              Glucose Level Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} name="Glucose" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Notes */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-600" />
            Clinical Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clinicalNotes.map((note, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-900">{note.doctor} • {note.department}</p>
                    <p className="text-xs text-gray-600">{new Date(note.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{note.diagnosis}</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Chief Complaint:</span>
                    <p className="text-sm text-gray-900">{note.chiefComplaint}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Assessment:</span>
                    <p className="text-sm text-gray-900">{note.assessment}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Plan:</span>
                    <p className="text-sm text-gray-900">{note.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs History */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Vital Signs History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>BP</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>O2 Sat</TableHead>
                <TableHead>Glucose</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitalSigns.map((vital, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(vital.date).toLocaleDateString()}</TableCell>
                  <TableCell>{vital.bloodPressure}</TableCell>
                  <TableCell>{vital.heartRate} bpm</TableCell>
                  <TableCell>{vital.temperature} °F</TableCell>
                  <TableCell>{vital.weight} kg</TableCell>
                  <TableCell>{vital.oxygenSaturation}%</TableCell>
                  <TableCell>{vital.glucose} mg/dL</TableCell>
                  <TableCell>{vital.recordedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Immunization Records */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            Immunization Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaccine</TableHead>
                <TableHead>Date Administered</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Administered By</TableHead>
                <TableHead>Lot Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {immunizations.map((imm, index) => (
                <TableRow key={index}>
                  <TableCell>{imm.vaccine}</TableCell>
                  <TableCell>{new Date(imm.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(imm.nextDue).toLocaleDateString()}</TableCell>
                  <TableCell>{imm.administeredBy}</TableCell>
                  <TableCell>{imm.lot}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
