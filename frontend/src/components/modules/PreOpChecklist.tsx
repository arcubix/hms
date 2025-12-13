/**
 * Pre-Operative Checklist Component
 * Manages pre-operative checklist for OT schedules
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { api } from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  Save,
  ClipboardCheck,
  AlertCircle,
} from 'lucide-react';

interface PreOpChecklistProps {
  otScheduleId: number;
  onSuccess?: () => void;
}

interface PreOpChecklist {
  id?: number;
  ot_schedule_id: number;
  npo_status: boolean;
  pre_op_medications_given: boolean;
  blood_work_completed: boolean;
  imaging_completed: boolean;
  consent_signed: boolean;
  patient_identified: boolean;
  instruments_ready: boolean;
  consumables_available: boolean;
  equipment_tested: boolean;
  implants_available: boolean;
  team_briefed: boolean;
  anesthesia_ready: boolean;
  checklist_completed: boolean;
  completed_by_user_id?: number;
  completed_by_name?: string;
  completed_at?: string;
  notes?: string;
}

export function PreOpChecklist({ otScheduleId, onSuccess }: PreOpChecklistProps) {
  const [checklist, setChecklist] = useState<PreOpChecklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadChecklist();
  }, [otScheduleId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      const data = await api.getPreOpChecklist(otScheduleId);
      setChecklist(data);
      setNotes(data.notes || '');
    } catch (error: any) {
      toast.error('Failed to load checklist: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field: keyof PreOpChecklist, checked: boolean) => {
    if (!checklist) return;
    
    setChecklist({
      ...checklist,
      [field]: checked,
    });
  };

  const handleSave = async () => {
    if (!checklist) return;

    try {
      setSaving(true);
      
      const checklistData = {
        ...checklist,
        notes: notes,
      };

      await api.updatePreOpChecklist(otScheduleId, checklistData);
      toast.success('Pre-op checklist updated successfully');
      
      await loadChecklist();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to save checklist: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!checklist) return;

    // Check if all required items are completed
    const requiredItems = [
      'npo_status',
      'blood_work_completed',
      'imaging_completed',
      'consent_signed',
      'patient_identified',
      'instruments_ready',
      'consumables_available',
      'equipment_tested',
      'team_briefed',
      'anesthesia_ready',
    ];

    const incompleteItems = requiredItems.filter(item => !checklist[item as keyof PreOpChecklist]);

    if (incompleteItems.length > 0) {
      toast.error('Please complete all required checklist items before marking as complete');
      return;
    }

    try {
      setSaving(true);
      
      const checklistData = {
        ...checklist,
        checklist_completed: true,
        notes: notes,
      };

      await api.updatePreOpChecklist(otScheduleId, checklistData);
      toast.success('Pre-op checklist completed successfully');
      
      await loadChecklist();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Failed to complete checklist: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!checklist) return 0;
    
    const items = [
      checklist.npo_status,
      checklist.pre_op_medications_given,
      checklist.blood_work_completed,
      checklist.imaging_completed,
      checklist.consent_signed,
      checklist.patient_identified,
      checklist.instruments_ready,
      checklist.consumables_available,
      checklist.equipment_tested,
      checklist.implants_available,
      checklist.team_briefed,
      checklist.anesthesia_ready,
    ];
    
    const completed = items.filter(Boolean).length;
    return Math.round((completed / items.length) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading checklist...</div>
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">Checklist not found</div>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pre-Operative Checklist</CardTitle>
            <CardDescription>
              Verify patient and equipment readiness before surgery
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {checklist.checklist_completed ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="outline">
                {completionPercentage}% Complete
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Patient Preparation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Patient Preparation</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="npo_status"
                  checked={checklist.npo_status}
                  onCheckedChange={(checked) => handleCheckboxChange('npo_status', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="npo_status" className="cursor-pointer">
                  NPO (Nothing Per Oral) status confirmed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pre_op_medications_given"
                  checked={checklist.pre_op_medications_given}
                  onCheckedChange={(checked) => handleCheckboxChange('pre_op_medications_given', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="pre_op_medications_given" className="cursor-pointer">
                  Pre-op medications given
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="blood_work_completed"
                  checked={checklist.blood_work_completed}
                  onCheckedChange={(checked) => handleCheckboxChange('blood_work_completed', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="blood_work_completed" className="cursor-pointer">
                  Blood work completed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="imaging_completed"
                  checked={checklist.imaging_completed}
                  onCheckedChange={(checked) => handleCheckboxChange('imaging_completed', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="imaging_completed" className="cursor-pointer">
                  Imaging studies completed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent_signed"
                  checked={checklist.consent_signed}
                  onCheckedChange={(checked) => handleCheckboxChange('consent_signed', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="consent_signed" className="cursor-pointer">
                  Consent forms signed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="patient_identified"
                  checked={checklist.patient_identified}
                  onCheckedChange={(checked) => handleCheckboxChange('patient_identified', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="patient_identified" className="cursor-pointer">
                  Patient identification verified
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment Preparation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Equipment Preparation</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instruments_ready"
                  checked={checklist.instruments_ready}
                  onCheckedChange={(checked) => handleCheckboxChange('instruments_ready', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="instruments_ready" className="cursor-pointer">
                  Surgical instruments ready
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consumables_available"
                  checked={checklist.consumables_available}
                  onCheckedChange={(checked) => handleCheckboxChange('consumables_available', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="consumables_available" className="cursor-pointer">
                  Consumables available
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="equipment_tested"
                  checked={checklist.equipment_tested}
                  onCheckedChange={(checked) => handleCheckboxChange('equipment_tested', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="equipment_tested" className="cursor-pointer">
                  Equipment tested and functional
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="implants_available"
                  checked={checklist.implants_available}
                  onCheckedChange={(checked) => handleCheckboxChange('implants_available', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="implants_available" className="cursor-pointer">
                  Implants available (if applicable)
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Team Preparation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Team Preparation</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="team_briefed"
                  checked={checklist.team_briefed}
                  onCheckedChange={(checked) => handleCheckboxChange('team_briefed', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="team_briefed" className="cursor-pointer">
                  Surgical team briefed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anesthesia_ready"
                  checked={checklist.anesthesia_ready}
                  onCheckedChange={(checked) => handleCheckboxChange('anesthesia_ready', checked as boolean)}
                  disabled={checklist.checklist_completed}
                />
                <Label htmlFor="anesthesia_ready" className="cursor-pointer">
                  Anesthesia ready
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              disabled={checklist.checklist_completed}
            />
          </div>

          {/* Completion Info */}
          {checklist.checklist_completed && checklist.completed_at && (
            <div className="bg-green-50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">
                  Checklist completed {new Date(checklist.completed_at).toLocaleString()}
                  {checklist.completed_by_name && ` by ${checklist.completed_by_name}`}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {!checklist.checklist_completed && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Checklist'}
              </Button>
              <Button onClick={handleComplete} disabled={saving} variant="default">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

