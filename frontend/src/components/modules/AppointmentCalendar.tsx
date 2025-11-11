import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AvailableDate } from '../../services/api';
import { cn } from '../ui/utils';

interface AppointmentCalendarProps {
  currentMonth: Date;
  availableDates: AvailableDate[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onMonthChange: (month: Date) => void;
}

export function AppointmentCalendar({
  currentMonth,
  availableDates,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: AppointmentCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get first day of month and number of days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Create a map of available dates for quick lookup
  const availableDatesMap = new Map<string, AvailableDate>();
  availableDates.forEach((date) => {
    availableDatesMap.set(date.date, date);
  });

  // Navigate months
  const goToPreviousMonth = () => {
    const newMonth = new Date(year, month - 1, 1);
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(year, month + 1, 1);
    onMonthChange(newMonth);
  };

  // Check if date is today
  const isToday = (day: number) => {
    const date = new Date(year, month, day);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPast = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get date string in YYYY-MM-DD format
  const getDateString = (day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  // Get availability info for a date
  const getAvailabilityInfo = (day: number) => {
    const dateStr = getDateString(day);
    return availableDatesMap.get(dateStr);
  };

  // Get availability indicator color
  const getAvailabilityColor = (info: AvailableDate | undefined) => {
    if (!info) return 'bg-gray-100';
    if (!info.has_availability) return 'bg-gray-200';
    const ratio = info.available_slots_count / info.total_slots;
    if (ratio >= 0.7) return 'bg-green-500';
    if (ratio >= 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = getDateString(day);
            const isSelected = selectedDate === dateStr;
            const isTodayDate = isToday(day);
            const isPastDate = isPast(day);
            const availabilityInfo = getAvailabilityInfo(day);
            const hasAvailability = availabilityInfo?.has_availability ?? false;

            return (
              <button
                key={day}
                onClick={() => {
                  if (!isPastDate && hasAvailability) {
                    onDateSelect(dateStr);
                  }
                }}
                disabled={isPastDate || !hasAvailability}
                className={cn(
                  'aspect-square rounded-md text-sm font-medium transition-colors relative',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected && 'bg-primary text-primary-foreground',
                  isTodayDate && !isSelected && 'ring-2 ring-primary',
                  (isPastDate || !hasAvailability) && 'opacity-50 cursor-not-allowed',
                  !isPastDate && hasAvailability && 'cursor-pointer'
                )}
              >
                <span>{day}</span>
                {/* Availability Indicator */}
                {availabilityInfo && hasAvailability && (
                  <span
                    className={cn(
                      'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                      getAvailabilityColor(availabilityInfo)
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Full</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

