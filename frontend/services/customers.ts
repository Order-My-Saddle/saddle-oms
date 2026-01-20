import { fetchEntities } from './api';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  city?: string;
  country?: string;
  address?: string;
  zipcode?: string;
  state?: string;
  cellNo?: string;
  phoneNo?: string;
  fitter?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomersResponse {
  'hydra:member': Customer[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

export async function fetchCustomers({
  page = 1,
  searchTerm = '',
  filters = {},
  orderBy = 'name',
  order = 'asc'
}: {
  page?: number;
  searchTerm?: string;
  filters?: Record<string, string>;
  orderBy?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<CustomersResponse> {
  console.log('fetchCustomers: Called with params:', { page, searchTerm, filters, orderBy, order });
  
  // Build filter parameters for API Platform
  const extraParams: Record<string, string | number | boolean> = {};
  
  // Handle individual field filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      console.log(`fetchCustomers: Processing filter ${key}:`, value);
      // For text fields, use partial matching with API Platform filters
      if (key === 'name') {
        extraParams['name[contains]'] = value;
      } else if (key === 'email') {
        extraParams['email[contains]'] = value;
      } else if (key === 'city') {
        extraParams['city[contains]'] = value;
      } else if (key === 'country') {
        extraParams['country[contains]'] = value;
      } else if (key === 'id') {
        extraParams['id'] = value;
      } else if (key === 'fitter') {
        extraParams['fitter.name[contains]'] = value;
      }
      // For other exact matches
      else {
        extraParams[key] = value;
      }
    }
  });

  // Add groups parameter to include related entities
  extraParams['groups[]'] = 'Entity';

  console.log('fetchCustomers: Calling fetchEntities with entity "customers" and params:', extraParams);

  return await fetchEntities({
    entity: 'customers',
    page,
    searchTerm,
    orderBy,
    order,
    extraParams
  });
}

// Helper function to get auth token
function getToken() {
  if (typeof window !== 'undefined') {
    // Try to get token from Jotai store first
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored && stored !== 'null') {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Fallback to cookies
    }

    // Fallback to cookies for backward compatibility
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return value;
      }
    }
  }
  return null;
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function createCustomer(customerData: Partial<Customer>): Promise<Customer> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  console.log('Creating customer with data:', customerData);

  const response = await fetch(`${API_URL}/api/v1/customers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Customer creation failed:', response.status, errorText);
    throw new Error(`Failed to create customer: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Customer creation successful:', result);
  return result;
}

export async function updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  console.log('Updating customer with ID:', id, 'Data:', customerData);

  const response = await fetch(`${API_URL}/api/v1/customers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Customer update failed:', response.status, errorText);
    throw new Error(`Failed to update customer: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Customer update successful:', result);
  return result;
}


export async function deleteCustomer(id: string): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  console.log('Deleting customer with ID:', id);

  const response = await fetch(`${API_URL}/api/v1/customers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Customer deletion failed:', response.status, errorText);
    throw new Error(`Failed to delete customer: ${response.status} ${response.statusText}`);
  }

  console.log('Customer deletion successful');
}

/**
 * Get the total count of customers (for pagination display)
 */
export async function fetchCustomerCount(): Promise<number> {
  try {
    console.log('📊 fetchCustomerCount: Getting total customer count');

    // Get total count using minimal data transfer (limit=1) with full pagination metadata
    const result = await fetchEntities({
      entity: 'customers',
      page: 1,
      partial: false, // Required for hydra:totalItems in API Platform 2.5.7
      extraParams: {
        'groups[]': 'Entity',
        'limit': 1, // Minimize data transfer
      },
    });

    // Return the total count if available
    if (result['hydra:totalItems'] !== undefined && result['hydra:totalItems'] !== null) {
      console.log('📊 Got total customer count from API:', result['hydra:totalItems']);
      return result['hydra:totalItems'];
    }

    console.warn('📊 Could not get customer count from API, using fallback');
    return 0;
  } catch (error) {
    console.error('📊 Error fetching customer count:', error);
    return 0;
  }
}