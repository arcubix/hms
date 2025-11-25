/**
 * Transfer Patient Dialog Component
 * Transfer patient to another ward or facility
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
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
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface TransferPatientDialogProps {
  patient: any;
  onClose: () => void;
  onTransfer?: () => void;
}

export function TransferPatientDialog({ patient, onClose, onTransfer }: TransferPatientDialogProps) {
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [targetWard, setTargetWard] = useState('');
  const [targetBed, setTargetBed] = useState('');
  const [reason, setReason] = useState('');
  const [externalFacility, setExternalFacility] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [externalFacilityContact, setExternalFacilityContact] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferTime, setTransferTime] = useState(new Date().toTimeString().slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load wards when transfer type is internal
  useEffect(() => {
    if (transferType === 'internal') {
      if (wards.length === 0) {
        loadWards();
      }
      // Reset bed selection when transfer type changes
      setTargetBed('');
      setBeds([]);
    } else if (transferType === 'external') {
      // Reset selections for external transfer
      setTargetWard('');
      setTargetBed('');
      setBeds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferType]);

  // Load beds when ward is selected
  useEffect(() => {
    if (transferType === 'internal' && targetWard) {
      loadBedsForWard(targetWard);
    } else if (!targetWard) {
      setBeds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetWard, transferType]);

  const loadWards = async () => {
    setLoadingWards(true);
    try {
      const wardsData = await api.getEmergencyWards();
      setWards(wardsData || []);
    } catch (error: any) {
      console.error('Error loading wards:', error);
      toast.error('Failed to load wards');
    } finally {
      setLoadingWards(false);
    }
  };

  const loadBedsForWard = async (wardId: string) => {
    try {
      const wardIdNum = parseInt(wardId, 10);
      if (isNaN(wardIdNum)) {
        setBeds([]);
        return;
      }
      const bedsData = await api.getEmergencyWardBeds({ ward_id: wardIdNum, status: 'available' });
      setBeds(bedsData || []);
    } catch (error: any) {
      console.error('Error loading beds:', error);
      toast.error('Failed to load beds for selected ward');
      setBeds([]);
    }
  };

  const handleTransfer = async () => {
    // Validation
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

    // Get visit ID from patient
    const visitId = patient.id || patient.visitId || patient.emergency_visit_id;
    if (!visitId) {
      toast.error('Visit ID not found. Cannot create transfer.');
      return;
    }

    const visitIdNum = typeof visitId === 'string' ? parseInt(visitId, 10) : visitId;
    if (isNaN(visitIdNum)) {
      toast.error('Invalid visit ID. Cannot create transfer.');
      return;
    }

    setLoading(true);
    try {
      // Prepare transfer data
      const transferData: any = {
        emergency_visit_id: visitIdNum,
        transfer_type: transferType,
        reason: reason,
        doctor_notes: doctorNotes || null,
        transfer_date: transferDate,
        transfer_time: transferTime,
        status: 'Pending'
      };

      if (transferType === 'internal') {
        // For internal transfers, we need valid ward and bed IDs
        const toWardId = targetWard ? parseInt(targetWard, 10) : null;
        const toBedId = targetBed ? parseInt(targetBed, 10) : null;
        
        if (!toWardId || isNaN(toWardId) || toWardId <= 0) {
          toast.error('Please select a valid target ward');
          setLoading(false);
          return;
        }
        
        if (!toBedId || isNaN(toBedId) || toBedId <= 0) {
          toast.error('Please select a valid target bed');
          setLoading(false);
          return;
        }
        
        transferData.to_ward_id = toWardId;
        transferData.to_bed_id = toBedId;
        
        // If patient has current ward/bed IDs, set from_ward_id and from_bed_id
        if (patient.assignedWardId || patient.wardId) {
          const fromWardId = typeof (patient.assignedWardId || patient.wardId) === 'string' 
            ? parseInt(patient.assignedWardId || patient.wardId, 10) 
            : (patient.assignedWardId || patient.wardId);
          if (!isNaN(fromWardId) && fromWardId > 0) {
            transferData.from_ward_id = fromWardId;
          }
        }
        if (patient.bedId || patient.assignedBedId) {
          const fromBedId = typeof (patient.bedId || patient.assignedBedId) === 'string'
            ? parseInt(patient.bedId || patient.assignedBedId, 10)
            : (patient.bedId || patient.assignedBedId);
          if (!isNaN(fromBedId) && fromBedId > 0) {
            transferData.from_bed_id = fromBedId;
          }
        }
      } else {
        // External transfer
        transferData.external_facility_name = externalFacility;
        transferData.transport_mode = transportMode;
        if (externalFacilityContact) {
          transferData.external_facility_contact = externalFacilityContact;
        }
      }

      console.log('Sending transfer data to API:', transferData);
      
      // Make API call
      const result = await api.createEmergencyTransfer(transferData);
      
      console.log('Transfer API response:', result);
      
      toast.success('Patient transfer created successfully!');
      onTransfer?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating transfer:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error('Failed to create transfer: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log('TransferPatientDialog render - patient:', patient);
  
  if (!patient) {
    console.log('TransferPatientDialog: No patient, returning null');
    return null;
  }

  console.log('Creating dialogContent, document.body exists:', !!document.body);
  
  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        onClick={(e) => {
          // Only close if clicking directly on the overlay, not on child elements
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 99998
        }}
      />
      {/* Dialog */}
      <div 
        onClick={(e) => {
          // Stop all clicks inside dialog container from reaching overlay
          e.stopPropagation();
          // Only allow clicks on the dialog content itself
          if (e.target === e.currentTarget) {
            // Clicked on padding area - don't close, just stop propagation
            e.preventDefault();
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{
            width: '100%',
            maxWidth: '42rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Transfer Patient</h2>
              <p className="text-sm text-gray-600 mt-1">Transfer {patient.name} to another location</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
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
            <div 
              className="space-y-4"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <Label htmlFor="targetWard">Target Ward *</Label>
                <Select 
                  value={targetWard} 
                  onValueChange={setTargetWard}
                  disabled={loadingWards}
                >
                  <SelectTrigger id="targetWard">
                    <SelectValue placeholder={loadingWards ? "Loading wards..." : "Select ward"} />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.length === 0 && !loadingWards ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">No wards available</div>
                    ) : (
                      wards
                        .filter((ward) => ward.id != null && ward.id !== '' && ward.id !== 0)
                        .map((ward) => {
                          const wardId = ward.id?.toString();
                          if (!wardId || wardId === '0' || wardId === '') return null;
                          return (
                            <SelectItem key={ward.id} value={wardId}>
                              {ward.name} {ward.available_beds ? `(${ward.available_beds} beds available)` : ''}
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetBed">Target Bed Number *</Label>
                <Select 
                  value={targetBed} 
                  onValueChange={setTargetBed}
                  disabled={!targetWard || beds.length === 0}
                >
                  <SelectTrigger id="targetBed">
                    <SelectValue placeholder={!targetWard ? "Select ward first" : beds.length === 0 ? "No beds available" : "Select bed"} />
                  </SelectTrigger>
                  <SelectContent>
                    {beds.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        {!targetWard ? "Please select a ward first" : "No available beds in this ward"}
                      </div>
                    ) : (
                      beds
                        .filter((bed) => bed.id != null && bed.id !== '' && bed.id !== 0)
                        .map((bed) => {
                          const bedId = bed.id?.toString();
                          if (!bedId || bedId === '0' || bedId === '') return null;
                          return (
                            <SelectItem key={bed.id} value={bedId}>
                              {bed.bed_number || bed.bedNumber} {bed.status ? `(${bed.status})` : ''}
                            </SelectItem>
                          );
                        })
                    )}
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
                <Input 
                  id="contactPerson" 
                  placeholder="Contact person name and number"
                  value={externalFacilityContact}
                  onChange={(e) => setExternalFacilityContact(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
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
          <div 
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer *</Label>
              <Textarea
                id="reason"
                placeholder="Enter detailed reason for transfer (e.g., requires specialized care, step-down from ICU, patient request, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorNotes">Doctor's Notes</Label>
              <Textarea
                id="doctorNotes"
                placeholder="Additional medical notes or special instructions"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transferDate">Transfer Date</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferTime">Transfer Time</Label>
                <Input
                  id="transferTime"
                  type="time"
                  value={transferTime}
                  onChange={(e) => setTransferTime(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
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
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={handleTransfer}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Transfer...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Confirm Transfer
                </>
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </>
  );

  console.log('About to create portal, document.body:', document.body);
  
  // Try rendering directly first to debug
  if (typeof window !== 'undefined' && document.body) {
    const portal = createPortal(dialogContent, document.body);
    console.log('Portal created and returning');
    return portal;
  } else {
    console.error('Cannot create portal - window or document.body not available');
    return null;
  }
}
