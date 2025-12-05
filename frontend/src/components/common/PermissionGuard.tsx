import React, { ReactNode } from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * PermissionGuard component
 * Renders children only if user has the required permission(s)
 * 
 * @example
 * <PermissionGuard permission="admin.view_users">
 *   <button>Delete User</button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard permissions={['admin.edit_users', 'admin.delete_users']} requireAll>
 *   <button>Advanced Action</button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

