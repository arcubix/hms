/**
 * Corporate Organizations Component
 * Manage corporate partners and organizational accounts
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Stethoscope,
  FlaskConical,
  Target,
  Pill,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api, InsuranceOrganization, InsurancePricingItem, PricingItem, CreateInsuranceOrganizationData } from '../../services/api';

interface ProcedurePrice {
  id: number;
  name: string;
  price: number;
  active: boolean;
  category: 'procedure' | 'laboratory' | 'radiology' | 'pharmacy';
  item_id: number;
}

export function CorporateOrganizations() {
  const [organizations, setOrganizations] = useState<InsuranceOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<InsuranceOrganization | null>(null);
  const [activePricingTab, setActivePricingTab] = useState('procedures');
  const [procedurePrices, setProcedurePrices] = useState<ProcedurePrice[]>([]);
  const [insuranceType, setInsuranceType] = useState<'insurance' | 'organization'>('organization');
  const [availableItems, setAvailableItems] = useState<{ [key: string]: PricingItem[] }>({
    procedure: [],
    laboratory: [],
    radiology: [],
    pharmacy: []
  });
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    accountPrefix: '',
    contactPerson: '',
    phone: '',
    email: '',
    discountRate: '',
    status: 'active' as 'active' | 'inactive',
    creditAllowance: ''
  });

  // Load organizations on mount
  useEffect(() => {
    loadOrganizations();
    loadAvailableItems();
  }, []);

  // Load pricing items when dialog opens
  useEffect(() => {
    if (isAddDialogOpen && !editingOrganization && Object.keys(availableItems).length > 0 && Object.values(availableItems).some(arr => arr.length > 0)) {
      initializePricingFromAvailableItems();
    } else if (isAddDialogOpen && editingOrganization) {
      loadPricingData(editingOrganization.id);
    }
  }, [isAddDialogOpen, editingOrganization, availableItems]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await api.getInsuranceOrganizations({ type: 'organization' });
      setOrganizations(data);
    } catch (error: any) {
      toast.error('Failed to load organizations: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      const [procedures, laboratory, radiology, pharmacy] = await Promise.all([
        api.getProceduresForPricing(),
        api.getLabTestsForPricing(),
        api.getRadiologyTestsForPricing(),
        api.getMedicinesForPricing()
      ]);
      
      setAvailableItems({
        procedure: procedures,
        laboratory: laboratory,
        radiology: radiology,
        pharmacy: pharmacy
      });
    } catch (error: any) {
      toast.error('Failed to load pricing items: ' + (error.message || 'Unknown error'));
    }
  };

  const initializePricingFromAvailableItems = () => {
    const allItems: ProcedurePrice[] = [];
    
    availableItems.procedure.forEach(item => {
      allItems.push({
        id: item.id,
        name: item.name,
        price: item.default_price,
        active: false,
        category: 'procedure',
        item_id: item.id
      });
    });
    
    availableItems.laboratory.forEach(item => {
      allItems.push({
        id: item.id,
        name: item.name,
        price: item.default_price,
        active: false,
        category: 'laboratory',
        item_id: item.id
      });
    });
    
    availableItems.radiology.forEach(item => {
      allItems.push({
        id: item.id,
        name: item.name,
        price: item.default_price,
        active: false,
        category: 'radiology',
        item_id: item.id
      });
    });
    
    availableItems.pharmacy.forEach(item => {
      allItems.push({
        id: item.id,
        name: item.name,
        price: item.default_price,
        active: false,
        category: 'pharmacy',
        item_id: item.id
      });
    });
    
    setProcedurePrices(allItems);
  };

  const loadPricingData = async (organizationId: number) => {
    try {
      setLoadingPricing(true);
      const pricingData = await api.getInsurancePricing(organizationId);
      
      // Merge with available items
      const allItems: ProcedurePrice[] = [];
      
      availableItems.procedure.forEach(item => {
        const existing = pricingData.procedure.find(p => p.item_id === item.id);
        allItems.push({
          id: item.id,
          name: item.name,
          price: existing ? existing.price : item.default_price,
          active: existing ? existing.active : false,
          category: 'procedure',
          item_id: item.id
        });
      });
      
      availableItems.laboratory.forEach(item => {
        const existing = pricingData.laboratory.find(p => p.item_id === item.id);
        allItems.push({
          id: item.id,
          name: item.name,
          price: existing ? existing.price : item.default_price,
          active: existing ? existing.active : false,
          category: 'laboratory',
          item_id: item.id
        });
      });
      
      availableItems.radiology.forEach(item => {
        const existing = pricingData.radiology.find(p => p.item_id === item.id);
        allItems.push({
          id: item.id,
          name: item.name,
          price: existing ? existing.price : item.default_price,
          active: existing ? existing.active : false,
          category: 'radiology',
          item_id: item.id
        });
      });
      
      availableItems.pharmacy.forEach(item => {
        const existing = pricingData.pharmacy.find(p => p.item_id === item.id);
        allItems.push({
          id: item.id,
          name: item.name,
          price: existing ? existing.price : item.default_price,
          active: existing ? existing.active : false,
          category: 'pharmacy',
          item_id: item.id
        });
      });
      
      setProcedurePrices(allItems);
    } catch (error: any) {
      toast.error('Failed to load pricing data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingPricing(false);
    }
  };

  const handlePriceChange = (id: number, price: number) => {
    setProcedurePrices(prev => 
      prev.map(p => p.id === id ? { ...p, price } : p)
    );
  };

  const handleActiveToggle = (id: number) => {
    setProcedurePrices(prev => 
      prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
    );
  };

  const handlePreviewPDF = () => {
    toast.info('PDF preview functionality coming soon');
  };

  const handleEdit = (organization: InsuranceOrganization) => {
    setEditingOrganization(organization);
    setInsuranceType(organization.type);
    setFormData({
      name: organization.name,
      accountPrefix: organization.account_prefix || '',
      contactPerson: organization.contact_person,
      phone: organization.phone,
      email: organization.email,
      discountRate: organization.discount_rate?.toString() || '',
      status: organization.status,
      creditAllowance: organization.credit_allowance?.toString() || ''
    });
    setValidationErrors({});
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this organization?')) {
      return;
    }
    
    try {
      await api.deleteInsuranceOrganization(id);
      toast.success('Organization deleted successfully');
      loadOrganizations();
    } catch (error: any) {
      toast.error('Failed to delete organization: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSave = async () => {
    // Validate required fields
    const errors: { [key: string]: boolean } = {};
    let missingFields: string[] = [];

    if (!formData.name?.trim()) {
      errors.name = true;
      missingFields.push('Name');
    }
    if (!formData.accountPrefix?.trim()) {
      errors.accountPrefix = true;
      missingFields.push('Account Prefix');
    }
    if (!formData.contactPerson?.trim()) {
      errors.contactPerson = true;
      missingFields.push('Contact Person');
    }
    if (!formData.phone?.trim()) {
      errors.phone = true;
      missingFields.push('Phone');
    }
    if (!formData.email?.trim()) {
      errors.email = true;
      missingFields.push('Email');
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Clear validation errors if all fields are valid
    setValidationErrors({});

    try {
      setLoading(true);
      
      const organizationData: CreateInsuranceOrganizationData = {
        name: formData.name,
        type: insuranceType,
        account_prefix: formData.accountPrefix,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        credit_allowance: formData.creditAllowance ? parseFloat(formData.creditAllowance) : undefined,
        discount_rate: formData.discountRate ? parseFloat(formData.discountRate) : undefined,
        status: formData.status
      };

      let savedOrganization: InsuranceOrganization;
      
      if (editingOrganization) {
        savedOrganization = await api.updateInsuranceOrganization(editingOrganization.id, organizationData);
        toast.success('Organization updated successfully!');
      } else {
        savedOrganization = await api.createInsuranceOrganization(organizationData);
        toast.success('Organization added successfully!');
      }

      // Save pricing configuration
      const pricingItems: InsurancePricingItem[] = procedurePrices
        .filter(p => p.active)
        .map(p => ({
          insurance_organization_id: savedOrganization.id,
          item_type: p.category,
          item_id: p.item_id,
          item_name: p.name,
          price: p.price,
          active: p.active
        }));

      if (pricingItems.length > 0) {
        await api.updateInsurancePricing(savedOrganization.id, { pricing: pricingItems });
      }

      // Reset form and reload
      setIsAddDialogOpen(false);
      setEditingOrganization(null);
      setFormData({
        name: '',
        accountPrefix: '',
        contactPerson: '',
        phone: '',
        email: '',
        discountRate: '',
        status: 'active',
        creditAllowance: ''
      });
      setProcedurePrices([]);
      setValidationErrors({});
      loadOrganizations();
    } catch (error: any) {
      toast.error('Failed to save organization: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setEditingOrganization(null);
    setFormData({
      name: '',
      accountPrefix: '',
      contactPerson: '',
      phone: '',
      email: '',
      discountRate: '',
      status: 'active',
      creditAllowance: ''
    });
    setProcedurePrices([]);
    setValidationErrors({});
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      // Clear validation errors when dialog closes
      setValidationErrors({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Corporate Organizations</h2>
          <p className="text-sm text-gray-600 mt-1">Manage corporate partners and organizational accounts</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOrganization ? 'Edit' : 'Add'} {insuranceType === 'insurance' ? 'Insurance' : 'Organization'}</DialogTitle>
              <DialogDescription>
                Configure pricing for procedures, laboratory tests, radiology, and pharmacy items for this {insuranceType === 'insurance' ? 'insurance company' : 'organization'}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (validationErrors.name) {
                        setValidationErrors({ ...validationErrors, name: false });
                      }
                    }}
                    placeholder="EFU"
                    className={`mt-2 ${validationErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">Name is required</p>
                  )}
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={insuranceType} onValueChange={(value: 'insurance' | 'organization') => setInsuranceType(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Credit Allowance</Label>
                  <Input 
                    type="number"
                    value={formData.creditAllowance}
                    onChange={(e) => setFormData({ ...formData, creditAllowance: e.target.value })}
                    placeholder="10000"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Additional Required Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Prefix <span className="text-red-500">*</span></Label>
                  <Input 
                    value={formData.accountPrefix}
                    onChange={(e) => {
                      setFormData({ ...formData, accountPrefix: e.target.value.toUpperCase() });
                      if (validationErrors.accountPrefix) {
                        setValidationErrors({ ...validationErrors, accountPrefix: false });
                      }
                    }}
                    placeholder="e.g., EFU, BCBS"
                    className={`mt-2 ${validationErrors.accountPrefix ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {validationErrors.accountPrefix && (
                    <p className="text-red-500 text-xs mt-1">Account Prefix is required</p>
                  )}
                </div>
                <div>
                  <Label>Contact Person <span className="text-red-500">*</span></Label>
                  <Input 
                    value={formData.contactPerson}
                    onChange={(e) => {
                      setFormData({ ...formData, contactPerson: e.target.value });
                      if (validationErrors.contactPerson) {
                        setValidationErrors({ ...validationErrors, contactPerson: false });
                      }
                    }}
                    placeholder="Enter contact person name"
                    className={`mt-2 ${validationErrors.contactPerson ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {validationErrors.contactPerson && (
                    <p className="text-red-500 text-xs mt-1">Contact Person is required</p>
                  )}
                </div>
                <div>
                  <Label>Phone Number <span className="text-red-500">*</span></Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (validationErrors.phone) {
                        setValidationErrors({ ...validationErrors, phone: false });
                      }
                    }}
                    placeholder="+1-555-0000"
                    className={`mt-2 ${validationErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">Phone Number is required</p>
                  )}
                </div>
                <div>
                  <Label>Email Address <span className="text-red-500">*</span></Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: false });
                      }
                    }}
                    placeholder="organization@email.com"
                    className={`mt-2 ${validationErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">Email Address is required</p>
                  )}
                </div>
              </div>

              {/* Pricing Tabs */}
              <Tabs value={activePricingTab} onValueChange={setActivePricingTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="procedures">📋 Procedures</TabsTrigger>
                  <TabsTrigger value="laboratory">🧪 Laboratory</TabsTrigger>
                  <TabsTrigger value="radiology">🏥 Radiology</TabsTrigger>
                  <TabsTrigger value="pharmacy">💊 Pharmacy</TabsTrigger>
                </TabsList>

                {/* Warning Message */}
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-sm">
                    To reflect all the prices in Invoice, Please try switching all tabs, i.e. Laboratory, Radiology, Pharmacy and then click Add.
                  </AlertDescription>
                </Alert>

                {/* Procedures Tab */}
                <TabsContent value="procedures" className="mt-4">
                  <div className="border rounded-lg overflow-hidden w-full">
                    <div className="bg-gray-50 px-4 py-3 border-b flex gap-4 sticky top-0 z-10 w-full">
                      <div className="flex-[5] font-medium text-sm min-w-0">PROCEDURE NAME</div>
                      <div className="flex-[2] font-medium text-sm min-w-[150px]">PRICE</div>
                      <div className="flex-[2] font-medium text-sm text-right min-w-[180px]">ACTION</div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto w-full">
                      {loadingPricing ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : procedurePrices.filter(p => p.category === 'procedure').length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">No procedures available</div>
                      ) : (
                        procedurePrices.filter(p => p.category === 'procedure').map((proc) => (
                          <div key={proc.id} className="px-4 py-3 border-b flex gap-4 items-center hover:bg-gray-50 w-full">
                            <div className="flex-[5] text-sm truncate min-w-0">{proc.name}</div>
                            <div className="flex-[2] min-w-[150px]">
                              <Input 
                                type="number"
                                value={proc.price}
                                onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                className="h-8 w-full"
                                disabled={!proc.active}
                              />
                            </div>
                            <div className="flex-[2] flex items-center justify-end gap-2 min-w-[180px]">
                              <Switch 
                                checked={proc.active}
                                onCheckedChange={() => handleActiveToggle(proc.id)}
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap">{proc.active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Laboratory Tab */}
                <TabsContent value="laboratory" className="mt-4">
                  <div className="border rounded-lg overflow-hidden flex flex-col w-full" style={{ maxHeight: '600px' }}>
                    <div className="bg-gray-50 px-4 py-3 border-b flex gap-4 flex-shrink-0 w-full">
                      <div className="flex-[5] font-medium text-sm min-w-0">TEST NAME</div>
                      <div className="flex-[2] font-medium text-sm min-w-[150px]">PRICE</div>
                      <div className="flex-[2] font-medium text-sm text-right min-w-[180px]">ACTION</div>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full" style={{ maxHeight: '550px', height: '550px' }}>
                      {loadingPricing ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : procedurePrices.filter(p => p.category === 'laboratory').length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">No laboratory tests available</div>
                      ) : (
                        procedurePrices.filter(p => p.category === 'laboratory').map((proc) => (
                          <div key={proc.id} className="px-4 py-3 border-b flex gap-4 items-center hover:bg-gray-50 w-full">
                            <div className="flex-[5] text-sm truncate min-w-0">{proc.name}</div>
                            <div className="flex-[2] min-w-[150px]">
                              <Input 
                                type="number"
                                value={proc.price}
                                onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                className="h-8 w-full"
                                disabled={!proc.active}
                              />
                            </div>
                            <div className="flex-[2] flex items-center justify-end gap-2 min-w-[180px]">
                              <Switch 
                                checked={proc.active}
                                onCheckedChange={() => handleActiveToggle(proc.id)}
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap">{proc.active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Radiology Tab */}
                <TabsContent value="radiology" className="mt-4">
                  <div className="border rounded-lg overflow-hidden flex flex-col w-full" style={{ maxHeight: '600px' }}>
                    <div className="bg-gray-50 px-4 py-3 border-b flex gap-4 flex-shrink-0 w-full">
                      <div className="flex-[5] font-medium text-sm min-w-0">IMAGING NAME</div>
                      <div className="flex-[2] font-medium text-sm min-w-[150px]">PRICE</div>
                      <div className="flex-[2] font-medium text-sm text-right min-w-[180px]">ACTION</div>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full" style={{ maxHeight: '550px', height: '550px' }}>
                      {loadingPricing ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : procedurePrices.filter(p => p.category === 'radiology').length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">No radiology tests available</div>
                      ) : (
                        procedurePrices.filter(p => p.category === 'radiology').map((proc) => (
                          <div key={proc.id} className="px-4 py-3 border-b flex gap-4 items-center hover:bg-gray-50 w-full">
                            <div className="flex-[5] text-sm truncate min-w-0">{proc.name}</div>
                            <div className="flex-[2] min-w-[150px]">
                              <Input 
                                type="number"
                                value={proc.price}
                                onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                className="h-8 w-full"
                                disabled={!proc.active}
                              />
                            </div>
                            <div className="flex-[2] flex items-center justify-end gap-2 min-w-[180px]">
                              <Switch 
                                checked={proc.active}
                                onCheckedChange={() => handleActiveToggle(proc.id)}
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap">{proc.active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Pharmacy Tab */}
                <TabsContent value="pharmacy" className="mt-4">
                  <div className="border rounded-lg overflow-hidden flex flex-col w-full" style={{ maxHeight: '600px' }}>
                    <div className="bg-gray-50 px-4 py-3 border-b flex gap-4 flex-shrink-0 w-full">
                      <div className="flex-[5] font-medium text-sm min-w-0">MEDICINE NAME</div>
                      <div className="flex-[2] font-medium text-sm min-w-[150px]">PRICE</div>
                      <div className="flex-[2] font-medium text-sm text-right min-w-[180px]">ACTION</div>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden w-full" style={{ maxHeight: '550px', height: '550px' }}>
                      {loadingPricing ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : procedurePrices.filter(p => p.category === 'pharmacy').length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">No medicines available</div>
                      ) : (
                        procedurePrices.filter(p => p.category === 'pharmacy').map((proc) => (
                          <div key={proc.id} className="px-4 py-3 border-b flex gap-4 items-center hover:bg-gray-50 w-full">
                            <div className="flex-[5] text-sm truncate min-w-0">{proc.name}</div>
                            <div className="flex-[2] min-w-[150px]">
                              <Input 
                                type="number"
                                value={proc.price}
                                onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                className="h-8 w-full"
                                disabled={!proc.active}
                              />
                            </div>
                            <div className="flex-[2] flex items-center justify-end gap-2 min-w-[180px]">
                              <Switch 
                                checked={proc.active}
                                onCheckedChange={() => handleActiveToggle(proc.id)}
                              />
                              <span className="text-xs text-gray-600 whitespace-nowrap">{proc.active ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={handlePreviewPDF}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Preview PDF
                </Button>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700" 
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingOrganization ? 'Update' : 'Add'} {insuranceType === 'insurance' ? 'Insurance' : 'Organization'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Account Prefix</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No organizations found. Click "Add Organization" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell className="font-mono text-sm">{org.account_prefix || '-'}</TableCell>
                      <TableCell>{org.contact_person}</TableCell>
                      <TableCell className="text-sm">{org.phone}</TableCell>
                      <TableCell className="text-sm">{org.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {org.discount_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(org)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(org.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
