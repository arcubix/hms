import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft } from 'lucide-react';
import { api, Room, Floor, CreateRoomData } from '../../services/api';
import { toast } from 'sonner';

interface RoomFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  roomId?: number;
}

export function RoomForm({ onBack, onSuccess, roomId }: RoomFormProps) {
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [formData, setFormData] = useState<CreateRoomData>({
    room_number: '',
    room_name: '',
    floor_id: 0,
    department_id: undefined,
    room_type: 'Consultation',
    capacity: 1,
    equipment: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    loadFloors();
    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const loadFloors = async () => {
    try {
      const data = await api.getFloors();
      setFloors(data);
    } catch (error) {
      console.error('Error loading floors:', error);
    }
  };

  const loadRoom = async () => {
    try {
      setLoading(true);
      const room = await api.getRoom(roomId!);
      setFormData({
        room_number: room.room_number,
        room_name: room.room_name || '',
        floor_id: room.floor_id,
        department_id: room.department_id || undefined,
        room_type: room.room_type,
        capacity: room.capacity,
        equipment: room.equipment || '',
        description: room.description || '',
        status: room.status
      });
    } catch (error) {
      toast.error('Failed to load room');
      console.error('Error loading room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.room_number || !formData.floor_id) {
      toast.error('Room number and floor are required');
      return;
    }

    try {
      setLoading(true);
      if (roomId) {
        await api.updateRoom(roomId, formData);
        toast.success('Room updated successfully');
      } else {
        await api.createRoom(formData);
        toast.success('Room created successfully');
      }
      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{roomId ? 'Edit Room' : 'Add New Room'}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {roomId ? 'Update room information' : 'Create a new room'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Information</CardTitle>
          <CardDescription>Enter the room details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_number">Room Number *</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  required
                  placeholder="e.g., 101, 201-A"
                />
              </div>
              <div>
                <Label htmlFor="room_name">Room Name</Label>
                <Input
                  id="room_name"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  placeholder="e.g., Consultation Room 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor_id">Floor *</Label>
                <Select
                  value={formData.floor_id?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, floor_id: parseInt(value) })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id.toString()}>
                        {floor.building_name ? `${floor.building_name} - ` : ''}Floor {floor.floor_number} {floor.floor_name ? `(${floor.floor_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room_type">Room Type</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(value: any) => setFormData({ ...formData, room_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Examination">Examination</SelectItem>
                    <SelectItem value="Procedure">Procedure</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                placeholder="List available equipment (comma-separated)"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional notes about this room..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : roomId ? 'Update Room' : 'Create Room'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

