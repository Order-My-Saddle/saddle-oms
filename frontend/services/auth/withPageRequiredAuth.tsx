"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/Role';

interface Options {
  roles?: UserRole[];
}

export function withPageRequiredAuth<P>(Component: React.ComponentType<P>, options?: Options) {
  const allowedRoles = options?.roles || Object.values(UserRole);
  return function WithPageRequiredAuth(props: P) {
    const { user, isLoaded } = useAuth();
    const router = useRouter();

    console.log('🔒 withPageRequiredAuth: checking auth', {
      user: user ? { role: user.role, id: user.id } : null,
      isLoaded,
      allowedRoles,
      hasUser: !!user,
      userRoleInAllowed: user ? allowedRoles.includes(user.role) : false
    });

    useEffect(() => {
      console.log('🔒 withPageRequiredAuth useEffect:', {
        isLoaded,
        user: !!user,
        userRole: user?.role,
        allowedRoles,
        roleCheckPassed: user ? allowedRoles.includes(user.role) : false
      });

      // Only proceed if auth is fully loaded
      if (!isLoaded) {
        console.log('🔒 withPageRequiredAuth: auth not loaded yet, waiting...');
        return;
      }

      // Add a small delay to prevent conflicts with login redirects
      const timeoutId = setTimeout(() => {
        console.log('🔒 withPageRequiredAuth: performing delayed auth check');

        // Check if user is authenticated and has proper role
        if (!user) {
          console.log('🔒 withPageRequiredAuth: no user found, redirecting to login');

          // Use window.location for reliable redirect in staging/production
          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isLocalhost) {
            router.replace('/login');
          } else {
            window.location.replace('/login');
          }
        } else if (!allowedRoles.includes(user.role)) {
          console.log('🔒 withPageRequiredAuth: user role not allowed', {
            userRole: user.role,
            allowedRoles,
            roleType: typeof user.role,
            comparison: allowedRoles.map(role => ({ role, equals: role === user.role, types: `${typeof role} vs ${typeof user.role}` }))
          });

          const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isLocalhost) {
            router.replace('/login');
          } else {
            window.location.replace('/login');
          }
        } else {
          console.log('🔒 withPageRequiredAuth: user authenticated with proper role, allowing access');
        }
      }, 100); // Small delay to prevent navigation conflicts

      return () => clearTimeout(timeoutId);
    }, [user, isLoaded, router, allowedRoles]);

    // Show loading while auth state is being determined
    if (!isLoaded) {
      console.log('🔒 withPageRequiredAuth: showing loading (auth not loaded)');
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    // Check auth after loading is complete
    if (!user) {
      console.log('🔒 withPageRequiredAuth: returning null (no user after loading)');
      return null;
    }

    if (!allowedRoles.includes(user.role)) {
      console.log('🔒 withPageRequiredAuth: returning null (role not allowed after loading)', {
        userRole: user.role,
        allowedRoles,
        roleType: typeof user.role
      });
      return null;
    }

    console.log('🔒 withPageRequiredAuth: rendering component');
    return <Component {...props} />;
  };
}
