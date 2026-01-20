import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for managing pagination state
 * @param itemsPerPage - Number of items per page
 * @param initialPage - Initial page number (default: 1)
 * @returns Pagination state and methods
 */
export function usePagination(itemsPerPage: number = 10, initialPage: number = 1) {
  const [page, setPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  
  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / itemsPerPage)), 
    [totalItems, itemsPerPage]
  );
  
  // Go to a specific page with bounds checking
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);
  
  // Go to next page if available
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);
  
  // Go to previous page if available
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);
  
  // Go to first page
  const firstPage = useCallback(() => {
    setPage(1);
  }, []);
  
  // Go to last page
  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);
  
  // Check if there are more pages
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  // Calculate offset for API calls
  const offset = (page - 1) * itemsPerPage;
  
  return {
    page,
    setPage: goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    totalPages,
    totalItems,
    setTotalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    offset,
    // For compatibility with existing pagination props
    pagination: {
      currentPage: page,
      totalPages,
      onPageChange: goToPage,
      totalItems,
      itemsPerPage,
    }
  };
}
