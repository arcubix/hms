/**
 * Edit Emergency Patient Component
 * Edit patient information and medical details
 */

import { useState } from 'react';
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

interface EditEmergencyPatientProps {
  patient: any;
  onClose: () => void;
  onSave: () => void;
}

export function EditEmergencyPatient({ patient, onClose, onSave }: EditEmergencyPatientProps) {
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
    bp: patient.vitalSigns.bp,
    pulse: patient.vitalSigns.pulse,
    temp: patient.vitalSigns.temp,
    spo2: patient.vitalSigns.spo2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
    toast.success('Patient information updated successfully!');
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
