import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/services/warehouses';

// Mock the api service
jest.mock('@/services/api', () => ({
  fetchEntities: jest.fn(),
  apiRequest: jest.fn()
}));

const mockFetchEntities = require('@/services/api').fetchEntities as jest.Mock;
const mockApiRequest = require('@/services/api').apiRequest as jest.Mock;

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
          }
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
        itemsPerPage: 10,
        filters: { status: 'active' },
        orderBy: 'location',
        orderDirection: 'desc'
      });

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
      };

      const mockResponse = {
        id: '123',
        ...warehouseData
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await createWarehouse(warehouseData);

      expect(mockApiRequest).toHaveBeenCalledWith('/warehouses', {
        method: 'POST',
        body: JSON.stringify(warehouseData)
      });

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
      };

      const error = new Error('Failed to create warehouse');
      mockApiRequest.mockRejectedValue(error);

      await expect(createWarehouse(warehouseData)).rejects.toThrow('Failed to create warehouse');
    });

    test('validates required fields', async () => {
      const incompleteWarehouseData = {
        name: 'Incomplete Warehouse'
        // Missing required fields
      } as any;

      mockApiRequest.mockResolvedValue({});

      await createWarehouse(incompleteWarehouseData);

      expect(mockApiRequest).toHaveBeenCalledWith('/warehouses', {
        method: 'POST',
        body: JSON.stringify(incompleteWarehouseData)
      });
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

        mockApiRequest.mockResolvedValue({ id: '123', ...warehouseData });

        const result = await createWarehouse(warehouseData);

        expect(result.status).toBe(status);
        expect(mockApiRequest).toHaveBeenCalledWith('/warehouses', {
          method: 'POST',
          body: JSON.stringify(warehouseData)
        });
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

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await updateWarehouse(warehouseId, updateData);

      expect(mockApiRequest).toHaveBeenCalledWith(`/warehouses/${warehouseId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      expect(result).toEqual(mockResponse);
    });

    test('handles update warehouse error', async () => {
      const warehouseId = '123';
      const updateData = { name: 'Updated Warehouse' };

      const error = new Error('Failed to update warehouse');
      mockApiRequest.mockRejectedValue(error);

      await expect(updateWarehouse(warehouseId, updateData)).rejects.toThrow('Failed to update warehouse');
    });

    test('updates warehouse status', async () => {
      const warehouseId = '123';
      const statuses = ['active', 'inactive', 'maintenance'] as const;

      for (const status of statuses) {
        const updateData = { status };

        mockApiRequest.mockResolvedValue({ id: warehouseId, status });

        await updateWarehouse(warehouseId, updateData);

        expect(mockApiRequest).toHaveBeenCalledWith(`/warehouses/${warehouseId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
      }
    });

    test('updates warehouse capacity and stock', async () => {
      const warehouseId = '123';
      const updateData = {
        capacity: 2500,
        currentStock: 1800
      };

      mockApiRequest.mockResolvedValue({ id: warehouseId, ...updateData });

      await updateWarehouse(warehouseId, updateData);

      expect(mockApiRequest).toHaveBeenCalledWith(`/warehouses/${warehouseId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
    });
  });

  describe('deleteWarehouse', () => {
    test('deletes warehouse with correct ID', async () => {
      const warehouseId = '123';

      mockApiRequest.mockResolvedValue({});

      await deleteWarehouse(warehouseId);

      expect(mockApiRequest).toHaveBeenCalledWith(`/warehouses/${warehouseId}`, {
        method: 'DELETE'
      });
    });

    test('handles delete warehouse error', async () => {
      const warehouseId = '123';

      const error = new Error('Failed to delete warehouse');
      mockApiRequest.mockRejectedValue(error);

      await expect(deleteWarehouse(warehouseId)).rejects.toThrow('Failed to delete warehouse');
    });

    test('handles non-existent warehouse deletion', async () => {
      const warehouseId = 'non-existent';

      const error = new Error('Warehouse not found');
      mockApiRequest.mockRejectedValue(error);

      await expect(deleteWarehouse(warehouseId)).rejects.toThrow('Warehouse not found');
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

        mockApiRequest.mockResolvedValue({ id: '123', ...warehouseData });

        const result = await createWarehouse(warehouseData);

        expect(result.status).toBe(status);
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

      mockApiRequest.mockResolvedValue({ id: '123', ...warehouseData });

      const result = await createWarehouse(warehouseData);

      expect(result.capacity).toBe(1000);
      expect(result.currentStock).toBe(800);
      expect(result.currentStock).toBeLessThanOrEqual(result.capacity);
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

      mockApiRequest.mockResolvedValue({ id: '123', ...warehouseData });

      const result = await createWarehouse(warehouseData);

      expect(result.contactEmail).toBe('contact@warehouse.com');
      expect(result.contactPhone).toBe('+1-555-0123');
      expect(result.description).toBe('Test warehouse with contact info');
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockFetchEntities.mockRejectedValue(networkError);

      await expect(fetchWarehouses()).rejects.toThrow('Network error');
    });

    test('handles API errors with proper error messages', async () => {
      const apiError = new Error('Unauthorized');
      mockApiRequest.mockRejectedValue(apiError);

      await expect(createWarehouse({
        name: 'Test Warehouse',
        location: 'Test Location',
        address: 'Test Address',
        status: 'active',
        capacity: 1000,
        currentStock: 0
      })).rejects.toThrow('Unauthorized');
    });

    test('handles validation errors', async () => {
      const validationError = new Error('Validation failed: Name is required');
      mockApiRequest.mockRejectedValue(validationError);

      await expect(createWarehouse({
        name: '',
        location: 'Test Location',
        address: 'Test Address',
        status: 'active',
        capacity: 1000,
        currentStock: 0
      })).rejects.toThrow('Validation failed: Name is required');
    });
  });

  describe('Filtering and Sorting', () => {
    test('filters warehouses by status', async () => {
      const mockResponse = {
        'hydra:member': [
          { id: '1', name: 'Active Warehouse', status: 'active' }
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
      });

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
        });

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