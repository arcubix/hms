import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { api, Patient, CreatePatientData } from '../../services/api';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface PatientSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientSelect: (patient: Patient) => void;
}

export function PatientSelectionDialog({
  open,
  onOpenChange,
  onPatientSelect,
}: PatientSelectionDialogProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'add'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState<Partial<CreatePatientData>>({
    name: '',
    phone: '',
    age: 0,
    gender: 'Male',
    email: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Search patients by phone
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await api.getPatients({ phone: searchQuery.trim() });
      setSearchResults(results);
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  // Create new patient
  const handleCreatePatient = async () => {
    if (!newPatientForm.name || !newPatientForm.phone || !newPatientForm.age) {
      setCreateError('Name, Phone, and Age are required');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const patient = await api.createPatient({
        name: newPatientForm.name,
        phone: newPatientForm.phone,
        age: newPatientForm.age,
        gender: newPatientForm.gender || 'Male',
        email: newPatientForm.email || undefined,
      });

      // Auto-select the newly created patient
      onPatientSelect(patient);
      onOpenChange(false);
      
      // Reset form
      setNewPatientForm({
        name: '',
        phone: '',
        age: 0,
        gender: 'Male',
        email: '',
      });
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create patient');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    onPatientSelect(patient);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Patient</DialogTitle>
          <DialogDescription>
            Search for an existing patient by mobile number or add a new patient
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'add')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="add">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-search">Mobile Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone-search"
                  placeholder="Enter mobile number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <Label>Search Results</Label>
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.phone} • {patient.patient_id}
                    </div>
                    {patient.email && (
                      <div className="text-xs text-muted-foreground">{patient.email}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim() && !searchLoading && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No patients found with this mobile number</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter patient name"
                  value={newPatientForm.name || ''}
                  onChange={(e) =>
                    setNewPatientForm({ ...newPatientForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter mobile number"
                  value={newPatientForm.phone || ''}
                  onChange={(e) =>
                    setNewPatientForm({ ...newPatientForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={newPatientForm.age || ''}
                    onChange={(e) =>
                      setNewPatientForm({
                        ...newPatientForm,
                        age: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={newPatientForm.gender}
                    onValueChange={(value) =>
                      setNewPatientForm({ ...newPatientForm, gender: value as any })
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={newPatientForm.email || ''}
                  onChange={(e) =>
                    setNewPatientForm({ ...newPatientForm, email: e.target.value })
                  }
                />
              </div>

              {createError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {createError}
                </div>
              )}

              <Button
                onClick={handleCreatePatient}
                disabled={createLoading}
                className="w-full"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create & Select Patient
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

