import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { api, type PatientPayment, type PatientPaymentFilters } from '../../services/api';
import { Search, Download, Printer, Eye, Calendar, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentHistoryProps {
  patientId: number;
  onViewReceipt?: (payment: PatientPayment) => void;
}

export function PaymentHistory({ patientId, onViewReceipt }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PatientPayment[]>([]);
  const [advanceBalance, setAdvanceBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PatientPaymentFilters>({
    bill_type: 'all',
    payment_status: 'all',
    payment_method: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadPayments();
    loadAdvanceBalance();
  }, [patientId, filters, searchQuery, dateFrom, dateTo]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentFilters: PatientPaymentFilters = {
        ...filters,
        search: searchQuery || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };
      const data = await api.getPatientPaymentHistory(patientId, paymentFilters);
      setPayments(data.payments);
      setAdvanceBalance(data.advance_balance);
    } catch (error: any) {
      toast.error('Failed to load payment history: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadAdvanceBalance = async () => {
    try {
      const balance = await api.getPatientAdvanceBalance(patientId);
      setAdvanceBalance(balance);
    } catch (error: any) {
      console.error('Failed to load advance balance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cheque':
        return 'Cheque';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-4">
      {/* Advance Balance Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Available Advance Balance</p>
              <p className="text-2xl font-bold text-blue-700">₹{advanceBalance.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by payment number, receipt number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Bill Type</Label>
              <Select
                value={filters.bill_type || 'all'}
                onValueChange={(value) => setFilters({ ...filters, bill_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ipd">IPD</SelectItem>
                  <SelectItem value="opd">OPD</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.payment_status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, payment_status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadPayments} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No payments found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Bill Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.payment_number}</TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.bill_type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{getMethodLabel(payment.payment_method)}</TableCell>
                    <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.payment_status)}>
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.receipt_number && onViewReceipt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewReceipt(payment)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

