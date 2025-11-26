/**
 * Ambulance Request Dialog Component
 * Request ambulance service for patient
 */

import { useState } from 'react';
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
import { toast } from 'sonner@2.0.3';

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

  const handleRequest = () => {
    if (!serviceType || !destination || !priority) {
      toast.error('Please fill in all required fields');
      return;
    }

    onRequest();
    toast.success('Ambulance requested successfully! ETA: 15 minutes');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <Ambulance className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Request Ambulance Service</CardTitle>
                <CardDescription>Emergency medical transport for {patient.name}</CardDescription>
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
                <span className="font-medium ml-2">{patient.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Age/Gender:</span>
                <span className="font-medium ml-2">{patient.age}Y / {patient.gender}</span>
              </div>
              <div>
                <span className="text-gray-600">UHID:</span>
                <span className="font-medium ml-2">{patient.uhid}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Location:</span>
                <span className="font-medium ml-2">{patient.assignedWard} - {patient.bedNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Condition:</span>
                <Badge className="ml-2" variant="outline">{patient.status}</Badge>
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
                <Label htmlFor="customDestination">Custom Destination Address</Label>
                <Textarea
                  id="customDestination"
                  placeholder="Enter complete address"
                  rows={2}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Pickup Date</Label>
                <Input
                  id="pickupTime"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTimeSlot">Pickup Time</Label>
                <Input
                  id="pickupTimeSlot"
                  type="time"
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                />
              </div>
            </div>

            <Separator />

            {/* Medical Requirements */}
            <div className="space-y-3">
              <Label>Special Medical Requirements</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Oxygen Support Required</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">IV Medications in Transit</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Cardiac Monitoring Equipment</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Stretcher/Wheelchair Accessible</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Paramedic Escort Required</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Emergency Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="Name and contact number"
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
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleRequest}>
              <Ambulance className="w-4 h-4 mr-2" />
              Request Ambulance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
