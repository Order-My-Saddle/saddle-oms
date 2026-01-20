import { fetchEntities } from './api';

export interface Brand {
  id: string;
  name: string;
  sequence?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandsResponse {
  'hydra:member': Brand[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

export async function fetchBrands({
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
} = {}): Promise<BrandsResponse> {
  console.log('fetchBrands: Called with params:', { page, searchTerm, filters, orderBy, order });
  
  // Build filter parameters for API Platform
  const extraParams: Record<string, string | number | boolean> = {};
  
  // Handle individual field filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      console.log(`fetchBrands: Processing filter ${key}:`, value);
      // For text fields, use partial matching with API Platform filters
      if (key === 'name') {
        extraParams['name[contains]'] = value;
      } else if (key === 'active') {
        extraParams['active'] = value === 'true';
      } else if (key === 'sequence') {
        extraParams['sequence'] = parseInt(value);
      }
      // For other exact matches
      else {
        extraParams[key] = value;
      }
    }
  });

  console.log('fetchBrands: Calling fetchEntities with entity "brands" and params:', extraParams);

  return await fetchEntities({
    entity: 'brands',
    page,
    partial: false, // Required for hydra:totalItems in API Platform 2.5.7
    searchTerm,
    orderBy,
    order,
    extraParams
  });
}

function getToken() {
  if (typeof window !== 'undefined') {
    // Try to get token from auth_token first (Jotai store)
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored && stored !== 'null') {
        const parsedToken = JSON.parse(stored);
        return parsedToken;
      }
    } catch (e) {
      // Fallback to token key
    }

    // Check localStorage for 'token' key
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'null') {
        return token;
      }
    } catch (e) {
      // Continue to cookies
    }

    // Fallback to cookies
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

export async function createBrand(brandData: Partial<Brand>): Promise<Brand> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  console.log('Creating brand with data:', brandData);

  const response = await fetch(`${API_URL}/api/v1/brands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(brandData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brand creation failed:', errorText);
    throw new Error(`Failed to create brand: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Brand creation result:', result);
  return result;
}

export async function updateBrand(id: string, brandData: Partial<Brand>): Promise<Brand> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  console.log('Updating brand with ID:', id, 'Data:', brandData);

  const response = await fetch(`${API_URL}/api/v1/brands/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(brandData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brand update failed:', errorText);
    throw new Error(`Failed to update brand: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Brand update result:', result);
  return result;
}

export async function deleteBrand(id: string): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  console.log('Deleting brand with ID:', id);

  const response = await fetch(`${API_URL}/api/v1/brands/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brand deletion failed:', errorText);
    throw new Error(`Failed to delete brand: ${response.statusText}`);
  }

  console.log('Brand deletion successful');
}

/**
 * Get the total count of brands (for pagination display)
 */
export async function fetchBrandCount(): Promise<number> {
  try {
    console.log('📊 fetchBrandCount: Getting total brand count');

    // Get total count using minimal data transfer (limit=1) with full pagination metadata
    const result = await fetchEntities({
      entity: 'brands',
      page: 1,
      partial: false, // Required for hydra:totalItems in API Platform 2.5.7
      extraParams: {
        'limit': 1, // Minimize data transfer
      },
    });

    // Return the total count if available
    if (result['hydra:totalItems'] !== undefined && result['hydra:totalItems'] !== null) {
      console.log('📊 Got total brand count from API:', result['hydra:totalItems']);
      return result['hydra:totalItems'];
    }

    console.warn('📊 Could not get brand count from API, using fallback');
    return 0;
  } catch (error) {
    console.error('📊 Error fetching brand count:', error);
    return 0;
  }
}