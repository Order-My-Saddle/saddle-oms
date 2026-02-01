import { logger } from '@/utils/logger';

export interface SaddleExtra {
  id: number;
  saddleId: number;
  extraId: number;
  deleted?: number;
  isActive?: boolean;
}

function getToken() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored && stored !== 'null') {
        return JSON.parse(stored);
      }
    } catch (e) { /* fallback */ }
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'null') return token;
    } catch (e) { /* fallback */ }
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') return value;
    }
  }
  return null;
}

export async function fetchSaddleExtrasBySaddleId(saddleId: number): Promise<SaddleExtra[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  const response = await fetch(`${API_URL}/api/v1/saddle-extras/saddle/${saddleId}`, {
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
    logger.error('Failed to fetch saddle extras:', errorText);
    throw new Error(`Failed to fetch saddle extras: ${response.status}`);
  }

  return await response.json();
}

export async function createSaddleExtra(data: {
  saddleId: number;
  extraId: number;
}): Promise<SaddleExtra> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  const response = await fetch(`${API_URL}/api/v1/saddle-extras`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Failed to create saddle extra:', errorText);
    throw new Error(`Failed to create saddle extra: ${response.status}`);
  }

  return await response.json();
}

export async function deleteSaddleExtra(id: number): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  const response = await fetch(`${API_URL}/api/v1/saddle-extras/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Failed to delete saddle extra:', errorText);
    throw new Error(`Failed to delete saddle extra: ${response.status}`);
  }
}
