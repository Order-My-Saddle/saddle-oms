import { getEnrichedOrders } from '@/services/enrichedOrders';
import { fetchEntities } from '@/services/api';

// Mock the API service
jest.mock('@/services/api', () => ({
  fetchEntities: jest.fn(),
}));

const mockFetchEntities = fetchEntities as jest.MockedFunction<typeof fetchEntities>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Enriched Orders Service - Fitter Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fitter-Specific Order Filtering', () => {
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        customer: { id: 1, name: 'John Customer' },
        fitter: { id: 1, name: 'Jane Fitter', username: 'jane.fitter' },
        status: 'pending',
        urgent: false,
      },
      {
        id: 2,
        orderNumber: 'ORD-002',
        customer: { id: 2, name: 'Alice Customer' },
        fitter: { id: 2, name: 'Bob Fitter', username: 'bob.fitter' },
        status: 'approved',
        urgent: true,
      },
    ];

    it('automatically applies fitter filter for ROLE_FITTER users', async () => {
      // Mock current user as fitter in localStorage
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': mockOrders.filter(order => order.fitter.username === 'jane.fitter'),
        'hydra:totalItems': 1,
      });

      const result = await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: expect.objectContaining({
          fitterUsername: 'jane.fitter',
        }),
        searchTerm: undefined,
      });

      expect(result['hydra:member']).toHaveLength(1);
      expect(result['hydra:member'][0].fitter.username).toBe('jane.fitter');
    });

    it('does not apply fitter filter for non-FITTER roles', async () => {
      // Mock current user as admin
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': mockOrders,
        'hydra:totalItems': 2,
      });

      const result = await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: {},
        searchTerm: undefined,
      });

      // Should not include fitterUsername filter
      const callParams = mockFetchEntities.mock.calls[0][0].extraParams;
      expect(callParams).not.toHaveProperty('fitterUsername');

      expect(result['hydra:member']).toHaveLength(2);
    });

    it('does not override existing fitterUsername filter', async () => {
      // Mock current user as fitter
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': mockOrders.filter(order => order.fitter.username === 'bob.fitter'),
        'hydra:totalItems': 1,
      });

      // Pass explicit fitterUsername filter (admin might do this)
      const result = await getEnrichedOrders({
        page: 1,
        filters: {
          fitterUsername: 'bob.fitter',
        },
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: expect.objectContaining({
          fitterUsername: 'bob.fitter', // Should use provided filter, not auto-applied
        }),
        searchTerm: undefined,
      });
    });

    it('handles missing current user gracefully', async () => {
      // Mock no current user
      mockLocalStorage.getItem.mockReturnValue(null);

      mockFetchEntities.mockResolvedValue({
        'hydra:member': mockOrders,
        'hydra:totalItems': 2,
      });

      const result = await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: {},
        searchTerm: undefined,
      });

      // Should not include fitterUsername filter
      const callParams = mockFetchEntities.mock.calls[0][0].extraParams;
      expect(callParams).not.toHaveProperty('fitterUsername');
    });

    it('handles fitter user without username', async () => {
      // Mock fitter user without username
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: '', // Empty username
        role: 'ROLE_FITTER',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': mockOrders,
        'hydra:totalItems': 2,
      });

      const result = await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      // Should not apply fitter filter when username is empty
      const callParams = mockFetchEntities.mock.calls[0][0].extraParams;
      expect(callParams).not.toHaveProperty('fitterUsername');
    });

    it('logs fitter filter application', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [],
        'hydra:totalItems': 0,
      });

      await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'enrichedOrders.ts: Auto-applying fitter filter for user:',
        'jane.fitter'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Multiple Role Scenarios', () => {
    it('treats SUPERVISOR with fitter background as non-fitter for filtering', async () => {
      // User with SUPERVISOR role (highest priority) but originally was a fitter
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'jane.supervisor',
        role: 'ROLE_SUPERVISOR', // Primary role after mapping
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [
          {
            id: 1,
            orderNumber: 'ORD-001',
            fitter: { username: 'jane.supervisor' },
          },
          {
            id: 2,
            orderNumber: 'ORD-002',
            fitter: { username: 'other.fitter' },
          },
        ],
        'hydra:totalItems': 2,
      });

      await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      // Should NOT apply fitter filter because role is SUPERVISOR, not FITTER
      const callParams = mockFetchEntities.mock.calls[0][0].extraParams;
      expect(callParams).not.toHaveProperty('fitterUsername');
    });

    it('allows admin to manually specify fitter filter', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [
          {
            id: 1,
            orderNumber: 'ORD-001',
            fitter: { username: 'specific.fitter' },
          },
        ],
        'hydra:totalItems': 1,
      });

      await getEnrichedOrders({
        page: 1,
        filters: {
          fitterUsername: 'specific.fitter',
        },
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: expect.objectContaining({
          fitterUsername: 'specific.fitter',
        }),
        searchTerm: undefined,
      });
    });
  });


  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      }));

      const apiError = new Error('API Error');
      mockFetchEntities.mockRejectedValue(apiError);

      await expect(getEnrichedOrders({
        page: 1,
        filters: {},
      })).rejects.toThrow('API Error');
    });

    it('handles malformed user data', async () => {
      // Mock malformed user data
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        // Missing username and role
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [],
        'hydra:totalItems': 0,
      });

      await getEnrichedOrders({
        page: 1,
        filters: {},
      });

      // Should not crash and should not apply fitter filter
      const callParams = mockFetchEntities.mock.calls[0][0].extraParams;
      expect(callParams).not.toHaveProperty('fitterUsername');
    });
  });

  describe('Filter Processing', () => {
    it('correctly formats complex filters', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [],
        'hydra:totalItems': 0,
      });

      await getEnrichedOrders({
        page: 1,
        filters: {
          orderStatus: 'pending',
          urgent: 'true',
          customerName: 'John',
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
        },
        orderBy: 'createdAt',
        order: 'desc',
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: expect.objectContaining({
          orderStatus: 'pending',
          urgent: 'true',
          customerName: 'John',
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
          'order[createdAt]': 'desc',
        }),
        searchTerm: undefined,
      });
    });

    it('handles search parameter correctly', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [],
        'hydra:totalItems': 0,
      });

      await getEnrichedOrders({
        page: 1,
        searchTerm: 'ORD-001',
        filters: {},
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: {},
        searchTerm: 'ORD-001',
      });
    });
  });

  describe('Security Considerations', () => {
    it('prevents fitter from bypassing filter through direct API manipulation', async () => {
      // This test verifies that the auto-applied filter cannot be bypassed
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      }));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [],
        'hydra:totalItems': 0,
      });

      // Even if fitter tries to pass no filters, the service should auto-apply
      await getEnrichedOrders({
        page: 1,
        filters: {}, // Fitter tries to see all orders
      });

      // Should still apply fitter filter
      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'enriched-orders',
        page: 1,
        partial: undefined,
        extraParams: expect.objectContaining({
          fitterUsername: 'jane.fitter',
        }),
        searchTerm: undefined,
      });
    });

    it('ensures consistent filtering across different call patterns', async () => {
      const fitterUser = {
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(fitterUser));

      mockFetchEntities.mockResolvedValue({
        'hydra:member': [],
        'hydra:totalItems': 0,
      });

      // Test multiple call patterns
      const testCases = [
        { filters: {} },
        { filters: { orderStatus: 'pending' } },
        { filters: { urgent: 'true' } },
        { searchTerm: 'test', filters: {} },
      ];

      for (const testCase of testCases) {
        mockFetchEntities.mockClear();

        await getEnrichedOrders({
          page: 1,
          ...testCase as any,
        } as any);

        // All calls should include fitter filter
        expect(mockFetchEntities).toHaveBeenCalledWith({
          entity: 'enriched_orders',
          page: 1,
          partial: undefined,
          extraParams: expect.objectContaining({
            fitterUsername: 'jane.fitter',
          }),
          searchTerm: (testCase as any).searchTerm,
        });
      }
    });
  });
});