/**
 * Insurance Companies Component
 * Manage insurance companies and policies
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  FileText,
  Users,
  Edit,
  Trash2,
  Save,
  X,
  ChevronRight,
  Eye,
  Building2,
  DollarSign,
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

export function InsuranceCompanies() {
  const [insurances, setInsurances] = useState<InsuranceOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddInsuranceForm, setShowAddInsuranceForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceOrganization | null>(null);
  const [activePricingTab, setActivePricingTab] = useState('procedures');
  const [procedurePrices, setProcedurePrices] = useState<ProcedurePrice[]>([]);
  const [availableItems, setAvailableItems] = useState<{ [key: string]: PricingItem[] }>({
    procedure: [],
    laboratory: [],
    radiology: [],
    pharmacy: []
  });
  const [loadingPricing, setLoadingPricing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    policyPrefix: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    creditAllowance: '',
    discountRate: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
    contractDate: ''
  });

  // Load insurance companies on mount
  useEffect(() => {
    loadInsurances();
    loadAvailableItems();
  }, []);

  // Load pricing items when editing
  useEffect(() => {
    if (editingInsurance) {
      loadPricingData(editingInsurance.id);
    } else if (showAddInsuranceForm && Object.keys(availableItems).length > 0 && Object.values(availableItems).some(arr => arr.length > 0)) {
      // Initialize with available items when adding new
      initializePricingFromAvailableItems();
    }
  }, [editingInsurance, showAddInsuranceForm, availableItems]);

  const loadInsurances = async () => {
    try {
      setLoading(true);
      const data = await api.getInsuranceOrganizations({ type: 'insurance' });
      setInsurances(data);
    } catch (error: any) {
      toast.error('Failed to load insurance companies: ' + (error.message || 'Unknown error'));
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

  const loadPricingData = async (insuranceId: number) => {
    try {
      setLoadingPricing(true);
      const pricingData = await api.getInsurancePricing(insuranceId);
      
      // Merge with available items
      const allItems: ProcedurePrice[] = [];
      
      // Procedures
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
      
      // Laboratory
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
      
      // Radiology
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
      
      // Pharmacy
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

  const handleEdit = (insurance: InsuranceOrganization) => {
    setEditingInsurance(insurance);
    setFormData({
      name: insurance.name,
      policyPrefix: insurance.policy_prefix || '',
      contactPerson: insurance.contact_person,
      phone: insurance.phone,
      email: insurance.email,
      website: insurance.website || '',
      creditAllowance: insurance.credit_allowance?.toString() || '',
      discountRate: insurance.discount_rate?.toString() || '',
      address: insurance.address || '',
      status: insurance.status,
      contractDate: insurance.contract_date || ''
    });
    setShowAddInsuranceForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this insurance company?')) {
      return;
    }
    
    try {
      await api.deleteInsuranceOrganization(id);
      toast.success('Insurance company deleted successfully');
      loadInsurances();
    } catch (error: any) {
      toast.error('Failed to delete insurance company: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.policyPrefix || !formData.contactPerson || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const insuranceData: CreateInsuranceOrganizationData = {
        name: formData.name,
        type: 'insurance',
        policy_prefix: formData.policyPrefix,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
        credit_allowance: formData.creditAllowance ? parseFloat(formData.creditAllowance) : undefined,
        discount_rate: formData.discountRate ? parseFloat(formData.discountRate) : undefined,
        address: formData.address || undefined,
        status: formData.status,
        contract_date: formData.contractDate || undefined
      };

      let savedInsurance: InsuranceOrganization;
      
      if (editingInsurance) {
        savedInsurance = await api.updateInsuranceOrganization(editingInsurance.id, insuranceData);
        toast.success('Insurance company updated successfully!');
      } else {
        savedInsurance = await api.createInsuranceOrganization(insuranceData);
        toast.success('Insurance company added successfully!');
      }

      // Save pricing configuration
      const pricingItems: InsurancePricingItem[] = procedurePrices
        .filter(p => p.active)
        .map(p => ({
          insurance_organization_id: savedInsurance.id,
          item_type: p.category,
          item_id: p.item_id,
          item_name: p.name,
          price: p.price,
          active: p.active
        }));

      if (pricingItems.length > 0) {
        await api.updateInsurancePricing(savedInsurance.id, { pricing: pricingItems });
      }

      // Reset form and reload
      setShowAddInsuranceForm(false);
      setEditingInsurance(null);
      setFormData({
        name: '',
        policyPrefix: '',
        contactPerson: '',
        phone: '',
        email: '',
        website: '',
        creditAllowance: '',
        discountRate: '',
        address: '',
        status: 'active',
        contractDate: ''
      });
      setProcedurePrices([]);
      loadInsurances();
    } catch (error: any) {
      toast.error('Failed to save insurance company: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAddInsuranceForm(false);
    setEditingInsurance(null);
    setFormData({
      name: '',
      policyPrefix: '',
      contactPerson: '',
      phone: '',
      email: '',
      website: '',
      creditAllowance: '',
      discountRate: '',
      address: '',
      status: 'active',
      contractDate: ''
    });
    setProcedurePrices([]);
  };

  // Show add insurance form
  if (showAddInsuranceForm) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to List
            </Button>
            <div>
              <h2 className="text-xl font-semibold">
                {editingInsurance ? 'Edit Insurance Company' : 'Add New Insurance Company'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingInsurance 
                  ? 'Update insurance company information and pricing configuration'
                  : 'Complete all required information to add a new insurance company'}
              </p>
            </div>
          </div>

          {/* Main Form Card */}
          <Card>
          <CardContent className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Insurance Company Name *</Label>
                  <Input 
                    placeholder="Enter company name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Policy Prefix *</Label>
                  <Input 
                    placeholder="e.g., BCBS, UHC" 
                    value={formData.policyPrefix}
                    onChange={(e) => setFormData({ ...formData, policyPrefix: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label>Contact Person *</Label>
                  <Input 
                    placeholder="Enter contact person name" 
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input 
                    placeholder="+1-555-0000" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input 
                    type="email" 
                    placeholder="contact@insurance.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input 
                    type="url" 
                    placeholder="https://www.insurance.com" 
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Credit Allowance Limit</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    value={formData.creditAllowance}
                    onChange={(e) => setFormData({ ...formData, creditAllowance: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount Rate (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="0-100" 
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Textarea 
                    placeholder="Complete address..." 
                    rows={2} 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contract Start Date</Label>
                  <Input 
                    type="date" 
                    value={formData.contractDate}
                    onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Configuration Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Pricing Configuration
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviewPDF}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
              </div>

              {/* Warning Alert */}
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  Configure pricing for all departments. Inactive items will not be available for this insurance company.
                </AlertDescription>
              </Alert>

              {/* Pricing Tabs */}
              <Tabs value={activePricingTab} onValueChange={setActivePricingTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="procedures" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Procedures
                  </TabsTrigger>
                  <TabsTrigger value="laboratory" className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Laboratory
                  </TabsTrigger>
                  <TabsTrigger value="radiology" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Radiology
                  </TabsTrigger>
                  <TabsTrigger value="pharmacy" className="flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Pharmacy
                  </TabsTrigger>
                </TabsList>

                {/* Procedures Tab */}
                <TabsContent value="procedures" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead className="w-12">Active</TableHead>
                              <TableHead>Procedure Name</TableHead>
                              <TableHead className="w-32">Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loadingPricing ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">
                                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : procedurePrices.filter(p => p.category === 'procedure').length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                  No procedures available
                                </TableCell>
                              </TableRow>
                            ) : (
                              procedurePrices.filter(p => p.category === 'procedure').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Laboratory Tab */}
                <TabsContent value="laboratory" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead className="w-12">Active</TableHead>
                              <TableHead>Test Name</TableHead>
                              <TableHead className="w-32">Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loadingPricing ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">
                                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : procedurePrices.filter(p => p.category === 'laboratory').length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                  No laboratory tests available
                                </TableCell>
                              </TableRow>
                            ) : (
                              procedurePrices.filter(p => p.category === 'laboratory').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Radiology Tab */}
                <TabsContent value="radiology" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead className="w-12">Active</TableHead>
                              <TableHead>Scan/Imaging Name</TableHead>
                              <TableHead className="w-32">Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loadingPricing ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">
                                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : procedurePrices.filter(p => p.category === 'radiology').length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                  No radiology tests available
                                </TableCell>
                              </TableRow>
                            ) : (
                              procedurePrices.filter(p => p.category === 'radiology').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pharmacy Tab */}
                <TabsContent value="pharmacy" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow>
                              <TableHead className="w-12">Active</TableHead>
                              <TableHead>Medicine Name</TableHead>
                              <TableHead className="w-32">Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loadingPricing ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8">
                                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                              </TableRow>
                            ) : procedurePrices.filter(p => p.category === 'pharmacy').length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                  No medicines available
                                </TableCell>
                              </TableRow>
                            ) : (
                              procedurePrices.filter(p => p.category === 'pharmacy').map((proc) => (
                                <TableRow key={proc.id}>
                                  <TableCell>
                                    <Switch 
                                      checked={proc.active}
                                      onCheckedChange={() => handleActiveToggle(proc.id)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{proc.name}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={proc.price}
                                      onChange={(e) => handlePriceChange(proc.id, parseFloat(e.target.value) || 0)}
                                      className="w-full"
                                      disabled={!proc.active}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={handlePreviewPDF}
                disabled={loading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview PDF
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
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
                    <Save className="w-4 h-4 mr-2" />
                    {editingInsurance ? 'Update Insurance Company' : 'Save Insurance Company'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Show insurance list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Insurance Companies</h2>
          <p className="text-sm text-gray-600 mt-1">Manage insurance companies and policies</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddInsuranceForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Insurance Company
        </Button>
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
                  <TableHead>Policy Prefix</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insurances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No insurance companies found. Click "Add Insurance Company" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  insurances.map((ins) => (
                    <TableRow key={ins.id}>
                      <TableCell className="font-medium">{ins.name}</TableCell>
                      <TableCell className="font-mono text-sm">{ins.policy_prefix || '-'}</TableCell>
                      <TableCell>{ins.contact_person}</TableCell>
                      <TableCell className="text-sm">{ins.phone}</TableCell>
                      <TableCell className="text-sm">{ins.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {ins.discount_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={ins.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {ins.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(ins)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(ins.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={handlePreviewPDF}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            PDF
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
