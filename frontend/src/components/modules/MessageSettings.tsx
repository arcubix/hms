/**
 * Message Settings Component
 * Configure automated message templates for SMS, Email, and WhatsApp
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import {
  Plus,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Hospital,
  Edit,
  Eye,
  Copy,
  Send,
  Trash2,
  Tag,
  Bell,
  Calendar,
  Clock,
  AlertCircle,
  FlaskConical,
  Pill,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Filter,
  Loader2,
  Save,
  EyeOff,
  Eye as EyeIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { api, MessageTemplate, MessagePlatform, MessageStatistics } from '../../services/api';
import { MessageRecipientsConfig } from './MessageRecipientsConfig';
import { AddMessageTemplatePage } from './AddMessageTemplatePage';
import { MessageTemplatesList } from './MessageTemplatesList';

export function MessageSettings() {
  const [showAddTemplatePage, setShowAddTemplatePage] = useState(false);
  const [showTemplatesListPage, setShowTemplatesListPage] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [platforms, setPlatforms] = useState<MessagePlatform[]>([]);
  const [statistics, setStatistics] = useState<MessageStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformLoading, setPlatformLoading] = useState<{ [key: string]: boolean }>({});
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configPlatform, setConfigPlatform] = useState<'sms' | 'email' | 'whatsapp' | null>(null);
  const [configFormData, setConfigFormData] = useState({
    provider_name: '',
    api_key: '',
    api_secret: '',
    api_url: 'https://fastsmsalerts.com/api/composesms',
    sender_id: '',
    sender_email: '',
    is_enabled: true,
    lang: 'english',
    response_type: 'json'
  });
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testTemplate, setTestTemplate] = useState<MessageTemplate | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, platformsData, statsData] = await Promise.all([
        api.getMessageTemplates({ status: 'active' }),
        api.getMessagePlatforms(),
        api.getMessageStatistics('weekly')
      ]);
      
      setTemplates(templatesData);
      setPlatforms(platformsData);
      setStatistics(statsData);
    } catch (error: any) {
      toast.error('Failed to load message settings: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = async (platformType: 'sms' | 'email' | 'whatsapp', enabled: boolean) => {
    try {
      setPlatformLoading({ ...platformLoading, [platformType]: true });
      const platform = platforms.find(p => p.platform === platformType);
      if (platform) {
        await api.updateMessagePlatform(platformType, { is_enabled: enabled });
        await loadData(); // Reload to get updated data
        toast.success(`${platformType.toUpperCase()} platform ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error: any) {
      toast.error('Failed to update platform settings: ' + (error.message || 'Unknown error'));
    } finally {
      setPlatformLoading({ ...platformLoading, [platformType]: false });
    }
  };

  const getPlatformStats = (type: 'sms' | 'email' | 'whatsapp') => {
    if (!statistics) return { active_templates: 0, sent_today: 0 };
    return statistics[type] || { active_templates: 0, sent_today: 0 };
  };

  const getPlatform = (type: 'sms' | 'email' | 'whatsapp') => {
    return platforms.find(p => p.platform === type);
  };

  const handleTestMessage = (template: MessageTemplate) => {
    setTestTemplate(template);
    setTestPhoneNumber('');
    setTestDialogOpen(true);
  };

  const handleSendTest = async () => {
    if (!testTemplate) return;

    // Validate phone number
    if (!testPhoneNumber || testPhoneNumber.trim() === '') {
      toast.error('Please enter a phone number');
      return;
    }

    // Basic phone number validation (should start with country code)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(testPhoneNumber.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    try {
      setSendingTest(true);
      const phone = testPhoneNumber.replace(/[^0-9]/g, ''); // Remove non-digits
      await api.sendTestMessage(testTemplate.id, phone);
      toast.success('Test message sent successfully!');
      setTestDialogOpen(false);
      setTestPhoneNumber('');
      await loadData(); // Reload to update statistics
    } catch (error: any) {
      toast.error('Failed to send test message: ' + (error.message || 'Unknown error'));
    } finally {
      setSendingTest(false);
    }
  };

  const handleConfigure = (type: 'sms' | 'email' | 'whatsapp') => {
    const platform = getPlatform(type);
    setConfigPlatform(type);
    
    if (platform) {
      const settings = platform.settings || {};
      setConfigFormData({
        provider_name: platform.provider_name || '',
        api_key: platform.api_key || '',
        api_secret: platform.api_secret === '***hidden***' ? '' : (platform.api_secret || ''),
        api_url: platform.api_url || 'https://fastsmsalerts.com/api/composesms',
        sender_id: platform.sender_id || '',
        sender_email: platform.sender_email || '',
        is_enabled: platform.is_enabled,
        lang: settings.lang || 'english',
        response_type: settings.type || 'json'
      });
    } else {
      setConfigFormData({
        provider_name: '',
        api_key: '',
        api_secret: '',
        api_url: 'https://fastsmsalerts.com/api/composesms',
        sender_id: '',
        sender_email: '',
        is_enabled: true,
        lang: 'english',
        response_type: 'json'
      });
    }
    
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!configPlatform) return;

    try {
      setSavingConfig(true);
      
      // Prepare settings object for JSON storage
      const settings: any = {};
      if (configPlatform === 'sms') {
        settings.lang = configFormData.lang;
        settings.type = configFormData.response_type;
      }
      
      await api.updateMessagePlatform(configPlatform, {
        provider_name: configFormData.provider_name,
        api_key: configFormData.api_key,
        api_secret: configFormData.api_secret,
        api_url: configFormData.api_url,
        sender_id: configFormData.sender_id,
        sender_email: configFormData.sender_email,
        is_enabled: configFormData.is_enabled,
        settings: settings
      });
      
      toast.success(`${configPlatform.toUpperCase()} platform configuration saved successfully!`);
      setConfigDialogOpen(false);
      await loadData(); // Reload to get updated data
    } catch (error: any) {
      toast.error('Failed to save configuration: ' + (error.message || 'Unknown error'));
    } finally {
      setSavingConfig(false);
    }
  };

  if (showAddTemplatePage) {
    return <AddMessageTemplatePage onBack={() => {
      setShowAddTemplatePage(false);
      loadData(); // Reload templates after adding
    }} />;
  }

  if (showTemplatesListPage) {
    return (
      <MessageTemplatesList
        onBack={() => {
          setShowTemplatesListPage(false);
          loadData(); // Reload templates when returning
        }}
        onAddTemplate={() => {
          setShowTemplatesListPage(false);
          setShowAddTemplatePage(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Message Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure automated message templates for SMS, Email, and WhatsApp</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddTemplatePage(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Platform Configuration Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['sms', 'email', 'whatsapp'] as const).map((type) => {
            const platform = getPlatform(type);
            const stats = getPlatformStats(type);
            const isLoading = platformLoading[type];
            const isEnabled = platform?.is_enabled ?? true;
            
            const config = {
              sms: { icon: Smartphone, color: 'green', label: 'SMS Messages' },
              email: { icon: Mail, color: 'blue', label: 'Email Messages' },
              whatsapp: { icon: MessageSquare, color: 'purple', label: 'WhatsApp' }
            }[type];
            
            const Icon = config.icon;
            
            return (
              <Card key={type} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${config.color}-600`} />
                    </div>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                      <Switch 
                        checked={isEnabled} 
                        onCheckedChange={(checked) => handlePlatformToggle(type, checked)}
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{config.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">Send automated {type} notifications</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Templates:</span>
                      <span className="font-semibold">{stats.active_templates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent Today:</span>
                      <span className={`font-semibold text-${config.color}-600`}>{stats.sent_today}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => handleConfigure(type)}
                  >
                    <Settings className="w-3 h-3 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Message Templates with Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Message Templates</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-3 h-3 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No active templates found. Click "Add Template" to create one.</p>
                </div>
              ) : (
                templates.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          msg.type === 'sms' ? 'bg-green-100' :
                          msg.type === 'email' ? 'bg-blue-100' :
                          'bg-purple-100'
                        }`}>
                          {msg.type === 'sms' && <Smartphone className="w-5 h-5 text-green-600" />}
                          {msg.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                          {msg.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{msg.name}</h4>
                          <p className="text-xs text-gray-600">Trigger: {msg.trigger_event}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={msg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {msg.status}
                        </Badge>
                        <Badge variant="outline" className={
                          msg.type === 'sms' ? 'bg-green-50 text-green-700' :
                          msg.type === 'email' ? 'bg-blue-50 text-blue-700' :
                          'bg-purple-50 text-purple-700'
                        }>
                          {msg.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{msg.content}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTestMessage(msg)}
                        disabled={msg.type !== 'sms'}
                        title={msg.type !== 'sms' ? 'Test sending only available for SMS templates' : 'Send test message'}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 ml-auto">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">WhatsApp Preview</CardTitle>
              <CardDescription>See how your message will appear</CardDescription>
            </CardHeader>
            <CardContent>
              {/* WhatsApp-style Preview */}
              <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="bg-white rounded-lg p-3 shadow-sm mb-2">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Hospital className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">City Hospital</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Incoming message */}
                    <div className="bg-white border rounded-lg rounded-tl-none p-3 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Hello {'{patient_name}'}, this is a reminder for your appointment tomorrow at {'{time}'} with {'{doctor_name}'}.
                      </p>
                      <p className="text-xs text-gray-400 mt-2 text-right">12:53 PM</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <p className="text-xs text-gray-600">🔒 End-to-end encrypted</p>
                </div>
              </div>

              {/* SMS Preview */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-sm">SMS Preview</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-500 mb-2">From: HOSPITAL</p>
                  <p className="text-sm text-gray-700">
                    Dear {'{patient_name}'}, your appointment with {'{doctor_name}'} is confirmed for {'{date}'} at {'{time}'}. Thank you!
                  </p>
                </div>
              </div>

              {/* Email Preview */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-sm">Email Preview</p>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-500 mb-1">Subject: Lab Results Ready</p>
                  <Separator className="my-2" />
                  <p className="text-sm text-gray-700">
                    Dear {'{patient_name}'}, your lab results are ready. Please visit the hospital to collect your reports.
                  </p>
                </div>
              </div>

              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Send Test Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variables and Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Available Variables
            </CardTitle>
            <CardDescription>Use these variables in your message templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { var: '{patient_name}', desc: 'Patient full name' },
                { var: '{doctor_name}', desc: 'Doctor name' },
                { var: '{date}', desc: 'Appointment date' },
                { var: '{time}', desc: 'Appointment time' },
                { var: '{hospital_name}', desc: 'Hospital name' },
                { var: '{department}', desc: 'Department name' },
                { var: '{bill_amount}', desc: 'Bill amount' },
                { var: '{appointment_id}', desc: 'Appointment ID' },
                { var: '{patient_id}', desc: 'Patient ID/UHID' },
                { var: '{contact}', desc: 'Patient contact' },
                { var: '{doctor_dept}', desc: 'Doctor department' },
                { var: '{room_number}', desc: 'Room/Bed number' }
              ].map((item) => (
                <div key={item.var} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                  <p className="font-mono text-xs text-blue-600 mb-1">{item.var}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-600" />
                  Message Triggers
                </CardTitle>
                <CardDescription>Automated message triggers</CardDescription>
              </div>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setShowTemplatesListPage(true)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View All Templates
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Appointment Booked', trigger: 'appointment_booked', icon: Calendar },
                { name: 'Appointment Reminder (1 day)', trigger: 'appointment_reminder_1day', icon: Clock },
                { name: 'Appointment Reminder (2 hours)', trigger: 'appointment_reminder_2hrs', icon: AlertCircle },
                { name: 'Lab Results Ready', trigger: 'lab_results_ready', icon: FlaskConical },
                { name: 'Prescription Ready', trigger: 'prescription_ready', icon: Pill },
                { name: 'Bill Generated', trigger: 'bill_generated', icon: DollarSign },
                { name: 'Discharge Summary', trigger: 'discharge_summary', icon: FileText },
                { name: 'Follow-up Reminder', trigger: 'follow_up_reminder', icon: Calendar }
              ].map((trigger) => {
                const Icon = trigger.icon;
                const count = templates.filter(t => t.trigger_event === trigger.trigger).length;
                return (
                  <div key={trigger.trigger} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{trigger.name}</span>
                    </div>
                    <Badge variant="outline">{count} template{count !== 1 ? 's' : ''}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-600" />
            Messaging Statistics (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : statistics ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{statistics.sms.sent_period.toLocaleString()}</p>
                <p className="text-sm text-gray-600">SMS Sent</p>
                <p className="text-xs text-green-600 mt-1">{statistics.sms.delivery_rate}% delivery rate</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{statistics.email.sent_period.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Emails Sent</p>
                <p className="text-xs text-blue-600 mt-1">{statistics.email.delivery_rate}% delivery rate</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">{statistics.whatsapp.sent_period.toLocaleString()}</p>
                <p className="text-sm text-gray-600">WhatsApp Sent</p>
                <p className="text-xs text-purple-600 mt-1">{statistics.whatsapp.delivery_rate}% delivery rate</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                  <Badge className="bg-orange-100 text-orange-800">{statistics.overall.delivery_rate}%</Badge>
                </div>
                <p className="text-2xl font-bold text-orange-900">{statistics.overall.total_sent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-xs text-orange-600 mt-1">{statistics.overall.total_delivered.toLocaleString()} delivered</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No statistics available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Recipients Configuration */}
      <MessageRecipientsConfig />

      {/* Platform Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configure {configPlatform?.toUpperCase()} Platform
            </DialogTitle>
            <DialogDescription>
              Enter your {configPlatform} provider credentials and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Provider Name */}
            <div>
              <Label htmlFor="provider-name">
                Provider Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="provider-name"
                placeholder="e.g., Twilio, SendGrid, WhatsApp Business API"
                value={configFormData.provider_name}
                onChange={(e) => setConfigFormData({ ...configFormData, provider_name: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* API Key / ID */}
            <div>
              <Label htmlFor="api-key">
                {configPlatform === 'sms' ? 'ID / Username' : 'API Key / Username'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="api-key"
                type="text"
                placeholder={configPlatform === 'sms' ? 'e.g., nbp (API ID parameter)' : 'Enter your API key or username'}
                value={configFormData.api_key}
                onChange={(e) => setConfigFormData({ ...configFormData, api_key: e.target.value })}
                className="mt-2"
              />
              {configPlatform === 'sms' && (
                <p className="text-xs text-gray-500 mt-1">
                  This is the "id" parameter in the FastSMS API
                </p>
              )}
            </div>

            {/* API Secret / Password */}
            <div>
              <Label htmlFor="api-secret">
                {configPlatform === 'sms' ? 'Password' : 'API Secret / Password'} <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Input
                  id="api-secret"
                  type={showApiSecret ? 'text' : 'password'}
                  placeholder={configPlatform === 'sms' ? 'e.g., nbp128112 (API pass parameter)' : 'Enter your API secret or password'}
                  value={configFormData.api_secret}
                  onChange={(e) => setConfigFormData({ ...configFormData, api_secret: e.target.value })}
                  className="pr-10"
                />
                {configPlatform === 'sms' && (
                  <p className="text-xs text-gray-500 mt-1">
                    This is the "pass" parameter in the FastSMS API
                  </p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                >
                  {showApiSecret ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* API URL */}
            <div>
              <Label htmlFor="api-url">
                API URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="api-url"
                type="url"
                placeholder="https://fastsmsalerts.com/api/composesms"
                value={configFormData.api_url}
                onChange={(e) => setConfigFormData({ ...configFormData, api_url: e.target.value })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Full API endpoint URL for sending messages
              </p>
            </div>

            {/* SMS Specific Settings */}
            {configPlatform === 'sms' && (
              <>
                <div>
                  <Label htmlFor="lang">Language</Label>
                  <Select
                    value={configFormData.lang}
                    onValueChange={(value) => setConfigFormData({ ...configFormData, lang: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="urdu">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="response-type">Response Type</Label>
                  <Select
                    value={configFormData.response_type}
                    onValueChange={(value) => setConfigFormData({ ...configFormData, response_type: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select response type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Mask / Sender ID (for SMS) */}
            {configPlatform === 'sms' && (
              <div>
                <Label htmlFor="sender-id">
                  Mask / Sender ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sender-id"
                  type="text"
                  placeholder="e.g., 9995"
                  value={configFormData.sender_id}
                  onChange={(e) => setConfigFormData({ ...configFormData, sender_id: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the "mask" parameter in FastSMS API. The sender ID that appears on recipient's phone (e.g., 9995)
                </p>
              </div>
            )}

            {/* Phone Number (for WhatsApp) */}
            {configPlatform === 'whatsapp' && (
              <div>
                <Label htmlFor="sender-id">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sender-id"
                  type="text"
                  placeholder="e.g., +1234567890"
                  value={configFormData.sender_id}
                  onChange={(e) => setConfigFormData({ ...configFormData, sender_id: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Business phone number for WhatsApp
                </p>
              </div>
            )}

            {/* Sender Email (for Email) */}
            {configPlatform === 'email' && (
              <div>
                <Label htmlFor="sender-email">
                  Sender Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sender-email"
                  type="email"
                  placeholder="noreply@hospital.com"
                  value={configFormData.sender_email}
                  onChange={(e) => setConfigFormData({ ...configFormData, sender_email: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address that will appear as the sender
                </p>
              </div>
            )}

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="platform-enabled" className="text-base font-medium">
                  Enable {configPlatform?.toUpperCase()} Platform
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Turn on/off message sending for this platform
                </p>
              </div>
              <Switch
                id="platform-enabled"
                checked={configFormData.is_enabled}
                onCheckedChange={(checked) => setConfigFormData({ ...configFormData, is_enabled: checked })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setConfigDialogOpen(false)}
                disabled={savingConfig}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveConfig}
                disabled={
                  savingConfig || 
                  !configFormData.provider_name || 
                  !configFormData.api_key || 
                  !configFormData.api_secret ||
                  (configPlatform === 'sms' && !configFormData.sender_id) ||
                  (configPlatform === 'whatsapp' && !configFormData.sender_id) ||
                  (configPlatform === 'email' && !configFormData.sender_email)
                }
              >
                {savingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
          </Dialog>

      {/* Test Message Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-md w-[90%] sm:w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Test Message
            </DialogTitle>
            <DialogDescription>
              Enter a phone number to send a test SMS using this template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {testTemplate && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium mb-1">Template: {testTemplate.name}</p>
                  <p className="text-xs text-gray-600">Type: {testTemplate.type.toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{testTemplate.content}</p>
                </div>

                <div>
                  <Label htmlFor="test-phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="test-phone"
                    type="tel"
                    placeholder="e.g., 923214797230 (with country code, no +)"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="mt-2"
                    disabled={sendingTest}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter phone number with country code (e.g., 923214797230 for Pakistan)
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTestDialogOpen(false);
                      setTestPhoneNumber('');
                    }}
                    disabled={sendingTest}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSendTest}
                    disabled={sendingTest || !testPhoneNumber.trim()}
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test SMS
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

