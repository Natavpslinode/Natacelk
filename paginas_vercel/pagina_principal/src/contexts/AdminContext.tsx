import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/database';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminUser: any;
  loading: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);

  async function adminLogin(username: string, password: string): Promise<boolean> {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'login',
          username,
          password
        }
      });

      if (error || data?.error) {
        console.error('Admin login error:', error || data?.error);
        return false;
      }

      if (data?.data?.success) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.data.admin);
        
        // Store in sessionStorage for persistence
        sessionStorage.setItem('meproc_admin_auth', JSON.stringify({
          authenticated: true,
          admin: data.data.admin,
          timestamp: Date.now()
        }));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function adminLogout() {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    sessionStorage.removeItem('meproc_admin_auth');
  }

  // Check for existing admin session on mount
  React.useEffect(() => {
    const adminSession = sessionStorage.getItem('meproc_admin_auth');
    if (adminSession) {
      try {
        const { authenticated, admin, timestamp } = JSON.parse(adminSession);
        
        // Check if session is less than 24 hours old
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        
        if (authenticated && isValid) {
          setIsAdminAuthenticated(true);
          setAdminUser(admin);
        } else {
          sessionStorage.removeItem('meproc_admin_auth');
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        sessionStorage.removeItem('meproc_admin_auth');
      }
    }
  }, []);

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminUser,
      loading,
      adminLogin,
      adminLogout
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}