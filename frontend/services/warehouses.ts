import { fetchEntities } from './api';

export interface Warehouse {
  id: string;
  username: string;
  name: string;
  location?: string;
  status?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWarehouseData {
  username: string;
  name: string;
  location?: string;
  status?: string;
  enabled?: boolean;
}

export interface UpdateWarehouseData {
  username?: string;
  name?: string;
  location?: string;
  status?: string;
  enabled?: boolean;
}

export interface WarehousesResponse {
  'hydra:member': Warehouse[];
  'hydra:totalItems': number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? 
    document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1] : null;
  
  return {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch warehouses with pagination and filtering
 */
export async function fetchWarehouses({
  page = 1,
  orderBy = 'username',
  partial = false,
  filters = {}
}: {
  page?: number;
  orderBy?: string;
  partial?: boolean;
  filters?: Record<string, string>;
} = {}): Promise<WarehousesResponse> {
  return fetchEntities({
    entity: 'warehouses',
    page,
    orderBy,
    partial,
    extraParams: filters,
  });
}

/**
 * Get a single warehouse by ID
 */
export async function getWarehouse(id: string): Promise<Warehouse> {
  const response = await fetch(`${API_URL}/warehouses/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch warehouse: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new warehouse
 */
export async function createWarehouse(warehouseData: CreateWarehouseData): Promise<Warehouse> {
  const response = await fetch(`${API_URL}/warehouses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      username: warehouseData.username,
      name: warehouseData.name,
      location: warehouseData.location,
      status: warehouseData.status || 'active',
      enabled: warehouseData.enabled !== false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create warehouse: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing warehouse
 */
export async function updateWarehouse(id: string, warehouseData: UpdateWarehouseData): Promise<Warehouse> {
  const response = await fetch(`${API_URL}/warehouses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(warehouseData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update warehouse: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a warehouse
 */
export async function deleteWarehouse(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/warehouses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete warehouse: ${response.statusText}`);
  }
}

/**
 * Get warehouse status options
 */
export function getWarehouseStatuses(): { value: string; label: string }[] {
  return [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'suspended', label: 'Suspended' },
  ];
}