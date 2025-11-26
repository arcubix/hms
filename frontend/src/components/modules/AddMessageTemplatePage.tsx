/**
 * Add Message Template Page
 * 
 * Full page for creating message templates:
 * - Template name and category
 * - Message type selection (SMS/Email/WhatsApp)
 * - Trigger event configuration
 * - Message content with variables
 * - Live preview
 * - Character count and validation
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Smartphone,
  Mail,
  MessageSquare,
  Tag,
  AlertCircle,
  Eye,
  Save,
  Send,
  Calendar,
  Clock,
  User,
  FileText,
  Hospital,
  DollarSign,
  Bell,
  CheckCircle,
  Info,
  Sparkles,
  Copy,
  Zap,
  ArrowLeft,
  Home,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AddMessageTemplatePageProps {
  onBack: () => void;
}

export function AddMessageTemplatePage({ onBack }: AddMessageTemplatePageProps) {
  const [templateName, setTemplateName] = useState('');
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [trigger, setTrigger] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [previewMode, setPreviewMode] = useState<'raw' | 'preview'>('raw');

  // Available variables that can be inserted
  const variables = [
    { var: '{patient_name}', desc: 'Patient full name', icon: User },
    { var: '{doctor_name}', desc: 'Doctor name', icon: User },
    { var: '{date}', desc: 'Appointment date', icon: Calendar },
    { var: '{time}', desc: 'Appointment time', icon: Clock },
    { var: '{hospital_name}', desc: 'Hospital name', icon: Hospital },
    { var: '{department}', desc: 'Department name', icon: FileText },
    { var: '{bill_amount}', desc: 'Bill amount', icon: DollarSign },
    { var: '{appointment_id}', desc: 'Appointment ID', icon: Tag },
    { var: '{patient_id}', desc: 'Patient ID/UHID', icon: Tag },
    { var: '{contact}', desc: 'Patient contact', icon: Smartphone },
    { var: '{doctor_dept}', desc: 'Doctor department', icon: FileText },
    { var: '{room_number}', desc: 'Room/Bed number', icon: Tag }
  ];

  // Available triggers
  const triggers = [
    { value: 'appointment_booked', label: 'Appointment Booked', icon: Calendar },
    { value: 'appointment_reminder_1day', label: 'Appointment Reminder (1 day)', icon: Bell },
    { value: 'appointment_reminder_2hrs', label: 'Appointment Reminder (2 hours)', icon: Clock },
    { value: 'lab_results_ready', label: 'Lab Results Ready', icon: FileText },
    { value: 'prescription_ready', label: 'Prescription Ready', icon: FileText },
    { value: 'bill_generated', label: 'Bill Generated', icon: DollarSign },
    { value: 'discharge_summary', label: 'Discharge Summary', icon: FileText },
    { value: 'follow_up_reminder', label: 'Follow-up Reminder', icon: Calendar },
    { value: 'admission_confirmation', label: 'Admission Confirmation', icon: CheckCircle },
    { value: 'payment_received', label: 'Payment Received', icon: DollarSign },
    { value: 'surgery_scheduled', label: 'Surgery Scheduled', icon: Calendar },
    { value: 'report_collection', label: 'Report Collection', icon: FileText }
  ];

  // Categories
  const categories = [
    { value: 'appointments', label: 'Appointments', color: 'blue' },
    { value: 'billing', label: 'Billing & Payments', color: 'green' },
    { value: 'reports', label: 'Reports & Results', color: 'purple' },
    { value: 'reminders', label: 'Reminders', color: 'orange' },
    { value: 'confirmations', label: 'Confirmations', color: 'teal' },
    { value: 'follow-ups', label: 'Follow-ups', color: 'pink' },
    { value: 'emergency', label: 'Emergency', color: 'red' }
  ];

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = messageContent;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      setMessageContent(before + variable + after);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setMessageContent(messageContent + variable);
    }
    toast.success(`Variable ${variable} inserted`);
  };

  // Character count
  const maxLength = messageType === 'sms' ? 160 : messageType === 'whatsapp' ? 1000 : 5000;
  const charCount = messageContent.length;
  const charPercentage = (charCount / maxLength) * 100;

  // Preview with sample data
  const getPreviewContent = () => {
    return messageContent
      .replace(/{patient_name}/g, 'John Doe')
      .replace(/{doctor_name}/g, 'Dr. Sarah Smith')
      .replace(/{date}/g, '2024-11-25')
      .replace(/{time}/g, '10:30 AM')
      .replace(/{hospital_name}/g, 'City Hospital')
      .replace(/{department}/g, 'Cardiology')
      .replace(/{bill_amount}/g, '$250.00')
      .replace(/{appointment_id}/g, 'APT-2024-1234')
      .replace(/{patient_id}/g, 'UHID-789456')
      .replace(/{contact}/g, '+1-555-0123')
      .replace(/{doctor_dept}/g, 'Cardiology Department')
      .replace(/{room_number}/g, 'Room 305');
  };

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    if (!templateName || !messageType || !trigger || !messageContent) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email requires subject
    if (messageType === 'email' && !subject) {
      toast.error('Email subject is required for email templates');
      return;
    }

    try {
      setSaving(true);
      await api.createMessageTemplate({
        name: templateName,
        type: messageType,
        trigger_event: trigger,
        category: category || undefined,
        content: messageContent,
        subject: messageType === 'email' ? subject : undefined,
        is_active: isActive
      });
      
      toast.success('Message template created successfully!');
      onBack();
    } catch (error: any) {
      toast.error('Failed to create template: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleTestMessage = async () => {
    if (!messageContent) {
      toast.error('Please enter message content first');
      return;
    }

    // For test, we need a recipient - prompt user or use a default
    const testRecipient = prompt('Enter recipient phone/email for test message:');
    if (!testRecipient) {
      return;
    }

    try {
      setTesting(true);
      // First create the template temporarily, then send test
      // Or we can send test without saving - for now, just show a message
      toast.info('Test message functionality will be available after template is saved');
    } catch (error: any) {
      toast.error('Failed to send test message: ' + (error.message || 'Unknown error'));
    } finally {
      setTesting(false);
    }
  };

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
                Back to Messages
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Create Message Template
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Design automated message templates for SMS, Email, and WhatsApp notifications
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTestMessage} disabled={testing || saving}>
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving || testing}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT COLUMN - Template Configuration */}
          <div className="col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Name */}
                <div>
                  <Label htmlFor="template-name" className="flex items-center gap-2">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Appointment Confirmation SMS"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Message Type */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    Message Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setMessageType('sms')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        messageType === 'sms'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            messageType === 'sms' ? 'bg-green-100' : 'bg-gray-100'
                          }`}
                        >
                          <Smartphone
                            className={`w-6 h-6 ${
                              messageType === 'sms' ? 'text-green-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <span className="font-medium text-sm">SMS</span>
                        <span className="text-xs text-gray-500">160 chars</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setMessageType('email')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        messageType === 'email'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            messageType === 'email' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                        >
                          <Mail
                            className={`w-6 h-6 ${
                              messageType === 'email' ? 'text-blue-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <span className="font-medium text-sm">Email</span>
                        <span className="text-xs text-gray-500">Rich content</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setMessageType('whatsapp')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        messageType === 'whatsapp'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            messageType === 'whatsapp' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}
                        >
                          <MessageSquare
                            className={`w-6 h-6 ${
                              messageType === 'whatsapp' ? 'text-purple-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <span className="font-medium text-sm">WhatsApp</span>
                        <span className="text-xs text-gray-500">1000 chars</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Trigger Event */}
                  <div>
                    <Label htmlFor="trigger" className="flex items-center gap-2">
                      Trigger Event <span className="text-red-500">*</span>
                    </Label>
                    <Select value={trigger} onValueChange={setTrigger}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select trigger event" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggers.map((t) => {
                          const Icon = t.icon;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-gray-500" />
                                {t.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <Badge
                              variant="outline"
                              className={`bg-${cat.color}-50 text-${cat.color}-700 border-${cat.color}-200`}
                            >
                              {cat.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Email Subject (only for email) */}
                {messageType === 'email' && (
                  <div>
                    <Label htmlFor="subject" className="flex items-center gap-2">
                      Email Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Your Appointment Confirmation"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <div>
                      <Label htmlFor="active-status" className="font-medium">
                        Active Template
                      </Label>
                      <p className="text-xs text-gray-600">
                        Enable this template to send automatically
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="active-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Message Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Message Content
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={previewMode === 'raw' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('raw')}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === 'preview' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('preview')}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewMode === 'raw' ? (
                  <>
                    <div>
                      <Label htmlFor="message-content" className="flex items-center gap-2">
                        Message Text <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message-content"
                        placeholder="Enter your message content here. Use variables like {patient_name} to personalize messages..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="mt-2 min-h-[300px] font-mono text-sm resize-y"
                        maxLength={maxLength}
                        rows={12}
                      />
                    </div>

                    {/* Character Count */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Character Count</span>
                        <span
                          className={`font-semibold ${
                            charPercentage > 90
                              ? 'text-red-600'
                              : charPercentage > 70
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {charCount} / {maxLength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            charPercentage > 90
                              ? 'bg-red-500'
                              : charPercentage > 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(charPercentage, 100)}%` }}
                        />
                      </div>
                      {messageType === 'sms' && charCount > 160 && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                          <AlertCircle className="w-3 h-3" />
                          This message will be sent as {Math.ceil(charCount / 160)} SMS parts
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Preview Header */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        This is how your message will appear to recipients (using sample data)
                      </p>
                    </div>

                    {/* Message Preview */}
                    {messageType === 'sms' && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Smartphone className="w-4 h-4 text-green-600" />
                          <p className="font-semibold text-sm">SMS Preview</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border shadow-sm">
                          <p className="text-xs text-gray-500 mb-2">From: HOSPITAL</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {getPreviewContent() || 'Your message preview will appear here...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {messageType === 'email' && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <p className="font-semibold text-sm">Email Preview</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">
                            Subject: {subject || 'No subject'}
                          </p>
                          <Separator className="my-3" />
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {getPreviewContent() || 'Your message preview will appear here...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {messageType === 'whatsapp' && (
                      <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                          <p className="font-semibold text-sm">WhatsApp Preview</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Hospital className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">City Hospital</p>
                              <p className="text-xs text-gray-500">Online</p>
                            </div>
                          </div>
                          <div className="bg-white border rounded-lg rounded-tl-none p-3 shadow-sm">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {getPreviewContent() || 'Your message preview will appear here...'}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 text-right">12:53 PM</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Variables & Quick Actions */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Available Variables
                </CardTitle>
                <CardDescription className="text-xs">
                  Click to insert into message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 pr-4">
                    {variables.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.var}
                          onClick={() => insertVariable(item.var)}
                          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-mono text-xs text-blue-600 mb-1 group-hover:font-semibold">
                                {item.var}
                              </p>
                              <p className="text-xs text-gray-600">{item.desc}</p>
                            </div>
                            <Copy className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Quick Tips</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Use variables to personalize messages</li>
                      <li>• Keep SMS under 160 characters</li>
                      <li>• Test before activating</li>
                      <li>• Use clear, professional language</li>
                      <li>• Preview on all platforms</li>
                      <li>• Check character limits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
