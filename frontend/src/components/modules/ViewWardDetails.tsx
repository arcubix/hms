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

import React, { useState, useEffect } from 'react';
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
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

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

export function ViewWardDetails({ wardId, onClose }: ViewWardDetailsProps) {
  const [wardData, setWardData] = useState<any>(null);
  const [beds, setBeds] = useState<BedInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (wardId) {
      loadWardData();
      loadWardBeds();
      loadWardStats();
    }
  }, [wardId]);

  useEffect(() => {
    if (wardId) {
      loadStaff();
    }
  }, [wardId]);

  const loadWardData = async () => {
    try {
      setLoading(true);
      const data = await api.getEmergencyWard(parseInt(wardId || '0'));
      setWardData(data);
    } catch (error: any) {
      toast.error('Failed to load ward data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadWardBeds = async () => {
    try {
      const data = await api.getEmergencyWardBeds({ ward_id: parseInt(wardId || '0') });
      const transformedBeds: BedInfo[] = data.map((bed: any) => ({
        bedNumber: bed.bed_number || bed.bedNumber || '',
        status: (bed.status === 'Occupied' ? 'Occupied' : 
                bed.status === 'Available' ? 'Available' :
                bed.status === 'Under Cleaning' ? 'Cleaning' :
                bed.status === 'Maintenance' ? 'Maintenance' : 'Available') as BedInfo['status'],
        patient: bed.patient_name ? {
          name: bed.patient_name || '',
          age: bed.patient_age || 0,
          gender: bed.patient_gender || '',
          uhid: bed.uhid || bed.patient_uhid || '',
          admissionDate: bed.admission_date || '',
          diagnosis: bed.diagnosis || '',
          doctor: bed.doctor_name || '',
          severity: 'Stable' as const,
          vitalSigns: {
            heartRate: bed.vitals_pulse || 0,
            bloodPressure: bed.vitals_bp || '',
            temperature: bed.vitals_temp || 0,
            spo2: bed.vitals_spo2 || 0,
            respiratoryRate: bed.vitals_resp || 0
          },
          lastUpdated: bed.last_updated || ''
        } : undefined,
        lastCleaned: bed.last_cleaned_at || undefined,
        maintenanceNotes: bed.maintenance_notes || undefined
      }));
      setBeds(transformedBeds);
    } catch (error: any) {
      toast.error('Failed to load beds: ' + (error.message || 'Unknown error'));
    }
  };

  const loadWardStats = async () => {
    try {
      const data = await api.getEmergencyWardStats(parseInt(wardId || '0'));
      setStats(data);
    } catch (error: any) {
      console.warn('Could not load ward stats:', error);
    }
  };

  const loadStaff = async () => {
    try {
      // Load current duty staff for this ward
      const currentDate = new Date().toISOString().split('T')[0];
      const roster = await api.getEmergencyDutyRoster({ date: currentDate });
      const transformedStaff: StaffMember[] = roster
        .filter((entry: any) => entry.status === 'On Duty')
        .map((entry: any) => ({
          id: entry.user_id?.toString() || entry.id?.toString() || '',
          name: entry.user_name || '',
          role: entry.user_role || entry.specialization || 'Staff',
          shift: `${entry.shift_type} (${entry.shift_start_time} - ${entry.shift_end_time})`,
          contact: entry.user_phone || '',
          status: entry.status === 'On Duty' ? 'On Duty' : 'Off Duty'
        }));
      setStaff(transformedStaff);
    } catch (error: any) {
      console.warn('Could not load staff:', error);
      setStaff([]);
    }
  };

  if (loading && !wardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading ward details...</p>
        </div>
      </div>
    );
  }

  if (!wardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Ward Not Found</h1>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const ward = {
    id: wardData.id?.toString() || '',
    name: wardData.name || '',
    type: wardData.type || '',
    building: wardData.building_name || wardData.building || '',
    floor: wardData.floor_name || `Floor ${wardData.floor_number || ''}` || '',
    totalBeds: stats?.total_beds || wardData.total_beds || 0,
    occupiedBeds: stats?.occupied_beds || 0,
    availableBeds: stats?.available_beds || 0,
    cleaningBeds: stats?.cleaning_beds || 0,
    maintenanceBeds: stats?.maintenance_beds || 0,
    status: wardData.status || 'Active',
    incharge: wardData.incharge_name || wardData.incharge || '',
    contact: wardData.contact || '',
    email: wardData.email || wardData.incharge_email || '',
    established: wardData.established_date ? new Date(wardData.established_date).getFullYear().toString() : '',
    lastInspection: wardData.last_inspection_date || '',
    facilities: wardData.facilities ? (typeof wardData.facilities === 'string' ? JSON.parse(wardData.facilities) : wardData.facilities) : []
  };

  // Helper functions

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

  const occupancyRate = ward.totalBeds > 0 ? ((ward.occupiedBeds / ward.totalBeds) * 100).toFixed(0) : '0';

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
                  <h1 className="text-2xl font-semibold text-gray-900">{ward.name}</h1>
                  <p className="text-sm text-gray-600">
                    {ward.building} • {ward.floor} • {ward.type} Ward
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {ward.status}
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
              <p className="text-2xl font-bold text-blue-700">{ward.totalBeds}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium">Occupied</p>
              <p className="text-2xl font-bold text-orange-700">{ward.occupiedBeds}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-700">{ward.availableBeds}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium">Cleaning</p>
              <p className="text-2xl font-bold text-yellow-700">{ward.cleaningBeds}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-600 font-medium">Maintenance</p>
              <p className="text-2xl font-bold text-red-700">{ward.maintenanceBeds}</p>
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
                    {beds.map((bed) => (
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
                {beds.map((bed) => (
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
                    {staff.map((staffMember) => (
                      <div key={staffMember.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                      {ward.facilities.map((facility, index) => (
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
                          <p className="font-medium">{ward.established}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Inspection</p>
                          <p className="font-medium">{ward.lastInspection}</p>
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
                            {beds.filter(b => b.patient?.severity === 'Critical').length}
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
                      <p className="font-medium">{ward.incharge}</p>
                      <p className="text-xs text-gray-600">Ward Incharge</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{ward.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">{ward.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{ward.building}, {ward.floor}</span>
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
            wardName={ward.name}
            onClose={() => setShowMedicalRecords(false)}
          />
        </div>
      )}
    </div>
  );
}

