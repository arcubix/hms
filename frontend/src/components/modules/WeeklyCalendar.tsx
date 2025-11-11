import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { AvailableSlot, AvailableDate } from '../../services/api';
import { cn } from '../ui/utils';

interface WeeklyCalendarProps {
  currentDate: Date;
  availableDates: AvailableDate[];
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onDateChange: (date: Date) => void;
  onSlotSelect: (slot: AvailableSlot) => void;
  loading?: boolean;
}

export function WeeklyCalendar({
  currentDate,
  availableDates,
  slots,
  selectedSlot,
  onDateChange,
  onSlotSelect,
  loading = false,
}: WeeklyCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  weekStart.setHours(0, 0, 0, 0);

  // Generate week days
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }

  // Time slots (8 AM to 9 PM)
  const timeSlots: string[] = [];
  for (let hour = 8; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get date string in YYYY-MM-DD format
  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const dateStr = getDateString(date);
    return slots.filter((slot) => {
      const slotDate = slot.datetime.split(' ')[0];
      return slotDate === dateStr;
    });
  };

  // Get slot position and height
  const getSlotStyle = (slot: AvailableSlot) => {
    const [time] = slot.time.split(':');
    const minutes = slot.time.split(':')[1] || '00';
    const hour = parseInt(time, 10);
    const minute = parseInt(minutes, 10);
    
    // Calculate position (each hour = 60px, each 30 min = 30px)
    // Starting from 8 AM, so hour 8 = 0px, hour 9 = 60px, etc.
    const hourOffset = (hour - 8) * 60;
    const minuteOffset = (minute / 30) * 30;
    const startOffset = hourOffset + minuteOffset;
    
    // Default duration is 30 minutes (from slot or default)
    const duration = 30;
    const height = (duration / 30) * 30; // 30px per 30 minutes
    
    return {
      top: `${startOffset}px`,
      height: `${height}px`,
    };
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get availability color
  const getSlotColor = (slot: AvailableSlot) => {
    if (!slot.is_available) return 'bg-gray-200 border-gray-300';
    switch (slot.status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'limited':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'full':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate total height (8 AM to 9 PM = 14 hours = 840px)
  const totalHeight = (21 - 8 + 1) * 60; // 840px

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousWeek}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextWeek}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="font-semibold text-lg">
              {monthNames[weekStart.getMonth()]} {weekStart.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Week</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <div className="min-w-[900px]">
            {/* Day Headers - Sticky */}
            <div className="grid grid-cols-8 border-b bg-gray-50 sticky top-0 z-40">
              <div className="p-3 border-r font-medium text-sm text-muted-foreground"></div>
              {weekDays.map((day, index) => {
                const dateStr = getDateString(day);
                const daySlots = getSlotsForDate(day);
                const availableCount = daySlots.filter((s) => s.is_available).length;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      'p-3 border-r text-center',
                      isToday(day) && 'bg-blue-50'
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {dayNames[index]}
                    </div>
                    <div
                      className={cn(
                        'text-lg font-semibold',
                        isToday(day) && 'text-blue-600'
                      )}
                    >
                      {day.getDate()}
                    </div>
                    {availableCount > 0 && (
                      <div className="text-xs text-green-600 mt-1 font-medium">
                        {availableCount} slots
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Body */}
            <div className="relative" style={{ height: `${totalHeight}px` }}>
              {/* Time Axis - Fixed */}
              <div className="absolute left-0 top-0 w-20 border-r bg-gray-50 z-30" style={{ height: `${totalHeight}px` }}>
                {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-gray-200 flex items-start justify-end pr-3 pt-1"
                  >
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Current Time Indicator */}
              {weekDays.some((day) => isToday(day)) && (() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                
                if (currentHour >= 8 && currentHour <= 21) {
                  const topPosition = (currentHour - 8) * 60 + (currentMinute / 60) * 60;
                  
                  return (
                    <div
                      className="absolute left-20 right-0 pointer-events-none z-50"
                      style={{ top: `${topPosition}px` }}
                    >
                      <div className="flex items-center h-0">
                        <div className="w-20 flex items-center justify-end pr-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div className="flex-1 border-t-2 border-red-500"></div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Calendar Columns */}
              <div className="grid grid-cols-7 ml-20">
                {weekDays.map((day, dayIndex) => {
                  const dateStr = getDateString(day);
                  const daySlots = getSlotsForDate(day);
                  const isPast = day < today;
                  const availableSlots = daySlots.filter((s) => s.is_available);

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        'relative border-r',
                        isToday(day) && 'bg-blue-50/20'
                      )}
                      style={{ height: `${totalHeight}px` }}
                    >
                      {/* Hour markers */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                          <div
                            key={hour}
                            className="border-b border-gray-100"
                            style={{ height: '60px' }}
                          />
                        ))}
                      </div>

                      {/* Appointment Slots - Only show available slots */}
                      {!loading && availableSlots.map((slot, slotIndex) => {
                        const isSelected = selectedSlot?.datetime === slot.datetime;
                        const style = getSlotStyle(slot);

                        return (
                          <button
                            key={`${slot.datetime}-${slotIndex}`}
                            onClick={() => {
                              if (!isPast) {
                                onSlotSelect(slot);
                              }
                            }}
                            disabled={isPast}
                            className={cn(
                              'absolute left-1 right-1 rounded-md border text-left p-2 text-xs z-10',
                              'transition-all cursor-pointer shadow-sm',
                              getSlotColor(slot),
                              isSelected && 'ring-2 ring-primary border-primary z-20 shadow-md',
                              isPast && 'opacity-50 cursor-not-allowed'
                            )}
                            style={style}
                            title={`${formatTime(slot.time)} - ${slot.available}/${slot.total} available`}
                          >
                            <div className="font-semibold text-[11px] leading-tight">
                              {formatTime(slot.time)}
                            </div>
                            {slot.slot_name && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {slot.slot_name}
                              </div>
                            )}
                            <div className="text-[10px] mt-1 font-medium">
                              {slot.available}/{slot.total} available
                            </div>
                          </button>
                        );
                      })}

                      {/* Empty state */}
                      {!loading && availableSlots.length === 0 && !isPast && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs text-muted-foreground text-center px-2">
                            No available slots
                          </div>
                        </div>
                      )}

                      {/* Loading State */}
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

