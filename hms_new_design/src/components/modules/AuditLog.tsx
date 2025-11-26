import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  X,
  Search,
  Calendar,
  User,
  Activity,
  Download,
  Filter,
  RefreshCw,
  FileText,
  Settings,
  Trash2,
  Edit,
  UserPlus,
  UserMinus,
  LogIn,
  LogOut,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  role: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'settings' | 'error';
  module: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
}

const mockAuditData: AuditEntry[] = [
  {
    id: '1',
    timestamp: '24/11/2025 - 06:30PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL - Changed email and phone number',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '2',
    timestamp: '24/11/2025 - 06:28PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL - Modified permissions',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '3',
    timestamp: '24/11/2025 - 04:33PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL - Profile information updated',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '4',
    timestamp: '24/11/2025 - 04:33PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL - Role assignment changed',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '5',
    timestamp: '24/11/2025 - 03:47PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Created User',
    actionType: 'create',
    module: 'User Management',
    details: 'Created User KUNISHA - New nurse account',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '6',
    timestamp: '24/11/2025 - 03:27PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Created User',
    actionType: 'create',
    module: 'User Management',
    details: 'Created User MADDOCK AHMAD - New doctor account',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '7',
    timestamp: '24/11/2025 - 02:52PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '8',
    timestamp: '24/11/2025 - 02:52PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '9',
    timestamp: '24/11/2025 - 02:48PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '10',
    timestamp: '24/11/2025 - 02:48PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '11',
    timestamp: '24/11/2025 - 02:46PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User AFSANA KANWAL',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '12',
    timestamp: '24/11/2025 - 02:30PM',
    user: 'DR Asim Ijaz',
    userId: 'USR-045',
    role: 'Doctor',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User DR Asim Ijaz - Profile photo changed',
    ipAddress: '192.168.1.105',
    status: 'success'
  },
  {
    id: '13',
    timestamp: '24/11/2025 - 02:30PM',
    user: 'DR Asim Ijaz',
    userId: 'USR-045',
    role: 'Doctor',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User DR Asim Ijaz - Contact information updated',
    ipAddress: '192.168.1.105',
    status: 'success'
  },
  {
    id: '14',
    timestamp: '24/11/2025 - 02:24PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Created User',
    actionType: 'create',
    module: 'User Management',
    details: 'Created User naseer - New pharmacist account',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '15',
    timestamp: '24/11/2025 - 02:10PM',
    user: 'khadija afzal',
    userId: 'USR-023',
    role: 'Nurse',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User khadija afzal - Shift schedule modified',
    ipAddress: '192.168.1.102',
    status: 'success'
  },
  {
    id: '16',
    timestamp: '24/11/2025 - 02:10PM',
    user: 'khadija afzal',
    userId: 'USR-023',
    role: 'Nurse',
    action: 'Updated User',
    actionType: 'update',
    module: 'User Management',
    details: 'Updated User khadija afzal - Department reassignment',
    ipAddress: '192.168.1.102',
    status: 'success'
  },
  {
    id: '17',
    timestamp: '24/11/2025 - 01:45PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Deleted Patient Record',
    actionType: 'delete',
    module: 'Patient Management',
    details: 'Deleted Patient Record - MRN: PAT-2024-1234 (Duplicate entry)',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '18',
    timestamp: '24/11/2025 - 01:30PM',
    user: 'DR Asim Ijaz',
    userId: 'USR-045',
    role: 'Doctor',
    action: 'Viewed Patient Record',
    actionType: 'view',
    module: 'Patient Management',
    details: 'Viewed Patient Record - MRN: PAT-2024-5678',
    ipAddress: '192.168.1.105',
    status: 'success'
  },
  {
    id: '19',
    timestamp: '24/11/2025 - 01:15PM',
    user: 'AFSANA KANWAL',
    userId: 'USR-001',
    role: 'Admin',
    action: 'Login',
    actionType: 'login',
    module: 'Authentication',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: '20',
    timestamp: '24/11/2025 - 12:45PM',
    user: 'System',
    userId: 'SYS-001',
    role: 'System',
    action: 'Backup Failed',
    actionType: 'error',
    module: 'System',
    details: 'Database backup failed - Insufficient storage space',
    ipAddress: 'localhost',
    status: 'failed'
  }
];

const actionTypes = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'view', label: 'View' },
  { value: 'export', label: 'Export' },
  { value: 'settings', label: 'Settings' },
  { value: 'error', label: 'Error' }
];

const users = [
  'All Users',
  'AFSANA KANWAL',
  'DR Asim Ijaz',
  'khadija afzal',
  'KUNISHA',
  'MADDOCK AHMAD',
  'naseer'
];

interface AuditLogProps {
  onClose?: () => void;
}

export function AuditLog({ onClose }: AuditLogProps) {
  const [dateFrom, setDateFrom] = useState('2025-11-24');
  const [dateTo, setDateTo] = useState('2025-11-24');
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedAction, setSelectedAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter audit data
  const filteredData = mockAuditData.filter(entry => {
    const matchesUser = selectedUser === 'All Users' || entry.user === selectedUser;
    const matchesAction = selectedAction === 'all' || entry.actionType === selectedAction;
    const matchesSearch = 
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.module.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesUser && matchesAction && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <UserPlus className="w-4 h-4" />;
      case 'update':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'login':
        return <LogIn className="w-4 h-4" />;
      case 'logout':
        return <LogOut className="w-4 h-4" />;
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      case 'login':
        return 'bg-purple-100 text-purple-700';
      case 'logout':
        return 'bg-gray-100 text-gray-700';
      case 'view':
        return 'bg-cyan-100 text-cyan-700';
      case 'export':
        return 'bg-indigo-100 text-indigo-700';
      case 'settings':
        return 'bg-orange-100 text-orange-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    toast.success('Audit log exported successfully', {
      description: `Exported ${filteredData.length} entries to CSV file`
    });
  };

  const handleRefresh = () => {
    toast.success('Audit log refreshed');
  };

  // Calculate statistics
  const stats = {
    total: mockAuditData.length,
    creates: mockAuditData.filter(e => e.actionType === 'create').length,
    updates: mockAuditData.filter(e => e.actionType === 'update').length,
    deletes: mockAuditData.filter(e => e.actionType === 'delete').length,
    errors: mockAuditData.filter(e => e.status === 'failed').length
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">Audit Log</h1>
              <p className="text-sm text-gray-500 mt-1">Track all system activities and user actions</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Creates</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.creates}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Updates</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.updates}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Deletes</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.deletes}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.errors}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date Range */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">From Date</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2">To Date</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* User Filter */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">Select Users</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Filter */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">Select Actions</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by user, action, module, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">DATE</TableHead>
                    <TableHead className="font-semibold">USER</TableHead>
                    <TableHead className="font-semibold">ROLE</TableHead>
                    <TableHead className="font-semibold">ACTION</TableHead>
                    <TableHead className="font-semibold">MODULE</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                    <TableHead className="font-semibold">IP ADDRESS</TableHead>
                    <TableHead className="font-semibold text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {entry.timestamp}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {entry.user.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{entry.user}</p>
                            <p className="text-xs text-gray-500">{entry.userId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getActionColor(entry.actionType)} text-xs`}>
                            {getActionIcon(entry.actionType)}
                            <span className="ml-1">{entry.action}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {entry.module}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(entry.status)} text-xs capitalize`}>
                          {entry.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {entry.ipAddress}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export Entry
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'bg-blue-600' : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 py-1">...</span>
                      <Button
                        variant={currentPage === totalPages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className={currentPage === totalPages ? 'bg-blue-600' : ''}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
