import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { Sidebar, SidebarItem } from '../common/Sidebar';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Activity,
  Bed,
  FlaskConical,
  Pill,
  FileText,
  BarChart3,
  Settings,
  Stethoscope
} from 'lucide-react';
import { User } from '../../App';
import { PatientList } from '../modules/PatientList';
import { DoctorList } from '../modules/DoctorList';
import { AppointmentList } from '../modules/AppointmentList';
import { PatientProfile } from '../modules/PatientProfile';
import { HealthRecord } from '../modules/HealthRecord';
import { PatientFiles } from '../modules/PatientFiles';
import { InvoiceDetail } from '../modules/InvoiceDetail';
import { AddHealthRecord } from '../modules/AddHealthRecord';
import { AddPatientPage } from '../pages/AddPatientPage';
import { EditPatientPage } from '../pages/EditPatientPage';
import { ViewPatientPage } from '../pages/ViewPatientPage';
import { AddDoctorPage } from '../pages/AddDoctorPage';
import { EditDoctorPage } from '../pages/EditDoctorPage';
import { ViewDoctorPage } from '../pages/ViewDoctorPage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const sidebarItems: SidebarItem[] = [
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Users className="w-5 h-5" />, label: 'Patients', id: 'patients', badge: '12' },
  { icon: <Stethoscope className="w-5 h-5" />, label: 'Doctors', id: 'doctors' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', id: 'appointments', badge: '5' },
  { icon: <Pill className="w-5 h-5" />, label: 'Pharmacy', id: 'pharmacy' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Laboratory', id: 'lab' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Billing', id: 'billing' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', id: 'reports' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', id: 'settings' }
];

// Mock data for charts
const patientVisitsData = [
  { month: 'Jan', visits: 1200 },
  { month: 'Feb', visits: 1350 },
  { month: 'Mar', visits: 1100 },
  { month: 'Apr', visits: 1600 },
  { month: 'May', visits: 1400 },
  { month: 'Jun', visits: 1700 }
];

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 }
];

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientView, setPatientView] = useState<'list' | 'profile' | 'health' | 'files' | 'invoice' | 'add-health' | 'add' | 'edit' | 'view'>('list');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorView, setDoctorView] = useState<'list' | 'add' | 'edit' | 'view'>('list');

  const handleViewProfile = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPatientView('view');
  };

  const handleEditPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPatientView('edit');
  };

  const handleAddPatient = () => {
    setSelectedPatientId(null);
    setPatientView('add');
  };

  const handleBackToList = () => {
    setPatientView('list');
    setSelectedPatientId(null);
  };

  const handleAddHealthRecord = () => {
    setPatientView('add-health');
  };

  const handleViewDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setDoctorView('view');
  };

  const handleEditDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setDoctorView('edit');
  };

  const handleAddDoctor = () => {
    setSelectedDoctorId(null);
    setDoctorView('add');
  };

  const handleBackToDoctorList = () => {
    setDoctorView('list');
    setSelectedDoctorId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'patients':
        if (patientView === 'add') {
          return <AddPatientPage onBack={handleBackToList} onSuccess={handleBackToList} />;
        } else if (patientView === 'edit' && selectedPatientId) {
          return <EditPatientPage patientId={selectedPatientId} onBack={handleBackToList} onSuccess={handleBackToList} />;
        } else if (patientView === 'view' && selectedPatientId) {
          return <ViewPatientPage patientId={selectedPatientId} onBack={handleBackToList} onEdit={handleEditPatient} />;
        } else if (patientView === 'profile' && selectedPatientId) {
          return <PatientProfile patientId={selectedPatientId} onBack={handleBackToList} onAddHealthRecord={handleAddHealthRecord} />;
        } else if (patientView === 'health' && selectedPatientId) {
          return <HealthRecord patientId={selectedPatientId} patientName="John Smith" onBack={handleBackToList} />;
        } else if (patientView === 'files' && selectedPatientId) {
          return <PatientFiles patientId={selectedPatientId} patientName="John Smith" onBack={handleBackToList} />;
        } else if (patientView === 'invoice' && selectedPatientId) {
          return <InvoiceDetail invoiceId="INV-2024-001234" onBack={handleBackToList} />;
        } else if (patientView === 'add-health' && selectedPatientId) {
          return <AddHealthRecord patientId={selectedPatientId} patientName="Test Khan" onBack={handleBackToList} />;
        } else {
          return <PatientList onViewProfile={handleViewProfile} onAddPatient={handleAddPatient} onEditPatient={handleEditPatient} />;
        }
      case 'doctors':
        if (doctorView === 'add') {
          return <AddDoctorPage onBack={handleBackToDoctorList} onSuccess={handleBackToDoctorList} />;
        } else if (doctorView === 'edit' && selectedDoctorId) {
          return <EditDoctorPage doctorId={selectedDoctorId} onBack={handleBackToDoctorList} onSuccess={handleBackToDoctorList} />;
        } else if (doctorView === 'view' && selectedDoctorId) {
          return <ViewDoctorPage doctorId={selectedDoctorId} onBack={handleBackToDoctorList} onEdit={handleEditDoctor} />;
        } else {
          return <DoctorList onViewDoctor={handleViewDoctor} onAddDoctor={handleAddDoctor} onEditDoctor={handleEditDoctor} />;
        }
      case 'appointments':
        return <AppointmentList />;
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Patients"
                value="2,847"
                icon={<Users className="w-6 h-6" />}
                trend={{ value: 12, isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Active Doctors"
                value="48"
                icon={<UserCheck className="w-6 h-6" />}
                trend={{ value: 3, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Today's Appointments"
                value="127"
                icon={<Calendar className="w-6 h-6" />}
                trend={{ value: 8, isPositive: false }}
                color="yellow"
              />
              <StatsCard
                title="Monthly Revenue"
                value="$67,000"
                icon={<DollarSign className="w-6 h-6" />}
                trend={{ value: 15, isPositive: true }}
                color="green"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Bed Occupancy"
                value="85%"
                icon={<Bed className="w-6 h-6" />}
                color="yellow"
              />
              <StatsCard
                title="Pending Lab Results"
                value="23"
                icon={<FlaskConical className="w-6 h-6" />}
                color="red"
              />
              <StatsCard
                title="Medicine Stock"
                value="98%"
                icon={<Pill className="w-6 h-6" />}
                color="green"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Patient Visits Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={patientVisitsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Line type="monotone" dataKey="visits" stroke="#2F80ED" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#27AE60" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New patient registered', name: 'Emily Johnson', time: '2 minutes ago', type: 'patient' },
                    { action: 'Appointment scheduled', name: 'Dr. Smith with John Doe', time: '5 minutes ago', type: 'appointment' },
                    { action: 'Lab result uploaded', name: 'Blood Test - Mary Wilson', time: '10 minutes ago', type: 'lab' },
                    { action: 'Medicine dispensed', name: 'Prescription #12345', time: '15 minutes ago', type: 'pharmacy' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'patient' ? 'bg-blue-500' :
                        activity.type === 'appointment' ? 'bg-green-500' :
                        activity.type === 'lab' ? 'bg-yellow-500' : 'bg-purple-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.name}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
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
      sidebar={
        <Sidebar
          items={sidebarItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
          title="Admin Panel"
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}