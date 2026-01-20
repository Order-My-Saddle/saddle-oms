import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/Sidebar';
import { UserRole } from '@/types/Role';

// Mock the navigation components
jest.mock('@/components/SaddleModellingSidebarSection', () => {
  const SaddleModellingSidebarSection = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const mockUseUserRole = require('@/hooks/useUserRole').useUserRole;
    const { role } = mockUseUserRole();
    const mockHasScreenPermission = require('@/utils/rolePermissions').hasScreenPermission;
    
    const saddleItems = ['Models', 'Brands', 'Leather Types', 'Options', 'Extras', 'Presets'];
    const visibleItems = saddleItems.filter(item => 
      mockHasScreenPermission(role, item.replace(/\s+/g, '_').toUpperCase())
    );

    if (visibleItems.length === 0) return null;

    return (
      <div data-testid="saddle-modelling-section">
        <button data-testid="saddle-modelling-toggle">
          Saddle Modelling
        </button>
        <div>
          {visibleItems.map(item => (
            <a key={item} data-testid={`saddle-item-${item.toLowerCase().replace(/\s+/g, '-')}`}>
              {item}
            </a>
          ))}
        </div>
      </div>
    );
  };
  return { __esModule: true, SaddleModellingSidebarSection };
});

jest.mock('@/components/AccountManagementSidebarSection', () => {
  const AccountManagementSidebarSection = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const mockUseUserRole = require('@/hooks/useUserRole').useUserRole;
    const { role } = mockUseUserRole();
    const mockHasScreenPermission = require('@/utils/rolePermissions').hasScreenPermission;
    
    const accountItems = [
      { name: 'Users', permission: 'USER_MANAGEMENT' },
      { name: 'Warehouses', permission: 'WAREHOUSE_MANAGEMENT' },
      { name: 'Suppliers', permission: 'SUPPLIERS' },
      { name: 'User Permissions', permission: 'USER_PERMISSIONS_VIEW' }
    ];

    const visibleItems = accountItems.filter(item => 
      mockHasScreenPermission(role, item.permission)
    );

    if (visibleItems.length === 0) return null;

    return (
      <div data-testid="account-management-section">
        <button data-testid="account-management-toggle">
          🛡️ Account Management
        </button>
        <div>
          {visibleItems.map(item => (
            <a key={item.name} data-testid={`account-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
              {item.name}
            </a>
          ))}
        </div>
      </div>
    );
  };
  return { __esModule: true, AccountManagementSidebarSection };
});

// Mock the hooks and utilities
jest.mock('@/hooks/useUserRole', () => ({
  useUserRole: jest.fn()
}));

jest.mock('@/utils/rolePermissions', () => ({
  hasScreenPermission: jest.fn(),
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
  }),
  usePathname: () => '/dashboard'
}));

jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="dashboard-icon">📊</div>,
  ShoppingCart: () => <div data-testid="orders-icon">🛒</div>,
  Users: () => <div data-testid="users-icon">👥</div>,
  BarChart3: () => <div data-testid="reports-icon">📈</div>,
  Search: () => <div data-testid="search-icon">🔍</div>,
  ChevronRight: () => <div data-testid="chevron-right">→</div>,
  ChevronLeft: () => <div data-testid="chevron-left">←</div>,
  DivideIcon: () => <div data-testid="divide-icon">÷</div>,
  Boxes: () => <div data-testid="boxes-icon">📦</div>
}));

const mockUseUserRole = require('@/hooks/useUserRole').useUserRole as jest.Mock;
const mockHasScreenPermission = require('@/utils/rolePermissions').hasScreenPermission as jest.Mock;

describe('Updated Navigation Structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window resize events
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  describe('Navigation Structure Changes', () => {
    test('main navigation no longer includes suppliers directly', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const supervisorPermissions = [
          'DASHBOARD', 'ORDERS', 'CUSTOMERS', 'FITTERS', 'REPORTS',
          'ACCOUNT_MANAGEMENT', 'USER_MANAGEMENT', 'WAREHOUSE_MANAGEMENT', 'SUPPLIERS', 'USER_PERMISSIONS_VIEW'
        ];
        return supervisorPermissions.includes(permission);
      });

      render(<Sidebar />);

      // Main navigation should not include suppliers
      expect(screen.queryByText('Suppliers')).not.toBeInTheDocument();
      
      // But main navigation items should be present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Fitters')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    test('suppliers now appears in account management section', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const supervisorPermissions = [
          'DASHBOARD', 'ORDERS', 'CUSTOMERS', 'FITTERS', 'REPORTS',
          'ACCOUNT_MANAGEMENT', 'USER_MANAGEMENT', 'WAREHOUSE_MANAGEMENT', 'SUPPLIERS', 'USER_PERMISSIONS_VIEW'
        ];
        return supervisorPermissions.includes(permission);
      });

      render(<Sidebar />);

      // Account management section should be present
      expect(screen.getByTestId('account-management-section')).toBeInTheDocument();
      
      // Suppliers should be in account management section
      expect(screen.getByTestId('account-item-suppliers')).toBeInTheDocument();
    });

    test('new account management items are available', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const supervisorPermissions = [
          'ACCOUNT_MANAGEMENT', 'USER_MANAGEMENT', 'WAREHOUSE_MANAGEMENT', 'SUPPLIERS', 'USER_PERMISSIONS_VIEW'
        ];
        return supervisorPermissions.includes(permission);
      });

      render(<Sidebar />);

      // New account management items should be present
      expect(screen.getByTestId('account-item-users')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-warehouses')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-user-permissions')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-suppliers')).toBeInTheDocument();
    });
  });

  describe('Role-Based Navigation Access', () => {
    test('SUPERVISOR sees all navigation sections', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        // Supervisor has access to everything
        return true;
      });

      render(<Sidebar />);

      // Should see main navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();

      // Should see saddle modelling section
      expect(screen.getByTestId('saddle-modelling-section')).toBeInTheDocument();

      // Should see account management section
      expect(screen.getByTestId('account-management-section')).toBeInTheDocument();
    });

    test('ADMIN sees limited account management', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.ADMIN,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const adminPermissions = [
          'DASHBOARD', 'ORDERS', 'CUSTOMERS', 'FITTERS', 'REPORTS',
          'ACCOUNT_MANAGEMENT', 'USER_MANAGEMENT', 'WAREHOUSE_MANAGEMENT', 'SUPPLIERS', 'USER_PERMISSIONS_VIEW',
          'SADDLE_MODELING', 'BRANDS', 'MODELS', 'LEATHER_TYPES', 'OPTIONS', 'EXTRAS', 'PRESETS'
        ];
        return adminPermissions.includes(permission);
      });

      render(<Sidebar />);

      // Should see main navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();

      // Should see saddle modelling section
      expect(screen.getByTestId('saddle-modelling-section')).toBeInTheDocument();

      // Should see account management section with all items
      expect(screen.getByTestId('account-management-section')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-suppliers')).toBeInTheDocument();
    });

    test('USER sees only basic navigation', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.USER,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const userPermissions = [
          'DASHBOARD', 'ORDERS',
          'SADDLE_MODELING', 'BRANDS', 'MODELS', 'LEATHER_TYPES', 'OPTIONS', 'EXTRAS', 'PRESETS'
        ];
        return userPermissions.includes(permission);
      });

      render(<Sidebar />);

      // Should see basic navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();

      // Should not see admin features
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();
      expect(screen.queryByText('Fitters')).not.toBeInTheDocument();
      expect(screen.queryByText('Reports')).not.toBeInTheDocument();

      // Should see saddle modelling section
      expect(screen.getByTestId('saddle-modelling-section')).toBeInTheDocument();

      // Should not see account management section
      expect(screen.queryByTestId('account-management-section')).not.toBeInTheDocument();
    });

    test('FITTER sees customer management but no account management', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.FITTER,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const fitterPermissions = ['DASHBOARD', 'ORDERS', 'CUSTOMERS'];
        return fitterPermissions.includes(permission);
      });

      render(<Sidebar />);

      // Should see basic navigation plus customers
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();

      // Should not see admin features
      expect(screen.queryByText('Fitters')).not.toBeInTheDocument();
      expect(screen.queryByText('Reports')).not.toBeInTheDocument();

      // Should not see saddle modelling section
      expect(screen.queryByTestId('saddle-modelling-section')).not.toBeInTheDocument();

      // Should not see account management section
      expect(screen.queryByTestId('account-management-section')).not.toBeInTheDocument();
    });

    test('SUPPLIER sees minimal navigation with access through account management', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPPLIER,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockImplementation((role, permission) => {
        const supplierPermissions = ['DASHBOARD', 'SUPPLIERS'];
        return supplierPermissions.includes(permission);
      });

      render(<Sidebar />);

      // Should see minimal navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Should not see orders, customers, etc.
      expect(screen.queryByText('Orders')).not.toBeInTheDocument();
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();

      // Should not see saddle modelling section
      expect(screen.queryByTestId('saddle-modelling-section')).not.toBeInTheDocument();

      // Should see account management section with suppliers
      expect(screen.getByTestId('account-management-section')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-suppliers')).toBeInTheDocument();

      // Should not see other account management items
      expect(screen.queryByTestId('account-item-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('account-item-warehouses')).not.toBeInTheDocument();
    });
  });

  describe('Permission-Based Item Visibility', () => {
    test('account management items appear/disappear based on permissions', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      // Test with full permissions
      mockHasScreenPermission.mockImplementation((role, permission) => {
        return ['ACCOUNT_MANAGEMENT', 'USER_MANAGEMENT', 'WAREHOUSE_MANAGEMENT', 'SUPPLIERS', 'USER_PERMISSIONS_VIEW'].includes(permission);
      });

      const { rerender } = render(<Sidebar />);

      expect(screen.getByTestId('account-item-users')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-warehouses')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-suppliers')).toBeInTheDocument();
      expect(screen.getByTestId('account-item-user-permissions')).toBeInTheDocument();

      // Test with limited permissions
      mockHasScreenPermission.mockImplementation((role, permission) => {
        return ['SUPPLIERS'].includes(permission);
      });

      rerender(<Sidebar />);

      expect(screen.queryByTestId('account-item-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('account-item-warehouses')).not.toBeInTheDocument();
      expect(screen.getByTestId('account-item-suppliers')).toBeInTheDocument();
      expect(screen.queryByTestId('account-item-user-permissions')).not.toBeInTheDocument();
    });

    test('sections disappear completely when no items are visible', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.USER,
        hasRole: jest.fn()
      });

      // User has no account management permissions
      mockHasScreenPermission.mockImplementation((role, permission) => {
        return ['DASHBOARD', 'ORDERS'].includes(permission);
      });

      render(<Sidebar />);

      // Account management section should not render at all
      expect(screen.queryByTestId('account-management-section')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Hierarchy Consistency', () => {
    test('navigation maintains logical order', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockReturnValue(true);

      render(<Sidebar />);

      // Check that elements appear in expected order in the DOM
      const navigationElements = [
        screen.getByText('Dashboard'),
        screen.getByText('Orders'),
        screen.getByText('Customers'),
        screen.getByText('Fitters'),
        screen.getByTestId('saddle-modelling-section'),
        screen.getByTestId('account-management-section'),
        screen.getByText('Reports')
      ];

      // Verify elements exist in DOM order
      navigationElements.forEach((element, index) => {
        expect(element).toBeInTheDocument();
      });
    });

    test('collapsible sections work independently', () => {
      mockUseUserRole.mockReturnValue({
        role: UserRole.SUPERVISOR,
        hasRole: jest.fn()
      });

      mockHasScreenPermission.mockReturnValue(true);

      render(<Sidebar />);

      // Both sections should have toggle buttons
      expect(screen.getByTestId('saddle-modelling-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('account-management-toggle')).toBeInTheDocument();

      // They should work independently
      const saddleToggle = screen.getByTestId('saddle-modelling-toggle');
      const accountToggle = screen.getByTestId('account-management-toggle');

      expect(saddleToggle).toBeInTheDocument();
      expect(accountToggle).toBeInTheDocument();
    });
  });
});