/**
 * Update Vitals Dialog Component
 * Modal for updating patient vital signs
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  X,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Save
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UpdateVitalsDialogProps {
  patient: any;
  onClose: () => void;
  onSave?: () => void;
}

export function UpdateVitalsDialog({ patient, onClose, onSave }: UpdateVitalsDialogProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Vitals updated successfully!');
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-teal-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              Update Vital Signs
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
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
                        className="w-1/2"
                        required
                      />
                      <span className="flex items-center">/</span>
                      <Input
                        type="number"
                        placeholder="Diastolic"
                        value={formData.bloodPressureDiastolic}
                        onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
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
                />
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Vitals
          </Button>
        </div>
      </div>
    </div>
  );
}
