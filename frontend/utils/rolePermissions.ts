import { UserRole } from '@/types/Role';

/**
 * Screen/Feature permissions configuration
 * Define which roles can access each screen or feature
 */
export const SCREEN_PERMISSIONS = {
  // Main Navigation
  DASHBOARD: [UserRole.USER, UserRole.FITTER, UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR],
  ORDERS: [UserRole.USER, UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
  CUSTOMERS: [UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
  FITTERS: [UserRole.ADMIN, UserRole.SUPERVISOR],
  REPORTS: [UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Saddle Modeling
  SADDLE_MODELING: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  BRANDS: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  MODELS: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  LEATHER_TYPES: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  OPTIONS: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  EXTRAS: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  PRESETS: [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
  SUPPLIERS: [UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Account Management - ADMIN and SUPERVISOR
  ACCOUNT_MANAGEMENT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  USER_MANAGEMENT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  WAREHOUSE_MANAGEMENT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  USER_PERMISSIONS_VIEW: [UserRole.ADMIN, UserRole.SUPERVISOR],
  ACCESS_FILTER_GROUPS: [UserRole.ADMIN, UserRole.SUPERVISOR],
  WAREHOUSES: [UserRole.ADMIN, UserRole.SUPERVISOR],
  COUNTRY_MANAGERS: [UserRole.ADMIN, UserRole.SUPERVISOR],
  SUPPLIERS_MANAGEMENT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Order Actions
  ORDER_CREATE: [UserRole.USER, UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
  ORDER_EDIT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  ORDER_DELETE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  ORDER_APPROVE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  ORDER_VIEW: [UserRole.USER, UserRole.FITTER, UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Customer Actions
  CUSTOMER_CREATE: [UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
  CUSTOMER_EDIT: [UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
  CUSTOMER_DELETE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Fitter Actions
  FITTER_CREATE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  FITTER_EDIT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  FITTER_DELETE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Supplier Actions
  SUPPLIER_CREATE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  SUPPLIER_EDIT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  SUPPLIER_DELETE: [UserRole.ADMIN, UserRole.SUPERVISOR],

  // Saddle Stock Management
  REPAIRS: [UserRole.USER, UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
  MY_SADDLE_STOCK: [UserRole.FITTER],
  AVAILABLE_SADDLE_STOCK: [UserRole.FITTER],
  ALL_SADDLE_STOCK: [UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // User Actions - ADMIN and SUPERVISOR
  USER_CREATE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  USER_EDIT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  USER_DELETE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  USER_VIEW: [UserRole.ADMIN, UserRole.SUPERVISOR],
  
  // Warehouse Actions - ADMIN and SUPERVISOR
  WAREHOUSE_CREATE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  WAREHOUSE_EDIT: [UserRole.ADMIN, UserRole.SUPERVISOR],
  WAREHOUSE_DELETE: [UserRole.ADMIN, UserRole.SUPERVISOR],
  WAREHOUSE_VIEW: [UserRole.ADMIN, UserRole.SUPERVISOR],
} as const;

/**
 * Screen constants for easier referencing in tests and components
 */
export const Screen = {
  DASHBOARD: 'DASHBOARD',
  ORDERS: 'ORDERS',
  CUSTOMERS: 'CUSTOMERS',
  FITTERS: 'FITTERS',
  REPORTS: 'REPORTS',
  SADDLE_MODELING: 'SADDLE_MODELING',
  BRANDS: 'BRANDS',
  MODELS: 'MODELS',
  LEATHER_TYPES: 'LEATHER_TYPES',
  OPTIONS: 'OPTIONS',
  EXTRAS: 'EXTRAS',
  PRESETS: 'PRESETS',
  SUPPLIERS: 'SUPPLIERS',
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_EDIT: 'ORDER_EDIT',
  ORDER_DELETE: 'ORDER_DELETE',
  ORDER_APPROVE: 'ORDER_APPROVE',
  ORDER_VIEW: 'ORDER_VIEW',
  CUSTOMER_CREATE: 'CUSTOMER_CREATE',
  CUSTOMER_EDIT: 'CUSTOMER_EDIT',
  CUSTOMER_DELETE: 'CUSTOMER_DELETE',
} as const;

/**
 * Permission constants for actions
 */
export const Permission = {
  VIEW: 'VIEW',
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
} as const;

/**
 * Check if a user role has permission to access a screen/feature
 */
export function hasScreenPermission(
  userRole: UserRole | null,
  screen: keyof typeof SCREEN_PERMISSIONS
): boolean {
  if (!userRole || !screen) return false;

  const allowedRoles = SCREEN_PERMISSIONS[screen];
  if (!allowedRoles) return false;

  // Handle role hierarchy - SUPERVISOR inherits ADMIN permissions
  if (userRole === UserRole.SUPERVISOR) {
    return allowedRoles.includes(UserRole.SUPERVISOR) || allowedRoles.includes(UserRole.ADMIN);
  }

  // ADMIN can access most things except supplier-specific features
  if (userRole === UserRole.ADMIN) {
    return allowedRoles.includes(UserRole.ADMIN);
  }

  return allowedRoles.includes(userRole);
}

/**
 * Check if a user role can perform a specific action on a screen/feature
 */
export function canPerformAction(
  userRole: UserRole | null,
  screen: string,
  action: string
): boolean {
  if (!userRole || !screen || !action) return false;

  // Map action to screen permission
  const screenPermission = `${screen}_${action}` as keyof typeof SCREEN_PERMISSIONS;

  // Check if the combined permission exists
  if (SCREEN_PERMISSIONS[screenPermission]) {
    return hasScreenPermission(userRole, screenPermission);
  }

  // Fallback to basic screen permission for VIEW actions
  if (action === 'VIEW') {
    return hasScreenPermission(userRole, screen as keyof typeof SCREEN_PERMISSIONS);
  }

  return false;
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.SUPERVISOR:
      return 'Supervisor';
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.FITTER:
      return 'Fitter';
    case UserRole.SUPPLIER:
      return 'Factory';
    case UserRole.USER:
      return 'User';
    default:
      return 'Unknown';
  }
}

/**
 * Navigation items configuration with role permissions
 */
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    permission: 'DASHBOARD' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Orders',
    href: '/orders',
    permission: 'ORDERS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Customers',
    href: '/customers',
    permission: 'CUSTOMERS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Fitters',
    href: '/fitters',
    permission: 'FITTERS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Reports',
    href: '/reports',
    permission: 'REPORTS' as keyof typeof SCREEN_PERMISSIONS,
  },
] as const;

/**
 * Saddle modeling navigation items
 */
export const SADDLE_MODELING_ITEMS = [
  {
    name: 'Brands',
    href: '/brands',
    permission: 'BRANDS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Models',
    href: '/models',
    permission: 'MODELS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Leather Types',
    href: '/leathertypes',
    permission: 'LEATHER_TYPES' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Options',
    href: '/options',
    permission: 'OPTIONS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Extras',
    href: '/extras',
    permission: 'EXTRAS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Presets',
    href: '/presets',
    permission: 'PRESETS' as keyof typeof SCREEN_PERMISSIONS,
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    permission: 'SUPPLIERS' as keyof typeof SCREEN_PERMISSIONS,
  },
] as const;