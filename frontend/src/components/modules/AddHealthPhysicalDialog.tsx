/**
 * Add Health & Physical Dialog Component
 * Modal for adding H&P records
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  X,
  ClipboardList,
  Save,
  Loader2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddHealthPhysicalDialogProps {
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function AddHealthPhysicalDialog({ patient, visitId, onClose, onSave }: AddHealthPhysicalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [formData, setFormData] = useState({
    chief_complaint: '',
    physical_examination: '',
    assessment: '',
    plan: '',
    examination_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    if (!formData.chief_complaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }

    setLoading(true);
    try {
      const hpData = {
        chief_complaint: formData.chief_complaint.trim(),
        physical_examination: formData.physical_examination.trim() || null,
        assessment: formData.assessment.trim() || null,
        plan: formData.plan.trim() || null,
        examination_date: formData.examination_date
      };

      await api.createEmergencyHealthPhysical(visitId, hpData);
      toast.success('H&P record created successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating H&P record:', error);
      toast.error('Failed to create H&P record: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const dialogContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              Add Health & Physical Record
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient.name} • UHID: {patient.uhid}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-base">H&P Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Examination Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Examination Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.examination_date}
                    onChange={(e) => setFormData({ ...formData, examination_date: e.target.value })}
                    required
                  />
                </div>

                {/* Chief Complaint */}
                <div className="space-y-2">
                  <Label>Chief Complaint *</Label>
                  <Textarea
                    placeholder="Enter the patient's chief complaint..."
                    rows={3}
                    value={formData.chief_complaint}
                    onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                    required
                  />
                </div>

                {/* Physical Examination */}
                <div className="space-y-2">
                  <Label>Physical Examination</Label>
                  <Textarea
                    placeholder="Enter physical examination findings..."
                    rows={5}
                    value={formData.physical_examination}
                    onChange={(e) => setFormData({ ...formData, physical_examination: e.target.value })}
                  />
                </div>

                {/* Assessment */}
                <div className="space-y-2">
                  <Label>Assessment</Label>
                  <Textarea
                    placeholder="Enter clinical assessment and diagnosis..."
                    rows={4}
                    value={formData.assessment}
                    onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  />
                </div>

                {/* Plan */}
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Textarea
                    placeholder="Enter treatment plan and recommendations..."
                    rows={4}
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleSubmit}
            disabled={loading || !formData.chief_complaint.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add H&P Record
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

