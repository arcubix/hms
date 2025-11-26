import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  X,
  Search,
  Download,
  Printer,
  Eye,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  Mail,
  Phone,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Send,
  Package,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'partial';
  paymentMethod?: string;
  notes?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    date: '2025-11-01',
    dueDate: '2025-11-30',
    client: {
      name: 'MediCare Hospital - Main Branch',
      email: 'admin@medicare.com',
      phone: '+1 (555) 123-4567',
      address: '123 Medical Center Dr, Healthcare City, HC 12345'
    },
    items: [
      {
        description: 'MediCare HMS - Enterprise License (Annual)',
        quantity: 1,
        rate: 50000,
        amount: 50000
      },
      {
        description: 'Support & Maintenance (12 Months)',
        quantity: 1,
        rate: 15000,
        amount: 15000
      },
      {
        description: 'Training & Onboarding (5 Sessions)',
        quantity: 5,
        rate: 2000,
        amount: 10000
      }
    ],
    subtotal: 75000,
    tax: 11250,
    discount: 5000,
    total: 81250,
    amountPaid: 81250,
    balance: 0,
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Payment received on time. Thank you for your business!'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-002',
    date: '2025-11-15',
    dueDate: '2025-12-15',
    client: {
      name: 'City General Hospital',
      email: 'billing@cityhospital.com',
      phone: '+1 (555) 987-6543',
      address: '456 Hospital Avenue, Metro City, MC 67890'
    },
    items: [
      {
        description: 'MediCare HMS - Professional License (Annual)',
        quantity: 1,
        rate: 35000,
        amount: 35000
      },
      {
        description: 'Pharmacy Module Add-on',
        quantity: 1,
        rate: 8000,
        amount: 8000
      },
      {
        description: 'Laboratory Module Add-on',
        quantity: 1,
        rate: 8000,
        amount: 8000
      }
    ],
    subtotal: 51000,
    tax: 7650,
    discount: 2000,
    total: 56650,
    amountPaid: 30000,
    balance: 26650,
    status: 'partial',
    paymentMethod: 'Credit Card (Partial)',
    notes: 'First payment received. Balance due by end of month.'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2025-003',
    date: '2025-11-20',
    dueDate: '2025-12-20',
    client: {
      name: 'Wellness Clinic Network',
      email: 'accounts@wellnessclinic.com',
      phone: '+1 (555) 456-7890',
      address: '789 Wellness Street, Health Town, HT 13579'
    },
    items: [
      {
        description: 'MediCare HMS - Standard License (Annual)',
        quantity: 1,
        rate: 25000,
        amount: 25000
      },
      {
        description: 'Cloud Hosting (12 Months)',
        quantity: 1,
        rate: 6000,
        amount: 6000
      }
    ],
    subtotal: 31000,
    tax: 4650,
    discount: 1500,
    total: 34150,
    amountPaid: 0,
    balance: 34150,
    status: 'pending',
    notes: 'Awaiting payment confirmation.'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2025-004',
    date: '2025-10-15',
    dueDate: '2025-11-15',
    client: {
      name: 'Emergency Care Center',
      email: 'billing@emergencycare.com',
      phone: '+1 (555) 321-9876',
      address: '321 Emergency Blvd, Urgent City, UC 24680'
    },
    items: [
      {
        description: 'MediCare HMS - Emergency Module',
        quantity: 1,
        rate: 15000,
        amount: 15000
      },
      {
        description: 'Custom Integration Services',
        quantity: 1,
        rate: 10000,
        amount: 10000
      }
    ],
    subtotal: 25000,
    tax: 3750,
    discount: 0,
    total: 28750,
    amountPaid: 0,
    balance: 28750,
    status: 'overdue',
    notes: 'Payment overdue. Follow-up required.'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2025-005',
    date: '2025-11-22',
    dueDate: '2025-12-22',
    client: {
      name: 'Pediatric Specialty Hospital',
      email: 'accounts@pediatrichospital.com',
      phone: '+1 (555) 654-3210',
      address: '654 Children\'s Way, Kids City, KC 36925'
    },
    items: [
      {
        description: 'MediCare HMS - Enterprise License (Monthly)',
        quantity: 1,
        rate: 5000,
        amount: 5000
      },
      {
        description: 'IPD Management Module',
        quantity: 1,
        rate: 3000,
        amount: 3000
      },
      {
        description: 'Radiology Information System',
        quantity: 1,
        rate: 4000,
        amount: 4000
      }
    ],
    subtotal: 12000,
    tax: 1800,
    discount: 500,
    total: 13300,
    amountPaid: 13300,
    balance: 0,
    status: 'paid',
    paymentMethod: 'UPI Payment'
  },
  {
    id: '6',
    invoiceNumber: 'INV-2025-006',
    date: '2025-11-18',
    dueDate: '2025-11-25',
    client: {
      name: 'Diagnostic Laboratory Services',
      email: 'info@diaglab.com',
      phone: '+1 (555) 789-4561',
      address: '987 Lab Road, Test City, TC 75315'
    },
    items: [
      {
        description: 'Laboratory Information System (Annual)',
        quantity: 1,
        rate: 20000,
        amount: 20000
      },
      {
        description: 'Equipment Integration',
        quantity: 1,
        rate: 5000,
        amount: 5000
      }
    ],
    subtotal: 25000,
    tax: 3750,
    discount: 1000,
    total: 27750,
    amountPaid: 0,
    balance: 27750,
    status: 'cancelled',
    notes: 'Invoice cancelled at client request.'
  }
];

