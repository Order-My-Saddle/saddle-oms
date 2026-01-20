"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import Suppliers from '@/components/Suppliers';

export default function SuppliersPage() {
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

  return <Suppliers />;
}