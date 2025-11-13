import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserRole, User } from '../../App';
import { Shield, Heart, Activity, Users, FlaskConical, Pill, Calculator } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Mock user data for demo purposes
  const mockUsers: Record<UserRole, User> = {
    admin: { id: '1', name: 'Dr. Sarah Wilson', email: 'admin@hospital.com', role: 'admin' },
    doctor: { id: '2', name: 'Dr. Michael Chen', email: 'doctor@hospital.com', role: 'doctor' },
    patient: { id: '3', name: 'John Smith', email: 'patient@hospital.com', role: 'patient' },
    nurse: { id: '4', name: 'Mary Johnson', email: 'nurse@hospital.com', role: 'nurse' },
    lab: { id: '5', name: 'David Lab Tech', email: 'lab@hospital.com', role: 'lab' },
    pharmacy: { id: '6', name: 'Lisa Pharmacist', email: 'pharmacy@hospital.com', role: 'pharmacy' },
    finance: { id: '7', name: 'Robert Finance', email: 'finance@hospital.com', role: 'finance' }
  };

  const roleIcons = {
    admin: Shield,
    doctor: Heart,
    patient: Users,
    nurse: Activity,
    lab: FlaskConical,
    pharmacy: Pill,
    finance: Calculator
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    onLogin(mockUsers[selectedRole]);
  };

  const handleRoleLogin = (role: UserRole) => {
    onLogin(mockUsers[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl text-gray-900">MediCare HMS</h1>
          </div>
          <p className="text-gray-600">Hospital Management System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Sign In</CardTitle>
              <p className="text-gray-600">Access your dashboard</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(roleIcons).map(([role, Icon]) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role as UserRole)}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          selectedRole === role
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="capitalize text-sm">{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Demo Access */}
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Demo Access</CardTitle>
              <p className="text-gray-600">Quick access to different dashboards</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(roleIcons).map(([role, Icon]) => (
                  <Button
                    key={role}
                    variant="outline"
                    className="w-full justify-start border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    onClick={() => handleRoleLogin(role as UserRole)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="capitalize">{role} Dashboard</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {mockUsers[role as UserRole].name}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 MediCare HMS. Secure Healthcare Management.</p>
        </div>
      </div>
    </div>
  );
}