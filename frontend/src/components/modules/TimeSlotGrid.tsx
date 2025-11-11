import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AvailableSlot } from '../../services/api';
import { cn } from '../ui/utils';
import { Clock } from 'lucide-react';

interface TimeSlotGridProps {
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSlotSelect: (slot: AvailableSlot) => void;
  disabled?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSlotSelect,
  disabled = false,
}: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No available slots for this date</p>
        </CardContent>
      </Card>
    );
  }

  const getSlotStatusColor = (status: AvailableSlot['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900';
      case 'limited':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-900';
      case 'full':
        return 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed text-gray-500';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Available Time Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot?.datetime === slot.datetime;
            const isDisabled = disabled || !slot.is_available;

            return (
              <button
                key={index}
                onClick={() => {
                  if (!isDisabled) {
                    onSlotSelect(slot);
                  }
                }}
                disabled={isDisabled}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all text-left',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  getSlotStatusColor(slot.status),
                  isSelected && 'ring-2 ring-primary border-primary',
                  !isDisabled && 'cursor-pointer',
                  isDisabled && 'cursor-not-allowed'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{formatTime(slot.time)}</span>
                  {slot.slot_name && (
                    <Badge variant="outline" className="text-xs">
                      {slot.slot_name}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {slot.is_available ? (
                    <span>
                      {slot.available} / {slot.total} available
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Full</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

