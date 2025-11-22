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

import { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

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

  // Mock patient search results
  const searchResults = [
    {
      id: 'UHID-78945',
      name: 'Yasir Ahmed',
      age: 35,
      gender: 'Male',
      phone: '+1-555-0123',
      lastVisit: '2024-10-15'
    },
    {
      id: 'UHID-78946',
      name: 'Yasir Khan',
      age: 42,
      gender: 'Male',
      phone: '+1-555-0124',
      lastVisit: '2024-09-20'
    }
  ];

  const filteredResults = searchQuery
    ? searchResults.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchQuery(patient.name);
  };

  const handleAddNewPatient = () => {
    // Validate new patient form
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.age || !newPatient.gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create new patient
    const patient = {
      id: `UHID-${Math.floor(Math.random() * 100000)}`,
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      phone: newPatient.phone
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
  };

  const handleAssign = () => {
    // Validation
    if (!selectedPatient) {
      toast.error('Please select or add a patient');
      return;
    }

    if (!wardType || !bedNumber || !urgencyLevel) {
      toast.error('Please fill in all bed assignment details');
      return;
    }

    if (!emergencyConsultant) {
      toast.error('Please assign an emergency consultant');
      return;
    }

    // Success
    toast.success(`Patient ${admissionType === 'admit' ? 'admitted' : 'registered as DOA'} successfully!`);
    onAdmit();
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
                  {searchQuery && filteredResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {filteredResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{patient.name}</p>
                              <p className="text-xs text-gray-600">
                                {patient.id} • {patient.age}Y, {patient.gender}
                              </p>
                            </div>
                            <Badge variant="outline">{patient.phone}</Badge>
                          </div>
                        </button>
                      ))}
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
                          {selectedPatient.id} • {selectedPatient.age}Y, {selectedPatient.gender} • {selectedPatient.phone}
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

            {/* Bed Assignment Section */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wardType">Ward Type</Label>
                  <Select value={wardType} onValueChange={setWardType}>
                    <SelectTrigger className="mt-2 h-12" id="wardType">
                      <SelectValue placeholder="Select ward type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="general">General Ward</SelectItem>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="private">Private Room</SelectItem>
                      <SelectItem value="semi-private">Semi-Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedNumber">Bed #</Label>
                  <Select value={bedNumber} onValueChange={setBedNumber}>
                    <SelectTrigger className="mt-2 h-12" id="bedNumber">
                      <SelectValue placeholder="Select bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Bed {num}
                        </SelectItem>
                      ))}
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
                  <Label htmlFor="emergencyConsultant">Emergency Consultant</Label>
                  <Input
                    id="emergencyConsultant"
                    placeholder="Enter doctor name"
                    value={emergencyConsultant}
                    onChange={(e) => setEmergencyConsultant(e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="nurseAssigned">Nurse Assigned</Label>
                  <Input
                    id="nurseAssigned"
                    placeholder="Enter nurse name"
                    value={nurseAssigned}
                    onChange={(e) => setNurseAssigned(e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-8">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-base"
                onClick={handleAssign}
              >
                <Save className="w-5 h-5 mr-2" />
                Assign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

