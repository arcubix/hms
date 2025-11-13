import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Stethoscope,
  Activity,
  Video,
  Pill,
  FlaskConical,
  CheckCircle,
  AlertCircle,
  Ambulance
} from 'lucide-react';
import { User } from '../../App';
import { EmergencyManagement } from '../modules/EmergencyManagement';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Ambulance className="w-5 h-5" />, label: 'Emergency', id: 'emergency', badge: '3' },
  { icon: <Calendar className="w-5 h-5" />, label: 'My Schedule', id: 'schedule', badge: '8' },
  { icon: <Users className="w-5 h-5" />, label: 'My Patients', id: 'patients' },
  { icon: <Video className="w-5 h-5" />, label: 'Telemedicine', id: 'telemedicine' },
  { icon: <FileText className="w-5 h-5" />, label: 'Patient Records', id: 'records' },
  { icon: <Pill className="w-5 h-5" />, label: 'Prescriptions', id: 'prescriptions' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Results', id: 'lab' }
];

const todaysAppointments = [
  {
    id: '1',
    patientName: 'John Smith',
    time: '09:00 AM',
    type: 'Follow-up',
    condition: 'Hypertension',
    status: 'completed'
  },
  {
    id: '2',
    patientName: 'Emily Johnson',
    time: '10:30 AM',
    type: 'Consultation',
    condition: 'Diabetes',
    status: 'in-progress'
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    time: '11:00 AM',
    type: 'Check-up',
    condition: 'Heart Disease',
    status: 'scheduled'
  },
  {
    id: '4',
    patientName: 'Sarah Davis',
    time: '02:00 PM',
    type: 'Consultation',
    condition: 'Allergies',
    status: 'scheduled'
  }
];

const recentPatients = [
  {
    id: 'P001',
    name: 'Alice Johnson',
    lastVisit: '2024-01-14',
    condition: 'Migraine',
    priority: 'high'
  },
  {
    id: 'P002',
    name: 'Robert Wilson',
    lastVisit: '2024-01-13',
    condition: 'Diabetes',
    priority: 'medium'
  },
  {
    id: 'P003',
    name: 'Maria Garcia',
    lastVisit: '2024-01-12',
    condition: 'Hypertension',
    priority: 'low'
  }
];

export function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'emergency':
        return <EmergencyManagement />;
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Today's Appointments"
                value="8"
                icon={<Calendar className="w-6 h-6" />}
                trend={{ value: 2, isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Total Patients"
                value="245"
                icon={<Users className="w-6 h-6" />}
                trend={{ value: 5, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Pending Results"
                value="12"
                icon={<FlaskConical className="w-6 h-6" />}
                color="yellow"
              />
              <StatsCard
                title="Prescriptions"
                value="34"
                icon={<Pill className="w-6 h-6" />}
                trend={{ value: 8, isPositive: true }}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Today's Schedule
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm text-gray-900">{appointment.patientName}</p>
                            <p className="text-xs text-gray-600">{appointment.type} • {appointment.condition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{appointment.time}</p>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Patients */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Recent Patients
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-600">ID: {patient.id} • {patient.condition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                          <Badge className={getPriorityColor(patient.priority)}>
                            {patient.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">New Consultation</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Pill className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Write Prescription</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <FlaskConical className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs">Order Lab Test</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Patient Notes</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Video className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Start Video Call</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs">Schedule Appointment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'lab', message: 'Lab results available for Maria Garcia', time: '5 min ago', urgent: true },
                    { type: 'appointment', message: 'Appointment reminder: John Smith at 2:00 PM', time: '15 min ago', urgent: false },
                    { type: 'prescription', message: 'Prescription refill request from Alice Johnson', time: '1 hour ago', urgent: false },
                    { type: 'message', message: 'New message from Pharmacy regarding stock', time: '2 hours ago', urgent: false }
                  ].map((notification, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${notification.urgent ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'}`}>
                      {notification.urgent ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                      {notification.urgent && (
                        <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navigationItems={
        <TopNavigation
          items={navigationItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}