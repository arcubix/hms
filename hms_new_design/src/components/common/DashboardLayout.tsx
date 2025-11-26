import { ReactNode, useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  LogOut, 
  Bell, 
  Search,
  Heart,
  Settings,
  FileText,
  Users,
  Calculator,
  Headphones,
  List,
  Sliders,
  Megaphone,
  ChevronDown,
  Lightbulb,
  ClipboardList,
  Calendar
} from 'lucide-react';
import { Input } from '../ui/input';
import { User } from '../../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { AdminSettings } from '../modules/AdminSettings';
import { PriorityModules } from '../modules/PriorityModules';
import { Contacts } from '../modules/Contacts';
import { SupportTickets } from '../modules/SupportTickets';
import { AuditLog } from '../modules/AuditLog';
import { FeaturesAndUpdates } from '../modules/FeaturesAndUpdates';
import { BilledInvoices } from '../modules/BilledInvoices';

interface DashboardLayoutProps {
  user: User;
  children: ReactNode;
  navigationItems?: ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({ user, children, navigationItems, onLogout }: DashboardLayoutProps) {
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [showPriorityModules, setShowPriorityModules] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showFeaturesUpdates, setShowFeaturesUpdates] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  // If Billing is open, show that fullscreen
  if (showBilling) {
    return <BilledInvoices onClose={() => setShowBilling(false)} />;
  }

  // If Features and Updates is open, show that fullscreen
  if (showFeaturesUpdates) {
    return <FeaturesAndUpdates onClose={() => setShowFeaturesUpdates(false)} />;
  }

  // If Audit Log is open, show that fullscreen
  if (showAuditLog) {
    return <AuditLog onClose={() => setShowAuditLog(false)} />;
  }

  // If Support is open, show that fullscreen
  if (showSupport) {
    return <SupportTickets onClose={() => setShowSupport(false)} />;
  }

  // If Contacts is open, show that fullscreen
  if (showContacts) {
    return <Contacts onClose={() => setShowContacts(false)} />;
  }

  // If Priority Modules is open, show that fullscreen
  if (showPriorityModules) {
    return <PriorityModules onClose={() => setShowPriorityModules(false)} userRole={user.role} />;
  }

  // If Admin Settings is open, show that fullscreen
  if (showAdminSettings) {
    return <AdminSettings onClose={() => setShowAdminSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        {/* Top Row - Logo, Search, and User Info */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl text-gray-900">MediCare HMS</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search patients, doctors..."
                  className="pl-10 w-64 border-gray-200"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                          14
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">MediCare HMS</p>
                        <p className="text-xs text-gray-500">ID: 10291914</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="py-1">
                    <p className="px-2 py-1 text-sm font-medium text-gray-900">{user.role} {user.name}</p>
                    <p className="px-2 py-1 text-xs text-gray-500">MediCare HMS</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-3" />
                    <span>User Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPriorityModules(true)}>
                    <ClipboardList className="w-4 h-4 mr-3" />
                    <span>Priority Modules</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowContacts(true)}>
                    <Users className="w-4 h-4 mr-3" />
                    <span>Contacts</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBilling(true)}>
                    <Calculator className="w-4 h-4 mr-3" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSupport(true)}>
                    <Headphones className="w-4 h-4 mr-3" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAuditLog(true)}>
                    <List className="w-4 h-4 mr-3" />
                    <span>Audit Log</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAdminSettings(true)}>
                    <Sliders className="w-4 h-4 mr-3" />
                    <span>Admin Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowFeaturesUpdates(true)}>
                    <Megaphone className="w-4 h-4 mr-3" />
                    <span>What's New</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation Menu */}
        {navigationItems && (
          <div className="px-6 py-0 flex items-center justify-between">
            <div className="flex-1">
              {navigationItems}
            </div>
            
            {/* Create Button and Actions */}
            <div className="flex items-center gap-2 ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-3" />
                    <span>New Patient</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-3" />
                    <span>New Appointment</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-3" />
                    <span>New Prescription</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calculator className="w-4 h-4 mr-3" />
                    <span>New Invoice</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="sm" className="p-2">
                <Search className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
