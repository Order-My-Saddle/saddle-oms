import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrdersTable } from '@/components/shared/OrdersTable';
import { AuthTestProvider } from '@/utils/AuthTestProvider';
import type { OrdersTableColumn } from '@/components/shared/OrdersTable';
import type { Order } from '@/types/Order';

const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    customer: { id: 1, name: 'John Customer' },
    fitter: { id: 1, name: 'Jane Fitter' },
    supplier: { id: 1, name: 'Acme Supplier' },
    status: 'pending',
    urgent: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    seatSize: 'M',
    reference: 'REF-001',
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    customer: { id: 2, name: 'Alice Customer' },
    fitter: { id: 2, name: 'Bob Fitter' },
    supplier: { id: 2, name: 'Beta Supplier' },
    status: 'approved',
    urgent: true,
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    seatSize: 'L',
    reference: 'REF-002',
  },
];

const mockColumns: OrdersTableColumn[] = [
  { key: 'orderNumber', title: 'Order Number' },
  { key: 'customer', title: 'Customer' },
  { key: 'status', title: 'Status' },
  { key: 'urgent', title: 'Urgent' },
  { key: 'createdAt', title: 'Created' },
];

const mockPagination = {
  currentPage: 1,
  totalPages: 2,
  onPageChange: jest.fn(),
  totalItems: 15,
  itemsPerPage: 10,
};

const mockSeatSizes = ['S', 'M', 'L', 'XL'];
const mockStatuses = ['pending', 'approved', 'completed', 'cancelled'];
const mockFitters = [
  { id: 1, name: 'Jane Fitter' },
  { id: 2, name: 'Bob Fitter' },
];

const defaultProps = {
  orders: mockOrders,
  columns: mockColumns,
  pagination: mockPagination,
  searchTerm: '',
  onSearch: jest.fn(),
  headerFilters: {},
  onFilterChange: jest.fn(),
  onViewOrder: jest.fn(),
  onEditOrder: jest.fn(),
  onApproveOrder: jest.fn(),
  onDeleteOrder: jest.fn(),
  seatSizes: mockSeatSizes,
  statuses: mockStatuses,
  fitters: mockFitters,
  dateFrom: null,
  setDateFrom: jest.fn(),
  dateTo: null,
  setDateTo: jest.fn(),
};

const renderWithAuth = (ui: React.ReactElement, userRole = 'admin') => {
  return render(
    <AuthTestProvider role={userRole}>
      {ui}
    </AuthTestProvider>
  );
};

