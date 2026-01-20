import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/Sidebar';
import { SaddleModellingSidebarSection } from '@/components/SaddleModellingSidebarSection';
import { UserRole } from '@/types/Role';
import { getAllRoles, roleTestCases } from '../../utils/roleTestHelpers';

// Mock the hooks and utilities
jest.mock('@/hooks/useUserRole', () => ({
  useUserRole: jest.fn()
}));

jest.mock('@/utils/rolePermissions', () => ({
  hasScreenPermission: jest.fn(),
  SCREEN_PERMISSIONS: {
    DASHBOARD: 'DASHBOARD',
    ORDERS: 'ORDERS',
    CUSTOMERS: 'CUSTOMERS',
    FITTERS: 'FITTERS',
    REPORTS: 'REPORTS',
    SUPPLIERS: 'SUPPLIERS',
    BRANDS: 'BRANDS',
    MODELS: 'MODELS',
    LEATHER_TYPES: 'LEATHER_TYPES',
    OPTIONS: 'OPTIONS',
    EXTRAS: 'EXTRAS',
    PRESETS: 'PRESETS'
  },
  NAVIGATION_ITEMS: [
    { name: 'Dashboard', href: '/dashboard', permission: 'DASHBOARD' },
    { name: 'Orders', href: '/orders', permission: 'ORDERS' },
    { name: 'Customers', href: '/customers', permission: 'CUSTOMERS' },
    { name: 'Fitters', href: '/fitters', permission: 'FITTERS' },
    { name: 'Reports', href: '/reports', permission: 'REPORTS' }
  ]
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard'
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="dashboard-icon">Dashboard Icon</div>,
  ShoppingCart: () => <div data-testid="orders-icon">Orders Icon</div>,
  Users: () => <div data-testid="users-icon">Users Icon</div>,
  BarChart3: () => <div data-testid="reports-icon">Reports Icon</div>,
  Search: () => <div data-testid="search-icon">Search Icon</div>,
  ChevronRight: () => <div data-testid="chevron-right">→</div>,
  ChevronLeft: () => <div data-testid="chevron-left">←</div>,
  ChevronDown: () => <div data-testid="chevron-down">↓</div>,
  DivideIcon: () => <div data-testid="divide-icon">÷</div>,
  Boxes: () => <div data-testid="boxes-icon">Boxes Icon</div>
}));

const mockUseUserRole = require('@/hooks/useUserRole').useUserRole as jest.Mock;
const mockHasScreenPermission = require('@/utils/rolePermissions').hasScreenPermission as jest.Mock;

