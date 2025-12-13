import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  Settings, 
  Plus,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  X,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Calendar,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner@2.0.3';
import type { 
  Organization, 
  Invoice, 
  Payment, 
  SubscriptionPlan, 
  CreateOrganizationData,
  CreateInvoiceData,
  CreatePaymentData,
  InvoiceItem,
  BillingSettings
} from '../../types/billing';
import { InvoiceDetail } from './InvoiceDetail';

export function SoftwareBilling() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isAddOrgDialogOpen, setIsAddOrgDialogOpen] = useState(false);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isRecordPaymentDialogOpen, setIsRecordPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Invoice detail view - use hash routing
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  
  // Debug: Log dialog state changes
  useEffect(() => {
    console.log('🔍 isCreateInvoiceDialogOpen state changed to:', isCreateInvoiceDialogOpen);
  }, [isCreateInvoiceDialogOpen]);
  
  // Check hash on mount and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#invoice/')) {
        const invoiceId = parseInt(hash.replace('#invoice/', ''));
        if (!isNaN(invoiceId)) {
          setSelectedInvoiceId(invoiceId);
        }
      } else {
        setSelectedInvoiceId(null);
      }
    };
    
    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Filters
  const [invoiceFilters, setInvoiceFilters] = useState({
    organization_id: '',
    payment_status: 'all',
    search: '',
    dateRange: 'all'
  });
  const [paymentFilters, setPaymentFilters] = useState({
    organization_id: '',
    payment_status: 'all',
    search: ''
  });
  const [orgFilters, setOrgFilters] = useState({
    status: 'all',
    subscription_status: 'all',
    search: ''
  });
  
  // Billing settings
  const [selectedOrgForSettings, setSelectedOrgForSettings] = useState<number | null>(null);
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  
  // Form data
  const [orgFormData, setOrgFormData] = useState<CreateOrganizationData>({
    name: '',
    email: '',
    phone: '',
    organization_type: 'Hospital',
    address: '',
    city: '',
    state: '',
    country: 'Pakistan',
    currency: 'PKR',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_phone: ''
  });
  
  const [invoiceFormData, setInvoiceFormData] = useState<CreateInvoiceData>({
    organization_id: 0,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ item_type: 'other', description: '', quantity: 1, unit_price: 0 }],
    notes: '',
    terms: ''
  });
  
  const [paymentFormData, setPaymentFormData] = useState<CreatePaymentData>({
    invoice_id: 0,
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    transaction_id: '',
    bank_name: '',
    cheque_number: '',
    notes: ''
  });
  
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    overdueInvoices: 0,
    pendingPayments: 0,
    totalBilled: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Helper function to get client initials
  const getClientInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };
  
  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'pending':
      case 'sent':
        return 'outline';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
      case 'sent':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load organizations
      const orgsResponse = await api.getOrganizations();
      if (orgsResponse.success) {
        setOrganizations(orgsResponse.data);
        setStats(prev => ({ ...prev, totalOrganizations: orgsResponse.data.length }));
        
        // Count active subscriptions
        const activeSubs = orgsResponse.data.filter(org => 
          org.subscription_status === 'active' || org.active_subscription?.status === 'active'
        ).length;
        setStats(prev => ({ ...prev, activeSubscriptions: activeSubs }));
      }
      
      // Load invoices
      const invoicesResponse = await api.getInvoices();
      if (invoicesResponse.success) {
        setInvoices(invoicesResponse.data);
        const overdue = invoicesResponse.data.filter(inv => inv.payment_status === 'overdue');
        setStats(prev => ({ ...prev, overdueInvoices: overdue.length }));
        
        // Calculate invoice stats
        const totalBilled = invoicesResponse.data.reduce((sum, inv) => sum + inv.total_amount, 0);
        const paidInvoices = invoicesResponse.data.filter(inv => inv.payment_status === 'paid');
        const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
        const pendingInvoices = invoicesResponse.data.filter(inv => 
          inv.payment_status === 'pending' || inv.payment_status === 'sent'
        );
        const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.due_amount, 0);
        const overdueAmount = overdue.reduce((sum, inv) => sum + inv.due_amount, 0);
        
        setStats(prev => ({ 
          ...prev, 
          totalBilled,
          paidAmount,
          pendingAmount,
          overdueAmount
        }));
      }
      
      // Load payments
      const paymentsResponse = await api.getPayments();
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data);
        const pending = paymentsResponse.data.filter(p => p.payment_status === 'pending');
        setStats(prev => ({ ...prev, pendingPayments: pending.length }));
        
        // Calculate total revenue from completed payments
        const totalRevenue = paymentsResponse.data
          .filter(p => p.payment_status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);
        setStats(prev => ({ ...prev, totalRevenue }));
      }
      
      // Load subscription plans
      const plansResponse = await api.getSubscriptionPlans({ is_active: true });
      if (plansResponse.success) {
        setPlans(plansResponse.data);
      }
      
    } catch (error: any) {
      console.error('Failed to load billing data:', error);
      toast.error('Failed to load billing data', {
        description: error?.message || 'Please refresh and try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadInvoices = async () => {
    try {
      const filters: any = {};
      if (invoiceFilters.organization_id) filters.organization_id = parseInt(invoiceFilters.organization_id);
      if (invoiceFilters.payment_status !== 'all') filters.payment_status = invoiceFilters.payment_status;
      if (invoiceFilters.search) filters.search = invoiceFilters.search;
      
      const response = await api.getInvoices(filters);
      if (response.success) {
        setInvoices(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load invoices', { description: error?.message });
    }
  };
  
  const loadPayments = async () => {
    try {
      const filters: any = {};
      if (paymentFilters.organization_id) filters.organization_id = parseInt(paymentFilters.organization_id);
      if (paymentFilters.payment_status !== 'all') filters.payment_status = paymentFilters.payment_status;
      if (paymentFilters.search) filters.search = paymentFilters.search;
      
      const response = await api.getPayments(filters);
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load payments', { description: error?.message });
    }
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
        invoice_type: 'manual' as any,
      };
      
      const response = await api.createInvoice(invoiceData);
      
      if (response.success) {
        toast.success('Invoice created successfully');
        setIsCreateInvoiceDialogOpen(false);
        setInvoiceFormData({
          organization_id: 0,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{ item_type: 'other', description: '', quantity: 1, unit_price: 0 }],
          notes: '',
          terms: ''
        });
        loadData();
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
  
  const handleRecordPayment = async () => {
    if (!paymentFormData.invoice_id || paymentFormData.amount <= 0) {
      toast.error('Please select an invoice and enter a valid amount');
      return;
    }
    
    // Get invoice to validate amount
    try {
      const invoiceResponse = await api.getInvoice(paymentFormData.invoice_id);
      if (invoiceResponse.success) {
        const invoice = invoiceResponse.data;
        if (paymentFormData.amount > invoice.due_amount) {
          toast.error(`Payment amount cannot exceed due amount (Rs. ${invoice.due_amount.toLocaleString()})`);
          return;
        }
      }
    } catch (error: any) {
      toast.error('Failed to validate invoice', { description: error?.message });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await api.createPayment(paymentFormData);
      
      if (response.success) {
        toast.success('Payment recorded successfully');
        setIsRecordPaymentDialogOpen(false);
        setPaymentFormData({
          invoice_id: 0,
          amount: 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'bank_transfer',
          transaction_id: '',
          bank_name: '',
          cheque_number: '',
          notes: ''
        });
        loadData();
      } else {
        toast.error('Failed to record payment');
      }
    } catch (error: any) {
      toast.error('Failed to record payment', { description: error?.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendInvoice = async (invoiceId: number) => {
    try {
      const response = await api.sendInvoice(invoiceId);
      if (response.success) {
        toast.success('Invoice sent successfully');
        loadData();
      } else {
        toast.error('Failed to send invoice');
      }
    } catch (error: any) {
      toast.error('Failed to send invoice', { description: error?.message });
    }
  };
  
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
  
  const loadBillingSettings = async (orgId: number) => {
    try {
      setIsLoadingSettings(true);
      const response = await api.getBillingSettings(orgId);
      if (response.success) {
        setBillingSettings(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load billing settings', { description: error?.message });
    } finally {
      setIsLoadingSettings(false);
    }
  };
  
  const handleSaveBillingSettings = async () => {
    if (!selectedOrgForSettings || !billingSettings) {
      toast.error('Please select an organization');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await api.updateBillingSettings(selectedOrgForSettings, billingSettings);
      if (response.success) {
        toast.success('Billing settings updated successfully');
        setBillingSettings(response.data);
      } else {
        toast.error('Failed to update billing settings');
      }
    } catch (error: any) {
      toast.error('Failed to update billing settings', { description: error?.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'invoices') {
      loadInvoices();
    }
  }, [invoiceFilters, activeTab]);
  
  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [paymentFilters, activeTab]);
  
  useEffect(() => {
    if (selectedOrgForSettings) {
      loadBillingSettings(selectedOrgForSettings);
    }
  }, [selectedOrgForSettings]);

  // Navigate to invoice detail using hash
  const navigateToInvoice = (invoiceId: number) => {
    window.location.hash = `#invoice/${invoiceId}`;
  };
  
  // Show invoice detail view if hash is set
  if (selectedInvoiceId) {
    return (
      <InvoiceDetail 
        invoiceId={selectedInvoiceId.toString()} 
        onBack={() => {
          // Clear hash to go back to billing list
          window.location.hash = '';
          setSelectedInvoiceId(null);
          loadData();
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  const filteredInvoices = invoices.filter(inv => {
    if (invoiceFilters.organization_id && inv.organization_id !== parseInt(invoiceFilters.organization_id)) return false;
    if (invoiceFilters.payment_status !== 'all' && inv.payment_status !== invoiceFilters.payment_status) return false;
    if (invoiceFilters.search) {
      const search = invoiceFilters.search.toLowerCase();
      if (!inv.invoice_number.toLowerCase().includes(search) && 
          !inv.organization_name?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  const filteredPayments = payments.filter(pay => {
    if (paymentFilters.organization_id && pay.organization_id !== parseInt(paymentFilters.organization_id)) return false;
    if (paymentFilters.payment_status !== 'all' && pay.payment_status !== paymentFilters.payment_status) return false;
    if (paymentFilters.search) {
      const search = paymentFilters.search.toLowerCase();
      if (!pay.payment_number.toLowerCase().includes(search) && 
          !pay.invoice_number?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  const filteredOrganizations = organizations.filter(org => {
    if (orgFilters.status !== 'all' && org.status !== orgFilters.status) return false;
    if (orgFilters.subscription_status !== 'all' && org.subscription_status !== orgFilters.subscription_status) return false;
    if (orgFilters.search) {
      const search = orgFilters.search.toLowerCase();
      if (!org.name.toLowerCase().includes(search) && 
          !org.email.toLowerCase().includes(search) &&
          !org.organization_code.toLowerCase().includes(search)) return false;
    }
    return true;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
  
  // Get organization email for display
  const getOrganizationEmail = (orgId: number) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.email || '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  Software Billing & Invoices
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and track all software license invoices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  console.log('Create Invoice button clicked');
                  console.log('Current dialog state:', isCreateInvoiceDialogOpen);
                  setIsCreateInvoiceDialogOpen(true);
                  console.log('Dialog state set to true');
                }} 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Billed</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalBilled)}</p>
                  <p className="text-xs text-gray-500 mt-1">{invoices.length} invoices</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{invoices.filter(inv => inv.payment_status === 'paid').length} paid</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{invoices.filter(inv => inv.payment_status === 'pending' || inv.payment_status === 'sent').length} pending</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overdue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.overdueAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.overdueInvoices} overdue</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="shadow-sm border border-gray-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Invoices</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by invoice number, cli..."
                    value={invoiceFilters.search}
                    onChange={(e) => setInvoiceFilters({...invoiceFilters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <Select 
                  value={invoiceFilters.payment_status} 
                  onValueChange={(value) => setInvoiceFilters({...invoiceFilters, payment_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                <Select 
                  value={invoiceFilters.dateRange} 
                  onValueChange={(value) => setInvoiceFilters({...invoiceFilters, dateRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
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

        {/* Invoice Table */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">INVOICE</TableHead>
                    <TableHead className="font-semibold">CLIENT</TableHead>
                    <TableHead className="font-semibold">DATE</TableHead>
                    <TableHead className="font-semibold">DUE DATE</TableHead>
                    <TableHead className="font-semibold text-right">AMOUNT</TableHead>
                    <TableHead className="font-semibold text-right">PAID</TableHead>
                    <TableHead className="font-semibold text-right">BALANCE</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                    <TableHead className="font-semibold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInvoices.map((invoice) => {
                      const paidAmount = invoice.total_amount - invoice.due_amount;
                      const orgEmail = getOrganizationEmail(invoice.organization_id);
                      
                      return (
                        <TableRow 
                          key={invoice.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigateToInvoice(invoice.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{invoice.invoice_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {getClientInitials(invoice.organization_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{invoice.organization_name}</p>
                                <p className="text-xs text-gray-500">{orgEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(invoice.invoice_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(invoice.due_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </TableCell>
                          <TableCell className={`text-right ${paidAmount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {formatCurrency(paidAmount)}
                          </TableCell>
                          <TableCell className={`text-right ${invoice.due_amount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {formatCurrency(invoice.due_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusBadgeVariant(invoice.payment_status)}
                              className="flex items-center gap-1 w-fit"
                            >
                              {getStatusIcon(invoice.payment_status)}
                              {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToInvoice(invoice.id);
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {filteredInvoices.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} invoices
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="min-w-[40px]"
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
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Invoice Dialog */}
        <Dialog 
          open={isCreateInvoiceDialogOpen} 
          onOpenChange={(open) => {
            console.log('🔍 Dialog onOpenChange called with:', open);
            console.log('🔍 Current isCreateInvoiceDialogOpen state before update:', isCreateInvoiceDialogOpen);
            setIsCreateInvoiceDialogOpen(open);
            console.log('🔍 Dialog state updated to:', open);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice for an organization.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Organization <span className="text-red-500">*</span></Label>
                  <Select 
                    value={invoiceFormData.organization_id.toString()} 
                    onValueChange={(value) => setInvoiceFormData({...invoiceFormData, organization_id: parseInt(value)})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Invoice Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={invoiceFormData.invoice_date}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, invoice_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
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
                onClick={() => setIsCreateInvoiceDialogOpen(false)}
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

        {/* Record Payment Dialog */}
        <Dialog open={isRecordPaymentDialogOpen} onOpenChange={setIsRecordPaymentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment against an invoice.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Invoice <span className="text-red-500">*</span></Label>
                <Select 
                  value={paymentFormData.invoice_id.toString()} 
                  onValueChange={async (value) => {
                    const invoiceId = parseInt(value);
                    setPaymentFormData({...paymentFormData, invoice_id: invoiceId});
                    
                    // Load invoice to get due amount
                    try {
                      const response = await api.getInvoice(invoiceId);
                      if (response.success) {
                        setPaymentFormData({
                          ...paymentFormData,
                          invoice_id: invoiceId,
                          amount: response.data.due_amount
                        });
                      }
                    } catch (error) {
                      console.error('Failed to load invoice:', error);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices
                      .filter(inv => inv.due_amount > 0)
                      .map(inv => (
                        <SelectItem key={inv.id} value={inv.id.toString()}>
                          {inv.invoice_number} - {inv.organization_name} (Due: Rs. {inv.due_amount.toLocaleString()})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Amount <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({...paymentFormData, amount: parseFloat(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Payment Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={paymentFormData.payment_date}
                    onChange={(e) => setPaymentFormData({...paymentFormData, payment_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Payment Method <span className="text-red-500">*</span></Label>
                  <Select 
                    value={paymentFormData.payment_method} 
                    onValueChange={(value: any) => setPaymentFormData({...paymentFormData, payment_method: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transaction ID</Label>
                  <Input
                    value={paymentFormData.transaction_id}
                    onChange={(e) => setPaymentFormData({...paymentFormData, transaction_id: e.target.value})}
                    className="mt-1"
                    placeholder="Optional"
                  />
                </div>
                {paymentFormData.payment_method === 'bank_transfer' && (
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={paymentFormData.bank_name}
                      onChange={(e) => setPaymentFormData({...paymentFormData, bank_name: e.target.value})}
                      className="mt-1"
                      placeholder="Optional"
                    />
                  </div>
                )}
                {paymentFormData.payment_method === 'cheque' && (
                  <div>
                    <Label>Cheque Number</Label>
                    <Input
                      value={paymentFormData.cheque_number}
                      onChange={(e) => setPaymentFormData({...paymentFormData, cheque_number: e.target.value})}
                      className="mt-1"
                      placeholder="Optional"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                  className="mt-1"
                  rows={3}
                  placeholder="Optional payment notes"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsRecordPaymentDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRecordPayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Organization Dialog */}
        <Dialog open={isAddOrgDialogOpen} onOpenChange={setIsAddOrgDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Create a new organization and its default admin user account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={orgFormData.name}
                      onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                      placeholder="Hospital Name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Organization Type</Label>
                    <Select 
                      value={orgFormData.organization_type} 
                      onValueChange={(value: any) => setOrgFormData({ ...orgFormData, organization_type: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Clinic">Clinic</SelectItem>
                        <SelectItem value="Medical Center">Medical Center</SelectItem>
                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="Laboratory">Laboratory</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={orgFormData.email}
                      onChange={(e) => setOrgFormData({ ...orgFormData, email: e.target.value })}
                      placeholder="organization@example.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Phone <span className="text-red-500">*</span></Label>
                    <Input
                      value={orgFormData.phone}
                      onChange={(e) => setOrgFormData({ ...orgFormData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={orgFormData.address}
                      onChange={(e) => setOrgFormData({ ...orgFormData, address: e.target.value })}
                      placeholder="Street Address"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>City</Label>
                    <Input
                      value={orgFormData.city}
                      onChange={(e) => setOrgFormData({ ...orgFormData, city: e.target.value })}
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>State</Label>
                    <Input
                      value={orgFormData.state}
                      onChange={(e) => setOrgFormData({ ...orgFormData, state: e.target.value })}
                      placeholder="State/Province"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={orgFormData.country}
                      onChange={(e) => setOrgFormData({ ...orgFormData, country: e.target.value })}
                      placeholder="Country"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Admin User Information */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Default Admin User
                </h3>
                <p className="text-sm text-gray-600">
                  Create the default administrator account for this organization.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Admin Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={orgFormData.admin_name}
                      onChange={(e) => setOrgFormData({ ...orgFormData, admin_name: e.target.value })}
                      placeholder="Admin Full Name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Admin Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={orgFormData.admin_email}
                      onChange={(e) => setOrgFormData({ ...orgFormData, admin_email: e.target.value })}
                      placeholder="admin@example.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Admin Password <span className="text-red-500">*</span></Label>
                    <Input
                      type="password"
                      value={orgFormData.admin_password}
                      onChange={(e) => setOrgFormData({ ...orgFormData, admin_password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Admin Phone</Label>
                    <Input
                      value={orgFormData.admin_phone}
                      onChange={(e) => setOrgFormData({ ...orgFormData, admin_phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddOrgDialogOpen(false);
                  setOrgFormData({
                    name: '',
                    email: '',
                    phone: '',
                    organization_type: 'Hospital',
                    address: '',
                    city: '',
                    state: '',
                    country: 'Pakistan',
                    currency: 'PKR',
                    admin_name: '',
                    admin_email: '',
                    admin_password: '',
                    admin_phone: ''
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  // Validation
                  if (!orgFormData.name || !orgFormData.email || !orgFormData.phone) {
                    toast.error('Please fill in all required organization fields');
                    return;
                  }
                  
                  if (!orgFormData.admin_name || !orgFormData.admin_email || !orgFormData.admin_password) {
                    toast.error('Please fill in all required admin user fields');
                    return;
                  }
                  
                  if (orgFormData.admin_password.length < 6) {
                    toast.error('Admin password must be at least 6 characters');
                    return;
                  }
                  
                  try {
                    setIsSubmitting(true);
                    const response = await api.createOrganization(orgFormData);
                    
                    if (response.success) {
                      toast.success('Organization created successfully', {
                        description: `Organization "${orgFormData.name}" and admin user "${orgFormData.admin_name}" have been created.`
                      });
                      
                      setIsAddOrgDialogOpen(false);
                      setOrgFormData({
                        name: '',
                        email: '',
                        phone: '',
                        organization_type: 'Hospital',
                        address: '',
                        city: '',
                        state: '',
                        country: 'Pakistan',
                        currency: 'PKR',
                        admin_name: '',
                        admin_email: '',
                        admin_password: '',
                        admin_phone: ''
                      });
                      
                      // Reload organizations
                      loadData();
                    } else {
                      toast.error('Failed to create organization');
                    }
                  } catch (error: any) {
                    console.error('Error creating organization:', error);
                    toast.error('Failed to create organization', {
                      description: error?.message || 'Please check all fields and try again.'
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Organization'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

