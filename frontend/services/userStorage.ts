import { User } from '@/types/Role';

/**
 * Service for managing user data storage in local storage
 */

const USER_STORAGE_KEY = 'oms_current_user';
const TOKEN_STORAGE_KEY = 'oms_token';

/**
 * Get the current user from local storage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user from storage:', error);
    return null;
  }
};

/**
 * Set the current user in local storage
 */
export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error setting current user in storage:', error);
  }
};

/**
 * Get the current auth token from local storage
 */
export const getCurrentToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

/**
 * Set the auth token in local storage
 */
export const setCurrentToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error setting token in storage:', error);
  }
};

/**
 * Clear all user data from local storage
 */
export const clearUserStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user storage:', error);
  }
};

/**
 * Check if user is authenticated (has both user and token)
 */
export const isUserAuthenticated = (): boolean => {
  const user = getCurrentUser();
  const token = getCurrentToken();
  return !!(user && token);
};