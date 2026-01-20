import { renderHook, act } from '@testing-library/react';
import { useTableFilters } from '@/hooks/useTableFilters';

describe('useTableFilters Hook', () => {
  test('initializes with default empty filters', () => {
    const { result } = renderHook(() => useTableFilters());
    
    expect(result.current.filters).toEqual({});
  });
  
  test('initializes with provided filters', () => {
    const initialFilters = { name: 'John', status: 'Active' };
    const { result } = renderHook(() => useTableFilters(initialFilters));
    
    expect(result.current.filters).toEqual(initialFilters);
  });
  
  test('updates a single filter', () => {
    const { result } = renderHook(() => useTableFilters<Record<string, string>>());
    
    act(() => {
      result.current.updateFilter('name', 'John');
    });
    
    expect(result.current.filters).toEqual({ name: 'John' });
    
    // Update another filter
    act(() => {
      result.current.updateFilter('status', 'Active');
    });
    
    expect(result.current.filters).toEqual({ name: 'John', status: 'Active' });
    
    // Update existing filter
    act(() => {
      result.current.updateFilter('name', 'Jane');
    });
    
    expect(result.current.filters).toEqual({ name: 'Jane', status: 'Active' });
  });
  
  test('clears all filters', () => {
    const initialFilters = { name: 'John', status: 'Active' };
    const { result } = renderHook(() => useTableFilters(initialFilters));
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.filters).toEqual({});
  });
  
  test('updates multiple filters at once', () => {
    const initialFilters = { name: 'John', status: 'Active' };
    const { result } = renderHook(() => useTableFilters<{ name: string; status: string; userRole?: string }>(initialFilters));
    
    act(() => {
      result.current.updateFilters({ status: 'Inactive', userRole: 'Admin' });
    });
    
    expect(result.current.filters).toEqual({
      name: 'John',
      status: 'Inactive',
      userRole: 'Admin'
    });
  });
  
  test('generates filter string for API requests', () => {
    const initialFilters = { name: 'John Doe', status: 'Active', empty: '' };
    const { result } = renderHook(() => useTableFilters(initialFilters));
    
    const filterString = result.current.getFilterString();
    
    // Should encode spaces and exclude empty values
    expect(filterString).toEqual('name=John%20Doe&status=Active');
  });
  
  test('handles empty filters in filter string', () => {
    const { result } = renderHook(() => useTableFilters<Record<string, string>>());
    
    const filterString = result.current.getFilterString();
    
    expect(filterString).toEqual('');
  });
});
