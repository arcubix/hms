/**
 * Add Timeline Event Dialog Component
 * Modal for adding status change events to timeline
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Clock,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddTimelineEventDialogProps {
  patient: any;
  visitId: number;
  currentStatus?: string;
  onClose: () => void;
  onSave?: () => void;
}

export function AddTimelineEventDialog({ patient, visitId, currentStatus, onClose, onSave }: AddTimelineEventDialogProps) {
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
    status: currentStatus || 'registered',
    notes: ''
  });

  const statusOptions = [
    { value: 'registered', label: 'Registered' },
    { value: 'triaged', label: 'Triaged' },
    { value: 'in-treatment', label: 'In Treatment' },
    { value: 'awaiting-disposition', label: 'Awaiting Disposition' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    if (formData.status === currentStatus) {
      toast.error('Please select a different status');
      return;
    }

    setLoading(true);
    try {
      await api.updateEmergencyStatus(visitId.toString(), formData.status as any);
      toast.success('Status updated successfully!');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status: ' + (error.message || 'Unknown error'));
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
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-600" />
              Add Timeline Event
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient.name} • UHID: {patient.uhid}
              {currentStatus && ` • Current Status: ${currentStatus}`}
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
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardTitle className="text-base">Status Change</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label>New Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          disabled={option.value === currentStatus}
                        >
                          {option.label}
                          {option.value === currentStatus && ' (Current)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Enter notes about this status change..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSubmit}
            disabled={loading || formData.status === currentStatus}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Status
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