interface BilledInvoicesProps {
  onClose?: () => void;
}

export function BilledInvoices({ onClose }: BilledInvoicesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter invoices
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Calculate statistics
  const stats = {
    total: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pending: mockInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
    overdue: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
    count: mockInvoices.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'partial':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'overdue':
        return <AlertCircle className="w-3 h-3" />;
      case 'partial':
        return <TrendingUp className="w-3 h-3" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast.success('Invoice downloaded', {
      description: `${invoiceNumber} has been downloaded successfully`
    });
  };

  const handlePrintInvoice = (invoiceNumber: string) => {
    toast.success('Printing invoice', {
      description: `${invoiceNumber} is being prepared for printing`
    });
  };

  const handleSendInvoice = (invoiceNumber: string) => {
    toast.success('Invoice sent', {
      description: `${invoiceNumber} has been sent to client via email`
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 z-50 overflow-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Software Billing & Invoices</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track all software license invoices</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => toast.success('Data refreshed')}
                className="border-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <FileText className="w-4 h-4 mr-2" />
                Create Invoice
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-200" />
              </div>
              <p className="text-sm text-blue-100 mb-1">Total Billed</p>
              <p className="text-3xl font-bold">${stats.total.toLocaleString()}</p>
              <p className="text-xs text-blue-200 mt-2">{stats.count} invoices</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-200" />
              </div>
              <p className="text-sm text-green-100 mb-1">Paid Amount</p>
              <p className="text-3xl font-bold">${stats.paid.toLocaleString()}</p>
              <p className="text-xs text-green-200 mt-2">
                {mockInvoices.filter(inv => inv.status === 'paid').length} paid
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <ArrowDownRight className="w-5 h-5 text-yellow-200" />
              </div>
              <p className="text-sm text-yellow-100 mb-1">Pending</p>
              <p className="text-3xl font-bold">${stats.pending.toLocaleString()}</p>
              <p className="text-xs text-yellow-200 mt-2">
                {mockInvoices.filter(inv => inv.status === 'pending').length} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <AlertCircle className="w-5 h-5 text-red-200" />
              </div>
              <p className="text-sm text-red-100 mb-1">Overdue</p>
              <p className="text-3xl font-bold">${stats.overdue.toLocaleString()}</p>
              <p className="text-xs text-red-200 mt-2">
                {mockInvoices.filter(inv => inv.status === 'overdue').length} overdue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-600 mb-2">Search Invoices</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by invoice number, client name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">Date Range</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">INVOICE</TableHead>
                    <TableHead className="font-semibold">CLIENT</TableHead>
                    <TableHead className="font-semibold">DATE</TableHead>
                    <TableHead className="font-semibold">DUE DATE</TableHead>
                    <TableHead className="font-semibold">AMOUNT</TableHead>
                    <TableHead className="font-semibold">PAID</TableHead>
                    <TableHead className="font-semibold">BALANCE</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                    <TableHead className="font-semibold text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">{invoice.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-green-100 text-green-700">
                              {invoice.client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 max-w-[200px] truncate">
                              {invoice.client.name}
                            </p>
                            <p className="text-xs text-gray-500">{invoice.client.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {new Date(invoice.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        ${invoice.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        ${invoice.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className={`font-medium ${invoice.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        ${invoice.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(invoice.status)} capitalize`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintInvoice(invoice.invoiceNumber)}>
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice.invoiceNumber)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send to Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'bg-blue-600' : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={showInvoiceDetail} onOpenChange={setShowInvoiceDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information and line items
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Invoice Date: {new Date(selectedInvoice.date).toLocaleDateString()}
                  </p>
                  <Badge className={`${getStatusColor(selectedInvoice.status)} capitalize mt-2`}>
                    {getStatusIcon(selectedInvoice.status)}
                    <span className="ml-1">{selectedInvoice.status}</span>
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(selectedInvoice.invoiceNumber)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(selectedInvoice.invoiceNumber)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button size="sm" className="bg-blue-600" onClick={() => handleSendInvoice(selectedInvoice.invoiceNumber)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Bill To:</h4>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{selectedInvoice.client.name}</p>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{selectedInvoice.client.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{selectedInvoice.client.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{selectedInvoice.client.address}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Invoice Information:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="font-medium text-gray-900">{selectedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedInvoice.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedInvoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium text-gray-900">{selectedInvoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Line Items:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.rate.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">${item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">${selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (15%):</span>
                    <span className="font-medium text-gray-900">${selectedInvoice.tax.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">-${selectedInvoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-xl text-gray-900">${selectedInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium text-green-600">${selectedInvoice.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Balance Due:</span>
                    <span className={`font-bold text-lg ${selectedInvoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${selectedInvoice.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedInvoice.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
