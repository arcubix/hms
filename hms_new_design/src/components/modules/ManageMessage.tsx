import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  MessageSquare, 
  Search, 
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  ArrowLeft,
  X,
  History,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';

interface Message {
  id: string;
  date: string;
  message: string;
  sentTo: string;
  count: number;
  status: string;
}

interface SMSPackage {
  quantity: number;
  pricePerSms: number;
  totalCost: number;
}

interface PurchaseRequest {
  id: string;
  date: string;
  packageType: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  requestedBy: string;
  status: 'added' | 'pending' | 'processed' | 'rejected';
  processedDate?: string;
  transactionId?: string;
}

export function ManageMessage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('2011-2025 - 2011-2025');
  const [fromDate, setFromDate] = useState('2025-01-01');
  const [toDate, setToDate] = useState('2025-12-31');
  const [currentView, setCurrentView] = useState<'list' | 'compose'>('list');
  const [isSMSPackageOpen, setIsSMSPackageOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('1000');
  const [messageContent, setMessageContent] = useState('');
  const [recipientType, setRecipientType] = useState('single');
  const [messageType, setMessageType] = useState('sms');

  // SMS Packages data matching the screenshot
  const smsPackages: SMSPackage[] = [
    { quantity: 1000, pricePerSms: 4.15, totalCost: 4150 },
    { quantity: 2000, pricePerSms: 4.15, totalCost: 8300 },
    { quantity: 3000, pricePerSms: 4.15, totalCost: 12450 },
    { quantity: 4000, pricePerSms: 4.00, totalCost: 16000 },
    { quantity: 5000, pricePerSms: 4.00, totalCost: 20000 },
    { quantity: 6000, pricePerSms: 4.00, totalCost: 24000 },
    { quantity: 7000, pricePerSms: 4.00, totalCost: 28000 },
    { quantity: 8000, pricePerSms: 4.00, totalCost: 32000 },
    { quantity: 9000, pricePerSms: 3.95, totalCost: 35550 },
    { quantity: 10000, pricePerSms: 3.95, totalCost: 39500 },
    { quantity: 20000, pricePerSms: 3.90, totalCost: 78000 },
    { quantity: 40000, pricePerSms: 3.85, totalCost: 154000 },
    { quantity: 50000, pricePerSms: 3.80, totalCost: 190000 },
  ];

  // Mock data for messages
  const mockMessages: Message[] = [
    {
      id: '1',
      date: 'November 20, 2025, at 4:30 PM',
      message: 'Dear Fatima Fatima, Your total bill was for Rs. 2500, you paid Rs. 2500.0. Thank you for choosing Aaas Medical Complex',
      sentTo: 'Fatima Fatima',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '2',
      date: 'November 20, 2025, at 4:54 PM',
      message: 'Dear Yasir Iqbal, Your total bill was for Rs. 900, you paid Rs. 500.0. Thank you for choosing Aaas Medical Complex',
      sentTo: 'Yasir Iqbal',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '3',
      date: 'November 20, 2025, at 4:58 PM',
      message: 'Dear Amir, Your total bill was for Rs. 800, you paid Rs. 600.0. Thank you for choosing Aaas Medical Complex',
      sentTo: 'Amir',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '4',
      date: 'November 20, 2025, at 4:00 PM',
      message: 'Dear Yasir Iqbal, Your total bill was for Rs. 500, you paid Rs. 500.0. Thank you for choosing Aaas Medical Complex',
      sentTo: 'Yasir Iqbal',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '5',
      date: 'November 20, 2025, at 4:06 PM',
      message: 'Azad Medical Complex, Dear Khalida, your lab report is ready. Visit to collect or download it at hcloud.pk/lig=pGP9c-7rA7B58z6H42. Thank you',
      sentTo: 'Khalida',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '6',
      date: 'November 20, 2025, at 4:02 PM',
      message: 'Dear Dr asim raza, Total bill for your referral was Rs 1800, the Khushi paid Rs 1800.0. Your referral amount was Rs 0 Thank you for choosing Aaas Medical Complex',
      sentTo: 'Dr asim raza',
      count: 2,
      status: 'Message Sent to Telecom'
    },
    {
      id: '7',
      date: 'November 20, 2025, at 4:01 PM',
      message: 'Dear Khalida, Your total bill was for Rs. 1800, you paid Rs. 1800.0. Thank you for choosing Aaas Medical Complex',
      sentTo: 'Khalida',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '8',
      date: 'November 20, 2025, at 3:46 PM',
      message: 'Azad Medical Complex, Dear Khalida, your lab report is ready. Visit to collect or download it at hcloud.pk/lig=pGP9c-7rA7B58z6CE0E. Thank you',
      sentTo: 'Khalida',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '9',
      date: 'November 20, 2025, at 3:38 PM',
      message: 'Azad Medical Complex, Dear Khalida, your lab report is ready. Visit to collect or download it at hcloud.pk/lig=pGP9c-7rA7B58z6CE0E. Thank you',
      sentTo: 'Khalida',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '10',
      date: 'November 20, 2025, at 3:38 PM',
      message: 'Azad Medical Complex, Dear nirma, your lab report is ready. Visit to collect or download it at hcloud.pk/lig=pGP9c-7rA7B58z44A3. Thank you',
      sentTo: 'nirma',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '11',
      date: 'November 20, 2025, at 2:29 PM',
      message: 'Dear dr iram zaib, Total bill for your referral was Rs 1950, the nirma paid Rs 1915.0. Your referral amount was Rs 0 Thank you for choosing Aaas Medical Complex',
      sentTo: 'dr iram zaib',
      count: 2,
      status: 'Invalid Destination Number. Please Check Pations Contact 923xxxxxxxxx'
    },
    {
      id: '12',
      date: 'November 20, 2025, at 2:28 PM',
      message: 'Dear nirma, Your total bill was for Rs. 1800, you paid Rs. 1800.0. Thank you for choosing Aaas Medical Complex',
      sentTo: 'nirma',
      count: 1,
      status: 'Message Sent to Telecom'
    },
    {
      id: '13',
      date: 'November 20, 2025, at 1:28 PM',
      message: 'Azad Medical Complex, Dear Urwa, your lab report is ready. Visit to collect or download it at hcloud.pk/lig=pGP9c-7rA7kt43tB0Q2. Thank you',
      sentTo: 'Urwa',
      count: 1,
      status: 'Message Sent to Telecom'
    }
  ];

  // Mock data for purchase requests
  const mockPurchaseRequests: PurchaseRequest[] = [
    {
      id: 'PR001',
      date: 'November 18, 2025, at 10:30 AM',
      packageType: 'SMS Package',
      quantity: 10000,
      amount: 39500,
      paymentMethod: 'Bank Transfer',
      requestedBy: 'Dr. Sarah Wilson',
      status: 'processed',
      processedDate: 'November 18, 2025, at 2:15 PM',
      transactionId: 'TXN-2025-001234'
    },
    {
      id: 'PR002',
      date: 'November 19, 2025, at 3:45 PM',
      packageType: 'SMS Package',
      quantity: 5000,
      amount: 20000,
      paymentMethod: 'Credit Card',
      requestedBy: 'Admin User',
      status: 'pending',
    },
    {
      id: 'PR003',
      date: 'November 20, 2025, at 9:15 AM',
      packageType: 'SMS Package',
      quantity: 3000,
      amount: 12450,
      paymentMethod: 'Cash',
      requestedBy: 'Finance Manager',
      status: 'added',
    },
    {
      id: 'PR004',
      date: 'November 17, 2025, at 11:20 AM',
      packageType: 'SMS Package',
      quantity: 20000,
      amount: 78000,
      paymentMethod: 'Bank Transfer',
      requestedBy: 'Dr. Sarah Wilson',
      status: 'processed',
      processedDate: 'November 17, 2025, at 4:30 PM',
      transactionId: 'TXN-2025-001189'
    },
    {
      id: 'PR005',
      date: 'November 16, 2025, at 2:00 PM',
      packageType: 'SMS Package',
      quantity: 1000,
      amount: 4150,
      paymentMethod: 'Online Payment',
      requestedBy: 'IT Department',
      status: 'rejected',
    },
    {
      id: 'PR006',
      date: 'November 15, 2025, at 4:50 PM',
      packageType: 'SMS Package',
      quantity: 8000,
      amount: 32000,
      paymentMethod: 'Bank Transfer',
      requestedBy: 'Admin User',
      status: 'processed',
      processedDate: 'November 16, 2025, at 10:00 AM',
      transactionId: 'TXN-2025-001150'
    },
  ];

  const filteredMessages = mockMessages.filter(msg => 
    msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sentTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    if (status.includes('Sent')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (status.includes('Invalid')) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <Clock className="w-4 h-4 text-yellow-600" />;
  };

  const handleAddSMS = () => {
    setIsSMSPackageOpen(false);
    // Handle SMS package purchase logic here
  };

  // Compose Message Page
  const renderComposePage = () => (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentView('list')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Messages
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Compose New Message</h1>
          <p className="text-sm text-gray-600 mt-1">Create and send SMS or WhatsApp message</p>
        </div>
      </div>

      {/* Compose Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <Label>Message Type *</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="both">Both SMS & WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Recipient Type *</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Recipient</SelectItem>
                  <SelectItem value="multiple">Multiple Recipients</SelectItem>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="appointment">Today's Appointments</SelectItem>
                  <SelectItem value="opd">All OPD Patients</SelectItem>
                  <SelectItem value="ipd">All IPD Patients</SelectItem>
                  <SelectItem value="doctors">All Doctors</SelectItem>
                  <SelectItem value="staff">All Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === 'single' && (
              <div>
                <Label>Recipient Name/Phone *</Label>
                <Input 
                  placeholder="Enter name or phone number" 
                  className="mt-2"
                />
              </div>
            )}

            {recipientType === 'multiple' && (
              <div>
                <Label>Recipients *</Label>
                <Textarea 
                  placeholder="Enter phone numbers (one per line or comma separated)&#10;e.g., 03001234567, 03119876543" 
                  className="mt-2 min-h-[100px]"
                />
              </div>
            )}

            <div>
              <Label>Send Schedule</Label>
              <Select defaultValue="now">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send Now</SelectItem>
                  <SelectItem value="scheduled">Schedule for Later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Message Template (Optional)</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing Receipt</SelectItem>
                  <SelectItem value="appointment">Appointment Reminder</SelectItem>
                  <SelectItem value="lab">Lab Report Ready</SelectItem>
                  <SelectItem value="prescription">Prescription Ready</SelectItem>
                  <SelectItem value="followup">Follow-up Reminder</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <Label>Message Content *</Label>
              <Textarea 
                placeholder="Type your message here...&#10;&#10;You can use placeholders:&#10;{name} - Patient name&#10;{amount} - Bill amount&#10;{date} - Appointment date" 
                className="mt-2 min-h-[300px]"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Characters: {messageContent.length}/160 • SMS Count: {Math.ceil(messageContent.length / 160) || 1}
                </p>
                <p className="text-xs text-gray-600">
                  Available SMS: <span className="font-semibold text-green-600">196</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium text-sm mb-3">Preview</h3>
              <div className="bg-white rounded p-3 text-sm min-h-[100px]">
                {messageContent || 'Your message will appear here...'}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-sm text-blue-900 mb-2">Important Notes:</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Ensure phone numbers are in correct format (03XXXXXXXXX)</li>
                <li>• Message delivery depends on network availability</li>
                <li>• Each SMS is 160 characters, longer messages use multiple SMS</li>
                <li>• Check recipient count before sending to avoid errors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setMessageContent('')}>
              Clear Message
            </Button>
            <Button variant="outline">
              Save as Draft
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCurrentView('list')}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-2">
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Message List Page
  const renderListPage = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Messages</h1>
          <p className="text-sm text-gray-600 mt-1">Send and track SMS/WhatsApp messages</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsSMSPackageOpen(true)}
        >
          <Package className="w-4 h-4 mr-2" />
          Buy SMS Package
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Messages</p>
              <p className="text-4xl font-semibold text-green-600 mt-2">196</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Free Messages</p>
              <p className="text-4xl font-semibold text-green-600 mt-2">196</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Messages</p>
              <p className="text-4xl font-semibold text-green-600 mt-2">0</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Messages and History */}
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-white border">
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Purchase History
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6 mt-6">
          {/* Action Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setCurrentView('compose')}
              >
                <Mail className="w-4 h-4" />
                Compose
              </Button>

              <Button variant="outline" className="gap-2">
                <Send className="w-4 h-4" />
                Send
              </Button>

              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                SMS/WhatsApp Conversations Addition
              </Button>

              <div className="flex-1" />

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Input 
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600">From:</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600">To:</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-40"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="billing">Billing Messages</SelectItem>
                  <SelectItem value="lab">Lab Reports</SelectItem>
                  <SelectItem value="appointment">Appointment Reminders</SelectItem>
                  <SelectItem value="referral">Referral Messages</SelectItem>
                  <SelectItem value="custom">Custom Messages</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing messages from <span className="font-semibold text-gray-900">{fromDate}</span> to <span className="font-semibold text-gray-900">{toDate}</span>
              </p>
              <p className="text-sm text-gray-600">
                Messages Count: <span className="font-semibold text-gray-900">{filteredMessages.length}</span>
              </p>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">DATE</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">MESSAGE</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">SENT TO</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">COUNT</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {message.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xl truncate">
                          {message.message}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {message.sentTo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Badge variant="outline">{message.count}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <span className={`text-xs ${
                            message.status.includes('Sent') 
                              ? 'text-green-700' 
                              : message.status.includes('Invalid')
                              ? 'text-red-700'
                              : 'text-yellow-700'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Purchase History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">SMS Package Purchase History</h3>
                <p className="text-sm text-gray-600 mt-1">Track all SMS package purchases and their status</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export History
              </Button>
            </div>
          </div>

          {/* Purchase History Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">REQUEST ID</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">DATE</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">PACKAGE TYPE</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">QUANTITY</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">AMOUNT (Rs.)</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">PAYMENT</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">REQUESTED BY</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">STATUS</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">TRANSACTION ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockPurchaseRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {request.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          {request.packageType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Badge variant="outline" className="bg-blue-50">
                          {request.quantity.toLocaleString()} SMS
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        Rs. {request.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          {request.paymentMethod}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {request.requestedBy}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {request.status === 'processed' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Processed
                          </Badge>
                        )}
                        {request.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {request.status === 'added' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Added
                          </Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">
                            <X className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                        {request.transactionId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl font-semibold mt-1">{mockPurchaseRequests.length}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Processed</p>
                    <p className="text-2xl font-semibold mt-1 text-green-600">
                      {mockPurchaseRequests.filter(r => r.status === 'processed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold mt-1 text-yellow-600">
                      {mockPurchaseRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-semibold mt-1 text-blue-600">
                      Rs. {mockPurchaseRequests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      {currentView === 'list' ? renderListPage() : renderComposePage()}

      {/* SMS Package Dialog */}
      <Dialog open={isSMSPackageOpen} onOpenChange={setIsSMSPackageOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Choose SMS Package</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSMSPackageOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Select an SMS package to purchase messaging credits for your hospital.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 pb-3 border-b">
                  <div className="font-medium text-sm text-gray-700">Sms quantity</div>
                  <div className="font-medium text-sm text-gray-700 text-center">Price Per Sms</div>
                  <div className="font-medium text-sm text-gray-700 text-right">Total Cost</div>
                </div>

                {/* Package Options */}
                {smsPackages.map((pkg) => (
                  <div 
                    key={pkg.quantity}
                    className="flex items-center space-x-4 py-3 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
                    onClick={() => setSelectedPackage(pkg.quantity.toString())}
                  >
                    <RadioGroupItem value={pkg.quantity.toString()} id={`pkg-${pkg.quantity}`} />
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <label 
                        htmlFor={`pkg-${pkg.quantity}`}
                        className="text-sm cursor-pointer"
                      >
                        {pkg.quantity}
                      </label>
                      <div className="text-sm text-center">{pkg.pricePerSms.toFixed(2)}</div>
                      <div className="text-sm text-right font-medium">{pkg.totalCost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-end pt-4">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                onClick={handleAddSMS}
              >
                ADD SMS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}