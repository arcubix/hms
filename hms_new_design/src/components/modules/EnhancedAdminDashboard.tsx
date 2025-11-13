import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Activity,
  Bed,
  FlaskConical,
  Pill,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Heart,
  Stethoscope,
  Building,
  Target,
  Zap,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#2F80ED', '#27AE60', '#F2994A', '#EB5757', '#9B51E0', '#F2C94C'];

export function EnhancedAdminDashboard() {
  const patientVisitsData = [
    { month: 'Jan', visits: 820, opd: 580, ipd: 240 },
    { month: 'Feb', visits: 890, opd: 620, ipd: 270 },
    { month: 'Mar', visits: 950, opd: 670, ipd: 280 },
    { month: 'Apr', visits: 1020, opd: 720, ipd: 300 },
    { month: 'May', visits: 1180, opd: 840, ipd: 340 },
    { month: 'Jun', visits: 1250, opd: 890, ipd: 360 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 980000, expenses: 720000 },
    { month: 'Feb', revenue: 1050000, expenses: 750000 },
    { month: 'Mar', revenue: 1120000, expenses: 780000 },
    { month: 'Apr', revenue: 1180000, expenses: 810000 },
    { month: 'May', revenue: 1220000, expenses: 840000 },
    { month: 'Jun', revenue: 1250000, expenses: 860000 }
  ];

  const departmentStats = [
    { name: 'Emergency', value: 23, color: '#EB5757' },
    { name: 'OPD', value: 35, color: '#2F80ED' },
    { name: 'IPD', value: 28, color: '#27AE60' },
    { name: 'ICU', value: 14, color: '#F2994A' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      patient: 'Ahmed Khan',
      doctor: 'Dr. Sarah Williams',
      time: '10 minutes ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'admission',
      patient: 'Fatima Ali',
      department: 'Cardiology',
      time: '25 minutes ago',
      status: 'active'
    },
    {
      id: 3,
      type: 'lab',
      patient: 'Hassan Malik',
      test: 'Blood Test',
      time: '1 hour ago',
      status: 'pending'
    },
    {
      id: 4,
      type: 'discharge',
      patient: 'Aisha Khan',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  const upcomingAppointments = [
    {
      time: '10:00 AM',
      patient: 'John Smith',
      doctor: 'Dr. Ahmed Khan',
      type: 'Follow-up',
      department: 'Cardiology'
    },
    {
      time: '11:30 AM',
      patient: 'Sarah Johnson',
      doctor: 'Dr. Michael Chen',
      type: 'Consultation',
      department: 'Neurology'
    },
    {
      time: '02:00 PM',
      patient: 'Ali Hassan',
      doctor: 'Dr. Fatima Ali',
      type: 'Check-up',
      department: 'General'
    }
  ];

  const criticalAlerts = [
    {
      type: 'bed',
      message: 'ICU beds at 95% capacity',
      severity: 'high',
      time: '5 min ago'
    },
    {
      type: 'stock',
      message: '3 medicines below minimum stock',
      severity: 'medium',
      time: '15 min ago'
    },
    {
      type: 'lab',
      message: '12 urgent lab results pending',
      severity: 'high',
      time: '20 min ago'
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Real-time Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Brain className="w-4 h-4 mr-2" />
            AI Analytics
          </Button>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">AI</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Today's Patient Flow</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">168</span>
              <span className="text-sm text-blue-100">expected</span>
            </div>
            <p className="text-xs text-blue-100 mt-3 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              15% increase from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">AI</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-100 mb-1">Revenue Forecast</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">PKR 1.42M</span>
            </div>
            <p className="text-xs text-green-100 mt-3 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              This week's projection
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bed className="w-6 h-6" />
              </div>
              <Badge className="bg-white/20 text-white border-0">AI</Badge>
            </div>
            <h3 className="text-sm font-medium text-purple-100 mb-1">Bed Occupancy</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">85%</span>
              <span className="text-sm text-purple-100">tomorrow</span>
            </div>
            <p className="text-xs text-purple-100 mt-3 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Prepare 12 additional beds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="font-medium">+12.5%</span>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Patients</h3>
            <p className="text-3xl font-bold text-gray-900 mb-3">2,847</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Target: 3,000</span>
                <span>94.9%</span>
              </div>
              <Progress value={94.9} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="font-medium">+3</span>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Active Doctors</h3>
            <p className="text-3xl font-bold text-gray-900 mb-3">48</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">35 On-duty</span>
              <Badge className="bg-green-100 text-green-800 text-xs">All staffed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-red-600">
                <ArrowDownRight className="w-4 h-4" />
                <span className="font-medium">-8%</span>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Today's Appointments</h3>
            <p className="text-3xl font-bold text-gray-900 mb-3">127</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600">89 Completed</span>
              <span className="text-yellow-600">38 Pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="font-medium">+18.2%</span>
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mb-3">PKR 12.5M</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Target: PKR 15M</span>
                <span>83.3%</span>
              </div>
              <Progress value={83.3} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Bed className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Bed Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
            </div>
            <Progress value={78} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Pending Labs</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">12 Urgent</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Pill className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Medicine Stock</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
              </div>
            </div>
            <Progress value={98} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">4.7/5</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Excellent</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Visits Trend */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Patient Visits Trend
              </CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={patientVisitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="opd" stackId="1" stroke="#2F80ED" fill="#2F80ED" fillOpacity={0.6} name="OPD" />
                <Area type="monotone" dataKey="ipd" stackId="1" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} name="IPD" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Department Load</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Revenue vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value: number) => `PKR ${(value / 1000000).toFixed(2)}M`} />
              <Bar dataKey="revenue" fill="#27AE60" name="Revenue" />
              <Bar dataKey="expenses" fill="#EB5757" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Feed and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'appointment' ? 'bg-blue-100' :
                    activity.type === 'admission' ? 'bg-green-100' :
                    activity.type === 'lab' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'appointment' && <Calendar className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'admission' && <Bed className="w-5 h-5 text-green-600" />}
                    {activity.type === 'lab' && <FlaskConical className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'discharge' && <CheckCircle className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.patient}</p>
                    <p className="text-sm text-gray-600">
                      {'doctor' in activity && activity.doctor}
                      {'department' in activity && activity.department}
                      {'test' in activity && activity.test}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <Badge className={
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                  <div className="w-16 text-center">
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-bold text-blue-600">{apt.time}</p>
                  </div>
                  <div className="h-12 w-px bg-gray-200"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{apt.patient}</p>
                    <p className="text-sm text-gray-600">{apt.doctor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{apt.type}</Badge>
                      <Badge variant="outline" className="text-xs">{apt.department}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="border-b border-gray-200 bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Critical Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalAlerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                alert.severity === 'high' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
