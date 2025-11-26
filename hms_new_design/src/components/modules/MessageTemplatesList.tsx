/**
 * Message Templates List Page
 * 
 * Complete list of all message templates:
 * - View all templates
 * - Filter by type (SMS/Email/WhatsApp)
 * - Filter by trigger
 * - Edit/Delete templates
 * - Preview templates
 * - Active/Inactive status
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  FileText,
  Bell,
  DollarSign,
  CheckCircle,
  Send,
  Copy,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageTemplatesListProps {
  onBack: () => void;
  onAddTemplate: () => void;
}

export function MessageTemplatesList({ onBack, onAddTemplate }: MessageTemplatesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTrigger, setFilterTrigger] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock templates data
  const templates = [
    {
      id: 'TPL-001',
      name: 'Appointment Confirmation SMS',
      type: 'sms',
      trigger: 'appointment_booked',
      category: 'appointments',
      message: 'Dear {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Thank you!',
      subject: null,
      isActive: true,
      sentCount: 1247,
      deliveryRate: 98.5,
      createdDate: '2024-10-15',
      lastUsed: '2024-11-21'
    },
    {
      id: 'TPL-002',
      name: 'Appointment Reminder Email',
      type: 'email',
      trigger: 'appointment_reminder_1day',
      category: 'reminders',
      message: 'This is a reminder for your upcoming appointment with {doctor_name} scheduled for tomorrow at {time}. Please arrive 15 minutes early.',
      subject: 'Appointment Reminder - {hospital_name}',
      isActive: true,
      sentCount: 856,
      deliveryRate: 99.2,
      createdDate: '2024-10-18',
      lastUsed: '2024-11-20'
    },
    {
      id: 'TPL-003',
      name: 'Lab Results WhatsApp',
      type: 'whatsapp',
      trigger: 'lab_results_ready',
      category: 'reports',
      message: 'Dear {patient_name}, your lab results are ready. Please visit {hospital_name} to collect your reports or access them through our patient portal.',
      subject: null,
      isActive: true,
      sentCount: 534,
      deliveryRate: 97.8,
      createdDate: '2024-10-20',
      lastUsed: '2024-11-21'
    },
    {
      id: 'TPL-004',
      name: '2 Hour Reminder SMS',
      type: 'sms',
      trigger: 'appointment_reminder_2hrs',
      category: 'reminders',
      message: 'Reminder: Your appointment is in 2 hours at {time} with {doctor_name} at {hospital_name}.',
      subject: null,
      isActive: true,
      sentCount: 423,
      deliveryRate: 98.1,
      createdDate: '2024-10-25',
      lastUsed: '2024-11-21'
    },
    {
      id: 'TPL-005',
      name: 'Bill Generated Email',
      type: 'email',
      trigger: 'bill_generated',
      category: 'billing',
      message: 'Dear {patient_name}, your bill of {bill_amount} has been generated. Please proceed to the billing counter for payment.',
      subject: 'Bill Generated - {hospital_name}',
      isActive: true,
      sentCount: 678,
      deliveryRate: 99.5,
      createdDate: '2024-11-01',
      lastUsed: '2024-11-21'
    },
    {
      id: 'TPL-006',
      name: 'Prescription Ready SMS',
      type: 'sms',
      trigger: 'prescription_ready',
      category: 'reports',
      message: 'Your prescription is ready. Please collect from pharmacy. Patient ID: {patient_id}',
      subject: null,
      isActive: false,
      sentCount: 289,
      deliveryRate: 96.4,
      createdDate: '2024-11-05',
      lastUsed: '2024-11-18'
    },
    {
      id: 'TPL-007',
      name: 'Discharge Summary Email',
      type: 'email',
      trigger: 'discharge_summary',
      category: 'reports',
      message: 'Dear {patient_name}, you have been discharged from {hospital_name}. Please follow the prescribed medication and visit for follow-up on {date}.',
      subject: 'Discharge Summary - {hospital_name}',
      isActive: true,
      sentCount: 145,
      deliveryRate: 99.8,
      createdDate: '2024-11-08',
      lastUsed: '2024-11-19'
    },
    {
      id: 'TPL-008',
      name: 'Follow-up Reminder WhatsApp',
      type: 'whatsapp',
      trigger: 'follow_up_reminder',
      category: 'follow-ups',
      message: 'Hello {patient_name}, this is a reminder for your follow-up appointment with {doctor_name} on {date} at {time}. Please confirm your attendance.',
      subject: null,
      isActive: true,
      sentCount: 312,
      deliveryRate: 98.9,
      createdDate: '2024-11-10',
      lastUsed: '2024-11-20'
    },
    {
      id: 'TPL-009',
      name: 'Payment Receipt SMS',
      type: 'sms',
      trigger: 'payment_received',
      category: 'billing',
      message: 'Payment of {bill_amount} received successfully. Thank you! Receipt ID: {appointment_id}',
      subject: null,
      isActive: true,
      sentCount: 892,
      deliveryRate: 99.1,
      createdDate: '2024-11-12',
      lastUsed: '2024-11-21'
    },
    {
      id: 'TPL-010',
      name: 'Surgery Scheduled Email',
      type: 'email',
      trigger: 'surgery_scheduled',
      category: 'confirmations',
      message: 'Dear {patient_name}, your surgery has been scheduled for {date} at {time}. Please arrive 2 hours before the scheduled time. Room: {room_number}',
      subject: 'Surgery Scheduled - {hospital_name}',
      isActive: false,
      sentCount: 67,
      deliveryRate: 100,
      createdDate: '2024-11-15',
      lastUsed: '2024-11-17'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'whatsapp':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleStatus = (templateId: string, currentStatus: boolean) => {
    toast.success(`Template ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
  };

  const handleEdit = (templateId: string) => {
    toast.info(`Editing template ${templateId}`);
  };

  const handleDelete = (templateId: string) => {
    toast.success(`Template ${templateId} deleted successfully!`);
  };

  const handleDuplicate = (templateId: string) => {
    toast.success(`Template ${templateId} duplicated successfully!`);
  };

  const handlePreview = (templateId: string) => {
    toast.info(`Previewing template ${templateId}`);
  };

  const handleExport = () => {
    toast.success('Templates exported successfully!');
  };

  // Statistics
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.isActive).length;
  const totalSent = templates.reduce((sum, t) => sum + t.sentCount, 0);
  const avgDeliveryRate = (templates.reduce((sum, t) => sum + t.deliveryRate, 0) / templates.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Message Settings
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Message Templates
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and monitor all automated message templates
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={onAddTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">{totalTemplates}</Badge>
              </div>
              <p className="text-2xl font-bold text-blue-900">{totalTemplates}</p>
              <p className="text-sm text-gray-600">Total Templates</p>
              <p className="text-xs text-blue-600 mt-1">{activeTemplates} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Send className="w-8 h-8 text-green-600" />
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{totalSent.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Messages Sent</p>
              <p className="text-xs text-green-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800">{avgDeliveryRate}%</Badge>
              </div>
              <p className="text-2xl font-bold text-purple-900">{avgDeliveryRate}%</p>
              <p className="text-sm text-gray-600">Avg. Delivery Rate</p>
              <p className="text-xs text-purple-600 mt-1">Across all templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Bell className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-800">8</Badge>
              </div>
              <p className="text-2xl font-bold text-orange-900">8</p>
              <p className="text-sm text-gray-600">Active Triggers</p>
              <p className="text-xs text-orange-600 mt-1">Automated events</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-xs mb-2 block">
                  Search Template
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Name, ID, Message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filter-type" className="text-xs mb-2 block">
                  Message Type
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-trigger" className="text-xs mb-2 block">
                  Trigger Event
                </Label>
                <Select value={filterTrigger} onValueChange={setFilterTrigger}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Triggers</SelectItem>
                    <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                    <SelectItem value="appointment_reminder_1day">Reminder (1 day)</SelectItem>
                    <SelectItem value="appointment_reminder_2hrs">Reminder (2 hours)</SelectItem>
                    <SelectItem value="lab_results_ready">Lab Results Ready</SelectItem>
                    <SelectItem value="bill_generated">Bill Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-status" className="text-xs mb-2 block">
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Message Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Template ID</TableHead>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Trigger Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sent Count</TableHead>
                    <TableHead>Delivery Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-mono text-sm text-blue-600">
                          {template.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {template.message.substring(0, 50)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(template.type)}>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(template.type)}
                            <span className="uppercase">{template.type}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {template.trigger.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Send className="w-3 h-3 text-gray-500" />
                          <span className="font-semibold">{template.sentCount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              template.deliveryRate >= 99
                                ? 'bg-green-500'
                                : template.deliveryRate >= 95
                                ? 'bg-blue-500'
                                : 'bg-orange-500'
                            }`}
                          />
                          <span className="font-semibold">{template.deliveryRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() => handleToggleStatus(template.id, template.isActive)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(template.id)}
                            title="Preview"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(template.id)}
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicate(template.id)}
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(template.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {templates.length} of {templates.length} templates
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
