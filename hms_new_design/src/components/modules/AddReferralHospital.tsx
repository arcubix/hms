/**
 * Add Referral Hospital Page
 * 
 * Complete hospital registration form:
 * - Hospital basic information
 * - Contact details
 * - Specialties and services
 * - Agreement details
 * - Document upload
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import {
  ArrowLeft,
  Save,
  Hospital,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  FileText,
  Calendar,
  Check,
  X,
  Plus,
  Upload,
  CheckCircle,
  AlertCircle,
  Globe,
  Clock,
  Shield,
  Stethoscope,
  Briefcase,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AddReferralHospitalProps {
  onBack: () => void;
}

export function AddReferralHospital({ onBack }: AddReferralHospitalProps) {
  // Basic Information
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  
  // Contact Information
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  
  // Contact Person
  const [contactPerson, setContactPerson] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Facilities & Services
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [bedCapacity, setBedCapacity] = useState('');
  const [icuBeds, setIcuBeds] = useState('');
  const [emergencyServices, setEmergencyServices] = useState(true);
  const [ambulanceService, setAmbulanceService] = useState(true);
  
  // Agreement Details
  const [agreementType, setAgreementType] = useState('');
  const [agreementStartDate, setAgreementStartDate] = useState('');
  const [agreementEndDate, setAgreementEndDate] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  
  // Additional Information
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  // Available specialties
  const availableSpecialties = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Oncology', 'Gastroenterology', 'Nephrology', 'Pulmonology',
    'Endocrinology', 'Dermatology', 'ENT', 'Ophthalmology',
    'Psychiatry', 'Urology', 'General Surgery', 'Trauma Care',
    'Emergency Medicine', 'Critical Care', 'Radiology', 'Pathology'
  ];

  const hospitalTypes = [
    { value: 'general', label: 'General Hospital' },
    { value: 'specialty', label: 'Specialty Hospital' },
    { value: 'super-specialty', label: 'Super Specialty Hospital' },
    { value: 'multi-specialty', label: 'Multi Specialty Hospital' },
    { value: 'teaching', label: 'Teaching Hospital' },
    { value: 'trauma', label: 'Trauma Center' },
    { value: 'cancer', label: 'Cancer Center' },
    { value: 'cardiac', label: 'Cardiac Center' }
  ];

  const agreementTypes = [
    { value: 'referral', label: 'Referral Agreement' },
    { value: 'partnership', label: 'Partnership Agreement' },
    { value: 'service', label: 'Service Agreement' },
    { value: 'corporate', label: 'Corporate Tie-up' },
    { value: 'network', label: 'Network Agreement' }
  ];

  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const handleSave = () => {
    if (!hospitalName || !hospitalType || !address || !phone || !email || !contactPerson) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Referral hospital added successfully!');
    onBack();
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newDoc = `Document_${uploadedDocs.length + 1}.pdf`;
    setUploadedDocs([...uploadedDocs, newDoc]);
    toast.success('Document uploaded successfully!');
  };

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
                  <Hospital className="w-6 h-6 text-blue-600" />
                  Add Referral Hospital
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Register a new partner or referral hospital
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Hospital
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT COLUMN - Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Hospital identification and classification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="hospital-name" className="flex items-center gap-2">
                      Hospital Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hospital-name"
                      placeholder="Enter hospital name"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hospital-type" className="flex items-center gap-2">
                      Hospital Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={hospitalType} onValueChange={setHospitalType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="registration-number">
                      Registration Number
                    </Label>
                    <Input
                      id="registration-number"
                      placeholder="e.g., REG/2024/1234"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="established-year">
                      Established Year
                    </Label>
                    <Input
                      id="established-year"
                      type="number"
                      placeholder="e.g., 2010"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Contact Information
                </CardTitle>
                <CardDescription>Address and communication details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="flex items-center gap-2">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="flex items-center gap-2">
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pincode">
                      Pincode
                    </Label>
                    <Input
                      id="pincode"
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+1-555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="alt-phone">
                      Alternate Phone
                    </Label>
                    <Input
                      id="alt-phone"
                      placeholder="+1-555-0124"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hospital@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">
                      Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://hospital.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Person Details
                </CardTitle>
                <CardDescription>Primary point of contact at the hospital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-person" className="flex items-center gap-2">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-person"
                      placeholder="Enter contact person name"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-designation">
                      Designation
                    </Label>
                    <Input
                      id="contact-designation"
                      placeholder="e.g., Hospital Administrator"
                      value={contactDesignation}
                      onChange={(e) => setContactDesignation(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-phone">
                      Phone Number
                    </Label>
                    <Input
                      id="contact-phone"
                      placeholder="+1-555-0125"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-email">
                      Email Address
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="contact@hospital.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities & Specialties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Facilities & Specialties
                </CardTitle>
                <CardDescription>Available services and medical specialties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bed Capacity */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bed-capacity">
                      Total Bed Capacity
                    </Label>
                    <Input
                      id="bed-capacity"
                      type="number"
                      placeholder="e.g., 200"
                      value={bedCapacity}
                      onChange={(e) => setBedCapacity(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="icu-beds">
                      ICU Beds
                    </Label>
                    <Input
                      id="icu-beds"
                      type="number"
                      placeholder="e.g., 20"
                      value={icuBeds}
                      onChange={(e) => setIcuBeds(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <Label htmlFor="emergency-services" className="font-medium">
                        24/7 Emergency Services
                      </Label>
                    </div>
                    <Switch
                      id="emergency-services"
                      checked={emergencyServices}
                      onCheckedChange={setEmergencyServices}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Hospital className="w-4 h-4 text-blue-600" />
                      <Label htmlFor="ambulance-service" className="font-medium">
                        Ambulance Service Available
                      </Label>
                    </div>
                    <Switch
                      id="ambulance-service"
                      checked={ambulanceService}
                      onCheckedChange={setAmbulanceService}
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <Label className="mb-3 block">Available Specialties</Label>
                  <ScrollArea className="h-[200px] border rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {availableSpecialties.map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() => toggleSpecialty(specialty)}
                          className={`p-2 rounded-lg border text-sm text-left transition-all ${
                            selectedSpecialties.includes(specialty)
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{specialty}</span>
                            {selectedSpecialties.includes(specialty) && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedSpecialties.length} specialties selected
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Agreement Details
                </CardTitle>
                <CardDescription>Partnership and financial terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agreement-type">
                      Agreement Type
                    </Label>
                    <Select value={agreementType} onValueChange={setAgreementType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select agreement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {agreementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="commission-rate">
                      Commission Rate (%)
                    </Label>
                    <Input
                      id="commission-rate"
                      type="number"
                      placeholder="e.g., 10"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="start-date">
                      Agreement Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={agreementStartDate}
                      onChange={(e) => setAgreementStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end-date">
                      Agreement End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={agreementEndDate}
                      onChange={(e) => setAgreementEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="payment-terms">
                      Payment Terms
                    </Label>
                    <Textarea
                      id="payment-terms"
                      placeholder="Enter payment terms and conditions"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">
                    Description / Notes
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter any additional information about the hospital"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <Label htmlFor="active-status" className="font-medium">
                        Active Status
                      </Label>
                      <p className="text-xs text-gray-600">
                        Hospital is active and can receive referrals
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="active-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Summary & Documents */}
          <div className="space-y-4">
            {/* Quick Summary */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Form Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hospital Name:</span>
                    <span className="font-medium">
                      {hospitalName || '-'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">
                      {hospitalType || 'Not selected'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Contact Person:</span>
                    <span className="font-medium">
                      {contactPerson || '-'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Specialties:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedSpecialties.length}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Documents
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload agreement and certificates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFileUpload}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>

                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Uploaded Files:</Label>
                    {uploadedDocs.map((doc, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <span>{doc}</span>
                        </div>
                        <button
                          onClick={() => setUploadedDocs(uploadedDocs.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Important Notes</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• All required fields must be filled</li>
                      <li>• Upload valid agreements</li>
                      <li>• Verify contact details</li>
                      <li>• Select relevant specialties</li>
                      <li>• Set proper agreement dates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
