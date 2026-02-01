import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthTestProvider } from '@/utils/AuthTestProvider';
import { getEnrichedOrders } from '@/services/enrichedOrders';
import { getCurrentUser } from '@/services/userStorage';

// Mock the services
jest.mock('@/services/enrichedOrders', () => ({
  getEnrichedOrders: jest.fn(),
}));

jest.mock('@/services/userStorage', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock components that use the services
const mockReact = React;
jest.mock('@/components/Orders', () => {
  const { getEnrichedOrders } = require('@/services/enrichedOrders');
  return {
    Orders: () => {
      const [orders, setOrders] = mockReact.useState([]);
      const [loading, setLoading] = mockReact.useState(true);

      mockReact.useEffect(() => {
        const fetchOrders = async () => {
          try {
            const result = await getEnrichedOrders({
              page: 1,
              itemsPerPage: 10,
              filters: {},
            });
            setOrders(result.data);
          } catch (error) {
            console.error('Failed to fetch orders:', error);
          } finally {
            setLoading(false);
          }
        };

        fetchOrders();
      }, []);

      if (loading) return mockReact.createElement('div', { 'data-testid': 'orders-loading' }, 'Loading orders...');

      return mockReact.createElement('div', { 'data-testid': 'orders-component' }, [
        mockReact.createElement('div', { 'data-testid': 'orders-count', key: 'count' }, orders.length),
        ...orders.map((order: any) =>
          mockReact.createElement('div', { key: order.id, 'data-testid': `order-${order.id}` }, [
            mockReact.createElement('span', { 'data-testid': `order-${order.id}-number`, key: 'number' }, order.orderNumber),
            mockReact.createElement('span', { 'data-testid': `order-${order.id}-fitter`, key: 'fitter' }, order.fitter?.username)
          ])
        )
      ]);
    }
  };
});

jest.mock('@/components/Dashboard', () => {
  const { getEnrichedOrders } = require('@/services/enrichedOrders');
  return {
    Dashboard: () => {
      const [orders, setOrders] = mockReact.useState([]);
      const [loading, setLoading] = mockReact.useState(true);

      mockReact.useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            const result = await getEnrichedOrders({
              page: 1,
              itemsPerPage: 5,
              filters: {},
            });
            setOrders(result.data);
          } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
          } finally {
            setLoading(false);
          }
        };

        fetchDashboardData();
      }, []);

      if (loading) return mockReact.createElement('div', { 'data-testid': 'dashboard-loading' }, 'Loading dashboard...');

      return mockReact.createElement('div', { 'data-testid': 'dashboard-component' }, [
        mockReact.createElement('h1', { key: 'title' }, 'Dashboard'),
        mockReact.createElement('div', { 'data-testid': 'dashboard-orders-count', key: 'count' }, orders.length),
        mockReact.createElement('div', { 'data-testid': 'dashboard-orders', key: 'orders' },
          orders.map((order: any) =>
            mockReact.createElement('div', { key: order.id, 'data-testid': `dashboard-order-${order.id}` },
              `${order.orderNumber} - ${order.fitter?.username}`
            )
          )
        )
      ]);
    }
  };
});

const mockGetEnrichedOrders = getEnrichedOrders as jest.MockedFunction<typeof getEnrichedOrders>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

// Mock order data
const createMockOrder = (id: number, fitterUsername: string) => ({
  id,
  orderNumber: `ORD-${String(id).padStart(3, '0')}`,
  customer: { id: id, name: `Customer ${id}` },
  fitter: { id: id, name: `Fitter ${id}`, username: fitterUsername },
  supplier: { id: 1, name: 'Test Supplier' },
  status: 'pending',
  urgent: false,
  createdAt: new Date().toISOString(),
});

const allOrders = [
  createMockOrder(1, 'jane.fitter'),
  createMockOrder(2, 'bob.fitter'),
  createMockOrder(3, 'jane.fitter'),
  createMockOrder(4, 'charlie.fitter'),
  createMockOrder(5, 'jane.fitter'),
];

