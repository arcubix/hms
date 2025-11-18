import { useState, useEffect } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { NurseDashboard } from './components/dashboards/NurseDashboard';
import { LabDashboard } from './components/dashboards/LabDashboard';
import { PharmacyDashboard } from './components/dashboards/PharmacyDashboard';
import { FinanceDashboard } from './components/dashboards/FinanceDashboard';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'admin' | 'doctor' | 'patient' | 'nurse' | 'lab' | 'pharmacy' | 'finance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  doctor?: {
    id: number;
    doctor_id: string;
    specialty: string;
    experience: number;
    qualification?: string;
    status: string;
    schedule_start: string;
    schedule_end: string;
  };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Clear any existing hash when logging in
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleLogout = async () => {
    // Import api dynamically to avoid circular dependency
    const { api } = await import('./services/api');
    await api.logout();
    setUser(null);
    // Clear hash when logging out
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Handle page refresh - maintain login state if user data exists in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('hms-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('hms-user');
      }
    }

    // Set up API service to handle 401 errors and redirect to login
    const setupApiErrorHandling = async () => {
      const { api } = await import('./services/api');
      api.setOnUnauthorized(() => {
        setUser(null);
        localStorage.removeItem('hms-user');
      });
    };
    setupApiErrorHandling();
  }, []);

  // Save user to localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('hms-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hms-user');
    }
  }, [user]);

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'doctor':
        return <DoctorDashboard user={user} onLogout={handleLogout} />;
      case 'patient':
        return <PatientDashboard user={user} onLogout={handleLogout} />;
      case 'nurse':
        return <NurseDashboard user={user} onLogout={handleLogout} />;
      case 'lab':
        return <LabDashboard user={user} onLogout={handleLogout} />;
      case 'pharmacy':
        return <PharmacyDashboard user={user} onLogout={handleLogout} />;
      case 'finance':
        return <FinanceDashboard user={user} onLogout={handleLogout} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
      <Toaster position="top-right" richColors />
    </div>
  );
}