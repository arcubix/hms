import { User } from '../App';

export interface MenuItemPermission {
  menuId: string;
  requiredPermissions?: string[]; // Permission keys required to see this menu
  requiredRoles?: string[]; // Roles that can access this menu (alternative to permissions)
  requireAllPermissions?: boolean; // If true, user must have ALL permissions, otherwise ANY
}

// Map menu items to their required permissions/roles
export const menuPermissions: Record<string, MenuItemPermission> = {
  'dashboard': { menuId: 'dashboard' }, // Everyone can see dashboard
  'analytics': { menuId: 'analytics', requiredPermissions: ['view_analytics'], requiredRoles: ['admin'] },
  'emergency': { menuId: 'emergency', requiredPermissions: ['view_emergency'], requiredRoles: ['admin', 'doctor', 'nurse'] },
  'patients': { menuId: 'patients', requiredPermissions: ['view_patients'], requiredRoles: ['admin', 'doctor', 'nurse'] },
  'doctors': { menuId: 'doctors', requiredPermissions: ['view_doctors'], requiredRoles: ['admin'] },
  'users': { menuId: 'users', requiredPermissions: ['manage_users'], requiredRoles: ['admin'] },
  'appointments': { menuId: 'appointments', requiredPermissions: ['view_appointments'], requiredRoles: ['admin', 'doctor', 'nurse'] },
  'schedule': { menuId: 'schedule', requiredPermissions: ['view_schedule'], requiredRoles: ['doctor'] },
  'opd': { menuId: 'opd', requiredPermissions: ['view_opd'], requiredRoles: ['admin', 'doctor'] },
  'ipd': { menuId: 'ipd', requiredPermissions: ['view_ipd'], requiredRoles: ['admin', 'doctor', 'nurse'] },
  'beds': { menuId: 'beds', requiredPermissions: ['manage_beds'], requiredRoles: ['admin', 'nurse'] },
  'ward': { menuId: 'ward', requiredPermissions: ['manage_ward'], requiredRoles: ['nurse'] },
  'monitoring': { menuId: 'monitoring', requiredPermissions: ['view_patient_monitoring'], requiredRoles: ['nurse'] },
  'medication': { menuId: 'medication', requiredPermissions: ['manage_medication'], requiredRoles: ['nurse'] },
  'alerts': { menuId: 'alerts', requiredPermissions: ['view_alerts'], requiredRoles: ['nurse'] },
  'healthrecords': { menuId: 'healthrecords', requiredPermissions: ['view_health_records'], requiredRoles: ['admin', 'doctor'] },
  'records': { menuId: 'records', requiredPermissions: ['view_patient_records'], requiredRoles: ['doctor'] },
  'prescriptions': { menuId: 'prescriptions', requiredPermissions: ['view_prescriptions'], requiredRoles: ['admin', 'doctor', 'pharmacy'] },
  'pharmacy': { menuId: 'pharmacy', requiredPermissions: ['view_pharmacy'], requiredRoles: ['admin', 'pharmacy'] },
  'pharmacy-group': { menuId: 'pharmacy-group', requiredPermissions: ['view_pharmacy'], requiredRoles: ['admin', 'pharmacy'] },
  'pos': { menuId: 'pos', requiredPermissions: ['access_pos'], requiredRoles: ['admin', 'pharmacy'] },
  'shifts': { menuId: 'shifts', requiredPermissions: ['manage_shifts'], requiredRoles: ['admin', 'pharmacy'] },
  'inventory': { menuId: 'inventory', requiredPermissions: ['view_inventory'], requiredRoles: ['admin', 'pharmacy'] },
  'transactions': { menuId: 'transactions', requiredPermissions: ['view_transactions'], requiredRoles: ['admin', 'pharmacy', 'finance'] },
  'pos-reports': { menuId: 'pos-reports', requiredPermissions: ['view_pos_reports'], requiredRoles: ['admin', 'pharmacy'] },
  'orders': { menuId: 'orders', requiredPermissions: ['view_orders'], requiredRoles: ['admin', 'pharmacy'] },
  'pharmacy-settings': { menuId: 'pharmacy-settings', requiredPermissions: ['manage_pharmacy_settings'], requiredRoles: ['admin', 'pharmacy'] },
  'lab': { menuId: 'lab', requiredPermissions: ['view_lab'], requiredRoles: ['admin', 'doctor', 'lab'] },
  'lab-group': { menuId: 'lab-group', requiredPermissions: ['view_lab'], requiredRoles: ['admin', 'doctor', 'lab'] },
  'collection': { menuId: 'collection', requiredPermissions: ['manage_sample_collection'], requiredRoles: ['lab'] },
  'processing': { menuId: 'processing', requiredPermissions: ['process_tests'], requiredRoles: ['lab'] },
  'results': { menuId: 'results', requiredPermissions: ['upload_results'], requiredRoles: ['lab'] },
  'pending': { menuId: 'pending', requiredPermissions: ['view_pending_tests'], requiredRoles: ['lab'] },
  'completed': { menuId: 'completed', requiredPermissions: ['view_completed_tests'], requiredRoles: ['lab'] },
  'radiology': { menuId: 'radiology', requiredPermissions: ['view_radiology'], requiredRoles: ['admin', 'doctor'] },
  'billing': { menuId: 'billing', requiredPermissions: ['view_billing'], requiredRoles: ['admin', 'finance', 'patient'] },
  'finance-group': { menuId: 'finance-group', requiredPermissions: ['view_billing'], requiredRoles: ['admin', 'finance'] },
  'patient-billing': { menuId: 'patient-billing', requiredPermissions: ['view_billing'], requiredRoles: ['admin', 'finance', 'patient'] },
  'insurance': { menuId: 'insurance', requiredPermissions: ['manage_insurance'], requiredRoles: ['admin', 'finance'] },
  'outstanding': { menuId: 'outstanding', requiredPermissions: ['view_outstanding_bills'], requiredRoles: ['admin', 'finance'] },
  'reports': { menuId: 'reports', requiredPermissions: ['view_reports'], requiredRoles: ['admin', 'finance'] },
  'revenue-analytics': { menuId: 'revenue-analytics', requiredPermissions: ['view_revenue_analytics'], requiredRoles: ['admin', 'finance'] },
  'telemedicine': { menuId: 'telemedicine', requiredPermissions: ['access_telemedicine'], requiredRoles: ['doctor'] },
  'profile': { menuId: 'profile', requiredRoles: ['patient'] },
  'settings': { menuId: 'settings' }, // Everyone can access settings
  'role-permissions': { menuId: 'role-permissions', requiredPermissions: ['manage_role_permissions'], requiredRoles: ['admin'] }
};

