import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission, SCREEN_PERMISSIONS } from '@/utils/rolePermissions';

const accountManagementItems = [
  { id: 'users', label: 'Users', route: '/users', permission: 'USER_MANAGEMENT' as keyof typeof SCREEN_PERMISSIONS },
  // { id: 'warehouses', label: 'Warehouses', route: '/warehouses', permission: 'WAREHOUSES' as keyof typeof SCREEN_PERMISSIONS },
  // { id: 'access-filter-groups', label: 'Access Filter Groups', route: '/access-filter-groups', permission: 'ACCESS_FILTER_GROUPS' as keyof typeof SCREEN_PERMISSIONS },
  // { id: 'country-managers', label: 'Country Managers', route: '/country-managers', permission: 'COUNTRY_MANAGERS' as keyof typeof SCREEN_PERMISSIONS },
  { id: 'user-permissions', label: 'User Permissions', route: '/user-permissions', permission: 'USER_PERMISSIONS_VIEW' as keyof typeof SCREEN_PERMISSIONS },
];

export function AccountManagementSidebarSection({ isCollapsed, initiallyCollapsed = true }: { isCollapsed: boolean; initiallyCollapsed?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(!initiallyCollapsed);
  const { role } = useUserRole();

  // Filter items based on user role
  const visibleAccountItems = accountManagementItems.filter(item => {
    const hasPermission = hasScreenPermission(role, item.permission);
    return hasPermission;
  });

  // Don't render the section if no items are visible
  if (visibleAccountItems.length === 0) {
    return null;
  }

  // Open if current route is in visible accountManagementItems
  const isActive = visibleAccountItems.some(item => pathname && pathname.startsWith(item.route));

  // Auto-expand if route matches
  if (isActive && !open) setOpen(true);

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors",
          isActive && "bg-gray-300 font-bold text-[#8B0000]",
          isCollapsed && "justify-center px-2"
        )}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="account-management-submenu"
      >
        <UserCog className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="whitespace-nowrap">Account Management</span>
            {open ? (
              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
            )}
          </>
        )}
      </button>
      {open && !isCollapsed && (
        <nav id="account-management-submenu" className="pl-8 flex flex-col gap-1 mb-4">
          {visibleAccountItems.map(item => {
            const isActive = pathname && pathname.startsWith(item.route);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.route)}
                className={cn(
                  'text-left text-sm py-1 hover:text-[#8B0000] transition-colors',
                  isActive && 'font-bold text-[#8B0000]'
                )}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}