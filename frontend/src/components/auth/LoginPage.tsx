import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserRole, User } from '../../App';
import { Heart, Shield, Activity, Users, FlaskConical, Pill, Calculator } from 'lucide-react';
import { api } from '../../services/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleIcons = {
    admin: Shield,
    doctor: Heart,
    patient: Users,
    nurse: Activity,
    lab: FlaskConical,
    pharmacy: Pill,
    finance: Calculator
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      onLogin({
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as User['role'],
        doctor: data.doctor || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200"
                    required
                    disabled={loading}
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
                    required
                    disabled={loading}
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
                        disabled={loading}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="capitalize text-sm">{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-500 hover:bg-blue-600" 
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Sign In'}
                </Button>
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p className="mb-1">Admin: admin@hospital.com / admin123</p>
                  <p>Doctor: Use your registered email / doctor123</p>
                  <p>Pharmacy: Use your registered email / password</p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Role Selection</CardTitle>
              <p className="text-gray-600">Select your role to access the appropriate dashboard</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(roleIcons).map(([role, Icon]) => (
                  <div
                    key={role}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedRole === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedRole === role ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${selectedRole === role ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{role} Dashboard</p>
                        <p className="text-xs text-gray-500">
                          {role === 'admin' && 'Full system access and management'}
                          {role === 'doctor' && 'Patient care and medical records'}
                          {role === 'patient' && 'View appointments and medical history'}
                          {role === 'nurse' && 'Patient monitoring and care coordination'}
                          {role === 'lab' && 'Laboratory tests and results management'}
                          {role === 'pharmacy' && 'Medication dispensing and inventory'}
                          {role === 'finance' && 'Financial records and billing'}
                        </p>
                      </div>
                    </div>
                  </div>
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