/**
 * System Settings Module
 * 
 * Complete system configuration and settings:
 * - User Settings
 * - Priority Modules
 * - Contacts
 * - Billing
 * - Support
 * - Audit Log
 * - Admin Settings
 * - What's New
 */

import { useState } from 'react';
import { PriorityModules } from '../settings/PriorityModules';
import { SoftwareTeamContacts } from '../settings/SoftwareTeamContacts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Settings,
  FileText,
  Users,
  Calculator,
  Headphones,
  List,
  Sliders,
  Megaphone,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Eye,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  Globe,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  ClipboardList,
  UserCog,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Palette,
  Zap,
  Database,
  HardDrive,
  Wifi,
  RefreshCw,
  LogOut,
  ChevronRight,
  Star,
  Heart,
  MessageSquare,
  Send,
  Printer,
  Copy,
  ExternalLink,
  BookOpen,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar?: string;
  lastLogin: string;
  accountCreated: string;
  status: 'active' | 'inactive';
}

interface PriorityModule {
  id: string;
  name: string;
  icon: string;
  category: string;
  priority: number;
  isPinned: boolean;
  accessCount: number;
  lastAccessed: string;
  status: 'active' | 'inactive';
}

interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  mobile?: string;
  extension?: string;
  availability: 'available' | 'busy' | 'offline';
}

interface BillingRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  service: string;
  paymentMethod: string;
  dueDate: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdDate: string;
  updatedDate: string;
  assignedTo?: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
}

interface AdminSetting {
  id: string;
  category: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  description: string;
  lastModified: string;
  modifiedBy: string;
}

interface WhatsNewItem {
  id: string;
  version: string;
  title: string;
  date: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'announcement';
  description: string;
  highlights: string[];
  isNew: boolean;
}

// ============= MOCK DATA =============

const mockUserProfile: UserProfile = {
  id: 'U001',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@hospital.com',
  phone: '+1-555-0100',
  role: 'Senior Physician',
  department: 'Cardiology',
  lastLogin: '2024-11-21 09:30 AM',
  accountCreated: '2023-01-15',
  status: 'active'
};

const mockPriorityModules: PriorityModule[] = [
  {
    id: 'PM001',
    name: 'Patient Registration',
    icon: 'User',
    category: 'Patient Management',
    priority: 1,
    isPinned: true,
    accessCount: 1250,
    lastAccessed: '2024-11-21 10:30 AM',
    status: 'active'
  },
  {
    id: 'PM002',
    name: 'Pharmacy POS',
    icon: 'Pill',
    category: 'Pharmacy',
    priority: 2,
    isPinned: true,
    accessCount: 980,
    lastAccessed: '2024-11-21 09:15 AM',
    status: 'active'
  },
  {
    id: 'PM003',
    name: 'Laboratory Tests',
    icon: 'FlaskConical',
    category: 'Laboratory',
    priority: 3,
    isPinned: true,
    accessCount: 750,
    lastAccessed: '2024-11-20 04:30 PM',
    status: 'active'
  },
  {
    id: 'PM004',
    name: 'Emergency Department',
    icon: 'Ambulance',
    category: 'Emergency',
    priority: 4,
    isPinned: false,
    accessCount: 620,
    lastAccessed: '2024-11-21 08:00 AM',
    status: 'active'
  },
  {
    id: 'PM005',
    name: 'Billing & Invoicing',
    icon: 'Calculator',
    category: 'Finance',
    priority: 5,
    isPinned: false,
    accessCount: 450,
    lastAccessed: '2024-11-20 02:15 PM',
    status: 'active'
  }
];

