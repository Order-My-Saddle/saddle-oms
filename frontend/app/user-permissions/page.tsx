"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import UserPermissions from '@/components/UserPermissions';

export default function UserPermissionsPage() {
  const router = useRouter();
  const { role } = useUserRole();

  useEffect(() => {
    if (role && !hasScreenPermission(role, 'USER_PERMISSIONS_VIEW')) {
      router.push('/not-authorized');
    }
  }, [role, router]);

  // Don't render if user doesn't have permission
  if (!role || !hasScreenPermission(role, 'USER_PERMISSIONS_VIEW')) {
    return null; // or loading spinner
  }

  return <UserPermissions />;
}