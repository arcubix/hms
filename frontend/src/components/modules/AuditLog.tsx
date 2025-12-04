import React, { useState, useEffect, useCallback } from 'react';
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
  Eye,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { api, AuditLog as AuditLogType, AuditLogStatistics, AuditLogFilters, AuditLogUser } from '../../services/api';

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

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateString;
  }
};

interface AuditLogProps {
  onClose?: () => void;
}

export function AuditLog({ onClose }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [stats, setStats] = useState<AuditLogStatistics>({
    total: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    logins: 0,
    logouts: 0,
    views: 0,
    exports: 0,
    settings: 0,
    errors: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 15;

  // Users and modules lists
  const [users, setUsers] = useState<AuditLogUser[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  // Detail view
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Load users and modules on mount
  useEffect(() => {
    loadUsers();
    loadModules();
  }, []);

  // Load logs when filters change
  useEffect(() => {
    loadLogs();
    loadStatistics();
  }, [dateFrom, dateTo, selectedUserId, selectedAction, selectedModule, currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadLogs();
      } else {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersList = await api.getAuditLogUsers();
      setUsers(usersList);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadModules = async () => {
    try {
      setLoadingModules(true);
      const modulesList = await api.getAuditLogModules();
      setModules(modulesList);
    } catch (err: any) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoadingModules(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: AuditLogFilters = {
        date_from: dateFrom,
        date_to: dateTo,
        action_type: selectedAction as any,
        module: selectedModule !== 'all' ? selectedModule : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: itemsPerPage
      };

      if (selectedUserId) {
        filters.user_id = selectedUserId;
      }
      
      const response = await api.getAuditLogs(filters);
      setLogs(response.logs || []);
      setTotal(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load audit logs';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const filters: any = {
        date_from: dateFrom,
        date_to: dateTo
      };
      
      if (selectedUserId) {
        filters.user_id = selectedUserId;
      }
      
      const statistics = await api.getAuditLogStatistics(filters);
      setStats(statistics);
    } catch (err: any) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleRefresh = () => {
    loadLogs();
    loadStatistics();
    toast.success('Audit log refreshed');
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const filters: AuditLogFilters = {
        date_from: dateFrom,
        date_to: dateTo,
        action_type: selectedAction !== 'all' ? (selectedAction as any) : undefined,
        module: selectedModule !== 'all' ? selectedModule : undefined,
        search: searchQuery || undefined
      };

      if (selectedUserId) {
        filters.user_id = selectedUserId;
      }
      
      await api.exportAuditLogs(filters);
      toast.success('Audit log exported successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export audit logs';
      toast.error(errorMessage);
      console.error('Failed to export audit logs:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = async (logId: number) => {
    try {
      const log = await api.getAuditLog(logId);
      setSelectedLog(log);
      setShowDetailDialog(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load log details';
      toast.error(errorMessage);
      console.error('Failed to load log details:', err);
    }
  };

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

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
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700"
                disabled={exporting || loading}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                <Download className="w-4 h-4 mr-2" />
                Export
                  </>
                )}
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? '...' : stats.total}
                  </p>
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? '...' : stats.creates}
                  </p>
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? '...' : stats.updates}
                  </p>
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? '...' : stats.deletes}
                  </p>
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? '...' : stats.failed}
                  </p>
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
                <Select 
                  value={selectedUserId?.toString() || 'all'} 
                  onValueChange={(value) => setSelectedUserId(value === 'all' ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id.toString()}>
                        {user.user_name} ({user.user_role})
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

              {/* Module Filter */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">Select Module</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Loading State */}
        {loading && (
          <Card className="p-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading audit logs...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading audit logs</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={loadLogs} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Audit Table */}
        {!loading && !error && (
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
                    {logs.length > 0 ? (
                      logs.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                              {formatDate(entry.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                  {(entry.user_name || 'System').split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                                <p className="font-medium text-gray-900">{entry.user_name || 'System'}</p>
                                {entry.user_id && (
                                  <p className="text-xs text-gray-500">ID: {entry.user_id}</p>
                                )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                              {entry.user_role || 'System'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                              <Badge className={`${getActionColor(entry.action_type)} text-xs`}>
                                {getActionIcon(entry.action_type)}
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
                            {entry.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(entry.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No audit logs found</p>
                          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
              {logs.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {endIndex} of {total} entries
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
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
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
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 py-1">...</span>
                      <Button
                            variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
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
              )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Date & Time</Label>
                  <p className="text-gray-900 mt-1">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedLog.status)} text-xs capitalize`}>
                      {selectedLog.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">User</Label>
                  <p className="text-gray-900 mt-1">{selectedLog.user_name || 'System'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Role</Label>
                  <p className="text-gray-900 mt-1">{selectedLog.user_role || 'System'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Action Type</Label>
                  <div className="mt-1">
                    <Badge className={`${getActionColor(selectedLog.action_type)} text-xs`}>
                      {getActionIcon(selectedLog.action_type)}
                      <span className="ml-1 capitalize">{selectedLog.action_type}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Module</Label>
                  <p className="text-gray-900 mt-1">{selectedLog.module}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Action</Label>
                  <p className="text-gray-900 mt-1">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">IP Address</Label>
                  <p className="text-gray-900 font-mono mt-1">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                {selectedLog.entity_type && (
                  <div>
                    <Label className="text-sm text-gray-600">Entity Type</Label>
                    <p className="text-gray-900 mt-1">{selectedLog.entity_type}</p>
                  </div>
                )}
                {selectedLog.entity_id && (
                  <div>
                    <Label className="text-sm text-gray-600">Entity ID</Label>
                    <p className="text-gray-900 mt-1">{selectedLog.entity_id}</p>
                  </div>
                )}
                {selectedLog.request_method && (
                  <div>
                    <Label className="text-sm text-gray-600">Request Method</Label>
                    <p className="text-gray-900 mt-1">{selectedLog.request_method}</p>
                  </div>
                )}
                {selectedLog.request_url && (
                  <div>
                    <Label className="text-sm text-gray-600">Request URL</Label>
                    <p className="text-gray-900 font-mono text-xs mt-1 break-all">{selectedLog.request_url}</p>
                  </div>
                )}
              </div>

              {selectedLog.details && (
                <div>
                  <Label className="text-sm text-gray-600">Details</Label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedLog.details}</p>
                </div>
              )}

              {selectedLog.error_message && (
                <div>
                  <Label className="text-sm text-gray-600 text-red-600">Error Message</Label>
                  <p className="text-red-700 mt-1 whitespace-pre-wrap">{selectedLog.error_message}</p>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Metadata</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <Label className="text-sm text-gray-600">User Agent</Label>
                  <p className="text-gray-900 text-xs mt-1 break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