const mockContacts: Contact[] = [
  {
    id: 'C001',
    name: 'Dr. Michael Chen',
    role: 'Chief Medical Officer',
    department: 'Administration',
    email: 'michael.chen@hospital.com',
    phone: '+1-555-0101',
    mobile: '+1-555-0201',
    extension: '1001',
    availability: 'available'
  },
  {
    id: 'C002',
    name: 'Emily Rodriguez',
    role: 'Head Nurse',
    department: 'Nursing',
    email: 'emily.rodriguez@hospital.com',
    phone: '+1-555-0102',
    mobile: '+1-555-0202',
    extension: '1002',
    availability: 'busy'
  },
  {
    id: 'C003',
    name: 'James Wilson',
    role: 'IT Manager',
    department: 'Information Technology',
    email: 'james.wilson@hospital.com',
    phone: '+1-555-0103',
    mobile: '+1-555-0203',
    extension: '1003',
    availability: 'available'
  },
  {
    id: 'C004',
    name: 'Lisa Anderson',
    role: 'Finance Director',
    department: 'Finance',
    email: 'lisa.anderson@hospital.com',
    phone: '+1-555-0104',
    extension: '1004',
    availability: 'offline'
  }
];

const mockBillingRecords: BillingRecord[] = [
  {
    id: 'BR001',
    invoiceNumber: 'INV-2024-001',
    date: '2024-11-01',
    amount: 15000,
    status: 'paid',
    service: 'HMS Software License - Monthly',
    paymentMethod: 'Bank Transfer',
    dueDate: '2024-11-15'
  },
  {
    id: 'BR002',
    invoiceNumber: 'INV-2024-002',
    date: '2024-11-05',
    amount: 3500,
    status: 'paid',
    service: 'Cloud Storage - 500GB',
    paymentMethod: 'Credit Card',
    dueDate: '2024-11-20'
  },
  {
    id: 'BR003',
    invoiceNumber: 'INV-2024-003',
    date: '2024-11-10',
    amount: 8000,
    status: 'pending',
    service: 'Technical Support - Premium',
    paymentMethod: 'Pending',
    dueDate: '2024-11-25'
  },
  {
    id: 'BR004',
    invoiceNumber: 'INV-2024-004',
    date: '2024-10-28',
    amount: 12000,
    status: 'overdue',
    service: 'System Maintenance',
    paymentMethod: 'Pending',
    dueDate: '2024-11-12'
  }
];

const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ST001',
    ticketNumber: 'TICKET-2024-0045',
    subject: 'Pharmacy module performance issue',
    category: 'Technical',
    priority: 'high',
    status: 'in-progress',
    createdDate: '2024-11-20 10:30 AM',
    updatedDate: '2024-11-21 09:15 AM',
    assignedTo: 'James Wilson'
  },
  {
    id: 'ST002',
    ticketNumber: 'TICKET-2024-0046',
    subject: 'Unable to generate patient reports',
    category: 'Bug',
    priority: 'urgent',
    status: 'open',
    createdDate: '2024-11-21 08:00 AM',
    updatedDate: '2024-11-21 08:00 AM'
  },
  {
    id: 'ST003',
    ticketNumber: 'TICKET-2024-0044',
    subject: 'Request for additional user accounts',
    category: 'Request',
    priority: 'medium',
    status: 'resolved',
    createdDate: '2024-11-19 02:15 PM',
    updatedDate: '2024-11-20 04:30 PM',
    assignedTo: 'James Wilson'
  },
  {
    id: 'ST004',
    ticketNumber: 'TICKET-2024-0043',
    subject: 'Training on new billing features',
    category: 'Training',
    priority: 'low',
    status: 'closed',
    createdDate: '2024-11-18 11:00 AM',
    updatedDate: '2024-11-19 03:45 PM',
    assignedTo: 'Support Team'
  }
];

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'AL001',
    timestamp: '2024-11-21 10:30:15',
    user: 'Dr. Sarah Johnson',
    action: 'Patient Record Updated',
    module: 'Patient Management',
    details: 'Updated medical history for patient UHID: UH001234',
    ipAddress: '192.168.1.45',
    status: 'success'
  },
  {
    id: 'AL002',
    timestamp: '2024-11-21 10:28:42',
    user: 'John Smith',
    action: 'Login Failed',
    module: 'Authentication',
    details: 'Invalid password attempt',
    ipAddress: '192.168.1.78',
    status: 'failed'
  },
  {
    id: 'AL003',
    timestamp: '2024-11-21 10:25:30',
    user: 'Emily Rodriguez',
    action: 'Prescription Created',
    module: 'Pharmacy',
    details: 'Created prescription ID: PRX-2024-5678',
    ipAddress: '192.168.1.52',
    status: 'success'
  },
  {
    id: 'AL004',
    timestamp: '2024-11-21 10:20:18',
    user: 'Dr. Michael Chen',
    action: 'Lab Test Ordered',
    module: 'Laboratory',
    details: 'Ordered CBC test for patient UHID: UH001235',
    ipAddress: '192.168.1.33',
    status: 'success'
  },
  {
    id: 'AL005',
    timestamp: '2024-11-21 10:15:05',
    user: 'Admin',
    action: 'User Settings Modified',
    module: 'Admin Settings',
    details: 'Changed session timeout to 30 minutes',
    ipAddress: '192.168.1.10',
    status: 'warning'
  }
];

