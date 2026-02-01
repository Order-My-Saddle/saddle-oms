import { logger } from '@/utils/logger';

export interface SaddleOptionsItem {
  id: number;
  saddleId: number;
  optionId: number;
  optionItemId: number;
  leatherId: number;
  sequence?: number;
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

export async function fetchSaddleOptionsItemsBySaddleId(saddleId: number): Promise<SaddleOptionsItem[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  const response = await fetch(`${API_URL}/api/v1/saddle-options-items/saddle/${saddleId}`, {
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
    logger.error('Failed to fetch saddle options items:', errorText);
    throw new Error(`Failed to fetch saddle options items: ${response.status}`);
  }

  return await response.json();
}

export async function createSaddleOptionsItem(data: {
  saddleId: number;
  optionId: number;
  optionItemId: number;
  leatherId: number;
  sequence?: number;
}): Promise<SaddleOptionsItem> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  const response = await fetch(`${API_URL}/api/v1/saddle-options-items`, {
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
    logger.error('Failed to create saddle options item:', errorText);
    throw new Error(`Failed to create saddle options item: ${response.status}`);
  }

  return await response.json();
}

export async function deleteSaddleOptionsItem(id: number): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getToken();

  const response = await fetch(`${API_URL}/api/v1/saddle-options-items/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Failed to delete saddle options item:', errorText);
    throw new Error(`Failed to delete saddle options item: ${response.status}`);
  }
}
