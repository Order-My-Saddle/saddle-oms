"use client";
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { Toaster } from '@/components/ui/sonner';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Memoize layout content to prevent unnecessary re-renders during route changes
  const layoutContent = useMemo(() => {
    console.log('🏗️ ClientLayoutWrapper: Re-rendering layout for pathname:', pathname);

    if (pathname === '/login') {
      return <>{children}</>;
    } else {
      return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <TopNav />
            <main style={{ flex: 1, padding: '32px', minHeight: '100vh', boxSizing: 'border-box' }}>{children}</main>
          </div>
        </div>
      );
    }
  }, [pathname, children]);

  // AuthProvider and JotaiProvider are now handled at root level
  return (
    <>
      {layoutContent}
      <Toaster />
    </>
  );
}