const mockAdminSettings: AdminSetting[] = [
  {
    id: 'AS001',
    category: 'Security',
    name: 'Session Timeout',
    value: '30',
    type: 'number',
    description: 'Auto logout time in minutes',
    lastModified: '2024-11-21 10:15 AM',
    modifiedBy: 'Admin'
  },
  {
    id: 'AS002',
    category: 'Security',
    name: 'Password Expiry',
    value: '90',
    type: 'number',
    description: 'Password expiry in days',
    lastModified: '2024-11-15 02:30 PM',
    modifiedBy: 'James Wilson'
  },
  {
    id: 'AS003',
    category: 'System',
    name: 'Maintenance Mode',
    value: 'false',
    type: 'boolean',
    description: 'Enable system maintenance mode',
    lastModified: '2024-11-10 09:00 AM',
    modifiedBy: 'Admin'
  },
  {
    id: 'AS004',
    category: 'System',
    name: 'Default Language',
    value: 'English',
    type: 'select',
    description: 'System default language',
    lastModified: '2024-11-01 10:00 AM',
    modifiedBy: 'Admin'
  },
  {
    id: 'AS005',
    category: 'Notifications',
    name: 'Email Notifications',
    value: 'true',
    type: 'boolean',
    description: 'Enable email notifications',
    lastModified: '2024-11-05 11:20 AM',
    modifiedBy: 'Admin'
  },
  {
    id: 'AS006',
    category: 'Notifications',
    name: 'SMS Notifications',
    value: 'true',
    type: 'boolean',
    description: 'Enable SMS notifications',
    lastModified: '2024-11-05 11:20 AM',
    modifiedBy: 'Admin'
  },
  {
    id: 'AS007',
    category: 'Database',
    name: 'Auto Backup',
    value: 'true',
    type: 'boolean',
    description: 'Enable automatic daily backups',
    lastModified: '2024-11-01 08:00 AM',
    modifiedBy: 'James Wilson'
  },
  {
    id: 'AS008',
    category: 'Database',
    name: 'Backup Time',
    value: '02:00',
    type: 'text',
    description: 'Daily backup time (24-hour format)',
    lastModified: '2024-11-01 08:00 AM',
    modifiedBy: 'James Wilson'
  }
];

