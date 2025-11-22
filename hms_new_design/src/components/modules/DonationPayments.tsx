/**
 * Donation Payments View Page
 * 
 * Comprehensive donation payment management:
 * - Payment history and records
 * - Donor-wise payment tracking
 * - Advanced filtering and search
 * - Payment analytics and reports
 * - Receipt generation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Receipt,
  Mail,
  Phone,
  MapPin,
  Hash,
  AlertCircle,
  CheckCheck,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Send
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

interface Donor {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  cnic?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  totalDonated: number;
  lastDonation: string;
  frequency: 'one-time' | 'monthly' | 'yearly';
  taxExempt?: boolean;
  notes?: string;
}

interface DonationPayment {
  id: string;
  donorId: string;
  donorName: string;
  donorType: 'individual' | 'corporate';
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'cheque' | 'online';
  transactionId?: string;
  chequeNumber?: string;
  bankName?: string;
  purpose: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  processedBy?: string;
  category?: string;
}

// ============= MOCK DATA =============

const mockDonors: Donor[] = [
  {
    id: 'DN001',
    name: 'Robert Thompson',
    type: 'individual',
    cnic: '12345-6789012-3',
    phone: '+1-555-0401',
    email: 'robert.t@email.com',
    address: '123 Main Street',
    city: 'New York',
    country: 'USA',
    totalDonated: 50000,
    lastDonation: '2024-11-15',
    frequency: 'monthly',
    taxExempt: true,
    notes: 'Regular monthly donor'
  },
  {
    id: 'DN002',
    name: 'Smith Foundation',
    type: 'corporate',
    phone: '+1-555-0402',
    email: 'contact@smithfoundation.org',
    address: '456 Corporate Blvd',
    city: 'Los Angeles',
    country: 'USA',
    totalDonated: 500000,
    lastDonation: '2024-11-01',
    frequency: 'yearly',
    taxExempt: true,
    notes: 'Annual charity gala sponsor'
  },
  {
    id: 'DN003',
    name: 'Maria Garcia',
    type: 'individual',
    cnic: '98765-4321098-7',
    phone: '+1-555-0403',
    email: 'maria.g@email.com',
    address: '789 Oak Avenue',
    city: 'Chicago',
    country: 'USA',
    totalDonated: 25000,
    lastDonation: '2024-09-20',
    frequency: 'one-time',
    taxExempt: false,
    notes: 'In memory donation'
  },
  {
    id: 'DN004',
    name: 'Johnson Electronics',
    type: 'corporate',
    phone: '+1-555-0404',
    email: 'csr@johnsonelec.com',
    address: '321 Business Park',
    city: 'Boston',
    country: 'USA',
    totalDonated: 100000,
    lastDonation: '2024-11-10',
    frequency: 'yearly',
    taxExempt: true
  },
  {
    id: 'DN005',
    name: 'David Wilson',
    type: 'individual',
    cnic: '55555-1234567-8',
    phone: '+1-555-0405',
    email: 'david.w@email.com',
    address: '654 Park Avenue',
    city: 'Seattle',
    country: 'USA',
    totalDonated: 35000,
    lastDonation: '2024-11-18',
    frequency: 'monthly',
    taxExempt: false
  }
];

const mockDonationPayments: DonationPayment[] = [
  {
    id: 'PAY001',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    donorType: 'individual',
    amount: 5000,
    date: '2024-11-15',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN987654321',
    bankName: 'Chase Bank',
    purpose: 'Monthly Donation - November 2024',
    receiptNumber: 'RCP-2024-1115-001',
    status: 'completed',
    notes: 'Regular monthly contribution',
    processedBy: 'Admin',
    category: 'General Fund'
  },
  {
    id: 'PAY002',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    donorType: 'individual',
    amount: 5000,
    date: '2024-10-15',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN987654320',
    bankName: 'Chase Bank',
    purpose: 'Monthly Donation - October 2024',
    receiptNumber: 'RCP-2024-1015-001',
    status: 'completed',
    processedBy: 'Admin',
    category: 'General Fund'
  },
  {
    id: 'PAY003',
    donorId: 'DN002',
    donorName: 'Smith Foundation',
    donorType: 'corporate',
    amount: 500000,
    date: '2024-11-01',
    paymentMethod: 'cheque',
    chequeNumber: 'CHQ-789456',
    bankName: 'Bank of America',
    purpose: 'Annual Charity Gala Sponsorship 2024',
    receiptNumber: 'RCP-2024-1101-001',
    status: 'completed',
    notes: 'Corporate sponsorship for annual event',
    processedBy: 'Finance Manager',
    category: 'Event Sponsorship'
  },
  {
    id: 'PAY004',
    donorId: 'DN003',
    donorName: 'Maria Garcia',
    donorType: 'individual',
    amount: 25000,
    date: '2024-09-20',
    paymentMethod: 'card',
    transactionId: 'CARD-456789123',
    purpose: 'In Memory of John Garcia',
    receiptNumber: 'RCP-2024-0920-001',
    status: 'completed',
    notes: 'Memorial donation',
    processedBy: 'Admin',
    category: 'Memorial Fund'
  },
  {
    id: 'PAY005',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    donorType: 'individual',
    amount: 5000,
    date: '2024-09-15',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN987654319',
    bankName: 'Chase Bank',
    purpose: 'Monthly Donation - September 2024',
    receiptNumber: 'RCP-2024-0915-001',
    status: 'completed',
    processedBy: 'Admin',
    category: 'General Fund'
  },
  {
    id: 'PAY006',
    donorId: 'DN004',
    donorName: 'Johnson Electronics',
    donorType: 'corporate',
    amount: 100000,
    date: '2024-11-10',
    paymentMethod: 'bank-transfer',
    transactionId: 'TXN-JE-2024-001',
    bankName: 'Wells Fargo',
    purpose: 'Annual CSR Contribution 2024',
    receiptNumber: 'RCP-2024-1110-001',
    status: 'completed',
    processedBy: 'Finance Manager',
    category: 'CSR Fund'
  },
  {
    id: 'PAY007',
    donorId: 'DN005',
    donorName: 'David Wilson',
    donorType: 'individual',
    amount: 3000,
    date: '2024-11-18',
    paymentMethod: 'online',
    transactionId: 'ONLINE-2024-9876',
    purpose: 'Monthly Donation - November 2024',
    receiptNumber: 'RCP-2024-1118-001',
    status: 'completed',
    processedBy: 'System',
    category: 'General Fund'
  },
  {
    id: 'PAY008',
    donorId: 'DN005',
    donorName: 'David Wilson',
    donorType: 'individual',
    amount: 3000,
    date: '2024-10-18',
    paymentMethod: 'online',
    transactionId: 'ONLINE-2024-8765',
    purpose: 'Monthly Donation - October 2024',
    receiptNumber: 'RCP-2024-1018-001',
    status: 'completed',
    processedBy: 'System',
    category: 'General Fund'
  },
  {
    id: 'PAY009',
    donorId: 'DN002',
    donorName: 'Smith Foundation',
    donorType: 'corporate',
    amount: 50000,
    date: '2024-11-20',
    paymentMethod: 'cheque',
    chequeNumber: 'CHQ-789457',
    bankName: 'Bank of America',
    purpose: 'Medical Equipment Fund',
    receiptNumber: 'RCP-2024-1120-001',
    status: 'pending',
    notes: 'Cheque under clearance',
    processedBy: 'Finance Manager',
    category: 'Equipment Fund'
  },
  {
    id: 'PAY010',
    donorId: 'DN001',
    donorName: 'Robert Thompson',
    donorType: 'individual',
    amount: 10000,
    date: '2024-11-21',
    paymentMethod: 'cash',
    purpose: 'Emergency Relief Fund',
    receiptNumber: 'RCP-2024-1121-001',
    status: 'completed',
    processedBy: 'Cashier',
    category: 'Emergency Fund'
  }
];

// ============= MAIN COMPONENT =============

interface DonationPaymentsProps {
  onBack?: () => void;
  selectedDonorId?: string;
}

export function DonationPayments({ onBack, selectedDonorId }: DonationPaymentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDonor, setFilterDonor] = useState(selectedDonorId || 'all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<DonationPayment | null>(null);
  const [isPaymentDetailDialogOpen, setIsPaymentDetailDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  // Filter payments based on all filters
  const filteredPayments = mockDonationPayments.filter(payment => {
    const matchesSearch = 
      payment.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterPaymentMethod === 'all' || payment.paymentMethod === filterPaymentMethod;
    const matchesDonor = filterDonor === 'all' || payment.donorId === filterDonor;

    return matchesSearch && matchesStatus && matchesMethod && matchesDonor;
  });

  // Calculate statistics
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = filteredPayments.length;
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length;
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;

  // Get donor details
  const getDonorDetails = (donorId: string) => {
    return mockDonors.find(d => d.id === donorId);
  };

  // Payment method breakdown
  const paymentMethodStats = [
    { method: 'Cash', count: filteredPayments.filter(p => p.paymentMethod === 'cash').length, amount: filteredPayments.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + p.amount, 0) },
    { method: 'Card', count: filteredPayments.filter(p => p.paymentMethod === 'card').length, amount: filteredPayments.filter(p => p.paymentMethod === 'card').reduce((sum, p) => sum + p.amount, 0) },
    { method: 'Bank Transfer', count: filteredPayments.filter(p => p.paymentMethod === 'bank-transfer').length, amount: filteredPayments.filter(p => p.paymentMethod === 'bank-transfer').reduce((sum, p) => sum + p.amount, 0) },
    { method: 'Cheque', count: filteredPayments.filter(p => p.paymentMethod === 'cheque').length, amount: filteredPayments.filter(p => p.paymentMethod === 'cheque').reduce((sum, p) => sum + p.amount, 0) },
    { method: 'Online', count: filteredPayments.filter(p => p.paymentMethod === 'online').length, amount: filteredPayments.filter(p => p.paymentMethod === 'online').reduce((sum, p) => sum + p.amount, 0) }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="outline" size="icon" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">Donation Payments</h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete payment history and transaction records
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${completedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{completedPayments} payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${pendingAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{pendingPayments} payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Payments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalPayments}
                  </p>
                  <p className="text-xs text-gray-500">transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Avg Payment</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${totalPayments > 0 ? Math.round(totalAmount / totalPayments).toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-gray-500">per transaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by receipt, donor, or purpose..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterDonor} onValueChange={setFilterDonor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Donor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Donors</SelectItem>
                    {mockDonors.map(donor => (
                      <SelectItem key={donor.id} value={donor.id}>
                        {donor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || filterStatus !== 'all' || filterPaymentMethod !== 'all' || filterDonor !== 'all' || filterDateRange !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Badge variant="outline" className="gap-2">
                  <Filter className="w-3 h-3" />
                  Filters Active: {[
                    searchQuery && 'Search',
                    filterStatus !== 'all' && 'Status',
                    filterPaymentMethod !== 'all' && 'Payment Method',
                    filterDonor !== 'all' && 'Donor',
                    filterDateRange !== 'all' && 'Date Range'
                  ].filter(Boolean).join(', ')}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterPaymentMethod('all');
                    setFilterDonor('all');
                    setFilterDateRange('all');
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Payment Table */}
          <div className="col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Records</CardTitle>
                    <CardDescription>
                      Showing {filteredPayments.length} of {mockDonationPayments.length} payments
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="w-3 h-3 mr-1" />
                    Bulk Actions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt No.</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="font-mono text-sm font-semibold">
                            {payment.receiptNumber}
                          </TableCell>
                          <TableCell className="text-sm">
                            {payment.date}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {payment.donorType === 'individual' ? (
                                <User className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Building2 className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="font-medium text-sm">{payment.donorName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            ${payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs">
                              {payment.paymentMethod.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsPaymentDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsReceiptDialogOpen(true);
                                }}
                              >
                                <Printer className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Mail className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                      <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="font-semibold text-gray-700 mb-2">No Payments Found</h3>
                      <p className="text-sm text-gray-600">
                        Try adjusting your filters or search query
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-4">
            {/* Payment Method Breakdown */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
                <CardDescription>Breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethodStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{stat.method}</p>
                        <p className="text-xs text-gray-600">{stat.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-blue-600">
                          ${stat.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {totalAmount > 0 ? Math.round((stat.amount / totalAmount) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Donors */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Top Donors</CardTitle>
                <CardDescription>Highest contributors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDonors
                    .sort((a, b) => b.totalDonated - a.totalDonated)
                    .slice(0, 5)
                    .map((donor, index) => (
                      <div key={donor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{donor.name}</p>
                          <p className="text-xs text-gray-600">{donor.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">
                            ${donor.totalDonated.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDonationPayments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((payment) => (
                      <div key={payment.id} className="flex items-start gap-3 p-3 border-l-2 border-l-green-500 bg-gray-50 rounded-r-lg">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          payment.status === 'completed' ? 'bg-green-100' :
                          payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {payment.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : payment.status === 'pending' ? (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">${payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-600 truncate">{payment.donorName}</p>
                          <p className="text-xs text-gray-500">{payment.date}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Detail Dialog */}
        <Dialog open={isPaymentDetailDialogOpen} onOpenChange={setIsPaymentDetailDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>Complete payment transaction information</DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                {/* Payment Status Banner */}
                <Card className={`border-0 ${
                  selectedPayment.status === 'completed' ? 'bg-green-50' :
                  selectedPayment.status === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedPayment.status === 'completed' ? 'bg-green-200' :
                          selectedPayment.status === 'pending' ? 'bg-yellow-200' : 'bg-red-200'
                        }`}>
                          {selectedPayment.status === 'completed' ? (
                            <CheckCheck className="w-6 h-6 text-green-700" />
                          ) : selectedPayment.status === 'pending' ? (
                            <Clock className="w-6 h-6 text-yellow-700" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold capitalize">
                            Payment {selectedPayment.status}
                          </p>
                          <p className="text-sm text-gray-600">
                            Receipt: {selectedPayment.receiptNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          ${selectedPayment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{selectedPayment.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Donor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Donor Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          {selectedPayment.donorType === 'individual' ? (
                            <User className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Donor Name</Label>
                          <p className="font-semibold">{selectedPayment.donorName}</p>
                          <Badge className="mt-1 text-xs capitalize">
                            {selectedPayment.donorType}
                          </Badge>
                        </div>
                      </div>

                      {getDonorDetails(selectedPayment.donorId) && (
                        <>
                          <div>
                            <Label className="text-xs text-gray-600">Contact</Label>
                            <div className="space-y-1 mt-1">
                              <p className="text-sm flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-500" />
                                {getDonorDetails(selectedPayment.donorId)?.phone}
                              </p>
                              <p className="text-sm flex items-center gap-2">
                                <Mail className="w-3 h-3 text-gray-500" />
                                {getDonorDetails(selectedPayment.donorId)?.email}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">Payment Method</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <p className="font-semibold capitalize">
                            {selectedPayment.paymentMethod.replace('-', ' ')}
                          </p>
                        </div>
                      </div>

                      {selectedPayment.transactionId && (
                        <div>
                          <Label className="text-xs text-gray-600">Transaction ID</Label>
                          <p className="font-mono font-semibold mt-1">
                            {selectedPayment.transactionId}
                          </p>
                        </div>
                      )}

                      {selectedPayment.chequeNumber && (
                        <div>
                          <Label className="text-xs text-gray-600">Cheque Number</Label>
                          <p className="font-mono font-semibold mt-1">
                            {selectedPayment.chequeNumber}
                          </p>
                        </div>
                      )}

                      {selectedPayment.bankName && (
                        <div>
                          <Label className="text-xs text-gray-600">Bank Name</Label>
                          <p className="font-semibold mt-1">{selectedPayment.bankName}</p>
                        </div>
                      )}

                      <div>
                        <Label className="text-xs text-gray-600">Purpose</Label>
                        <p className="font-semibold mt-1">{selectedPayment.purpose}</p>
                      </div>

                      {selectedPayment.category && (
                        <div>
                          <Label className="text-xs text-gray-600">Category</Label>
                          <Badge variant="outline" className="mt-1">
                            {selectedPayment.category}
                          </Badge>
                        </div>
                      )}

                      {selectedPayment.processedBy && (
                        <div>
                          <Label className="text-xs text-gray-600">Processed By</Label>
                          <p className="font-semibold mt-1">{selectedPayment.processedBy}</p>
                        </div>
                      )}

                      <div>
                        <Label className="text-xs text-gray-600">Payment Date</Label>
                        <p className="font-semibold mt-1">{selectedPayment.date}</p>
                      </div>
                    </div>

                    {selectedPayment.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-xs text-gray-600">Notes</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                          {selectedPayment.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Receipt
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Receipt Print Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>Official donation receipt</DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                {/* Receipt Content */}
                <div className="border-2 border-dashed border-gray-300 p-8 bg-white" id="receipt-content">
                  {/* Hospital Header */}
                  <div className="text-center mb-6 pb-6 border-b-2">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">
                      City Hospital Foundation
                    </h2>
                    <p className="text-sm text-gray-600">
                      123 Healthcare Avenue, Medical District, City, State 12345
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: +1-555-HOSPITAL | Email: donations@cityhospital.org
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Tax ID: 12-3456789 | Registered Charity
                    </p>
                  </div>

                  {/* Receipt Title */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">DONATION RECEIPT</h3>
                    <p className="text-sm text-gray-600">
                      Receipt No: {selectedPayment.receiptNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {selectedPayment.date}
                    </p>
                  </div>

                  {/* Donor Details */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Received From:</h4>
                    <p className="font-bold text-lg">{selectedPayment.donorName}</p>
                    {getDonorDetails(selectedPayment.donorId) && (
                      <>
                        <p className="text-sm text-gray-600 mt-1">
                          {getDonorDetails(selectedPayment.donorId)?.address}
                          {getDonorDetails(selectedPayment.donorId)?.city && 
                            `, ${getDonorDetails(selectedPayment.donorId)?.city}`}
                          {getDonorDetails(selectedPayment.donorId)?.country && 
                            `, ${getDonorDetails(selectedPayment.donorId)?.country}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getDonorDetails(selectedPayment.donorId)?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getDonorDetails(selectedPayment.donorId)?.phone}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Donation Amount</p>
                    <p className="text-4xl font-bold text-green-600">
                      ${selectedPayment.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 capitalize">
                      Payment Method: {selectedPayment.paymentMethod.replace('-', ' ')}
                    </p>
                  </div>

                  {/* Purpose */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Purpose of Donation:</h4>
                    <p className="text-gray-700">{selectedPayment.purpose}</p>
                    {selectedPayment.category && (
                      <p className="text-sm text-gray-600 mt-1">
                        Category: {selectedPayment.category}
                      </p>
                    )}
                  </div>

                  {/* Tax Information */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Tax Deduction Information
                    </h4>
                    <p className="text-sm text-gray-700">
                      This donation is tax-deductible to the extent allowed by law. 
                      No goods or services were provided in exchange for this contribution. 
                      Please retain this receipt for your tax records.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-6 border-t-2 border-dashed">
                    <p className="text-sm text-gray-600 mb-4">
                      Thank you for your generous support!
                    </p>
                    <p className="text-xs text-gray-500">
                      This is an official receipt. For questions, contact our donation office.
                    </p>
                    <div className="mt-6">
                      <p className="text-xs text-gray-500">Authorized Signature</p>
                      <div className="h-12 border-b border-gray-400 w-48 mx-auto mt-2"></div>
                      <p className="text-xs text-gray-600 mt-2">{selectedPayment.processedBy}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      window.print();
                      toast.success('Receipt prepared for printing');
                    }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email to Donor
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
