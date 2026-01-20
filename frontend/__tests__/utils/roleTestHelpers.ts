import { UserRole } from '@/types/Role';
import { getMockUserByRole, getMockToken } from './mockUsers';

// Re-export from mockUsers for convenience
export { getMockUserByRole, getMockToken, getAllMockUsers } from './mockUsers';

export interface RoleTestCase {
  role: UserRole;
  roleName: string;
  expectedAccess: {
    screens: string[];
    deniedScreens: string[];
    actions: string[];
    deniedActions: string[];
  };
}

export const roleTestCases: RoleTestCase[] = [
  {
    role: UserRole.USER,
    roleName: 'User',
    expectedAccess: {
      screens: ['dashboard', 'orders', 'brands', 'models', 'leathertypes', 'options', 'extras', 'presets'],
      deniedScreens: ['customers', 'fitters', 'reports', 'suppliers'],
      actions: ['order_create', 'order_view'],
      deniedActions: ['order_edit', 'order_delete', 'order_approve', 'customer_create', 'customer_edit', 'customer_delete']
    }
  },
  {
    role: UserRole.FITTER,
    roleName: 'Fitter',
    expectedAccess: {
      screens: ['dashboard', 'orders', 'customers'],
      deniedScreens: ['fitters', 'reports', 'suppliers', 'brands', 'models', 'leathertypes', 'options', 'extras', 'presets'],
      actions: ['order_create', 'order_view', 'customer_create', 'customer_edit'],
      deniedActions: ['order_edit', 'order_delete', 'order_approve', 'customer_delete']
    }
  },
  {
    role: UserRole.SUPPLIER,
    roleName: 'Supplier',
    expectedAccess: {
      screens: ['dashboard', 'suppliers'],
      deniedScreens: ['orders', 'customers', 'fitters', 'reports', 'brands', 'models', 'leathertypes', 'options', 'extras', 'presets'],
      actions: ['supplier_view'],
      deniedActions: ['order_create', 'order_edit', 'order_delete', 'order_approve', 'customer_create', 'customer_edit', 'customer_delete']
    }
  },
  {
    role: UserRole.ADMIN,
    roleName: 'Admin',
    expectedAccess: {
      screens: ['dashboard', 'orders', 'customers', 'fitters', 'reports', 'brands', 'models', 'leathertypes', 'options', 'extras', 'presets', 'suppliers'],
      deniedScreens: [],
      actions: ['order_create', 'order_view', 'order_edit', 'order_delete', 'order_approve', 'customer_create', 'customer_edit', 'customer_delete'],
      deniedActions: []
    }
  },
  {
    role: UserRole.SUPERVISOR,
    roleName: 'Supervisor',
    expectedAccess: {
      screens: ['dashboard', 'orders', 'customers', 'fitters', 'reports', 'brands', 'models', 'leathertypes', 'options', 'extras', 'presets', 'suppliers'],
      deniedScreens: [],
      actions: ['order_create', 'order_view', 'order_edit', 'order_delete', 'order_approve', 'customer_create', 'customer_edit', 'customer_delete'],
      deniedActions: []
    }
  }
];

export const getTestCaseForRole = (role: UserRole): RoleTestCase => {
  const testCase = roleTestCases.find(tc => tc.role === role);
  if (!testCase) {
    throw new Error(`No test case found for role: ${role}`);
  }
  return testCase;
};

export const getAllRoles = (): UserRole[] => {
  return [UserRole.USER, UserRole.FITTER, UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR];
};

export const getAdminRoles = (): UserRole[] => {
  return [UserRole.ADMIN, UserRole.SUPERVISOR];
};

export const getNonAdminRoles = (): UserRole[] => {
  return [UserRole.USER, UserRole.FITTER, UserRole.SUPPLIER];
};

export const hasScreenAccess = (role: UserRole, screen: string): boolean => {
  const testCase = getTestCaseForRole(role);
  return testCase.expectedAccess.screens.includes(screen);
};

export const hasActionAccess = (role: UserRole, action: string): boolean => {
  const testCase = getTestCaseForRole(role);
  return testCase.expectedAccess.actions.includes(action);
};

export const shouldDenyScreenAccess = (role: UserRole, screen: string): boolean => {
  const testCase = getTestCaseForRole(role);
  return testCase.expectedAccess.deniedScreens.includes(screen);
};

export const shouldDenyActionAccess = (role: UserRole, action: string): boolean => {
  const testCase = getTestCaseForRole(role);
  return testCase.expectedAccess.deniedActions.includes(action);
};

// Helper for testing login scenarios
export const createLoginTestScenario = (role: UserRole) => {
  const mockUser = getMockUserByRole(role);
  const token = getMockToken(role);
  
  return {
    credentials: {
      username: mockUser.username,
      password: mockUser.password
    },
    expectedResponse: {
      user: mockUser.user,
      token,
      success: true
    }
  };
};

// Helper for testing permission matrix
export const createPermissionMatrix = () => {
  const matrix: Record<string, Record<string, boolean>> = {};
  
  const screens = ['dashboard', 'orders', 'customers', 'fitters', 'reports', 'suppliers', 'brands', 'models', 'leathertypes', 'options', 'extras', 'presets'];
  const actions = ['order_create', 'order_view', 'order_edit', 'order_delete', 'order_approve', 'customer_create', 'customer_edit', 'customer_delete'];
  
  getAllRoles().forEach(role => {
    const roleName = role.replace('ROLE_', '').toLowerCase();
    matrix[roleName] = {};
    
    // Screen permissions
    screens.forEach(screen => {
      matrix[roleName][`screen_${screen}`] = hasScreenAccess(role, screen);
    });
    
    // Action permissions
    actions.forEach(action => {
      matrix[roleName][`action_${action}`] = hasActionAccess(role, action);
    });
  });
  
  return matrix;
};

// Mock JWT decode helper
export const mockJWTDecode = (token: string) => {
  const roleMatch = token.match(/mock-jwt-token-(\w+)/);
  if (roleMatch) {
    const roleName = roleMatch[1];
    const role = `ROLE_${roleName.toUpperCase()}` as UserRole;
    const mockUser = getMockUserByRole(role);

    return {
      sub: mockUser.user.id,
      username: mockUser.user.username,
      roles: [role],
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000)
    };
  }

  throw new Error('Invalid token');
};

// Add a basic test to satisfy Jest's requirement
if (typeof test !== 'undefined') {
  test('roleTestHelpers utilities should be available', () => {
    expect(roleTestCases).toBeDefined();
    expect(getAllRoles()).toContain(UserRole.ADMIN);
    expect(getAdminRoles()).toContain(UserRole.ADMIN);
  });
}