/**
 * Admit Emergency Patient Component
 * 
 * Features:
 * - Search existing patients
 * - Add new patient
 * - Assign bed/room
 * - Set urgency level
 * - Assign emergency consultant
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  Search,
  Plus,
  User,
  Save,
  X,
  UserPlus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AdmitEmergencyPatientProps {
  onClose: () => void;
  onAdmit: () => void;
}

export function AdmitEmergencyPatient({ onClose, onAdmit }: AdmitEmergencyPatientProps) {
  // Patient Search & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);

  // Admission Type
  const [admissionType, setAdmissionType] = useState<'admit' | 'doa'>('admit');

  // Bed Assignment
  const [wardType, setWardType] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');

  // Staff Assignment
  const [emergencyConsultant, setEmergencyConsultant] = useState('');
  const [nurseAssigned, setNurseAssigned] = useState('');

  // New Patient Form (for Add Patient Dialog)
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    bloodGroup: ''
  });

  // State for dynamic data
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [wards, setWards] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Load wards and staff on component mount
  useEffect(() => {
    loadWards();
    loadDoctors();
    loadNurses();
  }, []);

  // Load available beds when ward is selected
  useEffect(() => {
    if (wardType) {
      loadAvailableBeds(wardType);
    } else {
      setAvailableBeds([]);
      setBedNumber('');
    }
  }, [wardType]);

  // Search patients with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPatients();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadWards = async () => {
    try {
      const data = await api.getEmergencyWards({ status: 'Active' });
      setWards(data);
    } catch (error: any) {
      toast.error('Failed to load wards: ' + (error.message || 'Unknown error'));
    }
  };

  const loadAvailableBeds = async (wardId: string) => {
    try {
      const data = await api.getAvailableWardBeds(parseInt(wardId));
      setAvailableBeds(data || []);
    } catch (error: any) {
      toast.error('Failed to load beds: ' + (error.message || 'Unknown error'));
      setAvailableBeds([]);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (error: any) {
      toast.error('Failed to load doctors: ' + (error.message || 'Unknown error'));
    }
  };

  const loadNurses = async () => {
    try {
      // Get users with nurse role
      const data = await api.getUsers({ role: 'nurse', status: 'active' });
      setNurses(data || []);
    } catch (error: any) {
      console.warn('Could not load nurses:', error);
      setNurses([]);
    }
  };

  const searchPatients = async () => {
    try {
      setSearching(true);
      const data = await api.getPatients({ search: searchQuery });
      setSearchResults(data || []);
    } catch (error: any) {
      toast.error('Failed to search patients: ' + (error.message || 'Unknown error'));
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchQuery(patient.name);
  };

  const handleAddNewPatient = async () => {
    // Validate new patient form
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.age || !newPatient.gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Create new patient via API
      const patientData = {
        name: `${newPatient.firstName} ${newPatient.lastName}`,
        age: parseInt(newPatient.age),
        gender: newPatient.gender as 'Male' | 'Female' | 'Other',
        phone: newPatient.phone,
        email: newPatient.email || undefined,
        address: newPatient.address || undefined,
        blood_group: newPatient.bloodGroup || undefined
      };

      const createdPatient = await api.createPatient(patientData);
      
      const patient = {
        id: createdPatient.id?.toString() || '',
        patient_id: createdPatient.patient_id || createdPatient.uhid || '',
        name: createdPatient.name || `${newPatient.firstName} ${newPatient.lastName}`,
        age: createdPatient.age || parseInt(newPatient.age),
        gender: createdPatient.gender || newPatient.gender,
        phone: createdPatient.phone || newPatient.phone
      };

      setSelectedPatient(patient);
      setSearchQuery(patient.name);
      setShowAddPatientDialog(false);
      toast.success('New patient added successfully!');

      // Reset form
      setNewPatient({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: '',
        emergencyContactPhone: '',
        bloodGroup: ''
      });
    } catch (error: any) {
      toast.error('Failed to create patient: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    // Validation
    if (!selectedPatient) {
      toast.error('Please select or add a patient');
      return;
    }

    if (!chiefComplaint) {
      toast.error('Please enter chief complaint');
      return;
    }

    if (!urgencyLevel) {
      toast.error('Please select urgency level');
      return;
    }

    if (!emergencyConsultant) {
      toast.error('Please assign an emergency consultant');
      return;
    }

    try {
      setLoading(true);

      // Map urgency level to triage level (ESI 1-5)
      const triageMap: { [key: string]: number } = {
        'emergency': 1,
        'urgent': 2,
        'semi-urgent': 3,
        'non-urgent': 4
      };
      const triageLevel = triageMap[urgencyLevel] || 3;

      // Create emergency visit
      const visitData = {
        patient_id: parseInt(selectedPatient.id),
        triage_level: triageLevel as 1 | 2 | 3 | 4 | 5,
        chief_complaint: chiefComplaint,
        assigned_doctor_id: parseInt(emergencyConsultant),
        assigned_nurse_id: (nurseAssigned && nurseAssigned !== '0') ? parseInt(nurseAssigned) : undefined,
        arrival_mode: 'walk-in' as const,
        current_status: 'registered' as const
      };

      const visit = await api.createEmergencyVisit(visitData);

      // If ward and bed are selected, assign them
      if (wardType && bedNumber) {
        await api.updateWardAssignment(visit.id, parseInt(wardType), parseInt(bedNumber));
      }

      toast.success(`Patient ${admissionType === 'admit' ? 'admitted' : 'registered as DOA'} successfully!`);
      onAdmit();
    } catch (error: any) {
      toast.error('Failed to admit patient: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">Assign Bed/Room</h1>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
          <p className="text-sm text-gray-600">Admit emergency patient and assign bed</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Search Patient */}
            <div className="mb-6">
              <Label className="text-base mb-3 block">Search Patient</Label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name or UHID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-2 border-blue-300 focus:border-blue-500"
                  />
                  
                  {/* Search Results Dropdown */}
                  {searching && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Searching...</span>
                      </div>
                    </div>
                  )}
                  {!searching && searchQuery && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient({
                            id: patient.id?.toString() || '',
                            patient_id: patient.patient_id || patient.uhid || '',
                            name: patient.name || '',
                            age: patient.age || 0,
                            gender: patient.gender || 'Other',
                            phone: patient.phone || ''
                          })}
                          className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{patient.name}</p>
                              <p className="text-xs text-gray-600">
                                {patient.patient_id || patient.uhid || ''} • {patient.age || 0}Y, {patient.gender || ''}
                              </p>
                            </div>
                            {patient.phone && <Badge variant="outline">{patient.phone}</Badge>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!searching && searchQuery && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 p-4 text-center text-sm text-gray-600">
                      No patients found
                    </div>
                  )}
                </div>

                {/* Add Patient Dialog */}
                <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Add New Patient
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the patient details to register a new patient in the system.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newPatient.firstName}
                            onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newPatient.lastName}
                            onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="age">Age *</Label>
                          <Input
                            id="age"
                            type="number"
                            value={newPatient.age}
                            onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender">Gender *</Label>
                          <Select 
                            value={newPatient.gender} 
                            onValueChange={(value) => setNewPatient({...newPatient, gender: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Select 
                            value={newPatient.bloodGroup} 
                            onValueChange={(value) => setNewPatient({...newPatient, bloodGroup: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={newPatient.phone}
                            onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={newPatient.address}
                          onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                          className="mt-2"
                          rows={2}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                          <Input
                            id="emergencyContact"
                            value={newPatient.emergencyContact}
                            onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                          <Input
                            id="emergencyContactPhone"
                            value={newPatient.emergencyContactPhone}
                            onChange={(e) => setNewPatient({...newPatient, emergencyContactPhone: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNewPatient}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Patient
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Selected Patient Display */}
              {selectedPatient && (
                <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{selectedPatient.name}</p>
                        <p className="text-sm text-gray-600">
                          {selectedPatient.patient_id || selectedPatient.id} • {selectedPatient.age}Y, {selectedPatient.gender} • {selectedPatient.phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                        setSearchQuery('');
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Type Selection */}
            <div className="mb-6">
              <Label className="text-base mb-3 block">
                Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup value={admissionType} onValueChange={(value: any) => setAdmissionType(value)}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-400 transition-colors" style={{ borderColor: admissionType === 'admit' ? '#2F80ED' : '#E5E7EB' }}>
                    <RadioGroupItem value="admit" id="admit" />
                    <Label htmlFor="admit" className="cursor-pointer flex-1">Admit Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-400 transition-colors" style={{ borderColor: admissionType === 'doa' ? '#2F80ED' : '#E5E7EB' }}>
                    <RadioGroupItem value="doa" id="doa" />
                    <Label htmlFor="doa" className="cursor-pointer flex-1">Death on Arrival</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Chief Complaint */}
            <div className="mb-6">
              <Label htmlFor="chiefComplaint" className="text-base mb-3 block">
                Chief Complaint <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="chiefComplaint"
                placeholder="Enter chief complaint..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Separator className="my-6" />

            {/* Bed Assignment Section */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wardType">Ward</Label>
                  <Select value={wardType} onValueChange={setWardType} disabled={loading}>
                    <SelectTrigger className="mt-2 h-12" id="wardType">
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id?.toString() || ''}>
                          {ward.name} ({ward.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedNumber">Bed #</Label>
                  <Select 
                    value={bedNumber} 
                    onValueChange={setBedNumber} 
                    disabled={!wardType || loading}
                  >
                    <SelectTrigger className="mt-2 h-12" id="bedNumber">
                      <SelectValue placeholder={wardType ? "Select bed" : "Select ward first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBeds.length > 0 ? (
                        availableBeds.map((bed) => (
                          <SelectItem key={bed.id} value={bed.id?.toString() || '0'}>
                            {bed.bed_number} ({bed.bed_type})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No available beds</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger className="mt-2 h-12" id="urgencyLevel">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Emergency (Level 1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>Urgent (Level 2)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="semi-urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Semi-Urgent (Level 3)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="non-urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Non-Urgent (Level 4)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyConsultant">Emergency Consultant <span className="text-red-500">*</span></Label>
                  <Select value={emergencyConsultant} onValueChange={setEmergencyConsultant} disabled={loading}>
                    <SelectTrigger className="mt-2 h-12" id="emergencyConsultant">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id?.toString() || '0'}>
                            {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No doctors available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nurseAssigned">Nurse Assigned</Label>
                  <Select value={nurseAssigned} onValueChange={setNurseAssigned} disabled={loading}>
                    <SelectTrigger className="mt-2 h-12" id="nurseAssigned">
                      <SelectValue placeholder="Select nurse (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {nurses.length > 0 ? (
                        nurses.map((nurse) => (
                          <SelectItem key={nurse.id} value={nurse.id?.toString() || '0'}>
                            {nurse.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No nurses available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-8">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-base"
                onClick={handleAssign}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

