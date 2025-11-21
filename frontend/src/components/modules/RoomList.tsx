import { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, DoorOpen, Building2, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api, Room, Floor } from '../../services/api';
import { toast } from 'sonner';

interface RoomListProps {
  onAddRoom: () => void;
  onEditRoom: (roomId: number) => void;
}

export function RoomList({ onAddRoom, onEditRoom }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Under Maintenance' | 'Reserved'>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  useEffect(() => {
    loadRooms();
    loadFloors();
    loadRoomTypes();
  }, [searchTerm, statusFilter, floorFilter, roomTypeFilter]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (floorFilter !== 'all') filters.floor_id = parseInt(floorFilter);
      if (roomTypeFilter !== 'all') filters.room_type = roomTypeFilter;
      
      const data = await api.getRooms(filters);
      setRooms(data);
    } catch (error) {
      toast.error('Failed to load rooms');
      console.error('Error loading rooms:', error);
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

  const loadRoomTypes = async () => {
    try {
      const data = await api.getRoomTypes();
      setRoomTypes(data);
    } catch (error) {
      console.error('Error loading room types:', error);
    }
  };

  const handleDelete = async (roomId: number) => {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await api.deleteRoom(roomId);
      toast.success('Room deleted successfully');
      loadRooms();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
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
      case 'Reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage hospital rooms and facilities
          </p>
        </div>
        <Button onClick={onAddRoom} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search rooms..."
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
              <SelectItem value="Reserved">Reserved</SelectItem>
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
          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {roomTypes.map((type) => (
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
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No rooms found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <DoorOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {room.room_name || room.room_number}
                    </h3>
                    <p className="text-sm text-gray-500">{room.room_number}</p>
                  </div>
                </div>
                <Badge className={cn("text-xs px-2 py-1", getStatusColor(room.status))}>
                  {room.status}
                </Badge>
              </div>

              {/* Room Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>
                    {room.building_name ? `${room.building_name} - ` : ''}Floor {room.floor_number}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline" className="text-xs">
                    {room.room_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {room.capacity}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditRoom(room.id)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(room.id)}
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

