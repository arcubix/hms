/**
 * Emergency Duty Roster Component
 * Displays duty roster in Day, Week, and Month views
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Edit,
  Download,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DutyShift {
  id: string;
  staffName: string;
  staffId: string;
  role: string;
  startTime: string;
  endTime: string;
  date: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  color: string;
}

interface EmergencyDutyRosterProps {
  onClose: () => void;
}

export function EmergencyDutyRoster({ onClose }: EmergencyDutyRosterProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedWard, setSelectedWard] = useState('Emergency');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 23)); // November 23, 2025
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; time: string } | null>(null);

  // Sample duty shifts data
  const [dutyShifts, setDutyShifts] = useState<DutyShift[]>([
    {
      id: '1',
      staffName: 'Dr. Sarah Johnson',
      staffId: 'DOC001',
      role: 'Emergency Physician',
      startTime: '08:00',
      endTime: '16:00',
      date: '2025-11-23',
      shiftType: 'Morning',
      color: '#3B82F6'
    },
    {
      id: '2',
      staffName: 'Nurse Michael Chen',
      staffId: 'NUR023',
      role: 'ER Nurse',
      startTime: '16:00',
      endTime: '00:00',
      date: '2025-11-23',
      shiftType: 'Evening',
      color: '#10B981'
    }
  ]);

  // Generate hours for day/week view (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const period = i < 12 ? 'am' : 'pm';
    return `${hour}${period}`;
  });

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Get week days for week view
  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date.setDate(diff));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // Format date
  const formatDate = (date: Date, format: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (format === 'full-day') {
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (format === 'month-year') {
      return `${months[date.getMonth()].toUpperCase()} ${date.getFullYear()}`;
    } else if (format === 'week-range') {
      const weekDays = getWeekDays(new Date(date));
      const start = weekDays[0];
      const end = weekDays[6];
      return `${shortMonths[start.getMonth()].toUpperCase()} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    } else if (format === 'short-date') {
      return `${shortMonths[date.getMonth()]} ${date.getDate()}`;
    }
    return date.toLocaleDateString();
  };

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2025, 10, 23)); // Set to November 23, 2025 for demo
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
    }
  };

  const handleAddShift = () => {
    setShowAddShiftDialog(true);
  };

  const handleSaveShift = () => {
    toast.success('Duty shift added successfully!');
    setShowAddShiftDialog(false);
  };

  // Render Day View
  const renderDayView = () => {
    return (
      <div className="border rounded-lg bg-white">
        {/* Day Header */}
        <div className="border-b bg-gray-50 px-4 py-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">
              {formatDate(currentDate, 'full-day').split(',')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <div className="relative">
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="border-b hover:bg-blue-50 transition-colors cursor-pointer"
                style={{ height: '60px' }}
                onClick={() => {
                  setSelectedTimeSlot({ 
                    date: currentDate.toISOString().split('T')[0], 
                    time: hour 
                  });
                  handleAddShift();
                }}
              >
                <div className="flex h-full">
                  <div className="w-16 flex-shrink-0 px-2 py-2 text-xs text-gray-500 text-right border-r">
                    {hour}
                  </div>
                  <div className="flex-1 px-3 py-2 relative bg-blue-50">
                    {/* Render shifts for this time slot */}
                    {dutyShifts
                      .filter(shift => {
                        const shiftDate = new Date(shift.date);
                        const isSameDay = shiftDate.toDateString() === currentDate.toDateString();
                        const shiftHour = parseInt(shift.startTime.split(':')[0]);
                        return isSameDay && shiftHour === index;
                      })
                      .map(shift => (
                        <div
                          key={shift.id}
                          className="absolute left-3 right-3 rounded px-2 py-1 text-xs text-white shadow-sm"
                          style={{ 
                            backgroundColor: shift.color,
                            top: '4px',
                            height: 'calc(100% - 8px)'
                          }}
                        >
                          <div className="font-medium">{shift.staffName}</div>
                          <div className="text-xs opacity-90">{shift.role}</div>
                          <div className="text-xs opacity-75">{shift.startTime} - {shift.endTime}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDays = getWeekDays(new Date(currentDate));
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
      <div className="border rounded-lg bg-white overflow-hidden">
        {/* Week Header */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="border-r"></div>
          {weekDays.map((day, index) => (
            <div key={index} className="border-r last:border-r-0 px-2 py-3 text-center">
              <div className="text-xs font-medium text-gray-600">{dayNames[index]}</div>
              <div className="text-sm text-gray-500 mt-1">
                {formatDate(day, 'short-date')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {hours.map((hour, hourIndex) => (
            <div key={hour} className="grid grid-cols-8 border-b hover:bg-gray-50">
              <div className="border-r px-2 py-2 text-xs text-gray-500 text-right" style={{ height: '60px' }}>
                {hour}
              </div>
              {weekDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-r last:border-r-0 px-2 py-1 relative cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{ height: '60px' }}
                  onClick={() => {
                    setSelectedTimeSlot({ 
                      date: day.toISOString().split('T')[0], 
                      time: hour 
                    });
                    handleAddShift();
                  }}
                >
                  {/* Render shifts for this day/time */}
                  {dutyShifts
                    .filter(shift => {
                      const shiftDate = new Date(shift.date);
                      const isSameDay = shiftDate.toDateString() === day.toDateString();
                      const shiftHour = parseInt(shift.startTime.split(':')[0]);
                      return isSameDay && shiftHour === hourIndex;
                    })
                    .map(shift => (
                      <div
                        key={shift.id}
                        className="absolute inset-1 rounded px-1 py-1 text-xs text-white shadow-sm overflow-hidden"
                        style={{ backgroundColor: shift.color }}
                      >
                        <div className="font-medium truncate text-xs">{shift.staffName.split(' ')[1]}</div>
                      </div>
                    ))}
                  {dayIndex === 6 && hourIndex >= 3 && hourIndex <= 10 && (
                    <div className="absolute inset-1 rounded bg-blue-200"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(new Date(currentDate));
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    // Adjust starting day (0 = Sunday in JS, but we want Monday = 0)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const weeks = [];
    let days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
      
      if (days.length === 7) {
        weeks.push([...days]);
        days = [];
      }
    }
    
    // Add remaining days to complete the last week
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(null);
      }
      weeks.push(days);
    }

    return (
      <div className="border rounded-lg bg-white overflow-hidden">
        {/* Month Header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {dayNames.map((day) => (
            <div key={day} className="border-r last:border-r-0 px-2 py-3 text-center">
              <div className="text-xs font-medium text-gray-600">{day}</div>
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b">
              {week.map((day, dayIndex) => {
                const isToday = day === 23 && month === 10; // November 23
                const date = day ? new Date(year, month, day) : null;
                
                return (
                  <div
                    key={dayIndex}
                    className={`border-r last:border-r-0 px-2 py-2 relative cursor-pointer hover:bg-blue-50 transition-colors ${
                      !day ? 'bg-gray-50' : ''
                    }`}
                    style={{ minHeight: '120px' }}
                    onClick={() => {
                      if (day && date) {
                        setSelectedTimeSlot({ 
                          date: date.toISOString().split('T')[0], 
                          time: '09:00' 
                        });
                        handleAddShift();
                      }
                    }}
                  >
                    {day && (
                      <>
                        <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        {/* Show shifts count for this day */}
                        {dutyShifts.filter(shift => {
                          const shiftDate = new Date(shift.date);
                          return date && shiftDate.toDateString() === date.toDateString();
                        }).length > 0 && (
                          <div className="mt-1">
                            <div className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 inline-block">
                              {dutyShifts.filter(shift => {
                                const shiftDate = new Date(shift.date);
                                return date && shiftDate.toDateString() === date.toDateString();
                              }).length} shifts
                            </div>
                          </div>
                        )}
                        {/* Highlight November 23 */}
                        {day === 23 && month === 10 && (
                          <div className="absolute inset-2 bg-blue-100 rounded -z-10"></div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl text-gray-900">Emergency Duty Roster</h1>
              <p className="text-sm text-gray-500 mt-1">Manage staff duty schedules and shifts</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={handleAddShift}
                className="bg-[#2F80ED] hover:bg-[#2F80ED]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Shift
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Ward Selector */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Select Ward</label>
                <Select value={selectedWard} onValueChange={setSelectedWard}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="General Ward">General Ward</SelectItem>
                    <SelectItem value="Pediatric">Pediatric</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">&nbsp;</label>
                <Input
                  type="date"
                  value={currentDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="w-48"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Navigation */}
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className={viewMode === 'day' ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90' : ''}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90' : ''}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'bg-[#2F80ED] hover:bg-[#2F80ED]/90' : ''}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>

          {/* Date Display */}
          <div className="text-center mt-4">
            <div className="text-sm font-medium text-gray-700">
              {viewMode === 'day' && formatDate(currentDate, 'full-day').toUpperCase()}
              {viewMode === 'week' && formatDate(currentDate, 'week-range')}
              {viewMode === 'month' && formatDate(currentDate, 'month-year')}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="relative">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}

          {/* Floating Action Buttons */}
          <div className="fixed right-8 bottom-8 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-14 h-14 rounded-full bg-[#2F80ED] hover:bg-[#2F80ED]/90 shadow-lg"
              onClick={handleAddShift}
            >
              <Plus className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full bg-white shadow-lg"
            >
              <Edit className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full bg-white shadow-lg"
            >
              <Users className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={showAddShiftDialog} onOpenChange={setShowAddShiftDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Duty Shift</DialogTitle>
            <DialogDescription>
              Schedule a new duty shift for staff member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staff Member *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doc1">Dr. Sarah Johnson (DOC001)</SelectItem>
                    <SelectItem value="doc2">Dr. Michael Chen (DOC002)</SelectItem>
                    <SelectItem value="nur1">Nurse Emily Davis (NUR023)</SelectItem>
                    <SelectItem value="nur2">Nurse James Wilson (NUR024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physician">Emergency Physician</SelectItem>
                    <SelectItem value="nurse">ER Nurse</SelectItem>
                    <SelectItem value="technician">ER Technician</SelectItem>
                    <SelectItem value="paramedic">Paramedic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  defaultValue={selectedTimeSlot?.date || currentDate.toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label>Shift Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (08:00 - 16:00)</SelectItem>
                    <SelectItem value="evening">Evening (16:00 - 00:00)</SelectItem>
                    <SelectItem value="night">Night (00:00 - 08:00)</SelectItem>
                    <SelectItem value="custom">Custom Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  defaultValue={selectedTimeSlot?.time || "08:00"}
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input type="time" defaultValue="16:00" />
              </div>
            </div>

            <div>
              <Label>Ward/Department *</Label>
              <Select defaultValue={selectedWard}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency">Emergency Department</SelectItem>
                  <SelectItem value="ICU">Intensive Care Unit</SelectItem>
                  <SelectItem value="General Ward">General Ward</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Input placeholder="Add any additional notes..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddShiftDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveShift} className="bg-[#2F80ED] hover:bg-[#2F80ED]/90">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
