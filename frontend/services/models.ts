import { logger } from '@/utils/logger';

export interface Model {
  id: string;
  name: string;
  brandName: string;
  brand?: {
    id: string;
    name: string;
  };
  sequence: number;
  active: boolean;
  // Factory assignments (factory IDs)
  factoryEu?: number;
  factoryGb?: number;
  factoryUs?: number;
  factoryCa?: number;
  factoryAud?: number;
  factoryDe?: number;
  factoryNl?: number;
  // Saddle type: 0=Jumping, 1=Dressage, 2=All-Purpose
  type?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelsResponse {
  'hydra:member': Model[];
  'hydra:totalItems': number;
}

// Internal saddle response type from NestJS backend
interface SaddleResponse {
  data: Array<{
    id: number;
    brand: string;
    modelName: string;
    sequence: number;
    active: number;
    isActive: boolean;
    displayName: string;
    // Factory assignments
    factoryEu?: number;
    factoryGb?: number;
    factoryUs?: number;
    factoryCa?: number;
    factoryAud?: number;
    factoryDe?: number;
    factoryNl?: number;
    // Saddle type
    type?: number;
    createdAt?: string;
    updatedAt?: string;
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
 * Fetch models (saddles) from the saddles endpoint
 */
export async function fetchModels({
  page = 1,
  searchTerm = '',
  filters = {},
  orderBy = 'sequence',
  order = 'asc'
}: {
  page?: number;
  searchTerm?: string;
  filters?: Record<string, string>;
  orderBy?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<ModelsResponse> {
  logger.log('fetchModels: Called with params:', { page, searchTerm, filters, orderBy, order });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  // Build query parameters for the saddles endpoint
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', '30');

  // Handle search term
  if (searchTerm) {
    params.set('search', searchTerm);
  }

  // Handle filters - pass all filter parameters to backend
  if (filters.id) {
    params.set('id', filters.id);
  }
  if (filters.name) {
    // name in frontend maps to modelName in backend
    params.set('modelName', filters.name);
  }
  if (filters.brand || filters.brandName) {
    params.set('brand', filters.brand || filters.brandName);
  }
  if (filters.sequence) {
    params.set('sequence', filters.sequence);
  }
  if (filters.active === 'true') {
    params.set('active', 'true');
  } else if (filters.active === 'false') {
    params.set('active', 'false');
  }

  logger.log('fetchModels: Calling saddles endpoint with params:', params.toString());

  const response = await fetch(`${API_URL}/api/v1/saddles?${params.toString()}`, {
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
    logger.error('fetchModels: Failed to fetch saddles:', errorText);
    throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
  }

  const saddleData: SaddleResponse = await response.json();
  logger.log('fetchModels: Received saddle data:', saddleData);

  // Transform saddle data to model format expected by frontend
  const models: Model[] = saddleData.data.map(saddle => ({
    id: String(saddle.id),
    name: saddle.modelName,
    brandName: saddle.brand,
    brand: {
      id: saddle.brand, // Using brand name as ID since we don't have separate brand IDs
      name: saddle.brand,
    },
    sequence: saddle.sequence,
    active: saddle.isActive,
    // Factory assignments
    factoryEu: saddle.factoryEu,
    factoryGb: saddle.factoryGb,
    factoryUs: saddle.factoryUs,
    factoryCa: saddle.factoryCa,
    factoryAud: saddle.factoryAud,
    factoryDe: saddle.factoryDe,
    factoryNl: saddle.factoryNl,
    // Saddle type
    type: saddle.type,
    createdAt: saddle.createdAt,
    updatedAt: saddle.updatedAt,
  }));

  // Return in Hydra format expected by frontend
  return {
    'hydra:member': models,
    'hydra:totalItems': saddleData.total,
  };
}

export async function createModel(modelData: Partial<Model>): Promise<Model> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  // Create saddle data from model data
  const saddleData = {
    brand: modelData.brandName || '',
    modelName: modelData.name || '',
    sequence: modelData.sequence || 0,
    active: modelData.active ? 1 : 0,
    // Factory values
    factoryEu: modelData.factoryEu ?? 0,
    factoryGb: modelData.factoryGb ?? 0,
    factoryUs: modelData.factoryUs ?? 0,
    factoryCa: modelData.factoryCa ?? 0,
    factoryAud: modelData.factoryAud ?? 0,
    factoryDe: modelData.factoryDe ?? 0,
    factoryNl: modelData.factoryNl ?? 0,
    presets: '',
    type: modelData.type ?? 0,
  };

  logger.log('Creating saddle (model):', JSON.stringify(saddleData, null, 2));

  const response = await fetch(`${API_URL}/api/v1/saddles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(saddleData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Model creation failed:', errorText);
    throw new Error(`Failed to create model: ${response.statusText}`);
  }

  const result = await response.json();
  logger.log('Model creation result:', result);

  // Transform saddle response to model format
  return {
    id: String(result.id),
    name: result.modelName,
    brandName: result.brand,
    brand: {
      id: result.brand,
      name: result.brand,
    },
    sequence: result.sequence,
    active: result.isActive,
    factoryEu: result.factoryEu,
    factoryGb: result.factoryGb,
    factoryUs: result.factoryUs,
    factoryCa: result.factoryCa,
    factoryAud: result.factoryAud,
    factoryDe: result.factoryDe,
    factoryNl: result.factoryNl,
    type: result.type,
  };
}

export async function updateModel(id: string, modelData: Partial<Model>): Promise<Model> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  // Create saddle update data from model data
  const saddleData: Record<string, unknown> = {};

  if (modelData.brandName !== undefined) {
    saddleData.brand = modelData.brandName;
  }
  if (modelData.name !== undefined) {
    saddleData.modelName = modelData.name;
  }
  if (modelData.sequence !== undefined) {
    saddleData.sequence = modelData.sequence;
  }
  if (modelData.active !== undefined) {
    saddleData.active = modelData.active ? 1 : 0;
  }
  // Factory assignments
  if (modelData.factoryEu !== undefined) {
    saddleData.factoryEu = modelData.factoryEu;
  }
  if (modelData.factoryGb !== undefined) {
    saddleData.factoryGb = modelData.factoryGb;
  }
  if (modelData.factoryUs !== undefined) {
    saddleData.factoryUs = modelData.factoryUs;
  }
  if (modelData.factoryCa !== undefined) {
    saddleData.factoryCa = modelData.factoryCa;
  }
  if (modelData.factoryAud !== undefined) {
    saddleData.factoryAud = modelData.factoryAud;
  }
  if (modelData.factoryDe !== undefined) {
    saddleData.factoryDe = modelData.factoryDe;
  }
  if (modelData.factoryNl !== undefined) {
    saddleData.factoryNl = modelData.factoryNl;
  }
  // Saddle type
  if (modelData.type !== undefined) {
    saddleData.type = modelData.type;
  }

  logger.log('Updating saddle (model):', id, JSON.stringify(saddleData, null, 2));

  const response = await fetch(`${API_URL}/api/v1/saddles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(saddleData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Model update failed:', errorText);
    throw new Error(`Failed to update model: ${response.statusText}`);
  }

  const result = await response.json();
  logger.log('Model update result:', result);

  // Transform saddle response to model format
  return {
    id: String(result.id),
    name: result.modelName,
    brandName: result.brand,
    brand: {
      id: result.brand,
      name: result.brand,
    },
    sequence: result.sequence,
    active: result.isActive,
    factoryEu: result.factoryEu,
    factoryGb: result.factoryGb,
    factoryUs: result.factoryUs,
    factoryCa: result.factoryCa,
    factoryAud: result.factoryAud,
    factoryDe: result.factoryDe,
    factoryNl: result.factoryNl,
    type: result.type,
  };
}

export async function deleteModel(id: string): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  logger.log('Deleting saddle (model):', id);

  const response = await fetch(`${API_URL}/api/v1/saddles/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Model deletion failed:', errorText);
    throw new Error(`Failed to delete model: ${response.statusText}`);
  }
}

/**
 * Get the next available sequence number
 */
export async function fetchNextSequence(): Promise<number> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  logger.log('fetchNextSequence: Getting next sequence number');

  const response = await fetch(`${API_URL}/api/v1/saddles/next-sequence`, {
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
    logger.error('fetchNextSequence: Failed to fetch next sequence:', errorText);
    // Return 1 as default if endpoint fails
    return 1;
  }

  const result = await response.json();
  logger.log('fetchNextSequence: Result:', result);
  return result.nextSequence || 1;
}

/**
 * Get the total count of models (for pagination display)
 */
export async function fetchModelCount(): Promise<number> {
  try {
    logger.log('📊 fetchModelCount: Getting total model count');

    // Use fetchModels with minimal data to get total count
    const result = await fetchModels({ page: 1 });

    // Return the total count if available
    if (result['hydra:totalItems'] !== undefined && result['hydra:totalItems'] !== null) {
      logger.log('📊 Got total model count from API:', result['hydra:totalItems']);
      return result['hydra:totalItems'];
    }

    logger.warn('📊 Could not get model count from API, using fallback');
    return 0;
  } catch (error) {
    logger.error('📊 Error fetching model count:', error);
    return 0;
  }
}
