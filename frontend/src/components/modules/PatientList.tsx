import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Stethoscope, 
  Folder, 
  FileText, 
  MessageCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { api, Patient } from '../../services/api';

interface PatientListProps {
  onViewProfile?: (patientId: string) => void;
  onAddPatient?: () => void;
  onEditPatient?: (patientId: string) => void;
}

export function PatientList({ onViewProfile, onAddPatient, onEditPatient }: PatientListProps = {}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Critical' | 'Inactive'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await api.deletePatient(id.toString());
      await loadPatients();
    } catch (err: any) {
      alert('Failed to delete patient: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEdit = (patient: Patient) => {
    if (onEditPatient) {
      onEditPatient(patient.id.toString());
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getCondition = (patient: Patient) => {
    // Placeholder - in real app this would come from medical records
    // For now, we'll use a simple mapping based on age/status
    if (patient.status === 'Critical') return 'Heart Disease';
    if (patient.age > 60) return 'Hypertension';
    if (patient.age < 30) return 'Allergies';
    return 'Diabetes';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Management</h2>
        <Button onClick={onAddPatient || (() => {})} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search patients by name, ID, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('All')}
            className={statusFilter === 'All' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'Active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('Active')}
            className={statusFilter === 'Active' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'Critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('Critical')}
            className={statusFilter === 'Critical' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Critical
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading patients...</div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Patients ({filteredPatients.length})
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== 'All' 
                          ? 'No patients found matching your search.' 
                          : 'No patients found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(patient.name)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {onViewProfile ? (
                                  <button
                                    onClick={() => onViewProfile(patient.id.toString())}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {patient.name}
                                  </button>
                                ) : (
                                  patient.name
                                )}
                              </span>
                              <span className="text-xs text-gray-500">ID: {patient.patient_id}</span>
                              <span className="text-xs text-gray-500">{patient.age}y, {patient.gender}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-900">{patient.phone}</span>
                            <span className="text-gray-500 text-xs">{patient.email || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(patient.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700">{getCondition(patient)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(patient.status)} border rounded-full px-3 py-0.5`}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onViewProfile?.(patient.id.toString())}
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Message"
                            >
                              <Mail className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Medical Record"
                            >
                              <Stethoscope className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Files"
                            >
                              <Folder className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Notes"
                            >
                              <FileText className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(patient)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(patient.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Chat"
                            >
                              <MessageCircle className="w-4 h-4 text-gray-600" />
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
      )}
    </div>
  );
}
