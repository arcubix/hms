import { useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { NurseDashboard } from './components/dashboards/NurseDashboard';
import { LabDashboard } from './components/dashboards/LabDashboard';
import { PharmacyDashboard } from './components/dashboards/PharmacyDashboard';
import { FinanceDashboard } from './components/dashboards/FinanceDashboard';

export type UserRole = 'admin' | 'doctor' | 'patient' | 'nurse' | 'lab' | 'pharmacy' | 'finance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show appropriate dashboard based on user role
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
      return <LoginPage onLogin={handleLogin} />;
  }
}
