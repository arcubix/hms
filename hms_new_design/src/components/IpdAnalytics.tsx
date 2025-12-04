/**
 * IPD Analytics Dashboard
 * 
 * Comprehensive analytics and insights for IPD Management System
 * Features:
 * - Patient Analytics (admission/discharge trends, demographics, ALOS)
 * - Financial Analytics (revenue, billing, payment trends)
 * - Operational Analytics (bed occupancy, ward utilization, efficiency)
 * - Clinical Analytics (diagnosis patterns, procedures, medications)
 * - Quality Metrics (readmission rates, mortality, satisfaction)
 * - Predictive Analytics (forecasting, capacity planning)
 * - Export capabilities (PDF, Excel, CSV)
 * - Interactive charts with recharts
 * - Date range filters
 * - Comparative analysis
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Bed,
  DollarSign,
  Activity,
  Calendar,
  Download,
  FileText,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Building2,
  Stethoscope,
  Pill,
  AlertCircle,
  CheckCircle,
  Heart,
  Brain,
  Target,
  Zap,
  TrendingUp as Growth,
  Award,
  Shield,
  Thermometer,
  UserCheck,
  Eye,
  ChevronRight,
  Info,
  Gauge,
} from 'lucide-react';

// ============= COLOR SCHEMES =============
const COLORS = {
  primary: '#2F80ED',
  success: '#27AE60',
  warning: '#F2C94C',
  danger: '#EB5757',
  info: '#56CCF2',
  purple: '#9B51E0',
  orange: '#F2994A',
  pink: '#F06292',
};

const CHART_COLORS = [
  '#2F80ED', '#27AE60', '#F2C94C', '#EB5757', 
  '#56CCF2', '#9B51E0', '#F2994A', '#F06292'
];

// ============= MOCK DATA GENERATORS =============

// Patient Analytics Data
const admissionTrendData = [
  { month: 'Jan', admissions: 245, discharges: 238, active: 87 },
  { month: 'Feb', admissions: 268, discharges: 259, active: 96 },
  { month: 'Mar', admissions: 298, discharges: 285, active: 109 },
  { month: 'Apr', admissions: 275, discharges: 280, active: 104 },
  { month: 'May', admissions: 315, discharges: 305, active: 114 },
  { month: 'Jun', admissions: 342, discharges: 335, active: 121 },
  { month: 'Jul', admissions: 358, discharges: 348, active: 131 },
  { month: 'Aug', admissions: 385, discharges: 375, active: 141 },
  { month: 'Sep', admissions: 372, discharges: 380, active: 133 },
  { month: 'Oct', admissions: 395, discharges: 385, active: 143 },
  { month: 'Nov', admissions: 412, discharges: 405, active: 150 },
  { month: 'Dec', admissions: 398, discharges: 410, active: 138 },
];

const patientDemographicsData = [
  { name: '0-18', value: 245, percentage: 12 },
  { name: '19-35', value: 589, percentage: 28 },
  { name: '36-50', value: 698, percentage: 33 },
  { name: '51-65', value: 412, percentage: 20 },
  { name: '65+', value: 156, percentage: 7 },
];

const genderDistributionData = [
  { name: 'Male', value: 1245, percentage: 59 },
  { name: 'Female', value: 855, percentage: 41 },
];

const alosData = [
  { ward: 'General Ward', alos: 4.2, target: 4.0, variance: 0.2 },
  { ward: 'ICU', alos: 6.8, target: 7.0, variance: -0.2 },
  { ward: 'Pediatric', alos: 3.5, target: 3.5, variance: 0 },
  { ward: 'Maternity', alos: 2.8, target: 3.0, variance: -0.2 },
  { ward: 'Surgery', alos: 5.5, target: 5.0, variance: 0.5 },
  { ward: 'Cardiology', alos: 6.2, target: 6.0, variance: 0.2 },
];

// Financial Analytics Data
const revenueData = [
  { month: 'Jan', revenue: 4250000, expenses: 3180000, profit: 1070000 },
  { month: 'Feb', revenue: 4680000, expenses: 3350000, profit: 1330000 },
  { month: 'Mar', revenue: 5120000, expenses: 3520000, profit: 1600000 },
  { month: 'Apr', revenue: 4890000, expenses: 3420000, profit: 1470000 },
  { month: 'May', revenue: 5450000, expenses: 3680000, profit: 1770000 },
  { month: 'Jun', revenue: 5890000, expenses: 3850000, profit: 2040000 },
  { month: 'Jul', revenue: 6120000, expenses: 3980000, profit: 2140000 },
  { month: 'Aug', revenue: 6580000, expenses: 4120000, profit: 2460000 },
  { month: 'Sep', revenue: 6350000, expenses: 4050000, profit: 2300000 },
  { month: 'Oct', revenue: 6720000, expenses: 4250000, profit: 2470000 },
  { month: 'Nov', revenue: 7050000, expenses: 4380000, profit: 2670000 },
  { month: 'Dec', revenue: 6880000, expenses: 4320000, profit: 2560000 },
];

const departmentRevenueData = [
  { department: 'Surgery', revenue: 18500000, percentage: 28 },
  { department: 'Cardiology', revenue: 14200000, percentage: 21 },
  { department: 'Neurology', revenue: 11800000, percentage: 18 },
  { department: 'Orthopedics', revenue: 9500000, percentage: 14 },
  { department: 'Pediatrics', revenue: 7800000, percentage: 12 },
  { department: 'Others', revenue: 4700000, percentage: 7 },
];

const paymentMethodData = [
  { method: 'Cash', value: 12500000, percentage: 19 },
  { method: 'Card', value: 18900000, percentage: 28 },
  { method: 'UPI', value: 15600000, percentage: 23 },
  { method: 'Insurance', value: 18200000, percentage: 27 },
  { method: 'Credit', value: 2300000, percentage: 3 },
];

// Operational Analytics Data
const bedOccupancyData = [
  { day: 'Mon', occupancy: 87, capacity: 120, percentage: 72.5 },
  { day: 'Tue', occupancy: 92, capacity: 120, percentage: 76.7 },
  { day: 'Wed', occupancy: 95, capacity: 120, percentage: 79.2 },
  { day: 'Thu', occupancy: 98, capacity: 120, percentage: 81.7 },
  { day: 'Fri', occupancy: 102, capacity: 120, percentage: 85.0 },
  { day: 'Sat', occupancy: 105, capacity: 120, percentage: 87.5 },
  { day: 'Sun', occupancy: 98, capacity: 120, percentage: 81.7 },
];

const wardUtilizationData = [
  { ward: 'General Ward', utilized: 45, capacity: 50, percentage: 90 },
  { ward: 'ICU', utilized: 18, capacity: 20, percentage: 90 },
  { ward: 'Pediatric', utilized: 22, capacity: 30, percentage: 73 },
  { ward: 'Maternity', utilized: 15, capacity: 20, percentage: 75 },
  { ward: 'Surgery', utilized: 12, capacity: 15, percentage: 80 },
  { ward: 'Cardiology', utilized: 8, capacity: 10, percentage: 80 },
];

const staffEfficiencyData = [
  { name: 'Doctors', patientsPerDay: 18, satisfaction: 4.5, efficiency: 92 },
  { name: 'Nurses', patientsPerDay: 8, satisfaction: 4.7, efficiency: 95 },
  { name: 'Support Staff', patientsPerDay: 25, satisfaction: 4.3, efficiency: 88 },
];

// Clinical Analytics Data
const diagnosisData = [
  { diagnosis: 'Cardiovascular', count: 342, percentage: 23 },
  { diagnosis: 'Respiratory', count: 298, percentage: 20 },
  { diagnosis: 'Neurological', count: 245, percentage: 16 },
  { diagnosis: 'Orthopedic', count: 212, percentage: 14 },
  { diagnosis: 'Gastrointestinal', count: 189, percentage: 13 },
  { diagnosis: 'Others', count: 214, percentage: 14 },
];

const procedureFrequencyData = [
  { procedure: 'Angioplasty', count: 145, avgDuration: 95 },
  { procedure: 'Appendectomy', count: 132, avgDuration: 65 },
  { procedure: 'Hip Replacement', count: 98, avgDuration: 180 },
  { procedure: 'Cataract Surgery', count: 245, avgDuration: 35 },
  { procedure: 'Cesarean Section', count: 189, avgDuration: 45 },
  { procedure: 'Knee Replacement', count: 76, avgDuration: 150 },
];

const medicationUsageData = [
  { medication: 'Antibiotics', usage: 4520, cost: 1250000 },
  { medication: 'Pain Relievers', usage: 3890, cost: 450000 },
  { medication: 'Cardiovascular', usage: 2340, cost: 1850000 },
  { medication: 'Respiratory', usage: 1980, cost: 890000 },
  { medication: 'Diabetes', usage: 1650, cost: 1120000 },
  { medication: 'Others', usage: 3120, cost: 980000 },
];

// Quality Metrics Data
const readmissionData = [
  { month: 'Jan', rate: 8.5, target: 10 },
  { month: 'Feb', rate: 7.8, target: 10 },
  { month: 'Mar', rate: 9.2, target: 10 },
  { month: 'Apr', rate: 7.5, target: 10 },
  { month: 'May', rate: 8.8, target: 10 },
  { month: 'Jun', rate: 7.2, target: 10 },
  { month: 'Jul', rate: 6.9, target: 10 },
  { month: 'Aug', rate: 7.5, target: 10 },
  { month: 'Sep', rate: 8.1, target: 10 },
  { month: 'Oct', rate: 7.3, target: 10 },
  { month: 'Nov', rate: 6.8, target: 10 },
  { month: 'Dec', rate: 7.0, target: 10 },
];

const qualityIndicatorsData = [
  { indicator: 'Patient Satisfaction', score: 4.6, target: 4.5, max: 5 },
  { indicator: 'Medication Safety', score: 4.8, target: 4.7, max: 5 },
  { indicator: 'Infection Control', score: 4.5, target: 4.6, max: 5 },
  { indicator: 'Fall Prevention', score: 4.7, target: 4.5, max: 5 },
  { indicator: 'Response Time', score: 4.4, target: 4.5, max: 5 },
];

// Predictive Analytics Data
const forecastData = [
  { month: 'Jan', actual: 245, predicted: 248 },
  { month: 'Feb', actual: 268, predicted: 265 },
  { month: 'Mar', actual: 298, predicted: 295 },
  { month: 'Apr', actual: 275, predicted: 278 },
  { month: 'May', actual: 315, predicted: 310 },
  { month: 'Jun', actual: 342, predicted: 340 },
  { month: 'Jul', actual: null, predicted: 368 },
  { month: 'Aug', actual: null, predicted: 385 },
  { month: 'Sep', actual: null, predicted: 375 },
  { month: 'Oct', actual: null, predicted: 395 },
  { month: 'Nov', actual: null, predicted: 410 },
  { month: 'Dec', actual: null, predicted: 405 },
];

// ============= MAIN COMPONENT =============
export default function IpdAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('year');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // ============= RENDER KPI CARD =============
  const renderKpiCard = (
    title: string,
    value: string | number,
    change: number,
    icon: React.ReactNode,
    color: string
  ) => {
    const isPositive = change >= 0;
    const isNeutral = change === 0;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <h3 className="text-2xl text-gray-900 mb-2">{value}</h3>
              <div className="flex items-center gap-1">
                {isNeutral ? (
                  <Minus className="w-4 h-4 text-gray-400" />
                ) : isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${isNeutral ? 'text-gray-600' : isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}% {isNeutral ? 'No change' : isPositive ? 'increase' : 'decrease'}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
              <div style={{ color }}>{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============= RENDER OVERVIEW TAB =============
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Total Active Patients', '143', 8.5, <Users className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Bed Occupancy Rate', '85.2%', 3.2, <Bed className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Monthly Revenue', '₹68.8L', 12.4, <DollarSign className="w-6 h-6" />, COLORS.warning)}
        {renderKpiCard('Avg Length of Stay', '4.8 days', -2.1, <Clock className="w-6 h-6" />, COLORS.info)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission & Discharge Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Admission & Discharge Trends</CardTitle>
                <CardDescription>Monthly patient flow analysis</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={admissionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="admissions" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Admissions"
                />
                <Line 
                  type="monotone" 
                  dataKey="discharges" 
                  stroke={COLORS.success} 
                  strokeWidth={2}
                  dot={{ fill: COLORS.success, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Discharges"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Financial performance overview</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  formatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.primary} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke={COLORS.danger} 
                  fillOpacity={1} 
                  fill="url(#colorExpenses)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Age distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={patientDemographicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {patientDemographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ward Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Utilization</CardTitle>
            <CardDescription>Current bed occupancy by ward</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={wardUtilizationData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} stroke="#666" />
                <YAxis dataKey="ward" type="category" width={100} stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  formatter={(value: number) => `${value}%`}
                />
                <Bar dataKey="percentage" fill={COLORS.success} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Department Revenue</CardTitle>
            <CardDescription>Revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered analytics insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-1">Revenue Growth Strong</h4>
                  <p className="text-sm text-green-700">Monthly revenue increased by 12.4%, exceeding targets. Surgery and Cardiology departments show highest growth.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bed className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">Optimal Occupancy</h4>
                  <p className="text-sm text-blue-700">Bed occupancy at 85.2% indicates efficient resource utilization. General Ward and ICU near full capacity.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 mb-1">ALOS Attention Needed</h4>
                  <p className="text-sm text-yellow-700">Surgery ward ALOS is 10% above target. Review discharge planning protocols to improve efficiency.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900 mb-1">Readmission Rate Improved</h4>
                  <p className="text-sm text-purple-700">30-day readmission rate decreased to 6.8%, well below the 10% target. Excellent care quality indicator.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER PATIENT ANALYTICS TAB =============
  const renderPatientAnalytics = () => (
    <div className="space-y-6">
      {/* Patient KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Total Admissions', '3,963', 11.2, <UserCheck className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Total Discharges', '3,905', 10.8, <CheckCircle className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Active Patients', '143', 8.5, <Activity className="w-6 h-6" />, COLORS.info)}
        {renderKpiCard('Avg ALOS', '4.8 days', -2.1, <Calendar className="w-6 h-6" />, COLORS.warning)}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Admission Trends</CardTitle>
            <CardDescription>Year-over-year comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={admissionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="admissions" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Admissions" />
                <Line type="monotone" dataKey="active" stroke={COLORS.success} strokeWidth={2} name="Active Patients" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ALOS by Ward */}
        <Card>
          <CardHeader>
            <CardTitle>Average Length of Stay by Ward</CardTitle>
            <CardDescription>Actual vs Target comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ward" stroke="#666" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#666" label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="alos" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Actual ALOS" />
                <Bar dataKey="target" fill={COLORS.success} radius={[8, 8, 0, 0]} name="Target ALOS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Patient gender breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.primary : COLORS.purple} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl text-blue-600">1,245</p>
                <p className="text-sm text-gray-600">Male Patients</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl text-purple-600">855</p>
                <p className="text-sm text-gray-600">Female Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Age Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Age Demographics</CardTitle>
            <CardDescription>Patient age group distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientDemographicsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                <Bar dataKey="value" fill={COLORS.info} radius={[8, 8, 0, 0]}>
                  {patientDemographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {patientDemographicsData.map((item, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{item.name}</p>
                  <p className="font-medium text-gray-900">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Flow Analysis</CardTitle>
          <CardDescription>Daily admission and discharge patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: 'Monday', admissions: 62, discharges: 58, color: COLORS.primary },
              { day: 'Tuesday', admissions: 68, discharges: 64, color: COLORS.success },
              { day: 'Wednesday', admissions: 71, discharges: 67, color: COLORS.info },
              { day: 'Thursday', admissions: 65, discharges: 70, color: COLORS.warning },
              { day: 'Friday', admissions: 58, discharges: 62, color: COLORS.purple },
              { day: 'Saturday', admissions: 45, discharges: 48, color: COLORS.orange },
              { day: 'Sunday', admissions: 39, discharges: 42, color: COLORS.pink },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{item.day}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full rounded-full flex items-center justify-end px-2"
                        style={{ 
                          width: `${(item.admissions / 75) * 100}%`,
                          backgroundColor: item.color
                        }}
                      >
                        <span className="text-xs text-white">{item.admissions}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 w-20">Admissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full rounded-full flex items-center justify-end px-2"
                        style={{ 
                          width: `${(item.discharges / 75) * 100}%`,
                          backgroundColor: `${item.color}80`
                        }}
                      >
                        <span className="text-xs text-white">{item.discharges}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 w-20">Discharges</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER FINANCIAL ANALYTICS TAB =============
  const renderFinancialAnalytics = () => (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Total Revenue', '₹6.88 Cr', 12.4, <DollarSign className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Total Expenses', '₹4.32 Cr', 8.2, <DollarSign className="w-6 h-6" />, COLORS.danger)}
        {renderKpiCard('Net Profit', '₹2.56 Cr', 19.8, <TrendingUp className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Profit Margin', '37.2%', 5.1, <Award className="w-6 h-6" />, COLORS.warning)}
      </div>

      {/* Revenue & Profit Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue, Expenses & Profit Trends</CardTitle>
              <CardDescription>Monthly financial performance</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={revenueData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="profit" 
                fill="url(#profitGradient)" 
                stroke={COLORS.success}
                strokeWidth={2}
                name="Profit"
              />
              <Bar dataKey="revenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Revenue" />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke={COLORS.danger} 
                strokeWidth={2}
                dot={{ fill: COLORS.danger, r: 4 }}
                name="Expenses"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Department</CardTitle>
            <CardDescription>Department-wise revenue contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentRevenueData.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{dept.department}</span>
                    <span className="text-sm text-gray-900">₹{(dept.revenue / 10000000).toFixed(1)}Cr ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${dept.percentage * 3.33}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>Revenue by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method}: ${percentage}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${(value / 10000000).toFixed(2)}Cr`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Summary</CardTitle>
          <CardDescription>Detailed month-by-month breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Month</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Expenses</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Profit</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item, index) => {
                  const margin = ((item.profit / item.revenue) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{item.month}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">₹{(item.revenue / 100000).toFixed(1)}L</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">₹{(item.expenses / 100000).toFixed(1)}L</td>
                      <td className="py-3 px-4 text-sm text-right text-green-600">₹{(item.profit / 100000).toFixed(1)}L</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <Badge 
                          variant={Number(margin) > 35 ? 'default' : 'secondary'}
                          className={Number(margin) > 35 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        >
                          {margin}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER OPERATIONAL ANALYTICS TAB =============
  const renderOperationalAnalytics = () => (
    <div className="space-y-6">
      {/* Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Bed Occupancy', '85.2%', 3.2, <Bed className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Staff Efficiency', '92%', 4.5, <UserCheck className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Avg Turnaround', '3.2 hrs', -8.5, <Clock className="w-6 h-6" />, COLORS.warning)}
        {renderKpiCard('Resource Utilization', '88%', 2.1, <Building2 className="w-6 h-6" />, COLORS.info)}
      </div>

      {/* Bed Occupancy Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Bed Occupancy Trends</CardTitle>
          <CardDescription>Daily bed utilization patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bedOccupancyData}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                formatter={(value: number, name: string) => {
                  if (name === 'percentage') return `${value}%`;
                  return value;
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="occupancy" 
                stroke={COLORS.primary} 
                fillOpacity={1} 
                fill="url(#occupancyGradient)"
                name="Occupied Beds"
              />
              <Line 
                type="monotone" 
                dataKey="capacity" 
                stroke={COLORS.danger} 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Total Capacity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ward Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Utilization Rates</CardTitle>
            <CardDescription>Current capacity utilization by ward</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wardUtilizationData.map((ward, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{ward.ward}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{ward.utilized}/{ward.capacity}</span>
                      <Badge 
                        variant={ward.percentage >= 85 ? 'default' : 'secondary'}
                        className={ward.percentage >= 85 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                      >
                        {ward.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${ward.percentage}%`,
                        backgroundColor: ward.percentage >= 85 ? COLORS.danger : ward.percentage >= 70 ? COLORS.warning : COLORS.success
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Efficiency Metrics</CardTitle>
            <CardDescription>Performance indicators by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={staffEfficiencyData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="name" stroke="#666" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
                <Radar 
                  name="Efficiency Score" 
                  dataKey="efficiency" 
                  stroke={COLORS.primary} 
                  fill={COLORS.primary} 
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operational Metrics Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Operational Metrics</CardTitle>
          <CardDescription>Comprehensive performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bed Management */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Bed Management</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Beds</span>
                  <span className="text-sm text-gray-900">120</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Occupied</span>
                  <span className="text-sm text-gray-900">102</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="text-sm text-green-600">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Under Maintenance</span>
                  <span className="text-sm text-orange-600">0</span>
                </div>
              </div>
            </div>

            {/* Staff Metrics */}
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Staff Metrics</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Doctors on Duty</span>
                  <span className="text-sm text-gray-900">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nurses on Duty</span>
                  <span className="text-sm text-gray-900">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Patient/Doctor</span>
                  <span className="text-sm text-blue-600">5.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Patient/Nurse</span>
                  <span className="text-sm text-blue-600">3.2</span>
                </div>
              </div>
            </div>

            {/* Service Metrics */}
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">Service Metrics</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm text-gray-900">4.2 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bed Turnaround</span>
                  <span className="text-sm text-gray-900">3.2 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lab Report Time</span>
                  <span className="text-sm text-gray-900">2.8 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pharmacy Fulfillment</span>
                  <span className="text-sm text-green-600">96%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER CLINICAL ANALYTICS TAB =============
  const renderClinicalAnalytics = () => (
    <div className="space-y-6">
      {/* Clinical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Total Procedures', '885', 15.2, <Stethoscope className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Medication Orders', '16,500', 8.7, <Pill className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Lab Tests', '12,340', 11.3, <Activity className="w-6 h-6" />, COLORS.info)}
        {renderKpiCard('Success Rate', '97.8%', 1.2, <CheckCircle className="w-6 h-6" />, COLORS.warning)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top Diagnosis Categories</CardTitle>
            <CardDescription>Most common patient conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diagnosisData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="diagnosis" type="category" width={120} stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 8, 8, 0]}>
                  {diagnosisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Procedure Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Top Procedures Performed</CardTitle>
            <CardDescription>Most common surgical procedures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {procedureFrequencyData.map((procedure, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{procedure.procedure}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{procedure.count} cases</span>
                      <Badge variant="outline" className="text-xs">{procedure.avgDuration} min</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(procedure.count / 250) * 100}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Medication Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Usage by Category</CardTitle>
            <CardDescription>Top medication categories and costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={medicationUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="medication" stroke="#666" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'cost') return `₹${(value / 100000).toFixed(1)}L`;
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="usage" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Usage Count" />
                <Bar dataKey="cost" fill={COLORS.success} radius={[8, 8, 0, 0]} name="Cost (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diagnosis Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnosis Distribution</CardTitle>
            <CardDescription>Patient condition breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={diagnosisData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {diagnosisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Performance Summary</CardTitle>
          <CardDescription>Key clinical indicators and benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm text-blue-900">Cardiovascular</h4>
              </div>
              <p className="text-2xl text-blue-600 mb-1">342</p>
              <p className="text-xs text-blue-700">Cases this month</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <h4 className="text-sm text-green-900">Procedures</h4>
              </div>
              <p className="text-2xl text-green-600 mb-1">885</p>
              <p className="text-xs text-green-700">Total performed</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm text-purple-900">Medications</h4>
              </div>
              <p className="text-2xl text-purple-600 mb-1">16.5K</p>
              <p className="text-xs text-purple-700">Orders processed</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <h4 className="text-sm text-orange-900">Success Rate</h4>
              </div>
              <p className="text-2xl text-orange-600 mb-1">97.8%</p>
              <p className="text-xs text-orange-700">Treatment success</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER QUALITY METRICS TAB =============
  const renderQualityMetrics = () => (
    <div className="space-y-6">
      {/* Quality KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Patient Satisfaction', '4.6/5', 3.2, <Heart className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Readmission Rate', '7.0%', -18.6, <Shield className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Infection Rate', '0.8%', -12.5, <AlertCircle className="w-6 h-6" />, COLORS.info)}
        {renderKpiCard('Safety Score', '4.7/5', 4.4, <Award className="w-6 h-6" />, COLORS.warning)}
      </div>

      {/* 30-Day Readmission Rate Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>30-Day Readmission Rate Trend</CardTitle>
              <CardDescription>Monthly readmission rate vs industry target</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-700">Below Target</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readmissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 12]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 5 }}
                name="Readmission Rate (%)"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={COLORS.danger} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target (10%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Performance Indicators</CardTitle>
          <CardDescription>Key quality metrics vs targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={qualityIndicatorsData}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="indicator" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} stroke="#666" />
              <Radar 
                name="Actual Score" 
                dataKey="score" 
                stroke={COLORS.primary} 
                fill={COLORS.primary} 
                fillOpacity={0.6}
              />
              <Radar 
                name="Target Score" 
                dataKey="target" 
                stroke={COLORS.success} 
                fill={COLORS.success} 
                fillOpacity={0.3}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality Metrics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Safety Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Safety Indicators</CardTitle>
            <CardDescription>Safety performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Medication Errors', value: 0.3, target: 0.5, status: 'excellent' },
                { name: 'Hospital Acquired Infections', value: 0.8, target: 1.0, status: 'good' },
                { name: 'Patient Falls', value: 0.2, target: 0.3, status: 'excellent' },
                { name: 'Pressure Ulcers', value: 0.4, target: 0.5, status: 'good' },
                { name: 'Wrong Site Surgery', value: 0.0, target: 0.1, status: 'excellent' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.value}%</span>
                      <Badge 
                        variant="outline"
                        className={
                          item.status === 'excellent' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }
                      >
                        {item.status === 'excellent' ? 'Excellent' : 'Good'}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="absolute inset-0 flex">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(item.value / item.target) * 100}%`,
                          backgroundColor: item.status === 'excellent' ? COLORS.success : COLORS.primary
                        }}
                      />
                    </div>
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                      style={{ left: '100%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {item.value}%</span>
                    <span>Target: {item.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clinical Excellence Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Excellence Metrics</CardTitle>
            <CardDescription>Quality of care indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Timely Antibiotic Administration', value: 96, color: COLORS.success },
                { name: 'Pain Management Score', value: 92, color: COLORS.primary },
                { name: 'Early Mobilization', value: 88, color: COLORS.info },
                { name: 'Discharge Planning', value: 94, color: COLORS.success },
                { name: 'Patient Education', value: 90, color: COLORS.primary },
              ].map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{metric.name}</span>
                    <span className="text-sm font-medium" style={{ color: metric.color }}>{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${metric.value}%`,
                        backgroundColor: metric.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Experience Ratings</CardTitle>
          <CardDescription>Comprehensive patient satisfaction metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                category: 'Communication', 
                rating: 4.7, 
                icon: <Activity className="w-6 h-6" />,
                items: ['Doctor Communication: 4.8', 'Nurse Communication: 4.7', 'Staff Responsiveness: 4.6']
              },
              { 
                category: 'Environment', 
                rating: 4.5, 
                icon: <Building2 className="w-6 h-6" />,
                items: ['Room Cleanliness: 4.6', 'Noise Level: 4.3', 'Comfort: 4.6']
              },
              { 
                category: 'Care Quality', 
                rating: 4.8, 
                icon: <Heart className="w-6 h-6" />,
                items: ['Treatment Effectiveness: 4.9', 'Pain Management: 4.7', 'Follow-up Care: 4.7']
              },
            ].map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      {item.icon}
                    </div>
                    <h4 className="font-medium text-gray-900">{item.category}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-blue-600">{item.rating}</div>
                    <div className="text-xs text-gray-500">out of 5</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {item.items.map((detail, idx) => (
                    <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RENDER PREDICTIVE ANALYTICS TAB =============
  const renderPredictiveAnalytics = () => (
    <div className="space-y-6">
      {/* Predictive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderKpiCard('Next Month Forecast', '410', 8.5, <TrendingUp className="w-6 h-6" />, COLORS.primary)}
        {renderKpiCard('Capacity Utilization', '91%', 4.2, <Gauge className="w-6 h-6" />, COLORS.warning)}
        {renderKpiCard('Revenue Projection', '₹7.2 Cr', 10.5, <DollarSign className="w-6 h-6" />, COLORS.success)}
        {renderKpiCard('Risk Score', 'Low', -15.2, <Shield className="w-6 h-6" />, COLORS.info)}
      </div>

      {/* Admission Forecast */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admission Forecast (Next 6 Months)</CardTitle>
              <CardDescription>AI-powered admission predictions with 92% accuracy</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 5 }}
                name="Actual Admissions"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke={COLORS.success} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.success, r: 4 }}
                name="Predicted Admissions"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">Forecast Insights</p>
                <p className="text-xs text-blue-700">
                  Based on historical trends, seasonal patterns, and current healthcare indicators, 
                  we predict a 10-15% increase in admissions during the next quarter. 
                  Recommend maintaining adequate staffing levels and bed availability.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Projected Resource Requirements</CardTitle>
            <CardDescription>Next quarter staffing needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { resource: 'Doctors', current: 28, required: 32, gap: 4, status: 'attention' },
                { resource: 'Nurses', current: 45, required: 52, gap: 7, status: 'critical' },
                { resource: 'Support Staff', current: 38, required: 40, gap: 2, status: 'minor' },
                { resource: 'Beds', current: 120, required: 135, gap: 15, status: 'critical' },
                { resource: 'ICU Beds', current: 20, required: 24, gap: 4, status: 'attention' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{item.resource}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">
                        Current: {item.current} | Required: {item.required}
                      </span>
                      <Badge 
                        variant="outline"
                        className={
                          item.status === 'critical' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : item.status === 'attention'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }
                      >
                        Gap: {item.gap}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(item.current / item.required) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{((item.current / item.required) * 100).toFixed(0)}% Available</span>
                    <span>{item.gap} {item.resource} Needed</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Dashboard</CardTitle>
            <CardDescription>Operational risk indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  risk: 'Capacity Overflow', 
                  level: 'Medium', 
                  probability: 35,
                  impact: 'High',
                  color: COLORS.warning
                },
                { 
                  risk: 'Staff Shortage', 
                  level: 'High', 
                  probability: 65,
                  impact: 'Critical',
                  color: COLORS.danger
                },
                { 
                  risk: 'Equipment Failure', 
                  level: 'Low', 
                  probability: 15,
                  impact: 'Medium',
                  color: COLORS.success
                },
                { 
                  risk: 'Supply Chain Disruption', 
                  level: 'Medium', 
                  probability: 28,
                  impact: 'Medium',
                  color: COLORS.warning
                },
                { 
                  risk: 'Infection Outbreak', 
                  level: 'Low', 
                  probability: 12,
                  impact: 'Critical',
                  color: COLORS.success
                },
              ].map((item, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{item.risk}</span>
                    <Badge 
                      variant="outline"
                      className={
                        item.level === 'High'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : item.level === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : 'bg-green-100 text-green-700 border-green-200'
                      }
                    >
                      {item.level} Risk
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>Probability: {item.probability}%</span>
                    <span>Impact: {item.impact}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.probability}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Strategic Recommendations</CardTitle>
          <CardDescription>Data-driven action items for operational excellence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">Critical: Increase Nursing Staff</h4>
                  <p className="text-sm text-red-700 mb-2">
                    Predicted patient load will exceed current nurse capacity by 15% in next quarter
                  </p>
                  <Badge className="bg-red-200 text-red-800 text-xs">Immediate Action Required</Badge>
                </div>
              </div>
              <div className="pl-11 space-y-1 text-xs text-red-700">
                <p>• Hire 7 additional nurses</p>
                <p>• Implement overtime protocol</p>
                <p>• Review shift schedules</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bed className="w-5 h-5 text-yellow-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 mb-1">Plan Bed Capacity Expansion</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    15 additional beds needed to meet projected demand by Q4
                  </p>
                  <Badge className="bg-yellow-200 text-yellow-800 text-xs">Action in 30 Days</Badge>
                </div>
              </div>
              <div className="pl-11 space-y-1 text-xs text-yellow-700">
                <p>• Identify expansion area</p>
                <p>• Budget allocation: ₹45L</p>
                <p>• Timeline: 60-90 days</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">Optimize Revenue Cycle</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Potential to increase revenue by 8-12% with process improvements
                  </p>
                  <Badge className="bg-blue-200 text-blue-800 text-xs">Opportunity</Badge>
                </div>
              </div>
              <div className="pl-11 space-y-1 text-xs text-blue-700">
                <p>• Reduce billing delays</p>
                <p>• Improve insurance claims</p>
                <p>• Enhance collection rate</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-1">Maintain Quality Standards</h4>
                  <p className="text-sm text-green-700 mb-2">
                    Current quality metrics exceeding targets - maintain best practices
                  </p>
                  <Badge className="bg-green-200 text-green-800 text-xs">On Track</Badge>
                </div>
              </div>
              <div className="pl-11 space-y-1 text-xs text-green-700">
                <p>• Continue staff training</p>
                <p>• Monitor KPIs weekly</p>
                <p>• Share best practices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= MAIN RENDER =============
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">IPD Analytics Dashboard</h1>
                <p className="text-sm text-blue-100 mt-0.5">
                  Comprehensive insights and data-driven decision support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-0 bg-transparent text-white h-auto p-0 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <Building2 className="w-4 h-4" />
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger className="border-0 bg-transparent text-white h-auto p-0 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="general">General Ward</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
              <Stethoscope className="w-4 h-4" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="border-0 bg-transparent text-white h-auto p-0 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="overview" className="gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="patient" className="gap-2">
              <Users className="w-4 h-4" />
              Patient Analytics
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="operational" className="gap-2">
              <Activity className="w-4 h-4" />
              Operational
            </TabsTrigger>
            <TabsTrigger value="clinical" className="gap-2">
              <Stethoscope className="w-4 h-4" />
              Clinical
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-2">
              <Award className="w-4 h-4" />
              Quality Metrics
            </TabsTrigger>
            <TabsTrigger value="predictive" className="gap-2">
              <Brain className="w-4 h-4" />
              Predictive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="patient">{renderPatientAnalytics()}</TabsContent>
          <TabsContent value="financial">{renderFinancialAnalytics()}</TabsContent>
          <TabsContent value="operational">{renderOperationalAnalytics()}</TabsContent>
          <TabsContent value="clinical">{renderClinicalAnalytics()}</TabsContent>
          <TabsContent value="quality">{renderQualityMetrics()}</TabsContent>
          <TabsContent value="predictive">{renderPredictiveAnalytics()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
