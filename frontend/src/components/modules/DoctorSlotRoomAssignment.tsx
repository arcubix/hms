import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Loader2, Plus, Edit, Trash2, Search, CalendarIcon, Copy } from 'lucide-react';
import { api, DoctorSlotRoom, CreateDoctorSlotRoomData, BulkCreateDoctorSlotRoomData, Doctor, Room, Reception, Floor, DoctorSchedule } from '../../services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { format } from 'date-fns';

export function DoctorSlotRoomAssignment() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignments, setAssignments] = useState<DoctorSlotRoom[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CreateDoctorSlotRoomData>({
    doctor_id: 0,
    schedule_id: 0,
    room_id: 0,
    assignment_date: format(new Date(), 'yyyy-MM-dd'),
    reception_id: 0,
    is_active: true
  });

  const [bulkFormData, setBulkFormData] = useState<BulkCreateDoctorSlotRoomData>({
    doctor_id: 0,
    schedule_id: 0,
    room_id: 0,
    reception_id: 0,
    date_from: format(new Date(), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorSchedules(selectedDoctor);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    loadAssignments();
  }, [filterDate, selectedDoctor]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsData, roomsData, receptionsData, floorsData] = await Promise.all([
        api.getDoctors(),
        api.getRooms({ status: 'Active' }),
        api.getReceptions({ status: 'Active' }),
        api.getFloors({ status: 'Active' })
      ]);
      
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

  const loadDoctorSchedules = async (doctorId: number) => {
    try {
      const doctor = await api.getDoctor(doctorId);
      if (doctor && doctor.schedule) {
        setDoctorSchedules(doctor.schedule);
      } else {
        setDoctorSchedules([]);
      }
    } catch (error: any) {
      console.error('Error loading doctor schedules:', error);
      setDoctorSchedules([]);
    }
  };

  const loadAssignments = async () => {
    try {
      const filters: any = {};
      if (selectedDoctor) filters.doctor_id = selectedDoctor;
      if (filterDate) filters.assignment_date = filterDate;
      
      const data = await api.getDoctorSlotRooms(filters);
      setAssignments(data);
    } catch (error: any) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctor_id || !formData.schedule_id || !formData.room_id || !formData.assignment_date || !formData.reception_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      if (editingId) {
        await api.updateDoctorSlotRoom(editingId, formData);
        toast.success('Slot-room assignment updated successfully');
      } else {
        await api.createDoctorSlotRoom(formData);
        toast.success('Slot-room assignment created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({
        doctor_id: 0,
        schedule_id: 0,
        room_id: 0,
        assignment_date: format(new Date(), 'yyyy-MM-dd'),
        reception_id: 0,
        is_active: true
      });
      loadAssignments();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      toast.error(error.message || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkFormData.doctor_id || !bulkFormData.schedule_id || !bulkFormData.room_id || 
        !bulkFormData.date_from || !bulkFormData.date_to || !bulkFormData.reception_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(bulkFormData.date_from) > new Date(bulkFormData.date_to)) {
      toast.error('Start date must be before end date');
      return;
    }

    try {
      setSaving(true);
      const result = await api.bulkCreateDoctorSlotRooms(bulkFormData);
      toast.success(`Created ${result.inserted} assignments successfully`);
      setIsBulkDialogOpen(false);
      setBulkFormData({
        doctor_id: 0,
        schedule_id: 0,
        room_id: 0,
        reception_id: 0,
        date_from: format(new Date(), 'yyyy-MM-dd'),
        date_to: format(new Date(), 'yyyy-MM-dd')
      });
      loadAssignments();
    } catch (error: any) {
      console.error('Error creating bulk assignments:', error);
      toast.error(error.message || 'Failed to create bulk assignments');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (assignment: DoctorSlotRoom) => {
    setFormData({
      doctor_id: assignment.doctor_id,
      schedule_id: assignment.schedule_id,
      room_id: assignment.room_id,
      assignment_date: assignment.assignment_date,
      reception_id: assignment.reception_id,
      is_active: assignment.is_active
    });
    setEditingId(assignment.id);
    setSelectedDoctor(assignment.doctor_id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await api.deleteDoctorSlotRoom(id);
      toast.success('Assignment deleted successfully');
      loadAssignments();
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
        setFormData({
          ...formData,
          room_id: roomId,
          reception_id: floorReceptions[0].id
        });
        setBulkFormData({
          ...bulkFormData,
          room_id: roomId,
          reception_id: floorReceptions[0].id
        });
      } else {
        setFormData({ ...formData, room_id: roomId });
        setBulkFormData({ ...bulkFormData, room_id: roomId });
      }
    }
  };

  const handleDoctorChange = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setFormData({ ...formData, doctor_id: doctorId, schedule_id: 0 });
    setBulkFormData({ ...bulkFormData, doctor_id: doctorId, schedule_id: 0 });
    loadDoctorSchedules(doctorId);
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
          <h2 className="text-2xl font-bold text-gray-900">Doctor Slot-Room Assignments (Dynamic Mode)</h2>
          <p className="text-sm text-gray-600 mt-1">Assign rooms to doctor schedule slots for specific dates</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                setBulkFormData({
                  doctor_id: 0,
                  schedule_id: 0,
                  room_id: 0,
                  reception_id: 0,
                  date_from: format(new Date(), 'yyyy-MM-dd'),
                  date_to: format(new Date(), 'yyyy-MM-dd')
                });
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Bulk Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Create Slot-Room Assignments</DialogTitle>
                <DialogDescription>
                  Create room assignments for a date range
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select
                    value={bulkFormData.doctor_id.toString()}
                    onValueChange={(value) => handleDoctorChange(parseInt(value))}
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
                  <Label>Schedule Slot *</Label>
                  <Select
                    value={bulkFormData.schedule_id.toString()}
                    onValueChange={(value) => setBulkFormData({ ...bulkFormData, schedule_id: parseInt(value) })}
                    disabled={!bulkFormData.doctor_id || doctorSchedules.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorSchedules.map(schedule => (
                        <SelectItem key={schedule.id} value={schedule.id?.toString() || ''}>
                          {schedule.day_of_week}: {schedule.start_time} - {schedule.end_time}
                          {schedule.slot_name && ` (${schedule.slot_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Room *</Label>
                  <Select
                    value={bulkFormData.room_id.toString()}
                    onValueChange={(value) => handleRoomChange(parseInt(value))}
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
                    value={bulkFormData.reception_id.toString()}
                    onValueChange={(value) => setBulkFormData({ ...bulkFormData, reception_id: parseInt(value) })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={bulkFormData.date_from}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, date_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={bulkFormData.date_to}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, date_to: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Assignments'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingId(null);
                setFormData({
                  doctor_id: 0,
                  schedule_id: 0,
                  room_id: 0,
                  assignment_date: format(new Date(), 'yyyy-MM-dd'),
                  reception_id: 0,
                  is_active: true
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Slot-Room Assignment' : 'Assign Room to Slot'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update the slot-room assignment' : 'Assign a room to a doctor\'s schedule slot for a specific date'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select
                    value={formData.doctor_id.toString()}
                    onValueChange={(value) => handleDoctorChange(parseInt(value))}
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
                  <Label>Schedule Slot *</Label>
                  <Select
                    value={formData.schedule_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, schedule_id: parseInt(value) })}
                    disabled={!formData.doctor_id || doctorSchedules.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorSchedules.map(schedule => (
                        <SelectItem key={schedule.id} value={schedule.id?.toString() || ''}>
                          {schedule.day_of_week}: {schedule.start_time} - {schedule.end_time}
                          {schedule.slot_name && ` (${schedule.slot_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assignment Date *</Label>
                  <Input
                    type="date"
                    value={formData.assignment_date}
                    onChange={(e) => setFormData({ ...formData, assignment_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Room *</Label>
                  <Select
                    value={formData.room_id.toString()}
                    onValueChange={(value) => handleRoomChange(parseInt(value))}
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
                    value={formData.reception_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, reception_id: parseInt(value) })}
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
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by doctor, room, or reception..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDoctor?.toString() || 'all'} onValueChange={(value) => {
          if (value === 'all') {
            setSelectedDoctor(null);
          } else {
            setSelectedDoctor(parseInt(value));
          }
        }}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map(doctor => (
              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          placeholder="Filter by date"
          className="w-48"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Slot</TableHead>
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
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No slot-room assignments found
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
                      {format(new Date(assignment.assignment_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.day_of_week}</div>
                        <div className="text-sm text-gray-500">
                          {assignment.slot_start_time} - {assignment.slot_end_time}
                        </div>
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

