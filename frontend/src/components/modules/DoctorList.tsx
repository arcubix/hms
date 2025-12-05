import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Clock,
  Users,
  Star,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { api, Doctor } from '../../services/api';
import { DoctorSchedule } from './DoctorSchedule';

interface DoctorListProps {
  onViewDoctor?: (doctorId: string) => void;
  onAddDoctor?: () => void;
  onEditDoctor?: (doctorId: string) => void;
}

export function DoctorList({ onViewDoctor, onAddDoctor, onEditDoctor }: DoctorListProps) {
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, [searchTerm, filterStatus]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { search?: string; status?: string } = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterStatus !== 'all') {
        // Map frontend filter values to backend status values
        const statusMap: Record<string, string> = {
          'available': 'Available',
          'busy': 'Busy',
          'offduty': 'Off Duty'
        };
        filters.status = statusMap[filterStatus] || filterStatus;
      }
      
      const data = await api.getDoctors(filters);
      setDoctors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doctor: Doctor) => {
    if (onViewDoctor) {
      onViewDoctor(doctor.id.toString());
    }
  };

  const handleEdit = (doctor: Doctor) => {
    if (onEditDoctor) {
      onEditDoctor(doctor.id.toString());
    }
  };

  const handleAdd = () => {
    if (onAddDoctor) {
      onAddDoctor();
    }
  };

  const handleSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowScheduleDialog(true);
  };

  const handleScheduleSuccess = () => {
    setShowScheduleDialog(false);
    setSelectedDoctor(null);
    loadDoctors();
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
        className={`w-3 h-3 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gray-900">Doctor Management</h1>
        <PermissionButton 
          permission="create_doctors"
          tooltipMessage="You need permission to create doctors"
          className="bg-blue-500 hover:bg-blue-600"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </PermissionButton>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search doctors by name, specialty, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-blue-500' : ''}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('available')}
                className={filterStatus === 'available' ? 'bg-green-500' : ''}
              >
                Available
              </Button>
              <Button
                variant={filterStatus === 'busy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('busy')}
                className={filterStatus === 'busy' ? 'bg-yellow-500' : ''}
              >
                Busy
              </Button>
              <Button
                variant={filterStatus === 'offduty' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('offduty')}
                className={filterStatus === 'offduty' ? 'bg-gray-500' : ''}
              >
                Off Duty
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-0 shadow-sm border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Doctor Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {doctor.name.split(' ').slice(-2).map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(doctor.status)}>
                    {doctor.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="text-sm text-gray-900">{doctor.experience} years</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Patients</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{doctor.patients || 0}</span>
                    </div>
                  </div>

                  {doctor.rating !== undefined && doctor.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        {renderStars(doctor.rating)}
                        <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-3 h-3" />
                    {formatTime(doctor.schedule_start)} - {formatTime(doctor.schedule_end)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Mail className="w-3 h-3" />
                      {doctor.email}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleView(doctor)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <PermissionButton 
                    permission="edit_doctors"
                    tooltipMessage="You need permission to edit doctors"
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </PermissionButton>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSchedule(doctor)}
                  >
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Doctor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog - Keep this as dialog since it's a quick action */}
      {selectedDoctor && (
        <DoctorSchedule
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          doctor={selectedDoctor}
          onSuccess={() => {
            setShowScheduleDialog(false);
            setSelectedDoctor(null);
            loadDoctors();
          }}
        />
      )}
    </div>
  );
}
