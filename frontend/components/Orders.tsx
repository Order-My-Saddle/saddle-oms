"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { OrderDetails } from './OrderDetails';
import { EditOrder } from './EditOrder';
import { ComprehensiveEditOrder } from './ComprehensiveEditOrder';
import { EntityTable } from '@/components/shared/EntityTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePagination } from '@/hooks';
// orderHydration utilities used by orderTableColumns and orderProcessing
import { getOrderTableColumns } from '../utils/orderTableColumns';
// orderConstants used by sub-components
import {
  buildOrderFilters,
  extractDynamicSeatSizes,
  extractDynamicFactories,
  processOrdersTableData,
  fetchCompleteOrderData,
} from '../utils/orderProcessing';
import { getEnrichedOrders } from '@/services/enrichedOrders';
import { logger } from '@/utils/logger';

// Base order interface that matches the API response
export interface Order {
  id: number;
  orderId: number;
  reference: string;
  seatSize: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any;
  orderStatus: string;
  status?: string;
  urgent: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fitter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supplier: any;
  orderTime: string;
  createdAt: string;
  seatSizes?: string[];
  name?: string;
  isUrgent?: boolean;
}

// OrderTableRow type is now imported from shared utilities

export default function Orders() {
  // State for dialogs
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Adding a state indicator for when order ID search is being processed
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingOrderData, setIsLoadingOrderData] = useState(false);
  const [orderDataError, setOrderDataError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [useComprehensiveEdit, setUseComprehensiveEdit] = useState(true); // Toggle for new comprehensive editor
  

  // Use the same filter approach as Dashboard/Reports for consistency
  const [headerFilters, setHeaderFilters] = useState<Record<string, string>>({});
  const { 
    page, 
    setPage, 
    pagination, 
    setTotalItems 
  } = usePagination(30, 1);
  
  // Handle search input change with debounce
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to update filters after user stops typing
    const timeout = setTimeout(() => {
      if (term.trim() === '') {
        // If search is cleared, remove the orderId and searchTerm filters
        setIsSearching(false);
        setSearchMessage("");
        setHeaderFilters(prev => ({ ...prev, orderId: '', searchTerm: '' }));
      } else if (/^\d+$/.test(term.trim())) {
        // If the search term is a number, search by order ID
        const exactOrderId = term.trim();
        logger.log('Searching for exact order ID:', exactOrderId);
        setIsSearching(true);
        setSearchMessage(`Searching for order ID: ${exactOrderId}...`);
        setHeaderFilters(prev => ({ ...prev, orderId: exactOrderId, searchTerm: '' }));
      } else {
        // If the search term is text, search across multiple fields (customer, factory, fitter, brand, etc.)
        const searchValue = term.trim();
        logger.log('Searching for:', searchValue);
        setIsSearching(true);
        setSearchMessage(`Searching for: "${searchValue}"...`);
        setHeaderFilters(prev => ({ ...prev, orderId: '', searchTerm: searchValue }));
      }
      // Reset to first page when searching
      setPage(1);
    }, 500);
    
    setSearchTimeout(timeout);
  }, [setPage, searchTimeout, setIsSearching, setSearchMessage]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // State for date picker
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });


  // Fetch orders
  const fetchAndSetOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build comprehensive filters from headerFilters using shared utility
      const filters = buildOrderFilters(headerFilters);
      
      // Check if we're searching for a specific orderId or using general search term
      const isSearchingForOrderId = filters.orderId && /^\d+$/.test(filters.orderId);
      const isSearchingWithSearchTerm = filters.searchTerm && filters.searchTerm.length > 0;
      
      // Instead of sorting by ID, sort by orderId which is more meaningful to users
      // Get orders with server-side sorting by orderId in descending order
      const data = await getEnrichedOrders({
        page,
        partial: false,
        filters,
        orderBy: 'orderId',  // Sort by orderId instead of id
        order: 'desc',
      });
      
      const apiOrders = data['hydra:member'] || [];
      
      // Client-side sorting as a fallback for orderId if server-side sort isn't working
      if (apiOrders.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiOrders.sort((a: any, b: any) => {
          const orderIdA = Number(a.orderId);
          const orderIdB = Number(b.orderId);
          if (!isNaN(orderIdA) && !isNaN(orderIdB)) {
            return orderIdB - orderIdA; // Descending order by orderId
          }
          return String(b.orderId || '').localeCompare(String(a.orderId || ''));
        });
      }
      
      setOrders(apiOrders);
      setTotalItems(data['hydra:totalItems'] || apiOrders.length || 0);
      
      // Update search messages based on results
      if (isSearchingForOrderId) {
        if (apiOrders.length === 0) {
          setSearchMessage(`No orders found with ID: ${filters.orderId}`);
        } else if (apiOrders.length === 1) {
          setSearchMessage(`Found order with ID: ${filters.orderId}`);
          // Automatically clear the message after 3 seconds
          setTimeout(() => setSearchMessage(''), 3000);
        } else {
          setSearchMessage(`Found ${apiOrders.length} orders matching search criteria`);
          // Automatically clear the message after 3 seconds
          setTimeout(() => setSearchMessage(''), 3000);
        }
      } else if (isSearchingWithSearchTerm) {
        if (apiOrders.length === 0) {
          setSearchMessage(`No orders found for: "${filters.searchTerm}"`);
        } else {
          setSearchMessage(`Found ${apiOrders.length} order${apiOrders.length === 1 ? '' : 's'} for: "${filters.searchTerm}"`);
          // Automatically clear the message after 3 seconds
          setTimeout(() => setSearchMessage(''), 3000);
        }
      } else {
        // Clear search message if not searching
        setSearchMessage('');
      }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
      setTotalItems(0);
      if (headerFilters.orderId) {
        setSearchMessage(`Error searching for order: ${err.message || 'Unknown error'}`);
      } else if (headerFilters.searchTerm) {
        setSearchMessage(`Error searching: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [page, headerFilters, setTotalItems]);

  // Fetch on mount and filter/page change
  useEffect(() => {
    fetchAndSetOrders();
  }, [fetchAndSetOrders]);

  // Interval refresh (5 min)
  useEffect(() => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(() => {
      fetchAndSetOrders();
    }, 300000); // 5 min
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [fetchAndSetOrders]);

  // Process orders for the table using shared utility
  const processedOrders = processOrdersTableData(orders || []);
  
  // Extract unique seat sizes from orders using shared utility
  const dynamicSeatSizes = React.useMemo(() => {
    return extractDynamicSeatSizes(orders);
  }, [orders]);

  // Extract unique factory names from orders for filter dropdown
  const dynamicFactories = React.useMemo(() => {
    return extractDynamicFactories(orders);
  }, [orders]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    // Update headerFilters same as Dashboard/Reports
    setHeaderFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 when filters change
  };

  // Use shared fetchCompleteOrderData utility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const fetchCompleteOrderDataWrapper = async (order: any): Promise<any> => {
    return fetchCompleteOrderData(order, setIsLoadingOrderData, setOrderDataError);
  };

  // Handle view order details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    logger.log('Edit order:', order);
    // Just set the basic order info - comprehensive editor will fetch full data
    setSelectedOrder(order);
    setIsEditOpen(true);
  };

  // Handle approve order
  const handleApproveOrder = (order: Order) => {
    logger.log('Approve order', order);
    // Implement approve logic
  };

  // Handle delete order
  const handleDeleteOrder = (order: Order) => {
    logger.log('Delete order', order);
    // Implement delete logic
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage and track all orders"
        actions={[
          // Reset All Filters Button (show only if filters are active)
          ...(Object.keys(headerFilters).some(key => headerFilters[key] && headerFilters[key] !== '') ? [
            <button 
              key="reset-filters"
              onClick={() => {
                logger.log('Resetting all Orders filters');
                // Reset all filters
                setHeaderFilters({});
                setPage(1);
                setSearchTerm('');
                setSearchMessage('');
              }}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reset Filters
            </button>
          ] : []),
          <button 
            key="create-order" 
            onClick={() => {
              setSelectedOrder(null); // Clear selected order to indicate creation mode
              setIsEditOpen(true);
            }}
className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </button>,
        ]}
      />
      
      {/* Search message display */}
      {searchMessage && (
        <div className={`p-2 rounded-md ${isSearching ? 'bg-blue-50 text-blue-700' : searchMessage.includes('No orders found') ? 'bg-yellow-50 text-yellow-700' : searchMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="text-sm font-medium flex items-center">
            {isSearching ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {searchMessage}
          </p>
        </div>
      )}
      
      
      <div className="space-y-4">
        <EntityTable
          entities={processedOrders}
          columns={getOrderTableColumns(headerFilters, handleFilterChange, dynamicFactories, dynamicSeatSizes)}
          onView={handleViewDetails}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onApprove={handleApproveOrder}
          entityType="order"
          searchTerm={searchTerm}
          onSearch={handleSearch}
          pagination={{
            currentPage: page,
            totalPages: pagination.totalPages,
            onPageChange: setPage,
            totalItems: pagination.totalItems,
            itemsPerPage: pagination.itemsPerPage,
          }}
          loading={loading || isSearching}
          error={error}
          actionButtons={{
            view: true,
            edit: true,
            delete: true,
            approve: true
          }}
        />
      </div>

      {/* Order details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        {selectedOrder && (
          <OrderDetails
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            order={selectedOrder as any}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </Dialog>

      {/* Edit order dialog */}
      <Dialog open={isEditOpen} onOpenChange={() => {
        setIsEditOpen(false);
        setOrderDataError(null);
      }}>
        {selectedOrder ? (
          useComprehensiveEdit ? (
            <ComprehensiveEditOrder
              order={{
                id: selectedOrder.id,
                orderId: Number(selectedOrder.orderId || selectedOrder.id)
              }}
              onClose={() => {
                setIsEditOpen(false);
                setOrderDataError(null);
                // Refresh orders list after creation/update
                fetchAndSetOrders();
              }}
            />
          ) : (
            <EditOrder
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              order={selectedOrder as any}
              initialData={selectedOrder}
              isLoading={isLoadingOrderData}
              error={orderDataError}
              onClose={() => {
                setIsEditOpen(false);
                setOrderDataError(null);
                // Refresh orders list after creation/update
                fetchAndSetOrders();
              }}
            />
          )
        ) : (
          // Creation mode - no order selected
          <EditOrder 
            order={undefined}
            initialData={undefined}
            isLoading={false}
            error={null}
            onClose={() => {
              setIsEditOpen(false);
              setOrderDataError(null);
              // Refresh orders list after creation/update
              fetchAndSetOrders();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}