/**
 * Shift Management Component
 * 
 * Displays opening and closing shift details and summary
 * Features:
 * - List of all shifts (open and closed)
 * - Opening details (shift number, cashier, opening cash, start time)
 * - Closing details (closing cash, actual cash, difference, end time)
 * - Summary statistics (total sales, revenue, payment method breakdown)
 * - Filter by date range, status, cashier
 * - View detailed shift information
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface Shift {
  id: number;
  shift_number: string;
  cashier_id: number;
  cashier_name?: string;
  drawer_id?: number;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  actual_cash?: number;
  difference?: number;
  total_sales: number;
  total_revenue: number;
  cash_sales: number;
  card_sales: number;
  other_sales: number;
  status: 'Open' | 'Closed';
  handover_notes?: string;
  created_at: string;
  updated_at: string;
}

export function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadShifts();
  }, [startDate, endDate, statusFilter]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const filters: any = {
        start_date: startDate,
        end_date: endDate,
      };
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      const data = await api.getShifts(filters);
      setShifts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load shifts:', error);
      toast.error('Failed to load shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (shift: Shift) => {
    try {
      const detailedShift = await api.getShift(shift.id);
      setSelectedShift(detailedShift);
      setIsDetailDialogOpen(true);
    } catch (error: any) {
      toast.error('Failed to load shift details');
    }
  };

  const filteredShifts = shifts.filter(shift => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      shift.shift_number.toLowerCase().includes(term) ||
      shift.cashier_name?.toLowerCase().includes(term) ||
      shift.id.toString().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Open') {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Open</Badge>;
    }
    return <Badge className="bg-gray-500 text-white"><XCircle className="w-3 h-3 mr-1" />Closed</Badge>;
  };

  const getDifferenceBadge = (difference?: number) => {
    if (difference === undefined || difference === null) return null;
    if (difference >= 0) {
      return <Badge className="bg-green-100 text-green-800"><TrendingUp className="w-3 h-3 mr-1" />+PKR {Math.abs(difference).toFixed(2)}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800"><TrendingDown className="w-3 h-3 mr-1" />-PKR {Math.abs(difference).toFixed(2)}</Badge>;
  };

  // Calculate summary statistics
  const summary = {
    totalShifts: shifts.length,
    openShifts: shifts.filter(s => s.status === 'Open').length,
    closedShifts: shifts.filter(s => s.status === 'Closed').length,
    totalRevenue: shifts.reduce((sum, s) => sum + parseFloat(s.total_revenue?.toString() || '0'), 0),
    totalSales: shifts.reduce((sum, s) => sum + (s.total_sales || 0), 0),
    totalCashSales: shifts.reduce((sum, s) => sum + parseFloat(s.cash_sales?.toString() || '0'), 0),
    totalCardSales: shifts.reduce((sum, s) => sum + parseFloat(s.card_sales?.toString() || '0'), 0),
    totalOtherSales: shifts.reduce((sum, s) => sum + parseFloat(s.other_sales?.toString() || '0'), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-sm text-gray-600 mt-1">View opening and closing shift details and summary</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadShifts}
            disabled={loading}
            className="border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className="!bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 border-2"
            style={{ backgroundColor: '#2563eb', color: 'white' }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalShifts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <span className="text-green-600">Open: {summary.openShifts}</span>
              <span className="text-gray-600">Closed: {summary.closedShifts}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">PKR {summary.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{summary.totalSales} transactions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cash Sales</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">PKR {summary.totalCashSales.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {summary.totalRevenue > 0 
                ? ((summary.totalCashSales / summary.totalRevenue) * 100).toFixed(1) 
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Card Sales</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">PKR {summary.totalCardSales.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {summary.totalRevenue > 0 
                ? ((summary.totalCardSales / summary.totalRevenue) * 100).toFixed(1) 
                : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search</Label>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by shift number, cashier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Shifts ({filteredShifts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Loading shifts...</p>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No shifts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift Number</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Opening Cash</TableHead>
                    <TableHead>Closing Cash</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.shift_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{shift.cashier_name || `Cashier #${shift.cashier_id}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(shift.start_time).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {shift.end_time ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(shift.end_time).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        PKR {parseFloat(shift.opening_cash?.toString() || '0').toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {shift.closing_cash !== null && shift.closing_cash !== undefined ? (
                          <span className="font-semibold">
                            PKR {parseFloat(shift.closing_cash.toString()).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getDifferenceBadge(shift.difference)}
                      </TableCell>
                      <TableCell>{shift.total_sales || 0}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        PKR {parseFloat(shift.total_revenue?.toString() || '0').toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(shift.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(shift)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Shift Details: {selectedShift?.shift_number}
            </DialogTitle>
            <DialogDescription>
              Complete opening and closing information for this shift
            </DialogDescription>
          </DialogHeader>

          {selectedShift && (
            <div className="space-y-6 py-4">
              {/* Opening Details */}
              <Card className="border-2 border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Opening Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Shift Number</Label>
                      <p className="font-semibold text-lg">{selectedShift.shift_number}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Cashier</Label>
                      <p className="font-medium">{selectedShift.cashier_name || `Cashier #${selectedShift.cashier_id}`}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Start Time</Label>
                      <p className="font-medium">{new Date(selectedShift.start_time).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Opening Cash</Label>
                      <p className="font-bold text-xl text-blue-600">
                        PKR {parseFloat(selectedShift.opening_cash?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedShift.status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Closing Details */}
              {selectedShift.status === 'Closed' && (
                <Card className="border-2 border-green-200">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Closing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">End Time</Label>
                        <p className="font-medium">
                          {selectedShift.end_time 
                            ? new Date(selectedShift.end_time).toLocaleString()
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Expected Cash</Label>
                        <p className="font-semibold text-lg text-blue-600">
                          PKR {parseFloat(selectedShift.expected_cash?.toString() || '0').toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Actual Cash</Label>
                        <p className="font-semibold text-lg text-green-600">
                          PKR {parseFloat(selectedShift.actual_cash?.toString() || '0').toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Closing Cash</Label>
                        <p className="font-semibold text-lg">
                          PKR {parseFloat(selectedShift.closing_cash?.toString() || '0').toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Difference</Label>
                        <div className="mt-1">{getDifferenceBadge(selectedShift.difference)}</div>
                      </div>
                    </div>
                    {selectedShift.handover_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <Label className="text-xs text-gray-500">Handover Notes</Label>
                        <p className="text-sm text-gray-700 mt-1">{selectedShift.handover_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Sales Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Total Sales</Label>
                      <p className="font-bold text-2xl text-blue-600 mt-1">{selectedShift.total_sales || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Total Revenue</Label>
                      <p className="font-bold text-2xl text-green-600 mt-1">
                        PKR {parseFloat(selectedShift.total_revenue?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Cash Sales</Label>
                      <p className="font-bold text-xl text-yellow-600 mt-1">
                        PKR {parseFloat(selectedShift.cash_sales?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Card Sales</Label>
                      <p className="font-bold text-xl text-purple-600 mt-1">
                        PKR {parseFloat(selectedShift.card_sales?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {selectedShift.other_sales > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Other Sales (Insurance, Credit, etc.)</Label>
                      <p className="font-semibold text-lg text-gray-700 mt-1">
                        PKR {parseFloat(selectedShift.other_sales?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

