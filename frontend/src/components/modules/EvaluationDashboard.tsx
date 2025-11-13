import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Bed,
  Calendar,
  FileText,
  Stethoscope,
  TestTube,
  Pill,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Award,
  Zap,
  Brain,
  TrendingUp as Forecast,
  Heart,
  ThermometerSun,
  ShieldCheck,
  AlertCircle,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ChevronRight
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
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
  ComposedChart
} from 'recharts';

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757', '#9B51E0', '#F2C94C'];

export function EvaluationDashboard() {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // AI Predictions & Analytics Data
  const aiPredictions = {
    patientFlow: {
      today: 145,
      predicted: 168,
      trend: 'up',
      confidence: 87,
      recommendation: 'Increase staff by 15% for afternoon shift'
    },
    bedOccupancy: {
      current: 78,
      predicted: 85,
      trend: 'up',
      confidence: 92,
      recommendation: 'Prepare 12 additional beds by tomorrow'
    },
    revenue: {
      current: 1250000,
      predicted: 1425000,
      trend: 'up',
      confidence: 85,
      recommendation: 'Revenue on track, focus on OPD growth'
    },
    emergencies: {
      current: 12,
      predicted: 18,
      trend: 'up',
      confidence: 79,
      recommendation: 'Alert emergency staff for evening shift'
    }
  };

  // Overall Hospital KPIs
  const hospitalKPIs = [
    {
      label: 'Total Patients',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      target: '3000',
      progress: 94.9
    },
    {
      label: 'Revenue (Monthly)',
      value: 'PKR 12.5M',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
      target: 'PKR 15M',
      progress: 83.3
    },
    {
      label: 'Bed Occupancy',
      value: '78%',
      change: '+5.3%',
      trend: 'up',
      icon: Bed,
      color: 'purple',
      target: '85%',
      progress: 91.8
    },
    {
      label: 'Patient Satisfaction',
      value: '4.7/5',
      change: '+0.3',
      trend: 'up',
      icon: Star,
      color: 'yellow',
      target: '5.0',
      progress: 94
    }
  ];

  // Department Performance
  const departmentPerformance = [
    {
      department: 'Emergency',
      patients: 1247,
      revenue: 2840000,
      satisfaction: 4.6,
      efficiency: 89,
      staff: 24,
      status: 'excellent',
      trend: 'up',
      ai_score: 92
    },
    {
      department: 'OPD',
      patients: 3521,
      revenue: 3250000,
      satisfaction: 4.8,
      efficiency: 92,
      staff: 32,
      status: 'excellent',
      trend: 'up',
      ai_score: 95
    },
    {
      department: 'IPD',
      patients: 847,
      revenue: 4150000,
      satisfaction: 4.5,
      efficiency: 78,
      staff: 28,
      status: 'good',
      trend: 'stable',
      ai_score: 84
    },
    {
      department: 'Laboratory',
      patients: 2145,
      revenue: 980000,
      satisfaction: 4.7,
      efficiency: 94,
      staff: 18,
      status: 'excellent',
      trend: 'up',
      ai_score: 96
    },
    {
      department: 'Pharmacy',
      patients: 3012,
      revenue: 1850000,
      satisfaction: 4.6,
      efficiency: 88,
      staff: 12,
      status: 'good',
      trend: 'up',
      ai_score: 89
    },
    {
      department: 'Radiology',
      patients: 642,
      revenue: 1420000,
      satisfaction: 4.4,
      efficiency: 82,
      staff: 15,
      status: 'good',
      trend: 'down',
      ai_score: 81
    }
  ];

  // Doctor Performance Metrics
  const doctorMetrics = [
    {
      id: 'D001',
      name: 'Dr. Ahmed Khan',
      specialty: 'Cardiology',
      patients: 342,
      satisfaction: 4.9,
      consultations: 428,
      revenue: 1280000,
      availability: 92,
      response_time: 8,
      success_rate: 96,
      rating: 'top'
    },
    {
      id: 'D002',
      name: 'Dr. Sarah Williams',
      specialty: 'Pediatrics',
      patients: 418,
      satisfaction: 4.8,
      consultations: 524,
      revenue: 980000,
      availability: 88,
      response_time: 12,
      success_rate: 94,
      rating: 'excellent'
    },
    {
      id: 'D003',
      name: 'Dr. Michael Chen',
      specialty: 'General Surgery',
      patients: 187,
      satisfaction: 4.7,
      consultations: 245,
      revenue: 1850000,
      availability: 85,
      response_time: 15,
      success_rate: 98,
      rating: 'excellent'
    },
    {
      id: 'D004',
      name: 'Dr. Fatima Ali',
      specialty: 'Neurology',
      patients: 156,
      satisfaction: 4.9,
      consultations: 198,
      revenue: 1420000,
      availability: 90,
      response_time: 10,
      success_rate: 97,
      rating: 'top'
    }
  ];

  // Patient Analytics
  const patientTrends = [
    { month: 'Jan', opd: 2840, ipd: 680, emergency: 420, total: 3940 },
    { month: 'Feb', opd: 3120, ipd: 720, emergency: 460, total: 4300 },
    { month: 'Mar', opd: 3350, ipd: 780, emergency: 490, total: 4620 },
    { month: 'Apr', opd: 3680, ipd: 820, emergency: 520, total: 5020 },
    { month: 'May', opd: 3920, ipd: 860, emergency: 580, total: 5360 },
    { month: 'Jun', opd: 4150, ipd: 890, emergency: 610, total: 5650 }
  ];

  // Revenue Breakdown
  const revenueData = [
    { category: 'OPD Consultations', value: 3250000, percentage: 26 },
    { category: 'IPD Services', value: 4150000, percentage: 33 },
    { category: 'Emergency', value: 2840000, percentage: 23 },
    { category: 'Pharmacy', value: 1850000, percentage: 15 },
    { category: 'Laboratory', value: 980000, percentage: 8 },
    { category: 'Radiology', value: 1420000, percentage: 11 }
  ];

  // Disease Pattern Analysis
  const diseasePatterns = [
    { disease: 'Hypertension', cases: 487, trend: 5.2, severity: 'moderate' },
    { disease: 'Diabetes Type 2', cases: 423, trend: 8.1, severity: 'high' },
    { disease: 'Respiratory Infections', cases: 356, trend: -3.5, severity: 'low' },
    { disease: 'Cardiac Issues', cases: 298, trend: 12.3, severity: 'high' },
    { disease: 'Digestive Disorders', cases: 267, trend: 2.8, severity: 'moderate' },
    { disease: 'Neurological', cases: 189, trend: 6.7, severity: 'high' }
  ];

  // Operational Efficiency
  const efficiencyMetrics = [
    { metric: 'Avg. Wait Time', value: '18 min', target: '15 min', score: 83, status: 'good' },
    { metric: 'Bed Turnover', value: '4.2 days', target: '3.5 days', score: 78, status: 'fair' },
    { metric: 'ER Response', value: '8 min', target: '10 min', score: 95, status: 'excellent' },
    { metric: 'Appointment Show', value: '87%', target: '90%', score: 88, status: 'good' },
    { metric: 'Surgery Success', value: '96%', target: '95%', score: 98, status: 'excellent' },
    { metric: 'Readmission Rate', value: '8%', target: '5%', score: 72, status: 'fair' }
  ];

  // Financial Health Indicators
  const financialTrends = [
    { month: 'Jan', revenue: 9800000, expenses: 7200000, profit: 2600000 },
    { month: 'Feb', revenue: 10500000, expenses: 7500000, profit: 3000000 },
    { month: 'Mar', revenue: 11200000, expenses: 7800000, profit: 3400000 },
    { month: 'Apr', revenue: 11800000, expenses: 8100000, profit: 3700000 },
    { month: 'May', revenue: 12200000, expenses: 8400000, profit: 3800000 },
    { month: 'Jun', revenue: 12500000, expenses: 8600000, profit: 3900000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            AI-Powered Evaluation Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive analytics, predictions & insights across all departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* AI Predictions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                AI Prediction
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Patient Flow Today</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">{aiPredictions.patientFlow.predicted}</span>
              <span className="text-sm text-blue-100">patients</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Progress value={aiPredictions.patientFlow.confidence} className="flex-1 h-2 bg-white/20" />
              <span className="text-xs text-blue-100">{aiPredictions.patientFlow.confidence}% confident</span>
            </div>
            <p className="text-xs text-blue-100 flex items-start gap-2">
              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {aiPredictions.patientFlow.recommendation}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bed className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                AI Prediction
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-purple-100 mb-1">Bed Occupancy</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">{aiPredictions.bedOccupancy.predicted}%</span>
              <span className="text-sm text-purple-100">tomorrow</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Progress value={aiPredictions.bedOccupancy.confidence} className="flex-1 h-2 bg-white/20" />
              <span className="text-xs text-purple-100">{aiPredictions.bedOccupancy.confidence}% confident</span>
            </div>
            <p className="text-xs text-purple-100 flex items-start gap-2">
              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {aiPredictions.bedOccupancy.recommendation}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                AI Prediction
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-green-100 mb-1">Revenue Forecast</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">PKR {(aiPredictions.revenue.predicted / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Progress value={aiPredictions.revenue.confidence} className="flex-1 h-2 bg-white/20" />
              <span className="text-xs text-green-100">{aiPredictions.revenue.confidence}% confident</span>
            </div>
            <p className="text-xs text-green-100 flex items-start gap-2">
              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {aiPredictions.revenue.recommendation}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-600 to-red-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                AI Prediction
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-red-100 mb-1">Emergency Cases</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">{aiPredictions.emergencies.predicted}</span>
              <span className="text-sm text-red-100">expected</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Progress value={aiPredictions.emergencies.confidence} className="flex-1 h-2 bg-white/20" />
              <span className="text-xs text-red-100">{aiPredictions.emergencies.confidence}% confident</span>
            </div>
            <p className="text-xs text-red-100 flex items-start gap-2">
              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {aiPredictions.emergencies.recommendation}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hospital KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hospitalKPIs.map((kpi, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${kpi.color}-100 flex items-center justify-center`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="font-medium">{kpi.change}</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{kpi.label}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-3">{kpi.value}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Target: {kpi.target}</span>
                  <span>{kpi.progress}%</span>
                </div>
                <Progress value={kpi.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance Table */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Department Performance Overview</CardTitle>
                    <CardDescription>AI-powered scoring and efficiency metrics</CardDescription>
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="opd">OPD</SelectItem>
                      <SelectItem value="ipd">IPD</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patients</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Satisfaction</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Efficiency</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">AI Score</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {departmentPerformance.map((dept, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{dept.department}</p>
                                <p className="text-sm text-gray-500">{dept.staff} staff members</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{dept.patients.toLocaleString()}</span>
                              {getTrendIcon(dept.trend)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">PKR {(dept.revenue / 1000000).toFixed(2)}M</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium text-gray-900">{dept.satisfaction}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900">{dept.efficiency}%</span>
                              </div>
                              <Progress value={dept.efficiency} className="h-2" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <span className="font-bold text-purple-600">{dept.ai_score}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(dept.status)}>
                              {dept.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Department Revenue Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `PKR ${(value / 1000000).toFixed(2)}M`} />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Efficiency Radar */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Department Efficiency Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={departmentPerformance.map(d => ({
                    department: d.department,
                    efficiency: d.efficiency,
                    satisfaction: d.satisfaction * 20,
                    aiScore: d.ai_score
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis />
                    <Radar name="Efficiency" dataKey="efficiency" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.6} />
                    <Radar name="Satisfaction" dataKey="satisfaction" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} />
                    <Radar name="AI Score" dataKey="aiScore" stroke="#9B51E0" fill="#9B51E0" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Doctor Performance Metrics</CardTitle>
                  <CardDescription>Individual doctor analytics and rankings</CardDescription>
                </div>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Doctors
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patients</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Consultations</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Satisfaction</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Availability</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Success Rate</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {doctorMetrics.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {doctor.name.split(' ')[1][0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doctor.name}</p>
                              <p className="text-sm text-gray-500">{doctor.specialty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{doctor.patients}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{doctor.consultations}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-green-600">PKR {(doctor.revenue / 1000000).toFixed(2)}M</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-gray-900">{doctor.satisfaction}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-gray-900">{doctor.availability}%</span>
                            <Progress value={doctor.availability} className="h-2" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600">{doctor.success_rate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={doctor.rating === 'top' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                            <Award className="w-3 h-3 mr-1" />
                            {doctor.rating}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Trends */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Patient Flow Trends</CardTitle>
                <CardDescription>Monthly patient distribution across departments</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={patientTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opd" fill="#2F80ED" name="OPD" />
                    <Bar dataKey="ipd" fill="#27AE60" name="IPD" />
                    <Bar dataKey="emergency" fill="#EB5757" name="Emergency" />
                    <Line type="monotone" dataKey="total" stroke="#9B51E0" strokeWidth={3} name="Total" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Disease Patterns */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Disease Pattern Analysis</CardTitle>
                <CardDescription>AI-detected trends in patient conditions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {diseasePatterns.map((disease, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-gray-900">{disease.disease}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={disease.severity === 'high' ? 'bg-red-100 text-red-800' : disease.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {disease.severity}
                          </Badge>
                          <span className={`text-sm font-medium ${disease.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {disease.trend > 0 ? '+' : ''}{disease.trend}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={(disease.cases / 500) * 100} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600 w-16 text-right">{disease.cases} cases</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient Demographics */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle>Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { age: '0-18', male: 420, female: 380 },
                    { age: '19-35', male: 650, female: 720 },
                    { age: '36-50', male: 580, female: 620 },
                    { age: '51-65', male: 480, female: 510 },
                    { age: '65+', male: 340, female: 390 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="age" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="male" fill="#2F80ED" name="Male" />
                    <Bar dataKey="female" fill="#F2994A" name="Female" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">PKR 12.5M</p>
                <p className="text-sm text-green-600">+18.2% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Total Expenses</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">PKR 8.6M</p>
                <p className="text-sm text-green-600">-3.2% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Net Profit</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">PKR 3.9M</p>
                <p className="text-sm text-green-600">+28.5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle>Financial Performance Trend</CardTitle>
              <CardDescription>Revenue, expenses, and profit over time</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={financialTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: number) => `PKR ${(value / 1000000).toFixed(1)}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EB5757" fill="#EB5757" fillOpacity={0.6} name="Expenses" />
                  <Area type="monotone" dataKey="profit" stackId="3" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.8} name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle>Operational Efficiency Metrics</CardTitle>
              <CardDescription>Key performance indicators for hospital operations</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {efficiencyMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{metric.metric}</h4>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                        <span className="text-sm text-gray-500">/ {metric.target}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Performance Score</span>
                          <span>{metric.score}%</span>
                        </div>
                        <Progress value={metric.score} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Surgeries (Monthly)</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">247</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  96% success rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TestTube className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Lab Tests</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">8,942</p>
                <p className="text-sm text-blue-600">Avg. 12hr turnaround</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Recovery Rate</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">94.2%</p>
                <p className="text-sm text-green-600">Above benchmark</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">Readmission Rate</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">8.1%</p>
                <p className="text-sm text-yellow-600">Target: 5%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle>Clinical Outcomes & Quality Indicators</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Treatment Success Rates</h4>
                  {[
                    { treatment: 'Cardiac Procedures', rate: 96, target: 95 },
                    { treatment: 'Orthopedic Surgeries', rate: 94, target: 92 },
                    { treatment: 'Emergency Care', rate: 98, target: 95 },
                    { treatment: 'Cancer Treatment', rate: 89, target: 85 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.treatment}</span>
                        <span className="text-sm font-medium text-gray-900">{item.rate}%</span>
                      </div>
                      <Progress value={item.rate} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Patient Safety Metrics</h4>
                  {[
                    { metric: 'Infection Control', score: 97, status: 'excellent' },
                    { metric: 'Medication Safety', score: 95, status: 'excellent' },
                    { metric: 'Fall Prevention', score: 88, status: 'good' },
                    { metric: 'Pressure Ulcer Prevention', score: 92, status: 'excellent' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{item.score}%</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <h4 className="font-semibold">Staffing Optimization</h4>
                  </div>
                  <p className="text-sm text-white/90">Consider adding 2 nurses to Emergency dept during 2-6 PM shift based on patient flow patterns.</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <h4 className="font-semibold">Equipment Alert</h4>
                  </div>
                  <p className="text-sm text-white/90">Radiology Dept. approaching capacity. Recommend scheduling equipment maintenance next week.</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <h4 className="font-semibold">Revenue Opportunity</h4>
                  </div>
                  <p className="text-sm text-white/90">OPD consultation fees 15% below market average. Potential PKR 450K monthly revenue increase.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
