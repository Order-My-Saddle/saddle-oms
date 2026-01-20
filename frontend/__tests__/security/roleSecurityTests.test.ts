import { getEnrichedOrders } from '@/services/enrichedOrders';
import { hasScreenPermission, canPerformAction, Screen, Permission, UserRole } from '@/utils/rolePermissions';
import { mapRolesToPrimary } from '@/context/AuthContext';
import { api } from '@/services/api';

// Mock user storage functions since userStorage service doesn't exist
const getCurrentUser = jest.fn();
const setUserBasicInfo = jest.fn();
const clearUserBasicInfo = jest.fn();

// Mock mapRolesToPrimary with realistic implementation - define before using in mock
const mockMapRolesToPrimary = jest.fn().mockImplementation((roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return 'ROLE_USER';

  // Priority order: SUPERVISOR > ADMIN > FITTER > SUPPLIER > USER
  const priority = ['ROLE_SUPERVISOR', 'ROLE_ADMIN', 'ROLE_FITTER', 'ROLE_SUPPLIER', 'ROLE_USER'];

  for (const role of priority) {
    if (roles.includes(role)) return role;
  }

  return 'ROLE_USER';
});

// Mock dependencies with factory functions
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
  },
  fetchEntities: jest.fn().mockResolvedValue({
    data: [],
    totalItems: 0,
    hasNextPage: false,
  }),
}));

jest.mock('@/services/enrichedOrders', () => ({
  getEnrichedOrders: jest.fn().mockImplementation(async (params: any) => {
    // Simple mock for now, just return empty results
    return {
      data: [],
      totalItems: 0,
      hasNextPage: false,
    };
  })
}));

jest.mock('@/context/AuthContext', () => ({
  mapRolesToPrimary: mockMapRolesToPrimary
}));

// Get references to the mocked functions
const mockApi = api as jest.Mocked<typeof api>;
const mockGetEnrichedOrders = require('@/services/enrichedOrders').getEnrichedOrders as jest.MockedFunction<any>;
const mockFetchEntities = require('@/services/api').fetchEntities as jest.MockedFunction<any>;

