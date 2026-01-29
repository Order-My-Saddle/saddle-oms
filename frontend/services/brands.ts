export interface Brand {
  id: string;
  name: string;
  isActive?: boolean;
  displayName?: string;
}

export interface BrandsResponse {
  'hydra:member': Brand[];
  'hydra:totalItems': number;
}

// Internal response type from NestJS backend
interface NestJSBrandsResponse {
  data: Array<{
    id: number;
    name: string;
    isActive: boolean;
    displayName: string;
  }>;
  total: number;
  pages: number;
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

/**
 * Fetch brands from the NestJS backend
 */
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  // Build query parameters
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', '100'); // Get all brands for dropdown

  // Handle search term
  if (searchTerm) {
    params.set('search', searchTerm);
  }

  console.log('fetchBrands: Calling brands endpoint with params:', params.toString());

  const response = await fetch(`${API_URL}/api/v1/brands?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('fetchBrands: Failed to fetch brands:', errorText);
    throw new Error(`Failed to fetch brands: ${response.status} ${response.statusText}`);
  }

  const brandData: NestJSBrandsResponse = await response.json();
  console.log('fetchBrands: Received brand data:', brandData);

  // Transform to Hydra format expected by frontend
  const brands: Brand[] = brandData.data.map(brand => ({
    id: String(brand.id),
    name: brand.name,
    isActive: brand.isActive,
    displayName: brand.displayName,
  }));

  // Return in Hydra format expected by frontend components
  return {
    'hydra:member': brands,
    'hydra:totalItems': brandData.total,
  };
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
  return {
    id: String(result.id),
    name: result.name,
    isActive: result.isActive,
    displayName: result.displayName,
  };
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
  return {
    id: String(result.id),
    name: result.name,
    isActive: result.isActive,
    displayName: result.displayName,
  };
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

    const result = await fetchBrands({ page: 1 });

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
