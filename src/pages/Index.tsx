import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import AdminPanel from '@/components/AdminPanel';
import ManagerPanel from '@/components/ManagerPanel';
import WorkerPanel from '@/components/WorkerPanel';

interface User {
  id: number;
  login: string;
  role: 'admin' | 'manager' | 'worker';
  full_name: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminPanel user={user} onLogout={handleLogout} />;
  }

  if (user.role === 'manager') {
    return <ManagerPanel user={user} onLogout={handleLogout} />;
  }

  return <WorkerPanel user={user} onLogout={handleLogout} />;
};

export default Index;