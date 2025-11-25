/**
 * Add Note Dialog Component
 * Modal for adding doctor's notes
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  X,
  FileText,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddNoteDialogProps {
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function AddNoteDialog({ patient, visitId, onClose, onSave }: AddNoteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    if (!noteText.trim()) {
      toast.error('Note text is required');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        note_text: noteText.trim(),
        note_type: 'doctor' as const
      };

      await api.addEmergencyNote(visitId, noteData);
      toast.success('Note added successfully!');
      setNoteText('');
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note: ' + (error.message || 'Unknown error'));
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
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-teal-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Add Doctor's Note
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
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                <CardTitle className="text-base">Note Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Note Text */}
                <div className="space-y-2">
                  <Label>Note Text *</Label>
                  <Textarea
                    placeholder="Enter your clinical note, observation, or treatment plan..."
                    rows={10}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    required
                    className="resize-none"
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
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={loading || !noteText.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add Note
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

