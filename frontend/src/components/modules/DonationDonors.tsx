/**
 * Donation Donors Component
 * Manage hospital donors and donations
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Plus,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Eye,
  Edit,
  Save,
  X,
  Trash2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api, DonationDonor, CreateDonationDonorData, DonationPayment, CreateDonationPaymentData } from '../../services/api';

export function DonationDonors() {
  const [donors, setDonors] = useState<DonationDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDonorDialogOpen, setIsAddDonorDialogOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonationDonor | null>(null);
  const [donorName, setDonorName] = useState('');
  const [donorType, setDonorType] = useState<'individual' | 'corporate'>('individual');
  const [donorCNIC, setDonorCNIC] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorCity, setDonorCity] = useState('');
  const [donorCountry, setDonorCountry] = useState('Pakistan');
  const [donorTotalDonated, setDonorTotalDonated] = useState('');
  const [donorLastDonation, setDonorLastDonation] = useState('');
  const [donorFrequency, setDonorFrequency] = useState<'one-time' | 'monthly' | 'yearly'>('one-time');
  const [donorTaxExempt, setDonorTaxExempt] = useState(false);
  const [donorNotes, setDonorNotes] = useState('');

  // Payment dialog state
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedDonorForPayment, setSelectedDonorForPayment] = useState<DonationDonor | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'cheque' | 'online'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  // View payments dialog state
  const [isViewPaymentsDialogOpen, setIsViewPaymentsDialogOpen] = useState(false);
  const [selectedDonorForPayments, setSelectedDonorForPayments] = useState<DonationDonor | null>(null);
  const [payments, setPayments] = useState<DonationPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Load donors on mount
  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      setLoading(true);
      const data = await api.getDonationDonors();
      setDonors(data);
    } catch (error: any) {
      toast.error('Failed to load donors: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (donor: DonationDonor) => {
    setEditingDonor(donor);
    setDonorName(donor.name);
    setDonorType(donor.type);
    setDonorCNIC(donor.cnic || '');
    setDonorPhone(donor.phone);
    setDonorEmail(donor.email);
    setDonorAddress(donor.address || '');
    setDonorCity(donor.city || '');
    setDonorCountry(donor.country || 'Pakistan');
    setDonorTotalDonated(donor.total_donated?.toString() || '');
    setDonorLastDonation(donor.last_donation || '');
    setDonorFrequency(donor.frequency);
    setDonorTaxExempt(donor.tax_exempt || false);
    setDonorNotes(donor.notes || '');
    setIsAddDonorDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this donor?')) {
      return;
    }
    
    try {
      await api.deleteDonationDonor(id);
      toast.success('Donor deleted successfully');
      loadDonors();
    } catch (error: any) {
      toast.error('Failed to delete donor: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSaveDonor = async () => {
    if (!donorName || !donorPhone || !donorEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const donorData: CreateDonationDonorData = {
        name: donorName,
        type: donorType,
        cnic: donorCNIC || undefined,
        phone: donorPhone,
        email: donorEmail,
        address: donorAddress || undefined,
        city: donorCity || undefined,
        country: donorCountry || 'Pakistan',
        total_donated: donorTotalDonated ? parseFloat(donorTotalDonated) : undefined,
        last_donation: donorLastDonation || undefined,
        frequency: donorFrequency,
        tax_exempt: donorTaxExempt,
        notes: donorNotes || undefined
      };

      if (editingDonor) {
        await api.updateDonationDonor(editingDonor.id, donorData);
        toast.success('Donor updated successfully!');
      } else {
        await api.createDonationDonor(donorData);
        toast.success('Donor added successfully!');
      }

      setIsAddDonorDialogOpen(false);
      handleCancel();
      loadDonors();
    } catch (error: any) {
      toast.error('Failed to save donor: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingDonor(null);
    setDonorName('');
    setDonorType('individual');
    setDonorCNIC('');
    setDonorPhone('');
    setDonorEmail('');
    setDonorAddress('');
    setDonorCity('');
    setDonorCountry('Pakistan');
    setDonorTotalDonated('');
    setDonorLastDonation('');
    setDonorFrequency('one-time');
    setDonorTaxExempt(false);
    setDonorNotes('');
  };

  const handleAddPayment = (donor: DonationDonor) => {
    setSelectedDonorForPayment(donor);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('cash');
    setPaymentNotes('');
    setIsAddPaymentDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!selectedDonorForPayment || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      setLoading(true);
      const paymentData: CreateDonationPaymentData = {
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes: paymentNotes || undefined
      };

      await api.addDonationPayment(selectedDonorForPayment.id, paymentData);
      toast.success('Payment added successfully!');
      setIsAddPaymentDialogOpen(false);
      setSelectedDonorForPayment(null);
      loadDonors();
    } catch (error: any) {
      toast.error('Failed to add payment: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayments = async (donor: DonationDonor) => {
    setSelectedDonorForPayments(donor);
    setIsViewPaymentsDialogOpen(true);
    
    try {
      setLoadingPayments(true);
      const data = await api.getDonationPayments(donor.id);
      setPayments(data);
    } catch (error: any) {
      toast.error('Failed to load payments: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingPayments(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Donation Donors</h2>
          <p className="text-sm text-gray-600 mt-1">Manage hospital donors and donations</p>
        </div>
        <Dialog open={isAddDonorDialogOpen} onOpenChange={setIsAddDonorDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="!w-auto max-w-md sm:!max-w-md max-h-[90vh] overflow-y-auto" style={{ maxWidth: '28rem', width: 'auto' }}>
            <DialogHeader>
              <DialogTitle>{editingDonor ? 'Edit Donor' : 'Add New Donor'}</DialogTitle>
              <DialogDescription>
                {editingDonor ? 'Update donor information' : 'Add a new individual or corporate donor to the system'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Donor Type Selection */}
              <div>
                <Label>Donor Type *</Label>
                <Select value={donorType} onValueChange={(value: 'individual' | 'corporate') => setDonorType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select donor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>{donorType === 'individual' ? 'Full Name' : 'Organization Name'} *</Label>
                    <Input 
                      placeholder={donorType === 'individual' ? 'Enter donor name' : 'Enter organization name'} 
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>

                  {donorType === 'individual' && (
                    <div className="col-span-2">
                      <Label>CNIC / National ID</Label>
                      <Input 
                        placeholder="12345-6789012-3" 
                        value={donorCNIC}
                        onChange={(e) => setDonorCNIC(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Phone Number *</Label>
                    <Input 
                      placeholder="+1-555-0000" 
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Email Address *</Label>
                    <Input 
                      type="email" 
                      placeholder="donor@email.com" 
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Address Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Street Address</Label>
                    <Input 
                      placeholder="Enter street address" 
                      value={donorAddress}
                      onChange={(e) => setDonorAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <Input 
                      placeholder="Enter city" 
                      value={donorCity}
                      onChange={(e) => setDonorCity(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Input 
                      placeholder="Enter country" 
                      value={donorCountry}
                      onChange={(e) => setDonorCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Donation Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Donation Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Donated ($)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={donorTotalDonated}
                      onChange={(e) => setDonorTotalDonated(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Last Donation Date</Label>
                    <Input 
                      type="date" 
                      value={donorLastDonation}
                      onChange={(e) => setDonorLastDonation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Donation Frequency *</Label>
                    <Select value={donorFrequency} onValueChange={(value: 'one-time' | 'monthly' | 'yearly') => setDonorFrequency(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch 
                      checked={donorTaxExempt}
                      onCheckedChange={setDonorTaxExempt}
                    />
                    <Label>Tax Exempt</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Notes */}
              <div>
                <Label>Notes / Comments</Label>
                <Textarea 
                  placeholder="Add any additional notes about this donor..." 
                  rows={3}
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveDonor}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingDonor ? 'Update Donor' : 'Save Donor'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsAddDonorDialogOpen(false);
                    handleCancel();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : donors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No donors found. Click "Add Donor" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {donors.map((donor) => (
            <Card key={donor.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    {donor.type === 'individual' ? (
                      <User className="w-6 h-6 text-red-600" />
                    ) : (
                      <Building2 className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {donor.type}
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg mb-1">{donor.name}</h3>
                <p className="text-xs text-gray-600 mb-4">Donor ID: {donor.donor_id}</p>

                <div className="space-y-2 mb-4">
                  {donor.cnic && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-mono text-xs">{donor.cnic}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{donor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 text-xs">{donor.email}</span>
                  </div>
                  {donor.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700 text-xs">
                        {donor.address}{donor.city ? `, ${donor.city}` : ''}{donor.country ? `, ${donor.country}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Donated</span>
                    <span className="font-bold text-green-600">${donor.total_donated?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Donation</span>
                    <span className="text-sm font-medium">{donor.last_donation || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Frequency</span>
                    <Badge className="bg-blue-100 text-blue-800 capitalize text-xs">
                      {donor.frequency === 'one-time' ? 'One-Time' : donor.frequency === 'monthly' ? 'Monthly' : 'Yearly'}
                    </Badge>
                  </div>
                  {donor.tax_exempt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tax Status</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Tax Exempt
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4 mt-4 border-t">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAddPayment(donor)}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Add Amount
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 bg-white"
                      onClick={() => handleViewPayments(donor)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Payments
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 bg-white"
                      onClick={() => handleEdit(donor)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 bg-white text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(donor.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for {selectedDonorForPayment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount *</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Payment Date *</Label>
              <Input 
                type="date" 
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                placeholder="Add any notes about this payment..." 
                rows={3}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSavePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Payment
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAddPaymentDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Payments Dialog */}
      <Dialog open={isViewPaymentsDialogOpen} onOpenChange={setIsViewPaymentsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              Payment history for {selectedDonorForPayments?.name}
            </DialogDescription>
          </DialogHeader>
          {loadingPayments ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments found for this donor.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b grid grid-cols-6 gap-4 font-medium text-sm">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Method</div>
                  <div>Receipt #</div>
                  <div>Status</div>
                  <div>Notes</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="px-4 py-3 border-b grid grid-cols-6 gap-4 items-center hover:bg-gray-50">
                      <div className="text-sm">{payment.payment_date}</div>
                      <div className="font-medium text-green-600">${payment.amount.toLocaleString()}</div>
                      <div className="text-sm capitalize">{payment.payment_method}</div>
                      <div className="text-sm font-mono">{payment.receipt_number}</div>
                      <div>
                        <Badge className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">{payment.notes || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

