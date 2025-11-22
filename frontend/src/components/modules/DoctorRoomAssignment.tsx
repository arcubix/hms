import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import { api, DoctorRoom, CreateDoctorRoomData, Doctor, Room, Reception, Floor } from '../../services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function DoctorRoomAssignment() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignments, setAssignments] = useState<DoctorRoom[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CreateDoctorRoomData>({
    doctor_id: 0,
    room_id: 0,
    reception_id: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, doctorsData, roomsData, receptionsData, floorsData] = await Promise.all([
        api.getDoctorRooms(),
        api.getDoctors(),
        api.getRooms({ status: 'Active' }),
        api.getReceptions({ status: 'Active' }),
        api.getFloors({ status: 'Active' })
      ]);
      
      setAssignments(assignmentsData);
      setDoctors(doctorsData);
      setRooms(roomsData);
      setReceptions(receptionsData);
      setFloors(floorsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if values are valid (greater than 0, not null, not undefined)
    const doctorId = Number(formData.doctor_id);
    const roomId = Number(formData.room_id);
    const receptionId = Number(formData.reception_id);
    
    if (!doctorId || doctorId <= 0 || !roomId || roomId <= 0 || !receptionId || receptionId <= 0) {
      toast.error('Please fill in all required fields');
      console.log('Validation failed:', { doctorId, roomId, receptionId, formData });
      return;
    }

    try {
      setSaving(true);
      
      if (editingId) {
        await api.updateDoctorRoom(editingId, formData);
        toast.success('Room assignment updated successfully');
      } else {
        await api.createDoctorRoom(formData);
        toast.success('Room assignment created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ doctor_id: 0, room_id: 0, reception_id: 0, is_active: true });
      loadData();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      toast.error(error.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (assignment: DoctorRoom) => {
    setFormData({
      doctor_id: assignment.doctor_id,
      room_id: assignment.room_id,
      reception_id: assignment.reception_id,
      is_active: assignment.is_active
    });
    setEditingId(assignment.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await api.deleteDoctorRoom(id);
      toast.success('Assignment deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleRoomChange = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      // Auto-select reception from same floor
      const floorReceptions = receptions.filter(r => r.floor_id === room.floor_id);
      if (floorReceptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          room_id: roomId,
          reception_id: floorReceptions[0].id
        }));
      } else {
        setFormData(prev => ({ ...prev, room_id: roomId }));
      }
    } else {
      // If room not found, just set the room_id
      setFormData(prev => ({ ...prev, room_id: roomId }));
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      assignment.doctor_name?.toLowerCase().includes(search) ||
      assignment.room_number?.toLowerCase().includes(search) ||
      assignment.reception_name?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Room Assignments (Fixed Mode)</h2>
          <p className="text-sm text-gray-600 mt-1">Assign permanent rooms to doctors</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({ doctor_id: 0, room_id: 0, reception_id: 0, is_active: true });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Room Assignment' : 'Assign Room to Doctor'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the room assignment' : 'Select a doctor and assign them a permanent room'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select
                  value={formData.doctor_id > 0 ? formData.doctor_id.toString() : undefined}
                  onValueChange={(value) => {
                    const doctorId = parseInt(value, 10);
                    console.log('Doctor selected:', value, doctorId);
                    setFormData(prev => ({ ...prev, doctor_id: doctorId }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room *</Label>
                <Select
                  value={formData.room_id > 0 ? formData.room_id.toString() : undefined}
                  onValueChange={(value) => {
                    const roomId = parseInt(value, 10);
                    console.log('Room selected:', value, roomId);
                    handleRoomChange(roomId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map(floor => {
                      const floorRooms = rooms.filter(r => r.floor_id === floor.id);
                      if (floorRooms.length === 0) return null;
                      return (
                        <div key={floor.id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                            Floor {floor.floor_number}: {floor.floor_name}
                          </div>
                          {floorRooms.map(room => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.room_number} - {room.room_name || 'Room'}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reception *</Label>
                <Select
                  value={formData.reception_id > 0 ? formData.reception_id.toString() : undefined}
                  onValueChange={(value) => {
                    const receptionId = parseInt(value, 10);
                    console.log('Reception selected:', value, receptionId);
                    setFormData(prev => ({ ...prev, reception_id: receptionId }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reception" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map(floor => {
                      const floorReceptions = receptions.filter(r => r.floor_id === floor.id);
                      if (floorReceptions.length === 0) return null;
                      return (
                        <div key={floor.id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                            Floor {floor.floor_number}: {floor.floor_name}
                          </div>
                          {floorReceptions.map(reception => (
                            <SelectItem key={reception.id} value={reception.id.toString()}>
                              {reception.reception_name} ({reception.reception_code})
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Assignment'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by doctor, room, or reception..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Reception</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No room assignments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map(assignment => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.doctor_name}</div>
                        <div className="text-sm text-gray-500">{assignment.specialty}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.room_number}</div>
                        <div className="text-sm text-gray-500">{assignment.room_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      Floor {assignment.floor_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.reception_name}</div>
                        <div className="text-sm text-gray-500">{assignment.reception_code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                        {assignment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