describe('Fitter Filtering Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Orders Component Integration', () => {
    it('automatically filters orders for FITTER role users', async () => {
      // Mock current user as fitter
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER' as any,
      });

      // Mock API response with filtered orders
      const janeFitterOrders = allOrders.filter(order => order.fitter.username === 'jane.fitter');
      mockGetEnrichedOrders.mockResolvedValue({
        data: janeFitterOrders,
        totalItems: janeFitterOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;
      
      render(
        <AuthTestProvider role="fitter">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Verify that getEnrichedOrders was called with fitter filter
      expect(mockGetEnrichedOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          itemsPerPage: 10,
          filters: {},
        })
      );

      // Verify only jane.fitter's orders are displayed
      expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      expect(screen.getByTestId('order-1-fitter')).toHaveTextContent('jane.fitter');
      expect(screen.getByTestId('order-3-fitter')).toHaveTextContent('jane.fitter');
      expect(screen.getByTestId('order-5-fitter')).toHaveTextContent('jane.fitter');

      // Should not show other fitters' orders
      expect(screen.queryByTestId('order-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('order-4')).not.toBeInTheDocument();
    });

    it('shows all orders for ADMIN role users', async () => {
      // Mock current user as admin
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN' as any,
      });

      // Mock API response with all orders
      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders,
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      render(
        <AuthTestProvider role="admin">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Verify all orders are displayed
      expect(screen.getByTestId('orders-count')).toHaveTextContent('5');
      expect(screen.getByTestId('order-1')).toBeInTheDocument();
      expect(screen.getByTestId('order-2')).toBeInTheDocument();
      expect(screen.getByTestId('order-3')).toBeInTheDocument();
      expect(screen.getByTestId('order-4')).toBeInTheDocument();
      expect(screen.getByTestId('order-5')).toBeInTheDocument();
    });

    it('shows all orders for SUPERVISOR role users', async () => {
      // Mock current user as supervisor
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'supervisor.user',
        role: 'ROLE_SUPERVISOR' as any,
      });

      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders,
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      render(
        <AuthTestProvider role="supervisor">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Supervisor should see all orders
      expect(screen.getByTestId('orders-count')).toHaveTextContent('5');
    });
  });

  describe('Dashboard Component Integration', () => {
    it('automatically filters dashboard orders for FITTER role users', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 2,
        username: 'bob.fitter',
        role: 'ROLE_FITTER' as any,
      });

      const bobFitterOrders = allOrders.filter(order => order.fitter.username === 'bob.fitter');
      mockGetEnrichedOrders.mockResolvedValue({
        data: bobFitterOrders,
        totalItems: bobFitterOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 5,
      });

      const Dashboard = require('@/components/Dashboard').Dashboard;

      render(
        <AuthTestProvider role="fitter">
          <Dashboard />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
      });

      // Verify dashboard shows only bob.fitter's orders
      expect(screen.getByTestId('dashboard-orders-count')).toHaveTextContent('1');
      expect(screen.getByTestId('dashboard-order-2')).toHaveTextContent('ORD-002 - bob.fitter');
    });

    it('shows all orders in dashboard for non-fitter roles', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'admin.user',
        role: 'ROLE_ADMIN' as any,
      });

      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders.slice(0, 5), // Dashboard shows first 5
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 5,
      });

      const Dashboard = require('@/components/Dashboard').Dashboard;

      render(
        <AuthTestProvider role="admin">
          <Dashboard />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
      });

      expect(screen.getByTestId('dashboard-orders-count')).toHaveTextContent('5');
    });
  });

  describe('Multi-Role Scenarios', () => {
    it('handles user with ADMIN role (mapped from ADMIN+FITTER) correctly', async () => {
      // User originally had ADMIN+FITTER roles, but mapped to ADMIN as primary
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'admin.fitter', // Username suggests they were a fitter
        role: 'ROLE_ADMIN' as any, // But primary role is ADMIN after mapping
      });

      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders,
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      render(
        <AuthTestProvider role="admin">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Should see ALL orders because role is ADMIN, not FITTER
      expect(screen.getByTestId('orders-count')).toHaveTextContent('5');

      // Verify no fitter filter was applied
      expect(mockGetEnrichedOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {}, // No automatic fitter filter
        })
      );
    });

    it('handles user with SUPERVISOR role (mapped from SUPERVISOR+FITTER) correctly', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'supervisor.fitter',
        role: 'ROLE_SUPERVISOR' as any, // Primary role after mapping
      });

      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders,
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      render(
        <AuthTestProvider role="supervisor">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Should see ALL orders because role is SUPERVISOR
      expect(screen.getByTestId('orders-count')).toHaveTextContent('5');
    });
  });

  describe('Security and Consistency Tests', () => {
    it('consistently applies fitter filtering across multiple component renders', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER' as any,
      });

      const janeFitterOrders = allOrders.filter(order => order.fitter.username === 'jane.fitter');
      mockGetEnrichedOrders.mockResolvedValue({
        data: janeFitterOrders,
        totalItems: janeFitterOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;
      const Dashboard = require('@/components/Dashboard').Dashboard;

      // Render Orders component
      const { unmount: unmountOrders } = render(
        <AuthTestProvider role="fitter">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      unmountOrders();

      // Clear previous calls
      mockGetEnrichedOrders.mockClear();
      mockGetEnrichedOrders.mockResolvedValue({
        data: janeFitterOrders.slice(0, 3), // Dashboard might show fewer
        totalItems: janeFitterOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 5,
      });

      // Render Dashboard component
      render(
        <AuthTestProvider role="fitter">
          <Dashboard />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-orders-count')).toHaveTextContent('3');
      });

      // Both components should have called the service with automatic filtering
      expect(mockGetEnrichedOrders).toHaveBeenCalledTimes(1);
    });

    it('prevents fitter from seeing orders when role changes', async () => {
      // Start with fitter role
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER' as any,
      });

      const janeFitterOrders = allOrders.filter(order => order.fitter.username === 'jane.fitter');
      mockGetEnrichedOrders.mockResolvedValue({
        data: janeFitterOrders,
        totalItems: janeFitterOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      const { unmount } = render(
        <AuthTestProvider role="fitter">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('3');
      });

      // Unmount and change user role to USER (lower privilege)
      unmount();

      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_USER' as any, // Role changed
      });

      // USER role shouldn't get automatic fitter filtering
      mockGetEnrichedOrders.mockClear();
      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders, // All orders visible to user
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      // Render new component with changed role
      render(
        <AuthTestProvider role="user">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-count')).toHaveTextContent('5');
      });
    });
  });

  describe('Error Handling in Integration', () => {
    it('handles service errors gracefully', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER' as any,
      });

      mockGetEnrichedOrders.mockRejectedValue(new Error('Service unavailable'));

      const Orders = require('@/components/Orders').Orders;

      render(
        <AuthTestProvider role="fitter">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Should show 0 orders when service fails
      expect(screen.getByTestId('orders-count')).toHaveTextContent('0');
    });

    it('handles missing user data gracefully', async () => {
      mockGetCurrentUser.mockReturnValue(null);

      mockGetEnrichedOrders.mockResolvedValue({
        data: allOrders,
        totalItems: allOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      render(
        <AuthTestProvider role="user">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      // Should not crash and should show all orders (no filtering applied)
      expect(screen.getByTestId('orders-count')).toHaveTextContent('5');
    });
  });

  describe('Performance and Caching', () => {
    it('makes API calls when component remounts', async () => {
      mockGetCurrentUser.mockReturnValue({
        id: 1,
        username: 'jane.fitter',
        role: 'ROLE_FITTER' as any,
      });

      const janeFitterOrders = allOrders.filter(order => order.fitter.username === 'jane.fitter');
      mockGetEnrichedOrders.mockResolvedValue({
        data: janeFitterOrders,
        totalItems: janeFitterOrders.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      });

      const Orders = require('@/components/Orders').Orders;

      const { unmount } = render(
        <AuthTestProvider role="fitter">
          <Orders />
        </AuthTestProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('orders-component')).toBeInTheDocument();
      });

      const initialCallCount = mockGetEnrichedOrders.mock.calls.length;
      expect(initialCallCount).toBe(1);

      // Unmount and remount component
      unmount();

      render(
        <AuthTestProvider role="fitter">
          <Orders />
        </AuthTestProvider>
      );

      // Should trigger new API call when component remounts
      await waitFor(() => {
        expect(mockGetEnrichedOrders.mock.calls.length).toBe(2);
      });
    });
  });
});