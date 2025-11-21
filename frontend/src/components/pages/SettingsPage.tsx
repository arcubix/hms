import { useState } from 'react';
import { cn } from '../ui/utils';
import {
  Settings,
  FileText,
  Clock,
  Building2,
  Shield,
  Briefcase,
  Heart,
  MessageSquare,
  Hospital as HospitalIcon,
  ChevronRight,
  DoorOpen,
  Receipt
} from 'lucide-react';
import { FloorList } from '../modules/FloorList';
import { FloorForm } from '../modules/FloorForm';
import { RoomList } from '../modules/RoomList';
import { RoomForm } from '../modules/RoomForm';
import { ReceptionList } from '../modules/ReceptionList';
import { ReceptionForm } from '../modules/ReceptionForm';
import { DepartmentList } from '../modules/DepartmentList';
import { DepartmentForm } from '../modules/DepartmentForm';
import { ReferralHospitalList } from '../modules/ReferralHospitalList';
import { ReferralHospitalForm } from '../modules/ReferralHospitalForm';

interface SettingsPageProps {
  initialSection?: string;
}

type SettingsSection = 
  | 'forms' 
  | 'doctor-timings' 
  | 'departments' 
  | 'floors'
  | 'rooms'
  | 'receptions'
  | 'insurance' 
  | 'organizations' 
  | 'donation-donors' 
  | 'message-settings' 
  | 'referral-hospitals';

interface PreferenceItem {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}

const preferenceItems: PreferenceItem[] = [
  { id: 'forms', label: 'Forms', icon: <FileText className="w-5 h-5" /> },
  { id: 'doctor-timings', label: "Doctor's Timings", icon: <Clock className="w-5 h-5" /> },
  { id: 'departments', label: 'Departments', icon: <Building2 className="w-5 h-5" /> },
  { id: 'floors', label: 'Floors', icon: <Building2 className="w-5 h-5" /> },
  { id: 'rooms', label: 'Rooms', icon: <DoorOpen className="w-5 h-5" /> },
  { id: 'receptions', label: 'Receptions', icon: <Receipt className="w-5 h-5" /> },
  { id: 'insurance', label: 'Insurance', icon: <Shield className="w-5 h-5" /> },
  { id: 'organizations', label: 'Organizations', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'donation-donors', label: 'Donation Donors', icon: <Heart className="w-5 h-5" /> },
  { id: 'message-settings', label: 'Message Settings', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'referral-hospitals', label: 'Referral Hospitals', icon: <HospitalIcon className="w-5 h-5" /> },
];

