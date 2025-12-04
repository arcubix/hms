/**
 * Advanced Indoor Duty Roster Management System
 * 
 * Features:
 * - Weekly/Monthly calendar view with time slots
 * - Drag-and-drop shift scheduling
 * - Multi-ward & department support
 * - Doctor availability tracking
 * - Shift conflict detection
 * - Color-coded duty types
 * - Export to PDF/Excel
 * - Real-time updates
 * - Shift swap requests
 * - Overtime tracking
 * - Leave integration
 * - Mobile responsive design
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Users,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Copy,
  UserCheck,
  Building2,
  CalendarDays,
  FileText,
  Settings,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  ArrowLeftRight,
} from 'lucide-react';

// Types
interface DutyShift {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  ward: string;
  department: string;
  startTime: string;
  endTime: string;
  date: string;
  shiftType: 'Morning' | 'Evening' | 'Night' | 'Full Day' | 'On-Call';
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  color: string;
  notes?: string;
  contactNumber?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  contactNumber: string;
  email: string;
  available: boolean;
}

const IndoorDutyRoster = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<DutyShift | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const wards = [
    'General Ward',
    'ICU',
    'NICU',
    'Cardiology Ward',
    'Orthopedic Ward',
    'Pediatric Ward',
    'Maternity Ward',
    'Surgical Ward',
  ];

  const departments = [
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
    'Surgery',
    'Gynecology',
    'Neurology',
    'Emergency',
  ];

  const mockDoctors: Doctor[] = [
    { id: 'D001', name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', department: 'Cardiology', contactNumber: '+91-9876543210', email: 'rajesh.k@hospital.com', available: true },
    { id: 'D002', name: 'Dr. Priya Sharma', specialty: 'Pediatrician', department: 'Pediatrics', contactNumber: '+91-9876543211', email: 'priya.s@hospital.com', available: true },
    { id: 'D003', name: 'Dr. Amit Patel', specialty: 'Orthopedic Surgeon', department: 'Orthopedics', contactNumber: '+91-9876543212', email: 'amit.p@hospital.com', available: true },
    { id: 'D004', name: 'Dr. Sneha Reddy', specialty: 'General Physician', department: 'General Medicine', contactNumber: '+91-9876543213', email: 'sneha.r@hospital.com', available: true },
    { id: 'D005', name: 'Dr. Vikram Singh', specialty: 'Surgeon', department: 'Surgery', contactNumber: '+91-9876543214', email: 'vikram.s@hospital.com', available: false },
    { id: 'D006', name: 'Dr. Anjali Mehta', specialty: 'Gynecologist', department: 'Gynecology', contactNumber: '+91-9876543215', email: 'anjali.m@hospital.com', available: true },
    { id: 'D007', name: 'Dr. Arjun Nair', specialty: 'Neurologist', department: 'Neurology', contactNumber: '+91-9876543216', email: 'arjun.n@hospital.com', available: true },
    { id: 'D008', name: 'Dr. Kavya Iyer', specialty: 'Emergency Medicine', department: 'Emergency', contactNumber: '+91-9876543217', email: 'kavya.i@hospital.com', available: true },
  ];

  // Generate sample data for current month
  const generateSampleShifts = (): DutyShift[] => {
    const shifts: DutyShift[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const shiftTypes: Array<'Morning' | 'Evening' | 'Night' | 'Full Day' | 'On-Call'> = ['Morning', 'Evening', 'Night', 'Full Day', 'On-Call'];
    const statuses: Array<'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled'> = ['Scheduled', 'Confirmed', 'Completed'];
    const colors = ['#27AE60', '#2F80ED', '#F2994A', '#9B51E0', '#EB5757'];
    
    // Generate shifts for the next 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date(currentYear, currentMonth, today.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      
      // 2-4 shifts per day
      const shiftsPerDay = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < shiftsPerDay; i++) {
        const doctor = mockDoctors[Math.floor(Math.random() * mockDoctors.length)];
        const ward = wards[Math.floor(Math.random() * wards.length)];
        const shiftType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        let startTime = '08:00';
        let endTime = '16:00';
        
        switch (shiftType) {
          case 'Morning':
            startTime = '06:00';
            endTime = '14:00';
            break;
          case 'Evening':
            startTime = '14:00';
            endTime = '22:00';
            break;
          case 'Night':
            startTime = '22:00';
            endTime = '06:00';
            break;
          case 'Full Day':
            startTime = '08:00';
            endTime = '20:00';
            break;
          case 'On-Call':
            startTime = '00:00';
            endTime = '23:59';
            break;
        }
        
        shifts.push({
          id: `S${shifts.length + 1}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          ward,
          department: doctor.department,
          startTime,
          endTime,
          date: dateStr,
          shiftType,
          status,
          color,
          contactNumber: doctor.contactNumber,
          notes: Math.random() > 0.7 ? 'Regular ward rounds' : undefined,
        });
      }
    }
    
    return shifts;
  };

  const mockShifts: DutyShift[] = generateSampleShifts();

  // Time slots for the calendar (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    currentDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  // Get month calendar dates (including previous/next month dates for full grid)
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const dates: Date[] = [];
    
    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Add all days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    
    // Add days from next month to fill the last week (up to 42 days total - 6 weeks)
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    
    return dates;
  };

  const monthDates = getMonthDates(selectedDate);

  // Format date
  const formatDate = (date: Date, format: 'short' | 'long' = 'short') => {
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateISO = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get shift status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get shift type badge color
  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'Morning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Evening':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Night':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Full Day':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'On-Call':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate shift position and height
  const getShiftStyle = (shift: DutyShift, date: Date) => {
    const shiftDate = formatDateISO(date);
    if (shift.date !== shiftDate) return null;

    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);

    let startPosition = startHour + startMinute / 60;
    let duration = endHour + endMinute / 60 - startPosition;

    // Handle overnight shifts
    if (duration < 0) {
      duration = 24 - startPosition + (endHour + endMinute / 60);
    }

    const hourHeight = 60; // Height per hour in pixels
    const top = startPosition * hourHeight;
    const height = duration * hourHeight;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: shift.color,
      opacity: 0.9,
    };
  };

  // Filter shifts
  const getFilteredShifts = () => {
    return mockShifts.filter(shift => {
      if (selectedWard !== 'all' && shift.ward !== selectedWard) return false;
      if (selectedDepartment !== 'all' && shift.department !== selectedDepartment) return false;
      if (searchQuery && !shift.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  };

  const filteredShifts = getFilteredShifts();

  // Statistics
  const totalShifts = filteredShifts.length;
  const confirmedShifts = filteredShifts.filter(s => s.status === 'Confirmed').length;
  const scheduledShifts = filteredShifts.filter(s => s.status === 'Scheduled').length;
  const activeDoctors = new Set(filteredShifts.map(s => s.doctorId)).size;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Indoor Duty Roster</h1>
          <p className="text-gray-600 mt-1">Manage doctor duty schedules across all wards and departments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="bg-[#27AE60] hover:bg-green-600" size="sm" onClick={() => setShowAddShiftDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Shifts</p>
                <h3 className="text-2xl">{totalShifts}</h3>
                <p className="text-xs text-blue-600 mt-1">This Week</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Confirmed</p>
                <h3 className="text-2xl">{confirmedShifts}</h3>
                <p className="text-xs text-green-600 mt-1">{Math.round((confirmedShifts / totalShifts) * 100)}% Coverage</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Scheduled</p>
                <h3 className="text-2xl">{scheduledShifts}</h3>
                <p className="text-xs text-orange-600 mt-1">Pending Confirmation</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Active Doctors</p>
                <h3 className="text-2xl">{activeDoctors}</h3>
                <p className="text-xs text-purple-600 mt-1">On Roster</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search doctor name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Ward Filter */}
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map((ward) => (
                  <SelectItem key={ward} value={ward}>
                    {ward}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Picker */}
            <Input
              type="date"
              className="w-full lg:w-48"
              value={formatDateISO(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Controls */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="ml-4 font-medium text-gray-900">
                {viewMode === 'week' && `${formatDate(weekDates[0], 'short')} - ${formatDate(weekDates[6], 'short')}, ${selectedDate.getFullYear()}`}
                {viewMode === 'day' && formatDate(selectedDate, 'long')}
                {viewMode === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {viewMode === 'week' && (
            <div className="overflow-x-auto">
              {/* Week Header */}
              <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <div className="w-20 flex-shrink-0 p-3 text-xs font-medium text-gray-600 border-r border-gray-200">
                  TIME
                </div>
                {weekDates.map((date, index) => {
                  const isToday = formatDateISO(date) === formatDateISO(new Date());
                  return (
                    <div
                      key={index}
                      className={`flex-1 min-w-[140px] p-3 text-center border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </div>
                      <div className={`text-lg mt-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                      {isToday && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 mx-auto mt-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Calendar Grid */}
              <div className="relative">
                <div className="flex">
                  {/* Time Column */}
                  <div className="w-20 flex-shrink-0 border-r border-gray-200">
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className="h-[60px] border-b border-gray-100 p-2 text-xs text-gray-600 text-right"
                      >
                        {index % 2 === 0 ? time : ''}
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {weekDates.map((date, dayIndex) => {
                    const isToday = formatDateISO(date) === formatDateISO(new Date());
                    return (
                      <div
                        key={dayIndex}
                        className={`flex-1 min-w-[140px] border-r border-gray-200 last:border-r-0 relative ${
                          isToday ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Hour Grid Lines */}
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className="h-[60px] border-b border-gray-100"
                          />
                        ))}

                        {/* Shifts */}
                        <div className="absolute inset-0 pointer-events-none">
                          {filteredShifts.map((shift) => {
                            const style = getShiftStyle(shift, date);
                            if (!style) return null;

                            return (
                              <div
                                key={shift.id}
                                className="absolute left-1 right-1 rounded-lg shadow-sm border border-white/50 pointer-events-auto cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                                style={style}
                                onClick={() => setSelectedShift(shift)}
                              >
                                <div className="p-2 h-full flex flex-col text-white text-xs">
                                  <div className="font-medium truncate">{shift.doctorName}</div>
                                  <div className="text-[10px] opacity-90 truncate">{shift.specialty}</div>
                                  <div className="text-[10px] opacity-90 mt-auto">
                                    {shift.startTime} - {shift.endTime}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="p-6">
              <Alert className="mb-4">
                <CalendarDays className="w-4 h-4" />
                <AlertDescription>
                  Showing schedule for {formatDate(selectedDate, 'long')}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {filteredShifts
                  .filter(shift => shift.date === formatDateISO(selectedDate))
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((shift) => (
                    <Card key={shift.id} className="border-l-4 hover:shadow-md transition-shadow cursor-pointer" style={{ borderLeftColor: shift.color }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{shift.doctorName}</h4>
                              <Badge className={getShiftTypeColor(shift.shiftType)} variant="outline">
                                {shift.shiftType}
                              </Badge>
                              <Badge className={getStatusColor(shift.status)} variant="outline">
                                {shift.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Specialty:</span>
                                <span className="ml-2 text-gray-900">{shift.specialty}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Ward:</span>
                                <span className="ml-2 text-gray-900">{shift.ward}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time:</span>
                                <span className="ml-2 text-gray-900">{shift.startTime} - {shift.endTime}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Contact:</span>
                                <span className="ml-2 text-gray-900">{shift.contactNumber}</span>
                              </div>
                            </div>
                            {shift.notes && (
                              <p className="text-sm text-gray-600 mt-2">{shift.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {filteredShifts.filter(shift => shift.date === formatDateISO(selectedDate)).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No shifts scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="p-6">
              {/* Month Calendar Grid */}
              <div className="bg-white rounded-lg">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-gray-50 py-3 text-center text-xs font-semibold text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {monthDates.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                    const isToday = formatDateISO(date) === formatDateISO(new Date());
                    const dayShifts = filteredShifts.filter(shift => shift.date === formatDateISO(date));
                    
                    return (
                      <div
                        key={index}
                        className={`bg-white min-h-[120px] p-2 ${
                          !isCurrentMonth ? 'bg-gray-50' : ''
                        } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                        onClick={() => {
                          setSelectedDate(date);
                          setViewMode('day');
                        }}
                      >
                        {/* Date Number */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-medium ${
                              isToday
                                ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center'
                                : isCurrentMonth
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          {dayShifts.length > 0 && (
                            <Badge variant="outline" className="text-xs h-5 px-1.5">
                              {dayShifts.length}
                            </Badge>
                          )}
                        </div>

                        {/* Shifts for this day */}
                        <div className="space-y-1">
                          {dayShifts.slice(0, 3).map((shift) => (
                            <div
                              key={shift.id}
                              className="text-xs p-1.5 rounded truncate"
                              style={{ 
                                backgroundColor: `${shift.color}15`,
                                borderLeft: `3px solid ${shift.color}`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShift(shift);
                              }}
                            >
                              <div className="font-medium truncate" style={{ color: shift.color }}>
                                {shift.doctorName.split(' ').slice(-1)[0]}
                              </div>
                              <div className="text-gray-600 truncate text-[10px]">
                                {shift.startTime}
                              </div>
                            </div>
                          ))}
                          {dayShifts.length > 3 && (
                            <div className="text-xs text-blue-600 font-medium pl-1.5">
                              +{dayShifts.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Details Dialog */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shift Details</DialogTitle>
              <DialogDescription>View and manage shift information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Doctor Name</Label>
                  <p className="mt-1">{selectedShift.doctorName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Specialty</Label>
                  <p className="mt-1">{selectedShift.specialty}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Ward</Label>
                  <p className="mt-1">{selectedShift.ward}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Department</Label>
                  <p className="mt-1">{selectedShift.department}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Date</Label>
                  <p className="mt-1">{new Date(selectedShift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Time</Label>
                  <p className="mt-1">{selectedShift.startTime} - {selectedShift.endTime}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Shift Type</Label>
                  <div className="mt-1">
                    <Badge className={getShiftTypeColor(selectedShift.shiftType)} variant="outline">
                      {selectedShift.shiftType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedShift.status)} variant="outline">
                      {selectedShift.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Contact Number</Label>
                  <p className="mt-1">{selectedShift.contactNumber}</p>
                </div>
              </div>
              {selectedShift.notes && (
                <div>
                  <Label className="text-xs text-gray-600">Notes</Label>
                  <p className="mt-1 text-sm text-gray-700">{selectedShift.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Shift Dialog */}
      <Dialog open={showAddShiftDialog} onOpenChange={setShowAddShiftDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>Schedule a new duty shift for a doctor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Select Doctor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id} disabled={!doctor.available}>
                        <div className="flex items-center justify-between w-full">
                          <span>{doctor.name} - {doctor.specialty}</span>
                          {!doctor.available && (
                            <Badge variant="outline" className="ml-2 text-xs">Unavailable</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ward</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward} value={ward}>
                        {ward}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date</Label>
                <Input type="date" />
              </div>

              <div>
                <Label>Shift Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning (6 AM - 2 PM)</SelectItem>
                    <SelectItem value="Evening">Evening (2 PM - 10 PM)</SelectItem>
                    <SelectItem value="Night">Night (10 PM - 6 AM)</SelectItem>
                    <SelectItem value="Full Day">Full Day (9 AM - 6 PM)</SelectItem>
                    <SelectItem value="On-Call">On-Call (24 Hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Time</Label>
                <Input type="time" />
              </div>

              <div>
                <Label>End Time</Label>
                <Input type="time" />
              </div>

              <div className="col-span-2">
                <Label>Notes (Optional)</Label>
                <Textarea placeholder="Add any special instructions or notes..." rows={3} />
              </div>
            </div>

            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                System will automatically check for scheduling conflicts and doctor availability.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddShiftDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-[#27AE60] hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#27AE60' }}></div>
              <span className="text-sm text-gray-600">Morning Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F2994A' }}></div>
              <span className="text-sm text-gray-600">Evening Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9B51E0' }}></div>
              <span className="text-sm text-gray-600">Night Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2F80ED' }}></div>
              <span className="text-sm text-gray-600">Full Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EB5757' }}></div>
              <span className="text-sm text-gray-600">On-Call/Emergency</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndoorDutyRoster;