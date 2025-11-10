import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Doctor } from '../../services/api';
import { 
  Phone, 
  Mail, 
  Clock,
  Users,
  Star,
  Edit,
  Calendar,
  GraduationCap
} from 'lucide-react';

interface DoctorViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor;
  onEdit: () => void;
}

export function DoctorView({ open, onOpenChange, doctor, onEdit }: DoctorViewProps) {
  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'Off Duty':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Doctor Details</DialogTitle>
          <DialogDescription>
            View complete information about {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                {doctor.name.split(' ').slice(-2).map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">{doctor.name}</h2>
                <Badge className={getStatusColor(doctor.status)}>
                  {doctor.status}
                </Badge>
              </div>
              <p className="text-lg text-gray-600 mb-1">{doctor.specialty}</p>
              <p className="text-sm text-gray-500">ID: {doctor.doctor_id}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{doctor.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{doctor.email}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-600">Experience</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{doctor.experience}</p>
              <p className="text-xs text-blue-600">years</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-600">Patients</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{doctor.patients || 0}</p>
            </div>
            {doctor.rating !== undefined && doctor.rating > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs text-yellow-600">Rating</p>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(doctor.rating)}
                  <p className="text-lg font-bold text-yellow-900 ml-1">{doctor.rating}</p>
                </div>
              </div>
            )}
            {doctor.total_appointments !== undefined && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-purple-600">Appointments</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">{doctor.total_appointments}</p>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Default Schedule</h3>
            </div>
            <p className="text-sm text-gray-700">
              {formatTime(doctor.schedule_start)} - {formatTime(doctor.schedule_end)}
            </p>
          </div>

          {/* Qualification */}
          {doctor.qualification && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Qualification</h3>
              </div>
              <p className="text-sm text-gray-700">{doctor.qualification}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>Created: {new Date(doctor.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onEdit} className="bg-blue-500 hover:bg-blue-600">
            <Edit className="w-4 h-4 mr-2" />
            Edit Doctor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

