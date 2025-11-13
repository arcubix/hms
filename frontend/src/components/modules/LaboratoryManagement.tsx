/**
 * Advanced Laboratory Management System
 * 
 * Features:
 * - Complete test catalog management
 * - Sample collection & tracking with barcode
 * - Multi-level result validation workflow
 * - Quality control & instrument management
 * - Advanced analytics & TAT monitoring
 * - Integration with patient records
 * - Digital report generation
 * - Inventory management for reagents
 * - AI-powered validation & alerts
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import {
  Microscope,
  FlaskConical,
  TestTube,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  RefreshCw,
  Send,
  AlertTriangle,
  Beaker,
  Droplet,
  Thermometer,
  Zap,
  Shield,
  Award,
  Package,
  ClipboardList,
  UserCheck,
  Clock3,
  ArrowRight,
  Play,
  Pause,
  StopCircle,
  CheckCheck,
  Star,
  Bell,
  Info,
  ExternalLink,
  Barcode,
  ScanLine,
  Target,
  Workflow,
  Database,
  Brain,
  Sparkles
} from 'lucide-react';
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';

interface TestItem {
  id: string;
  code: string;
  name: string;
  category: string;
  department: string;
  sampleType: string;
  sampleVolume: string;
  container: string;
  methodology: string;
  price: number;
  tat: number; // Turnaround time in hours
  normalRange: {
    min: number;
    max: number;
    unit: string;
    notes?: string;
  };
  criticalRange?: {
    low: number;
    high: number;
  };
  isActive: boolean;
  preparationInstructions?: string;
}

interface TestOrder {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  doctorName: string;
  orderDate: string;
  orderTime: string;
  orderType: 'OPD' | 'IPD' | 'Emergency' | 'Walk-in';
  priority: 'routine' | 'urgent' | 'stat';
  tests: {
    testId: string;
    testName: string;
    testCode: string;
    category: string;
    price: number;
    status: 'ordered' | 'collected' | 'processing' | 'validated' | 'completed' | 'reported';
  }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

interface Sample {
  id: string;
  sampleId: string;
  barcode: string;
  orderId: string;
  patientName: string;
  testName: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  collectedBy: string;
  status: 'collected' | 'received' | 'processing' | 'tested' | 'stored' | 'disposed';
  location?: string;
  condition?: 'good' | 'hemolyzed' | 'clotted' | 'insufficient';
  remarks?: string;
}

interface TestResult {
  id: string;
  orderId: string;
  patientName: string;
  testName: string;
  testCode: string;
  resultValue: string;
  unit: string;
  normalRange: string;
  status: 'pending' | 'entered' | 'tech-verified' | 'supervisor-approved' | 'pathologist-signed';
  enteredBy?: string;
  enteredDate?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  isCritical: boolean;
  isAbnormal: boolean;
  comments?: string;
}

interface QualityControl {
  id: string;
  testName: string;
  instrumentName: string;
  controlLevel: 'Level 1' | 'Level 2' | 'Level 3';
  expectedValue: number;
  observedValue: number;
  date: string;
  time: string;
  performedBy: string;
  status: 'pass' | 'fail' | 'warning';
  comments?: string;
}

interface Instrument {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  department: string;
  status: 'operational' | 'maintenance' | 'down' | 'calibration';
  lastMaintenance: string;
  nextMaintenance: string;
  testsPerformed: number;
  utilization: number;
}

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757', '#9B51E0', '#56CCF2', '#6FCF97'];

const mockTests: TestItem[] = [
  {
    id: '1',
    code: 'CBC001',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    department: 'Hematology',
    sampleType: 'Whole Blood',
    sampleVolume: '2-3 ml',
    container: 'EDTA Tube (Purple)',
    methodology: 'Automated Cell Counter',
    price: 800,
    tat: 2,
    normalRange: { min: 4.5, max: 11, unit: 'x10^9/L', notes: 'WBC count' },
    criticalRange: { low: 2.0, high: 30.0 },
    isActive: true
  },
  {
    id: '2',
    code: 'BIO002',
    name: 'Fasting Blood Sugar',
    category: 'Biochemistry',
    department: 'Clinical Chemistry',
    sampleType: 'Serum',
    sampleVolume: '1 ml',
    container: 'Red Top Tube',
    methodology: 'Enzymatic Method',
    price: 300,
    tat: 1,
    normalRange: { min: 70, max: 100, unit: 'mg/dL' },
    criticalRange: { low: 40, high: 400 },
    isActive: true,
    preparationInstructions: '8-12 hours fasting required'
  },
  {
    id: '3',
    code: 'BIO003',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Biochemistry',
    department: 'Clinical Chemistry',
    sampleType: 'Whole Blood',
    sampleVolume: '1 ml',
    container: 'EDTA Tube',
    methodology: 'HPLC',
    price: 1200,
    tat: 3,
    normalRange: { min: 4, max: 5.6, unit: '%' },
    criticalRange: { low: 3, high: 15 },
    isActive: true
  },
  {
    id: '4',
    code: 'MIC004',
    name: 'Urine Culture & Sensitivity',
    category: 'Microbiology',
    department: 'Microbiology',
    sampleType: 'Urine',
    sampleVolume: '10 ml',
    container: 'Sterile Container',
    methodology: 'Culture Method',
    price: 1500,
    tat: 48,
    normalRange: { min: 0, max: 0, unit: 'CFU/ml', notes: 'No growth' },
    isActive: true
  },
  {
    id: '5',
    code: 'SER005',
    name: 'Lipid Profile',
    category: 'Biochemistry',
    department: 'Clinical Chemistry',
    sampleType: 'Serum',
    sampleVolume: '2 ml',
    container: 'Red Top Tube',
    methodology: 'Enzymatic Colorimetric',
    price: 1800,
    tat: 4,
    normalRange: { min: 150, max: 200, unit: 'mg/dL', notes: 'Total Cholesterol' },
    isActive: true,
    preparationInstructions: '12-14 hours fasting required'
  }
];

const mockOrders: TestOrder[] = [
  {
    id: '1',
    orderId: 'LAB-2025-001',
    patientId: 'PT-12345',
    patientName: 'Ahmed Khan',
    patientAge: 45,
    patientGender: 'male',
    doctorName: 'Dr. Sarah Ahmed',
    orderDate: '2025-11-10',
    orderTime: '09:30 AM',
    orderType: 'OPD',
    priority: 'routine',
    tests: [
      { testId: '1', testName: 'Complete Blood Count (CBC)', testCode: 'CBC001', category: 'Hematology', price: 800, status: 'validated' },
      { testId: '2', testName: 'Fasting Blood Sugar', testCode: 'BIO002', category: 'Biochemistry', price: 300, status: 'validated' }
    ],
    totalAmount: 1100,
    paymentStatus: 'paid',
    status: 'completed'
  },
  {
    id: '2',
    orderId: 'LAB-2025-002',
    patientId: 'PT-12346',
    patientName: 'Fatima Ali',
    patientAge: 32,
    patientGender: 'female',
    doctorName: 'Dr. Ali Khan',
    orderDate: '2025-11-10',
    orderTime: '10:15 AM',
    orderType: 'Emergency',
    priority: 'stat',
    tests: [
      { testId: '1', testName: 'Complete Blood Count (CBC)', testCode: 'CBC001', category: 'Hematology', price: 800, status: 'processing' },
      { testId: '3', testName: 'HbA1c', testCode: 'BIO003', category: 'Biochemistry', price: 1200, status: 'collected' }
    ],
    totalAmount: 2000,
    paymentStatus: 'paid',
    status: 'in-progress'
  },
  {
    id: '3',
    orderId: 'LAB-2025-003',
    patientId: 'PT-12347',
    patientName: 'Hassan Raza',
    patientAge: 58,
    patientGender: 'male',
    doctorName: 'Dr. Ayesha Rahman',
    orderDate: '2025-11-10',
    orderTime: '11:00 AM',
    orderType: 'IPD',
    priority: 'urgent',
    tests: [
      { testId: '5', testName: 'Lipid Profile', testCode: 'SER005', category: 'Biochemistry', price: 1800, status: 'collected' }
    ],
    totalAmount: 1800,
    paymentStatus: 'pending',
    status: 'in-progress'
  }
];

const mockSamples: Sample[] = [
  {
    id: '1',
    sampleId: 'SMP-001',
    barcode: '*123456789*',
    orderId: 'LAB-2025-001',
    patientName: 'Ahmed Khan',
    testName: 'CBC',
    sampleType: 'Whole Blood',
    collectionDate: '2025-11-10',
    collectionTime: '09:45 AM',
    collectedBy: 'Nurse Maria',
    status: 'tested',
    location: 'Hematology Lab - Station 3',
    condition: 'good'
  },
  {
    id: '2',
    sampleId: 'SMP-002',
    barcode: '*123456790*',
    orderId: 'LAB-2025-002',
    patientName: 'Fatima Ali',
    testName: 'CBC',
    sampleType: 'Whole Blood',
    collectionDate: '2025-11-10',
    collectionTime: '10:30 AM',
    collectedBy: 'Lab Tech John',
    status: 'processing',
    location: 'Hematology Lab - Station 1',
    condition: 'good'
  },
  {
    id: '3',
    sampleId: 'SMP-003',
    barcode: '*123456791*',
    orderId: 'LAB-2025-003',
    patientName: 'Hassan Raza',
    testName: 'Lipid Profile',
    sampleType: 'Serum',
    collectionDate: '2025-11-10',
    collectionTime: '11:15 AM',
    collectedBy: 'Nurse Sarah',
    status: 'received',
    location: 'Sample Reception',
    condition: 'good'
  }
];

const mockQC: QualityControl[] = [
  {
    id: '1',
    testName: 'Glucose',
    instrumentName: 'AutoAnalyzer 3000',
    controlLevel: 'Level 2',
    expectedValue: 100,
    observedValue: 98,
    date: '2025-11-10',
    time: '08:00 AM',
    performedBy: 'Tech. Ahmed',
    status: 'pass'
  },
  {
    id: '2',
    testName: 'Hemoglobin',
    instrumentName: 'Hematology Analyzer XN',
    controlLevel: 'Level 1',
    expectedValue: 12.5,
    observedValue: 12.8,
    date: '2025-11-10',
    time: '08:15 AM',
    performedBy: 'Tech. Sarah',
    status: 'warning'
  }
];

export function LaboratoryManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [tests] = useState<TestItem[]>(mockTests);
  const [orders] = useState<TestOrder[]>(mockOrders);
  const [samples] = useState<Sample[]>(mockSamples);
  const [qcRecords] = useState<QualityControl[]>(mockQC);

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isResultEntryOpen, setIsResultEntryOpen] = useState(false);
  const [isQCEntryOpen, setIsQCEntryOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'validated':
      case 'tested':
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
      case 'processing':
      case 'collected':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
      case 'ordered':
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stat':
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'stat':
        return <Zap className="w-4 h-4 text-red-600" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const renderDashboard = () => {
    const testVolumeData = [
      { date: 'Nov 4', tests: 85, revenue: 125000 },
      { date: 'Nov 5', tests: 92, revenue: 138000 },
      { date: 'Nov 6', tests: 78, revenue: 115000 },
      { date: 'Nov 7', tests: 105, revenue: 158000 },
      { date: 'Nov 8', tests: 95, revenue: 142000 },
      { date: 'Nov 9', tests: 110, revenue: 165000 },
      { date: 'Nov 10', tests: 118, revenue: 175000 }
    ];

    const categoryData = [
      { name: 'Hematology', value: 35, count: 145 },
      { name: 'Biochemistry', value: 30, count: 125 },
      { name: 'Microbiology', value: 15, count: 62 },
      { name: 'Serology', value: 12, count: 50 },
      { name: 'Pathology', value: 8, count: 33 }
    ];

    const tatData = [
      { category: 'Hematology', avgTAT: 2.3, target: 2 },
      { category: 'Biochemistry', avgTAT: 3.1, target: 3 },
      { category: 'Microbiology', avgTAT: 45, target: 48 },
      { category: 'Serology', avgTAT: 4.5, target: 4 }
    ];

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TestTube className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">118</h3>
              <p className="text-sm text-gray-600">Today's Tests</p>
              <p className="text-xs text-green-600 mt-2">+12.5% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-700">85%</Badge>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">45</h3>
              <p className="text-sm text-gray-600">Pending Reports</p>
              <p className="text-xs text-gray-500 mt-2">28 ready for validation</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-700">Avg</Badge>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">2.8h</h3>
              <p className="text-sm text-gray-600">Avg TAT (Today)</p>
              <p className="text-xs text-green-600 mt-2">Within target time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">8</h3>
              <p className="text-sm text-gray-600">STAT/Urgent Tests</p>
              <p className="text-xs text-red-600 mt-2">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Volume & Revenue Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Volume & Revenue</CardTitle>
                  <CardDescription>Last 7 days performance</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={testVolumeData}>
                  <defs>
                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2F80ED" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#27AE60" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="tests" stroke="#2F80ED" fillOpacity={1} fill="url(#colorTests)" name="Tests" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#27AE60" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (PKR)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Test Distribution by Category */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Distribution</CardTitle>
                  <CardDescription>By department/category</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {categoryData.map((cat, index) => (
                    <div key={cat.name} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                        </div>
                        <Badge variant="outline">{cat.count}</Badge>
                      </div>
                      <Progress value={cat.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TAT Performance & Critical Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TAT Performance */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-blue-600" />
                Turnaround Time Performance
              </CardTitle>
              <CardDescription>Average TAT vs Target by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBar data={tatData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgTAT" fill="#2F80ED" name="Actual TAT (hours)" />
                  <Bar dataKey="target" fill="#27AE60" name="Target TAT (hours)" />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Critical Alerts
              </CardTitle>
              <CardDescription>Requires immediate action</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[250px]">
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Critical Result</p>
                        <p className="text-xs text-red-700 mt-1">Glucose: 450 mg/dL - Ahmed Khan</p>
                        <p className="text-xs text-red-600 mt-1">5 mins ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50 rounded">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">TAT Exceeded</p>
                        <p className="text-xs text-orange-700 mt-1">Culture pending - 52 hrs</p>
                        <p className="text-xs text-orange-600 mt-1">15 mins ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">QC Warning</p>
                        <p className="text-xs text-yellow-700 mt-1">Hemoglobin control out of range</p>
                        <p className="text-xs text-yellow-600 mt-1">30 mins ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Low Reagent</p>
                        <p className="text-xs text-purple-700 mt-1">CBC reagent below minimum</p>
                        <p className="text-xs text-purple-600 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Test Orders</CardTitle>
                <CardDescription>Latest laboratory requisitions</CardDescription>
              </div>
              <Button onClick={() => setActiveSection('orders')} variant="outline">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{order.patientName}</p>
                        <p className="text-xs text-gray-500">{order.patientAge}Y • {order.patientGender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.tests.length} tests</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(order.priority)}
                        <Badge className={getStatusColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{order.orderTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return <TestOrders orders={orders} />;
      case 'samples':
        return <SampleTracking samples={samples} />;
      case 'results':
        return <ResultEntry />;
      case 'reports':
        return <ReportGeneration />;
      case 'test-catalog':
        return <TestCatalog tests={tests} />;
      case 'quality-control':
        return <QualityControl qcRecords={qcRecords} />;
      case 'instruments':
        return <InstrumentManagement />;
      case 'analytics':
        return <AdvancedAnalytics />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Laboratory Management System</h1>
              <p className="text-sm text-blue-100">Advanced diagnostics & quality control</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              <Badge className="bg-red-500 text-white ml-2">8</Badge>
            </Button>
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-slate-800 text-white min-h-screen p-4">
          <div className="space-y-6">
            {/* Main Menu */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase">Main Menu</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Test Orders</span>
                  <Badge className="ml-auto bg-orange-500">8</Badge>
                </button>
                <button
                  onClick={() => setActiveSection('samples')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'samples' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <TestTube className="w-5 h-5" />
                  <span>Sample Tracking</span>
                </button>
                <button
                  onClick={() => setActiveSection('results')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'results' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Result Entry</span>
                  <Badge className="ml-auto bg-blue-500">45</Badge>
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Printer className="w-5 h-5" />
                  <span>Reports</span>
                </button>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Laboratory Setup */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase">Laboratory Setup</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('test-catalog')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'test-catalog' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <FlaskConical className="w-5 h-5" />
                  <span>Test Catalog</span>
                </button>
                <button
                  onClick={() => setActiveSection('quality-control')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'quality-control' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Quality Control</span>
                </button>
                <button
                  onClick={() => setActiveSection('instruments')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'instruments' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Beaker className="w-5 h-5" />
                  <span>Instruments</span>
                </button>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Analytics */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase">Analytics & AI</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Advanced Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Sub-components

function TestOrders({ orders }: { orders: TestOrder[] }) {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Manage laboratory test requisitions</p>
        </div>
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Test Order</DialogTitle>
              <DialogDescription>Order laboratory tests for patient</DialogDescription>
            </DialogHeader>
            <NewOrderForm onClose={() => setIsNewOrderOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by order ID, patient name..." className="pl-10" />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Order Details</TableHead>
                <TableHead>Patient Information</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{order.orderId}</p>
                      <p className="text-xs text-gray-500">{order.orderDate} • {order.orderTime}</p>
                      <Badge variant="outline" className="mt-1">{order.orderType}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{order.patientName}</p>
                      <p className="text-xs text-gray-500">{order.patientAge}Y • {order.patientGender}</p>
                      <p className="text-xs text-gray-400">{order.patientId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{order.doctorName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.tests.slice(0, 2).map((test) => (
                        <div key={test.testId} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{test.testCode}</Badge>
                          <span className="text-xs text-gray-600">{test.testName}</span>
                        </div>
                      ))}
                      {order.tests.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{order.tests.length - 2} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      order.priority === 'stat' ? 'bg-red-100 text-red-800' :
                      order.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">PKR {order.totalAmount.toLocaleString()}</p>
                      <Badge variant="outline" className={`text-xs mt-1 ${
                        order.paymentStatus === 'paid' ? 'text-green-600' :
                        order.paymentStatus === 'partial' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SampleTracking({ samples }: { samples: Sample[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sample Tracking</h2>
          <p className="text-sm text-gray-600 mt-1">Track samples from collection to disposal</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <ScanLine className="w-4 h-4 mr-2" />
          Scan Barcode
        </Button>
      </div>

      {/* Sample Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { status: 'Collected', count: 24, color: 'blue', icon: TestTube },
          { status: 'Received', count: 18, color: 'purple', icon: CheckCircle },
          { status: 'Processing', count: 12, color: 'yellow', icon: RefreshCw },
          { status: 'Tested', count: 35, color: 'green', icon: CheckCheck },
          { status: 'Stored', count: 8, color: 'gray', icon: Package }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.status} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 text-${item.color}-600`} />
                  <Badge className={`bg-${item.color}-100 text-${item.color}-800`}>{item.count}</Badge>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.status}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Samples Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input placeholder="Search by sample ID, barcode, patient name..." />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="tested">Tested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Sample ID</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Sample Type</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample) => (
                <TableRow key={sample.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{sample.sampleId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-gray-400" />
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{sample.barcode}</code>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{sample.patientName}</TableCell>
                  <TableCell className="text-sm text-gray-700">{sample.testName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sample.sampleType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{sample.collectionDate}</p>
                      <p className="text-xs text-gray-500">{sample.collectionTime}</p>
                      <p className="text-xs text-gray-400">{sample.collectedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      sample.status === 'tested' ? 'bg-green-100 text-green-800' :
                      sample.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      sample.status === 'received' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sample.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{sample.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${
                      sample.condition === 'good' ? 'text-green-600' :
                      sample.condition === 'hemolyzed' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {sample.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultEntry() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Result Entry & Validation</h2>
          <p className="text-sm text-gray-600 mt-1">Enter, verify, and approve test results</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            AI Validate
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Bulk Approve
          </Button>
        </div>
      </div>

      {/* Workflow Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-600" />
            Validation Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { label: 'Pending Entry', count: 28, color: 'gray' },
              { label: 'Entered', count: 15, color: 'blue' },
              { label: 'Tech Verified', count: 12, color: 'yellow' },
              { label: 'Supervisor Approved', count: 8, color: 'purple' },
              { label: 'Pathologist Signed', count: 45, color: 'green' }
            ].map((stage, index) => (
              <div key={stage.label} className="flex items-center">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-${stage.color}-100 flex items-center justify-center mb-2`}>
                    <span className={`text-xl font-bold text-${stage.color}-600`}>{stage.count}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{stage.label}</p>
                </div>
                {index < 4 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result Entry Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Enter Test Results</CardTitle>
          <CardDescription>Patient: Ahmed Khan • Order: LAB-2025-001 • Test: Complete Blood Count</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { parameter: 'WBC Count', normal: '4.5-11.0', unit: 'x10^9/L', value: '' },
                { parameter: 'RBC Count', normal: '4.5-5.5', unit: 'x10^12/L', value: '' },
                { parameter: 'Hemoglobin', normal: '13.5-17.5', unit: 'g/dL', value: '' },
                { parameter: 'Hematocrit', normal: '40-50', unit: '%', value: '' },
                { parameter: 'Platelets', normal: '150-400', unit: 'x10^9/L', value: '' },
                { parameter: 'Neutrophils', normal: '40-75', unit: '%', value: '' }
              ].map((param) => (
                <div key={param.parameter} className="space-y-2">
                  <Label>{param.parameter}</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <div className="w-24 flex items-center justify-center bg-gray-50 border border-gray-300 rounded-md px-3 text-sm text-gray-600">
                      {param.unit}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Normal: {param.normal} {param.unit}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Comments / Remarks</Label>
              <Textarea 
                placeholder="Enter any additional comments or observations..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="critical" className="w-4 h-4" />
              <Label htmlFor="critical" className="text-sm font-normal">
                Mark as Critical Value (Requires immediate notification)
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Submit for Verification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportGeneration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Generation</h2>
          <p className="text-sm text-gray-600 mt-1">Generate and print laboratory reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Printer className="w-4 h-4 mr-2" />
            Bulk Print
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle>Report Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              {/* Lab Report Layout */}
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b-2 border-blue-600 pb-4">
                  <h1 className="text-2xl font-bold text-blue-600">HOSPITAL LABORATORY</h1>
                  <p className="text-sm text-gray-600 mt-1">Advanced Diagnostic Services</p>
                  <p className="text-xs text-gray-500">123 Medical Street, Karachi • +92-300-1234567</p>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Patient Name:</span>
                      <span className="text-sm font-medium">Ahmed Khan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Age/Gender:</span>
                      <span className="text-sm font-medium">45Y / Male</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Patient ID:</span>
                      <span className="text-sm font-medium">PT-12345</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lab No:</span>
                      <span className="text-sm font-medium">LAB-2025-001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Collection Date:</span>
                      <span className="text-sm font-medium">10-Nov-2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Report Date:</span>
                      <span className="text-sm font-medium">10-Nov-2025</span>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">COMPLETE BLOOD COUNT (CBC)</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead>Parameter</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Normal Range</TableHead>
                        <TableHead>Flag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>WBC Count</TableCell>
                        <TableCell className="font-medium">8.5</TableCell>
                        <TableCell>x10^9/L</TableCell>
                        <TableCell>4.5 - 11.0</TableCell>
                        <TableCell><CheckCircle className="w-4 h-4 text-green-600" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>RBC Count</TableCell>
                        <TableCell className="font-medium">4.8</TableCell>
                        <TableCell>x10^12/L</TableCell>
                        <TableCell>4.5 - 5.5</TableCell>
                        <TableCell><CheckCircle className="w-4 h-4 text-green-600" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Hemoglobin</TableCell>
                        <TableCell className="font-medium">14.2</TableCell>
                        <TableCell>g/dL</TableCell>
                        <TableCell>13.5 - 17.5</TableCell>
                        <TableCell><CheckCircle className="w-4 h-4 text-green-600" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-8">
                      <p className="text-sm font-medium">Technologist</p>
                      <p className="text-xs text-gray-500">Ahmed Ali</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-8">
                      <p className="text-sm font-medium">Verified By</p>
                      <p className="text-xs text-gray-500">Dr. Sarah Ahmed</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-8">
                      <p className="text-sm font-medium">Pathologist</p>
                      <p className="text-xs text-gray-500">Dr. Ali Khan</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-500 pt-4">*** End of Report ***</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Queue */}
        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-base">Ready for Print</CardTitle>
              <CardDescription>Reports awaiting final approval</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-3">
                  {[
                    { patient: 'Ahmed Khan', test: 'CBC', id: 'LAB-001', status: 'ready' },
                    { patient: 'Fatima Ali', test: 'Lipid Profile', id: 'LAB-002', status: 'ready' },
                    { patient: 'Hassan Raza', test: 'Blood Sugar', id: 'LAB-003', status: 'pending' },
                    { patient: 'Ayesha Khan', test: 'Urine C/S', id: 'LAB-004', status: 'ready' }
                  ].map((report) => (
                    <Card key={report.id} className="border-2 hover:border-blue-300 cursor-pointer transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{report.id}</Badge>
                          <Badge className={report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm text-gray-900">{report.patient}</p>
                        <p className="text-xs text-gray-600 mt-1">{report.test}</p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="flex-1 h-7 text-xs bg-blue-600">
                            <Printer className="w-3 h-3 mr-1" />
                            Print
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TestCatalog({ tests }: { tests: TestItem[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Catalog</h2>
          <p className="text-sm text-gray-600 mt-1">Manage laboratory test master list</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Test
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Test Code</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sample Type</TableHead>
                <TableHead>TAT</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{test.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{test.name}</p>
                      <p className="text-xs text-gray-500">{test.methodology}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{test.sampleType}</TableCell>
                  <TableCell className="text-sm text-gray-700">{test.tat}h</TableCell>
                  <TableCell className="font-medium text-green-600">PKR {test.price}</TableCell>
                  <TableCell>
                    <Badge className={test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {test.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function QualityControl({ qcRecords }: { qcRecords: QualityControl[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quality Control</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor QC samples and instrument calibration</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New QC Entry
        </Button>
      </div>

      {/* QC Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">QC Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's QC</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QC Records Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Test Name</TableHead>
                <TableHead>Instrument</TableHead>
                <TableHead>Control Level</TableHead>
                <TableHead>Expected Value</TableHead>
                <TableHead>Observed Value</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qcRecords.map((qc) => (
                <TableRow key={qc.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{qc.testName}</TableCell>
                  <TableCell className="text-sm text-gray-700">{qc.instrumentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{qc.controlLevel}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{qc.expectedValue}</TableCell>
                  <TableCell className="font-medium">{qc.observedValue}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">{qc.date}</p>
                      <p className="text-xs text-gray-500">{qc.time}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">{qc.performedBy}</TableCell>
                  <TableCell>
                    <Badge className={`${
                      qc.status === 'pass' ? 'bg-green-100 text-green-800' :
                      qc.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {qc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InstrumentManagement() {
  const instruments: Instrument[] = [
    { id: '1', name: 'AutoAnalyzer 3000', model: 'AA-3000X', serialNumber: 'SN-12345', department: 'Clinical Chemistry', status: 'operational', lastMaintenance: '2025-10-15', nextMaintenance: '2025-11-15', testsPerformed: 15420, utilization: 85 },
    { id: '2', name: 'Hematology Analyzer XN', model: 'XN-1000', serialNumber: 'SN-67890', department: 'Hematology', status: 'operational', lastMaintenance: '2025-10-20', nextMaintenance: '2025-11-20', testsPerformed: 12850, utilization: 78 },
    { id: '3', name: 'Microbiology Incubator', model: 'MI-500', serialNumber: 'SN-11111', department: 'Microbiology', status: 'maintenance', lastMaintenance: '2025-11-09', nextMaintenance: '2025-12-09', testsPerformed: 0, utilization: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Instrument Management</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor equipment status and maintenance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Instrument
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {instruments.map((instrument) => (
          <Card key={instrument.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${
                    instrument.status === 'operational' ? 'bg-green-100' :
                    instrument.status === 'maintenance' ? 'bg-yellow-100' :
                    'bg-red-100'
                  } flex items-center justify-center`}>
                    <Beaker className={`w-6 h-6 ${
                      instrument.status === 'operational' ? 'text-green-600' :
                      instrument.status === 'maintenance' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{instrument.name}</CardTitle>
                    <p className="text-xs text-gray-500">{instrument.model}</p>
                  </div>
                </div>
                <Badge className={`${
                  instrument.status === 'operational' ? 'bg-green-100 text-green-800' :
                  instrument.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {instrument.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Department</p>
                  <Badge variant="outline">{instrument.department}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Serial Number</p>
                  <p className="text-sm font-medium">{instrument.serialNumber}</p>
                </div>
                {instrument.status === 'operational' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tests Performed</p>
                      <p className="text-sm font-medium">{instrument.testsPerformed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Utilization</p>
                      <Progress value={instrument.utilization} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{instrument.utilization}%</p>
                    </div>
                  </>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Last Maintenance:</span>
                    <span className="font-medium">{instrument.lastMaintenance}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Next Due:</span>
                    <span className="font-medium text-orange-600">{instrument.nextMaintenance}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdvancedAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            Advanced Analytics & AI Insights
          </h2>
          <p className="text-sm text-gray-600 mt-1">Predictive analytics and intelligent reporting</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Report
        </Button>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Anomaly Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
            <p className="text-sm text-gray-600">Potential anomalies detected in today's results</p>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              Review Anomalies
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Predictive TAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">2.4h</div>
            <p className="text-sm text-gray-600">Predicted avg TAT for next week</p>
            <Progress value={65} className="mt-4" />
            <p className="text-xs text-gray-500 mt-2">Based on historical patterns</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">97.8%</div>
            <p className="text-sm text-gray-600">Overall laboratory quality index</p>
            <div className="flex items-center gap-2 mt-4">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional analytics cards can be added here */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Machine learning analysis of laboratory performance</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Advanced analytics dashboard coming soon...</p>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// New Order Form Component
function NewOrderForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Patient ID / Search</Label>
          <Input placeholder="Search patient..." />
        </div>
        <div className="space-y-2">
          <Label>Doctor</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dr1">Dr. Sarah Ahmed</SelectItem>
              <SelectItem value="dr2">Dr. Ali Khan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Order Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opd">OPD</SelectItem>
              <SelectItem value="ipd">IPD</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="stat">STAT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Tests</Label>
        <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
          {mockTests.slice(0, 5).map((test) => (
            <div key={test.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <input type="checkbox" className="w-4 h-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">{test.name}</p>
                <p className="text-xs text-gray-500">{test.category} • PKR {test.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Create Order</Button>
      </div>
    </div>
  );
}
