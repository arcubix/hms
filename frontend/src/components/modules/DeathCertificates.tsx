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
import { api, DeathCertificate as APIDeathCertificate, CreateDeathCertificateData } from '../../services/api';
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
  Loader2,
} from 'lucide-react';

// Helper function to convert API certificate to display format
const mapAPICertificateToDisplay = (cert: APIDeathCertificate) => ({
  id: String(cert.id),
  certificateNo: cert.certificate_no,
  patientName: cert.patient_name,
  patientNIC: cert.patient_nic || '',
  fatherName: cert.father_name || '',
  address: cert.address || '',
  dateOfBirth: cert.date_of_birth,
  dateOfAdmission: cert.date_of_admission || '',
  guardianName: cert.guardian_name || '',
  guardianNIC: cert.guardian_nic || '',
  phoneNumber: cert.phone_number || '',
  doctorOnDuty: cert.doctor_name || '',
  ageYears: String(cert.age_years || ''),
  ageMonths: String(cert.age_months || ''),
  ageDays: String(cert.age_days || ''),
  dateOfDeath: cert.date_of_death,
  gender: cert.patient_gender,
  causeOfDeath: cert.cause_of_death,
  registrationDate: cert.registration_date,
  status: cert.status,
});

const DeathCertificates = () => {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showCertificatePDF, setShowCertificatePDF] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<ReturnType<typeof mapAPICertificateToDisplay> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [certificates, setCertificates] = useState<APIDeathCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<APIDeathCertificate | null>(null);
  const [stats, setStats] = useState({ total: 0, Issued: 0, Pending: 0, Verified: 0 });

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
    dateOfDeath: '',
    gender: 'Male' as 'Male' | 'Female',
    causeOfDeath: '',
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
      
      const response = await api.getDeathCertificates(filters);
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
        cert.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.patientNIC.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  const handleEdit = (certificate: APIDeathCertificate) => {
    setEditingCertificate(certificate);
    setFormData({
      patientName: certificate.patient_name,
      patientNIC: certificate.patient_nic || '',
      fatherName: certificate.father_name || '',
      address: certificate.address || '',
      dateOfBirth: certificate.date_of_birth,
      dateOfAdmission: certificate.date_of_admission || '',
      guardianName: certificate.guardian_name || '',
      guardianNIC: certificate.guardian_nic || '',
      phoneNumber: certificate.phone_number || '',
      doctorOnDuty: certificate.doctor_name || '',
      ageYears: String(certificate.age_years || ''),
      ageMonths: String(certificate.age_months || ''),
      ageDays: String(certificate.age_days || ''),
      dateOfDeath: certificate.date_of_death,
      gender: certificate.patient_gender,
      causeOfDeath: certificate.cause_of_death,
    });
    setShowRegisterDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this death certificate?')) {
      return;
    }

    try {
      await api.deleteDeathCertificate(id);
      toast.success('Death certificate deleted successfully');
      loadCertificates();
    } catch (error: any) {
      toast.error('Failed to delete certificate: ' + (error.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
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
      dateOfDeath: '',
      gender: 'Male',
      causeOfDeath: '',
    });
    setEditingCertificate(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.patientName.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required');
      return;
    }
    if (!formData.dateOfDeath) {
      toast.error('Date of death is required');
      return;
    }
    if (!formData.causeOfDeath.trim()) {
      toast.error('Cause of death is required');
      return;
    }

    // Validate dates
    if (new Date(formData.dateOfBirth) >= new Date(formData.dateOfDeath)) {
      toast.error('Date of death must be after date of birth');
      return;
    }

    try {
      setSubmitting(true);

      const certificateData: CreateDeathCertificateData = {
        patient_name: formData.patientName.trim(),
        patient_nic: formData.patientNIC || undefined,
        patient_gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        date_of_death: formData.dateOfDeath,
        cause_of_death: formData.causeOfDeath.trim(),
        father_name: formData.fatherName || undefined,
        address: formData.address || undefined,
        date_of_admission: formData.dateOfAdmission || undefined,
        guardian_name: formData.guardianName || undefined,
        guardian_nic: formData.guardianNIC || undefined,
        phone_number: formData.phoneNumber || undefined,
        doctor_name: formData.doctorOnDuty || undefined,
        age_years: formData.ageYears ? parseInt(formData.ageYears) : undefined,
        age_months: formData.ageMonths ? parseInt(formData.ageMonths) : undefined,
        age_days: formData.ageDays ? parseInt(formData.ageDays) : undefined,
        registration_date: new Date().toISOString().split('T')[0],
      };

      if (editingCertificate) {
        await api.updateDeathCertificate(editingCertificate.id, certificateData);
        toast.success('Death certificate updated successfully');
      } else {
        await api.createDeathCertificate(certificateData);
        toast.success('Death certificate created successfully');
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading certificates...</p>
                    </td>
                  </tr>
                ) : filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
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
                            <Heart className="w-5 h-5 text-red-600 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">{certificate.certificateNo}</div>
                              <div className="text-xs text-gray-500">NIC: {certificate.patientNIC || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{certificate.patientName}</div>
                            <div className="text-sm text-gray-500">
                              {certificate.gender} {certificate.fatherName ? `• ${certificate.fatherName}` : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {certificate.ageYears || certificate.ageMonths || certificate.ageDays
                              ? `${certificate.ageYears || 0}Y ${certificate.ageMonths || 0}M ${certificate.ageDays || 0}D`
                              : 'N/A'}
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

      {/* Register Death Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCertificate ? 'Edit Death Certificate' : 'Add New Death Certificate'}</DialogTitle>
            <DialogDescription>
              {editingCertificate ? 'Update death certificate details' : 'Register a new death certificate with complete details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Patient */}
              <div>
                <Label>Patient <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="Search By Name, MR# or Phone"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Patient's NIC# */}
              <div>
                <Label>Patient's NIC#</Label>
                <Input
                  value={formData.patientNIC}
                  onChange={(e) => handleInputChange('patientNIC', e.target.value)}
                  placeholder="Patient's NIC#"
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

              {/* Date of death */}
              <div>
                <Label>Date of death <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.dateOfDeath}
                  onChange={(e) => handleInputChange('dateOfDeath', e.target.value)}
                  required
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

              {/* Date of admission */}
              <div>
                <Label>Date of admission</Label>
                <Input
                  type="date"
                  value={formData.dateOfAdmission}
                  onChange={(e) => handleInputChange('dateOfAdmission', e.target.value)}
                />
              </div>

              {/* Name of father */}
              <div>
                <Label>Name of father</Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Name of father"
                />
              </div>

              {/* Doctor on duty */}
              <div>
                <Label>Doctor on duty</Label>
                <Input
                  value={formData.doctorOnDuty}
                  onChange={(e) => handleInputChange('doctorOnDuty', e.target.value)}
                  placeholder="Doctor on duty"
                />
              </div>

              {/* Age */}
              <div>
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

              {/* Guardian/Attendant/Spouse */}
              <div>
                <Label>Guardian/ Attendant/ Spouse</Label>
                <Input
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  placeholder="Guardian/Attendant/Spouse"
                />
              </div>

              {/* NIC of Guardian/Attendant/Spouse */}
              <div>
                <Label>NIC of Guardian/ Attendant/ Spouse</Label>
                <Input
                  value={formData.guardianNIC}
                  onChange={(e) => handleInputChange('guardianNIC', e.target.value)}
                  placeholder="NIC of Guardian/Attendant/Spouse"
                />
              </div>

              {/* Phone# of spouse/guardian/attendant */}
              <div>
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

              {/* Address */}
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Address"
                  rows={3}
                />
              </div>

              {/* Cause of death */}
              <div className="col-span-2">
                <Label>Cause of death <span className="text-red-500">*</span></Label>
                <Textarea
                  value={formData.causeOfDeath}
                  onChange={(e) => handleInputChange('causeOfDeath', e.target.value)}
                  placeholder="Describe the cause of death"
                  rows={4}
                  required
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
