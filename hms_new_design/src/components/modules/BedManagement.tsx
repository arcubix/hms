import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { 
  Bed,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Grid3x3,
  List,
  UserPlus,
  Building,
  DoorOpen,
  Stethoscope,
  Printer,
  Download,
  ChevronDown
} from 'lucide-react';

interface BedData {
  id: string;
  bedNumber: string;
  ward: string;
  floor: string;
  category: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientName?: string;
  patientId?: string;
  admissionDate?: string;
  doctor?: string;
  expectedDischarge?: string;
}

interface Admission {
  id: string;
  admissionId: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  admissionDate: string;
  admissionTime: string;
  department: string;
  doctor: string;
  ward: string;
  bedNumber: string;
  diagnosis: string;
  status: 'active' | 'discharged' | 'transferred';
  expectedDischarge: string;
}

interface BedCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  totalBeds: number;
  occupiedBeds: number;
}

const mockBeds: BedData[] = [
  {
    id: '1',
    bedNumber: 'A101',
    ward: 'General Ward A',
    floor: '1st Floor',
    category: 'General',
    status: 'occupied',
    patientName: 'John Smith',
    patientId: 'P001',
    admissionDate: '2024-11-08',
    doctor: 'Dr. Sarah Williams',
    expectedDischarge: '2024-11-15'
  },
  {
    id: '2',
    bedNumber: 'A102',
    ward: 'General Ward A',
    floor: '1st Floor',
    category: 'General',
    status: 'available'
  },
  {
    id: '3',
    bedNumber: 'ICU-01',
    ward: 'ICU',
    floor: '2nd Floor',
    category: 'ICU',
    status: 'occupied',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    admissionDate: '2024-11-09',
    doctor: 'Dr. Michael Chen',
    expectedDischarge: '2024-11-12'
  },
  {
    id: '4',
    bedNumber: 'P201',
    ward: 'Private Ward',
    floor: '2nd Floor',
    category: 'Private',
    status: 'reserved',
    patientName: 'Robert Davis',
    patientId: 'P003',
    admissionDate: '2024-11-11',
    doctor: 'Dr. James Wilson'
  },
  {
    id: '5',
    bedNumber: 'A103',
    ward: 'General Ward A',
    floor: '1st Floor',
    category: 'General',
    status: 'maintenance'
  }
];

const mockAdmissions: Admission[] = [
  {
    id: '1',
    admissionId: 'ADM001',
    patientName: 'John Smith',
    patientId: 'P001',
    age: 45,
    gender: 'Male',
    phone: '+92-300-1234567',
    address: '123 Main Street, Karachi',
    admissionDate: '2024-11-08',
    admissionTime: '09:30 AM',
    department: 'General Medicine',
    doctor: 'Dr. Sarah Williams',
    ward: 'General Ward A',
    bedNumber: 'A101',
    diagnosis: 'Pneumonia',
    status: 'active',
    expectedDischarge: '2024-11-15'
  },
  {
    id: '2',
    admissionId: 'ADM002',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    age: 62,
    gender: 'Female',
    phone: '+92-300-9876543',
    address: '456 Oak Avenue, Lahore',
    admissionDate: '2024-11-09',
    admissionTime: '02:15 PM',
    department: 'Cardiology',
    doctor: 'Dr. Michael Chen',
    ward: 'ICU',
    bedNumber: 'ICU-01',
    diagnosis: 'Myocardial Infarction',
    status: 'active',
    expectedDischarge: '2024-11-12'
  }
];

const mockCategories: BedCategory[] = [
  {
    id: '1',
    name: 'General Ward',
    description: 'Standard hospital beds in general wards',
    basePrice: 1500,
    totalBeds: 50,
    occupiedBeds: 32
  },
  {
    id: '2',
    name: 'Private Room',
    description: 'Single occupancy private rooms with amenities',
    basePrice: 5000,
    totalBeds: 20,
    occupiedBeds: 15
  },
  {
    id: '3',
    name: 'ICU',
    description: 'Intensive Care Unit beds with monitoring',
    basePrice: 10000,
    totalBeds: 15,
    occupiedBeds: 12
  },
  {
    id: '4',
    name: 'Pediatric Ward',
    description: 'Specialized beds for children',
    basePrice: 2000,
    totalBeds: 25,
    occupiedBeds: 18
  }
];

