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

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { api, BirthCertificate as APIBirthCertificate, CreateBirthCertificateData } from '../../services/api';
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
  Loader2,
} from 'lucide-react';

// Helper function to convert API certificate to display format
const mapAPICertificateToDisplay = (cert: APIBirthCertificate) => ({
  id: String(cert.id),
  certificateNo: cert.certificate_no,
  babyName: cert.baby_name,
  motherName: cert.mother_name,
  motherMRN: cert.mother_mrn || '',
  motherNIC: cert.mother_nic || '',
  fatherName: cert.father_name,
  fatherCNIC: cert.father_cnic || '',
  deliveryNo: cert.delivery_no || '',
  modeOfDelivery: cert.mode_of_delivery || '',
  birthmark: cert.birthmark || '',
  doctorName: cert.doctor_name || '',
  phoneNumber: cert.phone_number || '',
  address: cert.address || '',
  dateOfBirth: cert.date_of_birth,
  timeOfBirth: cert.time_of_birth || '',
  gender: cert.baby_gender,
  weight: cert.weight || '',
  height: cert.height || '',
  headCircumference: cert.head_circumference || '',
  remarks: cert.remarks || '',
  registrationDate: cert.registration_date,
  status: cert.status,
});

const BirthCertificates = () => {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showCertificatePDF, setShowCertificatePDF] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<ReturnType<typeof mapAPICertificateToDisplay> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [certificates, setCertificates] = useState<APIBirthCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<APIBirthCertificate | null>(null);
  const [stats, setStats] = useState({ total: 0, Issued: 0, Pending: 0, Verified: 0 });

  // Form state
  const [formData, setFormData] = useState({
    babyName: '',
    motherName: '',
    motherMRN: '',
    motherNIC: '',
    fatherName: '',
    fatherCNIC: '',
    deliveryNo: '',
    modeOfDelivery: '',
    birthmark: '',
    doctorName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    timeOfBirth: '',
    gender: 'Male' as 'Male' | 'Female',
    weight: '',
    height: '',
    headCircumference: '',
    remarks: '',
  });

  // Load certificates
  useEffect(() => {
    loadCertificates();
  }, [searchQuery, filterStatus]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterStatus !== 'all') filters.status = filterStatus;
      
      const response = await api.getBirthCertificates(filters);
      setCertificates(response.certificates || []);
      setStats(response.stats || { total: 0, Issued: 0, Pending: 0, Verified: 0 });
    } catch (error: any) {
      toast.error('Failed to load certificates: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Filter certificates (client-side filtering for better UX)
  const filteredCertificates = certificates
    .map(mapAPICertificateToDisplay)
    .filter(cert => {
      const matchesSearch = 
        cert.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.babyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.motherMRN.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

  // Statistics
  const totalCertificates = stats.total || 0;
  const issuedCertificates = stats.Issued || 0;
  const pendingCertificates = stats.Pending || 0;

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

  const handleViewCertificate = (certificate: ReturnType<typeof mapAPICertificateToDisplay>) => {
    setSelectedCertificate(certificate);
    setShowCertificatePDF(true);
  };

  const handleEdit = (certificate: APIBirthCertificate) => {
    setEditingCertificate(certificate);
    setFormData({
      babyName: certificate.baby_name,
      motherName: certificate.mother_name,
      motherMRN: certificate.mother_mrn || '',
      motherNIC: certificate.mother_nic || '',
      fatherName: certificate.father_name,
      fatherCNIC: certificate.father_cnic || '',
      deliveryNo: certificate.delivery_no || '',
      modeOfDelivery: certificate.mode_of_delivery || '',
      birthmark: certificate.birthmark || '',
      doctorName: certificate.doctor_name || '',
      phoneNumber: certificate.phone_number || '',
      address: certificate.address || '',
      dateOfBirth: certificate.date_of_birth,
      timeOfBirth: certificate.time_of_birth || '',
      gender: certificate.baby_gender,
      weight: certificate.weight || '',
      height: certificate.height || '',
      headCircumference: certificate.head_circumference || '',
      remarks: certificate.remarks || '',
    });
    setShowRegisterDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this birth certificate?')) {
      return;
    }

    try {
      await api.deleteBirthCertificate(id);
      toast.success('Birth certificate deleted successfully');
      loadCertificates();
    } catch (error: any) {
      toast.error('Failed to delete certificate: ' + (error.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      babyName: '',
      motherName: '',
      motherMRN: '',
      motherNIC: '',
      fatherName: '',
      fatherCNIC: '',
      deliveryNo: '',
      modeOfDelivery: '',
      birthmark: '',
      doctorName: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      timeOfBirth: '',
      gender: 'Male',
      weight: '',
      height: '',
      headCircumference: '',
      remarks: '',
    });
    setEditingCertificate(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.babyName.trim()) {
      toast.error('Baby name is required');
      return;
    }
    if (!formData.motherName.trim()) {
      toast.error('Mother name is required');
      return;
    }
    if (!formData.fatherName.trim()) {
      toast.error('Father name is required');
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required');
      return;
    }

    try {
      setSubmitting(true);
      
      // Format date from YYYY-MM-DD to YYYY-MM-DD (already correct format)
      // Format time from HH:MM to HH:MM:SS or keep as is
      let timeOfBirth = formData.timeOfBirth;
      if (timeOfBirth && !timeOfBirth.includes(':')) {
        // If it's in 12-hour format, convert it
        // For now, assume it's already in correct format or handle conversion
      }

      const certificateData: CreateBirthCertificateData = {
        baby_name: formData.babyName.trim(),
        baby_gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        time_of_birth: timeOfBirth || undefined,
        weight: formData.weight || undefined,
        height: formData.height || undefined,
        head_circumference: formData.headCircumference || undefined,
        mother_name: formData.motherName.trim(),
        mother_mrn: formData.motherMRN || undefined,
        mother_nic: formData.motherNIC || undefined,
        father_name: formData.fatherName.trim(),
        father_cnic: formData.fatherCNIC || undefined,
        delivery_no: formData.deliveryNo || undefined,
        mode_of_delivery: formData.modeOfDelivery || undefined,
        birthmark: formData.birthmark || undefined,
        doctor_name: formData.doctorName || undefined,
        phone_number: formData.phoneNumber || undefined,
        address: formData.address || undefined,
        remarks: formData.remarks || undefined,
        registration_date: new Date().toISOString().split('T')[0],
      };

      if (editingCertificate) {
        await api.updateBirthCertificate(editingCertificate.id, certificateData);
        toast.success('Birth certificate updated successfully');
      } else {
        await api.createBirthCertificate(certificateData);
        toast.success('Birth certificate created successfully');
      }

      setShowRegisterDialog(false);
      resetForm();
      loadCertificates();
    } catch (error: any) {
      toast.error('Failed to save certificate: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!showRegisterDialog) {
      resetForm();
    }
  }, [showRegisterDialog]);

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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading certificates...</p>
                    </td>
                  </tr>
                ) : filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">No certificates found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((certificate) => {
                    const apiCert = certificates.find(c => String(c.id) === certificate.id);
                    return (
                      <tr key={certificate.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Baby className="w-5 h-5 text-blue-600 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">{certificate.certificateNo}</div>
                              <div className="text-xs text-gray-500">Delivery: {certificate.deliveryNo || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{certificate.babyName}</div>
                            <div className="text-sm text-gray-500">
                              {certificate.gender} {certificate.weight ? `• ${certificate.weight}` : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{certificate.motherName}</div>
                            <div className="text-xs text-gray-500">MRN: {certificate.motherMRN || 'N/A'}</div>
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
                          <div className="text-xs text-gray-500">{certificate.timeOfBirth || 'N/A'}</div>
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
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {apiCert && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(apiCert)}
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(apiCert.id)}
                                  title="Delete"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm" title="Download PDF">
                              <Download className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Print">
                              <Printer className="w-4 h-4 text-gray-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Register Birth Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCertificate ? 'Edit Birth Certificate' : 'Add New Birth Certificate'}</DialogTitle>
            <DialogDescription>
              {editingCertificate ? 'Update birth certificate details' : 'Register a new birth certificate with complete details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Baby name */}
              <div className="col-span-2">
                <Label>Baby name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.babyName}
                  onChange={(e) => handleInputChange('babyName', e.target.value)}
                  placeholder="Enter baby name"
                  required
                />
              </div>

              {/* Mother name */}
              <div>
                <Label>Mother name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    placeholder="Search By Name, MR# or Phone"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Mother MR# */}
              <div>
                <Label>Mother MR#</Label>
                <Input
                  value={formData.motherMRN}
                  onChange={(e) => handleInputChange('motherMRN', e.target.value)}
                  placeholder="Mother MR#"
                />
              </div>

              {/* Mother's NIC# */}
              <div>
                <Label>Mother's NIC#</Label>
                <Input
                  value={formData.motherNIC}
                  onChange={(e) => handleInputChange('motherNIC', e.target.value)}
                  placeholder="Mother's NIC#"
                />
              </div>

              {/* Name of father */}
              <div>
                <Label>Name of father <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Name of father"
                  required
                />
              </div>

              {/* Father CNIC */}
              <div>
                <Label>Father CNIC</Label>
                <Input
                  value={formData.fatherCNIC}
                  onChange={(e) => handleInputChange('fatherCNIC', e.target.value)}
                  placeholder="Father CNIC#"
                />
              </div>

              {/* Date of birth */}
              <div>
                <Label>Date of birth <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
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
              <div>
                <Label>Gender <span className="text-red-500">*</span></Label>
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

              {/* Delivery no */}
              <div>
                <Label>Delivery no</Label>
                <Input
                  value={formData.deliveryNo}
                  onChange={(e) => handleInputChange('deliveryNo', e.target.value)}
                  placeholder="Delivery number"
                />
              </div>

              {/* Mode of delivery */}
              <div>
                <Label>Mode of delivery</Label>
                <Input
                  value={formData.modeOfDelivery}
                  onChange={(e) => handleInputChange('modeOfDelivery', e.target.value)}
                  placeholder="Mode of delivery"
                />
              </div>

              {/* Doctor */}
              <div>
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

              {/* Weight */}
              <div>
                <Label>Weight</Label>
                <Input
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Weight (kg)"
                />
              </div>

              {/* Height */}
              <div>
                <Label>Height</Label>
                <Input
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Height (cm)"
                />
              </div>

              {/* Head circumference */}
              <div>
                <Label>Head circumference</Label>
                <Input
                  value={formData.headCircumference}
                  onChange={(e) => handleInputChange('headCircumference', e.target.value)}
                  placeholder="Head circumference (cm)"
                />
              </div>

              {/* Phone# of spouse/guardian/attendant */}
              <div>
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

              {/* Birthmark/congenital abnormality */}
              <div className="col-span-2">
                <Label>Birthmark/congenital abnormality</Label>
                <Input
                  value={formData.birthmark}
                  onChange={(e) => handleInputChange('birthmark', e.target.value)}
                  placeholder="Birthmark/congenital abnormality"
                />
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
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRegisterDialog(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#2F80ED] hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingCertificate ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                editingCertificate ? 'Update' : 'Add'
              )}
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
