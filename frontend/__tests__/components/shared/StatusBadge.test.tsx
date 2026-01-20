import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/StatusBadge';

describe('StatusBadge Component', () => {
  test('renders with default props', () => {
    render(<StatusBadge status="In Stock" />);
    
    const badge = screen.getByText('In Stock');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });
  
  test('renders with custom label', () => {
    render(<StatusBadge status="In Stock" customLabel="Available" />);
    
    const badge = screen.getByText('Available');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });
  
  test('renders with different sizes', () => {
    const { rerender } = render(<StatusBadge status="In Stock" size="sm" />);
    
    let badge = screen.getByText('In Stock');
    // Check for the presence of size-related classes
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
    
    rerender(<StatusBadge status="In Stock" size="md" />);
    badge = screen.getByText('In Stock');
    // Check for the presence of size-related classes
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('text-xs');
    
    rerender(<StatusBadge status="In Stock" size="lg" />);
    badge = screen.getByText('In Stock');
    // Check for the presence of size-related classes
    expect(badge).toHaveClass('px-4');
    expect(badge).toHaveClass('py-1.5');
    expect(badge).toHaveClass('text-sm');
  });
  
  test('renders with different entity types', () => {
    // Test order-specific status
    const { rerender } = render(<StatusBadge status="Processing" type="order" />);
    let badge = screen.getByText('Processing');
    expect(badge).toBeInTheDocument();
    
    // Test product-specific status
    rerender(<StatusBadge status="Low Stock" type="product" />);
    badge = screen.getByText('Low Stock');
    expect(badge).toBeInTheDocument();
    
    // Test customer-specific status
    rerender(<StatusBadge status="Active" type="customer" />);
    badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    
    // Test fitter-specific status
    rerender(<StatusBadge status="Available" type="fitter" />);
    badge = screen.getByText('Available');
    expect(badge).toBeInTheDocument();
  });
  
  test('renders unknown status with default styling', () => {
    render(<StatusBadge status="Unknown Status" />);
    
    const badge = screen.getByText('Unknown Status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });
});
