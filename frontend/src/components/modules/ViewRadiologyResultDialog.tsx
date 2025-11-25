/**
 * View Radiology Result Dialog Component
 * Modal for viewing radiology result details
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  X,
  Scan,
  Clock,
  User,
  Download,
  FileText
} from 'lucide-react';
import type { EmergencyInvestigationOrder } from '../../services/api';

interface ViewRadiologyResultDialogProps {
  order: EmergencyInvestigationOrder;
  patient: any;
  onClose: () => void;
  onDownload?: () => void;
}

export function ViewRadiologyResultDialog({ order, patient, onClose, onDownload }: ViewRadiologyResultDialogProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const orderDate = new Date(order.ordered_at);

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
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Scan className="w-6 h-6 text-purple-600" />
                Radiology Result Details
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
              {/* Order Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Procedure Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Procedure:</span>
                    <span className="font-medium">{order.test_name}</span>
                  </div>
                  {order.test_code && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Procedure Code:</span>
                      <span className="font-medium">{order.test_code}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ordered At:</span>
                    <span className="font-medium">{orderDate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ordered By:</span>
                    <span className="font-medium">{order.ordered_by_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <Badge className={
                      order.priority === 'stat' ? 'bg-red-100 text-red-800' :
                      order.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {order.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {order.result_value && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                    <CardTitle className="text-base">Radiology Report</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Report:</p>
                      <p className="text-lg font-semibold text-green-700 whitespace-pre-wrap">{order.result_value}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {order.notes && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            {order.status === 'completed' && onDownload && (
              <Button variant="outline" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
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

