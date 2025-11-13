/**
 * Add Doctor - Comprehensive Form
 * 
 * Features:
 * - 6-Tab comprehensive form
 * - Personal Information
 * - Professional Details
 * - Qualifications & Certifications
 * - Employment & Schedule
 * - Financial Details
 * - Documents Upload
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  Upload,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Save,
  ArrowRight,
  ArrowLeft,
  Users,
  Stethoscope,
  Building2,
  CreditCard,
  Shield,
  Languages,
  Globe,
  Camera,
  FileCheck,
  BookOpen,
  Target,
  Activity,
  Heart,
  Brain,
  Bone,
  Baby
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AddDoctorProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddDoctor({ onBack, onSuccess }: AddDoctorProps) {
  const [currentTab, setCurrentTab] = useState('personal');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    nationality: '',
    
    // Contact Information
    email: '',
    phone: '',
    alternatePhone: '',
    emergencyContact: '',
    emergencyContactName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    
    // Professional Information
    employeeId: '',
    designation: '',
    department: '',
    specialization: [] as string[],
    subSpecialization: [] as string[],
    experience: '',
    
    // Qualifications
    degrees: [] as string[],
    medicalLicenseNumber: '',
    licenseIssuingAuthority: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    registrationNumber: '',
    registrationCouncil: '',
    registrationYear: '',
    
    // Additional Certifications
    certifications: [] as { name: string; authority: string; year: string }[],
    
    // Employment Details
    joiningDate: '',
    employmentType: '',
    contractDuration: '',
    shift: '',
    reportingManager: '',
    
    // Schedule
    opdDays: [] as string[],
    opdStartTime: '',
    opdEndTime: '',
    maxPatientsPerDay: '',
    consultationDuration: '15',
    
    // Financial
    consultationFee: '',
    followUpFee: '',
    emergencyFee: '',
    procedureFees: [] as { procedure: string; fee: string }[],
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    
    // Additional Info
    languages: [] as string[],
    expertise: [] as string[],
    interests: '',
    bio: '',
    
    // Documents
    documents: {
      resume: null as File | null,
      medicalLicense: null as File | null,
      degreeCertificates: [] as File[],
      experienceCertificates: [] as File[],
      idProof: null as File | null,
      addressProof: null as File | null
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpecialization = (spec: string) => {
    if (spec && !formData.specialization.includes(spec)) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, spec]
      });
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter(s => s !== spec)
    });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: '', authority: '', year: '' }]
    });
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    });
  };

  const addProcedureFee = () => {
    setFormData({
      ...formData,
      procedureFees: [...formData.procedureFees, { procedure: '', fee: '' }]
    });
  };

  const removeProcedureFee = (index: number) => {
    setFormData({
      ...formData,
      procedureFees: formData.procedureFees.filter((_, i) => i !== index)
    });
  };

  const toggleOpdDay = (day: string) => {
    if (formData.opdDays.includes(day)) {
      setFormData({
        ...formData,
        opdDays: formData.opdDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        opdDays: [...formData.opdDays, day]
      });
    }
  };

  const handleSubmit = () => {
    // Validation would go here
    toast.success('Doctor profile created successfully!', {
      description: 'Employee ID: EMP-2024-' + Math.floor(Math.random() * 10000)
    });
    onSuccess?.();
  };

  const tabsList = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Stethoscope },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Add New Doctor</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete all required information to create a new doctor profile
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back to Doctors
        </Button>
      </div>

      {/* Progress Indicator */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {tabsList.map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm hidden md:inline">{tab.label}</span>
                </div>
                {index < tabsList.length - 1 && (
                  <div className="w-8 md:w-16 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="hidden">
          {tabsList.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* Tab 1: Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic personal details of the doctor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-gray-200">
                    {uploadedPhoto ? (
                      <img src={uploadedPhoto} alt="Doctor" className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                <div>
                  <h3>Profile Photo</h3>
                  <p className="text-sm text-gray-600">
                    Upload a professional photo (JPG, PNG)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum size: 2MB • Recommended: 500x500px
                  </p>
                </div>
              </div>

              <Separator />

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input
                    placeholder="Enter middle name"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nationality *</Label>
                  <Input
                    placeholder="Enter nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <h3 className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="+1-555-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alternate Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1-555-0000"
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input
                    placeholder="Contact person name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Number</Label>
                  <Input
                    type="tel"
                    placeholder="+1-555-0000"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Address */}
              <h3 className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Address Information
              </h3>

              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Textarea
                  placeholder="Enter complete address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code *</Label>
                  <Input
                    placeholder="ZIP"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Professional Information */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Professional Information
              </CardTitle>
              <CardDescription>Medical specialization and expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Employee ID *</Label>
                  <Input
                    placeholder="EMP-YYYY-XXXX"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Auto-generated if left blank</p>
                </div>
                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(value) => setFormData({ ...formData, designation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior-resident">Junior Resident</SelectItem>
                      <SelectItem value="senior-resident">Senior Resident</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="senior-consultant">Senior Consultant</SelectItem>
                      <SelectItem value="head-of-department">Head of Department</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="gynecology">Gynecology</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="anesthesiology">Anesthesiology</SelectItem>
                      <SelectItem value="general-medicine">General Medicine</SelectItem>
                      <SelectItem value="general-surgery">General Surgery</SelectItem>
                      <SelectItem value="emergency">Emergency Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">Specialization * (Select multiple)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  {[
                    'Interventional Cardiology',
                    'Preventive Cardiology',
                    'Pediatric Cardiology',
                    'Neurosurgery',
                    'Stroke Medicine',
                    'Joint Replacement',
                    'Sports Medicine',
                    'Neonatology',
                    'Pediatric Surgery',
                    'High-Risk Pregnancy',
                    'Laparoscopic Surgery',
                    'Medical Oncology',
                    'Surgical Oncology',
                    'Critical Care',
                    'Pain Management'
                  ].map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={spec}
                        checked={formData.specialization.includes(spec)}
                        onCheckedChange={() => {
                          if (formData.specialization.includes(spec)) {
                            removeSpecialization(spec);
                          } else {
                            addSpecialization(spec);
                          }
                        }}
                      />
                      <label htmlFor={spec} className="text-sm cursor-pointer">
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
                
                {formData.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                    {formData.specialization.map((spec) => (
                      <Badge key={spec} className="bg-blue-600 text-white">
                        {spec}
                        <button
                          onClick={() => removeSpecialization(spec)}
                          className="ml-2 hover:bg-blue-700 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Years of Experience *</Label>
                <Input
                  type="number"
                  placeholder="Enter years of experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">Languages Spoken</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['English', 'Spanish', 'French', 'German', 'Hindi', 'Mandarin', 'Arabic', 'Portuguese'].map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang}
                        checked={formData.languages.includes(lang)}
                        onCheckedChange={() => {
                          if (formData.languages.includes(lang)) {
                            setFormData({
                              ...formData,
                              languages: formData.languages.filter(l => l !== lang)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              languages: [...formData.languages, lang]
                            });
                          }
                        }}
                      />
                      <label htmlFor={lang} className="text-sm cursor-pointer">
                        {lang}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Professional Bio</Label>
                <Textarea
                  placeholder="Brief professional summary and expertise..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
                <p className="text-xs text-gray-500">This will be displayed on the doctor's profile</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Qualifications */}
        <TabsContent value="qualifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Educational Qualifications & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Medical Degrees *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['MBBS', 'MD', 'MS', 'DM', 'MCh', 'DNB', 'FRCS', 'MRCP', 'FACC', 'FACS'].map((degree) => (
                    <div key={degree} className="flex items-center space-x-2">
                      <Checkbox
                        id={degree}
                        checked={formData.degrees.includes(degree)}
                        onCheckedChange={() => {
                          if (formData.degrees.includes(degree)) {
                            setFormData({
                              ...formData,
                              degrees: formData.degrees.filter(d => d !== degree)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              degrees: [...formData.degrees, degree]
                            });
                          }
                        }}
                      />
                      <label htmlFor={degree} className="text-sm cursor-pointer">
                        {degree}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <h3 className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Medical License Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medical License Number *</Label>
                  <Input
                    placeholder="MLC-XX-XXXXX"
                    value={formData.medicalLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, medicalLicenseNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Authority *</Label>
                  <Input
                    placeholder="State Medical Board"
                    value={formData.licenseIssuingAuthority}
                    onChange={(e) => setFormData({ ...formData, licenseIssuingAuthority: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date *</Label>
                  <Input
                    type="date"
                    value={formData.licenseIssueDate}
                    onChange={(e) => setFormData({ ...formData, licenseIssueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date *</Label>
                  <Input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <h3 className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                Registration Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Registration Number *</Label>
                  <Input
                    placeholder="REG-YYYY-XXXXX"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Council *</Label>
                  <Input
                    placeholder="Medical Council Name"
                    value={formData.registrationCouncil}
                    onChange={(e) => setFormData({ ...formData, registrationCouncil: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Year *</Label>
                  <Input
                    type="number"
                    placeholder="YYYY"
                    value={formData.registrationYear}
                    onChange={(e) => setFormData({ ...formData, registrationYear: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Additional Certifications
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <Card key={index} className="border-2 border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              placeholder="Certification Name"
                              value={cert.name}
                              onChange={(e) => {
                                const newCerts = [...formData.certifications];
                                newCerts[index].name = e.target.value;
                                setFormData({ ...formData, certifications: newCerts });
                              }}
                            />
                            <Input
                              placeholder="Issuing Authority"
                              value={cert.authority}
                              onChange={(e) => {
                                const newCerts = [...formData.certifications];
                                newCerts[index].authority = e.target.value;
                                setFormData({ ...formData, certifications: newCerts });
                              }}
                            />
                            <Input
                              placeholder="Year"
                              value={cert.year}
                              onChange={(e) => {
                                const newCerts = [...formData.certifications];
                                newCerts[index].year = e.target.value;
                                setFormData({ ...formData, certifications: newCerts });
                              }}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {formData.certifications.length === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Click "Add Certification" to include additional professional certifications
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Employment & Schedule */}
        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Joining Date *</Label>
                  <Input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employment Type *</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="visiting">Visiting Consultant</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contract Duration (if applicable)</Label>
                  <Input
                    placeholder="e.g., 2 years"
                    value={formData.contractDuration}
                    onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Shift</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value) => setFormData({ ...formData, shift: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8 AM - 2 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (2 PM - 8 PM)</SelectItem>
                      <SelectItem value="night">Night (8 PM - 8 AM)</SelectItem>
                      <SelectItem value="rotating">Rotating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Manager</Label>
                  <Select
                    value={formData.reportingManager}
                    onValueChange={(value) => setFormData({ ...formData, reportingManager: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hod-cardiology">Dr. John Smith (HOD, Cardiology)</SelectItem>
                      <SelectItem value="hod-neurology">Dr. Emily Chen (HOD, Neurology)</SelectItem>
                      <SelectItem value="director">Dr. Michael Brown (Director)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <h3 className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                OPD Schedule
              </h3>

              <div>
                <Label className="mb-3 block">OPD Days *</Label>
                <div className="flex flex-wrap gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div
                      key={day}
                      onClick={() => toggleOpdDay(day)}
                      className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.opdDays.includes(day)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>OPD Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.opdStartTime}
                    onChange={(e) => setFormData({ ...formData, opdStartTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>OPD End Time *</Label>
                  <Input
                    type="time"
                    value={formData.opdEndTime}
                    onChange={(e) => setFormData({ ...formData, opdEndTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consultation Duration (minutes)</Label>
                  <Select
                    value={formData.consultationDuration}
                    onValueChange={(value) => setFormData({ ...formData, consultationDuration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Patients Per Day</Label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.maxPatientsPerDay}
                  onChange={(e) => setFormData({ ...formData, maxPatientsPerDay: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Calculated based on OPD hours and consultation duration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Financial Details */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Financial Information
              </CardTitle>
              <CardDescription>Consultation fees and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Consultation Fees
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Standard Consultation Fee *</Label>
                  <Input
                    type="number"
                    placeholder="$150"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Consultation Fee</Label>
                  <Input
                    type="number"
                    placeholder="$100"
                    value={formData.followUpFee}
                    onChange={(e) => setFormData({ ...formData, followUpFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Consultation Fee</Label>
                  <Input
                    type="number"
                    placeholder="$250"
                    value={formData.emergencyFee}
                    onChange={(e) => setFormData({ ...formData, emergencyFee: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Procedure Fees
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addProcedureFee}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Procedure
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.procedureFees.map((proc, index) => (
                    <Card key={index} className="border-2 border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              placeholder="Procedure Name"
                              value={proc.procedure}
                              onChange={(e) => {
                                const newProcs = [...formData.procedureFees];
                                newProcs[index].procedure = e.target.value;
                                setFormData({ ...formData, procedureFees: newProcs });
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Fee Amount"
                              value={proc.fee}
                              onChange={(e) => {
                                const newProcs = [...formData.procedureFees];
                                newProcs[index].fee = e.target.value;
                                setFormData({ ...formData, procedureFees: newProcs });
                              }}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProcedureFee(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {formData.procedureFees.length === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Click "Add Procedure" to include specific procedure fees
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />

              <h3 className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Bank Account Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name *</Label>
                  <Input
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number *</Label>
                  <Input
                    type="number"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code *</Label>
                  <Input
                    placeholder="Enter IFSC code"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number *</Label>
                  <Input
                    placeholder="Enter PAN number"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  />
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  All financial information is encrypted and securely stored. This information will be used for salary disbursement and revenue sharing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Document Upload
              </CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please upload clear scanned copies or photos of all required documents. Supported formats: PDF, JPG, PNG (Max size: 5MB per file)
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resume/CV */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="mb-2">Resume / CV *</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload your latest resume
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical License */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <h4 className="mb-2">Medical License *</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Valid medical license certificate
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Degree Certificates */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <GraduationCap className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <h4 className="mb-2">Degree Certificates *</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        All medical degree certificates
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Experience Certificates */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Award className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <h4 className="mb-2">Experience Certificates</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Previous employment certificates
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* ID Proof */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <User className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                      <h4 className="mb-2">ID Proof *</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Government issued ID (Passport/License)
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Proof */}
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <h4 className="mb-2">Address Proof *</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Utility bill or bank statement
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All documents will be verified by the HR department within 2-3 business days.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = tabsList.findIndex(t => t.id === currentTab);
                if (currentIndex > 0) {
                  setCurrentTab(tabsList[currentIndex - 1].id);
                }
              }}
              disabled={currentTab === 'personal'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              {currentTab === 'documents' ? (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit & Create Profile
                </Button>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    const currentIndex = tabsList.findIndex(t => t.id === currentTab);
                    if (currentIndex < tabsList.length - 1) {
                      setCurrentTab(tabsList[currentIndex + 1].id);
                    }
                  }}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
