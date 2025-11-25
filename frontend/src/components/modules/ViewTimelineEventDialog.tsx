/**
 * View Timeline Event Dialog Component
 * Modal for viewing timeline event details
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  X,
  Clock,
  User,
  FileText,
  ArrowRight
} from 'lucide-react';
import type { EmergencyStatusHistory } from '../../services/api';

interface ViewTimelineEventDialogProps {
  event: EmergencyStatusHistory;
  patient: any;
  onClose: () => void;
}

export function ViewTimelineEventDialog({ event, patient, onClose }: ViewTimelineEventDialogProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const eventDate = new Date(event.changed_at);

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
            maxWidth: '42rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Timeline Event Details
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
              {/* Event Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">{eventDate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Changed By:</span>
                    <span className="font-medium">{event.changed_by_name || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status Change */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="text-base">Status Change</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-4">
                    {event.from_status ? (
                      <>
                        <Badge className="bg-gray-100 text-gray-800 text-base px-4 py-2">
                          {event.from_status}
                        </Badge>
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                        <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                          {event.to_status}
                        </Badge>
                      </>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
                        Status set to: {event.to_status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {event.notes && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.notes}</p>
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

