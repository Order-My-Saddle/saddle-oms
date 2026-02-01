import { SaddleStockSearchResult } from '@/types/SaddleStock';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored && stored !== 'null') {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Fallback to cookies
    }
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return value;
      }
    }
  }
  return null;
}

function authHeaders() {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function fetchSaddleStock(
  type: 'my' | 'available' | 'all',
  {
    page = 1,
    limit = 30,
    search,
  }: { page?: number; limit?: number; search?: string } = {},
): Promise<SaddleStockSearchResult> {
  const url = new URL(`${API_URL}/api/v1/saddle-stock`);
  url.searchParams.set('type', type);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (search) {
    url.searchParams.set('search', search);
  }

  const res = await fetch(url.toString(), {
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${type} saddle stock: ${res.status}`);
  }

  return res.json();
}

export async function fetchMySaddleStock({
  page = 1,
  partial = false,
  orderBy = 'productId',
  order = 'desc',
} = {}): Promise<SaddleStockSearchResult> {
  return fetchSaddleStock('my', { page });
}

export async function fetchAvailableSaddleStock({
  page = 1,
  partial = false,
  orderBy = 'productId',
  order = 'desc',
} = {}): Promise<SaddleStockSearchResult> {
  return fetchSaddleStock('available', { page });
}

export async function fetchAllSaddleStock({
  page = 1,
  search,
}: { page?: number; search?: string } = {}): Promise<SaddleStockSearchResult> {
  return fetchSaddleStock('all', { page, search });
}

export async function getSaddleStockById(id: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/v1/saddle-stock/${id}`, {
    headers: authHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch saddle stock item: ${res.status}`);
  }

  return res.json();
}