/**
 * Check if user has access to a menu item based on permissions and roles
 */
export function canAccessMenu(user: User, menuId: string, userPermissions?: Record<string, boolean>): boolean {
  const menuPermission = menuPermissions[menuId];
  
  // If no permission config, allow access
  if (!menuPermission) {
    return true;
  }

  // Check role-based access
  if (menuPermission.requiredRoles && menuPermission.requiredRoles.length > 0) {
    if (menuPermission.requiredRoles.includes(user.role)) {
      return true;
    }
  }

  // Check permission-based access
  if (menuPermission.requiredPermissions && menuPermission.requiredPermissions.length > 0 && userPermissions) {
    if (menuPermission.requireAllPermissions) {
      // User must have ALL permissions
      return menuPermission.requiredPermissions.every(perm => userPermissions[perm] === true);
    } else {
      // User must have ANY permission
      return menuPermission.requiredPermissions.some(perm => userPermissions[perm] === true);
    }
  }

  // If no role match and no permissions provided, deny access
  if (menuPermission.requiredRoles || menuPermission.requiredPermissions) {
    return false;
  }

  // Default: allow access
  return true;
}

/**
 * Filter menu items based on user permissions and roles
 * Handles both regular items and grouped items with children
 */
export function filterMenuItems(
  items: NavigationItem[],
  user: User,
  userPermissions?: Record<string, boolean>
): NavigationItem[] {
  return items
    .map(item => {
      // If item has children, filter children first
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter(child => 
          canAccessMenu(user, child.id, userPermissions)
        );
        
        // If no children are accessible, don't show the parent
        if (filteredChildren.length === 0) {
          return null;
        }
        
        // Return item with filtered children
        return {
          ...item,
          children: filteredChildren
        };
      }
      
      // Regular item - check if accessible
      if (canAccessMenu(user, item.id, userPermissions)) {
        return item;
      }
      
      return null;
    })
    .filter((item): item is NavigationItem => item !== null);
}

/**
 * Check if user has a specific permission
 * @param permission Permission key to check
 * @param userPermissions Optional permissions object (if not provided, returns false)
 * @returns True if user has the permission
 */
export function hasPermission(
  permission: string,
  userPermissions?: Record<string, boolean>
): boolean {
  if (!userPermissions) {
    return false;
  }
  return userPermissions[permission] === true;
}

/**
 * Check if user has any of the specified permissions
 * @param permissions Array of permission keys
 * @param userPermissions Optional permissions object
 * @returns True if user has at least one permission
 */
export function hasAnyPermission(
  permissions: string[],
  userPermissions?: Record<string, boolean>
): boolean {
  if (!userPermissions || permissions.length === 0) {
    return false;
  }
  return permissions.some(perm => hasPermission(perm, userPermissions));
}

/**
 * Check if user has all of the specified permissions
 * @param permissions Array of permission keys
 * @param userPermissions Optional permissions object
 * @returns True if user has all permissions
 */
export function hasAllPermissions(
  permissions: string[],
  userPermissions?: Record<string, boolean>
): boolean {
  if (!userPermissions || permissions.length === 0) {
    return false;
  }
  return permissions.every(perm => hasPermission(perm, userPermissions));
}

/**
 * Require a specific permission (throws error if missing)
 * @param permission Permission key required
 * @param userPermissions Optional permissions object
 * @throws Error if permission is missing
 */
export function requirePermission(
  permission: string,
  userPermissions?: Record<string, boolean>
): void {
  if (!hasPermission(permission, userPermissions)) {
    throw new Error(`Permission denied: ${permission} is required`);
  }
}

// Re-export NavigationItem type for convenience
import type { NavigationItem } from '../components/common/TopNavigation';
export type { NavigationItem };