describe('OrdersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders orders table with data', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('ORD-002')).toBeInTheDocument();
      expect(screen.getByText('John Customer')).toBeInTheDocument();
      expect(screen.getByText('Alice Customer')).toBeInTheDocument();
    });

    it('displays column headers', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('Order Number')).toBeInTheDocument();
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search input', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search orders...')).toBeInTheDocument();
    });

    it('calls onSearch when search term changes', async () => {
      const user = userEvent.setup();
      const onSearchMock = jest.fn();

      renderWithAuth(
        <OrdersTable {...defaultProps} onSearch={onSearchMock} />
      );

      const searchInput = screen.getByPlaceholderText('Search orders...');
      await user.type(searchInput, 'ORD-001');

      await waitFor(() => {
        expect(onSearchMock).toHaveBeenCalledWith('ORD-001');
      });
    });

    it('displays current search term', () => {
      renderWithAuth(
        <OrdersTable {...defaultProps} searchTerm="existing search" />
      );

      const searchInput = screen.getByPlaceholderText('Search orders...');
      expect(searchInput).toHaveValue('existing search');
    });
  });

  describe('Header Filters', () => {
    it('renders header filters for filterable columns', () => {
      const columnsWithFilters: OrdersTableColumn[] = [
        { key: 'status', title: 'Status', filter: true },
        { key: 'urgent', title: 'Urgent', filter: true },
        { key: 'seatSize', title: 'Seat Size', filter: true },
      ];

      renderWithAuth(
        <OrdersTable {...defaultProps} columns={columnsWithFilters} />
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('Seat Size')).toBeInTheDocument();
    });

    it('calls onFilterChange when filter is applied', async () => {
      const user = userEvent.setup();
      const onFilterChangeMock = jest.fn();
      const columnsWithFilters: OrdersTableColumn[] = [
        { key: 'status', title: 'Status', filter: true },
      ];

      renderWithAuth(
        <OrdersTable 
          {...defaultProps} 
          columns={columnsWithFilters}
          onFilterChange={onFilterChangeMock}
        />
      );

      const filterButton = screen.getByText('Status');
      await user.click(filterButton);

      await waitFor(() => {
        expect(onFilterChangeMock).toHaveBeenCalled();
      });
    });
  });

  describe('Date Range Filtering', () => {
    it('renders date range picker', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('calls setDateFrom when from date is selected', async () => {
      const user = userEvent.setup();
      const setDateFromMock = jest.fn();

      renderWithAuth(
        <OrdersTable {...defaultProps} setDateFrom={setDateFromMock} />
      );

      const dateRangeButton = screen.getByText('Date Range');
      await user.click(dateRangeButton);

      // This would need more complex date picker interaction
      // The exact implementation depends on the date picker component used
    });
  });

  describe('Action Buttons', () => {
    describe('Admin Role', () => {
      it('renders all action buttons for admin', () => {
        renderWithAuth(<OrdersTable {...defaultProps} />, 'admin');

        expect(screen.getAllByText('View')).toHaveLength(mockOrders.length);
        expect(screen.getAllByText('Edit')).toHaveLength(mockOrders.length);
        expect(screen.getAllByText('Approve')).toHaveLength(mockOrders.length);
        expect(screen.getAllByText('Delete')).toHaveLength(mockOrders.length);
      });

      it('calls onViewOrder when View button is clicked', async () => {
        const user = userEvent.setup();
        const onViewOrderMock = jest.fn();

        renderWithAuth(
          <OrdersTable {...defaultProps} onViewOrder={onViewOrderMock} />,
          'admin'
        );

        const viewButtons = screen.getAllByText('View');
        await user.click(viewButtons[0]);

        expect(onViewOrderMock).toHaveBeenCalledWith(mockOrders[0]);
      });

      it('calls onEditOrder when Edit button is clicked', async () => {
        const user = userEvent.setup();
        const onEditOrderMock = jest.fn();

        renderWithAuth(
          <OrdersTable {...defaultProps} onEditOrder={onEditOrderMock} />,
          'admin'
        );

        const editButtons = screen.getAllByText('Edit');
        await user.click(editButtons[0]);

        expect(onEditOrderMock).toHaveBeenCalledWith(mockOrders[0]);
      });

      it('calls onApproveOrder when Approve button is clicked', async () => {
        const user = userEvent.setup();
        const onApproveOrderMock = jest.fn();

        renderWithAuth(
          <OrdersTable {...defaultProps} onApproveOrder={onApproveOrderMock} />,
          'admin'
        );

        const approveButtons = screen.getAllByText('Approve');
        await user.click(approveButtons[0]);

        expect(onApproveOrderMock).toHaveBeenCalledWith(mockOrders[0]);
      });

      it('calls onDeleteOrder when Delete button is clicked', async () => {
        const user = userEvent.setup();
        const onDeleteOrderMock = jest.fn();

        renderWithAuth(
          <OrdersTable {...defaultProps} onDeleteOrder={onDeleteOrderMock} />,
          'admin'
        );

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        expect(onDeleteOrderMock).toHaveBeenCalledWith(mockOrders[0]);
      });
    });

    describe('Manager Role', () => {
      it('renders appropriate buttons for manager', () => {
        renderWithAuth(<OrdersTable {...defaultProps} />, 'manager');

        expect(screen.getAllByText('View')).toHaveLength(mockOrders.length);
        expect(screen.getAllByText('Edit')).toHaveLength(mockOrders.length);
        expect(screen.getAllByText('Approve')).toHaveLength(mockOrders.length);
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
      });
    });

    describe('Fitter Role', () => {
      it('renders limited buttons for fitter', () => {
        renderWithAuth(<OrdersTable {...defaultProps} />, 'fitter');

        expect(screen.getAllByText('View')).toHaveLength(mockOrders.length);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
      });
    });

    describe('User Role', () => {
      it('renders minimal buttons for user', () => {
        renderWithAuth(<OrdersTable {...defaultProps} />, 'user');

        expect(screen.getAllByText('View')).toHaveLength(mockOrders.length);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
      });
    });
  });

  describe('Button Tooltips', () => {
    it('shows tooltips on action buttons', async () => {
      const user = userEvent.setup();
      renderWithAuth(<OrdersTable {...defaultProps} />, 'admin');

      const viewButton = screen.getAllByText('View')[0];
      await user.hover(viewButton);

      await waitFor(() => {
        expect(screen.getByText('View order details')).toBeInTheDocument();
      });
    });
  });

  describe('Status Rendering', () => {
    it('renders status badges correctly', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      // This would depend on how status is rendered in the actual component
      // Assuming status badges are rendered with specific classes
      const statusElements = screen.getAllByText(/pending|approved/i);
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  describe('Urgent Orders', () => {
    it('highlights urgent orders', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      // This would depend on how urgent orders are visually distinguished
      // The exact test would depend on the implementation
    });
  });

  describe('Pagination Integration', () => {
    it('passes pagination props to DataTable', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Showing 1-10 of 15 items')).toBeInTheDocument();
    });

    it('calls pagination onPageChange', async () => {
      const user = userEvent.setup();
      const onPageChangeMock = jest.fn();
      const paginationWithMock = {
        ...mockPagination,
        onPageChange: onPageChangeMock,
      };

      renderWithAuth(
        <OrdersTable {...defaultProps} pagination={paginationWithMock} />
      );

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      expect(onPageChangeMock).toHaveBeenCalledWith(2);
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      renderWithAuth(<OrdersTable {...defaultProps} loading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      const errorMessage = 'Failed to load orders';
      renderWithAuth(<OrdersTable {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no orders', () => {
      renderWithAuth(<OrdersTable {...defaultProps} orders={[]} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows no search results message', () => {
      renderWithAuth(
        <OrdersTable {...defaultProps} orders={[]} searchTerm="nonexistent" />
      );

      expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('formats dates correctly', () => {
      renderWithAuth(<OrdersTable {...defaultProps} />);

      // This would test that dates are formatted properly
      // The exact assertion would depend on the date formatting implementation
    });

    it('handles missing customer data gracefully', () => {
      const ordersWithMissingData = [
        {
          ...mockOrders[0],
          customer: null,
        },
      ];

      renderWithAuth(
        <OrdersTable {...defaultProps} orders={ordersWithMissingData} />
      );

      // Should not crash and should handle null customer gracefully
    });
  });

  describe('Filter Data Props', () => {
    it('uses provided seat sizes for filtering', () => {
      const customSeatSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      renderWithAuth(
        <OrdersTable {...defaultProps} seatSizes={customSeatSizes} />
      );

      // This would test that the custom seat sizes are used in filters
      // The exact test depends on how filters are implemented
    });

    it('uses provided statuses for filtering', () => {
      const customStatuses = ['draft', 'pending', 'approved', 'shipped', 'delivered'];
      renderWithAuth(
        <OrdersTable {...defaultProps} statuses={customStatuses} />
      );

      // This would test that the custom statuses are used in filters
    });

    it('uses provided fitters for filtering', () => {
      const customFitters = [
        { id: 3, name: 'Charlie Fitter' },
        { id: 4, name: 'Diana Fitter' },
      ];
      renderWithAuth(
        <OrdersTable {...defaultProps} fitters={customFitters} />
      );

      // This would test that the custom fitters are used in filters
    });
  });
});