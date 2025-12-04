/**
 * Ward Bed View - Visual Bed Layout with Patient Assignment
 * 
 * Features:
 * - Visual bed grid layout
 * - Bed status indicators
 * - Patient details on hover/click
 * - Bed assignment/transfer
 * - Bed maintenance management
 * - Multiple view modes (Grid/List)
 * - Real-time status updates
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import {
  Bed,
  User,
  Users,
  Activity,
  Clock,
  Calendar,
  Phone,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Settings,
  Edit,
  Trash2,
  Plus,
  Eye,
  Search,
  Filter,
  Grid3x3,
  List,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  RotateCcw,
  RefreshCw,
  UserPlus,
  Building2,
  Stethoscope,
  Heart,
  Thermometer,
  Download,
  Printer,
  Share2,
  Info,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  DollarSign,
  Wind
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

interface Ward {
  id: string;
  name: string;
  floor: number;
  type: 'General' | 'ICU' | 'NICU' | 'PICU' | 'CCU' | 'HDU' | 'Isolation' | 'Private' | 'Deluxe';
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  nurseInCharge: string;
  contactNumber: string;
}

interface BedDetails {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  floor: number;
  section?: string; // A, B, C for subdivisions
  type: 'General' | 'ICU' | 'Private' | 'Deluxe' | 'Isolation';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
  dailyRate: number;
  
  // Patient Info (if occupied)
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  uhid?: string;
  ipdNumber?: string;
  admissionDate?: string;
  admissionTime?: string;
  lengthOfStay?: number;
  diagnosis?: string;
  consultingDoctor?: string;
  department?: string;
  condition?: 'stable' | 'critical' | 'moderate';
  
  // Bed Features
  facilities: string[];
  hasOxygen: boolean;
  hasMonitor: boolean;
  hasVentilator: boolean;
  
  // Maintenance Info
  lastCleaned?: string;
  maintenanceReason?: string;
  maintenanceScheduledDate?: string;
}

// ============= MOCK DATA =============

const mockBeds: BedDetails[] = [
  // General Ward A - Floor 2
  {
    id: 'BED001',
    bedNumber: 'GEN-A-01',
    wardId: 'W001',
    wardName: 'General Ward A',
    floor: 2,
    section: 'A',
    type: 'General',
    status: 'occupied',
    dailyRate: 500,
    patientId: 'P001',
    patientName: 'James Wilson',
    patientAge: 72,
    patientGender: 'male',
    uhid: 'UHID-892347',
    ipdNumber: 'IPD-2024-001236',
    admissionDate: '2024-11-07',
    admissionTime: '08:45',
    lengthOfStay: 4,
    diagnosis: 'Pneumonia with Respiratory Distress',
    consultingDoctor: 'Dr. Jennifer Adams',
    department: 'General Medicine',
    condition: 'moderate',
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    hasOxygen: true,
    hasMonitor: true,
    hasVentilator: false,
    lastCleaned: '2024-11-11 06:00'
  },
  {
    id: 'BED002',
    bedNumber: 'GEN-A-02',
    wardId: 'W001',
    wardName: 'General Ward A',
    floor: 2,
    section: 'A',
    type: 'General',
    status: 'available',
    dailyRate: 500,
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    hasOxygen: true,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-11 06:00'
  },
  {
    id: 'BED003',
    bedNumber: 'GEN-A-03',
    wardId: 'W001',
    wardName: 'General Ward A',
    floor: 2,
    section: 'A',
    type: 'General',
    status: 'occupied',
    dailyRate: 500,
    patientId: 'P003',
    patientName: 'Emma Thompson',
    patientAge: 45,
    patientGender: 'female',
    uhid: 'UHID-892350',
    ipdNumber: 'IPD-2024-001239',
    admissionDate: '2024-11-10',
    admissionTime: '14:30',
    lengthOfStay: 1,
    diagnosis: 'Gastroenteritis',
    consultingDoctor: 'Dr. Sarah Mitchell',
    department: 'General Medicine',
    condition: 'stable',
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    hasOxygen: false,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-10 13:00'
  },
  {
    id: 'BED004',
    bedNumber: 'GEN-A-04',
    wardId: 'W001',
    wardName: 'General Ward A',
    floor: 2,
    section: 'A',
    type: 'General',
    status: 'cleaning',
    dailyRate: 500,
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    hasOxygen: true,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-11 09:30'
  },
  {
    id: 'BED005',
    bedNumber: 'GEN-A-05',
    wardId: 'W001',
    wardName: 'General Ward A',
    floor: 2,
    section: 'A',
    type: 'General',
    status: 'reserved',
    dailyRate: 500,
    patientName: 'Reserved for Emergency',
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    hasOxygen: true,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-11 06:00'
  },
  {
    id: 'BED006',
    bedNumber: 'GEN-A-06',
    wardId: 'W001',
    wardName: 'General Ward A',
    floor: 2,
    section: 'A',
    type: 'General',
    status: 'maintenance',
    dailyRate: 500,
    facilities: ['AC', 'TV', 'Washroom', 'Nurse Call'],
    hasOxygen: true,
    hasMonitor: false,
    hasVentilator: false,
    maintenanceReason: 'AC repair required',
    maintenanceScheduledDate: '2024-11-12'
  },
  // ICU Beds
  {
    id: 'BED007',
    bedNumber: 'ICU-01',
    wardId: 'W002',
    wardName: 'ICU - Intensive Care Unit',
    floor: 3,
    type: 'ICU',
    status: 'occupied',
    dailyRate: 3500,
    patientId: 'P004',
    patientName: 'Robert Johnson',
    patientAge: 58,
    patientGender: 'male',
    uhid: 'UHID-892345',
    ipdNumber: 'IPD-2024-001234',
    admissionDate: '2024-11-08',
    admissionTime: '14:30',
    lengthOfStay: 3,
    diagnosis: 'Acute Myocardial Infarction',
    consultingDoctor: 'Dr. Michael Stevens',
    department: 'Cardiology',
    condition: 'critical',
    facilities: ['Ventilator', 'Monitor', 'Oxygen', 'Emergency Equipment'],
    hasOxygen: true,
    hasMonitor: true,
    hasVentilator: true,
    lastCleaned: '2024-11-11 06:00'
  },
  {
    id: 'BED008',
    bedNumber: 'ICU-02',
    wardId: 'W002',
    wardName: 'ICU - Intensive Care Unit',
    floor: 3,
    type: 'ICU',
    status: 'occupied',
    dailyRate: 3500,
    patientId: 'P005',
    patientName: 'Michael Brown',
    patientAge: 45,
    patientGender: 'male',
    uhid: 'UHID-892349',
    ipdNumber: 'IPD-2024-001238',
    admissionDate: '2024-11-06',
    admissionTime: '11:00',
    lengthOfStay: 5,
    diagnosis: 'Stroke - Ischemic',
    consultingDoctor: 'Dr. Christopher Lee',
    department: 'Neurology',
    condition: 'critical',
    facilities: ['Ventilator', 'Monitor', 'Oxygen', 'Emergency Equipment'],
    hasOxygen: true,
    hasMonitor: true,
    hasVentilator: true,
    lastCleaned: '2024-11-11 06:00'
  },
  {
    id: 'BED009',
    bedNumber: 'ICU-03',
    wardId: 'W002',
    wardName: 'ICU - Intensive Care Unit',
    floor: 3,
    type: 'ICU',
    status: 'available',
    dailyRate: 3500,
    facilities: ['Ventilator', 'Monitor', 'Oxygen', 'Emergency Equipment'],
    hasOxygen: true,
    hasMonitor: true,
    hasVentilator: true,
    lastCleaned: '2024-11-11 06:00'
  },
  {
    id: 'BED010',
    bedNumber: 'ICU-04',
    wardId: 'W002',
    wardName: 'ICU - Intensive Care Unit',
    floor: 3,
    type: 'ICU',
    status: 'available',
    dailyRate: 3500,
    facilities: ['Ventilator', 'Monitor', 'Oxygen', 'Emergency Equipment'],
    hasOxygen: true,
    hasMonitor: true,
    hasVentilator: true,
    lastCleaned: '2024-11-11 06:00'
  },
  // Private Ward Beds
  {
    id: 'BED011',
    bedNumber: 'PVT-01',
    wardId: 'W003',
    wardName: 'Private Ward',
    floor: 4,
    type: 'Private',
    status: 'occupied',
    dailyRate: 1500,
    patientId: 'P006',
    patientName: 'Maria Garcia',
    patientAge: 34,
    patientGender: 'female',
    uhid: 'UHID-892346',
    ipdNumber: 'IPD-2024-001235',
    admissionDate: '2024-11-09',
    admissionTime: '10:15',
    lengthOfStay: 2,
    diagnosis: 'Fracture Femur - Post Surgery',
    consultingDoctor: 'Dr. David Wilson',
    department: 'Orthopedics',
    condition: 'stable',
    facilities: ['AC', 'TV', 'Attached Bathroom', 'WiFi', 'Refrigerator'],
    hasOxygen: true,
    hasMonitor: true,
    hasVentilator: false,
    lastCleaned: '2024-11-11 07:00'
  },
  {
    id: 'BED012',
    bedNumber: 'PVT-02',
    wardId: 'W003',
    wardName: 'Private Ward',
    floor: 4,
    type: 'Private',
    status: 'occupied',
    dailyRate: 1500,
    patientId: 'P007',
    patientName: 'Sarah Miller',
    patientAge: 28,
    patientGender: 'female',
    uhid: 'UHID-892348',
    ipdNumber: 'IPD-2024-001237',
    admissionDate: '2024-11-10',
    admissionTime: '16:20',
    lengthOfStay: 1,
    diagnosis: 'Normal Delivery - Post Natal Care',
    consultingDoctor: 'Dr. Robert Anderson',
    department: 'Obstetrics',
    condition: 'stable',
    facilities: ['AC', 'TV', 'Attached Bathroom', 'WiFi', 'Refrigerator'],
    hasOxygen: false,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-10 15:00'
  },
  {
    id: 'BED013',
    bedNumber: 'PVT-03',
    wardId: 'W003',
    wardName: 'Private Ward',
    floor: 4,
    type: 'Private',
    status: 'available',
    dailyRate: 1500,
    facilities: ['AC', 'TV', 'Attached Bathroom', 'WiFi', 'Refrigerator'],
    hasOxygen: true,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-11 07:00'
  },
  {
    id: 'BED014',
    bedNumber: 'PVT-04',
    wardId: 'W003',
    wardName: 'Private Ward',
    floor: 4,
    type: 'Private',
    status: 'available',
    dailyRate: 1500,
    facilities: ['AC', 'TV', 'Attached Bathroom', 'WiFi', 'Refrigerator'],
    hasOxygen: true,
    hasMonitor: false,
    hasVentilator: false,
    lastCleaned: '2024-11-11 07:00'
  }
];

// ============= MAIN COMPONENT =============

interface WardBedViewProps {
  ward: Ward;
  onBack: () => void;
}

export function WardBedView({ ward, onBack }: WardBedViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBed, setSelectedBed] = useState<BedDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isAddBedDialogOpen, setIsAddBedDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter beds by ward
  const wardBeds = mockBeds.filter(bed => bed.wardId === ward.id);

  // Apply filters
  const filteredBeds = wardBeds.filter(bed => {
    const matchesStatus = filterStatus === 'all' || bed.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.uhid?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'occupied':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'cleaning':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBedClick = (bed: BedDetails) => {
    setSelectedBed(bed);
    setIsDetailsDialogOpen(true);
  };

  const handleAssignPatient = (bed: BedDetails) => {
    setSelectedBed(bed);
    setIsAssignDialogOpen(true);
  };

  const handleSetMaintenance = (bed: BedDetails) => {
    setSelectedBed(bed);
    setIsMaintenanceDialogOpen(true);
  };

  const getStatusStats = () => {
    const stats = {
      total: wardBeds.length,
      available: wardBeds.filter(b => b.status === 'available').length,
      occupied: wardBeds.filter(b => b.status === 'occupied').length,
      reserved: wardBeds.filter(b => b.status === 'reserved').length,
      maintenance: wardBeds.filter(b => b.status === 'maintenance').length,
      cleaning: wardBeds.filter(b => b.status === 'cleaning').length
    };
    return stats;
  };

  const stats = getStatusStats();

  // ============= GRID VIEW =============
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => (
          <Card 
            key={bed.id} 
            className={`border-l-4 cursor-pointer hover:shadow-lg transition-all ${getStatusColor(bed.status)}`}
            onClick={() => handleBedClick(bed)}
          >
            <CardContent className="p-4">
              {/* Bed Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  <h3 className="font-semibold">{bed.bedNumber}</h3>
                </div>
                <Badge className={getStatusColor(bed.status)}>
                  {bed.status}
                </Badge>
              </div>

              <Separator className="my-3" />

              {/* Patient Info or Available Status */}
              {bed.status === 'occupied' && bed.patientName ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm">{bed.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {bed.patientAge}Y / {bed.patientGender}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">{bed.diagnosis}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600">{bed.consultingDoctor}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      Day {bed.lengthOfStay}
                    </Badge>
                    {bed.condition && (
                      <Badge className={`text-xs ${getConditionColor(bed.condition)}`}>
                        {bed.condition}
                      </Badge>
                    )}
                  </div>

                  {/* Equipment Icons */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                    {bed.hasOxygen && (
                      <div className="flex items-center gap-1" title="Oxygen">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-500">O2</span>
                      </div>
                    )}
                    {bed.hasMonitor && (
                      <div className="flex items-center gap-1" title="Monitor">
                        <Activity className="w-3 h-3 text-green-600" />
                      </div>
                    )}
                    {bed.hasVentilator && (
                      <div className="flex items-center gap-1" title="Ventilator">
                        <Heart className="w-3 h-3 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>
              ) : bed.status === 'available' ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Bed Available</p>
                  <p className="text-xs text-gray-500 mt-1">${bed.dailyRate}/day</p>
                  <Button 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignPatient(bed);
                    }}
                  >
                    <UserPlus className="w-3 h-3 mr-2" />
                    Assign Patient
                  </Button>
                </div>
              ) : bed.status === 'reserved' ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Reserved</p>
                  <p className="text-xs text-gray-500 mt-1">{bed.patientName || 'Reserved'}</p>
                </div>
              ) : bed.status === 'maintenance' ? (
                <div className="text-center py-6">
                  <Wrench className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Under Maintenance</p>
                  <p className="text-xs text-gray-500 mt-1">{bed.maintenanceReason}</p>
                </div>
              ) : bed.status === 'cleaning' ? (
                <div className="text-center py-6">
                  <RefreshCw className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cleaning in Progress</p>
                  <p className="text-xs text-gray-500 mt-1">Please wait...</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // ============= LIST VIEW =============
  const renderListView = () => {
    return (
      <Card className="border-0 shadow-sm">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bed Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Admitted On</TableHead>
                <TableHead>LOS</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBeds.map((bed) => (
                <TableRow key={bed.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-gray-500" />
                      <span>{bed.bedNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bed.status)}>
                      {bed.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bed.patientName ? (
                      <div>
                        <p>{bed.patientName}</p>
                        <p className="text-xs text-gray-500">
                          {bed.patientAge}Y / {bed.patientGender}
                        </p>
                        <p className="text-xs text-gray-500">{bed.uhid}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.diagnosis ? (
                      <p className="text-sm max-w-[200px] truncate">{bed.diagnosis}</p>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.consultingDoctor ? (
                      <p className="text-sm">{bed.consultingDoctor}</p>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.admissionDate ? (
                      <div>
                        <p className="text-sm">{bed.admissionDate}</p>
                        <p className="text-xs text-gray-500">{bed.admissionTime}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.lengthOfStay ? (
                      <Badge variant="outline">{bed.lengthOfStay} days</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bed.condition ? (
                      <Badge className={getConditionColor(bed.condition)}>
                        {bed.condition}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {bed.hasOxygen && <div className="w-2 h-2 rounded-full bg-blue-500" title="Oxygen"></div>}
                      {bed.hasMonitor && <Activity className="w-3 h-3 text-green-600" title="Monitor" />}
                      {bed.hasVentilator && <Heart className="w-3 h-3 text-red-600" title="Ventilator" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBedClick(bed)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {bed.status === 'available' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAssignPatient(bed)}
                        >
                          <UserPlus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wards
          </Button>
          <div>
            <h2 className="text-2xl text-gray-900">{ward.name}</h2>
            <p className="text-sm text-gray-600">Floor {ward.floor} • {ward.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddBedDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bed
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Bed className="w-5 h-5 text-gray-600" />
              <Badge variant="outline">{stats.total}</Badge>
            </div>
            <p className="text-xs text-gray-600">Total Beds</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700">{stats.available}</Badge>
            </div>
            <p className="text-xs text-gray-600">Available</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">{stats.occupied}</Badge>
            </div>
            <p className="text-xs text-gray-600">Occupied</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">{stats.reserved}</Badge>
            </div>
            <p className="text-xs text-gray-600">Reserved</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">{stats.maintenance}</Badge>
            </div>
            <p className="text-xs text-gray-600">Maintenance</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">{stats.cleaning}</Badge>
            </div>
            <p className="text-xs text-gray-600">Cleaning</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by bed number, patient name, or UHID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Refresh */}
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beds Display */}
      <div>
        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </div>

      {/* Bed Details Dialog */}
      <BedDetailsDialog
        bed={selectedBed}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onAssign={handleAssignPatient}
        onMaintenance={handleSetMaintenance}
      />

      {/* Assign Patient Dialog */}
      <AssignPatientDialog
        bed={selectedBed}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
      />

      {/* Maintenance Dialog */}
      <MaintenanceDialog
        bed={selectedBed}
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
      />

      {/* Add Bed Dialog */}
      <AddBedDialog
        ward={ward}
        open={isAddBedDialogOpen}
        onOpenChange={setIsAddBedDialogOpen}
      />
    </div>
  );
}

// ============= SUB-COMPONENTS =============

function BedDetailsDialog({ 
  bed, 
  open, 
  onOpenChange,
  onAssign,
  onMaintenance
}: { 
  bed: BedDetails | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAssign: (bed: BedDetails) => void;
  onMaintenance: (bed: BedDetails) => void;
}) {
  if (!bed) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Bed className="w-6 h-6" />
            Bed Details - {bed.bedNumber}
          </DialogTitle>
          <DialogDescription>
            {bed.wardName} • Floor {bed.floor}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="patient">Patient Info</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Bed Number</Label>
                  <p>{bed.bedNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Ward / Floor</Label>
                  <p>{bed.wardName} / Floor {bed.floor}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Bed Type</Label>
                  <Badge variant="outline">{bed.type}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Daily Rate</Label>
                  <p className="text-lg">${bed.dailyRate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Current Status</Label>
                  <Badge className={`${bed.status === 'available' ? 'bg-green-100 text-green-800' : bed.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {bed.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Equipment & Facilities</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {bed.hasOxygen ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm">Oxygen Supply</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bed.hasMonitor ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm">Patient Monitor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bed.hasVentilator ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm">Ventilator</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Additional Facilities</Label>
                  <div className="flex flex-wrap gap-1">
                    {bed.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>

                {bed.lastCleaned && (
                  <div>
                    <Label className="text-xs text-gray-500">Last Cleaned</Label>
                    <p className="text-sm">{bed.lastCleaned}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patient" className="space-y-4">
            {bed.status === 'occupied' && bed.patientName ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Patient Name</Label>
                      <p>{bed.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Age / Gender</Label>
                      <p>{bed.patientAge} Years / {bed.patientGender}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">UHID</Label>
                      <p className="font-mono text-sm">{bed.uhid}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">IPD Number</Label>
                      <p className="font-mono text-sm text-blue-600">{bed.ipdNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Admission Date & Time</Label>
                      <p>{bed.admissionDate} at {bed.admissionTime}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Length of Stay</Label>
                      <Badge variant="outline">{bed.lengthOfStay} days</Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Consulting Doctor</Label>
                      <p>{bed.consultingDoctor}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Department</Label>
                      <p>{bed.department}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Diagnosis</Label>
                  <p className="p-3 bg-gray-50 rounded-lg text-sm">{bed.diagnosis}</p>
                </div>

                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Patient Condition</Label>
                  <Badge className={`${bed.condition === 'stable' ? 'bg-green-100 text-green-800' : bed.condition === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {bed.condition}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No patient assigned to this bed</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Bed history not available</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {bed.status === 'available' && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              onOpenChange(false);
              onAssign(bed);
            }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Patient
            </Button>
          )}
          {bed.status === 'occupied' && (
            <Button variant="outline" className="text-orange-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Transfer Patient
            </Button>
          )}
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
            onMaintenance(bed);
          }}>
            <Wrench className="w-4 h-4 mr-2" />
            Set Maintenance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignPatientDialog({ 
  bed, 
  open, 
  onOpenChange 
}: { 
  bed: BedDetails | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!bed) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Patient to {bed.bedNumber}</DialogTitle>
          <DialogDescription>
            {bed.wardName} • ${bed.dailyRate}/day
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Search Patient or IPD Number</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Enter UHID, IPD Number, or Patient Name" className="pl-10" />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Select an existing IPD patient or use the "New Admission" flow to admit a new patient.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Or Select from Pending Admissions</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select pending admission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No pending admissions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
            toast.success(`Patient assigned to ${bed.bedNumber}`);
            onOpenChange(false);
          }}>
            Assign to Bed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MaintenanceDialog({ 
  bed, 
  open, 
  onOpenChange 
}: { 
  bed: BedDetails | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!bed) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Bed Maintenance - {bed.bedNumber}</DialogTitle>
          <DialogDescription>Mark this bed for maintenance or cleaning</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Maintenance Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleaning">Cleaning Required</SelectItem>
                <SelectItem value="repair">Repair Required</SelectItem>
                <SelectItem value="equipment">Equipment Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason / Description</Label>
            <Textarea placeholder="Describe the issue..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Scheduled Date</Label>
            <Input type="date" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => {
            toast.success(`Bed ${bed.bedNumber} marked for maintenance`);
            onOpenChange(false);
          }}>
            Set Maintenance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= ADD BED DIALOG =============
function AddBedDialog({ 
  ward,
  open, 
  onOpenChange 
}: { 
  ward: Ward;
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [hasOxygen, setHasOxygen] = useState(false);
  const [hasMonitor, setHasMonitor] = useState(false);
  const [hasVentilator, setHasVentilator] = useState(false);

  // Available facilities based on ward type
  const availableFacilities = [
    'AC',
    'TV',
    'Washroom',
    'Attached Bathroom',
    'WiFi',
    'Refrigerator',
    'Nurse Call',
    'Emergency Equipment',
    'Microwave',
    'Sofa',
    'Wardrobe',
    'Study Table',
    'Telephone',
    'Intercom',
    'Safe Locker',
    'Mini Bar'
  ];

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const handleSubmit = () => {
    toast.success('New bed added successfully!');
    onOpenChange(false);
    // Reset form
    setSelectedFacilities([]);
    setHasOxygen(false);
    setHasMonitor(false);
    setHasVentilator(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Bed to {ward.name}
          </DialogTitle>
          <DialogDescription>
            Configure bed details, facilities, and pricing
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Equipment</TabsTrigger>
          </TabsList>

          {/* Basic Details Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bed Number *</Label>
                <Input placeholder="e.g., GEN-A-07, ICU-05" />
                <p className="text-xs text-gray-500">Format: WARD-SECTION-NUMBER</p>
              </div>
              <div className="space-y-2">
                <Label>Ward *</Label>
                <Input value={ward.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Floor *</Label>
                <Input type="number" defaultValue={ward.floor} />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bed Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Isolation">Isolation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Status *</Label>
                <Select defaultValue="available">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Bed number should be unique within the ward. Follow your hospital naming convention.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-4">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Select Room Facilities
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose all facilities available in this bed/room
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFacilities.map((facility) => (
                  <Card 
                    key={facility}
                    className={`cursor-pointer transition-all ${
                      selectedFacilities.includes(facility)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleFacility(facility)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedFacilities.includes(facility) ? (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                          )}
                          <span className="text-sm">{facility}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm mb-3">Selected Facilities ({selectedFacilities.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFacilities.length > 0 ? (
                    selectedFacilities.map((facility) => (
                      <Badge 
                        key={facility} 
                        className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                        onClick={() => toggleFacility(facility)}
                      >
                        {facility}
                        <XCircle className="w-3 h-3 ml-1" />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No facilities selected</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pricing & Equipment Tab */}
          <TabsContent value="pricing" className="space-y-6">
            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3>Room Rent / Pricing</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Rate (Per Day) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number" 
                      placeholder="500" 
                      className="pl-8"
                      min="0"
                      step="50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Base rate for 24 hours</p>
                </div>

                <div className="space-y-2">
                  <Label>Hourly Rate (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number" 
                      placeholder="25" 
                      className="pl-8"
                      min="0"
                      step="5"
                    />
                  </div>
                  <p className="text-xs text-gray-500">For partial day billing</p>
                </div>

                <div className="space-y-2">
                  <Label>Weekly Rate (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number" 
                      placeholder="3000" 
                      className="pl-8"
                      min="0"
                      step="100"
                    />
                  </div>
                  <p className="text-xs text-gray-500">7-day package rate</p>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Rate (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number" 
                      placeholder="12000" 
                      className="pl-8"
                      min="0"
                      step="500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">30-day package rate</p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Pricing may vary based on bed type. ICU/Critical care beds typically have higher rates.
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Medical Equipment Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-red-600" />
                <h3>Medical Equipment</h3>
              </div>

              <div className="space-y-3">
                <Card className={`border-2 cursor-pointer transition-all ${hasOxygen ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wind className="w-5 h-5 text-blue-600" />
                        <div>
                          <p>Oxygen Supply</p>
                          <p className="text-xs text-gray-500">Centralized oxygen pipeline</p>
                        </div>
                      </div>
                      <Switch 
                        checked={hasOxygen}
                        onCheckedChange={setHasOxygen}
                      />
                    </div>
                    {hasOxygen && (
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs">Additional Charge (per day)</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            className="pl-8"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={`border-2 cursor-pointer transition-all ${hasMonitor ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-green-600" />
                        <div>
                          <p>Patient Monitor</p>
                          <p className="text-xs text-gray-500">Vital signs monitoring system</p>
                        </div>
                      </div>
                      <Switch 
                        checked={hasMonitor}
                        onCheckedChange={setHasMonitor}
                      />
                    </div>
                    {hasMonitor && (
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs">Additional Charge (per day)</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            className="pl-8"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={`border-2 cursor-pointer transition-all ${hasVentilator ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-red-600" />
                        <div>
                          <p>Ventilator</p>
                          <p className="text-xs text-gray-500">Mechanical ventilation support</p>
                        </div>
                      </div>
                      <Switch 
                        checked={hasVentilator}
                        onCheckedChange={setHasVentilator}
                      />
                    </div>
                    {hasVentilator && (
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs">Additional Charge (per day)</Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            className="pl-8"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Equipment charges will be automatically added to the patient daily room charges.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
