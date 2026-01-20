import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission, SCREEN_PERMISSIONS } from '@/utils/rolePermissions';
import { UserRole } from '@/types/Role';

interface RoleProtectedComponentProps {
  children: React.ReactNode;
  /** Screen permission key from SCREEN_PERMISSIONS */
  requiredPermission?: keyof typeof SCREEN_PERMISSIONS;
  /** Direct role requirement (alternative to requiredPermission) */
  requiredRole?: UserRole | UserRole[];
  /** Custom role checking function */
  customCheck?: (userRole: UserRole | null) => boolean;
  /** What to render when access is denied */
  fallback?: React.ReactNode;
  /** Hide completely vs show fallback when access denied */
  hideWhenDenied?: boolean;
}

/**
 * Component wrapper that conditionally renders children based on user role permissions
 */
export function RoleProtectedComponent({
  children,
  requiredPermission,
  requiredRole,
  customCheck,
  fallback = null,
  hideWhenDenied = false,
}: RoleProtectedComponentProps) {
  const { role, hasRole } = useUserRole();

  let hasAccess = false;

  if (customCheck) {
    hasAccess = customCheck(role);
  } else if (requiredPermission) {
    hasAccess = hasScreenPermission(role, requiredPermission);
  } else if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  } else {
    // No restrictions specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    if (hideWhenDenied) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook version for conditional logic in components
 */
export function useRolePermission(
  requiredPermission?: keyof typeof SCREEN_PERMISSIONS,
  requiredRole?: UserRole | UserRole[],
  customCheck?: (userRole: UserRole | null) => boolean
): boolean {
  const { role, hasRole } = useUserRole();

  if (customCheck) {
    return customCheck(role);
  } else if (requiredPermission) {
    return hasScreenPermission(role, requiredPermission);
  } else if (requiredRole) {
    return hasRole(requiredRole);
  }

  return true;
}