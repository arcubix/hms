import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  UserCog,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Lock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastLogin: string;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Mock user data
  const users: User[] = [
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@hospital.com',
      phone: '+91 98765 43210',
      role: 'Admin',
      department: 'Administration',
      status: 'active',
      joinDate: '2023-01-15',
      lastLogin: '2 hours ago'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@hospital.com',
      phone: '+91 98765 43211',
      role: 'Doctor',
      department: 'Cardiology',
      status: 'active',
      joinDate: '2023-03-20',
      lastLogin: '1 hour ago'
    },
    {
      id: '3',
      name: 'Mary Johnson',
      email: 'mary.johnson@hospital.com',
      phone: '+91 98765 43212',
      role: 'Nurse',
      department: 'Emergency',
      status: 'active',
      joinDate: '2023-02-10',
      lastLogin: '30 mins ago'
    },
    {
      id: '4',
      name: 'David Lab Tech',
      email: 'david.lab@hospital.com',
      phone: '+91 98765 43213',
      role: 'Lab Staff',
      department: 'Laboratory',
      status: 'active',
      joinDate: '2023-04-05',
      lastLogin: '3 hours ago'
    },
    {
      id: '5',
      name: 'Lisa Pharmacist',
      email: 'lisa.pharm@hospital.com',
      phone: '+91 98765 43214',
      role: 'Pharmacy',
      department: 'Pharmacy',
      status: 'active',
      joinDate: '2023-05-12',
      lastLogin: '1 day ago'
    },
    {
      id: '6',
      name: 'Robert Finance',
      email: 'robert.fin@hospital.com',
      phone: '+91 98765 43215',
      role: 'Finance',
      department: 'Finance',
      status: 'active',
      joinDate: '2023-06-18',
      lastLogin: '5 hours ago'
    },
    {
      id: '7',
      name: 'Emily Davis',
      email: 'emily.davis@hospital.com',
      phone: '+91 98765 43216',
      role: 'Nurse',
      department: 'ICU',
      status: 'inactive',
      joinDate: '2023-01-08',
      lastLogin: '1 week ago'
    },
    {
      id: '8',
      name: 'Dr. James Brown',
      email: 'james.brown@hospital.com',
      phone: '+91 98765 43217',
      role: 'Doctor',
      department: 'Neurology',
      status: 'active',
      joinDate: '2023-07-22',
      lastLogin: '45 mins ago'
    }
  ];

  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.status === 'active').length.toString(),
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Doctors',
      value: users.filter(u => u.role === 'Doctor').length.toString(),
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Staff',
      value: users.filter(u => u.role !== 'Doctor' && u.role !== 'Admin').length.toString(),
      icon: UserCog,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-white" />
                </div>
                User Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage hospital staff and user accounts</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Lab Staff">Lab Staff</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg">Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-700">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.department}</span>
                    </TableCell>
                    <TableCell>
                      {user.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {user.lastLogin}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Lock className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
