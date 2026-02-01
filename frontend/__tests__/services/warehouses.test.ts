import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, CreateWarehouseData, UpdateWarehouseData } from '@/services/warehouses';

// Mock the api service
jest.mock('@/services/api', () => ({
  fetchEntities: jest.fn(),
  apiRequest: jest.fn()
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
            location: 'New York',
            address: '123 Main St',
            status: 'active',
            capacity: 1000,
            currentStock: 750
          } as any
        ],
        'hydra:totalItems': 1
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      const result = await fetchWarehouses();

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 1,
        itemsPerPage: 25,
        filters: {},
        orderBy: 'name',
        orderDirection: 'asc'
      } as any);

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
        itemsPerPage: 10,
        filters: { status: 'active' },
        orderBy: 'location',
        orderDirection: 'desc'
      } as any);

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 2,
        itemsPerPage: 10,
        filters: { status: 'active' },
        orderBy: 'location',
        orderDirection: 'desc'
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
        name: 'New Warehouse',
        location: 'California',
        address: '456 Storage Ave',
        status: 'active' as const,
        capacity: 2000,
        currentStock: 0,
        contactEmail: 'warehouse@example.com',
        contactPhone: '+1-555-0123'
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
        name: 'New Warehouse',
        location: 'California',
        address: '456 Storage Ave',
        status: 'active' as const,
        capacity: 2000,
        currentStock: 0
      } as any;

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Failed to create warehouse',
        json: async () => ({}),
      } as any);

      await expect(createWarehouse(warehouseData as any)).rejects.toThrow();
    });

    test('validates required fields', async () => {
      const incompleteWarehouseData = {
        name: 'Incomplete Warehouse'
        // Missing required fields
      } as any;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as any);

      await createWarehouse(incompleteWarehouseData);
    });

    test('creates warehouse with different statuses', async () => {
      const statuses = ['active', 'inactive', 'maintenance'] as const;

      for (const status of statuses) {
        const warehouseData = {
          name: `${status} Warehouse`,
          location: 'Test Location',
          address: 'Test Address',
          status,
          capacity: 1000,
          currentStock: 500
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: '123', ...warehouseData }),
        } as any);

        const result = await createWarehouse(warehouseData as any);

        expect(result.status).toBe(status);
      }
    });
  });

  describe('updateWarehouse', () => {
    test('updates warehouse with correct data', async () => {
      const warehouseId = '123';
      const updateData = {
        name: 'Updated Warehouse',
        location: 'Updated Location',
        capacity: 1500,
        status: 'maintenance' as const
      };

      const mockResponse = {
        id: warehouseId,
        address: 'Original Address',
        currentStock: 750,
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

    test('updates warehouse status', async () => {
      const warehouseId = '123';
      const statuses = ['active', 'inactive', 'maintenance'] as const;

      for (const status of statuses) {
        const updateData = { status };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: warehouseId, status }),
        } as any);

        await updateWarehouse(warehouseId, updateData as any);
      }
    });

    test('updates warehouse capacity and stock', async () => {
      const warehouseId = '123';
      const updateData = {
        capacity: 2500,
        currentStock: 1800
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: warehouseId, ...updateData }),
      } as any);

      await updateWarehouse(warehouseId, updateData as any);
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
          name: `${status} Warehouse`,
          location: 'Test Location',
          address: 'Test Address',
          status,
          capacity: 1000,
          currentStock: 500
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: '123', ...warehouseData }),
        } as any);

        const result = await createWarehouse(warehouseData as any);

        expect((result as any).status).toBe(status);
      }
    });

    test('handles capacity and stock validation', async () => {
      const warehouseData = {
        name: 'Test Warehouse',
        location: 'Test Location',
        address: 'Test Address',
        status: 'active' as const,
        capacity: 1000,
        currentStock: 800
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '123', ...warehouseData }),
      } as any);

      const result = await createWarehouse(warehouseData as any);

      expect((result as any).capacity).toBe(1000);
      expect((result as any).currentStock).toBe(800);
      expect((result as any).currentStock).toBeLessThanOrEqual((result as any).capacity);
    });

    test('handles optional contact information', async () => {
      const warehouseData = {
        name: 'Contact Warehouse',
        location: 'Test Location',
        address: 'Test Address',
        status: 'active' as const,
        capacity: 1000,
        currentStock: 500,
        contactEmail: 'contact@warehouse.com',
        contactPhone: '+1-555-0123',
        description: 'Test warehouse with contact info'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: '123', ...warehouseData }),
      } as any);

      const result = await createWarehouse(warehouseData as any);

      expect((result as any).contactEmail).toBe('contact@warehouse.com');
      expect((result as any).contactPhone).toBe('+1-555-0123');
      expect((result as any).description).toBe('Test warehouse with contact info');
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

    test('handles validation errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Validation failed: Name is required' }),
      } as any);

      await expect(createWarehouse({
        username: 'test',
        name: '',
      } as any)).rejects.toThrow();
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
      } as any);

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 1,
        itemsPerPage: 25,
        filters: { status: 'active' },
        orderBy: 'name',
        orderDirection: 'asc'
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
      } as any);

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'warehouses',
        page: 1,
        itemsPerPage: 25,
        filters: { location: 'California' },
        orderBy: 'name',
        orderDirection: 'asc'
      });
    });

    test('sorts warehouses by different fields', async () => {
      const sortFields = ['name', 'location', 'capacity', 'status'];

      for (const field of sortFields) {
        mockFetchEntities.mockResolvedValue({ 'hydra:member': [], 'hydra:totalItems': 0 });

        await fetchWarehouses({
          orderBy: field,
          orderDirection: 'desc'
        } as any);

        expect(mockFetchEntities).toHaveBeenCalledWith({
          entity: 'warehouses',
          page: 1,
          itemsPerPage: 25,
          filters: {},
          orderBy: field,
          orderDirection: 'desc'
        });
      }
    });
  });
});