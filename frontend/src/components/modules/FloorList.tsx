import { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api, Floor } from '../../services/api';
import { toast } from 'sonner';

interface FloorListProps {
  onAddFloor: () => void;
  onEditFloor: (floorId: number) => void;
}

export function FloorList({ onAddFloor, onEditFloor }: FloorListProps) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Under Maintenance'>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [buildings, setBuildings] = useState<string[]>([]);

  useEffect(() => {
    loadFloors();
    loadBuildings();
  }, [searchTerm, statusFilter, buildingFilter]);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (buildingFilter !== 'all') filters.building_name = buildingFilter;
      
      const data = await api.getFloors(filters);
      setFloors(data);
    } catch (error) {
      toast.error('Failed to load floors');
      console.error('Error loading floors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const data = await api.getBuildings();
      setBuildings(data);
    } catch (error) {
      console.error('Error loading buildings:', error);
    }
  };

  const handleDelete = async (floorId: number) => {
    if (!confirm('Are you sure you want to delete this floor?')) {
      return;
    }

    try {
      await api.deleteFloor(floorId);
      toast.success('Floor deleted successfully');
      loadFloors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete floor');
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
          <h1 className="text-2xl font-bold text-gray-900">Floors</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage building floors and levels
          </p>
        </div>
        <Button onClick={onAddFloor} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Floor
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search floors..."
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
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building} value={building}>{building}</SelectItem>
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
      ) : floors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No floors found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {floor.floor_name || `Floor ${floor.floor_number}`}
                    </h3>
                    <p className="text-sm text-gray-500">Floor {floor.floor_number}</p>
                  </div>
                </div>
                <Badge className={cn("text-xs px-2 py-1", getStatusColor(floor.status))}>
                  {floor.status}
                </Badge>
              </div>

              {/* Floor Info */}
              <div className="space-y-3 mb-4">
                {floor.building_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{floor.building_name}</span>
                  </div>
                )}
                {floor.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{floor.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditFloor(floor.id)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(floor.id)}
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

