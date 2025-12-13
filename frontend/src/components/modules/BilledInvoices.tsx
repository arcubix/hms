import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
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
  ArrowDownRight,
  Plus
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
  DialogFooter,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';
import { api } from '../../services/api';
import type { CreateInvoiceData, Invoice as ApiInvoice } from '../../types/billing';
import type { InsuranceOrganization } from '../../services/api';

// Display invoice interface (for backward compatibility with existing UI code)
interface DisplayInvoice {
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


interface BilledInvoicesProps {
  onClose?: () => void;
}

export function BilledInvoices({ onClose }: BilledInvoicesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<DisplayInvoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  
  // API-related state
  const [organizations, setOrganizations] = useState<InsuranceOrganization[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState<CreateInvoiceData>({
    organization_id: 0,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ item_type: 'other', description: '', quantity: 1, unit_price: 0 }],
    notes: '',
    terms: ''
  });
  
  // Debug: Log dialog state changes
  useEffect(() => {
    console.log('🔍 isCreateInvoiceDialogOpen state changed to:', isCreateInvoiceDialogOpen);
  }, [isCreateInvoiceDialogOpen]);
  
  // Convert API invoice to display format
  const convertApiInvoiceToDisplay = (apiInvoice: ApiInvoice, org?: InsuranceOrganization): DisplayInvoice => {
    const orgData = org || organizations.find(o => o.id === apiInvoice.organization_id);
    
    // Map payment_status to display status
    const mapPaymentStatus = (status: string): DisplayInvoice['status'] => {
      switch (status) {
        case 'paid': return 'paid';
        case 'partial': return 'partial';
        case 'overdue': return 'overdue';
        case 'cancelled': return 'cancelled';
        case 'draft':
        case 'sent':
        default: return 'pending';
      }
    };

    return {
      id: apiInvoice.id.toString(),
      invoiceNumber: apiInvoice.invoice_number,
      date: apiInvoice.invoice_date,
      dueDate: apiInvoice.due_date,
      client: {
        name: apiInvoice.organization_name || orgData?.name || 'Unknown Organization',
        email: orgData?.email || '',
        phone: orgData?.phone || '',
        address: orgData?.address || ''
      },
      items: apiInvoice.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.unit_price,
        amount: item.total
      })) || [],
      subtotal: apiInvoice.subtotal,
      tax: apiInvoice.tax_amount,
      discount: apiInvoice.discount,
      total: apiInvoice.total_amount,
      amountPaid: apiInvoice.paid_amount,
      balance: apiInvoice.due_amount,
      status: mapPaymentStatus(apiInvoice.payment_status),
      notes: apiInvoice.notes
    };
  };

  // Load organizations from insurance_organizations table where type = 'organization'
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        // Load insurance organizations with type='organization'
        const insuranceOrgs = await api.getInsuranceOrganizations({ 
          type: 'organization',
          status: 'active'
        });
        console.log('📋 Loaded insurance organizations (type=organization):', insuranceOrgs);
        console.log('📋 Number of organizations:', insuranceOrgs?.length || 0);
        
        if (insuranceOrgs && insuranceOrgs.length > 0) {
          insuranceOrgs.forEach((org: InsuranceOrganization, index: number) => {
            console.log(`📋 Organization ${index + 1}:`, {
              id: org.id,
              name: org.name,
              account_prefix: org.account_prefix,
              type: org.type,
              status: org.status,
              contact_person: org.contact_person,
              email: org.email,
              phone: org.phone
            });
          });
          setOrganizations(insuranceOrgs);
        } else {
          console.warn('⚠️ No organizations found with type=organization');
          setOrganizations([]);
        }
      } catch (error: any) {
        console.error('❌ Failed to load organizations:', error);
        console.error('❌ Error details:', {
          message: error?.message,
          stack: error?.stack,
          response: error?.response
        });
        toast.error('Failed to load organizations', { description: error?.message });
        setOrganizations([]);
      }
    };
    loadOrganizations();
  }, []);

  // Load invoices from API
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.payment_status = statusFilter;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (dateFrom) {
        filters.date_from = dateFrom;
      }
      if (dateTo) {
        filters.date_to = dateTo;
      }

      const response = await api.getInvoices(filters);
      if (response.success) {
        setInvoices(response.data);
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices', { description: error?.message });
    } finally {
      setLoading(false);
    }
  };

  // Load invoices on mount and when filters change
  useEffect(() => {
    loadInvoices();
  }, [statusFilter, searchQuery, dateFrom, dateTo]);
  
  const itemsPerPage = 10;

  // Helper functions for invoice form
  const calculateInvoiceTotal = () => {
    if (!invoiceFormData.items || invoiceFormData.items.length === 0) return 0;
    const subtotal = invoiceFormData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return subtotal;
  };

  const addInvoiceItem = () => {
    setInvoiceFormData({
      ...invoiceFormData,
      items: [...(invoiceFormData.items || []), { item_type: 'other', description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeInvoiceItem = (index: number) => {
    const newItems = invoiceFormData.items?.filter((_, i) => i !== index) || [];
    setInvoiceFormData({ ...invoiceFormData, items: newItems });
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...(invoiceFormData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceFormData({ ...invoiceFormData, items: newItems });
  };

  const resetInvoiceForm = () => {
    setInvoiceFormData({
      organization_id: 0,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ item_type: 'other', description: '', quantity: 1, unit_price: 0 }],
      notes: '',
      terms: ''
    });
  };

  const handleCreateInvoice = async () => {
    if (!invoiceFormData.organization_id) {
      toast.error('Please select an organization');
      return;
    }
    
    if (!invoiceFormData.items || invoiceFormData.items.length === 0) {
      toast.error('Please add at least one invoice item');
      return;
    }
    
    // Validate items
    for (const item of invoiceFormData.items) {
      if (!item.description || item.quantity <= 0 || item.unit_price < 0) {
        toast.error('Please fill in all item fields correctly');
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare invoice data - backend will calculate totals from items
      const invoiceData: CreateInvoiceData = {
        ...invoiceFormData,
      };
      
      const response = await api.createInvoice(invoiceData);
      
      if (response.success) {
        toast.success('Invoice created successfully');
        setIsCreateInvoiceDialogOpen(false);
        resetInvoiceForm();
        // Reload invoices list
        await loadInvoices();
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error: any) {
      console.error('Create invoice error:', error);
      toast.error('Failed to create invoice', { description: error?.message || 'Please check the console for details' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert API invoices to display format
  const displayInvoices: DisplayInvoice[] = invoices.map(inv => convertApiInvoiceToDisplay(inv));

  // Filter invoices (additional client-side filtering if needed)
  const filteredInvoices = displayInvoices.filter(invoice => {
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

  // Calculate statistics from real invoices
  const stats = {
    total: displayInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: displayInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pending: displayInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
    overdue: displayInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
    count: displayInvoices.length
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

  const handleViewInvoice = (invoice: DisplayInvoice) => {
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
                onClick={() => {
                  loadInvoices();
                  toast.success('Data refreshed');
                }}
                className="border-gray-300"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  console.log('🔍 Create Invoice button clicked');
                  console.log('🔍 Current dialog state:', isCreateInvoiceDialogOpen);
                  setIsCreateInvoiceDialogOpen(true);
                  console.log('🔍 Dialog state set to true');
                }}
              >
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
                {displayInvoices.filter(inv => inv.status === 'paid').length} paid
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
                {displayInvoices.filter(inv => inv.status === 'pending').length} pending
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
                {displayInvoices.filter(inv => inv.status === 'overdue').length} overdue
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

      {/* Create Invoice Dialog */}
      <Dialog 
        open={isCreateInvoiceDialogOpen} 
        onOpenChange={(open) => {
          console.log('🔍 Create Invoice Dialog onOpenChange called with:', open);
          console.log('🔍 Current isCreateInvoiceDialogOpen state before update:', isCreateInvoiceDialogOpen);
          setIsCreateInvoiceDialogOpen(open);
          if (!open) {
            resetInvoiceForm();
          }
          console.log('🔍 Dialog state updated to:', open);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label>Organization <span className="text-red-500">*</span></Label>
                <Select 
                  value={invoiceFormData.organization_id > 0 ? invoiceFormData.organization_id.toString() : undefined} 
                  onValueChange={(value) => {
                    const orgId = parseInt(value);
                    console.log('📋 Selected organization ID:', orgId, 'from', organizations.length, 'organizations');
                    setInvoiceFormData({...invoiceFormData, organization_id: orgId});
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={organizations.length === 0 ? "Loading organizations..." : "Select organization"} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.length === 0 ? (
                      <SelectItem value="loading" disabled>No organizations available</SelectItem>
                    ) : (
                      organizations.map(org => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.name} {org.account_prefix ? `(${org.account_prefix})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {organizations.length > 0 ? (
                  <p className="text-xs text-gray-500 mt-1">
                    {organizations.length} organization(s) available (from insurance_organizations table)
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    No organizations found. Make sure you have organizations with type='organization' in insurance_organizations table.
                  </p>
                )}
              </div>
              <div className="md:col-span-1">
                <Label>Invoice Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={invoiceFormData.invoice_date}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, invoice_date: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Label>Due Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={invoiceFormData.due_date}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, due_date: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Invoice Items <span className="text-red-500">*</span></Label>
                <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {invoiceFormData.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-2 border rounded">
                    <div className="col-span-4">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={item.item_type}
                        onValueChange={(value) => updateInvoiceItem(index, 'item_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="module_addon">Module Addon</SelectItem>
                          <SelectItem value="user_addon">User Addon</SelectItem>
                          <SelectItem value="storage_addon">Storage Addon</SelectItem>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Unit Price"
                        value={item.unit_price}
                        onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm font-semibold">
                        Rs. {(item.quantity * item.unit_price).toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                        disabled={invoiceFormData.items?.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, notes: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>Terms</Label>
                <Textarea
                  value={invoiceFormData.terms}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, terms: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Subtotal: Rs. {calculateInvoiceTotal().toLocaleString()}</p>
                  <p className="text-lg font-semibold mt-2">Total: Rs. {calculateInvoiceTotal().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateInvoiceDialogOpen(false);
                resetInvoiceForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
