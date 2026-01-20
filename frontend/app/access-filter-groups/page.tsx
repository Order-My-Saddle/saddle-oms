"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission } from '@/utils/rolePermissions';
import AccessFilterGroups from '@/components/AccessFilterGroups';

export default function AccessFilterGroupsPage() {
  const router = useRouter();
  const { role } = useUserRole();

  useEffect(() => {
    if (role && !hasScreenPermission(role, 'ACCESS_FILTER_GROUPS')) {
      router.push('/not-authorized');
    }
  }, [role, router]);

  // Don't render if user doesn't have permission
  if (!role || !hasScreenPermission(role, 'ACCESS_FILTER_GROUPS')) {
    return null; // or loading spinner
  }

  return <AccessFilterGroups />;
}