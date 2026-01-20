"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import CountryManagers from '@/components/CountryManagers';

export default function CountryManagersPage() {
  const router = useRouter();
  const { role } = useUserRole();

  useEffect(() => {
    if (role && !hasScreenPermission(role, 'COUNTRY_MANAGERS')) {
      router.push('/not-authorized');
    }
  }, [role, router]);

  // Don't render if user doesn't have permission
  if (!role || !hasScreenPermission(role, 'COUNTRY_MANAGERS')) {
    return null; // or loading spinner
  }

  return <CountryManagers />;
}