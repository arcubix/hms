/**
 * Icon Showcase - Visual Reference for Updated Menu Icons
 * Displays all HMS settings menu icons with their labels
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Settings,
  ClipboardList,
  Users,
  Calculator,
  Headphones,
  List,
  Sliders,
  Megaphone,
  LogOut,
  CheckCircle
} from 'lucide-react';

interface IconItem {
  id: string;
  name: string;
  icon: any;
  description: string;
  status?: 'updated' | 'new' | 'default';
}

const menuIcons: IconItem[] = [
  {
    id: 'user-settings',
    name: 'User Settings',
    icon: Settings,
    description: 'Manage your profile and preferences',
    status: 'default'
  },
  {
    id: 'priority-modules',
    name: 'Priority Modules',
    icon: ClipboardList,
    description: 'Customize your dashboard modules',
    status: 'updated'
  },
  {
    id: 'contacts',
    name: 'Contacts',
    icon: Users,
    description: 'Software team contacts and support',
    status: 'updated'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: Calculator,
    description: 'View invoices and payment history',
    status: 'default'
  },
  {
    id: 'support',
    name: 'Support',
    icon: Headphones,
    description: 'Get help and submit tickets',
    status: 'default'
  },
  {
    id: 'audit-log',
    name: 'Audit Log',
    icon: List,
    description: 'System activity and security logs',
    status: 'default'
  },
  {
    id: 'admin-settings',
    name: 'Admin Settings',
    icon: Sliders,
    description: 'Advanced system configuration',
    status: 'default'
  },
  {
    id: 'whats-new',
    name: "What's New",
    icon: Megaphone,
    description: 'Latest updates and announcements',
    status: 'default'
  },
  {
    id: 'logout',
    name: 'Logout',
    icon: LogOut,
    description: 'Sign out of your account',
    status: 'default'
  }
];

export function IconShowcase() {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'updated':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Updated</Badge>;
      case 'new':
        return <Badge className="bg-green-100 text-green-800 border-green-200">New</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HMS Menu Icons Showcase</h1>
          <p className="text-gray-600">
            Visual reference for all System Settings menu icons
          </p>
        </div>

        {/* Update Summary */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Recent Icon Updates</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    <span><strong>Priority Modules:</strong> Updated from FileText to ClipboardList for better visual representation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span><strong>Contacts:</strong> Description updated to "Software team contacts and support"</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon Grid - Large Display */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Large Icons (Sidebar Size)</CardTitle>
            <CardDescription>20px × 20px - Used in settings sidebar navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuIcons.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.id} className="border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                          item.status === 'updated' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-7 h-7 ${
                            item.status === 'updated'
                              ? 'text-blue-600'
                              : 'text-gray-700'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                            {IconComponent.name || 'Icon'}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Icon Grid - Small Display */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Small Icons (Dropdown Size)</CardTitle>
            <CardDescription>16px × 16px - Used in dropdown menus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuIcons.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors border ${
                      item.status === 'updated'
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${
                      item.status === 'updated' ? 'text-blue-600' : 'text-gray-700'
                    }`} />
                    <span className="flex-1">{item.name}</span>
                    {getStatusBadge(item.status)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Icon States */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Default State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                  <ClipboardList className="w-4 h-4" />
                  <span>Priority Modules</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>Contacts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Active State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white">
                  <ClipboardList className="w-4 h-4" />
                  <span>Priority Modules</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white">
                  <Users className="w-4 h-4" />
                  <span>Contacts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Hover State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-700">
                  <ClipboardList className="w-4 h-4" />
                  <span>Priority Modules</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>Contacts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Icon Details */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Updated Icons - Technical Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Menu Item</th>
                    <th className="text-left p-3">Icon Component</th>
                    <th className="text-left p-3">Previous Icon</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">Priority Modules</td>
                    <td className="p-3">
                      <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">ClipboardList</code>
                    </td>
                    <td className="p-3">
                      <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded">FileText</code>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-blue-100 text-blue-800">Updated</Badge>
                    </td>
                    <td className="p-3 text-gray-600">Better represents module management</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">Contacts</td>
                    <td className="p-3">
                      <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Users</code>
                    </td>
                    <td className="p-3">
                      <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Users</code>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-800">Description Updated</Badge>
                    </td>
                    <td className="p-3 text-gray-600">Icon kept, description clarified</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
