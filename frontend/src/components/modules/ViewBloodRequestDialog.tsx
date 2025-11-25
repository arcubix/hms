/**
 * View Blood Request Dialog Component
 * Modal for viewing blood bank request details
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  X,
  Droplet,
  Clock,
  User,
  FileText,
  Calendar
} from 'lucide-react';
import type { EmergencyBloodBankRequest } from '../../services/api';

interface ViewBloodRequestDialogProps {
  request: EmergencyBloodBankRequest;
  patient: any;
  onClose: () => void;
}

export function ViewBloodRequestDialog({ request, patient, onClose }: ViewBloodRequestDialogProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const requestDate = new Date(request.request_date);
  const issuedDate = request.issued_at ? new Date(request.issued_at) : null;
  const transfusionDate = request.transfusion_date ? new Date(request.transfusion_date) : null;

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
            maxWidth: '48rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-pink-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Droplet className="w-6 h-6 text-red-600" />
                Blood Bank Request Details
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
              {/* Request Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Request Number:</span>
                    <span className="font-medium">{request.request_number || `BB-${request.id}`}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Product Type:</span>
                    <span className="font-medium">{request.product_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Units:</span>
                    <span className="font-medium">{request.units} Units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium">{requestDate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Requested By:</span>
                    <span className="font-medium">{request.requested_by_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={
                      request.status === 'Ready' || request.status === 'Transfused' ? 'bg-green-100 text-green-800' :
                      request.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'Requested' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Urgency:</span>
                    <Badge className={
                      request.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                      request.urgency === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {request.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  {request.cross_match_status && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cross-match Status:</span>
                      <Badge className={
                        request.cross_match_status === 'Compatible' ? 'bg-green-100 text-green-800' :
                        request.cross_match_status === 'Incompatible' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {request.cross_match_status}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Issue Information */}
              {issuedDate && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Issue Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Issued At:</span>
                      <span className="font-medium">{issuedDate.toLocaleString()}</span>
                    </div>
                    {request.issued_by_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Issued By:</span>
                        <span className="font-medium">{request.issued_by_name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Transfusion Information */}
              {transfusionDate && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-blue-600" />
                      Transfusion Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Transfusion Date:</span>
                      <span className="font-medium">{transfusionDate.toLocaleDateString()}</span>
                    </div>
                    {request.transfusion_start_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Start Time:</span>
                        <span className="font-medium">{request.transfusion_start_time}</span>
                      </div>
                    )}
                    {request.transfusion_end_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">End Time:</span>
                        <span className="font-medium">{request.transfusion_end_time}</span>
                      </div>
                    )}
                    {request.reaction_notes && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Reaction Notes:</p>
                        <p className="text-sm font-medium text-red-700 whitespace-pre-wrap">{request.reaction_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {request.notes && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.notes}</p>
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

