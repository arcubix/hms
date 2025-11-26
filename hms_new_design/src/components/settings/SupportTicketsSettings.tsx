import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Upload,
  Eye,
  MoreVertical,
  Send
} from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  type: 'user' | 'support';
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  module: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  description: string;
  attachments?: string[];
  comments?: Comment[];
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    subject: 'Unable to add new patient records',
    module: 'Patients',
    status: 'open',
    priority: 'high',
    createdAt: '2024-11-20 10:30 AM',
    updatedAt: '2024-11-20 10:30 AM',
    assignedTo: 'Sarah Johnson',
    description: 'Getting error when trying to add new patient records in the system.',
    attachments: ['screenshot.png']
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    subject: 'Pharmacy inventory sync issue',
    module: 'Pharmacy',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-11-19 02:15 PM',
    updatedAt: '2024-11-20 09:00 AM',
    assignedTo: 'Michael Chen',
    description: 'Inventory quantities are not syncing properly between POS and main inventory.',
    attachments: []
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    subject: 'Lab results not displaying correctly',
    module: 'Laboratory',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-11-18 11:20 AM',
    updatedAt: '2024-11-19 03:45 PM',
    assignedTo: 'David Kumar',
    description: 'Lab test results are showing formatting issues in the report view.',
    attachments: ['report.pdf']
  }
];

const modules = [
  'Patients',
  'Appointments',
  'OPD',
  'IPD Management',
  'Emergency',
  'Laboratory',
  'Pharmacy',
  'Radiology',
  'Billing',
  'Reports',
  'Settings',
  'Other'
];

export function SupportTicketsSettings() {
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [practiceId] = useState('10291914');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Filter tickets
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      toast.success('File attached successfully');
    }
  };

  const handleSubmitTicket = () => {
    if (!contactNumber || !selectedModule || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Support ticket created successfully!', {
      description: 'Our team will review your ticket and get back to you soon.'
    });

    // Reset form
    setContactNumber('');
    setSelectedModule('');
    setMessage('');
    setAttachedFile(null);
    setShowAddTicket(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Support Tickets</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and track your support requests</p>
        </div>
        <Button
          onClick={() => setShowAddTicket(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {mockTickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {mockTickets.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {mockTickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{mockTickets.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <Badge variant="outline" className="text-xs">
                      {ticket.ticketNumber}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('-', ' ')}
                    </Badge>
                    
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>

                    <span className="text-gray-500">{ticket.module}</span>

                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Paperclip className="w-4 h-4" />
                        {ticket.attachments.length}
                      </span>
                    )}

                    <span className="text-gray-500">{ticket.createdAt}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Ticket Dialog */}
      <Dialog open={showAddTicket} onOpenChange={setShowAddTicket}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">WHAT ISSUES ARE YOU FACING?</DialogTitle>
          </DialogHeader>
          
          <p className="text-gray-700 text-sm mb-4">
            We care for your feedback. Feel free to contact us. Our support agents are available 24/7 for your assistance!
          </p>

          <div className="space-y-4">
            {/* Practice ID */}
            <div>
              <Label className="text-gray-700">Practice ID</Label>
              <Input
                value={practiceId}
                disabled
                className="bg-gray-50 border-gray-200 mt-2"
              />
            </div>

            {/* Contact Number */}
            <div>
              <Label className="text-gray-900">Contact Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value="+92"
                  disabled
                  className="w-20 bg-gray-50 border-gray-200"
                />
                <Input
                  placeholder="3331111193"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Module */}
            <div>
              <Label className="text-gray-900">Module Where You Face The Issue</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attach File */}
            <div>
              <Label className="text-gray-900">Attach File</Label>
              <div className="relative mt-2">
                <Input
                  type="file"
                  id="file-upload-dialog"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload-dialog"
                  className="flex items-center justify-between w-full px-4 py-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <span className="text-gray-500 text-sm">
                    {attachedFile ? attachedFile.name : 'Attach File Here'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </label>
              </div>
            </div>

            {/* Message */}
            <div>
              <Label className="text-gray-900">Type Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="mt-2 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmitTicket}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}