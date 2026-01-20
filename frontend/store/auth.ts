import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { User, UserRole } from '../types/Role';

// Token atom - stored in localStorage for persistence
export const tokenAtom = atomWithStorage<string | null>('auth_token', null);

// User atom - stored in memory only for security (critical user data should not persist)
// However, we need to persist basic auth state for navigation
export const userAtom = atom<User | null>(null);

// User basic info atom - stored in localStorage for service access (minimal data only)
export const userBasicInfoAtom = atomWithStorage<{ id: number; username: string; role: string; firstName?: string; lastName?: string; email?: string } | null>('auth_user', null);

// Loading state atom
export const isAuthLoadingAtom = atom<boolean>(false);

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => {
  const token = get(tokenAtom);
  const user = get(userAtom);
  const userBasicInfo = get(userBasicInfoAtom);

  // Consider authenticated if we have a token and either full user data or basic user info
  return !!(token && (user || userBasicInfo));
});

// Action atoms
export const loginActionAtom = atom(
  null,
  (get, set, { token, user }: { token: string; user: User }) => {
    console.log('🔧 loginActionAtom: Setting token and user:', { token: token ? 'present' : 'missing', user });
    set(tokenAtom, token);
    set(userAtom, user);
    // Store minimal user info for service access
    set(userBasicInfoAtom, {
      id: user.id,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    set(isAuthLoadingAtom, false);
    console.log('✅ loginActionAtom: All atoms set');
  }
);

export const logoutActionAtom = atom(
  null,
  (get, set) => {
    set(tokenAtom, null);
    set(userAtom, null);
    set(userBasicInfoAtom, null);
    set(isAuthLoadingAtom, false);
  }
);

export const setLoadingAtom = atom(
  null,
  (get, set, loading: boolean) => {
    set(isAuthLoadingAtom, loading);
  }
);

// Restore user from basic info if needed
export const restoreUserFromBasicInfoAtom = atom(
  null,
  (get, set) => {
    const user = get(userAtom);
    const userBasicInfo = get(userBasicInfoAtom);
    const token = get(tokenAtom);

    if (!user && userBasicInfo && token) {
      console.log('🔄 Auth Store: Restoring user from basic info:', userBasicInfo);
      // Create a basic user object from stored info
      const restoredUser: User = {
        id: userBasicInfo.id,
        username: userBasicInfo.username,
        role: userBasicInfo.role as UserRole, // Proper type casting
        email: userBasicInfo.email,
        firstName: userBasicInfo.firstName,
        lastName: userBasicInfo.lastName,
      };
      set(userAtom, restoredUser);
      return restoredUser;
    }
    return user;
  }
);