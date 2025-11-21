import { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, Receipt, Building2, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api, Reception, Floor } from '../../services/api';
import { toast } from 'sonner';

interface ReceptionListProps {
  onAddReception: () => void;
  onEditReception: (receptionId: number) => void;
}

export function ReceptionList({ onAddReception, onEditReception }: ReceptionListProps) {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Under Maintenance'>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');

  useEffect(() => {
    loadReceptions();
    loadFloors();
  }, [searchTerm, statusFilter, floorFilter]);

  const loadReceptions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (floorFilter !== 'all') filters.floor_id = parseInt(floorFilter);
      
      const data = await api.getReceptions(filters);
      setReceptions(data);
    } catch (error) {
      toast.error('Failed to load receptions');
      console.error('Error loading receptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFloors = async () => {
    try {
      const data = await api.getFloors();
      setFloors(data);
    } catch (error) {
      console.error('Error loading floors:', error);
    }
  };

  const handleDelete = async (receptionId: number) => {
    if (!confirm('Are you sure you want to delete this reception?')) {
      return;
    }

    try {
      await api.deleteReception(receptionId);
      toast.success('Reception deleted successfully');
      loadReceptions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete reception');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage reception counters and service points
          </p>
        </div>
        <Button onClick={onAddReception} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Reception
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search receptions..."
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
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor.id} value={floor.id.toString()}>
                  {floor.building_name ? `${floor.building_name} - ` : ''}Floor {floor.floor_number}
                </SelectItem>
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
      ) : receptions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No receptions found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {receptions.map((reception) => (
            <div
              key={reception.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{reception.reception_name}</h3>
                    <p className="text-sm text-gray-500">{reception.reception_code}</p>
                  </div>
                </div>
                <Badge className={cn("text-xs px-2 py-1", getStatusColor(reception.status))}>
                  {reception.status}
                </Badge>
              </div>

              {/* Reception Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>
                    {reception.building_name ? `${reception.building_name} - ` : ''}Floor {reception.floor_number}
                  </span>
                </div>
                {reception.department_name && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span> {reception.department_name}
                  </div>
                )}
                {reception.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{reception.location}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditReception(reception.id)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(reception.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

