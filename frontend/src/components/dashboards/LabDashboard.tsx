import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { TopNavigation, NavigationItem } from '../common/TopNavigation';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Download,
  Microscope,
  TestTube,
  FileText,
  Calendar
} from 'lucide-react';
import { User } from '../../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface LabDashboardProps {
  user: User;
  onLogout: () => void;
}

const navigationItems: NavigationItem[] = [
  { icon: <FlaskConical className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <TestTube className="w-5 h-5" />, label: 'Sample Collection', id: 'collection', badge: '6' },
  { icon: <Microscope className="w-5 h-5" />, label: 'Test Processing', id: 'processing' },
  { icon: <FileText className="w-5 h-5" />, label: 'Results Upload', id: 'results' },
  { icon: <Clock className="w-5 h-5" />, label: 'Pending Tests', id: 'pending', badge: '12' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Completed Tests', id: 'completed' }
];

const pendingTests = [
  {
    id: 'T001',
    patientName: 'John Smith',
    patientId: 'P001',
    testType: 'Complete Blood Count',
    priority: 'routine',
    orderDate: '2024-01-15',
    dueDate: '2024-01-16',
    status: 'sample_collected',
    doctorName: 'Dr. Michael Chen'
  },
  {
    id: 'T002',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    testType: 'Lipid Panel',
    priority: 'urgent',
    orderDate: '2024-01-15',
    dueDate: '2024-01-15',
    status: 'processing',
    doctorName: 'Dr. Sarah Williams'
  },
  {
    id: 'T003',
    patientName: 'Michael Brown',
    patientId: 'P003',
    testType: 'Cardiac Enzymes',
    priority: 'stat',
    orderDate: '2024-01-15',
    dueDate: '2024-01-15',
    status: 'results_ready',
    doctorName: 'Dr. Robert Johnson'
  }
];

const sampleCollection = [
  {
    id: 'S001',
    patientName: 'Sarah Davis',
    patientId: 'P004',
    testType: 'Glucose Test',
    collectionTime: '09:30 AM',
    location: 'Room A101',
    status: 'scheduled'
  },
  {
    id: 'S002',
    patientName: 'Robert Wilson',
    patientId: 'P005',
    testType: 'Urine Analysis',
    collectionTime: '10:00 AM',
    location: 'Room B202',
    status: 'in_progress'
  },
  {
    id: 'S003',
    patientName: 'Maria Garcia',
    patientId: 'P006',
    testType: 'Blood Culture',
    collectionTime: '10:30 AM',
    location: 'Room C303',
    status: 'completed'
  }
];

const recentResults = [
  {
    id: 'R001',
    patientName: 'Alice Johnson',
    testType: 'Thyroid Function',
    completedDate: '2024-01-14',
    result: 'Normal',
    technician: 'Lab Tech A',
    status: 'uploaded'
  },
  {
    id: 'R002',
    patientName: 'David Brown',
    testType: 'Liver Function',
    completedDate: '2024-01-14',
    result: 'Abnormal',
    technician: 'Lab Tech B',
    status: 'pending_review'
  },
  {
    id: 'R003',
    patientName: 'Lisa Wilson',
    testType: 'Kidney Function',
    completedDate: '2024-01-13',
    result: 'Normal',
    technician: 'Lab Tech C',
    status: 'uploaded'
  }
];

export function LabDashboard({ user, onLogout }: LabDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sample_collected':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'results_ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'uploaded':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      case 'routine':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                title="Pending Tests"
                value="12"
                icon={<Clock className="w-6 h-6" />}
                trend={{ value: 3, isPositive: false }}
                color="yellow"
              />
              <StatsCard
                title="Samples to Collect"
                value="6"
                icon={<TestTube className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                title="Results Ready"
                value="8"
                icon={<CheckCircle className="w-6 h-6" />}
                trend={{ value: 15, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Critical Results"
                value="2"
                icon={<AlertCircle className="w-6 h-6" />}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sample Collection Queue */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-blue-600" />
                    Sample Collection Queue
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sampleCollection.map((sample) => (
                      <div key={sample.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TestTube className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{sample.patientName}</p>
                            <p className="text-xs text-gray-600">{sample.testType}</p>
                            <p className="text-xs text-gray-500">{sample.location} • {sample.collectionTime}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(sample.status)}>
                            {sample.status.replace('_', ' ')}
                          </Badge>
                          {sample.status === 'scheduled' && (
                            <Button size="sm" className="mt-2 bg-blue-500 hover:bg-blue-600">
                              Collect
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Results */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Recent Results
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Microscope className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{result.patientName}</p>
                            <p className="text-xs text-gray-600">{result.testType}</p>
                            <p className="text-xs text-gray-500">By {result.technician} • {new Date(result.completedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <Badge className={getResultColor(result.result)}>
                              {result.result}
                            </Badge>
                            <div className="mt-1">
                              <Badge className={getStatusColor(result.status)}>
                                {result.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          {result.status === 'pending_review' && (
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Tests Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="text-sm text-gray-900">{test.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">{test.patientName}</p>
                            <p className="text-xs text-gray-500">ID: {test.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">{test.testType}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(test.priority)}>
                            {test.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{test.doctorName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(test.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {test.status === 'results_ready' ? (
                              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                                <Upload className="w-3 h-3 mr-1" />
                                Upload
                              </Button>
                            ) : test.status === 'sample_collected' ? (
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                                Process
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <TestTube className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Collect Sample</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Microscope className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Process Test</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Upload className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Upload Results</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Download className="w-5 h-5 text-orange-600" />
                    <span className="text-xs">Download Report</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Flag Critical</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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