"use client";
import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAtom } from 'jotai';
import { User, UserRole } from '../types/Role';
import { fetchEntities } from '../services/api';
import { login as loginApi, clearAuthTokens } from '../api/login';
import jwt from 'jsonwebtoken';
import {
  tokenAtom,
  userAtom,
  userBasicInfoAtom,
  isAuthLoadingAtom,
  isAuthenticatedAtom,
  loginActionAtom,
  logoutActionAtom,
  setLoadingAtom,
  restoreUserFromBasicInfoAtom
} from '../store/auth';

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<{ 
    success: boolean; 
    message?: string;
    user?: User;
  }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get token from cookies
function getTokenFromCookies(): string | null {
  if (typeof window !== 'undefined') {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('🏗️ AuthProvider: Component mounting/initializing');

  const [token, setToken] = useAtom(tokenAtom);
  const [user, setUser] = useAtom(userAtom);
  const [, setUserBasicInfo] = useAtom(userBasicInfoAtom);
  const [isLoading, setIsLoading] = useAtom(isAuthLoadingAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, loginAction] = useAtom(loginActionAtom);
  const [, logoutAction] = useAtom(logoutActionAtom);
  const [, setLoadingAction] = useAtom(setLoadingAtom);
  const [, restoreUserFromBasicInfo] = useAtom(restoreUserFromBasicInfoAtom);

  console.log('🔍 AuthProvider: Current state on mount:', {
    hasUser: !!user,
    hasToken: !!token,
    isLoading,
    isAuthenticated,
    username: user?.username || 'none'
  });

  const isLoaded = !isLoading;

  // Add cleanup logging
  useEffect(() => {
    return () => {
      console.log('🏗️ AuthProvider: Component unmounting');
    };
  }, []);

  // Check for existing session on initial load
  useEffect(() => {
    // Prevent unnecessary reinitializations if we already have valid auth state
    if (user && token && !isLoading) {
      console.log('🔄 AuthContext: Skipping checkAuth - already authenticated:', {
        hasUser: !!user,
        hasToken: !!token,
        isLoading
      });
      return;
    }

    const checkAuth = async () => {
      console.log('🔄 AuthContext: Starting checkAuth...');
      setLoadingAction(true);
      try {
        // Use token from Jotai store, fallback to cookies for migration
        let authToken = token;
        console.log('🔄 AuthContext: Token from Jotai store:', authToken ? 'present' : 'missing');
        if (!authToken) {
          authToken = getTokenFromCookies();
          console.log('🔄 AuthContext: Token from cookies:', authToken ? 'present' : 'missing');
          if (authToken) {
            setToken(authToken); // Store in Jotai for future use
            console.log('🔄 AuthContext: Token stored in Jotai');
          }
        }

        // Try to restore user from basic info if user is null but we have token
        if (authToken && !user) {
          console.log('🔄 AuthContext: Attempting to restore user from basic info');
          const restoredUser = restoreUserFromBasicInfo();
          if (restoredUser) {
            console.log('✅ AuthContext: User restored from basic info:', restoredUser);
            // Return early as user is now restored
            setLoadingAction(false);
            return;
          }
        }
        
        if (authToken) {
          console.log('🔄 AuthContext: Processing token...');
          // Verify the token is not expired
          const decoded = jwt.decode(authToken) as { exp?: number; id?: string | number; userId?: string | number; roles?: string[]; sub?: string | number; username?: string; email?: string; firstName?: string; lastName?: string; name?: string };
          console.log('🔄 AuthContext: Decoded token:', decoded);

          if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
            console.log('🔄 AuthContext: Token is valid, not expired');
            // Token is valid, try to fetch user data
            try {
              await fetchUserData(authToken);
              console.log('✅ AuthContext: User data fetched successfully from API');
            } catch (fetchError) {
              console.log('⚠️  AuthContext: API fetch failed, using token data as fallback', fetchError);
              // Fallback: create user from token data
              const userId = decoded?.id || decoded?.userId || decoded?.sub;
              console.log('🔄 AuthContext: Extracted userId:', userId);
              console.log('🔄 AuthContext: Extracted roles:', decoded?.roles);
              
              if (userId && decoded?.roles) {
                const primaryRole = mapRolesToPrimary(decoded.roles);

                // Map name to firstName/lastName for decoded token data
                const tokenNameParts = (decoded?.name || '').split(' ').filter(part => part.length > 0);
                const tokenFirstName = tokenNameParts[0] || decoded?.firstName || '';
                const tokenLastName = tokenNameParts.slice(1).join(' ') || decoded?.lastName || '';

                const userData: User = {
                  id: Number(userId),
                  username: decoded?.username || 'Unknown',
                  role: primaryRole,
                  email: decoded?.email,
                  firstName: tokenFirstName,
                  lastName: tokenLastName,
                };
                console.log('🔄 AuthContext: Setting user data from token:', userData);
                console.log('🔄 AuthContext: Primary role mapped to:', primaryRole);
                
                // Use the loginAction atom to properly set both token and user
                loginAction({ token: authToken, user: userData });
              } else {
                console.error('❌ AuthContext: Missing userId or roles in token');
              }
            }
          } else {
            console.log('❌ AuthContext: Token expired, clearing auth');
            // Token expired, clear it
            clearAuthTokens();
            logoutAction();
          }
        } else {
          console.log('🔄 AuthContext: No token found');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearAuthTokens();
        logoutAction();
      } finally {
        setLoadingAction(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - should only run once on mount

  // Fetch user data from the backend
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const decoded = jwt.decode(token) as { id?: string | number; sub?: string | number; userId?: string | number };
      const userId = decoded?.id || decoded?.sub || decoded?.userId;

      if (!userId) {
        throw new Error('No user ID in token');
      }

      // Validate userId format (should be a positive integer)
      const numericId = Number(userId);
      if (isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        throw new Error('Invalid user ID format');
      }

      // Use the auth/me endpoint to get current user data
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const userResponse = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      let member;
      if (userResponse.ok) {
        member = await userResponse.json();
      } else {
        // Fallback to fetchEntities approach
        const result = await fetchEntities({
          entity: 'users',
          extraParams: { id: userId },
          partial: false,
        });
        member = result?.['hydra:member']?.[0];
      }
      if (member) {
        console.log('🔍 AuthContext: member.typeName:', member.typeName);
        console.log('🔍 AuthContext: member.role:', member.role);
        console.log('🔍 AuthContext: member["@type"]:', member["@type"]);
        
        const rawRole = member.typeName || member.role || member["@type"] || 'user';
        console.log('🔍 AuthContext: rawRole to map:', rawRole);
        
        const mappedRole = mapTypeNameToRole(rawRole);
        console.log('🔍 AuthContext: mappedRole result:', mappedRole);
        
        // Map backend name to firstName/lastName for frontend
        const nameParts = (member.name || '').split(' ').filter(part => part.length > 0);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        console.log('🔍 AuthContext: name mapping:', {
          originalName: member.name,
          nameParts,
          firstName,
          lastName
        });

        const userData: User = {
          id: member.id,
          username: member.username || member.email,
          role: mappedRole,
          email: member.email,
          firstName: firstName,
          lastName: lastName,
        };
        
        console.log('🔄 AuthContext: Setting user data from API:', userData);
        console.log('🔄 AuthContext: Member data from API:', member);
        console.log('🔄 AuthContext: Current user atom value before set:', user);
        
        // Use the loginAction atom to properly set both token and user
        loginAction({ token: token, user: userData });
        console.log('✅ AuthContext: User data set via loginAction');

        // User data has been set via loginAction, should be available immediately
        console.log('✅ AuthContext: User authentication completed successfully');
        // Note: User data is now managed in memory/state only for security
        return userData; // Return the user data for immediate access
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    console.log('🔄 AuthContext: Starting login for username:', username);
    
    try {
      // Call the login API
      console.log('🔄 AuthContext: Calling login API...');
      const result = await loginApi(username, password);
      console.log('🔄 AuthContext: Login API result:', result);
      
      if (result.success && result.token) {
        console.log('🔄 AuthContext: Login API successful, fetching user data...');
        
        // Store token in Jotai and fetch complete user data
        try {
          setToken(result.token); // Store token in Jotai immediately
          const userData = await fetchUserData(result.token);
          console.log('✅ AuthContext: Token stored and user data fetched successfully:', userData);

          // Wait a moment to ensure atom state is updated
          await new Promise(resolve => setTimeout(resolve, 100));

          return {
            success: true,
            message: 'Login successful',
            user: userData  // Include user data in return
          };
        } catch (fetchError) {
          console.error('❌ AuthContext: Failed to fetch user data after login:', fetchError);
          
          // Fallback: create user from token data if fetch fails
          console.log('🔄 AuthContext: Using fallback user data from token...');

          // Map name to firstName/lastName if available
          const fallbackNameParts = (result.user?.name || '').split(' ').filter(part => part.length > 0);
          const fallbackFirstName = fallbackNameParts[0] || result.user?.firstName || '';
          const fallbackLastName = fallbackNameParts.slice(1).join(' ') || result.user?.lastName || '';

          const userData: User = {
            id: Number(result.userId) || 0,
            username: result.user?.username || username,
            role: mapTypeNameToRole(result.user?.role || 'user'),
            email: result.user?.email,
            firstName: fallbackFirstName,
            lastName: fallbackLastName,
          };
          
          console.log('🔄 AuthContext: Setting fallback user data:', userData);
          setUser(userData);
          
          return { 
            success: true,
            message: 'Login successful',
            user: userData
          };
        }
      } else {
        console.log('❌ AuthContext: Login API failed:', result.message);
        return { 
          success: false, 
          message: result.message || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred during login.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    clearAuthTokens();
    logoutAction(); // This will clear both token and user from Jotai store
  };

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const authToken = token || getTokenFromCookies();
    if (authToken) {
      try {
        await fetchUserData(authToken);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        logout();
      }
    }
  }, [token, fetchUserData]);

  // Create the context value
  const contextValue = {
    user,
    token,
    isLoaded,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

function mapTypeNameToRole(typeName: string): UserRole {
  console.log('🔍 mapTypeNameToRole: input typeName:', typeName);
  
  switch (typeName) {
    case 'Admin': return UserRole.ADMIN;
    case 'Fitter': return UserRole.FITTER;
    case 'Supplier': return UserRole.SUPPLIER;
    case 'Supervisor': return UserRole.SUPERVISOR;
    case 'User': return UserRole.USER;
    // Handle ROLE_ prefixed values
    case 'ROLE_ADMIN': return UserRole.ADMIN;
    case 'ROLE_FITTER': return UserRole.FITTER;
    case 'ROLE_SUPPLIER': return UserRole.SUPPLIER;
    case 'ROLE_SUPERVISOR': return UserRole.SUPERVISOR;
    case 'ROLE_USER': return UserRole.USER;
    default: 
      console.log('🔍 mapTypeNameToRole: no match found, defaulting to USER');
      return UserRole.USER;
  }
}

function mapRolesToPrimary(roles: string[]): UserRole {
  // Priority order: SUPERVISOR > ADMIN > FITTER > SUPPLIER > USER
  const roleMap = {
    'ROLE_SUPERVISOR': UserRole.SUPERVISOR,
    'ROLE_ADMIN': UserRole.ADMIN,
    'ROLE_FITTER': UserRole.FITTER,
    'ROLE_SUPPLIER': UserRole.SUPPLIER,
    'ROLE_USER': UserRole.USER,
  };
  
  const priority = ['ROLE_SUPERVISOR', 'ROLE_ADMIN', 'ROLE_FITTER', 'ROLE_SUPPLIER', 'ROLE_USER'];
  
  for (const role of priority) {
    if (roles.includes(role)) {
      return roleMap[role as keyof typeof roleMap];
    }
  }
  
  return UserRole.USER;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  
  // Debug what the context is actually providing
  console.log('🔍 useAuth: context value:', {
    user: ctx.user,
    isLoaded: ctx.isLoaded,
    isAuthenticated: ctx.isAuthenticated,
    token: ctx.token ? 'present' : 'missing'
  });
  
  return ctx;
}
