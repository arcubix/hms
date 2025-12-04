import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
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
  Stethoscope,
  Ambulance,
  Hospital,
  Scan,
  MessageSquare,
  Package,
  UserCog
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
import { OPDSchedule } from '../modules/OPDSchedule';
import { BedManagement } from '../modules/BedManagement';
import { HealthRecords } from '../modules/HealthRecords';
import { PharmacyManagement } from '../modules/PharmacyManagement';
import { EvaluationDashboard } from '../modules/EvaluationDashboard';
import { EnhancedAdminDashboard } from '../modules/EnhancedAdminDashboard';
import { EmergencyManagement } from '../modules/EmergencyManagement';
import { LaboratoryManagement } from '../modules/LaboratoryManagement';
import { IPDManagement } from '../modules/IPDManagement';
import { RadiologyManagement } from '../modules/RadiologyManagement';
import { PreferenceSettings } from '../modules/PreferenceSettings';
import { ManageMessage } from '../modules/ManageMessage';
import { InventoryManagement } from '../inventory/InventoryManagement';
import { UserManagement } from '../modules/UserManagement';
import IndoorDutyRoster from '../modules/IndoorDutyRoster';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Activity className="w-5 h-5" />, label: 'Analytics', id: 'analytics' },
  { icon: <Ambulance className="w-5 h-5" />, label: 'Emergency', id: 'emergency', badge: '3' },
  { icon: <Users className="w-5 h-5" />, label: 'Patients', id: 'patients', badge: '12' },
  { icon: <Stethoscope className="w-5 h-5" />, label: 'Doctors', id: 'doctors' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', id: 'appointments', badge: '5' },
  { icon: <Activity className="w-5 h-5" />, label: 'OPD', id: 'opd' },
  { icon: <Hospital className="w-5 h-5" />, label: 'IPD Management', id: 'ipd', badge: '80' },
  { icon: <Bed className="w-5 h-5" />, label: 'Bed Management', id: 'beds' },
  { icon: <FileText className="w-5 h-5" />, label: 'Health Records', id: 'healthrecords' },
  { icon: <Pill className="w-5 h-5" />, label: 'Pharmacy', id: 'pharmacy' },
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Laboratory', id: 'lab' },
  { icon: <Scan className="w-5 h-5" />, label: 'Radiology', id: 'radiology', badge: '8' },
  { icon: <UserCog className="w-5 h-5" />, label: 'Indoor Duty Roster', id: 'indoor-duty-roster' },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Billing', id: 'billing' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', id: 'reports' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', id: 'settings' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Messages', id: 'messages' },
  { icon: <Package className="w-5 h-5" />, label: 'Inventory', id: 'inventory' },
  { icon: <UserCog className="w-5 h-5" />, label: 'User Management', id: 'user-management' }
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

// Helper function to get priority modules from localStorage
const getPriorityModules = (): string[] => {
  try {
    const saved = localStorage.getItem('priority-modules');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load priority modules:', error);
  }
  // Default priority modules
  return ['dashboard', 'opd', 'emergency', 'patients'];
};

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientView, setPatientView] = useState<'list' | 'profile' | 'health' | 'files' | 'invoice' | 'add-health'>('list');

  // Get priority module IDs
  const priorityModuleIds = getPriorityModules();
  
  // Filter navigation items to only show priority modules
  const filteredNavigationItems = navigationItems.filter(item => 
    priorityModuleIds.includes(item.id)
  );

  const handleViewProfile = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPatientView('profile');
  };

  const handleBackToList = () => {
    setPatientView('list');
    setSelectedPatientId(null);
  };

  const handleAddHealthRecord = () => {
    setPatientView('add-health');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'patients':
        if (patientView === 'profile' && selectedPatientId) {
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
          return <PatientList onViewProfile={handleViewProfile} />;
        }
      case 'doctors':
        return <DoctorList />;
      case 'appointments':
        return <AppointmentList />;
      case 'opd':
        return <OPDSchedule />;
      case 'ipd':
        return <IPDManagement />;
      case 'beds':
        return <BedManagement />;
      case 'healthrecords':
        return <HealthRecords />;
      case 'pharmacy':
        return <PharmacyManagement />;
      case 'lab':
        return <LaboratoryManagement />;
      case 'radiology':
        return <RadiologyManagement />;
      case 'emergency':
        return <EmergencyManagement />;
      case 'indoor-duty-roster':
        return <IndoorDutyRoster />;
      case 'analytics':
        return <EvaluationDashboard />;
      case 'settings':
        return <PreferenceSettings />;
      case 'messages':
        return <ManageMessage />;
      case 'inventory':
        return <InventoryManagement />;
      case 'user-management':
        return <UserManagement />;
      default:
        return <EnhancedAdminDashboard />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navigationItems={
        <TopNavigation
          items={filteredNavigationItems}
          allItems={navigationItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}