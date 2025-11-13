import { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Surgery';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 'A001',
    patientName: 'John Smith',
    patientId: 'P001',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    date: '2024-01-15',
    time: '09:00',
    type: 'Consultation',
    status: 'Scheduled',
    notes: 'Chest pain evaluation'
  },
  {
    id: 'A002',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    doctorName: 'Dr. Sarah Williams',
    specialty: 'Pediatrics',
    date: '2024-01-15',
    time: '10:30',
    type: 'Follow-up',
    status: 'In Progress',
    notes: 'Diabetes monitoring'
  },
  {
    id: 'A003',
    patientName: 'Michael Brown',
    patientId: 'P003',
    doctorName: 'Dr. Robert Johnson',
    specialty: 'Orthopedics',
    date: '2024-01-15',
    time: '11:00',
    type: 'Surgery',
    status: 'Scheduled',
    notes: 'Knee replacement surgery'
  },
  {
    id: 'A004',
    patientName: 'Sarah Davis',
    patientId: 'P004',
    doctorName: 'Dr. Emily Davis',
    specialty: 'Dermatology',
    date: '2024-01-15',
    time: '14:00',
    type: 'Consultation',
    status: 'Completed',
    notes: 'Skin condition assessment'
  },
  {
    id: 'A005',
    patientName: 'Robert Wilson',
    patientId: 'P005',
    doctorName: 'Dr. James Wilson',
    specialty: 'Neurology',
    date: '2024-01-15',
    time: '15:30',
    type: 'Emergency',
    status: 'Cancelled',
    notes: 'Severe headache'
  }
];

export function AppointmentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || appointment.status.toLowerCase().replace(' ', '') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">Appointments</h1>
        <Button className="bg-blue-500 hover:bg-blue-600">
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
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {appointment.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-gray-900">{appointment.patientName}</p>
                        <p className="text-xs text-gray-500">ID: {appointment.patientId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{appointment.doctorName}</p>
                      <p className="text-xs text-gray-500">{appointment.specialty}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Calendar className="w-3 h-3" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {appointment.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(appointment.type)}>
                      {appointment.type}
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
                    <p className="text-xs text-gray-600 max-w-32 truncate">
                      {appointment.notes || 'No notes'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {appointment.status === 'Scheduled' && (
                        <>
                          <Button variant="ghost" size="sm" className="p-1 text-green-600 hover:text-green-700">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1 text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="p-1">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">
              {filteredAppointments.filter(a => a.status === 'Scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-yellow-600 mb-1">
              {filteredAppointments.filter(a => a.status === 'In Progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">
              {filteredAppointments.filter(a => a.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">
              {filteredAppointments.filter(a => a.type === 'Emergency').length}
            </div>
            <div className="text-sm text-gray-600">Emergency</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}