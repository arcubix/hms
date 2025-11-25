/**
 * Edit Note Dialog Component
 * Modal for editing doctor's notes
 * Note: Update API may need to be implemented on backend
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  X,
  FileText,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { EmergencyTreatmentNote } from '../../services/api';

interface EditNoteDialogProps {
  note: EmergencyTreatmentNote;
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function EditNoteDialog({ note, patient, visitId, onClose, onSave }: EditNoteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState(note.note_text || '');

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
            maxWidth: '42rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-teal-50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                Edit Doctor's Note
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
                <Label htmlFor="note_text">Note Text *</Label>
                <Textarea
                  id="note_text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={10}
                  required
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

