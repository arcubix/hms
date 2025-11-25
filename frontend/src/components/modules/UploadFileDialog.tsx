/**
 * Upload File Dialog Component
 * Modal for uploading patient files
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Upload,
  File,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface UploadFileDialogProps {
  patient: any;
  visitId: number;
  onClose: () => void;
  onSave?: () => void;
}

export function UploadFileDialog({ patient, visitId, onClose, onSave }: UploadFileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [formData, setFormData] = useState({
    category: 'Other',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitId) {
      toast.error('Visit ID is required');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('file_name', selectedFile.name);
      formDataToSend.append('file_type', selectedFile.type || 'application/octet-stream');
      formDataToSend.append('file_size', selectedFile.size.toString());
      formDataToSend.append('category', formData.category);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      await api.uploadEmergencyPatientFile(visitId, formDataToSend as any);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      setFormData({ category: 'Other', description: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const categories = [
    'Lab Results',
    'Radiology',
    'Forms',
    'Consent',
    'ECG',
    'Medical History',
    'Other'
  ];

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
              <Upload className="w-6 h-6 text-green-600" />
              Upload File
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
                <CardTitle className="text-base">File Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* File Selection */}
                <div className="space-y-2">
                  <Label>Select File *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="flex-1"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    />
                  </div>
                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX</p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter file description or notes..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            disabled={loading || !selectedFile}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
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

