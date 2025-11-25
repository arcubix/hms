/**
 * Edit Emergency Patient Component
 * Edit patient information and medical details
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Stethoscope,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface EditEmergencyPatientProps {
  patient: any;
  onClose: () => void;
  onSave: () => void;
}

export function EditEmergencyPatient({ patient, onClose, onSave }: EditEmergencyPatientProps) {
  // Get visit ID from patient (may be string or number)
  const visitId = patient?.id ? (typeof patient.id === 'string' ? parseInt(patient.id, 10) : patient.id) : null;
  
  // State for wards and doctors lookup
  const [wards, setWards] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);
  
  // Load wards, doctors, and patient ID for lookup
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        // Get patientId from patient prop or fetch from visit
        let foundPatientId = patient?.patientId || patient?.patient_db_id;
        
        // If patientId not available, fetch visit data to get it
        if (!foundPatientId && visitId) {
          try {
            const visitData = await api.getEmergencyVisit(visitId.toString());
            foundPatientId = visitData?.patientId || visitData?.patient_db_id;
            console.log('Fetched patientId from visit:', foundPatientId);
          } catch (error) {
            console.error('Error fetching visit data for patientId:', error);
          }
        }
        
        setPatientId(foundPatientId ? (typeof foundPatientId === 'string' ? parseInt(foundPatientId, 10) : foundPatientId) : null);
        
        const [wardsData, doctorsData] = await Promise.all([
          api.getEmergencyWards().catch(() => []),
          api.getDoctors().catch(() => [])
        ]);
        setWards(wardsData || []);
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error('Error loading lookup data:', error);
      }
    };
    loadLookupData();
  }, [visitId, patient]);
  
  // Get latest vital signs from patient.vitals array
  const getLatestVitals = () => {
    const vitalsArray = Array.isArray(patient.vitals) ? patient.vitals : [];
    if (vitalsArray.length === 0) {
      // Fallback to vitalSigns if vitals array is empty
      return {
        bp: patient.vitalSigns?.bp || '',
        pulse: patient.vitalSigns?.pulse || 0,
        temp: patient.vitalSigns?.temp || 0,
        spo2: patient.vitalSigns?.spo2 || 0
      };
    }
    // Sort by recorded_at descending to get latest
    const sortedVitals = [...vitalsArray].sort((a, b) => {
      const dateA = new Date(a.recorded_at || a.created_at || 0).getTime();
      const dateB = new Date(b.recorded_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
    const latest = sortedVitals[0];
    return {
      bp: latest?.bp || '',
      pulse: latest?.pulse || 0,
      temp: latest?.temp || 0,
      spo2: latest?.spo2 || 0
    };
  };

  const latestVitals = getLatestVitals();
  
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    uhid: patient.uhid,
    erNumber: patient.erNumber,
    diagnosis: patient.diagnosis,
    status: patient.status,
    triageLevel: patient.triageLevel,
    assignedWard: patient.assignedWard,
    bedNumber: patient.bedNumber,
    attendingDoctor: patient.attendingDoctor,
    admissionType: patient.admissionType,
    bp: latestVitals.bp,
    pulse: latestVitals.pulse,
    temp: latestVitals.temp,
    spo2: latestVitals.spo2
  });

  // Store original vitals to detect changes
  const [originalVitals, setOriginalVitals] = useState({
    bp: latestVitals.bp,
    pulse: latestVitals.pulse,
    temp: latestVitals.temp,
    spo2: latestVitals.spo2
  });

  // Load latest vitals if visitId is available and vitals array is empty
  useEffect(() => {
    const loadLatestVitals = async () => {
      if (visitId && (!patient.vitals || patient.vitals.length === 0)) {
        try {
          const vitalsData = await api.getEmergencyVitals(visitId);
          if (vitalsData && vitalsData.length > 0) {
            const sortedVitals = [...vitalsData].sort((a, b) => {
              const dateA = new Date(a.recorded_at || a.created_at || 0).getTime();
              const dateB = new Date(b.recorded_at || b.created_at || 0).getTime();
              return dateB - dateA;
            });
            const latest = sortedVitals[0];
            const newVitals = {
              bp: latest?.bp || '',
              pulse: latest?.pulse || 0,
              temp: latest?.temp || 0,
              spo2: latest?.spo2 || 0
            };
            setFormData(prev => ({ ...prev, ...newVitals }));
            setOriginalVitals(newVitals);
          }
        } catch (error) {
          console.error('Error loading vitals:', error);
        }
      }
    };
    loadLatestVitals();
  }, [visitId, patient.vitals]);

  // Check if vitals have changed
  const vitalsChanged = () => {
    return (
      formData.bp !== originalVitals.bp ||
      formData.pulse !== originalVitals.pulse ||
      formData.temp !== originalVitals.temp ||
      formData.spo2 !== originalVitals.spo2
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    try {
      // Update patient information (name, age, gender) if patientId is available
      const currentPatientId = patientId || patient?.patientId || patient?.patient_db_id;
      console.log('Patient update check:', { 
        patientId: currentPatientId, 
        patientIdState: patientId,
        patientObject: patient,
        formData: { name: formData.name, age: formData.age, gender: formData.gender },
        originalPatient: { name: patient.name, age: patient.age, gender: patient.gender }
      });
      
      if (currentPatientId) {
        const patientUpdateData: any = {};
        
        // Include all patient fields from form (name, age, gender)
        if (formData.name) {
          patientUpdateData.name = formData.name;
        }
        if (formData.age) {
          patientUpdateData.age = parseInt(formData.age.toString());
        }
        if (formData.gender) {
          patientUpdateData.gender = formData.gender;
        }
        
        // Update patient if there is data to update
        if (Object.keys(patientUpdateData).length > 0) {
          try {
            console.log('Sending patient update request:', { 
              patientId: currentPatientId.toString(), 
              patientUpdateData,
              endpoint: `/api/patients/${currentPatientId.toString()}`
            });
            await api.updatePatient(currentPatientId.toString(), patientUpdateData);
            console.log('Patient updated successfully');
          } catch (error: any) {
            console.error('Error updating patient:', error);
            toast.error('Failed to update patient information: ' + (error.message || 'Unknown error'));
            // Don't return - continue with visit update
          }
        } else {
          console.warn('No patient data to update - all fields are empty');
        }
      } else {
        console.warn('Patient ID not found. Available patient fields:', Object.keys(patient || {}));
        console.warn('Visit ID:', visitId, 'Patient state:', patientId);
      }
      
      // Update emergency visit information if visitId is available
      if (visitId) {
        const updateData: any = {
          chief_complaint: formData.diagnosis || null, // Use chief_complaint as it exists in the base schema
          triage_level: parseInt(formData.triageLevel.toString()) || null,
          bed_number: formData.bedNumber || null
        };
        
        // Map status to backend format
        if (formData.status) {
          const statusMap: any = {
            'Stable': 'in-treatment',
            'Critical': 'in-treatment',
            'Under Observation': 'in-treatment'
          };
          updateData.current_status = statusMap[formData.status] || 'in-treatment';
        }
        
        // Add admission type (database uses exact values: 'Ward', 'Private Room', 'ICU')
        if (formData.admissionType) {
          updateData.admission_type = formData.admissionType; // Use as-is since DB enum matches form values
        }
        
        // Look up ward ID from ward name
        if (formData.assignedWard) {
          const ward = wards.find(w => w.name === formData.assignedWard);
          if (ward && ward.id) {
            updateData.assigned_ward_id = parseInt(ward.id.toString());
            console.log('Found ward ID:', ward.id, 'for ward name:', formData.assignedWard);
          } else {
            console.warn('Ward not found:', formData.assignedWard, 'Available wards:', wards.map(w => w.name));
          }
        }
        
        // Look up doctor ID from doctor name
        if (formData.attendingDoctor) {
          // Try exact match first, then with "Dr. " prefix
          const doctor = doctors.find(d => 
            d.name === formData.attendingDoctor || 
            `Dr. ${d.name}` === formData.attendingDoctor ||
            d.name === formData.attendingDoctor.replace('Dr. ', '')
          );
          if (doctor && doctor.id) {
            updateData.assigned_doctor_id = parseInt(doctor.id.toString());
            console.log('Found doctor ID:', doctor.id, 'for doctor name:', formData.attendingDoctor);
          } else {
            console.warn('Doctor not found:', formData.attendingDoctor, 'Available doctors:', doctors.map(d => d.name));
          }
        }
        
        // Remove null/undefined/empty values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
            delete updateData[key];
          }
        });
        
        console.log('Sending update request:', { visitId: visitId.toString(), updateData });
        
        try {
          const response = await api.updateEmergencyVisit(visitId.toString(), updateData);
          console.log('Emergency visit updated successfully:', response);
          toast.success('Patient information updated successfully!');
        } catch (error: any) {
          console.error('Error updating emergency visit:', error);
          toast.error('Failed to update patient information: ' + (error.message || 'Unknown error'));
          return; // Don't proceed if visit update fails
        }
      }
      
      // If vitals changed and visitId is available, save new vital record
      if (vitalsChanged() && visitId) {
        const vitalData: any = {};
        if (formData.bp) vitalData.bp = formData.bp;
        if (formData.pulse) vitalData.pulse = parseInt(formData.pulse.toString());
        if (formData.temp) vitalData.temp = parseFloat(formData.temp.toString());
        if (formData.spo2) vitalData.spo2 = parseInt(formData.spo2.toString());
        
        try {
          await api.recordEmergencyVitals(visitId, vitalData);
          toast.success('Vital signs recorded successfully!');
        } catch (error: any) {
          console.error('Error recording vitals:', error);
          toast.error('Failed to record vital signs: ' + (error.message || 'Unknown error'));
        }
      }
      
      // Call the parent's onSave callback to refresh the list
      onSave();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error('Failed to save patient information: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Patient Information</h1>
              <p className="text-sm text-gray-600">Update patient details and medical information</p>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="uhid">UHID</Label>
                  <Input id="uhid" value={formData.uhid} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erNumber">ER Number</Label>
                  <Input id="erNumber" value={formData.erNumber} disabled className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-red-600" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Patient Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="Stable">Stable</SelectItem>
                      <SelectItem value="Under Observation">Under Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triageLevel">Triage Level *</Label>
                  <Select value={formData.triageLevel.toString()} onValueChange={(value) => setFormData({...formData, triageLevel: parseInt(value)})}>
                    <SelectTrigger id="triageLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ESI 1 - Immediate</SelectItem>
                      <SelectItem value="2">ESI 2 - Emergent</SelectItem>
                      <SelectItem value="3">ESI 3 - Urgent</SelectItem>
                      <SelectItem value="4">ESI 4 - Less Urgent</SelectItem>
                      <SelectItem value="5">ESI 5 - Non-Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionType">Admission Type *</Label>
                  <Select value={formData.admissionType} onValueChange={(value) => setFormData({...formData, admissionType: value})}>
                    <SelectTrigger id="admissionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ward">Ward</SelectItem>
                      <SelectItem value="Private Room">Private Room</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ward & Doctor Information */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Ward & Doctor Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedWard">Assigned Ward *</Label>
                  <Select value={formData.assignedWard} onValueChange={(value) => setFormData({...formData, assignedWard: value})}>
                    <SelectTrigger id="assignedWard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency Ward A">Emergency Ward A</SelectItem>
                      <SelectItem value="Emergency Ward B">Emergency Ward B</SelectItem>
                      <SelectItem value="Emergency ICU">Emergency ICU</SelectItem>
                      <SelectItem value="Emergency Isolation">Emergency Isolation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedNumber">Bed Number *</Label>
                  <Input
                    id="bedNumber"
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendingDoctor">Attending Doctor *</Label>
                  <Select value={formData.attendingDoctor} onValueChange={(value) => setFormData({...formData, attendingDoctor: value})}>
                    <SelectTrigger id="attendingDoctor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</SelectItem>
                      <SelectItem value="Dr. Michael Brown">Dr. Michael Brown</SelectItem>
                      <SelectItem value="Dr. Emily Davis">Dr. Emily Davis</SelectItem>
                      <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Current Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bp">Blood Pressure</Label>
                  <Input
                    id="bp"
                    placeholder="120/80"
                    value={formData.bp}
                    onChange={(e) => setFormData({...formData, bp: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                  <Input
                    id="pulse"
                    type="number"
                    value={formData.pulse}
                    onChange={(e) => setFormData({...formData, pulse: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp">Temperature (°F)</Label>
                  <Input
                    id="temp"
                    type="number"
                    step="0.1"
                    value={formData.temp}
                    onChange={(e) => setFormData({...formData, temp: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spo2">SpO2 (%)</Label>
                  <Input
                    id="spo2"
                    type="number"
                    value={formData.spo2}
                    onChange={(e) => setFormData({...formData, spo2: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
