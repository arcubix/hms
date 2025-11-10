import { useState } from 'react';
import { DashboardLayout } from '../common/DashboardLayout';
import { Sidebar, SidebarItem } from '../common/Sidebar';
import { StatsCard } from '../common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  CreditCard
} from 'lucide-react';
import { User } from '../../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { POSScreen } from '../pharmacy/POSScreen';

interface PharmacyDashboardProps {
  user: User;
  onLogout: () => void;
}

const sidebarItems: SidebarItem[] = [
  { icon: <Pill className="w-5 h-5" />, label: 'Dashboard', id: 'dashboard' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'POS System', id: 'pos' },
  { icon: <ShoppingCart className="w-5 h-5" />, label: 'Prescriptions', id: 'prescriptions', badge: '8' },
  { icon: <Package className="w-5 h-5" />, label: 'Inventory', id: 'inventory' },
  { icon: <AlertTriangle className="w-5 h-5" />, label: 'Low Stock', id: 'lowstock', badge: '5' },
  { icon: <Clock className="w-5 h-5" />, label: 'Expired Items', id: 'expired' },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Orders', id: 'orders' }
];

const pendingPrescriptions = [
  {
    id: 'RX001',
    patientName: 'John Smith',
    patientId: 'P001',
    doctorName: 'Dr. Michael Chen',
    medication: 'Lisinopril 10mg',
    quantity: '30 tablets',
    refills: 2,
    orderDate: '2024-01-15',
    status: 'pending',
    priority: 'routine'
  },
  {
    id: 'RX002',
    patientName: 'Emily Johnson',
    patientId: 'P002',
    doctorName: 'Dr. Sarah Williams',
    medication: 'Insulin Glargine',
    quantity: '1 vial',
    refills: 5,
    orderDate: '2024-01-15',
    status: 'ready',
    priority: 'urgent'
  },
  {
    id: 'RX003',
    patientName: 'Michael Brown',
    patientId: 'P003',
    doctorName: 'Dr. Robert Johnson',
    medication: 'Morphine 10mg',
    quantity: '20 tablets',
    refills: 0,
    orderDate: '2024-01-15',
    status: 'dispensed',
    priority: 'stat'
  }
];

const inventoryItems = [
  {
    id: 'M001',
    name: 'Lisinopril 10mg',
    category: 'Cardiovascular',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitCost: 0.25,
    expiryDate: '2025-06-15',
    supplier: 'PharmaCorp',
    status: 'in_stock'
  },
  {
    id: 'M002',
    name: 'Metformin 500mg',
    category: 'Diabetes',
    currentStock: 25,
    minStock: 100,
    maxStock: 600,
    unitCost: 0.15,
    expiryDate: '2024-12-20',
    supplier: 'MediSupply',
    status: 'low_stock'
  },
  {
    id: 'M003',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotic',
    currentStock: 5,
    minStock: 75,
    maxStock: 400,
    unitCost: 0.35,
    expiryDate: '2024-03-10',
    supplier: 'BioMed Inc',
    status: 'critical'
  },
  {
    id: 'M004',
    name: 'Ibuprofen 200mg',
    category: 'Pain Relief',
    currentStock: 300,
    minStock: 100,
    maxStock: 800,
    unitCost: 0.05,
    expiryDate: '2026-01-30',
    supplier: 'GenericMed',
    status: 'in_stock'
  }
];

export function PharmacyDashboard({ user, onLogout }: PharmacyDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'dispensed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
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

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getStockColor = (current: number, min: number) => {
    if (current <= min * 0.2) return 'text-red-600';
    if (current <= min) return 'text-yellow-600';
    return 'text-green-600';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
        return <POSScreen />;
      
      case 'inventory':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl text-gray-900">Inventory Management</h1>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Package className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Medicine Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">ID: {item.id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{item.category}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm ${getStockColor(item.currentStock, item.minStock)}`}>
                                {item.currentStock}
                              </span>
                              <span className="text-xs text-gray-500">/ {item.maxStock}</span>
                            </div>
                            <Progress 
                              value={getStockPercentage(item.currentStock, item.maxStock)} 
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">${item.unitCost}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            {item.status === 'low_stock' || item.status === 'critical' ? (
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                                Reorder
                              </Button>
                            ) : null}
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
      
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Pending Prescriptions"
                value="8"
                icon={<Clock className="w-6 h-6" />}
                trend={{ value: 2, isPositive: false }}
                color="yellow"
              />
              <StatsCard
                title="Ready for Pickup"
                value="12"
                icon={<CheckCircle className="w-6 h-6" />}
                trend={{ value: 5, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Low Stock Items"
                value="5"
                icon={<AlertTriangle className="w-6 h-6" />}
                color="red"
              />
              <StatsCard
                title="Total Inventory Value"
                value="$45,678"
                icon={<Package className="w-6 h-6" />}
                trend={{ value: 8, isPositive: true }}
                color="blue"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Prescriptions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Pending Prescriptions
                  </CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{prescription.patientName}</p>
                            <p className="text-xs text-gray-600">{prescription.medication}</p>
                            <p className="text-xs text-gray-500">
                              {prescription.quantity} • By {prescription.doctorName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(prescription.priority)}>
                              {prescription.priority}
                            </Badge>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                          {prescription.status === 'pending' ? (
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Fill
                            </Button>
                          ) : prescription.status === 'ready' ? (
                            <Button size="sm" variant="outline">
                              Dispense
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Low Stock Alerts
                  </CardTitle>
                  <Button variant="outline" size="sm">Reorder All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventoryItems
                      .filter(item => item.status === 'low_stock' || item.status === 'critical')
                      .map((item) => (
                        <div key={item.id} className={`p-4 rounded-lg border-l-4 ${
                          item.status === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-600">{item.category}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-sm ${getStockColor(item.currentStock, item.minStock)}`}>
                                  {item.currentStock} units left
                                </span>
                                <span className="text-xs text-gray-500">Min: {item.minStock}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace('_', ' ')}
                              </Badge>
                              <Button size="sm" className="mt-2 bg-blue-500 hover:bg-blue-600">
                                Reorder
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Fill Prescription</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-xs">Check Inventory</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-xs">Reorder Stock</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs">Check Expiry</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-20">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Ready for Pickup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-green-600 mb-2">34</div>
                  <div className="text-sm text-gray-600">Prescriptions Filled</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-blue-600 mb-2">$2,450</div>
                  <div className="text-sm text-gray-600">Revenue Generated</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl text-purple-600 mb-2">18</div>
                  <div className="text-sm text-gray-600">Patients Served</div>
                  <div className="text-xs text-gray-500 mt-1">Today</div>
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
      sidebar={
        <Sidebar
          items={sidebarItems}
          activeItem={activeSection}
          onItemClick={setActiveSection}
          title="Pharmacy"
        />
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}