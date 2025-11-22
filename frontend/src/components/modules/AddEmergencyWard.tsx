/**
 * Add Emergency Ward Component
 * 
 * Form to add a new ward to the emergency department with comprehensive fields.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  Building2,
  X,
  Save,
  Bed,
  MapPin,
  User,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface AddEmergencyWardProps {
  onClose: () => void;
  onSave: () => void;
}

export function AddEmergencyWard({ onClose, onSave }: AddEmergencyWardProps) {
  const [newWard, setNewWard] = useState({
    name: '',
    type: '',
    totalBeds: '',
    floor: '',
    building: '',
    incharge: '',
    contact: '',
    email: '',
    status: 'Active',
    description: ''
  });

  const handleSave = () => {
    // Validation
    if (!newWard.name || !newWard.type || !newWard.totalBeds || !newWard.incharge || !newWard.contact) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Success
    toast.success(`Ward "${newWard.name}" added successfully!`);
    onSave();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Add New Ward</h1>
                <p className="text-sm text-gray-600">Create a new emergency ward with comprehensive details</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ward Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Ward Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Emergency Ward C"
                    value={newWard.name}
                    onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="type">
                    Ward Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newWard.type}
                    onValueChange={(value) => setNewWard({ ...newWard, type: value })}
                  >
                    <SelectTrigger className="mt-2" id="type">
                      <SelectValue placeholder="Select ward type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Isolation">Isolation</SelectItem>
                      <SelectItem value="Pediatric">Pediatric Emergency</SelectItem>
                      <SelectItem value="Trauma">Trauma Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalBeds">
                    Total Beds <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="totalBeds"
                      type="number"
                      placeholder="20"
                      value={newWard.totalBeds}
                      onChange={(e) => setNewWard({ ...newWard, totalBeds: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newWard.status}
                    onValueChange={(value) => setNewWard({ ...newWard, status: value })}
                  >
                    <SelectTrigger className="mt-2" id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Location Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="building">Building</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="building"
                      placeholder="e.g., Main Building"
                      value={newWard.building}
                      onChange={(e) => setNewWard({ ...newWard, building: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    placeholder="e.g., Ground Floor, 1st Floor"
                    value={newWard.floor}
                    onChange={(e) => setNewWard({ ...newWard, floor: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Staff Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Staff Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incharge">
                    Ward Incharge <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="incharge"
                      placeholder="e.g., Nurse Alice Thompson"
                      value={newWard.incharge}
                      onChange={(e) => setNewWard({ ...newWard, incharge: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact">
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="contact"
                      placeholder="+1-555-0101"
                      value={newWard.contact}
                      onChange={(e) => setNewWard({ ...newWard, contact: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ward@hospital.com"
                    value={newWard.email}
                    onChange={(e) => setNewWard({ ...newWard, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Additional Information</h3>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <div className="relative mt-2">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="description"
                    placeholder="Brief description of the ward, its specializations, and facilities..."
                    value={newWard.description}
                    onChange={(e) => setNewWard({ ...newWard, description: e.target.value })}
                    className="pl-10 min-h-[100px]"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Ward
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