export function BedManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Add Admission Dialog States
  const [isAddAdmissionOpen, setIsAddAdmissionOpen] = useState(false);
  const [isAddBedOpen, setIsAddBedOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const beds = mockBeds;
  const admissions = mockAdmissions;
  const categories = mockCategories;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'transferred':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'occupied':
        return <User className="w-4 h-4 text-red-600" />;
      case 'reserved':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bed.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bed.patientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWard === 'all' || bed.ward === selectedWard;
    const matchesStatus = selectedStatus === 'all' || bed.status === selectedStatus;
    return matchesSearch && matchesWard && matchesStatus;
  });

  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700">Total</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalBeds}</h3>
            <p className="text-sm text-gray-600">Total Beds</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700">Available</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{availableBeds}</h3>
            <p className="text-sm text-gray-600">Available Beds</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <Badge className="bg-red-100 text-red-700">Occupied</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{occupiedBeds}</h3>
            <p className="text-sm text-gray-600">Occupied Beds</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-700">Rate</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{occupancyRate}%</h3>
            <p className="text-sm text-gray-600">Occupancy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admissions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Recent Admissions
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveSection('admissions')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {admissions.slice(0, 3).map((admission) => (
              <div key={admission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{admission.patientName}</p>
                    <p className="text-sm text-gray-600">ID: {admission.patientId} • {admission.ward} - {admission.bedNumber}</p>
                    <p className="text-xs text-gray-500">Admitted: {admission.admissionDate} at {admission.admissionTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(admission.status)}>
                    {admission.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Dr. {admission.doctor}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ward Occupancy */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Ward Occupancy Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 mb-2">{category.name}</h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">{category.occupiedBeds}/{category.totalBeds}</span>
                  <span className="text-sm text-gray-600">
                    {((category.occupiedBeds / category.totalBeds) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(category.occupiedBeds / category.totalBeds) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Base Price: PKR {category.basePrice}/day</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdmissions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Admissions</h2>
          <p className="text-sm text-gray-600 mt-1">Manage patient admissions and bed assignments</p>
        </div>
        <Dialog open={isAddAdmissionOpen} onOpenChange={setIsAddAdmissionOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Admission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl">New Patient Admission</DialogTitle>
              <DialogDescription>
                Fill in the patient details to create a new admission
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              {/* Patient Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient Name</Label>
                    <Input placeholder="Enter patient name" className="mt-2" />
                  </div>
                  <div>
                    <Label>Patient ID / MR#</Label>
                    <Input placeholder="Enter patient ID" className="mt-2" />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" placeholder="Enter age" className="mt-2" />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input placeholder="+92-XXX-XXXXXXX" className="mt-2" />
                  </div>
                  <div>
                    <Label>Emergency Contact</Label>
                    <Input placeholder="+92-XXX-XXXXXXX" className="mt-2" />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Textarea placeholder="Enter full address" className="mt-2" rows={2} />
                  </div>
                </div>
              </div>

              {/* Admission Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Admission Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Admission Date</Label>
                    <Input type="date" className="mt-2" />
                  </div>
                  <div>
                    <Label>Admission Time</Label>
                    <Input type="time" className="mt-2" />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Medicine</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Attending Doctor</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr1">Dr. Sarah Williams</SelectItem>
                        <SelectItem value="dr2">Dr. Michael Chen</SelectItem>
                        <SelectItem value="dr3">Dr. James Wilson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ward</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Ward A</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="private">Private Ward</SelectItem>
                        <SelectItem value="pediatric">Pediatric Ward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bed Number</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select bed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a101">A101</SelectItem>
                        <SelectItem value="a102">A102</SelectItem>
                        <SelectItem value="a103">A103</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Diagnosis</Label>
                    <Textarea placeholder="Enter diagnosis details" className="mt-2" rows={3} />
                  </div>
                  <div>
                    <Label>Expected Discharge Date</Label>
                    <Input type="date" className="mt-2" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsAddAdmissionOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Admit Patient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by patient name, ID, or bed number..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="General Ward A">General Ward A</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Private Ward">Private Ward</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admissions Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Admission ID</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Bed Assignment</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Expected Discharge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((admission) => (
                <TableRow key={admission.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{admission.admissionId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{admission.patientName}</p>
                      <p className="text-xs text-gray-600">ID: {admission.patientId}</p>
                      <p className="text-xs text-gray-500">{admission.age}Y • {admission.gender}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-gray-900">{admission.phone}</p>
                      <p className="text-xs text-gray-500">{admission.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{admission.bedNumber}</p>
                      <p className="text-xs text-gray-600">{admission.ward}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{admission.doctor}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-gray-900">{admission.admissionDate}</p>
                      <p className="text-xs text-gray-500">{admission.admissionTime}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{admission.expectedDischarge}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(admission.status)}>
                      {admission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderBedList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bed List</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all hospital beds</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isAddBedOpen} onOpenChange={setIsAddBedOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Bed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="border-b border-gray-200 pb-4">
                <DialogTitle className="text-2xl">Add New Bed</DialogTitle>
                <DialogDescription>
                  Configure a new bed in the hospital
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bed Number</Label>
                    <Input placeholder="e.g., A101" className="mt-2" />
                  </div>
                  <div>
                    <Label>Floor</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ground">Ground Floor</SelectItem>
                        <SelectItem value="1st">1st Floor</SelectItem>
                        <SelectItem value="2nd">2nd Floor</SelectItem>
                        <SelectItem value="3rd">3rd Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ward</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Ward A</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="private">Private Ward</SelectItem>
                        <SelectItem value="pediatric">Pediatric Ward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bed Category</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                        <SelectItem value="pediatric">Pediatric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Description (Optional)</Label>
                    <Textarea placeholder="Additional bed information..." className="mt-2" rows={3} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsAddBedOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Bed
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search beds..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="General Ward A">General Ward A</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Private Ward">Private Ward</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Beds Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => (
            <Card key={bed.id} className={`border-2 ${
              bed.status === 'available' ? 'border-green-200 bg-green-50' :
              bed.status === 'occupied' ? 'border-red-200 bg-red-50' :
              bed.status === 'reserved' ? 'border-blue-200 bg-blue-50' :
              'border-gray-200 bg-gray-50'
            } hover:shadow-lg transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{bed.bedNumber}</h3>
                    <p className="text-xs text-gray-600">{bed.ward}</p>
                    <p className="text-xs text-gray-500">{bed.floor}</p>
                  </div>
                  <Badge className={getStatusColor(bed.status)}>
                    {bed.status}
                  </Badge>
                </div>

                {bed.status === 'occupied' && bed.patientName && (
                  <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <p className="font-medium text-gray-900 text-sm">{bed.patientName}</p>
                    </div>
                    <p className="text-xs text-gray-600">ID: {bed.patientId}</p>
                    <p className="text-xs text-gray-500">Since: {bed.admissionDate}</p>
                    <p className="text-xs text-gray-500">Dr. {bed.doctor}</p>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Bed Number</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeds.map((bed) => (
                  <TableRow key={bed.id} className="hover:bg-gray-50">
                    <TableCell className="font-bold text-gray-900">{bed.bedNumber}</TableCell>
                    <TableCell className="text-sm text-gray-900">{bed.ward}</TableCell>
                    <TableCell className="text-sm text-gray-600">{bed.floor}</TableCell>
                    <TableCell className="text-sm text-gray-600">{bed.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bed.status)}
                        <Badge className={getStatusColor(bed.status)}>
                          {bed.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bed.patientName ? (
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{bed.patientName}</p>
                          <p className="text-xs text-gray-500">ID: {bed.patientId}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{bed.doctor || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderBedCategory = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bed Categories</h2>
          <p className="text-sm text-gray-600 mt-1">Manage bed types and pricing</p>
        </div>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl">Add Bed Category</DialogTitle>
              <DialogDescription>
                Create a new bed category with pricing
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-6">
              <div>
                <Label>Category Name</Label>
                <Input placeholder="e.g., VIP Suite" className="mt-2" />
              </div>
              <div>
                <Label>Base Price (Per Day)</Label>
                <Input type="number" placeholder="e.g., 5000" className="mt-2" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the category..." className="mt-2" rows={4} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Base Price</p>
                  <p className="text-2xl font-bold text-blue-600">PKR {category.basePrice.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per day</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Bed Occupancy</p>
                    <p className="text-sm font-medium text-gray-900">
                      {category.occupiedBeds}/{category.totalBeds}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${(category.occupiedBeds / category.totalBeds) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((category.occupiedBeds / category.totalBeds) * 100).toFixed(1)}% occupied
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">{category.totalBeds - category.occupiedBeds}</p>
                      <p className="text-xs text-gray-600">Available</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{category.occupiedBeds}</p>
                      <p className="text-xs text-gray-600">Occupied</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'admissions':
        return renderAdmissions();
      case 'bedlist':
        return renderBedList();
      case 'category':
        return renderBedCategory();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Bed className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Bed Management</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('dashboard')}
              className="flex items-center gap-2"
            >
              <Bed className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={activeSection === 'admissions' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('admissions')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              All Admissions
            </Button>
            <Button
              variant={activeSection === 'bedlist' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('bedlist')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Bed List
            </Button>
            <Button
              variant={activeSection === 'category' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('category')}
              className="flex items-center gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              Bed Category
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}
