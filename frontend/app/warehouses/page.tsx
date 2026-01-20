"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import Warehouses from '@/components/Warehouses';

export default function WarehousesPage() {
  const router = useRouter();
  const { role } = useUserRole();

  useEffect(() => {
    if (role && !hasScreenPermission(role, 'WAREHOUSE_MANAGEMENT')) {
      router.push('/not-authorized');
    }
  }, [role, router]);

  // Don't render if user doesn't have permission
  if (!role || !hasScreenPermission(role, 'WAREHOUSE_MANAGEMENT')) {
    return null; // or loading spinner
  }

  return <Warehouses />;
}