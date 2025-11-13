/**
 * Add/Edit Supplier Component for Pharmacy Management
 * 
 * Features:
 * - Complete supplier information management
 * - Multiple brands/companies per supplier
 * - Medicine targets and goals
 * - Commission structure
 * - Promotions and discounts per brand
 * - Doctor relationships and referrals
 * - Payment terms and credit limits
 * - Document uploads
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Target,
  DollarSign,
  Percent,
  Gift,
  Tag,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Calendar,
  TrendingUp,
  Award,
  Package,
  Pill,
  Building,
  UserCheck,
  Banknote,
  Receipt,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  discounts: Discount[];
  promotions: Promotion[];
  isActive: boolean;
}

interface Discount {
  id: string;
  type: 'percentage' | 'fixed' | 'bulk' | 'seasonal';
  value: number;
  minQuantity?: number;
  startDate?: string;
  endDate?: string;
  description: string;
}

interface Promotion {
  id: string;
  name: string;
  type: 'buy-get' | 'bundle' | 'seasonal' | 'clearance';
  description: string;
  startDate: string;
  endDate: string;
  terms: string;
  isActive: boolean;
}

interface MedicineTarget {
  id: string;
  medicineName: string;
  category: string;
  targetQuantity: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  commission: number;
  currentProgress: number;
}

interface DoctorRelation {
  id: string;
  doctorName: string;
  specialty: string;
  preferredBrands: string[];
  commission: number;
  referralCount: number;
}

export function AddSupplier() {
  const [activeTab, setActiveTab] = useState('basic');
  const [supplierName, setSupplierName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [isActive, setIsActive] = useState(true);
  
  // Brands Management
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: 'PharmaCorp International',
      description: 'Leading pharmaceutical manufacturer',
      isActive: true,
      discounts: [
        { id: 'd1', type: 'percentage', value: 15, minQuantity: 100, description: 'Bulk order discount' },
        { id: 'd2', type: 'seasonal', value: 20, startDate: '2025-01-01', endDate: '2025-03-31', description: 'Q1 Special' }
      ],
      promotions: [
        { id: 'p1', name: 'Buy 10 Get 2 Free', type: 'buy-get', description: 'Promotional offer', startDate: '2025-01-01', endDate: '2025-12-31', terms: 'Valid on select medicines', isActive: true }
      ]
    }
  ]);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // Targets
  const [medicineTargets, setMedicineTargets] = useState<MedicineTarget[]>([
    { id: 't1', medicineName: 'Paracetamol 500mg', category: 'Analgesics', targetQuantity: 5000, period: 'monthly', commission: 2.5, currentProgress: 3200 },
    { id: 't2', medicineName: 'Amoxicillin 250mg', category: 'Antibiotics', targetQuantity: 3000, period: 'monthly', commission: 3.0, currentProgress: 1800 }
  ]);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  
  // Doctor Relations
  const [doctorRelations, setDoctorRelations] = useState<DoctorRelation[]>([
    { id: 'dr1', doctorName: 'Dr. Sarah Ahmed', specialty: 'General Physician', preferredBrands: ['PharmaCorp International'], commission: 5, referralCount: 45 },
    { id: 'dr2', doctorName: 'Dr. Ali Khan', specialty: 'Cardiologist', preferredBrands: ['PharmaCorp International'], commission: 7, referralCount: 32 }
  ]);
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);

  // Commission Structure
  const [baseCommission, setBaseCommission] = useState('5');
  const [tieredCommission, setTieredCommission] = useState([
    { min: 0, max: 100000, rate: 5 },
    { min: 100000, max: 500000, rate: 7 },
    { min: 500000, max: 999999999, rate: 10 }
  ]);

  const handleSaveSupplier = () => {
    if (!supplierName || !contactPerson || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Supplier saved successfully!', {
      description: `${supplierName} has been added to the system`
    });

    // Reset form or navigate
  };

  const addBrand = (brand: Brand) => {
    if (editingBrand) {
      setBrands(brands.map(b => b.id === editingBrand.id ? brand : b));
      toast.success('Brand updated successfully');
    } else {
      setBrands([...brands, { ...brand, id: Date.now().toString() }]);
      toast.success('Brand added successfully');
    }
    setIsBrandDialogOpen(false);
    setEditingBrand(null);
  };

  const deleteBrand = (brandId: string) => {
    setBrands(brands.filter(b => b.id !== brandId));
    toast.info('Brand removed');
  };

  const addMedicineTarget = (target: MedicineTarget) => {
    setMedicineTargets([...medicineTargets, { ...target, id: Date.now().toString(), currentProgress: 0 }]);
    toast.success('Target added successfully');
    setIsTargetDialogOpen(false);
  };

  const deleteMedicineTarget = (targetId: string) => {
    setMedicineTargets(medicineTargets.filter(t => t.id !== targetId));
    toast.info('Target removed');
  };

  const addDoctorRelation = (doctor: DoctorRelation) => {
    setDoctorRelations([...doctorRelations, { ...doctor, id: Date.now().toString(), referralCount: 0 }]);
    toast.success('Doctor relationship added');
    setIsDoctorDialogOpen(false);
  };

  const deleteDoctorRelation = (doctorId: string) => {
    setDoctorRelations(doctorRelations.filter(d => d.id !== doctorId));
    toast.info('Doctor relationship removed');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Supplier</h1>
            <p className="text-gray-600">Complete supplier information, brands, targets, and relationships</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveSupplier} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Supplier
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2">
            <TabsList className="w-full grid grid-cols-6 h-auto p-1">
              <TabsTrigger value="basic" className="flex flex-col items-center gap-1 py-3">
                <Building2 className="w-5 h-5" />
                <span className="text-xs">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="brands" className="flex flex-col items-center gap-1 py-3">
                <Building className="w-5 h-5" />
                <span className="text-xs">Brands</span>
              </TabsTrigger>
              <TabsTrigger value="targets" className="flex flex-col items-center gap-1 py-3">
                <Target className="w-5 h-5" />
                <span className="text-xs">Targets</span>
              </TabsTrigger>
              <TabsTrigger value="commission" className="flex flex-col items-center gap-1 py-3">
                <DollarSign className="w-5 h-5" />
                <span className="text-xs">Commission</span>
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex flex-col items-center gap-1 py-3">
                <Users className="w-5 h-5" />
                <span className="text-xs">Doctors</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex flex-col items-center gap-1 py-3">
                <FileText className="w-5 h-5" />
                <span className="text-xs">Documents</span>
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* Tab 1: Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Supplier Details
              </CardTitle>
              <CardDescription>Basic information about the supplier company</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supplierName" className="flex items-center gap-1">
                    Supplier Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="supplierName"
                    placeholder="Enter supplier company name"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST/Tax Number</Label>
                  <Input
                    id="gstNumber"
                    placeholder="GST-XXXXXXXXX"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="flex items-center gap-1">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="contactPerson"
                      placeholder="Primary contact name"
                      className="pl-10"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="+92-XXX-XXXXXXX"
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="supplier@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Textarea
                      id="address"
                      placeholder="Complete address"
                      className="pl-10 min-h-[80px]"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-600" />
                Payment Terms
              </CardTitle>
              <CardDescription>Credit limits and payment conditions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit (PKR)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    placeholder="0"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cash on Delivery</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="45">45 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch
                      id="status"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <span className="text-sm text-gray-700">
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Brands & Products */}
        <TabsContent value="brands" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Brands & Companies
                  </CardTitle>
                  <CardDescription>Manage multiple brands from this supplier</CardDescription>
                </div>
                <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Brand
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Brand</DialogTitle>
                      <DialogDescription>Configure brand details, discounts, and promotions</DialogDescription>
                    </DialogHeader>
                    <BrandForm onSave={addBrand} onCancel={() => setIsBrandDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {brands.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No brands added yet</p>
                  <p className="text-sm text-gray-400 mb-4">Add brands to manage products and promotions</p>
                  <Button onClick={() => setIsBrandDialogOpen(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Brand
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {brands.map((brand) => (
                    <Card key={brand.id} className="border-2 hover:border-blue-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                              {brand.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 mb-1">{brand.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{brand.description}</p>
                              <div className="flex gap-2">
                                <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                                  {brand.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline">
                                  {brand.discounts.length} Discounts
                                </Badge>
                                <Badge variant="outline">
                                  {brand.promotions.length} Promotions
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingBrand(brand);
                                setIsBrandDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteBrand(brand.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Discounts */}
                        {brand.discounts.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Percent className="w-4 h-4 text-green-600" />
                              Active Discounts
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {brand.discounts.map((discount) => (
                                <div key={discount.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {discount.type}
                                    </Badge>
                                    <span className="font-bold text-green-600">
                                      {discount.type === 'percentage' ? `${discount.value}%` : `PKR ${discount.value}`}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700">{discount.description}</p>
                                  {discount.minQuantity && (
                                    <p className="text-xs text-gray-500 mt-1">Min qty: {discount.minQuantity}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Promotions */}
                        {brand.promotions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Gift className="w-4 h-4 text-purple-600" />
                              Active Promotions
                            </h4>
                            <div className="space-y-2">
                              {brand.promotions.map((promo) => (
                                <div key={promo.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">{promo.name}</span>
                                    <Badge variant={promo.isActive ? 'default' : 'secondary'} className="text-xs">
                                      {promo.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-700 mb-1">{promo.description}</p>
                                  <p className="text-xs text-gray-500">
                                    {promo.startDate} to {promo.endDate}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Medicine Targets */}
        <TabsContent value="targets" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Medicine Targets & Goals
                  </CardTitle>
                  <CardDescription>Set purchase targets and commission rates</CardDescription>
                </div>
                <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Target
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medicine Target</DialogTitle>
                      <DialogDescription>Set quantity targets and commission rates</DialogDescription>
                    </DialogHeader>
                    <MedicineTargetForm onSave={addMedicineTarget} onCancel={() => setIsTargetDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {medicineTargets.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No targets set</p>
                  <p className="text-sm text-gray-400 mb-4">Add medicine targets to track performance</p>
                  <Button onClick={() => setIsTargetDialogOpen(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Target
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicineTargets.map((target) => {
                    const progressPercent = (target.currentProgress / target.targetQuantity) * 100;
                    return (
                      <Card key={target.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <Pill className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">{target.medicineName}</h3>
                                  <p className="text-sm text-gray-600">{target.category}</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => deleteMedicineTarget(target.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Target Quantity</p>
                              <p className="font-bold text-gray-900">{target.targetQuantity.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Period</p>
                              <p className="font-bold text-gray-900 capitalize">{target.period}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Commission</p>
                              <p className="font-bold text-green-600">{target.commission}%</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Progress</p>
                              <p className="font-bold text-blue-600">{target.currentProgress.toLocaleString()}</p>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Achievement</span>
                              <span className="text-xs font-medium text-gray-900">{progressPercent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Commission Structure */}
        <TabsContent value="commission" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Commission Structure
              </CardTitle>
              <CardDescription>Define commission rates and tiers</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Base Commission */}
                <div>
                  <Label htmlFor="baseCommission" className="mb-3 block">Base Commission Rate (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="baseCommission"
                      type="number"
                      value={baseCommission}
                      onChange={(e) => setBaseCommission(e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-600">Applied to all purchases by default</span>
                  </div>
                </div>

                <Separator />

                {/* Tiered Commission */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Tiered Commission Rates</h3>
                      <p className="text-sm text-gray-600">Higher commission for higher purchase volumes</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Min Amount (PKR)</TableHead>
                        <TableHead>Max Amount (PKR)</TableHead>
                        <TableHead>Commission Rate (%)</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tieredCommission.map((tier, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {tier.min.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {tier.max === 999999999 ? 'No Limit' : tier.max.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-600">{tier.rate}%</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Commission Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Earned (MTD)</p>
                          <p className="text-xl font-bold text-gray-900">PKR 125,450</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Avg Commission</p>
                          <p className="text-xl font-bold text-gray-900">7.5%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                          <p className="text-xl font-bold text-gray-900">248</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Doctor Relationships */}
        <TabsContent value="doctors" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Doctor Relationships
                  </CardTitle>
                  <CardDescription>Manage doctor referrals and preferred brands</CardDescription>
                </div>
                <Dialog open={isDoctorDialogOpen} onOpenChange={setIsDoctorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Doctor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Doctor Relationship</DialogTitle>
                      <DialogDescription>Link doctor with preferred brands and commission</DialogDescription>
                    </DialogHeader>
                    <DoctorRelationForm
                      brands={brands}
                      onSave={addDoctorRelation}
                      onCancel={() => setIsDoctorDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {doctorRelations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No doctor relationships</p>
                  <p className="text-sm text-gray-400 mb-4">Link doctors to track referrals and commissions</p>
                  <Button onClick={() => setIsDoctorDialogOpen(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Doctor
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {doctorRelations.map((doctor) => (
                    <Card key={doctor.id} className="border-2 hover:border-blue-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                              {doctor.doctorName.split(' ')[1]?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{doctor.doctorName}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteDoctorRelation(doctor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Commission Rate</span>
                            <Badge className="bg-green-600">{doctor.commission}%</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Total Referrals</span>
                            <Badge variant="outline">{doctor.referralCount}</Badge>
                          </div>
                        </div>

                        {doctor.preferredBrands.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Preferred Brands:</p>
                            <div className="flex flex-wrap gap-1">
                              {doctor.preferredBrands.map((brand, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {brand}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents & Certificates
              </CardTitle>
              <CardDescription>Upload contracts, licenses, and agreements</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                </div>

                {/* Sample Documents */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                  
                  {[
                    { name: 'Supply Agreement 2025.pdf', size: '2.4 MB', date: '2025-01-15', type: 'Contract' },
                    { name: 'Business License.pdf', size: '1.8 MB', date: '2024-12-20', type: 'License' },
                    { name: 'GST Certificate.pdf', size: '950 KB', date: '2024-11-10', type: 'Tax Document' }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.size} • Uploaded on {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <Card className="border-0 shadow-lg sticky bottom-0 z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>All changes are auto-saved</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveSupplier} size="lg" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save & Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Brand Form Component
function BrandForm({ onSave, onCancel }: { onSave: (brand: Brand) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const handleSubmit = () => {
    if (!name) {
      toast.error('Please enter brand name');
      return;
    }

    onSave({
      id: Date.now().toString(),
      name,
      description,
      isActive,
      discounts,
      promotions
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="brandName">Brand Name *</Label>
        <Input
          id="brandName"
          placeholder="Enter brand/company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandDescription">Description</Label>
        <Textarea
          id="brandDescription"
          placeholder="Brief description of the brand"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <Label>Active Brand</Label>
      </div>

      <Separator />

      {/* Discounts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Discounts</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDiscounts([
                ...discounts,
                {
                  id: Date.now().toString(),
                  type: 'percentage',
                  value: 0,
                  description: ''
                }
              ]);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Discount
          </Button>
        </div>

        {discounts.map((discount, index) => (
          <Card key={discount.id} className="mb-3">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={discount.type}
                    onValueChange={(value: any) => {
                      const updated = [...discounts];
                      updated[index].type = value;
                      setDiscounts(updated);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="bulk">Bulk Discount</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    type="number"
                    className="h-9"
                    placeholder="0"
                    value={discount.value}
                    onChange={(e) => {
                      const updated = [...discounts];
                      updated[index].value = parseFloat(e.target.value) || 0;
                      setDiscounts(updated);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    className="h-9"
                    placeholder="Discount description"
                    value={discount.description}
                    onChange={(e) => {
                      const updated = [...discounts];
                      updated[index].description = e.target.value;
                      setDiscounts(updated);
                    }}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600"
                onClick={() => setDiscounts(discounts.filter((_, i) => i !== index))}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Save Brand</Button>
      </div>
    </div>
  );
}

// Medicine Target Form Component
function MedicineTargetForm({ onSave, onCancel }: { onSave: (target: MedicineTarget) => void; onCancel: () => void }) {
  const [medicineName, setMedicineName] = useState('');
  const [category, setCategory] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [commission, setCommission] = useState('');

  const handleSubmit = () => {
    if (!medicineName || !targetQuantity || !commission) {
      toast.error('Please fill in all fields');
      return;
    }

    onSave({
      id: Date.now().toString(),
      medicineName,
      category,
      targetQuantity: parseInt(targetQuantity),
      period,
      commission: parseFloat(commission),
      currentProgress: 0
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Medicine Name *</Label>
        <Input
          placeholder="Enter medicine name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Analgesics">Analgesics</SelectItem>
            <SelectItem value="Antibiotics">Antibiotics</SelectItem>
            <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
            <SelectItem value="Diabetes">Diabetes</SelectItem>
            <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Target Quantity *</Label>
          <Input
            type="number"
            placeholder="0"
            value={targetQuantity}
            onChange={(e) => setTargetQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Period *</Label>
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Commission Rate (%) *</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="0.0"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Add Target</Button>
      </div>
    </div>
  );
}

// Doctor Relation Form Component
function DoctorRelationForm({
  brands,
  onSave,
  onCancel
}: {
  brands: Brand[];
  onSave: (doctor: DoctorRelation) => void;
  onCancel: () => void;
}) {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [commission, setCommission] = useState('');
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!doctorName || !specialty || !commission) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave({
      id: Date.now().toString(),
      doctorName,
      specialty,
      preferredBrands,
      commission: parseFloat(commission),
      referralCount: 0
    });
  };

  const toggleBrand = (brandName: string) => {
    if (preferredBrands.includes(brandName)) {
      setPreferredBrands(preferredBrands.filter(b => b !== brandName));
    } else {
      setPreferredBrands([...preferredBrands, brandName]);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Doctor Name *</Label>
        <Input
          placeholder="Dr. Full Name"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Specialty *</Label>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger>
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General Physician">General Physician</SelectItem>
            <SelectItem value="Cardiologist">Cardiologist</SelectItem>
            <SelectItem value="Neurologist">Neurologist</SelectItem>
            <SelectItem value="Pediatrician">Pediatrician</SelectItem>
            <SelectItem value="Orthopedic">Orthopedic</SelectItem>
            <SelectItem value="Dermatologist">Dermatologist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Commission Rate (%) *</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="0.0"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred Brands</Label>
        <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`brand-${brand.id}`}
                checked={preferredBrands.includes(brand.name)}
                onChange={() => toggleBrand(brand.name)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor={`brand-${brand.id}`} className="text-sm text-gray-700">
                {brand.name}
              </label>
            </div>
          ))}
          {brands.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">No brands available</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Add Doctor</Button>
      </div>
    </div>
  );
}
