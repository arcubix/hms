import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Activity, 
  Bed, 
  Clock, 
  Users,
  Pill,
  Thermometer,
  Heart,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { User } from '../../App';

interface NurseDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Bed className="w-5 h-5" />, label: 'Ward Management', id: 'ward', badge: '3' },
  { icon: <Users className="w-5 h-5" />, label: 'Patient Monitoring', id: 'monitoring' },
  { icon: <Pill className="w-5 h-5" />, label: 'Medication', id: 'medication' },
  { icon: <Clock className="w-5 h-5" />, label: 'Shift Schedule', id: 'schedule' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Alerts', id: 'alerts', badge: '5' }
];

const wardPatients = [
  {
    id: 'P001',
    name: 'John Smith',
    room: 'A101',
    bed: '1',
    condition: 'Post-Surgery',
    vitals: { temp: '98.6°F', bp: '120/80', hr: '72 bpm' },
    status: 'stable',
    lastCheck: '30 min ago',
    alerts: []
  },
  {
    id: 'P002',
    name: 'Emily Johnson',
    room: 'A102',
    bed: '2',
    condition: 'Pneumonia',
    vitals: { temp: '101.2°F', bp: '110/70', hr: '88 bpm' },
    status: 'monitoring',
    lastCheck: '15 min ago',
    alerts: ['High Temperature']
  },
  {
    id: 'P003',
    name: 'Michael Brown',
    room: 'A103',
    bed: '1',
    condition: 'Heart Surgery',
    vitals: { temp: '99.1°F', bp: '140/90', hr: '95 bpm' },
    status: 'critical',
    lastCheck: '10 min ago',
    alerts: ['High Blood Pressure', 'Elevated Heart Rate']
  }
];

const medicationSchedule = [
  {
    id: '1',
    patientName: 'John Smith',
    room: 'A101',
    medication: 'Morphine 10mg',
    time: '2:00 PM',
    status: 'pending',
    type: 'pain_management'
  },
  {
    id: '2',
    patientName: 'Emily Johnson',
    room: 'A102',
    medication: 'Amoxicillin 500mg',
    time: '2:30 PM',
    status: 'administered',
    type: 'antibiotic'
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    room: 'A103',
    medication: 'Lisinopril 5mg',
    time: '3:00 PM',
    status: 'pending',
    type: 'cardiac'
  }
];

const activeAlerts = [
  {
    id: '1',
    patient: 'Emily Johnson',
    room: 'A102',
    alert: 'High Temperature (101.2°F)',
    priority: 'high',
    time: '5 min ago'
  },
  {
    id: '2',
    patient: 'Michael Brown',
    room: 'A103',
    alert: 'Elevated Heart Rate (95 bpm)',
    priority: 'critical',
    time: '8 min ago'
  },
  {
    id: '3',
    patient: 'Sarah Davis',
    room: 'B201',
    alert: 'Medication Due',
    priority: 'medium',
    time: '10 min ago'
  }
];

export function NurseDashboard({ user, onLogout }: NurseDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case 'administered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Assigned Patients"
                value="12"
                icon={<Users className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Critical Patients"
                value="3"
                icon={<AlertTriangle className="w-6 h-6" />}
                color="red"
              />
              <StatsCard
                title="Medications Due"
                value="8"
                icon={<Pill className="w-6 h-6" />}
                color="yellow"
              />
              <StatsCard
                title="Bed Occupancy"
                value="85%"
                icon={<Bed className="w-6 h-6" />}
                trend={{ value: 5, isPositive: true }}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ward Patients */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-blue-600" />
                    Ward Patients
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wardPatients.map((patient) => (
                      <div key={patient.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm text-gray-900">{patient.name}</p>
                              <p className="text-xs text-gray-600">Room {patient.room} • Bed {patient.bed}</p>
                              <p className="text-xs text-gray-500">{patient.condition}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-white rounded">
                            <Thermometer className="w-4 h-4 mx-auto mb-1 text-red-500" />
                            <p className="text-xs text-gray-600">{patient.vitals.temp}</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
                            <p className="text-xs text-gray-600">{patient.vitals.hr}</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <Activity className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                            <p className="text-xs text-gray-600">{patient.vitals.bp}</p>
                          </div>
                        </div>

                        {patient.alerts.length > 0 && (
                          <div className="space-y-1">
                            {patient.alerts.map((alert, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                {alert}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">Last check: {patient.lastCheck}</span>
                          <Button size="sm" variant="outline">Update Vitals</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medication Schedule */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    Medication Schedule
                  </CardTitle>
                  <Button variant="outline" size="sm">View Schedule</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicationSchedule.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            med.type === 'pain_management' ? 'bg-red-100' :
                            med.type === 'antibiotic' ? 'bg-blue-100' :
                            med.type === 'cardiac' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <Pill className={`w-4 h-4 ${
                              med.type === 'pain_management' ? 'text-red-600' :
                              med.type === 'antibiotic' ? 'text-blue-600' :
                              med.type === 'cardiac' ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{med.patientName}</p>
                            <p className="text-xs text-gray-600">{med.medication}</p>
                            <p className="text-xs text-gray-500">Room {med.room} • {med.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMedicationStatusColor(med.status)}>
                            {med.status}
                          </Badge>
                          {med.status === 'pending' && (
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Give
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Alerts */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      alert.priority === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                      alert.priority === 'high' ? 'bg-orange-50 border-l-4 border-orange-500' :
                      'bg-yellow-50 border-l-4 border-yellow-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.priority === 'critical' ? 'text-red-600' :
                          alert.priority === 'high' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                        <div>
                          <p className="text-sm text-gray-900">{alert.alert}</p>
                          <p className="text-xs text-gray-600">{alert.patient} • Room {alert.room}</p>
                          <p className="text-xs text-gray-500">{alert.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                        <Button size="sm" variant="outline">Acknowledge</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Thermometer className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Record Vitals</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Pill className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Administer Medication</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Bed className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Update Bed Status</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-xs">Report Alert</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">View Schedule</span>
                  </Button>
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