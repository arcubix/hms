import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Receipt
} from 'lucide-react';
import { User } from '../../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface FinanceDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <DollarSign className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <Receipt className="w-5 h-5" />, label: 'Patient Billing', id: 'billing', badge: '15' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'Insurance Claims', id: 'insurance' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', id: 'reports' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Revenue Analytics', id: 'analytics' },
  { icon: <AlertCircle className="w-5 h-5" />, label: 'Outstanding Bills', id: 'outstanding', badge: '8' }
];

const pendingBills = [
  {
    id: 'B001',
    patientName: 'John Smith',
    patientId: 'P001',
    services: 'Cardiology Consultation, ECG',
    amount: 450.00,
    insuranceCoverage: 360.00,
    patientDue: 90.00,
    billDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'pending'
  },
  {
    id: 'B002',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    services: 'Lab Tests, Diabetes Consultation',
    amount: 280.00,
    insuranceCoverage: 224.00,
    patientDue: 56.00,
    billDate: '2024-01-14',
    dueDate: '2024-02-14',
    status: 'overdue'
  },
  {
    id: 'B003',
    patientName: 'Michael Brown',
    patientId: 'P003',
    services: 'Heart Surgery, ICU Stay',
    amount: 15000.00,
    insuranceCoverage: 12000.00,
    patientDue: 3000.00,
    billDate: '2024-01-12',
    dueDate: '2024-02-12',
    status: 'paid'
  }
];

const insuranceClaims = [
  {
    id: 'IC001',
    patientName: 'Sarah Davis',
    insuranceProvider: 'Blue Cross',
    claimAmount: 1200.00,
    approvedAmount: 960.00,
    claimDate: '2024-01-10',
    status: 'approved',
    services: 'Surgery, Post-op care'
  },
  {
    id: 'IC002',
    patientName: 'Robert Wilson',
    insuranceProvider: 'Aetna',
    claimAmount: 800.00,
    approvedAmount: 0.00,
    claimDate: '2024-01-08',
    status: 'denied',
    services: 'MRI, Radiology'
  },
  {
    id: 'IC003',
    patientName: 'Maria Garcia',
    insuranceProvider: 'Medicare',
    claimAmount: 650.00,
    approvedAmount: 0.00,
    claimDate: '2024-01-05',
    status: 'pending',
    services: 'Lab tests, Consultation'
  }
];

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 65000, expenses: 45000 },
  { month: 'Feb', revenue: 72000, expenses: 48000 },
  { month: 'Mar', revenue: 68000, expenses: 46000 },
  { month: 'Apr', revenue: 85000, expenses: 52000 },
  { month: 'May', revenue: 78000, expenses: 49000 },
  { month: 'Jun', revenue: 92000, expenses: 55000 }
];

const departmentRevenue = [
  { name: 'Cardiology', value: 125000, color: '#2F80ED' },
  { name: 'Orthopedics', value: 98000, color: '#27AE60' },
  { name: 'Radiology', value: 75000, color: '#F39C12' },
  { name: 'Laboratory', value: 65000, color: '#E74C3C' },
  { name: 'Pharmacy', value: 45000, color: '#9B59B6' }
];

export function FinanceDashboard({ user, onLogout }: FinanceDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
      case 'denied':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Monthly Revenue"
                value="$92,000"
                icon={<DollarSign className="w-6 h-6" />}
                trend={{ value: 18, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Outstanding Bills"
                value="$8,450"
                icon={<AlertCircle className="w-6 h-6" />}
                trend={{ value: 5, isPositive: false }}
                color="red"
              />
              <StatsCard
                title="Insurance Claims"
                value="15"
                icon={<CreditCard className="w-6 h-6" />}
                trend={{ value: 3, isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Net Profit"
                value="$37,000"
                icon={<TrendingUp className="w-6 h-6" />}
                trend={{ value: 12, isPositive: true }}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Revenue vs Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#27AE60" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#E74C3C" name="Expenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Revenue Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Revenue by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentRevenue}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Pending Bills */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Recent Bills
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Patient Due</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="text-sm text-gray-900">{bill.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">{bill.patientName}</p>
                            <p className="text-xs text-gray-500">ID: {bill.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-40 truncate">
                          {bill.services}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          ${bill.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-green-600">
                          ${bill.insuranceCoverage.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          ${bill.patientDue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(bill.status)}
                            <Badge className={getStatusColor(bill.status)}>
                              {bill.status}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Insurance Claims */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Insurance Claims Status
                </CardTitle>
                <Button variant="outline" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insuranceClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{claim.patientName}</p>
                          <p className="text-xs text-gray-600">{claim.insuranceProvider}</p>
                          <p className="text-xs text-gray-500">{claim.services}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4 mb-2">
                          <div>
                            <p className="text-sm text-gray-900">Claimed: ${claim.claimAmount.toFixed(2)}</p>
                            {claim.approvedAmount > 0 && (
                              <p className="text-xs text-green-600">Approved: ${claim.approvedAmount.toFixed(2)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(claim.status)}
                            <Badge className={getStatusColor(claim.status)}>
                              {claim.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Filed: {new Date(claim.claimDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-green-600 mb-2">92%</div>
                  <div className="text-sm text-gray-600">Collection Rate</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-blue-600 mb-2">15 days</div>
                  <div className="text-sm text-gray-600">Avg. Payment Time</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-yellow-600 mb-2">$8,450</div>
                  <div className="text-sm text-gray-600">Outstanding AR</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-purple-600 mb-2">87%</div>
                  <div className="text-sm text-gray-600">Insurance Approval Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navigationItems={
        <TopNavigation
          items={navigationItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}