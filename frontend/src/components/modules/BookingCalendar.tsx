import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { api, Doctor, AvailableSlot, Appointment, DoctorSchedule } from '../../services/api';
import { cn } from '../ui/utils';

interface BookingCalendarProps {
  doctor: Doctor | null;
  appointments?: Appointment[];
  onSlotSelect: (slot: AvailableSlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  loading?: boolean;
}

export function BookingCalendar({
  doctor,
  appointments = [],
  onSlotSelect,
  onAppointmentClick,
  selectedDate: externalSelectedDate,
  onDateChange: externalOnDateChange,
  loading = false,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(externalSelectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(externalSelectedDate || new Date());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [doctorSchedule, setDoctorSchedule] = useState<DoctorSchedule[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Sync with external date if provided
  useEffect(() => {
    if (externalSelectedDate) {
      setCurrentDate(externalSelectedDate);
      setSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);

  // Load doctor schedule
  useEffect(() => {
    if (doctor) {
      loadDoctorSchedule();
    } else {
      setDoctorSchedule([]);
    }
  }, [doctor]);

  // Load slots when date or doctor changes
  useEffect(() => {
    if (doctor && selectedDate) {
      loadSlotsForDate(selectedDate);
    } else {
      setSlots([]);
    }
  }, [doctor, selectedDate]);

  const loadDoctorSchedule = async () => {
    if (!doctor) return;
    try {
      const schedule = await api.getDoctorSchedule(doctor.id.toString());
      setDoctorSchedule(schedule || []);
    } catch (err) {
      console.error('Error loading doctor schedule:', err);
      setDoctorSchedule([]);
    }
  };

  const loadSlotsForDate = async (date: Date) => {
    if (!doctor) return;
    try {
      setLoadingSlots(true);
      const dateStr = date.toISOString().split('T')[0];
      const availableSlots = await api.getAvailableSlots(doctor.id.toString(), dateStr);
      setSlots(availableSlots);
    } catch (err) {
      console.error('Error loading slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Get day name from date
  const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Check if doctor is available on this day
  const isDoctorAvailable = (date: Date): boolean => {
    const dayName = getDayName(date);
    return doctorSchedule.some(
      (schedule) => schedule.day_of_week === dayName && schedule.is_available
    );
  };

  // Get schedule for a specific day
  const getDaySchedule = (date: Date): DoctorSchedule[] => {
    const dayName = getDayName(date);
    return doctorSchedule.filter(
      (schedule) => schedule.day_of_week === dayName && schedule.is_available
    );
  };

  // Get appointments for a specific date and time
  const getAppointmentsForSlot = (date: Date, time: string): Appointment[] => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => {
      const aptDate = apt.appointment_date.split(' ')[0];
      if (aptDate !== dateStr) return false;
      
      const aptTime = apt.appointment_date.split(' ')[1]?.substring(0, 5) || '';
      return aptTime === time;
    });
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Navigate dates
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate || currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    externalOnDateChange?.(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate || currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    externalOnDateChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    externalOnDateChange?.(today);
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Get slot color based on availability
  const getSlotColor = (slot: AvailableSlot): string => {
    if (!slot.is_available) {
      return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
    }
    switch (slot.status) {
      case 'available':
        return 'bg-green-50 border-green-300 hover:bg-green-100 text-green-900';
      case 'limited':
        return 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 text-yellow-900';
      case 'full':
        return 'bg-red-50 border-red-300 text-red-900 cursor-not-allowed';
      default:
        return 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-900';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
      case 'No Show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayDate = selectedDate || currentDate;
  const daySchedule = getDaySchedule(displayDate);
  const isAvailable = isDoctorAvailable(displayDate);
  const isPastDate = isPast(displayDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {doctor ? `${doctor.name} - Booking Calendar` : 'Select Doctor'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!doctor ? (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Please select a doctor to view their booking calendar</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-2xl font-bold">
                  {displayDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {isToday(displayDate) && (
                  <Badge className="mt-2 bg-blue-500">Today</Badge>
                )}
              </div>
              <div className="text-right">
                {isAvailable ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Not Available</span>
                  </div>
                )}
                {daySchedule.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {daySchedule.length} schedule slot{daySchedule.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Schedule Info */}
            {daySchedule.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-sm mb-2 text-blue-900">Doctor's Schedule for {getDayName(displayDate)}</h3>
                <div className="space-y-2">
                  {daySchedule.map((schedule, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      {schedule.slot_name && (
                        <Badge variant="outline" className="text-xs">
                          {schedule.slot_name}
                        </Badge>
                      )}
                      {schedule.max_appointments_per_slot && (
                        <span className="text-xs text-muted-foreground">
                          Max: {schedule.max_appointments_per_slot} per slot
                        </span>
                      )}
                      {schedule.appointment_duration && (
                        <span className="text-xs text-muted-foreground">
                          Duration: {schedule.appointment_duration} min
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Slots Grid */}
            {loading || loadingSlots ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading available slots...</p>
              </div>
            ) : !isAvailable ? (
              <div className="text-center py-12 text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Doctor is not available on this day</p>
                <p className="text-sm mt-2">Please select a different date</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No available slots for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Available Time Slots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot, index) => {
                    const slotAppointments = getAppointmentsForSlot(displayDate, slot.time);
                    const canBook = slot.is_available && !isPastDate && slot.status !== 'full';

                    return (
                      <div key={index} className="relative">
                        <button
                          onClick={() => {
                            if (canBook) {
                              onSlotSelect(slot);
                            }
                          }}
                          disabled={!canBook}
                          className={cn(
                            'w-full p-4 rounded-lg border-2 text-left transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                            getSlotColor(slot),
                            !canBook && 'cursor-not-allowed opacity-60'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-semibold">{formatTime(slot.time)}</span>
                            </div>
                            {slot.slot_name && (
                              <Badge variant="outline" className="text-xs">
                                {slot.slot_name}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{slot.available}</span>
                              <span className="text-muted-foreground"> / {slot.total} available</span>
                            </div>
                            {slotAppointments.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium mb-1">Booked Appointments:</div>
                                <div className="space-y-1">
                                  {slotAppointments.map((apt) => (
                                    <div
                                      key={apt.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAppointmentClick?.(apt);
                                      }}
                                      className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                                    >
                                      <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        <span className="text-xs font-medium">
                                          {apt.patient_name || `Patient #${apt.patient_id}`}
                                        </span>
                                      </div>
                                      <Badge className={cn('text-xs', getStatusColor(apt.status))}>
                                        {apt.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {canBook && (
                            <div className="mt-3 pt-2 border-t">
                              <span className="text-xs font-medium text-green-700">Click to book this slot</span>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

