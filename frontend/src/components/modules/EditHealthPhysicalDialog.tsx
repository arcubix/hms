/**
 * Edit Health & Physical Dialog Component
 * Modal for editing H&P records
 * Note: Update API may need to be implemented on backend
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  X,
  ClipboardList,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { EmergencyHealthPhysical } from '../../services/api';

interface EditHealthPhysicalDialogProps {
  hp: EmergencyHealthPhysical;
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function EditHealthPhysicalDialog({ hp, patient, visitId, onClose, onSave }: EditHealthPhysicalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chief_complaint: hp.chief_complaint || '',
    physical_examination: hp.physical_examination || '',
    assessment: hp.assessment || '',
    plan: hp.plan || '',
    examination_date: hp.examination_date ? new Date(hp.examination_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Update functionality is not yet available. Please contact the administrator.');
    onClose();
  };

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
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                Edit H&P Record
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Patient: {patient.name} • UHID: {patient.uhid}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="chief_complaint">Chief Complaint *</Label>
                <Textarea
                  id="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  required
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="physical_examination">Physical Examination *</Label>
                <Textarea
                  id="physical_examination"
                  value={formData.physical_examination}
                  onChange={(e) => setFormData({ ...formData, physical_examination: e.target.value })}
                  rows={5}
                  required
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="assessment">Assessment</Label>
                <Textarea
                  id="assessment"
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                  rows={4}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="plan">Plan</Label>
                <Textarea
                  id="plan"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  rows={4}
                  disabled
                />
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
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

