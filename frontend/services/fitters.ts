import { fetchEntities } from './api';
import { logger } from '@/utils/logger';

export interface Fitter {
  id: number;
  name: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  zipcode?: string;
  phoneNo?: string;
  cellNo?: string;
  enabled?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FittersResponse {
  'hydra:member': Fitter[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:next'?: string;
    'hydra:previous'?: string;
  };
}

export async function fetchFitters({
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
} = {}): Promise<FittersResponse> {
  logger.log('fetchFitters: Called with params:', { page, searchTerm, filters, orderBy, order });
  
  // Build filter parameters for API Platform
  const extraParams: Record<string, string | number | boolean> = {};
  
  // Handle individual field filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      logger.log(`fetchFitters: Processing filter ${key}:`, value);
      // For text fields, use partial matching with API Platform filters
      if (key === 'name') {
        extraParams['name[contains]'] = value;
      } else if (key === 'username') {
        extraParams['username[contains]'] = value;
      } else if (key === 'city') {
        extraParams['city[contains]'] = value;
      } else if (key === 'country') {
        extraParams['country[contains]'] = value;
      } 
      // For status/enabled field
      else if (key === 'status') {
        extraParams['enabled'] = value === 'ACTIVE';
      }
      // For other exact matches
      else {
        extraParams[key] = value;
      }
    }
  });

  logger.log('fetchFitters: Calling fetchEntities with entity "fitters" and params:', extraParams);

  return await fetchEntities({
    entity: 'fitters',
    page,
    partial: false, // Required for hydra:totalItems in API Platform 2.5.7
    searchTerm,
    orderBy,
    order,
    extraParams
  });
}

// Helper function to get auth token
function getToken() {
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage first
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

export async function createFitter(fitterData: Partial<Fitter>): Promise<Fitter> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  logger.log('Creating fitter with data:', fitterData);

  const response = await fetch(`${API_URL}/api/v1/fitters`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(fitterData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Fitter creation failed:', response.status, errorText);
    throw new Error(`Failed to create fitter: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  logger.log('Fitter creation successful:', result);
  return result;
}

export async function updateFitter(id: number, fitterData: Partial<Fitter>): Promise<Fitter> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  logger.log('Updating fitter with ID:', id, 'Data:', fitterData);

  const response = await fetch(`${API_URL}/api/v1/fitters/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(fitterData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Fitter update failed:', response.status, errorText);
    throw new Error(`Failed to update fitter: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  logger.log('Fitter update successful:', result);
  return result;
}

export async function deleteFitter(id: number): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  logger.log('Deleting fitter with ID:', id);

  const response = await fetch(`${API_URL}/api/v1/fitters/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Fitter deletion failed:', response.status, errorText);
    throw new Error(`Failed to delete fitter: ${response.status} ${response.statusText}`);
  }

  logger.log('Fitter deletion successful');
}

/**
 * Get the total count of fitters (for pagination display)
 */
export async function fetchFitterCount(): Promise<number> {
  try {
    logger.log('📊 fetchFitterCount: Getting total fitter count');

    // Get total count using minimal data transfer (limit=1) with full pagination metadata
    const result = await fetchEntities({
      entity: 'fitters',
      page: 1,
      partial: false, // Required for hydra:totalItems in API Platform 2.5.7
      extraParams: {
        'limit': 1, // Minimize data transfer
      },
    });

    // Return the total count if available
    if (result['hydra:totalItems'] !== undefined && result['hydra:totalItems'] !== null) {
      logger.log('📊 Got total fitter count from API:', result['hydra:totalItems']);
      return result['hydra:totalItems'];
    }

    logger.warn('📊 Could not get fitter count from API, using fallback');
    return 0;
  } catch (error) {
    logger.error('📊 Error fetching fitter count:', error);
    return 0;
  }
}