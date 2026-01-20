import { User, UserRole } from '@/types/Role';

export interface MockUserCredentials {
  username: string;
  password: string;
  role: UserRole;
  user: User;
}

export const mockUsers: Record<string, MockUserCredentials> = {
  admin: {
    username: 'laurengilbert',
    password: 'welcomeLauren!@',
    role: UserRole.ADMIN,
    user: {
      id: '1',
      username: 'laurengilbert',
      email: 'lauren@ordermysaddle.com',
      firstName: 'Lauren',
      lastName: 'Gilbert',
      role: UserRole.ADMIN
    }
  },
  supervisor: {
    username: 'testsupervisor',
    password: 'testpass123',
    role: UserRole.SUPERVISOR,
    user: {
      id: '2',
      username: 'testsupervisor',
      email: 'supervisor@ordermysaddle.com',
      firstName: 'Test',
      lastName: 'Supervisor',
      role: UserRole.SUPERVISOR
    }
  },
  user: {
    username: 'testuser',
    password: 'testpass123',
    role: UserRole.USER,
    user: {
      id: '3',
      username: 'testuser',
      email: 'user@ordermysaddle.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER
    }
  },
  fitter: {
    username: 'testfitter',
    password: 'testpass123',
    role: UserRole.FITTER,
    user: {
      id: '4',
      username: 'testfitter',
      email: 'fitter@ordermysaddle.com',
      firstName: 'Test',
      lastName: 'Fitter',
      role: UserRole.FITTER
    }
  },
  supplier: {
    username: 'testsupplier',
    password: 'testpass123',
    role: UserRole.SUPPLIER,
    user: {
      id: '5',
      username: 'testsupplier',
      email: 'supplier@ordermysaddle.com',
      firstName: 'Test',
      lastName: 'Supplier',
      role: UserRole.SUPPLIER
    }
  }
};

export const getMockUserByRole = (role: UserRole | string): MockUserCredentials => {
  // Handle string role names used in tests
  let targetRole: UserRole;

  if (typeof role === 'string') {
    const normalizedRole = role.toLowerCase().replace('role_', '');
    switch (normalizedRole) {
      case 'admin':
        targetRole = UserRole.ADMIN;
        break;
      case 'manager':
      case 'supervisor':
        targetRole = UserRole.SUPERVISOR;
        break;
      case 'user':
        targetRole = UserRole.USER;
        break;
      case 'fitter':
        targetRole = UserRole.FITTER;
        break;
      case 'supplier':
        targetRole = UserRole.SUPPLIER;
        break;
      default:
        throw new Error(`Unknown role string: ${role}`);
    }
  } else {
    targetRole = role;
  }

  const userEntry = Object.values(mockUsers).find(u => u.role === targetRole);
  if (!userEntry) {
    throw new Error(`No mock user found for role: ${role} (mapped to ${targetRole})`);
  }
  return userEntry;
};

export const getAllMockUsers = (): MockUserCredentials[] => {
  return Object.values(mockUsers);
};

export const getMockToken = (role: UserRole): string => {
  return `mock-jwt-token-${role.toLowerCase().replace('role_', '')}`;
};

// Add a basic test to satisfy Jest's requirement
if (typeof test !== 'undefined') {
  test('mockUsers utilities should be available', () => {
    expect(mockUsers).toBeDefined();
    expect(getMockUserByRole(UserRole.ADMIN)).toBeDefined();
    expect(getAllMockUsers()).toHaveLength(5);
    expect(getMockToken(UserRole.USER)).toContain('mock-jwt-token');
  });
}