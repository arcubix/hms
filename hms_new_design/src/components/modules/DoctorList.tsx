import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  Stethoscope
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DoctorProfile } from './DoctorProfile';
import { AddDoctor } from './AddDoctor';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experience: number;
  patients: number;
  rating: number;
  status: 'Available' | 'Busy' | 'Off Duty';
  schedule: string;
}

const mockDoctors: Doctor[] = [
  {
    id: 'DOC001',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiology',
    phone: '+1-555-0123',
    email: 'dr.sarah.mitchell@hospital.com',
    experience: 18,
    patients: 1247,
    rating: 4.8,
    status: 'Available',
    schedule: '9:00 AM - 2:00 PM'
  },
  {
    id: 'D002',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    phone: '+1 234-567-1002',
    email: 'michael.chen@hospital.com',
    experience: 12,
    patients: 892,
    rating: 4.7,
    status: 'Busy',
    schedule: '8:00 AM - 4:00 PM'
  },
  {
    id: 'D003',
    name: 'Dr. Robert Johnson',
    specialty: 'Orthopedics',
    phone: '+1 234-567-1003',
    email: 'robert.johnson@hospital.com',
    experience: 20,
    patients: 1156,
    rating: 4.9,
    status: 'Available',
    schedule: '10:00 AM - 6:00 PM'
  },
  {
    id: 'D004',
    name: 'Dr. Emily Davis',
    specialty: 'Pediatrics',
    phone: '+1 234-567-1004',
    email: 'emily.davis@hospital.com',
    experience: 8,
    patients: 734,
    rating: 4.6,
    status: 'Off Duty',
    schedule: '9:00 AM - 3:00 PM'
  },
  {
    id: 'D005',
    name: 'Dr. James Wilson',
    specialty: 'Radiology',
    phone: '+1 234-567-1005',
    email: 'james.wilson@hospital.com',
    experience: 15,
    patients: 623,
    rating: 4.8,
    status: 'Available',
    schedule: '8:00 AM - 5:00 PM'
  },
  {
    id: 'D006',
    name: 'Dr. Lisa Anderson',
    specialty: 'Oncology',
    phone: '+1 234-567-1006',
    email: 'lisa.anderson@hospital.com',
    experience: 14,
    patients: 445,
    rating: 4.9,
    status: 'Available',
    schedule: '9:00 AM - 4:00 PM'
  }
];

export function DoctorList() {
  const [view, setView] = useState<'list' | 'profile' | 'add'>('list');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doctor.status.toLowerCase().replace(' ', '') === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewProfile = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setView('profile');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDoctorId(null);
  };

  const handleAddDoctor = () => {
    setView('add');
  };

  const handleAddSuccess = () => {
    setView('list');
  };

  if (view === 'profile' && selectedDoctorId) {
    return <DoctorProfile doctorId={selectedDoctorId} onBack={handleBackToList} />;
  }

  if (view === 'add') {
    return <AddDoctor onBack={handleBackToList} onSuccess={handleAddSuccess} />;
  }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Doctor Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredDoctors.length} doctors • Manage profiles, schedules, and performance
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddDoctor}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Doctor
        </Button>
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
                className={filterStatus === 'all' ? 'bg-blue-600' : ''}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('available')}
                className={filterStatus === 'available' ? 'bg-green-600' : ''}
              >
                Available
              </Button>
              <Button
                variant={filterStatus === 'busy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('busy')}
                className={filterStatus === 'busy' ? 'bg-yellow-600' : ''}
              >
                Busy
              </Button>
              <Button
                variant={filterStatus === 'offduty' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('offduty')}
                className={filterStatus === 'offduty' ? 'bg-gray-600' : ''}
              >
                Off Duty
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
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
                    <span className="text-sm text-gray-900">{doctor.patients}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    {renderStars(doctor.rating)}
                    <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  {doctor.schedule}
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
                  onClick={() => handleViewProfile(doctor.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Stethoscope className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddDoctor}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Doctor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
