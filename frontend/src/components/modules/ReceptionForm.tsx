import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft } from 'lucide-react';
import { api, Reception, Floor, CreateReceptionData } from '../../services/api';
import { toast } from 'sonner';

interface ReceptionFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  receptionId?: number;
}

export function ReceptionForm({ onBack, onSuccess, receptionId }: ReceptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [formData, setFormData] = useState<CreateReceptionData>({
    reception_code: '',
    reception_name: '',
    floor_id: 0,
    department_id: undefined,
    location: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    loadFloors();
    if (receptionId) {
      loadReception();
    }
  }, [receptionId]);

  const loadFloors = async () => {
    try {
      const data = await api.getFloors();
      setFloors(data);
    } catch (error) {
      console.error('Error loading floors:', error);
    }
  };

  const loadReception = async () => {
    try {
      setLoading(true);
      const reception = await api.getReception(receptionId!);
      setFormData({
        reception_code: reception.reception_code,
        reception_name: reception.reception_name,
        floor_id: reception.floor_id,
        department_id: reception.department_id || undefined,
        location: reception.location || '',
        description: reception.description || '',
        status: reception.status
      });
    } catch (error) {
      toast.error('Failed to load reception');
      console.error('Error loading reception:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reception_name || !formData.floor_id) {
      toast.error('Reception name and floor are required');
      return;
    }

    try {
      setLoading(true);
      if (receptionId) {
        await api.updateReception(receptionId, formData);
        toast.success('Reception updated successfully');
      } else {
        await api.createReception(formData);
        toast.success('Reception created successfully');
      }
      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save reception');
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
          <h1 className="text-2xl font-bold">{receptionId ? 'Edit Reception' : 'Add New Reception'}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {receptionId ? 'Update reception information' : 'Create a new reception counter'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reception Information</CardTitle>
          <CardDescription>Enter the reception details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reception_code">Reception Code</Label>
                <Input
                  id="reception_code"
                  value={formData.reception_code}
                  onChange={(e) => setFormData({ ...formData, reception_code: e.target.value })}
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div>
                <Label htmlFor="reception_name">Reception Name *</Label>
                <Input
                  id="reception_name"
                  value={formData.reception_name}
                  onChange={(e) => setFormData({ ...formData, reception_name: e.target.value })}
                  required
                  placeholder="e.g., Main Reception, OPD Reception 1"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Ground Floor - Main Entrance"
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional notes about this reception..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : receptionId ? 'Update Reception' : 'Create Reception'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

