/**
 * View Ward Details Component
 * 
 * Advanced and modern ward details page showing:
 * - Interactive bed layout with real-time status
 * - Patient information and vital signs
 * - Ward statistics and analytics
 * - Staff information and duty roster
 * - Facility details and amenities
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { PatientMedicalRecords } from './PatientMedicalRecords';
import {
  Building2,
  X,
  Bed,
  Users,
  Activity,
  Heart,
  Thermometer,
  Droplet,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Stethoscope,
  Shield,
  Zap,
  Wifi,
  Wind,
  Monitor,
  Siren,
  RefreshCw,
  Download,
  Printer,
  BarChart3,
  FileText,
  ClipboardList,
  Bell,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ViewWardDetailsProps {
  wardId?: string;
  onClose: () => void;
}

interface BedInfo {
  bedNumber: string;
  status: 'Occupied' | 'Available' | 'Cleaning' | 'Maintenance' | 'Reserved';
  patient?: {
    name: string;
    age: number;
    gender: string;
    uhid: string;
    admissionDate: string;
    diagnosis: string;
    doctor: string;
    severity: 'Critical' | 'Stable' | 'Moderate';
    vitalSigns: {
      heartRate: number;
      bloodPressure: string;
      temperature: number;
      spo2: number;
      respiratoryRate: number;
    };
    lastUpdated: string;
  };
  lastCleaned?: string;
  maintenanceNotes?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  contact: string;
  status: 'On Duty' | 'Off Duty' | 'Break';
}

// Mock Data
const mockWardData = {
  id: 'W001',
  name: 'Emergency Ward A',
  type: 'Emergency',
  building: 'Main Building',
  floor: 'Ground Floor',
  totalBeds: 20,
  occupiedBeds: 14,
  availableBeds: 4,
  cleaningBeds: 1,
  maintenanceBeds: 1,
  status: 'Active',
  incharge: 'Nurse Alice Thompson',
  contact: '+1-555-0101',
  email: 'alice.thompson@hospital.com',
  established: '2015',
  lastInspection: '2024-11-15',
  facilities: [
    'Central Oxygen Supply',
    'Cardiac Monitors',
    'Ventilators',
    'Defibrillators',
    'Emergency Call System',
    'Nurse Station',
    'Isolation Capability',
    'Wi-Fi'
  ]
};

const mockBeds: BedInfo[] = [
  {
    bedNumber: 'EA-01',
    status: 'Occupied',
    patient: {
      name: 'Robert Johnson',
      age: 58,
      gender: 'Male',
      uhid: 'UHID-89456',
      admissionDate: '2024-11-21 08:30 AM',
      diagnosis: 'Acute Myocardial Infarction',
      doctor: 'Dr. Sarah Mitchell',
      severity: 'Critical',
      vitalSigns: {
        heartRate: 88,
        bloodPressure: '140/90',
        temperature: 98.6,
        spo2: 94,
        respiratoryRate: 18
      },
      lastUpdated: '5 mins ago'
    }
  },
  {
    bedNumber: 'EA-02',
    status: 'Occupied',
    patient: {
      name: 'Jennifer Williams',
      age: 34,
      gender: 'Female',
      uhid: 'UHID-89457',
      admissionDate: '2024-11-21 09:15 AM',
      diagnosis: 'Severe Dehydration',
      doctor: 'Dr. Michael Brown',
      severity: 'Stable',
      vitalSigns: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 99.1,
        spo2: 98,
        respiratoryRate: 16
      },
      lastUpdated: '10 mins ago'
    }
  },
  {
    bedNumber: 'EA-03',
    status: 'Available',
    lastCleaned: '2024-11-21 10:00 AM'
  },
  {
    bedNumber: 'EA-04',
    status: 'Occupied',
    patient: {
      name: 'Maria Garcia',
      age: 62,
      gender: 'Female',
      uhid: 'UHID-89459',
      admissionDate: '2024-11-21 11:30 AM',
      diagnosis: 'Acute Respiratory Distress',
      doctor: 'Dr. James Wilson',
      severity: 'Moderate',
      vitalSigns: {
        heartRate: 85,
        bloodPressure: '130/82',
        temperature: 99.8,
        spo2: 92,
        respiratoryRate: 22
      },
      lastUpdated: '3 mins ago'
    }
  },
  {
    bedNumber: 'EA-05',
    status: 'Available',
    lastCleaned: '2024-11-21 09:30 AM'
  },
  {
    bedNumber: 'EA-06',
    status: 'Cleaning',
    lastCleaned: 'In Progress'
  },
  {
    bedNumber: 'EA-07',
    status: 'Occupied',
    patient: {
      name: 'Thomas Anderson',
      age: 45,
      gender: 'Male',
      uhid: 'UHID-89460',
      admissionDate: '2024-11-20 02:15 PM',
      diagnosis: 'Head Trauma',
      doctor: 'Dr. Emily Davis',
      severity: 'Stable',
      vitalSigns: {
        heartRate: 78,
        bloodPressure: '125/78',
        temperature: 98.4,
        spo2: 97,
        respiratoryRate: 15
      },
      lastUpdated: '8 mins ago'
    }
  },
  {
    bedNumber: 'EA-08',
    status: 'Reserved',
    lastCleaned: '2024-11-21 08:00 AM'
  },
  {
    bedNumber: 'EA-09',
    status: 'Available',
    lastCleaned: '2024-11-21 07:30 AM'
  },
  {
    bedNumber: 'EA-10',
    status: 'Maintenance',
    maintenanceNotes: 'Oxygen supply line repair'
  },
  {
    bedNumber: 'EA-11',
    status: 'Occupied',
    patient: {
      name: 'Sarah Mitchell',
      age: 29,
      gender: 'Female',
      uhid: 'UHID-89461',
      admissionDate: '2024-11-21 07:45 AM',
      diagnosis: 'Severe Allergic Reaction',
      doctor: 'Dr. Michael Brown',
      severity: 'Moderate',
      vitalSigns: {
        heartRate: 95,
        bloodPressure: '118/76',
        temperature: 99.2,
        spo2: 95,
        respiratoryRate: 20
      },
      lastUpdated: '12 mins ago'
    }
  },
  {
    bedNumber: 'EA-12',
    status: 'Occupied',
    patient: {
      name: 'David Chen',
      age: 51,
      gender: 'Male',
      uhid: 'UHID-89462',
      admissionDate: '2024-11-21 06:30 AM',
      diagnosis: 'Chest Pain - Under Investigation',
      doctor: 'Dr. Sarah Mitchell',
      severity: 'Critical',
      vitalSigns: {
        heartRate: 92,
        bloodPressure: '145/95',
        temperature: 98.7,
        spo2: 93,
        respiratoryRate: 19
      },
      lastUpdated: '2 mins ago'
    }
  },
  {
    bedNumber: 'EA-13',
    status: 'Available',
    lastCleaned: '2024-11-21 11:00 AM'
  },
  {
    bedNumber: 'EA-14',
    status: 'Occupied',
    patient: {
      name: 'Linda Martinez',
      age: 67,
      gender: 'Female',
      uhid: 'UHID-89463',
      admissionDate: '2024-11-20 11:20 PM',
      diagnosis: 'Stroke - Ischemic',
      doctor: 'Dr. Emily Davis',
      severity: 'Critical',
      vitalSigns: {
        heartRate: 76,
        bloodPressure: '150/92',
        temperature: 98.9,
        spo2: 96,
        respiratoryRate: 17
      },
      lastUpdated: '7 mins ago'
    }
  },
  {
    bedNumber: 'EA-15',
    status: 'Occupied',
    patient: {
      name: 'James Wilson',
      age: 42,
      gender: 'Male',
      uhid: 'UHID-89464',
      admissionDate: '2024-11-21 10:15 AM',
      diagnosis: 'Severe Abdominal Pain',
      doctor: 'Dr. James Wilson',
      severity: 'Moderate',
      vitalSigns: {
        heartRate: 82,
        bloodPressure: '128/84',
        temperature: 99.5,
        spo2: 97,
        respiratoryRate: 16
      },
      lastUpdated: '15 mins ago'
    }
  },
  {
    bedNumber: 'EA-16',
    status: 'Occupied',
    patient: {
      name: 'Patricia Brown',
      age: 55,
      gender: 'Female',
      uhid: 'UHID-89465',
      admissionDate: '2024-11-21 09:45 AM',
      diagnosis: 'Diabetic Ketoacidosis',
      doctor: 'Dr. Michael Brown',
      severity: 'Stable',
      vitalSigns: {
        heartRate: 74,
        bloodPressure: '122/79',
        temperature: 98.8,
        spo2: 98,
        respiratoryRate: 14
      },
      lastUpdated: '20 mins ago'
    }
  },
  {
    bedNumber: 'EA-17',
    status: 'Occupied',
    patient: {
      name: 'Michael Davis',
      age: 38,
      gender: 'Male',
      uhid: 'UHID-89466',
      admissionDate: '2024-11-21 08:00 AM',
      diagnosis: 'Fracture - Multiple Ribs',
      doctor: 'Dr. Emily Davis',
      severity: 'Stable',
      vitalSigns: {
        heartRate: 80,
        bloodPressure: '126/82',
        temperature: 98.5,
        spo2: 96,
        respiratoryRate: 18
      },
      lastUpdated: '25 mins ago'
    }
  },
  {
    bedNumber: 'EA-18',
    status: 'Occupied',
    patient: {
      name: 'Elizabeth Taylor',
      age: 71,
      gender: 'Female',
      uhid: 'UHID-89467',
      admissionDate: '2024-11-20 09:30 PM',
      diagnosis: 'Pneumonia - Severe',
      doctor: 'Dr. Sarah Mitchell',
      severity: 'Critical',
      vitalSigns: {
        heartRate: 98,
        bloodPressure: '138/88',
        temperature: 101.2,
        spo2: 89,
        respiratoryRate: 24
      },
      lastUpdated: '4 mins ago'
    }
  },
  {
    bedNumber: 'EA-19',
    status: 'Occupied',
    patient: {
      name: 'Christopher Lee',
      age: 33,
      gender: 'Male',
      uhid: 'UHID-89468',
      admissionDate: '2024-11-21 11:00 AM',
      diagnosis: 'Drug Overdose',
      doctor: 'Dr. James Wilson',
      severity: 'Moderate',
      vitalSigns: {
        heartRate: 65,
        bloodPressure: '110/70',
        temperature: 97.8,
        spo2: 94,
        respiratoryRate: 12
      },
      lastUpdated: '18 mins ago'
    }
  },
  {
    bedNumber: 'EA-20',
    status: 'Available',
    lastCleaned: '2024-11-21 10:30 AM'
  }
];

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Alice Thompson',
    role: 'Ward Incharge',
    shift: 'Morning (6AM - 2PM)',
    contact: '+1-555-0101',
    status: 'On Duty'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Senior Nurse',
    shift: 'Morning (6AM - 2PM)',
    contact: '+1-555-0102',
    status: 'On Duty'
  },
  {
    id: '3',
    name: 'Michael Davis',
    role: 'Staff Nurse',
    shift: 'Morning (6AM - 2PM)',
    contact: '+1-555-0103',
    status: 'Break'
  },
  {
    id: '4',
    name: 'Emily Wilson',
    role: 'Staff Nurse',
    shift: 'Evening (2PM - 10PM)',
    contact: '+1-555-0104',
    status: 'Off Duty'
  },
  {
    id: '5',
    name: 'Robert Martinez',
    role: 'Nursing Assistant',
    shift: 'Morning (6AM - 2PM)',
    contact: '+1-555-0105',
    status: 'On Duty'
  }
];

export function ViewWardDetails({ wardId, onClose }: ViewWardDetailsProps) {
  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'Occupied': return 'bg-blue-500 hover:bg-blue-600';
      case 'Available': return 'bg-green-500 hover:bg-green-600';
      case 'Cleaning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Maintenance': return 'bg-red-500 hover:bg-red-600';
      case 'Reserved': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Stable': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVitalStatus = (type: string, value: number) => {
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'text-red-600';
        return 'text-green-600';
      case 'spo2':
        if (value < 95) return 'text-red-600';
        return 'text-green-600';
      case 'temperature':
        if (value < 97 || value > 99.5) return 'text-red-600';
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const occupancyRate = ((mockWardData.occupiedBeds / mockWardData.totalBeds) * 100).toFixed(0);

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
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{mockWardData.name}</h1>
                  <p className="text-sm text-gray-600">
                    {mockWardData.building} • {mockWardData.floor} • {mockWardData.type} Ward
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {mockWardData.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Total Beds</p>
              <p className="text-2xl font-bold text-blue-700">{mockWardData.totalBeds}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Occupied</p>
              <p className="text-2xl font-bold text-orange-700">{mockWardData.occupiedBeds}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-700">{mockWardData.availableBeds}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium">Cleaning</p>
              <p className="text-2xl font-bold text-yellow-700">{mockWardData.cleaningBeds}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Maintenance</p>
              <p className="text-2xl font-bold text-red-700">{mockWardData.maintenanceBeds}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">Occupancy</p>
              <p className="text-2xl font-bold text-purple-700">{occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Beds Layout */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-gray-900">Bed Layout</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        onClick={() => setViewMode('grid')}
                      >
                        Grid View
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        onClick={() => setViewMode('list')}
                      >
                        List View
                      </Button>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Cleaning</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Maintenance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span>Reserved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bed Grid View */}
            {viewMode === 'grid' && (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                    {mockBeds.map((bed) => (
                      <button
                        key={bed.bedNumber}
                        onClick={() => setSelectedBed(bed)}
                        className={`${getBedStatusColor(bed.status)} text-white rounded-lg p-4 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl relative group`}
                      >
                        <Bed className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-semibold text-sm">{bed.bedNumber}</p>
                        {bed.patient && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                            bed.patient.severity === 'Critical' ? 'bg-red-600' :
                            bed.patient.severity === 'Moderate' ? 'bg-yellow-500' :
                            'bg-green-500'
                          } border-2 border-white animate-pulse`}></div>
                        )}
                        {bed.status === 'Occupied' && (
                          <p className="text-xs mt-1 opacity-90 truncate">{bed.patient?.name}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bed List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {mockBeds.map((bed) => (
                  <Card key={bed.bedNumber} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${getBedStatusColor(bed.status)} rounded-lg flex items-center justify-center`}>
                            <Bed className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{bed.bedNumber}</p>
                            <Badge className={
                              bed.status === 'Occupied' ? 'bg-blue-100 text-blue-800' :
                              bed.status === 'Available' ? 'bg-green-100 text-green-800' :
                              bed.status === 'Cleaning' ? 'bg-yellow-100 text-yellow-800' :
                              bed.status === 'Maintenance' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }>
                              {bed.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {bed.patient ? (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">{bed.patient.name}</p>
                              <p className="text-sm text-gray-600">{bed.patient.uhid}</p>
                            </div>
                            <Badge className={getSeverityColor(bed.patient.severity)}>
                              {bed.patient.severity}
                            </Badge>
                            <Button size="sm" onClick={() => setSelectedBed(bed)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            {bed.lastCleaned && `Cleaned: ${bed.lastCleaned}`}
                            {bed.maintenanceNotes && `Note: ${bed.maintenanceNotes}`}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Ward Information Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Ward Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="staff">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="staff" className="space-y-4 mt-4">
                    {mockStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-gray-600">{staff.role}</p>
                            <p className="text-xs text-gray-500">{staff.shift}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            staff.status === 'On Duty' ? 'bg-green-100 text-green-800' :
                            staff.status === 'Break' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {staff.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="facilities" className="mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {mockWardData.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{facility}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Established</p>
                          <p className="font-medium">{mockWardData.established}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Inspection</p>
                          <p className="font-medium">{mockWardData.lastInspection}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Bed Occupancy Rate</span>
                          <span className="font-medium">{occupancyRate}%</span>
                        </div>
                        <Progress value={Number(occupancyRate)} className="h-3" />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Avg Stay</p>
                          <p className="text-xl font-bold text-green-700">2.5 days</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Turnover</p>
                          <p className="text-xl font-bold text-blue-700">8/day</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">Critical</p>
                          <p className="text-xl font-bold text-purple-700">
                            {mockBeds.filter(b => b.patient?.severity === 'Critical').length}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Ward Performance</p>
                            <p className="text-2xl font-bold text-blue-700">Excellent</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Bed Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {selectedBed ? (
                <>
                  {/* Bed Header */}
                  <Card className="border-2 border-blue-500">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Bed className="w-5 h-5 text-blue-600" />
                          {selectedBed.bedNumber}
                        </CardTitle>
                        <Button size="sm" variant="outline" onClick={() => setSelectedBed(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Badge className={
                        selectedBed.status === 'Occupied' ? 'bg-blue-100 text-blue-800 w-fit' :
                        selectedBed.status === 'Available' ? 'bg-green-100 text-green-800 w-fit' :
                        selectedBed.status === 'Cleaning' ? 'bg-yellow-100 text-yellow-800 w-fit' :
                        selectedBed.status === 'Maintenance' ? 'bg-red-100 text-red-800 w-fit' :
                        'bg-purple-100 text-purple-800 w-fit'
                      }>
                        {selectedBed.status}
                      </Badge>
                    </CardHeader>
                    {selectedBed.patient && (
                      <CardContent className="pt-6 space-y-4">
                        {/* Patient Info */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">Patient Information</h4>
                            <Badge className={getSeverityColor(selectedBed.patient.severity)}>
                              {selectedBed.patient.severity}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{selectedBed.patient.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Age/Gender:</span>
                              <span className="font-medium">{selectedBed.patient.age}Y / {selectedBed.patient.gender}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">UHID:</span>
                              <span className="font-medium">{selectedBed.patient.uhid}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Admitted:</span>
                              <span className="font-medium text-xs">{selectedBed.patient.admissionDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Doctor:</span>
                              <span className="font-medium">{selectedBed.patient.doctor}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Diagnosis */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {selectedBed.patient.diagnosis}
                          </p>
                        </div>

                        <Separator />

                        {/* Vital Signs */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Vital Signs</h4>
                            <span className="text-xs text-gray-500">{selectedBed.patient.lastUpdated}</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-gray-700">Heart Rate</span>
                              </div>
                              <span className={`font-bold ${getVitalStatus('heartRate', selectedBed.patient.vitalSigns.heartRate)}`}>
                                {selectedBed.patient.vitalSigns.heartRate} bpm
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-gray-700">Blood Pressure</span>
                              </div>
                              <span className="font-bold text-blue-600">
                                {selectedBed.patient.vitalSigns.bloodPressure}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-orange-600" />
                                <span className="text-sm text-gray-700">Temperature</span>
                              </div>
                              <span className={`font-bold ${getVitalStatus('temperature', selectedBed.patient.vitalSigns.temperature)}`}>
                                {selectedBed.patient.vitalSigns.temperature}°F
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Droplet className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-700">SpO2</span>
                              </div>
                              <span className={`font-bold ${getVitalStatus('spo2', selectedBed.patient.vitalSigns.spo2)}`}>
                                {selectedBed.patient.vitalSigns.spo2}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Wind className="w-5 h-5 text-purple-600" />
                                <span className="text-sm text-gray-700">Resp. Rate</span>
                              </div>
                              <span className="font-bold text-purple-600">
                                {selectedBed.patient.vitalSigns.respiratoryRate}/min
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-4 space-y-2">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowMedicalRecords(true)}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Medical Records
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Update Vitals
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Bell className="w-4 h-4 mr-2" />
                            Set Alert
                          </Button>
                        </div>
                      </CardContent>
                    )}
                    {!selectedBed.patient && (
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">This bed is {selectedBed.status.toLowerCase()}</p>
                          {selectedBed.lastCleaned && (
                            <p className="text-sm text-gray-500 mb-4">Last cleaned: {selectedBed.lastCleaned}</p>
                          )}
                          {selectedBed.maintenanceNotes && (
                            <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg mb-4">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              {selectedBed.maintenanceNotes}
                            </p>
                          )}
                          {selectedBed.status === 'Available' && (
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                              <Plus className="w-4 h-4 mr-2" />
                              Assign Patient
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a bed to view details</p>
                  </CardContent>
                </Card>
              )}

              {/* Ward Contact Card */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle className="text-base">Ward Contact</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{mockWardData.incharge}</p>
                      <p className="text-xs text-gray-600">Ward Incharge</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{mockWardData.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">{mockWardData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{mockWardData.building}, {mockWardData.floor}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Ward
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Medical Records Modal */}
      {showMedicalRecords && selectedBed?.patient && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <PatientMedicalRecords
            patientId={selectedBed.patient.uhid}
            bedNumber={selectedBed.bedNumber}
            wardName={mockWardData.name}
            onClose={() => setShowMedicalRecords(false)}
          />
        </div>
      )}
    </div>
  );
}