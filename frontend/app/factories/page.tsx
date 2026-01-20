"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import Factories from '@/components/Factories';

export default function FactoriesPage() {
  const router = useRouter();
  const { role } = useUserRole();

  useEffect(() => {
    if (role && !hasScreenPermission(role, 'SUPPLIERS_MANAGEMENT')) {
      router.push('/not-authorized');
    }
  }, [role, router]);

  // Don't render if user doesn't have permission
  if (!role || !hasScreenPermission(role, 'SUPPLIERS_MANAGEMENT')) {
    return null; // or loading spinner
  }

  return <Factories />;
}