/**
 * View Vital Dialog Component
 * Modal for viewing vital sign details
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  X,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Clock,
  User
} from 'lucide-react';
import type { EmergencyVitalSign } from '../../services/api';

interface ViewVitalDialogProps {
  vital: EmergencyVitalSign;
  patient: any;
  onClose: () => void;
}

export function ViewVitalDialog({ vital, patient, onClose }: ViewVitalDialogProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const recordDate = new Date(vital.recorded_at);

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
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-teal-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-600" />
                Vital Sign Details
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
                    <span className="text-gray-600">Recorded At:</span>
                    <span className="font-medium">{recordDate.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Recorded By:</span>
                    <span className="font-medium">{vital.recorded_by_name || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="text-base">Vital Signs</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vital.bp && (
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-gray-600">Blood Pressure</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700">{vital.bp} mmHg</p>
                      </div>
                    )}
                    {vital.pulse !== undefined && vital.pulse !== null && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-600">Pulse Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{vital.pulse} bpm</p>
                      </div>
                    )}
                    {vital.temp !== undefined && vital.temp !== null && (
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="w-5 h-5 text-orange-600" />
                          <span className="text-sm text-gray-600">Temperature</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{vital.temp}°F</p>
                      </div>
                    )}
                    {vital.spo2 !== undefined && vital.spo2 !== null && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-600">SpO2</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{vital.spo2}%</p>
                      </div>
                    )}
                    {vital.resp !== undefined && vital.resp !== null && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Wind className="w-5 h-5 text-purple-600" />
                          <span className="text-sm text-gray-600">Respiratory Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{vital.resp} /min</p>
                      </div>
                    )}
                    {vital.pain_score !== undefined && vital.pain_score !== null && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-gray-600">Pain Score</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">{vital.pain_score}/10</p>
                      </div>
                    )}
                    {vital.consciousness_level && (
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm text-gray-600">Consciousness Level</span>
                        </div>
                        <p className="text-2xl font-bold text-indigo-700">{vital.consciousness_level}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {vital.notes && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{vital.notes}</p>
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

