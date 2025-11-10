import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  User,
  Droplet,
  Heart,
  UserCircle
} from 'lucide-react';
import { api, Patient } from '../../services/api';

interface ViewPatientPageProps {
  patientId: string;
  onBack: () => void;
  onEdit?: (patientId: string) => void;
}

export function ViewPatientPage({ patientId, onBack, onEdit }: ViewPatientPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPatient(patientId);
      setPatient(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">Loading patient data...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error || 'Patient not found'}
        </div>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Patient Details</h1>
        </div>
        {onEdit && (
          <Button onClick={() => onEdit(patientId)} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Patient
          </Button>
        )}
      </div>

      {/* Patient Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <Badge className={`${getStatusColor(patient.status)} border rounded-full px-3 py-1`}>
                  {patient.status}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">Patient ID: {patient.patient_id}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{patient.age} years, {patient.gender}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{patient.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Patient ID</p>
                <p className="font-medium">{patient.patient_id}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Age</p>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
            </div>
            {patient.date_of_birth && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="font-medium">{formatDate(patient.date_of_birth)}</p>
                </div>
              </>
            )}
            {patient.blood_group && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    Blood Group
                  </p>
                  <p className="font-medium">{patient.blood_group}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.phone && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            )}
            {patient.email && (
              <>
                {patient.phone && <Separator />}
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </>
            )}
            {(patient.address || patient.city || patient.state || patient.zip_code) && (
              <>
                {(patient.phone || patient.email) && <Separator />}
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </p>
                  <p className="font-medium">
                    {[patient.address, patient.city, patient.state, patient.zip_code]
                      .filter(Boolean)
                      .join(', ') || 'Not provided'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Registration Date</p>
              <p className="font-medium">{formatDate(patient.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <Badge className={`${getStatusColor(patient.status)} border rounded-full px-3 py-1`}>
                {patient.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

