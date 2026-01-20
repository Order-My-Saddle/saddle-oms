import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { hasScreenPermission, SCREEN_PERMISSIONS } from '@/utils/rolePermissions';

const saddleModellingItems = [
  { id: 'models', label: 'Models', route: '/models', permission: 'MODELS' as keyof typeof SCREEN_PERMISSIONS },
  { id: 'brands', label: 'Brands', route: '/brands', permission: 'BRANDS' as keyof typeof SCREEN_PERMISSIONS },
  { id: 'leathertypes', label: 'Leathertypes', route: '/leathertypes', permission: 'LEATHER_TYPES' as keyof typeof SCREEN_PERMISSIONS },
  { id: 'options', label: 'Options', route: '/options', permission: 'OPTIONS' as keyof typeof SCREEN_PERMISSIONS },
  { id: 'extras', label: 'Extras', route: '/extras', permission: 'EXTRAS' as keyof typeof SCREEN_PERMISSIONS },
  { id: 'presets', label: 'Presets', route: '/presets', permission: 'PRESETS' as keyof typeof SCREEN_PERMISSIONS },
];

export function SaddlesSidebarSection({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { role } = useUserRole();

  // Filter items based on user role
  const visibleSaddleModellingItems = saddleModellingItems.filter(item =>
    hasScreenPermission(role, item.permission)
  );

  // Don't render the section if no items are visible
  if (visibleSaddleModellingItems.length === 0) {
    return null;
  }

  // Check if current route is in any saddle modelling items
  const isActive = visibleSaddleModellingItems.some(item => pathname && pathname.startsWith(item.route));

  // Auto-expand if route matches
  if (isActive && !open) setOpen(true);

  return (
    <div>
      <button
        className={cn(
          "w-full flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors",
          isActive && "bg-gray-300 font-bold text-[#8B0000]",
          isCollapsed && "justify-center px-2"
        )}
        onClick={() => setOpen(o => !o)}
        style={{ marginBottom: 4 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          {/* Saddle seat */}
          <path
            d="M4 10C4 8 5 7 7 7H17C19 7 20 8 20 10C20 11 19.5 12 18.5 12.5C17.5 13 16 13.5 12 13.5C8 13.5 6.5 13 5.5 12.5C4.5 12 4 11 4 10Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pommel (front) */}
          <path
            d="M6 7C6 7 6.5 6 7.5 6C8.5 6 9 7 9 7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Cantle (back) */}
          <path
            d="M15 7C15 7 15.5 6 16.5 6C17.5 6 18 7 18 7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Stirrup leathers */}
          <path
            d="M8 13.5V16C8 17 8.5 17.5 9 17.5M16 13.5V16C16 17 15.5 17.5 15 17.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Stirrups */}
          <ellipse cx="9" cy="18.5" rx="1.5" ry="0.8" fill="currentColor" />
          <ellipse cx="15" cy="18.5" rx="1.5" ry="0.8" fill="currentColor" />
          {/* Girth line */}
          <path
            d="M6 11.5C6 11.5 8 14 12 14C16 14 18 11.5 18 11.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="2,2"
          />
        </svg>
        {!isCollapsed && (
          <>
            <span>Saddle Modelling</span>
            {open ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </>
        )}
      </button>

      {open && !isCollapsed && (
        <nav className="pl-8 flex flex-col gap-1 mb-4">
          {visibleSaddleModellingItems.map(item => {
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