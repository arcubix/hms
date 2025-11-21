import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft } from 'lucide-react';
import { api, Floor, CreateFloorData } from '../../services/api';
import { toast } from 'sonner';

interface FloorFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  floorId?: number;
}

export function FloorForm({ onBack, onSuccess, floorId }: FloorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFloorData>({
    floor_number: 0,
    floor_name: '',
    building_name: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (floorId) {
      loadFloor();
    }
  }, [floorId]);

  const loadFloor = async () => {
    try {
      setLoading(true);
      const floor = await api.getFloor(floorId!);
      setFormData({
        floor_number: floor.floor_number,
        floor_name: floor.floor_name || '',
        building_name: floor.building_name || '',
        description: floor.description || '',
        status: floor.status
      });
    } catch (error) {
      toast.error('Failed to load floor');
      console.error('Error loading floor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.floor_number || formData.floor_number <= 0) {
      toast.error('Floor number is required and must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      if (floorId) {
        await api.updateFloor(floorId, formData);
        toast.success('Floor updated successfully');
      } else {
        await api.createFloor(formData);
        toast.success('Floor created successfully');
      }
      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save floor');
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
          <h1 className="text-2xl font-bold">{floorId ? 'Edit Floor' : 'Add New Floor'}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {floorId ? 'Update floor information' : 'Create a new floor'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Floor Information</CardTitle>
          <CardDescription>Enter the floor details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor_number">Floor Number *</Label>
                <Input
                  id="floor_number"
                  type="number"
                  value={formData.floor_number || ''}
                  onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="floor_name">Floor Name</Label>
                <Input
                  id="floor_name"
                  value={formData.floor_name}
                  onChange={(e) => setFormData({ ...formData, floor_name: e.target.value })}
                  placeholder="e.g., Ground Floor, First Floor"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="building_name">Building Name</Label>
              <Input
                id="building_name"
                value={formData.building_name}
                onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                placeholder="e.g., Main Building"
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional notes about this floor..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : floorId ? 'Update Floor' : 'Create Floor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

