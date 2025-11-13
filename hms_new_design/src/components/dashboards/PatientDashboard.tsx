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
  User, 
  FileText, 
  Heart,
  Pill,
  FlaskConical,
  CreditCard,
  Phone,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { User as UserType } from '../../App';

interface PatientDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <Heart className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', id: 'appointments', badge: '2' },
  { icon: <User className="w-5 h-5" />, label: 'My Profile', id: 'profile' },
  { icon: <FileText className="w-5 h-5" />, label: 'Medical Records', id: 'records' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Lab Results', id: 'lab' },
  { icon: <Pill className="w-5 h-5" />, label: 'Prescriptions', id: 'prescriptions' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'Billing', id: 'billing' }
];

const upcomingAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    date: '2024-01-18',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'confirmed'
  },
  {
    id: '2',
    doctorName: 'Dr. Sarah Williams',
    specialty: 'General Medicine',
    date: '2024-01-25',
    time: '2:30 PM',
    type: 'Consultation',
    status: 'pending'
  }
];

const recentResults = [
  {
    id: '1',
    testName: 'Blood Glucose Test',
    date: '2024-01-14',
    result: 'Normal',
    doctor: 'Dr. Michael Chen',
    status: 'reviewed'
  },
  {
    id: '2',
    testName: 'Lipid Panel',
    date: '2024-01-12',
    result: 'Elevated',
    doctor: 'Dr. Michael Chen',
    status: 'reviewed'
  },
  {
    id: '3',
    testName: 'Complete Blood Count',
    date: '2024-01-10',
    result: 'Normal',
    doctor: 'Dr. Sarah Williams',
    status: 'new'
  }
];

const currentPrescriptions = [
  {
    id: '1',
    medication: 'Lisinopril 10mg',
    dosage: 'Once daily',
    prescribedBy: 'Dr. Michael Chen',
    startDate: '2024-01-01',
    refillsLeft: 2,
    status: 'active'
  },
  {
    id: '2',
    medication: 'Metformin 500mg',
    dosage: 'Twice daily',
    prescribedBy: 'Dr. Michael Chen',
    startDate: '2023-12-15',
    refillsLeft: 0,
    status: 'refill_needed'
  }
];

export function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'elevated':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl text-gray-900">Welcome back, {user.name.split(' ')[0]}!</h2>
                  <p className="text-gray-600">Here's an overview of your health information</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Upcoming Appointments"
                value="2"
                icon={<Calendar className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Recent Lab Results"
                value="3"
                icon={<FlaskConical className="w-6 h-6" />}
                color="green"
              />
              <StatsCard
                title="Active Prescriptions"
                value="2"
                icon={<Pill className="w-6 h-6" />}
                color="yellow"
              />
              <StatsCard
                title="Outstanding Bills"
                value="$150"
                icon={<CreditCard className="w-6 h-6" />}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Upcoming Appointments
                  </CardTitle>
                  <Button variant="outline" size="sm">Book New</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{appointment.doctorName}</p>
                            <p className="text-xs text-gray-600">{appointment.specialty}</p>
                            <p className="text-xs text-gray-500">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">{appointment.time}</p>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Lab Results */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-green-600" />
                    Recent Lab Results
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FlaskConical className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{result.testName}</p>
                            <p className="text-xs text-gray-600">By {result.doctor}</p>
                            <p className="text-xs text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <Badge className={getResultColor(result.result)}>
                              {result.result}
                            </Badge>
                            {result.status === 'new' && (
                              <Badge className="bg-blue-100 text-blue-800 ml-1">New</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Prescriptions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Current Prescriptions
                </CardTitle>
                <Button variant="outline" size="sm">Request Refill</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-900">{prescription.medication}</p>
                          <p className="text-xs text-gray-600">{prescription.dosage}</p>
                        </div>
                        <Badge className={prescription.status === 'refill_needed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {prescription.status === 'refill_needed' ? 'Refill Needed' : 'Active'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>Prescribed by: {prescription.prescribedBy}</p>
                        <p>Started: {new Date(prescription.startDate).toLocaleDateString()}</p>
                        <p>Refills left: {prescription.refillsLeft}</p>
                      </div>
                      {prescription.status === 'refill_needed' && (
                        <Button size="sm" className="w-full mt-3 bg-blue-500 hover:bg-blue-600">
                          Request Refill
                        </Button>
                      )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Book Appointment</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Contact Doctor</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Download className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Download Records</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Pay Bills</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Health Tips for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm text-blue-900 mb-2">Stay Hydrated</h4>
                    <p className="text-xs text-blue-700">Drink at least 8 glasses of water daily to maintain good health.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm text-green-900 mb-2">Regular Exercise</h4>
                    <p className="text-xs text-green-700">Aim for 30 minutes of moderate exercise 5 days a week.</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm text-yellow-900 mb-2">Medication Reminder</h4>
                    <p className="text-xs text-yellow-700">Take your medications as prescribed and don't skip doses.</p>
                  </div>
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