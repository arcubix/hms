import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
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
  Video,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  ShoppingCart,
  Package,
  Receipt,
  TrendingUp,
  AlertCircle,
  TestTube,
  Microscope,
  Heart,
  User as UserIcon,
  Building2,
  DoorOpen
} from 'lucide-react';
import { api } from '../../services/api';
import { filterMenuItems } from '../../utils/permissions';
import { User } from '../../App';
import { getModuleIcon } from '../../config/modules';
import { Loader2 } from 'lucide-react';
import { PatientList } from '../modules/PatientList';
import { DoctorList } from '../modules/DoctorList';
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
import { UserList } from '../modules/UserList';
import { AddUserPage } from '../pages/AddUserPage';
import { UserSettings } from '../modules/UserSettings';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// Import new modules (will be created if they don't exist)
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
import { RolePermissionsManagement } from '../modules/RolePermissionsManagement';
import { SoftwareBilling } from '../modules/SoftwareBilling';
import { PriorityModules } from '../modules/PriorityModules';
import { AdvancedPOS } from '../pharmacy/AdvancedPOS';
import { SettingsPage } from '../pages/SettingsPage';
import { POSReports } from '../pharmacy/POSReports';
import { ShiftManagement } from '../pharmacy/ShiftManagement';
import { POSSettings } from '../pharmacy/POSSettings';
import { GSTRatesManagement } from '../pharmacy/GSTRatesManagement';
import { PurchaseOrders } from '../pharmacy/PurchaseOrders';
import { Transactions } from '../pharmacy/Transactions';
import { StockManagement } from '../pharmacy/StockManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Percent } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// Static navigation items with children (groups) - these are not in modules table
const staticNavigationItems: NavigationItem[] = [
  // Pharmacy Group
  {
    icon: <Pill className="w-5 h-5" />,
    label: 'Pharmacy',
    id: 'pharmacy-group',
    children: [
      { icon: <Pill className="w-4 h-4" />, label: 'Pharmacy Dashboard', id: 'pharmacy' },
      { icon: <CreditCard className="w-4 h-4" />, label: 'POS System', id: 'pos' },
      { icon: <Calendar className="w-4 h-4" />, label: 'Shift Management', id: 'shifts' },
      { icon: <ShoppingCart className="w-4 h-4" />, label: 'Prescriptions', id: 'prescriptions', badge: '8' },
      { icon: <Package className="w-4 h-4" />, label: 'Inventory', id: 'inventory' },
      { icon: <Receipt className="w-4 h-4" />, label: 'Transactions', id: 'transactions' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'POS Reports', id: 'pos-reports' },
      { icon: <CheckCircle className="w-4 h-4" />, label: 'Orders', id: 'orders' },
      { icon: <Settings className="w-4 h-4" />, label: 'Settings', id: 'pharmacy-settings' },
    ]
  },
  
  // Laboratory Group
  {
    icon: <FlaskConical className="w-5 h-5" />,
    label: 'Laboratory',
    id: 'lab-group',
    children: [
      { icon: <FlaskConical className="w-4 h-4" />, label: 'Lab Dashboard', id: 'lab' },
      { icon: <TestTube className="w-4 h-4" />, label: 'Sample Collection', id: 'collection', badge: '6' },
      { icon: <Microscope className="w-4 h-4" />, label: 'Test Processing', id: 'processing' },
      { icon: <FileText className="w-4 h-4" />, label: 'Results Upload', id: 'results' },
      { icon: <Clock className="w-4 h-4" />, label: 'Pending Tests', id: 'pending', badge: '12' },
      { icon: <CheckCircle className="w-4 h-4" />, label: 'Completed Tests', id: 'completed' },
    ]
  },
  
  // Finance/Billing Group
  {
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Finance',
    id: 'finance-group',
    children: [
      { icon: <DollarSign className="w-4 h-4" />, label: 'Billing', id: 'billing' },
      { icon: <Receipt className="w-4 h-4" />, label: 'Patient Billing', id: 'patient-billing', badge: '15' },
      { icon: <CreditCard className="w-4 h-4" />, label: 'Insurance Claims', id: 'insurance' },
      { icon: <FileText className="w-4 h-4" />, label: 'Reports', id: 'reports' },
      { icon: <TrendingUp className="w-4 h-4" />, label: 'Revenue Analytics', id: 'revenue-analytics' },
      { icon: <AlertCircle className="w-4 h-4" />, label: 'Outstanding Bills', id: 'outstanding', badge: '8' },
    ]
  },
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
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [allNavigationItems, setAllNavigationItems] = useState<NavigationItem[]>([]);
  const [priorityModuleIds, setPriorityModuleIds] = useState<string[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const [patientView, setPatientView] = useState<'list' | 'profile' | 'health' | 'files' | 'invoice' | 'add-health' | 'add' | 'edit' | 'view'>('list');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorView, setDoctorView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userView, setUserView] = useState<'list' | 'add' | 'edit' | 'settings'>('list');

  // Fetch modules and priority modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setModulesLoading(true);
        
        // Fetch all available modules
        const modulesData = await api.getAllModules();
        
        // Fetch user's priority modules
        const priorityModulesData = await api.getPriorityModules();
        
        console.log('All modules from API:', modulesData.map(m => m.module_id));
        console.log('Priority modules from API:', priorityModulesData);
        
        // Build navigation items from API modules
        const moduleNavItems: NavigationItem[] = modulesData.map((module) => {
          const IconComponent = getModuleIcon(module.icon_name);
          return {
            icon: <IconComponent className="w-5 h-5" />,
            label: module.label,
            id: module.module_id,
          };
        });
        
        // Combine with static navigation items (groups)
        const allItems = [...moduleNavItems, ...staticNavigationItems];
        setAllNavigationItems(allItems);
        
        // Set priority module IDs (already ordered by position from API)
        const priorityIds = priorityModulesData
          .sort((a, b) => (a.position || 0) - (b.position || 0)) // Ensure sorted by position
          .map((pm) => pm.module_id);
        
        console.log('Priority module IDs (ordered):', priorityIds);
        console.log('All navigation item IDs:', allItems.map(item => item.id));
        
        setPriorityModuleIds(priorityIds.length > 0 ? priorityIds : ['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy']);
        
      } catch (error) {
        console.error('Error fetching modules:', error);
        // Fallback to default modules
        const fallbackItems: NavigationItem[] = [
          { icon: <BarChart3 className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
          { icon: <Activity className="w-5 h-5" />, label: 'Analytics', id: 'analytics' },
          { icon: <Ambulance className="w-5 h-5" />, label: 'Emergency', id: 'emergency' },
          { icon: <Users className="w-5 h-5" />, label: 'Patients', id: 'patients' },
          { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', id: 'appointments' },
          { icon: <Activity className="w-5 h-5" />, label: 'OPD', id: 'opd' },
          { icon: <Hospital className="w-5 h-5" />, label: 'IPD Management', id: 'ipd' },
          { icon: <Bed className="w-5 h-5" />, label: 'Bed Management', id: 'beds' },
          { icon: <FileText className="w-5 h-5" />, label: 'Health Records', id: 'healthrecords' },
          { icon: <FlaskConical className="w-5 h-5" />, label: 'Laboratory', id: 'laboratory' },
          { icon: <Pill className="w-5 h-5" />, label: 'Pharmacy', id: 'pharmacy' },
          { icon: <DollarSign className="w-5 h-5" />, label: 'Billing', id: 'billing' },
          { icon: <Scan className="w-5 h-5" />, label: 'Radiology', id: 'radiology' },
          { icon: <Settings className="w-5 h-5" />, label: 'Settings', id: 'settings' },
          ...staticNavigationItems
        ];
        setAllNavigationItems(fallbackItems);
        setPriorityModuleIds(['dashboard', 'opd', 'emergency', 'patients', 'appointments', 'laboratory', 'pharmacy']);
      } finally {
        setModulesLoading(false);
      }
    };

    fetchModules();

    // Listen for priority modules updates
    const handlePriorityModulesUpdate = () => {
      console.log('Priority modules updated, refreshing...');
      fetchModules();
    };

    window.addEventListener('priority-modules-updated', handlePriorityModulesUpdate);

    return () => {
      window.removeEventListener('priority-modules-updated', handlePriorityModulesUpdate);
    };
  }, []);

  // Fetch user permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        // API returns string[] of permission keys
        const permissionsArray = await api.getUserPermissions(user.id);
        // Convert array of permission keys to object format
        const permissionsObj: Record<string, boolean> = {};
        if (Array.isArray(permissionsArray)) {
          permissionsArray.forEach((perm: string) => {
            permissionsObj[perm] = true;
          });
        }
        setUserPermissions(permissionsObj);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        // If permissions fetch fails, use role-based access only
        setUserPermissions({});
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, [user.id]);

  // Filter menu items based on permissions and roles, then filter by priority
  const filteredItems = filterMenuItems(allNavigationItems, user, userPermissions);
  
  // Filter and order navigation items by priority
  const navigationItems = React.useMemo(() => {
    if (priorityModuleIds.length === 0 || allNavigationItems.length === 0) {
      // If no priority modules or navigation items loaded yet, return empty
      return [];
    }

    // Create a map of priority positions for ordering
    const priorityPositionMap: Record<string, number> = {};
    priorityModuleIds.forEach((moduleId, index) => {
      priorityPositionMap[moduleId] = index + 1;
    });

    // Filter and sort items
    const priorityItems: NavigationItem[] = [];
    const groupItems: NavigationItem[] = [];

    filteredItems.forEach(item => {
      // Include if it's a priority module
      if (priorityModuleIds.includes(item.id)) {
        priorityItems.push(item);
      }
      // Include if it has children (groups)
      else if (item.children && item.children.length > 0) {
        groupItems.push(item);
      }
    });

    // Sort priority items by their position in priorityModuleIds
    priorityItems.sort((a, b) => {
      const posA = priorityPositionMap[a.id] || 999;
      const posB = priorityPositionMap[b.id] || 999;
      return posA - posB;
    });

    console.log('Filtered navigation items:', {
      priorityItems: priorityItems.map(i => i.id),
      groupItems: groupItems.map(i => i.id),
      priorityModuleIds
    });

    // Combine: priority items first, then groups
    return [...priorityItems, ...groupItems];
  }, [filteredItems, priorityModuleIds, allNavigationItems]);

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
    setSelectedPatientName(null);
  };

  const handleAddHealthRecord = (patientId: string, patientName: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
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


  const handleViewUser = (userId: number) => {
    setSelectedUserId(userId);
    setUserView('edit');
  };

  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId);
    setUserView('edit');
  };

  const handleAddUser = () => {
    setSelectedUserId(null);
    setUserView('add');
  };

  const handleUserSettings = (userId: number) => {
    setSelectedUserId(userId);
    setUserView('settings');
  };

  const handleBackToUserList = () => {
    setUserView('list');
    setSelectedUserId(null);
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
          return <AddHealthRecord patientId={selectedPatientId} patientName={selectedPatientName || `Patient #${selectedPatientId}`} onBack={handleBackToList} isFromAdmin={true} />;
        } else {
          return <PatientList onViewProfile={handleViewProfile} onAddPatient={handleAddPatient} onEditPatient={handleEditPatient} onAddHealthRecord={handleAddHealthRecord} isFromAdmin={true} />;
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
      case 'users':
        if (userView === 'add') {
          return <AddUserPage onBack={handleBackToUserList} onSuccess={handleBackToUserList} />;
        } else if (userView === 'edit' && selectedUserId) {
          return <AddUserPage userId={selectedUserId} onBack={handleBackToUserList} onSuccess={handleBackToUserList} />;
        } else if (userView === 'settings' && selectedUserId) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Settings</h1>
                <Button variant="outline" onClick={handleBackToUserList}>
                  Back to Users
                </Button>
              </div>
              <UserSettings userId={selectedUserId} onSuccess={handleBackToUserList} />
            </div>
          );
        } else {
          return (
            <UserList
              onAddUser={handleAddUser}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onUserSettings={handleUserSettings}
            />
          );
        }
      case 'appointments':
        return <OPDSchedule />;
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
      case 'analytics':
        return <EvaluationDashboard />;
      case 'role-permissions':
        return <RolePermissionsManagement />;
      case 'software-billing':
        return <SoftwareBilling />;
      case 'priority-modules':
        return <PriorityModules userRole={user.role} />;
      case 'settings':
        return <SettingsPage />;
      // Doctor specific sections
      case 'schedule':
        // For doctors: My Schedule, for nurses: Shift Schedule
        if (user.role === 'doctor') {
          // Import and use doctor schedule component if available
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">My Schedule</h2><p className="text-gray-600">Doctor schedule view coming soon...</p></div>;
        } else {
          return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Shift Schedule</h2><p className="text-gray-600">Nurse shift schedule view coming soon...</p></div>;
        }
      case 'telemedicine':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Telemedicine</h2><p className="text-gray-600">Telemedicine view coming soon...</p></div>;
      case 'records':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Patient Records</h2><p className="text-gray-600">Patient records view coming soon...</p></div>;
      // Nurse specific sections
      case 'ward':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Ward Management</h2><p className="text-gray-600">Ward management view coming soon...</p></div>;
      case 'monitoring':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Patient Monitoring</h2><p className="text-gray-600">Patient monitoring view coming soon...</p></div>;
      case 'medication':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Medication</h2><p className="text-gray-600">Medication view coming soon...</p></div>;
      case 'nurse-schedule':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Shift Schedule</h2><p className="text-gray-600">Shift schedule view coming soon...</p></div>;
      case 'alerts':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Alerts</h2><p className="text-gray-600">Alerts view coming soon...</p></div>;
      // Pharmacy specific sections
      case 'pos':
        return <AdvancedPOS />;
      case 'shifts':
        return <ShiftManagement />;
      case 'prescriptions':
        return <PharmacyManagement />; // Prescriptions view in PharmacyManagement
      case 'inventory':
        return <StockManagement />;
      case 'transactions':
        return <Transactions />;
      case 'orders':
        return <PurchaseOrders />;
      case 'pos-reports':
        return <POSReports />;
      case 'pharmacy-settings':
        return (
          <div className="p-6 space-y-6">
            <Tabs defaultValue="pos-settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pos-settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  POS Settings
                </TabsTrigger>
                <TabsTrigger value="gst-rates" className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  GST Rates
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pos-settings">
                <POSSettings />
              </TabsContent>
              <TabsContent value="gst-rates">
                <GSTRatesManagement />
              </TabsContent>
            </Tabs>
          </div>
        );
      // Lab specific sections
      case 'collection':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Sample Collection</h2><p className="text-gray-600">Sample collection view coming soon...</p></div>;
      case 'processing':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Test Processing</h2><p className="text-gray-600">Test processing view coming soon...</p></div>;
      case 'results':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Results Upload</h2><p className="text-gray-600">Results upload view coming soon...</p></div>;
      case 'pending':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Pending Tests</h2><p className="text-gray-600">Pending tests view coming soon...</p></div>;
      case 'completed':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Completed Tests</h2><p className="text-gray-600">Completed tests view coming soon...</p></div>;
      // Finance specific sections
      case 'patient-billing':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Patient Billing</h2><p className="text-gray-600">Patient billing view coming soon...</p></div>;
      case 'insurance':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Insurance Claims</h2><p className="text-gray-600">Insurance claims view coming soon...</p></div>;
      case 'revenue-analytics':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Revenue Analytics</h2><p className="text-gray-600">Revenue analytics view coming soon...</p></div>;
      case 'outstanding':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Outstanding Bills</h2><p className="text-gray-600">Outstanding bills view coming soon...</p></div>;
      // Patient specific sections
      case 'profile':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">My Profile</h2><p className="text-gray-600">Patient profile view coming soon...</p></div>;
      default:
        return <EnhancedAdminDashboard />;
    }
  };

  // Legacy dashboard content (kept for reference, but default now uses EnhancedAdminDashboard)
  const renderLegacyDashboard = () => {
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
  };

  // Show loading state while fetching modules
  if (modulesLoading || permissionsLoading) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navigationItems={
        <TopNavigation
          items={navigationItems}
          allItems={filteredItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}