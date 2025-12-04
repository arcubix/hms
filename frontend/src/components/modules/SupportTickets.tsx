import React, { useState, useEffect, useCallback } from 'react';
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
  Activity,
  Loader2,
  Trash2
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
import { toast } from 'sonner';
import { 
  api, 
  SupportTicket, 
  SupportTicketComment, 
  SupportTicketAttachment,
  SupportTicketStats,
  CreateSupportTicketData
} from '../../services/api';

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
  user?: {
    id?: string | number;
    role?: string;
    roles?: string[];
  };
}

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export function SupportTickets({ onClose, user }: SupportTicketsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'add'>('list');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [stats, setStats] = useState<SupportTicketStats>({
    open: 0,
    'in-progress': 0,
    resolved: 0,
    closed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentTicket, setCommentTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form states
  const [practiceId] = useState('10291914');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Comment form state
  const [commentText, setCommentText] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || 
                 user?.role === 'Admin' || 
                 (Array.isArray(user?.roles) && (user.roles.includes('admin') || user.roles.includes('Admin')));

  // Load tickets on mount and when filters change
  useEffect(() => {
    loadTickets();
  }, [filterStatus, filterPriority]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (filterPriority !== 'all') filters.priority = filterPriority;
      
      const response = await api.getSupportTickets(filters);
      setTickets(response.tickets || []);
      setStats(response.stats || stats);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load tickets';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const ticket = await api.getSupportTicket(ticketId);
      setSelectedTicket(ticket);
      setViewMode('detail');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load ticket details';
      toast.error(errorMessage);
      console.error('Failed to load ticket details:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) attached`);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = async () => {
    if (!contactNumber || !selectedModule || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const ticketData: CreateSupportTicketData = {
        practice_id: practiceId,
        module: selectedModule,
        description: message,
        contact_number: contactNumber,
        priority: priority
      };

      const newTicket = await api.createSupportTicket(ticketData);
      
      // Upload files if any
      if (attachedFiles.length > 0 && newTicket.id) {
        for (const file of attachedFiles) {
          try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            await api.uploadSupportTicketAttachment(newTicket.id, formData);
          } catch (err: any) {
            console.error('Failed to upload file:', err);
            toast.error(`Failed to upload ${file.name}`);
          } finally {
            setUploading(false);
          }
        }
      }

      toast.success('Support ticket created successfully!', {
        description: 'Our team will review your ticket and get back to you soon.'
      });

      // Reset form
      setContactNumber('');
      setSelectedModule('');
      setMessage('');
      setPriority('medium');
      setAttachedFiles([]);
      
      // Reload tickets and show detail view
      await loadTickets();
      await loadTicketDetails(newTicket.id);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create ticket';
      toast.error(errorMessage);
      console.error('Failed to create ticket:', err);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleViewDetails = (ticket: SupportTicket) => {
    loadTicketDetails(ticket.id);
  };

  const handleAddComment = (ticket: SupportTicket) => {
    setCommentTicket(ticket);
    setShowCommentDialog(true);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !commentTicket) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await api.addSupportTicketComment(commentTicket.id, { content: commentText });
      toast.success('Comment added successfully!');
      setCommentText('');
      setShowCommentDialog(false);
      setCommentTicket(null);
      
      // Reload ticket details if viewing
      if (selectedTicket && selectedTicket.id === commentTicket.id) {
        await loadTicketDetails(selectedTicket.id);
      }
      
      // Reload tickets list
      await loadTickets();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add comment';
      toast.error(errorMessage);
      console.error('Failed to add comment:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket || !isAdmin) {
      toast.error('Only admins can change ticket status');
      return;
    }

    try {
      await api.updateSupportTicket(selectedTicket.id, { status: newStatus as any });
      toast.success(`Ticket status updated to ${newStatus}`);
      await loadTicketDetails(selectedTicket.id);
      await loadTickets();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update status';
      toast.error(errorMessage);
      console.error('Failed to update status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!selectedTicket || !isAdmin) {
      toast.error('Only admins can change ticket priority');
      return;
    }

    try {
      await api.updateSupportTicket(selectedTicket.id, { priority: newPriority as any });
      toast.success(`Ticket priority updated to ${newPriority}`);
      await loadTicketDetails(selectedTicket.id);
      await loadTickets();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update priority';
      toast.error(errorMessage);
      console.error('Failed to update priority:', err);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!isAdmin) {
      toast.error('Only admins can delete tickets');
      return;
    }

    if (!confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      await api.deleteSupportTicket(ticketId);
      toast.success('Ticket deleted successfully');
      await loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setViewMode('list');
        setSelectedTicket(null);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete ticket';
      toast.error(errorMessage);
      console.error('Failed to delete ticket:', err);
    }
  };

  const handleDownloadAttachment = (attachment: SupportTicketAttachment) => {
    // Create download link
    const baseUrl = (window as any).__API_BASE_URL__ || 'http://localhost/hms';
    const url = `${baseUrl}/${attachment.file_path}`;
    window.open(url, '_blank');
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!selectedTicket) return;
    
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await api.deleteSupportTicketAttachment(selectedTicket.id, attachmentId);
      toast.success('Attachment deleted successfully');
      await loadTicketDetails(selectedTicket.id);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete attachment';
      toast.error(errorMessage);
      console.error('Failed to delete attachment:', err);
    }
  };

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

  // Filter tickets client-side (backend also filters, but this is for immediate UI feedback)
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.module.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
              <Label className="text-gray-900 mb-2">Contact Number *</Label>
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
                  required
                />
              </div>
            </div>

            {/* Module Where You Face The Issue */}
            <div>
              <Label className="text-gray-900 mb-2">Module Where You Face The Issue *</Label>
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

            {/* Priority */}
            <div>
              <Label className="text-gray-900 mb-2">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attach File */}
            <div>
              <Label className="text-gray-900 mb-2">Attach File(s)</Label>
              <div className="space-y-2">
              <div className="relative">
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                    multiple
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-500">
                      {attachedFiles.length > 0 ? `${attachedFiles.length} file(s) selected` : 'Click to attach files'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </label>
                </div>
                {attachedFiles.length > 0 && (
                  <div className="space-y-1">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(idx)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Type Message */}
            <div>
              <Label className="text-gray-900 mb-2">Type Message *</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="border-gray-300 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmitTicket}
                className="bg-blue-600 hover:bg-blue-700 px-8"
                disabled={saving || uploading}
              >
                {saving || uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? 'Uploading...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit'
                )}
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
                  onClick={() => {
                    setViewMode('list');
                    setSelectedTicket(null);
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl text-gray-900">{selectedTicket.subject}</h1>
                    <Badge variant="outline" className="text-sm">
                      {selectedTicket.ticket_number}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">View and manage ticket details</p>
                </div>
              </div>
              <div className="flex gap-3">
                {isAdmin && (
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={handleStatusChange}
                  >
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
                )}
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
                        {selectedTicket.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{attachment.file_name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={() => handleDownloadAttachment(attachment)}
                            >
                              <Download className="w-4 h-4 text-gray-400" />
                            </Button>
                            {(isAdmin || attachment.uploaded_by_user_id === parseInt(user?.id as string)) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
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
                                {comment.author_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900">{comment.author_name}</p>
                                    {comment.author_role && (
                                      <p className="text-xs text-gray-500">{comment.author_role}</p>
                                    )}
                                  </div>
                                  <Badge variant={comment.type === 'support' ? 'default' : 'secondary'} className="text-xs">
                                    {comment.type === 'support' ? 'Support Team' : 'User'}
                                  </Badge>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 ml-1">{formatDate(comment.created_at)}</p>
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
                        disabled={!commentText.trim()}
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
                      {isAdmin ? (
                        <Select 
                          value={selectedTicket.priority} 
                          onValueChange={handlePriorityChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                      <Badge className={`${getPriorityColor(selectedTicket.priority)} text-sm capitalize`}>
                        {selectedTicket.priority}
                      </Badge>
                      )}
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
                    <p className="text-gray-900 mt-2">{selectedTicket.assigned_to_name || 'Unassigned'}</p>
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
                    <p className="text-gray-900 mt-2">{formatDate(selectedTicket.created_at)}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-gray-600 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Updated
                    </Label>
                    <p className="text-gray-900 mt-2">{formatDate(selectedTicket.updated_at)}</p>
                  </div>

                  {selectedTicket.resolved_at && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-gray-600 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Resolved
                        </Label>
                        <p className="text-gray-900 mt-2">{formatDate(selectedTicket.resolved_at)}</p>
                      </div>
                    </>
                  )}

                  {selectedTicket.closed_at && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-gray-600 text-sm flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Closed
                        </Label>
                        <p className="text-gray-900 mt-2">{formatDate(selectedTicket.closed_at)}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions Card */}
              {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleStatusChange('resolved')}
                      disabled={selectedTicket.status === 'resolved'}
                    >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Ticket
                  </Button>
                </CardContent>
              </Card>
              )}
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
                    {loading ? '...' : stats.open}
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
                    {loading ? '...' : stats['in-progress']}
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
                    {loading ? '...' : stats.resolved}
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loading ? '...' : stats.total}
                  </p>
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

        {/* Loading State */}
        {loading && (
          <Card className="p-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading tickets...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tickets</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={loadTickets} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Tickets List */}
        {!loading && !error && (
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
                          {ticket.ticket_number}
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
                          <span>{formatDate(ticket.created_at)}</span>
                      </div>

                        {ticket.assigned_to_name && (
                        <div className="text-gray-500">
                            Assigned to: <span className="font-medium">{ticket.assigned_to_name}</span>
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
                        {isAdmin && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Ticket
                      </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredTickets.length === 0 && (
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
              Add a comment to ticket {commentTicket?.ticket_number}
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
                disabled={!commentText.trim()}
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
