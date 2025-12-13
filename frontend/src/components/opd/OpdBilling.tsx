import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { api, type OpdBill, type CreateOpdBillData, type Patient } from '../../services/api';
import { PaymentDialog } from '../payments/PaymentDialog';
import { Plus, Eye, DollarSign, FileText, Search, RefreshCw, X, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface OpdBillingProps {
  patientId?: number;
  appointmentId?: number;
  consultationId?: number;
}

export function OpdBilling({ patientId, appointmentId, consultationId }: OpdBillingProps) {
  const [bills, setBills] = useState<OpdBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<OpdBill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Bill Dialog States
  const [billPatientId, setBillPatientId] = useState<number | undefined>(patientId);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultationFee, setConsultationFee] = useState<string>('');
  const [labCharges, setLabCharges] = useState<string>('');
  const [radiologyCharges, setRadiologyCharges] = useState<string>('');
  const [medicationCharges, setMedicationCharges] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('');
  const [insuranceCovered, setInsuranceCovered] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBills();
  }, [patientId]);

  useEffect(() => {
    setBillPatientId(patientId);
    if (patientId) {
      // Load patient details if patientId is provided
      loadPatientDetails(patientId);
    }
  }, [patientId]);

  const loadPatientDetails = async (id: number) => {
    try {
      const patient = await api.getPatient(id.toString());
      setSelectedPatient(patient);
    } catch (error) {
      console.error('Failed to load patient:', error);
    }
  };

  // Search patients
  useEffect(() => {
    if (patientSearch && patientSearch.length >= 2) {
      const timer = setTimeout(() => {
        searchPatients();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPatientSearchResults([]);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    if (!patientSearch || patientSearch.length < 2) return;
    
    try {
      setSearchingPatients(true);
      const results = await api.getPatients({ search: patientSearch });
      setPatientSearchResults(results);
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setPatientSearchResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setBillPatientId(patient.id);
    setPatientSearch('');
    setPatientSearchResults([]);
  };

  const loadBills = async () => {
    try {
      setLoading(true);
      if (patientId) {
        const data = await api.getOpdBillsByPatient(patientId);
        setBills(data);
      } else {
        // Load all bills when no patientId is provided
        const data = await api.getOpdBills();
        setBills(data);
      }
    } catch (error: any) {
      toast.error('Failed to load bills: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (!billPatientId) {
      toast.error('Please select a patient');
      return;
    }

    try {
      setSubmitting(true);
      const billData: CreateOpdBillData = {
        patient_id: billPatientId,
        appointment_id: appointmentId,
        consultation_id: consultationId,
        bill_date: new Date().toISOString().split('T')[0],
        consultation_fee: consultationFee ? parseFloat(consultationFee) : undefined,
        lab_charges: labCharges ? parseFloat(labCharges) : undefined,
        radiology_charges: radiologyCharges ? parseFloat(radiologyCharges) : undefined,
        medication_charges: medicationCharges ? parseFloat(medicationCharges) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        discount_percentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
        tax_rate: taxRate ? parseFloat(taxRate) : undefined,
        insurance_covered: insuranceCovered ? parseFloat(insuranceCovered) : undefined,
        notes: notes || undefined,
      };

      await api.createOpdBill(billData);
      toast.success('Bill created successfully');
      setShowCreateDialog(false);
      resetCreateBillForm();
      loadBills();
    } catch (error: any) {
      toast.error('Failed to create bill: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateBillForm = () => {
    setBillPatientId(patientId);
    setSelectedPatient(null);
    setPatientSearch('');
    setConsultationFee('');
    setLabCharges('');
    setRadiologyCharges('');
    setMedicationCharges('');
    setDiscount('');
    setDiscountPercentage('');
    setTaxRate('');
    setInsuranceCovered('');
    setNotes('');
  };

  const handlePayment = (bill: OpdBill) => {
    setSelectedBill(bill);
    setShowPaymentDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBills = bills.filter((bill) =>
    bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OPD Billing</h2>
          <p className="text-gray-600">Manage OPD bills and payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBills} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Bill
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>OPD Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bills found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.bill_number}</TableCell>
                    <TableCell>
                      {new Date(bill.bill_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{bill.patient_name || `Patient #${bill.patient_id}`}</TableCell>
                    <TableCell className="font-semibold">₹{bill.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">₹{bill.paid_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">₹{bill.due_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bill.payment_status)}>
                        {bill.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePayment(bill)}
                          disabled={bill.due_amount <= 0}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pay
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Bill Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          resetCreateBillForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create OPD Bill</DialogTitle>
            <DialogDescription>Create a new bill for patient</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Patient Selection */}
            {!patientId && (
              <div className="space-y-2">
                <Label>Select Patient *</Label>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search patient by name or MR#..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Search Results */}
                  {patientSearch && !selectedPatient && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchingPatients ? (
                        <div className="p-4 text-center">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </div>
                      ) : patientSearchResults.length > 0 ? (
                        patientSearchResults.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-0 flex items-center gap-3"
                          >
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-gray-500">
                                {patient.patient_id || patient.id} • {patient.phone}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : patientSearch.length >= 2 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No patients found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Selected Patient */}
                {selectedPatient && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{selectedPatient.name}</div>
                        <div className="text-sm text-gray-600">
                          MR# {selectedPatient.patient_id || selectedPatient.id}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                        setBillPatientId(undefined);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Bill Charges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Consultation Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lab Charges</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={labCharges}
                  onChange={(e) => setLabCharges(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Radiology Charges</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={radiologyCharges}
                  onChange={(e) => setRadiologyCharges(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Medication Charges</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={medicationCharges}
                  onChange={(e) => setMedicationCharges(e.target.value)}
                />
              </div>
            </div>

            {/* Discount & Tax */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Discount Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate %</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-2">
              <Label>Insurance Covered</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={insuranceCovered}
                onChange={(e) => setInsuranceCovered(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetCreateBillForm();
            }} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateBill} disabled={submitting || !billPatientId}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bill
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      {selectedBill && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          patientId={selectedBill.patient_id}
          billType="opd"
          billId={selectedBill.id}
          totalAmount={selectedBill.total_amount}
          paidAmount={selectedBill.paid_amount}
          dueAmount={selectedBill.due_amount}
          onSuccess={() => {
            loadBills();
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
}

