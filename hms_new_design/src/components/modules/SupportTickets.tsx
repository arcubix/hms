import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  X,
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
  ArrowLeft,
  User,
  Calendar,
  Tag,
  FileText,
  Edit,
  Send,
  Download,
  Activity
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
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
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
    description: 'Getting error when trying to add new patient records in the system. When I click the "Add Patient" button, the form appears but throws an error message "Unable to save patient data" after filling all required fields and clicking submit. This is blocking our patient registration process.',
    attachments: ['screenshot.png', 'error-log.txt'],
    comments: [
      {
        id: 'c1',
        author: 'Dr. Admin User',
        role: 'Hospital Admin',
        content: 'This is a critical issue affecting our daily operations. Please prioritize.',
        timestamp: '2024-11-20 11:00 AM',
        type: 'user'
      },
      {
        id: 'c2',
        author: 'Sarah Johnson',
        role: 'Customer Success Manager',
        content: 'Thank you for reporting this issue. I have escalated this to our technical team. They are currently investigating the error logs you provided.',
        timestamp: '2024-11-20 11:30 AM',
        type: 'support'
      },
      {
        id: 'c3',
        author: 'Michael Chen',
        role: 'Technical Support',
        content: 'We have identified the issue. It appears to be related to a database connection timeout. We are deploying a fix now.',
        timestamp: '2024-11-20 12:15 PM',
        type: 'support'
      }
    ]
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
    description: 'Inventory quantities are not syncing properly between POS and main inventory. When we sell items at the POS, the main inventory doesn\'t update in real-time.',
    attachments: [],
    comments: [
      {
        id: 'c4',
        author: 'Pharmacy Manager',
        role: 'Pharmacist',
        content: 'This is causing inventory discrepancies. We need this fixed urgently.',
        timestamp: '2024-11-19 03:00 PM',
        type: 'user'
      }
    ]
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
    description: 'Lab test results are showing formatting issues in the report view. The layout appears broken on mobile devices.',
    attachments: ['report.pdf'],
    comments: [
      {
        id: 'c5',
        author: 'David Kumar',
        role: 'Lead Developer',
        content: 'Fixed the CSS styling issue. Please check and confirm.',
        timestamp: '2024-11-19 02:30 PM',
        type: 'support'
      },
      {
        id: 'c6',
        author: 'Lab Technician',
        role: 'Laboratory Staff',
        content: 'Confirmed! The issue is resolved. Reports are displaying correctly now. Thank you!',
        timestamp: '2024-11-19 03:45 PM',
        type: 'user'
      }
    ]
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    subject: 'Appointment booking system slow',
    module: 'Appointments',
    status: 'open',
    priority: 'urgent',
    createdAt: '2024-11-20 08:45 AM',
    updatedAt: '2024-11-20 08:45 AM',
    assignedTo: 'Emily Rodriguez',
    description: 'The appointment booking system is responding very slowly, causing delays in patient scheduling.',
    attachments: [],
    comments: []
  },
  {
    id: '5',
    ticketNumber: 'TKT-2024-005',
    subject: 'Billing report export error',
    module: 'Billing',
    status: 'closed',
    priority: 'medium',
    createdAt: '2024-11-15 04:30 PM',
    updatedAt: '2024-11-17 02:20 PM',
    assignedTo: 'James Wilson',
    description: 'Cannot export monthly billing reports to Excel format.',
    attachments: ['error-log.txt'],
    comments: [
      {
        id: 'c7',
        author: 'James Wilson',
        role: 'Billing Specialist',
        content: 'Issue has been resolved. Excel export functionality is working properly now.',
        timestamp: '2024-11-17 02:20 PM',
        type: 'support'
      }
    ]
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

interface SupportTicketsProps {
  onClose?: () => void;
}

export function SupportTickets({ onClose }: SupportTicketsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'add'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentTicket, setCommentTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form states
  const [practiceId] = useState('10291914');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Comment form state
  const [commentText, setCommentText] = useState('');

  // Filter tickets
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.module.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
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
    setViewMode('list');
  };

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setViewMode('detail');
  };

  const handleAddComment = (ticket: Ticket) => {
    setCommentTicket(ticket);
    setShowCommentDialog(true);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    toast.success('Comment added successfully!');
    setCommentText('');
    setShowCommentDialog(false);
    setCommentTicket(null);
  };

  const handleStatusChange = (newStatus: string) => {
    toast.success(`Ticket status updated to ${newStatus}`);
  };

  // Add New Ticket Form
  if (viewMode === 'add') {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl text-gray-900">WHAT ISSUES ARE YOU FACING?</h1>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-gray-700 mb-8">
            We care for your feedback. Feel free to contact us. Our support agents are available 24/7 for your assistance!
          </p>

          <div className="space-y-6">
            {/* Practice ID */}
            <div>
              <Label className="text-gray-700 mb-2">Practice ID</Label>
              <Input
                value={practiceId}
                disabled
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Contact Number */}
            <div>
              <Label className="text-gray-900 mb-2">Contact Number</Label>
              <div className="flex gap-2">
                <Input
                  value="+92"
                  disabled
                  className="w-20 bg-gray-50 border-gray-200"
                />
                <Input
                  placeholder="3331111193"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="flex-1 border-gray-300"
                />
              </div>
            </div>

            {/* Module Where You Face The Issue */}
            <div>
              <Label className="text-gray-900 mb-2">Module Where You Face The Issue</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-full border-gray-300">
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
              <Label className="text-gray-900 mb-2">Attach File</Label>
              <div className="relative">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-500">
                    {attachedFile ? attachedFile.name : 'Attach File Here'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </label>
              </div>
            </div>

            {/* Type Message */}
            <div>
              <Label className="text-gray-900 mb-2">Type Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="border-gray-300 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmitTicket}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ticket Detail View
  if (viewMode === 'detail' && selectedTicket) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl text-gray-900">{selectedTicket.subject}</h1>
                    <Badge variant="outline" className="text-sm">
                      {selectedTicket.ticketNumber}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">View and manage ticket details</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Select defaultValue={selectedTicket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ticket Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Ticket Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600 text-sm">Description</Label>
                    <p className="text-gray-900 mt-2 leading-relaxed">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div>
                      <Label className="text-gray-600 text-sm mb-2">Attachments</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTicket.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file}</span>
                            <Download className="w-4 h-4 text-gray-400 ml-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Activity & Comments ({selectedTicket.comments?.length || 0})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                        selectedTicket.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarFallback className={comment.type === 'support' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                                {comment.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900">{comment.author}</p>
                                    <p className="text-xs text-gray-500">{comment.role}</p>
                                  </div>
                                  <Badge variant={comment.type === 'support' ? 'default' : 'secondary'} className="text-xs">
                                    {comment.type === 'support' ? 'Support Team' : 'User'}
                                  </Badge>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 ml-1">{comment.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>No comments yet</p>
                          <p className="text-sm mt-1">Be the first to add a comment</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  {/* Add Comment Form */}
                  <div className="space-y-3">
                    <Label>Add Comment</Label>
                    <Textarea
                      placeholder="Type your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600 text-sm">Status</Label>
                    <div className="mt-2">
                      <Badge className={`${getStatusColor(selectedTicket.status)} text-sm`}>
                        {getStatusIcon(selectedTicket.status)}
                        <span className="ml-2 capitalize">{selectedTicket.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-gray-600 text-sm">Priority</Label>
                    <div className="mt-2">
                      <Badge className={`${getPriorityColor(selectedTicket.priority)} text-sm capitalize`}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-gray-600 text-sm flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Module
                    </Label>
                    <p className="text-gray-900 mt-2">{selectedTicket.module}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-gray-600 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assigned To
                    </Label>
                    <p className="text-gray-900 mt-2">{selectedTicket.assignedTo || 'Unassigned'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created
                    </Label>
                    <p className="text-gray-900 mt-2">{selectedTicket.createdAt}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-gray-600 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Updated
                    </Label>
                    <p className="text-gray-900 mt-2">{selectedTicket.updatedAt}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Ticket
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <X className="w-4 h-4 mr-2" />
                    Close Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ticket List View
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">Support Tickets</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track your support requests</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setViewMode('add')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Ticket
              </Button>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {mockTickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
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
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{mockTickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tickets by number, subject, or module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
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

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => handleViewDetails(ticket)}
                      >
                        {ticket.subject}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {ticket.ticketNumber}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          <span className="capitalize">{ticket.priority}</span>
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{ticket.module}</span>
                      </div>

                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Paperclip className="w-4 h-4" />
                          <span>{ticket.attachments.length} attachment(s)</span>
                        </div>
                      )}

                      {ticket.comments && ticket.comments.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          <span>{ticket.comments.length} comment(s)</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{ticket.createdAt}</span>
                      </div>

                      {ticket.assignedTo && (
                        <div className="text-gray-500">
                          Assigned to: <span className="font-medium">{ticket.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(ticket)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddComment(ticket)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTickets.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <Button onClick={() => setViewMode('add')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Ticket
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment to ticket {commentTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {commentTicket && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{commentTicket.subject}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{commentTicket.description}</p>
              </div>
            )}

            <div>
              <Label>Your Comment</Label>
              <Textarea
                placeholder="Type your comment here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={6}
                className="mt-2 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommentDialog(false);
                  setCommentText('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
