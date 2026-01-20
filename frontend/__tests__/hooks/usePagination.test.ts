import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination Hook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => usePagination());
    
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.totalPages).toBe(1);
    expect(result.current.pagination.itemsPerPage).toBe(10);
    expect(result.current.pagination.totalItems).toBe(0);
  });
  
  test('initializes with custom values', () => {
    const { result } = renderHook(() => usePagination(20, 2));
    
    expect(result.current.pagination.currentPage).toBe(2);
    expect(result.current.pagination.itemsPerPage).toBe(20);
  });
  
  test('calculates total pages correctly', () => {
    const { result } = renderHook(() => usePagination(10));
    
    // Set total items
    act(() => {
      result.current.setTotalItems(25);
    });
    
    // Should have 3 pages (25 items with 10 per page)
    expect(result.current.pagination.totalPages).toBe(3);
    expect(result.current.pagination.totalItems).toBe(25);
  });
  
  test('handles navigation to specific page', () => {
    const { result } = renderHook(() => usePagination(10));
    
    // Set total items to have multiple pages
    act(() => {
      result.current.setTotalItems(30);
    });
    
    // Go to page 2
    act(() => {
      result.current.setPage(2);
    });
    
    expect(result.current.pagination.currentPage).toBe(2);
    
    // Go to page 3
    act(() => {
      result.current.setPage(3);
    });
    
    expect(result.current.pagination.currentPage).toBe(3);
  });
  
  test('prevents navigation beyond page boundaries', () => {
    const { result } = renderHook(() => usePagination(10));
    
    // Set total items to have 3 pages
    act(() => {
      result.current.setTotalItems(30);
    });
    
    // Try to go to page 0 (should stay at 1)
    act(() => {
      result.current.setPage(0);
    });
    
    // The hook should clamp the value to valid range
    expect(result.current.pagination.currentPage).toBe(1);
    
    // Try to go to page 5 (should stay at 3)
    act(() => {
      result.current.setPage(5);
    });
    
    // The hook should clamp the value to valid range
    expect(result.current.pagination.currentPage).toBe(3);
  });
  
  test('handles next page navigation', () => {
    const { result } = renderHook(() => usePagination(10));
    
    // Set total items to have 3 pages
    act(() => {
      result.current.setTotalItems(30);
    });
    
    // Go to next page (from 1 to 2)
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(2);
    
    // Go to next page again (from 2 to 3)
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(3);
    
    // Try to go beyond last page (should stay at 3)
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(3);
  });
  
  test('handles previous page navigation', () => {
    const { result } = renderHook(() => usePagination(10, 3));
    
    // Set total items to have 3 pages
    act(() => {
      result.current.setTotalItems(30);
    });
    
    // Go to previous page (from 3 to 2)
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(2);
    
    // Go to previous page again (from 2 to 1)
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(1);
    
    // Try to go before first page (should stay at 1)
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(1);
  });
  
  test('calculates offset correctly', () => {
    // Use a fresh render for each check to avoid state issues
    const { result: result1 } = renderHook(() => usePagination(10, 1));
    expect(result1.current.offset).toBe(0);
    
    // Check page 2
    const { result: result2 } = renderHook(() => usePagination(10, 2));
    expect(result2.current.offset).toBe(10);
    
    // Check page 3
    const { result: result3 } = renderHook(() => usePagination(10, 3));
    expect(result3.current.offset).toBe(20);
  });
  
  test('provides pagination info for UI', () => {
    const { result } = renderHook(() => usePagination(10, 2));
    
    // Set total items
    act(() => {
      result.current.setTotalItems(25);
    });
    
    // Check pagination object properties
    const { pagination } = result.current;
    expect(pagination.currentPage).toBe(2);
    expect(pagination.totalPages).toBe(3);
    expect(pagination.totalItems).toBe(25);
    expect(pagination.itemsPerPage).toBe(10);
  });
  
  test('handles first and last page navigation', () => {
    const { result } = renderHook(() => usePagination(10, 2));
    
    // Set total items to have 5 pages
    act(() => {
      result.current.setTotalItems(50);
    });
    
    // Go to first page
    act(() => {
      result.current.firstPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(1);
    
    // Go to last page
    act(() => {
      result.current.lastPage();
    });
    
    expect(result.current.pagination.currentPage).toBe(5);
  });
});
