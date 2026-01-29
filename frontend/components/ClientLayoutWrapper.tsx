"use client";
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoaded } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🏗️ ClientLayoutWrapper: Auth check:', { isLoaded, isAuthenticated, pathname });

    // Only redirect after auth state has loaded
    if (isLoaded && !isAuthenticated && pathname !== '/login') {
      console.log('🔒 ClientLayoutWrapper: User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isLoaded, isAuthenticated, pathname, router]);

  // Memoize layout content to prevent unnecessary re-renders during route changes
  const layoutContent = useMemo(() => {
    console.log('🏗️ ClientLayoutWrapper: Re-rendering layout for pathname:', pathname);

    if (pathname === '/login') {
      return <>{children}</>;
    }

    // Show loading or nothing while checking auth / redirecting
    if (!isLoaded || !isAuthenticated) {
      return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading...</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <TopNav />
          <main style={{ flex: 1, padding: '32px', minHeight: '100vh', boxSizing: 'border-box' }}>{children}</main>
        </div>
      </div>
    );
  }, [pathname, children, isLoaded, isAuthenticated]);

  // AuthProvider and JotaiProvider are now handled at root level
  return (
    <>
      {layoutContent}
      <Toaster />
    </>
  );
}