describe('Navigation Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup realistic permission implementation
    mockHasScreenPermission.mockImplementation((role, permission) => {
      const permissionMap = {
        'DASHBOARD': [UserRole.USER, UserRole.FITTER, UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'ORDERS': [UserRole.USER, UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'CUSTOMERS': [UserRole.FITTER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'FITTERS': [UserRole.ADMIN, UserRole.SUPERVISOR],
        'REPORTS': [UserRole.ADMIN, UserRole.SUPERVISOR],
        'SUPPLIERS': [UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'BRANDS': [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'MODELS': [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'LEATHER_TYPES': [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'OPTIONS': [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'EXTRAS': [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR],
        'PRESETS': [UserRole.USER, UserRole.ADMIN, UserRole.SUPERVISOR]
      };
      
      const allowedRoles = permissionMap[permission] || [];
      
      // Handle supervisor inheritance
      if (role === UserRole.SUPERVISOR) {
        return allowedRoles.includes(UserRole.SUPERVISOR) || allowedRoles.includes(UserRole.ADMIN);
      }
      
      return allowedRoles.includes(role);
    });

    // Mock window resize events
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  describe('Sidebar Navigation Filtering', () => {
    getAllRoles().forEach(role => {
      const testCase = roleTestCases.find(tc => tc.role === role);
      if (!testCase) return;

      test(`${testCase.roleName} sees only allowed navigation items`, () => {
        mockUseUserRole.mockReturnValue({
          role,
          hasRole: jest.fn()
        });

        render(<Sidebar />);

        // Define expected navigation items for each role
        const expectedNavItems = {
          [UserRole.USER]: ['Dashboard', 'Orders', 'Find Saddle'],
          [UserRole.FITTER]: ['Dashboard', 'Orders', 'Customers', 'Find Saddle'],
          [UserRole.SUPPLIER]: ['Dashboard', 'Find Saddle'], // Suppliers no longer in main nav
          [UserRole.ADMIN]: ['Dashboard', 'Orders', 'Customers', 'Fitters', 'Reports', 'Find Saddle'], // Suppliers moved to Account Management
          [UserRole.SUPERVISOR]: ['Dashboard', 'Orders', 'Customers', 'Fitters', 'Reports', 'Find Saddle'] // Suppliers moved to Account Management
        };

        const expectedItems = expectedNavItems[role] || [];
        const allPossibleItems = ['Dashboard', 'Orders', 'Customers', 'Fitters', 'Suppliers', 'Reports', 'Find Saddle'];

        expectedItems.forEach(item => {
          expect(screen.getByText(item)).toBeInTheDocument();
        });

        allPossibleItems.forEach(item => {
          if (!expectedItems.includes(item)) {
            expect(screen.queryByText(item)).not.toBeInTheDocument();
          }
        });
      });
    });

    test('displays all navigation items for admin', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      render(<Sidebar />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Fitters')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Find Saddle')).toBeInTheDocument();
      // Suppliers no longer in main navigation
    });

    test('shows minimal navigation for suppliers', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPPLIER,
        hasRole: jest.fn()
      });

      render(<Sidebar />);

      // Should show
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Find Saddle')).toBeInTheDocument();
      // Suppliers no longer in main nav for SUPPLIER role

      // Should not show
      expect(screen.queryByText('Orders')).not.toBeInTheDocument();
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();
      expect(screen.queryByText('Fitters')).not.toBeInTheDocument();
      expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    });

    test('displays logo for all users', () => {
      getAllRoles().forEach(role => {
        mockUseUserRole.mockReturnValue({
          role,
          hasRole: jest.fn()
        });

        render(<Sidebar />);
        
        const logo = screen.getByAltText('Custom Saddlery Logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/logo.png');
      });
    });
  });

  describe('Saddle Modelling Section', () => {
    test('shows saddle modelling items for users with access', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.USER,
        hasRole: jest.fn()
      });

      render(<SaddleModellingSidebarSection isCollapsed={false} />);

      // User should see all saddle modelling items
      expect(screen.getByText('Models')).toBeInTheDocument();
      expect(screen.getByText('Brands')).toBeInTheDocument();
      expect(screen.getByText('Leathertypes')).toBeInTheDocument();
      expect(screen.getByText('Options')).toBeInTheDocument();
      expect(screen.getByText('Extras')).toBeInTheDocument();
      expect(screen.getByText('Presets')).toBeInTheDocument();
    });

    test('hides saddle modelling items for users without access', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.FITTER,
        hasRole: jest.fn()
      });

      render(<SaddleModellingSidebarSection isCollapsed={false} />);

      // Fitter should not see saddle modelling items
      expect(screen.queryByText('Models')).not.toBeInTheDocument();
      expect(screen.queryByText('Brands')).not.toBeInTheDocument();
      expect(screen.queryByText('Leathertypes')).not.toBeInTheDocument();
      expect(screen.queryByText('Options')).not.toBeInTheDocument();
      expect(screen.queryByText('Extras')).not.toBeInTheDocument();
      expect(screen.queryByText('Presets')).not.toBeInTheDocument();
    });

    test('returns null when no items are visible', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPPLIER,
        hasRole: jest.fn()
      });

      const { container } = render(<SaddleModellingSidebarSection isCollapsed={false} />);
      
      // Should render nothing
      expect(container.firstChild).toBeNull();
    });

    test('toggles saddle modelling section visibility', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      render(<SaddleModellingSidebarSection isCollapsed={false} initiallyCollapsed={true} />);

      // Initially should be collapsed, items not visible
      expect(screen.queryByText('Models')).not.toBeInTheDocument();

      // Find and click the toggle button
      const toggleButton = screen.getByRole('button', { expanded: false });
      fireEvent.click(toggleButton);

      // Now items should be visible
      expect(screen.getByText('Models')).toBeInTheDocument();
      expect(screen.getByText('Brands')).toBeInTheDocument();
    });

    test('auto-expands when current route matches saddle modelling item', () => {
      // Mock current pathname to be a saddle modelling route
      const mockUsePathname = require('next/navigation').usePathname as jest.Mock;
      mockUsePathname.mockReturnValue('/models');

      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      render(<SaddleModellingSidebarSection isCollapsed={false} initiallyCollapsed={true} />);

      // Should auto-expand and show items because we're on /models
      expect(screen.getByText('Models')).toBeInTheDocument();
      expect(screen.getByText('Brands')).toBeInTheDocument();
    });
  });

  describe('Permission Checking Integration', () => {
    test('calls hasScreenPermission for each navigation item', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      render(<Sidebar />);

      // Should call hasScreenPermission for each navigation item
      expect(mockHasScreenPermission).toHaveBeenCalledWith(UserRole.ADMIN, 'DASHBOARD');
      expect(mockHasScreenPermission).toHaveBeenCalledWith(UserRole.ADMIN, 'ORDERS');
      expect(mockHasScreenPermission).toHaveBeenCalledWith(UserRole.ADMIN, 'CUSTOMERS');
      expect(mockHasScreenPermission).toHaveBeenCalledWith(UserRole.ADMIN, 'FITTERS');
      expect(mockHasScreenPermission).toHaveBeenCalledWith(UserRole.ADMIN, 'SUPPLIERS');
      expect(mockHasScreenPermission).toHaveBeenCalledWith(UserRole.ADMIN, 'REPORTS');
    });

    test('filters navigation items based on permission results', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.USER,
        hasRole: jest.fn()
      });

      // Mock specific permission results for USER role
      mockHasScreenPermission.mockImplementation((role, permission) => {
        if (role === UserRole.USER) {
          return ['DASHBOARD', 'ORDERS'].includes(permission);
        }
        return false;
      });

      render(<Sidebar />);

      // Should show items with granted permissions
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();

      // Should not show items with denied permissions
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();
      expect(screen.queryByText('Fitters')).not.toBeInTheDocument();
      expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('handles mobile view collapse', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      render(<Sidebar />);

      // On mobile, sidebar should be collapsed by default
      // Check that navigation items are still present but may be styled differently
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    test('handles desktop view expansion', () => {
      // Mock desktop screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      render(<Sidebar />);

      // On desktop, sidebar should show full navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });
  });

  describe('Navigation Consistency', () => {
    test('navigation items match role permission configuration', () => {
      const roleNavigationMap = {
        [UserRole.USER]: {
          allowed: ['Dashboard', 'Orders', 'Find Saddle'],
          denied: ['Customers', 'Fitters', 'Reports', 'Suppliers']
        },
        [UserRole.FITTER]: {
          allowed: ['Dashboard', 'Orders', 'Customers', 'Find Saddle'],
          denied: ['Fitters', 'Reports', 'Suppliers']
        },
        [UserRole.SUPPLIER]: {
          allowed: ['Dashboard', 'Find Saddle'], // Suppliers no longer in main nav
          denied: ['Orders', 'Customers', 'Fitters', 'Reports', 'Suppliers']
        },
        [UserRole.ADMIN]: {
          allowed: ['Dashboard', 'Orders', 'Customers', 'Fitters', 'Reports', 'Find Saddle'], // Suppliers moved to Account Management
          denied: ['Suppliers']
        },
        [UserRole.SUPERVISOR]: {
          allowed: ['Dashboard', 'Orders', 'Customers', 'Fitters', 'Reports', 'Find Saddle'], // Suppliers moved to Account Management
          denied: ['Suppliers']
        }
      };

      Object.entries(roleNavigationMap).forEach(([role, expected]) => {
        mockUseUserRole.mockReturnValue({
          role: role as UserRole,
          hasRole: jest.fn()
        });

        render(<Sidebar />);

        // Check allowed items are present
        expected.allowed.forEach(item => {
          expect(screen.getByText(item)).toBeInTheDocument();
        });

        // Check denied items are not present
        expected.denied.forEach(item => {
          expect(screen.queryByText(item)).not.toBeInTheDocument();
        });
      });
    });
  });
});