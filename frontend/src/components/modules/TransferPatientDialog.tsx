/**
 * Transfer Patient Dialog Component
 * Transfer patient to another ward or facility
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
  ArrowLeftRight,
  Building2,
  Bed,
  User,
  FileText,
  Ambulance,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TransferPatientDialogProps {
  patient: any;
  onClose: () => void;
  onTransfer: () => void;
}

export function TransferPatientDialog({ patient, onClose, onTransfer }: TransferPatientDialogProps) {
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [targetWard, setTargetWard] = useState('');
  const [targetBed, setTargetBed] = useState('');
  const [reason, setReason] = useState('');
  const [externalFacility, setExternalFacility] = useState('');
  const [transportMode, setTransportMode] = useState('');

  const handleTransfer = () => {
    if (transferType === 'internal' && (!targetWard || !targetBed)) {
      toast.error('Please select target ward and bed');
      return;
    }
    if (transferType === 'external' && (!externalFacility || !transportMode)) {
      toast.error('Please provide facility and transport details');
      return;
    }
    if (!reason) {
      toast.error('Please provide reason for transfer');
      return;
    }

    onTransfer();
    toast.success('Patient transfer initiated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Transfer Patient</CardTitle>
                <CardDescription>Transfer {patient.name} to another location</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Current Patient Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Current Patient Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="font-medium ml-2">{patient.name}</span>
              </div>
              <div>
                <span className="text-gray-600">UHID:</span>
                <span className="font-medium ml-2">{patient.uhid}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Ward:</span>
                <span className="font-medium ml-2">{patient.assignedWard}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Bed:</span>
                <span className="font-medium ml-2">{patient.bedNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <Badge className="ml-2" variant="outline">{patient.status}</Badge>
              </div>
              <div>
                <span className="text-gray-600">Diagnosis:</span>
                <span className="font-medium ml-2 text-xs">{patient.diagnosis}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transfer Type Selection */}
          <div className="space-y-4">
            <Label>Transfer Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTransferType('internal')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  transferType === 'internal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                  transferType === 'internal' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className="font-medium">Internal Transfer</p>
                <p className="text-xs text-gray-600 mt-1">Transfer within hospital</p>
              </button>
              <button
                onClick={() => setTransferType('external')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  transferType === 'external'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Ambulance className={`w-8 h-8 mx-auto mb-2 ${
                  transferType === 'external' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className="font-medium">External Transfer</p>
                <p className="text-xs text-gray-600 mt-1">Transfer to another facility</p>
              </button>
            </div>
          </div>

          <Separator />

          {/* Internal Transfer Fields */}
          {transferType === 'internal' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetWard">Target Ward *</Label>
                <Select value={targetWard} onValueChange={setTargetWard}>
                  <SelectTrigger id="targetWard">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-ward-a">General Ward A</SelectItem>
                    <SelectItem value="general-ward-b">General Ward B</SelectItem>
                    <SelectItem value="icu">Intensive Care Unit (ICU)</SelectItem>
                    <SelectItem value="cardiac-ward">Cardiac Care Ward</SelectItem>
                    <SelectItem value="surgical-ward">Surgical Ward</SelectItem>
                    <SelectItem value="private-room-1">Private Room 1</SelectItem>
                    <SelectItem value="private-room-2">Private Room 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetBed">Target Bed Number *</Label>
                <Select value={targetBed} onValueChange={setTargetBed}>
                  <SelectTrigger id="targetBed">
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bed-01">Bed 01 (Available)</SelectItem>
                    <SelectItem value="bed-02">Bed 02 (Available)</SelectItem>
                    <SelectItem value="bed-03">Bed 03 (Available)</SelectItem>
                    <SelectItem value="bed-04">Bed 04 (Available)</SelectItem>
                    <SelectItem value="bed-05">Bed 05 (Available)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Selected Ward Status</p>
                  <p className="text-green-700 mt-1">15 beds available • Adequate staffing • Ready for admission</p>
                </div>
              </div>
            </div>
          )}

          {/* External Transfer Fields */}
          {transferType === 'external' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="externalFacility">Receiving Facility *</Label>
                <Select value={externalFacility} onValueChange={setExternalFacility}>
                  <SelectTrigger id="externalFacility">
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city-general">City General Hospital</SelectItem>
                    <SelectItem value="metro-medical">Metro Medical Center</SelectItem>
                    <SelectItem value="cardiac-center">Cardiac Specialty Center</SelectItem>
                    <SelectItem value="trauma-center">Regional Trauma Center</SelectItem>
                    <SelectItem value="rehab-center">Rehabilitation Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportMode">Transport Mode *</Label>
                <Select value={transportMode} onValueChange={setTransportMode}>
                  <SelectTrigger id="transportMode">
                    <SelectValue placeholder="Select transport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambulance-basic">Basic Ambulance</SelectItem>
                    <SelectItem value="ambulance-als">Advanced Life Support Ambulance</SelectItem>
                    <SelectItem value="air-ambulance">Air Ambulance</SelectItem>
                    <SelectItem value="patient-transport">Patient Transport Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Receiving Facility Contact</Label>
                <Input id="contactPerson" placeholder="Contact person name and number" />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">External Transfer Requirements</p>
                  <p className="text-yellow-700 mt-1">Ensure receiving facility confirmation, patient stability assessment, and complete medical records transfer.</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Common Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer *</Label>
              <Textarea
                id="reason"
                placeholder="Enter detailed reason for transfer (e.g., requires specialized care, step-down from ICU, patient request, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorNotes">Doctor's Notes</Label>
              <Textarea
                id="doctorNotes"
                placeholder="Additional medical notes or special instructions"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transferDate">Transfer Date</Label>
                <Input
                  id="transferDate"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferTime">Transfer Time</Label>
                <Input
                  id="transferTime"
                  type="time"
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleTransfer}>
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Confirm Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
