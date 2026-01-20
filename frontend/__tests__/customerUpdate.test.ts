import { updateCustomer } from '@/services/customers';

// Mock fetch globally
global.fetch = jest.fn();

describe('Customer Update Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully update a customer', async () => {
    const mockCustomer = {
      id: 'test-123',
      name: 'John Doe Updated',
      email: 'john.updated@example.com',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      state: 'NY',
      zipcode: '10001',
      phoneNo: '555-1234',
      cellNo: '555-5678'
    };

    const mockResponse = {
      Entities: [mockCustomer]
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });

    const result = await updateCustomer('test-123', {
      name: 'John Doe Updated',
      email: 'john.updated@example.com'
    });

    expect(result).toEqual(mockCustomer);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/save',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/ld+json',
          'Accept': 'application/ld+json'
        }),
        body: expect.stringContaining('"entityTypeName":"Customer:#App.Entity"')
      })
    );
  });

  it('should handle cache-proxy errors gracefully', async () => {
    const customerData = {
      name: 'Jane Doe',
      email: 'jane@example.com'
    };

    const cacheProxyError = {
      "@context": "/contexts/Error",
      "@type": "hydra:Error",
      "hydra:title": "An error occurred",
      "hydra:description": "cURL error 6: Could not resolve host: cache-proxy (see https://curl.haxx.se/libcurl/c/libcurl-errors.html)"
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: jest.fn().mockResolvedValueOnce(JSON.stringify(cacheProxyError))
    });

    // Mock console.warn to verify it's called
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await updateCustomer('test-456', customerData);

    expect(result).toEqual({
      id: 'test-456',
      ...customerData
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '✅ Customer update succeeded, but cache invalidation failed (this is normal in local development)'
    );

    consoleSpy.mockRestore();
  });

  it('should throw error for non-cache-proxy failures', async () => {
    const actualError = {
      "@context": "/contexts/Error",
      "@type": "hydra:Error",
      "hydra:title": "Validation failed",
      "hydra:description": "Name field is required"
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: jest.fn().mockResolvedValueOnce(JSON.stringify(actualError))
    });

    await expect(
      updateCustomer('test-789', { name: '' })
    ).rejects.toThrow('Failed to update customer: 400 Bad Request');
  });

  it('should handle empty entities response', async () => {
    const customerData = {
      name: 'Bob Smith',
      email: 'bob@example.com'
    };

    const mockResponse = {
      Entities: [] // Empty entities array
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    });

    const result = await updateCustomer('test-empty', customerData);

    expect(result).toEqual({
      id: 'test-empty',
      ...customerData
    });
  });
});

// Manual test function for debugging
export async function testCustomerUpdateManually() {
  console.log('🧪 Testing customer update functionality...');

  try {
    // Test with actual customer ID from your database
    const testCustomerId = '6051b7ef-9a14-4de7-8a7d-e60d13e37791'; // Replace with actual customer ID

    const updateData = {
      name: `Test Customer ${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      address: '123 Test Street',
      city: 'Test City',
      country: 'Test Country',
      state: 'TC',
      zipcode: '12345',
      phoneNo: '555-TEST',
      cellNo: '555-CELL'
    };

    console.log('📤 Sending update request...', updateData);

    const result = await updateCustomer(testCustomerId, updateData);

    console.log('✅ Update successful!', result);
    return result;

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}