export function SettingsPage({ initialSection = 'departments' }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection as SettingsSection);
  
  // State for CRUD views
  const [floorView, setFloorView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [roomView, setRoomView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [receptionView, setReceptionView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedReceptionId, setSelectedReceptionId] = useState<number | null>(null);
  const [departmentView, setDepartmentView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [hospitalView, setHospitalView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  const handleAddFloor = () => {
    setSelectedFloorId(null);
    setFloorView('add');
  };

  const handleEditFloor = (floorId: number) => {
    setSelectedFloorId(floorId);
    setFloorView('edit');
  };

  const handleBackToFloorList = () => {
    setFloorView('list');
    setSelectedFloorId(null);
  };

  const handleAddRoom = () => {
    setSelectedRoomId(null);
    setRoomView('add');
  };

  const handleEditRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    setRoomView('edit');
  };

  const handleBackToRoomList = () => {
    setRoomView('list');
    setSelectedRoomId(null);
  };

  const handleAddReception = () => {
    setSelectedReceptionId(null);
    setReceptionView('add');
  };

  const handleEditReception = (receptionId: number) => {
    setSelectedReceptionId(receptionId);
    setReceptionView('edit');
  };

  const handleBackToReceptionList = () => {
    setReceptionView('list');
    setSelectedReceptionId(null);
  };

  const handleAddDepartment = () => {
    setSelectedDepartmentId(null);
    setDepartmentView('add');
  };

  const handleEditDepartment = (departmentId: number) => {
    setSelectedDepartmentId(departmentId);
    setDepartmentView('edit');
  };

  const handleBackToDepartmentList = () => {
    setDepartmentView('list');
    setSelectedDepartmentId(null);
  };

  const handleAddHospital = () => {
    setSelectedHospitalId(null);
    setHospitalView('add');
  };

  const handleEditHospital = (hospitalId: number) => {
    setSelectedHospitalId(hospitalId);
    setHospitalView('edit');
  };

  const handleBackToHospitalList = () => {
    setHospitalView('list');
    setSelectedHospitalId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'departments':
        if (departmentView === 'add') {
          return <DepartmentForm onBack={handleBackToDepartmentList} onSuccess={handleBackToDepartmentList} />;
        } else if (departmentView === 'edit' && selectedDepartmentId) {
          return <DepartmentForm departmentId={selectedDepartmentId} onBack={handleBackToDepartmentList} onSuccess={handleBackToDepartmentList} />;
        } else {
          return <DepartmentList onAddDepartment={handleAddDepartment} onEditDepartment={handleEditDepartment} />;
        }
      case 'floors':
        if (floorView === 'add') {
          return <FloorForm onBack={handleBackToFloorList} onSuccess={handleBackToFloorList} />;
        } else if (floorView === 'edit' && selectedFloorId) {
          return <FloorForm floorId={selectedFloorId} onBack={handleBackToFloorList} onSuccess={handleBackToFloorList} />;
        } else {
          return <FloorList onAddFloor={handleAddFloor} onEditFloor={handleEditFloor} />;
        }
      case 'rooms':
        if (roomView === 'add') {
          return <RoomForm onBack={handleBackToRoomList} onSuccess={handleBackToRoomList} />;
        } else if (roomView === 'edit' && selectedRoomId) {
          return <RoomForm roomId={selectedRoomId} onBack={handleBackToRoomList} onSuccess={handleBackToRoomList} />;
        } else {
          return <RoomList onAddRoom={handleAddRoom} onEditRoom={handleEditRoom} />;
        }
      case 'receptions':
        if (receptionView === 'add') {
          return <ReceptionForm onBack={handleBackToReceptionList} onSuccess={handleBackToReceptionList} />;
        } else if (receptionView === 'edit' && selectedReceptionId) {
          return <ReceptionForm receptionId={selectedReceptionId} onBack={handleBackToReceptionList} onSuccess={handleBackToReceptionList} />;
        } else {
          return <ReceptionList onAddReception={handleAddReception} onEditReception={handleEditReception} />;
        }
      case 'forms':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Forms Configuration</h1>
                <p className="text-sm text-gray-600 mt-1">Manage hospital forms and templates</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Add New Form
              </button>
            </div>
            <div className="text-center py-12 text-gray-500">
              Forms management coming soon...
            </div>
          </div>
        );
      case 'doctor-timings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor's Timings</h1>
                <p className="text-sm text-gray-600 mt-1">Manage doctor schedules and timings</p>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              Doctor timings management coming soon...
            </div>
          </div>
        );
      case 'insurance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Insurance</h1>
                <p className="text-sm text-gray-600 mt-1">Manage insurance providers and policies</p>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              Insurance management coming soon...
            </div>
          </div>
        );
      case 'organizations':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                <p className="text-sm text-gray-600 mt-1">Manage partner organizations</p>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              Organizations management coming soon...
            </div>
          </div>
        );
      case 'donation-donors':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Donation Donors</h1>
                <p className="text-sm text-gray-600 mt-1">Manage donation donors and records</p>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              Donation donors management coming soon...
            </div>
          </div>
        );
      case 'message-settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Message Settings</h1>
                <p className="text-sm text-gray-600 mt-1">Configure messaging and notification settings</p>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              Message settings coming soon...
            </div>
          </div>
        );
      case 'referral-hospitals':
        if (hospitalView === 'add') {
          return <ReferralHospitalForm onBack={handleBackToHospitalList} onSuccess={handleBackToHospitalList} />;
        } else if (hospitalView === 'edit' && selectedHospitalId) {
          return <ReferralHospitalForm hospitalId={selectedHospitalId} onBack={handleBackToHospitalList} onSuccess={handleBackToHospitalList} />;
        } else {
          return <ReferralHospitalList onAddHospital={handleAddHospital} onEditHospital={handleEditHospital} />;
        }
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Hospital settings & configuration</p>
            </div>
            <div className="text-center py-12 text-gray-500">
              Please select a preference from the sidebar
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar - Preferences */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">Hospital settings & configuration</p>
        </div>
        <nav className="p-3">
          {preferenceItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  // Reset views when switching sections
                  setFloorView('list');
                  setRoomView('list');
                  setReceptionView('list');
                  setDepartmentView('list');
                  setHospitalView('list');
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-md mb-1 transition-colors text-left",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("text-base", isActive ? "text-blue-700" : "text-gray-600")}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-700" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

