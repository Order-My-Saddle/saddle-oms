"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import Users from '@/components/Users';

export default function UsersPage() {
  const router = useRouter();
  const { role } = useUserRole();

  useEffect(() => {
    if (role && !hasScreenPermission(role, 'USER_MANAGEMENT')) {
      router.push('/not-authorized');
    }
  }, [role, router]);

  // Don't render if user doesn't have permission
  if (!role || !hasScreenPermission(role, 'USER_MANAGEMENT')) {
    return null; // or loading spinner
  }

  return <Users />;
}