const mockWhatsNew: WhatsNewItem[] = [
  {
    id: 'WN001',
    version: '3.5.0',
    title: 'Major System Update - Enhanced Performance',
    date: '2024-11-20',
    type: 'feature',
    description: 'We are excited to announce our latest update with significant performance improvements and new features.',
    highlights: [
      'Pharmacy POS system now 40% faster',
      'New AI-powered patient diagnosis assistant',
      'Enhanced reporting with custom templates',
      'Mobile app support for iOS and Android',
      'Real-time dashboard updates'
    ],
    isNew: true
  },
  {
    id: 'WN002',
    version: '3.4.5',
    title: 'Security Enhancements & Bug Fixes',
    date: '2024-11-10',
    type: 'improvement',
    description: 'Important security updates and bug fixes to improve system stability.',
    highlights: [
      'Two-factor authentication support',
      'Enhanced data encryption',
      'Fixed login timeout issues',
      'Improved audit log tracking',
      'Better session management'
    ],
    isNew: false
  },
  {
    id: 'WN003',
    version: '3.4.0',
    title: 'New Laboratory Module Features',
    date: '2024-10-25',
    type: 'feature',
    description: 'Comprehensive updates to the laboratory management system.',
    highlights: [
      'Digital signature for lab reports',
      'Barcode scanning for samples',
      'Integration with lab equipment',
      'Automated quality control checks',
      'Enhanced result templates'
    ],
    isNew: false
  },
  {
    id: 'WN004',
    version: '3.3.8',
    title: 'Critical Bug Fixes',
    date: '2024-10-15',
    type: 'bugfix',
    description: 'Emergency patch to resolve critical issues.',
    highlights: [
      'Fixed billing calculation errors',
      'Resolved patient record sync issues',
      'Corrected prescription printing problems',
      'Fixed appointment reminder notifications'
    ],
    isNew: false
  },
  {
    id: 'WN005',
    version: '3.3.5',
    title: 'Year-End Maintenance Announcement',
    date: '2024-10-05',
    type: 'announcement',
    description: 'Scheduled maintenance window for system upgrades.',
    highlights: [
      'Maintenance window: December 31, 2024, 10 PM - January 1, 2025, 6 AM',
      'All services will be temporarily unavailable',
      'Please complete all critical tasks before maintenance',
      'Emergency contact: +1-555-SUPPORT'
    ],
    isNew: false
  }
];

// ============= MAIN COMPONENT =============

