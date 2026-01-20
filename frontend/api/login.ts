import jwt from 'jsonwebtoken';

export interface LoginResponse {
  success: boolean;
  token?: string;
  userId?: string | number;
  message?: string;
  user?: any;
}

// Get the backend API URL from environment variable or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/email/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        email: username, // Backend accepts both username and email
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: errorData.message || 'Authentication failed',
      };
    }

    // Get response data first
    const data = await response.json();

    // Get access token from response body (NestJS format)
    let accessToken = data.token || data.accessToken || '';

    // Fallback: check Authorization header
    if (!accessToken) {
      const authHeader = response.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    if (!accessToken) {
      return { 
        success: false, 
        message: 'No authentication token received',
      };
    }

    // Decode the token to get user info (without verification on client side)
    let decodedToken: any;
    try {
      // Only decode the token, don't verify it on client side for security
      decodedToken = jwt.decode(accessToken);
      
      if (!decodedToken) {
        throw new Error('Invalid token format');
      }
    } catch (e) {
      console.error('Failed to decode token:', e);
      return { 
        success: false, 
        message: 'Invalid token format',
      };
    }

    // Store the token in localStorage for the frontend app
    // Note: For production, consider using httpOnly cookies set by the backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', JSON.stringify(accessToken));

      // Also store user information if available
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
    }

    // Get user information from token and response
    const userId = decodedToken?.id || decodedToken?.userId || decodedToken?.sub || data.user?.id;
    const userInfo = {
      id: userId || decodedToken?.id,
      username: decodedToken?.username || data.user?.username || username,
      email: decodedToken?.email || data.user?.email,
      firstName: data.user?.firstName,
      lastName: data.user?.lastName,
      role: decodedToken?.role?.type || data.user?.role?.type || 'user',
    };

    if (!userId) {
      return {
        success: false,
        message: 'No user ID found in token',
      };
    }

    return {
      success: true,
      token: accessToken,
      userId,
      user: userInfo,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Helper function to clear auth tokens
export function clearAuthTokens() {
  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Also clear any legacy cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint
    const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });

    // Clear local tokens regardless of backend response
    clearAuthTokens();

    if (!response.ok) {
      console.warn('Logout endpoint failed, but tokens cleared locally');
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local tokens even if network fails
    clearAuthTokens();
  }
}
