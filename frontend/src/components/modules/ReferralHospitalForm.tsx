import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, X } from 'lucide-react';
import { api, ReferralHospital, CreateReferralHospitalData } from '../../services/api';
import { toast } from 'sonner';

interface ReferralHospitalFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  hospitalId?: number;
}

export function ReferralHospitalForm({ onBack, onSuccess, hospitalId }: ReferralHospitalFormProps) {
  const [loading, setLoading] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [formData, setFormData] = useState<CreateReferralHospitalData>({
    hospital_name: '',
    specialty_type: 'Multi-Specialty',
    address: '',
    email: '',
    phone: '',
    associated_doctor: '',
    specialties: [],
    status: 'Active'
  });

  useEffect(() => {
    if (hospitalId) {
      loadHospital();
    }
  }, [hospitalId]);

  const loadHospital = async () => {
    try {
      setLoading(true);
      const hospital = await api.getReferralHospital(hospitalId!);
      setFormData({
        hospital_name: hospital.hospital_name,
        specialty_type: hospital.specialty_type,
        address: hospital.address || '',
        email: hospital.email || '',
        phone: hospital.phone || '',
        associated_doctor: hospital.associated_doctor || '',
        specialties: hospital.specialties || [],
        status: hospital.status
      });
    } catch (error) {
      toast.error('Failed to load referral hospital');
      console.error('Error loading referral hospital:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties?.includes(specialtyInput.trim())) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), specialtyInput.trim()]
      });
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    const newSpecialties = formData.specialties?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, specialties: newSpecialties });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hospital_name) {
      toast.error('Hospital name is required');
      return;
    }

    try {
      setLoading(true);
      if (hospitalId) {
        await api.updateReferralHospital(hospitalId, formData);
        toast.success('Referral hospital updated successfully');
      } else {
        await api.createReferralHospital(formData);
        toast.success('Referral hospital created successfully');
      }
      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save referral hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {hospitalId ? 'Edit Referral Hospital' : 'Add Referral Hospital'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {hospitalId ? 'Update referral hospital information' : 'Add a new referral hospital to the network'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
          <CardDescription>Enter the referral hospital details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hospital Name */}
              <div className="md:col-span-2">
                <Label htmlFor="hospital_name">Hospital Name *</Label>
                <Input
                  id="hospital_name"
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              {/* Specialty Type */}
              <div>
                <Label htmlFor="specialty_type">Specialty Type</Label>
                <Select
                  value={formData.specialty_type}
                  onValueChange={(value: any) => setFormData({ ...formData, specialty_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multi-Specialty">Multi-Specialty</SelectItem>
                    <SelectItem value="Single-Specialty">Single-Specialty</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Specialized">Specialized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter hospital address"
                  rows={2}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@hospital.com"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1-555-0501"
                />
              </div>

              {/* Associated Doctor */}
              <div className="md:col-span-2">
                <Label htmlFor="associated_doctor">Associated Doctor</Label>
                <Input
                  id="associated_doctor"
                  value={formData.associated_doctor}
                  onChange={(e) => setFormData({ ...formData, associated_doctor: e.target.value })}
                  placeholder="Dr. William Parker"
                />
              </div>

              {/* Specialties */}
              <div className="md:col-span-2">
                <Label htmlFor="specialties">Specialties</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="specialties"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSpecialty();
                      }
                    }}
                    placeholder="Enter specialty and press Enter"
                  />
                  <Button type="button" onClick={handleAddSpecialty} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.specialties && formData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties.map((specialty, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-50 border border-blue-200 rounded-md px-2 py-1"
                      >
                        <span className="text-sm text-gray-700">{specialty}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(index)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : hospitalId ? 'Update Hospital' : 'Create Hospital'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

