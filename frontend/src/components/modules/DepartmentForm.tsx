import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft } from 'lucide-react';
import { api, Department, CreateDepartmentData } from '../../services/api';
import { toast } from 'sonner';

interface DepartmentFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  departmentId?: number;
}

export function DepartmentForm({ onBack, onSuccess, departmentId }: DepartmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateDepartmentData>({
    department_code: '',
    department_name: '',
    short_name: '',
    description: '',
    department_type: 'OPD',
    status: 'Active'
  });

  useEffect(() => {
    if (departmentId) {
      loadDepartment();
    }
  }, [departmentId]);

  const loadDepartment = async () => {
    try {
      setLoading(true);
      const department = await api.getDepartment(departmentId!);
      setFormData({
        department_code: department.department_code,
        department_name: department.department_name,
        short_name: department.short_name || '',
        description: department.description || '',
        department_type: department.department_type,
        status: department.status
      });
    } catch (error) {
      toast.error('Failed to load department');
      console.error('Error loading department:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department_name) {
      toast.error('Department name is required');
      return;
    }

    try {
      setLoading(true);
      if (departmentId) {
        await api.updateDepartment(departmentId, formData);
        toast.success('Department updated successfully');
      } else {
        await api.createDepartment(formData);
        toast.success('Department created successfully');
      }
      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save department');
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
          <h1 className="text-2xl font-bold">{departmentId ? 'Edit Department' : 'Add New Department'}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {departmentId ? 'Update department information' : 'Create a new department'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Information</CardTitle>
          <CardDescription>Enter the department details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department_code">Department Code</Label>
                <Input
                  id="department_code"
                  value={formData.department_code}
                  onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div>
                <Label htmlFor="department_name">Department Name *</Label>
                <Input
                  id="department_name"
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  required
                  placeholder="e.g., General Medicine, Cardiology"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="short_name">Short Name</Label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                  placeholder="e.g., GEN, CARD"
                />
              </div>
              <div>
                <Label htmlFor="department_type">Department Type</Label>
                <Select
                  value={formData.department_type}
                  onValueChange={(value: any) => setFormData({ ...formData, department_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="IPD">IPD</SelectItem>
                    <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                placeholder="Additional notes about this department..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : departmentId ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

