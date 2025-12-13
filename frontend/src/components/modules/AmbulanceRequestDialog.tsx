/**
 * Ambulance Request Dialog Component
 * Request ambulance service for patient
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  X,
  Ambulance,
  MapPin,
  Phone,
  Clock,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface AmbulanceRequestDialogProps {
  patient: any;
  onClose: () => void;
  onRequest: () => void;
}

export function AmbulanceRequestDialog({ patient, onClose, onRequest }: AmbulanceRequestDialogProps) {
  const [serviceType, setServiceType] = useState('');
  const [destination, setDestination] = useState('');
  const [priority, setPriority] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [customDestinationAddress, setCustomDestinationAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState(new Date().toTimeString().slice(0, 5));
  const [medicalRequirements, setMedicalRequirements] = useState<string[]>([]);
  const [contactPerson, setContactPerson] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Safety check: if patient is not provided, close dialog
  useEffect(() => {
    if (!patient) {
      console.warn('AmbulanceRequestDialog: Patient data is missing');
      onClose();
    }
  }, [patient, onClose]);

  // Map service type to backend format
  const mapServiceType = (value: string): string => {
    const mapping: Record<string, string> = {
      'basic': 'BLS',
      'advanced': 'ALS',
      'critical': 'Critical Care',
      'air': 'Air',
      'neonatal': 'Neonatal'
    };
    return mapping[value] || 'BLS';
  };

  // Map priority to backend format
  const mapPriority = (value: string): string => {
    const mapping: Record<string, string> = {
      'emergency': 'Emergency',
      'urgent': 'Urgent',
      'scheduled': 'Scheduled'
    };
    return mapping[value] || 'Emergency';
  };

  // Map destination to backend format
  const mapDestination = (value: string): string => {
    const mapping: Record<string, string> = {
      'home': 'Home',
      'city-general': 'City General Hospital',
      'metro-medical': 'Metro Medical Center',
      'cardiac-center': 'Cardiac Specialty Center',
      'trauma-center': 'Regional Trauma Center',
      'rehab': 'Rehabilitation Facility',
      'other': 'Other'
    };
    return mapping[value] || 'Home';
  };

  // Extract emergency_visit_id from patient object
  const getEmergencyVisitId = (): number | null => {
    const vid = patient.id || patient.visitId || patient.emergency_visit_id;
    if (!vid) return null;
    return typeof vid === 'string' ? parseInt(vid, 10) : vid;
  };

  // Handle medical requirements checkbox change
  const handleMedicalRequirementChange = (requirement: string, checked: boolean) => {
    if (checked) {
      setMedicalRequirements([...medicalRequirements, requirement]);
    } else {
      setMedicalRequirements(medicalRequirements.filter(r => r !== requirement));
    }
  };

  const handleRequest = async () => {
    // Validate required fields
    if (!serviceType || !destination || !priority) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate emergency_visit_id
    const emergencyVisitId = getEmergencyVisitId();
    if (!emergencyVisitId) {
      toast.error('Patient visit ID not found. Cannot create ambulance request.');
      return;
    }

    // Validate custom destination if "Other" is selected
    if (destination === 'other' && !customDestinationAddress.trim()) {
      toast.error('Please provide the custom destination address');
      return;
    }

    try {
      setLoading(true);

      // Prepare API payload
      const requestData: any = {
        emergency_visit_id: emergencyVisitId,
        service_type: mapServiceType(serviceType),
        priority: mapPriority(priority),
        destination: mapDestination(destination),
        pickup_date: pickupDate,
        pickup_time: pickupTime + ':00', // Add seconds for TIME format
        additional_notes: additionalNotes || null
      };

      // Add custom destination address if "Other" is selected
      if (destination === 'other' && customDestinationAddress.trim()) {
        requestData.destination_address = customDestinationAddress.trim();
      }

      // Add medical requirements if any are selected
      if (medicalRequirements.length > 0) {
        requestData.medical_requirements = medicalRequirements;
      }

      // Add contact person if provided
      if (contactPerson.trim()) {
        requestData.contact_person = contactPerson.trim();
      }

      // Call API
      await api.createAmbulanceRequest(requestData);

      // Success
      toast.success('Ambulance requested successfully! ETA: 15 minutes');
      onRequest();
      onClose();
    } catch (error: any) {
      console.error('Failed to create ambulance request:', error);
      toast.error(
        error?.message || 'Failed to create ambulance request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      {/* Dialog */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <Card 
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <Ambulance className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Request Ambulance Service</CardTitle>
                <CardDescription>Emergency medical transport for {patient?.name || 'Patient'}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Patient Information */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="font-medium ml-2">{patient?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Age/Gender:</span>
                <span className="font-medium ml-2">{patient?.age || 'N/A'}Y / {patient?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">UHID:</span>
                <span className="font-medium ml-2">{patient?.uhid || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Location:</span>
                <span className="font-medium ml-2">{patient?.assignedWard || 'N/A'} - {patient?.bedNumber || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Condition:</span>
                <Badge className="ml-2" variant="outline">{patient?.status || 'N/A'}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Ambulance Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Life Support (BLS) Ambulance</SelectItem>
                  <SelectItem value="advanced">Advanced Life Support (ALS) Ambulance</SelectItem>
                  <SelectItem value="critical">Critical Care Transport</SelectItem>
                  <SelectItem value="air">Air Ambulance</SelectItem>
                  <SelectItem value="neonatal">Neonatal Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      Emergency - Immediate (Code Red)
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                      Urgent - Within 30 minutes
                    </div>
                  </SelectItem>
                  <SelectItem value="scheduled">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      Scheduled - Non-emergency
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="destination">Destination Facility *</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Patient's Home Address</SelectItem>
                  <SelectItem value="city-general">City General Hospital</SelectItem>
                  <SelectItem value="metro-medical">Metro Medical Center</SelectItem>
                  <SelectItem value="cardiac-center">Cardiac Specialty Center</SelectItem>
                  <SelectItem value="trauma-center">Regional Trauma Center</SelectItem>
                  <SelectItem value="rehab">Rehabilitation Facility</SelectItem>
                  <SelectItem value="other">Other (Specify below)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {destination === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customDestination">Custom Destination Address *</Label>
                <Textarea
                  id="customDestination"
                  placeholder="Enter complete address"
                  rows={2}
                  value={customDestinationAddress}
                  onChange={(e) => setCustomDestinationAddress(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTimeSlot">Pickup Time</Label>
                <Input
                  id="pickupTimeSlot"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Medical Requirements */}
            <div className="space-y-3">
              <Label>Special Medical Requirements</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={medicalRequirements.includes('Oxygen Support Required')}
                    onChange={(e) => handleMedicalRequirementChange('Oxygen Support Required', e.target.checked)}
                  />
                  <span className="text-sm">Oxygen Support Required</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={medicalRequirements.includes('IV Medications in Transit')}
                    onChange={(e) => handleMedicalRequirementChange('IV Medications in Transit', e.target.checked)}
                  />
                  <span className="text-sm">IV Medications in Transit</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={medicalRequirements.includes('Cardiac Monitoring Equipment')}
                    onChange={(e) => handleMedicalRequirementChange('Cardiac Monitoring Equipment', e.target.checked)}
                  />
                  <span className="text-sm">Cardiac Monitoring Equipment</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={medicalRequirements.includes('Stretcher/Wheelchair Accessible')}
                    onChange={(e) => handleMedicalRequirementChange('Stretcher/Wheelchair Accessible', e.target.checked)}
                  />
                  <span className="text-sm">Stretcher/Wheelchair Accessible</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={medicalRequirements.includes('Paramedic Escort Required')}
                    onChange={(e) => handleMedicalRequirementChange('Paramedic Escort Required', e.target.checked)}
                  />
                  <span className="text-sm">Paramedic Escort Required</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Emergency Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="Name and contact number"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes / Special Instructions</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any special instructions for the ambulance crew..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Alert Box */}
          {priority === 'emergency' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Emergency Priority Selected</p>
                <p className="text-red-700 mt-1">
                  Emergency dispatch will be notified immediately. Estimated arrival time: 10-15 minutes.
                </p>
              </div>
            </div>
          )}

          {/* Ambulance Availability */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-green-900">Ambulance Availability</p>
              <Badge className="bg-green-600 text-white">Available</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-green-700">BLS Units: <span className="font-bold">3</span></p>
              </div>
              <div>
                <p className="text-green-700">ALS Units: <span className="font-bold">2</span></p>
              </div>
              <div>
                <p className="text-green-700">Critical Care: <span className="font-bold">1</span></p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700" 
              onClick={handleRequest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Ambulance className="w-4 h-4 mr-2" />
                  Request Ambulance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}
