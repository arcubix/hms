/**
 * View Health & Physical Dialog Component
 * Modal for viewing H&P record details
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  X,
  Stethoscope,
  Clock,
  User,
  FileText
} from 'lucide-react';
import type { EmergencyHealthPhysical } from '../../services/api';

interface ViewHealthPhysicalDialogProps {
  hp: EmergencyHealthPhysical;
  patient: any;
  onClose: () => void;
}

export function ViewHealthPhysicalDialog({ hp, patient, onClose }: ViewHealthPhysicalDialogProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const examDate = new Date(hp.examination_date);

  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
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
        className="pointer-events-none"
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
          padding: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '56rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-indigo-600" />
                History & Physical Examination
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Patient: {patient.name} • UHID: {patient.uhid}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Record Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Record Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Examination Date:</span>
                    <span className="font-medium">{examDate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{hp.provider_name || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Chief Complaint */}
              {hp.chief_complaint && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                    <CardTitle className="text-base">Chief Complaint</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.chief_complaint}</p>
                  </CardContent>
                </Card>
              )}

              {/* History of Present Illness */}
              {hp.history_of_present_illness && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                    <CardTitle className="text-base">History of Present Illness</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.history_of_present_illness}</p>
                  </CardContent>
                </Card>
              )}

              {/* Past Medical History */}
              {hp.past_medical_history && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardTitle className="text-base">Past Medical History</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.past_medical_history}</p>
                  </CardContent>
                </Card>
              )}

              {/* Allergies */}
              {hp.allergies && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                    <CardTitle className="text-base">Allergies</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.allergies}</p>
                  </CardContent>
                </Card>
              )}

              {/* Medications */}
              {hp.medications && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                    <CardTitle className="text-base">Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.medications}</p>
                  </CardContent>
                </Card>
              )}

              {/* Physical Examination */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-base">Physical Examination</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.physical_examination}</p>
                </CardContent>
              </Card>

              {/* Assessment */}
              {hp.assessment && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <CardTitle className="text-base">Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.assessment}</p>
                  </CardContent>
                </Card>
              )}

              {/* Plan */}
              {hp.plan && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50">
                    <CardTitle className="text-base">Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{hp.plan}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}

