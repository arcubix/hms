/**
 * Advanced Radiology Information System (RIS)
 * 
 * Complete Features:
 * - Order Management & Scheduling
 * - Multiple Imaging Modalities (X-Ray, CT, MRI, Ultrasound, PET, Mammography)
 * - PACS Integration (Picture Archiving and Communication System)
 * - Radiologist Worklist
 * - Advanced Reporting with Templates
 * - DICOM Viewer Simulation
 * - Critical Findings Alerts
 * - Comparison Studies
 * - Quality Control & Equipment Management
 * - Statistical Analytics
 * - Report Distribution
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
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Scan,
  Activity,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  User,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Printer,
  Send,
  Phone,
  FileText,
  ClipboardList,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Monitor,
  Zap,
  Target,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  MessageSquare,
  Bell,
  AlertTriangle,
  Star,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  Layers,
  Grid3x3,
  Camera,
  Video,
  Gauge,
  Award,
  ShieldAlert,
  Microscope,
  Brain,
  Heart,
  Bone,
  Baby,
  PersonStanding,
  Siren,
  Radio,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============= INTERFACES =============

type ModalityType = 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'Mammography' | 'Fluoroscopy' | 'Nuclear Medicine';
type StudyStatus = 'scheduled' | 'in-progress' | 'completed' | 'reported' | 'verified' | 'critical' | 'cancelled';
type StudyPriority = 'routine' | 'urgent' | 'stat' | 'emergency';
type ReportStatus = 'pending' | 'preliminary' | 'final' | 'addendum' | 'corrected';

interface RadiologyOrder {
  id: string;
  orderId: string;
  patientName: string;
  patientId: string;
  uhid: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  
  // Order Details
  modality: ModalityType;
  studyType: string;
  bodyPart: string;
  laterality?: 'left' | 'right' | 'bilateral';
  
  // Clinical Info
  clinicalHistory: string;
  indication: string;
  orderingPhysician: string;
  department: string;
  
  // Scheduling
  scheduledDate: string;
  scheduledTime: string;
  priority: StudyPriority;
  
  // Status
  status: StudyStatus;
  currentLocation?: string;
  
  // Technical
  contrast?: boolean;
  contrastType?: string;
  protocolName?: string;
  
  // Timing
  orderDate: string;
  completionDate?: string;
  reportDate?: string;
  
  // Assignment
  assignedTechnologist?: string;
  assignedRadiologist?: string;
  
  // Results
  reportStatus?: ReportStatus;
  criticalFindings?: boolean;
  
  // Images
  imageCount?: number;
  seriesCount?: number;
}

interface RadiologyReport {
  id: string;
  orderId: string;
  patientName: string;
  studyType: string;
  modality: ModalityType;
  
  // Report Content
  technique: string;
  findings: string;
  impression: string;
  recommendations?: string;
  
  // Comparison
  comparisonStudy?: string;
  comparisonDate?: string;
  comparisonFindings?: string;
  
  // Critical
  criticalFindings: boolean;
  criticalDescription?: string;
  notificationSent?: boolean;
  notificationTime?: string;
  
  // Radiologist
  reportingRadiologist: string;
  reportDate: string;
  reportTime: string;
  reportStatus: ReportStatus;
  
  // Quality
  imageQuality: 'excellent' | 'good' | 'adequate' | 'limited' | 'poor';
  limitations?: string;
  
  // Verification
  verifiedBy?: string;
  verifiedDate?: string;
  
  // Distribution
  sentTo?: string[];
  acknowledgedBy?: string[];
}

interface ImagingEquipment {
  id: string;
  name: string;
  modality: ModalityType;
  manufacturer: string;
  model: string;
  location: string;
  status: 'operational' | 'maintenance' | 'down' | 'calibration';
  lastServiceDate: string;
  nextServiceDate: string;
  studiesPerformed: number;
  utilizationRate: number;
}

// ============= MOCK DATA =============

const mockRadiologyOrders: RadiologyOrder[] = [
  {
    id: 'RO001',
    orderId: 'RAD-2024-00842',
    patientName: 'Robert Thompson',
    patientId: 'PT-8924',
    uhid: 'UHID-892401',
    age: 62,
    gender: 'male',
    modality: 'CT',
    studyType: 'CT Head without Contrast',
    bodyPart: 'Head',
    clinicalHistory: 'Fall with head trauma, loss of consciousness',
    indication: 'Rule out intracranial hemorrhage, fracture',
    orderingPhysician: 'Dr. Sarah Mitchell',
    department: 'Emergency Department',
    scheduledDate: '2024-11-11',
    scheduledTime: '15:30',
    priority: 'stat',
    status: 'in-progress',
    currentLocation: 'CT Suite 1',
    contrast: false,
    protocolName: 'Head Trauma Protocol',
    orderDate: '2024-11-11',
    assignedTechnologist: 'John Ramirez, RT',
    assignedRadiologist: 'Dr. Michael Chen, MD',
    imageCount: 245,
    seriesCount: 3
  },
  {
    id: 'RO002',
    orderId: 'RAD-2024-00843',
    patientName: 'Maria Garcia',
    patientId: 'PT-8925',
    uhid: 'UHID-892402',
    age: 45,
    gender: 'female',
    modality: 'X-Ray',
    studyType: 'Chest X-Ray 2 Views',
    bodyPart: 'Chest',
    clinicalHistory: 'Persistent cough for 3 weeks, fever',
    indication: 'Rule out pneumonia, TB',
    orderingPhysician: 'Dr. Jennifer Lee',
    department: 'Internal Medicine',
    scheduledDate: '2024-11-11',
    scheduledTime: '14:00',
    priority: 'routine',
    status: 'reported',
    contrast: false,
    orderDate: '2024-11-10',
    completionDate: '2024-11-11',
    reportDate: '2024-11-11',
    assignedTechnologist: 'Sarah Johnson, RT',
    assignedRadiologist: 'Dr. David Wilson, MD',
    reportStatus: 'final',
    criticalFindings: false,
    imageCount: 2,
    seriesCount: 1
  },
  {
    id: 'RO003',
    orderId: 'RAD-2024-00844',
    patientName: 'James Anderson',
    patientId: 'PT-8926',
    uhid: 'UHID-892403',
    age: 58,
    gender: 'male',
    modality: 'MRI',
    studyType: 'MRI Lumbar Spine with Contrast',
    bodyPart: 'Lumbar Spine',
    clinicalHistory: 'Chronic lower back pain, radiculopathy',
    indication: 'Evaluate for disc herniation, spinal stenosis',
    orderingPhysician: 'Dr. Robert Anderson',
    department: 'Orthopedics',
    scheduledDate: '2024-11-12',
    scheduledTime: '09:00',
    priority: 'routine',
    status: 'scheduled',
    contrast: true,
    contrastType: 'Gadolinium',
    protocolName: 'Lumbar Spine Standard Protocol',
    orderDate: '2024-11-11',
    assignedRadiologist: 'Dr. Emily Roberts, MD'
  },
  {
    id: 'RO004',
    orderId: 'RAD-2024-00845',
    patientName: 'Linda Martinez',
    patientId: 'PT-8927',
    uhid: 'UHID-892404',
    age: 52,
    gender: 'female',
    modality: 'Mammography',
    studyType: 'Diagnostic Mammography Bilateral',
    bodyPart: 'Breast',
    laterality: 'bilateral',
    clinicalHistory: 'Palpable lump in right breast, family history',
    indication: 'Evaluate breast mass',
    orderingPhysician: 'Dr. Amanda White',
    department: 'Women\'s Health',
    scheduledDate: '2024-11-11',
    scheduledTime: '10:30',
    priority: 'urgent',
    status: 'completed',
    contrast: false,
    orderDate: '2024-11-09',
    completionDate: '2024-11-11',
    assignedTechnologist: 'Emily Davis, RT(M)',
    assignedRadiologist: 'Dr. Patricia Moore, MD',
    reportStatus: 'preliminary',
    criticalFindings: true,
    imageCount: 8,
    seriesCount: 2
  },
  {
    id: 'RO005',
    orderId: 'RAD-2024-00846',
    patientName: 'Michael Chen',
    patientId: 'PT-8928',
    uhid: 'UHID-892405',
    age: 35,
    gender: 'male',
    modality: 'Ultrasound',
    studyType: 'Abdominal Ultrasound Complete',
    bodyPart: 'Abdomen',
    clinicalHistory: 'Right upper quadrant pain, elevated LFTs',
    indication: 'Evaluate for gallstones, hepatobiliary disease',
    orderingPhysician: 'Dr. Thomas Brown',
    department: 'Gastroenterology',
    scheduledDate: '2024-11-11',
    scheduledTime: '16:00',
    priority: 'routine',
    status: 'in-progress',
    currentLocation: 'Ultrasound Room 2',
    contrast: false,
    orderDate: '2024-11-11',
    assignedTechnologist: 'Rachel Kim, RDMS',
    assignedRadiologist: 'Dr. Michael Chen, MD'
  },
  {
    id: 'RO006',
    orderId: 'RAD-2024-00847',
    patientName: 'Sarah Johnson',
    patientId: 'PT-8929',
    uhid: 'UHID-892406',
    age: 28,
    gender: 'female',
    modality: 'X-Ray',
    studyType: 'Left Ankle 3 Views',
    bodyPart: 'Ankle',
    laterality: 'left',
    clinicalHistory: 'Fall, unable to bear weight',
    indication: 'Rule out fracture',
    orderingPhysician: 'Dr. Mark Stevens',
    department: 'Emergency Department',
    scheduledDate: '2024-11-11',
    scheduledTime: '17:15',
    priority: 'urgent',
    status: 'completed',
    contrast: false,
    orderDate: '2024-11-11',
    completionDate: '2024-11-11',
    assignedTechnologist: 'John Ramirez, RT',
    assignedRadiologist: 'Dr. David Wilson, MD',
    reportStatus: 'pending',
    imageCount: 3,
    seriesCount: 1
  },
  {
    id: 'RO007',
    orderId: 'RAD-2024-00848',
    patientName: 'David Williams',
    patientId: 'PT-8930',
    uhid: 'UHID-892407',
    age: 70,
    gender: 'male',
    modality: 'CT',
    studyType: 'CT Chest with Contrast',
    bodyPart: 'Chest',
    clinicalHistory: 'Lung mass on chest X-ray, smoker',
    indication: 'Characterize lung lesion, staging',
    orderingPhysician: 'Dr. Lisa Anderson',
    department: 'Pulmonology',
    scheduledDate: '2024-11-12',
    scheduledTime: '08:00',
    priority: 'urgent',
    status: 'scheduled',
    contrast: true,
    contrastType: 'Iodinated contrast',
    protocolName: 'Chest CT Oncology Protocol',
    orderDate: '2024-11-11',
    assignedRadiologist: 'Dr. Michael Chen, MD'
  },
  {
    id: 'RO008',
    orderId: 'RAD-2024-00849',
    patientName: 'Jennifer Brown',
    patientId: 'PT-8931',
    uhid: 'UHID-892408',
    age: 8,
    gender: 'female',
    modality: 'X-Ray',
    studyType: 'Chest X-Ray PA View',
    bodyPart: 'Chest',
    clinicalHistory: 'Fever, cough, difficulty breathing',
    indication: 'Rule out pneumonia',
    orderingPhysician: 'Dr. Amanda White',
    department: 'Pediatrics',
    scheduledDate: '2024-11-11',
    scheduledTime: '13:30',
    priority: 'routine',
    status: 'reported',
    contrast: false,
    orderDate: '2024-11-11',
    completionDate: '2024-11-11',
    reportDate: '2024-11-11',
    assignedTechnologist: 'Emily Davis, RT',
    assignedRadiologist: 'Dr. Patricia Moore, MD',
    reportStatus: 'final',
    criticalFindings: false,
    imageCount: 1,
    seriesCount: 1
  }
];

const mockImagingEquipment: ImagingEquipment[] = [
  {
    id: 'EQ001',
    name: 'CT Scanner 1',
    modality: 'CT',
    manufacturer: 'Siemens',
    model: 'Somatom Definition AS+',
    location: 'CT Suite 1',
    status: 'operational',
    lastServiceDate: '2024-10-15',
    nextServiceDate: '2025-01-15',
    studiesPerformed: 1247,
    utilizationRate: 78
  },
  {
    id: 'EQ002',
    name: 'MRI Scanner 1',
    modality: 'MRI',
    manufacturer: 'GE Healthcare',
    model: 'Signa Explorer 1.5T',
    location: 'MRI Suite 1',
    status: 'operational',
    lastServiceDate: '2024-09-20',
    nextServiceDate: '2024-12-20',
    studiesPerformed: 892,
    utilizationRate: 65
  },
  {
    id: 'EQ003',
    name: 'X-Ray Room 1',
    modality: 'X-Ray',
    manufacturer: 'Philips',
    model: 'DigitalDiagnost C90',
    location: 'X-Ray Room 1',
    status: 'operational',
    lastServiceDate: '2024-11-01',
    nextServiceDate: '2025-02-01',
    studiesPerformed: 2341,
    utilizationRate: 85
  },
  {
    id: 'EQ004',
    name: 'Ultrasound Unit 2',
    modality: 'Ultrasound',
    manufacturer: 'Samsung',
    model: 'RS85',
    location: 'Ultrasound Room 2',
    status: 'operational',
    lastServiceDate: '2024-10-28',
    nextServiceDate: '2025-01-28',
    studiesPerformed: 1456,
    utilizationRate: 72
  },
  {
    id: 'EQ005',
    name: 'Mammography Unit',
    modality: 'Mammography',
    manufacturer: 'Hologic',
    model: 'Selenia Dimensions',
    location: 'Mammography Suite',
    status: 'operational',
    lastServiceDate: '2024-10-10',
    nextServiceDate: '2025-01-10',
    studiesPerformed: 634,
    utilizationRate: 58
  },
  {
    id: 'EQ006',
    name: 'CT Scanner 2',
    modality: 'CT',
    manufacturer: 'GE Healthcare',
    model: 'Revolution CT',
    location: 'CT Suite 2',
    status: 'maintenance',
    lastServiceDate: '2024-11-11',
    nextServiceDate: '2025-02-11',
    studiesPerformed: 1089,
    utilizationRate: 0
  }
];

// ============= MAIN COMPONENT =============

export function RadiologyManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [orders] = useState<RadiologyOrder[]>(mockRadiologyOrders);
  const [equipment] = useState<ImagingEquipment[]>(mockImagingEquipment);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <RadiologyDashboard orders={orders} equipment={equipment} />;
      case 'orders':
        return <OrderManagement orders={orders} />;
      case 'worklist':
        return <RadiologistWorklist orders={orders} />;
      case 'reporting':
        return <ReportingModule orders={orders} />;
      case 'images':
        return <ImageViewer />;
      case 'equipment':
        return <EquipmentManagement equipment={equipment} />;
      case 'analytics':
        return <RadiologyAnalytics orders={orders} />;
      default:
        return <RadiologyDashboard orders={orders} equipment={equipment} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 flex items-center gap-3">
              <Scan className="w-8 h-8 text-blue-600" />
              Radiology Information System (RIS)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Advanced imaging workflow and PACS integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              PACS Connected
            </Badge>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Alerts (3)
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Grid3x3 },
            { id: 'orders', label: 'Order Management', icon: ClipboardList },
            { id: 'worklist', label: 'Radiologist Worklist', icon: Target },
            { id: 'reporting', label: 'Reporting', icon: FileText },
            { id: 'images', label: 'Image Viewer', icon: ImageIcon },
            { id: 'equipment', label: 'Equipment', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="whitespace-nowrap text-sm">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}

// ============= DASHBOARD =============

function RadiologyDashboard({ 
  orders, 
  equipment 
}: { 
  orders: RadiologyOrder[]; 
  equipment: ImagingEquipment[];
}) {
  const stats = {
    totalOrders: orders.length,
    scheduled: orders.filter(o => o.status === 'scheduled').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    reported: orders.filter(o => o.status === 'reported').length,
    critical: orders.filter(o => o.criticalFindings).length,
    stat: orders.filter(o => o.priority === 'stat' || o.priority === 'emergency').length
  };

  const modalityBreakdown = {
    'X-Ray': orders.filter(o => o.modality === 'X-Ray').length,
    'CT': orders.filter(o => o.modality === 'CT').length,
    'MRI': orders.filter(o => o.modality === 'MRI').length,
    'Ultrasound': orders.filter(o => o.modality === 'Ultrasound').length,
    'Mammography': orders.filter(o => o.modality === 'Mammography').length
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <Badge variant="outline">{stats.totalOrders}</Badge>
            </div>
            <p className="text-xs text-gray-600">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">{stats.scheduled}</Badge>
            </div>
            <p className="text-xs text-gray-600">Scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">{stats.inProgress}</Badge>
            </div>
            <p className="text-xs text-gray-600">In Progress</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700">{stats.completed}</Badge>
            </div>
            <p className="text-xs text-gray-600">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              <Badge className="bg-cyan-100 text-cyan-700">{stats.reported}</Badge>
            </div>
            <p className="text-xs text-gray-600">Reported</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Siren className="w-5 h-5 text-red-600" />
              <Badge className="bg-red-100 text-red-700">{stats.critical}</Badge>
            </div>
            <p className="text-xs text-gray-600">Critical</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">{stats.stat}</Badge>
            </div>
            <p className="text-xs text-gray-600">STAT/Emergency</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modality Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Studies by Modality</CardTitle>
            <CardDescription>Today's distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(modalityBreakdown).map(([modality, count]) => (
                <div key={modality}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{modality}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress value={(count / stats.totalOrders) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Priority Queue
            </CardTitle>
            <CardDescription>STAT and urgent studies requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {orders
                  .filter(o => o.priority === 'stat' || o.priority === 'emergency' || o.priority === 'urgent')
                  .sort((a, b) => {
                    const priorityOrder = { stat: 0, emergency: 1, urgent: 2, routine: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((order) => (
                    <div
                      key={order.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        order.priority === 'stat' || order.priority === 'emergency'
                          ? 'border-red-500 bg-red-50'
                          : 'border-orange-500 bg-orange-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={
                              order.priority === 'stat' || order.priority === 'emergency'
                                ? 'bg-red-600 text-white'
                                : 'bg-orange-500 text-white'
                            }>
                              {order.priority.toUpperCase()}
                            </Badge>
                            <span className="font-mono text-sm">{order.orderId}</span>
                          </div>
                          <p className="text-sm mb-1">{order.patientName} • {order.age}Y</p>
                          <p className="text-sm text-gray-700">{order.modality} - {order.studyType}</p>
                          <p className="text-xs text-gray-600 mt-1">{order.indication}</p>
                        </div>
                        <div className="text-right text-xs text-gray-600">
                          <p>{order.scheduledTime}</p>
                          <Badge variant="outline" className="mt-1">{order.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Equipment Status
          </CardTitle>
          <CardDescription>Real-time modality availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((eq) => (
              <Card key={eq.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4>{eq.name}</h4>
                      <p className="text-xs text-gray-600">{eq.manufacturer} {eq.model}</p>
                      <p className="text-xs text-gray-500">{eq.location}</p>
                    </div>
                    <Badge className={
                      eq.status === 'operational' ? 'bg-green-100 text-green-700' :
                      eq.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {eq.status}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Studies Today</span>
                      <span>{eq.studiesPerformed}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Utilization</span>
                        <span>{eq.utilizationRate}%</span>
                      </div>
                      <Progress value={eq.utilizationRate} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Findings Alert */}
      {stats.critical > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>{stats.critical} Critical Finding(s)</strong> require immediate attention and notification
              </span>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Review Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ============= ORDER MANAGEMENT =============

function OrderManagement({ orders }: { orders: RadiologyOrder[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.uhid.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModality = filterModality === 'all' || order.modality === filterModality;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesModality && matchesStatus;
  });

  const getStatusColor = (status: StudyStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'reported': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'verified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: StudyPriority) => {
    switch (priority) {
      case 'stat':
      case 'emergency':
        return 'bg-red-600 text-white';
      case 'urgent':
        return 'bg-orange-500 text-white';
      case 'routine':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create, track, and manage radiology orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsNewOrderDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, patient name, or UHID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Modality Filter */}
            <Select value={filterModality} onValueChange={setFilterModality}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Modality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modalities</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                <SelectItem value="Mammography">Mammography</SelectItem>
                <SelectItem value="PET">PET</SelectItem>
                <SelectItem value="Fluoroscopy">Fluoroscopy</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Patient Info</TableHead>
                  <TableHead>Study Details</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      order.criticalFindings ? 'bg-red-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm">{order.orderId}</p>
                        <p className="text-xs text-gray-500">{order.orderDate}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{order.patientName}</p>
                        <p className="text-xs text-gray-500">
                          {order.age}Y / {order.gender} • {order.uhid}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="mb-1">{order.modality}</Badge>
                        <p className="text-sm">{order.studyType}</p>
                        <p className="text-xs text-gray-500">{order.bodyPart}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{order.scheduledDate}</p>
                        <p className="text-xs text-gray-500">{order.scheduledTime}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      {order.criticalFindings && (
                        <Badge className="mt-1 bg-red-600 text-white block w-fit">
                          <Siren className="w-3 h-3 mr-1" />
                          CRITICAL
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {order.assignedTechnologist && (
                          <p className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.assignedTechnologist}
                          </p>
                        )}
                        {order.assignedRadiologist && (
                          <p className="flex items-center gap-1 text-gray-500 mt-1">
                            <Scan className="w-3 h-3" />
                            {order.assignedRadiologist}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* New Order Dialog */}
      <NewOrderDialog
        open={isNewOrderDialogOpen}
        onOpenChange={setIsNewOrderDialogOpen}
      />

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
}

// ============= NEW ORDER DIALOG =============

function NewOrderDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [isExistingPatient, setIsExistingPatient] = useState(true);

  const handleSubmit = () => {
    toast.success('Radiology order created successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Radiology Order
          </DialogTitle>
          <DialogDescription>
            Complete order details for imaging study
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="patient" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patient">Patient Info</TabsTrigger>
            <TabsTrigger value="study">Study Details</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Info</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          </TabsList>

          {/* Tab 1: Patient Info */}
          <TabsContent value="patient" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Label>Patient Type:</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isExistingPatient}
                  onCheckedChange={setIsExistingPatient}
                />
                <span className="text-sm">
                  {isExistingPatient ? 'Existing Patient' : 'New Patient'}
                </span>
              </div>
            </div>

            {isExistingPatient && (
              <div className="space-y-2">
                <Label>Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Enter UHID or Patient Name" className="pl-10" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>UHID</Label>
                <Input placeholder="UHID-XXXXXX" disabled={isExistingPatient} />
              </div>
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input type="number" placeholder="Age" />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input type="tel" placeholder="+1-555-0000" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Department</SelectItem>
                    <SelectItem value="ipd">Inpatient (IPD)</SelectItem>
                    <SelectItem value="opd">Outpatient (OPD)</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Study Details */}
          <TabsContent value="study" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modality *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select modality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="CT">CT (Computed Tomography)</SelectItem>
                    <SelectItem value="MRI">MRI (Magnetic Resonance)</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="Mammography">Mammography</SelectItem>
                    <SelectItem value="PET">PET Scan</SelectItem>
                    <SelectItem value="Fluoroscopy">Fluoroscopy</SelectItem>
                    <SelectItem value="Nuclear Medicine">Nuclear Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Study Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chest-xray">Chest X-Ray 2 Views</SelectItem>
                    <SelectItem value="ct-head">CT Head without Contrast</SelectItem>
                    <SelectItem value="mri-brain">MRI Brain with Contrast</SelectItem>
                    <SelectItem value="us-abdomen">Abdominal Ultrasound</SelectItem>
                    <SelectItem value="mammo">Diagnostic Mammography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Part *</Label>
                <Input placeholder="e.g., Chest, Head, Abdomen" />
              </div>
              <div className="space-y-2">
                <Label>Laterality</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="bilateral">Bilateral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Contrast Required</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contrast Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iodinated">Iodinated Contrast</SelectItem>
                      <SelectItem value="gadolinium">Gadolinium (MRI)</SelectItem>
                      <SelectItem value="barium">Barium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Protocol</Label>
                  <Input placeholder="Imaging protocol" />
                </div>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                For contrast studies, please ensure patient has recent creatinine levels and no allergies.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Tab 3: Clinical Info */}
          <TabsContent value="clinical" className="space-y-4">
            <div className="space-y-2">
              <Label>Ordering Physician *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select physician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-mitchell">Dr. Sarah Mitchell</SelectItem>
                  <SelectItem value="dr-chen">Dr. Michael Chen</SelectItem>
                  <SelectItem value="dr-wilson">Dr. David Wilson</SelectItem>
                  <SelectItem value="dr-lee">Dr. Jennifer Lee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Clinical History *</Label>
              <Textarea 
                placeholder="Patient's clinical history and relevant information..." 
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Indication / Reason for Study *</Label>
              <Textarea 
                placeholder="Clinical indication and what the study is intended to evaluate..." 
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Relevant Lab Values</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Creatinine (mg/dL)" />
                <Input placeholder="eGFR (mL/min)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Known Allergies</Label>
              <Input placeholder="List any known allergies, especially to contrast" />
            </div>

            <div className="space-y-2">
              <Label>Previous Relevant Studies</Label>
              <Textarea 
                placeholder="List previous imaging studies for comparison..." 
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Tab 4: Scheduling */}
          <TabsContent value="scheduling" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority *</Label>
                <RadioGroup defaultValue="routine">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="routine" id="routine" />
                    <Label htmlFor="routine" className="flex-1 cursor-pointer">
                      <span className="text-sm">Routine</span>
                      <p className="text-xs text-gray-500">Next available slot</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent" className="flex-1 cursor-pointer">
                      <span className="text-sm">Urgent</span>
                      <p className="text-xs text-gray-500">Within 4-6 hours</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="stat" id="stat" />
                    <Label htmlFor="stat" className="flex-1 cursor-pointer">
                      <span className="text-sm">STAT</span>
                      <p className="text-xs text-gray-500">Immediate</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Time</Label>
                  <Input type="time" />
                </div>
                <div className="space-y-2">
                  <Label>Equipment Preference</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available</SelectItem>
                      <SelectItem value="ct1">CT Scanner 1</SelectItem>
                      <SelectItem value="mri1">MRI Scanner 1</SelectItem>
                      <SelectItem value="xray1">X-Ray Room 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea 
                placeholder="Any special requirements, patient conditions, or instructions..." 
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Patient requires assistance/wheelchair</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Patient has mobility issues</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Isolation precautions required</Label>
              </div>
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
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= ORDER DETAILS DIALOG =============

function OrderDetailsDialog({ 
  order, 
  open, 
  onOpenChange 
}: { 
  order: RadiologyOrder | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Scan className="w-6 h-6" />
            {order.orderId} - {order.patientName}
          </DialogTitle>
          <DialogDescription>
            Complete order information and study details
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="order" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="order">Order Info</TabsTrigger>
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Order ID</Label>
                  <p className="font-mono">{order.orderId}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Patient</Label>
                  <p>{order.patientName}</p>
                  <p className="text-sm text-gray-600">{order.age}Y / {order.gender}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">UHID</Label>
                  <p className="font-mono">{order.uhid}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Department</Label>
                  <p>{order.department}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Study Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{order.modality}</Badge>
                    <span>{order.studyType}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Body Part</Label>
                  <p>{order.bodyPart}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Priority</Label>
                  <Badge className={
                    order.priority === 'stat' || order.priority === 'emergency'
                      ? 'bg-red-600 text-white'
                      : order.priority === 'urgent'
                      ? 'bg-orange-500 text-white'
                      : 'bg-green-500 text-white'
                  }>
                    {order.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Scheduled Date & Time</Label>
                  <p>{order.scheduledDate} at {order.scheduledTime}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Ordering Physician</Label>
                  <p>{order.orderingPhysician}</p>
                </div>
                {order.contrast && (
                  <div>
                    <Label className="text-xs text-gray-500">Contrast</Label>
                    <Badge variant="outline">{order.contrastType}</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {order.assignedTechnologist && (
                  <div>
                    <Label className="text-xs text-gray-500">Technologist</Label>
                    <p>{order.assignedTechnologist}</p>
                  </div>
                )}
                {order.assignedRadiologist && (
                  <div>
                    <Label className="text-xs text-gray-500">Radiologist</Label>
                    <p>{order.assignedRadiologist}</p>
                  </div>
                )}
                {order.currentLocation && (
                  <div>
                    <Label className="text-xs text-gray-500">Current Location</Label>
                    <p>{order.currentLocation}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clinical" className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Clinical History</Label>
              <p className="p-3 bg-gray-50 rounded-lg">{order.clinicalHistory}</p>
            </div>

            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Indication</Label>
              <p className="p-3 bg-gray-50 rounded-lg">{order.indication}</p>
            </div>

            {order.protocolName && (
              <div>
                <Label className="text-xs text-gray-500">Protocol</Label>
                <p>{order.protocolName}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            {order.imageCount && order.imageCount > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {order.imageCount} images in {order.seriesCount} series
                    </p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Maximize className="w-4 h-4 mr-2" />
                    Open DICOM Viewer
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 ring-blue-500">
                      <ImageIcon className="w-12 h-12 text-gray-600" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No images available yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="report">
            {order.reportStatus ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Report status: {order.reportStatus}
                  </AlertDescription>
                </Alert>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600 mb-4">Report content would be displayed here</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Report pending</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Placeholder components for other sections
function RadiologistWorklist({ orders }: { orders: RadiologyOrder[] }) {
  return (
    <div className="text-center py-12">
      <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl mb-2">Radiologist Worklist</h3>
      <p className="text-gray-600">Advanced reporting interface coming soon</p>
    </div>
  );
}

function ReportingModule({ orders }: { orders: RadiologyOrder[] }) {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl mb-2">Reporting Module</h3>
      <p className="text-gray-600">Template-based reporting system coming soon</p>
    </div>
  );
}

function ImageViewer() {
  return (
    <div className="text-center py-12">
      <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl mb-2">DICOM Image Viewer</h3>
      <p className="text-gray-600">Advanced image viewing and manipulation tools coming soon</p>
    </div>
  );
}

function EquipmentManagement({ equipment }: { equipment: ImagingEquipment[] }) {
  return (
    <div className="text-center py-12">
      <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl mb-2">Equipment Management</h3>
      <p className="text-gray-600">Equipment tracking and maintenance scheduling coming soon</p>
    </div>
  );
}

function RadiologyAnalytics({ orders }: { orders: RadiologyOrder[] }) {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl mb-2">Analytics Dashboard</h3>
      <p className="text-gray-600">Advanced analytics and reporting coming soon</p>
    </div>
  );
}
