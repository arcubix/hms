/**
 * OT (Operation Theatre) Schedules Component
 * Displays and manages Operation Theatre schedules for IPD patients
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { api, OTSchedule, CreateOTScheduleData, OperationTheatre, IPDAdmission } from '../../services/api';
import { SurgeryBilling } from './SurgeryBilling';
import { PreOpChecklist } from './PreOpChecklist';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Scissors,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  X,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  ClipboardCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface OTSchedulesProps {
  admissionId?: number;
}

export function OTSchedules({ admissionId }: OTSchedulesProps) {
  const [schedules, setSchedules] = useState<OTSchedule[]>([]);
  const [operationTheatres, setOperationTheatres] = useState<OperationTheatre[]>([]);
  const [admissions, setAdmissions] = useState<IPDAdmission[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterOT, setFilterOT] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isBillingDialogOpen, setIsBillingDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<OTSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<OTSchedule | null>(null);
  
  // Booking form states
  const [bookingAdmissionId, setBookingAdmissionId] = useState<number | ''>(admissionId || '');
  const [bookingOT, setBookingOT] = useState('');
  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [bookingTime, setBookingTime] = useState('');
  const [bookingProcedureName, setBookingProcedureName] = useState('');
  const [bookingProcedureType, setBookingProcedureType] = useState('');
  const [bookingSurgeon, setBookingSurgeon] = useState('');
  const [bookingAssistantSurgeon, setBookingAssistantSurgeon] = useState('');
  const [bookingAnesthetist, setBookingAnesthetist] = useState('');
  const [bookingAnesthesiaType, setBookingAnesthesiaType] = useState('');
  const [bookingDuration, setBookingDuration] = useState('');
  const [bookingASAScore, setBookingASAScore] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    loadSchedules();
    loadOperationTheatres();
    if (!admissionId) {
      loadAdmissions();
    }
    loadDoctors();
  }, [selectedDate, filterOT, filterStatus, admissionId]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const filters: any = {
        date: format(selectedDate, 'yyyy-MM-dd'),
      };
      if (filterOT !== 'all') filters.ot_number = filterOT;
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (admissionId) filters.admission_id = admissionId;
      
      const data = await api.getOTSchedules(filters);
      setSchedules(data);
    } catch (error: any) {
      toast.error('Failed to load OT schedules: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadOperationTheatres = async () => {
    try {
      const data = await api.getOperationTheatres();
      setOperationTheatres(data);
    } catch (error: any) {
      toast.error('Failed to load operation theatres');
    }
  };

  const loadAdmissions = async () => {
    try {
      const data = await api.getIPDAdmissions({ status: 'admitted' });
      setAdmissions(data);
    } catch (error: any) {
      toast.error('Failed to load admissions');
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (error: any) {
      // Doctors might not be available, continue without them
    }
  };

  const handleBookingSubmit = async () => {
    if (!bookingAdmissionId || !bookingOT || !bookingDate || !bookingTime || !bookingProcedureName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Check availability
      const durationMinutes = parseInt(bookingDuration) || 120;
      const availability = await api.checkOTAvailability(
        bookingOT,
        format(bookingDate, 'yyyy-MM-dd'),
        bookingTime,
        durationMinutes
      );

      if (!availability.available) {
        toast.error('OT not available at this time. Please choose another time slot.');
        if (availability.alternative_slots.length > 0) {
          toast.info(`Alternative slots available: ${availability.alternative_slots.map(s => s.time).join(', ')}`);
        }
        return;
      }

      const scheduleData: CreateOTScheduleData = {
        admission_id: Number(bookingAdmissionId),
        ot_number: bookingOT,
        scheduled_date: format(bookingDate, 'yyyy-MM-dd'),
        scheduled_time: bookingTime,
        procedure_name: bookingProcedureName,
        procedure_type: bookingProcedureType || undefined,
        surgeon_user_id: bookingSurgeon ? Number(bookingSurgeon) : undefined,
        assistant_surgeon_user_id: bookingAssistantSurgeon ? Number(bookingAssistantSurgeon) : undefined,
        anesthetist_user_id: bookingAnesthetist ? Number(bookingAnesthetist) : undefined,
        anesthesia_type: bookingAnesthesiaType || undefined,
        estimated_duration_minutes: durationMinutes,
        asa_score: bookingASAScore ? Number(bookingASAScore) : undefined,
        notes: bookingNotes || undefined,
      };

      if (editingSchedule) {
        await api.updateOTSchedule(editingSchedule.id, scheduleData);
        toast.success('OT schedule updated successfully');
      } else {
        await api.createOTSchedule(scheduleData);
        toast.success('OT schedule created successfully');
      }

      setIsBookingDialogOpen(false);
      resetBookingForm();
      loadSchedules();
    } catch (error: any) {
      toast.error('Failed to save OT schedule: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetBookingForm = () => {
    setBookingAdmissionId(admissionId || '');
    setBookingOT('');
    setBookingDate(new Date());
    setBookingTime('');
    setBookingProcedureName('');
    setBookingProcedureType('');
    setBookingSurgeon('');
    setBookingAssistantSurgeon('');
    setBookingAnesthetist('');
    setBookingAnesthesiaType('');
    setBookingDuration('');
    setBookingASAScore('');
    setBookingNotes('');
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: OTSchedule) => {
    setEditingSchedule(schedule);
    setBookingAdmissionId(schedule.admission_id);
    setBookingOT(schedule.ot_number);
    setBookingDate(new Date(schedule.scheduled_date));
    setBookingTime(schedule.scheduled_time);
    setBookingProcedureName(schedule.procedure_name);
    setBookingProcedureType(schedule.procedure_type || '');
    setBookingSurgeon(schedule.surgeon_user_id?.toString() || '');
    setBookingAssistantSurgeon(schedule.assistant_surgeon_user_id?.toString() || '');
    setBookingAnesthetist(schedule.anesthetist_user_id?.toString() || '');
    setBookingAnesthesiaType(schedule.anesthesia_type || '');
    setBookingDuration(schedule.estimated_duration_minutes?.toString() || '');
    setBookingASAScore(schedule.asa_score?.toString() || '');
    setBookingNotes(schedule.notes || '');
    setIsBookingDialogOpen(true);
  };

  const handleStartSurgery = async (schedule: OTSchedule) => {
    if (!confirm(`Start surgery: ${schedule.procedure_name}?`)) return;

    try {
      await api.startSurgery(schedule.id);
      toast.success('Surgery started');
      loadSchedules();
    } catch (error: any) {
      toast.error('Failed to start surgery: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCompleteSurgery = async (schedule: OTSchedule) => {
    const actualDuration = prompt('Enter actual duration in minutes:');
    const complications = prompt('Any complications? (Leave empty if none):');
    
    if (actualDuration === null) return;

    try {
      await api.completeSurgery(
        schedule.id,
        undefined,
        parseInt(actualDuration),
        complications || undefined
      );
      toast.success('Surgery completed');
      loadSchedules();
    } catch (error: any) {
      toast.error('Failed to complete surgery: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCancel = async (schedule: OTSchedule) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;

    try {
      await api.cancelSurgery(schedule.id, reason);
      toast.success('Surgery cancelled');
      loadSchedules();
    } catch (error: any) {
      toast.error('Failed to cancel surgery: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'Scheduled': { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
      'In Progress': { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
      'Completed': { label: 'Completed', className: 'bg-green-100 text-green-800' },
      'Cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
      'Postponed': { label: 'Postponed', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        schedule.procedure_name?.toLowerCase().includes(query) ||
        schedule.patient_name?.toLowerCase().includes(query) ||
        schedule.patient_code?.toLowerCase().includes(query) ||
        schedule.surgeon_name?.toLowerCase().includes(query) ||
        schedule.ot_number?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const selectedAdmission = admissions.find(a => a.id === Number(bookingAdmissionId));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OT Schedules</h2>
          <p className="text-gray-600">Manage Operation Theatre schedules</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsBookingDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Book Surgery
          </Button>
          <Button variant="outline" onClick={loadSchedules}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>OT</Label>
              <Select value={filterOT} onValueChange={setFilterOT}>
                <SelectTrigger>
                  <SelectValue placeholder="All OTs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All OTs</SelectItem>
                  {operationTheatres.map(ot => (
                    <SelectItem key={ot.id} value={ot.ot_number}>{ot.ot_name || ot.ot_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schedules for {format(selectedDate, 'PPP')}</CardTitle>
          <CardDescription>{filteredSchedules.length} surgery(s) scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No schedules found</div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>OT</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Surgeon</TableHead>
                    <TableHead>Anesthetist</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {schedule.scheduled_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.ot_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.patient_name}</div>
                          <div className="text-sm text-gray-500">{schedule.ipd_number || schedule.patient_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.procedure_name}</div>
                          {schedule.procedure_type && (
                            <div className="text-sm text-gray-500">{schedule.procedure_type}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.surgeon_name || '-'}
                        {schedule.assistant_surgeon_name && (
                          <div className="text-sm text-gray-500">Asst: {schedule.assistant_surgeon_name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.anesthetist_name || '-'}
                        {schedule.anesthesia_type && (
                          <div className="text-sm text-gray-500">{schedule.anesthesia_type}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.actual_duration_minutes 
                          ? `${schedule.actual_duration_minutes} min`
                          : schedule.estimated_duration_minutes 
                          ? `~${schedule.estimated_duration_minutes} min`
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {schedule.status === 'Scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartSurgery(schedule)}
                                title="Start Surgery"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(schedule)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(schedule)}
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {schedule.status === 'In Progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteSurgery(schedule)}
                              title="Complete Surgery"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          )}
                          {schedule.status === 'Completed' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setIsDetailsDialogOpen(true);
                                }}
                                title="View Details"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setIsBillingDialogOpen(true);
                                }}
                                title="Billing"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {schedule.status === 'Scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setIsChecklistDialogOpen(true);
                              }}
                              title="Pre-Op Checklist"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={(open) => {
        setIsBookingDialogOpen(open);
        if (!open) resetBookingForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit OT Schedule' : 'Book Surgery'}</DialogTitle>
            <DialogDescription>
              Schedule a surgery in Operation Theatre
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Admission *</Label>
              <Select
                value={bookingAdmissionId ? bookingAdmissionId.toString() : 'none'}
                onValueChange={(value) => setBookingAdmissionId(value === 'none' ? '' : Number(value))}
                disabled={!!admissionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select admission" />
                </SelectTrigger>
                <SelectContent>
                  {admissions.map(admission => (
                    <SelectItem key={admission.id} value={admission.id.toString()}>
                      {admission.ipd_number} - {admission.patient_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>OT Number *</Label>
              <Select value={bookingOT || 'none'} onValueChange={(value) => setBookingOT(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select OT" />
                </SelectTrigger>
                <SelectContent>
                  {operationTheatres.filter(ot => ot.status === 'active').map(ot => (
                    <SelectItem key={ot.id} value={ot.ot_number}>
                      {ot.ot_name || ot.ot_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate ? format(bookingDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={bookingDate} onSelect={(date) => date && setBookingDate(date)} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label>Procedure Name *</Label>
              <Input
                value={bookingProcedureName}
                onChange={(e) => setBookingProcedureName(e.target.value)}
                placeholder="e.g., Total Knee Replacement"
              />
            </div>

            <div>
              <Label>Procedure Type</Label>
              <Input
                value={bookingProcedureType}
                onChange={(e) => setBookingProcedureType(e.target.value)}
                placeholder="e.g., Orthopedic"
              />
            </div>

            <div>
              <Label>Estimated Duration (minutes)</Label>
              <Input
                type="number"
                value={bookingDuration}
                onChange={(e) => setBookingDuration(e.target.value)}
                placeholder="120"
              />
            </div>

            <div>
              <Label>Surgeon</Label>
              <Select value={bookingSurgeon || 'none'} onValueChange={(value) => setBookingSurgeon(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select surgeon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assistant Surgeon</Label>
              <Select value={bookingAssistantSurgeon || 'none'} onValueChange={(value) => setBookingAssistantSurgeon(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assistant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Anesthetist</Label>
              <Select value={bookingAnesthetist || 'none'} onValueChange={(value) => setBookingAnesthetist(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthetist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Anesthesia Type</Label>
              <Select value={bookingAnesthesiaType || 'none'} onValueChange={(value) => setBookingAnesthesiaType(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Spinal">Spinal</SelectItem>
                  <SelectItem value="Epidural">Epidural</SelectItem>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ASA Score</Label>
              <Select value={bookingASAScore || 'none'} onValueChange={(value) => setBookingASAScore(value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1">1 - Normal healthy patient</SelectItem>
                  <SelectItem value="2">2 - Mild systemic disease</SelectItem>
                  <SelectItem value="3">3 - Severe systemic disease</SelectItem>
                  <SelectItem value="4">4 - Severe systemic disease that is a constant threat</SelectItem>
                  <SelectItem value="5">5 - Moribund patient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookingSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingSchedule ? 'Update' : 'Book Surgery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <DialogTitle>Surgery Details</DialogTitle>
                <DialogDescription>
                  {selectedSchedule.procedure_name} - {selectedSchedule.ot_number}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Patient</Label>
                    <div className="font-medium">{selectedSchedule.patient_name}</div>
                    <div className="text-sm text-gray-500">{selectedSchedule.ipd_number || selectedSchedule.patient_code}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div>{getStatusBadge(selectedSchedule.status)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Scheduled Date & Time</Label>
                    <div className="font-medium">
                      {format(new Date(selectedSchedule.scheduled_date), 'PPP')} at {selectedSchedule.scheduled_time}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">OT Number</Label>
                    <div className="font-medium">{selectedSchedule.ot_number}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Surgeon</Label>
                    <div className="font-medium">{selectedSchedule.surgeon_name || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Assistant Surgeon</Label>
                    <div className="font-medium">{selectedSchedule.assistant_surgeon_name || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Anesthetist</Label>
                    <div className="font-medium">{selectedSchedule.anesthetist_name || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Anesthesia Type</Label>
                    <div className="font-medium">{selectedSchedule.anesthesia_type || '-'}</div>
                  </div>
                  {selectedSchedule.start_time && (
                    <div>
                      <Label className="text-gray-500">Start Time</Label>
                      <div className="font-medium">{selectedSchedule.start_time}</div>
                    </div>
                  )}
                  {selectedSchedule.end_time && (
                    <div>
                      <Label className="text-gray-500">End Time</Label>
                      <div className="font-medium">{selectedSchedule.end_time}</div>
                    </div>
                  )}
                  {selectedSchedule.actual_duration_minutes && (
                    <div>
                      <Label className="text-gray-500">Actual Duration</Label>
                      <div className="font-medium">{selectedSchedule.actual_duration_minutes} minutes</div>
                    </div>
                  )}
                  {selectedSchedule.complications && (
                    <div className="col-span-2">
                      <Label className="text-gray-500">Complications</Label>
                      <div className="text-red-600">{selectedSchedule.complications}</div>
                    </div>
                  )}
                  {selectedSchedule.notes && (
                    <div className="col-span-2">
                      <Label className="text-gray-500">Notes</Label>
                      <div>{selectedSchedule.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog open={isBillingDialogOpen} onOpenChange={setIsBillingDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <DialogTitle>Surgery Billing</DialogTitle>
                <DialogDescription>
                  {selectedSchedule.procedure_name} - {selectedSchedule.ot_number}
                </DialogDescription>
              </DialogHeader>
              <SurgeryBilling
                otScheduleId={selectedSchedule.id}
                otSchedule={selectedSchedule}
                onClose={() => setIsBillingDialogOpen(false)}
                onSuccess={() => {
                  setIsBillingDialogOpen(false);
                  loadSchedules();
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pre-Op Checklist Dialog */}
      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <DialogTitle>Pre-Operative Checklist</DialogTitle>
                <DialogDescription>
                  {selectedSchedule.procedure_name} - {selectedSchedule.ot_number}
                </DialogDescription>
              </DialogHeader>
              <PreOpChecklist
                otScheduleId={selectedSchedule.id}
                onSuccess={() => {
                  setIsChecklistDialogOpen(false);
                  loadSchedules();
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

