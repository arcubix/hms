/**
 * Delete Confirmation Dialog Component
 * Confirmation dialog for deleting patient records
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  patient: any;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteConfirmationDialog({ patient, onClose, onDelete }: DeleteConfirmationDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      {/* Dialog */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <Card 
          className="w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-red-900">Delete Patient Record</CardTitle>
                <CardDescription>This action cannot be undone</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900 font-medium mb-2">
              Are you sure you want to delete this patient record?
            </p>
            <div className="text-sm text-red-700 space-y-1">
              <p><span className="font-medium">Patient:</span> {patient.name}</p>
              <p><span className="font-medium">UHID:</span> {patient.uhid}</p>
              <p><span className="font-medium">ER Number:</span> {patient.erNumber}</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-900">
              <span className="font-medium">Warning:</span> Deleting this record will permanently remove all associated medical records, treatment history, and billing information. This action is irreversible.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Record
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}