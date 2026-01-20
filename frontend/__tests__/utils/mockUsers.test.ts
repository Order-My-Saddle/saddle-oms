import { getMockUserByRole, getAllMockUsers, getMockToken } from './mockUsers';
import { UserRole } from '@/types/Role';

describe('Mock Users Utility', () => {
  test('getMockUserByRole returns correct user for each role', () => {
    const adminUser = getMockUserByRole(UserRole.ADMIN);
    expect(adminUser.role).toBe(UserRole.ADMIN);
    expect(adminUser.user.username).toBe('laurengilbert');
    
    const userUser = getMockUserByRole(UserRole.USER);
    expect(userUser.role).toBe(UserRole.USER);
    expect(userUser.user.username).toBe('testuser');
  });

  test('getAllMockUsers returns all users', () => {
    const allUsers = getAllMockUsers();
    expect(allUsers).toHaveLength(5);
    
    const roles = allUsers.map(u => u.role);
    expect(roles).toContain(UserRole.ADMIN);
    expect(roles).toContain(UserRole.USER);
    expect(roles).toContain(UserRole.FITTER);
    expect(roles).toContain(UserRole.SUPPLIER);
    expect(roles).toContain(UserRole.SUPERVISOR);
  });

  test('getMockToken returns correct token format', () => {
    const token = getMockToken(UserRole.ADMIN);
    expect(token).toBe('mock-jwt-token-admin');
    
    const userToken = getMockToken(UserRole.USER);
    expect(userToken).toBe('mock-jwt-token-user');
  });
});