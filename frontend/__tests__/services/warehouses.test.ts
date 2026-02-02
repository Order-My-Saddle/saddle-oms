import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/services/warehouses';

// Mock the api service
jest.mock('@/services/api', () => ({
  fetchEntities: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockFetchEntities = require('@/services/api').fetchEntities as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

describe('Warehouses Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWarehouses', () => {
    test('fetches warehouses with correct parameters', async () => {
      const mockResponse = {
        'hydra:member': [
          {
            id: '1',
            name: 'Main Warehouse',
            username: 'main-warehouse',
            location: 'New York',
            status: 'active',
          } as any
        ],
        'hydra:totalItems': 1
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      const result = await fetchWarehouses();

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 1,
        orderBy: 'username',
        partial: false,
        extraParams: {},
      });

      expect(result).toEqual(mockResponse);
    });

    test('fetches warehouses with custom parameters', async () => {
      const mockResponse = {
        'hydra:member': [],
        'hydra:totalItems': 0
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      await fetchWarehouses({
        page: 2,
        filters: { status: 'active' },
        orderBy: 'name',
        partial: true,
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 2,
        orderBy: 'name',
        partial: true,
        extraParams: { status: 'active' },
      });
    });

    test('handles fetch warehouses error', async () => {
      const error = new Error('Failed to fetch warehouses');
      mockFetchEntities.mockRejectedValue(error);

      await expect(fetchWarehouses()).rejects.toThrow('Failed to fetch warehouses');
    });
  });

  describe('createWarehouse', () => {
    test('creates warehouse with correct data', async () => {
      const warehouseData = {
        username: 'new-warehouse',
        name: 'New Warehouse',
        location: 'California',
        status: 'active' as const,
      } as any;

      const mockResponse = {
        id: '123',
        ...warehouseData
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await createWarehouse(warehouseData as any);

      expect(result).toEqual(mockResponse);
    });

    test('handles create warehouse error', async () => {
      const warehouseData = {
        username: 'new-warehouse',
        name: 'New Warehouse',
      } as any;

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Failed to create warehouse',
        json: async () => ({}),
      } as any);

      await expect(createWarehouse(warehouseData as any)).rejects.toThrow();
    });
  });

  describe('updateWarehouse', () => {
    test('updates warehouse with correct data', async () => {
      const warehouseId = '123';
      const updateData = {
        name: 'Updated Warehouse',
        location: 'Updated Location',
      };

      const mockResponse = {
        id: warehouseId,
        username: 'test-warehouse',
        ...updateData
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await updateWarehouse(warehouseId, updateData as any);

      expect(result).toEqual(mockResponse);
    });

    test('handles update warehouse error', async () => {
      const warehouseId = '123';
      const updateData = { name: 'Updated Warehouse' };

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Failed to update warehouse',
        json: async () => ({}),
      } as any);

      await expect(updateWarehouse(warehouseId, updateData as any)).rejects.toThrow();
    });
  });

  describe('deleteWarehouse', () => {
    test('deletes warehouse with correct ID', async () => {
      const warehouseId = '123';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as any);

      await deleteWarehouse(warehouseId);
    });

    test('handles delete warehouse error', async () => {
      const warehouseId = '123';

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Failed to delete warehouse',
        json: async () => ({}),
      } as any);

      await expect(deleteWarehouse(warehouseId)).rejects.toThrow();
    });

    test('handles non-existent warehouse deletion', async () => {
      const warehouseId = 'non-existent';

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Warehouse not found',
        json: async () => ({ message: 'Warehouse not found' }),
      } as any);

      await expect(deleteWarehouse(warehouseId)).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    test('handles different warehouse statuses correctly', async () => {
      const statuses = ['active', 'inactive', 'maintenance'] as const;

      for (const status of statuses) {
        const warehouseData = {
          username: `${status}-warehouse`,
          name: `${status} Warehouse`,
          location: 'Test Location',
          status,
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: '123', ...warehouseData }),
        } as any);

        const result = await createWarehouse(warehouseData as any);

        expect((result as any).status).toBe(status);
      }
    });
  });

  describe('Filtering and Sorting', () => {
    test('filters warehouses by status', async () => {
      const mockResponse = {
        'hydra:member': [
          { id: '1', name: 'Active Warehouse', status: 'active' } as any
        ],
        'hydra:totalItems': 1
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      await fetchWarehouses({
        filters: { status: 'active' }
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 1,
        orderBy: 'username',
        partial: false,
        extraParams: { status: 'active' },
      });
    });

    test('filters warehouses by location', async () => {
      const mockResponse = {
        'hydra:member': [],
        'hydra:totalItems': 0
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      await fetchWarehouses({
        filters: { location: 'California' }
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 1,
        orderBy: 'username',
        partial: false,
        extraParams: { location: 'California' },
      });
    });

    test('sorts warehouses by different fields', async () => {
      const sortFields = ['name', 'username', 'location'];

      for (const field of sortFields) {
        mockFetchEntities.mockResolvedValue({ 'hydra:member': [], 'hydra:totalItems': 0 });

        await fetchWarehouses({
          orderBy: field,
        });

        expect(mockFetchEntities).toHaveBeenCalledWith({
          entity: 'warehouses',
          page: 1,
          orderBy: field,
          partial: false,
          extraParams: {},
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockFetchEntities.mockRejectedValue(networkError);

      await expect(fetchWarehouses()).rejects.toThrow('Network error');
    });

    test('handles API errors with proper error messages', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Unauthorized' }),
      } as any);

      await expect(createWarehouse({
        username: 'test',
        name: 'Test Warehouse',
      } as any)).rejects.toThrow();
    });
  });
});
