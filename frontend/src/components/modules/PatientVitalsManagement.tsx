/**
 * Patient Vitals Management Component
 * Complete vitals monitoring and recording system
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Droplets,
  Wind,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  Plus,
  X,
  Save,
  Download,
  Printer,
  Calendar,
  Clock,
  User,
  LineChart,
  BarChart3,
  CheckCircle,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import type { EmergencyVitalSign, CreateEmergencyVitalSignData } from '../../services/api';

interface PatientVitalsManagementProps {
  patient: any;
  onClose: () => void;
}

interface VitalRecord {
  id: string;
  date: string;
  time: string;
  bp: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painLevel?: number;
  consciousness: string;
  recordedBy: string;
  notes?: string;
}

export function PatientVitalsManagement({ patient, onClose }: PatientVitalsManagementProps) {
  const [showAddVital, setShowAddVital] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Transform API data to component format
  const transformVitalSign = (apiData: EmergencyVitalSign): VitalRecord => {
    // Parse BP string (e.g., "120/80") to get systolic and diastolic
    let systolic = 0;
    let diastolic = 0;
    if (apiData.bp) {
      const bpParts = apiData.bp.split('/');
      if (bpParts.length === 2) {
        systolic = parseInt(bpParts[0]) || 0;
        diastolic = parseInt(bpParts[1]) || 0;
      }
    }

    const recordedDate = new Date(apiData.recorded_at || apiData.created_at);
    const date = recordedDate.toISOString().split('T')[0];
    const time = recordedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    return {
      id: apiData.id.toString(),
      date,
      time,
      bp: apiData.bp || '0/0',
      systolic,
      diastolic,
      pulse: apiData.pulse || 0,
      temperature: apiData.temp || 0,
      spo2: apiData.spo2 || 0,
      respiratoryRate: apiData.resp || 0,
      painLevel: apiData.pain_score,
      consciousness: apiData.consciousness_level || 'Alert',
      recordedBy: apiData.recorded_by_name || 'Unknown',
      notes: apiData.notes
    };
  };

  // Load vitals from database
  const loadVitals = async () => {
    try {
      setLoading(true);
      // Get visit ID from patient - check multiple possible fields
      const vid = patient.id || patient.visitId || patient.emergency_visit_id;
      const visitId = vid ? (typeof vid === 'string' ? parseInt(vid, 10) : vid) : null;
      
      if (!visitId) {
        toast.error('Visit ID not found. Cannot load vitals.');
        setVitalsHistory([]);
        return;
      }

      const apiVitals = await api.getEmergencyVitals(visitId);
      const transformedVitals = apiVitals.map(transformVitalSign);
      // Sort by date/time descending (latest first)
      transformedVitals.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      setVitalsHistory(transformedVitals);
    } catch (error: any) {
      console.error('Error loading vitals:', error);
      toast.error('Failed to load vitals: ' + (error.message || 'Unknown error'));
      setVitalsHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Load vitals on component mount
  useEffect(() => {
    loadVitals();
  }, [patient]);

  // Get latest vitals (first in sorted array)
  const currentVitals = vitalsHistory.length > 0 ? vitalsHistory[0] : null;

  const getVitalStatus = (type: string, value: number) => {
    const ranges: any = {
      systolic: { low: 90, high: 140, critical: 180 },
      diastolic: { low: 60, high: 90, critical: 110 },
      pulse: { low: 60, high: 100, critical: 120 },
      temperature: { low: 97, high: 99, critical: 102 },
      spo2: { low: 95, critical: 90 },
      respiratoryRate: { low: 12, high: 20, critical: 24 }
    };

    const range = ranges[type];
    if (!range) return 'normal';

    if (type === 'spo2') {
      if (value < range.critical) return 'critical';
      if (value < range.low) return 'warning';
      return 'normal';
    }

    if (value >= range.critical || value < range.low) return 'critical';
    if (value > range.high) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Vitals Monitor</h1>
                  <p className="text-sm text-gray-600">{patient.name} • {patient.uhid}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                size="sm"
                onClick={() => setShowAddVital(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vital Signs
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <p className="text-gray-600">Loading vitals...</p>
            </div>
          ) : currentVitals ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('systolic', currentVitals.systolic))}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4" />
                  <p className="text-xs font-medium">Blood Pressure</p>
                </div>
                <p className="text-xl font-bold">{currentVitals.bp}</p>
                <p className="text-xs">mmHg</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('pulse', currentVitals.pulse))}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4" />
                  <p className="text-xs font-medium">Pulse</p>
                </div>
                <p className="text-xl font-bold">{currentVitals.pulse}</p>
                <p className="text-xs">bpm</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('temperature', currentVitals.temperature))}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4" />
                  <p className="text-xs font-medium">Temperature</p>
                </div>
                <p className="text-xl font-bold">{currentVitals.temperature}</p>
                <p className="text-xs">°F</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('spo2', currentVitals.spo2))}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="w-4 h-4" />
                  <p className="text-xs font-medium">SpO2</p>
                </div>
                <p className="text-xl font-bold">{currentVitals.spo2}</p>
                <p className="text-xs">%</p>
              </div>
              <div className={`rounded-lg p-3 border-2 ${getStatusColor(getVitalStatus('respiratoryRate', currentVitals.respiratoryRate))}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="w-4 h-4" />
                  <p className="text-xs font-medium">Resp. Rate</p>
                </div>
                <p className="text-xl font-bold">{currentVitals.respiratoryRate}</p>
                <p className="text-xs">breaths/min</p>
              </div>
              <div className="rounded-lg p-3 border-2 bg-purple-100 text-purple-800 border-purple-300">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4" />
                  <p className="text-xs font-medium">Pain Level</p>
                </div>
                <p className="text-xl font-bold">{currentVitals.painLevel || 0}/10</p>
                <p className="text-xs">Scale</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-gray-600">No vitals recorded yet. Click "Add Vital Signs" to record the first set of vitals.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="current">Current Status</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="trends">Trends & Charts</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Warnings</TabsTrigger>
          </TabsList>

          {/* Current Status Tab */}
          <TabsContent value="current" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <p className="text-gray-600 text-lg">Loading vitals data...</p>
              </div>
            ) : currentVitals ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest Vitals Detail */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Latest Vital Signs
                    </CardTitle>
                    <CardDescription>
                      Recorded on {currentVitals.date} at {currentVitals.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="text-2xl font-bold text-red-700">{currentVitals.bp}</p>
                        <p className="text-xs text-gray-500">Systolic: {currentVitals.systolic} / Diastolic: {currentVitals.diastolic}</p>
                      </div>
                      <Activity className="w-8 h-8 text-red-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="text-sm text-gray-600">Pulse Rate</p>
                        <p className="text-2xl font-bold text-blue-700">{currentVitals.pulse} bpm</p>
                        <p className="text-xs text-gray-500">Normal range: 60-100 bpm</p>
                      </div>
                      <Heart className="w-8 h-8 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="text-2xl font-bold text-orange-700">{currentVitals.temperature}°F</p>
                        <p className="text-xs text-gray-500">Normal range: 97-99°F</p>
                      </div>
                      <Thermometer className="w-8 h-8 text-orange-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm text-gray-600">Oxygen Saturation</p>
                        <p className="text-2xl font-bold text-green-700">{currentVitals.spo2}%</p>
                        <p className="text-xs text-gray-500">Normal range: 95-100%</p>
                      </div>
                      <Droplet className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="text-sm text-gray-600">Respiratory Rate</p>
                        <p className="text-2xl font-bold text-purple-700">{currentVitals.respiratoryRate} /min</p>
                        <p className="text-xs text-gray-500">Normal range: 12-20 breaths/min</p>
                      </div>
                      <Wind className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  {currentVitals.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Clinical Notes</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{currentVitals.notes}</p>
                      </div>
                    </>
                  )}

                  <Separator />
                  <div className="text-xs text-gray-500">
                    <p>Recorded by: <span className="font-medium">{currentVitals.recordedBy}</span></p>
                    <p>Consciousness Level: <Badge variant="outline">{currentVitals.consciousness}</Badge></p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Metrics */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-green-600" />
                    Additional Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {currentVitals.weight && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="text-2xl font-bold text-blue-700">{currentVitals.weight} kg</p>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                  )}

                  {currentVitals.height && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Height</p>
                        <p className="text-2xl font-bold text-green-700">{currentVitals.height} cm</p>
                      </div>
                    </div>
                  )}

                  {currentVitals.bmi && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">BMI (Body Mass Index)</p>
                        <p className="text-2xl font-bold text-purple-700">{currentVitals.bmi}</p>
                      </div>
                      <p className="text-xs text-gray-500">Normal range: 18.5-24.9</p>
                      <Progress value={currentVitals.bmi > 25 ? 80 : 60} className="h-2 mt-2" />
                    </div>
                  )}

                  {currentVitals.painLevel !== undefined && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Pain Level</p>
                        <p className="text-2xl font-bold text-red-700">{currentVitals.painLevel}/10</p>
                      </div>
                      <Progress value={currentVitals.painLevel * 10} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {currentVitals.painLevel === 0 && 'No pain'}
                        {currentVitals.painLevel > 0 && currentVitals.painLevel <= 3 && 'Mild pain'}
                        {currentVitals.painLevel > 3 && currentVitals.painLevel <= 6 && 'Moderate pain'}
                        {currentVitals.painLevel > 6 && 'Severe pain'}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Consciousness Level</span>
                      <Badge className="bg-green-600 text-white">{currentVitals.consciousness}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vitals Recorded</h3>
                  <p className="text-gray-600 mb-4">No vital signs have been recorded for this patient yet.</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAddVital(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record First Vital Signs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs History</CardTitle>
                <CardDescription>Complete record of all vital signs measurements</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                    <p className="text-gray-600">Loading vitals history...</p>
                  </div>
                ) : vitalsHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Available</h3>
                    <p className="text-gray-600 mb-4">No vital signs have been recorded for this patient yet.</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAddVital(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Record First Vital Signs
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>BP</TableHead>
                        <TableHead>Pulse</TableHead>
                        <TableHead>Temp</TableHead>
                        <TableHead>SpO2</TableHead>
                        <TableHead>RR</TableHead>
                        <TableHead>Pain</TableHead>
                        <TableHead>Recorded By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vitalsHistory.map((vital) => (
                        <TableRow key={vital.id}>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{vital.date}</p>
                              <p className="text-gray-600">{vital.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getVitalStatus('systolic', vital.systolic))}>
                              {vital.bp}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getVitalStatus('pulse', vital.pulse))}>
                              {vital.pulse}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getVitalStatus('temperature', vital.temperature))}>
                              {vital.temperature}°F
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getVitalStatus('spo2', vital.spo2))}>
                              {vital.spo2}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getVitalStatus('respiratoryRate', vital.respiratoryRate))}>
                              {vital.respiratoryRate}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{vital.painLevel !== undefined ? `${vital.painLevel}/10` : '-'}</span>
                          </TableCell>
                          <TableCell className="text-sm">{vital.recordedBy}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  Vital Signs Trends
                </CardTitle>
                <CardDescription>Visual representation of vital signs over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                    <p className="text-gray-600">Loading trends data...</p>
                  </div>
                ) : vitalsHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-gray-600 mb-4">Record at least 2 sets of vitals to view trends.</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAddVital(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Record Vital Signs
                    </Button>
                  </div>
                ) : vitalsHistory.length < 2 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Insufficient Data</h3>
                    <p className="text-gray-600 mb-4">Record at least 2 sets of vitals to view trends.</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAddVital(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Record More Vital Signs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Blood Pressure Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                          <BarChart3 className="w-5 h-5" />
                          Blood Pressure Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Systolic BP</p>
                              <div className="space-y-2">
                                {vitalsHistory.slice(0, 10).map((vital, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-20">{vital.date} {vital.time}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                      <div 
                                        className="bg-blue-600 h-4 rounded-full"
                                        style={{ width: `${Math.min((vital.systolic / 200) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">{vital.systolic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Diastolic BP</p>
                              <div className="space-y-2">
                                {vitalsHistory.slice(0, 10).map((vital, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-20">{vital.date} {vital.time}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                      <div 
                                        className="bg-red-600 h-4 rounded-full"
                                        style={{ width: `${Math.min((vital.diastolic / 120) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">{vital.diastolic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {vitalsHistory.length > 1 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm">
                                <strong>Trend:</strong> {
                                  vitalsHistory[0].systolic > vitalsHistory[1].systolic ? (
                                    <span className="text-red-600 flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" /> Increasing
                                    </span>
                                  ) : vitalsHistory[0].systolic < vitalsHistory[1].systolic ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <TrendingDown className="w-4 h-4" /> Decreasing
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">Stable</span>
                                  )
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Heart Rate Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <LineChart className="w-5 h-5" />
                          Heart Rate Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {vitalsHistory.slice(0, 10).map((vital, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-32">{vital.date} {vital.time}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                  <div 
                                    className="bg-red-600 h-6 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${Math.min((vital.pulse / 150) * 100, 100)}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{vital.pulse} bpm</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {vitalsHistory.length > 1 && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg">
                              <p className="text-sm">
                                <strong>Trend:</strong> {
                                  vitalsHistory[0].pulse > vitalsHistory[1].pulse ? (
                                    <span className="text-red-600 flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" /> Increasing ({vitalsHistory[0].pulse - vitalsHistory[1].pulse} bpm)
                                    </span>
                                  ) : vitalsHistory[0].pulse < vitalsHistory[1].pulse ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <TrendingDown className="w-4 h-4" /> Decreasing ({vitalsHistory[1].pulse - vitalsHistory[0].pulse} bpm)
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">Stable</span>
                                  )
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* SpO2 Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <LineChart className="w-5 h-5" />
                          SpO2 Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {vitalsHistory.slice(0, 10).map((vital, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-32">{vital.date} {vital.time}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                  <div 
                                    className="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${(vital.spo2 / 100) * 100}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{vital.spo2}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {vitalsHistory.length > 1 && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm">
                                <strong>Trend:</strong> {
                                  vitalsHistory[0].spo2 > vitalsHistory[1].spo2 ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" /> Improving ({vitalsHistory[0].spo2 - vitalsHistory[1].spo2}%)
                                    </span>
                                  ) : vitalsHistory[0].spo2 < vitalsHistory[1].spo2 ? (
                                    <span className="text-red-600 flex items-center gap-1">
                                      <TrendingDown className="w-4 h-4" /> Declining ({vitalsHistory[1].spo2 - vitalsHistory[0].spo2}%)
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">Stable</span>
                                  )
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Temperature Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <Thermometer className="w-5 h-5" />
                          Temperature Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {vitalsHistory.slice(0, 10).map((vital, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-32">{vital.date} {vital.time}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                  <div 
                                    className="bg-orange-600 h-6 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${Math.min(((vital.temperature - 95) / 10) * 100, 100)}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{vital.temperature}°F</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {vitalsHistory.length > 1 && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                              <p className="text-sm">
                                <strong>Trend:</strong> {
                                  vitalsHistory[0].temperature > vitalsHistory[1].temperature ? (
                                    <span className="text-red-600 flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" /> Rising ({(vitalsHistory[0].temperature - vitalsHistory[1].temperature).toFixed(1)}°F)
                                    </span>
                                  ) : vitalsHistory[0].temperature < vitalsHistory[1].temperature ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <TrendingDown className="w-4 h-4" /> Decreasing ({(vitalsHistory[1].temperature - vitalsHistory[0].temperature).toFixed(1)}°F)
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">Stable</span>
                                  )
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Alerts & Warnings
                </CardTitle>
                <CardDescription>Real-time alerts based on current vital signs</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                    <p className="text-gray-600">Loading alerts...</p>
                  </div>
                ) : !currentVitals ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vitals Available</h3>
                    <p className="text-gray-600 mb-4">Record vital signs to generate alerts.</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAddVital(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Record Vital Signs
                    </Button>
                  </div>
                ) : (() => {
                  // Generate alerts based on current vitals
                  const alerts: Array<{ type: 'critical' | 'warning' | 'info' | 'success'; title: string; message: string; icon: any }> = [];
                  
                  // Check each vital sign
                  const bpStatus = getVitalStatus('systolic', currentVitals.systolic);
                  const diastolicStatus = getVitalStatus('diastolic', currentVitals.diastolic);
                  const pulseStatus = getVitalStatus('pulse', currentVitals.pulse);
                  const tempStatus = getVitalStatus('temperature', currentVitals.temperature);
                  const spo2Status = getVitalStatus('spo2', currentVitals.spo2);
                  const respStatus = getVitalStatus('respiratoryRate', currentVitals.respiratoryRate);
                  
                  // Critical alerts
                  if (bpStatus === 'critical' || diastolicStatus === 'critical') {
                    alerts.push({
                      type: 'critical',
                      title: 'Critical Blood Pressure',
                      message: `Blood pressure is ${currentVitals.bp} mmHg. Immediate medical attention required.`,
                      icon: AlertCircle
                    });
                  }
                  
                  if (spo2Status === 'critical') {
                    alerts.push({
                      type: 'critical',
                      title: 'Critical Oxygen Saturation',
                      message: `SpO2 is ${currentVitals.spo2}%. Patient requires immediate oxygen support.`,
                      icon: AlertCircle
                    });
                  }
                  
                  if (respStatus === 'critical') {
                    alerts.push({
                      type: 'critical',
                      title: 'Critical Respiratory Rate',
                      message: `Respiratory rate is ${currentVitals.respiratoryRate} breaths/min. Monitor closely.`,
                      icon: AlertCircle
                    });
                  }
                  
                  if (currentVitals.consciousness !== 'Alert') {
                    alerts.push({
                      type: 'critical',
                      title: 'Altered Consciousness',
                      message: `Patient consciousness level: ${currentVitals.consciousness}. Requires immediate assessment.`,
                      icon: AlertCircle
                    });
                  }
                  
                  // Warning alerts
                  if (bpStatus === 'warning' || diastolicStatus === 'warning') {
                    alerts.push({
                      type: 'warning',
                      title: 'Elevated Blood Pressure',
                      message: `Blood pressure is ${currentVitals.bp} mmHg. Monitor closely and consider intervention.`,
                      icon: AlertTriangle
                    });
                  }
                  
                  if (pulseStatus === 'warning') {
                    alerts.push({
                      type: 'warning',
                      title: 'Abnormal Heart Rate',
                      message: `Heart rate is ${currentVitals.pulse} bpm. Continue monitoring.`,
                      icon: AlertTriangle
                    });
                  }
                  
                  if (tempStatus === 'warning') {
                    alerts.push({
                      type: 'warning',
                      title: 'Abnormal Temperature',
                      message: `Temperature is ${currentVitals.temperature}°F. Monitor for fever or hypothermia.`,
                      icon: AlertTriangle
                    });
                  }
                  
                  if (spo2Status === 'warning') {
                    alerts.push({
                      type: 'warning',
                      title: 'Low Oxygen Saturation',
                      message: `SpO2 is ${currentVitals.spo2}%. Consider oxygen supplementation.`,
                      icon: AlertTriangle
                    });
                  }
                  
                  if (currentVitals.painLevel && currentVitals.painLevel >= 7) {
                    alerts.push({
                      type: 'warning',
                      title: 'Severe Pain',
                      message: `Pain level is ${currentVitals.painLevel}/10. Consider pain management intervention.`,
                      icon: AlertTriangle
                    });
                  }
                  
                  // Info alerts
                  if (vitalsHistory.length > 0) {
                    const hoursSinceLastVital = (Date.now() - new Date(`${currentVitals.date} ${currentVitals.time}`).getTime()) / (1000 * 60 * 60);
                    if (hoursSinceLastVital >= 4) {
                      alerts.push({
                        type: 'info',
                        title: 'Regular Monitoring Recommended',
                        message: `Last vitals recorded ${hoursSinceLastVital.toFixed(1)} hours ago. Consider recording new vitals.`,
                        icon: Clock
                      });
                    }
                  }
                  
                  // Success message if all vitals are normal
                  if (alerts.filter(a => a.type === 'critical' || a.type === 'warning').length === 0) {
                    alerts.push({
                      type: 'success',
                      title: 'All Vitals Within Normal Range',
                      message: 'Patient\'s vital signs are stable and within acceptable parameters.',
                      icon: CheckCircle
                    });
                  }
                  
                  return (
                    <div className="space-y-3">
                      {alerts.map((alert, idx) => {
                        const AlertIcon = alert.icon;
                        const bgColor = alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                                       alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                       alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                       'bg-green-50 border-green-200';
                        const textColor = alert.type === 'critical' ? 'text-red-900' :
                                         alert.type === 'warning' ? 'text-yellow-900' :
                                         alert.type === 'info' ? 'text-blue-900' :
                                         'text-green-900';
                        const iconColor = alert.type === 'critical' ? 'text-red-600' :
                                         alert.type === 'warning' ? 'text-yellow-600' :
                                         alert.type === 'info' ? 'text-blue-600' :
                                         'text-green-600';
                        const messageColor = alert.type === 'critical' ? 'text-red-700' :
                                            alert.type === 'warning' ? 'text-yellow-700' :
                                            alert.type === 'info' ? 'text-blue-700' :
                                            'text-green-700';
                        
                        return (
                          <div key={idx} className={`p-4 ${bgColor} border rounded-lg flex items-start gap-3`}>
                            <AlertIcon className={`w-5 h-5 ${iconColor} mt-0.5`} />
                            <div>
                              <p className={`font-medium ${textColor}`}>{alert.title}</p>
                              <p className={`text-sm ${messageColor}`}>{alert.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Vital Signs Modal */}
      {showAddVital && (
        <AddVitalSignsDialog
          patient={patient}
          onClose={() => setShowAddVital(false)}
          onSave={() => {
            loadVitals(); // Reload vitals from database
          }}
        />
      )}
    </div>
  );
}

// Add Vital Signs Dialog Component
interface AddVitalSignsDialogProps {
  patient: any;
  onClose: () => void;
  onSave: () => void; // Changed to callback without parameter since we reload from DB
}

function AddVitalSignsDialog({ patient, onClose, onSave }: AddVitalSignsDialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [formData, setFormData] = useState({
    bloodPressureSystolic: '120',
    bloodPressureDiastolic: '80',
    heartRate: '72',
    temperature: '98.6',
    spo2: '98',
    respiratoryRate: '16',
    weight: '70',
    height: '175',
    painScale: '0',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get visit ID from patient
    const vid = patient.id || patient.visitId || patient.emergency_visit_id;
    const visitId = vid ? (typeof vid === 'string' ? parseInt(vid, 10) : vid) : null;
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    setLoading(true);
    try {
      // Format BP as "systolic/diastolic"
      const bp = `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}`;
      
      const vitalsData: CreateEmergencyVitalSignData = {
        bp: bp,
        pulse: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        temp: formData.temperature ? parseFloat(formData.temperature) : undefined,
        spo2: formData.spo2 ? parseInt(formData.spo2) : undefined,
        resp: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
        pain_score: formData.painScale ? parseInt(formData.painScale) : undefined,
        notes: formData.notes || undefined
      };

      await api.recordEmergencyVitals(visitId, vitalsData);
      toast.success('Vital signs recorded successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error recording vitals:', error);
      toast.error('Failed to record vitals: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!document.body) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        onClick={(e) => {
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
          e.stopPropagation();
          e.preventDefault();
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
            maxWidth: '56rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto'
          }}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Add Vital Signs
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient.name} • UHID: {patient.uhid}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            {/* Primary Vital Signs */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="text-base">Primary Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Blood Pressure */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      Blood Pressure (mmHg)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Systolic"
                        value={formData.bloodPressureSystolic}
                        onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-1/2"
                        required
                      />
                      <span className="flex items-center">/</span>
                      <Input
                        type="number"
                        placeholder="Diastolic"
                        value={formData.bloodPressureDiastolic}
                        onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-1/2"
                        required
                      />
                    </div>
                  </div>

                  {/* Heart Rate */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Heart Rate (bpm)
                    </Label>
                    <Input
                      type="number"
                      placeholder="72"
                      value={formData.heartRate}
                      onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      required
                    />
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-600" />
                      Temperature (°F)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      required
                    />
                  </div>

                  {/* SpO2 */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-green-600" />
                      SpO2 (%)
                    </Label>
                    <Input
                      type="number"
                      placeholder="98"
                      value={formData.spo2}
                      onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      required
                    />
                  </div>

                  {/* Respiratory Rate */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-purple-600" />
                      Respiratory Rate (/min)
                    </Label>
                    <Input
                      type="number"
                      placeholder="16"
                      value={formData.respiratoryRate}
                      onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      required
                    />
                  </div>

                  {/* Pain Scale */}
                  <div className="space-y-2">
                    <Label>Pain Scale (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="0"
                      value={formData.painScale}
                      onChange={(e) => setFormData({ ...formData, painScale: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Measurements */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-base">Physical Measurements</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Weight */}
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="text-base">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Enter any additional observations or notes..."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button 
            variant="outline" 
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e as any);
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Vitals
              </>
            )}
          </Button>
        </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}
