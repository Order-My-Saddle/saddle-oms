import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/Role';

export interface UserRoleInfo {
  role: UserRole | null;
  isAdmin: boolean;
  isSupervisor: boolean;
  isFitter: boolean;
  isSupplier: boolean;
  isUser: boolean;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

/**
 * Hook to get current user role information and permission checking utilities
 */
export function useUserRole(): UserRoleInfo {
  const { user, isLoaded, isAuthenticated } = useAuth();
  const role = user?.role || null;
  
  // Debug logging
  console.log('🔍 useUserRole: user from AuthContext:', user);
  console.log('🔍 useUserRole: isLoaded:', isLoaded);
  console.log('🔍 useUserRole: isAuthenticated:', isAuthenticated);
  console.log('🔍 useUserRole: extracted role:', role);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPERVISOR;
  const isSupervisor = role === UserRole.SUPERVISOR;
  const isFitter = role === UserRole.FITTER;
  const isSupplier = role === UserRole.SUPPLIER;
  const isUser = role === UserRole.USER;

  /**
   * Check if user has a specific role or any of multiple roles
   */
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    // Handle role hierarchy
    switch (requiredRole) {
      case UserRole.SUPERVISOR:
        return role === UserRole.SUPERVISOR;
      case UserRole.ADMIN:
        return role === UserRole.ADMIN || role === UserRole.SUPERVISOR;
      case UserRole.FITTER:
        return role === UserRole.FITTER || isAdmin;
      case UserRole.SUPPLIER:
        return role === UserRole.SUPPLIER || isAdmin;
      case UserRole.USER:
        return role !== null; // Any authenticated user
      default:
        return false;
    }
  };

  /**
   * Check if user has any of the provided roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(r => hasRole(r));
  };

  return {
    role,
    isAdmin,
    isSupervisor,
    isFitter,
    isSupplier,
    isUser,
    hasRole,
    hasAnyRole,
  };
}