export function SystemSettings() {
  const [activeSection, setActiveSection] = useState('user-settings');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Settings states
  const [userProfile, setUserProfile] = useState(mockUserProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Priority Modules states
  const [priorityModules, setPriorityModules] = useState(mockPriorityModules);
  
  // Contacts states
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  // Support states
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketDescription, setTicketDescription] = useState('');
  
  // Audit Log states
  const [auditLogFilter, setAuditLogFilter] = useState('all');
  const [auditDateRange, setAuditDateRange] = useState('today');
  
  // Admin Settings states
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Menu items configuration
  const menuItems = [
    {
      id: 'user-settings',
      name: 'User Settings',
      icon: Settings,
      description: 'Manage your profile and preferences'
    },
    {
      id: 'priority-modules',
      name: 'Priority Modules',
      icon: ClipboardList,
      description: 'Customize your dashboard modules'
    },
    {
      id: 'contacts',
      name: 'Contacts',
      icon: Users,
      description: 'Software team contacts and support'
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: Calculator,
      description: 'View invoices and payment history'
    },
    {
      id: 'support',
      name: 'Support',
      icon: Headphones,
      description: 'Get help and submit tickets'
    },
    {
      id: 'audit-log',
      name: 'Audit Log',
      icon: List,
      description: 'System activity and security logs'
    },
    {
      id: 'admin-settings',
      name: 'Admin Settings',
      icon: Sliders,
      description: 'Advanced system configuration'
    },
    {
      id: 'whats-new',
      name: "What's New",
      icon: Megaphone,
      description: 'Latest updates and announcements'
    }
  ];

  // ============= RENDER USER SETTINGS =============
  
  const renderUserSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">User Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                <p className="text-sm text-gray-600">{userProfile.role}</p>
                <Badge className="mt-1 bg-green-100 text-green-800">
                  {userProfile.status}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-600">Email Address</Label>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{userProfile.email}</span>
              </div>
            </div>
            <div>
              <Label className="text-gray-600">Phone Number</Label>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{userProfile.phone}</span>
              </div>
            </div>
            <div>
              <Label className="text-gray-600">Department</Label>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{userProfile.department}</span>
              </div>
            </div>
            <div>
              <Label className="text-gray-600">Last Login</Label>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{userProfile.lastLogin}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Settings</Label>
                  <Input value={userProfile.name} placeholder="Enter your name" />
                </div>
                <div>
                  <Label>Role/Position</Label>
                  <Input value={userProfile.role} placeholder="Enter your role" />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" value={userProfile.email} placeholder="Enter your email" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={userProfile.phone} placeholder="Enter phone number" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={userProfile.department}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time Zone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern (EST)</SelectItem>
                      <SelectItem value="cst">Central (CST)</SelectItem>
                      <SelectItem value="mst">Mountain (MST)</SelectItem>
                      <SelectItem value="pst">Pacific (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </h4>
                <div className="grid gap-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Two-Factor Authentication
                </h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              {/* Active Sessions */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Active Sessions
                </h4>
                <div className="space-y-2">
                  {[
                    { device: 'Windows PC', location: 'New York, USA', time: 'Current session', ip: '192.168.1.45' },
                    { device: 'iPhone 14 Pro', location: 'New York, USA', time: '2 hours ago', ip: '192.168.1.78' }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-sm text-gray-600">{session.location} • {session.ip}</p>
                          <p className="text-xs text-gray-500">{session.time}</p>
                        </div>
                      </div>
                      {index !== 0 && (
                        <Button size="sm" variant="outline" className="text-red-600">
                          <LogOut className="w-3 h-3 mr-1" />
                          End Session
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
                { title: 'SMS Notifications', description: 'Receive notifications via SMS', icon: Smartphone },
                { title: 'Push Notifications', description: 'Receive push notifications on your devices', icon: Bell },
                { title: 'Patient Updates', description: 'Get notified about patient status changes', icon: User },
                { title: 'Appointment Reminders', description: 'Receive appointment notifications', icon: Calendar },
                { title: 'Lab Results', description: 'Get notified when lab results are ready', icon: Activity },
                { title: 'System Alerts', description: 'Receive important system notifications', icon: AlertCircle },
                { title: 'Billing Updates', description: 'Get notified about billing activities', icon: DollarSign }
              ].map((notif, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <notif.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-gray-600">{notif.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={index < 5} />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Reset to Default</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Customize your system experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <Select defaultValue="english">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Format</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time Format</Label>
                  <Select defaultValue="12-hour">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12-hour">12 Hour</SelectItem>
                      <SelectItem value="24-hour">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="pkr">PKR (₨)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: 'Light', color: 'bg-white' },
                    { name: 'Dark', color: 'bg-gray-900' },
                    { name: 'Auto', color: 'bg-gradient-to-r from-white to-gray-900' }
                  ].map((theme, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${
                        index === 0 ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-full h-20 rounded ${theme.color} border mb-2`}></div>
                      <p className="text-sm font-medium text-center">{theme.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Reset to Default</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // ============= RENDER PRIORITY MODULES =============
  
  const renderPriorityModules = () => <PriorityModules />;

  // ============= RENDER CONTACTS =============
  
  const renderContacts = () => <SoftwareTeamContacts />;
  
  const renderContactsOld = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Contacts</h2>
          <p className="text-sm text-gray-600 mt-1">Hospital staff directory and contact information</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockContacts.map((contact) => (
          <Card key={contact.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-xs text-gray-600">{contact.role}</p>
                  </div>
                </div>
                <Badge
                  className={
                    contact.availability === 'available'
                      ? 'bg-green-100 text-green-800'
                      : contact.availability === 'busy'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {contact.availability}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{contact.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 text-xs truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{contact.phone}</span>
                </div>
                {contact.mobile && (
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{contact.mobile}</span>
                  </div>
                )}
                {contact.extension && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Ext: {contact.extension}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedContact(contact);
                    setIsContactDialogOpen(true);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Details Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>Complete contact information</DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-600">{selectedContact.role}</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">
                    {selectedContact.availability}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <Label className="text-gray-600">Department</Label>
                  </div>
                  <p className="font-medium">{selectedContact.department}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Label className="text-gray-600">Email</Label>
                  </div>
                  <p className="font-medium text-sm">{selectedContact.email}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <Label className="text-gray-600">Phone</Label>
                  </div>
                  <p className="font-medium">{selectedContact.phone}</p>
                </div>
                {selectedContact.mobile && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <Label className="text-gray-600">Mobile</Label>
                    </div>
                    <p className="font-medium">{selectedContact.mobile}</p>
                  </div>
                )}
                {selectedContact.extension && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <Label className="text-gray-600">Extension</Label>
                    </div>
                    <p className="font-medium">{selectedContact.extension}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // ============= RENDER BILLING =============
  
  const renderBilling = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Billing</h2>
          <p className="text-sm text-gray-600 mt-1">View invoices and manage payments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Paid</p>
                <p className="text-xl font-bold text-green-600">
                  ${mockBillingRecords.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  ${mockBillingRecords.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Overdue</p>
                <p className="text-xl font-bold text-red-600">
                  ${mockBillingRecords.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold text-blue-600">
                  ${mockBillingRecords.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All billing records and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono font-semibold">{record.invoiceNumber}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.service}</TableCell>
                  <TableCell className="font-semibold">${record.amount.toLocaleString()}</TableCell>
                  <TableCell>{record.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        record.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3" />
                      </Button>
                      {record.status !== 'paid' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER SUPPORT =============
  
  const renderSupport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Support</h2>
          <p className="text-sm text-gray-600 mt-1">Get help and submit support tickets</p>
        </div>
        <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Submit a new support request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject *</Label>
                <Input
                  placeholder="Brief description of the issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={ticketCategory} onValueChange={setTicketCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority *</Label>
                  <Select value={ticketPriority} onValueChange={setTicketPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Provide detailed information about your issue..."
                  rows={6}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Drop files here or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    toast.success('Support ticket created successfully!');
                    setIsNewTicketDialogOpen(false);
                    setTicketSubject('');
                    setTicketCategory('');
                    setTicketPriority('medium');
                    setTicketDescription('');
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </Button>
                <Button variant="outline" onClick={() => setIsNewTicketDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Support Statistics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open', count: mockSupportTickets.filter(t => t.status === 'open').length, color: 'blue' },
          { label: 'In Progress', count: mockSupportTickets.filter(t => t.status === 'in-progress').length, color: 'yellow' },
          { label: 'Resolved', count: mockSupportTickets.filter(t => t.status === 'resolved').length, color: 'green' },
          { label: 'Closed', count: mockSupportTickets.filter(t => t.status === 'closed').length, color: 'gray' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Activity className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>All support requests and their status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket Number</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSupportTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono font-semibold">{ticket.ticketNumber}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate">{ticket.subject}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ticket.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : ticket.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ticket.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.createdDate}</TableCell>
                  <TableCell className="text-sm">{ticket.assignedTo || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is available 24/7 to assist you with any issues.
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">+1-555-SUPPORT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">support@hospital.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <Button size="sm" variant="link" className="p-0 h-auto text-blue-600">
                    Live Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER AUDIT LOG =============
  
  const renderAuditLog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Audit Log</h2>
          <p className="text-sm text-gray-600 mt-1">System activity and security monitoring</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search audit logs..." className="pl-10" />
              </div>
            </div>
            <Select value={auditLogFilter} onValueChange={setAuditLogFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={auditDateRange} onValueChange={setAuditDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockAuditLogs.filter(l => l.status === 'success').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockAuditLogs.filter(l => l.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockAuditLogs.filter(l => l.status === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Detailed system activity and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.module}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <p className="truncate text-sm">{log.details}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : log.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER ADMIN SETTINGS =============
  
  const renderAdminSettings = () => {
    const categories = ['all', 'Security', 'System', 'Notifications', 'Database'];
    const filteredSettings = selectedCategory === 'all'
      ? mockAdminSettings
      : mockAdminSettings.filter(s => s.category === selectedCategory);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Admin Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Advanced system configuration and settings</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={selectedCategory === category ? "bg-blue-600" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Settings' : category}
            </Button>
          ))}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSettings.map((setting) => (
            <Card key={setting.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{setting.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{setting.category}</Badge>
                        <Badge variant="outline" className="text-xs">
                          Modified by {setting.modifiedBy}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {setting.type === 'boolean' ? (
                      <div className="flex items-center justify-between">
                        <Label>Enable</Label>
                        <Switch checked={setting.value === 'true'} />
                      </div>
                    ) : setting.type === 'select' ? (
                      <div>
                        <Label>Value</Label>
                        <Select value={setting.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label>Value</Label>
                        <Input
                          type={setting.type}
                          value={setting.value}
                          placeholder={`Enter ${setting.name.toLowerCase()}`}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <span>Last modified: {setting.lastModified}</span>
                      <Button size="sm" variant="ghost">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Information */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-600">System Version</Label>
                <p className="font-semibold mt-1">v3.5.0</p>
              </div>
              <div>
                <Label className="text-gray-600">Database Size</Label>
                <p className="font-semibold mt-1">2.4 GB</p>
              </div>
              <div>
                <Label className="text-gray-600">Last Backup</Label>
                <p className="font-semibold mt-1">2024-11-21 02:00 AM</p>
              </div>
              <div>
                <Label className="text-gray-600">Active Users</Label>
                <p className="font-semibold mt-1">143</p>
              </div>
              <div>
                <Label className="text-gray-600">Server Status</Label>
                <Badge className="bg-green-100 text-green-800 mt-1">Online</Badge>
              </div>
              <div>
                <Label className="text-gray-600">Uptime</Label>
                <p className="font-semibold mt-1">45 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= RENDER WHAT'S NEW =============
  
  const renderWhatsNew = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">What's New</h2>
        <p className="text-sm text-gray-600 mt-1">Latest updates, features, and announcements</p>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {mockWhatsNew.map((item) => (
          <Card key={item.id} className={`border-0 shadow-md ${item.isNew ? 'border-l-4 border-l-blue-600' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.type === 'feature' ? 'bg-gradient-to-br from-blue-100 to-indigo-100' :
                  item.type === 'improvement' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                  item.type === 'bugfix' ? 'bg-gradient-to-br from-orange-100 to-red-100' :
                  'bg-gradient-to-br from-purple-100 to-pink-100'
                }`}>
                  {item.type === 'feature' ? <Zap className="w-7 h-7 text-blue-600" /> :
                   item.type === 'improvement' ? <TrendingUp className="w-7 h-7 text-green-600" /> :
                   item.type === 'bugfix' ? <AlertCircle className="w-7 h-7 text-orange-600" /> :
                   <Megaphone className="w-7 h-7 text-purple-600" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        {item.isNew && (
                          <Badge className="bg-blue-600 text-white">NEW</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Badge variant="outline" className="capitalize">{item.type}</Badge>
                        <span>Version {item.version}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{item.description}</p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      Highlights
                    </h4>
                    <ul className="space-y-2">
                      {item.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Read More
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Changelog
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Love What You See?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us improve by sharing your feedback and suggestions for future updates.
              </p>
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Share Feedback
                </Button>
                <Button variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Rate Us
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= MAIN RENDER =============

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <Card className="border-0 shadow-md sticky top-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Settings
                </h3>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {activeSection === 'user-settings' && renderUserSettings()}
            {activeSection === 'priority-modules' && renderPriorityModules()}
            {activeSection === 'contacts' && renderContacts()}
            {activeSection === 'billing' && renderBilling()}
            {activeSection === 'support' && renderSupport()}
            {activeSection === 'audit-log' && renderAuditLog()}
            {activeSection === 'admin-settings' && renderAdminSettings()}
            {activeSection === 'whats-new' && renderWhatsNew()}
          </div>
        </div>
      </div>
    </div>
  );
}
