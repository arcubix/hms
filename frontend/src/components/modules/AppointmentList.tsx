import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Loader2,
  Edit,
  CalendarClock
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { api, Appointment as ApiAppointment } from '../../services/api';
import { ViewEditAppointmentPage } from '../pages/ViewEditAppointmentPage';
import { RescheduleAppointmentPage } from '../pages/RescheduleAppointmentPage';

interface AppointmentListProps {
  onAddAppointment?: () => void;
  onViewAppointment?: (appointmentId: string) => void;
  onEditAppointment?: (appointmentId: string) => void;
}

export function AppointmentList({ onAddAppointment, onViewAppointment, onEditAppointment }: AppointmentListProps = {}) {
  const [view, setView] = useState<'list' | 'view' | 'reschedule'>('list');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');
  
  // Confirmation panel
  const [confirmPanel, setConfirmPanel] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    appointmentId: string | null;
    appointmentRowId: number | null;
  }>({
    open: false,
    type: null,
    appointmentId: null,
    appointmentRowId: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Load appointments on mount and when filters change
  useEffect(() => {
    loadAppointments();
  }, [filterDate, filterStatus]);


  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {};
      
      // Apply status filter
      if (filterStatus !== 'all') {
        // Convert filterStatus to match API status values
        const statusMap: { [key: string]: string } = {
          'scheduled': 'Scheduled',
          'inprogress': 'In Progress',
          'completed': 'Completed',
          'cancelled': 'Cancelled',
          'noshow': 'No Show',
          'confirmed': 'Confirmed'
        };
        filters.status = statusMap[filterStatus] || filterStatus;
      }

      // Apply date filter
      if (filterDate === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters.date = formatDateLocal(today);
      } else if (filterDate === 'week') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        filters.date_from = formatDateLocal(today);
        filters.date_to = formatDateLocal(weekEnd);
      }

      const data = await api.getAppointments(filters);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments by search term (client-side filtering)
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      (appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.appointment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.patient_id_string?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Format date from datetime string
  const formatDate = (datetime: string): string => {
    try {
      const date = new Date(datetime);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return datetime.split(' ')[0];
    }
  };

  // Format time from datetime string
  const formatTime = (datetime: string): string => {
    try {
      const date = new Date(datetime);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      const timePart = datetime.split(' ')[1];
      if (timePart) {
        const [hours, minutes] = timePart.split(':');
        const hour = parseInt(hours, 10);
        const hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      }
      return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No Show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-100 text-red-800';
      case 'Surgery':
        return 'bg-purple-100 text-purple-800';
      case 'Follow-up':
        return 'bg-green-100 text-green-800';
      case 'Check-up':
        return 'bg-blue-100 text-blue-800';
      case 'Consultation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  // Handle approval
  const handleApprove = (appointmentId: string, appointmentRowId: number) => {
    setConfirmPanel({
      open: true,
      type: 'approve',
      appointmentId,
      appointmentRowId,
    });
  };

  // Handle rejection
  const handleReject = (appointmentId: string, appointmentRowId: number) => {
    setConfirmPanel({
      open: true,
      type: 'reject',
      appointmentId,
      appointmentRowId,
    });
  };

  // Handle reschedule
  const handleReschedule = (appointmentId: string) => {
    console.log('Reschedule clicked for appointment:', appointmentId);
    setSelectedAppointmentId(appointmentId);
    setView('reschedule');
  };

  // Handle view/edit
  const handleViewEdit = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setView('view');
  };

  // Confirm action (approve/reject)
  const handleConfirmAction = async () => {
    if (!confirmPanel.appointmentId || !confirmPanel.type) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const newStatus = confirmPanel.type === 'approve' ? 'Confirmed' : 'Cancelled';
      
      await api.updateAppointmentStatus(confirmPanel.appointmentId, newStatus);
      
      // Reload appointments
      await loadAppointments();
      
      setConfirmPanel({ open: false, type: null, appointmentId: null, appointmentRowId: null });
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      setError(err.message || `Failed to ${confirmPanel.type === 'approve' ? 'approve' : 'reject'} appointment`);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel action
  const handleCancelAction = () => {
    setConfirmPanel({ open: false, type: null, appointmentId: null, appointmentRowId: null });
  };

  // Handle back from view/reschedule
  const handleBackToList = () => {
    setView('list');
    setSelectedAppointmentId(null);
    loadAppointments(); // Reload to get updated data
  };

  // If viewing/editing appointment
  if (view === 'view' && selectedAppointmentId) {
    return (
      <ViewEditAppointmentPage
        appointmentId={selectedAppointmentId}
        onBack={handleBackToList}
        onSuccess={handleBackToList}
      />
    );
  }

  // If rescheduling appointment
  if (view === 'reschedule' && selectedAppointmentId) {
    return (
      <RescheduleAppointmentPage
        appointmentId={selectedAppointmentId}
        onBack={handleBackToList}
        onSuccess={handleBackToList}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">Appointments</h1>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => onAddAppointment?.()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search appointments by patient, doctor, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterDate === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDate('today')}
                className={filterDate === 'today' ? 'bg-blue-500' : ''}
              >
                Today
              </Button>
              <Button
                variant={filterDate === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDate('week')}
                className={filterDate === 'week' ? 'bg-blue-500' : ''}
              >
                This Week
              </Button>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-gray-600' : ''}
              >
                All Status
              </Button>
              <Button
                variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('scheduled')}
                className={filterStatus === 'scheduled' ? 'bg-blue-500' : ''}
              >
                Scheduled
              </Button>
              <Button
                variant={filterStatus === 'inprogress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inprogress')}
                className={filterStatus === 'inprogress' ? 'bg-yellow-500' : ''}
              >
                In Progress
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Appointments ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-muted-foreground">Loading appointments...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                    <p className="text-red-600 mb-2">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadAppointments}>
                      Try Again
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground font-medium">No appointments found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm || filterStatus !== 'all' || filterDate !== 'today'
                        ? 'Try adjusting your filters'
                        : 'Schedule an appointment to get started'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => {
                  const patientName = appointment.patient_name || `Patient #${appointment.patient_id}`;
                  const patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const doctorName = appointment.doctor_name || 'Unknown Doctor';
                  const showConfirmPanel = confirmPanel.open && confirmPanel.appointmentRowId === appointment.id;
                  
                  return (
                    <>
                      <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {patientInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">{patientName}</p>
                            <p className="text-xs text-gray-500">
                              ID: {appointment.patient_id_string || `P${appointment.patient_id}`}
                            </p>
                            {appointment.patient_phone && (
                              <p className="text-xs text-gray-400">{appointment.patient_phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900 font-medium">{doctorName}</p>
                          {appointment.specialty && (
                            <p className="text-xs text-gray-500">{appointment.specialty}</p>
                          )}
                          {appointment.doctor_doctor_id_string && (
                            <p className="text-xs text-gray-400">{appointment.doctor_doctor_id_string}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Calendar className="w-3 h-3" />
                            {formatDate(appointment.appointment_date)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            {formatTime(appointment.appointment_date)}
                          </div>
                          {appointment.appointment_number && (
                            <div className="text-xs text-gray-400 mt-1">
                              #{appointment.appointment_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(appointment.appointment_type)}>
                          {appointment.appointment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(appointment.status)}
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-gray-600 max-w-32 truncate" title={appointment.notes || appointment.reason || ''}>
                          {appointment.notes || appointment.reason || 'No notes'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {(appointment.status === 'Scheduled' || appointment.status === 'Confirmed') && (
                            <>
                              {appointment.status === 'Scheduled' && (
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 text-green-600 hover:text-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(appointment.id.toString(), appointment.id);
                                  }}
                                  title="Approve Appointment"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                className="p-1 text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(appointment.id.toString(), appointment.id);
                                }}
                                title="Reject/Cancel Appointment"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                className="p-1 text-blue-600 hover:text-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReschedule(appointment.id.toString());
                                }}
                                title="Reschedule Appointment"
                              >
                                <CalendarClock className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewEdit(appointment.id.toString());
                            }}
                            title="View/Edit Appointment"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      </TableRow>
                      {showConfirmPanel && (
                        <TableRow key={`confirm-${appointment.id}`}>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {confirmPanel.type === 'approve' ? 'Approve Appointment' : 'Reject Appointment'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {confirmPanel.type === 'approve'
                                      ? 'Are you sure you want to approve this appointment? The appointment will be confirmed.'
                                      : 'Are you sure you want to reject/cancel this appointment? This action cannot be undone.'}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelAction}
                                    disabled={actionLoading}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading}
                                    className={confirmPanel.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                                  >
                                    {actionLoading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      confirmPanel.type === 'approve' ? 'Approve' : 'Reject'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1 font-bold">
              {filteredAppointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-yellow-600 mb-1 font-bold">
              {filteredAppointments.filter(a => a.status === 'In Progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1 font-bold">
              {filteredAppointments.filter(a => a.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1 font-bold">
              {filteredAppointments.filter(a => a.appointment_type === 'Emergency').length}
            </div>
            <div className="text-sm text-gray-600">Emergency</div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}