import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { 
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
  Smartphone
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface ContactPerson {
  id: string;
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

const softwareTeamContacts: ContactPerson[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Customer Success Manager',
    department: 'Customer Support',
    email: 'sarah.johnson@medicare-support.com',
    phone: '+1 (555) 123-4567',
    mobile: '+1 (555) 123-4568',
    extension: '1001',
    availability: 'Mon-Fri, 8:00 AM - 6:00 PM',
    status: 'available',
    specialization: ['General Support', 'Account Management', 'Training'],
    location: 'New York, USA'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Senior Technical Support Engineer',
    department: 'Technical Support',
    email: 'michael.chen@medicare-support.com',
    phone: '+1 (555) 234-5678',
    mobile: '+1 (555) 234-5679',
    extension: '1002',
    availability: 'Mon-Fri, 9:00 AM - 7:00 PM',
    status: 'available',
    specialization: ['Technical Issues', 'System Configuration', 'Database'],
    location: 'San Francisco, USA'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Implementation Specialist',
    department: 'Implementation Team',
    email: 'emily.rodriguez@medicare-support.com',
    phone: '+1 (555) 345-6789',
    mobile: '+1 (555) 345-6790',
    extension: '1003',
    availability: 'Mon-Sat, 7:00 AM - 5:00 PM',
    status: 'busy',
    specialization: ['System Setup', 'Data Migration', 'Integration'],
    location: 'Austin, USA'
  },
  {
    id: '4',
    name: 'David Kumar',
    role: 'Lead Software Developer',
    department: 'Development Team',
    email: 'david.kumar@medicare-support.com',
    phone: '+1 (555) 456-7890',
    extension: '1004',
    availability: 'Mon-Fri, 10:00 AM - 6:00 PM',
    status: 'available',
    specialization: ['Custom Development', 'API Integration', 'Bug Fixes'],
    location: 'Seattle, USA'
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    role: 'Training Coordinator',
    department: 'Training & Education',
    email: 'jessica.taylor@medicare-support.com',
    phone: '+1 (555) 567-8901',
    mobile: '+1 (555) 567-8902',
    extension: '1005',
    availability: 'Mon-Fri, 8:00 AM - 4:00 PM',
    status: 'available',
    specialization: ['User Training', 'Documentation', 'Webinars'],
    location: 'Boston, USA'
  },
  {
    id: '6',
    name: 'Robert Martinez',
    role: 'Security & Compliance Officer',
    department: 'Security Team',
    email: 'robert.martinez@medicare-support.com',
    phone: '+1 (555) 678-9012',
    extension: '1006',
    availability: 'Mon-Fri, 9:00 AM - 5:00 PM',
    status: 'available',
    specialization: ['HIPAA Compliance', 'Data Security', 'Access Control'],
    location: 'Washington DC, USA'
  },
  {
    id: '7',
    name: 'Amanda Foster',
    role: 'Product Manager',
    department: 'Product Team',
    email: 'amanda.foster@medicare-support.com',
    phone: '+1 (555) 789-0123',
    extension: '1007',
    availability: 'Mon-Fri, 9:00 AM - 6:00 PM',
    status: 'offline',
    specialization: ['Feature Requests', 'Product Feedback', 'Roadmap'],
    location: 'San Diego, USA'
  },
  {
    id: '8',
    name: 'James Wilson',
    role: 'Billing & Licensing Specialist',
    department: 'Finance Support',
    email: 'james.wilson@medicare-support.com',
    phone: '+1 (555) 890-1234',
    extension: '1008',
    availability: 'Mon-Fri, 8:00 AM - 5:00 PM',
    status: 'available',
    specialization: ['Billing Issues', 'License Management', 'Renewals'],
    location: 'Chicago, USA'
  }
];

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

export function SoftwareTeamContacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactPerson | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Get unique departments
  const departments = ['all', ...new Set(softwareTeamContacts.map(c => c.department))];

  // Filter contacts based on search and department
  const filteredContacts = softwareTeamContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = filterDepartment === 'all' || contact.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Software Team Contacts</h2>
        <p className="text-sm text-gray-600 mt-1">Get in touch with our support team for assistance</p>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <Card>
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
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={filterDepartment === dept ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDepartment(dept)}
                  className="whitespace-nowrap"
                >
                  {dept === 'all' ? 'All Departments' : dept}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card 
            key={contact.id} 
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedContact(contact)}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredContacts.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        </Card>
      )}

      {/* Emergency Support Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
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
    </div>
  );
}
