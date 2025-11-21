import { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Building2, MapPin, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api, ReferralHospital } from '../../services/api';
import { toast } from 'sonner';

interface ReferralHospitalListProps {
  onAddHospital: () => void;
  onEditHospital: (hospitalId: number) => void;
}

export function ReferralHospitalList({ onAddHospital, onEditHospital }: ReferralHospitalListProps) {
  const [hospitals, setHospitals] = useState<ReferralHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [specialtyTypes, setSpecialtyTypes] = useState<string[]>([]);

  useEffect(() => {
    loadHospitals();
    loadSpecialtyTypes();
  }, [searchTerm, statusFilter, typeFilter]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.specialty_type = typeFilter;
      
      const data = await api.getReferralHospitals(filters);
      setHospitals(data);
    } catch (error) {
      toast.error('Failed to load referral hospitals');
      console.error('Error loading referral hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialtyTypes = async () => {
    try {
      const data = await api.getReferralHospitalTypes();
      setSpecialtyTypes(data);
    } catch (error) {
      console.error('Error loading specialty types:', error);
    }
  };

  const handleDelete = async (hospitalId: number) => {
    if (!confirm('Are you sure you want to delete this referral hospital?')) {
      return;
    }

    try {
      await api.deleteReferralHospital(hospitalId);
      toast.success('Referral hospital deleted successfully');
      loadHospitals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete referral hospital');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Hospitals</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage referral hospital network
          </p>
        </div>
        <Button onClick={onAddHospital} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Hospital
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {specialtyTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading...
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No referral hospitals found
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Hospital Icon */}
                  <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  {/* Hospital Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{hospital.hospital_name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{hospital.specialty_type}</p>
                    
                    {/* Address */}
                    {hospital.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{hospital.address}</span>
                      </div>
                    )}
                    
                    {/* Email */}
                    {hospital.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{hospital.email}</span>
                      </div>
                    )}
                    
                    {/* Specialties */}
                    {hospital.specialties && hospital.specialties.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-700 font-medium mr-2">Specialties:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {hospital.specialties.map((specialty, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs px-2 py-1 bg-gray-50 border-blue-200 text-gray-700"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                <Badge className={cn("text-xs px-2 py-1 ml-2", getStatusColor(hospital.status))}>
                  {hospital.status.toLowerCase()}
                </Badge>
              </div>

              {/* Right Side Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                {/* Phone */}
                {hospital.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
                
                {/* Associated Doctor */}
                {hospital.associated_doctor && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{hospital.associated_doctor}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditHospital(hospital.id)}
                    className="text-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(hospital.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

