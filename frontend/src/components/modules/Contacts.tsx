import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  X,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Search,
  Users,
  Headphones,
  Code,
  Shield,
  Settings,
  FileText,
  CheckCircle,
  MapPin,
  Globe,
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { api, SoftwareTeamContact, CreateSoftwareTeamContactData } from '../../services/api';
import { toast } from 'sonner';
import { usePermissions } from '../../contexts/PermissionContext';
import { PermissionGuard } from '../common/PermissionGuard';
import { PermissionButton } from '../common/PermissionButton';

interface ContactPerson {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  mobile?: string;
  extension?: string;
  availability: string;
  status: 'available' | 'busy' | 'offline';
  specialization: string[];
  avatar?: string;
  location?: string;
}

interface ContactsProps {
  onClose?: () => void;
  user?: {
    role?: string;
    roles?: string[];
  };
}

const supportChannels = [
  {
    icon: <Phone className="w-5 h-5" />,
    title: '24/7 Phone Support',
    description: 'Call us anytime for urgent issues',
    contact: '+1 (800) MEDICARE',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Email Support',
    description: 'Get response within 24 hours',
    contact: 'support@medicare-hms.com',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Live Chat',
    description: 'Chat with our team in real-time',
    contact: 'Available Mon-Fri, 8 AM - 8 PM',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Help Center',
    description: 'Browse articles and guides',
    contact: 'help.medicare-hms.com',
    color: 'bg-orange-50 text-orange-600'
  }
];

