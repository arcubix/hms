import { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api, Department } from '../../services/api';
import { toast } from 'sonner';

interface DepartmentListProps {
  onAddDepartment: () => void;
  onEditDepartment: (departmentId: number) => void;
}

export function DepartmentList({ onAddDepartment, onEditDepartment }: DepartmentListProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([]);

  useEffect(() => {
    loadDepartments();
    loadDepartmentTypes();
  }, [searchTerm, statusFilter, typeFilter]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.department_type = typeFilter;
      
      const data = await api.getDepartments(filters);
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to load departments');
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentTypes = async () => {
    try {
      const data = await api.getDepartmentTypes();
      setDepartmentTypes(data);
    } catch (error) {
      console.error('Error loading department types:', error);
    }
  };

  const handleDelete = async (departmentId: number) => {
    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await api.deleteDepartment(departmentId);
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete department');
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'OPD':
        return 'bg-blue-100 text-blue-800';
      case 'Emergency':
        return 'bg-red-100 text-red-800';
      case 'IPD':
        return 'bg-purple-100 text-purple-800';
      case 'Diagnostic':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage hospital departments and resources
          </p>
        </div>
        <Button onClick={onAddDepartment} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search departments..."
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
              {departmentTypes.map((type) => (
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
      ) : departments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No departments found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((department) => (
            <div
              key={department.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{department.department_name}</h3>
                    <p className="text-sm text-gray-500">{department.short_name || department.department_code}</p>
                  </div>
                </div>
                <Badge className={cn("text-xs px-2 py-1", getStatusColor(department.status))}>
                  {department.status}
                </Badge>
              </div>

              {/* Department Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge className={cn("text-xs px-2 py-1", getTypeColor(department.department_type))}>
                    {department.department_type}
                  </Badge>
                </div>
                {department.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{department.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditDepartment(department.id)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(department.id)}
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

