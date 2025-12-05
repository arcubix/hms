import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../App';
import { api } from '../services/api';

interface PermissionContextType {
  permissions: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
  user: User | null;
}

export function PermissionProvider({ children, user }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = async () => {
    if (!user) {
      setPermissions({});
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch permissions from API
      const permissionsArray = await api.getUserPermissions(user.id);
      
      // Convert array to object format
      const permissionsObj: Record<string, boolean> = {};
      if (Array.isArray(permissionsArray)) {
        permissionsArray.forEach((perm: string) => {
          permissionsObj[perm] = true;
        });
      }
      
      setPermissions(permissionsObj);
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [user?.id]);

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  const isAdmin = (): boolean => {
    return user?.role?.toLowerCase() === 'admin';
  };

  const hasPermission = (permission: string): boolean => {
    // Allow admin role by default
    if (isAdmin()) {
      return true;
    }
    return permissions[permission] === true;
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Allow admin role by default
    if (isAdmin()) {
      return true;
    }
    return permissionList.some(perm => hasPermission(perm));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // Allow admin role by default
    if (isAdmin()) {
      return true;
    }
    return permissionList.every(perm => hasPermission(perm));
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    error,
    refreshPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