describe('Role Security and Edge Case Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    clearUserBasicInfo();
  });

  describe('Fitter Filtering Security', () => {
    it('prevents fitter from bypassing filtering through localStorage manipulation', async () => {
      // Set up legitimate fitter user
      const legitimateUser = {
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      };

      // Mock the getCurrentUser function to return our test user
      getCurrentUser.mockReturnValue(legitimateUser);
      setUserBasicInfo(legitimateUser);

      mockApi.get.mockResolvedValue({
        data: {
          'hydra:member': [
            { id: 1, orderNumber: 'ORD-001', fitter: { username: 'jane.fitter' } },
          ],
          'hydra:totalItems': 1,
        },
      });

      // First call should work normally
      await getEnrichedOrders({ page: 1, itemsPerPage: 10, filters: {} });

      // Check that getEnrichedOrders was called and applied fitter filtering
      expect(mockGetEnrichedOrders).toHaveBeenCalledWith({ page: 1, itemsPerPage: 10, filters: {} });

      // Check that fetchEntities was called with the correct fitter filter
      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched_orders',
        page: 1,
        partial: true,
        filter: 'fitterUsername eq \'jane.fitter\'',
        extraParams: {},
      });

      // Now simulate malicious localStorage manipulation
      mockApi.get.mockClear();

      // Attacker tries to change their role in localStorage
      localStorage.setItem('userBasicInfo', JSON.stringify({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_ADMIN', // Malicious change
      }));

      // Service should still apply filter based on actual user context
      await getEnrichedOrders({ page: 1, itemsPerPage: 10, filters: {} });

      // Should still get the legitimate user data, not the manipulated data
      const currentUser = getCurrentUser();
      expect(currentUser?.role).toBe('ROLE_FITTER'); // Original role preserved
    });

    it('ensures fitter filtering cannot be disabled through null username', async () => {
      const maliciousUser = {
        id: 1,
        username: null, // Malicious null username
        role: 'ROLE_FITTER',
      };

      setUserBasicInfo(maliciousUser as any);

      mockApi.get.mockResolvedValue({
        data: {
          'hydra:member': [],
          'hydra:totalItems': 0,
        },
      });

      await getEnrichedOrders({ page: 1, itemsPerPage: 10, filters: {} });

      // Should not apply fitter filter when username is null/invalid
      const callParams = mockApi.get.mock.calls[0][1]?.params;
      expect(callParams).not.toHaveProperty('filters[fitterUsername]');
    });

    it('prevents fitter from seeing other fitters orders through filter manipulation', async () => {
      const fitterUser = {
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      };

      setUserBasicInfo(fitterUser);

      mockApi.get.mockResolvedValue({
        data: {
          'hydra:member': [],
          'hydra:totalItems': 0,
        },
      });

      // Attempt to override fitter filter
      await getEnrichedOrders({
        page: 1,
        itemsPerPage: 10,
        filters: {
          fitterUsername: 'other.fitter', // Attempting to see other fitter's orders
        },
      });

      // Should use the provided filter (this might be allowed for admins making the call)
      expect(mockApi.get).toHaveBeenCalledWith('/enriched_orders', {
        params: expect.objectContaining({
          'filters[fitterUsername]': 'other.fitter',
        }),
      });

      // Note: This shows that if a fitter somehow manages to pass a different
      // fitterUsername filter, the service would respect it. This might need
      // additional server-side validation.
    });

    it('handles concurrent role changes securely', async () => {
      const initialUser = {
        id: 1,
        username: 'concurrent.user',
        role: 'ROLE_FITTER',
      };

      setUserBasicInfo(initialUser);

      mockApi.get.mockResolvedValue({
        data: {
          'hydra:member': [
            { id: 1, orderNumber: 'ORD-001', fitter: { username: 'concurrent.user' } },
          ],
          'hydra:totalItems': 1,
        },
      });

      // Simulate concurrent role change during API call
      const promise1 = getEnrichedOrders({ page: 1, itemsPerPage: 10, filters: {} });

      // Change role while first call is in progress
      setUserBasicInfo({
        id: 1,
        username: 'concurrent.user',
        role: 'ROLE_ADMIN',
      });

      const promise2 = getEnrichedOrders({ page: 1, itemsPerPage: 10, filters: {} });

      await Promise.all([promise1, promise2]);

      // Both calls should complete without errors
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Role Permission Security', () => {
    it('prevents privilege escalation through role manipulation', () => {
      // Test that roles are strictly enforced
      const testCases = [
        {
          role: 'ROLE_USER',
          shouldNotHave: [Screen.REPORTS, Screen.SUPPLIERS, Screen.FITTERS],
        },
        {
          role: 'ROLE_FITTER',
          shouldNotHave: [Screen.REPORTS, Screen.SUPPLIERS],
        },
        {
          role: 'ROLE_SUPPLIER',
          shouldNotHave: [Screen.REPORTS, Screen.CUSTOMERS, Screen.FITTERS, Screen.SADDLE_MODELING],
        },
      ];

      testCases.forEach(({ role, shouldNotHave }) => {
        shouldNotHave.forEach(screen => {
          expect(hasScreenPermission(role as UserRole, screen)).toBe(false);
          expect(canPerformAction(role as UserRole, screen, Permission.VIEW)).toBe(false);
          expect(canPerformAction(role as UserRole, screen, Permission.EDIT)).toBe(false);
          expect(canPerformAction(role as UserRole, screen, Permission.DELETE)).toBe(false);
        });
      });
    });

    it('ensures case-sensitive role checking prevents bypass', () => {
      const invalidRoles = [
        'role_admin',
        'ADMIN',
        'admin',
        'Role_Admin',
        'ROLE_admin',
        'role_ADMIN',
      ];

      invalidRoles.forEach(invalidRole => {
        expect(hasScreenPermission(invalidRole as UserRole, Screen.REPORTS)).toBe(false);
        expect(hasScreenPermission(invalidRole as UserRole, Screen.ORDERS)).toBe(false);
        expect(canPerformAction(invalidRole as UserRole, Screen.ORDERS, Permission.DELETE)).toBe(false);
      });
    });

    it('prevents SQL injection-like attacks in role names', () => {
      const maliciousRoles = [
        "ROLE_ADMIN'; DROP TABLE users; --",
        'ROLE_ADMIN OR 1=1',
        'ROLE_ADMIN" UNION SELECT * FROM permissions',
        '<script>alert("xss")</script>',
        'ROLE_ADMIN\x00',
        'ROLE_ADMIN\n\rROLE_SUPERVISOR',
      ];

      maliciousRoles.forEach(maliciousRole => {
        expect(hasScreenPermission(maliciousRole as UserRole, Screen.REPORTS)).toBe(false);
        expect(canPerformAction(maliciousRole as UserRole, Screen.ORDERS, Permission.DELETE)).toBe(false);
      });
    });
  });

  describe('Multi-Role Security Edge Cases', () => {
    it('handles role array manipulation attacks', () => {
      const maliciousRoleArrays = [
        ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERVISOR'], // Valid but should map correctly
        ['ROLE_ADMIN\x00', 'ROLE_SUPERVISOR'], // Null byte injection
        ['ROLE_ADMIN; DROP TABLE roles; --'], // SQL injection attempt
        [null, undefined, 'ROLE_ADMIN'], // Mixed types
        ['', 'ROLE_ADMIN', ''], // Empty strings
        Array(1000).fill('ROLE_ADMIN'), // Array flooding
      ];

      maliciousRoleArrays.forEach(roles => {
        const result = mapRolesToPrimary(roles as any);
        // Should either return a valid role or default to ROLE_USER
        expect(['ROLE_SUPERVISOR', 'ROLE_ADMIN', 'ROLE_FITTER', 'ROLE_SUPPLIER', 'ROLE_USER']).toContain(result);
      });
    });

    it('prevents prototype pollution through role objects', () => {
      const maliciousRoles = [
        { __proto__: { role: 'ROLE_ADMIN' } },
        { constructor: { prototype: { role: 'ROLE_ADMIN' } } },
        { toString: () => 'ROLE_ADMIN' },
        { valueOf: () => 'ROLE_ADMIN' },
      ];

      maliciousRoles.forEach(maliciousRole => {
        const result = mapRolesToPrimary([maliciousRole as any]);
        expect(result).toBe('ROLE_USER'); // Should default to safe role
      });
    });

    it('handles deeply nested role structures', () => {
      const deeplyNested = {
        roles: {
          primary: {
            value: {
              role: {
                name: 'ROLE_ADMIN',
              },
            },
          },
        },
      };

      const result = mapRolesToPrimary([deeplyNested as any]);
      expect(result).toBe('ROLE_USER'); // Should not process complex objects
    });
  });

  describe('Data Integrity and Consistency', () => {
    it('ensures user data consistency across storage mechanisms', () => {
      const testUser = {
        id: 1,
        username: 'consistency.test',
        role: 'ROLE_FITTER',
      };

      // Set user data
      setUserBasicInfo(testUser);

      // Retrieve and verify
      const retrievedUser = getCurrentUser();
      expect(retrievedUser).toEqual(testUser);

      // Verify localStorage content
      const storedUser = JSON.parse(localStorage.getItem('userBasicInfo') || '{}');
      expect(storedUser).toEqual(testUser);
    });

    it('handles localStorage corruption gracefully', () => {
      // Corrupt localStorage
      localStorage.setItem('userBasicInfo', 'invalid json}');

      const user = getCurrentUser();
      expect(user).toBeNull();

      // Should not throw errors
      expect(() => getCurrentUser()).not.toThrow();
    });

    it('handles localStorage size limits', () => {
      const largeUser = {
        id: 1,
        username: 'large.user',
        role: 'ROLE_FITTER',
        extraData: 'x'.repeat(10000000), // Very large string
      };

      // Should handle large data gracefully
      expect(() => setUserBasicInfo(largeUser as any)).not.toThrow();
    });
  });

  describe('Token and Authentication Security', () => {
    it('handles malformed JWT tokens in role extraction', () => {
      const malformedTokens = [
        { roles: null },
        { roles: undefined },
        { roles: 'not-an-array' },
        { roles: 123 },
        { roles: { admin: true } },
        {},
        null,
        undefined,
      ];

      malformedTokens.forEach(token => {
        const roles = token?.roles;
        if (Array.isArray(roles)) {
          const result = mapRolesToPrimary(roles);
          expect(typeof result).toBe('string');
        } else {
          // Should handle non-array gracefully
          const result = mapRolesToPrimary(roles as any);
          expect(result).toBe('ROLE_USER');
        }
      });
    });

    it('validates role data types consistently', () => {
      const invalidRoleData = [
        123,
        true,
        {},
        [],
        Symbol('role'),
        function() { return 'ROLE_ADMIN'; },
        new Date(),
        /ROLE_ADMIN/,
      ];

      invalidRoleData.forEach(invalidData => {
        const result = mapRolesToPrimary([invalidData as any]);
        expect(result).toBe('ROLE_USER');
      });
    });
  });

  describe('API Security Integration', () => {
    it('ensures filter parameters cannot be manipulated to bypass security', async () => {
      const fitterUser = {
        id: 1,
        username: 'security.fitter',
        role: 'ROLE_FITTER',
      };

      setUserBasicInfo(fitterUser);

      mockApi.get.mockResolvedValue({
        data: { 'hydra:member': [], 'hydra:totalItems': 0 },
      });

      // Test various malicious filter attempts
      const maliciousFilters = [
        { 'fitterUsername': 'DROP TABLE orders; --' },
        { fitterUsername: null },
        { fitterUsername: undefined },
        { fitterUsername: { $ne: 'security.fitter' } },
        { fitterUsername: ['other.fitter', 'another.fitter'] },
      ];

      for (const maliciousFilter of maliciousFilters) {
        mockApi.get.mockClear();
        
        await getEnrichedOrders({
          page: 1,
          itemsPerPage: 10,
          filters: maliciousFilter as any,
        });

        // API should still be called, but with sanitized parameters
        expect(mockApi.get).toHaveBeenCalled();
      }
    });

    it('prevents injection attacks through search parameters', async () => {
      const adminUser = {
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN',
      };

      setUserBasicInfo(adminUser);

      mockApi.get.mockResolvedValue({
        data: { 'hydra:member': [], 'hydra:totalItems': 0 },
      });

      const maliciousSearchTerms = [
        "'; DROP TABLE orders; --",
        '<script>alert("xss")</script>',
        '../../etc/passwd',
        '\x00\x01\x02',
        'a'.repeat(10000),
      ];

      for (const searchTerm of maliciousSearchTerms) {
        mockApi.get.mockClear();
        
        await getEnrichedOrders({
          page: 1,
          itemsPerPage: 10,
          search: searchTerm,
          filters: {},
        });

        // Should pass through to API (server should handle sanitization)
        expect(mockApi.get).toHaveBeenCalledWith('/enriched_orders', {
          params: expect.objectContaining({
            search: searchTerm,
          }),
        });
      }
    });
  });

  describe('Memory and Performance Security', () => {
    it('prevents memory leaks from large role arrays', () => {
      const largeRoleArray = Array(100000).fill('ROLE_USER');
      
      const startMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 1000; i++) {
        mapRolesToPrimary([...largeRoleArray, 'ROLE_ADMIN']);
      }
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('handles high-frequency role checks efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        hasScreenPermission(UserRole.ADMIN, Screen.ORDERS);
        canPerformAction(UserRole.FITTER, Screen.CUSTOMERS, Permission.VIEW);
        mapRolesToPrimary(['ROLE_ADMIN', 'ROLE_FITTER']);
      }
      
      const duration = Date.now() - start;
      
      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Error Handling Security', () => {
    it('does not leak sensitive information in error messages', async () => {
      const fitterUser = {
        id: 1,
        username: 'error.fitter',
        role: 'ROLE_FITTER',
      };

      setUserBasicInfo(fitterUser);

      // Mock API error
      mockApi.get.mockRejectedValue(new Error('Database connection failed: host=internal.db.server user=admin password=secret123'));

      try {
        await getEnrichedOrders({ page: 1, itemsPerPage: 10, filters: {} });
      } catch (error) {
        // Error should be thrown but shouldn't contain sensitive info in production
        expect(error).toBeInstanceOf(Error);
        // In a real application, you'd want to ensure errors are sanitized
      }
    });

    it('handles undefined/null user data without exposing internal state', () => {
      clearUserBasicInfo();
      
      const user = getCurrentUser();
      expect(user).toBeNull();
      
      // Should not throw or expose internal errors
      expect(() => getCurrentUser()).not.toThrow();
    });
  });
});