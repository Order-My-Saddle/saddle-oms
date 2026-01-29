export interface Factory {
  id: number;
  displayName: string;
  city?: string;
  country?: string;
}

export interface FactoriesResponse {
  'hydra:member': Factory[];
  'hydra:totalItems': number;
}

// Internal response type from NestJS backend
interface NestJSFactoriesResponse {
  data: Array<{
    id: number;
    displayName: string;
    city?: string;
    country?: string;
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
 * Fetch all factories for dropdown/lookup
 */
export async function fetchFactories(): Promise<FactoriesResponse> {
  console.log('fetchFactories: Fetching factories');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  // Get all factories for dropdown
  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('limit', '100');

  const response = await fetch(`${API_URL}/api/v1/factories?${params.toString()}`, {
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
    console.error('fetchFactories: Failed to fetch factories:', errorText);
    throw new Error(`Failed to fetch factories: ${response.status} ${response.statusText}`);
  }

  const factoryData: NestJSFactoriesResponse = await response.json();
  console.log('fetchFactories: Received factory data:', factoryData);

  // Transform to Hydra format expected by frontend
  const factories: Factory[] = factoryData.data.map(factory => ({
    id: factory.id,
    displayName: factory.displayName,
    city: factory.city,
    country: factory.country,
  }));

  return {
    'hydra:member': factories,
    'hydra:totalItems': factoryData.total,
  };
}

/**
 * Create a lookup map of factory ID to factory name
 */
export function createFactoryLookup(factories: Factory[]): Map<number, string> {
  const lookup = new Map<number, string>();
  factories.forEach(factory => {
    lookup.set(factory.id, factory.displayName);
  });
  return lookup;
}