export function Contacts({ onClose, user }: ContactsProps) {
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactPerson | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [deletingContact, setDeletingContact] = useState<ContactPerson | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateSoftwareTeamContactData>({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    extension: '',
    availability: '',
    status: 'available',
    specialization: [],
    avatar: '',
    location: ''
  });
  const [specializationInput, setSpecializationInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check permissions
  const { hasPermission } = usePermissions();
  const canManageContacts = hasPermission('admin.edit_users');

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterDepartment !== 'all') filters.department = filterDepartment;
      
      const response = await api.getSoftwareTeamContacts(filters);
      setContacts(response.contacts || []);
      setDepartments(response.departments || []);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load contacts';
      setError(errorMessage);
      toast.error(errorMessage);
      // Set empty arrays on error to ensure no mock data is shown
      setContacts([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload contacts when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContacts();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterDepartment]);

  const handleAddClick = () => {
    setFormData({
      name: '',
      role: '',
      department: '',
      email: '',
      phone: '',
      mobile: '',
      extension: '',
      availability: '',
      status: 'available',
      specialization: [],
      avatar: '',
      location: ''
    });
    setSpecializationInput('');
    setFormErrors({});
    setShowAddDialog(true);
  };

  const handleEditClick = (contact: ContactPerson) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      department: contact.department,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile || '',
      extension: contact.extension || '',
      availability: contact.availability,
      status: contact.status,
      specialization: [...contact.specialization],
      avatar: contact.avatar || '',
      location: contact.location || ''
    });
    setSpecializationInput('');
    setFormErrors({});
    setShowEditDialog(true);
  };

  const handleDeleteClick = (contact: ContactPerson) => {
    setDeletingContact(contact);
    setShowDeleteDialog(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }

    if (!formData.availability.trim()) {
      errors.availability = 'Availability is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization?.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        specialization: [...(formData.specialization || []), specializationInput.trim()]
      });
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    const newSpecializations = [...(formData.specialization || [])];
    newSpecializations.splice(index, 1);
    setFormData({ ...formData, specialization: newSpecializations });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const dataToSave: CreateSoftwareTeamContactData = {
        ...formData,
        mobile: formData.mobile || undefined,
        extension: formData.extension || undefined,
        avatar: formData.avatar || undefined,
        location: formData.location || undefined,
        specialization: formData.specialization?.filter(s => s.trim()) || []
      };

      if (editingContact) {
        await api.updateSoftwareTeamContact(editingContact.id, dataToSave);
        toast.success('Contact updated successfully');
        setShowEditDialog(false);
      } else {
        await api.createSoftwareTeamContact(dataToSave);
        toast.success('Contact created successfully');
        setShowAddDialog(false);
      }

      setEditingContact(null);
      await loadContacts();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save contact';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingContact) return;

    try {
      setSaving(true);
      await api.deleteSoftwareTeamContact(deletingContact.id);
      toast.success('Contact deleted successfully');
      setShowDeleteDialog(false);
      setDeletingContact(null);
      await loadContacts();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete contact';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getDepartmentIcon = (department: string) => {
    if (department.includes('Support')) return <Headphones className="w-4 h-4" />;
    if (department.includes('Development')) return <Code className="w-4 h-4" />;
    if (department.includes('Security')) return <Shield className="w-4 h-4" />;
    if (department.includes('Implementation')) return <Settings className="w-4 h-4" />;
    if (department.includes('Training')) return <FileText className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">Software Team Contacts</h1>
              <p className="text-sm text-gray-500 mt-1">Get in touch with our support team for assistance</p>
            </div>
            <div className="flex items-center gap-2">
              <PermissionButton 
                permission="admin.edit_users"
                tooltipMessage="You need permission to add contacts"
                onClick={handleAddClick} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </PermissionButton>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-lg ${channel.color} flex items-center justify-center mb-3`}>
                  {channel.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{channel.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{channel.description}</p>
                <p className="text-sm text-blue-600">{channel.contact}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, role, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={filterDepartment === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDepartment('all')}
                  className="whitespace-nowrap"
                >
                  All Departments
                </Button>
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={filterDepartment === dept ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterDepartment(dept)}
                    className="whitespace-nowrap"
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-12 border-red-200 bg-red-50">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error loading contacts</h3>
              <p className="text-red-700">{error}</p>
              <Button onClick={loadContacts} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Team Members Grid */}
        {!loading && !error && (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
            <Card 
              key={contact.id} 
                  className="hover:shadow-lg transition-all"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{contact.role}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      {getDepartmentIcon(contact.department)}
                      <span className="truncate">{contact.department}</span>
                    </div>
                  </div>
                      <PermissionGuard permission="admin.edit_users">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <PermissionButton
                            permission="admin.edit_users"
                            tooltipMessage="You need permission to edit contacts"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(contact)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </PermissionButton>
                          <PermissionButton
                            permission="admin.delete_users"
                            tooltipMessage="You need permission to delete contacts"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(contact)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </PermissionButton>
                        </div>
                      </PermissionGuard>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{contact.phone}</span>
                </div>
                {contact.extension && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-500">Ext: {contact.extension}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500">{contact.availability}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {contact.specialization.slice(0, 2).map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {contact.specialization.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{contact.specialization.length - 2}
                    </Badge>
                  )}
                </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setSelectedContact(contact)}
                    >
                      View Details
                    </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
            {contacts.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-500">
                    No contacts available. Click "Add Contact" to create your first contact.
                  </p>
            </div>
          </Card>
            )}
          </>
        )}

        {/* Emergency Support Banner */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Need Immediate Assistance?</h3>
                <p className="text-sm text-gray-600">Our 24/7 emergency support line is always available for critical issues.</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedContact(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(selectedContact.status)}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{selectedContact.name}</h2>
                    <p className="text-gray-600">{selectedContact.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedContact.status === 'available' ? 'default' : 'secondary'}>
                        {getStatusText(selectedContact.status)}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        {getDepartmentIcon(selectedContact.department)}
                        {selectedContact.department}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email</span>
                    </div>
                    <p className="text-sm font-medium text-blue-600">{selectedContact.email}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone</span>
                    </div>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                  {selectedContact.mobile && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Mobile</span>
                      </div>
                      <p className="font-medium">{selectedContact.mobile}</p>
                    </div>
                  )}
                  {selectedContact.extension && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Extension</span>
                      </div>
                      <p className="font-medium">{selectedContact.extension}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Availability */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{selectedContact.availability}</span>
                </div>
              </div>

              <Separator />

              {/* Specialization */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContact.specialization.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedContact.location && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Location</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedContact.location}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new software team contact person
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={formErrors.role ? 'border-red-500' : ''}
                />
                {formErrors.role && <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={formErrors.department ? 'border-red-500' : ''}
              />
              {formErrors.department && <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={formErrors.phone ? 'border-red-500' : ''}
                />
                {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="extension">Extension</Label>
                <Input
                  id="extension"
                  value={formData.extension || ''}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="availability">Availability *</Label>
              <Textarea
                id="availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className={formErrors.availability ? 'border-red-500' : ''}
                rows={2}
              />
              {formErrors.availability && <p className="text-sm text-red-500 mt-1">{formErrors.availability}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'available' | 'busy' | 'offline') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={formData.avatar || ''}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specializations</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="specialization"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialization();
                    }
                  }}
                  placeholder="Add specialization and press Enter"
                />
                <Button type="button" onClick={handleAddSpecialization} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialization?.map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(idx)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="edit-role">Role *</Label>
                <Input
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={formErrors.role ? 'border-red-500' : ''}
                />
                {formErrors.role && <p className="text-sm text-red-500 mt-1">{formErrors.role}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={formErrors.department ? 'border-red-500' : ''}
              />
              {formErrors.department && <p className="text-sm text-red-500 mt-1">{formErrors.department}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={formErrors.phone ? 'border-red-500' : ''}
                />
                {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-mobile">Mobile</Label>
                <Input
                  id="edit-mobile"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-extension">Extension</Label>
                <Input
                  id="edit-extension"
                  value={formData.extension || ''}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-availability">Availability *</Label>
              <Textarea
                id="edit-availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className={formErrors.availability ? 'border-red-500' : ''}
                rows={2}
              />
              {formErrors.availability && <p className="text-sm text-red-500 mt-1">{formErrors.availability}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'available' | 'busy' | 'offline') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-avatar">Avatar URL</Label>
              <Input
                id="edit-avatar"
                value={formData.avatar || ''}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialization">Specializations</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="edit-specialization"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialization();
                    }
                  }}
                  placeholder="Add specialization and press Enter"
                />
                <Button type="button" onClick={handleAddSpecialization} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialization?.map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(idx)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingContact?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
