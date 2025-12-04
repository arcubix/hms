/**
 * Death Certificates Management System
 * 
 * Features:
 * - Death certificate registration
 * - Certificate listing with search and filters
 * - PDF certificate generation and preview
 * - Print and download certificates
 * - Patient and cause of death tracking
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
  Heart,
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
  User,
} from 'lucide-react';

// Types
interface DeathCertificate {
  id: string;
  certificateNo: string;
  patientName: string;
  patientNIC: string;
  fatherName: string;
  address: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  guardianName: string;
  guardianNIC: string;
  phoneNumber: string;
  doctorOnDuty: string;
  ageYears: string;
  ageMonths: string;
  ageDays: string;
  dateOfDeath: string;
  gender: 'Male' | 'Female';
  causeOfDeath: string;
  registrationDate: string;
  status: 'Pending' | 'Issued' | 'Verified';
}

const DeathCertificates = () => {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showCertificatePDF, setShowCertificatePDF] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DeathCertificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    patientNIC: '',
    fatherName: '',
    address: '',
    dateOfBirth: '',
    dateOfAdmission: '',
    guardianName: '',
    guardianNIC: '',
    phoneNumber: '',
    doctorOnDuty: '',
    ageYears: '',
    ageMonths: '',
    ageDays: '',
    dateOfDeath: '27-11-2025',
    gender: 'Male',
    causeOfDeath: '',
  });

  // Mock data - Death certificates
  const mockCertificates: DeathCertificate[] = [
    {
      id: 'DC001',
      certificateNo: 'DC-2025-001',
      patientName: 'Abdul Rahman',
      patientNIC: '42101-6543210-1',
      fatherName: 'Muhammad Rahman',
      address: '234 Central Avenue, Karachi',
      dateOfBirth: '1945-05-15',
      dateOfAdmission: '2025-11-20',
      guardianName: 'Ali Rahman',
      guardianNIC: '42101-7654321-2',
      phoneNumber: '+92-300-4567890',
      doctorOnDuty: 'Dr. Rajesh Kumar',
      ageYears: '80',
      ageMonths: '6',
      ageDays: '12',
      dateOfDeath: '2025-11-27',
      gender: 'Male',
      causeOfDeath: 'Cardiac arrest due to myocardial infarction',
      registrationDate: '2025-11-27',
      status: 'Issued',
    },
    {
      id: 'DC002',
      certificateNo: 'DC-2025-002',
      patientName: 'Khadija Bibi',
      patientNIC: '42101-1234567-8',
      fatherName: 'Ahmed Ali',
      address: '567 Garden Street, Lahore',
      dateOfBirth: '1938-03-22',
      dateOfAdmission: '2025-11-15',
      guardianName: 'Hassan Ahmed',
      guardianNIC: '42101-2345678-9',
      phoneNumber: '+92-300-5678901',
      doctorOnDuty: 'Dr. Priya Sharma',
      ageYears: '87',
      ageMonths: '8',
      ageDays: '5',
      dateOfDeath: '2025-11-26',
      gender: 'Female',
      causeOfDeath: 'Respiratory failure due to pneumonia',
      registrationDate: '2025-11-26',
      status: 'Issued',
    },
    {
      id: 'DC003',
      certificateNo: 'DC-2025-003',
      patientName: 'Imran Khan',
      patientNIC: '42101-9876543-0',
      fatherName: 'Nawaz Khan',
      address: '890 Park Road, Islamabad',
      dateOfBirth: '1965-08-10',
      dateOfAdmission: '2025-11-25',
      guardianName: 'Ayesha Khan',
      guardianNIC: '42101-8765432-1',
      phoneNumber: '+92-300-6789012',
      doctorOnDuty: 'Dr. Amit Patel',
      ageYears: '60',
      ageMonths: '3',
      ageDays: '17',
      dateOfDeath: '2025-11-28',
      gender: 'Male',
      causeOfDeath: 'Pending autopsy report',
      registrationDate: '2025-11-28',
      status: 'Pending',
    },
  ];

  // Filter certificates
  const filteredCertificates = mockCertificates.filter(cert => {
    const matchesSearch = 
      cert.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.patientNIC.toLowerCase().includes(searchQuery.toLowerCase());
    
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

  const handleViewCertificate = (certificate: DeathCertificate) => {
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
          <h1 className="text-3xl text-gray-900">Death Certificates</h1>
          <p className="text-gray-600 mt-1">Register and manage death certificates</p>
        </div>
        <Button 
          className="bg-[#EB5757] hover:bg-red-700" 
          onClick={() => setShowRegisterDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Death
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Certificates</p>
                <h3 className="text-2xl">{totalCertificates}</h3>
                <p className="text-xs text-gray-600 mt-1">All Time</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600" />
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
                placeholder="Search by certificate no, patient name, or NIC..."
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
                    Patient Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date of Death
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Cause of Death
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
                        <Heart className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{certificate.certificateNo}</div>
                          <div className="text-xs text-gray-500">NIC: {certificate.patientNIC}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{certificate.patientName}</div>
                        <div className="text-sm text-gray-500">
                          {certificate.gender} • {certificate.fatherName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {certificate.ageYears}Y {certificate.ageMonths}M {certificate.ageDays}D
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(certificate.dateOfDeath).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {certificate.causeOfDeath}
                      </div>
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

      {/* Register Death Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Death Certificate</DialogTitle>
            <DialogDescription>Register a new death certificate with complete details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Patient */}
              <div className="col-span-2">
                <Label>Patient*</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="Search By Name, MR# or Phone"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Patient's NIC# */}
              <div className="col-span-2">
                <Label>Patient's NIC#</Label>
                <Input
                  value={formData.patientNIC}
                  onChange={(e) => handleInputChange('patientNIC', e.target.value)}
                  placeholder="Patient's NIC#"
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

              {/* Address */}
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Address"
                />
              </div>

              {/* Date of birth */}
              <div>
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  placeholder="__/__/__"
                />
              </div>

              {/* Date of admission */}
              <div>
                <Label>Date of admission*</Label>
                <Input
                  type="date"
                  value={formData.dateOfAdmission}
                  onChange={(e) => handleInputChange('dateOfAdmission', e.target.value)}
                  placeholder="__/__/__"
                />
              </div>

              {/* Guardian/Attendant/Spouse */}
              <div className="col-span-2">
                <Label>Guardian/ Attendant/ Spouse</Label>
                <Input
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  placeholder="Guardian/Attendant/Spouse"
                />
              </div>

              {/* NIC of Guardian/Attendant/Spouse */}
              <div className="col-span-2">
                <Label>NIC of Guardian/ Attendant/ Spouse</Label>
                <Input
                  value={formData.guardianNIC}
                  onChange={(e) => handleInputChange('guardianNIC', e.target.value)}
                  placeholder="NIC of Guardian/Attendant/Spouse"
                />
              </div>

              {/* Phone# of spouse/guardian/attendant */}
              <div className="col-span-2">
                <Label>Phone# of spouse/ guardian/ attendant</Label>
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

              {/* Doctor on duty */}
              <div className="col-span-2">
                <Label>Doctor on duty</Label>
                <Input
                  value={formData.doctorOnDuty}
                  onChange={(e) => handleInputChange('doctorOnDuty', e.target.value)}
                  placeholder="Doctor on duty"
                />
              </div>

              {/* Age */}
              <div className="col-span-2">
                <Label>Age</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={formData.ageYears}
                    onChange={(e) => handleInputChange('ageYears', e.target.value)}
                    placeholder="Years"
                  />
                  <Input
                    value={formData.ageMonths}
                    onChange={(e) => handleInputChange('ageMonths', e.target.value)}
                    placeholder="Months"
                  />
                  <Input
                    value={formData.ageDays}
                    onChange={(e) => handleInputChange('ageDays', e.target.value)}
                    placeholder="Days"
                  />
                </div>
              </div>

              {/* Date of death */}
              <div className="col-span-2">
                <Label>Date of death*</Label>
                <Input
                  type="date"
                  value={formData.dateOfDeath}
                  onChange={(e) => handleInputChange('dateOfDeath', e.target.value)}
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

              {/* Cause of death */}
              <div className="col-span-2">
                <Label>Cause of death</Label>
                <Textarea
                  value={formData.causeOfDeath}
                  onChange={(e) => handleInputChange('causeOfDeath', e.target.value)}
                  placeholder="Describe the cause of death"
                  rows={4}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">Death Certificate Form</p>
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

      {/* Death Certificate PDF Preview Dialog */}
      {selectedCertificate && (
        <Dialog open={showCertificatePDF} onOpenChange={setShowCertificatePDF}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Death Certificate - {selectedCertificate.certificateNo}</DialogTitle>
              <DialogDescription>Certificate preview and details</DialogDescription>
            </DialogHeader>

            {/* PDF Certificate Design */}
            <div className="bg-white border-4 border-gray-700 rounded-lg p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b-4 border-gray-700 pb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Heart className="w-16 h-16 text-gray-700" />
                </div>
                <h1 className="text-4xl text-gray-900 mb-2">Death Certificate</h1>
                <p className="text-gray-600">Government Certified Document</p>
                <div className="mt-4 inline-block bg-gray-100 px-6 py-2 rounded-full">
                  <p className="text-sm text-gray-900 font-medium">
                    Certificate No: {selectedCertificate.certificateNo}
                  </p>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="space-y-6">
                <p className="text-center text-lg text-gray-700">
                  This is to certify that the death of
                </p>

                {/* Deceased Information */}
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-300">
                  <h3 className="text-2xl text-center text-gray-900 mb-4">{selectedCertificate.patientName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Father's Name:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.fatherName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">NIC:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.patientNIC}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedCertificate.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedCertificate.ageYears} Years, {selectedCertificate.ageMonths} Months, {selectedCertificate.ageDays} Days
                      </span>
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
                      <span className="text-gray-600">Date of Death:</span>
                      <span className="ml-2 font-medium text-red-700">
                        {new Date(selectedCertificate.dateOfDeath).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Death Information */}
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Cause of Death</h4>
                    <p className="text-sm text-gray-900">{selectedCertificate.causeOfDeath}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Hospital Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Date of Admission:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedCertificate.dateOfAdmission).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Doctor on Duty:</span>
                          <p className="font-medium text-gray-900">{selectedCertificate.doctorOnDuty}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Guardian/Next of Kin</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium text-gray-900">{selectedCertificate.guardianName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">NIC:</span>
                          <p className="font-medium text-gray-900">{selectedCertificate.guardianNIC}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <p className="font-medium text-gray-900">{selectedCertificate.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                  <p className="text-sm text-gray-700">{selectedCertificate.address}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-700">
                <div className="flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-48 border-t-2 border-gray-400 pt-2">
                      <p className="text-sm text-gray-600">Authorized Signature</p>
                      <p className="text-xs text-gray-500 mt-1">Medical Officer</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-48 border-t-2 border-gray-400 pt-2">
                      <p className="text-sm text-gray-600">Hospital Seal</p>
                      <p className="text-xs text-gray-500 mt-1">Official Stamp</p>
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

export default DeathCertificates;
