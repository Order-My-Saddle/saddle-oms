import { useAtom } from 'jotai';
import { tokenAtom } from '../store/auth';

export function useToken() {
  const [token] = useAtom(tokenAtom);
  return token;
}

// Helper function to get token without React context (for middleware, etc.)
export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored && stored !== 'null') {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored token:', e);
    }
  }
  return null;
}