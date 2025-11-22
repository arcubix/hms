/**
 * Referred Patients List Page
 * 
 * Complete list of referred patients:
 * - Filter by hospital
 * - Search and filters
 * - Patient details
 * - Referral status tracking
 * - Export functionality
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Phone,
  Mail,
  Calendar,
  Hospital,
  User,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReferredPatientsListProps {
  onBack: () => void;
  selectedHospitalId?: string;
}

export function ReferredPatientsList({ onBack, selectedHospitalId }: ReferredPatientsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHospital, setFilterHospital] = useState(selectedHospitalId || 'all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Mock referred patients data
  const referredPatients = [
    {
      id: 'REF-2024-001',
      patientName: 'John Smith',
      patientId: 'UHID-78945',
      age: 45,
      gender: 'Male',
      phone: '+1-555-0123',
      referredTo: 'Apollo Hospital',
      referredBy: 'Dr. Sarah Johnson',
      referralDate: '2024-11-20',
      department: 'Cardiology',
      reason: 'Advanced cardiac care required',
      status: 'completed',
      followUpDate: '2024-11-25',
      priority: 'high'
    },
    {
      id: 'REF-2024-002',
      patientName: 'Emily Davis',
      patientId: 'UHID-78946',
      age: 32,
      gender: 'Female',
      phone: '+1-555-0124',
      referredTo: 'Max Healthcare',
      referredBy: 'Dr. Michael Chen',
      referralDate: '2024-11-19',
      department: 'Neurology',
      reason: 'Specialized neurological consultation',
      status: 'in-progress',
      followUpDate: '2024-11-22',
      priority: 'high'
    },
    {
      id: 'REF-2024-003',
      patientName: 'Robert Wilson',
      patientId: 'UHID-78947',
      age: 58,
      gender: 'Male',
      phone: '+1-555-0125',
      referredTo: 'Fortis Hospital',
      referredBy: 'Dr. Priya Sharma',
      referralDate: '2024-11-18',
      department: 'Oncology',
      reason: 'Cancer treatment and therapy',
      status: 'pending',
      followUpDate: '2024-11-23',
      priority: 'urgent'
    },
    {
      id: 'REF-2024-004',
      patientName: 'Sarah Martinez',
      patientId: 'UHID-78948',
      age: 28,
      gender: 'Female',
      phone: '+1-555-0126',
      referredTo: 'Apollo Hospital',
      referredBy: 'Dr. James Anderson',
      referralDate: '2024-11-17',
      department: 'Orthopedics',
      reason: 'Complex fracture management',
      status: 'completed',
      followUpDate: '2024-11-24',
      priority: 'medium'
    },
    {
      id: 'REF-2024-005',
      patientName: 'David Brown',
      patientId: 'UHID-78949',
      age: 65,
      gender: 'Male',
      phone: '+1-555-0127',
      referredTo: 'Max Healthcare',
      referredBy: 'Dr. Lisa Wang',
      referralDate: '2024-11-16',
      department: 'Nephrology',
      reason: 'Kidney transplant evaluation',
      status: 'in-progress',
      followUpDate: '2024-11-21',
      priority: 'high'
    },
    {
      id: 'REF-2024-006',
      patientName: 'Jennifer Taylor',
      patientId: 'UHID-78950',
      age: 42,
      gender: 'Female',
      phone: '+1-555-0128',
      referredTo: 'Fortis Hospital',
      referredBy: 'Dr. Raj Kumar',
      referralDate: '2024-11-15',
      department: 'Gastroenterology',
      reason: 'Advanced endoscopy procedure',
      status: 'pending',
      followUpDate: '2024-11-22',
      priority: 'medium'
    }
  ];

  const hospitals = [
    { value: 'all', label: 'All Hospitals' },
    { value: 'apollo', label: 'Apollo Hospital' },
    { value: 'max', label: 'Max Healthcare' },
    { value: 'fortis', label: 'Fortis Hospital' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    toast.success('Referred patients list exported successfully!');
  };

  const handleViewDetails = (patientId: string) => {
    toast.info(`Viewing details for ${patientId}`);
  };

  // Statistics
  const totalReferrals = referredPatients.length;
  const pendingReferrals = referredPatients.filter(p => p.status === 'pending').length;
  const inProgressReferrals = referredPatients.filter(p => p.status === 'in-progress').length;
  const completedReferrals = referredPatients.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Referral Hospitals
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Referred Patients
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track and manage patient referrals to partner hospitals
                </p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{totalReferrals}</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
              <p className="text-xs text-blue-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-800">{pendingReferrals}</Badge>
              </div>
              <p className="text-2xl font-bold text-orange-900">{pendingReferrals}</p>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xs text-orange-600 mt-1">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">{inProgressReferrals}</Badge>
              </div>
              <p className="text-2xl font-bold text-blue-900">{inProgressReferrals}</p>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xs text-blue-600 mt-1">Under treatment</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">{completedReferrals}</Badge>
              </div>
              <p className="text-2xl font-bold text-green-900">{completedReferrals}</p>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xs text-green-600 mt-1">Successfully treated</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-xs mb-2 block">
                  Search Patient
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Name, ID, Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filter-hospital" className="text-xs mb-2 block">
                  Hospital
                </Label>
                <Select value={filterHospital} onValueChange={setFilterHospital}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.value} value={hospital.value}>
                        {hospital.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-status" className="text-xs mb-2 block">
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-date" className="text-xs mb-2 block">
                  Date Range
                </Label>
                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referred Patients List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Referral ID</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Referred To</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-mono text-sm text-blue-600">
                          {patient.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{patient.patientName}</p>
                          <p className="text-xs text-gray-600">{patient.patientId}</p>
                          <p className="text-xs text-gray-500">
                            {patient.age}Y, {patient.gender}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Hospital className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{patient.referredTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">
                          {patient.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{patient.referredBy}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          {patient.referralDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(patient.priority)}>
                          {patient.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(patient.id)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {referredPatients.length} of {referredPatients.length} referrals
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
