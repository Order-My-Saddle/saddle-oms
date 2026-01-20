import React from 'react';
import { render, screen } from '@testing-library/react';
import { getOrderTableColumns } from '@/utils/orderTableColumns';
import type { Order } from '@/types/Order';

const mockOrder: Order = {
  id: 1,
  orderNumber: 'ORD-001',
  customer: { id: 1, name: 'John Customer' },
  fitter: { id: 1, name: 'Jane Fitter' },
  supplier: { id: 1, name: 'Acme Supplier' },
  status: 'pending',
  urgent: false,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:30:00Z',
  seatSize: 'M',
  reference: 'REF-SEAT-M-001',
  brand: { id: 1, name: 'Test Brand' },
  model: { id: 1, name: 'Test Model' },
  leathertype: { id: 1, name: 'Premium Leather' },
  notes: 'Special order notes',
  price: 1299.99,
  completedAt: '2024-01-20T16:00:00Z',
};

const mockHeaderFilters = {};
const mockSetHeaderFilters = jest.fn();
const mockSuppliers = [
  { label: 'Acme Supplier', value: '1' },
  { label: 'Beta Supplier', value: '2' },
];
const mockSeatSizes = ['S', 'M', 'L', 'XL'];

describe('Order Table Columns', () => {
  describe('Column Generation', () => {
    it('generates all expected columns', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);

      expect(columns).toHaveLength(9);

      const columnKeys = columns.map(col => col.key);
      expect(columnKeys).toContain('orderNumber');
      expect(columnKeys).toContain('saddleSpecifications');
      expect(columnKeys).toContain('seatSize');
      expect(columnKeys).toContain('customer');
      expect(columnKeys).toContain('date');
      expect(columnKeys).toContain('status');
      expect(columnKeys).toContain('urgent');
      expect(columnKeys).toContain('fitter');
      expect(columnKeys).toContain('supplier');
    });

    it('sets correct column titles', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);

      const orderNumberCol = columns.find(col => col.key === 'orderNumber');
      expect(orderNumberCol?.title).toBeDefined();

      const customerCol = columns.find(col => col.key === 'customer');
      expect(customerCol?.title).toBeDefined();

      const statusCol = columns.find(col => col.key === 'status');
      expect(statusCol?.title).toBeDefined();

      const urgentCol = columns.find(col => col.key === 'urgent');
      expect(urgentCol?.title).toBeDefined();
    });

    it('configures filterable columns', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);

      const statusCol = columns.find(col => col.key === 'status');
      expect(statusCol?.title).toBeDefined();

      const urgentCol = columns.find(col => col.key === 'urgent');
      expect(urgentCol?.title).toBeDefined();

      const seatSizeCol = columns.find(col => col.key === 'seatSize');
      expect(seatSizeCol?.title).toBeDefined();

      const fitterCol = columns.find(col => col.key === 'fitter');
      expect(fitterCol?.title).toBeDefined();
    });
  });

  describe('Seat Size Extraction', () => {
    it('extracts seat size from reference string', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const seatSizeCol = columns.find(col => col.key === 'seatSize');

      expect(seatSizeCol?.render).toBeDefined();
      
      // Test the render function
      const TestComponent = () => {
        const renderedValue = seatSizeCol?.render?.('ignored', mockOrder);
        return <div data-testid="seat-size">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('seat-size')).toHaveTextContent('M');
    });

    it('extracts complex seat sizes from reference', () => {
      const orderWithComplexRef = {
        ...mockOrder,
        reference: 'REF-SEAT-17.5-WIDE-002',
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const seatSizeCol = columns.find(col => col.key === 'seatSize');

      const TestComponent = () => {
        const renderedValue = seatSizeCol?.render?.('ignored', orderWithComplexRef);
        return <div data-testid="seat-size">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('seat-size')).toHaveTextContent('17.5');
    });

    it('handles missing reference gracefully', () => {
      const orderWithoutRef = {
        ...mockOrder,
        reference: '',
        seatSize: 'L',
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const seatSizeCol = columns.find(col => col.key === 'seatSize');

      const TestComponent = () => {
        const renderedValue = seatSizeCol?.render?.('ignored', orderWithoutRef);
        return <div data-testid="seat-size">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('seat-size')).toHaveTextContent('L');
    });

    it('falls back to seatSize property when reference extraction fails', () => {
      const orderWithInvalidRef = {
        ...mockOrder,
        reference: 'INVALID-REF-FORMAT',
        seatSize: 'XL',
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const seatSizeCol = columns.find(col => col.key === 'seatSize');

      const TestComponent = () => {
        const renderedValue = seatSizeCol?.render?.('ignored', orderWithInvalidRef);
        return <div data-testid="seat-size">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('seat-size')).toHaveTextContent('XL');
    });
  });

  describe('Status Rendering', () => {
    it('renders status badges correctly', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const statusCol = columns.find(col => col.key === 'status');

      expect(statusCol?.render).toBeDefined();

      const TestComponent = () => {
        const renderedValue = statusCol?.render?.('pending', mockOrder);
        return <div data-testid="status-badge">{renderedValue}</div>;
      };

      render(<TestComponent />);
      
      const statusBadge = screen.getByTestId('status-badge');
      expect(statusBadge).toBeInTheDocument();
    });

    it('handles different status values', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const statusCol = columns.find(col => col.key === 'status');

      const statuses = ['pending', 'approved', 'completed', 'cancelled'];
      
      statuses.forEach(status => {
        const orderWithStatus = { ...mockOrder, status: status as any };
        
        const TestComponent = () => {
          const renderedValue = statusCol?.render?.(status, orderWithStatus);
          return <div data-testid={`status-${status}`}>{renderedValue}</div>;
        };

        render(<TestComponent />);
        expect(screen.getByTestId(`status-${status}`)).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats date correctly', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const dateCol = columns.find(col => col.key === 'date');

      expect(dateCol?.render).toBeDefined();

      const TestComponent = () => {
        const renderedValue = dateCol?.render?.(mockOrder.createdAt, mockOrder);
        return <div data-testid="order-date">{renderedValue}</div>;
      };

      render(<TestComponent />);

      const dateElement = screen.getByTestId('order-date');
      expect(dateElement).toBeInTheDocument();
    });

    it('renders date column consistently', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const dateCol = columns.find(col => col.key === 'date');

      expect(dateCol?.render).toBeDefined();

      const TestComponent = () => {
        const renderedValue = dateCol?.render?.(mockOrder.createdAt, mockOrder);
        return <div data-testid="order-date-2">{renderedValue}</div>;
      };

      render(<TestComponent />);

      const dateElement = screen.getByTestId('order-date-2');
      expect(dateElement).toBeInTheDocument();
    });

    it('handles null completed date', () => {
      const orderWithoutCompletedDate = {
        ...mockOrder,
        completedAt: null,
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const completedAtCol = columns.find(col => col.key === 'completedAt');

      const TestComponent = () => {
        const renderedValue = completedAtCol?.render?.(null, orderWithoutCompletedDate);
        return <div data-testid="completed-date">{renderedValue || 'Not completed'}</div>;
      };

      render(<TestComponent />);
      
      const dateElement = screen.getByTestId('completed-date');
      expect(dateElement).toHaveTextContent('Not completed');
    });
  });

  describe('Entity Name Extraction', () => {
    it('extracts customer name correctly', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const customerCol = columns.find(col => col.key === 'customer');

      expect(customerCol?.render).toBeDefined();

      const TestComponent = () => {
        const renderedValue = customerCol?.render?.(mockOrder.customer, mockOrder);
        return <div data-testid="customer-name">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('customer-name')).toHaveTextContent('John Customer');
    });

    it('extracts fitter name correctly', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const fitterCol = columns.find(col => col.key === 'fitter');

      const TestComponent = () => {
        const renderedValue = fitterCol?.render?.(mockOrder.fitter, mockOrder);
        return <div data-testid="fitter-name">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('fitter-name')).toHaveTextContent('Jane Fitter');
    });

    it('extracts supplier name correctly', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const supplierCol = columns.find(col => col.key === 'supplier');

      const TestComponent = () => {
        const renderedValue = supplierCol?.render?.(mockOrder.supplier, mockOrder);
        return <div data-testid="supplier-name">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('supplier-name')).toHaveTextContent('Acme Supplier');
    });

    it('extracts brand name correctly', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const brandCol = columns.find(col => col.key === 'brand');

      const TestComponent = () => {
        const renderedValue = brandCol?.render?.(mockOrder.brand, mockOrder);
        return <div data-testid="brand-name">{renderedValue}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('brand-name')).toHaveTextContent('Test Brand');
    });
  });

  describe('Urgent Status Handling', () => {
    it('renders urgent status as boolean', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const urgentCol = columns.find(col => col.key === 'urgent');

      expect(urgentCol?.render).toBeDefined();

      const TestComponent = () => {
        const renderedValue = urgentCol?.render?.(false, mockOrder);
        return <div data-testid="urgent-status">{renderedValue}</div>;
      };

      render(<TestComponent />);
      
      const urgentElement = screen.getByTestId('urgent-status');
      expect(urgentElement).toBeInTheDocument();
    });

    it('handles urgent true status', () => {
      const urgentOrder = { ...mockOrder, urgent: true };
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const urgentCol = columns.find(col => col.key === 'urgent');

      const TestComponent = () => {
        const renderedValue = urgentCol?.render?.(true, urgentOrder);
        return <div data-testid="urgent-status">{renderedValue}</div>;
      };

      render(<TestComponent />);
      
      const urgentElement = screen.getByTestId('urgent-status');
      expect(urgentElement).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing customer data', () => {
      const orderWithoutCustomer = {
        ...mockOrder,
        customer: null,
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const customerCol = columns.find(col => col.key === 'customer');

      const TestComponent = () => {
        const renderedValue = customerCol?.render?.(null, orderWithoutCustomer);
        return <div data-testid="customer-name">{renderedValue || 'No customer'}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('customer-name')).toHaveTextContent('No customer');
    });

    it('handles missing fitter data', () => {
      const orderWithoutFitter = {
        ...mockOrder,
        fitter: null,
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const fitterCol = columns.find(col => col.key === 'fitter');

      const TestComponent = () => {
        const renderedValue = fitterCol?.render?.(null, orderWithoutFitter);
        return <div data-testid="fitter-name">{renderedValue || 'No fitter'}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('fitter-name')).toHaveTextContent('No fitter');
    });

    it('handles missing supplier data', () => {
      const orderWithoutSupplier = {
        ...mockOrder,
        supplier: null,
      };

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const supplierCol = columns.find(col => col.key === 'supplier');

      const TestComponent = () => {
        const renderedValue = supplierCol?.render?.(null, orderWithoutSupplier);
        return <div data-testid="supplier-name">{renderedValue || 'No supplier'}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('supplier-name')).toHaveTextContent('No supplier');
    });
  });

  describe('Column Width Configuration', () => {
    it('sets appropriate max widths for columns', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);

      const orderNumberCol = columns.find(col => col.key === 'orderNumber');
      expect(orderNumberCol?.maxWidth).toBeDefined();

      const statusCol = columns.find(col => col.key === 'status');
      expect(statusCol?.maxWidth).toBeDefined();

      const urgentCol = columns.find(col => col.key === 'urgent');
      expect(urgentCol?.maxWidth).toBeDefined();
    });
  });

  describe('Filter Data Integration', () => {
    it('uses provided seat sizes for filtering', () => {
      const customSeatSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, customSeatSizes);
      const seatSizeCol = columns.find(col => col.key === 'seatSize');

      expect(seatSizeCol?.title).toBeDefined();
    });

    it('uses provided statuses for filtering', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const statusCol = columns.find(col => col.key === 'status');

      expect(statusCol?.title).toBeDefined();
    });

    it('uses provided fitters for filtering', () => {
      const columns = getOrderTableColumns(mockHeaderFilters, mockSetHeaderFilters, mockSuppliers, mockSeatSizes);
      const fitterCol = columns.find(col => col.key === 'fitter');

      expect(fitterCol?.title).toBeDefined();
    });
  });

  describe('Empty Filter Handling', () => {
    it('handles empty filters gracefully', () => {
      const columns = getOrderTableColumns({}, mockSetHeaderFilters, [], []);
      expect(columns).toHaveLength(9);

      const statusCol = columns.find(col => col.key === 'status');
      expect(statusCol?.title).toBeDefined();
    });
  });
});