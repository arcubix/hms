/**
 * Birth Certificates Management System
 * 
 * Features:
 * - Birth certificate registration
 * - Certificate listing with search and filters
 * - PDF certificate generation and preview
 * - Print and download certificates
 * - Mother and baby information tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Baby,
  Search,
  Plus,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Printer,
  Filter,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Building2,
} from 'lucide-react';

// Types
interface BirthCertificate {
  id: string;
  certificateNo: string;
  babyName: string;
  motherName: string;
  motherMRN: string;
  motherNIC: string;
  fatherName: string;
  fatherCNIC: string;
  deliveryNo: string;
  modeOfDelivery: string;
  birthmark: string;
  doctorName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  timeOfBirth: string;
  gender: 'Male' | 'Female';
  weight: string;
  height: string;
  headCircumference: string;
  remarks: string;
  registrationDate: string;
  status: 'Pending' | 'Issued' | 'Verified';
}

const BirthCertificates = () => {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showCertificatePDF, setShowCertificatePDF] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<BirthCertificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    babyName: '',
    motherName: '',
    motherMRN: '',
    motherNIC: '',
    fatherName: '',
    fatherCNIC: '',
    deliveryNo: '3192',
    modeOfDelivery: '',
    birthmark: '',
    doctorName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '27-11-2025',
    timeOfBirth: '9:00 AM',
    gender: 'Male',
    weight: '',
    height: '0',
    headCircumference: '0',
    remarks: '',
  });

  // Mock data - Birth certificates
  const mockCertificates: BirthCertificate[] = [
    {
      id: 'BC001',
      certificateNo: 'BC-2025-001',
      babyName: 'Sara Ahmed',
      motherName: 'Fatima Ahmed',
      motherMRN: 'MRN001234',
      motherNIC: '42101-1234567-8',
      fatherName: 'Ahmed Ali',
      fatherCNIC: '42101-7654321-2',
      deliveryNo: '3192',
      modeOfDelivery: 'Normal Delivery',
      birthmark: 'Small birthmark on left shoulder',
      doctorName: 'Dr. Priya Sharma',
      phoneNumber: '+92-300-1234567',
      address: '123 Main Street, Karachi',
      dateOfBirth: '2025-11-27',
      timeOfBirth: '09:00 AM',
      gender: 'Female',
      weight: '3.2 kg',
      height: '50 cm',
      headCircumference: '34 cm',
      remarks: 'Healthy baby, no complications',
      registrationDate: '2025-11-27',
      status: 'Issued',
    },
    {
      id: 'BC002',
      certificateNo: 'BC-2025-002',
      babyName: 'Hassan Khan',
      motherName: 'Ayesha Khan',
      motherMRN: 'MRN001235',
      motherNIC: '42101-2345678-9',
      fatherName: 'Muhammad Khan',
      fatherCNIC: '42101-8765432-3',
      deliveryNo: '3193',
      modeOfDelivery: 'C-Section',
      birthmark: 'None',
      doctorName: 'Dr. Anjali Mehta',
      phoneNumber: '+92-300-2345678',
      address: '456 Park Avenue, Lahore',
      dateOfBirth: '2025-11-26',
      timeOfBirth: '02:30 PM',
      gender: 'Male',
      weight: '3.5 kg',
      height: '52 cm',
      headCircumference: '35 cm',
      remarks: 'Healthy delivery, mother and baby doing well',
      registrationDate: '2025-11-26',
      status: 'Issued',
    },
    {
      id: 'BC003',
      certificateNo: 'BC-2025-003',
      babyName: 'Pending Registration',
      motherName: 'Zainab Hussain',
      motherMRN: 'MRN001236',
      motherNIC: '42101-3456789-0',
      fatherName: 'Ali Hussain',
      fatherCNIC: '42101-9876543-4',
      deliveryNo: '3194',
      modeOfDelivery: 'Normal Delivery',
      birthmark: 'Small mark on right foot',
      doctorName: 'Dr. Rajesh Kumar',
      phoneNumber: '+92-300-3456789',
      address: '789 Garden Road, Islamabad',
      dateOfBirth: '2025-11-28',
      timeOfBirth: '11:15 AM',
      gender: 'Female',
      weight: '2.9 kg',
      height: '48 cm',
      headCircumference: '33 cm',
      remarks: 'Awaiting name confirmation from parents',
      registrationDate: '2025-11-28',
      status: 'Pending',
    },
  ];

  // Filter certificates
  const filteredCertificates = mockCertificates.filter(cert => {
    const matchesSearch = 
      cert.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.babyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.motherMRN.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalCertificates = mockCertificates.length;
  const issuedCertificates = mockCertificates.filter(c => c.status === 'Issued').length;
  const pendingCertificates = mockCertificates.filter(c => c.status === 'Pending').length;

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Issued':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewCertificate = (certificate: BirthCertificate) => {
    setSelectedCertificate(certificate);
    setShowCertificatePDF(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Birth Certificates</h1>
          <p className="text-gray-600 mt-1">Register and manage birth certificates</p>
        </div>
        <Button 
          className="bg-[#27AE60] hover:bg-green-600" 
          onClick={() => setShowRegisterDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Birth
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Certificates</p>
                <h3 className="text-2xl">{totalCertificates}</h3>
                <p className="text-xs text-blue-600 mt-1">All Time</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Issued</p>
                <h3 className="text-2xl">{issuedCertificates}</h3>
                <p className="text-xs text-green-600 mt-1">Completed</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <h3 className="text-2xl">{pendingCertificates}</h3>
                <p className="text-xs text-orange-600 mt-1">Awaiting Processing</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by certificate no, baby name, mother name, or MRN..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Certificate No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Baby Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Mother Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Birth Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Baby className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{certificate.certificateNo}</div>
                          <div className="text-xs text-gray-500">Delivery: {certificate.deliveryNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{certificate.babyName}</div>
                        <div className="text-sm text-gray-500">
                          {certificate.gender} • {certificate.weight}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{certificate.motherName}</div>
                        <div className="text-xs text-gray-500">MRN: {certificate.motherMRN}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(certificate.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">{certificate.timeOfBirth}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(certificate.status)} variant="outline">
                        {certificate.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCertificate(certificate)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Register Birth Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Birth Certificate</DialogTitle>
            <DialogDescription>Register a new birth certificate with complete details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Baby name */}
              <div className="col-span-2">
                <Label>Baby name</Label>
                <Input
                  value={formData.babyName}
                  onChange={(e) => handleInputChange('babyName', e.target.value)}
                  placeholder="Enter baby name"
                />
              </div>

              {/* Mother name */}
              <div className="col-span-2">
                <Label>Mother name*</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    placeholder="Search By Name, MR# or Phone"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mother MR# */}
              <div className="col-span-2">
                <Label>Mother MR#</Label>
                <Input
                  value={formData.motherMRN}
                  onChange={(e) => handleInputChange('motherMRN', e.target.value)}
                  placeholder="Mother MR#"
                />
              </div>

              {/* Mother's NIC# */}
              <div className="col-span-2">
                <Label>Mother's NIC#</Label>
                <Input
                  value={formData.motherNIC}
                  onChange={(e) => handleInputChange('motherNIC', e.target.value)}
                  placeholder="Mother's NIC#"
                />
              </div>

              {/* Name of father */}
              <div className="col-span-2">
                <Label>Name of father</Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Name of father"
                />
              </div>

              {/* Father CNIC */}
              <div className="col-span-2">
                <Label>Father CNIC</Label>
                <Input
                  value={formData.fatherCNIC}
                  onChange={(e) => handleInputChange('fatherCNIC', e.target.value)}
                  placeholder="Father CNIC#"
                />
              </div>

              {/* Delivery no */}
              <div className="col-span-2">
                <Label>Delivery no</Label>
                <Input
                  value={formData.deliveryNo}
                  onChange={(e) => handleInputChange('deliveryNo', e.target.value)}
                  placeholder="Delivery number"
                />
              </div>

              {/* Mode of delivery */}
              <div className="col-span-2">
                <Label>Mode of delivery</Label>
                <Input
                  value={formData.modeOfDelivery}
                  onChange={(e) => handleInputChange('modeOfDelivery', e.target.value)}
                  placeholder="Mode of delivery"
                />
              </div>

              {/* Birthmark/congenital abnormality */}
              <div className="col-span-2">
                <Label>Birthmark/congenital abnormality</Label>
                <Input
                  value={formData.birthmark}
                  onChange={(e) => handleInputChange('birthmark', e.target.value)}
                  placeholder="Birthmark/congenital abnormality"
                />
              </div>

              {/* Doctor */}
              <div className="col-span-2">
                <Label>Doctor</Label>
                <Select value={formData.doctorName} onValueChange={(val) => handleInputChange('doctorName', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                    <SelectItem value="Dr. Anjali Mehta">Dr. Anjali Mehta</SelectItem>
                    <SelectItem value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone# of spouse/guardian/attendant */}
              <div className="col-span-2">
                <Label>Phone# of spouse/guardian/attendant</Label>
                <div className="flex gap-2">
                  <Input value="+92" className="w-20" disabled />
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter Phone Number"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              {/* Date of birth */}
              <div>
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>

              {/* Time of birth */}
              <div>
                <Label>Time of birth</Label>
                <Input
                  type="time"
                  value={formData.timeOfBirth}
                  onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                />
              </div>

              {/* Gender */}
              <div className="col-span-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => handleInputChange('gender', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div className="col-span-2">
                <Label>Weight</Label>
                <Input
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Weight (kg)"
                />
              </div>

              {/* Height */}
              <div className="col-span-2">
                <Label>Height</Label>
                <Input
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Height (cm)"
                />
              </div>

              {/* Head circumference */}
              <div className="col-span-2">
                <Label>Head circumference</Label>
                <Input
                  value={formData.headCircumference}
                  onChange={(e) => handleInputChange('headCircumference', e.target.value)}
                  placeholder="Head circumference (cm)"
                />
              </div>

              {/* Remarks */}
              <div className="col-span-2">
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Additional remarks"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2F80ED] hover:bg-blue-700">
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Birth Certificate PDF Preview Dialog */}
      {selectedCertificate && (
        <Dialog open={showCertificatePDF} onOpenChange={setShowCertificatePDF}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Birth Certificate - {selectedCertificate.certificateNo}</DialogTitle>
              <DialogDescription>Certificate preview and details</DialogDescription>
            </DialogHeader>

            {/* PDF Certificate Design */}
            <div className="bg-white border-4 border-blue-600 rounded-lg p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b-4 border-blue-600 pb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Baby className="w-16 h-16 text-blue-600" />
                </div>
                <h1 className="text-4xl text-blue-900 mb-2">Birth Certificate</h1>
                <p className="text-gray-600">Government Certified Document</p>
                <div className="mt-4 inline-block bg-blue-100 px-6 py-2 rounded-full">
                  <p className="text-sm text-blue-900 font-medium">
                    Certificate No: {selectedCertificate.certificateNo}
                  </p>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="space-y-6">
                <p className="text-center text-lg text-gray-700">
                  This is to certify that
                </p>

                {/* Baby Information */}
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="text-2xl text-center text-blue-900 mb-4">{selectedCertificate.babyName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(selectedCertificate.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time of Birth:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.timeOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.weight}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.height}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Head Circumference:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.headCircumference}</span>
                    </div>
                  </div>
                </div>

                {/* Parents Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Mother's Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium text-gray-900">{selectedCertificate.motherName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">NIC:</span>
                        <p className="font-medium text-gray-900">{selectedCertificate.motherNIC}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">MRN:</span>
                        <p className="font-medium text-gray-900">{selectedCertificate.motherMRN}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Father's Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium text-gray-900">{selectedCertificate.fatherName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">CNIC:</span>
                        <p className="font-medium text-gray-900">{selectedCertificate.fatherCNIC}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Delivery No:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.deliveryNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mode of Delivery:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.modeOfDelivery}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Attending Doctor:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.doctorName}</span>
                    </div>
                    {selectedCertificate.birthmark && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Birthmark/Abnormality:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedCertificate.birthmark}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                  <p className="text-sm text-gray-700">{selectedCertificate.address}</p>
                </div>

                {/* Remarks */}
                {selectedCertificate.remarks && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Remarks</h4>
                    <p className="text-sm text-gray-700">{selectedCertificate.remarks}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-blue-600">
                <div className="flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-48 border-t-2 border-gray-400 pt-2">
                      <p className="text-sm text-gray-600">Authorized Signature</p>
                      <p className="text-xs text-gray-500 mt-1">Hospital Administrator</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date of Issue:</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedCertificate.registrationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>This is a computer-generated certificate and does not require a physical signature.</p>
                  <p className="mt-1">For verification, please contact the hospital administration.</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCertificatePDF(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button className="bg-[#2F80ED] hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BirthCertificates;
